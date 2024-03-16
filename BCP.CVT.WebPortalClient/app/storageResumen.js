var $table = $('#table');
var URL_API_VISTA = URL_API + "/Dashboard";

$(function () {
    listarNivel1();
});

function RefrescarListado() {
    listarNivel1();
}

function listarNivel1() {
    let noRegistros = false;

    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 100;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Storage/Nivel1",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                if (data.Total > 0) {
                    //noRegistros = false;
                    buildTableNivel1(data);
                }
                else {
                    $table.bootstrapTable('destroy');
                    //noRegistros = true;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {
            waitingDialog.hide();
            //if (noRegistros)
            //    bootbox.alert("No tienes acceso a ver la configuración de esta sección");
        },
        async: true
    });
}

function buildTableNivel1(data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'Nombre',
        title: 'Storage',
        footerFormatter: totalFormatter
    });    
    columns.push({
        field: 'UsadoTB',
        title: 'Espacio usado en TB',
        class: 'fondoBlanco',
        footerFormatter: sumaFormatter
    });
    columns.push({
        field: 'LibreTB',
        title: 'Espacio libre en TB',
        class: 'fondoBlanco',
        footerFormatter: sumaFormatter
    });
    columns.push({
        field: 'CapacidadTB',
        title: 'Espacio total en TB',
        class: 'fondoVerdeLeve',
        footerFormatter: sumaFormatter
    });
    
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel2($detail, row.StorageId);
        }
    });
}


function expandTableNivel2($detail, StorageId) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};    
    DATA_EXPORTAR.StorageId = StorageId;
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Storage/Nivel2",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableNivel2($detail.html('<table></table>').find('table'), data);
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

function buildTableNivel2($el, data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'StorageVolumen',
        title: 'Volumen',
        footerFormatter: totalFormatter
    });    
    columns.push({
        field: 'UsadoTB',
        title: 'Espacio usado en TB',
        class: 'fondoBlanco',
        footerFormatter: sumaFormatter
    });
    columns.push({
        field: 'LibreTB',
        title: 'Espacio libre en TB',
        class: 'fondoBlanco',
        footerFormatter: sumaFormatter
    });
    columns.push({
        field: 'CapacidadTB',
        title: 'Espacio total en TB',
        class: 'fondoVerdeLeve',
        footerFormatter: sumaFormatter
    });
    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel3($detail, row.StorageId, row.StorageVolumen);
        }
    });
}

function expandTableNivel3($detail, StorageId, StorageVolumen) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.StorageId = StorageId;
    DATA_EXPORTAR.StorageVolumen = StorageVolumen;
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Storage/Nivel3",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableNivel3($detail.html('<table></table>').find('table'), data);
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

function buildTableNivel3($el, data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'Equipo',
        title: 'Servidor',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'TieneReplicaToString',
        title: 'Replicado'
    });    
    columns.push({
        field: 'UsadoTB',
        title: 'Espacio usado en GB',
        class: 'fondoBlanco',
        footerFormatter: sumaFormatter
    });
    columns.push({
        field: 'LibreTB',
        title: 'Espacio libre en GB',
        class: 'fondoBlanco',
        footerFormatter: sumaFormatter
    });
    columns.push({
        field: 'CapacidadTB',
        title: 'Espacio total en GB',
        class: 'fondoVerdeLeve',
        footerFormatter: sumaFormatter
    });
    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel4($detail, row.EquipoId);
        }
    });
}

function expandTableNivel4($detail, EquipoId) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.EquipoId = EquipoId;    
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Storage/Nivel4",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableNivel4($detail.html('<table></table>').find('table'), data);
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

function buildTableNivel4($el, data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'CodigoAPT',
        title: 'Código'
    });
    columns.push({
        field: 'Nombre',
        title: 'Nombre'
    });
    columns.push({
        field: 'EstadoAplicacion',
        title: 'Estado aplicación'        
    });
    columns.push({
        field: 'TipoActivoInformacion',
        title: 'Tipo activo'
    });
    columns.push({
        field: 'ClasificacionTecnica',
        title: 'Clasificación técnica'
    });
    columns.push({
        field: 'SubclasificacionTecnica',
        title: 'Subclasificación técnica'
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

function sumaFormatter(data) {
    var field = this.field;
    var suma = data.map(function (row) {
        return +row[field];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    return '<strong>' + suma + '</strong>';
}

function totalFormatter() {
    return '<strong>Total General</strong>';
}