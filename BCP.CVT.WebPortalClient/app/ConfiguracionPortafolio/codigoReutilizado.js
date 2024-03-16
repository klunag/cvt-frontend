var $table = $("#tbl-codigo");

var DATA_EXPORTAR = {};
var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "Codigo";
var ULTIMO_SORT_ORDER = "asc";

const URL_API_VISTA = URL_API + "/Aplicacion";
const TITULO_MENSAJE = "Configuración de códigos a reutilizar";

$(function () {

    validarFormCodigo();
    listarCodigo();
    $("#btnNuevo").click(AddCodigo);
});

function buscarCodigo() {
    listarCodigo();
}

function listarCodigo() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/CodigoReutilizado/ListadoCodigo",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: ULTIMO_SORT_NAME,
        sortOrder: ULTIMO_SORT_ORDER,
        queryParams: function (p) {
            ULTIMO_PAGE_NUMBER = p.pageNumber;
            ULTIMO_REGISTRO_PAGINACION = p.pageSize;
            ULTIMO_SORT_NAME = p.sortName;
            ULTIMO_SORT_ORDER = p.sortOrder;

            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusCod").val());
            DATA_EXPORTAR.pageNumber = ULTIMO_PAGE_NUMBER;
            DATA_EXPORTAR.pageSize = ULTIMO_REGISTRO_PAGINACION;
            DATA_EXPORTAR.sortName = ULTIMO_SORT_NAME;
            DATA_EXPORTAR.sortOrder = ULTIMO_SORT_ORDER;

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

function validarFormCodigo() {
    $.validator.addMethod("existeCodigoReutilizado", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor.length == 2) {
            estado = ExisteCodigoInterfaz(valor);
        }
        return estado;
    });

    $("#formAddOrEditCod").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtCodigo: {
                required: true,
                minlength: 2,
                maxlength: 2,
                existeCodigoReutilizado: true,
            }
        },
        messages: {
            txtCodigo: {
                required: "El codigo es obligatorio",
                minlength: "El número de caracteres permitido es 2",
                maxlength: "El número de caracteres permitido es 2",
                existeCodigoReutilizado: "El código no puede ser reutilizado",
            },
        }
    });
}

function ExisteCodigoInterfaz(codigo) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/CodigoReutilizado/CodigoReservadoExists?codigo=${codigo}`,
        dataType: "json",
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

function limpiarMdAddOrEditCod() {
    LimpiarValidateErrores($("#formAddOrEditCod"));
    $("#txtCodigo").val('');
    $("#txtComentario").val('');
    $("#txtCodCod").val('');
}

function MdAddOrEditCod(EstadoMd) {
    limpiarMdAddOrEditCod();
    if (EstadoMd)
        $("#MdAddOrEditCod").modal(opcionesModal);
    else
        $("#MdAddOrEditCod").modal('hide');
}

function opciones(value, row, index) {
    let style_color = row.FlagActivo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.FlagActivo ? "check" : "unchecked";
    let btnEstado = `<a href="javascript:cambiarEstado(${row.Id}, ${row.FlagActivo})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    let btnEliminar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar registro"><i class="${style_color} glyphicon glyphicon-trash"></i></a>`;

    return btnEstado.concat("&nbsp;&nbsp;", btnEliminar);
}

function irEliminar(id) {
    let MENSAJE_VIEW = "¿Estás seguro(a) que deseas eliminar el registro seleccionado?";
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "Està seguro que desea eliminar el còdigo a reutilizar?",
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    url: `${URL_API_VISTA}/CodigoReutilizado/EliminarCodigo?Id=${id}`,
                    dataType: "json",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se eliminó el registro correctamente", TITULO_MENSAJE);
                                listarCodigo();
                            }
                        }
                    },
                    complete: function () {
                        waitingDialog.hide();
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    }
                });
            }
        }
    });
}

function AddCodigo() {
    $("#titleFormPat").html("Configurar Código Reservado");
    $("#hdCodigoId").val('');
    $("#txtCodCod").attr('readonly', false);
    MdAddOrEditCod(true);
}

function cambiarEstado(Id, estadoActual) {
    let msjOpcion = estadoActual ? "desactivar" : "activar";
    let MENSAJE_VIEW = `¿Estás seguro(a) que deseas ${msjOpcion} el registro seleccionado?`;
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "Esta seguro que desea cambiar el estado de este registro?",
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                $.ajax({
                    type: 'GET',
                    contentType: "application/json; charset=utf-8",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    url: `${URL_API_VISTA}/CodigoReutilizado/CambiarEstadoCodigo?Id=${Id}`,
                    dataType: "json",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                listarCodigo();
                            }
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                    },
                    complete: function () {
                        waitingDialog.hide();
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    }
                });
            }
        }
    });
}

function guardarAddOrEditCodigo() {
    if ($("#formAddOrEditCod").valid()) {
        $("#btnRegCod").button("loading");

        var codigo = {};
        codigo.Id = ($("#hdCodigoId").val() === "") ? -1 : parseInt($("#hdCodigoId").val());
        codigo.Comentarios = $.trim($("#txtComentario").val());
        codigo.Codigo = $.trim($("#txtCodigo").val());
        codigo.FlagActivo = true;
        codigo.FlagEliminado = false;

        $.ajax({
            url: URL_API_VISTA + "/CodigoReutilizado/AddOrEdit",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(codigo),
            dataType: "json",
            success: function (result) {
                if (result !== null) {
                    toastr.success("Registrado correctamente", TITULO_MENSAJE);
                }
                else {
                    toastr.success("Hubo un inconveniente al registrar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                }

            },
            complete: function () {
                $("#btnRegCod").button("reset");
                $("#txtBusCod").val('');
                $table.bootstrapTable('refresh');
                MdAddOrEditCod(false);
            },
            error: function (result) {
            }
        });
    }
}