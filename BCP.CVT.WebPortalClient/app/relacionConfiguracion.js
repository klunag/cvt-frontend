var $table = $("#tblRegistro");
var $tableTecnologia = $("#tblRegistroTecnologia");
var AVISO_PROCESO_2DO_PLANO = "Hay un proceso en segundo plano ejecutándose, cierre la ventana y vuelva a intertarlo";
var URL_API_VISTA = URL_API + "/Relacion";
var DATA_TECNOLOGIA = [];
var DATA_APLICACION = [];
var DATA_EQUIPO = [];
var DATA_EQUIPO_TECNOLOGIA = [];
var DATA_TECNOLOGIA_DESMARCADO = [];
var DATA_RELEVANCIA = [];
var DATA_TIPO_ACTUAL = 0;
var TIPO = { TIPO_EQUIPO: "1", TIPO_TECNOLOGIA: "2", TIPO_APLICACION: "3", TIPO_SERVICIONUBE: "4" };
var RELACION_DETALLE_EDIT = [];
var DATA_ESTADO = [];
var ESTADO_RELACION = { PENDIENTE: 1, APROBADO: 2, DESAPROBADO: 3, PENDIENTEELIMINACION: 0, ELIMINADO: 5 };
var ESTADOS_APOYO = [ESTADO_RELACION.PENDIENTE, ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO, ESTADO_RELACION.PENDIENTEELIMINACION, ESTADO_RELACION.ELIMINADO];
var ESTADOS_APOYO_PENDIENTE = [ESTADO_RELACION.PENDIENTE, ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO];
var ESTADOS_APOYO_PENDIENTE_MODAL = [ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO];
var ESTADOS_APOYO_PENDIENTEELIMINACION = [ESTADO_RELACION.PENDIENTEELIMINACION, ESTADO_RELACION.ELIMINADO, ESTADO_RELACION.APROBADO];
var ESTADOS_APOYO_PENDIENTEELIMINACION_MODAL = [ESTADO_RELACION.ELIMINADO, ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO];
var DATA_EXPORTAR = {};
var RELEVANCIA_ALTA = 1;
var ESTADO_TECNOLOGIA = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var TITULO_MENSAJE = "Relación de Tecnología";
var FLAG_ACTIVO_TECNOLOGIA = 0;

var URL_AUTOCOMPLETE_EQUIPO = { DEFAULT: "GetEquipoByFiltro", SERVICIONUBE: "GetEquipoServicioNubeByFiltro", FILTROS: "GetEquipoFiltros" };

$(function () {
    //ListarEquipoTecnologia();
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    //CargarDataAutocomplete();
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({ data: [] });
    $tableTecnologia.bootstrapTable("destroy");
    $tableTecnologia.bootstrapTable({ data: [] });
    CargarCombos();
    $("#cbTipo").change(ChangeCbTipo);

    InitCheckInTable($tableTecnologia);
    ValidarCampos();
    //InitConfigUserAprobador(FLAG_USUARIO_APROBADOR);
    InitAutocompletarAplicacion($("#txtAplicacion"), $("#hdAplicacionId"), ".aplicacionContainer", 0);
    InitAutocompletarAplicacion($("#txtFilApp"), $("#hdFilAppId"), ".filAppContainer", 0); //Filtro App
    //InitAutocompletarAplicacion($("#txtAppBase"), $("#hdAppBaseId"), ".appBaseContainer", 0); //App Base
    InitAutocompletarAplicacion($("#txtAppVinculo"), $("#hdAppVinculoId"), ".appVinculoContainer", 1); //App Vinculo
    InitAutocompletarTecnologia($("#txtTecnologia"), $("#hdTecnologiaId"), ".tecnologiaContainer");
    //InitAutocompletarEquipo($("#txtFilComp"), $("#hdFilCompId"), ".filCompContainer", 0); //Filtro Componente
    //InitAutocompletarEquipo($("#txtEquipo"), $("#hdEquipoId"), ".equipoContainer", 1);
    InitAutocompletarEquipoFiltro($("#txtFilComp"), $("#hdFilCompId"), ".filCompContainer", 0, URL_AUTOCOMPLETE_EQUIPO.FILTROS); //Filtro Componente
    InitAutocompletarEquipo($("#txtEquipo"), $("#hdEquipoId"), ".equipoContainer", URL_AUTOCOMPLETE_EQUIPO.DEFAULT);
    waitingDialog.hide();
    ListarRegistros();

    $(".permiso-aprobar").hide();
    $(".permiso-aprobar").addClass("ignore");

    setDefaultHd($("#txtFilApp"), $("#hdFilAppId"));

    //validarFormAppVin();
    validarFormAddTec();
    $("#txtFabricanteTec, #txtNomTec, #txtVerTec").keyup(function () {
        $("#txtClaveTecnologia").val(String.Format("{0} {1} {2}", $.trim($("#txtFabricanteTec").val()), $.trim($("#txtNomTec").val()), $.trim($("#txtVerTec").val())));
    });

    $("#cbDomTec").on('change', function () {
        getSubdominiosByDomCb(this.value, $("#txtSubTec"));
    });

    if (FLAG_ADMIN == 1)
        $("#btnExportar").show();
    else
        $("#btnExportar").hide();

});
function InitConfigUserAprobador(FLAG_USUARIO_APROBADOR) {
    if (FLAG_USUARIO_APROBADOR) {
        $("#cbNuevoEstado").change(ChangeModalcbNuevoEstado);
        $table.bootstrapTable("showColumn", "FechaCreacionFormato");
        $table.bootstrapTable("showColumn", "UsuarioCreacion");
    }
}
function ChangeModalcbNuevoEstado() {
    let FLAG_MOSTRAR_OBSERVACION = false;
    let placeholder = "";
    let estadoId = parseInt($("#hdEstadoId").val()); // ESTADO ACTUAL
    if (estadoId === ESTADO_RELACION.PENDIENTE) {
        FLAG_MOSTRAR_OBSERVACION = parseInt($(this).val()) === ESTADO_RELACION.DESAPROBADO;
        placeholder = "Ingrese los motivos de la Desaprobación";
    } else if (estadoId === ESTADO_RELACION.PENDIENTEELIMINACION) {
        FLAG_MOSTRAR_OBSERVACION = parseInt($(this).val()) === ESTADO_RELACION.APROBADO;
        placeholder = "Ingrese los motivos por los que no aprobó la eliminación";
    }
    if (FLAG_MOSTRAR_OBSERVACION) {
        $(".form-group.form-modal-cambioestado").show();
        $("#txtObservacion").attr("placeholder", placeholder);
    } else {
        $(".form-group.form-modal-cambioestado").hide();
    }

}
function InitCheckInTable($table) {
    $table.on("check-all.bs.table", function (e, row) {
        // marco todos, debo habilitar todos
        //$(".format-relevancia").removeClass("bloq-element");
        //$(".format-relevancia").addClass("valid-element");
        //console.log("check-all.bs.table", row);
        //ValidacionRelacionTecnologiaDetalle();
        $.each(row, function (i, item) {
            ConfigcbRelevanciaCheck(item.Id);
            ConfigInputComponenteCheck(item.Id);
        });
    }).on("uncheck-all.bs.table", function (e, row) {
        // Desmarco todos, debo bloquear todos value
        //$(".format-relevancia").addClass("bloq-element");
        //$(".format-relevancia").removeClass("valid-element");
        //console.log("uncheck-all.bs.table", row);
        //ValidacionRelacionTecnologiaDetalle();
        $.each(row, function (i, item) {
            ConfigcbRelevanciaUnCheck(item.Id);
            ConfigInputComponenteUnCheck(item.Id);
        });
    }).on("check.bs.table", function (e, row, args) {
        // marco 1, debo habilitar uno value
        //$(`#cbRelevanciaEquipo${row.Id}`).removeClass("bloq-element");
        //$(`#cbRelevanciaEquipo${row.Id}`).addClass("valid-element");
        //ValidacionRelacionTecnologiaDetalle();
        ConfigcbRelevanciaCheck(row.Id);
        ConfigInputComponenteCheck(row.Id);
    }).on("uncheck.bs.table", function (e, row) {
        // Desmarco 1, debo bloquear uno value
        //let data_TMP = DATA_TECNOLOGIA_DESMARCADO.find(x => x == row.Id) || null;
        //if (data_TMP == null)
        //    DATA_TECNOLOGIA_DESMARCADO.push(row.Id);
        ConfigcbRelevanciaUnCheck(row.Id);
        ConfigInputComponenteUnCheck(row.Id);
        //$(`#cbRelevanciaEquipo${row.Id}`).addClass("bloq-element");
        //$(`#cbRelevanciaEquipo${row.Id}`).removeClass("valid-element");

    });
}
function ConfigcbRelevanciaCheck(Id) {
    let $combo = $(`#cbRelevanciaEquipo${Id}`);
    $combo.removeClass("bloq-element");
    $combo.addClass("valid-element");

    let data_TMP = DATA_TECNOLOGIA_DESMARCADO.find(x => x === Id) || null;
    if (data_TMP !== null)
        DATA_TECNOLOGIA_DESMARCADO = DATA_TECNOLOGIA_DESMARCADO.filter(x => x !== data_TMP);

    ValidacionRelacionTecnologiaDetalle();
}
function ConfigcbRelevanciaUnCheck(Id) {
    let $combo = $(`#cbRelevanciaEquipo${Id}`);
    $combo.addClass("bloq-element");
    $combo.removeClass("valid-element");

    let data_TMP = DATA_TECNOLOGIA_DESMARCADO.find(x => x === Id) || null;
    if (data_TMP === null)
        DATA_TECNOLOGIA_DESMARCADO.push(Id);

    ValidacionRelacionTecnologiaDetalle();
}

