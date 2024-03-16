var $table = $("#tblRegistro");
var $table2 = $("#tblRegistro2");
var $tableFlujos = $("#tblFlujos");
var DATA_EXPORTAR = {};

var URL_API_SOLICITUD = URL_API + "/Solicitud";

//var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_REGISTRO_PAGINACION = PAGINA_TAMANIO;
var ULTIMO_PAGE_NUMBER = PAGINA_ACTUAL;
var ULTIMO_SORT_NAME = "applicationId";
var ULTIMO_SORT_ORDER = "asc";

var ULTIMO_SORT_NAME_FLOW = "FlowAppId";

const TITULO_MENSAJE = "Portafolio de aplicaciones";
const MENSAJE = "¿Estás seguro que deseas solicitar la reversión de eliminación de la aplicación?";
const TITULO_NO_PASE = "La aplicación no ha completado el registro de todos los campos requeridos, no es posible consultar o confirmar estos datos";
const URL_API_VISTA = URL_API + "/applicationportfolio";

const MENSAJE_RECHAZAR = "¿Estás seguro de rechazar la solicitud y notificar al solicitante sobre ello?";
const MENSAJE_APROBAR = "¿Estás seguro de actualizar los datos de la aplicación y aprobar el cambio?";

$(function () {


    $("#txtAplicacionFiltro").val(nombre_app);

    ListarRegistros();
    ListarSolicitudesReversionEliminacion();
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

    let url = `${URL_API_VISTA}/ExportarAppUserIt?applicationId=${DATA_EXPORTAR.applicationId}&estado=${DATA_EXPORTAR.estado}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
    $.ajax({
        url: url,
        type: "GET",
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
    $("#btnSolicitarReversionEliminacion").click(RegistrarSolicitudReversion);

}

function RefrescarListado() {
    ULTIMO_PAGE_NUMBER = 1;
    ListarRegistros();
    ListarSolicitudesReversionEliminacion();
}



function LimpiarModal() {
    LimpiarValidateErrores($("#formSolicitarReversionEliminacion"));
    InitUpload($('#txtNomArchivoConformidad'), 'inputConformidad');
    $(":input", "#formSolicitarReversionEliminacion").val("");

}

function ListarRegistros() {
    nombre_app = $("#txtAplicacionFiltro").val();

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/eliminadas/listadoAprobadas`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: [30, 60, 90],
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

function opcionesFormatter(value, row, index) {

    let btnEliminar = '';
    var flagDisabled = row.aplicacionRevertida;
    if (flagDisabled) {
        btnEliminar = `<i class="iconoAmarillo glyphicon glyphicon-warning-sign" title="La aplicación ya cuenta con una solicitud de reversión en curso"></i>`;

    } else {
        btnEliminar = `<a href="javascript:irRevertirEliminacion(${row.id}, '${row.applicationId}')" title="Solicitar reversión de eliminación"><i class="iconoRojo glyphicon glyphicon-remove"></i></a>`;

    }

    return btnEliminar;
}

function irRevertirEliminacion(id, applicationId) {
    LimpiarModal();
    $("#hdAplicacionId").val(id);


    $("#modalRevertirEliminacion #title-md").html("Solicitar reversión de eliminación de la aplicación: " + applicationId);
    OpenCloseModal($("#modalRevertirEliminacion"), true);
}



function validarFormSolicitud() {

    $.validator.addMethod("requiredArchivo", function (value, element) {
        return $.trim(value) !== "";
    });



    $("#formSolicitarReversionEliminacion").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtDescripcionReversion: {
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
            txtDescripcionReversion: {
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
            if (element.attr('name') === "txtDescripcionReversion") {
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



function RegistrarSolicitudReversion() {
    if ($("#formSolicitarReversionEliminacion").valid()) {
        $("#btnSolicitarReversionEliminacion").button("loading");

        let data = {
            AplicacionId: ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val()),
            Observaciones: $.trim($("#txtDescripcionReversion").val()),
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


                    $.ajax({
                        url: URL_API_VISTA + "/application/eliminadas/solicitarReversion",
                        type: "POST",
                        data: formData,
                        contentType: false,
                        processData: false,
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject > 0) {
                                    toastr.success("Se registró la solicitud de reversión de eliminación", TITULO_MENSAJE);
                                    RefrescarListado();

                                    LimpiarModal();
                                    OpenCloseModal($("#modalRevertirEliminacion"), false);
                                }
                                else {
                                    toastr.error("No es posible generar la solicitud de reactivación ya que existen solicitudes en proceso.", TITULO_MENSAJE);
                                }
                            }
                        },
                        complete: function () {
                            $("#btnSolicitarReversionEliminacion").button("reset");
                            waitingDialog.hide();
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        },
                        //async: false
                    });



                } else {
                    waitingDialog.hide();
                    $("#btnSolicitarReversionEliminacion").button("reset");
                }
            }
        });
    }
}





function ListarSolicitudesReversionEliminacion() {
    nombre_app = $("#txtAplicacionFiltro").val();

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table2.bootstrapTable('destroy');
    $table2.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/eliminadas/solicitudesReversion`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            ULTIMO_PAGE_NUMBER = p.pageNumber;
            ULTIMO_REGISTRO_PAGINACION = p.pageSize;
            ULTIMO_SORT_NAME = p.sortName;
            ULTIMO_SORT_ORDER = p.sortOrder;

            DATA_EXPORTAR = {};
            DATA_EXPORTAR.CodigoApt = $.trim($("#txtAplicacionFiltro").val());
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

function opcionesDescargar(value, row, index) {
    let botonDescargarSolicitante = "";
    let botonDescargarPortafolio = "";

    botonDescargarSolicitante = `<a href="javascript:DownloadFileSolicitud(${row.Id},  '${TITULO_MENSAJE}', 1)" title="Descargar archivo"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;

    if (row.EstadoSolicitud == 1)
        botonDescargarPortafolio = `<a href="javascript:DownloadFileSolicitud(${row.Id},  '${TITULO_MENSAJE}', 2)" title="Descargar archivo cargado por el Portafolio de Aplicaciones"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;

    else if (row.EstadoSolicitud == 3)
        botonDescargarPortafolio = `<a href="javascript:DownloadFileSolicitud(${row.Id},  '${TITULO_MENSAJE}', 3)" title="Descargar archivo cargado por el Portafolio de Aplicaciones"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;

    return botonDescargarSolicitante.concat("&nbsp;&nbsp;", botonDescargarPortafolio);
}



function DownloadFileSolicitud(id, titulo, tipoArchivo) {
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