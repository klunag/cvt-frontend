var $tableEquipos = $("#tblEquipos");
var $tableAplicaciones = $("#tblAplicaciones");
var $tableTecnologiasVinculadas = $("#tblTecnologiasVinculadas");
var $tableTecnologiasFamilia = $("#tblTecnologiasFamilia");

var URL_API_VISTA = URL_API + "/Dashboard/TecnologiaEquipo";
//TecnologiaEquipo/ListadoEquipos

$(function () {

    CargarCombos();

    if (FLAG_ADMIN === 1)
        $("#btnExportarEquipos").show();
    else
        $("#btnExportarEquipos").hide();

    $tableEquipos.bootstrapTable('destroy');
    $tableAplicaciones.bootstrapTable('destroy');
    $tableTecnologiasVinculadas.bootstrapTable('destroy');
    $tableTecnologiasFamilia.bootstrapTable('destroy');

    InitAutocompletarTecnologia($("#txtTecnologia"), $("#hdTecnologiaId"), ".equipoContainer");
    InitAutocompletarTecnologiaNombre($("#txtNombre"), $("#hdTecnologiaId2"), ".equipoContainer");


    validarFormTecnologia();

    $("#cbFilDom").on('change', function () {
        getSubdominiosByDomCb(this.value, $("#cbFilSubdom"));
    });

    //$("#txtFechaReporte").datetimepicker({
    //    locale: 'es',
    //    useCurrent: true,
    //    format: 'DD/MM/YYYY'
    //});

    _BuildDatepicker($("#txtFechaReporte"));
    MethodValidarFecha(RANGO_DIAS_HABILES);

    $("#txtFechaReporte").val(moment(new Date()).format("DD/MM/YYYY"));
});

function InitAutocompletarTecnologia($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            $IdBox.val("0");

            $.ajax({
                url: URL_API_VISTA + "/GetTecnologiaByFabricanteNombre?filtro=" + request.term,
                type: "GET",
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                success: function (data) {
                    response($.map(data, function (item) {
                        return item;
                    }));
                },
                async: true,
                global: false
            });
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.Descripcion);
            return false;
        },
        select: function (event, ui) {
            //$IdBox.val(ui.item.Id);
            $IdBox.val(ui.item.Descripcion);

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Descripcion));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}

function InitAutocompletarTecnologiaNombre($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            $IdBox.val("0");

            $.ajax({
                url: URL_API_VISTA + "/GetTecnologiaByNombre?filtro=" + request.term,
                type: "GET",
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                success: function (data) {
                    response($.map(data, function (item) {
                        return item;
                    }));
                },
                async: true,
                global: false
            });
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.Descripcion);
            return false;
        },
        select: function (event, ui) {
            //$IdBox.val(ui.item.Id);
            $IdBox.val(ui.item.Descripcion);

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Descripcion));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}

function validarFormTecnologia() {

    $("#formTecnologia").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtTecnologia: {
                requiredSinEspacios: true
            },
            txtFechaReporte: {
                required: true,
                isDate: true,
                FechaPrevia: true,
                FechaMaxima: true
            },
            //cbFilDom: {
            //    requiredSelect: true
            //},
            //cbFilSubdom: {
            //    requiredSelect: true
            //}
        },
        messages: {

            txtTecnologia: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el fabricante")
            },
            txtFechaReporte: {
                required: String.Format("Debes ingresar {0}.", "la fecha de consulta"),
                isDate: "Debe ingresar una fecha valida",
                FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            },
            //cbFilDom: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "el dominio")
            //},
            //cbFilSubdom: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "el subdominio")
            //}
        }
    });
}


