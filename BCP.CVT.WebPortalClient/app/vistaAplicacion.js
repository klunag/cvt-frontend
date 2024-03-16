var $table = $("#tblRegistro");

var $tblServidoresRelacionados = $("#tbl-servidoresRelacionadas");
var $tblAplicacionTecnologias = $("#tbl-aplicacionTecnologias");
var $tblAplicacionExperto = $("#tbl-aplicacionExpertos");

var URL_API_VISTA = URL_API + "/Aplicacion";
const arrMultiSelect = [
    { SelectId: "#cbFiltroGerencia", DataField: "Gerencia" },
    { SelectId: "#cbFiltroDivision", DataField: "Division" },
    { SelectId: "#cbFiltroUnidad", DataField: "Unidad" },
    { SelectId: "#cbFiltroArea", DataField: "Area" },
    { SelectId: "#cbFiltroEstado", DataField: "Estado" },
    { SelectId: "#ddlPCI", DataField: "TipoPCI" }
];
$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));

    $table.bootstrapTable("destroy");
    $table.bootstrapTable({ data: [] });

    $tblAplicacionExperto.bootstrapTable({ data: [] });
    $tblServidoresRelacionados.bootstrapTable({ data: [] });
    $tblAplicacionTecnologias.bootstrapTable({ data: [] });

    InitAutocompletarBuilder($("#txtLiderTribu"), null, ".tribuContainer", "/Aplicacion/GetJefeEquipoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtProduct"), null, ".usuarioContainer", "/Aplicacion/GetOwnerByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtAplicacion"), $("#hAplicacion"), ".appContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");

    CargarCombos();
    
    if (codigoAplicacion.length > 0) {
        $("#txtAplicacion").val(codigoAplicacion);
        $("#hAplicacion").val("0");
        ListarRegistros();
    } else {

        ListarRegistros();
        setDefaultHd($("#txtAplicacion"), $("#hAplicacion"));
    }

});
function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItems(dataObject.Criticidad, $("#cbFiltroCriticidad"), TEXTO_SELECCIONE);

                    //SetItems(dataObject.Gerencia, $("#cbFiltroGerencia"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Division, $("#cbFiltroDivision"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Unidad, $("#cbFiltroUnidad"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Area, $("#cbFiltroArea"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Estado, $("#cbFiltroEstado"), TEXTO_SELECCIONE);
                    SetDataToSelectMultiple(arrMultiSelect, dataObject);
                    //SetItems(dataObject.TipoPCI, $("#ddlPCI"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}
