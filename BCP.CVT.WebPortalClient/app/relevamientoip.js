var URL_API_VISTA = URL_API + "/Dashboard";
var $table = $('#table');
var DATA_EXPORTAR = {};

$(function () {
    initFecha();
    MethodValidarFecha(RANGO_DIAS_HABILES);
    ValidarFiltros();
    listarNivel1();
});

function Buscar() {
    $("#formFiltros").validate().resetForm();
    if ($("#formFiltros").valid()) {
        listarNivel1();
    }
}

function initFecha() {
    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    _BuildDatepicker($("#FechaFiltro"));
}

function listarNivel1() {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 100;
    DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/IP/Consolidado/Nivel1",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableNivel1(data);
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

function buildTableNivel1(data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'IdentificacionToString',
        title: 'Estado'
    });
    columns.push({
        field: 'VLAN',
        title: 'Total VLANs',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'IPTotal',
        title: 'Total IPs',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'SegRedOK',
        title: 'SEG <br/> OK',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'SegRedNOK',
        title: 'SEG <br/> OK',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'Servidores',
        title: 'Total <br/>servidores',
        class: 'fondoVerdeLeve',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'ServidoresUnicos',
        title: 'Total <br/>servidores <br/>únicos',
        class: 'fondoVerdeLeve',
        footerFormatter: totalFormatter
    });

    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel2($detail, row.Identificacion);
        }
    });
}

function expandTableNivel2($detail, identificacion) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;
    DATA_EXPORTAR.Identificacion = identificacion;
    DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/IP/Consolidado/Nivel2",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableNivel2($detail.html('<table></table>').find('table'), data);
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

function buildTableNivel2($el, data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'CMDB',
        title: 'Información ADDM'
    });
    columns.push({
        field: 'VLAN',
        title: 'Total VLANs',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'IPTotal',
        title: 'Total IPs',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'SegRedOK',
        title: 'SEG <br/> OK',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'SegRedNOK',
        title: 'SEG <br/> OK',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'Servidores',
        title: 'Total <br/>servidores',
        class: 'fondoVerdeLeve',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'ServidoresUnicos',
        title: 'Total <br/>servidores <br/>únicos',
        class: 'fondoVerdeLeve',
        footerFormatter: totalFormatter
    });

    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showHeader: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel3($detail, row.Identificacion, row.CMDB);
        }
    });
}

function expandTableNivel3($detail, identificacion, cmdb) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;
    DATA_EXPORTAR.Identificacion = identificacion;
    DATA_EXPORTAR.CMDB = cmdb;
    DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/IP/Consolidado/Nivel3",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableNivel3($detail.html('<table></table>').find('table'), data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {

        },
        async: true
    });
}

function buildTableNivel3($el, data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'Zona',
        title: 'Zona'
    });
    columns.push({
        field: 'VLAN',
        title: 'Total VLANs',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'IPTotal',
        title: 'Total IPs',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'SegRedOK',
        title: 'SEG <br/> OK',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'SegRedNOK',
        title: 'SEG <br/> OK',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'Servidores',
        title: 'Total <br/>servidores',
        class: 'fondoVerdeLeve',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'ServidoresUnicos',
        title: 'Total <br/>servidores <br/>únicos',
        class: 'fondoVerdeLeve',
        footerFormatter: totalFormatter
    });

    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showHeader: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel4($detail, row.Identificacion, row.CMDB, row.Zona);
        }
    });
}

function expandTableNivel4($detail, identificacion, cmdb, zona) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;
    DATA_EXPORTAR.Zona = zona;
    DATA_EXPORTAR.CMDB = cmdb;
    DATA_EXPORTAR.Identificacion = identificacion;
    DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/IP/Consolidado/Nivel4",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableNivel4($detail.html('<table></table>').find('table'), data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {

        },
        async: true
    });
}

function buildTableNivel4($el, data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'IPPorServer',
        title: 'IPs por equipo'
    });
    columns.push({
        field: 'VLAN',
        title: 'Total VLANs',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'IPTotal',
        title: 'Total IPs',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'SegRedOK',
        title: 'SEG <br/> OK',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'SegRedNOK',
        title: 'SEG <br/> OK',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'Servidores',
        title: 'Total <br/>servidores',
        class: 'fondoVerdeLeve',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'ServidoresUnicos',
        title: 'Total <br/>servidores <br/>únicos',
        class: 'fondoVerdeLeve',
        footerFormatter: totalFormatter
    });

    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showHeader: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel5($detail, row.Identificacion, row.CMDB, row.Zona, row.IPPorServer);
        }
    });
}

function expandTableNivel5($detail, identificacion, cmdb, zona, ips) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;
    DATA_EXPORTAR.Zona = zona;
    DATA_EXPORTAR.CMDB = cmdb;
    DATA_EXPORTAR.Identificacion = identificacion;
    DATA_EXPORTAR.Ips = ips;
    DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/IP/Consolidado/Nivel5",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableDetalle($detail.html('<table></table>').find('table'), data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
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
        field: 'Responsable',
        title: 'Responsable'
    });
    columns.push({
        field: 'IP',
        title: 'IP'
    });
    columns.push({
        field: 'MAC',
        title: 'MAC'
    });
    columns.push({
        field: 'EquipoReporte',
        title: 'Equipo según <br/>reporte IP'
    });
    columns.push({
        field: 'Nombre',
        title: 'Equipo activo <br/> según CVT'
    });
    columns.push({
        field: 'EquipoInactivo',
        title: 'Equipo inactivo <br/> según CVT'
    });
    columns.push({
        field: 'ExisteCVT',
        title: 'IP existe en CVT',
        class: 'estiloDefecto',
        formatter: existeFormatter
    });
    columns.push({
        field: 'CoincideCVT',
        title: 'IP correctamente <br/> asociada en <br/> CVT/Reporte',
        class: 'estiloDefecto',
        formatter: coincideFormatter
    });

    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: false
    });
}

function ExportarInfo() {
    let fecha = castDate($("#FechaFiltro").val());
    let url = `${URL_API_VISTA}/IP/Detalle/Exportar?fecha=${fecha}`;
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

function totalFormatter(data) {
    var field = this.field;
    var suma = data.map(function (row) {
        return +row[field];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    return '<strong style="font-size:10px !important;">' + suma + '</strong>';
}

function ValidarFiltros() {

    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            FechaFiltro: {
                required: true,
                isDate: true,
                FechaPrevia: true,
                FechaMaxima: true
            }
        },
        messages: {
            FechaFiltro: {
                required: "Debe seleccionar una fecha",
                isDate: "Debe ingresar una fecha valida",
                FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtFilFecha") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}
