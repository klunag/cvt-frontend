const URL_API_VISTA = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Portafolio de Aplicaciones";
const MENSAJE = "¿Estás seguro de enviar la modificación para la aplicación?, recuerde que cada modificación puede generar una solicitud que será atendida por el Portafolio de Aplicaciones o los Custodios.";
const MENSAJE2 = "¿Estás seguro de actualizar los datos de la aplicación?";
const MENSAJE_GOBIERNO_USERIT = "Este mensaje tiene que ser proporcionado por Gobierno UserIT ya que se cambia el Gestionado Por a UserIT";

const ID_USERIT = 1;
const ESTADO_VIGENTE = 2;
const TIPO_ACTIVO_USER_IT = 3;

var cambiarInterface = true;
var requiereEquipo = true;
var control = 0; 

const tituloMensaje = "Portafolio de Aplicaciones";

const TIPO_DESARROLLO_INTERNO = 178;
const TIPO_WEB = 154;

var flag = true;
var $table = $("#tblRegistro");
var OWNER_LIST = [];
var indexActual = 0;
var tipoImplementacionInicial = 0;
var tipoImplementacionProduccion = 0;
var pciInicial = "";
var listaInfraestructura = ["185", "190"]; 
var activarJenkins = "";
var InfraestructuraInicial = 0;
var NombrePersona = "";
var EmailPersona = "";


