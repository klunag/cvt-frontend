var $table = $("#tblRegistro");
var $tableFlujos = $("#tblFlujos");
var $tableRelacionesComponentes = $("#tblRelacionesComponentes");
var $tableRelacionesAppsAplicaciones = $("#tblRelacionesAppsAplicaciones");
var $tableRelacionesOnwerAPPIs = $("#tblRelacionesOnwerAPPIs");
var $tableRelacionesAzureResources = $("#tblRelacionesAzureResources");
var DATA_EXPORTAR = {};
//var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_REGISTRO_PAGINACION = PAGINA_TAMANIO;
var ULTIMO_PAGE_NUMBER = PAGINA_ACTUAL;
var ULTIMO_SORT_NAME = "applicationId";
var ULTIMO_SORT_ORDER = "asc";

const TITULO_MENSAJE = "Portafolio de aplicaciones";
const MENSAJE = "¿Estás seguro que deseas continuar con la solicitud de eliminación de esta aplicación?";
const TITULO_NO_PASE = "La aplicación no ha completado el registro de todos los campos requeridos, no es posible consultar o confirmar estos datos";
const URL_API_VISTA = URL_API + "/applicationportfolio";
var Descripcion = "";

$(function () {

    validarFormImportar();

    $("#txtAplicacionFiltro").val(nombre_app);
    ListarRegistros();
    InitAcciones();
    InitInputFiles();

    InitAutocompletarUsuariosLocal($("#txtExperto"), $("#hExpertoId"), ".divExpertoContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");

    InitAutocompletarUsuariosLocal2($("#txtConformidad"), $("#hConformidadId"), ".divConformidadContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
    $("#divTxtConformidadGST").hide();
    FormatoCheckBox($("#divFlagConformidadGST"), "ckbConformidadGST");
    $("#ckbConformidadGST").change(FlagConformidadGST_Change);
    $("#ddlTipoEliminacion").change(TipoEliminacion_Change);
    ULTIMO_PAGE_NUMBER = PAGINA_ACTUAL;
    ULTIMO_REGISTRO_PAGINACION = PAGINA_TAMANIO;

    $("#txtAplicacionFiltro").keypress(function (event) {
        if (event.keyCode === 13) {
            $("#btnBuscar").click();
            event.preventDefault();
        }
    });
    $("#btnIrRelacionesCompnentes").click(IrRelacionesCompenentes);
    $("#btnIrRelacionesAplicaciones").click(IrRelacionesAplicaciones);


});

function IrRelacionesCompenentes() {
    window.open('/Relacion/Bandeja', '_blank');
}
function IrRelacionesAplicaciones() {
    window.open('/DependenciasApps/Consultas', '_blank');
}



async function VerRelaciones() {
    try {
        await ListarRelacionComponentes();
        await ListarRelacionAppsAplicaciones();
        await ListarRelacionOwnerAPIs();
        await ListarRelacionAzureResources();
        OpenCloseModal($("#modalRelaciones"), true);
        $('a[href="#appComponentes"]').tab('show');
    } catch (err) {
        bootbox.alert(err.message);
    }
}

//async function ListarTodasLasRelaciones() {
//    await ListarRelacionComponentes();
//    await ListarRelacionAppsAplicaciones();
//    await ListarRelacionOwnerAPIs();
//    await ListarRelacionAzureResources();
//    OpenCloseModal($("#modalRelaciones"), true);
//}

function ListarRelacionComponentes() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    return new Promise((resolve, reject) => {
        $tableRelacionesComponentes.bootstrapTable('destroy');
        $tableRelacionesComponentes.bootstrapTable({
            locale: 'es-SP',
            url: URL_API_VISTA + "/ListarRelacionesAplicacionComponentes",
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
                DATA_EXPORTAR.AppId = $("#hdAplicacionId").val();
                DATA_EXPORTAR.pageNumber = p.pageNumber;
                DATA_EXPORTAR.pageSize = p.pageSize;
                DATA_EXPORTAR.sortName = p.sortName;
                DATA_EXPORTAR.sortOrder = p.sortOrder;
                return JSON.stringify(DATA_EXPORTAR);
            },
            responseHandler: function (res) {
                waitingDialog.hide();
                var data = res;
                resolve();
                return { rows: data.Rows, total: data.Total };
            },
            onLoadError: function (status, res) {
                waitingDialog.hide();
                bootbox.alert("Se produjo un error al listar los registros");
                reject("Se produjo un error al listar los registros");
            },
            onSort: function (name, order) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            },
            onPageChange: function (number, size) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            }, onLoadSuccess: function () {
                resolve();
            }
        });
    });
}

