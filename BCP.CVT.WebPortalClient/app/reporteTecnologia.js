var $table = $("#tbl-tecAprob");
var $tblAutTec = $("#tblAutTec");
var $tblArqAprob = $("#tblArqAprob");
var $tblTecEq = $("#tblTecEq");
var $tblTecnologiaVinculacion = $("#tblTecnologiaVinculacion");
var $tblTecEqList = $("#tblTecEqList");
var $tblTecEqGeneral = $("#tblTecEqGeneral");

var ItemsRemoveAutId = [];
var ItemsRemoveTecEqId = [];
var ItemsRemoveTecArqId = [];
var ItemsRemoveTecVincId = [];

var URL_API_VISTA = URL_API + "/Tecnologia";
var urlApiSubdom = URL_API + "/Subdominio";
var urlApiTipo = URL_API + "/Tipo";
var urlApiFam = URL_API + "/Familia";
const URL_API_VISTA_DASH = URL_API + "/Dashboard/Tecnologia";
//var URL_API_USUARIO = URL_API + "/Usuario";

var ItemNumeros = [0, 1, 2, 3, 4, 5];
var locale = { OK: 'OK', CONFIRM: 'Observar', CANCEL: 'Cancelar' };
var placeholderObs = "Comentarios asociados a la observación";
var DATA_SUBDOMINIO = [];
var DATA_TECNOLOGIA = [];
var DATA_APLICACION = [];

var DATA_EXPORTAR = {};
var DATA_EXPORTAR_TEC_EQ = {};
var ESTADO = { Vigente: 1, Deprecado: 2, Obsoleto: 3 };
var ESTADO_TECNOLOGIA = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var CODIGO_INTERNO = 0;
var TITULO_MENSAJE = "Gestión de las Tecnologías";
var TITULO_MENSAJE_APROBACION = "Aprobar tecnología";
var TITULO_MENSAJE_OBSERVACION = "Observar tecnología";
var TITULO_MENSAJE_EQUIVALENCIA = "Equivalencia de tecnología";
var DATOS_RESPONSABLE = {};

var TIPO_METODO = { APROBAR: 1, GUARDARCAMBIOS: 2, OBSERVAR: 3 };
var ACCESO_DIRECTO = { BASICO: "1", CICLOVIDA: "2", RIESGO: "3", CLASIFICACION: "4", RESPONSABILIDADES: "5", EQUIVALENCIAS: "6", FAMILIA: "7" };
var COMBO_SELECTED = "";
var FECHA_CALCULO = { EXTENDIDA: "2", SOPORTE: "3", INTERNA: "4" };

var DATA_INPUT_OPCIONAL = {};
var FLAG_ACTIVO_TECNOLOGIA = 0;
const arrMultiSelect = [
    { SelectId: "#cbFilDom", DataField: "Dominio" },
    { SelectId: "#cbFilSub", DataField: "Subdominio" },
    { SelectId: "#cbFilEst", DataField: "EstadoTecnologia" },
    { SelectId: "#cbFilTipoTec", DataField: "TipoTec" },
    { SelectId: "#cbFilEstObs", DataField: "EstadoObs" }
];
$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    //validarFormCambiarEstado();
    //validarFormMigrarEquivalencias();
    //InitFecha();
    //initUpload($('#txtNomDiagCasoUso'));

    $tblAutTec.bootstrapTable();
    $tblArqAprob.bootstrapTable();
    $tblTecEq.bootstrapTable();
    $tblTecnologiaVinculacion.bootstrapTable();

    //setItemsCb($("#cbDomTec"), "/Dominio/ConSubdominio");

    //$("#cbDomTec").on('change', function () {
    //    getSubdominiosByDomCb(this.value, $("#txtSubTec"));
    //});

    $("#cbFilDom").on('change', function () {
        getSubdominiosByDomCbMultiple($("#cbFilSub"));
    });

    //$("#cbTipTec").on('change', function () {
    //    LimpiarValidateErrores($("#formAddOrEditTec"));
    //    var valRiesgo = $("option:selected", this).text() === "Estándar" ? "0" : "5";
    //    $("#cbRiesgTec").val(valRiesgo);
    //});

    //FormatoCheckBox($("#divFlagFecSop"), "cbFlagFecSop");
    //$("#cbFlagFecSop").change(FlagFecSop_Change);

    //FormatoCheckBox($("#divFlagApp"), "cbFlagApp");
    //$("#cbFlagApp").change(FlagApp_Change);

    //FormatoCheckBox($("#divSiteEstandar"), 'cbSiteEstandar');
    //FormatoCheckBox($("#divEstado"), "cbEstado");
    //$("#cbFuenteTec").on('change', cbFecSopManual_Change);

    //Confirmar familia
    //FormatoCheckBox($("#divConfirmarFamilia"), 'cbFlagConfirmarFamilia');
    //$("#cbFlagConfirmarFamilia").change(FlagConfirmarFamilia_Change);

    //validarAddOrEditFormTec();
    //validarFormEquivalencias();

    //$("#cbFecCalTec").change(FechaCalculo_Change);

    listarTecSTD();

    cargarCombos();
    CargarCombos2();

    //setDefaultHd($("#txtTecReceptora"), $("#hdTecReceptora"));

    //InitAutocompletarFamilia($("#txtFamTec"), $("#hFamTecId"), $(".famContainer"));
    InitAutocompletarFamilia($("#cbFilFam"), null, $(".famfilContainer"));

    //InitAutocompletarAplicacion($("#txtApp"), $("#hdIdApp"), $(".appContainer"));
    //InitAutocompletarArquetipo($("#txtArqTec"), $("#hdIdArq"), $(".arqContainer"));
    //InitAutocompletarTecnologia($("#txtElimTec"), $("#hIdTecObs"), $(".elimContainer"));
    //InitAutocompletarTecnologiaVinculada($("#txtTecnologiaVinculadad"), $("#hIdTecnologiaVinculada"), $(".tecVinculadaContainer"));
    //InitAutocompletarTecnologiaEquivalente($("#txtNomTecEq"), null, $(".eqContainer"));

    InitAutocompletarTecnologiaForBusqueda($("#txtBusTec"), null, $(".searchContainer"), null, true);
    //InitAutocompletarTecnologiaForBusqueda($("#txtTecReceptora"), $("#hdTecReceptora"), $(".tecReceptoraContainer"), $("#hIdTec"), true);

    //$("#txtFabricanteTec, #txtNomTec, #txtVerTec").keyup(function () {
    //    $("#txtClaveTecnologia").val(String.Format("{0} {1} {2}", $.trim($("#txtFabricanteTec").val()), $.trim($("#txtNomTec").val()), $.trim($("#txtVerTec").val())));
    //});
    //$("#txtMatAutTec").keyup(function () {
    //    if ($.trim($(this).val()) === "") {
    //        LimpiarValidateErrores($("#formAddOrEditTec"));
    //    }
    //});
});

function FlagConfirmarFamilia_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        if ($.trim($("#txtFamTec").val()) !== "" && $("#hFamTecId").val() !== "0") {
            $("#txtFamTec").prop("disabled", true);
        } else {
            $("#cbFlagConfirmarFamilia").prop('checked', false);
            $("#cbFlagConfirmarFamilia").bootstrapToggle('off');
        }
    } else {
        $("#txtFamTec").prop("disabled", false);
    }
}

function FechaCalculo_Change() {
    var combo = $(this).val();
    if (combo !== "-1") {
        LimpiarValidateErrores($("#formAddOrEditTec"));
        switch (combo) {
            case FECHA_CALCULO.EXTENDIDA:
                $(".fechaClass").addClass("ignore");
                $(".fechaExt").removeClass("ignore");
                break;
            case FECHA_CALCULO.SOPORTE:
                $(".fechaClass").addClass("ignore");
                $(".fechaSop").removeClass("ignore");
                break;
            case FECHA_CALCULO.INTERNA:
                $(".fechaClass").addClass("ignore");
                $(".fechaInt").removeClass("ignore");
                break;
        }
    }
}

