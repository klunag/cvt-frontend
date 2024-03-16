var $tblRegistro = $("#tblRegistro");
var URL_API_VISTA = URL_API + "/Aplicacion/GestionAplicacion";
var URL_API_USUARIO = URL_API + "/Usuario";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Gestión de Aplicaciones";
var ESTADO_SOLICITUD_APP = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var DATA_ESTADO = [];
var ESTADOS_APOYO_PENDIENTE_MODAL = [ESTADO_SOLICITUD_APP.APROBADO, ESTADO_SOLICITUD_APP.OBSERVADO];

var TITULO_MENSAJE_APROBACION = "Aprobar aplicación";
var TITULO_MENSAJE_OBSERVACION = "Observar aplicación";

$(function () {

    $tblRegistro.bootstrapTable("destroy");
    $tblRegistro.bootstrapTable({ data: [] });

    InitAutocompletarBuilder($("#txtLiderTribu"), null, ".tribuContainer", "/Aplicacion/GetJefeEquipoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtProduct"), null, ".usuarioContainer", "/Aplicacion/GetOwnerByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtAplicacion"), $("#hAplicacion"), ".appContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");

    CargarCombos();
    ListarRegistros();

    validarFormCambioEstado();

    setDefaultHd($("#txtAplicacion"), $("#hAplicacion"));
});

