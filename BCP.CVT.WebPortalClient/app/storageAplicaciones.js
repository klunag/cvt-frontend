var URL_API_VISTA = URL_API + "/Dashboard/Storage";
var $table = $("#tblRegistro");
var TIPO_EQUIPO = { SERVIDOR: 1, SERVIDOR_AGENCIA: 2, PC: 3, SERVICIO_NUBE: 4, STORAGE: 5, APPLIANCE: 6 };

$(function () {
    $table.bootstrapTable();
    cargarCombos();
    initFecha();
    InitAutocompletarBuilder($("#txtEquipo"), null, ".equipoContainer", `/Dashboard/Equipo/GetEquipoByFiltro?filtro={0}&idTipoEquipo=${TIPO_EQUIPO.SERVIDOR}`);
    InitAutocompletarBuilder($("#txtStorage"), null, ".storageContainer", `/Dashboard/Equipo/GetEquipoByFiltro?filtro={0}&idTipoEquipo=${TIPO_EQUIPO.STORAGE}`)
    InitAutocompletarBuilder($("#txtAplicacion"), $("#hdAplicacionId"), ".appContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    setDefaultHd($("#txtAplicacion"), $("#hdAplicacionId"));

    MethodValidarFecha(RANGO_DIAS_HABILES);
    ValidarFiltros();
    listarRegistros();
});

function cargarCombos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Ambiente, $("#ddlAmbiente"), TEXTO_SELECCIONE);
                    //SetItemsMultiple(dataObject.JefeEquipo, $("#txtJefeEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            waitingDialog.hide();
        },
        async: false
    });
}

function initFecha() {
    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    _BuildDatepicker($("#FechaFiltro"));
}

function Buscar() {
    listarRegistros();
}

function listarRegistros() {
    if ($("#formFiltros").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $("#divResultado").show();
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA + "/Listado/Aplicaciones",
            method: 'POST',
            pagination: true,
            sidePagination: 'server',
            queryParamsType: 'else',
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            sortName: 'CodigoAPT',
            sortOrder: 'asc',
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.Aplicacion = $("#hdAplicacionId").val() !== "0" ? $("#hdAplicacionId").val() : $.trim($("#txtAplicacion").val());
                DATA_EXPORTAR.Ambiente = $("#ddlAmbiente").val();
                DATA_EXPORTAR.Equipo = $("#txtEquipo").val();
                DATA_EXPORTAR.Storage = $("#txtStorage").val();
                DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());
                DATA_EXPORTAR.SoftwareBase = $("#txtSoftwareBase").val();
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
            onResetView: function () {

            }
        });
    }
}

function ExportarInfo() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Aplicacion = $("#txtAplicacion").val();
    DATA_EXPORTAR.Ambiente = $("#ddlAmbiente").val();
    DATA_EXPORTAR.Equipo = $("#txtEquipo").val();
    DATA_EXPORTAR.Storage = $("#txtStorage").val();
    DATA_EXPORTAR.Fecha = castDate($("#FechaFiltro").val());
    DATA_EXPORTAR.SoftwareBase = $("#txtSoftwareBase").val();

    let url = `${URL_API_VISTA}/Listado/Aplicaciones/Exportar?aplicacion=${DATA_EXPORTAR.Aplicacion}&equipo=${DATA_EXPORTAR.Equipo}&storage=${DATA_EXPORTAR.Storage}&fecha=${DATA_EXPORTAR.Fecha}&softwareBase=${DATA_EXPORTAR.SoftwareBase}&ambiente=${DATA_EXPORTAR.Ambiente}`;
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
