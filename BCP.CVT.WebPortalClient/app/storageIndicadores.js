var URL_API_VISTA = URL_API + "/Dashboard";
$(function () {
    ObtenerDataGraficos();  
    ObtenerDataBackups();
});

function ObtenerDataBackups() {   

    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartBackup_SO", am4charts.PieChart3D);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.legend = new am4charts.Legend();

        chart.data = [{
            "Ambiente": "Windows",
            "Total": 134
        }, {
            "Ambiente": "Linux",
            "Total": 165
            },
            , {
                "Ambiente": "AIX",
                "Total": 120
            }];

        var series = chart.series.push(new am4charts.PieSeries3D());
        series.dataFields.value = "Total";
        series.dataFields.category = "Ambiente";

    }); // end am4core.ready()

    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartBackup_Infraestructura", am4charts.PieChart3D);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.legend = new am4charts.Legend();

        chart.data = [{
            "Ambiente": "VMWare",
            "Total": 299
        }, {
            "Ambiente": "Mainframe",
            "Total": 120
        }];

        var series = chart.series.push(new am4charts.PieSeries3D());
        series.dataFields.value = "Total";
        series.dataFields.category = "Ambiente";

    }); // end am4core.ready()

    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartBackup_DistGlobal", am4charts.PieChart3D);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.legend = new am4charts.Legend();

        chart.data = [{
            "Ambiente": "Respaldado",
            "Total": 419
        }, {
            "Ambiente": "No respaldado",
            "Total": 4100
        }];

        var series = chart.series.push(new am4charts.PieSeries3D());
        series.dataFields.value = "Total";
        series.dataFields.category = "Ambiente";

    }); // end am4core.ready()

    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartBackup_DistAmbiente", am4charts.PieChart3D);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.legend = new am4charts.Legend();

        chart.data = [{
            "Ambiente": "Certificación",
            "Total": 3
        }, {
            "Ambiente": "Desarrollo",
                "Total": 13
            }, {
                "Ambiente": "Integración",
                "Total": 1
            }, {
                "Ambiente": "Producción",
                "Total": 349
            }, {
                "Ambiente": "Sin Ambiente",
                "Total": 53
            }];

        var series = chart.series.push(new am4charts.PieSeries3D());
        series.dataFields.value = "Total";
        series.dataFields.category = "Ambiente";

    }); // end am4core.ready()

    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartBackup_Top10", am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.data = [
            {
                country: "SPZO",
                visits: 501.284269
            },
            {
                country: "GAMG",
                visits: 491.593141
            },
            {
                country: "GABP",
                visits: 487.432633
            },
            {
                country: "GAFI",
                visits: 484.061458
            },
            {
                country: "GACO",
                visits: 477.783873
            },
            {
                country: "GAHR",
                visits: 463.175685
            },
            {
                country: "GAMM",
                visits: 455.826700
            },
            {
                country: "WLEA",
                visits: 60.656452
            },
            {
                country: "GGTT",
                visits: 60.290478
            },
            {
                country: "VPLU",
                visits: 54.742951
            },
            {
                country: "TTIB",
                visits: 52.195023
            },
            {
                country: "MDDI",
                visits: 40.137496
            }
        ];

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "country";
        categoryAxis.renderer.minGridDistance = 40;
        categoryAxis.fontSize = 11;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 520;
        valueAxis.strictMinMax = true;
        valueAxis.renderer.minGridDistance = 30;
        // axis break
        var axisBreak = valueAxis.axisBreaks.create();
        axisBreak.startValue = 100;
        axisBreak.endValue = 480;
        //axisBreak.breakSize = 0.005;

        // fixed axis break
        var d = (axisBreak.endValue - axisBreak.startValue) / (valueAxis.max - valueAxis.min);
        axisBreak.breakSize = 0.05 * (1 - d) / d; // 0.05 means that the break will take 5% of the total value axis height

        // make break expand on hover
        var hoverState = axisBreak.states.create("hover");
        hoverState.properties.breakSize = 1;
        hoverState.properties.opacity = 0.1;
        hoverState.transitionDuration = 1500;

        axisBreak.defaultState.transitionDuration = 1000;
        /*
        // this is exactly the same, but with events
        axisBreak.events.on("over", function() {
          axisBreak.animate(
            [{ property: "breakSize", to: 1 }, { property: "opacity", to: 0.1 }],
            1500,
            am4core.ease.sinOut
          );
        });
        axisBreak.events.on("out", function() {
          axisBreak.animate(
            [{ property: "breakSize", to: 0.005 }, { property: "opacity", to: 1 }],
            1000,
            am4core.ease.quadOut
          );
        });*/

        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "country";
        series.dataFields.valueY = "visits";
        series.columns.template.tooltipText = "{valueY.value}";
        series.columns.template.tooltipY = 0;
        series.columns.template.strokeOpacity = 0;

        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
            return chart.colors.getIndex(target.dataItem.index);
        });

    }); // end am4core.ready()

    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartBackup_Top10Equipos", am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.data = [
            {
                country: "P1SAPSSMP01",
                visits: 4800
            },
            {
                country: "PMOSSSQLP01",
                visits: 1905
            },
            {
                country: "PBPCSAPP01",
                visits: 1328
            },
            {
                country: "PGAB1SQLP01",
                visits: 1257
            },
            {
                country: "VMW_BCP-CHORRILLOS-PROD_DM2",
                visits: 1155
            },
            {
                country: "VMW_BCP-LAMOLINA-PROD_DM2",
                visits: 1074
            },
            {
                country: "PSAPEP01",
                visits: 718
            },
            {
                country: "PRODREG",
                visits: 694
            },
            {
                country: "PSP07SQLP03",
                visits: 601
            },
            {
                country: "PMDCSQL2K8CLP01",
                visits: 546
            },
            {
                country: "PGAGRDB2P01",
                visits: 521
            },
            {
                country: "PSAPERP01",
                visits: 508
            }
        ];

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "country";
        categoryAxis.renderer.minGridDistance = 30;
        categoryAxis.renderer.labels.template.horizontalCenter = "right";
        categoryAxis.renderer.labels.template.verticalCenter = "middle";
        categoryAxis.renderer.labels.template.rotation = 270;
        categoryAxis.tooltip.disabled = true;
        categoryAxis.renderer.minHeight = 110;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 5000;
        valueAxis.strictMinMax = true;
        valueAxis.renderer.minGridDistance = 30;
        // axis break
        var axisBreak = valueAxis.axisBreaks.create();
        axisBreak.startValue = 1000;
        axisBreak.endValue = 3000;
        //axisBreak.breakSize = 0.005;

        // fixed axis break
        var d = (axisBreak.endValue - axisBreak.startValue) / (valueAxis.max - valueAxis.min);
        axisBreak.breakSize = 0.05 * (1 - d) / d; // 0.05 means that the break will take 5% of the total value axis height

        // make break expand on hover
        var hoverState = axisBreak.states.create("hover");
        hoverState.properties.breakSize = 1;
        hoverState.properties.opacity = 0.1;
        hoverState.transitionDuration = 1500;

        axisBreak.defaultState.transitionDuration = 1000;
        /*
        // this is exactly the same, but with events
        axisBreak.events.on("over", function() {
          axisBreak.animate(
            [{ property: "breakSize", to: 1 }, { property: "opacity", to: 0.1 }],
            1500,
            am4core.ease.sinOut
          );
        });
        axisBreak.events.on("out", function() {
          axisBreak.animate(
            [{ property: "breakSize", to: 0.005 }, { property: "opacity", to: 1 }],
            1000,
            am4core.ease.quadOut
          );
        });*/

        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "country";
        series.dataFields.valueY = "visits";
        series.columns.template.tooltipText = "{valueY.value}";
        series.columns.template.tooltipY = 0;
        series.columns.template.strokeOpacity = 0;
        series.tooltip.pointerOrientation = "vertical";

        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
            return chart.colors.getIndex(target.dataItem.index);
        });

    }); // end am4core.ready()

    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartBackup_TareasFallan", am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.data = [
            {
                category: "Setiembre",
                value1: 68120,
                value2: 3897
            }
        ];

        chart.colors.step = 2;
        chart.padding(30, 30, 10, 30);
        chart.legend = new am4charts.Legend();

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.grid.template.location = 0;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.minWidth = 50;


        var series1 = chart.series.push(new am4charts.ColumnSeries());
        series1.columns.template.width = am4core.percent(80);
        series1.columns.template.tooltipText =
            "{name}: {valueY.totalPercent.formatNumber('#.00')}%";
        series1.name = "Success";
        series1.dataFields.categoryX = "category";
        series1.dataFields.valueY = "value1";
        series1.dataFields.valueYShow = "totalPercent";
        series1.dataItems.template.locations.categoryX = 0.5;
        series1.stacked = true;
        series1.tooltip.pointerOrientation = "vertical";

        var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
        bullet1.interactionsEnabled = false;
        bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet1.label.fill = am4core.color("#ffffff");
        bullet1.locationY = 0.5;

        var series2 = chart.series.push(new am4charts.ColumnSeries());
        series2.columns.template.width = am4core.percent(80);
        series2.columns.template.tooltipText =
            "{name}: {valueY.totalPercent.formatNumber('#.00')}%";
        series2.name = "Failed";
        series2.dataFields.categoryX = "category";
        series2.dataFields.valueY = "value2";
        series2.dataFields.valueYShow = "totalPercent";
        series2.dataItems.template.locations.categoryX = 0.5;
        series2.stacked = true;
        series2.tooltip.pointerOrientation = "vertical";

        var bullet2 = series2.bullets.push(new am4charts.LabelBullet());
        bullet2.interactionsEnabled = false;
        bullet2.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet2.locationY = 0.5;
        bullet2.label.fill = am4core.color("#ffffff");      

    }); // end am4core.ready()

    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartBackup_TareasRestore", am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.data = [
            {
                country: "Setiembre",
                visits: 16
            }
        ];

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "country";
        categoryAxis.renderer.minGridDistance = 40;
        categoryAxis.fontSize = 11;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 50;
        valueAxis.strictMinMax = true;
        valueAxis.renderer.minGridDistance = 30;
        // axis break
        var axisBreak = valueAxis.axisBreaks.create();
        axisBreak.startValue = 10;
        axisBreak.endValue = 20;
        //axisBreak.breakSize = 0.005;

        // fixed axis break
        var d = (axisBreak.endValue - axisBreak.startValue) / (valueAxis.max - valueAxis.min);
        axisBreak.breakSize = 0.05 * (1 - d) / d; // 0.05 means that the break will take 5% of the total value axis height

        // make break expand on hover
        var hoverState = axisBreak.states.create("hover");
        hoverState.properties.breakSize = 1;
        hoverState.properties.opacity = 0.1;
        hoverState.transitionDuration = 1500;

        axisBreak.defaultState.transitionDuration = 1000;
        /*
        // this is exactly the same, but with events
        axisBreak.events.on("over", function() {
          axisBreak.animate(
            [{ property: "breakSize", to: 1 }, { property: "opacity", to: 0.1 }],
            1500,
            am4core.ease.sinOut
          );
        });
        axisBreak.events.on("out", function() {
          axisBreak.animate(
            [{ property: "breakSize", to: 0.005 }, { property: "opacity", to: 1 }],
            1000,
            am4core.ease.quadOut
          );
        });*/

        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "country";
        series.dataFields.valueY = "visits";
        series.columns.template.tooltipText = "{valueY.value}";
        series.columns.template.tooltipY = 0;
        series.columns.template.strokeOpacity = 0;

        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
            return chart.colors.getIndex(target.dataItem.index);
        });

    }); // end am4core.ready()
}

