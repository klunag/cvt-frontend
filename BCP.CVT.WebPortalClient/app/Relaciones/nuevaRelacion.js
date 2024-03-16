var $tableTecnologia = $("#tblRegistroTecnologia");
var AVISO_PROCESO_2DO_PLANO = "Hay un proceso en segundo plano ejecutándose, cierre la ventana y vuelva a intertarlo";
var URL_API_VISTA = URL_API + "/Relacion";
var DATA_TECNOLOGIA = [];
var DATA_APLICACION = [];
var DATA_EQUIPO = [];
var DATA_EQUIPO_TECNOLOGIA = [];
var DATA_TECNOLOGIA_DESMARCADO = [];
var DATA_RELEVANCIA = [];
var DATA_TIPO_ACTUAL = 0;
var RELACION_DETALLE_EDIT = [];
var DATA_ESTADO = [];
var ESTADO_RELACION = { PENDIENTE: 1, APROBADO: 2, DESAPROBADO: 3, PENDIENTEELIMINACION: 0, ELIMINADO: 5 };
var ESTADOS_APOYO = [ESTADO_RELACION.PENDIENTE, ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO, ESTADO_RELACION.PENDIENTEELIMINACION, ESTADO_RELACION.ELIMINADO];
var ESTADOS_APOYO_PENDIENTE = [ESTADO_RELACION.PENDIENTE, ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO];
var ESTADOS_APOYO_PENDIENTE_MODAL = [ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO];
var ESTADOS_APOYO_PENDIENTEELIMINACION = [ESTADO_RELACION.PENDIENTEELIMINACION, ESTADO_RELACION.ELIMINADO, ESTADO_RELACION.APROBADO];
var ESTADOS_APOYO_PENDIENTEELIMINACION_MODAL = [ESTADO_RELACION.ELIMINADO, ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO];
var DATA_EXPORTAR = {};
var RELEVANCIA_ALTA = 1;
var FLAG_ACTIVO_TECNOLOGIA = 0;

