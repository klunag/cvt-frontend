var $table = $("#tblNotificaciones");
var URL_API_VISTA = URL_API + "/Alerta/TipoNotificaciones/Portafolio";
var URL_API_NOTIFICACIONES = URL_API + "/Alerta/Notificaciones/Portafolio";
var DATA_EXPORTAR = {};
var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "FechaCreacion";
var ULTIMO_SORT_ORDER = "desc";

$(function () {
    $("#btnBuscar").click(RefrescarListado);

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
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: ULTIMO_SORT_NAME,
        sortOrder: ULTIMO_SORT_ORDER,
        queryParams: function (p) {
            ULTIMO_PAGE_NUMBER = p.pageNumber;
            ULTIMO_REGISTRO_PAGINACION = p.pageSize;
            ULTIMO_SORT_NAME = p.sortName;
            ULTIMO_SORT_ORDER = p.sortOrder;

            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Para = $.trim($("#txtPara").val());
            DATA_EXPORTAR.Asunto = $.trim($("#txtAsunto").val());
            DATA_EXPORTAR.TipoNotificacionId = $("#cbTipo").val();
            DATA_EXPORTAR.FechaFiltro = $.trim($("#txtFechaRegistro").val()) !== "" ? castDate($("#txtFechaRegistro").val()) : null;
            DATA_EXPORTAR.MesesTrimestre = "";
            DATA_EXPORTAR.AnioFiltro = null;
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

function ListarTipoNotificaciones() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/" + "Listado/Todo",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "GET",
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