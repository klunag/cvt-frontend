var $table = $("#tbl-ambientes");
var URL_API_VISTA = URL_API + "/Ambiente";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Configuración de ambientes";

$(function () {
    FormatoCheckBox($("#divActAmb"), 'cbActAmb');
    InitHora();
    cargarCombos();
    validarFormAmbiente();
    validarFormConfigurarAmbiente();
    listarAmbientes();
});

function InitHora() {
    $("#divHoraInicio1").datetimepicker({
        format: 'HH:mm:ss'
    });
    $("#divHoraInicio2").datetimepicker({
        format: 'HH:mm:ss'
    });
    $("#divHoraFin1").datetimepicker({
        format: 'HH:mm:ss'
    });
    $("#divHoraFin2").datetimepicker({
        format: 'HH:mm:ss'
    });
}

function buscarAmbiente() {
    listarAmbientes();
}

function listarAmbientes() {
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
            DATA_EXPORTAR.nombre = $.trim($("#txtBusAmb").val());
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
        }
    });
}

function validarFormAmbiente() {

    $.validator.addMethod('positiveNumber',
        function (value) {
            return Number(value) >= 0;
        }
    );

    $.validator.addMethod("existeCodigo", function (value, element) {
        //debugger;
        let estado = true;
        if ($.trim(value) !== "") {
            let estado = false;
            estado = !ExisteCodigo();
            //debugger;
            return estado;
        }
        return estado;
    });

    $("#formAddOrEditAmb").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtCodAmb: {
                requiredSinEspacios: true,
                number: true,
                positiveNumber: true,
                maxlength: 4,
                existeCodigo: true
            },
            txtNomAmb: {
                requiredSinEspacios: true
            },
            txtPrefAmb: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtCodAmb: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el código"),
                number: "Debes ingresar número",
                positiveNumber: "Debes ingresar número positivo",
                maxlength: String.Format("Debes ingresar {0}.", "número de 4 dígitos"),
                existeCodigo: "Código ya existe"
            },
            txtNomAmb: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtPrefAmb: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el prefijo")
            }
        }
    });
}

function validarFormConfigurarAmbiente() {

    $.validator.addMethod("hasTecAsociadas", function (value, element) {
        let estado = false;
        let numTecAsoc = parseInt($("#hdNumTecAsoc").val());
        let cbActivo = $("#cbActTipo").prop("checked");
        if ((cbActivo === true && numTecAsoc > 0) || numTecAsoc === 0)
            estado = true;

        return estado;
    });

    $.validator.addMethod("tieneFlagEstandar", function (value, element) {
        if ($("#cbFlagEstandar").prop("checked")) {
            let estado = false;
            estado = TieneFlagEstandar();
            return !estado;
        }
        return true;
    });

    $("#formConfig").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbInicia: {
               requiredSelect: true
            },
            cbTermina: {
                requiredSelect: true
            },
            txtHoraInicio1: {
                requiredSinEspacios: true
            },
            txtHoraInicio2: {
                requiredSinEspacios: true
            },
            txtHoraFin1: {
                requiredSinEspacios: true
            },
            txtHoraFin2: {
                requiredSinEspacios: true
            }
        },
        messages: {
            cbInicia: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un día")
            },
            cbTermina: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un día")
            },
            txtHoraInicio1: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la hora de inicio")
            },
            txtHoraInicio2: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la hora de inicio")
            },
            txtHoraFin1: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la hora de fin")
            },
            txtHoraFin2: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la hora de fin")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtHoraInicio1"
                || element.attr('name') === "txtHoraInicio2"
                || element.attr('name') === "txtHoraFin1"
                || element.attr('name') === "txtHoraFin2") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function limpiarMdAddOrEditAmb() {
    LimpiarValidateErrores($("#formAddOrEditAmb"));
    $("#txtCodAmb").val('');
    $("#txtNomAmb").val('');
    $("#txtPrefAmb").val(''); 
    $("#txtPref2Amb").val(''); 
    $("#cbActAmb").prop('checked', true);
    $("#cbActAmb").bootstrapToggle('on');
}

function MdAddOrEditAmb(EstadoMd) {
    limpiarMdAddOrEditAmb();  
    if (EstadoMd)
        $("#MdAddOrEditAmb").modal(opcionesModal);
    else
        $("#MdAddOrEditAmb").modal('hide');
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:editarAmbiente(${row.Id})" title="Editar">${value}</a>`;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let btnConfigurar = `<a href="javascript:irConfigurarAmbiente(${row.Id}, ${row.Activo})" title="Configurar ambiente"><i class="${style_color} glyphicon glyphicon-cog"></i></a>`;
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:cambiarEstado(${row.Id})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return estado.concat("&nbsp;&nbsp;", btnConfigurar);
}

