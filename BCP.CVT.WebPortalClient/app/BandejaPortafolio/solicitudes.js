var $table = $("#tblRegistro");
var $tableRoles = $("#tblRoles");
var $tableFlujos = $("#tblFlujos");
var $tableFlujos2 = $("#tblFlujos2");
var $tableFlujos3 = $("#tblFlujos3");

var DATA_EXPORTAR = {};
var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "applicationId";
var ULTIMO_SORT_ORDER = "asc";

const TITULO_MENSAJE = "Portafolio de aplicaciones";
const MENSAJE = "¿Estás seguro que deseas continuar con el cambio de estado de esta aplicación?";
const TITULO_NO_PASE = "La aplicación no ha completado el registro de todos los campos requeridos, no es posible consultar o confirmar estos datos";
const URL_API_VISTA = URL_API + "/applicationportfolio";

const TIPO_DESARROLLO_INTERNO = 178;
const TIPO_WEB = 154;
const ID_USERIT = 1;

$(function () {
    $("#ddlEntidades").multiselect('enable');
    SetItemsMultiple([], $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    $("#txtCodigoInterfaz").hide();
    FormatoCheckBox($("#divFlagInterface"), "ckbInterface");

    cargarCombos();
    cargarCombosDetalle();
    $("#btnDescargar").click(descargarArchivo);
    $("#txtAplicacionFiltro").val(nombre_app);
    $("#hdAplicacionFiltroId").val(nombre_app);
    ULTIMO_PAGE_NUMBER = PAGINA_ACTUAL;
    ULTIMO_REGISTRO_PAGINACION = PAGINA_TAMANIO;
    ULTIMO_SORT_NAME = ORDER_BY;
    ULTIMO_SORT_ORDER = ORDER_DIRECTION;

    $("#cbFilGestionadoPor").val(GESTIONADO);
    $("#cbFilEstado").val(ESTADO_APP);
    $("#cbFilEstadoSolicitud").val(ESTADO_SOLICITUD);
    $("#cbFilFlujo").val(FLUJO);

    ListarRegistros();

    $("ul.tabs a").click(function () {
        $(".pane div").hide();
        $($(this).attr("href")).show();
    });

    $("#txtAplicacionFiltro").keypress(function (event) {
        if (event.keyCode === 13) {
            $("#btnBuscar").click();
            event.preventDefault();
        }
    });

    $("#divFechaRegularizacion").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY",
    });

    FormatoCheckBox($("#divFlagInformal"), "ckbInformal");

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        ListarAlertasDetalle(row.FlowAppId, $('#tblRegistrosDetalle_' + row.FlowAppId), $detail);
    });
    $("#ddlTipoEliminacion").change(TipoEliminacion_Change);
    FormatoCheckBox($("#divFlagConformidadGST"), "ckbConformidadGST");
    $("#ckbConformidadGST").change(FlagConformidadGST_Change);

    $("#btnDescargar1").click(descargarArchivo1);
    $("#btnDescargar2").click(descargarArchivo2);
    $("#btnDescargar3").click(descargarArchivo3);
    $("#btnDescargar4").click(descargarArchivo1);


    $("#btnAprobar").click(AprobarSolEliminacion);
    $("#btnRechazar").click(irRechazar);
    $("#btnRechazar2").click(RechazarSolEliminacion);

    $("#btnObservar").click(irObservarEli);
    $("#btnObservar2").click(ObservarSolEliminacion);

    InitAutocompletarBuilder($("#txtAplicacionFiltro"), $("#hdAplicacionFiltroId"), ".containerAplicacion", "/applicationportfolio/application/filter?filtro={0}&codigoAPT=");
});

