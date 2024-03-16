const URL_API_VISTA = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Portafolio de Aplicaciones";
const MENSAJE_APROBAR = "¿Estás seguro de actualizar los datos de la aplicación y aprobar el cambio?";
const MENSAJE_RECHAZAR = "¿Estás seguro de rechazar la solicitud y notificar al solicitante sobre ello?";
const MENSAJE_CONFIRMACION = "Se actualizó la aplicación de manera satisfactoria.";
const MENSAJE_TRANSFERIR = "¿Estás seguro de transferir la solicitud y notificar al Owner asignado?";
var $table = $("#tblRegistro");
var control = 0;
var OWNER_LIST = [];
var indexActual = 0;
const MENSAJE_OBSERVAR = "¿Estás seguro de enviar el comentario al solicitante (se notificará por correo electrónico)?";

var ROLES_LIST = [];
var NUEVOS_ROLES_LIST = [];
var NUEVOS_Expertos = [];
var $table2 = $("#tblNuevoOwner");

var lstHorarioFuncionamiento;

let userCount = 0;
$(function () {

    getCurrentUser();
});
$(document).ajaxComplete(function () {
    if (userCurrent != null && userCount == 0) {
        userCount++;
        cargarCombos();
        cargarToolbox();
        InitInputFiles();
        $("#msjUsuarioRepetido").hide();
        InitAutocompletarUsuariosLocal($("#txtAutorizador"), $("#hAutorizadorId"), ".divUsuarioAutorizadorContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
        InitAutocompletarUsuariosLocal2($("#txtNuevoOwner"), $("#hNuevoOwnerId"), ".divUsuarioAutorizadorContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");

        FormatoCheckBox($("#divFlagUsuario"), "ckbFlagUsuario");
        $("#ckbFlagUsuario").change(FlagUsuario_Change);

        $("#btnRegistrarApp").click(guardarAddOrEditApp);
        $("#btnRechazarApp").click(irRechazar);
        $("#btnObservarApp").click(irObservar);
        $("#btnTransferirApp").click(irTransferir);
        $("#btnProcesarObservacion").click(guardarObservarApp);

        $("#btnProcesarRechazo").click(guardarRechazoApp);
        $("#btnProcesarTransferencia").click(guardarTransferirApp);

        if (APLICACION_ID !== 0) {
            editarAplicacion(APLICACION_ID);
            //validarFlujo(FLUJO_ID);
        } else {
            window.document.location.href = URL_BANDEJA;
        }

        ListarOwners();

        $("#txtAutorizador").focusout(function () {
            let valor = $("#txtAutorizador").val().length;
            if (valor != control)
                $("#txtAutorizador").val('');
        });

        $("#txtNuevoOwner").focusout(function () {
            let valor = $("#txtNuevoOwner").val().length;
            if (valor != control)
                $("#txtNuevoOwner").val('');
        });

        $("#ddlHorarioFuncionamiento").change(horarioFuncionamiento_Change);

        validarFormApp();
        validarFormRechazo();
        validarFormTransferir();
        indexActual = OWNER_LIST.length;
    }
    waitingDialog.hide();
});

//let userCount = 0;
//$(document).ajaxComplete(function () {
//    if (userCurrent != null && userCount == 0) {
//        userCount++;

//        if (APLICACION_ID !== 0) {
//            editarAplicacion(APLICACION_ID);
//        } else {
//            window.document.location.href = URL_BANDEJA;
//        }
//    }

//});

function irObservar() {
    $("#txtDescripcionObservacion").val('');

    LimpiarValidateErrores($("#formObservar"));
    OpenCloseModal($("#modalObservar"), true);
}

function irTransferir() {
    $("#txtDescripcionRechazo").val('');
    $("#txtDescripcionTransferencia").val('');
    $("#txtNuevoOwner").val('');
    LimpiarValidateErrores($("#formTransferir"));
    OpenCloseModal($("#modalTransferir"), true);
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
        complete: function (data) {
            waitingDialog.hide();
        },
        async: false
    });
}


