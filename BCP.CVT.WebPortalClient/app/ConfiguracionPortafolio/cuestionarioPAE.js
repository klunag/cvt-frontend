var $tbl1 = $("#tbl1");
var $tbl2 = $("#tbl2");

var DATA_EXPORTAR = {};

const URL_API_VISTA = URL_API + "/Aplicacion/ConfiguracionPortafolio";
const TITULO_MENSAJE = "Cuestionario PAE";
//const ENTIDAD_MANTENIMIENTO = { AreaBian: 1, DominioBian: 2, TAI: 3, Gerencia: 4, Division: 5, Area: 6, Unidad: 7, CuestionarioPae: 8, PreguntaPae: 9 };
const TREE_NIVEL = { Uno: 1, Dos: 2, Tres: 3, Cuatro: 4 };
const TABLE_NIVELES = [
    {
        Table: $tbl1,
        UrlListado: "ListarCuestionarioPae",
        UrlGetById: "GetCuestionarioPaeById",
        UrlAddOrEdit: "AddOrEditCuestionarioPae",
        UrlCambiarEstado: "CambiarEstadoCuestionarioPae",
        Mantenimiento: ENTIDAD_MANTENIMIENTO.CuestionarioPae,
        TitleModal: "Sección PAE",
        Nivel: TREE_NIVEL.Uno
    },
    {
        Table: $tbl2,
        UrlListado: "ListarPreguntaPae",
        UrlGetById: "GetPreguntaPaeById",
        UrlAddOrEdit: "AddOrEditPreguntaPae",
        UrlCambiarEstado: "CambiarEstadoPreguntaPae",
        Mantenimiento: ENTIDAD_MANTENIMIENTO.PreguntaPae,
        TitleModal: "Pregunta PAE",
        Nivel: TREE_NIVEL.Dos
    }
];

$(function () {
    $("#btnRegistrar").click(GuardarAll);
    validarFormRegistro();
    listarInit();
});

function listarInit() {
    let item = TABLE_NIVELES.find(x => x.Nivel === TREE_NIVEL.Uno) || null;
    if (item !== null) listarRegistros(item);
}

function listarRegistros(item, id = null) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    item.Table.bootstrapTable('destroy');
    item.Table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/" + item.UrlListado,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.id = id === null ? 0 : id;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.Activos = false;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
            waitingDialog.hide();
            bootbox.alert("Se produjo un error al listar los registros");
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onLoadSuccess: function (data) {
            item.Table.bootstrapTable('hideColumn', 'Id');
            $(`#button${item.Nivel}`).text("Mostrar acciones");
            let $parent = item.Table.closest("div.bootstrap-table").parent();
            $parent.show();
            $parent.nextAll().hide();
        }
    });
}

function AddRegistro(mantenimientoId) {
    $("#hdMantenimientoId").val(mantenimientoId);
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === mantenimientoId) || null;
    if (item !== null) {
        $("#title-form").html(String.Format("Nueva {0}", item.TitleModal));
        let dataItem = item.Table.bootstrapTable('getData') || [];
        if (dataItem.length > 0) {
            let entidadRelacionId = dataItem[0].EntidadRelacionId;
            $("#hdEntidadRelacionId").val(entidadRelacionId);
        } else {
            let nivelPadre = item.Nivel - 1;
            if (nivelPadre > 0) {
                let itemPadre = TABLE_NIVELES.find(x => x.Nivel === nivelPadre) || null;
                if (itemPadre !== null) {
                    let dataItemPadre = itemPadre.Table.bootstrapTable('getData').filter(x => x.IsSelected === true) || [];
                    if (dataItemPadre.length > 0) {
                        let entidadRelacionId = dataItemPadre[0].Id;
                        $("#hdEntidadRelacionId").val(entidadRelacionId);
                    }
                }
            }
        }
    }
    limpiarModal();
    OpenCloseModal($("#mdAddOrEditRegistro"), true);
}

function limpiarModal() {
    LimpiarValidateErrores($("#formAddOrEditRegistro"));
    $(":input", "#formAddOrEditRegistro").val("");
}