function AprobarSolEliminacion() {

    $("#btnAprobar").button("loading");
    var pag = {
        solId: ($("#hdSolicitudId").val() === "") ? 0 : parseInt($("#hdSolicitudId").val()),
        flowId: ($("#hdFlowId").val() === "") ? 0 : parseInt($("#hdFlowId").val()),
    };



    var idsol = 0;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/application/approveRemove`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(pag),
                    //data: pag,
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    //contentType: false,
                    //processData: false,
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                idsol = dataObject;


                                toastr.success("Se aprobó la solicitud de eliminación.", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        $("#btnAprobar").button("reset");
                        waitingDialog.hide();
                        OpenCloseModal($("#modalEliminar"), false);
                        LimpiarModal();

                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
            else {
                $("#btnAprobar").button("reset");
            }
        }
    });

}

function RechazarSolEliminacion() {

    $("#btnRechazar2").button("loading");

    var pag = {
        solId: ($("#hdSolicitudId").val() === "") ? 0 : parseInt($("#hdSolicitudId").val()),
        flowId: ($("#hdFlowId").val() === "") ? 0 : parseInt($("#hdFlowId").val()),
        Comments: $("#txtMotivoRechazo").val()
    };



    var idsol = 0;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/application/refuseRemove`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(pag),
                    //data: pag,
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    //contentType: false,
                    //processData: false,
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                idsol = dataObject;


                                toastr.success("Se rechazó la solicitud de eliminación.", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        $("#btnRechazar2").button("reset");
                        waitingDialog.hide();
                        OpenCloseModal($("#modalEliminar"), false);
                        OpenCloseModal($("#modalEliminar2"), false);
                        LimpiarModal();

                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
            else {
                $("#btnRechazar2").button("reset");
            }
        }
    });

}

function ObservarSolEliminacion() {

    $("#btnObservar2").button("loading");

    var pag = {
        solId: ($("#hdSolicitudId").val() === "") ? 0 : parseInt($("#hdSolicitudId").val()),
        flowId: ($("#hdFlowId").val() === "") ? 0 : parseInt($("#hdFlowId").val()),
        Comments: $("#txtMotivoObservacion").val()
    };



    var idsol = 0;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/application/observarRemove`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(pag),
                    //data: pag,
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    //contentType: false,
                    //processData: false,
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                idsol = dataObject;


                                toastr.success("Se observó la solicitud de eliminación.", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        $("#btnObservar2").button("reset");
                        waitingDialog.hide();
                        OpenCloseModal($("#modalEliminar"), false);
                        OpenCloseModal($("#modalObservar2"), false);
                        LimpiarModal();

                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
            else {
                $("#btnObservar2").button("reset");
            }
        }
    });

}
function irRechazar() {
    LimpiarModal3();
    OpenCloseModal($("#modalEliminar2"), true);
}

function irObservarEli() {
    LimpiarModal4();
    OpenCloseModal($("#modalObservar2"), true);
}

function descargarArchivo1() {
    var SolicitudId = $('#hdSolicitudId').val();
    DownloadGST1(SolicitudId);
}

function descargarArchivo2() {
    var SolicitudId = $('#hdSolicitudId').val();
    DownloadTicket(SolicitudId);
}

function descargarArchivo3() {
    var SolicitudId = $('#hdSolicitudId').val();
    DownloadRatificacion(SolicitudId);
}

function FlagConformidadGST_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $("#divTxtConformidadGST").show();
    }
    else {
        $("#divTxtConformidadGST").hide();
    }
}
function TipoEliminacion_Change() {
    let TipoEliminacion = $("#ddlTipoEliminacion").val();

    if (TipoEliminacion == 1) {
        $(".divProcesoEliminacion").hide();
        $(".divEliminacionAdministrativa").show();

        $(":input", "#formEliminar").val("");
        //$("#descripcion").val(Descripcion);
        $("#ddlTipoEliminacion").val(1);



    }
    else if (TipoEliminacion == 2) {
        $(".divProcesoEliminacion").show();

        $(".divEliminacionAdministrativa").hide();
        //LimpiarValidateErrores($("#formEliminar"));
        $(":input", "#formEliminar").val("");
        //$("#descripcion").val(Descripcion);
        $("#ddlTipoEliminacion").val(2);
    }

}

function RefrescarListado() {
    ULTIMO_PAGE_NUMBER = 1;
    GESTIONADO = $("#cbFilGestionadoPor").val();
    ESTADO_APP = $("#cbFilEstado").val();
    ESTADO_SOLICITUD = $("#cbFilEstadoSolicitud").val();
    FLUJO = $("#cbFilFlujo").val();
    ListarRegistros();
}

function ListarRegistros() {
    if ($.trim($("#txtAplicacionFiltro").val()) == '')
        $("#hdAplicacionFiltroId").val("0");

    nombre_app = $("#hdAplicacionFiltroId").val() !== "0" ? $("#hdAplicacionFiltroId").val() : $("#txtAplicacionFiltro").val();
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/requestsByUser`,
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
            DATA_EXPORTAR.applicationId = $("#hdAplicacionFiltroId").val() !== "0" ? $("#hdAplicacionFiltroId").val() : $("#txtAplicacionFiltro").val();
            DATA_EXPORTAR.Status = $("#cbFilEstado").val();
            DATA_EXPORTAR.managedBy = $("#cbFilGestionadoPor").val();
            DATA_EXPORTAR.statusRequest = $("#cbFilEstadoSolicitud").val();
            DATA_EXPORTAR.flow = $("#cbFilFlujo").val();

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
    option = `<a href="#" onclick="javascript:VerAplicacion(${row.AppId})" title="Ver detalle de la aplicación">${value}</a>`;
    return option;
}

