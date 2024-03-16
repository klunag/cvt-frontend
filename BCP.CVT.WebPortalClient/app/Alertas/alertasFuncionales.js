var $tableAlerta1 = $("#tbl-alertas1");
var $tableAlerta2 = $("#tbl-alertas2");
var $tableAlerta3 = $("#tbl-alertas3");
var $tableAlerta4 = $("#tbl-alertas4");
var $tableAlerta5 = $("#tbl-alertas5");
var $tableAlerta6 = $("#tbl-alertas6");
var $tableAlerta7 = $("#tbl-alertas7");
var $tableAlerta8 = $("#tbl-alertas8");
var $tableAlerta9 = $("#tbl-alertas9");

var URL_API_VISTA = URL_API + "/Alerta";
var PARAMS_API = {};

var $tableEquipoTecnologia = $("#tbl-equipoTecnologia");
var $tableExcepcionRiesgo = $("#tbl-excepcion-riesgoExportarTecnicas")
var $tableExcepcionTipo = $("#tbl-excepcion-tipo");
var $tableRelacionDetalle = $("#tbl-relacionDetalle");
var $tableTecnologiaVinculada = $("#tbl-tecnologiaVinculada");

$(function () {
    $(document).on('click', '.panel-heading span.clickable', function (e) {
        var $this = $(this);
        if (!$this.hasClass('panel-collapsed')) {
            $this.parents('.panel').find('.panel-body').slideUp();
            $this.addClass('panel-collapsed');
            $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        } else {
            $this.parents('.panel').find('.panel-body').slideDown();
            $this.removeClass('panel-collapsed');
            $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');

            var tblName = $this.parents('.panel').find('.panel-body').find("table.dataTable").prop("id");
            var _data = [];
            switch (tblName) {
                case "tbl-alertas1":
                    _data = $tableAlerta1.bootstrapTable("getData") || [];
                    if (_data.length === 0) {
                        ListarAlertasFuncionalesTipo1();
                    }
                    break;
                case "tbl-alertas2":
                    _data = $tableAlerta2.bootstrapTable("getData") || [];
                    if (_data.length === 0) {
                        ListarAlertasFuncionalesTipo2();
                    }
                    break;
                case "tbl-alertas3":
                    _data = $tableAlerta3.bootstrapTable("getData") || [];
                    if (_data.length === 0) {
                        ListarAlertasFuncionalesTipo3();
                    }
                    break;
                case "tbl-alertas4":
                    _data = $tableAlerta4.bootstrapTable("getData") || [];
                    if (_data.length === 0) {
                        ListarAlertasFuncionalesTipo4();
                    }
                    break;
                case "tbl-alertas5":
                    _data = $tableAlerta5.bootstrapTable("getData") || [];
                    if (_data.length === 0) {
                        ListarAlertasFuncionalesTipo5($tableAlerta5, TIPO_EQUIPO_ALERTA5);
                    }
                    break;
                case "tbl-alertas6":
                    _data = $tableAlerta6.bootstrapTable("getData") || [];
                    if (_data.length === 0) {
                        ListarAlertasFuncionalesTipo6();
                    }
                    break;
                case "tbl-alertas7":
                    _data = $tableAlerta7.bootstrapTable("getData") || [];
                    if (_data.length === 0) {
                        ListarAlertasFuncionalesTipo5($tableAlerta7, TIPO_EQUIPO_ALERTA7);
                    }
                    break;
                case "tbl-alertas8":
                    _data = $tableAlerta8.bootstrapTable("getData") || [];
                    if (_data.length === 0) {
                        ListarAlertasFuncionalesTipo8();
                    }
                    break;
                case "tbl-alertas9":
                    _data = $tableAlerta9.bootstrapTable("getData") || [];
                    if (_data.length === 0) {
                        ListarAlertasFuncionalesTipo9();
                    }
                    break;
                default:
            }

        }
    });

    $('.panel-heading span.clickable').click();
    InitControles();
    ListarAlertasFuncionales();

    $("#btnBuscadorAlerta3").click(ListarAlertasFuncionalesTipo3);
    $("#btnBuscadorAlerta4").click(ListarAlertasFuncionalesTipo4);

    $("#btnExportarAlertasTipo1").click(ExportarAlertasFuncionalesTipo1);
    $("#btnExportarAlertasTipo2").click(ExportarAlertasFuncionalesTipo2);
    $("#btnExportarAlertasTipo3").click(ExportarAlertasFuncionalesTipo3);
    $("#btnExportarAlertasTipo4").click(ExportarAlertasFuncionalesTipo4);
    $("#btnExportarAlertasTipo5").click(ExportarAlertasFuncionalesTipo5);
    $("#btnExportarAlertasTipo6").click(ExportarAlertasFuncionalesTipo6);
    $("#btnExportarAlertasTipo7").click(ExportarAlertasFuncionalesTipo7);
    $("#btnExportarAlertasTipo8").click(ExportarAlertasFuncionalesTipo8);
    $("#btnExportarAlertasTipo9").click(ExportarAlertasFuncionalesTipo9);

    ValidarCampos();
    CargarCombos();
    FormatoCheckBox($("#divActivo"), "cbActivo");
});

