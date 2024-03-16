var $table = $("#tblRegistros");
var $table2 = $("#tblRegistrosDetalle2");
var $tablePersonas = $("#tblPersonas");
var URL_API_VISTA = URL_API + "/Aplicacion/ConfiguracionPortafolio";
var URL_API_VISTA_DESCARGA = URL_API + "/Solicitud";
var DATA_EXPORTAR = {};
const TITULO_MENSAJE = "Confirmación";
const MENSAJE = "¿Estás seguro que deseas agregar esta función al rol seleccionado?";
const MENSAJE2 = "¿Estás seguro que deseas eliminar esta función del rol seleccionado?";
const MENSAJE3 = "¿Estás seguro que deseas modificar esta función del rol seleccionado?";

var $idTabla = "";

var data = {};

$(function () {


    //cargarCombos();
    ListarRegistros();



    $("#btnAgregar").click(AgregarRol);
    $("#btnEditar").click(EditarRol);

    $("#btnExportar").click(ExportarInfo);
    //$("#btnExportarPer").click(ExportarInfoPersona);

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        if (row.NroAlertasDetalle !== 0) {
            ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
            $idTabla = $('#tblRegistrosDetalle_' + row.Id);
            $idTabla.on('expand-row.bs.table', function (e, index, row, $detail) {
                if (row.NroAlertasDetalle !== 0) {
                    ListarAlertasDetalle2(row.Id, $('#tblRegistrosDetalle2_' + row.Id), $detail);
                } else {
                    $detail.empty().append("No existen registros.");
                }
                //ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
            });
        } else {
            $detail.empty().append("No existen registros.");
        }
        //ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
    });
    //InitAutocompletarEstandarBuilder($("#txtChapter"), $("#hdChapter"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");
    //InitAutocompletarEstandarBuilder2($("#txtFuncion"), $("#hdFuncion"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");
    //InitAutocompletarEstandarBuilderTribu($("#txtTribu"), $("#hdTribu"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");

    //InitAutocompletarEstandarBuilder3($("#txtChapter2"), $("#hdChapter2"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");
    //InitAutocompletarEstandarBuilder4($("#txtFuncion2"), $("#hdFuncion2"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");
    //InitAutocompletarEstandarBuilderTribu2($("#txtTribu2"), $("#hdTribu2"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");

    InitAutocompletarEstandarBuilderProducto($("#txtProducto"), $("#hdProd"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");


});

function InitAutocompletarEstandarBuilderProducto($searchBox, $IdBox, $container, urlController) {
    //let data = CrearObjAplicacion2();


    data.Producto = $("#txtProducto").val();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
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

function ExportarInfo() {

    //if ($("#ddlReporte").val() == 1) {

        let _data = $table.bootstrapTable("getData") || [];
        if (_data.length === 0) {
            MensajeNoExportar(TITULO_MENSAJE);
            return false;
        }

        DATA_EXPORTAR = {};
        DATA_EXPORTAR.Producto = "";
        DATA_EXPORTAR.Chapter = $("#txtChapter").val();
        DATA_EXPORTAR.Funcion = $("#txtFuncion").val();


        DATA_EXPORTAR.sortName = 'Chapter';
        DATA_EXPORTAR.sortOrder = 'asc';


        let url = `${URL_API_VISTA}/ExportarFunciones3?funcion=${DATA_EXPORTAR.Funcion}&chapter=${DATA_EXPORTAR.Chapter}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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
    //}
    //else if ($("#ddlReporte").val() == 2) {
    //    let _data = $table.bootstrapTable("getData") || [];
    //    if (_data.length === 0) {
    //        MensajeNoExportar(TITULO_MENSAJE);
    //        return false;
    //    }

    //    DATA_EXPORTAR = {};
    //    DATA_EXPORTAR.Producto = "";
    //    DATA_EXPORTAR.Chapter = $("#txtChapter").val();
    //    DATA_EXPORTAR.Funcion = $("#txtFuncion").val();


    //    DATA_EXPORTAR.sortName = 'Chapter';
    //    DATA_EXPORTAR.sortOrder = 'asc';


    //    let url = `${URL_API_VISTA}/ExportarFuncionesPersonas2?funcion=${DATA_EXPORTAR.Funcion}&chapter=${DATA_EXPORTAR.Chapter}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
    //    window.location.href = url;
    //}
}

function ExportarInfoPersona() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Producto = $('#txtProducto').val();



    DATA_EXPORTAR.sortName = 'Chapter';
    DATA_EXPORTAR.sortOrder = 'asc';


    let url = `${URL_API_VISTA}/ExportarFuncionesPersonas?Producto=${DATA_EXPORTAR.Producto}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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



function InitAutocompletarEstandarBuilder($searchBox, $IdBox, $container, urlController) {
    //let data = CrearObjAplicacion2();


    data.Chapter = $("#txtChapter").val();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Chapter = request.term;

                data.Tribu = $("#hdTribu").val();

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetChapterByFiltro`,
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
            $searchBox.val(ui.item.Chapter);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Chapter);
                $("#hdChapter").val(ui.item.Chapter);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Chapter + "</font></a>").appendTo(ul);
    };
}

