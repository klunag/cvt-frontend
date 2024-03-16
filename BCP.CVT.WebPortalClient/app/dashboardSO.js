var URL_API_VISTA = URL_API + "/Dashboard/Tecnologia";
var DATA_DOMINIO = [];
var DATA_SUBDOMINIO = [];
var DATA_FAMILIA = [];
var DATA_FABRICANTE = [];
var DATA_CLAVETECNOLOGIA = [];
var DATA_TIPOEQUIPO = [];
var $tblSubdominioTipo = $("#tblSubdominioTipo");

$(function () {
    //INIT COMBO MULTIPLE
    SetItemsMultiple([], $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbFilTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);

    $("#cbFilDominio").change(Change_cbFilDominio);

    //SetItems([], $("#cbFilSubdominio"), TEXTO_SELECCIONE);

    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    _BuildDatepicker($("#FechaFiltro"));
    CargarCombos();

    //$("#cbFilDominio").on('change', function () {
    //    getSubdominiosByDomCb(this.value, $("#cbFilSubdominio"));
    //});

    //$("#cbFilDominio").change(Change_cbFilDominio);
    //$("#cbFilSubdominio").change(Change_cbFilSubdominio);
    //$("#cbFilFamilia").change(Change_cbFilFamilia);
    //$("#cbFilFabricante").change(Change_cbFilFabricante);

    MethodValidarFecha(RANGO_DIAS_HABILES);
    ValidarCampos();
    //CargarReporte();
    //InitAmchartTest();
});



function Change_cbFilDominio() {
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
                        SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
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
}

function ValidarCampos() {

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
            FechaFiltro: {
                required: true,
                isDate: true,
                FechaPrevia: true,
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
                requiredSelect: String.Format("Debes seleccionar el {0}.", "tipo de equipo")
            },
            FechaFiltro: {
                required: String.Format("Debes seleccionar una {0}.", "fecha de consulta"),
                isDate: "Debe ingresar una fecha de consulta valida",
                FechaPrevia: "Debe ingresar una fecha de consulta valida",
                FechaMaxima: "Debe ingresar una fecha de consulta menor a la actual"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbFilDominio" || element.attr('name') === "cbFilSubdominio" || element.attr('name') === "FechaFiltro") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
    });
}