function InitControles() {
    $tableAlerta1.bootstrapTable({ "data": [], "sortName": "Nombre" });
    $tableAlerta2.bootstrapTable({ "data": [], "sortName": "Nombre" });
    $tableAlerta3.bootstrapTable({ "data": [], "sortName": "Nombre" });
    $tableAlerta4.bootstrapTable({ "data": [], "sortName": "Nombre" });
    $tableAlerta5.bootstrapTable({ "data": [], "sortName": "Nombre" });
    $tableAlerta6.bootstrapTable({ "data": [], "sortName": "Nombre" });
    $tableAlerta7.bootstrapTable({ "data": [], "sortName": "Nombre" });
    $tableAlerta8.bootstrapTable({ "data": [], "sortName": "Nombre" });
    $tableAlerta9.bootstrapTable({ "data": [], "sortName": "Nombre" });

    $("#dpFecConsultaAlerta3-btn").datetimepicker({
        locale: 'es',
        useCurrent: true,
        format: 'DD/MM/YYYY'
    });
    $("#dpFecConsultaAlerta3").val(moment(new Date()).format("DD/MM/YYYY"));

    $("#dpFecConsultaAlerta4-btn").datetimepicker({
        locale: 'es',
        useCurrent: true,
        format: 'DD/MM/YYYY'
    });
    $("#dpFecConsultaAlerta4").val(moment(new Date()).format("DD/MM/YYYY"));
}

