var $table = $("#tblRegistro");
var $tableTecnologia = $("#tblRegistroTecnologia");
var $tblRegistroRelacionApps = $("#tblRegistroRelacionApps");
var AVISO_PROCESO_2DO_PLANO = "Hay un proceso en segundo plano ejecutándose, cierre la ventana y vuelva a intertarlo";
var URL_API_VISTA = URL_API + "/Relacion";
var DATA_TECNOLOGIA = [];
var DATA_APLICACION = [];
var DATA_EQUIPO = [];
var DATA_EQUIPO_TECNOLOGIA = [];
var DATA_TECNOLOGIA_DESMARCADO = [];
var DATA_RELEVANCIA = [];
var DATA_INSTANCIAS_BD = [];
var DATA_TIPO_ACTUAL = 0;
var RELACION_DETALLE_EDIT = [];
var DATA_ESTADO = [];
var ESTADO_RELACION = { PENDIENTE: 1, APROBADO: 2, DESAPROBADO: 3, PENDIENTEELIMINACION: 0, ELIMINADO: 5, SUSPENDIDO: 6 };
var ESTADOS_APOYO = [ESTADO_RELACION.PENDIENTE, ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO, ESTADO_RELACION.PENDIENTEELIMINACION, ESTADO_RELACION.ELIMINADO];
var ESTADOS_APOYO_PENDIENTE = [ESTADO_RELACION.PENDIENTE, ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO];
var ESTADOS_APOYO_PENDIENTE_MODAL = [ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO];
var ESTADOS_APOYO_PENDIENTEELIMINACION = [ESTADO_RELACION.PENDIENTEELIMINACION, ESTADO_RELACION.ELIMINADO, ESTADO_RELACION.APROBADO];
var ESTADOS_APOYO_PENDIENTEELIMINACION_MODAL = [ESTADO_RELACION.ELIMINADO, ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO];
var DATA_EXPORTAR = {};
var RELEVANCIA_ALTA = 1;
var TIPO_EQUIPO_ID_CD = 0;
var PAGE_TIPO_EQUIPO_ID_CD = 0;
var TIPO_EQUIPO_ID_APIS = 0;
var FLAG_ACTIVO_TECNOLOGIA = 0;
var DATA_TIPO_EQUIPO = [];
var FLAG_REMOVE_EQUIPO = false;

var flagEliminada = false;

var Param_RelacionApp = 0;
var Param_RelacionAppEditAdd = 0;






const TIPO_EQUIPO_SERVICIO_NUBE = 4;
const TIPO = { TIPO_EQUIPO: "1", TIPO_TECNOLOGIA: "2", TIPO_APLICACION: "3", TIPO_SERVICIONUBE: "4", TIPO_SERVICIOBROKER: "5" };
const ESTADO_TECNOLOGIA = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
const URL_AUTOCOMPLETE_EQUIPO = { DEFAULT: "GetEquipoByFiltro", SERVICIONUBE: "GetEquipoServicioNubeByFiltro", FILTROS: "GetEquipoFiltros" };
const TITULO_MENSAJE = "Relación de Tecnología";
const TEXTO_MOSTRAR_AUDITORIA = "Mostrar auditoría";
const TEXTO_OCULTAR_AUDITORIA = "Ocultar auditoría";
const TEXTO_MOSTRAR_FILTROS = "Mostrar filtros";
const TEXTO_OCULTAR_FILTROS = "Ocultar filtros";
const TEXTO_RELACION_1 = "Relación primaria ({0} es propio de la aplicación)";
const TEXTO_RELACION_2 = "Relación secundaria ({0} le pertenece a otra aplicación)";
const TEXTO_RELACION_EXISTENTE = "La relación ya se encuentra registrada, por favor selecciona otra aplicación, equipo o tecnología";
const TEXTO_APP_ELIMINACION = "La aplicación seleccionada se encuentra en un proceso de eliminación, por favor selecciona otra aplicación.";
const MENSAJE_TECNOLOGIA_NOACTIVA = "No es posible activar la relación ya que la tecnología no está presente en el catálogo de CVT";
const MENSAJE_EQUIPO_NOACTIVA = "No es posible activar la relación ya que el equipo está inactivo";

const PERFILES = {
    ADMINISTRADOR: "E195_Administrador"
};
let ARR_PERFILES_USUARIO = [];
let flagMostrar = "";

const SUBDOMINIO_IDS = {
    LP_IDE: "13|14",
    BROWSER: "7",
    SA: "32",
    SW: "45",
    MIDDLEWARE: "63",
    DATABASE: "68|69"
};
const SIDE_FILTER_IDS = {
    SERVIDOR: 1,
    SA: 2,
    SW: 3,
    DATABASE: 4,
    MIDDLEWARE: 5,
    BROWSER: 6,
    LP_IDE: 7,
    SERVICIO_NUBE: 8,
    TODAS_TECNOLOGIAS: 9,
    TECNOLOGIAS: 10,
    SERVICIO_BROKER: 11,
    CERTIFICADO_DIGITAL: 12,
    APIS: 13,
    APLICACIONES: 14,
    CLIENTSECRET: 15
};
const SIDE_FILTER_DATA = [
    {
        id: SIDE_FILTER_IDS.SERVIDOR,
        idHtml: "sideFil01",
        title: "Servidor",
        secondaryTitle: "Servidor",
        description: "Relaciona un recurso aprovisionado",
        active: true,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        idTipoRelacionFilter: TIPO_RELACION.EQUIPO,
        subdominioIds: "",
        idTipoIdFilter: 0,
        RelacionApp: 0
    },
    {
        id: SIDE_FILTER_IDS.SA,
        idHtml: "sideFil02",
        title: "Application Server",
        secondaryTitle: "Application Server",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        //idTipoRelacionFilter: TIPO_RELACION.EQUIPO,
        idTipoRelacionFilter: TIPO_RELACION.ALL,
        subdominioIds: SUBDOMINIO_IDS.SA,
        idTipoIdFilter: 0,
        RelacionApp: 0
    },
    {
        id: SIDE_FILTER_IDS.SW,
        idHtml: "sideFil03",
        title: "Web Server",
        secondaryTitle: "Web Server",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        //idTipoRelacionFilter: TIPO_RELACION.EQUIPO,
        idTipoRelacionFilter: TIPO_RELACION.ALL,
        subdominioIds: SUBDOMINIO_IDS.SW,
        idTipoIdFilter: 0,
        RelacionApp: 0
    },
    {
        id: SIDE_FILTER_IDS.DATABASE,
        idHtml: "sideFil04",
        title: "Bases de datos",
        secondaryTitle: "Bases de datos",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        //idTipoRelacionFilter: TIPO_RELACION.EQUIPO,
        idTipoRelacionFilter: TIPO_RELACION.ALL,
        subdominioIds: SUBDOMINIO_IDS.DATABASE,
        idTipoIdFilter: 0,
        RelacionApp: 0
    },
    {
        id: SIDE_FILTER_IDS.MIDDLEWARE,
        idHtml: "sideFil05",
        title: "Middleware",
        secondaryTitle: "Middleware",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        //idTipoRelacionFilter: TIPO_RELACION.EQUIPO,
        idTipoRelacionFilter: TIPO_RELACION.ALL,
        subdominioIds: SUBDOMINIO_IDS.MIDDLEWARE,
        idTipoIdFilter: 0,
        RelacionApp: 0
    },
    {
        id: SIDE_FILTER_IDS.BROWSER,
        idHtml: "sideFil06",
        title: "Browser",
        secondaryTitle: "Compatibilidad con Navegador",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.TECNOLOGIA,
        //idTipoRelacionFilter: TIPO_RELACION.TECNOLOGIA,
        idTipoRelacionFilter: TIPO_RELACION.ALL,
        subdominioIds: SUBDOMINIO_IDS.BROWSER,
        idTipoIdFilter: 0,
        RelacionApp: 0
    },
    {
        id: SIDE_FILTER_IDS.LP_IDE,
        idHtml: "sideFil07",
        title: "Lenguajes de programación e IDEs",
        secondaryTitle: "Lenguajes de programación e IDEs",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.TECNOLOGIA,
        //idTipoRelacionFilter: TIPO_RELACION.TECNOLOGIA,
        idTipoRelacionFilter: TIPO_RELACION.ALL,
        subdominioIds: SUBDOMINIO_IDS.LP_IDE,
        idTipoIdFilter: 0,
        RelacionApp: 0
    },
    {
        id: SIDE_FILTER_IDS.SERVICIO_NUBE,
        idHtml: "sideFil08",
        title: "Servicio en la nube",
        secondaryTitle: "Servicio en la nube",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.SERVICIO_NUBE,
        idTipoRelacionFilter: TIPO_RELACION.SERVICIO_NUBE,
        subdominioIds: "",
        idTipoIdFilter: 0,
        RelacionApp: 0
    },
    {
        id: SIDE_FILTER_IDS.TODAS_TECNOLOGIAS,
        idHtml: "sideFil09",
        //title: "Tecnologías",
        //secondaryTitle: "Tecnologías",
        title: "Servidor",
        secondaryTitle: "Servidor",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        //idTipoRelacion: TIPO_RELACION.TECNOLOGIA,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        idTipoRelacionFilter: TIPO_RELACION.ALL,
        subdominioIds: "",
        idTipoIdFilter: 0,
        RelacionApp: 0
    },
    {
        id: SIDE_FILTER_IDS.TECNOLOGIAS,
        idHtml: "sideFil10",
        title: "Tecnologías",
        secondaryTitle: "Tecnologías",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.TECNOLOGIA,
        //idTipoRelacion: TIPO_RELACION.EQUIPO,
        idTipoRelacionFilter: TIPO_RELACION.TECNOLOGIA,
        subdominioIds: "",
        idTipoIdFilter: 0,
        RelacionApp: 0
    },
    {
        id: SIDE_FILTER_IDS.SERVICIO_BROKER,
        idHtml: "sideFil11",
        title: "Flujo broker",
        secondaryTitle: "Flujo broker",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.SERVICIO_BROKER,
        //idTipoRelacion: TIPO_RELACION.EQUIPO,
        idTipoRelacionFilter: TIPO_RELACION.SERVICIO_BROKER,
        subdominioIds: "",
        idTipoIdFilter: 0,
        RelacionApp: 0
    },
    {
        id: SIDE_FILTER_IDS.CERTIFICADO_DIGITAL,
        idHtml: "sideFil12",
        title: "Certificados Digitales (CA)",
        secondaryTitle: "Certificados Digitales (CA)",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        //idTipoRelacion: TIPO_RELACION.EQUIPO,
        idTipoRelacionFilter: TIPO_RELACION.EQUIPO,
        subdominioIds: "",
        idTipoIdFilter: 1,
        RelacionApp: 0
    },
    {
        id: SIDE_FILTER_IDS.APIS,
        idHtml: "sideFil13",
        title: "Apis",
        secondaryTitle: "Apis",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.API,
        idTipoRelacionFilter: TIPO_RELACION.API,
        subdominioIds: "",
        idTipoIdFilter: 0,
        RelacionApp: 0
    },
    {
        id: SIDE_FILTER_IDS.APLICACIONES,
        idHtml: "sideFil14",
        title: "Aplicaciones",
        secondaryTitle: "Aplicaciones",
        description: "Relacionar aplicaciones",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        idTipoRelacionFilter: TIPO_RELACION.EQUIPO,
        subdominioIds: "",
        idTipoIdFilter: 2,
        RelacionApp: 1
    },
    {
        id: SIDE_FILTER_IDS.CLIENTSECRET,
        idHtml: "sideFil15",
        title: "Certificados Digitales & Client Secrets (Cloud)",
        secondaryTitle: "Certificados Digitales & Client Secrets (Cloud)",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.CLIENT_SECRET,
        idTipoRelacionFilter: TIPO_RELACION.CLIENT_SECRET,
        subdominioIds: "",
        idTipoIdFilter: 0,
        RelacionApp: 0
    }
];
const INIT_FILTER_ESTADO = [0, 1, 2];
var PAGE_NUMBER_GLOBAL = 1;
var PAGE_SIZE_GLOBAL = 10;
var SORT_NAME_GLOBAL = "RelacionId";
var SORT_ORDER_GLOBAL = "desc";

var CURRENT_SIDE_FILTER = TIPO_RELACION.EQUIPO;
var CURRENT_SUBDOMINIO_LIST = "";
var FLAG_USUARIO_APROBADOR = 0;
$(function () {
    getCurrentUser();
    //ARR_PERFILES_USUARIO = userCurrent !== null ? userCurrent.Perfil.split(";") : [];
    //flagMostrar = ARR_PERFILES_USUARIO.includes(PERFILES.ADMINISTRADOR);

    InitDTP();
    InitTables();
    CargarParametroCD();

    CargarParametroAPIS();

    InitValidateMain();
    InitMultiSelects();
    CargarCombos();
    //$("#cbTipo").change(ChangeCbTipo);
    $("#ddlMotivo").change(Motivo_Change);
    $("#ddlMotivoAppsElimi").change(Motivo_ChangeApps);

    InitCheckInTable($tableTecnologia);
    validarFormOS();
    validarFormOSAppsElimi();
    InitAutocompletarAplicacion($("#txtFilApp"), $("#hdFilAppId"), ".filAppContainer", 0); //Filtro App
    InitAutocompletarAplicacion($("#txtAplicacion"), $("#hdAplicacionId"), ".aplicacionContainer", 0);
    InitAutocompletarAplicacionApps($("#txtAplicacionAppsOrigen"), $("#hdAplicacionIdAppsOrigen"), ".OrigenaplicacionContainer", $("#hdAplicacionDesAppsOrigen"));
    InitAutocompletarAplicacion($("#txtAplicacionAppsDestino"), $("#hdAplicacionIdAppsDestino"), ".DestinoaplicacionContainer", $("#hdAplicacionDesAppsDestino"));

    //InitAutocompletarAplicacion($("#txtAppBase"), $("#hdAppBaseId"), ".appBaseContainer", 0); //App Base
    //InitAutocompletarAplicacion($("#txtAppVinculo"), $("#hdAppVinculoId"), ".appVinculoContainer", 1); //App Vinculo
    InitAutocompletarTecnologia($("#txtFilTecnologia"), $("#hdFilTecnologiaId"), ".filTecContainer");
    InitAutocompletarTecnologia($("#txtTecnologia"), $("#hdTecnologiaId"), ".tecnologiaContainer");
    InitAutocompletarEquipoFiltro($("#txtFilComp"), $("#hdFilCompId"), ".filCompContainer", 0, URL_AUTOCOMPLETE_EQUIPO.FILTROS); //Filtro Componente
    InitAutocompletarEquipo($("#txtEquipo"), $("#hdEquipoId"), ".equipoContainer", URL_AUTOCOMPLETE_EQUIPO.DEFAULT);

    $(".permiso-aprobar").hide();
    $(".permiso-aprobar").addClass("ignore");

    //setDefaultHd($("#txtFilApp"), $("#hdFilAppId"));
    InitHidden($("#txtFilApp"), $("#hdFilAppId"), "");
    InitHidden($("#txtFilTecnologia"), $("#hdFilTecnologiaId"), "0");
    InitHidden($("#txtFilComp"), $("#hdFilCompId"), "0");

    //validarFormAppVin();
    //validarFormAddTec();
    //$("#txtFabricanteTec, #txtNomTec, #txtVerTec").keyup(function () {
    //    $("#txtClaveTecnologia").val(String.Format("{0} {1} {2}", $.trim($("#txtFabricanteTec").val()), $.trim($("#txtNomTec").val()), $.trim($("#txtVerTec").val())));
    //});

    //$("#cbDomTec").on('change', function () {
    //    getSubdominiosByDomCb(this.value, $("#txtSubTec"));
    //});
    $("#cbEstadoFiltro").val(INIT_FILTER_ESTADO);
    $("#cbEstadoFiltro").multiselect("refresh");

    InitSideFilter();
    $("#btnNewRelacion").click(showRelacionModal);
    $("#btnNewRelacionApp").click(showRelacionModalApps);
    $("#btnBuscar").click(RefrescarListado);
    $("#btnExportar").click(ExportarInfo);
    $("#btnAuditoria").click(ShowHideActions);
    $("#btnFilters").click(ShowHideFilters);
    $("#btnRegistrar").click(RegistrarAddOrEdit);
    $("#btnRegistrarApps").click(RelacionesAppAddOrEdit);
    $("#btnSidebar").click(openCloseNav);
    $("#btnSidebar").trigger("click");

    InitViewSection(SIDE_FILTER_IDS.TODAS_TECNOLOGIAS);

    $("#btnSidebar").hide();

    MethodValidarFecha(RANGO_DIAS_HABILES);
    ValidarFiltros();

    //if (flagMostrar) $("#btnContinuarR").click(function () { OpenCloseModal($("#mdMessageRemove"), false); OpenCloseModal($("#mdOS"), true); });

    $table.bootstrapTable("hideColumn", 'CodigoAptOrigen');
    $table.bootstrapTable("hideColumn", 'NombreAptOrigen');
    $table.bootstrapTable("hideColumn", 'CodigoAptDestino');
    $table.bootstrapTable("hideColumn", 'NombreAptDestino');
    $table.bootstrapTable("hideColumn", 'DescripcionTipoRelacion');

    $("#btnNewRelacionApp").hide();
});

function ShowHideFilters() {
    let $button = $(this);
    let title = $button.hasClass("collapsed") ? TEXTO_OCULTAR_FILTROS : TEXTO_MOSTRAR_FILTROS;
    $button.prop("title", title);
}

