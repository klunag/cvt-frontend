var $table = $("#tbl-alertas");
var URL_API_VISTA = URL_API + "/Alerta";
var PARAMS_API = {};

$(function () {
    InitControles();
    ListarAlertasTecnicas();

    $("#btnBuscador").click(ListarAlertasTecnicas);
    $("#btnExportar").click(ExportarInfo);

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        if (row.NroAlertasDetalle !== 0) {
            ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
        } else {
            $detail.empty().append("No existen registros.");
        }
        //ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
    });

    CargarCombos();
    FormatoCheckBox($("#divActivo"), "cbActivo");
    ValidarCampos();
});
function CargarCombos() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/Tecnicas/CargarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Frecuencia, $("#cbTipoFrecuencia"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}
function InitControles() {
    $("#dpFecConsulta-btn").datetimepicker({
        locale: 'es',
        useCurrent: true,
        format: 'DD/MM/YYYY'
    });

    $("#dpFecConsulta").val(moment(new Date()).format("DD/MM/YYYY"));

    $("#divFechaInicio").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY"
    });

    $("#divHora").datetimepicker({
        format: "HH:mm:ss"
    });
}
function ValidarCampos() {

    $.validator.addMethod("formato24Horas", (value, element) => {
        let regex = new RegExp(regexHoras);
        return regex.test(value);
    });

    $("#formAddOrEdit").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbTipoFrecuencia: { requiredSelect: true },
            txtFechaInicio: { requiredSinEspacios: true },
            txtHora: { requiredSinEspacios: true, min: 1, max: 24 },
            txtAsunto: { requiredSinEspacios: true },
            txtEnviarA: { requiredSinEspacios: true }
        },
        messages: {
            cbTipoFrecuencia: { requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo de frecuencia") },
            txtFechaInicio: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha de inicio") },
            txtHora: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "la hora"), min: "La hora mínima es 1.", max: "La hora máxima es 24." },
            txtAsunto: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el asunto") },
            txtEnviarA: { requiredSinEspacios: String.Format("Debes ingresar {0}.", "el destinario") }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtFechaInicio") element.parent().parent().append(error);
            else element.parent().append(error);
        }
    });
}
function ListarAlertasTecnicas() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Tecnicas",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Descripcion',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.fechaConsulta = $("#dpFecConsulta").val() === null || $("#dpFecConsulta").val() === "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#dpFecConsulta").val())).format("YYYY-MM-DD");
            PARAMS_API.pageNumber = p.pageNumber;
            PARAMS_API.pageSize = p.pageSize;
            PARAMS_API.sortName = p.sortName;
            PARAMS_API.sortOrder = p.sortOrder;

            return JSON.stringify(PARAMS_API);
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
function ListarAlertasDetalle(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Detalle",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.id = id;
            PARAMS_API.fechaConsulta = $("#dpFecConsulta").val() === null || $("#dpFecConsulta").val() === "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#dpFecConsulta").val())).format("YYYY-MM-DD");
            PARAMS_API.pageNumber = p.pageNumber;
            PARAMS_API.pageSize = p.pageSize;
            PARAMS_API.sortName = p.sortName;
            PARAMS_API.sortOrder = p.sortOrder;

            return JSON.stringify(PARAMS_API);
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
function semaforoFormatter(value, row, index) {
    var html = "";
    if (row.NroAlertasDetalle === 0) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else { //ROJO
        if (row.NroAlertaCriticas > 0)
            html = '<button type="button" class="btn btn-danger btn-circle"></button>';
        else if (row.NroAlertasNoCriticas > 0)
            html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    
    return html;
}
function detailFormatter(index, row) {

    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="30">#</th>\
                                    <th data-field="Detalle" data-sortable="true" data-halign="center" data-valign="middle" data-align="left"  data-width="280" data-sort-name="FechaCreacion">Detalle</th>\
                                    <th data-field="Descripcion" data-sortable="true" data-halign="center" data-valign="middle" data-align="left" data-sort-name="Descripcion" >Descripción</th>\
                                    <th data-field="FechaHoraCreacionFormato" data-sortable="true" data-halign="center" data-valign="middle" data-align="center"  data-sort-name="FechaCreacion" data-width="175">Fecha de Registro</th>\
                                </tr>\
                            </thead>\
                        </table>', row.Id);

    return html;
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
    $("#hdIdAlerta").val("0");
    $("#hdIdAlertaProgramacion").val("0");
    $("#cbTipoFrecuencia").val(-1);
    $("#txtFechaInicio, #txtHora, #txtAsunto, #txtEnviarA").val("");
    $("#txtFechaInicio").val(moment(new Date()).format("DD/MM/YYYY"));
    $("#txtHora").val(moment(new Date()).format("HH"));
    $("#cbActivo").prop("checked", true);
    $("#cbActivo").bootstrapToggle("on");
    $("#formAddOrEdit").validate().resetForm();
}
function IrEditarRegistro(id) {
    $("#titleForm").html("Configurar Alerta");
    $.ajax({
        url: URL_API_VISTA + "/Tecnicas/GetAlertaProgramacion/" + id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            waitingDialog.hide();
            MdAddOrEditRegistro(true);
            $("#hdIdAlerta").val(id);
            if (result != null) {
                $("#hdIdAlertaProgramacion").val(result.Id);
                $("#cbTipoFrecuencia").val(result.FrecuenciaEnvio);
                $("#txtFechaInicio").val(result.FechaInicioStr);
                $("#txtHora").val(result.HoraEnvio);
                $("#txtAsunto").val(result.Asunto);
                $("#txtEnviarA").val(result.Buzones);
                $("#cbActivo").prop("checked", result.Activo);
                $("#cbActivo").bootstrapToggle(result.Activo ? "on" : "off");
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
        Id: $("#hdIdAlertaProgramacion").val(),
        AlertaId: $("#hdIdAlerta").val(),
        FrecuenciaEnvio: $("#cbTipoFrecuencia").val(),
        FechaInicio: castDate($("#txtFechaInicio").val()),
        HoraEnvio: $.trim($("#txtHora").val()),
        Activo: $("#cbActivo").prop("checked"),
        Asunto: $("#txtAsunto").val(),
        Buzones: $("#txtEnviarA").val()
    };
    return data;
}
function RegistrarAddOrEdit() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    if ($("#formAddOrEdit").valid()) {
        $("#btnRegistrar").button("loading");
        data = ObtenerAlertaProgramacion();
        $.ajax({
            url: URL_API_VISTA + "/Tecnicas/AddorEditAlertaProgramacion",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (result) {
                if (result > 0) {
                    toastr.success("Alerta técnica registrado exitosamente.", "Alerta Técnica");
                    ListarAlertasTecnicas();
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
function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar("Excepción");
        return false;
    }

    var fechaConsulta = $("#dpFecConsulta").val() == null || $("#dpFecConsulta").val() == "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#dpFecConsulta").val())).format("YYYY-MM-DD");

    let url = `${URL_API_VISTA}/ExportarTecnicas?fechaConsulta=${fechaConsulta}&sortName=${PARAMS_API.sortName}&sortOrder=${PARAMS_API.sortOrder}`;
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