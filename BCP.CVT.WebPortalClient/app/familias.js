var $table = $("#tbl-familias");
var $tableTec = $("#tblTecByFam");
var $tblTecVin = $("#tblTecVin");

var URL_API_VISTA = URL_API + "/Familia";
var DATA_EXPORTAR = {};
var DATA_EXPORTAR_TEC_ASOC = {};
var DATA_EXPORTAR_TEC_VIN = {};
var ItemNumeros = [0, 1, 2, 3, 4, 5];
var FAM_EXISTENCIA = null;
var FAM_FACILIDAD = null;
var FAM_RIESGO = null;
var FAM_VULNERABILIDAD = null;
var TITULO_MENSAJE = "Familia de Tecnologías";
var TECNOLOGIA_FAMILIA = "";

$(function () {
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({ data: [] });

    $tblTecVin.bootstrapTable('destroy');
    $tblTecVin.bootstrapTable({ data: [] });

    $tableTec.bootstrapTable('destroy');
    $tableTec.bootstrapTable({ data: [] });

    //InitFecha();

    FormatoCheckBox($("#divActivo"), 'cbActFamilia');
    $("#cbActFamilia").change(function () {
        LimpiarValidateErrores($("#formAddOrEditFamilia"));
        //$("#formAddOrEditFamilia").validate().resetForm();
    });

    listarFamilias();
    validarForms();
    validarFormTecnologia();

    window.onbeforeunload = function (e) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        waitingDialog.hide();
    };
    window.onblur = function (e) {
        waitingDialog.hide();
    };

    cargarCombos();
    cargarValoresPorDefecto();

    InitAutocompletarTecnologiaByFamilia($("#txtTecnologia"), $("#hdTecnologiaId"), ".tecContainer");
    setDefaultHd($("#txtTecnologia"), $("#hdTecnologiaId"));
});