$(function () {
    getCurrentUser();

    $("#txtCodigoInterfaz").hide();
    $(".divRowOwner").hide();
    $("#btnRegistrarApp").click(guardarAddOrEditApp);
    $("#btnCancelar").click(cancelarAddOrEditApp);
    $("#ddlEntidades").multiselect('enable');
    SetItemsMultiple([], $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    $("#ddlPCI").multiselect('enable');
    SetItemsMultiple([], $("#ddlPCI"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    //InitAutocompletarEstandarBuilder2($("#txtOwner"), $("#hdOwnerId"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro?filtro={0}&filtroPadre=");
    InitAutocompletarBuilderLocalAD($("#txtOwner"), $("#hdOwnerId"), ".divUnidadContainer", "/userSIGA/{0}");
    if ($("#txtUnidad").val() != "") {
        $(".unidadResponsable").show();
    }
    else $(".unidadResponsable").hide();
    $("#txtOwner").hide();
    FormatoCheckBox($("#divFlagOwner"), "ckbOwner");
    $("#ckbOwner").change(FlagOwner_Change);

    FormatoCheckBox($("#divFlagProveedorDesarrollo"), "ckbProveedorDesarrollo");
    $("#ckbProveedorDesarrollo").change(FlagProveedorDesarrollo_Change);

    $('#ddlPCI').on('change', function () {

        if ($('#ddlPCI').val() == null) {

        }

        else if ($('#ddlPCI').val().includes("4")) {
            $('#ddlPCI').val("4");
            $('#ddlPCI').multiselect('refresh');
        }

        else {
            const index = $('#ddlPCI').val().indexOf("4");
            if (index > -1) {
                $('#ddlPCI').val().splice(index, 1);
            }

            $('#ddlPCI').multiselect('refresh');
        }


        $('#ddlPCI').multiselect('refresh');

    });

    initUpload($("#txtArchivo"));
    $("#btnRegistrarApp2").click(guardarAddOrEditApp);
    $("#btnCancelar2").click(cancelarAddOrEditApp);

    $("#btnDescargar").click(descargarArchivo);
    $("#msjUsuarioRepetido").hide();
    InitAutocompletarUsuariosLocal($("#txtExperto"), $("#hExpertoId"), ".divUsuarioExpertoContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");


    InitAutocompletarEstandarBuilder($("#txtUnidad"), $("#hdUnidadId"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro?filtro={0}&filtroPadre=");
    setDefaultHd($("#txtCodigoAppPadre"), $("#hCodigoPadre"));

    cargarCombos();
    cargarToolbox();
    validarFormApp();
    validarFormApp2();
    ListarExpertos();
    ValidarActivacionJenkins();

    FormatoCheckBox($("#divFlagInterface"), "ckbInterface");

    $("#ddlGestionadoPor").change(GestionadoPor_Change);

    $("#ckbInterface").change(FlagInterface_Change);

    FormatoCheckBox($("#divFlagPCI"), "ckbPCI");
    $("#ckbPCI").change(FlagPCI_Change);

    $("#ddlInfraestructura").change(Infraestructure_Change);

    if (APLICACION_ID !== 0) {
        editarAplicacion(APLICACION_ID);
    } else {
        window.document.location.href = `/RegistroPortafolioAplicaciones/BandejaAplicaciones`;
    }


    $("#txtUnidad").change(function () {
        Unidad_Id = $("#hdUnidadId").val();
        CambioUnidad(APLICACION_ID, $("#hdUnidadId").val())
    });

    $("#ddlUnidadesOwner").change(function () {
        Unidad_Id = $("#ddlUnidadesOwner").val();
        CambioUnidad(APLICACION_ID, Unidad_Id)
    });

    if ($("#hdUnidadId").val() != -1) CambioUnidad(APLICACION_ID, $("#hdUnidadId").val());

    FormatoCheckBox($("#divFlagUsuario"), "ckbFlagUsuario");
    $("#ckbFlagUsuario").change(FlagUsuario_Change);
    $("#txtExperto").focusout(function () {
        let valor = $("#txtExperto").val().length;
        if (valor != control)
            $("#txtExperto").val('');
    });

    InitAutocompletarBuilder($("#txtGrupoTicketRemedy"), $("#hGrupoTicketRemedy"), ".containerGrupoRemedy", "/applicationportfolio/application/ListGroupRemedy?filtro={0}");
    setDefaultHd($("#txtGrupoTicketRemedy"), $("#hGrupoTicketRemedy"));

    InitAutocompletarBuilder($("#txtAplicacionReemplazada"), $("#hCodigoReemplazada"), ".containerReemplazoAplicacion", "/applicationportfolio/application/filter/replace?filtro={0}&codigoAPT=" + $("#txtCodigoAPT").val());
    InitAutocompletarBuilder($("#txtCodigoAppPadre"), $("#hCodigoPadre"), ".containerAplicacion", "/applicationportfolio/application/filter?filtro={0}&codigoAPT=" + $("#txtCodigoAPT").val());
    setDefaultHd($("#txtAplicacionReemplazada"), $("#hCodigoReemplazada"));

    $("#txtAplicacionReemplazada").focusout(function () {
        let valor = $("#hCodigoReemplazada").val();
        if (valor == '0') {
            $("#txtAplicacionReemplazada").val('');
            toastr.error("El código de aplicación reemplazado no es válido, por favor seleccione una aplicación que se haya registrado en el portafolio.", TITULO_MENSAJE);
        }
    });

    $("#txtCodigoAppPadre").focusout(function () {
        let valor = $("#hCodigoPadre").val();
        if (valor == '0') {
            $("#txtCodigoAppPadre").val('');
            toastr.error("El código de aplicación padre no es válido, por favor seleccione una aplicación que se haya registrado en el portafolio.", TITULO_MENSAJE);
        }
    });

    /*$("#ddlTipoDesarrollo").change(TipoDesarrollo_Change);*/
    $("#ddlEstadoAplicacion").change(Estado_Change);


    $("#txtUnidad").focusout(function () {
        let valor = $("#txtUnidad").val();
        if (valor == '') {
            $("#txtResponsableUnidad").html('');
            $("#hdUnidadId").val('');
            $("#txtGerencia").val('');
            $("#txtArea").val('');
            $("#txtDivision").val('');
        }
    });
    InfraestructuraInicial = $("#ddlInfraestructura").val();
});

function ValidarActivacionJenkins() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/ValidateActivationJenkins",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    activarJenkins = dataObject;

                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function Infraestructure_Change() {

    if (listaInfraestructura.indexOf($("#ddlInfraestructura").val()) != -1 && activarJenkins.toUpperCase() == "TRUE") {
        OpenCloseModal($("#modalInfraestructura"), true);
    }

    if (InfraestructuraInicial != -1) {
        if (listaInfraestructura.indexOf($("#ddlInfraestructura").val()) == -1 && activarJenkins.toUpperCase() == "TRUE") {
            OpenCloseModal($("#modalInfraestructura2"), true);
        }
    }
}


function FlagPCI_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $("#ddlPCI").next().show();
        $("#ddlPCI option[value='4']").remove();
        $('#ddlPCI').val(pciInicial);
    }
    else {
        $("#ddlPCI").next().hide();
        var newOption = $('<option value="' + 4 + '">' + 'NO APLICA' + '</option>');
        $('#ddlPCI').append(newOption);
        $('#ddlPCI').val(4);
    }
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
//Busqueda de owner por SIGA
//function InitAutocompletarEstandarBuilder2($searchBox, $IdBox, $container, urlController) {
//    let data = CrearObjAplicacion();

//    $searchBox.autocomplete({
//        minLength: 2,
//        appendTo: $container,
//        source: function (request, response) {
//            if ($.trim(request.term) !== "") {

//                let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
//                data.Username = request.term;
//                if ($IdBox !== null) $IdBox.val("0");
//                $.ajax({
//                    url: URL_API_VISTA + `/application/Gerencia/getOwner`,
//                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
//                    type: "POST",
//                    data: JSON.stringify(data),
//                    contentType: "application/json; charset=utf-8",
//                    dataType: "json",
//                    success: function (data) {
//                        response($.map(data, function (item) {
//                            return item;
//                        }));
//                    },
//                    async: true,
//                    global: false
//                });
//            } else
//                return response(true);
//        },
//        focus: function (event, ui) {
//            $searchBox.val(ui.item.Nombre);
//            return false;
//        },
//        select: function (event, ui) {
//            if ($IdBox !== null) {
//                $IdBox.val(ui.item.Matricula);
//                $("#hdOwnerId").val(ui.item.Matricula);
//                CambioOwner2(APLICACION_ID, ui.item.Id)
//                //LIST = [];
//                //BuscarEnUnidad(ui.item.Matricula);

//                //if (flag == 1) {
//                //    var dat = { Id: ui.item.id, Responsable: ui.item.Nombre, ResponsableCorreo: ui.item.Correo, ResponsableMatricula: ui.item.Matricula }

//                //    LIST.push(dat);
//                //    document.getElementById('label').innerHTML = '';
//                //}
//                //$table.bootstrapTable('destroy');
//                //$('table').bootstrapTable({
//                //    data: LIST
//                //});
//                //$('#txtOwner').val("");
//            }
//            return false;
//        }
//    }).autocomplete("instance")._renderItem = function (ul, item) {
//        return $("<li>").append("<a style='display: block'><font>" + item.Nombre + "</font></a>").appendTo(ul);
//    };
//}
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

function FlagProveedorDesarrollo_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $("#txtProveedorDesarrollo").val('');
        $("#txtProveedorDesarrollo").removeAttr("disabled");
    }
    else {
        $("#txtProveedorDesarrollo").val('NO APLICA');
        $("#txtProveedorDesarrollo").attr("disabled", "disabled");
    }
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



function FlagUsuario_Change() {

    var flag = $(this).prop("checked");
    if (flag) {
        //$("#txtAutorizador").attr("disabled", "disabled"); 
        $("#txtExperto").val(userCurrent.Nombres);
        $("#hExpertoId").val(userCurrent.Matricula);
        $("#hExpertoMatricula").val(userCurrent.Matricula);
        $("#hExpertoCorreo").val(userCurrent.CorreoElectronico);
        var obj = { username: userCurrent.Matricula, managerName: userCurrent.Nombres, email: userCurrent.CorreoElectronico };
        OWNER_LIST.push(obj);
        indexActual = OWNER_LIST.length;
        $table.bootstrapTable('destroy');

        $('table').bootstrapTable({
            data: OWNER_LIST
        });
    }
    else {
        $("#txtExperto").removeAttr("disabled");
        $("#txtExperto").val("");
        $("#hExpertoId").val("");
        $("#hExpertoMatricula").val("");
        $("#hExpertoCorreo").val("");
        OWNER_LIST.splice((indexActual - 1), 1);
        $table.bootstrapTable('destroy');

        $('table').bootstrapTable({
            data: OWNER_LIST
        });
    }
}

function initUpload(txtNombreArchivo) {
    var inputs = document.querySelectorAll('.inputfile');
    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener('change', function (e) {
            var fileName = '';
            if (this.files && this.files.length > 1)
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            else
                fileName = e.target.value.split('\\').pop();

            if (fileName)
                txtNombreArchivo.val(fileName);
            else
                label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
}

function cancelarAddOrEditApp2() {
    window.document.location.href = `/RegistroPortafolioAplicaciones/BandejaAplicaciones`;
}

function GestionadoPor_Change() {
    let gestionado = obtenerGestionadoPor($("#ddlGestionadoPor").val());
    if (gestionado == null) {
        $("#ddlEquipo").empty();
        $('#ddlEquipo').append('<option value="-1" selected="selected">NO APLICA</option>');
    } else {
        if (gestionado.FlagUserIT == true) {
            $(".divInterfaz").hide();
            $("#ddlEquipo").empty();
            $('#ddlEquipo').append('<option value="-1" selected="selected">NO APLICA</option>');
            //$("#ddlGestionadoPor").attr("disabled", "disabled");
            $("#ddlEquipo").attr("disabled", "disabled");
            $(".datosUserIT").show();

            //bootbox.alert(MENSAJE_GOBIERNO_USERIT);

            requiereEquipo = false;
        }
        else if (gestionado.FlagSubsidiarias == true) {
            $("#ddlEquipo").empty();
            $('#ddlEquipo').append('<option value="-1" selected="selected">NO APLICA</option>');
            $("#ddlEquipo").attr("disabled", "disabled");
            requiereEquipo = false;
            $("#txtComplianceLevel").val("");
            $("#txtSummaryStandard").val("");
            $(".datosUserIT").hide();
        }
        else {
            $(".divInterfaz").show();
            $("#ddlEquipo").empty();
            $('#ddlEquipo').append('<option value="-1" selected="selected">Seleccione</option>');
            $("#ddlEquipo").removeAttr("disabled");
            $("#txtArchivo").val(TEXTO_SIN_ARCHIVO)
            $(".datosUserIT").hide();
            //$("#flArchivo").val("");        

            //$("#txtComplianceLevel").val("");
            //$("#txtSummaryStandard").val("");

            cargarEquipos(gestionado.Id);

            if (gestionado.FlagJefeEquipo == true || gestionado.FlagEquipoAgil == true)
                requiereEquipo = true;
            else
                requiereEquipo = false;
        }
    }
}


function FlagInterface_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $("#txtCodigoInterfaz").show();
        if (cambiarInterface) {
            CodigoInterfaz = generarCodigoInterfaz();
            CodigoInterfaz = ExisteCodigoInterfaz(CodigoInterfaz);
            //while (ExisteCodigoInterfaz(CodigoInterfaz)) {
            //    CodigoInterfaz = generarCodigoInterfaz()
            //}
            $("#txtCodigoInterfaz").val(CodigoInterfaz);
        }
    }
    else {
        $("#txtCodigoInterfaz").hide();
    }
}

function cancelarAddOrEditApp() {
    window.document.location.href = `/RegistroPortafolioAplicaciones/BandejaAplicaciones`;
}

function editarAplicacion(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    cargarComboInfraestructura(Id);
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

                    tipoImplementacionProduccion = data.IdAplicacionProduccion;

                    $("#hdAplicacionId").val(APLICACION_ID);
                    $("#txtCodigoAPT").val(data.applicationId);

                    $("#txtArea").val(data.areaName);
                    $("#txtDivision").val(data.divisionName);
                    $("#txtGerencia").val(data.gerenciaName);
                    //$("#ddlPCI").val(data.TipoPCI !== null ? data.TipoPCI : "-1"); //app.AplicacionDetalle
                    //$("#ddlPCI").multiselect("refresh");

                    if (data.TipoPCI == "4") {
                        var newOption = $('<option value="' + 4 + '">' + 'NO APLICA' + '</option>');
                        $('#ddlPCI').append(newOption);
                        $("#ddlPCI").val(4);
                        $("#ddlPCI").next().hide();
                    }
                    else if (data.TipoPCI != "4") {
                        $("#ddlPCI").val(data.TipoPCI !== null ? data.TipoPCI : "-1");
                        $("#ddlPCI").multiselect("refresh");
                    }

                    //$("#ddlPCI").multiselect("refresh");

                    pciInicial = data.TipoPCI;
                    if (data.TipoPCI.length == 0) {
                        $("#ckbPCI").prop('checked', false);
                        $("#ckbPCI").bootstrapToggle(false ? 'on' : 'off');
                    }
                    else if (data.TipoPCI != "4") {
                        $("#ckbPCI").prop('checked', true);
                        $("#ckbPCI").bootstrapToggle(true ? 'on' : 'off');
                    }
                    else {
                        $("#ckbPCI").prop('checked', false);
                        $("#ckbPCI").bootstrapToggle(false ? 'on' : 'off');
                    }

                    if (data.TipoPCI == null) {
                        $("#ckbPCI").prop('checked', false);
                        $("#ckbPCI").bootstrapToggle(false ? 'on' : 'off');
                    }


                    $("#txtArchivo").val(data.NombreArchivoSeguridad);

                    $("#txtNombre").val(data.applicationName);
                    $("#txtDescripcion").val(data.description);
                    $("#ddlGestionadoPor").val(data.managed || "-1");
                    $("#txtUnidad").val(data.unitDetail);
                    $("#hdUnidadId").val(data.unit || "-1");

                    $("#ddlModeloEntrega").val(data.deploymentType || "-1");

                    GestionadoPor_Change();
                    if (data.parentAPTCode != '') {
                        $("#txtCodigoAppPadre").val(data.parentAPT);
                        $("#hCodigoPadre").val(data.parentAPTCode);
                    }
                    $("#txtEquipoSquad").val(data.teamName);
                    if (data.teamId != null)
                        $("#ddlEquipo").val(data.teamId || "-1");

                    tipoImplementacionInicial = data.implementationType;
                    $("#ddlTipoImplementacion").val(data.implementationType || "-1");

                    $("#ddlEstadoAplicacion").val(data.status || "-1");
                    Estado_Change();
                    //if (data.hasDateReleased) {
                    //    $("#ddlEstadoAplicacion").attr("disabled", "disabled");
                    //}

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

                    if (data.replacementApplication != '' && data.replacementApplication != null) {
                        $("#txtAplicacionReemplazada").val(data.replacementAPT);
                        $("#hCodigoReemplazada").val(data.replacementApplication);
                    }

                    $("#ddlEntidades").val(data.userEntity !== null ? data.userEntity.split(",") : "-1"); //app.AplicacionDetalle
                    $("#ddlEntidades").multiselect("refresh");

                    data.infrastructure = (getValidarValoresSelect("ddlInfraestructura", data.infrastructure)) ? data.infrastructure : 0;
                    $("#ddlInfraestructura").val(data.infrastructure || "-1");
                    $("#ddlAutorizacion").val(data.authorizationMethod || "-1");
                    $("#ddlAutenticacion").val(data.authenticationMethod || "-1");
                    
                    data.developmentType = (getValidarValoresSelect("ddlTipoDesarrollo", data.developmentType)) ? data.developmentType : 0;
                    $("#ddlTipoDesarrollo").val(data.developmentType || "-1");
                    /*TipoDesarrollo_Change();*/
                    $("#ckbProveedorDesarrollo").prop('checked', data.developmentProvider);
                    $("#ckbProveedorDesarrollo").bootstrapToggle(data.developmentProvider ? 'on' : 'off');
                    if (data.developmentProvider) {
                        /*$("#ckbProveedorDesarrollo").attr("disabled", "disabled");*/
                        $("#ckbProveedorDesarrollo").bootstrapToggle(data.developmentProvider == 'NO APLICA' ? 'off' : 'on');
                        $("#txtProveedorDesarrollo").val(data.developmentProvider);
                    }
                    else {
                        $("#txtProveedorDesarrollo").val('NO APLICA');
                    }

                    if (data.groupTicketRemedy != null && data.groupTicketRemedy != 0) {
                        $("#txtGrupoTicketRemedy").val(data.grupoTicketRemedyName);
                        $("#hGrupoTicketRemedy").val(data.groupTicketRemedy);
                    } else {
                        $("#txtGrupoTicketRemedy").val("NO APLICA");
                    }

                    if (data.hasWeb)
                        $("#txtURL").removeAttr("disabled");
                    else
                        $("#txtURL").attr("disabled", "disabled");

                    $("#txtURL").val(data.webDomain);
                    $("#hdTipoActivo").val(data.assetType);
                    let gestionado = obtenerGestionadoPor($("#ddlGestionadoPor").val());
                    if (gestionado != null) {
                        if (data.assetType == TIPO_ACTIVO_USER_IT || gestionado.FlagUserIT == true) {
                            //if ( gestionado.FlagUserIT == true) {
                            $(".datosUserIT").show();
                            $("#txtComplianceLevel").val(data.complianceLevel);
                            $("#txtSummaryStandard").val(data.summaryStandard);
                            if (data.NombreArchivoSeguridad == null) {
                                document.getElementById('btnDescargar').style.display = 'none';
                            }
                            else if (data.NombreArchivoSeguridad != null) {
                                document.getElementById('btnDescargar').style.display = '';
                            }
                        }
                        else {
                            $(".datosUserIT").hide();
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

function guardarAddOrEditApp2() {
    //CHC: la primera linea le estaba agregando la clase ignore a todos los inputs con clase form-control. la clase ignore se usa para
    //     decirle al validate que no tome en cuenta esos inputs
    //$(".form-control").addClass("ignore");
    //$(".input-registro").removeClass("ignore");




    //if ($("#formAddOrEditApp").valid()) {   
    if (true) {

        ValidarModificacion2($("#formAddOrEditApp2"),
            $("#btnRegistrarApp2"),
            "Validado correctamente");
        if (flag) {
            bootbox.confirm({
                title: TITULO_MENSAJE,
                message: MENSAJE2,
                buttons: SET_BUTTONS_BOOTBOX,
                callback: function (result) {
                    result = result || null;
                    if (result !== null && result) {
                        let codigoApt = $.trim($("#txtCodigoApt").val());
                        if (!ExisteCodigoAPT(codigoApt)) {
                            sendDataFormAPI2($("#formAddOrEditApp2"),
                                $("#btnRegistrarApp2"),
                                "Registrado correctamente");
                        }
                        else {
                            MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación no existe o se ha encontrado un inconveniente en la actualización, vuelve a intentarlo.");
                            let nextCodigoAPT = ObtenerUltimoCodigoAptByParametro();
                            $("#txtCodigoApt").val(nextCodigoAPT);
                        }
                    }
                }
            });
        }
    }
}

function ValidarModificacion2($form, $btn, title) {

    let data = CrearObjAplicacion();

    $.ajax({
        url: URL_API_VISTA + "/application/ValidarModificacion2",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    let dataResult = dataObject;

                    flag = dataResult;
                    if (!dataResult) {
                        bootbox.confirm({
                            message: "Se debe modificar al menos un campo para continuar con la actualización",
                            buttons: {
                                confirm: {
                                    label: 'De acuerdo, modificaré los datos',
                                    className: 'btn-success'

                                },
                                cancel: {
                                    label: 'Continuaré luego',
                                    className: 'btn-danger'

                                }

                            }
                            ,
                            callback: function (result) {
                                if (!result)
                                    document.location.href = 'BandejaAplicaciones';
                                else
                                    return result;
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
        },
        async: false
    });
}

function validarFormApp2() {
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

    $.validator.addMethod("noEsNumero", function (value, element) {
        let estado = false;
        let valor = $.trim(value);
        if (isNaN(valor)) {

            return false;
        }
        return true;
    });
    $.validator.addMethod("noEstaVacio", function (value, element) {
        let estado = false;
        let valor = $.trim(value);
        if (valor != null) {

            return false;
        }
        return true;
    });

    $.validator.addMethod('maxStrict', function (value, el, param) {
        return value <= 100;
    });

    $.validator.addMethod("blankSpace", function (value) {
        return value.indexOf(" ") < 0;
    });

    $("#formAddOrEditApp2").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            //txtAplicacionReemplazada: {
            //    requiredSinEspacios: true,
            //},
            ddlEntidades: {
                requiredSelect: true
            },
            ddlTipoDesarrollo: {
                requiredSelect: true
            },
            ddlInfraestructura: {
                requiredSelect: true
            },
            ddlAutenticacion: {
                requiredSelect: true
            },
            ddlAutorizacion: {
                requiredSelect: true
            },
            txtURL: {
                requiredSinEspacios: true,
            },
            txtGrupoTicketRemedy: {
                required: true
            },
            ddlPCI: {
                requiredSelect: true
            },
            ddlTipoDesarrollo: {
                requiredSelect: true
            },

        },
        messages: {

            //txtAplicacionReemplazada: {
            //    requiredSinEspacios: "Debes de ingresar un nombre de aplicación reemplazada."
            //},
            ddlEntidades: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlTipoDesarrollo: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlInfraestructura: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlAutenticacion: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlAutorizacion: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            txtURL: {
                requiredSinEspacios: "Debes de ingresar un dominio web."
            },
            txtGrupoTicketRemedy: {
                required: "Debes de ingresar un grupo de soporte."
            },
            ddlPCI: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlTipoDesarrollo: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "ddlEntidades"
                || element.attr('name') === "ddlTipoDesarrollo"
                || element.attr('name') === "ddlInfraestructura"
                || element.attr('name') === "ddlTipoDesarrollo"
                || element.attr('name') === "ddlAutenticacion"
                || element.attr('name') === "ddlAutorizacion"
                || element.attr('name') === "txtURL"
                || element.attr('name') === "txtGrupoTicketRemedy"
                || element.attr('name') === "txtSummaryStandard"
                || element.attr('name') === "txtComplianceLevel") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });

    $('#ddlEntidades').attr('socio', 'Entidades usuarias');
    $('#ddlTipoDesarrollo').attr('socio', 'Tipo de desarrollo');
    $('#ddlInfraestructura').attr('socio', 'Infraestructura de la aplicación');
    $('#ddlAutenticacion').attr('socio', 'Método de autenticación');
    $('#ddlAutorizacion').attr('socio', 'Método de autorización');
    $('#txtGrupoTicketRemedy').attr('socio', 'Grupo Ticket Remedy');
    $('#txtURL').attr('socio', 'URL - Dominio web');
    $('#ddlPCI').attr('socio', 'Tratamiento PCI DSS');
}

function CrearObjAplicacion2() {
    var data = {};
    data.AppId = $("#hdAplicacionId").val();
    data.userEntity = $("#ddlEntidades").val() !== null ? $("#ddlEntidades").val().join(",") : "";
    data.infrastructure = getDDL($("#ddlInfraestructura"));
    data.replacementApplication = $("#hCodigoReemplazada").val() == "0" ? '' : $.trim($("#hCodigoReemplazada").val()).toUpperCase();
    data.authorizationMethod = getDDL($("#ddlAutorizacion"));
    data.authenticationMethod = getDDL($("#ddlAutenticacion"));
    data.groupTicketRemedy = $("#hGrupoTicketRemedy").val();
    data.webDomain = $("#txtURL").val();
    data.developmentType = $("#ddlTipoDesarrollo").val();
    data.developmentProvider = $("#txtProveedorDesarrollo").val();
    data.Expertos = OWNER_LIST;

    return data;
}

function sendDataFormAPI2($form, $btn, title) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjAplicacion2();

    $.ajax({
        url: URL_API_VISTA + "/application/steptwo/Update2",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    if ($("#flArchivo").val() != null) { CargarArchivos(data.AppId) }


                    let dataResult = dataObject;

                    bootbox.confirm({
                        message: "La modificación de campos se realizó con éxito.",
                        closeButton: false,
                        buttons: {
                            confirm: {
                                label: 'Seguiré modificando otra aplicación',
                                className: 'btn-success'
                            },
                            cancel: {
                                label: 'Ver la bandeja de solicitudes',
                                className: 'btn-danger'
                            }
                        },
                        callback: function (result) {
                            if (!result)
                                window.document.location.href = `/RegistroPortafolioAplicaciones/BandejaModificacionAplicaciones`;
                            else
                                window.document.location.href = `/RegistroPortafolioAplicaciones/BandejaAplicaciones`;
                        }
                    });
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

function guardarAddOrEditApp() {
    var gestionado = obtenerGestionadoPor($("#ddlGestionadoPor").val());
    var tipoActivoUserIT = false;
    if ($("#hdTipoActivo").val() == TIPO_ACTIVO_USER_IT) {
        tipoActivoUserIT = true;
        var rls = $.trim($("#txtSummaryStandard").val());
        if (rls == '') {
            toastr.error("Es necesario ingresar el resumen de lineamientos de seguridad", "Portafolio de Aplicaciones BCP");
            $("#txtSummaryStandard").focus();
            return;
        }

        var ncs = $.trim($("#txtComplianceLevel").val());
        if (ncs == '') {
            toastr.error("Es necesario ingresar el nivel de cumplimiento de seguridad", "Portafolio de Aplicaciones BCP");
            $("#txtComplianceLevel").focus();
            return;
        }
    }

    //if ($("#ddlTipoDesarrollo").val() != TIPO_DESARROLLO_INTERNO && $("#txtProveedorDesarrollo").val() == '') {
    //    toastr.warning("Por el tipo de desarrollo seleccionado, es obligatorio registrar un proveedor", "Portafolio de Aplicaciones BCP");
    //    $("#txtProveedorDesarrollo").focus();

    //    return
    //}
    //if ($("#ddlTipoDesarrollo").val() == '-1') {
    //    toastr.warning("Debe Seleccionar algun Tipo de Desarrollo ", "Portafolio de Aplicaciones BCP");
    //    $("#ddlTipoDesarrollo").focus();

    //    return
    //}

    if (!$("#formAddOrEditApp").valid()) {
        var validator = $("#formAddOrEditApp").validate();
        var camposInvalidos = validator.numberOfInvalids();
        var mensajeAlerta = '';
        if (camposInvalidos > 0) {
            mensajeAlerta = mensajeAlerta + '<p><strong>• En el tab Datos que requieren aprobación del portafolio o custodios </strong></p>';
            for (var i = 0; i < validator.errorList.length; i++) {
                mensajeAlerta = mensajeAlerta + ' - ' + validator.errorList[i].message + ', para el campo: ' + $('#' + validator.errorList[i].element.id + '').attr("socio") + ' </br>';
            }
        }
        toastr.warning("<p>Se han detectado los siguientes errores:</p>" + mensajeAlerta, "Portafolio de Aplicaciones BCP", { closeButton: true, timeOut: 15000, progressBar: true, allowHtml: true });
        return;
    }

    if (!$("#formAddOrEditApp2").valid()) {
        var validator = $("#formAddOrEditApp2").validate();
        var camposInvalidos = validator.numberOfInvalids();
        var mensajeAlerta = '';
        if (camposInvalidos > 0) {
            mensajeAlerta = mensajeAlerta + '<p><strong>• En el tab Datos que no requieren aprobación </strong></p>';
            for (var i = 0; i < validator.errorList.length; i++) {
                mensajeAlerta = mensajeAlerta + ' - ' + validator.errorList[i].message + ', para el campo: ' + $('#' + validator.errorList[i].element.id + '').attr("socio") + ' </br>';
            }
        }
        toastr.warning("<p>Se han detectado los siguientes errores:</p>" + mensajeAlerta, "Portafolio de Aplicaciones BCP", { closeButton: true, timeOut: 15000, progressBar: true, allowHtml: true });
        return;
    }

    if ($("#formAddOrEditApp").valid() && $("#formAddOrEditApp2").valid()) {
        ValidarModificacion($("#formAddOrEditApp"),
            $("#btnRegistrarApp"),
            "Validado correctamente", tipoActivoUserIT);
        if (flag) {
            if (requiereEquipo == false) {
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
                                MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación no existe o se ha encontrado un inconveniente en la actualización, vuelve a intentarlo.");


                            }
                        }
                    }
                });
            }
            else if (requiereEquipo == true) {
                var equipo = $("#ddlEquipo").val();
                if (equipo != -1) {
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
                                    MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación no existe o se ha encontrado un inconveniente en la actualización, vuelve a intentarlo.");


                                }
                            }
                        }
                    });
                }
                else {
                    toastr.error("Es requerido que selecciones un Equipo/Squad para la aplicación", "Portafolio de Aplicaciones BCP");
                    $("#ddlEquipo").focus();
                }
            }
        }
    }
}

