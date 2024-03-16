var $table = $("#tbl-parametricas");
var URL_API_VISTA = URL_API + "/Parametricas";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Configuración de paramétricas";

$(function () {
    //FormatoCheckBox($("#divActAmb"), 'cbActAmb');
    //InitHora();
    cargarCombos();
    validarFormParametricas();
    //validarFormConfigurarAmbiente();
    listarParametricas();
});

function buscarParametricas() {
    listarParametricas();
}

function listarParametricas() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Tabla',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusPar").val());
            DATA_EXPORTAR.tabla = $("#ddlTablaI").val() !== "-1" ? $("#ddlTablaI").val() : "";
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.ParametricaId = id_parametrica;

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

function validarFormParametricas() {

    $.validator.addMethod('positiveNumber',
        function (value) {
            return Number(value) >= 0;
        }
    );

    //$.validator.addMethod("existeCodigo", function (value, element) {
    //    //debugger;
    //    let estado = true;
    //    if ($.trim(value) !== "") {
    //        let estado = false;
    //        estado = !ExisteCodigo();
    //        //debugger;
    //        return estado;
    //    }
    //    return estado;
    //});

    $("#formAddOrEditPar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlTabla: {
                requiredSelect: true
            },
            txtDescripcion: {
                requiredSelect: true
            },
            txtValor: {
                requiredSinEspacios: true
            }
        },
        messages: {
            ddlTabla: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            txtDescripcion: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            txtValor: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el valor")
            }
        }
    });
}

function limpiarMdAddOrEditPar() {
    LimpiarValidateErrores($("#formAddOrEditPar"));
    $("#txtCodPar").val('');
    $("#txtEntidad").val('');
    $("#ddlTabla").val("-1");
    $("#txtDescripcion").val("-1");
    $("#txtValor").val('');
    $("#cbActPar").prop('checked', true);
    $("#cbActPar").bootstrapToggle('on');
}

function MdAddOrEditPar(EstadoMd) {
    limpiarMdAddOrEditPar();
    if (EstadoMd)
        $("#MdAddOrEditPar").modal(opcionesModal);
    else
        $("#MdAddOrEditPar").modal('hide');
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:editarParametricas(${row.Id})" title="Editar">${value}</a>`;
}

//function opciones(value, row, index) {
//    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
//    let type_icon = row.Activo ? "check" : "unchecked";
//    let estado = `<a href="javascript:cambiarEstado(${row.Id})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

//    return estado;
//}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let btnEstado = `<a href="javascript:cambiarEstado(${row.Id})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    let btnEliminar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar registro"><i class="${style_color} glyphicon glyphicon-trash"></i></a>`;

    return btnEstado.concat("&nbsp;&nbsp;", btnEliminar);
}

function AddParametricas() {
    $("#titleFormPat").html("Configurar parametricas");
    $("#hdParametricasId").val('');
    $("#txtCodPar").attr('readonly', false);
    //$("#hdNumTecAsoc").val("0");
    MdAddOrEditPar(true);
}

function editarParametricas(Id) {
    $("#txtCodPar").attr('readonly', true);
    $("#titleFormPar").html("Configurar paramétricas");
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            MdAddOrEditPar(true);

            $("#hdParametricasId").val(result.Id);
            //$("#hdNumTecAsoc").val(NumTecAsociadas);
            $("#txtCodPar").val(result.Id);
            $("#ddlTabla").val(result.ParametricaId);
            $("#txtDescripcion").val(result.Descripcion);
            $("#txtValor").val(result.Valor);
          
            //$("#cbActAmb").prop('checked', result.Activo);
            //$('#cbActAmb').bootstrapToggle(result.Activo ? 'on' : 'off');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
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
                                listarParametricas();
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
                        //$("#txtBusTipo").val('');
                        //$table.bootstrapTable('refresh');
                    }
                });
            }
        }
    });
    //}
}

function guardarAddOrEditParametricas() {
    if ($("#formAddOrEditPar").valid()) {
        $("#btnRegPar").button("loading");

        var parametrica = {};
        parametrica.Id = ($("#hdParametricasId").val() === "") ? -1 : parseInt($("#hdParametricasId").val());
        parametrica.ParametricaId = $("#ddlTabla").val();
        parametrica.Descripcion = $("#txtDescripcion").val();
        parametrica.Valor = $("#txtValor").val();
        parametrica.Tabla = '';

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(parametrica),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
            },
            complete: function () {
                $("#btnRegPar").button("reset");
                $("#txtBusPar").val('');
                $table.bootstrapTable('refresh');
                MdAddOrEditPar(false);
            },
            error: function (result) {
                //ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

//function ExisteCodigo() {
//    let estado = false;
//    let codigo = parseInt($("#txtCodAmb").val());
//    let id = $("#hdAmbienteId").val() === "" ? 0 : parseInt($("#hdAmbienteId").val());
//    $.ajax({
//        type: "GET",
//        contentType: "application/json; charset=utf-8",
//        url: URL_API + "/Ambiente" + `/ExisteCodigoByFiltro?codigo=${codigo}&id=${id}`,
//        dataType: "json",
//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    estado = dataObject;
//                }
//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//    return estado;
//}

function cargarCombos() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ListarCombos?idParametrica=${id_parametrica}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Entidades, $("#ddlTabla"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Tablas, $("#ddlTablaI"), TEXTO_TODAS);
                    SetItems(dataObject.Tablas, $("#txtDescripcion"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function irEliminar(id) {
    let MENSAJE_VIEW = "¿Estás seguro(a) que deseas eliminar el registro seleccionado?";
    let dataRetorno = ExisteRelacionPortafolio(id, ENTIDAD_MANTENIMIENTO);
    let MENSAJE = `${dataRetorno.MensajeAPI}, ${MENSAJE_VIEW}.`;

    if (dataRetorno.FlagSeEjecuta) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/EliminarRegistroByConfiguracion?id=${id}&idConfiguracion=${ENTIDAD_MANTENIMIENTO}`,
                        type: "GET",
						beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    waitingDialog.hide();
                                    toastr.success("Se eliminó el registro correctamente", TITULO_MENSAJE);
                                    listarParametricas();
                                }
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
            }
        });
    } else {
        MENSAJE = `${dataRetorno.MensajeAPI}. No es posible eliminar`;
        MensajeGeneralAlert(TITULO_MENSAJE, MENSAJE);
    }
}