function ObtenerDataGraficos() {
    var data = [];
    let params = {};

    params = {};
    params.PageSize = 1;
    params.PageNumber = 1;    

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Storage/Indicadores",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(params),
        dataType: "json",
        success: function (result) {
            if (result != null) {
                data = result;               

                initCapacidadTotalAplicaciones(data.Aplicaciones);
                initCapacidadTotal(data.Totales);
                initCapacidadMes(data.Actual);                
                initCapacidadReplica(data.Replica);
                initCapacidadObsolescencia(data.Obsolescencia);

                initCapacidadTotalT1(data.datosTier1.Totales);
                initCapacidadTotalAplicacionesT1(data.datosTier1.Aplicaciones);                

                initCapacidadTotalT2(data.datosTier2.Totales);
                initCapacidadTotalAplicacionesT2(data.datosTier2.Aplicaciones);

                initCapacidaReplicaTier1(data.Ambiente);
                initCapacidaReplicaTier2(data.Fuente);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            waitingDialog.hide();            
        },
        async: true
    });    
}

function initCapacidadMes(data) {
    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartPie", am4charts.PieChart3D);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.legend = new am4charts.Legend();

        chart.data = data;

        var series = chart.series.push(new am4charts.PieSeries3D());
        series.dataFields.value = "CapacidadTB";
        series.dataFields.category = "CodigoAPT";

    }); // end am4core.ready()
}

