var $table = $("#tblRegistro");
var $tableDetalle = $("#tblRegistrosDetalle");
var URL_API_VISTA = URL_API + "/Hardware";
var URL_API_VISTA_VAL = URL_API + "/Relacion";
const texto_mostrar = "Mostrar filtros adicionales";
const texto_ocultar = "Ocultar filtros adicionales";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Detalle por gerencia y divisiones";

var DATA_TEAM_SQUAD = [];
var DATA_MODELO = [];
const arrMultiSelect = [
    { SelectId: "#cbGestionadoPor", DataField: "GestionaPor" },
    { SelectId: "#cbTeamSquad", DataField: "TeamSquad" },
    { SelectId: "#cbModelo", DataField: "Modelo" },
    { SelectId: "#cbFabricante", DataField: "Fabricante" },
    { SelectId: "#cbTipoHardware", DataField: "TipoHardware" },
    { SelectId: "#cbEstadoObsolescencia", DataField: "EstadoObsolescencia" },
    { SelectId: "#cbUnidadFondeo", DataField: "UnidadFondeo" }
];
let userCount = 0;
$(function () {
    getCurrentUser();
})
$(document).ajaxComplete(function () {
    if (userCurrent != null && userCount == 0) {
        userCount++;
        InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
        InitAutocompletarBuilder($("#txtEquipo"), $("#hEquipo"), ".containerFiltroEquipo", "/Hardware/GetEquipoByFiltro?filtro={0}");
        _BuildDatepicker($("#FechaFiltro"));
        CargarCombos();
        $("#cbGestionadoPor").on('change', function () { changeGestionadoPor(); });
        $("#cbFabricante").on('change', function () { changeFabricante(); });



        
        //MethodValidarFecha(RANGO_DIAS_HABILES);
        //validarForm();

        //if (FLAG_ADMIN === 1) {
        //    $("#cbFilGestionadoPor").addClass("ignore");
        //    listarRegistros();
        //} else {
        //    $("#cbFilGestionadoPor").removeClass("ignore");
        //    $table.bootstrapTable({ data: [] });
        //}



        //$table.on('expand-row.bs.table', function (e, index, row, $detail) {
        //    if (row.TotalServidores + row.TotalTecnologias !== 0) {
        //        listarRegistrosDetalle(row.CodigoApt, $('#tblRegistrosDetalle_' + row.Id), $detail);
        //    } else {
        //        $detail.empty().append("No existen registros.");
        //    }
        //});

        //$tableDetalle.bootstrapTable();
        //$tableDetalle.bootstrapTable({ data: [] });

        //setDefaultHd($("#txtAplicacion"), $("#hdAplicacionId"));

    }
});

