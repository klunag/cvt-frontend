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
var flag = true;
var $table = $("#tblRegistro");
var OWNER_LIST = [];
var indexActual = 0;

$(function () {
    getCurrentUser();

    $("#ddlEntidades").multiselect('enable');
    SetItemsMultiple([], $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);

    $("#btnRegistrarApp").click(guardarAddOrEditApp);
    $("#btnCancelar").click(cancelarAddOrEditApp);

    $("#btnDescargar").click(descargarArchivo);
    $("#msjUsuarioRepetido").hide();
    InitAutocompletarUsuariosLocal($("#txtExperto"), $("#hExpertoId"), ".divUsuarioExpertoContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");

    cargarCombos();
    cargarToolbox();
    validarFormApp();
    initUpload($("#txtArchivo"));

    ListarExpertos();

    if (APLICACION_ID !== 0) {
        editarAplicacion(APLICACION_ID);
    } else {
        window.document.location.href = `/RegistroPortafolioAplicaciones/Bandeja?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;
    }
    FormatoCheckBox($("#divFlagUsuario"), "ckbFlagUsuario");
    $("#ckbFlagUsuario").change(FlagUsuario_Change);
    $("#txtExperto").focusout(function () {
        let valor = $("#txtExperto").val().length;
        if (valor != control)
            $("#txtExperto").val('');
    });

    InitAutocompletarBuilder($("#txtGrupoTicketRemedy"), $("#hGrupoTicketRemedy"), ".containerGrupoRemedy", "/applicationportfolio/application/ListGroupRemedy?filtro={0}");
    setDefaultHd($("#txtGrupoTicketRemedy"), $("#hGrupoTicketRemedy"));

    InitAutocompletarBuilder($("#txtAplicacionReemplazada"), $("#hCodigoReemplazada"), ".containerReemplazoAplicacion", "/applicationportfolio/application/filter?filtro={0}");
    setDefaultHd($("#txtAplicacionReemplazada"), $("#hCodigoReemplazada"));

    $("#txtAplicacionReemplazada").focusout(function () {
        let valor = $("#hCodigoReemplazada").val();
        if (valor == '0') {
            $("#txtAplicacionReemplazada").val('');
            toastr.error("El código de aplicación reemplazado no es válido, por favor seleccione una aplicación que se haya registrado en el portafolio.", TITULO_MENSAJE);
        }
    });


});

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




function cancelarAddOrEditApp() {
    window.document.location.href = `/RegistroPortafolioAplicaciones/BandejaAplicaciones`;
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

                    $("#hdAplicacionId").val(APLICACION_ID);
                    $("#txtCodigoAPT").val(data.applicationId);
                    $("#txtNombre").val(data.applicationName);

                    if (data.replacementApplication != '' && data.replacementApplication != null) {
                        $("#txtAplicacionReemplazada").val(data.replacementAPT);
                        $("#hCodigoReemplazada").val(data.replacementApplication);
                    }

                    $("#ddlEntidades").val(data.userEntity !== null ? data.userEntity.split(",") : "-1"); //app.AplicacionDetalle
                    $("#ddlEntidades").multiselect("refresh");

                    $("#ddlInfraestructura").val(data.infrastructure || "-1");
                    $("#ddlAutorizacion").val(data.authorizationMethod || "-1");
                    $("#ddlAutenticacion").val(data.authenticationMethod || "-1");
                    $("#ddlTipoDesarrollo").val(data.developmentType || "-1");
                    $("#txtProveedorDesarrollo").val(data.developmentProvider);

                    if (data.groupTicketRemedy != '') {
                        $("#txtGrupoTicketRemedy").val(data.grupoTicketRemedyName);
                        $("#hGrupoTicketRemedy").val(data.groupTicketRemedy);
                    }
                    $("#txtURL").val(data.webDomain);

                    if (data.managed == ID_USERIT) {
                        $("#xtComplianceLevel").val(data.complianceLevel);
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




        //if ($("#formAddOrEditApp").valid()) {   
        if (true) {

            ValidarModificacion($("#formAddOrEditApp"),
                $("#btnRegistrarApp"),
                "Validado correctamente");
            if (flag) {
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
}

function ValidarModificacion($form, $btn, title) {

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
            //txtAplicacionReemplazada: {
            //    requiredSinEspacios: true,
            //},
            ddlEntidades: {
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
            txtGrupoTicketRemedy: {
                requiredSinEspacios: true,
            },
            txtURL: {
                requiredSinEspacios: true,
            },
            txtSummaryStandard: {
                requiredSinEspacios: true
            },
            txtComplianceLevel: {
                noEsNumero: true,
                maxStrict: true,
                blankSpace: true
            }
        },
        messages: {

            //txtAplicacionReemplazada: {
            //    requiredSinEspacios: "Debes de ingresar un nombre de aplicación reemplazada."
            //},
            ddlEntidades: {
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
            txtGrupoTicketRemedy: {
                requiredSinEspacios: "Debes de ingresar un nombre de grupo ticket remedy."
            },
            txtURL: {
                requiredSinEspacios: "Debes de ingresar un dominio web."
            },
            txtSummaryStandard: {
                requiredSinEspacios: "Debes de ingresar el resumen de lineamientos de seguridad."
            },
            txtComplianceLevel: {
                noEsNumero: "Debes ingresar un número",
                maxStrict: "El valor no puede ser mayor a 100",
                blankSpace: "El valor no puede ser un espacio en blanco"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "ddlEntidades"
                || element.attr('name') === "ddlInfraestructura"
                || element.attr('name') === "ddlAutenticacion"
                || element.attr('name') === "ddlAutorizacion"
                || element.attr('name') === "txtGrupoTicketRemedy"
                || element.attr('name') === "txtURL"
                || element.attr('name') === "txtSummaryStandard"
                || element.attr('name') === "txtComplianceLevel") {
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
    data.userEntity = $("#ddlEntidades").val() !== null ? $("#ddlEntidades").val().join(",") : "";
    data.infrastructure = getDDL($("#ddlInfraestructura"));
    data.replacementApplication = $("#hCodigoReemplazada").val() == "0" ? '' : $.trim($("#hCodigoReemplazada").val()).toUpperCase();
    data.authorizationMethod = getDDL($("#ddlAutorizacion"));
    data.authenticationMethod = getDDL($("#ddlAutenticacion"));
    data.groupTicketRemedy = $("#hGrupoTicketRemedy").val();
    data.webDomain = $("#txtURL").val();
    data.summaryStandard = $("#txtSummaryStandard").val();
    data.complianceLevel = $("#txtComplianceLevel").val();
    data.developmentType = $("#ddlTipoDesarrollo").val();
    data.developmentProvider = $("#txtProveedorDesarrollo").val();
    data.Expertos = OWNER_LIST;
    
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
                            buttons: {
                                confirm: {
                                    label: 'Seguiré modificando la aplicación',
                                    className: 'btn-success'
                                },
                                cancel: {
                                    label: 'De acuerdo, complete la modificación',
                                    className: 'btn-danger'
                                }
                            },
                            callback: function (result) {
                                if (!result)
                                    window.document.location.href = `/RegistroPortafolioAplicaciones/BandejaAplicaciones`;
                                else editarAplicacion(APLICACION_ID);
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

//function InitAutocompletarUsuariosLocal($searchBox, $IdBox, $container, urlController) {
//    $searchBox.autocomplete({
//        minLength: 3,
//        appendTo: $container,
//        source: function (request, response) {
//            if ($.trim(request.term) !== "") {

//                let urlControllerWithParams = String.Format(urlController, request.term);

//                if ($IdBox !== null) $IdBox.val("0");
//                $.ajax({
//                    url: urlControllerWithParams,
//                    type: "GET",
//                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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
//            $searchBox.val(ui.item.displayName);


//            return false;
//        },
//        select: function (event, ui) {
//            if ($IdBox != null) {
//                $IdBox.val(ui.item.id);
//                $("#hExpertoCorreo").val(ui.item.mail);
//                $("#hExpertoMatricula").val(ui.item.matricula);
//            }
//            return false;
//        }
//    }).autocomplete("instance")._renderItem = function (ul, item) {
//        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
//    };
//}

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

function changeGestionado() {
    cargarEquipos($("#ddlGestionadoPor").val());
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
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
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
