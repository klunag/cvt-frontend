var $table = $("#tblArchivos");
var URL_API_VISTA = URL_API + "/File";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Gestión de archivos";
var CODIGO_INTERNO = 0;

$(function () {
    validarFormImportar();
    CargarCodigoInterno();
    listarRegistros();
    initUpload($("#txtArchivo"));
    $("#btnReg").click(CargarArchivos);
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

function buscarRegistros() {
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
            DATA_EXPORTAR.nombre = $.trim($("#txtBusRegistro").val() || "");
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

function irSubirArchivos() {
    LimpiarValidateErrores($("#formImportar"));
    $("#flArchivo").val("");
    $("#txtArchivo").val(TEXTO_SIN_ARCHIVO);
    $("#txtNombreFl").val("");
    $("#txtDesFl").val("");
    $("#mdImportar").modal(opcionesModal);
}

function validarFormImportar() {

    $.validator.addMethod("requiredArchivo", function (value, element) {
        return $.trim(value) !== "";
    });

    $.validator.addMethod("requiredExcel", function (value, element) {
        //let estado = true;
        let validExts = new Array(".xlsx", ".xls");
        let fileExt = value;
        //console.log(fileExt);
        fileExt = fileExt.substring(fileExt.lastIndexOf('.'));

        return validExts.indexOf(fileExt) < 0 ? false : true;

        //if (validExts.indexOf(fileExt) < 0) {
        //    //alert("Invalid file selected, valid files are of " + validExts.toString() + " types.");
        //    estado = false;
        //    return estado;
        //    //return false;
        //}
        //else return estado;
    });

    $("#formImportar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombreFl: {
                requiredSinEspacios: true
            },
            flArchivo: {
                requiredArchivo: true
                //requiredExcel: true
            }
        },
        messages: {
            txtNombreFl: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            flArchivo: {
                requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo")
                //requiredExcel: String.Format("Debes seleccionar {0}.", "un archivo válido")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtArchivo" || element.attr('name') === "flArchivo") {
                element.parent().parent().parent().parent().append(error);
            }
            else {
                element.parent().append(error);
            }
        }
    });
}

function CargarCodigoInterno() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ObtenerCodigoInterno",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItems(dataObject.Entorno, $("#cbEntorno"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.TipoArquetipo, $("#cbTipo"), TEXTO_SELECCIONE);
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

function CargarArchivos() {
    if ($("#formImportar").valid()) {
        let entidadId = 0;
        let nombreFl = $("#txtNombreFl").val() || "";
        let descripcionFl = $("#txtDesFl").val() || "";
        let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
        //debugger;
        UploadFile($("#flArchivo"), CODIGO_INTERNO, entidadId, archivoId, false, TITULO_MENSAJE, nombreFl, descripcionFl, $table);
        $("#mdImportar").modal("hide");
        //listarRegistros();
        //toastr.success("Registrado correctamente", TITULO_MENSAJE);
    }
}