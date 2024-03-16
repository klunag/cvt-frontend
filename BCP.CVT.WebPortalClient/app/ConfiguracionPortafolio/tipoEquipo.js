var $table = $("#tbTipoEquipo");
var URL_API_VISTA = URL_API + "/TipoEquipo";
var DATA_EXPORTAR = {};

$(function () {
    cargarCombos();
    listarTipoEquipo();
    FormatoCheckBox($("#divActRegistro"), 'cbActRegistro');
    FormatoCheckBox($("#divIncDiagramaInfra"), 'cbIncDiagramaInfra');
    FormatoCheckBox($("#divFlagHardware"), 'cbFlagHardware');
});

function listarTipoEquipo(flagDialog = true) {
    if (flagDialog) waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
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
            DATA_EXPORTAR.nombre = "";
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

function MdEditTipoEquipo(EstadoMd) {
    limpiarMdEditTipoEquipo();

    if (EstadoMd)
        $("#MdEditTipoEquipo").modal(opcionesModal);
    else
        $("#MdEditTipoEquipo").modal('hide');
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:editarTipoEquipo(${row.Id})" title="Editar">${value}</a>`;
}

function editarTipoEquipo(TipoEquipoId) {
    $.ajax({
        url: URL_API_VISTA + "/" + TipoEquipoId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdEditTipoEquipo(true);

            $("#hdTipoEquipoId").val(result.Id);
            $("#hdCriterioObsolescenciaId").val(result.CriterioObsolescenciaId);
            $("#txtNombreTipoEquipo").val(result.Nombre);
            $("#txtNombreCriterioObsolescencia").val(result.NombreCriterioObsolescencia);
            $("#cbActRegistro").prop('checked', result.FlagExcluirKPI);
            $('#cbActRegistro').bootstrapToggle(result.FlagExcluirKPI ? 'on' : 'off');
            $('#cbFlagHardware').bootstrapToggle(result.FlagIncluirHardwareKPI ? 'on' : 'off');
            if (result.TipoCicloVidaId > 0) {
                $("#cbTipoCicloVida").val(result.TipoCicloVidaId);
            }
            if (result.CriterioObsolescenciaId == 1) {
                $("#divTipoCicloVida").css('display', 'none');
            } else {
                $("#divTipoCicloVida").css('display', 'block');
            }

            $("#cbIncDiagramaInfra").prop('checked', result.FlagIncluirEnDiagramaInfra);
            $('#cbIncDiagramaInfra').bootstrapToggle(result.FlagIncluirEnDiagramaInfra ? 'on' : 'off');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function limpiarMdEditTipoEquipo() {
    LimpiarValidateErrores($("#formEditTipoEquipo"));
    $("#hdTipoEquipoId").val("");
    $("#hdCriterioObsolescenciaId").val("");
    $("#txtNombreTipoEquipo").val("");
    $("#txtNombreCriterioObsolescencia").val("");
    $("#cbTipoCicloVida").val("-1");
}

function guardarEditTipoEquipo() {
    if ($("#formEditTipoEquipo").valid()) {
        $("#btnRegTipoEquipo").button("loading");

        var TipoEquipo = {};
        TipoEquipo.TipoEquipoId = ($("#hdTipoEquipoId").val() === "") ? -1 : parseInt($("#hdTipoEquipoId").val());
        TipoEquipo.FlagExcluirKPI = $("#cbActRegistro").prop("checked");
        TipoEquipo.FlagIncluirHardwareKPI = $("#cbFlagHardware").prop("checked");
        if ($("#hdCriterioObsolescenciaId").val() != 1) {
            TipoEquipo.TipoCicloVidaId = $("#cbTipoCicloVida").val();
        }
        TipoEquipo.FlagIncluirEnDiagramaInfra = $("#cbIncDiagramaInfra").prop("checked");

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(TipoEquipo),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                toastr.success("Registrado correctamente", "Registro del Tipo de Activo");
            },
            complete: function () {
                $("#btnRegTipoEquipo").button("reset");
                listarTipoEquipo(false);
                MdEditTipoEquipo(false);
            },
            error: function (result) {
                alert(result.responseText);
                waitingDialog.hide();
            }
        });
    }
}

function excluirKPIFormatter(value, row, index) {
    if (row.FlagExcluirKPI) {
        return `<span class="iconoRojo">SI</span>`;
    }
    else {
        return `<span class="iconoVerde">NO</span>`;
    }
}
function incluirEnDiagramaInfra(value, row, index) {
    if (row.FlagIncluirEnDiagramaInfra) {
        return `<span class="iconoVerde">SI</span>`;
    }
    else {
        return `<span class="iconoRojo">NO</span>`;
    }
}
function incluirHardwareKPIFormatter(value, row, index) {
    if (row.FlagIncluirHardwareKPI) {
        return `<span class="iconoRojo">SI</span>`;
    }
    else {
        return `<span class="iconoVerde">NO</span>`;
    }
}

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ObtenerCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    SetItems(dataObject.TipoCicloVida || [], $("#cbTipoCicloVida"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}