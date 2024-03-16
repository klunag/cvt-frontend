var $table = $("#tbl-registros");
var URL_API_VISTA = URL_API + "/Seguridad";
var DATA_EXPORTAR = {};


$(function () {
    getCurrentUser();

    $table.bootstrapTable();

    listarRegistros();
    FormatoCheckBox($("#divActRegistro"), 'cbActRegistro');
   
    validarFormRegistro();

    InitAutocompletarBuilder($("#txtCodigoAplicacion"), $("#hdId"), ".appContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");

    $table.on('editable-save.bs.table', function (field, row, $el, oldValue) {

        switch (row) {
            case "ApiKey":

                var objRegistro = {
                    "AuthAplicacionId": $el.AuthAplicacionId,
                    "ApiKey": $el.ApiKey,
                    "UsuarioModificacion": userCurrent.Matricula.length > 20 ? userCurrent.Matricula.substring(0, 20) : userCurrent.Matricula
                }
                if (oldValue != $el.ApiKey) {
                    ActualizarApiKey(objRegistro);
                }
        }

    });

});


function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/ListadoAuthAplicacion",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'CodigoAplicacion',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
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


function ActualizarApiKey(obj) {

    $.ajax({
        url: URL_API_VISTA,
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(obj),
        dataType: "json",
        success: function (result) {

            toastr.success("Se actualizó el ApiKey correctamente", "Auth Aplicación");

        },
        complete: function () {

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            toastr.error('Ocurrió un problema', 'Auth Aplicación');
        }
    });

}
function validarEditar() {
    console.log("validarEditar");
}



function MdAddOrEditRegistro(EstadoMd) {
    limpiarMdAddOrEditRegistro();

    //$("#formAddOrEditTipo").validate().resetForm();
    if (EstadoMd)
        $("#MdAddOrEditRegistro").modal(opcionesModal);
    else
        $("#MdAddOrEditRegistro").modal('hide');
}


function AddRegistro() {
    $("#titleFormRegistro").html("Configurar API Keys");
    $("#hdId").val('');
    //$("#txtCodAmb").attr('readonly', false);
    //$("#hdNumTecAsoc").val("0");
    MdAddOrEditRegistro(true);
    generarKeyForAuthKey();
}

function limpiarMdAddOrEditRegistro() {
    //$("#txtCodAmb").val('');
    LimpiarValidateErrores($("#formAddOrEditRegistro"));
    $("#txtCodigoAplicacion").prop('readonly', false);

    $("#hdAuthId").val('');
    $("#hdId").val('');
    $("#txtCodigoAplicacion").val('');
    $("#txtAuthKey").val(''); 
    $("#cbActRegistro").prop('checked', true);
    $("#cbActRegistro").bootstrapToggle('on');
}

function guardarAddOrEditRegistro() {
    if ($("#formAddOrEditRegistro").valid()) {
        $("#btnReg").button("loading");

        var registro = {};
        registro.AuthAplicacionId = ($("#hdAuthId").val() === "") ? 0 : parseInt($("#hdAuthId").val());
        registro.CodigoAplicacion = $("#hdId").val();
        registro.ApiKey = $("#txtAuthKey").val();
        registro.Activo = $("#cbActRegistro").prop("checked");

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(registro),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", "Configurar API Keys");
            },
            complete: function () {
                $("#btnReg").button("reset");
                 
                listarRegistros();
                MdAddOrEditRegistro(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}


function validarFormRegistro() {
    $.validator.addMethod('validarKey', (value, element) => {
        let estado = false;
        let id = $("#hdAuthId").val();
        let codigoAPT = $('#hdId').val();
        //if (codigoAPT.length < 4) return false;
        let key = value;
        if (id == "") {
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: URL_API + `/Seguridad/ExisteKeyAplicacion?codAplicacion=${codigoAPT}`,
                dataType: "json",
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                success: function (dataObject, textStatus) {
                    if (textStatus === "success") {
                        estado = !dataObject;
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                },
                async: false
            });
        } else estado = true;
        return estado;
    });

    $("#formAddOrEditRegistro").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            //txtCodigoAplicacion: {
            //    requiredSinEspacios: true
            //},
            hdId: {
                requiredSinEspacios: true
            },
            txtAuthKey: {
                requiredSinEspacios: true,
                validarKey: true
            }
        },
        messages: {
            //txtCodigoAplicacion: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el código de la aplicación")
            //},
            hdId: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el código de la aplicación"),
                minlength: "No ha seleccionado la aplicación"
            },
            txtAuthKey: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el Auth Key"),
                validarKey: "Ya existe el Auth Key en otra aplicación"
            }
        }
    });
}

function editarCriticidad(CriticidadId) {
    //$("#txtCodAmb").attr('readonly', true);
    $("#titleFormCrit").html("Configurar criticidades");
    $.ajax({
        url: URL_API_VISTA + "/" + CriticidadId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditCrit(true);

            $("#hdCriticidadId").val(result.Id);
            //$("#hdNumTecAsoc").val(NumTecAsociadas);
            //$("#txtCodAmb").val(result.Id);
            $("#txtNombreCrit").val(result.DetalleCriticidad);
            $("#txtPrefCrit").val(result.PrefijoBase);
            $("#txtPrioridadCrit").val(result.Prioridad);
            $("#cbActRegistro").prop('checked', result.Activo);
            $('#cbActRegistro').bootstrapToggle(result.Activo ? 'on' : 'off');
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
                                toastr.success("Se cambió el estado correctamente", "Configurar criticidades");
                                listarCriticidad();
                            }
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "Configurar criticidades");
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
}


function generarKey() {
    var caracteres = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&/()=?¡@~^`;
    var length = 20;
    
    return Array(length).fill().map((x, i) => caracteres[Math.floor(Math.random() * caracteres.length)]).join('');
}

function generarKeyForAuthKey() {
    $("#txtAuthKey").val(generarKey());
}

function txtCodigoAplicacionBlur() {
    $("#formAddOrEditRegistro").valid();
}

function editKeyApplication(value) {
    return `<a href="#" data-cod-aplicacion="${value}" onclick="editarKeyApplication(event)">${value}</a>`;
}

function keyFormatter(value) {
    return `${value}`;
}

function editarKeyApplication(e) {
    e.preventDefault();
    let codAplicacion = $(e.currentTarget).attr('data-cod-aplicacion');
    $.ajax({
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        url: `${URL_API_VISTA}/ObtenerAuthAplicacion?codAplicacion=${codAplicacion}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                let tieneData = dataObject !== null
                MdAddOrEditRegistro(tieneData);
                if (tieneData) {
                    $("#txtCodigoAplicacion").prop('readonly', true);
                    $("#hdAuthId").val(dataObject.registro.AuthAplicacionId);
                    $("#hdId").val(dataObject.registro.CodigoAplicacion);
                    $("#txtCodigoAplicacion").val(`${dataObject.registro.CodigoAplicacion}${(dataObject.aplicacion == null ? `` : ` - ${dataObject.aplicacion.Nombre}`)}`);
                    $("#txtAuthKey").val(dataObject.registro.ApiKey);
                    //toastr.success("Se cambió el estado correctamente", "Configurar criticidades");
                    //listarCriticidad();
                }
            }
            else {
                toastr.success("Hubo un inconveniente al obtener los datos, por favor vuelva a intentar", "Configurar criticidades");
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