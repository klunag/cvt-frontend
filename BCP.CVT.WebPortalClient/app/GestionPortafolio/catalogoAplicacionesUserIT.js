var $table = $("#tblRegistro");
var $table2 = $("#tblRegistro2");
var $tableFlujos = $("#tblFlujos");
var $tableFlujosAprobacion = $("#tblFlujosAprobacion");
const URL_API_VISTA2 = URL_API + "/applicationportfolio";
var DATA_EXPORTAR = {};
//var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_REGISTRO_PAGINACION = PAGINA_TAMANIO;
var ULTIMO_PAGE_NUMBER = PAGINA_ACTUAL;
var ULTIMO_SORT_NAME = "applicationId";
var ULTIMO_SORT_ORDER = "asc";

var ULTIMO_SORT_NAME_FLOW = "FlowAppId";

const TITULO_MENSAJE = "Portafolio de aplicaciones";
const MENSAJE = "¿Estás seguro que deseas continuar con el cambio de estado de esta aplicación?";
const TITULO_NO_PASE = "La aplicación no ha completado el registro de todos los campos requeridos, no es posible consultar o confirmar estos datos";
const URL_API_VISTA = URL_API + "/applicationportfolio";

const MENSAJE_RECHAZAR = "¿Estás seguro de rechazar la solicitud y notificar al solicitante sobre ello?";
const MENSAJE_APROBAR = "¿Estás seguro de actualizar los datos de la aplicación y aprobar el cambio?";

$(function () {

    validarFormNoVigente();
    $("#txtAplicacionFiltro").val(nombre_app);
    $("#cbFilEstado").val(ESTADO);
    ListarRegistros();
    ListarRegistrosApplicationFlow();
    InitAcciones();
    InitInputFiles();


    ULTIMO_PAGE_NUMBER = PAGINA_ACTUAL;
    ULTIMO_REGISTRO_PAGINACION = PAGINA_TAMANIO;

    $("#txtAplicacionFiltro").keypress(function (event) {
        if (event.keyCode === 13) {
            $("#btnBuscar").click();
            event.preventDefault();
        }
    });

    $("#btnExportar").click(ExportarInfo);

    $table2.on('expand-row.bs.table', function (e, index, row, $detail) {
        ListarAlertasDetalle(row.FlowAppId, $('#tblRegistrosDetalle_' + row.FlowAppId), $detail);
    });

    $("#btnProcesarRechazoSolicitante").click(guardarRechazoAppSolicitante);
    validarFormRechazoSolicitante();
});




function verFlujosAplicacion(SolicitudAplicacionId, AplicacionId, ApplicationName, ApplicationId) {

    ListarFlujosAprobacion(SolicitudAplicacionId, AplicacionId);
    $("#spanApp").html(ApplicationId + "-" + ApplicationName);
    OpenCloseModal($("#modalVerFlujosAprobacion"), true);
}

