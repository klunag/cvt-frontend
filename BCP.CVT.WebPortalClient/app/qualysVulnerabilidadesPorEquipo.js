var $table = $("#tbQualy");
var URL_API_VISTA = URL_API + "/Qualy";
var DATA_EXPORTAR = {};
var LIST_TECNOLOGIAQUALY = [];

$(function () {
    //SetItemsMultiple([1, 2, 3, 4, 5], $("#cbBusNivelSeveridadQualy"), TEXTO_TODOS, TEXTO_TODOS, true);
    //$("#cbBusNivelSeveridadQualy").next().attr("style", "width: 100%");
    //InitAutocompletarProducto($("#txtProductoQualy"), $("#hdnProductoIdQualy"), ".productoModalContainer");
    //InitAutocompletarProducto($("#txtBusProductoStrQualy"), $("#hdnBusProductoIdQualy"), ".productoContainer");
    //InitAutocompletarTecnologia($("#txtTecnologiaQualy"), $("#hdnTecnologiaIdQualy"), $(".tecnologiaModalContainer"), AgregarTecnologia);
    //InitAutocompletarTecnologia($("#txtBusTecnologiaStrQualy"), $("#hdnBusTecnologiaIdQualy"), $(".tecnologiaContainer"));
    //initFechas();
    //validarFormQualy();
    listarQualy();
    listarTecnologiasQualy([]);
});

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
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Fabricante + " " + item.Nombre + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarTecnologia($searchBox, $IdBox, $Container, fn = null) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API + "/Tecnologia/GetTecnologiaByClaveById",
                    data: JSON.stringify({
                        filtro: request.term,
                        id: ($("#hdnTecnologiaIdQualy").val() === "" || $("#hdnTecnologiaIdQualy").val() === "0") ? null : parseInt($("#hdnTecnologiaIdQualy").val())
                    }),
                    dataType: "json",
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_APLICACION = data;
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
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);

            if (typeof fn == "function") fn($searchBox, $IdBox, $Container, ui.item);

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function AgregarTecnologia($searchBox, $IdBox, $Container, data) {
    $(".field-qualy").addClass("ignore");
    $(".field-tecnologia-qualy").removeClass("ignore");
    if ($("#formAddOrEditQualy").valid()) {
        let item = {};
        item.Id = -1;
        item.QualyId = -1;
        item.TecnologiaId = parseInt(data.Id);
        item.Tecnologia = {};
        item.Tecnologia.ClaveTecnologia = data.Descripcion

        $("#tbTecnologiaQualy").bootstrapTable("append", item);

        $IdBox.val("");
        $searchBox.val("");
    }
}

function initFechas() {
    $(`#divFechaPublicacionQualy`).datetimepicker({
        locale: 'es',
        useCurrent: false,
        defaultDate: new Date(),
        format: 'DD/MM/YYYY'
    });
}

