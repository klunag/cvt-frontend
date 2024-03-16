const URL_API_VISTA = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Portafolio de Aplicaciones";
const MENSAJE = "¿Estás seguro de modificar la aplicación?, al aceptar se realizará su registro parcial y se enviaran las solicitudes de revisión y aprobación a los responsables. Así mismo, podrás usar el código de aplicación para iniciar el aprovisionamiento de tus recursos.";
const MENSAJE_CONFIRMACION = "Se modificó la aplicación de manera parcial. Recuerda que es necesario que completes todos los datos de tu aplicación  para que tenga la  aprobación de todos los responsables y complete su registro en portafolio. Cuentas con un plazo máximo de 2 días apartir de la fecha de registro.  ¿Deseas completar los datos?";
const ID_USERIT = 1;
var cambiarInterface = true;
var gestionadoPor = [];


var CodigoAPT;
var CodigoInterfaz;
$(function () {
    $("#txtCodigoInterfaz").hide();
    $("#btnRegistrarApp").click(guardarAddOrEditApp);
    validarFormApp();

    FormatoCheckBox($("#divFlagInterface"), "ckbInterface");
    //$("#ckbInterface").change(FlagInterface_Change);

    FormatoCheckBox($("#divFlagInterface"), "ckbInterface");
    $("#ckbInterface").change(FlagInterface_Change);
    cargarCombos();
    cargarToolbox();
    if (APLICACION_ID !== 0) {
        editarAplicacion(APLICACION_ID);
    }
    //CHC: faltaba el $()
    //LimpiarValidateErrores("#formAddOrEditApp");    
    LimpiarValidateErrores($("#formAddOrEditApp"));
    //CodigoAPT = generarCodigoAPT()
    //while (ExisteCodigoAPT(CodigoAPT)) {
    //    CodigoAPT = generarCodigoAPT()
    //}
    //$("#txtCodigoAPT").val(CodigoAPT);

    InitAutocompletarBuilder($("#txtCodigoAppPadre"), $("#hCodigoPadre"), ".containerAplicacion", "/applicationportfolio/application/filter?filtro={0}&codigoAPT=");
    setDefaultHd($("#txtCodigoAppPadre"), $("#hCodigoPadre"));
    $("#ddlGestionadoPor").change(GestionadoPor_Change);
});

