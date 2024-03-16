var URL_API_VISTA = URL_API + "/Indicadores/Gerencial/Tecnologias";


$(function () {
    CargarCombos();
    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    _BuildDatepicker($("#FechaFiltro"));
    MethodValidarFecha(RANGO_DIAS_HABILES);
    validarForm();
});

function validarForm() {


    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbFilTipoTecnologia: {
                requiredSelect: true
            },
            FechaFiltro: {
                requiredSinEspacios: true,
                isDate: true,
                FechaPrevia: true,
                FechaMaxima: true
            }
        },
        messages: {
            cbFilTipoTecnologia: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo de tecnología")
            },
            FechaFiltro: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha de consulta"),
                isDate: "Debe ingresar una fecha valida",
                FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            }
        }
    });
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
            if (textStatus == "success") {
                if (dataObject != null) {

                    SetItemsMultiple(dataObject.ListaTipoTecnologias, $("#cbFilTipoTecnologia"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                    SetItems(dataObject.NroMesesConsulta, $("#cbNroMeses"), "");
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




function GetReporte() {

    if ($("#formFiltros").valid()) {

        let data = {
            TipoTecnologiaFiltro: $("#cbFilTipoTecnologia").val(),
            NroMesesFiltro: $("#cbNroMeses").val(),
            FechaConsultaFiltro: dateFromString($("#FechaFiltro").val())
        };

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

        $.ajax({
            url: URL_API_VISTA + "/Reporte",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject) {
                if (dataObject !== null) {

                    $("#divChartActual").hide();

                    $("#divDatosTotales").empty();

                    var datosTotales = dataObject.DataTipoTecnologia;

                    var idsTipoEquipo = $.map(datosTotales, function (element) {
                        return parseInt(element.TipoEquipoId);
                    });
                    idsTipoEquipo = unique(idsTipoEquipo);

                    $.each(idsTipoEquipo, function () {
                        var idTipoEquipo = this;

                        var dataTotales = $.grep(datosTotales, function (element, index) {
                            return element.TipoEquipoId == idTipoEquipo;
                        });


                        $("#divDatosTotales").append(String.Format('<div id="divTotal_{0}" class="col-xs-2 div-report">\
                            <div class="totalTitle">{1}</div>\
                            <table id="tblTotal_{0}" class="table" cellspacing="0" >\
                            <thead class="no-header">\
                                <tr>\
                                    <th data-field="TipoTecnologia" data-halign="center" data-valign="middle" data-align="left" data-width="70%"></th>\
                                    <th data-field="Total" data-halign="center" data-valign="middle" data-align="right"></th>\
                                </tr>\
                            </thead>\
                                </table >\
                            </div >', idTipoEquipo, dataTotales[0].TipoEquipo));


                        $(String.Format("#tblTotal_{0}", idTipoEquipo)).bootstrapTable({ data: dataTotales });


                    });//fin for each




                    if (dataObject.DataActualPie.length > 0) {

                        $("#divChartActual .card-body #divPieActual").remove();
                        $("#divChartActual .card-body").append('<div id="divPieActual" class="reportPie"></div>');

                        InitAmchartPiev4(dataObject.DataActualPie, "divPieActual");
                        $("#divChartActual").show();
                    }

                    $("#divChartMesesAtras").hide();
                    if (dataObject.DataMesesAtrasPie.length > 0) {
                        $("#divChartMesesAtras .card-body #divPieMesesAtras").remove();
                        $("#divChartMesesAtras .card-body").append('<div id="divPieMesesAtras" class="reportPie"></div>');

                        InitAmchartPiev4(dataObject.DataMesesAtrasPie, "divPieMesesAtras");
                        $("#divPieMesesAtrasLbl").html($("#cbNroMeses").val() == 1 ? String.Format("{0} mes atrás", $("#cbNroMeses").val()) : String.Format("{0} meses atrás", $("#cbNroMeses").val()));
                        $("#divChartMesesAtras").show();
                    }



                    $("#divGraficos").show();
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

function InitAmchartPiev4(dataAPI, divPie) {


    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create(divPie, am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    chart.data = dataAPI;

    //chart.innerRadius = am4core.percent(40);
    //chart.depth = 40;

    //chart.legend = new am4charts.Legend();

    var series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "Valor";
    series.dataFields.depthValue = "Valor";
    series.dataFields.category = "Id";
    //series.slices.template.cornerRadius = 5;
    series.colors.step = 3;

    var colorSet = new am4core.ColorSet();
    colorSet.list = $.map(dataAPI, function (n, i) {
        return new am4core.color(n.Color);
    });
    series.colors = colorSet;

    chart.validateData();

}
