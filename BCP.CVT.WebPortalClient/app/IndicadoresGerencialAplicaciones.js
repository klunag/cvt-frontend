var URL_API_VISTA = URL_API + "/Indicadores/Gerencial/Aplicaciones";


$(function () {
    CargarCombos();
    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    _BuildDatepicker($("#FechaFiltro"));

    InitAutocompletarBuilder($("#txtJefeEquipo"), null, ".containerJefeEquipo", "/Aplicacion/GetJefeEquipoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtGerencia"), null, ".containerGerencia", "/Aplicacion/GetGerenciaByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtDivision"), null, ".containerDivision", "/Aplicacion/GetDivisionByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtUnidad"), null, ".containerUnidad", "/Aplicacion/GetUnidadByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtOwner"), null, ".containerOwner", "/Aplicacion/GetOwnerByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtTTL"), null, ".containerTTL", "/Aplicacion/GetTTLByFiltro?filtro={0}");

    MethodValidarFecha(RANGO_DIAS_HABILES)
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
            cbFilEstadoAplicacion: {
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
            cbFilEstadoAplicacion: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un estado de aplicación")
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
            if (textStatus === "success") {
                if (dataObject !== null) {

                    SetItemsMultiple(dataObject.ListaEstadoAplicacion, $("#cbFilEstadoAplicacion"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                    $("#cbFilEstadoAplicacion").val("Vigente");
                    $("#cbFilEstadoAplicacion").multiselect("refresh");

                    SetItems(dataObject.NroMesesConsulta, $("#cbNroMeses"), "");
                    SetItems(dataObject.NroSubdominios, $("#cbNroSubdominios"), "");
                    SetItems(dataObject.ListaGestionadoPor, $("#cbFilGestionadoPor"), TEXTO_TODOS);
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
            EstadoAplicacionFiltro: $("#cbFilEstadoAplicacion").val(),
            NroMesesFiltro: $("#cbNroMeses").val(),
            NroSubdominiosFiltro: $("#cbNroSubdominios").val(),
            FechaConsultaFiltro: dateFromString($("#FechaFiltro").val()),
            GestionadoPorFiltro: $("#cbFilGestionadoPor").val(),
            JefeEquipoFiltrar: $("#txtJefeEquipo").val(),
            LiderUsuarioFiltrar: $("#txtOwner").val(),
            LiderTTLFiltrar: $("#txtTTL").val(),
            GerenciaFiltrar: $("#txtGerencia").val(),
            DivisionFiltrar: $("#txtDivision").val(),
            UnidadFiltrar: $("#txtUnidad").val(),
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
                    debugger;

                    $("#divChartActual").hide();

                    $("#lblTotalAplicacionesSinRelacion span").html(dataObject.TotalAplicacionesSinRelaciones);
                    $("#lblTotalAplicacionesConRelacion span").html(dataObject.TotalAplicacionesConRelaciones);

                    let dataTotalAplicaciones = dataObject.DataTotalAplicaciones;
                    if (dataTotalAplicaciones !== null && dataTotalAplicaciones.length > 0) {
                        let data = dataTotalAplicaciones;
                        $(".total-app").html(data[0].TotalAplicacion);
                        $.each(data, function (i, item) {
                            let elementStr = String.Format(".total-app-est{0}", i);
                            $(elementStr).html(String.Format("{0}", item.TotalEstado));
                        });
                    }

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

                    $("#lblTituloTopSubdominios").html(String.Format("Top {0} Subdominios", $("#cbNroSubdominios").val()));
                    var dataSubdominiosActual = dataObject.DataActualSubdominiosPie;

                    var dataSubdominiosMesesAtras = dataObject.DataaMesesAtrasSubdominiosPie;
                    if (dataSubdominiosMesesAtras !== null) {
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
