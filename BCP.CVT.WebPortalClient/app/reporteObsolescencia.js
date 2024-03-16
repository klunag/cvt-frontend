var $table = $('#table');
var URL_API_VISTA = URL_API + "/Portafolio";
var URL_API_VISTA_2 = URL_API + "/Indicadores/Gerencial/Equipos";

$(function () {
    InitAutocompletarBuilder($("#txtAplicacion"), $("#hdFilAppId"), ".containerAplicacion", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    setDefaultHd($("#txtAplicacion"), $("#hdFilAppId"));

    //if (ES_ADMIN)
    $(".containerAdmin").show();
    //else
    //    $(".containerAdmin").hide();

    CargarCombos();
    listarDatosIniciales();
});

function RefrescarListado() {
    listarDatosIniciales();
}

function buildTableInicial(data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'NombreReporte',
        formatter: nombreReporteFormatter,
        title: 'Dominio tecnología',
        footerFormatter: dominioFormatter
    });
    columns.push({
        field: 'Ahora',
        title: 'Ahora',
        class: 'fondoRojo',
        footerFormatter: subdominioFormatter
    });
    columns.push({
        field: 'Meses12',
        title: '12 meses',
        class: 'fondoNaranja',
        footerFormatter: subdominioFormatter
    });
    columns.push({
        field: 'Meses24',
        title: '24 meses',
        class: 'fondoAmarillo',
        footerFormatter: subdominioFormatter
    });
    columns.push({
        field: 'Meses36',
        title: '36 meses',
        class: 'fondoVerdeLeve',
        footerFormatter: subdominioFormatter
    });
    columns.push({
        field: 'Mas36',
        title: '> 36 meses',
        class: 'fondoVerdeFuerte',
        footerFormatter: subdominioFormatter
    });
    //columns.push({
    //    field: 'DeprecadoToString',
    //    title: 'Deprecados',
    //    class: 'fondoCeleste'        
    //});
    columns.push({
        field: 'TotalSubdominio',
        title: 'Instancias <br />Data Center BCP',
        class: 'fondoBlanco',
        footerFormatter: subdominioFormatter
    });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableProductos($detail, row.Orden, row.Subdominio);
        }
    });
}

function CargarCombos() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA_2 + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {

                    SetItemsMultiple(dataObject.ListaTipoEquipos, $("#cbTipoEquipo"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.ListaSubsidiarias, $("#cbSubsidiaria"), TEXTO_SELECCIONE, TEXTO_TODAS, true);

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

function listarDatosIniciales() {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.TipoEquipoFiltro = CaseIsNullSendExport($("#cbTipoEquipo").val());
    DATA_EXPORTAR.SubsidiariaFiltro = CaseIsNullSendExport($("#cbSubsidiaria").val());
    DATA_EXPORTAR.AppsId = $("#cbRelacionApps").val();
    DATA_EXPORTAR.Aplicacion = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $("#txtAplicacion").val();
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 100;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Instancias",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableInicial(data);
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

function expandTableProductos($detail, orden, subdominio) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.TipoEquipoFiltro = CaseIsNullSendExport($("#cbTipoEquipo").val());
    DATA_EXPORTAR.SubsidiariaFiltro = CaseIsNullSendExport($("#cbSubsidiaria").val());
    DATA_EXPORTAR.AppsId = $("#cbRelacionApps").val();
    DATA_EXPORTAR.Orden = orden;
    DATA_EXPORTAR.Subdominio = subdominio;
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;
    DATA_EXPORTAR.Aplicacion = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $("#txtAplicacion").val();

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Instancias/Productos",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableProductos($detail.html('<table></table>').find('table'), data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {

        },
        async: true
    });
}

function expandTableEquipos($detail, orden, subdominio, nombre, fabricante) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.TipoEquipoFiltro = CaseIsNullSendExport($("#cbTipoEquipo").val());
    DATA_EXPORTAR.SubsidiariaFiltro = CaseIsNullSendExport($("#cbSubsidiaria").val());
    DATA_EXPORTAR.AppsId = $("#cbRelacionApps").val();
    DATA_EXPORTAR.Orden = orden;
    DATA_EXPORTAR.Subdominio = subdominio;
    DATA_EXPORTAR.Fabricante = fabricante;
    DATA_EXPORTAR.Nombre = nombre;
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;
    DATA_EXPORTAR.Aplicacion = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $("#txtAplicacion").val();

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Instancias/Equipos",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;

                $.each(data.Rows, function (index, item) {
                    item.Fabricante = fabricante;
                    item.NombreProducto = nombre;
                });
                  
                buildTableEquipos($detail.html('<table></table>').find('table'), data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {

        },
        async: true
    });
}