function ListarAlertasFuncionales() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Funcionales",
        type: "POST",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            //let formatEditar = '<a href="javascript: IrEditarRegistro({0}); " title="Editar configuración alerta">{1}</a>';
            let formatEditar = '<a href="javascript: IrEditarRegistrov2({0}); " title="">{1}</a>';

            $("#panelAlerta1 .panel-title")
                .html(String.Format(formatEditar, result.AlertaFuncional1.Id, result.AlertaFuncional1.Nombre))
                .append(String.Format('<span class="badge badge-primary">&nbsp;{0}&nbsp;</span>', result.AlertaFuncional1.NroAlertasDetalle));

            $("#panelAlerta2 .panel-title")
                .html(String.Format(formatEditar, result.AlertaFuncional2.Id, result.AlertaFuncional2.Nombre))
                .append(String.Format('<span class="badge badge-primary">&nbsp;{0}&nbsp;</span>', result.AlertaFuncional2.NroAlertasDetalle));

            $("#panelAlerta3 .panel-title")
                .html(String.Format(formatEditar, result.AlertaFuncional3.Id, result.AlertaFuncional3.Nombre))
                .append(String.Format('<span id="badgeAlerta3" class="badge badge-primary">&nbsp;{0}&nbsp;</span>', result.AlertaFuncional3.NroAlertasDetalle));

            $("#panelAlerta4 .panel-title")
                .html(String.Format(formatEditar, result.AlertaFuncional4.Id, result.AlertaFuncional4.Nombre))
                .append(String.Format('<span id="badgeAlerta4" class="badge badge-primary">&nbsp;{0}&nbsp;</span>', result.AlertaFuncional4.NroAlertasDetalle));

            $("#panelAlerta5 .panel-title")
                .html(String.Format(formatEditar, result.AlertaFuncional5.Id, result.AlertaFuncional5.Nombre))
                .append(String.Format('<span class="badge badge-primary">&nbsp;{0}&nbsp;</span>', result.AlertaFuncional5.NroAlertasDetalle));

            $("#panelAlerta6 .panel-title")
                .html(String.Format(formatEditar, result.AlertaFuncional6.Id, result.AlertaFuncional6.Nombre))
                .append(String.Format('<span class="badge badge-primary">&nbsp;{0}&nbsp;</span>', result.AlertaFuncional6.NroAlertasDetalle));

            $("#panelAlerta7 .panel-title")
                .html(String.Format(formatEditar, result.AlertaFuncional7.Id, result.AlertaFuncional7.Nombre))
                .append(String.Format('<span class="badge badge-primary">&nbsp;{0}&nbsp;</span>', result.AlertaFuncional7.NroAlertasDetalle));

            $("#panelAlerta8 .panel-title")
                .html(String.Format(formatEditar, result.AlertaFuncional8.Id, result.AlertaFuncional8.Nombre))
                .append(String.Format('<span class="badge badge-primary">&nbsp;{0}&nbsp;</span>', result.AlertaFuncional8.NroAlertasDetalle));

            $("#panelAlerta9 .panel-title")
                .html(String.Format(formatEditar, result.AlertaFuncional9.Id, result.AlertaFuncional9.Nombre))
                .append(String.Format('<span class="badge badge-primary">&nbsp;{0}&nbsp;</span>', result.AlertaFuncional9.NroAlertasDetalle));
        },
        complete: function (data) {
            $("#divAlertas").show();
            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });

}

//LISTAR ALERTAS TIPO 1
function ListarAlertasFuncionalesTipo1() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableAlerta1.bootstrapTable('destroy');
    $tableAlerta1.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Funcionales/Alerta1",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
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

