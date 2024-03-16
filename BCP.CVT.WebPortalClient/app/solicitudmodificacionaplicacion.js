var $table = $("#tbl-solicitudes");
var $tblAtributoApp = $("#tblAtributoApp");
var $tblAtributoMod = $("#tblAtributoMod");
var $tblComentarios = $("#tblComentarios");
var URL_API_VISTA = URL_API + "/Solicitud";
var DATA_EXPORTAR = {};
var CODIGO_INTERNO = 0;
var IdsRemoveItem = [];
var IdsRemoveItemModulo = [];
var ARQUITECTO_COMBO = [];

var DATOS_RESPONSABLE = {};
var TIPO_SOLICITUD_APP = { CREACION: 1, MODIFICACION: 2, ELIMINACION: 3 };
var TIPO_COMENTARIO = { OBSERVACION: 1, COMENTARIO: 2 };
const TIPO_INPUT_PORTAFOLIO = { TextBox: 1, ListBox: 2 };
const TITULO_MENSAJE = "Solicitud de modificación";
const NO_APLICA = "NO APLICA";
const IDS_CAMPOS_RESPONSABLES = [
    "18",
    "15",
    "14",
    "19",
    "33",
    "37"
];
var ESTADO_SOLICITUD_APP = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var ESTADO_SOLICITUD_ARR = [ESTADO_SOLICITUD_APP.REGISTRADO, ESTADO_SOLICITUD_APP.PROCESOREVISION, ESTADO_SOLICITUD_APP.APROBADO, ESTADO_SOLICITUD_APP.OBSERVADO];
var ULTIMO_TIPO_INPUT = {};
const DATA_RELACIONES = [
    {
        Codigo: "rls01",
        IdsElementos: "11|12|42",
        ListBoxPadre: "ddlAreaBIAN",
        IdListBoxPadre: "11",
        ListBoxAll: [
            {
                Id: "11",
                Nombre: "Área de negocio BIAN",
                ddlHtml: "ddlAreaBIAN"
            },
            {
                Id: "12",
                Nombre: "Dominio de Negocio BIAN",
                ddlHtml: "ddlDominioBIAN"
            },
            {
                Id: "42",
                Nombre: "Plataforma de negocio BCP",
                ddlHtml: "ddlPlataformaBCP"
            }
        ]
    },
    {
        Codigo: "rls02",
        IdsElementos: "4|5|7|8",
        ListBoxPadre: "ddlGerenciaCentral",
        IdListBoxPadre: "4",
        ListBoxAll: [
            {
                Id: "4",
                Nombre: "Gerencia Central",
                ddlHtml: "ddlGerenciaCentral"
            },
            {
                Id: "5",
                Nombre: "División",
                ddlHtml: "ddlDivision"
            },
            {
                Id: "7",
                Nombre: "Área",
                ddlHtml: "ddlArea"
            },
            {
                Id: "8",
                Nombre: "Unidad orgánica / Tribu",
                ddlHtml: "txtTribu"
            }
        ]
    },
    {
        Codigo: "rls03",
        IdsElementos: "13|184",
        ListBoxPadre: "ddlJefaturaATI",
        IdListBoxPadre: "13",
        ListBoxAll: [
            {
                Id: "13",
                Nombre: "Jefatura equipo ATI",
                ddlHtml: "ddlJefaturaATI"
            },
            {
                Id: "184",
                Nombre: "Arquitecto TI",
                ddlHtml: "ddlArquitectoTI"
            }
        ]
    }
];

