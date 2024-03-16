var $table = $("#tblRegistros");
var URL_API_VISTA = URL_API + "/instanciasBD";
var DATA_EXPORTAR = {};
const TITULO_MENSAJE = "Instancias BD";

$(function () {  
    InitAutocompletarBuilder($("#txtEquipo"), $("#hEquipo"), ".containerFiltroEquipo", "/Equipo/GetEquipoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtAplicacion"), $("#hAplicacion"), ".containerFiltroAplicacion", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    listarRegistros();
    
});
function buscarRegistros() {
    validarBusqueda();
    listarRegistros();
}

function validarBusqueda() {
    if($("#txtEquipo").val() == "")
        $("#hEquipo").val(0)
    if ($("#txtAplicacion").val() == "")
        $("#hAplicacion").val('')
}
function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/listar",
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
            DATA_EXPORTAR.Nombre = $.trim($("#txtNombre").val());
            DATA_EXPORTAR.EquipoId = $.trim($("#hEquipo").val());
            DATA_EXPORTAR.Procedencia = $.trim($("#cbProcedencia").val());
            DATA_EXPORTAR.CodigoApt = $.trim($("#hAplicacion").val());
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
    let style_color = row.FlagActivo ? 'iconoVerde ' : "iconoRojo ";    
    let type_icon = row.FlagActivo ? "check" : "unchecked";
    let estado = `<a href="javascript:cambiarEstado(${row.Id}, ${row.FlagActivo})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    return estado;
}

function cambiarEstado(id, estado) {
    let msj = 'activar';
    let msj2 = '';
    if (estado) {
        msj = 'desactivar';
        $.ajax({
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            url: `${URL_API_VISTA}/ValidarCambiarEstado?Id=${id}`,
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        if (dataObject == "0") {
                            msj2 = 'La instancia de BD que quiere desactivar es usada en una relación.'
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
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: msj2+" ¿Estás seguro que deseas " + msj + " la Instancia registrada?",
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result) {
                var params = {};
                params.Id = id;
                $.ajax({
                    type: "POST",
                    url: URL_API_VISTA + "/cambiarEstado",
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

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }
    let url = `${URL_API_VISTA}/Exportar?Nombre=${DATA_EXPORTAR.Nombre}&EquipoId=${DATA_EXPORTAR.EquipoId}&Procedencia=${DATA_EXPORTAR.Procedencia}&CodigoApt=${DATA_EXPORTAR.CodigoApt}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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
