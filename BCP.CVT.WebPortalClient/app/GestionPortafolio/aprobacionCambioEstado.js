var $table = $("#tblRegistro");

//var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_REGISTRO_PAGINACION = PAGINA_TAMANIO;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "FechaCreacion";
var ULTIMO_SORT_ORDER = "desc";

const TITULO_MENSAJE = "Portafolio de aplicaciones";
const MENSAJE = "¿Estás seguro que deseas confirmar el rechazo de esta solicitud?";
const MENSAJE2 = "¿Estás seguro que deseas confirmar la aprobacion de esta solicitud?";
const MENSAJE3 = "¿Estás seguro que deseas confirmar la observación de esta solicitud?";
const URL_API_VISTA = URL_API + "/applicationportfolio";
const URL_API_VISTA_SOLICITUD = URL_API + "/Solicitud";
const URL_API_VISTA2 = URL_API + "/applicationportfolio";
var $tableFlujosAprobacion = $("#tblFlujosAprobacion");

var ESTADO_SOLICITUD_APP = { APROBADO: 1, PENDIENTE: 2, RECHAZADA: 3, PENDIENTECUSTODIO: 4, DESESTIMADA: 5, OBSERVADA: 6, OBSERVADA_USUARIO: 7 };
var ESTADO_APOYO_APROBADOR = [ESTADO_SOLICITUD_APP.APROBADO, ESTADO_SOLICITUD_APP.PENDIENTE, ESTADO_SOLICITUD_APP.RECHAZADA, ESTADO_SOLICITUD_APP.PENDIENTECUSTODIO, ESTADO_SOLICITUD_APP.DESESTIMADA, ESTADO_SOLICITUD_APP.OBSERVADA, ESTADO_SOLICITUD_APP.OBSERVADA_USUARIO];


$(function () {
    ListarRegistros();
    //InitAcciones();
    $("#txtAplicacionFiltro").keypress(function (event) {
        if (event.keyCode === 13) {
            $("#btnBuscar").click();
            event.preventDefault();
        }
    });

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        ListarDetalle(row.SolicitudAplicacionId, $('#tblRegistrosDetalle_' + row.SolicitudAplicacionId), $detail);
    });
    $("#btnExportar").click(ExportarInfo);

    $("#ddlTipoEliminacion").change(TipoEliminacion_Change);
    FormatoCheckBox($("#divFlagConformidadGST"), "ckbConformidadGST");
    $("#ckbConformidadGST").change(FlagConformidadGST_Change);
    $("#btnDescargar").click(descargarArchivo1);
    $("#btnDescargar2").click(descargarArchivo2);
    $("#btnDescargar3").click(descargarArchivo3);
    $("#btnDescargar4").click(descargarArchivo1);

    $("#btnRechazar").click(irRechazar2);
    $("#btnAprobar").click(irAprobar);

    //$("#btnObservar").click(irObservarEliminacion($("#hdSolicitudId").val()));
    $("#btnObservar").click(irObservar);
    $("#btnObservar2").click(irObservar2);
    $("#btnRechazarEliminacion").click(RechazarSolicitud);


});

