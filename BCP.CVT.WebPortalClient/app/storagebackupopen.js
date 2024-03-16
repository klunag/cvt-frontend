var URL_API_VISTA = URL_API + "/Storage";
var $table = $("#tblRegistro");
var $tableDetalle = $("#tblRegistrosDetalle");
var $tableDetalleApps = $("#tblRegistrosDetalleApps");

$(function () {
    $table.bootstrapTable();
    initFecha();
    MethodValidarFecha(RANGO_DIAS_HABILES);
    ValidarFiltros();

    listarRegistros();
});

function Buscar() {
    listarRegistros();
}

function initFecha() {
    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    _BuildDatepicker($("#FechaFiltro"));
}

function listarRegistros() {
    if ($("#formFiltros").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA + "/Backup/Open",
            method: 'POST',
            pagination: true,
            sidePagination: 'server',
            queryParamsType: 'else',
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            sortName: 'total',
            sortOrder: 'desc',
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.codigoAPT = $("#txtAplicacion").val();
                DATA_EXPORTAR.server = $("#txtServidor").val();
                DATA_EXPORTAR.backupserver = $("#txtBackup").val();
                DATA_EXPORTAR.target = $("#txtTarget").val();
                DATA_EXPORTAR.levelbackup = $("#txtLevel").val();
                DATA_EXPORTAR.outcome = $("#txtResultado").val();
                DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());

                DATA_EXPORTAR.PageNumber = p.pageNumber;
                DATA_EXPORTAR.PageSize = p.pageSize;
                DATA_EXPORTAR.OrderBy = p.sortName;
                DATA_EXPORTAR.OrderByDirection = p.sortOrder;

                return JSON.stringify(DATA_EXPORTAR);
            },
            onLoadSuccess: function () {

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
}

function ExportarInfo() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.codigoAPT = $("#txtAplicacion").val();
    DATA_EXPORTAR.server = $("#txtServidor").val();
    DATA_EXPORTAR.backupserver = $("#txtBackup").val();
    DATA_EXPORTAR.target = $("#txtTarget").val();
    DATA_EXPORTAR.levelbackup = $("#txtLevel").val();
    DATA_EXPORTAR.outcome = $("#txtResultado").val();
    DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();

    let url = `${URL_API_VISTA}/Backup/Open/Exportar?aplicacion=${DATA_EXPORTAR.codigoAPT}&server=${DATA_EXPORTAR.server}&backupserver=${DATA_EXPORTAR.backupserver}&target=${DATA_EXPORTAR.target}&levelbackup=${DATA_EXPORTAR.levelbackup}&outcome=${DATA_EXPORTAR.outcome}&fecha=${DATA_EXPORTAR.Fecha}&`;
    window.location.href = url;
}

function listarRegistrosDetalle(id, group, day, month, year, $table) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Backup/Open/Detalle",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'crtdate',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.codigoAPT = $("#txtAplicacion").val();
            DATA_EXPORTAR.backupserver = $("#txtBackup").val();
            DATA_EXPORTAR.target = $("#txtTarget").val();
            DATA_EXPORTAR.levelbackup = $("#txtLevel").val();
            DATA_EXPORTAR.outcome = $("#txtResultado").val();
            DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());

            DATA_EXPORTAR.server = id;
            DATA_EXPORTAR.groupname = group;
            DATA_EXPORTAR.dayBackup = day;
            DATA_EXPORTAR.monthBackup = month;
            DATA_EXPORTAR.yearBackup = year;

            DATA_EXPORTAR.PageNumber = p.pageNumber;
            DATA_EXPORTAR.PageSize = p.pageSize;
            DATA_EXPORTAR.OrderBy = p.sortName;
            DATA_EXPORTAR.OrderByDirection = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        onLoadSuccess: function (status, res) {
            OpenModal();
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
    });
}

function listarRegistrosDetalleApps(server, $table) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Backup/Open/Aplicaciones",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'crtdate',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());
            DATA_EXPORTAR.server = server;

            DATA_EXPORTAR.PageNumber = p.pageNumber;
            DATA_EXPORTAR.PageSize = p.pageSize;
            DATA_EXPORTAR.OrderBy = p.sortName;
            DATA_EXPORTAR.OrderByDirection = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        onLoadSuccess: function (status, res) {
            OpenModalApps();
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
    });
}

function linkFormatter(value, row) {
    return `<a href="javascript:ViewDetails('${value}','${row.groupname}','${row.dayBackup}','${row.monthBackup}','${row.yearBackup}')" title="Mostrar detalle">${value}</a>`;
}

function linkAppsFormatter(value, row) {
    return `<a href="javascript:ViewDetailsApps('${row.serverName}')" title="Mostrar aplicaciones">${value}</a>`;
}

function ViewDetails(server, group, day, month, year) {
    listarRegistrosDetalle(server, group, day, month, year, $tableDetalle);

}

function ViewDetailsApps(server) {
    listarRegistrosDetalleApps(server, $tableDetalleApps);

}
//Detalle
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
//Apps
function LimpiarMdAddOrEditRegistroApps() {
    $tableDetalleApps.bootstrapTable();
    $tableDetalleApps.bootstrapTable({ data: [] });
}
function OpenModalApps() {
    MdAddOrEditRegistroApps(true);
}
function MdAddOrEditRegistroApps(EstadoMd) {
    LimpiarMdAddOrEditRegistroApps();
    if (EstadoMd)
        $("#MdAddOrEditModalApps").modal(opcionesModal);
    else
        $("#MdAddOrEditModalApps").modal("hide");
}

function semaforoFormatter(value, row, index) {
    var html = "";
    if (row.kpi === 1) { //VERDE
        html = `<button type="button" class="btn btn-success btn-circle" title="'${value}'"></button>`;
    } else if (row.kpi === -1) { //ROJO
        html = `<button type="button" class="btn btn-danger btn-circle" title="'${value}"></button>`;
    }
    else {
        html = `<button type="button" class="btn btn-warning btn-circle" title="'${value}'"></button>`;
    }
    return html;
}

function ValidarFiltros() {

    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            FechaFiltro: {
                required: true,
                isDate: true,
                FechaPrevia: true,
                FechaMaxima: true
            }
        },
        messages: {
            FechaFiltro: {
                required: "Debe seleccionar una fecha",
                isDate: "Debe ingresar una fecha valida",
                FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "FechaFiltro") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}
