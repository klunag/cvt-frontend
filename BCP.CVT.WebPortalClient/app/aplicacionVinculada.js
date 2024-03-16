var $table = $("#tblAppVinculada");
var URL_API_VISTA = URL_API + "/Relacion";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Aplicaciones relacionadas";
var FLAG_RELACION = 0;

$(function () {
    listarAplicacionesVinculadas();
   
    validarFormAppVin();
    InitAutocompletarAplicacion($("#txtAppBase"), $("#hdAppBaseId"), ".appBaseContainer", 0); //App Base
    InitAutocompletarAplicacion($("#txtAppVinculo"), $("#hdAppVinculoId"), ".appVinculoContainer", 1); //App Vinculo
    
});

function buscarAppVinculada() {
    listarAplicacionesVinculadas();
}

function listarAplicacionesVinculadas() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListarAplicacionesVinculadas",
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
            DATA_EXPORTAR.nombre = $.trim($("#txtBusAppVin").val());
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

function irAplicacionVinculada() {
    LimpiarValidateErrores($("#formAppVin"));
    $("#txtAppBase").val('');
    $("#txtAppVinculo").val('');
    $("#cbEquipoVin").val(-1);
    $("#txtDetAppVin").val('');
    $("#MdAppVin").modal(opcionesModal);
}

function InitAutocompletarAplicacion($searchBox, $IdBox, $container, valor) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Aplicacion" + "/GetAplicacionRelacionarByFiltro?filtro=" + request.term,
                    //data: JSON.stringify({
                    //    filtro: request.term
                    //}),
                    //dataType: "json",
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_APLICACION = data;
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else {
                return response(true);
            }
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            if (valor === 1) {
                obtenerEquiposByAppVinculo(ui.item.Id);
                LimpiarValidateErrores($("#formAppVin"));
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function obtenerEquiposByAppVinculo(codigo) {
    //console.log(Id);
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Relacion" + `/ListarEquiposByAplicacion?codigoAPT=${codigo}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //estado = dataObject;
                    FLAG_RELACION = dataObject.length;
                    console.log(FLAG_RELACION);
                    SetItems(dataObject, $("#cbEquipoVin"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function guardarAplicacionVinculada() {
    if ($("#formAppVin").valid()) {

        $("#btnRegAppVin").button("loading");

        var appVin = {};
        appVin.Id = 0;//($("#hIdTipo").val() === "") ? 0 : parseInt($("#hIdTipo").val());
        appVin.CodigoAPT = $("#hdAppBaseId").val();
        appVin.VinculoCodigoAPT = $("#hdAppVinculoId").val();
        appVin.EquipoId = $("#cbEquipoVin").val();
        appVin.DetalleVinculo = $("#txtDetAppVin").val();

        $.ajax({
            url: URL_API_VISTA + "/RegistrarAplicacionVinculada",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(appVin),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        listarAplicacionesVinculadas();
                        toastr.success("Registrado correctamente", TITULO_MENSAJE);
                    }
                }
            },
            complete: function () {
                $("#btnRegAppVin").button("reset");
                //$("#txtBusTipo").val('');               
                $("#MdAppVin").modal('hide');
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}

function validarFormAppVin() {

    $.validator.addMethod("tieneRelacion", function (value, element) {
        //let estado = false;
        //if ($.trim(value) !== "" && $.trim($("#hdAppBaseId").val()) !== "0") {
        //    estado = ExisteAplicacion($("#hdAppBaseId"));
        //    return estado;
        //}
        let estado = FLAG_RELACION > 0 ? true : false;    
        return estado;
    });


    $.validator.addMethod("existeAplicacionBase", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $.trim($("#hdAppBaseId").val()) !== "0") {
            estado = ExisteAplicacion($("#hdAppBaseId"));
            return estado;
        }

        return estado;
    });

    $.validator.addMethod("existeAplicacionVinculo", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $.trim($("#hdAppVinculoId").val()) !== "0") {
            estado = ExisteAplicacion($("#hdAppVinculoId"));
            return estado;
        }

        return estado;
    });

    $.validator.addMethod("distintoCodigo", function (value, element) {
        let estado = true;
        let appBaseId = $("#hdAppBaseId").val();
        let appVinculoId = $("#hdAppVinculoId").val();

        if ($.trim(value) !== "" && $.trim(appBaseId) !== "0" && $.trim(appVinculoId) !== "0") {
            estado = appBaseId !== appVinculoId ? true : false;
            return estado;
        }

        return estado;
    });

    $("#formAppVin").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtAppBase: {
                requiredSinEspacios: true,
                distintoCodigo: true,
                existeAplicacionBase: true
            },
            txtAppVinculo: {
                requiredSinEspacios: true,
                distintoCodigo: true,
                existeAplicacionVinculo: true,
                tieneRelacion: true
            },
            cbEquipoVin: {
                requiredSelect: true
            },
            txtDetAppVin: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtAppBase: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
                distintoCodigo: "Debes seleccionar una aplicación diferente",
                existeAplicacionBase: "La aplicación seleccionada no existe"              
            },
            txtAppVinculo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
                distintoCodigo: "Debes seleccionar una aplicación diferente",
                existeAplicacionVinculo: "La aplicación seleccionada no existe",
                tieneRelacion: "La aplicación seleccionada no tiene equipos relacionados"
            },
            cbEquipoVin: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el equipo")
            },
            txtDetAppVin: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el recurso relacionado")
            }
        }
    });
}

function ExisteAplicacion($appId) {
    let estado = false;
    //let nombre = $("#txtAplicacion").val();
    let Id = $appId.val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Aplicacion" + `/ExisteAplicacionRelacionar?Id=${Id}`,
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

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        bootbox.alert({
            size: "small",
            title: TITULO_MENSAJE,
            message: "No hay datos para exportar.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
        return false;
    }
    let url = `${URL_API_VISTA}/ExportarAplicacionesVinculadas?nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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
}