function InitAutocompletarTecnologiaByFamilia($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let data = {};
                data.Id = null;//parseInt($("#hIdTec").val()) === 0 ? null : parseInt($("#hIdTec").val());
                data.IdsTec = $tableTec.bootstrapTable("getData").map(x => x.Id) || [];
                data.Filtro = request.term;
                TECNOLOGIA_FAMILIA = "";
                $IdBox.val("0");
                $.ajax({
                    //url: URL_API + "/Tecnologia/GetTecnologiaArquetipoByClave?filtro=" + request.term,
                    url: URL_API + `/Tecnologia/GetTecnologiaByFiltroById`,
                    //type: "GET",
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
            } else {
                return response(true);
            }
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            //LimpiarValidateErrores($("#formTecByArq"));
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            TECNOLOGIA_FAMILIA = ui.item.Familia;
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function guardarTecnologia() {
    LimpiarValidateErrores($("#formTecByFam"));
    if ($("#formTecByFam").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: String.Format("La tecnología ya se encuentra asociada a la familia {0}, ¿Desea cambiar de familia?", TECNOLOGIA_FAMILIA),
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
                    let data = {};
                    data.FamiliaId = $("#hIdFamilia").val();
                    data.TecnologiaId = $("#hdTecnologiaId").val();

                    $("#btnRegTec").button("loading");

                    $.ajax({
                        url: URL_API_VISTA + "/AsociarTecnologiaByFamilia",
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(data),
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                        success: function (result) {
                            var response = result;
                            if (response) {
                                toastr.success("Se relacionó correctamente", TITULO_MENSAJE);
                                $("#txtTecnologia").val("");
                                listarTecnologiasByFamilia();
                                listarFamilias();
                            }
                            else
                                toastr.error('Ocurrio un problema', TITULO_MENSAJE);
                        },
                        complete: function () {
                            $("#btnRegTec").button("reset");
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
            }
        }); 
    }
}

function InitFecha() {
    $("#dpFecSopFamilia-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
    $("#dpFecExtFamilia-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#dpFecIntFamilia-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    //$("#dateFechaInicio").on("dp.change", function (e) {
    //    $('#dateFechaFin').data("DateTimePicker").minDate(e.date);
    //});
    //$("#dateFechaFin").on("dp.change", function (e) {
    //    $('#dateFechaInicio').data("DateTimePicker").maxDate(e.date);
    //});
}
function DatepickerFamilia(dtpInput, dtpButton) {
    var $datepicker = dtpInput, //input
        $datepickerBtn = dtpButton; //boton

    $datepicker.datepicker({
        autoclose: true,
        orientation: 'bottom',
        format: 'dd/mm/yyyy',
        showOnFocus: false,
        language: 'es'
    });

    $datepickerBtn.on('click', function (evt) {
        $datepicker.datepicker('show');
    });
}
function BuscarFamilia() {
    listarFamilias();
}
function LimpiarMdAddOrEditFamilia() {
    LimpiarValidateErrores($("#formAddOrEditFamilia"));
    $("#txtNomFamilia").val('');
    $("#txtDesFamilia").val('');
    $("#txtFabricante").val("");
    /*$("#dpFecSopFamilia").val('');
    $("#dpFecExtFamilia").val('');
    $("#dpFecIntFamilia").val(''); */

    $("#cbExisTec").val(FAM_EXISTENCIA);
    $("#cbFacAcTec").val(FAM_FACILIDAD);
    $("#cbRiesgTec").val(FAM_RIESGO);
    $("#txtVulTec").val(FAM_VULNERABILIDAD); 

    $("#cbActFamilia").prop("checked", true);
    $("#cbActFamilia").bootstrapToggle('on');
}
function evaluarFecha_dpFecSopFamilia1(dpFecSopFamilia1, dpFecExtFamilia2, dpFecIntFamilia3) {
    dpFecSopFamilia1 = moment(dpFecSopFamilia1);
    dpFecExtFamilia2 = moment(dpFecExtFamilia2);
    let est1 = dpFecSopFamilia1.diff(dpFecExtFamilia2, 'd');
    let estado = est1 <= 0;
    //debugger;
    return estado;
}
function evaluarFecha_dpFecExtFamilia2(dpFecSopFamilia1, dpFecExtFamilia2, dpFecIntFamilia3) {
    dpFecSopFamilia1 = moment(dpFecSopFamilia1);
    dpFecExtFamilia2 = moment(dpFecExtFamilia2);
    dpFecIntFamilia3 = moment(dpFecIntFamilia3);
    let est1 = dpFecExtFamilia2.diff(dpFecIntFamilia3, 'd');
    let estado = est1 <= 0;
    //debugger;
    return estado;
}
function evaluarFecha_dpFecIntFamilia3(dpFecSopFamilia1, dpFecExtFamilia2, dpFecIntFamilia3) {
    dpFecSopFamilia1 = moment(dpFecSopFamilia1);
    dpFecExtFamilia2 = moment(dpFecExtFamilia2);
    dpFecIntFamilia3 = moment(dpFecIntFamilia3);
    let est1 = dpFecExtFamilia2.diff(dpFecIntFamilia3, 'd');
    return est1 <= 0;
}

function validarForms() {

    $.validator.addMethod("hasTecAsociadas", function (value, element) {
        let estado = false;
        let numTecAsoc = parseInt($("#hdNumTecAsoc").val());
        let cbActivo = $("#cbActFamilia").prop("checked");
        if ((cbActivo === true && numTecAsoc > 0) || numTecAsoc === 0)
            estado = true;

        return estado;
    });

    $.validator.addMethod("validarFecha1", function (value, element) {
        let estado = false;
        if ($("#dpFecExtFamilia").val() == "") return !estado;

        let dpFecSopFamilia1 = castDate($("#dpFecSopFamilia").val());
        let dpFecExtFamilia2 = castDate($("#dpFecExtFamilia").val());
        let dpFecIntFamilia3 = castDate($("#dpFecIntFamilia").val());
        estado = evaluarFecha_dpFecSopFamilia1(dpFecSopFamilia1, dpFecExtFamilia2, dpFecIntFamilia3);

        return estado;
    });

    $.validator.addMethod("validarFecha2", function (value, element) {
        let estado = false;

        if ($("#dpFecIntFamilia").val() == "") return !estado;
        let dpFecSopFamilia1 = castDate($("#dpFecSopFamilia").val());
        let dpFecExtFamilia2 = castDate($("#dpFecExtFamilia").val());
        let dpFecIntFamilia3 = castDate($("#dpFecIntFamilia").val());
        estado = evaluarFecha_dpFecExtFamilia2(dpFecSopFamilia1, dpFecExtFamilia2, dpFecIntFamilia3);

        return estado;
    });

    $.validator.addMethod("validarFecha3", function (value, element) {
        let estado = false;

        if ($("#dpFecExtFamilia").val() == "") return !estado;

        let dpFecSopFamilia1 = castDate($("#dpFecSopFamilia").val());
        let dpFecExtFamilia2 = castDate($("#dpFecExtFamilia").val());
        let dpFecIntFamilia3 = castDate($("#dpFecIntFamilia").val());
        estado = evaluarFecha_dpFecExtFamilia2(dpFecSopFamilia1, dpFecExtFamilia2, dpFecIntFamilia3);

        return estado;
    });

    $.validator.addMethod("decimal_vulnerabilidad", function (value, element) {
        let regex = new RegExp(regexDecimal);
        if (regex.test(value)) {
            if (value < 6.0) return true;
        }
        return false;
    });

    $.validator.addMethod("existeFamilia", function (value, element) {
        let estado = true;
        //if ($("#hFamTecId").val() === "0") {
            if ($.trim(value) !== "" && $.trim(value).length >= 3) {
                    estado = !ExisteFamilia2();
                    return estado;
            }
        //}
        return estado;
    });

    $("#formAddOrEditFamilia").validate({
        ignore: ".ignore",
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomFamilia: {
                requiredSinEspacios: true,
                existeFamilia: true
            },
            txtDesFamilia: {
                requiredSinEspacios: true
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
            txtFabricante: {
                requiredSinEspacios: true
            },
            //dpFecSopFamilia: {
            //    requiredSinEspacios: false,
            //    validarFecha1: true
            //},
            //dpFecExtFamilia: {
            //    requiredSinEspacios: false,
            //    validarFecha1: true
            //},
            //dpFecIntFamilia: {
            //    requiredSinEspacios: false,
            //    validarFecha3: false
            //},
            msjActivo: {
                hasTecAsociadas: true
            }
        },
        messages: {
            txtNomFamilia: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre"),
                existeFamilia: String.Format("{0} ya existe.", "La familia")
            },
            txtDesFamilia: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
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
            txtFabricante: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el fabricante")
            },
            //dpFecSopFamilia: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha fin de soporte de la familia"),
            //    validarFecha1: String.Format("La {0} debe ser menor o igual a la {1}.", "fecha fin de soporte de la familia", "fecha extendida de la familia")
            //},
            //dpFecExtFamilia: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha extendida de la familia"),
            //    validarFecha1: String.Format("La {0} debe ser mayor o igual a la {1}.", "fecha extendida de la familia", "fecha fin de soporte de la familia")
            //},
            //dpFecIntFamilia: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha interna de la familia"),
            //    validarFecha3: String.Format("La {0} debe ser mayor o igual a la {1}.", "fecha interna de la familia", "fecha extendida de la familia")
            //},
            msjActivo: {
                hasTecAsociadas: "Estado no posible"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "dpFecSopFamilia" || element.attr('name') === "dpFecExtFamilia" || element.attr('name') === "dpFecIntFamilia") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
    });
}
function listarFamilias() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusFamilia").val());
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

//Open Modal: true
//Close Modal: false
function MdAddOrEditFamilia(EstadoMd) {
    LimpiarMdAddOrEditFamilia();
    if (EstadoMd)
        $("#MdAddOrEditFamilia").modal(opcionesModal);
    else
        $("#MdAddOrEditFamilia").modal('hide');
}

function EditFamilia(FamiliaId, NumTecAsociadas) {
    $.ajax({
        url: URL_API_VISTA + "/" + FamiliaId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            $("#titleFormFamilia").html("Editar Familia");
            MdAddOrEditFamilia(true);

            $("#hIdFamilia").val(result.Id);
            $("#hdNumTecAsoc").val(NumTecAsociadas);
            $("#txtNomFamilia").val(result.Nombre);
            $("#txtDesFamilia").val(result.Descripcion);
            /*$("#dpFecSopFamilia").val(result.FechaFinSoporteToString);
            $("#dpFecExtFamilia").val(result.FechaExtendidaToString);
            $("#dpFecIntFamilia").val(result.FechaInternaToString); */
            $("#cbExisTec").val(result.Existencia);
            $("#cbFacAcTec").val(result.Facilidad);
            $("#cbRiesgTec").val(result.Riesgo);
            $("#txtVulTec").val(result.Vulnerabilidad);
            $("#txtFabricante").val(result.Fabricante || "");
            $("#cbActFamilia").prop('checked', result.Activo);
            $('#cbActFamilia').bootstrapToggle(result.Activo ? 'on' : 'off');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function AddFamilia() {
    $("#titleFormFamilia").html("Nueva Familia");
    $("#hIdFamilia").val('');
    $("#hdNumTecAsoc").val("0");
    MdAddOrEditFamilia(true);
}

function castDate(date) {
    if ($.trim(date) == "") return date;
    var fechaTemp = date;
    var vectorDate = fechaTemp.split("/");
    var anio = vectorDate[2];
    var mes = vectorDate[1];
    var dia = vectorDate[0];
    return anio + "/" + mes + "/" + dia;
}

function GuardarAddOrEditFamilia() {
    if ($("#formAddOrEditFamilia").valid()) {
        $("#btnRegFamilia").button("loading");

        var familia = {};
        familia.Id = ($("#hIdFamilia").val() === "") ? 0 : parseInt($("#hIdFamilia").val());
        familia.Nombre = $("#txtNomFamilia").val().trim();
        familia.Descripcion = $("#txtDesFamilia").val();
        /*familia.FechaFinSoporte = castDate($("#dpFecSopFamilia").val());
        familia.FechaExtendida = castDate($("#dpFecExtFamilia").val());
        familia.FechaInterna = castDate($("#dpFecIntFamilia").val()); */
        familia.Existencia = $("#cbExisTec").val();
        familia.Facilidad = $("#cbFacAcTec").val();
        familia.Riesgo = $("#cbRiesgTec").val();
        familia.Vulnerabilidad = $("#txtVulTec").val(); 
        familia.Fabricante = $("#txtFabricante").val(); 
            
        familia.Activo = $('#cbActFamilia').prop("checked"); // $("#cbActFamilia").is(':checked');

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(familia),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                $("#txtBusFamilia").val("");
                listarFamilias();
            },
            complete: function () {
                $("#btnRegFamilia").button("reset");
                MdAddOrEditFamilia(false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function CambiarEstado(FamiliaId, NumTecAsociadas) {  
    if (NumTecAsociadas > 0) {
        bootbox.alert({
            size: "sm",
            title: TITULO_MENSAJE,
            message: "No se puede cambiar el estado debido que existen otras entidades que tienen relación.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });      
    } else {
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
                    $.ajax({
                        type: 'GET',
                        contentType: "application/json; charset=utf-8",
                        url: `${URL_API_VISTA}/CambiarEstado?Id=${FamiliaId}`,
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Se cambio el estado correctamente", TITULO_MENSAJE);
                                    listarFamilias();
                                }                               
                            }
                            else {
                                toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        },
                        complete: function (data) {
                            //$table.bootstrapTable('refresh');
                            //listarFamilias();
                        }
                    });
                }
            }
        });
    }
}

function linkFormatterName(value, row, index) {
    return `<a href="javascript:EditFamilia(${row.Id}, ${row.NumTecAsociadas})" title="Editar">${value}</a>`;
}

function linkFormatterTec(value, row, index) {
    return `<a href="javascript:irTecnologias(${row.Id})" title="Ver tecnologías">${value}</a>`;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? "iconoVerde " : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:CambiarEstado(${row.Id}, '${row.NumTecAsociadas}')" title="Cambiar estado"><i style="" id="cbOpcFam${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return estado;
}

function opcionesTecAsoc(value, row, index) {
    let btnTecnologiasVinculadas = `<a href="javascript:listarTecnologiasVinculadas(${row.Id})" title="Tecnologías vinculadas"><i class="glyphicon glyphicon-transfer"></i></a>`;
    let btnRemoverItem = `  <a href='javascript: void(0)' onclick='removeItemSubdomEq(${row.Id})'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    btnRemoverItem = "";
    return btnTecnologiasVinculadas.concat("&nbsp;&nbsp;", btnRemoverItem);
}

function irTecnologias(Id) {
    LimpiarValidateErrores($("#formTecByFam"));
    $("#hIdFamilia").val(Id);
    $("#txtTecnologia").val("");
    listarTecnologiasByFamilia();      
}

function listarTecnologiasByFamilia() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableTec.bootstrapTable('destroy');
    $tableTec.bootstrapTable({
        url: URL_API_VISTA + "/ListarTecnologiasAsociadas",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        locale: 'es-SP',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'EstadoId',
        sortOrder: 'asc',
        queryParams: function (p) {           
            DATA_EXPORTAR_TEC_ASOC = {};
            DATA_EXPORTAR_TEC_ASOC.id = parseInt($("#hIdFamilia").val());
            DATA_EXPORTAR_TEC_ASOC.pageNumber = p.pageNumber;
            DATA_EXPORTAR_TEC_ASOC.pageSize = p.pageSize;
            DATA_EXPORTAR_TEC_ASOC.sortName = p.sortName;
            DATA_EXPORTAR_TEC_ASOC.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_TEC_ASOC);
        },
        responseHandler: function (res) {
            //console.log(res);
            waitingDialog.hide();
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
            waitingDialog.hide();
            bootbox.alert("Se produjo un error al listar los registros");
        },
        onLoadSuccess: function (data) {
            $("#MdTecByFam").modal(opcionesModal);
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
    });
}

function listarTecnologiasVinculadas(Id) {
    $("#hdTecVin").val(Id);
    //alert(Id);
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblTecVin.bootstrapTable('destroy');
    $tblTecVin.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListarTecnologiasVinculadas",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR_TEC_VIN = {};
            DATA_EXPORTAR_TEC_VIN.id = parseInt($("#hdTecVin").val());
            DATA_EXPORTAR_TEC_VIN.pageNumber = p.pageNumber;
            DATA_EXPORTAR_TEC_VIN.pageSize = p.pageSize;
            DATA_EXPORTAR_TEC_VIN.sortName = p.sortName;
            DATA_EXPORTAR_TEC_VIN.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_TEC_VIN);
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
            $("#mdTecVin").modal(opcionesModal);
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
    });
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function cargarCombos() {
    SetItems(ItemNumeros.filter(x => ![0].includes(x)), $("#cbExisTec"), TEXTO_SELECCIONE);
    SetItems(ItemNumeros.filter(x => [1, 3, 5].includes(x)), $("#cbFacAcTec"), TEXTO_SELECCIONE);
    SetItems(ItemNumeros.filter(x => [0, 5].includes(x)), $("#cbRiesgTec"), TEXTO_SELECCIONE);
}

function cargarValoresPorDefecto() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarValoresPorDefecto",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {  
                    FAM_EXISTENCIA = parseInt(dataObject.ValDefectoFamExistencia);
                    FAM_FACILIDAD = parseInt(dataObject.ValDefectoFamFacilidad);
                    FAM_RIESGO = parseInt(dataObject.ValDefectoFamRiesgo);
                    FAM_VULNERABILIDAD = dataObject.ValDefectoFamVulnerabilidad || "";                    
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function ExportarTecAsociadas() {
    let _data = $tableTec.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let url = `${URL_API_VISTA}/ExportarTecnologiasAsociadas?id=${DATA_EXPORTAR_TEC_ASOC.id}&sortName=${DATA_EXPORTAR_TEC_ASOC.sortName}&sortOrder=${DATA_EXPORTAR_TEC_ASOC.sortOrder}`;
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

function validarFormTecnologia() {

    $.validator.addMethod("existeRegistroTecnologia", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "" && $("#hdTecnologiaId").val() !== "0") {
            //debugger;
            let Id = parseInt($("#hdTecnologiaId").val());
            let flagContiene = $tableTec.bootstrapTable('getRowByUniqueId', Id);
            estado = flagContiene !== null ? false : true;
            return estado;
        }
        return estado;
    });


    $.validator.addMethod("existeTecnologia", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            estado = ExisteTecnologia();
            return estado;
        }
        return estado;
    });

    $("#formTecByFam").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtTecnologia: {
                requiredSinEspacios: true,
                existeTecnologia: true
                //existeRegistroTecnologia: true
            }
        },
        messages: {
            txtTecnologia: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la tecnología"),
                existeTecnologia: String.Format("{0} ingresada no existe.", "La tecnología")
                //existeRegistroTecnologia: String.Format("{0} ingresada ya se encuentra registrada.", "La tecnología")
            }
        }
    });
}

function ExisteTecnologia() {
    let estado = false;
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

//function removeItemSubdomEq(id) {
//    bootbox.confirm("¿Estás seguro que deseas eliminar la equivalencia seleccionada?", function (result) {
//        if (result) {
//            let data = {
//                Id: id,
//                Usuario: USUARIO.UserName
//            };

//            $.ajax({
//                url: URL_API_VISTA + "/CambiarFlagEquivalencia",
//                type: "POST",
//                contentType: "application/json; charset=utf-8",
//                data: JSON.stringify(data),
//                dataType: "json",
//                success: function (result) {
//                    if (result) {
//                        toastr.success("La operación se realizó correctamente", TITULO_MENSAJE);
//                        listarSubdominiosEquivalentes();
//                    }
//                    else {
//                        toastr.error("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
//                    }
//                },
//                error: function (xhr, ajaxOptions, thrownError) {
//                    ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//                },
//                complete: function (data) {
//                    //RefrescarListado();
//                }
//            });

//        }
//    });
//}

function ExisteFamilia2() {
    //debugger;
    let estado = false;
    let Id = $("#hIdFamilia").val() !== "0" ? $("#hIdFamilia").val() : null;
    let nombre = $("#txtNomFamilia").val() || "";
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteFamiliaByNombre?Id=${Id}&nombre=${nombre}`,
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

//function linkFormatterTecnologiaFamilia(value, row, index) {
//    return `<a href="javascript:irDetalleTecnologia(${row.Id})" title="Editar">${value}</a>`;
//}

//function irDetalleTecnologia(Id) {
//    console.log(Id);
//}

function linkFormatterTecnologiaFamilia(value, row, index) {
    let clave = encodeURIComponent(value);
    return `<a href="Tecnologia?Id=${clave}" title="Ver detalle" target="_blank">${value}</a>`;
}