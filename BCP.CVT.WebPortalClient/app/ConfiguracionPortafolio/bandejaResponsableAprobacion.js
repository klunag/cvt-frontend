var $tbl1 = $("#tbl1");
var $tbl2 = $("#tbl2");
var DATA_EXPORTAR = {};
var DATOS_RESPONSABLE = {};

const URL_API_VISTA = URL_API + "/Aplicacion/ConfiguracionPortafolio";
const TITULO_MENSAJE = "Responsables de aprobación";
const BANDEJA_APROBACION = { ArquitecturaTI: 1, ClasificacionTecnica: 2, DevSecOpc: 3 };
const TREE_NIVEL = { Uno: 1, Dos: 2, Tres: 3, Cuatro: 4 };
const VALIDACION_MATRICULA = { PENDIENTE: 0, OK: 1 };
const ENTIDAD_MANTENIMIENTO = {
    AreaBian: 1,
    DominioBian: 2,
    TAI: 3,
    Gerencia: 4,
    Division: 5,
    Area: 6,
    Unidad: 7,
    CuestionarioPae: 8,
    PreguntaPae: 9,
    Bandeja: 10,
    BandejaAprobacion: 11,
    RolesGestion: 20
};
const TABLE_NIVELES = [
    {
        Table: $tbl1,
        UrlListado: "ListarBandeja",
        UrlGetById: "GetBandejaById",
        UrlAddOrEdit: "AddOrEditBandeja",
        Mantenimiento: ENTIDAD_MANTENIMIENTO.Bandeja,
        TitleModal: "Bandeja",
        classField: "bandejaField",
        Nivel: TREE_NIVEL.Uno
    },
    {
        Table: $tbl2,
        UrlListado: "ListarBandejaAprobacion",
        UrlGetById: "GetBandejaAprobacionById",
        UrlAddOrEdit: "AddOrEditBandejaAprobacion",
        UrlCambiarEstado: "CambiarEstadoBandejaAprobacion",
        Mantenimiento: ENTIDAD_MANTENIMIENTO.BandejaAprobacion,
        TitleModal: "Responsable aprobador",
        classField: "bandejaAprobacionField",
        Nivel: TREE_NIVEL.Dos
    }
];

$(function () {
    $("#btnRegistrar").click(GuardarAll);
    $("#btnValidarMatricula").click(ValidarMatriculaAll);
    EnableDisableButtonByInput($("#txtMatricula"), $("#btnValidarMatricula"));
    validarFormRegistro();
    listarInit();
});

function listarInit() {
    let item = TABLE_NIVELES.find(x => x.Nivel === TREE_NIVEL.Uno) || null;
    if (item !== null) listarRegistros(item);
}

function showHideActions(mantenimientoId) {
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === mantenimientoId) || null;
    if (item !== null) {
        let level = mantenimientoId === ENTIDAD_MANTENIMIENTO.PlataformaBcp ? item.Nivel + 1 : item.Nivel;
        let textButton = $(`#button${level}`).text();
        let action = textButton === "Mostrar acciones" ? "showColumn" : "hideColumn";
        item.Table.bootstrapTable(action, 'Id');
        $(`#button${level}`).text(textButton === "Mostrar acciones" ? "Ocultar acciones" : "Mostrar acciones");
    }
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
            if (item.Nivel !== TREE_NIVEL.Uno) {
                item.Table.bootstrapTable('hideColumn', 'Id');
                $(`#button${item.Nivel}`).text("Mostrar acciones");
            }

            let $parent = item.Table.closest("div.bootstrap-table").parent();
            $parent.show();
            $parent.nextAll().hide();
        }
    });
}