function InitFecha() {
    $("#dpFecLanTec-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
    $("#dpFecExtTec-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#dpFecSopTec-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#dpFecIntTec-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
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

function addTecSTD() {
    MostrarModalCompleto();

    $(".tabRegSTD").addClass("tec");

    $(".btnRegTecSTD").show();
    $(".btnConTec").show();
    $(".btnAprTec").hide();
    $(".btnObsTec").hide();
    $(".btnGuardarTec").hide();

    $("#titleFormTec").html("Nueva Tecnología");
    $("#hIdTec").val(''); //TODO
    $("#hActTec").val(true);
    $tblAutTec.bootstrapTable('destroy');
    $tblAutTec.bootstrapTable();
    mdAddOrEditTec(true);
    $("#AppContainer").addClass("tec");
    //$("#cbFuenteTec").trigger("change");
    $("#FecSopManualContainer").removeClass("tec");

    $('a[data-toggle="tab"]')[0].click();
}

function LimpiarFiltros() {
    $("#txtBusTec, #txtFilCodigo, #txtFilAplica, #txtFilDueno, #txtFilEquipo, #cbFilFam").val("");
    $("#cbFilDom, #cbFilSub, #cbFilEst, #cbFilEsFecSop, #cbFilTipoTec").val("-1");
    $("#cbFilEstObs").val(null);
}

function ObtenerDataFormularioGeneral(tec, EstadoTecnologiaId) {
    //var tec = {};
    tec.Id = ($("#hIdTec").val() === "") ? 0 : parseInt($("#hIdTec").val());
    tec.Activo = $("#hActTec").val();
    tec.EstadoTecnologia = EstadoTecnologiaId;
    tec.ClaveTecnologia = $("#txtClaveTecnologia").val();

    //Tab 1
    tec.Nombre = $("#txtNomTec").val() || "";
    tec.Descripcion = $("#txtDesTec").val() || "";
    tec.Versiones = $("#txtVerTec").val() || "";
    //Nuevo Flag 
    tec.FlagConfirmarFamilia = $("#cbFlagConfirmarFamilia").prop("checked");
    tec.FamiliaId = $("#hFamTecId").val();
    tec.TipoTecnologiaId = $("#cbTipTec").val();
    tec.Fabricante = $("#txtFabricanteTec").val();
    tec.FlagFechaFinSoporte = $("#cbFlagFecSop").prop("checked");
    tec.Fuente = tec.FlagFechaFinSoporte ? $("#cbFuenteTec").val() : null;
    tec.FechaLanzamiento = tec.FlagFechaFinSoporte ? ($("#dpFecLanTec").val() !== "" ? castDate($("#dpFecLanTec").val()) : null) : null;
    tec.FechaExtendida = tec.FlagFechaFinSoporte ? ($("#dpFecExtTec").val() !== "" ? castDate($("#dpFecExtTec").val()) : null) : null;
    tec.FechaFinSoporte = tec.FlagFechaFinSoporte ? ($("#dpFecSopTec").val() !== "" ? castDate($("#dpFecSopTec").val()) : null) : null;
    tec.FechaAcordada = tec.FlagFechaFinSoporte ? ($("#dpFecIntTec").val() !== "" ? castDate($("#dpFecIntTec").val()) : null) : null;
    tec.FechaCalculoTec = tec.FlagFechaFinSoporte ? $("#cbFecCalTec").val() : null;
    tec.ComentariosFechaFin = $("#txtComTec").val();
    tec.Existencia = $("#cbExisTec").val();
    tec.Facilidad = $("#cbFacAcTec").val();
    tec.Riesgo = $("#cbRiesgTec").val();
    tec.Vulnerabilidad = $("#txtVulTec").val();
    tec.CasoUso = $("#txtCusTec").val() || "";
    tec.Requisitos = $("#txtReqHSTec").val() || "";
    tec.Compatibilidad = $("#txtCompaTec").val() || "";
    tec.Aplica = $("#txtApliTec").val() || "";
    tec.FlagAplicacion = $("#cbFlagApp").prop("checked");
    tec.CodigoAPT = tec.FlagAplicacion ? $("#hdIdApp").val() : null;

    //Tab 2
    tec.SubdominioId = $("#txtSubTec").val();
    tec.EliminacionTecObsoleta = $("#hIdTecObs").val() === "" ? null : parseInt($("#hIdTecObs").val());
    tec.RoadmapOpcional = $.trim($("#txtElimTec").val()) === "" || $("#hIdTecObs").val() !== "" ? null : $("#txtElimTec").val();
    tec.Referencias = $("#txtRefTec").val() || "";
    tec.PlanTransConocimiento = $("#txtPlanTransTec").val() || "";
    tec.EsqMonitoreo = $("#txtEsqMonTec").val() || "";
    tec.LineaBaseSeg = $("#txtLinSegTec").val() || "";
    tec.EsqPatchManagement = $("#txtPatManTec").val() || "";

    //Tab 3
    tec.Dueno = $("#txtDueTec").val() || "";
    tec.EqAdmContacto = $("#txtEqAdmTec").val() || "";
    tec.GrupoSoporteRemedy = $("#txtGrupRemTec").val() || "";
    tec.ConfArqSeg = $("#txtConfArqSegTec").val() || "";
    tec.ConfArqTec = $("#txtConfArqTec").val() || "";
    tec.EncargRenContractual = $("#txtRenConTec").val() || "";
    tec.EsqLicenciamiento = $("#txtEsqLinTec").val() || "";
    tec.SoporteEmpresarial = $("#txtSopEmpTec").val() || "";

    //tec.ListAutorizadores = $tblAutTec.bootstrapTable('getData') || [];
    //tec.ItemsRemoveAutId = ItemsRemoveAutId || [];

    tec.ItemsRemoveAutIdSTR = ItemsRemoveAutId.join("|") || "";
    tec.ItemsAddAutorizadorSTR = $tblAutTec.bootstrapTable('getData').map(x => x.MatriculaBanco).join("|") || "";

    return tec;
}

function guardarAddOrEditTecSTD() {
    $(".form-control").removeClass("ignore");
    $(".matricula-auto").addClass("ignore");
    $(".cbAprob").addClass("ignore");

    $("#cbFecCalTec").trigger("change");

    if ($("#formAddOrEditTec").valid()) {

        $("#btnRegTecSTD").button("loading");

        let tec = {};
        tec = ObtenerDataFormularioGeneral(tec, ESTADO_TECNOLOGIA.APROBADO);
        tec.FlagCambioEstado = true;
        //tec.Id = ($("#hIdTec").val() === "") ? 0 : parseInt($("#hIdTec").val());
        //tec.Activo = $("#hActTec").val();
        //tec.EstadoTecnologia = 1;
        //tec.ClaveTecnologia = $("#txtClaveTecnologia").val();

        ////Tab 1
        //tec.Nombre = $("#txtNomTec").val();
        //tec.Descripcion = $("#txtDesTec").val() || "";
        //tec.Versiones = $("#txtVerTec").val();
        //tec.FamiliaId = $("#hFamTecId").val();
        //tec.TipoTecnologiaId = $("#cbTipTec").val();
        //tec.Fabricante = $("#txtFabricanteTec").val();
        //tec.FlagFechaFinSoporte = $("#cbFlagFecSop").prop("checked");
        //tec.Fuente = tec.FlagFechaFinSoporte ? $("#cbFuenteTec").val() : null;
        //tec.FechaLanzamiento = tec.FlagFechaFinSoporte ? ($("#dpFecLanTec").val() !== "" ? castDate($("#dpFecLanTec").val()) : null) : null;
        //tec.FechaExtendida = tec.FlagFechaFinSoporte ? ($("#dpFecExtTec").val() !== "" ? castDate($("#dpFecExtTec").val()) : null) : null;
        //tec.FechaFinSoporte = tec.FlagFechaFinSoporte ? ($("#dpFecSopTec").val() !== "" ? castDate($("#dpFecSopTec").val()) : null) : null;
        //tec.FechaAcordada = tec.FlagFechaFinSoporte ? ($("#dpFecIntTec").val() !== "" ? castDate($("#dpFecIntTec").val()) : null) : null;
        //tec.FechaCalculoTec = tec.FlagFechaFinSoporte ? $("#cbFecCalTec").val() : null;
        //tec.ComentariosFechaFin = $("#txtComTec").val();
        //tec.Existencia = $("#cbExisTec").val();
        //tec.Facilidad = $("#cbFacAcTec").val();
        //tec.Vulnerabilidad = $("#txtVulTec").val();
        //tec.CasoUso = $("#txtCusTec").val() || "";
        //tec.Requisitos = $("#txtReqHSTec").val();
        //tec.Compatibilidad = $("#txtCompaTec").val();
        //tec.Aplica = $("#txtApliTec").val();
        //tec.FlagAplicacion = $("#cbFlagApp").prop("checked");
        //tec.CodigoAPT = tec.FlagAplicacion ? $("#hdIdApp").val() : null;

        ////Tab 2
        //tec.SubdominioId = $("#txtSubTec").val(); //$("#hIdSubTec").val();
        //tec.EliminacionTecObsoleta = $("#hIdTecObs").val() === "" ? null : parseInt($("#hIdTecObs").val());
        //tec.RoadmapOpcional = $.trim($("#txtElimTec").val()) === "" || $("#hIdTecObs").val() !== "" ? null : $("#txtElimTec").val();
        //tec.Referencias = $("#txtRefTec").val() || "";
        //tec.PlanTransConocimiento = $("#txtPlanTransTec").val() || "";
        //tec.EsqMonitoreo = $("#txtEsqMonTec").val() || "";
        //tec.LineaBaseSeg = $("#txtLinSegTec").val() || "";
        //tec.EsqPatchManagement = $("#txtPatManTec").val() || "";

        ////Tab 3
        //tec.Dueno = $("#txtDueTec").val() || "";
        //tec.EqAdmContacto = $("#txtEqAdmTec").val() || "";
        //tec.GrupoSoporteRemedy = $("#txtGrupRemTec").val() || "";
        //tec.ConfArqSeg = $("#txtConfArqSegTec").val() || "";
        //tec.ConfArqTec = $("#txtConfArqTec").val() || "";
        //tec.EncargRenContractual = $("#txtRenConTec").val() || "";
        //tec.EsqLicenciamiento = $("#txtEsqLinTec").val() || "";
        //tec.SoporteEmpresarial = $("#txtSopEmpTec").val() || "";
        //tec.ListAutorizadores = $tblAutTec.bootstrapTable('getData') || [];
        //tec.ItemsRemoveAutId = ItemsRemoveAutId || [];

        //tec.UsuarioCreacion = USUARIO.UserName;
        //tec.UsuarioModificacion = USUARIO.UserName;

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(tec),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (result) {
                var data = result;
                if (data > 0) {
                    let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
                    if ((archivoId === 0 && $("#txtNomDiagCasoUso").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                        UploadFile($("#flDiagCasoUso"), CODIGO_INTERNO, data, archivoId);
                    }
                    bootbox.alert({
                        size: "small",
                        title: "Registro",
                        message: "La información se registró con éxito, ten en cuenta que esta acción no inicia ningún proceso de revisión por parte del equipo de Estándares",
                        callback: function () { /* your callback code */ }
                    });
                }
            },
            complete: function () {
                mdAddOrEditTec(false);
                $("#btnRegTecSTD").button("reset");
                LimpiarFiltros();
                listarTecSTD();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    } else {
        toastr.error('Faltan completar campos', TITULO_MENSAJE);
    }
}

function obtenerFamiliaById(FamiliaId) {
    $.ajax({
        url: urlApiFam + "/" + FamiliaId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            $("#cbExisTec").val(result.Existencia);
            $("#cbFacAcTec").val(result.Facilidad);
            $("#cbRiesgTec").val(result.Riesgo);
            $("#txtVulTec").val(result.Vulnerabilidad);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function getFlagEstandar(id) {
    $.ajax({
        url: urlApiTipo + "/ObtenerFlagEstandar/" + id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            var data = result;
            $("#hdFlagEstandarTec").val(data);
        },
        complete: function () {

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function cbFecSopManual_Change() {
    var cbFuente = parseInt($(this).val());
    //debugger;
    LimpiarValidateErrores($("#formAddOrEditTec"));
    if (cbFuente !== 3)
        $("#FecSopManualContainer").addClass("tec");
    else
        $("#FecSopManualContainer").removeClass("tec");
}

function FlagFecSop_Change() {
    var flagFecSop = $(this).prop("checked");//.is(':checked');
    LimpiarValidateErrores($("#formAddOrEditTec"));
    //$(".form-control").removeClass("ignore");
    //$(".matricula-auto").addClass("ignore");
    //$("#formAddOrEditTec").validate().resetForm();
    //$("#formAddOrEditTec").valid();
    if (flagFecSop)
        $("#FecSopContainer").removeClass("tec");
    else
        $("#FecSopContainer").addClass("tec");
}

function FlagApp_Change() {
    var flagApp = $(this).prop("checked");
    LimpiarValidateErrores($("#formAddOrEditTec"));
    if (flagApp)
        $("#AppContainer").removeClass("tec");
    else
        $("#AppContainer").addClass("tec");
}

function getSubdominiosByDom(_domId) {
    var domId = _domId;
    var data = "";
    var subTags = [];
    $.ajax({
        url: URL_API_VISTA + "/Subdominios/" + domId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            data = result;
            $.each(data, function (key, val) {
                var item = {};
                item.Id = val.Id;
                item.Nombre = val.Nombre;
                item.value = val.Nombre;
                subTags.push(item);
            });
            DATA_SUBDOMINIO = subTags;
        },
        complete: function () {
            autocompletarSubdominios(subTags, $('#txtSubTec'), $("#hIdSubTec"), $(".subtecContainer"));
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function autocompletarSubdominios(itemsX, inputX, inputHX, containerX) {
    //var $searchBox = inputX;
    var $inputX = inputX;
    var $inputHX = inputHX;
    var $containerX = containerX;
    $inputX.autocomplete({
        appendTo: $containerX,
        minLength: 0,
        source: itemsX,
        focus: function (event, ui) {
            //$inputX.val(ui.item.label);
            $inputX.val(ui.item.Nombre);
            return false;
        },
        select: function (event, ui) {
            //$inputHX.val(ui.item.value);
            //$inputX.val(ui.item.label);
            $inputHX.val(ui.item.Id);
            $inputX.val(ui.item.Nombre);
            getMatriculaDueno(ui.item.Id);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Nombre + "</font></a>")
            .appendTo(ul);
    };
}

function getMatriculaDueno(id) {
    $.ajax({
        url: urlApiSubdom + "/ObtenerMatricula/" + id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            var data = result;
            $("#txtDueTec").val(data);
        },
        complete: function () {

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function validarAddOrEditFormTec() {

    $.validator.addMethod("existeMatricula", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            estado = ExisteMatricula(value);
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("existeAplicacion", function (value, element) {
        if ($("#cbFlagApp").prop("checked")) {
            let estado = false;
            if ($.trim(value) !== "" && $.trim(value).length >= 3) {
                //let estado = false;
                estado = ExisteAplicacion();
                //debugger;
                return estado;
            }
        }
        return true;
    });

    $.validator.addMethod("existeArquetipo", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            estado = ExisteArquetipo();
            return estado;
        }
    });

    $.validator.addMethod("existeSubdominio", function (value, element) {
        let estado = false;
        let Id = $("#hIdSubTec").val();
        let first_data = DATA_SUBDOMINIO.find(x => x.Id.toString() === Id && x.Nombre === value) || null;
        if (first_data !== null) estado = true;
        return estado;
    });

    $.validator.addMethod("existeTecnologia", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            estado = ExisteTecnologia($("#hIdTecObs"));
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("existeFamilia", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "" && $.trim(value).length >= 3) {
            estado = ExisteFamilia();
            return estado;
        }
        return estado;
    });


    $.validator.addMethod("requiredMinMatricula", function (value, element) {
        let minMatricula = $tblAutTec.bootstrapTable('getData');
        let estado = minMatricula.length > 0 ? true : false;
        return estado;
    });

    $.validator.addMethod("decimal_vulnerabilidad", function (value, element) {
        let regex = new RegExp(regexDecimal);
        if (regex.test(value)) {
            if (value < 6.0) return true;
        }
        return false;
    });

    $.validator.addMethod("fecha_tecnologia", function (value, element) {
        if ($("#cbFlagFecSop").prop("checked")) {
            if (parseInt($("#cbFuenteTec").val()) === 3) {
                return $.trim(value) !== "";
            }
        }
        return true;
    });

    $.validator.addMethod("combo_fecha_tecnologia", function (value, element) {
        if ($("#cbFlagFecSop").prop("checked")) {
            value = value || null;
            return value !== "-1" && value !== null;
        }
        return true;
    });

    $.validator.addMethod("manual_fecha_tecnologia", function (value, element) {
        if ($("#cbFlagFecSop").prop("checked")) {
            if (parseInt($("#cbFuenteTec").val()) === 3) {
                value = value || null;
                return value !== "-1" && value !== null;
            }
        }
        return true;
    });

    $.validator.addMethod("flagActivoAplicacion", function (value, element) {
        if ($("#cbFlagApp").prop("checked")) {
            return $.trim(value) !== "";
        }
        return true;
    });

    $.validator.addMethod("requiereCodigoTecnologia", function (value, element) {
        let estadoTecActual = $("#hEstTec").val(); // TODO
        console.log(estadoTecActual);
        if ($("option:selected", $("#cbTipTec")).text() === "Estándar" && estadoTecActual === ESTADO_TECNOLOGIA.PROCESOREVISION) {
            return $.trim(value) !== "";
        }

        return true;
    });

    $.validator.addMethod("existeClaveTecnologia", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            let estado = false;
            estado = !ExisteClaveTecnologia();
            return estado;
        }
        return estado;
    });

    $("#formAddOrEditTec").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomTec: {
                requiredSinEspacios: true
            },
            txtVerTec: {
                requiredSinEspacios: true
            },
            txtDesTec: {
                requiredSinEspacios: true
            },
            //msjValidTbl: {
            //    requiredMinMatricula: true
            //},
            //dpFecLanTec: {
            //    fecha_tecnologia: true
            //},
            dpFecExtTec: {
                fecha_tecnologia: true
            },
            dpFecSopTec: {
                fecha_tecnologia: true
            },
            dpFecIntTec: {
                fecha_tecnologia: true
            },
            cbFuenteTec: {
                combo_fecha_tecnologia: true
            },
            cbFecCalTec: {
                combo_fecha_tecnologia: true
            },
            cbExisTec: {
                requiredSelect: true
            },
            cbFacAcTec: {
                requiredSelect: true
            },
            cbRiesgTec: {
                requiredSelect: true
            },
            txtVulTec: {
                requiredSinEspacios: true,
                decimal_vulnerabilidad: true
            },
            txtCusTec: {
                requiredSinEspacios: true
            },
            txtApp: {
                flagActivoAplicacion: true,
                //requiredSinEspacios: true,
                existeAplicacion: true
            },
            cbDomTec: {
                requiredSinEspacios: true
            },
            txtSubTec: {
                requiredSelect: true
                //requiredSinEspacios: true,
                //existeSubdominio: true
            },
            txtElimTec: {
                //requiredSinEspacios: true,
                existeTecnologia: false
            },
            //txtPlanTransTec: {
            //    requiredSinEspacios: true
            //},
            //txtEsqMonTec: {
            //    requiredSinEspacios: true
            //},
            //txtLinSegTec: {
            //    requiredSinEspacios: true
            //},
            //txtPatManTec: {
            //    requiredSinEspacios: true
            //},
            txtDueTec: {
                //requiredSinEspacios: true,
                existeMatricula: true
            },
            //txtEqAdmTec: {
            //    requiredSinEspacios: true
            //},
            //txtGrupRemTec: {
            //    requiredSinEspacios: true
            //},
            txtConfArqSegTec: {
                //requiredSinEspacios: true,
                existeMatricula: true
            },
            txtConfArqTec: {
                //requiredSinEspacios: true,
                existeMatricula: true
            },
            //txtRenConTec: {
            //    requiredSinEspacios: true
            //},
            //txtEsqLinTec: {
            //    requiredSinEspacios: true
            //},
            //txtSopEmpTec: {
            //    requiredSinEspacios: true
            //},
            txtMatAutTec: {
                //requiredSinEspacios: true,
                existeMatricula: true
            },
            txtFamTec: {
                requiredSinEspacios: true,
                existeFamilia: true
            },
            cbTipTec: {
                requiredSelect: true
            },
            //cbTipo: {
            //    requiredSelect: true
            //},
            txtArqTec: {
                existeArquetipo: false
            },
            txtCodAsigTec: {
                requiereCodigoTecnologia: true
            },
            txtFabricanteTec: {
                requiredSinEspacios: true
            },
            txtClaveTecnologia: {
                existeClaveTecnologia: true
            }
        },
        messages: {
            txtNomTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre de la tecnología")
            },
            txtVerTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "las versiones")
            },
            txtDesTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción de la tecnología")
            },
            //msjValidTbl: {
            //    requiredMinMatricula: String.Format("Debes registrar {0}.", "un item")
            //},
            //dpFecLanTec: {
            //    fecha_tecnologia: String.Format("Debes ingresar {0}.", "la fecha de lanzamiento")
            //},
            dpFecExtTec: {
                fecha_tecnologia: String.Format("Debes ingresar {0}.", "la fecha extendida")
            },
            dpFecSopTec: {
                fecha_tecnologia: String.Format("Debes ingresar {0}.", "la fecha fin de soporte")
            },
            dpFecIntTec: {
                fecha_tecnologia: String.Format("Debes ingresar {0}.", "la fecha interna")
            },
            cbFuenteTec: {
                //requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
                combo_fecha_tecnologia: String.Format("Debes seleccionar {0}.", "una fuente")
            },
            cbFecCalTec: {
                combo_fecha_tecnologia: String.Format("Debes seleccionar {0}.", "una fecha para cálculo")
            },
            cbExisTec: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            cbFacAcTec: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            cbRiesgTec: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un item")
            },
            txtVulTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la vulnerabilidad de seguridad"),
                decimal_vulnerabilidad: "Número de 0 a 5. Considerar solo dos decimales."
            },
            txtCusTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el caso de uso")
            },
            txtApp: {
                flagActivoAplicacion: String.Format("Debes ingresar {0}.", "la aplicación"),
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
                existeAplicacion: String.Format("{0} seleccionada no existe.", "La aplicación")
            },
            cbDomTec: {
                requiredSinEspacios: String.Format("Debes seleccionar {0}.", "el dominio")
            },
            txtSubTec: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el subdominio")
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "el subdominio"),
                //existeSubdominio: String.Format("{0} seleccionado no existe.", "el subdominio")
            },
            txtElimTec: {
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "la tecnología obsoleta"),
                existeTecnologia: String.Format("{0} seleccionado no existe.", "La tecnología")
            },
            //txtPlanTransTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el plan de transferencia de conocimiento")
            //},
            //txtEsqMonTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el esquema de monitoreo")
            //},
            //txtLinSegTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la linea base de seguridad")
            //},
            //txtPatManTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la definición del esquema de path management")
            //},
            txtDueTec: {
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "el dueño de la tecnología"),
                existeMatricula: "No fue posible ubicar la matrícula"
            },
            //txtEqAdmTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el equipo de administración y punto de contacto")
            //},
            //txtGrupRemTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el grupo de soporte")
            //},
            txtConfArqSegTec: {
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "la conformidad del arquitecto de seguridad"),
                existeMatricula: "No fue posible ubicar la matrícula"
            },
            txtConfArqTec: {
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "la conformidad del arquitecto de tecnología"),
                existeMatricula: "No fue posible ubicar la matrícula"
            },
            //txtRenConTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el encargado de renovación contractual")
            //},
            //txtEsqLinTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el esquema de licenciamiento")
            //},
            //txtSopEmpTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "el soporte empresarial")
            //},
            txtMatAutTec: {
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "la matrícula"),
                existeMatricula: "No fue posible ubicar la matrícula"
            },
            txtFamTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "una familia"),
                existeFamilia: String.Format("{0} seleccionada no existe.", "la familia")
            },
            cbTipTec: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo de tecnología")
            },
            //cbTipo: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo")
            //},
            txtArqTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el arquetipo"),
                existeArquetipo: String.Format("{0} seleccionado no existe.", "El arquetipo")
            },
            txtCodAsigTec: {
                requiereCodigoTecnologia: String.Format("Debes ingresar {0}.", "el código de tecnología")
            },
            txtFabricanteTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el fabricante")
            },
            txtClaveTecnologia: {
                existeClaveTecnologia: "Clave de la tecnología ya existe."
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "dpFecLanTec" || element.attr('name') === "dpFecExtTec"
                || element.attr('name') === "dpFecSopTec" || element.attr('name') === "dpFecIntTec"
                || element.attr('name') === "txtDueTec" || element.attr('name') === "txtConfArqSegTec"
                || element.attr('name') === "txtConfArqTec" || element.attr('name') === "txtMatAutTec") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function RequiereCodigoTecnologia() {
    let estado = false;
    let TipoId = $("#cbTipTec").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: urlApiTipo + '/ObtenerFlagEstandar/' + TipoId,
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

function validarFormCambiarEstado() {

    $.validator.addMethod("existeEstado", function (value, element) {
        let estadoActual = $("#hEstTec").val();
        let estadoNuevo = $("#cbNueEstTec option:selected").text();
        if (estadoActual !== estadoNuevo)
            return true;
        else
            return false;
    });

    $("#formCambiarEstadoTec").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        onfocusout: false,
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbNueEstTec: {
                requiredSelect: true,
                existeEstado: true
            }
        },
        messages: {
            cbNueEstTec: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el estado"),
                existeEstado: "Estado ya se encuentra registrado."
            }
        }
    });
}

