var URL_API_VISTA = URL_API + "/Dashboard/Tecnologia";
var URL_API_VISTA2 = URL_API + "/Dashboard";
var URL_API_VISTA3 = URL_API + "/Dashboard/Reportes";
var DATA_SUBDOMINIO = [];
var DATA_TIPOEQUIPO = [];
//var $table = $("#tblRegistro");
//var $tableDetalle = $("#tblRegistroDetalle");
var TITULO_MENSAJE = "Indicadores gerenciales";

$(function () {
    //$(".div-report").show();
    //if (FLAG_ADMIN == 1) {
    //    SetItemsMultiple([], $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    //    SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    //} else {
    //    SetItemsMultiple([], $("#cbFilDominio"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
    //    SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
    //}
    SetItemsMultiple([], $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);

    //$table.bootstrapTable();
    //$tableDetalle.bootstrapTable();

    CargarCombos();
    initFecha();
    validarCampos();
    validarCampos2();

    $("#cbFilDominio").change(CargarCombosDominio);
    $("#cbFilSubdominio").change(LimpiarFormFiltros);

    SetValorDefaultCombos();
    CargarReporte_0();
    CargarReporteEvolucion();
});


function SetValorDefaultCombos() {
    $("#cbFilTipoEquipo").val("1");
    $("#cbFilTipo").val(["1"]);
    $("#cbFilTipo").multiselect("refresh");
    $("#cbFilDominioRed").val(["3"]);
    $("#cbFilDominioRed").multiselect("refresh");
}

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
}

function initFecha() {
    $("#divFechaFiltro").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
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
            //cbFilDominio: {
            //    requiredSelect: true
            //},
            //cbFilSubdominio: {
            //    requiredSelect: true
            //},
            cbFilTipoEquipo: {
                requiredSelect: true
            },
            cbFilDominioRed: {
                requiredSelect: true
            },
            cbFilTipo: {
                requiredSelect: true
            }
        },
        messages: {
            //cbFilDominio: {
            //    requiredSelect: String.Format("Debes seleccionar el {0}.", "dominio")
            //},
            //cbFilSubdominio: {
            //    requiredSelect: String.Format("Debes seleccionar el {0}.", "subdominio")
            //},
            cbFilTipoEquipo: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "tipo")
            },
            cbFilDominioRed: {
                requiredSelect: String.Format("Debes seleccionar la {0}.", "subsidiaria")
            },
            cbFilTipo: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "tipo de tecnología")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbFilSubdominio" || element.attr('name') === "cbFilDominio" || element.attr('name') === "cbFilTipoEquipo" || element.attr('name') === "cbFilDominioRed" || element.attr('name') === "cbFilTipo") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function validarCampos2() {
    $("#formFiltros2").validate({
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
            //cbFilTipoEquipo: {
            //    requiredSelect: true
            //},
            //cbFilDominioRed: {
            //    requiredSelect: true
            //},
            //cbFilTipo: {
            //    requiredSelect: true
            //}
        },
        messages: {
            cbFilDominio: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "dominio")
            },
            cbFilSubdominio: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "subdominio")
            },
            //cbFilTipoEquipo: {
            //    requiredSelect: String.Format("Debes seleccionar el {0}.", "tipo")
            //},
            //cbFilDominioRed: {
            //    requiredSelect: String.Format("Debes seleccionar la {0}.", "subsidiaria")
            //},
            //cbFilTipo: {
            //    requiredSelect: String.Format("Debes seleccionar el {0}.", "tipo de tecnología")
            //}
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbFilSubdominio" || element.attr('name') === "cbFilDominio") {
                element.parent().parent().parent().parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}


function ActualizarGraficos() {
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        $(".div-report").show();
        CargarReporte_0();
        CargarReporteEvolucion();
    }
}

