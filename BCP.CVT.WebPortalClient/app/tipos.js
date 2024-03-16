var $table = $("#tbl-tipos");
var URL_API_VISTA = URL_API + "/Tipo";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Tipos de tecnologías";
var fileDownloadCheckTimer;

$(function () {
    FormatoCheckBox($("#divActivo"), 'cbActTipo');
    FormatoCheckBox($("#divFlagStandar"), 'cbFlagEstandar');
    FormatoCheckBox($("#divFlagMostrarEstado"), 'cbFlagMostrarEstado');

    $("#cbActTipo").change(ddlLimpiarValidate_change);
    $("#cbFlagEstandar").change(ddlLimpiarValidate_change);
    $("#cbFlagMostrarEstado").change(ddlLimpiarValidate_change);

    validarFormTipo();
    listarTipos();
});

function ddlLimpiarValidate_change() {
    LimpiarValidateErrores($("#formAddOrEditTipo"));
}

function TieneFlagEstandar() {
    let estado = false;
    //let Id = $("#hIdTipo").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + '/TieneFlagEstandar',
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

function validarFormTipo() {

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

    $("#formAddOrEditTipo").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomTipo: {
                requiredSinEspacios: true
            },
            txtDesTipo: {
                requiredSinEspacios: true
            },
            msjActivo: {
                hasTecAsociadas: true
            },
            msjFlagEstandar: {
                tieneFlagEstandar: true
            }
        },
        messages: {
            txtNomTipo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtDesTipo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
            msjActivo: {
                hasTecAsociadas: "Estado no posible"
            },
            msjFlagEstandar: {
                tieneFlagEstandar: "Flag estandar no posible"
            }
        }
    });
}

function limpiarMdAddOrEditTipo() {
    $("#txtNomTipo").val('');
    $("#txtDesTipo").val('');
    $("#cbActTipo").prop('checked', true);
    $("#cbActTipo").bootstrapToggle('on');
}

function MdAddOrEditTipo(EstadoMd) {
    limpiarMdAddOrEditTipo();
    $("#formAddOrEditTipo").validate().resetForm();
    if (EstadoMd)
        $("#MdAddOrEditTipo").modal(opcionesModal);
    else
        $("#MdAddOrEditTipo").modal('hide');
}

function buscarTipo() {
    listarTipos();
}

function listarTipos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',

        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusTipo").val());
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

function AddTipo() {
    $("#titleFormTipo").html("Nuevo Tipo");
    $("#hIdTipo").val('');
    $("#hdNumTecAsoc").val("0");
    MdAddOrEditTipo(true);
}

function EditTipo(TipoId, NumTecAsociadas) {
    $("#titleFormTipo").html("Editar Tipo");
    $.ajax({
        url: URL_API_VISTA + "/" + TipoId,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        dataType: "json",
        success: function (result) {
            MdAddOrEditTipo(true);

            $("#hIdTipo").val(result.Id);
            $("#hdNumTecAsoc").val(NumTecAsociadas);
            $("#txtNomTipo").val(result.Nombre);
            $("#txtDesTipo").val(result.Descripcion);
            $("#cbActTipo").prop('checked', result.Activo);
            $("#cbActTipo").bootstrapToggle(result.Activo ? 'on' : 'off');
            $("#cbFlagEstandar").prop('checked', result.FlagEstandar);
            $("#cbFlagEstandar").bootstrapToggle(result.FlagEstandar ? 'on' : 'off');

            $("#cbFlagMostrarEstado").prop('checked', result.FlagMostrarEstado);
            $("#cbFlagMostrarEstado").bootstrapToggle(result.FlagMostrarEstado ? 'on' : 'off');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function GuardarAddOrEditTipo() {
    if ($("#formAddOrEditTipo").valid()) {
        $("#btnRegTipo").button("loading");

        var tipo = {};
        tipo.Id = ($("#hIdTipo").val() === "") ? 0 : parseInt($("#hIdTipo").val());
        tipo.Nombre = $("#txtNomTipo").val().trim();
        tipo.Descripcion = $("#txtDesTipo").val();
        tipo.Activo = $("#cbActTipo").prop("checked");
        tipo.FlagEstandar = $("#cbFlagEstandar").prop("checked");
        tipo.FlagMostrarEstado = $("#cbFlagMostrarEstado").prop("checked");

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            data: tipo,
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);                
            },
            complete: function () {
                $("#btnRegTipo").button("reset");
                $("#txtBusTipo").val('');
                $table.bootstrapTable('refresh');
                MdAddOrEditTipo(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:EditTipo(${row.Id}, ${row.NumTecAsociadas})" title="Editar">${value}</a>`;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:CambiarEstado(${row.Id}, ${row.NumTecAsociadas})" title="Cambiar estado"><i id="cbOpcTip${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return estado;
}

function CambiarEstado(TipoId, NumTecAsociadas) {
    if (NumTecAsociadas > 0) {
        bootbox.alert({
            size: "small",
            title: TITULO_MENSAJE,
            message: "No se puede cambiar el estado debido que existen otras entidades que tienen relación.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    } else {
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
                        url: `${URL_API_VISTA}/CambiarEstado?Id=${TipoId}`,
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                        success: function (dataObject, textStatus) {                          
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    $("#txtBusTipo").val('');
                                    listarTipos();
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
                            //$table.bootstrapTable('refresh');
                        }
                    });
                } 
            }
        });
    }
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
    $.ajax({
        url: url,
        contentType: "application/vnd.ms-excel",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            let bytes = Base64ToBytes(data.excel);
            var blob = new Blob([bytes], { type: "application/octetstream" });
            let url = URL.createObjectURL(blob);
            let link = document.createElement("a");
            link.href = url;
            link.download = data.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, complete: function (xhr, status) {
            waitingDialog.hide();
        }
    });

    //fileDownloadCheckTimer = window.setInterval(function () {
    //    console.log(window.XMLHttpRequest);
    //    console.log(window.status);
    //    console.log(window.statusbar);
    ////var cookieValue = $.cookie('fileDownloadToken');
    ////if (cookieValue === token)
    ////    finishDownload();
    //}, 2000);

}





//var req = new XMLHttpRequest();
//req.open('GET', 'url', false);
//req.send(null);

function finishDownload() {
    window.clearInterval(fileDownloadCheckTimer);
    $.removeCookie('fileDownloadToken', { path: '/' });
    //$("#divMensaje").html("Gracias por descargar el Kit de Materiales.");
    waitingDialog.hide();
}