function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Aplicacion/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItems(dataObject.Criticidad, $("#cbFiltroCriticidad"), TEXTO_SELECCIONE);
                    //SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTE_MODAL.includes(x.Id)), $("#cbNuevoEstado"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Gerencia, $("#cbFiltroGerencia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Division, $("#cbFiltroDivision"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Unidad, $("#cbFiltroUnidad"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Area, $("#cbFiltroArea"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Estado, $("#cbFiltroEstado"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoExperto, $("#ddlTipo"), TEXTO_SELECCIONE);
                    DATA_ESTADO = dataObject.EstadoSolicitud;
                    SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTE_MODAL.includes(x.Id)), $("#cbNuevoEstado"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblRegistro.bootstrapTable('destroy');
    $tblRegistro.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        sortName: "CodigoAPT",
        sortOrder: "asc",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.EstadoSolicitud = [ESTADO_SOLICITUD_APP.REGISTRADO, ESTADO_SOLICITUD_APP.PROCESOREVISION];

            DATA_EXPORTAR.Gerencia = $("#cbFiltroGerencia").val() === "-1" ? null : $("#cbFiltroGerencia").val();
            DATA_EXPORTAR.Division = $("#cbFiltroDivision").val() === "-1" ? null : $("#cbFiltroDivision").val();
            DATA_EXPORTAR.Unidad = $("#cbFiltroUnidad").val() === "-1" ? null : $("#cbFiltroUnidad").val();
            DATA_EXPORTAR.Area = $("#cbFiltroArea").val() === "-1" ? null : $("#cbFiltroArea").val();
            DATA_EXPORTAR.Estado = $("#cbFiltroEstado").val() === "-1" ? null : $("#cbFiltroEstado").val();
            DATA_EXPORTAR.JefeEquipo = $.trim($("#txtLiderTribu").val());
            DATA_EXPORTAR.Owner = $.trim($("#txtProduct").val());
            DATA_EXPORTAR.Aplicacion = $("#hAplicacion").val() !== "0" ? $("#hAplicacion").val() : $.trim($("#txtAplicacion").val());

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

function RefrescarListado() {
    ListarRegistros();
}

//function opcionesFormatter(value, row) {
//    let style_color = row.FlagRelacionar ? 'iconoVerde ' : "iconoRojo ";
//    let type_icon = row.FlagRelacionar ? "check" : "unchecked";
//    let editarResponsables = `<a href="javascript:IrObtenerResponsablesApExp('${value}');" title="Editar responsables"><i style="" class="glyphicon glyphicon-user table-icon"></i></a>`;
//    let editarFlagRelacionar = `<a href="javascript:cambiarFlagRelacionar('${value}')" title="Editar condición"><i style="" id="chkRelacionar${value}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

//    editarResponsables = "";
//    editarFlagRelacionar = "";
//    return editarFlagRelacionar.concat("&nbsp;&nbsp;", editarResponsables);
//}

function NombreFormatter(value, row, index) {
    let url = "";
    if (row.AplicacionDetalle.EstadoSolicitudId === ESTADO_SOLICITUD_APP.REGISTRADO)
        url = `<a href="NuevaAplicacion?Id=${row.Id}&Vista=1" title="Editar" target="_blank">${value}</a>`;
    else
        url = `<a href="NuevaAplicacion?Id=${row.Id}&Vista=1" title="Ver detalle" target="_blank">${value}</a>`;

    return url;
}


function opcionesFormatter(value, row) {
    let eliminar = "";
    let cambiarEstado = "";
    let reiniciarEstado = "";

    if (row.AplicacionDetalle.EstadoSolicitudId === ESTADO_SOLICITUD_APP.PROCESOREVISION)
        cambiarEstado = `<a href="javascript:irCambiarEstado(${row.Id},${row.AplicacionDetalle.EstadoSolicitudId}, '${row.AplicacionDetalle.EstadoSolicitudStr}')" title="Cambiar estado"><span class="icon icon-rotate-right"></span></a>`;
    else
        cambiarEstado = "";


    //if (row.EstadoId === ESTADO_RELACION.APROBADO)
    //    eliminar = `<a href="javascript:IrEliminarRegistro(${value});" title="Eliminar registro"><i style="" class="glyphicon glyphicon-trash table-icon"></i></a>`;
    //else
    //    eliminar = `<a title="Eliminar registro" disabled="disabled" ><i style="color:#A5A9AC;" class="glyphicon glyphicon-trash table-icon"></i></a>`;

    //if (row.EstadoId === ESTADO_RELACION.PENDIENTE || row.EstadoId === ESTADO_RELACION.PENDIENTEELIMINACION) {
    //    cambiarEstado = `<a href="javascript:IrAbrirModalCambioEstado(${row.RelacionId},${row.EstadoId},'${row.EstadoStr}')" title="Cambiar estado"><span class="icon icon-rotate-right"></span></a>`;
    //} else {
    //    cambiarEstado = `<a title="Cambiar estado"><span style="color:#A5A9AC;" class="icon icon-rotate-right"></span></a>`;
    //}

    //if (row.EstadoId === -1 || row.EstadoId === ESTADO_RELACION.DESAPROBADO) {
    //    reiniciarEstado = `<a href="javascript:irReiniciarEstado(${value});" title="Reiniciar estado"><i style="" class="glyphicon glyphicon-retweet table-icon"></i></a>`;
    //}

    //cambiarEstado = `<a href="javascript:irCambiarEstado(${row.Id},${row.AplicacionDetalle.EstadoSolicitudId})" title="Cambiar estado"><span class="icon icon-rotate-right"></span></a>`;

    return eliminar.concat("&nbsp;&nbsp;", cambiarEstado).concat("&nbsp;&nbsp;", reiniciarEstado);
}

function irCambiarEstado(Id, EstadoSolicitudId, EstadoStr) {
    $("#hdAplicacionId").val(Id);
    $("#txtEstadoActual").val(EstadoStr);
    $("#mdCambioEstado").modal(opcionesModal);
}

function validarFormCambioEstado() {
    $("#formCambioEstado").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        rules: {
            cbNuevoEstado: {
                requiredSelect: true
            },
            //txtObservacion: {
            //    requiredObservacion: true
            //}
        },
        messages: {
            cbNuevoEstado: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el estado")
            },
            //txtObservacion: {
            //    requiredObservacion: String.Format("Debes ingresar {0}.", "la observación")
            //}
        }
    });
}

//function GuardarNuevoEstado() {
//    if ($("#formCambioEstado").valid()) {
        
//        //IrCambiarEstado($("#hdId").val(), $("#cbNuevoEstado").val(), $("#txtObservacion").val());
//    }
//}

//function IrCambiarEstado(Id, EstadoId, Observacion) {
//    //debugger;
//    let mensaje = "";
//    Observacion = Observacion || null;
//    let estadoId = parseInt(EstadoId);