function InitModalByFilters() {
    //App
    let txtAppFilter = $.trim($("#txtFilApp").val());
    let hdAppFilter = $.trim($("#hdFilAppId").val());
    let $txtAppModal = $("#txtAplicacion");
    let $hdAppModal = $("#hdAplicacionId");
    if (hdAppFilter !== "") {
        $txtAppModal.val(txtAppFilter);
        $hdAppModal.val(hdAppFilter);
    }

    //Tecnologia
    let txtTecFilter = $.trim($("#txtFilTecnologia").val());
    let hdTecFilter = $.trim($("#hdFilTecnologiaId").val());
    let $txtTecModal = $("#txtTecnologia");
    let $hdTecModal = $("#hdTecnologiaId");
    if (hdTecFilter !== "" && hdTecFilter !== "0") {
        $txtTecModal.val(txtTecFilter);
        $hdTecModal.val(hdTecFilter);
        let itemTecnologia = GetTecnologiaAutocompleteById(parseInt(hdTecFilter));
        if (itemTecnologia !== null) setReadOnlyDataTecnologia(itemTecnologia);
    }

    //Equipo
    let txtEquipoFilter = $.trim($("#txtFilComp").val());
    let hdEquipoFilter = $.trim($("#hdFilCompId").val());
    let $txtEquipoModal = $("#txtEquipo");
    let $hdEquipoModal = $("#hdEquipoId");
    if (hdEquipoFilter !== "" && hdEquipoFilter !== "0") {
        $txtEquipoModal.val(txtEquipoFilter);
        $hdEquipoModal.val(hdEquipoFilter);
        ObtenerInstanciasEquipo();
        FiltrarEquipoTecnologia();
    }
}

const showRelacionModal = () => {
    $("#titleModalRelacion").html("Nueva Relación");
    let _id = parseInt($("#hdIdOptSideBar").val());
    InitViewSection(_id, false, true);
    /*$("#msjUsuarioRepetido").hide();*/
    OpenCloseModal($("#mdNewOrEditRelacion"), true);
};



const InitTables = () => {
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({ data: [] });
    $tableTecnologia.bootstrapTable("destroy");
    $tableTecnologia.bootstrapTable({ data: [] });
};

const InitMultiSelects = () => {
    SetItemsMultiple([], $("#cbEstadoFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#ddlAmbienteFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#ddlFuncion"), TEXTO_TODOS, TEXTO_TODOS, true);
};

const InitDTP = () => {
    //$("#dpFecConsulta-btn").datetimepicker({
    //    locale: 'es',
    //    useCurrent: true,
    //    format: 'DD/MM/YYYY'
    //});
    _BuildDatepicker($("#txtFilFecha"));
};

const InitSideFilter = () => {
    $(".list-group-item").click(function () {
        $(".list-group-item").removeClass("active");
        let $divGroupItem = $(this);
        $divGroupItem.addClass("active");
        $("#mySidepanel").prepend($divGroupItem);

        let listId = $divGroupItem.prop("id");
        setFilterAndSearch(listId);
    });
};

function setFilterAndSearch(listId) {
    let idFilter = listId.substr(listId.length - 2);
    let idParsed = parseInt(idFilter, 10); //01 - 09
    let item = SIDE_FILTER_DATA.find(x => x.id === idParsed) || null;
    if (item !== null) {
        //Set filters

        $("#hdIdOptSideBar").val(item.id);
        CURRENT_SIDE_FILTER = item.idTipoRelacionFilter;
        CURRENT_SUBDOMINIO_LIST = item.subdominioIds;
        if (item.idTipoIdFilter == 1) {
            PAGE_TIPO_EQUIPO_ID_CD = TIPO_EQUIPO_ID_CD;
            Param_RelacionApp = 0;
            $("#btnNewRelacion").hide();
            $("#btnNewRelacionApp").hide();
        } else if (item.idTipoIdFilter == 2) {
            PAGE_TIPO_EQUIPO_ID_CD = 0;
            Param_RelacionApp = 1;
            $("#btnNewRelacionApp").show();
            $("#btnNewRelacion").hide();
        } else {

            PAGE_TIPO_EQUIPO_ID_CD = 0;
            if (item.idTipoRelacionFilter.toString() == '6' ||
                parseInt(item.idTipoRelacionFilter) == parseInt(TIPO_RELACION.CLIENT_SECRET)) {
                Param_RelacionApp = 0;
                $("#btnNewRelacion").hide();
                $("#btnNewRelacionApp").hide();
            } else {
                Param_RelacionApp = 0;
                $("#btnNewRelacionApp").hide();
                $("#btnNewRelacion").show();
            }
        }
        CURRENT_SIDE_FILTER = CURRENT_SIDE_FILTER.toString();


        PAGE_NUMBER_GLOBAL = 1;
        ListarRegistros_2();

        //Set view modal
        ChangeCbTipo(item);
    }
}

function Motivo_Change() {
    var ddlVal = $(this).val();
    LimpiarValidateErrores($("#formOS"));
    if (ddlVal === "4") {
        $(".input-obs").removeClass("ignore");
        $(".divObs").show();
    }
    else {
        $(".input-obs").addClass("ignore");
        $(".divObs").hide();
    }
}

function ChangeModalcbNuevoEstado() {
    let FLAG_MOSTRAR_OBSERVACION = false;
    let placeholder = "";
    let estadoId = parseInt($("#hdEstadoId").val()); // ESTADO ACTUAL
    if (estadoId === ESTADO_RELACION.PENDIENTE) {
        FLAG_MOSTRAR_OBSERVACION = parseInt($(this).val()) === ESTADO_RELACION.DESAPROBADO;
        placeholder = "Ingrese los motivos de la Desaprobación";
    } else if (estadoId === ESTADO_RELACION.PENDIENTEELIMINACION) {
        FLAG_MOSTRAR_OBSERVACION = parseInt($(this).val()) === ESTADO_RELACION.APROBADO;
        placeholder = "Ingrese los motivos por los que no aprobó la eliminación";
    }
    if (FLAG_MOSTRAR_OBSERVACION) {
        $(".form-group.form-modal-cambioestado").show();
        $("#txtObservacion").attr("placeholder", placeholder);
    } else {
        $(".form-group.form-modal-cambioestado").hide();
    }

}
function InitCheckInTable($table) {
    $table.on("check-all.bs.table", function (e, row) {
        // marco todos, debo habilitar todos
        //$(".format-relevancia").removeClass("bloq-element");
        //$(".format-relevancia").addClass("valid-element");
        //console.log("check-all.bs.table", row);
        //ValidacionRelacionTecnologiaDetalle();
        $.each(row, function (i, item) {
            ConfigcbRelevanciaCheck(item.Id);
            ConfigInputComponenteCheck(item.Id);
            ConfigcbComponenteCheck(item.Id);
        });
    }).on("uncheck-all.bs.table", function (e, row) {
        // Desmarco todos, debo bloquear todos value
        //$(".format-relevancia").addClass("bloq-element");
        //$(".format-relevancia").removeClass("valid-element");
        //console.log("uncheck-all.bs.table", row);
        //ValidacionRelacionTecnologiaDetalle();
        $.each(row, function (i, item) {
            ConfigcbRelevanciaUnCheck(item.Id);
            ConfigInputComponenteUnCheck(item.Id);
            ConfigcbComponenteUnCheck(item.Id);
        });
    }).on("check.bs.table", function (e, row, args) {
        // marco 1, debo habilitar uno value
        //$(`#cbRelevanciaEquipo${row.Id}`).removeClass("bloq-element");
        //$(`#cbRelevanciaEquipo${row.Id}`).addClass("valid-element");
        //ValidacionRelacionTecnologiaDetalle();
        ConfigcbRelevanciaCheck(row.Id);
        ConfigInputComponenteCheck(row.Id);
        ConfigcbComponenteCheck(row.Id);
    }).on("uncheck.bs.table", function (e, row) {
        // Desmarco 1, debo bloquear uno value
        //let data_TMP = DATA_TECNOLOGIA_DESMARCADO.find(x => x == row.Id) || null;
        //if (data_TMP == null)
        //    DATA_TECNOLOGIA_DESMARCADO.push(row.Id);
        ConfigcbRelevanciaUnCheck(row.Id);
        ConfigInputComponenteUnCheck(row.Id);
        ConfigcbComponenteUnCheck(row.Id);
        //$(`#cbRelevanciaEquipo${row.Id}`).addClass("bloq-element");
        //$(`#cbRelevanciaEquipo${row.Id}`).removeClass("valid-element");

    });
}
function ConfigcbRelevanciaCheck(Id) {
    let $combo = $(`#cbRelevanciaEquipo${Id}`);
    $combo.removeClass("bloq-element");
    $combo.addClass("valid-element");

    let data_TMP = DATA_TECNOLOGIA_DESMARCADO.find(x => x === Id) || null;
    if (data_TMP !== null)
        DATA_TECNOLOGIA_DESMARCADO = DATA_TECNOLOGIA_DESMARCADO.filter(x => x !== data_TMP);

    ValidacionRelacionTecnologiaDetalle();
}
function ConfigcbRelevanciaUnCheck(Id) {
    let $combo = $(`#cbRelevanciaEquipo${Id}`);
    $combo.addClass("bloq-element");
    $combo.removeClass("valid-element");

    let data_TMP = DATA_TECNOLOGIA_DESMARCADO.find(x => x === Id) || null;
    if (data_TMP === null)
        DATA_TECNOLOGIA_DESMARCADO.push(Id);

    ValidacionRelacionTecnologiaDetalle();
}
function ConfigcbComponenteCheck(Id) {
    let $combo = $(`#cboComponente${Id}`);
    $combo.removeClass("bloq-element");
    $combo.addClass("valid-element");

    let data_TMP = DATA_TECNOLOGIA_DESMARCADO.find(x => x === Id) || null;
    if (data_TMP !== null)
        DATA_TECNOLOGIA_DESMARCADO = DATA_TECNOLOGIA_DESMARCADO.filter(x => x !== data_TMP);

    ValidacionInputRelacionTecnologiaDetalle();
}
function ConfigcbComponenteUnCheck(Id) {
    let $combo = $(`#cboComponente${Id}`);
    $combo.addClass("bloq-element");
    $combo.removeClass("valid-element");

    let data_TMP = DATA_TECNOLOGIA_DESMARCADO.find(x => x === Id) || null;
    if (data_TMP === null)
        DATA_TECNOLOGIA_DESMARCADO.push(Id);

    ValidacionInputRelacionTecnologiaDetalle();
}
function ConfigInputComponenteCheck(Id) {
    let $input = $(`#txtComponente${Id}`);
    $input.removeClass("bloq-element");
    $input.addClass("valid-element");

    let data_TMP = DATA_TECNOLOGIA_DESMARCADO.find(x => x === Id) || null;
    if (data_TMP !== null)
        DATA_TECNOLOGIA_DESMARCADO = DATA_TECNOLOGIA_DESMARCADO.filter(x => x !== data_TMP);

    //ValidacionRelacionTecnologiaDetalle();
    ValidacionInputRelacionTecnologiaDetalle();
}

function ConfigInputComponenteUnCheck(Id) {
    let $input = $(`#txtComponente${Id}`);
    //$input.addClass("bloq-element");
    $input.addClass("bloq-element");
    $input.removeClass("valid-element");

    let data_TMP = DATA_TECNOLOGIA_DESMARCADO.find(x => x === Id) || null;
    if (data_TMP === null)
        DATA_TECNOLOGIA_DESMARCADO.push(Id);

    ValidacionInputRelacionTecnologiaDetalle();
}

function ValidacionRelacionTecnologiaDetalle() {
    $(".form-control.format-relevancia.bloq-element").each((ic, ec) => {
        $(`#${ec.id}`).rules("remove");
    });
    $(".form-control.format-relevancia.valid-element").each((ic, ec) => {
        $(`#${ec.id}`).rules("add", {
            requiredSelect: true,
            messages: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "la relevancia")
            }
        });
    });
}

function ValidacionInputRelacionTecnologiaDetalle() {
    $(".form-control.format-componente.bloq-element").each((ic, ec) => {
        $(`#${ec.id}`).rules("remove");
    });
    $(".form-control.comboComponente.valid-element").each((ic, ec) => {
        $(`#${ec.id}`).rules("add", {
            requiredSelect: true,
            messages: {
                requiredSelect: String.Format("Debes ingresar {0}.", "un nombre de base de datos")
            }
        });
    });
}

function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({
        locale: "es-SP",
        url: URL_API_VISTA + "/Listado",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: 20,
        pageList: OPCIONES_PAGINACION,
        sortName: "RelacionId",
        sortOrder: "desc",
        uniqueId: "RelacionId",
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            //DATA_EXPORTAR.nombre = $("#txtFilApp").val();
            //DATA_EXPORTAR.CodigoAPT = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $("#txtFilApp").val();//$("#txtFilApp").val() || ""; //$("#hdFilAppId").val();
            DATA_EXPORTAR.CodigoAPT = $.trim($("#hdFilAppId").val());
            DATA_EXPORTAR.Componente = $("#txtFilComp").val() || "";
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.TipoRelacionId = $("#cbTipoRelacionFiltro").val() === "-1" ? null : $("#cbTipoRelacionFiltro").val();
            DATA_EXPORTAR.EstadoId = $("#cbEstadoFiltro").val() === "-2" ? null : $("#cbEstadoFiltro").val();
            //DATA_EXPORTAR.DominioId = $("#cbDominioFiltro").val() === "-1" ? null : $("#cbDominioFiltro").val();
            //DATA_EXPORTAR.SubdominioId = $("#cbSubdominioFiltro").val() === "-1" ? null : $("#cbSubdominioFiltro").val();
            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadSuccess: function (status, res) {
            //CargarPermisos(objPermiso);
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
        onExpandRow: function (index, row, $detail) {
            let data = ListarRegistrosDetalle(row.RelacionId);
            if (data.length > 0) {
                console.log(data);
                $('#tblRegistrosDetalle_' + row.RelacionId).bootstrapTable("destroy");
                $('#tblRegistrosDetalle_' + row.RelacionId).bootstrapTable({
                    data: data
                });

                $('#tblRegistrosDetalle_' + row.RelacionId).bootstrapTable("hideLoading");
            } else $detail.empty().append("No existe registros");
        }
    });
}

function ListarRegistrosDetalle(Id) {
    let data = [];
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarDetalle/" + Id,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                data = dataObject;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return data;
}
function RefrescarListado() {
    //ListarRegistros();
    ListarRegistros_2();
}

function ListarRegistros_2() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({
        locale: "es-SP",
        url: URL_API_VISTA + "/Bandeja/Listado",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        //pageNumber: PAGE_NUMBER_GLOBAL,
        pageSize: PAGE_SIZE_GLOBAL,
        pageList: OPCIONES_PAGINACION,
        sortName: SORT_NAME_GLOBAL,
        sortOrder: SORT_ORDER_GLOBAL,
        uniqueId: "RelacionId",
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            //DATA_EXPORTAR.CodigoAPT = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $.trim($("#txtFilApp").val());
            DATA_EXPORTAR.CodigoAPT = $.trim($("#hdFilAppId").val());
            DATA_EXPORTAR.Componente = $.trim($("#txtFilComp").val());
            DATA_EXPORTAR.Tecnologia = $.trim($("#txtFilTecnologia").val());

            DATA_EXPORTAR.AmbienteIdStr = $.isArray($("#ddlAmbienteFiltro").val()) ? $("#ddlAmbienteFiltro").val().join("|") : "";
            DATA_EXPORTAR.EstadoIdStr = $.isArray($("#cbEstadoFiltro").val()) ? $("#cbEstadoFiltro").val().join("|") : "";

            DATA_EXPORTAR.FechaConsulta = $.trim($("#txtFilFecha").val()) === "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#txtFilFecha").val())).format("YYYY-MM-DD");

            PAGE_NUMBER_GLOBAL = p.pageNumber;
            PAGE_SIZE_GLOBAL = p.pageSize;
            SORT_NAME_GLOBAL = p.sortName;
            SORT_ORDER_GLOBAL = p.sortOrder;

            DATA_EXPORTAR.pageNumber = PAGE_NUMBER_GLOBAL;
            DATA_EXPORTAR.pageSize = PAGE_SIZE_GLOBAL;
            DATA_EXPORTAR.sortName = SORT_NAME_GLOBAL;
            DATA_EXPORTAR.sortOrder = SORT_ORDER_GLOBAL;

            //DATA_EXPORTAR.TipoRelacionId = $("#cbTipoRelacionFiltro").val() === "-1" ? null : $("#cbTipoRelacionFiltro").val();
            DATA_EXPORTAR.TipoRelacionId = CURRENT_SIDE_FILTER === "-1" ? null : CURRENT_SIDE_FILTER;
            DATA_EXPORTAR.SubdominioIds = CURRENT_SUBDOMINIO_LIST;
            DATA_EXPORTAR.TipoEquipoId = PAGE_TIPO_EQUIPO_ID_CD;
            DATA_EXPORTAR.RelacionApp = Param_RelacionApp;
            DATA_EXPORTAR.AplicacionRelacion = $.trim($("#hdFilAppId").val());
            //DATA_EXPORTAR.DominioId = $("#cbDominioFiltro").val() === "-1" ? null : $("#cbDominioFiltro").val();
            //DATA_EXPORTAR.SubdominioId = $("#cbSubdominioFiltro").val() === "-1" ? null : $("#cbSubdominioFiltro").val();
            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;

            if (Param_RelacionApp == 1) {
                $table.bootstrapTable("showColumn", 'CodigoAptOrigen');
                $table.bootstrapTable("showColumn", 'NombreAptOrigen');
                $table.bootstrapTable("showColumn", 'CodigoAptDestino');
                $table.bootstrapTable("showColumn", 'NombreAptDestino');
                $table.bootstrapTable("showColumn", 'DescripcionTipoRelacion');
                $table.bootstrapTable("hideColumn", 'TipoStr');
                $table.bootstrapTable("hideColumn", 'Componente');
                $table.bootstrapTable("hideColumn", 'AmbienteStr');
                $table.bootstrapTable("hideColumn", 'Tecnologia');
                $table.bootstrapTable("hideColumn", 'CodigoAPT');
                $table.bootstrapTable("hideColumn", 'AplicacionStr');
                $table.bootstrapTable("hideColumn", 'DescTipoRelacionComp');
            } else {
                if (PAGE_TIPO_EQUIPO_ID_CD != 0) {
                    $table.bootstrapTable("hideColumn", "RelacionId");
                    $table.bootstrapTable("hideColumn", "Tecnologia");
                    $table.bootstrapTable("hideColumn", 'CodigoAptOrigen');
                    $table.bootstrapTable("hideColumn", 'NombreAptOrigen');
                    $table.bootstrapTable("hideColumn", 'CodigoAptDestino');
                    $table.bootstrapTable("hideColumn", 'NombreAptDestino');
                    $table.bootstrapTable("hideColumn", 'DescripcionTipoRelacion');
                    $table.bootstrapTable("showColumn", 'TipoStr');
                } else {
                    $table.bootstrapTable("hideColumn", 'CodigoAptOrigen');
                    $table.bootstrapTable("hideColumn", 'NombreAptOrigen');
                    $table.bootstrapTable("hideColumn", 'CodigoAptDestino');
                    $table.bootstrapTable("hideColumn", 'NombreAptDestino');
                    $table.bootstrapTable("hideColumn", 'DescripcionTipoRelacion');
                    $table.bootstrapTable("showColumn", 'TipoStr');
                }
            }

            if (CURRENT_SIDE_FILTER.toString() == '6' ||
                CURRENT_SIDE_FILTER == TIPO_RELACION.CLIENT_SECRET) {
                $table.bootstrapTable("hideColumn", "RelacionId");
                $table.bootstrapTable("hideColumn", "Tecnologia");
            }

            return { rows: data.Rows, total: data.Total };
        },
        onLoadSuccess: function (status, res) {
            let _id = parseInt($("#hdIdOptSideBar").val());
            let item = SIDE_FILTER_DATA.find(x => x.id === _id) || null;
            if (item !== null && item.id !== SIDE_FILTER_IDS.TODAS_TECNOLOGIAS) $("#cptRelaciones").html(`Relaciones - ${item.title}`);
            SetShowHideAuditoria();
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
        //onExpandRow: function (index, row, $detail) {
        //    let data = ListarRegistrosDetalle(row.RelacionId);
        //    //debugger;
        //    if (data.length > 0) {
        //        console.log(data);
        //        $('#tblRegistrosDetalle_' + row.RelacionId).bootstrapTable("destroy");
        //        $('#tblRegistrosDetalle_' + row.RelacionId).bootstrapTable({
        //            data: data
        //        });

        //        $('#tblRegistrosDetalle_' + row.RelacionId).bootstrapTable("hideLoading");
        //    } else $detail.empty().append("No existe registros");
        //}
    });
}