function initCapacidadTotal(data) {
    am4core.ready(function () {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartTotal", am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.data = data;

        chart.colors.step = 2;
        chart.padding(30, 30, 10, 30);
        chart.legend = new am4charts.Legend();

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "MesToString";
        categoryAxis.renderer.grid.template.location = 0;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.minWidth = 50;


        var series1 = chart.series.push(new am4charts.ColumnSeries());
        series1.columns.template.width = am4core.percent(80);
        series1.columns.template.tooltipText =
            "{name}: {valueY.formatNumber('#.00')} TB";
        series1.name = "Usado";
        series1.dataFields.categoryX = "MesToString";
        series1.dataFields.valueY = "UsadoTB";
        series1.dataFields.valueYShow = "totalPercent";
        series1.dataItems.template.locations.categoryX = 0.5;
        series1.stacked = true;
        series1.tooltip.pointerOrientation = "vertical";

        var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
        bullet1.interactionsEnabled = false;
        bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet1.label.fill = am4core.color("#ffffff");
        bullet1.locationY = 0.5;

        var series2 = chart.series.push(new am4charts.ColumnSeries());
        series2.columns.template.width = am4core.percent(80);
        series2.columns.template.tooltipText =
            "{name}: {valueY.formatNumber('#.00')} TB";
        series2.name = "Libre";
        series2.dataFields.categoryX = "MesToString";
        series2.dataFields.valueY = "LibreTB";
        series2.dataFields.valueYShow = "totalPercent";
        series2.dataItems.template.locations.categoryX = 0.5;
        series2.stacked = true;
        series2.tooltip.pointerOrientation = "vertical";

        var bullet2 = series2.bullets.push(new am4charts.LabelBullet());
        bullet2.interactionsEnabled = false;
        bullet2.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet2.locationY = 0.5;
        bullet2.label.fill = am4core.color("#ffffff");
        

        //chart.scrollbarX = new am4core.Scrollbar();

    }); // end am4core.ready()
}