$(function () {
    initUpload($('#txtNomArchivo'));
    setBlankLbl($("#txtResponsable"), $("#lbl1"));
    InitAutocompletarBuilder($("#txtAplicacionFiltro"), $("#hdAplicacionFiltroId"), ".containerAplicacion", "/Aplicacion/GetAplicacionAprobadaByFiltro?filtro={0}");
    InitAutocompletarBuilderV2($("#txtAplicacion"), $("#hdAplicacionId"), $("#hdIdApp"), ".containerFormAplicacion", "/Aplicacion/GetAplicacionAprobadaByFiltro?filtro={0}");
    InitAutocompletarBuilderV3($("#txtAtributoApp"), $("#hdAtributoAppId"), ".atributoAplicacion", "/Solicitud/GetColumnaAplicacionByFiltro?filtro={0}&IdsTipoFlujo={1}");
    InitAutocompletarBuilderUnidad($("#txtTribu"), null, ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro?filtro={0}&filtroPadre={1}&soPcUsuarioList={2}", "");
    //InitAutocompletarBuilder($("#txtAtributoMod"), $("#hdAtributoModId"), ".moduloContainer", "/Solicitud/GetColumnaModuloByFiltro?filtro={0}");
    //$("#ddlModulo").change(ddlModulo_change);

    $("#btnAddItem").click(addItem);
    $("#cbFilEstado").val(-1);
    ShowHideBuilderInput(null);

    setDefaultHd($("#txtAplicacionFiltro"), $("#hdAplicacionFiltroId"));
    bhAutocompleteAplicacion($("#txtAplicacion"), $("#hdAplicacionId"));
    bhAutocompleteAtributo($("#txtAtributoApp"), $("#hdAtributoAppId"));
    InitddlChange();

    $("#btnIrModificar").click(IrCrearSolicitudModificacion);

    validarForm();
    listarRegistros();
});

function InitddlChange() {
    $("#ddlAreaBIAN").change(DdlAreaBian_Change);
    $("#ddlJefaturaATI").change(DdlJefaturaAti_Change);
    $("#ddlGerenciaCentral").change(DdlGerencia_Change);
    $("#ddlDivision").change(DdlDivision_Change);
    $("#ddlArea").change(DdlArea_Change);
}

function DdlAreaBian_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        InitSelectBuilder(ddlVal, $("#ddlDominioBIAN"), "/Aplicacion/ConfiguracionPortafolio/GetDominioBianByFiltro");
        InitSelectBuilder(ddlVal, $("#ddlPlataformaBCP"), "/Aplicacion/ConfiguracionPortafolio/GetPlataformaBcpByFiltro");
    } else {
        SetItems([], $("#ddlDominioBIAN"), TEXTO_SELECCIONE);
        SetItems([], $("#ddlPlataformaBCP"), TEXTO_SELECCIONE);
    }
}

function DdlJefaturaAti_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        //let ddlEstadoAplicacion = $("#ddlEstado").val() || "";
        //let flagEstado = ddlEstadoAplicacion === "Eliminada";
        let flagEstado = false;
        InitSelectBuilder(ddlVal, $("#ddlArquitectoTI"), "/Aplicacion/ConfiguracionPortafolio/GetArquitectoTiByFiltro", "", true, flagEstado);
    } else {
        SetItems([], $("#ddlArquitectoTI"), TEXTO_SELECCIONE);
    }
}

function DdlGerencia_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        InitSelectBuilder(ddlVal, $("#ddlDivision"), "/Aplicacion/ConfiguracionPortafolio/GetDivisionByFiltro");
        SetItems([], $("#ddlArea"), TEXTO_SELECCIONE);
        $("#txtTribu").val("");
    } else {
        SetItems([], $("#ddlDivision"), TEXTO_SELECCIONE);
        SetItems([], $("#ddlArea"), TEXTO_SELECCIONE);
        $("#txtTribu").val("");
    }
}

function DdlDivision_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        InitSelectBuilder(ddlVal, $("#ddlArea"), "/Aplicacion/ConfiguracionPortafolio/GetAreaByFiltro");
    }
}

function DdlArea_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        $("#txtTribu").autocomplete("destroy");
        InitAutocompletarBuilderUnidad($("#txtTribu"), null, ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro?filtro={0}&filtroPadre={1}", ddlVal);
    }
}

