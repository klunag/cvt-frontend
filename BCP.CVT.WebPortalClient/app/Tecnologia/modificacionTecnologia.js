

var $table = $("#tbl-tecAprob");
var $tblTecnologias = $("#tbl-tecnologias");
var $tblAutorizador = $("#tblAutTec");
var $tblArqAprob = $("#tblArqAprob");
var $tblTecEq = $("#tblTecEq");
var $tblTecProp = $("#tblTecProp");
var $tblTecnologiaVinculacion = $("#tblTecnologiaVinculacion");
var $tblTecEqList = $("#tblTecEqList");
var $tblTecEqGeneral = $("#tblTecEqGeneral");
var $tblArquetipos = $("#tbl-arquetipos");
var $tblAplicaciones = $("#tbl-aplicaciones");
var $tableApExp = $("#tblApExp");

var ItemsRemoveAutId = [];
var ItemsRemoveTecEqId = [];
var ItemsRemoveTecArqId = [];
var ItemsRemoveTecVincId = [];
var ARR_APLICATECNOLOGIA = [];
var ITEMS_REMOVEID = [];

var ItemsEquivalencias = [];

var URL_API_VISTA = URL_API + "/Tecnologia";
var urlApiSubdom = URL_API + "/Subdominio";
var urlApiTipo = URL_API + "/Tipo";
var urlApiFam = URL_API + "/Familia";
var URL_API_VISTA_DASH = URL_API + "/Dashboard/Tecnologia";
const NO_APLICA = "NO APLICA";

var ItemNumeros = [0, 1, 2, 3, 4, 5];
var locale = { OK: 'OK', CONFIRM: 'Observar', CANCEL: 'Cancelar' };
var placeholderObs = "Comentarios asociados a la observación";
var LIST_SUBDOMINIO = [];
var DATA_SUBDOMINIO = [];
var DATA_TECNOLOGIA = [];
var DATA_APLICACION = [];
var DATA_PRODUCTO = [];
var DATA_EQUIVALENCIA = [];
var DATA_EXPERTOS = [];

var LIST_RESPONSABLE = [];
var LIST_ARQUETIPO = [];
var LIST_APLICACION = [];
var LIST_SQUAD = [];
var LIST_EQUIVALENCIA = [];
var LIST_EXPERTOS = [];

var LIST_MOTIVO_DESACTIVA = [];

var LIST_EQUIVALENCIAS_TEMPORALES = [];

var ELIMINAR_APLICACION = [];

var DATA_EXPORTAR = {};
var DATA_EXPORTAR_TEC_EQ = {};
var ESTADO = { Vigente: 1, Deprecado: 2, Obsoleto: 3 };
var ESTADO_TECNOLOGIA = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var CODIGO_INTERNO = 0;
const TITULO_MENSAJE = "Gestión de las Tecnologías";
const TITULO_MENSAJE_APROBACION = "Aprobar tecnología";
const TITULO_MENSAJE_OBSERVACION = "Observar tecnología";
const TITULO_MENSAJE_EQUIVALENCIA = "Equivalencia de tecnología";
const TITULO_MENSAJE_SOL = "Confirmación";
const TITULO_MENSAJE_DESACTIVACION = "Desactivación de tecnología";
const MENSAJE_SOL = "¿Está seguro que desea registrar la solicitud para actualizar información de esta tecnología?";
const MENSAJE_SOL_PROD = "¿Está seguro que desea registrar la solicitud para actualizar información de este producto, estas tecnologías se verán impactadas con los cambios?";
const MENSAJE_SOL2 = "¿Está seguro que desea registrar la solicitud para actualizar el registro de equivalencias de esta tecnología?";
const MENSAJE_SOL3 = "¿Está seguro que desea registrar la solicitud para eliminar esta tecnología?";
var DATOS_RESPONSABLE = {};

var TIPO_METODO = { APROBAR: 1, GUARDARCAMBIOS: 2, OBSERVAR: 3 };
var ACCESO_DIRECTO = { PRODUCTO: "1", TECNOLOGIA: "2", CICLOVIDA: "3", RESPONSABILIDADES: "4" };
var COMBO_SELECTED = "";
var FECHA_CALCULO = { EXTENDIDA: "2", SOPORTE: "3", INTERNA: "4" };

var DATA_INPUT_OPCIONAL = {};
var FLAG_ACTIVO_TECNOLOGIA = 0;
var MIGRAR_DATA = { EQUIVALENCIA: 1, INFORMACION: 2 };
const IDS_RESPONSABLES_TECNOLOGIA = { OWNER: 1, ARQ_SEGURIDAD: 2, ARQ_TECNOLOGIA: 3 };
var TEMP_MIGRAR = 0;

var MENSAJE_CARGA_MASIVA = "";
const TITULO_CARGA_MASIVA = "Resumen de importación de tecnologías";
const EDIT_TEC_FROM = {
    ACCESO_DIRECTO: 1,
    NOMBRE: 2
};

var TIPO_SAVE = 0;
var ESTADO_ID_TECNOLOGIA = 0;
var ID_ESTADO_TEC_INICIAL = 0;
var LIST_ESTADO_ESTANDAR = [];

$(function () {
    //INICIALIZACION DE COMBOS
    InitTables();
    InitMultiSelect();
    SetItemsCustomField([], $("#cbSquadIdSearch"), TEXTO_SELECCIONE, "Id", "Descripcion");

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        if (row.NroAlertasDetalle !== 0) {
            ListarAlertasDetalle(row, $('#tblRegistrosDetalle_' + row.Id), $detail);
        } else {
            $detail.empty().append("No existen registros.");
        }
    });

    validarFormCambiarEstado();
    /*$("#datGen :input").attr("pos-tab", 0);
    $("#datTran :input").attr("pos-tab", 1);
    $("#resp :input").attr("pos-tab", 2);
    $("#aprob :input").attr("pos-tab", 3); */
    InitFecha();
    initUpload($('#txtCasoUsoArchivoTecnologia'));
    if ($("#cbSquadIdProducto").val() == "") {
        $("#cbSquadIdProducto").val(-1);
    }

    $tblTecnologias.bootstrapTable();
    $tblAutorizador.bootstrapTable();
    $tblTecEq.bootstrapTable();
    $tblTecProp.bootstrapTable();
    $tblTecnologiaVinculacion.bootstrapTable();
    $tblArquetipos.bootstrapTable();
    $tblAplicaciones.bootstrapTable();

    setItemsCb($("#cbDomTec"), "/Dominio/ConSubdominio");

    $("#cbDomTec").on('change', function () {
        getSubdominiosByDomCb(this.value, $("#txtSubTec"));
    });
    $("#cbFilDom").on('change', function () {
        getSubdominiosByDomCbMultiple($("#cbFilSub"));
    });
      
    $("#cbMotivoEliminacion").change(FlagTextMotivoDesactivacion);

    validarAddOrEditFormTec();
    validarFormEquivalencias(); 
    validarFormDesactivacion();
    validarFormEquivalenciasTec();
    ValidarCamposExperto();

    FormatoCheckBox($("#divFlagEquivalencias"), "chkFlagEquivalencias");
    $("#chkFlagEquivalencias").change(FlagEquivalencias_Change);
    $("#chkFlagEquivalencias").trigger("change");
   
    FormatoCheckBox($("#divFlagMostrarSiteEstandares"), "chkFlagMostrarSiteEstandares");
    FormatoCheckBox($("#divFlagFechaFinSoporte"), "chkFlagFechaFinSoporte");
    $("#chkFlagFechaFinSoporte").change(FlagFechaFinSoporte_Change);
    $("#chkFlagFechaFinSoporte").trigger("change");
    //FormatoCheckBox($("#divFlagEstadoRestringido"), "chkFlagEstadoRestringido");
    //$("#chkFlagEstadoRestringido").change(FlagRestringido_Change);
    //$("#chkFlagEstadoRestringido").trigger("change");
    FormatoCheckBox($("#divFlagNuevoProducto"), "chkFlagNuevoProducto");
    $("#chkFlagNuevoProducto").change(() => {
        let nuevo = $("#chkFlagNuevoProducto").prop("checked");
        let accionCollapse = nuevo == true ? "show" : "hide";
        if (nuevo) $("#accordionNuevoProducto").removeClass("hidden");
        else $("#accordionNuevoProducto").addClass("hidden");
        $("#collapseOne").collapse(accionCollapse);


        let data = $tblAplicaciones.bootstrapTable("getData");

        MostrarCampoObligatorio("#txtFabricanteProducto", ".form-group", nuevo);
        MostrarCampoObligatorio("#txtNombreProducto", ".form-group", nuevo);
        MostrarCampoObligatorio("#cbDominioIdProducto", ".form-group", nuevo);
        MostrarCampoObligatorio("#cbSubDominioIdProducto", ".form-group", nuevo);
        //MostrarCampoObligatorio("#cbTipoProductoIdProducto", ".form-group", nuevo);
        MostrarCampoObligatorio("#txtTribuCoeDisplayNameProducto", ".form-group", nuevo && data.length == 0);
        MostrarCampoObligatorio("#txtDescripcionTecnologia", ".form-group", nuevo);
        MostrarCampoObligatorio("#txtCodigoProductosTecnologia", ".form-group", nuevo);
        if (nuevo == true) {
            $("#hdProductoIdTecnologia").val("");
            $("#txtFabricanteProducto").val("");
            $("#txtNombreProducto").val("");
            $("#txtDescripcionTecnologia").prop("readonly", false).val("");
            $("#cbDominioIdProducto").val(-1).trigger("change");
            //$("#cbTipoProductoIdProducto").val(-1);
            $("#txtTribuCoeDisplayNameProducto").val("");
            $("#hdTribuCoeIdProducto").val("");

            $("#txtGrupoTicketRemedyTecnologia").val('');
            $("#hdGrupoTicketRemedyIdTecnologia").val('');
            $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val(-1);
            //$("#txtEquipoAdministracionTecnologia").val('');
            $("#txtEquipoAprovisionamientoTecnologia").val('');
            LIST_SQUAD = [];
            SetItemsCustomField(LIST_SQUAD, $("#cbSquadIdProducto"), TEXTO_SELECCIONE, "Id", "Descripcion");
        } else {
            cargarDatosProducto(null);
        }
        $("#txtCodigoProductosTecnologia").prop("readonly", !nuevo);
        //SetearClaveTecnologia();
    });
    $("#chkFlagNuevoProducto").trigger("change");

    FormatoCheckBox($("#divFlagFecSop"), "cbFlagFecSop");
    $("#cbFlagFecSop").change(FlagFecSop_Change);

    FormatoCheckBox($("#divFlagApp"), "cbFlagApp");
    $("#cbFlagApp").change(FlagApp_Change);

    FormatoCheckBox($("#divSiteEstandar"), 'cbSiteEstandar');
    FormatoCheckBox($("#divEstado"), "cbEstado");
    $("#cbFuenteTecnologia").change(cbFuente_Change);

    $("#cbFechaCalculosTecnologia").change(FechaCalculo_Change);
    //$("#cbTipoTecnologiaIdTecnologia").change(CbTipoTecnologiaIdTecnologiaChange);
    $("#cbEstadoTecnologiaIdTecnologia").change(CbEstadoTecnologiaIdTecnologiaChange);

    let params = new URLSearchParams(window.location.search);
    let modal = params.get("modal");
    if ((modal || '') == 'mdAddOrEditTec') {
        addTecSTD();
        let productoId = params.get("id");
        $("#cbProductoIdTecnologia").val(productoId).trigger("change");
    } else if ((params.get("Id") || '') != '') {
        $("#txtBusTec").val(params.get("Id"));
    } else if ((params.get("codigo") || '') != '') {
        $("#txtFilCodigo").val(params.get("codigo"));
    }

    listarTecSTD();

    cargarCombos();
    CargarCombos2();

    //$("#cbProductoIdTecnologia").change(CbProductoIdTecnologia_Change);
    $("#cbDominioIdProducto").change(CargarSubDominio);
    $("#cbSubDominioIdProducto").change(CbSubDominioIdProducto_Change);

    setDefaultHd($("#txtTecReceptora"), $("#hdTecReceptora"));

    InitAutocompletarTribuCoeProducto($("#txtTribuCoeDisplayNameProducto"), $("#hdTribuCoeIdProducto"), '.tribuCoeContainer')
    InitAutocompletarProductoSearch($("#txtProductoBusTec"), $("#hdnProductoBusTec"), ".searchProductoContainer");
    InitAutocompletarGrupoTicketRemedy($("#txtEquipoAprovisionamientoTecnologia"), $("#hdMatriculaEquipoAprovisionamiento"), ".equipoAprovisionamientoContainer");
    InitAutocompletarGrupoTicketRemedy($("#txtGrupoTicketRemedyTecnologia"), $("#hdGrupoTicketRemedyIdTecnologia"), ".grupoTicketRemedyTecnologiaContainer");
    InitAutocompletarAplicacionTecnologia($("#txtAplicacionTecnologia"), $("#hdAplicacionIdTecnologia"), ".aplicacionContainer");
    InitAutocompletarTecnologia($("#txtBusTec"), $("#hdnBusTec"), $(".searchContainer"));
    InitAutocompletarBuilderLocal2($("#txtMatriculaExperto"), $("#hdMatriculaResponsablePrincipal"), ".respContainerPrincipal", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
    InitAutocompletarTribuCoeProductoFiltro($("#txtFilTribuCoeStr"), $("#hdFilTribuCoeId"), '.ownerTribuContainer', TribuCoeProductoOnSelectSearch, `${URL_API}/it-management/plataform-operations/v2/siga/unidadorganizativa/relaciontecnologia/listarcomboxfiltro`, TribuCoeProductoClear)
    
    InitAutocompletarTecnologia($("#txtTecReemplazo"), $("#hdnTecReemplazo"), $("#divTecReemplazo"));
    
    $("#txtFabricanteProducto").keyup(txtFabricanteProducto_KeyUp);
    $("#txtNombreProducto").keyup(txtNombreProducto_KeyUp);

    $("#txtVersionTecnologia").keyup(SetearClaveTecnologia);

    setDefaultUrl($("#txtUrlConfluence"));
    validarFormImportar();

    InitAutocompleteResponsables();
    InitHiddenAutocomplete();

    $("#btnResp01, #btnResp02, #btnResp03").click(validarMatriculaResponsable);

    $("#cbSquadIdProducto").change(cbSquadIdProducto_Change);
    $("#txtAreaMotivoDes").css("display", "none");

});

function MostrarCampoObligatorio(id, closest, show) {
    let elclosest = $(id).closest(closest);
    if (elclosest.length > 0) elclosest.find(".text-danger").html(show ? "(*)" : "");
};

/*
function CbTipoTecnologiaIdTecnologiaChange() {
    //let tipoProductoId = $("#cbTipoProductoIdProducto").val();
    let tipoTecnologiaId = $("#cbTipoTecnologiaIdTecnologia").val();
    //let esEditableEsquemaLicenciamiento = tipoProductoId == tipoIdEstandarRestringido && tipoTecnologiaId == tipoIdEstandarRestringido;
    //$("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").prop("disabled", !esEditableEsquemaLicenciamiento);
    let esVisible = tipoTecnologiaId == tipoIdEstandarRestringido;
    let className = "hidden";
    if (esVisible) {
        $("li a[href='#datApl']").parent().removeClass(className);
        $("#datApl").removeClass(className);
    }
    if (!esVisible) {
        $("li a[href='#datApl']").parent().addClass(className);
        $("#datApl").addClass(className);
    }
}*/

function CbEstadoTecnologiaIdTecnologiaChange() {
    let estadoTecnologiaId = $("#cbEstadoTecnologiaIdTecnologia").val();
    let className = "hidden";
    //DEPRECADO
    if (estadoTecnologiaId == 2) {
        $("li a[href='#dataDeprecado']").parent().removeClass(className);
        $("#dataDeprecado").removeClass(className);

        $("li a[href='#datApl']").parent().addClass(className);
        $("#datApl").addClass(className);
    }
    //RESTRINGIDO
    if (estadoTecnologiaId == 4) {
        $("li a[href='#datApl']").parent().removeClass(className);
        $("#datApl").removeClass(className);
        $("li a[href='#dataDeprecado']").parent().addClass(className);
        $("#dataDeprecado").addClass(className);

        //Limpiar controles:
        $("#txtFechaDeprecado").val("");
        $("#txtTecReemplazo").val("");
        $("#hdnTecReemplazo").val("");
        $tblAplicaciones.bootstrapTable("destroy");
        $tblAplicaciones.bootstrapTable({ data: [] });
    }
    else if ((estadoTecnologiaId == 1) || (estadoTecnologiaId == 3)) {
        $("li a[href='#dataDeprecado']").parent().addClass(className);
        $("#dataDeprecado").addClass(className);
        $("#txtFechaDeprecado").prop("disabled", false);
        $("#txtTecReemplazo").prop("disabled", false);

        $("li a[href='#datApl']").parent().addClass(className);
        $("#datApl").addClass(className);
    }
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
                
                $("#txtResponsableTribuCOE").val(ui.item.NombresPersonalResponsable);
                $("#hdResponsableIdTribuCOE").val(ui.item.MatriculaPersonalResponsable);
                $("#hdResponsableNameTribuCOE").val(ui.item.NombresPersonalResponsable);

                cbTribuCoeIdProducto_Change();
                $("#hdOwnerIdTecnologia").val("");
                $("#txtOwnerDisplayNameTecnologia").val("");
                $("#hdOwnerMatriculaTecnologia").val("");
               
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.value + "</font></a>").appendTo(ul);
    };
}

function TribuCoeProductoOnSelectSearch(ui) {
    cbTribuCoeIdProductoSearch_Change();
}

function TribuCoeProductoClear() {
    SetItemsCustomField([], $("#cbSquadIdSearch"), TEXTO_SELECCIONE, "Id", "Descripcion");
}

function InitAutocompletarTribuCoeProductoFiltro($searchBox, $IdBox, $container, fn = null, url = null, fnClear = null) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = (url || '') != '' ? `${url}?filtro=${request.term}` : String.Format("/GestionProducto/BuscarTribuCoePorFiltro?filtro={0}", request.term);

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
                if (typeof fn == "function") fn(ui);
            }
            return false;
        }
    })
        .keyup(function (e) {
            if ($searchBox.val() == "") {
                $IdBox.val("");
                if (typeof fnClear == "function") fnClear();
            }
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
            return $("<li>").append("<a style='display: block'><font>" + item.value + "</font></a>").appendTo(ul);
        };
}

function getTribuCoeProducto() { 
    var responsable_tribu = document.getElementById("txtTribuCoeDisplayNameProducto"); 
    if (responsable_tribu.value == "" || responsable_tribu.value == undefined) {
        $("#txtResponsableTribuCOE").val("");
        $("#hdResponsableIdTribuCOE").val("");
        $("#hdResponsableNameTribuCOE").val("");
        $("#cbSquadIdProducto").val(-1);
        $("#txtOwnerDisplayNameTecnologia").val("");
        $("#hdOwnerIdTecnologia").val("");
        $("#hdOwnerMatriculaTecnologia").val("");
        $("#hdTribuCoeIdProducto").val("");
    }
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

function InitAutocompletarAutorizadorTecnologia($searchBox, $IdBox, $container) {
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

                $IdBox.val(ui.item.Id);

                let data = $tblAutorizador.bootstrapTable("getData");
                let index = data.length + 1;
                $tblAutorizador.bootstrapTable("append", {
                    AutorizadorId: ui.item.id,
                    Matricula: ui.item.matricula,
                    Nombres: ui.item.displayName
                });

                $IdBox.val("");
                $searchBox.val("");
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
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
            $IdBox.val(ui.item.Id);
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

            LimpiarValidateErrores($("#frmTecnologia"));
            $IdBox.val(ui.item.IdAplicacion);
            $(".field-tecnologia").addClass("ignore");
            $searchBox.removeClass("ignore");
            let data = $tblAplicaciones.bootstrapTable("getData");
            if ($("#frmTecnologia").valid()) {
                let index = data.length + 1;
                
                $tblAplicaciones.bootstrapTable("append", {
                    AplicacionId: ui.item.IdAplicacion,
                    Aplicacion: {
                        Id: ui.item.IdAplicacion,
                        CategoriaTecnologica: ui.item.CategoriaTecnologica,
                        Nombre: ui.item.Descripcion,//ui.item.Nombre,
                        TipoActivoInformacion: ui.item.TipoActivo,
                        Owner_LiderUsuario_ProductOwner: ui.item.UsuarioLider,
                    }
                });

                $IdBox.val("");
                $searchBox.val("");
            }
            data = $tblAplicaciones.bootstrapTable("getData");
            MostrarCampoObligatorio("#txtTribuCoeDisplayNameProducto", ".form-group", data.length == 0);
            $(".field-tecnologia").removeClass("ignore");
            $searchBox.addClass("ignore");

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

            $IdBox.val(ui.item.Id);
            let data = $tblArquetipos.bootstrapTable("getData");
            let index = data.length + 1;
            $tblArquetipos.bootstrapTable("append", {
                Id: ui.item.Id,
                Nombre: ui.item.Descripcion
            });
            $IdBox.val("");
            $searchBox.val("");

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
            //cbSquadIdProducto_Change();
            if (typeof fn == "function") fn();
        },
        async: true,
        global: false
    });
}

function cbTribuCoeIdProductoSearch_Change(fn = null) {
    let codigoUnidad = $("#hdFilTribuCoeId").val() == "" || $("#hdFilTribuCoeId").val() == "0" ? null : $("#hdFilTribuCoeId").val();
    //let urlControllerWithParams = String.Format("/GestionProducto/BuscarSquadPorFiltro?codigoUnidad={0}", codigoUnidad);
    let urlControllerWithParams = `${URL_API}/it-management/plataform-operations/v2/siga/squad/relaciontecnologia/listarcomboxfiltro?codigoUnidad=${codigoUnidad}`;
    $.ajax({
        url: urlControllerWithParams,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (data) {
            //LIST_SQUAD = data;
            //SetItemsCustomField(LIST_SQUAD, $("#"))
            SetItemsCustomField(data, $("#cbSquadIdSearch"), TEXTO_SELECCIONE, "Id", "Descripcion");
            if (typeof fn == "function") fn();
        },
        async: true,
        global: false
    });
}

