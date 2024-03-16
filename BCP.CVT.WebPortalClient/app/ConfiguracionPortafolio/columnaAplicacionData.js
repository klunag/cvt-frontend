var $table = $("#tblColumnaAplicacion");
var $tblDataListBox = $("#tblDataListBox");
var URL_API_VISTA = URL_API + "/Aplicacion/GestionAplicacion";
var URL_API_CONFIGURACION = URL_API + "/Aplicacion/ConfiguracionPortafolio";
var DATA_EXPORTAR = {};
var DATOS_RESPONSABLE = {};
const TITULO_MENSAJE = "Gestión de campos de aplicación";
const CONFIGURACION_PORTAFOLIO_PARAMETRICA = 18;
var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "OrdenColumna";
var ULTIMO_SORT_ORDER = "desc";
var IS_FIELD_NEW = false;
var DATA_LISTBOX = [];
var IdsRemoveItem = [];
const MENSAJE3 = "¿Estás seguro que deseas modificar este item?";


$(function () {
    $tblDataListBox.bootstrapTable('destroy');
    $tblDataListBox.bootstrapTable({ data: [] });
    SetItemsMultiple([], $("#ddlTipoFlujo"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#ddlFiltroEstado"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    cargarCombos();

    $("#btnBuscar").click(RefrescarListado);
    $("#btnOS").click(guardarAddOrEdit);

    //FormatoCheckBox($("#divEdicion"), "cbEdicion");
    FormatoCheckBox($("#divVisualizacion"), "cbVerExportar");
    FormatoCheckBox($("#divObligatorio"), "cbObligatorio");
    $("#cbVerExportar").change(FlagVerExportar_Change);
    listarRegistros();
    validarForm();

    EnableDisableButtonByInput($("#txtItemListBox"), $("#btnAddItemListBox"));
    //PressEnterOnModal();

    $("#btnNew").click(AddRegistro);
    $("#btnAddItemListBox").click(AddItemListBox);
    $("#btnReordenamiento").click(ReordernarRegistros);
    $("#btnConfigurarEstados").click(ConfigurarEstados);
    $("#ddlTipoInput").change(DdlTipoInput_Change);

    $("#btnEditarItem").click(EditarItem);

    $table.on('reorder-row.bs.table', function (e, data) {
        var data = $table.bootstrapTable('getData');
        $table.bootstrapTable('destroy');

        data = $.each(data, function (index, element) {
            element.OrdenColumna = index + 1;
            element.OrdenColumnaStr = element.OrdenColumna + "";
        });

        $table.bootstrapTable({ data: data });
        //$table.bootstrapTable("refresh"); 

        $("#btnReordenamiento").removeClass("disabled");
        $("#btnReordenamiento").prop("disabled", false);

    });

    //$("#txtToolTip").keypress(function (event) {
    //    if (event.keyCode === 13) {            
    //        event.preventDefault();
    //        return true;
    //    }
    //});

    InitAutocompletarBuilder($("#ddlFiltroNombre"), $("#hdNombreId"), ".containerAplicacion", "/Aplicacion/GestionAplicacion/GetColumaByFiltro?filtro={0}");
});

function PressEnterOnModal() {
    $('#mdOS').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode === 13) {
            $("#btnOS").click();
        }
    });
}

function defaultCb() {
    //$("#cbEdicion").prop("checked", false);
    //$("#cbEdicion").bootstrapToggle("off");
    $("#cbVerExportar").prop("checked", false);
    $("#cbVerExportar").bootstrapToggle("off");
    $("#cbObligatorio").prop("checked", false);
    $("#cbObligatorio").bootstrapToggle("off");
}