function ddlModulo_change() {
    var valorDDL = $(this).val();
    if (valorDDL !== "-1") {
        console.log("Todo");
    }
}

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
    $("#txtNombreAplicacion").val("");
    $("#flArchivo").val("");
    $("#hdArchivoId").val("");
    $("#hdAplicacionId").val("");
    $("#txtNomArchivo").val(TEXTO_SIN_ARCHIVO);
    $("#hIdSolicitud").val("");
    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
    IdsRemoveItem = [];
    IdsRemoveItemModulo = [];
    $tblAtributoApp.bootstrapTable("destroy");
    $tblAtributoApp.bootstrapTable();
    //$tblAtributoMod.bootstrapTable("destroy");
    //$tblAtributoMod.bootstrapTable();
    //$("#ddlModulo").val("-1");
    //$("#txtAtributoMod").val("");
    //$("#txtValorNuevoMod").val("");
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
    $.validator.addMethod("existeCodigoInterfaz", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (ULTIMO_TIPO_INPUT.TipoInputId === TIPO_INPUT_PORTAFOLIO.TextBox && ULTIMO_TIPO_INPUT.Id === "59") {
            if (valor !== "" && valor.length > 1) {
                return !ExisteCodigoInterfaz(valor);
            }
        }
        
        return estado;
    });

    $.validator.addMethod("requiredSinEspaciosAtributo", function (value, element) {
        let retorno = true;
        let hdAtributo = $.trim($("#hdAtributoAppId").val());
        if (hdAtributo !== "" && hdAtributo !== "0") {
            if (ULTIMO_TIPO_INPUT.TipoInputId === TIPO_INPUT_PORTAFOLIO.TextBox) {
                if (IDS_CAMPOS_RESPONSABLES.includes(ULTIMO_TIPO_INPUT.Id)) {
                    retorno = true;
                } else {
                    retorno = $.trim(value) !== "";
                }
            }
        }
        return retorno;
    });

    $.validator.addMethod("requiredSinEspaciosAtributo2", function (value, element) {
        let retorno = true;
        let hdAtributo = $.trim($("#hdAtributoAppId").val());
        if (hdAtributo !== "" && hdAtributo !== "0") {
            if (ULTIMO_TIPO_INPUT.TipoInputId === TIPO_INPUT_PORTAFOLIO.TextBox) {
                if (IDS_CAMPOS_RESPONSABLES.includes(ULTIMO_TIPO_INPUT.Id)) {
                    retorno = $.trim(value) !== "";
                } else {
                    retorno = true;
                }
            }
        }
        return retorno;
    });

    $.validator.addMethod("requiredSelectAtributo", function (value, element) {
        let retorno = true;
        let hdAtributo = $.trim($("#hdAtributoAppId").val());
        if (hdAtributo !== "" && hdAtributo !== "0") {
            if (ULTIMO_TIPO_INPUT.TipoInputId === TIPO_INPUT_PORTAFOLIO.ListBox) {
                let iRelacion = DATA_RELACIONES.find(x => x.IdsElementos.split("|").includes(ULTIMO_TIPO_INPUT.Id.toString())) || null;
                if (iRelacion !== null) {
                    retorno = true;
                } else {
                    retorno = value !== null && value !== "-1";
                }
            }
        }

        return retorno;
    });

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
        let codigoApt = $.trim($("#hdAplicacionId").val());
        if (codigoApt !== "" && codigoApt !== "0")
            estado = !ExisteSolicitudByCodigoAPT(codigoApt);

        return estado;
    });

    $.validator.addMethod("requiredAtributo", function (value, element) {
        let minAtributo = $tblAtributoApp.bootstrapTable("getData");
        return minAtributo.length > 0;
    });

    $.validator.addMethod("existeMatricula", function (value, element) {
        let estado = true;
        let matricula = $.trim(value);
        if (matricula !== "" && matricula !== NO_APLICA && matricula.length > 2) {
            return ExisteMatricula(matricula);
        }
        return estado;
    });

    $("#formAddOrEditArq").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
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
            //txtComentarios: {
            //    requiredSinEspacios: true
            //},
            //txtAtributoApp: {
            //    requiredSinEspacios: true
            //},
            //txtValorNuevo: {
            //    requiredSinEspaciosAtributo: true,
            //    existeCodigoInterfaz: true
            //},
            //msjTable: {
            //    requiredAtributo: true
            //},
            //ddlValorNuevo: {
            //    requiredSelectAtributo: true
            //},
            //txtResponsable: {
            //    requiredSinEspaciosAtributo2: true,
            //    existeMatricula: true
            //},
            //ddlDivision: {
            //    requiredSelect: true
            //},
            //ddlArea: {
            //    requiredSelect: true
            //},
            //ddlGerenciaCentral: {
            //    requiredSelect: true
            //},
            //txtTribu: {
            //    requiredSinEspacios: true
            //}
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
            //txtComentarios: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "los comentarios de tu solicitud")
            //},
            //txtAtributoApp: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el atributo a modificar")
            //},
            //txtValorNuevo: {
            //    requiredSinEspaciosAtributo: String.Format("Debes ingresar {0}.", "el nuevo valor"),
            //    existeCodigoInterfaz: "El código interfaz ya existe"
            //},
            //msjTable: {
            //    requiredAtributo: String.Format("Debes registrar {0}.", "un atributo como mínimo")
            //},
            //ddlValorNuevo: {
            //    requiredSelectAtributo: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //txtResponsable: {
            //    requiredSinEspaciosAtributo2: String.Format("Debes ingresar {0}.", "la nueva matrícula"),
            //    existeMatricula: "No fue posible ubicar la matrícula"
            //},
            //ddlDivision: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //ddlArea: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //ddlGerenciaCentral: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            //},
            //txtTribu: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la unidad")
            //}
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtAplicacion" || element.attr('name') === "txtAtributoApp"
                || element.attr('name') === "txtResponsable") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function ExisteCodigoInterfaz(filtro) {
    let estado = false;
    let Id = 0;//$("#hdAplicacionId").val() === "" ? 0 : $("#hdAplicacionId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Aplicacion/GestionAplicacion/ExisteCodigoInterfaz?filtro=${filtro}&id=${Id}`,
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

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
		ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
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
            //DATA_EXPORTAR.TipoSolicitud = 2;
            DATA_EXPORTAR.TipoSolicitud = TIPO_SOLICITUD_APP.MODIFICACION;
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
    let btn2 = "";

    let btn1 = `<a href="ModificarAplicacion?Id=${row.AplicacionId}&Vista=5" title="Ver detalle aplicación"><i class="glyphicon glyphicon-share table-icon"></i></a>`;

    if (row.EstadoSolicitud === ESTADO_SOLICITUD_APP.OBSERVADO || row.EstadoSolicitud === ESTADO_SOLICITUD_APP.PROCESOREVISION) {
        btn2 = `<a href="javascript:verComentarios(${row.Id})" title="Ver comentarios"><span class="icon icon-comment-o"></span></a>`;
    }

    if (row.EstadoSolicitud === ESTADO_SOLICITUD_APP.REGISTRADO) {
        btn2 = `<a href="javascript:irCambiarEstadoSolicitud(${row.Id})" title='Enviar a validación'><span class="icon icon-rotate-right"></span></a>`;
    }

    if (row.EstadoSolicitud === ESTADO_SOLICITUD_APP.APROBADO) {
        btn1 = "";
        btn2 = `<a href="javascript:verComentarios(${row.Id})" title="Ver comentarios"><span class="icon icon-comment-o"></span></a>`;
    }

    return btn1.concat("&nbsp;&nbsp;", btn2);
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
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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
                //$md.modal(opcionesModal);
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

//function AddSolicitud() {
//    $("#titleFormArq").html("Nueva solicitud de modificación de atributos de aplicación");
//    $("#hIdArq").val("");
//    $("#txtAtributoApp").val("");
//    $(".solicitud-app").removeClass("bloq-element");
//    $(".divAtributoAplicacion").addClass("bloq-element");
//    $("#btnRegistrarSol").show();
//    $("#btnConfirmarSol").show();
//    $("#btnResponderSol").hide();
//    $(".divObservacion").hide();
//    $('#tabModulo a:first').tab('show');
//    MdAddOrEditArquetipo(true);
//}

function irModificarAplicacion(e) {
    $("#formAddOrEditArq").valid();
    let elementValid = $("#formAddOrEditArq").validate().errorList.find(x => x.element.id == '');
    if (elementValid == null) {
        let href = $(e.currentTarget).attr('data-href');
        let id = $(e.currentTarget).attr('data-id-aplicacion');
        location.href = `${href}?Id=${id}&Vista=5`;
    }
}

function AddSolicitud() {
    $("#titleFormArq").html("Nueva solicitud de modificación de atributos de aplicación");
    $("#hIdArq").val("");
    $("#txtAtributoApp").val("");
    $(".solicitud-app").removeClass("bloq-element");
    $(".divAtributoAplicacion").addClass("bloq-element");

    //CAMBIOS RONALD
    $(".solicitud-app .form-group:not(:first)").hide();
    $(".divAtributoAplicacion").hide();

    //CAMBIOS RONALD
    //$("#btnRegistrarSol").show();
    //$("#btnConfirmarSol").show();
    $("#btnIrModificar").show();
    $("#btnRegistrarSol").hide();
    $("#btnConfirmarSol").hide();

    $("#btnResponderSol").hide();
    $(".divObservacion").hide();
    $('#tabModulo a:first').tab('show');
    MdAddOrEditArquetipo(true);
}

function guardarAddOrEdit() {
    $(".form-control").removeClass("ignore");
    $(".atributo-app").addClass("ignore");
    $(".atributo-mod").addClass("ignore");
    sendDataSolicitudAPI($("#formAddOrEditArq"), $("#btnRegistrarSol"), ESTADO_SOLICITUD_APP.REGISTRADO, "Registrado correctamente");
}

function confirmarSolicitud() {
    $(".form-control").removeClass("ignore");
    $(".atributo-app").addClass("ignore");
    $(".atributo-mod").addClass("ignore");

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
                    //$(".form-control").removeClass("ignore");
                    //$(".atributo-app").addClass("ignore");
                    sendDataSolicitudAPI($("#formAddOrEditArq"), $("#btnConfirmarSol"), ESTADO_SOLICITUD_APP.PROCESOREVISION, "Registrado y enviado correctamente");
                }
            }
        });
    }
   
}

