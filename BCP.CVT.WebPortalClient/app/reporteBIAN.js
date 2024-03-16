var $table = $("#tblRegistro");
var $tblDetalle = $("#tblDetalleAplicacion");
var URL_API_VISTA = URL_API + "/Portafolio";
var DATA_EXPORTAR = {};
var DATA_EXPORTAR_DETALLE = {};
const CABECERAS_TABLE_BIAN = ["BANKING PRODUCTS", "BICE", "BUSINESS DIRECTION", "BUSINESS INTEGRATION","BUSINESS SUPPORT"];
const arrMultiSelect = [
    { SelectId: "#cbFiltroGerencia", DataField: "GestionadoPor" },
    { SelectId: "#cbFiltroDivision", DataField: "EstadoAplicacion" },
    { SelectId: "#cbFiltroUnidad", DataField: "TipoActivo" },
    { SelectId: "#cbFiltroArea", DataField: "Gerencia" },
    { SelectId: "#cbFiltroEstado", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlClasificacionTecnica", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlSubclasificacionTecnica", DataField: "ClasificacionTecnica" }
];

$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    CargarCombos();
    //ListarRegistros();
    ListarRegistrosBT();
});

function RefrescarListado() {
    //ListarRegistros();
    ListarRegistrosBT();
}

function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    let Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val());
    let Estado = CaseIsNullSendExport($("#cbFiltroEstado").val());
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ReporteBIAN?Gerencia=" + Gerencia + "&Estado=" + Estado,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    $('#tblRegistro tbody').empty();
                    let data = dataObject.Rows;
                    $.each(data, function () {
                        $('#tblRegistro tbody').append('<tr>' +
                            '<td class="fondoAzul">' + this.Categoria + '</td>' +
                            '<td class="centerBold">' + this.BankingProducts + '</td>' +
                            '<td class="centerBold">' + this.BiceFinal + '</td>' +
                            '<td class="centerBold">' + this.BusinessDirectionFinal + '</td>' +
                            '<td class="centerBold">' + this.BusinessIntegration + '</td>' +
                            '<td class="centerBold">' + this.BusinessSupport + '</td>' +
                            '</tr>');
                    });
                }
            }
        },
        complete: function () {
            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: true
    });
}
/*
function ListarRegistrosBT() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ReporteBIAN/BT",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val()); 
            DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFiltroEstado").val());
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
*/

function ListarRegistrosBT() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val());
    DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFiltroEstado").val());

    $.ajax({
        url: URL_API_VISTA + "/ReporteBIAN/BT",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(DATA_EXPORTAR),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    $table.bootstrapTable({
                        data: dataObject.Rows
                    })
                }
            }
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            waitingDialog.hide();
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Aplicacion/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let arrfiltroGerencia = dataObject.Filtro.split(";");

                    SetItemsMultiple(dataObject.Gerencia, $("#cbFiltroGerencia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Division, $("#cbFiltroDivision"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Unidad, $("#cbFiltroUnidad"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Area, $("#cbFiltroArea"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.ClasificacionTecnica, $("#ddlClasificacionTecnica"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.SubclasificacionTecnica, $("#ddlSubclasificacionTecnica"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Estado.filter(x => x !== "Eliminada"), $("#cbFiltroEstado"), TEXTO_TODOS, TEXTO_TODOS, true);

                    let newfiltro = dataObject.Gerencia.filter(x => !arrfiltroGerencia.includes(x));
                    $("#cbFiltroGerencia").val(newfiltro);
                    $("#cbFiltroGerencia").multiselect("refresh");

                    $("#cbFiltroEstado").val(["Vigente"]);
                    $("#cbFiltroEstado").multiselect("refresh");
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
    let retorno = "";
    if (value === 0) {
        retorno = value;
    } else {
        retorno = `<a class="like" href="javascript:void(0)" title="Ver aplicaciones">${value}</a>`;
    }
    return retorno;
}

window.operateEvents = {
    'click .like': function (e, value, row, index) {
        let idx = $(this).parent().index() - 1;
        let areaFiltro = CABECERAS_TABLE_BIAN[idx];
        let clasificacionFiltro = row.Categoria;
        listarDetalleAplicacion($("#mdDetalleAplicacion"), clasificacionFiltro, areaFiltro);
    }
};

function listarDetalleAplicacion($md, clasificacionFiltro, areaFiltro) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblDetalle.bootstrapTable('destroy');
    $tblDetalle.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ReporteBIAN/DetalleAplicacion",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR_DETALLE = {};
            DATA_EXPORTAR_DETALLE.Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val());
            DATA_EXPORTAR_DETALLE.Estado = CaseIsNullSendExport($("#cbFiltroEstado").val());
            DATA_EXPORTAR_DETALLE.Clasificacion = clasificacionFiltro;
            DATA_EXPORTAR_DETALLE.Area = areaFiltro;
            DATA_EXPORTAR_DETALLE.pageNumber = p.pageNumber;
            DATA_EXPORTAR_DETALLE.pageSize = p.pageSize;
            DATA_EXPORTAR_DETALLE.sortName = p.sortName;
            DATA_EXPORTAR_DETALLE.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_DETALLE);
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
        onLoadSuccess: function (data) {
            OpenCloseModal($md, true);
        },
        onSort: function (name, order) {
            //waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
    });
}