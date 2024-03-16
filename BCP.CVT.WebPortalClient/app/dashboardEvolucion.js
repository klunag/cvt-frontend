var URL_API_VISTA = URL_API + "/Dashboard/Tecnologia";
var URL_API_VISTA2 = URL_API + "/Dashboard";
var DATA_SUBDOMINIO = [];
var DATA_TIPOEQUIPO = [];
var $table = $("#tblRegistro");
var TITULO_MENSAJE = "Evolución por subdominios";
var chart;

$(function () {

    SetItemsMultiple([], $("#cbFilTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
    if (FLAG_ADMIN == 1) {
        SetItemsMultiple([], $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    } else {
        SetItemsMultiple([], $("#cbFilDominio"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
    }


    $table.bootstrapTable();

    CargarCombos();
    MethodValidarFecha(RANGO_DIAS_HABILES);
    initFecha();
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
    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    _BuildDatepicker($("#FechaFiltro"));
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
            cbFilDominioRed: {
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
            cbFilDominioRed: {
                requiredSelect: String.Format("Debes seleccionar la {0}.", "subsidiaria")
            },
            FechaFiltro: {
                required: "Debe seleccionar una fecha",
                isDate: "Debe ingresar una fecha valida",
                FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbFilSubdominio" || element.attr('name') === "cbFilDominio" || element.attr('name') === "FechaFiltro") {
                element.parent().parent().append(error);
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
        CargarReporte();
        listarRegistros();
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
                        //SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
                        SetItemsMultiple(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
                        SetItemsMultiple(dataObject.DominioRed, $("#cbFilDominioRed"), TEXTO_TODOS, TEXTO_TODOS, true);
                    } else {
                        $("#cbFilDominio").prop("multiple", "");
                        SetItemsMultiple(dataObject.Dominio, $("#cbFilDominio"), TEXTO_SELECCIONE, "", true, false);
                        $("#cbFilDominio").val('').multiselect("refresh");

                        //SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
                        SetItemsMultiple(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
                        SetItemsMultiple(dataObject.DominioRed, $("#cbFilDominioRed"), TEXTO_TODOS, TEXTO_TODOS, true);
                    }

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

function ExportarData() {
    //$("#formFiltros").validate().resetForm();
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        let _data = $table.bootstrapTable("getData") || [];
        //console.log(_data.length);
        if (_data.length === 0) {
            MensajeNoExportar(TITULO_MENSAJE);
            return false;
        }

        var subdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val().join() : $("#cbFilSubdominio").val();
        var tipoEquipoFiltrar = $("#cbFilTipoEquipo").val();
        var fecha = $("#FechaFiltro").val();
        var subsidiariaFiltrar = $("#cbFilDominioRed").val();

        let url = `${URL_API_VISTA2}/Reportes/GraficoEvolucion/Exportar?fecha=${fecha}&tipoEquipoFiltrar=${tipoEquipoFiltrar}&subdominioFiltrar=${subdominioFiltrar}&subsidiaria=${subsidiariaFiltrar}`;
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

function CargarReporte() {
    let data = {
        SubdominioFiltrar: $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()],
        TipoEquipoFiltrar: $("#cbFilTipoEquipo").val(),
        Fecha: $("#FechaFiltro").val(),
        SubsidiariaFiltrar: $("#cbFilDominioRed").val(),
        TipoConsultaId: $("#cbFilTipoConsulta").val()
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
    //dataAPI.forEach(function (e) { e.lineColor = "#dc6967"; });

    chart = am4core.create("report", am4charts.XYChart);
    chart.paddingRight = 20;
    chart.data = dataAPI;
    chart.dateFormatter.inputDateFormat = "yyyy-MM";

    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 50;
    dateAxis.baseInterval = { timeUnit: "month", count: 1 };

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;

    var series = chart.series.push(new am4charts.StepLineSeries());
    series.dataFields.dateX = "FechaFin";
    series.dataFields.valueY = "Total";
    series.tooltipText = "{valueY.value}";
    series.strokeWidth = 3;

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;
    chart.cursor.fullWidthLineX = true;
    chart.cursor.lineX.strokeWidth = 0;
    chart.cursor.lineX.fill = chart.colors.getIndex(2);
    chart.cursor.lineX.fillOpacity = 0.1;

    chart.scrollbarX = new am4core.Scrollbar();

    //chart.scrollbarX = new am4core.Scrollbar();
    //chart.colors.step = 2;


    //// Create axes
    //var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    //dateAxis.renderer.minGridDistance = 50;

    //// Create series    
    //createAxisAndSeries("Total", "Elementos", false, "circle");
    ////createAxisAndSeries("views", "Views", true, "triangle");
    ////createAxisAndSeries("hits", "Hits", true, "rectangle");

    //var paretoValueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    //paretoValueAxis.renderer.opposite = true;
    //paretoValueAxis.min = 0;
    //paretoValueAxis.max = 100;
    //paretoValueAxis.strictMinMax = true;
    //paretoValueAxis.renderer.grid.template.disabled = true;
    //paretoValueAxis.numberFormatter = new am4core.NumberFormatter();
    //paretoValueAxis.numberFormatter.numberFormat = "#'%'";
    //paretoValueAxis.cursorTooltipEnabled = false;


    //// Add legend
    //chart.legend = new am4charts.Legend();
    //chart.legend.parent = chart.plotContainer;
    //chart.legend.zIndex = 100;

    //// Add cursor
    //chart.cursor = new am4charts.XYCursor();

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

    //valueAxis.renderer.line.strokeOpacity = 1;
    //valueAxis.renderer.line.strokeWidth = 2;
    //valueAxis.renderer.line.stroke = series.stroke;    
    //valueAxis.renderer.labels.template.fill = series.stroke;
    //valueAxis.renderer.opposite = opposite;
    //valueAxis.renderer.grid.template.disabled = true;
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA2 + "/Reportes/GraficoEvolucion/Detalle",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        fixedColumns: true,
        fixedNumber: 4,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SubdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()];
            DATA_EXPORTAR.TipoEquipoFiltrar = $("#cbFilTipoEquipo").val();
            DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
            DATA_EXPORTAR.SubsidiariaFiltrar = $("#cbFilDominioRed").val();
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
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
}

function semaforoFormatter(value, row, index) {
    var html = "";
    if (row.IndicadorObsolescencia === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.IndicadorObsolescencia === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function semaforoIndice1Formatter(value, row, index) {
    var html = "";
    if (row.IndicadorObsolescencia_Proyeccion1 === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.IndicadorObsolescencia_Proyeccion1 === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function semaforoIndice2Formatter(value, row, index) {
    var html = "";
    if (row.IndicadorObsolescencia_Proyeccion2 === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.IndicadorObsolescencia_Proyeccion2 === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function linkFormatterEquipo(value, row, index) {
    if (row.EquipoId > 0)
        return `<a href="/Vista/DetalleEquipo?id=${row.EquipoId}" title="Ver detalle del equipo" target="_blank">${value}</a>`;
    else
        return '-';
}

function linkFormatterTecnologia(value, row, index) {
    //if (row.TecnologiaId > 0)
    //    return `<a href="TecnologiaEquipo/${row.TecnologiaId}" title="Ver detalle de la tecnología" target="_blank">${value}</a>`;
    //else
    //    return '-';
    if (row.TecnologiaId > 0) {
        return `<a href="TecnologiaEquipo/${row.TecnologiaId}" title="Ver detalle de la tecnología" target="_blank">${value}</a>`;
    } else {
        if (row.TipoEquipo == 'Appliance') {
            return `${value}`;
        } else {
            return '-';
        }
        return '-';
    }
}