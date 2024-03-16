var $tblTiposRelacion = $("#tblTiposRelacion");
var $table = $("#tblRegistro");
//VER INFORME
var ITEMS_REMOVEID = [];
var ITEMS_ADDID = [];
var DATA_MATRICULA = [];
var FLAG_TENEMOS_MATRICULA = false;
var DATA_EXPORTAR = {};
var DATA_VALIDAR = {};
var TITULO_MENSAJE = "Consultas";
var URL_API_VISTA = URL_API + "/UnidadFondeo";
var ESTADO_SOLICITUD_APP = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var PARAMETRO_ACTIVAR_EQUIPO = false;
const TIPO_EQUIPO = { SERVIDOR: 1, SERVIDOR_AGENCIA: 2, PC: 3, SERVICIO_NUBE: 4, STORAGE: 5, APPLIANCE: 6 };
const arrMultiSelect = [
    { SelectId: "#cbSegundoNivel", DataField: "SegundoNivel" },
];
$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    FormatoCheckBox($("#divActTipoRela"), 'cbActipoRela');
    $tblTiposRelacion.bootstrapTable("destroy");
    $tblTiposRelacion.bootstrapTable({ data: [] });
    validarFormTipoRela();
    ListarUnidadFondeo();

    CargarCombos();
    validarAsignar();
    $("#cbSegundoNivel").change(ChangeSegundoNivel);
});
function Buscar() {
    ListarUnidadFondeo();
}
function ListarUnidadFondeo() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblTiposRelacion.bootstrapTable('destroy');
    $tblTiposRelacion.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/PostListadoUnidadFondeo",
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
            DATA_EXPORTAR.nombre = $.trim($("#txtBusTipoRela").val());
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
    let style_color = row.FlagActivo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.FlagActivo ? "check" : "unchecked";
    let estado = `<i id="cbOpcPro${row.UnidadFondeoId}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;
}
function opciones(value, row, index) {
    let botonEditar = `<a href="#" onclick="javascript:editarUnidadFondeo(${row.UnidadFondeoId})" title="Editar"><i class="iconoAmarillo glyphicon glyphicon-pencil"></i></a>`;
    return botonEditar;
}
function AddTipoRelacion() {
    $("#titleFormTipoRela").html("Configurar unidad de fondeo");
    $("#hdUnidadFondeoId").val('');
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
}
function guardarAddOrEditTipoRela() {
    if ($("#formAddOrEditTipoRela").valid()) {
        $("#btnRegTipoRela").button("loading");

        var tipoRelacion = {};
        tipoRelacion.UnidadFondeoId = ($("#hdUnidadFondeoId").val() === "") ? 0 : parseInt($("#hdUnidadFondeoId").val());
        tipoRelacion.Nombre = $("#txtNombreTipoRela").val();
        tipoRelacion.FlagActivo = $("#cbActipoRela").prop("checked");
        
        

        if (tipoRelacion.UnidadFondeoId == 0) {
            var encontrador = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Nombre.toUpperCase() == tipoRelacion.Nombre.toUpperCase()) {
                    encontrador += 1;
                    return true;
                }
            });
            if (encontrador >= 1) {
                toastr.error('El nombre que está intentando registrar ya existe, por favor revise.', "Configurar unidad de fondeo");
                $("#btnRegTipoRela").button("reset");
                return;
            }
        } else {

            const removeById = (arr, id) => {
                const requiredIndex = arr.findIndex(el => {
                    return el.UnidadFondeoId === id;
                });
                if (requiredIndex === -1) {
                    return false;
                };
                return !!arr.splice(requiredIndex, 1);
            };
            removeById(DATA_VALIDAR, tipoRelacion.UnidadFondeoId);
            var encontrador2 = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.Nombre.toUpperCase() == tipoRelacion.Nombre.toUpperCase()) {
                    encontrador2 += 1;
                    return true;
                }
            });
            if (encontrador2 >= 1) {
                toastr.error('El nombre que está intentando actualizar ya existe, por favor revise', "Configurar unidad de fondeo");
                $("#btnRegTipoRela").button("reset");
                return;
            }
        }

        $.ajax({
            url: URL_API_VISTA + "/PostUnidadFondeo",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(tipoRelacion),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", "Configurar unidad de fondeo");
            },
            complete: function () {
                $("#btnRegTipoRela").button("reset");
                $("#txtNombreTipoRela").val('');
                ListarUnidadFondeo();
                CargarCombos();
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
function editarUnidadFondeo(Id) {
    $("#titleFormTipoRela").html("Configurar unidad de fondeo");
    $.ajax({
        url: URL_API_VISTA + "/GetUnidadFondeoId/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditTipoRelacion(true);

            $("#hdUnidadFondeoId").val(result.UnidadFondeoId);
            $("#txtNombreTipoRela").val(result.Nombre);
            
            $("#cbActipoRela").prop('checked', result.FlagActivo);
            $('#cbActipoRela').bootstrapToggle(result.FlagActivo ? 'on' : 'off');
            
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.UnidadFondeo, $("#cbUnidadFondeo"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.SegundoNivel, $("#cbSegundoNivel"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
                    //SetItems(dataObject.SegundoNivel, $("#cbSegundoNivel"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}
function listarRegistros() {
    if ($("#cbSegundoNivel").val() != -1) {
        waitingDialog.show("Listando...", { dialogSize: "sm", progressType: "warning" });
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA + "/Lista/AppsPorSegundoNivel",
            method: 'POST',

            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pagination: true,
            sidePagination: 'server',
            queryParamsType: 'else',
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            sortName: 'CodigoApt',
            sortOrder: 'asc',
            fixedColumns: true,
            fixedNumber: 4,
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.SegundoNivel = CaseIsNullSendExport($("#cbSegundoNivel").val());
                
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

}
function ChangeSegundoNivel() {
    $table.bootstrapTable('destroy');
    $("#formFiltros").validate().resetForm();
}
function validarAsignar() {
    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbUnidadFondeo: {
                requiredSelect: true
            },
            cbSegundoNivel: {
                requiredSelect: true
            }
        },
        messages: {
            cbUnidadFondeo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "la unidad de fondeo")
            },
            cbSegundoNivel: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el segundo nivel")
            }
        }
    });
}
function Confirmacion() {
    if ($("#formFiltros").valid()) {
        $("#textUdF").text($("#cbUnidadFondeo :selected").text());
        var texto = $('#cbSegundoNivel option:selected').toArray().map(item => item.text).join();
        texto = texto.replace(',', ' | ');
        $("#txtSegundoNivel").text(texto);
        OpenCloseModal($("#mdConfirmar"), true);
    }
}
function asigarUdF() {
    var segundoNivel = {};
    segundoNivel.Descripcion = CaseIsNullSendExport($("#cbSegundoNivel").val());
    segundoNivel.UnidadFondeoId = $("#cbUnidadFondeo").val();
    $.ajax({
        url: URL_API_VISTA + "/AsignarUdF",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(segundoNivel),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            console.log(result);
            toastr.success("Registrado correctamente", "Configurar unidad de fondeo");
        },
        complete: function () {
            ChangeSegundoNivel();
            OpenCloseModal($("#mdConfirmar"), false);
        },
        error: function (result) {
            alert(result.responseText);
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
