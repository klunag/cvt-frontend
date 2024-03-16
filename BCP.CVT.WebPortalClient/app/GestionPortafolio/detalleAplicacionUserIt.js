const URL_API_VISTA = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Portafolio de Aplicaciones";
const MENSAJE = "¿Estás seguro de actualizar los datos de la aplicación?";
const MENSAJE_CONFIRMACION = "Se registró la aplicación de manera parcial. Recuerda que es necesario que completes todos los datos de tu aplicación  para que tenga la  aprobación de todos los responsables y complete su registro en portafolio. Cuentas con un plazo máximo de 3 días apartir de la fecha de registro.  ¿Deseas completar los datos?";
const MENSAJE_CONFIRMACION2 = "Se actualizó la aplicación de manera satisfactoria.";
const ID_USERIT = 1;
var cambiarInterface = true;
const tituloMensaje = "Portafolio de Aplicaciones";

const TIPO_DESARROLLO_INTERNO = 178;
const TIPO_WEB = 154;

$(function () {

    $("#divFechaRegularizacion").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY",
        maxDate: Date.now()
    });
    $(".fechaFormalizacion").hide();
    $("#ddlEntidades").multiselect('enable');
    SetItemsMultiple([], $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);

    $("#txtCodigoInterfaz").hide();    
    $("#btnRegistrarApp").click(guardarAddOrEditApp);
    $("#btnCancelar").click(cancelarAddOrEditApp);
    $("#ddlGestionadoPor").change(GestionadoPor_Change);
    $("#btnDescargar").click(descargarArchivo);
    FormatoCheckBox($("#divFlagInformal"), "ckbInformal"); 
    $("#ckbInformal").change(FlagInformal_Change);
    cargarCombos();
    cargarToolbox();
    validarFormApp();
    initUpload($("#txtArchivo"));

    FormatoCheckBox($("#divFlagInterface"), "ckbInterface");
    $("#ckbInterface").change(FlagInterface_Change);
    if (APLICACION_ID !== 0) {
        editarAplicacion(APLICACION_ID);
    } else {
        window.document.location.href = `/RegistroPortafolioAplicaciones/Bandeja?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;
    }
    
    $("#ddlTipoImplementacion").attr("disabled", "disabled");
});

function FlagInformal_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $(".fechaFormalizacion").show();
    }
    else {
        $(".fechaFormalizacion").hide();
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

function GestionadoPor_Change() {
    let gestionado = $("#ddlGestionadoPor").val();
    if (gestionado == ID_USERIT) {
        $(".divInterfaz").hide();
        $("#ddlEquipo").empty();
        $('#ddlEquipo').append('<option value="-1" selected="selected">NO APLICA</option>');

        $("#ddlEquipo").attr("disabled", "disabled");
        $(".datosUserIT").show();
    }
    else {
        $(".divInterfaz").show();
        $("#ddlEquipo").empty();
        $('#ddlEquipo').append('<option value="-1" selected="selected">Seleccione</option>');
        $("#ddlEquipo").removeAttr("disabled");
        $(".datosUserIT").hide();
        $("#txtArchivo").val(TEXTO_SIN_ARCHIVO)
        $("#flArchivo").val("");
        
        cargarEquipos(gestionado);
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
    window.document.location.href = `/GestionPortafolioAplicaciones/CatalogoAplicacionesUserIT?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;
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
                        document.getElementById('btnDescargar').style.display = 'none';
                    }
                    else if (data.NombreArchivoSeguridad != null) {
                        document.getElementById('btnDescargar').style.display = '';
                    }
                    $("#txtArchivo").val(data.NombreArchivoSeguridad);
                    $("#txtArea").val(data.areaName);
                    $("#txtDivision").val(data.divisionName);
                    $("#txtGerencia").val(data.gerenciaName);

                    $("#hdAplicacionId").val(APLICACION_ID);
                    $("#txtCodigoAPT").val(data.applicationId);
                    $("#ddlGestionadoPor").val(data.managed || "-1");

                    GestionadoPor_Change();

                    $("#txtNombre").val(data.applicationName);
                    $("#txtDescripcion").val(data.description);

                    if (data.parentAPTCode != '') {
                        $("#txtCodigoAppPadre").val(data.parentAPT);
                        $("#hCodigoPadre").val(data.parentAPTCode);
                    }


                    $("#txtUnidad").val(data.unit);
                    $("#txtEquipoSquad").val(data.teamName);
                    $("#txtUnidad").val(data.unitDetail);
                    //cargarEquipos($("#ddlGestionadoPor").val());
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

                    //$("#hGrupoTicketRemedy").val(data.groupTicketRemedy || "-1");
                    if (data.groupTicketRemedy != '') {
                        $("#txtGrupoTicketRemedy").val(data.grupoTicketRemedyName);
                        $("#hGrupoTicketRemedy").val(data.groupTicketRemedy);
                    }
                    $("#txtURL").val(data.webDomain);

                    $("#ckbInformal").prop('checked', data.isFormalApplication);
                    $("#ckbInformal").bootstrapToggle(data.isFormalApplication ? 'on' : 'off');                      

                    if (data.isFormalApplication) {
                        $(".fechaFormalizacion").show();
                        $("#dpFechaRegularizacion").val(data.regularizationDateDetail);
                    }
                    else
                        $(".fechaFormalizacion").hide();                   

                    $("#txtComplianceLevel").val(data.complianceLevel);
                    $("#txtSummaryStandard").val(data.summaryStandard);

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
                    $("#txtCriticidadBIAN").val(data.criticidadBIANName);
                    $("#txtClasificacionActivo").val(data.clasificacionActivoName);
                    $("#txtNuevaCriticidad").val(data.nuevaCriticidadName);
                    $("#txtProductoServicioRepresentativo").val(data.ProductoServicioRepresentativoName);
                    $("#txtMenorRTO").val(data.MenorRTOName);
                    $("#txtMayorGradoInterrupcion").val(data.MayorGradoInterrupcionName);
                    $("#txtFechaPaseProduccion").val(data.FechaPaseProduccionName);

                    $("#ckbInterface").attr("disabled", "disabled");
                    
                    if (data.technologyCategory != null) {
                        if (data.technologyCategory != TIPO_WEB) {
                            $("#txtURL").val("NO APLICA");
                            $("#txtURL").attr("disabled", "disabled");
                        }
                    }

                    if (data.hasDevSecOpsApproved)
                        $("#ddlModeloEntrega").attr("disabled", "disabled");

                    if (data.hasArchitectEvalApproved)
                        $("#ddlArquitectoNegocio").attr("disabled", "disabled");
                    
                    if (data.hasOwnerApproved)
                        $("#txtUnidad").attr("disabled", "disabled");                   
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
            txtComplianceLevel: {
                noEsNumero: "Debes ingresar un número",
                maxStrict: "El valor no puede ser mayor a 100",
                blankSpace: "El valor no puede ser un espacio en blanco"
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
    data.summaryStandard = $("#txtSummaryStandard").val();
    data.complianceLevel = $("#txtComplianceLevel").val();
    data.isFormalApplication = $("#ckbInformal").prop("checked");
    if (data.isFormalApplication == true)
        data.regularizationDate = castDate($("#dpFechaRegularizacion").val());
    data.status = getDDL($("#ddlEstadoAplicacion"));

    return data;
}

function sendDataFormAPI($form, $btn, title) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjAplicacion();

    if ($("#flArchivo").val() != null) { CargarArchivos(data.AppId) }

    $.ajax({
        url: URL_API_VISTA + "/application/steptwo/UpdateUserIT",
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
                        window.document.location.href = `/GestionPortafolioAplicaciones/CatalogoAplicacionesUserIT?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;

                    }
                    else {
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
                    SetItemsMultiple(dataObject.EntidadesUsuarias, $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_TODOS, true);

                    //SetItems(dataObject.GrupoTicketRemedy, $("#ddlGrupoTicketRemedy"), TEXTO_SELECCIONE);
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

//function changeGestionado() {
//    cargarEquipos($("#ddlGestionadoPor").val());
//}

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


function CargarArchivos(id) {
    //if ($("#formDesactivar").valid()) {

    let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
    //debugger;
    UploadFile3($("#flArchivo"), archivoId, false, id);
    debugger;
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