var $table = $("#tblRegistros");
var URL_API_VISTA = URL_API + "/Aplicacion/ConfiguracionPortafolio";
var URL_API_VISTA_DESCARGA = URL_API + "/Solicitud";
var DATA_EXPORTAR = {};
const TITULO_MENSAJE = "Confirmación";
const MENSAJE = "¿Estás seguro que deseas agregar este rol al producto seleccionado?";
const MENSAJE2 = "¿Estás seguro que deseas eliminar la solicitud seleccionada?";
const MENSAJE3 = "¿Estás seguro que deseas modificar la solicitud seleccionada?";

const MENSAJE4 = "¿Estás seguro que deseas rechazar la solicitud seleccionada?";
const MENSAJE5 = "¿Estás seguro que deseas aprobar la solicitud seleccionada?";
var data = {};
var Aministrador = 1;
var OPCIONES = "";
var OPCIONES2 = "";
var Owner_Tribu = 18;
var CodigoTribu = "";

$(function () {

    getCurrentUser();
      
    $("#btnBuscador").click(ListarRegistros);
    cargarCombos();
    initFecha();
    ListarRegistros();
    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        if (row.NroAlertasDetalle !== 0) {
            ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
        } else {
            $detail.empty().append("No existen registros.");
        }
        //ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
    });

    //InitControles();
    $("#ddlProducto").change(function () {

        cargarCombosRoles($("#ddlProducto").val());

    });

    validarFormApp();
    $("#btnEditar").click(EditarSolicitudAsignacion);
    $("#btnEditar2").click(EditarSolicitudCreacion);
    $("#btnRechazoOwner").click(irRechazarOwner);
    $("#btnRechazoSeguridad").click(irRechazarSeguridad);

    InitAutocompletarEstandarBuilderFuncion($("#txtFuncion"), $("#hdFuncion"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");

    InitAutocompletarEstandarBuilderProducto($("#txtProducto"), $("#hdProducto"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");

});

function initFecha() {
    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});    
    _BuildDatepicker($("#dpFecConsulta"));
    _BuildDatepicker($("#dpFecAtencion")); 
}

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

                data.Chapter = $("#txtChapter").val();

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
                $("#hdGrupoRed").val(ui.item.Nombre);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Nombre + "</font></a>").appendTo(ul);
    };
}

function Exportar() {
    var estado = $("#ddlEstado").val();
    var fecha = $("#dpFecConsulta").val();
    if (fecha == null) {
        fecha = "";
    }

    let url = `${URL_API_VISTA}/Exportar/ExportarSolicitudesMDR?estado=${estado}&fecha=${fecha}`;
    window.location.href = url;
}

function irEliminar(id) {

  EliminarSolicitud(id);


}

