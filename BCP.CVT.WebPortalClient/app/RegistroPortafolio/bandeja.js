var $table = $("#tblRegistro");
var $tableFlujos = $("#tblFlujos");
var DATA_EXPORTAR = {};
//var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_REGISTRO_PAGINACION = PAGINA_TAMANIO;
var ULTIMO_PAGE_NUMBER = PAGINA_ACTUAL;
var ULTIMO_SORT_NAME = "applicationId";
var ULTIMO_SORT_ORDER = "asc";

const TITULO_MENSAJE = "Portafolio de aplicaciones";
const MENSAJE = "¿Estás seguro que deseas continuar con el cambio de estado de esta aplicación?";
const TITULO_NO_PASE = "La aplicación no ha completado el registro de todos los campos requeridos, no es posible consultar o confirmar estos datos";
const URL_API_VISTA = URL_API + "/applicationportfolio";

$(function () {

    validarFormNoVigente();
    $("#txtAplicacionFiltro").val(nombre_app);
    ListarRegistros();    
    InitAcciones();
    InitInputFiles();

   
    ULTIMO_PAGE_NUMBER = PAGINA_ACTUAL;
    ULTIMO_REGISTRO_PAGINACION = PAGINA_TAMANIO;

    $("#txtAplicacionFiltro").keypress(function (event) {
        if (event.keyCode === 13) {
            $("#btnBuscar").click();
            event.preventDefault();
        }
    });
});

function InitAcciones() {       
    $("#btnRegistrarNoVigente").click(CambiarEstadoRegistro);
    $("#btnRegistrarVigente").click(RegresarEstadoRegistro);
    $("#btnEliminar").click(SolicitudEliminacion);
    
}

function RefrescarListado() {
    ULTIMO_PAGE_NUMBER = 1;
    ListarRegistros();
}

function AddRegistro() {
    $("#title-md").html("Nuevo registro");
    LimpiarModal();
    OpenCloseModal($("#mdRegistro"), true);
}

function LimpiarModal() {
    LimpiarValidateErrores($("#formNoVigente"));
    $(":input", "#formNoVigente").val("");
    $("#ckbEquipoAgil").prop("checked", false);
    $("#ckbEquipoAgil").bootstrapToggle("off");
}