function opcionesFormatter(value, row, index) {
    let style_color = row.isCompleted == true ? 'iconoVerde ' : "iconoRojo ";
    let style_icon = row.isCompleted == true ? "pencil" : "zoom-in";

    let btnAccion = '';
    if (row.status != 4) {
        switch (row.typeRegister) {
            case JEFE_DE_EQUIPO: {
                if (row.typeFlow == FLUJO_REGISTRO)
                    btnAccion = `<a href="#" onclick="javascript:irJefeEquipo(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
                else
                    btnAccion = `<a href="#" onclick="javascript:irJefeEquipoEdit(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
            }
                break;
            case OWNER: {
                if (row.typeFlow == FLUJO_REGISTRO)
                    btnAccion = `<a href="#" onclick="javascript:irOwner(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
                else if (row.typeFlow == FLUJO_eliminacion)
                    btnAccion = `<a href="#" onclick="javascript:irEliminar(${row.AppId},'${row.applicationName}','${row.applicationId}','',${row.FlowAppId},${row.id},${row.isCompleted})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
                else
                    btnAccion = `<a href="#" onclick="javascript:irOwnerEdit(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
            }
                break;
            case TTL: {
                if (row.typeFlow == FLUJO_REGISTRO)
                    btnAccion = `<a href="#" onclick="javascript:irTTL(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
                else
                    btnAccion = `<a href="#" onclick="javascript:irTTLEdit(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
            }
                break;
            case GOBIERNO_USER_IT:
                {
                    if (row.typeFlow == FLUJO_REGISTRO)
                        btnAccion = `<a href="#" onclick="javascript:irGobierno(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
                }
                break;
            case ARQUITECTO_EVALUADOR:
                {
                    if (row.typeFlow == FLUJO_REGISTRO)
                        btnAccion = `<a href="#" onclick="javascript:irEvaluador(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
                    else
                        btnAccion = `<a href="#" onclick="javascript:irEvaluadorEdit(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
                }
                break;
            case ARQUITECTO_TI:
                {
                    if (row.typeFlow == FLUJO_REGISTRO)
                        btnAccion = `<a href="#" onclick="javascript:irArquitectoTI(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
                    else
                        btnAccion = `<a href="#" onclick="javascript:irArquitectoTIEdit(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
                }
                break;
            case DEVSECOPS: {
                if (row.typeFlow == FLUJO_REGISTRO)
                    btnAccion = `<a href="#" onclick="javascript:irDevSecOps(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
                else
                    btnAccion = `<a href="#" onclick="javascript:irDevSecOpsEdit(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
            }
                break;
            case AIO: {
                if (row.typeFlow == FLUJO_REGISTRO)
                    btnAccion = `<a href="#" onclick="javascript:irAIO(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
                else
                    btnAccion = `<a href="#" onclick="javascript:irAIOEdit(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
            }
                break;
            case ARQUITECTO_SOLUCION: {
                if (row.typeFlow == FLUJO_REGISTRO)
                    btnAccion = `<a href="#" onclick="javascript:irArquitectoSolucion(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
                else
                    btnAccion = `<a href="#" onclick="javascript:irArquitectoSolucionEdit(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
            }
                break;
        }
    }

    return btnAccion;
}

