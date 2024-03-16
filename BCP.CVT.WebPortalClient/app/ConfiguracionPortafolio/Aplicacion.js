var $table = $("#tbl-Aplicacion");
var URL_API_VISTA = URL_API + "/AplicacionPortafolio";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Configuración de aplicaciones";

$(function () {
    FormatoCheckBox($("#divReqCodInt"), 'cbReqCodInt');
    FormatoCheckBox($("#divReqCodInt2"), 'cbReqCodInt2');
    initFecha();
    cargarCombos();
 
    validarFormAplicacion();
    //validarFormConfigurarAmbiente();
    listarAplicacion();
});

function initFecha() {
    $("#dpFechaActualizacion-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
    $("#dpFechaRegistro-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });

}

function buscarAplicacion() {
    listarAplicacion();
}

function listarAplicacion() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Tabla',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusApp").val());
            DATA_EXPORTAR.tabla = $("#ddlTablaI").val() !== "-1" ? $("#ddlTablaI").val() : "";
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.AplicacionId = id_aplicacion;

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
        }
    });
}

function validarFormAplicacion() {

    $.validator.addMethod('positiveNumber',
        function (value) {
            return Number(value) >= 0;
        }
    );

    //$.validator.addMethod("existeCodigo", function (value, element) {
    //    //debugger;
    //    let estado = true;
    //    if ($.trim(value) !== "") {
    //        let estado = false;
    //        estado = !ExisteCodigo();
    //        //debugger;
    //        return estado;
    //    }
    //    return estado;
    //});

    $("#formAddOrEditApp").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlGestionadoPor: {
                requiredSelect: true
            }
            ,
            ddlTipoImplementacion: {
                requiredSelect: true
            }
            ,
            ddlModeloEntrega: {
                requiredSelect: true
            }
            ,
            txtCodigo: {
                requiredSelect: true
            },
            txtNombreAplicacion: {
                requiredSinEspacios: true
            }
        },
        messages: {
            ddlGestionadoPor: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlTipoImplementacion: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlModeloEntrega: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            txtCodigo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el valor")
            },
             txtNombreAplicacion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el valor")
            }
        }
    });
}

function limpiarMdAddOrEditApp() {
    LimpiarValidateErrores($("#formAddOrEditApp"));
    $("#txtCodigo").val('');
    $("#txtNombreAplicacion").val('');
    $("#txtDescripcion").val('');
    $("#txtCodigoAPTPadre").val('');
    $("#txtArquitectoNegocio").val('');
    $("#ddlGestionadoPor").val("-1");
    $("#ddlTipoImplementacion").val("-1");
    $("#ddlModeloEntrega").val("-1");
    $("#ddlEstadoAplicacion").val("-1");
    $("#divReqCodInt").prop('checked', true);
    $("#divReqCodInt").bootstrapToggle('on');
    $("#dpFechaRegistro").val('');

}

function MdAddOrEditApp(EstadoMd) {
    limpiarMdAddOrEditApp();
    if (EstadoMd)
        $("#MdAddOrEditApp").modal(opcionesModal);
    else
        $("#MdAddOrEditApp").modal('hide');
}


function MdEditApp(EstadoMd) {
    limpiarMdAddOrEditApp();
    if (EstadoMd)
        $("#MdEditApp").modal(opcionesModal);
    else
        $("#MdEditApp").modal('hide');
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:editarAplicacion(${row.Id})" title="Editar">${value}</a>`;
}

//function opciones(value, row, index) {
//    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
//    let type_icon = row.Activo ? "check" : "unchecked";
//    let estado = `<a href="javascript:cambiarEstado(${row.Id})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

//    return estado;
//}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let btnEstado = `<a href="javascript:cambiarEstado(${row.Id})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    let btnEliminar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar registro"><i class="${style_color} glyphicon glyphicon-trash"></i></a>`;

    return btnEstado.concat("&nbsp;&nbsp;", btnEliminar);
}

function AddAplicacion() {
    $("#titleFormApp").html("Configurar aplicaciones");
    $("#hdAplicacionId").val('');
    $("#txtCodApp").attr('readonly', false);
    //$("#hdNumTecAsoc").val("0");
    //MdAddOrEditApp(true);
    MdEditApp(true);
}

