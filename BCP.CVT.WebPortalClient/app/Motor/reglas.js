var $table = $("#tblEquipo");
var $tblEquiposDesactivados = $("#tblEquiposDes");
var URL_API_VISTA = URL_API + "/Reglas";
var URL_API_VISTA_APPLIANCE = URL_API + "/ApplianceSolicitud";
var DATA_EXPORTAR = {};
var DATA_EXPORTAR_EQ_DESACTIVOS = {};
var TITULO_MENSAJE = "Configuración de Reglas";

var DATA_PROCESO_TIPO = [
    {
        Id: 1,
        Descripcion: "Proceso Origen"
    },
    {
        Id: 2,
        Descripcion: "Proceso Destino"
    }
];
var DATA_FUNCION = [
    {
        Id: "File server",
        Descripcion: "File server"
    }, {
        Id: "Base de datos",
        Descripcion: "Base de datos"
    }, {
        Id: "Aplicación",
        Descripcion: "Aplicación"
    }, {
        Id: "Middleware",
        Descripcion: "Middleware"
    }, {
        Id: "Web",
        Descripcion: "Web"
    }
];

$(function () {
    
    InitAutocompletarBuilder($("#txtBusNombreProducto"), $("#hdProductoId"), ".searchProducto", "/Producto/GetByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtProductoNombre"), $("#cboProducto"), ".containerProductoNew", "/Producto/GetByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtProceso"), $("#hProceso"), ".containerFiltroProceso", "/Proceso/GetByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtPuerto"), $("#hPuerto"), ".containerFiltroPuerto", "/Puerto/GetByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtProtocolo"), $("#hProtocolo"), ".containerFiltroProtocolo", "/Protocolo/GetByFiltro?filtro={0}");

    InitAutocompletarBuilder($("#txtProcesoNew"), $("#cboProceso"), ".containerProcesoNew", "/Proceso/GetByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtPuertoNew"), $("#cboPuerto"), ".containerPuertoNew", "/Puerto/GetByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtProtocoloNew"), $("#cboProtocolo"), ".containerProtocoloNew", "/Protocolo/GetByFiltro?filtro={0}");
    SetItems(DATA_PROCESO_TIPO, $("#cboProcesoTipo"), TEXTO_SELECCIONE);
    SetItems(DATA_FUNCION, $("#cboFuncion"), TEXTO_SELECCIONE);
    validarAddOrEditForm();
    listarMotorReglas();


});


function validarAddOrEditForm() {
    $.validator.addMethod("validarProductoNombre", function (value, element) {
        let estado = true;
        estado = ($.trim($("#cboProducto").val()) != "" && $.trim($("#cboProducto").val()) != "0") ;
        return estado;
    });
    $.validator.addMethod("validarProceso", function (value, element) {
        let estado = true;
        estado = ($.trim($("#cboProceso").val()) != "" && $.trim($("#cboProceso").val()) != "0");
        return estado;
    });
    $.validator.addMethod("validarPuerto", function (value, element) {
        let estado = true;
        estado = ($.trim($("#cboPuerto").val()) != "" && $.trim($("#cboPuerto").val()) != "0");
        return estado;
    });
    $.validator.addMethod("validarProtocolo", function (value, element) {
        let estado = true;
        estado = ($.trim($("#cboProtocolo").val()) != "" && $.trim($("#cboProtocolo").val()) != "0");
        return estado;
    });
    $("#formAddOrEdit").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtProductoNombre: { validarProductoNombre: true },
            txtProcesoNew: { validarProceso: true },
            cboProcesoTipo: { requiredSelect: true },
            cboFuncion: { requiredSelect: true }
            //txtPuertoNew: { validarPuerto: true },
            //txtProtocoloNew: { validarProtocolo: true }            
        },
        messages: {
            txtProductoNombre: { validarProductoNombre: String.Format("Debe seleccionar {0}.", "el Producto") },
            txtProcesoNew: { validarProceso: String.Format("Debe seleccionar {0}.", "el Proceso") },
            cboProcesoTipo: { requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo de proceso") },
            cboFuncion: { requiredSelect: String.Format("Debes seleccionar {0}.", "la función") }
            //txtPuertoNew: { validarPuerto: String.Format("Debe seleccionar {0}.", "el Puerto") },
            //txtProtocoloNew: { validarProtocolo: String.Format("Debe seleccionar {0}.", "el Protocolo") }
        }
    });
}