function validarFormEquivalencias() {

    $.validator.addMethod("validarRegistrado", function (value, element) {
        let estado = ValidarEquivalencia();

        return estado;
    });

    $("#formTecByArq").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomTecEq: {
                requiredSinEspacios: true,
                validarRegistrado: true
            }
        },
        messages: {
            txtNomTecEq: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "una equivalencia"),
                validarRegistrado: "La equivalencia ya se encuentra registrada"
            }
        }
    });
}

function mdAddOrEditTec(EstadoMd) {
    limpiarMdAddOrEditTec();
    LimpiarValidateErrores($("#formAddOrEditTec"));
    if (EstadoMd)
        $("#mdAddOrEditTec").modal(opcionesModal);
    else
        $("#mdAddOrEditTec").modal('hide');
}

function limpiarMdAddOrEditTec() {
    //Tab Datos Generales
    $("#txtNomTec, #txtDesTec, #txtVerTec").val('');
    $("#dpFecLanTec, #dpFecExtTec, #dpFecSopTec, #dpFecIntTec, #txtComTec").val('');

    $("#cbExisTec, #cbFacAcTec, #cbRiesgTec").val(-1);
    $("#txtVulTec").val('');

    $("#txtFamTec").val('');
    $("#cbTipTec, #cbFuenteTec").val(-1);

    $("#txtCusTec, #txtReqHSTec, #txtCompaTec, #txtApliTec").val('');

    //Tab Datos Transferencia
    $("#cbDomTec").val(-1);
    $("#txtElimTec, #txtRefTec, #txtPlanTransTec , #txtEsqMonTec, #txtLinSegTec, #txtPatManTec").val('');
    $("#txtSubTec").val(-1);

    //Tab Responsabilidades
    $('#txtDueTec, #txtEqAdmTec, #txtGrupRemTec, #txtConfArqSegTec, #txtConfArqTec, #txtRenConTec, #txtEsqLinTec, #txtSopEmpTec').val('');
    $('#txtAutoTec').val('');

    $("#lblDueno, #lblArquitectoSeg, #lblArquitectoTec").html('');

    //Tab Aprobacion
    $('#cbTipo').val(-1);
    $('#txtCodAsigTec, #txtArqTec, #txtObsTec').val('');
    $('#txtMatAutTec').val('');
    $("#hdIdArq").val("0");
    $("#txtApp").val("");
    $("#hdIdApp").val("0");
    $("#cbFlagFecSop").prop("checked", true);
    $("#cbFlagFecSop").bootstrapToggle("on");
    $("#cbFlagApp").prop("checked", false);
    $("#cbFlagApp").bootstrapToggle("off");
    $("#cbFlagApp").trigger("change");
    $("#cbEstado").prop("checked", true);
    $("#cbEstado").bootstrapToggle("on");
    $("#txtArqTec").val("");
    ItemsRemoveTecArqId = [];
    ItemsRemoveTecVincId = [];
    $tblAutTec.bootstrapTable("destroy");
    $tblAutTec.bootstrapTable({ data: [] });
    $tblArqAprob.bootstrapTable("destroy");
    $tblArqAprob.bootstrapTable({ data: [] });
    $tblTecEq.bootstrapTable("destroy");
    $tblTecEq.bootstrapTable({ data: [] });
    $tblTecnologiaVinculacion.bootstrapTable("destroy");
    $tblTecnologiaVinculacion.bootstrapTable({ data: [] });
    $("#txtClaveTecnologia").val("");
    $("#txtFabricanteTec").val("");
    $("#cbFecCalTec").val(-1);
    $("#txtCodAsigTec").val("");
    $("#txtTecnologiaVinculadad").val("");
    $("#hIdTecnologiaVinculada").val("");

    $("#txtNomDiagCasoUso").val(TEXTO_SIN_ARCHIVO);
    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();

    $("#cbFlagConfirmarFamilia").prop("checked", true);
    $("#cbFlagConfirmarFamilia").bootstrapToggle("on");
}

function buscarTec() {
    listarTecSTD();
}