function ListarRelacionAppsAplicaciones() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    return new Promise((resolve, reject) => {
        $tableRelacionesAppsAplicaciones.bootstrapTable('destroy');
        $tableRelacionesAppsAplicaciones.bootstrapTable({
            locale: 'es-SP',
            url: URL_API_VISTA + "/ListarRelacionesAplicacionAplicacion",
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
                DATA_EXPORTAR.AppId = $("#hdAplicacionId").val();
                DATA_EXPORTAR.pageNumber = p.pageNumber;
                DATA_EXPORTAR.pageSize = p.pageSize;
                DATA_EXPORTAR.sortName = p.sortName;
                DATA_EXPORTAR.sortOrder = p.sortOrder;
                return JSON.stringify(DATA_EXPORTAR);
            },
            responseHandler: function (res) {
                waitingDialog.hide();
                var data = res;
                resolve();
                return { rows: data.Rows, total: data.Total };
            },
            onLoadError: function (status, res) {
                waitingDialog.hide();
                bootbox.alert("Se produjo un error al listar los registros");
                reject("Se produjo un error al listar los registros");
            },
            onSort: function (name, order) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            },
            onPageChange: function (number, size) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            }, onLoadSuccess: function () {
                resolve();
            }
        });
    });
}

function ListarRelacionOwnerAPIs() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    return new Promise((resolve, reject) => {
        $tableRelacionesOnwerAPPIs.bootstrapTable('destroy');
        $tableRelacionesOnwerAPPIs.bootstrapTable({
            locale: 'es-SP',
            url: URL_API_VISTA + "/ListarRelacionesOwnersAPIs",
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
                DATA_EXPORTAR.AppId = $("#hdAplicacionId").val();
                DATA_EXPORTAR.pageNumber = p.pageNumber;
                DATA_EXPORTAR.pageSize = p.pageSize;
                DATA_EXPORTAR.sortName = p.sortName;
                DATA_EXPORTAR.sortOrder = p.sortOrder;
                return JSON.stringify(DATA_EXPORTAR);
            },
            responseHandler: function (res) {
                waitingDialog.hide();
                var data = res;
                resolve();
                return { rows: data.Rows, total: data.Total };
            },
            onLoadError: function (status, res) {
                waitingDialog.hide();
                bootbox.alert("Se produjo un error al listar los registros");
                reject("Se produjo un error al listar los registros");
            },
            onSort: function (name, order) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            },
            onPageChange: function (number, size) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            }, onLoadSuccess: function () {
                resolve();
            }
        });
    });
}

function ListarRelacionAzureResources() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    return new Promise((resolve, reject) => {
        $tableRelacionesAzureResources.bootstrapTable('destroy');
        $tableRelacionesAzureResources.bootstrapTable({
            locale: 'es-SP',
            url: URL_API_VISTA + "/ListarRelacionesAzureResources",
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
                DATA_EXPORTAR.AppId = $("#hdAplicacionId").val();
                DATA_EXPORTAR.pageNumber = p.pageNumber;
                DATA_EXPORTAR.pageSize = p.pageSize;
                DATA_EXPORTAR.sortName = p.sortName;
                DATA_EXPORTAR.sortOrder = p.sortOrder;
                return JSON.stringify(DATA_EXPORTAR);
            },
            responseHandler: function (res) {
                waitingDialog.hide();
                var data = res;
                resolve();
                return { rows: data.Rows, total: data.Total };
            },
            onLoadError: function (status, res) {
                waitingDialog.hide();
                bootbox.alert("Se produjo un error al listar los registros");
                reject("Se produjo un error al listar los registros");
            },
            onSort: function (name, order) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            },
            onPageChange: function (number, size) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            }, onLoadSuccess: function () {
                resolve();
            }
        });
    });
}

