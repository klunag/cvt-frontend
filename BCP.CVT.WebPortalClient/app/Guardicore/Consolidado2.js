var $tableCoinciden = $('#tblRegistro');
var $tableNoCoinciden = $('#tblRegistro2');
var URL_API_VISTA = URL_API + "/Guardicore";
var CONSOLE = "";

const comboMultiSelect = [
    { SelectId: "#cbEstado", DataField: "Estado" }
];

$(function () {
    InitSelectMultiple(comboMultiSelect.map(x => x.SelectId));
    CargarCombosGuardicore();
    InitAutocompletarAplicacion($("#txtFilApp"), $("#hdFilAppId"), ".filAppContainer", 0); //Filtro App
    InitAutocompletarBuilder($("#txtGestionado"), null, ".containerFiltroGestionadoPor", "/Aplicacion/GetGestionadoByFiltro?filtro={0}");
    Listar();
});

function CargarCombosGuardicore() {
    let url = URL_API_VISTA + '/ConsolidadoFilter';
    $.get(url).then(function (arreglo) {
        SetItemsMultiple(arreglo.estado.filter(x => x !== "" && x !== null), $("#cbEstado"), TEXTO_TODOS, TEXTO_TODOS, true);

        var array = [];
        $("#cbEstado option").each(function () {
            array.push($(this).val());
        });

        $("#cbEstado").val(array);
        $("#cbEstado").multiselect("refresh");
        $('div[data-toggle="match-height"] .btn-group').attr("style", "width: 100%");
    });
}

function Listar() {
    let apps = $("#txtFilApp").val() != "" ? $("#hdFilAppId").val() : "";
    let gestionado = $("#txtGestionado").val() != "" ? $("#txtGestionado").val() : "";
    let estado = ($("#cbEstado").val() || []).join(',');
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/Reporte/Consolidado2/tab1?estado=${estado}&apps=${apps}&gest=${gestionado}`,
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                ListarNivel1(data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        async: true
    });
}

function ListarNivel1(datos) {
    $tableCoinciden.bootstrapTable('destroy');
    $tableCoinciden.bootstrapTable({
        data: datos.Rows,
        pagination: true,
        detailView: true,
        showFooter: false,
        onExpandRow: function (index, row, $detail) {
            ListarTab1Nivel2($detail, row.codigoapp);
        }
    });
}

function ListarTab1Nivel2($detail, app) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/Reporte/Consolidado2/tab1/nivel2?estado=-&apps=${app}&gest=-`,
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                EstructuraTab1Nivel2($detail.html('<table></table>').find('table'),data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        async: true
    });
}

function EstructuraTab1Nivel2($el, datos) {
    var columns = [];

    columns.push({
        field: 'EquipoOrigen',
        title: 'Equipo Origen'
    });

    columns.push({
        field: 'IpOrigen',
        title: 'Ip Origen'
    });

    columns.push({
        field: 'EquipoDestino',
        title: 'Equipo Destino'
    });

    columns.push({
        field: 'IpDestino',
        title: 'Ip Destino'
    });

    columns.push({
        field: 'EstadoCVT',
        title: 'Esta en CVT'
    });

    $el.bootstrapTable({
        columns: columns,
        data: datos.Rows,
        pagination: true,
        detailView: false,
        showFooter: false
    });

}


function ListarTab2() {
    let apps = $("#txtFilApp").val() != "" ? $("#hdFilAppId").val() : "";
    let gestionado = $("#txtGestionado").val() != "" ? $("#txtGestionado").val() : "";
    let estado = ($("#cbEstado").val() || []).join(',');
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/Reporte/Consolidado2/tab2?estado=${estado}&apps=${apps}&gest=${gestionado}`,
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                ListarTab2Nivel1(data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        async: true
    });
}

function ListarTab2Nivel1(datos) {
    $tableNoCoinciden.bootstrapTable('destroy');
    $tableNoCoinciden.bootstrapTable({
        data: datos.Rows,
        detailView: true,
        pagination: true,
        showFooter: false,
        onExpandRow: function (index, row, $detail) {
            ListarTab2Nivel2($detail.html('<table></table>').find('table'),row.codigoapp);
        }
    });
}

function ListarTab2Nivel2($el, app) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/Reporte/Consolidado2/tab2/nivel2?apps=${app}`,
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            if (result != null) {
                data = result;
                EstructuraTab2Nivel2($el,data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            data = [];
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        async: true
    });
}

function EstructuraTab2Nivel2($el, datos) {
    var columns = [];

    columns.push({
        field: 'EquipoOrigen',
        title: 'Equipo CVT'
    });

    columns.push({
        field: 'IpOrigen',
        title: 'Ip CVT'
    });

    $el.bootstrapTable({
        columns: columns,
        data: datos.Rows,
        pagination: true,
        detailView: false,
        showFooter: false
    });

}

function dominioFormatter() {
    return '<strong>Total General</strong>';
}

function subdominioFormatter(data) {
    var field = this.field;
    var suma = data.map(function (row) {
        return +row[field];
    }).reduce(function (sum, i) {
        return sum + i;
    }, 0);

    return '<strong>' + suma + '</strong>';
}

function nombreReporteFormatter(value, row, index) {
    return `<a href="#">${value}</a>`;
}

function RefrescarListado() {
    var tab = $("#tabsC li.active");
    if (tab.attr("id") == "tab1") {
        Listar();
    } else if (tab.attr("id") == "tab2") {
        ListarTab2();
    }
}

function InitAutocompletarAplicacion($searchBox, $IdBox, $container, valor) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API + "/Aplicacion/GetAplicacionRelacionarByFiltro?filtro=" + request.term,
                    //data: JSON.stringify({
                    //    filtro: request.term
                    //}),
                    //dataType: "json",
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_APLICACION = data;
                        response($.map(data, function (item) {
                            return item;
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
            //$searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $searchBox.val(ui.item.label);
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.label);
            if (valor === 1) {
                obtenerEquiposByAppVinculo(ui.item.Id);
                //LimpiarValidateErrores($("#formAppVin"));
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function Exportar() {
    let apps = $("#hdFilAppId").val();
    let gestionado = $("#txtGestionado").val();
    let estado = ($("#cbEstado").val() || []).join(',');
    let url = `${URL_API_VISTA}/Reporte/Exportar2?estado=${estado}&apps=${apps}&gest=${gestionado}`;
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