function ListarFlujosAprobacion(Solid, appid) {
    $tableFlujosAprobacion.bootstrapTable('destroy');
    $tableFlujosAprobacion.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA2 + `/application/flowsModificacion`,
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
            DATA_EXPORTAR.Id = appid;
            DATA_EXPORTAR.solId = Solid;

            DATA_EXPORTAR.pageNumber = p.pageNumber;;
            DATA_EXPORTAR.pageSize = p.pageSize;;
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
function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.applicationId = $('#txtAplicacionFiltro').val();
    DATA_EXPORTAR.estado = $('#cbFilEstado').val();

    DATA_EXPORTAR.sortName = 'applicationId';
    DATA_EXPORTAR.sortOrder = 'asc';

    let url = `${URL_API_VISTA}/ExportarAppUserIt?applicationId=${DATA_EXPORTAR.applicationId}&estado=${DATA_EXPORTAR.estado}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function InitAcciones() {
    $("#btnRegistrarNoVigente").click(CambiarEstadoRegistro);
    $("#btnRegistrarVigente").click(RegresarEstadoRegistro);
    $("#btnEliminar").click(SolicitudEliminacion);

}

function RefrescarListado() {
    ULTIMO_PAGE_NUMBER = 1;
    ListarRegistros();
    ListarRegistrosApplicationFlow();
}

function AddRegistro() {
    $("#title-md").html("Nuevo registro");
    LimpiarModal();
    OpenCloseModal($("#mdRegistro"), true);
}

function LimpiarModal() {
    LimpiarValidateErrores($("#formNoVigente"));
    $(":input", "#formNoVigente").val("");
    $("#ckbEquipoAgil").prop("checked", false);
    $("#ckbEquipoAgil").bootstrapToggle("off");
}

function ListarRegistros() {
    nombre_app = $("#txtAplicacionFiltro").val();
    ESTADO = $("#ddlEstadoFiltro").val();
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/listUserITApps`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION_ALT,
        sortName: 'applicationId',
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

function ListarRegistrosApplicationFlow() {
    nombre_app = $("#txtAplicacionFiltro").val();
    ESTADO = $("#cbFilEstado").val();
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table2.bootstrapTable('destroy');
    $table2.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/requestsByUserIT`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'dateCreation',
        sortOrder: 'desc',
        queryParams: function (p) {
            ULTIMO_PAGE_NUMBER = p.pageNumber;
            ULTIMO_REGISTRO_PAGINACION = p.pageSize;
            ULTIMO_SORT_NAME = p.sortName;
            ULTIMO_SORT_ORDER = p.sortOrder;

            DATA_EXPORTAR = {};
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
    window.document.location.href = `DetalleAplicacionUserIT?id=${id}&nom_App=${nombre_app}&estado=${ESTADO}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}`;
}

function opcionesSolicitudesFormatter(value, row, index) {
    let style_color = row.isCompleted == true ? 'iconoVerde ' : "iconoRojo ";
    let style_icon = row.isCompleted == true ? "pencil" : "zoom-in";
    let btnAccion = '';
    if (row.typeFlow == FLUJO_REGISTRO)
        btnAccion = `<a href="#" onclick="javascript:irGobiernoEdit(${row.AppId},${row.FlowAppId})" title="Revisa el detalle de la solicitud de modificación"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;
    return btnAccion;

}

function irGobiernoEdit(appId, flowAppId) {
    window.document.location.href = `GobiernoUserITEdit?appId=${appId}&flowId=${flowAppId}`;
}

function opcionesFormatter(value, row, index) {
    let style_color = row.registrationSituation == REGISTRO_COMPLETO ? 'iconoVerde ' : "iconoRojo ";

    let btnNoVigente = '';
    let btnEliminar = '';
    let btnPase = '';
    if (row.status != ESTADO_NOVIGENTE && row.status != ESTADO_ELIMINADA) {
        btnNoVigente = `<a href="javascript:irNoVigente(${row.id},'${row.statusDetail}')" title="Cambia el estado de la aplicación a No Vigente"><i class="iconoRojo glyphicon glyphicon glyphicon-off"></i></a>`;
        btnPase = `<a href="javascript:irPase(${row.id},${row.registrationSituation})" title="Confirmar pase a producción"><i class="${style_color} glyphicon glyphicon-cloud-upload"></i></a>`;
    }
    else
        btnNoVigente = `<a href="javascript:activarNoVigente(${row.id})" title="Reactiva tu aplicación manteniendo el estado anterior de la aplicación "><i class="iconoVerde glyphicon glyphicon glyphicon-off"></i></a>`;

    if (row.status == ESTADO_ELIMINADA) {
        btnEliminar = `<a href="javascript:activarEliminar(${row.id})" title="Reactiva tu aplicación manteniendo el estado anterior de la aplicación"><i class="iconoVerde glyphicon glyphicon-ok"></i></a>`;
        btnNoVigente = ``;
    }
    else
        btnEliminar = `<a href="javascript:irEliminar(${row.id},'${row.statusDetail}')" title="Inicia el flujo de eliminación de la aplicación"><i class="iconoRojo glyphicon glyphicon-remove"></i></a>`;

    return btnPase.concat("&nbsp;&nbsp;", btnNoVigente.concat("&nbsp;&nbsp;", btnEliminar));
}

function irNoVigente(id, statusDetail) {
    $("#hdAplicacionId").val(id);
    $("#hdPreviousState").val(statusDetail);
    LimpiarModal();
    OpenCloseModal($("#modalNoVigente"), true);
}

