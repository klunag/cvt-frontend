const URL_API_VISTA = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Portafolio de Aplicaciones";
const MENSAJE = "¿Estás seguro de registrar la aplicación?, al aceptar se realizará su registro parcial y se enviaran las solicitudes de revisión y aprobación a los responsables. Así mismo, podrás usar el código de aplicación para iniciar el aprovisionamiento de tus recursos.";
const MENSAJE_CONFIRMACION = "Se registró la aplicación de manera parcial. Recuerda que es necesario que completes todos los datos de tu aplicación  para que tenga la  aprobación de todos los responsables y complete su registro en portafolio. Cuentas con un plazo máximo de 2 días apartir de la fecha de registro.  ¿Deseas completar los datos?";
const MENSAJE_GOBIERNO_USERIT = "Este mensaje tiene que ser proporcionado por Gobierno UserIT ya que se cambia el Gestionado Por a UserIT";

const ID_USERIT = 1;

var gestionadoPor = [];
var cargaInicial = true;
var APLICACION_ID = 0;

var CodigoAPT;
var CodigoInterfaz;
$(function () {
    $(".divRowOwner").hide();
    $("#txtCodigoInterfaz").hide();
    $("#btnRegistrarApp").click(guardarAddOrEditApp);
    validarFormApp();
    FormatoCheckBox($("#divFlagInterface"), "ckbInterface");  
    $("#ckbInterface").change(FlagInterface_Change);
    cargarCombos();
    cargarToolbox();
    //CHC: faltaba el $()
    //LimpiarValidateErrores("#formAddOrEditApp");    
    LimpiarValidateErrores($("#formAddOrEditApp")); 
    CodigoAPT = generarCodigoAPT()
    while (ExisteCodigoAPT(CodigoAPT)) {
        CodigoAPT = generarCodigoAPT()
    }
    $("#txtCodigoAPT").val(CodigoAPT);

    InitAutocompletarBuilder($("#txtCodigoAppPadre"), $("#hCodigoPadre"), ".containerAplicacion", "/applicationportfolio/application/filter?filtro={0}&codigoAPT=");
    InitAutocompletarEstandarBuilder($("#txtUnidad"), $("#hdUnidadId"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro?filtro={0}&filtroPadre=");
    InitAutocompletarBuilderLocalAD($("#txtOwner"), $("#hdOwnerId"), ".divUnidadContainer", "/userSIGA/{0}");
    setDefaultHd($("#txtCodigoAppPadre"), $("#hCodigoPadre"));
    $("#ddlGestionadoPor").change(GestionadoPor_Change);

    var Unidad_Id

    $("#txtUnidad").change(function () {
        Unidad_Id = $("#hdUnidadId").val();
        CambioUnidad(APLICACION_ID, $("#hdUnidadId").val())
    });

    $("#ddlUnidadesOwner").change(function () {
        Unidad_Id = $("#ddlUnidadesOwner").val();
        CambioUnidad(APLICACION_ID, Unidad_Id)
    });

    $("#txtOwner").hide();
    FormatoCheckBox($("#divFlagOwner"), "ckbOwner");
    $("#ckbOwner").change(FlagOwner_Change);
});

function GestionadoPor_Change() {
    let userIT = $("#ddlGestionadoPor").val();
    if (userIT == ID_USERIT) {
        $(".divInterfaz").hide();
        //bootbox.alert(MENSAJE_GOBIERNO_USERIT);
    }        
    else
        $(".divInterfaz").show();

    let gestionado = null;
    if ($("#ddlGestionadoPor").val() != -1)
        gestionado = obtenerGestionadoPor($("#ddlGestionadoPor").val());


    if (gestionado != null) {
        if (gestionado.FlagUserIT) {
            $(".divInterfaz").hide();
            $("#ddlEquipo").empty();
            $('#ddlEquipo').append('<option value="-1" selected="selected">NO APLICA</option>');

            $("#ddlEquipo").attr("disabled", "disabled");           
        }
        else if (gestionado.FlagSubsidiarias) {
            $("#ddlEquipo").empty();
            $('#ddlEquipo').append('<option value="-1" selected="selected">NO APLICA</option>');            
            $("#ddlEquipo").attr("disabled", "disabled");            
        }
        else {
            $(".divInterfaz").show();
            $("#ddlEquipo").empty();
            $('#ddlEquipo').append('<option value="-1" selected="selected">Seleccione</option>');
            $("#ddlEquipo").removeAttr("disabled");
            
            cargarEquipos(gestionado.Id);

            if (!cargaInicial)
                toastr.warning("Selecciona un Equipo/Squad (si hubiera) para que tu aplicación complete su situación de registro", "Portafolio de aplicaciones BCP");
        }
    }
    else {
        $(".divInterfaz").show();
        $("#ddlEquipo").empty();
        $('#ddlEquipo').append('<option value="-1" selected="selected">Seleccione</option>');
        $("#ddlEquipo").removeAttr("disabled");
        
        //cargarEquipos(gestionado.Id);
        if (!cargaInicial)
            toastr.warning("Selecciona un Equipo/Squad (si hubiera) para que tu aplicación complete su situación de registro", "Portafolio de aplicaciones BCP");
    }
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
                        let codigoApt = $.trim($("#txtCodigoAPT").val());
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
    $.validator.addMethod("empiezaConLetra", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 0) {
            var letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            estado = letras.includes(valor[0]);
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("existeCodigoAPT", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteCodigoAPT(valor);
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("existeNombreAplicacion", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 3) {
            estado = !ExisteNombreAplicacion(valor);
            return estado;
        }
        return estado;
    });

    $("#formAddOrEditApp").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtCodigoAPT: {
                requiredSinEspacios: true,
                empiezaConLetra: true,
                existeCodigoAPT: true,
                minlength: 4,
                maxlength: 4
            },   
            txtCodigoAppPadre: {
                minlength: 4
            },
            txtNombre: {
                requiredSinEspacios: true,
                existeNombreAplicacion: true
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
            },
            ddlArquitectoSolucion: {
                requiredSelect: true
            }
            
        },
        messages: {
            txtCodigoAPT: {
                requiredSinEspacios: "Debes de ingresar un código de 4 caracteres",
                empiezaConLetra: "El código tiene que empezar con letra",
                existeCodigoAPT: "El código de aplicación ingresado ya existe o ya está reservado",
                minlength: "El código tiene que tener 4 caracteres",
                maxlength: "El código tiene que tener 4 caracteres"
            },
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
            },
            ddlArquitectoSolucion: {
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
    data.architectSolutionId = getDDL($("#ddlArquitectoSolucion"));
    data.interfaceId = $.trim($("#txtCodigoInterfaz").val()).toUpperCase();
    data.unit = $("#hdUnidadId").val() == -1 ? null : $("#hdUnidadId").val();
    data.teamId = getDDL($("#ddlEquipo"));

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
        url: URL_API_VISTA + "/application/stepone",
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
                                    window.document.location.href = "DetalleAplicacion?id=" + dataResult.AplicacionId;
                                else
                                    window.document.location.href = "Bandeja";
                            }
                        });

                    } else {
                        MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación ya fue registrado, se acaba de asignar un nuevo código de aplicación a su solicitud para que lo puedas volver a registrar y/o enviar.");
                        CodigoAPT = generarCodigoAPT()
                        while (ExisteCodigoAPT(CodigoAPT)) {
                            CodigoAPT = generarCodigoAPT()
                        }
                        $("#txtCodigoAPT").val(CodigoAPT);

                        if ($btn !== null) {
                            $btn.button("reset");
                            waitingDialog.hide();
                        }
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
    // empiece con letra
    var letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var soloLetra = letras.charAt(Math.floor(Math.random() * letras.length));

    // ultimos 3 alfanumerico
    var length = 3;
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return soloLetra + result;
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
                    SetItems(dataObject.ArquitectoSoluciones, $("#ddlArquitectoSolucion"), TEXTO_SELECCIONE);
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

function cargarEquipos(gestionado) {
    $("#ddlEquipo").empty();

    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/managedteams/${gestionado}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Equipos, $("#ddlEquipo"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function InitAutocompletarEstandarBuilder($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 2,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API + urlControllerWithParams,
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    type: "GET",
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                $("#hdUnidadId").val(ui.item.Id);
                CambioUnidad(APLICACION_ID, ui.item.Id)
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Descripcion + "</font></a>").appendTo(ul);
    };
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
                $("#hExpertoCorreo").val(ui.item.mail);
                $("#hExpertoMatricula").val(ui.item.matricula);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function CambioUnidad(Id, UnidadId) {

    $.ajax({
        url: URL_API_VISTA + `/application/CambioUnidad/${Id},${UnidadId}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    let data = dataObject;

                    $("#txtArea").val(data.areaName);
                    $("#txtDivision").val(data.divisionName);
                    $("#txtGerencia").val(data.gerenciaName);
                    $("#hdUnidadId").val(UnidadId);
                    $("#txtUnidad").val(data.unidadName);
                    $(".unidadResponsable").show();
                    $("#txtResponsableUnidad").html(data.ResponsableUnidad + " (" + data.ResponsableUnidadMatricula + ") - " + data.ResponsableUnidadEmail);
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function CambioOwner2(Id) {
    let data = CrearObj();

    $.ajax({
        url: URL_API_VISTA + `/application/UnidadesOwner`,
        data: JSON.stringify(data),
        type: "POST",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    SetItems(dataObject, $("#ddlUnidadesOwner"), TEXTO_SELECCIONE);

                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function CambioOwner(Id) {
    let data = CrearObj();

    $.ajax({
        url: URL_API_VISTA + `/application/CambioOwner`,
        data: JSON.stringify(data),
        type: "POST",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    let data = dataObject;

                    if (data.unidadName == null)
                        toastr.warning("El Owner/Líder Usuario seleccionado no tiene una unidad asociada.", "Portafolio de aplicaciones BCP");

                    if (data.unidadName != null) {
                        $("#txtArea").val(data.areaName);
                        $("#txtDivision").val(data.divisionName);
                        $("#txtGerencia").val(data.gerenciaName);
                        $("#txtUnidad").val(data.unidadName);
                        $("#hdUnidadId").val(data.unit);

                        $(".unidadResponsable").show();
                        $("#txtResponsableUnidad").html(data.ResponsableUnidad + " (" + data.ResponsableUnidadMatricula + ") - " + data.ResponsableUnidadEmail);
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

function CrearObj() {
    var data = {};
    data.Id = $("#hdAplicacionId").val();
    data.Username = $("#hdOwnerId").val();

    return data;
}

//Busqueda de owner por AD
function InitAutocompletarBuilderLocalAD($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + urlControllerWithParams,
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
                $("#hdOwnerId").val(ui.item.Matricula);
                CambioOwner2(APLICACION_ID)
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function FlagOwner_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $("#txtOwner").show();
        $(".divRowOwner").show();

    }
    else {
        $("#txtOwner").hide();
        $(".divRowOwner").hide();
    }
}