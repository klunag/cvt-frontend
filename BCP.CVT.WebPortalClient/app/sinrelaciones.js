var URL_API_VISTA = URL_API + "/Dashboard";
var URL_API_EQUIPO = URL_API + "/Equipo";
var $table = $("#tblRegistro");
var DATA_EXPORTAR = {};
$(function () {
    SetItemsMultiple([], $("#ddlTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
    getTipos($("#ddlTipoEquipo"));
    initFecha();

    MethodValidarFecha(RANGO_DIAS_HABILES);
    ValidarFiltros();

    if (FLAG_ADMIN == 1)
        listarRegistros();

    InitAutocompletarBuilder($("#txtEquipo"), null, ".containerFiltroEquipo", "/Equipo/GetEquipoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtSO"), null, ".containerFiltroSO", "/Equipo/GetSOByFiltro?filtro={0}");
});

function RefrescarListado() {
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

function getTipos(CbDom) {
    var $tipos = CbDom;

    //$tipos.append($('<option></option')
    //    .attr('value', '0')
    //    .text('Todos'));

    $.ajax({
        url: URL_API_VISTA + '/Tecnologia/ListarCombos',
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            var data = result;

            SetItemsMultiple(data.TipoEquipo, $("#ddlTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
        },
        complete: function () {

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function listarRegistros() {
    $("#formFiltros").validate().resetForm();
    if ($("#formFiltros").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA + "/Reportes/SinRelaciones",
            method: 'POST',
            pagination: true,
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            sidePagination: 'server',
            queryParamsType: 'else',
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            sortName: 'Equipo',
            sortOrder: 'asc',
            fixedColumns: true,
            fixedNumber: 4,
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.Equipo = $("#txtEquipo").val();
                DATA_EXPORTAR.TipoEquipoFiltrar = $("#ddlTipoEquipo").val();
                DATA_EXPORTAR.SistemaOperativo = $("#txtSO").val();
                DATA_EXPORTAR.FechaConsulta = castDate($("#FechaFiltro").val());
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
}

function ExportarInfo() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Equipo = $("#txtEquipo").val();
    DATA_EXPORTAR.TipoEquipoFiltrar = $("#ddlTipoEquipo").val() ?? "";
    DATA_EXPORTAR.SistemaOperativo = $("#txtSO").val();
    DATA_EXPORTAR.FechaConsulta = castDate($("#FechaFiltro").val());
    DATA_EXPORTAR.sortName = 'Equipo';
    DATA_EXPORTAR.sortOrder = 'ASC';

    let url = `${URL_API_EQUIPO}/ExportarReporteSinRelaciones?equipo=${DATA_EXPORTAR.Equipo}&tipoEquipoFiltrar=${DATA_EXPORTAR.TipoEquipoFiltrar}&so=${DATA_EXPORTAR.SistemaOperativo}&fechaConsulta=${DATA_EXPORTAR.FechaConsulta}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function linkFormatterEquipo(value, row, index) {
    if (row.EquipoId > 0)
        return `<a href="/Vista/DetalleEquipo?id=${row.EquipoId}" title="Ver detalle del equipo" target="_blank">${value}</a>`;
    else
        return '-';
}

function linkFormatterTecnologia(value, row, index) {
    if (row.TecnologiaId > 0)
        return `<a href="TecnologiaEquipo/${row.TecnologiaId}" title="Ver detalle de la tecnología" target="_blank">${value}</a>`;
    else
        return '-';
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
            if (element.attr('name') === "txtFilFecha") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}
