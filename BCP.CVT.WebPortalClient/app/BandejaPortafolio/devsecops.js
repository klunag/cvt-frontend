const URL_API_VISTA = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Portafolio de Aplicaciones";
const MENSAJE_APROBAR = "¿Estás seguro de actualizar los datos de la aplicación y confirmar el cambio?";
const MENSAJE_CONFIRMACION = "Se actualizó la aplicación de manera satisfactoria.";
const MENSAJE_OBSERVAR = "¿Estás seguro de enviar el comentario al solicitante (se notificará por correo electrónico)?";

$(function () {
    cargarCombos();
    cargarToolbox();
    $("#btnRegistrarApp").click(guardarAddOrEditApp);
    $("#btnObservarApp").click(irObservar);
    $("#btnProcesarObservacion").click(guardarObservarApp);

    if (APLICACION_ID !== 0) {
        editarAplicacion(APLICACION_ID);
        validarFlujo(FLUJO_ID);
    } else {
        window.document.location.href = URL_BANDEJA;
    }

    validarFormApp();
});


function irObservar() {
    $("#txtDescripcionObservacion").val('');

    LimpiarValidateErrores($("#formObservar"));
    OpenCloseModal($("#modalObservar"), true);
}

function guardarObservarApp() {
    if ($("#formObservar").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE_OBSERVAR,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                result = result || null;
                if (result !== null && result) {
                    sendDataFormAPI($("#btnProcesarObservacion"), false, ACCION_OBSERVAR);
                }
            }
        });
    }
}

function validarFormObservar() {
    $("#formObservar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtDescripcionObservacion: {
                requiredSinEspacios: true,
                maxlength: 800
            }
        },
        messages: {
            txtDescripcionRechazo: {
                requiredSinEspacios: "Debes de ingresar un comentario para justificar la observación",
                maxlength: "El límite de caracteres esperados es de 800"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDescripcionObservacion") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}
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

                    $("#ddlModeloRegistrado").val(data.deploymentTypeOriginal || "-1");
                    $("#ddlModeloFinal").val(data.deploymentType || "-1");


                    //$("#ddlModeloFinal").val("-1");
                    //$("#ddlModeloFinal").val(data.deploymentTypeOriginal || "-1");
                    //$("#ddlModeloRegistrado").val(data.deploymentType || "-1");
                  

                    $("#ddlModeloRegistrado").attr("disabled", "disabled");

                    if (data.isApproved == true)
                        $("form :input").attr("disabled", "disabled");
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
    //CHC: la primera linea le estaba agregando la clase ignore a todos los inputs con clase form-control. la clase ignore se usa para
    //     decirle al validate que no tome en cuenta esos inputs
    //$(".form-control").addClass("ignore");
    //$(".input-registro").removeClass("ignore");

    if ($("#formAddOrEditApp").valid()) {
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
}

function LimpiarValidateErrores(form) {
    form.validate().resetForm();
}

function validarFormApp() {
    $("#formAddOrEditApp").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlModeloFinal: {
                requiredSelect: true
            }
        },
        messages: {
            ddlModeloFinal: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "ddlModeloFinal") {
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

    data.deploymentType = getDDL($("#ddlModeloFinal"));
    if (accion != ACCION_REGISTRAR)
        data.comments = $("#txtDescripcionObservacion").val();
    
    data.isApproved = aprobado;
    data.actionManager = accion;  
    data.RegistroOModificacion = 1;

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
        url: URL_API_VISTA + "/application/devsecops",
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

function cargarCombos() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/lists/devsecops",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.ModeloEntrega, $("#ddlModeloRegistrado"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ModeloEntrega, $("#ddlModeloFinal"), TEXTO_SELECCIONE);            
                    SetItems(dataObject.TipoActivo, $("#ddlTipoActivo"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function validarFlujo(flujoId) {
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

                    if (data.isObserved == true) {
                        $("#txtSolAprobada").hide();
                        $("#txtSolAprobadaFecha").hide();
                        $("#txtAtendidaPor").hide();
                        $("#txtAtendidaPorName").hide();
                        $("#btnRegistrarApp").hide();
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

                        $('#txtFecha').hide();
                        $('#txtRegistradoPor').hide();
                        $('#fechaActualizacion').hide();
                        $('#actualizadoPor').hide();
                    }
                    if (data.isCompleted && data.registrationSituation != REGISTRO_PARCIAL) {                        
                        $("#btnRegistrarApp").hide();
                        $("#ddlModeloRegistrado").attr("disabled", "disabled");
                        $("#ddlModeloFinal").attr("disabled", "disabled");
                                            
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
                        if (data.isObserved == true) {
                            $("#txtSolAprobada").hide();
                            $("#txtSolAprobadaFecha").hide();
                            $("#txtAtendidaPor").hide();
                            $("#txtAtendidaPorName").hide();
                            $("#btnRegistrarApp").hide();
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