//var $table = $("#tbl-tipos");
var URL_API_VISTA = URL_API + "/BigFix";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Interfaz CMDB-BigFix";

$(function () {
    //FormatoCheckBox($("#divActivo"), 'cbActTipo');
    //FormatoCheckBox($("#divFlagStandar"), 'cbFlagEstandar');

    validarFormBigFix();
    validarFormConsultar(); 
    //listarTipos();
});


function validarFormBigFix() {

    $("#formBigFix").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomSer: {
                requiredSinEspacios: true
            },
            txtRutSer: {
                requiredSinEspacios: true
            },
            txtCorreos: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtNomSer: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtRutSer: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la ruta")
            },
            txtCorreos: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el correo")
            }
        }
    });
}

function limpiarFormBigFix() {
    LimpiarValidateErrores($("#formBigFix"));
    $("#txtNomSer").val('');
    $("#txtRutSer").val('');
    $("#txtCorreos").val('');   
}

function solicitarInfoBigFix() {
    if ($("#formBigFix").valid()) {

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

        let data = {};
        data.Email = $("#txtCorreos").val();
        data.Ruta = $("#txtRutSer").val();
        data.Servidor = $("#txtNomSer").val();

        $.ajax({
            url: URL_API_VISTA + "/SolicitarArchivosBigFix",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        waitingDialog.hide();
                        //console.log(dataObject);
                        bootbox.alert({
                            size: "sm",
                            title: TITULO_MENSAJE,
                            message: dataObject,
                            buttons: {
                                ok: {
                                    label: 'Aceptar',
                                    className: 'btn-primary'
                                }
                            }
                        });
                        //ListarRegistros();
                        //toastr.success("Registrado correctamente", TITULO_MENSAJE);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function limpiarFormConsultar() {
    LimpiarValidateErrores($("#formConsultar"));
    $(".divResult").children("p").remove();
    $("#txtTransaccionId").val('');
}

function irConsultarTransaccion() {
    limpiarFormConsultar();
    $("#mdConsultar").modal(opcionesModal);
}

function consultarEstadoTransaccion() {
    if ($("#formConsultar").valid()) {

        $("#btnConsultarTransaccion").button("loading");
        
        let ID = $("#txtTransaccionId").val();

        $.ajax({
            url: `${URL_API_VISTA}/ConsultarEstadoTransaccion?Id=${ID}`,
            type: "GET",
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        //console.log(dataObject);
                        $("#btnConsultarTransaccion").button("reset");
                        $(".divResult").append(dataObject);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function validarFormConsultar() {

    $.validator.addMethod("existeID", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            estado = ExisteID();
            return estado;
        }
        return estado;
    });

    $("#formConsultar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtTransaccionId: {
                requiredSinEspacios: true,
                existeID: true
            }
        },
        messages: {
            txtTransaccionId: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "ID de transacción"),
                existeID: "El código ingresado no se encuentra registrado en el catálogo de transacciones de BigFix"
            }
        }
    });
}

function ExisteID() {
    let estado = false;
    let Id = $.trim($("#txtTransaccionId").val());
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteID?Id=${Id}`,
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
