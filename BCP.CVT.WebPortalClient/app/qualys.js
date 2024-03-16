var $tableAsignadas = $("#tbQualyAsignadas");
var $tableNoAsignadas = $("#tbQualyNoAsignadas");
var URL_API_VISTA = URL_API + "/Qualy";
var DATA_EXPORTAR_ASIGNADAS = {};
var DATA_EXPORTAR_NO_ASIGNADAS = {};
var LIST_TECNOLOGIAQUALY = [];

$(function () {
    //SetItemsMultiple([1, 2, 3, 4, 5], $("#cbBusNivelSeveridadQualyAsignadas"), TEXTO_TODOS, TEXTO_TODOS, true);
    $("#cbBusNivelSeveridadQualyAsignadas").next().attr("style", "width: 100%");
    //SetItemsMultiple([1, 2, 3, 4, 5], $("#cbBusNivelSeveridadQualyNoAsignadas"), TEXTO_TODOS, TEXTO_TODOS, true);
    $("#cbBusNivelSeveridadQualyNoAsignadas").next().attr("style", "width: 100%");
    InitAutocompletarProducto($("#txtProductoQualy"), $("#hdnProductoIdQualy"), ".productoModalContainer");
    InitAutocompletarProducto($("#txtBusProductoStrQualyAsignadas"), $("#hdnBusProductoIdQualyAsignadas"), ".productoContainer");
    InitTabsOpen();
    initFechas();
    validarFormQualy();
    listarQualyAsignadas();
});

function InitTabsOpen() {
    $('a[href="#VulnAsignadas"]').on('shown.bs.tab', function (e) {
        listarQualyAsignadas();
    });
    $('a[href="#VulnNoAsignadas"]').on('shown.bs.tab', function (e) {
        listarQualyNoAsignadas();
    });
}

function InitAutocompletarProducto($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");

                $.ajax({
                    url: URL_API + `/Producto/ListadoByDescripcion?descripcion=${request.term}`,
                    dataType: "json",
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else
                return response(false);
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.Fabricante + " " + ui.item.Nombre);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Fabricante + " " + ui.item.Nombre);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Fabricante + " " + item.Nombre));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}

function initFechas() {
    $(`#divFechaPublicacionQualy`).datetimepicker({
        locale: 'es',
        useCurrent: false,
        defaultDate: new Date(),
        format: 'DD/MM/YYYY'
    });
}

function listarQualyAsignadas(flagDialog = true) {
    if (flagDialog) waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableAsignadas.bootstrapTable('destroy');
    $tableAsignadas.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'QualyId',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR_ASIGNADAS = {};
            DATA_EXPORTAR_ASIGNADAS.asignadas = true;
            DATA_EXPORTAR_ASIGNADAS.qualyId = $("#txtBusIdQualyAsignadas").val().trim() == "" ? null : $("#txtBusIdQualyAsignadas").val().trim();
            DATA_EXPORTAR_ASIGNADAS.titulo = $("#txtBusTituloQualyAsignadas").val().trim() == "" ? null : $("#txtBusTituloQualyAsignadas").val().trim();
            DATA_EXPORTAR_ASIGNADAS.nivelSeveridad = $("#cbBusNivelSeveridadQualyAsignadas").val() == null ? null : $("#cbBusNivelSeveridadQualyAsignadas").val();
            DATA_EXPORTAR_ASIGNADAS.productoStr = $("#txtBusProductoStrQualyAsignadas").val().trim() == "" ? null : $("#txtBusProductoStrQualyAsignadas").val().trim();
            DATA_EXPORTAR_ASIGNADAS.tecnologiaStr = null;
            DATA_EXPORTAR_ASIGNADAS.pageNumber = p.pageNumber;
            DATA_EXPORTAR_ASIGNADAS.pageSize = p.pageSize;
            DATA_EXPORTAR_ASIGNADAS.sortName = p.sortName;
            DATA_EXPORTAR_ASIGNADAS.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_ASIGNADAS);
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

