var $table = $("#tblNotificaciones");
var URL_API_VISTA = URL_API + "/Alerta/TipoNotificaciones";
var URL_API_NOTIFICACIONES = URL_API + "/Alerta/Notificaciones";
var DATA_EXPORTAR = {};

$(function () {
    ListarTipoNotificaciones();
    ListarNotificaciones();
    InitControles();    
});

function InitControles() {

    $("#divFechaRegistro").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY",
        minDate: moment().startOf('day')._d
    });    
}

function ListarNotificaciones() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_NOTIFICACIONES + "/Listado",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Para = $.trim($("#txtPara").val());
            DATA_EXPORTAR.Asunto = $.trim($("#txtAsunto").val());
            DATA_EXPORTAR.TipoNotificacionId = $("#cbTipo").val();
            DATA_EXPORTAR.FechaFiltro = $.trim($("#txtFechaRegistro").val()) !== "" ? castDate($("#txtFechaRegistro").val()) : null;
            DATA_EXPORTAR.MesesTrimestre = "";
            DATA_EXPORTAR.AnioFiltro = null;
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

function ListarTipoNotificaciones() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/" + "Listado/Todo",
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        dataType: "json",
        success: function (result) {
            CargarCombos(result.ListaTipoNotificaciones);                   
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });

}

function CargarCombos(dataCombos) {
    SetItems(dataCombos, $("#cbTipo"), TEXTO_SELECCIONE);
    $("#cbTipo").val("-1");
}

function RefrescarListado() {
    ListarNotificaciones();
}

function ExportarInfo() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Para = $.trim($("#txtPara").val());
    DATA_EXPORTAR.Asunto = $.trim($("#txtAsunto").val());
    DATA_EXPORTAR.TipoNotificacionId = $("#cbTipo").val();
    DATA_EXPORTAR.FechaFiltro = $.trim($("#txtFechaRegistro").val()) !== "" ? castDate($("#txtFechaRegistro").val()) : null;
    DATA_EXPORTAR.MesesTrimestre = "";
    DATA_EXPORTAR.AnioFiltro = null;

    let url = `${URL_API_NOTIFICACIONES}/Exportar?para=${DATA_EXPORTAR.Para}&asunto=${DATA_EXPORTAR.Asunto}&tipoId=${DATA_EXPORTAR.TipoNotificacionId}&fechaRegistro=${DATA_EXPORTAR.FechaFiltro}&mesesTrimestre=${DATA_EXPORTAR.MesesTrimestre}&anio=${DATA_EXPORTAR.AnioFiltro}`;
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