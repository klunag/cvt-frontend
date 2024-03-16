var $table = $("#tbl-solicitudes");
var $tblComentarios = $("#tblComentarios");
var $tblDetalleAtributosApp = $("#tblDetalleAtributosApp");
var $tblDetalleModuloApp = $("#tblDetalleModuloApp");
var URL_API_VISTA = URL_API + "/Solicitud";
var DATA_EXPORTAR = {};
var DATA_ESTADO = [];
var COMBO_ARQUITECTO = [];
var TITULO_MENSAJE = "Bandeja de aprobación de solicitudes";

var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;

var locale = { OK: 'OK', CONFIRM: 'Observar', CANCEL: 'Cancelar' };
var TIPO_COMENTARIO = { OBSERVACION: 1, COMENTARIO: 2 };
var TIPO_SOLICITUD_APP = { CREACION: 1, MODIFICACION: 2, ELIMINACION: 3 };
var ESTADO_SOLICITUD_APP = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var ESTADO_APOYO_APROBADOR = [ESTADO_SOLICITUD_APP.PROCESOREVISION, ESTADO_SOLICITUD_APP.APROBADO, ESTADO_SOLICITUD_APP.OBSERVADO];
const CAMBIO_ESTADO_SOLICITUD = { EnRevision: 2, Aprobar: 3, Observar: 4 };
const COLUMNAS_BANDEJAS = [
    "ClasificacionTecnica",
    "SubclasificacionTecnica",
    "AreaBian",
    "DominioBian",
    "JefaturaATI",
    "PlataformaBCP",
    "ArquitectoTI",
    "ModeloEntrega",
    "LiderUsuario_PO",
    "UsuarioAutorizador_PO",
    "Experto_Especialista",
    "JefeEquipo_PO",
    "TTL",
    "GestionadoPor",
    "GerenciaCentral",
    "Division",
    "Area",
    "Unidad"
];
const DATA_BANDEJA = [
    {
        BandejaId: BANDEJA_APROBACION.ArquitecturaTI,
        TitleColumn: "Arquitectura TI",
        IdFields: "AreaBian|DominioBian|JefaturaATI|PlataformaBCP|ArquitectoTI"
    },
    {
        BandejaId: BANDEJA_APROBACION.ClasificacionTecnica,
        TitleColumn: "Clasificación Técnica",
        IdFields: "ClasificacionTecnica|SubclasificacionTecnica"
    },
    {
        BandejaId: BANDEJA_APROBACION.DevSecOps,
        TitleColumn: "DevSecOps",
        IdFields: "ModeloEntrega"
    },
    {
        BandejaId: BANDEJA_APROBACION.PO,
        TitleColumn: "Usuario Autorizador/PO",
        IdFields: "LiderUsuario_PO|UsuarioAutorizador_PO|Experto_Especialista|JefeEquipo_PO|TTL|GestionadoPor|GerenciaCentral|Division|Area|Unidad"
    },
    {
        BandejaId: BANDEJA_APROBACION.TTL,
        TitleColumn: "TTL",
        IdFields: "LiderUsuario_PO|UsuarioAutorizador_PO|Experto_Especialista|JefeEquipo_PO|TTL|GestionadoPor|GerenciaCentral|Division|Area|Unidad"
    },
    {
        BandejaId: BANDEJA_APROBACION.GestorUserIT,
        TitleColumn: "Gestor User IT",
        IdFields: "LiderUsuario_PO|UsuarioAutorizador_PO|Experto_Especialista|JefeEquipo_PO|TTL|GestionadoPor|GerenciaCentral|Division|Area|Unidad"
    }
];

$(function () {
    initFecha();
    cargarCombos();
    listarRegistros();
    validarFormRegistro();
    $("#btnBuscar").click(RefrescarListado);
    $("#btnRegistrar").click(GuardarRegistro);
    $("#btnExportar").click(ExportarRegistros);
    $("#ddlAreaBian").change(DdlAreaBian_Change);
    $("#ddlDominioBian").change(DdlDominioBian_Change);
    $("#ddlJefaturaAti").change(DdlJefaturaAti_Change);
});

