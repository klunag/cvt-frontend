var $table = $("#tblRegistro");
var $tblTecNoInstalads = $("#tbl-tecnologiaInstaladas");
var $tblTecNoRegistradas = $("#tbl-tecnologiaNoRegistrada");
var $tblAplicacionesRelacionadas = $("#tbl-aplicacionesRelacionadas");
var URL_API_VISTA = URL_API + "/Equipo";
var URL_API_VISTA_VAL = URL_API + "/Relacion";
var URL_API_AMBIENTE = URL_API + "/Dominio";
var TIPO_EQUIPO_ID_CD = 0;

var DATA_EXPORTAR = {};
const arrMultiSelect = [
    { SelectId: "#cbAmbiente", DataField: "Ambiente" },
    { SelectId: "#cbTipoEquipo", DataField: "TipoEquipo" },
    { SelectId: "#cbDescubrimiento", DataField: "Descubrimiento" },
    { SelectId: "#cbSubsidiaria", DataField: "DominioRed" },
    //{ SelectId: "#cbDominioRed", DataField: "DominioRed" },

];

$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    CargarParametroCD();
    cargarCombos();
    //GetTipos($("#cbTipoEquipo"));
    //GetAmbiente($("#cbAmbiente"));
    $tblTecNoInstalads.bootstrapTable({ data: [] });
    $tblTecNoRegistradas.bootstrapTable({ data: [] });
    $tblAplicacionesRelacionadas.bootstrapTable({ data: [] });

    //$("#btnExportar").show();
    //listarRegistros();
    //$table.bootstrapTable("destroy");
    $table.bootstrapTable({ data: [] });
    //if (FLAG_ADMIN == 1) {
    //    $("#btnExportar").show();
    //    listarRegistros();

    //} else {
    //    //$table.bootstrapTable({ data: [] });
    //    $("#btnExportar").hide();
    //    //ValidarForm();
    //    listarRegistros();
    //}


    InitFecha();
    InitAutocompletarBuilder($("#txtEquipo"), null, ".containerFiltro", "/Equipo/GetEquipoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtSistemaOperativo"), null, ".containerFiltroSO", "/Tecnologia/GetSistemasOperativoByFiltro?filtro={0}");

});
function InitFecha() {
    $("#divFechaFiltro").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#divFechaFiltro").on("dp.change", function (e) { ListarTecnologiasInstaladas(); });
}

function CargarParametroCD() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA_VAL + `/GetCertificadoDigitalID`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    TIPO_EQUIPO_ID_CD = dataObject.parametro;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function ValidarForm() {

    $.validator.methods.requiredSelectCondicional = function (value, element) {
        value = value || null;
        return (value != "-1" && value != null) || ($("#txtEquipo").val() != "") || ($("#txtSistemaOperativo").val() != "");
    }

    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbAmbiente: {
                requiredSelectCondicional: true
            },
            cbTipoEquipo: {
                requiredSelectCondicional: true
            },
            cbDescubrimiento: {
                requiredSelectCondicional: true
            },
            cbSubsidiaria: {
                requiredSelectCondicional: true
            }
        },
        messages: {
            cbAmbiente: {
                requiredSelectCondicional: String.Format("Debes seleccionar {0}.", "un ambiente")
            },
            cbTipoEquipo: {
                requiredSelectCondicional: String.Format("Debes seleccionar {0}.", "un tipo de equipo")
            },
            cbDescubrimiento: {
                requiredSelectCondicional: String.Format("Debes seleccionar {0}.", "un descubrimiento")
            },
            cbSubsidiaria: {
                requiredSelectCondicional: String.Format("Debes seleccionar {0}.", "una subsidiaria")
            }

        }
    });


}


function Buscar() {
    listarRegistros();
}