function ConfigInputComponenteCheck(Id) {
    let $input = $(`#txtComponente${Id}`);
    $input.removeClass("bloq-element");
    //$combo.addClass("valid-element");

    let data_TMP = DATA_TECNOLOGIA_DESMARCADO.find(x => x === Id) || null;
    if (data_TMP !== null)
        DATA_TECNOLOGIA_DESMARCADO = DATA_TECNOLOGIA_DESMARCADO.filter(x => x !== data_TMP);

    //ValidacionRelacionTecnologiaDetalle();
}

function ConfigInputComponenteUnCheck(Id) {
    let $input = $(`#txtComponente${Id}`);
    $input.addClass("bloq-element");

    let data_TMP = DATA_TECNOLOGIA_DESMARCADO.find(x => x === Id) || null;
    if (data_TMP === null)
        DATA_TECNOLOGIA_DESMARCADO.push(Id);
}

function ValidacionRelacionTecnologiaDetalle() {
    $(".form-control.format-relevancia.bloq-element").each((ic, ec) => {
        $(`#${ec.id}`).rules("remove");
    })
    $(".form-control.format-relevancia.valid-element").each((ic, ec) => {
        $(`#${ec.id}`).rules("add", {
            requiredSelect: true,
            messages: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "la relevancia")
            }
        });
    });
}
function ChangeCbTipo() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    let pos = $("#cbTipo").val();
    switch (pos) {
        case TIPO.TIPO_EQUIPO:
            $(".tipo-tecnologia").hide();
            $(".tipo-aplicacion").hide();
            $(".tipo-equipo").show();

            $("#txtEquipo").autocomplete("destroy");
            InitAutocompletarEquipo($("#txtEquipo"), $("#hdEquipoId"), ".equipoContainer", URL_AUTOCOMPLETE_EQUIPO.DEFAULT);
            break;
        case TIPO.TIPO_SERVICIONUBE:
            $(".tipo-tecnologia").hide();
            $(".tipo-aplicacion").hide();
            $(".tipo-equipo").show();

            $("#txtEquipo").autocomplete("destroy");
            InitAutocompletarEquipo($("#txtEquipo"), $("#hdEquipoId"), ".equipoContainer", URL_AUTOCOMPLETE_EQUIPO.SERVICIONUBE);
            break;
        case TIPO.TIPO_TECNOLOGIA:
            $(".tipo-equipo").hide();
            $(".tipo-aplicacion").hide();
            $(".tipo-tecnologia").show();
            break;
        case TIPO.TIPO_APLICACION:
            $(".tipo-tecnologia").hide();
            $(".tipo-equipo").hide();
            $(".tipo-aplicacion").show();
            break;
        default:
            $(".tipo-equipo").hide();
            $(".tipo-aplicacion").hide();
            $(".tipo-tecnologia").show();
    }
}
function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({
        locale: "es-SP",
        url: URL_API_VISTA + "/Listado",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "RelacionId",
        sortOrder: "desc",
        uniqueId: "RelacionId",
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            //DATA_EXPORTAR.nombre = $("#txtFilApp").val();
            DATA_EXPORTAR.CodigoAPT = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $("#txtFilApp").val();//$("#txtFilApp").val() || ""; //$("#hdFilAppId").val();
            //DATA_EXPORTAR.EquipoId = $("#hdFilCompId").val();
            DATA_EXPORTAR.Componente = $("#txtFilComp").val() || "";
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.TipoRelacionId = $("#cbTipoRelacionFiltro").val() === "-1" ? null : $("#cbTipoRelacionFiltro").val();
            DATA_EXPORTAR.EstadoId = $("#cbEstadoFiltro").val() === "-2" ? null : $("#cbEstadoFiltro").val();
            //DATA_EXPORTAR.DominioId = $("#cbDominioFiltro").val() === "-1" ? null : $("#cbDominioFiltro").val();
            //DATA_EXPORTAR.SubdominioId = $("#cbSubdominioFiltro").val() === "-1" ? null : $("#cbSubdominioFiltro").val();
            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadSuccess: function (status, res) {
            //CargarPermisos(objPermiso);
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
        onExpandRow: function (index, row, $detail) {
            let data = ListarRegistrosDetalle(row.RelacionId);
            //debugger;
            if (data.length > 0) {
                console.log(data);
                $('#tblRegistrosDetalle_' + row.RelacionId).bootstrapTable("destroy");
                $('#tblRegistrosDetalle_' + row.RelacionId).bootstrapTable({
                    data: data
                });

                $('#tblRegistrosDetalle_' + row.RelacionId).bootstrapTable("hideLoading");
            } else $detail.empty().append("No existe registros");
        }
    });
}
function ListarRegistrosDetalle(Id) {
    let data = [];
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarDetalle/" + Id,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                data = dataObject;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return data;
}
function RefrescarListado() {
    ListarRegistros();
}
function ValidarCampos() {

    $.validator.addMethod("existeAplicacion", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $.trim($("#hdAplicacionId").val()) !== "0") {
            //debugger;
            estado = ExisteAplicacion();
            return estado;
        }

        return estado;
    });

    $.validator.addMethod("existeTecnologia", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $.trim($("#hdTecnologiaId").val()) !== "0") {
            estado = ExisteTecnologia();
            return estado;
        }

        return estado;
    });

    $.validator.addMethod("existeEquipo", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $.trim($("#hdEquipoId").val()) !== "0") {
            estado = ExisteEquipo();
            return estado;
        }

        return estado;
    });

    $.validator.addMethod("existeEstado", function (value, element) {
        return value !== $("#hdEstadoId").val();
    });

    $.validator.addMethod("requiredObservacion", function (value, element) {
        let nuevoestado = $("#cbNuevoEstado").val();
        let estadoId = parseInt($("#hdEstadoId").val()); // ESTADO ACTUAL
        if (estadoId === ESTADO_RELACION.PENDIENTE) {
            if (nuevoestado === ESTADO_RELACION.DESAPROBADO) {
                return $.trim(value) !== "" && value !== null;
            }
        } else if (estadoId === ESTADO_RELACION.PENDIENTEELIMINACION) {
            if (nuevoestado === ESTADO_RELACION.APROBADO) {
                return $.trim(value) !== "" && value !== null;
            }
        }

        return true;
    });

    $.validator.addMethod("distintoCodigo", function (value, element) {
        let estado = true;
        let appBaseId = $("#hdAplicacionId").val();
        let appVinculoId = $("#hdAppVinculoId").val();

        if ($.trim(value) !== "" && $.trim(appBaseId) !== "0" && $.trim(appVinculoId) !== "0") {
            estado = appBaseId !== appVinculoId ? true : false;
            return estado;
        }

        return estado;
    });

    $("#formAddOrEdit").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtAplicacion: {
                requiredSinEspacios: true,
                existeAplicacion: true
            },
            cbTipo: {
                requiredSelect: true
            },
            txtTecnologia: {
                requiredSinEspacios: true,
                existeTecnologia: true
            },
            cbRelevancia: {
                requiredSelect: true
            },
            cbAmbiente: {
                requiredSelect: true
            },
            txtEquipo: {
                requiredSinEspacios: true,
                existeEquipo: true
            },
            txtCantidadTecnologia: {
                requiredSinEspacios: false
            },
            cbEstado: {
                requiredSelect: true,
                existeEstado: true
            },
            txtAppVinculo: {
                requiredSinEspacios: true,
                distintoCodigo: true
            },
            cbEquipoVin: {
                requiredSelect: true
            },
            txtDetAppVin: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtAplicacion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
                existeAplicacion: String.Format("{0} seleccionada no existe.", "La aplicación")
            },
            cbTipo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo")
            },
            txtTecnologia: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la tecnología"),
                existeTecnologia: String.Format("{0} seleccionada no existe.", "La tecnología")
            },
            cbRelevancia: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "la relevancia")
            },
            cbAmbiente: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el ambiente")
            },
            txtEquipo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el equipo"),
                existeEquipo: String.Format("{0} seleccionado no existe.", "El equipo")
            },
            txtCantidadTecnologia: {
                requiredSinEspacios: String.Format("Debes marcar {0}.", "una tecnología")
            },
            cbEstado: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el estado"),
                existeEstado: "Estado ya se encuentra registrado."
            },
            txtAppVinculo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
                distintoCodigo: "Debes seleccionar una aplicación diferente"
            },
            cbEquipoVin: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el equipo")
            },
            txtDetAppVin: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el recurso relacionado")
            }
        }
    });

    if (FLAG_USUARIO_APROBADOR) {

        $("#formCambioEstado").validate({
            validClass: "my-valid-class",
            errorClass: "my-error-class",
            ignore: ".ignore",
            rules: {
                cbNuevoEstado: { requiredSelect: true, existeEstado: true },
                txtObservacion: { requiredObservacion: true }
            },
            messages: {
                cbNuevoEstado: { requiredSelect: String.Format("Debes seleccionar {0}.", "el estado"), existeEstado: "Estado ya se encuentra registrado." },
                txtObservacion: { requiredObservacion: String.Format("Debes ingresar {0}.", "la observación") }
            }
        });
    }
}
function GuardarNuevoEstado() {
    $(".form-principal").addClass("ignore");
    $(".tipo-tecnologia").addClass("ignore");
    $(".tipo-equipo").addClass("ignore");
    $(".form-aprobar").addClass("ignore");
    $(".form-modal-cambioestado").removeClass("ignore");
    if ($("#formCambioEstado").valid()) {
        console.log("Guardar nuevo estado");
        //debugger;
        IrCambiarEstado($("#hdId").val(), $("#cbNuevoEstado").val(), $("#txtObservacion").val());
    }
}
function OpenModal() {
    $("#titleForm").html("Nueva Relación");
    $("#hdId").val("");
    MdAddOrEditRegistro(true);

    $(".form-principal").removeClass("bloq-element");
    $(".tipo-tecnologia").removeClass("bloq-element");
    $(".tipo-equipo").removeClass("bloq-element");
    $(".tipo-aplicacion").removeClass("bloq-element");
}
function MdAddOrEditRegistro(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    $("#formAddOrEdit").validate().resetForm();
    $("#btnRegistrar").show();
    if (EstadoMd)
        $("#MdAddOrEditModal").modal(opcionesModal);
    else
        $("#MdAddOrEditModal").modal("hide");
}
function MdCambioEstado(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    $("#formCambioEstado").validate().resetForm();
    if (EstadoMd)
        $("#mdCambioEstado").modal(opcionesModal);
    else
        $("#mdCambioEstado").modal("hide");
}
function LimpiarMdAddOrEditRegistro() {
    //LimpiarValidateErrores($("#formCambioEstado"));
    $(":input", "#formAddOrEdit")
        .not(":button, :submit, :reset, :hidden")
        .val("")
        .removeAttr("checked")
        .removeAttr("selected");
    $("#cbTipo").val("-1");
    $("#cbAmbiente").val("-1");
    $("#cbRelevancia").val("-1");
    $("#txtAplicacion").val("");
    $("#hdAplicacionId").val("0");
    $("#txtEquipo").val("");
    $("#hdEquipoId").val("0");
    $("#txtTecnologia").val("");
    $("#hdTecnologiaId").val("0");
    $("#hdId").val("0");
    $("#txtObservacion").val("");
    $("#hdEstadoId").val("");
    $("#hdRelacionDetalleId").val("0");

    //Tipo Relacion Aplicacion
    $("#txtAppVinculo").val("");
    $("#hdAppVinculoId").val("0");
    SetItems([], $("#cbEquipoVin"), TEXTO_SELECCIONE);
    $("#cbEquipoVin").val("-1");
    $("#txtDetAppVin").val("");

    ChangeCbTipo();
    DATA_TECNOLOGIA_DESMARCADO = [];
    DATA_TIPO_ACTUAL = 0;
    $tableTecnologia.bootstrapTable("destroy");
    $tableTecnologia.bootstrapTable();
    $("#cbNuevoEstado").val("-1");
    $("#txtEstadoActual").val("");

    var validator = $("#formAddOrEdit").validate();
    validator.resetForm();
    validator = $("#formCambioEstado").validate();
    validator.resetForm();
}
function ExportarInfo() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.CodigoAPT = $("#hdFilAppId").val() !== "0" ? $("#hdFilAppId").val() : $("#txtFilApp").val();
    //DATA_EXPORTAR.CodigoAPT = $("#txtFilApp").val() || "";    
    DATA_EXPORTAR.Componente = $("#txtFilComp").val() || "";
    DATA_EXPORTAR.TipoRelacionId = $("#cbTipoRelacionFiltro").val();
    DATA_EXPORTAR.EstadoId = $("#cbEstadoFiltro").val();

    let url = `${URL_API_VISTA}/Exportar?codigoAPT=${DATA_EXPORTAR.CodigoAPT}&componente=${DATA_EXPORTAR.Componente}&nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&tipoRelacionId=${DATA_EXPORTAR.TipoRelacionId}&estadoId=${DATA_EXPORTAR.EstadoId}`;
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
function opcionesFormatter(value, row) {
    let eliminar = "";
    let cambiarEstado = "";

    if (row.EstadoId === ESTADO_RELACION.APROBADO)
        eliminar = `<a href="javascript:IrEliminarRegistro(${value});" title="Eliminar registro"><i style="" class="glyphicon glyphicon-trash table-icon"></i></a>`;
    else
        eliminar = `<a title="Eliminar registro" disabled="disabled" ><i style="color:#A5A9AC;" class="glyphicon glyphicon-trash table-icon"></i></a>`;

    if (row.EstadoId === ESTADO_RELACION.PENDIENTE || row.EstadoId === ESTADO_RELACION.PENDIENTEELIMINACION) {
        cambiarEstado = `<a href="javascript:IrAbrirModalCambioEstado(${row.RelacionId},${row.EstadoId},'${row.EstadoStr}')" title="Cambiar estado"><span class="icon icon-rotate-right"></span></a>`;
    } else {
        cambiarEstado = `<a title="Cambiar estado"><span style="color:#A5A9AC;" class="icon icon-rotate-right"></span></a>`;
    }

    return eliminar.concat("&nbsp;&nbsp;", cambiarEstado);
}
function linkFormatter(value, row) {
    return `<a href="javascript:EditRegistro(${row.RelacionId},${row.EstadoId}, '${row.EstadoStr}')" title="Ver detalle de la relación">${value}</a>`;

}
function IrAbrirModalCambioEstado(Id, EstadoId, EstadoStr) {
    //debugger;
    MdCambioEstado(true);
    $("#hdId").val(Id);
    $("#hdEstadoId").val(EstadoId);
    switch (EstadoId) {
        case ESTADO_RELACION.PENDIENTE:
            SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTE_MODAL.includes(x.Id)), $("#cbNuevoEstado"), TEXTO_SELECCIONE);
            break;
        case ESTADO_RELACION.PENDIENTEELIMINACION:
            SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTEELIMINACION_MODAL.includes(x.Id)), $("#cbNuevoEstado"), TEXTO_SELECCIONE);
            break;
    }

    //if (EstadoId === ESTADO_RELACION.PENDIENTE) {
    //    SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTE_MODAL.includes(x.Id)), $("#cbNuevoEstado"), TEXTO_SELECCIONE);
    //} else if (EstadoId === ESTADO_RELACION.PENDIENTEELIMINACION) {
    //    SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTEELIMINACION_MODAL.includes(x.Id)), $("#cbNuevoEstado"), TEXTO_SELECCIONE);
    //}

    $("#cbNuevoEstado").val(-1);
    $("#cbNuevoEstado").trigger("change");
    $("#txtEstadoActual").val(EstadoStr);
}