function ActualizarGraficos() {
    if (FLAG_ADMIN === 1) {
        $(".exportar-detalle-reporte").show();
    }
    else {
        $(".exportar-detalle-reporte").hide();
    }
    CargarReporte();
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
                    DATA_SUBDOMINIO = dataObject.Subdominio;
                    //SetItems(dataObject.Dominio, $("#cbFilDominio"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_SELECCIONE);

                    SetItemsMultiple(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Dominio, $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
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
function CargarReporte() {
    LimpiarValidateErrores($("#formFiltros"));

    if ($("#formFiltros").valid()) {

        //let data = {
        //    TipoEquipoId: $("#cbFilTipoEquipo").val(),
        //    SubdominioId: $("#cbFilSubdominio").val(),
        //    Fecha: $("#FechaFiltro").val()
        //};

        let data = {
            //DominioFiltrar: CaseIsNullSendFilter($("#cbFilDominio").val()),
            SubdominioFiltrar: $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()],
            //FamiliaFiltrar: $.isArray($("#cbFilFamilia").val()) ? $("#cbFilFamilia").val() : $("#cbFilFamilia").val() != null ? [$("#cbFilFamilia").val()] : null,
            //FabricanteFiltrar: $.isArray($("#cbFilFabricante").val()) ? $("#cbFilFabricante").val() : $("#cbFilFabricante").val() != null ? [$("#cbFilFabricante").val()] : null,
            //ClaveTecnologiaFiltrar: $.isArray($("#cbFilClaveTecnologia").val()) ? $("#cbFilClaveTecnologia").val() : $("#cbFilClaveTecnologia").val() != null ? [$("#cbFilClaveTecnologia").val()] : null,
            TipoEquipoFiltrar: $("#cbFilTipoEquipo").val(),
            //SubsidiariaFiltrar: $("#cbFilDominioRed").val(),
            Fecha: $("#FechaFiltro").val()
        };

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

        $.ajax({
            url: URL_API_VISTA + "/ReporteTecnologiaInstalaciones/DetalleSubdominio",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject) {
                if (dataObject !== null) {
                    let rptInstalacionesSO = dataObject.rptInstalacionesSO;
                    let SubdominioStr = dataObject.Subdominio;
                    let TipoEquipoStr = dataObject.TipoEquipo;
                    //let dataPie = dataObject.rptPie;
                    let dataBar = dataObject.rptBar;

                    //InitAmchartPiev4(dataPie, "reportPie", String.Format("SW instalado en {0}", TipoEquipoStr), "");
                    //InitAmchartPiev4_2(dataPie, "reportPie");
                    InitAmchartBarv4(dataBar, "reportPie");

                    //Fill Tbl SO
                    $tblSubdominioTipo.bootstrapTable("destroy");
                    //$("#tituloSubdominio").html(SubdominioStr);
                    //$("#tituloTipoEquipo").html(String.Format("N° de {0}", TipoEquipoStr));
                    $tblSubdominioTipo.bootstrapTable({
                        data: rptInstalacionesSO,
                        pagination: true,
                        pageNumber: 1,
                        pageSize: 10
                    });

                    $(".div-report").show();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function (data) {
                waitingDialog.hide();
            }
        });
    }
}

function Change_cbFilSubdominio() {
    let Ids = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()];

    if (Ids != null) {
        $.ajax({
            url: URL_API_VISTA + "/ListarCombos/Subdominio",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(Ids),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject) {
                if (dataObject != null) {


                    DATA_FAMILIA = dataObject.Familia;
                    DATA_FABRICANTE = dataObject.Fabricante;
                    DATA_CLAVETECNOLOGIA = dataObject.ClaveTecnologia;

                    if (FLAG_ADMIN == 1) {
                        //SetItemsMultipleEspecial(DATA_FAMILIA, $("#cbFilFamilia"), TEXTO_TODAS, TEXTO_TODOS);
                        SetItemsMultiple(DATA_FABRICANTE, $("#cbFilFabricante"), TEXTO_TODOS, TEXTO_TODOS,true);
                        SetItemsMultiple(DATA_CLAVETECNOLOGIA, $("#cbFilClaveTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    } else {
                        $("#cbFilFamilia, #cbFilFabricante, #cbFilClaveTecnologia").prop("multiple", "");
                        //SetItemsMultipleEspecial(DATA_FAMILIA, $("#cbFilFamilia"), TEXTO_TODAS, "", false, false);


                        SetItemsMultiple(DATA_FABRICANTE, $("#cbFilFabricante"), TEXTO_TODOS, "", false, false);
                        SetItemsMultiple(DATA_CLAVETECNOLOGIA, $("#cbFilClaveTecnologia"), TEXTO_TODOS, "", false, false);

                        $("#cbFilFamilia, #cbFilFabricante, #cbFilClaveTecnologia").val('').multiselect("refresh");
                    }

                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function (data) {

            }
        });

    }
}

function Change_cbFilFamilia() {
    let IdsSubdominio = [];
    let IdsFamilia = [];
    let options = "";

    $('#cbFilFamilia option:selected').each(function (e) {
        let options = $(this).attr("data-opt");
        if (options != null) {
            IdsSubdominio.push($(this).attr("data-opt"));
        }
    });
    $('#cbFilFamilia option:selected').each(function (e) {
        let options = $(this).attr("data-id");
        if (options != null) {
            IdsFamilia.push(parseInt($(this).attr("data-id")));
        }
    });
    let tmpFabricante = DATA_FABRICANTE;
    let tmpClaveTecnologica = DATA_CLAVETECNOLOGIA;

    if (IdsSubdominio != null && IdsSubdominio.length != 0) {
        tmpFabricante = DATA_FABRICANTE.filter(x => IdsSubdominio.includes(x.TipoId));
        tmpClaveTecnologica = DATA_CLAVETECNOLOGIA.filter(x => IdsSubdominio.includes(x.TipoId) && IdsFamilia.includes(x.FamiliaId));
    }

    if (FLAG_ADMIN == 1) {
        SetItemsMultiple(tmpFabricante, $("#cbFilFabricante"), TEXTO_TODOS, TEXTO_TODOS, false);
        SetItemsMultiple(tmpClaveTecnologica, $("#cbFilClaveTecnologia"), TEXTO_TODOS, TEXTO_TODOS, false);
    } else {

        SetItemsMultiple(tmpFabricante, $("#cbFilFabricante"), TEXTO_TODOS, TEXTO_TODOS, false, false);
        SetItemsMultiple(tmpClaveTecnologica, $("#cbFilClaveTecnologia"), TEXTO_TODOS, TEXTO_TODOS, false, false);
        $("#cbFilFabricante, #cbFilClaveTecnologia").val('').multiselect("refresh");
    }

}

function Change_cbFilFabricante() {
    let IdsSubdominio = [];
    let IdsFamilia = [];
    let IdsFabricante = $("#cbFilFabricante").val();
    let options = "";

    $('#cbFilSubdominio option:selected').each(function (e) {
        IdsSubdominio.push($(this).val());
        //let options = $(this).attr("data-opt");
        //if (options != null) {
        //    IdsSubdominio.push($(this).attr("data-opt"));
        //}
    });
    //$('#cbFilFamilia option:selected').each(function (e) {
    //    let options = $(this).attr("data-id");
    //    if (options != null) {
    //        IdsFamilia.push(parseInt($(this).attr("data-id")));
    //    }
    //});

    let tmpClaveTecnologica = DATA_CLAVETECNOLOGIA;

    if (IdsSubdominio != null && IdsSubdominio.length != 0 && IdsFabricante != null && IdsFabricante.length != 0) {
        //tmpClaveTecnologica = DATA_CLAVETECNOLOGIA.filter(x => IdsSubdominio.includes(x.TipoId) && IdsFamilia.includes(x.FamiliaId) && IdsFabricante.includes(x.Fabricante));
        tmpClaveTecnologica = DATA_CLAVETECNOLOGIA.filter(x => IdsSubdominio.includes(x.TipoId) && IdsFabricante.includes(x.Fabricante));
    }

    if (FLAG_ADMIN == 1) {
        SetItemsMultiple(tmpClaveTecnologica, $("#cbFilClaveTecnologia"), TEXTO_TODOS, TEXTO_TODOS, false);
    } else {
        SetItemsMultiple(tmpClaveTecnologica, $("#cbFilClaveTecnologia"), TEXTO_TODOS, "", false, false);
        $("#cbFilClaveTecnologia").val('').multiselect("refresh");
    }

}

function SetItemsMultipleEspecial(data, combo, TEXTO_INICIAL, TEXTO_GRUPO, ISARRAY, ALL) {
    ISARRAY = ISARRAY || false;
    ALL = (ALL === undefined || ALL === null) ? true : ALL;

    if (data != null) {
        combo.html('');
        var group = $.map(data, function (element) {
            return parseInt(element.TipoId) || element;
        });

        let uniqueGroup = unique(group);
        if (uniqueGroup.length == 1 || ISARRAY) {

            $.each(data, function () {
                //combo.append($("<option />").val(this.Id || this).text(this.Descripcion || this));

                var $option = $("<option>", { text: this.Descripcion, value: this.TipoId + "_" + this.Id });
                $option.attr("data-opt", this.TipoId);
                $option.attr("data-id", this.Id);
                $option.appendTo(combo);
            });
        } else {
            $.each(uniqueGroup, function (i, groupId) {
                var objGroup = $.grep(data, function (element, index) {
                    return element.TipoId == groupId;
                })[0];

                objGroup.TipoDescripcion = objGroup.TipoDescripcion || TEXTO_INICIAL;

                var $optgroup = $("<optgroup>", { label: objGroup.TipoDescripcion });
                $optgroup.appendTo(combo);

                var dataSecciones = $.grep(data, function (element, index) {
                    return element.TipoId == groupId;
                });

                $.each(dataSecciones, function (j, option) {
                    var $option = $("<option>", { text: option.Descripcion, value: option.TipoId + "_" + option.Id });
                    $option.attr("data-opt", option.TipoId);
                    $option.attr("data-id", option.Id);
                    $option.appendTo($optgroup);
                });

            });
        }

        combo.multiselect('destroy');
        var opciones = {
            nonSelectedText: TEXTO_INICIAL,
            nSelectedText: "seleccionados",
            allSelectedText: TEXTO_INICIAL,
            includeSelectAllOption: ALL,
            selectAllText: TEXTO_GRUPO,
            maxHeight: 400,
            enableFiltering: true,
            filterPlaceholder: "buscar",
            enableCaseInsensitiveFiltering: true,
            enableClickableOptGroups: false,
            buttonWidth: 240
        };
        combo.multiselect(opciones);
        combo.multiselect('refresh');
    }
}
function ExportarInfo() {

    let IdFamilia = [];
    $('#cbFilFamilia option:selected').each(function (e) {
        let options = $(this).attr("data-id");
        if (options != "") {
            IdFamilia.push($(this).attr("data-id"));
        }
    });

    var cbFilDominioVal = $("#cbFilDominio").val();
    var cbFilSubdominioVal = $("#cbFilSubdominio").val();
    var cbFilFabricanteVal = $("#cbFilFabricante").val();
    var cbFilClaveTecnologiaVal = $("#cbFilClaveTecnologia").val();


    let DATA_EXPORTAR = {
        DominioFiltrar: cbFilDominioVal != null ? [cbFilDominioVal].join("|") : "",
        SubdominioFiltrar: cbFilSubdominioVal != null ? $.isArray(cbFilSubdominioVal) ? cbFilSubdominioVal.join("|") : cbFilSubdominioVal : "",

        FamiliaFiltrar: IdFamilia.length != 0 ? $.unique(IdFamilia).join("|") : "",
        FabricanteFiltrar: cbFilFabricanteVal != null ? $.isArray(cbFilFabricanteVal) ? cbFilFabricanteVal.join("|") : cbFilFabricanteVal : "",
        ClaveTecnologiaFiltrar: cbFilClaveTecnologiaVal != null ? $.isArray(cbFilClaveTecnologiaVal) ? cbFilClaveTecnologiaVal.join("|") : cbFilClaveTecnologiaVal : "",
        TipoEquipoFiltrar: $("#cbFilTipoEquipo").val() != null ? $("#cbFilTipoEquipo").val().join("|") : "",
        SubsidiariaFiltrar: $("#cbFilDominioRed").val() != null ? $("#cbFilDominioRed").val().join("|") : "",
        Fecha: $("#FechaFiltro").val()
    };

    let url = `${URL_API_VISTA}/Exportar?dominio=${DATA_EXPORTAR.DominioFiltrar}&subdominio=${DATA_EXPORTAR.SubdominioFiltrar}&familia=${DATA_EXPORTAR.FamiliaFiltrar}&fabricante=${DATA_EXPORTAR.FabricanteFiltrar}&clave=${DATA_EXPORTAR.ClaveTecnologiaFiltrar}&tipoEquipo=${DATA_EXPORTAR.TipoEquipoFiltrar}&subsidiaria=${DATA_EXPORTAR.SubsidiariaFiltrar}&fecha=${DATA_EXPORTAR.Fecha}`;
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

function getSubdominiosByDomCb(_domId, $cbSub) {
    var domId = _domId;

    $cbSub.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $.ajax({
        url: URL_API + "/Tecnologia/Subdominios/" + domId,
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

function InitAmchartPiev4(dataAPI, divPie, titulo, leyenda) {

    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create(divPie, am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    chart.legend = new am4charts.Legend();
    //chart.legend.parent = chart.chartContainer;
    chart.legend.background.fill = am4core.color("#000");
    chart.legend.background.fillOpacity = 0.05;
    //chart.legend.width = 260;
    chart.legend.align = "center";
    chart.legend.padding(10, 15, 10, 15);
    //chart.legend.labels.template.text = "[bold {color}]{name}[/]";
    chart.legend.valueLabels.template.text = "{value.value}";
    chart.legend.labels.template.maxWidth = 95;
    chart.legend.labels.template.truncate = false;
    chart.legend.labels.template.wrap = true;

    //Title Legend
    var legendTitle = chart.legend.createChild(am4core.Label);
    legendTitle.text = String.Format("[bold]{0}[/]", leyenda);

    //Title Chart
    var title = chart.titles.create();
    title.text = titulo;
    title.fontSize = 15;
    title.marginBottom = 30;
    title.fontWeight = 600;
    title.align = "center";

    chart.data = dataAPI;

    var series = chart.series.push(new am4charts.PieSeries3D());
    series.dataFields.value = "cantidad";
    series.dataFields.category = "categoria";
    series.labels.template.text = "{value.percent.formatNumber('#.0')}%";
    //series.legendSettings.valueText = "{value}";
}

function InitAmchartPiev4_2(dataAPI, divPie) {

    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create(divPie, am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    chart.data = dataAPI;

    chart.innerRadius = am4core.percent(40);
    chart.depth = 40;

    chart.legend = new am4charts.Legend();

    var series = chart.series.push(new am4charts.PieSeries3D());
    series.dataFields.value = "cantidad";
    series.dataFields.depthValue = "cantidad";
    series.dataFields.category = "categoria";

    series.slices.template.cornerRadius = 5;
    series.colors.step = 3;

    series.labels.template.text = "{value.percent.formatNumber('#.0')}% ({value})";
}

function InitAmchartBarv4(dataAPI, divChart) {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    var chart = am4core.create(divChart, am4charts.XYChart3D);

    //Add data
    chart.data = SetearDataBar(dataAPI, chart);

    // Create axes
    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "categoria";
    categoryAxis.numberFormatter.numberFormat = "#";
    categoryAxis.renderer.inversed = true;

    var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries3D());
    series.dataFields.valueX = "cantidad";
    series.dataFields.categoryY = "categoria";
    series.name = "Income";
    series.columns.template.propertyFields.fill = "color";
    series.columns.template.tooltipText = "{valueX}";
    series.columns.template.column3D.stroke = am4core.color("#fff");
    series.columns.template.column3D.strokeOpacity = 0.2;
}

function SetearDataBar(dataAPI, chart) {
    for (var i in dataAPI)
        dataAPI[i].color = chart.colors.next();

    return dataAPI;
}