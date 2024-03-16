var URL_API_VISTA = URL_API + "/Storage";
var $table = $("#tblRegistro");
var $tableDetalle = $("#tblRegistrosDetalle");
var TIPO_EQUIPO = { SERVIDOR: 1, SERVIDOR_AGENCIA: 2, PC: 3, SERVICIO_NUBE: 4, STORAGE: 5, APPLIANCE: 6 };
var TITULO_MENSAJE = "Site de gestión de tecnologías y obsolescencia (CVT)";

$(function () {
    $table.bootstrapTable();    
    listarRegistros();
});

function Buscar() {
    listarRegistros();
}

function listarRegistros() {
    if ($("#formFiltros").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });        
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA + "/Backup/Mainframe",
            method: 'POST',
            pagination: true,
            sidePagination: 'server',
            queryParamsType: 'else',
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            sortName: 'instances',
            sortOrder: 'desc',
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.app = $("#txtCodigoAPT").val();
                DATA_EXPORTAR.jobname = $("#txtJob").val();
                DATA_EXPORTAR.interfaceApp = $("#txtInterface").val();
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
            },
            onExpandRow: function (index, row, $detail) {
                let data = ListarRegistrosDetalle(row.jobname);                
                if (data.length > 0) {                    
                    $('#tblRegistrosDetalle_' + row.jobname).bootstrapTable("destroy");
                    $('#tblRegistrosDetalle_' + row.jobname).bootstrapTable({
                        data: data
                    });

                    $('#tblRegistrosDetalle_' + row.jobname).bootstrapTable("hideLoading");
                } else $detail.empty().append("No existe registros");
            }
        });
    }
}

function ExportarInfo() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.jobname = $("#txtJob").val();
    DATA_EXPORTAR.app = $("#txtCodigoAPT").val();
    DATA_EXPORTAR.interfaceApp = $("#txtInterface").val();

    if (DATA_EXPORTAR.jobname != '' || DATA_EXPORTAR.app != '' || DATA_EXPORTAR.interfaceApp !='') {
        let url = `${URL_API_VISTA}/Backup/Mainframe/Exportar?jobname=${DATA_EXPORTAR.jobname}&app=${DATA_EXPORTAR.app}&interfaceapp=${DATA_EXPORTAR.interfaceApp}`;
        window.location.href = url;
    }
    else
        toastr.info("Es necesario que al menos se ingrese un filtro", TITULO_MENSAJE);
}

function listarRegistrosDetalle(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Backup/Mainframe/Detalle",
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
            DATA_EXPORTAR.jobname = id;
            DATA_EXPORTAR.app = $("#txtCodigoAPT").val();
            DATA_EXPORTAR.interfaceApp = '';
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

function linkFormatter(value, row) {
    return `<a href="javascript:ViewDetails('${value}')" title="Mostrar detalle">${value}</a>`;
}

function totalFormatter(value, row) {
    var total = 0;
    total = value;
    var num = total.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    return num;

    return '';
};

function ViewDetails(jobname) {
    listarRegistrosDetalle(jobname, $tableDetalle, null);

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