function GuardarNuevoEstado() {
    $(".form-principal").addClass("ignore");
    $(".tipo-tecnologia").addClass("ignore");
    $(".tipo-equipo").addClass("ignore");
    $(".form-aprobar").addClass("ignore");
    $(".form-modal-cambioestado").removeClass("ignore");
    if ($("#formCambioEstado").valid()) {
        console.log("Guardar nuevo estado");
        IrCambiarEstado($("#hdId").val(), $("#cbNuevoEstado").val(), $("#txtObservacion").val());
    }
}

function OpenModal() {
    $("#titleForm").html("Nueva Relación");
    $("#hdId").val("");
    MdAddOrEditRegistro(true);

    $(".form-principal").removeClass("bloq-element");
    $(".tipo-tecnologia").removeClass("bloq-element");
    $(".tipo-equipo").removeClass("bloq-element");
    $(".tipo-aplicacion").removeClass("bloq-element");
}
function MdAddOrEditRegistro(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    $("#formAddOrEdit").validate().resetForm();
    if (EstadoMd)
        $("#MdAddOrEditModal").modal(opcionesModal);
    else
        $("#MdAddOrEditModal").modal("hide");
}
function MdCambioEstado(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    $("#formCambioEstado").validate().resetForm();
    if (EstadoMd)
        $("#mdCambioEstado").modal(opcionesModal);
    else
        $("#mdCambioEstado").modal("hide");
}
function ExportarInfo() {

    DATA_EXPORTAR = {};

    //DATA_EXPORTAR.CodigoAPT = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $.trim($("#txtFilApp").val());
    DATA_EXPORTAR.CodigoAPT = $.trim($("#hdFilAppId").val());
    DATA_EXPORTAR.Componente = $.trim($("#txtFilComp").val());
    DATA_EXPORTAR.Tecnologia = $.trim($("#txtFilTecnologia").val());

    DATA_EXPORTAR.TipoRelacionId = CURRENT_SIDE_FILTER === "-1" ? null : CURRENT_SIDE_FILTER;
    DATA_EXPORTAR.SubdominioIds = CURRENT_SUBDOMINIO_LIST;
    DATA_EXPORTAR.TipoEquipoId = PAGE_TIPO_EQUIPO_ID_CD;
    //DATA_EXPORTAR.EstadoId = $("#cbEstadoFiltro").val();
    //DATA_EXPORTAR.AmbienteId = $("#ddlAmbienteFiltro").val() === "-1" ? null : $("#ddlAmbienteFiltro").val();
    DATA_EXPORTAR.AmbienteIdStr = $.isArray($("#ddlAmbienteFiltro").val()) ? $("#ddlAmbienteFiltro").val().join("|") : "";
    DATA_EXPORTAR.EstadoIdStr = $.isArray($("#cbEstadoFiltro").val()) ? $("#cbEstadoFiltro").val().join("|") : "";
    DATA_EXPORTAR.FechaConsulta = $.trim($("#txtFilFecha").val()) === "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#txtFilFecha").val())).format("YYYY-MM-DD");
    let url = "";
    if (Param_RelacionApp == 1) {
        url = `${URL_API_VISTA}/Bandeja/ExportarReporteRelacionesApps?CodigoAPT=${DATA_EXPORTAR.CodigoAPT}&EstadoIdStr=${DATA_EXPORTAR.EstadoIdStr}&FechaConsulta=${DATA_EXPORTAR.FechaConsulta}`;
    } else {
        url = `${URL_API_VISTA}/Bandeja/Exportar?codigoAPT=${DATA_EXPORTAR.CodigoAPT}&componente=${DATA_EXPORTAR.Componente}&tecnologia=${DATA_EXPORTAR.Tecnologia}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&tipoRelacionId=${DATA_EXPORTAR.TipoRelacionId}&estadoId=${DATA_EXPORTAR.EstadoIdStr}&subdominioIds=${DATA_EXPORTAR.SubdominioIds}&ambienteId=${DATA_EXPORTAR.AmbienteIdStr}&fechaConsulta=${DATA_EXPORTAR.FechaConsulta}&TipoEquipoId=${DATA_EXPORTAR.TipoEquipoId}`;
    }
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
function opcionesFormatter(value, row) {
    let eliminar = "";
    let cambiarEstado = "";
    let fechaCuarentena = ""
    let reiniciarEstado = "";
    let comentarios = "";

    if (row.Aprobar === 'true') {

        if (row.EstadoId === ESTADO_RELACION.APROBADO) {
            if (Param_RelacionApp == 1) {
                eliminar = `<a href="javascript:IrEliminarRegistroApp(${row.RelacionId},'${row.CodigoAptOrigen}', '${row.CodigoAptDestino}', '${row.TipoId}');" title="Eliminar registro"><i style="" class="glyphicon glyphicon-trash table-icon"></i></a>`;
            } else {
                eliminar = `<a href="javascript:IrEliminarRegistrov2(${value},${row.EquipoId},${row.TipoId});" title="Eliminar registro"><i style="" class="glyphicon glyphicon-trash table-icon"></i></a>`;
            }
        }
        else {
            eliminar = `<a title="Eliminar registro" disabled="disabled" ><i style="color:#A5A9AC;" class="glyphicon glyphicon-trash table-icon"></i></a>`;
        }

        if (row.EstadoId === ESTADO_RELACION.PENDIENTE || row.EstadoId === ESTADO_RELACION.PENDIENTEELIMINACION) {
            if (Param_RelacionApp == 1) {
                cambiarEstado = `<a href="javascript:IrAbrirModalCambioEstadoAppsEst(${row.RelacionId},'${row.CodigoAptOrigen}', '${row.CodigoAptDestino}', '${row.TipoId}',${row.EstadoId},'${row.EstadoStr}')" title="Cambiar estado"><span class="icon icon-rotate-right"></span></a>`;
            } else {
                cambiarEstado = `<a href="javascript:IrAbrirModalCambioEstado(${row.RelacionId},${row.EstadoId},'${row.EstadoStr}')" title="Cambiar estado"><span class="icon icon-rotate-right"></span></a>`;
            }
        } else {
            cambiarEstado = `<a title="Cambiar estado"><span style="color:#A5A9AC;" class="icon icon-rotate-right"></span></a>`;
        }

        if (row.EstadoId == ESTADO_RELACION.SUSPENDIDO) {
            fechaCuarentena = `<a href="javascript:IrFechaCuarentena('${row.AplicacionStr.toString()}','${row.FechaRegistroCuarentenaFormat.toString()}','${row.FechaFinCuarentenaFormat.toString()}');" title="Fecha cuarentena"><i style="" class="glyphicon glyphicon-info-sign"></i></a>`;
            ARR_PERFILES_USUARIO = userCurrent !== null ? userCurrent.Perfil.split(";") : [];
            flagMostrar = ARR_PERFILES_USUARIO.includes(PERFILES.ADMINISTRADOR);
            if (flagMostrar) {
                eliminar = `<a href="javascript:IrEliminarRegistrov2(${value},${row.EquipoId},${row.TipoId});" title="Eliminar registro"><i style="" class="glyphicon glyphicon-trash table-icon"></i></a>`;
            }
        }

        if (row.EstadoId === -1 || row.EstadoId === ESTADO_RELACION.DESAPROBADO) {
            if (Param_RelacionApp == 1) {
                reiniciarEstado = `<a href="javascript:irReiniciarEstadoApps(${row.RelacionId},'${row.CodigoAptOrigen}','${row.CodigoAptDestino}', ${row.TipoId});" title="Reiniciar estado"><i style="" class="glyphicon glyphicon-retweet table-icon"></i></a>`;
            } else {
                reiniciarEstado = `<a href="javascript:irReiniciarEstado(${value}, ${row.TipoId}, ${row.TecnologiaId}, ${row.EquipoId});" title="Reiniciar estado"><i style="" class="glyphicon glyphicon-retweet table-icon"></i></a>`;
            }
        }

        if (row.EstadoId === -1) {
            if (Param_RelacionApp == 1) {
                comentarios = `<a href="javascript:verComentariosRelacionAppEliminada(${row.RelacionId});" title="Ver motivo de eliminación"><i style="" class="glyphicon glyphicon-zoom-out table-icon"></i></a>`;
            } else {
                comentarios = `<a href="javascript:verComentarios(${value});" title="Ver motivo de eliminación"><i style="" class="glyphicon glyphicon-zoom-out table-icon"></i></a>`;
            }
        }

        var opcion = '';
        opcion = eliminar.concat("&nbsp;&nbsp;", cambiarEstado).concat("&nbsp;&nbsp;", fechaCuarentena).concat("&nbsp;&nbsp;", reiniciarEstado).concat("&nbsp;&nbsp;", comentarios);
        //if (row.TipoEquipoId != TIPO_EQUIPO_ID_CD && row.TipoEquipoId != TIPO_EQUIPO_ID_APIS) {
        //    
        //} else {
        //    opcion = '';
        //}
        if (row.TipoEquipoId == TIPO_EQUIPO_ID_CD) {
            opcion = ''
        }

        if (row.TipoId == TIPO_RELACION.API) {
            opcion = ''
        }

        if (row.TipoId == TIPO_RELACION.CLIENT_SECRET) {
            opcion = ''
        }


        return opcion;
    }
    else
        return '';
}

function relacionDetalleFormatter(value, row) {
    let eliminar = "";
    eliminar = `<a href="javascript:IrEliminarDetalle(${row.RelacionDetalleId});" title="Eliminar registro"><i style="" class="glyphicon glyphicon-trash table-icon"></i></a>`;
    return eliminar;
}

function IrEliminarDetalle(id) {
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
                let data = {
                    Id: id,
                };
                AjaxCambiarEstadoDetalle(data);
            }
        }
    });
}

function AjaxCambiarEstadoDetalle(data) {
    $.ajax({
        url: URL_API_VISTA + "/EliminarRelacionDetalle",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (result) {
            if (result) {
                toastr.success("Se realizó la desactivación correctamente.", TITULO_MENSAJE);
            }
        },
        complete: function (data) {
            if (ControlarCompleteAjax(data)) {
                bootbox.hideAll();
                ListarRegistros_2();
            } else
                MensajeErrorCliente();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function verComentarios(Id) {
    $("#hdId").val(Id);
    let contenido = GetComentarioByRelacionId();
    contenido = contenido === null || $.trim(contenido) === "" ? "-" : contenido;
    bootbox.alert({
        size: "sm",
        title: "Motivo de Eliminación",
        message: contenido,
        buttons: {
            ok: {
                label: 'Cerrar',
                className: 'btn-primary'
            }
        }
    });
}

function verComentariosRelacionAppEliminada(Id) {
    let contenido = GetComentarioRelacionAppEliminadaByRelacionId(Id);
    contenido = contenido === null || $.trim(contenido) === "" ? "-" : contenido;
    bootbox.alert({
        size: "sm",
        title: "Motivo de Eliminación",
        message: contenido,
        buttons: {
            ok: {
                label: 'Cerrar',
                className: 'btn-primary'
            }
        }
    });
}

function linkFormatter(value, row) {
    //return `<a href="javascript:EditRegistro2(${row.RelacionId}, ${row.EstadoId}, '${row.EstadoStr}')" title="Editar relación">${value}</a>`;
    var opcion;
    if (row.TipoEquipoId == TIPO_EQUIPO_ID_CD) {
        opcion = `<a href="javascript:VerCertificado(${row.RelacionId}, ${row.EstadoId}, '${row.EstadoStr}')" title="Ver relación">${value}</a>`;
    }
    else if (row.TipoEquipoId == TIPO_EQUIPO_ID_APIS) {
        opcion = `<a href="javascript:VerApi(${row.RelacionId}, ${row.EstadoId}, '${row.EstadoStr}')" title="Ver relación">${value}</a>`;

    } else if (row.TipoId == TIPO_RELACION.CLIENT_SECRET) {
        opcion = `<a href="javascript:VerClientSecret(${row.RelacionId}, ${row.EstadoId}, '${row.EstadoStr}')" title="Ver relación">${value}</a>`;

    }
    else {
        opcion = `<a href="javascript:EditRegistro(${row.RelacionId}, ${row.EstadoId}, '${row.EstadoStr}')" title="Editar relación">${value}</a>`;
    }


    return opcion;
}
function linkFormatterApps(value, row) {
    var opcion = `<a href="javascript:EditarRelacionApp(${row.RelacionId},'${row.CodigoAptOrigen}', '${row.NombreAptOrigen}', '${row.CodigoAptDestino}','${row.NombreAptDestino}', ${row.TipoId},${row.EstadoId},'${row.EstadoStr}')" title="Editar relación">${value}</a>`;
    return opcion;
}
function IrAbrirModalCambioEstado(Id, EstadoId, EstadoStr) {
    MdCambioEstado(true);
    $("#hdId").val(Id);
    $("#hdEstadoId").val(EstadoId);
    switch (EstadoId) {
        case ESTADO_RELACION.PENDIENTE:
            $("#txtObservacion").prop("disabled", false);
            $("#txtObservacion").val("");
            $(".form-group.form-modal-cambioestado").hide();
            SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTE_MODAL.includes(x.Id)), $("#cbNuevoEstado"), TEXTO_SELECCIONE);
            break;
        case ESTADO_RELACION.PENDIENTEELIMINACION:
            let comentario = GetComentarioByRelacionId();
            $("#txtObservacion").val(comentario);
            $("#txtObservacion").prop("disabled", true);
            $(".form-group.form-modal-cambioestado").show();
            SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTEELIMINACION_MODAL.includes(x.Id)), $("#cbNuevoEstado"), TEXTO_SELECCIONE);
            break;
    }

    //if (EstadoId === ESTADO_RELACION.PENDIENTE) {
    //    SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTE_MODAL.includes(x.Id)), $("#cbNuevoEstado"), TEXTO_SELECCIONE);
    //} else if (EstadoId === ESTADO_RELACION.PENDIENTEELIMINACION) {
    //    SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTEELIMINACION_MODAL.includes(x.Id)), $("#cbNuevoEstado"), TEXTO_SELECCIONE);
    //}

    $("#cbNuevoEstado").val(-1);
    $("#cbNuevoEstado").trigger("change");
    $("#txtEstadoActual").val(EstadoStr);
}

