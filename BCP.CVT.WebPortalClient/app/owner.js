var URL_API_VISTA = URL_API + "/Dashboard/Tecnologia";
var URL_API_VISTA2 = URL_API + "/Dashboard";

var $table = $("#tblRegistro");
var $tableDetalle = $("#tblRegistrosDetalle");
var TITULO_MENSAJE = "Owner";
var COLOR_SEMAFORO = { VERDE: 1, AMARILLO: 0, ROJO: -1 };


$(function () {
    if (FLAG_ADMIN === 1) {
        SetItemsMultiple([], $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFilTipo"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
    } else {
        SetItemsMultiple([], $("#cbFilDominio"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFilTipo"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
    }

    $table.bootstrapTable();
    //$tableDetalle.bootstrapTable();

    CargarCombos();
    initFecha();

    MethodValidarFecha(RANGO_DIAS_HABILES);
    validarCampos();

    $("#cbFilDominio").change(CargarCombosDominio);
    $("#cbFilSubdominio").change(LimpiarFormFiltros);
});

function LimpiarFormFiltros() {
    LimpiarValidateErrores($("#formFiltros"));
}

function CargarCombosDominio() {
    let idsDominio = $.isArray($(this).val()) ? $(this).val() : [$(this).val()];

    if (idsDominio !== null) {
        $.ajax({
            url: URL_API_VISTA + "/ListarCombos/Dominio",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(idsDominio),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        if (FLAG_ADMIN === 1) {
                            SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
                        } else {
                            $("#cbFilSubdominio").prop("multiple", "");
                            SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_SELECCIONE, "", true, false);
                            $("#cbFilSubdominio").val('').multiselect("refresh");
                        }

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
    //$("#formFiltros").valid();
}

function initFecha() {
    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    _BuildDatepicker($("#FechaFiltro"));
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
            },
            cbFilTipo: {
                requiredSelect: true
            },
            FechaFiltro: {
                required: true,
                isDate: true,
                FechaPrevia: true,
                FechaMaxima: true
            }
        },
        messages: {
            cbFilDominio: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "dominio")
            },
            cbFilSubdominio: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "subdominio")
            },
            cbFilTipo: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "tipo de tecnología")
            },
            FechaFiltro: {
                required: "Debe seleccionar una fecha",
                isDate: "Debe ingresar una fecha valida",
                FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbFilSubdominio" || element.attr('name') === "cbFilDominio" || element.attr('name') === "FechaFiltro") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
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
                    if (FLAG_ADMIN === 1) {
                        SetItemsMultiple(dataObject.Dominio, $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
                        SetItemsMultiple(dataObject.TipoTecnologia, $("#cbFilTipo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    } else {
                        $("#cbFilDominio").prop("multiple", "");
                        SetItemsMultiple(dataObject.Dominio, $("#cbFilDominio"), TEXTO_SELECCIONE, "", true, false);
                        $("#cbFilDominio").val('').multiselect("refresh");
                    }

                    //SetItems(dataObject.TipoTecnologia, $("#cbFilTipo"), TEXTO_TODOS);
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

function RefrescarListado() {
    listarRegistros();
}

function estadoFormatter(value, row, index) {
    var html = "";
    if (row.ReporteIndicadorActual === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    } else if (row.ReporteIndicadorActual === 1) {
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
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

function listarRegistros() {
    if ($("#formFiltros").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $("#divResultado").show();
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA2 + "/Owner",
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            method: 'POST',
            pagination: true,
            sidePagination: 'server',
            queryParamsType: 'else',
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            sortName: 'Tecnologia',
            sortOrder: 'asc',
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.Owner = ""; //$("#txtFiltroOwner").val();
                DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
                DATA_EXPORTAR.Tecnologia = ""; //$("#txtFiltroTecnologia").val();
                DATA_EXPORTAR.TipoTecnologiaFiltrar = $.isArray($("#cbFilTipo").val()) ? $("#cbFilTipo").val() : [$("#cbFilTipo").val()];
                DATA_EXPORTAR.SubdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()];
                DATA_EXPORTAR.pageNumber = p.pageNumber;
                DATA_EXPORTAR.pageSize = p.pageSize;
                DATA_EXPORTAR.sortName = p.sortName;
                DATA_EXPORTAR.sortOrder = p.sortOrder;

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

function linkFormatter(value, row) {
    return `<a href="javascript:ViewDetails(${row.TecnologiaId})" title="Mostrar detalle">${value}</a>`;
}
function ViewDetails(id) {
    listarRegistrosDetalle(id, $tableDetalle, null);

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

function listarRegistrosDetalle(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA2 + "/Owner/Tecnologia",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Componente',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.TecnologiaId = id;
            DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.sortName = p.sortName;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadSuccess: function (status, res) {
            OpenModal();
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

function ExportarData() {
    if ($("#formFiltros").valid()) {
        var owner = ""; //$("#txtFiltroOwner").val();
        var fecha = $("#FechaFiltro").val();
        var tecnologia = ""; //$("#txtFiltroTecnologia").val();
        var tipoTecnologia = $.isArray($("#cbFilTipo").val()) ? $("#cbFilTipo").val() : [$("#cbFilTipo").val()];
        var subdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val().join() : $("#cbFilSubdominio").val();

        let url = `${URL_API_VISTA2}/Owner/Exportar?owner=${owner}&fecha=${fecha}&tecnologia=${tecnologia}&tipoTecnologia=${tipoTecnologia}&subdominio=${subdominioFiltrar}`;
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

function ownerSemaforoFormatter(value, row, index) {
    let html = "";
    let color = "";
    let proyeccion = parseInt(value);

    color = proyeccion === COLOR_SEMAFORO.VERDE ? "success" : (proyeccion === COLOR_SEMAFORO.ROJO ? "danger" : "warning");
    html = `<button type="button" class="btn btn-${color} btn-circle"></button>`;

    return html;
}