function listarRegistros() {

    if ($("#formFiltros").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA + "/Listado",
            method: 'POST',
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

            pagination: true,
            sidePagination: "server",
            queryParamsType: "else",
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            sortName: "Nombre",
            sortOrder: "asc",
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.nombre = $.trim($("#txtEquipo").val());
                DATA_EXPORTAR.IP = $.trim($("#txtIP").val());
                DATA_EXPORTAR.so = $("#txtSistemaOperativo").val();
                DATA_EXPORTAR.ambienteIds = CaseIsNullSendExport($("#cbAmbiente").val());
                DATA_EXPORTAR.tipoIds = CaseIsNullSendExport($("#cbTipoEquipo").val());
                DATA_EXPORTAR.desIds = CaseIsNullSendExport($("#cbDescubrimiento").val());
                DATA_EXPORTAR.subsiIds = CaseIsNullSendExport($("#cbSubsidiaria").val());
                DATA_EXPORTAR.flagActivo = $("#ddlEstado").val();// $("#ddlEstado").val() === "-1" ? null : $("#ddlEstado").val();
                DATA_EXPORTAR.pageNumber = p.pageNumber;
                DATA_EXPORTAR.pageSize = p.pageSize;
                DATA_EXPORTAR.sortName = p.sortName;
                DATA_EXPORTAR.sortOrder = p.sortOrder;
                //console.log(DATA_EXPORTAR);
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
}

function linkFormatterName(value, row, index) {
    if (FLAG_DETALLE == 1) {
        var opcion;
        if (row.TipoEquipoId != TIPO_EQUIPO_ID_CD) {
            opcion = `<a href="DetalleEquipo?id=${row.Id}" title="Ver detalle" target="_blank">${value}</a>`;
        } else {
            opcion = `<a href="DetalleCertificadoD?id=${row.Id}" title="Ver detalle" target="_blank">${value}</a>`;
        }
        return opcion;
    }
    else {
        return value;
    }
}

function linkFormatterSO(value, row, index) {
    if (FLAG_DETALLE == 1) {
        if (row.TecnologiaId > 0)
            if (FLAG_ADMIN == 1)
                return `<a href="/Dashboard/TecnologiaEquipo/${row.TecnologiaId}" title="Ver detalle" target="_blank">${value}</a>`;
            else
                return value;
        else
            return '-';
    }
    else {
        if (row.TecnologiaId > 0)
            return value;
        else
            return '-';
    }
}
function EditRegistro(id) {
    $.ajax({
        url: URL_API_VISTA + "/GetEquipoDetalle/" + id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            $("#hdId").val(id);
            if (result !== null) {
                $("#txtEquipoNombre").val(result.Nombre);
                $("#txtTipoEquipo").val(result.TipoEquipo);
                $("#txtAmbiente").val(result.Ambiente);
                $("#txtDominio").val(result.Dominio);
                $("#txtIP").val(result.IP);
                $("#txtSO").val(result.SistemaOperativo);
            }
            $(".view-listado").hide();
            $(".view-detalle").show();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            ListarTecnologiasInstaladas();
            ListarTecnologiasNoRegistradas();
            ListarAplicacionesRelacionadas();
        }
    });
}

