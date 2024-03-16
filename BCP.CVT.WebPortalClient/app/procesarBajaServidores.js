var URL_API_VISTA = URL_API + "/Equipo";
var $table = $("#tblServidores");
const TITULO_MENSAJE = "Procesar Baja de Servidores";
const MENSAJE_PROCESAR = "Se ejecutará la inactivación de los servidores del listado seleccionados. ¿Estás seguro de continuar?";
const MENSAJE_RECHAZAR = "Se esta rechazando los registros selecionados. ¿Estás seguro de continuar?";
const INIT_FILTER_ESTADO = [1];

$(function () {
    InitMultiSelect();
    cargarCombos();
    InitAutocompletarBuilder($("#txtEquipo"), null, ".containerFiltro", "/Equipo/GetEquipoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtTicket"), null, ".containerFiltroTk", "/Equipo/GetTicketByFiltro?filtro={0}");
    initFecha();

    $("#cbFiltroEstadoSolicitud").val(INIT_FILTER_ESTADO);
    $("#cbFiltroEstadoSolicitud").multiselect("refresh");

    listarRegistros();   
});

function initFecha() {
    $("#divFechaFiltroDesde, #divFechaFiltroHasta").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#FechaFiltroDesde, #FechaFiltroHasta").val("");
}

function buscar() {
    listarRegistros();
}

function InitMultiSelect() {
    SetItemsMultiple([], $("#cbFiltroEstadoSolicitud"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
}

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    if (FLAG_ADMIN == 1) {
                        SetItemsMultiple(dataObject.EstadoBajaServidor, $("#cbFiltroEstadoSolicitud"), TEXTO_TODOS, TEXTO_TODOS, true);
                    }
                    else {
                        SetItemsMultiple(dataObject.EstadoBajaServidor, $("#cbFiltroEstadoSolicitud"), TEXTO_TODOS, TEXTO_TODOS, true);
                    }
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    let fechaDesde = $("#FechaFiltroDesde").val() ? moment(dateFromString($("#FechaFiltroDesde").val())).format("YYYY-MM-DD") : "";
    let fechaHasta = $("#FechaFiltroHasta").val() ? moment(dateFromString($("#FechaFiltroHasta").val())).format("YYYY-MM-DD") : "";

    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/ListarPendienteBajaServidores",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "Nombre",
        sortOrder: "asc",
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $("#txtEquipo").val() == "" ? null : $("#txtEquipo").val();
            DATA_EXPORTAR.Ticket = $("#txtTicket").val() == "" ? null : $("#txtTicket").val();
            DATA_EXPORTAR.FechaBusIni = fechaDesde;
            DATA_EXPORTAR.FechaBusFin = fechaHasta;
            DATA_EXPORTAR.EstadoSolicitudBaja = $.isArray($("#cbFiltroEstadoSolicitud").val()) ? $("#cbFiltroEstadoSolicitud").val() : [$("#cbFiltroEstadoSolicitud").val()];
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

    $table.bootstrapTable('hideColumn', 'Id')
}

function validarForm() {
    $.validator.addMethod("requiredCheck", function (value, element) {
        return $("input[name='btSelectItem']:checked").length > 0;
    }, "Por favor, selecciona al menos un elemento");

    $("#formBajaServidores").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            btSelectItem: {
                requiredCheck: true
            }
        },
        messages: {
            btSelectItem: {
                requiredCheck: "Debe seleccionar un elemento del listado"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "btSelectItem") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function irProcesar() {
    let existenIdSelecionados = obtenerIDsSeleccionados();
    if (existenIdSelecionados == "") {
        MensajeGeneralAlert(TITULO_MENSAJE, "Debe selecionar al menos 1 un servidor de la lista");
    }
    else {
        if ($("#formBajaServidores").valid()) {
            bootbox.confirm({
                title: TITULO_MENSAJE,
                message: MENSAJE_PROCESAR,
                buttons: SET_BUTTONS_BOOTBOX,
                callback: function (result) {
                    result = result || null;
                    if (result !== null && result) {
                        sendDataFormAPI($("#btnCompletarProceso"), true);
                    }
                }
            });
        }
    }
}

function irRechazar() {
    let existenIdSelecionados = obtenerIDsSeleccionados();
    if (existenIdSelecionados == "") {
        MensajeGeneralAlert(TITULO_MENSAJE, "Debe selecionar al menos 1 un servidor de la lista");
    }
    else {
        if ($("#formBajaServidores").valid()) {
            bootbox.confirm({
                title: TITULO_MENSAJE,
                message: MENSAJE_RECHAZAR,
                buttons: SET_BUTTONS_BOOTBOX,
                callback: function (result) {
                    result = result || null;
                    if (result !== null && result) {
                        sendDataFormAPI($("#btnCompletarProceso"), false);
                    }
                }
            });
        }
    }
}

function obtenerIDsSeleccionados() {
    var selecciones = $table.bootstrapTable('getSelections');
    var idsSeleccionados = selecciones.map(function (fila) {
        return fila.Id;
    });
    return idsSeleccionados.join('|');
}

function sendDataFormAPI($btn, aprobado) {
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }

    let data = {
        lstServidores: obtenerIDsSeleccionados(),
        isApprovedBaja: aprobado
    };

    $.ajax({
        url: URL_API_VISTA + "/ProcesarBajaServidores",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    if (dataObject == "ok") {
                        toastr.success("Se procesó la baja de los servidores seleccionados", TITULO_MENSAJE);
                        waitingDialog.hide();
                        setTimeout(function () {
                            location.reload();
                        }, 3000);
                    }
                    else {
                        MensajeGeneralAlert(TITULO_MENSAJE, "Se ha encontrado un inconveniente en la baja de los servidores seleccionados, vuelve a intentarlo.");
                    }
                }
            }
        },
        complete: function (data) {
            if ($btn !== null) {
                $btn.button("reset");
                waitingDialog.hide();
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

