var $table = $("#tbl-alertas");
var $tblAlertasTTL = $("#tbl-alertasTTL");
var URL_API_VISTA = URL_API + "/Alerta/NotificacionesResponsablesApps";
var URL_API_VISTA2 = URL_API + "/Dashboard";
var PARAMS_API = {};
var RESPONSABLE_PORTAFOLIO = { TTL: "1", JdE: "2" };
var ARR_RESPONSABLE = [RESPONSABLE_PORTAFOLIO.TTL, RESPONSABLE_PORTAFOLIO.JdE];
var PROGRAMAR = { ENVIO: "1", CUERPO: "2" };
var locale = { OK: 'OK', CONFIRM: 'Enviar', CANCEL: 'Cancelar' };
var placeholder = "Responsables separados por ;";
var TITULO_MENSAJE = "Alertas - Responsables de aplicaciones";

$(function () {
    $("#btnProgramarNotificacionCuerpo").attr("disabled", true);
    $("#btnProgramarNotificacionCuerpoTTLJdE").attr("disabled", true);

    ListarRegistros();
    InitTblTTL();

    //$("#btnProgramarNotificacion").click(IrAgregarEditarNotificacion);

    //Tab1
    $("#btnBuscador").click(ListarRegistros);
    $("#btnProgramarNotificacion").click(IrProgramarEnvio);
    $("#btnProgramarNotificacionCuerpo").click(IrProgramarCuerpo);

    //Tab2
    $("#btnProgramarNotificacionTTLJdE").click(IrProgramarEnvioTTLJdE);
    $("#btnProgramarNotificacionCuerpoTTLJdE").click(IrProgramarCuerpoTTLJdE);

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        ListarRegistrosDetalle(row.Matricula, $('#tblRegistrosDetalle_' + row.Matricula), $detail);
    });

    $tblAlertasTTL.on('expand-row.bs.table', function (e, index, row, $detail) {
        ListarRegistrosDetalleResponsable(row.ResponsableId, $('#tblRegistrosDetalleResponsable_' + row.ResponsableId), $detail);
    });

    CargarCombos();
    InitControles();
    ValidarCampos();

    $("#cbTipoResponsable").on('change', function () { TipoResponsable_Change($("#btnProgramarNotificacionCuerpo")); });
    $("#cbTipoResponsableFiltro").on('change', function () { TipoResponsable_Change($("#btnProgramarNotificacionCuerpoTTLJdE")); });
});

function TipoResponsable_Change($btn) {
    $btn.attr("disabled", true);
}

function InitControles() {

    $("#divFechaInicio").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY",
        minDate: moment().startOf('day')._d
    });

    $("#divHora").datetimepicker({
        format: "HH:mm:ss"
    });
}

function CargarCombos(dataCombos) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/CargarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject.ListaPortafolioResponsables;
                    SetItems(data, $("#cbTipoResponsable"), "");
                    SetItems(data.filter(x => ARR_RESPONSABLE.includes(x.Id)), $("#cbTipoResponsableFiltro"), "");
                    $("#cbTipoResponsable").val(ID_TIPO_RESPONSABLE_DEFECTO);

                    //$("#cbTipoResponsableFiltro").val(ID_TIPO_RESPONSABLE_DEFECTO);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: true
    });
}

