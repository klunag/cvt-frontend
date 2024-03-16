
var URL_API_VISTA = URL_API + "/Tecnologia/EvolucionEquipo/Instalaciones";
$(function () {


    //if (ES_ADMIN)
    $(".containerAdmin").show();
    //else
    //    $(".containerAdmin").hide();
    ToggleDiv();
    InitFecha();
    CargarCombos();

    InitAutocompletarBuilder($("#txtClaveTecnologia"), $("#hdFilTecnologiaId"), ".containerFiltroTecnologia", "/Tecnologia/GetTecnologiaByClave?filtro={0}");
    setDefaultHd($("#txtClaveTecnologia"), $("#hdFilTecnologiaId"));

    InitAutocompletarBuilder2($("#txtFabricante"), $("#hdFabricante"), ".containerFiltroFabricante", "/Dashboard/TecnologiaEquipo/GetTecnologiaByFabricanteNombre?filtro={0}");
    setDefaultHd($("#txtFabricante"), $("#hdFabricante"));

    InitAutocompletarBuilder2($("#txtNombreTecnologia"), $("#hdNombreTecnologia"), ".containerAplicacion", "/Dashboard/TecnologiaEquipo/GetTecnologiaByNombre?filtro={0}");
    setDefaultHd($("#txtNombreTecnologia"), $("#hdNombreTecnologia"));

    MethodValidarFecha(RANGO_DIAS_HABILES);
    validarForm();
});


function CargarCombos() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {

                    SetItemsMultiple(dataObject.ListaTipoEquipos, $("#cbTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.ListaSubsidiarias, $("#cbSubsidiaria"), TEXTO_TODOS, TEXTO_TODOS, true);

                    SetItems(dataObject.ListaPeriodoTiempo, $("#cbPeriodoTiempo"), "");

                    $("#cbTipoEquipo").val([1]);
                    $("#cbTipoEquipo").multiselect("refresh");

                    $("#cbSubsidiaria").val([0, 1, 3, 5]);
                    $("#cbSubsidiaria").multiselect("refresh");
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {

        },
        async: false
    });
}

function ToggleDiv() {

    $("#divToggleAgruparFamilia").text('');
    $("#divToggleAgruparFamilia").append('<input type="checkbox" checked data-toggle="toggle" id="cbAgruparFamilia"/>')
    $('#cbAgruparFamilia').bootstrapToggle('on');

    $('#cbAgruparFamilia').change(function () {
        if (this.checked) { //oculta div
            $(".divFiltrosFamilia").show();
            $(".divFiltrosClave").hide();
            $(".divFiltrosClave input").val("");
        } else {//muestra div
            $(".divFiltrosFamilia").hide();
            $(".divFiltrosClave").show();
            $(".divFiltrosFamilia input").val("");
        }
    });
}

function InitFecha() {
    //$("#dpFecBase-btn").datetimepicker({
    //    locale: 'es',
    //    useCurrent: true,
    //    format: 'DD/MM/YYYY'
    //});
    _BuildDatepicker($("#dpFecBase"));
    $("#dpFecBase").val(moment(new Date()).format("DD/MM/YYYY"));
}

function validarForm() {

    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbSubsidiaria: {
                requiredSelect: true
            },
            cbTipoEquipo: {
                requiredSelect: true
            },
            dpFecBase: {
                required: true,
                isDate: true,
                FechaPrevia: true,
                FechaMaxima: true
            },
            cbPeriodoTiempo: {
                required: true
            },
            txtFabricante: {
                required: function (element) {
                    return $('#cbAgruparFamilia').prop("checked")
                }
            },
            txtNombreTecnologia: {
                required: function (element) {
                    return $('#cbAgruparFamilia').prop("checked")
                }
            },
            txtClaveTecnologia: {
                required: function (element) {
                    return !$('#cbAgruparFamilia').prop("checked")
                }
            }
        },
        messages: {

            cbSubsidiaria: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "una subsidiaria")
            },
            cbTipoEquipo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo de equipo")
            },
            dpFecBase: {
                required: String.Format("Debes ingresar {0}.", "una fecha"),
                isDate: "Debe ingresar una fecha valida",
                FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            },
            cbPeriodoTiempo: {
                required: String.Format("Debes seleccionar {0}.", "un periodo de tiempo")
            },
            txtFabricante: {
                required: String.Format("Debes ingresar {0}.", "un fabricante")
            },
            txtNombreTecnologia: {
                required: String.Format("Debes ingresar {0}.", "un nombre de tecnología")
            },
            txtClaveTecnologia: {
                required: String.Format("Debes ingresar {0}.", "una tecnología")
            },
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "dpFecBase" || element.attr('name') === "cbSubsidiaria" || element.attr('name') === "cbTipoEquipo") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}