function RefrescarListado() {
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

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/ListadoAprobadores",
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

            DATA_EXPORTAR = {};
            DATA_EXPORTAR.CodigoApt = $("#hdAplicacionFiltroId").val() !== "0" ? $("#hdAplicacionFiltroId").val() : $("#txtAplicacionFiltro").val();
            DATA_EXPORTAR.TipoSolicitud = "-1";//$("#ddlTipoFiltro").val();
            //DATA_EXPORTAR.EstadoSolicitud = $("#ddlEstadoFiltro").val();
            DATA_EXPORTAR.EstadoSolicitud = $("#ddlEstadoFiltro").val() === "-1" ? ESTADO_APOYO_APROBADOR : [$("#ddlEstadoFiltro").val()];
            DATA_EXPORTAR.FechaDesde = $.trim($("#txtFilFechaDesde").val()) !== "" ? castDate($("#txtFilFechaDesde").val()) : null;
            DATA_EXPORTAR.FechaHasta = $.trim($("#txtFilFechaHasta").val()) !== "" ? castDate($("#txtFilFechaHasta").val()) : null;
            DATA_EXPORTAR.pageNumber = ULTIMO_PAGE_NUMBER;
            DATA_EXPORTAR.pageSize = ULTIMO_REGISTRO_PAGINACION;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.BandejaId = id_bandeja;
            DATA_EXPORTAR.ModeloEntrega = id_bandeja === BANDEJA_APROBACION.DevSecOps ? "DEVSECOPS|HIBRIDO" : "";

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
        },
        onLoadSuccess: function (data) {
            var itemBandeja = DATA_BANDEJA.find(x => x.BandejaId === id_bandeja) || null;
            if (itemBandeja !== null) {
                var hiddenColumns = COLUMNAS_BANDEJAS.filter(x => !itemBandeja.IdFields.includes(x)) || [];
                if (itemBandeja.BandejaId === BANDEJA_APROBACION.ArquitecturaTI) hiddenColumns.push("Area");
                if (hiddenColumns && hiddenColumns.length > 0) {
                    for (let i = 0; i < hiddenColumns.length; i++)
                        $table.bootstrapTable('hideColumn', hiddenColumns[i]);
                }
            }
        }
    });
}

