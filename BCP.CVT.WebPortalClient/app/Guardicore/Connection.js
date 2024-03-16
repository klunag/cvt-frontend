var $table = $("#tbRegistros");
var URL_API_VISTA = URL_API + "/Guardicore";
var DATA_EXPORTAR = {};
var $hdId = $("#hdAssetId");
var $hdIdDestino = $("#hdAssetIdDestino");
var $hdEtiquetaOrigen = $("#hdEtiquetaOrigen");
var GUAR = [];
var idExportar = "";
var idEstado = "";
var contadorP = 0;
var totalP = 10;
var cantRealExportar = 0;

const comboMultiSelect = [
    { SelectId: "#cbType", DataField: "Type" },
    { SelectId: "#cbAction", DataField: "Action" },
    { SelectId: "#ddlEtiquetaOrigen", DataField: "AppOrigen" },
    { SelectId: "#ddlEtiquetaDestino", DataField: "AppDestino" },
    { SelectId: "#cbAmbOri", DataField: "AmbOrigen" },
    { SelectId: "#cbAmbDes", DataField: "AmbDestino" }
];

$(function () {
    InitSelectMultiple(comboMultiSelect.map(x => x.SelectId));
    $('div[data-toggle="match-height"] .btn-group').attr("style", "width: 100%");
    CargarCombosGuardicore();
    initFecha();
    $table.bootstrapTable();
    validarReporteFiltros();
    validarPorts();
    listarConnection();
});

function LimpiarCampos() {
    $("#cbType").val([]).multiselect('refresh');
    $("#cbAction").val([]).multiselect('refresh');
    $("#ddlEtiquetaOrigen").val([]).multiselect('refresh');
    $("#ddlEtiquetaDestino").val([]).multiselect('refresh');
    $("#cbAmbOri").val([]).multiselect('refresh');
    $("#cbAmbDes").val([]).multiselect('refresh');
    $("#txtPorts").val("");
}

function buscarConnection() {
    $("#modal-procesando .modal-body .progress-bar").empty();
    $("#modal-procesando .modal-body #pbEstado").empty();

    listarConnection();
}

function initFecha() {
    let fechaInicio = new Date();
    let fechaFin = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 60);

    var d = new Date();

    $("#divFechaFiltroDesde").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY HH:mm",
        minDate: d.setDate(d.getDate() - 60),
        maxDate: Date.now()
    });

    $("#divFechaFiltroHasta").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY HH:mm",
        minDate: d.setDate(d.getDate() - 60),
        maxDate: Date.now()
    });

    var d = new Date();

    var month = ((d.getMonth() + 1) < 10 ? '0' : '') + (d.getMonth() + 1);
    var day = (d.getDate() < 10 ? '0' : '') + d.getDate();
    var hour = (d.getHours() < 10 ? '0' : '') + d.getHours();
    var minute = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();

    var outputInit = day + '/' + month + '/' + d.getFullYear() + ' 00:00';
    var outputFin = day + '/' + month + '/' + d.getFullYear() + ' ' + hour + ':' + minute;

    $("#FechaFiltroDesde").val(outputInit)
    $("#FechaFiltroHasta").val(outputFin);

}

