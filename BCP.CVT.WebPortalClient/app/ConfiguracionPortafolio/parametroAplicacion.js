var $table = $("#tblRegistros");
var URL_API_VISTA = URL_API + "/Aplicacion/GestionAplicacion";
var DATA_EXPORTAR = {};
var DATOS_RESPONSABLE = {};
var TITULO_MENSAJE = "Gestión de parámetros de aplicación";

$(function () {
    listarRegistros();
    validarForm();
    $("#btnBuscar").click(listarRegistros);
});

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/ListarParametroAplicacion",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtFiltro").val());
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

function validarForm() {
    $("#formRegistro").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtValor: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtValor: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el valor")
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

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let btn1 = `<a href="javascript:editarRegistro(${row.Id}, '${row.Codigo}')" title="Editar registro"><i class="${style_color} glyphicon glyphicon-edit"></i></a>`;

    return btn1;
}

function editarRegistro(Id, Codigo) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/GetParametroApp?Codigo=${Codigo}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let valor = dataObject;
                    $("#hdRegistroId").val(Id);
                    $("#txtCodigo").val(Codigo);
                    $("#txtValor").val(valor);

                    OpenCloseModal($("#mdRegistro"), true);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function guardarRegistro() {
    if ($("#formRegistro").valid()) {

        $("#btnRegistrar").button("loading");
        let data = {};
        data.Id = $("#hdRegistroId").val();
        data.Valor = $.trim($("#txtValor").val());

        $.ajax({
            url: URL_API_VISTA + "/AddOrEditParametro",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        OpenCloseModal($("#mdRegistro"), false);
                        listarRegistros();
                        toastr.success("Registrado correctamente", TITULO_MENSAJE);
                    }
                }
            },
            complete: function (data) {
                if (ControlarCompleteAjax(data))
                    $("#btnRegistrar").button("reset");
                else
                    bootbox.alert("Sucedió un error con el servicio", function () { });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}