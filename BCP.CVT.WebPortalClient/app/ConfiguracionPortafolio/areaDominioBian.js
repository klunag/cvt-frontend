var $table = $("#tblArea");
var $tblDominio = $("#tblDominio");
var $tblPlataforma = $("#tblPlataforma");
//var $tblJefaturaAti = $("#tblJefaturaAti");
//var $tblArquitectoTi = $("#tblArquitectoTi");
var DATA_EXPORTAR = {};
var DATOS_RESPONSABLE = {};

const URL_API_VISTA = URL_API + "/Aplicacion/ConfiguracionPortafolio";
const TITULO_MENSAJE = "Area/Dominio BIAN - Plataforma BCP";
const TREE_NIVEL = { Uno: 1, Dos: 2, Tres: 3, Cuatro: 4 };
const VALIDACION_MATRICULA = { PENDIENTE: 0, OK: 1 };
const TABLE_NIVELES = [
    {
        Table: $table,
        UrlListado: "ListarAreaBian",
        UrlGetById: "GetAreaBianById",
        UrlAddOrEdit: "AddOrEditAreaBian",
        UrlCambiarEstado: "CambiarEstadoAreaBian",
        Mantenimiento: ENTIDAD_MANTENIMIENTO.AreaBian,
        TitleModal: "Área BIAN",
        classField: "registroField",
        Nivel: TREE_NIVEL.Uno
    },
    {
        Table: $tblDominio,
        UrlListado: "ListarDominioBian",
        UrlGetById: "GetDominioBianById",
        UrlAddOrEdit: "AddOrEditDominioBian",
        UrlCambiarEstado: "CambiarEstadoDominioBian",
        Mantenimiento: ENTIDAD_MANTENIMIENTO.DominioBian,
        TitleModal: "Dominio BIAN",
        classField: "registroField",
        Nivel: TREE_NIVEL.Dos
    },
    {
        Table: $tblPlataforma,
        UrlListado: "ListarPlataformaBcp",
        UrlGetById: "GetPlataformaBcpById",
        UrlAddOrEdit: "AddOrEditPlataformaBcp",
        UrlCambiarEstado: "CambiarEstadoPlataformaBcp",
        Mantenimiento: ENTIDAD_MANTENIMIENTO.PlataformaBcp,
        TitleModal: "Plataforma BCP",
        classField: "registroField",
        Nivel: TREE_NIVEL.Dos
    }    
];

$(function () {
    $("#btnRegistrar").click(GuardarAll);
    $("#btnValidarMatricula").click(ValidarMatriculaAll);
    EnableDisableButtonByInput($("#txtReponsable"), $("#btnValidarMatricula"));
    validarFormRegistro();
    listarInit();
});

