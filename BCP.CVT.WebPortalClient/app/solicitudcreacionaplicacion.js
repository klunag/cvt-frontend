var $table = $("#tbl-solicitudes");
var URL_API_VISTA = URL_API + "/Solicitud";
var DATA_EXPORTAR = {};

var TIPO_SOLICITUD_APP = { CREACION: 1, MODIFICACION: 2, ELIMINACION: 3 };
var TIPO_COMENTARIO = { OBSERVACION: 1, COMENTARIO: 2 };
var ESTADO_SOLICITUD_APP = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var ESTADO_SOLICITUD_ARR = [ESTADO_SOLICITUD_APP.REGISTRADO, ESTADO_SOLICITUD_APP.PROCESOREVISION, ESTADO_SOLICITUD_APP.APROBADO, ESTADO_SOLICITUD_APP.OBSERVADO];
const TITULO_MENSAJE = "Solicitud de creación de aplicaciones";

$(function () {
    //initUpload($('#txtNomArchivo'));
    InitAutocompletarBuilder($("#txtAplicacionFiltro"), $("#hdAplicacionFiltroId"), ".containerAplicacion", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    //InitAutocompletarBuilder($("#txtAplicacion"), $("#hdAplicacionId"), ".containerFormAplicacion", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    $("#cbFilEstado").val("-1");
    validarFormCambioEstado();
    validarFormOS();
    listarRegistros();
});

function RefrescarListado() {
    listarRegistros();
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.CodigoApt = $("#hdAplicacionFiltroId").val() !== "0" ? $("#hdAplicacionFiltroId").val() : $("#txtAplicacionFiltro").val();
            DATA_EXPORTAR.TipoSolicitud = TIPO_SOLICITUD_APP.CREACION;
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

    //btn1 = `<a href="javascript:editarSolicitud(${row.Id}, ${row.EstadoSolicitud})" title="Ver solicitud"><span class="icon icon-list-ul"></span></a>`;

    if (row.EstadoSolicitud === ESTADO_SOLICITUD_APP.OBSERVADO || row.EstadoSolicitud === ESTADO_SOLICITUD_APP.PROCESOREVISION || row.EstadoSolicitud === ESTADO_SOLICITUD_APP.APROBADO) {
        btn2 = `<a href="javascript:verComentarios(${row.Id})" title="Ver comentarios"><span class="icon icon-comment-o"></span></a>`;
    }

    if (row.EstadoSolicitud === ESTADO_SOLICITUD_APP.OBSERVADO) {
        btn1 = `<a href="NuevaAplicacion?Id=${row.AplicacionId}&Vista=1" title="Ver detalle aplicación"><i class="glyphicon glyphicon-share table-icon"></i></a>`;
    }

    if (row.EstadoSolicitud === ESTADO_SOLICITUD_APP.PROCESOREVISION) {
        btn1 = `<a href="NuevaAplicacion?Id=${row.AplicacionId}&Vista=1" title="Ver detalle aplicación"><i class="glyphicon glyphicon-share table-icon"></i></a>`;
    }

    if (row.EstadoSolicitud === ESTADO_SOLICITUD_APP.REGISTRADO) {
        //btn1 = `<a href="javascript:irCambiarEstadoSolicitud(${row.Id})" title='Enviar a validación'>` +
        //    `<span class="icon icon-rotate-right"></span>` +
        //    `</a >`;

        //btn1 = "";

        btn2 = `<a href="NuevaAplicacion?Id=${row.AplicacionId}&Vista=1" title="Ver detalle aplicación"><i class="glyphicon glyphicon-share table-icon"></i></a>`;
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
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                sendDataEstadoAPI(null, "Se envió la solicitud correctamente", ESTADO_SOLICITUD_APP.PROCESOREVISION, TIPO_SOLICITUD_APP.CREACION, "");
            }
        }
    });
}

