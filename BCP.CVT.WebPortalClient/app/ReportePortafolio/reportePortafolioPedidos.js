var URL_API_VISTA = URL_API + "/reportesportfolio";
var parameters, $table = $("#tblRegistro");
var ObjFilter = {};

const arrMultiSelect = [
    { SelectId: "#cbFiltroGestionadoPor", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlTipoActivo", DataField: "ClasificacionTecnica" },
    { SelectId: "#cbFiltroGerencia", DataField: "GestionadoPor" },
    { SelectId: "#cbFiltroArea", DataField: "Gerencia" },
    { SelectId: "#cbFiltroDivision", DataField: "EstadoAplicacion" },
    { SelectId: "#cbFiltroUnidad", DataField: "TipoActivo" },
];
 
$(function () {
    initEvents();
    validarReporteFiltros();
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    CargarCombos();
    initFecha();
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

    $("#cbFiltroGerencia").change(DdlGerencia_Change);
    $("#cbFiltroDivision").change(DdlDivision_Change);
    $("#cbFiltroArea").change(DdlArea_Change);

    $("#btnBuscar").click(function () { GenerarReporte() });
    $("#btnExportarReporte1").click(function () { ExportChartData(REPORTE_DISTRIBUCIONES_ATENCION_ACUMULADA); });
    $("#btnExportarReporte1_1").click(function () { ExportChartData(REPORTE_DISTRIBUCIONES_ATENCION_PERIODO); });
    $("#btnExportarReporte2").click(function () { ExportChartData(REPORTE_CONSULTAS_PORTAFOLIO); });
    $("#btnExportarReporte3").click(function () { ExportChartData(REPORTE_REGISTRO_APP); });
    $("#btnExportarReporte4").click(function () { ExportChartData(REPORTE_CAMPOS_MAS_REQUERIDOS); });
    $("#btnExportarReporte5").click(function () { ExportChartData(REPORTE_SLA); });
    $("#btnExportarReporte7").click(function () { ExportChartData(REPORTE_CONSULTAS); });
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
                    SetItemsMultiple(dataObject.Gerencia.filter(x => x !== "" && x !== null), $("#cbFiltroGerencia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Division.filter(x => x !== "" && x !== null), $("#cbFiltroDivision"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Unidad.filter(x => x !== "" && x !== null), $("#cbFiltroUnidad"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Area.filter(x => x !== "" && x !== null), $("#cbFiltroArea"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.GestionadoPor.filter(x => x !== "" && x !== null), $("#cbFiltroGestionadoPor"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TipoActivo.filter(x => x !== "" && x !== null), $("#ddlTipoActivo"), TEXTO_TODOS, TEXTO_TODOS, true);
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

        let fechaDesde = $("#FechaFiltroDesde").val() ? moment(dateFromString($("#FechaFiltroDesde").val())).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD");
        let fechaHasta = $("#FechaFiltroHasta").val() ? moment(dateFromString($("#FechaFiltroHasta").val())).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD");

        let data = {
            ListGerencia: CaseIsNullSendExport($("#cbFiltroGerencia").val()),
            ListDivision: CaseIsNullSendExport($("#cbFiltroDivision").val()),
            ListArea: CaseIsNullSendExport($("#cbFiltroArea").val()),
            ListUnidad: CaseIsNullSendExport($("#cbFiltroUnidad").val()),
            ListTipoActivo: CaseIsNullSendExport($("#ddlTipoActivo").val()),
            ListGestionadoPor: CaseIsNullSendExport($("#cbFiltroGestionadoPor").val()),
            FechaDesde: fechaDesde,
            FechaHasta: fechaHasta,
        };

        ObjFilter = data;

        $.ajax({
            url: URL_API_VISTA + "/reporte/pedidos",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            async: false,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject) {
                if (dataObject !== null) {
                    CargarReporte(dataObject);
                }
                else {
                    $("#report1_alerta, #report2_alerta, #report3_alerta, #report4_alerta, #report5_alerta, #report6_alerta, #report1_1_alerta, #report7_alerta").show();
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
    $("#report1, #report2, #report3, #report4, #report5, #report6, #report7, #report1_1").empty();
    $("#report1, #report2, #report3, #report4, #report5, #report6, #report7, #report1_1").show();
    $("#report1_alerta, #report2_alerta, #report3_alerta, #report4_alerta, #report5_alerta, #report6_alerta, #report7_alerta, #report1_1_alerta").hide();
    $(".div-report").show();

    let chartData = [];

    //Chart 1
    $.each(dataAPI.estadoAtencion.ChartReport, function (i, item) {
        chartData.push({ category: item.Grupo, value: item.Cantidad });
    });

    loadGraficoUno(chartData);

    //Chart 1_1
    /*
    chartData = [];
    $.each(dataAPI.estadoAtencionXTiempo.ChartReport, function (i, item) {
        chartData.push({ year: item.Grupo, registro: item.Valor, consultas: item.Valor2, eliminacion: item.Valor3, actualizacion: item.Valor4 });
    });
    */
    //Chart 2
    loadGraficoDos(dataAPI.estadoAtencionXTiempo.Data);

    //Chart 3
    chartData = [];
    $.each(dataAPI.consultasPortafolio.ChartReport, function (i, item) {
        chartData.push({ date: item.FechaDescripcion, value: item.Cantidad });
    });

    loadGraficoTres(chartData);

    //Chart 4
    chartData = [];
    $.each(dataAPI.registroAPP.ChartReport, function (i, item) {
        chartData.push({ date: item.FechaDescripcion, value1: item.Valor2, value2: item.Valor, previousDate: item.Fecha });
    });

    loadGraficoCuatro(chartData);

    //Chart 5
    /*
    chartData = [];
    $.each(dataAPI.topCampos.camposMasActualizados.ChartReport, function (i, item) {
        chartData.push({ year: item.Grupo, top1: item.Valor, top2: item.Valor2, top3: item.Valor3, top4: item.Valor4, top5: item.Valor5 });
    });
    */
    loadGraficoCinco(dataAPI.camposMasActualizados.Data);

    //Chart 6
    /*
    chartData = [];
    $.each(dataAPI.SLA.ChartReport, function (i, item) {
        chartData.push({
            year: item.Grupo, portafolio: item.Valor, devsecops: item.Valor2, userit: item.Valor3, jde: item.Valor4, owner: item.Valor5, tecnologia: item.Valor6
        });
    });
    */
    loadGraficoSeis(dataAPI.SLA.Data);

    //Chart 7
    chartData = [];
    $.each(dataAPI.estadoAtencionConsultas.ChartReport, function (i, item) {
        chartData.push({ category: item.Grupo, value: item.Cantidad });
    });

    loadGraficoSiete(chartData);

    //waitingDialog.hide();
}

function loadGraficoUno(data) {
    if (data.length > 0) {
        am4core.ready(function () {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            var chart = am4core.create("report1", am4charts.PieChart);
            ExportChart(chart, 'Distribuciones por tipo de atención (acumulado)');

            chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

            chart.data = data;

            chart.innerRadius = am4core.percent(40);
            //chart.depth = 60;

            chart.legend = new am4charts.Legend();

            var series = chart.series.push(new am4charts.PieSeries());
            series.dataFields.value = "value";
            //series.dataFields.depthValue = "value";
            series.dataFields.category = "category";
            series.slices.template.cornerRadius = 5;
            series.colors.step = 6;
            series.labels.template.text = "{category}: {value.percent.formatNumber('#.0')}% ({value})";

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
            var chart = am4core.create("report1_1", am4charts.XYChart);
            ExportChart(chart, 'Distribuciones por tipo de atención (por periodo de tiempo)');
            // Add data
            chart.data = data;

            // Create axes
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "FechaDescripcion";
            categoryAxis.title.text = "Periodo de tiempo";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.renderer.cellStartLocation = 0.1;
            categoryAxis.renderer.cellEndLocation = 0.9;
            let label = categoryAxis.renderer.labels.template;
            label.wrap = true;
            label.fontSize = 10;

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.min = 0;
            valueAxis.title.text = "Número de solicitudes";
            valueAxis.maxPrecision = 0;

            let label2 = valueAxis.renderer.labels.template;
            label2.wrap = true;
            label2.fontSize = 10;

            // Create series
            function createSeries(field, name, stacked) {
                var series = chart.series.push(new am4charts.ColumnSeries());
                series.dataFields.valueY = field;
                series.dataFields.categoryX = "FechaDescripcion";
                series.name = name;
                series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
                series.stacked = stacked;
                series.columns.template.width = am4core.percent(95);

                // Add label
                var labelBullet = series.bullets.push(new am4charts.LabelBullet());
                labelBullet.label.text = "{valueY}";
                labelBullet.locationY = 0.5;
                // labelBullet.label.hideOversized = true;
                labelBullet.label.fontSize = 10;
                labelBullet.label.truncate = false;
                labelBullet.label.hideOversized = false;
                LabelCustomFormatter(labelBullet);
            }

            chart.data = data;
            var headers = ObtenerColumnasData(data);
            for (var i = 0; i < headers.length; i++) {
                createSeries(headers[i], headers[i], true);

            }



            // Add legend
            chart.legend = new am4charts.Legend();

        }); // end am4core.ready()

        $("#btnExportarReporte1_1").show();
    }
    else {
        $("#report1_1_alerta").show();
        $("#report1_1").hide();
        $("#btnExportarReporte1_1").hide();
    }
}

function loadGraficoTres(data) {
    if (data.length > 0) {
        am4core.ready(function () {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("report2", am4charts.XYChart);
            ExportChart(chart, 'Datos de consultas al portafolio');
            // Add data
            chart.data = data;

            // Set input format for the dates
            chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";

            // Create axes
            //var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            var categoryXAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryXAxis.dataFields.category = "date";
            categoryXAxis.renderer.minGridDistance = 30;
            categoryXAxis.renderer.grid.template.location = 0;
            categoryXAxis.renderer.cellStartLocation = 0.1;
            categoryXAxis.renderer.cellEndLocation = 0.9;

            categoryXAxis.title.text = "Periodo de tiempo";
            let label = categoryXAxis.renderer.labels.template;
            label.wrap = true;
            label.fontSize = 10;

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.title.text = "Consultas";
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

function loadGraficoCuatro(data) {
    if (data.length > 0) {
        am4core.ready(function () {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("report3", am4charts.XYChart);
            ExportChart(chart, 'Días reales de registro de app (situación de registro)');
            // Add data
            chart.data = data;

            // Create axes
            //var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            //dateAxis.renderer.minGridDistance = 50;
            var categoryXAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryXAxis.dataFields.category = "date";
            categoryXAxis.renderer.minGridDistance = 30;
            categoryXAxis.title.text = "Periodo de tiempo";
            categoryXAxis.renderer.grid.template.location = 0;
            categoryXAxis.renderer.cellStartLocation = 0.1;
            categoryXAxis.renderer.cellEndLocation = 0.9;

            let label = categoryXAxis.renderer.labels.template;
            label.wrap = true;
            label.fontSize = 10;


            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.title.text = "Días";
            valueAxis.maxPrecision = 0;
            let label2 = valueAxis.renderer.labels.template;
            label2.wrap = true;
            label2.fontSize = 10;

            // Create series
            var series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.valueY = "value1";
            series.dataFields.categoryX = "date";
            series.strokeWidth = 2;
            series.minBulletDistance = 20;
            series.tooltipText = "[bold]Días promedio aprobación aplicación:[/] {value1}\n[bold]Días promedio situación completa:[/] {value2}";
            series.tooltip.pointerOrientation = "vertical";
            series.name = "Días promedio aprobación aplicación";

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
            series2.name = "Días promedio situación completa";

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

        $("#btnExportarReporte2").show();
    }
    else {
        $("#report3_alerta").show();
        $("#report3").hide();
        $("#btnExportarReporte3").hide();
    }
}

function loadGraficoCinco(data) {
    if (data.length > 0) {
        am4core.ready(function () {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("report4", am4charts.XYChart);
            ExportChart(chart, 'Campos más requeridos (top 5) para actualización en promedio');
            // Add data
            chart.data = data;

            // Create axes
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "FechaDescripcion";
            categoryAxis.title.text = "Periodo de tiempo";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.renderer.cellStartLocation = 0.1;
            categoryAxis.renderer.cellEndLocation = 0.9;

            let label = categoryAxis.renderer.labels.template;
            label.wrap = true;
            label.fontSize = 10;

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.min = 0;
            valueAxis.title.text = "Número de solicitudes";
            valueAxis.maxPrecision = 0;

            let label2 = valueAxis.renderer.labels.template;
            label2.wrap = true;
            label2.fontSize = 10;

            // Create series
            function createSeries(field, name, stacked) {
                var series = chart.series.push(new am4charts.ColumnSeries());
                series.dataFields.valueY = field;
                series.dataFields.categoryX = "FechaDescripcion";
                series.name = name;
                series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
                series.stacked = stacked;
                series.columns.template.width = am4core.percent(95);

                // Add label
                var labelBullet = series.bullets.push(new am4charts.LabelBullet());
                labelBullet.label.text = "{valueY}";
                labelBullet.locationY = 0.5;
                // labelBullet.label.hideOversized = true;
                labelBullet.label.fontSize = 10;
                LabelCustomFormatter(labelBullet);
            }

            var headers = ObtenerColumnasData(data);
            for (var i = 0; i < headers.length; i++) {
                createSeries(headers[i], headers[i], true);
            }

            // Add legend
            chart.legend = new am4charts.Legend();

        }); // end am4core.ready()

        $("#btnExportarReporte4").show();
    }
    else {
        $("#report4_alerta").show();
        $("#report4").hide();
        $("#btnExportarReporte4").hide();
    }
}

function loadGraficoSeis(data) {
    if (data) {
        am4core.ready(function () {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("report5", am4charts.XYChart);
            ExportChart(chart, 'Reporte de SLA (promedio de días)');
            // Add data
            chart.data = data;

            // Create category axis
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "FechaDescripcion";
            categoryAxis.title.text = "Periodo de tiempo";
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.cellStartLocation = 0.1;
            categoryAxis.renderer.cellEndLocation = 0.9;
            let label = categoryAxis.renderer.labels.template;
            label.wrap = true;
            label.fontSize = 10;
            //categoryAxis.renderer.opposite = true;

            // Create value axis
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            //valueAxis.renderer.inversed = true;
            valueAxis.title.text = "Promedio (días)";
            valueAxis.renderer.minLabelPosition = 0.01;
            valueAxis.maxPrecision = 0;

            let label2 = valueAxis.renderer.labels.template;
            label2.wrap = true;
            label2.fontSize = 10;

            // Create series
            function createSeries(field, name) {
                var series = chart.series.push(new am4charts.LineSeries());

                series.dataFields.valueY = field;
                series.dataFields.categoryX = "FechaDescripcion";
                series.name = name;

                series.bullets.push(new am4charts.CircleBullet());
                series.tooltipText = "Promedio (días) por {name} en {categoryX}: {valueY}";
                series.legendSettings.valueText = "{valueY}";
                series.visible = false;


                let hs1 = series.segments.template.states.create("hover")
                hs1.properties.strokeWidth = 5;
                series.segments.template.strokeWidth = 1;

                // Add label
                var labelBullet1 = series.bullets.push(new am4charts.LabelBullet());
                //labelBullet1.disabled = true;
                //labelBullet1.propertyFields.disabled = "bulletDisabled";
                labelBullet1.label.text = "{valueY}";
                labelBullet1.horizontalCenter = "left";
                labelBullet1.label.horizontalCenter = "left";
                labelBullet1.label.paddingLeft = 10;
                labelBullet1.label.fontSize = 9.5;
                LabelCustomFormatter(labelBullet1);
            }

            var headers = ObtenerColumnasData(data);
            for (var i = 0; i < headers.length; i++) {
                createSeries(headers[i], headers[i]);
            }
            // Create series


            // Add chart cursor
            chart.cursor = new am4charts.XYCursor();
            chart.cursor.behavior = "zoomY";




            // Add legend
            chart.legend = new am4charts.Legend();
            chart.legend.itemContainers.template.events.on("over", function (event) {
                var segments = event.target.dataItem.dataContext.segments;
                segments.each(function (segment) {
                    segment.isHover = true;
                })
            })

            chart.legend.itemContainers.template.events.on("out", function (event) {
                var segments = event.target.dataItem.dataContext.segments;
                segments.each(function (segment) {
                    segment.isHover = false;
                })
            })

        }); // end am4core.ready()

        $("#btnExportarReporte5").show();
    }
    else {
        $("#report5_alerta").show();
        $("#report5").hide();
        $("#btnExportarReporte5").hide();
    }
}


function loadGraficoSiete(data) {
    if (data.length > 0) {
        am4core.ready(function () {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            var chart = am4core.create("report7", am4charts.PieChart);
            ExportChart(chart, 'Consultas');

            chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

            chart.data = data;

            chart.innerRadius = am4core.percent(40);
            //chart.depth = 60;

            chart.legend = new am4charts.Legend();
            chart.legend.labels.template.fontSize = 10;
            chart.legend.position = "right";

            var series = chart.series.push(new am4charts.PieSeries());
            series.dataFields.value = "value";
            //series.dataFields.depthValue = "value";
            series.dataFields.category = "category";
            series.slices.template.cornerRadius = 5;
            series.colors.step = 6;
            series.labels.template.text = "{category}: {value.percent.formatNumber('#.0')}% ({value})";

        }); // end am4core.ready()

        $("#btnExportarReporte7").show();
    }
    else {
        $("#report7_alerta").show();
        $("#report7").hide();
        $("#btnExportarReporte7").hide();
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

function ExportChartData(typeReport) {
    if (ObjFilter) {

        let url = `${URL_API_VISTA}/reporte/pedidos/exportarData?gerencia=${ObjFilter.ListGerencia}&division=${ObjFilter.ListDivision}`
            + `&area=${ObjFilter.ListArea}&unidad=${ObjFilter.ListUnidad}&tipoActivo=${ObjFilter.ListTipoActivo}&gestionadoPor=${ObjFilter.ListGestionadoPor}`
            + `&fechaDesde=${ObjFilter.FechaDesde}&fechaHasta=${ObjFilter.FechaHasta}&typeReport=${typeReport}`;

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
}

function ObtenerColumnasData(list) {
    var columns = [];
    for (var i = 0; i < list.length; i++) {
        var row = list[i];

        for (var k in row) {
            if ($.inArray(k, columns) == -1 && k != "FechaDesde" && k != "FechaHasta" && k != "FechaDescripcion") {
                columns.push(k);
            }
        }
    }

    return columns;
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

    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {

            FechaFiltroDesde: {
                required: true,
                ValidDate: true,
                ValidMinDate: true
            },
            FechaFiltroHasta: {
                required: true,
                ValidDate: true,
                ValidMaxDate: true
            },

        },
        messages: {

            FechaFiltroDesde: {
                required: "Debe seleccionar una fecha",
                ValidDate: "Debe seleccionar una fecha Valida",
                ValidMinDate: "Debe ingresar una fecha menor a la fecha hasta"
            },
            FechaFiltroHasta: {
                required: "Debe seleccionar una fecha",
                ValidDate: "Debe seleccionar una Fecha Valida",
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


function DdlGerencia_Change() {
    let ddlVal = CaseIsNullSendExport($(this).val());

    if (ddlVal && ddlVal !== "-1") {
        SetItemsMultiple([], $("#cbFiltroUnidad"), TEXTO_TODOS, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFiltroArea"), TEXTO_TODOS, TEXTO_TODOS, true);
        InitSelectBuilder(ddlVal, $("#cbFiltroDivision"), "/reportesportfolio/reporte/pedidos/listDivisionbyGerencia");
    } else {
        SetItemsMultiple([], $("#cbFiltroUnidad"), TEXTO_TODOS, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFiltroArea"), TEXTO_TODOS, TEXTO_TODOS, true);
        SetItems([], $("#cbFiltroDivision"), TEXTO_SELECCIONE);
    }

    //parameters.Gerencia = ddlVal;
}
function DdlDivision_Change() {
    let ddlVal = CaseIsNullSendExport($(this).val());

    if (ddlVal && ddlVal !== "-1") {
        SetItemsMultiple([], $("#cbFiltroUnidad"), TEXTO_TODOS, TEXTO_TODOS, true);
        InitSelectBuilder(ddlVal, $("#cbFiltroArea"), "/reportesportfolio/reporte/pedidos/listAreabyDivision");
    } else {
        SetItemsMultiple([], $("#cbFiltroUnidad"), TEXTO_TODOS, TEXTO_TODOS, true);
        SetItems([], $("#cbFiltroArea"), TEXTO_SELECCIONE);
    }
    //parameters.Division = ddlVal;
}
function DdlArea_Change() {
    let ddlVal = CaseIsNullSendExport($(this).val());

    if (ddlVal && ddlVal !== "-1") {
        InitSelectBuilder(ddlVal, $("#cbFiltroUnidad"), "/reportesportfolio/reporte/pedidos/listUnidadesbyArea");
    } else {
        SetItems([], $("#cbFiltroUnidad"), TEXTO_SELECCIONE);
    }
    //parameters.Division = ddlVal;
}

function InitSelectBuilder(filtro, $ddl, urlGet) {
    if (filtro !== null && filtro !== "-1") {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: URL_API + `${urlGet}?strIds=${filtro}`,
            dataType: "json",
            async: false,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        SetItemsMultiple(dataObject, $ddl, TEXTO_TODOS, TEXTO_TODOS, true);

                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function LabelCustomFormatter(bullet) {
    bullet.label.adapter.add("textOutput", function (text, target) {
        if (target.dataItem && target.dataItem.valueY == 0) {
            return "";
        }
        return text;
    });
}