function listarQualy(flagDialog = true) {
    if (flagDialog) waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListadoVulnerabilidadesPorEquipo",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'q.QualyId',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.qualyId = $("#txtBusIdQualy").val().trim() == "" ? null : $("#txtBusIdQualy").val().trim();
            DATA_EXPORTAR.equipo = $("#txtBusEquipoQualy").val().trim() == "" ? null : $("#txtBusEquipoQualy").val().trim();
            DATA_EXPORTAR.tipoVulnerabilidad = $("#txtBusTipoVulnerabilidadQualy").val().trim() == "" ? null : $("#txtBusTipoVulnerabilidadQualy").val().trim();
            //DATA_EXPORTAR.titulo = $("#txtBusTituloQualy").val().trim() == "" ? null : $("#txtBusTituloQualy").val().trim();
            //DATA_EXPORTAR.nivelSeveridad = $("#cbBusNivelSeveridadQualy").val() == null ? null : $("#cbBusNivelSeveridadQualy").val().join(",");
            //DATA_EXPORTAR.productoStr = $("#txtBusProductoStrQualy").val().trim() == "" ? null : $("#txtBusProductoStrQualy").val().trim();
            //DATA_EXPORTAR.tecnologiaStr = $("#txtBusTecnologiaStrQualy").val().trim() == "" ? null : $("#txtBusTecnologiaStrQualy").val().trim();
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
            //txtTipoVulnerabilidadQualy: { requiredSinEspacios: true },
            //txtNivelSeveridadQualy: {
            //    requiredSinEspacios: true,
            //    number: true,
            //    min: 1
            //},
            //txtTituloQualy: { requiredSinEspacios: true },
            //txtCategoriaQualy: { requiredSinEspacios: true },
            //txtFechaPublicacionQualy: { requiredSinEspacios: true },
            //txtListaSoftwareQualy: { requiredSinEspacios: true },
            //txtProductoQualy: { requiredSinEspacios: true },
            //txtDiagnosticoQualy: { requiredSinEspacios: true },
            //txtSolucionQualy: { requiredSinEspacios: true }
            txtTecnologiaQualy: { tecnologiaDuplicada: true }
        },
        messages: {
            //txtTipoVulnerabilidadQualy: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el tipo de vulnerabilidad") },
            //txtNivelSeveridadQualy: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nivel de severidad"),
            //    number: "Debes ingresar número",
            //    min: "Debe ingresar un número mayor o igual a 1",
            //},
            //txtTituloQualy: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nivel de severidad") },
            //txtCategoriaQualy: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "la categoría") },
            //txtFechaPublicacionQualy: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha de publicación") },
            //txtListaSoftwareQualy: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "la lista de software") },
            //txtProductoQualy: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el producto") },
            //txtDiagnosticoQualy: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el diagnóstico") },
            //txtSolucionQualy: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "la solución") }
            txtTecnologiaQualy: { tecnologiaDuplicada: String.Format("La tecnología seleccionar {0}.", "ya existe") }
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
            $("#txtReferenciaVendedorQualy").val(result.ReferenciaVendedor);
            $("#txtMalwareAsociadoQualy").val(result.MalwareAsociado);
            $("#txtPCIVulnQualy").val(result.PCIVuln);
            $("#txtExplotabilidadQualy").val(result.Explotabilidad);
            $("#txtAmenazaQualy").val(result.Amenaza);
            $("#txtImpactoQualy").val(result.Impacto);
            $("#tbTecnologiaQualy").bootstrapTable("load", LIST_TECNOLOGIAQUALY.map(x => x));
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
    $("#txtReferenciaVendedorQualy").val("");
    $("#txtMalwareAsociadoQualy").val("");
    $("#txtPCIVulnQualy").val("");
    $("#txtExplotabilidadQualy").val("");
    $("#txtAmenazaQualy").val("");
    $("#txtImpactoQualy").val("");
    $("#tbTecnologiaQualy").bootstrapTable("removeAll");
}

function guardarAddOrEditQualy() {
    $(".field-tecnologia-qualy").addClass("ignore");
    $(".field-qualy").removeClass("ignore");
    if ($("#formAddOrEditQualy").valid()) {
        $("#btnRegQualy").button("loading");

        let listTecnologiaQualyActual = $("#tbTecnologiaQualy").bootstrapTable("getData");
        let listTecnologiaQualyActualSinId = listTecnologiaQualyActual.filter(x => x.Id == -1);
        let listTecnologiaQualyActualConId = listTecnologiaQualyActual.filter(x => x.Id != -1);
        let listTecnologiaQualyEliminar = LIST_TECNOLOGIAQUALY.map(x => x.Id).filter(x => !listTecnologiaQualyActualConId.some(y => y.Id == x));

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
        Qualy.ReferenciaVendedor = $("#txtReferenciaVendedorQualy").val();
        Qualy.MalwareAsociado = $("#txtMalwareAsociadoQualy").val();
        Qualy.PCIVuln = $("#txtPCIVulnQualy").val();
        Qualy.Explotabilidad = $("#txtExplotabilidadQualy").val();
        Qualy.Amenaza = $("#txtAmenazaQualy").val();
        Qualy.Impacto = $("#txtImpactoQualy").val();
        Qualy.ListaQualyTecnologiaEliminar = listTecnologiaQualyEliminar;
        Qualy.ListaQualyTecnologia = listTecnologiaQualyActualSinId;

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
                listarQualy(false);
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

function ExportarQualy() {
    let _data = $table.bootstrapTable("getData") || [];
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
    let url = `${URL_API_VISTA}/Exportar?qualyId=${DATA_EXPORTAR.qualyId || ''}&titulo=${DATA_EXPORTAR.titulo || ''}&nivelSeveridad=${DATA_EXPORTAR.nivelSeveridad || ''}&productoStr=${DATA_EXPORTAR.productoStr || ''}&tecnologiaStr=${DATA_EXPORTAR.tecnologiaStr || ''}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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