function initCapacidadTotalAplicaciones(data) {

    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end
        var chart = am4core.create('divChartAplicaciones', am4charts.XYChart);
        chart.colors.step = 2;

        chart.legend = new am4charts.Legend();
        chart.legend.position = 'top';
        chart.legend.paddingBottom = 20;
        chart.legend.labels.template.maxWidth = 95;

        var xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        xAxis.dataFields.category = 'CodigoAPT';
        xAxis.renderer.cellStartLocation = 0.1;
        xAxis.renderer.cellEndLocation = 0.9;
        xAxis.renderer.grid.template.location = 0;
        xAxis.renderer.minGridDistance = 20;

        var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.min = 0;        

        chart.data = data;

        function createSeries(value, name) {
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = value;
            series.dataFields.categoryX = 'CodigoAPT';
            series.name = name;

            series.events.on("hidden", arrangeColumns);
            series.events.on("shown", arrangeColumns);

            var bullet = series.bullets.push(new am4charts.LabelBullet());
            bullet.interactionsEnabled = false;
            bullet.dy = -10;
            bullet.label.text = '{valueY}';
            bullet.label.fill = am4core.color('#000000');

            return series;
        }

        function arrangeColumns() {

            var series = chart.series.getIndex(0);

            var w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
            if (series.dataItems.length > 1) {
                var x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
                var x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
                var delta = ((x1 - x0) / chart.series.length) * w;
                if (am4core.isNumber(delta)) {
                    var middle = chart.series.length / 2;

                    var newIndex = 0;
                    chart.series.each(function (series) {
                        if (!series.isHidden && !series.isHiding) {
                            series.dummyData = newIndex;
                            newIndex++;
                        }
                        else {
                            series.dummyData = chart.series.indexOf(series);
                        }
                    });
                    var visibleCount = newIndex;
                    var newMiddle = visibleCount / 2;

                    chart.series.each(function (series) {
                        var trueIndex = chart.series.indexOf(series);
                        var newIndex = series.dummyData;

                        var dx = (newIndex - trueIndex + middle - newMiddle) * delta;

                        series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                        series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                    });
                }
            }
        }

        createSeries('CapacidadTB', 'Total (TB)');
        createSeries('UsadoTB', 'Usado (TB)');        

    }); // end am4core.ready()        
}

