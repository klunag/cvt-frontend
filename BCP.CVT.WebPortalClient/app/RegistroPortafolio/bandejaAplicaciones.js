var $table = $("#tblRegistro");
var $tableRoles = $("#tblRoles");
var $tableFlujos = $("#tblFlujos");
var $tableFlujosAprobacion = $("#tblFlujosAprobacion");

var DATA_EXPORTAR = {};
var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION_ALT;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "applicationId";
var ULTIMO_SORT_ORDER = "asc";

const TITULO_MENSAJE = "Portafolio de aplicaciones";
const MENSAJE = "¿Estás seguro que deseas confirmar el registro de esta aplicación?, una vez que se confirme se informará a las diversas unidades sobre la creación y no será posible revertir el estado.";
const MENSAJE_RECHAZAR = "¿Estás seguro de rechazar la solicitud y notificar al custodio sobre ello?";
const MENSAJE_RECHAZAR_SOLICITANTE = "¿Estás seguro de rechazar la solicitud y notificar al solicitante sobre ello?";
const MENSAJE_ELIMINAR = "¿Estás seguro que deseas continuar con desactivación de esta aplicación?, esta operación no es reversible y eliminará la aplicación de manera permanente.";
const TITULO_NO_PASE = "La aplicación no ha completado el registro de todos los campos requeridos, no es posible consultar o confirmar estos datos";
const URL_API_VISTA = URL_API + "/applicationportfolio";

const TIPO_DESARROLLO_INTERNO = 178;
const TIPO_WEB = 154;
const ID_USERIT = 1;

