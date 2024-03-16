var URL_API_VISTA = URL_API + "/reportesportfolio";
const MULTI_SELECT_VALUE = 2;
const SELECT_VALUE = 1;
var ObjFilter = {};
var periodoTiempo = "";
const arrMultiSelect = [
    { SelectId: "#cbFiltroAgruparValores", DataField: "ValoresAgrupacion" },
    { SelectId: "#cbFiltroValores", DataField: "ValoresFiltro" },
    { SelectId: "#cbFiltroGerencia", DataField: "Gerencia" },
    { SelectId: "#cbFiltroDivision", DataField: "Gerencia" },
    { SelectId: "#cbFiltroArea", DataField: "Gerencia" },
    { SelectId: "#cbFiltroUnidad", DataField: "TipoActivo" },

];

$(function () {
    $(".tipoBusquedaFecha").hide();
    FormatoCheckBox($("#divCbTipoBusqueda"), "CbTipoBusqueda");
    initEvents();
    configCheckBox();
    $(".toggle.btn.btn-default.off").click();
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    initFecha();
    CargarCombosFiltros();
    $("#cbFiltroAgrupacion").change(CargarComboValoresAgruparPor);
    $("#cbFiltroPor").change(CargarComboValoresFiltroPor);
    validarReporteFiltros();
});

function initEvents() {

    $("#cbFiltroGerencia").change(DdlGerencia_Change);
    $("#cbFiltroDivision").change(DdlDivision_Change);
    $("#cbFiltroArea").change(DdlArea_Change);


    $("#cbFiltroAgrupacion, #cbFiltroAgrupacionOrganizacional, #cbFiltroPor").each(function () {
        $(this).append($("<option />").val("-1").text(TEXTO_SELECCIONE));
    });

    $("#btnBuscar").click(function () { GenerarReporte() });
    $("#btnBuscarOrganizacional").click(function () { GenerarReporteOrganizacional() });
    $("#btnExportarReporte1").click(ExportChartData);

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
                $("#FechaFiltroHasta").val("");
                $("#FechaFiltroDesde").val("");
                $("#titleTpBusqueda").text("Fecha Base:");
            }
        }
    );
}

function configCheckBox() {
    $(".btn.btn-primary.toggle-on").text("Por Fecha");
    $(".btn.btn-default.active.toggle-off").text("Por Periodos");
    $("div .toggle.btn").css("width", "100%");
}

function initFecha() {
    $("#divFechaFiltroDesde, #divFechaFiltroHasta").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#FechaFiltroDesde, #FechaFiltroHasta").val("");
}

