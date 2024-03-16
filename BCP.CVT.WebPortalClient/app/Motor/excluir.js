var $tblProceso = $("#tblProceso");
var $tblServidor = $("#tblServidor");
var DATA_EXPORTAR = {};
var DATA_VALIDAR = {};
var DATA_VALIDAR_SERVIDOR = {};
var URL_API_VISTA = URL_API + "/Motor";
var DATA_PROCESO_TIPO = [
    {
        Id: 1,
        Descripcion: "Origen"
    },
    {
        Id: 2,
        Descripcion: "Destino"
    }
];

$(function () {
    SetItems(DATA_PROCESO_TIPO, $("#cboTipo"), TEXTO_SELECCIONE);
    FormatoCheckBox($("#divActProceso"), 'cbAcProceso');
    FormatoCheckBox($("#divActServidor"), 'cbAcServidor');
    $tblProceso.bootstrapTable("destroy");
    $tblProceso.bootstrapTable({ data: [] });
    $tblServidor.bootstrapTable("destroy");
    $tblServidor.bootstrapTable({ data: [] });
    validarForm();
    listarTodo();
    ListarProceso();
    listarTodoServidor();
    ListarServidor();
});

function validarForm() {
    $("#formAddOrEditProceso").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombreProceso: {
                requiredSinEspacios: true
            },
            cboTipo: { requiredSelect: true }
        },
        messages: {
            txtNombreProceso: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            cboTipo: { requiredSelect: String.Format("Debes seleccionar {0}.", "donde se aplica la exclusión") }
        }
    });
    $("#formAddOrEditServidor").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombreServidor: { requiredSinEspacios: true }
        },
        messages: {
            txtNombreServidor: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre") }
        }
    });
}
function listarTodo() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 100000;
    DATA_EXPORTAR.nombre = "";
    $.ajax({
        url: URL_API_VISTA + "/ProcesoExcluir/Listado",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            var data = result;
            DATA_VALIDAR = data.Rows;
        },

        error: function (result) {
            alert(result.responseText);
        }
    });
}
function Buscar() {
    ListarProceso();
}
function ListarProceso() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblProceso.bootstrapTable('destroy');
    $tblProceso.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ProcesoExcluir/Listado",
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
            DATA_EXPORTAR.nombre = $.trim($("#txtBusProceso").val());
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
function rowNumFormatterServer(value, row, index) {
    var pageNumber = $tblProceso.bootstrapTable('getOptions').pageNumber;
    var pageSize = $tblProceso.bootstrapTable('getOptions').pageSize;
    var rowNum = (pageSize * (pageNumber - 1)) + (index + 1);
    return rowNum;
}
function opcionesActivo(value, row, index) {
    let style_color = row.FlagActivo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.FlagActivo ? "check" : "unchecked";
    let estado = `<i id="cbOpcPro${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;
}
function opciones(value, row, index) {
    let botonEditar = `<a href="#" onclick="javascript:editarProceso(${row.Id})" title="Editar"><i class="iconoAmarillo glyphicon glyphicon-pencil"></i></a>`;
    return botonEditar;
}
function AddProceso() {
    $("#titleFormProceso").html("Configurar proceso de exclusión");
    $("#hdProcesoId").val('');
    MdAddOrEditProceso(true);
}
function MdAddOrEditProceso(EstadoMd) {
    limpiarMdAddOrEditProceso();
    if (EstadoMd)
        $("#MdAddOrEditProceso").modal(opcionesModal);
    else
        $("#MdAddOrEditProceso").modal('hide');
}
function limpiarMdAddOrEditProceso() {
    LimpiarValidateErrores($("#formAddOrEditProceso"));
    $("#txtNombreProceso").val('');
    $("#cbAcProceso").prop('checked', true);
    $('#cbAcProceso').bootstrapToggle(true ? 'on' : 'off');
}
function guardarAddOrEditProceso() {
    if ($("#formAddOrEditProceso").valid()) {
        $("#btnRegProceso").button("loading");

        var proceso = {};
        proceso.Id = ($("#hdProcesoId").val() === "") ? 0 : parseInt($("#hdProcesoId").val());
        proceso.Nombre = $("#txtNombreProceso").val();
        proceso.Tipo = $("#cboTipo").val();
        proceso.FlagActivo = $("#cbAcProceso").prop("checked");
        if (proceso.Id == 0) {
            var encontrador = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Nombre.toUpperCase() == proceso.Nombre.toUpperCase() && entry.Tipo == proceso.Tipo) {
                    encontrador += 1;
                    return true;
                }
            });
            if (encontrador >= 1) {
                toastr.error('El proceso que está intentando registrar ya existe, por favor revise.', "Configurar proceso de exclusión");
                $("#btnRegProceso").button("reset");
                return;
            }
        } else {

            const removeById = (arr, id) => {
                const requiredIndex = arr.findIndex(el => {
                    return el.Id === id;
                });
                if (requiredIndex === -1) {
                    return false;
                };
                return !!arr.splice(requiredIndex, 1);
            };
            removeById(DATA_VALIDAR, proceso.Id);
            var encontrador2 = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Nombre.toUpperCase() == proceso.Nombre.toUpperCase() && entry.Tipo == proceso.Tipo) {
                    encontrador2 += 1;
                    return true;
                }
            });
            if (encontrador2 >= 1) {
                toastr.error('El nombre que está intentando actualizar ya existe, por favor revise', "Configurar proceso de exclusión");
                $("#btnRegProceso").button("reset");
                return;
            }
        }

        $.ajax({
            url: URL_API_VISTA + "/ProcesoExcluir/PostProceso",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(proceso),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                //if (result.toString() == '2') {
                //    toastr.info("Este proceso tiene asociado una regla vigente para el motor. Para inactivar este proceso considere primero inactivar la regla", "Configurar proceso");
                //} else {
                toastr.success("Registrado correctamente", "Configurar proceso de exclusión");
                //}
            },
            complete: function () {
                $("#btnRegProceso").button("reset");
                $("#txtNombreProceso").val('');
                $("#cboTipo").val('-1');
                listarTodo();
                ListarProceso();                
                MdAddOrEditProceso(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}
function editarProceso(Id) {
    $("#titleFormProceso").html("Configurar proceso");
    $.ajax({
        url: URL_API_VISTA + "/ProcesoExcluir/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditProceso(true);

            $("#hdProcesoId").val(result.Id);
            $("#txtNombreProceso").val(result.Nombre);
            $("#cboTipo").val(result.Tipo);
            $("#cbAcProceso").prop('checked', result.FlagActivo);
            $('#cbAcProceso').bootstrapToggle(result.FlagActivo ? 'on' : 'off');
            
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function checkCaracteres(e) {
    tecla = (document.all) ? e.keyCode : e.which;

    //Tecla de retroceso para borrar, siempre la permite
    if (tecla == 8) {
        return true;
    }

    // Patrón de entrada, en este caso solo acepta numeros y letras
    patron = /^([a-zA-Z0-9 ]+)$/;
    tecla_final = String.fromCharCode(tecla);
    return patron.test(tecla_final);
}

function listarTodoServidor() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 100000;
    DATA_EXPORTAR.nombre = "";
    $.ajax({
        url: URL_API_VISTA + "/ServidorOrigenExcluir/Listado",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(DATA_EXPORTAR),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            var data = result;
            DATA_VALIDAR_SERVIDOR = data.Rows;
        },

        error: function (result) {
            alert(result.responseText);
        }
    });
}
function BuscarServidor() {
    ListarServidor();
}
function ListarServidor() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblServidor.bootstrapTable('destroy');
    $tblServidor.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ServidorOrigenExcluir/Listado",
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
            DATA_EXPORTAR.nombre = $.trim($("#txtBusServidor").val());
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
function opcionesActivo2(value, row, index) {
    let style_color = row.FlagActivo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.FlagActivo ? "check" : "unchecked";
    let estado = `<i id="cbOpcSer${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;
}
function opciones2(value, row, index) {
    let botonEditar = `<a href="#" onclick="javascript:editarServidor(${row.Id})" title="Editar"><i class="iconoAmarillo glyphicon glyphicon-pencil"></i></a>`;
    return botonEditar;
}
function AddServidor() {
    $("#titleFormServidor").html("Configurar servidor origen de exclusión");
    $("#hdServidorId").val('');
    MdAddOrEditServidor(true);
}
function MdAddOrEditServidor(EstadoMd) {
    limpiarMdAddOrEditServidor();
    if (EstadoMd)
        $("#MdAddOrEditServidor").modal(opcionesModal);
    else
        $("#MdAddOrEditServidor").modal('hide');
}
function limpiarMdAddOrEditServidor() {
    LimpiarValidateErrores($("#formAddOrEditServidor"));
    $("#txtNombreServidor").val('');
    $("#cbAcServidor").prop('checked', true);
    $('#cbAcServidor').bootstrapToggle(true ? 'on' : 'off');
}
function editarServidor(Id) {
    $("#titleFormServidor").html("Configurar servidor origen a excluir");
    $.ajax({
        url: URL_API_VISTA + "/ServidorOrigenExcluir/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            MdAddOrEditServidor(true);
            $("#hdServidorId").val(result.Id);
            $("#txtNombreServidor").val(result.Nombre);
            $("#cbAcServidor").prop('checked', result.FlagActivo);
            $('#cbAcServidor').bootstrapToggle(result.FlagActivo ? 'on' : 'off');

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}
function guardarAddOrEditServidor() {
    if ($("#formAddOrEditServidor").valid()) {
        $("#btnRegServidor").button("loading");

        var proceso = {};
        proceso.Id = ($("#hdServidorId").val() === "") ? 0 : parseInt($("#hdServidorId").val());
        proceso.Nombre = $("#txtNombreServidor").val();
        proceso.FlagActivo = $("#cbAcServidor").prop("checked");
        if (proceso.Id == 0) {
            var encontrador = 0;
            DATA_VALIDAR_SERVIDOR.some(function (entry) {
                if (entry.Nombre.toUpperCase() == proceso.Nombre.toUpperCase()) {
                    encontrador += 1;
                    return true;
                }
            });
            if (encontrador >= 1) {
                toastr.error('El servidor origen que está intentando registrar ya existe, por favor revise.', "Configurar servidor origen de exclusión");
                $("#btnRegServidor").button("reset");
                return;
            }
        } else {

            const removeById = (arr, id) => {
                const requiredIndex = arr.findIndex(el => {
                    return el.Id === id;
                });
                if (requiredIndex === -1) {
                    return false;
                };
                return !!arr.splice(requiredIndex, 1);
            };
            removeById(DATA_VALIDAR_SERVIDOR, proceso.Id);
            var encontrador2 = 0;
            DATA_VALIDAR_SERVIDOR.some(function (entry) {
                if (entry.Nombre.toUpperCase() == proceso.Nombre.toUpperCase() ) {
                    encontrador2 += 1;
                    return true;
                }
            });
            if (encontrador2 >= 1) {
                toastr.error('El nombre que está intentando actualizar ya existe, por favor revise', "Configurar servidor de origen de exclusión");
                $("#btnRegServidor").button("reset");
                return;
            }
        }

        $.ajax({
            url: URL_API_VISTA + "/ServidorOrigenExcluir/PostServidor",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(proceso),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                toastr.success("Registrado correctamente", "Configurar servidor origen de exclusión");
            },
            complete: function () {
                $("#btnRegServidor").button("reset");
                $("#txtNombreServidor").val('');
                listarTodoServidor();
                ListarServidor();
                MdAddOrEditServidor(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}