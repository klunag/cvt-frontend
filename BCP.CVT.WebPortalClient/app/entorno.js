var $table = $("#tblEntorno");
var URL_API_VISTA = URL_API + "/Entorno";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Entorno de arquetipos";

$(function () {
    FormatoCheckBox($("#divActEnt"), 'cbActEnt');
 
    validarForm();
    listarEntornos();
});

function validarForm() {
    $("#formAddOrEdit").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomEnt: {
                requiredSinEspacios: true
            },
            txtDesEnt: {
                requiredSinEspacios: true
            }         
        },
        messages: {
            txtNomEnt: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtDesEnt: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            }         
        }
    });
}

function limpiarMdAddOrEdit() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    $("#txtNomEnt").val('');
    $("#txtDesEnt").val('');
    $("#cbActEnt").prop('checked', true);
    $("#cbActEnt").bootstrapToggle('on');
}

function MdAddOrEdit(EstadoMd) {
    limpiarMdAddOrEdit();
    if (EstadoMd)
        $("#MdAddOrEdit").modal(opcionesModal);
    else
        $("#MdAddOrEdit").modal('hide');
}

function buscarEntorno() {
    listarEntornos();
}

function listarEntornos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
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
            DATA_EXPORTAR.nombre = $.trim($("#txtBusEntorno").val());
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

function AddEntorno() {
    $("#titleForm").html("Nuevo Entorno");
    $("#hdEntornoId").val('');
    MdAddOrEdit(true);
}

function editarEntorno(Id) {
    $("#titleForm").html("Editar Entorno");
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    MdAddOrEdit(true);
                    $("#hdEntornoId").val(dataObject.Id);
                    $("#txtNomEnt").val(dataObject.Nombre);
                    $("#txtDesEnt").val(dataObject.Descripcion);
                    $("#cbActEnt").prop('checked', dataObject.Activo);
                    $("#cbActEnt").bootstrapToggle(dataObject.Activo ? 'on' : 'off');
                }
            }          
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function GuardarAddOrEditEnt() {
    if ($("#formAddOrEdit").valid()) {
        $("#btnRegEnt").button("loading");

        var entorno = {};
        entorno.Id = ($("#hdEntornoId").val() === "") ? 0 : parseInt($("#hdEntornoId").val());
        entorno.Nombre = $("#txtNomEnt").val().trim();
        entorno.Descripcion = $("#txtDesEnt").val();
        entorno.Activo = $("#cbActEnt").prop("checked");

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(entorno),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        if (dataObject > 0) {
                            toastr.success("Registrado correctamente", TITULO_MENSAJE);
                            listarEntornos();
                        }                                           
                    }
                }
            },
            complete: function () {
                $("#btnRegEnt").button("reset");
                $("#txtBusEnt").val('');
                MdAddOrEdit(false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:editarEntorno(${row.Id})" title="Editar">${value}</a>`;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:cambiarEstado(${row.Id})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return estado;
}

function cambiarEstado(Id) {
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
                        url: `${URL_API_VISTA}/CambiarEstado?Id=${Id}`,
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    console.log(dataObject);
                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    $("#txtBusEnt").val('');
                                    listarEntornos();
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