﻿var $table = $("#tbl-lista");
var $tblTecnologias = $("#tbl-tecnologias");
var $tblAplicaciones = $("#tbl-aplicaciones");
var $tblAplicacionesSingle = $("#tbl-aplicaciones-single");
var $tblArquetipos = $("#tbl-arquetipos");
var $tblHistorial = $("#tbl-historial");
var URL_API_VISTA = URL_API + "/Producto";
var ItemsRemoveAppId = [];
var DATA_EXPORTAR = {};
var CODIGO_INTERNO = 0;
var LIST_SUBDOMINIO = [];
var LIST_APPSTECNOLOGIA = [];
var LIST_APPSTECNOLOGIASINGLE = [];
var LIST_ARQUPRODUCTO = [];
var FLAG_ACTIVO_TECNOLOGIA = 0;
var CODIGO_SUGERIDO = '';
var LIST_SQUAD = [];
const TITULO_MENSAJE = "Gestión de Productos";


$(function () {
    initFecha();
    $tblTecnologias.bootstrapTable();
    $tblAplicaciones.bootstrapTable();
    $tblAplicacionesSingle.bootstrapTable();
    $tblArquetipos.bootstrapTable();
    $tblHistorial.bootstrapTable();

    FormatoCheckBox($("#divFlagAplicacion"), "chkFlagAplicacion");
    FormatoCheckBox($("#divBusFlagActivo"), "chkBusFlagActivo");
    $("#chkBusFlagActivo").prop("checked", true).trigger("change");
    FormatoCheckBox($("#divFlagGrupoRemedyPendienteCreacion"), "chkFlagGrupoRemedyPendienteCreacion");
    $("#chkFlagGrupoRemedyPendienteCreacion").prop("disabled", true).trigger("change");

    $("#cbDominioIdProducto").change(CargarSubDominio);
    $("#cbBusDominioProducto").change(CargarSubDominioBusqueda);
    $("#MdTecnologiaByProducto").on("hide.bs.modal", MdCloseTecnologiaProducto);
    $("#chkFlagAplicacion").change(ChkFlagAplicacionChange);
    //getTecnologias();
    //initUpload($('#txtNomDiagProducto'));
    //validarFormProducto();
    //validarFormTecnologia();
    //listarProductos();
    $("#txtVersionTecnologia, #txtFabricanteProducto, #txtNombreProducto").keyup(GenerarClaveTecnologia);
    //$("#txtVersionTecnologia, #txtFabricanteProducto, #txtNombreProducto").change(GenerarClaveTecnologia);
    $("#cbTipoTecnologiaIdTecnologia").change(CbTipoTecnologiaIdTecnologiaChange);
    $("#cbFuenteTecnologia").change(cbFuente_Change);
    //$("#cbFechaCalculosTecnologia").change(FechaCalculo_Change);

    FormatoCheckBox($("#divFlagFechaFinSoporte"), "chkFlagFechaFinSoporte");
    $("#chkFlagFechaFinSoporte").change(FlagFechaFinSoporte_Change);
    $("#chkFlagFechaFinSoporte").trigger("change");

    InitAutocompletarTribuCoeProducto($("#txtTribuCoeDisplayNameProducto"), $("#hdTribuCoeIdProducto"), '.tribuCoeContainer')
    //InitAutocompletarSquadProducto($("#txtSquadDisplayNameProducto"), $("#hdSquadIdProducto"), '.squadContainer')
    InitAutocompletarProductoSearch($("#txtBusNombreProducto"), $("#hdnProductoBusTec"), ".searchProductoContainer");
    InitAutocompletarOwnerProducto($("#txtOwnerDisplayNameProducto"), $("#hdOwnerIdProducto"), ".ownerContainer");
    $("#txtGrupoTicketRemedyProducto").on("keyup", ChangeGrupoRemedyPendienteCreacion);
    InitAutocompletarGrupoTicketRemedy($("#txtGrupoTicketRemedyProducto"), $("#hdGrupoTicketRemedyIdProducto"), ".grupoTicketRemedyContainer", ChangeGrupoRemedyPendienteCreacion);
    InitAutocompletarGrupoTicketRemedy($("#txtEquipoAprovisionamientoProducto"), $("#hdEquipoAprovisionamientoIdProducto"), ".equipoAprovisionamientoContainer");
    InitAutocompletarOwnerProducto($("#txtEquipoAdmContactoProducto"), $("#hdEquipoAdmContactoIdProducto"), ".equipoAdmContactoContainer");
    InitAutocompletarArquetipoTecnologia($("#txtArquetipoProducto"), $("#hdArquetipoIdProducto"), ".arquetipoContainer");

    InitAutocompletarAplicacionProducto($("#txtCodigoAplicacionProducto"), $("#hdAplicacionIdProducto"), ".codigoAplicacionContainer");
    InitAutocompletarAplicacionTecnologia($("#txtAplicacionTecnologia"), $("#hdAplicacionIdTecnologia"), ".aplicacionContainer");
    InitAutocompletarAplicacionTecnologiaSingle($("#txtAplicacionTecnologiaSingle"), $("#hdAplicacionIdTecnologiaSingle"), ".aplicacionSingleContainer");
    $("#cbSquadIdProducto").change(cbSquadIdProducto_Change);
    cbTribuCoeIdProducto_Change();
    cargarCodigoInterno(() => {
        $("#cbEstadoObsolescenciaIdProducto").val(estadoObsolescenciaIdObsoleto);
        validarFormProducto();
        validarFormTecnologia();
        validarFormAplicaciones();
        listarProductos();
    });

    $("#btnActualizarCodigo").click(btnActualizarCodigo_Click);
});

function ChangeGrupoRemedyPendienteCreacion() {
    let descripcion = $("#txtGrupoTicketRemedyProducto").val().trim();
    let descripcionData = $("#hdGrupoTicketRemedyIdProducto").attr("data-text");

    let flagLimpiarIdBox = descripcion == "" || descripcion != descripcionData;

    if (flagLimpiarIdBox) {
        $("#hdGrupoTicketRemedyIdProducto").val("");
        $("#hdGrupoTicketRemedyIdProducto").attr("data-text", "");
    }

    let flagState = descripcion == "" || descripcion == descripcionData;
    let state = flagState ? "off" : "on";
    $("#divFlagGrupoRemedyPendienteCreacion").bootstrapToggle("enable");
    $("#divFlagGrupoRemedyPendienteCreacion").bootstrapToggle(state);
    $("#divFlagGrupoRemedyPendienteCreacion").bootstrapToggle("disable");
}

//function FechaCalculo_Change() {
//    var combo = $(this).val();
//    if (combo !== "-1") {
//        LimpiarValidateErrores($("#formAddOrEditTec"));
//        switch (combo) {
//            case FECHA_CALCULO.EXTENDIDA:
//                $(".fechaClass").addClass("ignore");
//                $(".fechaExt").removeClass("ignore");
//                break;
//            case FECHA_CALCULO.SOPORTE:
//                $(".fechaClass").addClass("ignore");
//                $(".fechaSop").removeClass("ignore");
//                break;
//            case FECHA_CALCULO.INTERNA:
//                $(".fechaClass").addClass("ignore");
//                $(".fechaInt").removeClass("ignore");
//                break;
//        }
//    }
//}

