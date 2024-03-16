var $tableRegistroApps = $("#tblRegistroApps");
var $table = $("#tblDetalleAplicacion");
var URL_API_VISTA = URL_API + "/Portafolio";
var DATA_EXPORTAR = {};
var DATA_EXPORTAR_DETALLE = {};
//const CABECERAS_TABLE_REPORTE = ["Vigente", "", "", "", "", "", "", "", "", "En Desarrollo"];
const CABECERAS_TABLE_REPORTE = ["2", "", "", "", "", "", "", "", "", "1"];
/*const ARR_ON_PREMISE = "File Server|Hosting Externo|Local|Pc Usuario|Plataforma tecnológica|Servidor|Servidor Autogestionado|Servidores AIO|Servidor Propio";*/
const ARR_ON_PREMISE = "File Server|Hosting Externo|Local|Pc Usuario|Plataforma tecnológica|Servidor|Servidor Autogestionado|Servidores AIO|Servidor Propio|AUTOGESTIONADO|TERCERIZADO (NO CLOUD)|NO APLICA - SUBSIDIARIA|ON PREMISE";
const ARR_ON_CLOUD = "Cloud - IaaS|Cloud - PaaS|Cloud - SaaS";
const arrMultiSelect = [
    { SelectId: "#cbFiltroGerencia", DataField: "GestionadoPor" },
    { SelectId: "#cbFiltroDivision", DataField: "EstadoAplicacion" },
    { SelectId: "#cbFiltroUnidad", DataField: "TipoActivo" },
    { SelectId: "#cbFiltroArea", DataField: "Gerencia" },
    { SelectId: "#cbFiltroEstado", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlClasificacionTecnica", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlSubclasificacionTecnica", DataField: "ClasificacionTecnica" },
    { SelectId: "#cbFiltroCapaFuncional", DataField: "CapaFuncional" }
];

$(function () {
    $tableRegistroApps.bootstrapTable({ data: [] });
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    CargarCombos();
    //ListarRegistrosEstados();
    ListarRegistrosEstadosBT();

});

function RefrescarListado() {
    //ListarRegistrosEstados();
    ListarRegistrosEstadosBT();
}

function ListarRegistrosEstados() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    let Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val());

    $.ajax({
        url: URL_API_VISTA + "/ReporteEstado?Gerencia=" + Gerencia,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        //data: JSON.stringify(Gerencia),        
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    $('#tblRegistroApps tbody').empty();
                    let data = dataObject.Rows;
                    $.each(data, function () {
                        $('#tblRegistroApps tbody').append('<tr>' +
                            '<td class="fondoAzul">' + this.Categoria + '</td>' +
                            '<td class="centerBold fondoGris">' + this.TotalVigentes + '</td>' +
                            '<td class="centerBold">' + this.AppsOnPremise + '</td>' +
                            '<td class="centerBold">' + this.AppsOnCloud + '</td>' +
                            '<td class="centerBold">' + this.AppsObsolescenciaOnPremise + '</td>' +
                            '<td class="centerBold">' + this.AppsObsolescenciaOnCloud + '</td>' +
                            '<td class="centerBold">' + this.AppsDesarrolladasOnPremise + '</td>' +
                            '<td class="centerBold">' + this.AppsDesarrolladasOnCloud + '</td>' +
                            '<td class="centerBold">' + this.AppsPaquetesOnPremise + '</td>' +
                            '<td class="centerBold">' + this.AppsPaquetesOnCloud + '</td>' +
                            '<td class="centerBold fondoBlanco">' + this.TotalEnDesarrollo + '</td>' +
                            '</tr>');
                    });
                }
            }
        },
        complete: function () {
            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: true
    });
}

