var $table = $("#tblRegistro2");
var DATA_EXPORTAR = {};
//var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_REGISTRO_PAGINACION = PAGINA_TAMANIO;
var ULTIMO_PAGE_NUMBER = PAGINA_ACTUAL;
var ULTIMO_SORT_NAME = "applicationId";
var ULTIMO_SORT_ORDER = "asc";


const TITULO_MENSAJE = "Gestión de aplicaciones";
const TITULO_NO_PASE = "La aplicación no ha completado el registro de todos los campos requeridos, no es posible consultar o confirmar estos datos";
const URL_API_VISTA = URL_API + "/applicationportfolio";

var MENSAJE = "¿Estás seguro que deseas solicitar la reversión de eliminación de la aplicación?";

var MENSAJE_RECHAZAR = "¿Estás seguro de rechazar la solicitud de reversión de la aplicación?";
var MENSAJE_APROBAR = "¿Estás seguro de aprobar la solicitud de reversión de la aplicación?";

var URL_API_SOLICITUD = URL_API + "/Solicitud";
$(function () {


    $("#txtAplicacionFiltro").val("");

    ListarRegistros();
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
    validarFormSolicitud();
});

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

    let url = `${URL_API_VISTA}/ExportarAppReversion?applicationId=${DATA_EXPORTAR.applicationId}&estado=${DATA_EXPORTAR.estado}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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
    $("#btnAprobarRechazar").click(AprobarRechazarSolicitud);

}

function RefrescarListado() {
    ULTIMO_PAGE_NUMBER = 1;
    ListarRegistros();
}



function LimpiarModal() {
    LimpiarValidateErrores($("#formAprobarRechazar"));
    InitUpload($('#txtNomArchivoConformidad'), 'inputConformidad');
    $(":input", "#formAprobarRechazar").val("");

}



function opcionesFormatter(value, row, index) {


    let botonAceptar = "";
    let botonRechazar = "";
    let botonDescargar = "";
    let botonDescargarSolicitante = "";

    if (row.EstadoSolicitud == 2) {
        let btnAprobar = `<a href="javascript:irModal(1, ${row.AplicacionId}, '${row.CodigoAplicacion}', ${row.Id})" title="Aprobar la solicitud de reversión de eliminación de la aplicación"><i class="iconoVerde glyphicon glyphicon glyphicon-ok"></i></a>`;
        let btnRechazar = `<a href="javascript:irModal(2, ${row.AplicacionId}, '${row.CodigoAplicacion}', ${row.Id})" title="Rechazar la solicitud de reversión de eliminación de la aplicación"><i class="iconoRojo glyphicon glyphicon glyphicon-remove"></i></a>`;
        //botonDescargar = `<a href="javascript:DownloadFileSolicitud(${row.Id},  ${row.EstadoSolicitud},'${TITULO_MENSAJE}')" title="Descargar archivo"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
        botonDescargar = `<a href="javascript:DownloadFileSolicitud2(${row.Id},  '${TITULO_MENSAJE}', 1)" title="Descargar archivo"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
        return (btnAprobar.concat("&nbsp;&nbsp;", btnRechazar)).concat("&nbsp;&nbsp;", botonDescargar);

    } else if (row.EstadoSolicitud == 1) {
        botonDescargar = `<a href="javascript:DownloadFileSolicitud2(${row.Id},  '${TITULO_MENSAJE}', 2)" title="Descargar archivo cargado por el Portafolio de Aplicaciones"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
        botonDescargarSolicitante = `<a href="javascript:DownloadFileSolicitud2(${row.Id},  '${TITULO_MENSAJE}', 1)" title="Descargar archivo"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
        //botonDescargar = `<a href="javascript:DownloadFileSolicitud(${row.Id},  ${row.EstadoSolicitud},'${TITULO_MENSAJE}')" title="Descargar archivo"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
        return botonDescargar.concat("&nbsp;&nbsp;", botonDescargarSolicitante);
    } else if (row.EstadoSolicitud == 3) {
        botonDescargar = `<a href="javascript:DownloadFileSolicitud2(${row.Id},  '${TITULO_MENSAJE}', 3)" title="Descargar archivo cargado por el Portafolio de Aplicaciones"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
        botonDescargarSolicitante = `<a href="javascript:DownloadFileSolicitud2(${row.Id},  '${TITULO_MENSAJE}', 1)" title="Descargar archivo"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
        //botonDescargar = `<a href="javascript:DownloadFileSolicitud(${row.Id},  ${row.EstadoSolicitud},'${TITULO_MENSAJE}')" title="Descargar archivo"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
        return botonDescargar.concat("&nbsp;&nbsp;", botonDescargarSolicitante);
    }
    else
        return "-";

}

