var $table = $("#tblRegistros");
var $tableFunciones = $("#tblFunciones");
var $tableHistorial = $("#tblHistorial");
var $tableResponsables = $("#tblResponsables");
var $tableDetalle = $("#tblRegistroSolicitud");
var URL_API_VISTA = URL_API + "/RolesProducto";
var URL_API_VISTA_DESCARGA = URL_API + "/Solicitud";
var DATA_EXPORTAR = {};
const TITULO_MENSAJE = "Confirmación";

const MENSAJE = "¿Estás seguro que deseas agregar este rol al producto seleccionado?";
const MENSAJE2 = "¿Estás seguro que deseas eliminar este rol del producto seleccionado?";
const MENSAJE3 = "¿Estás seguro que deseas modificar este rol del producto seleccionado?"
const MENSAJE4 = "¿Está seguro que desea observar la solicitud seleccionada?";     // Observar Owner
const MENSAJE5 = "¿Está seguro que desea aprobar la solicitud seleccionada?";  // Aprobar Owner

var data = {};
var Aministrador = 1;
var OPCIONES = "";
var OPCIONES2 = "";
var Owner_Tribu = 18;
var CodigoTribu = "";

var $tblAmbientesListar = $("#tbl-ambientesListar");


$(function () {

    InitMultiSelect();
    InitAutocompletarProductoSearch($("#txtProducto"), $("#hdProd"), ".searchProductoContainer");
    validarFormApp();
    cargarCombos();

    ListarRegistros();
    initFecha();

    $("#ddlDominio").change(function () {
        Dominio_Id = $("#ddlDominio").val();
        CambioDominio(Dominio_Id)
    });


    // Construcción del segundo nivel de la grilla
    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        if (row.NroAlertasDetalle !== 0) {
            ListarRolesSolicitud(row.ProductoId, row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
        } else {
            $detail.empty().append("No existen registros.");
        }
    });

    $("#btnObservacionOwner").click(RegistrarObservarOwner);
    $("#btnObservacionSeguridad").click(RegistrarObservarSeguridad);

    $("#btnObservarSolOwner").click(RegObservarOwner);
    $("#btnObservarSolSeguridad").click(RegObservarSeguridad);

    $("#btnAprobarSolOwner").click(RegAprobarOwner);
    $("#btnAprobarSolSeguridad").click(RegAprobarSeguridad);

    $("#btnAprobacionOwner").click(RegistrarAprobarOwner);
    $("#btnAprobacionSeguridad").click(RegistrarAprobarSeguridad);
});

function initFecha() {
    _BuildDatepicker($("#dpFecConsulta"));
    _BuildDatepicker($("#dpFecAtencion"));
}