function TipoEliminacion_Change() {
    let TipoEliminacion = $("#ddlTipoEliminacion").val();

    if (TipoEliminacion == 1) {
        $(".divProcesoEliminacion").hide();
        $(".divEliminacionAdministrativa").show();

        $(":input", "#formEliminar").val("");
        $("#descripcion").val(Descripcion);
        $("#ddlTipoEliminacion").val(1);
    }
    else if (TipoEliminacion == 2) {
        $(".divProcesoEliminacion").show();

        $(".divEliminacionAdministrativa").hide();
        LimpiarValidateErrores($("#formEliminar"));
        $(":input", "#formEliminar").val("");
        $("#descripcion").val(Descripcion);
        $("#ddlTipoEliminacion").val(2);
    }
}

function InitAcciones() {
    $("#btnRegistrarNoVigente").click(CambiarEstadoRegistro);
    $("#btnRegistrarVigente").click(RegresarEstadoRegistro);
    $("#btnEliminar").click(SolicitudEliminacion);

}

function RefrescarListado() {
    ULTIMO_PAGE_NUMBER = 1;
    ListarRegistros();
}

function AddRegistro() {
    $("#title-md").html("Nuevo registro");
    LimpiarModal();
    OpenCloseModal($("#mdRegistro"), true);
}

function LimpiarModal() {
    LimpiarValidateErrores($("#formEliminar"));
    $(":input", "#formEliminar").val("");
    $("#ddlTipoEliminacion").val(-1);
    $(".divProcesoEliminacion").hide();
    $(".divEliminacionAdministrativa").hide();
}