function ExportarAlertasFuncionalesTipo1() {

    var sortOrder = $tableAlerta1.bootstrapTable('getOptions').sortOrder;
    var sortName = $tableAlerta1.bootstrapTable('getOptions').sortName;

    let url = `${URL_API_VISTA}/ExportarAlertasFuncionalesTipo1?sortName=${sortName}&sortOrder=${sortOrder}`;
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

//LISTAR ALERTAS TIPO 2
function ListarAlertasFuncionalesTipo2() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableAlerta2.bootstrapTable('destroy');
    $tableAlerta2.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Funcionales/Alerta2",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'NroInstancias',
        sortOrder: 'desc',
        queryParams: function (p) {
            PARAMS_API = {};
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

function ExportarAlertasFuncionalesTipo2() {
    
    var sortOrder = $tableAlerta2.bootstrapTable('getOptions').sortOrder;
    var sortName = $tableAlerta2.bootstrapTable('getOptions').sortName;

    let url = `${URL_API_VISTA}/ExportarAlertasFuncionalesTipo2?sortName=${sortName}&sortOrder=${sortOrder}`;
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

//LISTAR ALERTAS TIPO 3
function ListarAlertasFuncionalesTipo3() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableAlerta3.bootstrapTable('destroy');
    $tableAlerta3.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Funcionales/Alerta3",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.fechaConsulta = $("#dpFecConsultaAlerta3").val() == null || $("#dpFecConsultaAlerta3").val() == "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#dpFecConsultaAlerta3").val())).format("YYYY-MM-DD");;
            PARAMS_API.pageNumber = p.pageNumber;
            PARAMS_API.pageSize = p.pageSize;
            PARAMS_API.sortName = p.sortName;
            PARAMS_API.sortOrder = p.sortOrder;

            return JSON.stringify(PARAMS_API);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;

            $("#badgeAlerta3").empty().html(String.Format("&nbsp;{0}&nbsp;", data.Total));

            var $this = $("#panelAlerta3 .panel-heading span.clickable");
            if ($this.hasClass('panel-collapsed')) {
                $this.parents('.panel').find('.panel-body').slideDown();
                $this.removeClass('panel-collapsed');
                $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            }
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

function ExportarAlertasFuncionalesTipo3() {

    var sortOrder = $tableAlerta3.bootstrapTable('getOptions').sortOrder;
    var sortName = $tableAlerta3.bootstrapTable('getOptions').sortName;
    var fechaConsulta = $("#dpFecConsultaAlerta3").val() == null || $("#dpFecConsultaAlerta3").val() == "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#dpFecConsultaAlerta3").val())).format("YYYY-MM-DD");

    let url = `${URL_API_VISTA}/ExportarAlertasFuncionalesTipo3?fechaConsulta=${fechaConsulta}&sortName=${sortName}&sortOrder=${sortOrder}`;
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

//LISTAR ALERTAS TIPO 4
function ListarAlertasFuncionalesTipo4() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableAlerta4.bootstrapTable('destroy');
    $tableAlerta4.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Funcionales/Alerta4",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.fechaConsulta = $("#dpFecConsultaAlerta3").val() === null || $("#dpFecConsultaAlerta3").val() == "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#dpFecConsultaAlerta3").val())).format("YYYY-MM-DD");
            PARAMS_API.pageNumber = p.pageNumber;
            PARAMS_API.pageSize = p.pageSize;
            PARAMS_API.sortName = p.sortName;
            PARAMS_API.sortOrder = p.sortOrder;

            return JSON.stringify(PARAMS_API);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            $("#badgeAlerta4").empty().html(String.Format("&nbsp;{0}&nbsp;", data.Total));

            var $this = $("#panelAlerta4 .panel-heading span.clickable");
            if ($this.hasClass('panel-collapsed')) {
                $this.parents('.panel').find('.panel-body').slideDown();
                $this.removeClass('panel-collapsed');
                $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            }
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

function ExportarAlertasFuncionalesTipo4() {

    var sortOrder = $tableAlerta4.bootstrapTable('getOptions').sortOrder;
    var sortName = $tableAlerta4.bootstrapTable('getOptions').sortName;
    var fechaConsulta = $("#dpFecConsultaAlerta4").val() == null || $("#dpFecConsultaAlerta4").val() == "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#dpFecConsultaAlerta4").val())).format("YYYY-MM-DD");

    let url = `${URL_API_VISTA}/ExportarAlertasFuncionalesTipo4?fechaConsulta=${fechaConsulta}&sortName=${sortName}&sortOrder=${sortOrder}`;
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


//LISTAR ALERTAS TIPO 5
//function ListarAlertasFuncionalesTipo5() {
//    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
//    $tableAlerta5.bootstrapTable('destroy');
//    $tableAlerta5.bootstrapTable({
//        locale: 'es-SP',
//        url: URL_API_VISTA + "/Funcionales/Alerta5",
//        method: 'POST',
//        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
//        pagination: true,
//        sidePagination: 'server',
//        queryParamsType: 'else',
//        pageSize: REGISTRO_PAGINACION,
//        pageList: OPCIONES_PAGINACION,
//        sortName: 'Nombre',
//        sortOrder: 'asc',
//        queryParams: function (p) {
//            PARAMS_API = {};
//            PARAMS_API.pageNumber = p.pageNumber;
//            PARAMS_API.pageSize = p.pageSize;
//            PARAMS_API.sortName = p.sortName;
//            PARAMS_API.sortOrder = p.sortOrder;

//            return JSON.stringify(PARAMS_API);
//        },
//        responseHandler: function (res) {
//            waitingDialog.hide();
//            var data = res;
//            return { rows: data.Rows, total: data.Total };
//        },
//        onLoadError: function (status, res) {
//            waitingDialog.hide();
//            bootbox.alert("Se produjo un error al listar los registros");
//        },
//        onSort: function (name, order) {
//            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
//        },
//        onPageChange: function (number, size) {
//            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
//        }
//    });
//}

function ListarAlertasFuncionalesTipo5($tbl, _arrTipoEquipo) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tbl.bootstrapTable('destroy');
    $tbl.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Funcionales/Alerta5",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.arrTipoEquipo = _arrTipoEquipo;
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

