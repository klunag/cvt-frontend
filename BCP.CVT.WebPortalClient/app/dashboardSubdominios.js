var URL_API_VISTA = URL_API + "/Dashboard/Tecnologia";
var URL_API_VISTA2 = URL_API + "/Dashboard";
var DATA_SUBDOMINIO = [];
var DATA_TIPOEQUIPO = [];
var $table = $("#tblRegistro");
var $tableDetalle = $("#tblRegistroDetalle");
var TITULO_MENSAJE = "Obsolescencia por subdominios";

$(function () {
    if (FLAG_ADMIN == 1) {
        SetItemsMultiple([], $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFilTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);

    } else {
        SetItemsMultiple([], $("#cbFilDominio"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
        SetItemsMultiple([], $("#cbFilTipoEquipo"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
    }

    $table.bootstrapTable();
    $tableDetalle.bootstrapTable();

    CargarCombos();
    MethodValidarFecha(RANGO_DIAS_HABILES);
    initFecha();
    validarCampos();

    $("#cbFilDominio").change(CargarCombosDominio);
    $("#cbFilSubdominio").change(LimpiarFormFiltros);
});

function LimpiarFormFiltros() {
    LimpiarValidateErrores($("#formFiltros"));
}

function CargarCombosDominio() {
    let idsDominio = $.isArray($(this).val()) ? $(this).val() : [$(this).val()];

    if (idsDominio !== null) {
        $.ajax({
            url: URL_API_VISTA + "/ListarCombos/Dominio",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(idsDominio),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        if (FLAG_ADMIN == 1) {
                            SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
                        } else {
                            $("#cbFilSubdominio").prop("multiple", "");
                            SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_SELECCIONE, "", true, false);
                            $("#cbFilSubdominio").val('').multiselect("refresh");
                        }

                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function () {

            },
            async: true
        });
    }

    LimpiarValidateErrores($("#formFiltros"));
    //$("#formFiltros").valid();
}

function initFecha() {
    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    _BuildDatepicker($("#FechaFiltro"));
}

function validarCampos() {
    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbFilDominio: {
                requiredSelect: true
            },
            cbFilSubdominio: {
                requiredSelect: true
            },
            cbFilTipoEquipo: {
                requiredSelect: true
            },
            cbFilDominioRed: {
                requiredSelect: true
            },
            cbFilTipo: {
                requiredSelect: true
            },
            FechaFiltro: {
                required: true,
                //isDate: true,
                //FechaPrevia: true,
                FechaMaxima: true
            }
        },
        messages: {
            cbFilDominio: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "dominio")
            },
            cbFilSubdominio: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "subdominio")
            },
            cbFilTipoEquipo: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "tipo")
            },
            cbFilDominioRed: {
                requiredSelect: String.Format("Debes seleccionar la {0}.", "subsidiaria")
            },
            cbFilTipo: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "estado de estandarización")
            },
            FechaFiltro: {
                required: "Debe seleccionar una fecha",
                //isDate: "Debe ingresar una fecha valida",
                //FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbFilSubdominio" || element.attr('name') === "cbFilDominio" || element.attr('name') === "cbFilTipoEquipo" || element.attr('name') === "cbFilDominioRed" || element.attr('name') === "cbFilTipo" || element.attr('name') === "FechaFiltro") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function ActualizarGraficos() {
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        $(".div-report").show();
        CargarReporte_0();
        CargarReporte();
        listarRegistros();
        listarRegistrosDetalle();
    }
}

function CargarCombos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    if (FLAG_ADMIN == 1) {
                        SetItemsMultiple(dataObject.Dominio, $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
                    } else {
                        $("#cbFilDominio").prop("multiple", "");
                        SetItemsMultiple(dataObject.Dominio, $("#cbFilDominio"), TEXTO_SELECCIONE, "", true, false);
                        $("#cbFilDominio").val('').multiselect("refresh");
                    }
                    //SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
                    //SetItemsMultiple(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.DominioRed, $("#cbFilDominioRed"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItems(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.TipoTecnologia, $("#cbFilTipo"), TEXTO_TODOS, TEXTO_TODOS, true);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            waitingDialog.hide();
        }
        //async: false
    });
}

