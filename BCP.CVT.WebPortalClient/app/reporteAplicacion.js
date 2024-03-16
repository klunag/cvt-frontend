var $table = $("#tblRegistro");
var $tableDetalle = $("#tblRegistrosDetalle");
var URL_API_VISTA = URL_API + "/Dashboard";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Detalle por gerencia y divisiones";
const INIT_FILTER_ESTADO = ['En Desarrollo', 'No Vigente', 'Vigente'];

var columns = [
    { field: 'TotalTecnologiasObsoletas', formatter: estadoFormatter, title: 'Estado', width: '120' },
    { field: 'CodigoApt', formatter: linkFormatter, title: 'Código de <br />aplicación', width: '50' },
    { field: 'Aplicacion', title: 'Aplicación', width: '200' },
    { field: 'DetalleCriticidad', title: 'Criticidad', width: '200' },
    { field: 'EstadoAplicacion', title: 'Estado', width: '100' },
    { field: 'TipoActivoInformacion', title: 'Tipo de activo', width: '100' },
    { field: 'GestionadoPor', title: 'Soportado por/Tribu', width: '100' },
    { field: 'UnidadFondeo', title: 'Unidad de Fondeo', width: '100' },
    { field: 'GerenciaCentral', title: 'Gerencia central', width: '200' },
    { field: 'Division', title: 'División', width: '200' },
    { field: 'Area', title: 'Área', width: '200' },
    { field: 'Unidad', title: 'Unidad', width: '200' },
    { field: 'JefeEquipo_ExpertoAplicacion', title: 'Jefe de equipo', width: '200' },
    { field: 'TribeTechnicalLead', title: 'TTL', width: '200' },
    { field: 'Owner_LiderUsuario_ProductOwner', title: 'Líder usuario', width: '200' },
    { field: 'ExpertoEspecialista', title: 'Experto / Especialista', width: '200' },
    { field: 'Gestor', title: 'Gestor / Usuario autorizador', width: '200' },
    { field: 'BrokerSistemas', title: 'Broker', width: '200' },
    { field: 'RoadMap', title: 'Clasificación técnica', width: '80' },
    { field: 'TotalServidores', title: 'Total de <br />servidores <br />relacionados', width: '100' },
    { field: 'TotalTecnologias', title: 'Total de <br />tecnologías', width: '100' },
    { field: 'IndiceObsolescencia_FLooking', formatter: porcentajeFormatter, title: 'KPI Obsolescencia<br />Forward Looking (%)', width: '100' },
    { field: 'IndiceObsolescencia', formatter: porcentajeFormatter, title: 'KPI Obsolescencia<br /> Real (%)', width: '100' },
    //{ field: 'IndiceObsolescencia_FL_Proyeccion', formatter: porcentajeFormatter, title: 'KPI Obsolescencia<br />Forward Looking (%) <br /> Proyectado', width: '100' },
]
$(function () {
    //$("#cbFilEstado").attr("multiple", true);
    //SetItemsMultiple([], $("#cbFilEstado"), TEXTO_TODOS, TEXTO_TODOS, true);
    getCurrentUser();
    FormatoCheckBox($("#divFlagProyectado"), 'cbFlagProyectado');
    $("#divFechaFiltro").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    //let fechaFin = new Date();
    //$("#divFechaProyeccion").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY",
    //    minDate: fechaFin
    //});
    _BuildDatepickerProyeccion($("#FechaProyeccion"));
    $("#cbFlagProyectado").on('change', function () { changeFlagProyectado() });
    CargarCombos();
    validarForm();
    //listarRegistros();

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        if (row.TotalServidores + row.TotalTecnologias !== 0) {
            listarRegistrosDetalle(row.CodigoApt, $('#tblRegistrosDetalle_' + row.Id), $detail);
        } else {
            $detail.empty().append("No existen registros.");
        }
    });
    
    InitAutocompletarBuilder($("#txtAplicacion"), $("#hdAplicacionId"), ".containerAplicacion", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    $tableDetalle.bootstrapTable();
    $tableDetalle.bootstrapTable({ data: [] });

    setDefaultHd($("#txtAplicacion"), $("#hdAplicacionId"));
});
function changeFlagProyectado() {
    let flagProyectado = $("#cbFlagProyectado").prop("checked");
    if (flagProyectado) {
        $("#divProyeccion").css('display', 'block');
    } else {
        $("#divProyeccion").css('display', 'none');
    }
}

