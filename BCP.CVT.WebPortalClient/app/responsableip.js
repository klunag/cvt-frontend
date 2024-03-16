var URL_API_VISTA = URL_API + "/Dashboard";
var $table = $('#table');
var $tableRegistros = $("#tblRegistro");
var DATA_EXPORTAR = {};
$(function () {
    initFecha();
    MethodValidarFecha(RANGO_DIAS_HABILES);
    //listarNivel1();
    ValidarFiltros();
    listarRegistros();
});

function initFecha() {
    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    _BuildDatepicker($("#FechaFiltro"));
}

function Buscar() {
    //listarNivel1();
    listarRegistros();
}
function listarRegistros() {
    $("#formFiltros").validate().resetForm();
    if ($("#formFiltros").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $tableRegistros.bootstrapTable('destroy');
        $tableRegistros.bootstrapTable({
            url: URL_API_VISTA + "/IP/Seguimiento",
            method: 'POST',
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pagination: true,
            sidePagination: 'server',
            queryParamsType: 'else',
            pageSize: 20,
            pageList: OPCIONES_PAGINACION,
            sortName: 'Prefix',
            sortOrder: 'asc',
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.pageNumber = p.pageNumber;
                DATA_EXPORTAR.pageSize = p.pageSize;
                DATA_EXPORTAR.sortName = p.sortName;
                DATA_EXPORTAR.sortOrder = p.sortOrder;
                DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());

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
        url: URL_API_VISTA + "/IP/Estado/Nivel1",
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
        field: 'Zona',
        title: 'Zona'
    });
    columns.push({
        field: 'VLAN',
        title: 'Total VLANs',
        class: 'fondoClaro',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'IPTotal',
        title: 'Total IPs',
        class: 'fondoClaro',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'SeguridadVerde',
        title: 'Seguridad <br/>conforme',
        class: 'fondoVerdeLeve',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'SeguridadRojo',
        title: 'Seguridad <br/>pendiente',
        class: 'fondoRojo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'TelecomVerde',
        title: 'Telecom <br/>conforme',
        class: 'fondoVerdeLeve',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'TelecomRojo',
        title: 'Telecom <br/>pendiente',
        class: 'fondoRojo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'AddmVerde',
        title: 'ETI <br/>conforme',
        class: 'fondoVerdeLeve',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'AddmAmarillo',
        title: 'ETI <br/>en espera',
        class: 'fondoAmarillo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'AddmRojo',
        title: 'ETI <br/>pendiente',
        class: 'fondoRojo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'SegmentacionVerde',
        title: 'SEG <br/>conforme',
        class: 'fondoVerdeLeve',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'SegmentacionRojo',
        title: 'SEG <br/>pendiente',
        class: 'fondoRojo',
        footerFormatter: totalFormatter
    });

    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel2($detail, row.Zona);
        }
    });
}

function expandTableNivel2($detail, zona) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;
    DATA_EXPORTAR.Zona = zona;
    DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/IP/Estado/Nivel2",
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
        title: 'Estado ADDM'
    });
    columns.push({
        field: 'VLAN',
        title: 'Total VLANs',
        class: 'fondoClaro'
    });
    columns.push({
        field: 'IPTotal',
        title: 'Total IPs',
        class: 'fondoClaro'
    });
    columns.push({
        field: 'SeguridadVerde',
        title: 'Seguridad <br/>conforme',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'SeguridadRojo',
        title: 'Seguridad <br/>pendiente',
        class: 'fondoRojo'
    });
    columns.push({
        field: 'TelecomVerde',
        title: 'Telecom <br/>conforme',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'TelecomRojo',
        title: 'Telecom <br/>pendiente',
        class: 'fondoRojo'
    });
    columns.push({
        field: 'AddmVerde',
        title: 'ETI <br/>conforme',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'AddmAmarillo',
        title: 'ETI <br/>en espera',
        class: 'fondoAmarillo'
    });
    columns.push({
        field: 'AddmRojo',
        title: 'ETI <br/>pendiente',
        class: 'fondoRojo'
    });
    columns.push({
        field: 'SegmentacionVerde',
        title: 'SEG <br/>conforme',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'SegmentacionRojo',
        title: 'SEG <br/>pendiente',
        class: 'fondoRojo'
    });

    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showHeader: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel3($detail, row.Zona, row.CMDB);
        }
    });
}

