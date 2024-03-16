var $table = $('#table');
var URL_API_VISTA = URL_API + "/Tecnologia";
var DATA_EXPORTAR = {};
var LIST_SUBDOMINIO = [];
var columns = [
    { field: 'Owner', title: 'Owner', width: '30%' },
    { field: 'ObsoletoKPI', formatter: obsoletoFormatter, title: 'Obsoleto<br/>KPI <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="(Instancias Serv + Azure)"></span>', width: '10%', align: 'right', footerFormatter: totalFormatter },
    { field: 'PorcentajeObsoletoKPI', title: '%', width: '10%', align: 'right', formatter: porcentajeObsoletoFormatter, footerFormatter: totalFormatter },
    { field: 'Vigente12MesesKPI', formatter: deprecadoFormatter, title: 'Por vencer<br/>KPI <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="(Instancias Serv + Azure)"></span>', width: '10%', align: 'right', footerFormatter: totalFormatter },
    { field: 'PorcentajeTotalVigente12MesesKPI', title: '%', width: '10%', align: 'right', formatter: porcentajeDeprecadoFormatter, footerFormatter: totalFormatter },
    { field: 'Vigente12MesesAMasKPI', formatter: vigenteFormatter, title: 'Vigente<br/>KPI <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="(Instancias Serv + Azure)"></span>', width: '10%', align: 'right', footerFormatter: totalFormatter },
    { field: 'PorcentajeTotalVigente12MesesAMasKPI', title: '%', width: '10%', align: 'right', formatter: porcentajeVigenteFormatter, footerFormatter: totalFormatter },
    //{ field: 'DeprecadoKPI', title: 'Deprecado<br/>KPI <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="(Instancias Serv + Azure)"></span>', width: '10%', align: 'right', footerFormatter: totalFormatter },
    //{ field: 'PorcentajeDeprecadoKPI', title: '%', width: '10%', align: 'right', formatter: porcentajeFormatter, footerFormatter: totalFormatter },
    { field: 'TotalKPI', title: 'Total<br/>KPI <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="(Instancias Serv + Azure)"></span>', width: '10%', align: 'right', footerFormatter: totalFormatter },
    { field: 'PorcentajeTotalKPI', title: 'Total %', width: '10%', align: 'right', formatter: porcentajeFormatter, footerFormatter: totalFormatter },
]

var DATA_DETAILS = [];
var userCount = 0;
$(function () {
    getCurrentUser();
});

$(document).ajaxComplete(function () {
    if (userCurrent != null && userCount == 0) {
        userCount++;
        InitAutocompletarProductoSearch($("#txtBusNombreTecnologia"), $("#hdBusNombreTecnologiaId"), ".searchProductoContainer");
        InitAutocompletarTecnologia($("#txtBusClaveTecnologia"), $("#hdBusClaveTecnologiaId"), $(".searchTecnologiaContainer"));
        InitAutocompletarTribuCoeProducto($("#txtBusOwnerTecnologia"), $("#hdBusOwnerTecnologiaId"), '.searchOwnerContainer', (item) => { cbTribuCoeIdProducto_Change(item) });
        initFecha();
        ListarCombos(() => {
            $("#cbBusDominioTecnologia").change(CargarSubDominioBusqueda);
            $("#btnBusBuscar").trigger("click");
        });
    }
});

function listar() {
    DATA_EXPORTAR.dominioIds = ($("#cbBusDominioTecnologia").val() || []).join(',');
    DATA_EXPORTAR.subDominioIds = ($("#cbBusSubDominioTecnologia").val() || []).join(',');
    DATA_EXPORTAR.productoStr = $("#txtBusNombreTecnologia").val();
    DATA_EXPORTAR.tecnologiaStr = $("#txtBusClaveTecnologia").val();
    DATA_EXPORTAR.ownerStr = $("#txtBusOwnerTecnologia").val();
    DATA_EXPORTAR.squadId = $("#cbBusSquadTecnologia").val() == "-1" ? "" : $("#cbBusSquadTecnologia").val();
    //DATA_EXPORTAR.estadoId = $("#cbBusEstadoTecnologia").val() == "-1" ? '' : $("#cbBusEstadoTecnologia").val();
    DATA_EXPORTAR.nivel = 1;
    DATA_EXPORTAR.ownerParentIds = '';
    DATA_EXPORTAR.TipoEquipoIds = ($("#cbFilTipoEquipo").val() || []).join(','); 
    DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
    DATA_EXPORTAR.FechaFiltro = castDate($("#FechaFiltro").val());

    listarDatosIniciales();
}

