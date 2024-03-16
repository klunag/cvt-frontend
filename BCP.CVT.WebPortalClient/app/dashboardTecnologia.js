var URL_API_VISTA = URL_API + "/Dashboard/Tecnologia";
var DATA_DOMINIO = [];
var DATA_SUBDOMINIO = [];
var DATA_FAMILIA = [];
var DATA_FABRICANTE = [];
var DATA_CLAVETECNOLOGIA = [];
var DATA_TIPOEQUIPO = [];
const arrMultiSelect = [
    { SelectId: "#cbFilDominio", DataField: "Dominio" }
];

$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    //INICIALIZACION DE COMBOS
    $("#cbFilDominio").prop("Multiple", true);
    SetItemsMultiple([], $("#cbFilDominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#cbFilTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbFilFamilia"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbFilFabricante"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbFilClaveTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#cbFilDominioRed"), TEXTO_TODOS, TEXTO_TODOS, true);

    buildDatePicker();

    CargarCombos();

    $("#cbFilDominio").change(Change_cbFilDominio);
    $("#cbFilSubdominio").change(Change_cbFilSubdominio);
    $("#cbFilFamilia").change(Change_cbFilFamilia);
    $("#cbFilFabricante").change(Change_cbFilFabricante);

    MethodValidarFecha(RANGO_DIAS_HABILES);
    ValidarCampos();
    //CargarReporte();
    //InitAmchartTest();
});