function expandTableNivel3($detail, zona, addm) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;
    DATA_EXPORTAR.Zona = zona;
    DATA_EXPORTAR.Addm = addm;
    DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/IP/Estado/Nivel3",
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
        field: 'Fuente',
        title: 'Fuente de origen'
    });
    columns.push({
        field: 'VLAN',
        title: 'Total VLANs',
        class: 'fondoClaro'
    });
    columns.push({
        field: 'IPTotal',
        title: 'Total IPs',
        class: 'fondoClaro'
    });
    columns.push({
        field: 'SeguridadVerde',
        title: 'Seguridad <br/>conforme',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'SeguridadRojo',
        title: 'Seguridad <br/>pendiente',
        class: 'fondoRojo'
    });
    columns.push({
        field: 'TelecomVerde',
        title: 'Telecom <br/>conforme',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'TelecomRojo',
        title: 'Telecom <br/>pendiente',
        class: 'fondoRojo'
    });
    columns.push({
        field: 'AddmVerde',
        title: 'ETI <br/>conforme',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'AddmAmarillo',
        title: 'ETI <br/>en espera',
        class: 'fondoAmarillo'
    });
    columns.push({
        field: 'AddmRojo',
        title: 'ETI <br/>pendiente',
        class: 'fondoRojo'
    });
    columns.push({
        field: 'SegmentacionVerde',
        title: 'SEG <br/>conforme',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'SegmentacionRojo',
        title: 'SEG <br/>pendiente',
        class: 'fondoRojo'
    });

    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showHeader: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel4($detail, row.Zona, row.CMDB, row.Fuente);
        }
    });
}

function expandTableNivel4($detail, zona, addm, fuente) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;
    DATA_EXPORTAR.Zona = zona;
    DATA_EXPORTAR.Addm = addm;
    DATA_EXPORTAR.Fuente = fuente;
    DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/IP/Estado/Nivel4",
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
        title: 'IP por servidor'
    });
    columns.push({
        field: 'VLAN',
        title: 'Total VLANs',
        class: 'fondoClaro'
    });
    columns.push({
        field: 'IPTotal',
        title: 'Total IPs',
        class: 'fondoClaro'
    });
    columns.push({
        field: 'SeguridadVerde',
        title: 'Seguridad <br/>conforme',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'SeguridadRojo',
        title: 'Seguridad <br/>pendiente',
        class: 'fondoRojo'
    });
    columns.push({
        field: 'TelecomVerde',
        title: 'Telecom <br/>conforme',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'TelecomRojo',
        title: 'Telecom <br/>pendiente',
        class: 'fondoRojo'
    });
    columns.push({
        field: 'AddmVerde',
        title: 'ETI <br/>conforme',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'AddmAmarillo',
        title: 'ETI <br/>en espera',
        class: 'fondoAmarillo'
    });
    columns.push({
        field: 'AddmRojo',
        title: 'ETI <br/>pendiente',
        class: 'fondoRojo'
    });
    columns.push({
        field: 'SegmentacionVerde',
        title: 'SEG <br/>conforme',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'SegmentacionRojo',
        title: 'SEG <br/>pendiente',
        class: 'fondoRojo'
    });

    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showHeader: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel5($detail, row.Zona, row.CMDB, row.Fuente, row.IPPorServer);
        }
    });
}

function expandTableNivel5($detail, zona, addm, fuente, ips) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;
    DATA_EXPORTAR.Zona = zona;
    DATA_EXPORTAR.Addm = addm;
    DATA_EXPORTAR.Fuente = fuente;
    DATA_EXPORTAR.Ips = ips;
    DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/IP/Estado/Nivel5",
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
        field: 'VLAN',
        title: 'VLAN'
    });
    columns.push({
        field: 'NamePrefix',
        title: 'NAME PREFIX'
    });
    columns.push({
        field: 'Zona',
        title: 'ZONE'
    });
    columns.push({
        field: 'AmbienteRed',
        title: 'ENVIRONMENT NETWORK'
    });
    columns.push({
        field: 'EquipoReporte',
        title: 'HOSTNAME'
    });
    columns.push({
        field: 'IPPorSever',
        title: 'IPS POR SERVER'
    });
    columns.push({
        field: 'Gateways',
        title: 'GATEWAYS'
    });
    columns.push({
        field: 'SegredStatus',
        title: 'SEGRED STATUS'
    });
    columns.push({
        field: 'SecurityStatus',
        title: 'COMPONENTE'
    });


    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: false
    });
}

function ExportarInfo() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.sortName = 'Prefix';
    DATA_EXPORTAR.sortOrder = 'ASC';

    let url = `${URL_API_VISTA}/IP/Estado/Exportar`;
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

function totalFormatter(data) {
    var field = this.field;
    var suma = data.map(function (row) {
        return +row[field];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    return '<strong style="font-size:10px !important;">' + suma + '</strong>';
}

function totalPromedioFormatter(data) {
    var field = this.field;
    var suma = data.map(function (row) {
        return +row[field];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    var promedio = suma / data.length
    return '<strong style="font-size:10px !important;">' + promedio.toFixed(2) + '</strong>';
}

function dataFormatter(data) {
    return '<strong style="font-size:10px !important;">Total</strong>';
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
                isDate: "Debe ingresar una fecha válida",
                FechaPrevia: "Debe ingresar una fecha válida",
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