function CargarReporte() {
    if ($("#formTecnologia").valid()) {
        let data = {
            //ClaveTecnologiaFiltrar: $("#txtTecnologia").val(),
            //TecnologiaIdFiltrar: $("#hdTecnologiaId").val(),
            FechaConsulta: dateFromString($("#txtFechaReporte").val()),
            Fabricante: $("#txtTecnologia").val(),
            Nombre: $("#txtNombre").val(),
            Version: $("#txtVersion").val()
        };

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

        $.ajax({
            url: URL_API_VISTA + "/ReporteFabricanteNombre",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (dataObject) {
                if (dataObject !== null) {
                    if (dataObject.TecnologiaList !== null) {
                        InitAmchartPiev4(dataObject.DataPie);
                        //SetearDatosTecnologia(dataObject.Tecnologia);
                        SetearDatosTecnologia2(dataObject.TecnologiaList);
                        ListarEquipos();
                        ListarAplicaciones();
                        ListarTecnologiasVinculadas();
                        $("#divReporte").show();
                    } else {
                        $("#divReporte").hide();
                        waitingDialog.hide();
                        bootbox.alert("No se encontró información para la tecnología y el día seleccionado");
                    }

                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function (data) {
                //waitingDialog.hide();
            }
        });
    }
}

function SetearDatosTecnologia(objTecnologia) {

    if (objTecnologia !== null) {

        if ($("#txtTecnologia").val() === "") {
            $("#txtTecnologia").val(objTecnologia.ClaveTecnologia);
        }

        $("#lblTecnologiaDominio").html(objTecnologia.DominioNomb);
        $("#lblTecnologiaSubdominio").html(objTecnologia.SubdominioNomb);
        $("#lblTecnologiaTipo").html(objTecnologia.TipoTecNomb);
        $("#lblTecnologiaFechaFinConfigurada").html(objTecnologia.FechaCalculoBaseStr);
        $("#lblEstadoActual").html(semaforoFormatter(objTecnologia.IndicadorObsolescencia));
        $("#lblEstadoIndicador1").html(semaforoFormatter(objTecnologia.IndicadorObsolescencia_Proyeccion1));
        $("#lblEstadoIndicador2").html(semaforoFormatter(objTecnologia.IndicadorObsolescencia_Proyeccion2));
    }
}

function SetearDatosTecnologia2(objTecnologia) {
    if (objTecnologia !== null) {
        $tableTecnologiasFamilia.bootstrapTable("destroy");
        $tableTecnologiasFamilia.bootstrapTable({
            data: objTecnologia,
            pagination: true,
            pageNumber: 1,
            pageSize: 10
        });
    }
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
    series.dataFields.value = "Total";
    //series.dataFields.radiusValue = "Total";
    series.dataFields.category = "Descripcion";
    //series.labels.template.text = "{percent}%";
    //series.slices.template.cornerRadius = 6;
    series.colors.step = 3;


}


function ListarEquipos() {
    $tableEquipos.bootstrapTable('destroy');
    $tableEquipos.bootstrapTable({
        url: URL_API_VISTA + "/ListadoEquiposFabricanteNombre",
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
            DATA_EXPORTAR = {};
            //DATA_EXPORTAR.ClaveTecnologiaFiltrar = $("#txtTecnologia").val();
            //DATA_EXPORTAR.TecnologiaIdFiltrar = $("#hdTecnologiaId").val();
            DATA_EXPORTAR.Fabricante = $("#txtTecnologia").val();
            DATA_EXPORTAR.Nombre = $("#txtNombre").val();
            DATA_EXPORTAR.Version = $("#txtVersion").val();
            DATA_EXPORTAR.SubdominioId = -1;//$("#cbFilSubdom").val();
            DATA_EXPORTAR.FechaConsulta = dateFromString($("#txtFechaReporte").val());
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;

            $("#lblTotal").html(data.Total);
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

        }
    });
}

function ListarAplicaciones() {
    $tableAplicaciones.bootstrapTable('destroy');
    $tableAplicaciones.bootstrapTable({
        url: URL_API_VISTA + "/ListadoAplicacionesFabricanteNombre",
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
            DATA_EXPORTAR = {};
            //DATA_EXPORTAR.ClaveTecnologiaFiltrar = $("#txtTecnologia").val();
            //DATA_EXPORTAR.TecnologiaIdFiltrar = $("#hdTecnologiaId").val();
            DATA_EXPORTAR.Fabricante = $("#txtTecnologia").val();
            DATA_EXPORTAR.Nombre = $("#txtNombre").val();
            DATA_EXPORTAR.Version = $("#txtVersion").val();
            DATA_EXPORTAR.SubdominioId = -1;//$("#cbFilSubdom").val();
            DATA_EXPORTAR.FechaConsulta = dateFromString($("#txtFechaReporte").val());
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
        }
    });
}

function ListarTecnologiasVinculadas() {

    $tableTecnologiasVinculadas.bootstrapTable('destroy');
    $tableTecnologiasVinculadas.bootstrapTable({
        url: URL_API_VISTA + "/ListadoTecnologiasVinculadasFabricanteNombre",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'ClaveTecnologia',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            //DATA_EXPORTAR.ClaveTecnologiaFiltrar = $("#txtTecnologia").val();
            //DATA_EXPORTAR.TecnologiaIdFiltrar = $("#hdTecnologiaId").val();
            DATA_EXPORTAR.Fabricante = $("#txtTecnologia").val();
            DATA_EXPORTAR.Nombre = $("#txtNombre").val();
            DATA_EXPORTAR.Version = $("#txtVersion").val();
            DATA_EXPORTAR.SubdominioId = -1;//$("#cbFilSubdom").val();
            DATA_EXPORTAR.FechaConsulta = dateFromString($("#txtFechaReporte").val());
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

function ExportarListadoEquipos() {

    var idTecnologia = $("#hdTecnologiaId").val();
    var fechaConsulta = castDate($("#txtFechaReporte").val());
    var sortOrder = $tableEquipos.bootstrapTable('getOptions').sortOrder;
    var sortName = $tableEquipos.bootstrapTable('getOptions').sortName;


    let url = `${URL_API_VISTA}/ExportarEquipos?idTecnologia=${idTecnologia}&fecha=${fechaConsulta}&sortName=${sortName}&sortOrder=${sortOrder}`;
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

function semaforoFormatter(valor) {
    var html = "";
    if (valor === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (valor === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}


function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItems(dataObject.Fuente, $("#cbFuenteTec"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.FechaCalculo, $("#cbFecCalTec"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Dominio, $("#cbFilDom"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function getSubdominiosByDomCb(_domId, $cbSub) {
    var domId = _domId;

    $cbSub.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $.ajax({
        url: URL_API + "/Tecnologia" + "/Subdominios/" + domId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            data = result;
            $cbSub.find("option:gt(0)").remove();

            $.each(data, function (i, item) {
                $cbSub.append($('<option>', {
                    value: item.Id,
                    text: item.Nombre
                }));
            });
        },
        complete: function () {
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}