function listarConnection() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/GetConnectionsByAsset`,
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {

            GUAR = $("#ddlEtiquetaOrigen").val() == null ? "" : $("#ddlEtiquetaOrigen").val().join();

            DATA_EXPORTAR = {};
            DATA_EXPORTAR.tipo = $("#cbType").val() == null ? "" : $("#cbType").val().join();
            DATA_EXPORTAR.accion = $("#cbAction").val() == null ? "" : $("#cbAction").val().join();
            DATA_EXPORTAR.appOrigen = $("#ddlEtiquetaOrigen").val() == null ? "" : $("#ddlEtiquetaOrigen").val().join();
            DATA_EXPORTAR.appDestino = $("#ddlEtiquetaDestino").val() == null ? "" : $("#ddlEtiquetaDestino").val().join();
            DATA_EXPORTAR.ambOrigen = $("#cbAmbOri").val() == null ? "" : $("#cbAmbOri").val().join();
            DATA_EXPORTAR.ambDestino = $("#cbAmbDes").val() == null ? "" : $("#cbAmbDes").val().join();
            DATA_EXPORTAR.puertos = $("#txtPorts").val();
            DATA_EXPORTAR.fromTime = convertDateTime($("#FechaFiltroDesde").val()).getTime();
            DATA_EXPORTAR.toTime = convertDateTime($("#FechaFiltroHasta").val()).getTime();
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            cantRealExportar = data.Total;
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

function CargarCombosGuardicore() {
    let url = URL_API_VISTA + '/ConnectionFilter';
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    jQuery.ajaxSetup({ async: false });

    $.get(url).then(function (arreglo) {
        SetItemsMultiple(arreglo.types.filter(x => x !== "" && x !== null), $("#cbType"), TEXTO_TODOS, TEXTO_TODOS, true, false, 5);
        SetItemsMultiple(arreglo.actions.filter(x => x !== "" && x !== null), $("#cbAction"), TEXTO_TODOS, TEXTO_TODOS, true, false, 5);
        SetItemsMultiple(arreglo.labelsOrigen.filter(x => x !== "" && x !== null), $("#ddlEtiquetaOrigen"), TEXTO_TODOS, TEXTO_TODOS, true, false, 5);
        SetItemsMultiple(arreglo.labelsDestino.filter(x => x !== "" && x !== null), $("#ddlEtiquetaDestino"), TEXTO_TODOS, TEXTO_TODOS, true, false, 5);
        SetItemsMultiple(arreglo.ambienteOrigen.filter(x => x !== "" && x !== null), $("#cbAmbOri"), TEXTO_TODOS, TEXTO_TODOS, true, false, 5);
        SetItemsMultiple(arreglo.ambienteDestino.filter(x => x !== "" && x !== null), $("#cbAmbDes"), TEXTO_TODOS, TEXTO_TODOS, true, false, 5);
        $('div[data-toggle="match-height"] .btn-group').attr("style", "width: 100%");

    });
    jQuery.ajaxSetup({ async: true });
    waitingDialog.hide();
}

function cellStyleDestination(value, row, index) {
    var classes = [
        'bg-amarillo',
        'bg-rojo',
        'bg-verde'
    ];

    if (row.EstadoDestination === 0 && row.validateDestination != "") {
        return {
            classes: classes[1],
            css: {
                color: 'black'
            }
        };
    } else if (row.EstadoDestination === 2 && row.validateDestination != "") {
        return {
            classes: classes[0],
            css: {
                color: 'black'
            }
        };
    }

    return {
        css: {
            color: 'black',
        }
    };
}

function cellStyleSources(value, row, index) {
    var classes = [
        'bg-amarillo',
        'bg-rojo',
        'bg-verde'
    ];

    if (row.EstadoSource === 0 && row.validateSource != "") {
        return {
            classes: classes[1],
            css: {
                color: 'black'
            }
        };
    } else if (row.EstadoSource === 2 && row.validateSource != "") {
        return {
            classes: classes[0],
            css: {
                color: 'black'
            }
        };
    }

    return {
        css: {
            color: 'black',
        }
    };
}

function InitAutocompletar($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API_VISTA + `/GetAssetsByName?name=${request.term}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (data) {
                        response($.map(data, function (item) {
                            return { Id: item.id, Value: `${item.name} - ${item.guest_agent_details.os_details.os_display_name}` };
                        }));
                    },
                    async: true,
                    global: false
                });
            } else {
                return response(true);
            }
        },
        focus: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Value);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Value);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Value + "</font></a>").appendTo(ul);
    };
}

function InitAutocompletarDestination($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API_VISTA + `/GetDestinationByName?name=${request.term}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (data) {
                        response($.map(data, function (item) {
                            return { Id: item.Id, Value: `${item.Descripcion}` };
                        }));
                    },
                    async: true,
                    global: false
                });
            } else {
                return response(true);
            }
        },
        focus: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Value);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Value);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Value + "</font></a>").appendTo(ul);
    };
}

function InitAutocompletarAplicaciones($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API_VISTA + `/GetAplicacionesByMatricula?filtro=${request.term}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (data) {
                        response($.map(data, function (item) {
                            return { Id: item.Id, Value: `${item.Descripcion}` };
                        }));
                    },
                    async: true,
                    global: false
                });
            } else {
                return response(true);
            }
        },
        focus: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Value);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Value);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Value + "</font></a>").appendTo(ul);
    };
}


function typeFormatter(value, row, index, field) {
    let styleColor = value == "SUCCESSFUL" ? 'iconoVerde' : 'iconoRojo';

    return `<label class="${styleColor}">${value}</label>`;
}

