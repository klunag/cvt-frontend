var $table = $("#tblRegistros");
var URL_API_VISTA = URL_API + "/DeudaTecnica";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Deuda de Descubrimiento";
var CODIGO_INTERNO = 0;

$(function () {
    _BuildDatepicker($("#FechaFiltro"));
    //InitAutocompletarProductoSearch($("#txtProducto"), $("#hProducto"), ".containerFiltroProducto");
    InitAutocompletarBuilder($("#txtProducto"), $("#hProducto"), ".containerFiltroProducto", "/Producto/GetByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtAplicacion"), $("#hAplicacion"), ".containerFiltroAplicacion", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtProceso"), $("#hProceso"), ".containerFiltroProceso", "/Proceso/GetByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtPuerto"), $("#hPuerto"), ".containerFiltroPuerto", "/Puerto/GetByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtProtocolo"), $("#hProtocolo"), ".containerFiltroProtocolo", "/Protocolo/GetByFiltro?filtro={0}");
    //listarRegistros();
   
});

function buscarRegistros() {
    listarRegistros();
}

function listarRegistros() {
    validarBuscar();
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
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
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.ProductoId = $("#hProducto").val();
            DATA_EXPORTAR.Aplicacion = $("#hAplicacion").val();
            DATA_EXPORTAR.ProcesoId = $("#hProceso").val();
            DATA_EXPORTAR.PuertoId = $("#hPuerto").val();
            DATA_EXPORTAR.ProtocoloId = $("#hProtocolo").val();
            DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
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
function validarBuscar() {
    if ($("#txtPuerto").val() == "")
        $("#hPuerto").val(0)
    if ($("#txtProtocolo").val() == "")
        $("#hProtocolo").val(0)
    if ($("#txtProceso").val() == "")
        $("#hProceso").val(0)
    if ($("#txtProducto").val() == "")
        $("#hProducto").val(0)
    if ($("#txtAplicacion").val() == "")
        $("#hAplicacion").val("")
}
function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let url = `${URL_API_VISTA}/Exportar?ProductoId=${DATA_EXPORTAR.ProductoId}&Aplicacion=${DATA_EXPORTAR.Aplicacion}&ProcesoId=${DATA_EXPORTAR.ProcesoId}&PuertoId=${DATA_EXPORTAR.PuertoId}&ProtocoloId=${DATA_EXPORTAR.ProtocoloId}&Fecha=${DATA_EXPORTAR.Fecha}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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
