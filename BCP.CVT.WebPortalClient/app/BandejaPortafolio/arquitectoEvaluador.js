const URL_API_VISTA = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Portafolio de Aplicaciones";
const MENSAJE_APROBAR = "¿Estás seguro de confirmar los datos de la aplicación?";
const MENSAJE_RECHAZAR = "¿Estás seguro de rechazar la solicitud y notificar al solicitante sobre ello?";
const MENSAJE_TRANSFERIR = "¿Estás seguro de transferir la solicitud y notificar al arquitecto evaluador asignado?";

const MENSAJE_OBSERVAR = "¿Estás seguro de enviar el comentario al solicitante (se notificará por correo electrónico)?";
const MENSAJE_CONFIRMACION = "Se actualizó la aplicación de manera satisfactoria.";
const JEFATURA_ATI = 12;

var $table = $("#tbl-piezaCross");
let LISTA_CHECKLIST_CROSS;
let FlagComponenteCross = false;

$(function () {
    cargarCombos();
    cargarToolbox();
    InitInputFiles();
    /*cargarCombosArquitectos(JEFATURA_ATI);*/
    $("#btnRegistrarApp").click(guardarAddOrEditApp);
    $("#btnRechazarApp").click(irRechazar);
    $("#btnTransferirApp").click(irTransferir);
    $("#btnObservarApp").click(irObservar);

    $("#btnProcesarRechazo").click(guardarRechazoApp);
    $("#btnProcesarTransferencia").click(guardarTransferirApp);
    $("#btnProcesarObservacion").click(guardarObservarApp);

    $("#ddlAreaBIAN").change(changeArea);
    /*$("#ddlJefaturaTransferir").change(changeJefatura);*/

    InitAutocompletarBuilder($("#txtCodigoAppPadre"), $("#hCodigoPadre"), ".containerAplicacion", "/applicationportfolio/application/filter?filtro={0}&codigoAPT=");

    if (APLICACION_ID !== 0) {
        editarAplicacion(APLICACION_ID);
        //validarFlujo(FLUJO_ID);
    } else {
        window.document.location.href = URL_BANDEJA;
    }
    $("#txtCodigoAppPadre").focusout(function () {
        let valor = $("#hCodigoPadre").val();
        if (valor == '0') {
            $("#txtCodigoAppPadre").val('');
            toastr.error("El código de aplicación padre no es válido, por favor seleccione una aplicación que se haya registrado en el portafolio.", TITULO_MENSAJE);
        }
    });
    listarCheckListCross()
    validarFormApp();
    validarFormRechazo();
    validarFormTransferir();

    validarFormObservar();
});

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


