var $table = $("#tbl-tec");
var $tblAutTec = $("#tblAutTec");
var $tblTecEqList = $("#tblTecEqList");
var $tblTecEqGeneral = $("#tblTecEqGeneral");

var urlApiSubdom = URL_API + "/Subdominio";
var urlApiFam = URL_API + "/Familia";

var URL_API_VISTA = URL_API + "/Tecnologia";
var ItemNumeros = [0, 1, 2, 3, 4, 5];
var ItemsRemoveAutId = [];
var DATA_SUBDOMINIO = [];
var DATA_TECNOLOGIA = [];
//var DATA_APLICACION = [];
var DATA_EXPORTAR = {};
var DATA_EXPORTAR_TEC_EQ = {};

var CODIGO_INTERNO = 0;

$(function () {
    InitFecha();
    initUpload($('#txtNomDiagCasoUso'));
    $tblAutTec.bootstrapTable();
    validarAddOrEditFormTec();
    cargarCombos();
    CargarCombos2();

    //setItemsCb($("#cbFilDom"), "/Dominio");
    //setItemsCb($("#cbFamTec"), "/Familia");
    //setItemsCb($("#cbTipTec"), "/Tipo");
    setItemsCb($("#cbDomTec"), "/Dominio/ConSubdominio");

    $("#cbDomTec").on('change', function () {
        getSubdominiosByDom(this.value);
    });
    $("#cbFilDom").on('change', function () {
        getSubdominiosByDomCb(this.value);
    });

    //$("#cbFamTec").on('change', function () {
    //    LimpiarValidateErrores($("#formAddOrEditTec"));
    //    if (this.value !== "-1") {
    //        obtenerFamiliaById(this.value);
    //    }
    //});

    $("#cbTipTec").on('change', function () {
        LimpiarValidateErrores($("#formAddOrEditTec"));
        var valRiesgo = $("option:selected", this).text() === "Estándar" ? "0" : "5";
        $("#cbRiesgTec").val(valRiesgo);
    });

    FormatoCheckBox($("#divFlagFecSop"), "cbFlagFecSop");
    $("#cbFlagFecSop").change(FlagFecSop_Change);

    FormatoCheckBox($("#divFlagApp"), "cbFlagApp");
    $("#cbFlagApp").change(FlagApp_Change);

    $("#cbFuenteTec").on('change', cbFecSopManual_Change);

    listarTec();
    //getTecnologias();
    //getAplicaciones();
    InitAutocompletarAplicacion($("#txtApp"), $("#hdIdApp"), $(".appContainer"));
    InitAutocompletarTecnologia($("#txtElimTec"), $("#hIdTecObs"), $(".elimContainer"));
    InitAutocompletarFamilia($("#txtFamTec"), $("#hFamTecId"), $(".famContainer"));

    $("#txtFabricanteTec, #txtNomTec, #txtVerTec").keyup(function () {
        $("#txtClaveTecnologia").val(String.Format("{0} {1} {2}", $.trim($("#txtFabricanteTec").val()), $.trim($("#txtNomTec").val()), $.trim($("#txtVerTec").val())));
    });

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
    var flagFecSop = $(this).prop("checked");
    //$(".form-control").removeClass("ignore");
    //$(".matricula-auto").addClass("ignore");
    LimpiarValidateErrores($("#formAddOrEditTec"));
    //$("#formAddOrEditTec").validate().resetForm();
    //$("#formAddOrEditTec").valid();
    //debugger;
    if (flagFecSop)
        $("#FecSopContainer").removeClass("tec");
    else
        $("#FecSopContainer").addClass("tec");
}

function FlagApp_Change() {
    var flagApp = $(this).prop("checked");
    LimpiarValidateErrores($("#formAddOrEditTec"));
    //$("#formAddOrEditTec").validate().resetForm();
    if (flagApp)
        $("#AppContainer").removeClass("tec");
    else
        $("#AppContainer").addClass("tec");
}

function getSubdominiosByDomCb(_domId) {
    var domId = _domId;

    $("#cbFilSub").append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $.ajax({
        url: URL_API_VISTA + "/Subdominios/" + domId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            data = result;
            $("#cbFilSub").find("option:gt(0)").remove();

            $.each(data, function (i, item) {
                $("#cbFilSub").append($('<option>', {
                    value: item.Id,
                    text: item.Nombre
                }));
            });
        },
        complete: function () {
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function getSubdominiosByDom(_domId) {
    var domId = _domId;
    var itemsSubdom = [];
    $.ajax({
        url: URL_API_VISTA + "/Subdominios/" + domId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            var data = result;
            $.each(data, function (key, val) {
                var item = {
                    value: val.Id,
                    label: val.Nombre
                };
                itemsSubdom.push(item);
            });
            DATA_SUBDOMINIO = itemsSubdom;
        },
        complete: function () {
            autocompletarSubdominios(itemsSubdom, $('#txtSubTec'), $("#hIdSubTec"), $(".subtecContainer"));
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function autocompletarSubdominios(subTags, inputX, inputHX, containerX) {
    var $searchBox = inputX;
    var $inputHX = inputHX;
    var $containerX = containerX;
    $searchBox.autocomplete({
        appendTo: $containerX,
        minLength: 0,
        source: subTags,
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $inputHX.val(ui.item.value);
            $searchBox.val(ui.item.label);
            getMatriculaDueno(ui.item.value);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.label + "</font></a>")
            .appendTo(ul);
    };
}

function getMatriculaDueno(id) {
    $.ajax({
        url: urlApiSubdom + "/ObtenerMatricula/" + id,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        dataType: "json",
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

function addItemAutorizador() {
    $(".form-control").addClass("ignore");
    $(".matricula-auto").removeClass("ignore");

    if ($("#formAddOrEditTec").valid()) {
        var matAut = $("#txtMatAutTec").val();
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

function removeItemAutorizador(Id) {
    ItemsRemoveAutId.push(Id);
    $tblAutTec.bootstrapTable('remove', {
        field: 'Id', values: [Id]
    });
}

function formatOpcTec(value, row, index) {
    var btnTrash = `  <a id='btnRemAutTec' class='btn btn-danger' href='javascript: void(0)' onclick='removeItemAutorizador(${row.Id})'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return btnTrash;
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
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
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

function validarAddOrEditFormTec() {

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

    $.validator.addMethod("existeFamilia", function (value, element) {

        let estado = true;
        if ($.trim(value) !== "" && $.trim(value).length >= 3) {
            estado = ExisteFamilia();
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("existeSubdominio", function (value, element) {

        let estado = false;
        let Id = $("#hIdSubTec").val();
        let first_data = DATA_SUBDOMINIO.find(x => x.value.toString() === Id && x.label === value) || null;
        if (first_data !== null) estado = true;

        return estado;
    });

    $.validator.addMethod("existeTecnologia", function (value, element) {
        // debugger
        let estado = true;
        if ($.trim(value) !== "" && $.trim(value).length >= 3) {
            estado = ExisteTecnologia();
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("requiredMinMatricula", function (value, element) {
        // debugger
        let minMatricula = $tblAutTec.bootstrapTable('getData');
        let estado = minMatricula.length > 0 ? true : false;

        return estado;
    });

    $.validator.addMethod("decimal_vulnerabilidad", function (value, element) {
        //debugger
        let regex = new RegExp(regexDecimal);
        if (regex.test(value)) {
            if (value < 6.0) return true;
        }
        return false;
    });

    //$.validator.addMethod("fecha_tecnologia", function (value, element) {
    //    if ($("#cbFlagFecSop").prop("checked")) {
    //        return $.trim(value) !== "";
    //    }
    //    return true;
    //});

    $.validator.addMethod("fecha_tecnologia", function (value, element) {
        //debugger
        if ($("#cbFlagFecSop").prop("checked")) {
            if (parseInt($("#cbFuenteTec").val()) === 3) {
                return $.trim(value) !== "";
            }
        }
        return true;
    });

    $.validator.addMethod("manual_fecha_tecnologia", function (value, element) {
        //debugger
        if ($("#cbFlagFecSop").prop("checked")) {
            if (parseInt($("#cbFuenteTec").val()) === 3) {
                value = value || null;
                return value != "-1" && value != null;
            }
        }
        return true;
    });

    $.validator.addMethod("combo_fecha_tecnologia", function (value, element) {
        // debugger
        if ($("#cbFlagFecSop").prop("checked")) {
            value = value || null;
            return value != "-1" && value != null;
        }
        return true;
    });

    $.validator.addMethod("flagActivoAplicacion", function (value, element) {
        //debugger
        if ($("#cbFlagApp").prop("checked")) {
            return $.trim(value) !== "";
        }
        return true;
    });

    $.validator.addMethod("existeClaveTecnologia", function (value, element) {
        //debugger;
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
            msjValidTbl: {
                requiredMinMatricula: true
            },
            dpFecLanTec: {
                fecha_tecnologia: true
            },
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
                //requiredSelect: true
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
                requiredSinEspacios: true,
                existeSubdominio: true
            },
            txtElimTec: {
                //requiredSinEspacios: true,
                existeTecnologia: false
            },
            txtPlanTransTec: {
                requiredSinEspacios: true
            },
            txtEsqMonTec: {
                requiredSinEspacios: true
            },
            txtLinSegTec: {
                requiredSinEspacios: true
            },
            txtPatManTec: {
                requiredSinEspacios: true
            },
            txtDueTec: {
                requiredSinEspacios: true
            },
            txtEqAdmTec: {
                requiredSinEspacios: true
            },
            txtGrupRemTec: {
                requiredSinEspacios: true
            },
            txtConfArqSegTec: {
                requiredSinEspacios: true
            },
            txtConfArqTec: {
                requiredSinEspacios: true
            },
            txtRenConTec: {
                requiredSinEspacios: true
            },
            txtEsqLinTec: {
                requiredSinEspacios: true
            },
            txtSopEmpTec: {
                requiredSinEspacios: true
            },
            txtMatAutTec: {
                requiredSinEspacios: true
            },
            txtFamTec: {
                requiredSinEspacios: true,
                existeFamilia: true
            },
            cbTipTec: {
                requiredSelect: true
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
            msjValidTbl: {
                requiredMinMatricula: String.Format("Debes registrar {0}.", "un item")
            },
            dpFecLanTec: {
                fecha_tecnologia: String.Format("Debes ingresar {0}.", "la fecha de lanzamiento")
            },
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
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el subdominio"),
                existeSubdominio: String.Format("{0} seleccionado no existe.", "el subdominio")
            },
            txtElimTec: {
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "la tecnología obsoleta"),
                existeTecnologia: String.Format("{0} seleccionado no existe.", "la tecnología")
            },
            txtPlanTransTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el plan de transferencia de conocimiento")
            },
            txtEsqMonTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el esquema de monitoreo")
            },
            txtLinSegTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la linea base de seguridad")
            },
            txtPatManTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la definición del esquema de path management")
            },
            txtDueTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el dueño de la tecnología")
            },
            txtEqAdmTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el equipo de administración y punto de contacto")
            },
            txtGrupRemTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el grupo de soporte")
            },
            txtConfArqSegTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la conformidad del arquitecto de seguridad")
            },
            txtConfArqTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la conformidad del arquitecto de tecnología")
            },
            txtRenConTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el encargado de renovación contractual")
            },
            txtEsqLinTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el esquema de licenciamiento")
            },
            txtSopEmpTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el soporte empresarial")
            },
            txtMatAutTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la matrícula")
            },
            txtFamTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "una familia"),
                existeFamilia: String.Format("{0} seleccionado no existe.", "la familia")
            },
            cbTipTec: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo de tecnología")
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

function buscarTec() {
    listarTec();
}

function listarTec() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusTec").val());
            DATA_EXPORTAR.domId = $("#cbFilDom").val();
            DATA_EXPORTAR.subdomId = $("#cbFilSub").val();
            DATA_EXPORTAR.aplica = $("#txtFilAplica").val();
            DATA_EXPORTAR.codigo = $("#txtFilCodigo").val();
            DATA_EXPORTAR.dueno = $("#txtFilDueno").val();
            DATA_EXPORTAR.equipo = $("#txtFilEquipo").val();
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

    $("#txtFamTec").val('');
    $("#cbTipTec").val(-1);
    $("#cbFuenteTec, #cbExisTec, #cbFacAcTec, #cbRiesgTec").val(-1);
    $("#txtVulTec").val('');

    $("#txtCusTec, #txtReqHSTec, #txtCompaTec, #txtApliTec").val('');

    //Tab Datos Transferencia
    $("#cbDomTec").val(-1);
    $("#txtSubTec, #txtElimTec, #txtRefTec, #txtPlanTransTec , #txtEsqMonTec, #txtLinSegTec, #txtPatManTec").val('');

    //Tab Responsabilidades
    $('#txtDueTec, #txtEqAdmTec, #txtGrupRemTec, #txtConfArqSegTec, #txtConfArqTec, #txtRenConTec, #txtEsqLinTec, #txtSopEmpTec').val('');
    $('#txtAutoTec').val('');

    //Tab Aprobacion  
    $('#txtCodAsigTec, #txtArqTec, #txtObsTec').val('');
    $('#txtMatAutTec').val('');
    $("#cbFlagFecSop").prop("checked", true);
    $("#cbFlagFecSop").bootstrapToggle("on");

    $("#cbFlagApp").prop("checked", false);
    $("#cbFlagApp").bootstrapToggle("off");
    $("#cbFlagApp").trigger("change");
    $("#txtApp").val("");
    $("#hdIdApp").val("0");
    $("#txtClaveTecnologia").val("");
    $("#txtFabricanteTec").val("");
    $("#cbFecCalTec").val(-1);

    $("#txtNomDiagCasoUso").val(TEXTO_SIN_ARCHIVO);
    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
}

function formatNombre(value, row, index) {
    return `<a href="javascript:editarTec(${row.Id},'${row.EstadoTecnologiaStr}')" title="Editar">${value}</a>`;
}

function formatOpciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let estado = `<a href="javascript:cambiarEstado(${row.Id})" title="Cambiar estado"><i style="" id="cbOpcTec${row.Id}" class="${style_color} glyphicon glyphicon-check table-icon"></i></a>`;
    return estado;
}

function cambiarEstado(TecId) {
    bootbox.confirm({
        message: "¿Estás seguro que deseas cambiar el estado del registro seleccionado?",
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
                                toastr.success("Se cambió el estado correctamente", "Tecnología");
                                listarTec();
                            }
                        }
                        else {
                            toastr.error("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "Tecnología");
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    },
                    complete: function (data) {
                        $("#txtBusTec").val('');
                        $("#cbFilDom").val(-1);
                        $("#cbFilSub").val(-1);
                        waitingDialog.hide();
                    }
                });
            }
        }
    });
}

function addTec() {
    // $("#txtNomDiagCasoUso").val('Ningún archivo seleccionado');
    //
    $("#titleFormTec").html("Nueva Tecnología");
    $("#hIdTec").val('');
    $("#hActTec").val(true);
    //$("#btnConTec").attr("disabled", true);
    $tblAutTec.bootstrapTable('destroy');
    $tblAutTec.bootstrapTable();
    mdAddOrEditTec(true);
    $("#AppContainer").addClass("tec");
    $('a[data-toggle="tab"]')[0].click();
}

function editarTec(TecId, EstadoTecnologiaStr) {
    //$("#txtNomDiagCasoUso").val('Ningún archivo seleccionado');
    if (EstadoTecnologiaStr === 'En proceso de revisión') {
        bootbox.alert({
            size: "sm",
            title: "Tecnologías",
            message: "La tecnología se encuenta en proceso de revisión, no es posible editar.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    } else {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

        if (EstadoTecnologiaStr === 'Observado') {
            $("#btnRegTec").attr("disabled", true);
        }

        ItemsRemoveAutId = [];
        $tblAutTec.bootstrapTable('destroy');
        $tblAutTec.bootstrapTable();
        //$("#btnConTec").attr("disabled", false);
        $("#titleFormTec").html("Editar Registro Tecnología");
        $.ajax({
            url: URL_API_VISTA + "/" + TecId,
            type: "GET",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            dataType: "json",
            success: function (result) {
                waitingDialog.hide();
                var estadoTec = result.EstadoTecnologia;
                if (estadoTec === 1 || estadoTec === 4) {
                    mdAddOrEditTec(true);

                    //Tab 1
                    $("#hIdTec").val(result.Id); //Id Tecnologia
                    //getTecnologias();
                    $("#hActTec").val(result.Activo); //Valor activo
                    $("#hIdSubTec").val(result.SubdominioId); //Id Subdominio
                    $("#hIdTecObs").val(result.EliminacionTecObsoleta == null ? "" : result.EliminacionTecObsoleta);  //Id Tec Obsoleta
                    $("#hEstTec").val(result.EstadoTecnologia); //Flag estado tecnologia
                    $("#txtClaveTecnologia").val(result.ClaveTecnologia);

                    $("#hdIdApp").val(result.CodigoAPT); //Id CodigoAPT
                    $("#txtNomTec").val(result.Nombre);
                    $("#txtDesTec").val(result.Descripcion);
                    $("#txtVerTec").val(result.Versiones);
                    //$("#cbFamTec").val(result.FamiliaId === null ? -1 : result.FamiliaId);
                    $("#hFamTecId").val(result.FamiliaId);
                    $("#cbTipTec").val(result.TipoTecnologiaId === null ? -1 : result.TipoTecnologiaId);
                    $("#txtFabricanteTec").val(result.Fabricante);
                    $("#cbFlagFecSop").prop('checked', result.FlagFechaFinSoporte);
                    $('#cbFlagFecSop').bootstrapToggle(result.FlagFechaFinSoporte ? 'on' : 'off');
                    $("#cbFlagFecSop").trigger("change");
                    //FlagFecSop_Change();
                    $("#dpFecLanTec").val(result.FechaLanzamientoToString);
                    $("#dpFecExtTec").val(result.FechaExtendidaToString);
                    $("#dpFecSopTec").val(result.FechaFinSoporteToString);
                    $("#dpFecIntTec").val(result.FechaAcordadaToString);
                    $("#txtComTec").val(result.ComentariosFechaFin);
                    $("#cbFuenteTec").val(result.Fuente === null ? -1 : result.Fuente);
                    $("#cbFecCalTec").val(result.FechaCalculoTec === null ? -1 : result.FechaCalculoTec);
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
                    getSubdominiosByDom(result.DominioId);
                    $("#txtSubTec").val(result.SubdominioNomb);
                    $("#txtElimTec").val(result.EliminacionTecNomb == "" ? result.RoadmapOpcional : result.EliminacionTecNomb);
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
                    if (result.ClaveTecnologia == null) $("#txtFabricanteTec").trigger("keyup");
                    var data = result.ListAutorizadores;
                    //console.log(data.length);
                    if (data.length > 0) {
                        $tblAutTec.bootstrapTable('destroy');
                        $tblAutTec.bootstrapTable({ data: data });
                    }
                    if (result.ArchivoId !== null) {
                        $("#txtNomDiagCasoUso").val(result.ArchivoStr);
                        $("#hdArchivoId").val(result.ArchivoId);
                        $("#btnDescargarFile").show();
                        $("#btnEliminarFile").show();
                        //$(".div-controls-file").show();
                    }

                } else if (estadoTec === 3) {
                    bootbox.alert({
                        size: "sm",
                        title: "Tecnologías",
                        message: "La tecnología se encuenta en estado Aprobado, no es posible editar.",
                        buttons: {
                            ok: {
                                label: 'Aceptar',
                                className: 'btn-primary'
                            }
                        }
                    });
                }
                $('a[data-toggle="tab"]')[0].click();
                $(".form-control").removeClass("ignore");
                $(".matricula-auto").addClass("ignore");
                //$("#formAddOrEditTec").validate().resetForm();
                //$("#formAddOrEditTec").valid();

            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                waitingDialog.hide();
            }
        });
    }
}

function castDate(date) {
    var fechaTemp = date;
    var vectorDate = fechaTemp.split("/");
    var anio = vectorDate[2];
    var mes = vectorDate[1];
    var dia = vectorDate[0];

    return anio.toString() + "/" + mes + "/" + dia;
}

function guardarAddOrEditTec() {
    $(".form-control").removeClass("ignore");
    $(".matricula-auto").addClass("ignore");

    if ($("#formAddOrEditTec").valid()) {

        $("#btnRegTec").button("loading");

        var tec = {};
        tec.Id = ($("#hIdTec").val() === "") ? 0 : parseInt($("#hIdTec").val());
        tec.Activo = $("#hActTec").val();
        tec.EstadoTecnologia = 1;
        tec.ClaveTecnologia = $("#txtClaveTecnologia").val();
        //Tab 1
        tec.Nombre = $("#txtNomTec").val();
        tec.Descripcion = $("#txtDesTec").val();
        tec.Versiones = $("#txtVerTec").val();
        tec.FamiliaId = $("#hFamTecId").val();
        tec.TipoTecnologiaId = $("#cbTipTec").val();
        tec.Fabricante = $("#txtFabricanteTec").val();
        tec.FlagFechaFinSoporte = $("#cbFlagFecSop").prop("checked");
        tec.FlagFechaFinSoporte = $("#cbFlagFecSop").prop("checked");
        tec.Fuente = tec.FlagFechaFinSoporte ? $("#cbFuenteTec").val() : null;
        tec.FechaLanzamiento = tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecLanTec").val()) : null) : null;
        tec.FechaExtendida = tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecExtTec").val()) : null) : null;
        tec.FechaFinSoporte = tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecSopTec").val()) : null) : null;
        tec.FechaAcordada = tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecIntTec").val()) : null) : null;
        tec.FechaCalculoTec = tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? $("#cbFecCalTec").val() : null) : null;
        tec.ComentariosFechaFin = $("#txtComTec").val();
        tec.Existencia = $("#cbExisTec").val();
        tec.Facilidad = $("#cbFacAcTec").val();
        tec.Vulnerabilidad = $("#txtVulTec").val();
        tec.CasoUso = $("#txtCusTec").val();
        tec.Requisitos = $("#txtReqHSTec").val();
        tec.Compatibilidad = $("#txtCompaTec").val();
        tec.Aplica = $("#txtApliTec").val();
        tec.FlagAplicacion = $("#cbFlagApp").prop("checked");
        tec.CodigoAPT = tec.FlagAplicacion ? $("#hdIdApp").val() : null;

        //Tab 2
        tec.SubdominioId = $("#hIdSubTec").val();
        tec.EliminacionTecObsoleta = $("#hIdTecObs").val() === "" ? null : parseInt($("#hIdTecObs").val());
        tec.RoadmapOpcional = $.trim($("#txtElimTec").val()) === "" || $("#hIdTecObs").val() != "" ? null : $("#txtElimTec").val();
        tec.Referencias = $("#txtRefTec").val();
        tec.PlanTransConocimiento = $("#txtPlanTransTec").val();
        tec.EsqMonitoreo = $("#txtEsqMonTec").val();
        tec.LineaBaseSeg = $("#txtLinSegTec").val();
        tec.EsqPatchManagement = $("#txtPatManTec").val();

        //Tab 3
        tec.Dueno = $("#txtDueTec").val();
        tec.EqAdmContacto = $("#txtEqAdmTec").val();
        tec.GrupoSoporteRemedy = $("#txtGrupRemTec").val();
        tec.ConfArqSeg = $("#txtConfArqSegTec").val();
        tec.ConfArqTec = $("#txtConfArqTec").val();
        tec.EncargRenContractual = $("#txtRenConTec").val();
        tec.EsqLicenciamiento = $("#txtEsqLinTec").val();
        tec.SoporteEmpresarial = $("#txtSopEmpTec").val();
        tec.ListAutorizadores = $tblAutTec.bootstrapTable('getData');
        tec.ItemsRemoveAutId = ItemsRemoveAutId;

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(tec),
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            dataType: "json",
            success: function (result) {
                var data = result;
                if (data > 0) {
                    let archivoId = $("#hdArchivoId").val() == "" ? 0 : parseInt($("#hdArchivoId").val());
                    if ((archivoId == 0 && $("#txtNomDiagCasoUso").val() != TEXTO_SIN_ARCHIVO) || archivoId > 0) {
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
                $("#btnRegTec").button("reset");
                $("#txtBusTec").val('');
                $("#cbFilDom").val(-1);
                $("#cbFilSub").val(-1);
                $table.bootstrapTable('refresh');
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    } else {
        toastr.error('Faltan completar campos', 'Tecnología');
    }
}

function confirmarTec() {
    $(".form-control").removeClass("ignore");
    $(".matricula-auto").addClass("ignore");
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
                    var tec = {};
                    tec.Id = ($("#hIdTec").val() === "") ? 0 : parseInt($("#hIdTec").val());
                    tec.Activo = $("#hActTec").val();
                    tec.EstadoTecnologia = 2;
                    tec.ClaveTecnologia = $("#txtClaveTecnologia").val();
                    //Tab 1
                    tec.Nombre = $("#txtNomTec").val();
                    tec.Descripcion = $("#txtDesTec").val();
                    tec.Versiones = $("#txtVerTec").val();
                    tec.FamiliaId = $("#hFamTecId").val();
                    tec.TipoTecnologiaId = $("#cbTipTec").val();
                    tec.Fabricante = $("#txtFabricanteTec").val();
                    tec.FlagFechaFinSoporte = $("#cbFlagFecSop").prop("checked");
                    tec.FechaLanzamiento = tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecLanTec").val()) : null) : null;
                    tec.FechaExtendida = tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecExtTec").val()) : null) : null;
                    tec.FechaFinSoporte = tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecSopTec").val()) : null) : null;
                    tec.FechaAcordada = tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecIntTec").val()) : null) : null;
                    tec.FechaCalculoTec = tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? $("#cbFecCalTec").val() : null) : null;
                    tec.ComentariosFechaFin = $("#txtComTec").val();
                    tec.Fuente = tec.FlagFechaFinSoporte ? $("#cbFuenteTec").val() : null;
                    tec.Existencia = $("#cbExisTec").val();
                    tec.Facilidad = $("#cbFacAcTec").val();
                    tec.Vulnerabilidad = $("#txtVulTec").val();
                    tec.CasoUso = $("#txtCusTec").val();
                    tec.Requisitos = $("#txtReqHSTec").val();
                    tec.Compatibilidad = $("#txtCompaTec").val();
                    tec.Aplica = $("#txtApliTec").val();
                    tec.FlagAplicacion = $("#cbFlagApp").prop("checked");
                    tec.CodigoAPT = tec.FlagAplicacion ? $("#hdIdApp").val() : null;

                    //Tab 2
                    tec.SubdominioId = $("#hIdSubTec").val();
                    tec.EliminacionTecObsoleta = $("#hIdTecObs").val() === "" ? null : parseInt($("#hIdTecObs").val());
                    tec.RoadmapOpcional = $.trim($("#txtElimTec").val()) === "" || $("#hIdTecObs").val() != "" ? null : $("#txtElimTec").val();
                    tec.Referencias = $("#txtRefTec").val();
                    tec.PlanTransConocimiento = $("#txtPlanTransTec").val();
                    tec.EsqMonitoreo = $("#txtEsqMonTec").val();
                    tec.LineaBaseSeg = $("#txtLinSegTec").val();
                    tec.EsqPatchManagement = $("#txtPatManTec").val();

                    //Tab 3
                    tec.Dueno = $("#txtDueTec").val();
                    tec.EqAdmContacto = $("#txtEqAdmTec").val();
                    tec.GrupoSoporteRemedy = $("#txtGrupRemTec").val();
                    tec.ConfArqSeg = $("#txtConfArqSegTec").val();
                    tec.ConfArqTec = $("#txtConfArqTec").val();
                    tec.EncargRenContractual = $("#txtRenConTec").val();
                    tec.EsqLicenciamiento = $("#txtEsqLinTec").val();
                    tec.SoporteEmpresarial = $("#txtSopEmpTec").val();

                    tec.ListAutorizadores = $tblAutTec.bootstrapTable('getData');
                    tec.ItemsRemoveAutId = ItemsRemoveAutId;
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
                                let archivoId = $("#hdArchivoId").val() == "" ? 0 : parseInt($("#hdArchivoId").val());
                                if ((archivoId == 0 && $("#txtNomDiagCasoUso").val() != TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                                    UploadFile($("#flDiagCasoUso"), CODIGO_INTERNO, data, archivoId);
                                }
                                bootbox.alert({
                                    size: "sm",
                                    title: "Tecnologías",
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
                            $("#txtBusTec").val('');
                            $("#cbFilDom").val(-1);
                            $("#cbFilSub").val(-1);
                            $table.bootstrapTable('refresh');
                        }
                    });
                }
            }
        });
    } else {
        toastr.error('Faltan completar campos', 'Tecnología');
    }
}

function cargarCombos() {
    SetItems(ItemNumeros.filter(x => ![0].includes(x)), $("#cbExisTec"), TEXTO_SELECCIONE);
    SetItems(ItemNumeros.filter(x => [1, 3, 5].includes(x)), $("#cbFacAcTec"), TEXTO_SELECCIONE);
    SetItems(ItemNumeros.filter(x => [1, 5].includes(x)), $("#cbRiesgTec"), TEXTO_SELECCIONE);
}

function CargarCombos2() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    SetItems(dataObject.Fuente, $("#cbFuenteTec"), TEXTO_SELECCIONE);
                    SetItems(dataObject.FechaCalculo, $("#cbFecCalTec"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Dominio, $("#cbFilDom"), TEXTO_TODOS);
                    SetItems(dataObject.Familia, $("#cbFamTec"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoTec, $("#cbTipTec"), TEXTO_SELECCIONE);
                    CODIGO_INTERNO = dataObject.CodigoInterno;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function exportarTec() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        bootbox.alert({
            size: "small",
            title: "Tecnologías",
            message: "No hay datos para exportar.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
        return false;
    }

    let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre}&dominioId=${DATA_EXPORTAR.domId}&subdominioId=${DATA_EXPORTAR.subdomId}&aplica=${DATA_EXPORTAR.aplica}&codigo=${DATA_EXPORTAR.codigo}&dueno=${DATA_EXPORTAR.dueno}&equipo=${DATA_EXPORTAR.equipo}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;

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

function ExisteFamilia() {
    let estado = false;
    let Id = $("#hFamTecId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Familia" + `/ExisteFamilia?Id=${Id}`,
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

function InitAutocompletarFamilia($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
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
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            obtenerFamiliaById(ui.item.Id);
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
    //let nombre = $("#txtApp").val();
    let Id = $("#hdIdApp").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Aplicacion" + `/ExisteAplicacion?Id=${Id}`,
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

function ExisteTecnologia() {
    let estado = false;
    //let nombre = $("#txtTecnologia").val();
    let Id = $("#hIdTecObs").val();
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
                    url: URL_API + "/Tecnologia" + "/GetTecnologiaByClaveById",
                    data: JSON.stringify({
                        filtro: request.term,
                        id: ($("#hIdTec").val() === "" || $("#hIdTec").val() === "0") ? null : parseInt($("#hIdTec").val())
                    }),
                    dataType: "json",
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

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
                return response(false);
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
function ExisteClaveTecnologia() {
    let estado = true;
    let claveTecnologia = $("#txtClaveTecnologia").val();
    let id = $("#hIdTec").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteClaveTecnologia?clave=${claveTecnologia}&Id=${id}`,
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
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'desc',
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
    listarTecnologiasEquivalentes($tblTecEqList, $("#mdTecEqList"));
}

function verEquivalencias() {
    listarTecnologiasEquivalentes($tblTecEqGeneral, $("#mdTecEqGeneral"));
}

function exportarEquivalenciasGeneral() {
    let _data = $tblTecEqGeneral.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        bootbox.alert({
            size: "small",
            title: "Tecnologías",
            message: "No hay datos para exportar.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
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