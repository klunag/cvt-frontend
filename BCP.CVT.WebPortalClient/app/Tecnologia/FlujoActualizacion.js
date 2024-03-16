const TITULO_MENSAJE = "Confirmación";
const MENSAJE5 = "¿Está seguro que desea aprobar la solicitud seleccionada?";

var URL_API_VISTA = URL_API + "/Tecnologia/";
var URL_API_TECHNOLOGY_APPROVALFLOW = URL_API + "/Tecnologia/FlujoAprobacion"; 
var pageNumber = 1;
var pageSize = 10; 
var pageList = 10;
var sortName = 'Rol,GrupoRed,Tribu,Chapter,Funcion';
var sortOrder = 'asc';
var isTrueValid = 'SI';
var intSupportEndDate = 15;
var intHasEquivalence = 24;

$(function () {
    var idSolicitud = document.getElementById("str_idSolicitud").innerHTML;
    var idTecnologia = document.getElementById("str_idTecnologia").innerHTML;
    var idProducto = document.getElementById("str_idProducto").innerHTML;
    var idTipoSolicitud = document.getElementById("str_idTipoSolicitud").innerHTML;
    var tipoSolicitud = document.getElementById("str_tipoSolicitud").innerHTML;

    getGeneralData(idSolicitud, idTecnologia, idProducto, idTipoSolicitud, tipoSolicitud);
    getRequestInformation(idSolicitud, idTecnologia, idProducto);
    validateRejectionForm();

    $("#btnReject").click(rejectionRecord);
    $("#btnConfirmar").click(recordApplicationApproval);
});

function validateRejectionForm() {
    $("#form_reject_request").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtRechazoSolicitud: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtRechazoSolicitud: {
                requiredSinEspacios: String.Format("Debe ingresar {0}.", "el sustento del rechazo."),
            }
        }
    });
}

