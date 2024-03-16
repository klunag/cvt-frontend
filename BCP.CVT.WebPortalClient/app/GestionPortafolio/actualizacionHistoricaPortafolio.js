
var $tblResults = $("#tblResults");

const URL_API_VISTA = URL_API + "/applicationportfolio";

const URL_API_GESTION = URL_API + "/Aplicacion/GestionAplicacion";

const TITULO_MENSAJE = "Portafolio de aplicaciones";
const MENSAJE = "¿Estás seguro que deseas actualizar el catálogo con el archivo adjunto?, esta acción puede crear nuevas aplicaciones por lo que es importante utilizarlo con cuidado.";


$(function () {
    InitTables();

    //setDefaultHd($("#txtAplicacion"), $("#hAplicacion"));
    InitUpload($('#txtArchivo'), 'inputfile');

    $("#btnUpdate").click(IrActualizarApps);
    $("#btnDescarApps").click(DescargarAppsActualizar);
    $("#btnActualizar").click(PrevActualizarHistorico);
    $("#btnExportarValidacionCargaMasiva").click(DescargarValidaciones);

    $("#btnEliminar").click(EliminarAplicaciones);

});

function EliminarAplicaciones() {
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás totalmente seguro de eliminar todas las aplicaciones registradas en el portafolio?, esta acción no es reversible.",
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            result = result || null;
            if (result !== null && result) {
                EliminarAppsPortafolio();
            }
        }
    });
}

function EliminarAppsPortafolio() {    
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#btnEliminar").button("loading");    

    $.ajax({
        url: URL_API_VISTA + "/GestionAplicacion/EliminarPortafolio",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "GET",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {                    
                    waitingDialog.hide();
                    toastr.success("Se eliminaron las aplicaciones correctamente", TITULO_MENSAJE);                    
                }
            }
        },
        complete: function (data) {
            $("#btnEliminar").button("reset");

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            $("#btnEliminar").button("reset");
        }
    });    
}

function InitTables() {
    $tblResults.bootstrapTable("destroy");
    $tblResults.bootstrapTable({ data: [] });
}


function InitUpload($inputText, classInput) {
    var inputs = document.querySelectorAll(`.${classInput}`);
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
                $inputText.val(fileName);
            else
                label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
}

function IrActualizarApps() {

    //LimpiarValidateErrores($("#formImportar"));
    //$("#titleFormImp").html(String.Format("{0} aplicaciones", "Actualización masiva de"));
    $("#flArchivo").val("");
    $("#txtArchivo").val(TEXTO_SIN_ARCHIVO);

    //$("#mdImportar").modal(opcionesModal);
}

function DescargarAppsActualizar() {
    let url = `${URL_API_VISTA}/GestionAplicacion/Exportar/ActualizarHistorico`;
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
function DescargarValidaciones() {
    let url = `${URL_API_VISTA}/GestionAplicacion/Exportar/ValidacionCargaMasiva`;
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

function PrevActualizarHistorico(){
   bootbox.confirm({
    title: TITULO_MENSAJE,
       message: MENSAJE,
    buttons: SET_BUTTONS_BOOTBOX,
    callback: function (result) {
        result = result || null;
        if (result !== null && result) {
            ActualizarAplicaciones();
        }
    }
});
}
function ActualizarAplicaciones() {
    //if ($("#formImportar").valid()) {

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $("#btnActualizar").button("loading");

        let formData = new FormData();
        let file = $("#flArchivo").get(0).files;
        formData.append("File", file[0]);

        $.ajax({
            url: URL_API_VISTA + "/GestionAplicacion/ActualizarAplicacionesHistorico",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        let dataRetorno = dataObject;
                        waitingDialog.hide();
                        toastr.success("Se actualizaron los registros correctamente", TITULO_MENSAJE);
                        showDetalleCarga(dataRetorno);
                    }
                }
            },
            complete: function (data) {
                $("#btnActualizar").button("reset");
          
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    //}
}

function SetDescripcionCarga(errores) {
    let descripcion = "Se realizó la actualización masiva de aplicaciones correctamente";
    if (errores.length > 0) {
        descripcion = "La actualización masiva de aplicaciones ha finalizado, se encontraron inconvenientes al procesar algunos registros.";
    }
    $("#pDetalleCarga").html(descripcion);
}

function showDetalleCarga(_data) {
    if (_data) {
        let total = _data.TotalRegistros;
        let totalUpdate = _data.TotalActualizados;
        $("#txtTotal").val(total || "0");
        $("#txtTotalUpdate").val(totalUpdate || "0");

        let errores = _data.Errores || [];
        SetDescripcionCarga(errores);

        if (errores !== null && errores.length > 0) {
            $(".error-div").show();
            $tblResults.bootstrapTable("destroy");
            $tblResults.bootstrapTable({
                data: errores,
                pagination: true,
                pageNumber: 1,
                pageSize: 10
            });
        } else {
            $(".error-div").hide();
        }
        OpenCloseModal($("#mdResults"), true);
        IrActualizarApps();
    }
}

function descripcionFormatter(value, row) {
    //let formatter = "<p class='opcionesStyle'>" + value + "</p>";
    let newStr = ReduceDimString(value, 105);
    let formatter = `<p class='opcionesStyle'>${newStr}</p>`;
    return formatter;
}

function generalFormatter(value, row) {
    let formatter = value;
    return formatter;
}


function dateFormat2(value, row, index) {
    return moment(value).format('DD/MM/YYYY HH:mm:ss');
}