function activarNoVigente(id) {
    $("#hdAplicacionId").val(id);
    LimpiarModal();
    OpenCloseModal($("#modalVigente"), true);
}

function irEliminar(id, statusDetail) {
    $("#hdAplicacionId").val(id);
    $("#hdPreviousState").val(statusDetail);
    OpenCloseModal($("#modalEliminar"), true);
}

//function situacionFormatter(value, row, index) {
//    var html = "";
//    if (row.registrationSituation === REGISTRO_COMPLETO) { //VERDE
//        html = `<a class="btn btn-success btn-circle" title="Registro completo" style="cursor: pointer;" onclick="javascript:irObservar(${row.id},'${row.applicationId}','${row.name}')"></a>`;
//    } else if (row.registrationSituation === REGISTRO_PARCIAL) { //ROJO
//        html = `<a class="btn btn-danger btn-circle" title="Registro parcial" style="cursor: pointer;" onclick="javascript:irObservar(${row.id},'${row.applicationId}','${row.name}')"></a>`;
//    }
//    return html;
//}

function situacionFormatter(value, row, index) {
    var html = "";
    if (row.EstadoSolicitudId === REGISTRO_APROBADO) { //VERDE
        html = `<a class="btn btn-success btn-circle" title="Registro completo" onclick="javascript:verFlujosAplicacion(${row.Id},'${row.AppId}','${row.applicationName}','${row.applicationId}')"></a>`;
    } else if (row.EstadoSolicitudId === REGISTRO_RECHAZADO) { //ROJO
        html = `<a class="btn btn-danger btn-circle" title="Registro parcial" onclick="javascript:verFlujosAplicacion(${row.Id},'${row.AppId}','${row.applicationName}','${row.applicationId}')"></a>`;
    } else { //AMARILLO
        html = `<a class="btn btn-warning btn-circle" title="Pendiente" onclick="javascript:verFlujosAplicacion(${row.Id},'${row.AppId}','${row.applicationName}','${row.applicationId}')"></a>`;
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
        let ConformidadGST = $("#flConformidad").get(0).files;
        let TicketEliminacion = $("#flTicket").get(0).files;
        let Ratificacion = $("#flRatificacion").get(0).files;


        let pag = {
            Id: ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val()),
            Status: ESTADO_NOVIGENTE,
            Comments: $.trim($("#txtDescripcionEliminar").val()),
            PreviousState: $("#hdPreviousState").val(),

        };

        var idsol = 0;

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
                        data: JSON.stringify(pag),
                        //data: pag,
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        //contentType: false,
                        //processData: false,
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    idsol = dataObject;

                                    toastr.success("Se envió la solicitud de eliminación.", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {

                            $("#btnEliminar").button("reset");
                            waitingDialog.hide();
                            UploadFile($("#flConformidad"), $("#flTicket"), $("#flRatificacion"), idsol);
                            OpenCloseModal($("#modalEliminar"), false);
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
                requiredArchivo: true
                //requiredExcel: true
            },
            flRatificacion: {
                requiredArchivo: true
                //requiredExcel: true
            },
            flTicket: {
                requiredArchivo: true
                //requiredExcel: true
            }
        },
        messages: {
            txtDescripcionEliminar: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el motivo de la eliminación.")
            },
            flConformidad: {
                requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo")
            },
            flRatificacion: {
                requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo")
            },
            flTicket: {
                requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo")
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
            else {
                element.parent().append(error);
            }
        }
    });
}

function UploadFile($fileInput, $fileInput1, $fileInput2, idsol) {

    let formData = new FormData();
    let ConformidadGST = $fileInput.get(0).files;
    let TicketEliminacion = $fileInput1.get(0).files;
    let Ratificacion = $fileInput2.get(0).files;
    formData.append("File1", ConformidadGST[0]);
    formData.append("File2", TicketEliminacion[0]);
    formData.append("File3", Ratificacion[0]);
    formData.append("SolicitudAplicacionId", idsol);


    $.ajax({
        url: URL_API + "/File/upload2",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            estado = result;
            OpenCloseModal($("#modalEliminar"), false);
            //if ($table !== null) {
            //    $table.bootstrapTable("refresh");
            //}
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });
    return estado;
}

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