//    let data = {
//        Id: $("#hdId").val(),
//        EstadoId: estadoId,
//        Usuario: USUARIO.UserName
//    };

//    let estadoActual = parseInt($("#hdEstadoId").val());
//    switch (estadoActual) {
//        case ESTADO_RELACION.PENDIENTEELIMINACION:
//            mensaje = "¿Estás seguro de {0} la ELIMINACIÓN de la Relación?";
//            CasoPendienteEliminacion(estadoId, data, mensaje, Observacion);
//            break;
//        case ESTADO_RELACION.PENDIENTE:
//            mensaje = "¿Estás seguro de {0} la relación?";
//            CasoPendiente(estadoId, data, mensaje, Observacion);
//            break;
//    }
//}

function GuardarNuevoEstado() {
    if ($("#formCambioEstado").valid()) {
        debugger;
        var estNueTec = parseInt($("#cbNuevoEstado").val());
        if (estNueTec === ESTADO_SOLICITUD_APP.APROBADO) {
            bootbox.confirm({
                title: TITULO_MENSAJE_APROBACION,
                message: "¿Estas seguro de aprobar el registro de la aplicación?",
                buttons: {
                    confirm: {
                        label: 'Aprobar',
                        className: 'btn-primary'
                    },
                    cancel: {
                        label: 'Cancelar',
                        className: 'btn-secondary'
                    }
                },
                callback: function (result) {
                    if (result) {
                        var data = {};
                        data.id = $("#hdAplicacionId").val();
                        data.est = ESTADO_SOLICITUD_APP.APROBADO;
                        data.obs = "";

                        $("#btnGuardarEstado").button("loading");

                        $.ajax({
                            url: URL_API_VISTA + "/CambiarEstado",
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(data),
                            dataType: "json",
                            success: function (result) {
                                bootbox.alert({
                                    size: "sm",
                                    title: TITULO_MENSAJE_APROBACION,
                                    message: "La aplicación se aprobó correctamente."
                                });
                            },
                            complete: function () {
                                $("#btnGuardarEstado").button("reset");
                                $("#mdCambioEstado").modal('hide');
                                ListarRegistros();
                            },
                            error: function (xhr, ajaxOptions, thrownError) {
                                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                            }
                        });
                    }
                }
            });
        } else {
            bootbox.addLocale('custom', locale);
            bootbox.prompt({
                title: TITULO_MENSAJE_OBSERVACION,
                message: '<p>¿Estas seguro que deseas observar el registro de la aplicación?, de ser asi por favor ingrese los comentarios al respecto:</p>',
                inputType: 'textarea',
                rows: '5',
                locale: 'custom',
                callback: function (result) {
                    var data = result;
                    if (data !== '' && data !== null) {
                        if ($.trim(data).length > 500) {
                            toastr.error("Observación no debe superar los 500 carácteres.", TITULO_MENSAJE);
                            return false;
                        }
                        var tec = {};
                        tec.id = $("#hdAplicacionId").val();
                        tec.obs = data;
                        tec.est = ESTADO_SOLICITUD_APP.OBSERVADO;

                        $("#btnGuardarEstado").button("loading");

                        $.ajax({
                            url: URL_API_VISTA + "/CambiarEstado",
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(tec),
                            dataType: "json",
                            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                            success: function (result) {
                                console.log(result);
                                bootbox.alert({
                                    size: "sm",
                                    title: TITULO_MENSAJE_OBSERVACION,
                                    message: "La aplicación se observó correctamente.",
                                    buttons: {
                                        ok: {
                                            label: 'Aceptar',
                                            className: 'btn-primary'
                                        }
                                    }
                                });
                            },
                            complete: function () {
                                $("#btnGuardarEstado").button("reset");
                                $("#mdCambioEstado").modal('hide');
                                ListarRegistros();
                            },
                            error: function (xhr, ajaxOptions, thrownError) {
                                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                            }
                        });
                    } else {
                        toastr.error("Observación no debe estar vacio", TITULO_MENSAJE);
                    }
                }
            });
            $(".bootbox-input-textarea").attr("placeholder", placeholderObs);
        }
    }
}