function buscarRegla() {
    validarBuscar();
    listarMotorReglas();
}
function validarBuscar() {
    if ($("#txtPuerto").val() == "")
        $("#hPuerto").val("");
    if ($("#txtProtocolo").val() == "")
        $("#hProtocolo").val("");
    if ($("#txtProceso").val() == "")
        $("#hProceso").val("");
}
function listarMotorReglas() {
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
            DATA_EXPORTAR.Producto = $.trim($("#txtBusNombreProducto").val());
            DATA_EXPORTAR.ProcesoId = $("#hProceso").val();
            DATA_EXPORTAR.PuertoId = $("#hPuerto").val();
            DATA_EXPORTAR.ProtocoloId = $("#hProtocolo").val();
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
        },
        
    });
}

function opciones(value, row, index) {
    let style_color = row.FlagActivo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.FlagActivo ? "check" : "unchecked";
    let text_title = row.FlagActivo ? "Desactivar regla" : "Activar regla";

    let btnAct = `<a href="javascript:activarRegla(${row.MotorReglaId}, ${row.FlagActivo})" title="${text_title}"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return btnAct;
}
function activarRegla(MotorReglaId, Activo) {
    var text = 'ACTIVAR'
    if (Activo)
        text = 'DESACTIVAR'

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás seguro que deseas " + text + " la regla seleccionada?",
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
            if (result !== null && result) {
                let motivo = "";

                $.ajax({
                    type: 'GET',
                    contentType: "application/json; charset=utf-8",
                    url: `${URL_API_VISTA}/CambiarEstado?Id=${MotorReglaId}&Activo=${Activo}&Motivo=${motivo}`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se actualizo la regla correctamente", TITULO_MENSAJE);
                                listarMotorReglas();
                            }
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    }
                });
            }
        }
    });
}

function AddRegla() {
    $("#titleForm").html("Nueva regla");
    irAddOrEditModal(true);
}

function irAddOrEditModal(EstadoMd) {
    limpiarAddOrEditModal();
    if (EstadoMd)
        $("#MdAddOrEdit").modal('show');
    else
        $("#MdAddOrEdit").modal('hide');
}
function limpiarAddOrEditModal() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    $("#txtProductoNombre, #txtProcesoNew, #txtPuertoNew, #txtProtocoloNew").val("");
    $("#cboProducto, #cboProceso, #cboProtocolo, #cboPuerto").val("");
    $("#cboFuncion, #cboProcesoTipo").val(-1);
}

function guardarAddOrEditEquipo() {
    if ($("#formAddOrEdit").valid()) {
        GuardarRegla();
    }
}
function GuardarRegla() {
    $("#btnRegEq").button("loading");
    var regla = {};
    regla.ProductoId = $("#cboProducto").val();
    regla.ProcesoId = $("#cboProceso").val();
    regla.ProtocoloId = $("#cboProtocolo").val();
    regla.PuertoId = $("#cboPuerto").val();
    regla.ProcesoTipo = $("#cboProcesoTipo").val();
    regla.Funcion = $("#cboFuncion").val();
    regla.FlagActivo = true;
    
    $.ajax({
        url: URL_API_VISTA,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(regla),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    if (dataObject == 1) {
                        toastr.success("Registrado correctamente", TITULO_MENSAJE);
                        listarMotorReglas();
                    } else {
                        toastr.error("Registro ya existente", TITULO_MENSAJE);
                    }
                    
                }
            }
        },
        complete: function () {
            $("#btnRegEq").button("reset");
            irAddOrEditModal(false);
        },
        error: function (result) {
            toastr.error("Registro ya existente", TITULO_MENSAJE);
        }
    });
}





