var $table = $("#tbl-lista");
var $tblTecnologias = $("#tbl-tecnologias");
var $tblAplicaciones = $("#tbl-aplicaciones");
var $tblAplicacionesSingle = $("#tbl-aplicaciones-single");
var URL_API_VISTA = URL_API + "/Producto";
var ItemsRemoveAppId = [];
var DATA_EXPORTAR = {};
var CODIGO_INTERNO = 0;
var LIST_SUBDOMINIO = [];
var LIST_APPSTECNOLOGIA = [];
var LIST_APPSTECNOLOGIASINGLE = [];


$(function () {
    initFecha();
    $tblTecnologias.bootstrapTable();
    $tblAplicaciones.bootstrapTable();
    $tblAplicacionesSingle.bootstrapTable();

    FormatoCheckBox($("#divFlagAplicacion"), "chkFlagAplicacion");

    $("#cbDominioIdProducto").change(CargarSubDominio);
    $("#MdTecnologiaByProducto").on("hide.bs.modal", MdCloseTecnologiaProducto);
    $("#txtVersionTecnologia, #txtFabricanteProducto, #txtNombreProducto").keyup(GenerarClaveTecnologia);
    $("#cbTipoTecnologiaIdTecnologia").change(CbTipoTecnologiaIdTecnologiaChange);

    //InitAutocompletarGrupoTicketRemedy($("#txtGrupoTicketRemedyProducto"), $("#hdGrupoTicketRemedyIdProducto"), ".grupoTicketRemedyProductoContainer");
    //InitAutocompletarAplicacionProducto($("#txtCodigoAplicacionProducto"), $("#hdAplicacionIdProducto"), ".codigoAplicacionContainer");
    //InitAutocompletarAplicacionTecnologia($("#txtAplicacionTecnologia"), $("#hdAplicacionIdTecnologia"), ".aplicacionContainer");
    //InitAutocompletarAplicacionTecnologiaSingle($("#txtAplicacionTecnologiaSingle"), $("#hdAplicacionIdTecnologiaSingle"), ".aplicacionSingleContainer");
    cargarCodigoInterno(() => {
        //$("#cbEstadoObsolescenciaIdProducto").val(estadoObsolescenciaIdObsoleto);
        validarFormProducto();
        validarFormTecnologia();
        //validarFormAplicaciones();
        listarProductos();
    });
});

function initFecha() {
    $("#divFechaLanzamientoTecnologia, #divFechaFinExtendidaTecnologia, #divFechaFinSoporteTecnologia, #divFechaFinInternaTecnologia").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY",
        date: new Date()
    });
}