function EliminarSolicitud(id) {
    let data = {};
    data.SolDetalleId = id;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE2,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/EliminarSolicitudMDR`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se eliminó la solicitud correctamente", TITULO_MENSAJE);
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

function EditarSolicitudCreacion() {
    let data = {};
    data.SolDetalleId = $("#hdSolDetalleId").val();
    data.ProductoId = $("#ddlProductoSol").val();
    data.Rol = $("#txtRolSol").val();
    data.Descripcion = $("#txtDescripcionSol").val();
    data.GrupoRed = $("#txtGrupoRedSol").val();
    data.RolSeguridad = $("#txtRolSeguridadSol").val();

    if ($("#formSolCre").valid()) {

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE3,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/EditarSolicitudCreacion`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(data),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se editó la solicitud correctamente", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {

                            $("#btnEditar").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalSolicitarCreacion"), false);


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

function EditarSolicitudAsignacion() {
    let data = {};
    data.SolDetalleId = $("#hdSolDetalleId").val();
    data.ProductoId = $("#ddlProducto").val(); 
    data.RolProductoId = $("#ddlRol").val();
    data.RolSeguridad = $("#txtRolSeguridad").val();

    if ($("#formEli").valid()) {

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE3,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/EditarSolicitudAsignacion`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(data),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se editó la solicitud correctamente", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {

                            $("#btnEditar").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalEditarSolAsignacion"), false);


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

function irObservarCreacion(id) {
    $("#hdSolDetalleId").val(id);


    ObtenerDetalleSolicitudCreacionVer(id);
    OpenCloseModal($("#modalSolicitarCreacionVER"), true);

}
function ObtenerDetalleSolicitudCreacionVer(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        //url: URL_API_VISTA + `/application/GetFullDetail/${Id}`,
        url: URL_API_VISTA + `/ObtenerSolicitudAsignacion/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;


                    $("#ddlProductoSolVER").val(data.ProductoId);
                    //cargarCombosRoles($("#ddlProductoSol").val());
                    $("#txtRolSolVER").val(data.RolCVT);
                    $("#txtDescripcionSolVER").val(data.Descripcion);
                    $("#txtGrupoRedSolVER").val(data.GrupoRed);
                    $("#txtChapterSolVER").val(data.Chapter);
                    $("#txtFuncionSolVER").val(data.Funcion);
                    $("#txtTribuSolVER").val(data.Tribu);
                    $("#txtRolSeguridadSolVER").val(data.RolSeguridad);





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
function irObservarAsignacion(id) {
    $("#hdSolDetalleId").val(id);

    ObtenerDetalleSolicitudAsignacionVer(id);
    OpenCloseModal($("#modalEditarSolAsignacionVER"), true);

}

function ObtenerDetalleSolicitudAsignacionVer(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        //url: URL_API_VISTA + `/application/GetFullDetail/${Id}`,
        url: URL_API_VISTA + `/ObtenerSolicitudAsignacion/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;


                    $("#ddlProductoVer").val(data.ProductoId);
                  
                    $("#txtChapterVer").val(data.Chapter);
                    $("#txtFuncionVer").val(data.Funcion);
                    $("#txtTribuVer").val(data.Tribu);
                    $("#txtRolSeguridadVer").val(data.RolSeguridad);
                    cargarCombosRoles(data.ProductoId);
                    $("#ddlRolVer").val(data.RolId);





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
function irEditarAsignacion(id) {
    $("#hdSolDetalleId").val(id);
    $("#formEli").data('validator').resetForm();
    LimpiarValidateErrores($("#formEli"));

    ObtenerDetalleSolicitudAsignacion(id);
    OpenCloseModal($("#modalEditarSolAsignacion"), true);

}


function irEditarCreacion(id) {
    $("#hdSolDetalleId").val(id);
    $("#formSolCre").data('validator').resetForm();
    LimpiarValidateErrores($("#formSolCre"));

    ObtenerDetalleSolicitudCreacion(id);
    OpenCloseModal($("#modalSolicitarCreacion"), true);

}

function ObtenerDetalleSolicitudCreacion(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        //url: URL_API_VISTA + `/application/GetFullDetail/${Id}`,
        url: URL_API_VISTA + `/ObtenerSolicitudAsignacion/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;


                    $("#ddlProductoSol").val(data.ProductoId);
                    //cargarCombosRoles($("#ddlProductoSol").val());
                    $("#txtRolSol").val(data.RolCVT);
                    $("#txtDescripcionSol").val(data.Descripcion);
                    $("#txtGrupoRedSol").val(data.GrupoRed);
                    $("#txtChapterSol").val(data.Chapter);
                    $("#txtFuncionSol").val(data.Funcion);
                    $("#txtTribuSol").val(data.Tribu);
                    $("#txtRolSeguridad").val(data.RolSeguridad);





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
function ObtenerDetalleSolicitudAsignacion(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        //url: URL_API_VISTA + `/application/GetFullDetail/${Id}`,
        url: URL_API_VISTA + `/ObtenerSolicitudAsignacion/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;


                    $("#ddlProducto").val(data.ProductoId);
                    cargarCombosRoles($("#ddlProducto").val());
                    $("#ddlRol").val(data.RolId);
                    $("#txtChapter2").val(data.Chapter);
                    $("#txtFuncion2").val(data.Funcion);
                    $("#txtTribu2").val(data.Tribu);
                    $("#txtRolSeguridad").val(data.RolSeguridad);





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

function validarFormApp() {
    $.validator.addMethod("existeRol", function (value, element) {
        let estado = true;


        let chapter = $("#txtChapter2").val();
        let funcion = $("#txtFuncion2").val();
        let productoId = $("#ddlProducto").val();
        let rolId = $("#ddlRol").val();



        estado = !ExisteRol(chapter, funcion, productoId, rolId);
        return estado;

    });

    $.validator.addMethod("existeRolNuevo", function (value, element) {
        let estado = true;
        let id = $("#ddlProductoSol").val();
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteRolNuevo(valor, id);
            return estado;
        }
        return estado;
    });
    $.validator.addMethod("existeGrupoRedNuevo", function (value, element) {
        let estado = true;
        let id = $("#ddlProductoSol").val();
        let rolid = $("#txtRolSol").val();
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteGrupoRedNuevo(valor, id, rolid);
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("existeRol2", function (value, element) {
        let estado = true;


        let chapter = $("#txtChapter3").val();
        let funcion = $("#txtFuncion3").val();
        let productoId = $("#ddlProduct2").val();
        let rolId = $("#ddlRo2").val();



        estado = !ExisteRol2(chapter, funcion, productoId, rolId);
        return estado;

    });

    $("#formSolCre").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtRolSol: {
                existeRolNuevo: true,
            },
            txtGrupoRedSol: {
                existeGrupoRedNuevo: true,
            },
            txtRolSeguridadSol: {
                requiredSinEspacios: true,
            }

        },
        messages: {
            txtRolSol: {
                existeRolNuevo: "El rol ingresado ya existe",

            },
            txtGrupoRedSol: {
                existeGrupoRedNuevo: "El grupo red ingresado ya existe en el rol",

            },
            txtRolSeguridadSol: {
                requiredSinEspacios: "Debes de ingresar un rol de seguridad",
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtRolSol" || element.attr('name') === "txtRolSeguridadSol" || element.attr('name') === "txtGrupoRedSol") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });


    $("#formEli").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtFuncion2dd: {
                existeRol: true,
            },
            txtRolSeguridad: {
                requiredSinEspacios: true,
            }

        },
        messages: {
            txtFuncion2dd: {
                existeRol: "El rol ingresado ya existe",

            },
            txtRolSeguridad: {
                requiredSinEspacios: "Debes de ingresar un rol de seguridad",
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtFuncion2dd" || element.attr('name') === "txtRolSeguridad") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });






}

function ExisteGrupoRedNuevo(valor, prod, rol) {
    let estado = false;
    let data = {};


    data.ProductoId = prod;
    data.Rol = rol;
    data.GrupoRed = valor;
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/existsGrupoRedNuevoSol`,
        dataType: "json",
        data: JSON.stringify(data),
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

function ExisteRolNuevo(valor, prod) {
    let estado = false;
    let data = {};


    data.ProductoId = prod;
    data.Rol = valor;

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/existsRolNuevoSol`,
        dataType: "json",
        data: JSON.stringify(data),
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
function ExisteRol(chapter, funcion, producto, rol) {
    let estado = false;
    let data = {};

    data.Chapter = $("#txtChapter2").val();
    data.Funcion = $("#txtFuncion2").val();
    data.ProductoId = $("#ddlProducto").val();
    data.RolProductoId = $("#ddlRol").val();

    $.ajax({

        url: URL_API_VISTA + `/existsRolEnFuncion`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
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


function ExisteRol2(chapter, funcion, producto, rol) {
    let estado = false;
    let data = {};

    data.Chapter = $("#txtChapter3").val();
    data.Funcion = $("#txtFuncion3").val();
    data.ProductoId = $("#ddlProducto2").val();
    data.RolProductoId = $("#ddlRol2").val();

    $.ajax({

        url: URL_API_VISTA + `/existsRolEnFuncion`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
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

function cargarCombos() {
    var data = {};

    $.ajax({
        url: URL_API_VISTA + `/FuncionesProductosCombo`,
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (dataObject, textStatus) {

            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Productos, $("#ddlProducto"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ProductosSolicitud, $("#ddlProductoSol"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Productos, $("#ddlProductoVer"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ProductosSolicitud, $("#ddlProductoSolVER"), TEXTO_SELECCIONE);
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
                    SetItems(dataObject.Roles, $("#ddlRolVer"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Roles, $("#ddlRol2"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}



function InitControles() {
    $("#dpFecConsulta-btn").datetimepicker({
        locale: 'es',
        useCurrent: true,
        format: 'MM/DD/YYYY'
    });
    $("#dpFecAtencion-btn").datetimepicker({
        locale: 'es',
        useCurrent: true,
        format: 'MM/DD/YYYY'
    });

    //$("#dpFecConsulta").val(moment(new Date()).format("DD/MM/YYYY"));

}

//function cargarCombos() {

//    var data = {};
//    data.Perfil = USUARIO.UsuarioBCP_Dto.Perfil;
//    data.Matricula = USUARIO.UsuarioBCP_Dto.Matricula;


//    $.ajax({
//        type: "POST",
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
//        url: URL_API_VISTA + "/SolicitudFuncionCombo",
//        contentType: "application/json; charset=utf-8",
//        data: JSON.stringify(data),
//        dataType: "json",
//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    SetItems(dataObject.Dominio, $("#ddlEstado"), TEXTO_SELECCIONE);
        
//                }

//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//}

function estadoFormatter(value, row, index) {
    var html = "";
    if (row.EstadoSolicitud == 2) {
     
            html = `<a class="btn btn-success btn-circle" title="Aprobada" "></a>`;
   
        return html;
    }
    else if (row.EstadoSolicitud == 3) {
   
        html = `<a class="btn btn-warning btn-circle" title="Observada" "></a>`;
    
        return html;
    }

    else if (row.EstadoSolicitud == 1){

            html = `<a class="btn btn-danger btn-circle" title="Pendiente de atención"></a>`;
  
        return html;
    }
    else if (row.EstadoSolicitud == 4) {

        html = `<a class="btn btn-danger btn-circle" title="Rechazada"></a>`;

        return html;
    }
    else if (row.EstadoSolicitud == 5)  {

        html = `<a class="btn btn-danger btn-circle" title="Eliminada"></a>`;

        return html;
    }
}



function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/SolicitudesFuncion",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaRegistro',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.EstadoAsignacionSol = $("#ddlEstado").val();
            DATA_EXPORTAR.FechaRegistroSolicitud = castDate($("#dpFecConsulta").val());

            DATA_EXPORTAR.FechaAtencionSolicitud = castDate($("#dpFecAtencion").val()); 
            DATA_EXPORTAR.Funcion = $("#txtFuncion").val();
            DATA_EXPORTAR.Producto = $("#txtProducto").val();

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



function detailFormatter(index, row) {
    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="4%">#</th>\
                                    <th data-field="TipoSolicitudStr" data-halign="center" data-valign="middle" data-align="left" data-width="14%">Solicitud</th>\
        	<th data-field="EstadoSolicitudStr" data-halign="center" data-valign="middle" data-align="left" data-sortable="true" data-sort-name="EstadoSolicitudStr" data-width="14%">Estado de la asignación</th>\
                                    <th data-field="RevisadoPor" data-halign="center" data-valign="middle" data-align="left" data-width="14%">Revisado Por</th>\
        <th data-field="NombreResponsable" data-halign="center" data-valign="middle" data-align="left" data-width="14%">Nombre del Responsable</th>\
                                     <th data-field="FechaRevisionStr" data-halign="center" data-valign="middle" data-align="left" data-width="10%">Fecha de Revisión</th>\
          <th data-field="Comentario" data-halign="center" data-valign="middle" data-align="left" data-width="14%">Observaciones</th>\
                                     <th data-formatter="opciones2Formatter" data-field="Opciones2" data-halign="center" data-valign="middle" data-align="center" data-width="14%">Acciones</th>\''+
        OPCIONES +

        '</tr>\
                            </thead>\
                        </table>', row.Id);
    return html;
    //        <th data-formatter="estadoFormatter" data-field="Situación de registro" data-halign="center" data-valign="middle" data-align="center" data-width="31%">Situación de la asignación</th>\

}

//function opcionesFormatter(value, row, index) {

//    if (USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_Administrador") || USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_MDR_OwnerProducto") || USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_MDR_TribuCOE")) {
//        let btnConfirmar = `<a href="javascript:irAgregar(${row.Id},'${row.Nombre}')" title="Agregar un nuevo rol para este producto"><i class="iconoVerde glyphicon glyphicon-user"></i></a>`;
//        //let btnObservar = `<a href="javascript:irRechazar(${row.SolicitudAplicacionId})" title="Rechaza la solicitud de cambio de estado"><i class="iconoRojo glyphicon glyphicon glyphicon-remove"></i></a>`;

//        //return btnConfirmar.concat("&nbsp;&nbsp;", btnObservar);
//        return btnConfirmar;
//    }
//    else return "";


//}

function opciones2Formatter(value, row, index) {

    if (userCurrent.Perfil.includes("E195_Administrador")) {
        userCurrent.Perfil = "E195_MDR_Seguridad";
    }

    if (userCurrent.Perfil.includes("E195_MDR_ChapterLead")) {
        if (row.EstadoSolicitud == 1 && row.TipoSolicitud == 2 && row.RolCVT == null) {
            let btnConfirmar = `<a href="javascript:irEditarAsignacion(${row.Id})" title="Editar la solicitud"><i class="iconoVerde glyphicon glyphicon-pencil"></i></a>`;
            //let btnEliminar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar la solicitud"><i class="iconoRojo glyphicon glyphicon-trash"></i></a>`;
            let btnEliminar = ``;
            let btnObservar = ``;
            return btnConfirmar.concat("&nbsp;&nbsp;", btnEliminar.concat("&nbsp;&nbsp;", btnObservar));
        }
        //else if (row.EstadoSolicitud == 3) {
        //    let btnConfirmar = `<a href="javascript:irEditarAsignacion(${row.Id})" title="Editar la solicitud"><i class="iconoVerde glyphicon glyphicon-pencil"></i></a>`;
        //    //let btnEliminar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar la solicitud"><i class="iconoRojo glyphicon glyphicon-trash"></i></a>`;
        //    let btnEliminar = ``;
        //    let btnObservar = ``;
        //    return btnConfirmar.concat("&nbsp;&nbsp;", btnEliminar.concat("&nbsp;&nbsp;", btnObservar));
        //}
        //else if (row.EstadoSolicitud == 1 && row.TipoSolicitud == 1) {
        //    let btnConfirmar = `<a href="javascript:irEditarCreacion(${row.Id})" title="Editar la solicitud"><i class="iconoVerde glyphicon glyphicon-pencil"></i></a>`;
        //    //let btnEliminar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar la solicitud"><i class="iconoRojo glyphicon glyphicon-trash"></i></a>`;
        //    let btnEliminar = ``;
        //    let btnObservar = ``;
        //    return btnConfirmar.concat("&nbsp;&nbsp;", btnEliminar.concat("&nbsp;&nbsp;", btnObservar));
        //}
        //else if (row.EstadoSolicitud == 1 && row.TipoSolicitud == 2 && row.RolCVT == null) {
        //    let btnConfirmar = `<a href="javascript:irEditarAsignacion(${row.Id})" title="Editar la solicitud"><i class="iconoVerde glyphicon glyphicon-pencil"></i></a>`;
        //    //let btnEliminar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar la solicitud"><i class="iconoRojo glyphicon glyphicon-trash"></i></a>`;
        //    let btnEliminar = ``;
        //    let btnObservar = ``;
        //    return btnConfirmar.concat("&nbsp;&nbsp;", btnEliminar.concat("&nbsp;&nbsp;", btnObservar));
        //}
        else {
            if (row.TipoSolicitud == 1) {
                let btnObservar = `<a href="javascript:irObservarAsignacion(${row.Id})" title="Ver detalle de la solicitud"><i class="iconoVerde glyphicon glyphicon-eye-open"></i></a>`;
                let btnConfirmar = ``;
                let btnEliminar = ``;
                return btnConfirmar.concat("&nbsp;&nbsp;", btnEliminar.concat("&nbsp;&nbsp;", btnObservar));
            }
            else {
                let btnObservar = `<a href="javascript:irObservarAsignacion(${row.Id})" title="Ver detalle de la solicitud"><i class="iconoVerde glyphicon glyphicon-eye-open"></i></a>`;
                let btnConfirmar = ``;
                let btnEliminar = ``;
                return btnConfirmar.concat("&nbsp;&nbsp;", btnEliminar.concat("&nbsp;&nbsp;", btnObservar));
            }
        }
    }
    else if (userCurrent.Perfil.includes("E195_MDR_OwnerProducto")) {
        if (row.EstadoSolicitud == 1 && row.TipoSolicitud == 2) {
            let btnConfirmar = `<a href="javascript:irAprobarOwner(${row.Id})" title="Aprobar la solicitud"><i class="iconoVerde glyphicon glyphicon-ok"></i></a>`;
            //let btnEliminar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar la solicitud"><i class="iconoRojo glyphicon glyphicon-trash"></i></a>`;
            let btnEliminar = `<a href="javascript:AbrirModalRechazoOwner(${row.Id})" title="Rechazar la solicitud"><i class="iconoRojo glyphicon glyphicon-remove"></i></a>`;
            let btnObservar = ``;
            return btnConfirmar.concat("&nbsp;&nbsp;", btnEliminar.concat("&nbsp;&nbsp;", btnObservar));
        }
        else {
            let btnObservar = `<a href="javascript:irObservarAsignacion(${row.Id})" title="Ver detalle de la solicitud"><i class="iconoVerde glyphicon glyphicon-eye-open"></i></a>`;
            let btnConfirmar = ``;
            let btnEliminar = ``;
            return btnConfirmar.concat("&nbsp;&nbsp;", btnEliminar.concat("&nbsp;&nbsp;", btnObservar));
        }
    }
    else  {
        if (row.EstadoSolicitud == 1 && row.TipoSolicitud == 3) {
            let btnConfirmar = `<a href="javascript:irAprobarSeguridad(${row.Id})" title="Aprobar la solicitud"><i class="iconoVerde glyphicon glyphicon-ok"></i></a>`;
            //let btnEliminar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar la solicitud"><i class="iconoRojo glyphicon glyphicon-trash"></i></a>`;
            let btnEliminar = `<a href="javascript:AbrirModalRechazoSeguridad(${row.Id})" title="Rechazar la solicitud"><i class="iconoRojo glyphicon glyphicon-remove"></i></a>`;
            let btnObservar = ``;
            return btnConfirmar.concat("&nbsp;&nbsp;", btnEliminar.concat("&nbsp;&nbsp;", btnObservar));
        }
        else {
            let btnObservar = `<a href="javascript:irObservarAsignacion(${row.Id})" title="Ver detalle de la solicitud"><i class="iconoVerde glyphicon glyphicon-eye-open"></i></a>`;
            let btnConfirmar = ``;
            let btnEliminar = ``;
            return btnConfirmar.concat("&nbsp;&nbsp;", btnEliminar.concat("&nbsp;&nbsp;", btnObservar));
        }
    }


        //return btnConfirmar;

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

function AbrirModalRechazoSeguridad(id) {
    $("#hdSolDetalleId").val(id);
    $("#txtRechazoSeguridad").val("");
    OpenCloseModal($("#modalRechazarSeguridad"), true);
}

function irRechazarSeguridad() {
    let data = {};
    data.SolDetalleId = $("#hdSolDetalleId").val();

    data.Comentario = $("#txtRechazoSeguridad").val();

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE4,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/RechazarSolicitudSeguridad`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se rechazó la solicitud correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        //$("#btnAgregar").button("reset");
                        waitingDialog.hide();
                        $("#txtRechazoSeguridad").val("");
                        OpenCloseModal($("#modalRechazarSeguridad"), false);
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

function AbrirModalRechazoOwner(id) {
    $("#hdSolDetalleId").val(id);
    $("#txtRechazoOwner").val("");
    OpenCloseModal($("#modalRechazarOwner"), true);
}

function irRechazarOwner() {
    let data = {};
    data.SolDetalleId = $("#hdSolDetalleId").val();

    data.Comentario = $("#txtRechazoOwner").val();

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE4,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/RechazarSolicitudOwner`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se rechazó la solicitud correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        //$("#btnAgregar").button("reset");
                        waitingDialog.hide();
                        $("#txtRechazoOwner").val("");
                        OpenCloseModal($("#modalRechazarOwner"), false);
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
        url: URL_API_VISTA + "/Listado/DetalleSolicitudesFuncion",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'TipoSolicitud',
        sortOrder: 'desc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.SolDetalleId = id;
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

