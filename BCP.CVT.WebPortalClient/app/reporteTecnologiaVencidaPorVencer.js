
var TITULO_MENSAJE = "Reporte de tecnologías vencidas y por vencer";
var URL_API_VISTA = URL_API + "/Alerta";
var $tblTecnologiasPorVencer = $("#tblTecnologiasPorVencer");
var $tblTecnologiaVencida = $("#tblTecnologiasVencidas");
var DATA_EXPORTAR = {};
const URL_API_VISTA_DASH = URL_API + "/Dashboard/Tecnologia";
const arrMultiSelect = [
    { SelectId: "#ddlDominio", DataField: "Dominio" },
    { SelectId: "#ddlSubdominio", DataField: "Subdominio" }
];

$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));

    //SetItemsMultiple([], $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    //SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    //SetItemsMultiple([], $("#cbFilTipoTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);

    CargarCombos();
    $("#ddlDominio").on('change', function () { getSubdominiosByDomCbMultiple($("#ddlSubdominio"), $("#ddlDominio")); });

    $("#btnBuscar").click(RefrescarListado);
    //initFecha();
    //validarCampos();

    //$("#cbFilDominio").change(CargarCombosDominio);
    //$("#cbFilSubdominio").change(LimpiarFormFiltros);

    //ListarTecnologiasSinFechaFin();
    //ListarTecnologiasFechaIndefinida();
    InitAutocompletarBuilder($("#txtClave"), null, ".containerFiltroTecnologia", "/Tecnologia/GetTecnologiaByClave?filtro={0}");

    ListarTecnologiasPorVencer();
    ListarTecnologiasVencidas();
});

function RefrescarListado() {
    ListarTecnologiasPorVencer();
    ListarTecnologiasVencidas();
}


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
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            dataType: "json",
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
            },
            cbFilTipoConsulta: {
                requiredSelect: true
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

function ActualizarGraficos() {
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        $("#divReportes").show();
        ListarTecnologiasSinFechaFin();
        ListarTecnologiasFechaIndefinida();
    }
}

function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Tecnologia/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetDataToSelectMultiple(arrMultiSelect, dataObject, TEXTO_TODOS);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
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
        let tipotecnologiaId = $.isArray($("#cbFilTipoTecnologia").val()) ? $("#cbFilTipoTecnologia").val().join() : $("#cbFilTipoTecnologia").val();
        let tipoConsultaId = $("#cbFilTipoConsulta").val();
        let fecha = $("#FechaFiltro").val();

        let url = `${URL_API_VISTA}/SinFechaFin/Exportar?fecha=${fecha}&tipotecnologiaId=${tipotecnologiaId}&subdominioFiltrar=${subdominioFiltrar}&tipoConsultaId=${tipoConsultaId}`;
        window.location.href = url;
    }
}

function ListarTecnologiasFechaIndefinida() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblTecnologiaIndefinida.bootstrapTable('destroy');
    $tblTecnologiaIndefinida.bootstrapTable({
        url: URL_API_VISTA + "/FechaIndefinida",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

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

function ListarTecnologiasPorVencer() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblTecnologiasPorVencer.bootstrapTable('destroy');
    $tblTecnologiasPorVencer.bootstrapTable({
        url: URL_API_VISTA + "/TecnologiasPorVencer",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'TotalAplicaciones',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.subdominio = CaseIsNullSendExport($("#ddlSubdominio").val());
            DATA_EXPORTAR.tecnologia = $.trim($("#txtClave").val());
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            var mes_proyeccion = data.Total > 0 ? data.Rows[0].NroMeses : 12;
            $("#title-table").html(String.Format("Tecnologías vencidas y por vencer en los próximos {0} meses que son usadas por las aplicaciones", mes_proyeccion));

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

function ListarTecnologiasVencidas() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblTecnologiaVencida.bootstrapTable('destroy');
    $tblTecnologiaVencida.bootstrapTable({
        url: URL_API_VISTA + "/TecnologiasVencidas",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'TotalAplicaciones',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.subdominio = CaseIsNullSendExport($("#ddlSubdominio").val());
            DATA_EXPORTAR.tecnologia = $.trim($("#txtClave").val());
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;

            //$("#title-table").html(String.Format("Tecnologías por vencer en los próximos {0} meses que son usadas por las aplicaciones", data.Rows[0].NroMeses));

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

function SetDataToSelectMultiple(arrMultiSelect, dataObject, TEXTO_BY_CASE) {
    arrMultiSelect.forEach((item) => {
        if (dataObject[item.DataField])
            SetItemsMultiple(dataObject[item.DataField], $(item.SelectId), TEXTO_BY_CASE, TEXTO_BY_CASE, true);
    });
}

function getSubdominiosByDomCbMultiple($cbSub, $cbDominio) {
    let idsDominio = CaseIsNullSendFilter($cbDominio.val());
    if (idsDominio) {
        $.ajax({
            url: URL_API_VISTA_DASH + "/ListarCombos/Dominio",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(idsDominio),
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (dataObject !== null && dataObject) {
                    SetItemsMultiple(dataObject.Subdominio, $cbSub, TEXTO_TODOS, TEXTO_TODOS, true);
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
        
}