var $table = $("#tblRegistro");
var $tblTecNoInstalads = $("#tbl-tecnologiaInstaladas");
var $tblTecNoRegistradas = $("#tbl-tecnologiaNoRegistrada");
var $tblAplicacionesRelacionadas = $("#tbl-aplicacionesRelacionadas");
var $tblProcesadores = $("#tbl-Procesadores");
var $tblVulnsByEquipo = $("#tbl-vulns");
var $tblEspacioDisco = $("#tbl-EspacioDisco");
var $tblCertificadoDigital = $("#tbl-certificadodigital");
var $tblClientSecrets = $("#tbl-clientSecrets");
var $tblServidoresVirtualesHost = $("#tbl-servidoresVirtualesHost");
var $tblAppSrvRelacionadas = $("#tbl-AppSrvRelacionadas");

var URL_API_VISTA = URL_API + "/Equipo";

var DATA_VULNERABILIDADES = [], DATA_EXPORTAR_VULN = {};

var flagClienteSecret = 0;
var LstClientSecrets = [];
var srvFisico = 1;
var srvVirtual = 2;

$(function () {
    $tblTecNoInstalads.bootstrapTable({ data: [] });
    $tblTecNoRegistradas.bootstrapTable({ data: [] });
    $tblAplicacionesRelacionadas.bootstrapTable({ data: [] });
    $tblProcesadores.bootstrapTable({ data: [] });
    $tblVulnsByEquipo.bootstrapTable({ data: [] });
    $tblEspacioDisco.bootstrapTable({ data: [] });
    $tblCertificadoDigital.bootstrapTable({ data: [] });
    $tblClientSecrets.bootstrapTable({ data: [] });
    $tblServidoresVirtualesHost.bootstrapTable({ data: [] });
    $tblAppSrvRelacionadas.bootstrapTable({ data: [] });

    InitControles();
    if (IdEquipo > 0) {
        $("#hdId").val(IdEquipo);
        EditRegistro(IdEquipo);
    }
});

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
                    $("#txtEquipoFisico").val(objEquipo.EquipoFisico);
                    $("#hdEquipoId").val(objEquipo.Id);

                    $tblProcesadores.bootstrapTable('destroy');
                    $tblEspacioDisco.bootstrapTable('destroy');

                    if (objEquipo.Procesadores != null)
                        $tblProcesadores.bootstrapTable({ data: objEquipo.Procesadores });
                    else
                        $tblProcesadores.bootstrapTable({ data: [] });

                    //if (objEquipo.Storage != null) {
                    //    var dataEquipo = [];
                    //    dataEquipo.push({ "Valor": objEquipo.Storage.UsadoMB, "Descripcion": "Usado en MB" });
                    //    dataEquipo.push({ "Valor": objEquipo.Storage.LibreMB, "Descripcion": "Libre en MB" });

                    //    InitAmchartPieStorage(dataEquipo);

                    //    initCapacidadTotal(objEquipo.Storage.Particiones);
                    //}

                    if (objEquipo.Discos != null)
                        $tblEspacioDisco.bootstrapTable({ data: objEquipo.Discos });
                    else
                        $tblEspacioDisco.bootstrapTable({ data: [] });


                    if (objEquipo.TipoEquipoId == 10) {

                        ViewClientSecret(1);
                        if (objEquipo.ClientSecrets.length > 0)
                            LstClientSecrets = objEquipo.ClientSecrets;

                    } else {
                        ViewClientSecret(0);
                    }

                    $("#servidorVirtual").hide();
                    $("#servidorFisico").hide();
                    if (objEquipo.CaracteristicaEquipo != null) {
                        switch (objEquipo.CaracteristicaEquipo) {
                            case srvFisico:
                                $("#servidorFisico").show();
                                ListarServidoresVirtuales(objEquipo.Id);
                                break;
                            case srvVirtual: $("#servidorVirtual").show(); break;
                        }
                    }

                    //    $tblEspacioDisco.bootstrapTable({ data: objEquipo.Discos });
                    //else
                    //    $tblEspacioDisco.bootstrapTable({ data: [] });


                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            GetEquipoDetalleEscaneadasVsRegistradas(id);
            ListarTecnologiasInstaladas(id);
            ListarTecnologiasNoRegistradas(id);
            ListarAplicacionesRelacionadas(id);
            //ListarCertificadoDigitalRelacionadas(id);
            ListarCLientSecrets();
        },
        async: false
    });
}


