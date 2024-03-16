var URL_API_VISTA = URL_API + "/Dashboard/Tecnologia";
var URL_API_VISTA2 = URL_API + "/Dashboard";
var DATA_SUBDOMINIO = [];
var DATA_TIPOEQUIPO = [];
var $table = $("#tblRegistro");
var TITULO_MENSAJE = "Estado de aplicaciones";
var chart;
const arrMultiSelect = [
    { SelectId: "#cbFilTipoEquipo", DataField: "TipoEquipo" }
];
$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));

    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});

    _BuildDatepicker($("#FechaFiltro"));

    if (FLAG_ADMIN == 1) {
        SetItemsMultiple([], $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    } else {
        SetItemsMultiple([], $("#cbFilDominio"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
    }

    $table.bootstrapTable();

    CargarCombos();
    //initFecha();
    MethodValidarFecha(RANGO_DIAS_HABILES);
    validarCampos();

    $("#cbFilDominio").change(CargarCombosDominio);
    $("#cbFilSubdominio").change(LimpiarFormFiltros);
});

function LimpiarFormFiltros() {
    LimpiarValidateErrores($("#formFiltros"));
}

function CargarCombosDominio() {
    let idsDominio = $.isArray($(this).val()) ? $(this).val() : [$(this).val()];

    if (idsDominio !== null) {
        $.ajax({
            url: URL_API_VISTA + "/ListarCombos/Dominio",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(idsDominio),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        if (FLAG_ADMIN == 1) {
                            SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
                        } else {
                            $("#cbFilSubdominio").prop("multiple", "");
                            SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_SELECCIONE, "", true, false);
                            $("#cbFilSubdominio").val('').multiselect("refresh");
                        }

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

    LimpiarValidateErrores($("#formFiltros"));
    //$("#formFiltros").valid();
}

function initFecha() {
    _BuildDatepicker($("#FechaFiltro"));
    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
}

function validarCampos() {
    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbFilDominio: {
                requiredSelect: true
            },
            cbFilSubdominio: {
                requiredSelect: true
            },
            cbFilTipoEquipo: {
                requiredSelect: true
            },
            cbFilAgrupacion: {
                requiredSelect: true
            },
            cbFilSubsidiaria: {
                requiredSelect: true
            },
            cbFilEstado: {
                requiredSelect: true
            },
            FechaFiltro: {
                required: true,
                isDate: true,
                FechaPrevia: true,
                FechaMaxima: true
            }
        },
        messages: {
            cbFilDominio: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "dominio")
            },
            cbFilSubdominio: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "subdominio")
            },
            cbFilTipoEquipo: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "tipo de equipo")
            },
            cbFilAgrupacion: {
                requiredSelect: String.Format("Debes seleccionar la {0}.", "agrupación")
            },
            cbFilSubsidiaria: {
                requiredSelect: String.Format("Debes seleccionar la {0}.", "subsidiaria")
            },
            cbFilEstado: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "estado de la aplicación")
            },
            FechaFiltro: {
                required: "Debe seleccionar una fecha",
                isDate: "Debe ingresar una fecha valida",
                FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbFilSubdominio"
                || element.attr('name') === "cbFilDominio"
                || element.attr('name') === "cbFilTipoEquipo"
                || element.attr('name') === "cbFilSubsidiaria"
                || element.attr('name') === "cbFilEstado") {
                element.parent().parent().append(error);
            }
            else if (element.attr('name') === "cbFilAgrupacion") {
                element.parent().append(error);
            }
            else {
                element.parent().append(error);
            }
        }
    });
}