function getGeneralData(idSolicitud, idTecnologia, idProducto, idTipoSolicitud, tipoSolicitud) {
    
    let id = idProducto == 0 ? idTecnologia : idProducto;
    let url = idProducto == 0 ? `TecnologiaId/${id}` : `DatosProducto/${id}?withAutorizadores=false&withArquetipos=false&withAplicaciones=false&withEquivalencias=false`;
    $.ajax({
        url: `${URL_API_VISTA}/${url}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (result) {
            document.getElementById("txtCodProduct").value = result.Codigo;
            document.getElementById("txtClaveTecnologia").value = result.Nombre;
            document.getElementById("lblClaveTecnologia").innerHTML = idProducto == 0 ? 'Clave de la Tecnología' : 'Producto';
            document.getElementById("txtNumSolicitud").value = idSolicitud;
            document.getElementById("txtTipoSolicitud").value = tipoSolicitud;
        },
        error: function (result) {
            alert(result.responseText);
        },
        complete: function (result) {
            waitingDialog.hide();
        }
    });
}

function openPopupRejection() {
    OpenCloseModal($("#mdl_reject_request"), true);
}

function openPopupApprove() {   
}

function getRequestInformation(idSolicitud, idTecnologia, idProducto) {  
    var parameters = {};
    parameters.SolicitudAplicacionId = idSolicitud;
    parameters.TecnologiaId = idTecnologia;
    parameters.ProductoId = idProducto
    parameters.pageNumber = pageNumber;
    parameters.pageSize = pageSize;
    parameters.pageList = pageList;
    parameters.sortName = sortName;
    parameters.sortOrder = sortOrder;

    $.ajax({
        type: "POST", 
        url: URL_API_TECHNOLOGY_APPROVALFLOW + "/DetalleSolicitudes",
        data: JSON.stringify(parameters),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },        
        success: function (data) { 
            createFormCustodyData(data.Rows);
            setCustodyData(data.Rows);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });

}

function createFormCustodyData(data) { 
    let formCustody = "";
    console.log(data);
    $.each(data, function (i, values) { 
        if (i % 2 == 0 || i == 0)
            formCustody += "<div class='row'>"

        formCustody += "<div class='col-md-6'><div class='col-md-4'>" + values.NombreCampo + "</div><div class='col-md-7'>"

        if (values.ConfiguracionTecnologiaCamposId == intSupportEndDate
            || values.ConfiguracionTecnologiaCamposId == intHasEquivalence) {

            if (values.ValorNuevo.toUpperCase() == isTrueValid) {
                formCustody += "<div class='toggle btn btn-primary' data-toggle='toggle' style='width: 57px; height: 34px;'><input type='checkbox' checked='' data-toggle='toggle' id='" + values.NombreCampo.replace(/ /g, "").replace("¿", "").replace("?", "") + i + "' disabled='disabled'><div class='toggle-group'>"
            } else {
                formCustody += "<div class='toggle btn btn-default off' data-toggle='toggle' style='width: 57px; height: 34px;'><input type='checkbox' checked='' data-toggle='toggle' id='" + values.NombreCampo.replace(/ /g, "").replace("¿", "").replace("?", "") + i + "' disabled='disabled'><div class='toggle-group'>"
            }

            formCustody += "<label class='btn btn-primary toggle-on' >Si</label ><label class='btn btn-default active toggle-off'>No</label>"
            formCustody += "<span class='toggle-handle btn btn-default' ></span ></div ></div >"
        } else {
            formCustody += "<input type='text' class='form-control' id='txt" + values.NombreCampo.replace(/ /g, "") + i + "' name='txt" + values.NombreCampo.replace(/ /g, "") + i + "' disabled='disabled' />"
        }
         
        formCustody += "</div > <div class='col-md-1'></div></div >" 

        if (i % 2 != 0)
            formCustody += "</div>";
    });

    document.getElementById("divDataCustodia").innerHTML = formCustody;
}

function setCustodyData(data) { 
    $.each(data, function (i, values) {
        if (values.ConfiguracionTecnologiaCamposId == intSupportEndDate || values.ConfiguracionTecnologiaCamposId == intHasEquivalence) {
        } else {
            let idInput = "txt" + values.NombreCampo.replace(/ /g, "") + i;
            document.getElementById(`${idInput}`).value = decodificarHTML(values.ValorNuevo.trim());
        }
    });
}

function rejectionRecord() {
    let data = {};
    data.IdSolicitud = document.getElementById("str_idSolicitud").innerHTML;
    data.Comentario = $("#txtRechazoSolicitud").val();
    data.IdTecnologia = document.getElementById("str_idTecnologia").innerHTML;
    data.productoId = document.getElementById("str_idProducto").innerHTML;
    var coment_rechazo = data.Comentario.length;

    if (coment_rechazo <= 250) {
        if ($("#form_reject_request").valid()) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            $.ajax({
                url: URL_API_TECHNOLOGY_APPROVALFLOW + `/ObservarSolicitud`,
                type: "POST",
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                data: JSON.stringify(data),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (dataObject, textStatus) {
                    if (textStatus === "success") {
                        if (dataObject !== null) {
                            toastr.success("Se rechazó la solicitud correctamente", TITULO_MENSAJE); 
                            setInterval(function () {
                                window.location.href = "BandejaFlujosAprobacion";
                            }, 1000);
                        }
                    }
                },
                complete: function (data) {
                    $("#txtRechazoSolicitud").val("");
                    waitingDialog.hide();
                    OpenCloseModal($("#mdl_reject_request"), false);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                }
            });
        } else {
            waitingDialog.hide();n
        }
    } else {
        toastr.error('No puede superar la longitud máxima de caracteres. Por favor, revisar.', TITULO_MENSAJE);
    } 
}

function recordApplicationApproval() {
    let data = {};
    data.SolicitudId = document.getElementById("str_idSolicitud").innerHTML;
    data.TipoSolicitudId = document.getElementById("str_idTipoSolicitud").innerHTML;
    data.TecnologiaId = document.getElementById("str_idTecnologia").innerHTML;
    data.ProductoId = document.getElementById("str_idProducto").innerHTML;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE5,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_TECHNOLOGY_APPROVALFLOW + `/AprobarActualizarDatos`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se aprobó la solicitud correctamente", TITULO_MENSAJE); 
                                setInterval(function () {
                                    window.location.href = "BandejaFlujosAprobacion";
                                }, 1000);
                            }
                        }
                    },
                    complete: function (data) {
                        waitingDialog.hide();
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}