function sendDataSolicitudAPI($form, $btn, EstadoSolicitudId, Mensaje) {
    if ($form.valid()) {
        $btn.button("loading");

        var solicitud = {};
        solicitud.Id = ($("#hIdSolicitud").val() === "") ? 0 : parseInt($("#hIdSolicitud").val());
        solicitud.CodigoAplicacion = $("#hdAplicacionId").val().trim();
        solicitud.Observaciones = $("#txtComentarios").val();
        solicitud.EstadoSolicitud = EstadoSolicitudId;
        solicitud.TipoSolicitud = TIPO_SOLICITUD_APP.MODIFICACION;
        solicitud.FlagAprobacion = true;
        solicitud.AtributoDetalle = $tblAtributoApp.bootstrapTable("getData") || null;
        //solicitud.ModuloDetalle = $tblAtributoMod.bootstrapTable("getData") || null;
        solicitud.RemoveAtributoIds = IdsRemoveItem || [];
        //solicitud.RemoveAtributoModuloIds = IdsRemoveItemModulo || [];

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            data: JSON.stringify(solicitud),
			beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
                let data = result;
                if (data > 0) {
                    let estadoFile = ($("#txtNomArchivo").val() !== TEXTO_SIN_ARCHIVO && $("#flArchivo").val() !== "") ? true : false;
                    if (estadoFile) {
                        UploadFileSolicitud($("#flArchivo"), data);
                    }
                    toastr.success(Mensaje, TITULO_MENSAJE);
                } else {
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

function UploadFileSolicitud($fileInput, EntidadId) {
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

function opcionesFormatter(value, row, index) {
    let btnTrash = `<a title='Eliminar item' href='javascript: void(0)' onclick='removeItem(${row.AtributoAplicacionId})'><i class="glyphicon glyphicon-trash"></i></a>`;
    return btnTrash;
}

function opcionesFormatterModulo(value, row, index) {
    let btnTrash = `  <a class='btn btn-danger' href='javascript: void(0)' onclick='removeItemModulo(${row.AtributoModuloId})'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return btnTrash;
}

function removeItem(Id) {
    let iRelacion = DATA_RELACIONES.find(x => x.IdsElementos.split("|").includes(Id.toString())) || null;
    if (iRelacion !== null) {
        let arrRemover = iRelacion.IdsElementos.split("|");
        for (var i in arrRemover) {
            let element = arrRemover[i];
            if (!IdsRemoveItem.includes(element))
                IdsRemoveItem.push(element);
        }
        
        $tblAtributoApp.bootstrapTable('remove', {
            field: 'AtributoAplicacionId', values: arrRemover
        });
    } else {
        if (!IdsRemoveItem.includes(Id))
            IdsRemoveItem.push(Id);

        $tblAtributoApp.bootstrapTable('remove', {
            field: 'AtributoAplicacionId', values: [Id]
        });
    }
}

function removeItemModulo(Id) {
    IdsRemoveItemModulo.push(Id);
    $tblAtributoMod.bootstrapTable('remove', {
        field: 'AtributoModuloId', values: [Id]
    });
}

function EsInputRelacion(Id) {
    let iRelacion = DATA_RELACIONES.find(x => x.IdsElementos.split("|").includes(Id)) || null;
    return iRelacion !== null ? iRelacion : null;
}

function addItem() {
    debugger;
    $(".form-control").addClass("ignore");
    $(".atributo-app").removeClass("ignore");

    let itemId = $("#hdAtributoAppId").val();
    let itemRelacion = EsInputRelacion(itemId);
    if (itemRelacion !== null) {
        //$(".input-relaciones").removeClass("ignore");
        //$(".input-relaciones").children().not(`.${itemRelacion.Codigo}`).addClass("ignore");
        //CAMBIO RONALD
        $(":input.input-relaciones").removeClass("ignore");
        $(":input.input-relaciones").not(`.${itemRelacion.Codigo}`).addClass("ignore");
    } else {
        //$(".input-relaciones").addClass("ignore");
        //CAMBIO RONALD
        $(":input.input-relaciones").addClass("ignore");
    }

    if ($("#formAddOrEditArq").valid()) {
        debugger;
        var newItem = $tblAtributoApp.bootstrapTable('getRowByUniqueId', itemId);
        if (newItem === null) {

            let iRelacion = DATA_RELACIONES.find(x => x.IdsElementos.split("|").includes(itemId)) || null;
            if (iRelacion !== null) {
                let dataItems = iRelacion.ListBoxAll;

                $.each(dataItems, function (i, item) {
                    $tblAtributoApp.bootstrapTable('append', {
                        AtributoAplicacionId: item.Id,
                        AtributoAplicacionStr: item.Nombre,
                        ValorNuevo: $.trim($(`#${item.ddlHtml}`).val())
                    });
                });

            } else {
                debugger;
                $tblAtributoApp.bootstrapTable('append', {
                    //Id: idx,
                    AtributoAplicacionId: parseInt($("#hdAtributoAppId").val()),
                    AtributoAplicacionStr: $.trim($("#txtAtributoApp").val()),
                    ValorNuevo: setValorNuevo(itemId)
                });
            }
        }

        $("#txtAtributoApp").val("");
        $("#txtValorNuevo").val("");
        $("#ddlValorNuevo").val("-1");

        ShowHideBuilderInput(null);
    }
}