function CargarCombos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/Aplicacion/ListarCombosReporteAplicacion",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    SetItemsMultiple(dataObject.EstadoAplicacion, $("#cbFilEstado"), TEXTO_TODOS, TEXTO_TODOS, true);
                    $("#cbFilEstado").val(INIT_FILTER_ESTADO);
                    $("#cbFilEstado").multiselect("refresh");
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
function validarForm() {

    $.validator.addMethod("verificarFechaProyeccion", function (value, element) {
        let flagProyectado = $("#cbFlagProyectado").prop("checked");
        if (flagProyectado) {
            if ($("#FechaProyeccion").val() == "") {
                return false;
            }
        }
        return true;
    });

    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            
            FechaProyeccion: {
                verificarFechaProyeccion: true
            },
        },
        messages: {
            FechaProyeccion: {
                verificarFechaProyeccion: String.Format("Debes seleccionar {0}.", "una fecha de proyección")
            },
        }
    });
}
function RefrescarListado() {
    listarRegistros();
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

function listarRegistros() {
    if ($("#formFiltros").valid()) {
        columns.forEach(function (currentValue, index, arr) {
            if (columns[index].field == 'IndiceObsolescencia_FL_Proyeccion') {
                columns.splice(index, index);
            }
        })
        let flagProyectado = $("#cbFlagProyectado").prop("checked");
        if (flagProyectado) {
            let titulo = 'KPI Obsolescencia<br />Forward Looking (%) <br /> Proyectado al  ' + $("#FechaProyeccion").val();
            let columna = { field: 'IndiceObsolescencia_FL_Proyeccion', formatter: porcentajeFormatter, title: titulo, width: '100' }
            columns.push(columna);
        }

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA + "/Reportes/GerenciaDivisionConsultor",
            method: 'POST',
            columns: columns,
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pagination: true,
            sidePagination: 'server',
            queryParamsType: 'else',
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            sortName: 'CodigoApt',
            sortOrder: 'asc',
            fixedColumns: true,
            fixedNumber: 4,
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.Aplicacion = $("#hdAplicacionId").val() !== "0" ? $("#hdAplicacionId").val() : $("#txtAplicacion").val();  //: $("#hdAplicacionId").val(); //$("#txtAplicacion").val() || ""
                DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFilEstado").val()); //$("#cbFilEstado").val();
                DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
                DATA_EXPORTAR.FlagProyeccion = $("#cbFlagProyectado").prop("checked");
                DATA_EXPORTAR.FechaProyeccion = CaseIsNullSendExport($("#FechaProyeccion").val());
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
    }

       
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
                //if (index == 21) {
                //    $(this).addClass('IndiceObsolescencia_col');
                //}
                if (index < count_fixed_collumns) {
                    $(this).css('position', 'absolute')
                        .css('margin-left', '-' + table_collumns_margin[index] + 'px')
                        .css('width', table_collumns_width[index] + 1);

                    $(this).addClass('table-fixed-cell');
                }
                $(this).css('height', maxH);
            });
        });
        //if (USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_Administrador") == false) {
        //    var all_col = document.getElementsByClassName("IndiceObsolescencia_col");
        //    for (var i = 0; i < all_col.length; i++) {
        //        all_col[i].style.display = "none";
        //    }
        //}
    }
}

function listarRegistrosDetalle(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Reportes/GerenciaDivisionDetallado",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.JefeEquipo = '';
            DATA_EXPORTAR.Owner = '';
            DATA_EXPORTAR.Experto = '';
            DATA_EXPORTAR.Gerencia = '';
            DATA_EXPORTAR.Division = '';
            DATA_EXPORTAR.Gestionado = '';
            DATA_EXPORTAR.Aplicacion = id;
            DATA_EXPORTAR.Area = '';
            DATA_EXPORTAR.Unidad = '';
            DATA_EXPORTAR.TipoActivo = '';
            DATA_EXPORTAR.Gestor = '';
            DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
            DATA_EXPORTAR.FlagProyeccion = $("#cbFlagProyectado").prop("checked");
            DATA_EXPORTAR.FechaProyeccion = $("#FechaProyeccion").val();
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.sortName = p.sortName;

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

function ExportarInfo() {

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Aplicacion = $("#hdAplicacionId").val() === "0" ? $("#txtAplicacion").val() : $("#hdAplicacionId").val(); //$("#txtAplicacion").val() || ""; // 
    DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFilEstado").val());
    DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
    DATA_EXPORTAR.FlagProyeccion = $("#cbFlagProyectado").prop("checked");
    DATA_EXPORTAR.FechaProyeccion = CaseIsNullSendExport($("#FechaProyeccion").val());
    DATA_EXPORTAR.sortName = 'Priorizacion';
    DATA_EXPORTAR.sortOrder = 'desc';

    let url = `${URL_API_VISTA}/Reportes/GerenciaDivisionConsultor/Exportar?aplicacion=${DATA_EXPORTAR.Aplicacion}&estado=${DATA_EXPORTAR.Estado}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&fecha=${DATA_EXPORTAR.Fecha}&flagProyeccion=${DATA_EXPORTAR.FlagProyeccion}&fechaProyeccion=${DATA_EXPORTAR.FechaProyeccion}`;
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
function porcentajeFormatter(data) {
    var datos = 0;
    if (data != undefined) {
        datos = data;
    }
    return '<strong>' + datos.toFixed(2) + '%</strong>';
}