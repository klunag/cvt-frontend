var $table = $("#tblArchivos");
var URL_API_VISTA = URL_API + "/File";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Vista de archivos";
var CODIGO_INTERNO = 0;

$(function () {

    //validarFormImportar();
    //CargarCodigoInterno();
    listarRegistros();
    //initUpload($("#txtArchivo"));
});

function listarRegistros(){
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
            DATA_EXPORTAR.nombre = "";//$.trim($("#txtBusRegistro").val() || "");
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


function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = "download-alt";//row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:DescargarArchivo(${row.Id})" title="Descargar archivo"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return estado;
}

function DescargarArchivo(Id) {
    let url = `${URL_API_VISTA}/download?id=${Id}`;

    window.location.href = url;
}