var $table = $("#tblRegistro");
var DATA_EXPORTAR = {};

const TITULO_MENSAJE = "Estandar portafolio";
const TIPO_TECNOLOGIA_ESTANDAR = 1;
const URL_API_VISTA = URL_API + "/Aplicacion/ConfiguracionPortafolio";
const TIPO_ESTANDAR_PORTAFOLIO = { SO: 1, HP: 2, BD: 3, FW: 4 };
const TABLE_LIFE = {
    Table: $table,
    UrlListado: "ListarEstandarPortafolio",
    UrlGetById: "GetEstandarPortafolioById",
    UrlAddOrEdit: "AddOrEditEstandarPortafolio",
    UrlCambiarEstado: "CambiarEstadoEstandarPortafolio",
    UrlCargarCombos: "CargarCombosEstandarPortafolio",
    UrlExportar: "ExportarEstandarPortafolio",
    TitleModal: "Estándar Portafolio"
};

$(function () {
    CargarCombos();
    $("#ddlTipoTecnologiaFiltro").val(TIPO_TECNOLOGIA_ESTANDAR);
    ListarRegistros(TABLE_LIFE);
    ValidarFormRegistro();
    InitAcciones();
    //$("#ddlTipoEstandar").change(DdlTipoEstandar_Change);
    //InitAutocompletarEstandarBuilder($("#txtNombre"), null, ".divNombreEstandarContainer", "/Tecnologia/GetTecnologiaEstandarByFiltro?filtro={0}&subdominioList={1}");
});
//EstadoId
//Vigente: 1
//Deprecado: 2
//Obsoleto: 3

//SubdominioId
//SO: 36
//HP: 13
//BD: 68 y 69
//FW: 14

function DdlTipoEstandar_Change() {
    let subdominioStr = "";
    let ddlVal = parseInt($(this).val());
    if (ddlVal !== -1) {
        switch (ddlVal) {
            case TIPO_ESTANDAR_PORTAFOLIO.SO:
                subdominioStr = "36";
                break;
            case TIPO_ESTANDAR_PORTAFOLIO.HP:
                subdominioStr = "13";
                break;
            case TIPO_ESTANDAR_PORTAFOLIO.BD:
                subdominioStr = "68;69";
                break;
            case TIPO_ESTANDAR_PORTAFOLIO.FW:
                subdominioStr = "14";
                break;
        }
        $("#hdSubdominioListId").val(subdominioStr);
    }
}

function InitAcciones() {
    $("#btnBuscar").click(RefrescarListado);
    $("#btnExportar").click(ExportarRegistros);
    //$("#btnNuevo").click(AddRegistro);
    //$("#btnRegistrar").click(GuardarRegistro);
}