function CargarCombos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos_Detallado",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItemsMultiple(dataObject.GestionadoPor, $("#cbGestionadoPor"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TeamSquad, $("#cbTeamSquad"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Modelo, $("#cbModelo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Fabricante, $("#cbFabricante"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TipoHardware, $("#cbTipoHardware"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.EstadoObsolescencia, $("#cbEstadoObsolescencia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.UnidadFondeo, $("#cbUnidadFondeo"), TEXTO_TODOS, TEXTO_TODOS, true);
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
function RefrescarListado() {
    listarRegistros();
}
function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/ReporteDetallado",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Equipo',
        sortOrder: 'asc',
        //fixedColumns: true,
        //fixedNumber: 4,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.UnidadFondeo = CaseIsNullSendExport($("#cbUnidadFondeo").val());
            DATA_EXPORTAR.GestionadoPor = CaseIsNullSendExport($("#cbGestionadoPor").val());
            DATA_EXPORTAR.TeamSquad = CaseIsNullSendExport($("#cbTeamSquad").val());
            DATA_EXPORTAR.EquipoId = $("#txtEquipo").val() == "" ? 0 : $("#hEquipo").val();
            DATA_EXPORTAR.Fabricante = CaseIsNullSendExport($("#cbFabricante").val());
            DATA_EXPORTAR.Modelo = CaseIsNullSendExport($("#cbModelo").val());
            DATA_EXPORTAR.EstadoObsolescencia = CaseIsNullSendExport($("#cbEstadoObsolescencia").val());
            DATA_EXPORTAR.TipoHardware = CaseIsNullSendExport($("#cbTipoHardware").val());
            DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            return JSON.stringify(DATA_EXPORTAR);
        },
        onLoadSuccess: function () {
            app_handle_listing_horisontal_scroll($('#table-listing'));
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
        onResetView: function () {
            app_handle_listing_horisontal_scroll($('#table-listing'));
        }
    });
    //if ($("#formFiltros").valid() && validarSeleccionUnFiltro()) {
        

    //}

}
function linkFormatterEquipo(value, row, index) {
    return `<a href="/Vista/DetalleEquipo?id=${row.EquipoId}" title="Ver detalle del Equipo / Activo TI" target="_blank">${value}</a>`;
}
function semaforoFormato(value, row, index) {
    var html = "";
    if (value === "") {
        html = "-";
    }
    else {
        if (value === -1) { //ROJO
            html = '<button type="button" class="btn btn-danger btn-circle"></button>';
        } else if (value === 1) {
            html = '<button type="button" class="btn btn-success btn-circle"></button>';
        } else {
            html = '<button type="button" class="btn btn-warning btn-circle"></button>';
        }
    }
    return html;
}
function ExportarInfo() {
    if ($("#formFiltros").valid() && validarSeleccionUnFiltro()) {

        DATA_EXPORTAR = {};
        DATA_EXPORTAR.UnidadFondeo = CaseIsNullSendExport($("#cbUnidadFondeo").val());
        DATA_EXPORTAR.GestionadoPor = CaseIsNullSendExport($("#cbGestionadoPor").val());
        DATA_EXPORTAR.TeamSquad = CaseIsNullSendExport($("#cbTeamSquad").val());
        DATA_EXPORTAR.EquipoId = $("#txtEquipo").val() == "" ? 0 : $("#hEquipo").val();
        DATA_EXPORTAR.Fabricante = CaseIsNullSendExport($("#cbFabricante").val());
        DATA_EXPORTAR.Modelo = CaseIsNullSendExport($("#cbModelo").val());
        DATA_EXPORTAR.EstadoObsolescencia = CaseIsNullSendExport($("#cbEstadoObsolescencia").val());
        DATA_EXPORTAR.TipoHardware = CaseIsNullSendExport($("#cbTipoHardware").val());
        DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
        DATA_EXPORTAR.sortName = 'Equipo';
        DATA_EXPORTAR.sortOrder = 'asc';

        let url = `${URL_API_VISTA}/Exportar_Detallado?UnidadFondeoIds=${DATA_EXPORTAR.UnidadFondeo}&GestionadoPorIds=${DATA_EXPORTAR.GestionadoPor}&TeamSquadIds=${DATA_EXPORTAR.TeamSquad}&EquipoId=${DATA_EXPORTAR.EquipoId}&FabricanteIds=${DATA_EXPORTAR.Fabricante}&ModeloIds=${DATA_EXPORTAR.Modelo}&EstadoObsolescenciaIds=${DATA_EXPORTAR.EstadoObsolescencia}&TipoHardwareIds=${DATA_EXPORTAR.TipoHardware}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&fecha=${DATA_EXPORTAR.Fecha}`;
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





function validarForm() {


    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbGestionadoPor: {
                requiredSelect: true
            },
            //FechaFiltro: {
            //    //required: true,
            //    isDate: true,
            //    FechaPrevia: true,
            //    FechaMaxima: true
            //}

        },
        messages: {
            cbGestionadoPor: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "una tribu")
            },
            //FechaFiltro: {
            //    required: "Debe seleccionar una fecha",
            //    isDate: "Debe ingresar una fecha valida",
            //    FechaPrevia: "Debe ingresar una fecha valida",
            //    FechaMaxima: "Debe ingresar una fecha menor a la actual"
            //}

        }
    });
}

