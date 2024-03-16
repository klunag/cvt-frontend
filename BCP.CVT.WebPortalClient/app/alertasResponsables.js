var $table = $("#tblAplicaciones");
var URL_API_VISTA = URL_API + "/Alerta/Responsables";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Aplicaciones";

$(function () {
    listarRegistros();
});

function RefrescarListado() {
    listarRegistros();
}

function listarRegistros() {
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
        sortName: 'CodigoAPT',
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

function formatterTtl(value, row, index) {
    var ttl = 0;
    if (row.TotalTtl === 1 && row.TotalTtlNoAplica === 1)
        ttl = 1;
    else {
        if (row.TotalTtlNoAplica === 0 && row.TotalTtl === 0)
            ttl = 0;
        else
            ttl = row.TotalTtl;
    }

    if (ttl>0)
        return `<img src="/images/verde.png" title="Con responsable" />`;
    else
        return `<img src="/images/rojo.png" title="Sin responsable" />`;
}

function formatterJde(value, row, index) {
    var jde = 0;
    if (row.TotalJde === 1 && row.TotalJdeNoAplica === 1)
        jde = 1;
    else {
        if (row.TotalJde === 0 && row.TotalJdeNoAplica === 0)
            jde = 0;
        else
            jde = row.TotalJde;
    }

    if (jde > 0)
        return `<img src="/images/verde.png" title="Con responsable" />`;
    else
        return `<img src="/images/rojo.png" title="Sin responsable" />`;
}

function formatterBroker(value, row, index) {
    var broker = 0;
    if (row.TotalBroker === 1 && row.TotalBrokerNoAplica === 1)
        broker = 1;
    else {
        if (row.TotalBroker === 0 && row.TotalBrokerNoAplica === 0)
            broker = 0;
        else
            broker = row.TotalBroker;
    }

    if (broker > 0)
        return `<img src="/images/verde.png" title="Con responsable" />`;
    else
        return `<img src="/images/rojo.png" title="Sin responsable" />`;
}

function formatterOwner(value, row, index) {
    var owner = 0;
    if (row.TotalOwner === 1 && row.TotalOwnerNoAplica === 1)
        owner = 1;
    else {
        if (row.TotalOwner === 0 && row.TotalOwnerNoAplica === 0)
            owner = 0;
        else
            owner = row.TotalOwner;

    }
    if (owner > 0)
        return `<img src="/images/verde.png" title="Con responsable" />`;
    else
        return `<img src="/images/rojo.png" title="Sin responsable" />`;
}

function formatterExperto(value, row, index) {
    var experto = 0;
    if (row.TotalExperto === 1 && row.TotalExpertoNoAplica === 1)
        experto = 1;
    else {
        if (row.TotalExperto === 0 && row.TotalExpertoNoAplica === 0)
            experto = 0;
        else
            experto = row.TotalExperto;

    }

    if (experto > 0)
        return `<img src="/images/verde.png" title="Con responsable" />`;
    else
        return `<img src="/images/rojo.png" title="Sin responsable" />`;
}

function formatterGestor(value, row, index) {
    var gestor = 0;
    if (row.TotalGestor === 1 && row.TotalGestorNoAplica === 1)
        gestor = 1;
    else {
        if (row.TotalGestor === 0 && row.TotalGestorNoAplica === 0)
            gestor = 0;
        else
            gestor = row.TotalGestor;

    }

    if (gestor > 0)
        return `<img src="/images/verde.png" title="verde" />`;
    else
        return `<img src="/images/rojo.png" title="verde" />`;
}


function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let url = `${URL_API_VISTA}/Exportar?sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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