var URL_API_VISTA = URL_API + "/Dashboard/Tecnologia";
var URL_API_VISTA2 = URL_API + "/Dashboard";
var $tblTecnologiaSinFechaFin = $("#tblTecnologiaSinFechaFin");
var $tblTecnologiaIndefinida = $("#tblTecnologiaIndefinida");
var TITULO_MENSAJE = "Evolución por subdominios";
var chart;

$(function () {

    SetItemsMultiple([], $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbFilTipoTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);

    $tblTecnologiaSinFechaFin.bootstrapTable();
    $tblTecnologiaIndefinida.bootstrapTable();

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
            cbFilTipoConsulta: {
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
            cbFilTipoConsulta: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "tipo de consulta")
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

function ActualizarGraficos() {
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        $("#divReportes").show();
        ListarTecnologiasSinFechaFin();
        ListarTecnologiasFechaIndefinida();
    }
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
                    //if (FLAG_ADMIN == 1) {
                    SetItemsMultiple(dataObject.Dominio, $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TipoTecnologia, $("#cbFilTipoTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItems(dataObject.TipoTecnologia, $("#cbFilTipoTecnologia"), TEXTO_TODOS);
                    SetItems(dataObject.TipoConsulta, $("#cbFilTipoConsulta"), TEXTO_SELECCIONE);
                    //SetItemsMultiple(dataObject.TipoTecnologia, $("#cbFilTipoTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.TipoConsulta, $("#cbFilTipoConsulta"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //} else {
                    //    $("#cbFilDominio").prop("multiple", "");
                    //    SetItemsMultiple(dataObject.Dominio, $("#cbFilDominio"), TEXTO_SELECCIONE, "", true, false);
                    //    $("#cbFilDominio").val('').multiselect("refresh");

                    //    //SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
                    //    SetItemsMultiple(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //    SetItemsMultiple(dataObject.DominioRed, $("#cbFilDominioRed"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //}

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
        let _data1 = $tblTecnologiaSinFechaFin.bootstrapTable("getData") || [];
        let _data2 = $tblTecnologiaIndefinida.bootstrapTable("getData") || [];

        if (_data1.length === 0 && _data2.length === 0) {
            MensajeNoExportar(TITULO_MENSAJE);
            return false;
        }

        let subdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val().join() : $("#cbFilSubdominio").val();
        let tipotecnologiaId = $.isArray($("#cbFilTipoTecnologia").val()) ? $("#cbFilTipoTecnologia").val().join() : "";
        let tipoConsultaId = $("#cbFilTipoConsulta").val();
        let fecha = $("#FechaFiltro").val();

        let url = `${URL_API_VISTA}/SinFechaFin/Exportar?fecha=${fecha}&tipotecnologiaId=${tipotecnologiaId}&subdominioFiltrar=${subdominioFiltrar}&tipoConsultaId=${tipoConsultaId}`;
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

function ListarTecnologiasFechaIndefinida() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblTecnologiaIndefinida.bootstrapTable('destroy');
    $tblTecnologiaIndefinida.bootstrapTable({
        url: URL_API_VISTA + "/FechaIndefinida",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        //fixedColumns: true,
        //fixedNumber: 4,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SubdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()];
            DATA_EXPORTAR.TipoConsultaId = $("#cbFilTipoConsulta").val();
            DATA_EXPORTAR.TipoTecnologiaFiltrar = $.isArray($("#cbFilTipoTecnologia").val()) ? $("#cbFilTipoTecnologia").val() : [$("#cbFilTipoTecnologia").val()];
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

function ListarTecnologiasSinFechaFin() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblTecnologiaSinFechaFin.bootstrapTable('destroy');
    $tblTecnologiaSinFechaFin.bootstrapTable({
        url: URL_API_VISTA + "/SinFechaFin",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        //fixedColumns: true,
        //fixedNumber: 4,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SubdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()];
            DATA_EXPORTAR.TipoConsultaId = $("#cbFilTipoConsulta").val();
            //DATA_EXPORTAR.TipoTecnologiaId = $("#cbFilTipoTecnologia").val();
            DATA_EXPORTAR.TipoTecnologiaFiltrar = $.isArray($("#cbFilTipoTecnologia").val()) ? $("#cbFilTipoTecnologia").val() : [$("#cbFilTipoTecnologia").val()];
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

