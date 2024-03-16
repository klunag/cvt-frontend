var $tblModuloAplicacion = $("#tblModuloAplicacion");
var $table = $("#tblSeccion");
var $tblServidorAplicacion = $("#tblServidorAplicacion");

const URL_API_VISTA = URL_API + "/Aplicacion/GestionAplicacion";
const NO_APLICA = "NO APLICA";
const USER_IT = "User IT";
const TIPO_DESARROLLO_INHOUSE = "In House / In";
const TIPO_FLUJO_PORTAFOLIO = { FNA: 1, PAE: 2 };
const TITULO_MENSAJE = "Gestión de Aplicaciones";
const TITULO_MENSAJE_CUESTIONARIO = "Cuestionario PAE";
const SCORE_PAE = { Cero: 0, Uno: 1, Dos: 2, Tres: 3 };
const SECCION_CALCULO_DESCRIPCION = { Alto: "ALTO", Medio: "MEDIO", Bajo: "BAJO", NA: "N/A" };
const CLASIFICACION_DESCRIPCION = { Restringido: "RESTRINGIDO", Publico: "PUBLICO", UsoInterno: "USO INTERNO" };
const URL_BANDEJA_REDIRECT = `${URL_BANDEJA_APP_APROBADOR}?id_aprobador=${id_bandeja}`;
const BANDEJAS_APROBADORES = { ArquitecturaTI: 1, ClasificacionTecnica: 2, DevSecOps: 3 };
const MATRICULA_RESPONSABLES = [
    "TribeTechnicalLead",
    "JefeEquipo_ExpertoAplicacionUserIT_ProductOwner",
    "BrokerSistemas",
    "Owner_LiderUsuario_ProductOwner",
    "Gestor_UsuarioAutorizador_ProductOwner",
    "Experto_Especialista"];

const IDS_CAMPOS_ESPECIALES = [
    "59", //Codigo interfaz
    "14", //TTL
    "15", //JdE
    "18", //LiderUsuario - Owner
    "19", //Usuario autorizador - Gestor
    "33", //Experto
    "37" //Broker
];

const INF_ESCENARIO1 = ["SERVIDORES AIO"];
const INF_ESCENARIO2 = ["SERVIDORES AIO", "SERVIDOR CONSOLIDADO AIO", "SERVIDOR AUTOGESTIONADO"];
const INF_ESCENARIO3 = ["PC USUARIO"];
const INF_EXTERNO = ["HOSTING EXTERNO", "CLOUD - IAAS", "CLOUD - PAAS", "CLOUD - SAAS"];
const TIP = { TextBox: 1, ListBox: 2 };
const IDS_SO_PC_USUARIO = "7855;3215;3218;27;28;29;30";
const ACCIONES_PORTAFOLIO = { CONFIRMAR: 1, RESPONDER: 2, REGISTRAR: 3 };
const ESTADO_SOLICITUD_APP = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
const CAMBIO_ESTADO_SOLICITUD = { EnRevision: 2, Aprobar: 3, Observar: 4 };

var IDS_REMOVER_SERVIDOR = [];
var DATA_RESULT_REGISTRO = {};
var DATA_LISTBOX_NUEVO = {};
var NOMBRE_CAMPO_USUARIO_AUTORIZADOR = "";
var CARGA_RESPONSABLES = false;
var NOMBRE_FILE_CHECKLIST, NOMBRE_FILE_CONFORMIDAD, NOMBRE_FILE_MATRIZ, NOMBRE_FILE_CONFORMIDAD_MATRIZ = "";
var locale = { OK: 'OK', CONFIRM: 'Observar', CANCEL: 'Cancelar' };
var DATOS_RESPONSABLE = {};
var DATA_EXPORTAR = {};
var TIPO_COMENTARIO = { OBSERVACION: 1, COMENTARIO: 2 };
var FLAG_REGISTRADO = { SI: "1", NO: "0" };
var ESTADO_APLICACION_COMBO = [];
var MODELO_ENTREGA_COMBO = [];
var UBICACION_COMBO = [];
var OOR_COMBO = [];
var INFRAESTRUCTURA_COMBO = [];
var ARQUITECTO_COMBO = [];
var SECCION = { CONFIDENCIALIDAD: 1, INTEGRIDAD: 2, DISPONIBILIDAD: 3, PRIVACIDAD: 4 };
var SECCIONES_CUESTIONARIO = [
    {
        Seccion: SECCION.CONFIDENCIALIDAD,
        Preguntas: []
    },
    {
        Seccion: SECCION.INTEGRIDAD,
        Preguntas: []
    },
    {
        Seccion: SECCION.DISPONIBILIDAD,
        Preguntas: []
    },
    {
        Seccion: SECCION.PRIVACIDAD,
        Preguntas: []
    },
];
var TIPO_FLUJO_ACTUAL = 0;
var TAI_DATA = {};
var EstructuraRET =
    `SO: {0}
HP: {1}
LP: {2}
BD: {3}
FW: {4}
`;

const DATA_AMBIENTES = [
    {
        Nombre: "Desarrollo",
        IdHtml: "ddlInstaDesarrollo"
    },
    {
        Nombre: "Certificación",
        IdHtml: "ddlInstaCertificacion"
    },
    {
        Nombre: "Producción",
        IdHtml: "ddlInstaProduccion"
    }
];
const DATA_RESPONSABLES = [
    {
        Input: "txtLiderUsuario",
        Class: "divResponsables0",
        CbAplica: "ddlFlagAplica1"
    },
    {
        Input: "txtUsuarioAutorizador",
        Class: "divResponsables0",
        CbAplica: "ddlFlagAplica2"
    },
    {
        Input: "txtTTL",
        Class: "divResponsables1",
        CbAplica: "ddlFlagAplica3"
    },
    {
        Input: "txtExpertoApp",
        Class: "divResponsables0",
        CbAplica: "ddlFlagAplica4"
    },
    {
        Input: "txtBroker",
        Class: "divResponsables2",
        CbAplica: "ddlFlagAplica5"
    },
    {
        Input: "txtJefeEquipoPO",
        Class: "divResponsables3",
        CbAplica: "ddlFlagAplica6"
    },
    //{
    //    Input: "txtGestorUserIT",
    //    Class: "divResponsables7",
    //    CbAplica: "ddlFlagAplica7"
    //}
];

$(function () {
    getCurrentUser();

    InitAutocompletarBuilder($("#txtAppReemplazo"), $("#hdAppReemplazoId"), ".divAppReemplazoContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtProveedor"), $("#hdProveedor"), ".divProveedorContainer", "/Solicitud/GetProveedorDesarrolloByFiltro?filtro={0}");

    InitAutocompletarEstandarBuilder($("#txtItemSO"), $("#hdSOId"), ".divSOContainer", $("#hdEstadoSO"), "/Tecnologia/GetTecnologiaEstandarByFiltro?filtro={0}&subdominioList={1}&soPcUsuarioList={2}", "36");
    InitAutocompletarEstandarBuilder($("#txtItemHP"), $("#hdHPId"), ".divHPContainer", $("#hdEstadoHP"), "/Tecnologia/GetTecnologiaEstandarByFiltro?filtro={0}&subdominioList={1}&soPcUsuarioList={2}", "13;8"); //Se agrego el SubdominioId = 8 (Desktop software)
    InitAutocompletarEstandarBuilder($("#txtItemLP"), $("#hdLPId"), ".divLPContainer", $("#hdEstadoLP"), "/Tecnologia/GetTecnologiaEstandarByFiltro?filtro={0}&subdominioList={1}&soPcUsuarioList={2}", "14");
    InitAutocompletarEstandarBuilder($("#txtItemBD"), $("#hdBDId"), ".divBDContainer", $("#hdEstadoBD"), "/Tecnologia/GetTecnologiaEstandarByFiltro?filtro={0}&subdominioList={1}&soPcUsuarioList={2}", "68;69");
    InitAutocompletarEstandarBuilder($("#txtItemFramework"), $("#hdFrameworkId"), ".divFrameworkContainer", $("#hdEstadoFW"), "/Tecnologia/GetTecnologiaEstandarByFiltro?filtro={0}&subdominioList={1}&soPcUsuarioList={2}", "14");
    InitAutocompletarBuilderUnidad($("#txtTribu"), null, ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro?filtro={0}&filtroPadre={1}", "");
    InitAutocompletarBuilder($("#txtNombreServidor"), null, ".divServidorContainer", "/Equipo/GetEquipoByFiltro?filtro={0}");

    $tblServidorAplicacion.bootstrapTable("destroy");
    $tblServidorAplicacion.bootstrapTable({ data: [] });

    SetItemsMultiple([], $("#ddlEntidadUso"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#ddlAmbiente"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#ddlCategoriaTec"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    $(".file-options1, .file-options2, .file-options3, .file-options4, .file-options5").hide();
    $(".section-fna").hide();
    $(".rowNewFields").hide();

    FormatoCheckBox($("#divFlagAplica"), "ddlFlagAplica");
    FormatoCheckBox($("#divFlagAplicaCheckList"), "ddlFlagAplicaCheckList");
    FormatoCheckBox($("#divFlagAplicaMatriz"), "ddlFlagAplicaMatriz");
    $("#ddlFlagAplica").change(FlagAplica_Change);
    $("#ddlFlagAplicaCheckList").change(FlagAplicaCheckList_Change);
    $("#ddlFlagAplicaMatriz").change(FlagAplicaMatriz_Change);
    $("#ddlTipoDesarrollo").change(DdlTipoDesarrollo_Change);
    $("#ddlTipoActivoInformacion").change(DdlTipoActivoInformacion_Change);
    $("#ddlGerenciaCentral").change(DdlGerencia_Change);
    $("#ddlDivision").change(DdlDivision_Change);
    $("#ddlArea").change(DdlArea_Change);
    $("#ddlAreaBIAN").change(DdlAreaBian_Change);
    $("#ddlDominioBIAN").change(DdlDominioBian_Change);
    $("#ddlJefaturaATI").change(DdlJefaturaAti_Change);
    $("#ddlProcesoClave").change(DdlProcesoClave_Change);
    $("#ddlGestionadoPor").change(DdlGestionadoPor_Change);
    $("#ddlUbicacion").change(DdlUbicacion_Change);
    $("#ddlInfraestructura").change(DdlInfraestructura_Change);
    $("#ddlAmbiente").change(DdlAmbiente_Change);

    $("#txtAppReemplazo").blur(Foco_AppReemplazo);

    initCbMatricula();
    initFecha();
    initLblMatricula();
    InitInputFiles();
    InitAutocompleteResponsable($("#txtLiderUsuario"),
        $("#ddlGestionadoPor"),
        $("#txtUsuarioAutorizador"),
        $("#txtJefeEquipoPO"));

    //bhAutocompleteGestor($("#txtGestorUserIT"), $("#txtGestorApps"));
    //bhAutocompleteGestor($("#txtUsuarioAutorizador"), $("#txtGestorApps"));
    bhAutocompleteSquad($("#txtTribu"), $("#txtNombreSquad"));

    validarFormApp();
    cargarCombos();
    validarFormOS();
    limpiarFormRegister();

    $("#txtAppReemplazo").val(NO_APLICA);
    $("#txtBD, #txtFramework").val(NO_APLICA);
    updateRET();

    setValidacionVista(VISTA_ID);

    if (APLICACION_ID !== 0) {
        //Validar el Estado Solicitud
        let EstadoSolicitudId = getEstadoSolicitudAppById(APLICACION_ID);
        //Carga manual o carga automatica
        if (EstadoSolicitudId !== 0) {
            //Carga manual
            setVistaByEstado(EstadoSolicitudId);
            editarAplicacion(APLICACION_ID, TIPO_SOLICITUD_ID);
        } else {
            //Carga automatica (no tienen estado solicitud)
            setVistaByEstado(7);
            editarAplicacion(APLICACION_ID);
        }

    } else {
        setVistaByEstado(0);
    }

    $("#dpFechaSolicitud").prop("disabled", true);
    $("#dpFechaElaboracion").attr("disabled", "disabled");

    //$("#btnRegistrarCuestionario").click(RegistrarAddOrEditCuestionario);
    $("#btnCalcularCumplimiento").click(CalculoNivelCumplimientos);
    //$("#btnRegistrarServidor").click(RegistrarServidorAplicacion);
    $("#btnRegistrarServidor").click(AddItemServidorAplicacion);
    $("#btnShowModalCodigoInterfaz").click(irBuscadorCodigos);
    $("#txtNCG").attr("disabled", "disabled");
    //$("#txtNCLS").attr("disabled", "disabled");
    $("#txtNCET").attr("disabled", "disabled");

    validarFormBuscadorCodigos();
    SetItems([], $("#ddlCodigosDisponibles"), TEXTO_SELECCIONE);
});

function Foco_AppReemplazo() {
    let valor = $(this).val();
    $(this).val($.trim(valor) !== "" ? valor : NO_APLICA);
}

function setValidacionVista(idVista) {
    switch (idVista) {
        case VISTA_GESTION_APP.REGISTRO:
            $(".catalogo-app").addClass("ignore");
            $(".catalogo-app").hide();
            $("#btnRegresarSol").show();
            $("#btnCerrarApp").hide();
            $(".tabCuestionario").addClass("bloq-element");
            break;
        case VISTA_GESTION_APP.CATALOGO:
            $("#divFechaSolicitud").addClass("bloq-element");
            $("#btnGuardarApp").show();
            break;
        case VISTA_GESTION_APP.BANDEJA:
            $(".catalogo-app").addClass("ignore");
            $(".catalogo-app").hide();
            $("#btnAprobarApp").show();
            $("#btnObservarApp").show();

            $(".tabCuestionario").addClass("bloq-element");
            break;
        case VISTA_GESTION_APP.APROBADORES:
            // debugger;
            $("#ddlTipoActivoInformacion").attr("disabled", "disabled");
            $(".catalogo-app").addClass("ignore");
            $(".catalogo-app").hide();
            $("#btnOkAprobador").show();
            $("#btnObsAprobador").show();
            $("#btnCerrarAprobador").show();
            $("#btnCerrarApp").hide();
            $("#btnGuardarApp").hide();

            $("#tab1, #tab2, #tab3, #tab6").addClass("bloq-element");
            //$(".tabCuestionario").addClass("bloq-element");
            break;
        case VISTA_GESTION_APP.MODIFICAR:
            $(".catalogo-app").addClass("ignore");
            $(".catalogo-app").hide();
            $("#btnRegistrarApp, #btnConfirmarApp").hide();
            $("#btnGuardarApp, #btnCerrarApp").hide();

            $("#btnRegistrarSolMod, #btnConfirmarSolMod, #btnRegresarSol").show();

            $("#btnDescargarFile").hide();
            $("#btnEliminarFile").hide();
            $('#ddlTipoActivoInformacion').prop('disabled', true);
            $(".tabCuestionario").addClass("bloq-element");
            break;
    }
}

function DdlTipoDesarrollo_Change() {
    let ddlVal = $(this).val();
    if (ddlVal === TIPO_DESARROLLO_INHOUSE) {
        //$(".divProveedorContainer").hide();
        $("#txtProveedor").attr("disabled", "disabled");
        $("#txtProveedor").val(NO_APLICA);
    }
    else {
        //$(".divProveedorContainer").show();
        $("#txtProveedor").removeAttr("disabled");
        $("#txtProveedor").val("");
    }        
}

function DdlGerencia_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        InitSelectBuilder(ddlVal, $("#ddlDivision"), "/Aplicacion/ConfiguracionPortafolio/GetDivisionByFiltro");
        SetItems([], $("#ddlArea"), TEXTO_SELECCIONE);
    }
}

function DdlDivision_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        InitSelectBuilder(ddlVal, $("#ddlArea"), "/Aplicacion/ConfiguracionPortafolio/GetAreaByFiltro");
    }
}

function DdlArea_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        //InitSelectBuilder(ddlVal, $("#txtTribu"), "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro");
        $("#txtTribu").autocomplete("destroy");
        InitAutocompletarBuilderUnidad($("#txtTribu"), null, ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro?filtro={0}&filtroPadre={1}", ddlVal);
    }
}

function DdlAreaBian_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        InitSelectBuilder(ddlVal, $("#ddlDominioBIAN"), "/Aplicacion/ConfiguracionPortafolio/GetDominioBianByFiltro");
        InitSelectBuilder(ddlVal, $("#ddlPlataformaBCP"), "/Aplicacion/ConfiguracionPortafolio/GetPlataformaBcpByFiltro");
    }
}

function DdlDominioBian_Change() {
    //let ddlVal = $(this).val();
    //let ddlfiltro1 = $("#ddlAreaBIAN").val() || "-1";
    //if (ddlVal !== "-1") {
    //    InitSelectBuilder(ddlVal, $("#ddlJefaturaATI"), "/Aplicacion/ConfiguracionPortafolio/GetJefaturaAtiByFiltro", ddlfiltro1);
    //}
}

function DdlJefaturaAti_Change() {
    let ddlVal = $(this).val();
    //let ddlfiltro1 = $("#ddlDominioBIAN").val() || "-1";
    if (ddlVal && ddlVal !== "-1") {
        let ddlEstadoAplicacion = $("#ddlEstado").val() || "";
        let flagEstado = ddlEstadoAplicacion === "Eliminada";
        InitSelectBuilder(ddlVal, $("#ddlArquitectoTI"), "/Aplicacion/ConfiguracionPortafolio/GetArquitectoTiByFiltro", "", true, flagEstado);
    }
}

function DdlProcesoClave_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        let flagProceso = "";
        if (ddlVal !== "NO APLICA") {
            let retorno = ProcesoClaveEsVital(ddlVal);
            flagProceso = retorno !== null && retorno ? "SI" : "NO";
        }
        CalcularNivelCriticidad(flagProceso);
    }
}

//divResponsables1: TTL
//divResponsables2: Broker

function DdlGestionadoPor_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        //debugger;
        let retorno = GetDataByTextDDL(ddlVal, "/Aplicacion/ConfiguracionPortafolio/GetGestionadoPorByNombre");
        if (TIPO_FLUJO_ACTUAL === TIPO_FLUJO_PORTAFOLIO.FNA) {
            $("#divTitleUsuarioAutorizador").html(NOMBRE_CAMPO_USUARIO_AUTORIZADOR);
            let flagEquipoAgil = retorno !== null ? retorno.FlagEquipoAgil : false;
            if (flagEquipoAgil)
                EnableDisableGrupoResponsables("divResponsables1", "divResponsables2");
            else {
                EnableDisableGrupoResponsables("divResponsables2", "divResponsables1");
                //EnableDisableGrupoResponsables("", "divResponsables7");
            }
        } else {
            //Ocultar TTL y Broker
            //EnableDisableGrupoResponsables("", "divResponsables1");
            //EnableDisableGrupoResponsables("", "divResponsables2");

            ////Si es Usuario
            //if (ddlVal.toUpperCase() === "USUARIO") {
            //    EnableDisableGrupoResponsables("divResponsables2", ""); //Se habilita broker
            //} else if (ddlVal.toUpperCase().includes("COE ") || ddlVal.toUpperCase().includes("TRIBU ")) {
            //    EnableDisableGrupoResponsables("divResponsables1", ""); //Se habilita TTL
            //}

            let flagEquipoAgil = retorno !== null ? retorno.FlagEquipoAgil : false;
            if (flagEquipoAgil)
                EnableDisableGrupoResponsables("divResponsables1", "divResponsables2");
            else {
                EnableDisableGrupoResponsables("divResponsables2", "divResponsables1");
            }

            //Mostrar Gestor User IT
            let newHtml = NOMBRE_CAMPO_USUARIO_AUTORIZADOR.replace("Usuario Autorizador / Product Owner", "Gestor User IT / Usuario Autorizador / Product Owner");
            $("#divTitleUsuarioAutorizador").html(newHtml);
            //EnableDisableGrupoResponsables("divResponsables7", "");
        }
    } else {
        EnableDisableGrupoResponsables("", "divResponsables1");
        EnableDisableGrupoResponsables("", "divResponsables2");
        //EnableDisableGrupoResponsables("", "divResponsables7");
    }
}

function EnableDisableGrupoResponsables(showClass = "", hideClass = "") {
    if ($.trim(showClass) !== "") $(`.${showClass}`).show();
    if ($.trim(hideClass) !== "") $(`.${hideClass}`).hide();

    //Activar
    if ($.trim(showClass) !== "") {
        let showItems = DATA_RESPONSABLES.filter(x => x.Class === showClass);
        $.each(showItems, function (i, item) {
            $(`#${item.CbAplica}`).prop("checked", true);
            $(`#${item.CbAplica}`).trigger("change");

            //Input
            $(`#${item.Input}`).val("");
        });
    }

    //Desactivar
    if ($.trim(hideClass) !== "") {
        let hideItems = DATA_RESPONSABLES.filter(x => x.Class === hideClass);
        $.each(hideItems, function (i, item) {
            $(`#${item.CbAplica}`).prop("checked", false);
            $(`#${item.CbAplica}`).trigger("change");

            //Input NO APLICA
            $(`#${item.Input}`).val(NO_APLICA);
        });
    }
}

