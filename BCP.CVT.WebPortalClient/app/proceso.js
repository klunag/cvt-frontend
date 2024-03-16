var $tblProceso = $("#tblProceso");
var DATA_EXPORTAR = {};
var DATA_VALIDAR = {};
var URL_API_VISTA = URL_API + "/Proceso";

$(function () {
    FormatoCheckBox($("#divActProceso"), 'cbAcProceso');
    $tblProceso.bootstrapTable("destroy");
    $tblProceso.bootstrapTable({ data: [] });
    validarFormProceso();
    listarTodo();
    ListarProceso();
});
function listarTodo() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 100000;
    DATA_EXPORTAR.nombre = "";
    $.ajax({
        url: URL_API_VISTA + "/Listado",
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
        url: URL_API_VISTA + "/Listado",
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
    let estado = `<i id="cbOpcPro${row.ProcesoId}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;
}
function opciones(value, row, index) {
    let botonEditar = `<a href="#" onclick="javascript:editarProceso(${row.ProcesoId})" title="Editar"><i class="iconoAmarillo glyphicon glyphicon-pencil"></i></a>`;
    return botonEditar;
}
function AddProceso() {
    $("#titleFormProceso").html("Configurar proceso");
    $("#hdProcesoId").val('');
    $("#hdBloquearDefault").val(0);
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
        proceso.ProcesoId = ($("#hdProcesoId").val() === "") ? 0 : parseInt($("#hdProcesoId").val());
        proceso.Nombre = $("#txtNombreProceso").val();
        proceso.FlagActivo = $("#cbAcProceso").prop("checked");
        
        

        if (proceso.ProcesoId == 0) {
            var encontrador = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Nombre.toUpperCase() == proceso.Nombre.toUpperCase()) {
                    encontrador += 1;
                    return true;
                }
            });
            if (encontrador >= 1) {
                toastr.error('El proceso que está intentando registrar ya existe, por favor revise.', "Configurar proceso");
                $("#btnRegProceso").button("reset");
                return;
            }
        } else {

            const removeById = (arr, id) => {
                const requiredIndex = arr.findIndex(el => {
                    return el.ProcesoId === id;
                });
                if (requiredIndex === -1) {
                    return false;
                };
                return !!arr.splice(requiredIndex, 1);
            };
            removeById(DATA_VALIDAR, proceso.ProcesoId);
            var encontrador2 = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Nombre.toUpperCase() == proceso.Nombre.toUpperCase()) {
                    encontrador2 += 1;
                    return true;
                }
            });
            if (encontrador2 >= 1) {
                toastr.error('El nombre que está intentando actualizar ya existe, por favor revise', "Configurar proceso");
                $("#btnRegProceso").button("reset");
                return;
            }
        }

        $.ajax({
            url: URL_API_VISTA + "/PostProceso",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(proceso),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                if (result.toString() == '2') {
                    toastr.info("Este proceso tiene asociado una regla vigente para el motor. Para inactivar este proceso considere primero inactivar la regla", "Configurar proceso");
                } else {
                    toastr.success("Registrado correctamente", "Configurar proceso");
                }
            },
            complete: function () {
                $("#btnRegProceso").button("reset");
                $("#txtNombreProceso").val('');
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
function validarFormProceso() {
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
            }
        },
        messages: {
            txtNombreProceso: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            }
        }
    });
}
function editarProceso(Id) {
    $("#titleFormProceso").html("Configurar proceso");
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditProceso(true);

            $("#hdProcesoId").val(result.ProcesoId);
            $("#txtNombreProceso").val(result.Nombre);
            
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