function initUpload(txtNombreArchivo) {
    var inputs = document.querySelectorAll('.inputfile');
    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener('change', function (e) {
            var fileName = '';
            if (this.files && this.files.length > 1)
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            else
                fileName = e.target.value.split('\\').pop();

            if (fileName)
                txtNombreArchivo.val(fileName);
            else
                label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
}

function InitAutocompletarGrupoTicketRemedy($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/applicationportfolio" + "/application/ListGroupRemedy?filtro=" + request.term,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_TECNOLOGIA = data;
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

            //LimpiarValidateErrores($("#formTecnologia"));
            $IdBox.val(ui.item.Id);

            //var estItem = $tblAplicaciones.bootstrapTable('getRowByUniqueId', ui.item.Id);

            //if (estItem === null) {
            //    //$txtNomTecByProducto.val(ui.item.Tecnologia);
            //    $searchBox.val('');

            //    $tblAplicaciones.bootstrapTable('append', {
            //        TecId: ui.item.Id,
            //        Tecnologia: ui.item.Descripcion,
            //        Dominio: ui.item.Dominio,
            //        Subdominio: ui.item.Subdominio,
            //        Familia: ui.item.Familia,
            //        ActivoDetalle: ui.item.ActivoDetalle
            //    });
            //}

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarOwner($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/applicationportfolio" + "/application/ListGroupRemedy?filtro=" + request.term,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_TECNOLOGIA = data;
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

            //LimpiarValidateErrores($("#formTecnologia"));
            $IdBox.val(ui.item.Id);

            //var estItem = $tblAplicaciones.bootstrapTable('getRowByUniqueId', ui.item.Id);

            //if (estItem === null) {
            //    //$txtNomTecByProducto.val(ui.item.Tecnologia);
            //    $searchBox.val('');

            //    $tblAplicaciones.bootstrapTable('append', {
            //        TecId: ui.item.Id,
            //        Tecnologia: ui.item.Descripcion,
            //        Dominio: ui.item.Dominio,
            //        Subdominio: ui.item.Subdominio,
            //        Familia: ui.item.Familia,
            //        ActivoDetalle: ui.item.ActivoDetalle
            //    });
            //}

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarAplicacionProducto($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Aplicacion" + "/GetAplicacionRelacionarByFiltro?filtro=" + request.term,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_TECNOLOGIA = data;
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
            $IdBox.val(ui.item.IdAplicacion);
            $("#hdAplicacionCodigoProducto").val(ui.item.Id);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarAplicacionTecnologia($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Aplicacion" + "/GetAplicacionRelacionarByFiltro?filtro=" + request.term,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_TECNOLOGIA = data;
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

            //LimpiarValidateErrores($("#formTecnologia"));
            $IdBox.val(ui.item.IdAplicacion);
            $(".field-tecnologia-app").removeClass("ignore");
            $(".field-tecnologia").addClass("ignore");
            if ($("#formTecnologia").valid()) {
                let data = $tblAplicaciones.bootstrapTable("getData");
                let index = data.length + 1;
                $tblAplicaciones.bootstrapTable("append", {
                    AplicacionId: ui.item.IdAplicacion,
                    Aplicacion: {
                        Id: ui.item.IdAplicacion,
                        CategoriaTecnologica: ui.item.CategoriaTecnologica,
                        Nombre: ui.item.Nombre,
                        TipoActivoInformacion: ui.item.TipoActivo,
                        Owner_LiderUsuario_ProductOwner: ui.item.UsuarioLider,
                    }
                });
                $IdBox.val("");
                $searchBox.val("");
            }

            //    $tblAplicaciones.bootstrapTable('append', {
            //        TecId: ui.item.Id,
            //        Tecnologia: ui.item.Descripcion,
            //        Dominio: ui.item.Dominio,
            //        Subdominio: ui.item.Subdominio,
            //        Familia: ui.item.Familia,
            //        ActivoDetalle: ui.item.ActivoDetalle
            //    });
            //}

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarAplicacionTecnologiaSingle($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Aplicacion" + "/GetAplicacionRelacionarByFiltro?filtro=" + request.term,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_TECNOLOGIA = data;
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
            $IdBox.val(ui.item.IdAplicacion);
            if ($("#formAplicaciones").valid()) {
                let data = $tblAplicacionesSingle.bootstrapTable("getData");
                let index = data.length + 1;
                $tblAplicacionesSingle.bootstrapTable("append", {
                    AplicacionId: ui.item.IdAplicacion,
                    Aplicacion: {
                        Id: ui.item.IdAplicacion,
                        CategoriaTecnologica: ui.item.CategoriaTecnologica,
                        Nombre: ui.item.Nombre,
                        TipoActivoInformacion: ui.item.TipoActivo,
                        Owner_LiderUsuario_ProductOwner: ui.item.UsuarioLider,
                    }
                });
                $IdBox.val("");
                $searchBox.val("");
            }

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function formatOpcAplicacion(value, row, index) {
    var iconRemove = `<a class='btn btn-danger' href='javascript: void(0)' onclick='removerAplicacion("${row.AplicacionId}")'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return iconRemove;
}

function removerAplicacion(aplicacionId) {
    aplicacionId = parseInt(aplicacionId);
    //console.log(TecId);
    //ItemsRemoveAppId.push(TecId);
    $tblAplicaciones.bootstrapTable('remove', {
        field: 'AplicacionId', values: [aplicacionId]
    });
}

function guardarTecnologia() {
    $(".field-tecnologia").removeClass("ignore");
    $(".field-tecnologia-app").addClass("ignore");
    //var itemsTec = $tblAplicaciones.bootstrapTable('getData');
    if ($("#formTecnologia").valid()) {
        var itemsApps = $tblAplicaciones.bootstrapTable('getData');
        var producto = ObtenerObjetoProducto();
        producto.EstadoObsolescenciaId = estadoObsolescenciaIdVigente;
        var tecnologia = {};
        //var _itemsAppsId = itemsApps.map(x => x.ProductoTecnologiaAplicacion);
        //var _arqId = $("#hIdProducto").val();

        //data.arqId = _arqId;
        tecnologia.Id = $("#hdTecnologiaId").val().trim() == "" ? 0 : parseInt($("#hdTecnologiaId").val());
        tecnologia.ProductoId = producto.Id;
        tecnologia.Version = $("#txtVersionTecnologia").val();
        tecnologia.Clave = $("#txtClaveTecnologia").val();
        tecnologia.TipoTecnologiaId = $("#cbTipoTecnologiaIdTecnologia").val();
        tecnologia.Descripcion = $("#txtDescripcionTecnologia").val();
        tecnologia.FechaLanzamiento = $("#divFechaLanzamientoTecnologia").data("DateTimePicker").date().toDate().toISOString();
        tecnologia.FechaFinExtendida = $("#divFechaFinExtendidaTecnologia").data("DateTimePicker").date().toDate().toISOString();
        tecnologia.FechaFinSoporte = $("#divFechaFinSoporteTecnologia").data("DateTimePicker").date().toDate().toISOString();
        tecnologia.FechaFinInterna = $("#divFechaFinInternaTecnologia").data("DateTimePicker").date().toDate().toISOString();
        //tecnologia.FechaLanzamiento = $("#txtFechaLanzanmientoTecnologia").val();
        //tecnologia.FechaFinExtendida = $("#txtFechaFinExtendidaTecnologia").val();
        //tecnologia.FechaFinSoporte = $("#txtFechaFinSoporteTecnologia").val();
        //tecnologia.FechaFinInterna = $("#txtFechaFinInternaTecnologia").val();
        tecnologia.ComentariosFechaFinSoporte = $("#txtComentariosFechaFinSoporteTecnologia").val();
        tecnologia.AutomatizacionImplementadaId = $("#cbAutomatizacionImplementadaIdTecnologia").val();
        tecnologia.ListaProductoTecnologiaAplicacion = itemsApps;
        tecnologia.ListaProductoTecnologiaAplicacionEliminar = (LIST_APPSTECNOLOGIA || []).filter(x => !itemsApps.some(y => y.AplicacionId == x.AplicacionId)).map(x => x.Id);
        //tecnologia.itemsTecId = _itemsTecId;
        //tecnologia.itemsRemoveTecId = ItemsRemoveAppId;
        debugger;
        producto.ListaProductoTecnologia = [];
        producto.ListaProductoTecnologia.push(tecnologia);

        $("#btnRegTecnologia").button("loading");

        if (tecnologia.Id == 0) {
            GuardarProducto(producto, () => {
                MdAddTecnologiaProducto(false);
                $("#btnRegTecnologia").button("reset");
            });
        } else {
            GuardarTecnologia(tecnologia);
        }
        //$.ajax({
        //    url: URL_API_VISTA + "/AsociarTecnologias",
        //    type: "POST",
        //    contentType: "application/json; charset=utf-8",
        //    data: JSON.stringify(producto),
        //    dataType: "json",
        //    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        //    success: function (result) {
        //        var response = result;
        //        if (response) {
        //            toastr.success("Se relacionó correctamente", "Producto de Tecnología");
        //            $("#txtBusProducto").val('');
        //            listarProductos();
        //            //$table.bootstrapTable('refresh');
        //        }
        //        else
        //            toastr.error('Ocurrio un problema', 'Producto de Tecnología');
        //    },
        //    complete: function () {
        //        $("#btnRegTecnologia").button("reset");
        //        $("#MdTecByProducto").modal('hide');
        //    },
        //    error: function (xhr, ajaxOptions, thrownError) {
        //        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        //    }
        //});
    }
}

function BuscarProducto() {
    listarProductos();
}

function limpiarMdAddOrEditProducto() {
    LimpiarValidateErrores($("#formAddOrEditProducto"));
    $("#hIdProducto").val("")
    $("#txtFabricanteProducto").val("");
    $("#txtNombreProducto").val("");
    $("#txtDescripcionProducto").val("");
    $("#cbDominioIdProducto").val(-1);
    $("#cbSubDominioIdProducto").val(-1);
    $("#cbTipoProductoIdProducto").val(-1);
    $("#cbEstadoObsolescenciaIdProducto").val(estadoObsolescenciaIdObsoleto);
    $("#txtOwnerProducto").val("");
    $("#txtGrupoTicketRemedyProducto").val("");
    $("#hdGrupoTicketRemedyIdProducto").val("");
    $("#chkFlagAplicacion").prop("checked", false);
    $("#chkFlagAplicacion").bootstrapToggle("off");
    $("#txtCodigoProducto").val("");
}

//Open modal: true
//Close modal: false
function MdAddOrEditProducto(EstadoMd) {
    limpiarMdAddOrEditProducto();
    if (EstadoMd)
        $("#MdAddOrEditProducto").modal(opcionesModal);
    else
        $("#MdAddOrEditProducto").modal('hide');
}

function validarFormProducto() {

    $.validator.addMethod("validarCodigo", function (value, element) {
        let estado = true;
        let checked = $("#chkFlagAplicacion").prop("checked");
        if (checked) return estado;
        estado = $.trim(value) != "";
        return estado;
    });

    $.validator.addMethod("validarCodigoAplicacion", function (value, element) {
        let estado = true;
        let checked = !$("#chkFlagAplicacion").prop("checked");
        if (checked) return estado;
        estado = $.trim($("#hdAplicacionIdProducto").val()) != "";
        return estado;
    });


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

    $("#formAddOrEditProducto").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtFabricanteProducto: {
                requiredSinEspacios: true
            },
            txtNombreProducto: {
                requiredSinEspacios: true
            },
            txtDescripcionProducto: {
                requiredSinEspacios: true
            },
            cbDominioIdProducto: {
                requiredSelect: true
            },
            cbSubDominioIdProducto: {
                requiredSelect: true
            },
            cbTipoProductoIdProducto: {
                requiredSelect: true
            },
            cbEstadoObsolescenciaIdProducto: {
                requiredSelect: true
            },
            txtOwnerProducto: {
                requiredSinEspacios: true
            },
            txtGrupoTicketRemedyProducto: {
                requiredSinEspacios: true
            },
            txtCodigoProducto: {
                validarCodigo: true,
                //existeCodigo: true
            },
            txtCodigoAplicacionProducto: {
                validarCodigoAplicacion: true,
                //existeCodigo: true
            }
        },
        messages: {
            txtFabricanteProducto: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el fabricante")
            },
            txtNombreProducto: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtDescripcionProducto: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
            cbDominioIdProducto: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el dominio")
            },
            cbSubDominioIdProducto: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el sub dominio")
            },
            cbTipoProductoIdProducto: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo de producto")
            },
            cbEstadoObsolescenciaIdProducto: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el estado de obsolescencia")
            },
            txtOwnerProducto: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el owner")
            },
            txtGrupoTicketRemedyProducto: {
                requiredSinEspacios: String.Format("Debes seleccionar {0}.", "el grupo de soporte remedy")
            },
            txtCodigoProducto: {
                validarCodigo: String.Format("Debes ingresar {0}.", "el código"),
                //existeCodigo: "Código ya existe"
            },
            txtCodigoAplicacionProducto: {
                validarCodigoAplicacion: String.Format("Debes seleccionar {0}.", "la aplicación"),
                //existeCodigo: "Código ya existe"
            }
        }
    });
}

function validarFormTecnologia() {

    $.validator.addMethod("existeTecnologia", function (value, element) {
        // debugger
        let estado = true;
        if ($.trim(value) !== "" && $.trim(value).length >= 3) {
            estado = ExisteTecnologia();
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("requiredMinAplicacion", function (value, element) {
        let tipoTecnologiaId = $("#cbTipoTecnologiaIdTecnologia").val();
        let validar = (tipoTecnologiaId == tipoIdEstandarRestringido);
        if (!validar) return !validar;
        // debugger
        let minRegistro = $tblAplicaciones.bootstrapTable('getData');
        //debugger;
        let estado = minRegistro.length > 0 ? true : false;

        return estado;
    });

    $.validator.addMethod("requiredAplicacion", function (value, element) {
        let aplicacionId = $("#hdAplicacionIdTecnologia").val();
        let aplicacionSeleccionada = aplicacionId != ""

        return aplicacionSeleccionada;
    });

    $.validator.addMethod("aplicacionDuplicada", function (value, element) {
        let data = $tblAplicaciones.bootstrapTable("getData");
        let aplicacionId = $("#hdAplicacionIdTecnologia").val();
        let existeAplicacionEnLista = data.some(x => x.AplicacionId == aplicacionId);

        return !existeAplicacionEnLista;
    });

    $("#formTecnologia").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            //txtNomTecByProducto: {
            //    existeTecnologia: true
            //},
            txtVersionTecnologia: {
                requiredSinEspacios: true,
            },
            txtClaveTecnologia: {
                requiredSinEspacios: true,
            },
            cbTipoTecnologiaIdTecnologia: {
                requiredSelect: true,
            },
            txtDescripcionTecnologia: {
                requiredSinEspacios: true,
            },
            txtFechaLanzanmientoTecnologia: {
                requiredSinEspacios: true,
            },
            txtFechaFinExtendidaTecnologia: {
                requiredSinEspacios: true,
            },
            txtFechaFinSoporteTecnologia: {
                requiredSinEspacios: true,
            },
            txtFechaFinInternaTecnologia: {
                requiredSinEspacios: true,
            },
            txtComentariosFechaFinSoporteTecnologia: {
                requiredSinEspacios: true,
            },
            cbAutomatizacionImplementadaIdTecnologia: {
                requiredSelect: true,
            },
            txtAplicacionTecnologia: {
                requiredAplicacion: true,
                aplicacionDuplicada: true
            },
            msjValidTbl: {
                requiredMinAplicacion: true,
            }
        },
        messages: {
            //txtNomTecByProducto: {
            //    existeTecnologia: String.Format("{0} seleccionada no existe.", "la tecnología")
            //},
            txtVersionTecnologia: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "una versión"),
            },
            txtClaveTecnologia: {
                requiredSinEspacios: String.Format("La clave no debe estar vacía"),
            },
            cbTipoTecnologiaIdTecnologia: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo de tecnología"),
            },
            txtDescripcionTecnologia: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "una descripción"),
            },
            txtFechaLanzanmientoTecnologia: {
                requiredSinEspacios: String.Format("Debes seleccionar {0}.", "una fecha de lanzamiento de la tecnología"),
            },
            txtFechaFinExtendidaTecnologia: {
                requiredSinEspacios: String.Format("Debes seleccionar {0}.", "una fecha fin extendida de la tecnología"),
            },
            txtFechaFinSoporteTecnologia: {
                requiredSinEspacios: String.Format("Debes seleccionar {0}.", "una fecha fin soporte de la tecnología"),
            },
            txtFechaFinInternaTecnologia: {
                requiredSinEspacios: String.Format("Debes seleccionar {0}.", "una fecha fin interna de la tecnología"),
            },
            txtComentariosFechaFinSoporteTecnologia: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "un comentario asociado a la fecha fin de soporte de tecnología"),
            },
            cbAutomatizacionImplementadaIdTecnologia: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "una opción"),
            },
            txtAplicacionTecnologia: {
                requiredAplicacion: String.Format("Debes seleccionar {0}.", "una aplicación"),
                aplicacionDuplicada: String.Format("La aplicación seleccionada {0}.", "ya se encuentra agregada")
            },
            msjValidTbl: {
                requiredMinAplicacion: String.Format("Debes agregar {0}.", "una aplicación como mínimo")
            }
        }
    });
}

function ExisteTecnologia() {
    let estado = false;
    //let nombre = $("#txtTecnologia").val();
    let Id = $("#hdTecnologiaId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Tecnologia" + `/ExisteTecnologia?Id=${Id}`,
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

function listarProductos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/ProductoTecnologia/Busqueda",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Codigo',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.id = productoId
            DATA_EXPORTAR.nombre = $.trim($("#txtBusDescripcionTecnologia").val());
            DATA_EXPORTAR.estadoObsolescenciaId = $.trim($("#cbBusEstadoObsolescenciaTecnologia").val()) == "-1" ? null : $.trim($("#cbBusEstadoObsolescenciaTecnologia").val());
            DATA_EXPORTAR.tipoTecnologiaId = $.trim($("#cbBusTipoTecnologia").val()) == "-1" ? null : $.trim($("#cbBusTipoTecnologia").val());
            DATA_EXPORTAR.tipoProductoId = $.trim($("#cbBusTipoProductoTecnologia").val()) == "-1" ? null : $.trim($("#cbBusTipoProductoTecnologia").val());
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

function CambiarEstado(ProductoId) {
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
                    url: `${URL_API_VISTA}/CambiarEstado?Id=${ProductoId}`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se cambió el estado correctamente", "Producto de Tecnología");
                                $("#txtBusProducto").val('');
                                listarProductos();
                            }
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "Producto de Tecnología");
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    },
                    complete: function (data) {
                        //$("#txtBusProducto").val('');
                        //$table.bootstrapTable('refresh');
                    }
                });
            }
        }
    });
}

function linkFormatterNombre(value, row, index) {
    return `<a href="javascript:EditProducto(${row.Id})" title="Editar">${value}</a>`;
}

function linkFormatterTec(value, row, index) {
    return `<a href="javascript:IrTecnologias(${row.Id})" title="Ver tecnologias">${value}</a>`;
}

function opciones(value, row, index) {
    //let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    //let type_icon = row.Activo ? "check" : "unchecked";
    let opciones = [];
    let editar = `<a href="javascript:EditProducto(${row.Id})" title="Editar"><i style="" id="cbEditarProducto${row.Id}" class="glyphicon glyphicon-pencil"></i></a>`;
    let nuevaTecnologia = `<a href="javascript:NuevaTecnologiaProducto(${row.Id})" title="Nueva Tecnología"><i style="" id="cbNuevaTecnologiaProducto${row.Id}" class="glyphicon glyphicon-book"></i></a>`;
    let verTecnologias = `<a href="javascript:VerTecnologiasProducto(${row.Id})" title="Ver Tecnologías"><i style="" id="cbVerTecnologiasProducto${row.Id}" class="glyphicon glyphicon-refresh"></i></a>`;
    let verHistorial = `<a href="javascript:VerHistorialProducto(${row.Id})" title="Ver Historial"><i style="" id="cbVerHistorialProducto${row.Id}" class="glyphicon glyphicon-list-alt"></i></a>`;
    //let estado = `<a href="javascript:CambiarEstado(${row.Id})" title="Cambiar estado"><i style="" id="cbOpcProducto${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    opciones.push(editar);
    if (row.EstadoObsolescenciaId == estadoObsolescenciaIdObsoleto) opciones.push(nuevaTecnologia);
    if (row.EstadoObsolescenciaId == estadoObsolescenciaIdVigente) opciones.push(verTecnologias);
    opciones.push(verHistorial);
    return opciones.join("&nbsp;");
}

function NuevaTecnologiaProducto(productoId) {
    location.href = `${pathRoot}GestionProducto/Tecnologia?id=${productoId}`;
}

function VerTecnologiasProducto(productoId) {
    ListarTecnologiasProducto(productoId, () => {
        MdTecnologiasByProducto(true);
    });
}

function formatOpcTecnologia(value, row, index) {
    let listaOpciones = [];
    debugger;
    let editar = `<a href="javascript:EditTecnologia(${row.Id})" title="Editar"><i style="" id="cbEditarTecnologia${row.Id}" class="glyphicon glyphicon-pencil"></i></a>`;
    let eliminar = `<a href="javascript:RemoveTecnologia(${row.Id})" title="Eliminar"><i style="" id="cbEliminarTecnologia${row.Id}" class="glyphicon glyphicon-trash"></i></a>`;
    let verAplicaciones = `<a href="javascript:VerAplicaciones(${row.Id}, ${row.TipoTecnologiaId})" title="Ver Aplicaciones"><i style="" id="cbVerAplicaciones${row.Id}" class="glyphicon glyphicon-eye-open"></i></a>`;

    listaOpciones.push(editar);
    listaOpciones.push(eliminar);
    listaOpciones.push(verAplicaciones);
    return listaOpciones.join("&nbsp;");
}

function EditTecnologia(TecnologiaId) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/ProductoTecnologia/" + TecnologiaId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            //$("#titleFormProducto").html("Editar Producto");
            MdAddTecnologiaProducto(true);

            $("#txtFabricanteProducto").val(result.Producto.Fabricante);
            $("#txtNombreProducto").val(result.Producto.Nombre);

            $("#hIdProducto").val(result.ProductoId);
            $("#hdTecnologiaId").val(result.Id);
            $("#txtVersionTecnologia").val(result.Version);
            $("#txtClaveTecnologia").val(result.Clave);
            $("#cbTipoTecnologiaIdTecnologia").val(result.TipoTecnologiaId);
            $("#txtDescripcionTecnologia").val(result.Descripcion);
            $("#divFechaLanzamientoTecnologia").data("DateTimePicker").date(new Date(result.FechaLanzamiento));
            $("#divFechaFinExtendidaTecnologia").data("DateTimePicker").date(new Date(result.FechaFinExtendida));
            $("#divFechaFinSoporteTecnologia").data("DateTimePicker").date(new Date(result.FechaFinSoporte));
            $("#divFechaFinInternaTecnologia").data("DateTimePicker").date(new Date(result.FechaFinInterna));
            $("#txtComentariosFechaFinSoporteTecnologia").val(result.ComentariosFechaFinSoporte);
            $("#cbAutomatizacionImplementadaIdTecnologia").val(result.AutomatizacionImplementadaId);

            LIST_APPSTECNOLOGIA = (result.ListaProductoTecnologiaAplicacion || []).map(x => x);

            $tblAplicaciones.bootstrapTable("load", result.ListaProductoTecnologiaAplicacion);

            //$("#hIdProducto").val(result.Id);
            //$("#txtFabricanteProducto").val(result.Fabricante);
            //$("#txtNombreProducto").val(result.Nombre);
            //$("#txtDescripcionProducto").val(result.Descripcion);
            //$("#cbDominioIdProducto").val(result.DominioId).trigger("change");
            //$("#cbSubDominioIdProducto").val(result.SubDominioId);
            //$("#cbTipoProductoIdProducto").val(result.TipoProductoId);
            //$("#cbEstadoObsolescenciaIdProducto").val(result.EstadoObsolescenciaId);
            //$("#txtOwnerProducto").val(result.Owner);
            //$("#hdGrupoTicketRemedyIdProducto").val(result.GrupoTicketRemedyId);
            //$("#txtGrupoTicketRemedyProducto").val(result.GrupoTicketRemedyStr);
            //$("#chkFlagAplicacion").prop('checked', result.EsAplicacion);
            //$('#chkFlagAplicacion').bootstrapToggle(result.EsAplicacion ? 'on' : 'off');
            //$("#txtCodigoProducto").val(result.Codigo);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function RemoveTecnologia(TecnologiaId) {
    bootbox.confirm({
        message: "¿Está seguro que desea eliminar el registro?",
        buttons: {
            confirm: {
                label: 'ELIMINAR',
                className: 'btn-primary'
            },
            cancel: {
                label: 'CANCELAR',
                className: 'btn-secondary'
            }
        },
        callback: function (result) {
            if (result) {
                IrTecnologias();
                $("#MdTecnologiaByProducto").modal(opcionesModal);
                //return false;
            }
        }
    });
}

function VerAplicaciones(TecnologiaId, TipoTecnologiaId) {
    ListarAppsTecnologia(TecnologiaId, () => {
        $("#formAplicaciones").attr("data-tipo-tecnologia-id", TipoTecnologiaId);
        $("#formAplicaciones").attr("data-tecnologia-id", TecnologiaId);
        MdAddAppsTecnologia(true);
    })
}

function EditProducto(ProductoId) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/" + ProductoId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            $("#titleFormProducto").html("Editar Producto");
            MdAddOrEditProducto(true);

            $("#hIdProducto").val(result.Id);
            $("#txtFabricanteProducto").val(result.Fabricante);
            $("#txtNombreProducto").val(result.Nombre);
            $("#txtDescripcionProducto").val(result.Descripcion);
            $("#cbDominioIdProducto").val(result.DominioId).trigger("change");
            $("#cbSubDominioIdProducto").val(result.SubDominioId);
            $("#cbTipoProductoIdProducto").val(result.TipoProductoId);
            $("#cbEstadoObsolescenciaIdProducto").val(result.EstadoObsolescenciaId);
            $("#txtOwnerProducto").val(result.Owner);
            $("#hdGrupoTicketRemedyIdProducto").val(result.GrupoTicketRemedyId);
            $("#txtGrupoTicketRemedyProducto").val(result.GrupoTicketRemedyStr);
            $("#chkFlagAplicacion").prop('checked', result.EsAplicacion);
            $('#chkFlagAplicacion').bootstrapToggle(result.EsAplicacion ? 'on' : 'off');
            if (result.EsAplicacion) {
                if (result.Aplicacion != null) {
                    $("#txtCodigoAplicacionProducto").val(`${result.Aplicacion.CodigoAPT} - ${result.Aplicacion.Nombre}`);
                    $("#hdAplicacionIdProducto").val(result.AplicacionId);
                    $("#hdAplicacionCodigoProducto").val(result.Codigo);
                }
            } else {
                $("#txtCodigoProducto").val(result.Codigo);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function DescargarArchivo() {
    DownloadFile($("#hdArchivoId").val(), $("#txtNomDiagProducto"), "Producto de Tecnologías");
}

function AddProducto() {
    $("#titleFormProducto").html("Nuevo Producto");
    $("#hIdProducto").val('');
    MdAddOrEditProducto(true);
}

function GuardarAddOrEditProducto() {
    if ($("#formAddOrEditProducto").valid()) {
        $("#btnRegProducto").button("loading");

        var producto = ObtenerObjetoProducto();

        if (producto.Id == 0) {
            bootbox.confirm({
                message: "¿Desea agregar Tecnologías?",
                buttons: {
                    confirm: {
                        label: 'AGREGAR',
                        className: 'btn-primary'
                    },
                    cancel: {
                        label: 'CANCELAR',
                        className: 'btn-secondary'
                    }
                },
                callback: function (result) {
                    if (result) {
                        IrTecnologias();
                        $("#MdTecnologiaByProducto").modal(opcionesModal);
                        //return false;
                    } else {
                        GuardarProducto(producto);
                    }
                }
            });
        } else {
            GuardarProducto(producto);
        }

    }
}

function GuardarProducto(producto, fn = null) {
    $.ajax({
        url: URL_API_VISTA,
        type: "POST",
        data: producto,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            //var data = result;
            //if (data > 0) {
            //    let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
            //    if ((archivoId === 0 && $("#txtNomDiagProducto").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
            //        UploadFile($("#flDiagProducto"), CODIGO_INTERNO, data, archivoId);
            //    }
            //    toastr.success("Registrado correctamente", "Producto de Tecnología");
            //    //ListarRegistros();
            //}
        },
        complete: function () {
            $("#btnRegProducto").button("reset");
            listarProductos();
            MdAddOrEditProducto(false);
            if (typeof fn == "function") fn();
        },
        error: function (result) {
            alert(result.responseText);
        }
    });
}

function GuardarTecnologia(tecnologia, fn = null) {
    $.ajax({
        url: URL_API_VISTA + "/ProductoTecnologia",
        type: "POST",
        data: tecnologia,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            //var data = result;
            //if (data > 0) {
            //    let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
            //    if ((archivoId === 0 && $("#txtNomDiagProducto").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
            //        UploadFile($("#flDiagProducto"), CODIGO_INTERNO, data, archivoId);
            //    }
            //    toastr.success("Registrado correctamente", "Producto de Tecnología");
            //    //ListarRegistros();
            //}
        },
        complete: function () {
            $("#btnRegTecnologia").button("reset");
            ListarTecnologiasProducto(tecnologia.ProductoId, () => {
                MdAddTecnologiaProducto(false);
                if (typeof fn == "function") fn();
            });
        },
        error: function (result) {
            alert(result.responseText);
        }
    });
}

function limpiarMdAddTecnologiaProducto() {
    ItemsRemoveAppId = [];
    LimpiarValidateErrores($("#formTecnologia"));

    const fechaActual = new Date();
    //const fechaActualString = fechaActual.toLocaleDateString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit" });

    $("#hdTecnologiaId").val("");
    $("#txtVersionTecnologia").val("").trigger("keyup");
    $("#cbTipoTecnologiaIdTecnologia").val(-1);
    $("#txtDescripcionTecnologia").val("");
    $("#divFechaLanzamientoTecnologia").data("DateTimePicker").date(fechaActual);
    $("#divFechaFinExtendidaTecnologia").data("DateTimePicker").date(fechaActual);
    $("#divFechaFinSoporteTecnologia").data("DateTimePicker").date(fechaActual);
    $("#divFechaFinInternaTecnologia").data("DateTimePicker").date(fechaActual);
    //$("#txtFechaLanzanmientoTecnologia").val(fechaActualString);
    //$("#txtFechaFinExtendidaTecnologia").val(fechaActualString);
    //$("#txtFechaFinSoporteTecnologia").val(fechaActualString);
    //$("#txtFechaFinInternaTecnologia").val(fechaActualString);
    $("#txtComentariosFechaFinSoporteTecnologia").val("");
    $("#cbAutomatizacionImplementadaIdTecnologia").val(-1);
    $("#txtAplicacionTecnologia").val("");
    $("#hdAplicacionIdTecnologia").val("");
    LIST_APPSTECNOLOGIA = [];
    $tblAplicaciones.bootstrapTable('removeAll');
    //$("#hIdProducto").val("")
    //$("#txtFabricanteProducto").val("");
    //$("#txtNombreProducto").val("");
    //$("#txtDescripcionProducto").val("");
    //$("#cbDominioIdProducto").val(-1);
    //$("#cbSubDominioIdProducto").val(-1);
    //$("#cbTipoProductoIdProducto").val(-1);
    //$("#cbEstadoObsolescenciaIdProducto").val(estadoObsolescenciaIdObsoleto);
    //$("#txtOwnerProducto").val("");
    //$("#txtGrupoTicketRemedyProducto").val("");
    //$("#hdGrupoTicketRemedyIdProducto").val("");
    //$("#chkFlagAplicacion").prop("checked", false);
    //$("#chkFlagAplicacion").bootstrapToggle("off");
    //$("#txtCodigoProducto").val("");
}

function MdAddTecnologiaProducto(EstadoMd) {
    limpiarMdAddTecnologiaProducto();
    if (EstadoMd)
        $("#MdTecnologiaByProducto").modal(opcionesModal);
    else
        $("#MdTecnologiaByProducto").modal('hide');
}

function MdCloseTecnologiaProducto() {
    $("#btnRegProducto").button("reset");
}

function IrTecnologias() {
    MdAddTecnologiaProducto(true);
    let tipoProductoId = $("#cbTipoProductoIdProducto").val();
    $("#cbTipoTecnologiaIdTecnologia").val(tipoProductoId).trigger("change");
    //ListarTecByProducto(ProductoId);
}

function ListarTecByProducto(ProductoId) {
    $.ajax({
        url: URL_API_VISTA + "/ObtenerTecnologias/" + ProductoId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            if (result.length > 0) {
                var data = result;
                var itemTecReg = [];
                $.each(data, function (index, val) {
                    var item = {};
                    item.TecId = val.Id;
                    item.Tecnologia = val.Tecnologia;
                    item.Dominio = val.Dominio;
                    item.Subdominio = val.Subdominio;
                    item.Familia = val.Familia;
                    item.ActivoDetalle = val.ActivoDetalle;
                    itemTecReg.push(item);
                });
                $tblAplicaciones.bootstrapTable('destroy');
                $tblAplicaciones.bootstrapTable({
                    data: itemTecReg,
                    pagination: true,
                    pageNumber: 1,
                    pageSize: 10
                });
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }, complete: function () {
            //getTecnologias();
            $("#MdTecByProducto").modal(opcionesModal);
        }
    });
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        //bootbox.alert("No hay datos para exportar.");
        bootbox.alert({
            size: "small",
            title: "Productos de Tecnologías",
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
}

function cargarCodigoInterno(fn = null) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ObtenerCodigoInterno",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    SetItems(dataObject.EstadoObsolescencia, $("#cbBusEstadoObsolescenciaProducto"), TEXTO_TODOS);
                    SetItems(dataObject.Dominio, $("#cbBusDominioProducto"), TEXTO_TODOS);
                    SetItemsCustomField(dataObject.Tipo, $("#cbBusTipoProducto"), TEXTO_TODOS, "Id", "Nombre");

                    SetItems(dataObject.Dominio, $("#cbDominioIdProducto"), TEXTO_SELECCIONE);
                    SetItems(LIST_SUBDOMINIO, $("#cbSubDominioIdProducto"), TEXTO_SELECCIONE);
                    SetItemsCustomField(dataObject.Tipo, $("#cbTipoProductoIdProducto"), TEXTO_SELECCIONE, "Id", "Nombre");
                    SetItems(dataObject.EstadoObsolescencia, $("#cbEstadoObsolescenciaIdProducto"), TEXTO_SELECCIONE);

                    SetItemsCustomField(dataObject.Tipo, $("#cbTipoTecnologiaIdTecnologia"), TEXTO_SELECCIONE, "Id", "Nombre");
                    SetItems(dataObject.AutomatizacionImplementada, $("#cbAutomatizacionImplementadaIdTecnologia"), TEXTO_SELECCIONE);

                    LIST_SUBDOMINIO = dataObject.SubDominio;
                    CODIGO_INTERNO = dataObject.CodigoInterno;
                    if (typeof fn == "function") fn();
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function EliminarArchivo() {
    $("#txtNomDiagProducto").val(TEXTO_SIN_ARCHIVO);
    $("#flDiagProducto").val("");
    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
    //$(".div-controls-file").hide();
}

function ExisteCodigo() {
    let estado = false;
    let codigo = $("#txtCodProducto").val();
    let Id = $("#hIdProducto").val() === "" ? 0 : parseInt($("#hIdProducto").val());
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Producto" + `/ExisteCodigoByFiltro?codigo=${codigo}&id=${Id}`,
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

function CargarSubDominio() {
    let dominioId = $("#cbDominioIdProducto").val();
    let listSubDominio = LIST_SUBDOMINIO.filter(x => x.TipoId == dominioId);
    SetItems(listSubDominio, $("#cbSubDominioIdProducto"), TEXTO_SELECCIONE);
}

function GenerarClaveTecnologia() {
    let fabricante = $("#txtFabricanteProducto").val().trim().replace(/ /, "");
    let nombre = $("#txtNombreProducto").val().trim().replace(/ /, "");
    let version = $("#txtVersionTecnologia").val().trim().replace(/ /, "");
    let clave = `${fabricante}${nombre}${version}`;
    $("#txtClaveTecnologia").val(clave);
}

function CbTipoTecnologiaIdTecnologiaChange() {
    let tipoTecnologiaId = $("#cbTipoTecnologiaIdTecnologia").val();
    let esVisible = tipoTecnologiaId == tipoIdEstandarRestringido;
    let className = "hidden";
    if (esVisible) $("#divAplicaciones").removeClass(className);
    if (!esVisible) $("#divAplicaciones").addClass(className);
}

function ObtenerObjetoProducto() {
    var producto = {};
    producto.Id = ($("#hIdProducto").val() === "") ? 0 : parseInt($("#hIdProducto").val());
    producto.Fabricante = $("#txtFabricanteProducto").val().trim();
    producto.Nombre = $("#txtNombreProducto").val().trim();
    producto.Descripcion = $("#txtDescripcionProducto").val();
    producto.DominioId = $("#cbDominioIdProducto").val();
    producto.SubDominioId = $("#cbSubDominioIdProducto").val();
    producto.TipoProductoId = $("#cbTipoProductoIdProducto").val();
    producto.EstadoObsolescenciaId = $("#cbEstadoObsolescenciaIdProducto").val();
    producto.Owner = $("#txtOwnerProducto").val();
    producto.GrupoTicketRemedyId = $("#hdGrupoTicketRemedyIdProducto").val();
    producto.EsAplicacion = $("#chkFlagAplicacion").prop("checked");
    if (!producto.EsAplicacion) {
        producto.Codigo = $("#txtCodigoProducto").val();
    } else {
        producto.AplicacionId = $("#hdAplicacionIdProducto").val();
        producto.Codigo = $("#hdAplicacionCodigoProducto").val();
    }

    return producto;
}