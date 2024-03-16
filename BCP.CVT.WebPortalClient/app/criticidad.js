var $table = $("#tbl-criticidad");
var URL_API_VISTA = URL_API + "/Criticidad";
var DATA_EXPORTAR = {};

$(function () {
    FormatoCheckBox($("#divActCrit"), 'cbActCrit');
    //$("#cbActTipo").change(function () {
    //    $("#formAddOrEditTipo").validate().resetForm();
    //});
    //validarFormAmbiente();
    validarFormCriticidad();
    listarCriticidad();
});

function buscarCriticidad() {
    listarCriticidad();
}

function listarCriticidad() {
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
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusCrit").val());
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

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:cambiarEstado(${row.Id})" title="Cambiar estado"><i style="" id="cbOpcCrit${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    return estado;
}

function AddAmbiente() {
    $("#titleFormCrit").html("Configurar criticidad");
    $("#hdCriticidadId").val('');
    //$("#txtCodAmb").attr('readonly', false);
    //$("#hdNumTecAsoc").val("0");
    MdAddOrEditAmb(true);
}


function MdAddOrEditCrit(EstadoMd) {
    limpiarMdAddOrEditCrit();
    
    //$("#formAddOrEditTipo").validate().resetForm();
    if (EstadoMd)
        $("#MdAddOrEditCrit").modal(opcionesModal);
    else
        $("#MdAddOrEditCrit").modal('hide');
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:editarCriticidad(${row.Id})" title="Editar">${value}</a>`;
}

function editarCriticidad(CriticidadId) {
    //$("#txtCodAmb").attr('readonly', true);
    $("#titleFormCrit").html("Configurar criticidades");
    $.ajax({
        url: URL_API_VISTA + "/" + CriticidadId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditCrit(true);

            $("#hdCriticidadId").val(result.Id);
            //$("#hdNumTecAsoc").val(NumTecAsociadas);
            //$("#txtCodAmb").val(result.Id);
            $("#txtNombreCrit").val(result.DetalleCriticidad);
            $("#txtPrefCrit").val(result.PrefijoBase);
            $("#txtPrioridadCrit").val(result.Prioridad);
            $("#cbActCrit").prop('checked', result.Activo);
            $('#cbActCrit').bootstrapToggle(result.Activo ? 'on' : 'off');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function AddCriticidad() {
    $("#titleFormCrit").html("Configurar criticidades");
    $("#hdCriticidadId").val('');
    //$("#txtCodAmb").attr('readonly', false);
    //$("#hdNumTecAsoc").val("0");
    MdAddOrEditCrit(true);
}

function limpiarMdAddOrEditCrit() {
    //$("#txtCodAmb").val('');
    LimpiarValidateErrores($("#formAddOrEditCrit"));
    $("#txtNombreCrit").val('');
    $("#txtPrefCrit").val('');
    $("#txtPrioridadCrit").val('');
    $("#cbActAmb").prop('checked', true);
    $("#cbActAmb").bootstrapToggle('on');
}

function guardarAddOrEditCriticidad() {
    if ($("#formAddOrEditCrit").valid()) {
        $("#btnRegCrit").button("loading");

        var criticidad = {};
        criticidad.Id = ($("#hdCriticidadId").val() === "") ? -1 : parseInt($("#hdCriticidadId").val());
        //criticidad.Codigo = parseInt($("#txtCodAmb").val());
        criticidad.DetalleCriticidad = $("#txtNombreCrit").val();
        criticidad.PrefijoBase = $("#txtPrefCrit").val();
        criticidad.Prioridad = $("#txtPrioridadCrit").val();
        criticidad.Activo = $("#cbActCrit").prop("checked");

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(criticidad),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", "Configurar criticidades");
            },
            complete: function () {
                $("#btnRegCrit").button("reset");
                $("#txtBusCrit").val('');
                listarCriticidad();
                MdAddOrEditCrit(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
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
                                toastr.success("Se cambió el estado correctamente", "Configurar criticidades");
                                listarCriticidad(); 
                            }                                                   
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "Configurar criticidades");
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    },
                    complete: function (data) {
                        //$("#txtBusTipo").val('');
                        //$table.bootstrapTable('refresh');
                    }
                });
            } 
        }
    });
}

function validarFormCriticidad() {

    $("#formAddOrEditCrit").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtPrioridadCrit: {
                requiredSinEspacios: true,
                number: true
               
            },
            txtNombreCrit: {
                requiredSinEspacios: true
            },
            txtPrefCrit: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtPrioridadCrit: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la prioridad"),
                number: "Debes ingresar número",
            },
            txtNombreCrit: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtPrefCrit: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el prefijo")
            }
        }
    });
}