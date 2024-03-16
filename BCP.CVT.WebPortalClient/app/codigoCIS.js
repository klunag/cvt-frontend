var $table = $("#tbl-codcis");
var $tblServidorRelacionado = $("#tblServidorRelacionado");
var $tblServidorNoRegistrado = $("#tblServidorNoRegistrado");

var URL_API_VISTA = URL_API + "/CodigoCIS";
var DATA_EXPORTAR = {};
var TIPO_USUARIO = $("#hdTipoUsuario").val();

$(function () {
    FormatoCheckBox($("#divActCodCis"), 'cbActCodCis');
    initUpload($('#txtArchivo'));

    $("#btnSubirArchivo").on('click', function () {
        LimpiarValidateErrores($("#formAddOrEditCodCis"));
    });

    $tblServidorRelacionado.bootstrapTable();
    $tblServidorNoRegistrado.bootstrapTable();
    validarFormCIS();
    listarCodCis();
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

function limpiarMdAddOrEditCodCis() {
    LimpiarValidateErrores($("#formAddOrEditCodCis"));
    $("#txtArchivo").val(TEXTO_SIN_ARCHIVO);
    $("#flArchivo").val('');   
    $("#txtCodCisTemp").val('');
    $("#txtDesCodCis").val('');
    $("#cbActCodCis").prop('checked', true);
    $("#cbActCodCis").bootstrapToggle('on');

    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
}

function MdAddOrEditCodCis(EstadoMd) {
    limpiarMdAddOrEditCodCis();
    if (EstadoMd)
        $("#MdAddOrEditCodCis").modal(opcionesModal);
    else
        $("#MdAddOrEditCodCis").modal('hide');
}

function buscarCodCis() {
    listarCodCis();
}

function listarCodCis() {
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
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusCodCis").val());
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.username = TIPO_USUARIO === "" ? null : TIPO_USUARIO;

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

function AddCodCis() {
    MdAddOrEditCodCis(true);
    var codTemp = RandomId(8);
    $("#txtCodCisTemp").val(codTemp);
    $("#titleFormCodCis").html("Configuración de códigos CIS");
    $("#hdCodCisId").val(''); 
    $tblServidorRelacionado.bootstrapTable('destroy');
    $tblServidorNoRegistrado.bootstrapTable('destroy');
    $tblServidorRelacionado.bootstrapTable();
    $tblServidorNoRegistrado.bootstrapTable();
}

function linkFormatter(value, row, index) {
    return `<a href="javascript:editarCodCis(${row.Id})" title="Editar">${value}</a>`;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:cambiarEstado(${row.Id})" title="Cambiar estado"><i style="" id="cbOpcCodCis${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return estado;
}

function validarFormCIS() {

    $.validator.addMethod("requiredFile", function (value, element) {
        let estado = false;
        let nombreFile = $("#txtArchivo").val();
        if (nombreFile !== TEXTO_SIN_ARCHIVO) {
            estado = true;
        }

        return estado;
    });

    $("#formAddOrEditCodCis").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            msjFile: {
                requiredFile: true
            }
        },
        messages: {
            msjFile: {
                requiredFile: "Debes seleccionar un archivo para generar el código para el archivo CIS"
            }
        }
    });
}

function editarCodCis(CodCisId) {
    $("#titleFormCodCis").html("Configuración de códigos CIS");
    $.ajax({
        url: URL_API_VISTA + "/" + CodCisId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            MdAddOrEditCodCis(true);
            
            $("#hdCodCisId").val(result.Id);         
            $("#txtCodCisTemp").val(result.CodigoTemporal);
            $("#txtDesCodCis").val(result.Descripcion);
            $("#cbActCodCis").prop('checked', result.Activo);
            $("#cbActCodCis").bootstrapToggle(result.Activo ? 'on' : 'off');  

            listarServidoresRelacionados();
            listarServidoresNoRegistrados();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function guardarAddOrEditCodCis() {
    if ($("#formAddOrEditCodCis").valid()) {
        $("#btnRegCodCis").button("loading");

        var codCIS = {};
        codCIS.Id = ($("#hdCodCisId").val() === "") ? 0 : parseInt($("#hdCodCisId").val());

        codCIS.CodigoTemporal = $("#txtCodCisTemp").val().trim();
        codCIS.Descripcion = $("#txtDesCodCis").val();
        codCIS.Activo = $("#cbActCodCis").prop("checked");

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(codCIS),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) { 
                if (textStatus == "success") {
                    if (dataObject != null) {
                        toastr.success("Registrado correctamente", "Configuración de códigos CIS");
                        $("#txtBusCodCis").val('');
                        listarCodCis();
                    }
                }                           
            },
            complete: function () {
                $("#btnRegCodCis").button("reset");           
                MdAddOrEditCodCis(false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function listarServidoresRelacionados() {
    $tblServidorRelacionado.bootstrapTable('destroy');
    $tblServidorRelacionado.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListarServidoresRelacionados",
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
            var data = {};
            data.id = $("#hdCodCisId").val();
            data.pageNumber = p.pageNumber;
            data.pageSize = p.pageSize;
            data.sortName = p.sortName;
            data.sortOrder = p.sortOrder;

            return JSON.stringify(data);
        },
        responseHandler: function (res) {
            //waitingDialog.hide();
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
            //waitingDialog.hide();
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

function listarServidoresNoRegistrados() {
    $tblServidorNoRegistrado.bootstrapTable('destroy');
    $tblServidorNoRegistrado.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListarServidoresNoRegistrados",
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
            var data = {};
            data.id = $("#hdCodCisId").val();
            data.pageNumber = p.pageNumber;
            data.pageSize = p.pageSize;
            data.sortName = p.sortName;
            data.sortOrder = p.sortOrder;

            return JSON.stringify(data);
        },
        responseHandler: function (res) {          
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
           // waitingDialog.hide();
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

function cambiarEstado(Id) {
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
                    url: `${URL_API_VISTA}/CambiarEstado?Id=${Id}`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se cambió el estado correctamente", "Configuración de códigos CIS");
                                $("#txtBusCodCis").val('');
                                listarCodCis();
                            }
                        } else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                        //if (result) {
                        //    toastr.success("Se cambió el estado correctamente", "Configuración de códigos CIS");
                        //    listarCodCis();
                        //}
                        //else {
                        //    toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "Configuración de códigos CIS");
                        //}
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    },
                    complete: function (data) {              
                    }
                });
            }
        }
    }); 
}

function descargarPlantillaCIS() {
    let url = `${URL_API_VISTA}/ObtenerPlantillaCIS`;
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
