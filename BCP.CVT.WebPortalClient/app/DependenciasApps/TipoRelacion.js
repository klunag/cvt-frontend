var $tblTiposRelacion = $("#tblTiposRelacion");
//VER INFORME
var ITEMS_REMOVEID = [];
var ITEMS_ADDID = [];
var DATA_MATRICULA = [];
var FLAG_TENEMOS_MATRICULA = false;
var DATA_EXPORTAR = {};
var DATA_VALIDAR = {};
var TITULO_MENSAJE = "Consultas";
var URL_API_VISTA = URL_API + "/DependenciasAppsV2";
var ESTADO_SOLICITUD_APP = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var PARAMETRO_ACTIVAR_EQUIPO = false;
const TIPO_EQUIPO = { SERVIDOR: 1, SERVIDOR_AGENCIA: 2, PC: 3, SERVICIO_NUBE: 4, STORAGE: 5, APPLIANCE: 6 };
$(function () {
    FormatoCheckBox($("#divActTipoRela"), 'cbActipoRela');
    FormatoCheckBox($("#divPdefTipoRela"), 'cbPdefipoRela');
    $tblTiposRelacion.bootstrapTable("destroy");
    $tblTiposRelacion.bootstrapTable({ data: [] });
    validarFormTipoRela();
    ListarTiposRelacion();
});
function Buscar() {
    ListarTiposRelacion();
}
function ListarTiposRelacion() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblTiposRelacion.bootstrapTable('destroy');
    $tblTiposRelacion.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/PostListadoTiposRelacion",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.Descripcion = $.trim($("#txtBusTipoRela").val());
            //DATA_EXPORTAR.CodigoAPT = $("#hdFilAppId").val() !== "0" && $.trim($("#txtFilApp").val()) !== "" ? $("#hdFilAppId").val() : "";
            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            DATA_VALIDAR = data.Rows;
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
function rowNumFormatterServer(value, row, index) {
    var pageNumber = $tblTiposRelacion.bootstrapTable('getOptions').pageNumber;
    var pageSize = $tblTiposRelacion.bootstrapTable('getOptions').pageSize;

    var rowNum = (pageSize * (pageNumber - 1)) + (index + 1);
    return rowNum;
}
function opcionesPorDefecto(value, row, index) {
    let style_color = row.PorDefecto ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.PorDefecto ? "check" : "unchecked";
    let estado = `<i id="cbOpcPro${row.CodigoAPT}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;
    
}
function opcionesActivo(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<i id="cbOpcPro${row.CodigoAPT}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;
}
function opciones(value, row, index) {
    let botonEditar = `<a href="#" onclick="javascript:editarTipoRela(${row.TipoRelacionId})" title="Editar"><i class="iconoAmarillo glyphicon glyphicon-pencil"></i></a>`;
    return botonEditar;
}
function AddTipoRelacion() {
    $("#titleFormTipoRela").html("Configurar tipo de relación");
    $("#hdTipoRelacionId").val('');
    $("#hdBloquearDefault").val(0);
    MdAddOrEditTipoRelacion(true);
}
function MdAddOrEditTipoRelacion(EstadoMd) {
    limpiarMdAddOrEditTipoRelacion();
    if (EstadoMd)
        $("#MdAddOrEditTipoRela").modal(opcionesModal);
    else
        $("#MdAddOrEditTipoRela").modal('hide');
}
function limpiarMdAddOrEditTipoRelacion() {
    LimpiarValidateErrores($("#formAddOrEditTipoRela"));
    $("#txtNombreTipoRela").val('');
    $("#cbActipoRela").prop('checked', true);
    $('#cbActipoRela').bootstrapToggle(true ? 'on' : 'off');
    $("#cbPdefipoRela").prop('checked', false);
    $('#cbPdefipoRela').bootstrapToggle(false ? 'on' : 'off');
}
function guardarAddOrEditTipoRela() {
    if ($("#formAddOrEditTipoRela").valid()) {
        $("#btnRegTipoRela").button("loading");

        var tipoRelacion = {};
        tipoRelacion.TipoRelacionId = ($("#hdTipoRelacionId").val() === "") ? 0 : parseInt($("#hdTipoRelacionId").val());
        //criticidad.Codigo = parseInt($("#txtCodAmb").val());
        tipoRelacion.Descripcion = $("#txtNombreTipoRela").val();
        tipoRelacion.Activos = $("#cbActipoRela").prop("checked");
        tipoRelacion.PorDefecto = $("#cbPdefipoRela").prop("checked");

        if (tipoRelacion.PorDefecto == true && tipoRelacion.Activos == false) {
            toastr.warning('Antes de inactivar, configure otro tipo de relación con el valor "por defecto".', "Configurar tipo de relación");
            $("#btnRegTipoRela").button("reset");
            return;
        }

        if (tipoRelacion.PorDefecto == false && $("#hdBloquearDefault").val() == 1) {
            toastr.warning('Por favor asegúrese de marcar otra agrupación por defecto.', "Configurar tipo de relación");
            $("#btnRegTipoRela").button("reset");
            return;
        }

        if (tipoRelacion.TipoRelacionId == 0) {
            var encontrador = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Descripcion.toUpperCase() == tipoRelacion.Descripcion.toUpperCase()) {
                    encontrador += 1;
                    return true;
                }
            });
            if (encontrador >= 1) {
                toastr.error('El nombre que está intentando registrar ya existe, por favor revise.', "Configurar tipo de relación");
                $("#btnRegTipoRela").button("reset");
                return;
            }
        } else {

            const removeById = (arr, id) => {
                const requiredIndex = arr.findIndex(el => {
                    return el.TipoRelacionId === id;
                });
                if (requiredIndex === -1) {
                    return false;
                };
                return !!arr.splice(requiredIndex, 1);
            };
            removeById(DATA_VALIDAR, tipoRelacion.TipoRelacionId);
            var encontrador2 = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Descripcion.toUpperCase() == tipoRelacion.Descripcion.toUpperCase()) {
                    encontrador2 += 1;
                    return true;
                }
            });
            if (encontrador2 >= 1) {
                toastr.error('El nombre que está intentando actualizar ya existe, por favor revise', "Configurar tipo de relación");
                $("#btnRegTipoRela").button("reset");
                return;
            }
        }

        $.ajax({
            url: URL_API_VISTA + "/PostTiposRelacion",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(tipoRelacion),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", "Configurar tipo de relación");
            },
            complete: function () {
                $("#btnRegTipoRela").button("reset");
                $("#txtNombreTipoRela").val('');
                ListarTiposRelacion();
                MdAddOrEditTipoRelacion(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}
function validarFormTipoRela() {
    $("#formAddOrEditTipoRela").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombreTipoRela: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtNombreTipoRela: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            }
        }
    });
}
function editarTipoRela(Id) {
    $("#titleFormTipoRela").html("Configurar tipo de relación");
    $.ajax({
        url: URL_API_VISTA + "/GetTiposRelacionId/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditTipoRelacion(true);

            $("#hdTipoRelacionId").val(result.TipoRelacionId);
            $("#txtNombreTipoRela").val(result.Descripcion);
            
            $("#cbActipoRela").prop('checked', result.Activo);
            $('#cbActipoRela').bootstrapToggle(result.Activo ? 'on' : 'off');
            $("#cbPdefipoRela").prop('checked', result.PorDefecto);
            $('#cbPdefipoRela').bootstrapToggle(result.PorDefecto ? 'on' : 'off');

            if (result.PorDefecto == true) {
                $("#hdBloquearDefault").val(1);
            } else {
                $("#hdBloquearDefault").val(0);
            }

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}