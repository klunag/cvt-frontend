var $tblPuerto = $("#tblPuerto");
var DATA_EXPORTAR = {};
var DATA_VALIDAR = {};
var URL_API_VISTA = URL_API + "/Puerto";

$(function () {
    FormatoCheckBox($("#divActPuerto"), 'cbAcPuerto');
    $tblPuerto.bootstrapTable("destroy");
    $tblPuerto.bootstrapTable({ data: [] });
    validarFormPuerto();
    listarTodo();
    ListarPuerto();
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
    ListarPuerto();
}
function ListarPuerto() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblPuerto.bootstrapTable('destroy');
    $tblPuerto.bootstrapTable({
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
            DATA_EXPORTAR.nombre = $.trim($("#txtBusPuerto").val());
            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            //DATA_VALIDAR = data.Rows;
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
    var pageNumber = $tblPuerto.bootstrapTable('getOptions').pageNumber;
    var pageSize = $tblPuerto.bootstrapTable('getOptions').pageSize;
    var rowNum = (pageSize * (pageNumber - 1)) + (index + 1);
    return rowNum;
}
function opcionesActivo(value, row, index) {
    let style_color = row.FlagActivo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.FlagActivo ? "check" : "unchecked";
    let estado = `<i id="cbOpcPro${row.PuertoId}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;
}
function opciones(value, row, index) {
    let botonEditar = `<a href="#" onclick="javascript:editarPuerto(${row.PuertoId})" title="Editar"><i class="iconoAmarillo glyphicon glyphicon-pencil"></i></a>`;
    return botonEditar;
}
function AddPuerto() {
    $("#titleFormPuerto").html("Configurar puerto");
    $("#hdPuertoId").val('');
    $("#hdBloquearDefault").val(0);
    MdAddOrEditPuerto(true);
}
function MdAddOrEditPuerto(EstadoMd) {
    limpiarMdAddOrEditPuerto();
    if (EstadoMd)
        $("#MdAddOrEditPuerto").modal(opcionesModal);
    else
        $("#MdAddOrEditPuerto").modal('hide');
}
function limpiarMdAddOrEditPuerto() {
    LimpiarValidateErrores($("#formAddOrEditPuerto"));
    $("#txtNombrePuerto").val('');
    $("#cbAcPuerto").prop('checked', true);
    $('#cbAcPuerto').bootstrapToggle(true ? 'on' : 'off');
}
function guardarAddOrEditPuerto() {
    if ($("#formAddOrEditPuerto").valid()) {
        $("#btnRegPuerto").button("loading");

        var puerto = {};
        puerto.PuertoId = ($("#hdPuertoId").val() === "") ? 0 : parseInt($("#hdPuertoId").val());
        puerto.Nombre = $("#txtNombrePuerto").val();
        puerto.FlagActivo = $("#cbAcPuerto").prop("checked");
        
        

        if (puerto.PuertoId == 0) {
            var encontrador = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Nombre.toUpperCase() == puerto.Nombre.toUpperCase()) {
                    encontrador += 1;
                    return true;
                }
            });
            if (encontrador >= 1) {
                toastr.error('El puerto que está intentando registrar ya existe, por favor revise.', "Configurar puerto");
                $("#btnRegPuerto").button("reset");
                return;
            }
        } else {

            const removeById = (arr, id) => {
                const requiredIndex = arr.findIndex(el => {
                    return el.PuertoId === id;
                });
                if (requiredIndex === -1) {
                    return false;
                };
                return !!arr.splice(requiredIndex, 1);
            };
            removeById(DATA_VALIDAR, puerto.PuertoId);
            var encontrador2 = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Nombre.toUpperCase() == puerto.Nombre.toUpperCase()) {
                    encontrador2 += 1;
                    return true;
                }
            });
            if (encontrador2 >= 1) {
                toastr.error('El nombre que está intentando actualizar ya existe, por favor revise', "Configurar puerto");
                $("#btnRegPuerto").button("reset");
                return;
            }
        }

        $.ajax({
            url: URL_API_VISTA + "/PostPuerto",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(puerto),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                if (result.toString() == '2') {
                    toastr.info("Este puerto tiene asociado una regla vigente para el motor. Para inactivar este puerto considere primero inactivar la regla", "Configurar puerto");
                } else {
                    toastr.success("Registrado correctamente", "Configurar puerto");
                }
            },
            complete: function () {
                $("#btnRegPuerto").button("reset");
                $("#txtNombrePuerto").val('');
                listarTodo();
                ListarPuerto();                
                MdAddOrEditPuerto(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}
function validarFormPuerto() {
    $("#formAddOrEditPuerto").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombrePuerto: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtNombrePuerto: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            }
        }
    });
}
function editarPuerto(Id) {
    $("#titleFormPuerto").html("Configurar puerto");
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditPuerto(true);

            $("#hdPuertoId").val(result.PuertoId);
            $("#txtNombrePuerto").val(result.Nombre);
            
            $("#cbAcPuerto").prop('checked', result.FlagActivo);
            $('#cbAcPuerto').bootstrapToggle(result.FlagActivo ? 'on' : 'off');
            
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
    if (tecla >= 48 && tecla <= 57) {
        return true
    } else {
        return false
    }
    
    
    
    //// Patrón de entrada, en este caso solo acepta numeros y letras
    //patron = /^([a-zA-Z0-9 ]+)$/;
    //tecla_final = String.fromCharCode(tecla);
    //return patron.test(tecla_final);
}