function FlagUsuario_Change() {

    var flag = $(this).prop("checked");
    if (flag) {
        //$("#txtAutorizador").attr("disabled", "disabled"); 
        $("#txtAutorizador").val(userCurrent.Nombres);
        $("#hAutorizadorId").val(userCurrent.Matricula);
        $("#hAutorizadorMatricula").val(userCurrent.Matricula);
        $("#hAutorizadorCorreo").val(userCurrent.CorreoElectronico);
        var obj = { username: userCurrent.Matricula, managerName: userCurrent.Nombres, email: userCurrent.CorreoElectronico };
        OWNER_LIST.push(obj);
        indexActual = OWNER_LIST.length;
        $table.bootstrapTable('destroy');

        $('table').bootstrapTable({
            data: OWNER_LIST
        });
    }
    else {
        $("#txtAutorizador").removeAttr("disabled");
        $("#txtAutorizador").val("");
        $("#hAutorizadorId").val("");
        $("#hAutorizadorMatricula").val("");
        $("#hAutorizadorCorreo").val("");
        OWNER_LIST.splice((indexActual - 1), 1);
        $table.bootstrapTable('destroy');

        $('table').bootstrapTable({
            data: OWNER_LIST
        });
    }
}


function irRechazar() {
    $("#txtDescripcionRechazo").val('');
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
                    let data = dataObject;

                    $("#hdAplicacionId").val(APLICACION_ID);
                    $("#hdFlujoId").val(FLUJO_ID);
                    $("#txtCodigoAPT").val(data.applicationId);
                    $("#txtNombre").val(data.applicationName);
                    $("#txtDescripcion").val(data.description);
                    $("#ddlTipoActivo").val(data.assetType || "-1");

                    $("#txtAutorizador").val(data.authorizedName);
                    $("#hAutorizadorMatricula").val(data.authorizedId);
                    $("#hAutorizadorCorreo").val(data.authorizedEmail);

                    if (data.operatingHours === null) {
                        $("#ddlHorarioFuncionamiento").val("-1");
                    } else {
                        if (data.operatingHours != '' || data.operatingHours != null) {
                            let idOtroHorario = -1;
                            for (const element of lstHorarioFuncionamiento) {
                                if (element.Descripcion == "otro horario")
                                    idOtroHorario = element.Id;
                                if (data.operatingHours == element.Descripcion) {
                                    $("#ddlHorarioFuncionamiento").val(element.Id);
                                    $("#txtHorarioFuncionamiento").val("");
                                    $("#divHorarioFuncionamiento").css("display", "none");
                                    break;
                                }
                                else {
                                    $("#ddlHorarioFuncionamiento").val(idOtroHorario);
                                    $("#divHorarioFuncionamiento").css("display", "block");
                                    $("#txtHorarioFuncionamiento").val(data.operatingHours);
                                }
                            }
                        } else $("#ddlHorarioFuncionamiento").val("-1");
                    }

                    //if (data.operatingHours != '' && data.operatingHours != null) {
                    //    let horasFuncionamiento = data.operatingHours.split('|');
                    //    $("#horaInicio").val(horasFuncionamiento[0]);
                    //    $("#horaFin").val(horasFuncionamiento[1]);
                    //}

                    $("#lblOwner").html(userCurrent.Nombres);
                    if (data.authorizedName != '' && data.authorizedName != null)
                        control = data.authorizedName.length;

                    if (data.isApproved == true)
                        $("form :input").attr("disabled", "disabled");

                    validarFlujo(FLUJO_ID, data.isApproved);

                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        complete: function (result) {
            waitingDialog.hide();
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
        if ($("#hAutorizadorMatricula").val() != '0' && $("#hAutorizadorMatricula").val() != '') {
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
        else
            toastr.error("Se debe de seleccionar un usuario autorizador válido", TITULO_MENSAJE);
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
    var result = true;
    if (ROLES_LIST.length == 0) {
        toastr.error("Es requerido que indique a la persona encarga de aprobación", "Portafolio de aplicaciones BCP");
        $('#txtNuevoOwner').focus();
        result = false;
    }
    MENSAJE = "¿Estás seguro de actualizar los datos de la aplicación?";
    if (result == true) {
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
}

function LimpiarValidateErrores(form) {
    form.validate().resetForm();
}

function validarFormApp() {

    $.validator.addMethod("sinOwners", function (value, element) {
        if (Array.isArray(OWNER_LIST) && OWNER_LIST.length) { return true; }
        else return false;
    });
    $.validator.addMethod("otroHorario", function (value, element) {
        if ($("#ddlHorarioFuncionamiento option:selected").text() == 'otro horario') {
            if ($("#txtHorarioFuncionamiento").val() != "") {
                return true;
            } else return false;
        } else return true;
    });
    //$.validator.addMethod("menorQue", function (value, element) {
    //    let horaInicioApp = $("#horaInicio").val() == "" ? 0000 : Number($("#horaInicio").val().replace(/:/g, ''));
    //    let horaFinApp = $("#horaFin").val() == "" ? 0000 : Number($("#horaFin").val().replace(/:/g, ''));
    //    if (horaInicioApp >= horaFinApp) { return false; }
    //    else return true;
    //});
    //$.validator.addMethod("mayorQue", function (value, element) {
    //    let horaInicioApp = $("#horaInicio").val() == "" ? 0000 : Number($("#horaInicio").val().replace(/:/g, ''));
    //    let horaFinApp = $("#horaFin").val() == "" ? 0000 : Number($("#horaFin").val().replace(/:/g, ''));
    //    if (horaFinApp <= horaInicioApp) { return false; }
    //    else return true;
    //});

    $("#formAddOrEditApp").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtAutorizador: {
                sinOwners: true
            },
            hAutorizadorMatricula: {
                requiredSinEspacios: true
            },
            ddlHorarioFuncionamiento: {
                requiredSelect: true
            },
            txtHorarioFuncionamiento: {
                otroHorario: true
            }
            //,
            //horaInicio: {
            //    requiredSinEspacios: true,
            //    menorQue: true
            //},
            //horaFin: {
            //    requiredSinEspacios: true,
            //    mayorQue: true
            //}
        },
        messages: {
            txtAutorizador: {
                sinOwners: "Debes de ingresar un usuario autorizador a la lista"
            },
            hAutorizadorMatricula: {
                requiredSinEspacios: "Debes de ingresar un usuario autorizador válido"
            },
            ddlHorarioFuncionamiento: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            txtHorarioFuncionamiento: {
                otroHorario: "debe Ingresar un horario"
            }
            //,
            //horaInicio: {
            //    requiredSinEspacios: "Debes de ingresar una hora de Inicio",
            //    menorQue: "La hora de inicio debe ser menor que la hora de fin"
            //},
            //horaFin: {
            //    requiredSinEspacios: "Debes de ingresar una hora de Fin",
            //    mayorQue: "La hora de fin debe ser mayor que la hora de inicio"
            //}
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtAutorizador" || element.attr('name') === "ddlHorarioFuncionamiento") {
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
            }
            //,
            //flArchivo: {
            //    requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo")
            //}
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDescripcionTransferencia") {
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
    data.technicalClassification = getDDL($("#ddlClasificacion"));
    data.technicalSubclassification = $("#txtSubclasificacion").val();

    data.authorizedName = $("#txtAutorizador").val();
    data.authorizedId = $("#hAutorizadorMatricula").val();
    data.authorizedEmail = $("#hAutorizadorCorreo").val();

    if ($("#ddlHorarioFuncionamiento option:selected").text() == 'otro horario') {
        data.operatingHours = $("#txtHorarioFuncionamiento").val();
    } else {
        if ($("#ddlHorarioFuncionamiento option:selected").text() == '-- Seleccione --') {
            data.operatingHours = null
        } else
            data.operatingHours = $("#ddlHorarioFuncionamiento option:selected").text();
    }

    data.isApproved = aprobado;
    data.actionManager = accion;
    data.Owners = OWNER_LIST;
    data.RegistroOModificacion = 1;

    if (accion != ACCION_REGISTRAR)
        data.comments = $("#txtDescripcionRechazo").val() || $("#txtDescripcionObservacion").val();

    if (accion == ACCION_TRANSFERIR) {
        data.isApproved = null;
        data.emailCustodio = ROLES_LIST[0].email;
        data.Matricula = ROLES_LIST[0].username;
        data.expertName = ROLES_LIST[0].managerName;
        data.comments = $("#txtDescripcionTransferencia").val();
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
        url: URL_API_VISTA + "/application/owner",
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
            waitingDialog.hide();
            if ($btn !== null) {
                $btn.button("reset");
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
                            $("#btnTransferirApp").hide();
                            $("#txtAutorizador").attr("disabled", "disabled")

                            if (data.isApproved) {
                                $("#btnRegistrarApp").show();
                                $("#txtAutorizador").removeAttr("disabled");
                            }
                        }
                    }
                    else {
                        $("#btnObservarApp").hide();
                    }

                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        complete: function (result) {
            waitingDialog.hide();
        },
        async: false
    });
}

