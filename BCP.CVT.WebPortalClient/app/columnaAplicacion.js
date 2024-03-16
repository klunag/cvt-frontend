var $table = $("#tblColumnaAplicacion");
var URL_API_VISTA = URL_API + "/Aplicacion/GestionAplicacion";
var DATA_EXPORTAR = {};
var DATOS_RESPONSABLE = {};
var TITULO_MENSAJE = "Gestión de campos de aplicación";
var TABLA_PROCEDENCIA = { CVT_APLICACION: 1, APP_APLICACIONDETALLE: 2, DATA_APLICACION: 3 };

$(function () {
    //validarForms();
    //validarFormModalMatricula();
    cargarCombos();

    FormatoCheckBox($("#divEdicion"), "cbEdicion");
    FormatoCheckBox($("#divVisualizacion"), "cbVerExportar");
    $("#cbVerExportar").change(FlagVerExportar_Change);
    listarRegistros();
    validarForm();
});

function defaultCb() {
    $("#cbEdicion").prop("checked", false);
    $("#cbEdicion").bootstrapToggle("off");
    $("#cbVerExportar").prop("checked", false);
    $("#cbVerExportar").bootstrapToggle("off");
}

function RefrescarListado() {
    listarRegistros();
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/ListarColumnaAplicacion",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'OrdenColumna',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.ColumnaId = $("#ddlFiltroNombre").val();
            DATA_EXPORTAR.FlagEditar = $("#ddlFiltroEditar").val();
            DATA_EXPORTAR.FlagVerExportar = $("#ddlFiltroVerExportar").val();
            DATA_EXPORTAR.TablaProcedencia = String.Format("{0};{1}", TABLA_PROCEDENCIA.CVT_APLICACION, TABLA_PROCEDENCIA.APP_APLICACIONDETALLE);
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

    btn1 = `<a href="javascript:editarRegistro(${row.Id}, ${row.FlagEdicion}, ${row.FlagVerExportar}, ${row.OrdenColumna})" title='Editar registro'>` +
        `<span class="icon icon-edit"></span>` +
        `</a >`;

    return btn1.concat("&nbsp;&nbsp;", btn2);
}

function editarRegistro(Id, FlagEdicion, FlagVerExportar, OrdenColumna) {
    limpiarModal();
    setDataModal(Id, FlagEdicion, FlagVerExportar, OrdenColumna);
    OpenCloseModal($("#mdOS"), true);
}

function setDataModal(Id, FlagEdicion, FlagVerExportar, OrdenColumna) {
    $("#hdRegistroId").val(Id);
    $("#cbEdicion").prop("checked", FlagEdicion);
    $("#cbEdicion").bootstrapToggle(FlagEdicion ? "on" : "off");
    $("#cbVerExportar").prop("checked", FlagVerExportar);
    $("#cbVerExportar").bootstrapToggle(FlagVerExportar ? "on" : "off");
    $("#txtOrden").val(OrdenColumna);
    $("#hdOrdenActual").val(OrdenColumna);
}

function limpiarModal() {
    defaultCb();
    $("#hdRegistroId").val("");
    $("#txtOrden").val("");
    $("#cbVerExportar").trigger('change');
}

function FlagVerExportar_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        LimpiarValidateErrores($("#formOS"));
        $(".divOrden").show();
        $(".divOrden").removeClass("ignore");
    }
    else {
        $(".divOrden").addClass("ignore");
        $(".divOrden").hide();
    }
}

function guardarAddOrEdit() {
    if ($("#formOS").valid()) {
        $("#btnOS").button("loading");

        var data = {};
        data.Id = ($("#hdRegistroId").val() === "") ? 0 : parseInt($("#hdRegistroId").val());
        data.FlagEdicion = $("#cbEdicion").prop("checked");
        data.FlagVerExportar = $("#cbVerExportar").prop("checked");
        data.OrdenColumna = $.trim($("#txtOrden").val()) || "";

        $.ajax({
            url: URL_API_VISTA + "/AddOrEditColumnaApp",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                var data = result;
                if (data > 0) {
                    toastr.success("Se actualizó correctamente", TITULO_MENSAJE);
                }
            },
            complete: function () {
                $("#btnOS").button("reset");
                OpenCloseModal($("#mdOS"), false);
                listarRegistros();
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}

function validarForm() {

    $.validator.addMethod("positiveNumber", function (value, element) {
        return Number(value) >= 0;
    });

    $.validator.addMethod("existeOrden", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            let estado = false;
            estado = !ExisteOrden();
            return estado;
        }
        return estado;
    });

    $("#formOS").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtOrden: {
                requiredSinEspacios: true,
                positiveNumber: true,
                //existeOrden: true
            }
        },
        messages: {
            txtOrden: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el orden de la columna"),
                positiveNumber: String.Format("Debes ingresar {0}.", "un número de orden correcto"),
                //existeOrden: "El orden ya existe"
            }
        },
        //errorPlacement: (error, element) => {
        //    if (element.attr('name') === "txtAplicacionFiltro") {
        //        element.parent().parent().append(error);
        //    } else {
        //        element.parent().append(error);
        //    }
        //}
    });
}

function ExisteOrden() {
    let ordenNuevo = $("#txtOrden").val();
    let ordenActual = $("#hdOrdenActual").val();

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteOrden?ordenNuevo=${ordenNuevo}&ordenActual=${ordenActual}`,
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

function cargarCombos() {
    let tablaProcedencia = String.Format("{0};{1}", TABLA_PROCEDENCIA.CVT_APLICACION, TABLA_PROCEDENCIA.APP_APLICACIONDETALLE);
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ListarCombosToColumnaAplicacion?tablaProcedencia=${tablaProcedencia}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItems(dataObject.Criticidad, $("#cbFiltroCriticidad"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ColumnaAplicacion, $("#ddlFiltroNombre"), TEXTO_TODOS);
                    SetItems(dataObject.GenericFlag, $("#ddlFiltroEditar"), TEXTO_TODOS);
                    SetItems(dataObject.GenericFlag, $("#ddlFiltroVerExportar"), TEXTO_TODOS);
                    //SetItems(dataObject.Area, $("#cbFiltroArea"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Estado, $("#cbFiltroEstado"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.TipoExperto, $("#ddlTipo"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.TipoExpertoPortafolio, $("#ddlTipo"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}