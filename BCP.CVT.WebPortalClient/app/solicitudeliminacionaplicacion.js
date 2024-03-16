var $table = $("#tbl-solicitudes");
var $tblComentarios = $("#tblComentarios");
var URL_API_VISTA = URL_API + "/Solicitud";
var DATA_EXPORTAR = {};
var CODIGO_INTERNO = 0;

var TIPO_SOLICITUD_APP = { CREACION: 1, MODIFICACION: 2, ELIMINACION: 3 };
const TIPO_FLUJO_PORTAFOLIO = { FNA: 1, PAE: 2 };
var TIPO_COMENTARIO = { OBSERVACION: 1, COMENTARIO: 2};
var ESTADO_SOLICITUD_APP = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var ESTADO_SOLICITUD_ARR = [ESTADO_SOLICITUD_APP.REGISTRADO, ESTADO_SOLICITUD_APP.PROCESOREVISION, ESTADO_SOLICITUD_APP.APROBADO, ESTADO_SOLICITUD_APP.OBSERVADO];
const TITULO_MENSAJE = "Solicitud de eliminación";
const NOMBRE_FILE_ELIMINACION_FNA = "Adjuntar la evidencia de ticket o requerimiento de eliminación ejecutado en todos los ambientes:";
const NOMBRE_FILE_ELIMINACION_PAE = "Adjuntar formato de eliminación confirmado por Gestor:";

$(function () {        
    initUpload($('#txtNomArchivo'));
    $("#lblFile").html(NOMBRE_FILE_ELIMINACION_FNA);
    InitAutocompletarBuilder($("#txtAplicacionFiltro"), $("#hdAplicacionFiltroId"), ".containerAplicacion", "/Aplicacion/GetAplicacionAprobadaByFiltro?filtro={0}");
    InitAutocompletarCustomBuilder($("#txtAplicacion"), $("#hdAplicacionId"), ".containerFormAplicacion", "/Aplicacion/GetAplicacionAprobadaByFiltro?filtro={0}");
    $("#cbFilEstado").val("-1");
    validarForm();    
    listarRegistros();    

    setDefaultHd($("#txtAplicacionFiltro"), $("#hdAplicacionFiltroId"));
    setDefaultHdCustom($("#txtAplicacion"), $("#hdAplicacionId"));
});

function initUpload(txtNombreArchivo) {
    var inputs = document.querySelectorAll('.inputfile');
    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener('change', function (e) {
            var fileName = '';
            if (this.files && this.files.length > 1)
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            else
                fileName = e.target.value.split('\\').pop();

            if (fileName)
                txtNombreArchivo.val(fileName);
            else
                label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
}

function RefrescarListado() {
    listarRegistros();
}

function limpiarMdAddOrEditArquetipo() {
    LimpiarValidateErrores($("#formAddOrEditArq"));
    $("#txtAplicacion").val("");
    $("#txtComentarios").val("");
    $("#txtTE").val("");
    $("#txtTCR").val("");
    $("#txtNombreAplicacion").val("");
    $("#flArchivo").val('');
    $("#hdArchivoId").val('');
    $("#hdAplicacionId").val('');
    $("#txtNomArchivo").val(TEXTO_SIN_ARCHIVO);    

    $("#hIdSolicitud").val("");

    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
}

//Open modal: true
//Close modal: false
function MdAddOrEditArquetipo(EstadoMd) {
    limpiarMdAddOrEditArquetipo();
    if (EstadoMd)
        $("#MdAddOrEditArq").modal(opcionesModal);
    else
        $("#MdAddOrEditArq").modal('hide');
}

function validarForm() {   
    $.validator.addMethod("existeCodigoAPT", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        let hdCodigoApt = $.trim($("#hdAplicacionId").val());
        if (valor !== "" && valor.length > 1 && (hdCodigoApt === "" || hdCodigoApt === "0")) {
            estado = ExisteCodigoAPT_Nombre(valor);
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("existeSolicitudPrevia", function (value, element) {
        let estado = true;
        //let valor = $.trim(value);
        let codigoApt = $.trim($("#hdAplicacionId").val());
        if (codigoApt !== "" && codigoApt !== "0")
            estado = !ExisteSolicitudByCodigoAPT(codigoApt);

        return estado;
    });

    $("#formAddOrEditArq").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtAplicacion: {
                requiredSinEspacios: true,
                existeCodigoAPT: true,
                existeSolicitudPrevia: true
            },
            //hdAplicacionId: {
            //    requiredSinEspacios: true
            //},
            txtComentarios: {
                requiredSinEspacios: true
            },
            txtTE: {
                requiredSinEspacios: true
            },
            txtTCR: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtAplicacion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
                existeCodigoAPT: "El código APT ingresado no existe",
                existeSolicitudPrevia: "El código apt ya tiene una solicitud registrada"
            },
            //hdAplicacionId: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el código de la aplicación")
            //},
            txtComentarios: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "los comentarios de tu solicitud")
            },
            txtTE: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el ticket")
            },
            txtTCR: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el ticket")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtAplicacionFiltro") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
		ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.CodigoApt = $("#hdAplicacionFiltroId").val() !== "0" ? $("#hdAplicacionFiltroId").val() : $("#txtAplicacionFiltro").val();
            DATA_EXPORTAR.TipoSolicitud = TIPO_SOLICITUD_APP.ELIMINACION;
            //DATA_EXPORTAR.EstadoSolicitud = $("#cbFilEstado").val();    
            DATA_EXPORTAR.EstadoSolicitud = $("#cbFilEstado").val() === "-1" ? ESTADO_SOLICITUD_ARR : [$("#cbFilEstado").val()];
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