function initCapacidadTotalT1(data) {
    am4core.ready(function () {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartTotalT1", am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.data = data;

        chart.colors.step = 2;
        chart.padding(30, 30, 10, 30);
        chart.legend = new am4charts.Legend();

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "MesToString";
        categoryAxis.renderer.grid.template.location = 0;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.minWidth = 50;


        var series1 = chart.series.push(new am4charts.ColumnSeries());
        series1.columns.template.width = am4core.percent(80);
        series1.columns.template.tooltipText =
            "{name}: {valueY.formatNumber('#.00')} TB";
        series1.name = "Usado";
        series1.dataFields.categoryX = "MesToString";
        series1.dataFields.valueY = "UsadoTB";
        series1.dataFields.valueYShow = "totalPercent";
        series1.dataItems.template.locations.categoryX = 0.5;
        series1.stacked = true;
        series1.tooltip.pointerOrientation = "vertical";

        var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
        bullet1.interactionsEnabled = false;
        bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet1.label.fill = am4core.color("#ffffff");
        bullet1.locationY = 0.5;

        var series2 = chart.series.push(new am4charts.ColumnSeries());
        series2.columns.template.width = am4core.percent(80);
        series2.columns.template.tooltipText =
            "{name}: {valueY.formatNumber('#.00')} TB";
        series2.name = "Libre";
        series2.dataFields.categoryX = "MesToString";
        series2.dataFields.valueY = "LibreTB";
        series2.dataFields.valueYShow = "totalPercent";
        series2.dataItems.template.locations.categoryX = 0.5;
        series2.stacked = true;
        series2.tooltip.pointerOrientation = "vertical";

        var bullet2 = series2.bullets.push(new am4charts.LabelBullet());
        bullet2.interactionsEnabled = false;
        bullet2.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet2.locationY = 0.5;
        bullet2.label.fill = am4core.color("#ffffff");


        //chart.scrollbarX = new am4core.Scrollbar();

    }); // end am4core.ready()
}

function initCapacidadTotalT2(data) {
    am4core.ready(function () {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartTotalT2", am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.data = data;

        chart.colors.step = 2;
        chart.padding(30, 30, 10, 30);
        chart.legend = new am4charts.Legend();

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "MesToString";
        categoryAxis.renderer.grid.template.location = 0;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.minWidth = 50;


        var series1 = chart.series.push(new am4charts.ColumnSeries());
        series1.columns.template.width = am4core.percent(80);
        series1.columns.template.tooltipText =
            "{name}: {valueY.formatNumber('#.00')} TB";
        series1.name = "Usado";
        series1.dataFields.categoryX = "MesToString";
        series1.dataFields.valueY = "UsadoTB";
        series1.dataFields.valueYShow = "totalPercent";
        series1.dataItems.template.locations.categoryX = 0.5;
        series1.stacked = true;
        series1.tooltip.pointerOrientation = "vertical";

        var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
        bullet1.interactionsEnabled = false;
        bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet1.label.fill = am4core.color("#ffffff");
        bullet1.locationY = 0.5;

        var series2 = chart.series.push(new am4charts.ColumnSeries());
        series2.columns.template.width = am4core.percent(80);
        series2.columns.template.tooltipText =
            "{name}: {valueY.formatNumber('#.00')} TB";
        series2.name = "Libre";
        series2.dataFields.categoryX = "MesToString";
        series2.dataFields.valueY = "LibreTB";
        series2.dataFields.valueYShow = "totalPercent";
        series2.dataItems.template.locations.categoryX = 0.5;
        series2.stacked = true;
        series2.tooltip.pointerOrientation = "vertical";

        var bullet2 = series2.bullets.push(new am4charts.LabelBullet());
        bullet2.interactionsEnabled = false;
        bullet2.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet2.locationY = 0.5;
        bullet2.label.fill = am4core.color("#ffffff");


        //chart.scrollbarX = new am4core.Scrollbar();

    }); // end am4core.ready()
}