function slotFormater(value, row, index, field) {
    var fecha = new Date(value);
    return fecha.toLocaleDateString("es-PE") + " " + fecha.toLocaleTimeString();
}

function validarPorts() {
    $.validator.addMethod(
        "regex",
        function (value, element, regexp) {
            var re = new RegExp(regexp);
            return this.optional(element) || re.test(value);
        },
        "Solo se aceptan numeros (maximo 5 digitos) y comas"
    );

    $("#txtPorts").rules("add", { regex: "^[0-9]{1,5}(,[0-9]{1,5})*$" })
}

function validarReporteFiltros() {

    $.validator.methods.ValidMaxDate = function (value, element) {
        let fechaMin = $("#FechaFiltroDesde").val().split(" ")[0];
        if (fechaMin) {
            fechaMin = dateFromString(fechaMin);
            let fechaMax = dateFromString(value);
            return fechaMin <= fechaMax;
        }
        return true;
    };

    $.validator.methods.ValidMinDate = function (value, element) {
        let fechaMax = $("#FechaFiltroHasta").val().split(" ")[0];
        if (fechaMax) {
            fechaMax = dateFromString(fechaMax);
            let fechaMin = dateFromString(value);
            return fechaMin <= fechaMax;
        }
        return true;
    };

    $.validator.methods.ValidDate = function (value, element) {
        try {
            let fecha = dateFromString(value);
            let fechaMinima = new Date();
            fechaMinima.setFullYear(fechaMinima.getFullYear() - 1000);
            return fechaMinima <= fecha;
        }
        catch (ex) {
            return false;
        }
    };

    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            FechaFiltroDesde: {
                required: true,
                ValidDate: true,
                ValidMinDate: true
            },
            FechaFiltroHasta: {
                required: true,
                ValidDate: true,
                ValidMaxDate: true
            }
        },
        messages: {
            FechaFiltroDesde: {
                required: "Debe seleccionar una fecha",
                ValidDate: "Debe seleccionar una fecha válida",
                ValidMinDate: "Debe ingresar una fecha menor a la fecha hasta"
            },
            FechaFiltroHasta: {
                required: "Debe seleccionar una fecha",
                ValidDate: "Debe seleccionar una fecha válida",
                ValidMaxDate: "Debe ingresar una fecha mayor a la fecha desde"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "FechaFiltroDesde" || element.attr('name') === "FechaFiltroHasta") {
                element.parent().parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function Exportar() {
    //waitingDialog.show("Procesando ...", { dialogSize: "sm", progressType: "warning" });

    var texto = "Solo es posible exportar como máximo 10 mil registros y de una antiguedad no mayor a los 60 días";
    $("#textoModal").html(texto);

    modalExportar(true);

    //$.ajax({
    //    method: "POST",
    //    url: `${URL_API_VISTA}/Reporte/TotalFilasFiltroReporte`,
    //    data: {
    //        "tipo": $("#cbType").val() == null ? "" : $("#cbType").val().join(),
    //        "accion": $("#cbAction").val() == null ? "" : $("#cbAction").val().join(),
    //        "appOrigen": $("#ddlEtiquetaOrigen").val() == null ? "" : $("#ddlEtiquetaOrigen").val().join(),
    //        "appDestino": $("#ddlEtiquetaDestino").val() == null ? "" : $("#ddlEtiquetaDestino").val().join(),
    //        "ambOrigen": $("#cbAmbOri").val() == null ? "" : $("#cbAmbOri").val().join(),
    //        "ambDestino": $("#cbAmbDes").val() == null ? "" : $("#cbAmbDes").val().join(),
    //        "puertos": $("#txtPorts").val(),
    //        "fromTime": convertDateTime($("#FechaFiltroDesde").val()).getTime(),
    //        "toTime": convertDateTime($("#FechaFiltroHasta").val()).getTime()
    //    },
    //    success: function (data) {
    //        sessionStorage.setItem("total_reporte", data);
    //        var texto = data < 100000 ? "" : " <br> (*)Solo es posible exportar como máximo 100 mil registros y de una antiguedad no mayor a los 60 días";
    //        $("#textoModal").html("Cantidad de registros a exportar: " + data + texto);
    //    },
    //    complete: function () {
    //        waitingDialog.hide();
    //        modalExportar(true);
    //    }
    //});
}

function modalExportar(modal) {
    if (modal)
        $("#mdEditarTab2").modal(opcionesModal);
    else
        $("#mdEditarTab2").modal("hide");
}

function GenerarReporteGuardicore() {
    waitingDialog.show("Procesando solicitud...", { dialogSize: "sm", progressType: "warning" });
    $("#pbEstado").remove();
    $("#modal-procesando .modal-body .progress-bar").empty();
    $("#modal-procesando .modal-body .progress-bar").css('width', '100%');

    idExportar = "";

    var maxExportar = 10000;
    if (cantRealExportar < 10000) {
        maxExportar = cantRealExportar;
    }

    $.ajax({
        method: "POST",
        url: `${URL_API_VISTA}/Reporte/ExportarGuardicoreCSV`,
        data: {
            "tipo": $("#cbType").val() == null ? "" : $("#cbType").val().join(),
            "accion": $("#cbAction").val() == null ? "" : $("#cbAction").val().join(),
            "appOrigen": $("#ddlEtiquetaOrigen").val() == null ? "" : $("#ddlEtiquetaOrigen").val().join(),
            "appDestino": $("#ddlEtiquetaDestino").val() == null ? "" : $("#ddlEtiquetaDestino").val().join(),
            "ambOrigen": $("#cbAmbOri").val() == null ? "" : $("#cbAmbOri").val().join(),
            "ambDestino": $("#cbAmbDes").val() == null ? "" : $("#cbAmbDes").val().join(),
            "puertos": $("#txtPorts").val(),
            "fromTime": convertDateTime($("#FechaFiltroDesde").val()).getTime(),
            "toTime": convertDateTime($("#FechaFiltroHasta").val()).getTime(),
            "total": maxExportar
        },
        success: function (data) {
            idExportar = data;
        },
        error: function (error) {
            alert(JSON.parse(error.responseText)["ExceptionMessage"]);
        },
        complete: _ => {
            $("#modal-procesando .modal-header h3").empty();
            $("#modal-procesando .modal-header h3").html("Estado de la solicitud...");
            EstadoProcesoExportar();
        }
    });
}

var getEstadoGuardicore = async idExportar => {
    const response = await fetch(`${URL_API_VISTA}/Reporte/ExportarGuardicoreCSV/Estado?id=${idExportar}`);
    return await response.json();
}

var EstadoProcesoExportar = _ => {
    var result = getEstadoGuardicore(idExportar).then(values => {
        var html = "";
        html += '<label id="pbEstado">Cargados: ' + parseInt(values["cargado"]) + ' Total: ' + parseInt(values["total"]) + '</label>';
        $("#pbEstado").remove();
        $("#modal-procesando .modal-body").append(html);

        var porcentaje = (parseInt(values["cargado"]) * 100) / parseInt(values["total"]);

        $("#modal-procesando .modal-body .progress-bar").empty();
        $("#modal-procesando .modal-body .progress-bar").html(porcentaje.toFixed(0) + '%');
        $("#modal-procesando .modal-body .progress-bar").css('width', porcentaje + '%');

        return parseInt(values["cargado"]) < parseInt(values["total"]) ? "1" : values["datos"];
    });

    result.then(values => {
        if (values === "1") {
            EstadoProcesoExportar();
        } else {
            $("#modal-procesando .modal-header h3").empty();
            $("#modal-procesando .modal-header h3").html("Preparando archivo csv...");

            $.ajax({
                method: "GET",
                url: `${URL_API_VISTA}/Reporte/ExportarGuardicoreCSV/Prepare?estado=${values}`,
                success: function (data) {
                    $("#modal-procesando .modal-header h3").empty();
                    $("#modal-procesando .modal-header h3").html("Descargando archivo...");

                    var byteCharacters = atob(data);
                    var byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    var byteArray = new Uint8Array(byteNumbers);
                    var blob = new Blob([byteArray], { type: 'application/octet-stream' });

                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    var fileName = "ReporteGuardicoreVsCvt.csv";
                    link.download = fileName;
                    link.click();

                    modalExportar(false);
                },
                error: function (error) {
                    if (error.status == 500) {
                        alert("No es posible exportar los datos en este momento");
                    } else {
                        alert(JSON.parse(error.responseText)["ExceptionMessage"]);
                    }
                },
                complete: function () {
                    waitingDialog.hide();
                    modalExportar(false);
                }
            });
        }
    });
}