const TIPO = { TIPO_EQUIPO: "1", TIPO_TECNOLOGIA: "2", TIPO_APLICACION: "3", TIPO_SERVICIONUBE: "4" };
const ESTADO_TECNOLOGIA = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
const URL_AUTOCOMPLETE_EQUIPO = { DEFAULT: "GetEquipoByFiltro", SERVICIONUBE: "GetEquipoServicioNubeByFiltro", FILTROS: "GetEquipoFiltros" };
const TITULO_MENSAJE = "Relación de Tecnología";
const MENSAJE_RELACION_TRUE = "Este {0} le pertenece a la aplicación";
const MENSAJE_RELACION_FALSE = "Este {0} no le pertenece a la aplicación, solo se usa para temas específicos";
const URL_REDIRECT_SUCCESS = "/Relacion/Bandeja";
const SUBDOMINIO_IDS = {
    LP_FW: "14",
    BROWSER: "7",
    SA: "32",
    SW: "45",
    MIDDLEWARE: "63",
    BD_R: "69",
    BD_NR: "68",
    DM_ETL: "60|111",
    IDE_CE: "13",
    DEPLOYMENT: "81"
};
const SIDE_FILTER_IDS = {
    SERVIDOR: 1,
    SA: 2,
    SW: 3,
    BD_R: 4,
    BD_NR: 5,
    BROWSER: 6,
    MIDDLEWARE: 7,
    DM_ETL: 8,
    LP_FW: 9,
    IDE_CE: 10,
    DEPLOYMENT: 11,
    SERVICIO_NUBE: 12,
    OTRAS_TECNOLOGIAS: 13
};
const SIDE_FILTER_DATA = [
    {
        id: SIDE_FILTER_IDS.SERVIDOR,
        idHtml: "sideFil01",
        title: "Equipo",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        subdominioIds: ""
    },
    {
        id: SIDE_FILTER_IDS.SA,
        idHtml: "sideFil02",
        title: "Servidor de aplicaciones",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        subdominioIds: SUBDOMINIO_IDS.SA
    },
    {
        id: SIDE_FILTER_IDS.SW,
        idHtml: "sideFil03",
        title: "Servidor web",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        subdominioIds: SUBDOMINIO_IDS.SW
    },
    {
        id: SIDE_FILTER_IDS.BD_R,
        idHtml: "sideFil04",
        title: "Base de datos relacional",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        subdominioIds: SUBDOMINIO_IDS.BD_R
    },
    {
        id: SIDE_FILTER_IDS.BD_NR,
        idHtml: "sideFil05",
        title: "Base de datos no relacional",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        subdominioIds: SUBDOMINIO_IDS.BD_NR
    },
    {
        id: SIDE_FILTER_IDS.BROWSER,
        idHtml: "sideFil06",
        title: "Navegador web",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.TECNOLOGIA,
        subdominioIds: SUBDOMINIO_IDS.BROWSER
    },
    {
        id: SIDE_FILTER_IDS.MIDDLEWARE,
        idHtml: "sideFil07",
        title: "Middleware",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        subdominioIds: SUBDOMINIO_IDS.MIDDLEWARE
    },
    {
        id: SIDE_FILTER_IDS.DM_ETL,
        idHtml: "sideFil08",
        title: "Data Mapping y ETL",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        subdominioIds: SUBDOMINIO_IDS.DM_ETL
    },
    {
        id: SIDE_FILTER_IDS.LP_FW,
        idHtml: "sideFil09",
        title: "Lenguaje de programación y framework de desarrollo",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.TECNOLOGIA,
        subdominioIds: SUBDOMINIO_IDS.LP_FW
    },
    {
        id: SIDE_FILTER_IDS.IDE_CE,
        idHtml: "sideFil10",
        title: "IDEs y editores de código",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.TECNOLOGIA,
        subdominioIds: SUBDOMINIO_IDS.IDE_CE
    },
    {
        id: SIDE_FILTER_IDS.DEPLOYMENT,
        idHtml: "sideFil11",
        title: "Despliegue",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.EQUIPO,
        subdominioIds: SUBDOMINIO_IDS.DEPLOYMENT
    },
    {
        id: SIDE_FILTER_IDS.SERVICIO_NUBE,
        idHtml: "sideFil12",
        title: "Servicio en la nube",
        description: "Relaciona un recurso aprovisionado",
        active: true,
        idTipoRelacion: TIPO_RELACION.SERVICIO_NUBE,
        subdominioIds: ""
    },
    {
        id: SIDE_FILTER_IDS.OTRAS_TECNOLOGIAS,
        idHtml: "sideFil13",
        title: "Tecnologías",
        description: "Relaciona un recurso aprovisionado",
        active: false,
        idTipoRelacion: TIPO_RELACION.TECNOLOGIA,
        subdominioIds: ""
    }
];

$(function () {
    InitTables();
    InitAutocompletes();
    InitValidateMain();
    InitChangeSideFilter();
    CargarCombos();

    //FormatoCheckBox($("#divFlagRelacion"), "ddlFlagRelacionCb");
    //$("#ddlFlagRelacionCb").change(FlagRelacion_Change);

    InitNewOrEdit();

    setDefaultHd($("#txtAplicacion"), $("#hdAplicacionId"));
    InitHdTecnologia($("#txtTecnologia"), $("#hdTecnologiaId"));
    $("#btnRegistrar").click(RegistrarAddOrEdit);
});
function GetValueRadio(){
    let radioValue = $("input[name='optradio']:checked").val();
    return radioValue === "1";
}

function SetValueRadio(value) {
    if (value) {
        $("#rbItem01").prop("checked", value);
        $("#rbItem02").prop("checked", !value);
    } else {
        $("#rbItem01").prop("checked", value);
        $("#rbItem02").prop("checked", !value);
    }
}