function irObservar() {
    $("#txtDescripcionObservacion").val('');

    LimpiarValidateErrores($("#formObservar"));
    OpenCloseModal($("#modalObservar"), true);
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
                    $("#txtCodigoAppPadre").val(data.parentAPTCode);
                    $("#hCodigoPadre").val(data.parentAPTCode);
                    $("#txtNombre").val(data.applicationName);
                    $("#txtDescripcion").val(data.description);
                    $("#ddlJefatura").val(data.mainOffice || "-1");


                    $("#ddlAreaBIAN").val(data.BIANarea || "-1");
                    if (data.BIANarea != -1) {
                        cargarCombosArea(data.BIANarea);
                        $("#ddlDominioBIAN").val(data.BIANdomain);
                        $("#ddlTobe").val(data.tobe);
                    }
                    else {
                        $("#ddlDominioBIAN").val(data.BIANdomain || "-1");
                        $("#ddlTobe").val(data.tobe || "-1");
                    }

                    //if (data.assetType != null) {
                    if (data.managed != null) {
                        var gestionado = obtenerGestionadoPor(data.managed);
                        data.assetType = (getValidarValoresSelect("ddlTipoActivo", data.assetType)) ? data.assetType : 0;
                        if (gestionado.FlagUserIT == true)
                        {
                            cargarCombosUserIT();
                            $("#ddlTipoActivo").val(data.assetType);
                            $("#ddlTipoActivo").attr("disabled", "disabled");
                        }
                        else if (gestionado.Id == 30) {
                            cargarCombosAppExterna();
                            $("#ddlTipoActivo").val(data.assetType);
                            //$("#ddlTipoActivo").attr("disabled", "disabled");
                        }
                        else {
                            cargarCombosUserIT();
                            $("#ddlTipoActivo").val(data.assetType || "-1");
                        }
                    }
                    //}
                    FlagComponenteCross = data.FlagComponenteCross
                    
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
            ddlAreaBIAN: {
                requiredSelect: true
            },
            ddlDominioBIAN: {
                requiredSelect: true
            }
        },
        messages: {
            ddlTipoActivo: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlAreaBIAN: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlDominioBIAN: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "ddlTipoActivo"
                || element.attr('name') === "ddlAreaBIAN"
                || element.attr('name') === "ddlDominioBIAN"
                || element.attr('name') === "ddlTobe") {
                // element.parent().parent().append(error);
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
            ddlArquitectoNegocio: {
                requiredSelect: true
            }
            //,
            //ddlJefaturaTransferir: {
            //    requiredSelect: true
            //}
        },
        messages: {
            txtDescripcionTransferencia: {
                requiredSinEspacios: "Debes de ingresar un comentario para justificar la transferencia",
                maxlength: "El límite de caracteres esperados es de 800"
            },
            ddlArquitectoNegocio: {
                requiredSelect: "Debes de seleccionar un arquitecto evaluador"
            }
            //,
            //ddlJefaturaTransferir: {
            //    requiredSelect: "Debes de seleccionar una Jefatura ATI"
            //}
        },
        errorPlacement: (error, element) => {
            /*if (element.attr('name') === "txtDescripcionTransferencia" || element.attr('name') === "ddlArquitectoNegocio" || element.attr('name') === "ddlJefaturaTransferir") {*/
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

    data.BIANarea = getDDL($("#ddlAreaBIAN"));
    data.BIANdomain = getDDL($("#ddlDominioBIAN"));
    data.assetType = getDDL($("#ddlTipoActivo"));
    data.tobe = getDDL($("#ddlTobe"));
    data.isApproved = aprobado;
    data.actionManager = accion;
    data.parentAPTCode = $("#hCodigoPadre").val() == '0' ? "" : $("#hCodigoPadre").val();

    if (LISTA_CHECKLIST_CROSS.Rows[0].Activo == true && LISTA_CHECKLIST_CROSS.Rows[1].Activo == true ) {
        data.FlagComponenteCross =  true
    }

    if (accion != ACCION_REGISTRAR)
        data.comments = $("#txtDescripcionRechazo").val() || $("#txtDescripcionTransferencia").val() || $("#txtDescripcionObservacion").val();

    if (accion == ACCION_TRANSFERIR) {
        data.architectId = getDDL($("#ddlArquitectoNegocio"));
        data.isApproved = null;
        data.comments = $("#txtDescripcionTransferencia").val();
    }
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
        url: URL_API_VISTA + "/application/evalarchitect",
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
                    if (dataResult.BitacoraId != 0) {
                        UploadFile($("#flArchivo"), dataResult.BitacoraId);
                    }
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

function cargarCombos() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/lists/architecteval",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoActivo.filter(x => x.Descripcion !== "USER IT"), $("#ddlTipoActivo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.AreaBIAN, $("#ddlAreaBIAN"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Arquitecto, $("#ddlArquitectoNegocio"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Jefatura, $("#ddlJefatura"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Jefatura, $("#ddlJefaturaTransferir"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function cargarCombosUserIT() {
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

function cargarCombosAppExterna() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/lists/architectevalExterna",
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

function cargarCombosArea(area) {
    $("#ddlDominioBIAN").empty();
    $("#ddlTobe").empty();

    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/lists/architecteval/${area}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.DominioBIAN, $("#ddlDominioBIAN"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TOBE, $("#ddlTobe"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function changeArea() {
    cargarCombosArea($("#ddlAreaBIAN").val());
}

//function changeJefatura() {
//    cargarCombosArquitectos($("#ddlJefaturaTransferir").val());
//}

//function cargarCombosArquitectos(jefatura) {
//    $("#ddlArquitectoNegocio").empty();

//    $.ajax({
//        type: "GET",
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
//        url: URL_API_VISTA + `/application/lists/jefaturaati/${jefatura}`,
//        dataType: "json",
//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    SetItems(dataObject.Arquitecto, $("#ddlArquitectoNegocio"), TEXTO_SELECCIONE);
//                }

//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//}

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
                        $("#btnTransferirApp").hide();

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
                        }
                    }

                    if (isApproved) {
                        $("#btnRechazarApp").hide();
                        $("#btnTransferirApp").hide();
                        $("#btnRegistrarApp").hide();
                        $("#btnObservarApp").hide();

                        $("#ddlAreaBIAN").attr("disabled", "disabled");
                        $("#ddlDominioBIAN").attr("disabled", "disabled");
                        $("#ddlTipoActivo").attr("disabled", "disabled");
                        $("#ddlTobe").attr("disabled", "disabled");
                        $("#txtCodigoAppPadre").attr("disabled", "disabled");
                    }
                    else {
                        $("#btnRechazarApp").hide();
                        $("#btnObservarApp").hide();
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

function obtenerGestionadoPor(id) {
    let gestionado = null;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/managedBy/${id}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    gestionado = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return gestionado;
}

function InitInputFiles() {
    InitUpload($('#txtArchivo'), 'inputArchivo');
}

function InitUpload($inputText, classInput, btnDownload = null, btnRemove = null) {
    var inputs = document.querySelectorAll(`.${classInput}`);
    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener('change', function (e) {
            var fileName = '';
            if (this.files && this.files.length > 1) {
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            } else {
                if (this.files && this.files.length == 1) {
                    if (btnDownload != null) btnDownload.show();
                    if (btnRemove != null) btnRemove.show();
                } else {
                    if (btnDownload != null) btnDownload.hide();
                    if (btnRemove != null) btnRemove.hide();
                }
                fileName = e.target.value.split('\\').pop();
            }

            if (fileName)
                $inputText.val(fileName);
            else
                label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
}

function UploadFile($fileInput, idBitacora) {
    let formData = new FormData();
    let ConformidadGST = $fileInput.get(0).files;

    formData.append("File1", ConformidadGST[0]);
    formData.append("BitacoraId", idBitacora);

    if (ConformidadGST.length > 0) {
        $.ajax({
            url: URL_API + "/File/upload6",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                OpenCloseModal($("#modalTransferir"), false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }, async: false
        });
    }
}

function listarCheckListCross() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/ListarCheckListCross",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    LISTA_CHECKLIST_CROSS = dataObject;
                    if (FlagComponenteCross) {
                        LISTA_CHECKLIST_CROSS.Rows[0].Activo = true;
                        LISTA_CHECKLIST_CROSS.Rows[1].Activo = true;
                    }
                    $table.bootstrapTable('destroy');
                    $table.bootstrapTable({
                        data: dataObject.Rows,
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

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let btnEstado = `<a href="javascript:cambiarEstado(${row.Id}, ${row.Activo})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    return btnEstado.concat("&nbsp;&nbsp;");
}

function cambiarEstado(Id, estadoActual) {
    const rowIndex = LISTA_CHECKLIST_CROSS.Rows.findIndex(row => row.Id === Id);
    estadoActual = !estadoActual; 
    if (rowIndex !== -1) {
        LISTA_CHECKLIST_CROSS.Rows[rowIndex].Activo = estadoActual;
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            data: LISTA_CHECKLIST_CROSS.Rows,
        });
    }
}