function ValidarModificacion($form, $btn, title, esUserIT) {

    let data = CrearObjAplicacion();

    $.ajax({
        url: URL_API_VISTA + "/application/ValidarModificacion",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    let dataResult = dataObject;
                    flag = dataResult;

                    if (!flag) {
                        if (esUserIT) {
                            flag = ($("#txtArchivo").val() != 'Ningún archivo seleccionado');
                        }
                    }

                    if (!flag) {
                        bootbox.confirm({
                            message: "Se debe modificar al menos un campo para crear la solicitud",
                            closeButton: false,
                            buttons: {
                                confirm: {
                                    label: 'De acuerdo, modificaré los datos',
                                    className: 'btn-success'
                                },
                                cancel: {
                                    label: 'Continuaré luego',
                                    className: 'btn-danger'
                                }
                            }
                            ,
                            callback: function (result) {
                                if (!result)
                                    document.location.href = 'BandejaAplicaciones';
                                else
                                    return result;
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
        },
        async: false
    });
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

    $.validator.addMethod("existeNombreAplicacion", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 3) {
            estado = !ExisteNombreAplicacion(valor);
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("noEsNumero", function (value, element) {
        let estado = false;
        let valor = $.trim(value);
        if (isNaN(valor)) {

            return false;
        }
        return true;
    });

    $.validator.addMethod('maxStrict', function (value, el, param) {
        return value <= 100;
    });

    $.validator.addMethod("blankSpace", function (value) {
        return value.indexOf(" ") < 0;
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
                existeCodigoAPT: true,
                minlength: 4,
                maxlength: 4
            },
            txtNombre: {
                requiredSinEspacios: true,
                //existeNombreAplicacion: true
            },
            txtDescripcion: {
                requiredSinEspacios: true
            },
            txtCodigoAppPadre: {
                maxlength: 100
            },
            ddlTipoImplementacion: {
                requiredSelect: true
            },
            ddlEstadoAplicacion: {
                requiredSelect: true
            },
            txtUnidad: {
                requiredSinEspacios: true
            },
            ddlGestionadoPor: {
                requiredSelect: true
            },
            txtComplianceLevel: {
                noEsNumero: true,
                maxStrict: true,
                blankSpace: true
            }
        },
        messages: {
            txtCodigoAPT: {
                requiredSinEspacios: "Debes de ingresar un código de 4 caracteres",
                existeCodigoAPT: "El código de aplicación ingresado ya existe",
                minlength: "El código tiene que tener 4 caracteres",
                maxlength: "El código tiene que tener 4 caracteres"
            },
            txtNombre: {
                requiredSinEspacios: "Debes de ingresar un nombre para esta aplicación",
                existeNombreAplicacion: "El nombre de la aplicación ya existe"
            },
            txtDescripcion: {
                requiredSinEspacios: "Debes de ingresar una descripción detallada de esta aplicación"
            },
            txtCodigoAppPadre: {
                maxlength: "No debe de superar los 100 caracteres"
            },
            ddlTipoImplementacion: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlEstadoAplicacion: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            txtUnidad: {
                requiredSinEspacios: "Debes de ingresar la unidad dueña de la aplicación"
            },
            ddlGestionadoPor: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            txtComplianceLevel: {
                noEsNumero: "Debes ingresar un número",
                maxStrict: "El valor no puede ser mayor a 100",
                blankSpace: "El valor no puede ser un espacio en blanco"
            }
            //,
            //ddlEquipo: {
            //    requiredSelect: "Debes de seleccionar un elemento de la lista"
            //}
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtCodigoAPT"
                || element.attr('name') === "txtNombre"
                || element.attr('name') === "txtCodigoAppPadre"
                || element.attr('name') === "ddlTipoImplementacion"
                || element.attr('name') === "ddlEstadoAplicacion"
                || element.attr('name') === "txtUnidad"
                || element.attr('name') === "ddlGestionadoPor"
                //|| element.attr('name') === "ddlEquipo"
                || element.attr('name') === "txtDescripcion") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });

    $('#txtCodigoAPT').attr('socio', 'Código de la aplicación');
    $('#txtNombre').attr('socio', 'Nombre de la aplicación');
    $('#txtDescripcion').attr('socio', 'Descripción');
    $('#txtCodigoAppPadre').attr('socio', 'Código de aplicación padre');
    $('#ddlTipoImplementacion').attr('socio', 'Tipo de implementación');
    $('#ddlEstadoAplicacion').attr('socio', 'Estado de la aplicación');
    $('#txtUnidad').attr('socio', 'Unidad dueña de la aplicación');
    $('#ddlGestionadoPor').attr('socio', 'Gestionado por');
    $('#txtComplianceLevel').attr('socio', 'Nivel de cumplimiento de seguridad');
}

function CrearObjAplicacion() {
    var data = {};
    data.AppId = $("#hdAplicacionId").val();
    data.applicationName = $.trim($("#txtNombre").val()).toUpperCase(); // $("#ddlDivision").val(); //cvt.Aplicacion
    data.implementationType = getDDL($("#ddlTipoImplementacion")); // $("#ddlArea").val(); //cvt.Aplicacion
    data.description = $.trim($("#txtDescripcion").val()); //cvt.Aplicacion
    data.parentAPTCode = $("#hCodigoPadre").val() == "0" ? '' : $.trim($("#hCodigoPadre").val()).toUpperCase(); //$.trim($("#txtNombreApp").val()); //cvt.Aplicacion    
    data.deploymentType = getDDL($("#ddlModeloEntrega"));
    data.hasInterfaceId = $("#ckbInterface").prop("checked");
    data.interfaceId = $("#txtCodigoInterfaz").val();
    data.teamId = getDDL($("#ddlEquipo"));
    data.status = getDDL($("#ddlEstadoAplicacion"));
    data.unit = $("#hdUnidadId").val();
    data.managed = getDDL($("#ddlGestionadoPor"));
    data.summaryStandard = $("#txtSummaryStandard").val();
    data.complianceLevel = $("#txtComplianceLevel").val();
    data.userEntity = $("#ddlEntidades").val() !== null ? $("#ddlEntidades").val().join(",") : "";
    data.infrastructure = getDDL($("#ddlInfraestructura"));
    data.replacementApplication = $("#hCodigoReemplazada").val() == "0" ? '' : $.trim($("#hCodigoReemplazada").val()).toUpperCase();
    data.authorizationMethod = getDDL($("#ddlAutorizacion"));
    data.authenticationMethod = getDDL($("#ddlAutenticacion"));
    data.groupTicketRemedy = $("#hGrupoTicketRemedy").val();
    data.webDomain = $("#txtURL").val();
    data.developmentType = $("#ddlTipoDesarrollo").val();
    data.developmentProvider = $("#txtProveedorDesarrollo").val();
    data.Expertos = OWNER_LIST;
    data.nombreArchivo = $("#txtArchivo").val();

    data.TipoPCI = $("#ddlPCI").val() !== null ? $("#ddlPCI").val() : "";

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
        url: URL_API_VISTA + "/application/steptwo/Update",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    let dataResult = dataObject;

                    if ($("#flArchivo").val() != null) { CargarArchivos(dataResult.SolUserIt, data.AppId) }

                    bootbox.confirm({
                        message: "La modificación de campos se realizó con éxito.",
                        closeButton: false,
                        buttons: {
                            confirm: {
                                label: 'Seguiré modificando otra aplicación',
                                className: 'btn-success'
                            },
                            cancel: {
                                label: 'Ver la bandeja de solicitudes',
                                className: 'btn-danger'
                            }
                        },
                        callback: function (result) {
                            if (!result)
                                window.document.location.href = `/RegistroPortafolioAplicaciones/BandejaModificacionAplicaciones`;
                            else
                                window.document.location.href = `/RegistroPortafolioAplicaciones/BandejaAplicaciones`;
                        }
                    });
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
                GetPersonaSIGA(ui.item.matricula);
                //$("#hExpertoCorreo").val(ui.item.mail);
                if (EmailPersona != null) {
                    $("#hExpertoCorreo").val(EmailPersona);

                } else {
                    $("#hExpertoCorreo").val(ui.item.mail);

                }
                $("#hExpertoMatricula").val(ui.item.matricula);
                $("#txtExperto").val("");
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
        url: URL_API_VISTA + "/application/steptwo/lists",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoImplementacion, $("#ddlTipoImplementacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ModeloEntrega, $("#ddlModeloEntrega"), TEXTO_SELECCIONE);
                    SetItems(dataObject.GestionadPor, $("#ddlGestionadoPor"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoImplementacion, $("#ddlTipoImplementacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Arquitecto, $("#ddlArquitectoNegocio"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ModeloEntrega, $("#ddlModeloEntrega"), TEXTO_SELECCIONE);

                    //SetItems(dataObject.GestionadPor, $("#ddlGestionadoPor"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoDesarrollo, $("#ddlTipoDesarrollo"), TEXTO_SELECCIONE);
                    
                    SetItems(dataObject.MetodoAutenticacion, $("#ddlAutenticacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.MetodoAutorizacion, $("#ddlAutorizacion"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.EntidadesUsuarias, $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TipoPCI, $("#ddlPCI"), TEXTO_SELECCIONE, TEXTO_TODOS, true);

                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function cargarComboInfraestructura(AppId) {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/steptwo/infraestructure/" + AppId,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Infraestructura, $("#ddlInfraestructura"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
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

function changeGestionado() {
    var gestionado = $('#ddlGestionadoPor').val();
    if (gestionado != -1) {
        cargarEquipos($("#ddlGestionadoPor").val());
    }
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

function VerifyInputs() {
    var gestionado = $('#ddlGestionadoPor').val();
    if (gestionado != -1) {
        let objGestionado = obtenerGestionadoPor(gestionado);
        if (objGestionado.FlagUserIT == true || objGestionado.FlagSubsidiarias == true || objGestionado.FlagJefeEquipo == false) {
            if ($('#ddlGestionadoPor').val() != -1 && $('#ddlTipoImplementacion').val() != -1 && $('#ddlEstadoAplicacion').val() != -1 && $('#ddlModeloEntrega').val() != -1 &&
                $('#ddlInfraestructura').val() != -1 && $('#ddlAutorizacion').val() != -1 && $('#ddlAutenticacion').val() != -1 && $('#ddlTipoDesarrollo').val() != -1 &&
                $('#ddlArquitectoNegocio').val() != -1 && $('#txtNombre').val() != "" && $('#txtDescripcion').val() != "" &&
                $('#txtExperto').val() != "" && $('#txtGrupoTicketRemedy').val() != "" && $('#txtUnidad').val() != "" && $('#txtProveedorDesarrollo').val() != "" &&
                $('#ddlEntidades').val() != null) { return true; }
            else return false;
        }
        else {
            if ($('#ddlGestionadoPor').val() != -1 && $('#ddlTipoImplementacion').val() != -1 && $('#ddlEstadoAplicacion').val() != -1 && $('#ddlModeloEntrega').val() != -1 &&
                $('#ddlInfraestructura').val() != -1 && $('#ddlAutorizacion').val() != -1 && $('#ddlAutenticacion').val() != -1 && $('#ddlTipoDesarrollo').val() != -1 &&
                $('#ddlEquipo').val() != -1 && $('#ddlArquitectoNegocio').val() != -1 && $('#txtNombre').val() != "" && $('#txtDescripcion').val() != "" &&
                $('#txtExperto').val() != "" && $('#txtGrupoTicketRemedy').val() != "" && $('#txtUnidad').val() != "" && $('#txtProveedorDesarrollo').val() != "" &&
                $('#ddlEntidades').val() != null) { return true; }
            else return false;
        }
    }
    else
        return false;
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
                    $("#divApp2").find("span").each(function () { IDs.push(this.id); });

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


function CargarArchivos(id, appId) {
    //if ($("#formDesactivar").valid()) {

    let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
    UploadTempFile($("#flArchivo"), archivoId, false, id, appId);
    //listarRegistros();
    //toastr.success("Registrado correctamente", TITULO_MENSAJE);

    //}
}

function descargarArchivo() {
    var AppId = $('#hdAplicacionId').val();
    DownloadFile3(AppId);
}

function obtenerGestionadoPor(id) {
    let gestionado = null;
    if (id != -1) {
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
    }
    return gestionado;
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
                //$("#hExpertoCorreo").val(ui.item.mail);
                GetPersonaSIGA(ui.item.matricula);
                if (EmailPersona != null) {
                    $("#hExpertoCorreo").val(EmailPersona);
                    var data = { username: ui.item.matricula, managerName: NombrePersona, applicationManagerId: 3, email: EmailPersona }
                } else {
                    $("#hExpertoCorreo").val(ui.item.mail);
                    var data = { username: ui.item.matricula, managerName: ui.item.displayName, applicationManagerId: 3, email: ui.item.mail }
                }
                $("#hExpertoMatricula").val(ui.item.matricula);
                $("#txtExperto").val("");
                control = ui.item.displayName.length;
                //var data = { username: ui.item.matricula, managerName: ui.item.displayName, applicationManagerId: 3, email: ui.item.mail }
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
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function CrearObjPersona(matricula) {
    var data = {};
    data.Matricula = matricula;


    return data;
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


function ListarExpertos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/application/expertos",
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
        }
    });

    $('table').bootstrapTable({
        data: OWNER_LIST
    });
}

function opcionesFormatter(value, row) { 


    verOwner = `<a href=# onclick="javascript:eliminarExperto('${row.username}')" title="Elimnar Experto de lista"><i class="glyphicon glyphicon-remove table-icon"></i></a>`;

    return verOwner;
}


function eliminarExperto(username) {

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

//function TipoDesarrollo_Change() {
//    let tipoDesarrollo = $("#ddlTipoDesarrollo").val();
//    //if (tipoDesarrollo == TIPO_DESARROLLO_INTERNO) {
//    //    $("#txtProveedorDesarrollo").val('NO APLICA');
//    //    $("#txtProveedorDesarrollo").attr("disabled", "disabled");
//    //}
//    //else {
//    //    $("#txtProveedorDesarrollo").val('');
//    //    $("#txtProveedorDesarrollo").removeAttr("disabled");
//    //}
//}

function Estado_Change() {
    var valor = $("#ddlEstadoAplicacion").val();
    if (valor == ESTADO_VIGENTE) {
        $("#ddlTipoImplementacion").val(tipoImplementacionProduccion);
        $("#ddlTipoImplementacion").attr("disabled", "disabled");
    }
    else {
        $("#ddlTipoImplementacion").removeAttr("disabled");
        $("#ddlTipoImplementacion").val(tipoImplementacionInicial);
    }
}