function txtResponsableTribuCOE_Change()
{
    var idTribuCoe = $("#hdTribuCoeIdProducto").val();

    $.ajax({
        url: URL_API_VISTA + "/GetTribuCoeResponsable?codigo=" + idTribuCoe,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {

            $("#txtResponsableTribuCOE").val(result.TribuCoeResponsable);   // Responsable de la Unidad
            $("#hdResponsableIdTribuCOE").val(result.TribuCoeMatricula);    // Id Responsable de la Unidad

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });

}

function txtFabricanteProducto_KeyUp() {
    let fabricante = $("#txtFabricanteProducto").val();
    $("#txtFabricanteTecnologia").val(fabricante).trigger("keyup");
}

function txtNombreProducto_KeyUp() {
    let nombre = $("#txtNombreProducto").val();
    //$("#txtNombreTecnologia").val(nombre).trigger("keyup");
}

function formatOpcAplicacion(value, row, index) {
    var iconRemove = `<a class='btn btn-danger' href='javascript: void(0)' onclick='removerAplicacion("${row.AplicacionId}")'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return iconRemove;
}

function removerAplicacion(aplicacionId) {

    let index = ELIMINAR_APLICACION.findIndex(x => x.AplicacionId == aplicacionId);
    if (index != -1)
    {
        ELIMINAR_APLICACION.splice(index, 1);
    }
    aplicacionId = parseInt(aplicacionId);

    $tblAplicaciones.bootstrapTable('remove', {
        field: 'AplicacionId', values: [aplicacionId]
    });


    let data = $tblAplicaciones.bootstrapTable("getData");
    MostrarCampoObligatorio("#txtTribuCoeDisplayNameProducto", ".form-group", data.length == 0);
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

function validarMatriculaResponsable() {
    let idBtn = $(this).prop("id");
    let idResp = parseInt(idBtn.substr(idBtn.length - 2), 10);
    switch (idResp) {
        case IDS_RESPONSABLES_TECNOLOGIA.OWNER:
            validateResponsable($("#txtOwnerDisplayNameTecnologia"), $("#hdOwnerMatriculaTecnologia"), "dueño de la tecnología");
            break;
        case IDS_RESPONSABLES_TECNOLOGIA.ARQ_SEGURIDAD:
            validateResponsable($("#txtConformidadArquitectoSeguridadTecnologia"), $("#hdArquitectoSeguridad"), "arquitecto de seguridad");
            break;
        case IDS_RESPONSABLES_TECNOLOGIA.ARQ_TECNOLOGIA:
            validateResponsable($("#txtConformidadArquitectoTecnologia"), $("#hdArquitectoTecnologia"), "arquitecto de tecnología");
            break;
    }
}

function validateResponsable($txtResp, $hdResp, mensaje) {
    const txtResp = $.trim($txtResp.val());
    if (txtResp === "") {
        toastr.error(`Debes ingresar el ${mensaje}`, TITULO_MENSAJE);
        return;
    }

    const hdResp = $.trim($hdResp.val());
    if (hdResp === "") {
        toastr.error(`No se pudo encontrar el ${mensaje} ingresado `, TITULO_MENSAJE);
        return;
    }

    toastr.success("Validación exitosa", TITULO_MENSAJE);
}

function InitHiddenAutocomplete() {
    InitHidden($("#txtOwnerDisplayNameTecnologia"), $("#hdOwnerMatriculaTecnologia"), "");
    InitHidden($("#txtConformidadArquitectoSeguridadTecnologia"), $("#hdArquitectoSeguridad"), "");
    InitHidden($("#txtConformidadArquitectoTecnologia"), $("#hdArquitectoTecnologia"), "");
}

function InitAutocompleteResponsables() {
    InitAutocompletarBuilderLocal($("#txtOwnerDisplayNameTecnologia"), $("#hdOwnerMatriculaTecnologia"), ".ownerContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
    InitAutocompletarBuilderLocal($("#txtConformidadArquitectoSeguridadTecnologia"), $("#hdArquitectoSeguridad"), ".arquitectoSeguridadContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
    InitAutocompletarBuilderLocal($("#txtConformidadArquitectoTecnologia"), $("#hdArquitectoTecnologia"), ".arquitectoTecnologiaContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
}

function InitMultiSelect() {
    SetItemsMultiple([], $("#cbFilDom"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#cbFilSub"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#cbFilEst"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#cbFilTipoTec"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#cbFilEstObs"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#cbCompatibilidadSOIdTecnologia"), NO_APLICA, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbCompatibilidadCloudIdTecnologia"), NO_APLICA, TEXTO_TODOS, true);
}

function FlagConfirmarFamilia_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        if ($.trim($("#txtFamTec").val()) !== "" && $("#hFamTecId").val() !== "0") {
            $("#txtFamTec").prop("disabled", true);
        } else {
            $("#cbFlagConfirmarFamilia").prop('checked', false);
            $("#cbFlagConfirmarFamilia").bootstrapToggle('off');
        }
    } else {
        $("#txtFamTec").prop("disabled", false);
    }
}

function FechaCalculo_Change() {
    var combo = $(this).val();
    if (combo !== "-1") {
        LimpiarValidateErrores($("#frmCicloVida"));
        switch (combo) {
            case FECHA_CALCULO.EXTENDIDA:
                $(".fechaClass").addClass("ignore");
                $(".fechaExt").removeClass("ignore");
                break;
            case FECHA_CALCULO.SOPORTE:
                $(".fechaClass").addClass("ignore");
                $(".fechaSop").removeClass("ignore");
                break;
            case FECHA_CALCULO.INTERNA:
                $(".fechaClass").addClass("ignore");
                $(".fechaInt").removeClass("ignore");
                break;
        }
    }
}

function InitFecha() {
    $(`#divFechaCalculoTecnologia,
        #divFechaLanzamientoTecnologia,
        #divFechaFinExtendidaTecnologia,
        #divFechaFinSoporteTecnologia,
        #divFechaFinInternaTecnologia,
        #divFechaDeprecado`).datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
}

function initUpload(txtNombreArchivo) {
    //var inputs = document.querySelectorAll('.inputfile');
    var inputs = txtNombreArchivo.parent().find('.inputfile');
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

function addTecSTD() {
    MostrarModalCompleto();

    $(".tabRegSTD").addClass("tec");

    $("#titleFormTec").html("Nueva Tecnología");
    $("#hdTecnologiaId").val(''); //TODO
    $("#hActTec").val(true);
    $tblAutorizador.bootstrapTable('destroy');
    $tblAutorizador.bootstrapTable();
    mdAddOrEditTec(true);
    SetearClaveTecnologia();
    $("#AppContainer").addClass("tec");
    //$("#cbFuenteTec").trigger("change");
    $("#FecSopManualContainer").removeClass("tec");

    $('a[data-toggle="tab"]')[0].click();
}

function LimpiarFiltros() {
    $("#txtBusTec, #txtFilCodigo, #txtFilDueno, #txtFilEquipo, #cbFilFam").val("");
    //$("#cbFilDom, #cbFilSub, #cbFilEst, #cbFilEsFecSop, #cbFilTipoTec, #cbFilEstObs, #txtFilAplica").val("-1");
    $("#cbFilDom, #cbFilSub, #cbFilEst, #cbFilEsFecSop, #cbFilTipoTec, #txtFilAplica").val("-1");
    $("#cbFilEstObs").val(null);
}

function ObtenerDataFormularioGeneral(tec, EstadoTecnologiaId) {
    //var tec = {};
    tec.Id = ($("#hdTecnologiaId").val() === "") ? 0 : parseInt($("#hdTecnologiaId").val());
    tec.Activo = $("#hActTec").val();
    tec.EstadoTecnologia = EstadoTecnologiaId;
    tec.ClaveTecnologia = $("#txtClaveTecnologia").val();

    //Tab 1
    tec.Nombre = $("#txtNomTec").val() || "";
    tec.Descripcion = $("#txtDesTec").val() || "";
    tec.Versiones = $("#txtVerTec").val() || "";
    //Nuevo Flag 
    tec.FlagConfirmarFamilia = $("#cbFlagConfirmarFamilia").prop("checked");
    tec.FamiliaId = $("#hFamTecId").val();
    tec.TipoTecnologiaId = $("#cbTipTec").val();
    tec.Fabricante = $("#txtFabricanteTec").val();
    tec.FlagFechaFinSoporte = $("#cbFlagFecSop").prop("checked");
    tec.Fuente = tec.FlagFechaFinSoporte ? $("#cbFuenteTec").val() : null;
    tec.FechaLanzamiento = tec.FlagFechaFinSoporte ? ($("#dpFecLanTec").val() !== "" ? castDate($("#dpFecLanTec").val()) : null) : null;
    tec.FechaExtendida = tec.FlagFechaFinSoporte ? ($("#dpFecExtTec").val() !== "" ? castDate($("#dpFecExtTec").val()) : null) : null;
    tec.FechaFinSoporte = tec.FlagFechaFinSoporte ? ($("#dpFecSopTec").val() !== "" ? castDate($("#dpFecSopTec").val()) : null) : null;
    tec.FechaAcordada = tec.FlagFechaFinSoporte ? ($("#dpFecIntTec").val() !== "" ? castDate($("#dpFecIntTec").val()) : null) : null;
    tec.FechaCalculoTec = tec.FlagFechaFinSoporte ? $("#cbFechaCalculosTecnologia").val() : null;
    tec.ComentariosFechaFin = $("#txtComTec").val();
    tec.Existencia = $("#cbExisTec").val();
    tec.Facilidad = $("#cbFacAcTec").val();
    tec.Riesgo = $("#cbRiesgTec").val();
    tec.Vulnerabilidad = $("#txtVulTec").val();
    tec.CasoUso = $("#txtCusTec").val() || "";
    tec.Requisitos = $("#txtReqHSTec").val() || "";
    tec.Compatibilidad = $("#txtCompaTec").val() || "";
    tec.Aplica = $("#txtApliTec").val() === "-1" ? "" : $("#txtApliTec").val();
    tec.FlagAplicacion = $("#cbFlagApp").prop("checked");
    tec.CodigoAPT = tec.FlagAplicacion ? $("#hdIdApp").val() : null;

    //Tab 2
    tec.SubdominioId = $("#txtSubTec").val();
    tec.EliminacionTecObsoleta = $("#hdTecnologiaIdObs").val() === "" ? null : parseInt($("#hdTecnologiaIdObs").val());
    tec.RoadmapOpcional = $.trim($("#txtElimTec").val()) === "" || $("#hdTecnologiaIdObs").val() !== "" ? null : $("#txtElimTec").val();
    tec.Referencias = $("#txtRefTec").val() || "";
    tec.PlanTransConocimiento = $("#txtPlanTransTec").val() || "";
    tec.EsqMonitoreo = $("#txtEsqMonTec").val() || "";
    tec.LineaBaseSeg = $("#txtLinSegTec").val() || "";
    tec.EsqPatchManagement = $("#txtPatManTec").val() || "";
    tec.EsqPatchManagement = $("#txtPatManTec").val() || "";

    //Tab 3
    tec.Dueno = $("#txtDueTec").val() || "";
    tec.EqAdmContacto = $("#txtEqAdmTec").val() || "";
    tec.GrupoSoporteRemedy = $("#txtGrupRemTec").val() || "";
    tec.ConfArqSeg = $("#txtConfArqSegTec").val() || "";
    tec.ConfArqTec = $("#txtConfArqTec").val() || "";
    tec.EncargRenContractual = $("#txtRenConTec").val() || "";
    tec.EsqLicenciamiento = $("#txtEsqLinTec").val() || "";
    tec.SoporteEmpresarial = $("#txtSopEmpTec").val() || "";

    tec.ItemsRemoveAutIdSTR = ItemsRemoveAutId.join("|") || "";
    tec.ItemsAddAutorizadorSTR = $tblAutorizador.bootstrapTable('getData').map(x => x.MatriculaBanco).join("|") || "";

    return tec;
}

function ObtenerDataFormulario() {
    let tec = {};
    tec.Id = ($("#hdTecnologiaId").val() === "") ? 0 : parseInt($("#hdTecnologiaId").val());
    tec.ProductoId = ($("#hdProductoIdTecnologia").val() == "-1" || $("#hdProductoIdTecnologia").val() == "" || $("#hdProductoIdTecnologia").val() == "0") ? null : parseInt($("#hdProductoIdTecnologia").val());

    tec.Producto = {};
    tec.Producto.Codigo = $("#txtCodigoProductosTecnologia").val();
    tec.Producto.Fabricante = $("#txtFabricanteTecnologia").val(); //*
    tec.Nombre = $("#txtNombreProducto").val();   // ¿Solo afectará a la tabla tecnología o también a la tabla producto?
    tec.Producto.Nombre = $("#txtNombreProducto").val();   // ¿Solo afectará a la tabla tecnología o también a la tabla producto?
    tec.Versiones = $("#txtVersionTecnologia").val();
    tec.ClaveTecnologia = $("#txtClaveTecnologia").val();
    tec.Descripcion = $("#txtDescripcionTecnologia").val();
    tec.Producto.Descripcion = $("#txtDescripcionProducto").val();
    
    tec.Producto.DominioId = $("#cbDominioIdProducto").val(); 
    tec.Producto.DominioStr = $("#cbDominioIdProducto option:checked").text(); // *
    tec.Producto.SubDominioId = $("#cbSubDominioIdProducto").val(); // *
    tec.Producto.SubDominioStr = $("#cbSubDominioIdProducto option:checked").text(); // *
    //tec.Producto.TipoProductoId = $("#cbTipoProductoIdProducto").val(); // *
    //tec.Producto.TipoProductoStr = $("#cbTipoProductoIdProducto option:checked").text(); // *
    tec.Producto.TipoCicloVidaId = $("#cbTipoCicloVidaIdProducto").val(); // *
    tec.Producto.TipoCicloVidaStr = $("#cbTipoCicloVidaIdProducto").val() == "-1" ? null : $("#cbTipoCicloVidaIdProducto option:checked").text(); // *
     
    tec.Producto.EsquemaLicenciamientoSuscripcionId = $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val() == "-1" ? null : $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val(); // *
    tec.Producto.EsquemaLicenciamientoSuscripcionStr = $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val() == "-1" ? null : $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia option:checked").text(); // *
    tec.FlagSiteEstandar = $("#chkFlagMostrarSiteEstandares").prop("checked");
    //tec.FlagTieneEquivalencias = $("#chkFlagEquivalencias").prop("checked");
    //tec.MotivoId = $("#cbMotivoIdTecnologia").val() == "-1" ? null : $("#cbMotivoIdTecnologia").val();

    // ===============================================
    // Tab - General
    // ===============================================
    tec.TipoTecnologiaId = $("#cbTipoTecnologiaIdTecnologia").val();
    tec.TipoTecnologiaStr = $("#cbTipoTecnologiaIdTecnologia option:checked").text();
    tec.AutomatizacionImplementadaId = $("#cbAutomatizacionImplementadaIdTecnologia").val();
    tec.RevisionSeguridadId = $("input[name='rbtRevisionSeguridadIdTecnologia']:checked").val();
    tec.RevisionSeguridadDescripcion = $("#txtRevisionSeguridadDescripcionTecnologia").val();
    tec.FechaLanzamiento = $("#txtFechaLanzamientoTecnologia").val() == "" ? null : castDate($("#txtFechaLanzamientoTecnologia").val());

    tec.FlagFechaFinSoporte = $("#chkFlagFechaFinSoporte").prop("checked");
    // En caso SI exista fecha de fin de soporte
    tec.Fuente = !tec.FlagFechaFinSoporte ? null : $("#cbFuenteTecnologia").val() == "-1" ? null : $("#cbFuenteTecnologia").val(); 
    tec.FechaCalculoTec = !tec.FlagFechaFinSoporte || $("#cbFechaCalculosTecnologia").val() == "-1" ? null : $("#cbFechaCalculosTecnologia").val();

    tec.FechaExtendida = !tec.FlagFechaFinSoporte || $("#txtFechaFinExtendidaTecnologia").val() == "" ? null : castDate($("#txtFechaFinExtendidaTecnologia").val());
    tec.FechaFinSoporte = !tec.FlagFechaFinSoporte || $("#txtFechaFinSoporteTecnologia").val() == "" ? null : castDate($("#txtFechaFinSoporteTecnologia").val());
    tec.FechaAcordada = !tec.FlagFechaFinSoporte || $("#txtFechaFinInternaTecnologia").val() == "" ? null : castDate($("#txtFechaFinInternaTecnologia").val());
    tec.ComentariosFechaFin = !tec.FlagFechaFinSoporte || $("#txtComentariosFechaFinSoporteTecnologia").val() == "" ? null : $("#txtComentariosFechaFinSoporteTecnologia").val();
    

    // En caso NO exista fecha de fin de soporte
    tec.SustentoMotivo = tec.FlagFechaFinSoporte || $("#cbSustentoMotivoFechaFinSoporteTecnologia").val() == "-1" ? null : $("#cbSustentoMotivoFechaFinSoporteTecnologia").val();
    tec.SustentoUrl = tec.FlagFechaFinSoporte || $("#txtSustentoUrlFechaFinSoporteTecnologia").val() == "" ? "" : $("#txtSustentoUrlFechaFinSoporteTecnologia").val();

    tec.UrlConfluenceId = $("input[name='rbtUrlConfluenceIdTecnologia']:checked").val();
    tec.UrlConfluence = $("#txtUrlConfluenceTecnologia").val();
    
    tec.CasoUso = $("#txtCasoUsoTecnologia").val();
    let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
    let flagTieneArchivo = $("#txtCasoUsoArchivoTecnologia").val() !== TEXTO_SIN_ARCHIVO;
    tec.ArchivoId = archivoId == 0 && flagTieneArchivo ? null : archivoId;

    tec.Aplica = $("#cbPlataformaAplicaIdTecnologia").val() == "-1" ? null : $("#cbPlataformaAplicaIdTecnologia").val();
    tec.AplicaStr = $("#cbPlataformaAplicaIdTecnologia option:checked").text();
    tec.CompatibilidadSOId = $("#cbCompatibilidadSOIdTecnologia").val() == null ? null : $("#cbCompatibilidadSOIdTecnologia").val().join(",");
    tec.CompatibilidadCloudId = $("#cbCompatibilidadCloudIdTecnologia").val() == null ? null : $("#cbCompatibilidadCloudIdTecnologia").val().join(",");
    tec.EsqMonitoreo = $("#txtEsquemaMonitoreoTecnologia").val();   // Nuevo

    //Deprecado
    tec.EstadoId = $("#cbEstadoTecnologiaIdTecnologia").val();
    tec.EstadoIdStr = $("#cbEstadoTecnologiaIdTecnologia option:checked").text();
    //tec.FechaDeprecada = $("#txtFechaDeprecado").val();
    tec.FechaDeprecada = $("#txtFechaDeprecado").val() == "" ? null : castDate($("#txtFechaDeprecado").val());
    tec.TecReemplazoDepId = ($("#hdnTecReemplazo").val() === "") ? 0 : parseInt($("#hdnTecReemplazo").val());
    tec.TecReemplazoDepNomb = $("#txtTecReemplazo").val();
    //
    
    // ===============================================
    // -- Tab - Responsabilidades
    // ===============================================
    tec.Producto.TribuCoeDisplayName = $("#txtTribuCoeDisplayNameProducto").val(); // Nuevo
    tec.Producto.TribuCoeId = $("#hdTribuCoeIdProducto").val(); // Nuevo
    tec.Producto.TribuCoeResponsable = ($("#txtResponsableTribuCOE").val() == "" || $("#txtResponsableTribuCOE").val() == null ? $("#hdResponsableNameTribuCOE").val() : $("#txtResponsableTribuCOE").val());
    tec.Producto.TribuResponsableMatricula = $("#hdResponsableIdTribuCOE").val();  // Nuevo
    
    tec.Producto.SquadId = $("#cbSquadIdProducto").val() == "-1" || $("#cbSquadIdProducto").val() == "" ? null : $("#cbSquadIdProducto").val(); // Nuevo
    tec.Producto.SquadDisplayName = tec.Producto.SquadId == null ? null : $("#cbSquadIdProducto option:selected").text(); // Nuevo
    tec.Producto.OwnerDisplayName = $("#txtOwnerDisplayNameTecnologia").val(); // Nuevo
    tec.Producto.OwnerId = $("#hdOwnerIdTecnologia").val(); // Nuevo
    tec.Producto.OwnerMatricula = $("#hdOwnerMatriculaTecnologia").val(); // Nuevo
    tec.ConfArqSeg = $("#hdArquitectoSeguridad").val();
    tec.ConfArqTec = $("#hdArquitectoTecnologia").val();
    tec.EquipoAprovisionamiento = $("#txtEquipoAprovisionamientoTecnologia").val();
    tec.Producto.GrupoTicketRemedyNombre = $("#txtGrupoTicketRemedyTecnologia").val();
    tec.Producto.GrupoTicketRemedyId = $("#hdGrupoTicketRemedyIdTecnologia").val() == "" || $("#hdGrupoTicketRemedyIdTecnologia").val() == "0" ? null : $("#hdGrupoTicketRemedyIdTecnologia").val();
    //--------

    // ===============================================
    // -- Tab - Aplicaciones
    // ===============================================
    let EstadoTecnologiaId = $("#cbEstadoTecnologiaIdTecnologia").val();
    //Restringido
    if (EstadoTecnologiaId == 4) {
        tec.ListAplicaciones = $tblAplicaciones.bootstrapTable("getData");
        tec.ListAplicacionesEliminar = LIST_APLICACION.filter(function (item) {
            return !ELIMINAR_APLICACION.includes(item);
        });
        tec.ListAplicaciones = tec.ListAplicaciones.filter(x => x.Id == null);
    }
    else
    {
        tec.ListAplicaciones = null;
        tec.ListAplicacionesEliminar = LIST_APLICACION;
    }

    tec.ListExpertos = $tableApExp.bootstrapTable("getData");
    tec.ListExpertos = tec.ListExpertos.filter(x => x.Registro == 0);
    tec.ListExpertosEliminar = LIST_EXPERTOS.filter(function (item) {
        return !DATA_EXPERTOS.includes(item);
    });
    //tec.Producto.EstadoObsolescenciaId = estadoObsolescenciaIdVigente;
    //tec.Dueno = $("#txtOwnerDisplayNameTecnologia").val();
    //tec.EsqLicenciamiento = $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val() == "-1" ? null : $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val();

    tec.TipoSave =TIPO_SAVE;
    //tec.FlagRestringido = $("#chkFlagEstadoRestringido").prop("checked");
    return tec;
}


function ObtenerDataFormularioEquivalencia() {
    //let flagNuevoProducto = $("#chkFlagNuevoProducto").prop("checked");
    let tec = {};
    tec.Id = ($("#hdTecnologiaId").val() === "") ? 0 : parseInt($("#hdTecnologiaId").val());
    tec.FlagTieneEquivalencias = $("#chkFlagEquivalencias").prop("checked");
    tec.MotivoId = !tec.FlagTieneEquivalencias ? $("#cbMotivoIdTecnologia").val() : "-1";
    tec.MotivosSinEquivalenciasStr = !tec.FlagTieneEquivalencias ? $("#cbMotivoIdTecnologia option:selected").text() : "";

    tec.ListEquivalencias = !tec.FlagTieneEquivalencias ? null : $tblTecProp.bootstrapTable("getData");
    //var table = $tblTecProp.bootstrapTable("getData");
    //if (table.length > 0) { 
    //    tec.ListEquivalencias = !tec.FlagTieneEquivalencias ? null : $tblTecProp.bootstrapTable("getData");
    //}
    //else { 
    //    tec.ListEquivalencias = !tec.FlagTieneEquivalencias ? null : DATA_EQUIVALENCIA;
    //} 
    tec.ListEquivalenciasEliminar = LIST_EQUIVALENCIA.filter(function (item) {
        return !DATA_EQUIVALENCIA.includes(item);
    });

    return tec;
}

function guardarAddOrEditTecSTD() {
    let frmValido;
    let tecId;
    let tecValido = true;
    let tecModifica = false;
    if (TIPO_SAVE != 0) {
        switch (TIPO_SAVE) {
            case ACCESO_DIRECTO.PRODUCTO:
                frmValido = _validar([document.getElementById('txtFabricanteTecnologia'), document.getElementById('txtFabricanteTecnologia'), document.getElementById('cbDominioIdProducto'), document.getElementById('cbSubDominioIdProducto'), document.getElementById('txtDescripcionProducto'),]);
                break;
            case ACCESO_DIRECTO.TECNOLOGIA:
                //Deprecado
                tecModifica = true;
                if ($("#cbEstadoTecnologiaIdTecnologia").val() == 2) {
                    tecId = ($("#hdnTecReemplazo").val() === "") ? 0 : parseInt($("#hdnTecReemplazo").val());
                    if (tecId > 0) {
                        tecValido = ValidarTecReemplazo(tecId);
                        if (tecValido) {
                            frmValido = _validar([document.getElementById('txtDescripcionTecnologia'), document.getElementById('cbTipoTecnologiaIdTecnologia'), document.getElementById('cbAutomatizacionImplementadaIdTecnologia'), document.getElementById('txtFechaDeprecado'), document.getElementById('txtTecReemplazo')]);
                        }
                    }
                    else {
                        frmValido = _validar([document.getElementById('txtDescripcionTecnologia'), document.getElementById('cbTipoTecnologiaIdTecnologia'), document.getElementById('cbAutomatizacionImplementadaIdTecnologia')]);
                    }
                }
                else {
                    frmValido = _validar([document.getElementById('txtDescripcionTecnologia'), document.getElementById('cbTipoTecnologiaIdTecnologia'), document.getElementById('cbAutomatizacionImplementadaIdTecnologia')]);
                }
                break;
            case ACCESO_DIRECTO.CICLOVIDA:
                if (!$("#chkFlagFechaFinSoporte").prop("checked")) {
                    frmValido = _validar([document.getElementById('cbSustentoMotivoFechaFinSoporteTecnologia'), document.getElementById('txtSustentoUrlFechaFinSoporteTecnologia'),]);
                } else {
                    if (parseInt($("#cbFuenteTecnologia").val()) === 3) {
                        frmValido = _validar([document.getElementById('txtFechaFinExtendidaTecnologia'), document.getElementById('txtFechaFinSoporteTecnologia'), document.getElementById('txtFechaFinInternaTecnologia'),]);
                    } else {
                        frmValido = true;
                    }
                }
                break;
            case ACCESO_DIRECTO.RESPONSABILIDADES:
                frmValido = _validar([document.getElementById('txtTribuCoeDisplayNameProducto')]);
                frmValido = (_validar([document.getElementById('cbSquadIdProducto')])) && frmValido;
                break;
        }
    }

    if (frmValido) {
        //Obsoleto
        if (tecModifica) {
            if (ID_ESTADO_TEC_INICIAL != 3 && $("#cbEstadoTecnologiaIdTecnologia").val() == 3) {
                toastr.error('No está permitido modificar a estado Obsoleto', TITULO_MENSAJE);
            }
            else if (!ValidarEstados($("#cbTipoTecnologiaIdTecnologia").val(), $("#cbEstadoTecnologiaIdTecnologia").val())) {
                toastr.error('No está permitido la composición del Estado de Estandarización y Estado de Tecnología seleccionados', TITULO_MENSAJE);
            }
            else {
                let flag = VerificarDiferenciaDeDatos();
                if (flag) {
                    if (TIPO_SAVE == ACCESO_DIRECTO.PRODUCTO || TIPO_SAVE == ACCESO_DIRECTO.RESPONSABILIDADES)
                        verTecnologiasProducto(true);
                    else
                        InsertarTecnologia();
                }
                else {
                    toastr.warning("No hay información actualizada.", "Advertencia");
                }
            }
        }
        else {
            let flag = VerificarDiferenciaDeDatos();
            if (flag) {
                if (TIPO_SAVE == ACCESO_DIRECTO.PRODUCTO || TIPO_SAVE == ACCESO_DIRECTO.RESPONSABILIDADES)
                    verTecnologiasProducto(true);
                else
                    InsertarTecnologia();
            }
            else {
                toastr.warning("No hay información actualizada.", "Advertencia");
            }
        }
    } else {
        if (tecModifica) {
            //Obsoleto
            if (ID_ESTADO_TEC_INICIAL != 3 && $("#cbEstadoTecnologiaIdTecnologia").val() == 3) {
                toastr.error('No está permitido modificar a estado Obsoleto', TITULO_MENSAJE);
            }
            else if (!ValidarEstados($("#cbTipoTecnologiaIdTecnologia").val(), $("#cbEstadoTecnologiaIdTecnologia").val())) {
                toastr.error('No está permitido la composición del Estado de Estandarización y Estado de Tecnología seleccionados', TITULO_MENSAJE);
            }
            else if (!tecValido) {
                toastr.error('La tecnología de reemplazo no es FULL-Vigente o FULL-Restringido', TITULO_MENSAJE);
            }
            else {
                toastr.error('Faltan completar campos', TITULO_MENSAJE);
            }
        }
        else {
            toastr.error('Faltan completar campos', TITULO_MENSAJE);
        }
    }
}

function InsertarTecnologia() {

    let tec = ObtenerDataFormulario();

    bootbox.confirm({
        title: TITULO_MENSAJE_SOL,
        message: MENSAJE_SOL,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

                $.ajax({
                    url: URL_API_VISTA + "/EnviarSolicitudAprobacionTecnologia",
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(tec),
                    dataType: "json",
                    success: function (result) {
                        var data = result;

                        if (data > 0) {
                            let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
                            if ((archivoId === 0 && $("#txtCasoUsoArchivoTecnologia").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                                //UploadFile($("#flCasoUsoArchivoTecnologia"), CODIGO_INTERNO, data, archivoId);
                            }
                            toastr.success(data == 2 ? "La solicitud se registró correctamente." : "Se actualizo correctamente.", TITULO_MENSAJE);
                        }
                    },
                    complete: function () {
                        $("#btnRegTecSTD").button("reset");
                        waitingDialog.hide();
                        mdAddOrEditTec(false);
                        $(COMBO_SELECTED).val("-1");
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });

            }
        }
    });

    


}

function modificarProducto() {

    let parametros = ObtenerDataFormulario();

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    $.ajax({
        url: URL_API_VISTA + "/EnviarSolicitudAprobacionProducto",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(parametros),
        dataType: "json",
        success: function (result) {
            var data = result;
            if (data > 0) {
                toastr.success(data == 2 ? "La solicitud se registró correctamente." : "Se actualizo correctamente.", TITULO_MENSAJE);
            }
        },
        complete: function () {
            $("#btnRegTecSTD").button("reset");
            MdTecnologiasByProducto(false)
            waitingDialog.hide();
            mdAddOrEditTec(false);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function obtenerFamiliaById(FamiliaId) {
    $.ajax({
        url: urlApiFam + "/" + FamiliaId,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        dataType: "json",
        success: function (result) {
            $("#cbExisTec").val(result.Existencia);
            $("#cbFacAcTec").val(result.Facilidad);
            $("#cbRiesgTec").val(result.Riesgo);
            $("#txtVulTec").val(result.Vulnerabilidad);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function getFlagEstandar(id) {
    $.ajax({
        url: urlApiTipo + "/ObtenerFlagEstandar/" + id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            var data = result;
            $("#hdFlagEstandarTec").val(data);
        },
        complete: function () {

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}


function FlagEquivalencias_Change() {
    let flagEquivalencias = $("#chkFlagEquivalencias").prop("checked");
    $("#Equivalencias_Si").addClass("hidden");
    $("#Equivalencias_No").addClass("hidden");
    MostrarCampoObligatorio("#cbMotivoIdTecnologia", ".form-group", !flagEquivalencias);
    if (!flagEquivalencias) { 
        $("#Equivalencias_No").removeClass("hidden");
        $("#cbMotivoIdTecnologia").val("-1");
    } else {
        $("#txtNomTecEq").val(""); 
        $tblTecProp.bootstrapTable("destroy");
        $tblTecProp.bootstrapTable({ data: [] });
        $("#Equivalencias_Si").removeClass("hidden");
    }
    $("#cbMotivoIdTecnologia").prop("disabled", flagEquivalencias);
    $("#txtNomTecEq").prop("readonly", !flagEquivalencias);
    
}

function FlagTextMotivoDesactivacion() { 
    let motivoEliminacionText = $("#cbMotivoEliminacion").find('option:selected').text();
    let flag = true;
    if (motivoEliminacionText == "Otros") {  
        $("#txtAreaMotivoDes").css("display", "block"); 
    }
    else { 
        $("#txtAreaMotivoDes").css("display", "none");
        $("#txtMotivoDesactivacion").val("");
    }
}


function FlagFechaFinSoporte_Change() {
    let flagFechaFinSoporte = $("#chkFlagFechaFinSoporte").prop("checked");
    //alert(flagFechaFinSoporte);
    $("#FinSoporte_Si").addClass("hidden");
    $("#FinSoporte_No").addClass("hidden");
    MostrarCampoObligatorio("#cbSustentoMotivoFechaFinSoporteTecnologia", ".form-group", !flagFechaFinSoporte);
    MostrarCampoObligatorio("#txtSustentoUrlFechaFinSoporteTecnologia", ".form-group", !flagFechaFinSoporte);
    if (!flagFechaFinSoporte) {
        $("#cbFuenteTecnologia").val(-1);
        $("#cbFechaCalculosTecnologia").val(-1);
        $("#txtFechaFinExtendidaTecnologia").val("");
        $("#txtFechaFinSoporteTecnologia").val("");
        $("#txtFechaFinInternaTecnologia").val("");
        //$("#cbTipoFechaInternaTecnologia").val(-1);
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
    //$("#cbTipoFechaInternaTecnologia").prop("disabled", !flagFechaFinSoporte)
    $("#txtComentariosFechaFinSoporteTecnologia").prop("readonly", !flagFechaFinSoporte);
    $("#cbFuenteTecnologia").trigger("change");
}

function cbFuente_Change() {
    let fuenteId = $("#cbFuenteTecnologia").val();
    let readonly = fuenteId != 3;
    $("#txtFechaFinExtendidaTecnologia, #txtFechaFinSoporteTecnologia, #txtFechaFinInternaTecnologia").attr("readonly", readonly);
    
    if (readonly) $("#txtFechaFinExtendidaTecnologia, #txtFechaFinSoporteTecnologia, #txtFechaFinInternaTecnologia").val("");
    
}

function FlagFecSop_Change() {
    var flagFecSop = $(this).prop("checked");
    LimpiarValidateErrores($("#frmCicloVida"));

    if (flagFecSop)
        $("#FinSoporte").removeClass("tec");
    else
        $("#FinSoporte").addClass("tec");
}

function FlagApp_Change() {
    var flagApp = $(this).prop("checked");
    LimpiarValidateErrores($("#frmTecnologia"));
    if (flagApp)
        $("#AppContainer").removeClass("tec");
    else
        $("#AppContainer").addClass("tec");
}

function getSubdominiosByDom(_domId) {
    var domId = _domId;
    var data = "";
    var subTags = [];
    $.ajax({
        url: URL_API_VISTA + "/Subdominios/" + domId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            data = result;
            $.each(data, function (key, val) {
                var item = {};
                item.Id = val.Id;
                item.Nombre = val.Nombre;
                item.value = val.Nombre;
                subTags.push(item);
            });
            DATA_SUBDOMINIO = subTags;
        },
        complete: function () {
            autocompletarSubdominios(subTags, $('#txtSubTec'), $("#hIdSubTec"), $(".subtecContainer"));
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function autocompletarSubdominios(itemsX, inputX, inputHX, containerX) {
    //var $searchBox = inputX;
    var $inputX = inputX;
    var $inputHX = inputHX;
    var $containerX = containerX;
    $inputX.autocomplete({
        appendTo: $containerX,
        minLength: 0,
        source: itemsX,
        focus: function (event, ui) {
            //$inputX.val(ui.item.label);
            $inputX.val(ui.item.Nombre);
            return false;
        },
        select: function (event, ui) {
            //$inputHX.val(ui.item.value);
            //$inputX.val(ui.item.label);
            $inputHX.val(ui.item.Id);
            $inputX.val(ui.item.Nombre);
            getMatriculaDueno(ui.item.Id);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Nombre + "</font></a>")
            .appendTo(ul);
    };
}

function getMatriculaDueno(id) {
    $.ajax({
        url: urlApiSubdom + "/ObtenerMatricula/" + id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            var data = result;
            $("#txtDueTec").val(data);
        },
        complete: function () {

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function validarAddOrEditFormTec() {

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

    $.validator.addMethod("requiredSelectProductoId", function (value, element) {
        let validar = $("#chkFlagNuevoProducto").prop("checked");
        if (validar == false) return true;
        let valueId = $("#hdProductoIdTecnologia").val();
        return valueId == null || valueId == '' || valueId == '-1';
    });

    $.validator.addMethod("requiredSelectProductoIdNuevo", function (value, element) {
        let validar = $("#chkFlagNuevoProducto").prop("checked");
        if (validar == true) return true;
        let valueId = $("#hdProductoIdTecnologia").val();
        return valueId != null && valueId != '' && valueId != '-1';
    });

    $.validator.addMethod("requiredSelectFromNuevoProducto", function (value, element) {
        let validar = $("#chkFlagNuevoProducto").prop("checked");
        if (validar == false) return true;

        return value != null && value != '' && value != '-1';
    });

    $.validator.addMethod("requiredSinEspaciosFromNuevoProducto", function (value, element) {
        let validar = $("#chkFlagNuevoProducto").prop("checked");
        if (validar == false) return true;

        return value != null && value != '';
    });

    $.validator.addMethod("validarCodigoTribuCoeFromNuevoProducto", function (value, element) {
        let validar = $("#chkFlagNuevoProducto").prop("checked");
        if (validar == false) return true;

        let apps = $tblAplicaciones.bootstrapTable('getData');

        let estado = true;
        estado = ($.trim($("#hdTribuCoeIdProducto").val()) != "" && $.trim($("#hdTribuCoeIdProducto").val()) != "0") || (apps.length > 0);
        return estado;
    });

    $.validator.addMethod("validarCodigoSquadFromNuevoProducto", function (value, element) {
        
        let estado = true;
        estado = ($.trim($("#cbSquadIdProducto").val()) != "" && $.trim($("#cbSquadIdProducto").val()) != "-1");
        return estado;
    });

    $.validator.addMethod("matriculaExpertoDuplicada", function (value, element) {
        let data = $tableApExp.bootstrapTable("getData");
        let idTipoExperto = $("#hdTipoExperto").val();
        let matriculaExperto = $("#hdMatriculaResponsablePrincipal").val();

        let existeAplicacionEnLista = data.some(x => x.ProductoManagerId == idTipoExperto && x.ManagerMatricula == matriculaExperto);

        return !existeAplicacionEnLista;
    });

    $.validator.addMethod("requiredExperto", function (value, element) {
        let expertoId = $("#hdTipoExperto").val();
        //alert(expertoId);
        let aplicacionSeleccionada = expertoId != '-1';

        return aplicacionSeleccionada;
   });

    $.validator.addMethod("requiredMinAplicacion", function (value, element) {
        let estadoTecnologiaId = $("#cbEstadoTecnologiaIdTecnologia").val();
        let validar = (estadoTecnologiaId == 4);
        if (!validar) return !validar;
        
        let minRegistro = $tblAplicaciones.bootstrapTable('getData');
        let estado = ($.trim($("#hdTribuCoeIdProducto").val()) != "" && $.trim($("#hdTribuCoeIdProducto").val()) != "0") || (minRegistro.length > 0);

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

    $.validator.addMethod("valueNotSelect", function (value, element, arg) {
        return arg !== value;
    }, "Debe selecionar un valor.");

    $.validator.addMethod("valueNotNull", function (value, element) {
        return value != null && value != '';
    }, "Debe ingresar un valor.");

    $("#frmTecnologia").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbTipoTecnologiaIdTecnologia: { valueNotSelect: "-1"},
            txtDescripcionTecnologia: { valueNotNull: true },
            cbAutomatizacionImplementadaIdTecnologia: { valueNotSelect: "-1", },
            txtAplicacionTecnologia: { requiredAplicacion: true, aplicacionDuplicada: true },
            msjValidTblAplicacion: {  requiredMinAplicacion: true, },
        },
        messages: {
            cbTipoTecnologiaIdTecnologia: { valueNotSelect: String.Format("Debes seleccionar {0}.", "un tipo de tecnología"), },
            txtDescripcionTecnologia: { valueNotNull: String.Format("Debes ingresar {0}.", "una descripción"), },
            cbAutomatizacionImplementadaIdTecnologia: { valueNotSelect: String.Format("Debes seleccionar {0}.", "una opción"), },
            txtAplicacionTecnologia: { requiredAplicacion: String.Format("Debes seleccionar {0}.", "una aplicación"), aplicacionDuplicada: String.Format("La aplicación seleccionada {0}.", "ya se encuentra agregada") },
            msjValidTblAplicacion: { requiredMinAplicacion: String.Format("Debes agregar {0}.", "una aplicación como mínimo"), },
        }
    });
    $("#frmCicloVida").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtFechaFinExtendidaTecnologia: { fecha_tecnologia: true, },
            txtFechaFinSoporteTecnologia: { fecha_tecnologia: true, },
            txtFechaFinInternaTecnologia: { fecha_tecnologia: true, },
            cbSustentoMotivoFechaFinSoporteTecnologia: { fecha_tecnologia_no: true, },
            txtSustentoUrlFechaFinSoporteTecnologia: {  fecha_tecnologia_no: true, },
        },
        messages: {
            txtFechaFinExtendidaTecnologia: {
                fecha_tecnologia: String.Format("Debes seleccionar {0}.", "una fecha fin extendida de la tecnología"),
            },
            txtFechaFinSoporteTecnologia: {
                fecha_tecnologia: String.Format("Debes seleccionar {0}.", "una fecha fin soporte de la tecnología"),
            },
            txtFechaFinInternaTecnologia: {
                fecha_tecnologia: String.Format("Debes seleccionar {0}.", "una fecha fin interna de la tecnología"),
            },
            cbSustentoMotivoFechaFinSoporteTecnologia: {
                fecha_tecnologia_no: String.Format("Debes ingresar {0}", "un motivo"),
            },
            txtSustentoUrlFechaFinSoporteTecnologia: {
                fecha_tecnologia_no: String.Format("Debes ingresar {0}", "un url"),
            },
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtFechaLanzamientoTecnologia" || element.attr('name') === "txtFechaFinExtendidaTecnologia"
                || element.attr('name') === "txtFechaFinSoporteTecnologia" || element.attr('name') === "txtFechaFinInternaTecnologia") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }

            //let elclosed = element.closest(".form-group");
            //if (elclosed.length > 0) elclosed.find("label .text-danger").html("(*)");
        }
    });
    $("#frmResponsabilidades").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtTribuCoeDisplayNameProducto: { validarCodigoTribuCoeFromNuevoProducto: true },
            cbSquadIdProducto: { validarCodigoSquadFromNuevoProducto: true },
            txtMatriculaExperto: { requiredExperto: true, matriculaExpertoDuplicada: true, },
        },
        messages: {
            txtTribuCoeDisplayNameProducto: { validarCodigoTribuCoeFromNuevoProducto: String.Format("Debe seleccionar {0}.", "el Tribu/COE") },
            cbSquadIdProducto: { validarCodigoSquadFromNuevoProducto: String.Format("Debe seleccionar {0}.", "un Squad/Equipo") },
            txtMatriculaExperto: {
                requiredExperto: String.Format("Debes seleccionar {0}.", "un tipo de experto"),
                matriculaExpertoDuplicada: String.Format("El experto seleccionado {0}.", "ya se encuentra agregado")
            },
        },
    });
    $("#frmProducto").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtFabricanteTecnologia: { requiredSinEspaciosFromNuevoProducto: true, },
            txtDescripcionProducto: { valueNotNull: true, },
            cbDominioIdProducto: { requiredSelectFromNuevoProducto: true },
            cbSubDominioIdProducto: { requiredSelectFromNuevoProducto: true },
            //cbTipoProductoIdProducto: { requiredSelectFromNuevoProducto: true },
            txtNombreProducto: { requiredSinEspacios: true, },
        },
        messages: {
            txtFabricanteTecnologia: { requiredSinEspaciosFromNuevoProducto: 'Debe ingresar un fabricante.' },
            txtDescripcionProducto: { valueNotNull: 'Debe ingresar una descripción.' },
            cbDominioIdProducto: { requiredSelectFromNuevoProducto: 'Debe seleccionar un dominio.' },
            cbSubDominioIdProducto: { requiredSelectFromNuevoProducto: 'Debe seleccionar un subdominio.' },
            //cbTipoProductoIdProducto: { requiredSelectFromNuevoProducto: 'Debe seleccionar un tipo de producto.' },
            txtNombreProducto: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "un nombre"),
            },
        },
    });
}

function RequiereCodigoTecnologia() {
    let estado = false;
    let TipoId = $("#cbTipTec").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: urlApiTipo + '/ObtenerFlagEstandar/' + TipoId,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

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

function validarFormCambiarEstado() {

    $.validator.addMethod("existeEstado", function (value, element) {
        let estadoActual = $("#hEstTec").val();
        let estadoNuevo = $("#cbNueEstTec option:selected").text();
        if (estadoActual !== estadoNuevo)
            return true;
        else
            return false;
    });

    $("#formCambiarEstadoTec").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        onfocusout: false,
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbNueEstTec: {
                requiredSelect: true,
                existeEstado: true
            }
        },
        messages: {
            cbNueEstTec: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el estado"),
                existeEstado: "Estado ya se encuentra registrado."
            }
        }
    });
}

function validarFormEquivalencias() {

    $.validator.addMethod("validarRegistrado", function (value, element) {
        let estado = ValidarEquivalencia();
        return estado;
    });

    $.validator.addMethod("requiredEquivalenciaTexto", function (value, element) {
        let equivalenciaTexto = parseInt($("#hdEquivalenciaTexto").val());
        let checked = $("#chkFlagEquivalencias").prop("checked");
        let aplicacionSeleccionada = true;

        if (checked) {
            if (equivalenciaTexto < 1) {
                aplicacionSeleccionada = false;
            } 
            //let aplicacionSeleccionada = equivalenciaTexto >= 1;
        }
        
        return aplicacionSeleccionada;
    });

    $.validator.addMethod("duplicadoEquivalenciaTexto", function (value, element) {
        let data = $tblTecProp.bootstrapTable("getData");
        let textoEquivalencia = $("#txtNomTecEq").val();
        let existeEquivalenciaLista = data.some(x => x.Nombre == textoEquivalencia);

        return !existeEquivalenciaLista;
    });

    $.validator.addMethod("controlEquivalencia", function (value, element) {
        let control = parseInt($("#hdEquivalenciaControl").val());
        let checked = $("#chkFlagEquivalencias").prop("checked");
        let aplicacionSeleccionada = false;

        if (checked) {
            let listaRemovidos = LIST_EQUIVALENCIA.filter(function (item) {
                return !DATA_EQUIVALENCIA.includes(item);
            });

            if (control >= 1 || listaRemovidos.length >= 1) {
                aplicacionSeleccionada = true;
            }
        } else
        {
            aplicacionSeleccionada = true;
        }

        return aplicacionSeleccionada;
    });

    $.validator.addMethod("validarSinMotivo", function (value, element) {
        let cbMotivoId = $("#cbMotivoIdTecnologia").val();
        let checked = $("#chkFlagEquivalencias").prop("checked");
        let flagSinEquivalencia = true;
        if (!checked) {
            if (cbMotivoId == "-1") {
                flagSinEquivalencia = false;
            }   
        }

        return flagSinEquivalencia;
    });

    $.validator.addMethod("validarSinMotivoEquivalencias", function (value, element) {
        let checked = $("#chkFlagEquivalencias").prop("checked");
        let data = $tblTecEq.bootstrapTable("getData");
        let flagSinEquivalencia = true;
        if (!checked) {
            if (data.length > 0) {
                flagSinEquivalencia = false;
            }
        }

        return flagSinEquivalencia;
    });

    $("#formTecByArq").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomTecEq: {
                requiredEquivalenciaTexto: true,
                validarRegistrado: true,
                controlEquivalencia: true,
                duplicadoEquivalenciaTexto: true
            },
            cbMotivoIdTecnologia: {
                validarSinMotivo: true,
                validarSinMotivoEquivalencias: true
            }
        },
        messages: {
            txtNomTecEq: {
                requiredEquivalenciaTexto: String.Format("Debe ingresar {0}.", "una equivalencia"),
                validarRegistrado: "La equivalencia ya se encuentra registrada.",
                controlEquivalencia: "Debe agregar al menos una equivalencia propuesta o retirar algunas.",
                duplicadoEquivalenciaTexto: String.Format("La tecnología digitada {0}.", "ya se encuentra agregada")
            },
            cbMotivoIdTecnologia: {
                validarSinMotivo: "Debe seleccionar un motivo.",
                validarSinMotivoEquivalencias: "Debe eliminar todas las equivalencias registradas."
            }
        }
    }); 
}