function opciones(value, row, index) {
    let btn1 = "";
    let btn2 = "";

    btn1 = `<a href="javascript:editarSolicitud(${row.Id}, ${row.EstadoSolicitud})" title="Ver solicitud"><span class="icon icon-list-ul"></span></a>`;

    if (row.EstadoSolicitud === ESTADO_SOLICITUD_APP.OBSERVADO || row.EstadoSolicitud === ESTADO_SOLICITUD_APP.PROCESOREVISION) {
        btn2 = `<a href="javascript:verComentarios(${row.Id})" title="Ver comentarios"><span class="icon icon-comment-o"></span></a>`;
    }

    if (row.EstadoSolicitud === ESTADO_SOLICITUD_APP.REGISTRADO) {
        btn2 = `<a href="javascript:irCambiarEstadoSolicitud(${row.Id})" title='Enviar a validación'>` +
            `<span class="icon icon-rotate-right"></span>` +
            `</a >`;
    }

    return btn1.concat("&nbsp;&nbsp;", btn2);
}

function irCambiarEstadoSolicitud(Id) {
    $("#hIdSolicitud").val(Id);
    //$("#txtEstadoActual").val(TipoStr);
    //LimpiarValidateErrores($("#formCambioEstado"));
    //$("#ddlEstadoSolicitud").val("-1");
    //$("#mdCambioEstado").modal(opcionesModal);
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás seguro de enviar la solicitud a revisión?. Ten en consideración que no será posible editar.",
        buttons: {
            confirm: {
                label: 'Aceptar',
                className: 'btn-primary'
            },
            cancel: {
                label: 'Cancelar',
                className: 'btn-secondary'
            }
        },
        callback: function (result) {
            if (result !== null && result) {
                sendDataEstadoAPI(null, "Se envió la solicitud correctamente", ESTADO_SOLICITUD_APP.PROCESOREVISION, TIPO_SOLICITUD_APP.ELIMINACION, "");
            }
        }
    });
}