function ActualizarGraficos() {
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        $(".div-report").show();
        CargarReporte();
    }
}

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

                    if (FLAG_ADMIN == 1) {
                        SetItemsMultiple(dataObject.Dominio, $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
                    } else {
                        $("#cbFilDominio").prop("multiple", "");
                        SetItemsMultiple(dataObject.Dominio, $("#cbFilDominio"), TEXTO_SELECCIONE, "", true, false);
                        $("#cbFilDominio").val('').multiselect("refresh");
                    }

                    //SetItems(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_SELECCIONE);
                    //FILTROS MULTISELECT
                    SetDataToSelectMultiple(arrMultiSelect, dataObject);

                    SetItems(dataObject.AgrupacionFiltro, $("#cbFilAgrupacion"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.DominioRed, $("#cbFilSubsidiaria"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true, false);
                    SetItemsMultiple(dataObject.EstadoAplicacion, $("#cbFilEstado"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true, false);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            waitingDialog.hide();
        }
        //async: false
    });
}

function CargarReporte() {
    let data = {
        SubdominioFiltrar: $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()],
        TipoEquipoIds: CaseIsNullSendExport($("#cbFilTipoEquipo").val()),
        Fecha: $("#FechaFiltro").val(),
        SubsidiariaFiltrar: $("#cbFilSubsidiaria").val(),
        Agrupacion: $("#cbFilAgrupacion").val(),
        EstadoAplicacionFiltrar: $("#cbFilEstado").val(),
    };

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA2 + "/Reportes/GraficoAgrupacion",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject) {
            if (dataObject !== null) {
                let Pie = [];
                $.each(dataObject, function (i, item) {
                    Pie.push({ Agrupacion: item.Agrupacion, Obsoletos: item.Obsoletos, NoObsoletos: item.NoObsoletos });
                });
                InitAmchartv4(Pie);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            waitingDialog.hide();
        }
    });
    //  }
}

function InitAmchartv4(dataAPI) {
    am4core.useTheme(am4themes_animated);

    chart = am4core.create("report", am4charts.XYChart);
    chart.data = dataAPI;

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "Agrupacion";
    categoryAxis.title.text = "Aplicaciones";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;
    categoryAxis.renderer.labels.template.rotation = 45;
    categoryAxis.renderer.labels.template.horizontalCenter = "left";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";

    var label = categoryAxis.renderer.labels.template;
    label.wrap = true;
    label.maxWidth = 120;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.title.text = "Aplicaciones";

    // Create series    
    createSeries("Obsoletos", "Obsoletos", true);
    createSeries("NoObsoletos", "Vigentes", true);

    // Add legend
    chart.legend = new am4charts.Legend();
}

function createSeries(field, name, stacked) {
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = field;
    series.dataFields.categoryX = "Agrupacion";
    series.name = name;
    series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
    series.stacked = stacked;
    series.columns.template.width = am4core.percent(95);
    if (field === "Obsoletos") {
        series.columns.template.fill = am4core.color("#dc6967");
    }
    else if (field === "NoObsoletos") {
        series.columns.template.fill = am4core.color("#7ddc67");
    }
}

function ExportarInfo() {
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        let SubdominioFiltrar = $.isArray($("#cbFilSubdominio")) ? $("#cbFilSubdominio").val().join(",") : $("#cbFilSubdominio").val();
        let SubsidiariaFiltrar = $("#cbFilSubsidiaria").val().join(",");
        let EstadoAplicacionFiltrar = $("#cbFilEstado").val().join(",");

        let TipoEquipoId = CaseIsNullSendExport($("#cbFilTipoEquipo").val());
        let Agrupacion = $("#cbFilAgrupacion").val();
        let Fecha = $("#FechaFiltro").val();

        let url = `${URL_API_VISTA2}/Reportes/GraficoAgrupacion/Exportar?subdominio=${SubdominioFiltrar}&subsidiaria=${SubsidiariaFiltrar}&estado=${EstadoAplicacionFiltrar}&tipoequipo=${TipoEquipoId}&agrupacion=${Agrupacion}&fecha=${Fecha}`;
        $.ajax({
            url: url,
            contentType: "application/vnd.ms-excel",
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
}