function validarFormDesactivacion() { 
    let motivoEliminacionText = $("#cbMotivoEliminacion").find('option:selected').text();

    $.validator.addMethod("validarSinMotivoEliminacion", function (value, element) {
        let motivoEliminacion = $("#cbMotivoEliminacion").val();
        let flag_motivo_desactivacion_cb = true;
        if (motivoEliminacion == "-1") {
            flag_motivo_desactivacion_cb = false;
        } else { 
            motivoEliminacionText = $("#cbMotivoEliminacion").find('option:selected').text();
        } 
        return flag_motivo_desactivacion_cb;
    });

    $.validator.addMethod("validarTextSinMotivoEliminacion", function (value, element) {
        let motivoDesactivacionStr = value.length;
        let flag_motivo_desactivacion = true;
        if (motivoEliminacionText == "Otros") {
            if (motivoDesactivacionStr == 0) {
                flag_motivo_desactivacion = false;
            }
        }

        return flag_motivo_desactivacion;
    });
     
    $("#formTecDesactivar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbMotivoEliminacion: {
                validarSinMotivoEliminacion: true
            },
            txtMotivoDesactivacion: { 
                validarTextSinMotivoEliminacion: true
            }
        },
        messages: {
            cbMotivoEliminacion: {
                validarSinMotivoEliminacion: "Debe seleccionar un motivo de eliminación.",
            },
            txtMotivoDesactivacion: {
                validarTextSinMotivoEliminacion: String.Format("Debe ingresar {0} de la solicitud.", "el motivo del rechazo")
            }
        }
    });
}

