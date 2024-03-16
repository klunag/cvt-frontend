var URL_API_VISTA = URL_API + "/Indicadores/Gerencial/Equipos";


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
            cbFilTipoEquipo: {
                requiredSelect: true
            },
            cbSubdominios: {
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
            cbFilTipoEquipo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo de equipo")
            },
            cbSubdominios: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "por lo menos un subdominio")
            },
            FechaFiltro: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha de consulta"),
                isDate: "Debe ingresar una fecha de consulta valida",
                FechaPrevia: "Debe ingresar una fecha de consulta valida",
                FechaMaxima: "Debe ingresar una fecha de consulta menor a la actual"
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

                    SetItemsMultiple(dataObject.ListaTipoEquipos, $("#cbFilTipoEquipo"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.ListaSubsidiarias, $("#cbSubsidiaria"), TEXTO_SELECCIONE, TEXTO_TODAS, true);
                    SetItemsMultiple(dataObject.ListaTipoTecnologias, $("#cbTipoTecnologia"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                    $("#cbFilTipoEquipo").val([1, 2]);
                    $("#cbFilTipoEquipo").multiselect("refresh");
                    $("#cbSubsidiaria").val([0, 1, 3, 5]);
                    $("#cbSubsidiaria").multiselect("refresh");
                    $("#cbTipoTecnologia").val([1, 2, 3, 4, 5, 6]);
                    $("#cbTipoTecnologia").multiselect("refresh");
                    SetItemsMultiple(dataObject.ListaSubdominios, $("#cbSubdominios"), TEXTO_SELECCIONE, TEXTO_TODAS, true);
                    //$("#cbSubdominios").val("36,68,69");
                    $("#cbSubdominios").val([36, 68, 69]);
                    $("#cbSubdominios").multiselect("refresh");

                    SetItems(dataObject.NroMesesConsulta, $("#cbNroMeses"), "");
                    //SetItems(dataObject.NroSubdominios, $("#cbNroSubdominios"), "");
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
            TipoEquipoFiltro: $("#cbFilTipoEquipo").val(),
            NroMesesFiltro: $("#cbNroMeses").val(),
            SubdominiosFiltro: $("#cbSubdominios").val(),
            FechaConsultaFiltro: dateFromString($("#FechaFiltro").val()),
            SubsidiariasFiltro: $("#cbSubsidiaria").val(),
            TipoTecnologiaFiltro: $("#cbTipoTecnologia").val()
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


                    $("#lblTotalEquipos span").html(dataObject.TotalEquipos);
                    $("#lblTotalEquiposManual span").html(dataObject.TotalEquiposDescubrimientoManual);
                    $("#lblTotalEquiposAutomatico span").html(dataObject.TotalEquiposDescubrimientoAutomatico);
                    $("#lblTotalEquiposHuerfanos span").html(dataObject.TotalEquiposHuerfanos);

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

                    $("#lblTituloTopSubdominios").html(String.Format("Top Subdominios"));
                    var dataSubdominiosActual = dataObject.DataActualSubdominiosPie;

                    var dataSubdominiosMesesAtras = dataObject.DataaMesesAtrasSubdominiosPie;

                    var idsSubdominios = $.map(dataSubdominiosActual, function (element) {
                        return parseInt(element.TipoId);
                    });
                    idsSubdominios = unique(idsSubdominios);

                    $("#divPieSubdominios").empty();
                    $("#divPieSubdominios").append(String.Format(
                        '<div class="col-xs-6 div-report">\
                                <div class="card">\
                                    <div class="card-body">\
                                        <div id="divPieSubdominiosActualLbl" class="lblTitleChart">Hoy</div>\
                                    </div>\
                                </div >\
                            </div >', ""));

                    $("#divPieSubdominios").append(String.Format(
                        '<div class="col-xs-6 div-report">\
                                <div class="card">\
                                    <div class="card-body">\
                                        <div id="divPieSubdominiosMesesAtrasLbl" class="lblTitleChart">{0}</div>\
                                    </div>\
                                </div >\
                            </div >', $("#cbNroMeses").val() == 1 ? String.Format("{0} mes atrás", $("#cbNroMeses").val()) : String.Format("{0} meses atrás", $("#cbNroMeses").val())));


                    $.each(idsSubdominios, function () {
                        var idSubdominio = this;

                        var dataAPI = $.grep(dataSubdominiosActual, function (element, index) {
                            return element.TipoId == idSubdominio;
                        });

                        if (dataAPI.length > 0) {
                            $("#divPieSubdominios").append(String.Format(
                                '<div class="col-xs-6 div-report div-report-subdominio">\
                                <div class="card">\
                                    <div class="card-body">\
                                        <div id="divPieSubdominioActual{0}" class="reportPie"></div>\
                                        <div id="divPieSubdominioActualLbl{0}" class="lblBottomChart">{1}</div>\
                                    </div>\
                                </div >\
                            </div >', idSubdominio, dataAPI[0].TipoDescripcion));

                            InitAmchartPiev4(dataAPI, String.Format("divPieSubdominioActual{0}", idSubdominio));

                        }

                        var dataAPIMesesAtras = $.grep(dataSubdominiosMesesAtras, function (element, index) {
                            return element.TipoId == idSubdominio;
                        });

                        if (dataAPIMesesAtras.length > 0) {
                            $("#divPieSubdominios").append(String.Format(
                                '<div class="col-xs-6 div-report div-report-subdominio">\
                                <div class="card">\
                                    <div class="card-body">\
                                        <div id="divPieSubdominioMesesAtras{0}" class="reportPie"></div>\
                                        <div id="divPieSubdominioMesesAtrasLbl{0}" class="lblBottomChart">{1}</div>\
                                    </div>\
                                </div >\
                            </div >', idSubdominio, dataAPI[0].TipoDescripcion));

                            InitAmchartPiev4(dataAPIMesesAtras, String.Format("divPieSubdominioMesesAtras{0}", idSubdominio));

                        }
                    });//fin for each



                    ///////////////////////////////////////////////////////////////////////// 


                    $("#divChartActualOtros").hide();
                    if (dataObject.DataActualPieOtros.length > 0) {
                        $("#divChartActualOtros .card-body #divPieActualOtros").remove();
                        $("#divChartActualOtros .card-body").append('<div id="divPieActualOtros" class="reportPie"></div>');

                        InitAmchartPiev4(dataObject.DataActualPieOtros, "divPieActualOtros");
                        $("#divChartActualOtros").show();
                    }

                    $("#divChartMesesAtrasOtros").hide();
                    if (dataObject.DataMesesAtrasPieOtros.length > 0) {
                        $("#divChartMesesAtrasOtros .card-body #divPieMesesAtrasOtros").remove();
                        $("#divChartMesesAtrasOtros .card-body").append('<div id="divPieMesesAtrasOtros" class="reportPie"></div>');

                        InitAmchartPiev4(dataObject.DataMesesAtrasPieOtros, "divPieMesesAtrasOtros");
                        $("#divPieMesesAtrasLblOtros").html($("#cbNroMeses").val() == 1 ? String.Format("{0} mes atrás", $("#cbNroMeses").val()) : String.Format("{0} meses atrás", $("#cbNroMeses").val()));
                        $("#divChartMesesAtrasOtros").show();
                    }


                    //$("#lblTituloTopSubdominiosOtros").html(String.Format("Top {0} Subdominios", $("#cbNroSubdominios").val()));
                    $("#lblTituloTopSubdominiosOtros").html(String.Format("Subdominios"));
                    var dataSubdominiosActualOtros = dataObject.DataActualSubdominiosPieOtros;

                    var dataSubdominiosMesesAtrasOtros = dataObject.DataaMesesAtrasSubdominiosPieOtros;

                    var idsSubdominiosOtros = $.map(dataSubdominiosActualOtros, function (element) {
                        return parseInt(element.TipoId);
                    });
                    idsSubdominiosOtros = unique(idsSubdominiosOtros);

                    $("#divPieSubdominiosOtros").empty();
                    $("#divPieSubdominiosOtros").append(String.Format(
                        '<div class="col-xs-6 div-report">\
                                <div class="card">\
                                    <div class="card-body">\
                                        <div id="divPieSubdominiosActualLblOtros" class="lblTitleChart">Hoy</div>\
                                    </div>\
                                </div >\
                            </div >', ""));

                    $("#divPieSubdominiosOtros").append(String.Format(
                        '<div class="col-xs-6 div-report">\
                                <div class="card">\
                                    <div class="card-body">\
                                        <div id="divPieSubdominiosMesesAtrasLblOtros" class="lblTitleChart">{0}</div>\
                                    </div>\
                                </div >\
                            </div >', $("#cbNroMeses").val() == 1 ? String.Format("{0} mes atrás", $("#cbNroMeses").val()) : String.Format("{0} meses atrás", $("#cbNroMeses").val())));


                    $.each(idsSubdominiosOtros, function () {
                        var idSubdominioOtros = this;

                        var dataAPI = $.grep(dataSubdominiosActualOtros, function (element, index) {
                            return element.TipoId == idSubdominioOtros;
                        });

                        if (dataAPI.length > 0) {
                            $("#divPieSubdominiosOtros").append(String.Format(
                                '<div class="col-xs-6 div-report div-report-subdominio">\
                                <div class="card">\
                                    <div class="card-body">\
                                        <div id="divPieSubdominioActualOtros{0}" class="reportPie"></div>\
                                        <div id="divPieSubdominioActualLblOtros{0}" class="lblBottomChart">{1}</div>\
                                    </div>\
                                </div >\
                            </div >', idSubdominioOtros, dataAPI[0].TipoDescripcion));

                            InitAmchartPiev4(dataAPI, String.Format("divPieSubdominioActualOtros{0}", idSubdominioOtros));

                        }

                        var dataAPIMesesAtras = $.grep(dataSubdominiosMesesAtrasOtros, function (element, index) {
                            return element.TipoId == idSubdominioOtros;
                        });

                        if (dataAPIMesesAtras.length > 0) {
                            $("#divPieSubdominiosOtros").append(String.Format(
                                '<div class="col-xs-6 div-report div-report-subdominio">\
                                <div class="card">\
                                    <div class="card-body">\
                                        <div id="divPieSubdominioMesesAtrasOtros{0}" class="reportPie"></div>\
                                        <div id="divPieSubdominioMesesAtrasLblOtros{0}" class="lblBottomChart">{1}</div>\
                                    </div>\
                                </div >\
                            </div >', idSubdominioOtros, dataAPI[0].TipoDescripcion));

                            InitAmchartPiev4(dataAPIMesesAtras, String.Format("divPieSubdominioMesesAtrasOtros{0}", idSubdominioOtros));

                        }
                    });//fin for each



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