function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Aplicacion/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let arrfiltroGerencia = dataObject.Filtro.split(";");

                    SetItemsMultiple(dataObject.Gerencia, $("#cbFiltroGerencia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Division, $("#cbFiltroDivision"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Unidad, $("#cbFiltroUnidad"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Area, $("#cbFiltroArea"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.ClasificacionTecnica, $("#ddlClasificacionTecnica"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.SubclasificacionTecnica, $("#ddlSubclasificacionTecnica"), TEXTO_TODOS, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.Estado.filter(x => x !== "Eliminada"), $("#cbFiltroEstado"), TEXTO_TODOS, TEXTO_TODOS, true);

                    SetItemsMultiple(dataObject.CapaFuncional, $("#cbFiltroCapaFuncional"), TEXTO_TODOS, TEXTO_TODOS, true);


                    let newfiltro = dataObject.Gerencia.filter(x => !arrfiltroGerencia.includes(x));
                    $("#cbFiltroGerencia").val(newfiltro);
                    $("#cbFiltroGerencia").multiselect("refresh");


                    let newfiltroCf = dataObject.CapaFuncional.filter(x => x != '-');
                    $("#cbFiltroCapaFuncional").val(newfiltroCf);
                    $("#cbFiltroCapaFuncional").multiselect("refresh");



                    //$("#cbFiltroEstado").val(["Vigente"]);
                    //$("#cbFiltroEstado").multiselect("refresh");
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function ListarRegistrosEstadosBT() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableRegistroApps.bootstrapTable('destroy');
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val());
    DATA_EXPORTAR.CapaFuncional = CaseIsNullSendExport($("#cbFiltroCapaFuncional").val());

    $.ajax({
        url: URL_API_VISTA + "/ReporteEstado/BT",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(DATA_EXPORTAR),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    $tableRegistroApps.bootstrapTable({
                        data: dataObject.Rows
                    })
                }
            }
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            waitingDialog.hide();
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function linkFormatter(value, row, index) {
    let retorno = "";
    if (value === 0) {
        retorno = value;
    } else {
        retorno = `<a class="like" href="javascript:void(0)" title="Ver aplicaciones">${value}</a>`;
    }
    return retorno;
}

function linkFormatterTotal(value, row, index) {
    let retorno = "";
    if (value === 0) {
        retorno = value;
    } else {
        retorno = `<a class="total" href="javascript:void(0)" title="Ver aplicaciones">${value}</a>`;
    }
    return retorno;
}

function linkFormatterInfraestructuraTotal(value, row, index) {
    let retorno = "";
    if (value === 0) {
        retorno = value;
    } else {
        retorno = `<a class="infraestructuraTotal" href="javascript:void(0)" title="Ver aplicaciones">${value}</a>`;
    }
    return retorno;
}

function linkFormatterDesaOnPremise(value, row, index) {
    let retorno = "";
    let clasificacionFiltro = row.CapaFuncional;
    if (value === 0) {
        retorno = value;
    } else {
        retorno = `<a href="javascript:VerDetalle('${clasificacionFiltro}',1,1)" title="Ver aplicaciones">${value}</a>`;
    }
    return retorno;
}

function linkFormatterDesaOnCloud(value, row, index) {
    let retorno = "";
    let clasificacionFiltro = row.CapaFuncional;
    if (value === 0) {
        retorno = value;
    } else {
        retorno = `<a href="javascript:VerDetalle('${clasificacionFiltro}',2,1)" title="Ver aplicaciones">${value}</a>`;
    }
    return retorno;
}

function linkFormatterPaqOnPremise(value, row, index) {
    let retorno = "";
    let clasificacionFiltro = row.CapaFuncional;
    if (value === 0) {
        retorno = value;
    } else {
        retorno = `<a href="javascript:VerDetalle('${clasificacionFiltro}',1,2)" title="Ver aplicaciones">${value}</a>`;
    }
    return retorno;
}

function linkFormatterPaqOnCloud(value, row, index) {
    let retorno = "";
    let clasificacionFiltro = row.CapaFuncional;
    if (value === 0) {
        retorno = value;
    } else {
        retorno = `<a href="javascript:VerDetalle('${clasificacionFiltro}',2,2)" title="Ver aplicaciones">${value}</a>`;
    }
    return retorno;
}

function linkFormatterObsOnPremise(value, row, index) {
    let retorno = "";
    let clasificacionFiltro = row.CapaFuncional;
    if (value === 0) {
        retorno = value;
    } else {
        retorno = `<a href="javascript:VerDetalleObsolescencia('${clasificacionFiltro}',1)" title="Ver aplicaciones">${value}</a>`;
    }
    return retorno;
}

function linkFormatterObsOnCloud(value, row, index) {
    let retorno = "";
    let clasificacionFiltro = row.CapaFuncional;
    if (value === 0) {
        retorno = value;
    } else {
        retorno = `<a href="javascript:VerDetalleObsolescencia('${clasificacionFiltro}',2)" title="Ver aplicaciones">${value}</a>`;
    }
    return retorno;
}

function VerDetalle(clasificacion, tipoInfraestructura, tipoDesarrollo) {
    //Tipo infraestructura: 1=OnPremise | 2=OnCloud
    //Tipo desarrollo: 1=Desarrollado | 2=Paquete 
    if (clasificacion == "Total") {
        if (CaseIsNullSendExport($("#cbFiltroCapaFuncional").val()) != "")
            clasificacion = CaseIsNullSendExport($("#cbFiltroCapaFuncional").val());
    }
    listarDetalleDesarrollo($("#mdDetalleAplicacion"), clasificacion, tipoDesarrollo, tipoInfraestructura, "/ReporteEstado/InfraestructuraDesarrolloDetalle");
}

function VerDetalleObsolescencia(clasificacion, tipoInfraestructura) {
    //Tipo infraestructura: 1=OnPremise | 2=OnCloud    
    if (clasificacion == "Total") {
        if (CaseIsNullSendExport($("#cbFiltroCapaFuncional").val()) != "")
            clasificacion = CaseIsNullSendExport($("#cbFiltroCapaFuncional").val());
    }
     
    listarDetalleObsolescencia($("#mdDetalleAplicacion"), clasificacion, tipoInfraestructura, "/ReporteEstado/ObsolescenciaDetalle");
}

window.operateEvents = {
    'click .total': function (e, value, row, index) {
        let idx = $(this).parent().index() - 1;
        let estadoFiltro = CABECERAS_TABLE_REPORTE[idx];
        let clasificacionFiltro = row.CapaFuncional;
        if (clasificacionFiltro == "Total") {
            if (CaseIsNullSendExport($("#cbFiltroCapaFuncional").val()) != "")
                clasificacionFiltro = CaseIsNullSendExport($("#cbFiltroCapaFuncional").val());
        }
        listarDetalleAplicacion($("#mdDetalleAplicacion"), clasificacionFiltro, estadoFiltro, "", "/ReporteEstado/TotalDetalle");
    },
    'click .infraestructuraTotal': function (e, value, row, index) {
        let idx = $(this).parent().index();
        let infraestructuraFiltro = idx === 2 ? ARR_ON_PREMISE : ARR_ON_CLOUD;
        let clasificacionFiltro = row.CapaFuncional;
        if (clasificacionFiltro == "Total") {
            if (CaseIsNullSendExport($("#cbFiltroCapaFuncional").val()) != "")
                clasificacionFiltro = CaseIsNullSendExport($("#cbFiltroCapaFuncional").val());
        }
        listarDetalleAplicacion($("#mdDetalleAplicacion"), clasificacionFiltro, "", infraestructuraFiltro, "/ReporteEstado/InfraestructuraTotalDetalle");
    }
};

function listarDetalleAplicacion($md, clasificacionFiltro, estadoFiltro, infraestructuraFiltro, url) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + url,
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR_DETALLE = {};
            DATA_EXPORTAR_DETALLE.Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val());
            DATA_EXPORTAR_DETALLE.Clasificacion = clasificacionFiltro;
            DATA_EXPORTAR_DETALLE.Estado = estadoFiltro;
            DATA_EXPORTAR_DETALLE.Infraestructura = infraestructuraFiltro;
            DATA_EXPORTAR_DETALLE.pageNumber = p.pageNumber;
            DATA_EXPORTAR_DETALLE.pageSize = p.pageSize;
            DATA_EXPORTAR_DETALLE.sortName = p.sortName;
            DATA_EXPORTAR_DETALLE.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_DETALLE);
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
        onLoadSuccess: function (data) {
            OpenCloseModal($md, true);
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
    });
}

