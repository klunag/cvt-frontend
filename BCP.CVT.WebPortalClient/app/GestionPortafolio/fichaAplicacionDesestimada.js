const URL_API_VISTA = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Portafolio de Aplicaciones";
const MENSAJE = "¿Estás seguro de actualizar los datos de la aplicación?";
const MENSAJE_CONFIRMACION = "Se actualizó la aplicación de manera satisfactoria. ¿Deseas continuar con la actualización?";
const TIPO_DESARROLLO_INTERNO = 178;
const TIPO_WEB = 154;
const ID_USERIT = 1;

var $table = $("#tblRegistro");

var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "Name";
var ULTIMO_SORT_ORDER = "asc";

var cambiarInterface = true;

$(function () {
    $("#ddlEntidades").multiselect('enable');

    SetItemsMultiple([], $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);

    $("#txtCodigoInterfaz").hide();
    InitAutocompletarEstandarBuilder($("#txtUnidad"), $("#hdUnidadId"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro?filtro={0}&filtroPadre=");
    InitAutocompletarUsuariosLocal($("#txtExperto"), $("#hExpertoId"), ".divExpertoContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
    $("#btnRegistrarApp").click(guardarAddOrEditApp);
    $("#btnCancelar").click(cancelarAddOrEditApp);

    $("#btnRegistrarApp2").click(guardarAddOrEditApp);
    $("#btnCancelar2").click(cancelarAddOrEditApp);

    $("#ddlGestionadoPor").change(changeGestionado);

    $("#btnDescargar").click(descargarArchivo);
    $("#btnDescargar2").click(descargarArchivo2);

    cargarCombos();
    initFecha();

    FormatoCheckBox($("#divFlagInterface"), "ckbInterface");
    $("#ckbInterface").change(FlagInterface_Change);
    if (APLICACION_ID !== 0) {
        editarAplicacion(APLICACION_ID);
    } else {
        window.document.location.href = "CatalogoAplicacion";
    }
    var Unidad_Id

    $("#txtUnidad").change(function () {
        Unidad_Id = $("#hdUnidadId").val();
        CambioUnidad(APLICACION_ID, Unidad_Id)
    });

    $("#ddlCriticidadBIAN").change(calcularCriticidad);
    $("#ddlClasificacionActivo").change(calcularCriticidad);
    $("#ddlTipoDesarrollo").change(TipoDesarrollo_Change);

    validarFormApp();

    InitAutocompletarBuilder($("#txtCodigoAppPadre"), $("#hCodigoPadre"), ".containerPadreAplicacion", "/applicationportfolio/application/filter?filtro={0}");
    setDefaultHd($("#txtCodigoAppPadre"), $("#hCodigoPadre"));

    InitAutocompletarBuilder($("#txtGrupoTicketRemedy"), $("#hGrupoTicketRemedy"), ".containerGrupoRemedy", "/applicationportfolio/application/ListGroupRemedy?filtro={0}");
    setDefaultHd($("#txtGrupoTicketRemedy"), $("#hGrupoTicketRemedy"));

    InitAutocompletarBuilder($("#txtAplicacionReemplazada"), $("#hCodigoReemplazada"), ".containerReemplazoAplicacion", "/applicationportfolio/application/filter?filtro={0}");
    setDefaultHd($("#txtAplicacionReemplazada"), $("#hCodigoReemplazada"));
});

function TipoDesarrollo_Change() {
    let tipoDesarrollo = $("#ddlTipoDesarrollo").val();
    if (tipoDesarrollo == TIPO_DESARROLLO_INTERNO) {
        $("#txtProveedorDesarrollo").val('NO APLICA');
        $("#txtProveedorDesarrollo").attr("disabled", "disabled");
    }
    else {
        $("#txtProveedorDesarrollo").val('');
        $("#txtProveedorDesarrollo").removeAttr("disabled");
    }
}

function initFecha() {
    $("#divFechaSolicitud").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
}

function calcularCriticidad() {
    var criticidad = parseInt($("#ddlCriticidadBIAN").val());
    var clasificacion = parseInt($("#ddlClasificacionActivo").val());
    var final = devolverCriticidad(criticidad, clasificacion);

    $("#ddlNuevaCriticidad").val(final);
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
    window.document.location.href = "CatalogoAplicacion";
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
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}


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
                    if (data.NombreArchivoSeguridad == null) {
                        document.getElementById('btnDescargar2').style.display = 'none';
                    }
                    $("#txtArea").val(data.areaName);
                    $("#txtDivision").val(data.divisionName);
                    $("#txtGerencia").val(data.gerenciaName);

                    $("#hdAplicacionId").val(APLICACION_ID);
                    $("#txtCodigoAPT").val(data.applicationId);
                    $("#ddlGestionadoPor").val(data.managed || "-1");
                    $("#txtNombre").val(data.applicationName);
                    $("#txtDescripcion").val(data.description);
                    if (data.parentAPTCode != '') {
                        $("#txtCodigoAppPadre").val(data.parentAPT);
                        $("#hCodigoPadre").val(data.parentAPTCode);
                    }
                    $("#txtUnidad").val(data.unit);
                    $("#txtEquipoSquad").val(data.teamName);
                    $("#txtUnidad").val(data.unitDetail);

                    if (data.managed == ID_USERIT) {
                        $("#ddlEquipo").empty();
                        $('#ddlEquipo').append('<option value="-1" selected="selected">NO APLICA</option>');
                    }
                    else {
                        $("#ddlEquipo").empty();
                        cargarEquipos($("#ddlGestionadoPor").val());
                    }

                    $("#ddlEquipo").val(data.teamId || "-1");
                    $("#hdUnidadId").val(data.unit || "-1");

                    $("#txtProveedorDesarrollo").val(data.developmentProvider);
                    if (data.replacementApplication != '' && data.replacementApplication != null) {
                        $("#txtAplicacionReemplazada").val(data.replacementAPT);
                        $("#hCodigoReemplazada").val(data.replacementApplication);
                    }

                    $("#ddlTipoImplementacion").val(data.implementationType || "-1");
                    $("#ddlModeloEntrega").val(data.deploymentType || "-1");
                    $("#ddlEstadoAplicacion").val(data.status || "-1");
                    $("#ddlArquitectoNegocio").val(data.architecId || "-1");

                    $("#ddlEntidades").val(data.userEntity !== null ? data.userEntity.split(",") : "-1"); //app.AplicacionDetalle
                    $("#ddlEntidades").multiselect("refresh");

                    $("#ddlTipoDesarrollo").val(data.developmentType || "-1");
                    $("#ddlInfraestructura").val(data.infrastructure || "-1");
                    $("#ddlAutorizacion").val(data.authorizationMethod || "-1");
                    $("#ddlAutenticacion").val(data.authenticationMethod || "-1");

                    $("#hExpertoMatricula").val(data.expertId);
                    $("#txtExperto").val(data.expertName);
                    $("#hExpertoCorreo").val(data.expertEmail);

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

                    //$("#ddlGrupoTicketRemedy").val(data.groupTicketRemedy || "-1");

                    if (data.groupTicketRemedy != '') {
                        $("#txtGrupoTicketRemedy").val(data.grupoTicketRemedyName);
                        $("#hGrupoTicketRemedy").val(data.groupTicketRemedy);
                    }

                    $("#txtURL").val(data.webDomain);
                    $("#txtComplianceLevel").val(data.complianceLevel);
                    $("#txtSummaryStandard").val(data.summaryStandard);
                    document.getElementById("lblMotivo").innerHTML=data.commentsObserved;

                    //Segunda Tab
                    $("#txtTipoActivo").val(data.tipoActivoName);
                    $("#txtAreaBIAN").val(data.areaBIANName);
                    $("#txtDominioBIAN").val(data.dominioBIANName);
                    $("#txtJefaturaATI").val(data.jefaturaATIName);
                    $("#txtTOBE").val(data.TOBEName);
                    $("#txtCategoriaTecnologica").val(data.categoriaTecnologicaName);
                    $("#txtClasificacionTecnica").val(data.clasificacionTecnicaName);
                    $("#txtSubClasificacionTecnica").val(data.subClasificacionTecnicaName);
                    $("#txtUsuarioAutorizador").val(data.usuarioAutorizadorName);
                    $("#txtTIERProduccion").val(data.TIERProduccionName);
                    $("#txtTIERPreProduccion").val(data.TIERPreProduccionName);
                    $("#txtBroker").val(data.brokerName);
                    $("#txtTribeLead").val(data.tribeLeadName);
                    $("#txtTechnicalTribeLead").val(data.technicalTribeLeadName);
                    $("#txtJefeEquipo").val(data.jefeEquipoName);
                    $("#txtLiderUsuario").val(data.liderUsuarioName);
                    //$("#txtGrupoTicketRemedy").val(data.grupoTicketRemedyName);
                    $("#txtURLCertificadosDigitales").val(data.urlCertificadosDigitalesName);

                    $("#ddlCriticidadBIAN").val(data.applicationCriticalityBIA || "-1");
                    $("#ddlClasificacionActivo").val(data.classification || "-1");
                    $("#ddlNuevaCriticidad").val(data.finalCriticality || "-1");

                    $("#txtProductoServicioRepresentativo").val(data.ProductoServicioRepresentativoName);
                    $("#txtMenorRTO").val(data.MenorRTOName);
                    $("#txtMayorGradoInterrupcion").val(data.MayorGradoInterrupcionName);
                    $("#dpFechaSolicitud").val(data.fechaPaseProduccionName);

                    if (data.technologyCategory != null) {
                        if (data.technologyCategory != TIPO_WEB) {
                            $("#txtURL").val("NO APLICA");
                            $("#txtURL").attr("disabled", "disabled");
                        }
                    }
                    if (data.NombreArchivoDesestimacion == null) {
                        document.getElementById('btnDescargar').style.display = 'none';
                    }
                    ListarRoles();
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
                        let nextCodigoAPT = ObtenerUltimoCodigoAptByParametro();
                        $("#txtCodigoApt").val(nextCodigoAPT);
                    }
                }
            }
        });
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

    $.validator.addMethod("existeNombreAplicacion", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 3) {
            estado = !ExisteNombreAplicacion(valor);
            return estado;
        }
        return estado;
    });
    $.validator.addMethod('maxStrict', function (value, el, param) {
        return value <= 100;
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
                existeNombreAplicacion: true
            },
            txtDescripcion: {
                requiredSinEspacios: true
            },
            txtCodigoAppPadre: {
                minlength: 4
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
            txtMenorRTO: {
                maxlength: 3,
                number: true,
                maxStrict: true,
                digits: true
            },
            txtMayorGradoInterrupcion: {
                maxlength: 3,
                number: true,
                maxStrict: true,
                digits: true
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
                minlength: "El código de aplicación debe de tener 4 caracteres"
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
            txtMenorRTO: {
                maxlength: "El valor no puede tener más de 3 dígitos",
                number: "Solo se permiten números",
                maxStrict: "El valor no puede ser mayor a 100",
                digits: "Solo se permiten números enteros"
            },
            txtMayorGradoInterrupcion: {
                maxlength: "El valor no puede tener más de 3 dígitos",
                number: "Solo se permiten números",
                maxStrict: "El valor no puede ser mayor a 100",
                digits: "Solo se permiten números enteros"
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
    data.AppId = $("#hdAplicacionId").val();
    data.managed = getDDL($("#ddlGestionadoPor")); // $("#ddlGerenciaCentral").val(); ////cvt.Aplicacion
    data.applicationName = $.trim($("#txtNombre").val()).toUpperCase(); // $("#ddlDivision").val(); //cvt.Aplicacion
    data.implementationType = getDDL($("#ddlTipoImplementacion")); // $("#ddlArea").val(); //cvt.Aplicacion
    data.description = $.trim($("#txtDescripcion").val()); //cvt.Aplicacion
    data.deploymentType = getDDL($("#ddlModeloEntrega")); //cvt.Aplicacion
    data.parentAPTCode = $("#hCodigoPadre").val() == "0" ? '' : $.trim($("#hCodigoPadre").val()).toUpperCase(); //$.trim($("#txtNombreApp").val()); //cvt.Aplicacion    
    data.teamId = getDDL($("#ddlEquipo"));
    data.userEntity = $("#ddlEntidades").val() !== null ? $("#ddlEntidades").val().join(",") : "";
    data.developmentType = getDDL($("#ddlTipoDesarrollo"));
    data.developmentProvider = $.trim($("#txtProveedorDesarrollo").val()).toUpperCase();
    data.infrastructure = getDDL($("#ddlInfraestructura"));
    data.hasInterfaceId = $("#ckbInterface").prop("checked");
    data.interfaceId = $("#txtCodigoInterfaz").val();
    data.replacementApplication = $("#hCodigoReemplazada").val() == "0" ? '' : $.trim($("#hCodigoReemplazada").val()).toUpperCase();
    data.architectId = getDDL($("#ddlArquitectoNegocio")); //$("#ddlAreaBIAN").val();  //cvt.Aplicacion
    data.authorizationMethod = getDDL($("#ddlAutorizacion"));
    data.authenticationMethod = getDDL($("#ddlAutenticacion"));
    data.expertId = $("#hExpertoMatricula").val();
    data.expertName = $("#txtExperto").val();
    data.expertEmail = $("#hExpertoCorreo").val();
    data.unit = $("#hdUnidadId").val();
    data.groupTicketRemedy = $("#hGrupoTicketRemedy").val();
    data.webDomain = $("#txtURL").val();
    data.applicationCriticalityBIA = getDDL($("#ddlCriticidadBIAN"));
    data.classification = getDDL($("#ddlClasificacionActivo"));
    data.finalCriticality = getDDL($("#ddlNuevaCriticidad"));

    data.starProduct = $("#txtProductoServicioRepresentativo").val();
    data.shorterApplicationResponseTime = $("#txtMenorRTO").val();
    data.highestDegreeInterruption = $("#txtMayorGradoInterrupcion").val();
    data.dateFirstRelease = castDate($("#dpFechaSolicitud").val());

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
        url: URL_API_VISTA + "/application/stepadmin",
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
                                    label: 'Si, deseo continuar',
                                    className: 'btn-success'
                                },
                                cancel: {
                                    label: 'No, continuaré luego',
                                    className: 'btn-danger'
                                }
                            },
                            callback: function (result) {
                                if (!result)
                                    window.document.location.href = "CatalogoAplicacion";
                            }
                        });

                    } else {
                        MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación no existe o se ha encontrado un inconveniente en la actualización, vuelve a intentarlo.");
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
                    SetItems(dataObject.Arquitecto, $("#ddlArquitectoNegocio"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ModeloEntrega, $("#ddlModeloEntrega"), TEXTO_SELECCIONE);

                    SetItems(dataObject.GestionadPor, $("#ddlGestionadoPor"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoDesarrollo, $("#ddlTipoDesarrollo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Infraestructura, $("#ddlInfraestructura"), TEXTO_SELECCIONE);
                    SetItems(dataObject.MetodoAutenticacion, $("#ddlAutenticacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.MetodoAutorizacion, $("#ddlAutorizacion"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.EntidadesUsuarias, $("#ddlEntidades"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.EntidadesUsuarias, $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_TODOS, true);

                    //SetItems(dataObject.GrupoTicketRemedy, $("#ddlGrupoTicketRemedy"), TEXTO_SELECCIONE);

                    SetItems(dataObject.BIA, $("#ddlCriticidadBIAN"), TEXTO_SELECCIONE);
                    SetItems(dataObject.CriticidadFinal, $("#ddlNuevaCriticidad"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ClasificacionActivos, $("#ddlClasificacionActivo"), TEXTO_SELECCIONE);
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
    cargarEquipos($("#ddlGestionadoPor").val());

    let userIT = $("#ddlGestionadoPor").val();
    if (userIT == ID_USERIT)
        $(".divInterfaz").hide();
    else
        $(".divInterfaz").show();
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

function ListarRoles() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/application/roles",
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

function devolverCriticidad(bia, clasificacion) {
    if (bia === -1)
        return -1;
    if (clasificacion === -1)
        return -1;

    if (bia === BIA.MuyAlta) {
        return CriticidadFinal.MuyAlta;
    }
    else if (bia === BIA.Alta) {
        if (clasificacion === ClasificacionActivos.Restringido)
            return CriticidadFinal.MuyAlta;
        else
            return CriticidadFinal.Alta;
    }
    else if (bia === BIA.Media) {
        if (clasificacion === ClasificacionActivos.Restringido)
            return CriticidadFinal.Alta;
        else
            return CriticidadFinal.Media;
    }
    else if (bia === BIA.Baja) {
        if (clasificacion === ClasificacionActivos.Restringido)
            return CriticidadFinal.Alta;
        else
            return CriticidadFinal.Baja;
    }
}

function descargarArchivo() {
    var AppId = $('#hdAplicacionId').val();
    DownloadFile2(AppId);
}

function descargarArchivo2() {
    var AppId = $('#hdAplicacionId').val();
    DownloadFile3(AppId);
}