function ExportarData() {
    //$("#formFiltros").validate().resetForm();
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        var subdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val().join() : $("#cbFilSubdominio").val();
        var tipoEquipoIds = $("#cbFilTipoEquipo").val() == null ? "" : $.isArray($("#cbFilTipoEquipo").val()) ? $("#cbFilTipoEquipo").val().join() : $("#cbFilTipoEquipo").val(); //$("#cbFilTipoEquipo").val();
        var fecha = $("#FechaFiltro").val();
        var subsidiaria = $("#cbFilDominioRed").val().join();
        var tipoTecnologia = $("#cbFilTipo").val().join();

        let url = `${URL_API_VISTA2}/Reportes/GraficoSubdominios/Exportar?fecha=${fecha}&tipoEquipoFiltrar=${tipoEquipoIds}&subdominioFiltrar=${subdominioFiltrar}&subsidiaria=${subsidiaria}&tipotecnologia=${tipoTecnologia}`;
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
}

function CargarReporte_0() {
    //$("#formFiltros").validate().resetForm();

    //if ($("#formFiltros").valid()) {
    let data = {
        SubdominioFiltrar: $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()],
        TipoEquipoFiltrar: $.isArray($("#cbFilTipoEquipo").val()) ? $("#cbFilTipoEquipo").val() : [$("#cbFilTipoEquipo").val()], //$("#cbFilTipoEquipo").val(),
        Fecha: $("#FechaFiltro").val(),
        FechaFiltro: castDate($("#FechaFiltro").val()),
        SubsidiariaFiltrar: $("#cbFilDominioRed").val(),
        TipoTecnologiaFiltrar: $("#cbFilTipo").val()
    };

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA2 + "/Reportes/GraficoSubdominios/VigentesObsoletos",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject) {
            if (dataObject !== null) {
                let Pie = [];
                $.each(dataObject, function (i, item) {
                    Pie.push({ Id: item.TipoDescripcion, Value: item.Valor, TipoDescripcion: item.TipoDescripcion, Color: item.Color });
                });
                InitAmchartPiev4_0(Pie);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            waitingDialog.hide();
        }
    });
    // }
}

function CargarReporte() {
    //$("#formFiltros").validate().resetForm();    

    //if ($("#formFiltros").valid())
    //{        
    let data = {
        SubdominioFiltrar: $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()],
        TipoEquipoFiltrar: $.isArray($("#cbFilTipoEquipo").val()) ? $("#cbFilTipoEquipo").val() : [$("#cbFilTipoEquipo").val()], // $("#cbFilTipoEquipo").val(),
        Fecha: $("#FechaFiltro").val(),
        FechaFiltro: castDate($("#FechaFiltro").val()),
        SubsidiariaFiltrar: $("#cbFilDominioRed").val(),
        TipoTecnologiaFiltrar: $("#cbFilTipo").val()
    };

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA2 + "/Reportes/GraficoSubdominios",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject) {
            if (dataObject !== null) {
                let Pie = [];
                $.each(dataObject, function (i, item) {
                    Pie.push({ Id: item.TipoDescripcion, Value: item.Valor, TipoDescripcion: item.TipoDescripcion, Color: item.Color });
                });
                InitAmchartPiev4(Pie);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            waitingDialog.hide();
        }
    });
    //  }
}