$(function () {
    $("#ddlEntidades").multiselect('enable');
    SetItemsMultiple([], $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    $("#txtCodigoInterfaz").hide();

    cargarCombosDetalle();
    initUpload($("#txtArchivo"));
    $("#btnDescargar").click(descargarArchivo);
    ULTIMO_PAGE_NUMBER = PAGINA_ACTUAL;
    ULTIMO_REGISTRO_PAGINACION = PAGINA_TAMANIO;
    FormatoCheckBox($("#divFlagInterface"), "ckbInterface");
    $("#txtAplicacionFiltro").val(nombre_app);
    ListarRegistros();

    $("#txtAplicacionFiltro").keypress(function (event) {
        if (event.keyCode === 13) {
            $("#btnBuscar").click();
            event.preventDefault();
        }
    });

    //$('#divOtrosDatos').click(irOtrosDatos);
    $("#btnProcesarRechazo").click(guardarRechazoApp);
    $("#btnProcesarDesactivacion").click(eliminarAplicacion);
    $("#btnProcesarRechazoSolicitante").click(guardarRechazoAppSolicitante);

    validarFormRechazo();

    validarFormRechazoSolicitante();
});

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

function RefrescarListado() {
    ULTIMO_PAGE_NUMBER = 1;
    ListarRegistros();
    nombre_app=$("#txtAplicacionFiltro").val();
}

function AddRegistro() {
    $("#title-md").html("Nuevo registro");
    LimpiarModal();
    OpenCloseModal($("#mdRegistro"), true);
}

function LimpiarModal() {
    LimpiarValidateErrores($("#formNoVigente"));
    $(":input", "#formNoVigente").val("");
    $("#ckbEquipoAgil").prop("checked", false);
    $("#ckbEquipoAgil").bootstrapToggle("off");
}

function ListarRegistros() {
    nombre_app = $("#txtAplicacionFiltro").val();

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/requests/Asignadas`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION_ALT,
        sortName: ULTIMO_SORT_NAME,
        sortOrder: ULTIMO_SORT_ORDER,
        queryParams: function (p) {
            ULTIMO_PAGE_NUMBER = p.pageNumber;
            ULTIMO_REGISTRO_PAGINACION = p.pageSize;
            ULTIMO_SORT_NAME = p.sortName;
            ULTIMO_SORT_ORDER = p.sortOrder;

            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtAplicacionFiltro").val());
            DATA_EXPORTAR.applicationId = $.trim($("#txtAplicacionFiltro").val());
            DATA_EXPORTAR.pageNumber = ULTIMO_PAGE_NUMBER;
            DATA_EXPORTAR.pageSize = ULTIMO_REGISTRO_PAGINACION;
            DATA_EXPORTAR.sortName = ULTIMO_SORT_NAME;
            DATA_EXPORTAR.sortOrder = ULTIMO_SORT_ORDER;

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

function linkFormatter(value, row, index) {
    let option = value;
    option = `<a href="javascript:VerAplicacion(${row.id})" title="Editar registro">${value}</a>`;
    return option;
}

function VerAplicacion(id) {
    $("#hdAplicacionId").val(id);
    editarAplicacion(id);
}

function editarAplicacion(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        //url: URL_API_VISTA + `/application/GetFullDetail/${Id}`,
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
                    $("#txtArea").val(data.areaName);
                    $("#txtDivision").val(data.divisionName);
                    $("#txtGerencia").val(data.gerenciaName);

                    //$("#hdAplicacionId").val(id);
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

                    ListarRoles();

                }
            }
        },
        complete: function () {
            OpenCloseModal($("#modalVerAplicacion"), true);
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: true
    });

}

function opcionesFormatter(value, row, index) {

    let btnModificacion = `<a href="javascript:irDatosGenerales(${row.id})" title="Modificación de campos"><i class="iconoAmarillo glyphicon glyphicon glyphicon-pencil"></i></a>`;
       
    return btnModificacion;
 
} 

function irDatosGenerales(id) {
    $("#hdAplicacionId").val(id);
    window.document.location.href = `DatosGenerales?id=${$("#hdAplicacionId").val()}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}`;
}

//function irOtrosDatos() {
//    window.document.location.href = `OtrosDatos?id=${$("#hdAplicacionId").val()}`;
//}



//function irModificacionCampos(id) {
//    $("#hdAplicacionId").val(id);
//    OpenCloseModal($("#modalModificaciones"), true);
//}
function irObservar(id) {
    $("#hdAplicacionId").val(id);
    ListarRegistrosFlujos(id);
    OpenCloseModal($("#modalRechazarAplicacion"), true);
}

function irRechazar(id) {
    $("#hdFlowId").val(id);
    $("#txtDescripcionRechazo").val('');
    LimpiarValidateErrores($("#formRechazar"));
    OpenCloseModal($("#modalRechazar"), true);
}

function irDesactivar(id) {
    ;
    $("#txtArchivo").val(TEXTO_SIN_ARCHIVO)
    $("#txtDesFl").val("");
    $("#flArchivo").val("");
    $("#hdDesId").val(id);
    $("#txtDescripcionDesactivacion").val('');
    LimpiarValidateErrores($("#txtDescripcionDesactivacion"));
    OpenCloseModal($("#modalDesactivar"), true);
}

function irRechazoSolicitante(id) {
    $("#hdAplicacionId").val(id);
    $("#txtDescripcionRechazoSolicitante").val('');
    LimpiarValidateErrores($("#formRechazarSolicitante"));
    OpenCloseModal($("#modalRechazarSolicitante"), true);
}

function situacionFormatter(value, row, index) {
    var html = "";
    if (row.registrationSituation === REGISTRO_COMPLETO) { //VERDE
        html = `<a class="btn btn-success btn-circle" title="Registro completo" onclick="javascript:verFlujosAplicacion(${row.id},'${row.applicationId}','${row.name}')"></a>`;
    } else if (row.registrationSituation === REGISTRO_PARCIAL) { //ROJO
        html = `<a class="btn btn-danger btn-circle" title="Registro parcial" onclick="javascript:verFlujosAplicacion(${row.id},'${row.applicationId}','${row.name}')"></a>`;
    }
    return html;
}

function irConfirmar(id) {
    let data = {};
    data.Id = id;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/application/approved`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se confirmó la aplicación correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function () {
                        waitingDialog.hide();
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}

function ListarRegistrosFlujos(id) {
    $tableFlujos.bootstrapTable('destroy');
    $tableFlujos.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/flows`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: 1,
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "typeRegister",
        sortOrder: "asc",
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.id = $.trim($("#hdAplicacionId").val());

            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
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

function estadoFormatter(value, row, index) {
    var html = "";
    if (row.isCompleted === true) { //VERDE
        html = '<a class="btn btn-success btn-circle" title="Atendida"></a>';
    } else if (row.isCompleted === false) { //ROJO
        html = '<a class="btn btn-danger btn-circle" title="Pendiente de atención"></a>';
    }
    return html;
}

function verFlujosAplicacion(id, codApp, nombreApp) {
    $("#hdAplicacionId").val(id);
    ListarFlujosAprobacion(id);
    $("#spanApp").html(codApp + "-" + nombreApp);
    OpenCloseModal($("#modalVerFlujosAprobacion"), true);
}

function ListarFlujosAprobacion(id) {
    $tableFlujosAprobacion.bootstrapTable('destroy');
    $tableFlujosAprobacion.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/flows`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: 1,
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "typeRegister",
        sortOrder: "asc",
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.id = $.trim($("#hdAplicacionId").val());

            DATA_EXPORTAR.pageNumber = p.pageNumber;;
            DATA_EXPORTAR.pageSize = p.pageSize;;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
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

function dateFormat2(value, row, index) {
    if (value == null)
        return "-";
    else
        return moment(value).format('DD/MM/YYYY HH:mm:ss');
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
                    sendDataFormAPI($("#btnRegistrarApp"));
                }
            }
        });
    }
}

