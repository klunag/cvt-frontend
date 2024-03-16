var $table = $("#tblRegistro");
var $tableApExp = $("#tblApExp");
var URL_API_VISTA = URL_API + "/Aplicacion";
var URL_API_VISTA_ADMIN = URL_API + "/applicationportfolio";

var URL_API_VISTA_PORTAFOLIO = URL_API + "/Aplicacion/Portafolio";
var URL_API_USUARIO = URL_API + "/Usuario";
var URL_API_GESTION = URL_API + "/Aplicacion/GestionAplicacion";
var ITEMS_REMOVEID = [];
var ITEMS_ADDID = [];
var DATA_MATRICULA = [];
var FLAG_TENEMOS_MATRICULA = false;
var DATA_EXPORTAR = {};
var USUARIO_DATOS = {};
var COLUMNAS_TABLE = [];
var TITULO_MENSAJE = "Reporte de aplicaciones";
var TABLA_PROCEDENCIA = { APP_PORTAFOLIO:4 };

const arrMultiSelect = [
    { SelectId: "#cbFiltroGerencia", DataField: "GestionadoPor" },
    { SelectId: "#cbFiltroDivision", DataField: "EstadoAplicacion" },
    { SelectId: "#cbFiltroUnidad", DataField: "TipoActivo" },
    { SelectId: "#cbFiltroArea", DataField: "Gerencia" },
    { SelectId: "#cbFiltroEstado", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlClasificacionTecnica", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlSubclasificacionTecnica", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlTipoActivo", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlPCI", DataField: "ClasificacionTecnica" },

    { SelectId: "#ddlGestionadoPor", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlLiderUsuario", DataField: "ClasificacionTecnica" }

];

$(function () {
    getColumnasBT();
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));

    //$table.bootstrapTable("destroy");
    //$table.bootstrapTable({ data: [] });

    $("#btnBuscar").click(RefrescarListado);
    $("#btnExportar").click(ExportarInfo);

    //$tableApExp.bootstrapTable("destroy");
    //$tableApExp.bootstrapTable({ data: [] });

    //InitAutocompletarBuilder($("#txtLiderTribu"), null, ".tribuContainer", "/Aplicacion/GetJefeEquipoByFiltro?filtro={0}");
    //InitAutocompletarBuilder($("#txtProduct"), null, ".usuarioContainer", "/Aplicacion/GetOwnerByFiltro?filtro={0}");
    //InitAutocompletarBuilder($("#txtAplicacion"), $("#hAplicacion"), ".appContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");

    //ValidarCampos();
    CargarCombos();

    if (COLUMNAS_TABLE !== null && COLUMNAS_TABLE.length > 0) {
        ListarRegistros();
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, "No existen columnas seleccionadas.");
    }

    InitAutocompletarBuilder($("#txtAplicacion"), $("#hdAplicacionId"), ".containerAplicacion", "/applicationportfolio/application/filter?filtro={0}&codigoAPT=");
    setDefaultHd($("#txtAplicacion"), $("#hdAplicacionId"));

    $("#txtAplicacion").keypress(function (event) {
        if (event.keyCode === 13) {
            $("#btnBuscar").click();
            event.preventDefault();
        }
    });
});
function CargarCombos() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA_ADMIN + "/application/admin/lists",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //let arrfiltroGerencia = dataObject.Filtro.split(";");

                    SetItemsMultiple(dataObject.Gerencia.filter(x => x !== "" && x !== null), $("#cbFiltroGerencia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Division.filter(x => x !== "" && x !== null), $("#cbFiltroDivision"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Unidad.filter(x => x !== "" && x !== null), $("#cbFiltroUnidad"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Area.filter(x => x !== "" && x !== null), $("#cbFiltroArea"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.ClasificacionTecnica.filter(x => x !== "" && x !== null), $("#ddlClasificacionTecnica"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.SubClasificacionTecnica.filter(x => x !== "" && x !== null), $("#ddlSubclasificacionTecnica"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.EstadoAplicacion.filter(x => x.Id != 4), $("#cbFiltroEstado"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TipoActivo.filter(x => x !== "" && x !== null), $("#ddlTipoActivo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TipoPCI.filter(x => x !== "" && x !== null), $("#ddlPCI"), TEXTO_TODOS, TEXTO_TODOS, true);   
                    SetItemsMultiple(dataObject.LiderUsuario.filter(x => x !== "" && x !== null), $("#ddlLiderUsuario"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.GestionadoPor.filter(x => x !== "" && x !== null), $("#ddlGestionadoPor"), TEXTO_TODOS, TEXTO_TODOS, true); 

                    //let newfiltro = dataObject.Gerencia.filter(x => !arrfiltroGerencia.includes(x) && x !== null && x !== "");
                    //$("#cbFiltroGerencia").val(newfiltro);
                    //$("#cbFiltroGerencia").multiselect("refresh");

                    //$("#cbFiltroEstado").val(["Vigente", "En Desarrollo"]);
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

function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_GESTION + "/ListarPublicacionAplicacion2",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        sortName: "CodigoAPT",
        sortOrder: "asc",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        columns: COLUMNAS_TABLE,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            DATA_EXPORTAR.Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val()); //$("#cbFiltroGerencia").val() === "-1" ? null : $("#cbFiltroGerencia").val();
            DATA_EXPORTAR.Division = CaseIsNullSendExport($("#cbFiltroDivision").val()); //$("#cbFiltroDivision").val() === "-1" ? null : $("#cbFiltroDivision").val();
            DATA_EXPORTAR.Unidad = CaseIsNullSendExport($("#cbFiltroUnidad").val()); //$("#cbFiltroUnidad").val() === "-1" ? null : $("#cbFiltroUnidad").val();
            DATA_EXPORTAR.Area = CaseIsNullSendExport($("#cbFiltroArea").val()); //$("#cbFiltroArea").val() === "-1" ? null : $("#cbFiltroArea").val();
            DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFiltroEstado").val()); //$("#cbFiltroEstado").val() === "-1" ? null : $("#cbFiltroEstado").val();
            DATA_EXPORTAR.ClasificacionTecnica = CaseIsNullSendExport($("#ddlClasificacionTecnica").val()); //$("#cbFiltroEstado").val() === "-1" ? null : $("#cbFiltroEstado").val();
            DATA_EXPORTAR.SubclasificacionTecnica = CaseIsNullSendExport($("#ddlSubclasificacionTecnica").val()); //$("#cbFiltroEstado").val() === "-1" ? null : $("#cbFiltroEstado").val();
            DATA_EXPORTAR.TipoActivo = CaseIsNullSendExport($("#ddlTipoActivo").val()); //$("#cbFiltroEstado").val() === "-1" ? null : $("#cbFiltroEstado").val();
            DATA_EXPORTAR.Aplicacion = $("#hdAplicacionId").val() !== "0" ? $("#hdAplicacionId").val() : $("#txtAplicacion").val();  //: $("#hdAplicacionId").val(); //$("#txtAplicacion").val() || ""
            DATA_EXPORTAR.GestionadoPor = CaseIsNullSendExport($("#ddlGestionadoPor").val());
            DATA_EXPORTAR.LiderUsuario = CaseIsNullSendExport($("#ddlLiderUsuario").val());
            DATA_EXPORTAR.TipoPCI = CaseIsNullSendExport($("#ddlPCI").val());
            DATA_EXPORTAR.TablaProcedencia = String.Format("{0}", TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION);
            DATA_EXPORTAR.Procedencia = TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION;
            DATA_EXPORTAR.Exportar = 0;

            //DATA_EXPORTAR.JefeEquipo = $("#txtLiderTribu").val();
            //DATA_EXPORTAR.Owner = $("#txtProduct").val();
            //DATA_EXPORTAR.Aplicacion = $("#hAplicacion").val() !== "0" ? $("#hAplicacion").val() : $("#txtAplicacion").val();

            //DATA_EXPORTAR.username = USUARIO.UserName;
            //DATA_EXPORTAR.PerfilId = USUARIO.UsuarioBCP_Dto.PerfilId;

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

function linkFormatterName(value, row, index) {
    return `<a href="#" title="Ver detalle">${value}</a>`;
}

function RefrescarListado() {
    ULTIMO_PAGE_NUMBER = 1;
    ListarRegistros();
}

//function opcionesFormatter(value, row) {
//    let style_color = row.FlagRelacionar ? 'iconoVerde ' : "iconoRojo ";
//    let type_icon = row.FlagRelacionar ? "check" : "unchecked";

//    //let editarResponsables = `<a href="javascript:IrObtenerResponsablesApExp('${value}');" title="Editar responsables"><i style="" class="glyphicon glyphicon-user table-icon"></i></a>`;
//    //let editarFlagRelacionar = `<a href="javascript:cambiarFlagRelacionar('${value}')" title="Editar condición"><i style="" id="chkRelacionar${value}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

//    //return editarFlagRelacionar.concat("&nbsp;&nbsp;", editarResponsables);
//    return "";
//}

function opcionesFormatter(value, row) {
    //let opc_link = `<a href="ReporteAplicacionDetalle?CodigoAPT=${row.CodigoAPT}" title="Ver detalle aplicación" target="_blank">${value}</a>`;
    let opc_link = value;
    return opc_link;
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val());
    DATA_EXPORTAR.Division = CaseIsNullSendExport($("#cbFiltroDivision").val());
    DATA_EXPORTAR.Unidad = CaseIsNullSendExport($("#cbFiltroUnidad").val());
    DATA_EXPORTAR.Area = CaseIsNullSendExport($("#cbFiltroArea").val());
    DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFiltroEstado").val());
    DATA_EXPORTAR.ClasificacionTecnica = CaseIsNullSendExport($("#ddlClasificacionTecnica").val());
    DATA_EXPORTAR.SubclasificacionTecnica = CaseIsNullSendExport($("#ddlSubclasificacionTecnica").val());
    DATA_EXPORTAR.TipoActivo = CaseIsNullSendExport($("#ddlTipoActivo").val());
    DATA_EXPORTAR.Aplicacion = $("#hdAplicacionId").val() !== "0" ? $("#hdAplicacionId").val() : $("#txtAplicacion").val();
    DATA_EXPORTAR.TipoPCI = CaseIsNullSendExport($("#ddlPCI").val());
    DATA_EXPORTAR.sortName = 'CodigoAPT';
    DATA_EXPORTAR.sortOrder = 'asc';
    DATA_EXPORTAR.GestionadoPor = CaseIsNullSendExport($("#ddlGestionadoPor").val());
    DATA_EXPORTAR.LiderUsuario = CaseIsNullSendExport($("#ddlLiderUsuario").val());

    //DATA_EXPORTAR.TablaProcedencia = String.Format("{0}", TABLA_PROCEDENCIA_ID.DATA_APLICACION);
    //DATA_EXPORTAR.Procedencia = TABLA_PROCEDENCIA_ID.DATA_APLICACION;

    DATA_EXPORTAR.TablaProcedencia = String.Format("{0}", TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION);
    DATA_EXPORTAR.Procedencia = TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION;

    let url = `${URL_API_VISTA}/Portafolio/Exportar2?gerencia=${DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area}&estado=${DATA_EXPORTAR.Estado}&clasificacionTecnica=${DATA_EXPORTAR.ClasificacionTecnica}&subclasificacionTecnica=${DATA_EXPORTAR.SubclasificacionTecnica}&aplicacion=${DATA_EXPORTAR.Aplicacion}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&TablaProcedencia=${DATA_EXPORTAR.TablaProcedencia}&Procedencia=${DATA_EXPORTAR.Procedencia}&TipoActivo=${DATA_EXPORTAR.TipoActivo}&TipoPCI=${DATA_EXPORTAR.TipoPCI}&Exportar=1&GestionadoPor=${DATA_EXPORTAR.GestionadoPor}&LiderUsuario=${DATA_EXPORTAR.LiderUsuario}`;
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

function getColumnasBT() {
    let tablaProcedencia = String.Format("{0}", TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION);
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_GESTION + `/GetColumnaAplicacionToJS2?tablaProcedencia=${tablaProcedencia}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //debugger;
                    COLUMNAS_TABLE = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    //return columnas;
}

//function descripcionFormatter(value, row) {
//    let formatter = "<p class='opcionesStyle'>" + value + "</p>";
//    return formatter;
//}

function descripcionFormatter(value, row) {
    let newStr = ReduceDimString(value, 105);
    let formatter = `<p class='opcionesStyle'>${newStr}</p>`;
    return formatter;
}

function generalFormatter(value, row) {
    let formatter = value;
    return formatter;
}