function irEliminar(id, name, applicationId, description, flujo, solId, completado) {
    $("#hdAplicacionId").val(id);

    //$('#title-md').html('Solicita la eliminación de la aplicación:' + name);
    document.getElementById("titulo").innerText = 'Solicita la eliminación de la aplicación: ' + name;
    document.getElementById("subtitulo").innerText = 'Codigo de aplicación: ' + applicationId + ' - Nombre de la aplicación: ' + name;
    LimpiarModalSolicitudEliminacion();
    //$("#descripcion").val(description);
    //Descripcion = $("#descripcion").val();
    getSolicitud(flujo, completado);
    OpenCloseModal($("#modalEliminar"), true);
    //document.getElementById("title-md").val = 'Solicita la eliminación de la aplicación: ' + name;
}
function getSolicitud(Id, completado) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        //url: URL_API_VISTA + `/application/GetFullDetail/${Id}`,
        url: URL_API_VISTA + `/application/Solicitud/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;

                    if (data.TipoEliminacion == 1) {
                        $(".divProcesoEliminacion").hide();
                        $(".divEliminacionAdministrativa").show();


                        //$("#descripcion").val(Descripcion);
                        $("#ddlTipoEliminacion").val(1);
                        $("#txtConformidad").val(data.ExpertoNombre);


                        $("#txtArchivo").val(data.NombreConformidadGST);



                    }
                    else if (data.TipoEliminacion == 2) {
                        $(".divProcesoEliminacion").show();

                        $(".divEliminacionAdministrativa").hide();
                        //LimpiarValidateErrores($("#formEliminar"));

                        //$("#descripcion").val(Descripcion);
                        $("#ddlTipoEliminacion").val(2);
                        $("#txtTicket").val(data.TicketEliminacion);
                        $("#txtExperto2").val(data.ExpertoNombre)
                        $("#txtNomArchivoConformidad").val(data.NombreConformidadGST);
                        $("#txtNomTicket").val(data.NombreTicketEliminacion)
                        $("#txtNomRatificacion").val(data.NombreRatificacion);
                    }


                    $("#ddlTipoEliminacion").val(data.TipoEliminacion);
                    if ((data.NombreConformidadGST == null || data.NombreConformidadGST == '') && data.TipoEliminacion == 2) {
                        $('#btnDescargar1').hide();
                    }

                    if (data.NombreTicketEliminacion == null || data.NombreTicketEliminacion == '') {
                        $('#btnDescargar2').hide();
                    }
                    if (data.NombreRatificacion == null || data.NombreRatificacion == '') {
                        $('#btnDescargar3').hide();
                    }
                    if ((data.NombreConformidadGST == null || data.NombreConformidadGST == '') && data.TipoEliminacion == 1) {
                        $('#btnDescargar4').hide();
                    }



                    $("#ckbConformidadGST").prop('checked', data.FlagRequiereConformidad);
                    $("#ckbConformidadGST").bootstrapToggle(data.FlagRequiereConformidad ? 'on' : 'off');
                    $("#ckbConformidadGST").attr("disabled", "disabled");

                    if (data.FlagRequiereConformidad) {
                        $("#divTxtConformidadGST").show();
                        $('#btnDescargar1').show();
                    }
                    else {
                        $("#divTxtConformidadGST").hide();
                        $('#btnDescargar1').hide();
                    }

                    $("#txtDescripcionEliminar").val(data.Observaciones);
                    $("#txtAprobadoPor").val(data.NombreUsuarioAprobacion);
                    $("#txtFechaAprobacion").val(data.FechaAprobacion);
                    $("#hdSolicitudId").val(data.Id);
                    $("#hdFlowId").val(Id);
                    $("#txtObservaciones").val(data.ObservacionesRechazo);

                    if (completado == true) {
                        $("#btnAprobar").hide();
                        $("#btnRechazar").hide();
                    }
                    else {
                        $("#btnAprobar").show();
                        $("#btnRechazar").show();
                    }
                }
            }
        },
        complete: function () {

        },
        error: function (result) {
            alert(result.responseText);
        },
        async: true
    });

}


function LimpiarModalSolicitudEliminacion() {
    $(":input", "#formEliminar").val("");
    $("#ddlTipoEliminacion").val(-1);
    $(".divProcesoEliminacion").hide();
    $(".divEliminacionAdministrativa").hide();

    $('#ckbConformidadGST').bootstrapToggle('destroy');
    //$("#ckbConformidadGST").prop('checked', false);
    //$("#ckbConformidadGST").bootstrapToggle('off');

    $("#btnDescargar").show();
    $("#btnDescargar2").show();
    $("#btnDescargar3").show();
    $("#btnDescargar4").show();
}

function LimpiarModal3() {
    $(":input", "#formEliminar2").val("");
}

function LimpiarModal4() {
    $(":input", "#formObservar2").val("");
}


function irEvaluador(appId, flowAppId) {
    window.document.location.href = `ArquitectoEvaluador?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}