function opciones(value, row, index) {
    let FlagAprobadorBandeja = row.FlagAprobadorBandeja || false;

    var btn1 = "";
    var btn2 = "";
    var btn3 = "";
    var btn4 = "";
    var btn5 = "";

    switch (row.TipoSolicitud) {
        case TIPO_SOLICITUD_APP.CREACION:
            btn1 = `<a href="NuevaAplicacion?Id=${row.AplicacionId}&Vista=4&id_bandeja=${id_bandeja}" title="Ver solicitud de creación"><i class="glyphicon glyphicon-share table-icon"></i></a>`;

            if (row.EstadoAprobacionBandeja === ESTADO_SOLICITUD_APP.APROBADO || row.EstadoAprobacionBandeja === ESTADO_SOLICITUD_APP.OBSERVADO) {
                btn1 = "";
                btn2 = `<a href="javascript:verComentarios(${row.Id})" title="Ver comentarios"><span class="icon icon-comment-o"></span></a>`;
            }

            if (row.EstadoAprobacionBandeja === ESTADO_SOLICITUD_APP.PROCESOREVISION) {
                btn2 = `<a href="javascript:verComentarios(${row.Id})" title="Ver comentarios"><span class="icon icon-comment-o"></span></a>`;

                btn3 = `<a href="javascript:irCambiarEstadoSolicitud(${row.Id}, ${CAMBIO_ESTADO_SOLICITUD.Aprobar})" title='Aprobar solicitud'>
                            <span class="icon icon-thumbs-up"></span>
                        </a >`;
                btn4 = `<a href="javascript:irCambiarEstadoSolicitud(${row.Id}, ${CAMBIO_ESTADO_SOLICITUD.Observar})" title='Observar solicitud'>
                            <span class="icon icon-thumbs-down"></span>
                        </a >`;
                btn5 = `<a href="javascript:irVerDetalleCampos(${row.AplicacionId}, ${row.Id})" title='Ver detalle resumido'>
                            <span class="icon icon-search"></span>
                        </a >`;

                if (FlagAprobadorBandeja) {
                    btn1 = "";
                    btn3 = "";
                    btn4 = "";
                    btn5 = "";
                }
            }

            break;
        case TIPO_SOLICITUD_APP.MODIFICACION:
            btn1 = `<a href="javascript:verSolicitud(${row.Id}, ${row.EstadoSolicitud})" title="Ver solicitud de modificación"><span class="icon icon-list-ul"></span></a>`;

            if (row.EstadoSolicitud === ESTADO_SOLICITUD_APP.APROBADO || row.EstadoSolicitud === ESTADO_SOLICITUD_APP.OBSERVADO) {
                btn1 = "";
                btn2 = `<a href="javascript:verComentarios(${row.Id})" title="Ver comentarios"><span class="icon icon-comment-o"></span></a>`;
            }

            if (row.EstadoSolicitud === ESTADO_SOLICITUD_APP.PROCESOREVISION) {
                btn2 = `<a href="javascript:verComentarios(${row.Id})" title="Ver comentarios"><span class="icon icon-comment-o"></span></a>`;
            }

            break;
        case TIPO_SOLICITUD_APP.ELIMINACION:
            btn1 = `<a href="javascript:verSolicitud(${row.Id}, ${row.EstadoSolicitud})" title="Ver solicitud de eliminación"><span class="icon icon-list-ul"></span></a>`;

            if (row.EstadoSolicitud === ESTADO_SOLICITUD_APP.APROBADO || row.EstadoSolicitud === ESTADO_SOLICITUD_APP.OBSERVADO) {
                btn1 = "";
                btn2 = `<a href="javascript:verComentarios(${row.Id})" title="Ver comentarios"><span class="icon icon-comment-o"></span></a>`;
            }

            if (row.EstadoSolicitud === ESTADO_SOLICITUD_APP.PROCESOREVISION) {
                btn2 = `<a href="javascript:verComentarios(${row.Id})" title="Ver comentarios"><span class="icon icon-comment-o"></span></a>`;
            }

            break;
    }

    if (id_bandeja === BANDEJA_APROBACION.PO || id_bandeja === BANDEJA_APROBACION.TTL || id_bandeja === BANDEJA_APROBACION.GestorUserIT) btn5 = "";

    return btn1.concat("&nbsp;&nbsp;", btn2).concat("&nbsp;", btn3).concat("&nbsp;&nbsp;", btn4).concat("&nbsp;&nbsp;", btn5);
}

