var $tblDependenciasApps = $("#tblDependenciasApps");
//VER INFORME
var ITEMS_REMOVEID = [];
var ITEMS_ADDID = [];
var DATA_MATRICULA = [];
var FLAG_TENEMOS_MATRICULA = false;
var DATA_EXPORTAR = {};
var USUARIO_DATOS = {};
var TITULO_MENSAJE = "Consultas";
var URL_API_VISTA = URL_API + "/DependenciasAppsV2";
var ESTADO_SOLICITUD_APP = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var PARAMETRO_ACTIVAR_EQUIPO = false;
const TIPO_EQUIPO = { SERVIDOR: 1, SERVIDOR_AGENCIA: 2, PC: 3, SERVICIO_NUBE: 4, STORAGE: 5, APPLIANCE: 6 };
$(function () {
    InitAutocompletarAplicacion($("#txtFilApp"), $("#hdFilAppId"), ".filAppContainer"); //Filtro App
    $tblDependenciasApps.bootstrapTable("destroy");
    $tblDependenciasApps.bootstrapTable({ data: [] });
    ListarDependenciaApps();
});
function Buscar() {
    ListarDependenciaApps();
}
function InitAutocompletarAplicacion($searchBox, $IdBox, $container) {
    $IdBox.val("");
    $searchBox.autocomplete({
        minLength: 3,
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
function guardarAddOrEditDependenciaApps() {
    if ($("#formFiltros").valid()) {
        var dependencia = {};
        dependencia.CodigoAPT = $("#hdFilAppId").val() !== "0" && $.trim($("#txtFilApp").val()) !== "" ? $("#hdFilAppId").val() : "";

        if (dependencia.CodigoAPT !== "" || dependencia.CodigoAPT !== "0" ) {
            bootbox.confirm({
                title: TITULO_MENSAJE,
                message: "¿Estás seguro de agregar este código de aplicación a la tabla dependencia por Apps?",
                buttons: SET_BUTTONS_BOOTBOX,
                callback: function (result) {
                    if (result !== null && result) {
                        GuardarDependenciaApps();
                    }
                }
            });

        } else {
            toastr.warning("Es necesario seleccionar una aplicación", TITULO_MENSAJE);
        }
    }
}
function ListarDependenciaApps() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblDependenciasApps.bootstrapTable('destroy');
    $tblDependenciasApps.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/PostListadoN",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.CodigoAPT = $("#hdFilAppId").val() !== "0" && $.trim($("#txtFilApp").val()) !== "" ? $("#hdFilAppId").val() : "";
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
function GuardarDependenciaApps() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    var dependencia = {};
    dependencia.Activos = 1;
    dependencia.FlagProceso = 0;
    dependencia.CodigoAPT = $("#hdFilAppId").val() !== "0" && $.trim($("#txtFilApp").val()) !== "" ? $("#hdFilAppId").val() : "";
    $.ajax({
        url: URL_API_VISTA + "/PostRegistrarN",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(dependencia),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    var resultado = dataObject.split("|");
                    var estado = resultado[1];
                    if (estado == "0") {
                        toastr.error("La aplicacion ya se encuentra configurada", TITULO_MENSAJE);
                    } else {
                        toastr.success("Registrado correctamente", TITULO_MENSAJE);
                    }
                    ListarDependenciaApps();
                }
            }
        },
        complete: function () {
            waitingDialog.hide();
        },
        error: function (result) {
            //alert(result.responseText);
            toastr.error(result.responseText, TITULO_MENSAJE);
        }
    });
}

function rowNumFormatterServer(value, row, index) {
    var pageNumber = $tblDependenciasApps.bootstrapTable('getOptions').pageNumber;
    var pageSize = $tblDependenciasApps.bootstrapTable('getOptions').pageSize;

    var rowNum = (pageSize * (pageNumber - 1)) + (index + 1);
    return rowNum;
}

function opcionesProceso(value, row, index) {
    let btnVer = "";
    let btnDesestimar = "";
    let style_color = row.isCompleted == true ? 'iconoVerde ' : "iconoRojo ";
    if (row.ApruebaSolicitud)
        btnVer = `<a href="#" onclick="javascript:irDetalle(${row.Id}, ${row.EstadoSolicitud})" title="Revisa el detalle de la solicitud"><i class="iconoVerde glyphicon glyphicon-zoom-in"></i></a>`;

    if (row.EstadoSolicitud == 2) //Se puede desestimar
        btnDesestimar = `<a href="javascript:irRechazoSolicitante(${row.Id})" title="Desestima la solicitud de cambio de equipo"><i class="iconoRojo glyphicon glyphicon glyphicon-remove"></i></a>`;

    return btnVer.concat("&nbsp;&nbsp;", btnDesestimar);
}
function opcionesProceso(value, row, index) {
    let style_color = row.FlagProceso ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.FlagProceso ? "check" : "unchecked";
    let titulo = row.FlagProceso ? "Desactivar" : "Activar";
    let estado = `<a href="javascript:procesarProceso('${row.CodigoAPT}',${row.FlagProceso},${row.Activo})" title="${titulo}"><i id="cbOpcPro${row.CodigoAPT}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;
}
function opcionesActivo(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let titulo = row.Activo ? "Desactivar" : "Activar";
    let estado = `<a href="javascript:procesarActivo('${row.CodigoAPT}',${row.FlagProceso},${row.Activo})" title="${titulo}"><i id="cbOpcAct${row.CodigoAPT}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;
}
function procesarProceso(codigoApt, Proceso, Activo) {
    var dependencia = {};
    var estadoActivo = false;
    if (Proceso == 0) {
        estadoActivo = true;
    } else {
        estadoActivo = false;
    }
    dependencia.Activos = Activo;
    dependencia.FlagProceso = estadoActivo;
    dependencia.CodigoAPT = codigoApt;
    let mensaje = Proceso ? "¿Estás seguro de desactivar el proceso de esta aplicación?" : "¿Estás seguro de activar el proceso de esta aplicación?";
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: mensaje,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + "/PostProcesarN",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(dependencia),
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                                ListarDependenciaApps();
                            }
                        }
                    },
                    complete: function () {
                        waitingDialog.hide();
                    },
                    error: function (result) {
                        //alert(result.responseText);
                        toastr.error(result.responseText, TITULO_MENSAJE);
                    }
                });
            }
        }
    });
}
function procesarActivo(codigoApt, Proceso, Activo) {
    var dependencia = {};
    var estadoActivo = false;
    if (Activo == 0) {
        estadoActivo = true;
    } else {
        estadoActivo = false;
    }
    dependencia.Activos = estadoActivo;
    dependencia.FlagProceso = Proceso;
    dependencia.CodigoAPT = codigoApt;
    let mensaje = Activo ? "¿Estás seguro de desactivar esta aplicación?" : "¿Estás seguro de activar esta aplicación?";
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: mensaje,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + "/PostProcesarN",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(dependencia),
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                                ListarDependenciaApps();
                            }
                        }
                    },
                    complete: function () {
                        waitingDialog.hide();
                    },
                    error: function (result) {
                        //alert(result.responseText);
                        toastr.error(result.responseText, TITULO_MENSAJE);
                    }
                });
            }
        }
    });
}