function CrearObjAplicacion2() {
    var data = {};
    data.Chapter = $("#txtChapter").val();


    return data;
}
function InitAutocompletarEstandarBuilder2($searchBox, $IdBox, $container, urlController) {
    let data = CrearObjAplicacion3();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Funcion = request.term;
                data.Chapter = $("#hdChapter").val();
                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetFuncionByFiltro`,
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
            $searchBox.val(ui.item.Funcion);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Funcion);
                $("#hdFuncion").val(ui.item.Funcion);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Funcion + "</font></a>").appendTo(ul);
    };
}

function CrearObjAplicacion3() {
    var data2 = {};
    data2.Funcion = $("#txtFuncion").val();
    data2.Chapter = $("#hdChapter").val();


    return data2;
}

function InitAutocompletarEstandarBuilder3($searchBox, $IdBox, $container, urlController) {
    let data = CrearObjAplicacion4();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Chapter = request.term;
                data.Tribu = $("#hdTribu").val();
                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetChapterByFiltro`,
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
            $searchBox.val(ui.item.Chapter);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Chapter);
                $("#hdChapter2").val(ui.item.Chapter);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Chapter + "</font></a>").appendTo(ul);
    };
}

function CrearObjAplicacion4() {
    var data3 = {};
    data3.Chapter = $("#txtChapter2").val();


    return data3;
}

function InitAutocompletarEstandarBuilder4($searchBox, $IdBox, $container, urlController) {
    let data = CrearObjAplicacion5();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                data.Funcion = request.term;
                data.Chapter = $("#hdChapter2").val();
                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetFuncionByFiltro`,
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
            $searchBox.val(ui.item.Funcion);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Funcion);
                $("#hdFuncion2").val(ui.item.Funcion);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Funcion + "</font></a>").appendTo(ul);
    };
}

function CrearObjAplicacion5() {
    var data4 = {};
    data4.Funcion = $("#txtFuncion2").val();
    data4.Chapter = $("#hdChapter2").val();


    return data4;
}
function cargarCombos() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/RolesProductosCombo",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Dominio, $("#ddlDominio"), TEXTO_SELECCIONE);
                    SetItems(dataObject.SubDominio, $("#ddlSubDominio"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}



function EditarRol() {
    let data = {};
    data.FuncionProductoId = $("#hdFuncionId").val();
    data.Chapter = $("#hdChapter2").val();
    data.Funcion = $("#hdFuncion2").val();

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE3,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/EditarRolProducto`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se editó el rol del producto correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        $("#btnEditar").button("reset");
                        waitingDialog.hide();
                        OpenCloseModal($("#modalEditarRol"), false);


                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}

