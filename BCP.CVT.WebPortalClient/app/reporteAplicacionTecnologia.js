var $table = $('#table');
var URL_API_VISTA = URL_API + "/Portafolio";
var URL_API_VISTA_2 = URL_API + "/Dashboard";

const arrMultiSelect = [
    { SelectId: "#cbFilEstado", DataField: "EstadoAplicacion" },
    { SelectId: "#txtJefeEquipo", DataField: "ClasificacionTecnica" },
    { SelectId: "#txtOwner", DataField: "ClasificacionTecnica" },
    { SelectId: "#txtTTL", DataField: "ClasificacionTecnica" }
];

$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    CargarCombos();

    InitAutocompletarBuilder($("#txtAplicacion"), $("#hdAplicacionId"), ".containerAplicacion", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    setDefaultHd($("#txtAplicacion"), $("#hdAplicacionId"));

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
    columns.push({
        field: 'Deprecado',
        title: 'Total tecnologías <br/>Deprecadas',
        class: 'fondoCeleste'
    });
    columns.push({
        field: 'TotalSubdominio',
        title: 'Total <br/>tecnologías <br/>relacionadas',
        class: 'fondoBlanco',
        footerFormatter: subdominioFormatter
    });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: false,
        onExpandRow: function (index, row, $detail) {
            expandTableAplicaciones($detail, row.NombreReporte);
        }
    });
}


function listarDatosIniciales() {
    let noRegistros = false;

    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.JefeEquipoFiltro = CaseIsNullSendExport($("#txtJefeEquipo").val());//$("#txtJefeEquipo").val();
    DATA_EXPORTAR.LiderUsuarioFiltro = CaseIsNullSendExport($("#txtOwner").val());//$("#txtOwner").val();
    DATA_EXPORTAR.CodigoAPT = $("#hdAplicacionId").val() !== "0" ? $("#hdAplicacionId").val() : $("#txtAplicacion").val();  //: $("#hdAplicacionId").val(); //$("#txtAplicacion").val() || ""
    DATA_EXPORTAR.EstadoFiltro = CaseIsNullSendExport($("#cbFilEstado").val()); //$("#cbFilEstado").val(); //TODO
    DATA_EXPORTAR.TTLFiltro = CaseIsNullSendExport($("#txtTTL").val());//$("#txtTTL").val();
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 100;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Aplicaciones",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                if (data.Total > 0) {
                    noRegistros = false;
                    buildTableInicial(data);
                }
                else {
                    $table.bootstrapTable('destroy');
                    noRegistros = true;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {
            waitingDialog.hide();
            if (noRegistros)
                bootbox.alert("No tienes acceso a ver la configuración de esta aplicación");
        },
        async: true
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

function CargarCombos() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA_2 + "/Aplicacion/ListarCombos/Resumen",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItemsMultiple(dataObject.EstadoAplicacion, $("#cbFilEstado"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.JefeEquipo, $("#txtJefeEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.LiderUsuario, $("#txtOwner"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TTL, $("#txtTTL"), TEXTO_TODOS, TEXTO_TODOS, true);
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

function expandTableAplicaciones($detail, subdominio) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.JefeEquipoFiltro = CaseIsNullSendExport($("#txtJefeEquipo").val());//$("#txtJefeEquipo").val();
    DATA_EXPORTAR.LiderUsuarioFiltro = CaseIsNullSendExport($("#txtOwner").val());//$("#txtOwner").val();
    DATA_EXPORTAR.CodigoAPT = $("#hdAplicacionId").val() !== "0" ? $("#hdAplicacionId").val() : $("#txtAplicacion").val();  //: $("#hdAplicacionId").val(); //$("#txtAplicacion").val() || ""
    DATA_EXPORTAR.EstadoFiltro = CaseIsNullSendExport($("#cbFilEstado").val()); //$("#cbFilEstado").val(); //TODO
    DATA_EXPORTAR.TTLFiltro = CaseIsNullSendExport($("#txtTTL").val());//$("#txtTTL").val();
    DATA_EXPORTAR.SubdominioFiltro = subdominio;
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Aplicaciones/Detalle",
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
        },
        complete: function (data) {

        },
        async: true
    });
}

function buildTableAplicaciones($el, data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'ClaveTecnologia',
        title: 'Tecnología'
    });
    columns.push({
        field: 'CodigoAPT',
        title: 'Aplicación'
    });
    columns.push({
        field: 'TipoComponente',
        title: 'Tipo'
    });
    columns.push({
        field: 'DetalleAmbiente',
        title: 'Ambiente'
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
    columns.push({
        field: 'DeprecadoToString',
        title: 'Deprecados',
        class: 'fondoCeleste'
    });
    columns.push({
        field: 'TotalSubdominio',
        title: 'Total <br/>tecnologías <br/>relacionadas',
        class: 'fondoBlanco',
        footerFormatter: subdominioFormatter
    });
    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: false,
        showFooter: false,
        onExpandRow: function (index, row, $detail) {

        }
    });
}