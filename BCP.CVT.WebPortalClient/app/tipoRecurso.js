var $table = $("#tblRegistros");
var URL_API_VISTA = URL_API + "/resources";
var DATA_EXPORTAR = {};
const TITULO_MENSAJE = "Tipo de recursos";

$(function () {  
    initDateTimePicker();
    listarRegistros();
    $("#btnExportarTypes").click(exportarRegistros);
    $("#btnExportarData").click(exportarAzureResourcesData);

    $("#txtFechaFiltro").blur(Foco_FechaFiltro);
});

function Foco_FechaFiltro() {
    let valor = $(this).val();
    $(this).val($.trim(valor) !== "" ? valor : moment(new Date()).format("DD/MM/YYYY"));
}

function initDateTimePicker() {
    $("#divFechaFiltro").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
}

function buscarRegistros() {
    listarRegistros();
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/types",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Name',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBuscar").val());
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

function opciones(value, row, index) {
    let style_color = row.IsActive ? 'iconoVerde ' : "iconoRojo ";    
    let type_icon = row.IsActive ? "check" : "unchecked";
    let estado = `<a href="javascript:cambiarEstado(${row.ResourceTypeId})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return estado;
}

function virtualMachineFormatter(value, row, index) {
    let style_color = row.IsVirtualMachine ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.IsVirtualMachine ? "check" : "unchecked";
    let opc_cb = `<a href="javascript:changeVirtualMachineState(${row.ResourceTypeId}, ${row.IsVirtualMachine})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return opc_cb;
}

function changeVirtualMachineState(id, vmState) {
    let _message = vmState ? "desactivar" : "activar";
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: `¿Estás seguro(a) que deseas ${_message} esta opción?`,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result) {
                let params = {
                    ObjetoId: id,
                };

                $.ajax({
                    type: "POST",
                    url: URL_API_VISTA + "/updateVirtualMachine",
                    dataType: "json",
                    data: params,
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                let state = dataObject;
                                if (state) {
                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    listarRegistros();
                                } else {
                                    toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                                }
                            }
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    }
                });
            }
        }
    });
}

function cambiarEstado(id) {
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás seguro que deseas activar el procesamiento del recurso?",
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result) {
                var params = {};
                params.ObjetoId = id;
                $.ajax({
                    type: "POST",                    
                    url: URL_API_VISTA + "/updateType",
                    dataType: "json",
                    data: params,
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                listarRegistros();
                            }
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    },
                    complete: function (data) {                        
                    }
                });
            }
        }
    });
}

function exportarRegistros() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }
    let url = `${URL_API_VISTA}/types/export?name=${DATA_EXPORTAR.nombre}`;
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

function exportarAzureResourcesData() {
    //let _data = $table.bootstrapTable("getData") || [];
    //if (_data.length === 0) {
    //    MensajeNoExportar(TITULO_MENSAJE);
    //    return false;
    //}

    let filterTrimmed = $.trim($("#txtFechaFiltro").val());
    //debugger;
    //let dateFilter = dateFromString(filterTrimmed);

    let url = `${URL_API_VISTA}/azureResources/export?dateFilter=${filterTrimmed}`;
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