function AgregarRol() {
    let data = {};
    data.RolProductoId = $("#hdRolProductoId").val();
    data.Chapter = $("#hdChapter").val();
    data.Funcion = $("#hdFuncion").val();

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/AgregarFuncion`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se agregó la función al rol correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        $("#btnAgregar").button("reset");
                        waitingDialog.hide();
                        OpenCloseModal($("#modalAgregarRol"), false);


                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}

function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Productos",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Producto = $("#txtProducto").val();
            DATA_EXPORTAR.DominioId = -1;
            DATA_EXPORTAR.SubDominioId = -1;
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
        }
    });
}

function RefrescarListado() {
    ListarRegistros();
}

//function ExportarInfo() {
//    DATA_EXPORTAR = {};
//    DATA_EXPORTAR.CodigoApt = $.trim($("#txtCodigoApt").val());

//    let url = `${URL_API_VISTA}/Bitacora/Exportar?codigoApt=${DATA_EXPORTAR.CodigoApt}`;
//    window.location.href = url;
//}

function detailFormatter(index, row) {
    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-unique-id="Id" data-mobile-responsive="true" data-check-on-init="true" data-detail-view="true" data-pagination="true" data-detail-formatter="detailFormatter2"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="5%">#</th>\
                                    <th data-field="Rol" data-halign="center" data-valign="middle" data-align="left" data-width="25%">Rol</th>\
                                     <th data-field="GrupoRed" data-halign="center" data-valign="middle" data-align="left" data-width="25%">Grupo de Red</th>\
         <th data-field="Descripcion" data-halign="center" data-valign="middle" data-align="left" data-width="25%">Descripción</th>\
            <th data-field="FuncionesRelacionadas" data-halign="center" data-valign="middle" data-align="left" data-width="10%">Funciones Relacionadas</th>\
                                </tr>\
                            </thead>\
                        </table>', row.Id);
    return html;
}

function detailFormatter2(index, row) {
    var html = String.Format('<table id="tblRegistrosDetalle2_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="10%">#</th>\
                                    <th data-field="Chapter" data-halign="center" data-valign="middle" data-align="left" data-width="30%">Chapter/Unit</th>\
                                     <th data-formatter="funcionesFormatter" data-field="Funcion" data-halign="center" data-valign="middle" data-align="left" data-width="30%">Funcion</th>\
                                </tr>\
                            </thead>\
                        </table>', row.Id);
    return html;
}

function opcionesFormatter(value, row, index) {


    let btnConfirmar = `<a href="javascript:irAgregar2(${row.Id},'${row.Rol}','${row.GrupoRed}')" title="Agregar una nueva función para este rol"><i class="iconoVerde glyphicon glyphicon-plus"></i></a>`;
    //let btnObservar = `<a href="javascript:irRechazar(${row.SolicitudAplicacionId})" title="Rechaza la solicitud de cambio de estado"><i class="iconoRojo glyphicon glyphicon glyphicon-remove"></i></a>`;

    //return btnConfirmar.concat("&nbsp;&nbsp;", btnObservar);
    return btnConfirmar;


}

function funcionesFormatter(value, row, index) {

    let option = value;
    option = `<a href="javascript:VerPersonas('${row.Funcion}','${row.Chapter}')" title="Ver personas relacionadas">${value}</a>`;
    return option;

}

function VerPersonas(funcion, chapter) {
    OpenCloseModal($("#modalPersonas"), true);

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tablePersonas.bootstrapTable('destroy');
    $tablePersonas.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/PersonasFunciones",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Chapter = chapter;
            DATA_EXPORTAR.Funcion = funcion;
            //DATA_EXPORTAR.SubDominioId = $("#ddlSubDominio").val();
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
        }
    });
}

function opciones2Formatter(value, row, index) {


    let btnConfirmar = `<a href="javascript:irEditar(${row.Id})" title="Editar esta funcion del rol"><i class="iconoVerde glyphicon glyphicon-pencil"></i></a>`;
    let btnObservar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar esta funcion del rol"><i class="iconoRojo glyphicon glyphicon-trash"></i></a>`;

    return btnConfirmar.concat("&nbsp;&nbsp;", btnObservar);
    //return btnConfirmar;


}

function irAgregar2(id, Rol, GrupoRed) {
    $("#hdRolProductoId").val(id);
    $("#txtRol").val(Rol);
    $("#txtGrupoRed").val(GrupoRed);
    $("#txtChapter").val("");
    $("#txtFuncion").val("");
    //LimpiarModal();
    OpenCloseModal($("#modalAgregarRol"), true);
}

function irAgregar(id, nombre) {
    $("#hdProductoId").val(id);
    $("#txtProducto2").val(nombre);

    LimpiarModal();
    OpenCloseModal($("#modalAgregarRol"), true);
}

function LimpiarModal() {
    $("#txtRol").val("");
    $("#txtGrupoRed").val("");
}

function irEliminar(id) {
    EliminarRol(id);

}

function irEditar(id) {
    $("#hdFuncionId").val(id);
    ObtenerDetalleRol(id);
    OpenCloseModal($("#modalEditarRol"), true);
}


function EliminarRol(id) {
    let data = {};
    data.RolProductoId = id;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE2,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/EliminarFuncion`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se eliminó la función del rol correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        //$("#btnAgregar").button("reset");
                        waitingDialog.hide();
                        //OpenCloseModal($("#modalAgregarRol"), false);


                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}

function ObtenerDetalleRol(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        //url: URL_API_VISTA + `/application/GetFullDetail/${Id}`,
        url: URL_API_VISTA + `/ObtenerFuncion/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;


                    $("#txtRol2").val(data.Rol);
                    $("#txtGrupoRed2").val(data.GrupoRed);
                    $("#txtChapter2").val(data.Chapter);
                    $("#txtFuncion2").val(data.Funcion);
                    $("#hdChapter2").val(data.Chapter);
                    $("#hdFuncion2").val(data.Funcion);





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

//function opcionesBitacora(value, row, index) {
//    let botonDescargar = "";

//    if (row.NombreArchivo != '' && row.NombreArchivo != null) {
//        botonDescargar = `<a href="javascript:DownloadFileBitacora(${row.Id})" title="Descargar archivo"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
//        return botonDescargar;
//    }
//    else
//        return "-";
//}

function DownloadFileBitacora(id) {
    let retorno;
    let url = `${URL_API_VISTA_DESCARGA}/DownloadArchivoBitacora?id=${id}`;

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/octetstream",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            let bytes = Base64ToBytes(data.data);
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

function formatoFecha(value, row, index) {
    if (value == null)
        return "-";
    else
        return moment(value).format('DD/MM/YYYY HH:mm:ss');
}

function ListarAlertasDetalle(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado/DetalleProductosRoles",
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

function ListarAlertasDetalle2(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado/DetalleFuncionesProductosRoles",
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