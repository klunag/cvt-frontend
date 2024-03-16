var $table = $('#table');
var URL_API_VISTA = URL_API + "/Qualy";
var DATA_EXPORTAR = {};

var DATA_DETAILS = [];

$(function () {
    InitAutocompletarTribuCoeProducto($("#txtBusOwnerTecnologia"), $("#hdBusOwnerTecnologiaId"), '.searchOwnerContainer');
    InitAutocompletarBuilder($("#txtBusEquipoTecnologia"), $("#hdBusEquipoTecnologiaId"), ".searchEquipoContainer", "/Equipo/GetEquipoByFiltro?filtro={0}");
    InitAutocompletarProductoSearch($("#txtBusNombreTecnologia"), $("#hdBusNombreTecnologiaId"), ".searchProductoContainer");
    InitAutocompletarTecnologia($("#txtBusClaveTecnologia"), $("#hdBusClaveTecnologiaId"), $(".searchTecnologiaContainer"));
    obtenerUrlsReporteExportar();
    ListarCombos(() => {
        $("#btnBusBuscar").trigger("click");
    });
});

function ListarCombos(fn = null) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ConsolidadoKPI/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    LIST_SUBDOMINIO = dataObject.SubDominio;
                    SetItemsMultiple(dataObject.Dominio, $("#cbBusDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(LIST_SUBDOMINIO.map(x => x), $("#cbBusSubDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.EstadoVulnerabilidad, $("#cbBusVulnStatusTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
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

function listar() {
    DATA_EXPORTAR.dominioIds = ($("#cbBusDominioTecnologia").val() || []).join(',');
    DATA_EXPORTAR.subDominioIds = ($("#cbBusSubDominioTecnologia").val() || []).join(',');
    DATA_EXPORTAR.productoStr = $("#txtBusNombreTecnologia").val();
    DATA_EXPORTAR.tecnologiaStr = $("#txtBusClaveTecnologia").val();
    DATA_EXPORTAR.unidadOrganizativaId = ["-1", "0", ""].includes($("#txtBusOwnerTecnologia").val()) ? "" : $("#txtBusOwnerTecnologia").val();
    DATA_EXPORTAR.squadId = ["-1", "0", ""].includes($("#cbBusSquadTecnologia").val()) ? "" : $("#cbBusSquadTecnologia").val();
    DATA_EXPORTAR.equipoStr = $("#txtBusEquipoTecnologia").val();
    DATA_EXPORTAR.estadosVulnerabilidad = ($("#cbBusVulnStatusTecnologia").val() || []).join(',');
    DATA_EXPORTAR.tieneEquipoAsignado = $("#cbBusEquipoAsignadoTecnologia").val() == "-1" ? "" : $("#cbBusEquipoAsignadoTecnologia").val() == "1";
    DATA_EXPORTAR.tieneProductoAsignado = $("#cbBusProductoAsignadoTecnologia").val() == "-1" ? "" : $("#cbBusProductoAsignadoTecnologia").val() == "1";
    DATA_EXPORTAR.tieneTecnologiaAsignado = $("#cbBusTecnologiaAsignadaTecnologia").val() == "-1" ? "" : $("#cbBusTecnologiaAsignadaTecnologia").val() == "1";

    obtenerKPI();
    //listarDatosIniciales();
}

function obtenerKPI() {
    var { dominioIds, subDominioIds, productoStr, tecnologiaStr, unidadOrganizativaId, squadId, equipoStr, estadosVulnerabilidad, tieneEquipoAsignado, tieneProductoAsignado, tieneTecnologiaAsignado } = DATA_EXPORTAR;
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API_VISTA}/ConsolidadoKPI?dominioIds=${dominioIds}&subDominioIds=${subDominioIds}&productoStr=${productoStr}&tecnologiaStr=${tecnologiaStr}&unidadOrganizativaId=${unidadOrganizativaId}&squadId=${squadId}&equipoStr=${equipoStr}&estadosVulnerabilidad=${estadosVulnerabilidad}&tieneEquipoAsignado=${tieneEquipoAsignado}&tieneProductoAsignado=${tieneProductoAsignado}&tieneTecnologiaAsignado=${tieneTecnologiaAsignado}`,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                //data = result;
                //buildTableInicial(data);
                $("#spanEquiposCVT").text(result.CantidadEquiposCVTEncontrados);
                $("#spanEquiposNoCVT").text(result.CantidadEquiposCVTNoEncontrados);
                $("#spanTecnologiasAsignadas").text(result.CantidadTecnologiaAsignada);
                $("#spanTecnologiasNoAsignadas").text(result.CantidadTecnologiaNoAsignada);
                $("#spanProductosAsignados").text(result.CantidadProductoAsignado);
                $("#spanProductosNoAsignados").text(result.CantidadProductoNoAsignado);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            //data = [];
            waitingDialog.hide();
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        async: true
    });
}

function listarDatosIniciales() {
    var data = [];
    var { qid, equipo, producto } = DATA_EXPORTAR;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API_VISTA}/ReporteConsolidadoN1?qid=${qid}&equipo=${equipo}&producto=${producto}`,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableInicial(data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
            waitingDialog.hide();
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        async: true
    });
}

