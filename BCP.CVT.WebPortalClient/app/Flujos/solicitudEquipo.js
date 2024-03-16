var $table = $("#tbl-solicitudes");
var URL_API_VISTA = URL_API + "/ApplianceSolicitud";
var URL_API_FILE = URL_API + "/File";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Solicitudes de cambio de equipo Appliance";

$(function () {

    initFecha();
    
    validarForm();
        
    listarSolicitudes();
    InitAutocompletarBuilder($("#txtCodigoFiltro"), null, ".containerFiltro", "/Equipo/GetEquipoByFiltroActivo?filtro={0}");
    InitAutocompletarBuilderLocal($("#txtEquipo"), $("#hdEquipoId"), ".containerFiltro", "/Equipo/GetEquipoByFiltroActivo?filtro={0}");
    InitAutocompletarBuilderLocalAplicacion($("#txtAplicacion"), $("#hdAplicacionId"), ".containerAplicacion", "/applicationportfolio/application/filter?filtro={0}&codigoAPT=");
    InitUpload($('#txtArchivo'), 'inputArchivo');
    $("#btnGuardar").click(guardarAddOrEditSolicitud);
    $("#btnAprobar").click(aprobarSolicitud);
    $("#btnRechazar").click(rechazarSolicitud);
    $("#btnProcesarRechazoSolicitante").click(guardarRechazoAppSolicitante);
    $("#btnProcesarAprobador").click(guardarAprobadorRechazo);
    $("#btnBuscar").click(listarSolicitudes);
});

function limpiarAddOrEditModal() {
    $("#btnDescargar").hide();
    $("#btnGuardar").show();
    $("#btnAprobar").hide();
    $("#btnRechazar").hide();
    $("#txtComentarios").prop("disabled", false);
    $("#dpFecha").prop("disabled", false);
    $("#txtEquipo").prop("disabled", false);
    $("#txtAplicacion").prop("disabled", false);
    $("#flArchivo").prop("disabled", false);
    $("#txtArchivo").prop("disabled", false);
    $("#rowComentariosAprobador").hide();
    $("#rowComentariosDesestimacion").hide();
    $("#rowComentariosRechazo").hide();
    LimpiarValidateErrores($("#formEliminar"));    
    $("#txtEquipo, #dpFecha, #txtComentarios, #flArchivo, #txtComentariosAprobacionRechazo, #txtArchivo").val("");
    $("#hdSolicitudId").val("0");
    $("#hdAccion").val("0");
    $("#hdAplicacionId").val("0");
    $("#txtAplicacion").val('');
}

