var $table = $("#tblRegistros");
var URL_API_VISTA = URL_API + "/Mep";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "MEP";

$(function () {
    $("#btnBuscar").click(RefrescarListado);
    $("#btnNuevo").click(AddRegistro);
    $("#btnRegistrar").click(GuardarRegistro);
    $("#btnExportar").click(ExportarInfo);

    validarFormRegistro();
    listarRegistros();

    InitAutocompletarBuilder($("#txtAplicacion"), $("#hdAplicacionFiltro"), ".aplicacionContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtCodigoApt"), $("#hdAplicacionId"), ".codigoAptContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtTribuFiltro"), $("#hdTribuFiltro"), ".tribuContainer", "/Aplicacion/GetGestionadoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtJdeFiltro"), $("#hdJdeFiltro"), ".jdeContainer", "/Aplicacion/GetJefeEquipoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtExpertoFiltro"), $("#hdExpertoFiltro"), ".expertoContainer", "/Aplicacion/GetExpertoByFiltro?filtro={0}");

    setDefaultHd($("#txtAplicacion"), $("#hdAplicacionFiltro"));
    setDefaultHd($("#txtTribuFiltro"), $("#hdTribuFiltro"));
    setDefaultHd($("#txtJdeFiltro"), $("#hdJdeFiltro"));
    setDefaultHd($("#txtExpertoFiltro"), $("#hdExpertoFiltro"));

    setDefaultHd($("#txtCodigoApt"), $("#hdAplicacionId"));
});