function IrCambiarEstado(Id, EstadoId, Observacion) {
    let mensaje = "";
    Observacion = Observacion || null;
    let estadoId = parseInt(EstadoId);

    let data = {
        Id: $("#hdId").val(),
        EstadoId: estadoId,
    };

    let estadoActual = parseInt($("#hdEstadoId").val());
    switch (estadoActual) {
        case ESTADO_RELACION.PENDIENTEELIMINACION:
            mensaje = "¿Estás seguro de {0} la ELIMINACIÓN de la Relación?";
            CasoPendienteEliminacion(estadoId, data, mensaje, Observacion);
            break;
        case ESTADO_RELACION.PENDIENTE:
            mensaje = "¿Estás seguro de {0} la relación?";
            CasoPendiente(estadoId, data, mensaje, Observacion);
            break;
    }
}
function CasoPendiente(estadoId, data, mensaje, Observacion) {
    if (estadoId === ESTADO_RELACION.APROBADO) {
        mensaje = String.Format(mensaje, "APROBAR");
        bootbox.confirm({
            message: mensaje,
            buttons: {
                confirm: {
                    label: "Aprobar",
                    className: "btn btn-primary"
                },
                cancel: {
                    label: "Cancelar",
                    className: "btn btn-secondary"
                }
            },
            callback: function (result) {
                if (result) {
                    AjaxCambiarEstado(data);
                }
            }
        });

    } else if (estadoId === ESTADO_RELACION.DESAPROBADO) {

        if (Observacion === null) {
            mensaje = String.Format(mensaje, "DESAPROBAR");
            bootbox.prompt({
                title: "Aprobar Relación",
                size: "small",
                message: mensaje,
                inputType: "textarea",
                rows: "5",
                locale: "custom",
                placeholder: "Ingrese los motivos de la Desaprobación",
                buttons: {
                    confirm: {
                        label: "Desaprobar",
                        className: "btn btn-primary"
                    },
                    cancel: {
                        label: "Cancelar",
                        className: "btn btn-secondary"
                    }
                },
                maxlength: 250,
                callback: function (result) {
                    result = result || null;
                    if (result !== null) {

                        result = $.trim(result);
                        if (result === "") {
                            toastr.error("Debes ingresar observación.", TITULO_MENSAJE);
                        } else if (result.length > 0) {
                            data.Observacion = result;
                            AjaxCambiarEstado(data);
                        }
                    } else if (result === null) {
                        toastr.error("Debes ingresar observación.", TITULO_MENSAJE);
                    }
                }
            });
        }
        else {
            data.Observacion = Observacion;
            AjaxCambiarEstado(data);
        }
    }
}
function CasoPendienteEliminacion(estadoId, data, mensaje, Observacion) {
    switch (estadoId) {
        case ESTADO_RELACION.ELIMINADO:
            mensaje = String.Format(mensaje, "APROBAR");
            bootbox.confirm({
                message: mensaje,
                buttons: {
                    confirm: {
                        label: "Aprobar",
                        className: "btn btn-primary"
                    },
                    cancel: {
                        label: "Cancelar",
                        className: "btn btn-secondary"
                    }
                },
                callback: function (result) {
                    if (result) {
                        AjaxCambiarEstado(data);
                    }
                }
            });
            break;

        case ESTADO_RELACION.APROBADO:
            mensaje = String.Format(mensaje, "APROBAR");
            bootbox.confirm({
                message: mensaje,
                buttons: {
                    confirm: {
                        label: "Aprobar",
                        className: "btn btn-primary"
                    },
                    cancel: {
                        label: "Cancelar",
                        className: "btn btn-secondary"
                    }
                },
                callback: function (result) {
                    if (result) {
                        data.EstadoId = -1;//ESTADO_RELACION.ELIMINADO;
                        AjaxCambiarEstado(data);
                    }
                }
            });
            break;

        case ESTADO_RELACION.DESAPROBADO:
            mensaje = String.Format(mensaje, "DESAPROBAR");
            bootbox.confirm({
                message: mensaje,
                buttons: {
                    confirm: {
                        label: "Aprobar",
                        className: "btn btn-primary"
                    },
                    cancel: {
                        label: "Cancelar",
                        className: "btn btn-secondary"
                    }
                },
                callback: function (result) {
                    if (result) {
                        data.EstadoId = ESTADO_RELACION.APROBADO;
                        AjaxCambiarEstado(data);
                    }
                }
            });
            break;
    }

}
function AjaxCambiarEstado(data) {
    $.ajax({
        url: URL_API_VISTA + "/CambiarEstado",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (result) {
            if (result) {
                toastr.success("El cambio de estado se realizó correctamente.", TITULO_MENSAJE);
            }
            else {
                OpenCloseModal($("#mdOS"), false);
                OpenCloseModal($("#mdMessageRemove"), true);
            }
        },
        complete: function (data) {
            if (data.responseJSON == true) {
                if (ControlarCompleteAjax(data)) {
                    OpenCloseModal($("#mdOS"), false);
                    MdAddOrEditRegistro(false);
                    MdCambioEstado(false);

                    $("#hdEquipoId").val("");
                    FLAG_REMOVE_EQUIPO = false;
                    ListarRegistros_2();
                } else
                    MensajeErrorCliente();
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function IrEliminarRegistro(Id) {
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
                let data = {
                    Id: Id,
                    EstadoId: ESTADO_RELACION.PENDIENTEELIMINACION,
                };
                AjaxCambiarEstado(data);
            }
        }
    });
}

function validarFormOS() {
    $("#formOS").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlMotivo: {
                requiredSelect: true
            },
            txtObs: {
                requiredSinEspacios: true
            }
        },
        messages: {
            ddlMotivo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el motivo")
            },
            txtObs: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el comentario")
            }
        }
    });
}

function IrEliminarRegistrov2(Id, EquipoId, tipo) {
    LimpiarValidateErrores($("#formOS"));
    $("#hdId").val(Id);
    $("#ddlMotivo").val("-1");
    $("#txtObs").val("");
    $("#title_modal").html(TITULO_MENSAJE);
    $(".input-obs").addClass("ignore");
    $(".divObs").hide();

    //Validacion
    if (tipo == TIPO_RELACION.EQUIPO || tipo == TIPO_RELACION.SERVICIO_NUBE) {
        FLAG_REMOVE_EQUIPO = true;
    }
    //FLAG_REMOVE_EQUIPO = tipo == TIPO_RELACION.EQUIPO;
    if (FLAG_REMOVE_EQUIPO) {
        $("#hdEquipoId").val(EquipoId);
        let flag = VllidarRelacionEquipo(EquipoId);
        if (!flag) {

            ARR_PERFILES_USUARIO = userCurrent !== null ? userCurrent.Perfil.split(";") : [];
            flagMostrar = ARR_PERFILES_USUARIO.includes(PERFILES.ADMINISTRADOR);

            if (flagMostrar) $("#btnContinuarR").click(function () { OpenCloseModal($("#mdMessageRemove"), false); OpenCloseModal($("#mdOS"), true); });

            if (!flagMostrar) {
                $("#mdMessageFot").hide();
                $("#mjeAdmin").hide();

            } else {
                $("#mjeAdmin").show();
            }
            OpenCloseModal($("#mdMessageRemove"), true);
        }
        else {
            OpenCloseModal($("#mdOS"), true);
        }
    } else {
        OpenCloseModal($("#mdOS"), true);
    }



    //OpenCloseModal($("#mdOS"), true);
}

function IrFechaCuarentena(AplicacionStr, FechaInicio, FechaFin) {

    $("#nombreAplicacion").text(AplicacionStr);
    $("#inicioCuarentena").text(FechaInicio);
    $("#finCuarentena").text(FechaFin);

    OpenCloseModal($("#mdFechaCuarentena"), true);



}

function ShowNamebyId(Id, _DATA, $item) {
    let first_tmp = _DATA.find(x => x.Id.toString() === Id) || null;
    if (first_tmp !== null) $item.val(first_tmp.Descripcion);
}

function EditRegistro2(Id, EstadoId, EstadoStr) {
    if (EstadoId === ESTADO_RELACION.PENDIENTE || EstadoId === ESTADO_RELACION.APROBADO) {
        let idRelacionHashed = btoa(Id);
        let url = `/Relacion/Nueva?id_r=${idRelacionHashed}`;
        window.location.href = url;
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, `La relación se encuentra en estado ${EstadoStr}. No es posible editar`);
    }
}

const EnableDisableEquipo = (state) => {
    $("#ddlTipoEquipo").prop("disabled", state);
    $("#txtEquipo").prop("disabled", state);
};

function EditRegistro(Id, EstadoId, EstadoStr) {
    if (EstadoId === ESTADO_RELACION.PENDIENTE || EstadoId === ESTADO_RELACION.APROBADO) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $("#titleModalRelacion").html("Editar Relación");
        $.ajax({
            url: URL_API_VISTA + "/" + Id,
            type: "GET",
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                let _id = parseInt($("#hdIdOptSideBar").val());
                let itemEdit = {
                    title: result.TipoStr,
                    secondaryTitle: result.TipoStr,
                    idTipoRelacion: result.TipoId,
                    subdominioIds: ""
                };

                InitViewSection(_id, false, true, false, itemEdit);

                DATA_TIPO_ACTUAL = result.TipoId;
                $("#hdTipoRelacionId").val(result.TipoId);

                let idTipoRelacion = result.TipoId;
                DATA_INSTANCIAS_BD = result.InstanciasBD;
                switch (idTipoRelacion) {
                    case TIPO_RELACION.TECNOLOGIA:
                        //let idSubdominio = result.ListRelacionDetalle[0].SubdominioId;
                        //let item = SIDE_FILTER_DATA.find(x => x.idTipoRelacion === idTipoRelacion
                        //    && x.subdominioIds.includes(idSubdominio.toString())) || null;

                        //if (item !== null) {
                        //    $(`#${item.idHtml}.list-group-item`).click();
                        //} else {
                        //    let idHtmlTecnologias = `sideFil${SIDE_FILTER_IDS.TECNOLOGIAS}`;
                        //    $(`#${idHtmlTecnologias}.list-group-item`).click();
                        //}

                        $("#hdRelacionDetalleId").val(result.ListRelacionDetalle[0].Id);
                        $("#hdTecnologiaId").val(result.ListRelacionDetalle[0].TecnologiaId);
                        $("#txtTecnologia").val(result.ListRelacionDetalle[0].TecnologiaStr);
                        $("#cbRelevancia").val(result.ListRelacionDetalle[0].RelevanciaId);

                        setReadOnlyDataTecnologia(result.ListRelacionDetalle[0]);

                        break;

                    case TIPO_RELACION.EQUIPO:
                        EnableDisableEquipo(true);

                        $("#ddlTipoEquipo").val(result.TipoEquipoId || "-1");

                        $("#ddlFuncion").val($.trim(result.Funcion) !== "" ? result.Funcion.split("|") : "");
                        $("#ddlFuncion").multiselect("refresh");
                        //$("#ddlFuncion").val(result.Funcion || "-1");
                        let raStateServidor = result.FlagRelacionAplicacion;
                        SetValueRadio(raStateServidor);

                        $("#cbAmbiente").val(result.AmbienteId);
                        $("#hdEquipoId").val(result.EquipoId === null ? "0" : result.EquipoId);
                        $("#txtEquipo").val(result.EquipoStr);
                        RELACION_DETALLE_EDIT = result.ListRelacionDetalle;
                        FiltrarEquipoTecnologia();
                        $.each(RELACION_DETALLE_EDIT, function (i, item) {
                            $(`#cbRelevanciaEquipo${item.TecnologiaId}`).val(item.RelevanciaId);
                            $(`#cbRelevanciaEquipo${item.TecnologiaId}`).removeClass("bloq-element");

                            //$(`#txtComponente${item.TecnologiaId}`).val(item.Componente);
                            //$(`#txtComponente${item.TecnologiaId}`).removeClass("bloq-element");
                            $.each(DATA_INSTANCIAS_BD, function (j, item2) {
                                if (item.Componente == item2) {
                                    $(`#cboComponente${item.TecnologiaId}`).val(item2).change();
                                }
                            });
                            //$(`#cboComponente${item.TecnologiaId}`).val(item.Componente).change();
                            $(`#cboComponente${item.TecnologiaId}`).removeClass("bloq-element");
                            $(`#txtComponente${item.TecnologiaId}`).removeClass("bloq-element");
                        });
                        ValidacionRelacionTecnologiaDetalle();
                        ValidacionInputRelacionTecnologiaDetalle();
                        break;

                    case TIPO_RELACION.SERVICIO_BROKER:
                        $("#hdRelacionDetalleId").val(result.ListRelacionDetalle[0].Id);
                        $("#hdTecnologiaId").val(result.ListRelacionDetalle[0].TecnologiaId);
                        $("#txtTecnologia").val(result.ListRelacionDetalle[0].TecnologiaStr);
                        $("#cbRelevancia").val(result.ListRelacionDetalle[0].RelevanciaId);

                        setReadOnlyDataTecnologia(result.ListRelacionDetalle[0]);
                        break;

                    case TIPO_RELACION.SERVICIO_NUBE:
                        EnableDisableEquipo(true);

                        $("#ddlTipoEquipo").val(result.TipoEquipoId || "-1");
                        //$("#ddlFuncion").val(result.Funcion || "-1");
                        $("#ddlFuncion").val($.trim(result.Funcion) !== "" ? result.Funcion.split("|") : "");
                        $("#ddlFuncion").multiselect("refresh");
                        let raStateServicioNube = result.FlagRelacionAplicacion;
                        SetValueRadio(raStateServicioNube);

                        let suscripcion = result.Suscripcion || "";
                        let msg = $.trim(suscripcion) !== "" ? `Suscripción: ${suscripcion}` : "";
                        $("#lblSuscripcion").html(msg);

                        $("#cbAmbiente").val(result.AmbienteId);
                        $("#hdEquipoId").val(result.EquipoId === null ? "0" : result.EquipoId);
                        $("#txtEquipo").val(result.EquipoStr);
                        RELACION_DETALLE_EDIT = result.ListRelacionDetalle;
                        FiltrarEquipoTecnologia();
                        $.each(RELACION_DETALLE_EDIT, function (i, item) {
                            $(`#cbRelevanciaEquipo${item.TecnologiaId}`).val(item.RelevanciaId);
                            $(`#cbRelevanciaEquipo${item.TecnologiaId}`).removeClass("bloq-element");

                            //$(`#txtComponente${item.TecnologiaId}`).val(item.Componente);
                            $.each(DATA_INSTANCIAS_BD, function (j, item2) {
                                if (item.Componente == item2) {
                                    $(`#cboComponente${item.TecnologiaId}`).val(item2).change();
                                }
                            });
                            //$(`#cboComponente${item.TecnologiaId}`).val(item.Componente).change();
                            $(`#cboComponente${item.TecnologiaId}`).removeClass("bloq-element");
                            $(`#txtComponente${item.TecnologiaId}`).removeClass("bloq-element");
                            
                        });
                        ValidacionRelacionTecnologiaDetalle();
                        ValidacionInputRelacionTecnologiaDetalle();
                        break;

                    //case TIPO.TIPO_APLICACION:
                    //    $("#cbAmbiente").val(result.AmbienteId);
                    //    $("#hdAppVinculoId").val(result.ListRelacionDetalle[0].CodigoAPTVinculo);
                    //    $("#txtAppVinculo").val(result.ListRelacionDetalle[0].CodigoAPTVinculoStr);
                    //    obtenerEquiposByAppVinculo($("#hdAppVinculoId").val());
                    //    $("#cbEquipoVin").val(result.EquipoId === null ? "-1" : result.EquipoId);
                    //    $("#txtDetAppVin").val(result.ListRelacionDetalle[0].DetalleVinculo);
                    //    $("#cbRelevancia").val(result.ListRelacionDetalle[0].RelevanciaId);
                    //    break;
                }

                $("#hdId").val(result.RelacionId);
                $("#hdAplicacionId").val(result.CodigoAPT);
                $("#txtAplicacion").val(result.AplicacionStr);

                // Relación App-Componente
                $("#ddlTipoRelacionComponenteTec").val(result.TipoRelacionComponente);
                $("#ddlTipoRelacionComponenteEq").val(result.TipoRelacionComponente);

                if (FLAG_USUARIO_APROBADOR) { // TODO
                    //$(".tipo-aprobar").removeClass("bloq-element");
                    //$(".tipo-aprobar").show();
                    $(".form-principal").removeClass("bloq-element");
                    $(".tipo-tecnologia").removeClass("bloq-element");
                    $(".tipo-equipo").removeClass("bloq-element");
                    $(".tipo-aplicacion").removeClass("bloq-element");

                    //if (EstadoId === ESTADO_RELACION.PENDIENTE) {
                    //    SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTE.includes(x.Id)), $("#cbEstado"), "");
                    //} else if (EstadoId === ESTADO_RELACION.PENDIENTEELIMINACION) {
                    //    SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTEELIMINACION.includes(x.Id)), $("#cbEstado"), "");
                    //} else {
                    //    SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO.includes(x.Id)), $("#cbEstado"), TEXTO_SELECCIONE);
                    //}

                    //$("#cbEstado").val(EstadoId);

                    $("#hdEstadoId").val(result.EstadoId);

                    //if (EstadoId !== ESTADO_RELACION.PENDIENTE && EstadoId !== ESTADO_RELACION.PENDIENTEELIMINACION) {
                    //    $(".tipo-aprobar").addClass("bloq-element");
                    //}

                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function (data) {
                OpenCloseModal($("#mdNewOrEditRelacion"), true);
                waitingDialog.hide();
            },
            async: false
        });
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, String.Format("La relación se encuentra en estado {0}. No es posible editar", EstadoStr));
    }
}

function VerCertificado(Id, EstadoId, EstadoStr) {
    if (EstadoId === ESTADO_RELACION.PENDIENTE || EstadoId === ESTADO_RELACION.APROBADO) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $.ajax({
            url: URL_API_VISTA + "/" + Id,
            type: "GET",
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                let _id = parseInt($("#hdIdOptSideBar").val());
                let itemEdit = {
                    title: result.TipoStr,
                    secondaryTitle: result.TipoStr,
                    idTipoRelacion: result.TipoId,
                    subdominioIds: ""
                };

                InitViewSection(_id, false, true, false, itemEdit);
                $("#txtEquipoCD").val(result.EquipoStr);
                $("#txtAplicacionCD").val(result.AplicacionStr);
                $("#txtAmbienteCD").val(result.AmbienteStr);


            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function (data) {
                OpenCloseModal($("#mdNewOrEditCertificadoD"), true);
                waitingDialog.hide();
            },
            async: false
        });
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, String.Format("La relación se encuentra en estado {0}. No es posible editar", EstadoStr));
    }
}