function GetEquipoDetalleEscaneadasVsRegistradas(id) {
    $.ajax({
        url: URL_API_VISTA + "/GetEquipoDetalleEscaneadasVsRegistradas?equipoId=" + id + "&fecha=" + castDate($("#FechaFiltro").val()),
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            $("#hdId").val(id);
            if (result !== null) {
                InitAmchartPiev4(result);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {

        }
    });
}

function ListarTecnologiasInstaladas(id) {
    $tblTecNoInstalads.bootstrapTable('destroy');
    $tblTecNoInstalads.bootstrapTable({
        ajax: "ListarTecnologiasInstaladasAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "ClaveTecnologia",
        sortOrder: "asc",
        queryParams: function (p) {
            return JSON.stringify({
                equipoId: id,
                fecha: castDate($("#FechaFiltro").val()),
                pageNumber: p.pageNumber,
                pageSize: p.pageSize,
                sortName: p.sortName,
                sortOrder: p.sortOrder
            });
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            if (data.Proyeccion1Meses != null) $("#cabMesesProyeccion1").html(data.Proyeccion1Meses);
            if (data.Proyeccion2Meses != null) $("#cabMesesProyeccion2").html(data.Proyeccion2Meses);
            return { rows: data.Tecnologias.Rows, total: data.Tecnologias.Total };
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
function ListarTecnologiasNoRegistradas(id) {
    $tblTecNoRegistradas.bootstrapTable("destroy");
    $tblTecNoRegistradas.bootstrapTable({
        ajax: "ListarTecnologiasNoRegistradasAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "Aplicacion",
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
function ListarCertificadoDigitalRelacionadas(id) {
    $tblCertificadoDigital.bootstrapTable('destroy');
    $tblCertificadoDigital.bootstrapTable({
        ajax: "ListarCertificadoDigitalRelacionadasAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            return JSON.stringify({
                equipoId: id,
                pageNumber: p.pageNumber,
                pageSize: p.pageSize
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
function ListarCLientSecrets() {
    $tblClientSecrets.bootstrapTable('destroy');
    $tblClientSecrets.bootstrapTable({
        ajax: "ListarClientSecretsAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            return JSON.stringify({
                pageNumber: p.pageNumber,
                pageSize: p.pageSize
            });
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = new Object();
            data.Rows = res;
            data.Total = res.length;
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

function ListarTecnologiasInstaladasAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API_VISTA + `/GetTecnologiaByEquipoId?fecha=${tmp_params.fecha}&equipoId=${tmp_params.equipoId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res);
    }).fail(function () {
        params.success({ Tecnologias: { Rows: [], Total: 0 } });
    });
}
function ListarTecnologiasNoRegistradasAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/TecnologiaNoRegistrada/GetByEquipoId?equipoId=${tmp_params.equipoId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res);
    });
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

function ListarCertificadoDigitalRelacionadasAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Relacion/GetCertificadoDigitalByEquipoId?equipoId=${tmp_params.equipoId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}`;
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


function ListarClientSecretsAjax(params) {
    if (LstClientSecrets.length > 0) {
        params.success(LstClientSecrets);
    } else {
        params.success({ Rows: [], Total: 0 });
    }

}


function ListarServidoresVirtualesAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Equipo/GetEquipoServidorVirtual?equipoId=${tmp_params.equipoId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}`;
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

function ListarServidoresVirtualesDetalleAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Equipo/GetEquipoServidorVirtualDetalle?equipoId=${tmp_params.equipoId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}`;
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

function ListarServidoresVirtuales(equipoId) {
    $tblServidoresVirtualesHost.bootstrapTable('destroy');
    $tblServidoresVirtualesHost.bootstrapTable({
        ajax: "ListarServidoresVirtualesAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            return JSON.stringify({
                equipoId: equipoId,
                pageNumber: p.pageNumber,
                pageSize: p.pageSize
            });
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = new Object();
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
function linkFormatterName(value, row, index) {
    var opcion = `<a href="DetalleEquipo?id=${row.EquipoId}" title="Ver detalle" target="_blank">${value}</a>`;
    return opcion;
}

function verMasSrvVirtual(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblAppSrvRelacionadas.bootstrapTable('destroy');
    $tblAppSrvRelacionadas.bootstrapTable({
        ajax: "ListarServidoresVirtualesDetalleAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            return JSON.stringify({
                equipoId: Id,
                pageNumber: p.pageNumber,
                pageSize: p.pageSize
            });
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = new Object();
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
        },
        onLoadSuccess: function (data) {
            $("#MdAppRelacionadas").modal('show');
        }
    });
}

function InitAmchartPiev4(dataAPI) {


    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create("reportPie", am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    chart.data = dataAPI;


    chart.legend = new am4charts.Legend();

    var series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "Valor";
    //series.dataFields.radiusValue = "Total";
    series.dataFields.category = "Descripcion";
    //series.labels.template.text = "{percent}%";
    //series.slices.template.cornerRadius = 6;
    series.colors.step = 3;


}

function InitAmchartPieStorage(dataAPI) {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create("reportPieStorage", am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    chart.data = dataAPI;

    chart.legend = new am4charts.Legend();

    var series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "Valor";
    //series.dataFields.radiusValue = "Total";
    series.dataFields.category = "Descripcion";
    //series.labels.template.text = "{percent}%";
    //series.slices.template.cornerRadius = 6;
    series.colors.step = 3;
}


function ClaveTecnologiaLink(value, row) {
    if (FLAG_ADMIN == 1)
        return `<a href="/Dashboard/TecnologiaEquipo/${row.Id}"  target="_blank"  title="Ver información">${value}</a>`;
    else
        return value;
}

function ClaveTecnologiaLink2(value, row) {
    if (FLAG_ADMIN == 1)
        return `<a href="/Dashboard/TecnologiaEquipo/${row.TecnologiaId}"  target="_blank"  title="Ver información">${value}</a>`;
    else
        return value;
}

function AplicacionLink(value, row) {
    if (FLAG_ADMIN == 1)
        return `<a href="/Vista/DetalleAplicacion?Id=${value}"  target="_blank"  title="Ver información">${value}</a>`;
    else
        return value;
}


function formatterEstadoObs(value) {
    var html = '<button type="button" class="btn btn-{0} btn-circle btn-circle-sm" style="cursor: inherit"></button>';

    if (value > 0) {
        html = String.Format(html, "danger");
    } else {
        html = String.Format(html, "success");
    }
    return html;
}

function semaforoFormatter(value, row, index) {
    var html = "";
    if (row.IndicadorObsolescencia === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.IndicadorObsolescencia === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function semaforoIndice1Formatter(value, row, index) {
    var html = "";
    if (row.IndicadorObsolescencia_Proyeccion1 === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.IndicadorObsolescencia_Proyeccion1 === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function semaforoIndice2Formatter(value, row, index) {
    var html = "";
    if (row.IndicadorObsolescencia_Proyeccion2 === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.IndicadorObsolescencia_Proyeccion2 === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}



function initCapacidadTotal(data) {
    am4core.ready(function () {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("reportParticiones", am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.data = data;

        chart.colors.step = 2;
        chart.padding(30, 30, 10, 30);
        chart.legend = new am4charts.Legend();

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "Disco";
        categoryAxis.renderer.grid.template.location = 0;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.minWidth = 50;


        var series1 = chart.series.push(new am4charts.ColumnSeries());
        series1.columns.template.width = am4core.percent(80);
        series1.columns.template.tooltipText =
            "{name}: {valueY.formatNumber('#.00')} TB";
        series1.name = "Usado";
        series1.dataFields.categoryX = "Disco";
        series1.dataFields.valueY = "UsadoMB";
        series1.dataFields.valueYShow = "totalPercent";
        series1.dataItems.template.locations.categoryX = 0.5;
        series1.stacked = true;
        series1.tooltip.pointerOrientation = "vertical";

        var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
        bullet1.interactionsEnabled = false;
        bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet1.label.fill = am4core.color("#ffffff");
        bullet1.locationY = 0.5;

        var series2 = chart.series.push(new am4charts.ColumnSeries());
        series2.columns.template.width = am4core.percent(80);
        series2.columns.template.tooltipText =
            "{name}: {valueY.formatNumber('#.00')} TB";
        series2.name = "Libre";
        series2.dataFields.categoryX = "Disco";
        series2.dataFields.valueY = "LibreMB";
        series2.dataFields.valueYShow = "totalPercent";
        series2.dataItems.template.locations.categoryX = 0.5;
        series2.stacked = true;
        series2.tooltip.pointerOrientation = "vertical";

        var bullet2 = series2.bullets.push(new am4charts.LabelBullet());
        bullet2.interactionsEnabled = false;
        bullet2.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet2.locationY = 0.5;
        bullet2.label.fill = am4core.color("#ffffff");


        //chart.scrollbarX = new am4core.Scrollbar();

    }); // end am4core.ready()
}

function verVulnerabilidades() {
    event.preventDefault();


    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblVulnsByEquipo.bootstrapTable('destroy');
    $tblVulnsByEquipo.bootstrapTable({
        url: URL_API + "/TecnologiaNoRegistrada/ListadoTecnologiasNoRegistradasQualysXEquipo",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        sortName: 'QualysId',
        sortOrder: 'desc',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR_VULN = {};
            DATA_EXPORTAR_VULN.equipoId = IdEquipo;
            DATA_EXPORTAR_VULN.pageNumber = p.pageNumber;
            DATA_EXPORTAR_VULN.pageSize = p.pageSize;
            DATA_EXPORTAR_VULN.sortName = p.sortName;
            DATA_EXPORTAR_VULN.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_VULN);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            DATA_VULNERABILIDADES = (data.Rows || []).map(x => x);
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
        },
        onLoadSuccess: function (data) {
            if (!$('#MdVulnsByEquipo').is(':visible')) $("#MdVulnsByEquipo").modal(opcionesModal);
            //if (ID_TECNOLOGIA !== 0) {
            //    let editFromId = EDIT_TEC_FROM.NOMBRE;
            //    editarTecSTD(ID_TECNOLOGIA, ID_ESTADO_TECNOLOGIA, editFromId);
            //    ID_TECNOLOGIA = 0;
            //}
        }
    });

}

function ExportarRegistrosVulnerabilidades() {
    let _data = $tblVulnsByEquipo.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar('No hay datos para exportar');
        return false;
    }
    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.so}&equivalencia=${DATA_EXPORTAR.nombre}&tipoEquipoId=${DATA_EXPORTAR.id}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
    let url = String.Format("{0}/TecnologiaNoRegistrada/ExportarTecnologiasNoRegistradasQualysXEquipo?equipoId={1}&sortName={2}&sortOrder={3}",
        URL_API,
        DATA_EXPORTAR_VULN.equipoId,
        DATA_EXPORTAR_VULN.sortName,
        DATA_EXPORTAR_VULN.sortOrder
    );
    //url = encodeURIComponent(url);
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

function verMasFormatter(data, row) {
    let text = (data || '');
    let item = { text: data };
    let itemStr = JSON.stringify(item);

    if (text.length >= 50) {
        text = text.substr(0, 50);
        text += `...<a href='javascript:verMas(${row.Id}, "${this.field}", "${this.title}")'>Ver más</a>`;
    }
    return text;

}

function verMas(id, field, title) {
    let item = DATA_VULNERABILIDADES.find(x => x.Id == id);
    $("#MdVerMas").modal('show');
    $("#titleFormVerMas").html(`${title} de ${item.NetBIOS}`);
    $("#MdVerMas .modal-body").html(item[field]);
}


function verMasSrvVirtualFormatter(data, row) {
    let text = (data || '');
    if (row.CantidadRelaciones > 0) {
        text = `<a href='javascript:verMasSrvVirtual(${row.EquipoId})'>Ver más</a>`;
    } else {
        text = `No tiene apps relacionadas`;
    }
    return text;
}
 
function verAplicacionsFormatter(value, row) { 
    return `<a href="/Vista/Aplicaciones?codApp=${row.CodigoApt}"  target="_blank"  title="Ver información">${value}</a>`;
}


function ExportarServidoresVirtualesHost() {
    let _data = $tblServidoresVirtualesHost.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar('No hay datos para exportar');
        return false;
    }

    let url = String.Format("{0}/Equipo/PostExportarEquipoServidorVirtual?equipoId={1}",
        URL_API,
        $("#hdEquipoId").val(),
    );
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


function ViewClientSecret(value) {
    if (value == 1) {
        $(".onClientS").hide();
        $(".offClientS").show();
    }
    else {
        $(".onClientS").show();
        $(".offClientS").hide();
    }

}