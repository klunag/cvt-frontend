var $table = $("#tblDomRed");
var URL_API_VISTA = URL_API + "/DominioRed";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Configuración de dominios corporativos";

$(function () {
    FormatoCheckBox($("#divActDomRed"), 'cbActDomRed');
    //validarFormTipo();
    validarAddOrEditForm();
    listarDominioRed();
});

function validarAddOrEditForm() {

    $("#formAddOrEdit").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomDomRed: {
                requiredSinEspacios: true
            },
            txtEqDomRed: {
                requiredSinEspacios: true
            }     
        },
        messages: {
            txtNomDomRed: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtEqDomRed: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "las equivalencias")
            }           
        }
    });
}

    function limpiarAddOrEditModal() {
        LimpiarValidateErrores($("#formAddOrEdit"));
        $("#txtNomDomRed").val('');
        $("#txtEqDomRed").val('');
        $("#cbActDomRed").prop('checked', true);
        $("#cbActDomRed").bootstrapToggle('on');
    }

    function irAddOrEditModal(EstadoMd) {
        limpiarAddOrEditModal();
        if (EstadoMd)
            $("#MdAddOrEdit").modal(opcionesModal);
        else
            $("#MdAddOrEdit").modal('hide');
    }

    function buscarDominioRed() {
        listarDominioRed();
    }

    function listarDominioRed() {
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
                DATA_EXPORTAR.nombre = $.trim($("#txtBusDomRed").val());
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

function AddDomRed() {
    $("#titleForm").html("Configurar dominios corporativos");
    $("#hdDomRedId").val('');
    irAddOrEditModal(true);
}

function editarDomRed(Id) {
    $("#titleForm").html("Configurar dominios corporativos");
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    irAddOrEditModal(true);
                    $("#hdDomRedId").val(dataObject.Id);
                    $("#txtNomDomRed").val(dataObject.Nombre);
                    $("#txtEqDomRed").val(dataObject.Equivalencias);
                    $("#cbActDomRed").prop('checked', dataObject.Activo);
                    $("#cbActDomRed").bootstrapToggle(dataObject.Activo ? 'on' : 'off');       
                }
            }          
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function guardarAddOrEditDomRed() {
    if ($("#formAddOrEdit").valid()) {
        $("#btnRegDomRed").button("loading");

        var domRed = {};
        domRed.Id = ($("#hdDomRedId").val() === "") ? 0 : parseInt($("#hdDomRedId").val());
        domRed.Nombre = $("#txtNomDomRed").val().trim();
        domRed.Equivalencias = $("#txtEqDomRed").val();
        domRed.Activo = $("#cbActDomRed").prop("checked");      

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(domRed),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {                     
                        toastr.success("Registrado correctamente", TITULO_MENSAJE);
                        listarDominioRed();
                    }
                }            
            },
            complete: function () {
                $("#btnRegDomRed").button("reset");               
                irAddOrEditModal(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:editarDomRed(${row.Id})" title="Editar">${value}</a>`;
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
                                toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                $("#txtBusDomRed").val('');
                                listarDominioRed();
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