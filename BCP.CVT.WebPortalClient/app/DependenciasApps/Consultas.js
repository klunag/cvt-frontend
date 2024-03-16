var $tblDependenciasRelacion = $("#tblDependenciasRelacion");
var $tblDependenciasImpacto = $("#tblDependenciasImpacto");
var $tblDependenciasDetalle = $("#tblDependenciasDetalle");
var $tblDependenciasComponentes = $("#tblDependenciasComponentes");
//VER INFORME


var URL_API_VISTA = URL_API + "/Aplicacion/GestionAplicacion";
var URL_API_USUARIO = URL_API + "/Usuario";
var ITEMS_REMOVEID = [];
var ITEMS_ADDID = [];
var DATA_MATRICULA = [];
var FLAG_TENEMOS_MATRICULA = false;
var DATA_EXPORTAR = {};
var USUARIO_DATOS = {};
var TITULO_MENSAJE = "Consultas";
var ESTADO_SOLICITUD_APP = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var PARAMETRO_ACTIVAR_EQUIPO = false;
const TIPO_EQUIPO = { SERVIDOR: 1, SERVIDOR_AGENCIA: 2, PC: 3, SERVICIO_NUBE: 4, STORAGE: 5, APPLIANCE: 6 };
var VGD_RELACION_ID = 0;
var VGD_CODIGO_APT = "";
var VGD_EQUIPO_ID = 0;
var PARAMETRO_ACCESO_GRAFICO = "";
var ACCESO_GRAFICO = 0;

$(function () {
    getCurrentUser();
    obtenerParametro('DEPENDENCIAS_APPS_GRAFOS_ACCESOS');
    InitAutocompletarAplicacion($("#txtFilApp"), $("#hdFilAppId"), ".filAppContainer"); //Filtro App
    InitAutocompletarEquipo($("#txtFilComp"), $("#hdFilCompId"), $("#hdTipoCompId"), ".filCompContainer"); //Filtro Componente
    CargarCombos();
    $tblDependenciasRelacion.bootstrapTable("destroy");
    $tblDependenciasRelacion.bootstrapTable({ data: [] });
    $tblDependenciasImpacto.bootstrapTable("destroy");
    $tblDependenciasImpacto.bootstrapTable({ data: [] });
    $tblDependenciasComponentes.bootstrapTable("destroy");
    $tblDependenciasComponentes.bootstrapTable({ data: [] });
    $tblDependenciasDetalle.bootstrapTable("destroy");
    $tblDependenciasDetalle.bootstrapTable({ data: [] });
    //Buscar();
    $("#ddlVisualizacion_Equipo").change(Change_Equipo);
    $("#ddlVisualizacion_App").change(Change_App);
    $("#ddlVisualizacion_AppToApp").change(Change_AppToApp);
    //var matri = userCurrent.Matricula;
    //if (PARAMETRO_ACCESO_GRAFICO.includes(matri))
    //    ACCESO_GRAFICO = 1;  
    $("#btn_VistaDiagramaInfra").css('visibility', 'hidden');
});

function rowNumFormatterServerApps(value, row, index) {
    var pageNumber = $tblDependenciasRelacion.bootstrapTable('getOptions').pageNumber;
    var pageSize = $tblDependenciasRelacion.bootstrapTable('getOptions').pageSize;

    var rowNum = (pageSize * (pageNumber - 1)) + (index + 1);
    return rowNum;
}

function rowNumFormatterServerAppsImpacto(value, row, index) {
    var pageNumber = $tblDependenciasImpacto.bootstrapTable('getOptions').pageNumber;
    var pageSize = $tblDependenciasImpacto.bootstrapTable('getOptions').pageSize;

    var rowNum = (pageSize * (pageNumber - 1)) + (index + 1);
    return rowNum;
}

function rowNumFormatterServerAppsDetalle(value, row, index) {
    var pageNumber = $tblDependenciasDetalle.bootstrapTable('getOptions').pageNumber;
    var pageSize = $tblDependenciasDetalle.bootstrapTable('getOptions').pageSize;

    var rowNum = (pageSize * (pageNumber - 1)) + (index + 1);
    return rowNum;
}

function rowNumFormatterServerComp(value, row, index) {
    var pageNumber = $tblDependenciasComponentes.bootstrapTable('getOptions').pageNumber;
    var pageSize = $tblDependenciasComponentes.bootstrapTable('getOptions').pageSize;

    var rowNum = (pageSize * (pageNumber - 1)) + (index + 1);
    return rowNum;
}