function setBuilderModal(item) {
    $(".all").addClass("ignore");
    $(".all").hide();
    $(`.${item.classField}`).show();
    $(`.${item.classField}`).removeClass("ignore");

    //condicionales
    if (item.Mantenimiento === ENTIDAD_MANTENIMIENTO.Bandeja) {
        $("#txtNombre").attr("disabled", "disabled");
    }

    if (item.Mantenimiento === ENTIDAD_MANTENIMIENTO.BandejaAprobacion) {
        let bandejaId = parseInt($("#hdEntidadRelacionId").val());
        if (bandejaId === BANDEJA_APROBACION.ArquitecturaTI) {
            $(".modal-body").addClass("bloq-element");
            $(".modal-footer").addClass("bloq-element");
        } else {
            $(".modal-body").removeClass("bloq-element");
            $(".modal-footer").removeClass("bloq-element");
        }
    } else {
        $(".modal-body").removeClass("bloq-element");
        $(".modal-footer").removeClass("bloq-element");
    }
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
        }
        setBuilderModal(item);
    }

    //Condicional
    let bandejaId = parseInt($("#hdEntidadRelacionId").val());
    if (bandejaId !== BANDEJA_APROBACION.ArquitecturaTI) {
        limpiarModal();
        OpenCloseModal($("#mdAddOrEditRegistro"), true);
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, "No es posible agregar un responsable a esta bandeja desde esta vista");
    }
}

function limpiarModal() {
    LimpiarValidateErrores($("#formAddOrEditRegistro"));
    $(":input", "#formAddOrEditRegistro").val("");
    initIconButton();
}