function CargarCombosFiltros() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/reporte/campos/combosFiltros",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    var filtrosAdmin = dataObject.FilterAdmin;
                    SetItemsMultiple(filtrosAdmin.Gerencia.filter(x => x !== "" && x !== null), $("#cbFiltroGerencia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(filtrosAdmin.Division.filter(x => x !== "" && x !== null), $("#cbFiltroDivision"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(filtrosAdmin.Area.filter(x => x !== "" && x !== null), $("#cbFiltroArea"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(filtrosAdmin.Unidad.filter(x => x !== "" && x !== null), $("#cbFiltroUnidad"), TEXTO_TODOS, TEXTO_TODOS, true);

                    SetItems(dataObject.ListaCamposAgrupar.filter(x => x !== "" && x !== null), $("#cbFiltroAgrupacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ListaCamposAgrupar.filter(x => x !== "" && x !== null), $("#cbFiltroPor"), TEXTO_SELECCIONE);

                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}


function CargarComboValoresAgruparPor() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/reporte/campos/combosFiltros/valoresFiltroPor?idTablaFiltrar=" + $("#cbFiltroAgrupacion").val(),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    SetItemsMultiple(dataObject.filter(x => x !== "" && x !== null), $("#cbFiltroAgruparValores"), TEXTO_TODOS, TEXTO_TODOS, true);

                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function CargarComboValoresFiltroPor() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/reporte/campos/combosFiltros/valoresFiltroPor?idTablaFiltrar=" + $("#cbFiltroPor").val(),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    SetItemsMultiple(dataObject.filter(x => x !== "" && x !== null), $("#cbFiltroValores"), TEXTO_TODOS, TEXTO_TODOS, true);

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
        periodoTiempo = $("#cbFiltroFrecuencia").find(':selected').data('desc');

        let data = {
            ListGerencia: CaseIsNullSendExport($("#cbFiltroGerencia").val()),
            ListDivision: CaseIsNullSendExport($("#cbFiltroDivision").val()),
            ListArea: CaseIsNullSendExport($("#cbFiltroArea").val()),
            ListUnidad: CaseIsNullSendExport($("#cbFiltroUnidad").val()),
            Frecuencia: $("#cbFiltroFrecuencia").val(),
            nroPeriodos: flag ? 0 : $("#txtPeriodo").val(),
            FechaDesde: flag ? fechaDesde : null,
            FechaHasta: fechaHasta,
            AgruparPor: $("#cbFiltroAgrupacion").val(),
            AgruparPorValores: CaseIsNullSendExport($("#cbFiltroAgruparValores").val()),
            FiltrarPor: $("#cbFiltroPor").val(),
            FiltrarPorValores: CaseIsNullSendExport($("#cbFiltroValores").val()),
        };

        $.ajax({
            url: URL_API_VISTA + "/reporte/campos",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            async: false,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject) {
                if (dataObject !== null) {

                    CargarReporte(dataObject);
                    ObjFilter = data;
                }
                else {
                    $("#report1_alerta").show();
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
    $("#report1").empty();
    $("#report1").show();
    $("#report1_alerta").hide();
    $(".div-report").show();


    loadGraficoUno(dataAPI)

}

function loadGraficoUno(data) {
    if (data != null && data != "" && data.length > 0) {


        am4core.ready(function () {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            var chart = am4core.create('report1', am4charts.XYChart);
            ExportChart(chart);

            chart.colors.step = 2;

            chart.legend = new am4charts.Legend()
            chart.legend.position = 'bottom'
            chart.legend.paddingBottom = 20
            chart.legend.labels.template.maxWidth = 95

            chart.legend.fontSize = 10;
            chart.legend.labels.template.fontSize = 10;
            //chart.legend.width = 400;
            //chart.legend.labels.template.maxWidth = 350;
            //chart.legend.labels.template.truncate = false;
            //chart.legend.labels.template.wrap = true;
            //chart.legend.scrollable = true;
            chart.legend.itemContainers.template.paddingTop = 2;
            chart.legend.itemContainers.template.paddingBottom = 2;

            var markerTemplate = chart.legend.markers.template;
            markerTemplate.width = 13;
            markerTemplate.height = 13;


            // Create axes
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            //var categoryAxis = chart.xAxes.push(new am4charts.DateAxis());
            categoryAxis.dataFields.category = "FechaDescripcion";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.title.text = "Periodo de tiempo";

            //Custom width
            categoryAxis.events.on("sizechanged", function (ev) {
                let axis = ev.target;
                let cellWidth = axis.pixelWidth / (axis.endIndex - axis.startIndex);
                axis.renderer.labels.template.maxWidth = cellWidth;
            });

            if ($("cbFiltroFrecuencia").val() == 15) {
                categoryAxis.renderer.minGridDistance = 55;
            } else {
                categoryAxis.renderer.minGridDistance = 25;
            }

            let label = categoryAxis.renderer.labels.template;
            label.wrap = true;
            label.fontSize = 10;

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            //valueAxis.renderer.inside = true;
            //valueAxis.renderer.labels.template.disabled = true;
            valueAxis.min = 0;
            valueAxis.maxPrecision = 0;
            valueAxis.title.text = "Número de aplicaciones";
            let label2 = valueAxis.renderer.labels.template;
            label2.wrap = true;
            label2.fontSize = 10;

            // Create series
            function createSeries(field, name) {

                // Set up series
                var series = chart.series.push(new am4charts.ColumnSeries());
                series.name = name;
                series.dataFields.valueY = field;
                series.dataFields.categoryX = "FechaDescripcion";
                series.sequencedInterpolation = true;

                // Make it stacked
                series.stacked = true;

                // Configure columns
                series.columns.template.width = am4core.percent(60);
                series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: {valueY}";

                // Add label
                var labelBullet = series.bullets.push(new am4charts.LabelBullet());
                labelBullet.label.text = "{valueY}";
                labelBullet.locationY = 0.5;
                // labelBullet.label.hideOversized = true;
                labelBullet.label.fontSize = 10;
                LabelCustomFormatter(labelBullet);
                return series;
            }

            var headers = ObtenerColumnasData(data);
            for (var i = 0; i < headers.length; i++) {
                createSeries(headers[i], headers[i]);
            }

            $.each(data, function (i, e) {
                let ioD = e.FechaDesde.indexOf('T');
                let ioH = e.FechaHasta.indexOf('T');
                e.FechaDesde = ioD != -1 ? e.FechaDesde.slice(0, ioD) : e.FechaDesde;
                e.FechaHasta = ioH != -1 ? e.FechaHasta.slice(0, ioH) : e.FechaHasta;

                for (let index = 0; index < headers.length; index++) {
                    e[headers[index]] = e[headers[index]] == 0 ? null : e[headers[index]];
                }

            });

            chart.data = data;


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
                        })
                        var visibleCount = newIndex;
                        var newMiddle = visibleCount / 2;

                        chart.series.each(function (series) {
                            var trueIndex = chart.series.indexOf(series);
                            var newIndex = series.dummyData;

                            var dx = (newIndex - trueIndex + middle - newMiddle) * delta

                            series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                            series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                        })
                    }
                }
            }

        }); // end am4core.ready()

        $("#btnExportarReporte1").show();
    }
    else {
        $("#report1_alerta").show();
        $("#report1").hide();
        $("#btnExportarReporte1").hide();
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
            },
            cbFiltroAgrupacion: { requiredSelect: true }

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
                ValidDate: "Debe seleccionar una fecha válida",
                ValidMinDate: "Debe ingresar una fecha menor a la fecha hasta"
            },
            FechaFiltroHasta: {
                required: "Debe seleccionar una fecha",
                ValidDate: "Debe seleccionar una fecha válida",
                ValidMaxDate: "Debe ingresar una fecha mayor a la fecha desde"
            },
            cbFiltroAgrupacion: { requiredSelect: "Debes seleccionar una Agrupación" }
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