function DdlUbicacion_Change() {
    let $ddlInfra = $("#ddlInfraestructura");
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        switch (ddlVal) {
            case UBICACION_COMBO[0]:
                SetItems(INFRAESTRUCTURA_COMBO.filter(x => INF_ESCENARIO1.includes(x.toUpperCase())), $ddlInfra, TEXTO_SELECCIONE);
                break;
            case UBICACION_COMBO[1]:
                SetItems(INFRAESTRUCTURA_COMBO.filter(x => INF_ESCENARIO2.includes(x.toUpperCase())), $ddlInfra, TEXTO_SELECCIONE);
                break;
            case UBICACION_COMBO[2]:
                SetItems(INFRAESTRUCTURA_COMBO.filter(x => INF_ESCENARIO3.includes(x.toUpperCase())), $ddlInfra, TEXTO_SELECCIONE);
                break;
            case UBICACION_COMBO[3]:
                SetItems(INFRAESTRUCTURA_COMBO.filter(x => INF_EXTERNO.includes(x.toUpperCase())), $ddlInfra, TEXTO_SELECCIONE);
                break;
        }
    }
}

function DdlInfraestructura_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        if (TIPO_FLUJO_ACTUAL === TIPO_FLUJO_PORTAFOLIO.PAE) {
            if (ddlVal.toUpperCase() === "PC USUARIO") {
                $("#txtItemSO").autocomplete("destroy");
                InitAutocompletarEstandarBuilder($("#txtItemSO"), $("#hdSOId"), ".divSOContainer", $("#hdEstadoSO"), "/Tecnologia/GetTecnologiaEstandarByFiltro?filtro={0}&subdominioList={1}&soPcUsuarioList={2}", "36", IDS_SO_PC_USUARIO);
            } else {
                $("#txtItemSO").autocomplete("destroy");
                InitAutocompletarEstandarBuilder($("#txtItemSO"), $("#hdSOId"), ".divSOContainer", $("#hdEstadoSO"), "/Tecnologia/GetTecnologiaEstandarByFiltro?filtro={0}&subdominioList={1}&soPcUsuarioList={2}", "36");
            }
        }
    }
}

function DdlAmbiente_Change() {
    let arrVal = $(this).val() || [];
    if (arrVal && arrVal.length > 0) {
        var arrSelectedUC = arrVal.map(x => x.toUpperCase());

        var selectedItems = DATA_AMBIENTES.filter(x => arrSelectedUC.includes(x.Nombre.toUpperCase())).map(x => x.IdHtml) || [];
        if (selectedItems.length > 0) {
            selectedItems.forEach((idHtml) => {
                $(`#${idHtml}`).val("Si");
            });
        }

        var noSelectedItems = DATA_AMBIENTES.filter(x => !arrSelectedUC.includes(x.Nombre.toUpperCase())).map(x => x.IdHtml) || [];
        if (noSelectedItems.length > 0) {
            noSelectedItems.forEach((idHtml) => {
                $(`#${idHtml}`).val("-1");
            });
        }
    } else {
        DATA_AMBIENTES.map(x => x.IdHtml).forEach((idHtml) => {
            $(`#${idHtml}`).val("-1");
        });
    }
}

function CalcularNivelCriticidad(flagValue) {
    let nivelCriticidad = 1;
    let valor = flagValue;
    if (valor !== null) {
        let spClasificacion = $("#spClasificacion").text();
        if (spClasificacion === CLASIFICACION_DESCRIPCION.Restringido && valor === "SI") {
            nivelCriticidad = 1;
        } else if (spClasificacion === CLASIFICACION_DESCRIPCION.Restringido && valor === "NO") {
            nivelCriticidad = 1;
        } else if (spClasificacion === CLASIFICACION_DESCRIPCION.Restringido && valor === "") {
            nivelCriticidad = 1;
        } else if (spClasificacion === CLASIFICACION_DESCRIPCION.UsoInterno && valor === "SI") {
            nivelCriticidad = 1;
        } else if (spClasificacion === CLASIFICACION_DESCRIPCION.UsoInterno && valor === "") {
            nivelCriticidad = 3;
        } else if (spClasificacion === CLASIFICACION_DESCRIPCION.UsoInterno && valor === "NO") {
            nivelCriticidad = 3;
        } else if (spClasificacion === CLASIFICACION_DESCRIPCION.Publico && valor === "NO") {
            nivelCriticidad = 3;
        } else if (spClasificacion === CLASIFICACION_DESCRIPCION.Publico && valor === "SI") {
            nivelCriticidad = 3;
        } else {
            nivelCriticidad = 3;
        }

        $("#spNivelCriticidad").html(nivelCriticidad);
        $("#spCriticidadFinal").html(nivelCriticidad === 3 ? "BAJA" : "MEDIA");
        $("#ddlCriticidad").val(nivelCriticidad === 3 ? "4" : "3");

    } else {
        $("#spNivelCriticidad").html("N/A");
        $("#spCriticidadFinal").html("N/A");
        $("#ddlCriticidad").val("-1");
    }
}

function DdlTipoActivoInformacion_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        GetDataSolicitudByTipo(TIPO_SOLICITUD_ID);

        let retorno = GetDataByTextDDL(ddlVal, "/Aplicacion/TAI/GetActivosByNombre");
        let tipo_flujo = retorno !== null ? retorno.FlujoRegistro : TIPO_FLUJO_PORTAFOLIO.FNA;
        TIPO_FLUJO_ACTUAL = tipo_flujo;
        GetNewFieldsByFiltro(tipo_flujo, $.trim($("#txtCodigoApt").val()));
        $("#ddlGestionadoPor").val("-1");
        $("#ddlGestionadoPor").trigger("change");

        //Persona solicitud
        if ($("#hdAplicacionId").val() === "") {
            $("#txtPersonaSolicitud").val(userCurrent.Nombres);
        }

        if (tipo_flujo === TIPO_FLUJO_PORTAFOLIO.FNA) { //FNA
            $(".section-pae").hide();
            $("#titleFlow").html("FNA");

            //Configuracion de campos
            //CodigoAPT
            let $txtCodigoAPT = $("#txtCodigoApt");
            if ($txtCodigoAPT.prop("disabled")) {
                $txtCodigoAPT.prop("disabled", false);
                $txtCodigoAPT.val("");
            }

            //Cuestionario 
            if (VISTA_ID === VISTA_GESTION_APP.APROBADORES) {
                $(".tabCuestionario").addClass("bloq-element");
                $("#tab6").addClass("bloq-element");
            } else {
                $(".tabCuestionario").addClass("bloq-element");
            }

            //Fecha de registro
            $("#dpFechaSolicitud").val(GetCurrentDate());
            $("#dpFechaSolicitud").prop("disabled", true);

            //Ubicacion
            SetItems(UBICACION_COMBO.filter(x => x.toUpperCase() === "EXTERNO" || x.toUpperCase() === "ESCENARIO 1"), $("#ddlUbicacion"), TEXTO_SELECCIONE);

            //Jefe de Equipo -> visible
            EnableDisableGrupoResponsables("divResponsables3", "");

            //Contingencia
            $("#ddlContingencia").val("-1");
            $("#ddlContingencia").prop("disabled", false);

            $("#ddlAmbiente").multiselect('enable');

            SetItems(OOR_COMBO.filter(x => x.toUpperCase() !== NO_APLICA), $("#ddlOOR"), TEXTO_SELECCIONE);
            $("#ddlOOR").prop("disabled", false);

            SetItems(OOR_COMBO.filter(x => x.toUpperCase() !== NO_APLICA), $("#ddlRatificaOOR"), TEXTO_SELECCIONE);
            $("#ddlRatificaOOR").prop("disabled", false);

            //Entidad responsable
            $("#ddlEntidadResponsable").prop("disabled", false);
            $("#ddlEntidadResponsable").val("-1");

            $("#txtInterfazApp").val(NO_APLICA);

            $("#ddlInstaDesarrollo").val("-1");
            $("#ddlInstaCertificacion").val("-1");
            $("#ddlInstaProduccion").val("-1");

        } else { //PAE
            $(".section-pae").show();
            $(".no-section-pae").hide();
            $("#titleFlow").html("PAE");

            //Configuracion de campos
            //CodigoAPT
            if ($("#hdAplicacionId").val() === "") {
                let nextCodigoAPT = ObtenerUltimoCodigoAptByParametro();
                $("#txtCodigoApt").val(nextCodigoAPT);
                $("#txtCodigoApt").prop("disabled", true);

                EditarCuestionarioByCodigoAPT($.trim($("#txtCodigoApt").val()));
            } else {
                $("#txtCodigoApt").prop("disabled", true);
                EditarCuestionarioByCodigoAPT($.trim($("#txtCodigoApt").val()));
            }

            //Cuestionario
            if (VISTA_ID === VISTA_GESTION_APP.APROBADORES) {
                $("#tab6").addClass("bloq-element");
            } else {
                $(".tabCuestionario").removeClass("bloq-element");
            }

            //Fecha de registro
            $("#dpFechaSolicitud").prop("disabled", true);

            ////Ubicacion
            let $ddlUbicacion = $("#ddlUbicacion");
            SetItems(UBICACION_COMBO.filter(x => x.toUpperCase() === "EXTERNO" || x.toUpperCase() === "ESCENARIO 2" || x.toUpperCase() === "ESCENARIO 3"), $ddlUbicacion, TEXTO_SELECCIONE);

            //Jefe de Equipo -> no visible
            EnableDisableGrupoResponsables("", "divResponsables3");
            
            //Contingencia
            $("#ddlContingencia").val(NO_APLICA);
            $("#ddlContingencia").prop("disabled", true);

            $("#ddlAmbiente").multiselect('disable');
            
            SetItems(OOR_COMBO, $("#ddlOOR"), TEXTO_SELECCIONE);
            $("#ddlOOR").val(NO_APLICA);
            $("#ddlOOR").prop("disabled", true);
            
            SetItems(OOR_COMBO, $("#ddlRatificaOOR"), TEXTO_SELECCIONE);
            $("#ddlRatificaOOR").val(NO_APLICA);
            $("#ddlRatificaOOR").prop("disabled", true);

            //Entidad responsable
            $("#ddlEntidadResponsable").val("BCP");
            $("#ddlEntidadResponsable").prop("disabled", true);

            $("#txtInterfazApp").val("");

            $("#ddlInstaDesarrollo").val(NO_APLICA);
            $("#ddlInstaCertificacion").val(NO_APLICA);
            $("#ddlInstaProduccion").val(NO_APLICA);
        }
        $(".section-fna").show();

        //Configuracion de campos
        let $ddlME = $("#ddlModeloEntrega");
        let $ddlGTR = $("#ddlGTR");
        let $ddlCT = $("#ddlClasificacionTecnica");
        if (ddlVal && ddlVal.includes("APPIT")) { //APPIT

            //Modelo Entrega
            $ddlME.prop("disabled", false);
            SetItems(MODELO_ENTREGA_COMBO.filter(x => x !== NO_APLICA), $ddlME, TEXTO_SELECCIONE);

            //Codigo interfaz
            $("#txtCodigoInterfaz").prop("disabled", false);
            $("#btnShowModalCodigoInterfaz").prop("disabled", false);

            //Grupo ticket remedy
            $ddlGTR.prop("disabled", false);
            $ddlGTR.val("");

            //Clasificacion tecnica
            $ddlCT.prop("disabled", false);
            $ddlCT.val("-1");

            //Subclasificacion tecnica
            $("#txtSubclasificacionTecnica").prop("disabled", false);

        } else { //USER IT
            SetItems(MODELO_ENTREGA_COMBO, $ddlME, TEXTO_SELECCIONE);
            $ddlME.val(NO_APLICA);
            $ddlME.prop("disabled", true);

            //Codigo interfaz
            $("#txtCodigoInterfaz").prop("disabled", true);
            $("#btnShowModalCodigoInterfaz").prop("disabled", true);

            //Grupo ticket remedy
            $ddlGTR.val(NO_APLICA);
            $ddlGTR.prop("disabled", true);

            //Clasificacion tecnica
            $ddlCT.val(USER_IT);
            $ddlCT.prop("disabled", true);

            //Subclasificacion tecnica
            $("#txtSubclasificacionTecnica").prop("disabled", true);
            $("#txtSubclasificacionTecnica").val("");
        }

    } else {
        $(".section-fna").hide();
    }
}

function FlagAplica_Change() {
    var flagCb = $(this).prop("checked");
    if (flagCb)
        $("#divRL").show();
    else
        $("#divRL").hide();
}

function FlagAplicaCheckList_Change() {
    var flagCb = $(this).prop("checked");
    if (flagCb)
        $(".divConformidad").hide();
    else
        $(".divConformidad").show();
}

function FlagAplicaMatriz_Change() {
    var flagCb = $(this).prop("checked");
    if (flagCb)
        $(".divConformidadMatriz").hide();
    else
        $(".divConformidadMatriz").show();
}

function FlagAplicaMatricula_Change($cb, $div, $lbl, $input) {
    var flagCb = $cb.prop("checked");
    if (flagCb) {
        $div.removeClass("bloq-element");
        $input.val("");
        $lbl.html("");
    }
    else {
        LimpiarValidateErrores($("#formAddOrEditApp"));
        $lbl.html("");
        $input.val(NO_APLICA);
        $div.addClass("bloq-element");
    }
}

function setVistaByEstado(EstadoSolicitudId) {
    switch (EstadoSolicitudId) {
        case ESTADO_SOLICITUD_APP.REGISTRADO: //Solo puede editar
            $("#btnGuardarApp").hide();
            break;
        case ESTADO_SOLICITUD_APP.PROCESOREVISION: //Solo puede consultar
            if (VISTA_ID === VISTA_GESTION_APP.REGISTRO) {
                $("#btnRegistrarApp, #btnConfirmarApp, #btnGuardarApp").hide();
                $("#ddlTipoActivoInformacion").prop("disabled", true);
                $("#tab1, #tab2, #tab3, #tab6").addClass("bloq-element");
            } else if (VISTA_ID === VISTA_GESTION_APP.MODIFICAR) {
                $("#btnRegistrarSolMod, #btnConfirmarSolMod, #btnGuardarApp").hide();
                $("#ddlTipoActivoInformacion").prop("disabled", true);
                $("#tab1, #tab2, #tab3, #tab6").addClass("bloq-element");
            } else {
                $("#ddlTipoActivoInformacion").prop("disabled", true);
                $("#btnRegistrarApp").hide();
                $("#btnConfirmarApp").hide();
                $("#btnGuardarApp").hide();
            }

            break;
        case ESTADO_SOLICITUD_APP.APROBADO:
            $("#btnRegistrarApp, #btnConfirmarApp").hide();
            
            break;
        case ESTADO_SOLICITUD_APP.OBSERVADO:
            if (VISTA_ID === VISTA_GESTION_APP.REGISTRO) {
                $("#btnRegistrarApp, #btnConfirmarApp, #btnGuardarApp").hide();
                $("#btnRegresarSol, #btnResponderApp").show();
            } else if (VISTA_ID === VISTA_GESTION_APP.MODIFICAR) {
                $("#btnRegistrarSolMod, #btnConfirmarSolMod, #btnGuardarApp").hide();
                $("#btnRegresarSol, #btnResponderApp").show();
            }
            
            break;
        case 7:
            $("#btnRegistrarApp").hide();
            $("#btnConfirmarApp").hide();
            break;
        default: //Registro de nuevas aplicaciones
            $("#btnGuardarApp").hide();
            $("#btnCerrarApp").hide();
            break;
    }
}

