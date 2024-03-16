var URL_API_VISTA = URL_API + "/Storage";
var $table = $("#tblRegistro");
var $tableDetalle = $("#tblRegistrosDetalle");
var $tableDetalleApps = $("#tblRegistrosDetalleApps");
var $tableDetallePeriodo = $("#tblRegistrosDetallePeriodo");
const TITULO_MENSAJE = "Site de tecnología y obsolescencia";
$(function () {
    $table.bootstrapTable();   
    listarRegistros();
});

function Buscar() {
    listarRegistros();
}

function listarRegistros() {
    if ($("#formFiltros").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA + "/Backup/Open/Resumen",
            method: 'POST',
            pagination: true,
            sidePagination: 'server',
            queryParamsType: 'else',
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            sortName: 'total',
            sortOrder: 'desc',
            queryParams: function (p) {
                DATA_EXPORTAR = {};                
                DATA_EXPORTAR.server = $("#txtServidor").val();
                DATA_EXPORTAR.monthBackup = $("#ddlMes").val();
                DATA_EXPORTAR.yearBackup = $("#txtAnio").val();                

                DATA_EXPORTAR.PageNumber = p.pageNumber;
                DATA_EXPORTAR.PageSize = p.pageSize;
                DATA_EXPORTAR.OrderBy = p.sortName;
                DATA_EXPORTAR.OrderByDirection = p.sortOrder;

                return JSON.stringify(DATA_EXPORTAR);
            },
            onLoadSuccess: function () {

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

function listarRegistrosDetalle(id, group, day, month, year, $table) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Backup/Open/Detalle",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'crtdate',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.codigoAPT = '';
            DATA_EXPORTAR.backupserver = '';
            DATA_EXPORTAR.target = '';
            DATA_EXPORTAR.levelbackup = '';
            DATA_EXPORTAR.outcome = '';
            DATA_EXPORTAR.Fecha = castDate(FECHA);

            DATA_EXPORTAR.server = id;
            DATA_EXPORTAR.groupname = group;
            DATA_EXPORTAR.dayBackup = day;
            DATA_EXPORTAR.monthBackup = month;
            DATA_EXPORTAR.yearBackup = year;

            DATA_EXPORTAR.PageNumber = p.pageNumber;
            DATA_EXPORTAR.PageSize = p.pageSize;
            DATA_EXPORTAR.OrderBy = p.sortName;
            DATA_EXPORTAR.OrderByDirection = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        onLoadSuccess: function (status, res) {
            OpenModal();
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
        },
    });
}

function listarRegistrosDetalleApps(server, $table) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Backup/Open/Aplicaciones",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'crtdate',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Fecha = castDate(FECHA);
            DATA_EXPORTAR.server = server;

            DATA_EXPORTAR.PageNumber = p.pageNumber;
            DATA_EXPORTAR.PageSize = p.pageSize;
            DATA_EXPORTAR.OrderBy = p.sortName;
            DATA_EXPORTAR.OrderByDirection = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        onLoadSuccess: function (status, res) {
            OpenModalApps();
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
        },
    });
}

function linkFormatter(value, row) {
    return `<a href="javascript:ViewDetails('${value}','${row.groupname}','${row.dayBackup}','${row.monthBackup}','${row.yearBackup}')" title="Mostrar detalle">${value}</a>`;
}

function dayFormatter(value, row, index) {
    var html = "";
    var dia = $(this).prop("day");
    var mes = $("#ddlMes").val();
    var anio = $("#txtAnio").val();   
    
    var evento = `javascript:ViewDetails('${row.serverName}','',${dia},${mes},${anio});`;

    if (value === 1) { //VERDE
        html = `<button type="button" class="btn btn-danger btn-circle" title="Con errores" onclick="${evento}"></button>`;
    } else if (value === -1) { //ROJO
        html = `-`;
    }
    else {
        html = `<button type="button" class="btn btn-success btn-circle" title="Sin errores" onclick="${evento}"></button>`;
    }
    return html;
}

function linkAppsFormatter(value, row) {
    return `<a href="javascript:ViewDetailsApps('${row.serverName}')" title="Mostrar aplicaciones">${value}</a>`;
}

function ViewDetails(server, group, day, month, year) {
    listarRegistrosDetalle(server, group, day, month, year, $tableDetalle);

}