function InitAmchartPiev4(dataAPI) {
    am4core.useTheme(am4themes_animated);

    var chart = am4core.create("reportPie", am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    chart.data = dataAPI;

    chart.innerRadius = am4core.percent(40);
    chart.depth = 40;

    chart.legend = new am4charts.Legend();

    var series = chart.series.push(new am4charts.PieSeries3D());
    series.dataFields.value = "Value";
    series.dataFields.depthValue = "Value";
    series.dataFields.category = "Id";
    series.slices.template.cornerRadius = 5;
    series.colors.step = 3;

    var colorSet = new am4core.ColorSet();
    colorSet.list = $.map(dataAPI, function (n, i) {
        return new am4core.color(n.Color);
    });
    series.colors = colorSet;
}

function InitAmchartPiev4_0(dataAPI) {
    am4core.useTheme(am4themes_animated);

    var chart = am4core.create("reportPie_0", am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    chart.data = dataAPI;

    chart.innerRadius = am4core.percent(40);
    chart.depth = 40;

    chart.legend = new am4charts.Legend();

    var series = chart.series.push(new am4charts.PieSeries3D());
    series.dataFields.value = "Value";
    series.dataFields.depthValue = "Value";
    series.dataFields.category = "Id";
    series.slices.template.cornerRadius = 5;
    series.colors.step = 3;

    var colorSet = new am4core.ColorSet();
    colorSet.list = $.map(dataAPI, function (n, i) {
        return new am4core.color(n.Color);
    });
    series.colors = colorSet;
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA2 + "/Reportes/GraficoSubdominios/Detalle",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        fixedColumns: true,
        fixedNumber: 4,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SubdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()];
            DATA_EXPORTAR.TipoEquipoFiltrar = $.isArray($("#cbFilTipoEquipo").val()) ? $("#cbFilTipoEquipo").val() : [$("#cbFilTipoEquipo").val()];//$("#cbFilTipoEquipo").val();
            DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
            DATA_EXPORTAR.FechaFiltro = castDate($("#FechaFiltro").val());
            DATA_EXPORTAR.SubsidiariaFiltrar = $("#cbFilDominioRed").val();
            DATA_EXPORTAR.TipoTecnologiaFiltrar = $("#cbFilTipo").val();
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

function listarRegistrosDetalle() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableDetalle.bootstrapTable('destroy');
    $tableDetalle.bootstrapTable({
        url: URL_API_VISTA2 + "/Reportes/GraficoSubdominios/DetalleEquipos",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        fixedColumns: true,
        fixedNumber: 4,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SubdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()];
            DATA_EXPORTAR.TipoEquipoFiltrar = $.isArray($("#cbFilTipoEquipo").val()) ? $("#cbFilTipoEquipo").val() : [$("#cbFilTipoEquipo").val()]; //$("#cbFilTipoEquipo").val();
            DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
            DATA_EXPORTAR.FechaFiltro = castDate($("#FechaFiltro").val());
            DATA_EXPORTAR.SubsidiariaFiltrar = $("#cbFilDominioRed").val();
            DATA_EXPORTAR.TipoTecnologiaFiltrar = $("#cbFilTipo").val();
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
}

function ExportarDataEquipos() {
    //$("#formFiltros").validate().resetForm();
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        let _data = $table.bootstrapTable("getData") || [];
        //console.log(_data.length);
        if (_data.length === 0) {
            MensajeNoExportar(TITULO_MENSAJE);
            return false;
        }

        var subdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val().join() : $("#cbFilSubdominio").val();
        var tipoEquipoIds = $.isArray($("#cbFilTipoEquipo").val()) ? $("#cbFilTipoEquipo").val().join() : $("#cbFilTipoEquipo").val(); //$("#cbFilTipoEquipo").val();
        var fecha = castDate($("#FechaFiltro").val());
        var subsidiaria = $("#cbFilDominioRed").val().join();
        var tipoTecnologia = $("#cbFilTipo").val().join();

        let url = `${URL_API_VISTA2}/Reportes/GraficoSubdominios/ExportarEquipos?fecha=${fecha}&tipoEquipoFiltrar=${tipoEquipoIds}&subdominioFiltrar=${subdominioFiltrar}&subsidiaria=${subsidiaria}&tipotecnologia=${tipoTecnologia}`;
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
}

function linkFormatterEquipo(value, row, index) {
    if (row.EquipoId > 0)
        return `<a href="/Vista/DetalleEquipo?id=${row.EquipoId}" title="Ver detalle del equipo" target="_blank">${value}</a>`;
    else
        return '-';
}

function linkFormatterTecnologia(value, row, index) {
    if (row.TecnologiaId > 0) {
        return `<a href="TecnologiaEquipo/${row.TecnologiaId}" title="Ver detalle de la tecnología" target="_blank">${value}</a>`;
    } else {
        if (row.TipoEquipo == 'Appliance') {
            return `${value}`;
        } else {
            return '-';
        }
        return '-';
    }
        
}