function RefrescarListado() {
    ULTIMO_PAGE_NUMBER = 1;
    listarRegistros();    
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');

    let data = {
        ColumnaId: -1,
        FlagEditar: -1,
        FlagVerExportar: $("#ddlFiltroVerExportar").val(),
        TablaProcedencia: String.Format("{0};{1};{2}", TABLA_PROCEDENCIA_ID.CVT_APLICACION, TABLA_PROCEDENCIA_ID.APP_APLICACIONDETALLE, TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION),
        pageNumber: 1,
        pageSize: 1000,
        sortName: "OrdenColumna",
        sortOrder: "asc",
        TTLFiltro: $("#ddlFiltroNombre").val(),
        ActivoAplica: $("#ddlActivoAplicaF").val(),
        ModoLlenado: $("#ddlModoLlenadoF").val(),
        TipoRegistro: $("#ddlTipoRegistroF").val(),
        NivelConfiabilidad: $("#ddlNivelConfiabilidadF").val(),
    };

    $.ajax({
        url: URL_API_VISTA + "/ListarColumnaAplicacion",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        data: JSON.stringify(data),
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    $table.bootstrapTable({ data: dataObject.Rows });
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            waitingDialog.hide("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
    });


    //$table.bootstrapTable({
    //    url: URL_API_VISTA + "/ListarColumnaAplicacion",
    //    method: 'POST',
    //    pagination: true,
    //    sidePagination: 'server',
    //    queryParamsType: 'else',
    //    pageNumber: ULTIMO_PAGE_NUMBER,
    //    //pageSize: ULTIMO_REGISTRO_PAGINACION,
    //    pageSize: 1000,
    //    pageList: OPCIONES_PAGINACION,
    //    sortName: "OrdenColumna",
    //    sortOrder: "asc",
    //    queryParams: function (p) {
    //        ULTIMO_PAGE_NUMBER = p.pageNumber;
    //        ULTIMO_REGISTRO_PAGINACION = p.pageSize;
    //        ULTIMO_SORT_NAME = p.sortName;
    //        ULTIMO_SORT_ORDER = p.sortOrder;

    //        DATA_EXPORTAR = {};
    //        DATA_EXPORTAR.ColumnaId = $("#ddlFiltroNombre").val();
    //        DATA_EXPORTAR.FlagEditar = $("#ddlFiltroEditar").val();
    //        DATA_EXPORTAR.FlagVerExportar = $("#ddlFiltroVerExportar").val();
    //        DATA_EXPORTAR.TablaProcedencia = String.Format("{0};{1}", TABLA_PROCEDENCIA_ID.DATA_APLICACION, TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION);

    //        DATA_EXPORTAR.pageNumber = ULTIMO_PAGE_NUMBER;
    //        DATA_EXPORTAR.pageSize = ULTIMO_REGISTRO_PAGINACION;
    //        DATA_EXPORTAR.sortName = ULTIMO_SORT_NAME;
    //        DATA_EXPORTAR.sortOrder = ULTIMO_SORT_ORDER;

    //        return JSON.stringify(DATA_EXPORTAR);
    //    },
    //    responseHandler: function (res) {
    //        waitingDialog.hide();
    //        var data = res;
    //        return { rows: data.Rows, total: data.Total };
    //    },
    //    onLoadError: function (status, res) {
    //        waitingDialog.hide();
    //        bootbox.alert("Se produjo un error al listar los registros");
    //    },
    //    onSort: function (name, order) {
    //        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    //    },
    //    onPageChange: function (number, size) {
    //        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    //    }
    //});
}

function opciones(value, row, index) {
    let flagCampoNuevo = row.FlagCampoNuevo || false;
    let flagModificable = row.FlagModificable || false;
    let flagMostrarCampo = row.FlagMostrarCampo || false;
    let icon = flagMostrarCampo ? "check" : "unchecked";

    let btn1 = `<a href="javascript:editarRegistro(${row.Id})" title='Editar registro'><span class="icon icon-edit"></span></a >`;
    let btn2 = flagCampoNuevo ? `<a href="javascript:irEliminar(${row.Id})" title="Eliminar registro"><i class="glyphicon glyphicon-trash"></i></a>` : '';
    let btn3 = flagModificable ? `<a href="javascript:irShowHideCampo(${row.Id}, ${flagMostrarCampo})" title="Habilitar/Deshabilitar registro"><i class="glyphicon glyphicon-${icon}"></i></a>` : '';

    return btn1;
}

function irShowHideCampo(id, FlagMostrarCampo) {
    let mensaje = FlagMostrarCampo ? "desactivar" : "activar";
    let done = FlagMostrarCampo ? "desactivó" : "activó";
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: `¿Estás seguro(a) que deseas ${mensaje} el registro seleccionado?`,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API + `/Aplicacion/ConfiguracionPortafolio/CambiarFlagMostrarCampo?id=${id}&estadoActual=${FlagMostrarCampo}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    dataType: "json",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                waitingDialog.hide();
                                toastr.success(`Se ${done} el registro correctamente`, TITULO_MENSAJE);
                                listarRegistros();
                            }
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}

function nombreFakeFormatter(value, row, index) {
    let flagCampoNuevo = row.FlagCampoNuevo || false;
    return flagCampoNuevo ? row.NombreExcel : value;
}

function irEliminar(id) {
    let validarDependencia = false;//ExisteRelacionPortafolio(id, ENTIDAD_MANTENIMIENTO);
    if (!validarDependencia) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: "¿Estás seguro(a) que deseas eliminar el registro seleccionado?",
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/EliminarRegistroByConfiguracion?id=${id}&idConfiguracion=${ENTIDAD_MANTENIMIENTO}`,
                        type: "GET",
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    waitingDialog.hide();
                                    toastr.success("Se eliminó el registro correctamente", TITULO_MENSAJE);
                                    listarRegistros();
                                }
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
            }
        });
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, "No es posible eliminar el registro porque esta relacionado con otras entidades");
    }
}

