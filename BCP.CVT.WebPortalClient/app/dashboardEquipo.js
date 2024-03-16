var $tableAplicacion = $("#tblAplicacion");
var $tableAplicacionProyeccion1 = $("#tblAplicacionProyeccion1");
var $tableAplicacionProyeccion2 = $("#tblAplicacionProyeccion2");


var $tableTecnologia = $("#tblTecnologia");
var $tableTecnologiaNoRegistrada = $("#tblTecnologiaNoRegistrada");


var URL_API_VISTA = URL_API + "/Dashboard/Equipo";
var DATA_SUBDOMINIO = [];
var DATA_APLICACIONES = [];

var PROYECCION_MESES_1 = 0;
var PROYECCION_MESES_2 = 0;

let funcion1 = function (event) {
    Change_cbFilDominio();
    ActualizarGrafico();
};

let funcion2 = function (event) {
    ActualizarGrafico();
};

$(function () {

    //UpdateItemsCombo([], $("#cbFilDominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE);
    //UpdateItemsCombo([], $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE);


    SetItemsMultipleEvent([], $("#cbFilDominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true, funcion1);
    SetItemsMultipleEvent([], $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true, funcion2);

    CargarCombos();
    $tableAplicacion.bootstrapTable("destroy");
    $tableAplicacion.bootstrapTable({ data: [] });
    $tableAplicacionProyeccion1.bootstrapTable("destroy");
    $tableAplicacionProyeccion1.bootstrapTable({ data: [] });
    $tableAplicacionProyeccion2.bootstrapTable("destroy");
    $tableAplicacionProyeccion2.bootstrapTable({ data: [] });

    $tableTecnologia.bootstrapTable("destroy");
    $tableTecnologia.bootstrapTable({ data: [] });
    $tableTecnologiaNoRegistrada.bootstrapTable("destroy");
    $tableTecnologiaNoRegistrada.bootstrapTable({ data: [] });

    InitAutocompletarEquipo($("#txtEquipo"), $("#hdEquipoId"), ".equipoContainer");

    $("#cbFilEstadoAplicacion").change(function () {
        var valFiltro = $("#cbFilEstadoAplicacion").val();
        if (valFiltro != -1) {
            var dataFilter = DATA_APLICACIONES.filter(x => x.FiltroEstado == valFiltro);

            SetearGraficosPlotly(dataFilter);
        } else {
            SetearGraficosPlotly(DATA_APLICACIONES);
        }

    });

    validarFormEquipo();

    //$('#cbFilDominio').multiselect({
    //    onDropdownHide: function (event) {
    //        Change_cbFilDominio();
    //        ActualizarGrafico();
    //    }
    //});



    //$("#cbFilSubdominio").change(function () {
    //    ActualizarGrafico();
    //});

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
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_SELECCIONE);

                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            waitingDialog.hide();
        },
        async: false
    });
}

function validarFormEquipo() {

    //$.validator.addMethod("existeID", function (value, element) {
    //    let estado = true;
    //    if ($.trim(value) !== "") {
    //        estado = ExisteID();
    //        return estado;
    //    }
    //    return estado;
    //});

    $("#formEquipo").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbFilTipoEquipo: {
                requiredSelect: true
            },
            txtEquipo: {
                requiredSinEspacios: true
            }
        },
        messages: {
            cbFilTipoEquipo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo")
            },
            txtEquipo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre del equipo")
            }
        }
    });
}



