var $table = $("#tbl-solicitudes");
var $tblComentarios = $("#tblComentarios");
var $tblDetalleAtributosApp = $("#tblDetalleAtributosApp");
var $tblDetalleModuloApp = $("#tblDetalleModuloApp");
var $tableFlujosAprobacion = $("#tblFlujosAprobacion");
var URL_API_VISTA = URL_API + "/Solicitud";
const URL_API_VISTA2 = URL_API + "/applicationportfolio";
var DATA_EXPORTAR = {};
var DATA_ESTADO = [];
const TITULO_MENSAJE = "Bandeja de aprobación de solicitudes";
const MENSAJE = "¿Estás seguro que deseas aprobar la solicitud de modificación?, una vez que se apruebe se modificarán los datos y no será posible revertir el cambio.";
const MENSAJE_RECHAZAR_SOLICITANTE = "¿Estás seguro de desestimar la solicitud de modificación y notificar al portafolio sobre ello?";

const TIPO_FLUJO_PORTAFOLIO = { FNA: 1, PAE: 2 };
var TIPO_COMENTARIO = { OBSERVACION: 1, COMENTARIO: 2 };
var TIPO_SOLICITUD_APP = { CREACION: 1, MODIFICACION: 2, ELIMINACION: 3 };
var ESTADO_SOLICITUD_APP = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
//var ESTADO_APOYO_APROBADOR = [ESTADO_SOLICITUD_APP.REGISTRADO, ESTADO_SOLICITUD_APP.PROCESOREVISION, ESTADO_SOLICITUD_APP.APROBADO, ESTADO_SOLICITUD_APP.OBSERVADO];

const NOMBRE_FILE_ELIMINACION_FNA = "Adjuntar la evidencia de ticket o requerimiento de eliminación ejecutado en todos los ambientes:";
const NOMBRE_FILE_ELIMINACION_PAE = "Adjuntar formato de eliminación confirmado por Gestor:";
const NOMBRE_FILE_MODIFICACION = "Conformidades (se deben de incluir las evidencias de no contar con equipos relacionados):";

$(function () {
    //initFecha();
    cargarCombos();
    $("#txtCodigoFiltro").val(nombre_app);
    $("#ddlEstadoFiltro").val(ESTADO);
    listarRegistros();
    //$("#btnBuscar").click(RefrescarListado);
    //$("#btnExportar").click(ExportarInfo());

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        if (row.NroAlertasDetalle !== 0) {
            ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
        } else {
            $detail.empty().append("No existen registros.");
        }
        //ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
    });

    $("#btnProcesarRechazoSolicitante").click(guardarRechazoAppSolicitante);
    validarFormRechazoSolicitante();
});

$(document).keypress(function (event) {
    if (event.keyCode == 13) {
        $('#btnBuscar').click();
    }
});

function RefrescarListado() {
    ULTIMO_PAGE_NUMBER = 1;
    listarRegistros();
    nombre_app = $("#txtAplicacionFiltro").val();
    ESTADO = $("#ddlEstadoFiltro").val();
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

function initFecha() {
    $("#divFechaDesde").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });

    $("#divFechaHasta").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
}


function situacionFormatter(value, row, index) {
    var html = "";
    if (row.EstadoSolicitud === REGISTRO_APROBADO) { //VERDE
        html = `<a class="btn btn-success btn-circle" title="Registro completo" onclick="javascript:verFlujosAplicacion(${row.Id},'${row.AplicacionId}','${row.NombreAplicacion}','${row.CodigoAplicacion}')"></a>`;
    } else if (row.EstadoSolicitud === REGISTRO_RECHAZADO) { //ROJO
        html = `<a class="btn btn-danger btn-circle" title="Registro parcial" onclick="javascript:verFlujosAplicacion(${row.Id},'${row.AplicacionId}','${row.NombreAplicacion}','${row.CodigoAplicacion}')"></a>`;
    } else { //AMARILLO
        html = `<a class="btn btn-warning btn-circle" title="Pendiente" onclick="javascript:verFlujosAplicacion(${row.Id},'${row.AplicacionId}','${row.NombreAplicacion}','${row.CodigoAplicacion}')"></a>`;
    }
    return html;
}