function irCambiarEstadoSolicitud(Id, idCambio) {
    if (!ExisteAprobacionObservacionSolicitud(Id)) {
        let titulo = idCambio === CAMBIO_ESTADO_SOLICITUD.Aprobar ? "aprobar" : "observar";
        if (idCambio === CAMBIO_ESTADO_SOLICITUD.Aprobar) {
            bootbox.confirm({
                title: TITULO_MENSAJE,
                message: `¿Estás seguro(a) que deseas ${titulo} la solicitud?.`,
                buttons: SET_BUTTONS_BOOTBOX,
                callback: function (result) {
                    if (result !== null && result) {
                        CambiarEstadoSolicitudSub(Id, idCambio, TIPO_SOLICITUD_APP.CREACION, "CambiarEstadoSolicitudAprobador");
                    }
                }
            });
        } else {
            bootbox.addLocale('custom', locale);
            bootbox.prompt({
                title: TITULO_MENSAJE,
                message: `<p>¿Estas seguro(a) que deseas ${titulo} la solicitud?, de ser asi por favor ingrese los comentarios al respecto:</p>`,
                inputType: 'textarea',
                rows: '5',
                locale: 'custom',
                callback: function (result) {
                    let data = result;
                    if (data !== null) {
                        if ($.trim(data) === "") {
                            toastr.error("Observación no debe estar vacío.", TITULO_MENSAJE);
                            return false;
                        }

                        if ($.trim(data).length > 500) {
                            toastr.error("Observación no debe superar los 500 carácteres.", TITULO_MENSAJE);
                            return false;
                        }

                        CambiarEstadoSolicitudSub(Id, idCambio, TIPO_SOLICITUD_APP.CREACION, "CambiarEstadoSolicitudAprobador", data);
                        CambiarEstadoSolicitudSub(Id, idCambio, TIPO_SOLICITUD_APP.CREACION, "CambiarEstado", data, false);
                    }
                }
            });
        }
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, "La solicitud ya fue Aprobada/Observada por otro responsable, actualice la bandeja");
    }
}