function setValorNuevo(idAtributo) {
    let valor = "";
    if (ULTIMO_TIPO_INPUT.TipoInputId === TIPO_INPUT_PORTAFOLIO.TextBox) {
        if (IDS_CAMPOS_RESPONSABLES.includes(idAtributo)) {
            valor = $.trim($("#txtResponsable").val());
        } else {
            valor = $.trim($("#txtValorNuevo").val());
        }
    } else if (ULTIMO_TIPO_INPUT.TipoInputId === TIPO_INPUT_PORTAFOLIO.ListBox) {
        valor = $("#ddlValorNuevo").val();
    }
    return valor;
}

function addItemModulo() {
    $(".form-control").addClass("ignore");
    $(".atributo-mod").removeClass("ignore");

    if ($("#formAddOrEditArq").valid()) {
        let itemId = $("#hdAtributoModId").val();

        var newItem = $tblAtributoMod.bootstrapTable('getRowByUniqueId', itemId);
        if (newItem === null) {

            $tblAtributoMod.bootstrapTable('append', {
                //Id: idx,
                AtributoModuloId: parseInt($("#hdAtributoModId").val()),
                AtributoModuloStr: $.trim($("#txtAtributoMod").val()),
                ValorNuevo: $.trim($("#txtValorNuevoMod").val()),
                ModuloId: $("#ddlModulo").val(),
                ModuloStr: $("option:selected", "#ddlModulo").text()
            });
        }

        $("#txtAtributoMod").val("");
        $("#txtValorNuevoMod").val("");
        $("#ddlModulo").val("-1");
    }
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
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject;

                    waitingDialog.hide();
                    $('#tabModulo a:first').tab('show');
                    $(".divAtributoAplicacion").removeClass("bloq-element");
                    MdAddOrEditArquetipo(true);
                    $("#hIdSolicitud").val(data.Id);
                    $("#txtAplicacion").val(data.NombreAplicacion);
                    $("#hdAplicacionId").val(data.CodigoAplicacion);
                    $("#txtComentarios").val(data.Observaciones);

                    if (data.NombreArchivos !== null && data.NombreArchivos !== "") {
                        $("#txtNomArchivo").val(data.NombreArchivos);
                        $("#btnDescargarFile").show();
                        $("#btnEliminarFile").show();
                    }

                    let dataAtributos = data.AtributoDetalle;
                    if (dataAtributos.length > 0) {
                        $tblAtributoApp.bootstrapTable("destroy");
                        $tblAtributoApp.bootstrapTable({
                            data: dataAtributos,
                            pagination: true,
                            pageNumber: 1,
                            pageSize: 10
                        });
                    }

                    //let dataModulos = data.ModuloDetalle;
                    //$("#ddlModulo").val(dataModulos.length > 0 ? dataModulos[0].ModuloId : "-1");
                    //$("#ddlModulo").val("-1");
                    //if (dataModulos.length > 0) {
                    //    $tblAtributoMod.bootstrapTable("destroy");
                    //    $tblAtributoMod.bootstrapTable({
                    //        data: dataModulos,
                    //        pagination: true,
                    //        pageNumber: 1,
                    //        pageSize: 10
                    //    });
                    //}
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
                $(".form-control").removeClass("ignore");
                $(".atributo-app").addClass("ignore");
                $(".atributo-mod").addClass("ignore");

                sendDataSolicitudAPI($("#formAddOrEditArq"), $("#btnResponderSol"), ESTADO_SOLICITUD_APP.PROCESOREVISION, "Confirmado y respondido correctamente");
            }
        }
    });
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
        contentType: "application/json; charset=utf-8",
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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
                sendDataEstadoAPI(null, "Se envió a revisión la solicitud correctamente", ESTADO_SOLICITUD_APP.PROCESOREVISION, TIPO_SOLICITUD_APP.MODIFICACION, "");
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
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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

