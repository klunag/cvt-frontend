var $table = $("#tblEquiposDes");
//var $table = $("#tblEquiposDes");
var URL_API_VISTA = URL_API + "/Equipo";
//var DATA_EXPORTAR = {};
var DATA_EXPORTAR_EQ_DESACTIVOS = {};
var TITULO_MENSAJE = "Equipos desactivados";
//var MENSAJE_CARGA_MASIVA = "";
//var TITULO_CARGA_MASIVA = "Resumen de importación de equipos";
var FLAG_ACTIVO_EQUIPO = null;
const arrMultiSelect = [
    { SelectId: "#cbFilTipoEquipo", DataField: "TipoEquipo" },
    { SelectId: "#cbFilSubsidiaria", DataField: "DominioRed" }
];
$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    CargarCombos();
    //FormatoCheckBox($("#divFlagExCal"), 'cbFlagExCal');
    //$("#cbFlagExCal").change(FlagExclusion_Change);

    //validarFormTipo();
    //validarAddOrEditForm();
    //validarAddOrEditForm();
    //validarAddOrEditFormSO();
    //validarFormImportar();

    //listarEquipos();
    listarEquiposDesactivados();
    //InitAutocompletarBuilder($("#txtBusEq"), null, ".containerFiltro", "/Equipo/GetEquipoByFiltro?filtro={0}");

    //initUpload($("#txtArchivo"));
});


function RefrescarListado() {
    listarEquiposDesactivados();
}

function listarEquiposDesactivados() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy').bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListadoEquipoDesactivados",
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
            DATA_EXPORTAR_EQ_DESACTIVOS = {};
            DATA_EXPORTAR_EQ_DESACTIVOS.nombre = $.trim($("#txtBusEq").val());
            DATA_EXPORTAR_EQ_DESACTIVOS.tipoEquipoIds = CaseIsNullSendFilter($("#cbFilTipoEquipo").val());
            DATA_EXPORTAR_EQ_DESACTIVOS.desId = "-1";//$("#cbFilDes").val();
            DATA_EXPORTAR_EQ_DESACTIVOS.exCalculoId = "-1"; //$("#cbFilExCal").val();
            DATA_EXPORTAR_EQ_DESACTIVOS.subsidiariaIds = CaseIsNullSendFilter($("#cbFilSubsidiaria").val());
            DATA_EXPORTAR_EQ_DESACTIVOS.flagActivo = FLAG_ACTIVO_EQUIPO;
            DATA_EXPORTAR_EQ_DESACTIVOS.pageNumber = p.pageNumber;
            DATA_EXPORTAR_EQ_DESACTIVOS.pageSize = p.pageSize;
            DATA_EXPORTAR_EQ_DESACTIVOS.sortName = p.sortName;
            DATA_EXPORTAR_EQ_DESACTIVOS.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_EQ_DESACTIVOS);
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
        },
        onLoadSuccess: function (data) {
            //$("#mdEquiposDes").modal(opcionesModal);
        }
        //onExpandRow: function (index, row, $detail) {
        //    let data = ListarRegistrosDetalle(row.Id);
        //    if (data.length > 0) {
        //        $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("destroy");
        //        $('#tblRegistrosDetalle_' + row.Id).bootstrapTable({ data: data });
        //        $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("hideLoading");
        //    } else $detail.empty().append("No existe registros");
        //}
    });
}

function ExportarEquiposDesactivados() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR_EQ_DESACTIVOS.tipoEquipoIds = CaseIsNullSendExport(DATA_EXPORTAR_EQ_DESACTIVOS.tipoEquipoIds);
    DATA_EXPORTAR_EQ_DESACTIVOS.subsidiariaIds = CaseIsNullSendExport(DATA_EXPORTAR_EQ_DESACTIVOS.subsidiariaIds);

    let url = `${URL_API_VISTA}/GestionEquipos/Exportar/Desactivados?filtro=${DATA_EXPORTAR_EQ_DESACTIVOS.nombre}&tipoEquipoId=${DATA_EXPORTAR_EQ_DESACTIVOS.tipoEquipoIds}&desId=${DATA_EXPORTAR_EQ_DESACTIVOS.desId}&exCalculoId=${DATA_EXPORTAR_EQ_DESACTIVOS.exCalculoId}&flagActivo=${DATA_EXPORTAR_EQ_DESACTIVOS.flagActivo}&subsidiariaId=${DATA_EXPORTAR_EQ_DESACTIVOS.subsidiariaIds}&sortName=${DATA_EXPORTAR_EQ_DESACTIVOS.sortName}&sortOrder=${DATA_EXPORTAR_EQ_DESACTIVOS.sortOrder}`;
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

function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //FILTROS MULTISELECT
                    SetDataToSelectMultiple(arrMultiSelect, dataObject);

                    //SetItems(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_TODOS);
                    //SetItems(dataObject.DominioRed, $("#cbFilSubsidiaria"), TEXTO_TODOS);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}