function ListarTecnologiasInstaladasAjax(params) {
    //console.log("ListarTecnologiasInstaladasAjax", params, URL_API_VISTA + '/GetTecnologiaByEquipoId?' + $.param(params.data));
    let tmp_params = JSON.parse(params.data);
    let url = URL_API_VISTA + `/GetTecnologiaByEquipoId?fecha=${tmp_params.fecha}&equipoId=${tmp_params.equipoId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    //+ '?' + $.param(params.data)
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res)
    }).fail(function () {
        params.success({ Rows: [], Total: 0 });
    });
}
function ListarTecnologiasNoRegistradasAjax(params) {
    let tmp_params = JSON.parse(params.data);
    //console.log("ListarTecnologiasNoRegistradasAjax", tmp_params);
    let url = URL_API + `/TecnologiaNoRegistrada/GetByEquipoId?equipoId=${tmp_params.equipoId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res)
    });
}
function ListarAplicacionesRelacionadasAjax(params) {
    let tmp_params = JSON.parse(params.data);
    //console.log("ListarAplicacionesRelacionadasAjax", tmp_params);
    let url = URL_API + `/Relacion/GetRelacionesByEquipoId?equipoId=${tmp_params.equipoId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res)
    }).fail(function () {
        params.success({ Rows: [], Total: 0 })
    });
}

function CerrarVistaDetalle() {
    $(".view-listado").show();
    $(".view-detalle").hide();
    LimpiarVistaDetalle();
}
function LimpiarVistaDetalle() {
    $tblTecNoInstalads.bootstrapTable("destroy");
    $tblTecNoRegistradas.bootstrapTable("destroy");
    $tblAplicacionesRelacionadas.bootstrapTable("destroy");
    $tblTecNoInstalads.bootstrapTable({ data: [] });
    $tblTecNoRegistradas.bootstrapTable({ data: [] });
    $tblAplicacionesRelacionadas.bootstrapTable({ data: [] });
    $("#txtEquipoNombre").val();
    $("#txtTipoEquipo").val();
    $("#txtAmbiente").val();
    $("#txtDominio").val();
    $("#txtIP").val();
    $("#txtSO").val();
    $("#hdId").val();
    //$("#FechaFiltro").val(ObtenerFechaActual());
    $("#FechaFiltro").val(moment(new Date()).format("DD/MM/YYYY"));
}
function ListarTecnologiasInstaladas() {
    //waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblTecNoInstalads.bootstrapTable('destroy');
    $tblTecNoInstalads.bootstrapTable({
        //url: URL_API_VISTA + "/Listado",
        //method: 'POST',
        ajax: "ListarTecnologiasInstaladasAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "ClaveTecnologia",
        sortOrder: "asc",
        queryParams: function (p) {
            return JSON.stringify({
                equipoId: $("#hdId").val(),
                fecha: castDate($("#FechaFiltro").val()),
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

function ListarTecnologiasNoRegistradas() {
    //waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblTecNoRegistradas.bootstrapTable("destroy");
    $tblTecNoRegistradas.bootstrapTable({
        //url: URL_API_VISTA + "/Listado",
        //method: 'POST',
        ajax: "ListarTecnologiasNoRegistradasAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "Aplicacion",
        sortOrder: "asc",
        queryParams: function (p) {
            return JSON.stringify({
                equipoId: $("#hdId").val(),
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

function ListarAplicacionesRelacionadas() {
    //waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblAplicacionesRelacionadas.bootstrapTable('destroy');
    $tblAplicacionesRelacionadas.bootstrapTable({
        //url: URL_API_VISTA + "/Listado",
        //method: 'POST',
        ajax: "ListarAplicacionesRelacionadasAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "Relacion.CodigoAPT",
        sortOrder: "asc",
        queryParams: function (p) {
            return JSON.stringify({
                equipoId: $("#hdId").val(),
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

function ExportarInfo() {

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.nombre = $.trim($("#txtEquipo").val());
    DATA_EXPORTAR.IP = $.trim($("#txtIP").val());
    DATA_EXPORTAR.so = $("#txtSistemaOperativo").val();
    DATA_EXPORTAR.ambienteIds = CaseIsNullSendExport($("#cbAmbiente").val());
    DATA_EXPORTAR.tipoIds = CaseIsNullSendExport($("#cbTipoEquipo").val());
    DATA_EXPORTAR.desIds = CaseIsNullSendExport($("#cbDescubrimiento").val());
    DATA_EXPORTAR.subsiIds = CaseIsNullSendExport($("#cbSubsidiaria").val());
    DATA_EXPORTAR.flagActivo = $("#ddlEstado").val();
    DATA_EXPORTAR.sortName = 'Nombre';
    DATA_EXPORTAR.sortOrder = 'asc';

    let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre}&so=${DATA_EXPORTAR.so}&ambiente=${DATA_EXPORTAR.ambienteIds}&tipo=${DATA_EXPORTAR.tipoIds}&desId=${DATA_EXPORTAR.desIds}&subsiId=${DATA_EXPORTAR.subsiIds}&flagActivo=${DATA_EXPORTAR.flagActivo}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&IP=${DATA_EXPORTAR.IP}`;
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


function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //console.log(dataObject);
                    if (FLAG_ADMIN == 1) {

                        SetDataToSelectMultiple(arrMultiSelect, dataObject, TEXTO_TODOS);
                        SetItems(dataObject.EstadoEquipo, $("#ddlEstado"), TEXTO_TODOS);
                        //SetItems(dataObject.Ambiente, $("#cbAmbiente"), TEXTO_TODOS);
                        //SetItems(dataObject.TipoEquipo, $("#cbTipoEquipo"), TEXTO_TODOS);
                        //SetItems(dataObject.Descubrimiento, $("#cbDescubrimiento"), TEXTO_TODOS);
                        //SetItems(dataObject.DominioRed, $("#cbSubsidiaria"), TEXTO_TODOS);
                    }
                    else {
                        SetDataToSelectMultiple(arrMultiSelect, dataObject, TEXTO_SELECCIONE);
                        SetItems(dataObject.EstadoEquipo, $("#ddlEstado"), TEXTO_TODOS);
                        //SetItems(dataObject.Ambiente, $("#cbAmbiente"), TEXTO_SELECCIONE);
                        //SetItems(dataObject.TipoEquipo, $("#cbTipoEquipo"), TEXTO_SELECCIONE);
                        //SetItems(dataObject.Descubrimiento, $("#cbDescubrimiento"), TEXTO_SELECCIONE);
                        //SetItems(dataObject.DominioRed, $("#cbSubsidiaria"), TEXTO_SELECCIONE);
                    }
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function rowStyle(row, index) {
    var classes = [
        'bg-blue',
        'bg-rojo',
        'bg-orange',
        'bg-yellow',
        'bg-red'
    ];

    if (row.Activo === false) {
        return {
            classes: classes[1],
            css: {
                color: 'black'
            }
        };
    }

    return {
        css: {
            color: 'black'
        }
    };
}
function SetDataToSelectMultiple(arrMultiSelect, dataObject, TEXTO_BY_CASE) {
    arrMultiSelect.forEach((item) => {
        if (dataObject[item.DataField])
            SetItemsMultiple(dataObject[item.DataField], $(item.SelectId), TEXTO_BY_CASE, TEXTO_BY_CASE, true);
    });
}