function InitAutocompletarBuilderV2($searchBox, $IdBox, $IdApp, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) {
                    $IdBox.val("0");
                    $IdApp.val("0");
                    $("#hdIdsTipoFlujo").val("");
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
            //$("#btnIrModificar").removeAttr("data-id-aplicacion");
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                $IdApp.val(ui.item.IdAplicacion);
                $(".divAtributoAplicacion").removeClass("bloq-element");
                $("#hdIdsTipoFlujo").val(ui.item.TipoFlujoId);
                //$("#btnIrModificar").attr("data-id-aplicacion", ui.item.IdAplicacion);
            }
            
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Descripcion + "</font></a>").appendTo(ul);
    };
}

function InitAutocompletarBuilderV3($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term, $("#hdIdsTipoFlujo").val());

                if ($IdBox !== null) $IdBox.val("0");
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
                let _item = ui.item;
                $IdBox.val(_item.Id);
                ShowHideBuilderInput(_item);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Descripcion + "</font></a>").appendTo(ul);
    };
}

function ShowHideBuilderInput(item) {
    if (item !== null) {
        ULTIMO_TIPO_INPUT = {
            Id: item.Id,
            TipoInputId: item.TipoInputId
        };

        switch (item.TipoInputId) {
            case TIPO_INPUT_PORTAFOLIO.TextBox:
                if (IDS_CAMPOS_RESPONSABLES.includes(item.Id)) {
                    $(".input-tb-responsable").show();
                    $(".input-tb").hide();
                } else {
                    $(".input-tb-responsable").hide();
                    $(".input-tb").show();
                }

                $(".input-lb").hide();
                $(".input-relaciones").hide();
                $(".add-button").show();

                break;
            case TIPO_INPUT_PORTAFOLIO.ListBox:
                var itemRelacion = DATA_RELACIONES.find(x => x.IdsElementos.split("|").includes(item.Id)) || null;
                if (itemRelacion !== null) {
                    ShowHideRelacion(itemRelacion.Codigo);
                    InitListBoxBuilder(itemRelacion.IdListBoxPadre, $(`#${itemRelacion.ListBoxPadre}`), "/Aplicacion/ConfiguracionPortafolio/GetDataInputPortafolioByConfiguracion");
                    $(`#${itemRelacion.ListBoxPadre}`).trigger("change");

                } else {
                    $(".input-tb").hide();
                    $(".input-tb-responsable").hide();
                    $(".input-relaciones").hide();
                    $(".input-lb").show();

                    //Cargar el combo
                    InitListBoxBuilder(item.Id, $("#ddlValorNuevo"), "/Aplicacion/ConfiguracionPortafolio/GetDataInputPortafolioByConfiguracion");
                }
                $(".add-button").show();

                break;
        }

    } else {
        $(".input-tb").hide();
        $(".input-tb-responsable").hide();
        $(".input-lb").hide();
        $(".add-button").hide();

        $(".input-relaciones").hide();
        $(".input-relaciones").addClass("ignore");
    }
}