function CambiarEstadoSolicitudSub(_id, _idCambio, _tipoSolicitud, _url, _comments = "", withAction = true) {
    if (withAction) waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    let mensaje = _idCambio === CAMBIO_ESTADO_SOLICITUD.Aprobar ? "aprobó" : "observó";
    let data = {
        Id: _id,
        EstadoSolicitudId: _idCambio,
        Observacion: _comments,
        TipoSolicitudId: _tipoSolicitud,
        BandejaId: id_bandeja,
    };
    
    $.ajax({
        url: URL_API_VISTA + `/${_url}`,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    if (withAction) {
                        waitingDialog.hide();
                        toastr.success(`Se ${mensaje} correctamente`, TITULO_MENSAJE);
                        listarRegistros();
                    }
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function ExisteAprobacionObservacionSolicitud(IdSolicitud) {
    let estado = true;
    let bandeja_id = id_bandeja;
    let solicitud_id = IdSolicitud;

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Solicitud/ExisteCambioEstadoSolicitudAprobadores?id_solicitud=${solicitud_id}&id_bandeja=${bandeja_id}`,
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

function irVerDetalleCampos(_id, _idSolicitud) {
    if (!ExisteAprobacionObservacionSolicitud(_idSolicitud)) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $.ajax({
            url: URL_API + `/Solicitud/GetAplicacionBandejaById?Id=${_id}`,
            type: "GET",
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        waitingDialog.hide();
                        let data = dataObject;
                        setBuilderModal(`bdj${id_bandeja}`);
                        OpenCloseModal($("#mdRegistro"), true);

                        $("#txtCodigoAPT").val(data.CodigoAPT);
                        $("#txtDesApp").val(data.Descripcion);

                        $("#hdRegistroId").val(data.Id);
                        $("#hdSolicitudId").val(data.SolicitudId);
                        //bdj3
                        $("#ddlME").val(data.ModeloEntrega);
                        //bdj2
                        $("#ddlCT").val(data.ClasificacionTecnica || "-1");
                        $("#txtST").val(data.SubclasificacionTecnica);
                        //bdj1
                        $("#ddlAreaBian").val(data.AreaBian || "-1");
                        $("#ddlAreaBian").trigger("change");

                        $("#ddlDominioBian").val(data.DominioBian || "-1");
                        $("#ddlDominioBian").trigger("change");

                        $("#ddlJefaturaAti").val(data.JefaturaAti || "-1");
                        $("#ddlJefaturaAti").trigger("change");

                        //$("#ddlArquitectoTi").val(data.ArquitectoTi || "-1");
                        debugger;
                        $("#ddlArquitectoTi").val(setComboArquitectoTi(data.ArquitectoTi));
                        $("#ddlPlataforma").val(data.Plataforma || "-1");
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, "La solicitud ya fue Aprobada/Observada por otro responsable, actualice la bandeja");
    }
}

function setComboArquitectoTi(matricula) {
    let retorno = "-1";
    if (matricula && $.trim(matricula) !== "") {
        var item = COMBO_ARQUITECTO.find(x => x.includes(matricula)) || null;
        if (item !== null) retorno = item;
    }

    return retorno;
}

function verSolicitud(Id, EstadoSolicitudId) {
    $(".divObservacion").hide();

    switch (EstadoSolicitudId) {
        case ESTADO_SOLICITUD_APP.REGISTRADO:
            $(".solicitud-app").removeClass("bloq-element");
            break;
        case ESTADO_SOLICITUD_APP.PROCESOREVISION:
            $(".solicitud-app").addClass("bloq-element");
            break;
        case ESTADO_SOLICITUD_APP.APROBADO:
            break;
        case ESTADO_SOLICITUD_APP.OBSERVADO:
            break;
    }

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/GetSolicitudById?Id=${Id}`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject;

                    waitingDialog.hide();
                    $("#titleModal").html("Ver Solicitud");
                    OpenCloseModal($("#mdAddOrEditSolicitud"), true, "limpiarModalEliminacion()");
                    $("#hIdSolicitud").val(data.Id);
                    $("#txtAplicacion").val(data.NombreAplicacion);
                    $("#hdAplicacionId").val(data.AplicacionId);
                    $("#txtComentarios").val(data.Observaciones);

                    if (data.NombreArchivos !== null && data.NombreArchivos !== "") {
                        $("#txtNomArchivo").val(data.NombreArchivos);
                        $("#btnDescargarFile").show();
                        $("#btnEliminarFile").show();
                    }

                    $("#hdTipoSolicitudId").val(data.TipoSolicitud);
                    if (data.TipoSolicitud === TIPO_SOLICITUD_APP.MODIFICACION) {
                        $(".divDetalleAtributo").show();

                        //atributos aplicacion
                        let dataAtributos = data.AtributoDetalle;
                        if (dataAtributos !== null && dataAtributos.length > 0) {
                            $tblDetalleAtributosApp.bootstrapTable("destroy");
                            $tblDetalleAtributosApp.bootstrapTable({
                                data: dataAtributos,
                                pagination: true,
                                pageNumber: 1,
                                pageSize: 10
                            });
                        }

                        //atributos modulo
                        let dataModulos = data.ModuloDetalle;
                        if (dataModulos !== null && dataModulos.length > 0) {
                            $tblDetalleModuloApp.bootstrapTable("destroy");
                            $tblDetalleModuloApp.bootstrapTable({
                                data: dataModulos,
                                pagination: true,
                                pageNumber: 1,
                                pageSize: 10
                            });
                        }

                    } else {
                        $(".divDetalleAtributo").hide();
                    }
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function OpenCloseModal($md, EstadoMd, FunctionStr) {
    eval(FunctionStr);
    if (EstadoMd)
        $md.modal(opcionesModal);
    else
        $md.modal("hide");
}

function limpiarModalEliminacion() {
    LimpiarValidateErrores($("#formEliminacionSol"));
    $("#txtAplicacion").val('');
    $("#txtComentarios").val('');
    $("#txtNombreAplicacion").val('');
    $("#flArchivo").val('');
    $("#hdArchivoId").val('');
    $("#hdAplicacionId").val('');
    $("#txtNomArchivo").val(TEXTO_SIN_ARCHIVO);

    $("#hIdSolicitud").val("");

    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
}

function irAprobarEliminacion() {
    $(".divObservacion").hide();
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: String.Format("¿Estás seguro que deseas {0} esta solicitud?", "aprobar"),
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
                aprobarSolicitud();
            }
        }
    });
}

