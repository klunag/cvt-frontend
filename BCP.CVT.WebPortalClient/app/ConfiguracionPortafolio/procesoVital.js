var $table = $("#tblRegistro");
var DATA_EXPORTAR = {};

const TITULO_MENSAJE = "Procesos vitales";
const URL_API_VISTA = URL_API + "/Aplicacion/ConfiguracionPortafolio";

$(function () {
    FormatoCheckBox($("#divFlagProcesoVital"), "ckbProcesoVital");
    ListarRegistros();
    validarFormRegistro();

    InitAcciones();
});

function InitAcciones() {
    $("#btnBuscar").click(RefrescarListado);
    $("#btnNuevo").click(AddRegistro);
    $("#btnRegistrar").click(GuardarRegistro);
}

function RefrescarListado() {
    ListarRegistros();
}

function AddRegistro() {
    $("#title-md").html("Nuevo Proceso Vital");
    LimpiarModal();
    OpenCloseModal($("#mdRegistro"), true);
}

function LimpiarModal() {
    LimpiarValidateErrores($("#formAddOrEditRegistro"));
    $(":input", "#formAddOrEditRegistro").val("");
    $("#ckbProcesoVital").prop("checked", false);
    $("#ckbProcesoVital").bootstrapToggle("off");
}

function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListarProcesoVital",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
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

function GuardarRegistro() {
    if ($("#formAddOrEditRegistro").valid()) {
        $("#btnRegistrar").button("loading");

        let data = {
            Id: ($("#hdRegistroId").val() === "") ? 0 : parseInt($("#hdRegistroId").val()),
            Nombre: $.trim($("#txtNombre").val()),
            Descripcion: $.trim($("#txtDescripcion").val()),
            FlagProcesoVital: $("#ckbProcesoVital").prop("checked"),
        };

        $.ajax({
            url: URL_API_VISTA + "/AddOrEditProcesoVital",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            data: JSON.stringify(data),
            dataType: "json",
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                RefrescarListado();
            },
            complete: function () {
                $("#btnRegistrar").button("reset");
                OpenCloseModal($("#mdRegistro"), false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function EditarRegistro(_id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#title-md").html("Editar Proceso Vital");
    $.ajax({
        url: URL_API_VISTA + `/GetProcesoVitalById?id=${_id}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "GET",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;
                    LimpiarModal();
                    OpenCloseModal($("#mdRegistro"), true);

                    $("#hdRegistroId").val(data.Id);
                    $("#txtNombre").val(data.Nombre);
                    $("#txtDescripcion").val(data.Descripcion);
                    $("#ckbProcesoVital").prop('checked', data.FlagProcesoVital);
                    $("#ckbProcesoVital").bootstrapToggle(data.FlagProcesoVital ? 'on' : 'off');
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function validarFormRegistro() {
    $.validator.addMethod("existeNombreEntidad", function (value, element) {
        let estado = true;
        let id = $("#hdRegistroId").val() === "" ? 0 : parseInt($("#hdRegistroId").val());
        let txtValor = $.trim(value);
        if (txtValor !== "" && txtValor.length > 2)
            estado = !ExisteNombreEntidadByConfiguracion(id, txtValor, ENTIDAD_MANTENIMIENTO);

        return estado;
    });

    $("#formAddOrEditRegistro").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombre: {
                requiredSinEspacios: true,
                existeNombreEntidad: true
            },
            //txtDescripcion: {
            //    requiredSinEspacios: true
            //}
        },
        messages: {
            txtNombre: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre"),
                existeNombreEntidad: "El nombre ya existe"
            },
            //txtDescripcion: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            //}
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDistribuida" || element.attr('name') === "txtMainframe"
                || element.attr('name') === "txtPaqueteSaas" || element.attr('name') === "txtUserItMacro"
                || element.attr('name') === "txtUserItWeb" || element.attr('name') === "txtUserItCliente") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function linkFormatter(value, row, index) {
    let option = value;
    if (row.Activo) {
        option = `<a href="javascript:EditarRegistro(${row.Id})" title="Editar registro">${value}</a>`;
    }
    return option;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let btnEstado = `<a href="javascript:CambiarEstadoRegistro(${row.Id}, ${row.Activo})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    let btnEliminar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar registro"><i class="${style_color} glyphicon glyphicon-trash"></i></a>`;

    return btnEstado.concat("&nbsp;&nbsp;", btnEliminar);
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
                                    ListarRegistros();
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

function CambiarEstadoRegistro(id, estadoActual) {
    let msjOpcion = estadoActual ? "desactivar" : "activar";
    let MENSAJE_VIEW = `¿Estás seguro(a) que deseas ${msjOpcion} el registro seleccionado?`;
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
                        url: URL_API_VISTA + `/CambiarEstadoProcesoVital?id=${id}&estadoActual=${estadoActual}`,
                        type: "GET",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    waitingDialog.hide();
                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    RefrescarListado();
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
        MENSAJE = `${dataRetorno.MensajeAPI}. No es posible cambiar el estado`;
        MensajeGeneralAlert(TITULO_MENSAJE, MENSAJE);
    }
}