function ShowHideRelacion(showClass) {
    $(".input-relaciones").show();
    $(".input-relaciones").children().show();
    $(".input-relaciones").children().not(`.${showClass}`).hide();
    $(".input-relaciones").children(`.${showClass}`).show();
}

function GetModuloByCodigoAPT(codigoAPT) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GetModuloByCodigoAPT?codigoAPT=${codigoAPT}`,
		beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject;
                    SetItems(data, $("#ddlModulo"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function bhAutocompleteAplicacion($textBox, $hdId) {
    $textBox.keyup(function () {
        if ($.trim($(this).val()) === "") {
            $hdId.val("0");
            $(".divAtributoAplicacion").addClass("bloq-element");
        }
    });
}

function bhAutocompleteAtributo($textBox, $hdId) {
    $textBox.keyup(function () {
        if ($.trim($(this).val()) === "") {
            $hdId.val("0");
            ShowHideBuilderInput(null);
        }
    });
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

function ValidarMatricula1() {
    $(".form-control").addClass("ignore");
    $(".input1").removeClass("ignore");

    if ($("#formAddOrEditArq").valid()) {
        $("#lbl1").html(DATOS_RESPONSABLE.Nombres);
        RegistrarMatricula(DATOS_RESPONSABLE);
    }
}

function ExisteMatricula(Matricula) {
    let estado = false;
    let matricula = Matricula;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_LOGIN_SERVER + `/ObtenerDatosUsuario?Matricula=${matricula}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    DATOS_RESPONSABLE = dataObject;
                    let EstadoUser = dataObject.Estado;
                    estado = EstadoUser !== 1 ? false : true;
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

