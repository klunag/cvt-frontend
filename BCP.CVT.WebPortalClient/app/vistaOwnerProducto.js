﻿var $table = $("#tbl-lista");
var $tblTecnologiasSingle = $("#tbl-tecnologias-single");
var $tblAplicacionesSingle = $("#tbl-aplicaciones-single");
var URL_API_VISTA = URL_API + "/Producto";
var DATA_EXPORTAR = {};
var LIST_SUBDOMINIO = [];
var LIST_TECNOLOGIASINGLE = [];
var LIST_APPSTECNOLOGIASINGLE = [];
var LIST_EQUIPOSTECNOLOGIASINGLE = [];
var LIST_SQUAD = [];
const TITULO_MENSAJE = "Vista de tecnologías por owner";
let userCount = 0;

$(function () {
    getCurrentUser();
});

$(document).ajaxComplete(function () {
    if (userCurrent != null && userCount == 0) {
        userCount++;
        $tblTecnologiasSingle.bootstrapTable();
        $tblAplicacionesSingle.bootstrapTable();
        $("#txtTecnologiaSingle").keyup(BuscarTecnologiasSingle);
        $("#txtAplicacionTecnologiaSingle").keyup(BuscarAplicacionesSingle);
        $("#txtEquipoTecnologiaSingle").keyup(BuscarEquiposSingle);
        InitAutocompletarTribuCoeProducto($("#txtBusUnidadOrganizativaTecnologia"), $("#txtBusUnidadOrganizativaTecnologiaId"), '.tribuCoeContainer', (item) => { cbTribuCoeIdProducto_Change(item) });
        InitAutocompletarProductoSearch($("#txtBusNombreTecnologia"), $("#hdBusNombreTecnologiaId"), ".searchProductoContainer");
        ListarCombos(() => {
            $("#cbBusDominioTecnologia").change(cbBusDominioTecnologia_Change);
            $("#cbBusSubDominioTecnologia").change(cbBusSubDominioTecnologia_Change);
            listarProductos();
        });
    }
});

function InitAutocompletarProductoSearch($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                let dominioIds = ($("#cbBusDominioTecnologia").val() || []).join(',');
                let subDominioIds = ($("#cbBusSubDominioTecnologia").val() || []).join(',');

                $.ajax({
                    url: URL_API + "/Producto" + `/ListadoByDescripcion?descripcion=${encodeURIComponent(request.term)}&dominioIds=${dominioIds}&subDominioIds=${subDominioIds}`,
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
            if ($searchBox.val() == "") $IdBox.val("");
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

function InitAutocompletarTribuCoeProducto($searchBox, $IdBox, $container, fn = null) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = `${URL_API}/it-management/plataform-operations/v2/siga/unidadorganizativa/relacionproducto/listarcomboxfiltro?filtro=${request.term}`;

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
                //$searchBox.val(ui.item.Descripcion);
                //$("#hdOwnerIdProducto").val(ui.item.CodigoPersonalResponsable);
                //$("#txtOwnerDisplayNameProducto").val(ui.item.NombresPersonalResponsable);
                //$("#hdOwnerMatriculaProducto").val(ui.item.MatriculaPersonalResponsable);
                //cbTribuCoeIdProducto_Change();
                if (typeof fn == "function") fn(ui.item);
            }
            return false;
        }
    })
        .keyup(function (e) {
            if ($searchBox.val() == "") {
                $IdBox.val("");
                SetItemsCustomField([], $("#cbBusSquadTecnologia"), TEXTO_TODOS, "Id", "Descripcion");
            }
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
            return $("<li>").append("<a style='display: block'><font>" + item.value + "</font></a>").appendTo(ul);
        };
}

function cbBusDominioTecnologia_Change() {
    LimpiarFiltroProducto();
    CargarSubDominioBusqueda();
}

function cbBusSubDominioTecnologia_Change() {
    LimpiarFiltroProducto();
}

