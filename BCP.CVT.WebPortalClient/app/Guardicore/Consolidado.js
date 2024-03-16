var $table = $('#table');
var URL_API_VISTA = URL_API + "/Guardicore";

$(function () {
    listarDatosIniciales();
});

function listarDatosIniciales() {
    var data = [];

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Reporte",
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableInicial(data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        async: true
    });
}

function expandTableSO($detail, idestado) {
    var data = [];

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Reporte/SO?idestado=" + idestado + "",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableSO($detail.html('<table></table>').find('table'), data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        async: true
    });
}

function buildTableInicial(data) {
    var columns = [];
    columns.push({
        field: 'estado',
        formatter: nombreReporteFormatter,
        title: 'Estado',
        footerFormatter: dominioFormatter
    });
    columns.push({
        field: 'cantidadEstado',
        title: 'Cantidad',
        class: 'fondoBlanco',
        footerFormatter: subdominioFormatter
    });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableSO($detail, row.idestado);
        }
    });
}

function buildTableSO($el, data) {
    var columns = [];
    columns.push({
        field: 'so',
        formatter: nombreReporteFormatter,
        title: 'Sistema Operativo Guardicore',
    });
    columns.push({
        field: 'cantidadSO',
        title: 'Cantidad',
        class: 'fondoBlanco'
    });
    
    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showHeader: true,
        onExpandRow: function (index, row, $detail) {
            expandTableDetalle($detail, row.idestado, row.so);
        }
    });
}

function expandTableDetalle($detail, idestado, so) {
    var data = [];
    
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Reporte/Detalle?idestado=" + idestado + "&so=" + so + "",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableDetalle($detail.html('<table></table>').find('table'), data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {

        },
        async: true
    });
}

function buildTableDetalle($el, data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'nombre',
        //formatter: nombreReporteProductosFormatter,
        title: 'Nombre'
    });
    columns.push({
        field: 'so',
        title: 'Sistema Operativo Guardicore',
        class: 'fondoBlanco'
    });
    columns.push({
        field: 'fechaescaneo',
        title: 'Fecha de Escaneo',
        class: 'fondoBlanco'
    });
    columns.push({
        field: 'ip',
        title: 'Ip',
        class: 'fondoBlanco'
    });
    columns.push({
        field: 'etiqueta',
        title: 'Etiqueta',
        class: 'fondoBlanco'
    });
    columns.push({
        field: 'SOTecnologia',
        title: 'Sistema Operativo CVT',
        class: 'fondoBlanco'
    });

    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: false
        //showHeader: false,
        //onExpandRow: function (index, row, $detail) {
        //    /* eslint no-use-before-define: ["error", { "functions": false }]*/
        //    //expandTableEquipos($detail, row.Orden, row.Subdominio, row.NombreProducto, row.Fabricante);
        //}
    });
}

function dominioFormatter() {
    return '<strong>Total General</strong>';
}

function subdominioFormatter(data) {
    var field = this.field;
    var suma = data.map(function (row) {
        return +row[field];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    return '<strong>' + suma + '</strong>';
}

function nombreReporteFormatter(value, row, index) {
    return `<a href="javascript:MostrarGraficoLineaTiempo('${value}')" title="Ver gráfico">${value}</a>`;
}

function exportar() {
    let url = `${URL_API_VISTA}/Reporte/Exportar`;
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