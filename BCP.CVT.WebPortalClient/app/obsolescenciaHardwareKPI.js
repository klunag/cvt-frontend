var $table = $('#table');
var $table2 = $('#table2');
var URL_API_VISTA = URL_API + "/Hardware";
var DATA_EXPORTAR = {};
var LIST_SUBDOMINIO = [];
const arrMultiSelect = [
    { SelectId: "#cbGestionadoPor", DataField: "GestionaPor" },
    { SelectId: "#cbTeamSquad", DataField: "TeamSquad" },
    { SelectId: "#cbModelo", DataField: "Modelo" },
    { SelectId: "#cbFabricante", DataField: "Fabricante" }
];
var DATA_TEAM_SQUAD = [];
var DATA_MODELO = [];
var columns = [
    { field: 'SoportadoPor', title: 'Soportado Por', width: '48%' },
    { field: 'ObsoletoKPI', formatter: obsoletoFormatter, title: 'Obsoleto<br/> <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="Instancias obsoletas a la fecha"></span>', width: '8%', align: 'right', footerFormatter: totalFormatter },
    { field: 'Vence12KPI', formatter: vence12Formatter, title: 'Vence en 12<br/>Meses <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="Instancias que vencen en 12 meses"></span>', width: '8%', align: 'right', footerFormatter: totalFormatter },
    { field: 'Vence24KPI', formatter: vence24Formatter, title: 'Vence en 24<br/>Meses <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="Instancias que vencen en 24 meses"></span>', width: '8%', align: 'right', footerFormatter: totalFormatter },
    { field: 'Vence24KPICorto', formatter: vence24Formatter, title: 'Vence en 24<br/>Meses <br/>Corto<span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="Instancias que vencen en 24 meses"></span>', width: '8%', align: 'right', footerFormatter: totalFormatter },
    { field: 'VigenteKPI', formatter: vigenteFormatter, title: 'Vigente<br/> <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="Cantidad de instancias vigentes"></span>', width: '8%', align: 'right', footerFormatter: totalFormatter },
    { field: 'TotalKPI', title: 'Total<br/> <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="Total de instancias"></span>', width: '8%', align: 'right', footerFormatter: totalFormatter },
    { field: 'PorcentajeKPIFlooking', title: 'KPI Obsolescencia<br/>Forward Looking %', width: '12%', align: 'right', formatter: porcentajeFormatter, footerFormatter: totalFormatter },
];
var columns2 = [
    { field: 'UnidadFondeo', title: 'Unidad de Fondeo', width: '36%' },
    { field: 'ObsoletoKPI', formatter: obsoletoFormatter, title: 'Obsoleto<br/> <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="Instancias obsoletas a la fecha"></span>', width: '8%', align: 'right', footerFormatter: totalFormatter },
    { field: 'Vence12KPI', formatter: vence12Formatter, title: 'Vence en 12<br/>Meses <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="Instancias que vencen en 12 meses"></span>', width: '8%', align: 'right', footerFormatter: totalFormatter },
    { field: 'Vence24KPI', formatter: vence24Formatter, title: 'Vence en 24<br/>Meses <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="Instancias con Ciclo de Vida Normal"></span>', width: '8%', align: 'right', footerFormatter: totalFormatter },
    /*{ field: 'Vence24KPICorto', formatter: vence24Formatter, title: 'Vence en 24<br/>Meses <br/>Corto<span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="Instancias con Ciclo de Vida Corto"></span>', width: '8%', align: 'right', footerFormatter: totalFormatter },*/
    { field: 'VigenteKPI', formatter: vigenteFormatter, title: 'Vigente<br/> <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="Cantidad de instancias vigentes"></span>', width: '8%', align: 'right', footerFormatter: totalFormatter },
    { field: 'TotalKPI', title: 'Total<br/> <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="Total de instancias"></span>', width: '8%', align: 'right', footerFormatter: totalFormatter },
    /*{ field: 'PorcentajeKPIFlooking', title: 'KPI Obsolescencia<br/>Forward Looking % <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="left" title="Considera lo vencido y lo por vencer"></span>', width: '12%', align: 'right', formatter: porcentajeFormatter, footerFormatter: totalFormatter },*/
    { field: 'PorcentajeObsoletoKPI', title: 'KPI Obsolescencia<br/>de Hardware % <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="left" title="Considera solo vencidos"></span>', width: '12%', align: 'right', formatter: porcentajeFormatter, footerFormatter: totalFormatter },
]