function validarSeleccionUnFiltro() {
    var rpta = true;

    if (FLAG_ADMIN !== 1) {
        var tipo = 2;
        let $btn = $("#btnMostrarFiltroAdicionales");
        if ($btn.html() === texto_mostrar) {
            tipo = 1;
        }

        var filtro1 = $("#txtJefeEquipo").val();
        var filtro2 = $("#txtOwner").val();
        var filtro3 = $("#txtAplicacion").val();
        //AVANZADOS
        var filtro5 = $("#txtGerencia").val(); //Combo
        var filtro6 = $("#txtDivision").val();
        var filtro7 = $("#txtExperto").val();
        var filtro8 = $("#txtGestor").val();
        var filtro9 = $("#txtArea").val();
        var filtro10 = $("#txtUnidad").val();
        var filtro11 = $("#cbFilEstado").val();
        var filtro12 = $("#cbTipoActivo").val();


        if (tipo === 1) { // FILTROS BASICOS
            if (filtro1 === "" && filtro2 === "" && filtro3 === "") {
                rpta = false;
                bootbox.alert("Debe usar por lo menos un filtro más");
            }
        } else if (tipo === 2) { //FILTROS AVANZADOS
            if (filtro1 === "" && filtro2 === "" && filtro3 === "" && filtro5 === "-1" && filtro6 === "" && filtro7 === "" &&
                filtro8 === "" && filtro9 === "" && filtro10 === "" && filtro11 === "-1" && filtro12 === "-1") {
                rpta = false;
                bootbox.alert("Debe usar por lo menos un filtro más");
            }
        }

    }

    return rpta;
}




function estadoFormatter(value, row, index) {
    var html = "";
    if (row.EquipoSinTecnologiasYServidores == true) {
        html = "-";
    }
    else {
        if (row.ReporteIndicadorActual === -1) { //ROJO
            html = '<button type="button" class="btn btn-danger btn-circle"></button>';
        } else if (row.ReporteIndicadorActual === 1) {
            html = '<button type="button" class="btn btn-success btn-circle"></button>';
        } else {
            html = '<button type="button" class="btn btn-warning btn-circle"></button>';
        }
    }
    
    return html;
}

function semaforoFormatter(value, row, index) {
    var html = "";
    if (row.EquipoSinTecnologiasYServidores == true) {
        html = "-";
    }
    else {
        if (row.IndicadorObsolescencia === 1) { //VERDE
            html = '<button type="button" class="btn btn-success btn-circle"></button>';
        } else if (row.IndicadorObsolescencia === -1) { //ROJO
            html = '<button type="button" class="btn btn-danger btn-circle"></button>';
        }
        else {
            html = '<button type="button" class="btn btn-warning btn-circle"></button>';
        }
    }
    
    return html;
}

function semaforoIndice1Formatter(value, row, index) {
    var html = "";
    if (row.EquipoSinTecnologiasYServidores == true) {
        html = "-";
    }
    else {
        if (row.IndicadorObsolescencia_Proyeccion1 === 1) { //VERDE
            html = '<button type="button" class="btn btn-success btn-circle"></button>';
        } else if (row.IndicadorObsolescencia_Proyeccion1 === -1) { //ROJO
            html = '<button type="button" class="btn btn-danger btn-circle"></button>';
        }
        else {
            html = '<button type="button" class="btn btn-warning btn-circle"></button>';
        }
    }    
    return html;
}

function semaforoIndice2Formatter(value, row, index) {
    var html = "";
    if (row.EquipoSinTecnologiasYServidores == true) {
        html = "-";
    }
    else {
        if (row.IndicadorObsolescencia_Proyeccion2 === 1) { //VERDE
            html = '<button type="button" class="btn btn-success btn-circle"></button>';
        } else if (row.IndicadorObsolescencia_Proyeccion2 === -1) { //ROJO
            html = '<button type="button" class="btn btn-danger btn-circle"></button>';
        }
        else {
            html = '<button type="button" class="btn btn-warning btn-circle"></button>';
        }
    }
    
    return html;
}

