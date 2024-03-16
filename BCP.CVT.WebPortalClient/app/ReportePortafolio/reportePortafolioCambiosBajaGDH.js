var URL_API_VISTA = URL_API + "/reportesportfolio";
var parameters, $table = $("#tblRegistro");
var ObjFilter = {};
var parameters = { matricula: "", IdAplicacion: "", tipoCambio: "", fechaInicio: "", fechaFin: ""};
var TITULO_MENSAJE = "Reporte de Cambios Bajas Responsables GDH";

var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "applicationId";
var ULTIMO_SORT_ORDER = "asc";
var ULTIMO_REGISTRO_PAGINACION = 100;

const arrMultiSelect = [
    { SelectId: "#cbFiltroGestionadoPor", DataField: "ClasificacionTecnica" },
];

$(function () {
    initEvents();
    validarReporteFiltros();
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    CargarCombos();
    initFecha();

    InitAutocompletarBuilder($("#txtAplicacionFiltro"), $("#hdAplicacionFiltroId"), ".containerAplicacion", "/applicationportfolio/application/filter?filtro={0}&codigoAPT=");
    setDefaultHd($("#txtAplicacionFiltro"), $("#hdAplicacionFiltroId"));

    $("#txtAplicacionFiltro").keypress(function (event) {
        if (event.keyCode === 13) {
            $("#btnBuscar").click();
            event.preventDefault();
        }
    });

    $("#btnExportar").click(ExportarInfo);
});

function initFecha() {
    $("#divFechaFiltroDesde, #divFechaFiltroHasta").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#FechaFiltroDesde, #FechaFiltroHasta").val("");
}

function initEvents() {
    $("#btnBuscar").click(function () { GenerarReporte() });
}

function CargarCombos() {
    let obj = [
        { Id: '1', Descripcion: 'UNIDAD', Value: '1' },
        { Id: '2', Descripcion: 'PUESTO', Value: '2' },
        { Id: '3', Descripcion: 'DE_BAJA', Value: '3' }
    ]
    SetItems(obj.filter(x => x !== "" && x !== null), $("#cbFiltroTimpoCambio"), TEXTO_SELECCIONE);
}

function GenerarReporte() {
    ListarRegistros(true);
}