function irConfigurarAmbiente(Id, FlagActivo) {
    if (FlagActivo) {
        LimpiarValidateErrores($("#formConfig"));
        $("#cbInicia").val(-1);
        $("#cbTermina").val(-1);
        $("#MdConfig").modal(opcionesModal);
        $("#hdAmbienteId").val(Id);

        $.ajax({
            url: URL_API_VISTA + "/" + Id,
            type: "GET",
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                $("#hdAmbienteId").val(result.Id);
                $("#cbInicia").val(result.DiaInicio || -1);
                $("#cbTermina").val(result.DiaFin || -1);
                $("#txtHoraInicio1").val(result.DiaInicio_HoraInicio || "");
                $("#txtHoraInicio2").val(result.DiaFin_HoraInicio || "");
                $("#txtHoraFin1").val(result.DiaInicio_HoraFin || "");
                $("#txtHoraFin2").val(result.DiaFin_HoraFin || "");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}


function guardarConfigurarAmbiente() {
    if ($("#formConfig").valid()) {                
        $("#btnRegConfig").button("loading");

        var ambiente = {};
        ambiente.Id = ($("#hdAmbienteId").val() === "") ? -1 : parseInt($("#hdAmbienteId").val());
        ambiente.DiaInicio = parseInt($("#cbInicia").val());
        ambiente.DiaFin = parseInt($("#cbTermina").val());
        ambiente.DiaInicio_HoraInicio = $("#txtHoraInicio1").val();
        ambiente.DiaFin_HoraInicio = $("#txtHoraInicio2").val();
        ambiente.DiaInicio_HoraFin = $("#txtHoraFin1").val();
        ambiente.DiaFin_HoraFin = $("#txtHoraFin2").val();               

        $.ajax({
            url: URL_API_VISTA + "/ActualizarVentana",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(ambiente),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
            },
            complete: function () {
                $("#btnRegConfig").button("reset");                                
                $("#MdConfig").modal('hide');
            },
            error: function (result) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}


function AddAmbiente() {
    $("#titleFormAmb").html("Configurar ambientes");
    $("#hdAmbienteId").val('');
    $("#txtCodAmb").attr('readonly', false);
    //$("#hdNumTecAsoc").val("0");
    MdAddOrEditAmb(true);
}

function editarAmbiente(AmbienteId) {
    $("#txtCodAmb").attr('readonly', true);
    $("#titleFormAmb").html("Configurar ambientes");
    $.ajax({
        url: URL_API_VISTA + "/" + AmbienteId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            MdAddOrEditAmb(true);

            $("#hdAmbienteId").val(result.Id);
            //$("#hdNumTecAsoc").val(NumTecAsociadas);
            $("#txtCodAmb").val(result.Id);
            $("#txtNomAmb").val(result.DetalleAmbiente);
            $("#txtPrefAmb").val(result.PrefijoBase);
            $("#txtPref2Amb").val(result.PrefijoBase2);
            $("#cbActAmb").prop('checked', result.Activo);
            $('#cbActAmb').bootstrapToggle(result.Activo ? 'on' : 'off');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function cambiarEstado(Id) {
        bootbox.confirm({
            message: "¿Estás seguro que deseas cambiar el estado del registro seleccionado?",
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
                if (result) {
                    $.ajax({
                        type: 'GET',
                        contentType: "application/json; charset=utf-8",
                        url: `${URL_API_VISTA}/CambiarEstado?Id=${Id}`,
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        success: function (dataObject, textStatus) { 
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    listarAmbientes(); 
                                }                                                           
                            }
                            else {
                                toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            var error = JSON.parse(xhr.responseText);
                        },
                        complete: function (data) {
                            //$("#txtBusTipo").val('');
                            //$table.bootstrapTable('refresh');
                        }
                    });
                }
            }
        });
    //}
}

function guardarAddOrEditAmbiente() {
    if ($("#formAddOrEditAmb").valid()) {
        $("#btnRegAmb").button("loading");

        var ambiente = {};
        ambiente.Id = ($("#hdAmbienteId").val() === "") ? -1 : parseInt($("#hdAmbienteId").val());
        ambiente.Codigo = parseInt($("#txtCodAmb").val());
        ambiente.DetalleAmbiente = $("#txtNomAmb").val();
        ambiente.PrefijoBase = $("#txtPrefAmb").val();
        ambiente.PrefijoBase2 = $("#txtPref2Amb").val();     
        ambiente.Activo = $("#cbActAmb").prop("checked");

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(ambiente),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
            },
            complete: function () {
                $("#btnRegAmb").button("reset");
                $("#txtBusAmb").val('');
                $table.bootstrapTable('refresh');
                MdAddOrEditAmb(false);
            },
            error: function (result) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function ExisteCodigo() {
    let estado = false;
    let codigo = parseInt($("#txtCodAmb").val());
    let id = $("#hdAmbienteId").val() === "" ? 0 : parseInt($("#hdAmbienteId").val());
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Ambiente" + `/ExisteCodigoByFiltro?codigo=${codigo}&id=${id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    estado = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return estado;
}

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Dias, $("#cbInicia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Dias, $("#cbTermina"), TEXTO_SELECCIONE);                  
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