var DATA_DETAILS = [];

$(function () {
    getCurrentUser();
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    CargarCombos();
    $("#cbGestionadoPor").on('change', function () { changeGestionadoPor(); });
    $("#cbFabricante").on('change', function () { changeFabricante(); });

    //ListarCombos(() => {
    //    $("#cbBusDominioTecnologia").change(CargarSubDominioBusqueda);
    //    //$("#btnBusBuscar").trigger("click");
    //    $("#btnBusBuscarUdF").trigger("click");
    //});
});

function CargarCombos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos_KPI",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItemsMultiple(dataObject.GestionadoPor, $("#cbGestionadoPor"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TeamSquad, $("#cbTeamSquad"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Modelo, $("#cbModelo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Fabricante, $("#cbFabricante"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.TipoHardware, $("#cbTipoHardware"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.EstadoObsolescencia, $("#cbEstadoObsolescencia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.UnidadFondeo, $("#cbUnidadFondeo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    DATA_TEAM_SQUAD = dataObject.TeamSquad;
                    DATA_MODELO = dataObject.Modelo;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            waitingDialog.hide();
        },
        async: true
    });
}
function changeGestionadoPor() {
    var dataFiltrada = [];
    let idsGestionadoPor = CaseIsNullSendFilter($("#cbGestionadoPor").val());

    if (idsGestionadoPor.length > 0) {
        for (var ii = 0; ii < idsGestionadoPor.length; ii++) {
            var filtro = DATA_TEAM_SQUAD.filter(e => e.TipoId == idsGestionadoPor[ii]);
            dataFiltrada = dataFiltrada.concat(filtro);
        }
        dataFiltrada.sort(function (a, b) {
            var textA = a.Descripcion;
            var textB = b.Descripcion;
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    } else {
        dataFiltrada = DATA_TEAM_SQUAD;
    }
    SetItemsMultiple(dataFiltrada, $("#cbTeamSquad"), TEXTO_TODOS, TEXTO_TODOS, true);
}
function changeFabricante() {
    var dataFiltrada = [];
    let idsFabricante = CaseIsNullSendFilter($("#cbFabricante").val());

    if (idsFabricante.length > 0) {
        for (var ii = 0; ii < idsFabricante.length; ii++) {
            var filtro = DATA_MODELO.filter(e => e.TipoDescripcion.toUpperCase() == idsFabricante[ii].toUpperCase() );
            dataFiltrada = dataFiltrada.concat(filtro);
        }
        dataFiltrada.sort(function (a, b) {
            var textA = a.Descripcion;
            var textB = b.Descripcion;
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    } else {
        dataFiltrada = DATA_MODELO;
    }
    SetItemsMultiple(dataFiltrada, $("#cbModelo"), TEXTO_TODOS, TEXTO_TODOS, true);
}

function listarUdF() {
    DATA_EXPORTAR.GestiodoPorIds = ($("#cbGestionadoPor").val() || []).join(',');
    DATA_EXPORTAR.TeamSquadIds = ($("#cbTeamSquad").val() || []).join(',');
    DATA_EXPORTAR.FabricanteIds = ($("#cbFabricante").val() || []).join(',');
    DATA_EXPORTAR.ModeloIds = ($("#cbModelo").val() || []).join(',');
    DATA_EXPORTAR.nivel = 1;
    DATA_EXPORTAR.ownerParentIds = '';
    
    DATA_EXPORTAR.UnidadFondeoIds = ''; //CaseIsNullSendExport($("#cbUnidadFondeo").val());
    //DATA_EXPORTAR.perfilId = USUARIO.UsuarioBCP_Dto.PerfilId;
    listarDatosInicialesUdF();
}
function listarDatosInicialesUdF() {
    var data = [];
    //var { GestiodoPorIds, TeamSquadIds, FabricanteIds, ModeloIds, unidadFondeo } = DATA_EXPORTAR;
    let nivel = 1;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API_VISTA}/ReporteKPI?GestionadoPorIds=${DATA_EXPORTAR.GestiodoPorIds}&TeamSquadIds=${DATA_EXPORTAR.TeamSquadIds}&FabricanteIds=${DATA_EXPORTAR.FabricanteIds}&ModeloIds=${DATA_EXPORTAR.ModeloIds}&nivel=${nivel}&UnidadFondeoIds=${DATA_EXPORTAR.UnidadFondeoIds}`,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                buildTableInicialUdF(data);
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
function buildTableInicialUdF(data) {
    let columnasTotalizadas = columns2.map((x) => {
        let data_add = x.field.toLowerCase() == 'unidadfondeo' ? { footerFormatter: totalTextFormatter } : x.field.toLowerCase().startsWith('porcentajekpi') ? { footerFormatter: totalPorcentajeFormatterFW } : x.field.toLowerCase().startsWith('porcentajeobs') ? { footerFormatter: totalPorcentajeFormatterReal } : { footerFormatter: totalFormatter };
        return Object.assign({ ...x }, data_add);
    });
    $table2.bootstrapTable('destroy');
    $table2.bootstrapTable({
        columns: columnasTotalizadas,
        data: data,
        detailView: true,
        showFooter: true,
        //pagination: true,
        onExpandRow: function (index, row, $detail) {
            expand2Table2($detail, row);
        },
        //footerStyle: function () {
        //    console.log(this);
        //}
    });

    $("[data-toggle=tooltip]").tooltip();
}
function expand2Table2($detail, item) {
    //var data = [];
    //var { dominioIds, subDominioIds, aplicacionStr, gestionadoPor, unidadFondeo } = DATA_EXPORTAR;
    let nivel = 2;
    let soportadoPorIds = [item.UnidadFondeoId];
    let soportadoPorParents = encodeURIComponent(soportadoPorIds.join('|'));

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API_VISTA}/ReporteKPI?GestionadoPorIds=${DATA_EXPORTAR.GestiodoPorIds}&TeamSquadIds=${DATA_EXPORTAR.TeamSquadIds}&FabricanteIds=${DATA_EXPORTAR.FabricanteIds}&ModeloIds=${DATA_EXPORTAR.ModeloIds}&nivel=${nivel}&UnidadFondeoIds=${DATA_EXPORTAR.UnidadFondeoIds}&filtrosPadre=${soportadoPorParents}`,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                build2Table2($detail.html('<table class="table-responsive"></table>').find('table'), data, soportadoPorIds);
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
function build2Table2($el, data, soportadoPorIds) {
    $el.bootstrapTable({
        columns: columns2,
        data: data,
        detailView: true,
        showHeader: false,
        //pagination: true,
        onExpandRow: function (index, row, $detail) {
            expand2Table3($detail, row, soportadoPorIds);
        }
    });
}
function expand2Table3($detail, item, soportadoPorIds) {
    //var data = [];
    //var { dominioIds, subDominioIds, aplicacionStr, gestionadoPor, unidadFondeo } = DATA_EXPORTAR;
    let nivel = 3;
    soportadoPorIds = [soportadoPorIds[0]];
    soportadoPorIds.push(item.UnidadFondeoId);
    let soportadoPorParents = encodeURIComponent(soportadoPorIds.join('|'));

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API_VISTA}/ReporteKPI?GestionadoPorIds=${DATA_EXPORTAR.GestiodoPorIds}&TeamSquadIds=${DATA_EXPORTAR.TeamSquadIds}&FabricanteIds=${DATA_EXPORTAR.FabricanteIds}&ModeloIds=${DATA_EXPORTAR.ModeloIds}&nivel=${nivel}&UnidadFondeoIds=${DATA_EXPORTAR.UnidadFondeoIds}&filtrosPadre=${soportadoPorParents}`,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                build2Table3($detail.html('<table class="table-responsive"></table>').find('table'), data, soportadoPorIds);
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
function build2Table3($el, data, soportadoPorIds) {
    $el.bootstrapTable({
        columns: columns2,
        data: data,
        detailView: true,
        showHeader: false,
        //pagination: true,
        onExpandRow: function (index, row, $detail) {
            expand2Table4($detail, row, soportadoPorIds);
        }
    });
}
function expand2Table4($detail, item, soportadoPorIds) {
    //var data = [];
    //var { dominioIds, subDominioIds, aplicacionStr, gestionadoPor, unidadFondeo } = DATA_EXPORTAR;
    let nivel = 4;
    soportadoPorIds = [soportadoPorIds[0], soportadoPorIds[1]];
    soportadoPorIds.push(item.UnidadFondeoId);
    let soportadoPorParents = encodeURIComponent(soportadoPorIds.join('|'));

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API_VISTA}/ReporteKPI?GestionadoPorIds=${DATA_EXPORTAR.GestiodoPorIds}&TeamSquadIds=${DATA_EXPORTAR.TeamSquadIds}&FabricanteIds=${DATA_EXPORTAR.FabricanteIds}&ModeloIds=${DATA_EXPORTAR.ModeloIds}&nivel=${nivel}&UnidadFondeoIds=${DATA_EXPORTAR.UnidadFondeoIds}&filtrosPadre=${soportadoPorParents}`,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                build2Table4($detail.html('<table class="table-responsive"></table>').find('table'), data, soportadoPorIds);
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
function build2Table4($el, data, soportadoPorIds) {
    $el.bootstrapTable({
        columns: columns2,
        data: data,
        detailView: true,
        showHeader: false,
        //pagination: true,
        onExpandRow: function (index, row, $detail) {
            expand2Table5($detail, row, soportadoPorIds);
        }
    });
}
function expand2Table5($detail, item, soportadoPorIds) {
    //var data = [];
    //var { dominioIds, subDominioIds, aplicacionStr, gestionadoPor, unidadFondeo } = DATA_EXPORTAR;
    let nivel = 5;
    soportadoPorIds = [soportadoPorIds[0], soportadoPorIds[1], soportadoPorIds[2]];
    soportadoPorIds.push(item.UnidadFondeoId);
    let soportadoPorParents = encodeURIComponent(soportadoPorIds.join('|'));

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API_VISTA}/ReporteKPI?GestionadoPorIds=${DATA_EXPORTAR.GestiodoPorIds}&TeamSquadIds=${DATA_EXPORTAR.TeamSquadIds}&FabricanteIds=${DATA_EXPORTAR.FabricanteIds}&ModeloIds=${DATA_EXPORTAR.ModeloIds}&nivel=${nivel}&UnidadFondeoIds=${DATA_EXPORTAR.UnidadFondeoIds}&filtrosPadre=${soportadoPorParents}`,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                build2Table5($detail.html('<table class="table-responsive" data-pagination="true"></table>').find('table'), data, soportadoPorIds);
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
function build2Table5($el, data, soportadoPorIds) {
    let columnResize = columns2.map(x => x);
    columnResize.unshift({});

    $el.bootstrapTable({
        columns: columnResize,
        data: data,
        detailView: false,
        pagination: true,
        showHeader: false,
    });
}

function exportarUdF() {
    let _data = $table2.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        //bootbox.alert("No hay datos para exportar.");
        bootbox.alert({
            size: "small",
            title: "Obsolescencia de Hardware",
            message: "No hay datos para exportar.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
        return false;
    }

    let url = `${URL_API_VISTA}/Exportar_KPI?GestionadoPorIds=${DATA_EXPORTAR.GestiodoPorIds}&TeamSquadIds=${DATA_EXPORTAR.TeamSquadIds}&FabricanteIds=${DATA_EXPORTAR.FabricanteIds}&ModeloIds=${DATA_EXPORTAR.ModeloIds}&UnidadFondeoIds=${DATA_EXPORTAR.UnidadFondeoIds}`;
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





function totalTextFormatter() {
    console.log(this);
    return '<strong>Total General</strong>';
}

function totalFormatter(data) {
    console.log("totalFormatter");
    console.log(data);
    var field = this.field;
    var suma = data.map(function (row) {
        return +row[field];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    return '<strong>' + suma + '</strong>';
}



function totalPorcentajeFormatterFW(data) {
    var fieldObsoletoKPI = 'ObsoletoKPI';

    var sumaTotalObsoletoKPI = data.map(function (row) {
        return +row[fieldObsoletoKPI];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    var fieldVence12KPI = 'Vence12KPI';

    var sumaTotalVence12KPI = data.map(function (row) {
        return +row[fieldVence12KPI];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    var fieldVence24KPI = 'Vence24KPI';

    var sumaTotalVence24KPI = data.map(function (row) {
        return +row[fieldVence24KPI];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    var fieldVence24KPICorto = 'Vence24KPICorto';

    var sumaTotalVence24KPICorto = data.map(function (row) {
        return +row[fieldVence24KPICorto];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    var fieldTotalKPI = 'TotalKPI';

    var sumaTotalKPI = data.map(function (row) {
        return +row[fieldTotalKPI];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    var porcentaje = 0;
    var sumprevia = ((sumaTotalObsoletoKPI * 1) + (sumaTotalVence12KPI * 0.5) + (sumaTotalVence24KPI * 0.5));
    if (sumprevia > 0) {
        porcentaje = (sumprevia / sumaTotalKPI)*100;
        
    }
    //var redondeo = Math.round(parseFloat(porcentaje) * 1000) / 1000;

    return '<strong>' + porcentaje.toFixed(2) + '%</strong>';
}
function totalPorcentajeFormatterReal(data) {
    var fieldObsoletoKPI = 'ObsoletoKPI';

    var sumaTotalObsoletoKPI = data.map(function (row) {
        return +row[fieldObsoletoKPI];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    
    var fieldTotalKPI = 'TotalKPI';

    var sumaTotalKPI = data.map(function (row) {
        return +row[fieldTotalKPI];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    var porcentaje = 0;
    var sumprevia = sumaTotalObsoletoKPI;
    if (sumprevia > 0) {
        porcentaje = (sumprevia / sumaTotalKPI) * 100;

    }
    //var redondeo = Math.round(parseFloat(porcentaje) * 1000) / 1000;

    return '<strong>' + porcentaje.toFixed(2) + '%</strong>';
}



function totalPorcentajeFormatter(data) {
   
    var fieldTotal = 'TotalKPI';

    var field = this.field.replace("Porcentaje", "");
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

function nombreReporteFormatter(value, row, index) {
    return `<a href="javascript:MostrarGraficoLineaTiempo('${value}')" title="Ver gráfico">${value}</a>`;
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

function obsoletoFormatter(data) {
    return `<span class="textoRojo">${data}</span>`;
}

function vigenteFormatter(data) {
    return `<span class="textoVerdeFuerte">${data}</span>`;
}

function vence12Formatter(data) {
    return `<span class="textoNaranja">${data}</span>`;
}

function vence24Formatter(data) {
    return `<span class="textoVerdeLeve">${data}</span>`;
}


function ListarCombos(fn = null) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/TecnologiaSoportadoPorConsolidadoObsolescencia/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    LIST_SUBDOMINIO = dataObject.SubDominio;
                    SetItemsMultiple(dataObject.Dominio, $("#cbBusDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(LIST_SUBDOMINIO.map(x => x), $("#cbBusSubDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.UnidadFondeo, $("#cbUnidadFondeo"), TEXTO_TODOS, TEXTO_TODOS, true);
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

function InitAutocompletarGestionadoPor($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                //let dominioIds = ($("#cbBusDominioTecnologia").val() || []).join(',');
                //let subDominioIds = ($("#cbBusSubDominioTecnologia").val() || []).join(',');

                $.ajax({
                    url: `${URL_API}/Aplicacion/GetGestionadoByFiltro?filtro=${request.term}`,
                    //data: JSON.stringify({filtro: request.term,}),
                    dataType: "json",
                    type: "GET",
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
            if ($searchBox.val() == "") {
                $IdBox.val("");
            }
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarAplicacion($searchBox, $IdBox, $container, fn = null) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = `${URL_API}/Aplicacion/GetAplicacionByFiltro?filtro=${request.term}`;

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
            }
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
            var a = document.createElement("a");
            var font = document.createElement("font");
            font.append(document.createTextNode(item.value));
            a.style.display = 'block';
            a.append(font);
            return $("<li>").append(a).appendTo(ul);
    };
}

function exportar() {
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
        return false;
    }
    
    var { dominioIds, subDominioIds, aplicacionStr, gestionadoPor } = DATA_EXPORTAR;
    let url = `${URL_API_VISTA}/ExportarListadoConsolidadoSoportadoPorObsolescencia?dominioIds=${dominioIds}&subDominioIds=${subDominioIds}&aplicacionStr=${aplicacionStr}&gestionadoPor=${encodeURIComponent(gestionadoPor)}`;
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