function AddSolicitud() {
    $("#hdSolicitudId").val(0);
    irAddOrEditModal(true);
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR.nombre = $.trim($("#txtCodigoFiltro").val());
    DATA_EXPORTAR.tipoId = $.trim($("#ddlEstadoFiltro").val());

    let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre}&estado=${DATA_EXPORTAR.tipoId}`;
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

function listarSolicitudes() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtCodigoFiltro").val());
            DATA_EXPORTAR.tipoId = $.trim($("#ddlEstadoFiltro").val());
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

function guardarAddOrEditSolicitud() {
    if ($("#formEliminar").valid()) {        
        var solicitud = {};        
        solicitud.EquipoId = ($("#hdEquipoId").val() === "") ? 0 : parseInt($("#hdEquipoId").val());

        if (solicitud.EquipoId !== 0) {
            bootbox.confirm({
                title: TITULO_MENSAJE,
                message: "¿Estás seguro de enviar la solicitud de transferencia al Owner de la aplicación ingresada para su aprobación?",
                buttons: SET_BUTTONS_BOOTBOX,
                callback: function (result) {
                    if (result !== null && result) {
                        GuardarSolicitud(solicitud);
                    }
                    else {
                        $("#btnGuardar").button("reset");
                    }
                }
            });
            
        } else {
            toastr.warning("Es necesario seleccionar un equipo válido", TITULO_MENSAJE);
        }
    }
}

function GuardarSolicitud(solicitud) {
    $("#btnGuardar").button("loading");

    solicitud.EstadoSolicitud = 2;    
    solicitud.Comentarios = $("#txtComentarios").val();
    solicitud.FechaFinSoporte = castDate($("#dpFecha").val());
    solicitud.CodigoAPT = $("#hdAplicacionId").val() !== "0" ? $("#hdAplicacionId").val() : $("#txtAplicacion").val();
    solicitud.FlagSeguridad = (ES_APPLIANCE_USUARIO == "1" ? false : true);

    $.ajax({
        url: URL_API_VISTA,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(solicitud),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let solicitudId = dataObject;
                    //UploadConstancia($("#flArchivo"), solicitudId);
                    UploadConstanciaEquipoSoftwareBase($("#flArchivo"), solicitudId);
                    toastr.success("Registrado correctamente", TITULO_MENSAJE);                                        

                    listarSolicitudes();
                }
            }
        },
        complete: function () {
            $("#btnGuardar").button("reset");
            irAddOrEditModal(false);
        },
        error: function (result) {
            alert(result.responseText);
        }
    });
}

function validarForm() {

    $.validator.addMethod("requiredArchivo", function (value, element) {
        return $.trim(value) !== "";
    });

    $.validator.addMethod("requiredApplication", function (value, element) {
        let equipoId = $("#hdAplicacionId").val() === "0" ? "" : $("#hdAplicacionId").val();
        if (equipoId === "") {
            return $.trim(value) !== "";
        }
        return true;
    });

    $("#formEliminar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {            
            flArchivo: {
                requiredArchivo: true                
            },
            txtAplicacion: {
                requiredSinEspacios: true,
                requiredApplication: true
            },
            txtEquipo: {
                requiredSinEspacios: true
            },
            dpFecha: {
                requiredSinEspacios: true
            },
            txtComentarios: {
                requiredSinEspacios: true,
                maxlength: 500
            }
        },
        messages: {            
            flArchivo: {
                requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo")                
            },
            txtAplicacion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el código de aplicación"),
                requiredApplication: String.Format("Debes ingresar {0}.", "el código de aplicación"),
            },
            txtEquipo: {
                requiredSinEspacios: "Debes de seleccionar un equipo del catálogo de CVT"
            },
            dpFecha: {
                requiredSinEspacios: "Debes de seleccionar una fecha"
            },
            txtComentarios: {
                requiredSinEspacios: "Debes de ingresar una justificación para la solicitud",
                maxlength: "Los comentarios no deben de superar los 500 caracteres"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtArchivo" || element.attr('name') === "flArchivo"
                || element.attr('name') === "txtAplicacion"
                || element.attr('name') === "txtEquipo"
                || element.attr('name') === "dpFecha"
                || element.attr('name') === "txtComentarios") {
                element.parent().parent().append(error);
            }
            else {
                element.parent().append(error);
            }
        }
    });
}

function opcionesFormatter(value, row, index) {
    let btnVer = "";
    let btnDesestimar = "";
    let style_color = row.isCompleted == true ? 'iconoVerde ' : "iconoRojo "; 
    if (row.ApruebaSolicitud)
        btnVer = `<a href="#" onclick="javascript:irDetalle(${row.Id}, ${row.EstadoSolicitud})" title="Revisa el detalle de la solicitud"><i class="iconoVerde glyphicon glyphicon-zoom-in"></i></a>`;    

    if (row.EstadoSolicitud == 2) //Se puede desestimar
        btnDesestimar = `<a href="javascript:irRechazoSolicitante(${row.Id})" title="Desestima la solicitud de cambio de equipo"><i class="iconoRojo glyphicon glyphicon glyphicon-remove"></i></a>`;

    return btnVer.concat("&nbsp;&nbsp;", btnDesestimar);
}

function irAddOrEditModal(EstadoMd) {
    limpiarAddOrEditModal();
    if (EstadoMd)
        $("#modalEliminar").modal(opcionesModal );
    else
        $("#modalEliminar").modal('hide');
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

function initFecha() {
    $("#dpFecha-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });    
}

function UploadConstancia($fileInput, idsol) {

    let formData = new FormData();
    let ConformidadGST = $fileInput.get(0).files;

    formData.append("Constancia", ConformidadGST[0]);

    formData.append("EquipoSolicitudId", idsol);


    $.ajax({
        url: URL_API + "/File/uploadConstanciaActivoTSI",
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

function UploadConstanciaEquipoSoftwareBase($fileInput, idsol) {

    let formData = new FormData();
    let ConformidadGST = $fileInput.get(0).files;

    formData.append("Constancia", ConformidadGST[0]);

    formData.append("EquipoId", idsol);


    $.ajax({
        url: URL_API + "/File/uploadNuevoActivoTSI",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            OpenCloseModal($("#modalEliminar"), false);
            //irAddOrEditModal(false);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function irRechazoSolicitante(id) {
    $("#hdSolicitudId").val(id);
    $("#txtDescripcionRechazoSolicitante").val('');
    LimpiarValidateErrores($("#formRechazarSolicitante"));
    OpenCloseModal($("#modalRechazarSolicitante"), true);
}

function aprobarSolicitud() {
    $("#hdAccion").val(3); //Aprobado
    $("#txtDescripcionAprobador").val('');

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás seguro de aprobar la solicitud de cambio de equipo?",
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            result = result || null;
            if (result !== null && result) {
                sendDataFormAPIAprobador($("#btnProcesarAprobador"));
            }
        }
    });
}

function rechazarSolicitud() {
    $("#hdAccion").val(4); //Rechazar
    $("#txtDescripcionAprobador").val();
    OpenCloseModal($("#modalAprobarRechazar"), true);
}

function guardarRechazoAppSolicitante() { 
    if ($("#formRechazarSolicitante").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: "¿Estás seguro de desestimar la solicitud de cambio de equipo?",
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

function guardarAprobadorRechazo() {
    //PENDIENTE DE APROBACION CVT
    let estado = $("#hdAccion").val();
    let mensaje = "";

    if (estado == 4) {
        $("#txtDescripcionAprobador").val();
        mensaje = "¿Estás seguro de rechazar la solicitud de cambio de equipo?";
    }

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: mensaje,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            result = result || null;
            if (result !== null && result) {
                sendDataFormAPIAprobador($("#btnProcesarAprobador"));
            }
        }
    });
}

function sendDataFormAPISolicitante($btn) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjSolicitud();

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
                    toastr.success("Se ha desestimado la solicitud de cambio de equipo de manera correcta.", TITULO_MENSAJE);
                    $('.modal').modal('hide');
                    $('.modal-backdrop').remove();
                    listarSolicitudes();
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

function sendDataFormAPIAprobador($btn) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjSolicitudAprobacion();

    $.ajax({
        url: URL_API_VISTA + "/CambiarEstado",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let status = $("#hdAccion").val(); 
                    if (status == 3) toastr.success("Se realizó la aprobación de la solicitud de manera correcta.", TITULO_MENSAJE);
                    if (status == 4) toastr.success("Se realizó el rechazo de la solicitud de manera correcta.", TITULO_MENSAJE); 
                    $('.modal').modal('hide');
                    $('.modal-backdrop').remove();
                    waitingDialog.hide();
                    listarSolicitudes();
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

function CrearObjSolicitudAprobacion() {
    var data = {};
    data.Id = $("#hdSolicitudId").val();
    data.ComentariosAprobacionRechazo = $("#txtDescripcionAprobador").val();
    data.EstadoSolicitud = $("#hdAccion").val(); 
    return data;
}

function CrearObjSolicitud() {
    var data = {}; 
    data.Id = $("#hdSolicitudId").val();
    data.ComentariosDesestimacion = $("#txtDescripcionRechazoSolicitante").val();
    data.CodigoAPT = $("#hdAplicacionId").val() !== "0" ? $("#hdAplicacionId").val() : $("#txtAplicacion").val();
     
    return data;
}

function irDetalle(id, state) {
    limpiarAddOrEditModal();
    $("#btnDescargar").hide();
    $("#btnGuardar").hide();
    $("#btnAprobar").hide();
    $("#btnRechazar").hide();
    $("#txtComentarios").attr("disabled", "disabled");
    $("#dpFecha").attr("disabled", "disabled");
    $("#txtEquipo").attr("disabled", "disabled");
    $("#txtAplicacion").attr("disabled", "disabled");
    $("#flArchivo").attr("disabled", "disabled");
    $("#txtArchivo").attr("disabled", "disabled");
    $("#rowComentariosAprobador").hide();
    $("#rowComentariosDesestimacion").hide();
    $("#rowComentariosRechazo").hide();

    if (state == 5) {
        $("#rowComentariosDesestimacion").show();
        $("#txtComentariosDesestimacion").attr("disabled", "disabled");
    }
    else if (state == 4) {
        $("#rowComentariosRechazo").show();
        $("#txtComentariosRechazo").attr("disabled", "disabled");
    }
    else if (state == 8) {
        $("#rowComentariosRechazo").show();
        $("#txtComentariosRechazo").attr("disabled", "disabled");
    }
    else {
        if (state == 2) {
            $("#btnAprobar").show();
            $("#btnRechazar").show();
        }
        else {
            //$("#rowComentariosAprobador").show();
            $("#txtComentariosAprobacionRechazo").attr("disabled", "disabled");
        }
    }
    
    getSolicitud(id);
    OpenCloseModal($("#modalEliminar"), true);
}

function getSolicitud(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({

        url: URL_API_VISTA + `/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject; 
                    $("#hdSolicitudId").val(data.Id);                    
                    $("#txtComentarios").val(data.Comentarios);
                    $("#txtEquipo").val(data.NombreEquipo);
                    $("#txtComentariosAprobacionRechazo").val(data.ComentariosAprobacionRechazo);
                    $("#txtComentariosDesestimacion").val(data.ComentariosDesestimacion);
                    $("#txtComentariosRechazo").val(data.ComentariosAprobacionRechazo);
                    $("#dpFecha").val(data.FechaFinSoporteToString);
                    $("#txtArchivo").val(data.NombreArchivo);
                    $("#txtAplicacion").val(data.CodigoAPT);

                    if (data.TieneArchivo)
                        $("#btnDescargar").show();
                }
            }
        },
        complete: function () {
            waitingDialog.hide();
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: true
    });

}

function DescargarArchivo() {
    DownloadFileSolicitud($("#hdSolicitudId").val());
}

function DownloadFileSolicitud(id) {    
    let url = `${URL_API_FILE}/downloadConstanciaActivoTSI?id=${id}`;
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

function ValidarEquipo(id) {    
    $.ajax({
        url: URL_API_VISTA + `/ValidarEquipo/${id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;
                    if (data.Procesar == false) {
                        $("#txtEquipo").val('');
                        $("#hdEquipoId").val(0);
                        toastr.error(data.Mensaje, TITULO_MENSAJE);
                    }
                    else
                        $("#dpFecha").focus();
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

function InitAutocompletarBuilderLocal($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API + urlControllerWithParams,
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox != null) {
                $IdBox.val(ui.item.Id);
                ValidarEquipo(ui.item.Id);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Descripcion));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}

function InitAutocompletarBuilderLocalAplicacion($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API + urlControllerWithParams,
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox != null) {
                $IdBox.val(ui.item.Id);
                $searchBox.val(ui.item.Id);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Descripcion));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}
