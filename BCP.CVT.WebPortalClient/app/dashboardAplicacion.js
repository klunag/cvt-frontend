var $tablePromedio1 = $("#tblPromedioSituacionActual");
var $tablePromedio2 = $("#tblPromedioProyeccion1");
var $tablePromedio3 = $("#tblPromedioProyeccion2");

var $tableAplicaciones1 = $("#tblSituacionActual");
var $tableAplicaciones2 = $("#tblProyeccion1");
var $tableAplicaciones3 = $("#tblProyeccion2");

var URL_API_VISTA = URL_API + "/Dashboard/Aplicacion";

var DATA_COMBO_APLICACIONES = [];

const arrMultiSelect = [
    { SelectId: "#cbFilGestionadoPor", DataField: "GestionadoPor" },
    { SelectId: "#cbFilEstadoAplicacion", DataField: "EstadoAplicacion" }
];
$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));

    //SetItems([], $("#cbFilGestionadoPor"), TEXTO_SELECCIONE);
    //SetItems([], $("#cbFilEstadoAplicacion"), TEXTO_SELECCIONE);
    SetItemsMultiple([], $("#cbFilUsuarioLider"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbFilAutorizador"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbFilExpertoEspecialista"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbFilAplicacion"), TEXTO_TODOS, TEXTO_TODOS, true);

    CargarCombos();

    $("#cbFilGestionadoPor").change(CargarCombosGestionadoPor);
    $("#btnBuscarAplicaciones").click(CargarComboAplicacion);

    $tablePromedio1.bootstrapTable("destroy");
    $tablePromedio1.bootstrapTable({ data: [] });

    $tablePromedio2.bootstrapTable("destroy");
    $tablePromedio2.bootstrapTable({ data: [] });

    $tablePromedio3.bootstrapTable("destroy");
    $tablePromedio3.bootstrapTable({ data: [] });


    $("#cbFilEstadoAplicacion").change(function () {
        let valFiltro = CaseIsNullSendFilter($("#cbFilEstadoAplicacion").val());
        if (valFiltro) {
            let dataFilter = DATA_COMBO_APLICACIONES.filter(x => valFiltro.includes(x.TipoDescripcion));

            SetItemsMultiple(dataFilter, $("#cbFilAplicacion"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
        } else
            SetItemsMultiple(DATA_COMBO_APLICACIONES, $("#cbFilAplicacion"), TEXTO_SELECCIONE, TEXTO_TODOS, true);

    });

    validarFormAplicacion();

});

function CargarCombos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success")
                if (dataObject !== null)
                    SetItemsMultiple(dataObject.GestionadoPor, $("#cbFilGestionadoPor"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
            //SetItems(dataObject.GestionadoPor, $("#cbFilGestionadoPor"), TEXTO_SELECCIONE);

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            waitingDialog.hide();
        },
        async: true
    });
}


