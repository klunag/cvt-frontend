var $table = $("#tbl-tipos");
var URL_API_VISTA = URL_API + "/TipoArquetipo";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Tipos de arquetipos";

$(function () {
    FormatoCheckBox($("#divActTipo"), 'cbActTipo');

    validarFormTipo();
    listarTipos();
});

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

function limpiarMdAddOrEditTipo() {
    LimpiarValidateErrores($("#formAddOrEditTipo"));
    $("#txtNomTipo").val('');
    $("#txtDesTipo").val('');
    $("#cbActTipo").prop('checked', true);
    $("#cbActTipo").bootstrapToggle('on');
}

function MdAddOrEditTipo(EstadoMd) {
    limpiarMdAddOrEditTipo();
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

        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
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
    $("#titleFormTipo").html("Nuevo Tipo");
    $("#hIdTipo").val('');
    MdAddOrEditTipo(true);
}

function editarTipo(TipoId) {
    $("#titleFormTipo").html("Editar Tipo");
    $.ajax({
        url: URL_API_VISTA + "/" + TipoId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    MdAddOrEditTipo(true);

                    $("#hIdTipo").val(dataObject.Id);                
                    $("#txtNomTipo").val(dataObject.Nombre);
                    $("#txtDesTipo").val(dataObject.Descripcion);
                    $("#cbActTipo").prop('checked', dataObject.Activo);
                    $("#cbActTipo").bootstrapToggle(dataObject.Activo ? 'on' : 'off');
                }
            }         
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
    
        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            data: JSON.stringify(tipo),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            contentType: "application/json; charset=utf-8",
            success: function (dataObject, textStatus) { 
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        toastr.success("Registrado correctamente", TITULO_MENSAJE);
                        $("#txtBusTipo").val('');
                        listarTipos();
                    }
                }              
            },
            complete: function () {
                $("#btnRegTipo").button("reset");                           
                MdAddOrEditTipo(false);
            },
            error: function (result) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:editarTipo(${row.Id})" title="Editar">${value}</a>`;
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