function expandTableAplicaciones($detail, orden, subdominio, tecnologia) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.TipoEquipoFiltro = CaseIsNullSendExport($("#cbTipoEquipo").val());
    DATA_EXPORTAR.SubsidiariaFiltro = CaseIsNullSendExport($("#cbSubsidiaria").val());
    DATA_EXPORTAR.AppsId = $("#cbRelacionApps").val();
    DATA_EXPORTAR.Orden = orden;
    DATA_EXPORTAR.Subdominio = subdominio;
    DATA_EXPORTAR.Tecnologia = tecnologia;
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;
    DATA_EXPORTAR.Aplicacion = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $("#txtAplicacion").val();

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Instancias/Aplicaciones",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableAplicaciones($detail.html('<table></table>').find('table'), data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {

        },
        async: true
    });
}

function buildTableProductos($el, data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'Familia',
        formatter: nombreReporteProductosFormatter,
        title: 'Dominio tecnología'
    });
    columns.push({
        field: 'Ahora',
        title: 'Ahora',
        class: 'fondoRojo'
    });
    columns.push({
        field: 'Meses12',
        title: '12 meses',
        class: 'fondoNaranja'
    });
    columns.push({
        field: 'Meses24',
        title: '24 meses',
        class: 'fondoAmarillo'
    });
    columns.push({
        field: 'Meses36',
        title: '36 meses',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'Mas36',
        title: '> 36 meses',
        class: 'fondoVerdeFuerte'
    });
    //columns.push({
    //    field: 'DeprecadoToString',
    //    title: 'Deprecados',
    //    class: 'fondoCeleste'
    //});
    columns.push({
        field: 'TotalSubdominio',
        title: 'Instancias <br />Data Center BCP',
        class: 'fondoBlanco'
    });

    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showHeader: false,
        onExpandRow: function (index, row, $detail) {
            /* eslint no-use-before-define: ["error", { "functions": false }]*/
            expandTableEquipos($detail, row.Orden, row.Subdominio, row.NombreProducto, row.Fabricante);
        }
    });
}

function buildTableEquipos($el, data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'NombreReporte',
        formatter: nombreReporteEquiposFormatter,
        title: 'Dominio tecnología'
    });
    columns.push({
        field: 'Ahora',
        title: 'Ahora',
        class: 'fondoRojo'
    });
    columns.push({
        field: 'Meses12',
        title: '12 meses',
        class: 'fondoNaranja'
    });
    columns.push({
        field: 'Meses24',
        title: '24 meses',
        class: 'fondoAmarillo'
    });
    columns.push({
        field: 'Meses36',
        title: '36 meses',
        class: 'fondoVerdeLeve'
    });
    columns.push({
        field: 'Mas36',
        title: '> 36 meses',
        class: 'fondoVerdeFuerte'
    });
    //columns.push({
    //    field: 'DeprecadoToString',
    //    title: 'Deprecados',
    //    class: 'fondoCeleste'
    //});
    columns.push({
        field: 'TotalSubdominio',
        title: 'Instancias <br />Data Center BCP',
        class: 'fondoBlanco'
    });

    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showHeader: false,
        onExpandRow: function (index, row, $detail) {
            expandTableAplicaciones($detail, row.Orden, row.Subdominio, row.TecnologiaId);
        }
    });
}

function buildTableAplicaciones($el, data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'CodigoAPT',
        //formatter: nombreReporteAplicacionesFormatter,
        title: 'Código'
    });
    columns.push({
        field: 'Nombre',
        title: 'Nombre'
    });
    columns.push({
        field: 'EstadoAplicacion',
        title: 'Estado de la aplicación'
    });
    columns.push({
        field: 'ClasificacionTecnica',
        title: 'Clasificación técnica'
    });
    columns.push({
        field: 'AreaBIAN',
        title: 'Área BIAN'
    });

    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: false
    });
}

