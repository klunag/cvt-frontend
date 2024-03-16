var $tblEtiquetas = $("#tblEtiquetas");
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
    FormatoCheckBox($("#divActEtiq"), 'cbActEtiq');
    FormatoCheckBox($("#divPdefEtiq"), 'cbPdefEtiq');
    $tblEtiquetas.bootstrapTable("destroy");
    $tblEtiquetas.bootstrapTable({ data: [] });
    validarFormEtiqueta();
    ListarEtiquetas();
});
function Buscar() {
    ListarEtiquetas();
}
function ListarEtiquetas() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblEtiquetas.bootstrapTable('destroy');
    $tblEtiquetas.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/PostListadoEtiquetas",
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
            DATA_EXPORTAR.Descripcion = $.trim($("#txtBusEtiq").val());
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
    var pageNumber = $tblEtiquetas.bootstrapTable('getOptions').pageNumber;
    var pageSize = $tblEtiquetas.bootstrapTable('getOptions').pageSize;

    var rowNum = (pageSize * (pageNumber - 1)) + (index + 1);
    return rowNum;
}
function opcionesPorDefecto(value, row, index) {
    let style_color = row.FlagDefault ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.FlagDefault ? "check" : "unchecked";
    let titulo = row.FlagDefault ? "Desactivar" : "Activar";
    let estado = `<i id="cbOpcPro${row.CodigoAPT}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;

}
function opcionesActivo(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let titulo = row.Activo ? "Desactivar" : "Activar";
    let estado = `<i id="cbOpcPro${row.CodigoAPT}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;
}
function opciones(value, row, index) {
    let botonEditar = `<a href="#" onclick="javascript:editarEtiqueta(${row.EtiquetaId})" title="Editar"><i class="iconoAmarillo glyphicon glyphicon-pencil"></i></a>`;
    return botonEditar;
}
function AddEtiqueta() {
    $("#titleFormEtiqueta").html("Configurar agrupación de aplicaciones");
    $("#hdEtiquetaId").val('');
    $("#hdBloquearDefault").val(0);
    MdAddOrEditEtiqueta(true);
}
function MdAddOrEditEtiqueta(EstadoMd) {
    limpiarMdAddOrEditEtiqueta();
    if (EstadoMd)
        $("#MdAddOrEditEtiq").modal(opcionesModal);
    else
        $("#MdAddOrEditEtiq").modal('hide');
}
function limpiarMdAddOrEditEtiqueta() {
    LimpiarValidateErrores($("#formAddOrEditEtiq"));
    $("#txtNombreEtiq").val('');
    $("#cbActEtiq").prop('checked', true);
    $('#cbActEtiq').bootstrapToggle(true ? 'on' : 'off');
    $("#cbPdefEtiq").prop('checked', false);
    $('#cbPdefEtiq').bootstrapToggle(false ? 'on' : 'off');
}
function guardarAddOrEditEtiq() {
    if ($("#formAddOrEditEtiq").valid()) {
        $("#btnRegEtiq").button("loading");

        var etiqueta = {};
        etiqueta.EtiquetaId = ($("#hdEtiquetaId").val() === "") ? 0 : parseInt($("#hdEtiquetaId").val());
        //criticidad.Codigo = parseInt($("#txtCodAmb").val());
        etiqueta.Descripcion = $("#txtNombreEtiq").val();
        etiqueta.Activos = $("#cbActEtiq").prop("checked");
        etiqueta.FlagDefault = $("#cbPdefEtiq").prop("checked");

        if (etiqueta.FlagDefault == true && etiqueta.Activos == false) {
            toastr.warning('Antes de inactivar, configure otra agrupación de aplicaciones con el valor "por defecto".', "Configurar agrupación de aplicaciones");
            $("#btnRegEtiq").button("reset");
            return;
        }

        if (etiqueta.FlagDefault == false && $("#hdBloquearDefault").val() == 1) {
            toastr.warning('Por favor asegúrese de marcar otra agrupación por defecto.', "Configurar agrupación de aplicaciones");
            $("#btnRegEtiq").button("reset");
            return;
        }

        if (etiqueta.EtiquetaId == 0) {
            var encontrador = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Descripcion.toUpperCase() == etiqueta.Descripcion.toUpperCase()) {
                    encontrador += 1;
                    return true;
                }
            });
            if (encontrador >= 1) {
                toastr.error('El nombre que está intentando registrar ya existe, por favor revise.', "Configurar agrupación de aplicaciones");
                $("#btnRegEtiq").button("reset");
                return;
            }
        } else {

            const removeById = (arr, id) => {
                const requiredIndex = arr.findIndex(el => {
                    return el.EtiquetaId === id;
                });
                if (requiredIndex === -1) {
                    return false;
                };
                return !!arr.splice(requiredIndex, 1);
            };
            removeById(DATA_VALIDAR, etiqueta.EtiquetaId);
            var encontrador2 = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Descripcion.toUpperCase() == etiqueta.Descripcion.toUpperCase()) {
                    encontrador2 += 1;
                    return true;
                }
            });
            if (encontrador2 >= 1) {
                toastr.error('El nombre que está intentando actualizar ya existe, por favor revise', "Configurar agrupación de aplicaciones");
                $("#btnRegEtiq").button("reset");
                return;
            }
        }


        $.ajax({
            url: URL_API_VISTA + "/PostEtiquetas",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(etiqueta),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", "Configurar agrupación de aplicaciones");
            },
            complete: function () {
                $("#btnRegEtiq").button("reset");
                $("#txtNombreEtiq").val('');
                ListarEtiquetas();
                MdAddOrEditEtiqueta(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}
function validarFormEtiqueta() {
    $("#formAddOrEditEtiq").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombreEtiq: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtNombreEtiq: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            }
        }
    });
}
function editarEtiqueta(Id) {
    $("#titleFormEtiqueta").html("Configurar agrupación de aplicaciones");
    $.ajax({
        url: URL_API_VISTA + "/GetEtiquetasId/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditEtiqueta(true);

            $("#hdEtiquetaId").val(result.EtiquetaId);
            $("#txtNombreEtiq").val(result.Descripcion);

            $("#cbActEtiq").prop('checked', result.Activo);
            $('#cbActEtiq').bootstrapToggle(result.Activo ? 'on' : 'off');
            $("#cbPdefEtiq").prop('checked', result.FlagDefault);
            $('#cbPdefEtiq').bootstrapToggle(result.FlagDefault ? 'on' : 'off');

            if (result.FlagDefault == true) {
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