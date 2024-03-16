var $table = $("#tbl-tecAprob");
var $tblTecnologias = $("#tbl-tecnologias");
var $tblAutorizador = $("#tblAutTec");
var $tblArqAprob = $("#tblArqAprob");
var $tblTecEq = $("#tblTecEq");
var $tblTecnologiaVinculacion = $("#tblTecnologiaVinculacion");
var $tblTecEqList = $("#tblTecEqList");
var $tblTecEqGeneral = $("#tblTecEqGeneral");
var $tblArquetipos = $("#tbl-arquetipos");
var $tblAplicaciones = $("#tbl-aplicaciones");
var $tableRoles = $("#tblRoles");
var $tableFunciones = $("#tblFunciones");

var ItemsRemoveAutId = [];
var ItemsRemoveTecEqId = [];
var ItemsRemoveTecArqId = [];
var ItemsRemoveTecVincId = [];
var ARR_APLICATECNOLOGIA = [];

var URL_API_VISTA = URL_API + "/Tecnologia";
var urlApiSubdom = URL_API + "/Subdominio";
var urlApiTipo = URL_API + "/Tipo";
var urlApiFam = URL_API + "/Familia";
var URL_API_VISTA_DASH = URL_API + "/Dashboard/Tecnologia";
const NO_APLICA = "NO APLICA";
//var URL_API_USUARIO = URL_API + "/Usuario";

var ItemNumeros = [0, 1, 2, 3, 4, 5];
var locale = { OK: 'OK', CONFIRM: 'Observar', CANCEL: 'Cancelar' };
var placeholderObs = "Comentarios asociados a la observación";
var LIST_SUBDOMINIO = [];
var DATA_SUBDOMINIO = [];
var DATA_TECNOLOGIA = [];
var DATA_APLICACION = [];
var DATA_PRODUCTO = [];
var DATA_EQUIVALENCIA = [];

var LIST_RESPONSABLE = [];
var LIST_ARQUETIPO = [];
var LIST_APLICACION = [];
var LIST_SQUAD = [];
var LIST_EQUIVALENCIA = [];

var DATA_EXPORTAR = {};
var DATA_EXPORTAR_TEC_EQ = {};
var ESTADO = { Vigente: 1, Deprecado: 2, Obsoleto: 3 };
var ESTADO_TECNOLOGIA = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var CODIGO_INTERNO = 0;
const TITULO_MENSAJE = "Gestión de las Tecnologías";
const TITULO_MENSAJE_APROBACION = "Aprobar tecnología";
const TITULO_MENSAJE_OBSERVACION = "Observar tecnología";
const TITULO_MENSAJE_EQUIVALENCIA = "Equivalencia de tecnología";
var DATOS_RESPONSABLE = {};

var TIPO_METODO = { APROBAR: 1, GUARDARCAMBIOS: 2, OBSERVAR: 3 };
var ACCESO_DIRECTO = { BASICO: "1", CICLOVIDA: "2", RIESGO: "3", RESPONSABILIDADES: "5", EQUIVALENCIAS: "6", FAMILIA: "7" };
//var ACCESO_DIRECTO = { BASICO: "1", CICLOVIDA: "2", RIESGO: "3", CLASIFICACION: "4", RESPONSABILIDADES: "5", EQUIVALENCIAS: "6", FAMILIA: "7" };
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

const TEXTO_IR_SITIO = "[Ir al sitio]";
const ICONO_ENLACE = "<span class='icon icon-external-link'></span>";