function validarFormEquivalenciasTec() {

    $.validator.addMethod("validarRegistradoTec", function (value, element) {
        let data = $("#tblEqTec").bootstrapTable("getData") || [];
        let estado = !data.some(x => x.Nombre == value);

        return estado;
    });

    $("#formEqTec").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomEqTec: {
                requiredSinEspacios: true,
                validarRegistradoTec: true
            }
        },
        messages: {
            txtNomEqTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "una equivalencia"),
                validarRegistradoTec: "La equivalencia ya se encuentra registrada"
            }
        }
    });
}

function mdAddOrEditTec(EstadoMd) {
    if (EstadoMd)
        $("#mdAddOrEditTec").modal(opcionesModal);
    else
        $("#mdAddOrEditTec").modal('hide');
}

function limpiarMdAddOrEditTec() {
    LIST_APLICACION = [];
    LIST_EQUIVALENCIA = [];
    DATA_EQUIVALENCIA = [];
    $("#btnGuardarTec").button("reset");
    $("#hdTecnologiaId").val("");
    //$("#cbProductoIdTecnologia").val("-1");
    $("#txtProductoIdTecnologia").val("");
    $("#hdProductoIdTecnologia").val("");
    $("#chkFlagNuevoProducto").prop("checked", false).trigger("change");;
    $("#txtFabricanteProducto").val("");
    $("#txtNombreProducto").val("");
    $("#txtNombreProducto").val("");
    $("#cbDominioIdProducto").val("-1").trigger("change");
    $("#cbSubDominioIdProducto").val("-1");
    //$("#cbTipoProductoIdProducto").val("-1");
    $("#txtVersionTecnologia").val("");
    $("#txtClaveTecnologia").val("");
    $("#txtDescripcionTecnologia").val("");
    $("#txtDescripcionTecnologia").val("");
    $("#chkFlagMostrarSiteEstandares").prop("checked", false).trigger("change");
    //$("#cbFlagSiteEstandarTecnologia").val("-1");
    //$("#chkFlagEquivalencias").prop("checked", false).trigger("change");;
    //$("#cbMotivoIdTecnologia").val("-1");
    $("#cbTipoTecnologiaIdTecnologia").val("-1").trigger("change");
    $("#txtCodigoProductosTecnologia").val("");
    $("#cbAutomatizacionImplementadaIdTecnologia").val("-1");
    $("input[name='rbtRevisionSeguridadIdTecnologia']:first").prop("checked", true);
    $("#txtRevisionSeguridadDescripcionTecnologia").val("");
    $("#chkFlagFechaFinSoporte").prop("checked", true).trigger("change");
    $("#cbFuenteTecnologia").val("-1");
    $("#txtFechaCalculoTecnologia").val("");
    $("#txtFechaLanzamientoTecnologia").val("");
    $("#txtFechaFinExtendidaTecnologia").val("");
    $("#txtFechaFinSoporteTecnologia").val("");
    $("#txtFechaFinInternaTecnologia").val("");
    //$("#cbTipoFechaInternaTecnologia").val("-1");
    $("#cbSustentoMotivoFechaFinSoporteTecnologia").val("-1");
    $("#txtSustentoUrlFechaFinSoporteTecnologia").val("");
    $("input[name='rbtUrlConfluenceIdTecnologia']:first").prop("checked", true);
    $("#txtUrlConfluenceTecnologia").val("");
    $("#txtCasoUsoTecnologia").val("");
    $("#cbPlataformaAplicaIdTecnologia").val("-1");
    $("#cbCompatibilidadSOIdTecnologia").multiselect("clearSelection");
    $("#cbCompatibilidadCloudIdTecnologia").multiselect("clearSelection");
    // 03/03/2022 - jrodriguej
    $("#cbTipoCicloVidaIdProducto").val(-1);
    $("#chkFlagAplicacion").prop("checked", false);
    $("#chkFlagAplicacion").bootstrapToggle("off");
    $("#chkFlagAplicacion").trigger("change");
    $("#txtLineaBaseSeguridad").val("");
    /*("#hdId").val("");*/
    $("#ddlTipoExperto").val("-1");
    $tableApExp.bootstrapTable("destroy");
    $tableApExp.bootstrapTable({ data: [] });
    $("#txtMatriculaExperto").val("");
    //ObtenerCodigoSugerido();
    //$("#txtCodigoProductoManual").val(CODIGO_SUGERIDO);
    //$("#txtRequisitosHWSWTecnologia").val("");
    //$("#cbConocimientoIdTecnologia").val("-1");
    //$("#cbRiesgoObsolescenciaIdTecnologia").val("-1");
    //$("#cbFacilidadActualizacionIdTecnologia").val("-1");
    //$("#cbVulnerabilidadSeguridadTecnologia").val("-1");
    // Fin Tab 1

    $("#txtDominioTecnologia").val("");
    $("#txtSubDominioTecnologia").val("");
    $("#hdnSubDominioIdTecnologia").val("");
    $("#hdnRoadMapTecnologia").val("");
    $("#txtReferenciaTecnologia").val("");
    $("#txtPlanTransferenciaConocimientoTecnologia").val("");
    $("#txtEsquemaMonitoreoTecnologia").val("");
    $("#txtDefinicioEsquemaPatchMangementTecnologia").val("");
    //Fin Tab 2

    $("#hdOwnerMatriculaTecnologia").val("");
    //$("#txtEquipoAdministracionTecnologia").val("");
    $("#hdGrupoTicketRemedyIdProducto").val("");
    $("#hdArquitectoSeguridad").val("");
    $("#hdArquitectoTecnologia").val("");
    $("#txtEncargadoRenovacionContractualTecnologia").val("");
    $("#txtEsquemaLicenciamientoTec").val("");
    $("#txtCoordinacionSoporteEmpresarialTecnologia").val("");
    $("#txtEquipoAprovisionamientoTecnologia").val("");

    $("#txtFechaDeprecado").val("");
    $("#txtTecReemplazo").val("");

    ItemsRemoveAutId = [];
    $tblAutorizador.bootstrapTable('removeAll');

    ItemsRemoveTecArqId = [];
    $tblArquetipos.bootstrapTable('removeAll');

    ItemsRemoveAppId = [];
    $tblAplicaciones.bootstrapTable('removeAll');

    $("#txtCasoUsoArchivoTecnologia").val(TEXTO_SIN_ARCHIVO);
    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
}

function buscarTec() {
    listarTecSTD();
}