function sendDataEstadoAPI($btn, Mensaje, EstadoSolicitudId, TipoSolicitudId) {
    let data = {};
    data.Id = $("#hIdSolicitud").val();
    data.EstadoSolicitudId = EstadoSolicitudId;
    data.Observacion = $("#txtObservacionesElim").val() || "";
    data.TipoSolicitudId = TipoSolicitudId;

    $btn.button("loading");

    $.ajax({
        url: URL_API_VISTA + "/CambiarEstado",
        type: "POST",
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
                OpenCloseModal($("#mdAddOrEditSolicitud"), false, "");
                $btn.button("reset");
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

function aprobarSolicitud() {
    sendDataEstadoAPI($("#btnAprobarElim"), "Se aprobó la solicitud correctamente", ESTADO_SOLICITUD_APP.APROBADO, $("#hdTipoSolicitudId").val());
}

function observarSolicitud() {
    sendDataEstadoAPI($("#btnEnviarObservacion"), "Se observó la solicitud correctamente", ESTADO_SOLICITUD_APP.OBSERVADO, $("#hdTipoSolicitudId").val());
}

function irObservarEliminacion() {
    $(".divObservacion").show();
    $("#txtObservacionesElim").focus();
}

function confirmarObservacionEliminacion() {
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: String.Format("¿Estás seguro que deseas {0} esta solicitud?", "observar"),
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
                observarSolicitud();
            }
        }
    });
}

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItems(dataObject.Tipo, $("#ddlTipoFiltro"), TEXTO_SELECCIONE);
                    DATA_ESTADO = dataObject.Estado;
                    SetItems(DATA_ESTADO.filter(x => ESTADO_APOYO_APROBADOR.includes(x.Id)), $("#ddlEstadoFiltro"), TEXTO_TODOS);
                    SetItems(dataObject.ModeloEntrega, $("#ddlME"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ClasificacionTecnica, $("#ddlCT"), TEXTO_SELECCIONE);

                    //SetItems(dataObject.Plataforma, $("#ddlPlataforma"), TEXTO_SELECCIONE);
                    SetItems(dataObject.AreaBian, $("#ddlAreaBian"), TEXTO_SELECCIONE);
                    SetItems(dataObject.JefaturaAti, $("#ddlJefaturaAti"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function LimpiarModal() {
    LimpiarValidateErrores($("#formAddOrEditRegistro"));
    $(":input", "#formAddOrEditRegistro").val("");
}

function setBuilderModal(classField) {
    LimpiarModal();
    $(".all").addClass("ignore");
    $(".all").hide();
    $(`.${classField}`).show();
    $(`.${classField}`).removeClass("ignore");
}

function GuardarRegistro() {
    if ($("#formAddOrEditRegistro").valid()) {
        $("#btnRegistrar").button("loading");

        let arquitecto = $("#ddlArquitectoTi").val();
        let _matricula = arquitecto && arquitecto !== "-1" ? $.trim(arquitecto.split("-")[0]) : "";

        let data = {
            Id: ($("#hdRegistroId").val() === "") ? 0 : parseInt($("#hdRegistroId").val()),
            BandejaId: id_bandeja,
            ClasificacionTecnica: $("#ddlCT").val(),
            SubclasificacionTecnica: $.trim($("#txtST").val()) || "",
            ModeloEntrega: $("#ddlME").val(),

            AreaBian: $("#ddlAreaBian").val(),
            DominioBian: $("#ddlDominioBian").val(),
            JefaturaAti: $("#ddlJefaturaAti").val(),
            ArquitectoTi: _matricula,
            Plataforma: $("#ddlPlataforma").val(),
            SolicitudId: $("#hdSolicitudId").val(),
        };

        $.ajax({
            url: URL_API + "/Solicitud/UpdateAplicacionByBandejaAprobador",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (result) {
                console.log(result);
                toastr.success("Guardado correctamente", TITULO_MENSAJE);
                listarRegistros();
            },
            complete: function () {
                $("#btnRegistrar").button("reset");
                OpenCloseModal($("#mdRegistro"), false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function DdlAreaBian_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        InitSelectBuilder(ddlVal, $("#ddlDominioBian"), "/Aplicacion/ConfiguracionPortafolio/GetDominioBianByFiltro");
        InitSelectBuilder(ddlVal, $("#ddlPlataforma"), "/Aplicacion/ConfiguracionPortafolio/GetPlataformaBcpByFiltro");
    }
}

function DdlDominioBian_Change() {
    //let ddlVal = $(this).val();
    //let ddlfiltro1 = $("#ddlAreaBian").val() || "-1";
    //InitSelectBuilder(ddlVal, $("#ddlJefaturaAti"), "/Aplicacion/ConfiguracionPortafolio/GetJefaturaAtiByFiltro", ddlfiltro1);
}

function DdlJefaturaAti_Change() {
    let ddlVal = $(this).val();
    //let ddlfiltro1 = $("#ddlDominioBIAN").val() || "-1";
    if (ddlVal && ddlVal !== "-1") {
        InitSelectBuilder(ddlVal, $("#ddlArquitectoTi"), "/Aplicacion/ConfiguracionPortafolio/GetArquitectoTiByFiltro", "", true);
    }
}

function InitSelectBuilder(filtro, $ddl, urlGet, prefiltro1 = "", flagArquitecto = false) {
    if (filtro !== null && filtro !== "-1") {
        let _prefiltro1 = $.trim(prefiltro1) !== "" ? `filtro1=${prefiltro1}&` : "";
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: URL_API + `${urlGet}?${_prefiltro1}filtro=${filtro}`,
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        let data = dataObject;
                        if (flagArquitecto) {
                            data = data.filter(x => x.FlagActivo).map(y => y.Descripcion) || [];
                            COMBO_ARQUITECTO = data;
                        } 
                        SetItems(data, $ddl, TEXTO_SELECCIONE);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            async: false
        });
    }
}

function validarFormRegistro() {
    $("#formAddOrEditRegistro").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlME: {
                requiredSelect: true
            },
            ddlCT: {
                requiredSelect: true
            },
            //txtST: {
            //    requiredSinEspacios: true
            //},
            ddlAreaBian: {
                requiredSelect: true
            },
            ddlDominioBian: {
                requiredSelect: true
            },
            ddlJefaturaAti: {
                requiredSelect: true
            },
            ddlArquitectoTi: {
                requiredSelect: true
            },
            ddlPlataforma: {
                requiredSelect: true
            }
        },
        messages: {
            ddlME: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlCT: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            //txtST: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la subclasificación")
            //},
            ddlAreaBian: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlDominioBian: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlJefaturaAti: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlArquitectoTi: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            ddlPlataforma: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtReponsable") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function estadoFakeFormatter(value, row, index) {
    let retorno = value;
    let FlagAprobadorBandeja = row.FlagAprobadorBandeja || false;
    if (FlagAprobadorBandeja || row.EstadoSolicitud === ESTADO_SOLICITUD_APP.OBSERVADO) {
        retorno = "En proceso de revisión";
    }    
    
    return retorno;
}

function ExportarRegistros() {
    let _data = $table.bootstrapTable('getData') || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);

        return false;
    }
    var EstadoSolicitudStr = DATA_EXPORTAR.EstadoSolicitud.join("|");
    
    let url = `${URL_API_VISTA}/ExportarBandejaAprobadores?BandejaId=${DATA_EXPORTAR.BandejaId}&TipoSolicitud=${DATA_EXPORTAR.TipoSolicitud}&EstadoSolicitud=${EstadoSolicitudStr}&FechaDesde=${DATA_EXPORTAR.FechaDesde}&FechaHasta=${DATA_EXPORTAR.FechaHasta}&ModeloEntrega=${DATA_EXPORTAR.ModeloEntrega}&PerfilId=${DATA_EXPORTAR.PerfilId}&Matricula=${DATA_EXPORTAR.Matricula}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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