var URL_API_VISTA = URL_API + "/Dashboard/Tecnologia";
var DATA_DOMINIO = [];
var DATA_SUBDOMINIO = [];
var DATA_FAMILIA = [];
var DATA_FABRICANTE = [];
var DATA_CLAVETECNOLOGIA = [];
var DATA_TIPOEQUIPO = [];
var $tblEquipoAgrupacion = $("#tblEquipoAgrupacion");
var TIPO_EQUIPO = { SERVIDOR: 1, SERVIDOR_AGENCIA: 2, PC: 3 };
var TIPO_TECNOLOGIA = { 1: "Estándar", 2: "Estándar Restringido", 3: "Por Regularizar", 4: "No Estándar", 5: "En Evaluación", 6: "Excepción" };

$(function () {

    InitFecha();
    //CargarCombos();

    //$("#cbFilDominio").change(Change_cbFilDominio);
    //$("#cbFilSubdominio").change(Change_cbFilSubdominio);
    //$("#cbFilFamilia").change(Change_cbFilFamilia);
    //$("#cbFilFabricante").change(Change_cbFilFabricante);

    //$(".div-report").show();
    MethodValidarFecha(RANGO_DIAS_HABILES);
    ValidarCampos();
    //InitColumnChartv4();

});

function InitFecha() {
    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    _BuildDatepicker($("#FechaFiltro"));
}

function ActualizarGraficos() {
    if (FLAG_ADMIN === 1) {
        $(".exportar-detalle-reporte").show();
    }
    else {
        $(".exportar-detalle-reporte").hide();
    }
    CargarReporte1();
}