function guardarRechazoAppSolicitante() {
    if ($("#formRechazarSolicitante").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE_RECHAZAR_SOLICITANTE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                result = result || null;
                if (result !== null && result) {
                    sendDataFormAPISolicitante($("#btnRegistrarAppSolicitante"));
                }
            }
        });
    }
}

function LimpiarValidateErrores(form) {
    form.validate().resetForm();
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

function validarFormRechazoSolicitante() {
    $("#formRechazarSolicitante").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtDescripcionRechazoSolicitante: {
                requiredSinEspacios: true,
                maxlength: 800
            }
        },
        messages: {
            txtDescripcionRechazoSolicitante: {
                requiredSinEspacios: "Debes de ingresar un comentario para justificar el rechazo",
                maxlength: "El límite de caracteres esperados es de 800"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDescripcionRechazoSolicitante") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function sendDataFormAPI($btn) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjAplicacionFlow();

    $.ajax({
        url: URL_API_VISTA + "/application/flows/refused",
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
                        toastr.success("Se rechazó la solicitud de la aplicación y ha vuelto a la situación de registro parcial", TITULO_MENSAJE);
                        ListarRegistros();
                        $('.modal').modal('hide');

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

function sendDataFormAPISolicitante($btn) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjAplicacion();

    $.ajax({
        url: URL_API_VISTA + "/application/user/refused",
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
                        toastr.success("Se rechazó la solicitud de la aplicación y ha vuelto a la situación de registro parcial", TITULO_MENSAJE);
                        ListarRegistros();
                        $('.modal').modal('hide');

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

function CrearObjAplicacion() {
    var data = {};
    data.AppId = $("#hdAplicacionId").val();
    data.comments = $("#txtDescripcionRechazoSolicitante").val();

    return data;
}

function CrearObjAplicacionFlow() {
    var data = {};
    data.FlowAppId = $("#hdFlowId").val();
    data.comments = $("#txtDescripcionRechazo").val();

    return data;
}

function cargarCombosDetalle() {
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

function ListarRoles() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableRoles.bootstrapTable('destroy');
    $tableRoles.bootstrapTable({
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
            DATA_EXPORTAR.Id = $("#hdAplicacionId").val();
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

function eliminarAplicacion() {

    var id = $('#hdDesId').val();
    let pag = {
        Id: id,
        Comments: $('#txtDescripcionDesactivacion').val(),
    };

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE_ELIMINAR,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/application/deleteApplication2`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(pag),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                CargarArchivos(id);
                                toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                $('.modal').modal('hide');
                                RefrescarListado();

                            }
                        }
                    },
                    complete: function (data) {
                        waitingDialog.hide();
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}
function CargarArchivos(id) {
    //if ($("#formDesactivar").valid()) {
    let entidadId = 0;
    let descripcionFl = $("#txtDescripcionDesactivacion").val() || "";
    let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
    //debugger;
    UploadFile2($("#flArchivo"), entidadId, archivoId, false, TITULO_MENSAJE, descripcionFl, $table, id);
    debugger;
    //listarRegistros();
    //toastr.success("Registrado correctamente", TITULO_MENSAJE);
    $("#modalDesactivar").modal("hide")
    //}
}


function descargarArchivo() {
    var AppId = $('#hdAplicacionId').val();
    DownloadFile3(AppId);
}

function formatoFecha(value, row, index) {
    if (value == null)
        return "-";
    else
        return moment(value).format('DD/MM/YYYY HH:mm:ss');
}