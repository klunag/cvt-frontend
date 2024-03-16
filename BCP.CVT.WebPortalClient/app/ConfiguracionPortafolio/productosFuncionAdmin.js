var $table = $("#tblRegistros");
var $tablePersonas = $("#tblPersonas");
var URL_API_VISTA = URL_API + "/Aplicacion/ConfiguracionPortafolio";
var URL_API_VISTA_DESCARGA = URL_API + "/Solicitud";
var DATA_EXPORTAR = {};
const TITULO_MENSAJE = "Confirmación";
const MENSAJE = "¿Estás seguro que deseas agregar este producto a la función seleccionada?";
const MENSAJE2 = "¿Estás seguro que deseas eliminar este producto de la función seleccionada?";
const MENSAJE3 = "¿Estás seguro que deseas modificar este producto de la función seleccionada?";
var data = {};

$(function () {


    cargarCombos();
    ListarRegistros();

    $("#ddlProducto").change(function () {

        cargarCombosRoles($("#ddlProducto").val());

    });

    $("#ddlProducto2").change(function () {

        cargarCombosRoles($("#ddlProducto2").val());

    });

    //$("#btnExportar").click(ExportarInfo);
    //$("#btnExportarPer").click(ExportarInfoPersona);

    $("#btnAgregar").click(AgregarProducto);
    $("#btnEditar").click(EditarProducto);

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        if (row.NroAlertasDetalle !== 0) {
            ListarAlertasDetalle(row.Chapter, row.Funcion, $('#tblRegistrosDetalle_' + row.IdFuncion), $detail);
        } else {
            $detail.empty().append("No existen registros.");
        }
        //ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
    });
    InitAutocompletarEstandarBuilder($("#txtChapter"), $("#hdChapter"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");
    InitAutocompletarEstandarBuilderFuncion($("#txtFuncion"), $("#hdFuncion"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");
});

function InitAutocompletarEstandarBuilderFuncion($searchBox, $IdBox, $container, urlController) {
    //let data = CrearObjAplicacion2();


    data.Funcion = $("#txtFuncion").val();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Funcion = request.term;

                data.Chapter = "";

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

                data.Tribu = "";

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

        let url = `${URL_API_VISTA}/ExportarFunciones2?funcion=${DATA_EXPORTAR.Funcion}&chapter=${DATA_EXPORTAR.Chapter}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function ExportarInfoPersona() {
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


    let url = `${URL_API_VISTA}/ExportarFuncionesPersonas2?funcion=${DATA_EXPORTAR.Funcion}&chapter=${DATA_EXPORTAR.Chapter}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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


function cargarCombos() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/FuncionesProductosCombo",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Productos, $("#ddlProducto"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Productos, $("#ddlProducto2"), TEXTO_SELECCIONE);
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

function cargarCombosRoles(Id) {

    $.ajax({
        url: URL_API_VISTA + `/FuncionesProductosCombosRoles/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    let data = dataObject;

                    SetItems(dataObject.Roles, $("#ddlRol"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Roles, $("#ddlRol2"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}



function EditarProducto() {
    let data = {};
    data.FuncionProductoId = $("#hdFuncionId").val();
    data.RolProductoId = $("#ddlRol2").val();

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE3,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/EditarFuncionProducto`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se editó el producto de la función correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        $("#btnEditar").button("reset");
                        waitingDialog.hide();
                        OpenCloseModal($("#modalEditarProducto"), false);


                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}

function AgregarProducto() {
    let data = {};
    //data.FuncionProductoId = $("#hdFuncionId").val();
    data.Chapter = $("#txtChapter2").val();
    data.Funcion = $("#txtFuncion2").val();
    //data.ProductoId = $("#ddlProducto").val();
    data.RolProductoId = $("#ddlRol").val();

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/AgregarFuncionProducto`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se agregó el producto a la función correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        $("#btnAgregar").button("reset");
                        waitingDialog.hide();
                        OpenCloseModal($("#modalAgregarProducto"), false);


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
        url: URL_API_VISTA + "/Funciones",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Funcion',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Chapter = $("#txtChapter").val();
            DATA_EXPORTAR.Funcion = $("#txtFuncion").val();
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
    var html = String.Format('<table id="tblRegistrosDetalle_{0}" data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="10%">#</th>\
                                    <th data-field="ProductoNombre" data-halign="center" data-valign="middle" data-align="left" data-width="30%">Producto</th>\
                                     <th data-field="Rol" data-halign="center" data-valign="middle" data-align="left" data-width="30%">Rol</th>\
                                </tr>\
                            </thead>\
                        </table>', row.IdFuncion);
    return html;
} 

function opcionesFormatter(value, row, index) {


    let btnConfirmar = `<a href="javascript:irAgregar(${row.Id},'${row.Chapter}','${row.Funcion}')" title="Agregar un nuevo producto para esta función"><i class="iconoVerde glyphicon glyphicon-plus"></i></a>`;
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
        pageList: 20,
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


    let btnConfirmar = `<a href="javascript:irEditar(${row.Id})" title="Editar este producto de la función"><i class="iconoVerde glyphicon glyphicon-pencil"></i></a>`;
    let btnObservar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar este producto de la función"><i class="iconoRojo glyphicon glyphicon-trash"></i></a>`;

    return btnConfirmar.concat("&nbsp;&nbsp;", btnObservar);
    //return btnConfirmar;


}

function irAgregar(id, chapter, funcion) {
    $("#hdFuncionId").val(id);
    $("#txtChapter2").val(chapter);
    $("#txtFuncion2").val(funcion);

    LimpiarModal();
    OpenCloseModal($("#modalAgregarProducto"), true);
}

function LimpiarModal() {

}

function irEliminar(id) {
    EliminarProducto(id);

}

function irEditar(id) {
    $("#hdFuncionId").val(id);
    ObtenerDetalleFuncion(id);
    OpenCloseModal($("#modalEditarProducto"), true);
}


function EliminarProducto(id) {
    let data = {};
    data.FuncionProductoId = id;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE2,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/EliminarProductoFuncion`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se eliminó el producto de la función correctamente", TITULO_MENSAJE);
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

function ObtenerDetalleFuncion(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        //url: URL_API_VISTA + `/application/GetFullDetail/${Id}`,
        url: URL_API_VISTA + `/ObtenerFuncionProducto/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;


                    $("#ddlProducto2").val(data.ProductoId);
                    cargarCombosRoles($("#ddlProducto2").val());
                    $("#ddlRol2").val(data.RolesProductoId);
                    $("#txtChapter3").val(data.Chapter);
                    $("#txtFuncion3").val(data.Funcion);





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

//function DownloadFileBitacora(id) {
//    let retorno;
//    let url = `${URL_API_VISTA_DESCARGA}/DownloadArchivoBitacora?id=${id}`;

//    window.location.href = url;
//}

function formatoFecha(value, row, index) {
    if (value == null)
        return "-";
    else
        return moment(value).format('DD/MM/YYYY HH:mm:ss');
}

function ListarAlertasDetalle(chapter, funcion, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado/DetalleProductosFunciones",
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
            PARAMS_API.Chapter = chapter;
            PARAMS_API.Funcion = funcion;
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