function IrCambiarEstado(Id, EstadoId, Observacion) {
    //debugger;
    let mensaje = "";
    Observacion = Observacion || null;
    let estadoId = parseInt(EstadoId);

    let data = {
        Id: $("#hdId").val(),
        EstadoId: estadoId,
    };

    let estadoActual = parseInt($("#hdEstadoId").val());
    switch (estadoActual) {
        case ESTADO_RELACION.PENDIENTEELIMINACION:
            mensaje = "¿Estás seguro de {0} la ELIMINACIÓN de la Relación?";
            CasoPendienteEliminacion(estadoId, data, mensaje, Observacion);
            break;
        case ESTADO_RELACION.PENDIENTE:
            mensaje = "¿Estás seguro de {0} la relación?";
            CasoPendiente(estadoId, data, mensaje, Observacion);
            break;
    }
}
function CasoPendiente(estadoId, data, mensaje, Observacion) {
    if (estadoId === ESTADO_RELACION.APROBADO) {
        mensaje = String.Format(mensaje, "APROBAR");
        bootbox.confirm({
            message: mensaje,
            buttons: {
                confirm: {
                    label: "Aprobar",
                    className: "btn btn-primary"
                },
                cancel: {
                    label: "Cancelar",
                    className: "btn btn-secondary"
                }
            },
            callback: function (result) {
                if (result) {
                    AjaxCambiarEstado(data);
                }
            }
        });

    } else if (estadoId === ESTADO_RELACION.DESAPROBADO) {

        if (Observacion === null) {
            mensaje = String.Format(mensaje, "DESAPROBAR");
            bootbox.prompt({
                title: "Aprobar Relación",
                size: "small",
                message: mensaje,
                inputType: "textarea",
                rows: "5",
                locale: "custom",
                placeholder: "Ingrese los motivos de la Desaprobación",
                buttons: {
                    confirm: {
                        label: "Desaprobar",
                        className: "btn btn-primary"
                    },
                    cancel: {
                        label: "Cancelar",
                        className: "btn btn-secondary"
                    }
                },
                maxlength: 250,
                callback: function (result) {
                    result = result || null;
                    if (result !== null) {

                        result = $.trim(result);
                        if (result === "") {
                            toastr.error("Debes ingresar observación.", TITULO_MENSAJE);
                        } else if (result.length > 0) {
                            data.Observacion = result;
                            AjaxCambiarEstado(data);
                        }
                    } else if (result === null) {
                        toastr.error("Debes ingresar observación.", TITULO_MENSAJE);
                    }
                }
            });
        }
        else {
            data.Observacion = Observacion;
            AjaxCambiarEstado(data);
        }
    }
}
function CasoPendienteEliminacion(estadoId, data, mensaje, Observacion) {
    //debugger;
    switch (estadoId) {
        case ESTADO_RELACION.ELIMINADO:
            mensaje = String.Format(mensaje, "APROBAR");
            bootbox.confirm({
                message: mensaje,
                buttons: {
                    confirm: {
                        label: "Aprobar",
                        className: "btn btn-primary"
                    },
                    cancel: {
                        label: "Cancelar",
                        className: "btn btn-secondary"
                    }
                },
                callback: function (result) {
                    if (result) {
                        AjaxCambiarEstado(data);
                    }
                }
            });
            break;

        case ESTADO_RELACION.APROBADO:
            mensaje = String.Format(mensaje, "APROBAR");
            bootbox.confirm({
                message: mensaje,
                buttons: {
                    confirm: {
                        label: "Aprobar",
                        className: "btn btn-primary"
                    },
                    cancel: {
                        label: "Cancelar",
                        className: "btn btn-secondary"
                    }
                },
                callback: function (result) {
                    if (result) {
                        data.EstadoId = -1;//ESTADO_RELACION.ELIMINADO;
                        AjaxCambiarEstado(data);
                    }
                }
            });
            break;

        case ESTADO_RELACION.DESAPROBADO:
            mensaje = String.Format(mensaje, "DESAPROBAR");
            bootbox.confirm({
                message: mensaje,
                buttons: {
                    confirm: {
                        label: "Aprobar",
                        className: "btn btn-primary"
                    },
                    cancel: {
                        label: "Cancelar",
                        className: "btn btn-secondary"
                    }
                },
                callback: function (result) {
                    if (result) {
                        data.EstadoId = ESTADO_RELACION.APROBADO;
                        AjaxCambiarEstado(data);
                    }
                }
            });
            break;
    }

}
function AjaxCambiarEstado(data) {
    //debugger;
    $.ajax({
        url: URL_API_VISTA + "/CambiarEstado",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (result) {
            if (result) {
                toastr.success("El cambio de estado se realizó correctamente.", TITULO_MENSAJE);
            }
        },
        complete: function (data) {
            if (ControlarCompleteAjax(data)) {
                MdAddOrEditRegistro(false);
                MdCambioEstado(false);
                ListarRegistros();
            } else
                MensajeErrorCliente();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}
function IrEliminarRegistro(Id) {
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás seguro que deseas eliminar el registro seleccionado?",
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
            if (result) {
                let data = {
                    Id: Id,
                    EstadoId: ESTADO_RELACION.PENDIENTEELIMINACION,
                };
                AjaxCambiarEstado(data);
            }
        }
    });
}
function ShowNamebyId(Id, _DATA, $item) {
    let first_tmp = _DATA.find(x => x.Id.toString() === Id) || null;
    if (first_tmp !== null) $item.val(first_tmp.Descripcion);
}
function EditRegistro(Id, EstadoId, EstadoStr) {
    if (EstadoId === ESTADO_RELACION.PENDIENTE || EstadoId === ESTADO_RELACION.APROBADO) {
        $("#titleForm").html("Ver detalle de la relación");
        $.ajax({
            url: URL_API_VISTA + "/" + Id,
            type: "GET",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            dataType: "json",
            success: function (result) {
                MdAddOrEditRegistro(true);
                $("#btnRegistrar").hide();
                //$("#hdId").val(result.Id);
                $("#hdId").val(result.RelacionId);
                $("#hdAplicacionId").val(result.CodigoAPT);
                //ShowNamebyId($("#hdAplicacionId").val(), DATA_APLICACION, $("#txtAplicacion")); // TODO
                $("#txtAplicacion").val(result.AplicacionStr);
                DATA_TIPO_ACTUAL = result.TipoId;
                $("#cbTipo").val(result.TipoId);
                console.log($("#cbTipo").val());
                //debugger;
                ChangeCbTipo();
                let flagTipo = $("#cbTipo").val();
                switch (flagTipo) {
                    case TIPO.TIPO_TECNOLOGIA:
                        $("#hdRelacionDetalleId").val(result.ListRelacionDetalle[0].Id);
                        $("#hdTecnologiaId").val(result.ListRelacionDetalle[0].TecnologiaId);
                        $("#txtTecnologia").val(result.ListRelacionDetalle[0].TecnologiaStr);
                        //ShowNamebyId($("#hdTecnologiaId").val(), DATA_TECNOLOGIA, $("#txtTecnologia"));
                        $("#cbRelevancia").val(result.ListRelacionDetalle[0].RelevanciaId);
                        break;
                    case TIPO.TIPO_EQUIPO:
                    case TIPO.TIPO_SERVICIONUBE:
                        $("#cbAmbiente").val(result.AmbienteId);
                        $("#hdEquipoId").val(result.EquipoId === null ? "0" : result.EquipoId);
                        $("#txtEquipo").val(result.EquipoStr);
                        //ShowNamebyId($("#hdEquipoId").val(), DATA_EQUIPO, $("#txtEquipo"));
                        RELACION_DETALLE_EDIT = result.ListRelacionDetalle;
                        FiltrarEquipoTecnologia();
                        $.each(RELACION_DETALLE_EDIT, function (i, item) {
                            $(`#cbRelevanciaEquipo${item.TecnologiaId}`).val(item.RelevanciaId);
                            $(`#cbRelevanciaEquipo${item.TecnologiaId}`).removeClass("bloq-element");

                            $(`#txtComponente${item.TecnologiaId}`).val(item.Componente);
                            $(`#txtComponente${item.TecnologiaId}`).removeClass("bloq-element");
                        });
                        ValidacionRelacionTecnologiaDetalle();
                        break;
                    case TIPO.TIPO_APLICACION:
                        $("#cbAmbiente").val(result.AmbienteId);
                        $("#hdAppVinculoId").val(result.ListRelacionDetalle[0].CodigoAPTVinculo);
                        $("#txtAppVinculo").val(result.ListRelacionDetalle[0].CodigoAPTVinculoStr);
                        obtenerEquiposByAppVinculo($("#hdAppVinculoId").val());
                        $("#cbEquipoVin").val(result.EquipoId === null ? "-1" : result.EquipoId);
                        $("#txtDetAppVin").val(result.ListRelacionDetalle[0].DetalleVinculo);
                        $("#cbRelevancia").val(result.ListRelacionDetalle[0].RelevanciaId);
                        break;
                }

                if (FLAG_USUARIO_APROBADOR) { // TODO
                    //$(".tipo-aprobar").removeClass("bloq-element");
                    //$(".tipo-aprobar").show();
                    $(".form-principal").addClass("bloq-element");
                    $(".tipo-tecnologia").addClass("bloq-element");
                    $(".tipo-equipo").addClass("bloq-element");
                    $(".tipo-aplicacion").addClass("bloq-element");

                    //if (EstadoId === ESTADO_RELACION.PENDIENTE) {
                    //    SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTE.includes(x.Id)), $("#cbEstado"), "");
                    //} else if (EstadoId === ESTADO_RELACION.PENDIENTEELIMINACION) {
                    //    SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO_PENDIENTEELIMINACION.includes(x.Id)), $("#cbEstado"), "");
                    //} else {
                    //    SetItems(DATA_ESTADO.filter(x => ESTADOS_APOYO.includes(x.Id)), $("#cbEstado"), TEXTO_SELECCIONE);
                    //}

                    //$("#cbEstado").val(EstadoId);
                    $("#hdEstadoId").val(EstadoId);
                    //if (EstadoId !== ESTADO_RELACION.PENDIENTE && EstadoId !== ESTADO_RELACION.PENDIENTEELIMINACION) {
                    //    $(".tipo-aprobar").addClass("bloq-element");
                    //}

                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            async: false
        });
    } else {
        bootbox.alert({
            size: "sm",
            title: TITULO_MENSAJE,
            message: String.Format("La relación se encuentra en estado {0}. No es posible editar", EstadoStr),
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    }
}
function ObtenerTecnologiaIdsEliminar() {
    let FLAG_CAMBIO_TIPO = false;
    if (DATA_TIPO_ACTUAL > 0) {
        FLAG_CAMBIO_TIPO = DATA_TIPO_ACTUAL !== parseInt($("#cbTipo").val());
    }

    if (FLAG_CAMBIO_TIPO && $("#hdTecnologiaId").val() !== "") {
        DATA_TECNOLOGIA_DESMARCADO.push([parseInt($("#hdTecnologiaId").val())]);
    }
    return DATA_TECNOLOGIA_DESMARCADO;
}

//function CrearObjListRelacionDetalle(FlagTecnologia) {
//    let data = [];
//    if (FlagTecnologia) {
//        data.push({
//            Id: $("#hdRelacionDetalleId").val(),
//            TecnologiaId: $("#hdTecnologiaId").val(),
//            RelevanciaId: $("#cbRelevancia").val(),
//            UsuarioCreacion: USUARIO.UserName,
//            UsuarioModificacion: USUARIO.UserName,
//            Activo: true
//        });
//    } else if (!FlagTecnologia) {
//        let dataTmp = $tableTecnologia.bootstrapTable("getData");
//        dataTmp = dataTmp.filter(x => x.FlagSeleccionado);
//        $.each(dataTmp, function (i, item) {
//            data.push({
//                Activo: true,
//                UsuarioCreacion: USUARIO.UserName,
//                UsuarioModificacion: USUARIO.UserName,
//                TecnologiaId: item.Id,
//                RelevanciaId: $(`#cbRelevanciaEquipo${item.Id}`).val()
//            });
//        });
//    }
//    return data;
//}

function CrearObjListRelacionDetalle(tipoRelacionId) {
    let data = [];
    switch (tipoRelacionId) {
        case TIPO.TIPO_TECNOLOGIA:
            data.push({
                Id: $("#hdRelacionDetalleId").val(),
                TecnologiaId: $("#hdTecnologiaId").val(),
                RelevanciaId: $("#cbRelevancia").val(),
                Activo: true
            });
            break;
        case TIPO.TIPO_EQUIPO:
        case TIPO.TIPO_SERVICIONUBE:
            let dataTmp = $tableTecnologia.bootstrapTable("getData");
            dataTmp = dataTmp.filter(x => x.FlagSeleccionado);
            $.each(dataTmp, function (i, item) {
                data.push({
                    Activo: true,
                    TecnologiaId: item.Id,
                    RelevanciaId: $(`#cbRelevanciaEquipo${item.Id}`).val(),
                    Componente: $(`#txtComponente${item.Id}`).val()
                });
            });
            break;
        case TIPO.TIPO_APLICACION:
            data.push({
                Id: $("#hdRelacionDetalleId").val(),
                TecnologiaId: -1, //$("#hdTecnologiaId").val(),
                RelevanciaId: $("#cbRelevancia").val(),
                CodigoAPTVinculo: $("#hdAppVinculoId").val(),
                DetalleVinculo: $("#txtDetAppVin").val(),
                Activo: true
            });
            break;
    }

    return data;
}

function CrearObjRelacion(tipoRelacionId) {
    var data = {
        RelacionId: $("#hdId").val(),
        CodigoAPT: $("#hdAplicacionId").val(),
        TipoId: $("#cbTipo").val(),
        Activo: true,
        ListRelacionDetalle: CrearObjListRelacionDetalle(tipoRelacionId),
        EstadoId: ESTADO_RELACION.PENDIENTE,
        TecnologiaIdsEliminar: ObtenerTecnologiaIdsEliminar()
    };

    switch (tipoRelacionId) {
        case TIPO.TIPO_TECNOLOGIA:
            break;
        case TIPO.TIPO_EQUIPO:
        case TIPO.TIPO_SERVICIONUBE:
            data.AmbienteId = $("#cbAmbiente").val();
            data.EquipoId = $("#hdEquipoId").val();
            break;
        case TIPO.TIPO_APLICACION:
            //data.CodigoAPTVinculo = $("#hdAppVinculoId").val();
            data.EquipoId = $("#cbEquipoVin").val();
            //data.DetalleVinculo = $("#txtDetAppVin").val();
            break;
    }

    //if (!tipoRelacionId) {
    //    data.AmbienteId = $("#cbAmbiente").val();
    //    data.EquipoId = $("#hdEquipoId").val();
    //    //data.TecnologiaIdsEliminar = DATA_TECNOLOGIA_DESMARCADO;
    //}
    return data;
}

function RegistrarAddOrEdit() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    let relacionId = $("#hdId").val();
    if (relacionId === "0" || relacionId === null) {
        let estadoUnico = ValidarRelacionUnica();
        if (estadoUnico) {
            bootbox.alert("La relación ya se encuentra registrada, por favor selecciona otra aplicación, equipo o tecnología");
            return false;
        }
    }

    if (parseInt($("#hdEstadoId").val()) === ESTADO_RELACION.DESAPROBADO) {
        MdAddOrEditRegistro(false);
        return false;
    }
    //console.log(FLAG_USUARIO_APROBADOR);

    //if (FLAG_USUARIO_APROBADOR) {
    //    let EstadoId = parseInt($("#hdEstadoId").val());
    //    if (EstadoId === ESTADO_RELACION.PENDIENTE || EstadoId === ESTADO_RELACION.PENDIENTEELIMINACION) {
    //        $(".form-principal").addClass("ignore");
    //        $(".tipo-tecnologia").addClass("ignore");
    //        $(".tipo-equipo").addClass("ignore");
    //        $(".form-aprobar").removeClass("ignore");
    //        if ($("#formAddOrEdit").valid()) IrCambiarEstado($("#hdId").val(), $("#cbEstado").val());
    //    } else {
    //        bootbox.alert("Sin cambios por registrar.", function () { });
    //    }

    //    return false;
    //}

    $(".form-principal").removeClass("ignore");

    let pos = $("#cbTipo").val();
    switch (pos) {
        case TIPO.TIPO_TECNOLOGIA:
            $(".tipo-equipo").addClass("ignore");
            $(".tipo-aplicacion").addClass("ignore");
            $(".tipo-tecnologia").removeClass("ignore");
            break;
        case TIPO.TIPO_EQUIPO:
        case TIPO.TIPO_SERVICIONUBE:
            $(".tipo-tecnologia").addClass("ignore");
            $(".tipo-aplicacion").addClass("ignore");
            $(".tipo-equipo").removeClass("ignore");
            break;
        case TIPO.TIPO_APLICACION:
            $(".tipo-tecnologia").addClass("ignore");
            $(".tipo-equipo").addClass("ignore");
            $(".tipo-aplicacion").removeClass("ignore");
            break;
    }

    if ($("#formAddOrEdit").valid()) {
        $("#btnRegistrar").button("loading");

        let data = CrearObjRelacion(pos);

        console.log(data);
        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        toastr.success("Registrado correctamente.", TITULO_MENSAJE);
                        ListarRegistros();
                    }
                }
            },
            complete: function (data) {
                $("#btnRegistrar").button("reset");
                if (ControlarCompleteAjax(data))
                    MdAddOrEditRegistro(false);
                else
                    bootbox.alert("Sucedió un error con el servicio", function () { });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}
function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //debugger;
                    SetItems(dataObject.TipoEquipo, $("#cbTipo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoAmbiente, $("#cbAmbiente"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Relevancia, $("#cbRelevancia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoEquipo, $("#cbTipoRelacionFiltro"), TEXTO_TODOS);
                    SetItems2(dataObject.Estado, $("#cbEstadoFiltro"), TEXTO_TODOS);
                    SetItems(dataObject.Dominio, $("#cbDomTec"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Dominio, $("#cbDominioFiltro"), TEXTO_TODOS);
                    //SetItems(dataObject.Subdominio, $("#cbSubdominioFiltro"), TEXTO_TODOS);
                    DATA_ESTADO = dataObject.Estado;
                    DATA_RELEVANCIA = dataObject.Relevancia;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}
function relevanciaFormatter(value, row) {
    return `<select id="cbRelevanciaEquipo${value}" name="cbRelevanciaEquipo${value}" class="form-control format-relevancia bloq-element"><option>${TEXTO_SELECCIONE}</option></select>`;
}
function detailFormatter(index, row) {
    let TipoRelacionStr = "";
    if (row.TipoId === 3) {
        TipoRelacionStr = "Aplicación";
    } else {
        TipoRelacionStr = "Tecnología";
    }

    let html = String.Format(`<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true">
                            <thead>
                                <tr>
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="2%">#</th>
                                    <th data-field="TecnologiaStr" data-sortable="false" data-halign="center" data-valign="middle" data-align="left" data-width="15%">{1}</th>
                                    <th data-field="RelevanciaStr" data-sortable="false" data-halign="center" data-valign="middle" data-align="center" data-width="3%">Relevancia</th>
                                    <th data-field="FechaModificacionFormato" data-sortable="false" data-halign="center" data-valign="middle" data-align="center" data-width="3%">F. última modificación</th>
                                    <th data-field="UsuarioModificacion" data-sortable="false" data-halign="center" data-valign="middle" data-align="center" data-width="3%">Modificado por</th>
                                </tr>
                            </thead>
                        </table>`, row.RelacionId, TipoRelacionStr);
    return html;
}

function componenteFormatter(value, row) {
    return `<input id="txtComponente${value}" class="form-control" type="text" name="txtComponente${value}">`;
}

async function ListarEquipoTecnologia() {
    let url = `${URL_API_VISTA}/ListarEquipoTecnologia`;
    let data = await fetch(url).then(r => r.json()).catch(err => { MensajeErrorCliente(); });
    DATA_EQUIPO_TECNOLOGIA = data;
}

/* TIEMPO DE ESPERA SUPERADO */
function ListarEquipoTecnologiaByParam(equipoId) {
    let DATA = [];
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ListarEquipoTecnologiaByEquipoId?Id=${equipoId}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    DATA = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return DATA;
}
function FiltrarEquipoTecnologia() {
    let equipoId = $("#hdEquipoId").val();
    $tableTecnologia.bootstrapTable("destroy");
    let dataTMP = ListarEquipoTecnologiaByParam(equipoId);

    //RELACION_DETALLE_EDIT = dataTMP.filter(x => x.FlagSO);  // NUEVO => TEC S.O.
    let RELACION_DETALLE_EDIT_SO = dataTMP.filter(x => x.FlagSO);
    let RELACION_DETALLE_EDIT_COMPONENTE = dataTMP.filter(x => x.FlagComponente === false);

    //if ($("#hdId").val() !== "0" && $("#cbTipo").val() === TIPO.TIPO_EQUIPO) { // SE VA

    //SOs checked
    $.each(RELACION_DETALLE_EDIT_SO, function (i, item) {
        let nroEvaluar = item.TecnologiaId || item.Id;
        let foundIndex = dataTMP.findIndex(x => x.Id === nroEvaluar);
        //console.log(foundIndex);
        if (foundIndex !== "-1" && foundIndex !== -1) {
            dataTMP[foundIndex].FlagSeleccionado = true;
            dataTMP[foundIndex] = dataTMP[foundIndex];
        }
    });

    //Tecnologias checked
    if (RELACION_DETALLE_EDIT.length > 0) {
        $.each(RELACION_DETALLE_EDIT, function (i, item) {
            //let nroEvaluar = item.TecnologiaId || item.Id;
            let foundIndex = dataTMP.findIndex(x => x.Id === item.TecnologiaId.toString());
            //debugger;
            //console.log(foundIndex);
            if (foundIndex !== "-1" && foundIndex !== -1) {
                dataTMP[foundIndex].FlagSeleccionado = true;
                dataTMP[foundIndex] = dataTMP[foundIndex];
            }
        });
    }

    //}
    $tableTecnologia.bootstrapTable({
        data: dataTMP,
        rowStyle: function (row, index) {
            var classes = [
                'bg-blue',
                'bg-green',
                'bg-orange',
                'bg-yellow',
                'soContainer'
            ];

            if (row.FlagSO) {
                return {
                    classes: classes[4]
                };
            }
            return {
                css: {
                    color: 'black'
                }
            };
        }
    });
    $(".form-control.format-relevancia.bloq-element").each((i, e) => SetItems(DATA_RELEVANCIA, $(`#${e.name}`), TEXTO_SELECCIONE));

    $.each(RELACION_DETALLE_EDIT_SO, function (i, item) {
        $(`#cbRelevanciaEquipo${item.TecnologiaId || item.Id}`).val(RELEVANCIA_ALTA);
        //$(`#cbRelevanciaEquipo${item.TecnologiaId || item.Id}`).removeClass("bloq-element");
    });

    $.each(RELACION_DETALLE_EDIT_COMPONENTE, function (i, item) {
        $(`#txtComponente${item.TecnologiaId || item.Id}`).prop("disabled", true);
    });

    $('#tblRegistroTecnologia tbody tr.soContainer').addClass("bloq-element");


    //$.each(RELACION_DETALLE_EDIT, function (i, item) {
    //    $(`#cbRelevanciaEquipo${item.TecnologiaId}`).val(item.RelevanciaId);
    //    $(`#cbRelevanciaEquipo${item.TecnologiaId}`).removeClass("bloq-element");
    //});

}
function InitAutocompletarAplicacion($searchBox, $IdBox, $container, valor) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Aplicacion" + "/GetAplicacionRelacionarByFiltro?filtro=" + request.term,
                    //data: JSON.stringify({
                    //    filtro: request.term
                    //}),
                    //dataType: "json",
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_APLICACION = data;
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else {
                return response(true);
            }
        },
        focus: function (event, ui) {
            //$searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.label);
            if (valor === 1) {
                obtenerEquiposByAppVinculo(ui.item.Id);
                //LimpiarValidateErrores($("#formAppVin"));
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}
function InitAutocompletarTecnologia($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Tecnologia" + "/GetTecnologiaByClave?filtro=" + request.term,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        DATA_TECNOLOGIA = data;
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else {
                return response(true);
            }
        },
        focus: function (event, ui) {
            //$searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.label);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarEquipo($searchBox, $IdBox, $container, URL) {
    $searchBox.autocomplete({
        minLength: 4,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/${URL}?filtro=${request.term}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        DATA_EQUIPO = data;
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else {
                return response(true);
            }
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.label);
            FiltrarEquipoTecnologia();

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function ExisteAplicacion() {
    let estado = false;
    //let nombre = $("#txtAplicacion").val();
    let Id = $("#hdAplicacionId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Aplicacion" + `/ExisteAplicacionRelacionar?Id=${Id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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
function ExisteTecnologia() {
    let estado = false;
    //let nombre = $("#txtTecnologia").val();
    let Id = $("#hdTecnologiaId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Tecnologia" + `/ExisteTecnologia?Id=${Id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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
function ExisteEquipo() {
    let estado = false;
    //let nombre = $("#txtEquipo").val();
    let Id = $("#hdEquipoId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Relacion" + `/ExisteEquipo?Id=${Id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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
/* TIEMPO DE ESPERA SUPERADO */

function ExisteRelacionEquipo() {
    let estado = false;
    let id = $("#hdId").val();
    let codigoAPT = $("#hdAplicacionId").val();
    let ambienteId = $("#cbAmbiente").val();
    let equipoId = $("#hdEquipoId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteRelacionEquipo?id=${id}&codigoAPT=${codigoAPT}&ambienteId=${ambienteId}&equipoId=${equipoId}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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

function ExisteRelacionTecnologia() {
    let estado = false;
    let id = $("#hdId").val();
    let codigoAPT = $("#hdAplicacionId").val();
    let tecnologiaId = $("#hdTecnologiaId").val();
    let equipoId = null; //$("#hdEquipoId").val();
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteRelacionTecnologia?id=${id}&codigoAPT=${codigoAPT}&tecnologiaId=${tecnologiaId}&equipoId=${equipoId}`,
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
function ValidarRelacionUnica() {
    let estado = false;
    let opc = $("#cbTipo").val();
    switch (opc) {
        case TIPO.TIPO_EQUIPO:
            estado = ExisteRelacionEquipo();
            break;
        case TIPO.TIPO_TECNOLOGIA:
            estado = ExisteRelacionTecnologia();
            break;
    }

    //if ($("#cbTipo").val() === TIPO.TIPO_EQUIPO) {
    //    estado = ExisteRelacionEquipo();
    //} else if ($("#cbTipo").val() === TIPO.TIPO_TECNOLOGIA) {
    //    estado = ExisteRelacionTecnologia();
    //}

    return estado;
}

function irAplicacionVinculada() {
    LimpiarValidateErrores($("#formAppVin"));
    $("#txtAppBase").val('');
    $("#txtAppVinculo").val('');
    $("#cbEquipoVin").val(-1);
    $("#txtDetAppVin").val('');
    $("#MdAppVin").modal(opcionesModal);
}

function obtenerEquiposByAppVinculo(codigo) {
    //console.log(Id);
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Relacion" + `/ListarEquiposByAplicacion?codigoAPT=${codigo}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //estado = dataObject;
                    SetItems(dataObject, $("#cbEquipoVin"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function validarFormAppVin() {

    $.validator.addMethod("distintoCodigo", function (value, element) {
        let estado = true;
        let appBaseId = $("#hdAplicacionId").val();
        let appVinculoId = $("#hdAppVinculoId").val();

        if ($.trim(value) !== "" && $.trim(appBaseId) !== "0" && $.trim(appVinculoId) !== "0") {
            estado = appBaseId !== appVinculoId ? true : false;
            return estado;
        }

        return estado;
    });

    $("#formAppVin").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtAppBase: {
                requiredSinEspacios: true,
                distintoCodigo: true
            },
            txtAppVinculo: {
                requiredSinEspacios: true,
                distintoCodigo: true
            },
            cbEquipoVin: {
                requiredSelect: true
            },
            txtDetAppVin: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtAppBase: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
                distintoCodigo: "Debes seleccionar una aplicación diferente"
                //existeAplicacion: String.Format("{0} seleccionada no existe.", "La aplicación")
            },
            txtAppVinculo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
                distintoCodigo: "Debes seleccionar una aplicación diferente"
            },
            cbEquipoVin: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el equipo")
            },
            txtDetAppVin: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el recurso relacionado")
            }
        }
    });
}

function guardarAplicacionVinculada() {
    if ($("#formAppVin").valid()) {

        $("#btnRegAppVin").button("loading");

        var appVin = {};
        appVin.Id = 0;//($("#hIdTipo").val() === "") ? 0 : parseInt($("#hIdTipo").val());
        appVin.CodigoAPT = $("#hdAppBaseId").val();
        appVin.VinculoCodigoAPT = $("#hdAppVinculoId").val();
        appVin.EquipoId = $("#cbEquipoVin").val();
        appVin.DetalleVinculo = $("#txtDetAppVin").val();

        $.ajax({
            url: URL_API_VISTA + "/RegistrarAplicacionVinculada",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(appVin),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        ListarRegistros();
                        toastr.success("Registrado correctamente", TITULO_MENSAJE);
                    }
                }
            },
            complete: function () {
                $("#btnRegAppVin").button("reset");
                //$("#txtBusTipo").val('');               
                $("#MdAppVin").modal('hide');
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}


function irModalTecnologia() {
    LimpiarValidateErrores($("#formAddTec"));
    $("#txtFabricanteTec").val('');
    $("#txtNomTec").val('');
    $("#txtVerTec").val('');
    $("#txtClaveTecnologia").val('');
    $("#cbDomTec, #txtSubTec").val("-1");

    $("#MdAddTec").modal(opcionesModal);
}

function validarFormAddTec() {

    $.validator.addMethod("existeClaveTecnologia", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            let estado = false;
            estado = !ExisteClaveTecnologia();
            return estado;
        }
        return estado;
    });

    $("#formAddTec").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtFabricanteTec: {
                requiredSinEspacios: true
            },
            txtNomTec: {
                requiredSinEspacios: true
            },
            txtVerTec: {
                requiredSinEspacios: true
            },
            txtClaveTecnologia: {
                existeClaveTecnologia: true
            },
            cbDomTec: {
                requiredSelect: true
            },
            txtSubTec: {
                requiredSelect: true
            }
        },
        messages: {
            txtFabricanteTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el fabricante")
            },
            txtNomTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtVerTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la versión")
            },
            txtClaveTecnologia: {
                existeClaveTecnologia: "Clave de la tecnología ya existe."
            },
            cbDomTec: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el dominio")
            },
            txtSubTec: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el subdominio")
            }
        }
    });
}