function InitNewOrEdit() {
    if (RELACION_ID === 0) {
        InitViewSection(SIDE_FILTER_IDS.SERVIDOR);
    } else {
        $(".list-group").addClass("bloq-element");
        EditRegistro(RELACION_ID);
    }
}

function InitHdTecnologia($textBox, $hdId) {
    $textBox.keyup(function () {
        if ($.trim($(this).val()) === "") {
            $hdId.val("0");
            $("#txtDominio, #txtSubdominio, #txtTipoTecnologia, #txtFechaFinSoporte").val("");
        }
    });
}

function FlagRelacion_Change() {
    let state = $(this).prop("checked");
    let msgFormat = state ? MENSAJE_RELACION_TRUE : MENSAJE_RELACION_FALSE;
    let idTipoRelacion = parseInt($("#hdTipoRelacionId").val());
    msgFormat = String.Format(msgFormat, idTipoRelacion === TIPO_RELACION.EQUIPO ? "servidor" : "servicio en la nube");
    $("#spFlagRelacion").html(msgFormat);
}

function InitTables() {
    $tableTecnologia.bootstrapTable("destroy");
    $tableTecnologia.bootstrapTable({ data: [] });
}

function InitAutocompletes() {
    InitAutocompletarAplicacion($("#txtAplicacion"), $("#hdAplicacionId"), ".aplicacionContainer", 0);
    //InitAutocompletarAplicacion($("#txtAppBase"), $("#hdAppBaseId"), ".appBaseContainer", 0); //App Base
    InitAutocompletarAplicacion($("#txtAppVinculo"), $("#hdAppVinculoId"), ".appVinculoContainer", 1); //App Vinculo
    InitAutocompletarTecnologia($("#txtTecnologia"), $("#hdTecnologiaId"), ".tecnologiaContainer");
    InitAutocompletarEquipo($("#txtEquipo"), $("#hdEquipoId"), ".equipoContainer", URL_AUTOCOMPLETE_EQUIPO.DEFAULT);
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
                    SetItems(dataObject.TipoEquipo_2, $("#ddlTipoEquipo"), TEXTO_SELECCIONE);
                    //SetItems2(dataObject.Estado, $("#cbEstadoFiltro"), TEXTO_TODOS);
                    //SetItems(dataObject.Dominio, $("#cbDomTec"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.MotivoEliminacion, $("#ddlMotivo"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Subdominio, $("#cbSubdominioFiltro"), TEXTO_TODOS);
                    DATA_ESTADO = dataObject.Estado;
                    DATA_RELEVANCIA = dataObject.Relevancia;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function InitChangeSideFilter() {
    $(".list-group-item").click(function () {
        $(".list-group-item").removeClass("active");
        $(this).addClass("active");

        let listId = $(this).prop("id");
        setViewByFilter(listId);
    });
}

function setViewByFilter(listId) {
    let idFilter = listId.substr(listId.length - 2);
    let idParsed = parseInt(idFilter, 10);
    let item = SIDE_FILTER_DATA.find(x => x.id === idParsed) || null;
    if (item !== null) {
        ChangeCbTipo(item.idTipoRelacion, item.title, item.subdominioIds);
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

    DATA_TECNOLOGIA_DESMARCADO = [];
    DATA_TIPO_ACTUAL = 0;
    $tableTecnologia.bootstrapTable("destroy");
    $tableTecnologia.bootstrapTable();

    //LimpiarValidateErrores($("#formAddOrEdit"));
    //$("#ddlFlagRelacionCb").prop("checked", false);
    //$("#ddlFlagRelacionCb").bootstrapToggle("off");

    SetValueRadio(true);

    var validator = $("#formAddOrEdit").validate();
    validator.resetForm();

    $("#txtDominio, #txtSubdominio, #txtTipoTecnologia, #txtFechaFinSoporte").val("");
    $("#lblSuscripcion").html("");
    $("#ddlTipoEquipo").val("-1");
    $("#ddlFuncion").val("-1");

    //$("#cbNuevoEstado").val("-1");
    //$("#txtEstadoActual").val("");
    //$("#txtObservacion").val("");
    //validator = $("#formCambioEstado").validate();
    //validator.resetForm();
}

function InitViewSection(id_sf) {
    let item = SIDE_FILTER_DATA.find(x => x.id === id_sf) || null;
    if (item !== null) ChangeCbTipo(item.idTipoRelacion, item.title, item.subdominioIds);
}

function ChangeCbTipo(tipoRelacionId, title, subdominioIds) {
    $("#titleForm").html(title);
    $("#hdTipoRelacionId").val(tipoRelacionId);
    $("#hdSubdominioIds").val("");
    $("#ddlTipoEquipo").prop("disabled", false);
    ClearView();

    let pos = tipoRelacionId;
    switch (pos) {
        case TIPO_RELACION.EQUIPO:
            $(".tipo-tecnologia").hide();
            $(".tipo-aplicacion").hide();
            $(".tipo-equipo").show();

            if ($.trim(subdominioIds) !== "") {
                $("#hdSubdominioIds").val(subdominioIds);
                $("#lblNameEquipo").html("Equipo:");
                $(".tipo-funcion").hide();
            } else {
                $("#hdSubdominioIds").val("");
                $("#lblNameEquipo").html(`${title}:`);
                $(".tipo-funcion").show();
            }

            $("#txtEquipo").autocomplete("destroy");
            InitAutocompletarEquipo($("#txtEquipo"), $("#hdEquipoId"), ".equipoContainer", URL_AUTOCOMPLETE_EQUIPO.DEFAULT);
            break;
        case TIPO_RELACION.SERVICIO_NUBE:
            $(".tipo-tecnologia").hide();
            $(".tipo-aplicacion").hide();
            $(".tipo-equipo").show();
            $(".tipo-servicio-nube").hide();
            $(".tipo-funcion").hide();

            $("#ddlTipoEquipo").val(4);
            $("#ddlTipoEquipo").prop("disabled", true);

            $("#lblNameEquipo").html(`${title}:`);

            $("#txtEquipo").autocomplete("destroy");
            InitAutocompletarEquipo($("#txtEquipo"), $("#hdEquipoId"), ".equipoContainer", URL_AUTOCOMPLETE_EQUIPO.SERVICIONUBE);
            break;
        case TIPO_RELACION.TECNOLOGIA:
            $(".tipo-equipo").hide();
            $(".tipo-aplicacion").hide();
            $(".tipo-tecnologia").show();

            $("#txtTecnologia").autocomplete("destroy");
            InitAutocompletarTecnologia($("#txtTecnologia"), $("#hdTecnologiaId"), ".tecnologiaContainer", subdominioIds);

            if ($.trim(subdominioIds) !== "") {
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
            let suscripcion = ui.item.Suscripcion || "";
            let msg = $.trim(suscripcion) !== "" ? `Suscripción: ${suscripcion}` : "";
            $("#lblSuscripcion").html(msg);
            
            FiltrarEquipoTecnologia();

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

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
            //debugger;
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

    $.each(RELACION_DETALLE_EDIT_SO, function (i, item) {
        $(`#cbRelevanciaEquipo${item.TecnologiaId || item.Id}`).val(RELEVANCIA_ALTA);
        //$(`#cbRelevanciaEquipo${item.TecnologiaId || item.Id}`).removeClass("bloq-element");
    });

    $.each(RELACION_DETALLE_EDIT_COMPONENTE, function (i, item) {
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
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
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
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function setReadOnlyDataTecnologia(item) {
    $("#txtDominio").val(item.Dominio);
    $("#txtSubdominio").val(item.Subdominio);
    $("#txtTipoTecnologia").val(item.TipoTecnologia);
    $("#txtFechaFinSoporte").val(item.FechaFinSoporteStr);
}

function relevanciaFormatter(value, row) {
    return `<select id="cbRelevanciaEquipo${value}" name="cbRelevanciaEquipo${value}" class="form-control format-relevancia bloq-element"><option>${TEXTO_SELECCIONE}</option></select>`;
}

function componenteFormatter(value, row) {
    return `<input id="txtComponente${value}" class="form-control" type="text" name="txtComponente${value}">`;
}

function CrearObjListRelacionDetalle(tipoRelacionId) {
    let data = [];
    switch (tipoRelacionId) {
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

function CrearObjRelacion(tipoRelacionId) {
    var data = {
        RelacionId: $("#hdId").val(),
        CodigoAPT: $("#hdAplicacionId").val(),
        //TipoId: $("#cbTipo").val(),
        TipoId: $("#hdTipoRelacionId").val(),
        Activo: true,
        ListRelacionDetalle: CrearObjListRelacionDetalle(tipoRelacionId),
        EstadoId: ESTADO_RELACION.PENDIENTE,
        TecnologiaIdsEliminar: ObtenerTecnologiaIdsEliminar()
    };

    switch (tipoRelacionId) {
        case TIPO_RELACION.TECNOLOGIA:
            break;
        case TIPO_RELACION.EQUIPO:
        case TIPO_RELACION.SERVICIO_NUBE:
            data.AmbienteId = $("#cbAmbiente").val();
            data.EquipoId = $("#hdEquipoId").val();
            //data.FlagRelacionAplicacion = $("#ddlFlagRelacionCb").prop("checked");
            data.FlagRelacionAplicacion = GetValueRadio();
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

function RegistrarAddOrEdit() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    let relacionId = $("#hdId").val();
    if (relacionId === "0" || relacionId === null) {
        let estadoUnico = ValidarRelacionUnica();
        if (estadoUnico) {
            bootbox.alert("La relación ya se encuentra registrada, por favor selecciona otra aplicación, equipo o tecnología");
            return false;
        }
    }

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
        case TIPO_RELACION.SERVICIO_NUBE:
            $(".tipo-tecnologia").addClass("ignore");
            $(".tipo-aplicacion").addClass("ignore");
            $(".tipo-equipo").removeClass("ignore");
            break;
        case TIPO_RELACION.APLICACION:
            $(".tipo-tecnologia").addClass("ignore");
            $(".tipo-equipo").addClass("ignore");
            $(".tipo-aplicacion").removeClass("ignore");
            break;
    }

    if ($("#formAddOrEdit").valid()) {

        $("#btnRegistrar").button("loading");
        let data = CrearObjRelacion(pos);

        //console.log(data);
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
                        //ListarRegistros();
                    }
                }
            },
            complete: function (data) {
                $("#btnRegistrar").button("reset");
                if (ControlarCompleteAjax(data))
                    window.location.href = URL_REDIRECT_SUCCESS;
                else
                    bootbox.alert("Sucedió un error con el servicio", function () { });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function ValidarRelacionUnica() {
    let estado = false;
    //let opc = $("#cbTipo").val();
    let opc = parseInt($("#hdTipoRelacionId").val());
    switch (opc) {
        case TIPO_RELACION.EQUIPO:
            estado = ExisteRelacionEquipo();
            break;
        case TIPO_RELACION.TECNOLOGIA:
            estado = ExisteRelacionTecnologia();
            break;
    }

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

function InitValidateMain() {
    $.validator.addMethod("existeAplicacion", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $.trim($("#hdAplicacionId").val()) !== "0") {
            //debugger;
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
        errorClass: "my-error-class",
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

function EditRegistro(Id) {
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            //MdAddOrEditRegistro(true);
            DATA_TIPO_ACTUAL = result.TipoId;
            $("#hdTipoRelacionId").val(result.TipoId);

            //$("#cbTipo").val(result.TipoId);
            //ChangeCbTipo();
            //let flagTipo = $("#cbTipo").val();

            let idTipoRelacion = result.TipoId;
            switch (idTipoRelacion) {
                case TIPO_RELACION.TECNOLOGIA:
                    let idSubdominio = result.ListRelacionDetalle[0].SubdominioId;
                    let item = SIDE_FILTER_DATA.find(x => x.idTipoRelacion === idTipoRelacion
                        && x.subdominioIds.includes(idSubdominio.toString())) || null;

                    if (item !== null) {
                        $(`#${item.idHtml}.list-group-item`).click();
                    } else {
                        let idHtmlTecnologias = `sideFil${SIDE_FILTER_IDS.TECNOLOGIAS}`;
                        $(`#${idHtmlTecnologias}.list-group-item`).click();
                    }

                    $("#hdRelacionDetalleId").val(result.ListRelacionDetalle[0].Id);
                    $("#hdTecnologiaId").val(result.ListRelacionDetalle[0].TecnologiaId);
                    $("#txtTecnologia").val(result.ListRelacionDetalle[0].TecnologiaStr);
                    $("#cbRelevancia").val(result.ListRelacionDetalle[0].RelevanciaId);

                    setReadOnlyDataTecnologia(result.ListRelacionDetalle[0]);

                    break;

                case TIPO_RELACION.EQUIPO:
                    let idHtmlServidor = `sideFil${SIDE_FILTER_IDS.SERVIDOR}`;
                    $(`#${idHtmlServidor}.list-group-item`).click();

                    let raStateServidor = result.FlagRelacionAplicacion || false;
                    SetValueRadio(raStateServidor);
                    //$("#ddlFlagRelacionCb").prop("checked", raStateServidor);
                    //$("#ddlFlagRelacionCb").bootstrapToggle(raStateServidor ? "on" : "off");
                    //$("#ddlFlagRelacionCb").trigger("change");

                    $("#cbAmbiente").val(result.AmbienteId);
                    $("#hdEquipoId").val(result.EquipoId === null ? "0" : result.EquipoId);
                    $("#txtEquipo").val(result.EquipoStr);
                    RELACION_DETALLE_EDIT = result.ListRelacionDetalle;
                    FiltrarEquipoTecnologia();
                    $.each(RELACION_DETALLE_EDIT, function (i, item) {
                        $(`#cbRelevanciaEquipo${item.TecnologiaId}`).val(item.RelevanciaId);
                        $(`#cbRelevanciaEquipo${item.TecnologiaId}`).removeClass("bloq-element");

                        $(`#txtComponente${item.TecnologiaId}`).val(item.Componente);
                        $(`#txtComponente${item.TecnologiaId}`).removeClass("bloq-element");
                    });
                    ValidacionRelacionTecnologiaDetalle();
                    break;

                case TIPO_RELACION.SERVICIO_NUBE:
                    let idHtmlServicioNube = `sideFil${SIDE_FILTER_IDS.SERVICIO_NUBE}`;
                    $(`#${idHtmlServicioNube}.list-group-item`).click();

                    //let raStateServicioNube = result.FlagRelacionAplicacion || false;
                    //$("#ddlFlagRelacionCb").prop("checked", raStateServicioNube);
                    //$("#ddlFlagRelacionCb").bootstrapToggle(raStateServicioNube ? "on" : "off");
                    //$("#ddlFlagRelacionCb").trigger("change");

                    let raStateServicioNube = result.FlagRelacionAplicacion || false;
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

                        $(`#txtComponente${item.TecnologiaId}`).val(item.Componente);
                        $(`#txtComponente${item.TecnologiaId}`).removeClass("bloq-element");
                    });
                    ValidacionRelacionTecnologiaDetalle();
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
        async: false
    });
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

