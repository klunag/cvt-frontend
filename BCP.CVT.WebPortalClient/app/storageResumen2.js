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
        url: URL_API_VISTA + "/Storage/Resumen2/Nivel1",
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
        field: 'DetalleUbicacion',
        title: 'Ubicación',
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
    columns.push({
        field: 'ReplicadoTB',
        title: 'Espacio <br/>replicado en TB',
        class: 'fondoAmarillo',
        footerFormatter: sumaFormatter
    });
    columns.push({
        field: 'NoReplicadoTB',
        title: 'Espacio <br/>no replicado en TB',
        class: 'fondoAmarillo',
        footerFormatter: sumaFormatter
    });

    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel2($detail, row.UbicacionId);
        }
    });
}


function expandTableNivel2($detail, UbicacionId) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.UbicacionId = UbicacionId;
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Storage/Resumen2/Nivel2",
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
        field: 'NombreTier',
        title: 'Tier',
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
    columns.push({
        field: 'ReplicadoTB',
        title: 'Espacio <br/>replicado en TB',
        class: 'fondoAmarillo',
        footerFormatter: sumaFormatter
    });
    columns.push({
        field: 'NoReplicadoTB',
        title: 'Espacio <br/>no replicado en TB',
        class: 'fondoAmarillo',
        footerFormatter: sumaFormatter
    });
    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel3($detail, row.UbicacionId, row.StorageTierId);
        }
    });
}

function expandTableNivel3($detail, UbicacionId, StorageTierId) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.UbicacionId = UbicacionId;
    DATA_EXPORTAR.StorageTierId = StorageTierId;
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Storage/Resumen2/Nivel3",
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
        field: 'NombreStorage',
        title: 'Storage',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'Obsoleto',
        title: 'Obsolescencia storage',
        class: 'fondoBlanco',
        formatter: 'semaforoFormatter'
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
    columns.push({
        field: 'ReplicadoTB',
        title: 'Espacio <br/>replicado en TB',
        class: 'fondoAmarillo',
        footerFormatter: sumaFormatter
    });
    columns.push({
        field: 'NoReplicadoTB',
        title: 'Espacio <br/>no replicado en TB',
        class: 'fondoAmarillo',
        footerFormatter: sumaFormatter
    });
    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel4($detail, row.UbicacionId, row.StorageTierId, row.StorageId);
        }
    });
}

function expandTableNivel4($detail, UbicacionId, StorageTierId, StorageId) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.UbicacionId = UbicacionId;
    DATA_EXPORTAR.StorageTierId = StorageTierId;
    DATA_EXPORTAR.StorageId = StorageId;
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Storage/Resumen2/Nivel4",
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
        field: 'NombreReporte',
        title: 'Dominio',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'Obsoleto',
        title: 'Obsolescencia storage',
        class: 'fondoBlanco',
        formatter: 'semaforoFormatter'
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
    columns.push({
        field: 'ReplicadoTB',
        title: 'Espacio <br/>replicado en TB',
        class: 'fondoAmarillo',
        footerFormatter: sumaFormatter
    });
    columns.push({
        field: 'NoReplicadoTB',
        title: 'Espacio <br/>no replicado en TB',
        class: 'fondoAmarillo',
        footerFormatter: sumaFormatter
    });
    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel5($detail, row.UbicacionId, row.StorageTierId, row.StorageId, row.NombreReporte);
        }
    });
}

function expandTableNivel5($detail, UbicacionId, StorageTierId, StorageId, NombreReporte) {
    var data = [];
    let DATA_EXPORTAR = {};

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.UbicacionId = UbicacionId;
    DATA_EXPORTAR.StorageTierId = StorageTierId;
    DATA_EXPORTAR.StorageId = StorageId;
    DATA_EXPORTAR.NombreReporte = NombreReporte;
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 10000;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Storage/Resumen2/Nivel5",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableNivel5($detail.html('<table></table>').find('table'), data);
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

function buildTableNivel5($el, data) {
    var columns = [];

    //Agregar las columnas
    columns.push({
        field: 'Nombre',
        title: 'Equipo',
        footerFormatter: totalFormatter
    });
    columns.push({
        field: 'ClaveTecnologia',
        title: 'Sistema Operativo'
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
    columns.push({
        field: 'ReplicadoTB',
        title: 'Espacio <br/>replicado en GB',
        class: 'fondoAmarillo',
        footerFormatter: sumaFormatter
    });
    columns.push({
        field: 'NoReplicadoTB',
        title: 'Espacio <br/>no replicado en GB',
        class: 'fondoAmarillo',
        footerFormatter: sumaFormatter
    });
    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTableNivel6($detail, row.EquipoId);
        }
    });
}

function expandTableNivel6($detail, EquipoId) {
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
                buildTableNivel6($detail.html('<table></table>').find('table'), data);
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

function buildTableNivel6($el, data) {
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
        field: 'Criticidad',
        title: 'Criticidad'
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

function semaforoFormatter(value, row, index) {
    var html = "";
    if (row.Obsoleto === 0) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.Obsoleto === 1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
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