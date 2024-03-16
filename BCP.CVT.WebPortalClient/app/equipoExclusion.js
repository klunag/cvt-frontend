var $table = $("#tblEquipoExclusion");
var URL_API_VISTA = URL_API + "/Equipo/EquipoExclusion";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Equipos excluidos";

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
    cargarCombos();
    listarHistoricoExclusion();

});


function buscarHistoricoExclusion() {
    listarHistoricoExclusion();
}

function listarHistoricoExclusion() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListarEquiposExcluidos",
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
            DATA_EXPORTAR.nombre = $.trim($("#txtBusEquipo").val());
            DATA_EXPORTAR.tipoExclusionId = $("#cbFilTipoExclusion").val();
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


function linkFormatter(value, row, index) {
    return `<a href="javascript:EditTipo(${row.Id}, ${row.NumTecAsociadas})" title="Editar">${value}</a>`;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:CambiarEstado(${row.Id}, ${row.NumTecAsociadas})" title="Cambiar estado"><i id="cbOpcTip${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return estado;
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }
    let url = `${URL_API_VISTA}/Exportar?filtro=${DATA_EXPORTAR.nombre}&tipoExclusionId=${DATA_EXPORTAR.tipoExclusionId}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoExclusion, $("#cbFilTipoExclusion"), TEXTO_TODOS);
                    //SetItems(dataObject.FechaCalculo, $("#cbFecCalTec"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Dominio, $("#cbFilDom"), TEXTO_TODOS);
                    //SetItems(dataObject.Familia, $("#cbFilFam"), TEXTO_TODOS);
                    //SetItems(dataObject.Familia, $("#cbFamTec"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.TipoTec, $("#cbTipTec"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.EstadoTecnologia, $("#cbFilEst"), TEXTO_TODOS);
                    //CODIGO_INTERNO = dataObject.CodigoInterno;
                    //SetItems(dataObject.FechaFinSoporte, $("#cbFilEsFecSop"), TEXTO_TODOS);
                    //SetItems(dataObject.EstadoObs, $("#cbFilEstObs"), TEXTO_TODOS);
                    //SetItems(dataObject.TipoTec, $("#cbFilTipoTec"), TEXTO_TODOS);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}