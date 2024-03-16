var URL_API_VISTA = URL_API + "/Dashboard/Estandares";
var $table = $("#tblConsolidados");
var TIPO_CONSOLIDADO = { APLICACIONES: 1, TECNOLOGIAS: 2, RELACIONES: 3, SERVIDORES: 4 };
var TITULO_MENSAJE = "Consolidados";

$(function () {
    InitConsolidados();
});

function InitConsolidados() {
    $table.bootstrapTable("destroy");
    $table.bootstrapTable();
    $table.bootstrapTable('append', { TipoConsolidadoId: TIPO_CONSOLIDADO.APLICACIONES, TipoConsolidado: "Aplicaciones" });
    $table.bootstrapTable('append', { TipoConsolidadoId: TIPO_CONSOLIDADO.RELACIONES, TipoConsolidado: "Relaciones" });
    $table.bootstrapTable('append', { TipoConsolidadoId: TIPO_CONSOLIDADO.TECNOLOGIAS, TipoConsolidado: "Tecnologías" });
    $table.bootstrapTable('append', { TipoConsolidadoId: TIPO_CONSOLIDADO.SERVIDORES, TipoConsolidado: "Servidores y Servidores de Agencia" });
}

function opciones(value, row, index) {
    //let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let style_color = "iconoVerde";
    let type_icon = "download-alt";
    let estado = `<a href="javascript:DescargarArchivo(${row.TipoConsolidadoId})" title="Descargar consolidado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return estado;
}

function DescargarArchivo(Id) {
    if (ExisteArchivo(Id)) {
        let url = `${URL_API_VISTA}/DescargarConsolidado?tipoId=${Id}`;
        window.location.href = url;
    } else {
        bootbox.alert({
            size: "sm",
            title: TITULO_MENSAJE,
            message: "No se encontro el archivo",
            callback: function () { /* your callback code */ }
        });
    }
    
}

function ExisteArchivo(Id) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ExisteArchivoConsolidado?Id=${Id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    estado = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return estado;
}