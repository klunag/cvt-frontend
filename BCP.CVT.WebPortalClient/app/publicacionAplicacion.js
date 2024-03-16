var $table = $("#tblRegistro");
var URL_API_VISTA = URL_API + "/Aplicacion/GestionAplicacion";
var DATA_EXPORTAR = {};
var DATA_TABLE = {};
var TITULO_MENSAJE = "Portafolio de aplicaciones";
var COLUMNAS_TABLE = [];
var TABLA_PROCEDENCIA = { CVT_APLICACION: 1, APP_APLICACIONDETALLE: 2, DATA_APLICACION: 3 };

$(function () {
    getColumnasBT();
    if (COLUMNAS_TABLE !== null && COLUMNAS_TABLE.length > 0) {
        listarRegistros2();
    } else {
        bootbox.alert({
            size: "sm",
            title: TITULO_MENSAJE,
            message: "No existen columnas seleccionadas.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    }
});

function listarRegistros() {
    DATA_EXPORTAR = {};
    //data.SolicitudAplicacionId = Id;
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 15;
    //data.sortName = 'FechaCreacion';
    //data.sortOrder = 'desc';

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/ListarPublicacionAplicacion",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result !== null) {
                let data = result.Rows;
                if (data !== null && data.length > 0) {
                    debugger;
                    console.log(data);
                    let columnas = setColumnBT(data);
                    initTable(columnas, result);
                    
                } else {
                    bootbox.alert({
                        size: "sm",
                        title: TITULO_MENSAJE,
                        message: "No hay registros hasta el momento.",
                        buttons: {
                            ok: {
                                label: 'Aceptar',
                                className: 'btn-primary'
                            }
                        }
                    });
                }
            }
        },
        complete: function (data) {
            if (ControlarCompleteAjax(data)) {
                console.log(data);
            } else
                MensajeErrorCliente();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });
}

function initTable(columnas_tbl, data_tbl) {
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        pagination: true,
        columns: columnas_tbl,
        data: data_tbl.Rows,
        pageNumber: 1,
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        //sortName: 'FechaCreacion',
        //sortOrder: 'desc',
        responseHandler: function (res) {
            debugger;
            waitingDialog.hide();
            var data = res;
            return { rows: data_tbl.Rows, total: data_tbl.Total };
        },
        onLoadError: function (status, res) {
            waitingDialog.hide();
            bootbox.alert("Se produjo un error al listar los registros");
        },
        onSort: function (name, order) {
            //waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            alert("test");
        },
        onPageChange: function (number, size) {
            //waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            alert("test");
        }
    });
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let url = `${URL_API_VISTA}/Exportar?TablaProcedencia=${DATA_EXPORTAR.TablaProcedencia}&Procedencia=${DATA_EXPORTAR.Procedencia}`;
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

function listarRegistros2() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/ListarPublicacionAplicacion",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        columns: COLUMNAS_TABLE,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.TablaProcedencia = String.Format("{0};{1}", TABLA_PROCEDENCIA.CVT_APLICACION, TABLA_PROCEDENCIA.APP_APLICACIONDETALLE);
            DATA_EXPORTAR.Procedencia = TABLA_PROCEDENCIA.CVT_APLICACION;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            debugger;
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

function getColumnasBT() {
    let tablaProcedencia = String.Format("{0};{1}", TABLA_PROCEDENCIA.CVT_APLICACION, TABLA_PROCEDENCIA.APP_APLICACIONDETALLE);
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GetColumnaAplicacionToJS?tablaProcedencia=${tablaProcedencia}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    debugger;
                    COLUMNAS_TABLE = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    //return columnas;
}