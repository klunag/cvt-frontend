//HTML
var $table = $("#tbl-solicitudes-pendientes-cvt");

//SERVICE
var URL_API_VISTA = URL_API + "/ApplianceSolicitud";
var URL_API_FILE = URL_API + "/File"; 
var SOLICITUD_PENDIENTE_CVT = "/ListarSolicitudCvt";

//CROSS
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Solicitudes de cambio de equipo Appliance";
 
$(function () {

    initFecha();
    InitAutocompletarBuilder($("#txtCodigoFiltro"), null, ".containerFiltro", "/Equipo/GetEquipoByFiltroActivo?filtro={0}");
    $("#ddlEstadoFiltro").val(6);
    listPendingRequestCvt();

    $("#btnAprobar").click(aprobarSolicitud);
    $("#btnRechazar").click(rechazarSolicitud);
    $("#btnBuscar").click(listPendingRequestCvt);
    $("#btnProcesarAprobador").click(guardarAprobador);
});
 
function ExportarInfo() { 
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR.nombre = $.trim($("#txtCodigoFiltro").val());
    DATA_EXPORTAR.tipoId = $.trim($("#ddlEstadoFiltro").val());
    //DATA_EXPORTAR.RolUsuario = ROLES;
    //DATA_EXPORTAR.Matricula = USUARIO.UserName;

    let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre}&estado=${DATA_EXPORTAR.tipoId}`;
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

//listar registros aprobados por el Owner - estado => pendiente_atencion_cvt(6)
function listPendingRequestCvt() { 
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + SOLICITUD_PENDIENTE_CVT,
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {}; 
            DATA_EXPORTAR.nombre = $.trim($("#txtCodigoFiltro").val());
            DATA_EXPORTAR.tipoId = $("#ddlEstadoFiltro").val();
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
    let btnVer = "";
    let btnDesestimar = "";
    let style_color = row.isCompleted == true ? 'iconoVerde ' : "iconoRojo ";
    if (row.ApruebaSolicitud)
        btnVer = `<a href="#" onclick="javascript:irDetalle(${row.Id}, ${row.EstadoSolicitud})" title="Revisa el detalle de la solicitud"><i class="iconoVerde glyphicon glyphicon-zoom-in"></i></a>`;

    //if (row.EstadoSolicitud == 2 || row.EstadoSolicitud == 6) //Se puede desestimar
    //    btnDesestimar = `<a href="javascript:irRechazoSolicitante(${row.Id})" title="Desestima la solicitud de cambio de equipo"><i class="iconoRojo glyphicon glyphicon glyphicon-remove"></i></a>`;

    return btnVer;
}

function irDetalle(id, state) {
    limpiarAddOrEditModal();
    $("#btnDescargar").hide();
    $("#btnGuardar").hide();
    $("#btnAprobar").hide();
    $("#btnRechazar").hide();
    $("#txtComentarios").attr("disabled", "disabled");
    $("#dpFecha").attr("disabled", "disabled");
    $("#txtEquipo").attr("disabled", "disabled");
    $("#txtAplicacion").attr("disabled", "disabled");
    $("#flArchivo").attr("disabled", "disabled");
    $("#txtArchivo").attr("disabled", "disabled");
    $("#rowComentariosAprobador").hide();
    $("#rowComentariosDesestimacion").hide();
    $("#rowComentariosRechazo").hide();
     
    if (state == 8) {
        $("#rowComentariosRechazo").show();
        $("#txtComentariosRechazo").attr("disabled", "disabled");
    }
    else if (state == 4) {
        $("#rowComentariosRechazo").show();
        $("#txtComentariosRechazo").attr("disabled", "disabled");
    }
    else {
        if (state == 6) {
            $("#btnAprobar").show();
            $("#btnRechazar").show();
        }
        else {
            //$("#rowComentariosAprobador").show();
            $("#txtComentariosAprobacionRechazo").attr("disabled", "disabled");
        }
    }
     
    getSolicitud(id);
    OpenCloseModal($("#modalEliminar"), true);
}

function irRechazoSolicitante(id) {
    $("#hdSolicitudId").val(id);
    $("#txtDescripcionRechazoSolicitante").val('');
    LimpiarValidateErrores($("#formRechazarSolicitante"));
    OpenCloseModal($("#modalRechazarSolicitante"), true);
}

function initFecha() {
    $("#dpFecha-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
}

function aprobarSolicitud() {
    $("#hdAccion").val(7); //Aprobado
    $("#txtDescripcionAprobador").val('');

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás seguro de aprobar la solicitud de cambio de equipo?",
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            result = result || null;
            if (result !== null && result) {
                sendDataFormAPIAprobador($("#btnProcesarAprobador"));
            }
        }
    });
}

function rechazarSolicitud() { 
    $("#hdAccion").val(8); //Rechazar
    $("#txtDescripcionAprobador").val('');
    OpenCloseModal($("#modalAprobarRechazar"), true);
}

function limpiarAddOrEditModal() {
    $("#btnDescargar").hide();
    $("#btnGuardar").show();
    $("#btnAprobar").hide();
    $("#btnRechazar").hide();
    $("#txtComentarios").prop("disabled", false);
    $("#dpFecha").prop("disabled", false);
    $("#txtEquipo").prop("disabled", false);
    $("#txtAplicacion").prop("disabled", false);
    $("#flArchivo").prop("disabled", false);
    $("#txtArchivo").prop("disabled", false);
    $("#rowComentariosAprobador").hide();
    $("#rowComentariosDesestimacion").hide();
    LimpiarValidateErrores($("#formEliminar"));
    $("#txtEquipo, #dpFecha, #txtComentarios, #flArchivo, #txtComentariosAprobacionRechazo, #txtArchivo").val("");
    $("#hdSolicitudId").val("0");
    $("#hdAccion").val("0");
    $("#hdAplicacionId").val("0");
    $("#txtAplicacion").val('');
}

function DescargarArchivo() {
    DownloadFileSolicitud($("#hdSolicitudId").val());
}

function DownloadFileSolicitud(id) {
    let url = `${URL_API_FILE}/downloadConstanciaActivoTSI?id=${id}`;
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

function guardarRechazoAppSolicitante() {
    if ($("#formRechazarSolicitante").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: "¿Estás seguro de desestimar la solicitud de cambio de equipo?",
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                result = result || null;
                if (result !== null && result) {
                    sendDataFormAPISolicitante($("#btnProcesarRechazoSolicitante"));
                }
            }
        });
    }
}

function getSolicitud(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({

        url: URL_API_VISTA + `/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;

                    $("#hdSolicitudId").val(data.Id);
                    $("#txtComentarios").val(data.Comentarios);
                    $("#txtEquipo").val(data.NombreEquipo);
                    $("#txtComentariosAprobacionRechazo").val(data.ComentariosAprobacionRechazo);
                    $("#txtComentariosDesestimacion").val(data.ComentariosDesestimacion);
                    $("#txtComentariosRechazo").val(data.ComentariosAprobacionRechazo);
                    $("#dpFecha").val(data.FechaFinSoporteToString);
                    $("#txtArchivo").val(data.NombreArchivo);
                    $("#txtAplicacion").val(data.CodigoAPT);

                    if (data.TieneArchivo)
                        $("#btnDescargar").show();
                }
            }
        },
        complete: function () {
            waitingDialog.hide();
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: true
    });

}

 