function semaforoFormatterFL(value, row, index) {
    var html = "";
    if (row.EquipoSinTecnologiasYServidores == true) {
        html = "-";
    }
    else {
        if (row.IndicadorObsolescenciaKPIFL === 1) { //VERDE
            html = '<button type="button" class="btn btn-success btn-circle"></button>';
        } else if (row.IndicadorObsolescenciaKPIFL === -1) { //ROJO
            html = '<button type="button" class="btn btn-danger btn-circle"></button>';
        }
        else {
            html = '<button type="button" class="btn btn-warning btn-circle"></button>';
        }
    }

    return html;
}

function semaforoIndice1FormatterFL(value, row, index) {
    var html = "";
    if (row.EquipoSinTecnologiasYServidores == true) {
        html = "-";
    }
    else {
        if (row.IndicadorObsolescencia_Proyeccion1KPIFL === 1) { //VERDE
            html = '<button type="button" class="btn btn-success btn-circle"></button>';
        } else if (row.IndicadorObsolescencia_Proyeccion1KPIFL === -1) { //ROJO
            html = '<button type="button" class="btn btn-danger btn-circle"></button>';
        }
        else {
            html = '<button type="button" class="btn btn-warning btn-circle"></button>';
        }
    }
    return html;
}

function semaforoIndice2FormatterFL(value, row, index) {
    var html = "";
    if (row.EquipoSinTecnologiasYServidores == true) {
        html = "-";
    }
    else {
        if (row.IndicadorObsolescencia_Proyeccion2KPIFL === 1) { //VERDE
            html = '<button type="button" class="btn btn-success btn-circle"></button>';
        } else if (row.IndicadorObsolescencia_Proyeccion2KPIFL === -1) { //ROJO
            html = '<button type="button" class="btn btn-danger btn-circle"></button>';
        }
        else {
            html = '<button type="button" class="btn btn-warning btn-circle"></button>';
        }
    }

    return html;
}


function app_handle_listing_horisontal_scroll(listing_obj) {
    let table_obj = $('.table', listing_obj);
    let count_fixed_collumns = table_obj.attr('data-count-fixed-columns');

    if (count_fixed_collumns > 0) {
        let wrapper_obj = $('.table-scrollable', listing_obj);

        let wrapper_left_margin = 0;

        let table_collumns_width = new Array();
        let table_collumns_margin = new Array();

        $('th', table_obj).each(function (index) {
            if (index < count_fixed_collumns) {
                wrapper_left_margin += $(this).outerWidth();
                table_collumns_width[index] = $(this).outerWidth();
            }
        });

        $.each(table_collumns_width, function (key, value) {
            if (key === 0) {
                table_collumns_margin[key] = wrapper_left_margin;
            }
            else {
                let next_margin = 0;
                $.each(table_collumns_width, function (key_next, value_next) {
                    if (key_next < key) {
                        next_margin += value_next;
                    }
                });
                table_collumns_margin[key] = wrapper_left_margin - next_margin;
            }
        });

        if (wrapper_left_margin > 0) {
            wrapper_obj.css('cssText', 'margin-left:' + wrapper_left_margin + 'px !important; width: auto');
        }

        var maxH = 0;
        //$("article .igualar").each(function (i) {
        //    var actH = $(this).height();
        //    if (actH > maxH) maxH = actH;
        //});
        //$("article .igualar").height(maxH);

        $('tr', table_obj).each(function () {
            let current_row_height = $(this).outerHeight();
            //maxH = 0;
            //console.log("maxH", maxH);
            $('th,td', $(this)).each(function (index) {
                let current_row_height = $(this).outerHeight();
                if (current_row_height > maxH) maxH = current_row_height;
                //console.log("current_row_height", $(this)[0].innerText, current_row_height);
            });
            //console.log("current_row_height > maxH", maxH);
            $('th,td', $(this)).each(function (index) {
                //let current_row_height = $(this).height();
                //if (current_row_height > maxH) maxH = current_row_height;
                if (index == 21) {
                    $(this).addClass('IndiceObsolescencia_col');
                }
                if (index < count_fixed_collumns) {
                    $(this).css('position', 'absolute')
                        .css('margin-left', '-' + table_collumns_margin[index] + 'px')
                        .css('width', table_collumns_width[index] + 1);

                    $(this).addClass('table-fixed-cell');
                }

                $(this).css('height', maxH);
            });
            
        });
        if (userCurrent.Perfil.includes("E195_Administrador") == false) {
            var all_col = document.getElementsByClassName("IndiceObsolescencia_col");
            for (var i = 0; i < all_col.length; i++) {
                all_col[i].style.display = "none";
            }
        }

    }
}