function listarQualyNoAsignadas(flagDialog = true) {
    if (flagDialog) waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableNoAsignadas.bootstrapTable('destroy');
    $tableNoAsignadas.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'QualyId',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR_NO_ASIGNADAS = {};
            DATA_EXPORTAR_NO_ASIGNADAS.asignadas = false;
            DATA_EXPORTAR_NO_ASIGNADAS.qualyId = $("#txtBusIdQualyNoAsignadas").val().trim() == "" ? null : $("#txtBusIdQualyNoAsignadas").val().trim();
            DATA_EXPORTAR_NO_ASIGNADAS.titulo = $("#txtBusTituloQualyNoAsignadas").val().trim() == "" ? null : $("#txtBusTituloQualyNoAsignadas").val().trim();
            DATA_EXPORTAR_NO_ASIGNADAS.nivelSeveridad = $("#cbBusNivelSeveridadQualyNoAsignadas").val() == null ? null : $("#cbBusNivelSeveridadQualyNoAsignadas").val();
            //DATA_EXPORTAR_NO_ASIGNADAS.productoStr = $("#txtBusProductoStrQualy").val().trim() == "" ? null : $("#txtBusProductoStrQualy").val().trim();
            //DATA_EXPORTAR_NO_ASIGNADAS.tecnologiaStr = $("#txtBusTecnologiaStrQualy").val().trim() == "" ? null : $("#txtBusTecnologiaStrQualy").val().trim();
            DATA_EXPORTAR_NO_ASIGNADAS.pageNumber = p.pageNumber;
            DATA_EXPORTAR_NO_ASIGNADAS.pageSize = p.pageSize;
            DATA_EXPORTAR_NO_ASIGNADAS.sortName = p.sortName;
            DATA_EXPORTAR_NO_ASIGNADAS.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_NO_ASIGNADAS);
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

function listarTecnologiasQualy(data) {
    $("#tbTecnologiaQualy").bootstrapTable('destroy');
    $("#tbTecnologiaQualy").bootstrapTable({
        data: data,
        locale: 'es-SP',
        pagination: true,
    });
}

function validarFormQualy() {
    $.validator.addMethod("tecnologiaDuplicada", function (value, element) {
        let data = $("#tbTecnologiaQualy").bootstrapTable("getData");
        let tecnologiaId = $("#hdnTecnologiaIdQualy").val();
        let existeTecnologiaEnLista = data.some(x => x.TecnologiaId == tecnologiaId);

        return !existeTecnologiaEnLista;
    });

    $("#formAddOrEditQualy").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtProductoQualy: { requiredSinEspacios: true }
        },
        messages: {
            txtProductoQualy: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el producto") }
        }
    });
}