function ExportChart(chart) {
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.menu.align = "rigth";
    chart.exporting.menu.verticalAlign = "top";
    chart.exporting.menu.items = [{
        label: "...",
        menu: arrOptionsExport
    }];
    chart.exporting.getFormatOptions("pdf").addURL = false;
    chart.exporting.filePrefix = 'Reporte Organizacional';
}

function ExportChartData() {
    if (ObjFilter) {


        let url = `${URL_API_VISTA}/reporte/campos/exportarData?gerencia=${ObjFilter.ListGerencia}&division=${ObjFilter.ListDivision}`
            + `&area=${ObjFilter.ListArea}&unidad=${ObjFilter.ListUnidad}&fechaDesde=${ObjFilter.FechaDesde}&fechaHasta=${ObjFilter.FechaHasta}`
            + `&frecuencia=${ObjFilter.Frecuencia}&nroPeriodos=${ObjFilter.nroPeriodos}&agrupadoPor=${ObjFilter.AgruparPor}&agruparPorValores=${ObjFilter.AgruparPorValores}&filtrarPor=${ObjFilter.FiltrarPor}` +
            `&filtrarPorValores=${ObjFilter.FiltrarPorValores}&periodoTiempo=${periodoTiempo}`;

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

function ValidarPeriodo(nroPeriodo, fechaBase, frecuencia) {
    let estado = false;

    $.ajax({
        url: URL_API_VISTA + `/reporte/ValidarNroperiodos?nroPeriodos=${nroPeriodo}&fechaBase=${fechaBase}&frecuencia=${frecuencia}`,
        type: "GET",
        dataType: "json",
        async: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) { estado = result; },
        error: function (xhr, ajaxOptions, thrownError) { ControlarErrorAjax(xhr, ajaxOptions, thrownError); }
    });

    return estado;
}