function irEvaluadorEdit(appId, flowAppId) {
    window.document.location.href = `ArquitectoEvaluadorEdit?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irAIO(appId, flowAppId) {
    window.document.location.href = `AIO?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irAIOEdit(appId, flowAppId) {
    window.document.location.href = `AIOEdit?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irDevSecOps(appId, flowAppId) {
    window.document.location.href = `DevSecOps?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irDevSecOpsEdit(appId, flowAppId) {
    window.document.location.href = `DevSecOpsEdit?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irArquitectoTI(appId, flowAppId) {
    window.document.location.href = `ArquitectoTI?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irArquitectoTIEdit(appId, flowAppId) {
    window.document.location.href = `ArquitectoTIEdit?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irArquitectoSolucion(appId, flowAppId) {
    window.document.location.href = `ArquitectoSolucion?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irArquitectoSolucionEdit(appId, flowAppId) {
    window.document.location.href = `ArquitectoSolucionEdit?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}
function irOwner(appId, flowAppId) {
    window.document.location.href = `Owner?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irOwnerEdit(appId, flowAppId) {
    window.document.location.href = `OwnerEdit?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irJefeEquipo(appId, flowAppId) {
    window.document.location.href = `JefeEquipo?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irJefeEquipoEdit(appId, flowAppId) {
    window.document.location.href = `JefeEquipoEdit?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irGobierno(appId, flowAppId) {
    window.document.location.href = `GobiernoUserIT?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irGobiernoEdit(appId, flowAppId) {
    window.document.location.href = `GobiernoUserITEdit?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irTTL(appId, flowAppId) {
    window.document.location.href = `TTL?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function irTTLEdit(appId, flowAppId) {
    window.document.location.href = `TTLEdit?appId=${appId}&flowId=${flowAppId}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}&gestionado=${GESTIONADO}&estadoApp=${ESTADO_APP}&estadoSolicitud=${ESTADO_SOLICITUD}&flujo=${FLUJO}&orderBy=${ULTIMO_SORT_NAME}&orderDirection=${ULTIMO_SORT_ORDER}`;
}

function VerAplicacion(id) {
    $("#hdAplicacionId").val(id);
    editarAplicacion(id);
}

function estadoFormatter(value, row, index) {
    var html = "";
    if (row.typeFlow == FLUJO_REGISTRO) {
        if (row.isCompleted === true) { //VERDE
            html = `<a class="btn btn-success btn-circle" title="Atendida" onclick="javascript:irObservar(${row.AppId},'${row.applicationId}','${row.applicationName}')"></a>`;
        } else if (row.isCompleted === false) { //ROJO
            html = `<a class="btn btn-danger btn-circle" title="Pendiente de atención" onclick="javascript:irObservar(${row.AppId},'${row.applicationId}','${row.applicationName}')"></a>`;
        }
        return html;
    }
    else if (row.typeFlow == FLUJO_eliminacion) {
        if (row.isCompleted === true) { //VERDE
            html = `<a class="btn btn-success btn-circle" title="Atendida" onclick="javascript:irObservar2(${row.AppId},'${row.applicationId}','${row.applicationName}', ${row.IdSolicitud})"></a>`;
        } else if (row.isCompleted === false) { //ROJO
            html = `<a class="btn btn-danger btn-circle" title="Pendiente de atención" onclick="javascript:irObservar2(${row.AppId},'${row.applicationId}','${row.applicationName}', ${row.IdSolicitud})"></a>`;
        }
        return html;
    }
    else if (row.typeFlow == FLUJO_MODIFICACION) {
        if (row.isCompleted === true) { //VERDE
            html = `<a class="btn btn-success btn-circle" title="Atendida" onclick="javascript:irObservar3(${row.AppId},'${row.applicationId}','${row.applicationName}', ${row.IdSolicitud})"></a>`;
        } else if (row.isCompleted === false) { //ROJO
            html = `<a class="btn btn-danger btn-circle" title="Pendiente de atención" onclick="javascript:irObservar3(${row.AppId},'${row.applicationId}','${row.applicationName}', ${row.IdSolicitud})"></a>`;
        }
        return html;
    }
    else {
        if (row.isCompleted === true) { //VERDE
            html = `<a class="btn btn-success btn-circle" title="Atendida")"></a>`;
        } else if (row.isCompleted === false) { //ROJO
            html = `<a class="btn btn-danger btn-circle" title="Pendiente de atención"></a>`;
        }
        return html;
    }
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
                    $("#ddlArquitectoSolucion").val(data.architectSolutionId || "-1");

                    $("#ddlEntidades").val(data.userEntity !== null ? data.userEntity.split(",") : "-1"); //app.AplicacionDetalle
                    $("#ddlEntidades").multiselect("refresh");

                    $("#ddlTipoDesarrollo").val(data.developmentType || "-1");
                    $("#ddlInfraestructura").val(data.infrastructure || "-1");
                    $("#ddlAutorizacion").val(data.authorizationMethod || "-1");
                    $("#ddlAutenticacion").val(data.authenticationMethod || "-1");

                    $("#hExpertoMatricula").val(data.expertId);
                    $("#txtExperto").val(data.expertName);
                    $("#hExpertoCorreo").val(data.expertEmail);

                    if (data.managed == ID_USERIT) {
                        $(".divInterfaz").hide();
                        $(".gobUserIT").show();
                        $(".datosUserIT").show();

                        $("#ckbInformal").prop('checked', data.isFormalApplication);
                        $("#ckbInformal").bootstrapToggle(data.isFormalApplication ? 'on' : 'off');
                        $("#ckbInformal").attr("disabled", "disabled");
                        if (data.isApproved == true) {
                            if (data.isFormalApplication) {
                                $(".fechaFormalizacion").show();
                                $("#dpFechaRegularizacion").val(data.regularizationDateDetail);
                                $("#dpFechaRegularizacion").attr("disabled", "disabled");
                            }
                            else
                                $(".fechaFormalizacion").hide();
                        }
                        else {
                            $(".fechaFormalizacion").hide();
                        }
                    }
                    else {
                        $(".divInterfaz").show();
                        $(".gobUserIT").hide();
                        $(".datosUserIT").hide();
                    }

                    $("#ckbInterface").prop('checked', data.hasInterfaceId);
                    $("#ckbInterface").bootstrapToggle(data.hasInterfaceId ? 'on' : 'off');
                    $("#ckbInterface").attr("disabled", "disabled");

                    if (data.hasInterfaceId) {
                        $("#txtCodigoInterfaz").val(data.interfaceId);
                        $("#txtCodigoInterfaz").show();
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
                    $("#txtCapaFuncional").val(data.functionalLayerName);
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

function dateFormat2(value, row, index) {
    return moment(value).format('DD/MM/YYYY HH:mm:ss');
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
                    SetItems(dataObject.GestionadPor, $("#cbFilGestionadoPor"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
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
                    SetItems(dataObject.ArquitectoSolucion, $("#ddlArquitectoSolucion"), TEXTO_SELECCIONE);
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
    $tableRoles.bootstrapTable('destroy');
    $tableRoles.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/application/roles",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'managerName',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Id = $("#hdAplicacionId").val();
            DATA_EXPORTAR.pageNumber = ULTIMO_PAGE_NUMBER;
            DATA_EXPORTAR.pageSize = ULTIMO_REGISTRO_PAGINACION;
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

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    /*let url = `${URL_API_VISTA}/ExportarSolicitudes?flow=${DATA_EXPORTAR.flow}&role=${DATA_EXPORTAR.role}&nombre=${DATA_EXPORTAR.applicationId}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&estado=${DATA_EXPORTAR.Status}&gestionadoPor=${DATA_EXPORTAR.managedBy}&estadoSolicitud=${DATA_EXPORTAR.statusRequest}`;*/
    let url = `${URL_API_VISTA}/ExportarSolicitudes?flow=${DATA_EXPORTAR.flow}&role=${DATA_EXPORTAR.role}&nombreAplicacion=${DATA_EXPORTAR.applicationId}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&estado=${DATA_EXPORTAR.Status}&gestionadoPor=${DATA_EXPORTAR.managedBy}&estadoSolicitud=${DATA_EXPORTAR.statusRequest}&nombreUsuario=${DATA_EXPORTAR.username}`;
    $.ajax({
        url: url,
        contentType: "application/vnd.ms-excel",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            let bytes = Base64ToBytes(data.excel);
            var blob = new Blob([bytes], { type: "application/octetstream" });
            let url = URL.createObjectURL(blob);
            let link = document.createElement("a");
            link.href = url;
            link.download = data.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, complete: function (xhr, status) {
            waitingDialog.hide();
        }
    });
}

function irObservar(id, codApp, nomApp) {
    $("#hdAplicacionId").val(id);
    ListarRegistrosFlujos(id);
    $("#spanApp").html(codApp + "-" + nomApp);
    OpenCloseModal($("#modalFlujosAplicacion"), true);
}


function irObservar2(id, codApp, nomApp, idSol) {
    $("#hdAplicacionId").val(id);
    ListarRegistrosFlujos2(id, idSol);
    $("#spanApp2").html(codApp + "-" + nomApp);
    OpenCloseModal($("#modalFlujosAplicacion2"), true);
}

function irObservar3(id, codApp, nomApp, idSol) {
    $("#hdAplicacionId").val(id);
    if (idSol != null) {
        ListarRegistrosFlujosModificacion(id, idSol);
        $("#spanApp3").html(codApp + "-" + nomApp);
        OpenCloseModal($("#modalFlujosAplicacion3"), true);
    }
    else { toastr.warning("El registro no tiene una solicitud relacionada.", "Advertencia"); }
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


function ListarRegistrosFlujos2(id, idSol) {
    $tableFlujos2.bootstrapTable('destroy');
    $tableFlujos2.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/flowsEliminacion`,
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
            DATA_EXPORTAR.solId = idSol;

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

function ListarRegistrosFlujosModificacion(id, idSol) {
    $tableFlujos3.bootstrapTable('destroy');
    $tableFlujos3.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/flowsModificacion`,
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
            DATA_EXPORTAR.solId = idSol;

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


function estadoFlujoFormatter(value, row, index) {
    var html = "";
    if (row.isCompleted === true) { //VERDE
        html = '<a class="btn btn-success btn-circle" title="Atendida"></a>';
    } else if (row.isCompleted === false) { //ROJO
        html = '<a class="btn btn-danger btn-circle" title="Pendiente de atención"></a>';
    }
    return html;
}


function descargarArchivo() {
    var AppId = $('#hdAplicacionId').val();
    DownloadFile3(AppId);
}

function detailFormatter(index, row) {
    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="30">#</th>\
                                    <th data-field="ColumnaDetalle" data-halign="center" data-valign="middle" data-align="left"  data-width="280">Campo</th>\
                                    <th data-field="DetalleActual" data-halign="center" data-valign="middle" data-align="left">Valor inicial</th>\
                                    <th data-field="DetalleNuevo" data-halign="center" data-valign="middle" data-align="left">Valor configurado</th>\
                                    <th data-field="TipoRegistroDetalle" data-sortable="true" data-halign="center" data-valign="middle" data-align="center">Tipo de registro</th>\
                                </tr>\
                            </thead>\
                        </table>', row.FlowAppId);
    return html;
}

function ListarAlertasDetalle(id, $tableDetalle, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableDetalle.bootstrapTable('destroy');
    $tableDetalle.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/flows/data",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'ColumnaDetalle',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.id = id;
            PARAMS_API.pageNumber = p.pageNumber;
            PARAMS_API.pageSize = p.pageSize;
            PARAMS_API.sortName = p.sortName;
            PARAMS_API.sortOrder = p.sortOrder;

            return JSON.stringify(PARAMS_API);
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