function ListarRegistros(flgChange = false) {
    if ($("#formFiltros").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

        let fechaDesde = $("#FechaFiltroDesde").val() ? moment(dateFromString($("#FechaFiltroDesde").val())).format("YYYYMMDD") : moment(new Date()).format("YYYYMMDD");
        let fechaHasta = $("#FechaFiltroHasta").val() ? moment(dateFromString($("#FechaFiltroHasta").val())).format("YYYYMMDD") : moment(new Date()).format("YYYYMMDD");

        //parameters.matricula = '-1';
        //parameters.IdAplicacion = $("#hdAplicacionFiltroId").val() !== '' ? $("#hdAplicacionFiltroId").val() : '-1';
        //parameters.tipoCambio = CaseIsNullSendExport($("#cbFiltroTimpoCambio").val());
        //parameters.fechaInicio = fechaDesde;
        //parameters.fechaFin = fechaHasta;

        if (!flgChange) flgChange = (parameters == obj);

        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA + "/reporte/CambioBajaResponsablesGDH",
            method: 'POST',
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pagination: true,
            sidePagination: "server",
            queryParamsType: "else",
            sortName: "Codigo",
            sortOrder: "asc",
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            queryParams: function (p) {

                reporte = {};
                reporte.pageNumber = p.pageNumber;
                reporte.pageSize = p.pageSize;
                reporte.sortName = p.sortName;
                reporte.sortOrder = p.sortOrder;

                reporte.matricula = '-1';//(CaseIsNullSendExport($("#txtAplicacionFiltro").val()) == "") ? '-1' : CaseIsNullSendExport($("#txtAplicacionFiltro").val());
                reporte.IdAplicacion = ($("#hdAplicacionFiltroId").val() == '' || $("#hdAplicacionFiltroId").val() == '0') ? '-1' : $("#hdAplicacionFiltroId").val();
                reporte.tipoCambio = (CaseIsNullSendExport($("#cbFiltroTimpoCambio").val()) == null) ? '-1' : CaseIsNullSendExport($("#cbFiltroTimpoCambio").val());
                reporte.fechaInicio = fechaDesde;
                reporte.fechaFin = fechaHasta;
                
                reporte.FlgChange = flgChange;



                return JSON.stringify(reporte);
            },
            responseHandler: function (res) {
                var data = CargarReporte(res, flgChange);
                return data;
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

function CargarReporte(dataReport, flgChange) {
    if (flgChange) {
    }
    waitingDialog.hide();
    $("#tableAplicaciones").show();
    return { rows: dataReport.cambioResponsablesGDH.Rows, total: dataReport.cambioResponsablesGDH.Total };
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.fechaInicio = $("#FechaFiltroDesde").val() ? moment(dateFromString($("#FechaFiltroDesde").val())).format("YYYYMMDD") : moment(new Date()).format("YYYYMMDD");
    DATA_EXPORTAR.fechaFin = $("#FechaFiltroHasta").val() ? moment(dateFromString($("#FechaFiltroHasta").val())).format("YYYYMMDD") : moment(new Date()).format("YYYYMMDD");
    DATA_EXPORTAR.IdAplicacion = ($("#hdAplicacionFiltroId").val() == '' || $("#hdAplicacionFiltroId").val() == '0') ? '-1' : $("#hdAplicacionFiltroId").val();
    DATA_EXPORTAR.matricula = '-1';//(CaseIsNullSendExport($("#txtAplicacionFiltro").val()) == "") ? '-1' : CaseIsNullSendExport($("#txtAplicacionFiltro").val());
    DATA_EXPORTAR.tipoCambio = (CaseIsNullSendExport($("#cbFiltroTimpoCambio").val()) == null) ? '-1' : CaseIsNullSendExport($("#cbFiltroTimpoCambio").val());
    let url = `${URL_API_VISTA}/reporte/CambioBajaResponsablesGDH/portafolio/exportar?fechaInicio=${DATA_EXPORTAR.fechaInicio}&fechaFin=${DATA_EXPORTAR.fechaFin}&IdAplicacion=${DATA_EXPORTAR.IdAplicacion}&matricula=${DATA_EXPORTAR.matricula}&tipoCambio=${DATA_EXPORTAR.tipoCambio}`;
    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/octetstream",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            let bytes = Base64ToBytes(data.data);
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


function validarReporteFiltros() {

    $.validator.methods.ValidMaxDate = function (value, element) {
        let fechaMin = $("#FechaFiltroDesde").val();
        if (fechaMin) {
            fechaMin = dateFromString(fechaMin);
            let fechaMax = dateFromString(value);
            return fechaMin <= fechaMax;
        }
        return true;
    };

    $.validator.methods.ValidMinDate = function (value, element) {
        let fechaMax = $("#FechaFiltroHasta").val();
        if (fechaMax) {
            fechaMax = dateFromString(fechaMax);
            let fechaMin = dateFromString(value);
            return fechaMin <= fechaMax;
        }
        return true;
    };

    $.validator.methods.ValidDate = function (value, element) {
        try {
            let fecha = dateFromString(value);
            let fechaMinima = new Date();
            fechaMinima.setFullYear(fechaMinima.getFullYear() - 1000);
            return fechaMinima <= fecha;
        }
        catch (ex) {
            return false;
        }
    };

    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {

            FechaFiltroDesde: {
                required: true,
                ValidDate: true,
                ValidMinDate: true
            },
            FechaFiltroHasta: {
                required: true,
                ValidDate: true,
                ValidMaxDate: true
            },

        },
        messages: {

            FechaFiltroDesde: {
                required: "Debe seleccionar una fecha",
                ValidDate: "Debe seleccionar una fecha Valida",
                ValidMinDate: "Debe ingresar una fecha menor a la fecha hasta"
            },
            FechaFiltroHasta: {
                required: "Debe seleccionar una fecha",
                ValidDate: "Debe seleccionar una Fecha Valida",
                ValidMaxDate: "Debe ingresar una fecha mayor a la fecha desde"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "FechaFiltroDesde" || element.attr('name') === "FechaFiltroHasta") {
                element.parent().parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function LabelCustomFormatter(bullet) {
    bullet.label.adapter.add("textOutput", function (text, target) {
        if (target.dataItem && target.dataItem.valueY == 0) {
            return "";
        }
        return text;
    });
}