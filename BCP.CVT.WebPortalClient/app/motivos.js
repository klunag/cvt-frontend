var $table = $("#tbl-motivos");

var URL_API_VISTA = URL_API + "/Motivo";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Gestión de Motivos";

$(function () {
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({ data: [] });

    FormatoCheckBox($("#divActivo"), 'cbActMotivo');
    $("#cbActMotivo").change(function () {
        LimpiarValidateErrores($("#formAddOrEditMotivo"));
        //$("#formAddOrEditMotivo").validate().resetForm();
    });

    listarMotivos();
    validarForms();

    window.onbeforeunload = function (e) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        waitingDialog.hide();
    };
    window.onblur = function (e) {
        waitingDialog.hide();
    };
});

function BuscarMotivo() {
    listarMotivos();
}
function LimpiarMdAddOrEditMotivo() {
    LimpiarValidateErrores($("#formAddOrEditMotivo"));
    $("#txtNomMotivo").val('');
    $("#txtDesMotivo").val('');

    $("#cbActMotivo").prop("checked", true);
    $("#cbActMotivo").bootstrapToggle('on');
}

function validarForms() {
    $.validator.addMethod("existeMotivo", function (value, element) {
        let estado = true;
        //if ($("#hFamTecId").val() === "0") {
        if ($.trim(value) !== "" && $.trim(value).length >= 3) {
            estado = !ExisteMotivo2();
            return estado;
        }
        //}
        return estado;
    });

    $("#formAddOrEditMotivo").validate({
        ignore: ".ignore",
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomMotivo: {
                requiredSinEspacios: true,
                existeMotivo: true
            },
            txtDesMotivo: {
                requiredSinEspacios: true
            },
        },
        messages: {
            txtNomMotivo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre"),
                existeMotivo: String.Format("{0} ya existe.", "La motivo")
            },
            txtDesMotivo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "dpFecSopMotivo" || element.attr('name') === "dpFecExtMotivo" || element.attr('name') === "dpFecIntMotivo") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
    });
}
function listarMotivos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusMotivo").val());
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

//Open Modal: true
//Close Modal: false
function MdAddOrEditMotivo(EstadoMd) {
    LimpiarMdAddOrEditMotivo();
    if (EstadoMd)
        $("#MdAddOrEditMotivo").modal(opcionesModal);
    else
        $("#MdAddOrEditMotivo").modal('hide');
}

function EditMotivo(MotivoId) {
    $.ajax({
        url: URL_API_VISTA + "/" + MotivoId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            $("#titleFormMotivo").html("Editar Motivo");
            MdAddOrEditMotivo(true);

            $("#hIdMotivo").val(result.Id);
            $("#txtNomMotivo").val(result.Nombre);
            $("#txtDesMotivo").val(result.Descripcion);
            $("#cbActMotivo").prop('checked', result.Activo);
            $('#cbActMotivo').bootstrapToggle(result.Activo ? 'on' : 'off');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function AddMotivo() {
    $("#titleFormMotivo").html("Nueva Motivo");
    $("#hIdMotivo").val('');
    MdAddOrEditMotivo(true);
}

function GuardarAddOrEditMotivo() {
    if ($("#formAddOrEditMotivo").valid()) {
        $("#btnRegMotivo").button("loading");

        var motivo = {};
        motivo.Id = ($("#hIdMotivo").val() === "") ? 0 : parseInt($("#hIdMotivo").val());
        motivo.Nombre = $("#txtNomMotivo").val().trim();
        motivo.Descripcion = $("#txtDesMotivo").val();

        motivo.Activo = $('#cbActMotivo').prop("checked"); // $("#cbActMotivo").is(':checked');

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(motivo),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                $("#txtBusMotivo").val("");
                listarMotivos();
            },
            complete: function () {
                $("#btnRegMotivo").button("reset");
                MdAddOrEditMotivo(false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function CambiarEstado(MotivoId, FlagActivo, CantidadTecnologiasAsociadas) {
    if (FlagActivo) {
        if (CantidadTecnologiasAsociadas == 0) {
            CambiarEstadoConfirm(MotivoId);
        } else {
            bootbox.alert("No se puede desactivar el registro ya que tiene tecnologás asociadas.");
        }
    } else {
        CambiarEstadoConfirm(MotivoId);
    }
}

function CambiarEstadoConfirm(MotivoId) {
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
                    url: `${URL_API_VISTA}/CambiarEstado?Id=${MotivoId}`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se cambio el estado correctamente", TITULO_MENSAJE);
                                listarMotivos();
                            }
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    },
                    complete: function (data) {
                        //$table.bootstrapTable('refresh');
                        //listarMotivos();
                    }
                });
            }
        }
    });
}

function linkFormatterName(value, row, index) {
    return `<a href="javascript:EditMotivo(${row.Id})" title="Editar">${value}</a>`;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? "iconoVerde " : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:CambiarEstado(${row.Id}, ${row.Activo}, ${row.CantidadTecnologiasAsociadas})" title="Cambiar estado"><i style="" id="cbOpcFam${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return estado;
}

//function ExportarInfo() {
//    let _data = $table.bootstrapTable("getData") || [];
//    if (_data.length === 0) {
//        MensajeNoExportar(TITULO_MENSAJE);
//        return false;
//    }

//    let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
//    window.location.href = url;
//}

function ExisteMotivo2() {
    //debugger;
    let estado = false;
    let Id = $("#hIdMotivo").val() !== "0" ? $("#hIdMotivo").val() : null;
    let nombre = $("#txtNomMotivo").val() || "";
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteMotivoByNombre?Id=${Id}&nombre=${nombre}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    estado = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return estado;
}