function InitAutocompletarUsuariosLocal($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: urlControllerWithParams,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (data) {
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else
                return response(true);
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.displayName);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox != null) {
                $IdBox.val(ui.item.id);
                $("#hAutorizadorCorreo").val(ui.item.mail);
                $("#hAutorizadorMatricula").val(ui.item.matricula);
                control = ui.item.displayName.length;
                var data = { username: ui.item.matricula, managerName: ui.item.displayName, applicationManagerId: 3, email: ui.item.mail }
                var flag = 0;
                //$.each(OWNER_LIST, function (index, value) {
                //    if (OWNER_LIST[index].username == data.username) {
                //        flag = 1;
                //        $("#msjUsuarioRepetido").show();
                //    }
                //});

                //if (flag == 0) {
                OWNER_LIST.push(data); $("#msjUsuarioRepetido").hide();
                //}
                $table.bootstrapTable('destroy');
                $('table').bootstrapTable({
                    data: OWNER_LIST
                });
                $('#txtAutorizador').val("");
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function cargarCombos() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/lists/owner",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoActivo, $("#ddlTipoActivo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.HorarioFuncionamiento, $("#ddlHorarioFuncionamiento"), TEXTO_SELECCIONE);
                    lstHorarioFuncionamiento = dataObject.HorarioFuncionamiento;
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        async: false
    });
}


