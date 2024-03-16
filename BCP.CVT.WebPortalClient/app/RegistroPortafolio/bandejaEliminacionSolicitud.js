var $table = $("#tbl-solicitudes");
var $tblComentarios = $("#tblComentarios");
var $tblDetalleAtributosApp = $("#tblDetalleAtributosApp");
var $tblDetalleModuloApp = $("#tblDetalleModuloApp");
var URL_API_VISTA = URL_API + "/Solicitud";

var DATA_EXPORTAR = {};
var DATA_ESTADO = [];
const TITULO_MENSAJE = "Bandeja de aprobación de solicitudes";
const MENSAJE = "¿Estás seguro que deseas enviar la solicitud de eliminación de esta aplicación?";
const MENSAJE_RECHAZAR_SOLICITANTE = "¿Estás seguro de rechazar la solicitud y notificar al solicitante sobre ello?";
const MENSAJE_RECHAZAR_SOLICITANTE2 = "¿Estás seguro de desestimar la solicitud de eliminación y notificar al portafolio sobre ello?";

const TIPO_FLUJO_PORTAFOLIO = { FNA: 1, PAE: 2 };
var TIPO_COMENTARIO = { OBSERVACION: 1, COMENTARIO: 2 };
var TIPO_SOLICITUD_APP = { CREACION: 1, MODIFICACION: 2, ELIMINACION: 3 };
//var ESTADO_SOLICITUD_APP = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var ESTADO_SOLICITUD_APP = { APROBADO: 1, PENDIENTE: 2, RECHAZADA: 3, PENDIENTECUSTODIO: 4, DESESTIMADA: 5, OBSERVADA: 6, OBSERVADA_USUARIO: 7 };
var ESTADO_APOYO_APROBADOR = [ESTADO_SOLICITUD_APP.APROBADO, ESTADO_SOLICITUD_APP.PENDIENTE, ESTADO_SOLICITUD_APP.RECHAZADA, ESTADO_SOLICITUD_APP.PENDIENTECUSTODIO, ESTADO_SOLICITUD_APP.DESESTIMADA, ESTADO_SOLICITUD_APP.OBSERVADA, ESTADO_SOLICITUD_APP.OBSERVADA_USUARIO];

const NOMBRE_FILE_ELIMINACION_FNA = "Adjuntar la evidencia de ticket o requerimiento de eliminación ejecutado en todos los ambientes:";
const NOMBRE_FILE_ELIMINACION_PAE = "Adjuntar formato de eliminación confirmado por Gestor:";
const NOMBRE_FILE_MODIFICACION = "Conformidades (se deben de incluir las evidencias de no contar con equipos relacionados):";
const URL_API_VISTA2 = URL_API + "/applicationportfolio";
var $tableFlujosAprobacion = $("#tblFlujosAprobacion");
var tipo = 0;

$(function () {
    //initFecha();
    validarFormImportar();
    cargarCombos();

    InitInputFiles();

    listarRegistros();
    $("#txtCodigoFiltro").keypress(function (event) {
        if (event.keyCode === 13) {
            $("#btnBuscar").click();
            event.preventDefault();
        }
    });
    $("#btnBuscar").click(RefrescarListado);

    InitAutocompletarUsuariosLocal($("#txtExperto"), $("#hExpertoId"), ".divExpertoContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");

    InitAutocompletarUsuariosLocal2($("#txtConformidad"), $("#hConformidadId"), ".divConformidadContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        ListarDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
    });
    $("#ddlTipoEliminacion").change(TipoEliminacion_Change);
    FormatoCheckBox($("#divFlagConformidadGST"), "ckbConformidadGST");
    $("#ckbConformidadGST").change(FlagConformidadGST_Change);
    $("#btnDescargar").click(descargarArchivo);
    $("#btnDescargar2").click(descargarArchivo2);
    $("#btnDescargar3").click(descargarArchivo3);
    $("#btnDescargar4").click(descargarArchivo);

    $("#btnEliminar").click(ReenviarSolicitud);

    $("#btnProcesarRechazoSolicitante").click(guardarRechazoAppSolicitante);
});

function guardarRechazoAppSolicitante() {
    if ($("#formRechazarSolicitante").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE_RECHAZAR_SOLICITANTE2,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                result = result || null;
                if (result !== null && result) {
                    sendDataFormAPISolicitante($("#btnProcesarRechazoSolicitante"));
                }
            }
        });
    }
}