function FlagFechaFinSoporte_Change() {
    let flagFechaFinSoporte = $("#chkFlagFechaFinSoporte").prop("checked");
    $("#FinSoporte_Si").addClass("hidden");
    $("#FinSoporte_No").addClass("hidden");
    if (!flagFechaFinSoporte) {
        $("#cbFuenteTecnologia").val(-1);
        $("#cbFechaCalculosTecnologia").val(-1);
        $("#txtFechaFinExtendidaTecnologia").val("");
        $("#txtFechaFinSoporteTecnologia").val("");
        $("#txtFechaFinInternaTecnologia").val("");
        $("#cbTipoFechaInternaTecnologia").val(-1);
        $("#txtComentariosFechaFinSoporteTecnologia").val("");
        $("#FinSoporte_No").removeClass("hidden");
    } else {
        $("#FinSoporte_Si").removeClass("hidden");
    }
    $("#cbFuenteTecnologia").prop("disabled", !flagFechaFinSoporte);
    $("#cbFechaCalculosTecnologia").prop("disabled", !flagFechaFinSoporte);
    $("#txtFechaFinExtendidaTecnologia").prop("readonly", !flagFechaFinSoporte);
    $("#txtFechaFinSoporteTecnologia").prop("readonly", !flagFechaFinSoporte);
    $("#txtFechaFinInternaTecnologia").prop("readonly", !flagFechaFinSoporte);
    $("#cbTipoFechaInternaTecnologia").prop("disabled", !flagFechaFinSoporte)
    $("#txtComentariosFechaFinSoporteTecnologia").prop("readonly", !flagFechaFinSoporte);
    $("#cbFuenteTecnologia").trigger("change");
}

function initFecha() {
    $("#divFechaLanzamientoTecnologia, #divFechaFinExtendidaTecnologia, #divFechaFinSoporteTecnologia, #divFechaFinInternaTecnologia").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY",
        //date: new Date()
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

function InitAutocompletarTribuCoeProducto($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format("/GestionProducto/BuscarTribuCoePorFiltro?filtro={0}", request.term);

                if ($IdBox !== null) $IdBox.val("");
                $.ajax({
                    url: urlControllerWithParams,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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
            $searchBox.val(ui.item.Descripcion);


            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                $searchBox.val(ui.item.Descripcion);
                $("#hdOwnerIdProducto").val(ui.item.CodigoPersonalResponsable);
                $("#txtOwnerDisplayNameProducto").val(ui.item.NombresPersonalResponsable);
                $("#hdOwnerMatriculaProducto").val(ui.item.MatriculaPersonalResponsable);
                cbTribuCoeIdProducto_Change();
            }
            return false;
        }
    })
        .keyup(function (e) {
            if ($searchBox.val() == "") {
                $IdBox.val("");
                $("#hdOwnerIdProducto").val("");
                $("#txtOwnerDisplayNameProducto").val("");
                $("#hdOwnerMatriculaProducto").val("");
                LIST_SQUAD = [];
                SetItemsCustomField(LIST_SQUAD, $("#cbSquadIdProducto"), TEXTO_SELECCIONE, "Id", "Descripcion");
            }
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
            return $("<li>").append("<a style='display: block'><font>" + item.value + "</font></a>").appendTo(ul);
        };
}

function InitAutocompletarSquadProducto($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                let codigoUnidad = $("#hdTribuCoeIdProducto").val();

                let urlControllerWithParams = String.Format("/GestionProducto/BuscarSquadPorFiltro?codigoUnidad={0}&filtro={1}", codigoUnidad, request.term);

                if ($IdBox !== null) $IdBox.val("");
                $.ajax({
                    url: urlControllerWithParams,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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
            $searchBox.val(ui.item.Descripcion);


            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                $searchBox.val(ui.item.Descripcion);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.value + "</font></a>").appendTo(ul);
    };
}