function ViewDetailsApps(server) {
    listarRegistrosDetalleApps(server, $tableDetalleApps);

}
//Detalle
function LimpiarMdAddOrEditRegistro() {
    $tableDetalle.bootstrapTable();
    $tableDetalle.bootstrapTable({ data: [] });
}
function OpenModal() {
    MdAddOrEditRegistro(true);
}
function MdAddOrEditRegistro(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    if (EstadoMd)
        $("#MdAddOrEditModal").modal(opcionesModal);
    else
        $("#MdAddOrEditModal").modal("hide");
}
//Apps
function LimpiarMdAddOrEditRegistroApps() {
    $tableDetalleApps.bootstrapTable();
    $tableDetalleApps.bootstrapTable({ data: [] });
}
function OpenModalApps() {
    MdAddOrEditRegistroApps(true);
}

function OpenModalPeriodo() {
    MdAddOrEditRegistroPeriodo(true);
}
function LimpiarMdAddOrEditRegistroPeriodo() {
    $tableDetallePeriodo.bootstrapTable();
    $tableDetallePeriodo.bootstrapTable({ data: [] });
}
function MdAddOrEditRegistroPeriodo(EstadoMd) {
    LimpiarMdAddOrEditRegistroPeriodo();
    if (EstadoMd)
        $("#MdAddOrEditModalPeriodo").modal(opcionesModal);
    else
        $("#MdAddOrEditModalPeriodo").modal("hide");
}


function MdAddOrEditRegistroApps(EstadoMd) {
    LimpiarMdAddOrEditRegistroApps();
    if (EstadoMd)
        $("#MdAddOrEditModalApps").modal(opcionesModal);
    else
        $("#MdAddOrEditModalApps").modal("hide");
}
function semaforoFormatter(value, row, index) {
    var html = "";
    if (row.kpi === 1) { //VERDE
        html = `<button type="button" class="btn btn-success btn-circle" title="'${value}'"></button>`;
    } else if (row.kpi === -1) { //ROJO
        html = `<button type="button" class="btn btn-danger btn-circle" title="'${value}"></button>`;
    }
    else {
        html = `<button type="button" class="btn btn-warning btn-circle" title="'${value}'"></button>`;
    }
    return html;
}

function iconFormatter(value, row, index) {
    var html = "";    
    var html2 = ""
    html = `<a href="#" onclick="javascript:abrirGrafico('${value}');"><i class="glyphicon glyphicon-signal"></i></a>`;
    html2 = `<a href="#" onclick="javascript:abrirPeriodo('${row.serverName}');"><i class="glyphicon glyphicon-th-large"></i></a>`;

    return html + "&nbsp;" + html2
}

function abrirPeriodo(server) {
    listarRegistrosDetallePeriodo(server, $tableDetallePeriodo);
}

function listarRegistrosDetallePeriodo(server, $table) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Backup/Open/Periodo",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'crtdate',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Fecha = castDate(FECHA);
            DATA_EXPORTAR.server = server;

            DATA_EXPORTAR.PageNumber = p.pageNumber;
            DATA_EXPORTAR.PageSize = p.pageSize;
            DATA_EXPORTAR.OrderBy = p.sortName;
            DATA_EXPORTAR.OrderByDirection = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        onLoadSuccess: function (status, res) {
            OpenModalPeriodo();
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
        },
    });
}

function abrirGrafico(server) {

    var data = [];
    let params = {};

    params = {};
    params.PageSize = 1;
    params.PageNumber = 1;
    params.server = server;
    params.monthBackup = $("#ddlMes").val();
    params.yearBackup = $("#txtAnio").val();  

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Backup/Open/Grafico",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(params),
        dataType: "json",
        success: function (result) {
            if (result != null) {
                data = result;                
                cargarGrafico(data.Ejecuciones);
                cargarGraficoTransferencia(data.Transferencia);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            waitingDialog.hide();
            OpenCloseModal($("#modalGrafico"), true);
        },
        async: true
    }); 
}