function listarDatosIniciales() {

    //el rol E195_OwnerKPI_LiderCOE puede ver todos los registros sin necesidad de llenar la tribu y el squad
    if (userCurrent.Perfil.includes("E195_OwnerKPI_LiderCOE") || userCurrent.PerfilId == 1 || userCurrent.Perfil.includes("E195_GestorCVTCatalogoTecnologias")) {

        var data = [];
        var { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, Fecha, FechaFiltro } = DATA_EXPORTAR;
        let nivel = 1;
        let filtro = { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, nivel, fechaFiltro: Fecha }

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $.ajax({
            url: `${URL_API_VISTA}/ListadoConsolidadoObsolescenciaXNivel`,
            type: "POST",
            data: JSON.stringify(filtro),
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

    // si el rol es E195_OwnerKPI_IngenieroTecnologia o E195_OwnerKPI_LiderSquad, validara que la tribu y el squad tengan un valor, de lo contrario no mostrara ningun registro

    //else if (USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_OwnerKPI_IngenieroTecnologia") || USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_OwnerKPI_LiderSquad") || USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_MDR_Administrador")) {
    else if (userCurrent.Perfil.includes("E195_OwnerKPI_IngenieroTecnologia") || userCurrent.Perfil.includes("E195_OwnerKPI_LiderSquad") || userCurrent.Perfil.includes("E195_Administrador")) {

        if ($("#hdBusOwnerTecnologiaId").val() != "") {
            if ($("#cbBusSquadTecnologia").val() != -1 && $('#cbBusSquadTecnologia option').length > 1) {
                var data = [];
                var { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, Fecha, FechaFiltro } = DATA_EXPORTAR;
                let nivel = 1;
                let filtro = { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, nivel, fechaFiltro: Fecha }

                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: `${URL_API_VISTA}/ListadoConsolidadoObsolescenciaXNivel`,
                    type: "POST",
                    data: JSON.stringify(filtro),
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
            else if ($("#cbBusSquadTecnologia").val() == -1 && $('#cbBusSquadTecnologia option').length == 1) {
                var data = [];
                var { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, Fecha, FechaFiltro } = DATA_EXPORTAR;
                let nivel = 1;
                let filtro = { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, nivel, fechaFiltro: Fecha }

                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: `${URL_API_VISTA}/ListadoConsolidadoObsolescenciaXNivel`,
                    type: "POST",
                    data: JSON.stringify(filtro),
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
            else {


                $table.bootstrapTable('destroy');
                $table.bootstrapTable();
            }
        }
        else {
            $table.bootstrapTable('destroy');
            $table.bootstrapTable();
        }
    }
    else {


        $table.bootstrapTable('destroy');
        $table.bootstrapTable();
    }
}


function initFecha() {
    _BuildDatepicker($("#FechaFiltro"));
}

function buildTableInicial(data) {
    let columnasTotalizadas = columns.map((x) => {
        let data_add = x.field.toLowerCase() == 'owner' ? { footerFormatter: totalTextFormatter } : x.field.toLowerCase().startsWith('porcentaje') ? { footerFormatter: totalPorcentajeFormatter } : { footerFormatter: totalFormatter };
        return Object.assign({ ...x }, data_add);
    });

    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        columns: columnasTotalizadas,
        data: data,
        detailView: true,
        showFooter: true,
        //pagination: true,
        onExpandRow: function (index, row, $detail) {
            expandTable2($detail, row);
        },
        //footerStyle: function () {
        //    console.log(this);
        //}
    });

    $("[data-toggle=tooltip]").tooltip();
}

function expandTable2($detail, item) {
    var data = [];
    var { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, Fecha, FechaFiltro } = DATA_EXPORTAR;
    let nivel = 2;
    let ownerIds = [item.OwnerId];
    let ownerParentIds = ownerIds.join(',');
    let filtro = { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, nivel, fechaFiltro: Fecha, ownerParentIds }
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API_VISTA}/ListadoConsolidadoObsolescenciaXNivel`,
        type: "POST",
        data: JSON.stringify(filtro),
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTable2($detail.html('<table class="table-responsive"></table>').find('table'), data, ownerIds);
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

function buildTable2($el, data, ownerIds) {
    $el.bootstrapTable({
        columns: columns,
        data: data,
        detailView: true,
        showHeader: false,
        //pagination: true,
        onExpandRow: function (index, row, $detail) {
            expandTable3($detail, row, ownerIds);
        }
    });
}

function expandTable3($detail, item, ownerIds) {
    var data = [];
    var { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, Fecha, FechaFiltro } = DATA_EXPORTAR;
    let nivel = 3;
    ownerIds = [ownerIds[0]];
    ownerIds.push(item.OwnerId);
    let ownerParentIds = ownerIds.join(',');
    let filtro = { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, nivel, fechaFiltro: Fecha, ownerParentIds }
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API_VISTA}/ListadoConsolidadoObsolescenciaXNivel`,
        type: "POST",
        data: JSON.stringify(filtro),
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTable3($detail.html('<table class="table-responsive"></table>').find('table'), data, ownerIds);
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

function buildTable3($el, data, ownerIds) {
    $el.bootstrapTable({
        columns: columns,
        data: data,
        detailView: true,
        showHeader: false,
        //pagination: true,
        onExpandRow: function (index, row, $detail) {
            expandTable4($detail, row, ownerIds);
        }
    });
}

function expandTable4($detail, item, ownerIds) {
    var data = [];
    var { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, Fecha, FechaFiltro } = DATA_EXPORTAR;
    let nivel = 4;
    ownerIds = [ownerIds[0], ownerIds[1]];
    ownerIds.push(item.OwnerId);
    let ownerParentIds = ownerIds.join(',');
    let filtro = { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, nivel, fechaFiltro: Fecha, ownerParentIds }
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API_VISTA}/ListadoConsolidadoObsolescenciaXNivel`,
        type: "POST",
        data: JSON.stringify(filtro),
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTable4($detail.html('<table class="table-responsive"></table>').find('table'), data, ownerIds);
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

function buildTable4($el, data, ownerIds) {
    $el.bootstrapTable({
        columns: columns,
        data: data,
        detailView: true,
        showHeader: false,
        //pagination: true,
        onExpandRow: function (index, row, $detail) {
            expandTable5($detail, row, ownerIds);
        }
    });
}

function expandTable5($detail, item, ownerIds) {
    var data = [];
    var { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, Fecha, FechaFiltro } = DATA_EXPORTAR;
    let nivel = 5;
    ownerIds = [ownerIds[0], ownerIds[1], ownerIds[2]];
    ownerIds.push(item.OwnerId);
    let ownerParentIds = ownerIds.join(',');
    let filtro = { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, nivel, fechaFiltro: Fecha, ownerParentIds }
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API_VISTA}/ListadoConsolidadoObsolescenciaXNivel?dominioIds=${dominioIds}&subDominioIds=${subDominioIds}&productoStr=${productoStr}&tecnologiaStr=${tecnologiaStr}&ownerStr=${ownerStr}&squadId=${squadId}&nivel=${nivel}&ownerParentIds=${ownerParentIds}&TipoEquipoIds=${TipoEquipoIds}&FechaFiltro=${Fecha}`,
        type: "POST",
        data: JSON.stringify(filtro),
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTable5($detail.html('<table class="table-responsive" data-pagination="true"></table>').find('table'), data, ownerIds);
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

function buildTable5($el, data, ownerIds) {
    $el.bootstrapTable({
        columns: columns,
        data: data,
        detailView: true,
        showHeader: false,
        //pagination: true,
        onExpandRow: function (index, row, $detail) {
            expandTable6($detail, row, ownerIds);
        }
    });
}

function expandTable6($detail, item, ownerIds) {
    var data = [];
    var { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, Fecha, FechaFiltro } = DATA_EXPORTAR;
    let nivel = 6;
    ownerIds = [ownerIds[0], ownerIds[1], ownerIds[2], ownerIds[3]];
    ownerIds.push(item.OwnerId);
    let ownerParentIds = ownerIds.join(',');

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API_VISTA}/ListadoConsolidadoObsolescenciaXNivel`,
        type: "POST",
        data: JSON.stringify(filtro),
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTable6($detail.html('<table class="table-responsive" data-pagination="true"></table>').find('table'), data);
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

function buildTable6($el, data) {
    let columnResize = columns.map(x => x);
    columnResize.unshift({});


    $el.bootstrapTable({
        columns: columnResize,
        data: data,
        detailView: false,
        pagination: true,
        showHeader: false,
    });
}

function totalTextFormatter() {
    console.log(this);
    return '<strong>Total General</strong>';
}

function totalFormatter(data) {
    var field = this.field;
    var suma = data.map(function (row) {
        return +row[field];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    return '<strong>' + suma + '</strong>';
}

function totalPorcentajeFormatter(data) {
    var fieldTotal = 'TotalKPI';
    var field = "";
    if (this.field == "PorcentajeTotalKPI")
        field = "TotalKPI";
    else {
        field = this.field.replace("PorcentajeTotal", "");
        field = field.replace("Porcentaje", "");
    }    

    var suma = data.map(function (row) {
        return +row[field];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    var sumaTotal = data.map(function (row) {
        return +row[fieldTotal];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    var porcentaje = sumaTotal == 0 ? 0 : (suma * 100) / sumaTotal;

    return '<strong>' + porcentaje.toFixed(2) + '%</strong>';
}

function porcentajeFormatter(data) {
    return '<strong>' + data.toFixed(2) + '%</strong>';
}

function porcentajeObsoletoFormatter(data) {
    return '<strong class="textoRojo">' + data.toFixed(2) + '%</strong>';
}

function porcentajeVigenteFormatter(data) {
    return '<strong class="textoVerdeFuerte">' + data.toFixed(2) + '%</strong>';
}

function verMas(fila, field, title, flagEquipoAsignado, flagProductoTecnologiaAsignado) {
    let data = DATA_DETAILS.find(x => x.FlagEquipoAsignado == flagEquipoAsignado && x.FlagProductoTecnologiaAsignado == flagProductoTecnologiaAsignado);
    let item = data.Resultados.rows.find(x => x.Fila == fila);
    $("#MdVerMas").modal('show');
    $("#titleFormVerMas").html(`${title} de ${item.NetBIOS}`);
    $("#MdVerMas .modal-body").html(item[field]);
}

function obsoletoFormatter(data) {
    return `<span class="textoRojo">${data}</span>`;
}

function vigenteFormatter(data) {
    return `<span class="textoVerdeFuerte">${data}</span>`;
}

function deprecadoFormatter(data) {
    return `<span class="textoAmarillo">${data}</span>`;
}

function porcentajeDeprecadoFormatter(data) {
    return '<strong class="textoAmarillo">' + data.toFixed(2) + '%</strong>';
}

function ListarCombos(fn = null) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/TecnologiaOwnerConsolidadoObsolescencia/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    LIST_SUBDOMINIO = dataObject.SubDominio;
                    SetItemsMultiple(dataObject.Dominio, $("#cbBusDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(LIST_SUBDOMINIO.map(x => x), $("#cbBusSubDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItems(dataObject.Estado, $("#cbBusEstadoTecnologia"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
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
    })
        .keyup(function (e) {
            if ($searchBox.val() == "") $IdBox.val("");
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
            var a = document.createElement("a");
            var font = document.createElement("font");
            font.append(document.createTextNode(item.Fabricante + " " + item.Nombre));
            a.style.display = 'block';
            a.append(font);
            return $("<li>").append(a).appendTo(ul);
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
                    url: URL_API_VISTA + "/GetTecnologiaByClaveById",
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
    })
        .keyup(function (e) {
            if ($searchBox.val() == "") $IdBox.val("");
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
            var a = document.createElement("a");
            var font = document.createElement("font");
            font.append(document.createTextNode(item.Descripcion));
            a.style.display = 'block';
            a.append(font);
            return $("<li>").append(a).appendTo(ul);
        };
}

function InitAutocompletarTribuCoeProducto($searchBox, $IdBox, $container, fn = null) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = `${URL_API}/it-management/plataform-operations/v2/siga/unidadorganizativa/relaciontecnologiakpi/listarcomboxfiltro?filtro=${request.term}`;

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
    })
        .keyup(function (e) {
            if ($searchBox.val() == "") {
                $IdBox.val("");
                SetItemsCustomField([], $("#cbBusSquadTecnologia"), TEXTO_TODOS, "Id", "Descripcion");
            }
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
            return $("<li>").append("<a style='display: block'><font>" + item.value + "</font></a>").appendTo(ul);
        };
}

function cbTribuCoeIdProducto_Change(item, fn = null) {
    let urlControllerWithParams = `${URL_API}/it-management/plataform-operations/v2/siga/squad/relaciontecnologiakpi/listarcomboxfiltro?codigoUnidad=${item.Id}`;
    $.ajax({
        url: urlControllerWithParams,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (data) {
            LIST_SQUAD = data;
            //SetItemsCustomField(LIST_SQUAD, $("#"))
            SetItemsCustomField(LIST_SQUAD.map(x => x), $("#cbBusSquadTecnologia"), TEXTO_TODOS, "Id", "Descripcion");
            if (typeof fn == "function") fn();
        },
        async: false,
        global: false
    });
}

function exportar() {

    if (userCurrent.Perfil.includes("E195_OwnerKPI_LiderCOE") || userCurrent.PerfilId == 1 || userCurrent.Perfil.includes("E195_GestorCVTCatalogoTecnologias")) {
        let _data = $table.bootstrapTable("getData") || [];
        if (_data.length === 0) {
            //bootbox.alert("No hay datos para exportar.");
            bootbox.alert({
                size: "small",
                title: "Productos de Tecnologías",
                message: "No hay datos para exportar.",
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-primary'
                    }
                }
            });
            return;
        }
        var { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, Fecha, FechaFiltro } = DATA_EXPORTAR;
        let filtro = { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, fechaFiltro: Fecha }
        let url = `${URL_API_VISTA}/ExportarListadoConsolidadoObsolescencia`;
        $.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify(filtro),
            contentType: "application/json",
            dataType: "json",
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
    else if (userCurret.perfil.includes("E195_OwnerKPI_IngenieroTecnologia") || userCurrent.Perfil.includes("E195_OwnerKPI_LiderSquad")) {
        if ($("#hdBusOwnerTecnologiaId").val() != "") {
            if ($("#cbBusSquadTecnologia").val() != -1 && $('#cbBusSquadTecnologia option').length > 1) {
                let _data = $table.bootstrapTable("getData") || [];
                if (_data.length === 0) {
                    //bootbox.alert("No hay datos para exportar.");
                    bootbox.alert({
                        size: "small",
                        title: "Productos de Tecnologías",
                        message: "No hay datos para exportar.",
                        buttons: {
                            ok: {
                                label: 'Aceptar',
                                className: 'btn-primary'
                            }
                        }
                    });
                    return;
                }
                var { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, Fecha, FechaFiltro } = DATA_EXPORTAR;
                let url = `${URL_API_VISTA}/ExportarListadoConsolidadoObsolescencia?dominioIds=${dominioIds}&subDominioIds=${subDominioIds}&productoStr=${productoStr}&tecnologiaStr=${tecnologiaStr}&ownerStr=${ownerStr}&squadId=${squadId}&TipoEquipoIds=${TipoEquipoIds}&FechaFiltro=${Fecha}`;
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
            else if ($("#cbBusSquadTecnologia").val() == -1 && $('#cbBusSquadTecnologia option').length == 1) {
                let _data = $table.bootstrapTable("getData") || [];
                if (_data.length === 0) {
                    //bootbox.alert("No hay datos para exportar.");
                    bootbox.alert({
                        size: "small",
                        title: "Productos de Tecnologías",
                        message: "No hay datos para exportar.",
                        buttons: {
                            ok: {
                                label: 'Aceptar',
                                className: 'btn-primary'
                            }
                        }
                    });
                    return;
                }
                var { dominioIds, subDominioIds, productoStr, tecnologiaStr, ownerStr, squadId, TipoEquipoIds, Fecha, FechaFiltro } = DATA_EXPORTAR;
                let url = `${URL_API_VISTA}/ExportarListadoConsolidadoObsolescencia?dominioIds=${dominioIds}&subDominioIds=${subDominioIds}&productoStr=${productoStr}&tecnologiaStr=${tecnologiaStr}&ownerStr=${ownerStr}&squadId=${squadId}&TipoEquipoIds=${TipoEquipoIds}&FechaFiltro=${Fecha}`;
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
            else {
                bootbox.alert({
                    size: "small",
                    title: "Productos de Tecnologías",
                    message: "No hay datos para exportar.",
                    buttons: {
                        ok: {
                            label: 'Aceptar',
                            className: 'btn-primary'
                        }
                    }
                });
                return;
            }
        }
        else {
            bootbox.alert({
                size: "small",
                title: "Productos de Tecnologías",
                message: "No hay datos para exportar.",
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-primary'
                    }
                }
            });
            return;

        }

    }
    else {
        bootbox.alert({
            size: "small",
            title: "Productos de Tecnologías",
            message: "No hay datos para exportar.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
        return;
    }


}