function getSubdominiosByDomCb(_domId, $cbSub) {
    var domId = _domId;

    $cbSub.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $.ajax({
        url: URL_API_VISTA + "/Subdominios/" + domId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            data = result;
            $cbSub.find("option:gt(0)").remove();

            $.each(data, function (i, item) {
                $cbSub.append($('<option>', {
                    value: item.Id,
                    text: item.Nombre
                }));
            });
        },
        complete: function () {
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function getSubdominiosByDomCbMultiple($cbSub) {
    //var domId = _domIds;
    let idsDominio = $.isArray($("#cbFilDom").val()) ? $("#cbFilDom").val() : [$("#cbFilDom").val()];

    if (idsDominio !== null) {
        $.ajax({
            url: URL_API_VISTA_DASH + "/ListarCombos/Dominio",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(idsDominio),
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        data = dataObject.Subdominio;
                        SetItemsMultiple(data, $cbSub, TEXTO_TODOS, TEXTO_TODOS, true);

                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function () {

            },
            async: true
        });
    }
}



function setItemsCb(cbx, ctrlx) {
    var $cb = cbx;

    $cb.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $.ajax({
        url: URL_API + ctrlx,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            var data = result;
            $cb.find("option:gt(0)").remove();

            $.each(data, function (i, item) {
                $cb.append($('<option>', {
                    value: item.Id,
                    text: item.Nombre
                }));
            });
        },
        complete: function () {

        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function listarTecSTD() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/ListadoProductosModificar",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        sortName: 'ProductoNombre',
        sortOrder: 'asc',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.prodId = $("#hdnProductoBusTec").val() == "" ? null : $("#hdnProductoBusTec").val();
            DATA_EXPORTAR.nombre = $.trim($("#txtBusTec").val());
            DATA_EXPORTAR.domIds = $.isArray($("#cbFilDom").val()) ? $("#cbFilDom").val() : [$("#cbFilDom").val()];// $("#cbFilDom").val();
            DATA_EXPORTAR.subdomIds = $.isArray($("#cbFilSub").val()) ? $("#cbFilSub").val() : [$("#cbFilSub").val()]; //$("#cbFilSub").val();
            DATA_EXPORTAR.codigo = $("#txtFilCodigo").val();
            DATA_EXPORTAR.tribuCoeStr = $("#txtFilTribuCoeStr").val();
            DATA_EXPORTAR.squadStr = $("#cbSquadIdSearch").val() == -1 ? "" : $("#cbSquadIdSearch option:selected").text();
            DATA_EXPORTAR.tipoTecIds = $.isArray($("#cbFilTipoTec").val()) ? $("#cbFilTipoTec").val() : [$("#cbFilTipoTec").val()]; //$("#cbFilTipoTec").val();
            DATA_EXPORTAR.estObsIds = $.isArray($("#cbFilEstObs").val()) ? $("#cbFilEstObs").val() : [$("#cbFilEstObs").val()];//$("#cbFilEstObs").val();
            DATA_EXPORTAR.flagActivo = FLAG_ACTIVO_TECNOLOGIA;
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
        },
        onLoadSuccess: function (data) {
            if (ID_TECNOLOGIA !== 0) {
                let editFromId = EDIT_TEC_FROM.NOMBRE;
                editarTecSTD(ID_TECNOLOGIA, ID_ESTADO_TECNOLOGIA, editFromId);
                ID_TECNOLOGIA = 0;
            }
        }
    });
}

function cambiarEstado(TecnologiaId) {
    if (!ExisteEquivalenciaTecnologia(TecnologiaId)) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
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
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        type: 'GET',
                        contentType: "application/json; charset=utf-8",
                        url: `${URL_API_VISTA}/CambiarEstado?Id=${TecnologiaId}`,
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("La actualización del registro procedió satisfactoriamente", TITULO_MENSAJE);
                                    listarTecSTD();
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
                            //$("#txtBusTec").val('');
                            //$("#cbFilDom").val(-1);
                            //$("#cbFilSub").val(-1);
                            waitingDialog.hide();
                        }
                    });
                } else {
                    //$(`#cbOpcTec${TecId}`).prop('checked', !estado);
                }
            }
        });
    } else {
        bootbox.alert({
            size: "sm",
            title: TITULO_MENSAJE_EQUIVALENCIA,
            message: "No es posible eliminar el registro ya que tiene equivalencias activas",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    }
}

function irDesactivarTecnologia(Id, NombreStr, EstadoTecnologiaStr, FlagActivo) {

    if (FlagActivo) {
        let flagEquivalencias = ExisteEquivalenciaTecnologia(Id);
        let flagRelaciones = ExisteRelacionTecnologia(Id);
        let flagInstancias = ExisteInstanciasTecnologia(Id);

        let msjeDesactivacion = "";
        let flagControl = false;

        if (flagEquivalencias) {
            msjeDesactivacion = msjeDesactivacion + "</br>No es posible eliminar la tecnología porque tiene equivalencias activas.";
            flagControl = true;
        }
        if (flagRelaciones) {
            msjeDesactivacion = msjeDesactivacion + "</br>No es posible eliminar la tecnología porque tiene relaciones activas.";
            flagControl = true;
        }
        if (flagInstancias) {
            msjeDesactivacion = msjeDesactivacion + "</br>No es posible eliminar la tecnología porque tiene instancias activas.";
            flagControl = true;
        }

        if (!flagControl) {
            //===============================
            if (EstadoTecnologiaStr === 'Aprobado') {
                $("#hdTecnologiaId").val(Id);
                $("#txtTecnologiaInfo2").val(NombreStr);
                $("#txtMotivoDesactivacion").val("");
                $("#cbMotivoEliminacion").val("-1");
                $("#txtAreaMotivoDes").css("display", "none");
                LimpiarValidateErrores($("#formTecDesactivar"));
                OpenCloseModal($("#mdTecnologiaDesactivar"), true);
            } else {
                bootbox.alert({
                    size: "sm",
                    title: TITULO_MENSAJE_DESACTIVACION,
                    message: String.Format("La tecnología se encuentra en estado {0}, no es posible continuar.", EstadoTecnologiaStr),
                    buttons: {
                        ok: {
                            label: 'Aceptar',
                            className: 'btn-primary'
                        }
                    }
                });
            }
            //===============================
        }
        else
        {
            $("#hdTecnologiaId").val(Id);
            $("#txtTecnologiaInfo3").val(NombreStr);
            /*$("#txtMotivoRestriccion").val(msjeDesactivacion);*/
            $("#txtMotivoRestriccion").html(msjeDesactivacion);
            OpenCloseModal($("#mdTecnologiasRestricciones"), true);
        }
        
    } else {
        MensajeRegistroInactivo(TITULO_MENSAJE_DESACTIVACION);
    }
}

function formatNombre(value, row, index) {

    let editFromId = ACCESO_DIRECTO.PRODUCTO;
    return `<a href="javascript:irAccesoDirecto(${row.Id}, '${value}', ${row.Activo}, '${editFromId}')" title="Editar">${value}</a>`;
}

function formatOpcSTD(value, row, index) {
    let style_color = row.Estado === ESTADO_TECNOLOGIA.APROBADO ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    //let estado = `<a href="javascript:cambiarEstado(${row.Id})" title="Desactivar tecnología"><i class="iconoVerde glyphicon glyphicon-${type_icon}"></i></a>`;
    let estado = `<a href='javascript: void (0)'  onclick='irDesactivarTecnologia(${row.Id}, "${row.ClaveTecnologia}", "${row.EstadoTecnologiaStr}", ${row.Activo})' title="Eliminar tecnología"><i class="iconoVerde glyphicon glyphicon-${type_icon}"></i></a>`;

    let equivalencia = `  <a href='javascript: void (0)' class="${style_color}" onclick='irEquivalencias(${row.Id}, "${row.ClaveTecnologia}", "${row.EstadoTecnologiaStr}", ${row.Activo})' title='Equivalencias'>` +
        `<span class="icon icon-list-ul"></span>` +
        `</a >`;

    let estadoTec = `  <a href='javascript: void (0)' class="${style_color}" onclick='irCambiarEstadoTec(${row.Id}, ${row.Estado}, "${row.EstadoTecnologiaStr}", ${row.Activo})' title='Cambiar estado aprobación'>` +
        `<span class="icon icon-rotate-right"></span>` +
        `</a >`;

    //return estado.concat(equivalencia).concat(migrarEquivalencia).concat(migrarInfoTec);
    return estado.concat(equivalencia);
    
}

function formatOpcSTDProd(value, row, index) {
    let style_color = row.Estado === ESTADO_TECNOLOGIA.APROBADO ? 'iconoVerde ' : "iconoRojo ";
    let editFromId = ACCESO_DIRECTO.RESPONSABILIDADES;
    let estado = `<a href="javascript:irAccesoDirecto(${row.Id}, '${row.ProductoNombre}', ${row.Activo}, '${editFromId}')" title="Editar Responsabilidades"><i class="glyphicon glyphicon-user"></i></a>`;
    return estado;

}

function formatAccesoDirecto(value, row, index) {

    let permiso = row.Estado === ESTADO_TECNOLOGIA.APROBADO ? "" : "disabled";

    let combo = ` <select id="cbAccesoDirecto${row.Id}" name="cbAccesoDirecto${row.Id}" onchange='irAccesoDirecto(${row.Id}, "${row.Nombre}", ${row.Estado}, 0, ${row.EstadoId})' class="form-control" ${permiso}>\
                    <option value = "-1"> -- Seleccione --</option>
                    <option value = "2">Datos de tecnología</option>
                    <option value = "3">Fechas ciclo de vida</option>
                  </select >`;

    let icono = "";

    return combo.concat(icono);
}

function MostrarModalCompleto() {
    $("#FinSoporte").show();
    $(".adBasico").show();
    $(".adRiesgo").show();
    $(".adCicloVida").show();
    $(".adClasificacion").show();
    $(".adResponsabilidad").show();
    $(".adFamilia").show();
    $(".ocultar").show();
    $(".footerModalTecnologia").show();

    $(".inputOpcional").hide();
}

function irAccesoDirecto(Id, NombreStr, EstadoTecnologiaId, tipo=0, EstadoId = 0) {
    let editFromId = EDIT_TEC_FROM.ACCESO_DIRECTO;
    COMBO_SELECTED = String.Format("#cbAccesoDirecto{0}", Id);
    let filtro = tipo != 0 ? tipo : $(COMBO_SELECTED).val();
    TIPO_SAVE = filtro; 
    //$("#chkFlagEstadoRestringido").prop("checked", false).trigger("change");
    if (filtro !== "-1") {
        switch (filtro) {
            case ACCESO_DIRECTO.PRODUCTO:
                editarTecSTD(Id, EstadoTecnologiaId, filtro);
                $(".ocultar").hide();
                $(".form-control").addClass("ignore");
                $(".adProducto").removeClass("ignore");
                $(".adProducto").show();
                $(".adTecnologia").hide();
                $(".adCicloVida").hide();
                $(".adResponsabilidad").hide();
                $("#FinSoporte").hide();
                $("#titleFormTec").html("Editar Producto para Aprobación");
                break;
            case ACCESO_DIRECTO.TECNOLOGIA:
                editarTecSTD(Id, EstadoTecnologiaId, filtro);
                $(".ocultar").hide();
                $(".form-control").addClass("ignore");
                $(".adTecnologia").removeClass("ignore");
                $(".adProducto").hide();
                $(".adTecnologia").show();
                $(".adCicloVida").hide();
                $(".adResponsabilidad").hide();
                $("#FinSoporte").hide();
                ESTADO_ID_TECNOLOGIA = EstadoId;
                /*
                if (EstadoId == 1 && (userCurrent.Perfil.includes('E195_Administrador') || userCurrent.Perfil.includes('E195_GestorTecnologia')))
                    $(".adTecnologiaFlagRestringido").show();
                else
                    $(".adTecnologiaFlagRestringido").hide();
                */
                if (EstadoId == 2 || EstadoId == 3) {
                    $("#cbEstadoTecnologiaIdTecnologia").prop("disabled", true);
                }
                else
                    $("#cbEstadoTecnologiaIdTecnologia").prop("disabled", false);

                $("#titleFormTec").html("Editar Tecnología para Aprobación");
                break;
            case ACCESO_DIRECTO.CICLOVIDA:
                editarTecSTD(Id, EstadoTecnologiaId, filtro);
                $(".ocultar").hide();
                $(".form-control").addClass("ignore");
                $(".adCicloVida").removeClass("ignore");
                $(".adProducto").hide();
                $(".adTecnologia").hide();
                $(".adCicloVida").show();
                $(".adResponsabilidad").hide();
                $("#FinSoporte").show();
                $("#titleFormTec").html("Editar Ciclo de Vida para Aprobación");
                if ($("#cbFechaCalculosTecnologia").val() !== "-1") {
                    $("#cbFechaCalculosTecnologia").trigger("change");
                }
                break;
            case ACCESO_DIRECTO.RESPONSABILIDADES:

                editarTecSTD(Id, EstadoTecnologiaId, filtro);
                $(".ocultar").hide();
                $(".form-control").addClass("ignore");
                $(".adResponsabilidad").removeClass("ignore");
                $(".adProducto").hide();
                $(".adTecnologia").hide();
                $(".adCicloVida").hide();
                $("#frmResponsabilidades").validate().resetForm();
                $(".adResponsabilidad").show();
                $("#FinSoporte").hide();
                $("#titleFormTec").html("Editar Responsables para Aprobación");
                break;
        }
    }
}


function editarTecSTD(TecId, estadoId, editFromId) { 
    $("#hdEditFrom").val(editFromId);
    MostrarModalCompleto();

    if (estadoId === ESTADO_TECNOLOGIA.REGISTRADO) {
        $(".btnRegTecSTD").show();
        $(".btnConTec").show();

        $(".btnAprTec").hide();
        $(".btnObsTec").hide();
        $(".btnGuardarTec").hide();

        $(".cbAprob").addClass("ignore");
        $(".tabRegSTD").addClass("tec");
        //$(".tabRegSTD").addClass("tec");
    }

    if (estadoId === ESTADO_TECNOLOGIA.PROCESOREVISION) {
        $(".btnAprTec").show();
        $(".btnObsTec").show();

        $(".btnConTec").hide();
        $(".btnGuardarTec").hide();

        $(".cbAprob").removeClass("ignore");
        $(".tabRegSTD").removeClass("tec");
    }

    if (estadoId === ESTADO_TECNOLOGIA.APROBADO) {
        $(".btnAprTec").hide();
        $(".btnObsTec").hide();

        $(".btnConTec").hide();

        $(".btnGuardarTec").show();

        //$(".cbAprob").addClass("ignore");
        //$(".tabRegSTD").addClass("tec");
        $(".cbAprob").removeClass("ignore");
        $(".tabRegSTD").removeClass("tec");
    }

    if (estadoId === ESTADO_TECNOLOGIA.OBSERVADO) {
        $(".btnAprTec").hide();
        $(".btnObsTec").hide();

        $(".btnGuardarTec").hide();

        $(".btnConTec").show();

        $(".cbAprob").addClass("ignore");
        $(".tabRegSTD").addClass("tec");
    }

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    ItemsRemoveAutId = [];
    if (editFromId == ACCESO_DIRECTO.PRODUCTO || editFromId == ACCESO_DIRECTO.RESPONSABILIDADES) {

        $(".btnAprTec").hide();
        $(".btnObsTec").hide();

        $(".btnGuardarTec").show();
        $(".btnConTec").hide();

        $(".cbAprob").removeClass("ignore");
        $(".tabRegSTD").removeClass("tec");

        $.ajax({
            url: URL_API_VISTA + "/DatosProducto/" + TecId + `?withAutorizadores=true&withArquetipos=true&withAplicaciones=true&withEquivalencias=true`,
            type: "GET",
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (result) {
                waitingDialog.hide();
                mdAddOrEditTec(true);

                var domain, subdomain, product_type, esqLicenciamientoId;

                if (result.DominioId != "")
                    domain = getValidListData('domain', result.DominioId);
                else
                    domain = "-1";

                if (result.SubdominioId != "")
                    subdomain = getValidListData('subdomain', result.SubDominioId);
                else
                    subdomain = "-1";

                if (result.TipoProductoId != "")
                    product_type = getValidListData('productType', result.TipoProductoId);
                else
                    product_type = "-1";

                if (result.EsqLicenciamientoId != "")
                    esqLicenciamientoId = getValidListData('licensingScheme', result.EsquemaLicenciamientoSuscripcionId);
                else
                    esqLicenciamientoId = "-1";

                // ====== General
                $("#hdProductoIdTecnologia").val(result.Id);
                $("#txtCodigoProductosTecnologia").val(result.Codigo);
                $("#txtFabricanteTecnologia").val(result.Fabricante);
                $("#txtDescripcionProducto").val(result.Descripcion);
                $("#txtNombreProducto").val(result.Nombre);

                $("#cbDominioIdProducto").val(domain).trigger("change"); //Dominio  

                if (domain != "-1") { //SubDominio 
                    $("#cbSubDominioIdProducto").val(subdomain);
                } else {
                    $("#cbSubDominioIdProducto").val("-1");
                }

                //$("#cbTipoProductoIdProducto").val(product_type).trigger("change"); //TipoProductoIdProducto
                $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val(esqLicenciamientoId); //EsquemaLicenciamientoSuscripcionIdTecnologia
                $("#cbTipoCicloVidaIdProducto").val(result.TipoCicloVidaId == null ? -1 : result.TipoCicloVidaId);


                // === Tab 2 - Responsabilidades
                $("#txtTribuCoeDisplayNameProducto").val(result.TribuCoeDisplayName);
                $("#hdTribuCoeIdProducto").val(result.TribuCoeId);
                // Responsable de Unidad
                $("#txtResponsableTribuCOE").val(result.TribuResponsableNombre == "" || result.TribuResponsableNombre == null ? $("#hdResponsableNameTribuCOE").val() : result.TribuResponsableNombre);
                $("#hdResponsableIdTribuCOE").val(result.TribuResponsableMatricula);
                // Squad
                cbTribuCoeIdProducto_Change(() => {
                    $("#cbSquadIdProducto").val(result.SquadId);
                });
                $("#cbSquadIdProducto").val(result.SquadId);
                cbSquadIdProducto_Change();
                // Responsable de Squad
                $("#txtOwnerDisplayNameTecnologia").val(result.OwnerDisplayName);
                $("#hdOwnerIdTecnologia").val(result.OwnerId);
                $("#hdOwnerMatriculaTecnologia").val(result.OwnerMatricula);
                // Conformidad de Arquitecto de Seguridad

                $("#txtEquipoAprovisionamientoTecnologia").val(result.EquipoAprovisionamiento);
                $("#hdGrupoTicketRemedyIdTecnologia").val(result.GrupoTicketRemedyId);
                $("#txtGrupoTicketRemedyTecnologia").val(result.GrupoTicketRemedyStr);

                // === Tab 3 - Responsabilidades
                $tableApExp.bootstrapTable("load", result.ListExpertos || []);
                LIST_EXPERTOS = (result.ListExpertos || []).map(x => x);
                DATA_EXPERTOS = (result.ListExpertos || []).map(x => x);
                //==============

                $("#ddlTipoExperto").val(-1);
            },
            error: function (result) {
                alert(result.responseText);
            },
            async: false
        });
    } else {
        $.ajax({
            url: URL_API_VISTA + "/DatosTecnologia/" + TecId + `?withAutorizadores=true&withArquetipos=true&withAplicaciones=true&withEquivalencias=true`,
            type: "GET",
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (result) {
                waitingDialog.hide();
                mdAddOrEditTec(true);

                var domain, subdomain, product_type, esqLicenciamientoId, idtechonologytype, automation_implemented, idfuente, idcaldate, platformapplies, motive_sustenance;

                if (result.TipoTecnologiaId != "")
                    idtechonologytype = getValidListData('techonologytype', result.TipoTecnologiaId);
                else
                    idtechonologytype = "-1";

                if (result.AutomatizacionImplementadaId != "")
                    automation_implemented = getValidListData('automationImplemented', result.AutomatizacionImplementadaId);
                else
                    automation_implemented = "-1";

                if (result.SustentoMotivo != "")
                    motive_sustenance = getValidListData('motiveSustenance', result.SustentoMotivo);
                else
                    motive_sustenance = "-1";

                if (result.Fuente != "")
                    idfuente = getValidListData('fuente', result.Fuente);
                else
                    idfuente = "-1";

                if (result.FechaCalculoTec != "")
                    idcaldate = getValidListData('calculationdate', result.FechaCalculoTec);
                else
                    idcaldate = "-1";

                if (result.Aplica != "")
                    platformapplies = getValidListData('platformapplies', result.Aplica);
                else
                    platformapplies = "-1";
                // ====== General
                $("#hdTecnologiaId").val(result.Id);
                $("#hdProductoIdTecnologia").val(result.ProductoId == null ? "-1" : result.ProductoId);

                $("#txtCodigoProductosTecnologia").val(result.CodigoProducto);
                $("#txtFabricanteTecnologia").val(result.Fabricante);
                $("#txtNombreProducto").val(result.Producto.Nombre);
                $("#txtVersionTecnologia").val(result.Versiones);
                $("#txtClaveTecnologia").val(result.Producto.Fabricante + ' ' + result.Producto.Nombre + ' ' + result.Versiones)
                $("#txtDescripcionTecnologia").val(result.Descripcion);
                $("#txtDescripcionTecnologia").attr("data-nombre", result.Nombre);

                $("#chkFlagMostrarSiteEstandares").prop("checked", result.FlagSiteEstandar == null ? false : result.FlagSiteEstandar).trigger("change");
                $("#chkFlagMostrarSiteEstandares").attr("disabled", true);

                // === Tab 1 - General

                $("#cbTipoTecnologiaIdTecnologia").val(idtechonologytype).trigger("change");
                
                ID_ESTADO_TEC_INICIAL = result.EstadoId;
                $("#cbEstadoTecnologiaIdTecnologia").val(result.EstadoId).trigger("change");
                if (result.EstadoId == 2) {
                    $("#txtFechaDeprecado").prop("disabled", true);
                    $("#txtTecReemplazo").prop("disabled", true);
                }                
                $("#txtFechaDeprecado").val(result.FechaDeprecada == null ? "" : (new Date(result.FechaDeprecada)).toLocaleString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' }));
                $("#txtTecReemplazo").val(result.TecReemplazoDepNomb);
                $("#hdnTecReemplazo").val(result.TecReemplazoDepId == null ? "-1" : result.TecReemplazoDepId);
                

                $("#cbAutomatizacionImplementadaIdTecnologia").val(automation_implemented).trigger("change");

                $("input[name='rbtRevisionSeguridadIdTecnologia'][value='" + (result.RevisionSeguridadId || "2") + "']").prop("checked", true).trigger("change");
                $("input[name='rbtRevisionSeguridadIdTecnologia']").attr("disabled", true);
                $("#txtRevisionSeguridadDescripcionTecnologia").val(result.RevisionSeguridadDescripcion);
                $("#txtLineaBaseSeguridad").val(result.LineaBaseSeg);

                $("#txtFechaLanzamientoTecnologia").val(result.FechaLanzamiento == null ? "" : (new Date(result.FechaLanzamiento)).toLocaleString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' }));
                $("#chkFlagFechaFinSoporte").prop("checked", result.FlagFechaFinSoporte).trigger("change");
                // SI tiene fecha de fin de soporte
                if (result.FlagFechaFinSoporte) $("#cbFuenteTecnologia").val(idfuente).trigger("change");

                if (result.FlagFechaFinSoporte) $("#cbFechaCalculosTecnologia").val(idcaldate).trigger("change");

                if ($("#cbFuenteTecnologia").val() == 3) {
                    if (result.FlagFechaFinSoporte) $("#txtFechaFinExtendidaTecnologia").val(result.FechaExtendida == null ? "" : (new Date(result.FechaExtendida)).toLocaleString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' }));
                    if (result.FlagFechaFinSoporte) $("#txtFechaFinSoporteTecnologia").val(result.FechaFinSoporte == null ? "" : (new Date(result.FechaFinSoporte)).toLocaleString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' }));
                    if (result.FlagFechaFinSoporte) $("#txtFechaFinInternaTecnologia").val(result.FechaAcordada == null ? "" : (new Date(result.FechaAcordada)).toLocaleString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' }));
                } else {
                    $("#txtFechaFinExtendidaTecnologia").val("");
                    $("#txtFechaFinSoporteTecnologia").val("");
                    $("#txtFechaFinInternaTecnologia").val("");
                }

                if (result.FlagFechaFinSoporte) $("#txtComentariosFechaFinSoporteTecnologia").val(result.ComentariosFechaFin);
                // NO tiene fecha de fin de soporte
                if (!result.FlagFechaFinSoporte) $("#cbSustentoMotivoFechaFinSoporteTecnologia").val(motive_sustenance);

                if (!result.FlagFechaFinSoporte) $("#txtSustentoUrlFechaFinSoporteTecnologia").val(result.SustentoUrl);


                $("input[name='rbtUrlConfluenceIdTecnologia'][value='" + (result.UrlConfluenceId || "2") + "']").prop("checked", true).trigger("change");
                $("#txtUrlConfluenceTecnologia").val(result.UrlConfluence);
                $("#txtCasoUsoTecnologia").val(result.CasoUso);
                $("#cbPlataformaAplicaIdTecnologia").val(platformapplies);
                $("#cbCompatibilidadSOIdTecnologia").val(result.CompatibilidadSOId == null ? null : result.CompatibilidadSOId.split(",")).multiselect("refresh");
                $("#cbCompatibilidadCloudIdTecnologia").val(result.CompatibilidadCloudId == null ? null : result.CompatibilidadCloudId.split(",")).multiselect("refresh");
                $("#txtEsquemaMonitoreoTecnologia").val(result.EsqMonitoreo);

                // === Tab 2 - Responsabilidades
                $("#txtConformidadArquitectoSeguridadTecnologia").val(result.ConfArqSegDisplayName);
                $("#hdArquitectoSeguridad").val(result.ConfArqSegId);
                // Conformidad de Arquitecto de Tecnologia
                $("#txtConformidadArquitectoTecnologia").val(result.ConfArqTecDisplayName);
                $("#hdArquitectoTecnologia").val(result.ConfArqTecId);

                // === Tab 3 - Responsabilidades
                $tblAplicaciones.bootstrapTable("load", result.ListAplicaciones || []);
                LIST_APLICACION = (result.ListAplicaciones || []).map(x => x);
                ELIMINAR_APLICACION = (result.ListAplicaciones || []).map(x => x);
            },
            error: function (result) {
                alert(result.responseText);
            },
            async: false
        });
    }
}

function setAplicaTecnologia(dataAplica) {
    var retorno = "-1";
    var inputData = $.trim(dataAplica);
    if (inputData !== "") {
        for (var i = 0; i < ARR_APLICATECNOLOGIA.length; i++) {
            let valor = ARR_APLICATECNOLOGIA[i].toUpperCase().includes(inputData.toUpperCase());
            if (valor) {
                retorno = ARR_APLICATECNOLOGIA[i];
                break;
            }
        }
    }

    return retorno;
}

function castDate(date) {
    var fechaTemp = date;
    var vectorDate = fechaTemp.split("/");
    var anio = vectorDate[2];
    var mes = vectorDate[1];
    var dia = vectorDate[0];

    return anio.toString() + "/" + mes + "/" + dia;
}

function irEquivalencias(Id, NombreStr, EstadoTecnologiaStr, FlagActivo) {
    if (FlagActivo) {
        if (EstadoTecnologiaStr === 'Aprobado') {
            $("#hdTecnologiaId").val(Id);
            $("#txtNomTecEq").val("");
            $("#txtTecnologiaInfo").val(NombreStr);
            $("#hdEquivalenciaTexto").val("0");
            $("hdEquivalenciaControl").val("0");
            LimpiarValidateErrores($("#formTecByArq"));
            ItemsRemoveTecEqId = [];
            listarTecnologiasEquivalentes($tblTecEq, $("#mdTecEq"));
        } else {
            bootbox.alert({
                size: "sm",
                title: TITULO_MENSAJE_EQUIVALENCIA,
                message: String.Format("La tecnología se encuentra en estado {0}, no es posible editar.", EstadoTecnologiaStr),
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-primary'
                    }
                }
            });
        }
    } else {
        MensajeRegistroInactivo(TITULO_MENSAJE_EQUIVALENCIA);
    }
}

function abrirEquivalencias() {
    let Id = $("#hdTecnologiaId").val() == "" || $("#hdTecnologiaId").val() == "0" ? -1 : parseInt($("#hdTecnologiaId").val());
    let NombreStr = $("#txtDescripcionTecnologia").attr("data-nombre");
    let EstadoTecnologiaStr = "Aprobado";
    let FlagActivo = true;
    irEquivalencias(Id, NombreStr, EstadoTecnologiaStr, FlagActivo);
}

function abrirAgregarEquivalenciasModal() {
    let EstadoTecnologiaStr = "Aprobado";
    let FlagActivo = true;
    let data = DATA_EQUIVALENCIA.map(x => x);
    //$("#hdTecnologiaId").val(Id);
    $("#txtNomEqTec").val("");
    //$("#spanNomTec").html(NombreStr);
    LimpiarValidateErrores($("#formEqTec"));
    //ItemsRemoveTecEqId = [];
    listarEquivalentesTecnologias($("#tblEqTec"), $("#mdEqTec"), data);
}

function listarEquivalentesTecnologias($tbl, $md, data) {
    $tbl.bootstrapTable('destroy');
    $tbl.bootstrapTable({
        locale: 'es-SP',
        pagination: true,
        data: data
    });
    $md.modal(opcionesModal);
}

function guardarEquivalenteTecnologia() {
    

    //$("#formTecByArq").validate().resetForm();
    LimpiarValidateErrores($("#formEqTec"));
    if ($("#formEqTec").valid()) {
        var _tecId = $("#hdTecnologiaId").val() == "" ? 0 : parseInt($("#hdTecnologiaId").val());
        var equivalencia = $("#txtNomEqTec").val();

        let id = DATA_EQUIVALENCIA.filter(x => x.Id < 0).map(x => x.Id).sort((a, b) => a - b)[0];

        let data = {
            Id: id == null ? -1 : id - 1,
            TecnologiaId: _tecId,
            Nombre: equivalencia,
            //Usuario: USUARIO.UserName
        };

        //$("#btnRegEqTec").button("loading");

        DATA_EQUIVALENCIA.push(data);

        let dataList = DATA_EQUIVALENCIA.map(x => x);

        $("#txtNomEqTec").val("");
        //$("#tblEqTec").bootstrapTable("append", data);
        listarEquivalentesTecnologias($("#tblEqTec"), $("#mdEqTec"), dataList);
    }
}

//function getTecnologias() {
//    var dataAutTec = [];
//    $.ajax({
//        url: URL_API_VISTA + "/ObtenerTecnologia",
//        type: "GET",
//        dataType: "json",
//        success: function (result) {
//            var data = result;
//            $.each(data, function (i, val) {
//                var item = {};
//                item.TecId = val.Id;
//                item.Nombre = val.Nombre;
//                item.value = val.Nombre;
//                dataAutTec.push(item);
//            });
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        complete: function (xhr, textStatus) {
//            if (textStatus === 'success')
//                autocompletarTec(dataAutTec, $("#txtNomTecEq"), $(".eqContainer"));
//        }
//    });
//}

function autocompletarTec(itemsX, inputX, containerX) {
    var $inputX = inputX;
    var $containerX = containerX;
    $inputX.autocomplete({
        appendTo: $containerX,
        minLength: 0,
        source: itemsX,
        focus: function (event, ui) {
            $inputX.val(ui.item.Nombre);
            return false;
        },
        select: function (event, ui) {
            LimpiarValidateErrores($("#formTecByArq"));
            //$("#formTecByArq").validate().resetForm();
            $inputX.val('');
            var estItem = $tblTecEq.bootstrapTable('getRowByUniqueId', ui.item.TecId);
            
            if (estItem === null) {

                var dataTmp = $tblTecEq.bootstrapTable('getData');
                var idx = 0;
                var ultId = dataTmp.length === 0 ? (1 * -1000) : dataTmp[dataTmp.length - 1].TecEqId;
                ultId = ultId === null ? 0 : ultId;
                idx = ultId > 0 ? dataTmp.length * -1000 : ultId - 1000;

                $tblTecEq.bootstrapTable('append', {
                    TecEqId: idx,
                    TecId: $("#hdTecnologiaId").val(),
                    EqId: ui.item.TecId,
                    Nombre: ui.item.Nombre
                });
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Nombre + "</font></a>")
            .appendTo(ul);
    };
}

function AgregarTecnologiaEquivalencia(EquivalenciaId, NombreEquivalencia) {
    var estItem = $tblTecEq.bootstrapTable('getRowByUniqueId', EquivalenciaId);
    if (estItem === null) {

        var dataTmp = $tblTecEq.bootstrapTable('getData');
        var idx = 0;
        var ultId = dataTmp.length === 0 ? (1 * -1000) : dataTmp[dataTmp.length - 1].TecEqId;
        ultId = ultId === null ? 0 : ultId;
        idx = ultId > 0 ? dataTmp.length * -1000 : ultId - 1000;

        $tblTecEq.bootstrapTable('append', {
            TecEqId: idx,
            TecId: $("#hdTecnologiaId").val(),
            EqId: EquivalenciaId,
            Nombre: NombreEquivalencia
        });
    }
}

function formatOpcTecEq(value, row, index) { 
    var btnTrash = `  <a id='btnRemAutTec' class='btn btn-danger' href='javascript: void(0)' onclick='removeItemTecnologiaEquivalenteActual(${row.Id})'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    
    return btnTrash;
}

function formatOpcTecEqProp(value, row, index) {
    var btnTrash = `  <a id='btnRemAutTecProp' class='btn btn-danger' href='javascript: void(0)' onclick='removeItemTecnologiaEquivalenteProp(${row.Id})'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return btnTrash;
}

function formatOpcEqTec(value, row, index) {
    var btnTrash = `  <a id='btnRemAutTec' class='btn btn-danger' href='javascript: void(0)' onclick='removeItemEquivalenteTecnologia(${row.Id})'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return btnTrash;
}

function removeItemTecnologiaEquivalenteActual(TecEqId) {
 
    $("#hdEquivalenciaTexto").val("1");

    let index = DATA_EQUIVALENCIA.findIndex(x => x.Id == TecEqId);
    if (index != -1) {
        DATA_EQUIVALENCIA.splice(index, 1);
    }
    TecEqId = parseInt(TecEqId);

    $tblTecEq.bootstrapTable('remove', {
        field: 'Id', values: [TecEqId], 
    });
     
    if (DATA_EQUIVALENCIA.length == 0) {
        $("#chkFlagEquivalencias").prop("checked", false).trigger("change");
        $("#cbMotivoIdTecnologia").val("-1");
    }
}
 
function removeItemTecnologiaEquivalenteProp(idPropuesta) { 
    aplicacionId = parseInt(idPropuesta);

    $tblTecProp.bootstrapTable('remove', {
        field: 'Id', values: [aplicacionId]
    });
}


function removeItemEquivalenteTecnologia(TecEqId) { 
    let index = DATA_EQUIVALENCIA.findIndex(x => x.Id == TecEqId);
    DATA_EQUIVALENCIA.splice(index, 1);

    let dataList = DATA_EQUIVALENCIA.map(x => x);

    listarEquivalentesTecnologias($("#tblEqTec"), $("#mdEqTec"), dataList);

    //let data = { field: 'Id', values: [TecEqId] };
    //$("#tblEqTec").bootstrapTable("remove", data);

}

function guardarTecnologiaEquivalente() {
    // === Agregar Equivalencias a rabla
    // ======================= 
    $("#hdEquivalenciaControl").val("1");
    var controlTexto = $("#txtNomTecEq").val().trim();
    var controltextoActual = $("#txtTecnologiaInfo").val().trim();

    //if (controlTexto == controltextoActual) {
    //    toastr.error('No se puede agregar el mismo nombre de Clave de tecnología como equivalencia. Por favor, revisar.', TITULO_MENSAJE);
    //} else {
       
    //}
    
    $("#hdEquivalenciaTexto").val("0");
    if (controlTexto.length > 1) {
        $("#hdEquivalenciaTexto").val("1");
    }
    let data = $tblTecProp.bootstrapTable("getData");
    LimpiarValidateErrores($("#formTecByArq"));

    if ($("#formTecByArq").valid()) {
        let index = data.length + 1;
        var _tecId = $("#hdTecnologiaId").val();
        var equivalencia = $("#txtNomTecEq").val();

        $tblTecProp.bootstrapTable("append", {
            Id: index,
            TecnologiaId: _tecId,
            Nombre: equivalencia
        });

        LIST_EQUIVALENCIAS_TEMPORALES.push(equivalencia);
        $("#txtNomTecEq").val("");
    }
  
}

function guardarEquivalencia() {
    // === Guardar solicitud de equivalencia
    // =======================
    LimpiarValidateErrores($("#formTecByArq"));
    
    $("#hdEquivalenciaTexto").val("1");
    let cant = $tblTecProp.bootstrapTable("getData");
    $("#hdEquivalenciaControl").val(cant.length);
    
    if ($("#formTecByArq").valid()) {

        //$("#btnGuardarEquivalencia").button("loading");
        let tec = ObtenerDataFormularioEquivalencia();
        let flagEquivalencias = $("#chkFlagEquivalencias").prop("checked");
        if ($("#cbMotivoIdTecnologia").val() == "-1" && !flagEquivalencias) {
            return false;
        }
        bootbox.confirm({
            title: TITULO_MENSAJE_SOL,
            message: MENSAJE_SOL2,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

                    $.ajax({
                        url: URL_API_VISTA + "/EnviarSolicitudAprobacionEquivalencia",
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(tec),
                        dataType: "json",
                        success: function (result) { 
                            var response = result;
                            var data = DATA_EQUIVALENCIA;
                            var lista = LIST_EQUIVALENCIA;
                            var equivalencia_temporal = LIST_EQUIVALENCIAS_TEMPORALES;
                            if (lista.length > data.length && equivalencia_temporal.length > 0) {
                                toastr.success("La solicitud para agregar y eliminar equivalencias se registró correctamente.", TITULO_MENSAJE_SOL);
                                LIST_EQUIVALENCIAS_TEMPORALES.pop();
                            }
                            else if (lista.length > data.length) {
                                toastr.success("La solicitud para eliminar equivalencias se registró correctamente.", TITULO_MENSAJE_SOL);
                            } 
                            else if (response) {
                                toastr.success("La solicitud para agregar equivalencias se registró correctamente.", TITULO_MENSAJE_SOL);
                            }
                            else {
                                toastr.error('Ocurrio un problema durane el registro. Por favor, revisar.', TITULO_MENSAJE); 
                            }

                        },
                        complete: function () {
                            $("#btnGuardarEquivalencia").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#mdTecEq"), false);
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });

                }
            }
        });
        //=====
        
    }
    
}

function irCambiarEstadoTec(TecId, EstadoTecnologia, EstadoTecnologiaStr, FlagActivo) {
    if (FlagActivo) {
        switch (EstadoTecnologia) {
            case ESTADO_TECNOLOGIA.APROBADO:
                $("#hdTecnologiaId").val(TecId);
                $("#cbNueEstTec").val(-1);
                $("#txtEstActTec").val(EstadoTecnologiaStr);
                $("#hEstTec").val(EstadoTecnologiaStr);
                $("#mdCambEstTec").modal(opcionesModal);
                LimpiarValidateErrores($("#formCambiarEstadoTec"));
                break;
            case ESTADO_TECNOLOGIA.REGISTRADO:
            case ESTADO_TECNOLOGIA.OBSERVADO:
            case ESTADO_TECNOLOGIA.PROCESOREVISION:
                bootbox.alert({
                    size: "sm",
                    title: TITULO_MENSAJE,
                    message: String.Format("La tecnología se encuentra en estado {0}, no es posible editar.", EstadoTecnologiaStr),
                    buttons: {
                        ok: {
                            label: 'Aceptar',
                            className: 'btn-primary'
                        }
                    }
                });
                break;
        }
    } else {
        MensajeRegistroInactivo(TITULO_MENSAJE);
    }
}

function guardarNuevoEstadoTec() {
    if ($("#formCambiarEstadoTec").valid()) {
        var estNueTec = $("#cbNueEstTec").val();
        if (estNueTec === '3') {
            bootbox.confirm({
                title: TITULO_MENSAJE_APROBACION,
                message: "¿Estas seguro de aprobar el registro de la tecnología?, ten en consideración que al realizar la aprobación la tecnología también figurará en el sitio web de Estándares.",
                buttons: {
                    confirm: {
                        label: 'Aprobar',
                        className: 'btn-primary'
                    },
                    cancel: {
                        label: 'Cancelar',
                        className: 'btn-secondary'
                    }
                },
                callback: function (result) {
                    if (result) {
                        var tec = {};
                        tec.id = $("#hdTecnologiaId").val();
                        tec.est = 3;
                        tec.obs = '';

                        $("#btnGuardarEstTec").button("loading");

                        $.ajax({
                            url: URL_API_VISTA + "/CambiarEstadoTec",
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(tec),
                            dataType: "json",
                            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                            success: function (result) {
                                bootbox.alert({
                                    size: "sm",
                                    title: TITULO_MENSAJE_APROBACION,
                                    message: "La tecnología se aprobó correctamente."
                                });
                            },
                            complete: function () {
                                $("#btnGuardarEstTec").button("reset");
                                $("#mdCambEstTec").modal('hide');
                                LimpiarFiltros();
                                listarTecSTD();
                            },
                            error: function (xhr, ajaxOptions, thrownError) {
                                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                            }
                        });
                    }
                }
            });
        } else {
            bootbox.addLocale('custom', locale);
            bootbox.prompt({
                title: TITULO_MENSAJE_OBSERVACION,
                message: '<p>¿Estas seguro que deseas observar el registro de la tecnología?, de ser asi por favor ingrese los comentarios al respecto:</p>',
                inputType: 'textarea',
                rows: '5',
                locale: 'custom',
                callback: function (result) {
                    var data = result;
                    if (data !== '' && data !== null) {
                        if ($.trim(data).length > 500) {
                            toastr.error("Observación no debe superar los 500 carácteres.", TITULO_MENSAJE);
                            return false;
                        }
                        var tec = {};
                        tec.id = $("#hdTecnologiaId").val();
                        tec.obs = data;
                        tec.est = 4;

                        $("#btnGuardarEstTec").button("loading");

                        $.ajax({
                            url: URL_API_VISTA + "/CambiarEstadoTec",
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(tec),
                            dataType: "json",
                            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                            success: function (result) {
                                bootbox.alert({
                                    size: "small",
                                    title: TITULO_MENSAJE_OBSERVACION,
                                    message: "La tecnología se observó correctamente.",
                                    buttons: {
                                        ok: {
                                            label: 'Aceptar',
                                            className: 'btn-primary'
                                        }
                                    }
                                });
                            },
                            complete: function () {
                                $("#btnGuardarEstTec").button("reset");
                                $("#mdCambEstTec").modal('hide');
                                LimpiarFiltros();
                                listarTecSTD();
                            },
                            error: function (xhr, ajaxOptions, thrownError) {
                                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                            }
                        });
                    } else {
                        toastr.error("Observación no debe estar vacio", TITULO_MENSAJE);
                    }
                }
            });
            $(".bootbox-input-textarea").attr("placeholder", placeholderObs);
        }
    }
}

function ObtenerFlagUnicaVigente(tec, flagMetodo) {
    let TitleMensaje = flagMetodo === TIPO_METODO.GUARDARCAMBIOS ? TITULO_MENSAJE : TITULO_MENSAJE_APROBACION;

    bootbox.confirm({
        title: TitleMensaje,
        message: "¿Esta tecnologia es la única vigente en la familia?",
        buttons: {
            confirm: {
                label: "Si",
                className: "btn-primary"
            },
            cancel: {
                label: "No",
                className: "btn-secondary"
            }
        },
        callback: function (result) {
            result = result || false;
            if (result || !result) {
                tec.FlagUnicaVigente = result;
                ajaxGuardar(tec, flagMetodo);
            }
        }
    });
}

function ajaxGuardar(tec, flagMetodo) {
    $.ajax({
        url: URL_API_VISTA,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(tec),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            var data = result;
            if (data > 0) {
                let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
                if ((archivoId === 0 && $("#txtCasoUsoArchivoTecnologia").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                    //UploadFile($("#flCasoUsoArchivoTecnologia"), CODIGO_INTERNO, data, archivoId);
                }
                if (flagMetodo === TIPO_METODO.GUARDARCAMBIOS)
                    $("#btnGuardarTec").button("reset");
                else
                    $("#btnAprTec").button("reset");

                let TitleMensaje = flagMetodo === TIPO_METODO.GUARDARCAMBIOS ? TITULO_MENSAJE : TITULO_MENSAJE_APROBACION;
                let BodyMensaje = flagMetodo === TIPO_METODO.GUARDARCAMBIOS ? "Se guardaron los cambios correctamente" : "La tecnología se aprobó correctamente";

                bootbox.alert({
                    size: "sm",
                    title: TitleMensaje,
                    message: BodyMensaje
                });
            }
        },
        complete: function () {
            mdAddOrEditTec(false);
            LimpiarFiltros();
            listarTecSTD();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function GuardarAprobarTecnologia() {
    // CONSULTAR SI TEC SERÁ VIGENTE
    $("#btnAprTec").button("loading");

    let tec = {};
    tec = ObtenerDataFormularioGeneral(tec, ESTADO_TECNOLOGIA.APROBADO);
    tec.FlagCambioEstado = true;

    //Tab Aprobador
    tec.FlagSiteEstandar = $("#cbSiteEstandar").prop("checked");
    //tec.EstadoId = $("#cbEstado").val();
    //let estado = result.EstadoId == 1; // VIGENTE
    let $estadoId = $("#cbEstado");

    tec.EstadoId = $estadoId.prop("checked") ? ESTADO.Vigente : ESTADO.Deprecado;
    tec.CodigoTecnologiaAsignado = $.trim($("#txtCodAsigTec").val());
    tec.UrlConfluence = $.trim($("#txtUrlConfluence").val());

    tec.ItemsRemoveTecEqIdSTR = ItemsRemoveTecArqId.join("|") || "";
    tec.ItemsAddTecEqIdSTR = $tblArqAprob.bootstrapTable("getData").map(x => x.Id).join("|") || "";

    tec.ItemsRemoveTecVinculadaIdSTR = ItemsRemoveTecVincId.join("|") || "";
    tec.ItemsAddTecVinculadaIdSTR = $tblTecnologiaVinculacion.bootstrapTable("getData").map(x => x.Id).join("|") || "";

    if ($estadoId.prop("checked")) {
        //ObtenerFlagUnicaVigente(tec, TIPO_METODO.APROBAR);
        ajaxGuardar(tec, TIPO_METODO.APROBAR);
    } else {
        ajaxGuardar(tec, TIPO_METODO.APROBAR);
    }
}

function GuardarTecnologia() {
    // CONSULTAR SI TEC SERÁ VIGENTE
    $("#btnGuardarTec").button("loading");

    let tec = {};
    tec = ObtenerDataFormularioGeneral(tec, ESTADO_TECNOLOGIA.APROBADO);
    tec.FlagCambioEstado = false;

    //Tab Aprobador                    
    tec.FlagSiteEstandar = $("#cbSiteEstandar").prop("checked");
    //tec.EstadoId = $("#cbEstado").val();
    //let estado = result.EstadoId == 1; // VIGENTE

    //tec.EstadoId = $("#cbEstado").prop("checked") ? ESTADO.Vigente : ESTADO.Deprecado;
    let _estadoId = 0;
    let editFromId = parseInt($("#hdEditFrom").val(), 10);
    if (editFromId === EDIT_TEC_FROM.ACCESO_DIRECTO) {
        _estadoId = $("#cbEstadoObs").val();
    } else {
        _estadoId = $("#cbEstado").prop("checked") ? ESTADO.Vigente : ESTADO.Deprecado;
    }

    //tec.EstadoId = $("#cbEstadoObs").val();
    tec.EstadoId = _estadoId;
    tec.CodigoTecnologiaAsignado = $.trim($("#txtCodAsigTec").val());
    tec.UrlConfluence = $.trim($("#txtUrlConfluence").val());

    //ARQUETIPO
    tec.ItemsRemoveTecEqIdSTR = ItemsRemoveTecArqId.join("|") || "";
    tec.ItemsAddTecEqIdSTR = $tblArqAprob.bootstrapTable("getData").map(x => x.Id).join("|") || "";

    //TECNOLOGIAS VINCULADAS
    tec.ItemsRemoveTecVinculadaIdSTR = ItemsRemoveTecVincId.join("|") || "";
    tec.ItemsAddTecVinculadaIdSTR = $tblTecnologiaVinculacion.bootstrapTable("getData").map(x => x.Id).join("|") || "";

    if (_estadoId === ESTADO.Vigente) {
        //ObtenerFlagUnicaVigente(tec, TIPO_METODO.GUARDARCAMBIOS);
        //ajaxGuardar(tec, TIPO_METODO.APROBAR);
        ajaxGuardar(tec, TIPO_METODO.GUARDARCAMBIOS);
    } else {
        ajaxGuardar(tec, TIPO_METODO.GUARDARCAMBIOS);
    }
}

function GuardarObservarTecnologia(Observacion) {
    let tec = {};
    tec = ObtenerDataFormularioGeneral(tec, ESTADO_TECNOLOGIA.OBSERVADO);
    tec.FlagCambioEstado = true;
    tec.Observacion = Observacion;

    //TAB APROBADOR
    tec.FlagSiteEstandar = $("#cbSiteEstandar").prop("checked");
    //tec.EstadoId = $("#cbEstado").val();
    //let estado = result.EstadoId == ESTADO.Vigente; // VIGENTE
    tec.EstadoId = $("#cbEstado").prop("checked") ? ESTADO.Vigente : ESTADO.Deprecado;
    //$("#cbEstado").prop("checked", estado);
    //$("#cbEstado").bootstrapToggle(estado ? "on" : "off");

    $.ajax({
        url: URL_API_VISTA,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(tec),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            var data = result;
            if (data > 0) {
                let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
                if ((archivoId === 0 && $("#txtCasoUsoArchivoTecnologia").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                    //UploadFile($("#flCasoUsoArchivoTecnologia"), CODIGO_INTERNO, data, archivoId);
                }

                bootbox.alert({
                    size: "sm",
                    title: TITULO_MENSAJE_OBSERVACION,
                    message: "La tecnología se observó correctamente."
                });
            }
        },
        complete: function () {
            mdAddOrEditTec(false);
            $("#btnObsTec").button("reset");
            LimpiarFiltros();
            listarTecSTD();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function cargarCombos() {
    SetItems(ItemNumeros.filter(x => ![0].includes(x)), $("#cbExisTec"), TEXTO_SELECCIONE);
    SetItems(ItemNumeros.filter(x => [1, 3, 5].includes(x)), $("#cbFacAcTec"), TEXTO_SELECCIONE);
    SetItems(ItemNumeros.filter(x => [0, 5].includes(x)), $("#cbRiesgTec"), TEXTO_SELECCIONE);
}

function formatOpcTec(value, row, index) {
    var btnTrash = `  <a id='btnRemAutTec' class='btn btn-danger' href='javascript: void(0)' onclick='removeItemAutorizador(${row.Id})'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return btnTrash;
}

function removeItemAutorizador(Id) {
    ItemsRemoveAutId.push(Id);
    $tblAutorizador.bootstrapTable('remove', {
        field: 'Id', values: [Id]
    });
}

function CargarSubDominio() {
    let dominioId = $("#cbDominioIdProducto").val();
    let dominioStr = dominioId == "-1" ? "" : $("#cbDominioIdProducto option:selected").text();
    $("#txtDominioTecnologia").val(dominioStr);
    let listSubDominio = LIST_SUBDOMINIO.filter(x => x.TipoId == dominioId);
    SetItems(listSubDominio, $("#cbSubDominioIdProducto"), TEXTO_SELECCIONE);
}

function CbSubDominioIdProducto_Change() {
    let subDominioId = $("#cbSubDominioIdProducto").val();
    let subDominioStr = subDominioId == "-1" ? "" : $("#cbSubDominioIdProducto option:selected").text();
    $("#txtSubDominioTecnologia").val(subDominioStr);
    $("#hdnSubDominioIdTecnologia").val(subDominioId == "-1" ? null : subDominioId);
}

function CargarCombos2() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) { 
                    SetItemsCustomField(dataObject.MotivoDesactiva, $("#cbMotivoEliminacion"), TEXTO_SELECCIONE, "Id", "Descripcion");
                    //SetItemsCustomField(dataObject.Producto, $("#cbProductoIdBus"), TEXTO_TODOS, "Id", "Nombre");
                    SetItems(dataObject.Fuente, $("#cbFuenteTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.FechaCalculo, $("#cbFechaCalculosTecnologia"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.TipoFechaInterna, $("#cbTipoFechaInternaTecnologia"), TEXTO_SELECCIONE);

                    //FILTROS MULTISELECT
                    SetItemsMultiple(dataObject.Dominio, $("#cbFilDom"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.EstadoTecnologia, $("#cbFilEst"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TipoTec, $("#cbFilTipoTec"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.EstadoObs, $("#cbFilEstObs"), TEXTO_TODOS, TEXTO_TODOS, true);

                    //SetItems(dataObject.Dominio, $("#cbFilDom"), TEXTO_TODOS);
                    //SetItems(dataObject.Familia, $("#cbFilFam"), TEXTO_TODOS);
                    //SetItems(dataObject.TipoTec, $("#cbFilTipoTec"), TEXTO_TODOS);
                    //SetItems(dataObject.EstadoTecnologia, $("#cbFilEst"), TEXTO_TODOS);
                    //SetItems(dataObject.EstadoObs, $("#cbFilEstObs"), TEXTO_TODOS);

                    //SetItems(dataObject.TipoTec, $("#cbTipoProductoIdProducto"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoCicloVida, $("#cbTipoCicloVidaIdProducto"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Dominio, $("#cbDominioIdProducto"), TEXTO_SELECCIONE);
                    SetItems(LIST_SUBDOMINIO, $("#cbSubDominioIdProducto"), TEXTO_SELECCIONE);
                    LIST_SUBDOMINIO = dataObject.SubDominio;

                    //DATA_PRODUCTO = dataObject.Producto;
                    //SetItemsCustomField(dataObject.Producto, $("#cbProductoIdTecnologia"), TEXTO_SELECCIONE, "Id", "Nombre");
                    //SetItems(dataObject.Valores, $("#cbFlagSiteEstandarTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ImplementacionAutomatizada, $("#cbAutomatizacionImplementadaIdTecnologia"), TEXTO_SELECCIONE);
                    SetItemsCustomField(dataObject.Motivo, $("#cbMotivoIdTecnologia"), TEXTO_SELECCIONE, "Id", "Nombre");
                    //SetItems(dataObject.Familia, $("#cbFamTec"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoTec, $("#cbTipoTecnologiaIdTecnologia"), TEXTO_SELECCIONE);
                    
                    SetItems(dataObject.EstadoObs, $("#cbEstadoTecnologiaIdTecnologia"), TEXTO_SELECCIONE);
                    
                    SetItems(dataObject.AplicaTecnologia, $("#cbPlataformaAplicaIdTecnologia"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.CompatibilidadSO, $("#cbCompatibilidadSOIdTecnologia"), NO_APLICA, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.CompatibilidadCloud, $("#cbCompatibilidadCloudIdTecnologia"), NO_APLICA, TEXTO_TODOS, true);
                    SetItems(dataObject.SustentoMotivo, $("#cbSustentoMotivoFechaFinSoporteTecnologia"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Valores, $("#cbConocimientoIdTecnologia"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Valores, $("#cbRiesgoObsolescenciaIdTecnologia"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Valores, $("#cbFacilidadActualizacionIdTecnologia"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Valores, $("#cbVulnerabilidadSeguridadTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EsquemaLicenciamientoSuscripcion || [], $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoExperto, $("#ddlTipoExperto"), TEXTO_SELECCIONE);

                    SetItemsCustomField(LIST_SQUAD, $("#cbSquadIdProducto"), TEXTO_SELECCIONE, "Id", "Descripcion");

                    let lstRbtRevisionSeguridad = dataObject.RevisionSeguridad.map((x, i) => `<label class="radio-inline"><input type="radio" id="rbtRevisionSeguridadIdTecnologia_${x.Id}" name="rbtRevisionSeguridadIdTecnologia" value="${x.Id}" ${i == 0 ? "checked" : ""} /> ${x.Descripcion}</label>`).join('');
                    $("#lstRbtRevisionSeguridad").html(lstRbtRevisionSeguridad);
                    //$("input[name='rbtRevisionSeguridadIdTecnologia']").change(RbtRevisionSeguridadIdTecnologia_Change);
                    $("input[name='rbtRevisionSeguridadIdTecnologia']:checked").trigger("change");

                    let lstRbtUrlConfluence = dataObject.UrlConfluence.map((x, i) => `<label class="radio-inline"><input type="radio" id="rbtUrlConfluenceIdTecnologia_${x.Id}" name="rbtUrlConfluenceIdTecnologia" value="${x.Id}" ${i == 0 ? "checked" : ""} /> ${x.Descripcion}</label>`).join('');
                    $("#lstRbtUrlConfluence").html(lstRbtUrlConfluence);
                    $("input[name='rbtUrlConfluenceIdTecnologia']").change(RbtUrlConfluenceIdTecnologia_Change);
                    $("input[name='rbtUrlConfluenceIdTecnologia']:checked").trigger("change");

                    ARR_APLICATECNOLOGIA = dataObject.AplicaTecnologia;
                    SetItems(dataObject.AplicaTecnologia, $("#txtFilAplica"), TEXTO_TODOS);
                    SetItems(dataObject.AplicaTecnologia, $("#txtApliTec"), TEXTO_SELECCIONE);

                    CODIGO_INTERNO = dataObject.CodigoInterno;
                    SetItems(dataObject.FechaFinSoporte, $("#cbFilEsFecSop"), TEXTO_TODOS);

                    LIST_ESTADO_ESTANDAR = dataObject.TipoTec;
                    DATA_INPUT_OPCIONAL = dataObject.EstadoObs;

                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function RbtUrlConfluenceIdTecnologia_Change() {
    let value = $("input[name='rbtUrlConfluenceIdTecnologia']:checked").val();
    let enabledText = value == 1;
    if (!enabledText) $("#txtUrlConfluenceTecnologia").val("");
    $("#txtUrlConfluenceTecnologia").prop("readonly", !enabledText);
}


function cargarDatosProducto(item) {
    let flagNuevo = $("#chkFlagNuevoProducto").prop("checked");

    //let readonlyCodigoProducto = !((!flagNuevo && item == null) || (flagNuevo));
    //$("#txtCodigoProductosTecnologia").prop("readonly", readonlyCodigoProducto);

    //if (item == null) return;

    $("#txtFabricanteTecnologia").val(item != null ? item.Fabricante : '');
    $("#txtNombreProducto").val(item != null ? item.Producto.Nombre : '');
    $("#txtDescripcionTecnologia").val(item != null ? item.Descripcion : '');
    $("#txtDominioTecnologia").val(item != null ? item.DominioStr : '');
    $("#txtSubDominioTecnologia").val(item != null ? item.SubDominioStr : '');
    $("#hdnSubDominioIdTecnologia").val(item != null ? item.SubDominioId : '');
    //$("#cbTipoProductoIdProducto").val(item != null ? item.TipoProductoId : -1).trigger("change");
    $("#txtGrupoTicketRemedyTecnologia").val(item != null ? item.GrupoTicketRemedyNombre : '');
    $("#hdGrupoTicketRemedyIdTecnologia").val(item != null ? item.GrupoTicketRemedyId : '');
    //$("#txtEquipoAdministracionTecnologia").val(item != null ? item.EquipoAdmContacto : '');
    $("#txtEquipoAprovisionamientoTecnologia").val(item != null ? item.EquipoAprovisionamiento : '');
    $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val(item != null ? item.EsquemaLicenciamientoSuscripcionId == null ? -1 : item.EsquemaLicenciamientoSuscripcionId : -1);

    $("#txtCodigoProductosTecnologia").val(flagNuevo ? "" : item != null ? item.Codigo : "");
    $("#txtDescripcionTecnologia").prop("readonly", true);
    //let tipoProductoId = item == null ? -1 : item.TipoProductoId;
    $("#cbTipoTecnologiaIdTecnologia").val(tipoProductoId).trigger("change");

    $("#hdOwnerIdTecnologia").val(item != null ? item.OwnerId : '');
    $("#txtOwnerDisplayNameTecnologia").val(item != null ? item.OwnerDisplayName : '');
    $("#hdOwnerMatriculaTecnologia").val(item != null ? item.OwnerMatricula : '');

    SetearClaveTecnologia();
}

function exportarConsolidadoTecSTD() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.productoId = $("#hdnProductoBusTec").val() == "" ? null : $("#hdnProductoBusTec").val();
    DATA_EXPORTAR.nombre = $.trim($("#txtBusTec").val());
    DATA_EXPORTAR.dominioIds = $("#cbFilDom").val();
    DATA_EXPORTAR.subdominioIds = $("#cbFilSub").val();
    DATA_EXPORTAR.codigo = $("#txtFilCodigo").val();
    DATA_EXPORTAR.tribuCoe = $("#txtFilTribuCoeStr").val();
    DATA_EXPORTAR.squad = $("#cbSquadIdSearch").val() == -1 ? "" : $("#cbSquadIdSearch option:selected").text();
    DATA_EXPORTAR.tipoTecIds = $("#cbFilTipoTec").val();
    DATA_EXPORTAR.estObsIds = $("#cbFilEstObs").val();
    DATA_EXPORTAR.sortName = "FechaCreacion";
    DATA_EXPORTAR.sortOrder = "desc";

    let url = `${URL_API_VISTA}/ExportarTecnologiaModificadaConsolidado`;
    $.ajax({
        url: url,
        type: 'POST',
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

function exportarDetalladoTecSTD() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.productoId = $("#hdnProductoBusTec").val() == "" ? null : $("#hdnProductoBusTec").val();
    DATA_EXPORTAR.nombre = $.trim($("#txtBusTec").val());
    DATA_EXPORTAR.dominioIds = $("#cbFilDom").val();
    DATA_EXPORTAR.subdominioIds = $("#cbFilSub").val();
    DATA_EXPORTAR.codigo = $("#txtFilCodigo").val();
    DATA_EXPORTAR.tribuCoe = $("#txtFilTribuCoeStr").val();
    DATA_EXPORTAR.squad = $("#cbSquadIdSearch").val() == -1 ? "" : $("#cbSquadIdSearch option:selected").text();
    DATA_EXPORTAR.tipoTecIds = $("#cbFilTipoTec").val();
    DATA_EXPORTAR.estObsIds = $("#cbFilEstObs").val();
    DATA_EXPORTAR.sortName = "FechaCreacion";
    DATA_EXPORTAR.sortOrder = "desc";

    let url = `${URL_API_VISTA}/ExportarTecnologiaModificadaDetallado`;
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

function ExisteAplicacion() {
    let estado = false;
    //let nombre = $("#txtApp").val();
    let Id = $("#hdIdApp").val();
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Aplicacion" + `/ExisteAplicacion?Id=${Id}`,
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
function ExisteArquetipo() {
    let estado = false;
    //let nombre = $("#txtArqTec").val();
    let Id = $("#hdIdArq").val();
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Arquetipo" + `/ExisteArquetipo?Id=${Id}`,
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
function InitAutocompletarAplicacion($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Aplicacion" + "/GetAplicacionByFiltro?filtro=" + request.term,
                    //data: JSON.stringify({
                    //    filtro: request.term
                    //}),
                    //dataType: "json",
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        DATA_APLICACION = data;
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
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}
function InitAutocompletarArquetipo($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Arquetipo" + "/GetByFiltro?filtro=" + request.term,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    //contentType: "application/json; charset=utf-8",
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
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            AgregarArquetipoTecnologia(ui.item.Id, ui.item.Descripcion);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}
function ValidarEquivalencia() {
    var rpta = true;
    let equivalencia = $("#txtNomTecEq").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ValidarEquivalencia?equivalencia=${equivalencia}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    rpta = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return !rpta;
}

function ValidarCantidadEquivalencia() {
    var rpta = false;

    let apps = $tblTecProp.bootstrapTable('getData');

    if (apps.length > 0)
    {
        rpta = true;
    }

    return !rpta;
}

function formatOpcArqAprob(value, row, index) {
    let btnTrash = `  <a id="btnRemAutTec" class="btn btn-danger" href="javascript: void(0)" onclick="removeItemArquetipoTecnologia(${row.Id})">` +
        `<span class="icon icon-trash-o"></span>` +
        `</a>`;
    return btnTrash;
}
function removeItemArquetipoTecnologia(Id) {
    let existe = ItemsRemoveTecArqId.find(x => x === Id) || null;
    if (existe === null) {
        ItemsRemoveTecArqId.push(Id);
    }
    $tblArqAprob.bootstrapTable('remove', {
        field: 'Id', values: [Id]
    });
}
function AgregarArquetipoTecnologia(Id, Nombre) {

    var matItem = $tblArqAprob.bootstrapTable("getRowByUniqueId", parseInt(Id));
    if (matItem === null) {

        var dataTmp = $tblArqAprob.bootstrapTable("getData");
        $tblArqAprob.bootstrapTable('append', {
            Id: parseInt(Id),
            Nombre: Nombre
        });
    }

    $("#txtArqTec").val("");
}

function ExisteFamilia() {
    let estado = false;
    let Id = $("#hFamTecId").val();
    let nombre = "";
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Familia" + `/ExisteFamilia?Id=${Id}&nombre=${nombre}`,
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

function InitAutocompletarFamilia($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                if ($IdBox !== null) $IdBox.val("0");

                $.ajax({
                    url: URL_API + "/Familia" + "/GetAllFamiliaByFiltro?filtro=" + request.term,
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
            } else
                return response(true);
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $searchBox.val(ui.item.Descripcion);
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                obtenerFamiliaById(ui.item.Id);
            }

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function ExisteTecnologia($hdId) {
    let estado = false;
    //let nombre = $("#txtTecnologia").val();
    let Id = $hdId.val();
    //let Id = $("#hdTecnologiaIdObs").val();
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

function ExisteEquivalenciaTecnologia(TecnologiaId) {
    let estado = false;
    //let Id = $hdId.val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Tecnologia/ExisteEquivalenciaTecnologia?Id=${TecnologiaId}`,
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

function InitAutocompletarTecnologia($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API_VISTA + "/GetTecnologiaByClaveById",
                    data: JSON.stringify({
                        filtro: request.term,
                        id: ($("#hdTecnologiaId").val() === "" || $("#hdTecnologiaId").val() === "0") ? null : parseInt($("#hdTecnologiaId").val())
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Descripcion));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}

function InitAutocompletarTecnologiaForBusqueda($searchBox, $IdBox, $Container, $IdTecPadre, _flagActivo) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                let id = ($IdTecPadre !== null) ? $IdTecPadre.val() : null;
                let flagActivo = _flagActivo;
                //$IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetTecnologiaForBusqueda?filtro=${encodeURIComponent(request.term)}&id=${id}&flagActivo=${flagActivo}`,
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            //$IdBox.val(ui.item.Id);
            if ($IdBox !== null) $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            //obtenerFamiliaById(ui.item.Id);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function ExisteClaveTecnologia() {
    let estado = true;
    let clave = encodeURIComponent($("#txtClaveTecnologia").val());
    let id = $("#hdTecnologiaId").val();
    let flagActivo = FLAG_ACTIVO_TECNOLOGIA;

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteClaveTecnologia?clave=${clave}&Id=${id}&flagActivo=${flagActivo}`,
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

function formatOpcTecVinculacion(value, row, index) {
    let btnTrash = `  <a id="btnRemAutTec" class="btn btn-danger" href="javascript: void(0)" onclick="removeItemTecnologiaVinculacion(${row.Id})">` +
        `<span class="icon icon-trash-o"></span>` +
        `</a>`;
    return btnTrash;
}
function removeItemTecnologiaVinculacion(Id) {
    let existe = ItemsRemoveTecVincId.find(x => x === Id) || null;
    if (existe === null) {
        ItemsRemoveTecVincId.push(Id);
    }
    $tblTecnologiaVinculacion.bootstrapTable('remove', {
        field: 'Id', values: [Id]
    });
}
function AgregarTecnologiaVinculacion(Id, Tecnologia, Dominio, Subdominio) {

    var matItem = $tblTecnologiaVinculacion.bootstrapTable("getRowByUniqueId", parseInt(Id));
    if (matItem === null) {

        var dataTmp = $tblTecnologiaVinculacion.bootstrapTable("getData");
        $tblTecnologiaVinculacion.bootstrapTable('append', {
            Id: parseInt(Id),
            DominioNomb: Dominio,
            SubdominioNomb: Subdominio,
            Nombre: Tecnologia
        });
    }
    $("#txtTecnologiaVinculadad").val("");
}

function InitAutocompletarTecnologiaVinculada($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                let data = {};
                data.Id = parseInt($("#hdTecnologiaId").val()) === 0 ? null : parseInt($("#hdTecnologiaId").val());
                data.IdsTec = $tblTecnologiaVinculacion.bootstrapTable("getData").map(x => x.Id) || [];
                data.Filtro = request.term;

                $IdBox.val("0");
                $.ajax({
                    url: URL_API + `/Tecnologia/GetTecnologiaByFiltroById`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(data),
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
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            AgregarTecnologiaVinculacion(ui.item.Id, ui.item.Descripcion, ui.item.Dominio, ui.item.Subdominio);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarProducto($searchBox, $IdBox, $Container) {
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
            cargarDatosProducto(ui.item);
            $("#txtVersionTecnologia").focus();
            //$("#hdTribuCoeIdProducto").val(ui.item.TribuCoeId);
            //$searchBox.attr("data-fabricante", ui.item.Fabricante);
            //$("#txtDominioTecnologia").val(ui.item.DominioStr);
            //$("#txtSubDominioTecnologia").val(ui.item.SubDominioStr);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Fabricante + " " + item.Nombre + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarProductoSearch($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");

                $.ajax({
                    url: URL_API + "/Producto" + `/ListadoByDescripcion?descripcion=${encodeURIComponent(request.term)}`,
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
    })
        .keyup(function (e) {
            if ($searchBox.val() == "") {
                $IdBox.val("");
            }
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
            var a = document.createElement("a");
            var font = document.createElement("font");
            font.append(document.createTextNode(item.Fabricante + " " + item.Nombre));
            a.style.display = 'block';
            a.append(font);
            return $("<li>").append(a).appendTo(ul);
    };
}


function SetearClaveTecnologia() {
    let flagNuevoProducto = $("#chkFlagNuevoProducto").prop("checked");
    let productoId = $("#hdProductoIdTecnologia").val() == '-1' || $("#hdProductoIdTecnologia").val() == '' || $("#hdProductoIdTecnologia").val() == '0' ? null : $("#hdProductoIdTecnologia").val();
    let fabricante = $("#txtFabricanteTecnologia").val();
    let nombre = $("#txtNombreProducto").val();
    let version = $("#txtVersionTecnologia").val();
    let clave = `${fabricante} ${nombre} ${version}`;
    $("#txtClaveTecnologia").val(clave);
}

//Upload

function EliminarArchivo() {
    //$("#hdArchivoId").val("");
    $("#txtCasoUsoArchivoTecnologia").val(TEXTO_SIN_ARCHIVO);
    //$("#flCasoUsoArchivoTecnologia").val("");
    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
    //$(".div-controls-file").hide();
}

function DescargarArchivo() {
    DownloadFile($("#hdArchivoId").val(), $("#txtCasoUsoArchivoTecnologia"), "Tecnologías");
}

function listarTecnologiasEquivalentes1($tbl, $md) {
    $tableApExp.bootstrapTable("destroy");
    $tableApExp.bootstrapTable({ data: [] });

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tbl.bootstrapTable('destroy');
    $tbl.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListarTecnologiasEquivalentes",
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
            DATA_EXPORTAR_TEC_EQ = {};
            DATA_EXPORTAR_TEC_EQ.id = $("#hdTecnologiaId").val() === "" ? 0 : parseInt($("#hdTecnologiaId").val());
            DATA_EXPORTAR_TEC_EQ.pageNumber = p.pageNumber;
            DATA_EXPORTAR_TEC_EQ.pageSize = p.pageSize;
            DATA_EXPORTAR_TEC_EQ.sortName = p.sortName;
            DATA_EXPORTAR_TEC_EQ.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_TEC_EQ);
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
        onLoadSuccess: function (data) {
            $md.modal(opcionesModal);
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
    });
}

function listarTecnologiasEquivalentes($tbl, $md) {
    $tblTecProp.bootstrapTable("destroy");
    $tblTecProp.bootstrapTable({ data: [] });
    let TecId = $("#hdTecnologiaId").val() === "" ? 0 : parseInt($("#hdTecnologiaId").val());

    $.ajax({
        url: URL_API_VISTA + "/ListarTecnologiasEquivalentesPropuesta/" + TecId + `?withEquivalencias=true`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            waitingDialog.hide();
            $md.modal(opcionesModal);
            //mdAddOrEditTec(true);
            //$("#hdTecnologiaId").val(result.Id);
            $("#chkFlagEquivalencias").prop("checked", result.FlagTieneEquivalencias).trigger("change");
            $("#cbMotivoIdTecnologia").val(result.MotivoId == null ? "-1" : result.MotivoId);

            ItemsEquivalencias = result.ListEquivalencias;
            $tblTecEq.bootstrapTable("load", result.ListEquivalencias || []);

            DATA_EQUIVALENCIA = (result.ListEquivalencias || []).map(x => x);
            LIST_EQUIVALENCIA = (result.ListEquivalencias || []).map(x => x);
            
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function irListarTecnologiasEquivalentes() {
    //$("#hdTecnologiaId").val(-1);
    if ($("#hdTecnologiaId").val() !== "") {
        listarTecnologiasEquivalentes($tblTecEqList, $("#mdTecEqList"));
    }
    else {
        bootbox.alert({
            size: "small",
            title: TITULO_MENSAJE,
            message: "No hay tecnologías equivalentes.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    }
}

function verEquivalencias() {
    $("#hdTecnologiaId").val("");
    listarTecnologiasEquivalentes($tblTecEqGeneral, $("#mdTecEqGeneral"));
}

function exportarEquivalenciasGeneral() {
    let _data = $tblTecEqGeneral.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);

        return false;
    }

    let url = `${URL_API_VISTA}/ExportarEquivalenciaGeneral?sortName=${DATA_EXPORTAR_TEC_EQ.sortName}&sortOrder=${DATA_EXPORTAR_TEC_EQ.sortOrder}`;
    $.ajax({
        url: url,
        type: 'GET',
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

function GuardarConfirmarTecnologia() {
    $("#btnConTec").button("loading");

    let tec = {};
    tec = ObtenerDataFormularioGeneral(tec, ESTADO_TECNOLOGIA.PROCESOREVISION);
    tec.FlagCambioEstado = true;

    $.ajax({
        url: URL_API_VISTA,
        type: "POST",
        data: JSON.stringify(tec),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            var data = result;
            if (data > 0) {
                let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
                if ((archivoId === 0 && $("#txtCasoUsoArchivoTecnologia").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                    //UploadFile($("#flCasoUsoArchivoTecnologia"), CODIGO_INTERNO, data, archivoId);
                }
                bootbox.alert({
                    size: "sm",
                    title: TITULO_MENSAJE,
                    message: "La confirmación de la tecnología procedió correctamente.",
                    buttons: {
                        ok: {
                            label: 'Aceptar',
                            className: 'btn-primary'
                        }
                    }
                });
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            mdAddOrEditTec(false);
            $("#btnConTec").button("reset");
            LimpiarFiltros();
            listarTecSTD();
        }
    });
}

function ExisteMatricula(Matricula) {
    let estado = false;
    let matricula = Matricula;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_LOGIN_SERVER + `/ObtenerDatosUsuario?correoElectronico=${matricula}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    DATOS_RESPONSABLE = dataObject;
                    let EstadoUser = dataObject.Estado;
                    estado = EstadoUser !== 1 ? false : true;
                    //estado = dataObject;
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


function defaultAccesoDirecto() {
    $("#mdAddOrEditTec").modal('hide');
    $(COMBO_SELECTED).val("-1");
}

function ExisteFamilia2() {
    let estado = false;
    let Id = $("#hFamTecId").val() !== "0" ? $("#hFamTecId").val() : null;
    let nombre = $("#txtFamTec").val() || "";
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Familia" + `/ExisteFamilia?Id=${Id}&nombre=${nombre}`,
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

function InsertNuevaFamilia() {
    let familia = {};
    familia.Id = 0;//($("#hIdFamilia").val() === "") ? 0 : parseInt($("#hIdFamilia").val());
    familia.Nombre = $("#txtFamTec").val();
    familia.Descripcion = $("#txtFamTec").val();
    familia.Existencia = 1; //$("#cbExisTec").val();
    familia.Facilidad = 3; //$("#cbFacAcTec").val();
    familia.Riesgo = 0;//$("#cbRiesgTec").val();
    familia.Vulnerabilidad = 0; //$("#txtVulTec").val();

    familia.Activo = true;//$('#cbActFamilia').prop("checked"); // $("#cbActFamilia").is(':checked');

    $.ajax({
        url: URL_API + "/Familia",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(familia),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            if (result > 0) {
                //ID = result;
                $("#hFamTecId").val(result);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function setDefaultUrl($textBox) {
    $textBox.keyup(function () {
        if ($.trim($(this).val()) === "") {
            $(this).addClass("ignore");
        } else {
            $(this).removeClass("ignore");
        }
    });
}

//Actualizacion masiva
function irActualizarTecnologia() {
    $("#btnReg").hide();
    $("#btnActualizar").show();
    $(".onlyUpdate").show();
    $(".onlyUpdate").removeClass("ignore");
    $("#btnDescargarPlantilla").hide();
    LimpiarValidateErrores($("#formImportar"));
    $("#titleFormImp").html(String.Format("{0} tecnologías", "Actualización masiva de"));
    $("#flArchivo").val("");
    $("#txtArchivo").val(TEXTO_SIN_ARCHIVO);
    $("#cbTipoEquipoFil").val("-1");
    $("#mdImportar").modal(opcionesModal);
}

function validarFormImportar() {

    $.validator.addMethod("requiredArchivo", function (value, element) {
        return $.trim(value) !== "";
    });

    $.validator.addMethod("requiredExcel", function (value, element) {
        let validExts = new Array(".xlsx", ".xls");
        let fileExt = value;
        fileExt = fileExt.substring(fileExt.lastIndexOf('.'));

        return validExts.indexOf(fileExt) < 0 ? false : true;
    });

    $("#formImportar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            //cbTipoEquipoFil: {
            //    requiredSelect: true
            //},
            flArchivo: {
                requiredArchivo: true,
                requiredExcel: true
            }
        },
        messages: {
            //cbTipoEquipoFil: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo de equipo")
            //},
            flArchivo: {
                requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo"),
                requiredExcel: String.Format("Debes seleccionar {0}.", "un archivo válido")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtArchivo" || element.attr('name') === "flArchivo") {
                element.parent().parent().parent().parent().append(error);
            }
            else {
                element.parent().append(error);
            }
        }
    });
}

function descargarTecnologiasActualizar() {
    let url = `${URL_API_VISTA}/Exportar/Actualizar`;
    $.ajax({
        url: url,
        type: 'GET',
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

function ActualizarTecnologias() {
    if ($("#formImportar").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $("#btnActualizar").button("loading");

        let formData = new FormData();
        let file = $("#flArchivo").get(0).files;
        formData.append("File", file[0]);

        $.ajax({
            url: URL_API_VISTA + "/ActualizarTecnologias",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            data: formData,
            contentType: false,
            processData: false,
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        $("#btnActualizar").button("reset");
                        $("#mdImportar").modal("hide");
                        waitingDialog.hide();
                        //CUSTOM MESSAGE

                        var TotalRegistros = dataObject.TotalRegistros;
                        var Errores = dataObject.Errores;
                        if (TotalRegistros > 0) {
                            var NoRegistrados = Errores.length;
                            if (NoRegistrados > 0) {
                                MENSAJE_CARGA_MASIVA = String.Format("Se registraron {0} de {1} registros", TotalRegistros - NoRegistrados, TotalRegistros);
                                MENSAJE_CARGA_MASIVA = MENSAJE_CARGA_MASIVA.concat("<br>", "Errores: ");
                                MENSAJE_CARGA_MASIVA = MENSAJE_CARGA_MASIVA.concat("<br>", Errores.join("<br>"));
                            } else {
                                MENSAJE_CARGA_MASIVA = String.Format("Se registraron {0} de {1} registros", TotalRegistros, TotalRegistros);
                            }

                            bootbox.alert({
                                size: "sm",
                                title: TITULO_CARGA_MASIVA,
                                message: MENSAJE_CARGA_MASIVA,
                                buttons: {
                                    ok: {
                                        label: 'Aceptar',
                                        className: 'btn-primary'
                                    }
                                }
                            });

                        } else {
                            MENSAJE_CARGA_MASIVA = "Error en la importación de equipos: ";
                            MENSAJE_CARGA_MASIVA = MENSAJE_CARGA_MASIVA.concat("<br>", Errores.join("<br>"));

                            bootbox.alert({
                                size: "sm",
                                title: TITULO_CARGA_MASIVA,
                                message: MENSAJE_CARGA_MASIVA,
                                buttons: {
                                    ok: {
                                        label: 'Aceptar',
                                        className: 'btn-primary'
                                    }
                                }
                            });
                        }
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function InitAutocompletarBuilderLocal($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

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
                //$IdBox.val(ui.item.id);
                $IdBox.val(ui.item.matricula);
                //$("#txtCorreo").val(ui.item.mail);
                //$("#txtNombreResponsable").val(ui.item.displayName);
                //$("#txtMatriculaResponsable").val(ui.item.matricula);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function verTecnologiasProducto(alert = false) {
    if (alert) {
        $("#titleTecAso").html(TITULO_MENSAJE_SOL)
        $("#buttonsTecAso").show();
        $("#descripcionTecAso").html(MENSAJE_SOL_PROD).show();
    } else {
        $("#titleTecAso").html("Tecnologías Asociadas")
        $("#buttonsTecAso").hide();
        $("#descripcionTecAso").html("").hide();
    }
    let productoId = $("#hdProductoIdTecnologia").val();
    if (productoId == "0" || productoId == "-1" || productoId == null || productoId == "") return;
    ListarTecnologiasProducto(productoId, () => {
        MdTecnologiasByProducto(true);
    });
}

function MdTecnologiasByProducto(EstadoMd) {
        mdAddOrEditTec(EstadoMd ? false : true);
    if (EstadoMd) {
        $("#mdTecnologiasByProducto").modal(opcionesModal);
    } else {
        $("#mdTecnologiasByProducto").modal('hide');
    }
}

function ListarTecnologiasProducto(productoId, fn = null) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/ListadoByProducto?productoId=" + productoId,
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

function VerificarDiferenciaDeDatos() {

    let tec = ObtenerDataFormulario();
    let a = false;

    $.ajax({
        url: URL_API_VISTA + "/VerificarDiferenciaDeDatos",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(tec),
        dataType: "json",

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject;
                    a = data;
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });

    return a;
}

function IrObtenerResponsablesApExp(Id) {
    $("#titleForm").html("Configurar responsables");
    $("#txtMatricula").val("");
    $("#ddlTipo").val("-1");
    $.ajax({
        url: URL_API_VISTA + `/ObtenerAplicacionExperto?Id=${Id}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditRegistro(true);
            $("#hdId").val(Id);
            $tableApExp.bootstrapTable("destroy");
            $tableApExp.bootstrapTable({ data: result });
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function InitAutocompletarBuilderLocal2($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);
                //alert(urlControllerWithParams);
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
            
            $IdBox.val(ui.item.mail);
            $("#hdCorreoResponsablePrincipal").val(ui.item.mail);
            $("#hdMatriculaResponsablePrincipal").val(ui.item.matricula);
            $("#hdTipoExperto").val(parseInt($("#ddlTipoExperto").val()));
            $(".field-tecnologia").addClass("ignore");
            $searchBox.removeClass("ignore");
            let data = $tableApExp.bootstrapTable("getData");

            if ($("#frmResponsabilidades").valid()) {
                let index = data.length + 1;
                $tableApExp.bootstrapTable("append", {
                    Id: index,
                    ManagerMatricula: $("#hdMatriculaResponsablePrincipal").val(),
                    ManagerNombre: $("#txtMatriculaExperto").val(),
                    ManagerEmail: $("#hdCorreoResponsablePrincipal").val(),
                    ProductoManagerId: parseInt($("#ddlTipoExperto").val()),
                    ProductoManagerStr: $("#ddlTipoExperto option:selected").text(),
                    Registro: 0, // 1: proviene de base de datos, 0: se agrega en tiempo real
                    //FlagEliminado: false
                });

                $IdBox.val("");
                $searchBox.val("");
            }
            $(".field-tecnologia").removeClass("ignore");
            $searchBox.addClass("ignore");

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function addItemExperto() {

    $(".inputMatriculaExperto").removeClass("ignore");
    $(".guardarExperto").addClass("ignore");

    //if ($("#formRegistroExperto").valid()) {
        AgregarExperto();
    //}
}

function AgregarExperto() {
    let matricula = $("#txtMatriculaExperto").val();
    var estItem = $tableApExp.bootstrapTable('getRowByUniqueId', matricula);
    
    if (estItem === null) {
        var dataTmp = $tableApExp.bootstrapTable('getData');
        var idx = 0;
        var ultId = dataTmp.length === 0 ? (1 * -1000) : dataTmp[dataTmp.length - 1].Id;
        ultId = ultId === null ? 0 : ultId;
        idx = ultId > 0 ? dataTmp.length * -1000 : ultId - 1000;

        $tableApExp.bootstrapTable('append', {
            Id: idx,
            CodApp: $("#hdIdExperto").val(),
            Activo: true,
            ActivoDetalle: "Activo",
            Matricula: $("#hdMatriculaResponsablePrincipal").val(),
            Nombres: $("#txtMatriculaExperto").val(),
            TipoExpertoId: parseInt($("#ddlTipoExperto").val()),
            TipoExpertoToString: $("#ddlTipoExperto option:selected").text(),
            FlagEliminado: false
        });
    } else {
        bootbox.alert("La matrícula no se debe repetir en el cuadro de responsables");
    }
}

function ValidarCamposExperto() {

    $.validator.addMethod("existeMatricula", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            estado = ExisteMatricula();
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("requiredMinExperto", function (value, element) {
        let minRegistro = $tableApExp.bootstrapTable('getData');
        let estado = minRegistro.length > 0 ? true : false;
        return estado;
    });


    $("#formRegistroExperto").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtMatriculaExperto: {
                requiredSinEspacios: true
            },
            ddlTipoExperto: {
                requiredSelect: true
            },
            msjValid: {
                requiredMinExperto: true
            }
        },
        messages: {
            txtMatriculaExperto: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el correo electrónico")
            },
            ddlTipoExperto: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo")
            },
            msjValid: {
                requiredMinExperto: String.Format("Debes agregar {0}.", "un responsable como mínimo")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtMatricula") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function InitTables() {
    $tableApExp.bootstrapTable("destroy");
    $tableApExp.bootstrapTable({ data: [] });
}

function opcionesFormatterApExp(value, row) {
    let eliminar = `<a class='btn btn-danger' href='javascript: void(0)' onclick='removerExperto("${row.Id}","${row.ProductoManagerId}","${row.ManagerMatricula}","${row.Registro}")'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return eliminar;
}

function removerExperto(expertoId, tipoExpertoId, matriculaExperto, registro) {

   let index = DATA_EXPERTOS.findIndex(x => x.Id == expertoId);
   if (index != -1) {
        DATA_EXPERTOS.splice(index, 1);
   }
   expertoId = parseInt(expertoId);

   $tableApExp.bootstrapTable('remove', {
       field: 'Id', values: [expertoId]
   });
   
}

function removeItemExperto(AEid, TEId) {
    bootbox.confirm({
        title: "Eliminar Responsable",
        message: "¿Estás seguro que deseas eliminar al responsable de la aplicación?",
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
                let data = {
                    AppExpId: AEid,
                    TipExpId: TEId
                };

                let existe = ITEMS_REMOVEID.find(x => x.AppExpId === AEid && x.TipExpId === TEId) || null;
                if (existe === null) {
                    ITEMS_REMOVEID.push(data);
                }

                $tableApExp.bootstrapTable('removeByUniqueId', AEid);

                

            }
        }
    });
}

function guardarDesactivacion() {
    
    LimpiarValidateErrores($("#formTecDesactivar")); 

    let tec = {};
    tec.Id = ($("#hdTecnologiaId").val() === "") ? 0 : parseInt($("#hdTecnologiaId").val());
    tec.MotivoDesactivacionId = $("#cbMotivoEliminacion").val();
    tec.MotivoDesactivacion = $("#txtMotivoDesactivacion").val(); 
    var motivo_desactivacion = tec.MotivoDesactivacion.length; 

    if (motivo_desactivacion <= 250) {
        if ($("#formTecDesactivar").valid()) {
            if ($("#cbMotivoEliminacion").val() == "-1") {
                return false;
            }
            bootbox.confirm({
                title: TITULO_MENSAJE_SOL,
                message: MENSAJE_SOL3,
                buttons: SET_BUTTONS_BOOTBOX,
                callback: function (result) {
                    if (result !== null && result) {
                        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

                        $.ajax({
                            url: URL_API_VISTA + "/EnviarSolicitudAprobacionDesactivacion",
                            type: "POST",
                            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(tec),
                            dataType: "json",
                            success: function (result) {
                                var response = result;
                                if (response) {
                                    toastr.success("La solicitud para eliminar esta tecnología se registró correctamente.", TITULO_MENSAJE_SOL);
                                }
                                else {
                                    toastr.error('Ocurrio un problema durane el registro. Por favor, revisar.', TITULO_MENSAJE);
                                }

                            },
                            complete: function () {
                                $("#btnGuardarDesactivacion").button("reset");
                                waitingDialog.hide();
                                OpenCloseModal($("#mdTecnologiaDesactivar"), false);
                            },
                            error: function (xhr, ajaxOptions, thrownError) {
                                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                            }
                        });

                    }
                }
            });
        }
    } else {
        toastr.error('No puede superar la longitud máxima de caracteres. Por favor, revisar.', TITULO_MENSAJE);
    }

    
}

function ObtenerDataFormularioDesactivacion() {
    let tec = {};
    tec.Id = ($("#hdTecnologiaId").val() === "") ? 0 : parseInt($("#hdTecnologiaId").val());
   
    tec.MotivoDesactivacion = $("#txtMotivoDesactivacion").val();

    var motivo_desactivacion = tec.MotivoDesactivacion.length;

    return tec;
}

function ExisteRelacionTecnologia(TecnologiaId) {
    let estado = false;
    //let Id = $hdId.val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Tecnologia/ExisteRelacionByTecnologia?Id=${TecnologiaId}`,
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

function ExisteInstanciasTecnologia(TecnologiaId) {
    let estado = false;
    //let Id = $hdId.val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Tecnologia/ExisteInstanciasTecnologia?Id=${TecnologiaId}`,
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

function cbSquadIdProducto_Change() {
    
    let codigoUnidad = $("#cbSquadIdProducto").val();
    let data = LIST_SQUAD.find(x => x.Id == codigoUnidad);

    if (codigoUnidad != -1)
    {
        if (data != null) {
            $("#hdOwnerIdTecnologia").val(data.CodigoPersonalResponsable);
            $("#txtOwnerDisplayNameTecnologia").val(data.NombresPersonalResponsable);
            $("#hdOwnerMatriculaTecnologia").val(data.MatriculaPersonalResponsable);
        }
    }
    else
    {
        $("#hdOwnerIdTecnologia").val("");
        $("#txtOwnerDisplayNameTecnologia").val("");
        $("#hdOwnerMatriculaTecnologia").val("");

    }
}

function ExportarRestricciones() {
    let idTecnologia = $("#hdTecnologiaId").val();
   
    let url = `${URL_API_VISTA}/ReporteRestriccionesTecnologia?tecnologiaId=${idTecnologia}`;
    $.ajax({
        url: url,
        type: 'GET',
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

function getValidListData(key, value) {
    var result = -1;

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Tecnologia/GetValidateListData?key=${key}&value=${value}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (key == 'domain') result = (dataObject.Id == 0 ? -1 : dataObject.Id);
                if (key == 'subdomain') result = (dataObject.Id == 0 ? -1 : dataObject.Id);
                if (key == 'productType') result = (dataObject.Id == 0 ? -1 : dataObject.Id);
                if (key == 'licensingScheme') result = (dataObject.Id == 0 ? -1 : dataObject.Id);
                if (key == 'techonologytype') result = (dataObject.Id == 0 ? -1 : dataObject.Id);
                if (key == 'automationImplemented') result = (dataObject.Id == 0 ? -1 : dataObject.Id);
                if (key == 'motiveSustenance') result = (dataObject.Descripcion == null || dataObject.Descripcion == "" ? -1 : dataObject.Descripcion);
                if (key == 'fuente') result = (dataObject.Id == 0 ? -1 : dataObject.Id);
                if (key == 'calculationdate') result = (dataObject.Id == 0 ? -1 : dataObject.Id);
                if (key == 'platformapplies') result = (dataObject.Descripcion == null || dataObject.Descripcion == "" ? -1 : dataObject.Descripcion);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    }); 
    return result;
}

function detailFormatter(index, row) {
    //OPCIONES = ' <th data-formatter="opciones2Formatter" data-field="Opciones2" data-halign="center" data-valign="middle" data-align="center" data-width="30%">Opciones</th>\'';
    //OPCIONES +
    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="1%">#</th>\
                                    <th data-formatter="formatOpcSTD" data-field="OpcGeneral" data-halign="center" data-valign="middle" data-align="center" data-width="2%" class="opcTecnologia">Acciones</th>\
                                    <th data-formatter="formatAccesoDirecto" data-field="OpcAccesoDirecto" data-halign="center" data-valign="middle" data-align="center" data-width="2%" class="accesoDirecto">Acceso directo</th>\
                                    <th data-field="ClaveTecnologia" data-halign="center" data-valign="middle" data-align="left" data-width="50%">Tecnología</th>\
                                    <th data-field="TipoTecnologiaStr" data-halign="center" data-valign="middle" data-align="left" data-width="20%">Estado de Estandarización</th>\
                                    <th data-field="FechaFinSoporteToString" data-halign="center" data-valign="middle" data-align="left" data-width="10%">Fecha Fin Soporte</th>\
                                    <th data-field="EstadTecnologia" data-halign="center" data-valign="middle" data-align="left" data-width="10%">Estado de Tecnología</th>\
                                </tr>\
                              </thead>\
                              </table>', row.Id);
    return html;
}


function ListarAlertasDetalle(row, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado/TecnologiasByProducto",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'ClaveTecnologia',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.prodId = row.ProductoId;
            PARAMS_API.nombre = $.trim($("#txtBusTec").val());
            PARAMS_API.tipoTecIds = $.isArray($("#cbFilTipoTec").val()) ? $("#cbFilTipoTec").val() : [$("#cbFilTipoTec").val()]; //$("#cbFilTipoTec").val();
            PARAMS_API.estObsIds = $.isArray($("#cbFilEstObs").val()) ? $("#cbFilEstObs").val() : [$("#cbFilEstObs").val()];//$("#cbFilEstObs").val();
            PARAMS_API.pageNumber = p.pageNumber;
            PARAMS_API.pageSize = p.pageSize;
            PARAMS_API.sortName = p.sortName;
            PARAMS_API.sortOrder = p.sortOrder;

            return JSON.stringify(PARAMS_API);
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


function _validar(_datos) {
    var _return = true;
    var _array = Array.isArray(_datos);
    var _cantDatos = _array ? _datos.length : 1;

    for (var i = 0; i < _cantDatos; i++) {
        var _input = _array ? _datos[i] : _datos;

        var _id = _input.id;
        var _valor = _input.value.trim();
        var _tipo = _input.type;

        if (_tipo == 'text') {
            if (_valor.length == 0 || _valor == '' || _valor == null) {
                _return = false;
            }
        } else if (_tipo == 'select-one') {
            if (_valor == '-1' || _valor == '' || _valor == null) {
                _return = false;
            }
        } else if (_tipo == 'textarea') {
            if (_valor.length == 0 || _valor == '' || _valor == null) {
                _return = false;
            }
        }
    }
    return _return;
}

/*
function FlagRestringido_Change() {
    let flagRestringido = $("#chkFlagEstadoRestringido").prop("checked");
    let className = "hidden";
    if (flagRestringido) {
        $("li a[href='#datApl']").parent().removeClass(className);
        $("#datApl").removeClass(className);
    }
    if (!flagRestringido) {
        $("li a[href='#datApl']").parent().addClass(className);
        $("#datApl").addClass(className);
    }

}*/

function ValidarTecReemplazo(_IdTec) {
    var valida = false;
    var IdTec = _IdTec;
    var estadoEstandarizacion;
    var estadoTecnologia;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Tecnologia/" + IdTec,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            estadoEstandarizacion = result.TipoTecnologiaId;
            estadoTecnologia = result.EstadoId;
            if (estadoEstandarizacion != 1) { valida = false; }
            else if ((estadoEstandarizacion == 1) && ((estadoTecnologia == 1) || (estadoTecnologia == 4))) { valida = true; }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false

    });
    return valida;
}

function ValidarEstados(_EstadoEstandarizacion, _EstadoTecnologia) {
    var valida = false;
    var estadoEstandarizacion = _EstadoEstandarizacion;
    var estadoTecnologia = _EstadoTecnologia;
    if ((estadoEstandarizacion == 1 || estadoEstandarizacion == 4) && estadoTecnologia == 4) { valida = true; }
    else if ((estadoEstandarizacion == 1 || estadoEstandarizacion == 4) && estadoTecnologia == 2) { valida = true; }
    else if ((estadoEstandarizacion == 1 || estadoEstandarizacion == 10 || estadoEstandarizacion == 11) && estadoTecnologia == 1) { valida = true; }
    else if ((estadoEstandarizacion == 1 || estadoEstandarizacion == 4) && estadoTecnologia == 3) { valida = true; }
    return valida;
}