function ListarRegistros() {
    nombre_app = $("#txtAplicacionFiltro").val();
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        //url: URL_API_VISTA + `/application/listByUser`,
        url: URL_API_VISTA + `/application/requests/AsignadasNoEliminadas`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION_ALT,
        sortName: ULTIMO_SORT_NAME,
        sortOrder: ULTIMO_SORT_ORDER,
        queryParams: function (p) {
            ULTIMO_PAGE_NUMBER = p.pageNumber;
            ULTIMO_REGISTRO_PAGINACION = p.pageSize;
            ULTIMO_SORT_NAME = p.sortName;
            ULTIMO_SORT_ORDER = p.sortOrder;

            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtAplicacionFiltro").val());
            DATA_EXPORTAR.applicationId = $.trim($("#txtAplicacionFiltro").val());
            DATA_EXPORTAR.Status = $("#cbFilEstado").val();
            DATA_EXPORTAR.pageNumber = ULTIMO_PAGE_NUMBER;
            DATA_EXPORTAR.pageSize = ULTIMO_REGISTRO_PAGINACION;
            DATA_EXPORTAR.sortName = ULTIMO_SORT_NAME;
            DATA_EXPORTAR.sortOrder = ULTIMO_SORT_ORDER;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            if (data.Total == -1) {
                window.document.location.href = `/Error/Unavailable`;
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

function linkFormatter(value, row, index) {
    let option = value;
    option = `<a href="javascript:EditarRegistro(${row.id})" title="Editar registro">${value}</a>`;
    return option;
}

function EditarRegistro(id) {
    window.document.location.href = `DetalleAplicacion?id=${id}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}`;
}

function opcionesFormatter(value, row, index) {
    let btnEliminar = '';

    if (row.TotalSolicitudesActivas > 0) {
        btnEliminar = `<a href="#" title="La aplicación ya tiene una solicitud de eliminación en proceso de atención"><i class="iconoAmarillo glyphicon glyphicon-warning-sign"></i></a>`;
    }
    else
        btnEliminar = `<a href="javascript:irEliminar(${row.id},'${row.statusDetail}','${row.name}','${row.applicationId}','${row.statusColor}')" title="Inicia el flujo de eliminación de la aplicación"><i class="iconoRojo glyphicon glyphicon-remove"></i></a>`;

    return btnEliminar;
}

function irNoVigente(id, statusDetail) {
    $("#hdAplicacionId").val(id);
    $("#hdPreviousState").val(statusDetail);
    LimpiarModal();
    $('#ddlTipoEliminacion').val(-1);
    OpenCloseModal($("#modalNoVigente"), true);
}

function activarNoVigente(id) {
    $("#hdAplicacionId").val(id);
    LimpiarModal();
    OpenCloseModal($("#modalVigente"), true);
}

function irEliminar(id, statusDetail, name, applicationId, statusColor) {
    $("#hdAplicacionId").val(id);
    $("#hdPreviousState").val(statusDetail);
    //$('#title-md').html('Solicita la eliminación de la aplicación:' + name);
    document.getElementById("titulo").innerText = 'Solicita la eliminación de la aplicación: ' + name;
    document.getElementById("subtitulo").innerText = 'Código de aplicación: ' + applicationId + ' - Nombre de la aplicación: ' + name;
    LimpiarModal();

    var desc = obtenerDescripcion(applicationId);

    $("#descripcion").val(desc);
    Descripcion = $("#descripcion").val();

    var statusColor = obtenerEliminadaStatus(applicationId);

    document.getElementById("divStatusApp").innerText = statusColor;

    //$("#divStatusApp").addClass("btn-" + statusColor);

    OpenCloseModal($("#modalEliminar"), true);
    //document.getElementById("title-md").val = 'Solicita la eliminación de la aplicación: ' + name;

}

function obtenerDescripcion(applicationId) {
    var desc = "";


    let params = {
        codApplication: applicationId
    };
    $.ajax({
        url: URL_API_VISTA + `/application/eliminadas/getDescription`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: params,
        success: function (dataObject) {

            if (dataObject !== null) {



                desc = dataObject;
            }

        },
        async: false,
        global: false

    });
    return desc;
}


function obtenerEliminadaStatus(applicationId) {
    var colorEstado = "";
    $("#btnEliminar").removeProp("disabled");
    $("#btnEliminar").removeClass("disabled");

    let params = {
        codApplication: applicationId
    };
    $.ajax({
        url: URL_API_VISTA + `/application/eliminadas/status`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: params,
        success: function (dataObject) {

            if (dataObject !== null) {

                $("#btnEliminar").prop("disabled", dataObject);
                if (dataObject) {
                    $("#btnEliminar").addClass("disabled");
                    $("#formularioEliminarStatus").css("display", "none");
                    $("#btnVerRelaciones").css("display", "block");
                } else {
                    $("#formularioEliminarStatus").css("display", "block");
                    $("#btnVerRelaciones").css("display", "none");
                }
                    
                //colorEstado = dataObject ? "danger" : "success";
                colorEstado = dataObject ? "Tiene relaciones activas, debes de ingresar a CVT y proceder a eliminarlas para poder continuar con el proceso de eliminación" : "No tiene información relacionada en CVT";
            }

        },
        async: false,
        global: false

    });
    return colorEstado;
}

function situacionFormatter(value, row, index) {
    var html = "";
    if (row.registrationSituation === REGISTRO_COMPLETO) { //VERDE
        html = `<a class="btn btn-success btn-circle" title="Registro completo" style="cursor: pointer;" onclick="javascript:irObservar(${row.id},'${row.applicationId}','${row.name}')"></a>`;
    } else if (row.registrationSituation === REGISTRO_PARCIAL) { //ROJO
        html = `<a class="btn btn-danger btn-circle" title="Registro parcial" style="cursor: pointer;" onclick="javascript:irObservar(${row.id},'${row.applicationId}','${row.name}')"></a>`;
    }
    return html;
}

function irPase(id, situacion) {
    if (!(situacion == REGISTRO_COMPLETO)) {
        bootbox.alert({
            message: TITULO_NO_PASE
        });
    }
}

function CambiarEstadoRegistro() {
    if ($("#formNoVigente").valid()) {
        $("#btnRegistrarNoVigente").button("loading");

        let pag = {
            Id: ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val()),
            Status: ESTADO_NOVIGENTE,
            Comments: $.trim($("#txtDescripcion").val()),
            PreviousState: $("#hdPreviousState").val()
        };

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/application/changeStatus`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(pag),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {

                            $("#btnRegistrarNoVigente").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalNoVigente"), false);
                            //LimpiarModal();

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

function activarEliminar(id) {

    let pag = {
        Id: id,
    };

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/application/changeStatusEliminado`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(pag),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                RefrescarListado();
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

function RegresarEstadoRegistro() {
    if ($("#formVigente").valid()) {
        $("#btnRegistrarVigente").button("loading");

        let pag = {
            Id: ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val()),
            Status: ESTADO_NOVIGENTE,
            Comments: $.trim($("#txtDescripcion2").val())
        };

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/application/reverseStatus`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(pag),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {

                            $("#btnRegistrarVigente").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalVigente"), false);
                            //LimpiarModal();

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

function SolicitudEliminacion() {
    if ($("#formEliminar").valid()) {
        $("#btnEliminar").button("loading");
        var idsol = 0;
        let formData = new FormData();
        let ConformidadGST;

        if ($("#ddlTipoEliminacion").val() == 2) {
            ConformidadGST = $("#flConformidad").get(0).files;
            formData.append("File1", ConformidadGST[0]);
            var TicketEliminacion = $("#flTicket").get(0).files;
            formData.append("File2", TicketEliminacion[0]);
            var Ratificacion = $("#flRatificacion").get(0).files;
            formData.append("File3", Ratificacion[0]);
            var pag = {
                Id: ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val()),
                Status: ESTADO_NOVIGENTE,
                Comments: $.trim($("#txtDescripcionEliminar").val()),
                PreviousState: $("#hdPreviousState").val(),
                flagRequiereConformidad: $("#ckbConformidadGST").prop("checked"),
                ticketEliminacion: $("#txtTicket").val(),
                expertoNombre: $("#txtExperto").val(),
                expertoMatricula: $("#hExpertoMatricula").val(),
                expertoCorreo: $("#hExpertoCorreo").val(),
                tipoEliminacion: $("#ddlTipoEliminacion").val()
            };
        }
        else if ($("#ddlTipoEliminacion").val() == 1) {
            ConformidadGST = $("#flArchivo").get(0).files;
            formData.append("File1", ConformidadGST[0]);
            var pag = {
                Id: ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val()),
                Status: ESTADO_NOVIGENTE,
                Comments: $.trim($("#txtDescripcionEliminar").val()),
                PreviousState: $("#hdPreviousState").val(),
                expertoNombre: $("#txtConformidad").val(),
                expertoMatricula: $("#hConformidadMatricula").val(),
                expertoCorreo: $("#hConformidadCorreo").val(),
                tipoEliminacion: $("#ddlTipoEliminacion").val()
            };
        }
        formData.append("data", JSON.stringify(pag));
       
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/application/remove`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: formData,
                        //data: JSON.stringify(pag),
                        processData: false,
                        contentType: false,
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    idsol = dataObject;
                                    if (idsol > 0) {
                                        //if ($("#ddlTipoEliminacion").val() == 1) {
                                        //    UploadFile2($("#flArchivo"), idsol);
                                        //}
                                        //else if ($("#ddlTipoEliminacion").val() == 2) {
                                        //    UploadFile($("#flConformidad"), $("#flTicket"), $("#flRatificacion"), idsol);
                                        //}
                                        toastr.success("Se envió la solicitud de eliminación.", TITULO_MENSAJE);
                                        RefrescarListado();
                                    }
                                    else
                                        toastr.error("No es posible generar la solicitud de eliminación ya que existen solicitudes en proceso.", TITULO_MENSAJE);
                                }
                            }
                        },
                        complete: function (data) {

                            $("#btnEliminar").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalEliminar"), false);
                            LimpiarModal();

                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
                else {
                    $("#btnEliminar").button("reset");
                }
            }
        });
    }
}