function ActualizarGraficos2() {
    if ($("#formFiltros2").valid()) {
        $(".div-report2").show();
        CargarReporte_1();
        CargarReporte_2();        
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
                    //SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
                    //SetItemsMultiple(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.DominioRed, $("#cbFilDominioRed"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItems(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.TipoTecnologia, $("#cbFilTipo"), TEXTO_TODOS, TEXTO_TODOS, true);
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

function ExportarData() {
    //$("#formFiltros").validate().resetForm();
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        var subdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val().join() : $("#cbFilSubdominio").val();
        var tipoEquipoId = $("#cbFilTipoEquipo").val();
        var fecha = $("#FechaFiltro").val();
        var subsidiaria = $("#cbFilDominioRed").val().join();
        var tipoTecnologia = $("#cbFilTipo").val().join();

        let url = `${URL_API_VISTA2}/Reportes/GraficoSubdominios/Exportar?fecha=${fecha}&tipoEquipoId=${tipoEquipoId}&subdominioFiltrar=${subdominioFiltrar}&subsidiaria=${subsidiaria}&tipotecnologia=${tipoTecnologia}`;
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

function CargarReporte_0() {
    let data = {
        //SubdominioFiltrar: $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()],
        TipoEquipoToString: $("#cbFilTipoEquipo").val(),
        Fecha: $("#FechaFiltro").val(),
        SubsidiariaFiltrar: $("#cbFilDominioRed").val(),
        TipoTecnologiaFiltrar: $("#cbFilTipo").val()
    };

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA3 + "/IndicadorObsolescenciaSoBdAlt",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject) {
            if (dataObject !== null) {
                $(".div-report").show();

                let data = dataObject;

                InitAmchartPiev4_0(data.PieSoBd, "reportPieSoBd");
                InitAmchartPiev4_0(data.PieSo, "reportPieSo");
                InitAmchartPiev4_0(data.PieBd, "reportPieBd");
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

function CargarReporte() {          
    let data = {
        SubdominioFiltrar: $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()],
        TipoEquipoId: $("#cbFilTipoEquipo").val(),
        Fecha: $("#FechaFiltro").val(),
        SubsidiariaFiltrar: $("#cbFilDominioRed").val(),
        TipoTecnologiaFiltrar: $("#cbFilTipo").val()
    };

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA2 + "/Reportes/GraficoSubdominios",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject) {
            if (dataObject !== null) {
                let Pie = [];
                $.each(dataObject, function (i, item) {
                    Pie.push({ Id: item.TipoDescripcion, Value: item.Valor, TipoDescripcion: item.TipoDescripcion, Color: item.Color });
                });
                InitAmchartPiev4(Pie);
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

function InitAmchartPiev4(dataAPI) {
    am4core.useTheme(am4themes_animated);

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

function InitAmchartPiev4_0(dataAPI, divPie) {
    am4core.useTheme(am4themes_animated);

    var chart = am4core.create(divPie, am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    chart.data = dataAPI;

    chart.innerRadius = am4core.percent(40);
    chart.depth = 40;

    var series = chart.series.push(new am4charts.PieSeries3D());
    series.dataFields.value = "Valor";
    series.dataFields.depthValue = "Valor";
    series.dataFields.category = "Id";
    series.slices.template.cornerRadius = 5;
    series.colors.step = 3;

    var colorSet = new am4core.ColorSet();
    colorSet.list = $.map(dataAPI, function (n, i) {
        return new am4core.color(n.Color);
    });
    series.colors = colorSet;
}


//function ExportarDataEquipos() {
//    //$("#formFiltros").validate().resetForm();
//    LimpiarValidateErrores($("#formFiltros"));
//    if ($("#formFiltros").valid()) {
//        let _data = $table.bootstrapTable("getData") || [];
//        //console.log(_data.length);
//        if (_data.length === 0) {
//            MensajeNoExportar(TITULO_MENSAJE);
//            return false;
//        }

//        var subdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val().join() : $("#cbFilSubdominio").val();
//        var tipoEquipoId = $("#cbFilTipoEquipo").val();
//        var fecha = castDate($("#FechaFiltro").val());
//        var subsidiaria = $("#cbFilDominioRed").val().join();
//        var tipoTecnologia = $("#cbFilTipo").val().join();

//        let url = `${URL_API_VISTA2}/Reportes/GraficoSubdominios/ExportarEquipos?fecha=${fecha}&tipoEquipoId=${tipoEquipoId}&subdominioFiltrar=${subdominioFiltrar}&subsidiaria=${subsidiaria}&tipotecnologia=${tipoTecnologia}`;
//        window.location.href = url;
//    }
//}

function CargarReporte_1() {
    let data = {
        SubdominioFiltrar: $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()],
        TipoEquipoId: $("#cbFilTipoEquipo").val(),
        Fecha: $("#FechaFiltro").val(),
        SubsidiariaFiltrar: $("#cbFilDominioRed").val(),
        TipoTecnologiaFiltrar: $("#cbFilTipo").val()
    };

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA2 + "/Reportes/GraficoSubdominios/VigentesObsoletos",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject) {
            if (dataObject !== null) {
                let Pie = [];
                $.each(dataObject, function (i, item) {
                    Pie.push({ Id: item.TipoDescripcion, Value: item.Valor, TipoDescripcion: item.TipoDescripcion, Color: item.Color });
                });
                InitAmchartPiev4_1(Pie);
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

function CargarReporte_2() {
    let data = {
        SubdominioFiltrar: $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()],
        TipoEquipoId: $("#cbFilTipoEquipo").val(),
        Fecha: $("#FechaFiltro").val(),
        SubsidiariaFiltrar: $("#cbFilDominioRed").val(),
        TipoTecnologiaFiltrar: $("#cbFilTipo").val()
    };

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA2 + "/Reportes/GraficoSubdominios",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject) {
            if (dataObject !== null) {
                let Pie = [];
                $.each(dataObject, function (i, item) {
                    Pie.push({ Id: item.TipoDescripcion, Value: item.Valor, TipoDescripcion: item.TipoDescripcion, Color: item.Color });
                });
                InitAmchartPiev4(Pie);
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

function InitAmchartPiev4_1(dataAPI) {
    am4core.useTheme(am4themes_animated);

    var chart = am4core.create("reportPie_0", am4charts.PieChart3D);
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

function CargarReporteEvolucion() {
    let data = {
        SubdominioFiltrar: [36,68,69],
        TipoEquipoId: $("#cbFilTipoEquipo").val(),
        Fecha: $("#FechaFiltro").val(),
        SubsidiariaFiltrar: $("#cbFilDominioRed").val()
    };

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA2 + "/Reportes/GraficoEvolucion",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject) {
            if (dataObject !== null) {
                let Pie = [];
                $.each(dataObject, function (i, item) {
                    Pie.push({ Fecha: item.Fecha, Total: item.Total, FechaFin: new Date(item.Anio, item.Mes - 1) });
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

    //AGREGAR COLOR A LINEA
    dataAPI.forEach(function (e) { e.lineColor = "#dc6967"; });

    chart = am4core.create("reportEvolucion", am4charts.XYChart);
    chart.colors.step = 2;
    chart.data = dataAPI;

    // Create axes
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 50;

    // Create series    
    createAxisAndSeries("Total", "Equipos", false, "circle");
    //createAxisAndSeries("views", "Views", true, "triangle");
    //createAxisAndSeries("hits", "Hits", true, "rectangle");

    // Add legend
    chart.legend = new am4charts.Legend();
    chart.legend.parent = chart.plotContainer;
    chart.legend.zIndex = 100;

    // Add cursor
    chart.cursor = new am4charts.XYCursor();

    //var scrollbarX = new am4charts.XYChartScrollbar();
    //scrollbarX.series.push(series);
    //chart.scrollbarX = scrollbarX;
}

function createAxisAndSeries(field, name, opposite, bullet) {
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.labels.template.fill = am4core.color("#dc6967");

    var series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = field;
    series.dataFields.dateX = "FechaFin";
    series.strokeWidth = 2;
    series.yAxis = valueAxis;
    series.name = name;
    series.tooltipText = "[bold]{valueY}[/] {name} obsoletos a [bold]{Fecha}[/]";
    //series.tensionX = 0.8;
    series.fill = am4core.color("#dc6967");
    series.stroke = am4core.color("#dc6967");
    series.propertyFields.stroke = "lineColor";
    series.propertyFields.fill = "lineColor";

    var interfaceColors = new am4core.InterfaceColorSet();

    switch (bullet) {
        case "triangle":
            var bulletObj = series.bullets.push(new am4charts.Bullet());
            bulletObj.width = 12;
            bulletObj.height = 12;
            bulletObj.horizontalCenter = "middle";
            bulletObj.verticalCenter = "middle";

            var triangle = bulletObj.createChild(am4core.Triangle);
            triangle.stroke = interfaceColors.getFor("background");
            triangle.strokeWidth = 2;
            triangle.direction = "top";
            triangle.width = 12;
            triangle.height = 12;
            break;
        case "rectangle":
            var bulletRect = series.bullets.push(new am4charts.Bullet());
            bulletRect.width = 10;
            bulletRect.height = 10;
            bulletRect.horizontalCenter = "middle";
            bulletRect.verticalCenter = "middle";

            var rectangle = bulletRect.createChild(am4core.Rectangle);
            rectangle.stroke = interfaceColors.getFor("background");
            rectangle.strokeWidth = 2;
            rectangle.width = 10;
            rectangle.height = 10;
            break;
        default:
            var bulletDefault = series.bullets.push(new am4charts.CircleBullet());
            bulletDefault.circle.stroke = am4core.color("#dc6967");
            bulletDefault.circle.fill = am4core.color("#dc6967");
            bulletDefault.circle.strokeWidth = 2;
            break;
    }
}