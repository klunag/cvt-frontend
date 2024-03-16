var $table = $("#tbl-codigo");

var DATA_EXPORTAR = {};
var DATA_EXPORTAR_HISTO = {};
var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "Codigo";
var ULTIMO_SORT_ORDER = "asc";

const URL_API_VISTA = URL_API + "/Aplicacion/CodigoReservado";
const URL_API_VISTA2 = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Configuración de códigos reservados";
const FILTRO_ACCION = { INSERT: "1", UPDATE: "2", DELETE: "3", CREATE: "4" };

$(function () {
    //FormatoCheckBox($("#divActAmb"), 'cbActAmb');
    //InitHora();
    //cargarCombos();
    validarFormCodigo();
    //validarFormConfigurarAmbiente();
    listarCodigo();
    //FormatoCheckBox($("#divFlagUserIT"), "ckbFlagUserIT");

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
        url: URL_API_VISTA + "/ListadoCodigo",
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
            DATA_EXPORTAR.tipoCodigo = $("#ddlTipoCodigoF").val();
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



function validarFormCodigo () {
    $.validator.addMethod('positiveNumber',
        function (value) {
            return Number(value) >= 0;
        }
    );

    $.validator.addMethod('longitudCampo',
        function (value, element) {
            let estado = true;

            let valor = $.trim(value);
            if ($("#ddlTipoCodigo").val() == 1) {
                estado = ($("#txtCodigo").val().length == 4);
                return estado;
            }
            else if ($("#ddlTipoCodigo").val() == 2) {
                estado = ($("#txtCodigo").val().length == 2);
                return estado;
            }
            else return estado;
        }
    );

    $.validator.addMethod("existeCodigo", function (value, element) {
        let estado = true;

        let valor = $.trim(value);
        if ($("#ddlTipoCodigo").val() == 1) {
            estado = !ExisteCodigoAPT(valor);
            return estado;
        }
        else if ($("#ddlTipoCodigo").val() == 2) {
            estado = !ExisteCodigoInterfaz(valor);
            return estado;
        }
        else return estado;
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
                existeCodigo: true,
                requiredSinEspacios: true,
                longitudCampo: true                
            }
        },
        messages: {
            txtCodigo: {
                existeCodigo: "El código ya existe",
                requiredSinEspacios: "Debes de ingresar un código de 4 caracteres",
                longitudCampo: "El número de caracteres permitido para el atributo no es el correcto (2 caracteres para Interfaz y 4 caracteres para Aplicación)",               
            },
        }
    });
}

function ExisteCodigoAPT(codigoAPT) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA2 + `/application/exists?id=${codigoAPT}`,
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

function ExisteCodigoInterfaz(codigoAPT) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA2 + `/application/existsInterface?id=${codigoAPT}`,
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

function linkFormatter(value, row, index) {
    let retorno = value;
    if (row.FlagActivo) {
        retorno = `<a href="javascript:editarCodigo(${row.Id})" title="Editar">${value}</a>`;
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
    //let dataRetorno = ExisteRelacionPortafolio(id, ENTIDAD_MANTENIMIENTO);
    //let MENSAJE = `${dataRetorno.MensajeAPI}, ${MENSAJE_VIEW}.`;

    //if (dataRetorno.FlagSeEjecuta) {
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "Està seguro que desea eliminar el còdigo reservado?",
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
                                listarCodigo();
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
    //} else {
    //    MENSAJE = `${dataRetorno.MensajeAPI}. No es posible eliminar`;
    //    MensajeGeneralAlert(TITULO_MENSAJE, MENSAJE);
    //}
}


function AddCodigo() {
    $("#titleFormPat").html("Configurar Código Reservado");
    $("#hdCodigoId").val('');
    $("#txtCodCod").attr('readonly', false);
    //$("#hdNumTecAsoc").val("0");
    MdAddOrEditCod(true);
}

function editarCodigo(Id) {
    $("#txtCodCod").attr('readonly', true);
    $("#titleFormCod").html("Editar registro");
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "GET",
        dataType: "json",
        success: function (result) {
            MdAddOrEditCod(true);

            $("#hdCodigoId").val(result.Id);
            //$("#hdNumTecAsoc").val(NumTecAsociadas);
            $("#txtCodCod").val(result.Id);

            $("#txtComentario").val(result.Comentarios);
            $("#txtCodigo").val(result.Codigo);
            $("#ddlTipoCodigo").val(result.TipoCodigo);


        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function cambiarEstado(Id, estadoActual) {
    let msjOpcion = estadoActual ? "desactivar" : "activar";
    let MENSAJE_VIEW = `¿Estás seguro(a) que deseas ${msjOpcion} el registro seleccionado?`;
    //let dataRetorno = ExisteRelacionPortafolio(Id, ENTIDAD_MANTENIMIENTO);
    //let MENSAJE = `${dataRetorno.MensajeAPI}, ${MENSAJE_VIEW}.`;

    //if (dataRetorno.FlagSeEjecuta) {
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
                    url: `${URL_API_VISTA}/CambiarEstadoCodigo?Id=${Id}`,
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
    //} else {
    //    MENSAJE = `${dataRetorno.MensajeAPI}. No es posible cambiar el estado`;
    //    MensajeGeneralAlert(TITULO_MENSAJE, MENSAJE);
    //}
}

function guardarAddOrEditCodigo() {
    if ($("#formAddOrEditCod").valid()) {
        $("#btnRegCod").button("loading");

        var codigo = {};
        codigo.Id = ($("#hdCodigoId").val() === "") ? -1 : parseInt($("#hdCodigoId").val());
        codigo.Comentarios = $.trim($("#txtComentario").val());
        codigo.Codigo = $.trim($("#txtCodigo").val());
        codigo.TipoCodigo = $("#ddlTipoCodigo").val();
        //grupo.UsuarioCreacion = USUARIO.UserName;
        //grupo.UsuarioModificacion = USUARIO.UserName;


        $.ajax({
            url: URL_API_VISTA + "/AddOrEdit",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(codigo),
            dataType: "json",
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
            },
            complete: function () {
                $("#btnRegCod").button("reset");
                $("#txtBusCod").val('');
                $table.bootstrapTable('refresh');
                MdAddOrEditCod(false);
            },
            error: function (result) {
                //ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

//function cargarCombos() {
//    $.ajax({
//        type: "POST",
//        contentType: "application/json; charset=utf-8",
//        url: URL_API_VISTA + "/ListarCombosActivos",
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
//        dataType: "json",
//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    SetItems(dataObject.Flujos, $("#ddlFlujoRegistro"), TEXTO_SELECCIONE);
//                }
//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//}

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