function sendDataEstadoAPI($btn, Mensaje, EstadoSolicitudId, TipoSolicitudId, funStr) {
    let data = {};
    data.Id = $("#hIdSolicitud").val();
    data.EstadoSolicitudId = EstadoSolicitudId;
    data.Observacion = $("#txtObservacionesElim").val() || "";
    data.TipoSolicitudId = TipoSolicitudId;

    if ($btn !== null) $btn.button("loading");

    $.ajax({
        url: URL_API_VISTA + "/CambiarEstado",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (result) {
            if (result) {
                toastr.success(Mensaje, TITULO_MENSAJE);
            }
        },
        complete: function (data) {
            if (ControlarCompleteAjax(data)) {
                eval(funStr);
                if ($btn !== null) $btn.button("reset");
                listarRegistros();
            } else
                MensajeErrorCliente();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });
}

function verComentarios(Id) {
    $(".divComments").empty();
    listarSolicitudComentarios(Id, $("#mdComentarios"));
}

function AddSolicitud() {
    $("#titleFormArq").html("Nueva solicitud de eliminación");
    $("#hIdArq").val("");
    $("#btnRegistrarSol").show();
    $("#btnConfirmarSol").show();
    $("#btnResponderSol").hide();
    $(".solicitud-app").removeClass("bloq-element");
    $(".divObservacion").hide();
    setTicketView(null);
    MdAddOrEditArquetipo(true);
}

function guardarOEditarSolicitud() {
    sendDataSolicitudAPI($("#formAddOrEditArq"), $("#btnRegistrarSol"), ESTADO_SOLICITUD_APP.REGISTRADO, "Registrado correctamente");
}

function responderSolicitud() {
    //Mensaje de confirmacion
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás seguro que deseas confirmar esta solicitud? Ten en cuenta que despues no podrás editar la solicitud.",
        buttons: {
            confirm: {
                label: 'Aceptar',
                className: 'btn-primary'
            },
            cancel: {
                label: 'Cancelar',
                className: 'btn-secondary'
            }
        },
        callback: function (result) {
            result = result || null;
            if (result !== null && result) {
                insertarSolicitudComentario();
                sendDataSolicitudAPI($("#formAddOrEditArq"), $("#btnResponderSol"), ESTADO_SOLICITUD_APP.PROCESOREVISION, "Confirmado correctamente");
            }
        }
    });
}

function confirmarSolicitud() {
    if ($("#formAddOrEditArq").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: "¿Estás seguro que deseas registrar y enviar esta solicitud? Ten en cuenta que despues no podrás editar la solicitud.",
            buttons: {
                confirm: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                },
                cancel: {
                    label: 'Cancelar',
                    className: 'btn-secondary'
                }
            },
            callback: function (result) {
                result = result || null;
                if (result !== null && result) {
                    sendDataSolicitudAPI($("#formAddOrEditArq"), $("#btnConfirmarSol"), ESTADO_SOLICITUD_APP.PROCESOREVISION, "Registrado y enviado correctamente");
                }
            }
        });
    }
}

