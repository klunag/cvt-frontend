const URL_API_VISTA = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Portafolio de Aplicaciones";
const MENSAJE_APROBAR = "¿Estás seguro de actualizar los datos de la aplicación y aprobar el cambio?";
const MENSAJE_RECHAZAR = "¿Estás seguro de rechazar la solicitud y notificar al solicitante sobre ello?";
const MENSAJE_TRANSFERIR = "¿Estás seguro de transferir la solicitud y notificar al jefe de equipo asignado?";
const MENSAJE_CONFIRMACION = "Se actualizó la aplicación de manera satisfactoria.";
const ID_CAMPO_EQUIPO = 12;
const ID_CAMPO_GESTIONADOPOR = 5;

$(function () {
    cargarCombos();
    cargarToolbox();
    $("#btnRegistrarApp").click(guardarAddOrEditApp);
    $("#btnRechazarApp").click(irRechazar);
    $("#btnTransferirApp").click(irTransferir);

    $("#btnProcesarRechazo").click(guardarRechazoApp);
    $("#btnProcesarTransferencia").click(guardarTransferirApp);

    if (APLICACION_ID !== 0) {
        editarAplicacion(APLICACION_ID);        
    } else {
        window.document.location.href = URL_BANDEJA;
    }

    validarFormRechazo();
    validarFormTransferir();
});


function cargarToolbox() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/stepone/toolbox",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //dataObject.foreach(AsignarToolbox)
                    var IDs = [];
                    $("#divApp").find("span").each(function () { IDs.push(this.id); });

                    $.each(dataObject, function (i) {
                        if (IDs.includes(dataObject[i].Codigo)) {
                            if (dataObject[i].Codigo != '' && dataObject[i].Codigo != null) {
                                var strfun = 'function changeTooltip() { document.getElementById(\"' + dataObject[i].Codigo + '\").innerHTML = dataObject[i].Tooltip;}';
                                eval(strfun)
                                changeTooltip();
                            }
                        }
                    });
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function irRechazar() {
    $("#txtDescripcionRechazo").val('');
    $("#txtDescripcionTransferencia").val('');
    LimpiarValidateErrores($("#formRechazar"));
    OpenCloseModal($("#modalRechazar"), true);
}

function irTransferir() {
    $("#txtDescripcionRechazo").val('');
    $("#txtDescripcionTransferencia").val('');
    LimpiarValidateErrores($("#formTransferir"));
    OpenCloseModal($("#modalTransferir"), true);
}

function editarAplicacion(aplicacionId) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/application/${aplicacionId}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;

                    $("#hdAplicacionId").val(APLICACION_ID);
                    $("#hdFlujoId").val(FLUJO_ID);
                    $("#txtCodigoAPT").val(data.applicationId);
                    $("#txtNombre").val(data.applicationName);
                    $("#txtDescripcion").val(data.description);
                    $("#ddlTipoActivo").val(data.assetType || "-1");    

                    validarFlujo(FLUJO_ID, data.managed);
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function guardarAddOrEditApp() {
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE_APROBAR,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            result = result || null;
            if (result !== null && result) {
                sendDataFormAPI($("#btnRegistrarApp"), true, ACCION_REGISTRAR);
            }
        }
    });
}

function guardarRechazoApp() {
    if ($("#formRechazar").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE_RECHAZAR,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                result = result || null;
                if (result !== null && result) {
                    sendDataFormAPI($("#btnRegistrarApp"), false, ACCION_RECHAZAR);
                }
            }
        });
    }
}

function guardarTransferirApp() {
    if ($("#formTransferir").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE_TRANSFERIR,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                result = result || null;
                if (result !== null && result) {
                    sendDataFormAPI($("#btnRegistrarApp"), false, ACCION_TRANSFERIR);
                }
            }
        });
    }
}

function LimpiarValidateErrores(form) {
    form.validate().resetForm();
}

