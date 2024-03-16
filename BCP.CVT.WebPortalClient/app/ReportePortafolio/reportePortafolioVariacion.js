var URL_API_VISTA = URL_API + "/reportesportfolio";
var parameters, $table = $("#tblRegistro");
var objFilter = {};
var FormatoFecha = "";
var periodoTiempo = "";

const arrMultiSelect = [
    { SelectId: "#cbFiltroEstado", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlTipoActivo", DataField: "ClasificacionTecnica" },
    { SelectId: "#cbFiltroGestionadoPor", DataField: "GestionadoPor" }
];

$(function () {
    $(".tipoBusquedaFecha").hide();
    FormatoCheckBox($("#divCbTipoBusqueda"), "CbTipoBusqueda");
    initEvents();
    configCheckBox();
    $(".toggle.btn.btn-default.off").click();
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    CargarCombos();
    initFecha();
    validarReporteFiltros();
});

function initFecha() {
    $("#divFechaFiltroDesde, #divFechaFiltroHasta").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#FechaFiltroDesde, #FechaFiltroHasta").val("");
}

function initEvents() {

    $("#btnBuscar").click(GenerarReporte);
    $("#btnExportarReporte1").click(function () { ExportChartData(REPORTE_SOLICITUDES_CREADAS); });
    $("#btnExportarReporte2").click(function () { ExportChartData(REPORTE_SOLICITUDES_ELIMINADAS); });
    $("#btnExportarReporte3").click(function () { ExportChartData(REPORTE_SOLICITUDES_CREADAS_ELIMINADAS); });
    $("#btnExportarReporte4").click(function () { ExportChartData(REPORTE_SOLICITUDES_ESTADO); });


    $("#CbTipoBusqueda").change(
        function () {
            if (this.checked) {
                $(".tipoBusquedaPeriodo").hide().addClass("ignore");
                $(".tipoBusquedaFecha").show().removeClass("ignore");
                $("#titleTpBusqueda").text("Hasta:");
            }
            else {
                $(".tipoBusquedaFecha").hide().addClass("ignore");
                $(".tipoBusquedaPeriodo").show().removeClass("ignore");
                $("#titleTpBusqueda").text("Fecha Base:");
                $("#FechaFiltroHasta").val("");
                $("#FechaFiltroDesde").val("");
            }
        }
    );
}

function configCheckBox() {
    $(".btn.btn-primary.toggle-on").text("Por Fecha");
    $(".btn.btn-default.active.toggle-off").text("Por Periodos");
    $("div .toggle.btn").css("width", "100%");
}

function CargarCombos() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/reporte/estado/lists",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItemsMultiple(dataObject.GestionadoPor.filter(x => x !== "" && x !== null), $("#cbFiltroGestionadoPor"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TipoActivo.filter(x => x !== "" && x !== null), $("#ddlTipoActivo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.EstadoAplicacion, $("#cbFiltroEstado"), TEXTO_TODOS, TEXTO_TODOS, true);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function GenerarReporte() {
    if ($("#formFiltros").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

        let flag = $("#CbTipoBusqueda").prop("checked");

        let fechaDesde = $("#FechaFiltroDesde").val() ? moment(dateFromString($("#FechaFiltroDesde").val())).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD");
        let fechaHasta = $("#FechaFiltroHasta").val() ? moment(dateFromString($("#FechaFiltroHasta").val())).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD");

        let Frecuencia = parseInt($("#cbFiltroFrecuencia").val());


        switch (Frecuencia) {
            case 7: case 15: FormatoFecha = "yyyy-MM-dd"; break;
            case 30: case 60: case 90: case 180: FormatoFecha = "MMMM yyyy"; break;
            case 365: FormatoFecha = "yyyy"; break;
            default: FormatoFecha = "";
        }

        let data = {
            ListTipoActivo: CaseIsNullSendExport($("#ddlTipoActivo").val()),
            ListGestionadoPor: CaseIsNullSendExport($("#cbFiltroGestionadoPor").val()),
            ListEstadoAplicacion: CaseIsNullSendExport($("#cbFiltroEstado").val()),
            Frecuencia,
            FechaDesde: flag ? fechaDesde : null,
            FechaHasta: fechaHasta,
            nroPeriodos: flag ? 0 : $("#txtPeriodo").val(),
            FormatoFecha
        };

        $.ajax({
            url: URL_API_VISTA + "/reporte/variacion",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            async: false,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject) {
                if (dataObject !== null) {
                    CargarReporte(dataObject);
                    objFilter = data;
                }
                else {
                    $("#report1_alerta, #report2_alerta, #report3_alerta, #report4_alerta").show();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function (data) {
                waitingDialog.hide();
            }
        });
    }
}

function CargarReporte(dataAPI) {
    $("#report1, #report2, #report3, #report4").empty();
    $("#ReportDistribuciones").empty();
    $("#report1, #report2, #report3, #report4").show();
    $("#report1_alerta, #report2_alerta, #report3_alerta, #report4_alerta").hide();
    $(".div-report").show();

    periodoTiempo = $("#cbFiltroFrecuencia").find(':selected').data('desc');
    let chartData = [];

    //Chart 1
    $.each(dataAPI.solicitudesCreadas.Solicitudes, function (i, item) {
        //chartData.push({ date: item.FechaStr, value: item.Cantidad });
        chartData.push({ date: item.FechaDescripcion, value: item.Cantidad });
    });

    loadGraficoUno(chartData);

    //Chart 2
    chartData = [];
    $.each(dataAPI.solicitudesEliminadas.Solicitudes, function (i, item) {
        //chartData.push({ date: item.FechaStr, value: item.Cantidad });
        chartData.push({ date: item.FechaDescripcion, value: item.Cantidad });
    });

    loadGraficoDos(chartData);

    //Chart 3
    chartData = [];
    $.each(dataAPI.solicitudesCreadasEliminadas.Solicitudes, function (i, item) {
        chartData.push(
            {
                date: item.FechaDescripcion,
                value1: item.Valor,
                value2: item.Valor2,
            });
    });

    loadGraficoTres(chartData);

    //Chart 4
    chartData = [];
    $.each(dataAPI.Estados.Solicitudes, function (i, item) {
        chartData.push(
            {
                //category: item.FechaStr,
                category: item.FechaDescripcion,
                first: item.Valor == 0 ? null : item.Valor,
                second: item.Valor2 == 0 ? null : item.Valor2,
                third: item.Valor3 == 0 ? null : item.Valor3,
                fourth: item.Valor4 == 0 ? null : item.Valor4,
                fifth: item.Valor5 == 0 ? null : item.Valor5
            });
    });

    loadGraficoCuatro(chartData);

    //Chart Distribuciones X Gerencia
    $.each(dataAPI.lstDistribuciones, function (i, obj) {
        CreateContentChart(obj.GerenciaId, obj.Gerencia);

        chartData = [];
        $.each(obj.Chart, function (i, item) {
            var obj = {
                //year: item.FechaStr
                year: item.FechaDescripcion,
                "Baja": item.Valor == 0 ? null : item.Valor,
                "Media": item.Valor2 == 0 ? null : item.Valor2,
                "Alta": item.Valor3 == 0 ? null : item.Valor3,
                "Muy Alta": item.Valor4 == 0 ? null : item.Valor4,
              
            };
            if (item.Valor5 != 0 && item.Valor5 != null) {
                obj["Sin criticidad"] = item.Valor5
            }

            chartData.push(obj);
        });
        loadGraficoDistribucion(obj.GerenciaId, chartData, obj.Gerencia);
    });

    //waitingDialog.hide();
}

function loadGraficoUno(data) {
    if (data.length > 0) {
        am4core.ready(function () {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("report1", am4charts.XYChart);

            ExportChart(chart, 'Evolución de creación de aplicaciones');

            // Add data
            chart.data = data;

            // Set input format for the dates
            chart.dateFormatter.inputDateFormat = FormatoFecha;
            chart.language.locale = am4lang_es_ES;

            //var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            var categoryXAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryXAxis.dataFields.category = "date";
            categoryXAxis.title.text = "Periodo de tiempo";
            categoryXAxis.renderer.grid.template.location = 0;

            //Custom width
            categoryXAxis.events.on("sizechanged", function (ev) {
                let axis = ev.target;
                let cellWidth = axis.pixelWidth / (axis.endIndex - axis.startIndex);
                axis.renderer.labels.template.maxWidth = cellWidth;
            });

            if ($("cbFiltroFrecuencia").val() == 15) {
                categoryXAxis.renderer.minGridDistance = 55;
            } else {
                categoryXAxis.renderer.minGridDistance = 25;
            }


            let label = categoryXAxis.renderer.labels.template;
            label.wrap = true;
            label.fontSize = 10;

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.title.text = "Aplicaciones";
            valueAxis.maxPrecision = 0;
            let label2 = valueAxis.renderer.labels.template;
            label2.wrap = true;
            label2.fontSize = 10;


            // Create series
            var series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.valueY = "value";
            series.dataFields.categoryX = "date";
            series.tooltipText = "{value}"
            series.strokeWidth = 2;
            series.minBulletDistance = 15;


            // Add label
            var labelBullet1 = series.bullets.push(new am4charts.LabelBullet());
            //labelBullet1.disabled = true;
            //labelBullet1.propertyFields.disabled = "bulletDisabled";
            labelBullet1.label.text = "{value}";
            labelBullet1.horizontalCenter = "left";
            labelBullet1.label.horizontalCenter = "left";
            labelBullet1.label.paddingLeft = 10;
            labelBullet1.label.fontSize = 10;
            LabelCustomFormatter(labelBullet1);

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
            chart.cursor = new am4charts.XYCursor();
            chart.cursor.behavior = "panXY";
            chart.cursor.xAxis = categoryXAxis;
            chart.cursor.snapToSeries = series;



            //// Create vertical scrollbar and place it before the value axis
            //chart.scrollbarY = new am4core.Scrollbar();
            //chart.scrollbarY.parent = chart.leftAxesContainer;
            //chart.scrollbarY.toBack();

            // Create a horizontal scrollbar with previe and place it underneath the date axis
            /*
            chart.scrollbarX = new am4charts.XYChartScrollbar();
            chart.scrollbarX.series.push(series);
            chart.scrollbarX.parent = chart.bottomAxesContainer;
            */
            //dateAxis.start = 0.79;
            //dateAxis.keepSelection = true;


        }); // end am4core.ready() 

        $("#btnExportarReporte1").show();
    }
    else {
        $("#report1_alerta").show();
        $("#report1").hide();
        $("#btnExportarReporte1").hide();
    }
}

function loadGraficoDos(data) {
    if (data.length > 0) {
        am4core.ready(function () {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("report2", am4charts.XYChart);
            ExportChart(chart, 'Evolución de eliminación de aplicaciones');
            // Add data
            chart.data = data;

            // Set input format for the dates
            chart.dateFormatter.inputDateFormat = FormatoFecha;
            chart.language.locale = am4lang_es_ES;

            //var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            var categoryXAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryXAxis.dataFields.category = "date";
            categoryXAxis.title.text = "Periodo de tiempo";
            categoryXAxis.renderer.grid.template.location = 0;

            //Custom width
            categoryXAxis.events.on("sizechanged", function (ev) {
                let axis = ev.target;
                let cellWidth = axis.pixelWidth / (axis.endIndex - axis.startIndex);
                axis.renderer.labels.template.maxWidth = cellWidth;
            });

            if ($("cbFiltroFrecuencia").val() == 15) {
                categoryXAxis.renderer.minGridDistance = 55;
            } else {
                categoryXAxis.renderer.minGridDistance = 25;
            }
            let label = categoryXAxis.renderer.labels.template;
            label.wrap = true;
            label.fontSize = 10;

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.title.text = "Aplicaciones";
            valueAxis.maxPrecision = 0;

            let label2 = valueAxis.renderer.labels.template;
            label2.wrap = true;
            label2.fontSize = 10;


            // Create series
            var series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.valueY = "value";
            series.dataFields.categoryX = "date";
            series.tooltipText = "{value}"
            series.strokeWidth = 2;
            series.minBulletDistance = 15;

            // Add label
            var labelBullet1 = series.bullets.push(new am4charts.LabelBullet());
            //labelBullet1.disabled = true;
            //labelBullet1.propertyFields.disabled = "bulletDisabled";
            labelBullet1.label.text = "{value}";
            labelBullet1.horizontalCenter = "left";
            labelBullet1.label.horizontalCenter = "left";
            labelBullet1.label.paddingLeft = 10;
            labelBullet1.label.fontSize = 10;

            LabelCustomFormatter(labelBullet1);

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
            chart.cursor = new am4charts.XYCursor();
            chart.cursor.behavior = "panXY";
            chart.cursor.xAxis = categoryXAxis;
            chart.cursor.snapToSeries = series;

            //// Create vertical scrollbar and place it before the value axis
            //chart.scrollbarY = new am4core.Scrollbar();
            //chart.scrollbarY.parent = chart.leftAxesContainer;
            //chart.scrollbarY.toBack();

            // Create a horizontal scrollbar with previe and place it underneath the date axis
            /*
            chart.scrollbarX = new am4charts.XYChartScrollbar();
            chart.scrollbarX.series.push(series);
            chart.scrollbarX.parent = chart.bottomAxesContainer;

            dateAxis.start = 0.79;
            dateAxis.keepSelection = true;
            */

        }); // end am4core.ready()

        $("#btnExportarReporte2").show();
    }
    else {
        $("#report2_alerta").show();
        $("#report2").hide();
        $("#btnExportarReporte2").hide();
    }
}

function loadGraficoTres(data) {
    if (data.length > 0) {
        am4core.ready(function () {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("report3", am4charts.XYChart);

            var titulo = `Cantidad de aplicaciones nuevas y eliminadas por ${periodoTiempo}`;
            $(".div-report-3 h4").html(titulo);


            ExportChart(chart, titulo);
            // Add data
            chart.data = data;

            // Set input format for the dates
            chart.dateFormatter.inputDateFormat = "MM-yyyy";//FormatoFecha;
            chart.language.locale = am4lang_es_ES;

            // Create axes
            //var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            //dateAxis.renderer.minGridDistance = 50;
            var categoryXAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryXAxis.dataFields.category = "date";
            categoryXAxis.title.text = "Periodo de tiempo";
            categoryXAxis.renderer.minGridDistance = 50;
            categoryXAxis.renderer.grid.template.location = 0;

            //Custom width
            categoryXAxis.events.on("sizechanged", function (ev) {
                let axis = ev.target;
                let cellWidth = axis.pixelWidth / (axis.endIndex - axis.startIndex);
                axis.renderer.labels.template.maxWidth = cellWidth;
            });

            let label = categoryXAxis.renderer.labels.template;
            label.wrap = true;
            label.fontSize = 10;

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.title.text = "Aplicaciones";
            valueAxis.maxPrecision = 0;

            let label2 = valueAxis.renderer.labels.template;
            label2.wrap = true;
            label2.fontSize = 10;

            // Create series
            var series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.valueY = "value1";
            series.dataFields.categoryX = "date";
            series.strokeWidth = 2;
            series.minBulletDistance = 10;
            series.tooltipText = "[bold]Nuevas:[/] {value1}\n[bold]Eliminadas:[/] {value2}";
            series.tooltip.pointerOrientation = "vertical";
            series.name = "Nuevas";

            // Add label
            var labelBullet1 = series.bullets.push(new am4charts.LabelBullet());
            //labelBullet1.disabled = true;
            //labelBullet1.propertyFields.disabled = "bulletDisabled";
            labelBullet1.label.text = "{value1}";
            labelBullet1.horizontalCenter = "left";
            labelBullet1.label.horizontalCenter = "left";
            labelBullet1.label.paddingLeft = 10;
            labelBullet1.label.fontSize = 10;
            LabelCustomFormatter(labelBullet1);

            // Create series
            var series2 = chart.series.push(new am4charts.LineSeries());
            series2.dataFields.valueY = "value2";
            series2.dataFields.categoryX = "date";
            series2.strokeWidth = 2;
            series2.strokeDasharray = "3,4";
            series2.stroke = series.stroke;
            series2.name = "Eliminadas";

            var labelBullet2 = series2.bullets.push(new am4charts.LabelBullet());
            //labelBullet1.disabled = true;
            //labelBullet1.propertyFields.disabled = "bulletDisabled";
            labelBullet2.label.text = "{value2}";
            labelBullet2.horizontalCenter = "left";
            labelBullet2.label.horizontalCenter = "left";
            labelBullet2.label.paddingLeft = 10;
            labelBullet2.label.fontSize = 10;
            LabelCustomFormatter(labelBullet2);
            // Add cursor
            chart.cursor = new am4charts.XYCursor();
            chart.cursor.xAxis = categoryXAxis;

            chart.legend = new am4charts.Legend();
            chart.legend.position = "bottom";
            chart.legend.scrollable = true;


        }); // end am4core.ready()

        $("#btnExportarReporte3").show();
    }
    else {
        $("#report3_alerta").show();
        $("#report3").hide();
        $("#btnExportarReporte3").hide();
    }

}

function loadGraficoCuatro(data) {
    if (data.length > 0) {
        am4core.ready(function () {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            var chart = am4core.create('report4', am4charts.XYChart);
            chart.language.locale = am4lang_es_ES;

            var titulo = `Estados por ${periodoTiempo}`;
            $(".div-report-4 h4").html(titulo);
            ExportChart(chart, titulo);

            chart.colors.step = 2;

            chart.legend = new am4charts.Legend()
            chart.legend.position = 'bottom'
            chart.legend.paddingBottom = 10
            chart.legend.labels.template.maxWidth = 95

            chart.legend.labels.template.fontSize = 10;
            var markerTemplate = chart.legend.markers.template;
            markerTemplate.width = 18;
            markerTemplate.height = 18;

            var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
            xAxis.dataFields.category = 'category'
            xAxis.renderer.cellStartLocation = 0.1
            xAxis.renderer.cellEndLocation = 0.9
            xAxis.renderer.grid.template.location = 0;
            xAxis.renderer.minGridDistance = 20;
            xAxis.title.text = "Periodo de tiempo";

            xAxis.events.on("sizechanged", function (ev) {
                let axis = ev.target;
                let cellWidth = axis.pixelWidth / (axis.endIndex - axis.startIndex);
                axis.renderer.labels.template.maxWidth = cellWidth;
            });

            let label = xAxis.renderer.labels.template;
            label.wrap = true;
            label.fontSize = 10;

            var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
            yAxis.title.text = "Aplicaciones por Estado";
            yAxis.min = 0;
            yAxis.maxPrecision = 0;

            let label2 = yAxis.renderer.labels.template;
            label2.wrap = true;
            label2.fontSize = 10;


            function createSeries(value, name) {
                var series = chart.series.push(new am4charts.ColumnSeries())
                series.dataFields.valueY = value
                series.dataFields.categoryX = 'category'
                series.name = name
                series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
                series.stacked = true;
                series.columns.template.width = am4core.percent(95);

                var bullet = series.bullets.push(new am4charts.LabelBullet())
                //bullet.interactionsEnabled = false
                //bullet.dy = 30;
                bullet.label.text = '{valueY}'
                bullet.label.fill = am4core.color('#ffffff')
                bullet.label.fontSize = 10;
                bullet.locationY = 0.5;
                bullet.label.fontSize = 10;
                LabelCustomFormatter(bullet);
                return series;
            }

            chart.data = data;
            // Set input format for the dates
            chart.dateFormatter.inputDateFormat = FormatoFecha;


            createSeries('first', 'En desarrollo');
            createSeries('second', 'Vigente');
            createSeries('third', 'No vigente');
            createSeries('fourth', 'Eliminada'); 
        }); // end am4core.ready()

        $("#btnExportarReporte4").show();
    }
    else {
        $("#report4_alerta").show();
        $("#report4").hide();
        $("#btnExportarReporte4").hide();
    }
}

function CreateContentChart(id, gerencia) {

    let bodyChild = `<div class="row gutter-xs">
                    <div class="col-xs-12 div-report" style="display: block">
                        <div class="card">
                            <div class="card-header-title">
                                <h4 style="color:#ee8809; font-weight:bold;">${gerencia}</h4>
                            </div>
                            <div style=" display:flex; float: right; font-size: 14px" class="div-exportReport">
                                <a id="btnExportarReporte_${id}" class="btn btn-sm btn-primary" href="javascript: void(0)">
                                        <span class="count-text">Exportar</span>
                                </a>
                            </div>
                            <div class="card-body">
                                <div id="report_${id}" style="width: 100%;height: 400px;"></div>
                                <div id="report_${id}_alerta" class="alerta">Los criterios de búsqueda no han arrojado resultados.</div>
                            </div>
                        </div>
                    </div>
                </div>
    <hr />`;

    $("#ReportDistribuciones").append(bodyChild);

    $(`#btnExportarReporte_${id}`).click(function () { ExportChartData(REPORTE_DISTRIBUCION_X_GERENCIA, id, gerencia); });
}

function loadGraficoDistribucion(id, data, gerencia = "") {
    if (data.length > 0) {
        am4core.ready(function () {
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create(`report_${id}`, am4charts.XYChart);

            ExportChart(chart, `Distribución por Gerencia: ${gerencia}`);

            // Add data
            chart.data = data;
            // Set input format for the dates
            chart.dateFormatter.inputDateFormat = FormatoFecha;
            chart.language.locale = am4lang_es_ES;

            chart.legend = new am4charts.Legend();
            chart.legend.labels.template.fontSize = 10;
            var markerTemplate = chart.legend.markers.template;
            markerTemplate.width = 18;
            markerTemplate.height = 18;
            //chart.legend.position = "right";

            // Create axes
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "year";
            //categoryAxis.renderer.grid.template.opacity = 0;
            categoryAxis.title.text = "Periodo de tiempo";
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.renderer.cellStartLocation = 0.1
            categoryAxis.renderer.cellEndLocation = 0.9
            categoryAxis.renderer.grid.template.location = 0;

            categoryAxis.events.on("sizechanged", function (ev) {
                let axis = ev.target;
                let cellWidth = axis.pixelWidth / (axis.endIndex - axis.startIndex);
                axis.renderer.labels.template.maxWidth = cellWidth;
            });

            let label = categoryAxis.renderer.labels.template;
            label.wrap = true;
            label.fontSize = 10;


            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.min = 0;
            valueAxis.title.text = "Aplicaciones por Criticidad";
            let label2 = valueAxis.renderer.labels.template;
            label2.wrap = true;
            label2.fontSize = 10;

            //valueAxis.renderer.grid.template.opacity = 0;
            //valueAxis.renderer.ticks.template.strokeOpacity = 0.5;
            //valueAxis.renderer.ticks.template.stroke = am4core.color("#495C43");
            //valueAxis.renderer.ticks.template.length = 10;
            //valueAxis.renderer.line.strokeOpacity = 0.5;
            ////valueAxis.renderer.baseGrid.disabled = true;
            valueAxis.renderer.minGridDistance = 40;
            valueAxis.maxPrecision = 0;
            // Create series
            function createSeries(field, name) {
                var series = chart.series.push(new am4charts.ColumnSeries());
                series.dataFields.valueY = field;
                series.dataFields.categoryX = "year";
                series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
                series.stacked = true;
                series.name = name;

                var labelBullet = series.bullets.push(new am4charts.LabelBullet());
                labelBullet.locationY = 0.5;
                labelBullet.label.text = "{valueY}";
                labelBullet.label.fill = am4core.color("#fff");
                labelBullet.label.fontSize = 10;
                LabelCustomFormatter(labelBullet);
            }

            //createSeries("baja", "Baja");
            //createSeries("media", "Media");
            //createSeries("alta", "Alta");
            //createSeries("muyAlta", "Muy Alta");
            //createSeries("sinCriticidad", "Sin criticidad");

            var headers = ObtenerColumnasData(data);
            for (var i = 0; i < headers.length; i++) {
                createSeries(headers[i], headers[i]);
            }

        });

        $(`#report_${id}_alerta`).hide();
        $(`#report_${id}`).show();
    }
    else {
        $(`#report_${id}`).hide();
        $(`#report_${id}_alerta`).show();
    }

}

function ExportChart(chart, chartName) {
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.menu.align = "rigth";
    chart.exporting.menu.verticalAlign = "top";
    chart.exporting.menu.items = [{
        label: "...",
        menu: arrOptionsExport
    }];
    chart.exporting.getFormatOptions("pdf").addURL = false;
    chart.exporting.filePrefix = chartName;
}

function ExportChartData(typeReport, hidden = 0, nomGerencia = "") {

    let url = `${URL_API_VISTA}/reporte/variacion/exportarData?tipoActivo=${objFilter.ListTipoActivo}&gestionadoPor=${objFilter.ListGestionadoPor}`
        + `&estado=${objFilter.ListEstadoAplicacion}&frecuencia=${objFilter.Frecuencia}&fechaDesde=${objFilter.FechaDesde}&fechaHasta=${objFilter.FechaHasta}`
        + `&periodo=${objFilter.nroPeriodos}&typeReport=${typeReport}&hidden=${hidden}&nomGerencia=${nomGerencia}&periodoTiempo=${periodoTiempo}`;

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/octetstream",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            let bytes = Base64ToBytes(data.data);
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



function validarReporteFiltros() {

    $.validator.methods.ValidMaxDate = function (value, element) {
        let fechaMin = $("#FechaFiltroDesde").val();
        if (fechaMin) {
            fechaMin = dateFromString(fechaMin);
            let fechaMax = dateFromString(value);
            return fechaMin <= fechaMax;
        }
        return true;
    };

    $.validator.methods.ValidMinDate = function (value, element) {
        let fechaMax = $("#FechaFiltroHasta").val();
        if (fechaMax) {
            fechaMax = dateFromString(fechaMax);
            let fechaMin = dateFromString(value);
            return fechaMin <= fechaMax;
        }
        return true;
    };

    $.validator.methods.ValidDate = function (value, element) {
        try {
            let fecha = dateFromString(value);
            let fechaMinima = new Date();
            fechaMinima.setFullYear(fechaMinima.getFullYear() - 1000);
            return fechaMinima <= fecha;
        }
        catch (ex) {
            return false;
        }
    };

    $.validator.methods.validPeriodo = function (value, element) {
        let fechaBase = $("#FechaFiltroHasta").val() ? moment(dateFromString($("#FechaFiltroHasta").val())).format("YYYY-MM-DD") : "";
        let frecuencia = parseInt($("#cbFiltroFrecuencia").val());

        if (fechaBase && frecuencia != -1) {
            return value ? ValidarPeriodo(value, fechaBase, frecuencia) : false;
        }
        return true;
    };

    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtPeriodo: {
                requiredSinEspacios: true,
                number: true,
                min: 0,
                max: 12,
                validPeriodo: true
            },
            cbFiltroFrecuencia: { requiredSelect: true },
            FechaFiltroDesde: {
                required: true,
                ValidDate: true,
                ValidMinDate: true
            },
            FechaFiltroHasta: {
                required: true,
                ValidDate: true,
                ValidMaxDate: true
            }
        },
        messages: {
            txtPeriodo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el Periodo"),
                number: "Debes ingresar número",
                min: "Debe ingresar un número mayor o igual a 0",
                max: "Debe ingresar un número menor o igual a 12",
                validPeriodo: "Nro. periodos no es correcto"
            },
            cbFiltroFrecuencia: { requiredSelect: "Debes seleccionar una frecuencia" },
            FechaFiltroDesde: {
                required: "Debe seleccionar una fecha",
                ValidDate: "Debe ingresar una fecha válida",
                ValidMinDate: "Debe ingresar una fecha menor a la fecha hasta"
            },
            FechaFiltroHasta: {
                required: "Debe seleccionar una fecha",
                ValidDate: "Debe ingresar una fecha válida",
                ValidMaxDate: "Debe ingresar una fecha mayor a la fecha desde"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "FechaFiltroDesde" || element.attr('name') === "FechaFiltroHasta") {
                element.parent().parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function LabelCustomFormatter(bullet) {
    bullet.label.adapter.add("textOutput", function (text, target) {
        if (target.dataItem && target.dataItem.valueY == 0) {
            return "";
        }
        return text;
    });
}

function ValidarPeriodo(nroPeriodos, fechaBase, frecuencia) {
    let estado = false;

    $.ajax({
        url: URL_API_VISTA + `/reporte/ValidarNroperiodos?nroPeriodos=${nroPeriodos}&fechaBase=${fechaBase}&frecuencia=${frecuencia}`,
        type: "GET",
        dataType: "json",
        async: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) { estado = result; },
        error: function (xhr, ajaxOptions, thrownError) { ControlarErrorAjax(xhr, ajaxOptions, thrownError); }
    });

    return estado;
}

function ObtenerColumnasData(list) {
    var columns = [];
    for (var i = 0; i < list.length; i++) {
        var row = list[i];

        for (var k in row) {
            if ($.inArray(k, columns) == -1 && k != "FechaDesde" && k != "FechaHasta" && k != "FechaDescripcion" && k != "year") {
                columns.push(k);
            }
        }
    }

    return columns;
}
