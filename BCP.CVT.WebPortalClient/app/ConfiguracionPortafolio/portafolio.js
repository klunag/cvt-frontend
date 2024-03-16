var $table = $("#tbl-activos");
var $tblBT = $("#tblBT");
var DATA_EXPORTAR = {};
var DATA_EXPORTAR_HISTO = {};
var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "Nombre";
var ULTIMO_SORT_ORDER = "asc";

const URL_API_VISTA = URL_API + "/Aplicacion/TAI";
const TITULO_MENSAJE = "Configuración de tipos de activos de información";
const FILTRO_ACCION = { INSERT: "1", UPDATE: "2", DELETE: "3", CREATE: "4" };

$(function () {
    //FormatoCheckBox($("#divActAmb"), 'cbActAmb');
    //InitHora();
    cargarCombos();
    validarFormActivos();
    //validarFormConfigurarAmbiente();
    listarActivos();
    FormatoCheckBox($("#divFlagUserIT"), "ckbFlagUserIT");
    FormatoCheckBox($("#divFlagExterna"), "ckbFlagExterna");
    $("#btnHistorico").click(listarHistoricoCambios);
    $("#btnNuevo").click(AddActivos);
});

function buscarActivos() {
    listarActivos();
}

function listarActivos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListadoActivos",
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
            DATA_EXPORTAR.nombre = $.trim($("#txtBusAct").val());
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

function listarHistoricoCambios() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblBT.bootstrapTable('destroy');
    $tblBT.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListarHistoricoModificaciones",
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
            DATA_EXPORTAR_HISTO = {};
            DATA_EXPORTAR_HISTO.Accion = ""; //filtroAccion();
            DATA_EXPORTAR_HISTO.Entidad = ""; //$.trim($("#txtFilEntidad").val() || "");
            DATA_EXPORTAR_HISTO.FechaActualizacion = null; //$("#txtFilFechaActualizacion").val() !== "" ? castDate($("#txtFilFechaActualizacion").val()) : null;    //$("#txtFilFechaActualizacion").val();
            DATA_EXPORTAR_HISTO.pageNumber = p.pageNumber;
            DATA_EXPORTAR_HISTO.pageSize = p.pageSize;
            DATA_EXPORTAR_HISTO.sortName = p.sortName;
            DATA_EXPORTAR_HISTO.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_HISTO);
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
        onLoadSuccess: function (data) {
            $("#mdBT").modal(opcionesModal);
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
    });
}

function validarFormActivos() {
    $.validator.addMethod('positiveNumber',
        function (value) {
            return Number(value) >= 0;
        }
    );

    $.validator.addMethod("existeNombreEntidad", function (value, element) {
        let estado = true;
        let id = $("#hdActivosId").val() === "" ? -1 : parseInt($("#hdActivosId").val());
        let txtValor = $.trim(value);
        if (txtValor !== "" && txtValor.length > 2)
            estado = !ExisteNombreEntidadByConfiguracion(id, txtValor, ENTIDAD_MANTENIMIENTO);

        return estado;
    });

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
                requiredSinEspacios: true,
                existeNombreEntidad: true
            }
        },
        messages: {
            txtDescripcion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
            txtNombre: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre"),
                existeNombreEntidad: "El nombre ya existe"
            }
        }
    });
}

function limpiarMdAddOrEditAct() {
    LimpiarValidateErrores($("#formAddOrEditAct"));
    $("#txtCodAct").val('');
    $("#txtNombre").val('');
    $("#ddlTabla").val(-1);
    $("#ddlFlujoRegistro").val(-1);
    $("#txtDescripcion").val('');
    $("#ckbFlagUserIT").prop('checked', true);
    $("#ckbFlagUserIT").bootstrapToggle('on');
    $("#ckbFlagExterna").prop('checked', true);
    $("#ckbFlagExterna").bootstrapToggle('on');
}

function MdAddOrEditAct(EstadoMd) {
    limpiarMdAddOrEditAct();
    if (EstadoMd)
        $("#MdAddOrEditAct").modal(opcionesModal);
    else
        $("#MdAddOrEditAct").modal('hide');
}

function linkFormatter(value, row, index) {
    let retorno = value;
    if (row.Activo) {
        retorno = `<a href="javascript:editarActivos(${row.Id})" title="Editar">${value}</a>`;
    }
    return retorno;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let btnEstado = `<a href="javascript:cambiarEstado(${row.Id}, ${row.Activo})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
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
                                    listarActivos();
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


function AddActivos() {
    $("#titleFormPat").html("Configurar tipo de activos de información");
    $("#hdActivosId").val('');
    $("#txtCodAct").attr('readonly', false);
    //$("#hdNumTecAsoc").val("0");
    MdAddOrEditAct(true);
}

function editarActivos(Id) {
    $("#txtCodAct").attr('readonly', true);
    $("#titleFormAct").html("Editar registro");
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "GET",
        dataType: "json",
        success: function (result) {
            MdAddOrEditAct(true);

            $("#hdActivosId").val(result.Id);
            //$("#hdNumTecAsoc").val(NumTecAsociadas);
            $("#txtCodAct").val(result.Id);
            $("#ddlFlujoRegistro").val(result.FlujoRegistro);
            $("#txtDescripcion").val(result.Descripcion);
            $("#txtNombre").val(result.Nombre);

            $("#ckbFlagUserIT").prop('checked', result.FlagUserIT);
            $('#ckbFlagUserIT').bootstrapToggle(result.FlagUserIT ? 'on' : 'off');

            $("#ckbFlagExterna").prop('checked', result.FlagExterna);
            $('#ckbFlagExterna').bootstrapToggle(result.FlagExterna ? 'on' : 'off');
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
                        url: `${URL_API_VISTA}/CambiarEstadoActivos?Id=${Id}`,
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

function guardarAddOrEditActivos() {
    if ($("#formAddOrEditAct").valid()) {
        $("#btnRegAct").button("loading");

        var activos = {};
        activos.Id = ($("#hdActivosId").val() === "") ? -1 : parseInt($("#hdActivosId").val());
        activos.Descripcion = $.trim($("#txtDescripcion").val());
        activos.Nombre = SetCustomName($("#txtNombre").val());
        activos.FlagUserIT = $("#ckbFlagUserIT").prop("checked");
        activos.FlagExterna = $("#ckbFlagExterna").prop("checked");

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
                $("#btnRegAct").button("reset");
                $("#txtBusAct").val('');
                $table.bootstrapTable('refresh');
                MdAddOrEditAct(false);
            },
            error: function (result) {
                //ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombosActivos",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Flujos, $("#ddlFlujoRegistro"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function linkFormatterAudi(value, row, index) {
    return `<a href="javascript:irDetalleCambios('${row.Campo}')" title="Ver detalle de cambios">${value}</a>`;
}

function irDetalleCambios(data) {
    if (data) {
        MensajeGeneralAlert(TITULO_MENSAJE, data);
    }
}

function dateFormat(value, row, index) {
    if (value != null)
        return moment(value).format('DD/MM/YYYY HH:mm:ss');
    else return "-";
}