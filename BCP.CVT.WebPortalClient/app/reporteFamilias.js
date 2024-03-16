var $table = $('#table');
var URL_API_VISTA = URL_API + "/Portafolio";
var URL_API_VISTA_2 = URL_API + "/Indicadores/Gerencial/Equipos";

$(function () {
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
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 100;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Productos",
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

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Productos/Familias",
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

function expandTableTecnologias($detail, orden, subdominio, nombre, fabricante) {
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

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Productos/Tecnologias",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableTecnologias($detail.html('<table></table>').find('table'), data);
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
            expandTableTecnologias($detail, row.Orden, row.Subdominio, row.NombreProducto, row.Fabricante);
        }
    });
}

function buildTableTecnologias($el, data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'NombreReporte',
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
        detailView: false,
        showHeader: false
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