function situacionFormatter(value, row, index) {
    var html = "";
    if (row.EstadoSolicitud === REGISTRO_APROBADO) { //VERDE
        html = `<a class="btn btn-success btn-circle" title="Registro completo" onclick="javascript:verFlujosAplicacion(${row.Id},'${row.AplicacionId}','${row.ApplicationName}','${row.ApplicationId}')"></a>`;
    } else if (row.EstadoSolicitud === REGISTRO_RECHAZADO) { //ROJO
        html = `<a class="btn btn-danger btn-circle" title="Registro parcial" onclick="javascript:verFlujosAplicacion(${row.Id},'${row.AplicacionId}','${row.ApplicationName}','${row.ApplicationId}')"></a>`;
    } else { //AMARILLO
        html = `<a class="btn btn-warning btn-circle" title="Pendiente" onclick="javascript:verFlujosAplicacion(${row.Id},'${row.AplicacionId}','${row.ApplicationName}','${row.ApplicationId}')"></a>`;
    }
    return html;
}


function verFlujosAplicacion(SolicitudAplicacionId, AplicacionId, ApplicationName, ApplicationId) {
    $("#hdAplicacionId").val(AplicacionId);
    ListarFlujosAprobacion(SolicitudAplicacionId, AplicacionId);
    $("#spanApp").html(ApplicationId + "-" + ApplicationName);
    OpenCloseModal($("#modalVerFlujosAprobacion"), true);
}