function expandTable2($detail, flagEquipoAsignado) {
    var data = [];
    var { qid, equipo, producto } = DATA_EXPORTAR;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API_VISTA}/ReporteConsolidadoN2?qid=${qid}&equipo=${equipo}&producto=${producto}&withEquipo=${flagEquipoAsignado}`,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTable2($detail.html('<table class="responsive"></table>').find('table'), data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
            waitingDialog.hide();
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        async: true
    });
}

function buildTableInicial(data) {
    var columns = [];
    columns.push({
        field: 'Leyenda',
        //formatter: nombreReporteFormatter,
        title: 'Equipo asignado',
        footerFormatter: dominioFormatter
    });
    columns.push({
        field: 'Cantidad',
        title: 'Cantidad',
        class: 'fondoBlanco',
        footerFormatter: subdominioFormatter
    });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showFooter: true,
        onExpandRow: function (index, row, $detail) {
            expandTable2($detail, row.FlagEquipoAsignado);
        }
    });
}

function buildTable2($el, data) {
    var columns = [];
    columns.push({
        field: 'Leyenda',
        //formatter: nombreReporteFormatter,
        title: 'Tiene Producto/Tecnología asignado',
    });
    columns.push({
        field: 'Cantidad',
        title: 'Cantidad',
        class: 'fondoBlanco'
    });

    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showHeader: true,
        onExpandRow: function (index, row, $detail) {
            expandTable3($detail, row.FlagEquipoAsignado, row.FlagProductoTecnologiaAsignado);
        }
    });
}

function expandTable3($detail, flagEquipoAsignado, flagProductoTecnologiaAsignado) {
    var data = [];

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    buildTable3($detail.html('<table class="responsive"></table>').find('table'), flagEquipoAsignado, flagProductoTecnologiaAsignado);
    //$.ajax({
    //    url: `${URL_API_VISTA}/ReporteConsolidadoN3?qid=${qid}&equipo=${equipo}&producto=${producto}&withEquipo=${flagEquipoAsignado}`,
    //    type: "GET",
    //    contentType: "application/json",
    //    dataType: "json",
    //    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
    //    success: function (result) {
    //        waitingDialog.hide();
    //        if (result != null) {
    //            data = result;
    //            buildTable3($detail.html('<table class="responsive"></table>').find('table'), data);
    //        }
    //    },
    //    error: function (xhr, ajaxOptions, thrownError) {
    //        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
    //        data = [];
    //        waitingDialog.hide();
    //    },
    //    complete: function (data) {
    //        waitingDialog.hide();

    //    },
    //    async: true
    //});
}

function buildTable3($el, flagEquipoAsignado, flagProductoTecnologiaAsignado) {
    var { qid, equipo, producto } = DATA_EXPORTAR;

    var columns = [];

    columns.push({
        field: 'QID',
        title: 'QID',
    });
    columns.push({
        field: 'IP',
        title: 'IP',
    });
    columns.push({
        field: 'NetBIOS',
        title: 'NetBIOS',
    });
    if (flagEquipoAsignado == true) {
        columns.push({
            field: 'EquipoStr',
            title: 'Equipo',
        });
    }
    columns.push({
        field: 'Categoria',
        title: 'Categoría',
    });
    columns.push({
        field: 'Diagnostico',
        title: 'Diagnóstico',
        formatter: 'verMasFormatter'
    });
    columns.push({
        field: 'Solucion',
        title: 'Solución',
        formatter: 'verMasFormatter'
    });
    if (flagProductoTecnologiaAsignado == true) {
        columns.push({
            field: 'ProductoStr',
            title: 'Producto',
        });
        columns.push({
            field: 'TecnologiaStr',
            title: 'Tecnologías',
            formatter: 'verMasFormatter'
        });
    }

    $el.bootstrapTable({
        columns: columns,
        //data: data.Rows,
        detailView: false,
        showHeader: true,
        url: `${URL_API_VISTA}/ReporteConsolidadoN3?qid=${qid}&equipo=${equipo}&producto=${producto}&withEquipo=${flagEquipoAsignado}&withProductoTecnologia=${flagProductoTecnologiaAsignado}`,
        method: 'GET',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'IP',
        sortOrder: 'asc',
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            var result = { rows: data.Rows, total: data.Total };
            let index = DATA_DETAILS.findIndex(x => x.FlagEquipoAsignado == flagEquipoAsignado && x.FlagProductoTecnologiaAsignado == flagProductoTecnologiaAsignado);
            if (index == -1) {
                let item = {
                    FlagEquipoAsignado: flagEquipoAsignado,
                    FlagProductoTecnologiaAsignado: flagProductoTecnologiaAsignado,
                    Resultados: result
                };
                DATA_DETAILS.push(item);
            }
            else DATA_DETAILS[index].Resultados = result;
            
            return result;
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
        //onExpandRow: function (index, row, $detail) {
        //    expandTable4($detail, row.FlagEquipoAsignado, row.Leyenda, row.FlagProductoTecnologia);
        //}
    });
}

function expandTable4($detail, flagEquipoAsignado, severidad, flagProductoTecnologia) {
    var data = [];

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/ReporteConsolidadoN4?withEquipo=" + flagEquipoAsignado + "&severidad=" + severidad + "&withProductoTecnologia=" + flagProductoTecnologia + "",
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTable4($detail.html('<table class="responsive"></table>').find('table'), data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
            waitingDialog.hide();
        },
        complete: function (data) {
            waitingDialog.hide();

        },
        async: true
    });
}

function buildTable4($el, data) {
    var columns = [];

    columns.push({
        field: 'Leyenda',
        //formatter: nombreReporteFormatter,
        title: 'Vulnerabilidad',
    });
    columns.push({
        field: 'Cantidad',
        title: 'Cantidad',
        class: 'fondoBlanco'
    });

    $el.bootstrapTable({
        columns: columns,
        data: data.Rows,
        detailView: true,
        showHeader: true,
        onExpandRow: function (index, row, $detail) {
            expandTable5($detail, row.FlagEquipoAsignado, row.Severidad, row.FlagProductoTecnologiaAsignado, row.TipoVulnerabilidad);
        }
    });
}

function expandTable5($detail, flagEquipoAsignado, severidad, flagProductoTecnologia, tipoVulnerabilidad) {
    var data = [];

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    buildTable5($detail.html('<table class="responsive"></table>').find('table'), flagEquipoAsignado, severidad, flagProductoTecnologia, tipoVulnerabilidad);
    //$.ajax({
    //    url: URL_API_VISTA + "/ReporteConsolidadoN5?withEquipo=" + flagEquipoAsignado + "&severidad=" + severidad + "&withProductoTecnologia=" + flagProductoTecnologia + "&tipoVulnerabilidad=" + tipoVulnerabilidad + "",
    //    type: "GET",
    //    contentType: "application/json",
    //    dataType: "json",
    //    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
    //    success: function (result) {
    //        waitingDialog.hide();
    //        if (result != null) {
    //            data = result;
    //            buildTable5($detail.html('<table class="responsive"></table>').find('table'), data);
    //        }
    //    },
    //    error: function (xhr, ajaxOptions, thrownError) {
    //        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
    //        data = [];
    //        waitingDialog.hide();
    //    },
    //    complete: function (data) {
    //        waitingDialog.hide();

    //    },
    //    async: true
    //});
}

function buildTable5($el, flagEquipoAsignado, severidad, flagProductoTecnologia, tipoVulnerabilidad) {
    var columns = [];

    columns.push({
        field: 'IP',
        title: 'IP',
    });
    columns.push({
        field: 'NetBIOS',
        title: 'NetBIOS',
    });
    columns.push({
        field: 'Categoria',
        title: 'Categoría',
    });
    columns.push({
        field: 'Diagnostico',
        title: 'Diagnóstico',
    });
    columns.push({
        field: 'Solucion',
        title: 'Solución',
    });
    columns.push({
        field: 'ProductoStr',
        title: 'Producto',
    });
    columns.push({
        field: 'TecnologiaStr',
        title: 'Tecnologías',
    });
    //columns.push({
    //    field: 'Cantidad',
    //    title: 'Cantidad',
    //    class: 'fondoBlanco'
    //});

    $el.bootstrapTable({
        columns: columns,
        //data: data.Rows,
        detailView: false,
        showHeader: true,
        url: URL_API_VISTA + "/ReporteConsolidadoN5?withEquipo=" + flagEquipoAsignado + "&severidad=" + severidad + "&withProductoTecnologia=" + flagProductoTecnologia + "&tipoVulnerabilidad=" + tipoVulnerabilidad + "",
        method: 'GET',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'IP',
        sortOrder: 'asc',
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
        //onExpandRow: function (index, row, $detail) {
        //    expandTable4($detail, row.FlagEquipoAsignado, row.Leyenda, row.FlagProductoTecnologia);
        //}
    });
}

function dominioFormatter() {
    return '<strong>Total General</strong>';
}

function subdominioFormatter(data) {
    var field = this.field;
    var suma = data.map(function (row) {
        return +row[field];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    return '<strong>' + suma + '</strong>';
}

function nombreReporteFormatter(value, row, index) {
    return `<a href="javascript:MostrarGraficoLineaTiempo('${value}')" title="Ver gráfico">${value}</a>`;
}

function obtenerUrlsReporteExportar() {
    let urlReporteAll = `${URL_API_VISTA}/ReporteConsolidadoExportar`;
    let urlReporteActive = `${URL_API_VISTA}/ReporteConsolidadoActiveExportar`;

    Promise.all([
        fetch(urlReporteAll),
        fetch(urlReporteActive)
    ])
        .then(arrayR => Promise.all(arrayR.map(x => x.json())))
        .then(([responseUrlAll, responseUrlActive]) => {
            $("#btnBusExportar").attr("href", responseUrlAll);
            $("#btnBusExportarActive").attr("href", responseUrlActive);
        });
}

function exportar() {
    //var { dominioIds, subDominioIds, productoStr, tecnologiaStr, unidadOrganizativaId, squadId, equipoStr, estadosVulnerabilidad, tieneEquipoAsignado, tieneProductoAsignado, tieneTecnologiaAsignado } = DATA_EXPORTAR;
    //let url = `${URL_API_VISTA}/ReporteConsolidadoExportar?dominioIds=${dominioIds}&subDominioIds=${subDominioIds}&productoStr=${productoStr}&tecnologiaStr=${tecnologiaStr}&unidadOrganizativaId=${unidadOrganizativaId}&squadId=${squadId}&equipoStr=${equipoStr}&estadosVulnerabilidad=${estadosVulnerabilidad}&tieneEquipoAsignado=${tieneEquipoAsignado}&tieneProductoAsignado=${tieneProductoAsignado}&tieneTecnologiaAsignado=${tieneTecnologiaAsignado}`;
    fetch(url)
        .then(r => r.json())
        .then(uriFile => {
            if (uriFile == "") {
                bootbox.alert("Archivo no se encuentra disponible");
                return;
            }
            var link = document.createElement("a");
            link.href = uriFile;
            link.download = "Qualys-Vulnerabilidades.csv";
            link.click();
        });
    //window.location.href = url;
}

function exportarActivas() {
    //var { dominioIds, subDominioIds, productoStr, tecnologiaStr, unidadOrganizativaId, squadId, equipoStr, estadosVulnerabilidad, tieneEquipoAsignado, tieneProductoAsignado, tieneTecnologiaAsignado } = DATA_EXPORTAR;
    //let url = `${URL_API_VISTA}/ReporteConsolidadoExportar?dominioIds=${dominioIds}&subDominioIds=${subDominioIds}&productoStr=${productoStr}&tecnologiaStr=${tecnologiaStr}&unidadOrganizativaId=${unidadOrganizativaId}&squadId=${squadId}&equipoStr=${equipoStr}&estadosVulnerabilidad=${estadosVulnerabilidad}&tieneEquipoAsignado=${tieneEquipoAsignado}&tieneProductoAsignado=${tieneProductoAsignado}&tieneTecnologiaAsignado=${tieneTecnologiaAsignado}`;
    fetch(url)
        .then(r => r.json())
        .then(uriFile => {
            if (uriFile == "") {
                bootbox.alert("Archivo no se encuentra disponible");
                return;
            }
            var link = document.createElement("a");
            link.href = uriFile;
            link.download = "Qualys-Vulnerabilidades-Active.csv";
            link.click();
        });
    //window.location.href = url;
}

function verMasFormatter(data, row) {
    let text = (data || '');
    let item = { text: data };
    let itemStr = JSON.stringify(item);
    
    if (text.length >= 50) {
        text = text.substr(0, 50);
        text += `...<a href='javascript:verMas(${row.Fila}, "${this.field}", "${this.title}", ${row.FlagEquipoAsignado}, ${row.FlagProductoTecnologiaAsignado})'>Ver más</a>`;
    }
    return text;

}

function verMas(fila, field, title, flagEquipoAsignado, flagProductoTecnologiaAsignado) {
    let data = DATA_DETAILS.find(x => x.FlagEquipoAsignado == flagEquipoAsignado && x.FlagProductoTecnologiaAsignado == flagProductoTecnologiaAsignado);
    let item = data.Resultados.rows.find(x => x.Fila == fila);
    $("#MdVerMas").modal('show');
    $("#titleFormVerMas").html(`${title} de ${item.NetBIOS}`);
    $("#MdVerMas .modal-body").html(item[field]);
}

function CargarSubDominioBusqueda() {
    let dominioId = $("#cbBusDominioTecnologia").val() || [];
    let listSubDominio = LIST_SUBDOMINIO.filter(x => dominioId.some(y => y == x.TipoId) || dominioId.length == 0);
    SetItemsMultiple(listSubDominio, $("#cbBusSubDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
    //SetItems(listSubDominio, $("#cbBusSubDominioTecnologia"), TEXTO_TODOS);
}

function InitAutocompletarProductoSearch($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                let dominioIds = ($("#cbBusDominioTecnologia").val() || []).join(',');
                let subDominioIds = ($("#cbBusSubDominioTecnologia").val() || []).join(',');

                $.ajax({
                    url: `${URL_API}/Producto/ListadoByDescripcion?descripcion=${request.term}&dominioIds=${dominioIds}&subDominioIds=${subDominioIds}`,
                    //data: JSON.stringify({
                    //    descripcion: ,
                    //    id: ($("#hdTecnologiaId").val() === "" || $("#hdTecnologiaId").val() === "0") ? null : parseInt($("#hdTecnologiaId").val())
                    //}),
                    dataType: "json",
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else
                return response(false);
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.Fabricante + " " + ui.item.Nombre);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Fabricante + " " + ui.item.Nombre);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Fabricante + " " + item.Nombre + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarTecnologia($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                let dominioIds = ($("#cbBusDominioTecnologia").val() || []).join(',');
                let subDominioIds = ($("#cbBusSubDominioTecnologia").val() || []).join(',');

                $.ajax({
                    url: URL_API + "/Tecnologia/GetTecnologiaByClaveById",
                    data: JSON.stringify({
                        filtro: request.term,
                        dominioIds,
                        subDominioIds
                        //id: ($("#hdTecnologiaId").val() === "" || $("#hdTecnologiaId").val() === "0") ? null : parseInt($("#hdTecnologiaId").val())
                    }),
                    dataType: "json",
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_APLICACION = data;
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else
                return response(true);
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarTribuCoeProducto($searchBox, $IdBox, $container, fn = null) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format("/GestionProducto/BuscarTribuCoePorFiltro?filtro={0}", request.term);

                if ($IdBox !== null) $IdBox.val("");
                $.ajax({
                    url: urlControllerWithParams,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (data) {
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else
                return response(true);
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.Descripcion);


            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                //$searchBox.val(ui.item.Descripcion);
                //$("#hdOwnerIdProducto").val(ui.item.CodigoPersonalResponsable);
                //$("#txtOwnerDisplayNameProducto").val(ui.item.NombresPersonalResponsable);
                //$("#hdOwnerMatriculaProducto").val(ui.item.MatriculaPersonalResponsable);
                //cbTribuCoeIdProducto_Change();
                if (typeof fn == "function") fn(ui.item);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.value + "</font></a>").appendTo(ul);
    };
}