function initFecha() {
    $("#divFechaSolicitud, #divFechaElaboracion, #divFechaCreacion").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
}

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItems(dataObject.Unidad, $("#ddlArea"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Gerencia, $("#ddlGerenciaCentral"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Division, $("#ddlDivision"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Area, $("#ddlArea"), TEXTO_SELECCIONE);
                    //debugger;
                    TAI_DATA = dataObject.TipoActivoInformacionAll;
                    let arrActivoTAI = dataObject.TipoActivoInformacionAll.filter(y => y.FlagActivo).map(x => x.Descripcion) || [];
                    SetItems(arrActivoTAI, $("#ddlTipoActivoInformacion"), TEXTO_SELECCIONE);

                    SetItems(dataObject.MotivoCreacion, $("#ddlMotivoCreacion"), TEXTO_SELECCIONE);
                    MODELO_ENTREGA_COMBO = dataObject.ModeloEntrega;
                    SetItems(dataObject.ModeloEntrega, $("#ddlModeloEntrega"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Estado, $("#ddlEstado"), TEXTO_SELECCIONE);
                    //ToDo
                    ESTADO_APLICACION_COMBO = dataObject.Estado.filter(x => x !== null);
                    //SetItems(ESTADO_APLICACION_COMBO.filter(x => x !== "Eliminada" && x !== "No Vigente"), $("#ddlEstado"), TEXTO_SELECCIONE);
                    SetItems(ESTADO_APLICACION_COMBO, $("#ddlEstado"), TEXTO_SELECCIONE);

                    SetItems(dataObject.AreaBIAN, $("#ddlAreaBIAN"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.DominioBIAN, $("#ddlDominioBIAN"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.PlataformaBCP, $("#ddlPlataformaBCP"), TEXTO_SELECCIONE);
                    SetItems(dataObject.JefaturaEquipoATI, $("#ddlJefaturaATI"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EntidadResponsable, $("#ddlEntidadResponsable"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.EntidadResponsable, $("#ddlEntidadUso"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItems(dataObject.GestionadoPor, $("#ddlGestionadoPor"), TEXTO_SELECCIONE);

                    OOR_COMBO = dataObject.OOR;
                    SetItems(dataObject.OOR, $("#ddlOOR"), TEXTO_SELECCIONE);
                    SetItems(dataObject.OOR, $("#ddlRatificaOOR"), TEXTO_SELECCIONE);
                    UBICACION_COMBO = dataObject.Ubicacion;
                    SetItems(dataObject.Ubicacion, $("#ddlUbicacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoDesarrollo, $("#ddlTipoDesarrollo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.MetodoAutenticacion, $("#ddlAutenticacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.MetodoAutorizacion, $("#ddlAutorizacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Contingencia, $("#ddlContingencia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Criticidad, $("#ddlCriticidad"), TEXTO_SELECCIONE);

                    INFRAESTRUCTURA_COMBO = dataObject.InfraestructuraAplicacion;
                    //SetItems(dataObject.InfraestructuraAplicacion, $("#ddlInfraestructura"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.CategoriaTecnologica, $("#ddlCategoriaTec"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.CategoriaTecnologica, $("#ddlCategoriaTec"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.AmbienteInstalacion, $("#ddlAmbiente"), TEXTO_SELECCIONE, TEXTO_TODOS, true);

                    //nuevos combos
                    SetItems(dataObject.Generico, $("#ddlCompWindows"), TEXTO_SELECCIONE);
                    SetItems(dataObject.CompatibilidadNavegador, $("#ddlCompNavegador"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Generico, $("#ddlCompVirtual"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Generico, $("#ddlInstaDesarrollo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Generico, $("#ddlInstaCertificacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Generico, $("#ddlInstaProduccion"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.GrupoTicketRemedy, $("#ddlGTR"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EstadoCriticidad, $("#ddlConfidencialidad"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EstadoCriticidad, $("#ddlIntegridad"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EstadoCriticidad, $("#ddlDisponibilidad"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EstadoCriticidad, $("#ddlPrivacidad"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ClasificacionCriticidad, $("#ddlClasificacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EstadoRoadmap, $("#ddlEstadoRoadmap"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ClasificacionTecnica, $("#ddlClasificacionTecnica"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ProcesoClave, $("#ddlProcesoClave"), TEXTO_SELECCIONE);

                    //Combos Tab Modulo
                    //SetItems(dataObject.TipoDesarrollo, $("#ddlTipoDesarrolloModulo"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.InfraestructuraAplicacion, $("#ddlInfraestructuraModulo"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.MetodoAutenticacion, $("#ddlAutenticacionModulo"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.MetodoAutorizacion, $("#ddlAutorizacionModulo"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.CategoriaTecnologica, $("#ddlCategoriaModulo"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Generico, $("#ddlInstaDesarrolloModulo"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Generico, $("#ddlInstaCertificacionModulo"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Generico, $("#ddlInstaProduccionModulo"), TEXTO_SELECCIONE);

                    //SetItems(dataObject.Criticidad, $("#ddlCriticidadModulo"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Estado, $("#ddlEstadoModulo"), TEXTO_SELECCIONE);

                    //Cargar tooltips
                    let lDataTooltip = dataObject.DataTooltip;
                    cargarTooltips(lDataTooltip);

                    //Cargar List Box nuevos
                    let lDataListBox = dataObject.DataListBox;
                    DATA_LISTBOX_NUEVO = lDataListBox;
                    cargarListBoxNuevos(lDataListBox);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function cargarListBoxNuevos(ldata, lvalores = []) {
    if (ldata !== null && ldata.length > 0) {
        $.each(ldata, function (i, item) {
            let dataCombo = item.DataListBox || [];
            SetItems(dataCombo, $(`#${item.CodigoHtml}`), TEXTO_SELECCIONE);
            if (lvalores.length > 0) {
                let dataInput = lvalores.find(x => x.Codigo === item.CodigoHtml && x.FlagMostrarCampo) || null;
                if (dataInput !== null) {
                    $(`#${item.CodigoHtml}`).val(dataInput.ValorCampo || "-1");
                }
            }
        });
    }
}

function limpiarFormRegister() {
    $("#ddlDivision, #ddlArea, #ddlGerenciaCentral, #ddlTipoActivoInformacion, #ddlMotivoCreacion, #ddlCategoriaTec, #ddlModeloEntrega, #ddlEstado").val("-1");
    $("#ddlPlataformaBCP, #ddlAreaBIAN, #ddlDominioBIAN, #ddlJefaturaATI, #ddlArquitectoTI, #ddlEntidadResponsable, #ddlEntidadUso, #ddlGestionadoPor").val("-1");
    $("#ddlOOR, #ddlRatificaOOR, #ddlUbicacion, #ddlTipoDesarrollo, #ddlAutenticacion, #ddlAutorizacion, #ddlContingencia").val("-1");
    $("#ddlInfraestructura, #ddlAmbiente, #ddlCriticidad").val("-1");

    $("#txtLiderUsuario, #txtUsuarioAutorizador, #txtCodigoApt, #txtNombreApp, #txtDesApp, #txtCodigoInterfaz").val("");
    $("#txtTTL, #txtExpertoApp, #txtBroker, #txtJefeEquipoPO, #txtNombreSquad, #txtUnidadUsuaria").val("");
    $("#txtProveedor, #txtRutaRepo, #txtGSD, #txtJefeEquipoPO, #txtAppReemplazo, #txtTribu").val("");

    $("#hdAplicacionId, #hdAplicacionDetalleId").val("");

    $("#ddlFlagAplica").prop("checked", false);
    $("#ddlFlagAplica").bootstrapToggle("off");
    $("#ddlFlagAplicaCheckList").prop("checked", false);
    $("#ddlFlagAplicaCheckList").bootstrapToggle("off");

    $("#ddlFlagAplicaMatriz").prop("checked", false);
    $("#ddlFlagAplicaMatriz").bootstrapToggle("off");

    //$("#ddlFlagAplica1").prop("checked", false);
    //$("#ddlFlagAplica2").prop("checked", false);
    $("#ddlFlagAplica3").prop("checked", false);
    //$("#ddlFlagAplica4").prop("checked", false);
    $("#ddlFlagAplica5").prop("checked", false);
    //$("#ddlFlagAplica6").prop("checked", false);
    //$("#ddlFlagAplica7").prop("checked", false);

    //$("#ddlFlagAplica1").bootstrapToggle("off");
    //$("#ddlFlagAplica2").bootstrapToggle("off");
    $("#ddlFlagAplica3").bootstrapToggle("off");
    //$("#ddlFlagAplica4").bootstrapToggle("off");
    $("#ddlFlagAplica5").bootstrapToggle("off");
    //$("#ddlFlagAplica6").bootstrapToggle("off");
    //$("#ddlFlagAplica7").bootstrapToggle("off");

    $("#txtItemSO").val("");
    $("#txtItemHP").val("");
    $("#txtItemLP").val("");
    $("#txtItemBD").val("");
    $("#txtItemFramework").val("");
    $("#txtItemRET").val("");

    LimpiarValidateErrores($("#formAddOrEditApp"));

    $tblModuloAplicacion.bootstrapTable('destroy');
    $tblModuloAplicacion.bootstrapTable();
}

function getDDL($ddl) {
    return $ddl.val() !== "-1" ? $ddl.val() : null;
}

function getTB($txt) {
    return $.trim($txt.val()) !== "" ? String.Capitalize($.trim($txt.val())) : null;
}

function CrearObjAplicacion(EstadoSolicitudId) {
    var data = {};
    data.Id = ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val());
    data.TipoActivoInformacion = getDDL($("#ddlTipoActivoInformacion")); //$("#ddlTipoActivoInformacion").val(); //cvt.Aplicacion
    data.GerenciaCentral = getDDL($("#ddlGerenciaCentral")); // $("#ddlGerenciaCentral").val(); ////cvt.Aplicacion
    data.Division = getDDL($("#ddlDivision")); // $("#ddlDivision").val(); //cvt.Aplicacion
    data.Area = getDDL($("#ddlArea")); // $("#ddlArea").val(); //cvt.Aplicacion
    data.Unidad = $.trim($("#txtTribu").val()).toUpperCase(); //cvt.Aplicacion
    data.CodigoAPT = $.trim($("#txtCodigoApt").val()).toUpperCase(); //cvt.Aplicacion
    data.Nombre = getTB($("#txtNombreApp")); //$.trim($("#txtNombreApp").val()); //cvt.Aplicacion
    data.DescripcionAplicacion = getTB($("#txtDesApp")); //$.trim($("#txtDesApp").val()); //cvt.Aplicacion
    data.EstadoAplicacion = getDDL($("#ddlEstado")); //$("#ddlEstado").val(); //cvt.Aplicacion
    data.AreaBIAN = getDDL($("#ddlAreaBIAN")); //$("#ddlAreaBIAN").val();  //cvt.Aplicacion
    data.DominioBIAN = getDDL($("#ddlDominioBIAN")); //$("#ddlDominioBIAN").val(); //cvt.Aplicacion
    data.JefaturaATI = getDDL($("#ddlJefaturaATI")); //$("#ddlJefaturaATI").val(); //cvt.Aplicacion
    data.ArquitectoTI = getDDL($("#ddlArquitectoTI")); //$("#ddlArquitectoTI").val(); //cvt.Aplicacion
    data.NombreEquipo_Squad = getTB($("#txtNombreSquad")); //$.trim($("#txtNombreSquad").val()); //cvt.Aplicacion
    data.GestionadoPor = getDDL($("#ddlGestionadoPor")); //$("#ddlGestionadoPor").val(); //cvt.Aplicacion
    data.CriticidadId = $("#hdAplicacionId").val() === "" ? "1" : $("#ddlCriticidad").val(); //cvt.Aplicacion
    //data.CategoriaTecnologica = $("#ddlCategoriaTec").val(); //cvt.Aplicacion
    data.CategoriaTecnologica = $("#ddlCategoriaTec").val() !== null ? $("#ddlCategoriaTec").val().join("|") : ""; //app.AplicacionDetalle
    data.EntidadResponsable = getDDL($("#ddlEntidadResponsable")); //$("#ddlEntidadResponsable").val(); //cvt.Aplicacion
    data.ClasificacionTecnica = getDDL($("#ddlClasificacionTecnica")); //$("#ddlClasificacionTecnica").val(); //cvt.Aplicacion
    data.SubclasificacionTecnica = getTB($("#txtSubclasificacionTecnica")); //$.trim($("#txtSubclasificacionTecnica").val()) || ""; //cvt.Aplicacion

    //responsables
    data.Owner_LiderUsuario_ProductOwner = getTB($("#txtLiderUsuario")); //$.trim($("#txtLiderUsuario").val()); //cvt.Aplicacion
    data.Gestor_UsuarioAutorizador_ProductOwner = getTB($("#txtUsuarioAutorizador")); //$.trim($("#txtUsuarioAutorizador").val()); //cvt.Aplicacion
    data.Experto_Especialista = getTB($("#txtExpertoApp")); //$.trim($("#txtExpertoApp").val()); //cvt.Aplicacion
    data.JefeEquipo_ExpertoAplicacionUserIT_ProductOwner = getTB($("#txtJefeEquipoPO")); //$.trim($("#txtJefeEquipoPO").val()); //cvt.Aplicacion
    data.BrokerSistemas = getTB($("#txtBroker")); // $.trim($("#txtBroker").val()); //cvt.Aplicacion
    //data.GestorUserIT = $.trim($("#txtGestorUserIT").val()); //cvt.Aplicacion
    data.TribeTechnicalLead = getTB($("#txtTTL")); //$.trim($("#txtTTL").val()); //cvt.Aplicacion

    //matriculas
    data.MatriculaOwner = $("#lbl1").text() || "";
    data.MatriculaGestor = $("#lbl2").text() || "";
    data.MatriculaTTL = $("#lbl3").text() || "";
    data.MatriculaExperto = $("#lbl4").text() || "";
    data.MatriculaBroker = $("#lbl5").text() || "";
    data.MatriculaJDE = $("#lbl6").text() || "";

    data.HdOwner = $("#hdOwner").val();
    data.HdGestor = $("#hdGestor").val();
    data.HdTTL = $("#hdTTL").val();
    data.HdExperto = $("#hdExperto").val();
    data.HdBroker = $("#hdBroker").val();
    data.HdJDE = $("#hdJdE").val();

    data.AplicacionDetalle = CrearObjAplicacionDetalle(EstadoSolicitudId);
    data.ModuloAplicacion = [];//$tblModuloAplicacion.bootstrapTable('getData').filter(x => x.FlagRegistrado === false);
    data.NewInputs = GetDataNewInputs();
    data.TipoFlujoId = TIPO_FLUJO_ACTUAL;

    data.FlagActivo = true;
    data.CargaResponsables = CARGA_RESPONSABLES;
    data.FechaCreacionAplicacion = $.trim($("#dpFechaCreacion").val()) !== "" ? dateFromString($("#dpFechaCreacion").val()) : null;
    data.TipoSolicitudId = TIPO_SOLICITUD_ID;
    data.MotivoComentario = TIPO_SOLICITUD_ID === TIPO_SOLICITUD_APP.CREACION ? $.trim($("#txtComentarioSolicitud").val()) : $.trim($("#txtMotivoModificacion").val());

    return data;
}

function getDDLOOR($ddl) {
    let retornoVal = null;
    let ddlVal = $ddl.val() || null;
    if (ddlVal !== null && ddlVal !== "-1") {
        retornoVal = ddlVal.toUpperCase() === "SI";
    }

    return retornoVal;
}

function CrearObjAplicacionDetalle(EstadoSolicitudId) {
    var data = {};
    //data.Id = $("#hdAplicacionDetalleId").val();
    data.Id = ($("#hdAplicacionDetalleId").val() === "") ? 0 : parseInt($("#hdAplicacionDetalleId").val());
    data.MotivoCreacion = getDDL($("#ddlMotivoCreacion")); //$("#ddlMotivoCreacion").val(); //app.AplicacionDetalle
    data.FechaSolicitud = $("#dpFechaSolicitud").val(); //app.AplicacionDetalle
    data.EstadoSolicitudId = EstadoSolicitudId;
    data.PersonaSolicitud = $("#txtPersonaSolicitud").val(); //app.AplicacionDetalle
    data.ModeloEntrega = getDDL($("#ddlModeloEntrega")); //$("#ddlModeloEntrega").val(); //app.AplicacionDetalle
    data.PlataformaBCP = getDDL($("#ddlPlataformaBCP")); //$("#ddlPlataformaBCP").val(); //app.AplicacionDetalle
    data.EntidadUso = $("#ddlEntidadUso").val() !== null ? $("#ddlEntidadUso").val().join(",") : ""; //app.AplicacionDetalle
    data.UnidadUsuario = getTB($("#txtUnidadUsuaria"));
    data.Proveedor = getTB($("#txtProveedor")); //$.trim($("#txtProveedor").val()); //app.AplicacionDetalle
    data.Ubicacion = getDDL($("#ddlUbicacion")); //$("#ddlUbicacion").val(); //app.AplicacionDetalle
    data.Infraestructura = getDDL($("#ddlInfraestructura")); //$("#ddlInfraestructura").val(); //app.AplicacionDetalle  
    data.RutaRepositorio = getTB($("#txtRutaRepo")); //$.trim($("#txtRutaRepo").val()); //app.AplicacionDetalle
    data.Contingencia = getDDL($("#ddlContingencia")); //$("#ddlContingencia").val(); //app.AplicacionDetalle
    data.MetodoAutenticacion = getDDL($("#ddlAutenticacion")); //$("#ddlAutenticacion").val(); //app.AplicacionDetalle
    data.MetodoAutorizacion = getDDL($("#ddlAutorizacion")); //$("#ddlAutorizacion").val(); //app.AplicacionDetalle
    data.AmbienteInstalacion = $("#ddlAmbiente").val() !== null ? $("#ddlAmbiente").val().join(",") : ""; //app.AplicacionDetalle
    //data.GrupoServiceDesk = $("#txtGSD").val(); //app.AplicacionDetalle
    //data.FlagOOR = $("#ddlOOR").val() === "96" ? true : false; //app.AplicacionDetalle
    data.FlagOOR = getDDLOOR($("#ddlOOR"));
    //data.FlagRatificaOOR = $("#ddlRatificaOOR").val() === "96" ? true : false; //app.AplicacionDetalle
    data.FlagRatificaOOR = getDDLOOR($("#ddlRatificaOOR"));
    data.AplicacionReemplazo = $.trim($("#txtAppReemplazo").val()) !== "" ? getTB($("#txtAppReemplazo")) : NO_APLICA; //app.AplicacionDetalle
    data.TipoDesarrollo = $("#ddlTipoDesarrollo").val(); //app.AplicacionDetalle
    data.CodigoInterfaz = $.trim($("#txtCodigoInterfaz").val()) !== "" ? $.trim($("#txtCodigoInterfaz").val()).toUpperCase() : ""; //app.AplicacionDetalle

    //PAE
    data.InterfazApp = getTB($("#txtInterfazApp")); //$.trim($("#txtInterfazApp").val()); //app.AplicacionDetalle
    //data.NombreServidor = $("#txtNombreServidor").val(); //app.AplicacionDetalle
    data.CompatibilidadWindows = getDDL($("#ddlCompWindows")); //$("#ddlCompWindows").val(); //app.AplicacionDetalle
    data.CompatibilidadNavegador = getDDL($("#ddlCompNavegador")); //$("#ddlCompNavegador").val(); //app.AplicacionDetalle
    data.CompatibilidadHV = getDDL($("#ddlCompVirtual")); //$("#ddlCompVirtual").val(); //app.AplicacionDetalle
    data.ProcesoClave = getDDL($("#ddlProcesoClave")); //$("#ddlProcesoClave").val(); //app.AplicacionDetalle
    data.GrupoTicketRemedy = getTB($("#ddlGTR")); //$.trim($("#ddlGTR").val()); //$("#ddlGTR").val(); //app.AplicacionDetalle

    data.SWBase_SO = $.trim($("#txtSO").val()) !== "" ? $.trim($("#txtSO").val()) : NO_APLICA;
    data.SWBase_HP = $.trim($("#txtHP").val()) !== "" ? $.trim($("#txtHP").val()) : NO_APLICA;
    data.SWBase_LP = $.trim($("#txtLP").val()) !== "" ? $.trim($("#txtLP").val()) : NO_APLICA;
    data.SWBase_BD = $.trim($("#txtBD").val()) !== "" ? $.trim($("#txtBD").val()) : NO_APLICA;
    data.SWBase_Framework = $.trim($("#txtFramework").val()) !== "" ? $.trim($("#txtFramework").val()) : NO_APLICA;
    data.RET = $.trim($("#txtRET").val());

    data.FlagFileCheckList = $("#ddlFlagAplicaCheckList").prop("checked");
    data.FlagFileMatriz = $("#ddlFlagAplicaMatriz").prop("checked");

    data.NCET = $.trim($("#txtNCET").val()); //app.AplicacionDetalle
    data.NCLS = $.trim($("#txtNCLS").val()); //app.AplicacionDetalle
    data.NCG = $.trim($("#txtNCG").val()); //app.AplicacionDetalle

    //Responsables cuestionario
    //data.GestorAplicacionCTR = getTB($("#txtGestorApps")); //$.trim($("#txtGestorApps").val());
    //data.ConsultorCTR = getTB($("#txtConsultor")); //$.trim($("#txtConsultor").val());
    data.GestorAplicacionCTR = "";
    data.ConsultorCTR = "";

    data.InstaladaDesarrollo = getDDL($("#ddlInstaDesarrollo")); //app.AplicacionDetalle
    data.InstaladaCertificacion = getDDL($("#ddlInstaCertificacion")); //app.AplicacionDetalle
    data.InstaladaProduccion = getDDL($("#ddlInstaProduccion")); //app.AplicacionDetalle

    let flag = $("#ddlFlagAplica").prop("checked");
    data.ResumenSeguridadInformacion = flag ? getTB($("#txtResumenLin")) : ""; //app.AplicacionDetalle

    if (VISTA_ID === VISTA_GESTION_APP.CATALOGO) {

        data.Confidencialidad = getDDL($("#ddlConfidencialidad")); //app.AplicacionDetalle
        data.Integridad = getDDL($("#ddlIntegridad")); //app.AplicacionDetalle
        data.Disponibilidad = getDDL($("#ddlDisponibilidad")); //app.AplicacionDetalle
        data.Privacidad = getDDL($("#ddlPrivacidad")); //app.AplicacionDetalle
        data.Clasificacion = getDDL($("#ddlClasificacion")); //app.AplicacionDetalle

        data.CriticidadAplicacionBIA = getTB($("#txtCritcidadAplicacionBIA")); //$.trim($("#txtCritcidadAplicacionBIA").val());
        data.ProductoMasRepresentativo = getTB($("#txtProductoServicioApp")); //$.trim($("#txtProductoServicioApp").val());
        data.MenorRTO = getTB($("#txtMenorRTO")); //$.trim($("#txtMenorRTO").val());
        data.MayorGradoInterrupcion = getTB($("#txtMayorGradoInterrupcion")); //$.trim($("#txtMayorGradoInterrupcion").val());

        //TAB4
        data.RoadmapPlanificado = getTB($("#txtRoadmapPlanificado")); //$.trim($("#txtRoadmapPlanificado").val()); //app.AplicacionDetalle
        data.DetalleEstrategia = getTB($("#txtDetalleEstrategia")); //$.trim($("#txtDetalleEstrategia").val()); //app.AplicacionDetalle
        data.EstadoRoadmap = getDDL($("#ddlEstadoRoadmap")); //app.AplicacionDetalle
        data.EtapaAtencion = getTB($("#txtEtapaAtencion")); //$.trim($("#txtEtapaAtencion").val()); //app.AplicacionDetalle
        data.RoadmapEjecutado = getTB($("#txtRoadmapEjecutado")); //$.trim($("#txtRoadmapEjecutado").val()); //app.AplicacionDetalle
        data.FechaInicioRoadmap = $.trim($("#txtFechaInicioRM").val()); //app.AplicacionDetalle
        data.FechaFinRoadmap = $.trim($("#txtFechaFinRM").val()); //app.AplicacionDetalle
        data.CodigoAppReemplazo = getTB($("#txtCodigoAppReemplazo")); //$.trim($("#txtCodigoAppReemplazo").val()); //app.AplicacionDetalle
    }

    data.FlagActivo = true;

    return data;
}

function sendDataFormAPI($form, $btn, title, statusApp, url_redirect, funStr, isChangeState = false, idAction = 0) {
    if ($form.valid()) {

        var estadoTransaccion = true;
        if ($btn !== null) {
            $btn.button("loading");
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
        let data = CrearObjAplicacion(statusApp);

        $.ajax({
            url: URL_API_VISTA + "/AddOrEdit",
            type: "POST",
			beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        debugger;
                        let dataResult = dataObject;
                        estadoTransaccion = dataResult.EstadoTransaccion;
                        if (dataResult.SolicitudId !== 0) $("#hIdSolicitud").val(dataResult.SolicitudId);

                        if (dataResult.EstadoTransaccion) {
                            if (isChangeState) {
                                switch (idAction) {
                                    case ACCIONES_PORTAFOLIO.REGISTRAR:
                                        sendDataEstadoAPI(null,
                                            "Se registró la solicitud correctamente",
                                            ESTADO_SOLICITUD_APP.REGISTRADO,
                                            TIPO_SOLICITUD_APP.CREACION,
                                            "",
                                            "");

                                        break;
                                    case ACCIONES_PORTAFOLIO.CONFIRMAR:
                                        sendDataEstadoAPI(null,
                                            "Se confirmó la solicitud correctamente",
                                            ESTADO_SOLICITUD_APP.PROCESOREVISION,
                                            TIPO_SOLICITUD_APP.CREACION,
                                            "",
                                            "");

                                        break;
                                    case ACCIONES_PORTAFOLIO.RESPONDER:
                                        insertarSolicitudComentario();
                                        sendDataEstadoAPI(null,
                                            "Se confirmó la solicitud correctamente",
                                            ESTADO_SOLICITUD_APP.PROCESOREVISION,
                                            TIPO_SOLICITUD_APP.CREACION,
                                            "",
                                            "");
                                        break;
                                }
                            }

                            if (TIPO_FLUJO_ACTUAL === TIPO_FLUJO_PORTAFOLIO.PAE) {
                                UploadAllFiles(dataResult.AplicacionId);
                                RegistrarCuestionarioAplicacion();
                                RegistrarServidorAplicacion(dataResult.AplicacionId);
                            }

                            if ($.trim(title) !== "") toastr.success(title, TITULO_MENSAJE);
                            if ($.trim(funStr) !== "") eval(funStr);

                        } else {
                            if (TIPO_FLUJO_ACTUAL === TIPO_FLUJO_PORTAFOLIO.FNA)
                                MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación ya fue registrado, por favor ingresar un nuevo código");
                            else {
                                MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación ya fue registrado, se acaba de asignar un nuevo código de aplicación a su solicitud para que lo puedas volver a registrar y/o enviar.");
                                let nextCodigoAPT = ObtenerUltimoCodigoAptByParametro();
                                $("#txtCodigoApt").val(nextCodigoAPT);
                                $("#txtCodigoApt").prop("disabled", true);
                            }
                        }
                    }
                }
            },
            complete: function (data) {
                if ($btn !== null) {
                    $btn.button("reset");
                    waitingDialog.hide();
                }
                
                if (ControlarCompleteAjax(data)) {
                    if (estadoTransaccion) {
                        if ($.trim(url_redirect) !== "") window.location.href = url_redirect;
                    } 
                } else {
                    bootbox.alert("Sucedió un error con el servicio", function () { });
                }       
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function sendDataFormSolicitudAPI($form, $btn, title, statusApp, url_redirect, funStr, isChangeState = false, idAction = 0) {
    if ($form.valid()) {

        var estadoTransaccion = true;
        if ($btn !== null) {
            $btn.button("loading");
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
        let data = CrearObjAplicacion(statusApp);

        $.ajax({
            url: URL_API_VISTA + "/AddOrEdit",
            type: "POST",
			beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        let dataResult = dataObject;
                        estadoTransaccion = dataResult.EstadoTransaccion;
                        if (dataResult.SolicitudId !== 0)
                            $("#hIdSolicitud").val(dataResult.SolicitudId);

                        if (dataResult.EstadoTransaccion) {
                            if (isChangeState) {
                                switch (idAction) {
                                    case ACCIONES_PORTAFOLIO.REGISTRAR:
                                        sendDataEstadoAPI(null,
                                            "Se registró la solicitud correctamente",
                                            ESTADO_SOLICITUD_APP.REGISTRADO,
                                            TIPO_SOLICITUD_APP.MODIFICACION,
                                            "",
                                            "");

                                        break;
                                    case ACCIONES_PORTAFOLIO.CONFIRMAR:
                                        sendDataEstadoAPI(null,
                                            "Se confirmó la solicitud correctamente",
                                            ESTADO_SOLICITUD_APP.PROCESOREVISION,
                                            TIPO_SOLICITUD_APP.MODIFICACION,
                                            "",
                                            "");

                                        break;
                                    case ACCIONES_PORTAFOLIO.RESPONDER:
                                        insertarSolicitudComentario();
                                        sendDataEstadoAPI(null,
                                            "Se confirmó la solicitud correctamente",
                                            ESTADO_SOLICITUD_APP.PROCESOREVISION,
                                            TIPO_SOLICITUD_APP.MODIFICACION,
                                            "",
                                            "");
                                        break;
                                }
                            }

                            if (TIPO_FLUJO_ACTUAL === TIPO_FLUJO_PORTAFOLIO.PAE) {
                                UploadAllFiles(dataResult.AplicacionId);
                                RegistrarCuestionarioAplicacion();
                                RegistrarServidorAplicacion(dataResult.AplicacionId);
                            }

                            if ($.trim(title) !== "") toastr.success(title, TITULO_MENSAJE);
                            if ($.trim(funStr) !== "") eval(funStr);

                        } else {
                            if (TIPO_FLUJO_ACTUAL === TIPO_FLUJO_PORTAFOLIO.FNA)
                                MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación ya fue registrado, por favor ingresar un nuevo código");
                            else {
                                MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación ya fue registrado, se acaba de asignar un nuevo código de aplicación a su solicitud para que lo puedas volver a registrar y/o enviar.");
                                let nextCodigoAPT = ObtenerUltimoCodigoAptByParametro();
                                $("#txtCodigoApt").val(nextCodigoAPT);
                                $("#txtCodigoApt").prop("disabled", true);
                            }
                        }
                    }
                }
            },
            complete: function (data) {
                if ($btn !== null) {
                    $btn.button("reset");
                    waitingDialog.hide();
                }

                if (ControlarCompleteAjax(data)) {
                    if (estadoTransaccion) {
                        if ($.trim(url_redirect) !== "") window.location.href = url_redirect;
                    }
                } else {
                    bootbox.alert("Sucedió un error con el servicio", function () { });
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function guardarSolicitudModificacion() {
    CARGA_RESPONSABLES = false;

    $(".form-control").addClass("ignore"); //Sin validaciones
    $(".input-registro").removeClass("ignore"); //Codigo apt, nombre y estado

    if ($("#formAddOrEditApp").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: String.Format("¿Estás seguro(a) que deseas {0} esta solicitud?", "registrar"),
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                result = result || null;
                if (result !== null && result) {
                    sendDataFormSolicitudAPI($("#formAddOrEditApp"),
                        $("#btnRegistrarSolMod"),
                        "Registrado correctamente",
                        ESTADO_SOLICITUD_APP.REGISTRADO,
                        URL_BANDEJA_MODIFICACION_APP,
                        "",
                        true,
                        ACCIONES_PORTAFOLIO.REGISTRAR);
                }
            }
        });
    }
}

function confirmarSolicitudModificacion() {
    CARGA_RESPONSABLES = false;

    $(".form-control").addClass("ignore"); //Sin validaciones
    $(".input-registro").removeClass("ignore"); //Codigo apt, nombre y estado

    if ($("#formAddOrEditApp").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: String.Format("¿Estás seguro(a) que deseas {0} esta solicitud? Ten en cuenta que despues no podrás modificarla", "registrar y enviar"),
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                result = result || null;
                if (result !== null && result) {
                    sendDataFormSolicitudAPI($("#formAddOrEditApp"),
                        $("#btnConfirmarSolMod"),
                        "Registrado y enviado correctamente",
                        ESTADO_SOLICITUD_APP.PROCESOREVISION,
                        URL_BANDEJA_MODIFICACION_APP,
                        "",
                        true,
                        ACCIONES_PORTAFOLIO.CONFIRMAR);
                }
            }
        });
    }
}

function guardarAddOrEditApp() {
    //$(".form-control").removeClass("ignore");
    //$(".catalogo-app").addClass("ignore");
    CARGA_RESPONSABLES = true;

    $(".form-control").addClass("ignore"); //Sin validaciones
    $(".input-registro").removeClass("ignore");

    if ($("#formAddOrEditApp").valid()) {
        if ($.trim($("#txtCodigoApt").val()) !== "" && $.trim($("#txtNombreApp").val()) !== "") {
            bootbox.confirm({
                title: TITULO_MENSAJE,
                message: String.Format("¿Estás seguro(a) que deseas {0} esta solicitud?", "registrar"),
                buttons: SET_BUTTONS_BOOTBOX,
                callback: function (result) {
                    result = result || null;
                    if (result !== null && result) {
                        let codigoApt = $.trim($("#txtCodigoApt").val());
                        if (!ExisteCodigoAPT(codigoApt)) {
                            //sendDataFormAPI($("#formAddOrEditApp"),
                            //    $("#btnRegistrarApp"),
                            //    "Registrado correctamente",
                            //    ESTADO_SOLICITUD_APP.REGISTRADO,
                            //    URL_BANDEJA_CREACION_APP,
                            //    "");

                            sendDataFormAPI($("#formAddOrEditApp"),
                                $("#btnRegistrarApp"),
                                "Registrado correctamente",
                                ESTADO_SOLICITUD_APP.REGISTRADO,
                                URL_BANDEJA_CREACION_APP,
                                "",
                                true,
                                ACCIONES_PORTAFOLIO.REGISTRAR);
                        }
                        else {
                            if (TIPO_FLUJO_ACTUAL === TIPO_FLUJO_PORTAFOLIO.FNA)
                                MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación ya fue registrado, por favor ingresar un nuevo código");
                            else {
                                MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación ya fue registrado, se acaba de asignar un nuevo código de aplicación a su solicitud para que lo puedas volver a registrar y/o enviar.");
                                let nextCodigoAPT = ObtenerUltimoCodigoAptByParametro();
                                $("#txtCodigoApt").val(nextCodigoAPT);
                                $("#txtCodigoApt").prop("disabled", true);
                            }
                        }                            
                    }
                }
            });
        } else {
            MensajeGeneralAlert(TITULO_MENSAJE, "Para registrar una aplicación debes ingresar como mínimo el código APT y el nombre");
        }
    }
}

function confirmarAplicacion() {
    CARGA_RESPONSABLES = true;

    $(".form-control").removeClass("ignore");
    $(".catalogo-app").addClass("ignore");

    if ($("#formAddOrEditApp").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: String.Format("¿Estás seguro(a) que deseas {0} esta solicitud?", "registrar y enviar"),
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                result = result || null;
                if (result !== null && result) {                    
                    let codigoApt = $.trim($("#txtCodigoApt").val());
                    if (!ExisteCodigoAPT(codigoApt)) {
                        sendDataFormAPI($("#formAddOrEditApp"),
                            $("#btnConfirmarApp"),
                            "Se confirmó la solicitud correctamente",
                            ESTADO_SOLICITUD_APP.PROCESOREVISION,
                            URL_BANDEJA_CREACION_APP,
                            "",
                            true,
                            ACCIONES_PORTAFOLIO.CONFIRMAR);
                    }
                    else {
                        if (TIPO_FLUJO_ACTUAL === TIPO_FLUJO_PORTAFOLIO.FNA)
                            MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación ya fue registrado, por favor ingresar un nuevo código");
                        else {
                            MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación ya fue registrado, se acaba de asignar un nuevo código de aplicación a su solicitud para que lo puedas volver a registrar y/o enviar.");
                            let nextCodigoAPT = ObtenerUltimoCodigoAptByParametro();
                            $("#txtCodigoApt").val(nextCodigoAPT);
                            $("#txtCodigoApt").prop("disabled", true);
                        }
                    }       
                }
            }
        });
    }
}

function guardarCambios() {
    CARGA_RESPONSABLES = false;
    $(".form-control").addClass("ignore"); //Sin validaciones
    sendDataFormAPI($("#formAddOrEditApp"),
        $("#btnGuardarApp"),
        "Se guardó correctamente",
        $("#hdEstadoSolicitudId").val(),
        URL_CATALOGO_APP + "?paginaActual=" + PAGINA_ACTUAL + "&paginaTamanio=" + PAGINA_TAMANIO,
        "");
}

//Fecha de registro: dpFechaSolicitud
//Fecha de creacion: dpFechaCreacion

function validarFormApp() {
    $.validator.addMethod("requiredCuestionario", function (value, element) {
        //let boolRetorno = parseFloat($("#txtInput1").val()) !== 0 && parseFloat($("#txtInput2").val()) !== 0 && parseFloat($("#txtInput3").val()) !== 0 && parseFloat($("#txtInput4").val()) !== 0;
        //let dataConsultor = $.trim($("#txtConsultor").val());
        //let boolRetorno = dataConsultor !== "";
        //return TIPO_FLUJO_ACTUAL === TIPO_FLUJO_PORTAFOLIO.PAE ? boolRetorno : true;
        return true;
    });

    $.validator.addMethod("requiredPAE", function (value, element) {
        return TIPO_FLUJO_ACTUAL === TIPO_FLUJO_PORTAFOLIO.PAE ? $.trim(value) !== "" : true;
    });

    $.validator.addMethod("requiredFechaCreacion", function (value, element) {
        let fechaRegistro = $.trim($("#dpFechaSolicitud").val());
        let fechaCreacion = $.trim(value);

        let dateFechaCreacion = dateFromString(fechaCreacion);
        let dateFechaRegistro = dateFromString(fechaRegistro);

        return TIPO_FLUJO_ACTUAL === TIPO_FLUJO_PORTAFOLIO.PAE ? dateFechaCreacion <= dateFechaRegistro : true;
    });

    $.validator.addMethod("requiredProveedor", function (value, element) {
        let retorno = true;
        let ddlValor = $("#ddlTipoDesarrollo").val();
        if (ddlValor !== "-1" && ddlValor !== TIPO_DESARROLLO_INHOUSE) {
            retorno = $.trim(value) !== "";
        }

        return retorno;
    });

    $.validator.addMethod("requiredRegistro", function (value, element) {
        let minRegistro = $tblModuloAplicacion.bootstrapTable('getData');
        return minRegistro.length > 0;
    });

    $.validator.addMethod("existeMatricula", function (value, element) {
        let estado = true;
        let matricula = $.trim(value);
        if (matricula !== "" && matricula !== NO_APLICA && matricula.length > 3) {
            estado = ExisteMatricula(matricula);
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("existeCodigoAPT", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteCodigoAPT(valor);
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("existeNombreAplicacion", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 3) {
            estado = !ExisteNombreAplicacion(valor);
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("existeCodigoInterfaz", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 1) {
            estado = !ExisteCodigoInterfaz(valor);
            return estado;
        }
        return estado;
    });

    $("#formAddOrEditApp").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlDivision: {
                requiredSelect: true
            },
            ddlArea: {
                requiredSelect: true
            },
            ddlGerenciaCentral: {
                requiredSelect: true
            },
            txtTribu: {
                requiredSinEspacios: true
            },
            //ddlTipoActivoInformacion: {
            //    requiredSelect: true
            //},
            ddlMotivoCreacion: {
                requiredSelect: true
            },
            ddlCategoriaTec: {
                requiredSelect: true
            },
            ddlModeloEntrega: {
                requiredSelect: true
            },
            ddlEstado: {
                requiredSelect: true
            },
            //ddlPlataformaBCP: {
            //    requiredSelect: true
            //},
            //ddlAreaBIAN: {
            //    requiredSelect: true
            //},
            //ddlDominioBIAN: {
            //    requiredSelect: true
            //},
            ddlJefaturaATI: {
                requiredSelect: true
            },
            ddlArquitectoTI: {
                requiredSelect: true
            },
            ddlEntidadResponsable: {
                requiredSelect: true
            },
            ddlEntidadUso: {
                requiredSelect: true
            },
            ddlGestionadoPor: {
                requiredSelect: true
            },
            ddlOOR: {
                requiredSelect: true
            },
            ddlRatificaOOR: {
                requiredSelect: true
            },
            ddlUbicacion: {
                requiredSelect: true
            },
            ddlTipoDesarrollo: {
                requiredSelect: true
            },
            ddlAutenticacion: {
                requiredSelect: true
            },
            ddlAutorizacion: {
                requiredSelect: true
            },
            ddlContingencia: {
                requiredSelect: true
            },
            ddlInfraestructura: {
                requiredSelect: true
            },
            ddlAmbiente: {
                requiredSelect: true
            },
            ddlCriticidad: {
                requiredSelect: true
            },
            txtCodigoApt: {
                requiredSinEspacios: true,
                minlength: 4,
                maxlength: 4,
                existeCodigoAPT: true
            },
            //ddlCompWindows: {
            //    requiredSelect: true
            //},
            //ddlCompNavegador: {
            //    requiredSelect: true
            //},
            //ddlCompVirtual: {
            //    requiredSelect: true
            //},
            //ddlInstaDesarrollo: {
            //    requiredSelect: true
            //},
            //ddlInstaCertificacion: {
            //    requiredSelect: true
            //},
            //ddlInstaProduccion: {
            //    requiredSelect: true
            //},
            //ddlGTR: {
            //    requiredSelect: true
            //},
            ddlConfidencialidad: {
                requiredSelect: true
            },
            ddlIntegridad: {
                requiredSelect: true
            },
            ddlDisponibilidad: {
                requiredSelect: true
            },
            ddlPrivacidad: {
                requiredSelect: true
            },
            ddlClasificacion: {
                requiredSelect: true
            },
            ddlEstadoRoadmap: {
                requiredSelect: true
            },
            txtNombreApp: {
                requiredSinEspacios: true,
                existeNombreAplicacion: true
            },
            txtProveedor: {
                requiredProveedor: true
            },
            txtLiderUsuario: {
                requiredSinEspacios: true,
                existeMatricula: true
            },
            txtUsuarioAutorizador: {
                requiredSinEspacios: true,
                existeMatricula: true
            },
            txtTTL: {
                requiredSinEspacios: true,
                existeMatricula: true
            },
            txtExpertoApp: {
                requiredSinEspacios: true,
                existeMatricula: true
            },
            txtBroker: {
                requiredSinEspacios: true,
                existeMatricula: true
            },
            txtJefeEquipoPO: {
                requiredSinEspacios: true,
                existeMatricula: true
            },
            //txtGestorUserIT: {
            //    requiredSinEspacios: true,
            //    existeMatricula: true
            //},
            //msjTable: {
            //    requiredRegistro: true
            //},
            txtCodigoInterfaz: {
                minlength: 2,
                maxlength: 2,
                existeCodigoInterfaz: true
            },
            ddlClasificacionTecnica: {
                requiredSelect: true
            },
            txtDesApp: {
                requiredSinEspacios: true
            },
            dpFechaSolicitud: {
                requiredSinEspacios: true
            },
            txtSO: {
                requiredPAE: true
            },
            txtHP: {
                requiredPAE: true
            },
            txtLP: {
                requiredPAE: true
            },
            //txtGestorApps: {
            //    requiredPAE: true
            //},
            //txtConsultor: {
            //    requiredPAE: true
            //},
            hdMensajeCuestionario: {
                requiredCuestionario: true
            },
            dpFechaCreacion: {
                requiredPAE: true,
                requiredFechaCreacion: true
            },
            //txtL1: {
            //    requiredSinEspacios: true,
            //    number: true
            //},
            //txtL2: {
            //    requiredSinEspacios: true,
            //    number: true
            //},
            //txtM1: {
            //    requiredSinEspacios: true,
            //    number: true
            //},
            //txtM2: {
            //    requiredSinEspacios: true,
            //    number: true
            //},
            //txtValorN: {
            //    requiredSinEspacios: true,
            //    number: true
            //},
            //txtValorPC: {
            //    requiredSinEspacios: true,
            //    number: true
            //}
        },
        messages: {
            ddlDivision: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlArea: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlGerenciaCentral: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            txtTribu: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la unidad")
            },
            //ddlTipoActivoInformacion: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            ddlMotivoCreacion: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlCategoriaTec: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlModeloEntrega: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlEstado: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            //ddlPlataformaBCP: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //ddlAreaBIAN: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //ddlDominioBIAN: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            ddlJefaturaATI: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlArquitectoTI: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlEntidadResponsable: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlEntidadUso: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlGestionadoPor: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlOOR: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlRatificaOOR: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlUbicacion: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlTipoDesarrollo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlAutenticacion: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlAutorizacion: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlContingencia: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlInfraestructura: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlAmbiente: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlCriticidad: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            txtCodigoApt: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el código APT"),
                minlength: "El código APT debe ser de 4 carácteres",
                maxlength: "El código APT debe ser de 4 carácteres",
                existeCodigoAPT: "El código APT ya existe"
            },
            //ddlCompWindows: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //ddlCompNavegador: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //ddlCompVirtual: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //ddlInstaDesarrollo: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //ddlInstaCertificacion: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //ddlInstaProduccion: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //ddlGTR: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            ddlConfidencialidad: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlIntegridad: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlDisponibilidad: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlPrivacidad: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlClasificacion: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlEstadoRoadmap: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            txtNombreApp: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre de la aplicación"),
                existeNombreAplicacion: "Nombre de aplicación ya existe"
            },
            txtProveedor: {
                requiredProveedor: String.Format("Debes ingresar {0}.", "el proveedor")
            },
            txtLiderUsuario: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la matrícula"),
                existeMatricula: "No fue posible ubicar la matrícula"
            },
            txtUsuarioAutorizador: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la matrícula"),
                existeMatricula: "No fue posible ubicar la matrícula"
            },
            txtTTL: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la matrícula"),
                existeMatricula: "No fue posible ubicar la matrícula"
            },
            txtExpertoApp: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la matrícula"),
                existeMatricula: "No fue posible ubicar la matrícula"
            },
            txtBroker: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la matrícula"),
                existeMatricula: "No fue posible ubicar la matrícula"
            },
            txtJefeEquipoPO: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la matrícula"),
                existeMatricula: "No fue posible ubicar la matrícula"
            },
            //txtGestorUserIT: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la matrícula"),
            //    existeMatricula: "No fue posible ubicar la matrícula"
            //},
            //msjTable: {
            //    requiredRegistro: String.Format("Debes registrar {0}.", "un módulo")
            //},
            txtCodigoInterfaz: {
                minlength: "El código interfaz debe ser de 2 carácteres",
                maxlength: "El código interfaz debe ser de 2 carácteres",
                existeCodigoInterfaz: "El código interfaz ya existe"
            },
            ddlClasificacionTecnica: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            txtDesApp: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
            dpFechaSolicitud: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha de registro")
            },
            txtSO: {
                requiredPAE: String.Format("Debes ingresar {0}.", "el sistema operativo")
            },
            txtHP: {
                requiredPAE: String.Format("Debes ingresar {0}.", "la herramienta de programación")
            },
            txtLP: {
                requiredPAE: String.Format("Debes ingresar {0}.", "el lenguaje de programación")
            },
            //txtGestorApps: {
            //    requiredPAE: String.Format("Debes ingresar {0}.", "el gestor de aplicaciones")
            //},
            //txtConsultor: {
            //    requiredPAE: String.Format("Debes ingresar {0}.", "el consultor")
            //},
            hdMensajeCuestionario: {
                requiredCuestionario: "Debes completar el cuestionario"
            },
            dpFechaCreacion: {
                requiredPAE: String.Format("Debes ingresar {0}.", "la fecha de creación"),
                requiredFechaCreacion: "Debes ingresar una fecha válida"
            },
            //txtL1: {
            //    requiredSinEspacios: "Sin valor",
            //    number: "Valor inválido"
            //},
            //txtL2: {
            //    requiredSinEspacios: "Sin valor",
            //    number: "Valor inválido"
            //},
            //txtM1: {
            //    requiredSinEspacios: "Sin valor",
            //    number: "Valor inválido"
            //},
            //txtM2: {
            //    requiredSinEspacios: "Sin valor",
            //    number: "Valor inválido"
            //},
            //txtValorN: {
            //    requiredSinEspacios: "Sin valor",
            //    number: "Valor inválido"
            //},
            //txtValorPC: {
            //    requiredSinEspacios: "Sin valor",
            //    number: "Valor inválido"
            //}
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "ddlEntidadUso" || element.attr('name') === "ddlAmbiente" || element.attr('name') === "ddlCategoriaTec"
                || element.attr('name') === "txtLiderUsuario" || element.attr('name') === "txtUsuarioAutorizador" || element.attr('name') === "txtTTL"
                || element.attr('name') === "txtExpertoApp" || element.attr('name') === "txtBroker" || element.attr('name') === "txtJefeEquipoPO"
                || element.attr('name') === "dpFechaSolicitud" || element.attr('name') === "dpFechaCreacion" || element.attr('name') === "txtCodigoInterfaz") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function ExisteCodigoAPT(codigoAPT) {
    let estado = false;
    let Id = $("#hdAplicacionId").val() === "" ? 0 : $("#hdAplicacionId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/ExisteCodigoAPT?codigoAPT=${codigoAPT}&Id=${Id}`,
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

function ExisteNombreAplicacion(nombre) {
    let estado = false;
    let Id = $("#hdAplicacionId").val() === "" ? 0 : $("#hdAplicacionId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/ExisteNombreAplicacion?nombre=${nombre}&id=${Id}`,
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

function ExisteCodigoInterfaz(filtro) {
    let estado = false;
    let Id = $("#hdAplicacionId").val() === "" ? 0 : $("#hdAplicacionId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/ExisteCodigoInterfaz?filtro=${filtro}&id=${Id}`,
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

function editarAplicacion(Id, TipoSolicitudId = TIPO_SOLICITUD_APP.CREACION) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/GetAplicacionById?Id=${Id}&TipoSolicitudId=${TipoSolicitudId}`,
        type: "GET",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null && dataObject.AplicacionDetalle !== null) {
                    waitingDialog.hide();
                    let data = dataObject;
                    let dataAD = dataObject.AplicacionDetalle;
                    let dataFiles = dataObject.Files || [];
                    $("#hdFlagRegistrado").val(FLAG_REGISTRADO.SI);
                    $("#hdAplicacionId").val(data.Id);
                    $("#hIdSolicitud").val(data.SolicitudId);
                    $("#hdEstadoSolicitudId").val(dataAD.EstadoSolicitudId);
                    $("#hdAplicacionDetalleId").val(dataAD.Id);
                    $("#dpFechaCreacion").val(data.FechaCreacionAplicacionStr); //cvt.Aplicacion

                    //RONALD
                    //$("#txtAplicacion").val(`${data.CodigoAPT} - ${data.Nombre}`);

                    //TAB1
                    $("#txtCodigoApt").val(data.CodigoAPT); //cvt.Aplicacion
                    if (data.EstadoAplicacion !== "Eliminada") {
                        SetItems(ESTADO_APLICACION_COMBO.filter(x => x !== "Eliminada"), $("#ddlEstado"), TEXTO_SELECCIONE);
                        $("#ddlEstado").val(data.EstadoAplicacion || "-1"); //cvt.Aplicacion

                        //Tipo activo informacion
                        let itemTAI = TAI_DATA.find(x => x.Descripcion.toUpperCase() === data.TipoActivoInformacion.toUpperCase()) || null;
                        if (itemTAI !== null) {
                            if (itemTAI.FlagActivo) {
                                $("#ddlTipoActivoInformacion").val(data.TipoActivoInformacion || "-1"); //cvt.Aplicacion
                                $("#ddlTipoActivoInformacion").trigger("change"); //cvt.Aplicacion
                            } else {
                                let arrAllTAI = TAI_DATA.map(x => x.Descripcion) || [];
                                SetItems(arrAllTAI, $("#ddlTipoActivoInformacion"), TEXTO_SELECCIONE);
                                $("#ddlTipoActivoInformacion").val(data.TipoActivoInformacion || "-1"); 
                                $("#ddlTipoActivoInformacion").attr("disabled", "disabled");
                                $("#ddlTipoActivoInformacion").trigger("change");
                            }
                        } else {
                            $("#ddlTipoActivoInformacion").val(data.TipoActivoInformacion || "-1"); //cvt.Aplicacion
                            $("#ddlTipoActivoInformacion").trigger("change"); //cvt.Aplicacion
                        }

                    } else {
                        //Estado aplicacion
                        SetItems(ESTADO_APLICACION_COMBO, $("#ddlEstado"), TEXTO_SELECCIONE);
                        $("#ddlEstado").val(data.EstadoAplicacion || "-1"); //cvt.Aplicacion
                        $("#ddlEstado").attr("disabled", "disabled");

                        //Tipo activo informacion
                        let arrAllTAI = TAI_DATA.map(x => x.Descripcion) || [];
                        SetItems(arrAllTAI, $("#ddlTipoActivoInformacion"), TEXTO_SELECCIONE);
                        $("#ddlTipoActivoInformacion").val(data.TipoActivoInformacion || "-1"); //cvt.Aplicacion
                        $("#ddlTipoActivoInformacion").attr("disabled", "disabled");
                        $("#ddlTipoActivoInformacion").trigger("change"); //cvt.Aplicacion
                    }

                    $("#ddlGerenciaCentral").val(data.GerenciaCentral || "-1"); ////cvt.Aplicacion
                    $("#ddlGerenciaCentral").trigger("change");
                    $("#ddlDivision").val(data.Division || "-1");
                    $("#ddlDivision").trigger("change");
                    $("#ddlArea").val(data.Area || "-1");
                    $("#ddlArea").trigger("change");
                    $("#txtTribu").val(data.Unidad || "");

                    //$("#ddlFlagAplica1").prop("checked", data.Owner_LiderUsuario_ProductOwner !== NO_APLICA ? true : false);
                    //$("#ddlFlagAplica1").bootstrapToggle(data.Owner_LiderUsuario_ProductOwner !== NO_APLICA ? "on" : "off");
                    //$("#ddlFlagAplica1").trigger("change");
                    $("#txtLiderUsuario").val(data.Owner_LiderUsuario_ProductOwner !== NO_APLICA ? data.MatriculaOwner : data.Owner_LiderUsuario_ProductOwner); //cvt.Aplicacion //1
                    $("#lbl1").html(data.Owner_LiderUsuario_ProductOwner !== NO_APLICA ? data.Owner_LiderUsuario_ProductOwner : "");
                    $("#hdOwner").val(data.HdOwner || "0");

                    //$("#ddlFlagAplica2").prop("checked", data.Gestor_UsuarioAutorizador_ProductOwner !== NO_APLICA ? true : false);
                    //$("#ddlFlagAplica2").bootstrapToggle(data.Gestor_UsuarioAutorizador_ProductOwner !== NO_APLICA ? "on" : "off");
                    //$("#ddlFlagAplica2").trigger("change");
                    $("#txtUsuarioAutorizador").val(data.Gestor_UsuarioAutorizador_ProductOwner !== NO_APLICA ? data.MatriculaGestor : data.Gestor_UsuarioAutorizador_ProductOwner); //cvt.Aplicacion //2
                    $("#lbl2").html(data.Gestor_UsuarioAutorizador_ProductOwner !== NO_APLICA ? data.Gestor_UsuarioAutorizador_ProductOwner : "");
                    $("#hdGestor").val(data.HdGestor || "0");

                    if (data.FlagAprobado !== null && data.FlagAprobado) $("#txtCodigoApt").attr("disabled", "disabled");

                    $("#txtNombreApp").val(data.Nombre); //cvt.Aplicacion
                    $("#txtDesApp").val(data.DescripcionAplicacion); //cvt.Aplicacion

                    $("#ddlMotivoCreacion").val(dataAD.MotivoCreacion || "-1"); //app.AplicacionDetalle
                    $("#dpFechaSolicitud").val(dataAD.FechaSolicitudStr); //app.AplicacionDetalle
                    $("#txtPersonaSolicitud").val(dataAD.PersonaSolicitudStr); //app.AplicacionDetalle
                    //$("#ddlCategoriaTec").val(data.CategoriaTecnologica); //cvt.Aplicacion
                    $("#ddlCategoriaTec").val(data.CategoriaTecnologica.split("|")); //app.AplicacionDetalle
                    $("#ddlCategoriaTec").multiselect("refresh");
                    $("#ddlModeloEntrega").val(dataAD.ModeloEntrega || "-1"); //app.AplicacionDetalle
                    $("#txtCodigoInterfaz").val(dataAD.CodigoInterfaz); //app.AplicacionDetalle

                    //TAB2
                    $("#ddlAreaBIAN").val(data.AreaBIAN || "-1");  //cvt.Aplicacion
                    $("#ddlAreaBIAN").trigger("change");
                    $("#ddlPlataformaBCP").val(dataAD.PlataformaBCP || "-1"); //app.AplicacionDetalle
                    $("#ddlDominioBIAN").val(data.DominioBIAN || "-1"); //cvt.Aplicacion
                    $("#ddlDominioBIAN").trigger("change");
                    $("#ddlJefaturaATI").val(data.JefaturaATI || "-1"); //cvt.Aplicacion
                    $("#ddlJefaturaATI").trigger("change");
                    //$("#ddlArquitectoTI").val(data.ArquitectoTI);
                    $("#ddlArquitectoTI").val(setComboArquitectoTi(data.ArquitectoTI));
                    $("#ddlGestionadoPor").val(data.GestionadoPor || "-1"); //cvt.Aplicacion
                    $("#ddlGestionadoPor").trigger("change");

                    $("#ddlFlagAplica3").prop("checked", data.TribeTechnicalLead !== NO_APLICA ? true : false);
                    $("#ddlFlagAplica3").bootstrapToggle(data.TribeTechnicalLead !== NO_APLICA ? "on" : "off");
                    $("#ddlFlagAplica3").trigger("change");
                    $("#txtTTL").val(data.TribeTechnicalLead !== NO_APLICA ? data.MatriculaTTL : data.TribeTechnicalLead); //cvt.Aplicacion //3
                    $("#lbl3").html(data.TribeTechnicalLead !== NO_APLICA ? data.TribeTechnicalLead : "");
                    $("#hdTTL").val(data.HdTTL || "0");

                    //$("#ddlFlagAplica4").prop("checked", data.Experto_Especialista !== NO_APLICA ? true : false);
                    //$("#ddlFlagAplica4").bootstrapToggle(data.Experto_Especialista !== NO_APLICA ? "on" : "off");
                    //$("#ddlFlagAplica4").trigger("change");
                    //debugger;
                    $("#txtExpertoApp").val(data.Experto_Especialista !== NO_APLICA ? data.MatriculaExperto : data.Experto_Especialista); //cvt.Aplicacion //4
                    $("#lbl4").html(data.Experto_Especialista !== NO_APLICA ? data.Experto_Especialista : "");
                    $("#hdExperto").val(data.HdExperto || "0");

                    $("#ddlFlagAplica5").prop("checked", data.BrokerSistemas !== NO_APLICA ? true : false);
                    $("#ddlFlagAplica5").bootstrapToggle(data.BrokerSistemas !== NO_APLICA ? "on" : "off");
                    $("#ddlFlagAplica5").trigger("change");
                    $("#txtBroker").val(data.BrokerSistemas !== NO_APLICA ? data.MatriculaBroker : data.BrokerSistemas); //cvt.Aplicacion //5
                    $("#lbl5").html(data.BrokerSistemas !== NO_APLICA ? data.BrokerSistemas : "");
                    $("#hdBroker").val(data.HdBroker || "0");

                    //$("#ddlFlagAplica6").prop("checked", data.JefeEquipo_ExpertoAplicacionUserIT_ProductOwner !== NO_APLICA ? true : false);
                    //$("#ddlFlagAplica6").bootstrapToggle(data.JefeEquipo_ExpertoAplicacionUserIT_ProductOwner !== NO_APLICA ? "on" : "off");
                    //$("#ddlFlagAplica6").trigger("change");
                    $("#txtJefeEquipoPO").val(data.JefeEquipo_ExpertoAplicacionUserIT_ProductOwner !== NO_APLICA ? data.MatriculaJDE : data.JefeEquipo_ExpertoAplicacionUserIT_ProductOwner); //cvt.Aplicacion //6
                    $("#lbl6").html(data.JefeEquipo_ExpertoAplicacionUserIT_ProductOwner !== NO_APLICA ? data.JefeEquipo_ExpertoAplicacionUserIT_ProductOwner : "");
                    $("#hdJdE").val(data.HdJDE || "0");

                    //$("#txtGestorUserIT").val(data.GestorUserIT || "");

                    $("#txtNombreSquad").val(data.NombreEquipo_Squad || ""); //cvt.Aplicacion
                    $("#ddlEntidadResponsable").val(data.EntidadResponsable || "-1"); //cvt.Aplicacion
                    $("#ddlEntidadUso").val(dataAD.EntidadUso.split(",")); //app.AplicacionDetalle
                    $("#txtUnidadUsuaria").val(dataAD.UnidadUsuario); //app.AplicacionDetalle
                    $("#ddlEntidadUso").multiselect("refresh");

                    //TAB3
                    $("#ddlCriticidad").val(data.CriticidadId || "-1"); //cvt.Aplicacion
                    $("#ddlTipoDesarrollo").val(dataAD.TipoDesarrollo || "-1"); //app.AplicacionDetalle
                    $("#ddlTipoDesarrollo").trigger("change");
                    $("#txtProveedor").val(dataAD.Proveedor || ""); //app.AplicacionDetalle

                    $("#ddlUbicacion").val(dataAD.Ubicacion || "-1"); //app.AplicacionDetalle
                    $("#ddlUbicacion").trigger("change");

                    $("#ddlInfraestructura").val(dataAD.Infraestructura || "-1"); //app.AplicacionDetalle
                    $("#txtRutaRepo").val(dataAD.RutaRepositorio); //app.AplicacionDetalle

                    $("#ddlContingencia").val(dataAD.Contingencia || "-1"); //app.AplicacionDetalle
                    $("#ddlAutenticacion").val(dataAD.MetodoAutenticacion || "-1"); //app.AplicacionDetalle
                    $("#ddlAutorizacion").val(dataAD.MetodoAutorizacion || "-1"); //app.AplicacionDetalle
                    $("#ddlAmbiente").val(dataAD.AmbienteInstalacion !== null ? dataAD.AmbienteInstalacion.split(",") : "-1"); //app.AplicacionDetalle
                    $("#ddlAmbiente").multiselect("refresh");
                    //$("#txtGSD").val(dataAD.GrupoServiceDesk); //app.AplicacionDetalle

                    if (TIPO_FLUJO_ACTUAL === TIPO_FLUJO_PORTAFOLIO.FNA) {
                        $("#ddlOOR").val(dataAD.FlagOOR !== null ? (dataAD.FlagOOR ? "Si" : "No") : "-1");
                        $("#ddlRatificaOOR").val(dataAD.FlagRatificaOOR !== null ? (dataAD.FlagRatificaOOR ? "Si" : "No") : "-1");
                        $("#ddlGTR").val(dataAD.GrupoTicketRemedy || "");
                    }
                    
                    $("#txtAppReemplazo").val($.trim(dataAD.AplicacionReemplazo) !== "" ? dataAD.AplicacionReemplazo : NO_APLICA); //app.AplicacionDetalle
                    $("#txtInterfazApp").val(dataAD.InterfazApp || ""); //app.AplicacionDetalle
                    $("#ddlProcesoClave").val(dataAD.ProcesoClave === "" || dataAD.ProcesoClave === null ? "-1" : dataAD.ProcesoClave); //app.AplicacionDetalle

                    $("#ddlClasificacionTecnica").val(data.ClasificacionTecnica || "-1"); //cvt.Aplicacion
                    $("#txtSubclasificacionTecnica").val(data.SubclasificacionTecnica || ""); //cvt.Aplicacion

                    //Listado de servidores asociados
                    listarRegistrosPae($tblServidorAplicacion, "ListarServidorAplicacion", null, $.trim($("#txtCodigoApt").val()), false);

                    $("#ddlFlagAplicaCheckList").prop("checked", dataAD.FlagFileCheckList !== null && dataAD.FlagFileCheckList ? true : false);
                    $("#ddlFlagAplicaCheckList").bootstrapToggle(dataAD.FlagFileCheckList !== null && dataAD.FlagFileCheckList ? "on" : "off");
                    $("#ddlFlagAplicaCheckList").trigger("change");

                    $("#ddlFlagAplicaMatriz").prop("checked", dataAD.FlagFileMatriz !== null && dataAD.FlagFileMatriz ? true : false);
                    $("#ddlFlagAplicaMatriz").bootstrapToggle(dataAD.FlagFileMatriz !== null && dataAD.FlagFileMatriz ? "on" : "off");
                    $("#ddlFlagAplicaMatriz").trigger("change");

                    //Files
                    getFiles(dataFiles);

                    //Estándares
                    $("#txtSO").val(dataAD.SWBase_SO || "");
                    $("#txtHP").val(dataAD.SWBase_HP || "");
                    $("#txtLP").val(dataAD.SWBase_LP || "");
                    $("#txtBD").val(dataAD.SWBase_BD || "");
                    $("#txtFramework").val(dataAD.SWBase_Framework || "");
                    updateRET();

                    $("#hdEstadoSO").val(dataAD.EstadoId_SO !== null ? dataAD.EstadoId_SO : "0");
                    $("#hdEstadoHP").val(dataAD.EstadoId_HP !== null ? dataAD.EstadoId_HP : "0");
                    $("#hdEstadoLP").val(dataAD.EstadoId_LP !== null ? dataAD.EstadoId_LP : "0");
                    $("#hdEstadoBD").val(dataAD.EstadoId_BD !== null ? dataAD.EstadoId_BD : "0");
                    $("#hdEstadoFW").val(dataAD.EstadoId_FW !== null ? dataAD.EstadoId_FW : "0");

                    setColorEstandar($("#hdEstadoSO"), $("#txtSO"));
                    setColorEstandar($("#hdEstadoHP"), $("#txtHP"));
                    setColorEstandar($("#hdEstadoLP"), $("#txtLP"));
                    setColorEstandar($("#hdEstadoBD"), $("#txtBD"));
                    setColorEstandar($("#hdEstadoFW"), $("#txtFramework"));

                    $("#ddlCompWindows").val(dataAD.CompatibilidadWindows || "-1"); //app.AplicacionDetalle
                    $("#ddlCompNavegador").val(dataAD.CompatibilidadNavegador || "-1"); //app.AplicacionDetalle
                    $("#ddlCompVirtual").val(dataAD.CompatibilidadHV || "-1"); //app.AplicacionDetalle
                    $("#txtNCET").val(dataAD.NCET || ""); //app.AplicacionDetalle
                    $("#txtNCLS").val(dataAD.NCLS || ""); //app.AplicacionDetalle
                    $("#txtNCG").val(dataAD.NCG || ""); //app.AplicacionDetalle

                    $("#ddlFlagAplica").prop("checked");
                    $("#txtResumenLin").val(dataAD.ResumenSeguridadInformacion || ""); //app.AplicacionDetalle
                    if ($.trim($("#txtResumenLin").val()) !== "") $("#ddlFlagAplica").prop("checked", true);
                    $("#ddlFlagAplica").trigger("change");

                    //Responsables cuestionario
                    //$("#txtGestorApps").val(dataAD.GestorAplicacionCTR || "");
                    //$("#txtConsultor").val(dataAD.ConsultorCTR || "");

                    $("#ddlInstaDesarrollo").val(dataAD.InstaladaDesarrollo || "-1"); //app.AplicacionDetalle
                    $("#ddlInstaCertificacion").val(dataAD.InstaladaCertificacion || "-1"); //app.AplicacionDetalle
                    $("#ddlInstaProduccion").val(dataAD.InstaladaProduccion || "-1"); //app.AplicacionDetalle

                    if (VISTA_ID === VISTA_GESTION_APP.CATALOGO) {
                        //TAB3
                        $("#ddlConfidencialidad").val(dataAD.Confidencialidad || "-1"); //app.AplicacionDetalle
                        $("#ddlIntegridad").val(dataAD.Integridad || "-1"); //app.AplicacionDetalle
                        $("#ddlDisponibilidad").val(dataAD.Disponibilidad || "-1"); //app.AplicacionDetalle
                        $("#ddlPrivacidad").val(dataAD.Privacidad || "-1"); //app.AplicacionDetalle
                        $("#ddlClasificacion").val(dataAD.Clasificacion || "-1"); //app.AplicacionDetalle

                        $("#txtCritcidadAplicacionBIA").val(dataAD.CriticidadAplicacionBIA || "");
                        $("#txtProductoServicioApp").val(dataAD.ProductoMasRepresentativo || "");
                        $("#txtMenorRTO").val(dataAD.MenorRTO || "");
                        $("#txtMayorGradoInterrupcion").val(dataAD.MayorGradoInterrupcion || "");

                        //TAB4
                        $("#txtRoadmapPlanificado").val(dataAD.RoadmapPlanificado); //app.AplicacionDetalle
                        $("#txtDetalleEstrategia").val(dataAD.DetalleEstrategia); //app.AplicacionDetalle
                        $("#ddlEstadoRoadmap").val(dataAD.EstadoRoadmap || "-1"); //app.AplicacionDetalle
                        $("#txtEtapaAtencion").val(dataAD.EtapaAtencion); //app.AplicacionDetalle
                        $("#txtRoadmapEjecutado").val(dataAD.RoadmapEjecutado); //app.AplicacionDetalle
                        $("#txtFechaInicioRM").val(dataAD.FechaInicioRoadmap); //app.AplicacionDetalle
                        $("#txtFechaFinRM").val(dataAD.FechaFinRoadmap); //app.AplicacionDetalle
                        $("#txtCodigoAppReemplazo").val(dataAD.CodigoAppReemplazo); //app.AplicacionDetalle

                        EditarCuestionarioByCodigoAPT($.trim($("#txtCodigoApt").val()));
                    }
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function setComboArquitectoTi(matricula) {
    let retorno = "-1";
    if (matricula && $.trim(matricula) !== "") {
        var item = ARQUITECTO_COMBO.find(x => x.includes(matricula)) || null;
        if (item !== null) retorno = item;
    }

    return retorno;
}

function getEstadoSolicitudAppById(Id) {
    let estadoId = 0;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/GetEstadoSolicitudById?Id=${Id}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    estadoId = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return estadoId;
}

function addItemTextArea($item, $box, $idEstado) {
    var data = $.trim($item.val());
    if (data !== "") {
        //var dataTextArea = $box.val();
        //if ($.trim(dataTextArea) !== "") {
        //    dataTextArea = "".concat(data);
        //    //if ($.trim(dataTextArea) === NO_APLICA) {
        //    //    dataTextArea = "".concat(data);
        //    //} else
        //    //    dataTextArea = dataTextArea.concat("\n", data);
        //} else {
        //    dataTextArea = dataTextArea.concat(data);
        //}
        $box.val(data);
        $item.val("");
        setColorEstandar($idEstado, $box);

        //Update RET
        updateRET();
    }
}

function updateRET(strSO = null, strHP = null, strLP = null, strBD = null, strFW = null) {
    let _so = strSO === null ? $.trim($("#txtSO").val()) : strSO;
    let _hp = strHP === null ? $.trim($("#txtHP").val()) : strHP;
    let _lp = strLP === null ? $.trim($("#txtLP").val()) : strLP;
    let _bd = strBD === null ? $.trim($("#txtBD").val()) : strBD;
    let _fw = strFW === null ? $.trim($("#txtFramework").val()) : strFW;
    $("#txtRET").val(String.Format(EstructuraRET, _so, _hp, _lp, _bd, _fw));
}

function addLineamiento() {
    addItemTextArea($("#txtLineamiento"), $("#txtResumenLin"));
}

function clearResumen() {
    $("#txtResumenLin").val("");
}

//function addServidor() { addItemTextArea($("#txtItemServidor"), $("#txtNombreServidor")); }
//function clearServidor() { $("#txtNombreServidor").val(""); }

//SWBase

function addSO() {
    let $txtItem = $("#txtItemSO");
    if ($.trim($txtItem.val()) !== "") {
        if (ExisteClaveTecnologia($txtItem)) {
            addItemTextArea($txtItem, $("#txtSO"), $("#hdEstadoSO"));
        } else {
            toastr.error("Sistema operativo no registrado", TITULO_MENSAJE);
        }
    }
}
function clearSO() {
    $("#hdEstadoSO").val("0");
    $("#txtSO").removeClass("red-color");
    $("#txtSO").removeClass("green-color");
    $("#txtSO").removeClass("yellow-color");
    $("#txtSO").val("");
    updateRET("");
}

function addHP() {
    let $txtItem = $("#txtItemHP");
    if ($.trim($txtItem.val()) !== "") {
        if (ExisteClaveTecnologia($txtItem)) {
            addItemTextArea($txtItem, $("#txtHP"), $("#hdEstadoHP"));
        } else {
            toastr.error("Herramienta de programación no registrada", TITULO_MENSAJE);
        }
    }
}
function clearHP() {
    $("#hdEstadoHP").val("0");
    $("#txtHP").removeClass("red-color");
    $("#txtHP").removeClass("green-color");
    $("#txtHP").removeClass("yellow-color");
    $("#txtHP").val("");
    updateRET(null, "");
}

function addLP() {
    let $txtItem = $("#txtItemLP");
    if ($.trim($txtItem.val()) !== "") {
        if (ExisteClaveTecnologia($txtItem)) {
            addItemTextArea($txtItem, $("#txtLP"), $("#hdEstadoLP"));
        } else {
            toastr.error("Lenguaje de programación no registrado", TITULO_MENSAJE);
        }
    }
}
function clearLP() {
    $("#hdEstadoLP").val("0");
    $("#txtLP").removeClass("red-color");
    $("#txtLP").removeClass("green-color");
    $("#txtLP").removeClass("yellow-color");
    $("#txtLP").val("");
    updateRET(null, null, "");
}

function addBD() {
    let $txtItem = $("#txtItemBD");
    if ($.trim($txtItem.val()) !== "") {
        if (ExisteClaveTecnologia($txtItem)) {
            addItemTextArea($txtItem, $("#txtBD"), $("#hdEstadoBD"));
        } else {
            toastr.error("Base de datos no registrada", TITULO_MENSAJE);
        }
    }
}
function clearBD() {
    $("#hdEstadoBD").val("0");
    $("#txtBD").removeClass("red-color");
    $("#txtBD").removeClass("green-color");
    $("#txtBD").removeClass("yellow-color");
    $("#txtBD").val(NO_APLICA);
    updateRET(null, null, null, NO_APLICA);
}

function addFramework() {
    let $txtItem = $("#txtItemFramework");
    if ($.trim($txtItem.val()) !== "") {
        if (ExisteClaveTecnologia($txtItem)) {
            addItemTextArea($txtItem, $("#txtFramework"), $("#hdEstadoFW"));
        } else {
            toastr.error("Framework no registrada", TITULO_MENSAJE);
        }
    }
}
function clearFramework() {
    $("#hdEstadoFW").val("0");
    $("#txtFramework").removeClass("red-color");
    $("#txtFramework").removeClass("green-color");
    $("#txtFramework").removeClass("yellow-color");
    $("#txtFramework").val(NO_APLICA);
    updateRET(null, null, null, null, NO_APLICA);
}

//end

function sendDataEstadoAPI($btn, Mensaje, EstadoSolicitudId, TipoSolicitudId, funStr, url_redirect) {
    debugger;
    let data = {};
    data.Id = $("#hIdSolicitud").val();
    data.EstadoSolicitudId = EstadoSolicitudId;
    data.Observacion = $("#txtObservacionesElim").val() || "";
    data.MotivoComentario = TIPO_SOLICITUD_ID === TIPO_SOLICITUD_APP.CREACION ? $.trim($("#txtComentarioSolicitud").val()) : $.trim($("#txtMotivoModificacion").val());
    data.TipoSolicitudId = TipoSolicitudId;

    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }

    debugger;
    $.ajax({
        url: URL_API + "/Solicitud/CambiarEstado",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (result) {
            if (result) {
                toastr.success(Mensaje, TITULO_MENSAJE);
            }
        },
        complete: function (data) {
            $("#hIdSolicitud").val('');
            if ($.trim(funStr) !== "") eval(funStr);
            if ($btn !== null) {
                $btn.button("reset");
                waitingDialog.hide();
            } 

            if (ControlarCompleteAjax(data)) {
                if ($.trim(url_redirect) !== "") window.location.href = url_redirect;
            }
            else
                bootbox.alert("Sucedió un error con el servicio", function () { });
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });
}

function irAprobarCreacion() {
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: String.Format("¿Estás seguro que deseas {0} esta solicitud?", "aprobar"),
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            result = result || null;
            if (result !== null && result) {
                aprobarSolicitud();
            }
        }
    });
}

function irObservarCreacion() {
    $("#btnRS").hide();
    $("#txtObservacionesElim").val("");
    $("#title_modal").html("Observar solicitud");
    OpenCloseModal($("#mdOS"), true);
}

function aprobarSolicitud() {
    sendDataEstadoAPI($("#btnAprobarApp"),
        "Se aprobó la solicitud correctamente",
        ESTADO_SOLICITUD_APP.APROBADO,
        TIPO_SOLICITUD_ID,
        "",
        URL_BANDEJA_APP + "?paginaActual=" + PAGINA_ACTUAL +"&paginaTamanio=" + PAGINA_TAMANIO);
}

function observarSolicitud() {
    if ($("#formOS").valid()) {
        sendDataEstadoAPI($("#btnOS"),
            "Se observó la solicitud correctamente",
            ESTADO_SOLICITUD_APP.OBSERVADO,
            TIPO_SOLICITUD_ID,
            `OpenCloseModal($("#mdOS"), false);`,
            URL_BANDEJA_APP + "?paginaActual=" + PAGINA_ACTUAL + "&paginaTamanio=" + PAGINA_TAMANIO);
    }
}

function ExisteMatricula(Matricula) {
    debugger;

    let estado = false;
    let matricula = Matricula;
    $.ajax({
        type: "GET",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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

    debugger;
    return estado;
}

function ValidarMatricula1() {
    $(".form-control").addClass("ignore");
    $(".input1").removeClass("ignore");

    if ($("#formAddOrEditApp").valid()) {
        $("#lbl1").html(DATOS_RESPONSABLE.Nombres);
        RegistrarMatricula(DATOS_RESPONSABLE);
    }
}

function ValidarMatricula2() {
    $(".form-control").addClass("ignore");
    $(".input2").removeClass("ignore");

    if ($("#formAddOrEditApp").valid()) {
        $("#lbl2").html(DATOS_RESPONSABLE.Nombres);
        RegistrarMatricula(DATOS_RESPONSABLE);
        //ObtenerDatosByMatricula($("#txtDueTec"), $("#lblDueno"));
    }
}

function ValidarMatricula3() {
    $(".form-control").addClass("ignore");
    $(".input3").removeClass("ignore");

    if ($("#formAddOrEditApp").valid()) {
        $("#lbl3").html(DATOS_RESPONSABLE.Nombres);
        RegistrarMatricula(DATOS_RESPONSABLE);
        //ObtenerDatosByMatricula($("#txtDueTec"), $("#lblDueno"));
    }
}

function ValidarMatricula4() {
    $(".form-control").addClass("ignore");
    $(".input4").removeClass("ignore");

    if ($("#formAddOrEditApp").valid()) {
        $("#lbl4").html(DATOS_RESPONSABLE.Nombres);
        RegistrarMatricula(DATOS_RESPONSABLE);
        //ObtenerDatosByMatricula($("#txtDueTec"), $("#lblDueno"));
    }
}

function ValidarMatricula5() {
    $(".form-control").addClass("ignore");
    $(".input5").removeClass("ignore");

    if ($("#formAddOrEditApp").valid()) {
        $("#lbl5").html(DATOS_RESPONSABLE.Nombres);
        RegistrarMatricula(DATOS_RESPONSABLE);
        //ObtenerDatosByMatricula($("#txtDueTec"), $("#lblDueno"));
    }
}

function ValidarMatricula6() {
    $(".form-control").addClass("ignore");
    $(".input6").removeClass("ignore");

    if ($("#formAddOrEditApp").valid()) {
        $("#lbl6").html(DATOS_RESPONSABLE.Nombres);
        RegistrarMatricula(DATOS_RESPONSABLE);
        //ObtenerDatosByMatricula($("#txtDueTec"), $("#lblDueno"));
    }
}

function ValidarMatricula7() {
    $(".form-control").addClass("ignore");
    $(".input7").removeClass("ignore");

    if ($("#formAddOrEditApp").valid()) {
        $("#lbl7").html(DATOS_RESPONSABLE.Nombres);
        RegistrarMatricula(DATOS_RESPONSABLE);
        //ObtenerDatosByMatricula($("#txtDueTec"), $("#lblDueno"));
    }
}

function initLblMatricula() {
    setBlankLbl($("#txtLiderUsuario"), $("#lbl1"));
    setBlankLbl($("#txtUsuarioAutorizador"), $("#lbl2"));
    setBlankLbl($("#txtTTL"), $("#lbl3"));
    setBlankLbl($("#txtExpertoApp"), $("#lbl4"));
    setBlankLbl($("#txtBroker"), $("#lbl5"));
    setBlankLbl($("#txtJefeEquipoPO"), $("#lbl6"));
    //setBlankLbl($("#txtGestorUserIT"), $("#lbl7"));
}

function validarFormOS() {
    $("#formOS").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtObservacionesElim: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtObservacionesElim: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la observación")
            }
        }
    });
}


function sendDataSolicitudAPI(EstadoSolicitudId) {
    var solicitud = {};
    solicitud.Id = ($("#hIdSolicitud").val() === "") ? 0 : parseInt($("#hIdSolicitud").val());
    solicitud.CodigoAplicacion = $("#txtCodigoApt").val().trim(); //TODO
    solicitud.Observaciones = ""; //$("#txtComentarios").val();
    solicitud.EstadoSolicitud = EstadoSolicitudId;
    solicitud.TipoSolicitud = TIPO_SOLICITUD_APP.CREACION;

    $.ajax({
        url: URL_API + "/Solicitud",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        data: solicitud,
        dataType: "json",
        success: function (result) {
            var data = result;
            if (data > 0) {
                console.log(data);
            }
        },
        complete: function () {
        },
        error: function (result) {
            alert(result.responseText);
        }
    });
}

function irResponderCreacion(_idTipoSolicitud) {
    debugger;
    let tipoSolicitud = parseInt(_idTipoSolicitud);
    if (tipoSolicitud === TIPO_SOLICITUD_APP.CREACION) {
        $(".form-control").removeClass("ignore");
        $(".catalogo-app").addClass("ignore");
    } else if (tipoSolicitud === TIPO_SOLICITUD_APP.MODIFICACION) {
        $(".form-control").addClass("ignore"); 
        $(".input-registro").removeClass("ignore");
    }

    if ($("#formAddOrEditApp").valid()) {
        $("#btnOS").hide();
        $("#txtObservacionesElim").val("");
        $("#title_modal").html("Responder solicitud");
        LimpiarValidateErrores($("#formOS"));
        OpenCloseModal($("#mdOS"), true);
    }
}

function responderSolicitud() {
    if (TIPO_SOLICITUD_ID === TIPO_SOLICITUD_APP.CREACION) {
        CARGA_RESPONSABLES = true;

        if ($("#formOS").valid()) {
            sendDataFormAPI($("#formAddOrEditApp"),
                $("#btnResponderApp"),
                "",
                ESTADO_SOLICITUD_APP.PROCESOREVISION,
                URL_BANDEJA_CREACION_APP,
                "",
                true,
                ACCIONES_PORTAFOLIO.RESPONDER);
        }
    } else if (TIPO_SOLICITUD_ID === TIPO_SOLICITUD_APP.MODIFICACION) {
        CARGA_RESPONSABLES = false;

        if ($("#formOS").valid()) {
            sendDataFormSolicitudAPI($("#formAddOrEditApp"),
                $("#btnResponderApp"),
                "Registrado y enviado correctamente",
                ESTADO_SOLICITUD_APP.PROCESOREVISION,
                URL_BANDEJA_MODIFICACION_APP,
                "",
                true,
                ACCIONES_PORTAFOLIO.RESPONDER);
        }
    }
}

function insertarSolicitudComentario() {
    let data = {};
    data.Id = 0;
    data.SolicitudAplicacionId = parseInt($("#hIdSolicitud").val());
    data.Comentarios = $.trim($("#txtObservacionesElim").val()) || "";
    data.TipoComentarioId = TIPO_COMENTARIO.COMENTARIO;

    $.ajax({
        url: URL_API + "/Solicitud/AddOrEditSolicitudComentarios",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (result) {
            console.log(result);

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function initCbMatricula() {
    //FormatoCheckBox($("#divFlagAplica1"), "ddlFlagAplica1");
    //FormatoCheckBox($("#divFlagAplica2"), "ddlFlagAplica2");
    FormatoCheckBox($("#divFlagAplica3"), "ddlFlagAplica3");
    //FormatoCheckBox($("#divFlagAplica4"), "ddlFlagAplica4");
    FormatoCheckBox($("#divFlagAplica5"), "ddlFlagAplica5");
    //FormatoCheckBox($("#divFlagAplica6"), "ddlFlagAplica6");
    //FormatoCheckBox($("#divFlagAplica7"), "ddlFlagAplica7");

    //$("#ddlFlagAplica1").on('change', function () { FlagAplicaMatricula_Change($("#ddlFlagAplica1"), $(".divM1"), $("#lbl1"), $(".input1")); });
    //$("#ddlFlagAplica2").on('change', function () { FlagAplicaMatricula_Change($("#ddlFlagAplica2"), $(".divM2"), $("#lbl2"), $(".input2")); });
    $("#ddlFlagAplica3").on('change', function () { FlagAplicaMatricula_Change($("#ddlFlagAplica3"), $(".divM3"), $("#lbl3"), $(".input3")); });
    //$("#ddlFlagAplica4").on('change', function () { FlagAplicaMatricula_Change($("#ddlFlagAplica4"), $(".divM4"), $("#lbl4"), $(".input4")); });
    $("#ddlFlagAplica5").on('change', function () { FlagAplicaMatricula_Change($("#ddlFlagAplica5"), $(".divM5"), $("#lbl5"), $(".input5")); });
    //$("#ddlFlagAplica6").on('change', function () { FlagAplicaMatricula_Change($("#ddlFlagAplica6"), $(".divM6"), $("#lbl6"), $(".input6")); });
    //$("#ddlFlagAplica7").on('change', function () { FlagAplicaMatricula_Change($("#ddlFlagAplica7"), $(".divM7"), $("#lbl7"), $(".input7")); });
}

function GetDataByTextDDL(ddlValor, urlGet) {
    let retorno = null;

    $.ajax({
        type: "GET",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API + `${urlGet}?filtro=${ddlValor}`,
        dataType: "json",
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

function InitSelectBuilder(filtro, $ddl, urlGet, prefiltro1 = "", flagArquitecto = false, flagEstadoApp = false) { //Si es eliminado
    if (filtro !== null && filtro !== "-1") {
        let _prefiltro1 = $.trim(prefiltro1) !== "" ? `filtro1=${prefiltro1}&` : "";
        $.ajax({
            type: "GET",
			beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            contentType: "application/json; charset=utf-8",
            url: URL_API + `${urlGet}?${_prefiltro1}filtro=${filtro}`,
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        let data = dataObject;

                        if (flagArquitecto) {

                            if (!flagEstadoApp) data = data.filter(x => x.FlagActivo);
                            data = data.map(x => x.Descripcion) || [];

                            ARQUITECTO_COMBO = data;
                        } 
                        
                        SetItems(data, $ddl, TEXTO_SELECCIONE);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            async: false
        });
    }
}

function ProcesoClaveEsVital(filtro) {
    let retorno = false;
    $.ajax({
        type: "GET",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/GetProcesoClaveEsVital?filtro=${filtro}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                let flagValue = dataObject;
                retorno = flagValue;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return retorno;
}

//Cuestionario PAE

function scoreFormatter(value, row, index) {
    let selected0 = "", selected1 = "", selected2 = "", selected3 = "";
    switch (row.Score) {
        case SCORE_PAE.Cero:
            selected0 = "selected";
            break;
        case SCORE_PAE.Uno:
            selected1 = "selected";
            break;
        case SCORE_PAE.Dos:
            selected2 = "selected";
            break;
        case SCORE_PAE.Tres:
            selected3 = "selected";
            break;
    }
    let ddl = ` <select id="ddlScore${row.Id}" name="ddlScore${row.Id}" onchange='ddlScore_Change(${row.EntidadRelacionId}, ${row.Id})' class="form-control custom-select">\
                    <option value = "0" ${selected0}>0</option>\
                    <option value = "1" ${selected1}>1</option>\
                    <option value = "2" ${selected2}>2</option>\
                    <option value = "3" ${selected3}>3</option>\
                  </select >`;
    return ddl;
}

function ddlScore_Change(parentId, meId) {
    let ddlVal = $(`#ddlScore${meId}`).val();
    if (ddlVal !== "-1") {
        //Update question score
        $(`#tblRegistrosDetalle_${parentId}`).bootstrapTable('updateByUniqueId', {
            id: meId,
            row: {
                Score: parseInt(ddlVal)
            }
        });

        //Reload score section
        let data = $(`#tblRegistrosDetalle_${parentId}`).bootstrapTable("getData") || [];
        if (data.length > 0) {
            let resultado = CalcularEstandarBySeccion(parentId, data);
            $(`#txtInput${parentId}`).val(resultado);

            //Set clasificacion descripcion
            let clasificacion = CalcularClasificacionBySeccion();
            $("#spClasificacion").html(clasificacion);
            $("#ddlProcesoClave").trigger("change");

            //Set input seccion descripcion
            let descripcion = CalcularDescripcionBySeccion(resultado);
            $(`#spDescripcion${parentId}`).html(descripcion);
        }
    }
}

function CalcularEstandarBySeccion(id, data) {
    updatePreguntas(SECCIONES_CUESTIONARIO, id, data);
    let arrScore = data.map(x => x.Score);
    let resultado = 0;
    switch (id) {
        case 1:
            if (arrScore[0] === SCORE_PAE.Tres || arrScore[1] === SCORE_PAE.Tres)
                resultado = SCORE_PAE.Tres;
            else
                resultado = (arrScore[0] * 4 + arrScore[1] * 3 + arrScore[2] * 1 + arrScore[3] * 2 + arrScore[4] * 1 + arrScore[5] * 1 + arrScore[6] * 2 + arrScore[7] * 1) / 15;

            break;
        case 2:
            if (arrScore[0] === SCORE_PAE.Tres || arrScore[1] === SCORE_PAE.Tres)
                resultado = SCORE_PAE.Tres;
            else
                resultado = (arrScore[0] * 4 + arrScore[1] * 3 + arrScore[2] * 4 + arrScore[3] * 3 + arrScore[4] * 1 + arrScore[5] * 1 + arrScore[6] * 3 + arrScore[7] * 3 + arrScore[8] * 1 + arrScore[9] * 2) / 25;

            break;
        case 3:
            if (arrScore[0] === SCORE_PAE.Tres || arrScore[1] === SCORE_PAE.Tres)
                resultado = SCORE_PAE.Tres;
            else
                resultado = (arrScore[0] * 4 + arrScore[1] * 4 + arrScore[2] * 3 + arrScore[3] * 1 + arrScore[4] * 2 + arrScore[5] * 2 + arrScore[6] * 3 + arrScore[7] * 1) / 20;

            break;
        case 4:
            resultado = arrScore[0];
            break;
    }
    resultado = resultado.toFixed(2);
    return resultado;
}

function CalcularDescripcionBySeccion(resultado) {
    let result = "";
    if (resultado >= 2.5) {
        result = SECCION_CALCULO_DESCRIPCION.Alto;
    } else if (resultado >= 1.5 && resultado <= 2.49) {
        result = SECCION_CALCULO_DESCRIPCION.Medio;
    } else if (resultado >= 0.01 && resultado <= 1.49) {
        result = SECCION_CALCULO_DESCRIPCION.Bajo;
    } else {
        result = SECCION_CALCULO_DESCRIPCION.NA;
    }
    return result;
}

function CalcularClasificacionBySeccion() {
    let result = "";
    let input1 = parseFloat($("#txtInput1").val());
    let input2 = parseFloat($("#txtInput2").val());
    let input3 = parseFloat($("#txtInput3").val());
    let input4 = parseFloat($("#txtInput4").val());

    if (input1 >= 2.5 || input2 >= 2.5 || input3 >= 2.75 || input4 >= 2) {
        result = CLASIFICACION_DESCRIPCION.Restringido;
    } else if (input1 < 1.25 && input2 < 1.25 && input3 < 1.5 && input4 < 1) {
        result = CLASIFICACION_DESCRIPCION.Publico;
    } else {
        result = CLASIFICACION_DESCRIPCION.UsoInterno;
    }
    return result;
}

function listarRegistrosPae($tbl, url, id = null, codigoAPT = null, WithOutAction = true) {
    if (WithOutAction) waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tbl.bootstrapTable('destroy');
    $tbl.bootstrapTable({
        url: URL_API + "/Aplicacion/ConfiguracionPortafolio/" + url,
		ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        locale: 'es-SP',
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.id = id === null ? 0 : id;
            DATA_EXPORTAR.codigoAPT = codigoAPT;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.Activos = true;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            if (WithOutAction) waitingDialog.hide();
            var data = res;

            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
            if (WithOutAction) waitingDialog.hide();
            bootbox.alert("Se produjo un error al listar los registros");
        },
        onSort: function (name, order) {
            if (WithOutAction) waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            if (WithOutAction) waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onExpandRow: function (index, row, $detail) {
            listarRegistrosPae($('#tblRegistrosDetalle_' + row.Id), "ListarPreguntaPae", row.Id, codigoAPT);
        }
    });
}

function detailFormatter(index, row) {
    let html = String.Format(`<table id="tblRegistrosDetalle_{0}" data-mobile-responsive="true" data-toggle="table" data-unique-id="Id">
                            <thead>
                                <tr>
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="2%">#</th>
                                    <th data-field="Nombre" data-sortable="false" data-halign="center" data-valign="middle" data-align="left" data-width="1%">Código</th>
                                    <th data-field="Descripcion" data-sortable="false" data-halign="center" data-valign="middle" data-align="center" data-width="15%">Pregunta</th>
                                    <th data-formatter="scoreFormatter" data-field="Score" data-sortable="false" data-halign="center" data-valign="middle" data-align="center" data-width="5%">Puntaje</th>
                                </tr>
                            </thead>
                        </table>`, row.Id);
    return html;
}

function nombreFormatter(value, row, index) {
    let html = `<div class="row">
                    <div class="col-md-10">
                        <p><strong>${value}</strong> - ${row.Descripcion}</p>
                    </div>
                    <div class="col-md-2">
                        <input id="txtInput${row.Id}" class="form-control" type="text" name="txtInput${row.Id}" value="${row.SeccionCalculoStr}" disabled>
                    </div>
                </div>`;
    return html;
}

function cellStyle(value, row, index) {
    return {
        classes: "fondoSkyBlue"
    };
}

function RegistrarCuestionarioAplicacion() {
    let data = CrearObjCuestionario();

    $.ajax({
        url: URL_API + "/Aplicacion/ConfiguracionPortafolio/AddOrEditCuestionarioAplicacion",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    console.log(dataObject);
                }
            }
        },
        complete: function (data) {
            if (ControlarCompleteAjax(data))
                console.log("Retorno");
            else
                bootbox.alert("Sucedió un error con el servicio, cuestionario aplicación", function () { });
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function RegistrarAddOrEditCuestionario() {
    if ($("#formAddOrEditApp").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: `¿Estás seguro(a) que deseas registrar el cuestionario?.`,
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
                    $("#btnRegistrarCuestionario").button("loading");

                    let data = CrearObjCuestionario();

                    $.ajax({
                        url: URL_API + "/Aplicacion/ConfiguracionPortafolio/AddOrEditCuestionarioAplicacion",
                        type: "POST",
						beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(data),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Registrado correctamente.", TITULO_MENSAJE_CUESTIONARIO);
                                    EditarCuestionarioByCodigoAPT($("#txtCodigoApt").val());
                                }
                            }
                        },
                        complete: function (data) {
                            $("#btnRegistrarCuestionario").button("reset");
                            if (ControlarCompleteAjax(data))
                                console.log("Retorno");
                            else
                                bootbox.alert("Sucedió un error con el servicio", function () { });
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
            }
        });
    }
}

function CrearObjCuestionario() {
    let _id = $("#hdCuestionarioId").val();
    var data = {
        Id: _id,
        CodigoAPT: $("#txtCodigoApt").val(),
        GestorAplicacion: "",//$.trim($("#txtGestorApps").val()),
        Consultor: "", //$.trim($("#txtConsultor").val()),
        ConfidencialidadCalculo: $("#txtInput1").val(),
        IntegridadCalculo: $("#txtInput2").val(),
        DisponibilidadCalculo: $("#txtInput3").val(),
        PrivacidadCalculo: $("#txtInput4").val(),
        ConfidencialidadDescripcion: $("#spDescripcion1").text(),
        IntegridadDescripcion: $("#spDescripcion2").text(),
        DisponibilidadDescripcion: $("#spDescripcion3").text(),
        PrivacidadDescripcion: $("#spDescripcion4").text(),
        Clasificacion: $("#spClasificacion").text(),
        NivelCriticidad: $("#spNivelCriticidad").text(),
        CriticidadFinal: $("#spCriticidadFinal").text(),
        CuestionarioAplicacionDetalle: CrearObjListCuestionarioDetalle(_id)
    };

    return data;
}

function CrearObjListCuestionarioDetalle(id) {
    let data = [];
    let dataTmp = SECCIONES_CUESTIONARIO;
    $.each(dataTmp, function (i, item) {
        $.each(item.Preguntas, function (x, xtem) {
            data.push({
                //Id: $("#hdCuestionarioDetalleId").val(),
                CuestionarioAplicacionId: id,
                PreguntaId: xtem.Id,
                AlternativaSeleccionada: xtem.Score
            });
        });
    });

    return data;
}

function EditarCuestionarioByCodigoAPT(codigoAPT) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/GetCuestionarioByCodigoAPT?codigoAPT=${codigoAPT}`,
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "GET",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject;

                    $("#hdCuestionarioId").val(data.Id);
                    //$("#hdCuestionarioDetalleId").val(data.CuestionarioAplicacionDetalleId);
                    //$("#txtGestorApps").val(data.GestorAplicacion);
                    //$("#txtConsultor").val(data.Consultor);
                    $("#dpFechaElaboracion").val(data.FechaCreacionFormat);

                    $("#spDescripcion1").html(data.ConfidencialidadDescripcion);
                    $("#spDescripcion2").html(data.IntegridadDescripcion);
                    $("#spDescripcion3").html(data.DisponibilidadDescripcion);
                    $("#spDescripcion4").html(data.PrivacidadDescripcion);
                    $("#spClasificacion").html(data.Clasificacion);
                    $("#spNivelCriticidad").html(data.NivelCriticidad);
                    $("#spCriticidadFinal").html(data.CriticidadFinal);

                    let preguntas = dataObject.CuestionarioAplicacionDetalle;
                    if (preguntas !== null && preguntas.length > 0) {
                        $.each(SECCIONES_CUESTIONARIO, function (i, item) {
                            let pregs = preguntas.filter(x => x.CuestionarioId === item.Seccion);
                            item.Preguntas = pregs;
                        });
                    }
                }
            }
        },
        complete: function (data) {
            waitingDialog.hide();
            listarRegistrosPae($table, "ListarCuestionarioPae", null, codigoAPT);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function updatePreguntas(arr, filterValue, newValue) {
    for (var i in arr) {
        if (arr[i].Seccion === filterValue) {
            arr[i].Preguntas = newValue;
            break;
        }
    }
}

function irCambiarEstadoSolicitud(idCambio) {
    if (!ExisteAprobacionObservacionSolicitud()) {
        let Id = $("#hIdSolicitud").val();
        let titulo = idCambio === CAMBIO_ESTADO_SOLICITUD.Aprobar ? "aprobar" : "observar";
        if (idCambio === CAMBIO_ESTADO_SOLICITUD.Aprobar) {
            bootbox.confirm({
                title: TITULO_MENSAJE,
                message: `¿Estás seguro que deseas ${titulo} la solicitud?.`,
                buttons: SET_BUTTONS_BOOTBOX,
                callback: function (result) {
                    if (result !== null && result) {
                        CambiarEstadoSolicitudSub(Id,
                            idCambio,
                            TIPO_SOLICITUD_APP.CREACION,
                            "CambiarEstadoSolicitudAprobador",
                            "",
                            true,
                            URL_BANDEJA_REDIRECT
                        );
                    }
                }
            });
        } else {
            bootbox.addLocale('custom', locale);
            bootbox.prompt({
                title: TITULO_MENSAJE,
                message: `<p>¿Estas seguro que deseas ${titulo} la solicitud?, de ser asi por favor ingrese los comentarios al respecto:</p>`,
                inputType: 'textarea',
                rows: '5',
                locale: 'custom',
                callback: function (result) {
                    let data = result;
                    if (data !== null) {
                        if ($.trim(data) === "") {
                            toastr.error("Observación no debe estar vacío.", TITULO_MENSAJE);
                            return false;
                        }

                        if ($.trim(data).length > 500) {
                            toastr.error("Observación no debe superar los 500 carácteres.", TITULO_MENSAJE);
                            return false;
                        }

                        CambiarEstadoSolicitudSub(Id, idCambio, TIPO_SOLICITUD_APP.CREACION, "CambiarEstadoSolicitudAprobador", data, false);
                        CambiarEstadoSolicitudSub(Id, idCambio, TIPO_SOLICITUD_APP.CREACION, "CambiarEstado", data, true, URL_BANDEJA_REDIRECT);
                    }
                }
            });
        }
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, "La solicitud ya fue Aprobada/Observada por otro responsable, consulte la bandeja");
    }
}

function CambiarEstadoSolicitudSub(_id, _idCambio, _tipoSolicitud, _url, _comments = "", withAction = true, urlRedirect = "") {
    if (withAction) waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    let mensaje = _idCambio === CAMBIO_ESTADO_SOLICITUD.Aprobar ? "aprobó" : "observó";
    let data = {
        Id: _id,
        EstadoSolicitudId: _idCambio,
        Observacion: _comments,
        TipoSolicitudId: _tipoSolicitud,
        BandejaId: id_bandeja,
    };

    $.ajax({
        url: URL_API + `/Solicitud/${_url}`,
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    if (withAction) {
                        waitingDialog.hide();
                        toastr.success(`Se ${mensaje} correctamente`, TITULO_MENSAJE);
                    }
                }
            }
        },
        complete: function (data) {
            if (ControlarCompleteAjax(data)) {
                if ($.trim(urlRedirect) !== "") window.location.href = urlRedirect;
            }
            else
                bootbox.alert("Sucedió un error con el servicio", function () { });
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function ExisteAprobacionObservacionSolicitud() {
    let estado = true;
    let bandeja_id = id_bandeja;
    let solicitud_id = $("#hIdSolicitud").val();

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Solicitud/ExisteCambioEstadoSolicitudAprobadores?id_solicitud=${solicitud_id}&id_bandeja=${bandeja_id}`,
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

function CalculoPorcentajeCumplimientos(aplicacionId) {
    //let _flagPc = $("#hdEsPc").val();
    let _flagPc = $.trim($("#txtValorPC").val()) !== "" ? $.trim($("#txtValorPC").val()) : 1;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/CalculoPorcentajeEstandares?id_aplicacion=${aplicacionId}&flagPc=${_flagPc}`,
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    console.log(dataObject);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });
}

function CrearObjCalculoNivel() {
    let _aplicacionId = $("#hdAplicacionId").val() === "" ? null : parseInt($("#hdAplicacionId").val());
    //let _flagPc = $("#hdEsPc").val(); //Valor en duro
    //let _flagPc = $.trim($("#txtValorPC").val()) !== "" ? $.trim($("#txtValorPC").val()) : 1;
    let _so = $.trim($("#txtSO").val()) === "" ? NO_APLICA : $.trim($("#txtSO").val());
    let _hp = $.trim($("#txtHP").val()) === "" ? NO_APLICA : $.trim($("#txtHP").val());
    let _bd = $.trim($("#txtBD").val()) === "" ? NO_APLICA : $.trim($("#txtBD").val());
    let _fw = $.trim($("#txtFramework").val()) === "" ? NO_APLICA : $.trim($("#txtFramework").val());
    let _ncls = $.trim($("#txtNCLS").val()) === "" ? 0 : parseInt($.trim($("#txtNCLS").val()));
    //let l_01 = $.trim($("#txtL1").val()) !== "" ? $.trim($("#txtL1").val()) : 0.33;
    //let l_02 = $.trim($("#txtL2").val()) !== "" ? $.trim($("#txtL2").val()) : 0.25;
    //let _strL = `${l_01}|${l_02}`;

    //let m_01 = $.trim($("#txtM1").val()) !== "" ? $.trim($("#txtM1").val()) : 0.5;
    //let m_02 = $.trim($("#txtM2").val()) !== "" ? $.trim($("#txtM2").val()) : 0;
    //let _strM = `${m_01}|${m_02}`;

    //let _valorN = $.trim($("#txtValorN").val()) !== "" ? $.trim($("#txtValorN").val()) : 1;

    let data = {
        AplicacionId: _aplicacionId,
        SO: _so,
        HP: _hp,
        BD: _bd,
        FW: _fw,
        NLCS: _ncls
        //FlagPC: _flagPc,
        //StrL: _strL,
        //StrM: _strM,
        //ValorN: _valorN
    };

    return data;
}

function CalculoNivelCumplimientos() {
    $(".form-control").addClass("ignore"); //Sin validaciones
    $(".input-nivel").removeClass("ignore");

    let ncls = parseInt($("#txtNCLS").val());
    if (ncls <= 100) {
        if ($("#formAddOrEditApp").valid()) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            let data = CrearObjCalculoNivel();

            $.ajax({
                url: URL_API + "/Aplicacion/ConfiguracionPortafolio/CalculoPorcentajeEstandares",
				beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(data),
                dataType: "json",
                success: function (dataObject, textStatus) {
                    if (textStatus === "success") {
                        if (dataObject !== null) {
                            let data = dataObject;
                            $("#txtNCET").val(data.NCET);
                            $("#txtNCLS").val(data.NCLS);
                            $("#txtNCG").val(data.NCG);

                            waitingDialog.hide();
                            toastr.success("Niveles calculados correctamente", TITULO_MENSAJE);
                        }
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                }
            });
        }
    }
    else {
        $("#txtNCLS").val(0);
        toastr.warning("El Nivel de Cumplimiento de Seguridad no debe ser mayor a 100", TITULO_MENSAJE);
    }
}

function AddItemServidorAplicacion() {
    let $txtServidor = $("#txtNombreServidor");
    let newServer = $.trim($txtServidor.val());
    if (newServer !== "") {
        let item = $tblServidorAplicacion.bootstrapTable('getData').find(x => x.NombreServidor.toUpperCase() === newServer.toUpperCase()) || null;
        if (item === null) {

            let dataTmp = $tblServidorAplicacion.bootstrapTable('getData');
            let idx = 0;
            let ultId = dataTmp.length === 0 ? (1 * -1000) : dataTmp[dataTmp.length - 1].Id;
            ultId = ultId === null ? 0 : ultId;
            idx = ultId > 0 ? dataTmp.length * -1000 : ultId - 1000;

            $tblServidorAplicacion.bootstrapTable('append', {
                Id: idx,
                NombreServidor: newServer
            });

            $txtServidor.val("");
        }
    } else {
        toastr.error("Debes ingresar el nombre del servidor", TITULO_MENSAJE);
    }
}

function RemoveItemServidorAplicacion(Id) {
    if (!IDS_REMOVER_SERVIDOR.includes(Id)) IDS_REMOVER_SERVIDOR.push(Id);
    $tblServidorAplicacion.bootstrapTable('remove', {
        field: 'Id', values: [Id]
    });
}

function CrearObjServidorAplicacion() {
    let data = $tblServidorAplicacion.bootstrapTable('getData') || [];
    return data;
}

function RegistrarServidorAplicacion(_idAplicacion) {
    let data = {
        AplicacionId: _idAplicacion,
        ServidorDetalle: CrearObjServidorAplicacion(),
        IdsEliminarServidor: IDS_REMOVER_SERVIDOR.filter(x => x > 0) || []
    };

    $.ajax({
        url: URL_API + "/Aplicacion/ConfiguracionPortafolio/AddOrEditListServidorAplicacion",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    console.log(dataObject);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function accionesFormatter(value, row, index) {
    //let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    //let type_icon = row.Activo ? "check" : "unchecked";
    let btn1 = `<a href="javascript:RemoveItemServidorAplicacion(${row.Id})" title="Remover item"><i class="glyphicon glyphicon-trash"></i></a>`;

    return btn1;
}

function CambiarEstadoRegistro(id, estadoActual) {
    let mensaje = "eliminar";
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
                    url: URL_API + `/Aplicacion/ConfiguracionPortafolio/CambiarEstadoServidorAplicacion?id=${id}&estadoActual=${estadoActual}`,
					beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    type: "GET",
                    dataType: "json",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                waitingDialog.hide();
                                toastr.success("Se eliminó correctamente", TITULO_MENSAJE);
                                listarRegistrosPae($tblServidorAplicacion, "ListarServidorAplicacion", null, $.trim($("#txtCodigoApt").val()));
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

function ExisteServidorByCodigoApt(servidor) {
    let estado = false;
    let _codigoAPT = $.trim($("#txtCodigoApt").val());
    let _nombreServidor = servidor;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/ExisteServidorByCodigoApt?codigoAPT=${_codigoAPT}&nombreServidor=${_nombreServidor}`,
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

function ExisteClaveTecnologia($txtClave) {
    let estado = false;
    let _clave = encodeURIComponent($txtClave.val());
    let _id = null;
    let _flagActivo = 1;

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Tecnologia/ExisteClaveTecnologia?clave=${_clave}&id=${_id}&flagActivo=${_flagActivo}`,
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

function ObtenerUltimoCodigoAptByParametro() {
    let retorno = "";
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/GetUltimoCodigoAptPAE`,
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
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

function setToolTipItem(item) {
    if (item.FlagMostrarCampo) {
        if (MATRICULA_RESPONSABLES.includes(item.Descripcion)) {
            $(`#${item.Codigo}`).parent().parent().parent().children(":first").children(":first").attr('title', $.trim(item.value) !== "" ? $.trim(item.value) : "...");
        } else {
            $(`#${item.Codigo}`).parent().parent().children(":first").children(":first").attr('title', $.trim(item.value) !== "" ? $.trim(item.value) : "...");
        }
    } else {
        if (item.Codigo !== null && $.trim(item.Codigo) !== "") {
            let rules = $(`#${item.Codigo}`).rules();
            if (!$.isEmptyObject(rules)) {
                $(`#${item.Codigo}`).rules("remove");
            } 
            if (IDS_CAMPOS_ESPECIALES.includes(item.Id)) {
                $(`#${item.Codigo}`).parent().parent().parent().hide();
            } else {
                $(`#${item.Codigo}`).parent().parent().hide();
            }
        }
    }
}

function GetNewFieldsByFiltro(tipoFlujoId, _codigoAPT) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/GetNewFieldsPortafolioByFiltro?idTipoFlujo=${tipoFlujoId}&codigoAPT=${_codigoAPT}`,
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let lData = dataObject;
                    if (lData) {
                        cargarNewFields(lData);
                    }
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function cargarNewFields(ldata) {
    var posField = 1;
    //clean divs
    $(".divNewFields").empty();
    $(".rowNewFields").hide();

    if (ldata && ldata.length > 0) {
        $.each(ldata, function (i, item) {
            if (item.FlagNuevo && item.FlagMostrarCampo) {
                if (posField === 1) $(".rowNewFields").show();
                setDivNewFields(item, posField);
                posField = posField + 1;
            }
        });
    }

    //TODO
    cargarListBoxNuevos(DATA_LISTBOX_NUEVO, ldata);
}

function getDivHtmlByTipoInput(item, esPar) {
    let divField = "";
    switch (item.TipoInputId) {
        case TIPO_INPUT_ID.TextBox:
            if (esPar) {
                divField = `<div class="row">
                              <div class="col-md-6">
                               <div class="col-md-5">
                                ${item.Descripcion}
                                 <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="${item.value}"></span>
                                </div>
                                <div class="col-md-7">
                                       <input id="${item.Codigo}" name="${item.Codigo}" value="${item.ValorCampo}" type="text" class="form-control input-new-field" />
                                </div>
                               </div>
                            </div>`;
            } else {
                divField = `<div class="col-md-6">
                                <div class="col-md-4">
                                 ${item.Descripcion}
                                 <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="${item.value}"></span>
                                </div>
                                <div class="col-md-7">
                                       <input id="${item.Codigo}" name="${item.Codigo}" value="${item.ValorCampo}" type="text" class="form-control input-new-field" />
                                </div>
                                <div class="col-md-1"></div>
                            </div>`;
            }
            
            break;
        case TIPO_INPUT_ID.ListBox:
            if (esPar) {
                divField = `<div class="row">
                              <div class="col-md-6">
                               <div class="col-md-5">
                                ${item.Descripcion}
                                 <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="${item.value}"></span>
                                </div>
                                <div class="col-md-7">
                                       <select id="${item.Codigo}" name="${item.Codigo}" class="form-control input-new-field">
                                            <option value="-1">-- Seleccione --</option>
                                       </select>
                                </div>
                               </div>
                            </div>`;
            } else {
                divField = `<div class="col-md-6">
                                <div class="col-md-4">
                                 ${item.Descripcion}
                                 <span class="icon icon-question-circle-o" data-toggle="tooltip" data-placement="right" title="${item.value}"></span>
                                </div>
                                <div class="col-md-7">
                                       <select id="${item.Codigo}" name="${item.Codigo}" class="form-control input-new-field">
                                            <option value="-1">-- Seleccione --</option>
                                       </select>
                                </div>
                                <div class="col-md-1"></div>
                            </div>`;
            }
           
            break;
    }
    
    return divField;
}

function setDivNewFields(item, pos) {
    let divField = "";
    let posFake = pos - 1;
    if (posFake % 2 === 0) {
        divField = getDivHtmlByTipoInput(item, true);
        $(`.divNewFields`).append(divField);
    } else {
        divField = getDivHtmlByTipoInput(item, false);
        $(`.divNewFields`).children().last().append(divField);
    }
    cargarReglas(item);
}

function cargarReglas(item) {
    if (item !== null) {
        if (item.FlagObligatorio) {
            $(`#${item.Codigo}`).rules("remove");
            switch (item.TipoInputId) {
                case TIPO_INPUT_ID.TextBox:
                    $(`#${item.Codigo}`).rules("add", {
                        requiredSinEspacios: true,
                        messages: {
                            requiredSinEspacios: String.Format("Debes ingresar {0}.", "un valor")
                        }
                    });
                    break;
                case TIPO_INPUT_ID.ListBox:
                    $(`#${item.Codigo}`).rules("add", {
                        requiredSelect: true,
                        messages: {
                            requiredSelect: "Debes seleccionar un item."
                        }
                    });
                    break;
            }
        }
    }
}

function cargarTooltips(ldata) {
    if (ldata && ldata.length > 0) {
        $.each(ldata, function (i, item) {
            if (!item.FlagNuevo) {
                setToolTipItem(item);
            }
        });
    }
    NOMBRE_CAMPO_USUARIO_AUTORIZADOR = $("#divTitleUsuarioAutorizador").html();
}

function InitUpload($inputText, classInput, btnDownload = null, btnRemove = null) {
    var inputs = document.querySelectorAll(`.${classInput}`);
    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener('change', function (e) {
            var fileName = '';
            if (this.files && this.files.length > 1) {
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            } else {
                if (this.files && this.files.length == 1) {
                    if (btnDownload != null) btnDownload.show();
                    if (btnRemove != null) btnRemove.show();
                } else {
                    if (btnDownload != null) btnDownload.hide();
                    if (btnRemove != null) btnRemove.hide();
                }
                fileName = e.target.value.split('\\').pop();
            }

            if (fileName)
                $inputText.val(fileName);
            else
                label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
}

function UploadAllFiles(_idEntidad) {
    let archivoId = "";

    archivoId = $("#hdArchivo1Id").val() === "" ? 0 : parseInt($("#hdArchivo1Id").val());
    if ((archivoId === 0 && $("#txtCheckList").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
        if (archivoId === 0) {
            UploadFile($("#flCheckList"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.CHECKLIST);
        } else {
            let fileName = $.trim($("#txtCheckList").val());
            if (fileName === TEXTO_SIN_ARCHIVO) { //Limpiando el file a null
                UploadFile($("#flCheckList"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.CHECKLIST);
            } else if (!(fileName === NOMBRE_FILE_CHECKLIST)) { //Actualiza el nuevo archivo
                UploadFile($("#flCheckList"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.CHECKLIST);
            }
        }
    }

    let flagAplica = $("#ddlFlagAplicaCheckList").prop("checked");
    archivoId = $("#hdArchivo2Id").val() === "" ? 0 : parseInt($("#hdArchivo2Id").val());
    if (!flagAplica) {
        if ((archivoId === 0 && $("#txtConformidad").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
            if (archivoId === 0) {
                UploadFile($("#flConformidad"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.CONFORMIDAD);
            } else {
                let fileName = $.trim($("#txtConformidad").val());
                if (fileName === TEXTO_SIN_ARCHIVO) { //Limpiando el file a null
                    UploadFile($("#flConformidad"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.CONFORMIDAD);
                } else if (!(fileName === NOMBRE_FILE_CONFORMIDAD)) { //Actualiza el nuevo archivo
                    UploadFile($("#flConformidad"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.CONFORMIDAD);
                }
            }
        }
    } else {
        UploadFile($("#flConformidad"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.CONFORMIDAD);
    }

    archivoId = $("#hdArchivo3Id").val() === "" ? 0 : parseInt($("#hdArchivo3Id").val());
    if ((archivoId === 0 && $("#txtMatriz").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
        if (archivoId === 0) {
            UploadFile($("#flMatriz"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.MATRIZ);
        } else {
            let fileName = $.trim($("#txtMatriz").val());
            if (fileName === TEXTO_SIN_ARCHIVO) { //Limpiando el file a null
                UploadFile($("#flMatriz"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.MATRIZ);
            } else if (!(fileName === NOMBRE_FILE_MATRIZ)) { //Actualiza el nuevo archivo
                UploadFile($("#flMatriz"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.MATRIZ);
            }
        }
    }

    let flagAplicaMatriz = $("#ddlFlagAplicaMatriz").prop("checked");
    archivoId = $("#hdArchivo4Id").val() === "" ? 0 : parseInt($("#hdArchivo4Id").val());
    if (!flagAplicaMatriz) {
        if ((archivoId === 0 && $("#txtConformidadMatriz").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
            if (archivoId === 0) {
                UploadFile($("#flConformidadMatriz"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.CONFORMIDAD_MATRIZ);
            } else {
                let fileName = $.trim($("#txtConformidadMatriz").val());
                if (fileName === TEXTO_SIN_ARCHIVO) { //Limpiando el file a null
                    UploadFile($("#flConformidadMatriz"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.CONFORMIDAD_MATRIZ);
                } else if (!(fileName === NOMBRE_FILE_CONFORMIDAD_MATRIZ)) { //Actualiza el nuevo archivo
                    UploadFile($("#flConformidadMatriz"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.CONFORMIDAD_MATRIZ);
                }
            }
        }
    } else {
        UploadFile($("#flConformidadMatriz"), CODIGO_INTERNO, _idEntidad, archivoId, true, "", REF_FILES.CONFORMIDAD_MATRIZ);
    }
}

function InitInputFiles() {
    InitUpload($('#txtCheckList'), 'inputCheckList');
    InitUpload($('#txtConformidad'), 'inputConformidad');
    InitUpload($('#txtMatriz'), 'inputMatriz');
    InitUpload($('#txtConformidadMatriz'), 'inputConformidadMatriz');
    //InitUpload($('#txtNomArchivo'), 'inputfile', $('#btnDescargarFile'), $('#btnEliminarFile'));
    InitUpload($('#txtNomArchivo'), 'inputfile', null, $('#btnEliminarFile'));
}

function getFiles(dataFiles) {
    if (dataFiles !== null && dataFiles.length > 0) {
        $.each(dataFiles, function (i, item) {
            let refID = parseInt(item.NombreRef);
            switch (refID) {
                case REF_FILES.CHECKLIST:
                    NOMBRE_FILE_CHECKLIST = item.Nombre;
                    $("#hdArchivo1Id").val(item.Id);
                    $("#txtCheckList").val(item.Nombre);
                    if (item.Nombre !== TEXTO_SIN_ARCHIVO) $(".file-options1").show();

                    break;
                case REF_FILES.CONFORMIDAD:
                    NOMBRE_FILE_CONFORMIDAD = item.Nombre;
                    $("#hdArchivo2Id").val(item.Id);
                    $("#txtConformidad").val(item.Nombre);
                    if (item.Nombre !== TEXTO_SIN_ARCHIVO) $(".file-options2").show();
                    //$("#ddlFlagAplicaCheckList").prop("checked", false);
                    //$("#ddlFlagAplicaCheckList").trigger("change");

                    break;
                case REF_FILES.MATRIZ:
                    NOMBRE_FILE_MATRIZ = item.Nombre;
                    $("#hdArchivo3Id").val(item.Id);
                    $("#txtMatriz").val(item.Nombre);
                    if (item.Nombre !== TEXTO_SIN_ARCHIVO) $(".file-options3").show();

                    break;
                case REF_FILES.CONFORMIDAD_MATRIZ:
                    NOMBRE_FILE_CONFORMIDAD_MATRIZ = item.Nombre;
                    $("#hdArchivo4Id").val(item.Id);
                    $("#txtConformidadMatriz").val(item.Nombre);
                    if (item.Nombre !== TEXTO_SIN_ARCHIVO) $(".file-options4").show();
                    //$("#ddlFlagAplicaMatriz").prop("checked", false);
                    //$("#ddlFlagAplicaMatriz").trigger("change");

                    break;
            }
        });
    }
}

function DescargarArchivo(refFile) {
    let id = 0;
    let $inputText = null;
    switch (refFile) {
        case REF_FILES.CHECKLIST:
            id = $("#hdArchivo1Id").val();
            $inputText = $("#txtCheckList");
            break;
        case REF_FILES.CONFORMIDAD:
            id = $("#hdArchivo2Id").val();
            $inputText = $("#txtConformidad");
            break;
        case REF_FILES.MATRIZ:
            id = $("#hdArchivo3Id").val();
            $inputText = $("#txtMatriz");
            break;
        case REF_FILES.CONFORMIDAD_MATRIZ:
            id = $("#hdArchivo4Id").val();
            $inputText = $("#txtConformidadMatriz");
            break;
        case REF_FILES.SOLICITUD_MODIFICACION:
            id = $("#hIdSolicitud").val();
            $inputText = $("#txtNomArchivo");
    }

    switch (refFile) {
        case REF_FILES.CHECKLIST:
        case REF_FILES.CONFORMIDAD:
        case REF_FILES.MATRIZ:
        case REF_FILES.CONFORMIDAD_MATRIZ:
            DownloadFile(id, $inputText, TITULO_MENSAJE);
            break;
        case REF_FILES.SOLICITUD_MODIFICACION:
            DownloadFileSolicitud(id, $inputText, TITULO_MENSAJE);
            break;
    }
}

function DownloadFileSolicitud(id, $inputFile, titulo) {
    let archivo = $inputFile.val();

    if (archivo === TEXTO_SIN_ARCHIVO) {
        bootbox.alert({
            size: "small",
            title: titulo,
            message: "No archivo para descargar.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
        return false;
    }
    //URL_API + "/Solicitud"
    let url = `${URL_API}/Solicitud/Download?id=${id}`;

    window.location.href = url;
}

function EliminarArchivo(refFile) {
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: String.Format("¿Estás seguro(a) que deseas {0} el archivo?", "eliminar"),
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            result = result || null;
            if (result !== null && result) {
                switch (refFile) {
                    case REF_FILES.CHECKLIST:
                        $("#txtCheckList").val(TEXTO_SIN_ARCHIVO);
                        $("#flCheckList").val("");
                        $(".file-options1").hide();
                        break;
                    case REF_FILES.CONFORMIDAD:
                        $("#txtConformidad").val(TEXTO_SIN_ARCHIVO);
                        $("#flConformidad").val("");
                        $(".file-options2").hide();
                        break;
                    case REF_FILES.MATRIZ:
                        $("#txtMatriz").val(TEXTO_SIN_ARCHIVO);
                        $("#flMatriz").val("");
                        $(".file-options3").hide();
                        break;
                    case REF_FILES.CONFORMIDAD_MATRIZ:
                        $("#txtConformidadMatriz").val(TEXTO_SIN_ARCHIVO);
                        $("#flConformidadMatriz").val("");
                        $(".file-options4").hide();
                        break;
                    case REF_FILES.SOLICITUD_MODIFICACION:
                        $("#txtNomArchivo").val(TEXTO_SIN_ARCHIVO);
                        $("#flArchivo").val("");
                        $(".file-options5").hide();
                        break;
                }
                toastr.success("Se eliminó correctamente", TITULO_MENSAJE);
            }
        }
    });
}

function GetDataNewInputs() {
    var arrApi = [];
    //inputs
    var $arrInputs = $("input.input-new-field");
    if ($arrInputs && $arrInputs.length > 0) {
        for (let i = 0; i < $arrInputs.length; i++) {
            let item = {
                Id: $arrInputs[i].name,
                Valor: $arrInputs[i].value
            };
            arrApi.push(item);
        }
    }
    //selects
    let $arrSelects = $("select.input-new-field");
    if ($arrSelects && $arrSelects.length > 0) {
        for (let i = 0; i < $arrSelects.length; i++) {
            let item = {
                Id: $arrSelects[i].name,
                Valor: $arrSelects[i].value
            };
            arrApi.push(item);
        }
    }

    return arrApi;
}

function InitAutocompleteResponsable($textBox, $ddl, $txtReceptor1, $txtReceptor2) {
    $textBox.keyup(function () {
        if ($ddl && $ddl.val() !== "-1" && $ddl.val().toUpperCase().includes("TRIBU")) {
            $txtReceptor1.val($.trim($textBox.val()));
            $txtReceptor2.val($.trim($textBox.val()));
            //$txtReceptor3.val($.trim($textBox.val()));
        }
    });
}

function bhAutocompleteGestor($textBox, $txtReceptor) {
    $textBox.keyup(function () {
        $txtReceptor.val($.trim($textBox.val()));
    });
}

function bhAutocompleteSquad($textBox, $txtReceptor) {
    $textBox.keyup(function () {
        $txtReceptor.val($.trim($textBox.val()));
    });    
}

function InitAutocompletarBuilderUnidad($searchBox, $IdBox, $container, urlController, filtroPadre) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term, filtroPadre);

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

function VIT(typeInput, valor) {
    var retorno = false;
    if (typeInput === TIP.TextBox) {
        retorno = valor && $.trim(valor) !== "";
    } else if (typeInput === TIP.ListBox) {
        retorno = valor && valor !== "-1";
    }
    return retorno;
}

function validarRegistroMinimo(idFlujoRegistro, data) {
    var retorno = false;
    switch (idFlujoRegistro) {
        case TIPO_FLUJO_PORTAFOLIO.FNA:
            if (VIT(TIP.ListBox, data.GerenciaCentral) && VIT(TIP.ListBox, data.Division) && VIT(TIP.ListBox, data.Area)
                && VIT(TIP.TextBox, data.Unidad) /*TODO*/) {
                retorno = true;
            }



            break;
        case TIPO_FLUJO_PORTAFOLIO.PAE:



            break;
    }

    return retorno;
}

function InitAutocompletarEstandarBuilder($searchBox, $IdBox, $container, $IdEstado, urlController, SubdominioListId, SoPcUsuarioListId = "") {
    $searchBox.autocomplete({
        minLength: 2,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term), SubdominioListId, SoPcUsuarioListId);

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
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                $IdEstado.val(ui.item.EstadoId !== null ? ui.item.EstadoId : "0");
            } 
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Descripcion + "</font></a>").appendTo(ul);
    };
}

function setColorEstandar($idEstado, $textArea) {
    let intEstadoId = parseInt($idEstado.val());
    switch (intEstadoId) {
        case TECNOLOGIA_ESTADO_ID.Vigente:
            $textArea.removeClass();
            $textArea.addClass("form-control");
            $textArea.addClass("std");
            $textArea.addClass("green-color");
            break;
        case TECNOLOGIA_ESTADO_ID.Deprecado:
            $textArea.removeClass();
            $textArea.addClass("form-control");
            $textArea.addClass("std");
            $textArea.addClass("yellow-color");
            break;
        case TECNOLOGIA_ESTADO_ID.Obsoleto:
            $textArea.removeClass();
            $textArea.addClass("form-control");
            $textArea.addClass("std");
            $textArea.addClass("red-color");
            break;
    }
}

function irBuscadorCodigos() {
    LimpiarValidateErrores($("#formBuscadorCodigo"));
    $("#txtPrimeraLetra").val("");
    SetItems([], $("#ddlCodigosDisponibles"), TEXTO_SELECCIONE);
    OpenCloseModal($("#mdBuscadorCodigos"), true);
}

function validarFormBuscadorCodigos() {
    $.validator.addMethod("requiredOnlyLetters", function (value, element) {
        return this.optional(element) || /^[a-z]+$/i.test(value);
    });

    $("#formBuscadorCodigo").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtPrimeraLetra: {
                requiredSinEspacios: true,
                //requiredOnlyLetters: true
            },
            ddlCodigosDisponibles: {
                requiredSelect: true
            }
        },
        messages: {
            txtPrimeraLetra: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la primera letra o dígito"),
                //requiredOnlyLetters: String.Format("Debes ingresar {0}.", "una letra")
            },
            ddlCodigosDisponibles: {
                requiredSelect: "Debes seleccionar un código de interfaz."
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtPrimeraLetra" || element.attr('name') === "dpFechaCreacion") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function BuscarCodigosInterfazDisponible() {
    $("#ddlCodigosDisponibles").addClass("ignore");
    if ($("#formBuscadorCodigo").valid()) {
        let Id = $("#hdAplicacionId").val() === "" ? 0 : $("#hdAplicacionId").val();
        let caracter = $("#txtPrimeraLetra").val();
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: URL_API_VISTA + `/ObtenerCodigoInterfazDisponibles?caracter=${caracter}&id=${Id}`,
			beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        SetItems(dataObject, $("#ddlCodigosDisponibles"), TEXTO_SELECCIONE);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            async: false
        });
    }
}

function SeleccionarCodigoInterfaz() {
    $("#ddlCodigosDisponibles").removeClass("ignore");
    if ($("#formBuscadorCodigo").valid()) {
        let codigo = $("#ddlCodigosDisponibles").val();

        if (codigo !== "" & codigo !== null) {
            $("#txtCodigoInterfaz").val(codigo);

            OpenCloseModal($("#mdBuscadorCodigos"), false);
            $("#txtPrimeraLetra").val("");
            SetItems([], $("#ddlCodigosDisponibles"), TEXTO_SELECCIONE);
        }
    }
}

function GetDataSolicitudByTipo(_idTipoSolicitud) {
    let idSolicitud = ($("#hIdSolicitud").val() === "") ? 0 : parseInt($("#hIdSolicitud").val());
    switch (_idTipoSolicitud) {
        case TIPO_SOLICITUD_APP.CREACION:
            $(".all-sol").hide();
            $(".detail-sol-creacion").show();
            break;
        case TIPO_SOLICITUD_APP.MODIFICACION:
            $(".all-sol").hide();
            $(".detail-sol-modificacion").show();
            break;
    }

    if (VISTA_ID === VISTA_GESTION_APP.CATALOGO) {
        $(".all-sol").addClass("bloq-element");
    }

    if (idSolicitud !== 0) {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: URL_API + `/Solicitud/GetSolicitudById?Id=${idSolicitud}`,
			beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        let data = dataObject;

                        if (_idTipoSolicitud === TIPO_SOLICITUD_APP.CREACION) {
                            $("#txtComentarioSolicitud").val(data.Observaciones || "");
                        } else if (_idTipoSolicitud === TIPO_SOLICITUD_APP.MODIFICACION) {
                            $("#txtMotivoModificacion").val(data.Observaciones || ""); 
                            if (data.NombreArchivos !== null && data.NombreArchivos !== "") {
                                $("#txtNomArchivo").val(data.NombreArchivos);
                                $("#btnDescargarFile").show();
                                $("#btnEliminarFile").show();
                            }
                        }
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            async: false
        });
    }
}