function ValidarMatriculaAll() {
    let responsable = $.trim($("#txtReponsable").val());
    if (ExisteMatricula(responsable)) {
        RegistrarMatricula(DATOS_RESPONSABLE);
        $("#txtCorreo").val(DATOS_RESPONSABLE.Correo);
        $("#txtNombreResponsable").val(DATOS_RESPONSABLE.Nombres);
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

function listarInit() {
    let lItem = TABLE_NIVELES.filter(x => x.Nivel === TREE_NIVEL.Uno) || [];
    if (lItem !== null && lItem.length > 0) {
        $.each(lItem, function (i, item) {
            listarRegistros(item);
        });
    }
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
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
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
            item.Table.bootstrapTable('hideColumn', 'Id');
            $(`#button${item.Nivel}`).text("Mostrar acciones");

            let $parent = item.Table.closest("div.bootstrap-table").parent();
            $parent.show();
            if (item.Nivel !== TREE_NIVEL.Dos) {
                $parent.nextAll().hide();
            }
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
        setBuilderModal(item);
    }
    limpiarModal();
    OpenCloseModal($("#mdAddOrEditRegistro"), true);
}

function limpiarModal() {
    LimpiarValidateErrores($("#formAddOrEditRegistro"));
    $(":input", "#formAddOrEditRegistro").val("");
    initIconButton();
}

function validarFormRegistro() {
    $.validator.addMethod("existeNombreEntidad", function (value, element) {
        let estado = true;
        let id = $("#hdRegistroId").val() === "" ? 0 : parseInt($("#hdRegistroId").val());
        let hdMantenimientoId = parseInt($("#hdMantenimientoId").val());
        let hdEntidadRelacionId = parseInt($("#hdEntidadRelacionId").val());
        let txtValor = $.trim(value);
        if (txtValor !== "" && txtValor.length > 2)
            estado = !ExisteNombreEntidadByConfiguracion(id, txtValor, hdMantenimientoId, hdEntidadRelacionId);

        return estado;
    });

    $.validator.addMethod("existeMatricula", function (value, element) {
        let estado = true;
        let entidad_mant = parseInt($("#hdMantenimientoId").val());
        if (entidad_mant === ENTIDAD_MANTENIMIENTO.ArquitectoTi) {
            let valor = $.trim(value);
            if (valor !== "" && valor.length > 2)
                estado = !ExisteMatriculaEnJefaturaAti(valor);
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
                requiredSinEspacios: true,
                existeNombreEntidad: true
            },
            txtDescripcion: {
                requiredSinEspacios: true
            },
            txtReponsable: {
                requiredSinEspacios: true,
                existeMatricula: true
            }
        },
        messages: {
            txtNombre: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre"),
                existeNombreEntidad: "El nombre ya existe"
            },
            txtDescripcion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
            txtReponsable: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la matrícula"),
                existeMatricula: "La matrícula ya esta registrada en esta Jefatura ATI"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtReponsable") {
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
            Nombre: SetCustomName($("#txtNombre").val()),
            Descripcion: $.trim($("#txtDescripcion").val()),
            Responsable: $.trim($("#txtReponsable").val()),
            Correo: $.trim($("#txtCorreo").val()),
            NombreResponsable: $.trim($("#txtNombreResponsable").val()),
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

function nombreFormatter(value, row, index) {
    let validarMatricula = row.FlagValidarMatricula || false;
    let rowLastLevel = row.IsLastLevel || false;
    let formatterValue = row.MantenimientoId === ENTIDAD_MANTENIMIENTO.ArquitectoTi ? validarMatricula ? `${value} - ${row.Correo}` : `${row.Responsable} [Pendiente validación]` : value;
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

    //Setup Children
    let lChild = TABLE_NIVELES.filter(x => x.Nivel === nivelChild) || [];
    if (lChild !== null && lChild.length > 0) {
        $("#hdEntidadRelacionId").val(id);

        $.each(lChild, function (i, item) {
            listarRegistros(item, id);
        });
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

                    setBuilderModal(item);
                    limpiarModal();
                    OpenCloseModal($("#mdAddOrEditRegistro"), true);

                    $("#hdRegistroId").val(data.Id);
                    $("#txtNombre").val(data.Nombre);
                    $("#txtDescripcion").val(data.Descripcion);
                    $("#txtReponsable").val(data.Responsable);
                    $("#txtCorreo").val(data.Correo);
                    $("#txtNombreResponsable").val(data.NombreResponsable);
                    $("#hdEntidadRelacionId").val(data.EntidadRelacionId);
                    $("#hdFlagValidarMatricula").val(data.FlagValidarMatricula || "0");
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function cogFormatter(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo";
    let type_icon = row.Activo ? "check" : "unchecked";
    let btnEstado = `<a href="javascript:CambiarEstadoAll(${row.Id}, ${row.Activo}, ${row.MantenimientoId}, ${row.EntidadRelacionId})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    let btnEliminar = `<a href="javascript:EliminarRegistroAll(${row.Id}, ${row.MantenimientoId}, ${row.EntidadRelacionId})" title="Eliminar registro"><i class="${style_color} glyphicon glyphicon-trash"></i></a>`;

    return btnEstado.concat("&nbsp;&nbsp;", btnEliminar);
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
                    doDelete(id, entidadRelacionId, item);
                }
            }
        });
    } else {
        MENSAJE = `${dataRetorno.MensajeAPI}. No es posible eliminar`;
        MensajeGeneralAlert(TITULO_MENSAJE, MENSAJE);
    }

    //if (!validarDependencia) {
    //    bootbox.confirm({ //Sin dependencias
    //        title: TITULO_MENSAJE,
    //        message: "¿Estás seguro(a) que deseas eliminar el registro seleccionado?",
    //        buttons: SET_BUTTONS_BOOTBOX,
    //        callback: function (result) {
    //            if (result !== null && result) {
    //                doDelete(id, entidadRelacionId, item);
    //            }
    //        }
    //    });
    //} else { //Con dependencias
    //    bootbox.confirm({
    //        title: TITULO_MENSAJE,
    //        message: "¿Estás seguro(a) de eliminar el registro seleccionado?, al confirmar todas las dependencias de este registro se eliminarán y si hubieran aplicaciones asociadas tendrán que ser modificadas con valores que se encuentren activos.",
    //        buttons: SET_BUTTONS_BOOTBOX,
    //        callback: function (result) {
    //            if (result !== null && result) {
    //                doDelete(id, entidadRelacionId, item);
    //            }
    //        }
    //    });
    //}
}

function doDelete(_id, _entidadRelacionId, item) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/EliminarRegistroByConfiguracion?id=${_id}&idConfiguracion=${item.Mantenimiento}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {                    
                    toastr.success("Se eliminó el registro correctamente", TITULO_MENSAJE);
                    listarRegistros(item, _entidadRelacionId);
                }
            }
        },
        complete: function () {
            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
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

    let MENSAJE_VIEW = `¿Estás seguro(a) que deseas ${msjOpcion} el registro seleccionado?`;
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
                        url: URL_API_VISTA + `/${item.UrlCambiarEstado}?id=${id}&estadoActual=${estadoActual}`,
                        type: "GET",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {                                    
                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    listarRegistros(item, entidadRelacionId);
                                }
                            }
                        },
                        complete: function () {
                            waitingDialog.hide();
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

function setBuilderModal(item) {
    $(".all").addClass("ignore");
    $(".all").hide();
    $(`.${item.classField}`).show();
    $(`.${item.classField}`).removeClass("ignore");

    //condicionales
}

function EnableDisableButtonByInput($textBox, $btn) {
    $textBox.keyup(function () {
        let flagActivo = $.trim($(this).val()) !== "" ? true : false;
        $btn.prop('disabled', !flagActivo);
    });
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

function ExisteMatriculaEnJefaturaAti(_matricula) {
    let estado = true;
    let _id = $("#hdRegistroId").val() === "" ? 0 : $("#hdRegistroId").val();
    let _entidadRelacionId = $("#hdEntidadRelacionId").val();

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteMatriculaEnJefaturaAti?filtro=${_matricula}&entidadRelacionId=${_entidadRelacionId}&id=${_id}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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