var $table = $("#tbl-pci");
var $tblBT = $("#tblBT");
var DATA_EXPORTAR = {};
var DATA_EXPORTAR_HISTO = {};
var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "Nombre";
var ULTIMO_SORT_ORDER = "asc";

const URL_API_VISTA = URL_API + "/applicationportfolio/PCI";
const TITULO_MENSAJE = "Configuración de tipos de PCI DSS";
const FILTRO_ACCION = { INSERT: "1", UPDATE: "2", DELETE: "3", CREATE: "4" };

$(function () {
    //FormatoCheckBox($("#divActAmb"), 'cbActAmb');
    //InitHora();

    validarFormPCI();
    //validarFormConfigurarAmbiente();
    listarPCI();
    //FormatoCheckBox($("#divFlagUserIT"), "ckbFlagUserIT");
    //$("#btnHistorico").click(listarHistoricoCambios);
    $("#btnNuevo").click(AddPCI);
});

function buscarPCI() {
    listarPCI();
}

function listarPCI() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListadoPCI",
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
            DATA_EXPORTAR.nombre = $.trim($("#txtBusPCI").val());
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



function validarFormPCI() {
    $.validator.addMethod('positiveNumber',
        function (value) {
            return Number(value) >= 0;
        }
    );

    //$.validator.addMethod("existeNombreEntidad", function (value, element) {
    //    let estado = true;
    //    let id = $("#hdPCIId").val() === "" ? -1 : parseInt($("#hdPCIId").val());
    //    let txtValor = $.trim(value);
    //    if (txtValor !== "" && txtValor.length > 2)
    //        estado = !ExisteNombreEntidadByConfiguracion(id, txtValor, ENTIDAD_MANTENIMIENTO);

    //    return estado;
    //});

    $("#formAddOrEditAct").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtDescripcion: {
                requiredSinEspacios: true
            },
            txtNombre: {
                requiredSinEspacios: true
                //existeNombreEntidad: true
            }
        },
        messages: {
            txtDescripcion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
            txtNombre: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
                //existeNombreEntidad: "El nombre ya existe"
            }
        }
    });
}

function limpiarMdAddOrEditPCI() {
    LimpiarValidateErrores($("#formAddOrEditPCI"));
    $("#txtCodPCI").val('');
    $("#txtNombre").val('');

    $("#txtDescripcion").val('');

}

function MdAddOrEditPCI(EstadoMd) {
    limpiarMdAddOrEditPCI();
    if (EstadoMd)
        $("#MdAddOrEditPCI").modal(opcionesModal);
    else
        $("#MdAddOrEditPCI").modal('hide');
}

function linkFormatter(value, row, index) {
    let retorno = value;
    if (row.FlagActivo) {
        retorno = `<a href="javascript:editarPCI(${row.Id})" title="Editar">${value}</a>`;
    }
    return retorno;
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
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        type: "GET",
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Se eliminó el registro correctamente", TITULO_MENSAJE);
                                    listarPCI();
                                }
                            }
                        },
                        complete: function () {
                            waitingDialog.hide();
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


function AddPCI() {
    $("#titleFormPat").html("Configurar tipo de PCI DSS");
    $("#hdPCIId").val('');
    $("#txtCodPCI").attr('readonly', false);
    //$("#hdNumTecAsoc").val("0");
    MdAddOrEditPCI(true);
}

function editarPCI(Id) {
    $("#txtCodPCI").attr('readonly', true);
    $("#titleFormPCI").html("Editar registro");
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "GET",
        dataType: "json",
        success: function (result) {
            MdAddOrEditPCI(true);

            $("#hdPCIId").val(result.Id);
            //$("#hdNumTecAsoc").val(NumTecAsociadas);
            $("#txtCodPCI").val(result.Id);
         
            $("#txtDescripcion").val(result.Descripcion);
            $("#txtNombre").val(result.Nombre);


        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function cambiarEstado(Id, estadoActual) {
    let msjOpcion = estadoActual ? "desactivar" : "activar";
    let MENSAJE_VIEW = `¿Estás seguro(a) que deseas ${msjOpcion} el registro seleccionado?`;
    let dataRetorno = ExisteRelacionPortafolio(Id, ENTIDAD_MANTENIMIENTO);
    let MENSAJE = `${dataRetorno.MensajeAPI}, ${MENSAJE_VIEW}.`;

    if (dataRetorno.FlagSeEjecuta) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    $.ajax({
                        type: 'GET',
                        contentType: "application/json; charset=utf-8",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        url: `${URL_API_VISTA}/CambiarEstadoPCI?Id=${Id}`,
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    listarActivos();
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
    } else {
        MENSAJE = `${dataRetorno.MensajeAPI}. No es posible cambiar el estado`;
        MensajeGeneralAlert(TITULO_MENSAJE, MENSAJE);
    }
}

function guardarAddOrEditPCI() {
    if ($("#formAddOrEditPCI").valid()) {
        $("#btnRegPCI").button("loading");

        var activos = {};
        activos.Id = ($("#hdPCIId").val() === "") ? -1 : parseInt($("#hdPCIId").val());
        activos.Descripcion = $.trim($("#txtDescripcion").val());
        activos.Nombre = SetCustomName($("#txtNombre").val());

        $.ajax({
            url: URL_API_VISTA + "/AddOrEdit",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(activos),
            dataType: "json",
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
            },
            complete: function () {
                $("#btnRegPCI").button("reset");
                $("#txtBusPCI").val('');
                $table.bootstrapTable('refresh');
                MdAddOrEditPCI(false);
            },
            error: function (result) {
                //ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}





function dateFormat(value, row, index) {
    if (value != null)
        return moment(value).format('DD/MM/YYYY HH:mm:ss');
    else return "-";
}