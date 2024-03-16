const URL_API_VISTA = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Portafolio de Aplicaciones";
const MENSAJE_APROBAR = "¿Estás seguro de actualizar los datos de la aplicación y aprobar el cambio?";
const MENSAJE_RECHAZAR = "¿Estás seguro de rechazar la solicitud y notificar al solicitante sobre ello?";
const MENSAJE_CONFIRMACION = "Se actualizó la aplicación de manera satisfactoria.";
const MENSAJE_OBSERVAR = "¿Estás seguro de enviar el comentario al solicitante (se notificará por correo electrónico)?";
//var ID_USERIT = 0;

$(function () {
    $("#divFechaRegularizacion").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY",
        maxDate: Date.now()
    });
    //$("#divFechaRegularizacion").datetimepicker('setStartDate', '2020-11-19');   
    let activo = obtenerTipoActivoUserIT();
    if (activo != null) {
        ID_USERIT = activo.Id;        
    }
        

    cargarCombos();
    cargarToolbox();
    FormatoCheckBox($("#divFlagInformal"), "ckbInformal");  
    $("#ckbInformal").change(FlagInformal_Change);
    $("#btnRegistrarApp").click(guardarAddOrEditApp);
    $("#btnRechazarApp").click(irRechazar);    
    $("#btnObservarApp").click(irObservar);
    $("#btnProcesarObservacion").click(guardarObservarApp);

    $("#btnProcesarRechazo").click(guardarRechazoApp);        

    if (APLICACION_ID !== 0) {
        editarAplicacion(APLICACION_ID);        
    } else {
        window.document.location.href = URL_BANDEJA;
    }

    validarFormApp();
    validarFormRechazo();    
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

function obtenerTipoActivoUserIT() {
    let activo = null;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/assetType/userIT`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    activo = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return activo;
}

function FlagInformal_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $(".fechaFormalizacion").show();
    }
    else {
        $(".fechaFormalizacion").hide();
    }
}

function irRechazar() {
    $("#txtDescripcionRechazo").val('');
    $("#txtDescripcionTransferencia").val('');
    LimpiarValidateErrores($("#formRechazar"));
    OpenCloseModal($("#modalRechazar"), true);
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
                    
                    if (data.assetType != null) {
                        $("#ddlTipoActivo").val(ID_USERIT);
                    }
                    else
                        $("#ddlTipoActivo").val(ID_USERIT);

                    $("#ddlTipoActivo").attr("disabled", "disabled");

                    $("#ddlEstado").val(data.status || "-1");

                    $("#ckbInformal").prop('checked', data.isFormalApplication);
                    $("#ckbInformal").bootstrapToggle(data.isFormalApplication ? 'on' : 'off');                    
                    $("#dpFechaRegularizacion").attr("disabled", "disabled");

                    if (data.isFormalApplication) {
                        $(".fechaFormalizacion").show();
                        $("#dpFechaRegularizacion").val(data.regularizationDateDetail);
                    }
                    else
                        $(".fechaFormalizacion").hide();                   
                    //$("#dpFechaRegularizacion").val(data.regularizationDateDetail || GetCurrentDate());

                    if (data.isApproved == true)
                        $("form :input").attr("disabled", "disabled");

                    validarFlujo(FLUJO_ID, data.isApproved);
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
            ddlTipoActivo: {
                requiredSelect: true
            },
            ddlEstado: {
                requiredSelect: true
            }
        },
        messages: {
            ddlTipoActivo: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlEstado: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "ddlTipoActivo"
                || element.attr('name') === "ddlEstado") {
                
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
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

function CrearObjAplicacion(aprobado, accion) {
    var data = {};
    data.AppId = $("#hdAplicacionId").val();
    data.FlowAppId = $("#hdFlujoId").val();

    data.assetType = getDDL($("#ddlTipoActivo"));
    data.status = getDDL($("#ddlEstado"));
    data.isFormalApplication = $("#ckbInformal").prop("checked");
    if (data.isFormalApplication == true)
        data.regularizationDate = castDate($("#dpFechaRegularizacion").val());
    
    data.isApproved = aprobado;
    data.actionManager = accion;
    data.RegistroOModificacion = 1;

    if (accion != ACCION_REGISTRAR)
        data.comments = $("#txtDescripcionRechazo").val() || $("#txtDescripcionObservacion").val();    

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
        url: URL_API_VISTA + "/application/evaluserit",
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
        url: URL_API_VISTA + "/application/lists/architecteval",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
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

function validarFlujo(flujoId, isApproved) {
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
                    }
                    if (data.isCompleted) {

                        $('#txtFecha').hide();
                        $('#txtRegistradoPor').hide();
                        $('#fechaActualizacion').hide();
                        $('#actualizadoPor').hide();

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
                    if (isApproved != true) {
                        if (data.isCompleted) {
                            $("#btnRechazarApp").hide();
                            $("#btnRegistrarApp").hide();
                            $("#btnObservarApp").hide();

                            if (data.isApproved) {
                                $("#ckbInformal").attr("disabled", "disabled");
                                $("#dpFechaRegularizacion").removeAttr("disabled");
                                $("#btnRegistrarApp").show();
                            }
                        }
                    }
                    else {
                        $("#btnObservarApp").hide();
                        $("#btnRechazarApp").hide();
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