function dominioFormatter() {
    return '<strong>Total General</strong>';
}

function subdominioFormatter(data) {
    var field = this.field;
    var suma = data.map(function (row) {
        return +row[field];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    return '<strong>' + suma + '</strong>';
}

function nombreReporteFormatter(value, row, index) {
    return `<a href="javascript:MostrarGraficoLineaTiempo('${value}')" title="Ver gráfico">${value}</a>`;
}

function nombreReporteProductosFormatter(value, row, index) {
    return `<a href="javascript:MostrarGraficoLineaTiempoProductos('${row.NombreProducto}',${row.Orden}, ${row.Subdominio})" title="Ver gráfico">${value}</a>`;
}

function nombreReporteEquiposFormatter(value, row, index) {
    return `<a href="javascript:MostrarGraficoLineaTiempoEquipos('${value}',${row.Orden}, ${row.Subdominio}, '${row.NombreProducto}', '${row.Fabricante}')" title="Ver gráfico">${value}</a>`;
}

function nombreReporteAplicacionesFormatter(value, row, index) {
    return `<a href="javascript:MostrarGraficoLineaTiempoAplicaciones('${value}', ${row.Orden}, ${row.Subdominio}, '${row.CodigoAPT}')" title="Ver gráfico">${value}</a>`;
}

function ObtenerDataGrafico(value) {
    var data = [];
    let params = {};

    params = {};
    params.TipoEquipoFiltro = CaseIsNullSendExport($("#cbTipoEquipo").val());
    params.SubsidiariaFiltro = CaseIsNullSendExport($("#cbSubsidiaria").val());
    params.AppsId = $("#cbRelacionApps").val();
    params.Aplicacion = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $("#txtAplicacion").val();
    params.Nombre = value;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Instancias/Grafico",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(params),
        dataType: "json",
        success: function (result) {

            if (result != null) {
                data = result;

                $("#mdlGrafico .modal-body").html("");
                $("#mdlGrafico .modal-body").append('<div id="chartdiv"></div>');
                $("#mdlGrafico .title-asignar").html(value);

                MostraGraficoGenerico(data);

                //OpenCloseModal($("#mdlGrafico"), true);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {
            waitingDialog.hide();
            OpenCloseModal($("#mdlGrafico"), true);
        },
        async: true
    });

    //return data;
}

function ObtenerDataGraficoProductos(value, orden, subdominio) {
    var data = [];
    let params = {};

    params = {};
    params.TipoEquipoFiltro = CaseIsNullSendExport($("#cbTipoEquipo").val());
    params.SubsidiariaFiltro = CaseIsNullSendExport($("#cbSubsidiaria").val());
    params.AppsId = $("#cbRelacionApps").val();
    params.Orden = orden;
    params.Subdominio = subdominio;
    params.Aplicacion = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $("#txtAplicacion").val();
    params.Nombre = value;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Instancias/Productos/Grafico",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(params),
        dataType: "json",
        success: function (result) {
            if (result != null) {
                data = result;
                $("#mdlGrafico .modal-body").html("");
                $("#mdlGrafico .modal-body").append('<div id="chartdiv"></div>');
                $("#mdlGrafico .title-asignar").html("Producto " + value);

                MostraGraficoGenerico(data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            waitingDialog.hide();
            OpenCloseModal($("#mdlGrafico"), true);
        },
        async: true
    });
    //return data;
}

function ObtenerDataGraficoEquipos(value, orden, subdominio, nombre, fabricante) {
    var data = [];
    let params = {};

    params = {};
    params.TipoEquipoFiltro = CaseIsNullSendExport($("#cbTipoEquipo").val());
    params.SubsidiariaFiltro = CaseIsNullSendExport($("#cbSubsidiaria").val());
    params.AppsId = $("#cbRelacionApps").val();
    params.Orden = orden;
    params.Subdominio = subdominio;
    params.Fabricante = fabricante;
    params.NombreTecnologia = nombre;
    params.Aplicacion = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $("#txtAplicacion").val();
    params.Nombre = value;
 
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Instancias/Equipos/Grafico",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(params),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;

                $("#mdlGrafico .modal-body").html("");
                $("#mdlGrafico .modal-body").append('<div id="chartdiv"></div>');
                $("#mdlGrafico .title-asignar").html("Equipo " + value);

                MostraGraficoGenerico(data);                
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {
            waitingDialog.hide();
            OpenCloseModal($("#mdlGrafico"), true);
        },
        async: true
    });

    //return data;
}