function RefrescarListado() {
    listarRegistros();
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.CodigoAPT = $("#hdAplicacionFiltro").val() !== "0" ? $("#hdAplicacionFiltro").val() : $.trim($("#txtAplicacion").val());
            DATA_EXPORTAR.Tribu = $("#hdTribuFiltro").val() !== "0" ? $("#hdTribuFiltro").val() : $.trim($("#txtTribuFiltro").val());
            DATA_EXPORTAR.Jde = $("#hdJdeFiltro").val() !== "0" ? $("#hdJdeFiltro").val() : $.trim($("#txtJdeFiltro").val());
            DATA_EXPORTAR.Experto = $("#hdExpertoFiltro").val() !== "0" ? $("#hdExpertoFiltro").val() : $.trim($("#txtExpertoFiltro").val());
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

function AddRegistro() {
    $("#title-form").html("Nuevo registro");
    //$("#hdRegistroId").val("");
    limpiarModal();
    OpenCloseModal($("#mdAddOrEditRegistro"), true);
}

function limpiarModal() {
    LimpiarValidateErrores($("#formAddOrEditRegistro"));
    $(":input", "#formAddOrEditRegistro").val("");
}

function validarFormRegistro() {
    $.validator.addMethod("existeCodigoAPT", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            let estado = false;
            estado = !ExisteCodigoAPT();
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("positiveNumber", function (value, element) {
        value = value || "";
        return $.trim(value) !== "" ? Number(value) > 0 : true;
    });

    $.validator.addMethod("requiredOne", function (value, element) {
        let nota1 = $.trim($("#txtDistribuida").val());
        let nota2 = $.trim($("#txtMainframe").val());
        let nota3 = $.trim($("#txtPaqueteSaas").val());
        let nota4 = $.trim($("#txtUserItMacro").val());
        let nota5 = $.trim($("#txtUserItWeb").val());
        let nota6 = $.trim($("#txtUserItCliente").val());
        return !(nota1 === "" && nota2 === "" && nota3 === "" && nota4 === "" && nota5 === "" && nota6 === "");
    });

    $("#formAddOrEditRegistro").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtCodigoApt: {
                requiredSinEspacios: true,
                existeCodigoAPT: true
            },
            txtDistribuida: {
                //requiredSinEspacios: true,
                //positiveNumber: true
                number: true,
                max: 100
            },
            txtMainframe: {
                //requiredSinEspacios: true,
                //positiveNumber: true
                number: true,
                max: 100
            },
            txtPaqueteSaas: {
                //requiredSinEspacios: true,
                //positiveNumber: true
                number: true,
                max: 100
            },
            txtUserItMacro: {
                //requiredSinEspacios: true,
                //positiveNumber: true
                number: true,
                max: 100
            },
            txtUserItWeb: {
                //requiredSinEspacios: true,
                //positiveNumber: true
                number: true,
                max: 100
            },
            txtUserItCliente: {
                //requiredSinEspacios: true,
                //positiveNumber: true
                number: true,
                max: 100
            },
            hdMinNota: {
                requiredOne: true
            }
        },
        messages: {
            txtCodigoApt: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el codigo de la aplicación"),
                existeCodigoAPT: "Código de aplicacion ya existe"
            },
            txtDistribuida: {
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "el item"),
                number: "Debes ingresar una nota válida.",
                max: "Debes ingresar una nota válida."
            },
            txtMainframe: {
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "el item"),
                number: "Debes ingresar una nota válida.",
                max: "Debes ingresar una nota válida."
            },
            txtPaqueteSaas: {
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "el item"),
                number: "Debes ingresar una nota válida.",
                max: "Debes ingresar una nota válida."
            },
            txtUserItMacro: {
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "el item"),
                number: "Debes ingresar una nota válida.",
                max: "Debes ingresar una nota válida."
            },
            txtUserItWeb: {
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "el item"),
                number: "Debes ingresar una nota válida.",
                max: "Debes ingresar una nota válida."
            },
            txtUserItCliente: {
                //requiredSinEspacios: String.Format("Debes ingresar {0}.", "el item"),
                number: "Debes ingresar una nota válida.",
                max: "Debes ingresar una nota válida."
            },
            hdMinNota: {
                requiredOne: "Debes ingresar por lo menos una nota"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDistribuida" || element.attr('name') === "txtMainframe"
                || element.attr('name') === "txtPaqueteSaas" || element.attr('name') === "txtUserItMacro"
                || element.attr('name') === "txtUserItWeb" || element.attr('name') === "txtUserItCliente") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function GuardarRegistro() {
    if ($("#formAddOrEditRegistro").valid()) {
        $("#btnRegistrar").button("loading");

        let entidad = {
            Id: ($("#hdRegistroId").val() === "") ? 0 : parseInt($("#hdRegistroId").val()),
            CodigoAPT: $("#hdAplicacionId").val(),
            Distribuida: $.trim($("#txtDistribuida").val()),
            MainFrame: $.trim($("#txtMainframe").val()),
            PaqueteSaas: $.trim($("#txtPaqueteSaas").val()),
            UserITMacro: $.trim($("#txtUserItMacro").val()),
            UserITWeb: $.trim($("#txtUserItWeb").val()),
            UserITClientSever: $.trim($("#txtUserItCliente").val()),
        };

        $.ajax({
            url: URL_API_VISTA + "/AddOrEditNotaAplicacion",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(entidad),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                listarRegistros();
            },
            complete: function () {
                $("#btnRegistrar").button("reset");
                OpenCloseModal($("#mdAddOrEditRegistro"), false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    return `<a href="javascript:editarRegistro(${row.Id})" title="Editar"><i class="${style_color} glyphicon glyphicon-edit"></i></a>`;

}

function editarRegistro(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#title-form").html("Editar registro");
    $.ajax({
        url: URL_API_VISTA + `/GetNotaAplicacionById?id=${Id}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;
                    limpiarModal();
                    OpenCloseModal($("#mdAddOrEditRegistro"), true);

                    $("#hdRegistroId").val(data.Id);
                    $("#txtCodigoApt").val(data.CodigoAPT);
                    $("#hdAplicacionId").val(data.CodigoAPT);
                    $("#txtDistribuida").val(data.Distribuida);
                    $("#txtMainframe").val(data.MainFrame);
                    $("#txtPaqueteSaas").val(data.PaqueteSaas);
                    $("#txtUserItMacro").val(data.UserITMacro);
                    $("#txtUserItWeb").val(data.UserITWeb);
                    $("#txtUserItCliente").val(data.UserITClientSever);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let url = `${URL_API_VISTA}/Exportar?tribu=${DATA_EXPORTAR.Tribu}&codigoAPT=${DATA_EXPORTAR.CodigoAPT}&jde=${DATA_EXPORTAR.Jde}&experto=${DATA_EXPORTAR.Experto}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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


function ExisteCodigoAPT() {
    let estado = true;
    let codigoAPT = encodeURIComponent($("#hdAplicacionId").val());
    let id = $("#hdRegistroId").val();

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteCodigoAPT?codigoAPT=${codigoAPT}&id=${id}`,
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