function ListarFlujosAprobacion(Solid, appid) {
    $tableFlujosAprobacion.bootstrapTable('destroy');
    $tableFlujosAprobacion.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA2 + `/application/flowsEliminacion`,
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


function sendDataFormAPISolicitante($btn) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjAplicacion();

    $.ajax({
        url: URL_API_VISTA + "/Desestimar",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    toastr.success("Se desestimación de la solicitud de modificación se realizó correctamente.", TITULO_MENSAJE);
                    $('.modal').modal('hide');
                    listarRegistros();
                }
            }
        },
        complete: function (data) {
            waitingDialog.hide();
            if ($btn !== null) {
                $btn.button("reset");
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function CrearObjAplicacion() {
    var data = {};
    data.AppId = $("#hdSolicitudId").val();
    data.comments = $("#txtDescripcionRechazoSolicitante").val();

    return data;
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

function ReenviarSolicitud() {
    if ($("#formEliminar").valid()) {
        $("#btnEliminar").button("loading");

        if ($("#ddlTipoEliminacion").val() == 2) {
            var ConformidadGST = $("#flConformidad").get(0).files;
            var TicketEliminacion = $("#flTicket").get(0).files;
            var Ratificacion = $("#flRatificacion").get(0).files;


            var pag = {
                Id: ($("#hdSolicitudId").val() === "") ? 0 : parseInt($("#hdSolicitudId").val()),

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
            var ConformidadGST = $("#flArchivo").get(0).files;



            var pag = {
                Id: ($("#hdSolicitudId").val() === "") ? 0 : parseInt($("#hdSolicitudId").val()),
                Comments: $.trim($("#txtDescripcionEliminar").val()),
                PreviousState: $("#hdPreviousState").val(),
                expertoNombre: $("#txtConformidad").val(),
                expertoMatricula: $("#hConformidadMatricula").val(),
                expertoCorreo: $("#hConformidadCorreo").val(),
                tipoEliminacion: $("#ddlTipoEliminacion").val()
            };
        }


        var idsol = 0;

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA2 + `/application/updateSolicitud`,
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
                                    if ($("#ddlTipoEliminacion").val() == 1) {
                                        UploadFile2($("#flArchivo"), idsol);
                                    }
                                    else if ($("#ddlTipoEliminacion").val() == 2) {
                                        UploadFile($("#flConformidad"), $("#flTicket"), $("#flRatificacion"), idsol);
                                    }
                                    toastr.success("Se envió la solicitud de eliminación.", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {

                            $("#btnEliminar").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalEliminar"), false);
                            //LimpiarModal();

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
            OpenCloseModal($("#modalEliminar"), false);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function UploadFile2($fileInput, idsol) {

    let formData = new FormData();
    let ConformidadGST = $fileInput.get(0).files;

    formData.append("File1", ConformidadGST[0]);

    formData.append("SolicitudAplicacionId", idsol);


    $.ajax({
        url: URL_API + "/File/upload5",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            OpenCloseModal($("#modalEliminar"), false);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function descargarArchivo() {
    var SolicitudId = $('#hdSolicitudId').val();
    DownloadGST1(SolicitudId);
}

function descargarArchivo2() {
    var SolicitudId = $('#hdSolicitudId').val();
    DownloadTicket(SolicitudId);
}

function descargarArchivo3() {
    var SolicitudId = $('#hdSolicitudId').val();
    DownloadRatificacion(SolicitudId);
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
function TipoEliminacion_Change() {
    let TipoEliminacion = $("#ddlTipoEliminacion").val();

    if (TipoEliminacion == 1) {
        $(".divProcesoEliminacion").hide();
        $(".divEliminacionAdministrativa").show();

        $(":input", "#formEliminar").val("");
        //$("#descripcion").val(Descripcion);
        $("#ddlTipoEliminacion").val(1);



    }
    else if (TipoEliminacion == 2) {
        $(".divProcesoEliminacion").show();

        $(".divEliminacionAdministrativa").hide();
        //LimpiarValidateErrores($("#formEliminar"));
        $(":input", "#formEliminar").val("");
        //$("#descripcion").val(Descripcion);
        $("#ddlTipoEliminacion").val(2);
    }

    $('#btnDescargar').hide();
    $('#btnDescargar2').hide();
    $('#btnDescargar3').hide();
    $('#btnDescargar4').hide();
}

function validarFormImportar() {

    $.validator.addMethod("requiredArchivo", function (value, element) {
        return $.trim(value) !== "";
    });

    $.validator.addMethod("requiredConformidad", function (value, element) {
        //var flag = $("#ckbConformidadGST").val();

        if ($("#ckbConformidadGST").prop("checked") && $("#ddlTipoEliminacion").val() == 2) {
            if ($("#txtNomArchivoConformidad").val() != '') {
                return true;
            }
            else {
                let valor = $.trim(value);
                return valor !== "";
            }
        }
        else {
            return true;
        }
    });

    $.validator.addMethod("requiredArchivo2", function (value, element) {
        //var flag = $("#ckbConformidadGST").val();

        if ($("#ddlTipoEliminacion").val() == 1) {
            if ($("#txtArchivo").val() != '') {
                return true;
            }
            else {
                let valor = $.trim(value);
                return valor !== "";
            }
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
                requiredSinEspacios2: true
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
                requiredSinEspacios2: String.Format("Debes ingresar {0}.", "el motivo de la eliminación.")
            },
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

function RefrescarListado() {
    ULTIMO_PAGE_NUMBER = 1;
    listarRegistros();
}

function initFecha() {
    $("#divFechaDesde").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });

    $("#divFechaHasta").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
}

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Tipo, $("#ddlTipoFiltro"), TEXTO_TODOS);
                    //DATA_ESTADO = dataObject.Estado;
                    //SetItems(DATA_ESTADO.filter(x => ESTADO_APOYO_APROBADOR.includes(x.Id)), $("#ddlEstadoFiltro"), TEXTO_TODOS);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado3",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: [30, 60, 90],
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            ULTIMO_PAGE_NUMBER = p.pageNumber;
            ULTIMO_REGISTRO_PAGINACION = p.pageSize;

            DATA_EXPORTAR = {};
            DATA_EXPORTAR.CodigoApt = $("#txtCodigoFiltro").val() !== "0" ? $("#txtCodigoFiltro").val() : $("#txtCodigoFiltro").val();
            DATA_EXPORTAR.TipoSolicitud = $("#ddlTipoFiltro").val();
            DATA_EXPORTAR.EstadoSolicitud = $("#ddlEstadoFiltro").val() === "-1" ? ESTADO_APOYO_APROBADOR : [$("#ddlEstadoFiltro").val()];
            DATA_EXPORTAR.FechaDesde = $.trim($("#txtFilFechaDesde").val()) !== "" ? castDate($("#txtFilFechaDesde").val()) : null;
            DATA_EXPORTAR.FechaHasta = $.trim($("#txtFilFechaHasta").val()) !== "" ? castDate($("#txtFilFechaHasta").val()) : null;

            DATA_EXPORTAR.pageNumber = ULTIMO_PAGE_NUMBER;
            DATA_EXPORTAR.pageSize = ULTIMO_REGISTRO_PAGINACION;

            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.FlagAprobacion = true;

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

//function detailFormatter(index, row) {
//    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
//                            <thead>\
//                                <tr>\
//                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="30">#</th>\
//                                    <th data-field="ConformidadGST" data-formatter="formatterDescarga" data-halign="center" data-valign="middle" data-align="center">Conformidad GST</th>\
//                                    <th data-field="TicketEliminacion" data-formatter="formatterDescarga" data-halign="center" data-valign="middle" data-align="center">Ticket de eliminación</th>\
//                                    <th data-field="Ratificacion" data-formatter="formatterDescarga" data-sortable="true" data-halign="center" data-valign="center" data-align="center">Ratificación</th>\
//                                </tr>\
//                            </thead>\
//                        </table>', row.Id);
//    return html;
//}

function opcionesFormatter(value, row, index) {
    let style_color = row.isCompleted == true ? 'iconoVerde ' : "iconoRojo ";
    let style_icon = row.isCompleted == true ? "pencil" : "zoom-in";
    let nombreAplicacion = row.NombreAplicacion.replace(/\n/g, '').replace(/\r\n/g, '');
    let btnAccion = '';
    btnAccion = `<a href="#" onclick="javascript:irEliminar(${row.Id},'${nombreAplicacion}','${row.CodigoAplicacion}','${row.EstadoSolicitud}')" title="Revisa el detalle de la solicitud"><i class="${style_color} glyphicon glyphicon-${style_icon}"></i></a>`;

    let botonRechazar = "";

    if (row.EstadoSolicitud == 4 || row.EstadoSolicitud == 2 || row.EstadoSolicitud == 6 || row.EstadoSolicitud == 7) {
        botonRechazar = `<a href="javascript:irRechazoSolicitante(${row.Id})" title="Desestima la solicitud de eliminación"><i class="iconoRojo glyphicon glyphicon glyphicon-remove"></i></a>`;

    }
    return btnAccion.concat("&nbsp;&nbsp;", botonRechazar);

}


function irRechazoSolicitante(id) {
    $("#hdSolicitudId").val(id);
    $("#txtDescripcionRechazoSolicitante").val('');
    LimpiarValidateErrores($("#formRechazarSolicitante"));
    OpenCloseModal($("#modalRechazarSolicitante"), true);
}

function LimpiarModalSolicitudEliminacion() {
    $(":input", "#formEliminar").val("");
    $("#ddlTipoEliminacion").val(-1);
    $(".divProcesoEliminacion").hide();
    $(".divEliminacionAdministrativa").hide();

    $('#ckbConformidadGST').bootstrapToggle('destroy');
    //$("#ckbConformidadGST").prop('checked', false);
    //$("#ckbConformidadGST").bootstrapToggle('off');

    $("#btnDescargar").show();
    $("#btnDescargar2").show();
    $("#btnDescargar3").show();
    $("#btnDescargar4").show();
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
function irEliminar(id, name, applicationId, state) {
    document.getElementById("titulo").innerText = 'Solicita la eliminación de la aplicación: ' + name;
    document.getElementById("subtitulo").innerText = 'Codigo de aplicación: ' + applicationId + ' - Nombre de la aplicación: ' + name;

    LimpiarModalSolicitudEliminacion();

    if (state == "6" || state == "7") {
        $("#btnEliminar").show();
        $("#txtDescripcionEliminar").prop("disabled", false);
        $("#txtConformidad").prop("disabled", false);
        $("#txtExperto").prop("disabled", false);
        $("#txtTicket").prop("disabled", false);
        $("#ddlTipoEliminacion").prop("disabled", false);

        $("#flRatificacion").prop("disabled", false);

        $("#flTicket").prop("disabled", false);

        $("#flConformidad").prop("disabled", false);
        $("#flArchivo").prop("disabled", false);
        //$("#txtObservaciones").show();

        $("#ckbConformidadGST").prop("disabled", false);
    }
    else if (state != "6") {
        $("#btnEliminar").hide();
        //$("#txtObservaciones").hide();
        $("#ckbConformidadGST").attr("disabled", "disabled");
    }

    getSolicitud(id);
    OpenCloseModal($("#modalEliminar"), true);
    //document.getElementById("title-md").val = 'Solicita la eliminación de la aplicación: ' + name;
}

function getSolicitud(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({

        url: URL_API_VISTA2 + `/application/Solicitud2/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;

                    if (data.TipoEliminacion == 1) {
                        $(".divProcesoEliminacion").hide();
                        $(".divEliminacionAdministrativa").show();

                        //$("#descripcion").val(Descripcion);
                        $("#ddlTipoEliminacion").val(1);
                        $("#txtConformidad").val(data.ExpertoNombre);

                        $("#txtArchivo").val(data.NombreConformidadGST);
                    }
                    else if (data.TipoEliminacion == 2) {
                        $(".divProcesoEliminacion").show();

                        $(".divEliminacionAdministrativa").hide();
                        //LimpiarValidateErrores($("#formEliminar"));

                        //$("#descripcion").val(Descripcion);
                        $("#ddlTipoEliminacion").val(2);
                        $("#txtTicket").val(data.TicketEliminacion);
                        $("#txtExperto").val(data.ExpertoNombre)
                        $("#txtNomArchivoConformidad").val(data.NombreConformidadGST);
                        $("#txtNomTicket").val(data.NombreTicketEliminacion)
                        $("#txtNomRatificacion").val(data.NombreRatificacion);
                    }


                    $("#ddlTipoEliminacion").val(data.TipoEliminacion);
                    if ((data.NombreConformidadGST == null || data.NombreConformidadGST == '') && data.TipoEliminacion == 2) {
                        $('#btnDescargar').hide();
                    }


                    if (data.NombreTicketEliminacion == null || data.NombreTicketEliminacion == '') {
                        $('#btnDescargar2').hide();
                    }
                    if (data.NombreRatificacion == null || data.NombreRatificacion == '') {
                        $('#btnDescargar3').hide();
                    }
                    if ((data.NombreConformidadGST == null || data.NombreConformidadGST == '') && data.TipoEliminacion == 1) {
                        $('#btnDescargar4').hide();
                    }


                    //alert(data.FlagRequiereConformidad);
                    $("#ckbConformidadGST").prop('checked', data.FlagRequiereConformidad);
                    $("#ckbConformidadGST").bootstrapToggle(data.FlagRequiereConformidad ? 'on' : 'off');
                    //$("#ckbConformidadGST").attr("disabled", "disabled");

                    if (data.FlagRequiereConformidad) {
                        $("#divTxtConformidadGST").show();
                        $('#btnDescargar').show();
                    }
                    else {
                        $("#divTxtConformidadGST").hide();
                        $('#btnDescargar').hide();
                    }

                    $("#txtDescripcionEliminar").val(data.Observaciones);
                    $("#txtAprobadoPor").val(data.LiderUsuario_PO);
                    //$("#txtFechaAprobacion").val(data.FechaModificacionFormato);
                    $("#hdSolicitudId").val(data.Id);
                    //$("#hdFlowId").val(Id);
                    $("#txtObservaciones").val(data.ObservacionesRechazo);

                    tipo = data.TipoEliminacion;



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


function DownloadFileSolicitud(id, tipoArchivo, titulo) {
    if (tipoArchivo == 0) {
        bootbox.alert({
            size: "small",
            title: titulo,
            message: "No existe un archivo para descargar.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
        return false;
    }

    let url = `${URL_API_VISTA}/DownloadArchivoEliminacion?id=${id}&tipoArchivo=${tipoArchivo}`;

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

function formatterDescarga(value, row, index) {
    let retorno = `<a href="javascript:DownloadFileSolicitud(${row.SolicitudId}, ${value}, '${TITULO_MENSAJE}')" title="Descargar archivo"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
    return retorno;
}

function ListarDetalle(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado/DetalleEliminacion",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
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
function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR.TipoSolicitud = $("#ddlEstadoFiltro").val();

    //let url = `${URL_API_VISTA}/ExportarSolicitudesEliminacion?matricula=${DATA_EXPORTAR.Matricula}&codigoApt=${DATA_EXPORTAR.CodigoApt}&estadoSolicitudUnico=${DATA_EXPORTAR.TipoSolicitud}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
    let url = `${URL_API_VISTA}/ExportarSolicitudesEliminacion?codigoApt=${DATA_EXPORTAR.CodigoApt}&estadoSolicitudUnico=${DATA_EXPORTAR.TipoSolicitud}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function dateFormat(value, row, index) {
    if (value != null)
        return moment(value).format('DD/MM/YYYY HH:mm:ss');
    else return "-";
}