$(function () {
    //INICIALIZACION DE COMBOS
    InitMultiSelect();
    SetItemsCustomField([], $("#cbSquadIdSearch"), TEXTO_SELECCIONE, "Id", "Descripcion");

    validarFormCambiarEstado();
    validarFormMigrarEquivalencias();
    /*$("#datGen :input").attr("pos-tab", 0);
    $("#datTran :input").attr("pos-tab", 1);
    $("#resp :input").attr("pos-tab", 2);
    $("#aprob :input").attr("pos-tab", 3); */
    InitFecha();
    initUpload($('#txtCasoUsoArchivoTecnologia'));

    $tblTecnologias.bootstrapTable();
    $tblAutorizador.bootstrapTable();
    $tblTecEq.bootstrapTable();
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

    $("#cbTipTec").on('change', function () {
        LimpiarValidateErrores($("#formAddOrEditTec"));
        var valRiesgo = $("option:selected", this).text() === "Estándar" ? "0" : "5";
        $("#cbRiesgTec").val(valRiesgo);
    });

    validarAddOrEditFormTec();
    validarFormEquivalencias();
    validarFormEquivalenciasTec();

    FormatoCheckBox($("#divFlagEquivalencias"), "chkFlagEquivalencias");
    $("#chkFlagEquivalencias").change(FlagEquivalencias_Change);
    FormatoCheckBox($("#divFlagMostrarSiteEstandares"), "chkFlagMostrarSiteEstandares");
    //$("#chkFlagMostrarSiteEstandares").change(FlagMostrarSiteE_Change);
    FormatoCheckBox($("#divFlagFechaFinSoporte"), "chkFlagFechaFinSoporte");
    $("#chkFlagFechaFinSoporte").change(FlagFechaFinSoporte_Change);
    $("#chkFlagFechaFinSoporte").trigger("change");

    FormatoCheckBox($("#divFlagNuevoProducto"), "chkFlagNuevoProducto");
    $("#chkFlagNuevoProducto").change(() => {
        let nuevo = $("#chkFlagNuevoProducto").prop("checked");
        let accionCollapse = nuevo == true ? "show" : "hide";
        if (nuevo) $("#accordionNuevoProducto").removeClass("hidden");
        else $("#accordionNuevoProducto").addClass("hidden");
        $("#collapseOne").collapse(accionCollapse);
        $("#txtProductoIdTecnologia").attr("readonly", nuevo);


        let data = $tblAplicaciones.bootstrapTable("getData");

        MostrarCampoObligatorio("#txtProductoIdTecnologia", ".form-group", !nuevo);
        MostrarCampoObligatorio("#txtFabricanteProducto", ".form-group", nuevo);
        MostrarCampoObligatorio("#txtNombreProducto", ".form-group", nuevo);
        MostrarCampoObligatorio("#cbDominioIdProducto", ".form-group", nuevo);
        MostrarCampoObligatorio("#cbSubDominioIdProducto", ".form-group", nuevo);
        MostrarCampoObligatorio("#cbTipoProductoIdProducto", ".form-group", nuevo);
        MostrarCampoObligatorio("#txtTribuCoeDisplayNameProducto", ".form-group", nuevo && data.length == 0);
        MostrarCampoObligatorio("#txtDescripcionTecnologia", ".form-group", nuevo);
        MostrarCampoObligatorio("#txtCodigoProductosTecnologia", ".form-group", nuevo);
        if (nuevo == true) {
            //$("#cbProductoIdTecnologia").val("-1").trigger("change");
            $("#txtProductoIdTecnologia").val("");
            $("#hdProductoIdTecnologia").val("");
            $("#txtFabricanteProducto").val("");
            $("#txtNombreProducto").val("");
            $("#txtDescripcionTecnologia").prop("readonly", false);
            $("#cbDominioIdProducto").val(-1).trigger("change");
            $("#cbTipoProductoIdProducto").val(-1);
            $("#txtTribuCoeDisplayNameProducto").val("");
            $("#hdTribuCoeIdProducto").val("");

            $("#txtGrupoTicketRemedyTecnologia").val('');
            $("#hdGrupoTicketRemedyIdTecnologia").val('');
            $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val(-1);
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
    $("#cbFuenteTec").on('change', cbFecSopManual_Change);

    //Confirmar familia
    //FormatoCheckBox($("#divConfirmarFamilia"), 'cbFlagConfirmarFamilia');
    //$("#cbFlagConfirmarFamilia").change(FlagConfirmarFamilia_Change);


    $("#cbFechaCalculosTecnologia").change(FechaCalculo_Change);

    $("#cbTipoTecnologiaIdTecnologia").change(CbTipoTecnologiaIdTecnologiaChange);
    $("#cbTipoProductoIdProducto").change(CbTipoProductoIdProductoChange);

    listarTecSTD();

    cargarCombos();
    CargarCombos2();

    //$("#cbProductoIdTecnologia").change(CbProductoIdTecnologia_Change);
    $("#cbDominioIdProducto").change(CargarSubDominio);
    $("#cbSubDominioIdProducto").change(CbSubDominioIdProducto_Change);

    let params = new URLSearchParams(window.location.search);
    let modal = params.get("modal");
    if ((modal || '') == 'mdAddOrEditTec') {
        addTecSTD();
        let productoId = params.get("id");
        $("#cbProductoIdTecnologia").val(productoId).trigger("change");
    }

    setDefaultHd($("#txtTecReceptora"), $("#hdTecReceptora"));

    //InitAutocompletarFamilia($("#txtFamTec"), $("#hFamTecId"), $(".famContainer"));
    //InitAutocompletarFamilia($("#cbFilFam"), null, $(".famfilContainer"));
    InitAutocompletarTribuCoeProducto($("#txtTribuCoeDisplayNameProducto"), $("#hdTribuCoeIdProducto"), '.tribuCoeContainer', TribuCoeProductoOnSelect)
    //InitAutocompletarSquadProducto($("#txtSquadDisplayNameProducto"), $("#hdSquadIdProducto"), '.squadContainer')

    InitAutocompletarProducto($("#txtProductoIdTecnologia"), $("#hdProductoIdTecnologia"), ".productoContainer");
    InitAutocompletarProductoSearch($("#txtProductoBusTec"), $("#hdnProductoBusTec"), ".searchProductoContainer");
    //InitAutocompletarAutorizadorTecnologia($("#txtAutorizadorTecnologia"), $("#hdAutorizadorIdTecnologia"), ".autorizadorContainer");
    InitAutocompletarGrupoTicketRemedy($("#txtEquipoAprovisionamientoTecnologia"), $("#hdMatriculaEquipoAprovisionamiento"), ".equipoAprovisionamientoContainer");
    InitAutocompletarGrupoTicketRemedy($("#txtGrupoTicketRemedyTecnologia"), $("#hdGrupoTicketRemedyIdTecnologia"), ".grupoTicketRemedyTecnologiaContainer");
    //InitAutocompletarArquetipoTecnologia($("#txtArquetipoTecnologia"), $("#hdArquetipoIdTecnologia"), ".arquetipoContainer");
    InitAutocompletarAplicacionTecnologia($("#txtAplicacionTecnologia"), $("#hdAplicacionIdTecnologia"), ".aplicacionContainer");
    InitAutocompletarTecnologia($("#txtRoadMapTecnologia"), $("#hdnRoadMapTecnologia"), $(".roadMapContainer"));
    InitAutocompletarTecnologia($("#txtBusTec"), $("#hdnBusTec"), $(".searchContainer"));
    //InitAutocompletarAplicacion($("#txtApp"), $("#hdIdApp"), $(".appContainer"));
    //InitAutocompletarArquetipo($("#txtArqTec"), $("#hdIdArq"), $(".arqContainer"));
    //InitAutocompletarTecnologia($("#txtElimTec"), $("#hdTecnologiaIdObs"), $(".elimContainer"));
    //InitAutocompletarTecnologiaVinculada($("#txtTecnologiaVinculadad"), $("#hdTecnologiaIdnologiaVinculada"), $(".tecVinculadaContainer"));
    InitAutocompletarTecnologiaEquivalente($("#txtNomTecEq"), null, $(".eqContainer"));
    InitAutocompletarTecnologiaEquivalente($("#txtNomEqTec"), null, $(".eqTecContainer"));
    InitAutocompletarTribuCoeProducto($("#txtFilTribuCoeStr"), $("#hdFilTribuCoeId"), '.ownerTribuContainer', TribuCoeProductoOnSelectSearch, `${URL_API}/it-management/plataform-operations/v2/siga/unidadorganizativa/relaciontecnologia/listarcomboxfiltro`, TribuCoeProductoClear)
    //InitAutocompletarBuilderLocal($("#txtFilTribuCoeStr"), $("#hdFilTribuCoeId"), ".ownerTribuContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
    //InitAutocompletarBuilderLocal($("#cbSquadIdSearch"), $("#hdFilResponsableSquadId"), ".ownerSquadContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");

    //InitAutocompletarTecnologiaForBusqueda($("#txtBusTec"), null, $(".searchContainer"), null, true);
    //InitAutocompletarTecnologiaForBusqueda($("#txtTecReceptora"), $("#hdTecReceptora"), $(".tecReceptoraContainer"), $("#hdTecnologiaId"), true);

    //InitAutocompletarProducto($("#txtProductoTecnologia"), $("#hdProductoIdTecnologia"), $(".productoContainer"));
    $("#txtProductoIdTecnologia").change((e) => {
        let value = $("#txtProductoIdTecnologia").val();
        if (value.trim() == "") $("#hdProductoIdTecnologia").val("");
    });
    $("#txtFabricanteProducto").keyup(txtFabricanteProducto_KeyUp);
    $("#txtNombreProducto").keyup(txtNombreProducto_KeyUp);

    $("#txtVersionTecnologia, #txtFabricanteTecnologia, #txtNombreTecnologia").keyup(SetearClaveTecnologia);

    //$("#txtFabricanteTec, #txtNomTec, #txtVerTec").keyup(function () {
    //    $("#txtClaveTecnologia").val(String.Format("{0} {1} {2}", $.trim($("#txtFabricanteTec").val()), $.trim($("#txtNomTec").val()), $.trim($("#txtVerTec").val())));
    //});
    //$("#txtMatAutTec").keyup(function () {
    //    if ($.trim($(this).val()) === "") {
    //        LimpiarValidateErrores($("#formAddOrEditTec"));
    //    }
    //});

    setDefaultUrl($("#txtUrlConfluence"));
    validarFormImportar();

    InitAutocompleteResponsables();
    InitHiddenAutocomplete();

    $("#btnResp01, #btnResp02, #btnResp03").click(validarMatriculaResponsable);
});

function MostrarCampoObligatorio(id, closest, show) {
    let elclosest = $(id).closest(closest);
    if (elclosest.length > 0) elclosest.find(".text-danger").html(show ? "(*)" : "");
};

function CbTipoProductoIdProductoChange() {
    let tipoProductoId = $("#cbTipoProductoIdProducto").val();
    $("#cbTipoTecnologiaIdTecnologia").val(tipoProductoId).trigger("change");
}

function CbTipoTecnologiaIdTecnologiaChange() {
    let tipoProductoId = $("#cbTipoProductoIdProducto").val();
    let tipoTecnologiaId = $("#cbTipoTecnologiaIdTecnologia").val();
    let esEditableEsquemaLicenciamiento = tipoProductoId == tipoIdEstandarRestringido && tipoTecnologiaId == tipoIdEstandarRestringido;
    $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").prop("disabled", !esEditableEsquemaLicenciamiento);
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
}

function TribuCoeProductoOnSelect(ui) {
    $("#hdOwnerIdTecnologia").val(ui.item.CodigoPersonalResponsable);
    $("#txtOwnerDisplayNameTecnologia").val(ui.item.NombresPersonalResponsable);
    $("#hdOwnerMatriculaTecnologia").val(ui.item.MatriculaPersonalResponsable);
    cbTribuCoeIdProducto_Change();
}

function TribuCoeProductoOnSelectSearch(ui) {
    cbTribuCoeIdProductoSearch_Change();
}

function TribuCoeProductoClear() {
    SetItemsCustomField([], $("#cbSquadIdSearch"), TEXTO_SELECCIONE, "Id", "Descripcion");
}

function InitAutocompletarTribuCoeProducto($searchBox, $IdBox, $container, fn = null, url = null, fnClear = null) {
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
                //$("#hdOwnerIdProducto").val(ui.item.CodigoPersonalResponsable);
                //$("#txtOwnerDisplayNameTecnologia").val(ui.item.NombresPersonalResponsable);
                //$("#hdOwnerMatriculaTecnologia").val(ui.item.MatriculaPersonalResponsable);
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

            LimpiarValidateErrores($("#formAddOrEditTec"));
            $IdBox.val(ui.item.IdAplicacion);
            $(".field-tecnologia").addClass("ignore");
            $searchBox.removeClass("ignore");
            let data = $tblAplicaciones.bootstrapTable("getData");
            if ($("#formAddOrEditTec").valid()) {
                let index = data.length + 1;
                debugger;
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

            //LimpiarValidateErrores($("#formTecnologia"));
            $IdBox.val(ui.item.Id);
            //$(".field-tecnologia-app").removeClass("ignore");
            //$(".field-tecnologia").addClass("ignore");
            //if ($("#formTecnologia").valid()) {
            let data = $tblArquetipos.bootstrapTable("getData");
            let index = data.length + 1;
            $tblArquetipos.bootstrapTable("append", {
                Id: ui.item.Id,
                Nombre: ui.item.Descripcion
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

function txtFabricanteProducto_KeyUp() {
    let fabricante = $("#txtFabricanteProducto").val();
    $("#txtFabricanteTecnologia").val(fabricante).trigger("keyup");
}

function txtNombreProducto_KeyUp() {
    let nombre = $("#txtNombreProducto").val();
    $("#txtNombreTecnologia").val(nombre).trigger("keyup");
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
        LimpiarValidateErrores($("#formAddOrEditTec"));
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
        #divFechaFinInternaTecnologia`).datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
    //$("#dpFecExtTec-btn").datetimepicker({
    //    locale: 'es',
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    //$("#dpFecSopTec-btn").datetimepicker({
    //    locale: 'es',
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    //$("#dpFecIntTec-btn").datetimepicker({
    //    locale: 'es',
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
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

    //Tab 3
    tec.Dueno = $("#txtDueTec").val() || "";
    tec.EqAdmContacto = $("#txtEqAdmTec").val() || "";
    tec.GrupoSoporteRemedy = $("#txtGrupRemTec").val() || "";
    tec.ConfArqSeg = $("#txtConfArqSegTec").val() || "";
    tec.ConfArqTec = $("#txtConfArqTec").val() || "";
    tec.EncargRenContractual = $("#txtRenConTec").val() || "";
    tec.EsqLicenciamiento = $("#txtEsqLinTec").val() || "";
    tec.SoporteEmpresarial = $("#txtSopEmpTec").val() || "";

    //tec.ListAutorizadores = $tblAutorizador.bootstrapTable('getData') || [];
    //tec.ItemsRemoveAutId = ItemsRemoveAutId || [];

    tec.ItemsRemoveAutIdSTR = ItemsRemoveAutId.join("|") || "";
    tec.ItemsAddAutorizadorSTR = $tblAutorizador.bootstrapTable('getData').map(x => x.MatriculaBanco).join("|") || "";

    return tec;
}

function ObtenerDataFormulario() {
    let flagNuevoProducto = $("#chkFlagNuevoProducto").prop("checked");
    let tec = {};
    tec.Id = ($("#hdTecnologiaId").val() === "") ? 0 : parseInt($("#hdTecnologiaId").val());
    tec.ProductoId = ($("#hdProductoIdTecnologia").val() == "-1" || $("#hdProductoIdTecnologia").val() == "" || $("#hdProductoIdTecnologia").val() == "0") ? null : parseInt($("#hdProductoIdTecnologia").val());

    if (flagNuevoProducto) {
        tec.Producto = {};
        tec.Producto.EstadoObsolescenciaId = estadoObsolescenciaIdVigente;
        tec.Producto.Fabricante = $("#txtFabricanteProducto").val();
        tec.Producto.Nombre = $("#txtNombreProducto").val();
        tec.Producto.Descripcion = $("#txtDescripcionTecnologia").val();
        tec.Producto.DominioId = $("#cbDominioIdProducto").val();
        tec.Producto.SubdominioId = $("#cbSubDominioIdProducto").val();
        tec.Producto.TipoProductoId = $("#cbTipoProductoIdProducto").val();
        tec.Producto.Codigo = $("#txtCodigoProductosTecnologia").val();

        tec.Producto.TribuCoeDisplayName = $("#txtTribuCoeDisplayNameProducto").val();
        tec.Producto.TribuCoeId = $("#hdTribuCoeIdProducto").val();
        tec.Producto.SquadId = $("#cbSquadIdProducto").val() == "-1" ? null : $("#cbSquadIdProducto").val();
        tec.Producto.SquadDisplayName = tec.Producto.SquadId == null ? null : $("#cbSquadIdProducto option:selected").text();
        tec.Producto.OwnerDisplayName = $("#txtOwnerDisplayNameTecnologia").val();
        tec.Producto.OwnerId = $("#hdOwnerIdTecnologia").val();
        tec.Producto.OwnerMatricula = $("#hdOwnerMatriculaTecnologia").val();
        tec.Producto.GrupoTicketRemedyNombre = $("#txtGrupoTicketRemedyTecnologia").val();
        tec.Producto.GrupoTicketRemedyId = $("#hdGrupoTicketRemedyIdTecnologia").val() == "" || $("#hdGrupoTicketRemedyIdTecnologia").val() == "0" ? null : $("#hdGrupoTicketRemedyIdTecnologia").val();
        tec.Producto.EsquemaLicenciamientoSuscripcionId = $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val() == "-1" ? null : $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val();
    }
    tec.Fabricante = $("#txtFabricanteTecnologia").val();
    tec.Nombre = $("#txtNombreTecnologia").val();
    tec.Versiones = $("#txtVersionTecnologia").val();
    tec.ClaveTecnologia = $("#txtClaveTecnologia").val();
    tec.Descripcion = $("#txtDescripcionTecnologia").val();
    tec.FlagSiteEstandar = $("#chkFlagMostrarSiteEstandares").prop("checked");
    //tec.FlagSiteEstandar = $("#cbFlagSiteEstandarTecnologia").val() == "-1" ? null : $("#cbFlagSiteEstandarTecnologia").val();
    tec.FlagTieneEquivalencias = $("#chkFlagEquivalencias").prop("checked");
    tec.MotivoId = $("#cbMotivoIdTecnologia").val() == "-1" ? null : $("#cbMotivoIdTecnologia").val();
    tec.TipoTecnologiaId = $("#cbTipoTecnologiaIdTecnologia").val();
    tec.CodigoProducto = $("#txtCodigoProductosTecnologia").val();
    tec.AutomatizacionImplementadaId = $("#cbAutomatizacionImplementadaIdTecnologia").val();
    tec.RevisionSeguridadId = $("input[name='rbtRevisionSeguridadIdTecnologia']:checked").val();
    tec.RevisionSeguridadDescripcion = $("#txtRevisionSeguridadDescripcionTecnologia").val();
    tec.FechaLanzamiento = $("#txtFechaLanzamientoTecnologia").val() == "" ? null : castDate($("#txtFechaLanzamientoTecnologia").val());
    tec.FlagFechaFinSoporte = $("#chkFlagFechaFinSoporte").prop("checked");
    tec.Fuente = !tec.FlagFechaFinSoporte ? null : $("#cbFuenteTecnologia").val() == "-1" ? null : $("#cbFuenteTecnologia").val();
    tec.FechaCalculoTec = !tec.FlagFechaFinSoporte || $("#cbFechaCalculosTecnologia").val() == "-1" ? null : $("#cbFechaCalculosTecnologia").val();
    //tec.FechaCalculoBase = !tec.FlagFechaFinSoporte || $("#txtFechaCalculoTecnologia").val() == "" ? null : castDate($("#txtFechaCalculoTecnologia").val());
    tec.FechaExtendida = !tec.FlagFechaFinSoporte || $("#txtFechaFinExtendidaTecnologia").val() == "" ? null : castDate($("#txtFechaFinExtendidaTecnologia").val());
    tec.FechaFinSoporte = !tec.FlagFechaFinSoporte || $("#txtFechaFinSoporteTecnologia").val() == "" ? null : castDate($("#txtFechaFinSoporteTecnologia").val());
    tec.FechaAcordada = !tec.FlagFechaFinSoporte || $("#txtFechaFinInternaTecnologia").val() == "" ? null : castDate($("#txtFechaFinInternaTecnologia").val());
    tec.TipoFechaInterna = !tec.FlagFechaFinSoporte || $("#cbTipoFechaInternaTecnologia").val() == "-1" ? null : $("#cbTipoFechaInternaTecnologia").val();
    tec.ComentariosFechaFin = !tec.FlagFechaFinSoporte || $("#txtComentariosFechaFinSoporteTecnologia").val() == "" ? null : $("#txtComentariosFechaFinSoporteTecnologia").val();
    tec.SustentoMotivo = tec.FlagFechaFinSoporte || $("#cbSustentoMotivoFechaFinSoporteTecnologia").val() == "-1" ? null : $("#cbSustentoMotivoFechaFinSoporteTecnologia").val();
    tec.SustentoUrl = tec.FlagFechaFinSoporte || $("#txtSustentoUrlFechaFinSoporteTecnologia").val() == "" ? "" : $("#txtSustentoUrlFechaFinSoporteTecnologia").val();
    tec.UrlConfluenceId = $("input[name='rbtUrlConfluenceIdTecnologia']:checked").val();
    tec.UrlConfluence = $("#txtUrlConfluenceTecnologia").val();
    //tec.CasoUsoArchivo = $("#").val();
    tec.CasoUso = $("#txtCasoUsoTecnologia").val();
    tec.Aplica = $("#cbPlataformaAplicaIdTecnologia").val() == "-1" ? null : $("#cbPlataformaAplicaIdTecnologia").val();
    tec.CompatibilidadSOId = $("#cbCompatibilidadSOIdTecnologia").val() == null ? null : $("#cbCompatibilidadSOIdTecnologia").val().join(",");
    tec.CompatibilidadCloudId = $("#cbCompatibilidadCloudIdTecnologia").val() == null ? null : $("#cbCompatibilidadCloudIdTecnologia").val().join(",");
    tec.Requisitos = $("#txtRequisitosHWSWTecnologia").val();
    tec.Existencia = $("#cbConocimientoIdTecnologia").val() == "-1" ? null : $("#cbConocimientoIdTecnologia").val();
    tec.Riesgo = $("#cbRiesgoObsolescenciaIdTecnologia").val() == "-1" ? null : $("#cbRiesgoObsolescenciaIdTecnologia").val();
    tec.Facilidad = $("#cbFacilidadActualizacionIdTecnologia").val() == "-1" ? null : $("#cbFacilidadActualizacionIdTecnologia").val();
    tec.Vulnerabilidad = $("#cbVulnerabilidadSeguridadTecnologia").val() == "-1" ? null : $("#cbVulnerabilidadSeguridadTecnologia").val();
    //Fin Tab 1

    tec.SubdominioId = tec.ProductoId == null ? $("#cbSubDominioIdProducto").val() : $("#hdnSubDominioIdTecnologia").val();
    tec.RoadmapOpcional = $("#hdnRoadMapTecnologia").val();
    tec.Referencias = $("#txtReferenciaTecnologia").val();
    tec.PlanTransConocimiento = $("#txtPlanTransferenciaConocimientoTecnologia").val();
    tec.EsqMonitoreo = $("#txtEsquemaMonitoreoTecnologia").val();
    tec.EsqPatchManagement = $("#txtDefinicioEsquemaPatchMangementTecnologia").val();
    //Fin Tab 2

    //tec.Dueno = $("#hdOwnerMatriculaTecnologia").val();
    tec.Dueno = $("#txtOwnerDisplayNameTecnologia").val();
    tec.EqAdmContacto = $("#txtEquipoAdministracionTecnologia").val();
    tec.GrupoSoporteRemedy = $("#txtGrupoTicketRemedyTecnologia").val();
    //tec.GrupoSoporteRemedy = $("#hdGrupoTicketRemedyIdProducto").val();
    tec.ConfArqSeg = $("#txtConformidadArquitectoSeguridadTecnologia").val();
    tec.ConfArqTec = $("#txtConformidadArquitectoTecnologia").val();
    tec.EncargRenContractual = $("#txtEncargadoRenovacionContractualTecnologia").val();
    tec.EsqLicenciamiento = $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val() == "-1" ? null : $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val();
    tec.SoporteEmpresarial = $("#txtCoordinacionSoporteEmpresarialTecnologia").val();
    tec.EquipoAprovisionamiento = $("#txtEquipoAprovisionamientoTecnologia").val();

    //tec.CasoUsoArchivoFile = $("#flCasoUsoArchivoTecnologia")[0].files.length > 0 ? $("#flCasoUsoArchivoTecnologia")[0].files[0] : null;
    let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
    let flagTieneArchivo = $("#txtCasoUsoArchivoTecnologia").val() !== TEXTO_SIN_ARCHIVO;
    tec.ArchivoId = archivoId == 0 && flagTieneArchivo ? null : archivoId;

    tec.ListAplicaciones = $tblAplicaciones.bootstrapTable("getData");
    tec.ItemsRemoveAppId = LIST_APLICACION.map(x => x.Id).filter(x => !tec.ListAplicaciones.map(y => y.Id).some(y => y == x));
    tec.ListAplicaciones = tec.ListAplicaciones.filter(x => x.Id == null);
    //tec.ListAutorizadores = $tblAutorizador.bootstrapTable("getData");
    //tec.ListArquetipo = $tblArquetipos.bootstrapTable("getData").map(x => x.Arquetipo);
    tec.ListEquivalencias = DATA_EQUIVALENCIA.map(x => x).filter(x => x.Id < 0);
    tec.ItemsRemoveEqTecId = LIST_EQUIVALENCIA.map(x => x.Id).filter(x => !DATA_EQUIVALENCIA.map(y => y.Id).some(y => y == x));

    return tec;
}

function guardarAddOrEditTecSTD() {
    let frmValido = $("#formAddOrEditTec").valid();
    if (frmValido) {
        InsertarTecnologia();
    } else {
        toastr.error('Faltan completar campos', TITULO_MENSAJE);
    }
}

function InsertarTecnologia() {
    $("#btnGuardarTec").button("loading");

    let tec = ObtenerDataFormulario();
    //tec.FlagCambioEstado = true;

    $.ajax({
        url: URL_API_VISTA + "/New",
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
                    UploadFile($("#flCasoUsoArchivoTecnologia"), CODIGO_INTERNO, data, archivoId);
                }
                bootbox.alert({
                    size: "sm",
                    title: "Registro",
                    message: "La información se registró con éxito",
                    //message: "La información se registró con éxito, ten en cuenta que esta acción no inicia ningún proceso de revisión por parte del equipo de Estándares",
                    callback: function () { /* your callback code */ }
                });
            }
        },
        complete: function () {
            mdAddOrEditTec(false);
            $("#btnRegTecSTD").button("reset");
            LimpiarFiltros();
            listarTecSTD();
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

function cbFecSopManual_Change() {
    var cbFuente = parseInt($(this).val());
    //debugger;
    LimpiarValidateErrores($("#formAddOrEditTec"));
    if (cbFuente !== 3)
        $("#FecSopManualContainer").addClass("tec");
    else
        $("#FecSopManualContainer").removeClass("tec");
}

function FlagEquivalencias_Change() {
    let checked = $("#chkFlagEquivalencias").prop("checked");
    $("#cbMotivoIdTecnologia").prop("disabled", checked);
    if (checked) {
        $("#btnAgregarEquivalencia").removeClass("hidden");
        $("#cbMotivoIdTecnologia option:first").prop("selected", true);
    }
    else $("#btnAgregarEquivalencia").addClass("hidden");
}

function FlagFechaFinSoporte_Change() {
    let flagFechaFinSoporte = $("#chkFlagFechaFinSoporte").prop("checked");
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

function cbFuente_Change() {
    let fuenteId = $("#cbFuenteTecnologia").val();
    let readonly = fuenteId != 3;
    $("#txtFechaFinExtendidaTecnologia, #txtFechaFinSoporteTecnologia, #txtFechaFinInternaTecnologia").attr("readonly", readonly);
    $("#cbTipoFechaInternaTecnologia").attr("disabled", readonly);
    if (readonly) $("#txtFechaFinExtendidaTecnologia, #txtFechaFinSoporteTecnologia, #txtFechaFinInternaTecnologia").val("");
    if (readonly) $("#cbTipoFechaInternaTecnologia").val("-1");
}

function FlagFecSop_Change() {
    var flagFecSop = $(this).prop("checked");//.is(':checked');
    LimpiarValidateErrores($("#formAddOrEditTec"));
    //$(".form-control").removeClass("ignore");
    //$(".matricula-auto").addClass("ignore");
    //$("#formAddOrEditTec").validate().resetForm();
    //$("#formAddOrEditTec").valid();
    if (flagFecSop)
        $("#FinSoporte").removeClass("tec");
    else
        $("#FinSoporte").addClass("tec");
}

function FlagApp_Change() {
    var flagApp = $(this).prop("checked");
    LimpiarValidateErrores($("#formAddOrEditTec"));
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
                else if (element.name == 'cbTipoFechaInternaTecnologia' && $("#cbFechaCalculosTecnologia").val() == "4")
                    return $.trim(value) !== "-1";
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

    $.validator.addMethod("existeClaveTecnologia", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            let estado = false;
            estado = !ExisteClaveTecnologia();
            return estado;
        }
        return estado;
    });

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
        //let estado = minRegistro.length > 0 ? true : false;
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
        debugger;
        let existeAplicacionEnLista = data.some(x => x.AplicacionId == aplicacionId);

        return !existeAplicacionEnLista;
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

    $("#formAddOrEditTec").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtProductoIdTecnologia: { requiredSelectProductoId: true, requiredSelectProductoIdNuevo: true },
            txtFabricanteProducto: { requiredSinEspaciosFromNuevoProducto: true, },
            txtNombreProducto: { requiredSinEspaciosFromNuevoProducto: true, },
            cbDominioIdProducto: { requiredSelectFromNuevoProducto: true },
            cbSubDominioIdProducto: { requiredSelectFromNuevoProducto: true },
            cbTipoProductoIdProducto: { requiredSelectFromNuevoProducto: true },
            txtTribuCoeDisplayNameProducto: { validarCodigoTribuCoeFromNuevoProducto: true },

            txtNombreTecnologia: {
                requiredSinEspacios: true,
            },
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
                requiredSelectFromNuevoProducto: true
            },
            txtCodigoProductosTecnologia: {
                requiredSelectFromNuevoProducto: true
            },
            //txtFechaLanzamientoTecnologia: {
            //    requiredSinEspacios: true,
            //},
            txtFechaFinExtendidaTecnologia: {
                fecha_tecnologia: true,
            },
            txtFechaFinSoporteTecnologia: {
                fecha_tecnologia: true,
            },
            txtFechaFinInternaTecnologia: {
                fecha_tecnologia: true,
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
            msjValidTblAplicacion: {
                requiredMinAplicacion: true,
            }

            //txtNomTec: {
            //    requiredSinEspacios: true
            //},
            //txtVerTec: {
            //    requiredSinEspacios: true
            //},
            //txtDesTec: {
            //    requiredSinEspacios: true
            //},
            ////msjValidTbl: {
            ////    requiredMinMatricula: true
            ////},
            ////dpFecLanTec: {
            ////    fecha_tecnologia: true
            ////},
            //dpFecExtTec: {
            //    fecha_tecnologia: true
            //},
            //dpFecSopTec: {
            //    fecha_tecnologia: true
            //},
            //dpFecIntTec: {
            //    fecha_tecnologia: true
            //},
            //cbFuenteTec: {
            //    combo_fecha_tecnologia: true
            //},
            //cbFechaCalculosTecnologia: {
            //    combo_fecha_tecnologia: true
            //},
            //cbExisTec: {
            //    requiredSelect: true
            //},
            //cbFacAcTec: {
            //    requiredSelect: true
            //},
            //cbRiesgTec: {
            //    requiredSelect: true
            //},
            //txtVulTec: {
            //    requiredSinEspacios: true,
            //    decimal_vulnerabilidad: true
            //},
            //txtCusTec: {
            //    requiredSinEspacios: true
            //},
            //txtApp: {
            //    flagActivoAplicacion: true,
            //    //requiredSinEspacios: true,
            //    existeAplicacion: true
            //},
            //cbDomTec: {
            //    requiredSinEspacios: true
            //},
            //txtSubTec: {
            //    requiredSelect: true
            //    //requiredSinEspacios: true,
            //    //existeSubdominio: true
            //},
            //txtElimTec: {
            //    //requiredSinEspacios: true,
            //    existeTecnologia: false
            //},
            ////txtPlanTransTec: {
            ////    requiredSinEspacios: true
            ////},
            ////txtEsqMonTec: {
            ////    requiredSinEspacios: true
            ////},
            ////txtLinSegTec: {
            ////    requiredSinEspacios: true
            ////},
            ////txtPatManTec: {
            ////    requiredSinEspacios: true
            ////},
            //txtDueTec: {
            //    requiredSinEspacios: true,
            //    //existeMatricula: true
            //},
            ////txtEqAdmTec: {
            ////    requiredSinEspacios: true
            ////},
            ////txtGrupRemTec: {
            ////    requiredSinEspacios: true
            ////},
            //txtConfArqSegTec: {
            //    requiredSinEspacios: true,
            //    //existeMatricula: true
            //},
            //txtConfArqTec: {
            //    requiredSinEspacios: true,
            //    //existeMatricula: true
            //},
            ////txtRenConTec: {
            ////    requiredSinEspacios: true
            ////},
            ////txtEsqLinTec: {
            ////    requiredSinEspacios: true
            ////},
            ////txtSopEmpTec: {
            ////    requiredSinEspacios: true
            ////},
            //txtMatAutTec: {
            //    //requiredSinEspacios: true,
            //    existeMatricula: true
            //},
            //txtFamTec: {
            //    requiredSinEspacios: true,
            //    existeFamilia2: true
            //},
            //cbTipTec: {
            //    requiredSelect: true
            //},
            ////cbTipo: {
            ////    requiredSelect: true
            ////},
            //txtArqTec: {
            //    existeArquetipo: false
            //},
            //txtCodAsigTec: {
            //    requiereCodigoTecnologia: true
            //},
            ////txtUrlConfluence: {
            ////    url: true
            ////},
            //txtFabricanteTec: {
            //    requiredSinEspacios: true
            //},
            //txtClaveTecnologia: {
            //    existeClaveTecnologia: true
            //}
        },
        messages: {
            txtProductoIdTecnologia: { requiredSelectProductoId: 'No debe seleccionar ningun producto.', requiredSelectProductoIdNuevo: 'Debe seleccionar un producto.' },
            txtFabricanteProducto: { requiredSinEspaciosFromNuevoProducto: 'Debe ingresar un fabricante.' },
            txtNombreProducto: { requiredSinEspaciosFromNuevoProducto: 'Debe ingresar un nombre.' },
            cbDominioIdProducto: { requiredSelectFromNuevoProducto: 'Debe seleccionar un dominio.' },
            cbSubDominioIdProducto: { requiredSelectFromNuevoProducto: 'Debe seleccionar un subdominio.' },
            cbTipoProductoIdProducto: { requiredSelectFromNuevoProducto: 'Debe seleccionar un tipo de producto.' },
            txtTribuCoeDisplayNameProducto: { validarCodigoTribuCoeFromNuevoProducto: String.Format("Debe seleccionar {0}.", "el Tribu/COE") },

            txtNombreTecnologia: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "un nombre"),
            },
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
                requiredSelectFromNuevoProducto: String.Format("Debes ingresar {0}.", "una descripción")
            },
            txtCodigoProductosTecnologia: {
                requiredSelectFromNuevoProducto: String.Format("Debes ingresar {0}.", "un código de producto")
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
            //txtComentariosFechaFinSoporteTecnologia: {
            //    fecha_tecnologia: String.Format("Debes ingresar {0}.", "un comentario asociado a la fecha fin de soporte de tecnología"),
            //},
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
            msjValidTblAplicacion: {
                requiredMinAplicacion: String.Format("Debes agregar {0}.", "una aplicación como mínimo")
            }

            //txtNomTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre de la tecnología")
            //},
            //txtVerTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "las versiones")
            //},
            //txtDesTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción de la tecnología")
            //},
            ////msjValidTbl: {
            ////    requiredMinMatricula: String.Format("Debes registrar {0}.", "un item")
            ////},
            ////dpFecLanTec: {
            ////    fecha_tecnologia: String.Format("Debes ingresar {0}.", "la fecha de lanzamiento")
            ////},
            //dpFecExtTec: {
            //    fecha_tecnologia: String.Format("Debes ingresar {0}.", "la fecha extendida")
            //},
            //dpFecSopTec: {
            //    fecha_tecnologia: String.Format("Debes ingresar {0}.", "la fecha fin de soporte")
            //},
            //dpFecIntTec: {
            //    fecha_tecnologia: String.Format("Debes ingresar {0}.", "la fecha interna")
            //},
            //cbFuenteTec: {
            //    //requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //    combo_fecha_tecnologia: String.Format("Debes seleccionar {0}.", "una fuente")
            //},
            //cbFechaCalculosTecnologia: {
            //    combo_fecha_tecnologia: String.Format("Debes seleccionar {0}.", "una fecha para cálculo")
            //},
            //cbExisTec: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //cbFacAcTec: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //cbRiesgTec: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //txtVulTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la vulnerabilidad de seguridad"),
            //    decimal_vulnerabilidad: "Número de 0 a 5. Considerar solo dos decimales."
            //},
            //txtCusTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el caso de uso")
            //},
            //txtApp: {
            //    flagActivoAplicacion: String.Format("Debes ingresar {0}.", "la aplicación"),
            //    //requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
            //    existeAplicacion: String.Format("{0} seleccionada no existe.", "La aplicación")
            //},
            //cbDomTec: {
            //    requiredSinEspacios: String.Format("Debes seleccionar {0}.", "el dominio")
            //},
            //txtSubTec: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "el subdominio")
            //    //requiredSinEspacios: String.Format("Debes ingresar {0}.", "el subdominio"),
            //    //existeSubdominio: String.Format("{0} seleccionado no existe.", "el subdominio")
            //},
            //txtElimTec: {
            //    //requiredSinEspacios: String.Format("Debes ingresar {0}.", "la tecnología obsoleta"),
            //    existeTecnologia: String.Format("{0} seleccionado no existe.", "La tecnología")
            //},
            ////txtPlanTransTec: {
            ////    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el plan de transferencia de conocimiento")
            ////},
            ////txtEsqMonTec: {
            ////    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el esquema de monitoreo")
            ////},
            ////txtLinSegTec: {
            ////    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la linea base de seguridad")
            ////},
            ////txtPatManTec: {
            ////    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la definición del esquema de path management")
            ////},
            //txtDueTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el dueño de la tecnología"),
            //    //existeMatricula: "No fue posible ubicar la matrícula"
            //},
            ////txtEqAdmTec: {
            ////    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el equipo de administración y punto de contacto")
            ////},
            ////txtGrupRemTec: {
            ////    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el grupo de soporte")
            ////},
            //txtConfArqSegTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la conformidad del arquitecto de seguridad"),
            //    //existeMatricula: "No fue posible ubicar la matrícula"
            //},
            //txtConfArqTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la conformidad del arquitecto de tecnología"),
            //    //existeMatricula: "No fue posible ubicar la matrícula"
            //},
            ////txtRenConTec: {
            ////    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el encargado de renovación contractual")
            ////},
            ////txtEsqLinTec: {
            ////    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el esquema de licenciamiento")
            ////},
            ////txtSopEmpTec: {
            ////    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el soporte empresarial")
            ////},
            //txtMatAutTec: {
            //    //requiredSinEspacios: String.Format("Debes ingresar {0}.", "la matrícula"),
            //    existeMatricula: "No fue posible ubicar la matrícula"
            //},
            //txtFamTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "una familia"),
            //    //existeFamilia: String.Format("{0} seleccionada no existe.", "la familia")
            //    existeFamilia2: String.Format("{0} ingresada ya existe", "La familia")
            //},
            //cbTipTec: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo de tecnología")
            //},
            ////cbTipo: {
            ////    requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo")
            ////},
            //txtArqTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el arquetipo"),
            //    existeArquetipo: String.Format("{0} seleccionado no existe.", "El arquetipo")
            //},
            //txtCodAsigTec: {
            //    requiereCodigoTecnologia: String.Format("Debes ingresar {0}.", "el código de tecnología")
            //},
            ////txtUrlConfluence: {
            ////    url: String.Format("Debes ingresar {0}.", "la url")
            ////},
            //txtFabricanteTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el fabricante")
            //},
            //txtClaveTecnologia: {
            //    existeClaveTecnologia: "Clave de la tecnología ya existe."
            //}
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtFechaLanzamientoTecnologia" || element.attr('name') === "txtFechaFinExtendidaTecnologia"
                || element.attr('name') === "txtFechaFinSoporteTecnologia" || element.attr('name') === "txtFechaFinInternaTecnologia"
                || element.attr('name') === "txtDueTec" || element.attr('name') === "txtConfArqSegTec" || element.attr('name') === "txtConfArqTec"
                || element.attr('name') === "txtMatAutTec"
                || element.attr('name') === "cbProductoIdTecnologia") {
                element.parent().parent().append(error);
            } else if (element.attr('name') === "txtProductoIdTecnologia") {
                element.parent().parent().parent().parent().append(error);
            } else {
                element.parent().append(error);
            }

            //let elclosed = element.closest(".form-group");
            //if (elclosed.length > 0) elclosed.find("label .text-danger").html("(*)");
        }
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

    $("#formTecByArq").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomTecEq: {
                requiredSinEspacios: true,
                validarRegistrado: true
            }
        },
        messages: {
            txtNomTecEq: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "una equivalencia"),
                validarRegistrado: "La equivalencia ya se encuentra registrada"
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
    limpiarMdAddOrEditTec();
    LimpiarValidateErrores($("#formAddOrEditTec"));
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
    $("#cbTipoProductoIdProducto").val("-1");
    $("#txtVersionTecnologia").val("");
    $("#txtClaveTecnologia").val("");
    $("#txtDescripcionTecnologia").val("");
    $("#txtDescripcionTecnologia").val("");
    $("#chkFlagMostrarSiteEstandares").prop("checked", false).trigger("change");
    //$("#cbFlagSiteEstandarTecnologia").val("-1");
    $("#chkFlagEquivalencias").prop("checked", false).trigger("change");;
    $("#cbMotivoIdTecnologia").val("-1");
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
    $("#cbTipoFechaInternaTecnologia").val("-1");
    $("#cbSustentoMotivoFechaFinSoporteTecnologia").val("-1");
    $("#txtSustentoUrlFechaFinSoporteTecnologia").val("");
    $("input[name='rbtUrlConfluenceIdTecnologia']:first").prop("checked", true);
    $("#txtUrlConfluenceTecnologia").val("");
    $("#txtCasoUsoTecnologia").val("");
    $("#cbPlataformaAplicaIdTecnologia").val("-1");
    $("#cbCompatibilidadSOIdTecnologia").multiselect("clearSelection");
    $("#cbCompatibilidadCloudIdTecnologia").multiselect("clearSelection");
    $("#txtRequisitosHWSWTecnologia").val("");
    $("#cbConocimientoIdTecnologia").val("-1");
    $("#cbRiesgoObsolescenciaIdTecnologia").val("-1");
    $("#cbFacilidadActualizacionIdTecnologia").val("-1");
    $("#cbVulnerabilidadSeguridadTecnologia").val("-1");
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
    $("#txtEquipoAdministracionTecnologia").val("");
    $("#hdGrupoTicketRemedyIdProducto").val("");
    $("#hdArquitectoSeguridad").val("");
    $("#hdArquitectoTecnologia").val("");
    $("#txtEncargadoRenovacionContractualTecnologia").val("");
    $("#txtEsquemaLicenciamientoTec").val("");
    $("#txtCoordinacionSoporteEmpresarialTecnologia").val("");
    $("#txtEquipoAprovisionamientoTecnologia").val("");

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
        url: URL_API_VISTA + "/ListadoCatalogo",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.prodId = $("#hdnProductoBusTec").val() == "" ? null : $("#hdnProductoBusTec").val();
            //DATA_EXPORTAR.prodId = $("#cbProductoIdBus").val() == "-1" ? null : $("#cbProductoIdBus").val();
            DATA_EXPORTAR.nombre = $.trim($("#txtBusTec").val());
            DATA_EXPORTAR.domIds = $.isArray($("#cbFilDom").val()) ? $("#cbFilDom").val() : [$("#cbFilDom").val()];// $("#cbFilDom").val();
            DATA_EXPORTAR.subdomIds = $.isArray($("#cbFilSub").val()) ? $("#cbFilSub").val() : [$("#cbFilSub").val()]; //$("#cbFilSub").val();
            DATA_EXPORTAR.casoUso = $("#txtCasoUsoTec").val();
            DATA_EXPORTAR.estadoIds = $.isArray($("#cbFilEst").val()) ? $("#cbFilEst").val() : [$("#cbFilEst").val()]; //$("#cbFilEst").val();
            DATA_EXPORTAR.famId = $("#cbFilFam").val();
            DATA_EXPORTAR.fecId = $("#cbFilEsFecSop").val();
            DATA_EXPORTAR.aplica = $("#txtFilAplica").val() === "-1" ? "" : $("#txtFilAplica").val();
            DATA_EXPORTAR.codigo = $("#txtFilCodigo").val();
            DATA_EXPORTAR.dueno = $("#txtFilDueno").val() == null ? "" : $("#txtFilDueno").val();
            DATA_EXPORTAR.tribuCoeStr = $("#txtFilTribuCoeStr").val();
            DATA_EXPORTAR.squadStr = $("#cbSquadIdSearch").val() == -1 ? "" : $("#cbSquadIdSearch option:selected").text();
            //DATA_EXPORTAR.equipo = $("#txtFilEquipo").val();
            DATA_EXPORTAR.tipoTecIds = $.isArray($("#cbFilTipoTec").val()) ? $("#cbFilTipoTec").val() : [$("#cbFilTipoTec").val()]; //$("#cbFilTipoTec").val();
            DATA_EXPORTAR.estObsIds = $.isArray($("#cbFilEstObs").val()) ? $("#cbFilEstObs").val() : [$("#cbFilEstObs").val()];//$("#cbFilEstObs").val();
            DATA_EXPORTAR.flagActivo = FLAG_ACTIVO_TECNOLOGIA;//$("#cbFilEstObs").val();
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
            message: "¿Estás seguro que deseas desactivar el registro seleccionado?",
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
            message: "No es posible desactivar el registro ya que tiene equivalencias activas",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    }
}

function formatNombre(value, row, index) {
    let editFromId = EDIT_TEC_FROM.NOMBRE;
    return `<a href="javascript:editarTecSTD(${row.Id}, ${row.Estado}, ${editFromId})" title="Editar">${value}</a>`;
}

function formatOpcSTD(value, row, index) {
    let style_color = row.Estado === ESTADO_TECNOLOGIA.APROBADO ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:cambiarEstado(${row.Id})" title="Desactivar tecnología"><i class="iconoVerde glyphicon glyphicon-${type_icon}"></i></a>`;
    //let estado = '';

    let equivalencia = `  <a href='javascript: void (0)' class="${style_color}" onclick='irEquivalencias(${row.Id}, "${row.Nombre}", "${row.EstadoTecnologiaStr}", ${row.Activo})' title='Equivalencias'>` +
        `<span class="icon icon-list-ul"></span>` +
        `</a >`;

    let estadoTec = `  <a href='javascript: void (0)' class="${style_color}" onclick='irCambiarEstadoTec(${row.Id}, ${row.Estado}, "${row.EstadoTecnologiaStr}", ${row.Activo})' title='Cambiar estado aprobación'>` +
        `<span class="icon icon-rotate-right"></span>` +
        `</a >`;

    let migrarEquivalencia = `  <a href='javascript: void (0)' class="${style_color}" onclick='irMigrarEquivalencias(${row.Id}, ${row.Estado}, "${row.EstadoTecnologiaStr}", ${row.Activo}, ${row.FlagTieneEquivalencias})' title='Migrar equivalencias'>` +
        `<span class="icon icon-exchange"></span>` +
        `</a >`;

    let migrarInfoTec = `  <a href='javascript: void (0)' class="iconoVerde" onclick='irMigrarInfoTecnologia(${row.Id}, ${row.Estado}, "${row.EstadoTecnologiaStr}", ${row.Activo})' title='Migrar información tecnología'>` +
        `<span class="icon icon-copy"></span>` +
        `</a >`;



    return estado.concat(equivalencia).concat(migrarEquivalencia).concat(migrarInfoTec);
    //return estado.concat(estadoTec).concat(equivalencia).concat(migrarEquivalencia).concat(migrarInfoTec);
}

function formatAccesoDirecto(value, row, index) {

    //let style_color = row.Estado === ESTADO_TECNOLOGIA.APROBADO ? 'iconoVerde ' : "iconoRojo ";
    let permiso = row.Estado === ESTADO_TECNOLOGIA.APROBADO ? "" : "disabled";

    //let combo = ` <select id="cbAccesoDirecto${row.Id}" name="cbAccesoDirecto${row.Id}" onchange='irAccesoDirecto(${row.Id}, "${row.Nombre}", ${row.Estado})' class="form-control" ${permiso}>\
    //                <option value = "-1"> -- Seleccione --</option>\
    //                <option value = "1">Datos básicos</option>\
    //                <option value = "2">Fechas ciclo de vida</option>\
    //                <option value = "3">Criterios riesgo</option>\
    //                <option value = "4">Clasificación</option>\
    //                <option value = "5">Responsabilidades</option>\
    //                <option value = "6">Equivalencias</option>\
    //                <option value = "7">Familia / Tipo / Estado</option>\
    //              </select >`;

    let combo = ` <select id="cbAccesoDirecto${row.Id}" name="cbAccesoDirecto${row.Id}" onchange='irAccesoDirecto(${row.Id}, "${row.Nombre}", ${row.Estado})' class="form-control" ${permiso}>\
                    <option value = "-1"> -- Seleccione --</option>
                    <option value = "1">Datos básicos</option>
                    <option value = "2">Fechas ciclo de vida</option>
                    <option value = "3">Criterios riesgo</option>
                    <option value = "5">Responsabilidades</option>
                    <option value = "6">Equivalencias</option>
                  </select >`;

    //let icono = `  <a href='javascript: void (0)' class="${style_color}" onclick='irAccesoDirecto(${row.Id}, "${row.Nombre}", ${row.Estado})' title='Acceso directo'>` +
    //    `<span class="glyphicon glyphicon-log-out"></span>` +
    //    `</a >`;
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
    $(".otros").show();
    $(".footerModalTecnologia").show();

    $(".inputOpcional").hide();
}

function irAccesoDirecto(Id, NombreStr, EstadoTecnologiaId) {
    let editFromId = EDIT_TEC_FROM.ACCESO_DIRECTO;
    COMBO_SELECTED = String.Format("#cbAccesoDirecto{0}", Id);
    let filtro = $(COMBO_SELECTED).val();

    if (filtro !== "-1") {
        //$(".tabs-tecnologia").hide();
        //$(".tabs-tecnologia li").parent().show();
        switch (filtro) {
            case ACCESO_DIRECTO.BASICO:
                editarTecSTD(Id, EstadoTecnologiaId, editFromId);
                $(".otros").hide();

                $(".form-control").addClass("ignore");
                $(".adBasico").removeClass("ignore");

                //$(".tabs-tecnologia").show();
                //$(".tabs-tecnologia li > a([href='#datCla']), a([href='#datRes'])").parent().hide();
                $('a[data-toggle="tab"]')[0].click();
                $(".adBasico").show();
                $(".adRiesgo").hide();
                $(".adCicloVida").hide();
                $(".adClasificacion").hide();
                $(".adResponsabilidad").hide();
                $(".adFamilia").hide();

                $("#FinSoporte").hide();
                $(".footerModalTecnologia").hide();

                break;
            case ACCESO_DIRECTO.CICLOVIDA:
                editarTecSTD(Id, EstadoTecnologiaId, editFromId);
                $(".otros").hide();

                $(".form-control").addClass("ignore");
                $(".adCicloVida").removeClass("ignore");

                $('a[data-toggle="tab"]')[0].click();
                $("#FinSoporte").show();
                $(".adCicloVida").show();
                $(".adBasico").hide();
                $(".adRiesgo").hide();
                $(".adClasificacion").hide();
                $(".adResponsabilidad").hide();
                $(".adFamilia").hide();

                if ($("#cbFechaCalculosTecnologia").val() !== "-1") {
                    $("#cbFechaCalculosTecnologia").trigger("change");
                }
                $(".footerModalTecnologia").hide();

                break;
            case ACCESO_DIRECTO.RIESGO:
                editarTecSTD(Id, EstadoTecnologiaId, editFromId);
                $(".otros").hide();

                $(".form-control").addClass("ignore");
                $(".adRiesgo").removeClass("ignore");

                $(".adRiesgo").show();
                $(".adBasico").hide();
                $(".adCicloVida").hide();
                $(".adClasificacion").hide();
                $(".adResponsabilidad").hide();
                $(".adFamilia").hide();

                $("#FinSoporte").hide();
                $(".footerModalTecnologia").hide();

                break;
            case ACCESO_DIRECTO.CLASIFICACION:
                editarTecSTD(Id, EstadoTecnologiaId, editFromId);
                $(".otros").hide();

                $(".form-control").addClass("ignore");
                $(".adClasificacion").removeClass("ignore");

                $(".adBasico").hide();
                $(".adCicloVida").hide();
                $(".adRiesgo").hide();
                $('a[data-toggle="tab"]')[1].click();
                $(".adClasificacion").show();
                $(".adResponsabilidad").hide();
                $(".adFamilia").hide();

                $("#FinSoporte").hide();
                $(".footerModalTecnologia").hide();

                break;
            case ACCESO_DIRECTO.RESPONSABILIDADES:
                editarTecSTD(Id, EstadoTecnologiaId, editFromId);
                $(".otros").hide();

                $(".form-control").addClass("ignore");
                $(".adResponsabilidad").removeClass("ignore");

                $(".adBasico").hide();
                $(".adCicloVida").hide();
                $(".adRiesgo").hide();
                $(".adClasificacion").hide();
                $(".adFamilia").hide();
                $('a[data-toggle="tab"]')[2].click();
                $(".adResponsabilidad").show();

                $("#FinSoporte").hide();
                $(".footerModalTecnologia").hide();

                break;
            case ACCESO_DIRECTO.EQUIVALENCIAS:
                $("#hdTecnologiaId").val(Id);
                $("#txtNomTecEq").val('');
                $("#spNomTec").html(NombreStr);
                LimpiarValidateErrores($("#formTecByArq"));
                ItemsRemoveTecEqId = [];

                listarTecnologiasEquivalentes($tblTecEq, $("#mdTecEq"));
                //listarTecnologiasEquivalentes($tblTecEqList, $("#mdTecEqList"));
                break;
            case ACCESO_DIRECTO.FAMILIA:
                editarTecSTD(Id, EstadoTecnologiaId, editFromId);
                $(".otros").hide();

                $(".form-control").addClass("ignore");
                $(".adFamilia").removeClass("ignore");

                $(".adFamilia").show();
                $(".inputOpcional").show();
                $(".adBasico").hide();
                $(".adRiesgo").hide();
                $(".adCicloVida").hide();
                $(".adClasificacion").hide();
                $(".adResponsabilidad").hide();

                $("#FinSoporte").hide();
                $(".footerModalTecnologia").hide();

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

        $(".btnRegTecSTD").hide();
        $(".btnConTec").hide();
        $(".btnGuardarTec").hide();

        $(".cbAprob").removeClass("ignore");
        $(".tabRegSTD").removeClass("tec");
    }

    if (estadoId === ESTADO_TECNOLOGIA.APROBADO) {
        $(".btnAprTec").hide();
        $(".btnObsTec").hide();

        $(".btnRegTecSTD").hide();
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

        $(".btnRegTecSTD").show();
        $(".btnConTec").show();

        $(".cbAprob").addClass("ignore");
        $(".tabRegSTD").addClass("tec");
    }

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    ItemsRemoveAutId = [];
    //$tblAutorizador.bootstrapTable('destroy');
    //$tblAutorizador.bootstrapTable();

    $("#titleFormTec").html("Editar Registro Tecnología");
    $.ajax({
        url: URL_API_VISTA + "/New/" + TecId + `?withAutorizadores=true&withArquetipos=true&withAplicaciones=true&withEquivalencias=true`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            waitingDialog.hide();
            mdAddOrEditTec(true);
            //Tab 1
            //$("#hdTecnologiaId").val(result.Id); //Id Tecnologia
            //getTecnologias2();
            //$("#hActTec").val(result.Activo); //Valor activo
            //$("#hIdSubTec").val(result.SubdominioId); //Id Subdominio
            //$("#hdTecnologiaIdObs").val(result.EliminacionTecObsoleta === null ? "" : result.EliminacionTecObsoleta);  //Id Tec Obsoleta
            //$("#hEstTec").val(result.EstadoTecnologia); //Flag estado tecnologia

            $("#hdTecnologiaId").val(result.Id);
            //$("#cbProductoIdTecnologia").val(result.ProductoId == null ? "-1" : result.ProductoId);
            $("#hdProductoIdTecnologia").val(result.ProductoId == null ? "-1" : result.ProductoId);
            if (result.Producto != null) $("#txtProductoIdTecnologia").val(result.Producto.Fabricante + ' ' + result.Producto.Nombre);
            $("#txtFabricanteTecnologia").val(result.Fabricante);
            $("#txtNombreTecnologia").val(result.Nombre);
            $("#txtVersionTecnologia").val(result.Versiones);
            $("#txtClaveTecnologia").val(result.ClaveTecnologia);
            $("#txtDescripcionTecnologia").val(result.Descripcion);
            $("#txtDescripcionTecnologia").attr("data-nombre", result.Nombre);
            $("#chkFlagMostrarSiteEstandares").prop("checked", result.FlagSiteEstandar == null ? false : result.FlagSiteEstandar).trigger("change");
            //$("#cbFlagSiteEstandarTecnologia").val(result.FlagSiteEstandar == null ? "-1" : result.FlagSiteEstandar);
            $("#chkFlagEquivalencias").prop("checked", result.FlagTieneEquivalencias).trigger("change");
            $("#cbMotivoIdTecnologia").val(result.MotivoId == null ? "-1" : result.MotivoId);
            $("#cbTipoTecnologiaIdTecnologia").val(result.TipoTecnologiaId).trigger("change");
            $("#txtCodigoProductosTecnologia").val(result.CodigoProducto);
            $("#cbAutomatizacionImplementadaIdTecnologia").val(result.AutomatizacionImplementadaId == null ? "-1" : result.AutomatizacionImplementadaId);
            $("input[name='rbtRevisionSeguridadIdTecnologia'][value='" + (result.RevisionSeguridadId || "2") + "']").prop("checked", true).trigger("change");
            $("#txtRevisionSeguridadDescripcionTecnologia").val(result.RevisionSeguridadDescripcion);
            $("#txtFechaLanzamientoTecnologia").val(result.FechaLanzamiento == null ? "" : (new Date(result.FechaLanzamiento)).toLocaleString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' }));
            $("#chkFlagFechaFinSoporte").prop("checked", result.FlagFechaFinSoporte).trigger("change");
            if (result.FlagFechaFinSoporte) $("#cbFuenteTecnologia").val(result.Fuente == null ? "-1" : result.Fuente).trigger("change");
            //debugger;
            if (result.FlagFechaFinSoporte) $("#cbFechaCalculosTecnologia").val(result.FechaCalculoTec == null ? "-1" : result.FechaCalculoTec).trigger("change");
            if (result.FlagFechaFinSoporte) $("#txtFechaFinExtendidaTecnologia").val(result.FechaExtendida == null ? "" : (new Date(result.FechaExtendida)).toLocaleString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' }));
            if (result.FlagFechaFinSoporte) $("#txtFechaFinSoporteTecnologia").val(result.FechaFinSoporte == null ? "" : (new Date(result.FechaFinSoporte)).toLocaleString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' }));
            if (result.FlagFechaFinSoporte) $("#txtFechaFinInternaTecnologia").val(result.FechaAcordada == null ? "" : (new Date(result.FechaAcordada)).toLocaleString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' }));
            if (result.FlagFechaFinSoporte) $("#txtComentariosFechaFinSoporteTecnologia").val(result.ComentariosFechaFin);
            if (result.FlagFechaFinSoporte) $("#cbTipoFechaInternaTecnologia").val(result.TipoFechaInterna == null ? "-1" : result.TipoFechaInterna);
            if (!result.FlagFechaFinSoporte) $("#cbSustentoMotivoFechaFinSoporteTecnologia").val(result.SustentoMotivo == null ? "-1" : result.SustentoMotivo);
            if (!result.FlagFechaFinSoporte) $("#txtSustentoUrlFechaFinSoporteTecnologia").val(result.SustentoUrl);
            $("input[name='rbtUrlConfluenceIdTecnologia'][value='" + (result.UrlConfluenceId || "2") + "']").prop("checked", true).trigger("change");
            $("#txtUrlConfluenceTecnologia").val(result.UrlConfluence);
            //tec.CasoUsoArchivo = $("#").val();
            $("#txtCasoUsoTecnologia").val(result.CasoUso);
            $("#cbPlataformaAplicaIdTecnologia").val(result.Aplica == null ? "-1" : result.Aplica);
            $("#cbCompatibilidadSOIdTecnologia").val(result.CompatibilidadSOId == null ? null : result.CompatibilidadSOId.split(",")).multiselect("refresh");
            $("#cbCompatibilidadCloudIdTecnologia").val(result.CompatibilidadCloudId == null ? null : result.CompatibilidadCloudId.split(",")).multiselect("refresh");
            $("#txtRequisitosHWSWTecnologia").val(result.Requisitos);
            $("#cbConocimientoIdTecnologia").val(result.Existencia == null ? "-1" : result.Existencia);
            if ($("#cbConocimientoIdTecnologia").val() == null) $("#cbConocimientoIdTecnologia").val("-1");
            $("#cbRiesgoObsolescenciaIdTecnologia").val(result.Riesgo == null ? "-1" : result.Riesgo);
            if ($("#cbRiesgoObsolescenciaIdTecnologia").val() == null) $("#cbRiesgoObsolescenciaIdTecnologia").val("-1");
            $("#cbFacilidadActualizacionIdTecnologia").val(result.Facilidad == null ? "-1" : result.Facilidad);
            if ($("#cbFacilidadActualizacionIdTecnologia").val() == null) $("#cbFacilidadActualizacionIdTecnologia").val("-1");
            $("#cbVulnerabilidadSeguridadTecnologia").val(result.Vulnerabilidad == null ? "-1" : result.Vulnerabilidad);
            if ($("#cbVulnerabilidadSeguridadTecnologia").val() == null) $("#cbVulnerabilidadSeguridadTecnologia").val("-1");
            // Fin Tab 1

            $("#txtDominioTecnologia").val(result.DominioNomb);
            $("#txtSubDominioTecnologia").val(result.SubdominioNomb);
            $("#hdnSubDominioIdTecnologia").val(result.SubdominioId);
            $("#hdnRoadMapTecnologia").val(result.RoadmapOpcional);
            $("#txtReferenciaTecnologia").val(result.Referencias);
            $("#txtPlanTransferenciaConocimientoTecnologia").val(result.PlanTransConocimiento);
            $("#txtEsquemaMonitoreoTecnologia").val(result.EsqMonitoreo);
            $("#txtDefinicioEsquemaPatchMangementTecnologia").val(result.EsqPatchManagement);
            //Fin Tab 2

            $("#txtOwnerDisplayNameTecnologia").val(result.Dueno);
            $("#txtEquipoAdministracionTecnologia").val(result.EqAdmContacto);
            $("#txtGrupoTicketRemedyTecnologia").val(result.GrupoSoporteRemedy);
            $("#txtConformidadArquitectoSeguridadTecnologia").val(result.ConfArqSeg);
            $("#txtConformidadArquitectoTecnologia").val(result.ConfArqTec);
            $("#txtEncargadoRenovacionContractualTecnologia").val(result.EncargRenContractual);
            $("#txtEsquemaLicenciamientoTec").val(result.EsqLicenciamiento);
            $("#txtCoordinacionSoporteEmpresarialTecnologia").val(result.SoporteEmpresarial);
            $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val(result.EsqLicenciamiento == null || result.EsqLicenciamiento == "" || isNaN(Number(result.EsqLicenciamiento)) ? "-1" : result.EsqLicenciamiento);
            $("#txtEquipoAprovisionamientoTecnologia").val(result.EquipoAprovisionamiento);

            $tblAplicaciones.bootstrapTable("load", result.ListAplicaciones || []);
            $tblAutorizador.bootstrapTable("load", result.ListAutorizadores || []);
            $tblArquetipos.bootstrapTable("load", result.ListArquetipo || []);

            LIST_APLICACION = (result.ListAplicaciones || []).map(x => x);
            DATA_EQUIVALENCIA = (result.ListEquivalencias || []).map(x => x);
            LIST_EQUIVALENCIA = (result.ListEquivalencias || []).map(x => x);

            if (result.ArchivoId !== null) {
                $("#txtCasoUsoArchivoTecnologia").val(result.ArchivoStr);
                $("#hdArchivoId").val(result.ArchivoId);
                $("#btnDescargarFile").show();
                $("#btnEliminarFile").show();
                //$(".div-controls-file").show();
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
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
            $("#spNomTec").html(NombreStr);
            LimpiarValidateErrores($("#formTecByArq"));
            ItemsRemoveTecEqId = [];

            listarTecnologiasEquivalentes($tblTecEq, $("#mdTecEq"));
            //listarTecEqById(TecId);
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
            //debugger;
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

function InitAutocompletarTecnologiaEquivalente($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                var data = {};
                data.id = parseInt($("#hdTecnologiaId").val()) === 0 ? null : parseInt($("#hdTecnologiaId").val());
                data.filtro = request.term;

                //$IdBox.val("0");
                $.ajax({
                    url: URL_API + `/Tecnologia/GetTecnologiaByClaveById`,
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
            //$IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            //AgregarTecnologiaEquivalencia(ui.item.Id, ui.item.Descripcion);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function AgregarTecnologiaEquivalencia(EquivalenciaId, NombreEquivalencia) {
    var estItem = $tblTecEq.bootstrapTable('getRowByUniqueId', EquivalenciaId);
    //debugger;
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
    var btnTrash = `  <a id='btnRemAutTec' class='btn btn-danger' href='javascript: void(0)' onclick='removeItemTecnologiaEquivalente(${row.Id})'>` +
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

function removeItemTecnologiaEquivalente(TecEqId) {
    //var _tecId = $("#hdTecnologiaId").val();
    //bootbox.confirm("¿Estás seguro que deseas eliminar la equivalencia seleccionada?", function (result) {
    //    if (result) {
    //        let data = {
    //            Id: TecEqId,
    //            Usuario: USUARIO.UserName
    //        };
    //        $.ajax({
    //            url: URL_API_VISTA + "/CambiarFlagEquivalencia",
    //            type: "POST",
    //            contentType: "application/json; charset=utf-8",
    //            data: JSON.stringify(data),
    //            dataType: "json",
    //            success: function (result) {
    //                if (result) {
    //                    toastr.success("La operación se realizó correctamente", "Equivalencia de Tecnologías");
    //                    listarTecnologiasEquivalentes($tblTecEq, $("#mdTecEq"));
    //                }
    //                else {
    //                    toastr.error("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "Equivalencia de Tecnologías");
    //                }
    //            },
    //            error: function (xhr, ajaxOptions, thrownError) {
    //                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
    //            },
    //            complete: function (data) {
    //                //RefrescarListado();
    //            }
    //        });

    //    }
    //});

    bootbox.confirm({
        title: TITULO_MENSAJE_EQUIVALENCIA,
        message: "¿Estás seguro que deseas eliminar la equivalencia seleccionada?",
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
                    Id: TecEqId,
                };
                $.ajax({
                    url: URL_API_VISTA + "/CambiarFlagEquivalencia",
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(data),
                    dataType: "json",
                    success: function (result) {
                        if (result) {
                            toastr.success("La operación se realizó correctamente", TITULO_MENSAJE_EQUIVALENCIA);
                            listarTecnologiasEquivalentes($tblTecEq, $("#mdTecEq"));
                        }
                        else {
                            toastr.error("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE_EQUIVALENCIA);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    },
                    complete: function (data) {
                        //RefrescarListado();
                    }
                });
            }
        }
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
    //$("#formTecByArq").validate().resetForm();
    LimpiarValidateErrores($("#formTecByArq"));
    if ($("#formTecByArq").valid()) {
        var _tecId = $("#hdTecnologiaId").val();
        var equivalencia = $("#txtNomTecEq").val();

        let data = {
            tecId: _tecId,
            Equivalencia: equivalencia,
        };

        $("#btnRegTecEq").button("loading");

        $.ajax({
            url: URL_API_VISTA + "/AsociarTecnologiaEquivalencia",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (result) {
                var response = result;
                if (response) {
                    toastr.success("Se relacionó correctamente", TITULO_MENSAJE);
                    $("#txtNomTecEq").val("");
                    listarTecnologiasEquivalentes($tblTecEq, $("#mdTecEq"));
                    listarTecSTD();
                }
                else
                    toastr.error('Ocurrio un problema', TITULO_MENSAJE);
            },
            complete: function () {
                $("#btnRegTecEq").button("reset");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function irCambiarEstadoTec(TecId, EstadoTecnologia, EstadoTecnologiaStr, FlagActivo) {
    if (FlagActivo) {
        //debugger;
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
                //debugger;
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
                                console.log(result);
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
    debugger;
    $.ajax({
        url: URL_API_VISTA,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(tec),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            console.log(result);
            var data = result;
            if (data > 0) {
                let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
                if ((archivoId === 0 && $("#txtCasoUsoArchivoTecnologia").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                    UploadFile($("#flCasoUsoArchivoTecnologia"), CODIGO_INTERNO, data, archivoId);
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

function aprobarTecSTD() {
    $(".cbAprob").removeClass("ignore");
    $(".matricula-auto").addClass("ignore");

    if ($("#formAddOrEditTec").valid()) {
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
                    if ($("#hFamTecId").val() === "0") {
                        bootbox.confirm({
                            title: TITULO_MENSAJE,
                            message: "La familia ingresada es nueva. ¿Desea registrarla en el grupo de familias y asignarla a esta tecnología?",
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
                                    InsertNuevaFamilia();
                                    GuardarAprobarTecnologia();
                                }
                            }
                        });
                    } else {
                        GuardarAprobarTecnologia();
                    }
                }
            }
        });
    } else {
        toastr.error('Faltan completar campos', TITULO_MENSAJE);
    }
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

function guardarCambios() {
    //$(".form-control").removeClass("ignore");
    $(".cbAprob").removeClass("ignore");
    $(".matricula-auto").addClass("ignore");

    if ($("#formAddOrEditTec").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: "¿Estás seguro de guardar los cambios de la tecnología?",
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
                    if ($("#hFamTecId").val() === "0") {
                        bootbox.confirm({
                            title: TITULO_MENSAJE,
                            message: "La familia ingresada es nueva. ¿Desea registrarla en el grupo de familias y asignarla a esta tecnología?",
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
                                    InsertNuevaFamilia();
                                    GuardarTecnologia();
                                }
                            }
                        });
                    } else {
                        GuardarTecnologia();
                    }
                }
            }
        });
    } else {
        toastr.error('Faltan completar campos', TITULO_MENSAJE);
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

function observarTecSTD() {
    //$(".form-control").removeClass("ignore");
    $(".cbAprob").addClass("ignore");
    //$("#formAddOrEditTec").validate().resetForm();

    if ($("#formAddOrEditTec").valid()) {
        bootbox.addLocale('custom', locale);
        bootbox.prompt({
            title: TITULO_MENSAJE_OBSERVACION,
            message: '<p>¿Estás seguro que deseas observar el registro de la tecnología?, de ser asi por favor ingresa los comentarios al respecto:</p>',
            inputType: 'textarea',
            rows: '5',
            locale: 'custom',
            callback: function (result) {
                var data = result;
                //console.log(data);
                if (data !== "" && data !== null) {

                    if ($.trim(data).length > 500) {
                        toastr.error("Observación no debe superar los 500 carácteres.", TITULO_MENSAJE);
                        return false;
                    }

                    if ($("#hFamTecId").val() === "0") {
                        bootbox.confirm({
                            title: TITULO_MENSAJE,
                            message: "La familia ingresada es nueva. ¿Desea registrarla en el grupo de familias y asignarla a esta tecnología?",
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
                                    InsertNuevaFamilia();
                                    GuardarObservarTecnologia(data);
                                }
                            }
                        });
                    } else {
                        GuardarObservarTecnologia(data);
                    }

                } else {
                    toastr.error("Observación no debe estar vacio", TITULO_MENSAJE);
                }
            }
        });
        $(".bootbox-input-textarea").attr("placeholder", placeholderObs);
    } else {
        toastr.error('Faltan completar campos', TITULO_MENSAJE);
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
                    UploadFile($("#flCasoUsoArchivoTecnologia"), CODIGO_INTERNO, data, archivoId);
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

function addItemAutorizador() {
    $(".form-control").addClass("ignore");
    $(".matricula-auto").removeClass("ignore");

    //LimpiarValidateErrores($("#formAddOrEditTec"));

    if ($("#formAddOrEditTec").valid()) {
        var matAut = DATOS_RESPONSABLE.Matricula;//$("#txtMatAutTec").val();

        $("#txtMatAutTec").val('');
        var matItem = $tblAutorizador.bootstrapTable('getRowByUniqueId', matAut);
        if (matItem === null) {

            var dataTmp = $tblAutorizador.bootstrapTable('getData');
            var idx = 0;
            var ultId = dataTmp.length === 0 ? (1 * -1000) : dataTmp[dataTmp.length - 1].Id;
            ultId = ultId === null ? 0 : ultId;
            idx = ultId > 0 ? dataTmp.length * -1000 : ultId - 1000;

            $tblAutorizador.bootstrapTable('append', {
                MatriculaBanco: matAut,
                Id: idx
            });
        }
    }
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
                    //SetItemsCustomField(dataObject.Producto, $("#cbProductoIdBus"), TEXTO_TODOS, "Id", "Nombre");
                    SetItems(dataObject.Fuente, $("#cbFuenteTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.FechaCalculo, $("#cbFechaCalculosTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoFechaInterna, $("#cbTipoFechaInternaTecnologia"), TEXTO_SELECCIONE);

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

                    SetItems(dataObject.TipoTec, $("#cbTipoProductoIdProducto"), TEXTO_SELECCIONE);
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
                    SetItems(dataObject.AplicaTecnologia, $("#cbPlataformaAplicaIdTecnologia"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.CompatibilidadSO, $("#cbCompatibilidadSOIdTecnologia"), NO_APLICA, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.CompatibilidadCloud, $("#cbCompatibilidadCloudIdTecnologia"), NO_APLICA, TEXTO_TODOS, true);
                    SetItems(dataObject.SustentoMotivo, $("#cbSustentoMotivoFechaFinSoporteTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Valores, $("#cbConocimientoIdTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Valores, $("#cbRiesgoObsolescenciaIdTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Valores, $("#cbFacilidadActualizacionIdTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Valores, $("#cbVulnerabilidadSeguridadTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EsquemaLicenciamientoSuscripcion || [], $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia"), TEXTO_SELECCIONE);

                    SetItemsCustomField(LIST_SQUAD, $("#cbSquadIdProducto"), TEXTO_SELECCIONE, "Id", "Descripcion");

                    let lstRbtRevisionSeguridad = dataObject.RevisionSeguridad.map((x, i) => `<label class="radio-inline"><input type="radio" id="rbtRevisionSeguridadIdTecnologia_${x.Id}" name="rbtRevisionSeguridadIdTecnologia" value="${x.Id}" ${i == 0 ? "checked" : ""} /> ${x.Descripcion}</label>`).join('');
                    $("#lstRbtRevisionSeguridad").html(lstRbtRevisionSeguridad);
                    $("input[name='rbtRevisionSeguridadIdTecnologia']").change(RbtRevisionSeguridadIdTecnologia_Change);
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

                    DATA_INPUT_OPCIONAL = dataObject.EstadoObs;
                    console.log(DATA_INPUT_OPCIONAL);

                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function RbtRevisionSeguridadIdTecnologia_Change() {
    let value = $("input[name='rbtRevisionSeguridadIdTecnologia']:checked").val();
    let enabledText = value == 1;
    if (!enabledText) $("#txtRevisionSeguridadDescripcionTecnologia").val("");
    $("#txtRevisionSeguridadDescripcionTecnologia").prop("readonly", !enabledText);
}

function RbtUrlConfluenceIdTecnologia_Change() {
    let value = $("input[name='rbtUrlConfluenceIdTecnologia']:checked").val();
    let enabledText = value == 1;
    if (!enabledText) $("#txtUrlConfluenceTecnologia").val("");
    $("#txtUrlConfluenceTecnologia").prop("readonly", !enabledText);
}

//function CbProductoIdTecnologia_Change() {
//    let flagNuevo = $("#chkFlagNuevoProducto").prop("checked");
//    let id = $("#cbProductoIdTecnologia").val();
//    let item = DATA_PRODUCTO.find(x => x.Id == id);

//    cargarDatosProducto(item);
//}

function cargarDatosProducto(item) {
    let flagNuevo = $("#chkFlagNuevoProducto").prop("checked");

    //let readonlyCodigoProducto = !((!flagNuevo && item == null) || (flagNuevo));
    //$("#txtCodigoProductosTecnologia").prop("readonly", readonlyCodigoProducto);

    //if (item == null) return;

    $("#txtFabricanteTecnologia").val(item != null ? item.Fabricante : '');
    $("#txtNombreTecnologia").val(item != null ? item.Nombre : '');
    $("#txtDescripcionTecnologia").val(item != null ? item.Descripcion : '');
    $("#txtDominioTecnologia").val(item != null ? item.DominioStr : '');
    $("#txtSubDominioTecnologia").val(item != null ? item.SubDominioStr : '');
    $("#hdnSubDominioIdTecnologia").val(item != null ? item.SubDominioId : '');
    $("#cbTipoProductoIdProducto").val(item != null ? item.TipoProductoId : -1).trigger("change");
    $("#txtGrupoTicketRemedyTecnologia").val(item != null ? item.GrupoTicketRemedyNombre : '');
    $("#hdGrupoTicketRemedyIdTecnologia").val(item != null ? item.GrupoTicketRemedyId : '');
    $("#txtEquipoAdministracionTecnologia").val(item != null ? item.EquipoAdmContacto : '');
    $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia").val(item != null ? item.EsquemaLicenciamientoSuscripcionId == null ? -1 : item.EsquemaLicenciamientoSuscripcionId : -1);

    $("#txtCodigoProductosTecnologia").val(flagNuevo ? "" : item != null ? item.Codigo : "");
    $("#txtDescripcionTecnologia").prop("readonly", true);
    //let tipoProductoId = item == null ? -1 : item.TipoProductoId;
    //$("#cbTipoTecnologiaIdTecnologia").val(tipoProductoId).trigger("change");

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

    //DATA_EXPORTAR = {};
    DATA_EXPORTAR.productoId = $("#hdnProductoBusTec").val() == "-1" ? null : $("#hdnProductoBusTec").val()
    DATA_EXPORTAR.nombre = $.trim($("#txtBusTec").val());
    DATA_EXPORTAR.domIds = $("#cbFilDom").val() === null ? "" : $.isArray($("#cbFilDom").val()) ? $("#cbFilDom").val().join("|") : $("#cbFilDom").val();
    DATA_EXPORTAR.subdomIds = $("#cbFilSub").val() === null ? "" : $.isArray($("#cbFilSub").val()) ? $("#cbFilSub").val().join("|") : $("#cbFilSub").val();
    DATA_EXPORTAR.casoUso = $("#txtCasoUsoTec").val();
    DATA_EXPORTAR.estadoIds = $("#cbFilEst").val() === null ? "" : $.isArray($("#cbFilEst").val()) ? $("#cbFilEst").val().join("|") : $("#cbFilEst").val();
    DATA_EXPORTAR.famId = $("#cbFilFam").val();
    DATA_EXPORTAR.fecId = $("#cbFilEsFecSop").val();
    DATA_EXPORTAR.aplica = $("#txtFilAplica").val() === "-1" ? "" : $("#txtFilAplica").val();
    DATA_EXPORTAR.codigo = $("#txtFilCodigo").val();
    DATA_EXPORTAR.dueno = $("#txtFilDueno").val();
    //DATA_EXPORTAR.equipo = $("#txtFilEquipo").val();
    DATA_EXPORTAR.tipoTecIds = $("#cbFilTipoTec").val() === null ? "" : $.isArray($("#cbFilTipoTec").val()) ? $("#cbFilTipoTec").val().join("|") : $("#cbFilTipoTec").val();
    DATA_EXPORTAR.estObsIds = $("#cbFilEstObs").val() === null ? "" : $.isArray($("#cbFilEstObs").val()) ? $("#cbFilEstObs").val().join("|") : $("#cbFilEstObs").val();
    DATA_EXPORTAR.flagActivo = FLAG_ACTIVO_TECNOLOGIA;//$("#cbFilEstObs").val();
    DATA_EXPORTAR.sortName = DATA_EXPORTAR.sortName === null || DATA_EXPORTAR.sortName === "" ? "FechaCreacion" : DATA_EXPORTAR.sortName;
    DATA_EXPORTAR.sortOrder = DATA_EXPORTAR.sortOrder === null || DATA_EXPORTAR.sortOrder === "" ? "desc" : DATA_EXPORTAR.sortOrder;

    let url = `${URL_API_VISTA}/ExportarConsolidadoNew?nombre=${DATA_EXPORTAR.nombre}&dominioIds=${DATA_EXPORTAR.domIds}&subdominioIds=${DATA_EXPORTAR.subdomIds}&productoId=${DATA_EXPORTAR.productoId}&aplica=${DATA_EXPORTAR.aplica}&codigo=${DATA_EXPORTAR.codigo}&dueno=${DATA_EXPORTAR.dueno}&tipoTecIds=${DATA_EXPORTAR.tipoTecIds}&estObsIds=${DATA_EXPORTAR.estObsIds}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
    //let url = `${URL_API_VISTA}/ExportarConsolidadoNew?nombre=${DATA_EXPORTAR.nombre}&dominioIds=${DATA_EXPORTAR.domIds}&subdominioIds=${DATA_EXPORTAR.subdomIds}&productoId=${DATA_EXPORTAR.productoId}&aplica=${DATA_EXPORTAR.aplica}&codigo=${DATA_EXPORTAR.codigo}&dueno=${DATA_EXPORTAR.dueno}&equipo=${DATA_EXPORTAR.equipo}&tipoTecIds=${DATA_EXPORTAR.tipoTecIds}&estObsIds=${DATA_EXPORTAR.estObsIds}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function exportarDetalladoTecSTD() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    //DATA_EXPORTAR = {};
    DATA_EXPORTAR.productoId = $("#hdnProductoBusTec").val() == "-1" ? null : $("#hdnProductoBusTec").val()
    DATA_EXPORTAR.nombre = $.trim($("#txtBusTec").val());
    DATA_EXPORTAR.dominioIds = $("#cbFilDom").val()
    DATA_EXPORTAR.subdominioIds = $("#cbFilSub").val()
    DATA_EXPORTAR.aplica = $("#txtFilAplica").val() === "-1" ? "" : $("#txtFilAplica").val();
    DATA_EXPORTAR.codigo = $("#txtFilCodigo").val();
    DATA_EXPORTAR.dueno = $("#txtFilDueno").val() == null ? "" : $("#txtFilDueno").val();
    DATA_EXPORTAR.tribuCoe = $("#txtFilTribuCoeStr").val();
    DATA_EXPORTAR.squad = $("#cbSquadIdSearch").val() == -1 ? "" : $("#cbSquadIdSearch option:selected").text();
    DATA_EXPORTAR.tipoTecIds = $("#cbFilTipoTec").val();
    DATA_EXPORTAR.estObsIds = $("#cbFilEstObs").val();
    DATA_EXPORTAR.sortName = DATA_EXPORTAR.sortName ?? "FechaCreacion";
    DATA_EXPORTAR.sortOrder = DATA_EXPORTAR.sortOrder ?? "desc";

    let url = `${URL_API_VISTA}/ExportarDetalladoCatalogo`;
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
    //debugger;
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
                            console.log(item);
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
                    url: URL_API_VISTA + `/GetTecnologiaForBusqueda?filtro=${request.term}&id=${id}&flagActivo=${flagActivo}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    success: function (data) {
                        response($.map(data, function (item) {
                            //console.log(item);
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
    let nombre = $("#txtNombreTecnologia").val();
    let version = $("#txtVersionTecnologia").val();
    let clave = `${fabricante} ${nombre} ${version}`;
    $("#txtClaveTecnologia").val(clave);
}

//Upload

function EliminarArchivo() {
    //$("#hdArchivoId").val("");
    $("#txtCasoUsoArchivoTecnologia").val(TEXTO_SIN_ARCHIVO);
    $("#flCasoUsoArchivoTecnologia").val("");
    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
    //$(".div-controls-file").hide();
}

function DescargarArchivo() {
    DownloadFile($("#hdArchivoId").val(), $("#txtCasoUsoArchivoTecnologia"), "Tecnologías");
}

function listarTecnologiasEquivalentes($tbl, $md) {
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

function irListarTecnologiasEquivalentes() {
    //debugger;
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

function confirmarTecSTD() {
    $(".form-control").removeClass("ignore");
    $(".matricula-auto").addClass("ignore");

    $("#cbFechaCalculosTecnologia").trigger("change");

    if ($("#formAddOrEditTec").valid()) {
        var mensaje = "¿Estás seguro de enviar el registro hacia el equipo de Estándares para su revisión?, al aceptar ya no será posible realizar modificaciones posteriores.";
        bootbox.confirm({
            title: "Confirmación",
            message: mensaje,
            buttons: {
                confirm: {
                    label: 'Confirmar',
                    className: 'btn-primary'
                },
                cancel: {
                    label: 'Cancelar',
                    className: 'btn-secondary'
                }
            },
            callback: function (result) {
                if (result) {
                    if ($("#hFamTecId").val() === "0") {
                        bootbox.confirm({
                            title: TITULO_MENSAJE,
                            message: "La familia ingresada es nueva. ¿Desea registrarla en el grupo de familias y asignarla a esta tecnología?",
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
                                    InsertNuevaFamilia();
                                    GuardarConfirmarTecnologia();
                                }
                            }
                        });
                    } else {
                        GuardarConfirmarTecnologia();
                    }
                }
            }
        });
    } else {
        toastr.error('Faltan completar campos', TITULO_MENSAJE);
    }
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
                    UploadFile($("#flCasoUsoArchivoTecnologia"), CODIGO_INTERNO, data, archivoId);
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

function ValidarMatriculaDueno() {
    $(".form-control").addClass("ignore");
    $(".inputMatriculaDueno").removeClass("ignore");

    if ($("#formAddOrEditTec").valid()) {
        $("#lblDueno").html(DATOS_RESPONSABLE.Nombres);
        RegistrarMatricula(DATOS_RESPONSABLE);
        //ObtenerDatosByMatricula($("#txtDueTec"), $("#lblDueno"));
    }
}

function ValidarMatriculaArquitectoSeguridad() {
    //$(".form-control").addClass("ignore");
    //$(".inputMatriculaArquitectoSeg").removeClass("ignore");
    //if (isValidEmail($("#txtConfArqSegTec").val()){
    //    ExisteMatricula($("#txtConfArqSegTec").val());
    //    $("#lblArquitectoSeg").html(DATOS_RESPONSABLE.Nombres);
    //    $("#txtConfArqSegTec").val(DATOS_RESPONSABLE.Matricula);
    //    RegistrarMatricula(DATOS_RESPONSABLE);
    //}
    //else {
    //    toastr.warning("Es necesario ingresar el correo electrónico del responsable", TITULO_MENSAJE);
    //}
    ////if ($("#formAddOrEditTec").valid()) {
    ////    $("#lblArquitectoSeg").html(DATOS_RESPONSABLE.Nombres);
    ////    RegistrarMatricula(DATOS_RESPONSABLE);
    ////    //ObtenerDatosByMatricula($("#txtConfArqSegTec"), $("#lblArquitectoSeg"));
    ////}
}

function ValidarMatriculaArquitectoTecnologia() {
    $(".form-control").addClass("ignore");
    $(".inputMatriculaArquitectoTec").removeClass("ignore");

    if ($("#formAddOrEditTec").valid()) {
        $("#lblArquitectoTec").html(DATOS_RESPONSABLE.Nombres);
        RegistrarMatricula(DATOS_RESPONSABLE);
        //ObtenerDatosByMatricula($("#txtConfArqTec"), $("#lblArquitectoTec"));
    }
}

//function isValidEmail(emailText) {
//    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
//    return pattern.test(emailText);
//};

function defaultAccesoDirecto() {
    $("#mdAddOrEditTec").modal('hide');
    $(COMBO_SELECTED).val("-1");
}

function irMigrarEquivalencias(TecnologiaId, EstadoTecnologiaId, EstadoTecnologiaStr, FlagActivo, FlagTieneEquivalencias) {
    //debugger;
    switch (EstadoTecnologiaId) {
        case ESTADO_TECNOLOGIA.APROBADO:
            if (FlagTieneEquivalencias) {
                $("#hdTecnologiaId").val(TecnologiaId);
                LimpiarValidateErrores($("#formMigrarEquivalencia"));
                $("#txtTecReceptora").val("");
                $("#hdTecReceptora").val("0");
                $("#titleMigrar").html("Migrar equivalencias");
                $("#btnMigrarEquivalencia").html("Migrar");
                TEMP_MIGRAR = MIGRAR_DATA.EQUIVALENCIA;
                $("#mdMigrarEquivalencia").modal(opcionesModal);
            } else {
                bootbox.alert({
                    size: "sm",
                    title: TITULO_MENSAJE_EQUIVALENCIA,
                    message: "La tecnología no presenta equivalencias",//String.Format("La tecnología se encuentra en estado {0}, no es posible editar.", EstadoTecnologiaStr),
                    buttons: {
                        ok: {
                            label: 'Aceptar',
                            className: 'btn-primary'
                        }
                    }
                });
            }
            break;
        case ESTADO_TECNOLOGIA.REGISTRADO:
        case ESTADO_TECNOLOGIA.OBSERVADO:
        case ESTADO_TECNOLOGIA.PROCESOREVISION:
            //debugger;
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
}

function irMigrarInfoTecnologia(TecnologiaId, EstadoTecnologiaId, EstadoTecnologiaStr, FlagActivo) {
    $("#hdTecnologiaId").val(TecnologiaId);
    LimpiarValidateErrores($("#formMigrarEquivalencia"));
    $("#txtTecReceptora").val("");
    $("#hdTecReceptora").val("0");
    $("#titleMigrar").html("Migrar información tecnología");
    $("#btnMigrarEquivalencia").html("Migrar datos");
    TEMP_MIGRAR = MIGRAR_DATA.INFORMACION;
    $("#mdMigrarEquivalencia").modal(opcionesModal);
}

function migrarData() {
    if ($("#formMigrarEquivalencia").valid()) {
        $("#btnMigrarEquivalencia").button("loading");

        let TecnologiaEmisorId = $("#hdTecReceptora").val();
        let TecnologiaReceptorId = $("#hdTecnologiaId").val();

        let RUTA_METODO = TEMP_MIGRAR === MIGRAR_DATA.EQUIVALENCIA ? "MigrarEquivalenciasTecnologia" : "MigrarDataTecnologia";
        //debugger;
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: URL_API_VISTA + `/${RUTA_METODO}?TecnologiaEmisorId=${TecnologiaEmisorId}&TecnologiaReceptorId=${TecnologiaReceptorId}`,
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        if (dataObject) {
                            $("#btnMigrarEquivalencia").button("reset");
                            $("#mdMigrarEquivalencia").modal('hide');
                            console.log(dataObject);
                            toastr.success("La migración procedió satisfactoriamente", TITULO_MENSAJE);
                            listarTecSTD();
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

function validarFormMigrarEquivalencias() {

    $.validator.addMethod("existeTecnologiaReceptora", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            estado = ExisteTecnologia($("#hdTecReceptora"));
            return estado;
        }
        return estado;
    });

    $("#formMigrarEquivalencia").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        onfocusout: false,
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtTecReceptora: {
                requiredSinEspacios: true,
                existeTecnologiaReceptora: true
            }
        },
        messages: {
            txtTecReceptora: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre de la tecnología"),
                existeTecnologiaReceptora: String.Format("{0} seleccionada no existe.", "La tecnología")
            }
        }
    });
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
            console.log(result);
            if (result > 0) {
                //ID = result;
                console.log(String.Format("Familia registrada con ID : {0}", result));
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

function VerTecnologiasProducto() {
    let productoId = $("#hdProductoIdTecnologia").val();
    if (productoId == "0" || productoId == "-1" || productoId == null || productoId == "") return;
    ListarTecnologiasProducto(productoId, () => {
        MdTecnologiasByProducto(true);
    });
}

function MdTecnologiasByProducto(EstadoMd) {
    if (EstadoMd)
        $("#MdTecnologiasByProducto").modal(opcionesModal);
    else
        $("#MdTecnologiasByProducto").modal('hide');
}

function ListarTecnologiasProducto(productoId, fn = null) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblTecnologias.bootstrapTable('destroy');
    $tblTecnologias.bootstrapTable({
        url: URL_API + "/Tecnologia/ListadoByProductoWithPagination",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        sortName: 'ClaveTecnologia',
        sortOrder: 'desc',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.productoId = productoId;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            debugger;
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
            //if (ID_TECNOLOGIA !== 0) {
            //    let editFromId = EDIT_TEC_FROM.NOMBRE;
            //    editarTecSTD(ID_TECNOLOGIA, ID_ESTADO_TECNOLOGIA, editFromId);
            //    ID_TECNOLOGIA = 0;
            //}
            if (typeof fn == "function") fn();
        }
    });
    //waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    //$.ajax({
    //    url: URL_API + "/Tecnologia/ListadoByProducto?productoId=" + productoId,
    //    type: "GET",
    //    dataType: "json",
    //    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
    //    success: function (result) {
    //        $tblTecnologias.bootstrapTable("load", result);
    //        if (typeof fn == "function") fn();
    //    },
    //    complete: function () {
    //        //waitingDialog.hide();
    //    },
    //    error: function (xhr, ajaxOptions, thrownError) {
    //        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
    //    }
    //});
}

function formatNombreRoles(value, row, index) {
    return `<a href="javascript:irRoles(${row.ProductoId})" title="Ver roles relacionados">${value}</a>`;
}

function formatLBS(value, row, index) {
    let a_href = "", a_text = "";
    if (row.LineamientoBaseSeguridadId == 1) {
        a_href = row.LineamientoBaseSeguridadStr === null || $.trim(row.LineamientoBaseSeguridadStr) === "" ? "#" : row.LineamientoBaseSeguridadStr;
        a_text = row.LineamientoBaseSeguridadStr === null || $.trim(row.LineamientoBaseSeguridadStr) === "" ? "-" : TEXTO_IR_SITIO;
        return `${a_href}`;
    } else {
        return `${value}`;
    }

}

function irRoles(id) {
    OpenCloseModal($("#modalRoles"), true);

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableRoles.bootstrapTable('destroy');
    $tableRoles.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/DetalleProductosRoles",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Rol',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.ProductoId = id;
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

function formatNombreFunciones(value, row, index) {
    return `<a href="javascript:irFunciones(${row.ProductoId})" title="Ver funciones relacionadas">${value}</a>`;
}

function irFunciones(id) {
    OpenCloseModal($("#modalFunciones"), true);

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableFunciones.bootstrapTable('destroy');
    $tableFunciones.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/DetalleProductosFunciones",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Chapter',
        sortOrder: 'desc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.ProductoId = id;
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
function ambientesFormatter(value, row, index) {
    let option = value;
    option = `<ul style="padding-left: 15px;">`;
    if (row.Ambiente.length > 0) {
        for (var i = 0; i < row.Ambiente.length; i++) {
            if (row.Ambiente[i].GrupoRed == '') {
                option = option + `<li>` + row.Ambiente[i].AmbienteStr + ` : NO APLICA</li>`;
            } else {
                option = option + `<li>` + row.Ambiente[i].AmbienteStr + ` : ` + row.Ambiente[i].GrupoRed + `</li>`;
            }
        }
    }
    option = option + `</ul>`;
    return option;
}