function ExportarAlertasFuncionalesTipo5() {

    var sortOrder = $tableAlerta5.bootstrapTable('getOptions').sortOrder;
    var sortName = $tableAlerta5.bootstrapTable('getOptions').sortName;

    let url = `${URL_API_VISTA}/ExportarAlertasFuncionalesTipo5?sortName=${sortName}&sortOrder=${sortOrder}`;
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

//LISTAR ALERTAS TIPO 6
function ListarAlertasFuncionalesTipo6() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableAlerta6.bootstrapTable('destroy');
    $tableAlerta6.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Funcionales/Alerta6",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
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

function ExportarAlertasFuncionalesTipo6() {
 
    var sortOrder = $tableAlerta6.bootstrapTable('getOptions').sortOrder;
    var sortName = $tableAlerta6.bootstrapTable('getOptions').sortName;

    let url = `${URL_API_VISTA}/ExportarAlertasFuncionalesTipo6?sortName=${sortName}&sortOrder=${sortOrder}`;
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

function ExportarAlertasFuncionalesTipo7() {
    let sortOrder = $tableAlerta7.bootstrapTable('getOptions').sortOrder;
    let sortName = $tableAlerta7.bootstrapTable('getOptions').sortName;

    let url = `${URL_API_VISTA}/ExportarAlertasFuncionalesTipo7?sortName=${sortName}&sortOrder=${sortOrder}`;
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

//LISTAR ALERTAS TIPO 8
function ListarAlertasFuncionalesTipo8() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableAlerta8.bootstrapTable('destroy');
    $tableAlerta8.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Funcionales/Alerta8",
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
            PARAMS_API = {};
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

function ExportarAlertasFuncionalesTipo8() {
    var sortOrder = $tableAlerta8.bootstrapTable('getOptions').sortOrder;
    /*var sortName = $tableAlerta8.bootstrapTable('getOptions').sortName*/;
    var sortName = "Id";

    let url = `${URL_API_VISTA}/ExportarAlertasFuncionalesTipo8?sortName=${sortName}&sortOrder=${sortOrder}`;
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

//LISTAR ALERTAS TIPO 9
function ListarAlertasFuncionalesTipo9() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableAlerta9.bootstrapTable('destroy');
    $tableAlerta9.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Funcionales/Alerta9",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Aplicacion',
        sortOrder: 'asc',
        queryParams: function (p) {
            PARAMS_API = {};
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

function ExportarAlertasFuncionalesTipo9() {
    var sortOrder = $tableAlerta9.bootstrapTable('getOptions').sortOrder;
    var sortName = $tableAlerta9.bootstrapTable('getOptions').sortName;

    let url = `${URL_API_VISTA}/ExportarAlertasFuncionalesTipo9?sortName=${sortName}&sortOrder=${sortOrder}`;
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

// ALERTA PROGRAMACIÓN
function IrEditarRegistrov2(id) {
    console.log(id);
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

    $tableEquipoTecnologia.bootstrapTable("destroy");
    $tableEquipoTecnologia.bootstrapTable({ data: [] });
    $tableExcepcionRiesgo.bootstrapTable("destroy");
    $tableExcepcionRiesgo.bootstrapTable({ data: [] });
    $tableExcepcionTipo.bootstrapTable("destroy");
    $tableExcepcionTipo.bootstrapTable({ data: [] });
    $tableTecnologiaVinculada.bootstrapTable("destroy");
    $tableTecnologiaVinculada.bootstrapTable({ data: [] });
    $tableRelacionDetalle.bootstrapTable("destroy");
    $tableRelacionDetalle.bootstrapTable({ data: [] });
}
function CargarCombos() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/Tecnicas/CargarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
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
                    toastr.success("Alerta técnica registrado exitosamente.", "Alerta Funcional");
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
function linkFormatterInstancias(value, row) {
    return `<a href="javascript:viewInstancias(${row.Id})" title="Visualizar instancias encontrados">${value}</a>`;
}
function viewInstancias(id) {
    $("#hdIdTecnologiaInstancia").val(id);
    ListarEquipoTecnologiaXTecnologiaId();
    ListarExcepcionRiesgoXTecnologiaId();
    ListarExcepcionEstandarXTecnologiaId();
    ListarRelacionDetalleXTecnologiaId();
    ListarTecnologiaVinculadaXTecnologiaId();
    $(".view-principal").hide();
    $(".view-detalle").show();
}

function ListarEquipoTecnologiaXTecnologiaId() {
    $tableEquipoTecnologia.bootstrapTable('destroy');
    $tableEquipoTecnologia.bootstrapTable({
        ajax: "ListarEquipoTecnologiaXTecnologiaIdAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "Nombre",
        sortOrder: "asc",
        queryParams: function (p) {
            return JSON.stringify({
                tecnologiaId: $("#hdIdTecnologiaInstancia").val(),
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
function ListarExcepcionRiesgoXTecnologiaId() {
    $tableExcepcionRiesgo.bootstrapTable('destroy');
    $tableExcepcionRiesgo.bootstrapTable({
        ajax: "ListarExcepcionRiesgoXTecnologiaIdAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "CodigoAPT",
        sortOrder: "asc",
        queryParams: function (p) {
            return JSON.stringify({
                tecnologiaId: $("#hdIdTecnologiaInstancia").val(),
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
function ListarExcepcionEstandarXTecnologiaId() {
    $tableExcepcionTipo.bootstrapTable('destroy');
    $tableExcepcionTipo.bootstrapTable({
        ajax: "ListarExcepcionEstandarXTecnologiaIdAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "CodigoAPT",
        sortOrder: "asc",
        queryParams: function (p) {
            return JSON.stringify({
                tecnologiaId: $("#hdIdTecnologiaInstancia").val(),
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
function ListarRelacionDetalleXTecnologiaId() {
    $tableRelacionDetalle.bootstrapTable('destroy');
    $tableRelacionDetalle.bootstrapTable({
        ajax: "ListarRelacionDetalleXTecnologiaIdAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "AplicacionStr",
        sortOrder: "asc",
        queryParams: function (p) {
            return JSON.stringify({
                tecnologiaId: $("#hdIdTecnologiaInstancia").val(),
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
function ListarTecnologiaVinculadaXTecnologiaId() {
    $tableTecnologiaVinculada.bootstrapTable('destroy');
    $tableTecnologiaVinculada.bootstrapTable({
        ajax: "ListarTecnologiaVinculadaXTecnologiaIdAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "ClaveTecnologia",
        sortOrder: "asc",
        queryParams: function (p) {
            return JSON.stringify({
                tecnologiaId: $("#hdIdTecnologiaInstancia").val(),
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

function ListarEquipoTecnologiaXTecnologiaIdAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Equipo/EquipoXTecnologiaId?tecnologiaId=${tmp_params.tecnologiaId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res)
    }).fail(function () {
        params.success({ Rows: [], Total: 0 })
    });
}
function ListarExcepcionRiesgoXTecnologiaIdAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Excepcion/ExcepcionRiesgoXTecnologiaId?tecnologiaId=${tmp_params.tecnologiaId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res)
    }).fail(function () {
        params.success({ Rows: [], Total: 0 })
    });
}
function ListarExcepcionEstandarXTecnologiaIdAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Excepcion/ExcepcionEstandarXTecnologiaId?tecnologiaId=${tmp_params.tecnologiaId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res)
    }).fail(function () {
        params.success({ Rows: [], Total: 0 })
    });
}
function ListarRelacionDetalleXTecnologiaIdAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Relacion/RelacionXTecnologiaId/?tecnologiaId=${tmp_params.tecnologiaId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res)
    }).fail(function () {
        params.success({ Rows: [], Total: 0 })
    });
}
function ListarTecnologiaVinculadaXTecnologiaIdAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Tecnologia/TecnologiaVinculadaXTecnologiaId?tecnologiaId=${tmp_params.tecnologiaId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res)
    }).fail(function () {
        params.success({ Rows: [], Total: 0 })
    });
}

function CerrarVistaDetalle() {
    $(".view-detalle").hide();
    $(".view-principal").show();
}