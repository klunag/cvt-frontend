var $table = $('#tblRegistro');

var URL_API_VISTA = URL_API + "/Guardicore/Fase2/Tab2";

$(function () {
    InitAutocompletarAplicacion($("#txtFilApp"), $("#hdFilAppId"), ".filAppContainer", 0);
    Listar();
});

function RefrescarListado() {
    Listar();
}

function Listar() {
    var info = [{
        codigoapp: "AIBM",
        cantSiEsta: 1,
        cantNoEsta: 2,
        fechaescaneo: "2021-27-7"
    }];

    Nivel1(info);
}

function Nivel1(data) {
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        data: data,
        pagination: true,
        detailView: true,
        showFooter: false,
        onExpandRow: function (index, row, $detail) {
            Nivel2($detail.html('<table></table>').find('table'));
        }
    });
}

function Nivel2($detail) {

    var columns = [];

    columns.push({
        formatter: 'opcionesFormatter',
        title: 'Opciones'
    });

    columns.push({
        field: 'ip',
        title: 'Ip'
    });

    columns.push({
        field: 'servidor',
        title: 'Nombre del Servidor'
    });

    columns.push({
        field: 'origen',
        title: 'Origen'
    });

    columns.push({
        field: 'fecha',
        title: 'Fecha Escaneo'
    });

    columns.push({
        field: 'estado',
        title: 'Estado'
    });

    $detail.bootstrapTable({
        columns: columns,
        data: [{
            ip: "128.0.0.1",
            servidor: "nombre servidor",
            origen: "128.0.0.1",
            fecha: "2021-27-7",
            estado: "Activo"
        }],
        pagination: true,
        detailView: false,
        showFooter: false
    });
}

function dateFormat2(value, row, index) {
    if (value != null && value != '') {
        return moment(value).format('DD/MM/YYYY HH:mm:ss');
    }
    return "-";
}

function opcionesFormatter(value, row, index) {
    let btn1 = `<a href="javascript:dataDetalle('${row.CodigoAPT}')" title="Confirmar Validación"><i class="glyphicon glyphicon-ok"></i></a>`;
    let btn2 = `<a href="javascript:ModalHistorial('${row.CodigoAPT}');" title="Historial de movimiento de la aplicación"><i class="glyphicon glyphicon-file"></i></a>`;
    return btn1.concat("&nbsp;&nbsp;", btn2);
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