function getSubdominiosByDomCb(_domId, $cbSub) {
    var domId = _domId;

    $cbSub.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $.ajax({
        url: URL_API_VISTA + "/Subdominios/" + domId,
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

function setItemsCb(cbx, ctrlx) {
    var $cb = cbx;

    $cb.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $.ajax({
        url: URL_API + ctrlx,
        type: "GET",
        dataType: "json",
        success: function (result) {
            var data = result;
            $cb.find("option:gt(0)").remove();

            $.each(data, function (i, item) {
                $cb.append($('<option>', {
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

function listarTecSTD() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/ListarReporteTecnologia",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusTec").val());
            DATA_EXPORTAR.domIds = CaseIsNullSendFilter($("#cbFilDom").val());
            DATA_EXPORTAR.subdomIds = CaseIsNullSendFilter($("#cbFilSub").val());
            DATA_EXPORTAR.casoUso = $("#txtCasoUsoTec").val();
            DATA_EXPORTAR.estadoIds = CaseIsNullSendFilter($("#cbFilEst").val());
            DATA_EXPORTAR.famId = $("#cbFilFam").val();
            DATA_EXPORTAR.fecId = $("#cbFilEsFecSop").val();
            DATA_EXPORTAR.aplica = $("#txtFilAplica").val();
            DATA_EXPORTAR.codigo = $("#txtFilCodigo").val();
            DATA_EXPORTAR.dueno = $("#txtFilDueno").val();
            DATA_EXPORTAR.equipo = $("#txtFilEquipo").val();
            DATA_EXPORTAR.tipoTecIds = CaseIsNullSendFilter($("#cbFilTipoTec").val());
            DATA_EXPORTAR.estObsIds = CaseIsNullSendFilter($("#cbFilEstObs").val());
            DATA_EXPORTAR.flagActivo = FLAG_ACTIVO_TECNOLOGIA;//$("#cbFilEstObs").val();
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

function cambiarEstado(TecId) {
    bootbox.confirm({
        message: "¿Estás seguro que deseas cambiar el estado del registro seleccionado ?",
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
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    type: 'GET',
                    contentType: "application/json; charset=utf-8",
                    url: `${URL_API_VISTA}/CambiarEstado?Id=${TecId}`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("La actualización del registro procedió satisfactoriamente", TITULO_MENSAJE);
                                listarTecSTD();
                            }
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    },
                    complete: function (data) {
                        $("#txtBusTec").val('');
                        $("#cbFilDom").val(-1);
                        $("#cbFilSub").val(-1);
                        waitingDialog.hide();
                    }
                });
            } else {
                //$(`#cbOpcTec${TecId}`).prop('checked', !estado);
            }
        }
    });
}

function formatNombre(value, row, index) {
    //return `<a href="javascript:editarTecSTD(${row.Id}, ${row.Estado})" title="Editar">${value}</a>`;
    return `${value}`;
}

function formatOpcSTD(value, row, index) {
    let style_color = row.Estado === ESTADO_TECNOLOGIA.APROBADO ? 'iconoVerde ' : "iconoRojo ";
    //let type_icon = row.Activo ? "check" : "unchecked";
    //let estado = `<a href="javascript:cambiarEstado(${row.Id})" title="Cambiar estado"><i style="" id="cbOpcTec${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    let estado = '';

    let equivalencia = `  <a href='javascript: void (0)' class="${style_color}" onclick='irEquivalencias(${row.Id}, "${row.Nombre}", "${row.EstadoTecnologiaStr}", ${row.Activo})' title='Equivalencias'>` +
        `<span class="icon icon-list-ul"></span>` +
        `</a >`;

    let estadoTec = `  <a href='javascript: void (0)' class="${style_color}" onclick='irCambiarEstadoTec(${row.Id}, ${row.Estado}, "${row.EstadoTecnologiaStr}", ${row.Activo})' title='Cambiar estado aprobación'>` +
        `<span class="icon icon-rotate-right"></span>` +
        `</a >`;

    let migrarEquivalencia = `  <a href='javascript: void (0)' class="${style_color}" onclick='irMigrarEquivalencias(${row.Id}, ${row.Estado}, "${row.EstadoTecnologiaStr}", ${row.Activo}, ${row.FlagTieneEquivalencias})' title='Migrar equivalencias'>` +
        `<span class="icon icon-exchange"></span>` +
        `</a >`;

    return estado.concat(estadoTec).concat(equivalencia).concat(migrarEquivalencia);
}

function formatAccesoDirecto(value, row, index) {

    //let style_color = row.Estado === ESTADO_TECNOLOGIA.APROBADO ? 'iconoVerde ' : "iconoRojo ";
    let permiso = row.Estado === ESTADO_TECNOLOGIA.APROBADO ? "" : "disabled";

    let combo = ` <select id="cbAccesoDirecto${row.Id}" name="cbAccesoDirecto${row.Id}" onchange='irAccesoDirecto(${row.Id}, "${row.Nombre}", ${row.Estado})' class="form-control" ${permiso}>\
                    <option value = "-1"> -- Seleccione --</option>\
                    <option value = "1">Datos básicos</option>\
                    <option value = "2">Fechas ciclo de vida</option>\
                    <option value = "3">Criterios riesgo</option>\
                    <option value = "4">Clasificación</option>\
                    <option value = "5">Responsabilidades</option>\
                    <option value = "6">Equivalencias</option>\
                    <option value = "7">Familia / Tipo / Estado</option>\
                  </select >`;

    //let icono = `  <a href='javascript: void (0)' class="${style_color}" onclick='irAccesoDirecto(${row.Id}, "${row.Nombre}", ${row.Estado})' title='Acceso directo'>` +
    //    `<span class="glyphicon glyphicon-log-out"></span>` +
    //    `</a >`;
    let icono = "";

    return combo.concat(icono);
}

function MostrarModalCompleto() {
    $("#FecSopContainer").show();
    $(".adBasico").show();
    $(".adRiesgo").show();
    $(".adCicloVida").show();
    $(".adClasificacion").show();
    $(".adResponsabilidad").show();
    $(".adFamilia").show();
    $(".otros").show();
    $(".footerModalTecnologia").show();

    $(".inputOpcional").hide();
}

function irAccesoDirecto(Id, NombreStr, EstadoTecnologiaId) {
    COMBO_SELECTED = String.Format("#cbAccesoDirecto{0}", Id);
    let filtro = $(COMBO_SELECTED).val();

    if (filtro !== "-1") {
        switch (filtro) {
            case ACCESO_DIRECTO.BASICO:
                editarTecSTD(Id, EstadoTecnologiaId);
                $(".otros").hide();

                $(".form-control").addClass("ignore");
                $(".adBasico").removeClass("ignore");

                $(".adBasico").show();
                $(".adRiesgo").hide();
                $(".adCicloVida").hide();
                $(".adClasificacion").hide();
                $(".adResponsabilidad").hide();
                $(".adFamilia").hide();

                $("#FecSopContainer").hide();
                $(".footerModalTecnologia").hide();

                break;
            case ACCESO_DIRECTO.CICLOVIDA:
                editarTecSTD(Id, EstadoTecnologiaId);
                $(".otros").hide();

                $(".form-control").addClass("ignore");
                $(".adCicloVida").removeClass("ignore");

                $("#FecSopContainer").show();
                $(".adCicloVida").show();
                $(".adBasico").hide();
                $(".adRiesgo").hide();
                $(".adClasificacion").hide();
                $(".adResponsabilidad").hide();
                $(".adFamilia").hide();

                if ($("#cbFecCalTec").val() !== "-1") {
                    $("#cbFecCalTec").trigger("change");
                }
                $(".footerModalTecnologia").hide();

                break;
            case ACCESO_DIRECTO.RIESGO:
                editarTecSTD(Id, EstadoTecnologiaId);
                $(".otros").hide();

                $(".form-control").addClass("ignore");
                $(".adRiesgo").removeClass("ignore");

                $(".adRiesgo").show();
                $(".adBasico").hide();
                $(".adCicloVida").hide();
                $(".adClasificacion").hide();
                $(".adResponsabilidad").hide();
                $(".adFamilia").hide();

                $("#FecSopContainer").hide();
                $(".footerModalTecnologia").hide();

                break;
            case ACCESO_DIRECTO.CLASIFICACION:
                editarTecSTD(Id, EstadoTecnologiaId);
                $(".otros").hide();

                $(".form-control").addClass("ignore");
                $(".adClasificacion").removeClass("ignore");

                $(".adBasico").hide();
                $(".adCicloVida").hide();
                $(".adRiesgo").hide();
                $('a[data-toggle="tab"]')[1].click();
                $(".adClasificacion").show();
                $(".adResponsabilidad").hide();
                $(".adFamilia").hide();

                $("#FecSopContainer").hide();
                $(".footerModalTecnologia").hide();

                break;
            case ACCESO_DIRECTO.RESPONSABILIDADES:
                editarTecSTD(Id, EstadoTecnologiaId);
                $(".otros").hide();

                $(".form-control").addClass("ignore");
                $(".adResponsabilidad").removeClass("ignore");

                $(".adBasico").hide();
                $(".adCicloVida").hide();
                $(".adRiesgo").hide();
                $(".adClasificacion").hide();
                $(".adFamilia").hide();
                $('a[data-toggle="tab"]')[2].click();
                $(".adResponsabilidad").show();

                $("#FecSopContainer").hide();
                $(".footerModalTecnologia").hide();

                break;
            case ACCESO_DIRECTO.EQUIVALENCIAS:
                $("#hIdTec").val(Id);
                $("#txtNomTecEq").val('');
                $("#spNomTec").html(NombreStr);
                LimpiarValidateErrores($("#formTecByArq"));
                ItemsRemoveTecEqId = [];

                listarTecnologiasEquivalentes($tblTecEq, $("#mdTecEq"));

                break;
            case ACCESO_DIRECTO.FAMILIA:
                editarTecSTD(Id, EstadoTecnologiaId);
                $(".otros").hide();

                $(".form-control").addClass("ignore");
                $(".adFamilia").removeClass("ignore");

                $(".adFamilia").show();
                $(".inputOpcional").show();
                $(".adBasico").hide();
                $(".adRiesgo").hide();
                $(".adCicloVida").hide();
                $(".adClasificacion").hide();
                $(".adResponsabilidad").hide();

                $("#FecSopContainer").hide();
                $(".footerModalTecnologia").hide();

                break;
        }
    }
}

function editarTecSTD(TecId, estadoId) {

    MostrarModalCompleto();

    if (estadoId === ESTADO_TECNOLOGIA.REGISTRADO) {
        $(".btnRegTecSTD").show();
        $(".btnConTec").show();

        $(".btnAprTec").hide();
        $(".btnObsTec").hide();
        $(".btnGuardarTec").hide();

        $(".cbAprob").addClass("ignore");
        $(".tabRegSTD").addClass("tec");
        //$(".tabRegSTD").addClass("tec");
    }

    if (estadoId === ESTADO_TECNOLOGIA.PROCESOREVISION) {
        $(".btnAprTec").show();
        $(".btnObsTec").show();

        $(".btnRegTecSTD").hide();
        $(".btnConTec").hide();
        $(".btnGuardarTec").hide();

        $(".cbAprob").removeClass("ignore");
        $(".tabRegSTD").removeClass("tec");
    }

    if (estadoId === ESTADO_TECNOLOGIA.APROBADO) {
        $(".btnAprTec").hide();
        $(".btnObsTec").hide();

        $(".btnRegTecSTD").hide();
        $(".btnConTec").hide();

        $(".btnGuardarTec").show();

        //$(".cbAprob").addClass("ignore");
        //$(".tabRegSTD").addClass("tec");
        $(".cbAprob").removeClass("ignore");
        $(".tabRegSTD").removeClass("tec");
    }

    if (estadoId === ESTADO_TECNOLOGIA.OBSERVADO) {
        $(".btnAprTec").hide();
        $(".btnObsTec").hide();

        $(".btnGuardarTec").hide();

        $(".btnRegTecSTD").show();
        $(".btnConTec").show();

        $(".cbAprob").addClass("ignore");
        $(".tabRegSTD").addClass("tec");
    }

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    ItemsRemoveAutId = [];
    //$tblAutTec.bootstrapTable('destroy');
    //$tblAutTec.bootstrapTable();

    $("#titleFormTec").html("Editar Registro Tecnología");
    $.ajax({
        url: URL_API_VISTA + "/" + TecId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            mdAddOrEditTec(true);
            //Tab 1
            $("#hIdTec").val(result.Id); //Id Tecnologia
            //getTecnologias2();
            $("#hActTec").val(result.Activo); //Valor activo
            //$("#hIdSubTec").val(result.SubdominioId); //Id Subdominio
            $("#hIdTecObs").val(result.EliminacionTecObsoleta === null ? "" : result.EliminacionTecObsoleta);  //Id Tec Obsoleta
            $("#hEstTec").val(result.EstadoTecnologia); //Flag estado tecnologia
            $("#txtClaveTecnologia").val(result.ClaveTecnologia);

            $("#hdIdApp").val(result.CodigoAPT); //Id CodigoAPT
            $("#txtNomTec").val(result.Nombre);
            $("#txtDesTec").val(result.Descripcion);
            $("#txtVerTec").val(result.Versiones);
            $("#hFamTecId").val(result.FamiliaId);
            $("#txtFamTec").val(result.FamiliaNomb);
            $("#cbTipTec").val(result.TipoTecnologiaId === null ? -1 : result.TipoTecnologiaId);
            $("#txtFabricanteTec").val(result.Fabricante);
            $("#cbFlagFecSop").prop('checked', result.FlagFechaFinSoporte);
            $("#cbFlagFecSop").bootstrapToggle(result.FlagFechaFinSoporte ? 'on' : 'off');

            $("#cbFlagConfirmarFamilia").prop('checked', result.FlagConfirmarFamilia);
            $("#cbFlagConfirmarFamilia").bootstrapToggle(result.FlagConfirmarFamilia ? 'on' : 'off');

            //$("#cbFlagFecSop").trigger("change");   
            $("#cbFecCalTec").val(result.FechaCalculoTec === null ? -1 : result.FechaCalculoTec);
            $("#dpFecLanTec").val(result.FechaLanzamientoToString);
            $("#dpFecExtTec").val(result.FechaExtendidaToString);
            $("#dpFecSopTec").val(result.FechaFinSoporteToString);
            $("#dpFecIntTec").val(result.FechaAcordadaToString);
            $("#txtComTec").val(result.ComentariosFechaFin);
            $("#cbFuenteTec").val(result.Fuente === null ? -1 : result.Fuente);
            $("#cbFuenteTec").trigger("change");
            $("#cbExisTec").val(result.Existencia);
            $("#cbFacAcTec").val(result.Facilidad);
            $("#cbRiesgTec").val(result.Riesgo);
            $("#txtVulTec").val(result.Vulnerabilidad);
            $("#txtCusTec").val(result.CasoUso);
            $("#txtReqHSTec").val(result.Requisitos);
            $("#txtCompaTec").val(result.Compatibilidad);
            $("#txtApliTec").val(result.Aplica);
            $("#cbFlagApp").prop('checked', result.FlagAplicacion);
            $('#cbFlagApp').bootstrapToggle(result.FlagAplicacion ? 'on' : 'off');
            $("#cbFlagApp").trigger("change");
            $("#txtApp").val(result.AplicacionNomb);

            //Tab 2
            $("#cbDomTec").val(result.DominioId);
            getSubdominiosByDomCb($("#cbDomTec").val(), $("#txtSubTec"));
            //getSubdominiosByDom(result.DominioId);
            //$("#txtSubTec").val(result.SubdominioNomb);
            $("#txtSubTec").val(result.SubdominioId);
            $("#txtElimTec").val(result.EliminacionTecNomb === "" ? result.RoadmapOpcional : result.EliminacionTecNomb);
            $("#txtRefTec").val(result.Referencias);
            $("#txtPlanTransTec").val(result.PlanTransConocimiento);
            $("#txtEsqMonTec").val(result.EsqMonitoreo);
            $("#txtLinSegTec").val(result.LineaBaseSeg);
            $("#txtPatManTec").val(result.EsqPatchManagement);

            //Tab 3
            $("#txtDueTec").val(result.Dueno);
            $("#txtEqAdmTec").val(result.EqAdmContacto);
            $("#txtGrupRemTec").val(result.GrupoSoporteRemedy);
            $("#txtConfArqSegTec").val(result.ConfArqSeg);
            $("#txtConfArqTec").val(result.ConfArqTec);
            $("#txtRenConTec").val(result.EncargRenContractual);
            $("#txtEsqLinTec").val(result.EsqLicenciamiento);
            $("#txtSopEmpTec").val(result.SoporteEmpresarial);
            //Tab 4
            //$("#cbSiteEstandar").val(result.FlagSiteEstandar);
            $("#cbSiteEstandar").prop('checked', result.FlagSiteEstandar);
            $("#cbSiteEstandar").bootstrapToggle(result.FlagSiteEstandar ? 'on' : 'off');
            //$("#cbFamTec").val(result.FamiliaId === null ? -1 : result.FamiliaId);
            //$("#cbTipTec").val(result.TipoTecnologiaId === null ? -1 : result.TipoTecnologiaId); PASARON A TAB 1
            //$("#cbEstado").val(result.EstadoId == null ? -1 : result.EstadoId);
            let estado = result.EstadoId === ESTADO.Vigente; // VIGENTE
            $("#cbEstado").prop("checked", estado);
            $("#cbEstado").bootstrapToggle(estado ? 'on' : 'off');

            //inputOpcional
            switch (result.EstadoId) {
                case ESTADO.Vigente:
                case ESTADO.Deprecado:
                    SetItems(DATA_INPUT_OPCIONAL.filter(x => x.Id !== ESTADO.Obsoleto), $("#cbEstadoObs"), "");
                    $("#cbEstadoObs").prop("disabled", false);
                    $("#cbEstadoObs").val(result.EstadoId);

                    //Formulario general
                    $("#cbEstado").prop("disabled", false);
                    break;
                case ESTADO.Obsoleto:
                    SetItems(DATA_INPUT_OPCIONAL, $("#cbEstadoObs"), "");
                    $("#cbEstadoObs").val(result.EstadoId);
                    $("#cbEstadoObs").prop("disabled", true);

                    //Formulario general
                    $("#cbEstado").prop("disabled", true);
                    break;
            }

            $("#cbTipo").val(result.TipoId === null ? -1 : result.TipoId);
            $("#txtCodAsigTec").val(result.txtCodAsigTec);
            //$("#hdIdArq").val(result.ArquetipoId == null ? "0" : result.ArquetipoId);
            //$("#txtArqTec").val(result.ArquetipoNombre);
            if (result.ClaveTecnologia === null) $("#txtFabricanteTec").trigger("keyup");
            $("#txtCodAsigTec").val(result.CodigoTecnologiaAsignado);

            let dataAutorizadores = result.ListAutorizadores;
            if (dataAutorizadores.length > 0) {
                $tblAutTec.bootstrapTable('destroy');
                $tblAutTec.bootstrapTable({
                    data: dataAutorizadores,
                    pagination: true,
                    pageNumber: 1,
                    pageSize: 10
                });
            }

            let dataArquetipos = result.ListArquetipo;
            if (dataArquetipos.length > 0) {
                $tblArqAprob.bootstrapTable("destroy");
                $tblArqAprob.bootstrapTable({
                    data: dataArquetipos,
                    pagination: true,
                    pageNumber: 1,
                    pageSize: 10
                });
            }

            let dataTecnologiaVinculadas = result.ListTecnologiaVinculadas;
            if (dataTecnologiaVinculadas.length > 0) {
                $tblTecnologiaVinculacion.bootstrapTable("destroy");
                $tblTecnologiaVinculacion.bootstrapTable({
                    data: dataTecnologiaVinculadas,
                    pagination: true,
                    pageNumber: 1,
                    pageSize: 10
                });
            }

            if (result.ArchivoId !== null) {
                $("#txtNomDiagCasoUso").val(result.ArchivoStr);
                $("#hdArchivoId").val(result.ArchivoId);
                $("#btnDescargarFile").show();
                $("#btnEliminarFile").show();
                //$(".div-controls-file").show();
            }

            var estTec = result.EstadoTecnologia;
            //debugger;               

            $('a[data-toggle="tab"]')[0].click();
            $(".form-control").removeClass("ignore");
            $(".matricula-auto").addClass("ignore");
            //debugger;
            $("#cbFecCalTec").trigger("change");
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function castDate(date) {
    var fechaTemp = date;
    var vectorDate = fechaTemp.split("/");
    var anio = vectorDate[2];
    var mes = vectorDate[1];
    var dia = vectorDate[0];

    return anio.toString() + "/" + mes + "/" + dia;
}

function irEquivalencias(Id, NombreStr, EstadoTecnologiaStr, FlagActivo) {
    if (FlagActivo) {
        if (EstadoTecnologiaStr === 'Aprobado') {
            $("#hIdTec").val(Id);
            $("#txtNomTecEq").val("");
            $("#spNomTec").html(NombreStr);
            LimpiarValidateErrores($("#formTecByArq"));
            ItemsRemoveTecEqId = [];

            listarTecnologiasEquivalentes($tblTecEq, $("#mdTecEq"));
            //listarTecEqById(TecId);
        } else {
            bootbox.alert({
                size: "sm",
                title: TITULO_MENSAJE_EQUIVALENCIA,
                message: String.Format("La tecnología se encuentra en estado {0}, no es posible editar.", EstadoTecnologiaStr),
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-primary'
                    }
                }
            });
        }
    } else {
        MensajeRegistroInactivo(TITULO_MENSAJE_EQUIVALENCIA);
    }
}


function autocompletarTec(itemsX, inputX, containerX) {
    var $inputX = inputX;
    var $containerX = containerX;
    $inputX.autocomplete({
        appendTo: $containerX,
        minLength: 0,
        source: itemsX,
        focus: function (event, ui) {
            $inputX.val(ui.item.Nombre);
            return false;
        },
        select: function (event, ui) {
            LimpiarValidateErrores($("#formTecByArq"));
            //$("#formTecByArq").validate().resetForm();
            $inputX.val('');
            var estItem = $tblTecEq.bootstrapTable('getRowByUniqueId', ui.item.TecId);
            //debugger;
            if (estItem === null) {

                var dataTmp = $tblTecEq.bootstrapTable('getData');
                var idx = 0;
                var ultId = dataTmp.length === 0 ? (1 * -1000) : dataTmp[dataTmp.length - 1].TecEqId;
                ultId = ultId === null ? 0 : ultId;
                idx = ultId > 0 ? dataTmp.length * -1000 : ultId - 1000;

                $tblTecEq.bootstrapTable('append', {
                    TecEqId: idx,
                    TecId: $("#hIdTec").val(),
                    EqId: ui.item.TecId,
                    Nombre: ui.item.Nombre
                });
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Nombre + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarTecnologiaEquivalente($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                var data = {};
                data.id = parseInt($("#hIdTec").val()) === 0 ? null : parseInt($("#hIdTec").val());
                data.filtro = request.term;

                //$IdBox.val("0");
                $.ajax({
                    url: URL_API + `/Tecnologia/GetTecnologiaByClaveById`,
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(data),
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
            //$IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            //AgregarTecnologiaEquivalencia(ui.item.Id, ui.item.Descripcion);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function AgregarTecnologiaEquivalencia(EquivalenciaId, NombreEquivalencia) {
    var estItem = $tblTecEq.bootstrapTable('getRowByUniqueId', EquivalenciaId);
    //debugger;
    if (estItem === null) {

        var dataTmp = $tblTecEq.bootstrapTable('getData');
        var idx = 0;
        var ultId = dataTmp.length === 0 ? (1 * -1000) : dataTmp[dataTmp.length - 1].TecEqId;
        ultId = ultId === null ? 0 : ultId;
        idx = ultId > 0 ? dataTmp.length * -1000 : ultId - 1000;

        $tblTecEq.bootstrapTable('append', {
            TecEqId: idx,
            TecId: $("#hIdTec").val(),
            EqId: EquivalenciaId,
            Nombre: NombreEquivalencia
        });
    }
}


function formatOpcTecEq(value, row, index) {
    var btnTrash = `  <a id='btnRemAutTec' class='btn btn-danger' href='javascript: void(0)' onclick='removeItemTecnologiaEquivalente(${row.Id})'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return btnTrash;
}

function removeItemTecnologiaEquivalente(TecEqId) {
    bootbox.confirm({
        title: TITULO_MENSAJE_EQUIVALENCIA,
        message: "¿Estás seguro que deseas eliminar la equivalencia seleccionada?",
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
                    Id: TecEqId,
                };
                $.ajax({
                    url: URL_API_VISTA + "/CambiarFlagEquivalencia",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(data),
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (result) {
                        if (result) {
                            toastr.success("La operación se realizó correctamente", TITULO_MENSAJE_EQUIVALENCIA);
                            listarTecnologiasEquivalentes($tblTecEq, $("#mdTecEq"));
                        }
                        else {
                            toastr.error("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE_EQUIVALENCIA);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    },
                    complete: function (data) {
                        //RefrescarListado();
                    }
                });
            }
        }
    });
}

function guardarTecnologiaEquivalente() {
    //$("#formTecByArq").validate().resetForm();
    LimpiarValidateErrores($("#formTecByArq"));
    if ($("#formTecByArq").valid()) {
        var _tecId = $("#hIdTec").val();
        var equivalencia = $("#txtNomTecEq").val();

        let data = {
            tecId: _tecId,
            Equivalencia: equivalencia,
        };

        $("#btnRegTecEq").button("loading");

        $.ajax({
            url: URL_API_VISTA + "/AsociarTecnologiaEquivalencia",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (result) {
                var response = result;
                if (response) {
                    toastr.success("Se relacionó correctamente", TITULO_MENSAJE);
                    $("#txtNomTecEq").val("");
                    listarTecnologiasEquivalentes($tblTecEq, $("#mdTecEq"));
                }
                else
                    toastr.error('Ocurrio un problema', TITULO_MENSAJE);
            },
            complete: function () {
                $("#btnRegTecEq").button("reset");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function irCambiarEstadoTec(TecId, EstadoTecnologia, EstadoTecnologiaStr, FlagActivo) {
    if (FlagActivo) {
        //debugger;
        switch (EstadoTecnologia) {
            case ESTADO_TECNOLOGIA.APROBADO:
                $("#hIdTec").val(TecId);
                $("#cbNueEstTec").val(-1);
                $("#txtEstActTec").val(EstadoTecnologiaStr);
                $("#hEstTec").val(EstadoTecnologiaStr);
                $("#mdCambEstTec").modal(opcionesModal);
                LimpiarValidateErrores($("#formCambiarEstadoTec"));
                break;
            case ESTADO_TECNOLOGIA.REGISTRADO:
            case ESTADO_TECNOLOGIA.OBSERVADO:
            case ESTADO_TECNOLOGIA.PROCESOREVISION:
                //debugger;
                bootbox.alert({
                    size: "sm",
                    title: TITULO_MENSAJE,
                    message: String.Format("La tecnología se encuentra en estado {0}, no es posible editar.", EstadoTecnologiaStr),
                    buttons: {
                        ok: {
                            label: 'Aceptar',
                            className: 'btn-primary'
                        }
                    }
                });
                break;
        }
    } else {
        MensajeRegistroInactivo(TITULO_MENSAJE);
    }
}

function guardarNuevoEstadoTec() {
    if ($("#formCambiarEstadoTec").valid()) {
        var estNueTec = $("#cbNueEstTec").val();
        if (estNueTec === '3') {
            bootbox.confirm({
                title: TITULO_MENSAJE_APROBACION,
                message: "¿Estas seguro de aprobar el registro de la tecnología?, ten en consideración que al realizar la aprobación la tecnología también figurará en el sitio web de Estándares.",
                buttons: {
                    confirm: {
                        label: 'Aprobar',
                        className: 'btn-primary'
                    },
                    cancel: {
                        label: 'Cancelar',
                        className: 'btn-secondary'
                    }
                },
                callback: function (result) {
                    if (result) {
                        var tec = {};
                        tec.id = $("#hIdTec").val();
                        tec.est = 3;
                        tec.obs = '';

                        $("#btnGuardarEstTec").button("loading");

                        $.ajax({
                            url: URL_API_VISTA + "/CambiarEstadoTec",
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(tec),
                            dataType: "json",
                            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                            success: function (result) {
                                bootbox.alert({
                                    size: "sm",
                                    title: TITULO_MENSAJE_APROBACION,
                                    message: "La tecnología se aprobó correctamente."
                                });
                            },
                            complete: function () {
                                $("#btnGuardarEstTec").button("reset");
                                $("#mdCambEstTec").modal('hide');
                                LimpiarFiltros();
                                listarTecSTD();
                            },
                            error: function (xhr, ajaxOptions, thrownError) {
                                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                            }
                        });
                    }
                }
            });
        } else {
            bootbox.addLocale('custom', locale);
            bootbox.prompt({
                title: TITULO_MENSAJE_OBSERVACION,
                message: '<p>¿Estas seguro que deseas observar el registro de la tecnología?, de ser asi por favor ingrese los comentarios al respecto:</p>',
                inputType: 'textarea',
                rows: '5',
                locale: 'custom',
                callback: function (result) {
                    var data = result;
                    if (data !== '' && data !== null) {
                        if ($.trim(data).length > 500) {
                            toastr.error("Observación no debe superar los 500 carácteres.", TITULO_MENSAJE);
                            return false;
                        }
                        var tec = {};
                        tec.id = $("#hIdTec").val();
                        tec.obs = data;
                        tec.est = 4;

                        $("#btnGuardarEstTec").button("loading");

                        $.ajax({
                            url: URL_API_VISTA + "/CambiarEstadoTec",
                            type: "POST",
                            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(tec),
                            dataType: "json",
                            success: function (result) {
                                console.log(result);
                                bootbox.alert({
                                    size: "small",
                                    title: TITULO_MENSAJE_OBSERVACION,
                                    message: "La tecnología se observó correctamente.",
                                    buttons: {
                                        ok: {
                                            label: 'Aceptar',
                                            className: 'btn-primary'
                                        }
                                    }
                                });
                            },
                            complete: function () {
                                $("#btnGuardarEstTec").button("reset");
                                $("#mdCambEstTec").modal('hide');
                                LimpiarFiltros();
                                listarTecSTD();
                            },
                            error: function (xhr, ajaxOptions, thrownError) {
                                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                            }
                        });
                    } else {
                        toastr.error("Observación no debe estar vacio", TITULO_MENSAJE);
                    }
                }
            });
            $(".bootbox-input-textarea").attr("placeholder", placeholderObs);
        }
    }
}

function ObtenerFlagUnicaVigente(tec, flagMetodo) {
    let TitleMensaje = flagMetodo === TIPO_METODO.GUARDARCAMBIOS ? TITULO_MENSAJE : TITULO_MENSAJE_APROBACION;

    bootbox.confirm({
        title: TitleMensaje,
        message: "¿Esta tecnologia es la única vigente en la familia?",
        buttons: {
            confirm: {
                label: "Si",
                className: "btn-primary"
            },
            cancel: {
                label: "No",
                className: "btn-secondary"
            }
        },
        callback: function (result) {
            result = result || false;
            if (result || !result) {
                tec.FlagUnicaVigente = result;
                ajaxGuardar(tec, flagMetodo);
            }
        }
    });
}

function ajaxGuardar(tec, flagMetodo) {
    $.ajax({
        url: URL_API_VISTA,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(tec),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            console.log(result);
            var data = result;
            if (data > 0) {
                let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
                if ((archivoId === 0 && $("#txtNomDiagCasoUso").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                    UploadFile($("#flDiagCasoUso"), CODIGO_INTERNO, data, archivoId);
                }
                if (flagMetodo === TIPO_METODO.GUARDARCAMBIOS)
                    $("#btnGuardarTec").button("reset");
                else
                    $("#btnAprTec").button("reset");

                let TitleMensaje = flagMetodo === TIPO_METODO.GUARDARCAMBIOS ? TITULO_MENSAJE : TITULO_MENSAJE_APROBACION;
                let BodyMensaje = flagMetodo === TIPO_METODO.GUARDARCAMBIOS ? "Se guardaron los cambios correctamente" : "La tecnología se aprobó correctamente";

                bootbox.alert({
                    size: "sm",
                    title: TitleMensaje,
                    message: BodyMensaje
                });
            }
        },
        complete: function () {
            mdAddOrEditTec(false);
            LimpiarFiltros();
            listarTecSTD();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function aprobarTecSTD() {
    $(".cbAprob").removeClass("ignore");
    $(".matricula-auto").addClass("ignore");

    if ($("#formAddOrEditTec").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE_APROBACION,
            message: "¿Estas seguro de aprobar el registro de la tecnología?, ten en consideración que al realizar la aprobación la tecnología también figurará en el sitio web de Estándares.",
            buttons: {
                confirm: {
                    label: 'Aprobar',
                    className: 'btn-primary'
                },
                cancel: {
                    label: 'Cancelar',
                    className: 'btn-secondary'
                }
            },
            callback: function (result) {
                if (result) {
                    // CONSULTAR SI TEC SERÁ VIGENTE

                    $("#btnAprTec").button("loading");

                    let tec = {};
                    tec = ObtenerDataFormularioGeneral(tec, ESTADO_TECNOLOGIA.APROBADO);
                    tec.FlagCambioEstado = true;
                    //var tec = {};
                    //tec.Id = ($("#hIdTec").val() === "") ? 0 : parseInt($("#hIdTec").val());
                    //tec.Activo = $("#hActTec").val();
                    //tec.EstadoTecnologia = 3;
                    //tec.ClaveTecnologia = $("#txtClaveTecnologia").val();

                    ////Tab 1
                    //tec.Nombre = $("#txtNomTec").val();
                    //tec.Descripcion = $("#txtDesTec").val();
                    //tec.Versiones = $("#txtVerTec").val();
                    //tec.FamiliaId = $("#hFamTecId").val();
                    //tec.TipoTecnologiaId = $("#cbTipTec").val();
                    //tec.Fabricante = $("#txtFabricanteTec").val();
                    //tec.FlagFechaFinSoporte = $("#cbFlagFecSop").prop("checked");
                    //tec.Fuente = tec.FlagFechaFinSoporte ? $("#cbFuenteTec").val() : null;
                    //tec.FechaCalculoTec = tec.FlagFechaFinSoporte ? $("#cbFecCalTec").val() : null;
                    //tec.FechaLanzamiento = tec.FlagFechaFinSoporte ? ($("#dpFecLanTec").val() !== "" ? castDate($("#dpFecLanTec").val()) : null) : null;
                    //tec.FechaExtendida = tec.FlagFechaFinSoporte ? ($("#dpFecExtTec").val() !== "" ? castDate($("#dpFecExtTec").val()) : null) : null;
                    //tec.FechaFinSoporte = tec.FlagFechaFinSoporte ? ($("#dpFecSopTec").val() !== "" ? castDate($("#dpFecSopTec").val()) : null) : null;
                    //tec.FechaAcordada = tec.FlagFechaFinSoporte ? ($("#dpFecIntTec").val() !== "" ? castDate($("#dpFecIntTec").val()) : null) : null;
                    //tec.ComentariosFechaFin = $("#txtComTec").val();
                    //tec.Existencia = $("#cbExisTec").val();
                    //tec.Facilidad = $("#cbFacAcTec").val();
                    //tec.Vulnerabilidad = $("#txtVulTec").val();
                    //tec.CasoUso = $("#txtCusTec").val() !== null ? $("#txtCusTec").val() : "";
                    //tec.Requisitos = $("#txtReqHSTec").val();
                    //tec.Compatibilidad = $("#txtCompaTec").val();
                    //tec.Aplica = $("#txtApliTec").val();
                    //tec.FlagAplicacion = $("#cbFlagApp").prop("checked");
                    //tec.CodigoAPT = tec.FlagAplicacion ? $("#hdIdApp").val() : null;

                    ////Tab 2
                    //tec.SubdominioId = $("#txtSubTec").val();
                    //tec.EliminacionTecObsoleta = $("#hIdTecObs").val() === "" ? null : parseInt($("#hIdTecObs").val());
                    //tec.RoadmapOpcional = $.trim($("#txtElimTec").val()) === "" || $("#hIdTecObs").val() !== "" ? null : $("#txtElimTec").val();
                    //tec.Referencias = $("#txtRefTec").val();
                    //tec.PlanTransConocimiento = $("#txtPlanTransTec").val();
                    //tec.EsqMonitoreo = $("#txtEsqMonTec").val();
                    //tec.LineaBaseSeg = $("#txtLinSegTec").val();
                    //tec.EsqPatchManagement = $("#txtPatManTec").val();

                    ////Tab 3
                    //tec.Dueno = $("#txtDueTec").val();
                    //tec.EqAdmContacto = $("#txtEqAdmTec").val();
                    //tec.GrupoSoporteRemedy = $("#txtGrupRemTec").val();
                    //tec.ConfArqSeg = $("#txtConfArqSegTec").val();
                    //tec.ConfArqTec = $("#txtConfArqTec").val();
                    //tec.EncargRenContractual = $("#txtRenConTec").val();
                    //tec.EsqLicenciamiento = $("#txtEsqLinTec").val();
                    //tec.SoporteEmpresarial = $("#txtSopEmpTec").val();

                    //tec.ListAutorizadores = $tblAutTec.bootstrapTable('getData');
                    //tec.ItemsRemoveAutId = ItemsRemoveAutId;
                    //****************************************************************

                    //Tab Aprobador

                    tec.FlagSiteEstandar = $("#cbSiteEstandar").prop("checked");
                    //tec.EstadoId = $("#cbEstado").val();
                    //let estado = result.EstadoId == 1; // VIGENTE
                    tec.EstadoId = $("#cbEstado").prop("checked") ? ESTADO.Vigente : ESTADO.Deprecado;
                    //tec.UsuarioCreacion = USUARIO.UserName;
                    //tec.UsuarioModificacion = USUARIO.UserName;
                    //tec.ArquetipoId = $("#hdIdArq").val();
                    tec.CodigoTecnologiaAsignado = $("#txtCodAsigTec").val();

                    //tec.ItemsRemoveAutIdSTR = ItemsRemoveAutId.join("|") || "";
                    //tec.ItemsAddAutorizadorSTR = $tblAutTec.bootstrapTable('getData').map(x => x.MatriculaBanco).join("|") || "";

                    tec.ItemsRemoveTecEqIdSTR = ItemsRemoveTecArqId.join("|") || "";
                    tec.ItemsAddTecEqIdSTR = $tblArqAprob.bootstrapTable("getData").map(x => x.Id).join("|") || "";

                    tec.ItemsRemoveTecVinculadaIdSTR = ItemsRemoveTecVincId.join("|") || "";
                    tec.ItemsAddTecVinculadaIdSTR = $tblTecnologiaVinculacion.bootstrapTable("getData").map(x => x.Id).join("|") || "";

                    //tec.ItemsRemoveTecEqId = ItemsRemoveTecArqId;
                    //tec.ItemsAddTecEqId = $tblArqAprob.bootstrapTable("getData").map(x => x.Id);

                    //tec.ItemsRemoveTecVinculadaId = ItemsRemoveTecVincId;
                    //tec.ItemsAddTecVinculadaId = $tblTecnologiaVinculacion.bootstrapTable("getData").map(x => x.Id);

                    if ($("#cbEstado").prop("checked")) {
                        ObtenerFlagUnicaVigente(tec, TIPO_METODO.APROBAR);
                    } else {
                        ajaxGuardar(tec, TIPO_METODO.APROBAR);
                    }
                }
            }
        });
    } else {
        toastr.error('Faltan completar campos', TITULO_MENSAJE);
    }
}

function guardarCambios() {
    //$(".form-control").removeClass("ignore");
    $(".cbAprob").removeClass("ignore");
    $(".matricula-auto").addClass("ignore");

    if ($("#formAddOrEditTec").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: "¿Estás seguro de guardar los cambios de la tecnología?",
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
                    // CONSULTAR SI TEC SERÁ VIGENTE
                    $("#btnGuardarTec").button("loading");

                    let tec = {};
                    tec = ObtenerDataFormularioGeneral(tec, ESTADO_TECNOLOGIA.APROBADO);
                    tec.FlagCambioEstado = false;

                    //var tec = {};
                    //tec.Id = ($("#hIdTec").val() === "") ? 0 : parseInt($("#hIdTec").val());
                    //tec.Activo = $("#hActTec").val();
                    //tec.EstadoTecnologia = 3;
                    //tec.ClaveTecnologia = $("#txtClaveTecnologia").val();
                    ////Tab 1
                    //tec.Nombre = $("#txtNomTec").val() || "";
                    //tec.Descripcion = $("#txtDesTec").val() || "";
                    //tec.Versiones = $("#txtVerTec").val() || "";
                    //tec.FamiliaId = $("#hFamTecId").val();
                    //tec.TipoTecnologiaId = $("#cbTipTec").val();
                    //tec.Fabricante = $("#txtFabricanteTec").val() || "";
                    //tec.FlagFechaFinSoporte = $("#cbFlagFecSop").prop("checked");
                    //tec.Fuente = tec.FlagFechaFinSoporte ? $("#cbFuenteTec").val() : null;
                    //tec.FechaCalculoTec = tec.FlagFechaFinSoporte ? $("#cbFecCalTec").val() : null;
                    //tec.FechaLanzamiento = tec.FlagFechaFinSoporte ? ($("#dpFecLanTec").val() !== "" ? castDate($("#dpFecLanTec").val()) : null) : null;
                    //tec.FechaExtendida = tec.FlagFechaFinSoporte ? ($("#dpFecExtTec").val() !== "" ? castDate($("#dpFecExtTec").val()) : null) : null;
                    //tec.FechaFinSoporte = tec.FlagFechaFinSoporte ? ($("#dpFecSopTec").val() !== "" ? castDate($("#dpFecSopTec").val()) : null) : null;
                    //tec.FechaAcordada = tec.FlagFechaFinSoporte ? ($("#dpFecIntTec").val() !== "" ? castDate($("#dpFecIntTec").val()) : null) : null;
                    //tec.ComentariosFechaFin = $("#txtComTec").val();
                    //tec.Existencia = $("#cbExisTec").val();
                    //tec.Facilidad = $("#cbFacAcTec").val();
                    //tec.Vulnerabilidad = $("#txtVulTec").val();
                    //tec.CasoUso = $("#txtCusTec").val() || "";
                    //tec.Requisitos = $("#txtReqHSTec").val() || "";
                    //tec.Compatibilidad = $("#txtCompaTec").val() || "";
                    //tec.Aplica = $("#txtApliTec").val() || "";
                    //tec.FlagAplicacion = $("#cbFlagApp").prop("checked");
                    //tec.CodigoAPT = tec.FlagAplicacion ? $("#hdIdApp").val() : null;

                    ////Tab 2
                    //tec.SubdominioId = $("#txtSubTec").val();//$("#hIdSubTec").val();
                    //tec.EliminacionTecObsoleta = $("#hIdTecObs").val() === "" ? null : parseInt($("#hIdTecObs").val());
                    //tec.RoadmapOpcional = $.trim($("#txtElimTec").val()) === "" || $("#hIdTecObs").val() !== "" ? null : $("#txtElimTec").val();
                    //tec.Referencias = $("#txtRefTec").val() || "";
                    //tec.PlanTransConocimiento = $("#txtPlanTransTec").val() || "";
                    //tec.EsqMonitoreo = $("#txtEsqMonTec").val() || "";
                    //tec.LineaBaseSeg = $("#txtLinSegTec").val() || "";
                    //tec.EsqPatchManagement = $("#txtPatManTec").val() || "";

                    ////Tab 3
                    //tec.Dueno = $("#txtDueTec").val() || "";
                    //tec.EqAdmContacto = $("#txtEqAdmTec").val() || "";
                    //tec.GrupoSoporteRemedy = $("#txtGrupRemTec").val() || "";
                    //tec.ConfArqSeg = $("#txtConfArqSegTec").val() || "";
                    //tec.ConfArqTec = $("#txtConfArqTec").val() || "";
                    //tec.EncargRenContractual = $("#txtRenConTec").val() || "";
                    //tec.EsqLicenciamiento = $("#txtEsqLinTec").val() || "";
                    //tec.SoporteEmpresarial = $("#txtSopEmpTec").val() || "";
                    //******************************************************************//

                    //Tab Aprobador
                    //tec.FamiliaId = $("#cbFamTec").val();
                    //tec.TipoTecnologiaId = $("#cbTipTec").val();
                    tec.FlagSiteEstandar = $("#cbSiteEstandar").prop("checked");
                    //tec.EstadoId = $("#cbEstado").val();
                    //let estado = result.EstadoId == 1; // VIGENTE

                    //tec.EstadoId = $("#cbEstado").prop("checked") ? ESTADO.Vigente : ESTADO.Deprecado;
                    tec.EstadoId = $("#cbEstadoObs").val();

                    //tec.UsuarioCreacion = USUARIO.UserName;
                    //tec.UsuarioModificacion = USUARIO.UserName;
                    //tec.ArquetipoId = $("#hdIdArq").val();

                    tec.CodigoTecnologiaAsignado = $("#txtCodAsigTec").val();

                    //AUTORIZADORES
                    //tec.ItemsRemoveAutId = ItemsRemoveAutId || [];
                    //tec.ItemsAddAutorizador = $tblAutTec.bootstrapTable('getData').map(x => x.MatriculaBanco) || [];

                    //tec.ItemsRemoveAutIdSTR = ItemsRemoveAutId.join("|") || "";
                    //tec.ItemsAddAutorizadorSTR = $tblAutTec.bootstrapTable('getData').map(x => x.MatriculaBanco).join("|") || "";

                    //ARQUETIPO
                    //tec.ItemsRemoveTecEqId = ItemsRemoveTecArqId || [];
                    //tec.ItemsAddTecEqId = $tblArqAprob.bootstrapTable("getData").map(x => x.Id) || [];

                    tec.ItemsRemoveTecEqIdSTR = ItemsRemoveTecArqId.join("|") || "";
                    tec.ItemsAddTecEqIdSTR = $tblArqAprob.bootstrapTable("getData").map(x => x.Id).join("|") || "";

                    //TECNOLOGIAS VINCULADAS
                    //tec.ItemsRemoveTecVinculadaId = ItemsRemoveTecVincId || [];
                    //tec.ItemsAddTecVinculadaId = $tblTecnologiaVinculacion.bootstrapTable("getData").map(x => x.Id) || [];

                    tec.ItemsRemoveTecVinculadaIdSTR = ItemsRemoveTecVincId.join("|") || "";
                    tec.ItemsAddTecVinculadaIdSTR = $tblTecnologiaVinculacion.bootstrapTable("getData").map(x => x.Id).join("|") || "";

                    if ($("#cbEstado").prop("checked")) {
                        ObtenerFlagUnicaVigente(tec, TIPO_METODO.GUARDARCAMBIOS);
                    } else {
                        ajaxGuardar(tec, TIPO_METODO.GUARDARCAMBIOS);
                    }
                }
            }
        });
    } else {
        toastr.error('Faltan completar campos', TITULO_MENSAJE);
    }
}

function observarTecSTD() {
    //$(".form-control").removeClass("ignore");
    $(".cbAprob").addClass("ignore");
    //$("#formAddOrEditTec").validate().resetForm();

    if ($("#formAddOrEditTec").valid()) {
        bootbox.addLocale('custom', locale);
        bootbox.prompt({
            title: TITULO_MENSAJE_OBSERVACION,
            message: '<p>¿Estás seguro que deseas observar el registro de la tecnología?, de ser asi por favor ingresa los comentarios al respecto:</p>',
            inputType: 'textarea',
            rows: '5',
            locale: 'custom',
            callback: function (result) {
                var data = result;
                if (data !== "" && data !== null) {

                    if ($.trim(data).length > 500) {
                        toastr.error("Observación no debe superar los 500 carácteres.", TITULO_MENSAJE);
                        return false;
                    }

                    let tec = {};
                    tec = ObtenerDataFormularioGeneral(tec, ESTADO_TECNOLOGIA.OBSERVADO);
                    tec.FlagCambioEstado = true;
                    tec.Observacion = data;

                    //var tec = {};
                    //tec.Id = ($("#hIdTec").val() === "") ? 0 : parseInt($("#hIdTec").val());
                    //tec.Activo = $("#hActTec").val();
                    //tec.EstadoTecnologia = 4;
                    //tec.ClaveTecnologia = $("#txtClaveTecnologia").val();

                    ////Tab 1
                    //tec.Nombre = $("#txtNomTec").val();
                    //tec.Descripcion = $("#txtDesTec").val() !== null ? $("#txtDesTec").val() : "";
                    //tec.Versiones = $("#txtVerTec").val();
                    //tec.FamiliaId = $("#hFamTecId").val();
                    //tec.TipoTecnologiaId = $("#cbTipTec").val();
                    //tec.Fabricante = $("#txtFabricanteTec").val();
                    //tec.FlagFechaFinSoporte = $("#cbFlagFecSop").prop("checked");
                    //tec.Fuente = tec.FlagFechaFinSoporte ? $("#cbFuenteTec").val() : null;
                    //tec.FechaCalculoTec = tec.FlagFechaFinSoporte ? $("#cbFecCalTec").val() : null;
                    //tec.FechaLanzamiento = tec.FlagFechaFinSoporte ? ($("#dpFecLanTec").val() !== "" ? castDate($("#dpFecLanTec").val()) : null) : null;
                    //tec.FechaExtendida = tec.FlagFechaFinSoporte ? ($("#dpFecExtTec").val() !== "" ? castDate($("#dpFecExtTec").val()) : null) : null;
                    //tec.FechaFinSoporte = tec.FlagFechaFinSoporte ? ($("#dpFecSopTec").val() !== "" ? castDate($("#dpFecSopTec").val()) : null) : null;
                    //tec.FechaAcordada = tec.FlagFechaFinSoporte ? ($("#dpFecIntTec").val() !== "" ? castDate($("#dpFecIntTec").val()) : null) : null;
                    //tec.ComentariosFechaFin = $("#txtComTec").val();
                    //tec.Existencia = $("#cbExisTec").val();
                    //tec.Facilidad = $("#cbFacAcTec").val();
                    //tec.Vulnerabilidad = $("#txtVulTec").val();
                    //tec.CasoUso = $("#txtCusTec").val();
                    //tec.Requisitos = $("#txtReqHSTec").val();
                    //tec.Compatibilidad = $("#txtCompaTec").val();
                    //tec.Aplica = $("#txtApliTec").val();
                    //tec.FlagAplicacion = $("#cbFlagApp").prop("checked");
                    //tec.CodigoAPT = tec.FlagAplicacion ? $("#hdIdApp").val() : null;

                    ////Tab 2
                    //tec.SubdominioId = $("#txtSubTec").val();
                    //tec.EliminacionTecObsoleta = $("#hIdTecObs").val() === "" ? null : parseInt($("#hIdTecObs").val());
                    //tec.RoadmapOpcional = $.trim($("#txtElimTec").val()) === "" || $("#hIdTecObs").val() !== "" ? null : $("#txtElimTec").val();
                    //tec.Referencias = $("#txtRefTec").val();
                    //tec.PlanTransConocimiento = $("#txtPlanTransTec").val();
                    //tec.EsqMonitoreo = $("#txtEsqMonTec").val();
                    //tec.LineaBaseSeg = $("#txtLinSegTec").val();
                    //tec.EsqPatchManagement = $("#txtPatManTec").val();

                    ////Tab 3
                    //tec.Dueno = $("#txtDueTec").val();
                    //tec.EqAdmContacto = $("#txtEqAdmTec").val();
                    //tec.GrupoSoporteRemedy = $("#txtGrupRemTec").val();
                    //tec.ConfArqSeg = $("#txtConfArqSegTec").val();
                    //tec.ConfArqTec = $("#txtConfArqTec").val();
                    //tec.EncargRenContractual = $("#txtRenConTec").val();
                    //tec.EsqLicenciamiento = $("#txtEsqLinTec").val();
                    //tec.SoporteEmpresarial = $("#txtSopEmpTec").val();

                    //**********************************************************//

                    //tec.ListAutorizadores = $tblAutTec.bootstrapTable('getData');
                    //tec.ItemsRemoveAutId = ItemsRemoveAutId;

                    //Tab Aprobador
                    //tec.FamiliaId = $("#cbFamTec").val();
                    //tec.TipoTecnologiaId = $("#cbTipTec").val();
                    tec.FlagSiteEstandar = $("#cbSiteEstandar").prop("checked");
                    //tec.EstadoId = $("#cbEstado").val();
                    //let estado = result.EstadoId == ESTADO.Vigente; // VIGENTE
                    tec.EstadoId = $("#cbEstado").prop("checked") ? ESTADO.Vigente : ESTADO.Deprecado;
                    //$("#cbEstado").prop("checked", estado);
                    //$("#cbEstado").bootstrapToggle(estado ? "on" : "off");
                    //tec.TipoId = $("#cbTipo").val() == -1 ? null : $("#cbTipo").val();

                    //tec.ItemsRemoveAutIdSTR = ItemsRemoveAutId.join("|") || "";
                    //tec.ItemsAddAutorizadorSTR = $tblAutTec.bootstrapTable('getData').map(x => x.MatriculaBanco).join("|") || "";

                    //tec.ArquetipoId = $("#hdIdArq").val();

                    $.ajax({
                        url: URL_API_VISTA,
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(tec),
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                        success: function (result) {
                            var data = result;
                            if (data > 0) {
                                let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
                                if ((archivoId === 0 && $("#txtNomDiagCasoUso").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                                    UploadFile($("#flDiagCasoUso"), CODIGO_INTERNO, data, archivoId);
                                }

                                bootbox.alert({
                                    size: "small",
                                    title: TITULO_MENSAJE_OBSERVACION,
                                    message: "La tecnología se observó correctamente."
                                });
                            }
                            //console.log(result);                          
                        },
                        complete: function () {
                            mdAddOrEditTec(false);
                            $("#btnObsTec").button("reset");
                            LimpiarFiltros();
                            listarTecSTD();
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                } else {
                    toastr.error("Observación no debe estar vacio", TITULO_MENSAJE);
                }
            }
        });
        $(".bootbox-input-textarea").attr("placeholder", placeholderObs);
    } else {
        toastr.error('Faltan completar campos', TITULO_MENSAJE);
    }
}

function cargarCombos() {
    SetItems(ItemNumeros.filter(x => ![0].includes(x)), $("#cbExisTec"), TEXTO_SELECCIONE);
    SetItems(ItemNumeros.filter(x => [1, 3, 5].includes(x)), $("#cbFacAcTec"), TEXTO_SELECCIONE);
    SetItems(ItemNumeros.filter(x => [0, 5].includes(x)), $("#cbRiesgTec"), TEXTO_SELECCIONE);
}

function formatOpcTec(value, row, index) {
    var btnTrash = `  <a id='btnRemAutTec' class='btn btn-danger' href='javascript: void(0)' onclick='removeItemAutorizador(${row.Id})'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return btnTrash;
}

function removeItemAutorizador(Id) {
    ItemsRemoveAutId.push(Id);
    $tblAutTec.bootstrapTable('remove', {
        field: 'Id', values: [Id]
    });
}

function addItemAutorizador() {
    $(".form-control").addClass("ignore");
    $(".matricula-auto").removeClass("ignore");

    //LimpiarValidateErrores($("#formAddOrEditTec"));

    if ($("#formAddOrEditTec").valid()) {
        var matAut = DATOS_RESPONSABLE.Matricula;//$("#txtMatAutTec").val();

        $("#txtMatAutTec").val('');
        var matItem = $tblAutTec.bootstrapTable('getRowByUniqueId', matAut);
        if (matItem === null) {

            var dataTmp = $tblAutTec.bootstrapTable('getData');
            var idx = 0;
            var ultId = dataTmp.length === 0 ? (1 * -1000) : dataTmp[dataTmp.length - 1].Id;
            ultId = ultId === null ? 0 : ultId;
            idx = ultId > 0 ? dataTmp.length * -1000 : ultId - 1000;

            $tblAutTec.bootstrapTable('append', {
                MatriculaBanco: matAut,
                Id: idx
            });
        }
    }
}

function CargarCombos2() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    //FILTROS MULTISELECT
                    SetDataToSelectMultiple(arrMultiSelect, dataObject);

                    SetItems(dataObject.Fuente, $("#cbFuenteTec"), TEXTO_SELECCIONE);
                    SetItems(dataObject.FechaCalculo, $("#cbFecCalTec"), TEXTO_SELECCIONE);

                    //SetItems(dataObject.Dominio, $("#cbFilDom"), TEXTO_TODOS); // CHANGE TO MULTIPLE
                    //SetItems(dataObject.Familia, $("#cbFilFam"), TEXTO_TODOS);
                    SetItems(dataObject.Familia, $("#cbFamTec"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoTec, $("#cbTipTec"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.EstadoTecnologia, $("#cbFilEst"), TEXTO_TODOS); // CHANGE TO MULTIPLE
                    CODIGO_INTERNO = dataObject.CodigoInterno;
                    SetItems(dataObject.FechaFinSoporte, $("#cbFilEsFecSop"), TEXTO_TODOS);
                    //SetItems(dataObject.EstadoObs, $("#cbFilEstObs"), TEXTO_TODOS); // CHANGE TO MULTIPLE
                    DATA_INPUT_OPCIONAL = dataObject.EstadoObs;
                    console.log(DATA_INPUT_OPCIONAL);
                    //SetItems(dataObject.TipoTec, $("#cbFilTipoTec"), TEXTO_TODOS); // CHANGE TO MULTIPLE
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function exportarTecSTD() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }
    //ExportarReporteTecnologia in progress

    DATA_EXPORTAR.domIds = CaseIsNullSendExport(DATA_EXPORTAR.domIds);
    DATA_EXPORTAR.subdomIds = CaseIsNullSendExport(DATA_EXPORTAR.subdomIds);
    DATA_EXPORTAR.estadoIds = CaseIsNullSendExport(DATA_EXPORTAR.estadoIds);
    DATA_EXPORTAR.tipoTecIds = CaseIsNullSendExport(DATA_EXPORTAR.tipoTecIds);
    DATA_EXPORTAR.estObsIds = CaseIsNullSendExport(DATA_EXPORTAR.estObsIds);

    let url = `${URL_API_VISTA}/ExportarReporteTecnologia?nombre=${DATA_EXPORTAR.nombre}&dominioIds=${DATA_EXPORTAR.domIds}&subdominioIds=${DATA_EXPORTAR.subdomIds}&familiaId=${DATA_EXPORTAR.famId}&estadoFecSop=${DATA_EXPORTAR.fecId}&casoUso=${DATA_EXPORTAR.casoUso}&estadoTecs=${DATA_EXPORTAR.estadoIds}&aplica=${DATA_EXPORTAR.aplica}&codigo=${DATA_EXPORTAR.codigo}&dueno=${DATA_EXPORTAR.dueno}&equipo=${DATA_EXPORTAR.equipo}&tipoTecIds=${DATA_EXPORTAR.tipoTecIds}&estObsIds=${DATA_EXPORTAR.estObsIds}&flagActivo=${DATA_EXPORTAR.flagActivo}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function ExisteAplicacion() {
    let estado = false;
    //let nombre = $("#txtApp").val();
    let Id = $("#hdIdApp").val();
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Aplicacion" + `/ExisteAplicacion?Id=${Id}`,
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
function ExisteArquetipo() {
    let estado = false;
    //let nombre = $("#txtArqTec").val();
    let Id = $("#hdIdArq").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Arquetipo" + `/ExisteArquetipo?Id=${Id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
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
function InitAutocompletarAplicacion($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Aplicacion" + "/GetAplicacionByFiltro?filtro=" + request.term,
                    //data: JSON.stringify({
                    //    filtro: request.term
                    //}),
                    //dataType: "json",
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        DATA_APLICACION = data;
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
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}
function InitAutocompletarArquetipo($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Arquetipo" + "/GetByFiltro?filtro=" + request.term,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    //contentType: "application/json; charset=utf-8",
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
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            AgregarArquetipoTecnologia(ui.item.Id, ui.item.Descripcion);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}
function ValidarEquivalencia() {
    var rpta = true;
    let equivalencia = $("#txtNomTecEq").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ValidarEquivalencia?equivalencia=${equivalencia}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    rpta = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return !rpta;
}
function formatOpcArqAprob(value, row, index) {
    let btnTrash = `  <a id="btnRemAutTec" class="btn btn-danger" href="javascript: void(0)" onclick="removeItemArquetipoTecnologia(${row.Id})">` +
        `<span class="icon icon-trash-o"></span>` +
        `</a>`;
    return btnTrash;
}
function removeItemArquetipoTecnologia(Id) {
    let existe = ItemsRemoveTecArqId.find(x => x === Id) || null;
    if (existe === null) {
        ItemsRemoveTecArqId.push(Id);
    }
    $tblArqAprob.bootstrapTable('remove', {
        field: 'Id', values: [Id]
    });
}
function AgregarArquetipoTecnologia(Id, Nombre) {

    var matItem = $tblArqAprob.bootstrapTable("getRowByUniqueId", parseInt(Id));
    if (matItem === null) {

        var dataTmp = $tblArqAprob.bootstrapTable("getData");
        $tblArqAprob.bootstrapTable('append', {
            Id: parseInt(Id),
            Nombre: Nombre
        });
    }

    $("#txtArqTec").val("");
}

function ExisteFamilia() {
    //debugger;
    let estado = false;
    let Id = $("#hFamTecId").val();
    let nombre = "";
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Familia" + `/ExisteFamilia?Id=${Id}&nombre=${nombre}`,
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'))
        },
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

function InitAutocompletarFamilia($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                if ($IdBox !== null) $IdBox.val("0");

                $.ajax({
                    url: URL_API + "/Familia" + "/GetAllFamiliaByFiltro?filtro=" + request.term,
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
                            console.log(item);
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
            $searchBox.val(ui.item.Descripcion);
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                obtenerFamiliaById(ui.item.Id);
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

function ExisteTecnologia($hdId) {
    let estado = false;
    //let nombre = $("#txtTecnologia").val();
    let Id = $hdId.val();
    //let Id = $("#hIdTecObs").val();
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

function InitAutocompletarTecnologia($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API_VISTA + "/GetTecnologiaByClaveById",
                    data: JSON.stringify({
                        filtro: request.term,
                        id: ($("#hIdTec").val() === "" || $("#hIdTec").val() === "0") ? null : parseInt($("#hIdTec").val())
                    }),
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_APLICACION = data;
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
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarTecnologiaForBusqueda($searchBox, $IdBox, $Container, $IdTecPadre, _flagActivo) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                let id = ($IdTecPadre !== null) ? $IdTecPadre.val() : null;
                let flagActivo = _flagActivo;
                //$IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetTecnologiaForBusqueda?filtro=${request.term}&id=${id}&flagActivo=${flagActivo}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (data) {
                        response($.map(data, function (item) {
                            //console.log(item);
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
            //$IdBox.val(ui.item.Id);
            if ($IdBox !== null) $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            //obtenerFamiliaById(ui.item.Id);
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

function ExisteClaveTecnologia() {
    let estado = true;
    let clave = encodeURIComponent($("#txtClaveTecnologia").val());
    let id = $("#hIdTec").val();
    let flagActivo = FLAG_ACTIVO_TECNOLOGIA;

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteClaveTecnologia?clave=${clave}&Id=${id}&flagActivo=${flagActivo}`,
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

function formatOpcTecVinculacion(value, row, index) {
    let btnTrash = `  <a id="btnRemAutTec" class="btn btn-danger" href="javascript: void(0)" onclick="removeItemTecnologiaVinculacion(${row.Id})">` +
        `<span class="icon icon-trash-o"></span>` +
        `</a>`;
    return btnTrash;
}
function removeItemTecnologiaVinculacion(Id) {
    let existe = ItemsRemoveTecVincId.find(x => x === Id) || null;
    if (existe === null) {
        ItemsRemoveTecVincId.push(Id);
    }
    $tblTecnologiaVinculacion.bootstrapTable('remove', {
        field: 'Id', values: [Id]
    });
}
function AgregarTecnologiaVinculacion(Id, Tecnologia, Dominio, Subdominio) {

    var matItem = $tblTecnologiaVinculacion.bootstrapTable("getRowByUniqueId", parseInt(Id));
    if (matItem === null) {

        var dataTmp = $tblTecnologiaVinculacion.bootstrapTable("getData");
        $tblTecnologiaVinculacion.bootstrapTable('append', {
            Id: parseInt(Id),
            DominioNomb: Dominio,
            SubdominioNomb: Subdominio,
            Nombre: Tecnologia
        });
    }
    $("#txtTecnologiaVinculadad").val("");
}

function InitAutocompletarTecnologiaVinculada($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                let data = {};
                data.Id = parseInt($("#hIdTec").val()) === 0 ? null : parseInt($("#hIdTec").val());
                data.IdsTec = $tblTecnologiaVinculacion.bootstrapTable("getData").map(x => x.Id) || [];
                data.Filtro = request.term;

                $IdBox.val("0");
                $.ajax({
                    url: URL_API + `/Tecnologia/GetTecnologiaByFiltroById`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(data),
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
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            AgregarTecnologiaVinculacion(ui.item.Id, ui.item.Descripcion, ui.item.Dominio, ui.item.Subdominio);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

//Upload

function EliminarArchivo() {
    $("#txtNomDiagCasoUso").val(TEXTO_SIN_ARCHIVO);
    $("#flDiagCasoUso").val("");
    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
    //$(".div-controls-file").hide();
}

function DescargarArchivo() {
    DownloadFile($("#hdArchivoId").val(), $("#txtNomDiagCasoUso"), "Tecnologías");
}

function listarTecnologiasEquivalentes($tbl, $md) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tbl.bootstrapTable('destroy');
    $tbl.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListarTecnologiasEquivalentes",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR_TEC_EQ = {};
            DATA_EXPORTAR_TEC_EQ.id = $("#hIdTec").val() === "" ? 0 : parseInt($("#hIdTec").val());
            DATA_EXPORTAR_TEC_EQ.pageNumber = p.pageNumber;
            DATA_EXPORTAR_TEC_EQ.pageSize = p.pageSize;
            DATA_EXPORTAR_TEC_EQ.sortName = p.sortName;
            DATA_EXPORTAR_TEC_EQ.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_TEC_EQ);
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
        onLoadSuccess: function (data) {
            $md.modal(opcionesModal);
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
    });
}

function irListarTecnologiasEquivalentes() {
    //debugger;
    //$("#hIdTec").val(-1);
    if ($("#hIdTec").val() !== "") {
        listarTecnologiasEquivalentes($tblTecEqList, $("#mdTecEqList"));
    }
    else {
        bootbox.alert({
            size: "small",
            title: TITULO_MENSAJE,
            message: "No hay tecnologías equivalentes.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    }
}

function verEquivalencias() {
    $("#hIdTec").val("");
    listarTecnologiasEquivalentes($tblTecEqGeneral, $("#mdTecEqGeneral"));
}

function exportarEquivalenciasGeneral() {
    let _data = $tblTecEqGeneral.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);

        return false;
    }

    let url = `${URL_API_VISTA}/ExportarEquivalenciaGeneral?sortName=${DATA_EXPORTAR_TEC_EQ.sortName}&sortOrder=${DATA_EXPORTAR_TEC_EQ.sortOrder}`;
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

function confirmarTecSTD() {
    $(".form-control").removeClass("ignore");
    $(".matricula-auto").addClass("ignore");

    $("#cbFecCalTec").trigger("change");

    if ($("#formAddOrEditTec").valid()) {
        var mensaje = "¿Estás seguro de enviar el registro hacia el equipo de Estándares para su revisión?, al aceptar ya no será posible realizar modificaciones posteriores.";
        bootbox.confirm({
            title: "Confirmación",
            message: mensaje,
            buttons: {
                confirm: {
                    label: 'Confirmar',
                    className: 'btn-primary'
                },
                cancel: {
                    label: 'Cancelar',
                    className: 'btn-secondary'
                }
            },
            callback: function (result) {
                if (result) {

                    $("#btnConTec").button("loading");

                    let tec = {};
                    tec = ObtenerDataFormularioGeneral(tec, ESTADO_TECNOLOGIA.PROCESOREVISION);
                    tec.FlagCambioEstado = true;

                    $.ajax({
                        url: URL_API_VISTA,
                        type: "POST",
                        data: JSON.stringify(tec),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                        success: function (result) {
                            var data = result;
                            if (data > 0) {
                                let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
                                if ((archivoId === 0 && $("#txtNomDiagCasoUso").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                                    UploadFile($("#flDiagCasoUso"), CODIGO_INTERNO, data, archivoId);
                                }
                                bootbox.alert({
                                    size: "sm",
                                    title: TITULO_MENSAJE,
                                    message: "La confirmación de la tecnología procedió correctamente.",
                                    buttons: {
                                        ok: {
                                            label: 'Aceptar',
                                            className: 'btn-primary'
                                        }
                                    }
                                });
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        },
                        complete: function (data) {
                            mdAddOrEditTec(false);
                            $("#btnConTec").button("reset");
                            LimpiarFiltros();
                            listarTecSTD();
                        }
                    });
                }
            }
        });
    } else {
        toastr.error('Faltan completar campos', TITULO_MENSAJE);
    }
}

function ExisteMatricula(Matricula) {
    let estado = false;
    let matricula = Matricula;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_LOGIN_SERVER + `/ObtenerDatosUsuario?correoElectronico=${matricula}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    DATOS_RESPONSABLE = dataObject;
                    let EstadoUser = dataObject.Estado;
                    estado = EstadoUser !== 1 ? false : true;
                    //estado = dataObject;
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

function ValidarMatriculaDueno() {
    $(".form-control").addClass("ignore");
    $(".inputMatriculaDueno").removeClass("ignore");

    if ($("#formAddOrEditTec").valid()) {
        $("#lblDueno").html(DATOS_RESPONSABLE.Nombres);
        RegistrarMatricula(DATOS_RESPONSABLE);
        //ObtenerDatosByMatricula($("#txtDueTec"), $("#lblDueno"));
    }
}

function ValidarMatriculaArquitectoSeguridad() {
    $(".form-control").addClass("ignore");
    $(".inputMatriculaArquitectoSeg").removeClass("ignore");

    if ($("#formAddOrEditTec").valid()) {
        $("#lblArquitectoSeg").html(DATOS_RESPONSABLE.Nombres);
        RegistrarMatricula(DATOS_RESPONSABLE);
        //ObtenerDatosByMatricula($("#txtConfArqSegTec"), $("#lblArquitectoSeg"));
    }
}

function ValidarMatriculaArquitectoTecnologia() {
    $(".form-control").addClass("ignore");
    $(".inputMatriculaArquitectoTec").removeClass("ignore");

    if ($("#formAddOrEditTec").valid()) {
        $("#lblArquitectoTec").html(DATOS_RESPONSABLE.Nombres);
        RegistrarMatricula(DATOS_RESPONSABLE);
        //ObtenerDatosByMatricula($("#txtConfArqTec"), $("#lblArquitectoTec"));
    }
}

function defaultAccesoDirecto() {
    $("#mdAddOrEditTec").modal('hide');
    $(COMBO_SELECTED).val("-1");
}

function irMigrarEquivalencias(TecnologiaId, EstadoTecnologiaId, EstadoTecnologiaStr, FlagActivo, FlagTieneEquivalencias) {
    //debugger;
    switch (EstadoTecnologiaId) {
        case ESTADO_TECNOLOGIA.APROBADO:
            if (FlagTieneEquivalencias) {
                $("#hIdTec").val(TecnologiaId);
                LimpiarValidateErrores($("#formMigrarEquivalencia"));
                $("#txtTecReceptora").val("");
                $("#hdTecReceptora").val("0");
                $("#mdMigrarEquivalencia").modal(opcionesModal);
            } else {
                bootbox.alert({
                    size: "sm",
                    title: TITULO_MENSAJE_EQUIVALENCIA,
                    message: "La tecnología no presenta equivalencias",//String.Format("La tecnología se encuentra en estado {0}, no es posible editar.", EstadoTecnologiaStr),
                    buttons: {
                        ok: {
                            label: 'Aceptar',
                            className: 'btn-primary'
                        }
                    }
                });
            }
            break;
        case ESTADO_TECNOLOGIA.REGISTRADO:
        case ESTADO_TECNOLOGIA.OBSERVADO:
        case ESTADO_TECNOLOGIA.PROCESOREVISION:
            //debugger;
            bootbox.alert({
                size: "sm",
                title: TITULO_MENSAJE,
                message: String.Format("La tecnología se encuentra en estado {0}, no es posible editar.", EstadoTecnologiaStr),
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-primary'
                    }
                }
            });
            break;
    }
}

function migrarEquivalencias() {
    if ($("#formMigrarEquivalencia").valid()) {
        $("#btnMigrarEquivalencia").button("loading");

        let TecnologiaEmisorId = $("#hIdTec").val();
        let TecnologiaReceptorId = $("#hdTecReceptora").val();

        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: URL_API_VISTA + `/MigrarEquivalenciasTecnologia?TecnologiaEmisorId=${TecnologiaEmisorId}&TecnologiaReceptorId=${TecnologiaReceptorId}&Usuario=${Usuario}`,
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        $("#btnMigrarEquivalencia").button("reset");
                        $("#mdMigrarEquivalencia").modal('hide');
                        console.log(dataObject);
                        toastr.success("La migración de equivalencias procedió satisfactoriamente", TITULO_MENSAJE);
                        listarTecSTD();
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });

    }
}

function validarFormMigrarEquivalencias() {

    $.validator.addMethod("existeTecnologiaReceptora", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            estado = ExisteTecnologia($("#hdTecReceptora"));
            return estado;
        }
        return estado;
    });

    $("#formMigrarEquivalencia").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        onfocusout: false,
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtTecReceptora: {
                requiredSinEspacios: true,
                existeTecnologiaReceptora: true
            }
        },
        messages: {
            txtTecReceptora: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre de la tecnología"),
                existeTecnologiaReceptora: String.Format("{0} seleccionada no existe.", "La tecnología")
            }
        }
    });
}
function getSubdominiosByDomCbMultiple($cbSub) {
    //var domId = _domIds;
    let idsDominio = CaseIsNullSendFilter($("#cbFilDom").val());

    if (idsDominio)
        $.ajax({
            url: URL_API_VISTA_DASH + "/ListarCombos/Dominio",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(idsDominio),
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (dataObject)
                    SetItemsMultiple(dataObject.Subdominio, $cbSub, TEXTO_TODOS, TEXTO_TODOS, true);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function () {

            },
            async: true
        });

}