function editarAplicacion(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/application/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;

                    //Primera Tab

                    $("#txtCodigoAPT").val(data.applicationId);
                    $("#ddlGestionadoPor").val(data.managed || "-1");

                  
                    $("#txtNombre").val(data.applicationName);
                    $("#ddlTipoImplementacion").val(data.implementationType || "-1");
                    $("#txtDescripcion").val(data.description);
                    $("#ddlModeloEntrega").val(data.deploymentType || "-1");
                    if (data.parentAPTCode != '') {
                        $("#txtCodigoAppPadre").val(data.parentAPT);
                        $("#hCodigoPadre").val(data.parentAPTCode);
                    }
                    $("#ddlEstadoAplicacion").val(data.status || "-1");
                    $("#ddlArquitectoNegocio").val(data.architecId || "-1");
                    $("#ckbInterface").prop('checked', data.hasInterfaceId);
                    $("#ckbInterface").bootstrapToggle(data.hasInterfaceId ? 'on' : 'off');
                    if (data.hasInterfaceId) {
                        $("#txtCodigoInterfaz").val(data.interfaceId);
                        $("#txtCodigoInterfaz").show();
                        $("#ckbInterface").attr("disabled", "disabled");
                        cambiarInterface = false;
                    }
                    else
                        cambiarInterface = true;


                    $("#hdAplicacionId").val(APLICACION_ID);
              


                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function GestionadoPor_Change() {
    let userIT = $("#ddlGestionadoPor").val();
    if (userIT == ID_USERIT)
        $(".divInterfaz").hide();
    else
        $(".divInterfaz").show();
}

function FlagInterface_Change() {

    var flag = $(this).prop("checked");
    if (flag) {
        $("#txtCodigoInterfaz").show();
        CodigoInterfaz = generarCodigoInterfaz();
        CodigoInterfaz = ExisteCodigoInterfaz(CodigoInterfaz);
        //while (ExisteCodigoInterfaz(CodigoInterfaz)) {
        //    CodigoInterfaz = generarCodigoInterfaz()
        //}
        $("#txtCodigoInterfaz").val(CodigoInterfaz);
    }
    else {
        $("#txtCodigoInterfaz").hide();
        $("#txtCodigoInterfaz").val("");
    }
}

function guardarAddOrEditApp() {
    //CHC: la primera linea le estaba agregando la clase ignore a todos los inputs con clase form-control. la clase ignore se usa para
    //     decirle al validate que no tome en cuenta esos inputs
    //$(".form-control").addClass("ignore");
    //$(".input-registro").removeClass("ignore");
    let registroValido = true;
    if ($("#txtCodigoAppPadre").val() != '')
        registroValido = ($("#txtCodigoAppPadre").val() != '' && $("#hCodigoPadre").val() != "0");

    if (registroValido) {
        if ($("#formAddOrEditApp").valid()) {
            bootbox.confirm({
                title: TITULO_MENSAJE,
                message: MENSAJE,
                buttons: SET_BUTTONS_BOOTBOX,
                callback: function (result) {
                    result = result || null;
                    if (result !== null && result) {
                        let codigoApt = $.trim($("#txtCodigoApt").val());
                        if (!ExisteCodigoAPT(codigoApt)) {
                            sendDataFormAPI($("#formAddOrEditApp"),
                                $("#btnRegistrarApp"),
                                "Registrado correctamente");
                        }
                        else {
                            MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación ya fue registrado, se acaba de asignar un nuevo código de aplicación a su solicitud para que lo puedas volver a registrar y/o enviar.");

                        }
                    }
                }
            });
        }
    }
    else {
        toastr.error("El código de aplicación padre no es válido, por favor seleccione una aplicación que se haya registrado en el portafolio.", TITULO_MENSAJE);
    }
}

function LimpiarValidateErrores(form) {
    form.validate().resetForm();
}

function validarFormApp() {
    $.validator.addMethod("existeCodigoAPT", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteCodigoAPT(valor);
            return estado;
        }
        return estado;
    });

    //$.validator.addMethod("existeNombreAplicacion", function (value, element) {
    //    let estado = true;
    //    let valor = $.trim(value);
    //    if (valor !== "" && valor.length > 3) {
    //        estado = !ExisteNombreAplicacion(valor);
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

            txtCodigoAppPadre: {
                minlength: 4
            },
            txtNombre: {
                requiredSinEspacios: true
            },
            txtDescripcion: {
                requiredSinEspacios: true
            },
            ddlGestionadoPor: {
                requiredSelect: true
            },
            ddlTipoImplementacion: {
                requiredSelect: true
            },
            ddlModeloEntrega: {
                requiredSelect: true
            },
            ddlEstadoAplicacion: {
                requiredSelect: true
            },
            ddlArquitectoNegocio: {
                requiredSelect: true
            }
        },
        messages: {

            txtCodigoAppPadre: {
                minlength: "El código de aplicación debe de tener 4 caracteres"
            },
            txtNombre: {
                requiredSinEspacios: "Debes de ingresar un nombre para esta aplicación",
                existeNombreAplicacion: "El nombre de la aplicación ya existe"
            },
            txtDescripcion: {
                requiredSinEspacios: "Debes de ingresar una descripción detallada de esta aplicación"
            },
            ddlGestionadoPor: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlTipoImplementacion: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlModeloEntrega: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlEstadoAplicacion: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlArquitectoNegocio: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtCodigoAPT" || element.attr('name') === "txtNombre" || element.attr('name') === "txtDescripcion") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function CrearObjAplicacion() {
    var data = {};
    data.Id = 0;
    data.applicationId = $.trim($("#txtCodigoAPT").val()).toUpperCase();
    data.managed = getDDL($("#ddlGestionadoPor")); // $("#ddlGerenciaCentral").val(); ////cvt.Aplicacion
    data.applicationName = $.trim($("#txtNombre").val()).toUpperCase(); // $("#ddlDivision").val(); //cvt.Aplicacion
    data.implementationType = getDDL($("#ddlTipoImplementacion")); // $("#ddlArea").val(); //cvt.Aplicacion
    data.description = $.trim($("#txtDescripcion").val()); //cvt.Aplicacion
    data.deploymentType = getDDL($("#ddlModeloEntrega")); //cvt.Aplicacion
    data.parentAPTCode = $.trim($("#hCodigoPadre").val()).toUpperCase(); //$.trim($("#txtNombreApp").val()); //cvt.Aplicacion
    data.status = getDDL($("#ddlEstadoAplicacion")); //$.trim($("#txtDesApp").val()); //cvt.Aplicacion
    data.hasInterfaceId = $("#ckbInterface").prop("checked");
    data.architectId = getDDL($("#ddlArquitectoNegocio")); //$("#ddlAreaBIAN").val();  //cvt.Aplicacion
    data.interfaceId = $.trim($("#txtCodigoInterfaz").val()).toUpperCase();

    return data;
}


function sendDataFormAPI($form, $btn, title) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjAplicacion();

    $.ajax({
        url: URL_API_VISTA + "/application/reversion",
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
                        bootbox.confirm({
                            message: MENSAJE_CONFIRMACION,
                            buttons: {
                                confirm: {
                                    label: 'Si, completar',
                                    className: 'btn-success'
                                },
                                cancel: {
                                    label: 'Grabar y completar luego',
                                    className: 'btn-danger'
                                }
                            },
                            callback: function (result) {
                                if (result)
                                    window.document.location.href = "DetalleAplicacion/" + dataResult.AplicacionId;
                                else
                                    window.document.location.href = "Bandeja";
                            }
                        });

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

function ExisteCodigoAPT(codigoAPT) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/exists?id=${codigoAPT}`,
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

function ExisteNombreAplicacion(nombre) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/existsByName?id=${nombre}`,
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

function getDDL($ddl) {
    return $ddl.val() !== "-1" ? $ddl.val() : null;
}

function generarCodigoAPT() {
    var length = 4;
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function ExisteCodigoAPT(codigo) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/ExisteCodigoAPT?codigo=${codigo}`,
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

function generarCodigoInterfaz() {
    var length = 2;
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function ExisteCodigoInterfaz(codigo) {
    let estado = "";
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/ExisteCodigoInterfaz?codigo=${codigo}`,
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

function cargarCombos() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/stepone/lists",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoImplementacion, $("#ddlTipoImplementacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Arquitecto, $("#ddlArquitectoNegocio"), TEXTO_SELECCIONE);
                    SetItems(dataObject.GestionadPor, $("#ddlGestionadoPor"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ModeloEntrega, $("#ddlModeloEntrega"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
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