function ListarOwners() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/application/owners",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: 1,
        pageSize: 10,
        pageList: OPCIONES_PAGINACION,
        sortName: 'managerName',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Id = APLICACION_ID;
            DATA_EXPORTAR.pageNumber = 1;
            DATA_EXPORTAR.pageSize = 10;
            DATA_EXPORTAR.sortName = '';
            DATA_EXPORTAR.sortOrder = '';

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            data.Rows.forEach(element => OWNER_LIST.push(element));
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
        complete: function (data) {
            waitingDialog.hide();
        }
    });

    $('table').bootstrapTable({
        data: OWNER_LIST
    });
}

function opcionesFormatter(value, row) {


    verOwner = `<a href=# onclick="javascript:eliminarOwner('${row.username}')" title="Elimnar Owner de lista"><i class="glyphicon glyphicon-remove table-icon"></i></a>`;

    return verOwner;
}

function eliminarOwner(username) {

    $.each(OWNER_LIST, function (index, value) {
        if (OWNER_LIST[index].username == username) {
            OWNER_LIST.splice(index, 1);
        }
    });
    $table.bootstrapTable('destroy');

    $('table').bootstrapTable({
        data: OWNER_LIST
    });

}

function InitAutocompletarUsuariosLocal2($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: urlControllerWithParams,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (data) {
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else
                return response(true);
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.displayName);


            return false;
        },
        select: function (event, ui) {
            if ($IdBox != null) {
                $IdBox.val(ui.item.id);
                //$("#hAutorizadorCorreo").val(ui.item.mail);
                GetPersonaSIGA(ui.item.matricula);

                if (EmailPersona != null) {
                    $("#hAutorizadorCorreo").val(EmailPersona);
                    var data = { username: ui.item.matricula, managerName: NombrePersona, applicationManagerId: 6, email: EmailPersona, applicationManagerIdDetail: "Experto" }
                } else {
                    $("#hAutorizadorCorreo").val(ui.item.mail);
                    var data = { username: ui.item.matricula, managerName: ui.item.displayName, applicationManagerId: 6, email: ui.item.mail, applicationManagerIdDetail: "Experto" }
                }
                $("#hAutorizadorMatricula").val(ui.item.matricula);

                $("#txtNuevoOwner").val("");
                control = ui.item.displayName.length;

                var flag = 0;
                $.each(ROLES_LIST, function (index, value) {
                    if (ROLES_LIST[index].username == data.username && ROLES_LIST[index].applicationManagerId == data.applicationManagerId) {
                        flag = 1;
                        $("#msjUsuarioRepetido").show();
                    }
                });

                if (flag == 0) {
                    if (ROLES_LIST.length >= 1) {
                        return;
                    }
                    else {
                        ROLES_LIST.push(data);

                        NUEVOS_Expertos.push(data);

                        NUEVOS_ROLES_LIST.push(data);
                        $("#msjUsuarioRepetido").hide();
                    }
                }
                $table2.bootstrapTable('destroy');
                $('table').bootstrapTable({
                    data: ROLES_LIST
                });
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function GetPersonaSIGA(matricula) {
    let data = CrearObjPersona(matricula);

    $.ajax({
        url: URL_API_VISTA + `/application/Gerencia/getPersonaSIGA`,
        data: JSON.stringify(data),
        type: "POST",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject, $("#ddlUnidadesOwner"), TEXTO_SELECCIONE);
                    NombrePersona = dataObject.Nombre;
                    EmailPersona = dataObject.Correo;
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function CrearObjPersona(matricula) {
    var data = {};
    data.Matricula = matricula;
    return data;
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

function horarioFuncionamiento_Change() {
    if ($("#ddlHorarioFuncionamiento option:selected").text() == 'otro horario') {
        $("#divHorarioFuncionamiento").css("display", "block");
    } else {
        $("#divHorarioFuncionamiento").css("display", "none");
        $("#txtHorarioFuncionamiento").val('');
    }
}