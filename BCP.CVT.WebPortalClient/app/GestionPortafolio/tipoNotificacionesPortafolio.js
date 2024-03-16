var $tableTipoNotificaciones = $("#tblTipoNotificaciones");

var URL_API_VISTA = URL_API + "/Alerta/TipoNotificaciones/Portafolio";
var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "Id";
var ULTIMO_SORT_ORDER = "asc";

$(function () {

    ListarTipoNotificaciones();
    InitControles();
    ValidarCampos();
    $("#btnBuscar").click(ListarTipoNotificaciones);


    $("#txtFiltro").keypress(function (event) {
        if (event.keyCode === 13) {
            $("#btnBuscar").click();
            event.preventDefault();
        }
    });
});

function redireccionar() {
    window.location.href = "NotificacionesPortafolio";
}

function InitControles() {

    $("#divFechaInicio").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY",
        minDate: moment().startOf('day')._d
    });

    $("#divHora").datetimepicker({
        format: "HH:mm:ss"
    });
}
/*
function ListarTipoNotificaciones() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Listado",
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {

            $tableTipoNotificaciones.bootstrapTable({ data: result.ListaTipoNotificaciones });
            CargarCombos(result.ListaFrecuenciaNotificacion);
        },
        complete: function (data) {

            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });

}*/

function ListarTipoNotificaciones() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableTipoNotificaciones.bootstrapTable('destroy');
    $tableTipoNotificaciones.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + '/ListadoNotificaciones',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
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
            DATA_EXPORTAR.nombre = $.trim($("#txtFiltro").val());

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

function CargarCombos(dataCombos) {
    //SetItems(dataCombos, $("#cbTipoFrecuencia"), TEXTO_SELECCIONE);
    //$("#cbTipoFrecuencia").val("-1");
}

function linkFormatterEditar(value, row, index) {
    let btn1 = `<a href="javascript:IrEditarRegistro(${row.Id})" title="Editar tipo de notificación"><i class="glyphicon glyphicon-cog"></i></a>`;    
    return btn1;
}


