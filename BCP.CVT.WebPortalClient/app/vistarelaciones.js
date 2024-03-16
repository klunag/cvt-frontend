var $table = $("#tblRegistro");
var $tableApExp = $("#tblApExp");
var URL_API_VISTA = URL_API + "/Relacion";
var URL_API_AMBIENTE = URL_API + "/Equipo";
var URL_API_APLICACION = URL_API + "/Aplicacion";
var TEXTO_MENSAJE = "Vista por relaciones";
var TIPO_EQUIPO_ID_CD = 0;


var DATA_EXPORTAR = {};
const arrMultiSelect = [
    { SelectId: "#cbAmbiente", DataField: "Ambiente" },
    { SelectId: "#ddlPCI", DataField: "TipoPCI" },
    { SelectId: "#cbEstadoFiltro", DataField: "Estado" }

];
const INIT_FILTER_ESTADO = [0, 1, 2];
$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));
    CargarParametroCD();
    cargarCombos();

    $tableApExp.bootstrapTable("destroy");
    $tableApExp.bootstrapTable({ data: [] });

    InitAutocompletarBuilder($("#txtEquipo"), null, ".containerFiltro", "/Equipo/GetEquipoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtJefe"), null, ".containerFiltroJefe", "/Aplicacion/GetJefeEquipoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtAplicacion"), $("#hAplicacion"), ".containerFiltroAplicacion", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtGestionado"), null, ".containerFiltroGestionadoPor", "/Aplicacion/GetGestionadoByFiltro?filtro={0}");

    setDefaultHd($("#txtAplicacion"), $("#hAplicacion"));
    //listarRegistros();
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({ data: [] });

    //$("#cbEstadoFiltro").val(INIT_FILTER_ESTADO);
    //$("#cbEstadoFiltro").multiselect("refresh");
    //SetItemsMultiple([], $("#cbEstadoFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
    cargarComboEstado();

    $("#cbEstadoFiltro").val(INIT_FILTER_ESTADO);
    $("#cbEstadoFiltro").multiselect("refresh");

    //if (FLAG_ADMIN == 1) {
    //    listarRegistros();
    //} else {
    //    $table.bootstrapTable({ data: [] });
    //}

});

