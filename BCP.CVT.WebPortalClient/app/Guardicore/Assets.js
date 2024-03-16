var $table = $("#tbRegistros");
var URL_API_VISTA = URL_API + "/Guardicore";

$(function () {
    InitAutocompletar($("#txtBusEq"), $("#hdBusEqId"), ".containerFiltro", 0);
    buscarEquipo();
    $('[data-toggle="tooltip"]').tooltip();
    $table.removeClass("table-hover");
});

function buscarEquipo(){
    ListarAssets(
        $("#txtBusEq").val() == "" ? "" : $("#hdBusEqId").val()
    );
}

function ListarAssets(equipo) {

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        //url: URL_API_VISTA + "/GetAssets",
        //method: 'GET',
        ajax: "ListarAssetsGuardicore",
        pagination: true,
        sidePagination: 'server',
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        //ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },        
        queryParams: function (p) {
            return JSON.stringify({
                equipoId: equipo,
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

function rowStyle(row, index) {
    var classes = [
        'bg-amarillo',
        'bg-rojo',
        'bg-verde'
    ];

    if (row.estado === 0) {
        return {
            classes: classes[1],
            css: {
                color: 'black'
            }
        };
    } else if (row.estado === 2) {
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

function ListarAssetsGuardicore(params) {
    let tmp_params = JSON.parse(params.data);
    let urlnuevo = URL_API_VISTA + `/GetAssets?pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&equipoId=${tmp_params.equipoId}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(urlnuevo).then(function (res) {
        params.success(res)
    });
}

function EstadoFormatter(value, row) {
   
    if (row.estado === 0) {
        icono = "<span class='glyphicon glyphicon-remove text-danger' data-toggle='tooltip' data-placement='right' title='El equipo no se encuentra en el catalogo de CVT'></span>"
    } else if (row.estado === 1) {
        icono = "<span class='glyphicon glyphicon-ok text-success' data-toggle='tooltip' data-placement='right' title='Se encuentra en el catalogo de CVT'></span>"
    } else {
        icono = "<span class='glyphicon glyphicon-question-sign  text-warning' title='El equipo se encuentra inactivo en el catalogo de CVT'></span>"
    }

    return icono;
}

function getJson(data) {
    try {
        return JSON.parse(data);
    } catch (ex) {
        alert('Wrong JSON Format: ' + ex);
    }
}

function formatearFecha(value, row, index, field) {
   
    return moment(parseInt(value)).format("DD/MM/YYYY hh:mm a");
}
function ipFormatter(value, row, index, field) {
    return value.join(", ");
}

function labelsFormatter(value, row, index, field) {
    let labels = [].map.call(value, function (e) { return e.name });
    return labels.join(", ");
}

function statusFormatter(value, row, index, field) {
    let text = value === "on" ? "Prendido" : "Apagado";
    return text;
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