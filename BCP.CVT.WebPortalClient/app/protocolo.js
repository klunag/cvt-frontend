var $tblProtocolo = $("#tblProtocolo");
var DATA_EXPORTAR = {};
var DATA_VALIDAR = {};
var URL_API_VISTA = URL_API + "/Protocolo";

$(function () {
    FormatoCheckBox($("#divActProtocolo"), 'cbAcProtocolo');
    $tblProtocolo.bootstrapTable("destroy");
    $tblProtocolo.bootstrapTable({ data: [] });
    validarFormProtocolo();
    listarTodo();
    ListarProtocolo();
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
    ListarProtocolo();
}
function ListarProtocolo() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblProtocolo.bootstrapTable('destroy');
    $tblProtocolo.bootstrapTable({
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
            DATA_EXPORTAR.nombre = $.trim($("#txtBusProtocolo").val());
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
    var pageNumber = $tblProtocolo.bootstrapTable('getOptions').pageNumber;
    var pageSize = $tblProtocolo.bootstrapTable('getOptions').pageSize;
    var rowNum = (pageSize * (pageNumber - 1)) + (index + 1);
    return rowNum;
}
function opcionesActivo(value, row, index) {
    let style_color = row.FlagActivo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.FlagActivo ? "check" : "unchecked";
    let estado = `<i id="cbOpcPro${row.ProtocoloId}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;
}
function opciones(value, row, index) {
    let botonEditar = `<a href="#" onclick="javascript:editarProtocolo(${row.ProtocoloId})" title="Editar"><i class="iconoAmarillo glyphicon glyphicon-pencil"></i></a>`;
    return botonEditar;
}
function AddProtocolo() {
    $("#titleFormProtocolo").html("Configurar protocolo");
    $("#hdProtocoloId").val('');
    $("#hdBloquearDefault").val(0);
    MdAddOrEditProtocolo(true);
}
function MdAddOrEditProtocolo(EstadoMd) {
    limpiarMdAddOrEditProtocolo();
    if (EstadoMd)
        $("#MdAddOrEditProtocolo").modal(opcionesModal);
    else
        $("#MdAddOrEditProtocolo").modal('hide');
}
function limpiarMdAddOrEditProtocolo() {
    LimpiarValidateErrores($("#formAddOrEditProtocolo"));
    $("#txtNombreProtocolo").val('');
    $("#cbAcProtocolo").prop('checked', true);
    $('#cbAcProtocolo').bootstrapToggle(true ? 'on' : 'off');
}
function guardarAddOrEditProtocolo() {
    if ($("#formAddOrEditProtocolo").valid()) {
        $("#btnRegProtocolo").button("loading");

        var protocolo = {};
        protocolo.ProtocoloId = ($("#hdProtocoloId").val() === "") ? 0 : parseInt($("#hdProtocoloId").val());
        protocolo.Nombre = $("#txtNombreProtocolo").val();
        protocolo.FlagActivo = $("#cbAcProtocolo").prop("checked");
        
        

        if (protocolo.ProtocoloId == 0) {
            var encontrador = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Nombre.toUpperCase() == protocolo.Nombre.toUpperCase()) {
                    encontrador += 1;
                    return true;
                }
            });
            if (encontrador >= 1) {
                toastr.error('El protocolo que está intentando registrar ya existe, por favor revise.', "Configurar protocolo");
                $("#btnRegProtocolo").button("reset");
                return;
            }
        } else {

            const removeById = (arr, id) => {
                const requiredIndex = arr.findIndex(el => {
                    return el.ProtocoloId === id;
                });
                if (requiredIndex === -1) {
                    return false;
                };
                return !!arr.splice(requiredIndex, 1);
            };
            removeById(DATA_VALIDAR, protocolo.ProtocoloId);
            var encontrador2 = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Nombre.toUpperCase() == protocolo.Nombre.toUpperCase()) {
                    encontrador2 += 1;
                    return true;
                }
            });
            if (encontrador2 >= 1) {
                toastr.error('El nombre que está intentando actualizar ya existe, por favor revise', "Configurar protocolo");
                $("#btnRegProtocolo").button("reset");
                return;
            }
        }

        $.ajax({
            url: URL_API_VISTA + "/PostProtocolo",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(protocolo),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                if (result.toString() == '2') {
                    toastr.info("Este protocolo tiene asociado una regla vigente para el motor. Para inactivar este protocolo considere primero inactivar la regla", "Configurar protocolo");
                } else {
                    toastr.success("Registrado correctamente", "Configurar protocolo");
                }
                
                
            },
            complete: function () {
                $("#btnRegProtocolo").button("reset");
                $("#txtNombreProtocolo").val('');
                listarTodo();
                ListarProtocolo();                
                MdAddOrEditProtocolo(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}
function validarFormProtocolo() {
    $("#formAddOrEditProtocolo").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombreProtocolo: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtNombreProtocolo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            }
        }
    });
}
function editarProtocolo(Id) {
    $("#titleFormProtocolo").html("Configurar protocolo");
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditProtocolo(true);

            $("#hdProtocoloId").val(result.ProtocoloId);
            $("#txtNombreProtocolo").val(result.Nombre);
            
            $("#cbAcProtocolo").prop('checked', result.FlagActivo);
            $('#cbAcProtocolo').bootstrapToggle(result.FlagActivo ? 'on' : 'off');
            
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