function InitSelectBuilder(filtro, $ddl, urlGet, prefiltro1 = "", flagArquitecto = false, flagEstadoApp = false) { //Si es eliminado
    if (filtro !== null && filtro !== "-1") {
        let _prefiltro1 = $.trim(prefiltro1) !== "" ? `filtro1=${prefiltro1}&` : "";
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: URL_API + `${urlGet}?${_prefiltro1}filtro=${filtro}`,
			beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        let data = dataObject;

                        if (flagArquitecto) {

                            if (!flagEstadoApp) data = data.filter(x => x.FlagActivo);
                            data = data.map(x => x.Descripcion) || [];

                            ARQUITECTO_COMBO = data;
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

function InitAutocompletarBuilderUnidad($searchBox, $IdBox, $container, urlController, filtroPadre) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term, filtroPadre);

                if ($IdBox !== null) $IdBox.val("0");
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
            if ($IdBox !== null) $IdBox.val(ui.item.Id);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Descripcion + "</font></a>").appendTo(ul);
    };
}

function IrCrearSolicitudModificacion() {
    if ($("#formAddOrEditArq").valid()) {
        let idAplicacion = parseInt($("#hdIdApp").val());
        let url_redirect = `ModificarAplicacion?Id=${idAplicacion}&Vista=5`;
        window.location.href = url_redirect;
    }
}