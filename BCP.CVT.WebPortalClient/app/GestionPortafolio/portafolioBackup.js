var $table = $("#tblRegistro");
var URL_API_VISTA = URL_API + "/Aplicacion/GestionAplicacion/Portafolio/Backup";
var DATA_EXPORTAR = {};

const TITULO_MENSAJE = "Backup de Portafolios";


$(function () {
    validarFormGenerarBackup();
    listarRegistros();
    InitFecha();
    $("#btnBackup").click(IrGenerarBackupPortafolio);
});

function InitFecha() {
    $("#divFechaDesde").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
    $("#divFechaHasta").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
}

function RefrescarListado() {
    $table.bootstrapTable('refresh');
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listar",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Usuario = $("#txtFiltroMatricula").val();
            DATA_EXPORTAR.FechaDesde = $("#txtFiltroFechaDesde").val() == '' ? null : dateFromString($("#txtFiltroFechaDesde").val());
            DATA_EXPORTAR.FechaHasta = $("#txtFiltroFechaHasta").val() == '' ? null : dateFromString($("#txtFiltroFechaHasta").val());
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
    let btnDescargar = `<a href="javascript:DescargarArchivoBackup(${row.PortafolioBackupId})" title="Descargar backup"><i class="glyphicon glyphicon-download"></i></a>`;

    return btnDescargar;
}

function validarFormGenerarBackup() {

    $("#formRegistro").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtComentarios: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtComentarios: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "los comentarios")
            }
        }
    });
}

function limpiarModal() {
    $("#txtComentarios").val("");
    LimpiarValidateErrores($("#formRegistro"));
}
function IrGenerarBackupPortafolio(EstadoMd) {
    limpiarModal();
    if (EstadoMd)
        $("#MdGenerarBackupModal").modal(opcionesModal);
    else
        $("#MdGenerarBackupModal").modal('hide');

}

function GenerarBackupPortafolio() {
    if ($("#formRegistro").valid()) {
        $("#btnGenerarBackup").button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

        var objRegistro = {};
        objRegistro.Comentarios = $("#txtComentarios").val();

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(objRegistro),
            dataType: "json",
            success: function (result) {
                console.log(result);
                toastr.success("Se realizó correctamente", TITULO_MENSAJE);
            },
            complete: function () {
                $("#btnGenerarBackup").button("reset");

                $table.bootstrapTable('refresh');
                IrGenerarBackupPortafolio(false);
                waitingDialog.hide();
            },
            error: function (result) {
                //ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}


function DescargarArchivoBackup(id) {
    let url = `${URL_API_VISTA}/Obtener?idBackup=${id}`;
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