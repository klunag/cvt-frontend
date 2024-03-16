var $table = $("#tblRegistro");
var URL_API_VISTA = URL_API + "/RoadMap";
$(function () {
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({ data: [] });
    ListarRegistros();
    InitspectrumColor();
    ValidarCampos();
});
function InitspectrumColor() {
    $(".form-color").spectrum({
        //allowEmpty: true,
        color: "#ffffff", // #0000ff
        showInput: true,
        className: "full-spectrum",
        containerClassName: "awesome",
        replacerClassName: "awesome",
        showInitial: true,
        showPalette: true,
        preferredFormat: "hex",
        chooseText: "Aceptar",
        cancelText: "Cancelar",
        hide: function (tinycolor) {
            //console.log("hide", tinycolor);
        },
        change: function (tinycolor) {
            //console.log("change", tinycolor);
        }
    });
}
function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
        method: "POST",
        pagination: true,

        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
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
function RefrescarListado() {
    let filtro = $("#txtFiltro").val();
    $("#hdFiltro").val(filtro);
    $table.bootstrapTable("refresh");
}
function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        CONFIG_BOOTBOX_ALERT = {};
        CONFIG_BOOTBOX_ALERT.size = "small";
        CONFIG_BOOTBOX_ALERT.title = "Relación de Tecnologías";
        CONFIG_BOOTBOX_ALERT.message = "No hay datos para exportar.";
        CONFIG_BOOTBOX_ALERT.buttons = { ok: { label: 'Aceptar', className: 'btn-primary' } };
        bootbox.alert(CONFIG_BOOTBOX_ALERT);
        return false;
    }
    let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
    window.location.href = url;
}
function colorFormatter(value, row) {
    return `<button href="javascript: void(0)" onclick="EditarColor(${row.Id})" style="background-color: ${value};width: 20px;height: 20px;" ></button>`;
}
function EditarColor(Id) {
    $("#titleForm").html("Editar RoadMap");
    MdAddOrEditRegistro(true);
    let objRegistro = $table.bootstrapTable("getRowByUniqueId", Id);
    $("#hdId").val(Id);
    $("#txtNombre").val(objRegistro.Nombre);
    $("#txtColor").val(objRegistro.Color);
    $("#hdColor").val(objRegistro.Color);
    $(".sp-preview-inner").css("background-color", objRegistro.Color);
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
    $("#hdId").val("");
    $("#txtNombre").val("");
    $("#txtColor").val("");
    $("#hdColor").val("");
    $(".sp-preview-inner").css("background-color", "#ffffff");
    toastr.clear();
}
function GuardarRegistro() {
    if ($("#formRegistro").valid()) {

        let data = {
            Id: $("#hdId").val(),
            Nombre: $("#txtNombre").val(),
            Color: $("#txtColor").val(),
        };

        $.ajax({
            url: URL_API_VISTA + "",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (result) {
                if (result) {
                    toastr.success("El registro se actualizó se realizo correctamente.", "RoadMap");
                    MdAddOrEditRegistro(false);
                    ListarRegistros();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function (data) {
            }
        });
    }
}
function ValidarCampos() {
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
            txtColor: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtNombre: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre"),
            },
            txtColor: {
                requiredSinEspacios: String.Format("Debes seleccionar {0}.", "el color"),
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtColor") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}