function VerApi(Id, EstadoId, EstadoStr) {
    if (EstadoId === ESTADO_RELACION.PENDIENTE || EstadoId === ESTADO_RELACION.APROBADO) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $.ajax({
            url: URL_API_VISTA + "/" + Id,
            type: "GET",
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                let _id = parseInt($("#hdIdOptSideBar").val());
                let itemEdit = {
                    title: result.TipoStr,
                    secondaryTitle: result.TipoStr,
                    idTipoRelacion: result.TipoId,
                    subdominioIds: ""
                };

                InitViewSection(_id, false, true, false, itemEdit);
                $("#txtEquipoApi").val(result.EquipoStr);
                $("#txtAplicacionApi").val(result.AplicacionStr);
                $("#txtAmbienteApi").val(result.AmbienteStr);


            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function (data) {
                OpenCloseModal($("#mdNewOrEditApi"), true);
                waitingDialog.hide();
            },
            async: false
        });
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, String.Format("La relación se encuentra en estado {0}. No es posible editar", EstadoStr));
    }
}

function VerClientSecret(Id, EstadoId, EstadoStr) {
    if (EstadoId === ESTADO_RELACION.PENDIENTE || EstadoId === ESTADO_RELACION.APROBADO) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $.ajax({
            url: URL_API_VISTA + "/" + Id,
            type: "GET",
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                let _id = parseInt($("#hdIdOptSideBar").val());
                let itemEdit = {
                    title: result.TipoStr,
                    secondaryTitle: result.TipoStr,
                    idTipoRelacion: result.TipoId,
                    subdominioIds: ""
                };

                InitViewSection(_id, false, true, false, itemEdit);
                $("#txtEquipoCS").val(result.EquipoStr);
                $("#txtAplicacionCS").val(result.AplicacionStr);
                $("#txtAmbienteCS").val(result.AmbienteStr);


            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function (data) {
                OpenCloseModal($("#mdNewOrEditClientSecret"), true);
                waitingDialog.hide();
            },
            async: false
        });
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, String.Format("La relación se encuentra en estado {0}. No es posible editar", EstadoStr));
    }
}

function ObtenerTecnologiaIdsEliminar() {
    let FLAG_CAMBIO_TIPO = false;
    if (DATA_TIPO_ACTUAL > 0) {
        //FLAG_CAMBIO_TIPO = DATA_TIPO_ACTUAL !== parseInt($("#cbTipo").val());
        FLAG_CAMBIO_TIPO = DATA_TIPO_ACTUAL !== parseInt($("#hdTipoRelacionId").val());
    }

    if (FLAG_CAMBIO_TIPO && $("#hdTecnologiaId").val() !== "") {
        DATA_TECNOLOGIA_DESMARCADO.push([parseInt($("#hdTecnologiaId").val())]);
    }
    return DATA_TECNOLOGIA_DESMARCADO;
}

//function CrearObjListRelacionDetalle(FlagTecnologia) {
//    let data = [];
//    if (FlagTecnologia) {
//        data.push({
//            Id: $("#hdRelacionDetalleId").val(),
//            TecnologiaId: $("#hdTecnologiaId").val(),
//            RelevanciaId: $("#cbRelevancia").val(),
//            UsuarioCreacion: USUARIO.UserName,
//            UsuarioModificacion: USUARIO.UserName,
//            Activo: true
//        });
//    } else if (!FlagTecnologia) {
//        let dataTmp = $tableTecnologia.bootstrapTable("getData");
//        dataTmp = dataTmp.filter(x => x.FlagSeleccionado);
//        $.each(dataTmp, function (i, item) {
//            data.push({
//                Activo: true,
//                UsuarioCreacion: USUARIO.UserName,
//                UsuarioModificacion: USUARIO.UserName,
//                TecnologiaId: item.Id,
//                RelevanciaId: $(`#cbRelevanciaEquipo${item.Id}`).val()
//            });
//        });
//    }
//    return data;
//}

function CrearObjListRelacionDetalle(tipoRelacionId) {
    let data = [];
    switch (tipoRelacionId) {
        case TIPO_RELACION.SERVICIO_BROKER:
        case TIPO_RELACION.TECNOLOGIA:
            data.push({
                Id: $("#hdRelacionDetalleId").val(),
                TecnologiaId: $("#hdTecnologiaId").val(),
                RelevanciaId: $("#cbRelevancia").val(),
                Activo: true
            });
            break;
        case TIPO_RELACION.EQUIPO:
        case TIPO_RELACION.SERVICIO_NUBE:
            let dataTmp = $tableTecnologia.bootstrapTable("getData");
            dataTmp = dataTmp.filter(x => x.FlagSeleccionado);
            $.each(dataTmp, function (i, item) {
                data.push({
                    Activo: true,
                    TecnologiaId: item.Id,
                    RelevanciaId: $(`#cbRelevanciaEquipo${item.Id}`).val(),
                    Componente: $(`#txtComponente${item.Id}`).val()
                });
            });
            break;
        case TIPO_RELACION.APLICACION:
            data.push({
                Id: $("#hdRelacionDetalleId").val(),
                TecnologiaId: -1, //$("#hdTecnologiaId").val(),
                RelevanciaId: $("#cbRelevancia").val(),
                CodigoAPTVinculo: $("#hdAppVinculoId").val(),
                DetalleVinculo: $("#txtDetAppVin").val(),
                Activo: true
            });
            break;
    }

    return data;
}
function CrearObjRelacion(tipoRelacionId) {
    let tipoRelacionComp;
    if (tipoRelacionId === TIPO_RELACION.EQUIPO || tipoRelacionId === TIPO_RELACION.SERVICIO_NUBE) {
        tipoRelacionComp = $("#ddlTipoRelacionComponenteEq").val();
    } else {
        tipoRelacionComp = $("#ddlTipoRelacionComponenteTec").val();
    }

    var data = {
        RelacionId: $("#hdId").val(),
        CodigoAPT: $("#hdAplicacionId").val(),
        //TipoId: $("#cbTipo").val(),
        TipoId: $("#hdTipoRelacionId").val(),
        Activo: true,
        ListRelacionDetalle: CrearObjListRelacionDetalle(tipoRelacionId),
        EstadoId: ESTADO_RELACION.PENDIENTE,
        TecnologiaIdsEliminar: ObtenerTecnologiaIdsEliminar(),
        TipoRelacionComponente: tipoRelacionComp
    };

    switch (tipoRelacionId) {
        case TIPO_RELACION.SERVICIO_BROKER:
        case TIPO_RELACION.TECNOLOGIA:
            break;
        case TIPO_RELACION.EQUIPO:
        case TIPO_RELACION.SERVICIO_NUBE:
            data.AmbienteId = $("#cbAmbiente").val();
            data.EquipoId = $("#hdEquipoId").val();
            data.FlagRelacionAplicacion = GetValueRadio();
            //data.Funcion = $("#ddlFuncion").val() === "-1" ? null : $("#ddlFuncion").val();
            data.Funcion = $.isArray($("#ddlFuncion").val()) ? $("#ddlFuncion").val().join("|") : "";
            break;
        case TIPO_RELACION.APLICACION:
            //data.CodigoAPTVinculo = $("#hdAppVinculoId").val();
            data.EquipoId = $("#cbEquipoVin").val();
            data.AmbienteId = $("#cbAmbiente").val();
            //data.DetalleVinculo = $("#txtDetAppVin").val();
            break;
    }

    //if (!tipoRelacionId) {
    //    data.AmbienteId = $("#cbAmbiente").val();
    //    data.EquipoId = $("#hdEquipoId").val();
    //    //data.TecnologiaIdsEliminar = DATA_TECNOLOGIA_DESMARCADO;
    //}
    return data;
}

function CrearObjRelacion2() {
    var data = {

        CodigoAPT: $("#hdAplicacionId").val()

    };


    return data;
}