function verFlujosAplicacion(SolicitudAplicacionId, AplicacionId, ApplicationName, ApplicationId) {

    ListarFlujosAprobacion(SolicitudAplicacionId, AplicacionId);
    $("#spanApp").html(ApplicationId + "-" + ApplicationName);
    OpenCloseModal($("#modalVerFlujosAprobacion"), true);
}

function ListarFlujosAprobacion(Solid, appid) {
    $tableFlujosAprobacion.bootstrapTable('destroy');
    $tableFlujosAprobacion.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA2 + `/application/flowsModificacion`,
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

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Tipo, $("#ddlTipoFiltro"), TEXTO_TODOS);
                    DATA_ESTADO = dataObject.Estado;
                    SetItems(DATA_ESTADO, $("#ddlEstadoFiltro"), TEXTO_TODOS);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado2",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: [30, 60, 90],
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            ULTIMO_PAGE_NUMBER = p.pageNumber;
            ULTIMO_REGISTRO_PAGINACION = p.pageSize;

            DATA_EXPORTAR = {};
            //DATA_EXPORTAR.CodigoApt = $("#hdAplicacionFiltroId").val() !== "0" ? $("#hdAplicacionFiltroId").val() : $("#txtAplicacionFiltro").val();
            DATA_EXPORTAR.CodigoApt = $("#txtCodigoFiltro").val();
            //DATA_EXPORTAR.TipoSolicitud = $("#ddlTipoFiltro").val();
            DATA_EXPORTAR.EstadoSolicitudUnico = $("#ddlEstadoFiltro").val();
            //DATA_EXPORTAR.FechaDesde = $.trim($("#txtFilFechaDesde").val()) !== "" ? castDate($("#txtFilFechaDesde").val()) : null;
            //DATA_EXPORTAR.FechaHasta = $.trim($("#txtFilFechaHasta").val()) !== "" ? castDate($("#txtFilFechaHasta").val()) : null;

            DATA_EXPORTAR.pageNumber = ULTIMO_PAGE_NUMBER;
            DATA_EXPORTAR.pageSize = ULTIMO_REGISTRO_PAGINACION;

            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.FlagAprobacion = true;

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

function detailFormatter(index, row) {
    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="30">#</th>\
                                    <th data-field="ColumnaDetalle" data-halign="center" data-valign="middle" data-align="left"  data-width="280">Campo</th>\
                                    <th data-formatter="ArchivoFormatter" data-field="DetalleActual" data-halign="center" data-valign="middle" data-align="left">Valor actual</th>\
                                    <th data-formatter="ArchivoFormatter2" data-field="DetalleNuevo" data-sortable="true" data-halign="center" data-valign="middle" data-align="center">Valor nuevo</th>\
                                </tr>\
                            </thead>\
                        </table>', row.Id);
    return html;
}

function ArchivoFormatter(index, row) {

    if (row.ColumnaId == 55 && row.ValorAnterior!=null)
        return `<a href="javascript:DownloadFile(${row.ValorAnterior})" title="Descargar archivo"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
    else
        return row.DetalleActual;
}

function ArchivoFormatter2(index, row) {

    if (row.ColumnaId == 55 && row.NuevoValor != null)
        return `<a href="javascript:DownloadFile(${row.NuevoValor})" title="Descargar archivo"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
    else
        return row.DetalleNuevo;
}

function DownloadFile(id) {

    DownloadFileById(id);
}


