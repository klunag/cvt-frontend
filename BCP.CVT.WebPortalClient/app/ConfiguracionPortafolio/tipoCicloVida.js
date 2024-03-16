var $table = $("#tbTipoCicloVida");
var URL_API_VISTA = URL_API + "/TipoCicloVida";
var DATA_EXPORTAR = {};

$(function () {
    FormatoCheckBox($("#divFlagTecnologia"), 'cbFlagTecnologia');
    validarFormTipoCicloVida();
    listarTipoCicloVida();
});

function listarTipoCicloVida(flagDialog = true) {
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
        sortName: 'Id',
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

function validarFormTipoCicloVida() {

    $("#formAddOrEditTipoCicloVida").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombreTipoCiclo: {
                requiredSinEspacios: true

            },
            txtDescripTipoCiclo: {
                requiredSinEspacios: true
            },
            txtPeriodoTipoCiclo: {
                requiredSinEspacios: true,
                number: true,
                min: 1
                //max: 12
            }
        },
        messages: {
            txtNombreTipoCiclo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtDescripTipoCiclo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
            txtPeriodoTipoCiclo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el periodo"),
                number: "Debes ingresar número",
                min: "Debe ingresar un número mayor o igual a 1",
                //max: "Debe ingresar un número menor o igual a 12"
            }
        }
    });
}

function opciones(value, row, index) {
    if (row.FlagDefault) {
        return `<a title="Cambiar estado"><i style="color:#A5A9AC;" class="glyphicon glyphicon-check"></i></a>`;
    }
    else {
        let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
        let type_icon = row.Activo ? "check" : "unchecked";

        return `<a href="javascript:cambiarEstado(${row.Id})" title="Cambiar estado"><i style="" id="cbOpcTipoCicloVida${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    }
}

function MdAddOrEditTipoCicloVida(EstadoMd) {
    limpiarMdAddOrEditTipoCicloVida();

    if (EstadoMd)
        $("#MdAddOrEditTipoCicloVida").modal(opcionesModal);
    else
        $("#MdAddOrEditTipoCicloVida").modal('hide');
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:editarTipoCicloVida(${row.Id})" title="Editar">${value}</a>`;
}

function editarTipoCicloVida(TipoCicloVidaId) {
    //$("#titleFormTipoCicloVida").html("Registro del Tipo de Ciclo de Vida");
    $.ajax({
        url: URL_API_VISTA + "/" + TipoCicloVidaId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditTipoCicloVida(true);

            $("#hdTipoCicloId").val(result.Id);
            $("#txtNombreTipoCiclo").val(result.Nombre);
            $("#txtDescripTipoCiclo").val(result.Descripcion);
            $("#txtPeriodoTipoCiclo").val(result.NroPeriodo);
            $("#cbFlagTecnologia").prop('checked', result.FlagTecnologia);
            $('#cbFlagTecnologia').bootstrapToggle(result.FlagTecnologia ? 'on' : 'off');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function AddTipoCicloVida() {
    //$("#titleFormTipoCicloVida").html("Configurar Tipo de Cilo de Vida");
    $("#hdTipoCicloId").val('');
    MdAddOrEditTipoCicloVida(true);
}

function limpiarMdAddOrEditTipoCicloVida() {
    LimpiarValidateErrores($("#formAddOrEditTipoCicloVida"));
    $("#hdTipoCicloId").val("");
    $("#txtNombreTipoCiclo").val("");
    $("#txtDescripTipoCiclo").val("");
    $("#txtPeriodoTipoCiclo").val("");
}

function guardarAddOrEditTipoCicloVida() {
    if ($("#formAddOrEditTipoCicloVida").valid()) {
        $("#btnRegTipoCicloVida").button("loading");

        var TipoCicloVida = {};
        TipoCicloVida.Id = ($("#hdTipoCicloId").val() === "") ? -1 : parseInt($("#hdTipoCicloId").val());
        TipoCicloVida.Nombre = $("#txtNombreTipoCiclo").val();
        TipoCicloVida.Descripcion = $("#txtDescripTipoCiclo").val();
        TipoCicloVida.NroPeriodo = parseInt($("#txtPeriodoTipoCiclo").val());
        TipoCicloVida.FlagTecnologia = $("#cbFlagTecnologia").prop("checked");

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(TipoCicloVida),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                toastr.success("Registrado correctamente", "Registro del Tipo de Ciclo de Vida");
            },
            complete: function () {
                $("#btnRegTipoCicloVida").button("reset");
                listarTipoCicloVida(false);
                MdAddOrEditTipoCicloVida(false);
            },
            error: function (result) {
                alert(result.responseText);
                waitingDialog.hide();
            }
        });
    }
}

function cambiarEstado(Id) {
    if (Id) {
        bootbox.confirm({
            message: "¿Estás seguro que deseas cambiar el estado del registro seleccionado?",
            buttons: {
                confirm: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                },
                cancel: {
                    label: 'Cancelar',
                    className: 'btn-secondary'
                }
            },
            callback: function (result) {
                if (result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        type: 'GET',
                        contentType: "application/json; charset=utf-8",
                        url: `${URL_API_VISTA}/CambiarEstado?Id=${Id}`,
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Se cambió el estado correctamente", "");
                                    listarTipoCicloVida(false);
                                }
                            }
                            else {
                                toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "");
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            var error = JSON.parse(xhr.responseText);
                            waitingDialog.hide();
                        },
                        complete: function (data) { }
                    });
                }
            }
        });
    }

}

function setDefault(value, row, index) {
    if (row.Activo) {
        let style_color = row.FlagDefault ? 'iconoVerde ' : "iconoRojo ";
        let type = row.FlagDefault ? "SI" : "NO";
        return `<a href="javascript:SetTipoCicloVidaDefault(${row.Id})" title="Modificar Default" class="${style_color}">${type}</i></a>`;
    }
    else {
        return `<a title="Modificar Default" style="color:#A5A9AC;">NO</a>`;
    }
}

function setTecnologia(value, row, index) {
    if (row.FlagTecnologia) {
        return `<a title="Modificar Default" style="color:#A5A9AC;">SI</a>`;
    }
    else {
        return `<a title="Modificar Default" style="color:#A5A9AC;">NO</a>`;
    }
}

function SetTipoCicloVidaDefault(Id) {
    if (Id) {
        bootbox.confirm({
            message: "¿Estás seguro que deseas cambiar el estado del registro seleccionado?",
            buttons: {
                confirm: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                },
                cancel: {
                    label: 'Cancelar',
                    className: 'btn-secondary'
                }
            },
            callback: function (result) {
                if (result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        type: 'GET',
                        contentType: "application/json; charset=utf-8",
                        url: `${URL_API_VISTA}/CambiarDefault?Id=${Id}`,
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Se cambió el estado correctamente", "");
                                    listarTipoCicloVida(false);
                                }
                            }
                            else {
                                toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "");
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            var error = JSON.parse(xhr.responseText);
                            waitingDialog.hide();
                        },
                        complete: function (data) { }
                    });
                }
            }
        });
    }
}