function guardarCambioEstado() {
    if ($("#formCambioEstado").valid()) {
        var nuevoEstado = parseInt($("#ddlEstadoSolicitud").val());
        switch (nuevoEstado) {
            case ESTADO_SOLICITUD_APP.REGISTRADO:
            case ESTADO_SOLICITUD_APP.PROCESOREVISION:
                bootbox.confirm({
                    title: TITULO_MENSAJE,
                    message: "¿Estás seguro de confirmar la solicitud?. Ten en consideración que no será posible editar.",
                    buttons: SET_BUTTONS_BOOTBOX,
                    callback: function (result) {
                        if (result !== null && result) {
                            sendDataEstadoAPI($("#btnCambioEstado"), "Se confirmó la solicitud correctamente", ESTADO_SOLICITUD_APP.PROCESOREVISION, TIPO_SOLICITUD_APP.CREACION, `OpenCloseModal($("#mdCambioEstado"), false);`);
                        }
                    }
                });
                break;
            case ESTADO_SOLICITUD_APP.APROBADO:
            case ESTADO_SOLICITUD_APP.OBSERVADO:
                break;
        }
    }
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
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

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

function validarFormCambioEstado() {

    $("#formCambioEstado").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        onfocusout: false,
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlEstadoSolicitud: {
                requiredSelect: true,
                //existeEstado: true
            }
        },
        messages: {
            ddlEstadoSolicitud: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el estado"),
                //existeEstado: "Estado ya se encuentra registrado."
            }
        }
    });
}

function verComentarios(Id) {
    $(".divComments").empty();
    listarSolicitudComentarios(Id, $("#mdComentarios"));
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
                    OpenCloseModal($md, true);
                } else {
                    MensajeGeneralAlert(TITULO_MENSAJE, "No hay comentarios registrados hasta el momento.");
                }
            }
        },
        complete: function (data) {
            if (ControlarCompleteAjax(data)) {
                console.log(data);
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
    //let rows = ldata.Rows;
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

function irResponderCreacion(Id) {
    $("#hIdSolicitud").val(Id);
    $("#txtObservacionesElim").val("");
    OpenCloseModal($("#mdOS"), true);
}

function observarSolicitud() {
    if ($("#formOS").valid()) {
        insertarSolicitudComentario();
        sendDataEstadoAPI($("#btnOS"), "Se respondió la solicitud correctamente", ESTADO_SOLICITUD_APP.PROCESOREVISION, TIPO_SOLICITUD_APP.CREACION, `OpenCloseModal($("#mdOS"), false);`);
    }
}

function validarFormOS() {
    $("#formOS").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtObservacionesElim: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtObservacionesElim: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "los comentarios")
            }
        }
    });
}