function listarRegistrosDetalle(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Reportes/GerenciaDivisionDetallado",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.JefeEquipo = CaseIsNullSendExport($("#txtJefeEquipo").val());//$("#txtJefeEquipo").val();
            DATA_EXPORTAR.Owner = CaseIsNullSendExport($("#txtOwner").val());//$("#txtOwner").val();
            DATA_EXPORTAR.Experto = CaseIsNullSendExport($("#txtExperto").val());//$("#txtExperto").val();
            DATA_EXPORTAR.Gerencia = CaseIsNullSendExport($("#txtGerencia").val()); //$("#txtGerencia").val();
            DATA_EXPORTAR.Division = CaseIsNullSendExport($("#txtDivision").val()); //$("#txtDivision").val();
            DATA_EXPORTAR.Gestionado = CaseIsNullSendExport($("#cbFilGestionadoPor").val());
            DATA_EXPORTAR.Aplicacion = id;
            DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFilEstado").val()); //$("#cbFilEstado").val(); //TODO
            DATA_EXPORTAR.Area = CaseIsNullSendExport($("#txtArea").val());//$("#txtArea").val();
            DATA_EXPORTAR.Unidad = CaseIsNullSendExport($("#txtUnidad").val());//$("#txtUnidad").val();
            DATA_EXPORTAR.TipoActivo = CaseIsNullSendExport($("#cbTipoActivo").val()); //$("#cbTipoActivo").val(); //TODO
            DATA_EXPORTAR.ClasificacionTecnica = CaseIsNullSendExport($("#ddlClasificacionTecnica").val()); //$("#cbTipoActivo").val(); //TODO
            DATA_EXPORTAR.SubclasificacionTecnica = CaseIsNullSendExport($("#ddlSubclasificacionTecnica").val()); //$("#cbTipoActivo").val(); //TODO
            DATA_EXPORTAR.UnidadFondeo = CaseIsNullSendExport($("#ddlUnidadFondeo").val());
            DATA_EXPORTAR.Gestor = CaseIsNullSendExport($("#txtGestor").val());//$("#txtGestor").val();
            DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
            DATA_EXPORTAR.TTL = CaseIsNullSendExport($("#txtTTL").val());//$("#txtTTL").val();
            DATA_EXPORTAR.Broker = CaseIsNullSendExport($("#txtBroker").val());//$("#txtBroker").val();
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
        onLoadSuccess: function (status, res) {
            OpenModal();
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

//TODO

function detailFormatter(index, row) {

    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="semaforoFormatter" data-field="IndicadorObsolescencia" data-halign="center" data-valign="middle" data-align="center" data-width="100">Estado</th >\
                                    <th data-field="TipoToString" data-halign="center" data-valign="middle" data-align="left" data-width="50" data-sortable="true" data-sort-name="TipoId">Tipo</th>\
                                    <th data-field="Nombre" data-halign="center" data-valign="middle" data-align="left" data-width="50" data-sortable="true" data-sort-name="Nombre">Equipo</th>\
                                    <th data-field="EstadoToString" data-halign="center" data-valign="middle" data-align="left" data-width="200" data-sortable="true" data-sort-name="EstadoId">Estado</th>\
                                    <th data-field="DetalleAmbiente" data-halign="center" data-valign="middle" data-align="left" data-width="200" data-sortable="true" data-sort-name="Ambiente">Ambiente</th>\
                                    <th data-field="Dominio" data-halign="center" data-valign="middle" data-align="left" data-width="100" data-sortable="true" data-sort-name="Dominio">Dominio</th>\
                                    <th data-field="Subdominio" data-halign="center" data-valign="middle" data-align="left" data-width="200" data-sortable="true" data-sort-name="Subdominio">Subdominio</th>\
                                    <th data-field="ClaveTecnologia" data-halign="center" data-valign="middle" data-align="center" data-width="200" data-sortable="true" data-sort-name="ClaveTecnologia">Tecnología</th>\
                                    <th data-field="FechaFinToString" data-halign="center" data-valign="middle" data-align="center" data-width="200" data-sortable="true" data-sort-name="FechaCalculoBase">Fecha de fin <br/>de soporte</th>\
                                    <th data-field="IndiceObsolescencia" data-halign="center" data-valign="middle" data-align="center" data-width="80" data-sortable="true" data-sort-name="IndiceObsolescencia">Índice de obsolescencia</th>\
                                </tr>\
                            </thead>\
                        </table>', row.Id);

    return html;
}
function MostrarFiltroAdicionales() {
    let $btn = $("#btnMostrarFiltroAdicionales");
    if ($btn.html() === texto_mostrar) {
        $(".filtroAvanzado").show();

        //LimpiarFiltrosAdicionales();

        $btn.html(texto_ocultar);
    } else if ($btn.html() === texto_ocultar) {
        $(".filtroAvanzado").hide();
        $(".filtroAvanzado").find(".form-control.ui-autocomplete-input").val("");
        //LimpiarFiltrosAdicionales();


        $btn.html(texto_mostrar);
    }
}

function LimpiarFiltrosAdicionales() {
    $("#txtGerencia").val("-1");
    $("#txtDivision").val("-1");
    $("#txtExperto").val("-1");
    $("#txtAplicacion").val("");
    $("#txtArea").val("-1");
    $("#txtUnidad").val("-1");
    $("#cbFilEstado").val("-1");
    $("#ddlClasificacionTecnica").val("-1");
}

function linkFormatter(value, row) {
    return `<a href="javascript:ViewDetails('${value}')" title="Mostrar detalle">${value}</a>`;
}
function ViewDetails(codigoAPT) {
    listarRegistrosDetalle(codigoAPT, $tableDetalle, null);

}
function LimpiarMdAddOrEditRegistro() {
    $tableDetalle.bootstrapTable();
    $tableDetalle.bootstrapTable({ data: [] });
}
function OpenModal() {
    MdAddOrEditRegistro(true);
}
function MdAddOrEditRegistro(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    if (EstadoMd)
        $("#MdAddOrEditModal").modal(opcionesModal);
    else
        $("#MdAddOrEditModal").modal("hide");
}



function linkFormatterEquipo(value, row, index) {
    if (row.EquipoId > 0) {
        var opcion = "";
        opcion = `<a href="/Vista/DetalleEquipo?id=${row.EquipoId}" title="Ver detalle del Equipo / Activo TI" target="_blank">${value}</a>`;
        //if (row.TipoEquipoId != TIPO_EQUIPO_ID_CD) {
        //    opcion = `<a href="/Vista/DetalleEquipo?id=${row.EquipoId}" title="Ver detalle del Equipo / Activo TI" target="_blank">${value}</a>`;
        //} else {
        //    opcion = `<a href="/Vista/DetalleCertificadoD?id=${row.EquipoId}" title="Ver detalle del Equipo / Activo TI" target="_blank">${value}</a>`;
        //}
        return opcion;
    }
    else
        return '-';
}

function linkFormatterTecnologia(value, row, index) {
    if (row.TecnologiaId > 0)
        return `<a href="TecnologiaEquipo/${row.TecnologiaId}" title="Ver detalle de la tecnología" target="_blank">${value}</a>`;
    else
        return '-';
}

function porcentajeFormatter(data) {
    var datos = 0;
    if (data != undefined) {
        datos = data;
    }
    return '<strong>' + datos.toFixed(2) + '%</strong>';
}