function opciones(value, row, index) {
    if (row.FlagDefault) {
        return `<a title="Cambiar estado"><i style="color:#A5A9AC;" class="glyphicon glyphicon-check"></i></a>`;
    }
    else {
        let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
        let type_icon = row.Activo ? "check" : "unchecked";

        return `<a href="javascript:cambiarEstado(${row.Id})" title="Cambiar estado"><i style="" id="cbOpcQualy${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    }
}

function opcionesTecnologiaQualy(value, row, index) {
    return `<a href="javascript:eliminarTecnologiaQualy(${row.TecnologiaId})" title="Eliminar"><i style="" id="cbOpcTecnologiaQualy${row.Id}" class="iconoRojo glyphicon glyphicon-trash"></i></a>`;
}

function eliminarTecnologiaQualy(tecnologiaId) {
    $("#tbTecnologiaQualy").bootstrapTable('remove', {
        field: 'TecnologiaId', values: [tecnologiaId]
    });
}

function MdAddOrEditQualy(EstadoMd) {
    limpiarMdAddOrEditQualy();

    if (EstadoMd)
        $("#MdAddOrEditQualy").modal(opcionesModal);
    else
        $("#MdAddOrEditQualy").modal('hide');
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:editarQualy(${row.Id})" title="Editar">${value}</a>`;
}

function editarQualy(QualyId) {
    //$("#titleFormQualy").html("Registro del Tipo de Ciclo de Vida");
    $.ajax({
        url: URL_API_VISTA + "/" + QualyId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditQualy(true);

            LIST_TECNOLOGIAQUALY = (result.ListaQualyTecnologia || []).map(x => x);

            $("#hdQualyId").val(result.Id);
            $("#txtQualyId").val(result.Id);
            $("#txtTipoVulnerabilidadQualy").val(result.TipoVulnerabilidad);
            $("#txtNivelSeveridadQualy").val(result.NivelSeveridad);
            $("#txtTituloQualy").val(result.Titulo);
            $("#txtCategoriaQualy").val(result.Categoria);
            $("#divFechaPublicacionQualy").data("DateTimePicker").date(result.FechaPublicacion == null ? null : new Date(result.FechaPublicacion));
            $("#txtListaSoftwareQualy").val(result.ListaSoftware);
            $("#txtProductoQualy").val(result.Producto == null ? "" : result.Producto.Nombre);
            $("#hdnProductoIdQualy").val(result.ProductoId);
            $("#txtDiagnosticoQualy").val(result.Diagnostico);
            $("#txtSolucionQualy").val(result.Solucion);
            $("#hdnProductoIdQualy").val();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function AddQualy() {
    //$("#titleFormQualy").html("Configurar Tipo de Cilo de Vida");
    $("#hdTipoCicloId").val('');
    MdAddOrEditQualy(true);
}

function limpiarMdAddOrEditQualy() {
    LimpiarValidateErrores($("#formAddOrEditQualy"));
    $("#hdQualyId").val("");
    $("#txtTipoVulnerabilidadQualy").val("");
    $("#txtNivelSeveridadQualy").val("");
    $("#txtTituloQualy").val("");
    $("#txtCategoriaQualy").val("");
    $("#divFechaPublicacionQualy").data("DateTimePicker").date(null);
    //$("#divFechaPublicacionQualy").data("DateTimePicker").date(new Date());
    $("#txtListaSoftwareQualy").val("");
    $("#txtProductoQualy").val("");
    $("#hdnProductoIdQualy").val("");
    $("#txtDiagnosticoQualy").val("");
    $("#txtSolucionQualy").val("");
    $("#tbTecnologiaQualy").bootstrapTable("removeAll");
}

function guardarAddOrEditQualy() {
    $(".field-tecnologia-qualy").addClass("ignore");
    $(".field-qualy").removeClass("ignore");
    if ($("#formAddOrEditQualy").valid()) {

        if ($("#hdnProductoIdQualy").val() == 0) {
            toastr.error("CVT", "Debes de seleccionar el producto antes de actualizar la vulnerabilidad seleccionada");
            return;
        }

        $("#btnRegQualy").button("loading");

        var Qualy = {};
        Qualy.Id = ($("#hdQualyId").val() === "") ? -1 : parseInt($("#hdQualyId").val());
        Qualy.TipoVulnerabilidad = $("#txtTipoVulnerabilidadQualy").val();
        Qualy.NivelSeveridad = parseInt($("#txtNivelSeveridadQualy").val());
        Qualy.Titulo = $("#txtTituloQualy").val();
        Qualy.Categoria = $("#txtCategoriaQualy").val();
        Qualy.FechaPublicacion = $("#divFechaPublicacionQualy").data("DateTimePicker").date() == null ? null : $("#divFechaPublicacionQualy").data("DateTimePicker").date().toDate().toISOString();
        Qualy.ListaSoftware = $("#txtListaSoftwareQualy").val();
        Qualy.Diagnostico = $("#txtDiagnosticoQualy").val();
        Qualy.ProductoId = ($("#hdnProductoIdQualy").val() === "") ? null : parseInt($("#hdnProductoIdQualy").val());
        Qualy.Solucion = $("#txtSolucionQualy").val();

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(Qualy),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                if (result) toastr.success("Registrado correctamente", "Registro del Qualy");
                else toastr.error("No se pudo registrar", "Ocurrió un error");
            },
            complete: function () {
                $("#btnRegQualy").button("reset");
                $(".tab-pane.active button[id*='btnBusBuscar']").trigger("click");
                //listarQualy(false);
                MdAddOrEditQualy(false);
            },
            error: function (result) {
                alert(result.responseText);
                waitingDialog.hide();
            }
        });
    }
}

function cambiarEstado(Id) {
    if (Id) {
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
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        type: 'GET',
                        contentType: "application/json; charset=utf-8",
                        url: `${URL_API_VISTA}/CambiarEstado?Id=${Id}`,
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Se cambió el estado correctamente", "");
                                    listarQualy(false);
                                }
                            }
                            else {
                                toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "");
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            var error = JSON.parse(xhr.responseText);
                            waitingDialog.hide();
                        },
                        complete: function (data) { }
                    });
                }
            }
        });
    }

}