function CargarCombosGestionadoPor() {
    let data = {
        GestionadoPorFiltrar: CaseIsNullSendFilter($("#cbFilGestionadoPor").val()),
    };

    $.ajax({
        url: URL_API_VISTA + "/ListarCombos/GestionadoPor",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    SetItemsMultiple(dataObject.UsuarioLider, $("#cbFilUsuarioLider"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.UsuarioAutorizador, $("#cbFilAutorizador"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.ExpertoEspecialista, $("#cbFilExpertoEspecialista"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {

        },
        async: true
    });
}

function validarFormAplicacion() {

    $("#formAplicacion").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbFilGestionadoPor: {
                requiredSelect: true
            }
        },
        messages: {
            cbFilGestionadoPor: {
                requiredSelect: String.Format("Debes seleccionar la {0}.", "tribu")
            }
        }
        //errorPlacement: (error, element) => {
        //    if (element.attr('name') === "cbFilDominio" || element.attr('name') === "cbFilSubdominio") {
        //        element.parent().parent().append(error);
        //    } else {
        //        element.parent().append(error);
        //    }
        //},
    });
}


function CargarComboAplicacion() {

    if ($("#formAplicacion").valid()) {

        let data = {
            GestionadoPorFiltrar: CaseIsNullSendFilter($("#cbFilGestionadoPor").val()),
            UsuarioLiderFiltrar: $("#cbFilUsuarioLider").val(),
            UsuarioAutorizadorFiltrar: $("#cbFilAutorizador").val(),
            ExpertoEspecialistaFiltrar: $("#cbFilExpertoEspecialista").val()
        };

        $.ajax({
            url: URL_API_VISTA + "/ListarCombos/Aplicaciones",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        //SetItems(dataObject.EstadoAplicacion, $("#cbFilEstadoAplicacion"), TEXTO_TODOS);
                        SetItemsMultiple(dataObject.EstadoAplicacion, $("#cbFilEstadoAplicacion"), TEXTO_TODOS, TEXTO_TODOS, true);
                        DATA_COMBO_APLICACIONES = dataObject.CodigoAPT;
                        SetItemsMultiple(DATA_COMBO_APLICACIONES, $("#cbFilAplicacion"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function () {

            },
            async: true
        });
    }
}



function GetReporte() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    let data = {
        CodigoAPTFiltrar: $("#cbFilAplicacion").val()
    };

    $.ajax({
        url: URL_API_VISTA + "/Reporte",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    InitAmchartHorizontalBar(dataObject.DataBarras);

                    GenerarGraficosPromediosAplicaciones(dataObject);
                    GenerarGraficosAplicaciones(dataObject);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            $("#divGraficos").show();
            waitingDialog.hide();
        },
        async: true
    });
}


function InitAmchartHorizontalBar(dataAPI) {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    var chart = am4core.create("reportHorizontalBar", am4charts.XYChart);

    // Add data
    chart.data = dataAPI;
    // Create axes
    var yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    yAxis.dataFields.category = "Descripcion";
    yAxis.renderer.grid.template.location = 0;
    yAxis.renderer.labels.template.fontSize = 10;
    yAxis.renderer.minGridDistance = 10;
    yAxis.renderer.cellStartLocation = 0.15;
    yAxis.renderer.cellEndLocation = 0.85;

    var xAxis = chart.xAxes.push(new am4charts.ValueAxis());

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueX = "Valor";
    series.dataFields.categoryY = "Descripcion";
    series.columns.template.tooltipText = "{categoryY}: [bold]{valueX}[/]";
    series.columns.template.strokeWidth = 0;
    series.columns.template.propertyFields.fill = "Color";

    chart.cursor = new am4charts.XYCursor();
}

function GenerarGraficosPromediosAplicaciones(data) {
    var dataPromedioAplicaciones = data.DataPromedioAplicaciones;

    //PROMEDIOS
    //SITUACION ACTUAL
    var dataSituacionActual = dataPromedioAplicaciones.filter(x => x.Id == "1");
    $tablePromedio1.bootstrapTable("destroy");
    $tablePromedio1.bootstrapTable({ data: dataSituacionActual });

    InitPlotlyPromedio(dataSituacionActual, "divPlotlyPromedioSituacionActual", '<b>Obsolescencia de un grupo de Aplicaciones (Situación actual)</b>');


    //PROYECCION 1 (12 MESES)
    var dataProyeccion1 = dataPromedioAplicaciones.filter(x => x.Id == "2");
    $tablePromedio2.bootstrapTable("destroy");
    $tablePromedio2.bootstrapTable({ data: dataProyeccion1 });

    var title = String.Format('<b>Obsolescencia de un grupo de Aplicaciones (Proyección {0} meses)</b>', data.Proyeccion1Meses);
    $("#lblPromedioProyeccion1").html(String.Format("Situación Proyección {0} meses", data.Proyeccion1Meses));
    InitPlotlyPromedio(dataProyeccion1, "divPlotlyPromedioProyeccion1", title);

    //PROYECCION 2 (24 MESES)
    var dataProyeccion2 = dataPromedioAplicaciones.filter(x => x.Id == "3");
    $tablePromedio3.bootstrapTable("destroy");
    $tablePromedio3.bootstrapTable({ data: dataProyeccion2 });

    title = String.Format('<b>Obsolescencia de un grupo de Aplicaciones (Proyección {0} meses)</b>', data.Proyeccion2Meses);
    $("#lblPromedioProyeccion2").html(String.Format("Situación Proyección {0} meses", data.Proyeccion2Meses));
    InitPlotlyPromedio(dataProyeccion2, "divPlotlyPromedioProyeccion2", title);
}

function InitPlotlyPromedio(dataAPI, div, title) {

    var dataPlotly = [];

    $.each(dataAPI, function (i, item) {
        dataPlotly.push(
            {
                x: [item.X],
                y: [item.Y],
                mode: 'markers',
                type: 'scatter',
                name: 'Team A',
                text: [item.Value],
                marker: { size: 12, color: 'rgb(0, 0, 0)' },
                layer: "above traces"
                //textsrc: "tarzzz:616:bafb6b",
                //xsrc: "tarzzz:616:512d04",
                //ysrc: "tarzzz:616:da6e5c"
            }
        );
    });


    var layout = {
        showlegend: false,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        shapes: [
            {
                fillcolor: "rgba(255,255,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 0.0,
                y1: 1.25
            },
            {
                fillcolor: "rgba(255,255,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 2.5,
                y1: 1.25
            },
            {
                fillcolor: "rgba(255,255,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 0.0,
                y1: 1.25
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 0.0,
                y1: 1.25
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 0.0,
                y1: 1.25
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 2.5,
                y1: 3.75
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 3.75,
                y1: 5.0
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 1.25,
                y1: 2.5
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 1.25,
                y1: 2.5
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 1.25,
                y1: 2.5
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 2.5,
                y1: 3.75
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 2.5,
                y1: 3.75
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 3.75,
                y1: 5.0
            },
            {
                fillcolor: "rgba(255,0,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 2.5,
                y1: 3.75
            },
            {
                fillcolor: "rgba(255,0,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 3.75,
                y1: 5.0
            },
            {
                fillcolor: "rgba(255,0,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 3.75,
                y1: 5.0
            },
        ],
        xaxis: {
            fixedrange: true,
            showgrid: false,
            zeroline: false,
            title: {
                text: 'Riesgo de obsolescencia del grupo',
                font: {
                    size: 12,
                    family: 'Roboto,sans-serif'
                }
            },

        },
        yaxis: {
            fixedrange: true,
            showgrid: false,
            zeroline: false,
            title: {
                text: 'Índice de obsolescencia del grupo',
                font: {
                    size: 12,
                    family: 'Roboto,sans-serif'
                }
            }
        },
        title: title,
        titlefont: {
            size: 16,
            family: 'Roboto,sans-serif'
        },
        height: 360,
        hovermode: "closest",
        margin: {
            l: 60,
            r: 75,
            b: 60,
            t: 60
        }
    };

    Plotly.newPlot(div, dataPlotly, layout, { showSendToCloud: true, displayModeBar: false });

    //2DO GRAFICO (VA ENCIMA)
    var dataPlotly2 = [];

    $.each(dataAPI, function (i, item) {
        dataPlotly2.push(
            {
                x: [item.X],
                y: [item.Y],
                mode: 'markers',
                type: 'scatter',
                name: 'Team A',
                text: [item.Value],
                marker: { size: 12, color: 'rgb(0, 0, 0)' },
            }
        );
    });

    var layout2 = {
        showlegend: false,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        shapes: [
            {
                line: { width: 0 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 0.0,
                y1: 1.25,

            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 2.5,
                y1: 1.25,

            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 0.0,
                y1: 1.25,

            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 0.0,
                y1: 1.25,

            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 0.0,
                y1: 1.25,

            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 2.5,
                y1: 3.75,

            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 3.75,
                y1: 5.0,

            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 1.25,
                y1: 2.5
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 1.25,
                y1: 2.5
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 1.25,
                y1: 2.5
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 2.5,
                y1: 3.75
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 2.5,
                y1: 3.75
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 3.75,
                y1: 5.0
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 2.5,
                y1: 3.75
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 3.75,
                y1: 5.0
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 3.75,
                y1: 5.0
            }
        ],

        xaxis: {
            fixedrange: true,
            showgrid: false,
            zeroline: false,
            ticks: '',
            showticklabels: false
        },
        yaxis: {
            fixedrange: true,
            showgrid: false,
            zeroline: false,
            ticks: '',
            showticklabels: false
        },
        height: 360,
        hovermode: "closest",
        margin: {
            l: 60,
            r: 75,
            b: 60,
            t: 60
        }
    };

    Plotly.newPlot(div + "_alt", dataPlotly2, layout2, { showSendToCloud: true, displayModeBar: false });

}


function GenerarGraficosAplicaciones(data) {

    var dataAplicaciones = data.DataAplicaciones;

    //SITUACION ACTUAL
    var dataSituacionActual = dataAplicaciones.filter(x => x.Id == "1");
    $tableAplicaciones1.bootstrapTable("destroy");
    $tableAplicaciones1.bootstrapTable({ data: dataSituacionActual });

    InitPlotlyAplicaciones(dataSituacionActual, "divPlotlySituacionActual", '<b>Obsolescencia de Aplicaciones (Situación actual)</b>');


    //PROYECCION 1 (12 MESES)
    var dataProyeccion1 = dataAplicaciones.filter(x => x.Id == "2");
    $tableAplicaciones2.bootstrapTable("destroy");
    $tableAplicaciones2.bootstrapTable({ data: dataProyeccion1 });

    var title = String.Format('<b>Obsolescencia de Aplicaciones (Proyección {0} meses)</b>', data.Proyeccion1Meses);
    $("#lblProyeccion1").html(String.Format("Situación Proyección {0} meses", data.Proyeccion1Meses));
    InitPlotlyAplicaciones(dataProyeccion1, "divPlotlyProyeccion1", title);

    //PROYECCION 2 (24 MESES)
    var dataProyeccion2 = dataAplicaciones.filter(x => x.Id == "3");
    $tableAplicaciones3.bootstrapTable("destroy");
    $tableAplicaciones3.bootstrapTable({ data: dataProyeccion2 });

    title = String.Format('<b>Obsolescencia de Aplicaciones (Proyección {0} meses)</b>', data.Proyeccion2Meses);
    $("#lblProyeccion2").html(String.Format("Situación Proyección {0} meses", data.Proyeccion2Meses));
    InitPlotlyAplicaciones(dataProyeccion2, "divPlotlyProyeccion2", title);
}

function InitPlotlyAplicaciones(dataAPI, div, title) {

    var dataPlotly = [];
    //var dataAnotations = [];

    $.each(dataAPI, function (i, item) {
        dataPlotly.push(
            {
                x: [item.X],
                y: [item.Y],
                mode: 'markers+text',
                type: 'scatter',
                name: "",
                text: [item.Value],
                textposition: 'bottom',
                marker: { size: 9, color: item.Color }
                //marker: { size: 9, color: 'rgb(1, 45, 116)' }
                //textsrc: "tarzzz:616:bafb6b",
                //xsrc: "tarzzz:616:512d04",
                //ysrc: "tarzzz:616:da6e5c"
            }
        );


    });


    var layout = {
        showlegend: false,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        shapes: [
            {
                fillcolor: "rgba(255,255,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 0.0,
                y1: 1.25
            },
            {
                fillcolor: "rgba(255,255,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 2.5,
                y1: 1.25,

            },
            {
                fillcolor: "rgba(255,255,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 0.0,
                y1: 1.25,

            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 0.0,
                y1: 1.25,

            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 0.0,
                y1: 1.25,

            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 2.5,
                y1: 3.75,

            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 3.75,
                y1: 5.0,

            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 1.25,
                y1: 2.5
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 1.25,
                y1: 2.5
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 1.25,
                y1: 2.5
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 2.5,
                y1: 3.75
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 2.5,
                y1: 3.75
            },
            {
                fillcolor: "rgba(255,192,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 3.75,
                y1: 5.0
            },
            {
                fillcolor: "rgba(255,0,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 2.5,
                y1: 3.75
            },
            {
                fillcolor: "rgba(255,0,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 3.75,
                y1: 5.0
            },
            {
                fillcolor: "rgba(255,0,0,0.5)",
                line: { width: 1 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 3.75,
                y1: 5.0
            }
        ],
        xaxis: {
            fixedrange: true,
            showgrid: false,
            zeroline: false,
            title: {
                text: 'Riesgo de obsolescencia',
                font: {
                    size: 12,
                    family: 'Roboto,sans-serif'
                }
            },

        },
        yaxis: {
            fixedrange: true,
            showgrid: false,
            zeroline: false,
            title: {
                text: 'Índice de obsolescencia',
                font: {
                    size: 12,
                    family: 'Roboto,sans-serif'
                }
            }
        },
        title: title,
        titlefont: {
            size: 16,
            family: 'Roboto,sans-serif'
        },
        height: 400,
        hovermode: "closest",
        margin: {
            l: 60,
            r: 75,
            b: 60,
            t: 60
        }
    };

    Plotly.newPlot(div, dataPlotly, layout, { showSendToCloud: true, displayModeBar: false });

    //2DO GRAFICO (VA ENCIMA)
    var dataPlotly2 = [];

    $.each(dataAPI, function (i, item) {
        dataPlotly2.push(
            {
                x: [item.X],
                y: [item.Y],
                mode: 'markers+text',
                type: 'scatter',
                name: "",
                text: [item.Value],
                textposition: 'bottom',
                marker: { size: 9, color: item.Color }
            }
        );
    });

    var layout2 = {
        showlegend: false,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        shapes: [
            {
                line: { width: 0 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 0.0,
                y1: 1.25
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 2.5,
                y1: 1.25
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 0.0,
                y1: 1.25
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 0.0,
                y1: 1.25
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 0.0,
                y1: 1.25,

            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 2.5,
                y1: 3.75,

            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 0.0,
                x1: 1.25,
                y0: 3.75,
                y1: 5.0,

            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 1.25,
                y1: 2.5
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 1.25,
                y1: 2.5
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 1.25,
                y1: 2.5
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 2.5,
                y1: 3.75
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 2.5,
                y1: 3.75
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 1.25,
                x1: 2.5,
                y0: 3.75,
                y1: 5.0
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 2.5,
                y1: 3.75
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 2.5,
                x1: 3.75,
                y0: 3.75,
                y1: 5.0
            },
            {
                line: { width: 0 },
                type: "rect",
                x0: 3.75,
                x1: 5.0,
                y0: 3.75,
                y1: 5.0
            }
        ],

        xaxis: {
            fixedrange: true,
            showgrid: false,
            zeroline: false,
            ticks: '',
            showticklabels: false
        },
        yaxis: {
            fixedrange: true,
            showgrid: false,
            zeroline: false,
            ticks: '',
            showticklabels: false
        },
        height: 400,
        hovermode: "closest",
        margin: {
            l: 60,
            r: 75,
            b: 60,
            t: 60
        }
    };

    Plotly.newPlot(div + "_alt", dataPlotly2, layout2, { showSendToCloud: true, displayModeBar: false });

}


function formatterEstadoObs(value) {
    var html = '<button type="button" class="btn btn-{0} btn-circle btn-circle-sm" style="cursor: inherit"></button>';

    if (value > 0) {
        html = String.Format(html, "danger");
    } else {
        html = String.Format(html, "success");
    }
    return html;
}

function linkFormatterAplicacion(value, row, index) {
    return `<a href="/Vista/DetalleAplicacion?id=${row.Value}" title="Ver detalle de la aplicación" target="_blank">${value}</a>`;
}