var $table = $("#tblRegistros");
var URL_API_VISTA = URL_API + "/Aplicacion/ConfiguracionPortafolio";
var URL_API_VISTA_DESCARGA = URL_API + "/Solicitud";
var DATA_EXPORTAR = {};
const TITULO_MENSAJE = "Confirmación";
const MENSAJE = "¿Estás seguro que deseas agregar este rol al producto seleccionado?";
const MENSAJE2 = "¿Estás seguro que deseas eliminar este rol del producto seleccionado?";
const MENSAJE3 = "¿Estás seguro que deseas modificar este rol del producto seleccionado?";
var data = {};

$(function () {

    InitAutocompletarEstandarBuilder($("#txtProducto"), $("#hdProd"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");
    validarFormApp();
    cargarCombos();
    ListarRegistros();

    $("#btnAgregar").click(AgregarRol);
    $("#btnEditar").click(EditarRol);

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        if (row.NroAlertasDetalle !== 0) {
            ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
        } else {
            $detail.empty().append("No existen registros.");
        }
        //ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
    });
});


function validarFormApp() {
    $.validator.addMethod("existeRol", function (value, element) {
        let estado = true;
        let id = $("#hdProductoId").val();
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteRol(valor,id);
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("existeGrupoRed", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteGrupoRed(valor);
            return estado;
        }
        return estado;
    });


    $("#formEli").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtRol: {
                requiredSinEspacios: true,
                existeRol: true,
            },
            txtGrupoRed: {
                existeGrupoRed: true,
            }
        },
        messages: {
            txtRol: {
                requiredSinEspacios: "Debes de ingresar un código de 4 caracteres",
                existeRol: "El rol ingresado ya existe",

            },
            txtGrupoRed: {
                existeGrupoRed: "El grupo de red ingresado ya existe"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtRol" || element.attr('name') === "txtGrupoRed") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });



    $("#formEli2").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtRol2: {
                requiredSinEspacios: true,
                existeRol: true,
            },
            txtGrupoRed2: {
                existeGrupoRed: true,
            }
        },
        messages: {
            txtRol2: {
                requiredSinEspacios: "Debes de ingresar un código de 4 caracteres",
                existeRol: "El rol ingresado ya existe",

            },
            txtGrupoRed2: {
                existeGrupoRed: "El grupo de red ingresado ya existe"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtRol2" || element.attr('name') === "txtGrupoRed2") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}


function ExisteRol(valor,prod) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/existsRol?id=${valor},prod=${prod}`,
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

function ExisteGrupoRed(valor) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/existsGrupoRed?id=${valor}`,
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


function InitAutocompletarEstandarBuilder($searchBox, $IdBox, $container, urlController) {
    //let data = CrearObjAplicacion2();


    data.Producto = $("#txtProducto").val();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Chapter = request.term;
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
    data.RolProductoId = $("#hdRolProductoId").val();
    data.Rol = $("#txtRol2").val();
    data.Descripcion = $("#txtDescripcion2").val();
    data.GrupoRed = $("#txtGrupoRed2").val();

    if ($("#formEli").valid()) {

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
}

function AgregarRol() {
    let data = {};
    data.ProductoId = $("#hdProductoId").val();
    data.Rol = $("#txtRol").val();
    data.GrupoRed = $("#txtGrupoRed").val();
    data.Descripcion = $("#txtDescripcion").val();

    if ($("#formEli").valid()) {

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/AgregarRolProducto`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(data),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se agregó el rol al producto correctamente", TITULO_MENSAJE);
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
            DATA_EXPORTAR.DominioId = $("#ddlDominio").val();
            DATA_EXPORTAR.SubDominioId = $("#ddlSubDominio").val();
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

function ExportarInfo() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.CodigoApt = $.trim($("#txtCodigoApt").val());

    let url = `${URL_API_VISTA}/Bitacora/Exportar?codigoApt=${DATA_EXPORTAR.CodigoApt}`;
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

function detailFormatter(index, row) {
    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="10%">#</th>\
                                    <th data-field="Rol" data-halign="center" data-valign="middle" data-align="left" data-width="30%">Rol</th>\
                                    <th data-field="Descripcion" data-halign="center" data-valign="middle" data-align="left" data-width="30%">Descripción</th>\
                                </tr>\
                            </thead>\
                        </table>', row.Id);
    return html;
}

function opcionesFormatter(value, row, index) {


    let btnConfirmar = `<a href="javascript:irAgregar(${row.Id},'${row.Nombre}')" title="Agregar un nuevo rol para este producto"><i class="iconoVerde glyphicon glyphicon-user"></i></a>`;
    //let btnObservar = `<a href="javascript:irRechazar(${row.SolicitudAplicacionId})" title="Rechaza la solicitud de cambio de estado"><i class="iconoRojo glyphicon glyphicon glyphicon-remove"></i></a>`;

    //return btnConfirmar.concat("&nbsp;&nbsp;", btnObservar);
    return btnConfirmar;


}

function opciones2Formatter(value, row, index) {


    let btnConfirmar = `<a href="javascript:irEditar(${row.Id})" title="Editar este rol del producto"><i class="iconoVerde glyphicon glyphicon-pencil"></i></a>`;
    let btnObservar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar este rol del producto"><i class="iconoRojo glyphicon glyphicon-trash"></i></a>`;

    return btnConfirmar.concat("&nbsp;&nbsp;", btnObservar);
    //return btnConfirmar;


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
    $("#txtDescripcion").val("");
}

function irEliminar(id) {
    EliminarRol(id);

}

function irEditar(id) {
    $("#hdRolProductoId").val(id);
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
                    url: URL_API_VISTA + `/EliminarRolProducto`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se eliminó el rol al producto correctamente", TITULO_MENSAJE);
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
        url: URL_API_VISTA + `/ObtenerRolProducto/${Id}`,
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
                    $("#txtDescripcion2").val(data.Descripcion);
                    $("#txtProducto3").val(data.ProductoNombre);





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