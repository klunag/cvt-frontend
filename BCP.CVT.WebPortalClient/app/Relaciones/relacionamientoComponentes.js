var $table = $("#tblRegistro");
var $tableApp_Componentes = $("#tblApp_Componentes");
var URL_API_VISTA = URL_API + "/Aplicacion";
var URL_API_USUARIO = URL_API + "/Usuario";
var ITEMS_REMOVEID = [];
var ITEMS_REMOVEID_COMPONENTES = [];
var ITEMS_ACTIVARID_COMPONENTES = [];
var ITEMS_ADDID = [];
var ITEMS_ADDID_COMPONENTES = [];
var DATA_MATRICULA = [];
var FLAG_TENEMOS_MATRICULA = false;
var DATA_EXPORTAR = {};
var USUARIO_DATOS = {};
var TITULO_MENSAJE = "Aplicación";
var IDS_APPEXPERTOS_DISABLED = [];
var CURRENT_CODAPTs_FILTERED = [];
var DATA_ETIQUETAS = [];
var CODIGOAPT = '';

$(function () {
    getCurrentUser();
    InitTables();

    InitAutocompletarBuilder($("#txtAplicacion"), $("#hAplicacion"), ".appContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");

    ListarRegistros();

    setDefaultHd($("#txtAplicacion"), $("#hAplicacion"));
});

function InitTables() {
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({ data: [] });

    $tableApp_Componentes.bootstrapTable("destroy");
    $tableApp_Componentes.bootstrapTable({ data: [] });
}

function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado_Infra",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        sortName: "CodigoAPT",
        sortOrder: "asc",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            //DATA_EXPORTAR.nombre = $.trim($("#txtFiltro").val());
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            //DATA_EXPORTAR.CriticidadId = $("#cbFiltroCriticidad").val() == "-1" ? null : $("#cbFiltroCriticidad").val();
            DATA_EXPORTAR.Gerencia = $("#cbFiltroGerencia").val() === "-1" ? null : $("#cbFiltroGerencia").val();
            DATA_EXPORTAR.Division = $("#cbFiltroDivision").val() === "-1" ? null : $("#cbFiltroDivision").val();
            DATA_EXPORTAR.Unidad = $("#cbFiltroUnidad").val() === "-1" ? null : $("#cbFiltroUnidad").val();
            DATA_EXPORTAR.Area = $("#cbFiltroArea").val() === "-1" ? null : $("#cbFiltroArea").val();
            DATA_EXPORTAR.Estado = $("#cbFiltroEstado").val() === "-1" ? null : $("#cbFiltroEstado").val();
            DATA_EXPORTAR.UnidadFondeoId = $("#cbUnidadFondeo").val() === "-1" ? 0 : $("#cbUnidadFondeo").val();
            DATA_EXPORTAR.JefeEquipo = $.trim($("#txtLiderTribu").val());
            DATA_EXPORTAR.Owner = $.trim($("#txtProduct").val());
            DATA_EXPORTAR.Aplicacion = $("#hAplicacion").val() !== "0" ? $("#hAplicacion").val() : $.trim($("#txtAplicacion").val());

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            CURRENT_CODAPTs_FILTERED = data.ArrCodigoAPT || "";
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

function RefrescarListado() {
    ListarRegistros();
}

function opcionesFormatter(value, row) {
    let editarComponentes = `<a href="javascript:IrObtenerComponentesApp('${value}');" title="Editar relaciones Diagr. Infraestructura"><i style="" class="glyphicon glyphicon-link table-icon"></i></a>`;
    return editarComponentes
}