function InitAutocompletarEstandarBuilder($searchBox, $IdBox, $container, urlController) {

    data.Producto = $("#txtProducto").val();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                data.Producto = request.term;
                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetProductoByFiltro`,
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    type: "POST",
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
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
            $searchBox.val(ui.item.Nombre);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Nombre);
                $("#hdProd").val(ui.item.Nombre);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Nombre + "</font></a>").appendTo(ul);
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
                    url: URL_API_VISTA + `/ListadoByDescripcion?descripcion=${request.term}`,
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

function cargarCombos() {

    var data = {};

    $.ajax({
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/RolesProductosCombo",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Dominio, $("#ddlDominio"), TEXTO_SELECCIONE);
                    SetItems([], $("#ddlSubDominio"), TEXTO_SELECCIONE);

                    //FILTROS MULTISELECT
                    console.log(dataObject.Estados)
                    SetItemsMultiple(dataObject.Estados, $("#ddlEstado"), TEXTO_TODOS, TEXTO_TODOS, true);

                    // Cargar Combo
                    var values = "0,1,3";
                    $.each(values.split(","), function (i, e) {
                        $("#ddlEstado option[value='" + e + "']").prop("selected", true);
                    });
                    $("#ddlEstado").multiselect("refresh");

                    //$("#ddlEstado").val('0');
                    //$("#ddlEstado").multiselect("refresh");
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}


function ListarRegistros() {

    let idsEstado = $.isArray($("#ddlEstado").val()) ? $("#ddlEstado").val() : [$("#ddlEstado").val()];

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/SolicitudesRoles",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'EsPendienteMio,SolicitudId',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};

            //DATA_EXPORTAR.Funcion = $("#txtFuncion").val();
            DATA_EXPORTAR.Producto = $("#txtProducto").val();
            DATA_EXPORTAR.DominioId = $("#ddlDominio").val();
            DATA_EXPORTAR.SubDominioId = $("#ddlSubDominio").val();
            //DATA_EXPORTAR.EstadoAsignacion = $("#ddlEstado").val();
            DATA_EXPORTAR.EstadoAsignacion = idsEstado;
            DATA_EXPORTAR.FechaRegistroSolicitud = castDate($("#dpFecConsulta").val());
            DATA_EXPORTAR.FechaAtencionSolicitud = castDate($("#dpFecAtencion").val());

            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.CodigoApt = $("#txtCodigo").val();

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

function CambioDominio(DominioId) {

    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/RolesProductosComboDominio/${DominioId}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.SubDominio, $("#ddlSubDominio"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.SubDominio, $("#ddlSubDominio"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

}

function opcionesFormatter(value, row, index) {

    //1: Owner, 2: Seguridad

    if (row.EsOwner == 1 && row.EsSeguridad == 0)
    {
        let btnHistorial = `<a href="javascript:irHistorial(${row.SolicitudId})" title="Ver el historial de la solicitud"><i class="iconoVerde glyphicon glyphicon-tasks"></i></a>`;
        let btnFormulario = `<a href="javascript:irVerSolicitud(${row.SolicitudId},${row.IdTipoSolicitud},1,${row.EstadoSolicitud},${row.ProductoId})" title="Revisar solicitud"><i class="iconoVerde glyphicon glyphicon-th"></i></a>`;

        return btnFormulario.concat("&nbsp;&nbsp;", btnHistorial);

    }
    else if (row.EsOwner == 0 && row.EsSeguridad == 1)
    {
        
        let btnHistorial = `<a href="javascript:irHistorial(${row.SolicitudId})" title="Ver el historial de la solicitud"><i class="iconoVerde glyphicon glyphicon-tasks"></i></a>`;
        let btnFormulario = `<a href="javascript:irVerSolicitud(${row.SolicitudId},${row.IdTipoSolicitud},2,${row.EstadoSolicitud},${row.ProductoId})" title="Revisar solicitud"><i class="iconoVerde glyphicon glyphicon-th"></i></a>`;

        return btnFormulario.concat("&nbsp;&nbsp;", btnHistorial);
    }
    else
    {
        let btnHistorial = `<a href="javascript:irHistorial(${row.SolicitudId})" title="Ver el historial de la solicitud"><i class="iconoVerde glyphicon glyphicon-tasks"></i></a>`;
        let btnFormulario = `<a href="javascript:irVerSolicitud(${row.SolicitudId},${row.IdTipoSolicitud},3,${row.EstadoSolicitud},${row.ProductoId})" title="Revisar solicitud"><i class="iconoVerde glyphicon glyphicon-th"></i></a>`;

        return btnFormulario.concat("&nbsp;&nbsp;", btnHistorial);
    }


}

function ListarRolesSolicitud(id, idSolicitud, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
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
        sortOrder: 'desc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.ProductoId = id;
            PARAMS_API.SolicitudAplicacionId = idSolicitud;
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


function detailFormatter(index, row) {
    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="10%">#</th>\
                                    <th data-field="Id" data-halign="center" data-valign="middle" data-align="left" data-width="10%" data-visible="false">Id</th>\
                                    <th data-field="Rol" data-halign="center" data-valign="middle" data-align="left" data-width="20%">Rol</th>\
                                    <th data-field="Descripcion" data-halign="center" data-valign="middle" data-align="left" data-width="25%">Descripción</th>\
                                    <th data-field="GrupoRed" data-halign="center" data-valign="middle" data-align="left" data-width="20%">Grupo de Red</th>\
                                    <th data-formatter="funcionesFormatter" data-field="FuncionesRelacionadas" data-halign="center" data-valign="middle" data-align="left" data-width="5%">Funciones Relacionadas</th>\
                                </tr>\
                            </thead>\
                        </table>', row.Id);
    return html;
}

function funcionesFormatter(value, row, index) {

    let option = value;
    option = `<a href="javascript:VerFunciones('${row.Id}','${row.SolicitudId}')" title="Ver funciones relacionadas">${value}</a>`;
    return option;

}


function VerFunciones(id, idSolicitud) {
    OpenCloseModal($("#modalFunciones"), true);

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableFunciones.bootstrapTable('destroy');
    $tableFunciones.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/DetalleFuncionesProductosRoles",
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
            PARAMS_API.SolicitudAplicacionId = idSolicitud;
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

function irAprobarOwner(id) {
    let data = {};
    data.SolDetalleId = id;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE5,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/AprobarSolicitudOwner`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se aprobó la solicitud correctamente", TITULO_MENSAJE);
                                $("#btnAprobarSolOwner").hide();
                                $("#btnObservarSolOwner").hide();
                                ListarRegistros();
                                OpenCloseModal($("#modalSolicitud"), false);
                            }
                        }
                    },
                    complete: function (data) {
                        waitingDialog.hide();
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}