function ListarRegistros() {
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
        sortName: 'Matricula',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.ResponsableAplicacionId = $("#cbTipoResponsable").val() === null ? ID_TIPO_RESPONSABLE_DEFECTO : $("#cbTipoResponsable").val();
            PARAMS_API.pageNumber = p.pageNumber;
            PARAMS_API.pageSize = p.pageSize;
            PARAMS_API.sortName = p.sortName;
            PARAMS_API.sortOrder = p.sortOrder;

            return JSON.stringify(PARAMS_API);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res.ListaNotificaciones;

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
function ListarRegistrosDetalle(matricula, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListadoDetalle",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'CodigoAPT',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.ResponsableAplicacionId = $("#cbTipoResponsable").val() === null ? ID_TIPO_RESPONSABLE_DEFECTO : $("#cbTipoResponsable").val();
            PARAMS_API.Matricula = matricula;
            PARAMS_API.pageNumber = p.pageNumber;
            PARAMS_API.pageSize = p.pageSize;
            PARAMS_API.sortName = p.sortName;
            PARAMS_API.sortOrder = p.sortOrder;

            return JSON.stringify(PARAMS_API);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res.Aplicaciones;
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

function ListarRegistrosDetalleResponsable(responsableId, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListadoDetalleTTLJdE",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'CodigoAPT',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
            //PARAMS_API.ResponsableAplicacionId = $("#cbTipoResponsable").val() == null ? ID_TIPO_RESPONSABLE_DEFECTO : $("#cbTipoResponsable").val();
            PARAMS_API.ResponsableAplicacionId = responsableId;//$("#cbTipoResponsable").val() == null ? ID_TIPO_RESPONSABLE_DEFECTO : $("#cbTipoResponsable").val();
            //PARAMS_API.Matricula = matricula;
            PARAMS_API.pageNumber = p.pageNumber;
            PARAMS_API.pageSize = p.pageSize;
            PARAMS_API.sortName = p.sortName;
            PARAMS_API.sortOrder = p.sortOrder;

            return JSON.stringify(PARAMS_API);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res.Responsables;
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

function detailFormatter(index, row) {

    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="30">#</th>\
                                    <th data-field="CodigoAPT" data-sortable="true" data-halign="center" data-valign="middle" data-align="left"  data-width="200" data-sort-name="CodigoAPT">Código</th>\
                                    <th data-field="Nombre" data-sortable="true" data-halign="center" data-valign="middle" data-align="left" data-sort-name="Nombre" >Aplicación</th>\
                                    <th data-field="EstadoAplicacion" data-sortable="true" data-halign="center" data-valign="middle" data-align="left" data-width="160"  data-sort-name="EstadoAplicacion" >Estado</th>\
                                </tr>\
                            </thead>\
                        </table>', row.Matricula);

    return html;
}

function detailFormatterTTL(index, row) {

    var html = String.Format('<table id="tblRegistrosDetalleResponsable_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="30">#</th>\
                                    <th data-field="Matricula" data-sortable="true" data-halign="center" data-valign="middle" data-align="left"  data-width="200" data-sort-name="Matricula">Matrícula</th>\
                                    <th data-field="Colaborador" data-sortable="true" data-halign="center" data-valign="middle" data-align="left" data-sort-name="Colaborador">Nombre</th>\
                                    <th data-field="NroAplicaciones" data-sortable="true" data-halign="center" data-valign="middle" data-align="left" data-width="160"  data-sort-name="NroAplicaciones" >Nro. aplicaciones</th>\
                                    <th data-formatter="exportarFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="80">Exportar</th>\
                                </tr>\
                            </thead>\
                        </table>', row.ResponsableId);

    return html;
}

function exportarFormatter(value, row, index) {
    let btn1 = "";
    let btn2 = "";
    btn1 = `<a href="javascript:ExportarData('${row.Matricula}')" title="Exportar"><i class="glyphicon glyphicon-download"></i></a>`;
    btn2 = `<a href="javascript:IrEnviarNotificacion('${row.Matricula}')" title="Enviar notificación de prueba"><i class="glyphicon glyphicon-envelope"></i></a>`;

    return btn1.concat("&nbsp;&nbsp;", btn2);
}

function IrEnviarNotificacion(Matricula) {
    bootbox.addLocale('custom', locale);
    bootbox.prompt({
        title: TITULO_MENSAJE,
        message: '<p>Para:</p>',
        inputType: 'textarea',
        rows: '7',
        locale: 'custom',
        callback: function (result) {
            var data = result;
            if (data !== null && $.trim(data) === "") {
                toastr.error("El campo Para no debe estar vacio", TITULO_MENSAJE);
                return false;
            }

            if (data !== null && $.trim(data) !== "") {
                let content = {
                    Matricula: Matricula,
                    Para: $.trim(data),
                    Cuerpo: $.trim($("#txtCuerpo").val()),
                };

                EnviarNotificacion(content);
            }
        }
    });
    $(".bootbox-input-textarea").attr("placeholder", placeholder);
}

function EnviarNotificacion(data) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/EnviarNotificacion",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    toastr.success("Se envió la notificación correctamente.", TITULO_MENSAJE);
                    //ListarRegistros();
                }
            }
            //console.log(result);
            //bootbox.alert({
            //    size: "sm",
            //    title: TITULO_MENSAJE,
            //    message: "Se envió la notificación correctamente.",
            //    buttons: {
            //        ok: {
            //            label: 'Aceptar',
            //            className: 'btn-primary'
            //        }
            //    }
            //});
        },
        complete: function () {
            //$("#btnGuardarEstTec").button("reset");
            //$("#mdCambEstTec").modal('hide');
            //listarTecSTD();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });
}

