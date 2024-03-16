var $table = $("#tblData");
var URL_API_VISTA = URL_API + "/Configuracion";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Auditoría";

var columnsInicial = [
    { field: '#', formatter: rowNumFormatterServer, title: '#', width: '5%' },
    { field: 'Capa', title: 'Capa ', width: '5%' },
    { field: 'Archivo', title: 'Archivo ', width: '15%' },
    { field: 'Tipo', title: 'Tipo de Mensaje', width: '10%' },
    { field: 'Metodo', title: 'Metodo', width: '20%' },
    { field: 'Detalle', title: 'Mensaje', width: '30%' },
    { field: 'FechaCreacionFormato', title: 'Fecha', width: '15%' },
]



$(function () {
    InitFecha();
    CargarCombos();
    $("#btnBuscar").click(listarDatos);
    validarCampos();
});

function InitFecha() {
    $("#divFechaProceso").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
}
function CargarCombos() {
    

    var lsttipo = $("#cboTipoMensaje");
    lsttipo.html("");
    lsttipo.append($("<option />").val("").text('TODOS'));
    lsttipo.append($("<option />").val("I").text('Info'));
    lsttipo.append($("<option />").val("E").text('Error'));

    var lstcapa = $("#cboCapa");
    lstcapa.html("");
    lstcapa.append($("<option />").val("").text('TODOS'));
    lstcapa.append($("<option />").val("BE").text('BackEnd'));
    lstcapa.append($("<option />").val("FE").text('FrontEnd'));
    lstcapa.append($("<option />").val("BD").text('Base de Datos'));
    lstcapa.append($("<option />").val("WJ").text('Web Job'));

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoProceso, $("#cbFilAccion"), '-- Elegir Origen --');                    
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });




    

}
function validarCampos() {
    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbFilAccion: {
                requiredSelect: true
            }
        },
        messages: {
            cbFilAccion: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "origen")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbFilAccion") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function RefrescarListado() {
   listarDatos();
}
function listarDatos() {
    if ($("#formFiltros").valid()) {
        $("#strtitletable").html("Procesos Logs");
        listarDatosAjax();
        //var tipo = $("#cbFilAccion").val();
        //if (tipo > 0) {
        //    if (tipo == 1) {
        //        $("#strtitletable").html("Bitacora de Certificado Digital");
        //        listarDatosAjaxXCD();
        //    } else {
        //        $("#strtitletable").html("Logs de Procesos de JOB");
        //        listarDatosAjaxJOBS();
        //    }
        //}
    }
}
function listarDatosAjax() {
    buildTableInicial();
}
function buildTableInicial() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/LogsProcesos/Listar",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        columns: columnsInicial,
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.ProcesoId = $("#cbFilAccion").val();
            DATA_EXPORTAR.Fecha = $("#txtFiltroFechaProceso").val();
            DATA_EXPORTAR.Tipo = $("#cboTipoMensaje").val();
            DATA_EXPORTAR.Capa = $("#cboCapa").val();
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
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

function ExportarInfo() {
    if ($("#formFiltros").valid()) {
        DATA_EXPORTAR = {};
        DATA_EXPORTAR.ProcesoId = $("#cbFilAccion").val();
        DATA_EXPORTAR.Fecha = $("#txtFiltroFechaProceso").val();
        DATA_EXPORTAR.Tipo = $("#cboTipoMensaje").val();
        DATA_EXPORTAR.Capa = $("#cboCapa").val();
        //debugger;
        $("#strtitletable").html("Procesos Logs");
        listarDatosAjax();
        let url = `${URL_API_VISTA}/LogsProcesos/ExportarProcesosLogs?procesoid=${DATA_EXPORTAR.ProcesoId}&fechaFiltro=${DATA_EXPORTAR.Fecha}&tipo=${DATA_EXPORTAR.Tipo}&capa=${DATA_EXPORTAR.Capa}`;
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

}