function situacionFormatter(value, row, index) {
    var html = "";
    if (row.EstadoSolicitud === REGISTRO_APROBADO) { //VERDE
        html = `<a class="btn btn-success btn-circle" title="Registro completo" onclick="javascript:verFlujosAplicacion(${row.SolicitudAplicacionId},'${row.AplicacionId}','${row.ApplicationName}','${row.ApplicationId}')"></a>`;
    } else if (row.EstadoSolicitud === REGISTRO_RECHAZADO) { //ROJO
        html = `<a class="btn btn-danger btn-circle" title="Registro parcial" onclick="javascript:verFlujosAplicacion(${row.SolicitudAplicacionId},'${row.AplicacionId}','${row.ApplicationName}','${row.ApplicationId}')"></a>`;
    } else { //AMARILLO
        html = `<a class="btn btn-warning btn-circle" title="Pendiente" onclick="javascript:verFlujosAplicacion(${row.SolicitudAplicacionId},'${row.AplicacionId}','${row.ApplicationName}','${row.ApplicationId}')"></a>`;
    }
    return html;
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


function verFlujosAplicacion(SolicitudAplicacionId, AplicacionId, ApplicationName, ApplicationId) {
    $("#hdAplicacionId").val(AplicacionId);
    ListarFlujosAprobacion(SolicitudAplicacionId, AplicacionId);
    $("#spanApp").html(ApplicationId + "-" + ApplicationName);
    OpenCloseModal($("#modalVerFlujosAprobacion"), true);
}

function ListarFlujosAprobacion(Solid, appid) {
    $tableFlujosAprobacion.bootstrapTable('destroy');
    $tableFlujosAprobacion.bootstrapTable({
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
            DATA_EXPORTAR.Id = appid;
            DATA_EXPORTAR.solId = Solid;

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

function irObservar() {

    LimpiarModal3();
    OpenCloseModal($("#modalObservar"), true);
}

function irObservar2() {
    irObservarEliminacion($("#hdSolicitudId").val())

}
function irAprobar() {
    irConfirmarEliminacion($("#hdSolicitudId").val())

}
function irRechazar2() {
    $("#hdSolicitudAplicacionId").val($("#hdSolicitudId").val());
    $("#txtDescripcion2").val('');
    LimpiarModal();
    OpenCloseModal($("#modalRechazarSolicitudEliminacion2"), true);
}

function LimpiarModal3() {

    $(":input", "#formObservar").val("");

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



function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.CodigoAPT = $('#txtAplicacionFiltro').val();
    DATA_EXPORTAR.Estado = $('#cbFilEstado').val();


    DATA_EXPORTAR.sortName = 'FechaCreacion';
    DATA_EXPORTAR.sortOrder = 'asc';


    //DATA_EXPORTAR.TablaProcedencia = String.Format("{0}", TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION);
    //DATA_EXPORTAR.Procedencia = TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION;

    let url = `${URL_API_VISTA}/ExportarSolicitudes?codigoAPT=${DATA_EXPORTAR.CodigoAPT}&estado=${DATA_EXPORTAR.Estado}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

//function InitAcciones() {
//    $("#btnRechazarEliminacion").click(RechazarSolicitud);

//}

function RefrescarListado() {
    ListarRegistros();
}

function detailFormatter(index, row) {
    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="30">#</th>\
                                    <th data-field="ConformidadGST" data-formatter="formatterDescarga" data-halign="center" data-valign="middle" data-align="center">Conformidad GST</th>\
                                    <th data-field="TicketEliminacion" data-formatter="formatterDescarga" data-halign="center" data-valign="middle" data-align="center">Ticket de eliminación</th>\
                                    <th data-field="Ratificacion" data-formatter="formatterDescarga" data-sortable="true" data-halign="center" data-valign="center" data-align="center">Ratificación</th>\
        <th data-field="Observaciones" data-halign="left" data-valign="middle" data-align="left" data-sortable="true" data-sort-name="Observaciones">Comentarios de la solicitud</th>\
                                </tr>\
                            </thead>\
                        </table>', row.SolicitudAplicacionId);
    return html;
}


function LimpiarModal() {

    $("#txtDescripcion").val();
}

function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/ListarSolicitud`,
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
            DATA_EXPORTAR.Status = $("#cbFilEstado").val();
            DATA_EXPORTAR.pageNumber = ULTIMO_PAGE_NUMBER;
            DATA_EXPORTAR.pageSize = ULTIMO_REGISTRO_PAGINACION;
            DATA_EXPORTAR.sortName = ULTIMO_SORT_NAME;
            DATA_EXPORTAR.sortOrder = ULTIMO_SORT_ORDER;
            DATA_EXPORTAR.CodigoAPT = $("#txtAplicacionFiltro").val();

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


function opcionesFormatter(value, row, index) {

    if (row.EstadoSolicitud === REGISTRO_PENDIENTE && row.TipoSolicitud === SOLICITUD_REGRESO_NOVIGENTE) {
        let btnConfirmar = `<a href="javascript:irConfirmar(${row.SolicitudAplicacionId})" title="Confirma la solicitud de cambio de estado"><i class="iconoVerde glyphicon glyphicon glyphicon-ok"></i></a>`;
        let btnObservar = `<a href="javascript:irRechazar(${row.SolicitudAplicacionId})" title="Rechaza la solicitud de cambio de estado"><i class="iconoRojo glyphicon glyphicon glyphicon-remove"></i></a>`;

        return btnConfirmar.concat("&nbsp;&nbsp;", btnObservar);
    }
    else if (row.EstadoSolicitud === REGISTRO_PENDIENTE && row.TipoSolicitud === SOLICITUD_ELIMINACION) {
        let btnConfirmar = '';
        btnConfirmar = `<a href="#" onclick="javascript:irEliminar(${row.SolicitudAplicacionId},'${row.ApplicationName}','${row.ApplicationId}', false)" title="Revisa el detalle de la solicitud"><i class="iconoRojo glyphicon glyphicon-zoom-in"></i></a>`;
        return btnConfirmar;
    }
    else {
        let btnConfirmar = '';
        btnConfirmar = `<a href="#" onclick="javascript:irEliminar(${row.SolicitudAplicacionId},'${row.ApplicationName}','${row.ApplicationId}', false)" title="Revisa el detalle de la solicitud"><i class="iconoVerde glyphicon glyphicon-search"></i></a>`;
        return btnConfirmar;
    }
}
function irEliminar(id, name, applicationId, soloLectura) {
    document.getElementById("titulo").innerText = 'Solicita la eliminación de la aplicación: ' + name;
    document.getElementById("subtitulo").innerText = 'Codigo de aplicación: ' + applicationId + ' - Nombre de la aplicación: ' + name;
    LimpiarModalSolicitudEliminacion();
    getSolicitud(id, soloLectura);
    OpenCloseModal($("#modalEliminar"), true);
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

function getSolicitud(Id, soloLectura) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({

        url: URL_API_VISTA2 + `/application/Solicitud2/${Id}`,
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

                        $("#ddlTipoEliminacion").val(1);
                        $("#txtConformidad").val(data.ExpertoNombre);
                        $("#txtArchivo").val(data.NombreConformidadGST);
                    }
                    else if (data.TipoEliminacion == 2) {
                        $(".divProcesoEliminacion").show();

                        $(".divEliminacionAdministrativa").hide();

                        $("#ddlTipoEliminacion").val(2);
                        $("#txtTicket").val(data.TicketEliminacion);
                        $("#txtExperto").val(data.ExpertoNombre)
                        $("#txtNomArchivoConformidad").val(data.NombreConformidadGST);
                        $("#txtNomTicket").val(data.NombreTicketEliminacion)
                        $("#txtNomRatificacion").val(data.NombreRatificacion);

                        $("#ckbConformidadGST").prop('checked', data.FlagRequiereConformidad);
                        $("#ckbConformidadGST").bootstrapToggle(data.FlagRequiereConformidad ? 'on' : 'off');
                        $("#ckbConformidadGST").attr("disabled", "disabled");

                        if (data.FlagRequiereConformidad) {
                            $("#divTxtConformidadGST").show();
                            $('#btnDescargar').show();
                        }
                        else {
                            $("#divTxtConformidadGST").hide();
                            $('#btnDescargar').hide();
                        }
                    }

                    //$("#ddlTipoEliminacion").val(data.TipoEliminacion);
                    if ((data.NombreConformidadGST == null || data.NombreConformidadGST == '') && data.TipoEliminacion == 2) {
                        $('#btnDescargar').hide();
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

                    $("#txtDescripcionEliminar").val(data.Observaciones);
                    $("#txtAprobadoPor").val(data.NombreUsuarioModificacion);
                    $("#txtFechaAprobacion").val(data.FechaModificacionFormato);
                    $("#hdSolicitudId").val(data.Id);
                    //$("#hdFlowId").val(Id);

                    if (soloLectura == true) {
                        $("#btnAprobar").hide();
                        $("#btnRechazar").hide();
                        $("#btnObservar").hide();
                    }
                    else {
                        $("#btnAprobar").show();
                        $("#btnRechazar").show();
                        $("#btnObservar").show();
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


function irRechazarEliminacion(id) {
    $("#hdSolicitudAplicacionId").val(id);
    LimpiarModal();
    OpenCloseModal($("#modalRechazarSolicitudEliminacion"), true);
}

function irRechazar(id) {
    $("#hdSolicitudAplicacionId").val(id);
    LimpiarModal();
    OpenCloseModal($("#modalRechazarSolicitud"), true);
}

//function situacionFormatter(value, row, index) {
//    var html = "";
//    if (row.EstadoSolicitud === REGISTRO_APROBADO) { //VERDE
//        html = '<a class="btn btn-success btn-circle" title="Solicitud Aprobada"></a>';
//    } else if (row.EstadoSolicitud === REGISTRO_RECHAZADO) { //ROJO
//        html = '<a class="btn btn-danger btn-circle" title="Solicitud Rechazada"></a>';
//    } else if (row.EstadoSolicitud === REGISTRO_PENDIENTE) { //AMARILLO
//        html = '<a class="btn btn-warning btn-circle" title="Solicitud Pendiente"></a>';
//    }
//    return html;
//}

function irConfirmarEliminacion(id) {
    let data = {};
    data.id = id;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE2,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/application/SolicitudEliminacionApproved`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                //waitingDialog.hide();
                                toastr.success("Se confirmó la solicitud correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {
                        waitingDialog.hide();
                        OpenCloseModal($("#modalEliminar"), false);
                    },

                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }

                });
            }
        }
    });
}

function irObservarEliminacion(id) {
    let data = {};
    data.id = id;
    data.Comments = $("#txtMotivoObservacion").val();

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE3,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/application/SolicitudEliminacionObserved`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                //waitingDialog.hide();
                                toastr.success("Se mandó a observación la solicitud correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                                OpenCloseModal($("#modalEliminar"), false);
                                OpenCloseModal($("#modalObservar"), false);
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


function irConfirmar(id) {
    let data = {};
    data.id = id;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE2,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/application/SolicitudApproved`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                //waitingDialog.hide();
                                toastr.success("Se confirmó la solicitud correctamente", TITULO_MENSAJE);
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



function RechazarSolicitud() {
    let data = {};
    data.id = $("#hdSolicitudAplicacionId").val();
    data.Comments = $("#txtDescripcion2").val();

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/application/SolicitudRefused`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se rechazó la solicitud correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        $("#btnRechazar").button("reset");
                        waitingDialog.hide();
                        OpenCloseModal($("#modalRechazarSolicitudEliminacion2"), false);
                        OpenCloseModal($("#modalEliminar"), false);
                        //LimpiarModal();

                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}


function RechazarSolicitudEliminacion() {
    let data = {};
    data.id = $("#hdSolicitudAplicacionId").val();
    data.Comments = $("#txtDescripcion2").val();

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/application/SolicitudEliminacionRefused`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se rechazó la solicitud correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        $("#btnRechazar").button("reset");
                        waitingDialog.hide();
                        OpenCloseModal($("#modalRechazarSolicitudEliminacion2"), false);
                        OpenCloseModal($("#modalEliminar"), false);
                        //LimpiarModal();

                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}

function dateFormat(value, row, index) {
    if (value != null)
        return moment(value).format('DD/MM/YYYY HH:mm:ss');
    else return "-";
}

function DownloadFileSolicitud(id, tipoArchivo, titulo) {
    if (tipoArchivo == 0) {
        bootbox.alert({
            size: "small",
            title: titulo,
            message: "No existe un archivo para descargar.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
        return false;
    }

    let url = `${URL_API_VISTA_SOLICITUD}/DownloadArchivoEliminacion?id=${id}&tipoArchivo=${tipoArchivo}`;

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/octetstream",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            let bytes = Base64ToBytes(data.data);
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

function formatterDescarga(value, row, index) {
    let retorno = `<a href="javascript:DownloadFileSolicitud(${row.SolicitudId}, ${value}, '${TITULO_MENSAJE}')" title="Descargar archivo"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
    return retorno;
}

function ListarDetalle(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA_SOLICITUD + "/Listado/DetalleEliminacion",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
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