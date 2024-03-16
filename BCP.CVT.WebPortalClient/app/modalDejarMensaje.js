$(function () {
    getCurrentUser();
    validarFormDejarMensaje();
});

function activarModalDejarMensaje() {
    $("#hMatricula").html(userCurrent.Matricula);
    $("#hNombre").html(userCurrent.Nombres);
    $("#cbTipoM").val("-1");
    $("#txtAsuntoM").val("");
    $("#txtDescripcionM").val("");
    $("#formDejarComentario").validate().resetForm();
    $("#mdDejarMensaje").modal(opcionesModal);
}

function validarFormDejarMensaje() {
    $("#formDejarComentario").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbTipoM: {
                requiredSelect: true
            },
            txtAsuntoM: {
                requiredSinEspacios: true
            },
            txtDescripcionM: {
                requiredSinEspacios: true,
                maxlength: 300
            }
        },
        messages: {
            cbTipoM: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo")
            },
            txtAsuntoM: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el asunto")
            },
            txtDescripcionM: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción"),
                maxlength: "Solo se permite 300 caracteres."
            }
        }
    });
}

function registrarMensaje() {
    if ($("#formDejarComentario").valid()) {
        $("#btnRegistrarMensaje").button("loading");

        var mensaje = {};
        mensaje.Id = ($("#hdMensajeId").val() === "") ? 0 : parseInt($("#hdMensajeId").val());
        mensaje.Asunto = $("#txtAsuntoM").val();
        mensaje.Descripcion = $("#txtDescripcionM").val();
        mensaje.TipoMensajeId = $("#cbTipoM").val();

        $.ajax({
            url: URL_API + "/Alerta/Mensajes",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(mensaje),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        toastr.success("Enviado correctamente.", "Mensajes");
                    }
                }
            },
            complete: function () {
                $("#btnRegistrarMensaje").button("reset");
                $("#mdDejarMensaje").modal('hide');
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }

}