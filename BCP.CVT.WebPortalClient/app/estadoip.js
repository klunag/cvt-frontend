var URL_API_VISTA = URL_API + "/Dashboard";
var $table = $("#tblRegistro");
var DATA_EXPORTAR = {};
$(function () {
    listarRegistros();
});

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/IP/Estado/Detalle",
        method: 'POST',
		ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Prefix',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
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

function ExportarInfo() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.sortName = 'Prefix';
    DATA_EXPORTAR.sortOrder = 'ASC';

    let url = `${URL_API_VISTA}/IP/Detalle/Exportar`;
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

function existeFormatter(value, row, index) {
    var html = "";
    if (row.ExisteCVT === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.ExisteCVT === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function coincideFormatter(value, row, index) {
    var html = "";
    if (row.CoincideCVT === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.CoincideCVT === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}