function MdAddOrEditRegistro(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    if (EstadoMd)
        $("#MdAddOrEditModal").modal(opcionesModal);
    else
        $("#MdAddOrEditModal").modal("hide");
}
function LimpiarMdAddOrEditRegistro() {
    $(":input", "#formAddOrEdit").not(":button, :submit, :reset, :hidden, #txtArchivo").val("");
    $("select", "#formAddOrEdit").val(-1);
    $("#hdId").val("0");
    //$("#cbTipoFrecuencia").val(-1);
    $("#txtFechaInicio, #txtHora, #txtAsunto, #txtEnviarA").val("");
    $("#txtFechaInicio").val(moment(new Date()).format("DD/MM/YYYY"));
    $("#txtHora").val(moment(new Date()).format("HH"));
    //$("#cbActivo").prop("checked", true);
    //$("#cbActivo").bootstrapToggle("on");
    $("#formAddOrEdit").validate().resetForm();
}
function IrEditarRegistro(id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#titleForm").html("Configurar Tipo de Notificación");
    $.ajax({
        url: URL_API_VISTA + "/Get/" + id,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            MdAddOrEditRegistro(true);
            $("#hdId").val(id);
            if (result !== null) {
                //$("#txtNombre").val(result.Nombre);
                //$("#txtDescripcion").val(result.Descripcion);
                //$("#cbTipoFrecuencia").val(result.Frecuencia !== null ? result.Frecuencia : "-1");
                $("#txtFechaInicio").val(result.FechaInicioStr);
                $("#txtHora").val(result.HoraEnvio);
                $("#txtAsunto").val(result.Asunto);
                $("#txtCuerpo").val(result.Cuerpo);
                $("#txtBuzonSalida").val(result.BuzonSalida);
                $("#txtBuzonPara").val(result.Para);
                $("#txtBuzonCC").val(result.ConCopia);
                $("#txtCuerpoAlt").val(result.CuerpoAlternativo);

                result.Solicitante == true ? $("#txtSolicitante").bootstrapToggle('on') : $("#txtSolicitante").bootstrapToggle('off');
                result.ArquitectoNegocio == true ? $("#txtArqNegocio").bootstrapToggle('on') : $("#txtArqNegocio").bootstrapToggle('off');
                result.ATI == true ? $("#txtATI").bootstrapToggle('on') : $("#txtATI").bootstrapToggle('off');
                result.LiderUsuario == true ? $("#txtLiderUsu").bootstrapToggle('on') : $("#txtLiderUsu").bootstrapToggle('off');
                result.TL_TTL == true ? $("#txtTLTTL").bootstrapToggle('on') : $("#txtTLTTL").bootstrapToggle('off');
                result.DevSec == true ? $("#txtDevSec").bootstrapToggle('on') : $("#txtDevSec").bootstrapToggle('off');
                result.JefeEquipo == true ? $("#txtJefeEquipo").bootstrapToggle('on') : $("#txtJefeEquipo").bootstrapToggle('off');
                result.UsuarioAutorizador == true ? $("#txtUsuAut").bootstrapToggle('on') : $("#txtUsuAut").bootstrapToggle('off');
                result.Brokerr == true ? $("#txtBroker").bootstrapToggle('on') : $("#txtBroker").bootstrapToggle('off');
                result.GobiernoIT == true ? $("#txtGobiernoTI").bootstrapToggle('on') : $("#txtGobiernoTI").bootstrapToggle('off');
                result.AIO == true ? $("#txtAIO").bootstrapToggle('on') : $("#txtAIO").bootstrapToggle('off');


                //if (id === 18) {
                //    $(".cuerpo-alt").show();
                //    $(".cuerpo-alt").removeClass("ignore");
                //} else {
                //    $(".cuerpo-alt").addClass("ignore");
                //    $(".cuerpo-alt").hide();
                //}

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            waitingDialog.hide();
        },
        async: true
    });
}
function ObtenerAlertaProgramacion() {
    let data = {
        Id: $("#hdId").val(),
        //Nombre: $("#txtNombre").val(),
        //Descripcion: $("#txtDescripcion").val(),
        //Frecuencia: $("#cbTipoFrecuencia").val(),
        //FechaInicio: dateFromString($("#txtFechaInicio").val()),
        //HoraEnvio: $.trim($("#txtHora").val()),
        Asunto: $.trim($("#txtAsunto").val()),
        Cuerpo: $("#txtCuerpo").val() || "",
        BuzonSalida: $.trim($("#txtBuzonSalida").val()),
        Para: $.trim($("#txtBuzonPara").val()),
        ConCopia: $.trim($("#txtBuzonCC").val()),
        CuerpoAlternativo: $("#txtCuerpoAlt").val() || "",
        Solicitante: document.getElementById('txtSolicitante').checked,
        ArquitectoNegocio: document.getElementById('txtArqNegocio').checked,
        ATI: document.getElementById('txtATI').checked,
        LiderUsuario: document.getElementById('txtLiderUsu').checked,
        TL_TTL: document.getElementById('txtTLTTL').checked,
        DevSec: document.getElementById('txtDevSec').checked,
        JefeEquipo: document.getElementById('txtJefeEquipo').checked,
        UsuarioAutorizador: document.getElementById('txtUsuAut').checked,
        Brokerr: document.getElementById('txtBroker').checked,
        GobiernoIT: document.getElementById('txtGobiernoTI').checked,
        AIO: document.getElementById('txtAIO').checked
    };
    return data;
}
function RegistrarAddOrEdit() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    if ($("#formAddOrEdit").valid()) {
        $("#btnRegistrar").button("loading");
        data = ObtenerAlertaProgramacion();
        $.ajax({
            url: URL_API_VISTA + "/Update",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (result) {
                if (result > 0) {
                    toastr.success("Tipo de Notificación actualizado exitosamente.", "Tipo de Notificación");
                    ListarTipoNotificaciones();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function (data) {
                $("#btnRegistrar").button("reset");
                if (ControlarCompleteAjax(data))
                    MdAddOrEditRegistro(false);
                else
                    bootbox.alert("sucedió un error con el servicio", function () { });
            }
        });
    }
}


function ValidarCampos() {

    $("#formAddOrEdit").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            //txtNombre: { requiredSinEspacios: true },
            //txtDescripcion: { requiredSinEspacios: true },
            //cbTipoFrecuencia: { requiredSelect: true },
            //txtFechaInicio: { requiredSinEspacios: true },
            //txtHora: { requiredSinEspacios: true, min: 1, max: 24 },
            txtBuzonSalida: { requiredSinEspacios: true },
            //txtBuzonPara: { requiredSinEspacios: true },
            txtBuzonCC: { requiredSinEspacios: true },
            txtAsunto: { requiredSinEspacios: true },
            txtCuerpo: { requiredSinEspacios: true },
            //txtCuerpoAlt: { requiredSinEspacios: true }
        },
        messages: {
            //txtNombre: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre") },
            //txtDescripcion: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción") },

            //cbTipoFrecuencia: { requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo de frecuencia") },
            //txtFechaInicio: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha de inicio") },
            //txtHora: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "la hora"), min: "La hora mínima es 1.", max: "La hora máxima es 24." },
            txtAsunto: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el asunto de la notificación") },
            txtCuerpo: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el cuerpo de la notificación") },

            txtBuzonSalida: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el buzón de salida") },
            //txtBuzonPara: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el destinario") },
            txtBuzonCC: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el destinario de con copia a") },
            //txtCuerpoAlt: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el cuerpo alternativo de la notificación") }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtFechaInicio") element.parent().parent().append(error);
            else element.parent().append(error);
        }
    });
}