function insertarSolicitudComentario() {
    //$("#btnOS").button("loading");

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
            //$("#btnOS").button("reset");
            console.log(result);
            //OpenCloseModal($("#mdOS"), false);

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function GetEstadoAprobador(_lAprobadores, _bandejaId) {
    let retorno = "NO APLICA";
    let dataAprobador = _lAprobadores.find(x => x.BandejaId === _bandejaId) || null;
    if (dataAprobador !== null) {
        switch (dataAprobador.EstadoAprobacionBandeja) {
            case ESTADO_SOLICITUD_APP.PROCESOREVISION:
                retorno = `<button title='Pendiente de aprobación' onclick="showResponsables('${dataAprobador.MatriculaAprobadores}')" type="button" class='btn btn-primary glyphicon glyphicon-warning-sign'></button>`; //Pendiente
                break;
            case ESTADO_SOLICITUD_APP.APROBADO:
                retorno = `<button title='Aprobado' onclick="showResponsables('${dataAprobador.MatriculaAprobadores}')" type="button" class='btn btn-primary glyphicon glyphicon-check'></button>`; //Aprobado
                break;
            case ESTADO_SOLICITUD_APP.OBSERVADO:
                retorno = `<button title='Observado' onclick="showResponsables('${dataAprobador.MatriculaAprobadores}')" type="button" class='btn btn-primary glyphicon glyphicon-unchecked'></button>`; //Observado
                break;
        }
    }
    return retorno;
}

function showResponsables(_lResponsables) {
    let dataResponsables = CargarDetalleResponsables(_lResponsables); 
    let detalle = `<strong>Aprobador(es):</strong> <br/> ${dataResponsables}`;
    MensajeGeneralAlert(TITULO_MENSAJE, detalle);
}

function CargarDetalleResponsables(lresponsables) {
    let retorno = lresponsables;
    if ($.trim(lresponsables) !== "") {
        $.ajax({
            url: URL_LOGIN_SERVER + `/ObtenerDetalleResponsables?MatriculaResponsables=${lresponsables}`,
            type: "GET",
            dataType: "json",
            success: (result) => {
                retorno = result;
            },
            error: (xhr, ajaxOptions, thrownError) => {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            async: false
        });
    }
    return retorno;
}

function bdjArquitecturaTiFormatter(value, row, index) {
    let retorno = "NO APLICA";

    if (row.TipoSolicitud === TIPO_SOLICITUD_APP.CREACION) {
        let lAprobadores = row.AprobadorDetalle || [];
        if (lAprobadores !== null && lAprobadores.length > 0) {
            retorno = GetEstadoAprobador(lAprobadores, BANDEJA_APROBACION.ArquitecturaTI);
        }
        else {
            retorno = row.ArquitectoTI;
        }
    }

    return retorno;
}

function bdjClasificacionTecnicaFormatter(value, row, index) {
    let retorno = "POR ASIGNAR";

    if (row.TipoSolicitud === TIPO_SOLICITUD_APP.CREACION) {
        let lAprobadores = row.AprobadorDetalle || [];
        if (lAprobadores !== null && lAprobadores.length > 0) {
            retorno = GetEstadoAprobador(lAprobadores, BANDEJA_APROBACION.ClasificacionTecnica);
        }
    }

    return retorno;
}

function bdjDevSecOpsFormatter(value, row, index) {
    let retorno = "POR ASIGNAR";

    if (row.TipoSolicitud === TIPO_SOLICITUD_APP.CREACION) {
        let lAprobadores = row.AprobadorDetalle || [];
        if (lAprobadores !== null && lAprobadores.length > 0) {
            retorno = GetEstadoAprobador(lAprobadores, BANDEJA_APROBACION.DevSecOps);
        }
    }

    return retorno;
}

function bdjPOFormatter(value, row, index) {
    let retorno = "NO APLICA";

    if (row.TipoSolicitud === TIPO_SOLICITUD_APP.CREACION) {
        let lAprobadores = row.AprobadorDetalle || [];
        if (lAprobadores !== null && lAprobadores.length > 0) {
            retorno = GetEstadoAprobador(lAprobadores, BANDEJA_APROBACION.PO);
        }
        else {
            retorno = row.LiderUsuario_PO;
        }
    }

    return retorno;
}

function bdjTTLFormatter(value, row, index) {
    let retorno = "NO APLICA";

    if (row.TipoSolicitud === TIPO_SOLICITUD_APP.CREACION) {
        let lAprobadores = row.AprobadorDetalle || [];
        if (lAprobadores !== null && lAprobadores.length > 0) {
            retorno = GetEstadoAprobador(lAprobadores, BANDEJA_APROBACION.TTL);
        }
        else {
            retorno = row.TTL;
        }
    }

    return retorno;
}

function bdjGestorUserITFormatter(value, row, index) {
    let retorno = "NO APLICA";

    if (row.TipoSolicitud === TIPO_SOLICITUD_APP.CREACION) {
        let lAprobadores = row.AprobadorDetalle || [];
        if (lAprobadores !== null && lAprobadores.length > 0) {
            retorno = GetEstadoAprobador(lAprobadores, BANDEJA_APROBACION.GestorUserIT);
        }
        else {
            retorno = row.UsuarioAutorizador_PO;
        }
    }

    return retorno;
}