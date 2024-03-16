var $table = $("#tblMensajes");
var URL_API_VISTA = URL_API + "/Alerta/Mensajes";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Mensajes";
//var fileDownloadCheckTimer;

$(function () {
    //FormatoCheckBox($("#divActivo"), 'cbActTipo');
    //FormatoCheckBox($("#divFlagStandar"), 'cbFlagEstandar');

    //$("#cbActTipo").change(function () {
    //    LimpiarValidateErrores($("#formAddOrEditTipo"));
    //});

    //$("#cbFlagEstandar").change(function () {
    //    LimpiarValidateErrores($("#formAddOrEditTipo"));
    //});
    //validarFormTipo();
    InitFecha();
    cargarCombos();
    listarMensajes();
});

function InitFecha() {
 
    $("#divFechaRegistro").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
}


function RefrescarListado() {
    listarMensajes();
}

function listarMensajes() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Matricula = $.trim($("#txtMatricula").val());
            DATA_EXPORTAR.nombre = $.trim($("#txtNombre").val());
            DATA_EXPORTAR.tipoId = $("#cbTipoMensaje").val();
            DATA_EXPORTAR.FechaRegistro = $.trim($("#txtFechaRegistro").val()) !== "" ? castDate($("#txtFechaRegistro").val()) : null;
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

function cargarCombos() {
    //debugger;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoMensaje, $("#cbTipoMensaje"), TEXTO_TODOS);
                    SetItems(dataObject.TipoMensaje, $("#cbTipoX"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.TipoEquipo, $("#cbFilTipoEq"), TEXTO_TODOS);
                    //SetItems(dataObject.Descubrimiento, $("#cbFilDes"), TEXTO_TODOS);
                    //SetItems(dataObject.SO, $("#cbSO"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.EstadoCalculo, $("#cbFilExCal"), TEXTO_TODOS);
                    //SetItems(dataObject.TipoExclusion, $("#cbTipoExclusion"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.DominioRed, $("#cbDominioRed"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.CaracteristicaEquipo, $("#cbCaracteristica"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:VerDetalleMensaje(${row.Id})" title="Ver mensaje">${value}</a>`;
}

function VerDetalleMensaje(MensajeId) {
    $.ajax({
        url: URL_API_VISTA + `/GetMensajeById?Id=${MensajeId}`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    $("#hMatriculaX").html(dataObject.UsuarioCreacion);
                    $("#hNombreX").html(dataObject.NombreUsuarioCreacion);
                    $("#hdMensajeIdX").val(dataObject.Id);
                    $("#cbTipoX").val(dataObject.TipoMensajeId);
                    $("#txtAsuntoX").val(dataObject.Asunto);
                    $("#txtDescripcionX").val(dataObject.Descripcion);

                    $("#mdVerMensaje").modal(opcionesModal);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let url = `${URL_API_VISTA}/Exportar?matricula=${DATA_EXPORTAR.Matricula}&nombre=${DATA_EXPORTAR.nombre}&tipoId=${DATA_EXPORTAR.tipoId}&fechaRegistro=${DATA_EXPORTAR.FechaRegistro}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function cerrarVerMensaje() {
    RefrescarListado();
    $("#mdVerMensaje").modal('hide');
}