function validarFormNoVigente() {
    $("#formNoVigente").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtDescripcion: {
                requiredSinEspacios: true,
                //existeNombreEntidad: true
            }
        },
        messages: {
            txtDescripcion: {
                requiredSinEspacios: "Debes ingresar un comentario para el cambio de estado"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDescripcion") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function InitInputFiles() {
    InitUpload($('#txtNomArchivoConformidad'), 'inputConformidad');
    InitUpload($('#txtNomTicket'), 'inputTicket');
    InitUpload($('#txtNomRatificacion'), 'inputRatificacion');
    InitUpload($('#txtArchivo'), 'inputArchivo');
}


function InitUpload($inputText, classInput, btnDownload = null, btnRemove = null) {
    var inputs = document.querySelectorAll(`.${classInput}`);
    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener('change', function (e) {
            var fileName = '';
            if (this.files && this.files.length > 1) {
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            } else {
                if (this.files && this.files.length == 1) {
                    if (btnDownload != null) btnDownload.show();
                    if (btnRemove != null) btnRemove.show();
                } else {
                    if (btnDownload != null) btnDownload.hide();
                    if (btnRemove != null) btnRemove.hide();
                }
                fileName = e.target.value.split('\\').pop();
            }

            if (fileName)
                $inputText.val(fileName);
            else
                label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
}


function validarFormImportar() {

    $.validator.addMethod("requiredArchivo", function (value, element) {
        return $.trim(value) !== "";
    });

    $.validator.addMethod("requiredConformidad", function (value, element) {
        //var flag = $("#ckbConformidadGST").val();

        if ($("#ckbConformidadGST").prop("checked") && $("#ddlTipoEliminacion").val() == 2) {
            let valor = $.trim(value);
            return valor !== "";
        }
        else {
            return true;
        }
    });

    $.validator.addMethod("requiredArchivo2", function (value, element) {
        //var flag = $("#ckbConformidadGST").val();

        if ($("#ddlTipoEliminacion").val() == 1) {
            let valor = $.trim(value);
            return valor !== "";
        }
        else {
            return true;
        }
    });

    $.validator.methods.requiredSinEspacios2 = function (value, element) {
        value = value || null;
        if ($("#ddlTipoEliminacion").val() == 1)
            return $.trim(value) != "" && value != null;
        else return true

    };

    $.validator.methods.existePersona = function (value, element) {
        if ($("#ddlTipoEliminacion").val() == 1) {
            if ($("#hConformidadId").val() != 0) { return true; }
            else return false;
        }
        else
            return true;
    };

    $.validator.methods.existeExperto = function (value, element) {
        if ($("#ddlTipoEliminacion").val() == 2) {
            if ($("#txtExperto").val() != '') {
                if ($("#hExpertoId").val() != 0) {
                    return true;
                }
                else
                    return false;
            }
            else
                return true;
        }
        else
            return true;
    };

    $("#formEliminar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtDescripcionEliminar: {
                requiredSinEspacios: true
            },
            flConformidad: {
                requiredConformidad: true
            },
            ddlTipoEliminacion: {
                requiredSelect: true
            },
            flArchivo: {
                requiredArchivo2: true
            },
            txtConformidad: {
                requiredSinEspacios2: true,
                existePersona: true
            },
            txtExperto: {
                existeExperto: true
            }
        },
        messages: {
            txtDescripcionEliminar: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el motivo de la eliminación.")
            },
            flConformidad: {
                requiredConformidad: String.Format("Debes seleccionar {0}.", "un archivo")
            },
            ddlTipoEliminacion: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            flArchivo: {
                requiredArchivo2: String.Format("Debes seleccionar {0}.", "un archivo")
            },
            txtConformidad: {
                requiredSinEspacios2: String.Format("Debes ingresar {0}", "el nombre de la persona que brindó la conformidad."),
                existePersona: String.Format("La persona ingresada {0}", "no existe.")
            },
            txtExperto: {
                existeExperto: String.Format("La persona ingresada {0}", "no existe.")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtNomArchivoConformidad" || element.attr('name') === "flConformidad") {
                element.parent().parent().parent().parent().append(error);
            }
            else if (element.attr('name') === "txtNomTicket" || element.attr('name') === "flTicket") {
                element.parent().parent().parent().parent().append(error);
            }
            else if (element.attr('name') === "txtNomRatificacion" || element.attr('name') === "flRatificacion") {
                element.parent().parent().parent().parent().append(error);
            }
            else if (element.attr('name') === "txtArchivo" || element.attr('name') === "flArchivo") {
                element.parent().parent().parent().parent().append(error);
            }
            else {
                element.parent().append(error);
            }
        }
    });
}