function buildDatePicker() {

    var fechaInicio = new Date();
    var fechaFin = new Date();

    fechaInicio.setDate(fechaInicio.getDate() - RANGO_DIAS_HABILES);

    $("#FechaFiltro").datepicker({
        maxDate: fechaFin,
        locale: "es",
        useCurrent: false,
        //format: "DD/MM/YYYY",
        //format: "dd/mm/yyyy",
        firstDay: 1,
        dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
        dayNamesShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
        monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        closeText: 'Cerrar',
        prevText: '< Ant',
        nextText: 'Sig >',
        currentText: 'Hoy',
        weekHeader: 'Sm',
        dateFormat: 'dd/mm/yy',
        beforeShowDay: function (date) {
            if (date < fechaInicio && date.getDay() != 0) {
                return [false, "somecssclass"]
            }
            else {
                return [true, "someothercssclass"]
            }
        }
    });
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
            cbFilDominio: { requiredSelect: true },
            cbFilSubdominio: { requiredSelect: true },
            FechaFiltro: {
                required: true,
                isDate: true,
                FechaPrevia: true,
                FechaMaxima: true
            }
        },
        messages: {
            cbFilDominio: { requiredSelect: String.Format("Debes seleccionar el {0}.", "dominio") },
            cbFilSubdominio: { requiredSelect: String.Format("Debes seleccionar el {0}.", "subdominio") },
            FechaFiltro: {
                required: "Debe seleccionar una fecha",
                isDate: "Debe ingresar una fecha valida",
                FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbFilDominio" || element.attr('name') === "cbFilSubdominio" || element.attr('name') === "FechaFiltro") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function ActualizarGraficos() {
    if (FLAG_ADMIN == 1) {
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
            if (textStatus == "success") {
                if (dataObject != null) {
                    DATA_SUBDOMINIO = dataObject.Subdominio;

                    //SetItemsRadio(dataObject.Dominio, $("#cbFilDominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
                    //FILTROS MULTISELECT
                    SetItemsMultiple(dataObject.Dominio, $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);


                    SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);


                    if (FLAG_ADMIN == 1) {
                        SetItemsMultiple(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_TODOS, TEXTO_TODOS, true);
                        SetItemsMultiple(dataObject.DominioRed, $("#cbFilDominioRed"), TEXTO_TODOS, TEXTO_TODOS, true);
                    } else {
                        SetItemsMultiple(dataObject.TipoEquipo, $("#cbFilTipoEquipo"), TEXTO_TODOS, "", true, false);
                        SetItemsMultiple(dataObject.DominioRed, $("#cbFilDominioRed"), TEXTO_TODOS, "", true, false);
                    }

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
    $("#formFiltros").validate().resetForm();
    let options = "";

    if ($("#formFiltros").valid()) {

        let IdFamilia = [];
        $('#cbFilFamilia option:selected').each(function (e) {
            let options = $(this).attr("data-id");
            if (options != "") {
                IdFamilia.push($(this).attr("data-id"));
            }
        });

        let data = {
            DominioFiltrar: CaseIsNullSendFilter($("#cbFilDominio").val()),
            SubdominioFiltrar: $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : [$("#cbFilSubdominio").val()],
            FamiliaFiltrar: $.isArray($("#cbFilFamilia").val()) ? $("#cbFilFamilia").val() : $("#cbFilFamilia").val() != null ? [$("#cbFilFamilia").val()] : null,
            FabricanteFiltrar: $.isArray($("#cbFilFabricante").val()) ? $("#cbFilFabricante").val() : $("#cbFilFabricante").val() != null ? [$("#cbFilFabricante").val()] : null,
            ClaveTecnologiaFiltrar: $.isArray($("#cbFilClaveTecnologia").val()) ? $("#cbFilClaveTecnologia").val() : $("#cbFilClaveTecnologia").val() != null ? [$("#cbFilClaveTecnologia").val()] : null,
            TipoEquipoFiltrar: $("#cbFilTipoEquipo").val(),
            SubsidiariaFiltrar: $("#cbFilDominioRed").val(),
            Fecha: $("#FechaFiltro").val()
        };

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $.ajax({
            url: URL_API_VISTA + "/Reporte",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject) {
                if (dataObject !== null) {
                    //let colors = ["0", "yellow", "red", "green", "lightgrey"];
                    let Pie = [];
                    let HorizontalBar = [];
                    $.each(dataObject, function (i, item) {
                        //Pie.push({ Id: item.TipoDescripcion, Value: item.Data.length, TipoDescripcion: item.TipoDescripcion, Color: item.Color });
                        if (item.Cantidad > 0) {
                            Pie.push({ Id: item.TipoDescripcion, Value: item.Cantidad, TipoDescripcion: item.TipoDescripcion, Color: item.Color });
                        }

                        var new_arr = $.grep(item.Data, function (n, i) {
                            return n.value > 0;
                        });
                        if (new_arr.length > 0) {
                            if (FLAG_ADMIN === 1)
                                $(".exportar-detalle-reporte").show();
                        }
                        HorizontalBar = HorizontalBar.concat(new_arr);
                    });
                    InitAmchartPiev4(Pie);
                    InitAmchartHorizontalBar(HorizontalBar);
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

function InitAmchartPiev4(dataAPI) {


    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

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

    series.labels.template.text = "{value.percent.formatNumber('#.0')}% ({value})";

    var colorSet = new am4core.ColorSet();
    colorSet.list = $.map(dataAPI, function (n, i) {
        return new am4core.color(n.Color);
    });
    series.colors = colorSet;

}
function InitAmchartHorizontalBar(dataAPI) {
    console.log(dataAPI);
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    var chart = am4core.create("reportHorizontalBar", am4charts.XYChart);

    // Add data
    chart.data = dataAPI;
    // Create axes
    var yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    yAxis.dataFields.category = "Descripcion";
    yAxis.renderer.grid.template.location = 0;
    yAxis.renderer.labels.template.fontSize = 10;
    yAxis.renderer.minGridDistance = 10;
    yAxis.renderer.cellStartLocation = 0.15;
    yAxis.renderer.cellEndLocation = 0.85;

    var xAxis = chart.xAxes.push(new am4charts.ValueAxis());

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueX = "value";
    series.dataFields.categoryY = "Descripcion";
    series.columns.template.tooltipText = "{categoryY}: [bold]{valueX}[/]";
    series.columns.template.strokeWidth = 0;
    series.columns.template.adapter.add("fill", function (fill, target) {
        if (target.dataItem) {
            switch (target.dataItem.dataContext.TipoDescripcion) {
                case NO_VIGENTE:
                    return am4core.color(target.dataItem.dataContext.Color);
                case CERCA_FIN_SOPORTE:
                    return am4core.color(target.dataItem.dataContext.Color);
                case VIGENTE:
                    return am4core.color(target.dataItem.dataContext.Color);
                case SIN_INFORMACION:
                    return am4core.color(target.dataItem.dataContext.Color);
            }
        }
        return fill;
    });

    // Add ranges
    function addRange(label, start, end, color) {
        var range = yAxis.axisRanges.create();
        range.category = start;
        range.endCategory = end;
        range.label.text = "";//label;
        range.label.disabled = false;
        range.label.fill = color;
        range.label.location = 0;
        range.label.dx = -220;
        range.label.dy = 12;
        range.label.fontWeight = "bold";
        range.label.fontSize = 14;
        range.label.horizontalCenter = "left";
        range.label.inside = true;

        range.grid.stroke = am4core.color("#396478");
        range.grid.strokeOpacity = 1;
        range.tick.length = 200;
        range.tick.disabled = false;
        range.tick.strokeOpacity = 0.6;
        range.tick.stroke = am4core.color("#396478");
        range.tick.location = 0;

        range.locations.category = 1;
    }

    var arrNoVigente = $.grep(dataAPI, function (element, index) {
        return element.TipoDescripcion == NO_VIGENTE;
    });
    console.log(arrNoVigente);
    var arrCercaFinSoporte = $.grep(dataAPI, function (element, index) {
        return element.TipoDescripcion == CERCA_FIN_SOPORTE;
    });
    var arrVigente = $.grep(dataAPI, function (element, index) {
        return element.TipoDescripcion == VIGENTE;
    });
    var arrSinInformacion = $.grep(dataAPI, function (element, index) {
        return element.TipoDescripcion == SIN_INFORMACION;
    });
    if (arrNoVigente.length != 0)
        addRange(NO_VIGENTE, arrNoVigente[arrNoVigente.length - 1].Descripcion, arrNoVigente[0].Descripcion, arrNoVigente[0].Color);

    if (arrCercaFinSoporte.length != 0)
        addRange(CERCA_FIN_SOPORTE, arrCercaFinSoporte[arrCercaFinSoporte.length - 1].Descripcion, arrCercaFinSoporte[0].Descripcion, arrCercaFinSoporte[0].Color);

    if (arrVigente.length != 0)
        addRange(VIGENTE, arrVigente[arrVigente.length - 1].Descripcion, arrVigente[0].Descripcion, arrVigente[0].Color);

    if (arrSinInformacion.length != 0)
        addRange(SIN_INFORMACION, arrSinInformacion[arrSinInformacion.length - 1].Descripcion, arrSinInformacion[0].Descripcion, arrSinInformacion[0].Color);



    chart.cursor = new am4charts.XYCursor();
}

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


    //Change_cbFilSubdominio();
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
                       
                        SetItemsMultiple(DATA_FABRICANTE, $("#cbFilFabricante"), TEXTO_TODOS, TEXTO_TODOS, true);

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
        SetItemsMultiple(tmpFabricante, $("#cbFilFabricante"), TEXTO_TODOS, TEXTO_TODOS, true);
        SetItemsMultiple(tmpClaveTecnologica, $("#cbFilClaveTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
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
        SetItemsMultiple(tmpClaveTecnologica, $("#cbFilClaveTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
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

    var cbFilDominioVal = CaseIsNullSendExport($("#cbFilDominio").val());
    var cbFilSubdominioVal = $("#cbFilSubdominio").val();
    var cbFilFabricanteVal = $("#cbFilFabricante").val();
    var cbFilClaveTecnologiaVal = $("#cbFilClaveTecnologia").val();


    let DATA_EXPORTAR = {
        DominioFiltrar: cbFilDominioVal, // != null ? [cbFilDominioVal].join("|") : "",
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