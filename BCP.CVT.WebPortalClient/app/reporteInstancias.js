var $table = $("#tblRegistro");
var $tblDetalle = $("#tblDetalleAplicacion");

var URL_API_VISTA = URL_API + "/Portafolio";
var URL_API_VISTA_2 = URL_API + "/Indicadores/Gerencial/Equipos";

$(function () {    
    CargarCombos();    
    ListarRegistros();

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        listarRegistrosDetalle(row.Orden, row.Subdominio, $('#tblRegistrosDetalle_' + row.Orden), $detail);        
    });    
});

function RefrescarListado() {
    ListarRegistros();
}

function CargarCombos() {    
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA_2 + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {

                    SetItemsMultiple(dataObject.ListaTipoEquipos, $("#cbTipoEquipo"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.ListaSubsidiarias, $("#cbSubsidiaria"), TEXTO_SELECCIONE, TEXTO_TODAS, true);
                    
                    $("#cbTipoEquipo").val([1]);
                    $("#cbTipoEquipo").multiselect("refresh");

                    $("#cbSubsidiaria").val([0, 1, 3, 5]);
                    $("#cbSubsidiaria").multiselect("refresh");                                        
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            
        },
        async: false
    });
}

function ListarRegistros() {     
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Instancias",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Orden',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.TipoEquipoFiltro = CaseIsNullSendExport($("#cbTipoEquipo").val());
            DATA_EXPORTAR.SubsidiariaFiltro = CaseIsNullSendExport($("#cbSubsidiaria").val());
            DATA_EXPORTAR.AppsId = $("#cbRelacionApps").val();
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

function detailFormatterDetalle(value, row, index) {
    return `<a href="#" title="Ver aplicaciones" onclick="verDetalleAplicaciones(${row.Orden},${row.Subdominio},${row.TecnologiaId})"><i class="glyphicon glyphicon-list"></i></a>`;
}

function verDetalleAplicaciones(orden, subdominio, tecnologia) {
    listarDetalleAplicacion($("#mdDetalleAplicacion"), orden, subdominio, tecnologia);
}

function detailFormatter(index, row) {
    var html = String.Format('<table id="tblRegistrosDetalle_{0}" data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\ data-show-header="false" >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="detailFormatterDetalle" data-halign="center" data-valign="middle" data-align="center" data-width="2%"></th>\
                                    <th data-field="NombreReporte" data-detail-formatter="detailFormatterDetalle" data-halign="center" data-valign="middle" data-align="left">Tecnología</th>\
                                    <th data-field="Ahora" data-halign="center" data-valign="middle" data-align="center" data-width="12%" class="fondoRojo">Ahora</th>\
                                    <th data-field="Meses12" data-halign="center" data-valign="middle" data-align="center" data-width="12%" class="fondoNaranja">12 meses</th>\
                                    <th data-field="Meses24" data-halign="center" data-valign="middle" data-align="center" data-width="12%" class="fondoAmarillo">24 meses</th>\
                                    <th data-field="Meses36" data-halign="center" data-valign="middle" data-align="center" data-width="12%" class="fondoVerdeLeve">36 meses</th>\
                                    <th data-field="Mas36" data-halign="center" data-valign="middle" data-align="center" data-width="12%" class="fondoVerdeFuerte"> >36 meses</th>\
                                    <th data-field="TotalSubdominio" data-halign="center" data-valign="middle" data-align="center" data-width="12%">Instancias <br/>Data Center BCP</th>\
                                </tr>\
                            </thead>\
                            <tbody></tbody>\
                        </table>', row.Orden);

    return html;
}

function listarRegistrosDetalle(orden, subdominio, $tableDetalle, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableDetalle.bootstrapTable('destroy');
    $tableDetalle.bootstrapTable({
        url: URL_API_VISTA + "/Instancias/Equipos",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Orden',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.TipoEquipoFiltro = CaseIsNullSendExport($("#cbTipoEquipo").val());
            DATA_EXPORTAR.SubsidiariaFiltro = CaseIsNullSendExport($("#cbSubsidiaria").val());
            DATA_EXPORTAR.AppsId = $("#cbRelacionApps").val();
            DATA_EXPORTAR.Orden = orden;
            DATA_EXPORTAR.Subdominio = subdominio;
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

function listarDetalleAplicacion($md, orden, subdominio, tecnologia) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblDetalle.bootstrapTable('destroy');
    $tblDetalle.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Instancias/Aplicaciones",
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
            DATA_EXPORTAR.TipoEquipoFiltro = CaseIsNullSendExport($("#cbTipoEquipo").val());
            DATA_EXPORTAR.SubsidiariaFiltro = CaseIsNullSendExport($("#cbSubsidiaria").val());
            DATA_EXPORTAR.AppsId = $("#cbRelacionApps").val();
            DATA_EXPORTAR.Orden = orden;
            DATA_EXPORTAR.Subdominio = subdominio;
            DATA_EXPORTAR.Tecnologia = tecnologia;
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