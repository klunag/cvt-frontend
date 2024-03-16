var URL_API_VISTA = URL_API + "/Alerta";
var $tblTecnologiasPorVencer = $("#tblTecnologiasPorVencer");
var DATA_EXPORTAR = {};

$(function () {   
    ListarValores();
    //ListarTecnologiasPorVencer();
});

function ListarValores() {

    if (localStorage.getItem('token') == null) {
        return false;
    }

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/Indicadores",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {                    
                    $("#spanTecnologias").html(dataObject.Tecnologias);
                    $("#spanEquipos").html(dataObject.Equipos);
                    $("#spanRelaciones").html(dataObject.Relaciones);
                    $("#spanAplicaciones").html(dataObject.Aplicaciones);

                    $("#title-table").html(String.Format("Tecnologías vencidas o por vencer en los próximos {0} meses que son usadas por las aplicaciones", dataObject.NroMesesTecnologiaPorVencer));

                    //let dataTecnologiasPorVencer = dataObject.TecnologiaDetalle;
                    //if (dataTecnologiasPorVencer.length > 0) {
                    //    $(".divTecnologiasPorVencer").show();
                    //    $tblTecnologiasPorVencer.bootstrapTable("destroy");
                    //    $tblTecnologiasPorVencer.bootstrapTable({
                    //        data: dataTecnologiasPorVencer,
                    //        pagination: true,
                    //        pageNumber: 1,
                    //        pageSize: 10
                    //    });
                    //} else {
                    //    $(".divTecnologiasPorVencer").hide();
                    //}
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            //ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function ListarTecnologiasPorVencer() {
    $tblTecnologiasPorVencer.bootstrapTable('destroy');
    $tblTecnologiasPorVencer.bootstrapTable({
        url: URL_API_VISTA + "/TecnologiasPorVencer",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'TotalAplicaciones',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.subdominio = "";
            DATA_EXPORTAR.tecnologia = "";
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            if (data.Total > 0) {
                $(".divTecnologiasPorVencer").show();
            } else {
                $(".divTecnologiasPorVencer").hide();
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

function rowStyle(row, index) {
    var classes = [
        'bg-orange'
    ];

    if (index % 2 === 0 /*&& index / 2 <= classes.length*/) {
        return {
            classes: classes[0]
        };
    }
    return {
        css: {
            color: 'black',
            background: '#ffedd6'
        }
    };
}