function initCapacidadTotalAplicacionesT1(data) {
    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        var chart = am4core.create("divChartAplicacionesT1", am4charts.XYChart);
        //chart.scrollbarX = new am4core.Scrollbar();

        // Add data
        chart.data = data;

        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "CodigoAPT";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 30;
        categoryAxis.renderer.labels.template.horizontalCenter = "right";
        categoryAxis.renderer.labels.template.verticalCenter = "middle";
        categoryAxis.renderer.labels.template.rotation = 270;
        categoryAxis.tooltip.disabled = true;
        categoryAxis.renderer.minHeight = 110;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.minWidth = 50;

        // Create series
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.sequencedInterpolation = true;
        series.dataFields.valueY = "CapacidadTB";
        series.dataFields.categoryX = "CodigoAPT";
        series.tooltipText = "[{categoryX}: bold]{valueY}[/] TB";
        series.columns.template.strokeWidth = 0;

        series.tooltip.pointerOrientation = "vertical";

        series.columns.template.column.cornerRadiusTopLeft = 10;
        series.columns.template.column.cornerRadiusTopRight = 10;
        series.columns.template.column.fillOpacity = 0.8;

        // on hover, make corner radiuses bigger
        var hoverState = series.columns.template.column.states.create("hover");
        hoverState.properties.cornerRadiusTopLeft = 0;
        hoverState.properties.cornerRadiusTopRight = 0;
        hoverState.properties.fillOpacity = 1;

        series.columns.template.adapter.add("fill", function (fill, target) {
            return chart.colors.getIndex(target.dataItem.index);
        });

        // Cursor
        chart.cursor = new am4charts.XYCursor();

    }); // end am4core.ready()
}

function initCapacidadTotalAplicacionesT2(data) {
    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        var chart = am4core.create("divChartAplicacionesT2", am4charts.XYChart);
        //chart.scrollbarX = new am4core.Scrollbar();

        // Add data
        chart.data = data;

        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "CodigoAPT";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 30;
        categoryAxis.renderer.labels.template.horizontalCenter = "right";
        categoryAxis.renderer.labels.template.verticalCenter = "middle";
        categoryAxis.renderer.labels.template.rotation = 270;
        categoryAxis.tooltip.disabled = true;
        categoryAxis.renderer.minHeight = 110;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.minWidth = 50;

        // Create series
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.sequencedInterpolation = true;
        series.dataFields.valueY = "CapacidadTB";
        series.dataFields.categoryX = "CodigoAPT";
        series.tooltipText = "[{categoryX}: bold]{valueY}[/] TB";
        series.columns.template.strokeWidth = 0;

        series.tooltip.pointerOrientation = "vertical";

        series.columns.template.column.cornerRadiusTopLeft = 10;
        series.columns.template.column.cornerRadiusTopRight = 10;
        series.columns.template.column.fillOpacity = 0.8;

        // on hover, make corner radiuses bigger
        var hoverState = series.columns.template.column.states.create("hover");
        hoverState.properties.cornerRadiusTopLeft = 0;
        hoverState.properties.cornerRadiusTopRight = 0;
        hoverState.properties.fillOpacity = 1;

        series.columns.template.adapter.add("fill", function (fill, target) {
            return chart.colors.getIndex(target.dataItem.index);
        });

        // Cursor
        chart.cursor = new am4charts.XYCursor();

    }); // end am4core.ready()
}