function validarFormRechazo() {
    $("#formRechazar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtDescripcionRechazo: {
                requiredSinEspacios: true,
                maxlength: 800
            }
        },
        messages: {
            txtDescripcionRechazo: {
                requiredSinEspacios: "Debes de ingresar un comentario para justificar el rechazo",
                maxlength: "El límite de caracteres esperados es de 800"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDescripcionRechazo") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function validarFormTransferir() {
    $("#formTransferir").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtDescripcionTransferencia: {
                requiredSinEspacios: true,
                maxlength: 800
            },
            ddlEquipo: {
                requiredSelect: true
            }
        },
        messages: {
            txtDescripcionTransferencia: {
                requiredSinEspacios: "Debes de ingresar un comentario para justificar la transferencia",
                maxlength: "El límite de caracteres esperados es de 800"
            },
            ddlEquipo: {
                requiredSelect: "Debes de seleccionar un equipo"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDescripcionTransferencia" || element.attr('name') === "ddlArquitectoNegocio") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function CrearObjAplicacion(aprobado, accion) {
    var data = {};
    data.AppId = $("#hdAplicacionId").val();
    data.FlowAppId = $("#hdFlujoId").val();

    data.teamId = getDDL($("#ddlEquipoNuevo"));
    data.isApproved = aprobado;
    data.actionManager = accion;
    data.RegistroOModificacion = 2;

    if (accion != ACCION_REGISTRAR)
        data.comments = $("#txtDescripcionRechazo").val() || $("#txtDescripcionTransferencia").val();

    if (accion == ACCION_TRANSFERIR) {
        data.architectId = getDDL($("#ddlArquitectoNegocio"));
        data.isApproved = null;
    }

    return data;
}

function sendDataFormAPI($btn, aprobado, accion) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjAplicacion(aprobado, accion);

    $.ajax({
        url: URL_API_VISTA + "/application/teamleader",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let dataResult = dataObject;
                    estadoTransaccion = dataResult.EstadoTransaccion;
                    if (dataResult.EstadoTransaccion) {
                        window.document.location.href = `Solicitudes?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ORDER_BY}&orderDirection=${ORDER_DIRECTION}`;

                    } else {
                        MensajeGeneralAlert(TITULO_MENSAJE, "Se ha encontrado un inconveniente en la actualización, vuelve a intentarlo.");
                    }
                }
            }
        },
        complete: function (data) {
            if ($btn !== null) {
                $btn.button("reset");
                waitingDialog.hide();
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function getDDL($ddl) {
    return $ddl.val() !== "-1" ? $ddl.val() : null;
}

function validarFlujo(flujoId, gestionadoPor) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/flow/${flujoId}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;
                    let valores = data.data;

                    if (valores.length == 1) {
                        if (valores[0].fieldId == ID_CAMPO_GESTIONADOPOR) {
                            $("#ddlGestionadoActual").val(valores[0].currentValue);
                            $("#ddlGestionadoNuevo").val(valores[0].newValue);
                        }
                        else if (valores[0].fieldId == ID_CAMPO_EQUIPO) {
                            cargarEquiposDetalle(gestionadoPor, $("#ddlEquipoActual"));
                            cargarEquiposDetalle(gestionadoPor, $("#ddlEquipoNuevo"));

                            $("#ddlEquipoActual").val(valores[0].currentValue);
                            $("#ddlEquipoNuevo").val(valores[0].newValue);
                        }
                    }
                    else {
                        $("#ddlGestionadoActual").val(valores[0].currentValue);
                        $("#ddlGestionadoNuevo").val(valores[0].newValue);

                        if (valores[1].currentValue != '' && valores[1].currentValue != null) {
                            cargarEquiposDetalle($("#ddlGestionadoActual").val(), $("#ddlEquipoActual"));
                            $("#ddlEquipoActual").val(valores[1].currentValue);
                        }

                        if (valores[1].newValue != '' && valores[1].newValue != null) {
                            cargarEquiposDetalle($("#ddlGestionadoNuevo").val(), $("#ddlEquipoNuevo"));
                            $("#ddlEquipoNuevo").val(valores[1].newValue);
                        }
                    }
                    if (data.isCompleted == 0) {
                        $("#txtSolAprobada").hide();
                        $("#txtSolAprobadaFecha").hide();
                        $("#txtAtendidaPor").hide();
                        $("#txtAtendidaPorName").hide();
                    }
                    if (data.isCompleted == 1) {
                        $("#txtSolAprobada").show();
                        $("#txtSolAprobadaFecha").show();
                        $("#txtAtendidaPor").show();
                        $("#txtAtendidaPorName").show();
                    }
                    if (data.isCompleted) {
                        $("#btnRechazarApp").hide();
                        $("#btnTransferirApp").hide();
                        $("#btnRegistrarApp").hide(); 
                        if (data.dateApproved != null) {
                            $("#txtSolAprobada").html("La Solicitud ha sido aprobada el:");
                            $("#txtSolAprobadaFecha").val(data.dateApprovedStr);
                            $("#txtAtendidaPor").html("La Solicitud fue aprobada por:");
                            $("#txtAtendidaPorName").val(data.approvedByName);
                        }

                        if (data.dateRejected != null) {
                            $("#txtSolAprobada").html("La Solicitud ha sido rechazada el:");
                            $("#txtSolAprobadaFecha").val(data.dateRejectedStr);
                            $("#txtAtendidaPor").html("La Solicitud fue rechazada por:");
                            $("#txtAtendidaPorName").val(data.rejectedByName);
                        }

                        if (data.dateTransfer != null) {
                            $("#txtSolAprobada").html("La Solicitud ha sido transferida el:");
                            $("#txtSolAprobadaFecha").val(data.dateTransferStr);
                            $("#txtAtendidaPor").html("La Solicitud fue transferida por:");
                            $("#txtAtendidaPorName").val(data.transferedByName);
                        }
                    }
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function cargarCombos() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/lists/architecteval",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoActivo, $("#ddlTipoActivo"), TEXTO_SELECCIONE);
                    let gestionadoData = dataObject.GestionadPor;
                    SetItems(gestionadoData, $("#ddlGestionadoActual"), TEXTO_SELECCIONE);
                    SetItems(gestionadoData, $("#ddlGestionadoNuevo"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function cargarEquiposDetalle(gestionado, combo) {
    combo.empty();    

    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/managedteams/${gestionado}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Equipos, combo, TEXTO_SELECCIONE);                    
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}