function ExportarData(matricula) {
    let url = `${URL_API_VISTA2}/Reportes/GerenciaDivision/ExportarResponsable?matricula=${matricula}`;
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

function MdAddOrEditRegistro(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    if (EstadoMd)
        $("#MdAddOrEditModal").modal(opcionesModal);
    else
        $("#MdAddOrEditModal").modal("hide");
}
function LimpiarMdAddOrEditRegistro() {
    $(":input", "#formAddOrEdit").not(":button, :submit, :reset, :hidden, #txtArchivo").val("");
    $("select", "#formAddOrEdit").val(-1);
    $("#hdId").val("0");
    //$("#cbTipoFrecuencia").val(-1);
    $("#txtFechaInicio, #txtHora, #txtAsunto, #txtBuzonSalida, #txtBuzonCC, #txtCuerpo").val("");
    //$("#txtFechaInicio").val(moment(new Date()).format("DD/MM/YYYY"));
    //$("#txtHora").val(moment(new Date()).format("HH"));
    //$("#cbActivo").prop("checked", true);
    //$("#cbActivo").bootstrapToggle("on");
    $("#formAddOrEdit").validate().resetForm();
}

function IrAgregarEditarNotificacionTTLJdE() {
    //TODO
    $("#titleForm").html("Programar Notificación para Responsables de Aplicaciones - " + $("#cbTipoResponsableFiltro option:selected").text());
    $.ajax({
        url: URL_API_VISTA + "/ObtenerNotificacionResponsableAplicacion",
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        data: {
            idTipoResponsable: $("#cbTipoResponsableFiltro").val(),
            flagTTLJdE: true
        },
        success: function (result) {
            waitingDialog.hide();
            MdAddOrEditRegistro(true);
            $("#hdFlagTTLJdE").val("1");
            $("#hdIdTipoNotificacion").val($("#cbTipoResponsableFiltro").val());

            if (result !== null) {
                $("#btnProgramarNotificacionCuerpoTTLJdE").attr("disabled", false);

                $("#hdId").val(result.Id);
                $("#txtFechaInicio").val(result.FechaInicioStr);
                $("#txtHora").val(result.HoraEnvio);
                $("#txtAsunto").val(result.Asunto);
                $("#txtCuerpo").val(result.Cuerpo);
                $("#txtBuzonSalida").val(result.BuzonSalida);
                $("#txtBuzonCC").val(result.ConCopia);

                //$("#hdFlagTTLJdE").val("1");
            } else {
                $("#btnProgramarNotificacionCuerpoTTLJdE").attr("disabled", true);
            }

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            waitingDialog.hide();
        },
        async: true
    });
}

function showProgramar(tipo) {
    switch (tipo) {
        case PROGRAMAR.ENVIO:
            $(".programar-envio").show();
            $(".programar-envio").removeClass("ignore");

            $(".programar-cuerpo").addClass("ignore");
            $(".programar-cuerpo").hide();
            break;
        case PROGRAMAR.CUERPO:
            $(".programar-envio").addClass("ignore");
            $(".programar-envio").hide();

            $(".programar-cuerpo").show();
            $(".programar-cuerpo").removeClass("ignore");
            break;
    }
}

function IrProgramarEnvio() {
    IrAgregarEditarNotificacion();
    showProgramar(PROGRAMAR.ENVIO);
}

function IrProgramarCuerpo() {
    IrAgregarEditarNotificacion();
    showProgramar(PROGRAMAR.CUERPO);
}

function IrProgramarEnvioTTLJdE() {
    IrAgregarEditarNotificacionTTLJdE();
    showProgramar(PROGRAMAR.ENVIO);
}

function IrProgramarCuerpoTTLJdE() {
    IrAgregarEditarNotificacionTTLJdE();
    showProgramar(PROGRAMAR.CUERPO);
}

function IrAgregarEditarNotificacion() {
    $("#titleForm").html("Programar Notificación para Responsables de Aplicaciones - " + $("#cbTipoResponsable option:selected").text());
    $.ajax({
        url: URL_API_VISTA + "/ObtenerNotificacionResponsableAplicacion",
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: {
            idTipoResponsable: $("#cbTipoResponsable").val(),
            flagTTLJdE: false
        },
        success: function (result) {
            waitingDialog.hide();
            MdAddOrEditRegistro(true);
            $("#hdFlagTTLJdE").val("0");
            $("#hdIdTipoNotificacion").val($("#cbTipoResponsable").val());

            if (result !== null) {
                $("#btnProgramarNotificacionCuerpo").attr("disabled", false);

                $("#hdId").val(result.Id);
                $("#txtFechaInicio").val(result.FechaInicioStr);
                $("#txtHora").val(result.HoraEnvio);
                $("#txtAsunto").val(result.Asunto);
                $("#txtCuerpo").val(result.Cuerpo);
                $("#txtBuzonSalida").val(result.BuzonSalida);
                $("#txtBuzonCC").val(result.ConCopia);
            } else {
                $("#btnProgramarNotificacionCuerpo").attr("disabled", true);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            waitingDialog.hide();
        },
        async: true
    });
}

function ObtenerAlertaProgramacion() {
    let data = {
        Id: $("#hdId").val(),
        PortafolioResponsableId: $("#hdIdTipoNotificacion").val(),
        FechaInicio: dateFromString($("#txtFechaInicio").val()),
        HoraEnvio: $.trim($("#txtHora").val()),
        Asunto: $("#txtAsunto").val(),
        Cuerpo: $("#txtCuerpo").val(),
        BuzonSalida: $("#txtBuzonSalida").val(),
        ConCopia: $("#txtBuzonCC").val(),
        FlagNotificacionTTLJdE: $("#hdFlagTTLJdE").val() === "0" ? false : true
    };
    return data;
}

function RegistrarAddOrEdit() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    if ($("#formAddOrEdit").valid()) {
        $("#btnRegistrar").button("loading");
        data = ObtenerAlertaProgramacion();
        $.ajax({
            url: URL_API_VISTA + "/AddOrEditNotificacionResponsableAplicacion",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                if (result > 0) {
                    if (data.Id === 0) {
                        toastr.success("La Notificación de Responsable fue actualizado exitosamente.", "Notificación de Responsable");
                    } else {
                        toastr.success("La Notificación de Responsable fue actualizado exitosamente.", "Notificación de Responsable");
                    }

                    ListarRegistros();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function (data) {
                $("#btnRegistrar").button("reset");
                if (ControlarCompleteAjax(data))
                    MdAddOrEditRegistro(false);
                else
                    bootbox.alert("sucedió un error con el servicio", function () { });
            }
        });
    }
}


function ValidarCampos() {

    $("#formAddOrEdit").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            //txtNombre: { requiredSinEspacios: true },
            //txtDescripcion: { requiredSinEspacios: true },
            //cbTipoFrecuencia: { requiredSelect: true },
            txtFechaInicio: { requiredSinEspacios: true },
            txtHora: { requiredSinEspacios: true, min: 1, max: 24 },
            txtBuzonSalida: { requiredSinEspacios: true },
            //txtBuzonPara: { requiredSinEspacios: true },
            txtBuzonCC: { requiredSinEspacios: true },
            txtAsunto: { requiredSinEspacios: true },
            txtCuerpo: { requiredSinEspacios: true }
        },
        messages: {
            //txtNombre: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre") },
            //txtDescripcion: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción") },
            //cbTipoFrecuencia: { requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo de frecuencia") },
            txtFechaInicio: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha de inicio") },
            txtHora: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "la hora"), min: "La hora mínima es 1.", max: "La hora máxima es 24." },
            txtAsunto: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el asunto de la notificación") },
            txtCuerpo: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el cuerpo de la notificación") },
            txtBuzonSalida: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el buzón de salida") },
            //txtBuzonPara: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el destinario") },
            txtBuzonCC: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el destinario de con copia a") },
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtFechaInicio") element.parent().parent().append(error);
            else element.parent().append(error);
        }
    });
}

function InitTblTTL() {
    $tblAlertasTTL.bootstrapTable("destroy");
    $tblAlertasTTL.bootstrapTable();
    $tblAlertasTTL.bootstrapTable('append', { Nombre: "TTL", ResponsableId: 1 });
    $tblAlertasTTL.bootstrapTable('append', { Nombre: "Jefe de equipo", ResponsableId: 2 });
}