function insertarSolicitudComentario() {
    let data = {};
    data.Id = 0;
    data.SolicitudAplicacionId = parseInt($("#hIdSolicitud").val());
    data.Comentarios = $.trim($("#txtObservacionesElim").val()) || "";
    data.TipoComentarioId = TIPO_COMENTARIO.COMENTARIO;

    $.ajax({
        url: URL_API_VISTA + "/AddOrEditSolicitudComentarios",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (result) {
            debugger;
            console.log(result);
           
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}


function sendDataSolicitudAPI($form, $btn, EstadoSolicitudId, Mensaje) {
    if ($form.valid()) {
        $btn.button("loading");

        var solicitud = {};
        solicitud.Id = ($("#hIdSolicitud").val() === "") ? 0 : parseInt($("#hIdSolicitud").val());
        solicitud.CodigoAplicacion = $("#hdAplicacionId").val().trim();
        solicitud.Observaciones = $.trim($("#txtComentarios").val());
        solicitud.TicketEliminacion = $.trim($("#txtTE").val());
        solicitud.TicketConformidadRatificacion = $.trim($("#txtTCR").val());
        solicitud.EstadoSolicitud = EstadoSolicitudId;
        solicitud.FlagAprobacion = true;
        solicitud.TipoSolicitud = TIPO_SOLICITUD_APP.ELIMINACION;
        //solicitud.Respuesta = $.trim($("#txtObservacionesElim").val()) || "";

        $.ajax({
            url: URL_API_VISTA,
			beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            type: "POST",
            data: solicitud,
            dataType: "json",
            success: function (result) {
                var data = result;
                if (data > 0) {
                    let estadoFile = ($("#txtNomArchivo").val() !== TEXTO_SIN_ARCHIVO && $("#flArchivo").val() !== "") ? true : false;
                    if (estadoFile) {
                        UploadFileSolicitud($("#flArchivo"), data);
                    }
                    toastr.success(Mensaje, TITULO_MENSAJE);
                }
                else {
                    toastr.warning("La aplicación no existe, está en proceso de aprobación o ya ha sido eliminada.", TITULO_MENSAJE);
                }
            },
            complete: function () {
                $btn.button("reset");
                listarRegistros();
                MdAddOrEditArquetipo(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}

function UploadFileSolicitud($fileInput, EntidadId, titulo) {    
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    
    let estado = false;
    let formData = new FormData();
    let file = $fileInput.get(0).files;
    formData.append("File", file[0]);
    formData.append("SolicitudId", EntidadId);
    //formData.append("ArchivoId", ArchivoId);
    
    $.ajax({
        url: URL_API_VISTA + "/upload",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: formData,
        contentType: false,
        processData: false,
        success: function (result) {
            estado = result;
            waitingDialog.hide();
            //toastr.success("Cargado correctamente", tituloMensaje);            
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });
    return estado;
}

function setViewModal(EstadoSolicitudId) {
    switch (EstadoSolicitudId) {
        case ESTADO_SOLICITUD_APP.REGISTRADO:
            $("#titleFormArq").html("Editar Solicitud");
            $("#btnRegistrarSol").show();
            $("#btnConfirmarSol").show();
            $("#btnResponderSol").hide();
            $(".solicitud-app").removeClass("bloq-element");
            $(".divObservacion").hide();
            break;
        case ESTADO_SOLICITUD_APP.PROCESOREVISION:
        case ESTADO_SOLICITUD_APP.APROBADO:
            $("#titleFormArq").html("Ver Solicitud");
            $("#btnRegistrarSol").hide();
            $("#btnConfirmarSol").hide();
            $("#btnResponderSol").hide();
            $(".solicitud-app").addClass("bloq-element");
            $(".divObservacion").hide();
            break;
        case ESTADO_SOLICITUD_APP.OBSERVADO:
            $("#titleFormArq").html("Ver Solicitud");
            $("#btnRegistrarSol").hide();
            $("#btnConfirmarSol").hide();
            $("#btnResponderSol").show();
            $(".solicitud-app").removeClass("bloq-element");
            $(".divObservacion").show();
            break;
    }
}

function editarSolicitud(Id, EstadoSolicitudId) {
    setViewModal(EstadoSolicitudId);   

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/GetSolicitudById?Id=${Id}`,
        type: "GET",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject;

                    waitingDialog.hide();
                    MdAddOrEditArquetipo(true);
                    $("#hIdSolicitud").val(data.Id);
                    $("#txtAplicacion").val(data.NombreAplicacion);
                    $("#hdAplicacionId").val(data.CodigoAplicacion);
                    $("#txtComentarios").val(data.Observaciones);
                    $("#txtTE").val(data.TicketEliminacion);
                    $("#txtTCR").val(data.TicketConformidadRatificacion);
                    setTicketView(data.CodigoAplicacion);

                    if (data.NombreArchivos !== null && data.NombreArchivos !== "") {
                        $("#txtNomArchivo").val(data.NombreArchivos);
                        $("#btnDescargarFile").show();
                        $("#btnEliminarFile").show();
                    }

                    if (data.EstadoSolicitud === ESTADO_SOLICITUD_APP.OBSERVADO) {
                        $("#txtObservacionesElim").val("");
                    }
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function DescargarArchivo() {
    DownloadFileSolicitud($("#hIdSolicitud").val(), $("#txtNomArchivo"), TITULO_MENSAJE);
}

function DownloadFileSolicitud(id, $inputFile, titulo) {
    let archivo = $inputFile.val();

    if (archivo === TEXTO_SIN_ARCHIVO) {
        bootbox.alert({
            size: "small",
            title: titulo,
            message: "No archivo para descargar.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
        return false;
    }
    let url = `${URL_API_VISTA}/Download?id=${id}`;

    window.location.href = url;
}

function EliminarArchivo() {
    $("#txtNomArchivo").val(TEXTO_SIN_ARCHIVO);
    $("#flArchivo").val("");
    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
}

function listarSolicitudComentarios(Id, $md) {
    let data = {};
    data.SolicitudAplicacionId = Id;
    data.pageNumber = 1;
    data.pageSize = REGISTRO_PAGINACION;
    data.sortName = 'FechaCreacion';
    data.sortOrder = 'desc';

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/ListadoSolicitudComentarios",
        type: "POST",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (result) {
            waitingDialog.hide();
            if (result !== null) {
                let data = result.Rows;
                if (data !== null && data.length > 0) {
                    setDivComments(data);
                    OpenCloseModal($md, true, "");
                } else {
                    MensajeGeneralAlert(TITULO_MENSAJE, "No hay comentarios registrados hasta el momento.");
                }
            }
        },
        complete: function (data) {
            if (ControlarCompleteAjax(data)) {
                console.log(data);
                //$md.modal(opcionesModal);
                //OpenCloseModal($md, true, "");
            } else
                MensajeErrorCliente();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });
}

function setDivComments(ldata) {
    let rows = ldata;

    $.each(rows, function (i, item) {
        if (item.TipoComentarioId === TIPO_COMENTARIO.OBSERVACION) {
            let divAdmin = String.Format('<div class="container">\
                                <img src="/images/user.png" alt="Avatar">\
                                <p class="user-name text-left">{2}</p>\
                                <p>{0}</p>\
                                <span class="time-right">{1}</span>\
                        </div>', item.Comentarios, item.FechaCreacionFormato, item.BandejaAprobadorStr);

            $(".divComments").append(divAdmin);
        }
        else {
            let divUser = String.Format('<div class="container darker">\
                                <img src="/images/user.png" alt="Avatar" class="right">\
                                <p class="user-name text-right">{0}</p>\
                                <p>{1}</p>\
                                <span class="time-left">{2}</span>\
                        </div>', item.UsuarioCreacion, item.Comentarios, item.FechaCreacionFormato);

            $(".divComments").append(divUser);
        }
    });
}

function InitAutocompletarCustomBuilder($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "0") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) {
                    $IdBox.val("");
                } 
                $.ajax({
                    url: URL_API + urlControllerWithParams,
					beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    type: "GET",
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
            if ($IdBox !== null) {
                let idApp = ui.item.Id;
                $IdBox.val(idApp);
                setTicketView(idApp);
            } 
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Descripcion + "</font></a>").appendTo(ul);
    };
}

function GetTipoFlujoByAplicacionId(id) {
    let retorno = 0;
    let _id = id;

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GetTipoFlujoByAplicacion?codigoAPT=${_id}`,
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
    return retorno;
}

function setTicketView(codigoApt) {
    if (codigoApt !== null || $.trim(codigoApt) !== "") {
        let tipo_flujo = GetTipoFlujoByAplicacionId(codigoApt);
        if (tipo_flujo !== null) {
            if (tipo_flujo === TIPO_FLUJO_PORTAFOLIO.FNA) {
                $(".ticket").show();
                $(".ticket").removeClass("ignore");
                $("#lblFile").html(NOMBRE_FILE_ELIMINACION_FNA);
            } else {
                $(".ticket").addClass("ignore");
                $(".ticket").hide();
                $("#lblFile").html(NOMBRE_FILE_ELIMINACION_PAE);
            }
        } else {
            $(".ticket").addClass("ignore");
            $(".ticket").hide();
            $("#lblFile").html(NOMBRE_FILE_ELIMINACION_FNA);
        }
    } else {
        $(".ticket").addClass("ignore");
        $(".ticket").hide();
        $("#lblFile").html(NOMBRE_FILE_ELIMINACION_FNA);
    }
}

function ExisteSolicitudByCodigoAPT(filtro) {
    let estado = false;
    let id = ($("#hIdSolicitud").val() === "") ? 0 : parseInt($("#hIdSolicitud").val());
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteSolicitudByCodigoAPT?filtro=${filtro}&id=${id}`,
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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

function setDefaultHdCustom($textBox, $hdId) {
    $textBox.keyup(function () {
        if ($.trim($(this).val()) === "") {
            $hdId.val("0");
            setTicketView(null);
        }
    });
}

function ExisteCodigoAPT_Nombre(filtro) {
    let estado = false;
    let Id = $("#hdAplicacionId").val() === "" ? 0 : $("#hdAplicacionId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Aplicacion/GestionAplicacion/ExisteCodigoAPT_Nombre?filtro=${filtro}&Id=${Id}`,
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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