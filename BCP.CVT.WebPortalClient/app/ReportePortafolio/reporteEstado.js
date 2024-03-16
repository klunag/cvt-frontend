var URL_API_VISTA = URL_API + "/reportesportfolio";
var parameters = { Area: 0, Estado: 0, Tipo: 0, Division: 0, Gerencia: 0 };
var $table = $("#tblRegistro");
var $tableRoles = $("#tblRoles");
var titTipos = "";

const arrMultiSelect = [
    { SelectId: "#cbFiltroEstado", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlTipoActivo", DataField: "ClasificacionTecnica" }
];

$(function () {
    initEvents();
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    CargarCombos();
    //validarFiltroPeriodo();
});

function initEvents() {
    $("#cbFiltroGerencia, #cbFiltroDivision, #cbFiltroArea").each(function () {
        $(this).append($("<option />").val("-1").text(TEXTO_SELECCIONE));
    });


    $("#cbFiltroGerencia").change(DdlGerencia_Change);
    $("#cbFiltroDivision").change(DdlDivision_Change);
    //Event
    $("#cbFiltroArea").change(function () { parameters.Area = $(this).val() });
    $("#cbFiltroEstado").change(function () { parameters.Estado = $(this).val() });
    $("#ddlTipoActivo").change(function () { parameters.Tipo = $(this).val() });

    $("#btnBuscar").click(function () { GenerarReporte(true) });
    $("#btnExportar").click(ExportarInfo);

    $("#btnExportarReporte1").click(function () {
        var titulo = `Distribución de aplicaciones {${titTipos}} en el banco`;
        ExportarReporte(REPORTE_DISTRIBUCION_APLICACION_BANCO, titulo);
    });
    $("#btnExportarReporte2").click(function () {
        var titulo = `Distribución de aplicaciones {${titTipos}} en la unidad jerárquica seleccionada`;
        ExportarReporte(REPORTE_DISTRIBUCION_APLICACION, titulo);
    });
    $("#btnExportarReporte3").click(function () {
        var titulo = `Distribución de aplicaciones {${titTipos}} en la unidad jerárquica seleccionada: por estado`;
        ExportarReporte(REPORTE_DISTRIBUCION_APLICACION_ESTADO, titulo);
    });
    $("#btnExportarReporte4").click(function () {
        var titulo = `Distribución de aplicaciones {${titTipos}} en la unidad jerárquica seleccionada: por criticidad`;
        ExportarReporte(REPORTE_DISTRIBUCION_APLICACION_CRITICIDAD, titulo);
    });
    $("#btnExportarReporte5").click(function () {
        var titulo = `Distribución de aplicaciones {${titTipos}} en la unidad jerárquica seleccionada: por categoría tecnológica`;
        ExportarReporte(REPORTE_DISTRIBUCION_APLICACION_CATEGORIA, titulo);
    });
    $("#btnExportarReporte6").click(function () {
        var titulo = `Salud de aplicaciones {${titTipos}} en la unidad jerárquica seleccionada`;
        ExportarReporte(REPORTE_SALUD_APLICACION_ID, titulo);
    });
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
                    SetItems(dataObject.Gerencia.filter(x => x !== "" && x !== null), $("#cbFiltroGerencia"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.TipoActivo.filter(x => x !== "" && x !== null), $("#ddlTipoActivo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.EstadoAplicacion, $("#cbFiltroEstado"), TEXTO_TODOS, TEXTO_TODOS, true);

                    //SetItemsMultiple(dataObject.Division.filter(x => x !== "" && x !== null), $("#cbFiltroDivision"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Area.filter(x => x !== "" && x !== null), $("#cbFiltroArea"), TEXTO_TODOS, TEXTO_TODOS, true);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function DdlGerencia_Change() {
    let ddlVal = $(this).val();

    if (ddlVal && ddlVal !== "-1") {
        SetItems([], $("#cbFiltroArea"), TEXTO_SELECCIONE);
        InitSelectBuilder(ddlVal, $("#cbFiltroDivision"), "/reportesportfolio/reporte/estado/listDivisionbyGerencia");
    } else {
        SetItems([], $("#cbFiltroArea"), TEXTO_SELECCIONE);
        SetItems([], $("#cbFiltroDivision"), TEXTO_SELECCIONE);

    }

    parameters.Gerencia = ddlVal;
}
function DdlDivision_Change() {
    let ddlVal = $(this).val();

    if (ddlVal && ddlVal !== "-1") {
        InitSelectBuilder(ddlVal, $("#cbFiltroArea"), "/reportesportfolio/reporte/estado/listAreabyDivision");
    } else {
        SetItems([], $("#cbFiltroArea"), TEXTO_SELECCIONE);
    }
    parameters.Division = ddlVal;
}

function InitSelectBuilder(filtro, $ddl, urlGet) {
    if (filtro !== null && filtro !== "-1") {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: URL_API + `${urlGet}?id=${filtro}`,
            dataType: "json",
            async: false,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        SetItems(dataObject, $ddl, TEXTO_SELECCIONE);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function CargarReporte(dataReport, flgChange, titleY) {
    if (flgChange) {
        $("#report1, #report2, #report3, #report4, #report5, #report6").empty();
        $("#report1, #report2, #report3, #report4, #report5, #report6").show();
        $("#report1_alerta, #report2_alerta, #report3_alerta, #report4_alerta, #report5_alerta, #report6_alerta").hide();
        $(".div-report").show();
        let dataGrafico = [];

        titTipos = $('#ddlTipoActivo option:selected').length == 0 ? "Todas" : $('#ddlTipoActivo option:selected').toArray().map(item => item.text).join(", ");

        $.each(dataReport.AplicacionesBancarias, function (i, item) {
            dataGrafico.push({ Gerencia: item.Grupo, Distribucion: item.Valor });
        });

        InitAmchartv4_Grafico_1(dataGrafico);

        dataGrafico = [];
        $.each(dataReport.AplicacionesXJerarquia, function (i, item) {
            dataGrafico.push({ Grupo: item.Grupo, Valor: item.Valor });
        });
        InitAmchartv4_Grafico_2(dataGrafico, titleY);

        dataGrafico = [];
        $.each(dataReport.AplicacionesXEstado, function (i, item) {
            dataGrafico.push({ Grupo: item.Grupo, Valor: item.Valor });
        });
        InitAmchartv4_Grafico_3(dataGrafico);

        dataGrafico = [];
        $.each(dataReport.AplicacionesXCriticidad, function (i, item) {
            dataGrafico.push({ Grupo: item.Grupo, Valor: item.Valor });
        });
        InitAmchartv4_Grafico_4(dataGrafico);

        dataGrafico = [];
        $.each(dataReport.AplicacionesXCategoriaTecnologica, function (i, item) {
            dataGrafico.push({ Grupo: item.Grupo, Valor: item.Valor });
        });
        InitAmchartv4_Grafico_5(dataGrafico);

        dataGrafico = [];
        $.each(dataReport.SaludAplicacionesXUnidad, function (i, item) {
            dataGrafico.push({ Grupo: item.Grupo, Valor: item.Valor });
        });
        InitAmchartv4_Grafico_6(dataGrafico);

    }

    waitingDialog.hide();
    $("#tableAplicaciones").show();
    return { rows: dataReport.Rows, total: dataReport.Total };
}

function InitAmchartv4_Grafico_1(dataAPI) {
    if (dataAPI != null && dataAPI.length > 0) {
        am4core.useTheme(am4themes_animated);

        var chart = am4core.create("report1", am4charts.PieChart);
        chart.data = dataAPI;

        var titulo = `Distribución de aplicaciones {${titTipos}} en el banco`;
        $("#divReporte1 h4").html(titulo);

        ExportChart(chart, titulo);

        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "Distribucion";
        pieSeries.dataFields.category = "Gerencia";

        chart.innerRadius = am4core.percent(40);

        pieSeries.slices.template.stroke = am4core.color("#fff");
        pieSeries.slices.template.strokeWidth = 2;
        pieSeries.slices.template.strokeOpacity = 1;
        pieSeries.slices.template.cursorOverStyle = [
            {
                "property": "cursor",
                "value": "pointer"
            }
        ];

        //pieSeries.alignLabels = false;
        //pieSeries.labels.template.bent = true;
        //pieSeries.labels.template.radius = 3;
        //pieSeries.labels.template.padding(0, 0, 0, 0);
        //pieSeries.ticks.template.disabled = true;

        var shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
        shadow.opacity = 0;

        var hoverState = pieSeries.slices.template.states.getKey("hover");

        var hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
        hoverShadow.opacity = 0.7;
        hoverShadow.blur = 5;

        pieSeries.labels.template.fontSize = 10;
        pieSeries.labels.template.maxWidth = 185;
        pieSeries.labels.template.wrap = true;
        pieSeries.labels.template.text = "{category}: {value.percent.formatNumber('#.0')}% ({value})";

        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        chart.legend.fontSize = 10;
        chart.legend.labels.template.fontSize = 10;
        chart.legend.width = 400;
        chart.legend.labels.template.maxWidth = 350;
        chart.legend.labels.template.truncate = false;
        chart.legend.labels.template.wrap = true;
        chart.legend.scrollable = true;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;

        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 13;
        markerTemplate.height = 13;
        //chart.legend.itemContainers.template.tooltipText = "{category}";

    } else {
        $("#report1_alerta").show();
        $("#report1").hide();
    }

}

function InitAmchartv4_Grafico_2(dataAPI, titleY) {
    if (dataAPI != null && dataAPI.length > 0) {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        var chart = am4core.create("report2", am4charts.XYChart);


        var titulo = `Distribución de aplicaciones {${titTipos}} en la unidad jerárquica seleccionada`;
        $("#divReporte2 h4").html(titulo);

        ExportChart(chart, titulo);


        // Add data
        chart.data = dataAPI;
        chart.maskBullets = false;
        chart.paddingRight = 100;
        //chart.marginRight = 300;

        // Create axes
        var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "Grupo";
        categoryAxis.title.text = titleY;

        categoryAxis.renderer.minGridDistance = 10;
        categoryAxis.renderer.cellStartLocation = 0.2;
        categoryAxis.renderer.cellEndLocation = 0.8;
        categoryAxis.renderer.grid.template.location = 0;

        //categoryAxis.numberFormatter.numberFormat = "#";
        categoryAxis.renderer.inversed = true;
        let label = categoryAxis.renderer.labels.template;
        label.wrap = true;
        label.maxWidth = 380;
        label.fontSize = 10;


        var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
        valueAxis.title.text = "Aplicaciones";
        valueAxis.maxPrecision = 0;
        //valueAxis.renderer.grid.template.opacity = 0;

        let label2 = valueAxis.renderer.labels.template;
        label2.wrap = true;
        label2.fontSize = 10;

        // Create series
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueX = "Valor";
        series.dataFields.categoryY = "Grupo";

        series.name = "Valor";
        series.columns.template.propertyFields.fill = "color";
        series.columns.template.tooltipText = "{valueX}";
        series.columns.template.column.stroke = am4core.color("#fff");
        series.columns.template.column.strokeOpacity = 0.2;
        series.columns.template.fontSize = 10;

        var labelBullet = series.bullets.push(new am4charts.LabelBullet())
        labelBullet.label.horizontalCenter = "left";
        labelBullet.label.dx = 12;
        labelBullet.label.text = "{values.valueX.workingValue}";
        labelBullet.label.fontSize = 10;
        labelBullet.label.truncate = false;
        labelBullet.label.hideOversized = false;

        //labelBullet.locationX = 1;
        LabelCustomFormatter(labelBullet);

    } else {
        $("#report2_alerta").show();
        $("#report2").hide();
    }
}

function InitAmchartv4_Grafico_3(dataAPI) {
    if (dataAPI != null && dataAPI.length > 0) {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        var chart = am4core.create("report3", am4charts.PieChart);


        var titulo = `Distribución de aplicaciones {${titTipos}}  en la unidad jerárquica seleccionada: por estado`;
        $("#divReporte3 h4").html(titulo);

        ExportChart(chart, titulo);

        // Add data
        chart.data = dataAPI;

        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "Valor";
        pieSeries.dataFields.category = "Grupo";
        pieSeries.slices.template.stroke = am4core.color("#fff");
        pieSeries.slices.template.strokeOpacity = 1;

        pieSeries.labels.template.fontSize = 11;
        pieSeries.labels.template.maxWidth = 105;
        pieSeries.labels.template.wrap = true;
        pieSeries.labels.template.text = "{category}\n{value.percent.formatNumber('#.0')}% ({value})";
        // This creates initial animation
        pieSeries.hiddenState.properties.opacity = 1;
        pieSeries.hiddenState.properties.endAngle = -90;
        pieSeries.hiddenState.properties.startAngle = -90;

        //chart.hiddenState.properties.radius = am4core.percent(0);
        chart.radius = am4core.percent(65);
        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        chart.legend.labels.template.fontSize = 11;
        chart.legend.labels.template.truncate = false;
        chart.legend.labels.template.wrap = true;
        chart.legend.fontSize = 11;

        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 15;
        markerTemplate.height = 15;
    } else {
        $("#report3_alerta").show();
        $("#report3").hide();
    }
}

function InitAmchartv4_Grafico_4(dataAPI) {
    if (dataAPI != null && dataAPI.length > 0) {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        var chart = am4core.create("report4", am4charts.XYChart);

        var titulo = `Distribución de aplicaciones {${titTipos}}  en la unidad jerárquica seleccionada: por criticidad`;
        $("#divReporte4 h4").html(titulo);

        ExportChart(chart, titulo);

        // Add data
        chart.data = dataAPI;

        // Create axes
        var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "Grupo";
        categoryAxis.title.text = "Criticidad";
        //categoryAxis.numberFormatter.numberFormat = "#";
        categoryAxis.renderer.minGridDistance = 10;
        categoryAxis.renderer.cellStartLocation = 0.2;
        categoryAxis.renderer.cellEndLocation = 0.8;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.inversed = true;
        let label = categoryAxis.renderer.labels.template;
        label.fontSize = 10;

        var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
        valueAxis.title.text = "Aplicaciones";
        valueAxis.maxPrecision = 0;
        let label2 = valueAxis.renderer.labels.template;
        label2.wrap = true;
        label2.fontSize = 10;

        // Create series
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueX = "Valor";
        series.dataFields.categoryY = "Grupo";
        series.name = "Valor";
        series.columns.template.propertyFields.fill = "color";
        series.columns.template.tooltipText = "{valueX}";
        series.columns.template.column.stroke = am4core.color("#fff");
        series.columns.template.column.strokeOpacity = 0.2;

        var labelBullet = series.bullets.push(new am4charts.LabelBullet())
        labelBullet.label.horizontalCenter = "left";
        labelBullet.label.dx = 13;
        labelBullet.label.text = "{values.valueX.workingValue}";
        labelBullet.label.fontSize = 10;
        labelBullet.label.truncate = false;
        labelBullet.label.hideOversized = false;
        //labelBullet.locationX = 1;
        LabelCustomFormatter(labelBullet);
    } else {
        $("#report4_alerta").show();
        $("#report4").hide();
    }
}

function InitAmchartv4_Grafico_5(dataAPI) {
    if (dataAPI != null && dataAPI.length > 0) {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        var chart = am4core.create("report5", am4charts.XYChart);

        var titulo = `Distribución de aplicaciones {${titTipos}} en la unidad jerárquica seleccionada: por categoría tecnológica`;
        $("#divReporte5 h4").html(titulo);

        ExportChart(chart, titulo);

        // Add data
        chart.data = dataAPI;

        // Create axes
        var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "Grupo";
        categoryAxis.title.text = "Categoría tecnológica";
        //categoryAxis.numberFormatter.numberFormat = "#";
        categoryAxis.renderer.inversed = true;
        categoryAxis.renderer.minGridDistance = 10;
        categoryAxis.renderer.cellStartLocation = 0.2;
        categoryAxis.renderer.cellEndLocation = 0.8;
        categoryAxis.renderer.grid.template.location = 0;

        let label = categoryAxis.renderer.labels.template;
        label.fontSize = 10;

        var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
        valueAxis.title.text = "Aplicaciones";
        valueAxis.maxPrecision = 0;
        let label2 = valueAxis.renderer.labels.template;
        label2.wrap = true;
        label2.fontSize = 10;

        // Create series
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueX = "Valor";
        series.dataFields.categoryY = "Grupo";
        series.name = "Valor";
        series.columns.template.propertyFields.fill = "color";
        series.columns.template.tooltipText = "{valueX}";
        series.columns.template.column.stroke = am4core.color("#fff");
        series.columns.template.column.strokeOpacity = 0.2;
        series.columns.template.fontSize = 11;

        var labelBullet = series.bullets.push(new am4charts.LabelBullet())
        labelBullet.label.horizontalCenter = "left";
        labelBullet.label.dx = 13;
        labelBullet.label.text = "{values.valueX.workingValue}";
        labelBullet.label.fontSize = 10;
        labelBullet.label.truncate = false;
        labelBullet.label.hideOversized = false;
        //labelBullet.locationX = 1;
        LabelCustomFormatter(labelBullet);
    } else {
        $("#report5_alerta").show();
        $("#report5").hide();
    }
}

function InitAmchartv4_Grafico_6(dataAPI) {
    if (dataAPI != null && dataAPI.length > 0) {
        am4core.useTheme(am4themes_animated);

        var chart = am4core.create("report6", am4charts.PieChart);

        var titulo = `Salud de aplicaciones {${titTipos}} en la unidad jerárquica seleccionada`;
        $("#divReporte6 h4").html(titulo);

        ExportChart(chart, titulo);


        chart.data = dataAPI;


        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "Valor";
        pieSeries.dataFields.category = "Grupo";
        pieSeries.labels.template.fontSize = 11;
        pieSeries.labels.template.maxWidth = 135;
        pieSeries.labels.template.wrap = true;
        pieSeries.labels.template.text = "{category}\n{value.percent.formatNumber('#.00')}%";

        chart.radius = am4core.percent(70);
        chart.innerRadius = am4core.percent(30);

        pieSeries.slices.template.stroke = am4core.color("#fff");
        pieSeries.slices.template.strokeWidth = 2;
        pieSeries.slices.template.strokeOpacity = 1;
        pieSeries.slices.template.cursorOverStyle = [
            {
                "property": "cursor",
                "value": "pointer"
            }
        ];

        pieSeries.alignLabels = false;
        pieSeries.legendSettings.valueText = "{value.percent.formatNumber('#.00')}%";
        //pieSeries.labels.template.bent = true;
        //pieSeries.labels.template.radius = 3;
        //pieSeries.labels.template.padding(0, 0, 0, 0);
        //pieSeries.ticks.template.disabled = true;

        var shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
        shadow.opacity = 0;

        var hoverState = pieSeries.slices.template.states.getKey("hover");

        var hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
        hoverShadow.opacity = 0.7;
        hoverShadow.blur = 5;

        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";


        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 15;
        markerTemplate.height = 15;
    } else {
        $("#report6_alerta").show();
        $("#report6").hide();
    }
}

function GenerarReporte() {
    ListarRegistros(true);
    ListarRegistrosRoles();
}
function ListarRegistros(flgChange = false) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    let obj = {
        Area: $("#cbFiltroDivision").val(),
        Estado: $("#cbFiltroEstado").val(),
        Tipo: $("#ddlTipoActivo").val(),
        Division: $("#cbFiltroDivision").val(),
        Gerencia: $("#cbFiltroGerencia").val()
    }

    var titleY = "";

    if (!flgChange) flgChange = (parameters == obj);

    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/reporte/estado/portafolio",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        sortName: "Codigo",
        sortOrder: "asc",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {

            reporte = {};
            reporte.pageNumber = p.pageNumber;
            reporte.pageSize = p.pageSize;
            reporte.sortName = p.sortName;
            reporte.sortOrder = p.sortOrder;

            reporte.TipoActivo = CaseIsNullSendExport($("#ddlTipoActivo").val());
            reporte.EstadoAplicacion = CaseIsNullSendExport($("#cbFiltroEstado").val());
            reporte.GerenciaId = $("#cbFiltroGerencia").val();
            reporte.DivisionId = $("#cbFiltroDivision").val();
            reporte.AreaId = $("#cbFiltroArea").val();
            reporte.FlgChange = flgChange;

            titleY = reporte.GerenciaId == "-1" && reporte.DivisionId == "-1" && reporte.AreaId == "-1" ? "Gerencias"
                : reporte.GerenciaId != "-1" && reporte.DivisionId == "-1" && reporte.AreaId == "-1" ? "Divisiones"
                    : reporte.GerenciaId != "-1" && reporte.DivisionId != "-1" && reporte.AreaId == "-1" ? "Áreas"
                        : "Unidades";

            return JSON.stringify(reporte);
        },
        responseHandler: function (res) {
            //waitingDialog.hide();
            var data = CargarReporte(res, flgChange, titleY);
            return data;
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


function ListarRegistrosRoles() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });


    $tableRoles.bootstrapTable('destroy');
    $tableRoles.bootstrapTable({
        url: URL_API_VISTA + "/reporte/estado/portafolio/roles",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        sortName: "NameManager",
        sortOrder: "asc",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            reporte = {};
            reporte.pageNumber = p.pageNumber;
            reporte.pageSize = p.pageSize;
            reporte.sortName = p.sortName;
            reporte.sortOrder = p.sortOrder;

            reporte.TipoActivo = CaseIsNullSendExport($("#ddlTipoActivo").val());
            reporte.EstadoAplicacion = CaseIsNullSendExport($("#cbFiltroEstado").val());
            reporte.GerenciaId = $("#cbFiltroGerencia").val();
            reporte.DivisionId = $("#cbFiltroDivision").val();
            reporte.AreaId = $("#cbFiltroArea").val();

            return JSON.stringify(reporte);
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

    $("#tableAplicacionesRoles").show();
}

function formatterCirculoVerde(value) {
    var formatBoton = '<button type="button" class="btn btn-{0} btn-circle btn-circle-sm" style="cursor: inherit"></button>';
    var html = "";

    if (value == 1) {

        html = String.Format(formatBoton, "success");
    }

    return html;
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Gerencia = $("#cbFiltroGerencia").val();
    DATA_EXPORTAR.Division = $("#cbFiltroDivision").val();
    DATA_EXPORTAR.Area = $("#cbFiltroDivision").val();
    DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFiltroEstado").val());
    DATA_EXPORTAR.TipoActivo = CaseIsNullSendExport($("#ddlTipoActivo").val());
    let url = `${URL_API_VISTA}/reporte/estado/portafolio/exportar?gerencia=${DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division}&area=${DATA_EXPORTAR.Area}&estado=${DATA_EXPORTAR.Estado}&tipoActivo=${DATA_EXPORTAR.TipoActivo}`;
    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/octetstream",
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

function ExportarReporte(typeReport, titulo) {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Gerencia = $("#cbFiltroGerencia").val();
    DATA_EXPORTAR.Division = $("#cbFiltroDivision").val();
    DATA_EXPORTAR.Area = $("#cbFiltroArea").val();
    DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFiltroEstado").val());
    DATA_EXPORTAR.TipoActivo = CaseIsNullSendExport($("#ddlTipoActivo").val());

    let url = `${URL_API_VISTA}/reporte/estado/portafolio/exportarData?gerencia=${DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division}&area=${DATA_EXPORTAR.Area}&estado=${DATA_EXPORTAR.Estado}&tipoActivo=${DATA_EXPORTAR.TipoActivo}&typeReport=${typeReport}&titulo=${titulo}`;
    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/octetstream",
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

function LabelCustomFormatter(bullet) {
    bullet.label.adapter.add("textOutput", function (text, target) {
        if (target.dataItem && target.dataItem.valueY == 0) {
            return "";
        }
        return text;
    });
}