function ListarAlertasDetalle(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado/Detalle",
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

function opciones(value, row, index) {
    let botonAceptar = "";
    let botonRechazar = "";
    if (row.EstadoSolicitud == 2) {
        botonAceptar = `<a href="javascript:irConfirmar(${row.Id})" title="Acepta la solicitud de modificación"><i class="iconoVerde glyphicon glyphicon glyphicon-ok"></i></a>`;
        botonRechazar = `<a href="javascript:irRechazoSolicitante(${row.Id})" title="Rechaza la solicitud de modificación"><i class="iconoRojo glyphicon glyphicon glyphicon-remove"></i></a>`;
        return botonAceptar.concat("&nbsp;&nbsp;", botonRechazar);
    }
    else
        return "-";
}

function irConfirmar(id) {
    let data = {};
    data.AppId = id;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/Aprobar`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se aprobó la solicitud correctamente", TITULO_MENSAJE);
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

function irRechazoSolicitante(id) {
    $("#hdSolicitudId").val(id);
    $("#txtDescripcionRechazoSolicitante").val('');
    LimpiarValidateErrores($("#formRechazarSolicitante"));
    OpenCloseModal($("#modalRechazarSolicitante"), true);
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

function sendDataFormAPISolicitante($btn) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjAplicacion();

    $.ajax({
        url: URL_API_VISTA + "/Desestimar",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    toastr.success("Se desestimación de la solicitud de modificación se realizó correctamente.", TITULO_MENSAJE);
                    $('.modal').modal('hide');
                    listarRegistros();
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

function CrearObjAplicacion() {
    var data = {};
    data.AppId = $("#hdSolicitudId").val();
    data.comments = $("#txtDescripcionRechazoSolicitante").val();

    return data;
}

function verComentarios(Id) {
    $(".divComments").empty();
    listarSolicitudComentarios(Id, $("#mdComentarios"));
}

function listarSolicitudComentarios(Id, $md) {
    let data = {};
    data.SolicitudAplicacionId = Id;
    data.pageNumber = 1;
    data.pageSize = REGISTRO_PAGINACION;
    data.sortName = 'FechaCreacion';
    data.sortOrder = 'desc';

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/ListadoSolicitudComentarios",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result !== null) {
                let data = result.Rows;
                if (data !== null && data.length > 0) {
                    setDivComments(data);
                    OpenCloseModal($md, true, "");
                } else {
                    MensajeGeneralAlert(TITULO_MENSAJE, "No hay comentarios registrados hasta el momento.");
                }
            }
        },
        complete: function (data) {
            if (ControlarCompleteAjax(data)) {
                console.log(data);
                //OpenCloseModal($md, true, "");
            } else
                MensajeErrorCliente();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });
}

function setDivComments(ldata) {
    //let rows = ldata.Rows;
    let rows = ldata;

    $.each(rows, function (i, item) {
        if (item.TipoComentarioId === TIPO_COMENTARIO.OBSERVACION) {
            let divAdmin = String.Format('<div class="container">\
                                <img src="/images/user.png" alt="Avatar">\
                                <p class="user-name text-left">{2}</p>\
                                <p>{0}</p>\
                                <span class="time-right">{1}</span>\
                        </div>', item.Comentarios, item.FechaCreacionFormato, item.BandejaAprobadorStr);

            $(".divComments").append(divAdmin);
        }
        else {
            let divUser = String.Format('<div class="container darker">\
                                <img src="/images/user.png" alt="Avatar" class="right">\
                                <p class="user-name text-right">{0}</p>\
                                <p>{1}</p>\
                                <span class="time-left">{2}</span>\
                        </div>', item.UsuarioCreacion, item.Comentarios, item.FechaCreacionFormato);

            $(".divComments").append(divUser);
        }
    });
}

function verSolicitud(Id, EstadoSolicitudId) {
    $(".divObservacion").hide();

    switch (EstadoSolicitudId) {
        case ESTADO_SOLICITUD_APP.REGISTRADO:
            $(".solicitud-app").removeClass("bloq-element");
            break;
        case ESTADO_SOLICITUD_APP.PROCESOREVISION:
            $(".solicitud-app").addClass("bloq-element");
            break;
        case ESTADO_SOLICITUD_APP.APROBADO:
            break;
        case ESTADO_SOLICITUD_APP.OBSERVADO:
            break;
    }

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/GetSolicitudById?Id=${Id}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject;

                    waitingDialog.hide();
                    $("#titleModal").html("Ver Solicitud");
                    OpenCloseModal($("#mdAddOrEditSolicitud"), true, "limpiarModalEliminacion()");
                    $("#hIdSolicitud").val(data.Id);
                    $("#txtAplicacion").val(data.NombreAplicacion);
                    $("#hdAplicacionId").val(data.AplicacionId);
                    $("#txtTE").val(data.TicketEliminacion);
                    $("#txtTCR").val(data.TicketConformidadRatificacion);
                    setTicketView(data.CodigoAplicacion);
                    $("#txtComentarios").val(data.Observaciones);

                    if (data.NombreArchivos !== null && data.NombreArchivos !== "") {
                        $("#txtNomArchivo").val(data.NombreArchivos);
                        $("#btnDescargarFile").show();
                        $("#btnEliminarFile").show();
                    }

                    $("#hdTipoSolicitudId").val(data.TipoSolicitud);
                    if (data.TipoSolicitud === TIPO_SOLICITUD_APP.MODIFICACION) {
                        setTicketView(null);
                        $("#lblFile").html(NOMBRE_FILE_MODIFICACION);
                        $(".divDetalleAtributo").show();

                        //atributos aplicacion
                        let dataAtributos = data.AtributoDetalle;
                        if (dataAtributos !== null && dataAtributos.length > 0) {
                            $tblDetalleAtributosApp.bootstrapTable("destroy");
                            $tblDetalleAtributosApp.bootstrapTable({
                                data: dataAtributos,
                                pagination: true,
                                pageNumber: 1,
                                pageSize: 10
                            });
                        }

                        //atributos modulo
                        //let dataModulos = data.ModuloDetalle;
                        //if (dataModulos !== null && dataModulos.length > 0) {
                        //    $tblDetalleModuloApp.bootstrapTable("destroy");
                        //    $tblDetalleModuloApp.bootstrapTable({
                        //        data: dataModulos,
                        //        pagination: true,
                        //        pageNumber: 1,
                        //        pageSize: 10
                        //    });
                        //}

                    } else {
                        $(".divDetalleAtributo").hide();
                    }
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function OpenCloseModal($md, EstadoMd, FunctionStr) {
    eval(FunctionStr);
    if (EstadoMd)
        $md.modal(opcionesModal);
    else
        $md.modal("hide");
}

function limpiarModalEliminacion() {
    LimpiarValidateErrores($("#formEliminacionSol"));
    $("#txtAplicacion").val('');
    $("#txtComentarios").val('');
    $("#txtNombreAplicacion").val('');
    $("#flArchivo").val('');
    $("#hdArchivoId").val('');
    $("#hdAplicacionId").val('');
    $("#txtNomArchivo").val(TEXTO_SIN_ARCHIVO);

    $("#hIdSolicitud").val("");

    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
}

function irAprobarEliminacion() {
    $(".divObservacion").hide();
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: String.Format("¿Estás seguro que deseas {0} esta solicitud?", "aprobar"),
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            result = result || null;
            if (result !== null && result) {
                aprobarSolicitud();
            }
        }
    });
}

function sendDataEstadoAPI($btn, Mensaje, EstadoSolicitudId, TipoSolicitudId) {
    let data = {};
    data.Id = $("#hIdSolicitud").val();
    data.EstadoSolicitudId = EstadoSolicitudId;
    data.Observacion = $("#txtObservacionesElim").val() || "";
    data.TipoSolicitudId = TipoSolicitudId;

    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }

    $.ajax({
        url: URL_API_VISTA + "/CambiarEstado",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (result) {
            if (result) {
                toastr.success(Mensaje, TITULO_MENSAJE);
            }
        },
        complete: function (data) {
            if (ControlarCompleteAjax(data)) {
                OpenCloseModal($("#mdAddOrEditSolicitud"), false, "");
                $btn.button("reset");
                waitingDialog.hide();
                listarRegistros();
            } else
                MensajeErrorCliente();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });
}

function aprobarSolicitud() {
    sendDataEstadoAPI($("#btnAprobarElim"),
        "Se aprobó la solicitud correctamente",
        ESTADO_SOLICITUD_APP.APROBADO,
        $("#hdTipoSolicitudId").val());
}

function observarSolicitud() {
    sendDataEstadoAPI($("#btnEnviarObservacion"),
        "Se observó la solicitud correctamente",
        ESTADO_SOLICITUD_APP.OBSERVADO,
        $("#hdTipoSolicitudId").val());
}

function irObservarEliminacion() {
    $(".divObservacion").show();
    $("#txtObservacionesElim").focus();
}

function confirmarObservacionEliminacion() {
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: String.Format("¿Estás seguro que deseas {0} esta solicitud?", "observar"),
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            result = result || null;
            if (result !== null && result) {
                observarSolicitud();
            }
        }
    });
}

function setTicketView(codigoApt) {
    if (codigoApt !== null || $.trim(codigoApt) !== "") {
        let tipo_flujo = GetTipoFlujoByAplicacionId(codigoApt);
        if (tipo_flujo !== null) {
            if (tipo_flujo === TIPO_FLUJO_PORTAFOLIO.FNA) {
                $(".ticket").show();
                $(".ticket").removeClass("ignore");
                $("#lblFile").html(NOMBRE_FILE_ELIMINACION_FNA);
            } else {
                $(".ticket").addClass("ignore");
                $(".ticket").hide();
                $("#lblFile").html(NOMBRE_FILE_ELIMINACION_PAE);
            }
        } else {
            $(".ticket").addClass("ignore");
            $(".ticket").hide();
            $("#lblFile").html(NOMBRE_FILE_ELIMINACION_FNA);
        }
    } else {
        $(".ticket").addClass("ignore");
        $(".ticket").hide();
        $("#lblFile").html(NOMBRE_FILE_ELIMINACION_FNA);
    }
}

function GetTipoFlujoByAplicacionId(id) {
    let retorno = 0;
    let _id = id;

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GetTipoFlujoByAplicacion?codigoAPT=${_id}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                retorno = dataObject;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return retorno;
}

function DescargarArchivo() {
    DownloadFileSolicitud($("#hIdSolicitud").val(), $("#txtNomArchivo"), TITULO_MENSAJE);
}

function DownloadFileSolicitud(id, $inputFile, titulo) {
    let archivo = $inputFile.val();

    if (archivo === TEXTO_SIN_ARCHIVO) {
        bootbox.alert({
            size: "small",
            title: titulo,
            message: "No archivo para descargar.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
        return false;
    }
    let url = `${URL_API_VISTA}/Download?id=${id}`;

    window.location.href = url;
}

function GetEstadoAprobador(_lAprobadores, _bandejaId) {
    let retorno = "NO APLICA";
    let dataAprobador = _lAprobadores.find(x => x.BandejaId === _bandejaId) || null;
    if (dataAprobador !== null) {
        switch (dataAprobador.EstadoAprobacionBandeja) {
            case ESTADO_SOLICITUD_APP.PROCESOREVISION:
                retorno = `<i title='Pendiente de aprobación' class='btn btn-primary glyphicon glyphicon-warning-sign'></i>`; //Pendiente
                break;
            case ESTADO_SOLICITUD_APP.APROBADO:
                retorno = `<i title='Aprobado' class='btn btn-primary glyphicon glyphicon-check'></i>`; //Aprobado
                break;
            case ESTADO_SOLICITUD_APP.OBSERVADO:
                retorno = `<i title='Observado' class='btn btn-primary glyphicon glyphicon-unchecked'></i>`; //Observado
                break;
        }
    }
    return retorno;
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }
    
    //let url = `${URL_API_VISTA}/ExportarSolicitudesModificacion?matricula=${DATA_EXPORTAR.Matricula}&codigoApt=${DATA_EXPORTAR.CodigoApt}&estadoSolicitudUnico=${DATA_EXPORTAR.EstadoSolicitudUnico}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
    let url = `${URL_API_VISTA}/ExportarSolicitudesModificacion?codigoApt=${DATA_EXPORTAR.CodigoApt}&estadoSolicitudUnico=${DATA_EXPORTAR.EstadoSolicitudUnico}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function opciones(value, row, index) {
    let botonrechazar = "";

    if (row.estadosolicitud == 2 || row.estadosolicitud == 4) {
        botonrechazar = `<a href="javascript:irrechazosolicitante(${row.id})" title="desestima la solicitud de modificación"><i class="iconorojo glyphicon glyphicon glyphicon-remove"></i></a>`;
        return botonrechazar;
    }
    else
        return "-";
}