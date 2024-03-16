var $table = $("#tblRegistro");
var $tblTecNoInstalads = $("#tbl-tecnologiaInstaladas");
var $tblTecNoRegistradas = $("#tbl-tecnologiaNoRegistrada");
var $tblAplicacionesRelacionadas = $("#tbl-aplicacionesRelacionadas");
var $tblProcesadores = $("#tbl-Procesadores");
var $tblVulnsByEquipo = $("#tbl-vulns");
var $tblEspacioDisco = $("#tbl-EspacioDisco");
var $tblCertificadoDigital = $("#tbl-certificadodigital");

var URL_API_VISTA = URL_API + "/Equipo";

var DATA_VULNERABILIDADES = [], DATA_EXPORTAR_VULN = {};

$(function () {
    $tblTecNoInstalads.bootstrapTable({ data: [] });
    $tblTecNoRegistradas.bootstrapTable({ data: [] });
    $tblAplicacionesRelacionadas.bootstrapTable({ data: [] });
    $tblProcesadores.bootstrapTable({ data: [] });
    $tblVulnsByEquipo.bootstrapTable({ data: [] });
    $tblEspacioDisco.bootstrapTable({ data: [] });
    $tblCertificadoDigital.bootstrapTable({ data: [] });

    InitControles();
    if (IdEquipo > 0) {
        $("#hdId").val(IdEquipo);
        EditRegistro(IdEquipo);
    }
});

function AplicacionLink(value, row) {
    if (FLAG_ADMIN == 1)
        return `<a href="/Vista/DetalleAplicacion?Id=${value}"  target="_blank"  title="Ver información">${value}</a>`;
    else
        return value;
}

function ListarAplicacionesRelacionadasAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Relacion/GetRelacionesByEquipoId?equipoId=${tmp_params.equipoId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res);
    }).fail(function () {
        params.success({ Rows: [], Total: 0 });
    });
}

function ListarAplicacionesRelacionadas(id) {
    $tblAplicacionesRelacionadas.bootstrapTable('destroy');
    $tblAplicacionesRelacionadas.bootstrapTable({
        ajax: "ListarAplicacionesRelacionadasAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "Relacion.CodigoAPT",
        sortOrder: "asc",
        queryParams: function (p) {
            return JSON.stringify({
                equipoId: id,
                pageNumber: p.pageNumber,
                pageSize: p.pageSize,
                sortName: p.sortName,
                sortOrder: p.sortOrder
            });
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

function EditRegistro(id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/GetEquipoDetalle/" + id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            $("#hdId").val(id);
            if (result !== null) {
                var objEquipo = result;
                if (objEquipo != null) {
                    $("#txtEquipoNombre").val(objEquipo.Nombre);
                    $("#txtTipoEquipo").val(objEquipo.TipoEquipo);
                    $("#txtDominio").val(objEquipo.Dominio);
                    $("#txtIP").val(objEquipo.IP);
                    $("#txtSO").val(objEquipo.SistemaOperativo);
                    $("#txtAmbiente").val(objEquipo.Ambiente);
                    $("#txtVentana").val(objEquipo.AmbienteDTO.Ventana);
                    $("#txtTipo").val(objEquipo.CaracteristicaEquipoToString);
                    $("#txtRAM").val(objEquipo.MemoriaRam);
                    $("#txtVulns").val(objEquipo.CantidadVulnerabilidades);
                    $("#txtCreadoPor").val(objEquipo.UsuarioCreacion);
                    $("#txtFechaCreacion").val(objEquipo.FechaCreacionFormato);
                    $("#txtCodigoEquipo").val(objEquipo.CodigoEquipo);

                    //FlagActivoStr

                    
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            ListarAplicacionesRelacionadas(id);
            waitingDialog.hide();

        },
        async: false
    });
   
    $.ajax({
        url: URL_API_VISTA + "/GetCertificadoDigitalByDetalleEquipoId/" + id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            $("#hdId").val(id);
            if (result !== null) {

                var objEquipo = result;
                if (objEquipo != null) {
                    $("#txtTipoCertificado").val(objEquipo.Rows[0].TipoCertificado);
                    $("#txtDescCertificado").val(objEquipo.Rows[0].DescripcionTipoCertificado);
                    $("#txtCreacionCert").val(objEquipo.Rows[0].FechaCreacionCertificadoStr);
                    $("#txtCalculoBase").val(objEquipo.Rows[0].FechaCalculoBaseStr);
                    $("#txtFlagActivo").val(objEquipo.Rows[0].FlagActivoStr);
                    
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        async: false
    });
}


function InitControles() {
    $("#divFechaFiltro").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#divFechaFiltro").on("dp.change", function (e) {
        let id = $("#hdId").val();
        ListarTecnologiasInstaladas(id);
    });
}