//function UploadFile($fileInput, $fileInput1, $fileInput2, idsol) {

//    let formData = new FormData();
//    let ConformidadGST = $fileInput.get(0).files;
//    let TicketEliminacion = $fileInput1.get(0).files;
//    let Ratificacion = $fileInput2.get(0).files;
//    formData.append("File1", ConformidadGST[0]);
//    formData.append("File2", TicketEliminacion[0]);
//    formData.append("File3", Ratificacion[0]);
//    formData.append("SolicitudAplicacionId", idsol);


//    $.ajax({
//        url: URL_API + "/File/upload2",
//        type: "POST",
//        data: formData,
//        contentType: false,
//        processData: false,
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
//        success: function (result) {
//            OpenCloseModal($("#modalEliminar"), false);
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        }
//    });
//}

//function UploadFile2($fileInput, idsol) {

//    let formData = new FormData();
//    let ConformidadGST = $fileInput.get(0).files;

//    formData.append("File1", ConformidadGST[0]);

//    formData.append("SolicitudAplicacionId", idsol);


//    $.ajax({
//        url: URL_API + "/File/upload5",
//        type: "POST",
//        data: formData,
//        contentType: false,
//        processData: false,
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
//        success: function (result) {
//            OpenCloseModal($("#modalEliminar"), false);
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        }
//    });
//}