function CargarParametroCD() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GetCertificadoDigitalID`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    TIPO_EQUIPO_ID_CD = dataObject.parametro;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}



function CargarParametroAPIS() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GetApisID`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    TIPO_EQUIPO_ID_APIS = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItems(dataObject.TipoEquipo, $("#cbTipo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoAmbiente, $("#cbAmbiente"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Relevancia, $("#cbRelevancia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Dominio, $("#cbDomTec"), TEXTO_SELECCIONE);
                    SetItems(dataObject.MotivoEliminacion, $("#ddlMotivo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.MotivoEliminacionApps, $("#ddlMotivoAppsElimi"), TEXTO_SELECCIONE);
                    DATA_TIPO_EQUIPO = dataObject.TipoEquipo_2;
                    SetItems(DATA_TIPO_EQUIPO, $("#ddlTipoEquipo"), TEXTO_SELECCIONE);

                    //SetItems(dataObject.TipoEquipo, $("#cbTipoRelacionFiltro"), TEXTO_TODOS);
                    //SetItems(dataObject.TipoAmbiente, $("#ddlAmbienteFiltro"), TEXTO_TODOS);
                    //SetItems2(dataObject.Estado, $("#cbEstadoFiltro"), TEXTO_TODOS);
                    //SetItems(dataObject.Subdominio, $("#cbSubdominioFiltro"), TEXTO_TODOS);
                    DATA_ESTADO = dataObject.Estado;
                    DATA_RELEVANCIA = dataObject.Relevancia;
                    $("#periodoCuarentena").text(dataObject.ParametroPeriodoCuarentena.toString());

                    //Multiple
                    SetItemsMultiple(dataObject.TipoAmbiente, $("#ddlAmbienteFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Estado, $("#cbEstadoFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Funcion, $("#ddlFuncion"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                    SetItems(dataObject.TiposRelacionApps, $("#cbTipoRelacionApps"), TEXTO_SELECCIONE);

                    SetItems(dataObject.TiposRelacionApps, $("#ddlTipoRelacionComponenteEq"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TiposRelacionComponentes, $("#ddlTipoRelacionComponenteTec"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function relevanciaFormatter(value, row) {
    return `<select id="cbRelevanciaEquipo${value}" name="cbRelevanciaEquipo${value}" class="form-control format-relevancia bloq-element"><option>${TEXTO_SELECCIONE}</option></select>`;
}

function componenteFormatter(value, row) {
    return `<input id="txtComponente${value}" class="form-control format-componente" type="text" name="txtComponente${value}">`;
}

function componente2Formatter(value, row) {
    return `<select id="cboComponente${value}" class="form-control format-componente bloq-element comboComponente" name="cboComponente${value}"><option value=''>${TEXTO_SELECCIONE}</option></select><input class="form-control" id="txtComponente${value}" style="display:none" name="txtComponente${value}"></input>`;
}

function detailFormatter(index, row) {
    let TipoRelacionStr = "";
    if (row.TipoId === 3) {
        TipoRelacionStr = "Aplicación";
    } else {
        TipoRelacionStr = "Tecnología";
    }

    let html = String.Format(`<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true">
                            <thead>
                                <tr>
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="2%">#</th>
                                    <th data-field="TecnologiaStr" data-sortable="false" data-halign="center" data-valign="middle" data-align="left" data-width="15%">{1}</th>
                                    <th data-field="RelevanciaStr" data-sortable="false" data-halign="center" data-valign="middle" data-align="center" data-width="3%">Relevancia</th>                                    
                                    <th data-field="FechaModificacionFormato" data-sortable="false" data-halign="center" data-valign="middle" data-align="center" data-width="3%">F. última modificación</th>
                                    <th data-field="UsuarioModificacion" data-sortable="false" data-halign="center" data-valign="middle" data-align="center" data-width="3%">Modificado por</th>
                                </tr>
                            </thead>
                        </table>`, row.RelacionId, TipoRelacionStr);
    return html;
}



async function ListarEquipoTecnologia() {
    let url = `${URL_API_VISTA}/ListarEquipoTecnologia`;
    let data = await fetch(url).then(r => r.json()).catch(err => { MensajeErrorCliente(); });
    DATA_EQUIPO_TECNOLOGIA = data;
}

/* TIEMPO DE ESPERA SUPERADO */
function ListarEquipoTecnologiaByParam(equipoId, subdominioIds = "") {
    let DATA = [];
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ListarEquipoTecnologiaByEquipoId?Id=${equipoId}&subdominioIds=${subdominioIds}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    DATA = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return DATA;
}
function ObtenerInstanciasEquipo() {
    let equipoId = $("#hdEquipoId").val();
    DATA_INSTANCIAS_BD = ListarEquipoInstanciasBD(equipoId);
}
function ListarEquipoInstanciasBD(equipoId) {
    let DATA = [];
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ListarEquipoInstanciasBDByEquipoId?Id=${equipoId}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    DATA = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return DATA;
}
function FiltrarEquipoTecnologia() {
    let equipoId = $("#hdEquipoId").val();
    let subdominioIds = $("#hdSubdominioIds").val();

    $tableTecnologia.bootstrapTable("destroy");
    let dataTMP = ListarEquipoTecnologiaByParam(equipoId, subdominioIds);

    //RELACION_DETALLE_EDIT = dataTMP.filter(x => x.FlagSO);  // NUEVO => TEC S.O.
    let RELACION_DETALLE_EDIT_SO = dataTMP.filter(x => x.FlagSO);
    let RELACION_DETALLE_EDIT_COMPONENTE = dataTMP.filter(x => x.FlagComponente === false);

    //SOs checked
    $.each(RELACION_DETALLE_EDIT_SO, function (i, item) {
        let nroEvaluar = item.TecnologiaId || item.Id;
        let foundIndex = dataTMP.findIndex(x => x.Id === nroEvaluar);
        //console.log(foundIndex);
        if (foundIndex !== "-1" && foundIndex !== -1) {
            dataTMP[foundIndex].FlagSeleccionado = true;
            dataTMP[foundIndex] = dataTMP[foundIndex];
        }
    });

    //Tecnologias checked
    if (RELACION_DETALLE_EDIT.length > 0) {
        $.each(RELACION_DETALLE_EDIT, function (i, item) {
            //let nroEvaluar = item.TecnologiaId || item.Id;
            let foundIndex = dataTMP.findIndex(x => x.Id === item.TecnologiaId.toString());
            //console.log(foundIndex);
            if (foundIndex !== "-1" && foundIndex !== -1) {
                dataTMP[foundIndex].FlagSeleccionado = true;
                dataTMP[foundIndex] = dataTMP[foundIndex];
            }
        });
    }

    $tableTecnologia.bootstrapTable({
        data: dataTMP,
        rowStyle: function (row, index) {
            var classes = [
                'bg-blue',
                'bg-green',
                'bg-orange',
                'bg-yellow',
                'soContainer'
            ];

            if (row.FlagSO) {
                return {
                    classes: classes[4]
                };
            }
            return {
                css: {
                    color: 'black'
                }
            };
        }
    });

    $(".form-control.format-relevancia.bloq-element").each((i, e) => SetItems(DATA_RELEVANCIA, $(`#${e.name}`), TEXTO_SELECCIONE));
    let inst = [];
    if (DATA_INSTANCIAS_BD.length > 0) {
        $.each(DATA_INSTANCIAS_BD, function (j, item2) {
            inst.push({
                Id: item2,
                Descripcion: item2
            });
            //let $option = $('<option>', {
            //    text: item2,
            //    value: item2,
            //    addClass: 'noEditable'
            //});
            //$(`#cboComponente${item.TecnologiaId}`).append($option);
        });
    }
    
    inst.push({
        Id: 'otro',
        Descripcion: 'otro'
    });
    //let $option = $('<option>', {
    //    text: 'otro',
    //    value: 'otro',
    //    addClass: 'editable'
    //});
    //$(`#cboComponente${item.TecnologiaId}`).append($option);

    $(".form-control.format-componente.bloq-element").each((i, e) => SetItems(inst, $(`#${e.name}`), TEXTO_SELECCIONE));

    $('.comboComponente').on("change", function () {
        var idSelect = $(this).attr("id");
        let idTec = idSelect.replace('cboComponente', '');
        if ($("#" + idSelect).val() == 'otro') {
            $("#txtComponente" + idTec).show();
            $("#txtComponente" + idTec).val('');
            $("#txtComponente" + idTec).focus();
        }
        else {
            $("#txtComponente" + idTec).hide();
            $("#txtComponente" + idTec).val($("#" + idSelect).val());
        }
        //
        //var selected = $('option:selected', this).attr('class');
        //if (selected == "editable") {
            
        //} else {
            
        //}
    });

    $.each(RELACION_DETALLE_EDIT_SO, function (i, item) {
        $(`#cbRelevanciaEquipo${item.TecnologiaId || item.Id}`).val(RELEVANCIA_ALTA);
        //$(`#cbRelevanciaEquipo${item.TecnologiaId || item.Id}`).removeClass("bloq-element");
    });

    $.each(RELACION_DETALLE_EDIT_COMPONENTE, function (i, item) {
        $(`#cboComponente${item.TecnologiaId || item.Id}`).prop("disabled", true);
        $(`#txtComponente${item.TecnologiaId || item.Id}`).prop("disabled", true);
    });

    $('#tblRegistroTecnologia tbody tr.soContainer').addClass("bloq-element");

    //$.each(RELACION_DETALLE_EDIT, function (i, item) {
    //    $(`#cbRelevanciaEquipo${item.TecnologiaId}`).val(item.RelevanciaId);
    //    $(`#cbRelevanciaEquipo${item.TecnologiaId}`).removeClass("bloq-element");
    //});
}
function InitAutocompletarAplicacion($searchBox, $IdBox, $container, valor) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API + "/Aplicacion/GetAplicacionRelacionarByFiltro?filtro=" + request.term,
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
            //$searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $searchBox.val(ui.item.label);
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.label);
            if (valor === 1) {
                obtenerEquiposByAppVinculo(ui.item.Id);
                //LimpiarValidateErrores($("#formAppVin"));
            }
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

function InitAutocompletarAplicacionApps($searchBox, $IdBox, $container, $IdBoxDes) {

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API + "/Aplicacion/ListAplicaciones_ByPerfil?aplicacion=" + request.term,
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
            } else {
                return response(true);
            }
        },
        focus: function (event, ui) {
            return false;
        },
        select: function (event, ui) {
            $searchBox.val(ui.item.label);
            $IdBox.val(ui.item.Id);
            $IdBoxDes.val(ui.item.label);
            $searchBox.val(ui.item.label);
            mostrarSeleccionApps()
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

function InitAutocompletarTecnologia($searchBox, $IdBox, $container, subdominioIds = "") {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + `/Tecnologia/GetTecnologiaByClave?filtro=${request.term}&subdominioIds=${subdominioIds}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        DATA_TECNOLOGIA = data;
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
            //$searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.label);
            setReadOnlyDataTecnologia(ui.item);
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
function InitAutocompletarEquipo($searchBox, $IdBox, $container, URL) {
    $searchBox.autocomplete({
        minLength: 4,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/${URL}?filtro=${request.term}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        DATA_EQUIPO = data;
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
            $searchBox.val(ui.item.label);
            ObtenerInstanciasEquipo();
            FiltrarEquipoTecnologia();
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

function InitAutocompletarEquipoFiltro($searchBox, $IdBox, $container, valor, URL) {
    $searchBox.autocomplete({
        minLength: 4,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/${URL}?filtro=${request.term}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        DATA_EQUIPO = data;
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
            //$searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.label);
            if (valor === 1) {
                FiltrarEquipoTecnologia();
            }
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

function ExisteAplicacion() {
    let estado = false;
    //let nombre = $("#txtAplicacion").val();
    let Id = $("#hdAplicacionId").val();
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


function ExisteAplicacionOrigen() {
    let estado = false;
    let Id = $("#hdAplicacionIdAppsOrigen").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
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


function ExisteAplicacionDestino() {
    let estado = false;
    let Id = $("#hdAplicacionIdAppsDestino").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
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
function ExisteEquipo() {
    let estado = false;
    //let nombre = $("#txtEquipo").val();
    let Id = $("#hdEquipoId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Relacion" + `/ExisteEquipo?Id=${Id}`,
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
/* TIEMPO DE ESPERA SUPERADO */

function ExisteRelacionAplicacionEquipo() {
    let estado = false;
    //let id = $("#hdId").val();
    let codigoAPT = $("#hdAplicacionId").val();
    //let ambienteId = $("#cbAmbiente").val();
    let equipoId = $("#hdEquipoId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteRelacionAplicacionEquipo?codigoAPT=${codigoAPT}&equipoId=${equipoId}`,
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

function ExisteRelacionEquipo() {
    let estado = false;
    let id = $("#hdId").val();
    let codigoAPT = $("#hdAplicacionId").val();
    let ambienteId = $("#cbAmbiente").val();
    let equipoId = $("#hdEquipoId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteRelacionEquipo?id=${id}&codigoAPT=${codigoAPT}&ambienteId=${ambienteId}&equipoId=${equipoId}`,
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

function ExisteRelacionTecnologia() {
    let estado = false;
    let id = $("#hdId").val();
    let codigoAPT = $("#hdAplicacionId").val();
    let tecnologiaId = $("#hdTecnologiaId").val();
    let equipoId = null; //$("#hdEquipoId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteRelacionTecnologia?id=${id}&codigoAPT=${codigoAPT}&tecnologiaId=${tecnologiaId}&equipoId=${equipoId}`,
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

function ValidarRelacionUnica() {
    let estado = false;
    //let opc = $("#cbTipo").val();
    let opc = parseInt($("#hdTipoRelacionId").val());
    switch (opc) {
        case TIPO_RELACION.EQUIPO:
            estado = ExisteRelacionEquipo();
            break;
        case TIPO_RELACION.SERVICIO_BROKER:
        case TIPO_RELACION.TECNOLOGIA:
            estado = ExisteRelacionTecnologia();
            break;
        case TIPO_RELACION.SERVICIO_NUBE:
            if ($("#hdId").val() == '0')
                estado = ExisteRelacionAplicacionEquipo();
            break;
    }

    return estado;
}

function irAplicacionVinculada() {
    LimpiarValidateErrores($("#formAppVin"));
    $("#txtAppBase").val('');
    $("#txtAppVinculo").val('');
    $("#cbEquipoVin").val(-1);
    $("#txtDetAppVin").val('');
    $("#MdAppVin").modal(opcionesModal);
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

function validarFormAppVin() {

    $.validator.addMethod("distintoCodigo", function (value, element) {
        let estado = true;
        let appBaseId = $("#hdAplicacionId").val();
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
                distintoCodigo: true
            },
            txtAppVinculo: {
                requiredSinEspacios: true,
                distintoCodigo: true
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
                distintoCodigo: "Debes seleccionar una aplicación diferente"
                //existeAplicacion: String.Format("{0} seleccionada no existe.", "La aplicación")
            },
            txtAppVinculo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
                distintoCodigo: "Debes seleccionar una aplicación diferente"
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
                        ListarRegistros();
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


function irModalTecnologia() {
    LimpiarValidateErrores($("#formAddTec"));
    $("#txtFabricanteTec").val('');
    $("#txtNomTec").val('');
    $("#txtVerTec").val('');
    $("#txtClaveTecnologia").val('');
    $("#cbDomTec, #txtSubTec").val("-1");

    $("#MdAddTec").modal(opcionesModal);
}


function validarFormAddTec() {

    $.validator.addMethod("existeClaveTecnologia", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            let estado = false;
            estado = !ExisteClaveTecnologia();
            return estado;
        }
        return estado;
    });

    $("#formAddTec").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtFabricanteTec: {
                requiredSinEspacios: true
            },
            txtNomTec: {
                requiredSinEspacios: true
            },
            txtVerTec: {
                requiredSinEspacios: true
            },
            txtClaveTecnologia: {
                existeClaveTecnologia: true
            },
            cbDomTec: {
                requiredSelect: true
            },
            txtSubTec: {
                requiredSelect: true
            }
        },
        messages: {
            txtFabricanteTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el fabricante")
            },
            txtNomTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtVerTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la versión")
            },
            txtClaveTecnologia: {
                existeClaveTecnologia: "Clave de la tecnología ya existe."
            },
            cbDomTec: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el dominio")
            },
            txtSubTec: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el subdominio")
            }
        }
    });
}

function ExisteClaveTecnologia() {
    let estado = true;
    let clave = encodeURIComponent($("#txtClaveTecnologia").val());
    let flagActivo = FLAG_ACTIVO_TECNOLOGIA;

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Tecnologia" + `/ExisteClaveTecnologia?clave=${clave}&id=${null}&flagActivo=${flagActivo}`,
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

function guardarAddTec() {
    if ($("#formAddTec").valid()) {

        $("#btnRegTec").button("loading");

        var tec = {};
        tec.Id = 0;//($("#hIdTec").val() === "") ? 0 : parseInt($("#hIdTec").val());
        tec.Activo = true;
        tec.EstadoTecnologia = ESTADO_TECNOLOGIA.REGISTRADO;
        tec.ClaveTecnologia = $("#txtClaveTecnologia").val();
        //Tab 1
        tec.Nombre = $("#txtNomTec").val();
        tec.Descripcion = ""; /*$("#txtDesTec").val();*/
        tec.Versiones = $("#txtVerTec").val();
        tec.Fabricante = $("#txtFabricanteTec").val();
        tec.FamiliaId = 1; /*$("#hFamTecId").val(); */ //FAMILIA GENERAL ID = 1
        tec.TipoTecnologiaId = 3; /*$("#cbTipTec").val();*/
        tec.FlagFechaFinSoporte = true; /*$("#cbFlagFecSop").prop("checked");*/
        //tec.FlagFechaFinSoporte = $("#cbFlagFecSop").prop("checked");
        tec.Fuente = 1; /* tec.FlagFechaFinSoporte ? $("#cbFuenteTec").val() : null; */
        tec.FechaLanzamiento = null; /*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecLanTec").val()) : null) : null;*/
        tec.FechaExtendida = null;/*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecExtTec").val()) : null) : null;*/
        tec.FechaFinSoporte = null;/*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecSopTec").val()) : null) : null;*/
        tec.FechaAcordada = null;/*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecIntTec").val()) : null) : null;*/
        tec.FechaCalculoTec = 3;/*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? $("#cbFecCalTec").val() : null) : null;*/
        tec.ComentariosFechaFin = ""; /*$("#txtComTec").val(); */
        tec.Existencia = 1; /*$("#cbExisTec").val();*/
        tec.Facilidad = 3; /*$("#cbFacAcTec").val();*/
        tec.Vulnerabilidad = 0;/*$("#txtVulTec").val();*/
        tec.CasoUso = "";/*$("#txtCusTec").val();*/
        tec.Requisitos = ""; /*$("#txtReqHSTec").val();*/
        tec.Compatibilidad = ""; /*$("#txtCompaTec").val();*/
        tec.Aplica = ""; /*$("#txtApliTec").val();*/
        tec.FlagAplicacion = false; /*$("#cbFlagApp").prop("checked"); */
        tec.CodigoAPT = null; /*tec.FlagAplicacion ? $("#hdIdApp").val() : null;*/

        //Tab 2
        tec.SubdominioId = $("#txtSubTec").val(); /*$("#hIdSubTec").val();*/
        tec.EliminacionTecObsoleta = null;/*$("#hIdTecObs").val() === "" ? null : parseInt($("#hIdTecObs").val());*/
        tec.RoadmapOpcional = null; /*$.trim($("#txtElimTec").val()) === "" || $("#hIdTecObs").val() != "" ? null : $("#txtElimTec").val();*/
        tec.Referencias = "*"; /*$("#txtRefTec").val();*/
        tec.PlanTransConocimiento = "*"; /*$("#txtPlanTransTec").val();*/
        tec.EsqMonitoreo = "*";/*$("#txtEsqMonTec").val();*/
        tec.LineaBaseSeg = "*"; /*$("#txtLinSegTec").val();*/
        tec.EsqPatchManagement = "*"; /*$("#txtPatManTec").val();*/

        //Tab 3
        tec.Dueno = "*"; /*$("#txtDueTec").val();*/
        tec.EqAdmContacto = "*";/*$("#txtEqAdmTec").val();*/
        tec.GrupoSoporteRemedy = "*";/*$("#txtGrupRemTec").val();*/
        tec.ConfArqSeg = "*"; /*$("#txtConfArqSegTec").val();*/
        tec.ConfArqTec = "*"; /*$("#txtConfArqTec").val();*/
        tec.EncargRenContractual = "*"; /*$("#txtRenConTec").val();*/
        tec.EsqLicenciamiento = "*"; /*$("#txtEsqLinTec").val();*/
        tec.SoporteEmpresarial = "*"; /*$("#txtSopEmpTec").val();*/
        tec.ListAutorizadores = [];/*$tblAutTec.bootstrapTable('getData');*/
        tec.ItemsRemoveAutId = [];/*ItemsRemoveAutId;*/

        tec.FlagCambioEstado = true;

        $.ajax({
            url: URL_API + "/Tecnologia",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(tec),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (result) {
                var data = result;
                if (data > 0) {
                    //let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
                    //if ((archivoId == 0 && $("#txtNomDiagCasoUso").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                    //    UploadFile($("#flDiagCasoUso"), CODIGO_INTERNO, data, archivoId);
                    //}
                    bootbox.alert({
                        size: "sm",
                        title: TITULO_MENSAJE,
                        message: "Registrado correctamente",
                        callback: function () { /* your callback code */ }
                    });
                }
            },
            complete: function () {
                //mdAddOrEditTec(false);
                $("#MdAddTec").modal('hide');
                $("#btnRegTec").button("reset");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function getSubdominiosByDomCb(_domId, $cbSub) {
    var domId = _domId;

    $cbSub.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $.ajax({
        url: URL_API + "/Tecnologia" + "/Subdominios/" + domId,
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


function irReiniciarEstado(Id, TipoRelacionId, TecnologiaId, EquipoId) {
    let IdValidar = TipoRelacionId === TIPO_RELACION.TECNOLOGIA ? TecnologiaId : EquipoId;
    let mess = TipoRelacionId === TIPO_RELACION.TECNOLOGIA ? MENSAJE_TECNOLOGIA_NOACTIVA : MENSAJE_EQUIPO_NOACTIVA;

    if (!ExisteTecnologiaEquipoActivaById(IdValidar, TipoRelacionId)) {
        bootbox.alert({
            size: "sm",
            title: TITULO_MENSAJE,
            message: mess,
            buttons: SET_BUTTONS_BOOTBOX_OK
        });

        return;
    }

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás seguro que deseas reiniciar el estado del registro seleccionado?",
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result) {
                let data = {
                    Id: Id,
                    EstadoId: ESTADO_RELACION.PENDIENTE,
                };
                AjaxCambiarEstado(data);
            }
        }
    });
}

function ExisteTecnologiaEquipoActivaById(Id, TipoRelacionId) {
    let estado = false;

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Relacion/ExisteTecnologiaActivaById?Id=${Id}&TipoRelacionId=${TipoRelacionId}`,
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

function eliminarRelacion() {
    if ($("#formOS").valid()) {
        let IdRelacion = parseInt($("#hdId").val());
        let IdEquipo = parseInt($("#hdEquipoId").val());
        let comentario = $("#ddlMotivo").val() === "4" ? $.trim($("#txtObs").val()) : $("option:selected", $("#ddlMotivo")).text();

        let data = {
            Id: IdRelacion,
            Observacion: comentario,
            EstadoId: ESTADO_RELACION.PENDIENTEELIMINACION,
            ObjetoId: IdEquipo,
            Flag: FLAG_REMOVE_EQUIPO,
            FechaFiltro: DATA_EXPORTAR.FechaConsulta,
            FlagAdmin: flagMostrar,
        };
        AjaxCambiarEstado(data);
    }
}

function GetComentarioByRelacionId() {
    let retorno = "";
    let id = $("#hdId").val();

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GetComentarioByRelacionId?Id=${id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    retorno = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

    return retorno;
}

function ShowHideActions() {
    let $button = $(this);
    //let textButton = $button.text();
    let textButton = $button.prop("title");
    let action = textButton === TEXTO_MOSTRAR_AUDITORIA ? "showColumn" : "hideColumn";
    $table.bootstrapTable(action, 'FechaCreacionFormato');
    $table.bootstrapTable(action, 'UsuarioCreacion');
    $table.bootstrapTable(action, 'FechaModificacionFormato');
    $table.bootstrapTable(action, 'UsuarioModificacion');
    //$button.text(textButton === TEXTO_MOSTRAR_AUDITORIA ? TEXTO_OCULTAR_AUDITORIA : TEXTO_MOSTRAR_AUDITORIA);
    $button.prop("title", textButton === TEXTO_MOSTRAR_AUDITORIA ? TEXTO_OCULTAR_AUDITORIA : TEXTO_MOSTRAR_AUDITORIA);
}

function SetShowHideAuditoria() {
    //let textButton = $("#btnAuditoria").text();
    let textButton = $("#btnAuditoria").prop("title");
    let action = textButton === TEXTO_MOSTRAR_AUDITORIA ? "hideColumn" : "showColumn";
    $table.bootstrapTable(action, 'FechaCreacionFormato');
    $table.bootstrapTable(action, 'UsuarioCreacion');
    $table.bootstrapTable(action, 'FechaModificacionFormato');
    $table.bootstrapTable(action, 'UsuarioModificacion');



}

function openCloseNav() {
    let $divSideLeft = $("#divSideLeft");
    let $divSideRight = $("#divSideRight");
    let $sidePanel = $("#mySidepanel");

    let width = $sidePanel.css('width');
    if (width === "0px") { //Open
        $sidePanel.width(100);

        //$divSideLeft.removeClass();
        //$divSideLeft.addClass("col-md-3");

        //$divSideRight.removeClass();
        //$divSideRight.addClass("col-md-9");

    } else { //Close
        $sidePanel.width(0);

        $divSideLeft.removeClass();
        $divSideLeft.addClass("col-md-1");

        $divSideRight.removeClass();
        $divSideRight.addClass("col-md-11");
    }
}

function ChangeCbTipo(item, isNew = true, itemEdit = null) {
    //item = isNew ? item : item.id === SIDE_FILTER_IDS.TODAS_TECNOLOGIAS ? itemEdit : item;
    item = isNew ? item : itemEdit;
    $("#titleForm").html(item.title);
    $("#hdTipoRelacionId").val(item.idTipoRelacion);
    $("#hdSubdominioIds").val("");
    //$("#ddlTipoEquipo").prop("disabled", false);
    //$("#txtEquipo").prop("disabled", false);
    EnableDisableEquipo(false);

    ClearView();
    if (isNew) InitModalByFilters();

    //let pos = item.idTipoRelacion;
    let pos = parseInt($("#hdTipoRelacionId").val());
    switch (pos) {
        case TIPO_RELACION.EQUIPO:
            $(".tipo-tecnologia").hide();
            $(".tipo-aplicacion").hide();
            $(".tipo-equipo").show();
            //$(".tipo-funcion").show();

            SetItems(DATA_TIPO_EQUIPO.filter(x => x.Id !== TIPO_EQUIPO_SERVICIO_NUBE), $("#ddlTipoEquipo"), TEXTO_SELECCIONE);

            $("#spItem01").html(String.Format(TEXTO_RELACION_1, item.title));
            $("#spItem02").html(String.Format(TEXTO_RELACION_2, item.title));

            if ($.trim(item.subdominioIds) !== "") {
                $("#hdSubdominioIds").val(item.subdominioIds);
                $("#lblNameEquipo").html("Equipo:");
                //$(".tipo-funcion").hide();
            } else {
                $("#hdSubdominioIds").val("");
                $("#lblNameEquipo").html(`${item.title}:`);
                //$(".tipo-funcion").show();
            }

            $("#txtEquipo").autocomplete("destroy");
            InitAutocompletarEquipo($("#txtEquipo"), $("#hdEquipoId"), ".equipoContainer", URL_AUTOCOMPLETE_EQUIPO.DEFAULT);
            break;
        case TIPO_RELACION.SERVICIO_BROKER:
            $(".tipo-equipo").hide();
            $(".tipo-aplicacion").hide();
            $(".tipo-tecnologia").show();

            $("#txtTecnologia").autocomplete("destroy");
            InitAutocompletarTecnologia($("#txtTecnologia"), $("#hdTecnologiaId"), ".tecnologiaContainer", item.subdominioIds);

            if ($.trim(item.subdominioIds) !== "") {
                let arrSubdominios = item.subdominioIds.split("|");
                if (arrSubdominios.includes(SUBDOMINIO_IDS.BROWSER)) {
                    $("#titleForm").html(item.secondaryTitle);
                }

                $(".tipo-tecnologia.data-extra").hide();
            } else {
                $(".tipo-tecnologia.data-extra").show();
            }

            break;
        case TIPO_RELACION.SERVICIO_NUBE:
            $(".tipo-tecnologia").hide();
            $(".tipo-aplicacion").hide();
            $(".tipo-equipo").show();
            //$(".input-relacion-app").hide();
            //$(".tipo-funcion").addClass("ignore");
            $(".tipo-funcion").hide();

            SetItems(DATA_TIPO_EQUIPO, $("#ddlTipoEquipo"), TEXTO_SELECCIONE);
            $("#ddlTipoEquipo").val(TIPO_EQUIPO_SERVICIO_NUBE);
            $("#ddlTipoEquipo").prop("disabled", true);

            $("#spItem01").html(String.Format(TEXTO_RELACION_1, item.title));
            $("#spItem02").html(String.Format(TEXTO_RELACION_2, item.title));

            $("#lblNameEquipo").html(`${item.title}:`);

            $("#txtEquipo").autocomplete("destroy");
            InitAutocompletarEquipo($("#txtEquipo"), $("#hdEquipoId"), ".equipoContainer", URL_AUTOCOMPLETE_EQUIPO.SERVICIONUBE);
            break;
        case TIPO_RELACION.TECNOLOGIA:
            $(".tipo-equipo").hide();
            $(".tipo-aplicacion").hide();
            $(".tipo-tecnologia").show();

            $("#txtTecnologia").autocomplete("destroy");
            InitAutocompletarTecnologia($("#txtTecnologia"), $("#hdTecnologiaId"), ".tecnologiaContainer", item.subdominioIds);

            if ($.trim(item.subdominioIds) !== "") {
                let arrSubdominios = item.subdominioIds.split("|");
                if (arrSubdominios.includes(SUBDOMINIO_IDS.BROWSER)) {
                    $("#titleForm").html(item.secondaryTitle);
                }

                $(".tipo-tecnologia.data-extra").hide();
            } else {
                $(".tipo-tecnologia.data-extra").show();
            }

            break;
        case TIPO_RELACION.APLICACION:
            $(".tipo-tecnologia").hide();
            $(".tipo-equipo").hide();
            $(".tipo-aplicacion").show();
            break;
        default:
            $(".tipo-equipo").hide();
            $(".tipo-aplicacion").hide();
            $(".tipo-tecnologia").show();
    }
}

function ClearView() {
    LimpiarMdAddOrEditRegistro();

    $(".form-principal").removeClass("bloq-element");
    $(".tipo-tecnologia").removeClass("bloq-element");
    $(".tipo-equipo").removeClass("bloq-element");
    $(".tipo-aplicacion").removeClass("bloq-element");
}

function LimpiarMdAddOrEditRegistro() {
    $("#cbAmbiente, #cbRelevancia").val("-1");
    $("#txtEquipo, #txtTecnologia, #txtAplicacion").val("");

    $("#hdEquipoId").val("0");
    $("#hdTecnologiaId").val("0");
    $("#hdAplicacionId").val("0");
    $("#hdId").val("0");
    $("#hdEstadoId").val("");
    $("#hdRelacionDetalleId").val("0");

    //Tipo Relacion Aplicacion
    $("#txtAppVinculo").val("");
    $("#hdAppVinculoId").val("0");
    SetItems([], $("#cbEquipoVin"), TEXTO_SELECCIONE);
    $("#cbEquipoVin").val("-1");
    $("#txtDetAppVin").val("");

    RELACION_DETALLE_EDIT = [];
    DATA_TECNOLOGIA_DESMARCADO = [];
    DATA_TIPO_ACTUAL = 0;
    $tableTecnologia.bootstrapTable("destroy");
    $tableTecnologia.bootstrapTable();

    //LimpiarValidateErrores($("#formAddOrEdit"));
    //$("#ddlFlagRelacionCb").prop("checked", false);
    //$("#ddlFlagRelacionCb").bootstrapToggle("off");

    ClearRadioButtons();

    var validator = $("#formAddOrEdit").validate();
    validator.resetForm();

    $("#txtDominio, #txtSubdominio, #txtTipoTecnologia, #txtFechaFinSoporte").val("");
    $("#lblSuscripcion").html("");
    $("#ddlTipoEquipo").val("-1");
    //$("#ddlFuncion").val("-1");
    $("#ddlFuncion").val("");
    $("#ddlFuncion").multiselect("refresh");

    //$("#cbNuevoEstado").val("-1");
    //$("#txtEstadoActual").val("");
    //$("#txtObservacion").val("");
    //validator = $("#formCambioEstado").validate();
    //validator.resetForm();
}

function InitViewSection(SidebarId, listAction = true, viewModalAction = true, isNewRecordAction = true, itemEdit = null) {
    let item = SIDE_FILTER_DATA.find(x => x.id === SidebarId) || null;
    if (item !== null) {
        $("#hdIdOptSideBar").val(item.id);
        //Set filters
        if (listAction) {
            CURRENT_SIDE_FILTER = item.idTipoRelacionFilter;
            CURRENT_SUBDOMINIO_LIST = item.subdominioIds;
            if (item.idTipoIdFilter == 1) {
                PAGE_TIPO_EQUIPO_ID_CD = TIPO_EQUIPO_ID_CD;
                Param_RelacionApp = 0;
                $("#btnNewRelacion").hide();
                $("#btnNewRelacionApp").hide();
            } else if (item.idTipoIdFilter == 2) {
                PAGE_TIPO_EQUIPO_ID_CD = 0;
                Param_RelacionApp = 1;
                $("#btnNewRelacionApp").show();
                $("#btnNewRelacion").hide();
            } else {
                PAGE_TIPO_EQUIPO_ID_CD = 0;
                Param_RelacionApp = 0;
                $("#btnNewRelacion").show();
                $("#btnNewRelacionApp").hide();
            }
            CURRENT_SIDE_FILTER = CURRENT_SIDE_FILTER.toString();
            ListarRegistros_2();
        }

        //Set view modal
        if (viewModalAction) {
            ChangeCbTipo(item, isNewRecordAction, itemEdit);
        }
    }
}

function SetValueRadio(value) {
    if (value === null) {
        ClearRadioButtons();
    } else {
        $("#rbItem01").prop("checked", value);
        $("#rbItem02").prop("checked", !value);
    }
}

function ClearRadioButtons() {
    $("#rbItem01").prop("checked", false);
    $("#rbItem02").prop("checked", false);
}

function RegistrarAddOrEdit() {
    LimpiarValidateErrores($("#formAddOrEdit"));

    //Validación de relación única
    let estadoUnico = ValidarRelacionUnica();
    if (estadoUnico) {
        MensajeGeneralAlert(TITULO_MENSAJE, TEXTO_RELACION_EXISTENTE);
        return false;
    }
    //let relacionId = $("#hdId").val();
    //if (relacionId === "0" || relacionId === null) {
    //    let estadoUnico = ValidarRelacionUnica();
    //    if (estadoUnico) {
    //        MensajeGeneralAlert(TITULO_MENSAJE, TEXTO_RELACION_EXISTENTE);
    //        return false;
    //    }
    //}

    if (parseInt($("#hdEstadoId").val()) === ESTADO_RELACION.DESAPROBADO) {
        //MdAddOrEditRegistro(false);
        return false;
    }
    //console.log(FLAG_USUARIO_APROBADOR);

    //if (FLAG_USUARIO_APROBADOR) {
    //    let EstadoId = parseInt($("#hdEstadoId").val());
    //    if (EstadoId === ESTADO_RELACION.PENDIENTE || EstadoId === ESTADO_RELACION.PENDIENTEELIMINACION) {
    //        $(".form-principal").addClass("ignore");
    //        $(".tipo-tecnologia").addClass("ignore");
    //        $(".tipo-equipo").addClass("ignore");
    //        $(".form-aprobar").removeClass("ignore");
    //        if ($("#formAddOrEdit").valid()) IrCambiarEstado($("#hdId").val(), $("#cbEstado").val());
    //    } else {
    //        bootbox.alert("Sin cambios por registrar.", function () { });
    //    }

    //    return false;
    //}

    $(".form-principal").removeClass("ignore");

    //let pos = $("#cbTipo").val();
    let pos = parseInt($("#hdTipoRelacionId").val());
    switch (pos) {
        case TIPO_RELACION.TECNOLOGIA:
            $(".tipo-equipo").addClass("ignore");
            $(".tipo-aplicacion").addClass("ignore");
            $(".tipo-tecnologia").removeClass("ignore");
            break;
        case TIPO_RELACION.EQUIPO:
            $(".tipo-tecnologia").addClass("ignore");
            $(".tipo-aplicacion").addClass("ignore");
            $(".tipo-equipo").removeClass("ignore");
            break;
        case TIPO_RELACION.SERVICIO_BROKER:
            $(".tipo-equipo").addClass("ignore");
            $(".tipo-aplicacion").addClass("ignore");
            $(".tipo-tecnologia").removeClass("ignore");
            break;
        case TIPO_RELACION.SERVICIO_NUBE:
            $(".tipo-tecnologia").addClass("ignore");
            $(".tipo-aplicacion").addClass("ignore");
            $(".tipo-equipo").removeClass("ignore");

            $(".tipo-funcion").addClass("ignore");
            break;
        case TIPO_RELACION.APLICACION:
            $(".tipo-tecnologia").addClass("ignore");
            $(".tipo-equipo").addClass("ignore");
            $(".tipo-aplicacion").removeClass("ignore");
            break;
    }

    //AGREGAR MJES DE VALIDACION A LAS CAJAS DE TEXTO DE LA GRILLA
    //$(".tipo-equipo .bootstrap-table input[type='text']").each(function () {
    //    if (!$(this).prop("disabled")) {
    //        $(this).rules('add', {
    //            required: true,
    //            messages: { required: 'Debes ingresar un valor.' }
    //        });
    //    }
    //});

    let flag = ValidarSolicitudEliminacion();
    if (flag) {
        MensajeGeneralAlert(TITULO_MENSAJE, TEXTO_APP_ELIMINACION);
        return false;
    }



    if ($("#formAddOrEdit").valid() && flagEliminada == false) {
        $("#btnRegistrar").button("loading");
        let data = CrearObjRelacion(pos);
        //bootbox.alert("exito", function () { });
        console.log(data);
        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        toastr.success("Registrado correctamente.", TITULO_MENSAJE);
                        OpenCloseModal($("#mdNewOrEditRelacion"), false);
                        ListarRegistros_2();
                    }
                }
            },
            complete: function (data) {
                $("#btnRegistrar").button("reset");
                if (ControlarCompleteAjax(data)) {
                    //window.location.href = URL_REDIRECT_SUCCESS;
                    console.log("correcto");
                }
                else
                    bootbox.alert("Sucedió un error con el servicio", function () { });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}


function ValidarSolicitudEliminacion() {
    let data2 = CrearObjRelacion2();
    let flag = false;

    $.ajax({
        url: URL_API_VISTA + `/VerificarEliminada`,
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data2),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                data = dataObject;
                flag = data;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

    return flag;
}

function GetValueRadio() {
    let radioValue = $("input[name='optradio']:checked").val();
    return radioValue === "1";
}

function InitValidateMain() {
    $.validator.addMethod("existeAplicacion", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $.trim($("#hdAplicacionId").val()) !== "0") {
            estado = ExisteAplicacion();
            return estado;
        }

        return estado;
    });

    $.validator.addMethod("existeTecnologia", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $.trim($("#hdTecnologiaId").val()) !== "0") {
            estado = ExisteTecnologia();
            return estado;
        }

        return estado;
    });

    $.validator.addMethod("existeEquipo", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $.trim($("#hdEquipoId").val()) !== "0") {
            estado = ExisteEquipo();
            return estado;
        }

        return estado;
    });

    $.validator.addMethod("existeEstado", function (value, element) {
        return value !== $("#hdEstadoId").val();
    });


    $.validator.addMethod("existeAplicacionOrigen", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $.trim($("#hdAplicacionIdAppsOrigen").val()) !== "0") {
            estado = ExisteAplicacionOrigen();
            return estado;
        }

        return estado;
    });
    $.validator.addMethod("existeAplicacionDestino", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $.trim($("#hdAplicacionIdAppsDestino").val()) !== "0") {
            estado = ExisteAplicacionDestino();
            return estado;
        }

        return estado;
    });

    //$.validator.addMethod("requiredObservacion", function (value, element) {
    //    let nuevoestado = $("#cbNuevoEstado").val();
    //    let estadoId = parseInt($("#hdEstadoId").val()); // ESTADO ACTUAL
    //    if (estadoId === ESTADO_RELACION.PENDIENTE) {
    //        if (nuevoestado === ESTADO_RELACION.DESAPROBADO) {
    //            return $.trim(value) !== "" && value !== null;
    //        }
    //    } else if (estadoId === ESTADO_RELACION.PENDIENTEELIMINACION) {
    //        if (nuevoestado === ESTADO_RELACION.APROBADO) {
    //            return $.trim(value) !== "" && value !== null;
    //        }
    //    }

    //    return true;
    //});

    $.validator.addMethod("distintoCodigo", function (value, element) {
        let estado = true;
        let appBaseId = $("#hdAplicacionId").val();
        let appVinculoId = $("#hdAppVinculoId").val();

        if ($.trim(value) !== "" && $.trim(appBaseId) !== "0" && $.trim(appVinculoId) !== "0") {
            estado = appBaseId !== appVinculoId ? true : false;
            return estado;
        }

        return estado;
    });

    $("#formAddOrEdit").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class-custom",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtAplicacion: {
                requiredSinEspacios: true,
                existeAplicacion: true
            },
            //cbTipo: {
            //    requiredSelect: true
            //},
            txtTecnologia: {
                requiredSinEspacios: true,
                existeTecnologia: true
            },
            cbRelevancia: {
                requiredSelect: true
            },
            cbAmbiente: {
                requiredSelect: true
            },
            ddlFuncion: {
                requiredSelect: true
            },
            txtEquipo: {
                requiredSinEspacios: true,
                existeEquipo: true
            },
            txtCantidadTecnologia: {
                requiredSinEspacios: false
            },
            cbEstado: {
                requiredSelect: true,
                existeEstado: true
            },
            txtAppVinculo: {
                requiredSinEspacios: true,
                distintoCodigo: true
            },
            cbEquipoVin: {
                requiredSelect: true
            },
            txtDetAppVin: {
                requiredSinEspacios: true
            },
            ddlTipoEquipo: {
                requiredSelect: true
            },
            optradio: {
                required: true
            }
        },
        messages: {
            txtAplicacion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
                existeAplicacion: String.Format("{0} seleccionada no existe.", "La aplicación")
            },
            //cbTipo: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo")
            //},
            txtTecnologia: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la tecnología"),
                existeTecnologia: String.Format("{0} seleccionada no existe.", "La tecnología")
            },
            cbRelevancia: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "la relevancia")
            },
            cbAmbiente: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el ambiente")
            },
            ddlFuncion: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "una función")
            },
            txtEquipo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el equipo"),
                existeEquipo: String.Format("{0} seleccionado no existe.", "El equipo")
            },
            txtCantidadTecnologia: {
                requiredSinEspacios: String.Format("Debes marcar {0}.", "una tecnología")
            },
            cbEstado: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el estado"),
                existeEstado: "Estado ya se encuentra registrado."
            },
            txtAppVinculo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
                distintoCodigo: "Debes seleccionar una aplicación diferente"
            },
            cbEquipoVin: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el equipo")
            },
            txtDetAppVin: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el recurso relacionado")
            },
            ddlTipoEquipo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo de equipo")
            },
            optradio: {
                required: String.Format("Debes seleccionar {0}.", "la relación")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "optradio") {
                element.parent().parent().append(error);
            } else if (element.attr('name') === "ddlFuncion") {
                element.parent().parent().parent().parent().append(error);
            }
            else {
                element.parent().append(error);
            }
        }
    });

    $("#formAddOrEditApps").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class-custom",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtAplicacionAppsOrigen: {
                requiredSinEspacios: true,
                existeAplicacionOrigen: true
            },
            txtAplicacionAppsDestino: {
                requiredSinEspacios: true,
                existeAplicacionDestino: true
            },
            cbTipoRelacionApps: {
                requiredSelect: true
            }
        },
        messages: {
            txtAplicacionAppsOrigen: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
                existeAplicacionOrigen: String.Format("{0} seleccionada no existe.", "La aplicación")
            },
            txtAplicacionAppsDestino: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación relacionada"),
                existeAplicacionDestino: String.Format("{0} seleccionada no existe.", "la aplicación relacionada")
            },
            cbTipoRelacionApps: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo de relación")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "optradio") {
                element.parent().parent().append(error);
            } else if (element.attr('name') === "ddlFuncion") {
                element.parent().parent().parent().parent().append(error);
            }
            else {
                element.parent().append(error);
            }
        }
    });

    $("#formCambioEstadoAppsEst").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class-custom",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbNuevoEstadoAppsEst: { requiredSelect: true, existeEstado: true },
        },
        messages: {
            cbNuevoEstadoAppsEst: { requiredSelect: String.Format("Debes seleccionar {0}.", "el estado"), existeEstado: "Estado ya se encuentra registrado." },
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "optradio") {
                element.parent().parent().append(error);
            } else if (element.attr('name') === "ddlFuncion") {
                element.parent().parent().parent().parent().append(error);
            }
            else {
                element.parent().append(error);
            }
        }
    });


    //if (FLAG_USUARIO_APROBADOR) {

    //    $("#formCambioEstado").validate({
    //        validClass: "my-valid-class",
    //        errorClass: "my-error-class",
    //        ignore: ".ignore",
    //        rules: {
    //            cbNuevoEstado: { requiredSelect: true, existeEstado: true },
    //            txtObservacion: { requiredObservacion: true }
    //        },
    //        messages: {
    //            cbNuevoEstado: { requiredSelect: String.Format("Debes seleccionar {0}.", "el estado"), existeEstado: "Estado ya se encuentra registrado." },
    //            txtObservacion: { requiredObservacion: String.Format("Debes ingresar {0}.", "la observación") }
    //        }
    //    });
    //}
}

function setReadOnlyDataTecnologia(item) {
    $("#txtDominio").val(item.Dominio);
    $("#txtSubdominio").val(item.Subdominio);
    $("#txtTipoTecnologia").val(item.TipoTecnologia);
    $("#txtFechaFinSoporte").val(item.FechaFinSoporteStr);
}

function GetTecnologiaAutocompleteById(Id) {
    let data = null;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Tecnologia/GetTecnologiaAutocompleteById?Id=${Id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                data = dataObject;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return data;
}

function ValidarFiltros() {

    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            FechaFiltro: {
                required: true,
                isDate: true,
                FechaPrevia: true,
                FechaMaxima: true
            }
        },
        messages: {
            FechaFiltro: {
                required: "Debe seleccionar una fecha",
                isDate: "Debe ingresar una fecha valida",
                FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtFilFecha") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function VllidarRelacionEquipo(id) {
    var responseFlag = false;
    let Fecha = DATA_EXPORTAR.FechaConsulta;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ValidarRelacionEquipo?Id=${id}&Fecha=${Fecha}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                responseFlag = dataObject;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

    return responseFlag;
}
const showRelacionModalApps = () => {
    $("#titleModalRelacionApps").html("Nueva Relación");
    let _id = parseInt($("#hdIdOptSideBar").val());
    InitViewSection(_id, false, true);
    LimpiarSeleccionApps();
    LimpiarValidateErrores($("#formAddOrEditApps"));
    Param_RelacionAppEditAdd = 0;
    OpenCloseModal($("#mdNewOrEditRelacionApps"), true);
};

function LimpiarSeleccionApps() {
    $("#hdAplicacionIdAppsOrigen").val("");
    $("#hdAplicacionDesAppsOrigen").val("");
    $("#hdAplicacionIdAppsDestino").val("");
    $("#hdAplicacionDesAppsDestino").val("");
    $("#txtAplicacionAppsOrigen").val("");
    $("#txtAplicacionAppsDestino").val("");
    $("#txtAplicacionAppsOrigen").prop("readonly", false);
    $("#txtAplicacionAppsDestino").prop("readonly", false);
    var LIST_APPSSELECCIONADOS = [];
    $tblRegistroRelacionApps.bootstrapTable('destroy');
    $tblRegistroRelacionApps.bootstrapTable({
        data: LIST_APPSSELECCIONADOS
    });
}

function mostrarSeleccionApps() {
    var valOrigenID = $("#hdAplicacionIdAppsOrigen").val();
    var valOrigenDes = $("#hdAplicacionDesAppsOrigen").val();
    var valDestinoID = $("#hdAplicacionIdAppsDestino").val();
    var valDestinoDes = $("#hdAplicacionDesAppsDestino").val();

    if (valOrigenID == valDestinoID) {
        toastr.error("Por favor, revise las aplicaciones seleccionadas.", TITULO_MENSAJE);
        return;
    }

    var LIST_APPSSELECCIONADOS = [];
    var mydata =
    {
        "OrigenApp": valOrigenDes,
        "DestinoApp": valDestinoDes
    };
    LIST_APPSSELECCIONADOS.push(mydata);

    $tblRegistroRelacionApps.bootstrapTable('destroy');
    $tblRegistroRelacionApps.bootstrapTable({
        data: LIST_APPSSELECCIONADOS
    });
}

function RelacionesAppAddOrEdit() {

    var flujo = $("#titleModalRelacionApps").text();
    var nuevo = flujo.substr(0, 4).trim() == "Nuev" ? true : false;

    if ($("#formAddOrEditApps").valid() && flagEliminada == false) {
        var codigoAptOrigen = $("#hdAplicacionIdAppsOrigen").val();
        var codigoAptDestino = $("#hdAplicacionIdAppsDestino").val();
        var aplicacionRelacionada = codigoAptOrigen;
        var tipoRelacionComponente = $("#cbTipoRelacionApps").val();
        var EstadoId = $("#hdEstadoIdApps").val();
        var RelacionId = $("#hdRelacionIdApps").val();

        if (codigoAptOrigen == codigoAptDestino) {
            toastr.error("Por favor, revise las aplicaciones seleccionadas.", "Relaciones entre Aplicaciones");
            return;
        }

        if (EstadoId == 0 || !EstadoId) {
            EstadoId = ESTADO_RELACION.PENDIENTE
        }

        if (nuevo) {
            let relacionExiste = ExisteRelacionApp(codigoAptOrigen, codigoAptDestino, aplicacionRelacionada)

            if (relacionExiste) {
                MensajeGeneralAlert("Registro de Relación de Aplicación", "Las aplicaciones ya están relacionadas anteriormente.");
                return false;
            }

            let registro = RegistrarRelacionApp(codigoAptOrigen, codigoAptDestino, tipoRelacionComponente, EstadoId);

            if (registro) {
                toastr.success("Registrado correctamente.", "Relaciones entre Aplicaciones");
                OpenCloseModal($("#mdNewOrEditRelacionApps"), false);
                ListarRegistros_2();
                return true;
            }

        } else {

            let actualiza = ActualizarRelacionApp(RelacionId, tipoRelacionComponente, EstadoId);

            if (actualiza) {
                toastr.success("Actualizado correctamente.", "Relaciones entre Aplicaciones");
                OpenCloseModal($("#mdNewOrEditRelacionApps"), false);
                ListarRegistros_2();
                return true;
            }
        }
    }
}

function ExisteRelacionApp(codigoAptOrigen, codigoAptDestino, aplicacionRelacionada) {

    var requestBody = {
        "codigoAptOrigen": codigoAptOrigen,
        "codigoAptDestino": codigoAptDestino,
        "aplicacionRelacion": aplicacionRelacionada
    };

    let flag = false;

    $.ajax({
        url: URL_API_VISTA + `/ExisteRelacionApp`,
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(requestBody),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                data = dataObject;
                flag = data;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

    return flag;
}

function RegistrarRelacionApp(codigoAptOrigen, codigoAptDestino, TipoId, EstadoId) {

    var requestBody = {
        "codigoAptOrigen": codigoAptOrigen,
        "codigoAptDestino": codigoAptDestino,
        "TipoId": TipoId,
        "EstadoId": EstadoId,
    };

    let flag = false;

    $.ajax({
        url: URL_API_VISTA + `/RegistrarRelacionApp`,
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(requestBody),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                data = dataObject;
                flag = data;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

    return flag;
}




function EditarRelacionApp(RelacionId, CodigoAptOrigen, NombreAptOrigen, CodigoAptDestino, NombreAptDestino, TipoId, EstadoId, EstadoStr) {

    if (EstadoId === ESTADO_RELACION.PENDIENTE || EstadoId === ESTADO_RELACION.APROBADO) {
        Param_RelacionAppEditAdd = 1;
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $("#titleModalRelacionApps").html("Editar Relación");

        let _id = parseInt($("#hdIdOptSideBar").val());
        InitViewSection(_id, false, true);
        //LimpiarSeleccionApps();
        LimpiarValidateErrores($("#formAddOrEditApps"));
        OpenCloseModal($("#mdNewOrEditRelacionApps"), true);

        $("#txtAplicacionAppsOrigen").val(CodigoAptOrigen + " - " + NombreAptOrigen);
        $("#hdAplicacionIdAppsOrigen").val(CodigoAptOrigen);
        $("#hdAplicacionDesAppsOrigen").val(NombreAptOrigen);

        $("#txtAplicacionAppsDestino").val(CodigoAptDestino + " - " + NombreAptDestino);
        $("#hdAplicacionIdAppsDestino").val(CodigoAptDestino);
        $("#hdAplicacionDesAppsDestino").val(NombreAptDestino);

        $("#txtAplicacionAppsOrigen").prop("readonly", true);
        $("#txtAplicacionAppsDestino").prop("readonly", true);

        $("#hdEstadoIdApps").val(EstadoId);
        $("#hdRelacionIdApps").val(RelacionId);

        $tblRegistroRelacionApps.bootstrapTable('destroy');

        var LIST_APPSSELECCIONADOS = [];
        var mydata =
        {
            "OrigenApp": NombreAptOrigen,
            "DestinoApp": NombreAptDestino
        };
        LIST_APPSSELECCIONADOS.push(mydata);

        $tblRegistroRelacionApps.bootstrapTable({
            data: LIST_APPSSELECCIONADOS
        });

        $("#cbTipoRelacionApps").val(TipoId);

        waitingDialog.hide();

    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, String.Format("La relación se encuentra en estado {0}. No es posible editar", EstadoStr));
    }
}

function ActualizarRelacionApp(RelacionId, TipoId, EstadoId) {

    var requestBody = {
        "RelacionId": RelacionId,
        "TipoId": TipoId,
        "EstadoId": EstadoId,
    };

    let flag = false;

    $.ajax({
        url: URL_API_VISTA + `/ActualizarRelacionApp`,
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(requestBody),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                data = dataObject;
                flag = data;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

    return flag;
}


function IrEliminarRegistroApp(RelacionId, AppOrigen, AppDestino, tipo) {
    LimpiarValidateErrores($("#formOSAppsElimi"));
    $("#hdAplicacionIdAppsOrigenEli").val(AppOrigen);
    $("#hdAplicacionIdAppsDestinoEli").val(AppDestino);
    $("#hdTipoRelacionAppsEli").val(tipo);
    $("#hdRelacionIdEli").val(RelacionId);
    $("#txtObsAppsElimi").val("");
    $("#title_modalAppsElimi").html(TITULO_MENSAJE);
    OpenCloseModal($("#mdOSAppsElimi"), true);
}

function Motivo_ChangeApps() {
    var ddlVal = $(this).val();
    LimpiarValidateErrores($("#formOSAppsElimi"));
    if (ddlVal === "4") {
        $(".input-obs").removeClass("ignore");
        $(".divObs").show();
    }
    else {
        $(".input-obs").addClass("ignore");
        $(".divObs").hide();
    }
}

function eliminarRelacionApps() {
    if ($("#formOSAppsElimi").valid()) {
        let comentario = $("#ddlMotivoAppsElimi").val() === "4" ? $.trim($("#txtObsAppsElimi").val()) : $("option:selected", $("#ddlMotivoAppsElimi")).text();
        let idmotivo = $("#ddlMotivoAppsElimi").val();

        var RelacionId = $("#hdRelacionIdEli").val();
        let resultado = PostEliminarRelacionApp(RelacionId, comentario);

        if (resultado) {
            toastr.success("Se eliminó correctamente.", TITULO_MENSAJE);
            OpenCloseModal($("#mdOSAppsElimi"), false);
            ListarRegistros_2();
            return true;
        }

    }
}

function validarFormOSAppsElimi() {
    $("#formOSAppsElimi").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlMotivoAppsElimi: {
                requiredSelect: true
            },
            txtObsAppsElimi: {
                requiredSinEspacios: true
            }
        },
        messages: {
            ddlMotivoAppsElimi: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el motivo")
            },
            txtObsAppsElimi: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el comentario")
            }
        }
    });
}


function IrAbrirModalCambioEstadoAppsEst(RelacionId, AppOrigen, AppDestino, tipo, EstadoId, EstadoStr) {
    MdCambioEstadoAppsEst(true);
    $("#hdAplicacionIdAppsOrigenEst").val(AppOrigen);
    $("#hdAplicacionIdAppsDestinoEst").val(AppDestino);
    $("#hdTipoRelacionAppsEst").val(tipo);
    $("#hdEstadoIdApps").val(EstadoId);
    $("#hdRelacionIdCambioEstado").val(RelacionId);
    switch (EstadoId) {
        case ESTADO_RELACION.PENDIENTE:
            $("#txtObservacionAppsEst").prop("disabled", false);
            $("#txtObservacionAppsEst").val("");
            $(".form-group.form-modal-cambioestado").hide();
            SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTE_MODAL.includes(x.Id)), $("#cbNuevoEstadoAppsEst"), TEXTO_SELECCIONE);
            break;
        case ESTADO_RELACION.PENDIENTEELIMINACION:
            let comentario = GetComentarioByRelacionId();
            $("#txtObservacionAppsEst").val(comentario);
            $("#txtObservacionAppsEst").prop("disabled", true);
            $(".form-group.form-modal-cambioestado").show();
            SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTEELIMINACION_MODAL.includes(x.Id)), $("#cbNuevoEstadoAppsEst"), TEXTO_SELECCIONE);
            break;
    }
    $("#cbNuevoEstadoAppsEst").val(-1);
    $("#cbNuevoEstadoAppsEst").trigger("change");
    $("#txtEstadoActualAppsEst").val(EstadoStr);
}

function MdCambioEstadoAppsEst(EstadoMd) {
    $("#formCambioEstadoAppsEst").validate().resetForm();
    if (EstadoMd)
        $("#mdCambioEstadoAppsEst").modal(opcionesModal);
    else
        $("#mdCambioEstadoAppsEst").modal("hide");
}



function GuardarNuevoEstadoEst() {
    $(".form-principal").addClass("ignore");
    $(".tipo-tecnologia").addClass("ignore");
    $(".tipo-equipo").addClass("ignore");
    $(".form-aprobar").addClass("ignore");
    $(".form-modal-cambioestado").removeClass("ignore");
    if ($("#formCambioEstadoAppsEst").valid()) {

        var tipoRelacionComponente = $("#hdTipoRelacionAppsEst").val();
        var RelacionId = $("#hdRelacionIdCambioEstado").val();

        var NuevoEstadoId = $("#cbNuevoEstadoAppsEst").val();
        let registro = ActualizarRelacionApp(RelacionId, tipoRelacionComponente, NuevoEstadoId);

        if (registro) {
            toastr.success("Se cambio correctamente.", "Relaciones entre Aplicaciones");
            OpenCloseModal($("#mdCambioEstadoAppsEst"), false);
            ListarRegistros_2();
            return true;
        }
    }
}

function irReiniciarEstadoApps(RelacionId, codigoAptOrigen, codigoAptDestino, TipoId) {

    let AplicacionRelacion = codigoAptOrigen;
    let Id = RelacionId;

    bootbox.confirm({
        title: "Relación entre Aplicaciones",
        message: "¿Estás seguro que deseas reiniciar el estado del registro seleccionado?",
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result) {
                let data = {
                    RelacionId: Id,
                    codigoAptOrigen: codigoAptOrigen,
                    codigoAptDestino: codigoAptDestino,
                    AplicacionRelacion: AplicacionRelacion,
                    TipoId: TipoId,
                    EstadoId: ESTADO_RELACION.PENDIENTE,
                };
                AjaxCambiarEstadoApps(data);
            }
        }
    });
}

function AjaxCambiarEstadoApps(data) {
    $.ajax({
        url: URL_API_VISTA + "/ActualizarRelacionApp",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (result) {
            if (result) {
                toastr.success("El cambio de estado se realizó correctamente.", "Relación entre Aplicaciones");
            }
            else {
                OpenCloseModal($("#mdOS"), false);
                OpenCloseModal($("#mdMessageRemove"), true);
            }
        },
        complete: function (data) {
            if (data.responseJSON == true) {
                if (ControlarCompleteAjax(data)) {
                    OpenCloseModal($("#mdOS"), false);
                    MdAddOrEditRegistro(false);
                    MdCambioEstado(false);

                    $("#hdEquipoId").val("");
                    FLAG_REMOVE_EQUIPO = false;
                    ListarRegistros_2();
                } else
                    MensajeErrorCliente();
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function PostEliminarRelacionApp(RelacionId, Comentario) {

    var requestBody = {
        "RelacionId": RelacionId,
        "MotivoEliminacionRelacionApp": Comentario,
    };

    let flag = false;

    $.ajax({
        url: URL_API_VISTA + `/EliminarRelacionApp`,
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(requestBody),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                data = dataObject;
                flag = data;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

    return flag;
}

function GetComentarioRelacionAppEliminadaByRelacionId(RelacionId) {
    let retorno = "";

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GetComentarioEliminacionRelacionApp/${RelacionId}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    retorno = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

    return retorno;
}