function CargarReporte1() {
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {

        let data = {
            Fecha: $("#FechaFiltro").val()
        };

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $.ajax({
            url: URL_API_VISTA + "/ReporteTecnologiaInstalaciones",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (dataObject) {
                if (dataObject !== null) {
                    let rptInstalaciones = dataObject.rptInstalaciones;
                    let rptInstalacionesTipo = dataObject.rptInstalacionesTipo;
                    let rptInstalacionesTipoEquipo = dataObject.rptInstalacionesTipoEquipo;
                    let rptInstalacionesEquipoAgrupacion = dataObject.rptInstalacionesEquipoAgrupacion;

                    let Pie = [];
                    let ColumnBar = [];
                    let totalInstalaciones = 0;

                    //Fill Colum Bar
                    $.each(rptInstalaciones, function (i, item) {
                        ColumnBar.push({
                            categoria: item.TipoEquipoStr,
                            cantidad: item.Total
                        });
                        totalInstalaciones = totalInstalaciones + item.Total;
                    });

                    //Fill Pie
                    $.each(rptInstalacionesTipo, function (i, item) {
                        Pie.push({
                            categoria: item.TipoTecnologiaStr,
                            cantidad: item.Total
                        });
                    });

                    //Fill Pie TipoTecnologia Equipo
                    $.each(rptInstalacionesTipoEquipo, function (i, item) {
                        switch (item.TipoEquipoId) {
                            case TIPO_EQUIPO.SERVIDOR:
                                let dataServidor = SetDataPiev4(item);
                                InitAmchartPiev4(dataServidor, "reportPieServidor", String.Format("N° de SW en {0}", "Servidor"), "Estado");
                                break;

                            case TIPO_EQUIPO.SERVIDOR_AGENCIA:
                                let dataServidorAgencia = SetDataPiev4(item);
                                InitAmchartPiev4(dataServidorAgencia, "reportPieServidorAgencia", String.Format("N° de SW en {0}", "Servidor Agencia"), "Estado");
                                break;

                            case TIPO_EQUIPO.PC:
                                let dataPc = SetDataPiev4(item);
                                InitAmchartPiev4(dataPc, "reportPiePC", String.Format("N° de SW en {0}", "PCs"), "Estado");
                                break;
                        }
                    });

                    //Fill Tbl Equipo Agrupaciones
                    $tblEquipoAgrupacion.bootstrapTable("destroy");
                    $tblEquipoAgrupacion.bootstrapTable({ data: rptInstalacionesEquipoAgrupacion });

                    InitColumnChartv4(ColumnBar);
                    InitAmchartPiev4(Pie, "reportPieChart", "Cantidad de Instalaciones por Estado de Estandarización", "Estado de Estandarización");

                    $(".total").html(String.Format("Total de instalaciones: {0}", totalInstalaciones));
                    $(".div-report").show();
                    //    var new_arr = $.grep(item.Data, function (n, i) {
                    //        return n.value > 0;
                    //    });
                    //    if (new_arr.length > 0) {
                    //        if (FLAG_ADMIN === 1)
                    //            $(".exportar-detalle-reporte").show();
                    //    }
                    //    HorizontalBar = HorizontalBar.concat(new_arr);
                    //});

                    //InitAmchartHorizontalBar(HorizontalBar);                        
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

function SetDataPiev4(item) {
    let data = [];
    data = [
        {
            categoria: TIPO_TECNOLOGIA[1],
            cantidad: item.Estandar
        },
        {
            categoria: TIPO_TECNOLOGIA[2],
            cantidad: item.EstandarRestringido
        },
        {
            categoria: TIPO_TECNOLOGIA[3],
            cantidad: item.PorRegularizar
        },
        {
            categoria: TIPO_TECNOLOGIA[4],
            cantidad: item.NoEstandar
        },
        {
            categoria: TIPO_TECNOLOGIA[5],
            cantidad: item.EnEvaluacion
        },
        {
            categoria: TIPO_TECNOLOGIA[6],
            cantidad: item.Excepcion
        }
    ];
    return data;
}

function ValidarCampos() {

    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbFilDominio: {
                requiredSelect: false
            },
            cbFilSubdominio: {
                requiredSelect: false
            },
            FechaFiltro: {
                required: true,
                isDate: true,
                FechaPrevia: true,
                FechaMaxima: true
            }
        },
        messages: {
            cbFilDominio: { requiredSelect: String.Format("Debes seleccionar el {0}.", "dominio") },
            cbFilSubdominio: { requiredSelect: String.Format("Debes seleccionar el {0}.", "subdominio") },
            FechaFiltro: {
                required: "Debes seleccionar una fecha", isDate: "Debe ingresar una fecha valida",
                FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbFilDominio" || element.attr('name') === "cbFilSubdominio" || element.attr('name') === "FechaFiltro") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
    });
}

function InitColumnChartv4(dataAPI) {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    var chart = am4core.create("reportColumnChart", am4charts.XYChart);
    chart.scrollbarX = new am4core.Scrollbar();

    // Add data
    chart.data = dataAPI;

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "categoria";
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
    series.dataFields.valueY = "cantidad";
    series.dataFields.categoryX = "categoria";
    series.tooltipText = "[{categoryX}: bold]{valueY}[/]";
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
}

function InitAmchartPiev4(dataAPI, divPie, titulo, leyenda) {

    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create(divPie, am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    chart.legend = new am4charts.Legend();
    //chart.legend.parent = chart.chartContainer;
    chart.legend.background.fill = am4core.color("#000");
    chart.legend.background.fillOpacity = 0.05;
    chart.legend.width = 260;
    chart.legend.align = "center";
    chart.legend.padding(10, 15, 10, 15);
    //chart.legend.labels.template.text = "[bold {color}]{name}[/]";
    chart.legend.valueLabels.template.text = "{value.value}";
    chart.legend.labels.template.maxWidth = 95;
    chart.legend.labels.template.truncate = false;
    chart.legend.labels.template.wrap = true;

    //Title Legend
    var legendTitle = chart.legend.createChild(am4core.Label);
    legendTitle.text = String.Format("[bold]{0}[/]", leyenda);

    //Title Chart
    var title = chart.titles.create();
    title.text = titulo;
    title.fontSize = 15;
    title.marginBottom = 30;
    title.fontWeight = 600;
    title.align = "center";

    chart.data = dataAPI;

    var series = chart.series.push(new am4charts.PieSeries3D());
    series.dataFields.value = "cantidad";
    series.dataFields.category = "categoria";
    series.labels.template.text = "{value.percent.formatNumber('#.0')}%";
    //series.legendSettings.valueText = "{value}";
}