function CargarParametroCD() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GetCertificadoDigitalID`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    TIPO_EQUIPO_ID_CD = dataObject.parametro;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function Buscar() {
    listarRegistros();
}

function listarRegistros() {

    if (validarSeleccionUnFiltro()) {

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA + "/Listado/AplicacionServidor",
            method: 'POST',
            pagination: true,
            sidePagination: "server",
            queryParamsType: "else",

            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            sortName: "CodigoApt",
            sortOrder: "asc",
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.Aplicacion = $("#hAplicacion").val() !== "0" ? $("#hAplicacion").val() : $("#txtAplicacion").val();
                DATA_EXPORTAR.Equipo = $("#txtEquipo").val();
                DATA_EXPORTAR.AmbienteIds = $.isArray($("#cbAmbiente").val()) ? $("#cbAmbiente").val().join("|") : ""; // CaseIsNullSendFilter($("#cbAmbiente").val());
                DATA_EXPORTAR.Jefe = $("#txtJefe").val();
                DATA_EXPORTAR.GestionadoPor = $("#txtGestionado").val();
                DATA_EXPORTAR.PCIS = $.isArray($("#ddlPCI").val()) ? $("#ddlPCI").val().join("|") : "";//CaseIsNullSendFilter($("#ddlPCI").val());
                DATA_EXPORTAR.RelacionAplicacion = $("#cbRelacionAplicacion").val() == -1 ? "" : $("#cbRelacionAplicacion").val();//parseInt($("#cbRelacionAplicacion").val());
                DATA_EXPORTAR.EstadoId = $.isArray($("#cbEstadoFiltro").val()) ? $("#cbEstadoFiltro").val().join("|") : "";//CaseIsNullSendFilter($("#cbEstadoFiltro").val());
                DATA_EXPORTAR.TipoRelacion = $("#cbTipoRelacion").val() == -1 ? "" : $("#cbTipoRelacion").val();//parseInt($("#cbTipoRelacion").val());
                DATA_EXPORTAR.pageNumber = p.pageNumber;
                DATA_EXPORTAR.pageSize = p.pageSize;
                DATA_EXPORTAR.sortName = p.sortName;
                DATA_EXPORTAR.sortOrder = p.sortOrder;

                return JSON.stringify(DATA_EXPORTAR);
            },
            responseHandler: function (res) {
                waitingDialog.hide();
                var data = res;
                var total = data.Total;
                if (total == 0 && FLAG_ADMIN != 1)
                    bootbox.alert("Su usuario no está autorizado a la aplicación o equipo que intentas consultar. Comuníquese con el Jefe de Equipo/Experto de la aplicación que necesitas consultar para que te brinde el acceso correspondiente, solo es necesario compartir tu matrícula para que pueda autorizar el acceso correspondiente.");

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

}


function validarSeleccionUnFiltro() {
    var rpta = true;

    //if (FLAG_ADMIN != 1) {

    //    var filtro1 = $("#txtAplicacion").val();
    //    var filtro2 = $("#txtJefe").val();
    //    var filtro3 = $("#txtGestionado").val();
    //    var filtro4 = $("#txtEquipo").val();

    //    if (filtro1 == "" && filtro2 == "" && filtro3 == "" && filtro4 == "") {
    //        rpta = false;
    //        bootbox.alert("Debe usar por lo menos un filtro más");
    //    }


    //}

    return rpta;
}


function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_AMBIENTE + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //FILTROS MULTISELECT
                    SetDataToSelectMultiple(arrMultiSelect, dataObject);
                    //SetItems(dataObject.Ambiente, $("#cbAmbiente"), TEXTO_TODOS);

                    SetDataToSelectMultiple(arrMultiSelect, dataObject);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function cargarComboEstado() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    SetItems(dataObject.RelacionAplicacion, $("#cbRelacionAplicacion"), TEXTO_TODOS);
                    //FILTROS MULTISELECT 
                    //SetItemsMultiple(dataObject.Estado, $("#cbEstadoFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetDataToSelectMultiple(arrMultiSelect, dataObject);
                    SetItems(dataObject.TiposRelacionApps, $("#cbTipoRelacion"), TEXTO_TODOS);


                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}


function linkFormatterName(value, row, index) {
    if (FLAG_DETALLE == 1)
        return `<a href="javascript:VerAutorizadores('${row.CodigoApt}')" title="Ver usuarios expertos">${value}</a>`;
    else
        return value;
}

function linkFormatterAplicacion(value, row, index) {
    if (FLAG_DETALLE == 1)
        return `<a href="DetalleAplicacion?Id=${row.CodigoApt}" title="Ver detalle de la aplicación" target="_blank">${value}</a>`;
    else
        return value;
}

function linkFormatterEquipo(value, row, index) {
    if (FLAG_DETALLE == 1) {
        if (row.EstadoId == 0 || row.EstadoId == 2) {
            var opcion = "";
            if (row.TipoEquipoId != TIPO_EQUIPO_ID_CD) {
                opcion = `<a href="DetalleEquipo?id=${row.EquipoId}" title="Ver detalle del Equipo / Activo TI" target="_blank">${value}</a>`;
            } else {
                opcion = `<a href="DetalleCertificadoD?id=${row.EquipoId}" title="Ver detalle del Equipo / Activo TI" target="_blank">${value}</a>`;
            }

            return opcion;
        }
        else
            return value;
    }
    else
        return value;
}

function VerAutorizadores(codigoApt) {
    $("#titleForm").html("Responsables de la aplicación");
    $.ajax({
        url: URL_API_APLICACION + `/ObtenerAplicacionExperto?Id=${codigoApt}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        dataType: "json",
        success: function (result) {
            MdAddOrEditRegistro(true);
            $tableApExp.bootstrapTable("destroy");
            $tableApExp.bootstrapTable({ data: result });
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function MdAddOrEditRegistro(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    if (EstadoMd)
        $("#MdAddOrEditModal").modal(opcionesModal);
    else
        $("#MdAddOrEditModal").modal("hide");
}

function LimpiarMdAddOrEditRegistro() {
    $tableApExp.bootstrapTable("destroy");
    $tableApExp.bootstrapTable({ data: [] });
    toastr.clear();
}

function ExportarInfo() {
    if (validarSeleccionUnFiltro()) {
        let _data = $table.bootstrapTable("getData") || [];
        if (_data.length === 0) {
            MensajeNoExportar(TEXTO_MENSAJE);
            return false;
        }
        DATA_EXPORTAR.AmbienteIds = CaseIsNullSendExport(DATA_EXPORTAR.AmbienteIds);
        DATA_EXPORTAR.EstadoId = CaseIsNullSendExport(DATA_EXPORTAR.EstadoId);
        //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre == null ? '' : DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&criticidadId=${DATA_EXPORTAR.CriticidadId}&gerencia=${DATA_EXPORTAR.Gerencia == null ? '' : DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division == null ? '' : DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad == null ? '' : DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area == null ? '' : DATA_EXPORTAR.Area}`;
        let url = `${URL_API_VISTA}/ExportarVistaPorRelaciones?Aplicacion=${DATA_EXPORTAR.Aplicacion}&Equipo=${DATA_EXPORTAR.Equipo}&AmbienteId=${DATA_EXPORTAR.AmbienteIds}&Jefe=${DATA_EXPORTAR.Jefe}&GestionadoPor=${DATA_EXPORTAR.GestionadoPor}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&pci=${DATA_EXPORTAR.PCIS}&RelacionAplicacion=${DATA_EXPORTAR.RelacionAplicacion}&estadoId=${DATA_EXPORTAR.EstadoId}&TipoRelacion=${DATA_EXPORTAR.TipoRelacion}`;
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

}