function ListarAlertasDetalle(id, $tableDetalle, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableDetalle.bootstrapTable('destroy');
    $tableDetalle.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/flows/data",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'ColumnaDetalle',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.id = id;
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
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="30">#</th>\
                                    <th data-field="ColumnaDetalle" data-halign="center" data-valign="middle" data-align="left"  data-width="280">Campo</th>\
                                    <th data-field="DetalleActual" data-halign="center" data-valign="middle" data-align="left">Valor inicial</th>\
                                    <th data-field="DetalleNuevo" data-halign="center" data-valign="middle" data-align="left">Valor configurado</th>\
                               </tr>\
                            </thead>\
                        </table>', row.FlowAppId);
    return html;
}

function opciones(value, row, index) {
    let botonAceptar = "";
    let botonRechazar = "";
    let botonDescargar = "";

    if (row.isCompleted == true)
        "-"
    else {
        botonAceptar = `<a href="javascript:irConfirmar(${row.FlowAppId})" title="Acepta la solicitud de modificación"><i class="iconoVerde glyphicon glyphicon glyphicon-ok"></i></a>`;
        botonRechazar = `<a href="javascript:irRechazoSolicitante(${row.FlowAppId})" title="Rechaza la solicitud de modificación"><i class="iconoRojo glyphicon glyphicon glyphicon-remove"></i></a>`;
        return botonAceptar.concat("&nbsp;&nbsp;", botonRechazar);
    }
}

function irRechazoSolicitante(id) {
    $("#hdFlowAppId").val(id);
    $("#txtDescripcionRechazo").val('');
    LimpiarValidateErrores($("#formRechazarSolicitante"));
    OpenCloseModal($("#modalRechazarSolicitante"), true);
}

function guardarRechazoAppSolicitante() {
    if ($("#formRechazarSolicitante").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE_RECHAZAR,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                result = result || null;
                if (result !== null && result) {
                    sendDataFormAPI($("#btnProcesarRechazoSolicitante"), false, ACCION_RECHAZAR);
                }
            }
        });
    }
}

function validarFormRechazoSolicitante() {
    $("#formRechazarSolicitante").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtDescripcionRechazoSolicitante: {
                requiredSinEspacios: true,
                maxlength: 800
            }
        },
        messages: {
            txtDescripcionRechazoSolicitante: {
                requiredSinEspacios: "Debes de ingresar un comentario para justificar el rechazo",
                maxlength: "El límite de caracteres esperados es de 800"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDescripcionRechazoSolicitante") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function CrearObjAplicacion(aprobado, accion) {
    var data = {};
    data.AppId = $("#hdAplicacionId").val();
    data.FlowAppId = $("#hdFlowAppId").val();

    data.isApproved = aprobado;
    data.actionManager = accion;

    data.RegistroOModificacion = 2;

    if (accion != ACCION_REGISTRAR)
        data.comments = $("#txtDescripcionRechazo").val();

    return data;
}

function sendDataFormAPI($btn, aprobado, accion) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjAplicacion(aprobado, accion);

    $.ajax({
        url: URL_API_VISTA + "/application/evaluserit",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let dataResult = dataObject;
                    estadoTransaccion = dataResult.EstadoTransaccion;
                    if (dataResult.EstadoTransaccion) {
                        ListarRegistros();
                        ListarRegistrosApplicationFlow();
                    } else {
                        MensajeGeneralAlert(TITULO_MENSAJE, "Se ha encontrado un inconveniente en la actualización, vuelve a intentarlo.");
                    }
                }
            }
        },
        complete: function (data) {
            if ($btn !== null) {
                $btn.button("reset");
                waitingDialog.hide();
                OpenCloseModal($("#modalRechazarSolicitante"), false);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function irConfirmar(id) {
    $("#hdFlowAppId").val(id);
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE_APROBAR,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            result = result || null;
            if (result !== null && result) {
                sendDataFormAPI($("#btnProcesarRechazoSolicitante"), true, ACCION_REGISTRAR);
            }
        }
    });
}