function setDefault(value, row, index) {
    if (row.Activo) {
        let style_color = row.FlagDefault ? 'iconoVerde ' : "iconoRojo ";
        let type = row.FlagDefault ? "SI" : "NO";
        return `<a href="javascript:SetQualyDefault(${row.Id})" title="Modificar Default" class="${style_color}">${type}</i></a>`;
    }
    else {
        return `<a title="Modificar Default" style="color:#A5A9AC;">NO</a>`;
    }
}

function SetQualyDefault(Id) {
    if (Id) {
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
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        type: 'GET',
                        contentType: "application/json; charset=utf-8",
                        url: `${URL_API_VISTA}/CambiarDefault?Id=${Id}`,
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Se cambió el estado correctamente", "");
                                    listarQualy(false);
                                }
                            }
                            else {
                                toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "");
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            var error = JSON.parse(xhr.responseText);
                            waitingDialog.hide();
                        },
                        complete: function (data) { }
                    });
                }
            }
        });
    }
}

function ExportarQualyAsignadas() {
    let _data = $tableAsignadas.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        //bootbox.alert("No hay datos para exportar.");
        bootbox.alert({
            size: "small",
            title: "Registro de Vulnerabilidades - Qualys",
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
    //let filtro = $("#hFilProducto").val();
    let url = `${URL_API_VISTA}/Exportar?qualyId=${DATA_EXPORTAR_ASIGNADAS.qualyId || ''}&titulo=${DATA_EXPORTAR_ASIGNADAS.titulo || ''}&nivelSeveridad=${DATA_EXPORTAR_ASIGNADAS.nivelSeveridad || ''}&productoStr=${DATA_EXPORTAR_ASIGNADAS.productoStr || ''}&tecnologiaStr=${DATA_EXPORTAR_ASIGNADAS.tecnologiaStr || ''}&asignadas=true&sortName=${DATA_EXPORTAR_ASIGNADAS.sortName}&sortOrder=${DATA_EXPORTAR_ASIGNADAS.sortOrder}`;
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

function ExportarQualyNoAsignadas() {
    let _data = $tableAsignadas.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        //bootbox.alert("No hay datos para exportar.");
        bootbox.alert({
            size: "small",
            title: "Registro de Vulnerabilidades - Qualys",
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
    //let filtro = $("#hFilProducto").val();
    let url = `${URL_API_VISTA}/Exportar?qualyId=${DATA_EXPORTAR_ASIGNADAS.qualyId || ''}&titulo=${DATA_EXPORTAR_ASIGNADAS.titulo || ''}&nivelSeveridad=${DATA_EXPORTAR_ASIGNADAS.nivelSeveridad || ''}&productoStr=${DATA_EXPORTAR_ASIGNADAS.productoStr || ''}&tecnologiaStr=${DATA_EXPORTAR_ASIGNADAS.tecnologiaStr || ''}&asignadas=false&sortName=${DATA_EXPORTAR_ASIGNADAS.sortName}&sortOrder=${DATA_EXPORTAR_ASIGNADAS.sortOrder}`;
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