function editarAplicacion(Id) {
    $("#txtCodApp").attr('readonly', true);
    $("#titleFormApp").html("Configurar aplicaciones");
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer' + localStorage.getItem('token')); },
        success: function (result) {
            MdAddOrEditApp(true);

            $("#hdAplicacionId").val(result.Id);
            //$("#hdNumTecAsoc").val(NumTecAsociadas);
            $("#txtCodApp").val(result.Id);
            $("#txtCodigo").val(result.Codigo);
            $("#txtNombreAplicacion").val(result.NombreAplicacion);
            $("#txtDescripcion").val(result.Descripcion);
            $("#txtCodigoAPTPadre").val(result.CodigoAPTPadre);
            $("#txtArquitectoNegocio").val(result.ArquitectoNegocio);
            $("#ddlGestionadoPor").val(result.GestionadoPor);
            $("#ddlTipoImplementacion").val(result.TipoImplementacion);
            $("#ddlModeloEntrega").val(result.ModeloEntrega);
            $("#ddlEstadoAplicacion").val(result.EstadoAplicacion);
            $("#dpFechaRegistro").val(result.FecharRegistro);
           

            $("#divReqCodInt").prop('checked', result.Activo);
            $('#divReqCodInt').bootstrapToggle(result.Activo ? 'on' : 'off');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function cambiarEstado(Id) {
    bootbox.confirm({
        message: "¿Estás seguro que deseas cambiar el estado del registro seleccionado?",
        buttons: {
            confirm: {
                label: 'Aceptar',
                className: 'btn-primary'
            },
            cancel: {
                label: 'Cancelar',
                className: 'btn-secondary'
            }
        },
        callback: function (result) {
            if (result) {
                $.ajax({
                    type: 'GET',
                    contentType: "application/json; charset=utf-8",
                    url: `${URL_API_VISTA}/CambiarEstado?Id=${Id}&Usuario=${USUARIO.UserName}`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer' + localStorage.getItem('token')); },
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                listarAplicacion();
                            }
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    },
                    complete: function (data) {
                        //$("#txtBusTipo").val('');
                        //$table.bootstrapTable('refresh');
                    }
                });
            }
        }
    });
    //}
}

function guardarAddOrEditAplicacion() {
    if ($("#formAddOrEditApp").valid()) {
        $("#btnRegApp").button("loading");

        var aplicacion = {};
        aplicacion.Id = ($("#hdAplicacionId").val() === "") ? -1 : parseInt($("#hdAplicacionId").val());
      
        aplicacion.Codigo = $("#txtCodigo").val();
        aplicacion.NombreAplicacion = $("#txtNombreAplicacion").val();
        aplicacion.Descripcion = $("#txtDescripcion").val();
        aplicacion.CodigoAPTPadre = $("#txtCodigoAPTPadre").val();
        aplicacion.ArquitectoNegocio = $("#txtArquitectoNegocio").val();

        aplicacion.GestionadoPor = $("#ddlGestionadoPor").val();
        aplicacion.TipoImplementacion = $("#ddlTipoImplementacion").val();
        aplicacion.ModeloEntrega = $("#ddlModeloEntrega").val();
        aplicacion.EstadoAplicacion = $("#ddlEstadoAplicacion").val();
        aplicacion.FechaRegistro = $("#dpFechaRegistro").val();

        aplicacion.UsuarioCreacion = USUARIO.UserName;
        aplicacion.UsuarioModificacion = USUARIO.UserName;

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(aplicacion),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
            },
            complete: function () {
                $("#btnRegApp").button("reset");
                $("#txtBusApp").val('');
                $table.bootstrapTable('refresh');
                MdAddOrEditApp(false);
            },
            error: function (result) {
                //ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}


function cargarCombos() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ListarCombos?idAplicacion=${id_aplicacion}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.GestionadoPor, $("#ddlGestionadoPor"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoImplementacion, $("#ddlTipoImplementacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ModeloEntrega, $("#ddlModeloEntrega"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EstadoAplicacion, $("#ddlEstadoAplicacion"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function irEliminar(id) {
    let MENSAJE_VIEW = "¿Estás seguro(a) que deseas eliminar el registro seleccionado?";
    let dataRetorno = ExisteRelacionPortafolio(id, ENTIDAD_MANTENIMIENTO);
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
                        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/EliminarRegistroByConfiguracion?id=${id}&idConfiguracion=${ENTIDAD_MANTENIMIENTO}&Usuario=${USUARIO.UserName}`,
                        type: "GET",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer' + localStorage.getItem('token')); },
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    waitingDialog.hide();
                                    toastr.success("Se eliminó el registro correctamente", TITULO_MENSAJE);
                                    listarAplicacion();
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