function InitAutocompletarAplicacion($searchBox, $IdBox, $container) {
    $IdBox.val("");
    $searchBox.autocomplete({
        minLength: 3,
        change: function (event, ui) {
            if (ui.item == null) {
                $("#btn_VistaDiagramaInfra").css('visibility', 'hidden');
            } else {
                $("#btn_VistaDiagramaInfra").css('visibility', 'visible');
            }
        },
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API + "/Dependencias/GetAplicacionByFiltro?filtro=" + request.term,
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

function InitAutocompletarEquipo($searchBox, $IdBox, $Tipo, $container) {
    $IdBox.val(0);
    $Tipo.val("0");
    $searchBox.autocomplete({
        minLength: 4,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $Tipo.val("0");
                $.ajax({
                    url: URL_API + `/Dependencias/GetEquipoByFiltro?filtro=${request.term}`,
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
            $Tipo.val(ui.item.TipoId);
            $searchBox.val(ui.item.label);
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

function obtenerParametro(par) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Parametro/ObtenerParametro?codigo=" + par,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                PARAMETRO_ACCESO_GRAFICO = dataObject.Valor;

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
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Dependencias/CombosData",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItems(dataObject.TipoEquipo, $("#cbTipo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ListaTipoRelacionamiento, $("#ddlTipoRelacionamientoFiltro"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ListaTipoConexion, $("#ddlTipoConexionFiltro"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ListaEtiquetaAplicacion, $("#ddlTipoEtiquetaFiltro"), TEXTO_SELECCIONE);


                    //Multiple
                    //SetItemsMultiple(dataObject.TipoAmbiente, $("#ddlAmbienteFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Estado, $("#cbEstadoFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Funcion, $("#ddlFuncion"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function Buscar() {
    let ap = $("#hdFilAppId").val() !== "0" && $.trim($("#txtFilApp").val()) !== "" ? $("#hdFilAppId").val() : "";
    let cp = $("#hdFilCompId").val() !== "0" && $.trim($("#txtFilComp").val()) !== "" ? $("#hdFilCompId").val() : "";
    if (ap == "" && cp == "") {
        bootbox.alert("Para poder buscar la información es necesario que seleccione una aplicación o un componente");
        return;
    }
    $tblDependenciasRelacion.bootstrapTable('destroy');
    $tblDependenciasImpacto.bootstrapTable('destroy');
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    if ($("#txtFilComp").val() == "")
        $("#hdFilCompId").val(0);

    //if ($("#ddlTipoConsultaFiltro").val() == 2 && ($("#hdFilAppId").val() !== "0" && $.trim($("#txtFilApp").val()) !== "" ? $("#hdFilAppId").val() : "") == "") {
    //    toastr.error("Cuando realiza busqueda por impacto, tiene que seleccionar una aplicación", "CVT");
    //}
    //else {
    //var matri = userCurrent.Matricula;
    //if (PARAMETRO_ACCESO_GRAFICO.includes(matri))
    //ACCESO_GRAFICO = 1;

    if ($("#hdFilCompId").val() == 0) {
        ListarDependencias();
        $("#tabAplicaciones").addClass("active");
        $("#tabComponentes").removeClass("active");
        $("#datApp").addClass("fade active in");
        $("#datCompo").removeClass("fade active in");
    } else {
        $("#btn_vgdApp").css('display', 'none');
        $("#tabComponentes").addClass("active")
        $("#tabAplicaciones").removeClass("active")
        $("#datApp").removeClass("fade active in");
        $("#datCompo").addClass("fade active in");
    }
    ListarDependenciasComponentes();
    //}
    waitingDialog.hide();
}


function ListarDependenciasDetalle(relacionId) {
    /*$("#tituloResultadoDependencia").html("Detalle de la relación de " + CodigoAPTOrigen + " con " + CodigoAPTDestino + ":");*/
    $("#tituloResultadoDependencia").html("Detalle de la relación:");
    $tblDependenciasDetalle.bootstrapTable('destroy');
    $tblDependenciasDetalle.bootstrapTable({
        url: URL_API + "/Dependencias/Detalle",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        sortName: "AplicacionOrigen",
        sortOrder: "asc",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            DATA_EXPORTAR.TipoRelacionamientoId = $("#ddlTipoRelacionamientoFiltro").val();
            DATA_EXPORTAR.TipoConexionId = $("#ddlTipoConexionFiltro").val();
            DATA_EXPORTAR.TipoEtiquetaId = $("#ddlTipoEtiquetaFiltro").val();
            DATA_EXPORTAR.CodigoAPT = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $.trim($("#txtFilApp").val());
            DATA_EXPORTAR.EquipoId = $("#hdFilCompId").val() !== "0" ? $("#hdFilCompId").val() : $.trim($("#txtFilComp").val());
            DATA_EXPORTAR.RelacionId = relacionId;
            //DATA_EXPORTAR.CodigoAPT = CodigoAPT
            //DATA_EXPORTAR.CodigoAPTOrigen = CodigoAPTOrigen
            //DATA_EXPORTAR.CodigoAPTDestino = CodigoAPTDestino

            //DATA_EXPORTAR.username = USUARIO.UserName;
            //DATA_EXPORTAR.PerfilId = USUARIO.UsuarioBCP_Dto.PerfilId;

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

function ListarDependencias() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblDependenciasRelacion.bootstrapTable('destroy');
    $tblDependenciasImpacto.bootstrapTable('destroy');

    if ($("#ddlTipoConsultaFiltro").val() == 1) {
        $tblDependenciasRelacion.css("display", "table");
        $tblDependenciasImpacto.css("display", "none");
        $tblDependenciasRelacion.bootstrapTable({
            url: URL_API + "/Dependencias/Lista",
            method: "POST",
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pagination: true,
            sidePagination: "server",
            queryParamsType: "else",
            sortName: "AplicacionOrigen",
            sortOrder: "asc",
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.pageNumber = p.pageNumber;
                DATA_EXPORTAR.pageSize = p.pageSize;
                DATA_EXPORTAR.sortName = p.sortName;
                DATA_EXPORTAR.sortOrder = p.sortOrder;

                DATA_EXPORTAR.TipoConsultaId = $("#ddlTipoConsultaFiltro").val();
                DATA_EXPORTAR.TipoRelacionamientoId = $("#ddlTipoRelacionamientoFiltro").val();
                DATA_EXPORTAR.TipoConexionId = $("#ddlTipoConexionFiltro").val();
                DATA_EXPORTAR.TipoEtiquetaId = $("#ddlTipoEtiquetaFiltro").val();
                DATA_EXPORTAR.CodigoAPT = $("#hdFilAppId").val() !== "0" && $.trim($("#txtFilApp").val()) !== "" ? $("#hdFilAppId").val() : "";
                DATA_EXPORTAR.EquipoId = $("#hdFilCompId").val() !== "0" && $.trim($("#txtFilComp").val()) !== "" ? $("#hdFilCompId").val() : 0;
                //DATA_EXPORTAR.Tipo = $("#hdTipoCompId").val() !== "0" && $.trim($("#txtFilComp").val()) !== "" ? $("#hdTipoCompId").val() : $.trim($("#txtFilComp").val());


                //DATA_EXPORTAR.username = USUARIO.UserName;
                //DATA_EXPORTAR.PerfilId = USUARIO.UsuarioBCP_Dto.PerfilId;

                return JSON.stringify(DATA_EXPORTAR);
            },
            responseHandler: function (res) {
                waitingDialog.hide();
                var data = res;
                if (data.Rows.length > 0) {
                    $("#btn_vgdApp").css('display', 'block');
                } else {
                    $("#btn_vgdApp").css('display', 'none');

                }
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
    else if ($("#ddlTipoConsultaFiltro").val() == 2) {
        $tblDependenciasRelacion.css("display", "none");
        $tblDependenciasImpacto.css("display", "table");
        $tblDependenciasImpacto.bootstrapTable({
            url: URL_API + "/Dependencias/Lista",
            method: "POST",
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pagination: true,
            //columnDefs: [
            //    {
            //        target: 2,
            //        visible: false
            //    }
            //],
            sidePagination: "server",
            queryParamsType: "else",
            sortName: "AplicacionOrigen",
            sortOrder: "asc",
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.pageNumber = p.pageNumber;
                DATA_EXPORTAR.pageSize = p.pageSize;
                DATA_EXPORTAR.sortName = p.sortName;
                DATA_EXPORTAR.sortOrder = p.sortOrder;

                DATA_EXPORTAR.TipoConsultaId = $("#ddlTipoConsultaFiltro").val();
                DATA_EXPORTAR.TipoRelacionamientoId = $("#ddlTipoRelacionamientoFiltro").val();
                DATA_EXPORTAR.TipoConexionId = $("#ddlTipoConexionFiltro").val();
                DATA_EXPORTAR.TipoEtiquetaId = $("#ddlTipoEtiquetaFiltro").val();
                DATA_EXPORTAR.CodigoAPT = $("#hdFilAppId").val() !== "0" && $.trim($("#txtFilApp").val()) !== "" ? $("#hdFilAppId").val() : "";
                DATA_EXPORTAR.EquipoId = $("#hdFilCompId").val() !== "0" && $.trim($("#txtFilComp").val()) !== "" ? $("#hdFilCompId").val() : 0;
                //DATA_EXPORTAR.Tipo = $("#hdTipoCompId").val() !== "0" && $.trim($("#txtFilComp").val()) !== "" ? $("#hdTipoCompId").val() : $.trim($("#txtFilComp").val());


                //DATA_EXPORTAR.username = USUARIO.UserName;
                //DATA_EXPORTAR.PerfilId = USUARIO.UsuarioBCP_Dto.PerfilId;

                return JSON.stringify(DATA_EXPORTAR);
            },
            responseHandler: function (res) {
                waitingDialog.hide();
                var data = res;
                if (data.Rows.length > 0) {
                    $("#btn_vgdApp").css('display', 'block');
                } else {
                    $("#btn_vgdApp").css('display', 'none');
                }
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




}

function ListarDependenciasComponentes() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblDependenciasComponentes.bootstrapTable('destroy');
    $tblDependenciasComponentes.bootstrapTable({
        url: URL_API + "/Dependencias/ListaComponentes",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        sortName: "Aplicacion",
        sortOrder: "asc",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            //DATA_EXPORTAR.TipoRelacionamientoId = $("#ddlTipoRelacionamientoFiltro").val();
            //DATA_EXPORTAR.TipoConexionId = $("#ddlTipoConexionFiltro").val();
            //DATA_EXPORTAR.TipoEtiquetaId = $("#ddlTipoEtiquetaFiltro").val();
            DATA_EXPORTAR.CodigoAPT = $("#hdFilAppId").val() !== "0" && $.trim($("#txtFilApp").val()) !== "" ? $("#hdFilAppId").val() : "";
            DATA_EXPORTAR.EquipoId = $("#hdFilCompId").val() !== "0" && $.trim($("#txtFilComp").val()) !== "" ? $("#hdFilCompId").val() : 0;
            DATA_EXPORTAR.TipoIds = $("#hdTipoCompId").val() !== "0" && $.trim($("#txtFilComp").val()) !== "" ? $("#hdTipoCompId").val() : "0";
            DATA_EXPORTAR.TipoRelacionamientoId = $("#ddlTipoRelacionamientoFiltro").val();

            //DATA_EXPORTAR.username = USUARIO.UserName;
            //DATA_EXPORTAR.PerfilId = USUARIO.UsuarioBCP_Dto.PerfilId;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            if (data.Rows.length > 0) {
                $("#btn_vgdEquipo").css('display', 'block');
            } else {
                $("#btn_vgdEquipo").css('display', 'none');
            }
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

function opciones(value, row, index) {
    let opciones = [];
    //${row.id}
    let btnRevisar = `<a href="javascript:verInforme('${row.RelacionId}','${row.AplicacionDuenaRelacion}','${row.AplicacionGeneraImpacto}');" title="Ver"><i class="glyphicon glyphicon-folder-open"></i></a>`;

    opciones.push(btnRevisar);
    return opciones.join("&nbsp;");
}

function vistaGrafica(value, row, index) {
    let opciones = [];

    let btnVistaGrafica = `<a href="javascript:vgdAppToApp('${row.RelacionId}','${row.AplicacionDuenaRelacion}','${row.AplicacionGeneraImpacto}');" title="Vista Gráfica"><i class="glyphicon glyphicon-eye-open"></i></a>`;

    opciones.push(btnVistaGrafica);
    return opciones.join("&nbsp;");
}

function rowNumFormatterServer(value, row, index) {
    //var pageNumber = $tblDependencias.bootstrapTable('getOptions').pageNumber;
    //var pageSize = $tblDependencias.bootstrapTable('getOptions').pageSize;

    //var rowNum = (pageSize * (pageNumber - 1)) + (index + 1);
    return 1;
}


//POPUP INFORME
function irModalConsultaAplicacion(EstadoMd) {
    limpiarModalConsultaAplicacion();
    if (EstadoMd)
        $("#MdConsultaAplicacion").modal(opcionesModal);
    else
        $("#MdConsultaAplicacion").modal('hide');
}
function limpiarModalConsultaAplicacion() {
    LimpiarValidateErrores($("#formConsultaAplicacion"));
}
function verInforme(relacionId, AplicacionDuenaRelacion, AplicacionGeneraImpacto) {
    let perfil = userCurrent.PerfilId;
    if (userCurrent.Perfil.includes("E195_GestorDependencias"))
        perfil = 1;

    let bitAcceso = false;
    if (perfil == 1) {
        bitAcceso = true;
    } else {
        bitAcceso = VerificarAccesoDetalle(AplicacionDuenaRelacion, AplicacionGeneraImpacto);
    }
    if (!bitAcceso) {
        bootbox.alert("Solo puedes ver el detalle si tienes algún rol en la aplicación seleccionada");
        return;
    }
    CargarModalDetalle(relacionId, AplicacionDuenaRelacion, AplicacionGeneraImpacto);

}

function VerificarAccesoDetalle(AplicacionDuenaRelacion, AplicacionGeneraImpacto) {
    let bit = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Dependencias/VerificarAcceso?duena=" + AplicacionDuenaRelacion + "&impacto=" + AplicacionGeneraImpacto,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    if (dataObject.length > 0) {
                        bit = true;
                    }
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return bit;
}

function CargarModalDetalle(relacionId, AplicacionDuenaRelacion, AplicacionGeneraImpacto) {
    let tipoConsultaId = $.trim($("#ddlTipoConsultaFiltro").val());

    if (tipoConsultaId == "1" && AplicacionGeneraImpacto != "") {
        GrafoCodAppRelacion = AplicacionGeneraImpacto;
    }
    if (tipoConsultaId == "2" && AplicacionDuenaRelacion != "") {
        GrafoCodAppRelacion = AplicacionDuenaRelacion;
    }


    $("#titleFormAplicacion").html("Consulta");
    $(".onlyAdd").show();
    $(".onlyAdd").removeClass("ignore");
    setViewModal(PARAMETRO_ACTIVAR_EQUIPO, TIPO_EQUIPO.SERVIDOR);
    $(".divUrl").hide();
    irModalConsultaAplicacion(true);


    //$("#hdInformeId").val("1");
    /// $("#txtNomEquipo").removeAttr("disabled");
    setTimeout(function () { ListarDependenciasDetalle(relacionId); }, 500);
}

function setViewModal(parametro, tipoEquipoId = 0) {
    if (parametro) {
        $(".parametro-view").show();
        $(".parametro-view").removeClass("ignore");
    } else {
        $(".parametro-view").show();
        $(".parametro-view").removeClass("ignore");
    }
}

function Exportar() {

    let codigoAPT = $("#hdFilAppId").val() !== "0" && $.trim($("#txtFilApp").val()) !== "" ? $("#hdFilAppId").val() : "";
    let cp = $("#hdFilCompId").val() !== "0" && $.trim($("#txtFilComp").val()) !== "" ? $("#hdFilCompId").val() : "";
    if (codigoAPT == "" && cp == "") {
        bootbox.alert("Para poder exportar la información es necesario que seleccione una aplicación o un componente");
        return;
    }

    let tipoConexionId = $("#ddlTipoConexionFiltro").val();
    let equipoId = $("#hdFilCompId").val() !== "0" && $.trim($("#txtFilComp").val()) !== "" ? $("#hdFilCompId").val() : 0;
    let tipoRelacionamientoId = $.trim($("#ddlTipoRelacionamientoFiltro").val());
    let tipoEtiquetaId = $.trim($("#ddlTipoEtiquetaFiltro").val());
    let tipoConsultaId = $.trim($("#ddlTipoConsultaFiltro").val());
    let tipoCompId = $("#hdTipoCompId").val() !== "0" && $.trim($("#txtFilComp").val()) !== "" ? $("#hdTipoCompId").val() : "0"
    let perfilId = userCurrent.PerfilId;

    let validarAcceso = false;

    if (codigoAPT != "") {
        validarAcceso = VerificarAccesoExportar(perfilId, codigoAPT)
    } else {
        validarAcceso = true;
    }

    if (!validarAcceso) {
        bootbox.alert("Solo puedes exportar la información si tienes un rol en la aplicación seleccionada.");
        return;
    }

    let url = `${URL_API}/Dependencias/ExportarDetalle?CodigoAPT=${codigoAPT}&TipoConexionId=${tipoConexionId}&equipoId=${equipoId}&tipoRelacionamientoId=${tipoRelacionamientoId}&tipoEtiquetaId=${tipoEtiquetaId}&tipoCompId=${tipoCompId}&tipoConsultaId=${tipoConsultaId}`;
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

function VerificarAccesoExportar(perfilId, codigoAPT) {
    let vari = false;
    if (userCurrent.Perfil.includes("E195_GestorDependencias"))
        perfilId = 1;
    if (perfilId == 1) {
        vari = true;
    } else {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: URL_API + "/Dependencias/VerificarAcceso?duena=" + codigoAPT + "&impacto=",
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        if (dataObject.length > 0) {
                            vari = true;
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
    return vari;
}

// --> Vista Grafica Dependencias
function vgdEquipo() {

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    var componenteId = $("#hdFilCompId").val() !== "0" && $.trim($("#txtFilComp").val()) !== "" ? $("#hdFilCompId").val() : 0;
    var componenteNombre = $.trim($("#txtFilComp").val());

    if (componenteId === 0 || componenteNombre === "") {
        toastr.error("Para mostrar la vista gráfica, debe buscar por Componente.", "");
        waitingDialog.hide();
        return;
    }

    $("#titleForm_VGD_Equipo").html("Vista Gráfica - Aplicaciones relacionadas con: " + componenteNombre);
    $(".onlyAdd").show();
    $(".onlyAdd").removeClass("ignore");
    setViewModal(PARAMETRO_ACTIVAR_EQUIPO, TIPO_EQUIPO.SERVIDOR);
    $(".divUrl").hide();
    irModal_vgdEquipo(true);
    VGD_EQUIPO_ID = 0;
    $("#ddlVisualizacion_Equipo").val(1);
    Grafo_Equipo(1);
    waitingDialog.hide();
}

function vgdApp() {

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    var componenteId = $("#hdFilAppId").val() !== "0" && $.trim($("#hdFilAppId").val()) !== "" ? $("#hdFilAppId").val() : 0;
    var componenteNombre = $.trim($("#txtFilApp").val());

    if (componenteId === 0 || componenteNombre === "") {
        toastr.error("Para mostrar la vista gráfica, debe buscar las relaciones o dependencias de una Aplicación.", "");
        waitingDialog.hide();
        return;
    }

    $("#titleForm_VGD_App").html("Vista Gráfica - Aplicaciones relacionadas con: " + componenteNombre);
    $(".onlyAdd").show();
    $(".onlyAdd").removeClass("ignore");
    setViewModal(PARAMETRO_ACTIVAR_EQUIPO, TIPO_EQUIPO.SERVIDOR);
    $(".divUrl").hide();
    irModal_vgdApp(true);
    VGD_CODIGO_APT = "";
    $("#ddlVisualizacion_App").val(1);
    Grafo_App(1);
    waitingDialog.hide();
}

function vgdAppToApp(relacionId, AplicacionDuenaRelacion, AplicacionGeneraImpacto) {

    //--> Validacion de Grupo de Red
    let perfil = userCurrent.PerfilId;
    if (userCurrent.Perfil.includes("E195_GestorDependencias"))
        perfil = 1;

    let bitAcceso = false;
    if (perfil == 1) {
        bitAcceso = true;
    } else {
        bitAcceso = VerificarAccesoDetalle(AplicacionDuenaRelacion, AplicacionGeneraImpacto);
    }
    if (!bitAcceso) {
        bootbox.alert("Solo puedes acceder a la vista gráfica si tienes algún rol en la aplicación seleccionada.");
        return;
    }
    // <--

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    if (relacionId === 0) {
        toastr.error("Para mostrar la vista gráfica, debe seleccionar una relación entre aplicaciones", "");
        waitingDialog.hide();
        return;
    }

    $("#titleForm_VGD_AppToApp").html("Vista Gráfica - Aplicaciones relacionadas");
    $(".onlyAdd").show();
    $(".onlyAdd").removeClass("ignore");
    setViewModal(PARAMETRO_ACTIVAR_EQUIPO, TIPO_EQUIPO.SERVIDOR);
    $(".divUrl").hide();
    irModal_vgdAppToApp(true);
    VGD_RELACION_ID = 0;
    $("#ddlVisualizacion_AppToApp").val(1);
    Grafo_AppToApp(relacionId, 1);

    waitingDialog.hide();
}


function irModal_vgdEquipo(Estado) {
    if (Estado)
        $("#Md_VGD_Equipo").modal(opcionesModal);
    else
        $("#Md_VGD_Equipo").modal('hide');
}

function irModal_vgdApp(Estado) {
    if (Estado)
        $("#Md_VGD_App").modal(opcionesModal);
    else
        $("#Md_VGD_App").modal('hide');
}

function irModal_vgdAppToApp(Estado) {
    if (Estado)
        $("#Md_VGD_AppToApp").modal(opcionesModal);
    else
        $("#Md_VGD_AppToApp").modal('hide');
}


function Grafo_Equipo(nivel) {

    var equipoId = 0;

    if (VGD_EQUIPO_ID == 0) {
        equipoId = $("#hdFilCompId").val() !== "0" && $.trim($("#txtFilComp").val()) !== "" ? $("#hdFilCompId").val() : 0;
    } else {
        equipoId = VGD_EQUIPO_ID;
    }

    var TipoRelacionId = $("#ddlTipoRelacionamientoFiltro").val();

    var TipoComponente = $("#hdTipoCompId").val();

    let request = {
        equipoId: equipoId,
        Nivel: nivel,
        TipoRelacionId: TipoRelacionId,
        TipoComponente: TipoComponente
    };

    VGD_EQUIPO_ID = equipoId;

    let nodes;
    let edges;

    $.ajax({
        url: URL_API + "/Dependencias/VGD-Equipo",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(request),
        dataType: "json",
        success: function (result) {
            nodes = result.nodes;
            edges = result.edges;
        },
        complete: function (data) {
            console.log('data', data)
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

    if (network !== undefined) {
        network.destroy();
        network = null;
    }

    var container = document.getElementById("vgdEquipo");

    var data = {
        nodes: nodes,
        edges: edges,
    };

    if (!data) {
        toastr.error("Ha ocurrido un error al intentar generar el gráfico.", "");
        return;
    }

    var options = {
        //configure: {
        //    enabled: true,
        //    filter: 'nodes,edges,layout',
        //    container: vgdEquipo,
        //    showButton: true
        //},
        edges: {
            smooth: {
                type: "cubicBezier",
                forceDirection: "horizontal",
                roundness: 0.5,
            },
            length: 245
        },
        layout: {
            hierarchical: {
                direction: "LR",
                parentCentralization: true,
                levelSeparation: 350
            },
        },
        physics: true,
    };

    var network = new vis.Network(container, data, options);

    var fitOpts = {
        offset: { x: 0, y: 0 },
        duration: 1000,
        easingFunction: "easeInOutQuad",
    };
    network.fit({ animation: fitOpts });
}

function Grafo_App(nivel) {

    var codigoApt = "";

    if (VGD_CODIGO_APT == "") {
        codigoApt = $("#hdFilAppId").val() !== "0" && $.trim($("#hdFilAppId").val()) !== "" ? $("#hdFilAppId").val() : 0;
    } else {
        codigoApt = VGD_CODIGO_APT;
    }

    var TipoRelacionId = $("#ddlTipoRelacionamientoFiltro").val();
    var TipoEtiquetaId = $("#ddlTipoEtiquetaFiltro").val();

    let request = {
        codigoAPT: codigoApt,
        Nivel: nivel,
        TipoRelacionId: TipoRelacionId,
        TipoEtiquetaId: TipoEtiquetaId
    };

    VGD_CODIGO_APT = codigoApt;

    let nodes;
    let edges;

    $.ajax({
        url: URL_API + "/Dependencias/VGD-App",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(request),
        dataType: "json",
        success: function (result) {
            nodes = result.nodes;
            edges = result.edges;
        },
        complete: function (data) {
            console.log('data', data)
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

    if (network !== undefined) {
        network.destroy();
        network = null;
    }

    var container = document.getElementById("vgdApp");

    var data = {
        nodes: nodes,
        edges: edges,
    };

    if (!data) {
        toastr.error("Ha ocurrido un error al intentar generar el gráfico.", "");
        return;
    }

    var options = {
        //configure: {
        //    enabled: true,
        //    filter: 'nodes,edges,layout',
        //    container: vgdEquipo,
        //    showButton: true
        //},
        edges: {
            smooth: {
                type: "cubicBezier",
                forceDirection: "horizontal",
                roundness: 0.5,
            },
            length: 245
        },
        layout: {
            hierarchical: {
                direction: "LR",
                parentCentralization: true,
                levelSeparation: 350
            },
        },
        physics: true,
    };

    var network = new vis.Network(container, data, options);

    var fitOpts = {
        offset: { x: 0, y: 0 },
        duration: 1000,
        easingFunction: "easeInOutQuad",
    };
    network.fit({ animation: fitOpts });
}

function Grafo_AppToApp(relacionId, nivel) {

    VGD_RELACION_ID = relacionId;
    //var TipoRelacionId = $("#ddlTipoRelacionamientoFiltro").val();
    var TipoRelacionId = -1;

    let request = {
        relacionId: relacionId,
        Nivel: nivel
    };

    let nodes;
    let edges;

    $.ajax({
        url: URL_API + "/Dependencias/VGD-AppToApp",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(request),
        dataType: "json",
        success: function (result) {
            nodes = result.nodes;
            edges = result.edges;
        },
        complete: function (data) {
            console.log('data', data)
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

    if (network !== undefined) {
        network.destroy();
        network = null;
    }

    var container = document.getElementById("vgdAppToApp");

    var data = {
        nodes: nodes,
        edges: edges,
    };

    if (!data) {
        toastr.error("Ha ocurrido un error al intentar generar el gráfico.", "");
        return;
    }

    var options = {
        //configure: {
        //    enabled: true,
        //    filter: 'nodes,edges,layout',
        //    container: vgdEquipo,
        //    showButton: true
        //},
        edges: {
            smooth: {
                type: "cubicBezier",
                forceDirection: "horizontal",
                roundness: 0.5,
            },
            length: 245
        },
        layout: {
            hierarchical: {
                direction: "LR",
                parentCentralization: true,
                levelSeparation: 350
            },
        },
        physics: true,
    };

    var network = new vis.Network(container, data, options);

    var fitOpts = {
        offset: { x: 0, y: 0 },
        duration: 1000,
        easingFunction: "easeInOutQuad",
    };
    network.fit({ animation: fitOpts });
}

function Change_Equipo() {
    let nivel = $(this).val();
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    Grafo_Equipo(nivel);
    waitingDialog.hide();
}

function Change_App() {
    let nivel = $(this).val();
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    Grafo_App(nivel);
    waitingDialog.hide();
}

function Change_AppToApp() {
    let nivel = $(this).val();
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    Grafo_AppToApp(VGD_RELACION_ID, nivel);
    waitingDialog.hide();
}
// <--

function verDiagramaInfra() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    var nombreApp = $.trim($("#txtFilApp").val());
    if (nombreApp === "") {
        toastr.error("Para mostrar el Diagrama de Infraestructura, debe buscar por Aplicación.", "");
        waitingDialog.hide();
        return;
    }
    $("#titleForm_DiagramaInfra").html("Diagrama de Infraestructura : " + nombreApp);
    $(".onlyAdd").show();
    $(".onlyAdd").removeClass("ignore");
    setViewModal(PARAMETRO_ACTIVAR_EQUIPO, TIPO_EQUIPO.SERVIDOR);
    $(".divUrl").hide();
    irModal_DiagramaInfraestructura(true);
    GraficarDiagramInfra();
    waitingDialog.hide();
}

function GraficarDiagramInfra() {

    var codigoAPT = $("#hdFilAppId").val();

    let request = {
        CodigoAPT: codigoAPT,
        AmbienteId: 1
    };

    let nodes;
    let edges;

    $.ajax({
        url: URL_API + "/Dependencias/BuscarDataDiagInfra",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(request),
        dataType: "json",
        success: function (result) {
            nodes = result.nodes;
            edges = result.edges;
            options = result.options;
        },
        complete: function (data) {
            console.log('data', data)
        },
        error: function (xhr, ajaxOptions, thrownError) {
            if (xhr.status == 404) {
                bootbox.alert("No se encontró relacionamientos para la aplicación");

            } else {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
            waitingDialog.hide();
        },
        async: false
    });

    if (network !== undefined) {
        network.destroy();
        network = null;
    }

    var container = document.getElementById("vDiagramaInfra");

    var data = {
        nodes: nodes,
        edges: edges,
    };
    if (!data) {
        toastr.error("Ha ocurrido un error al intentar generar el gráfico.", "");
        return;
    }

    var network = new vis.Network(container, data, options);
}
function irModal_DiagramaInfraestructura(Estado) {
    if (Estado)
        $("#Md_DiagramaInfraestructura").modal(opcionesModal);
    else
        $("#Md_DiagramaInfraestructura").modal('hide');
}