function GenerarGrafico() {
    if ($("#formFiltros").valid()) {
        var data = [];
        let DATA_EXPORTAR = {};

        DATA_EXPORTAR = {};
        DATA_EXPORTAR.TipoEquipoFiltrar = $("#cbTipoEquipo").val();
        DATA_EXPORTAR.SubsidariasFiltrar = $("#cbSubsidiaria").val();
        DATA_EXPORTAR.Fecha = $("#dpFecBase").val() == null || $("#dpFecBase").val() == "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#dpFecBase").val())).format("YYYY-MM-DD");
        DATA_EXPORTAR.NroMeses = $("#cbPeriodoTiempo").val();
        DATA_EXPORTAR.FlagAgruparFamilia = $('#cbAgruparFamilia').prop("checked");
        DATA_EXPORTAR.IdTecnologia = $('#cbAgruparFamilia').prop("checked") == false ? $("#hdFilTecnologiaId").val() : 0;
        DATA_EXPORTAR.Fabricante = $('#cbAgruparFamilia').prop("checked") ? $("#txtFabricante").val() : "";
        DATA_EXPORTAR.NombreTecnologia = $('#cbAgruparFamilia').prop("checked") ? $("#txtNombreTecnologia").val() : "";

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(DATA_EXPORTAR),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                waitingDialog.hide();
                if (result != null) {
                    data = result;
                    MostraGraficoGenerico(data);
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
}

function MostraGraficoGenerico(dataAPI) {
    am4core.useTheme(am4themes_animated);

    //AGREGAR COLOR A LINEA
    //dataAPI.forEach(function (e) { e.lineColor = "#dc6967"; });

    chart = am4core.create("chartdiv", am4charts.XYChart);
    chart.colors.step = 2;
    chart.data = dataAPI;

    // Create axes
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    dateAxis.renderer.minGridDistance = 50;

    // Create series    
    createAxisAndSeries("Total", "Total", false, "rectangle", '#E33D01');

    // Add cursor
    chart.cursor = new am4charts.XYCursor();

    // Add legend
    chart.legend = new am4charts.Legend();
    chart.legend.position = "bottom";
}


function createAxisAndSeries(field, name, opposite, bullet, color) {
    //var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    //if (chart.yAxes.indexOf(valueAxis) != 0) {
    //    valueAxis.syncWithAxis = chart.yAxes.getIndex(0);
    //}

    var series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = field;
    series.dataFields.dateX = "Fecha";
    series.strokeWidth = 2;
    //series.yAxis = valueAxis;
    series.name = name;
    series.tooltipText = "{name}: [bold]{valueY}[/]";
    series.tensionX = 0.8;
    series.showOnInit = true;
    series.fill = am4core.color(color);
    series.stroke = am4core.color(color);

    //series.tooltipText = "[bold]{valueY}[/] {name} obsoletos a [bold]{Fecha}[/]";
    //series.propertyFields.stroke = "lineColor";
    //series.propertyFields.fill = "lineColor";

    var interfaceColors = new am4core.InterfaceColorSet();

    switch (bullet) {
        case "triangle":
            var bullet = series.bullets.push(new am4charts.Bullet());
            bullet.width = 12;
            bullet.height = 12;
            bullet.horizontalCenter = "middle";
            bullet.verticalCenter = "middle";

            var triangle = bullet.createChild(am4core.Triangle);
            //triangle.stroke = interfaceColors.getFor("background");
            triangle.strokeWidth = 1;
            triangle.direction = "top";
            triangle.width = 12;
            triangle.height = 12;
            break;
        case "rectangle":
            var bullet = series.bullets.push(new am4charts.Bullet());
            bullet.width = 10;
            bullet.height = 10;
            bullet.horizontalCenter = "middle";
            bullet.verticalCenter = "middle";

            var rectangle = bullet.createChild(am4core.Rectangle);
            //rectangle.stroke = interfaceColors.getFor("background");
            rectangle.strokeWidth = 1;
            rectangle.width = 10;
            rectangle.height = 10;
            break;
        default:
            var bullet = series.bullets.push(new am4charts.CircleBullet());
            //bullet.circle.stroke = interfaceColors.getFor("background");
            bullet.circle.strokeWidth = 1;
            break;
    }



}