function AddRegistro() {
    IS_FIELD_NEW = true;
    limpiarModal();
    setBuilderModal("field-register");
    OpenCloseModal($("#mdOS"), true);
}

function setBuilderModal(className) {
    $("#title-modal").html("Nuevo registro");
    $(".all").addClass("ignore");
    $(".all").hide();
    $(`.${className}`).show();
    $(`.${className}`).removeClass("ignore");
}

function editarRegistro(_id) {
    $("#title-modal").html("Editar registro");
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/GetColumnaAppById?id=${_id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;
                    limpiarModal();
                    setBuilderModal("field-edit");
                    setDataModal(data);
                    OpenCloseModal($("#mdOS"), true);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function setDataModal(item) {
    let IsModificable = item.FlagModificable || false;
    if (!IsModificable)
        $(".divModificable").addClass("bloq-element");
    else
        $(".divModificable").removeClass("bloq-element");

    IS_FIELD_NEW = item.FlagCampoNuevo === true;
    $("#hdRegistroId").val(item.Id);
    //$("#cbEdicion").prop("checked", item.FlagEdicion);
    //$("#cbEdicion").bootstrapToggle(item.FlagEdicion ? "on" : "off");
    $("#cbVerExportar").prop("checked", item.FlagVerExportar);
    $("#cbVerExportar").bootstrapToggle(item.FlagVerExportar ? "on" : "off");
    $("#cbObligatorio").prop("checked", item.FlagObligatorio);
    $("#cbObligatorio").bootstrapToggle(item.FlagObligatorio ? "on" : "off");
    $("#txtOrden").val(item.OrdenColumna);
    $("#hdOrdenActual").val(item.OrdenColumna);
    if (!item.FlagCampoNuevo) {
        $(".divFlagNuevo").addClass("ignore");
        $(".divFlagNuevo").hide();
        $(".divListBox").addClass("ignore");
        $(".divListBox").hide();
    }
    $("#ddlActivoAplica").val(item.ActivoAplica);
    $("#ddlModoLlenado").val(item.ModoLlenado);
    $("#txtRolRegistra").val(item.RolRegistra);
    $("#txtRolAprueba").val(item.RolAprueba);
    $("#txtDescripcionCampo").val(item.DescripcionCampo);
    $("#ddlNivelConfiabilidad").val(item.NivelConfiabilidad);
    $("#txtRolResponsableActualizacion").val(item.RolResponsableActualizacion);
    $("#ddlTipoRegistro").val(item.TipoRegistro);


    $("#hdTablaProcedenciaId").val(item.TablaProcedenciaId);

    let dataInfoCampo = item.InfoCampoPortafolio;
    if (dataInfoCampo !== null) {
        $("#hdInfoCampoId").val(dataInfoCampo.Id);
        $("#txtToolTip").val(dataInfoCampo.ToolTip);

        $("#txtNombre").val(item.FlagCampoNuevo ? dataInfoCampo.Nombre : item.NombreExcel);
        $("#ddlTipoFlujo").val(dataInfoCampo.TipoFlujoId !== null ? dataInfoCampo.TipoFlujoId.split("|") : []);
        $("#ddlTipoFlujo").multiselect("refresh");

        $("#hdMantenimentoPfId").val(dataInfoCampo.MantenimientoPortafolioId || "0");
        $("#hdCodigoPr").val(dataInfoCampo.ParametricaDescripcion || "");
        $("#ddlTipoInput").val(dataInfoCampo.TipoInputId || "-1");
        $("#ddlTipoInput").prop("disabled", true);

        if (dataInfoCampo.TipoInputId === TIPO_INPUT_ID.ListBox
            && dataInfoCampo.MantenimientoPortafolioId === CONFIGURACION_PORTAFOLIO_PARAMETRICA) {
            $("#ddlTipoInput").trigger('change');

            let dataLB = dataInfoCampo.DataListBoxDetalle;
            if (dataLB !== null && dataLB.length > 0) {
                $tblDataListBox.bootstrapTable("destroy");
                $tblDataListBox.bootstrapTable({
                    data: dataLB,
                    pagination: true,
                    pageNumber: 1,
                    pageSize: 5
                });
            }
        }
    }
}

function limpiarModal() {
    defaultCb();
    LimpiarValidateErrores($("#formOS"));
    $("#hdRegistroId").val("");
    $("#hdInfoCampoId").val("");
    $("#txtOrden").val("");
    $("#txtNombre").val("");
    $("#txtToolTip").val("");
    clearMultiselect($("#ddlTipoFlujo"));

    $("#hdTablaProcedenciaId").val("0");
    $("#ddlTipoInput").val("-1");
    $("#ddlTipoInput").prop("disabled", false);
    $("#ddlTipoInput").trigger("change");
    $("#txtItemListBox").val("");
    $tblDataListBox.bootstrapTable('destroy');
    $tblDataListBox.bootstrapTable({ data: [] });
    IdsRemoveItem = [];
}

function clearMultiselect($ddlMultiple) {
    $('option', $ddlMultiple).each(function (element) {
        $(this).removeAttr('selected').prop('selected', false);
    });
    $ddlMultiple.multiselect('refresh');
}

function FlagVerExportar_Change() {
    //var flag = $(this).prop("checked");
    //if (flag) {
    //    LimpiarValidateErrores($("#formOS"));
    //    $(".divOrden").show();
    //    $(".divOrden").removeClass("ignore");
    //}
    //else {
    //    $(".divOrden").addClass("ignore");
    //    $(".divOrden").hide();
    //}
}

function guardarAddOrEdit() {
    if ($("#formOS").valid()) {
        $("#btnOS").button("loading");
        let _id = ($("#hdRegistroId").val() === "") ? 0 : parseInt($("#hdRegistroId").val());

        var data = {};
        data.Id = _id;
        data.TablaProcedenciaId = IS_FIELD_NEW ? TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION : parseInt($("#hdTablaProcedenciaId").val());
        data.NombreExcel = $.trim($("#txtNombre").val()) || "";
        //data.FlagEdicion = $("#cbEdicion").prop("checked");
        data.FlagEdicion = true;
        data.FlagVerExportar = $("#cbVerExportar").prop("checked");
        data.OrdenColumna = $.trim($("#txtOrden").val()) || "";
        data.FlagCampoNuevo = IS_FIELD_NEW;
        data.FlagModificable = IS_FIELD_NEW ? true : false;
        data.FlagObligatorio = IS_FIELD_NEW ? $("#cbObligatorio").prop("checked") : false;
        data.InfoCampoPortafolio = CrearObjInfoCampo(_id);

        data.ActivoAplica = $("#ddlActivoAplica").val();
        data.ModoLlenado = $("#ddlModoLlenado").val();
        data.NivelConfiabilidad = $("#ddlNivelConfiabilidad").val();
        data.TipoRegistro = $("#ddlTipoRegistro").val();
        data.RolAprueba = $.trim($("#txtRolAprueba").val()) || "";
        data.RolRegistra = $.trim($("#txtRolRegistra").val()) || "";
        data.DescripcionCampo = $.trim($("#txtDescripcionCampo").val()) || "";
        data.RolResponsableActualizacion = $.trim($("#txtRolResponsableActualizacion").val()) || "";

        $.ajax({
            url: URL_API_VISTA + "/AddOrEditColumnaApp",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (result) {
                var data = result;
                if (data > 0) {
                    toastr.success("Se actualizó correctamente", TITULO_MENSAJE);
                }
            },
            complete: function () {
                $("#btnOS").button("reset");
                OpenCloseModal($("#mdOS"), false);
                cargarCombos();
                listarRegistros();
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}

function CrearObjInfoCampo(id) {
    let _idInfo = ($("#hdInfoCampoId").val() === "") ? 0 : parseInt($("#hdInfoCampoId").val());
    let data = {
        Id: _idInfo,
        ConfiguracionColumnaAplicacionId: id,
        Nombre: $.trim($("#txtNombre").val()) || "",
        ToolTip: $.trim($("#txtToolTip").val()) || "",
        TipoFlujoId: $("#ddlTipoFlujo").val() !== null ? $("#ddlTipoFlujo").val().join("|") : "",
        TipoInputId: $("#ddlTipoInput").val(),
        DataListBoxDetalle: $tblDataListBox.bootstrapTable('getData') || [],
        DataListBoxEliminar: IdsRemoveItem.filter(x => parseInt(x) > 0) || [],
        MantenimientoPortafolioId: GetMantenimientoPfId(),
        ParametricaDescripcion: $("#hdCodigoPr").val() === "" ? null : $("#hdCodigoPr").val(),
    };
    return data;
}

function GetMantenimientoPfId() {
    let IdRetorno = null;
    let tipoInputId = parseInt($("#ddlTipoInput").val());
    if (tipoInputId === TIPO_INPUT_ID.ListBox) {
        IdRetorno = IS_FIELD_NEW ? CONFIGURACION_PORTAFOLIO_PARAMETRICA : parseInt($("#hdMantenimentoPfId").val());
    }

    return IdRetorno;
}

function validarForm() {
    $.validator.addMethod("positiveNumber", function (value, element) {
        return Number(value) >= 0;
    });

    $.validator.addMethod("existeOrden", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            return !ExisteOrden();
        }
        return estado;
    });

    $.validator.addMethod("existeNombre", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            return !ExisteNombre();
        }
        return estado;
    });

    $.validator.addMethod("requiredItem", function (value, element) {
        let minItem = $tblDataListBox.bootstrapTable("getData");
        return minItem.length > 0;
    });

    $("#formOS").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombre: {
                required: true,
                //existeNombre: true
            },
            ddlTipoFlujo: {
                requiredSelect: true
            },
            ddlTipoInput: {
                requiredSelect: true
            },
            txtOrden: {
                requiredSinEspacios: true,
                positiveNumber: true
            },
            msjTable: {
                requiredItem: true
            },
            txtRolRegistra: {
                maxlength: 300
            },
            txtRolAprueba: {
                maxlength: 300
            },
            txtRolResponsableActualizacion: {
                maxlength: 600
            }
        },
        messages: {
            txtNombre: {
                required: String.Format("Debes ingresar {0}.", "el nombre del campo"),
                //existeNombre: "El nombre del campo ya existe"
            },
            ddlTipoFlujo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo de registro")
            },
            ddlTipoInput: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo de input")
            },
            txtOrden: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el orden de la columna"),
                positiveNumber: String.Format("Debes ingresar {0}.", "un número de orden correcto")
            },
            msjTable: {
                requiredItem: String.Format("Debes registrar {0}.", "un item como mínimo")
            },
            txtRolRegistra: {
                maxlength: "La longitud del campo no debe de ser mayor a los 300 caracteres"
            },
            txtRolAprueba: {
                maxlength: "La longitud del campo no debe de ser mayor a los 300 caracteres"
            },
            txtRolResponsableActualizacion: {
                maxlength: "La longitud del campo no debe de ser mayor a los 600 caracteres"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtNombre" ||
                element.attr('name') === "ddlTipoFlujo" ||
                element.attr('name') === "ddlTipoInput" ||
                element.attr('name') === "txtOrden" ||
                element.attr('name') === "msjTable") {
                //element.parent().parent().parent().parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function ExisteOrden() {
    let ordenNuevo = $("#txtOrden").val();
    let ordenActual = $("#hdOrdenActual").val();

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteOrden?ordenNuevo=${ordenNuevo}&ordenActual=${ordenActual}`,
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

function ExisteNombre() {
    let nombre = $("#txtNombre").val();
    let id = ($("#hdRegistroId").val() === "") ? 0 : parseInt($("#hdRegistroId").val());

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteNombre?nombre=${nombre}&id=${id}`,
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

function cargarCombos() {
    let tablaProcedencia = String.Format("{0};{1};{2}", TABLA_PROCEDENCIA_ID.CVT_APLICACION, TABLA_PROCEDENCIA_ID.APP_APLICACIONDETALLE, TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION);
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ListarCombosToColumnaAplicacion?tablaProcedencia=${tablaProcedencia}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    //let arrfiltroEstado = dataObject.EstadoFiltro.split("|");

                    //SetItems(dataObject.ColumnaAplicacion, $("#ddlFiltroNombre"), TEXTO_TODOS);
                    SetItems(dataObject.GenericFlag, $("#ddlFiltroEditar"), TEXTO_TODOS);
                    SetItems(dataObject.GenericFlag, $("#ddlFiltroVerExportar"), TEXTO_TODOS);
                    SetItemsMultiple(dataObject.TipoFlujo, $("#ddlTipoFlujo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Estado, $("#ddlFiltroEstado"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItems(dataObject.TipoInput, $("#ddlTipoInput"), TEXTO_SELECCIONE);

                    SetItems(dataObject.ActivoAplica, $("#ddlActivoAplica").filter(x => x.Id !== -1), TEXTO_SELECCIONE);
                    SetItems(dataObject.ModoLlenado, $("#ddlModoLlenado").filter(x => x.Id !== -1), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoRegistro, $("#ddlTipoRegistro").filter(x => x.Id !== -1), TEXTO_SELECCIONE);
                    SetItems(dataObject.NivelConfiabilidad, $("#ddlNivelConfiabilidad").filter(x => x.Id !== -1), TEXTO_SELECCIONE);

                    //SetItems(dataObject.ActivoAplica, $("#ddlActivoAplicaF").filter(x => x.Id != -1), TEXTO_TODOS);
                    //SetItems(dataObject.ModoLlenado, $("#ddlModoLlenadoF").filter(x => x.Id != -1), TEXTO_TODOS);
                    //SetItems(dataObject.TipoRegistro, $("#ddlTipoRegistroF").filter(x => x.Id != -1), TEXTO_TODOS);
                    //SetItems(dataObject.NivelConfiabilidad, $("#ddlNivelConfiabilidadF").filter(x => x.Id != -1), TEXTO_TODOS);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

//function cargarComboEstado() {
//    let tablaProcedencia = String.Format("{0}", TABLA_PROCEDENCIA_ID.CVT_APLICACION);
//    $.ajax({
//        type: "GET",
//        contentType: "application/json; charset=utf-8",
//        url: URL_API_VISTA + `/ListarCombosToColumnaAplicacion?tablaProcedencia=${tablaProcedencia}`,
//        dataType: "json",
//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    //SetItems(dataObject.Criticidad, $("#cbFiltroCriticidad"), TEXTO_SELECCIONE);
//                    //SetItems(dataObject.TipoFlujo, $("#ddlTipoFlujo"), TEXTO_SELECCIONE);
//                    let arrfiltroEstado = dataObject.EstadoFiltro.split("|");

//                    //SetItems(dataObject.ColumnaAplicacion, $("#ddlFiltroNombre"), TEXTO_TODOS);
//                    //SetItems(dataObject.GenericFlag, $("#ddlFiltroEditar"), TEXTO_TODOS);
//                    //SetItems(dataObject.GenericFlag, $("#ddlFiltroVerExportar"), TEXTO_TODOS);
//                    //SetItemsMultiple(dataObject.TipoFlujo, $("#ddlTipoFlujo"), TEXTO_TODOS, TEXTO_TODOS, true);
//                    SetItemsMultiple(dataObject.Estado, $("#ddlFiltroEstado"), TEXTO_TODOS, TEXTO_TODOS, true);
//                    //SetItems(dataObject.TipoInput.filter(x => x.Id !== TIPO_INPUT_ID.Otros), $("#ddlTipoInput"), TEXTO_SELECCIONE);

//                    $("#ddlFiltroEstado").val(arrfiltroEstado);
//                    $("#ddlFiltroEstado").multiselect("refresh");
//                }
//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//}

function ReordernarRegistros() {
    $("#btnReordenamiento").button("loading");
    var data = $table.bootstrapTable('getData');
    var listaOrdenada = $.map(data, function (element, index) {
        return { Id: element.Id, OrdenColumna: index + 1 };
    });
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    $.ajax({
        url: URL_API_VISTA + "/ReordenarColumnaAplicacion",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(listaOrdenada),
        dataType: "json",
        success: function (result) {
            var data = result;
            if (data > 0) {
                toastr.success("Se ordenaron las columnas correctamente", TITULO_MENSAJE);
            }
        },
        complete: function () {
            $("#btnReordenamiento").button("reset");

            listarRegistros();

            waitingDialog.hide("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        error: function (result) {
            alert(result.responseText);
        }
    });
}

function DdlTipoInput_Change() {
    let ddlVal = $(this).val();
    if (ddlVal && ddlVal !== "-1") {
        if (parseInt(ddlVal) === TIPO_INPUT_ID.ListBox) {
            $("#txtItemListBox").val("");
            $tblDataListBox.bootstrapTable('destroy');
            $tblDataListBox.bootstrapTable({ data: [] });

            $(".divListBox").show();
            $(".divListBox").removeClass("ignore");
        } else {
            $(".divListBox").hide();
            $(".divListBox").addClass("ignore");
        }
    } else {
        $(".divListBox").hide();
        $(".divListBox").addClass("ignore");
    }
}

function actionFormatter(value, row, index) {
    let btnEliminar = `<a href="javascript:removerItem('${row.Id}')" title="Eliminar item"><i class="glyphicon glyphicon-trash"></i></a>`;
    let btnAct = `<a href="javascript:actualizarItem('${row.Id}','${row.Valor}')" title="actualizar item"><i class="glyphicon glyphicon-pencil"></i></a>`;
    return btnEliminar.concat("&nbsp;&nbsp;", btnAct);

}

function actualizarItem(id, valor) {
    $("#hdItemId").val(id);
    $("#txtItemValAnt").val(valor);
    $("#txtItemVal").val("");

    OpenCloseModal($("#modalEditarItem"), true);
}

function EditarItem() {
    let data = {};
    data.ItemId = $("#hdItemId").val();
    data.NuevoValor = $("#txtItemVal").val();

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE3,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/EditarItem`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se editó el item correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        $("#btnEditar").button("reset");
                        waitingDialog.hide();
                        OpenCloseModal($("#modalEditarItem"), false);
                        OpenCloseModal($("#mdOS"), false);


                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}



function AddItemListBox() {
    let valorItem = $.trim($("#txtItemListBox").val()) || "";
    if (valorItem !== "") {
        var newItem = $tblDataListBox.bootstrapTable("getData").find(x => x.Valor.toUpperCase() === valorItem.toUpperCase()) || null;
        if (newItem === null) {
            var dataTmp = $tblDataListBox.bootstrapTable("getData");
            var idx = 0;
            var ultId = dataTmp.length === 0 ? (1 * -1000) : dataTmp[dataTmp.length - 1].Id;
            ultId = ultId === null ? 0 : ultId;
            idx = ultId > 0 ? dataTmp.length * -1000 : ultId - 1000;

            $tblDataListBox.bootstrapTable('append', {
                Id: idx.toString(),
                Valor: valorItem.toUpperCase()
            });
        }
        else {
            toastr.info("El valor ingresado ya existe en el listado, ingrese un nuevo valor.", TITULO_MENSAJE);
        }

        $("#txtItemListBox").val("");
        $("#btnAddItemListBox").prop('disabled', true);
    }
}

function removerItem(Id) {
    IdsRemoveItem.push(Id);
    $tblDataListBox.bootstrapTable('remove', {
        field: 'Id', values: [Id]
    });
}

function ConfigurarEstados() {
    let valor = CaseIsNullSendExport($("#ddlFiltroEstado").val());

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_CONFIGURACION + `/ActualizarParametro?valor=${valor}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    toastr.success("Se configuraron los estados correctamente", TITULO_MENSAJE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}