function ListarRegistros() {

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado/Vista",
        method: "POST",
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: "server",
        queryParamsType: "else",
        sortName: "CodigoAPT",
        sortOrder: "asc",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtFiltro").val());
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            //DATA_EXPORTAR.CriticidadId = $("#cbFiltroCriticidad").val() == "-1" ? null : $("#cbFiltroCriticidad").val();
            DATA_EXPORTAR.Gerencias = CaseIsNullSendFilter($("#cbFiltroGerencia").val());//$("#cbFiltroGerencia").val() === "-1" ? null : $("#cbFiltroGerencia").val();
            DATA_EXPORTAR.Divisiones = CaseIsNullSendFilter($("#cbFiltroDivision").val());//$("#cbFiltroDivision").val() === "-1" ? null : $("#cbFiltroDivision").val();
            DATA_EXPORTAR.Unidades = CaseIsNullSendFilter($("#cbFiltroUnidad").val());//$("#cbFiltroUnidad").val() === "-1" ? null : $("#cbFiltroUnidad").val();
            DATA_EXPORTAR.Areas = CaseIsNullSendFilter($("#cbFiltroArea").val());//$("#cbFiltroArea").val() === "-1" ? null : $("#cbFiltroArea").val();
            DATA_EXPORTAR.Estados = CaseIsNullSendFilter($("#cbFiltroEstado").val());//$("#cbFiltroEstado").val() === "-1" ? null : $("#cbFiltroEstado").val();
            DATA_EXPORTAR.PCIS = CaseIsNullSendFilter($("#ddlPCI").val());
            DATA_EXPORTAR.JefeEquipo = $("#txtLiderTribu").val();
            DATA_EXPORTAR.Owner = $("#txtProduct").val();
            DATA_EXPORTAR.Aplicacion = $("#hAplicacion").val() !== "0" ? $("#hAplicacion").val() : $("#txtAplicacion").val();

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            var total = data.Total;
            if (total == 0 && FLAG_ADMIN != 1)
                bootbox.alert("Su usuario no está autorizado a la aplicación o equipo que intentas consultar. Comuníquese con el Jefe de Equipo/Experto de la aplicación que necesitas consultar para que te brinde el acceso correspondiente, solo es necesario compartir tu matrícula para que pueda autorizar el acceso correspondiente.");

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

function linkFormatterName(value, row, index) {
    if (FLAG_DETALLE == 1)
        return `<a href="DetalleAplicacion?id=${row.CodigoAPT}" title="Ver detalle de la aplicación" target="_blank">${value}</a>`;
    else
        return value;
}
function EditRegistro(codigoAPT) {
    $.ajax({
        url: URL_API_VISTA + "/GetAplicacionDetalle?codigoAPT=" + codigoAPT,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        dataType: "json",
        success: function (result) {
            if (result !== null) {
                $("#hdId").val(result.Id);
                $("#txtCodApp").val(result.CodigoAPT);
                $("#txtNombre").val(result.Nombre);
                $("#txtCriticidad").val(result.CriticidadToString);
                $("#txtGestionadoPor").val(result.GestionadoPor);
                $("#txtRoadMap").val(result.RoadMapToString);
            }
            $(".view-listado").hide();
            $(".view-detalle").show();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            ListarServidoresRelacionados();
            ListarAplicacionTecnologia();
            ListarAplicacionExperto();
        }
    });
}
function RefrescarListado() {
    //let filtro = $("#txtFiltro").val();
    //$("#hdFiltro").val(filtro);
    //$table.bootstrapTable("refresh");
    ListarRegistros();
}
function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar("Aplicación");
        return false;
    }

    DATA_EXPORTAR.Gerencias = CaseIsNullSendExport(DATA_EXPORTAR.Gerencias);
    DATA_EXPORTAR.Divisiones = CaseIsNullSendExport(DATA_EXPORTAR.Divisiones);
    DATA_EXPORTAR.Unidades = CaseIsNullSendExport(DATA_EXPORTAR.Unidades);
    DATA_EXPORTAR.Areas = CaseIsNullSendExport(DATA_EXPORTAR.Areas);
    DATA_EXPORTAR.Estados = CaseIsNullSendExport(DATA_EXPORTAR.Estados);
    DATA_EXPORTAR.PCIS = CaseIsNullSendExport(DATA_EXPORTAR.PCIS);

    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre == null ? '' : DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&criticidadId=${DATA_EXPORTAR.CriticidadId}&gerencia=${DATA_EXPORTAR.Gerencia == null ? '' : DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division == null ? '' : DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad == null ? '' : DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area == null ? '' : DATA_EXPORTAR.Area}`;
    let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&gerencia=${DATA_EXPORTAR.Gerencias}&division=${DATA_EXPORTAR.Divisiones}&unidad=${DATA_EXPORTAR.Unidades}&area=${DATA_EXPORTAR.Areas}&estado=${DATA_EXPORTAR.Estados}&aplicacion=${DATA_EXPORTAR.Aplicacion}&jefeequipo=${DATA_EXPORTAR.JefeEquipo}&owner=${DATA_EXPORTAR.Owner}&pci=${DATA_EXPORTAR.PCIS}`;
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
function LimpiarVistaDetalle() {
    $tblAplicacionExperto.bootstrapTable("destroy");
    $tblServidoresRelacionados.bootstrapTable("destroy");
    $tblAplicacionTecnologias.bootstrapTable("destroy");
    $tblAplicacionExperto.bootstrapTable({ data: [] });
    $tblServidoresRelacionados.bootstrapTable({ data: [] });
    $tblAplicacionTecnologias.bootstrapTable({ data: [] });
    $("#txtCodApp").val();
    $("#txtNombre").val();
    $("#txtCriticidad").val();
    $("#txtGestionadoPor").val();
    $("#txtRoadMap").val();
    $("#hdId").val();
    //$("#FechaFiltro").val(moment(new Date()).format("DD/MM/YYYY"));
}
function CerrarVistaDetalle() {
    $(".view-listado").show();
    $(".view-detalle").hide();
    LimpiarVistaDetalle();
}

function ListarServidoresRelacionadosAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Equipo/GetServidoresRelacionadosByCodigoAPT?codigoAPT=${tmp_params.codigoAPT}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res);
    }).fail(function () {
        params.success({ Rows: [], Total: 0 });
    });
}
function ListarAplicacionTecnologiaAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Tecnologia/GetTecnologiasXAplicacionByCodigoAPT?codigoAPT=${tmp_params.codigoAPT}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res);
    });
}
function ListarAplicacionExpertoAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Aplicacion/GetAplicacionExpertoByCodigoAPT?codigoAPT=${tmp_params.codigoAPT}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res);
    }).fail(function () {
        params.success({ Rows: [], Total: 0 });
    });
}

function ListarServidoresRelacionados() {
    $tblServidoresRelacionados.bootstrapTable('destroy');
    $tblServidoresRelacionados.bootstrapTable({
        ajax: "ListarServidoresRelacionadosAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "Nombre",
        sortOrder: "asc",
        queryParams: function (p) {
            return JSON.stringify({
                codigoAPT: $("#txtCodApp").val(),
                pageNumber: p.pageNumber,
                pageSize: p.pageSize,
                sortName: p.sortName,
                sortOrder: p.sortOrder
            });
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
function ListarAplicacionTecnologia() {
    $tblAplicacionTecnologias.bootstrapTable("destroy");
    $tblAplicacionTecnologias.bootstrapTable({
        ajax: "ListarAplicacionTecnologiaAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "ClaveTecnologia",
        sortOrder: "asc",
        queryParams: function (p) {
            return JSON.stringify({
                codigoAPT: $("#txtCodApp").val(),
                pageNumber: p.pageNumber,
                pageSize: p.pageSize,
                sortName: p.sortName,
                sortOrder: p.sortOrder
            });
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
function ListarAplicacionExperto() {
    $tblAplicacionExperto.bootstrapTable('destroy');
    $tblAplicacionExperto.bootstrapTable({
        ajax: "ListarAplicacionExpertoAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "Nombres",
        sortOrder: "asc",
        queryParams: function (p) {
            return JSON.stringify({
                codigoAPT: $("#txtCodApp").val(),
                pageNumber: p.pageNumber,
                pageSize: p.pageSize,
                sortName: p.sortName,
                sortOrder: p.sortOrder
            });
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

function semaforoFormatter(value, row, index) {
    var html = "";
    console.log(row.FlagObsoleto);
    if (!row.FlagObsoleto) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    return html;
}