function listarDetalleDesarrollo($md, clasificacionFiltro, tipoDesarrollo, tipoInfraestructura, url) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + url,
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR_DETALLE = {};
            DATA_EXPORTAR_DETALLE.Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val());
            DATA_EXPORTAR_DETALLE.Clasificacion = clasificacionFiltro;
            DATA_EXPORTAR_DETALLE.TipoDesarrollo = tipoDesarrollo;
            DATA_EXPORTAR_DETALLE.TipoInfraestructura = tipoInfraestructura;
            DATA_EXPORTAR_DETALLE.pageNumber = p.pageNumber;
            DATA_EXPORTAR_DETALLE.pageSize = p.pageSize;
            DATA_EXPORTAR_DETALLE.sortName = p.sortName;
            DATA_EXPORTAR_DETALLE.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_DETALLE);
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
        onLoadSuccess: function (data) {
            OpenCloseModal($md, true);
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
    });
}

function listarDetalleObsolescencia($md, clasificacionFiltro, tipoInfraestructura, url) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + url,
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR_DETALLE = {};
            DATA_EXPORTAR_DETALLE.Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val());
            DATA_EXPORTAR_DETALLE.Clasificacion = clasificacionFiltro;
            DATA_EXPORTAR_DETALLE.TipoInfraestructura = tipoInfraestructura;
            DATA_EXPORTAR_DETALLE.pageNumber = p.pageNumber;
            DATA_EXPORTAR_DETALLE.pageSize = p.pageSize;
            DATA_EXPORTAR_DETALLE.sortName = p.sortName;
            DATA_EXPORTAR_DETALLE.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_DETALLE);
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
        onLoadSuccess: function (data) {
            OpenCloseModal($md, true);
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
    });
}

function ExaportarReporteInfraestructura() {
    let _data = $tableRegistroApps.bootstrapTable("getData") || [];
    //ListarRegistrosEstadosBT();

    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR.Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val());
    DATA_EXPORTAR.CapaFuncional = CaseIsNullSendExport($("#cbFiltroCapaFuncional").val());
    DATA_EXPORTAR.sortName = DATA_EXPORTAR.sortName === null || DATA_EXPORTAR.sortName === "" ? "Id" : DATA_EXPORTAR.sortName;
    DATA_EXPORTAR.sortOrder = DATA_EXPORTAR.sortOrder === null || DATA_EXPORTAR.sortOrder === "" ? "asc" : DATA_EXPORTAR.sortOrder;

    let url = `${URL_API_VISTA}/ExportarInfraestructuraObsolecencia?management=${DATA_EXPORTAR.Gerencia}&functionalLayer=${DATA_EXPORTAR.CapaFuncional}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;

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