var chart;
var chart2;
function cargarGrafico(data) {
    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        if (chart != null) {
            console.log("chart.dispose");
            chart.dispose();
        }
        
        // Create chart
        chart = am4core.create("chartdiv", am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

        chart.paddingRight = 20;        
        //var data2 = [];
        //var visits = 10;
        //for (var i = 1; i < 60; i++) {
        //    visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
        //    data2.push({ Fecha: new Date(2018, 0, i), Ejecuciones: visits });
        //}

        chart.data = data;

        var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;

        var series = chart.series.push(new am4charts.StepLineSeries());
        series.dataFields.dateX = "Fecha";
        series.dataFields.valueY = "Ejecuciones";
        series.noRisers = true;
        series.strokeWidth = 2;
        series.fillOpacity = 0.2;
        series.sequencedInterpolation = true;

        series.tooltipText = "{valueY.value}";
        chart.cursor = new am4charts.XYCursor();

        chart.scrollbarX = new am4charts.XYChartScrollbar();
        chart.scrollbarX.series.push(series);

    }); // end am4core.ready()
}

function cargarGraficoTransferencia(data2) {
    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        if (chart2 != null) {
            console.log("chart2.dispose");
            chart2.dispose();
        }
        // Create chart instance
        chart2 = am4core.create("chartdiv2", am4charts.XYChart);

        // Add data
        chart2.data = data2;

        // Set input format for the dates
        chart2.dateFormatter.inputDateFormat = "yyyy-MM-dd";

        // Create axes
        var dateAxis = chart2.xAxes.push(new am4charts.DateAxis());
        var valueAxis = chart2.yAxes.push(new am4charts.ValueAxis());

        // Create series
        var series = chart2.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = "TotalMB";
        series.dataFields.dateX = "Fecha";
        series.tooltipText = "{value}"
        series.strokeWidth = 2;
        series.minBulletDistance = 15;

        // Drop-shaped tooltips
        series.tooltip.background.cornerRadius = 20;
        series.tooltip.background.strokeOpacity = 0;
        series.tooltip.pointerOrientation = "vertical";
        series.tooltip.label.minWidth = 40;
        series.tooltip.label.minHeight = 40;
        series.tooltip.label.textAlign = "middle";
        series.tooltip.label.textValign = "middle";

        // Make bullets grow on hover
        var bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.strokeWidth = 2;
        bullet.circle.radius = 4;
        bullet.circle.fill = am4core.color("#fff");

        var bullethover = bullet.states.create("hover");
        bullethover.properties.scale = 1.3;

        // Make a panning cursor
        chart2.cursor = new am4charts.XYCursor();
        chart2.cursor.behavior = "panXY";
        chart2.cursor.xAxis = dateAxis;
        chart2.cursor.snapToSeries = series;

        // Create vertical scrollbar and place it before the value axis
        chart2.scrollbarY = new am4core.Scrollbar();
        chart2.scrollbarY.parent = chart2.leftAxesContainer;
        chart2.scrollbarY.toBack();

        // Create a horizontal scrollbar with previe and place it underneath the date axis
        chart2.scrollbarX = new am4charts.XYChartScrollbar();
        chart2.scrollbarX.series.push(series);
        chart2.scrollbarX.parent = chart2.bottomAxesContainer;

        dateAxis.start = 0.79;
        dateAxis.keepSelection = true;


    }); // end am4core.ready()
}

function setVisible(id) {
    if (id == 1) {
        $("#chartdiv").show();
        $("#chartdiv2").hide();
    }
    else {
        $("#chartdiv2").show();
        $("#chartdiv").hide();
    }
}

function Exportar() {
    let servidor = $("#txtServidor").val();
    if (servidor != '') {
        DATA_EXPORTAR = {};        
        DATA_EXPORTAR.server = $("#txtServidor").val();
        DATA_EXPORTAR.monthBackup = $("#ddlMes").val();
        DATA_EXPORTAR.yearBackup = $("#txtAnio").val();  

        let url = `${URL_API_VISTA}/Backup/Open/ExportarDetalle?server=${DATA_EXPORTAR.server}&monthBackup=${DATA_EXPORTAR.monthBackup}&yearBackup=${DATA_EXPORTAR.yearBackup}`;
        window.location.href = url;
    }
    else {
        toastr.info("Debes de ingresar un valor en el filtro del servidor", TITULO_MENSAJE);
        $("#txtServidor").focus();
    }
}