function InitAutocompletarOwnerProducto($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format("/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}", request.term);

                if ($IdBox !== null) $IdBox.val("");
                $.ajax({
                    url: urlControllerWithParams,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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
            $searchBox.val(ui.item.displayName);


            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {

                $IdBox.val(ui.item.id);
                $searchBox.val(ui.item.displayName);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function InitAutocompletarGrupoTicketRemedy($searchBox, $IdBox, $container, fn = null) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            //if (typeof fn == "function") fn();
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
            $IdBox.attr("data-text", ui.item.Descripcion);


            if (typeof fn == "function") fn();

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

function InitAutocompletarArquetipoTecnologia($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Arquetipo" + "/GetByFiltro?filtro=" + request.term,
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
            //$(".field-tecnologia-app").removeClass("ignore");
            //$(".field-tecnologia").addClass("ignore");
            //if ($("#formTecnologia").valid()) {
            let data = $tblArquetipos.bootstrapTable("getData");
            let index = data.length + 1;

            let itemRemove = LIST_ARQUPRODUCTO.find(x => x.ArquetipoId == ui.item.Id);

            $tblArquetipos.bootstrapTable("append", {
                Id: itemRemove == null ? -1 : itemRemove.Id,
                ArquetipoId: ui.item.Id,
                Arquetipo: {
                    Id: ui.item.Id,
                    Nombre: ui.item.Descripcion
                }
            });
            $IdBox.val("");
            $searchBox.val("");
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
                        CodigoAPT: ui.item.Id,
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
                    TecnologiaId: parseInt($("#formAplicaciones").attr("data-tecnologia-id")),
                    AplicacionId: ui.item.IdAplicacion,
                    Aplicacion: {
                        Id: ui.item.IdAplicacion,
                        CodigoAPT: ui.item.Id,
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

function cbTribuCoeIdProducto_Change(fn = null) {
    let codigoUnidad = $("#hdTribuCoeIdProducto").val() == "" || $("#hdTribuCoeIdProducto").val() == "0" ? null : $("#hdTribuCoeIdProducto").val();
    let urlControllerWithParams = String.Format("/GestionProducto/BuscarSquadPorFiltro?codigoUnidad={0}", codigoUnidad);
    $.ajax({
        url: urlControllerWithParams,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (data) {
            LIST_SQUAD = data;
            //SetItemsCustomField(LIST_SQUAD, $("#"))
            SetItemsCustomField(LIST_SQUAD, $("#cbSquadIdProducto"), TEXTO_SELECCIONE, "Id", "Descripcion");
            if (typeof fn == "function") fn();
        },
        async: true,
        global: false
    });
}

function cbSquadIdProducto_Change() {
    let codigoUnidad = $("#cbSquadIdProducto").val();

    let data = LIST_SQUAD.find(x => x.Id == codigoUnidad);

    if (data != null) {
        $("#hdOwnerIdProducto").val(data.CodigoPersonalResponsable);
        $("#txtOwnerDisplayNameProducto").val(data.NombresPersonalResponsable);
        $("#hdOwnerMatriculaProducto").val(data.MatriculaPersonalResponsable);
    }
}

function formatOpcArquetipo(value, row, index) {
    var iconRemove = `<a class='btn btn-danger' href='javascript: void(0)' onclick='removerArquetipo("${row.ArquetipoId}")'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return iconRemove;
}

function removerArquetipo(arquetipoId) {
    arquetipoId = parseInt(arquetipoId);
    $tblArquetipos.bootstrapTable('remove', {
        field: 'ArquetipoId', values: [arquetipoId]
    });
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
        tecnologia.ProductoId = producto.Id == 0 ? null : producto.Id;
        tecnologia.Fabricante = $("#txtFabricanteTecnologia").val();
        tecnologia.Nombre = $("#txtNombreTecnologia").val();
        tecnologia.Versiones = $("#txtVersionTecnologia").val();
        tecnologia.ClaveTecnologia = $("#txtClaveTecnologia").val();
        tecnologia.TipoTecnologiaId = $("#cbTipoTecnologiaIdTecnologia").val();
        tecnologia.Descripcion = $("#txtDescripcionTecnologia").val();
        tecnologia.FechaLanzamiento = $("#divFechaLanzamientoTecnologia").data("DateTimePicker").date() == null ? null : $("#divFechaLanzamientoTecnologia").data("DateTimePicker").date().toDate().toISOString();
        tecnologia.FlagFechaFinSoporte = $("#chkFlagFechaFinSoporte").prop("checked");
        tecnologia.Fuente = $("#cbFuenteTecnologia").val() == -1 ? null : $("#cbFuenteTecnologia").val();
        tecnologia.FechaCalculoTec = $("#cbFechaCalculosTecnologia").val() == -1 ? null : $("#cbFechaCalculosTecnologia").val();
        tecnologia.FechaExtendida = $("#txtFechaFinExtendidaTecnologia").val() == "" ? null : $("#divFechaFinExtendidaTecnologia").data("DateTimePicker").date().toDate().toISOString();
        tecnologia.FechaFinSoporte = $("#txtFechaFinSoporteTecnologia").val() == "" ? null : $("#divFechaFinSoporteTecnologia").data("DateTimePicker").date().toDate().toISOString();
        tecnologia.FechaAcordada = $("#txtFechaFinInternaTecnologia").val() == "" ? null : $("#divFechaFinInternaTecnologia").data("DateTimePicker").date().toDate().toISOString();
        tecnologia.TipoFechaInterna = $("#cbTipoFechaInternaTecnologia").val() == "-1" ? null : $("#cbTipoFechaInternaTecnologia").val();
        tecnologia.ComentariosFechaFin = $("#txtComentariosFechaFinSoporteTecnologia").val();
        tecnologia.SustentoMotivo = tecnologia.FlagFechaFinSoporte || $("#cbSustentoMotivoFechaFinSoporteTecnologia").val() == "-1" ? null : $("#cbSustentoMotivoFechaFinSoporteTecnologia").val();
        tecnologia.SustentoUrl = tecnologia.FlagFechaFinSoporte || $("#txtSustentoUrlFechaFinSoporteTecnologia").val() == "" ? "" : $("#txtSustentoUrlFechaFinSoporteTecnologia").val();
        tecnologia.AutomatizacionImplementadaId = $("#cbAutomatizacionImplementadaIdTecnologia").val();
        tecnologia.ItemsRemoveAppId = (LIST_APPSTECNOLOGIA || []).filter(x => !itemsApps.some(y => y.AplicacionId == x.AplicacionId)).map(x => x.Id);
        itemsApps = itemsApps.filter(x => x.Id == null);
        tecnologia.ListAplicaciones = itemsApps;
        //tecnologia.itemsTecId = _itemsTecId;
        //tecnologia.itemsRemoveTecId = ItemsRemoveAppId;
        //debugger;
        producto.ListaTecnologia = [];
        producto.ListaTecnologia.push(tecnologia);

        $("#btnRegTecnologia").button("loading");

        if (tecnologia.Id == 0) {
            //debugger;
            producto.ListaTecnologia[0].SubdominioId = producto.SubDominioId;
            GuardarProducto(producto, () => {
                MdAddTecnologiaProducto(false);
                $("#btnRegTecnologia").button("reset");
                bootbox.alert("Se guardó correctamente el registro.");
            });
        } else {
            GuardarTecnologia(tecnologia, () => {
                setTimeout(() => bootbox.alert("Se guardó correctamente el registro."), 100);
            });
        }
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
    $("#txtTribuCoeDisplayNameProducto").val("");
    $("#hdTribuCoeIdProducto").val("");
    $("#cbSquadIdProducto").val(-1);
    //$("#txtSquadDisplayNameProducto").val("");
    //$("#hdSquadIdProducto").val("");
    $("#txtOwnerDisplayNameProducto").val("");
    $("#hdOwnerIdProducto").val("");
    $("#hdOwnerMatriculaProducto").val("");
    $("#txtGrupoTicketRemedyProducto").val("");
    $("#hdGrupoTicketRemedyIdProducto").val("");
    $("#chkFlagAplicacion").prop("checked", false);
    $("#chkFlagAplicacion").bootstrapToggle("off");
    $("#chkFlagAplicacion").trigger("change");
    $("#txtCodigoProductoManual").val("");
    ObtenerCodigoSugerido();
    $("#txtCodigoProductoManual").val(CODIGO_SUGERIDO);
    //$("#txtCodigoProducto").prop("readonly", false);
    $("#cbTipoCicloVidaIdProducto").val(-1);
    $("#cbEsquemaLicenciamientoSuscripcionIdProducto").val(-1);
    $("#txtEquipoAdmContactoProducto").val("");
    $("#txtEquipoAprovisionamientoProducto").val("");
}

//Open modal: true
//Close modal: false
function MdAddOrEditProducto(EstadoMd) {
    limpiarMdAddOrEditProducto();
    if (EstadoMd) {
        $("#MdAddOrEditProducto").modal(opcionesModal);
    }
    else {
        $("#MdAddOrEditProducto").modal('hide');
    }
}

function validarFormProducto() {

    $.validator.addMethod("validarCodigo", function (value, element) {
        let estado = true;
        let checked = $("#chkFlagAplicacion").prop("checked");
        if (checked) return estado;
        //estado = $.trim(value) != "";
        estado = $("")
        return estado;
    });

    $.validator.addMethod("formatoCodigo", function (value, element) {
        let estado = true;
        let checked = $("#chkFlagAplicacion").prop("checked");
        if (checked) return estado;
        //estado = $.trim(value) != "";
        //if (!estado) return !estado;
        estado = /^[P]{1}?[0-9]{4}?$/g.test($.trim(value));
        return estado;
    });

    $.validator.addMethod("validarCodigoAplicacion", function (value, element) {
        let estado = true;
        let checked = !$("#chkFlagAplicacion").prop("checked");
        if (checked) return estado;
        estado = $.trim($("#hdAplicacionIdProducto").val()) != "" && $.trim($("#hdAplicacionIdProducto").val()) != "0";
        return estado;
    });

    $.validator.addMethod("validarCodigoTribuCoe", function (value, element) {
        let estado = true;
        estado = $.trim($("#hdTribuCoeIdProducto").val()) != "" && $.trim($("#hdTribuCoeIdProducto").val()) != "0";
        return estado;
    });

    $.validator.addMethod("validarCodigoSquad", function (value, element) {
        let estado = true;
        estado = $.trim($("#hdSquadIdProducto").val()) != "" && $.trim($("#hdSquadIdProducto").val()) != "0";
        return estado;
    });

    $.validator.addMethod("validarCodigoOwner", function (value, element) {
        let estado = true;
        estado = $.trim($("#hdOwnerIdProducto").val()) != "" && $.trim($("#hdOwnerIdProducto").val()) != "0";
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

    $.validator.addMethod("existeFabricanteNombre", function (value, element) {
        //debugger;
        let estado = true;
        let fabricante = $("#txtFabricanteProducto").val();
        let nombre = $("#txtNombreProducto").val();
        let id = $("#hIdProducto").val() == "" ? 0 : parseInt($("#hIdProducto").val());
        if ($.trim(fabricante) !== "" && $.trim(nombre) !== "") {
            let estado = false;
            estado = !ExisteFabricanteNombre(fabricante, nombre, id);
            //debugger;
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("existeCodigoProducto", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteCodigoProducto(valor);
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("validarEspaciosProducto", function (value, element) {
        let estado = true;
        let codigo = value.replace(" ","");
        let valor = $.trim(codigo);
        let tamanho = valor.length;

        if (tamanho < 4) {
            estado = false;
            return estado;
        }

        return estado;
    });

    $.validator.addMethod("validarAlfanumericoProducto", function (value, element) {
        let estado = false;
        let valor = $.trim(value);
        

        if (valor.length > 1 && valor.match(/^[a-z0-9]+$/i)) {
            estado = true;
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
                requiredSinEspacios: true,
                existeFabricanteNombre: true
            },
            txtNombreProducto: {
                requiredSinEspacios: true,
                existeFabricanteNombre: true
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
            txtTribuCoeDisplayNameProducto: {
                requiredSinEspacios: true,
                validarCodigoTribuCoe: true
            },
            txtSquadDisplayNameProducto: {
                requiredSinEspacios: true,
                validarCodigoSquad: true
            },
            //txtOwnerDisplayNameProducto: {
            //    requiredSinEspacios: true,
            //    validarCodigoOwner: true
            //},
            txtEquipoAdmContactoProducto: {
                requiredSinEspacios: true,
            },
            txtEquipoAprovisionamientoProducto: {
                requiredSinEspacios: true,
            },
            txtGrupoTicketRemedyProducto: {
                requiredSinEspacios: true
            },
            txtCodigoProductoManual: {
                validarCodigo: true,
                //formatoCodigo: true
                //existeCodigo: true
                requiredSinEspacios: true,
                minlength: 4,
                maxlength: 4,
                existeCodigoProducto: true,
                validarEspaciosProducto: true,
                validarAlfanumericoProducto: true
            },
            txtCodigoAplicacionProducto: {
                validarCodigoAplicacion: true,
                //existeCodigo: true
            }
        },
        messages: {
            txtFabricanteProducto: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el fabricante"),
                existeFabricanteNombre: "El fabricante ya existe"
            },
            txtNombreProducto: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre"),
                existeFabricanteNombre: "El producto ya existe"
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
            txtTribuCoeDisplayNameProducto: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el Tribu/COE"),
                validarCodigoTribuCoe: String.Format("Debes seleccionar {0}.", "el Tribu/COE")
            },
            txtSquadDisplayNameProducto: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el Squad"),
                validarCodigoSquad: String.Format("Debes seleccionar {0}.", "el Squad")
            },
            //txtOwnerDisplayNameProducto: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el owner"),
            //    validarCodigoOwner: String.Format("Debes seleccionar {0}.", "el owner")
            //},
            txtEquipoAdmContactoProducto: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el Equipo de administración y punto de contacto"),
            },
            txtEquipoAprovisionamientoProducto: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el Equipo de aprovisionamiento"),
            },
            txtGrupoTicketRemedyProducto: {
                requiredSinEspacios: String.Format("Debes seleccionar {0}.", "el grupo de soporte remedy")
            },
            txtCodigoProductoManual: {
                validarCodigo: String.Format("Debes ingresar {0}.", "el código"),
                //formatoCodigo: 'El código debe empezar con la letra "P" seguido de 4 dígitos'
                //existeCodigo: "Código ya existe"
                requiredSinEspacios: "Debes de ingresar un código de 4 caracteres.",
                minlength: "El código debe tener 4 caracteres.",
                maxlength: "El código debe tener 4 caracteres.",
                existeCodigoProducto: "El código de producto ingresado ya existe o ya está reservado.",
                validarEspaciosProducto: "El código no debe tener espacios en blanco",
                validarAlfanumericoProducto: "Solo ingresar valores alfanuméricos"
            },
            txtCodigoAplicacionProducto: {
                validarCodigoAplicacion: String.Format("Debes seleccionar {0}.", "la aplicación"),
                //existeCodigo: "Código ya existe"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtCodigoProductoManual") {
                element.parent().parent().parent().parent().append(error);
            } else {
                element.parent().append(error);
            }

            //let elclosed = element.closest(".form-group");
            //if (elclosed.length > 0) elclosed.find("label .text-danger").html("(*)");
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
        debugger;

        return aplicacionSeleccionada;
    });

    $.validator.addMethod("aplicacionDuplicada", function (value, element) {
        let data = $tblAplicaciones.bootstrapTable("getData");
        let aplicacionId = $("#hdAplicacionIdTecnologia").val();
        let existeAplicacionEnLista = data.some(x => x.AplicacionId == aplicacionId);

        return !existeAplicacionEnLista;
    });

    $.validator.addMethod("existeClaveTecnologia", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            let estado = false;
            estado = !ExisteClaveTecnologia();
            return estado;
        }
        return estado;
    });

    //$.validator.addMethod("fecha_tecnologia", function (value, element) {
    //    if ($("#chkFlagFechaFinSoporte").prop("checked")) {
    //        if (parseInt($("#cbFuenteTecnologia").val()) === 3) {
    //            return $.trim(value) !== "";
    //        }
    //    }
    //    return true;
    //});

    $.validator.addMethod("fecha_tecnologia", function (value, element) {
        if ($("#chkFlagFechaFinSoporte").prop("checked")) {
            if (parseInt($("#cbFuenteTecnologia").val()) === 3) {
                if (
                    (element.name == 'txtFechaFinExtendidaTecnologia' && $("#cbFechaCalculosTecnologia").val() == "2") ||
                    (element.name == 'txtFechaFinSoporteTecnologia' && $("#cbFechaCalculosTecnologia").val() == "3") ||
                    (element.name == 'txtFechaFinInternaTecnologia' && $("#cbFechaCalculosTecnologia").val() == "4")
                ) return $.trim(value) !== "";
                return true;
            }
        }
        return true;
    });

    $.validator.addMethod("fecha_tecnologia_no", function (value, element) {
        let checked = $("#chkFlagFechaFinSoporte").prop("checked")
        if (!checked) return value != "" && value != "-1";
        return true;
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
                existeClaveTecnologia: true,
            },
            cbTipoTecnologiaIdTecnologia: {
                requiredSelect: true,
            },
            txtDescripcionTecnologia: {
                requiredSinEspacios: true,
            },
            //txtFechaLanzamientoTecnologia: {
            //    requiredSinEspacios: true,
            //},
            txtFechaFinExtendidaTecnologia: {
                fecha_tecnologia: true,
                //fechacalculo_tecnologia: true
            },
            txtFechaFinSoporteTecnologia: {
                fecha_tecnologia: true,
                //fechacalculo_tecnologia: true
            },
            txtFechaFinInternaTecnologia: {
                fecha_tecnologia: true,
                //fechacalculo_tecnologia: true
            },
            cbTipoFechaInternaTecnologia: {
                fecha_tecnologia: true,
            },
            //txtComentariosFechaFinSoporteTecnologia: {
            //    fecha_tecnologia: true,
            //},
            cbSustentoMotivoFechaFinSoporteTecnologia: {
                fecha_tecnologia_no: true
            },
            txtSustentoUrlFechaFinSoporteTecnologia: {
                fecha_tecnologia_no: true
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
                existeClaveTecnologia: "La clave ya existe"
            },
            cbTipoTecnologiaIdTecnologia: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo de tecnología"),
            },
            txtDescripcionTecnologia: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "una descripción"),
            },
            //txtFechaLanzamientoTecnologia: {
            //    requiredSinEspacios: String.Format("Debes seleccionar {0}.", "una fecha de lanzamiento de la tecnología"),
            //},
            txtFechaFinExtendidaTecnologia: {
                fecha_tecnologia: String.Format("Debes seleccionar {0}.", "una fecha fin extendida de la tecnología"),
            },
            txtFechaFinSoporteTecnologia: {
                fecha_tecnologia: String.Format("Debes seleccionar {0}.", "una fecha fin soporte de la tecnología"),
            },
            txtFechaFinInternaTecnologia: {
                fecha_tecnologia: String.Format("Debes seleccionar {0}.", "una fecha fin interna de la tecnología"),
            },
            cbTipoFechaInternaTecnologia: {
                fecha_tecnologia: String.Format("Debes seleccionar {0}.", "un tipo de fecha interna de la tecnología"),
            },
            txtComentariosFechaFinSoporteTecnologia: {
                fecha_tecnologia: String.Format("Debes ingresar {0}.", "un comentario asociado a la fecha fin de soporte de tecnología"),
            },
            cbSustentoMotivoFechaFinSoporteTecnologia: {
                fecha_tecnologia_no: String.Format("Debes ingresar {0}", "un motivo"),
            },
            txtSustentoUrlFechaFinSoporteTecnologia: {
                fecha_tecnologia_no: String.Format("Debes ingresar {0}", "un url"),
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
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtFechaFinExtendidaTecnologia" || element.attr('name') === "txtFechaFinSoporteTecnologia"
                || element.attr('name') === "txtFechaFinInternaTecnologia") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
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
        url: URL_API_VISTA + "/Listado",
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
            //DATA_EXPORTAR.fabricante = $.trim($("#txtBusFabricanteProducto").val());
            DATA_EXPORTAR.nombre = $.trim($("#txtBusNombreProducto").val());
            //DATA_EXPORTAR.estadoObsolescenciaId = $.trim($("#cbBusEstadoObsolescenciaProducto").val()) == "-1" ? null : $.trim($("#cbBusEstadoObsolescenciaProducto").val());
            DATA_EXPORTAR.dominioId = $.trim($("#cbBusDominioProducto").val()) == "-1" ? null : $.trim($("#cbBusDominioProducto").val());
            DATA_EXPORTAR.subDominioId = $.trim($("#cbBusSubDominioProducto").val()) == "-1" ? null : $.trim($("#cbBusSubDominioProducto").val());
            //DATA_EXPORTAR.tipoProductoId = $.trim($("#cbBusTipoProducto").val()) == "-1" ? null : $.trim($("#cbBusTipoProducto").val());
            DATA_EXPORTAR.Activos = $("#chkBusFlagActivo").prop("checked");
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
    let type_icon = row.Activo ? "check" : "unchecked";
    let opciones = [];
    let editar = `<a href="javascript:EditProducto(${row.Id})" title="Editar"><i style="" id="cbEditarProducto${row.Id}" class="glyphicon glyphicon-pencil"></i></a>`;
    let cambiarEstado = `<a href="javascript:cambiarEstado(${row.Id})" title="${(row.Activo ? "Desactivar" : "Activar")} Producto"><i class="iconoVerde glyphicon glyphicon-${type_icon}"></i></a>`;
    //let cambiarEstado = `<a href="javascript:EditProducto(${row.Id})" title="Editar"><i style="" id="cbEditarProducto${row.Id}" class="glyphicon glyphicon-pencil"></i></a>`;
    let nuevaTecnologia = `<a href="javascript:NuevaTecnologiaProducto(${row.Id})" title="Nueva Tecnología"><i style="" id="cbNuevaTecnologiaProducto${row.Id}" class="glyphicon glyphicon-book"></i></a>`;
    let verTecnologias = `<a href="javascript:VerTecnologiasProducto(${row.Id})" title="Ver Tecnologías"><i style="" id="cbVerTecnologiasProducto${row.Id}" class="glyphicon glyphicon-refresh"></i></a>`;
    let verHistorial = `<a href="javascript:VerHistorialProducto(${row.Id})" title="Ver Historial"><i style="" id="cbVerHistorialProducto${row.Id}" class="glyphicon glyphicon-list-alt"></i></a>`;
    //let estado = `<a href="javascript:CambiarEstado(${row.Id})" title="Cambiar estado"><i style="" id="cbOpcProducto${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    opciones.push(editar);
    
    //debugger;
    if (row.CantidadTecnologiasRegistradas > 0) {
        opciones.push(verTecnologias);
        if (row.Activo == false)
            opciones.push(cambiarEstado);
    }        
    else {
        opciones.push(cambiarEstado);
        opciones.push(nuevaTecnologia);
    }
    opciones.push(verHistorial);
    return opciones.join("&nbsp;");
}

function cambiarEstado(ProductoId) {
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás seguro que deseas desactivar el registro seleccionado?",
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    type: 'GET',
                    contentType: "application/json; charset=utf-8",
                    url: `${URL_API_VISTA}/CambiarEstado?Id=${ProductoId}`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("La actualización del registro procedió satisfactoriamente", TITULO_MENSAJE);
                                listarProductos();
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
                        waitingDialog.hide();
                    }
                });
            }
        }
    });
}

