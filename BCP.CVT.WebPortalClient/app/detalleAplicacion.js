var $tblServidoresRelacionados = $("#tbl-servidoresRelacionadas");
var $tblCertificadosDigitalesRelacionados = $("#tbl-aplicacionCD");
var $tblApisRelacionadas = $("#tbl-apisRelacionadas");
var $tblAplicacionTecnologias = $("#tbl-aplicacionTecnologias");
var $tblAplicacionExperto = $("#tbl-aplicacionExpertos");
var $tblClientSecretsRelacionadas = $("#tbl-aplicacionClientSecret");
var TITULO_MENSAJE = "Detalle por aplicación";

var URL_API_VISTA = URL_API + "/Aplicacion";
$(function () {
    $tblAplicacionExperto.bootstrapTable({ data: [] });
    $tblServidoresRelacionados.bootstrapTable({ data: [] });
    $tblCertificadosDigitalesRelacionados.bootstrapTable({ data: [] });
    $tblApisRelacionadas.bootstrapTable({ data: [] });
    $tblAplicacionTecnologias.bootstrapTable({ data: [] });
    $tblClientSecretsRelacionadas.bootstrapTable({ data: [] });
    if (CODIGOAPT !== "") {
        EditRegistro(CODIGOAPT);
    }
});
function EditRegistro(codigoAPT) {
    $.ajax({
        url: URL_API_VISTA + "/GetAplicacionDetalle?codigoAPT=" + codigoAPT,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            if (result !== null) {
                $("#hdId").val(result.Id);
                $("#txtCodApp").val(result.CodigoAPT);
                $("#txtNombre").val(result.Nombre);
                $("#txtCriticidad").val(result.CriticidadToString);
                $("#txtGestionadoPor").val(result.GestionadoPor);
                $("#txtRoadMap").val(result.RoadMapToString);
                $("#txtEstado").val(result.EstadoAplicacion);
                $("#txtKPIObsolescencia").val(result.KPIObsolescencia.toFixed(2) + '%');

                $("#txtKPIObsolescenciaReal").val(result.KPIObsolescenciaReal.toFixed(2) + '%');
                $("#txtKPIObsolescenciaProyeccion1").val(result.KPIObsolescenciaProyeccion1.toFixed(2) + '%');
                $("#txtKPIObsolescenciaProyeccion2").val(result.KPIObsolescenciaProyeccion2.toFixed(2) + '%');
                $("#txtPCI").val(result.ListaPCI);

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            ListarServidoresRelacionados();
            ListarCertificadosDigitalesRelacionados();
            ListarApisRelacionadas();
            ListarAplicacionTecnologia();
            ListarAplicacionExperto();
            ListarClientSecretsRelacionadas();
        }
    });
}
function ListarServidoresRelacionadosAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Equipo/GetServidoresRelacionadosByCodigoAPT?codigoAPT=${CODIGOAPT}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
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
function ListarCertificadosDigitalesRelacionadosAjax(params) {

    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Equipo/GetCertificadosDigitalesRelacionadosByCodigoAPT?codigoAPT=${CODIGOAPT}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res);
    }).fail(function () {
        params.success({ Rows: [], Total: 0 });
        debugger;
    });
}
function ListarClientSecretsRelacionadasAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Equipo/GetClientSecretsRelacionadasByCodigoAPT?codigoAPT=${CODIGOAPT}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}`;
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
function ListarApisRelacionadasAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Equipo/GetApisRelacionadasByCodigoAPT?codigoAPT=${CODIGOAPT}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
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
    let url = URL_API + `/Tecnologia/GetTecnologiasXAplicacionByCodigoAPT?codigoAPT=${CODIGOAPT}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res)
    });
}
function ListarAplicacionExpertoAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Aplicacion/GetAplicacionExpertoByCodigoAPT?codigoAPT=${CODIGOAPT}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
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
function ListarCertificadosDigitalesRelacionados() {
    $tblCertificadosDigitalesRelacionados.bootstrapTable('destroy');
    $tblCertificadosDigitalesRelacionados.bootstrapTable({
        ajax: "ListarCertificadosDigitalesRelacionadosAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            return JSON.stringify({
                codigoAPT: $("#txtCodApp").val(),
                pageNumber: p.pageNumber,
                pageSize: p.pageSize,
            });
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            $("#cabMesesProyeccion1v2").html(data.Proyeccion1Meses);
            $("#cabMesesProyeccion2v2").html(data.Proyeccion2Meses);
            return { rows: data.CertificadosDigitales.Rows, total: data.CertificadosDigitales.Total };
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
function ListarClientSecretsRelacionadas() {
    $tblClientSecretsRelacionadas.bootstrapTable('destroy');
    $tblClientSecretsRelacionadas.bootstrapTable({
        ajax: "ListarClientSecretsRelacionadasAjax",
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
                pageSize: p.pageSize
            });
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            $("#cabMesesProyeccion1v3").html(data.Proyeccion1Meses);
            $("#cabMesesProyeccion2v3").html(data.Proyeccion2Meses);
            return { rows: data.ClientSecrets.Rows, total: data.ClientSecrets.Total };
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
function ListarApisRelacionadas() {
    $tblApisRelacionadas.bootstrapTable('destroy');
    $tblApisRelacionadas.bootstrapTable({
        ajax: "ListarApisRelacionadasAjax",
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
            $("#cabMesesProyeccion1").html(data.Proyeccion1Meses);
            $("#cabMesesProyeccion2").html(data.Proyeccion2Meses);
            $("#lblKPIObsolescenciaProyeccion1").html(String.Format("Proyeccón a {0} meses", data.Proyeccion1Meses));
            $("#lblKPIObsolescenciaProyeccion2").html(String.Format("Proyeccón a {0} meses", data.Proyeccion2Meses));

            return { rows: data.Tecnologias.Rows, total: data.Tecnologias.Total };
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

function EquipoLink(value, row) {
    if (FLAG_ADMIN == 1)
        return `<a href="/Vista/DetalleEquipo?Id=${row.Id}"  target="_blank"  title="Ver información">${value}</a>`;
    else
        return value;
}


function ClaveTecnologiaLink(value, row) {
    if (FLAG_ADMIN === 1)
        return `<a href="/Dashboard/TecnologiaEquipo/${row.Id}"  target="_blank"  title="Ver información">${value}</a>`;
    else
        return value;
}


function formatterEstadoObs(value) {
    var html = '<button type="button" class="btn btn-{0} btn-circle btn-circle-sm" style="cursor: inherit"></button>';

    if (value > 0) {
        html = String.Format(html, "danger");
    } else {
        html = String.Format(html, "success");
    }
    return html;
}

function semaforoFormatter(value, row, index) {
    var html = "";
    if (row.IndicadorObsolescencia === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.IndicadorObsolescencia === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function semaforoIndice1Formatter(value, row, index) {
    var html = "";
    if (row.IndicadorObsolescencia_Proyeccion1 === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.IndicadorObsolescencia_Proyeccion1 === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function semaforoIndice2Formatter(value, row, index) {
    var html = "";
    if (row.IndicadorObsolescencia_Proyeccion2 === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.IndicadorObsolescencia_Proyeccion2 === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}


function ExportarServidoresRelacionados() {
    let _data = $tblServidoresRelacionados.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let codigoAPT = $("#txtCodApp").val();
    let sortOrder = $tblServidoresRelacionados.bootstrapTable('getOptions').sortOrder;
    let sortName = $tblServidoresRelacionados.bootstrapTable('getOptions').sortName;

    let url = URL_API + `/Equipo/ExportarServidoresRelacionadosByCodigoAPT?codigoAPT=${codigoAPT}&sortName=${sortName}&sortOrder=${sortOrder}`;
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

function ExportarApisRelacionadas() {
    let _data = $tblApisRelacionadas.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let codigoAPT = $("#txtCodApp").val();
    let sortOrder = $tblServidoresRelacionados.bootstrapTable('getOptions').sortOrder;
    let sortName = $tblServidoresRelacionados.bootstrapTable('getOptions').sortName;

    let url = URL_API + `/Equipo/ExportarApisRelacionadasByCodigoAPT?codigoAPT=${codigoAPT}&sortName=${sortName}&sortOrder=${sortOrder}`;
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

function ExportarTecnologiasRelacionadas() {
    let _data = $tblAplicacionTecnologias.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let codigoAPT = $("#txtCodApp").val();
    let sortOrder = $tblAplicacionTecnologias.bootstrapTable('getOptions').sortOrder;
    let sortName = $tblAplicacionTecnologias.bootstrapTable('getOptions').sortName;

    let url = URL_API + `/Tecnologia/ExportarTecnologiasXAplicacionByCodigoAPT?codigoAPT=${codigoAPT}&sortName=${sortName}&sortOrder=${sortOrder}`;
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

function ExportarCertificadosDigitalesRelacionadas() {
    let _data = $tblCertificadosDigitalesRelacionados.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let codigoAPT = $("#txtCodApp").val();
    let url = URL_API + `/Equipo/ExportarCertificadosDigitalesRelacionadosByCodigoAPT?codigoAPT=${codigoAPT}`;
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
function ExportarClientSecretRelacionadas() {
    let _data = $tblClientSecretsRelacionadas.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let codigoAPT = $("#txtCodApp").val();
    let url = URL_API + `/Equipo/ExportarClientSecretsRelacionadosByCodigoAPT?codigoAPT=${codigoAPT}`;
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