function ExisteClaveTecnologia() {
    let estado = true;
    let clave = encodeURIComponent($("#txtClaveTecnologia").val());
    let flagActivo = FLAG_ACTIVO_TECNOLOGIA;

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Tecnologia" + `/ExisteClaveTecnologia?clave=${clave}&id=${null}&flagActivo=${flagActivo}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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

function guardarAddTec() {
    if ($("#formAddTec").valid()) {

        $("#btnRegTec").button("loading");

        var tec = {};
        tec.Id = 0;//($("#hIdTec").val() === "") ? 0 : parseInt($("#hIdTec").val());
        tec.Activo = true;
        tec.EstadoTecnologia = ESTADO_TECNOLOGIA.REGISTRADO;
        tec.ClaveTecnologia = $("#txtClaveTecnologia").val();
        //Tab 1
        tec.Nombre = $("#txtNomTec").val();
        tec.Descripcion = ""; /*$("#txtDesTec").val();*/
        tec.Versiones = $("#txtVerTec").val();
        tec.Fabricante = $("#txtFabricanteTec").val();
        tec.FamiliaId = 1; /*$("#hFamTecId").val(); */ //FAMILIA GENERAL ID = 1
        tec.TipoTecnologiaId = 3; /*$("#cbTipTec").val();*/
        tec.FlagFechaFinSoporte = true; /*$("#cbFlagFecSop").prop("checked");*/
        //tec.FlagFechaFinSoporte = $("#cbFlagFecSop").prop("checked");
        tec.Fuente = 1; /* tec.FlagFechaFinSoporte ? $("#cbFuenteTec").val() : null; */
        tec.FechaLanzamiento = null; /*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecLanTec").val()) : null) : null;*/
        tec.FechaExtendida = null;/*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecExtTec").val()) : null) : null;*/
        tec.FechaFinSoporte = null;/*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecSopTec").val()) : null) : null;*/
        tec.FechaAcordada = null;/*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecIntTec").val()) : null) : null;*/
        tec.FechaCalculoTec = 3;/*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? $("#cbFecCalTec").val() : null) : null;*/
        tec.ComentariosFechaFin = ""; /*$("#txtComTec").val(); */
        tec.Existencia = 1; /*$("#cbExisTec").val();*/
        tec.Facilidad = 3; /*$("#cbFacAcTec").val();*/
        tec.Vulnerabilidad = 0;/*$("#txtVulTec").val();*/
        tec.CasoUso = "";/*$("#txtCusTec").val();*/
        tec.Requisitos = ""; /*$("#txtReqHSTec").val();*/
        tec.Compatibilidad = ""; /*$("#txtCompaTec").val();*/
        tec.Aplica = ""; /*$("#txtApliTec").val();*/
        tec.FlagAplicacion = false; /*$("#cbFlagApp").prop("checked"); */
        tec.CodigoAPT = null; /*tec.FlagAplicacion ? $("#hdIdApp").val() : null;*/

        //Tab 2
        tec.SubdominioId = $("#txtSubTec").val(); /*$("#hIdSubTec").val();*/
        tec.EliminacionTecObsoleta = null;/*$("#hIdTecObs").val() === "" ? null : parseInt($("#hIdTecObs").val());*/
        tec.RoadmapOpcional = null; /*$.trim($("#txtElimTec").val()) === "" || $("#hIdTecObs").val() != "" ? null : $("#txtElimTec").val();*/
        tec.Referencias = "*"; /*$("#txtRefTec").val();*/
        tec.PlanTransConocimiento = "*"; /*$("#txtPlanTransTec").val();*/
        tec.EsqMonitoreo = "*";/*$("#txtEsqMonTec").val();*/
        tec.LineaBaseSeg = "*"; /*$("#txtLinSegTec").val();*/
        tec.EsqPatchManagement = "*"; /*$("#txtPatManTec").val();*/

        //Tab 3
        tec.Dueno = "*"; /*$("#txtDueTec").val();*/
        tec.EqAdmContacto = "*";/*$("#txtEqAdmTec").val();*/
        tec.GrupoSoporteRemedy = "*";/*$("#txtGrupRemTec").val();*/
        tec.ConfArqSeg = "*"; /*$("#txtConfArqSegTec").val();*/
        tec.ConfArqTec = "*"; /*$("#txtConfArqTec").val();*/
        tec.EncargRenContractual = "*"; /*$("#txtRenConTec").val();*/
        tec.EsqLicenciamiento = "*"; /*$("#txtEsqLinTec").val();*/
        tec.SoporteEmpresarial = "*"; /*$("#txtSopEmpTec").val();*/
        tec.ListAutorizadores = [];/*$tblAutTec.bootstrapTable('getData');*/
        tec.ItemsRemoveAutId = [];/*ItemsRemoveAutId;*/

        tec.FlagCambioEstado = true;

        $.ajax({
            url: URL_API + "/Tecnologia",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(tec),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                var data = result;
                if (data > 0) {
                    //let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
                    //if ((archivoId == 0 && $("#txtNomDiagCasoUso").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                    //    UploadFile($("#flDiagCasoUso"), CODIGO_INTERNO, data, archivoId);
                    //}
                    bootbox.alert({
                        size: "sm",
                        title: TITULO_MENSAJE,
                        message: "Registrado correctamente",
                        callback: function () { /* your callback code */ }
                    });
                }
            },
            complete: function () {
                //mdAddOrEditTec(false);
                $("#MdAddTec").modal('hide');
                $("#btnRegTec").button("reset");
                //$("#txtBusTec").val('');
                //$("#cbFilDom").val(-1);
                //$("#cbFilSub").val(-1);
                //$table.bootstrapTable('refresh');
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function getSubdominiosByDomCb(_domId, $cbSub) {
    var domId = _domId;

    $cbSub.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $.ajax({
        url: URL_API + "/Tecnologia" + "/Subdominios/" + domId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            data = result;
            $cbSub.find("option:gt(0)").remove();

            $.each(data, function (i, item) {
                $cbSub.append($('<option>', {
                    value: item.Id,
                    text: item.Nombre
                }));
            });
        },
        complete: function () {
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function SetItemsCustom(data, cbx) {
    var $cb = cbx;
    $cb.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $cb.find("option:gt(0)").remove();

    $.each(data, function (i, item) {
        $cb.append($('<option>', {
            value: item.Id,
            text: item.Nombre
        }));
    });
}

function InitAutocompletarEquipoFiltro($searchBox, $IdBox, $container, valor, URL) {
    $searchBox.autocomplete({
        minLength: 4,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/${URL}?filtro=${request.term}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        DATA_EQUIPO = data;
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else {
                return response(true);
            }
        },
        focus: function (event, ui) {
            //$searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.label);
            if (valor === 1) {
                FiltrarEquipoTecnologia();
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}