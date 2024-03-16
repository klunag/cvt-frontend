var $table = $("#tbl-tipos");
var URL_API_VISTA = URL_API + "/TipoExclusion";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Tipos de exclusión";

$(function () {
    FormatoCheckBox($("#divActivo"), 'cbActTipo');
    //FormatoCheckBox($("#divFlagStandar"), 'cbFlagEstandar');

    //$("#cbActTipo").change(function () {
    //    //LimpiarValidateErrores($("#formAddOrEditTipo"));
    //});

    //$("#cbFlagEstandar").change(function () {
    //    LimpiarValidateErrores($("#formAddOrEditTipo"));
    //});
    validarFormTipo();
    listarTipos();
});

function limpiarMdAddOrEditTipo() {
    $("#txtNomTipo").val('');
    $("#txtDesTipo").val('');
    $("#cbActTipo").prop('checked', true);
    $("#cbActTipo").bootstrapToggle('on');
}

function MdAddOrEditTipo(EstadoMd) {
    limpiarMdAddOrEditTipo();
    $("#formAddOrEditTipo").validate().resetForm();
    if (EstadoMd)
        $("#MdAddOrEditTipo").modal(opcionesModal);
    else
        $("#MdAddOrEditTipo").modal('hide');
}

function buscarTipo() {
    listarTipos();
}

function listarTipos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusTipo").val());
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

function AddTipo() {
    $("#titleFormTipo").html("Nuevo Tipo exclusión");
    $("#hIdTipo").val('');
    //$("#hdNumTecAsoc").val("0");
    MdAddOrEditTipo(true);
}

function EditTipo(TipoId) {
    $("#titleFormTipo").html("Editar Tipo exclusión");
    $.ajax({
        url: URL_API_VISTA + "/" + TipoId,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        dataType: "json",
        success: function (result) {
            MdAddOrEditTipo(true);

            $("#hIdTipo").val(result.Id);
            //$("#hdNumTecAsoc").val(NumTecAsociadas);
            $("#txtNomTipo").val(result.Nombre);
            $("#txtDesTipo").val(result.Descripcion);
            $("#cbActTipo").prop('checked', result.Activo);
            $("#cbActTipo").bootstrapToggle(result.Activo ? 'on' : 'off');
            //$("#cbFlagEstandar").prop('checked', result.FlagEstandar);
            //$("#cbFlagEstandar").bootstrapToggle(result.FlagEstandar ? 'on' : 'off');

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function GuardarAddOrEditTipo() {
    if ($("#formAddOrEditTipo").valid()) {
        $("#btnRegTipo").button("loading");

        var tipo = {};
        tipo.Id = ($("#hIdTipo").val() === "") ? 0 : parseInt($("#hIdTipo").val());
        tipo.Nombre = $("#txtNomTipo").val().trim();
        tipo.Descripcion = $("#txtDesTipo").val();
        tipo.Activo = $("#cbActTipo").prop("checked");
        //tipo.FlagEstandar = $("#cbFlagEstandar").prop("checked");

        $.ajax({
            url: URL_API_VISTA,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            type: "POST",
            data: tipo,
            dataType: "json",
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
            },
            complete: function () {
                $("#btnRegTipo").button("reset");
                $("#txtBusTipo").val('');
                $table.bootstrapTable('refresh');
                MdAddOrEditTipo(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:EditTipo(${row.Id})" title="Editar">${value}</a>`;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:CambiarEstado(${row.Id})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return estado;
}

function CambiarEstado(TipoId) {
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
                $.ajax({
                    type: 'GET',
                    contentType: "application/json; charset=utf-8",
                    url: `${URL_API_VISTA}/CambiarEstado?Id=${TipoId}`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                $("#txtBusTipo").val('');
                                listarTipos();
                            }
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    },
                    complete: function (data) {
                        //$table.bootstrapTable('refresh');
                    }
                });
            }
        }
    });
}


function validarFormTipo() {

    $("#formAddOrEditTipo").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomTipo: {
                requiredSinEspacios: true
            },
            txtDesTipo: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtNomTipo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtDesTipo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            }
        }
    });
}