const URL_API_VISTA = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Portafolio de Aplicaciones";
const MENSAJE_APROBAR = "¿Estás seguro de confirmar los datos de la aplicación?";
const MENSAJE_RECHAZAR = "¿Estás seguro de rechazar la solicitud y notificar al solicitante sobre ello?";
const MENSAJE_CONFIRMACION = "Se actualizó la aplicación de manera satisfactoria.";
const MENSAJE_TRANSFERIR = "¿Estás seguro de transferir la solicitud y notificar al arquitecto de tecnología asignado?";
const MENSAJE_OBSERVAR = "¿Estás seguro de enviar el comentario al solicitante (se notificará por correo electrónico)?";
const TIPO_WEB = 154;

$(function () {
    cargarCombos();
    cargarToolbox();
    InitInputFiles();
    $("#btnRegistrarApp").click(guardarAddOrEditApp);
    $("#btnRechazarApp").click(irRechazar);
    $("#btnObservarApp").click(irObservar);
    $("#btnTransferirApp").click(irTransferir);
    $("#btnProcesarTransferencia").click(guardarTransferirApp);

    $("#btnProcesarRechazo").click(guardarRechazoApp);
    $("#btnProcesarObservacion").click(guardarObservarApp);

    if (APLICACION_ID !== 0) {
        editarAplicacion(APLICACION_ID);
        //validarFlujo(FLUJO_ID);
    } else {
        window.document.location.href = URL_BANDEJA;
    }

    validarFormApp();
    validarFormRechazo();
    validarFormObservar();
    validarFormTransferir();
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


function irRechazar() {
    $("#txtDescripcionRechazo").val('');
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

                    data.technologyCategory = (getValidarValoresSelect("ddlCategoria", data.technologyCategory)) ? data.technologyCategory : 0;
                    $("#ddlCategoria").val(data.technologyCategory || "-1");
                    $("#ddlClasificacion").val(data.technicalClassification || "-1");
                    if (data.technicalClassification!=null)
                        cargarCombosSubclasificacion(data.technicalClassification);

                    $("#ddlSubClasificacion").val(data.technicalSubclassification || "-1");

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

function LimpiarValidateErrores(form) {
    form.validate().resetForm();
}

function validarFormApp() {

    $.validator.addMethod("subClasRequired", function (value, element) {
        var length = $('#ddlSubClasificacion > option').length;
        let estado = true;

        let valor = $.trim(value);

        if (length == 1) {
            return estado;
        }
        else {
            if ($('#ddlSubClasificacion').val() != -1) {
                return estado;
            }
            else
                return !estado;
        }

    });

    $("#formAddOrEditApp").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlCategoria: {
                requiredSelect: true
            }
        },
        messages: {
            ddlCategoria: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "ddlCategoria"
                || element.attr('name') === "ddlClasificacion" || element.attr('name') === "ddlSubClasificacion") {
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

function validarFormTransferir() {

    //$.validator.addMethod("requiredArchivo", function (value, element) {
    //    return $.trim(value) !== "";
    //});

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
            ddlArquitectoTi: {
                requiredSelect: true
            }
            //,
            //flArchivo: {
            //    requiredArchivo: true
            //}
        },
        messages: {
            txtDescripcionTransferencia: {
                requiredSinEspacios: "Debes de ingresar un comentario para justificar la transferencia",
                maxlength: "El límite de caracteres esperados es de 800"
            },
            ddlArquitectoTi: {
                requiredSelect: "Debes de seleccionar un arquitecto de tegnología"
            }
            //,
            //flArchivo: {
            //    requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo")
            //}
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDescripcionTransferencia" || element.attr('name') === "ddlArquitectoTi") {
                element.parent().append(error);
                //} else if (element.attr('name') === "txtArchivo" || element.attr('name') === "flArchivo") {
                //    element.parent().parent().parent().parent().append(error);
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
    data.technologyCategory = getDDL($("#ddlCategoria"));

    if (data.technologyCategory != TIPO_WEB) {
        data.webDomain = 'NO APLICA';
    }

    data.isApproved = aprobado;
    data.actionManager = accion;

    if (accion != ACCION_REGISTRAR)
        data.comments = $("#txtDescripcionRechazo").val() || $("#txtDescripcionObservacion").val();

    if (accion == ACCION_TRANSFERIR) {
        data.architectTechnology = getDDL($("#ddlArquitectoTi"));
        data.comments = $("#txtDescripcionTransferencia").val();
        data.isApproved = null;
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
        url: URL_API_VISTA + "/application/architectit",
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
                        UploadFileTI($("#flArchivo"), dataResult.BitacoraId);
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

function cargarCombos() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/lists/architectit",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Categoria, $("#ddlCategoria"), TEXTO_SELECCIONE);
                    /*SetItems(dataObject.Clasificacion, $("#ddlClasificacion"), TEXTO_SELECCIONE); */
                    SetItems(dataObject.TipoActivo, $("#ddlTipoActivo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ArquitectosTecnologia, $("#ddlArquitectoTi"), TEXTO_SELECCIONE);
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
                    if (isApproved != true) {
                        if (data.isCompleted) {
                            $("#btnRechazarApp").hide();
                            $("#btnRegistrarApp").hide();

                            $("#ddlCategoria").attr("disabled", "disabled");
                            //$("#ddlClasificacion").attr("disabled", "disabled");
                            //$("#ddlSubClasificacion").attr("disabled", "disabled");

                            if (data.isApproved) {
                                $("#btnRegistrarApp").show();
                                $("#ddlCategoria").removeAttr("disabled");
                                //$("#ddlClasificacion").removeAttr("disabled");
                                //$("#ddlSubClasificacion").removeAttr("disabled");
                            }
                        }
                    }
                    else
                        $("#btnObservarApp").hide();
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function cargarCombosSubclasificacion(clasificacion) {
    $("#ddlSubClasificacion").empty();
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/technicalClassification/${clasificacion}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.SubClasificacion, $("#ddlSubClasificacion"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
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

function UploadFileTI($fileInput, idBitacora) {
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