function irModal(tipo, idApplicacion, codAplicacion, idSolicitud) {
    LimpiarModal();
    $("#hdAplicacionId").val(idApplicacion);
    $("#hdSolicitudId").val(idSolicitud);
    $("#hdAccion").val(tipo);

    if (tipo == 1) {
        $("#modalAprobarRechazar #title-md").html("Aprobar reversión de eliminación de la aplicación: " + codAplicacion);
        $("#modalAprobarRechazar #lblDescripcion").html("Comentarios asociados a la aprobación:");
        MENSAJE = MENSAJE_APROBAR;
        $("#btnAprobarRechazar").html("Aprobar reversión");
    } else if (tipo == 2) {
        $("#modalAprobarRechazar #title-md").html("Rechazar reversión de eliminación de la aplicación: " + codAplicacion);
        $("#modalAprobarRechazar #lblDescripcion").html("Comentarios asociados al rechazo:");
        MENSAJE = MENSAJE_RECHAZAR;
        $("#btnAprobarRechazar").html("Rechazar reversión");
    }
    OpenCloseModal($("#modalAprobarRechazar"), true);
}



function validarFormSolicitud() {

    $.validator.addMethod("requiredArchivo", function (value, element) {
        return $.trim(value) !== "";
    });



    $("#formAprobarRechazar").validate({
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
            //,
            //flConformidad: {
            //    requiredArchivo: true
            //    //requiredExcel: true
            //},
        },
        messages: {
            txtDescripcion: {
                requiredSinEspacios: "Debes ingresar un comentario."
            }
            //,
            //flConformidad: {
            //    requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo")
            //},
        },
        errorPlacement: (error, element) => {
            //if (element.attr('name') === "txtNomArchivoConformidad" || element.attr('name') === "flConformidad") {
            //    element.parent().parent().parent().parent().append(error);
            //}
            //else
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



function AprobarRechazarSolicitud() {
    if ($("#formAprobarRechazar").valid()) {
        $("#btnAprobarRechazar").button("loading");

        let data = {
            Id: ($("#hdSolicitudId").val() === "") ? 0 : parseInt($("#hdSolicitudId").val()),
            AplicacionId: ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val()),
            Observaciones: $.trim($("#txtDescripcion").val()),
        };

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

                    let formData = new FormData();

                    let fileArchivo = $("#flConformidad").get(0).files;
                    formData.append("File", fileArchivo[0]);

                    formData.append("data", JSON.stringify(data));
                    let accion = $("#hdAccion").val();
                    formData.append("accion", accion);

                    $.ajax({
                        url: URL_API_VISTA + "/application/eliminadas/aprobarRechazarSolicitud",
                        type: "POST",
                        data: formData,
                        contentType: false,
                        processData: false,
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject == true) {
                                    if (accion == 1) {
                                        toastr.success("Se registró la aprobación de la solicitud de reversión de eliminación", TITULO_MENSAJE);
                                    } else if (accion == 2) {
                                        toastr.success("Se registró el rechazo de la solicitud de reversión de eliminación", TITULO_MENSAJE);
                                    }
                                    RefrescarListado();

                                    LimpiarModal();
                                    OpenCloseModal($("#modalAprobarRechazar"), false);
                                }
                            }
                        },
                        complete: function () {
                            $("#btnAprobarRechazar").button("reset");
                            waitingDialog.hide();
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        },
                        //async: false
                    });



                } else {
                    waitingDialog.hide();
                    $("#btnAprobarRechazar").button("reset");
                }
            }
        });
    }
}





function ListarRegistros() {
    nombre_app = $("#txtAplicacionFiltro").val();

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/eliminadas/solicitudesReversionGestion`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION_ALT,
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            ULTIMO_PAGE_NUMBER = p.pageNumber;
            ULTIMO_REGISTRO_PAGINACION = p.pageSize;
            ULTIMO_SORT_NAME = p.sortName;
            ULTIMO_SORT_ORDER = p.sortOrder;

            DATA_EXPORTAR = {};
            DATA_EXPORTAR.CodigoApt = $.trim($("#txtAplicacionFiltro").val());
            //DATA_EXPORTAR.username = USUARIO.UserName;
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

function dateFormat2(value, row, index) {
    return moment(value).format('DD/MM/YYYY HH:mm:ss');
}


function DownloadFileSolicitud(id, estadoSolicitud, titulo) {
    //let tipoArchivo = estadoSolicitud == 1 ? "2" : "3";
    let tipoArchivo = 1;
    let retorno;
    let _id = id;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_SOLICITUD + `/GetSolicitudArchivoAprobadoById?Id=${_id}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                retorno = dataObject;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });


    if (retorno == false) {
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

    } else {
        let url = `${URL_API_SOLICITUD}/DownloadArchivoEliminacion?id=${id}&tipoArchivo=${tipoArchivo}`;

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


}

function DownloadFileSolicitud2(id, titulo, tipoArchivo) {
    //let tipoArchivo = estadoSolicitud == 1 ? "2" : "3";
    //let tipoArchivo = 1;
    let retorno;
    let _id = id;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_SOLICITUD + `/GetSolicitudArchivoAprobadoById?Id=${_id}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                retorno = dataObject;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });


    if (retorno == false) {
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

    } else {
        let url = `${URL_API_SOLICITUD}/DownloadArchivoEliminacion?id=${id}&tipoArchivo=${tipoArchivo}`;

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


}