function ExportarRegistros() {
    let _data = TABLE_LIFE.Table.bootstrapTable('getData') || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);

        return false;
    }

    let url = `${URL_API_VISTA}/${TABLE_LIFE.UrlExportar}?TipoTecnologiaId=${DATA_EXPORTAR.TipoTecnologiaId}&EstadoId=${DATA_EXPORTAR.EstadoId}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function RefrescarListado() {
    ListarRegistros(TABLE_LIFE);
}

function AddRegistro() {
    $("#title-md").html(`Nuevo ${TABLE_LIFE.TitleModal}`);
    LimpiarModal();
    OpenCloseModal($("#mdRegistro"), true);
}

function LimpiarModal() {
    LimpiarValidateErrores($("#formAddOrEditRegistro"));
    $(":input", "#formAddOrEditRegistro").val("");
    $("#ddlTipoEstandar").val("-1");
}

function ListarRegistros(TABLE_LIFE) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    TABLE_LIFE.Table.bootstrapTable('destroy');
    TABLE_LIFE.Table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/" + TABLE_LIFE.UrlListado,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            //DATA_EXPORTAR.nombre = $.trim($("#txtFiltro").val());
            DATA_EXPORTAR.TipoTecnologiaId = $("#ddlTipoTecnologiaFiltro").val() !== "-1" ? $("#ddlTipoTecnologiaFiltro").val() : null;
            DATA_EXPORTAR.EstadoId = $("#ddlEstadoFiltro").val() !== "-1" ? $("#ddlEstadoFiltro").val() : null;
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

function GuardarRegistro() {
    if ($("#formAddOrEditRegistro").valid()) {
        $("#btnRegistrar").button("loading");

        let data = {
            Id: ($("#hdRegistroId").val() === "") ? 0 : parseInt($("#hdRegistroId").val()),
            Nombre: $.trim($("#txtNombre").val()),
            Descripcion: $.trim($("#txtDescripcion").val()),
            TipoEstandarId: $("#ddlTipoEstandar").val(),
            PuntuacionServidor: $.trim($("#txtPuntuacionServidor").val()),
            PuntuacionEstacion: $.trim($("#txtPuntuacionEstacion").val()),
        };

        $.ajax({
            url: URL_API_VISTA + "/" + TABLE_LIFE.UrlAddOrEdit,
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                RefrescarListado();
            },
            complete: function () {
                $("#btnRegistrar").button("reset");
                OpenCloseModal($("#mdRegistro"), false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function EditarRegistro(_id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#title-md").html(`Editar ${TABLE_LIFE.TitleModal}`);
    $.ajax({
        url: URL_API_VISTA + `/${TABLE_LIFE.UrlGetById}?id=${_id}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "GET",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;
                    LimpiarModal();
                    OpenCloseModal($("#mdRegistro"), true);

                    $("#hdRegistroId").val(data.Id);
                    $("#txtNombre").val(data.Nombre);
                    $("#txtDescripcion").val(data.Descripcion);
                    $("#ddlTipoEstandar").val(data.TipoEstandarId);
                    $("#txtPuntuacionServidor").val(data.PuntuacionServidor);
                    $("#txtPuntuacionEstacion").val(data.PuntuacionEstacion);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function ValidarFormRegistro() {
    $("#formAddOrEditRegistro").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombre: {
                requiredSinEspacios: true
            },
            ddlTipoEstandar: {
                requiredSelect: true
            },
            txtPuntuacionServidor: {
                requiredSinEspacios: true,
                number: true
            },
            txtPuntuacionEstacion: {
                requiredSinEspacios: true,
                number: true
            }
            //txtDescripcion: {
            //    requiredSinEspacios: true
            //}
        },
        messages: {
            txtNombre: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            ddlTipoEstandar: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo")
            },
            txtPuntuacionServidor: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la puntuación"),
                number: "Debes ingresar un número"
            },
            txtPuntuacionEstacion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la puntuación"),
                number: "Debes ingresar un número"
            }
            //txtDescripcion: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            //}
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDistribuida" || element.attr('name') === "txtMainframe"
                || element.attr('name') === "txtUserItWeb" || element.attr('name') === "txtUserItCliente") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function linkFormatter(value, row, index) {
    let option = value;
    if (row.Activo) {
        option = `<a href="javascript:EditarRegistro(${row.Id})" title="Editar registro">${value}</a>`;
    }
    return option;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let btnEstado = `<a href="javascript:CambiarEstadoRegistro(${row.Id}, ${row.Activo})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    let btnEliminar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar registro"><i class="${style_color} glyphicon glyphicon-trash"></i></a>`;

    return btnEstado.concat("&nbsp;&nbsp;", btnEliminar);
}

function irEliminar(id) {
    let validarDependencia = ExisteRelacionPortafolio(id, ENTIDAD_MANTENIMIENTO);
    if (!validarDependencia) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: "¿Estás seguro(a) que deseas eliminar el registro seleccionado?",
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
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/EliminarRegistroByConfiguracion?id=${id}&idConfiguracion=${ENTIDAD_MANTENIMIENTO}`,
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        type: "GET",
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    waitingDialog.hide();
                                    toastr.success("Se eliminó el registro correctamente", TITULO_MENSAJE);
                                    ListarRegistros(TABLE_LIFE);
                                }
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
            }
        });
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, "No es posible eliminar el registro porque esta relacionado con otras entidades");
    }
}

function CambiarEstadoRegistro(id, estadoActual) {
    let mensaje = estadoActual ? "desactivar" : "activar";
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: `¿Estás seguro(a) que deseas ${mensaje} el registro seleccionado?`,
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
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/${TABLE_LIFE.UrlCambiarEstado}?id=${id}&estadoActual=${estadoActual}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    dataType: "json",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                waitingDialog.hide();
                                toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}

function CargarCombos() {
    $.ajax({
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/" + TABLE_LIFE.UrlCargarCombos,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoTecnologia, $("#ddlTipoTecnologiaFiltro"), TEXTO_TODOS);
                    SetItems(dataObject.Estado, $("#ddlEstadoFiltro"), TEXTO_TODOS);
                    //SetItems(dataObject.TipoEstandar, $("#ddlTipoEstandar"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function InitAutocompletarEstandarBuilder($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term, $("#hdSubdominioListId").val());

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API + urlControllerWithParams,
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    type: "GET",
                    success: function (data) {
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else
                return response(true);
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) $IdBox.val(ui.item.Id);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Descripcion + "</font></a>").appendTo(ul);
    };
}