function initCapacidadReplica(data) {
    am4core.ready(function () {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartReplica", am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.data = data;

        chart.colors.step = 2;
        chart.padding(30, 30, 10, 30);
        chart.legend = new am4charts.Legend();

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "MesToString";
        categoryAxis.renderer.grid.template.location = 0;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.minWidth = 50;


        var series1 = chart.series.push(new am4charts.ColumnSeries());
        series1.columns.template.width = am4core.percent(80);
        series1.columns.template.tooltipText =
            "{name}: {valueY.formatNumber('#.00')} TB";
        series1.name = "Replicado";
        series1.dataFields.categoryX = "MesToString";
        series1.dataFields.valueY = "ReplicaTB";
        series1.dataFields.valueYShow = "totalPercent";
        series1.dataItems.template.locations.categoryX = 0.5;
        series1.stacked = true;
        series1.tooltip.pointerOrientation = "vertical";

        var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
        bullet1.interactionsEnabled = false;
        bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet1.label.fill = am4core.color("#ffffff");
        bullet1.locationY = 0.5;

        var series2 = chart.series.push(new am4charts.ColumnSeries());
        series2.columns.template.width = am4core.percent(80);
        series2.columns.template.tooltipText =
            "{name}: {valueY.formatNumber('#.00')} TB";
        series2.name = "No replicado";
        series2.dataFields.categoryX = "MesToString";
        series2.dataFields.valueY = "NoReplicaTB";
        series2.dataFields.valueYShow = "totalPercent";
        series2.dataItems.template.locations.categoryX = 0.5;
        series2.stacked = true;
        series2.tooltip.pointerOrientation = "vertical";

        var bullet2 = series2.bullets.push(new am4charts.LabelBullet());
        bullet2.interactionsEnabled = false;
        bullet2.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet2.locationY = 0.5;
        bullet2.label.fill = am4core.color("#ffffff");


        //chart.scrollbarX = new am4core.Scrollbar();

    }); // end am4core.ready()
}

function initCapacidadObsolescencia(data) {
    am4core.ready(function () {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartObsolescencia", am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.data = data;

        chart.colors.step = 2;
        chart.padding(30, 30, 10, 30);
        chart.legend = new am4charts.Legend();

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "MesToString";
        categoryAxis.renderer.grid.template.location = 0;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.minWidth = 50;


        var series1 = chart.series.push(new am4charts.ColumnSeries());
        series1.columns.template.width = am4core.percent(80);
        series1.columns.template.tooltipText =
            "{name}: {valueY.formatNumber('#.00')} TB";
        series1.name = "Obsoleto";
        series1.dataFields.categoryX = "MesToString";
        series1.dataFields.valueY = "CapacidadObsoleta";
        series1.dataFields.valueYShow = "totalPercent";
        series1.dataItems.template.locations.categoryX = 0.5;
        series1.stacked = true;
        series1.tooltip.pointerOrientation = "vertical";

        var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
        bullet1.interactionsEnabled = false;
        bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet1.label.fill = am4core.color("#ffffff");
        bullet1.locationY = 0.5;

        var series2 = chart.series.push(new am4charts.ColumnSeries());
        series2.columns.template.width = am4core.percent(80);
        series2.columns.template.tooltipText =
            "{name}: {valueY.formatNumber('#.00')} TB";
        series2.name = "Vigente";
        series2.dataFields.categoryX = "MesToString";
        series2.dataFields.valueY = "CapacidadNoObsoleta";
        series2.dataFields.valueYShow = "totalPercent";
        series2.dataItems.template.locations.categoryX = 0.5;
        series2.stacked = true;
        series2.tooltip.pointerOrientation = "vertical";

        var bullet2 = series2.bullets.push(new am4charts.LabelBullet());
        bullet2.interactionsEnabled = false;
        bullet2.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet2.locationY = 0.5;
        bullet2.label.fill = am4core.color("#ffffff");


        //chart.scrollbarX = new am4core.Scrollbar();

    }); // end am4core.ready()
}

function initCapacidaReplicaTier1(data) {
    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartPlataforma", am4charts.PieChart3D);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.legend = new am4charts.Legend();

        chart.data = data;

        var series = chart.series.push(new am4charts.PieSeries3D());
        series.dataFields.value = "Capacidad";
        series.dataFields.category = "Valor";

    }); // end am4core.ready()
}

function initCapacidaReplicaTier2(data) {
    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("divChartAmbiente", am4charts.PieChart3D);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.legend = new am4charts.Legend();

        chart.data = data;

        var series = chart.series.push(new am4charts.PieSeries3D());
        series.dataFields.value = "Capacidad";
        series.dataFields.category = "Valor";

    }); // end am4core.ready()
}