function ListarRegistros() {
    nombre_app = $("#txtAplicacionFiltro").val();
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/listByUser`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: [30, 60, 90],
        sortName: ULTIMO_SORT_NAME,
        sortOrder: ULTIMO_SORT_ORDER,
        queryParams: function (p) {
            ULTIMO_PAGE_NUMBER = p.pageNumber;
            ULTIMO_REGISTRO_PAGINACION = p.pageSize;
            ULTIMO_SORT_NAME = p.sortName;
            ULTIMO_SORT_ORDER = p.sortOrder;

            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtAplicacionFiltro").val());
            DATA_EXPORTAR.applicationId = $.trim($("#txtAplicacionFiltro").val());
            DATA_EXPORTAR.Status = $("#cbFilEstado").val();
            DATA_EXPORTAR.pageNumber = ULTIMO_PAGE_NUMBER;
            DATA_EXPORTAR.pageSize = ULTIMO_REGISTRO_PAGINACION;
            DATA_EXPORTAR.sortName = ULTIMO_SORT_NAME;
            DATA_EXPORTAR.sortOrder = ULTIMO_SORT_ORDER;

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

function linkFormatter(value, row, index) {
    let option = value;
    if (!row.aplicacionRevertida || row.aplicacionRevertida == null) {
        option = `<a href="javascript:EditarRegistro(${row.id})" title="Editar registro">${value}</a>`;
    }
    else option = `<a href="javascript:EditarRegistro2(${row.id})" title="Editar registro">${value}</a>`;
    return option;
}

function EditarRegistro(id) {
    window.document.location.href = `DetalleAplicacion?id=${id}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}`;
}

function EditarRegistro2(id) {
    window.document.location.href = `ReversionAplicacion?id=${id}&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}`;
}

function opcionesFormatter(value, row, index) {
    let style_color = row.registrationSituation == REGISTRO_COMPLETO ? 'iconoVerde ' : "iconoRojo ";
    let btnNoVigente = '';
    let btnEliminar = '';
    let btnPase = '';
    if (row.status != ESTADO_NOVIGENTE && row.status != ESTADO_ELIMINADA) {
        btnNoVigente = `<a href="javascript:irNoVigente(${row.id},'${row.statusDetail}')" title="Cambia el estado de la aplicación a No Vigente"><i class="iconoRojo glyphicon glyphicon glyphicon-off"></i></a>`;
         btnPase = `<a href="javascript:irPase(${row.id},${row.registrationSituation})" title="Confirmar pase a producción"><i class="${style_color} glyphicon glyphicon-cloud-upload"></i></a>`;
    }
        else
        btnNoVigente = `<a href="javascript:activarNoVigente(${row.id})" title="Reactiva tu aplicación manteniendo el estado anterior de la aplicación "><i class="iconoVerde glyphicon glyphicon glyphicon-off"></i></a>`;
    
    

    if (row.status == ESTADO_ELIMINADA) {
        btnEliminar = `<a href="javascript:activarEliminar(${row.id})" title="Reactiva tu aplicación manteniendo el estado anterior de la aplicación"><i class="iconoVerde glyphicon glyphicon-ok"></i></a>`;
        btnNoVigente = ``;
    }
    else
        btnEliminar = `<a href="javascript:irEliminar(${row.id},'${row.statusDetail}')" title="Inicia el flujo de eliminación de la aplicación"><i class="iconoRojo glyphicon glyphicon-remove"></i></a>`;

    return btnPase.concat("&nbsp;&nbsp;", btnNoVigente.concat("&nbsp;&nbsp;", btnEliminar));
}

function irNoVigente(id,statusDetail) {
    $("#hdAplicacionId").val(id);
    $("#hdPreviousState").val(statusDetail);
    LimpiarModal();
    OpenCloseModal($("#modalNoVigente"), true);
}

function activarNoVigente(id) {
    $("#hdAplicacionId").val(id);
    LimpiarModal();
    OpenCloseModal($("#modalVigente"), true);
}

function irEliminar(id, statusDetail) {
    $("#hdAplicacionId").val(id);
    $("#hdPreviousState").val(statusDetail);
    OpenCloseModal($("#modalEliminar"), true);
}

function situacionFormatter(value, row, index) {
    var html = "";
    if (row.registrationSituation === REGISTRO_COMPLETO) { //VERDE
        html = `<a class="btn btn-success btn-circle" title="Registro completo" style="cursor: pointer;" onclick="javascript:irObservar(${row.id},'${row.applicationId}','${row.name}')"></a>`;
    } else if (row.registrationSituation === REGISTRO_PARCIAL) { //ROJO
        html = `<a class="btn btn-danger btn-circle" title="Registro parcial" style="cursor: pointer;" onclick="javascript:irObservar(${row.id},'${row.applicationId}','${row.name}')"></a>`;
    }    
    return html;
}

function irPase(id, situacion) {    
    if (!(situacion == REGISTRO_COMPLETO)) {
        bootbox.alert({
            message: TITULO_NO_PASE
        });
    }
}

function CambiarEstadoRegistro() {   
    if ($("#formNoVigente").valid())
    {
        $("#btnRegistrarNoVigente").button("loading");

        let pag = {
            Id: ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val()),
            Status: ESTADO_NOVIGENTE,
            Comments: $.trim($("#txtDescripcion").val()),
            PreviousState: $("#hdPreviousState").val()
        };

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/application/changeStatus`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(pag),
                        dataType: "json",   
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                
                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {
                    
                            $("#btnRegistrarNoVigente").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalNoVigente"), false);
                            //LimpiarModal();
                                
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



function activarEliminar(id) {
  
        let pag = {
            Id: id,
        };

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/application/changeStatusEliminado`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(pag),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    RefrescarListado();
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


function RegresarEstadoRegistro() {
    if ($("#formVigente").valid()) {
        $("#btnRegistrarVigente").button("loading");

        let pag = {
            Id: ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val()),
            Status: ESTADO_NOVIGENTE,
            Comments: $.trim($("#txtDescripcion2").val())
        };

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/application/reverseStatus`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(pag),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {

                            $("#btnRegistrarVigente").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalVigente"), false);
                            //LimpiarModal();

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



function SolicitudEliminacion() {
    if ($("#formEliminar").valid()) {
        $("#btnEliminar").button("loading");
        let ConformidadGST = $("#flConformidad").get(0).files;
        let TicketEliminacion = $("#flTicket").get(0).files;
        let Ratificacion = $("#flRatificacion").get(0).files;


        let pag = {
            Id: ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val()),
            Status: ESTADO_NOVIGENTE,
            Comments: $.trim($("#txtDescripcionEliminar").val()),
            PreviousState: $("#hdPreviousState").val(),

        };

        //let pag = new FormData();
        //let ConformidadGST = $("#flConformidad").get(0).files;
        //let TicketEliminacion = $("#flTicket").get(0).files;
        //let Ratificacion = $("#flRatificacion").get(0).files;

        //pag.append("ConformidadGST", ConformidadGST[0]);
        //pag.append("TicketEliminacion", TicketEliminacion[0]);
        //pag.append("Ratificacion", Ratificacion[0]);
        //pag.append("Id", ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val()));
        //pag.append("Username", USUARIO.UserName);
        //pag.append("Status", ESTADO_NOVIGENTE);
        //pag.append("Comments", $.trim($("#txtDescripcionEliminar").val()));
        //pag.append("PreviousState", $("#hdPreviousState").val());
        //pag.append("Comments2", $.trim($("#txtDescripcionEliminar").val()));
        //pag.append("Matricula", USUARIO.Matricula);

        var idsol=0;

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/application/remove`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(pag),
                        //data: pag,
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        //contentType: false,
                        //processData: false,
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    idsol = dataObject;
                                  
                                    toastr.success("Se envió la solicitud de eliminación.", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {

                            $("#btnEliminar").button("reset");
                            waitingDialog.hide();
                            UploadFile($("#flConformidad"), $("#flTicket"), $("#flRatificacion"), idsol);
                            OpenCloseModal($("#modalEliminar"), false);
                            //LimpiarModal();

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




function validarFormNoVigente() {    
    $("#formNoVigente").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtDescripcion: {
                requiredSinEspacios: true,
                //existeNombreEntidad: true
            }
        },
        messages: {
            txtDescripcion: {
                requiredSinEspacios: "Debes ingresar un comentario para el cambio de estado"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDescripcion") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function InitInputFiles() {    
    InitUpload($('#txtNomArchivoConformidad'), 'inputConformidad');
    InitUpload($('#txtNomTicket'), 'inputTicket');
    InitUpload($('#txtNomRatificacion'), 'inputRatificacion');        
}

function InitUpload($inputText, classInput, btnDownload = null, btnRemove = null) {
    var inputs = document.querySelectorAll(`.${classInput}`);
    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener('change', function (e) {
            var fileName = '';
            if (this.files && this.files.length > 1) {
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            } else {
                if (this.files && this.files.length == 1) {
                    if (btnDownload != null) btnDownload.show();
                    if (btnRemove != null) btnRemove.show();
                } else {
                    if (btnDownload != null) btnDownload.hide();
                    if (btnRemove != null) btnRemove.hide();
                }
                fileName = e.target.value.split('\\').pop();
            }

            if (fileName)
                $inputText.val(fileName);
            else
                label.innerHTML = labelVal;
        });

        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
}


function validarFormImportar() {

    $.validator.addMethod("requiredArchivo", function (value, element) {
        return $.trim(value) !== "";
    });


    $("#formEliminar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtDescripcionEliminar: {
                requiredSinEspacios: true
            },
            flConformidad: {
                requiredArchivo: true
                //requiredExcel: true
            },
            flRatificacion: {
                requiredArchivo: true
                //requiredExcel: true
            },
            flTicket: {
                requiredArchivo: true
                //requiredExcel: true
            }
        },
        messages: {
            txtDescripcionEliminar: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el motivo de la eliminación.")
            },
            flConformidad: {
                requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo")
            },
            flRatificacion: {
                requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo")
            },
            flTicket: {
                requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtNomArchivoConformidad" || element.attr('name') === "flConformidad") {
                element.parent().parent().parent().parent().append(error);
            }
            else if (element.attr('name') === "txtNomTicket" || element.attr('name') === "flTicket") {
                element.parent().parent().parent().parent().append(error);
            }
            else if (element.attr('name') === "txtNomRatificacion" || element.attr('name') === "flRatificacion") {
                element.parent().parent().parent().parent().append(error);
            }
            else {
                element.parent().append(error);
            }
        }
    });
}

function UploadFile($fileInput, $fileInput1, $fileInput2,idsol ) {

    let formData = new FormData();
    let ConformidadGST = $fileInput.get(0).files;
    let TicketEliminacion = $fileInput1.get(0).files;
    let Ratificacion = $fileInput2.get(0).files;
    formData.append("File1", ConformidadGST[0]);
    formData.append("File2", TicketEliminacion[0]);
    formData.append("File3", Ratificacion[0]);
    formData.append("SolicitudAplicacionId", idsol);


    $.ajax({
        url: URL_API + "/File/upload2",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            estado = result;
            OpenCloseModal($("#modalEliminar"), false);
            //if ($table !== null) {
            //    $table.bootstrapTable("refresh");
            //}
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });
    return estado;
}

function dateFormat2(value, row, index) {    
    return moment(value).format('DD/MM/YYYY HH:mm:ss');    
}

function irObservar(id, codApp, nomApp) {
    $("#hdAplicacionId").val(id);
    ListarRegistrosFlujos(id);
    $("#spanApp").text(codApp + "-" + nomApp);
    OpenCloseModal($("#modalRechazarAplicacion"), true);
}

function ListarRegistrosFlujos(id) {    
    $tableFlujos.bootstrapTable('destroy');
    $tableFlujos.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/flows`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: 1,
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "typeRegister",
        sortOrder: "asc",
        queryParams: function (p) {            
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.id = $.trim($("#hdAplicacionId").val());

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

function estadoFormatter(value, row, index) {
    var html = "";
    if (row.isCompleted === true) { //VERDE
        html = '<a class="btn btn-success btn-circle" title="Atendida"></a>';
    } else if (row.isCompleted === false) { //ROJO
        html = '<a class="btn btn-danger btn-circle" title="Pendiente de atención"></a>';
    }
    return html;
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }
    //DATA_EXPORTAR.nombre = $.trim($("#txtAplicacionFiltro").val());
    //DATA_EXPORTAR.applicationId = $.trim($("#txtAplicacionFiltro").val());
    //DATA_EXPORTAR.username = USUARIO.UserName;
    //DATA_EXPORTAR.Status = $("#cbFilEstado").val();
    //DATA_EXPORTAR.pageNumber = ULTIMO_PAGE_NUMBER;
    //DATA_EXPORTAR.pageSize = ULTIMO_REGISTRO_PAGINACION;
    //DATA_EXPORTAR.sortName = ULTIMO_SORT_NAME;
    //DATA_EXPORTAR.sortOrder = ULTIMO_SORT_ORDER;

    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre == null ? '' : DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&criticidadId=${DATA_EXPORTAR.CriticidadId}&gerencia=${DATA_EXPORTAR.Gerencia == null ? '' : DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division == null ? '' : DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad == null ? '' : DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area == null ? '' : DATA_EXPORTAR.Area}`;
    let url = `${URL_API_VISTA}/ExportarSolicitudesCreacion?nombre=${DATA_EXPORTAR.nombre}&status=${DATA_EXPORTAR.Status}&user=${DATA_EXPORTAR.username}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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