function cbTribuCoeIdProducto_Change(item, fn = null) {
    let urlControllerWithParams = `${URL_API}/it-management/plataform-operations/v2/siga/squad/relacionproducto/listarcomboxfiltro?codigoUnidad=${item.Id}`;
    $.ajax({
        url: urlControllerWithParams,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (data) {
            LIST_SQUAD = data;
            //SetItemsCustomField(LIST_SQUAD, $("#"))
            SetItemsCustomField(LIST_SQUAD.map(x => x), $("#cbBusSquadTecnologia"), TEXTO_TODOS, "Id", "Descripcion");
            if (typeof fn == "function") fn();
        },
        async: true,
        global: false
    });
}

function listarProductos() {

    let dominioIds = ($("#cbBusDominioTecnologia").val() || []).join(',');
    let subDominioIds = ($("#cbBusSubDominioTecnologia").val() || []).join(',');
    let productoStr = $("#txtBusNombreTecnologia").val();
    let tribuCoeId = $("#txtBusUnidadOrganizativaTecnologiaId").val();
    let squadId = $("#cbBusSquadTecnologia").val() == "-1" ? "" : $("#cbBusSquadTecnologia").val();

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.dominioIds = dominioIds;
    DATA_EXPORTAR.subDominioIds = subDominioIds;
    DATA_EXPORTAR.productoStr = encodeURIComponent(productoStr);
    DATA_EXPORTAR.tribuCoeId = tribuCoeId;
    DATA_EXPORTAR.squadId = squadId;
    delete DATA_EXPORTAR.flagTribuCoe;

    //el rol E195_OwnerKPI_LiderCOE puede ver todos los registros sin necesidad de llenar la tribu y el squad
    if (userCurrent.Perfil.includes("E195_OwnerKPI_LiderCOE") || userCurrent.PerfilId == 1 || userCurrent.PerfilId == 21) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: `${URL_API_VISTA}/ListadoXOwner?dominioIds=${dominioIds}&subDominioIds=${subDominioIds}&productoStr=${DATA_EXPORTAR.productoStr}&tribuCoeId=${tribuCoeId}&squadId=${squadId}`,
            method: 'GET',
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pagination: true,
            sidePagination: 'server',
            queryParamsType: 'else',
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            sortName: 'TecnologiaId',
            sortOrder: 'asc',
            responseHandler: function (res) {
                AñadirBotonesScrollHorizontal($table);
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
    // si el rol es E195_OwnerKPI_IngenieroTecnologia o E195_OwnerKPI_LiderSquad, validara que la tribu y el squad tengan un valor, de lo contrario no mostrara ningun registro

    else if (userCurrent.Perfil.includes("E195_OwnerKPI_IngenieroTecnologia") || userCurrent.Perfil.includes("E195_OwnerKPI_LiderSquad")) {

        if ($("#txtBusUnidadOrganizativaTecnologiaId").val() != "") {
            if ($("#cbBusSquadTecnologia").val() != -1 || $('#cbBusSquadTecnologia option').length == 1) {
                let flagTribuCoe = $("#cbBusFlagOwnerTecnologia").val() == "-1" ? null : $("#cbBusFlagOwnerTecnologia").val() == "1";

                DATA_EXPORTAR.flagTribuCoe = flagTribuCoe;

                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $table.bootstrapTable('destroy');
                $table.bootstrapTable({
                    url: `${URL_API_VISTA}/ListadoXOwner?dominioIds=${dominioIds}&subDominioIds=${subDominioIds}&productoStr=${DATA_EXPORTAR.productoStr}&tribuCoeId=${tribuCoeId}&squadId=${squadId}&flagTribuCoe=${flagTribuCoe}`,
                    method: 'GET',
                    ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
                    pagination: true,
                    sidePagination: 'server',
                    queryParamsType: 'else',
                    pageSize: REGISTRO_PAGINACION,
                    pageList: OPCIONES_PAGINACION,
                    sortName: 'TecnologiaId',
                    sortOrder: 'asc',
                    responseHandler: function (res) {
                        AñadirBotonesScrollHorizontal($table);
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
            else {
                $table.bootstrapTable('destroy');
                $table.bootstrapTable();
            }
        }
        else {
            $table.bootstrapTable('destroy');
            $table.bootstrapTable();
        }
    }
    else {
        $table.bootstrapTable('destroy');
        $table.bootstrapTable();
    }
}

function linkFormatterNombre(value, row, index) {
    return `<a href="javascript:EditProducto(${row.Id})" title="Editar">${value}</a>`;
}

function linkFormatterVerTecnologiasTec(value, row, index) {
    let link = value == 0 ? value : `<a href="javascript:VerTecnologias(${row.ProductoId}, '${row.ProductoStr}')" title="Ver Tecnologías">${value}</a>`;

    return link;
}

function linkFormatterVerAplicacionesTec(value, row, index) {
    let link = value == 0 ? value : `<a href="javascript:VerAplicaciones(${row.ProductoId}, '${row.ProductoStr}')" title="Ver Aplicaciones">${value}</a>`;

    return link;
}

function linkFormatterVerEquiposTec(value, row, index) {
    let tipoEquipoId = this.field.toLowerCase() == "totalinstanciasservidores" ? 1 : this.field.toLowerCase() == "totalinstanciasservicionube" ? 4 : this.field.toLowerCase() == "totalinstanciaspcs" ? 3 : null;
    let tipoEquipoStr = tipoEquipoId == 1 ? "Servidores" : tipoEquipoId == 4 ? "Servicio Azure" : tipoEquipoId == 3 ? "PC&#39;s" : null;
    let link = value == 0 ? value : `<a href='javascript:VerEquipos(${row.ProductoId}, ${tipoEquipoId}, "${tipoEquipoStr}", "${row.ProductoStr}")' title="Ver Equipos">${value}</a>`;

    return link;
}

function VerTecnologias(ProductoId, ProductoStr) {
    //let data_add = { DominioStr, SubDominioStr, Fabricante, Nombre };
    ListarTecnologias(ProductoId, () => {
        //$("#formAplicaciones").attr("data-tipo-tecnologia-id", TipoTecnologiaId);
        //$("#formAplicaciones").attr("data-tecnologia-id", TecnologiaId);
        MdAddTecnologias(true);
        $("#MdTecnologiaByTecnologiaTitle").html(ProductoStr);
        $("#btnBusExportarTecnologia").attr("onclick", `ExportarInfoTecnologia(${ProductoId}, '${ProductoStr}')`);
    })
}

function BuscarTecnologiasSingle() {
    let valor = $("#txtTecnologiaSingle").val();

    let resultados = LIST_TECNOLOGIASINGLE.filter(x =>
        (x.ClaveTecnologia || '').toLowerCase().includes(valor.toLowerCase()) ||
        (x.EstadoStr || '').toLowerCase().includes(valor.toLowerCase()) ||
        (x.TipoTecnologia || '').toLowerCase().includes(valor.toLowerCase()) ||
        (x.TotalInstanciasServidores.toString() || '').toLowerCase().includes(valor.toLowerCase()) ||
        (x.TotalInstanciasServicioNube.toString() || '').toLowerCase().includes(valor.toLowerCase()) ||
        (x.TotalInstanciasPcs.toString() || '').toLowerCase().includes(valor.toLowerCase()) ||
        (x.TotalAplicaciones.toString() || '').toLowerCase().includes(valor.toLowerCase()) ||
        (x.FechaCalculoValorTecStr || '').toLowerCase().includes(valor.toLowerCase())
    );

    $tblTecnologiasSingle.bootstrapTable("load", resultados.map(x => x));
}

function VerAplicaciones(ProductoId, ProductoStr) {
    //let data_add = { DominioStr, SubDominioStr, Fabricante, Nombre };
    ListarAppsTecnologia(ProductoId, () => {
        //$("#formAplicaciones").attr("data-tipo-tecnologia-id", TipoTecnologiaId);
        //$("#formAplicaciones").attr("data-tecnologia-id", TecnologiaId);
        MdAddAppsTecnologia(true);
        $("#MdAppsByTecnologiaTitle").html(ProductoStr);
        $("#btnBusExportarAplicacion").attr("onclick", `ExportarInfoAplicacion(${ProductoId}, '${ProductoStr}')`);
    })
}

function BuscarAplicacionesSingle() {
    let valor = $("#txtAplicacionTecnologiaSingle").val();

    let resultados = LIST_APPSTECNOLOGIASINGLE.filter(x =>
        (x.Tecnologia.ClaveTecnologia || '').toLowerCase().includes(valor.toLowerCase()) ||
        (x.Aplicacion.CodigoAPT || '').toLowerCase().includes(valor.toLowerCase()) ||
        (x.Aplicacion.Nombre || '').toLowerCase().includes(valor.toLowerCase()) ||
        (x.Aplicacion.GestionadoPor || '').toLowerCase().includes(valor.toLowerCase())
    );

    $tblAplicacionesSingle.bootstrapTable("load", resultados.map(x => x));
}

function VerEquipos(ProductoId, TipoEquipoId, TipoEquipoStr, ProductoStr) {
    TipoEquipoStr = TipoEquipoStr.replace("'", "&#39;");
    ListarEquiposTecnologia(ProductoId, TipoEquipoId, () => {
        MdAddEquipoTecnologia(true);
        $("#textTipoEquipo").html(TipoEquipoStr);
        $("#MdEquiposByTecnologiaTitle").html(ProductoStr);
        $("#btnBusExportarEquipo").attr("onclick", `ExportarInfoEquipo(${ProductoId}, ${TipoEquipoId}, '${ProductoStr}', '${TipoEquipoStr}')`);
    })
}

function BuscarEquiposSingle() {
    let valor = $("#txtEquipoTecnologiaSingle").val();

    let resultados = LIST_EQUIPOSTECNOLOGIASINGLE.filter(x =>
        (x.Nombre || '').toLowerCase().includes(valor.toLowerCase()) ||
        (x.ClaveTecnologia || '').toLowerCase().includes(valor.toLowerCase()) ||
        (x.TipoEquipoId != 4 ? (x.SistemaOperativo || '') : (x.Suscripcion || '')).toLowerCase().includes(valor.toLowerCase())
    );

    $("#divEquipoLista").find('table').bootstrapTable("load", resultados.map(x => x));
}

function ExportarInfoConsolidado() {


    if (userCurrent.Perfil.includes("E195_OwnerKPI_IngenieroTecnologia") || userCurrent.Perfil.includes("E195_OwnerKPI_LiderSquad")) {

        if ($("#txtBusUnidadOrganizativaTecnologiaId").val() != "" && ($("#cbBusSquadTecnologia").val() != -1 || $("#cbBusSquadTecnologia option").length == 1)) {

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

            let { dominioIds, subDominioIds, productoStr, tribuCoeId, squadId } = DATA_EXPORTAR;
            let { sortName, sortOrder } = $table.bootstrapTable('getOptions');
            let url = `${URL_API_VISTA}/ExportarListadoXOwnerConsolidado?dominioIds=${dominioIds}&subDominioIds=${subDominioIds}&productoStr=${productoStr}&tribuCoeId=${tribuCoeId}&squadId=${squadId}&sortName=${sortName}&sortOrder=${sortOrder}`;
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
        else {
            bootbox.alert({
                size: "small",
                title: "Productos de Tecnologías",
                message: "Se deben llenar los campos tribu y squad.",
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-primary'
                    }
                }
            });

        }
    }
    else {
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

        let { dominioIds, subDominioIds, productoStr, tribuCoeId, squadId } = DATA_EXPORTAR;
        let { sortName, sortOrder } = $table.bootstrapTable('getOptions');
        let url = `${URL_API_VISTA}/ExportarListadoXOwnerConsolidado?dominioIds=${dominioIds}&subDominioIds=${subDominioIds}&productoStr=${productoStr}&tribuCoeId=${tribuCoeId}&squadId=${squadId}&sortName=${sortName}&sortOrder=${sortOrder}`;
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
}

function ExportarInfoDetallado() {

    if (userCurrent.Perfil.includes("E195_OwnerKPI_IngenieroTecnologia") || userCurrent.Perfil.includes("E195_OwnerKPI_LiderSquad")) {

        if ($("#txtBusUnidadOrganizativaTecnologiaId").val() != "" && ($("#cbBusSquadTecnologia").val() != -1 || $("#cbBusSquadTecnologia option").length == 1)) {
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

            let { dominioIds, subDominioIds, productoStr, tribuCoeId, squadId } = DATA_EXPORTAR;
            let { sortName, sortOrder } = $table.bootstrapTable('getOptions');
            let url = `${URL_API_VISTA}/ExportarListadoXOwnerDetallado?dominioIds=${dominioIds}&subDominioIds=${subDominioIds}&productoStr=${productoStr}&tribuCoeId=${tribuCoeId}&squadId=${squadId}&sortName=${sortName}&sortOrder=${sortOrder}`;
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
        else {
            bootbox.alert({

                size: "small",
                title: "Productos de Tecnologías",
                message: "Se deben llenar los campos tribu y squad.",
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-primary'
                    }
                }
            });

        }
    }
    else {
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

        let { dominioIds, subDominioIds, productoStr, tribuCoeId, squadId } = DATA_EXPORTAR;
        let { sortName, sortOrder } = $table.bootstrapTable('getOptions');
        let url = `${URL_API_VISTA}/ExportarListadoXOwnerConsolidado?dominioIds=${dominioIds}&subDominioIds=${subDominioIds}&productoStr=${productoStr}&tribuCoeId=${tribuCoeId}&squadId=${squadId}&sortName=${sortName}&sortOrder=${sortOrder}`;
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
}

function ListarCombos(fn = null) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/TecnologiaOwner/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    LIST_SUBDOMINIO = dataObject.SubDominio;
                    //SetItems(dataObject.EstadoObsolescencia, $("#cbBusEstadoObsolescenciaProducto"), TEXTO_TODOS);
                    SetItemsMultiple(dataObject.Dominio, $("#cbBusDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(LIST_SUBDOMINIO.map(x => x), $("#cbBusSubDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);

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

function CargarSubDominioBusqueda() {
    let dominioId = $("#cbBusDominioTecnologia").val() || [];
    let listSubDominio = LIST_SUBDOMINIO.filter(x => dominioId.some(y => y == x.TipoId) || dominioId.length == 0);
    SetItemsMultiple(listSubDominio, $("#cbBusSubDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
    //SetItems(listSubDominio, $("#cbBusSubDominioTecnologia"), TEXTO_TODOS);
}

function ListarTecnologias(productoId, fn = null, data_add = {}) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API}/Tecnologia/ListadoXOwnerProducto?productoId=${productoId}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (typeof fn == "function") fn();
            LIST_TECNOLOGIASINGLE = (result || []).map(x => Object.assign({ ...data_add }, { ...x }));
            $tblTecnologiasSingle.bootstrapTable("load", LIST_TECNOLOGIASINGLE.map(x => x));
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function limpiarMdAddTecnologias() {
    LimpiarValidateErrores($("#formTecnologias"));

    $("#txtTecnologiaSingle").val("");
    $("#hdTecnologiaIdSingle").val("");
    LIST_TECNOLOGIASINGLE = [];
    $tblTecnologiasSingle.bootstrapTable('removeAll');
}

function MdAddTecnologias(EstadoMd) {
    limpiarMdAddTecnologias();
    if (EstadoMd)
        $("#MdTecnologiaByTecnologia").modal(opcionesModal);
    else
        $("#MdTecnologiaByTecnologia").modal('hide');
}

function ListarAppsTecnologia(productoId, fn = null, data_add = {}) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API + "/Producto/TecnologiaAplicacion/Listado?productoId=" + productoId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (typeof fn == "function") fn();
            LIST_APPSTECNOLOGIASINGLE = (result || []).map(x => Object.assign({ ...data_add }, { ...x }));
            $tblAplicacionesSingle.bootstrapTable("load", LIST_APPSTECNOLOGIASINGLE.map(x => x));
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

function ListarEquiposTecnologia(productoId, tipoEquipoId, fn = null, data_add = {}) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: `${URL_API}/Equipo/ProductoOwner/ListarEquipoByProductoTipoEquipo?productoId=${productoId}&tipoEquipoId=${tipoEquipoId}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (typeof fn == "function") fn();
            LIST_EQUIPOSTECNOLOGIASINGLE = (result || []).map(x => Object.assign({ ...data_add }, { ...x }));
            buildTableEquipo($("#divEquipoLista").html('<table class="responsive" data-pagination="true"></table>').find('table'), LIST_EQUIPOSTECNOLOGIASINGLE.map(x => x), tipoEquipoId);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function buildTableEquipo($el, data, tipoEquipoId) {
    var columns = [];

    let headerNombreEquipo = tipoEquipoId == 1 ? 'Nombre Servidor' : tipoEquipoId == 4 ? 'Nombre Componente' : tipoEquipoId == 3 ? 'Nombre Pc' : '';

    columns.push({
        field: 'Nombre',
        //formatter: nombreReporteFormatter,
        title: headerNombreEquipo,
    });

    columns.push({
        field: 'ClaveTecnologia',
        //formatter: nombreReporteFormatter,
        title: 'Tecnología',
    });

    if (tipoEquipoId != 4) {
        columns.push({
            field: 'SistemaOperativo',
            title: 'Sistema Operativo',
        });
    } else {
        columns.push({
            field: 'Suscripcion',
            title: 'Suscripción',
        });
    }

    $el.bootstrapTable({
        columns: columns,
        data: data,
        showHeader: true,
    });
}

function limpiarMdAddEquipoTecnologia() {
    LimpiarValidateErrores($("#formEquipos"));

    $("#hdEquipoIdTecnologiaSingle").val("");
    $("#txtEquipoTecnologiaSingle").val("");
    LIST_EQUIPOSTECNOLOGIASINGLE = [];
    $("#divEquipoLista").html("");
    //$tblAplicacionesSingle.bootstrapTable('removeAll');
}

function MdAddEquipoTecnologia(EstadoMd) {
    limpiarMdAddEquipoTecnologia();
    if (EstadoMd)
        $("#MdEquiposByTecnologia").modal(opcionesModal);
    else
        $("#MdEquiposByTecnologia").modal('hide');
}

function ExportarInfoTecnologia(productoId, productoStr) {

    let _data = $tblTecnologiasSingle.bootstrapTable("getData") || [];
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

    let valor = $("#txtTecnologiaSingle").val();
    let url = `${URL_API}/Tecnologia/ExportarListadoXOwnerProducto?productoId=${productoId}&productoStr=${productoStr}&filtro=${valor}`;
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

function ExportarInfoEquipo(productoId, tipoEquipoId, productoStr, tipoEquipoStr) {
    let data = $("#divEquipoLista").find('table').bootstrapTable("getData");
    if (data.length == 0) {
        bootbox.alert("No hay registros para exportar");
        return;
    }
    let valor = $("#txtEquipoTecnologiaSingle").val();
    tipoEquipoStr = $("<div></div>").html(tipoEquipoStr).text();
    let url = `${URL_API}/Equipo/ProductoOwner/ExportarListarEquipoByProductoTipoEquipo?productoId=${productoId}&tipoEquipoId=${tipoEquipoId}&productoStr=${productoStr}&tipoEquipoStr=${tipoEquipoStr}&filtro=${encodeURIComponent(valor)}`;
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

function ExportarInfoAplicacion(productoId, productoStr) {
    let data = $tblAplicacionesSingle.bootstrapTable("getData");
    if (data.length == 0) {
        bootbox.alert("No hay registros para exportar");
        return;
    }
    let valor = $("#txtAplicacionTecnologiaSingle").val();
    let url = `${URL_API}/Producto/TecnologiaAplicacion/ExportarListado?productoId=${productoId}&productoStr=${productoStr}&filtro=${valor}`;
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

function LimpiarFiltroProducto() {
    $("#txtBusNombreTecnologia").val("");
    $("#hdBusNombreTecnologiaId").val("");
}