function ObtenerDataGraficoAplicaciones(value, orden, subdominio, tecnologia) {
    var data = [];
    let params = {};

    params = {};
    params.TipoEquipoFiltro = CaseIsNullSendExport($("#cbTipoEquipo").val());
    params.SubsidiariaFiltro = CaseIsNullSendExport($("#cbSubsidiaria").val());
    params.AppsId = $("#cbRelacionApps").val();
    params.Orden = orden;
    params.Subdominio = subdominio;
    params.Tecnologia = tecnologia;
    params.Aplicacion = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $("#txtAplicacion").val();
    params.Nombre = value;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Instancias/Aplicaciones/Grafico",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(params),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        async: false
    });

    return data;
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
    createAxisAndSeries("Ahora", "Ahora", false, "rectangle", '#E33D01');
    createAxisAndSeries("Meses12", "12 meses", false, "rectangle", '#FF7F0D');
    createAxisAndSeries("Meses24", "24 meses", false, "rectangle", '#FFDD5B');
    createAxisAndSeries("Meses36", "36 meses", true, "rectangle", '#91C337');
    createAxisAndSeries("Mas36", "mas de 36 meses", true, "rectangle", '#22A71C');

    // Add cursor
    chart.cursor = new am4charts.XYCursor();

    // Add legend
    chart.legend = new am4charts.Legend();
    chart.legend.position = "bottom";
}

function MostrarGraficoLineaTiempo(titulo) {
    //$("#mdlGrafico .modal-body").html("");
    //$("#mdlGrafico .modal-body").append('<div id="chartdiv"></div>');
    //$("#mdlGrafico .title-asignar").html(titulo);
    //var dataAPI = ObtenerDataGrafico(titulo);
    ObtenerDataGrafico(titulo);

    //MostraGraficoGenerico(dataAPI);

    //OpenCloseModal($("#mdlGrafico"), true);

}

function MostrarGraficoLineaTiempoProductos(titulo, orden, subdominio) {
    //$("#mdlGrafico .modal-body").html("");
    //$("#mdlGrafico .modal-body").append('<div id="chartdiv"></div>');
    //$("#mdlGrafico .title-asignar").html("Producto " + titulo);
    //var dataAPI = ObtenerDataGraficoProductos(titulo, orden, subdominio);
    ObtenerDataGraficoProductos(titulo, orden, subdominio);
    //MostraGraficoGenerico(dataAPI);

    //OpenCloseModal($("#mdlGrafico"), true);

}

function MostrarGraficoLineaTiempoEquipos(titulo, orden, subdominio, nombre, fabricante) {
    //$("#mdlGrafico .modal-body").html("");
    //$("#mdlGrafico .modal-body").append('<div id="chartdiv"></div>');
    //$("#mdlGrafico .title-asignar").html("Equipo " + titulo);
    //var dataAPI = ObtenerDataGraficoEquipos(titulo, orden, subdominio, nombre, fabricante);
    ObtenerDataGraficoEquipos(titulo, orden, subdominio, nombre, fabricante);
    //MostraGraficoGenerico(dataAPI);

    //OpenCloseModal($("#mdlGrafico"), true);

}

function MostrarGraficoLineaTiempoAplicaciones(titulo, orden, subdominio, tecnologia) {
    $("#mdlGrafico .modal-body").html("");
    $("#mdlGrafico .modal-body").append('<div id="chartdiv"></div>');
    $("#mdlGrafico .title-asignar").html("Aplicaciones " + titulo);
    var dataAPI = ObtenerDataGraficoAplicaciones(titulo, orden, subdominio, tecnologia);

    MostraGraficoGenerico(dataAPI);

    OpenCloseModal($("#mdlGrafico"), true);

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


    //valueAxis.renderer.line.strokeOpacity = 1;
    //valueAxis.renderer.line.strokeWidth = 2;
    //valueAxis.renderer.line.stroke = series.stroke;
    //valueAxis.renderer.labels.template.fill = series.stroke;
    //valueAxis.renderer.opposite = opposite;

}