function guardarAprobador() {   
    let estado = $("#hdAccion").val();
    let mensaje = "";

    if (estado == 8) { 
        $("#txtDescripcionAprobador").val();
        mensaje = "¿Estás seguro de rechazar la solicitud de cambio de equipo?";
    }
     
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: mensaje,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            result = result || null;
            if (result !== null && result) {
                sendDataFormAPIAprobador($("#btnProcesarAprobador"));
            }
        }
    });
}

 


function sendDataFormAPIAprobador($btn) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjSolicitudAprobacion();

    $.ajax({
        url: URL_API_VISTA + "/CambiarEstado",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) { 
                    let status = $("#hdAccion").val();
                    if (status == 7) toastr.success("Se realizó la aprobación de la solicitud de manera correcta.", TITULO_MENSAJE);
                    if (status == 8) toastr.success("Se realizó el rechazo de la solicitud de manera correcta.", TITULO_MENSAJE);
                    $('.modal').modal('hide');
                    $('.modal-backdrop').remove();
                    listPendingRequestCvt();
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

function CrearObjSolicitudAprobacion() { 
    var data = {};
    data.Id = $("#hdSolicitudId").val();
    data.ComentariosAprobacionRechazo = $("#txtDescripcionAprobador").val();
    data.EstadoSolicitud = $("#hdAccion").val();
    return data;
}