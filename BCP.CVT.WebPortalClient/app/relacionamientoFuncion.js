var $tblRegla = $("#tblRegla");
var DATA_EXPORTAR = {};
var DATA_VALIDAR = {};
var URL_API_VISTA = URL_API + "/RelacionamientoFuncion";
var URL_API_VISTA_EQUIPO = URL_API + "/Equipo";

$(function () {
    FormatoCheckBox($("#divActRegla"), 'cbAcRegla');
    $tblRegla.bootstrapTable("destroy");
    $tblRegla.bootstrapTable({ data: [] });
    validarFormRegla();
    listarTodo();
    ListarRegla();
    //CargarCombos();
    cargarComboTipoActivo();
});
function listarTodo() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 100000;
    DATA_EXPORTAR.Origen = "";
    DATA_EXPORTAR.Destino = "";
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
    ListarRegla();
}
function ListarRegla() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblRegla.bootstrapTable('destroy');
    $tblRegla.bootstrapTable({
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
            DATA_EXPORTAR.Origen = $.trim($("#txtBusRegla").val());
            DATA_EXPORTAR.Destino = $.trim($("#txtBusRegla").val());
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
    var pageNumber = $tblRegla.bootstrapTable('getOptions').pageNumber;
    var pageSize = $tblRegla.bootstrapTable('getOptions').pageSize;
    var rowNum = (pageSize * (pageNumber - 1)) + (index + 1);
    return rowNum;
}
function opcionesActivo(value, row, index) {
    let style_color = row.FlagActivo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.FlagActivo ? "check" : "unchecked";
    let estado = `<i id="cbOpcPro${row.RelacionReglasGeneralesId}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;
}
function opciones(value, row, index) {
    let botonEditar = `<a href="#" onclick="javascript:editarRegla(${row.RelacionReglasGeneralesId})" title="Editar"><i class="iconoAmarillo glyphicon glyphicon-pencil"></i></a>`;
    return botonEditar;
}
function AddRelacionamiento() {
    $("#titleFormRegla").html("Configurar regla de relacionamiento");
    $("#hdRelacionReglasGeneralesId").val('');
    MdAddOrEditRegla(true);
}
function MdAddOrEditRegla(EstadoMd) {
    limpiarMdAddOrEditRegla();
    if (EstadoMd)
        $("#MdAddOrEditRegla").modal(opcionesModal);
    else
        $("#MdAddOrEditRegla").modal('hide');
}
function limpiarMdAddOrEditRegla() {
    LimpiarValidateErrores($("#formAddOrEditRegla"));
    $("#cbAcRegla").prop('checked', true);
    $('#cbAcRegla').bootstrapToggle(true ? 'on' : 'off');
    //$("#ddlAplicaEn").val("-1");
    $("#cbTipoEquipo").val("-1");
    //$("#ddlOrigen").val("-1");
    //$("#ddlDestino").val("-1");
    SetItems("", $("#ddlOrigen"), "¡ No configurado !");
    SetItems("", $("#ddlDestino"), "¡ No configurado !");
}
function guardarAddOrEditRegla() {
    if ($("#formAddOrEditRegla").valid()) {
        var relacionamientoFuncion = {};
        relacionamientoFuncion.RelacionReglasGeneralesId = ($("#hdRelacionReglasGeneralesId").val() === "") ? 0 : parseInt($("#hdRelacionReglasGeneralesId").val());
        //relacionamientoFuncion.AplicaEn = $("#ddlAplicaEn").val();
        relacionamientoFuncion.AplicaEn = $("#cbTipoEquipo").val();
        relacionamientoFuncion.Origen = $("#ddlOrigen").val();
        relacionamientoFuncion.Destino = $("#ddlDestino").val();
        relacionamientoFuncion.FlagActivo = $("#cbAcRegla").prop("checked");
        
        if (relacionamientoFuncion.RelacionReglasGeneralesId == 0) {
            var encontrador = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.AplicaEn == relacionamientoFuncion.AplicaEn
                    && entry.Origen.toUpperCase() == relacionamientoFuncion.Origen.toUpperCase()
                    && entry.Destino.toUpperCase() == relacionamientoFuncion.Destino.toUpperCase()
                    && entry.FlagActivo == relacionamientoFuncion.FlagActivo) {
                    encontrador += 1;
                    return true;
                }
            });
            if (encontrador >= 1) {
                toastr.error('La regla que está intentando registrar ya existe, por favor revise.', "Configurar regla de relacionamiento");
                $("#btnRegRegla").button("reset");
                return;
            }
            if (relacionamientoFuncion.Origen == relacionamientoFuncion.Destino) {
                toastr.error('El Origen y Destino no pueden ser los mismos', "Configurar regla de relacionamiento");
                $("#btnRegRegla").button("reset");
                return;
            }
        } else {

            const removeById = (arr, id) => {
                const requiredIndex = arr.findIndex(el => {
                    return el.RelacionReglasGeneralesId === id;
                });
                if (requiredIndex === -1) {
                    return false;
                };
                return !!arr.splice(requiredIndex, 1);
            };
            removeById(DATA_VALIDAR, relacionamientoFuncion.RelacionReglasGeneralesId);
            var encontrador2 = 0;
            DATA_VALIDAR.some(function (entry) {
                if (entry.AplicaEn == relacionamientoFuncion.AplicaEn
                    && entry.Origen.toUpperCase() == relacionamientoFuncion.Origen.toUpperCase()
                    && entry.Destino.toUpperCase() == relacionamientoFuncion.Destino.toUpperCase()
                    && entry.FlagActivo == relacionamientoFuncion.FlagActivo) {
                    encontrador2 += 1;
                    return true;
                }
            });
            if (encontrador2 >= 1) {
                toastr.error('La regla que está intentando actualizar ya existe, por favor revise', "Configurar regla de relacionamiento");
                $("#btnRegRegla").button("reset");
                return;
            }
            if (relacionamientoFuncion.Origen == relacionamientoFuncion.Destino) {
                toastr.error('El Origen y Destino no pueden ser los mismos', "Configurar regla de relacionamiento");
                $("#btnRegRegla").button("reset");
                return;
            }
        }

        $.ajax({
            url: URL_API_VISTA + "/PostRelacionamientoFuncion",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(relacionamientoFuncion),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                if (result.toString() == '0') {
                    toastr.info("La regla ya está registrada.", "Configurar regla de relacionamiento");
                }
                if (result.toString() == '1') {
                    toastr.success("Regla registrada correctamente", "Configurar regla de relacionamiento");
                }
                if (result.toString() == '2') {
                    toastr.error("Error inesperado", "Configurar regla de relacionamiento");
                }
            },
            complete: function () {
                $("#btnRegRegla").button("reset");
                listarTodo();
                ListarRegla();                
                MdAddOrEditRegla(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}
function validarFormRegla() {
    $("#formAddOrEditRegla").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            //ddlAplicaEn: {
            //    requiredSelect: true
            //},
            cbTipoEquipo: {
                requiredSelect: true
            },
            ddlOrigen: {
                requiredSelect: true
            },
            ddlDestino: {
                requiredSelect: true
            }
        },
        messages: {
            //ddlAplicaEn: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "para que aplica la regla")
            //},
            cbTipoEquipo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "para que aplica la regla")
            },
            ddlOrigen: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un Origen")
            },
            ddlDestino: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un Destino")
            }
        }
    });
}
function editarRegla(Id) {
    $("#titleFormRegla").html("Configurar regla de relacionamiento");
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditRegla(true);

            $("#hdRelacionReglasGeneralesId").val(result.RelacionReglasGeneralesId);
            //$("#ddlAplicaEn").val(result.AplicaEn);
            $("#cbTipoEquipo").val(result.AplicaEn);

            if (result.AplicaEn == 1) {
                CargarCombos();
                $("#ddlOrigen").val(result.Origen);
                $("#ddlDestino").val(result.Destino);
            } else if (result.AplicaEn == 4) {
                CargarCombos_Azure();
                $("#ddlOrigen").val(result.Origen);
                $("#ddlDestino").val(result.Destino);
            }

            $("#cbAcRegla").prop('checked', result.FlagActivo);
            $('#cbAcRegla').bootstrapToggle(result.FlagActivo ? 'on' : 'off');
            
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function checkCaracteres(e) {
    tecla = (document.all) ? e.keyCode : e.which;

    //// Patrón de entrada, en este caso solo acepta numeros y letras
    patron = /^([a-zA-Z0-9 ]+)$/;
    tecla_final = String.fromCharCode(tecla);
    return patron.test(tecla_final);
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
                    //DATA_TIPO_EQUIPO = dataObject.TipoEquipo_2;
                    //SetItems(DATA_TIPO_EQUIPO, $("#ddlTipoEquipo"), TEXTO_SELECCIONE);

                    //Multiple
                    SetItems(dataObject.Funcion, $("#ddlOrigen"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Funcion, $("#ddlDestino"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}
function CargarCombos_Azure() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarTecnologiasAzure",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Funcion, $("#ddlOrigen"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Funcion, $("#ddlDestino"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}
function RefrescarCombos() {
    //var x = $("#ddlAplicaEn").val();
    LimpiarValidateErrores($("#formAddOrEditRegla"));
    var x = $("#cbTipoEquipo").val();
    if (x == 1) {
        CargarCombos();
    } else if (x == 4) {
        CargarCombos_Azure();
    } else {
        LimpiarValidateErrores($("#formAddOrEditRegla"));
        SetItems("", $("#ddlOrigen"), "¡ No configurado !");
        SetItems("", $("#ddlDestino"), "¡ No configurado !");
        //$("#ddlOrigen").val("-1");
        //$("#ddlDestino").val("-1");
    }
}
function cargarComboTipoActivo() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA_EQUIPO + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoEquipo, $("#cbTipoEquipo"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}