function irAprobarSeguridad(id) {
    let data = {};
    data.SolDetalleId = id;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE5,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/AprobarSolicitudSeguridad`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se aprobó la solicitud correctamente", TITULO_MENSAJE);
                                $("#btnAprobarSolSeguridad").hide();
                                $("#btnObservarSolSeguridad").hide();
                                ListarRegistros();
                                OpenCloseModal($("#modalSolicitud"), false);
                            }
                        }
                    },
                    complete: function (data) {
                        waitingDialog.hide();
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}

function irObservarOwner(id, idProducto) {
    $("#txtRechazoOwner").val("");
    LimpiarModalOwner();
    OpenCloseModal($("#modalObservarOwner"), true);
}

function irObservarSeguridad(id, idProducto) {
    $("#txtRechazoSeguridad").val("");
    LimpiarModalSeguridad();
    OpenCloseModal($("#modalObservarSeguridad"), true);
}
function irAprobarOwner_Comentario() {
    $("#txtAprobacionOwner").val("");
    LimpiarModalOwner_Aprobar();
    OpenCloseModal($("#modalAprobarOwner"), true);
}
function irAprobarSeguridad_Comentario() {
    $("#txtAprobacionSeguridad").val("");
    LimpiarModalSeguridad_Aprobar();
    OpenCloseModal($("#modalAprobarSeguridad"), true);
}

function irVerSolicitud(idSolicitud, idTipoSolicitud, idTipoResponsable, idEstadoSolicitud, idProducto) {

    limpiarModalSolicitud();
    $("#hdSolCabeceraId").val(idSolicitud);
    $("#hdProductoId").val(idProducto);

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/VerSolicitud/" + idSolicitud,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            //MAprobarSolicitud(true);

            $("#txtNroSolicitud").val(result.SolicitudId)
            $("#txtCodigoProducto").val(result.Codigo);
            $("#txtNombreProducto").val(result.Producto);
            $("#txtMatriculaOwner").val(result.Owner);
            $("#txtOwner").val(result.OwnerNombre);
            $("#txtMatriculaSeguridad").val(result.Seguridad);
            $("#txtSeguridad").val(result.SeguridadNombre);

            $("#divSeguridad").show();
            if (idTipoSolicitud == 2)
            {
                $("#divSeguridad").hide();
            }

            // Control botones de owner y seguridad
            $("#btnAprobarSolOwner").hide();
            $("#btnObservarSolOwner").hide();
            $("#btnAprobarSolSeguridad").hide();
            $("#btnObservarSolSeguridad").hide();

            //1: Owner, 2: Seguridad
            if (idTipoResponsable == 1) // Owner
            {
                if (idEstadoSolicitud == 0 || idEstadoSolicitud == 1) {
                    // ver boton aprobar y observar
                    $("#btnAprobarSolOwner").show();
                    $("#btnObservarSolOwner").show();
                }
            }
            else if (idTipoResponsable == 2) // Seguridad
            {
                if ((idEstadoSolicitud == 0 || idEstadoSolicitud == 3) && idTipoSolicitud == 1)
                {
                    // ver boton aprobar y observar
                    $("#btnAprobarSolSeguridad").show();
                    $("#btnObservarSolSeguridad").show();
                }
            }

            ListarDetalleSolicitud(idSolicitud);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function MAprobarSolicitud(EstadoMd) {
    limpiarModalSolicitud();

    if (EstadoMd) {
        $("#modalSolicitud").modal(opcionesModal);
    }
    else {
        $("#modalSolicitud").modal('hide');
    }
}

function limpiarModalSolicitud() {
    LimpiarValidateErrores($("#formAprobarSolicitud"));
    $("#txtNroSolicitud").val("")
    $("#txtCodigoProducto").val("");
    $("#txtNombreProducto").val("");
    //$("#txtDescripcionProducto").val("");
    //$("#cbDominioIdProducto").val(-1);
    //$("#cbSubDominioIdProducto").val(-1);
    //$("#cbTipoProductoIdProducto").val(-1);
    //$("#cbEstadoObsolescenciaIdProducto").val(estadoObsolescenciaIdObsoleto);
    //$("#txtTribuCoeDisplayNameProducto").val("");
    //$("#hdTribuCoeIdProducto").val("");
    //$("#cbSquadIdProducto").val(-1);
    ////$("#txtSquadDisplayNameProducto").val("");
    ////$("#hdSquadIdProducto").val("");
    //$("#txtOwnerDisplayNameProducto").val("");
    //$("#hdOwnerIdProducto").val("");
    //$("#hdOwnerMatriculaProducto").val("");
    //$("#txtGrupoTicketRemedyProducto").val("");
    //$("#hdGrupoTicketRemedyIdProducto").val("");
    //$("#chkFlagAplicacion").prop("checked", false);
    //$("#chkFlagAplicacion").bootstrapToggle("off");
    //$("#chkFlagAplicacion").trigger("change");
    //$("#txtCodigoProductoManual").val("");
    //ObtenerCodigoSugerido();
    //$("#txtCodigoProductoManual").val(CODIGO_SUGERIDO);
    ////$("#txtCodigoProducto").prop("readonly", false);
    //$("#cbTipoCicloVidaIdProducto").val(-1);
    //$("#cbEsquemaLicenciamientoSuscripcionIdProducto").val(-1);
    //$("#txtEquipoAdmContactoProducto").val("");
    //$("#txtEquipoAprovisionamientoProducto").val("");
}

function LimpiarModalOwner() {
    $("#txtRechazoOwner").val("");
    $("#formRecOw").data('validator').resetForm();
    LimpiarValidateErrores($("#formRecOw"))
}

function LimpiarModalSeguridad() {
    $("#txtRechazoSeguridad").val("");
    $("#formRecSeg").data('validator').resetForm();
    LimpiarValidateErrores($("#formRecSeg"))
}

function LimpiarModalOwner_Aprobar() {
    $("#txtAprobacionOwner").val("");
    $("#formRecOw_Aprobar").data('validator').resetForm();
    LimpiarValidateErrores($("#formRecOw_Aprobar"))
}

function LimpiarModalSeguridad_Aprobar() {
    $("#txtAprobacionSeguridad").val("");
    $("#formRecSeg_Aprobar").data('validator').resetForm();
    LimpiarValidateErrores($("#formRecSeg_Aprobar"))
}

function RegObservarOwner()
{
    var idSolicitud = $("#hdSolCabeceraId").val();
    var idProducto = $("#hdProductoId").val();
    irObservarOwner(idSolicitud, idProducto);
}

function RegObservarSeguridad()
{
    var idSolicitud = $("#hdSolCabeceraId").val();
    var idProducto = $("#hdProductoId").val();
    irObservarSeguridad(idSolicitud, idProducto);
}

function RegAprobarOwner()
{
    //var idSolicitud = $("#hdSolCabeceraId").val();
    //irAprobarOwner(idSolicitud);
    irAprobarOwner_Comentario();
}

function RegAprobarSeguridad()
{
    //var idSolicitud = $("#hdSolCabeceraId").val();
    //irAprobarSeguridad(idSolicitud);
    irAprobarSeguridad_Comentario();
}

function RegistrarObservarOwner() {
    let data = {};
    data.SolDetalleId = $("#hdSolCabeceraId").val();
    data.Comentario = $("#txtRechazoOwner").val();
    data.ProductoId = $("#hdProductoId").val();

    if ($("#formRecOw").valid()) {

        $.ajax({
            url: URL_API_VISTA + `/ObservarSolicitudOwner`,
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {

                        toastr.success("Se observó la solicitud correctamente", TITULO_MENSAJE);
                        $("#btnAprobarSolOwner").hide();
                        $("#btnObservarSolOwner").hide();
                        ListarRegistros();
                        OpenCloseModal($("#modalSolicitud"), false);
                    }
                }
            },
            complete: function (data) {
                $("#txtRechazoOwner").val("");
                OpenCloseModal($("#modalObservarOwner"), false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function RegistrarObservarSeguridad() {
    let data = {};
    data.SolDetalleId = $("#hdSolCabeceraId").val();
    data.Comentario = $("#txtRechazoSeguridad").val();
    data.ProductoId = $("#hdProductoId").val();

    if ($("#formRecSeg").valid()) {

        $.ajax({
            url: URL_API_VISTA + `/ObservarSolicitudSeguridad`,
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {

                        toastr.success("Se observó la solicitud correctamente", TITULO_MENSAJE);
                        $("#btnAprobarSolSeguridad").hide();
                        $("#btnObservarSolSeguridad").hide();
                        ListarRegistros();
                        OpenCloseModal($("#modalSolicitud"), false);
                    }
                }
            },
            complete: function (data) {
                $("#txtRechazoSeguridad").val("");
                OpenCloseModal($("#modalObservarSeguridad"), false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function RegistrarAprobarOwner() {
    let data = {};
    data.SolDetalleId = $("#hdSolCabeceraId").val();
    data.Comentario = $("#txtAprobacionOwner").val();
    data.ProductoId = $("#hdProductoId").val();

    if ($("#formRecOw_Aprobar").valid()) {

        $.ajax({
            url: URL_API_VISTA + `/AprobarSolicitudOwner`,
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {

                        toastr.success("Se aprobó la solicitud correctamente", TITULO_MENSAJE);
                        $("#btnAprobarSolOwner").hide();
                        $("#btnObservarSolOwner").hide();
                        ListarRegistros();
                        OpenCloseModal($("#modalSolicitud"), false);
                    }
                }
            },
            complete: function (data) {
                $("#txtAprobacionOwner").val("");
                OpenCloseModal($("#modalAprobarOwner"), false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function RegistrarAprobarSeguridad() {
    let data = {};
    data.SolDetalleId = $("#hdSolCabeceraId").val();
    data.Comentario = $("#txtAprobacionSeguridad").val();
    data.ProductoId = $("#hdProductoId").val();

    if ($("#formRecSeg_Aprobar").valid()) {

        $.ajax({
            url: URL_API_VISTA + `/AprobarSolicitudSeguridad`,
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {

                        toastr.success("Se aprobó la solicitud correctamente", TITULO_MENSAJE);
                        $("#btnAprobarSolSeguridad").hide();
                        $("#btnObservarSolSeguridad").hide();
                        ListarRegistros();
                        OpenCloseModal($("#modalSolicitud"), false);
                    }
                }
            },
            complete: function (data) {
                $("#txtAprobacionSeguridad").val("");
                OpenCloseModal($("#modalAprobarSeguridad"), false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}
function irHistorial(id) {
    OpenCloseModal($("#modalHistorial"), true);

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableHistorial.bootstrapTable('destroy');
    $tableHistorial.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/HistorialSolicitud",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'HistorialId',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.SolicitudAplicacionId = id;
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

function validarFormApp() {


    $("#formRecOw").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtRechazoOwner: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtRechazoOwner: {
                requiredSinEspacios: String.Format("Debe ingresar {0}.", "el sustento de la observación"),
            }
        }
    });

    $("#formRecSeg").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtRechazoSeguridad: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtRechazoSeguridad: {
                requiredSinEspacios: String.Format("Debe ingresar {0}.", "el sustento de la observación"),
            }
        }
    });
    $("#formRecOw_Aprobar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        //rules: {
        //    txtAprobacionOwner: {
        //        requiredSinEspacios: true
        //    }
        //},
        //messages: {
        //    txtAprobacionOwner: {
        //        requiredSinEspacios: String.Format("Debe ingresar {0}.", "el sustento de la observación"),
        //    }
        //}
    });
    $("#formRecSeg_Aprobar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        //rules: {
        //    txtAprobacionSeguridad: {
        //        requiredSinEspacios: true
        //    }
        //},
        //messages: {
        //    txtAprobacionSeguridad: {
        //        requiredSinEspacios: String.Format("Debe ingresar {0}.", "el sustento de la observación"),
        //    }
        //}
    });

}

function InitMultiSelect()
{
    SetItemsMultiple([], $("#ddlEstado"), TEXTO_TODOS, TEXTO_TODOS, true);
}

function verResponsables(idSolicitud, idTipoSolicitud)
{
    

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    OpenCloseModal($("#modalResponsables"), true);

    $tableResponsables.bootstrapTable('destroy');
    $tableResponsables.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ResponsablesPorSolicitud",
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
            PARAMS_API.SolicitudAplicacionId = idSolicitud;
            PARAMS_API.TipoSolicitud = idTipoSolicitud;
            //PARAMS_API.pageNumber = p.pageNumber;
            //PARAMS_API.pageSize = p.pageSize;
            //PARAMS_API.sortName = p.sortName;
            //PARAMS_API.sortOrder = p.sortOrder;

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

function situacionFormatter(value, row, index) {
    var html = "";

    if (row.EstadoSolicitud == 5) { //VERDE - Atendido
        html = `<a class="btn btn-success btn-circle" title="Ver responsables de aprobación" onclick="javascript:verResponsables(${row.SolicitudId},'${row.IdTipoSolicitud}')"></a>`;
    } else { //ROJO - Observado
        html = `<a class="btn btn-danger btn-circle" title="Ver responsables de aprobación" onclick="javascript:verResponsables(${row.SolicitudId},'${row.IdTipoSolicitud}')"></a>`;
    }

    return html;
}

function estadoFormatter(value, row, index) {
    var html = "";
    if (row.EsAprobado === true) { //VERDE
        html = '<a class="btn btn-success btn-circle" title="Aprobado"></a>';
    } else if (row.EsAprobado === false) { //ROJO
        html = '<a class="btn btn-danger btn-circle" title="Pendiente de Aprobación"></a>';
    }
    return html;
}

function ListarDetalleSolicitud(idSolicitud) {
    
    $tableDetalle.bootstrapTable('destroy');
    $tableDetalle.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/DetalleSolicitudesRoles",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: 1,
        pageSize: 10,
        pageList: 10,
        sortName: 'Rol,GrupoRed,Tribu,Chapter,Funcion',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SolicitudAplicacionId = idSolicitud;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            var data = res;
            if (data.Total == 0) {
                bootbox.alert("El solicitante esta modificando los roles y funciones de esta solicitud.");
            } else {
                $("#modalSolicitud").modal(opcionesModal);
            }

            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
            bootbox.alert("Se produjo un error al listar los registros");
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

function rowStyle(row, index) {

    
    var classes = [
        //'bg-plomo',
        'bg-yellow'
    ];

    if (row.EsPendienteMio === 1) {
        return {
            classes: classes[0],
            css: {
                color: '#6F6F7C' //7d7d8e
            }
        };
    }

    //if (row.EsPendienteMio === true) {
    //    return {
    //        classes: classes[1],
    //        css: {
    //            color: '#6F6F7C' //7d7d8e
    //        }
    //    };
    //}
    //else
    //{
    //    if (row.EsRegistroMio === true) {
    //        return {
    //            classes: classes[0],
    //            css: {
    //                color: '#6F6F7C' //7d7d8e
    //            }
    //        };
    //    }
    //}

    return {
        css: {
            color: '#6F6F7C'
        }
    };
}

function formatOpcAmbiente(value, row, index) {
    var iconRemove = `<a class='btn btn-danger'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    
    $.ajax({
        url: URL_API_VISTA + `/ObtenerAmbienteRolProducto/${row.IdSolicitud}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //waitingDialog.hide();
                    let data = dataObject;
                    if (data.length > 0) {
                        //$tblAmbientesListar.bootstrapTable('destroy').bootstrapTable();
                        //for (var i = 0; i < data.Ambiente.length; i++) {
                        //    $tblAmbientesListar.bootstrapTable("append", {
                        //        //Id: data.Ambiente[i].RolesProductoAmbienteId,
                        //        AmbienteIdListar: data.Ambiente[i].RolesProductoAmbienteId,
                        //        AmbienteListar: {
                        //            //Id: data.Ambiente[i].RolesProductoAmbienteId,
                        //            AmbienteStr: data.Ambiente[i].AmbienteStr,
                        //            GrupoRed: data.Ambiente[i].GrupoRed
                        //        }
                        //    });
                        //}
                        //var ambiente = `<h5>` + data[0].GrupoRed + `
                        //            </h5>`;
                        //alert(data[0].GrupoRed);
                        return iconRemove;
                    }
                }
            }
        },
        complete: function () {
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: true
    });
    
}
