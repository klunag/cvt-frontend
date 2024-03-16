var $table = $("#tblRegistro");
var URL_API_VISTA = URL_API + "/Relevancia";
$(function () {
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({ data: [] });
    ListarRegistros();
    ValidarCampos();
    FormatoCheckBox($("#divActivo"), "cbActivo");
})
function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        sortName: "Nombre",
        sortOrder: "asc",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtFiltro").val());
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
function ValidarCampos() {

    $.validator.addMethod("isDecimal", function (value, element) {
        let regex = new RegExp(regexDecimal);
        if (regex.test(value)) {
            return true;
        }
        return false;
    });

    $("#formRegistro").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombre: {
                requiredSinEspacios: true
            },
            txtPeso: {
                requiredSinEspacios: true,
                isDecimal: true
            }
        },
        messages: {
            txtNombre: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre"),
            },
            txtPeso: {
                requiredSinEspacios: String.Format("Debes seleccionar {0}.", "el peso"),
                isDecimal: String.Format("Solo números decimales.")
            }
        }
    });
}
function linkFormatter(value, row) {
    return `<a href="javascript:EditRegistro(${row.Id})" title="Editar">${value}</a>`;
}
function opcionesFormatter(value, row) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:cambiarEstado(${value})" title="Cambiar estado"><i style="" id="cbOpcionEstado${value}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    return estado;
}
function EditRegistro(id) {
    $("#titleForm").html("Editar Relevancia");
    MdAddOrEditRegistro(true);
    let objRegistro = $table.bootstrapTable("getRowByUniqueId", id);
    $("#hdId").val(id);
    $("#hdCodigoInterno").val(objRegistro.CodigoInterno || "");
    $("#txtNombre").val(objRegistro.Nombre);
    $("#txtPeso").val(objRegistro.Peso);
    $("#cbActivo").prop("checked", objRegistro.Activo);
    $("#cbActivo").bootstrapToggle(objRegistro.Activo ? "on" : "off");
}
function ObtenerObjRegistro() {
    let data = {
        Id: $("#hdId").val(),
        Nombre: $("#txtNombre").val(),
        Peso: $("#txtPeso").val(),
        CodigoInterno: $("#hdCodigoInterno").val() == "" ? null : $("#hdCodigoInterno").val(),
        Activo: $("#cbActivo").prop("checked")
    };
    return data;
}
function MdAddOrEditRegistro(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    if (EstadoMd)
        $("#MdAddOrEditModal").modal(opcionesModal);
    else
        $("#MdAddOrEditModal").modal("hide");
}
function LimpiarMdAddOrEditRegistro() {
    $("#formRegistro").validate().resetForm();
    $(":input", "#formRegistro")
        .not(":button, :submit, :reset, :hidden")
        .val("")
        .removeAttr("checked")
        .removeAttr("selected");
    $("#hdId").val("0");
    $("#txtNombre").val("");
    $("#txtPeso").val("");
    $("#hdCodigoInterno").val("");
    $("#cbActivo").prop("checked", true);
    $("#cbActivo").bootstrapToggle("on");
}
function RegistrarAddOrEdit() {

    if ($("#formRegistro").valid()) {
        $("#btnRegistrar").button("loading");
        let data = ObtenerObjRegistro();
        $.ajax({
            url: URL_API_VISTA + "",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (result) {
                if (result) {
                    toastr.success("El registro se actualizó se realizo correctamente.", "Configurar Relevancia");
                    MdAddOrEditRegistro(false);
                    ListarRegistros();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function (data) {
                $("#btnRegistrar").button("reset");
            }
        });
    }
}
function OpenModal() {
    $("#titleForm").html("Nueva Relevancia");
    $("#hdId").val("0");
    MdAddOrEditRegistro(true);
}
function RefrescarListado() {
    ListarRegistros();
}
function cambiarEstado(id) {
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
                    url: `${URL_API_VISTA}/CambiarEstado?id=${id}`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se cambió el estado correctamente", "Configurar Relevancia");
                                ListarRegistros();
                            }
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "Configurar Relevancia");
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    },
                    complete: function (data) {
                    }
                });
            }
        }
    });
}