var $table = $("#tblData");
var URL_API_VISTA = URL_API + "/Auditoria";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Auditoría";
var FILTRO_ACCION = { INSERT: "1", UPDATE: "2", DELETE: "3", CREATE: "4" };

$(function () {
    InitFecha();
    CargarCombos();
    listarAuditoria();
});

function InitFecha() {
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

function RefrescarListado() {
    listarAuditoria();
}

function listarAuditoria() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListarAuditoria",
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
            DATA_EXPORTAR.Matricula = $("#txtFiltroMatricula").val();
            DATA_EXPORTAR.Accion = filtroAccion($("#cbFilAccion").val());
            DATA_EXPORTAR.Entidad = $("#txtFiltroEntidad").val();
            DATA_EXPORTAR.Campo = $("#txtFiltroCampo").val();
            DATA_EXPORTAR.FechaDesde = $("#txtFiltroFechaDesde").val() == '' ? null : dateFromString($("#txtFiltroFechaDesde").val());
            DATA_EXPORTAR.FechaHasta = $("#txtFiltroFechaHasta").val() == '' ? null :dateFromString($("#txtFiltroFechaHasta").val());
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

function filtroAccion() {
    var opcStr = "";
    let opc = $("#cbFilAccion").val();
    switch (opc) {
        case FILTRO_ACCION.INSERT:
            opcStr = "I";
            break;
        case FILTRO_ACCION.UPDATE:
            opcStr = "U";
            break;
    }
    console.log(opcStr);
    return opcStr;
}

function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Accion, $("#cbFilAccion"), TEXTO_TODOS); 
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
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Matricula = $("#txtFiltroMatricula").val();
    DATA_EXPORTAR.Accion = filtroAccion($("#cbFilAccion").val());
    DATA_EXPORTAR.Entidad = $("#txtFiltroEntidad").val();
    DATA_EXPORTAR.Campo = $("#txtFiltroCampo").val();
    DATA_EXPORTAR.sortName = "FechaCreacion";
    DATA_EXPORTAR.sortOrder = "desc";
     
    var fechaDesde = $("#txtFiltroFechaDesde").val() == null || $("#txtFiltroFechaDesde").val() == "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#txtFiltroFechaDesde").val())).format("YYYY-MM-DD");
    var fechaHasta = $("#txtFiltroFechaHasta").val() == null || $("#txtFiltroFechaHasta").val() == "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#txtFiltroFechaHasta").val())).format("YYYY-MM-DD");

    let url = `${URL_API_VISTA}/ExportarAuditoriaData?matricula=${DATA_EXPORTAR.Matricula}&entidad=${DATA_EXPORTAR.Entidad}&campo=${DATA_EXPORTAR.Campo}&accion=${DATA_EXPORTAR.Accion}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;

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


function idasociadoFormatter(value, row, index) {
    //return `<code>${value}</code>`;
    //console.log(value);
    return `${row.IdAsociado.replace("<", "[").replace(">", "]")}`;
}