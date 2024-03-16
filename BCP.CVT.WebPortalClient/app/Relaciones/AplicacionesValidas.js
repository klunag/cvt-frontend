var $table = $("#tblRegistro");
var DATA_EXPORTAR = {};
var LIST_SUBDOMINIO = [];
const URL_API_VISTA = URL_API + "/Relacion/consultapli";
const URL_API_COMBO = URL_API + "/Producto";
const comboMultiSelect = [
    { SelectId: "#cbSoportado", DataField: "Soportado" },
    { SelectId: "#cbBusDominioTecnologia", DataField: "Soportado" },
    { SelectId: "#cbBusSubDominioTecnologia", DataField: "Soportado" },
    { SelectId: "#cbBusJefe", DataField: "Soportado" },
    { SelectId: "#cbBusLider", DataField: "Soportado" }
];


$(function () {
    InitSelectMultiple(comboMultiSelect.map(x => x.SelectId));
    InitAutocompletarBuilder($("#txtAplicacion"), $("#hAplicacion"), ".appContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    setDefaultHd($("#txtAplicacion"), $("#hAplicacion"));
    CargarComboJefe();
    cargarComboLider();
    ListarCombos(() => {
        $("#cbBusDominioTecnologia").change(CargarSubDominioBusqueda);
    });
    CargarCombosGuardicore();
    Listar();
});

function CargarCombosGuardicore() {
    let url = URL_API + '/Relacion/infoapli/ComboSoportado';
    $.ajax({
        url: url,
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            if (data !== null) {
                SetItemsMultiple(data.soportado.filter(x => x !== "" && x !== null), $("#cbSoportado"), TEXTO_TODOS, TEXTO_TODOS, true);
            }
        }, complete: function (xhr, status) {
            waitingDialog.hide();
        }
    });
}

function CargarComboJefe() {
    let url = URL_API + '/Relacion/infoapli/ComboJefe';
    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            if (data !== null) {
                SetItemsMultiple(data.soportado.filter(x => x !== "" && x !== null), $("#cbBusJefe"), TEXTO_TODOS, TEXTO_TODOS, true);
            }
        }, complete: function (xhr, status) {
            waitingDialog.hide();
        }
    });
}

function cargarComboLider() {
    let url = URL_API + '/Relacion/infoapli/ComboLider';
    $.ajax({
        url: url,
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            if (data !== null) {
                SetItemsMultiple(data.soportado.filter(x => x !== "" && x !== null), $("#cbBusLider"), TEXTO_TODOS, TEXTO_TODOS, true);
            }
        }, complete: function (xhr, status) {
            waitingDialog.hide();
        }
    });
}

function ListarCombos(fn = null) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_COMBO + "/TecnologiaOwner/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    LIST_SUBDOMINIO = dataObject.SubDominio;
                    //SetItems(dataObject.EstadoObsolescencia, $("#cbBusEstadoObsolescenciaProducto"), TEXTO_TODOS);
                    SetItemsMultiple(dataObject.Dominio, $("#cbBusDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(LIST_SUBDOMINIO.map(x => x), $("#cbBusSubDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);

                    if (typeof fn == "function") fn();
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function CargarSubDominioBusqueda() {
    let dominioId = $("#cbBusDominioTecnologia").val() || [];
    let listSubDominio = LIST_SUBDOMINIO.filter(x => dominioId.some(y => y == x.TipoId) || dominioId.length == 0);
    SetItemsMultiple(listSubDominio, $("#cbBusSubDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
    //SetItems(listSubDominio, $("#cbBusSubDominioTecnologia"), TEXTO_TODOS);
}

function Listar() {
    let dominioIds = ($("#cbBusDominioTecnologia").val() || []).join(',');
    let subDominioIds = ($("#cbBusSubDominioTecnologia").val() || []).join(',');
    let jefe = ($("#cbBusJefe").val() || []).join(',');
    let lider = ($("#cbBusLider").val() || []).join(',');
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        ajax: "ListaAjax",
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            return JSON.stringify({
                soportado: CaseIsNullSendFilter($("#cbSoportado").val()),
                codigoAPT: $("#hAplicacion").val(),
                dominio: dominioIds,
                subdominio: subDominioIds,
                jefe: jefe,
                lider: lider,
                pageNumber: p.pageNumber,
                pageSize: p.pageSize
            });
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

function ListaAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API_VISTA + `/Listado?soportado=${tmp_params.soportado}&codigoAPT=${tmp_params.codigoAPT}&dominio=${tmp_params.dominio}&subdominio=${tmp_params.subdominio}&comboJE=${tmp_params.jefe}&comboLU=${tmp_params.lider}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}`;
    $.ajax({
        url: url,
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            params.success(data)
        }, complete: function (xhr, status) {
            waitingDialog.hide();
        }
    });
}

function dateFormat2(value, row, index) {
    if (value != null && value != '') {
        return moment(value).format('DD/MM/YYYY HH:mm:ss');
    }
    return "-";
}

function exportar() {
    var soportado = CaseIsNullSendFilter($("#cbSoportado").val());
    var codigoAPT = $("#hAplicacion").val();
    let dominioIds = ($("#cbBusDominioTecnologia").val() || []).join(',');
    let subDominioIds = ($("#cbBusSubDominioTecnologia").val() || []).join(',');
    let jefe = ($("#cbBusJefe").val() || []).join(',');
    let lider = ($("#cbBusLider").val() || []).join(',');

    let url = `${URL_API_VISTA}/Reporte/ExportarAplicacionValidacion?soportado=${soportado}&codigoAPT=${codigoAPT}&dominio=${dominioIds}&subdominio=${subDominioIds}&comboJE=${jefe}&comboLU=${lider}`;
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