function InitAutocompletarBuilder_Componente($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API + urlControllerWithParams,
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
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                $("#hTipoEquipoId").val(ui.item.TipoEquipoId);
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
function InitAutocompletarBuilder_ConectaCon($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API + urlControllerWithParams,
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
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                $("#hTipoEquipoId_Relacion").val(ui.item.TipoEquipoId);
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

function IrObtenerComponentesApp(Id) {
    InitAutocompletarBuilder_Componente($("#txtEquipo"), $("#hEquipoId"), ".containerFiltro", "/Aplicacion/GetComponenteByFiltro?filtro={0}&codigoApt=" + Id);
    InitAutocompletarBuilder_ConectaCon($("#txtEquipo_Relacionado"), $("#hEquipoId_Relacionado"), ".containerFiltro_EquipoRelacionado", "/Aplicacion/GetComponenteByFiltro?filtro={0}&codigoApt=" + Id);

    $("#titleForm_Componentes").html("Configurar componentes");
    let request = {
        CodigoAPT: Id,
        AmbienteId: 1
    };
    $.ajax({
        url: URL_API_VISTA + `/ObtenerComponentesApp`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(request),
        dataType: "json",
        success: function (result) {
            MdAddOrEditRegistro_Componentes(true);
            $("#hdId_Componente").val(Id);
            $tableApp_Componentes.bootstrapTable("destroy");
            $tableApp_Componentes.bootstrapTable({ data: result });
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}
function MdAddOrEditRegistro_Componentes(EstadoMd) {
    LimpiarMdAddOrEditRegistro_Componentes();
    if (EstadoMd)
        $("#MdAddOrEditModal_Componentes").modal(opcionesModal);
    else
        $("#MdAddOrEditModal_Componentes").modal("hide");
}
function LimpiarMdAddOrEditRegistro_Componentes() {
    $("#formRegistro_Componentes").validate().resetForm();
    $(":input", "#formRegistro_Componentes")
        .not(":button, :submit, :reset, :hidden")
        .val("")
        .removeAttr("checked")
        .removeAttr("selected");
    ITEMS_REMOVEID_COMPONENTES = [];
    ITEMS_ACTIVARID_COMPONENTES = [];
    ITEMS_ADDID_COMPONENTES = [];
    $("#hdId_Componente").val("");
    $tableApp_Componentes.bootstrapTable("destroy");
    $tableApp_Componentes.bootstrapTable({ data: [] });
    toastr.clear();

    $("#txtEquipo").val("");
    $("#hEquipoId").val("0");
    $("#txtEquipo_Relacionado").val("");
    $("#hEquipoId_Relacionado").val("0");
    $("#hTipoEquipoId").val("0");
    $("#hTipoEquipoId_Relacion").val("0");
}
function opcionesFormatterApp_Componentes(value, row) {
    let opciones = '';
    if (row.Estado == 'Activo') {
        opciones = `<a class='btn btn-danger' href="javascript:removeItem_Componentes('${row.RelacionReglasPorAppId}','${row.EquipoId_Relacion}');" title="Desactivar registro"><span class='icon icon-close'></span></a>`;
    } else if (row.Estado == 'Inactivo') {
        opciones = `<a class='btn btn-success' href="javascript:activarItem_Componentes('${row.RelacionReglasPorAppId}');" title="Activar registro"><span class='icon icon-check'></span></a>`;
    }

    return opciones;
}
function removeItem_Componentes(AEid, TEId) {
    bootbox.confirm({
        title: "Desactivar registro",
        message: "¿Estás seguro que deseas desactivar el registro?",
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
                    RelacionReglasPorAppId: AEid
                };

                let existe = ITEMS_REMOVEID_COMPONENTES.find(x => x.RelacionReglasPorAppId === AEid && x.EquipoId_Relacion === TEId) || null;
                if (existe === null) {
                    ITEMS_REMOVEID_COMPONENTES.push(data);
                }
                GuardarRegistro_Componentes();
            }
        }
    });
}
function activarItem_Componentes(RRPAid) {
    bootbox.confirm({
        title: "Activar registro",
        message: "¿Estás seguro que deseas activar el registro?",
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
                    RelacionReglasPorAppId: RRPAid
                };

                let existe = ITEMS_ACTIVARID_COMPONENTES.find(x => x.RelacionReglasPorAppId === RRPAid) || null;
                if (existe === null) {
                    ITEMS_ACTIVARID_COMPONENTES.push(data);
                }
                GuardarRegistro_Componentes();
            }
        }
    });
}
function addItem_Componente() {
    if ($("#formRegistro_Componentes").valid()) {
        AgregarComponenteConexion();
    }
}
function AgregarComponenteConexion() {
    if ($("#hEquipoId").val() != "0" && $("#hEquipoId_Relacionado").val() != "0") {
        if ($("#hEquipoId").val() != $("#hEquipoId_Relacionado").val()) {
            var lstConectados = $tableApp_Componentes.bootstrapTable("getData");
            var flagEsDuplicado = false;
            for (var i = 0; i < lstConectados.length; i++) {
                if ((lstConectados[i].EquipoId == $("#hEquipoId").val() && lstConectados[i].EquipoId_Relacion == $("#hEquipoId_Relacionado").val())
                    || (lstConectados[i].EquipoId_Relacion == $("#hEquipoId").val() && lstConectados[i].EquipoId == $("#hEquipoId_Relacionado").val())
                ) {
                    flagEsDuplicado = true
                }
            }
            if (flagEsDuplicado == false) {
                $tableApp_Componentes.bootstrapTable('append', {
                    Nombre: $("#txtEquipo").val(),
                    Nombre_EquipoRelacion: $("#txtEquipo_Relacionado").val(),
                    EquipoId: $("#hEquipoId").val(),
                    EquipoId_Relacion: $("#hEquipoId_Relacionado").val(),
                    CodigoApt: $("#hdId_Componente").val(),
                    TipoEquipoId: $("#hTipoEquipoId").val(),
                    TipoEquipoId_Relacion: $("#hTipoEquipoId_Relacion").val()
                });
                $("#txtEquipo").val("");
                $("#hEquipoId").val("0");
                $("#txtEquipo_Relacionado").val("");
                $("#hEquipoId_Relacionado").val("0");
                $("#hTipoEquipoId").val("0");
                $("#hTipoEquipoId_Relacion").val("0");
                GuardarRegistro_Componentes();
            } else {
                bootbox.alert("La conexión ya existe");
            }

        } else {
            bootbox.alert("No es posible conectar un componente consigo mismo");
        }

    } else {
        bootbox.alert("Inserte un componente y su correspondiente conexión");
    }

}
function GuardarRegistro_Componentes() {
    if ($("#formRegistro_Componentes").valid()) {

        $("#btnGuardarRegistro_Componentes").button("loading");

        ITEMS_ADDID_COMPONENTES = $tableApp_Componentes.bootstrapTable("getData");

        let data = {
            CodigoAPT: $("#hdId_Componente").val(),
            ListIdsRegistrar: ITEMS_ADDID_COMPONENTES,
            ListIdsEliminar: ITEMS_REMOVEID_COMPONENTES,
            ListIdsActivar: ITEMS_ACTIVARID_COMPONENTES,
        };

        $.ajax({
            url: URL_API_VISTA + "/ActualizarComponentesApp",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                $("#btnGuardarRegistro_Componentes").button("reset");
                if (result) {
                    toastr.success("El registro se actualizó correctamente.", TITULO_MENSAJE);
                    let request = {
                        CodigoAPT: $("#hdId_Componente").val(),
                        AmbienteId: 1
                    };
                    $.ajax({
                        url: URL_API_VISTA + `/ObtenerComponentesApp`,
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(request),
                        dataType: "json",
                        success: function (result) {
                            $tableApp_Componentes.bootstrapTable("destroy");
                            $tableApp_Componentes.bootstrapTable({ data: result });
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        },
                        async: false
                    });
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}