function validarFormRegistro() {
    $.validator.addMethod("existeMatriculaEnBandeja", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteMatriculaEnBandeja(valor);
            return estado;
        }
        return estado;
    });

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
            },
            txtMatricula: {
                requiredSinEspacios: true,
                existeMatriculaEnBandeja: true
            },
            txtCorreo: {
                requiredSinEspacios: true,
                email: true
            },
            txtNombreAprob: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtNombre: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtDescripcion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
            txtMatricula: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la matrícula"),
                existeMatriculaEnBandeja: "La matrícula ya esta registrada en esta bandeja"
            },
            txtCorreo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el correo"),
                email: "Debes ingresar un correo correcto"
            },
            txtNombreAprob: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtMatricula" || element.attr('name') === "txtMainframe"
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
        let _flagValidarMatricula = parseInt($("#hdFlagValidarMatricula").val()) === VALIDACION_MATRICULA.OK;

        let entidad = {
            Id: ($("#hdRegistroId").val() === "") ? 0 : parseInt($("#hdRegistroId").val()),
            EntidadRelacionId: entidadRelacionId,
            Nombre: $.trim($("#txtNombre").val()) || "",
            Descripcion: $.trim($("#txtDescripcion").val()) || "",
            MatriculaAprobador: $.trim($("#txtMatricula").val()) || "",
            Correo: $.trim($("#txtCorreo").val()) || "",
            Nombres: $.trim($("#txtNombreAprob").val()) || "",
            FlagValidarMatricula: _flagValidarMatricula,
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

//TODO
function nombreFormatter(value, row, index) {
    let validarMatricula = row.FlagValidarMatricula || false;
    let rowLastLevel = row.IsLastLevel || false;
    let formatterValue = row.MantenimientoId === ENTIDAD_MANTENIMIENTO.BandejaAprobacion ? validarMatricula ? `${value} - ${row.Correo}` : `${row.MatriculaAprobador} [Pendiente validación]` : value;
    let opc1 = opc2 = "";
    if (row.Activo) {
        opc1 = `<a href="javascript:editarRegistroAll(${row.Id}, ${row.MantenimientoId})" title="Editar">${formatterValue}</a>`;
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
        editarRegistro(id, item);
    }
}

function editarRegistro(id, item) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#title-form").html(String.Format("Editar {0}", item.TitleModal));
    $.ajax({
        url: URL_API_VISTA + `/${item.UrlGetById}?id=${id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;
                    limpiarModal();

                    $("#hdRegistroId").val(data.Id);
                    $("#txtNombre").val(data.Nombre || "");
                    $("#txtDescripcion").val(data.Descripcion || "");
                    $("#txtMatricula").val(data.MatriculaAprobador || "");
                    $("#hdEntidadRelacionId").val(data.EntidadRelacionId);

                    $("#txtCorreo").val(data.Correo || "");
                    $("#txtNombreAprob").val(data.Nombres || "");
                    $("#hdFlagValidarMatricula").val(data.FlagValidarMatricula || "0");

                    setBuilderModal(item);
                    OpenCloseModal($("#mdAddOrEditRegistro"), true);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function ExisteMatriculaEnBandeja(_matricula) {
    let estado = true;
    let _id = $("#hdRegistroId").val() === "" ? 0 : $("#hdRegistroId").val();
    let _bandejaId = $("#hdEntidadRelacionId").val();

    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteMatriculaEnBandeja?filtro=${_matricula}&bandejaId=${_bandejaId}&id=${_id}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    estado = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return estado;
}

function ValidarMatriculaAll() {
    let responsable = $.trim($("#txtMatricula").val());
    if (ExisteMatricula(responsable)) {
        RegistrarMatricula(DATOS_RESPONSABLE);
        $("#txtCorreo").val(DATOS_RESPONSABLE.Correo);
        $("#txtNombreAprob").val(DATOS_RESPONSABLE.Nombres);
        $("#spIconButton").removeClass();
        $("#spIconButton").addClass("glyphicon glyphicon-ok-sign");
        $("#hdFlagValidarMatricula").val(VALIDACION_MATRICULA.OK);
    } else {
        $("#hdFlagValidarMatricula").val(VALIDACION_MATRICULA.PENDIENTE);
        toastr.error("No se puedo validar la matrícula", TITULO_MENSAJE);
    }
}

function initIconButton() {
    $("#spIconButton").removeClass();
    $("#spIconButton").addClass("glyphicon glyphicon-question-sign");
    $("#btnValidarMatricula").prop('disabled', true);
}

function ExisteMatricula(Matricula) {
    let estado = false;
    let matricula = Matricula;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_LOGIN_SERVER + `/ObtenerDatosUsuario?Matricula=${matricula}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    DATOS_RESPONSABLE = dataObject;
                    let EstadoUser = dataObject.Estado;
                    estado = EstadoUser !== 1 ? false : true;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return estado;
}

function EnableDisableButtonByInput($textBox, $btn) {
    $textBox.keyup(function () {
        let flagActivo = $.trim($(this).val()) !== "" ? true : false;
        $btn.prop('disabled', !flagActivo);
    });
}

function cogFormatter(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo";
    let type_icon = row.Activo ? "check" : "unchecked";
    let btnEstado = `<a href="javascript:CambiarEstadoAll(${row.Id}, ${row.Activo}, ${row.MantenimientoId}, ${row.EntidadRelacionId})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    let btnEliminar = `<a href="javascript:EliminarRegistroAll(${row.Id}, ${row.MantenimientoId}, ${row.EntidadRelacionId})" title="Eliminar registro"><i class="${style_color} glyphicon glyphicon-trash"></i></a>`;

    return btnEstado.concat("&nbsp;&nbsp;", btnEliminar);
}

function CambiarEstadoAll(id, estadoActual, mantenimientoId, entidadRelacionId) {
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === mantenimientoId) || null;
    if (item !== null) {
        CambiarEstadoRegistro(id, estadoActual, item, entidadRelacionId);
    }
}

function CambiarEstadoRegistro(id, estadoActual, item, _entidadRelacionId) {
    let entidadRelacionId = _entidadRelacionId || null;
    let mensaje = estadoActual ? "desactivar" : "activar";
    let validarDependencia = false; //ExisteRelacionPortafolio(id, item.Mantenimiento);
    if (!validarDependencia) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: `¿Estás seguro(a) que deseas ${mensaje} el registro seleccionado?`,
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
        MensajeGeneralAlert(TITULO_MENSAJE, "No es posible cambiar el estado en el registro porque esta relacionado con otras entidades");
    }
}

function EliminarRegistroAll(id, mantenimientoId, entidadRelacionId) {
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === mantenimientoId) || null;
    if (item !== null) {
        EliminarRegistro(id, item, entidadRelacionId);
    }
}

function EliminarRegistro(id, item, _entidadRelacionId) {
    let entidadRelacionId = _entidadRelacionId || null;
    let validarDependencia = false; //ExisteRelacionPortafolio(id, item.Mantenimiento);
    if (!validarDependencia) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: "¿Estás seguro(a) que deseas eliminar el registro seleccionado?",
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
        MensajeGeneralAlert(TITULO_MENSAJE, "No es posible eliminar el registro porque esta relacionado con otras entidades");
    }
}