function dateFormat2(value, row, index) {
    return moment(value).format('DD/MM/YYYY HH:mm:ss');
}

function irObservar(id, codApp, nomApp) {
    $("#hdAplicacionId").val(id);
    ListarRegistrosFlujos(id);
    $("#spanApp").html(codApp + "-" + nomApp);
    OpenCloseModal($("#modalRechazarAplicacion"), true);
}

function ListarRegistrosFlujos(id) {
    $tableFlujos.bootstrapTable('destroy');
    $tableFlujos.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/flows`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: 1,
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "typeRegister",
        sortOrder: "asc",
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.id = $.trim($("#hdAplicacionId").val());

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

function estadoFormatter(value, row, index) {
    var html = "";
    if (row.isCompleted === true) { //VERDE
        html = '<a class="btn btn-success btn-circle" title="Atendida"></a>';
    } else if (row.isCompleted === false) { //ROJO
        html = '<a class="btn btn-danger btn-circle" title="Pendiente de atención"></a>';
    }
    return html;
}

function FlagConformidadGST_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $("#divTxtConformidadGST").show();
    }
    else {
        $("#divTxtConformidadGST").hide();
    }
}

function InitAutocompletarUsuariosLocal($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
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
            $searchBox.val(ui.item.displayName);


            return false;
        },
        select: function (event, ui) {
            if ($IdBox != null) {
                $IdBox.val(ui.item.id);
                $("#hExpertoCorreo").val(ui.item.mail);
                $("#hExpertoMatricula").val(ui.item.matricula);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function InitAutocompletarUsuariosLocal2($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
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
            $searchBox.val(ui.item.displayName);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox != null) {
                $IdBox.val(ui.item.id);
                $("#hConformidadCorreo").val(ui.item.mail);
                $("#hConformidadMatricula").val(ui.item.matricula);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}