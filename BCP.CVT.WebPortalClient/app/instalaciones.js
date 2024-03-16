var URL_API_VISTA = URL_API + "/Dashboard/Tecnologia";
var URL_API_VISTA2 = URL_API + "/Dashboard";
var DATA_SUBDOMINIO = [];
var DATA_TIPOEQUIPO = [];
var $tableEquipo = $("#tblRegistroEquipo");
var $tblDetalleEquipoByTecnologia = $("#tblDetalleEquipoByTecnologia");
var TITULO_MENSAJE = "Reporte de instalaciones";
var TIPO_EQUIPO_LINK = { TODOS: 0, SERVIDOR: 1, SERVIDOR_AGENCIA: 2, PC: 3, SERVICIO_NUBE: 4, STORAGE: 5, APPLIANCE: 6 };

$(function () {
    SetItemsMultiple([], $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    $tableEquipo.bootstrapTable();

    CargarCombos();
    initFecha();
    validarCampos();

    $("#cbFilDominio").change(CargarCombosDominio);
    $("#cbFilSubdominio").change(LimpiarFormFiltros);
});

function LimpiarFormFiltros() {
    LimpiarValidateErrores($("#formFiltros"));
}

function CargarCombosDominio() {
    let idsDominio = $(this).val();
    if (idsDominio !== null) {
        $.ajax({
            url: URL_API_VISTA + "/ListarCombos/Dominio",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(idsDominio),
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function () {

            },
            async: true
        });
    }

    LimpiarValidateErrores($("#formFiltros"));
}

function initFecha() {
    $("#divFechaFiltro").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
}

function validarCampos() {
    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbFilDominio: {
                requiredSelect: true
            },
            cbFilSubdominio: {
                requiredSelect: true
            }
        },
        messages: {
            cbFilDominio: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "dominio")
            },
            cbFilSubdominio: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "subdominio")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbFilSubdominio" || element.attr('name') === "cbFilDominio") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function ActualizarReporte() {
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        $("#divGraficos").show();
        listarRegistrosEquipo();
    }
}

function listarRegistrosEquipo() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableEquipo.bootstrapTable('destroy');
    $tableEquipo.bootstrapTable({
        url: URL_API_VISTA + "/Instalaciones",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SubdominioFiltrar = $("#cbFilSubdominio").val();
            DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
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


function CargarCombos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItemsMultiple(dataObject.Dominio, $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            waitingDialog.hide();
        }
        //async: false
    });
}

function ExportarData() {
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        var subdominioFiltrar = $("#cbFilSubdominio").val().join();
        var fecha = $("#FechaFiltro").val();        

        let url = `${URL_API_VISTA}/Instalaciones/Exportar?fecha=${fecha}&subdominios=${subdominioFiltrar}`;
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
}

function TotalInstalacionesLinkFormatter(value, row, index) {
    return `<a href="javascript:VerListadoDetalleEquipos(${value}, ${TIPO_EQUIPO_LINK.TODOS}, ${row.TecnologiaId}, '${getFormattedDate(row.FechaFiltro)}', '${row.SubdominioToString}')" title="Ver equipos">${value}</a>`;
}

function TotalServidoresLinkFormatter(value, row, index) {
    return `<a href="javascript:VerListadoDetalleEquipos(${value}, ${TIPO_EQUIPO_LINK.SERVIDOR}, ${row.TecnologiaId}, '${getFormattedDate(row.FechaFiltro)}', '${row.SubdominioToString}')" title="Ver equipos">${value}</a>`;
}

function TotalServidoresAgenciaLinkFormatter(value, row, index) {
    return `<a href="javascript:VerListadoDetalleEquipos(${value}, ${TIPO_EQUIPO_LINK.SERVIDOR_AGENCIA}, ${row.TecnologiaId}, '${getFormattedDate(row.FechaFiltro)}', '${row.SubdominioToString}')" title="Ver equipos">${value}</a>`;
}

function TotalPCsLinkFormatter(value, row, index) {
    return `<a href="javascript:VerListadoDetalleEquipos(${value}, ${TIPO_EQUIPO_LINK.PC}, ${row.TecnologiaId}, '${getFormattedDate(row.FechaFiltro)}', '${row.SubdominioToString}')" title="Ver equipos">${value}</a>`;
}

function TotalServicioNubeLinkFormatter(value, row, index) {
    return `<a href="javascript:VerListadoDetalleEquipos(${value}, ${TIPO_EQUIPO_LINK.SERVICIO_NUBE}, ${row.TecnologiaId}, '${getFormattedDate(row.FechaFiltro)}', '${row.SubdominioToString}')" title="Ver equipos">${value}</a>`;
}

function TotalStorageLinkFormatter(value, row, index) {
    return `<a href="javascript:VerListadoDetalleEquipos(${value}, ${TIPO_EQUIPO_LINK.STORAGE}, ${row.TecnologiaId}, '${getFormattedDate(row.FechaFiltro)}', '${row.SubdominioToString}')" title="Ver equipos">${value}</a>`;
}

function TotalApplianceLinkFormatter(value, row, index) {
    return `<a href="javascript:VerListadoDetalleEquipos(${value}, ${TIPO_EQUIPO_LINK.APPLIANCE}, ${row.TecnologiaId}, '${getFormattedDate(row.FechaFiltro)}', '${row.SubdominioToString}')" title="Ver equipos">${value}</a>`;
}

function getFormattedDate(date) {
    let fecha = new Date(date.toString());
    let year = fecha.getFullYear();
    let month = (1 + fecha.getMonth()).toString().padStart(2, '0');
    let day = fecha.getDate().toString().padStart(2, '0');

    return day + '/' + month + '/' + year;
}

function VerListadoDetalleEquipos(value, TipoEquipoId, TecnologiaId, FechaFiltro, SubdominioToString) {
    if (value > 0) {
        listarDetalleEquipos(TipoEquipoId, TecnologiaId, FechaFiltro, SubdominioToString);
    } else {
        bootbox.alert({
            size: "sm",
            title: TITULO_MENSAJE,
            message: "No existen registros.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    }
}

function castDate3(cadena) {
    var ts = new Date(cadena);
    return ts.toLocaleDateString();
}

function listarDetalleEquipos(TipoEquipoId, TecnologiaId, FechaFiltro, SubdominioToString) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblDetalleEquipoByTecnologia.bootstrapTable('destroy');
    $tblDetalleEquipoByTecnologia.bootstrapTable({
        url: URL_API_VISTA + "/Instalaciones/ByTecnologia",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SubdominioToString = SubdominioToString;
            DATA_EXPORTAR.Fecha = FechaFiltro;
            DATA_EXPORTAR.TipoEquipoId = TipoEquipoId;
            DATA_EXPORTAR.TecnologiaId = TecnologiaId;
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
        },
        onLoadSuccess: function (data) {
            $("#mdDetalleEquipoByTecnologia").modal('show');
        }
    });
}