function CargarReporte() {
    
    if ($("#formEquipo").valid()) {

        let data = {
            DominioFiltrar: $("#cbFilDominio").val(),
            SubdominioFiltrar: $("#cbFilSubdominio").val(),
            EquipoId: $("#hdEquipoId").val(),
            EquipoNombre: $("#txtEquipo").val()
        };

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

        $.ajax({
            url: URL_API_VISTA + "/Reporte",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (dataObject) {
                if (dataObject !== null) {
                    DATA_SUBDOMINIO = dataObject.DataFiltros.Subdominio;

                    SetItemsMultipleEvent(dataObject.DataFiltros.Dominio, $("#cbFilDominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true, funcion1);
                    SetItemsMultipleEvent(DATA_SUBDOMINIO, $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true, funcion2);

                    /***************************************
                    ************* APLICACIONES *************
                    /***************************************/
                    PROYECCION_MESES_1 = dataObject.Proyeccion1Meses;
                    PROYECCION_MESES_2 = dataObject.Proyeccion2Meses;

                    DATA_APLICACIONES = dataObject.DataPlotly;

                    SetearGraficosPlotly(DATA_APLICACIONES);



                    //APLICACIONES - PREPARAR FILTRO APLICACIONES
                    SetItems(dataObject.DataFiltros.AplicacionEstado, $("#cbFilEstadoAplicacion"), TEXTO_TODAS);


                    //TECNOLOGIAS
                    PrepararDataTecnologias(dataObject.DataPie);

                    //TECNOLOGIAS NO REGISTRADAS
                    PrepararDataTecnologiasNoRegistrado(dataObject.DataTecnologiasNoRegistradas);
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

function SetearGraficosPlotly(data) {
    //APLICACIONES - SITUACION ACTUAL
    var dataSituacionActual = data.filter(x => x.TipoId == "1");
    InitPlotly(dataSituacionActual, "<b>Situación actual</b>", "divPlotly");
    $tableAplicacion.bootstrapTable("destroy");
    $tableAplicacion.bootstrapTable({ data: dataSituacionActual });


    //APLICACIONES - PROYECCION 1 (12 MESES)
    var dataProyeccion1 = data.filter(x => x.TipoId == "2");
    var title = String.Format('<b>Proyección {0} meses</b>', PROYECCION_MESES_1);
    InitPlotly(dataProyeccion1, title, "divPlotlyProyeccion1");
    $tableAplicacionProyeccion1.bootstrapTable("destroy");
    $tableAplicacionProyeccion1.bootstrapTable({ data: dataProyeccion1 });


    //APLICACIONES - PROYECCION 2
    var dataProyeccion2 = data.filter(x => x.TipoId == "3");
    title = String.Format('<b>Proyección {0} meses</b>', PROYECCION_MESES_2);
    InitPlotly(dataProyeccion2, title, "divPlotlyProyeccion2");
    $tableAplicacionProyeccion2.bootstrapTable("destroy");
    $tableAplicacionProyeccion2.bootstrapTable({ data: dataProyeccion2 });
}

function InitPlotly(dataAPI, titulo, div) {

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
                text: [item.Id],
                textposition: 'bottom',
                marker: { size: 9, color: 'rgb(1, 45, 116)' }
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
                y1: 1.25,

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
            },
        ],
        xaxis: {
            fixedrange: true,
            showgrid: false,
            zeroline: false,
            //title: {
            //    text: 'Riesgo de obsolescencia del grupo',
            //    font: {
            //        size: 12,
            //        family: 'Roboto,sans-serif'
            //    }
            //},

        },
        yaxis: {
            fixedrange: true,
            showgrid: false,
            zeroline: false,
            //title: {
            //    text: 'Índice de obsolescencia del grupo',
            //    font: {
            //        size: 12,
            //        family: 'Roboto,sans-serif'
            //    }
            //}
        },
        title: titulo,
        titlefont: {
            size: 16,
            family: 'Roboto,sans-serif'
        },
        height: 300,
        hovermode: "closest",
        margin: {
            l: 60,
            r: 50,
            b: 20,
            t: 30
        }
    };

    Plotly.newPlot(div, dataPlotly, layout, { showSendToCloud: true, displayModeBar: false });

}

function InitAutocompletarEquipo($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            $IdBox.val("0");
            var idTipoEquipo = $("#cbFilTipoEquipo").val() == "" ? 0 : $("#cbFilTipoEquipo").val();
            $.ajax({
                url: URL_API_VISTA + "/GetEquipoByFiltro?filtro=" + request.term + "&idTipoEquipo=" + idTipoEquipo,
                type: "GET",
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                success: function (data) {
                    response($.map(data, function (item) {
                        return item;
                    }));
                },
                async: true,
                global: false
            });
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            GetEquipoById(ui.item.Id);
            //CargarReporte();

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Descripcion));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}


function GetEquipoById(idEquipo) {

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/GetEquipoById?idEquipo=" + idEquipo,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    $("#txtAmbiente").val(dataObject.Ambiente);
                    $("#txtSO").val(dataObject.SistemaOperativo);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {

        },
        complete: function () {

        },
        async: false
    });
}



function InitAmchartPiev4(dataAPI) {


    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create("reportPie", am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    chart.data = dataAPI;

    chart.innerRadius = am4core.percent(40);
    chart.depth = 40;

    chart.legend = new am4charts.Legend();

    var series = chart.series.push(new am4charts.PieSeries3D());
    series.dataFields.value = "Value";
    series.dataFields.depthValue = "Value";
    series.dataFields.category = "Id";
    series.slices.template.cornerRadius = 5;
    series.colors.step = 3;

    var colorSet = new am4core.ColorSet();
    colorSet.list = $.map(dataAPI, function (n, i) {
        return new am4core.color(n.Color);
    });
    series.colors = colorSet;

}

function PrepararDataTecnologias(dataPie) {
    //TECNOLOGIAS
    let Pie = [];
    let HorizontalBar = [];
    $.each(dataPie, function (i, item) {
        Pie.push({ Id: item.TipoDescripcion, Value: item.Data.length, TipoDescripcion: item.TipoDescripcion, Color: item.Color });
        HorizontalBar = HorizontalBar.concat(item.Data);
    });
    InitAmchartPiev4(Pie);
    $tableTecnologia.bootstrapTable("destroy");
    $tableTecnologia.bootstrapTable({ data: HorizontalBar });
}

function PrepararDataTecnologiasNoRegistrado(data) {
    //TECNOLOGIAS 
    $tableTecnologiaNoRegistrada.bootstrapTable("destroy");
    $tableTecnologiaNoRegistrada.bootstrapTable({ data: data });
}

function Change_cbFilDominio() {
    let Ids = $("#cbFilDominio").val();
    let tmp = DATA_SUBDOMINIO;

    if (Ids != null && Ids.length != 0)
        tmp = DATA_SUBDOMINIO.filter(x => Ids.includes(x.TipoId));
    SetItemsMultipleEvent(tmp, $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_TODOS, true, funcion2);
    //Change_cbFilSubdominio();
}

function ActualizarGrafico() {

    let data = {
        DominioFiltrar: $("#cbFilDominio").val(),
        SubdominioFiltrar: $("#cbFilSubdominio").val(),
        EquipoId: $("#hdEquipoId").val()
    };
    $.ajax({
        url: URL_API_VISTA + "/Reporte",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (dataObject) {
            if (dataObject != null) {

                PrepararDataTecnologias(dataObject.DataPie);

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {

        }
    });
}


function formatterEstadoObs(value) {
    var html = '<button type="button" class="btn btn-{0} btn-circle" style="cursor: inherit"></button>';

    if (value > 0) {
        html = String.Format(html, "danger");
    } else {
        html = String.Format(html, "success");
    }
    return html;
}

function linkFormatterAplicacion(value, row, index) {
    return `<a href="/Vista/DetalleAplicacion?id=${row.Id}" title="Ver detalle de la aplicación" target="_blank">${value}</a>`;
}

function linkFormatterTecnologia(value, row, index) {
    return `<a href="TecnologiaEquipo/${row.Id}" title="Ver detalle de la tecnología" target="_blank">${value}</a>`;
}