function NuevaTecnologiaProducto(productoId) {
    open(`${pathRoot}GestionTecnologia/NewTecnologia?id=${productoId}&modal=mdAddOrEditTec`, "_blank");
}

function VerTecnologiasProducto(productoId) {
    ListarTecnologiasProducto(productoId, () => {
        MdTecnologiasByProducto(true);
    });
}

function VerHistorialProducto(productoId) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API + "/Historial/ListadoByEntidadId?entidad=Producto&id=" + productoId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            MdHistorial(true);
            $tblHistorial.bootstrapTable("load", result);
            if (typeof fn == "function") fn();
        },
        complete: function () {
            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function formatOpcTecnologia(value, row, index) {
    let listaOpciones = [];
    debugger;
    let editar = `<a href="javascript:EditTecnologia(${row.Id})" title="Editar"><i style="" id="cbEditarTecnologia${row.Id}" class="glyphicon glyphicon-pencil"></i></a>`;
    let eliminar = `<a href="javascript:RemoveTecnologia(${row.Id}, ${row.ProductoId})" title="Eliminar"><i style="" id="cbEliminarTecnologia${row.Id}" class="glyphicon glyphicon-trash"></i></a>`;
    let verAplicaciones = row.TipoTecnologiaId == tipoIdEstandarRestringido ? `<a href="javascript:VerAplicaciones(${row.Id}, ${row.TipoTecnologiaId})" title="Ver Aplicaciones"><i style="" id="cbVerAplicaciones${row.Id}" class="glyphicon glyphicon-eye-open"></i></a>` : "";

    listaOpciones.push(editar);
    listaOpciones.push(eliminar);
    listaOpciones.push(verAplicaciones);
    return listaOpciones.join("&nbsp;");
}

function EditTecnologia(TecnologiaId) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API + "/Tecnologia/New/" + TecnologiaId + `?withAplicaciones=true`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            //$("#titleFormProducto").html("Editar Producto");
            MdAddTecnologiaProducto(true);

            $("#txtFabricanteTecnologia").val(result.Fabricante);
            $("#txtNombreTecnologia").val(result.Nombre);

            $("#hIdProducto").val(result.ProductoId);
            $("#hdTecnologiaId").val(result.Id);
            $("#txtVersionTecnologia").val(result.Versiones);
            $("#txtClaveTecnologia").val(result.ClaveTecnologia);
            $("#cbTipoTecnologiaIdTecnologia").val(result.TipoTecnologiaId).trigger("change");
            //$("#cbTipoTecnologiaIdTecnologia").val(result.TipoTecnologiaId);

            $("#txtDescripcionTecnologia").val(result.Descripcion);
            $("#divFechaLanzamientoTecnologia").data("DateTimePicker").date(result.FechaLanzamiento == null ? null : new Date(result.FechaLanzamiento));
            $("#chkFlagFechaFinSoporte").prop("checked", result.FlagFechaFinSoporte).trigger("change");
            if (result.Fuente != null) $("#cbFuenteTecnologia").val(result.Fuente).trigger("change");
            if (result.FechaCalculoTec != null) $("#cbFechaCalculosTecnologia").val(result.FechaCalculoTec).trigger("change");
            if (result.FechaExtendida != null) $("#divFechaFinExtendidaTecnologia").data("DateTimePicker").date(new Date(result.FechaExtendida));
            if (result.FechaFinSoporte != null) $("#divFechaFinSoporteTecnologia").data("DateTimePicker").date(new Date(result.FechaFinSoporte));
            if (result.FechaAcordada != null) $("#divFechaFinInternaTecnologia").data("DateTimePicker").date(new Date(result.FechaAcordada));
            if (result.FlagFechaFinSoporte) $("#cbTipoFechaInternaTecnologia").val(result.TipoFechaInterna == null ? "-1" : result.TipoFechaInterna);
            if (!result.FlagFechaFinSoporte) $("#cbSustentoMotivoFechaFinSoporteTecnologia").val(result.SustentoMotivo == null ? "-1" : result.SustentoMotivo);
            if (!result.FlagFechaFinSoporte) $("#txtSustentoUrlFechaFinSoporteTecnologia").val(result.SustentoUrl);
            $("#txtComentariosFechaFinSoporteTecnologia").val(result.ComentariosFechaFin);
            $("#cbAutomatizacionImplementadaIdTecnologia").val(result.AutomatizacionImplementadaId);

            LIST_APPSTECNOLOGIA = (result.ListAplicaciones || []).map(x => x);

            $tblAplicaciones.bootstrapTable("load", result.ListAplicaciones);

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

function RemoveTecnologia(TecnologiaId, ProductoId) {
    bootbox.confirm({
        message: "¿Está seguro que desea eliminar el registro?",
        buttons: {
            confirm: {
                label: 'Eliminar',
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
                    url: URL_API + `/Tecnologia/Eliminar/${TecnologiaId}`,
                    contentType: "application/json; charset=utf-8",
                    type: "GET",
                    //data: { ListAplicaciones: data, ItemsRemoveAppId: dataEliminar, UsuarioModificacion: userName },
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (result) {
                    },
                    complete: function () {
                        ListarTecnologiasProducto(ProductoId, () => {
                            bootbox.alert("Se guardó correctamente el registro.");
                            //setTimeout(() => bootbox.alert("Se guardó correctamente el registro."), 100);
                        });
                    },
                    error: function (result) {
                        alert(result.responseText);
                    }
                });
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
            $("#txtTribuCoeDisplayNameProducto").val(result.TribuCoeDisplayName);
            $("#hdTribuCoeIdProducto").val(result.TribuCoeId);
            cbTribuCoeIdProducto_Change(() => {
                //$("#txtSquadDisplayNameProducto").val(result.SquadDisplayName);
                //$("#hdSquadIdProducto").val(result.SquadId);
                $("#cbSquadIdProducto").val(result.SquadId);
            });
            $("#txtOwnerDisplayNameProducto").val(result.OwnerDisplayName);
            $("#hdOwnerIdProducto").val(result.OwnerId);
            $("#hdOwnerMatriculaProducto").val(result.OwnerMatricula);
            $("#hdGrupoTicketRemedyIdProducto").attr("data-text", result.GrupoTicketRemedyNombre);
            $("#hdGrupoTicketRemedyIdProducto").val(result.GrupoTicketRemedyId);
            $("#txtGrupoTicketRemedyProducto").val(result.GrupoTicketRemedyNombre);
            ChangeGrupoRemedyPendienteCreacion();
            $("#chkFlagAplicacion").prop('checked', result.EsAplicacion);
            $('#chkFlagAplicacion').bootstrapToggle(result.EsAplicacion ? 'on' : 'off');
            if (result.EsAplicacion) {
                if (result.Aplicacion != null) {
                    $("#txtCodigoAplicacionProducto").val(`${result.Aplicacion.CodigoAPT} - ${result.Aplicacion.Nombre}`);
                    $("#hdAplicacionIdProducto").val(result.AplicacionId);
                    $("#hdAplicacionCodigoProducto").val(result.Codigo);
                }
            } else {
                CODIGO_SUGERIDO = result.Codigo;
                $("#txtCodigoProductoManual").val(result.Codigo);
            }

            $("#txtCodigoProductoManual").prop("readonly", true);
            $("#txtCodigoProductoManual").prop("disabled", true); // Solo lectura
            $('#btnActualizarCodigo').prop('disabled', true); // 04.11.2021
            $("#btnActualizarCodigo").show();
           
            $("#cbTipoCicloVidaIdProducto").val(result.TipoCicloVidaId == null ? -1 : result.TipoCicloVidaId);
            $("#cbEsquemaLicenciamientoSuscripcionIdProducto").val(result.EsquemaLicenciamientoSuscripcionId == null ? -1 : result.EsquemaLicenciamientoSuscripcionId);
            $("#txtEquipoAdmContactoProducto").val(result.EquipoAdmContacto);
            $("#txtEquipoAprovisionamientoProducto").val(result.EquipoAprovisionamiento);
            LIST_ARQUPRODUCTO = (result.ListaArquetipo || []).map(x => x);

            $tblArquetipos.bootstrapTable("load", result.ListaArquetipo);
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

    $("#txtCodigoProductoManual").prop("readonly", false);
    $("#txtCodigoProductoManual").prop("disabled", false); // Solo lectura
    $('#btnActualizarCodigo').prop('disabled', false); // 04.11.2021
    $("#btnActualizarCodigo").show();
}

function GuardarAddOrEditProducto() {
    if ($("#formAddOrEditProducto").valid()) {
        //$("#btnRegProducto").button("loading");

        var producto = ObtenerObjetoProducto();

        if (producto.Id == 0) {
            //bootbox.confirm({
            //    message: "¿Desea agregar Tecnologías?",
            //    buttons: {
            //        confirm: {
            //            label: 'Agregar',
            //            className: 'btn-primary'
            //        },
            //        cancel: {
            //            label: 'Por el momento no, registrar',
            //            className: 'btn-secondary'
            //        }
            //    },
            //    callback: function (result) {
            //        debugger;
            //        if (result) {

            //            IrTecnologias();
            //            $("#MdTecnologiaByProducto").modal(opcionesModal);
            //            //return false;
            //        } else {
            //            GuardarProducto(producto, () => {
            //                bootbox.alert("Se guardó correctamente el registro.");
            //            });
            //        }
            //    }
            //});
            bootbox.dialog({
                message: '<label style="font-size: 18px;">¿Desea agregar Tecnologías?</label>',
                buttons: {
                    saveProduct: {
                        label: 'Por el momento no, registrar',
                        className: 'btn-secondary',
                        callback: function () {
                            GuardarProducto(producto, () => {
                                bootbox.alert("Se guardó correctamente el registro.");
                            });
                        }
                    },
                    confirm: {
                        label: 'Agregar',
                        className: 'btn-primary',
                        callback: function () {
                            IrTecnologias();
                            $("#MdTecnologiaByProducto").modal(opcionesModal);
                        }
                    }
                }
            });
            

        } else {
            GuardarProducto(producto, () => {
                bootbox.alert("Se guardó correctamente el registro.");
            });
        }

    }
}

function GuardarProducto(producto, fn = null) {
    $.ajax({
        url: URL_API_VISTA,
        type: "POST",
        data: JSON.stringify(producto),
        contentType: "application/json",
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
        url: URL_API + "/Tecnologia/FromProducto",
        type: "POST",
        data: JSON.stringify(tecnologia),
        contentType: "application/json",
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
    $("#chkFlagFechaFinSoporte").prop("checked", false).trigger("change");
    $("#cbFuenteTecnologia").val(-1);
    $("#cbFechaCalculosTecnologia").val(-1);
    $("#divFechaFinExtendidaTecnologia").val("");
    $("#divFechaFinSoporteTecnologia").val("");
    $("#divFechaFinInternaTecnologia").val("");
    //$("#divFechaFinExtendidaTecnologia").data("DateTimePicker").date(fechaActual);
    //$("#divFechaFinSoporteTecnologia").data("DateTimePicker").date(fechaActual);
    //$("#divFechaFinInternaTecnologia").data("DateTimePicker").date(fechaActual);
    //$("#txtFechaLanzamientoTecnologia").val(fechaActualString);
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
    let fabricante = $("#txtFabricanteProducto").val().trim();
    let nombre = $("#txtNombreProducto").val().trim();
    let descripcion = $("#txtDescripcionProducto").val().trim();
    if (fabricante != '') $("#txtFabricanteTecnologia").val(fabricante);
    if (nombre != '') $("#txtNombreTecnologia").val(nombre);
    if (descripcion != '') $("#txtDescripcionTecnologia").val(descripcion);
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
    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre}&estadoObsolescenciaId=${DATA_EXPORTAR.estadoObsolescenciaId}&dominioId=${DATA_EXPORTAR.dominioId}&subdominioId=${DATA_EXPORTAR.subDominioId}&tipoProductoId=${DATA_EXPORTAR.tipoProductoId}&activo=${DATA_EXPORTAR.Activos}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
    DATA_EXPORTAR.activo = DATA_EXPORTAR.Activos
    let url = `${URL_API_VISTA}/Exportar`;
    $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(DATA_EXPORTAR),
        contentType: "application/json",
        dataType: "json",
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
                    //SetItems(dataObject.EstadoObsolescencia, $("#cbBusEstadoObsolescenciaProducto"), TEXTO_TODOS);
                    SetItems(dataObject.Dominio, $("#cbBusDominioProducto"), TEXTO_TODOS);
                    SetItems(LIST_SUBDOMINIO, $("#cbBusSubDominioProducto"), TEXTO_TODOS);
                    //SetItemsCustomField(dataObject.Tipo, $("#cbBusTipoProducto"), TEXTO_TODOS, "Id", "Nombre");

                    SetItems(dataObject.Dominio, $("#cbDominioIdProducto"), TEXTO_SELECCIONE);
                    SetItems(LIST_SUBDOMINIO, $("#cbSubDominioIdProducto"), TEXTO_SELECCIONE);
                    //SetItemsCustomField(dataObject.Tipo, $("#cbTipoProductoIdProducto"), TEXTO_SELECCIONE, "Id", "Nombre");
                    SetItems(dataObject.EstadoObsolescencia, $("#cbEstadoObsolescenciaIdProducto"), TEXTO_SELECCIONE);

                    //SetItemsCustomField(dataObject.Tipo, $("#cbTipoTecnologiaIdTecnologia"), TEXTO_SELECCIONE, "Id", "Nombre");
                    SetItems(dataObject.Fuente, $("#cbFuenteTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.FechaCalculo, $("#cbFechaCalculosTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.AutomatizacionImplementada, $("#cbAutomatizacionImplementadaIdTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoCicloVida || [], $("#cbTipoCicloVidaIdProducto"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EsquemaLicenciamientoSuscripcion || [], $("#cbEsquemaLicenciamientoSuscripcionIdProducto"), TEXTO_SELECCIONE);
                    SetItems(dataObject.SustentoMotivo, $("#cbSustentoMotivoFechaFinSoporteTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoFechaInterna, $("#cbTipoFechaInternaTecnologia"), TEXTO_SELECCIONE);

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

function cbFuente_Change() {
    let fuenteId = $("#cbFuenteTecnologia").val();
    let readonly = fuenteId != 3;
    $("#txtFechaFinExtendidaTecnologia, #txtFechaFinSoporteTecnologia, #txtFechaFinInternaTecnologia").attr("readonly", readonly);
    if (readonly) $("#txtFechaFinExtendidaTecnologia, #txtFechaFinSoporteTecnologia, #txtFechaFinInternaTecnologia").val("");
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

function ExisteFabricanteNombre(fabricante, nombre, id) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Producto" + `/ExisteFabricanteNombre?fabricante=${fabricante}&nombre=${nombre}&id=${id}`,
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

function ExisteCodigoProducto(codigoProducto) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/ExisteProductoCodigo?id=${codigoProducto}`,
        dataType: "json",
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

function CargarSubDominioBusqueda() {
    let dominioId = $("#cbBusDominioProducto").val();
    let listSubDominio = LIST_SUBDOMINIO.filter(x => x.TipoId == dominioId);
    SetItems(listSubDominio, $("#cbBusSubDominioProducto"), TEXTO_TODOS);
}

function GenerarClaveTecnologia() {
    //let fabricante = $("#txtFabricanteProducto").val().trim().replace(/ /, "");
    let fabricante = $("#txtFabricanteProducto").val().trim();
    //let nombre = $("#txtNombreProducto").val().trim().replace(/ /, "");
    let nombre = $("#txtNombreProducto").val().trim();
    //let version = $("#txtVersionTecnologia").val().trim().replace(/ /, "");
    let version = $("#txtVersionTecnologia").val().trim();
    let clave = `${fabricante} ${nombre} ${version}`;
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
    producto.DominioStr = $("#cbDominioIdProducto option:checked").text();
    producto.SubDominioId = $("#cbSubDominioIdProducto").val();
    producto.SubDominioStr = $("#cbSubDominioIdProducto option:checked").text();
    //producto.TipoProductoId = $("#cbTipoProductoIdProducto").val();
    //producto.TipoProductoStr = $("#cbTipoProductoIdProducto option:checked").text();
    producto.EstadoObsolescenciaId = $("#cbEstadoObsolescenciaIdProducto").val();
    producto.TribuCoeDisplayName = $("#txtTribuCoeDisplayNameProducto").val();
    producto.TribuCoeId = $("#hdTribuCoeIdProducto").val();
    producto.SquadId = $("#cbSquadIdProducto").val() == "-1" ? null : $("#cbSquadIdProducto").val();
    producto.SquadDisplayName = producto.SquadId == null ? null : $("#cbSquadIdProducto option:selected").text();
    producto.OwnerDisplayName = $("#txtOwnerDisplayNameProducto").val();
    producto.OwnerId = $("#hdOwnerIdProducto").val();
    producto.OwnerMatricula = $("#hdOwnerMatriculaProducto").val();
    producto.GrupoTicketRemedyNombre = $("#txtGrupoTicketRemedyProducto").val();
    producto.GrupoTicketRemedyId = $("#hdGrupoTicketRemedyIdProducto").val() == "" || $("#hdGrupoTicketRemedyIdProducto").val() == "0" ? null : $("#hdGrupoTicketRemedyIdProducto").val();
    producto.EquipoAdmContacto = $("#txtEquipoAdmContactoProducto").val();
    producto.EquipoAprovisionamiento = $("#txtEquipoAprovisionamientoProducto").val();
    producto.EsAplicacion = $("#chkFlagAplicacion").prop("checked");
    if (!producto.EsAplicacion) {
        //producto.Codigo = $("#txtCodigoProducto").val();
        producto.Codigo = $("#txtCodigoProductoManual").val().toUpperCase();
    } else {
        producto.AplicacionId = $("#hdAplicacionIdProducto").val();
        producto.Codigo = $("#hdAplicacionCodigoProducto").val();
    }
    producto.TipoCicloVidaId = $("#cbTipoCicloVidaIdProducto").val();
    producto.TipoCicloVidaStr = $("#cbTipoCicloVidaIdProducto").val() == "-1" ? null : $("#cbTipoCicloVidaIdProducto option:checked").text();
    producto.EsquemaLicenciamientoSuscripcionId = $("#cbEsquemaLicenciamientoSuscripcionIdProducto").val() == "-1" ? null : $("#cbEsquemaLicenciamientoSuscripcionIdProducto").val();
    
    let listaArquetipos = $tblArquetipos.bootstrapTable("getData");
    producto.ListaArquetipo = listaArquetipos.filter(x => x.Id < 0);
    producto.ListaArquetipoEliminados = LIST_ARQUPRODUCTO.map(x => x.Id).filter(x => !listaArquetipos.some(y => y.Id == x));

    return producto;
}

function MdTecnologiasByProducto(EstadoMd) {
    if (EstadoMd)
        $("#MdTecnologiasByProducto").modal(opcionesModal);
    else
        $("#MdTecnologiasByProducto").modal('hide');
}

function ListarTecnologiasProducto(productoId, fn = null) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API + "/Tecnologia/ListadoByProducto?productoId=" + productoId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            $tblTecnologias.bootstrapTable("load", result);
            if (typeof fn == "function") fn();
        },
        complete: function () {
            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function ChkFlagAplicacionChange() {
    let checked = $("#chkFlagAplicacion").prop("checked");
    let className = "hidden";
    $("#txtCodigoProductoManual").val("");
    $("#txtCodigoAplicacionProducto").val("");
    $("#hdAplicacionIdProducto").val("");
    $("#hdAplicacionCodigoProducto").val("");
    if (checked) {
        $("#divCodigoProducto").addClass(className);
        $("#divCodigoAplicacionProducto").removeClass(className);
    } else {
        $("#txtCodigoProductoManual").val(CODIGO_SUGERIDO);
        $("#txtCodigoProducto").prop("readonly", true);
        $("#divCodigoAplicacionProducto").addClass(className);
        $("#divCodigoProducto").removeClass(className);
    }
}

function ListarAppsTecnologia(tecnologiaId, fn = null) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API + "/Tecnologia/TecnologiaAplicacion/Listado?tecnologiaId=" + tecnologiaId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (typeof fn == "function") fn();
            LIST_APPSTECNOLOGIASINGLE = (result || []).map(x => x);
            $tblAplicacionesSingle.bootstrapTable("load", result);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function limpiarMdAddAppsTecnologia() {
    LimpiarValidateErrores($("#formAplicaciones"));

    $("#hdAplicacionIdTecnologiaSingle").val("");
    $("#txtAplicacionTecnologiaSingle").val("");
    LIST_APPSTECNOLOGIASINGLE = [];
    $tblAplicacionesSingle.bootstrapTable('removeAll');
}

function MdAddAppsTecnologia(EstadoMd) {
    limpiarMdAddAppsTecnologia();
    if (EstadoMd)
        $("#MdAppsByTecnologia").modal(opcionesModal);
    else
        $("#MdAppsByTecnologia").modal('hide');
}

function MdCloseAppsTecnologia() {
    $("#btnRegAplicaciones").button("reset");
}

function formatOpcAplicacionSingle(value, row, index) {
    var iconRemove = `<a class='btn btn-danger' href='javascript: void(0)' onclick='removerAplicacionSingle(${row.Id}, "${row.AplicacionId}", "${row.ProductoTecnologiaId}")'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return iconRemove;
}

function removerAplicacionSingle(productoTecnologiaAplicacionId, aplicacionId, tecnologiaId) {
    productoTecnologiaAplicacionId = productoTecnologiaAplicacionId == null ? null : parseInt(productoTecnologiaAplicacionId);
    aplicacionId = parseInt(aplicacionId);

    let data = $tblAplicacionesSingle.bootstrapTable("getData");
    let registros = data.length;
    if (registros == 1) {
        bootbox.alert({
            size: "small",
            title: "Aplicaciones",
            message: "No se puede eliminar, mínimo debe tener una aplicación registrada.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    } else {
        bootbox.confirm({
            message: "¿Estás seguro que deseas eliminar el registro seleccionado?",
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
                    $tblAplicacionesSingle.bootstrapTable('remove', {
                        field: 'AplicacionId', values: [aplicacionId]
                    })
                    return;
                }
            }
        });
    }
}

function validarFormAplicaciones() {

    $.validator.addMethod("requiredMinAplicacionSingle", function (value, element) {
        let tipoTecnologiaId = $("#formAplicaciones").attr("data-tipo-tecnologia-id");
        let validar = (tipoTecnologiaId == tipoIdEstandarRestringido);
        if (!validar) return !validar;
        // debugger
        let minRegistro = $tblAplicacionesSingle.bootstrapTable('getData');
        //debugger;
        let estado = minRegistro.length > 0 ? true : false;

        return estado;
    });

    $.validator.addMethod("requiredAplicacionSingle", function (value, element) {
        let aplicacionId = $("#hdAplicacionIdTecnologiaSingle").val();
        let aplicacionSeleccionada = aplicacionId != ""

        return aplicacionSeleccionada;
    });

    $.validator.addMethod("aplicacionDuplicadaSingle", function (value, element) {
        let data = $tblAplicacionesSingle.bootstrapTable("getData");
        let aplicacionId = $("#hdAplicacionIdTecnologiaSingle").val();
        let existeAplicacionEnLista = data.some(x => x.AplicacionId == aplicacionId);

        return !existeAplicacionEnLista;
    });

    $("#formAplicaciones").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtAplicacionTecnologiaSingle: {
                //requiredAplicacionSingle: true,
                aplicacionDuplicadaSingle: true
            },
            msjValidTblSingle: {
                requiredMinAplicacionSingle: true,
            }
        },
        messages: {
            txtAplicacionTecnologiaSingle: {
                //requiredAplicacionSingle: String.Format("Debes seleccionar {0}.", "una aplicación"),
                aplicacionDuplicadaSingle: String.Format("La aplicación seleccionada {0}.", "ya se encuentra agregada")
            },
            msjValidTblSingle: {
                requiredMinAplicacionSingle: String.Format("Debes agregar {0}.", "una aplicación como mínimo")
            }
        }
    });
}

function guardarAplicaciones() {
    if ($("#formAplicaciones").valid()) {
        var itemsApps = $tblAplicacionesSingle.bootstrapTable('getData');
        let { UserName } = USUARIO;
        $("#btnRegTecnologia").button("loading");
        var itemAppsEliminar = (LIST_APPSTECNOLOGIASINGLE || []).filter(x => !itemsApps.some(y => y.AplicacionId == x.AplicacionId)).map(x => x.Id);
        itemsApps = itemsApps.filter(x => x.Id == null);
        //debugger;
        GuardarAplicaciones(itemsApps, itemAppsEliminar, UserName);
    }
}

function GuardarAplicaciones(data, dataEliminar, userName) {
    let tecnologiaId = $("#formAplicaciones").attr("data-tecnologia-id");
    $.ajax({
        url: URL_API + `/Tecnologia/TecnologiaAplicacion/GuardarMasivo`,
        type: "POST",
        data: { ListAplicaciones: data, ItemsRemoveAppId: dataEliminar, UsuarioModificacion: userName },
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
            ListarAppsTecnologia(tecnologiaId);
        },
        error: function (result) {
            alert(result.responseText);
        }
    });
}

function MdHistorial(EstadoMd) {
    limpiarMdHistorial();
    if (EstadoMd)
        $("#MdHistorial").modal(opcionesModal);
    else
        $("#MdHistorial").modal('hide');
}

function limpiarMdHistorial() {
    $tblHistorial.bootstrapTable('removeAll');
}

function ExisteClaveTecnologia() {
    let estado = true;
    let clave = encodeURIComponent($("#txtClaveTecnologia").val());
    let id = $("#hdTecnologiaId").val();
    let flagActivo = FLAG_ACTIVO_TECNOLOGIA;

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Tecnologia" + `/ExisteClaveTecnologia?clave=${clave}&Id=${id}&flagActivo=${flagActivo}`,
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

function ObtenerCodigoSugerido() {
    $.ajax({
        url: URL_API_VISTA + "/ObtenerCodigoSugerido",
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: (result) => CODIGO_SUGERIDO = result,
        async: false
    });
}

function InitAutocompletarProductoSearch($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");

                $.ajax({
                    url: URL_API + "/Producto" + `/ListadoByDescripcion?descripcion=${request.term}`,
                    //data: JSON.stringify({
                    //    descripcion: ,
                    //    id: ($("#hdTecnologiaId").val() === "" || $("#hdTecnologiaId").val() === "0") ? null : parseInt($("#hdTecnologiaId").val())
                    //}),
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

function btnActualizarCodigo_Click(e) {
    e.preventDefault();
    ObtenerCodigoSugerido();
    $("#txtCodigoProductoManual").val(CODIGO_SUGERIDO);
    $("#formAddOrEditProducto").validate().element("#txtCodigoProductoManual");
    $("#txtCodigoProductoManual").focus();
}