function validarFormRegistro() {
    $("#formAddOrEditRegistro").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombre: {
                requiredSinEspacios: true
            },
            txtDescripcion: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtNombre: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtDescripcion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDistribuida" || element.attr('name') === "txtMainframe"
                || element.attr('name') === "txtPaqueteSaas" || element.attr('name') === "txtUserItMacro"
                || element.attr('name') === "txtUserItWeb" || element.attr('name') === "txtUserItCliente") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function GuardarAll() {
    let entidad_mant = parseInt($("#hdMantenimientoId").val());
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === entidad_mant) || null;
    if (item !== null) {
        GuardarRegistro(item);
    }
}

function GuardarRegistro(item) {
    if ($("#formAddOrEditRegistro").valid()) {
        $("#btnRegistrar").button("loading");
        let entidadRelacionId = $("#hdEntidadRelacionId").val() !== "" ? parseInt($("#hdEntidadRelacionId").val()) : 0;

        let entidad = {
            Id: ($("#hdRegistroId").val() === "") ? 0 : parseInt($("#hdRegistroId").val()),
            EntidadRelacionId: entidadRelacionId,
            Nombre: $.trim($("#txtNombre").val()),
            Descripcion: $.trim($("#txtDescripcion").val()),
        };

        $.ajax({
            url: URL_API_VISTA + "/" + item.UrlAddOrEdit,
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(entidad),
            dataType: "json",
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                listarRegistros(item, entidadRelacionId);
            },
            complete: function () {
                $("#btnRegistrar").button("reset");
                OpenCloseModal($("#mdAddOrEditRegistro"), false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function nombreFormatter(value, row, index) {
    let rowLastLevel = row.IsLastLevel || false;
    let opc1 = opc2 = "";
    if (row.Activo) {
        opc1 = `<a href="javascript:editarRegistroAll(${row.Id}, ${row.MantenimientoId})" title="Editar">${value}</a>`;
        opc2 = !rowLastLevel ? `<a href="javascript:listarChildren(${row.Id}, ${row.Nivel})" title="Ver entidades"><i class="glyphicon glyphicon-chevron-right"></i></a>` : '';
    } else {
        opc1 = value;
    }

    return opc1.concat("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", opc2);
}

function cellStyle(value, row, index) {
    if (row.IsSelected) {
        return {
            classes: "fondoAzul"
        };
    }

    return {
        classes: ""
    };
}

function listarChildren(id, nivel) {
    let nivelChild = nivel + 1;

    //Setup Parent
    let parent = TABLE_NIVELES.find(x => x.Nivel === nivel) || null;
    if (parent !== null) {
        let dataParent = parent.Table.bootstrapTable('getData');
        let itemSelected = dataParent.find(x => x.IsSelected === true) || null;
        if (itemSelected !== null) {
            parent.Table.bootstrapTable('updateByUniqueId', {
                id: itemSelected.Id,
                row: {
                    IsSelected: false
                }
            });
        }

        parent.Table.bootstrapTable('updateByUniqueId', {
            id: id,
            row: {
                IsSelected: true
            }
        });
    }

    //Setup Child
    let child = TABLE_NIVELES.find(x => x.Nivel === nivelChild) || null;
    if (child !== null) {
        $("#hdEntidadRelacionId").val(id);
        listarRegistros(child, id);
    }
}

function editarRegistroAll(id, mantenimientoId) {
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === mantenimientoId) || null;
    if (item !== null) {
        $("#hdMantenimientoId").val(mantenimientoId);
        editarRegistro(id, item.UrlGetById, item.TitleModal);
    }
}

function editarRegistro(id, urlGet, title) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#title-form").html(String.Format("Editar {0}", title));
    $.ajax({
        url: URL_API_VISTA + `/${urlGet}?id=${id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;
                    limpiarModal();
                    OpenCloseModal($("#mdAddOrEditRegistro"), true);

                    $("#hdRegistroId").val(data.Id);
                    $("#txtNombre").val(data.Nombre);
                    $("#txtDescripcion").val(data.Descripcion);
                    $("#hdEntidadRelacionId").val(data.EntidadRelacionId);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function showHideActions(mantenimientoId) {
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === mantenimientoId) || null;
    if (item !== null) {
        let textButton = $(`#button${item.Nivel}`).text();
        let action = textButton === "Mostrar acciones" ? "showColumn" : "hideColumn";
        item.Table.bootstrapTable(action, 'Id');
        $(`#button${item.Nivel}`).text(textButton === "Mostrar acciones" ? "Ocultar acciones" : "Mostrar acciones");
    }
}

function cogFormatter(value, row, index) {
    //let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo";
    //let type_icon = row.Activo ? "check" : "unchecked";
    //let btnEstado = `<a href="javascript:CambiarEstadoAll(${row.Id}, ${row.Activo}, ${row.MantenimientoId}, ${row.EntidadRelacionId})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    //let btnEliminar = `<a href="javascript:EliminarRegistroAll(${row.Id}, ${row.MantenimientoId}, ${row.EntidadRelacionId})" title="Eliminar registro"><i class="${style_color} glyphicon glyphicon-trash"></i></a>`;

    //return btnEstado.concat("&nbsp;&nbsp;", btnEliminar);
    return "";
}

function EliminarRegistroAll(id, mantenimientoId, entidadRelacionId) {
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === mantenimientoId) || null;
    if (item !== null) {
        EliminarRegistro(id, item, entidadRelacionId);
    }
}

function EliminarRegistro(id, item, _entidadRelacionId) {
    let entidadRelacionId = _entidadRelacionId || null;

    let MENSAJE_VIEW = "¿Estás seguro(a) que deseas eliminar el registro seleccionado?";
    let dataRetorno = ExisteRelacionPortafolio(id, item.Mantenimiento, entidadRelacionId);
    let MENSAJE = `${dataRetorno.MensajeAPI}, ${MENSAJE_VIEW}.`;

    if (dataRetorno.FlagSeEjecuta) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/EliminarRegistroByConfiguracion?id=${id}&idConfiguracion=${item.Mantenimiento}`,
                        type: "GET",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    waitingDialog.hide();
                                    toastr.success("Se eliminó el registro correctamente", TITULO_MENSAJE);
                                    listarRegistros(item, entidadRelacionId);
                                }
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
            }
        });
    } else {
        MENSAJE = `${dataRetorno.MensajeAPI}. No es posible eliminar`;
        MensajeGeneralAlert(TITULO_MENSAJE, MENSAJE);
    }
}

function CambiarEstadoAll(id, estadoActual, mantenimientoId, entidadRelacionId) {
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === mantenimientoId) || null;
    if (item !== null) {
        CambiarEstadoRegistro(id, estadoActual, item, entidadRelacionId);
    }
}

function CambiarEstadoRegistro(id, estadoActual, item, _entidadRelacionId) {
    let entidadRelacionId = _entidadRelacionId || null;
    let msjOpcion = estadoActual ? "desactivar" : "activar";
    //let procesar = false;

    let MENSAJE_VIEW = `¿Estás seguro(a) que deseas ${msjOpcion} el registro seleccionado?`;
    let dataRetorno = ExisteRelacionPortafolio(id, item.Mantenimiento, entidadRelacionId);
    let MENSAJE = `${dataRetorno.MensajeAPI}, ${MENSAJE_VIEW}.`;

    //if (estadoActual) {
    //    let validarDependencia = ExisteRelacionPortafolio(id, item.Mantenimiento);
    //    if (validarDependencia)
    //        MensajeGeneralAlert(TITULO_MENSAJE, "No es posible desactivar el registro porque esta relacionado con aplicaciones registradas");
    //    else
    //        procesar = true;
    //}
    //else
    //    procesar = true;

    if (dataRetorno.FlagSeEjecuta) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/${item.UrlCambiarEstado}?id=${id}&estadoActual=${estadoActual}`,
                        type: "GET",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    waitingDialog.hide();
                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    listarRegistros(item, entidadRelacionId);
                                }
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
            }        
        });
    } else {
        MENSAJE = `${dataRetorno.MensajeAPI}. No es posible cambiar el estado`;
        MensajeGeneralAlert(TITULO_MENSAJE, MENSAJE);
    }
}