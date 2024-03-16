var $table = $("#tblUrlAplicacion");
var $table2 = $("#tblUrlAplicacion2");
var $table3 = $("#tblUrlAplicacion3");
var $table4 = $("#tblUrlAplicacion4");
var $tblAppsCandidatas = $("#tblAppsCandidatas");
var DATA_EXPORTAR = {};
var DATA_EXPORTAR2 = {};
var DATA_EXPORTAR3 = {};
var locale = { OK: 'OK', CONFIRM: 'Aceptar', CANCEL: 'Cancelar' };

const URL_API_VISTA = URL_API + "/Alerta/UrlAplicacion";
const TITULO_MENSAJE = "Urls Aplicación";

$(function () {
    InitBT();
    InitDTP();
    InitCargarCombos();

    InitAutocompletarBuilder($("#txtFilAplicacion"), $("#hAplicacion"), ".appContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtFilEquipo"), null, ".containerFiltro", "/Equipo/GetEquipoByFiltro?filtro={0}");

    $("#btnBuscar").click(RefreshList);
    $("#btnBuscar2").click(RefreshList2);
    $("#btnBuscar3").click(RefreshList3);
    $("#btnBuscar4").click(RefreshList3);

    $("#btnExportar").click(ExportarInfo);
    $("#btnExportar2").click(ExportarInfo2);
    $("#btnExportar3").click(ExportarInfo3);
    $("#btnExportar4").click(ExportarInfo3);

    ListRecords();
    ListRecords2();
    ListRecords3();
});

const InitDTP = () => {
    $("#dpFecConsulta-btn, #dpFecConsulta-btn2, #dpFecConsulta-btn3").datetimepicker({
        locale: 'es',
        useCurrent: true,
        format: 'DD/MM/YYYY'
    });
};

const InitBT = () => {
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({ data: [] });
    $table2.bootstrapTable('destroy');
    $table2.bootstrapTable({ data: [] });
    $table3.bootstrapTable('destroy');
    $table3.bootstrapTable({ data: [] });
    $table4.bootstrapTable('destroy');
    $table4.bootstrapTable({ data: [] });
    $tblAppsCandidatas.bootstrapTable('destroy');
    $tblAppsCandidatas.bootstrapTable({ data: [] });
};

function RefreshList() {
    ListRecords();
}

function RefreshList2() {
    ListRecords2();
}

function RefreshList3() {
    ListRecords3();
}

function RefreshList4() {
    ListRecords3();
}

function ListRecords(IsOrphan = false) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
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
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Equipo = $.trim($("#txtFilEquipo").val());
            DATA_EXPORTAR.Aplicacion = $.trim($("#hAplicacion").val());
            DATA_EXPORTAR.FuenteId = $("#ddlFilFuente").val();
            DATA_EXPORTAR.IsOrphan = IsOrphan;
            DATA_EXPORTAR.IsActive = true;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

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
        },
        onExpandRow: function (index, row, $detail) {
            $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("destroy");
            $('#tblRegistrosDetalle_' + row.Id).bootstrapTable({data: []});
            $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("showLoading");

            let data = ListarRegistrosDetalle(row.Id);
            if (data.length > 0) {
                console.log(data);
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("destroy");
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable({
                    data: data
                });
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("hideLoading");
            } else {
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("hideLoading");
                $detail.empty().append("No existe registros");
            }
        }
    });
}

function ListRecords2(IsOrphan = true) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table2.bootstrapTable('destroy');
    $table2.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
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
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Equipo = $.trim($("#txtFilEquipo2").val());
            DATA_EXPORTAR.URL = $.trim($("#txtFilURL").val());
            DATA_EXPORTAR.FuenteId = $("#ddlFilFuente2").val();
            DATA_EXPORTAR.IsOrphan = IsOrphan;
            DATA_EXPORTAR.IsActive = true;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

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
        },
        onExpandRow: function (index, row, $detail) {
            $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("destroy");
            $('#tblRegistrosDetalle_' + row.Id).bootstrapTable({ data: [] });
            $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("showLoading");

            let data = ListarRegistrosDetalle(row.Id);
            if (data.length > 0) {
                console.log(data);
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("destroy");
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable({
                    data: data
                });
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("hideLoading");
            } else {
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("hideLoading");
                $detail.empty().append("No existe registros");
            }
        }
    });
}

function ListRecords3() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table3.bootstrapTable('destroy');
    $table3.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
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
            DATA_EXPORTAR3 = {};
            DATA_EXPORTAR3.Equipo = $.trim($("#txtFilEquipo3").val());
            DATA_EXPORTAR3.Fecha = dateFromString($("#txtFilFecha3").val());
            DATA_EXPORTAR3.FuenteId = $("#ddlFilFuente3").val();
            DATA_EXPORTAR3.IsOrphan = null;
            DATA_EXPORTAR3.IsActive = false;
            DATA_EXPORTAR3.pageNumber = p.pageNumber;
            DATA_EXPORTAR3.pageSize = p.pageSize;
            DATA_EXPORTAR3.sortName = p.sortName;
            DATA_EXPORTAR3.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR3);
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
        },
        onExpandRow: function (index, row, $detail) {
            $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("destroy");
            $('#tblRegistrosDetalle_' + row.Id).bootstrapTable({ data: [] });
            $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("showLoading");

            let data = ListarRegistrosDetalle(row.Id);
            if (data.length > 0) {
                console.log(data);
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("destroy");
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable({
                    data: data
                });
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("hideLoading");
            } else {
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("hideLoading");
                $detail.empty().append("No existe registros");
            }
        }
    });
}

function InitCargarCombos() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject;
                    SetItems(data.UrlFuente, $("#ddlFilFuente"), TEXTO_TODOS);
                    SetItems(data.UrlFuente, $("#ddlFilFuente2"), TEXTO_TODOS);
                    SetItems(data.UrlFuente, $("#ddlFilFuente3"), TEXTO_TODOS);
                    SetItems(data.UrlFuente, $("#ddlFilFuente4"), TEXTO_TODOS);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function detailFormatter(index, row) {
    let html = `<table id="tblRegistrosDetalle_${row.Id}"  data-mobile-responsive="true">
                            <thead>
                                <tr>
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="2%">#</th>
                                    <th data-field="NombreEquipo" data-sortable="false" data-halign="center" data-valign="middle" data-align="left">Equipo</th>
                                    <th data-field="TemporalToString" data-sortable="false" data-halign="center" data-valign="middle" data-align="left">Tipo de Descubrimiento</th>
                                    <th data-field="IP" data-sortable="false" data-halign="center" data-valign="middle" data-align="left" data-width="20%">IP</th>
                                    <th data-field="FechaCreacionFormato" data-sortable="false" data-halign="center" data-valign="middle" data-align="center" data-width="10%">Fecha de creación</th>
                                </tr>
                            </thead>
                        </table>`;

    return html;
}

function ListarRegistrosDetalle(Id) {
    let data = [];
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ListarDetalle/${Id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                data = dataObject;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return data;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let html = `<a href="javascript:CambiarEstado(${row.Id}, ${row.Activo})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return html;
}

function opcionesTab2(value, row, index) {
    let style_color = 'iconoVerde ';
    let type_icon = "th-list";
    let html = `<a href="javascript:VerAppsCandidatas(${row.Id})" title="Ver aplicaciones candidatas"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return html;
}

function opcionesAppsCandidatas(value, row, index) {
    let style_color = 'iconoVerde ';
    let type_icon = "link";
    let html = `<a href="javascript:VincularApps(${row.UrlAplicacionId}, '${row.CodigoAPT}')" title="Vincular aplicación"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    return html;
}

function VerAppsCandidatas(id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        url: `${URL_API_VISTA}/AppsCandidatas?id=${id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {                    
                    waitingDialog.hide();

                    let _data = dataObject;
                    $tblAppsCandidatas.bootstrapTable('destroy');
                    $tblAppsCandidatas.bootstrapTable({
                        data: _data,
                        pagination: true,
                        pageNumber: 1,
                        pageSize: 10
                    });
                }
            }
            else {
                toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            OpenCloseModal($("#mdAppsCandidatas"), true);
        }
    });
}

function VincularApps(id, codigoAPT) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        url: `${URL_API_VISTA}/ActualizarAplicacion?id=${id}&codigoAPT=${codigoAPT}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    OpenCloseModal($("#mdAppsCandidatas"), false);
                    toastr.success("Se vinculo la aplicación correctamente", TITULO_MENSAJE);
                    ListRecords2();
                }
            }
            else {
                toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            var error = JSON.parse(xhr.responseText);
        }
    });
}



function CambiarEstado(Id, FlagActivo) {
    let message = FlagActivo ? "desactivar" : "activar";

    bootbox.addLocale('custom', locale);
    bootbox.prompt({
        title: TITULO_MENSAJE,
        message: `<p>¿Estas seguro que deseas ${message} el registro seleccionado?, de ser asi por favor ingrese los comentarios al respecto:</p>`,
        inputType: 'textarea',
        rows: '5',
        locale: 'custom',
        callback: function (result) {
            ChangeStateCallBack(Id, result);
        }
    });

}

function ChangeStateCallBack(id, result) {
    if (result === null) {
        return false;
    }

    let comments = $.trim(result);
    if (comments === "") {
        toastr.error("Debes ingresar el comentario.", TITULO_MENSAJE);
        return;
    }

    if (comments.length > 500) {
        toastr.error("El comentario no debe superar los 500 carácteres.", TITULO_MENSAJE);
        return;
    }

    $.ajax({
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        url: `${URL_API_VISTA}/CambiarEstado?id=${id}&comentario=${comments}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                    ListRecords();
                    ListRecords3();
                }
            }
            else {
                toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            var error = JSON.parse(xhr.responseText);
        }
    });
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let fechaConsulta = $.trim($("#txtFilFecha").val()) === "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#txtFilFecha").val())).format("YYYY-MM-DD");

    DATA_EXPORTAR.Equipo = $.trim($("#txtFilEquipo").val());
    DATA_EXPORTAR.Fecha = fechaConsulta;
    DATA_EXPORTAR.FuenteId = $("#ddlFilFuente").val();
    DATA_EXPORTAR.IsOrphan = false;
    DATA_EXPORTAR.IsActive = true;
    //DATA_EXPORTAR.sortName = p.sortName;
    //DATA_EXPORTAR.sortOrder = p.sortOrder;

    let url = `${URL_API_VISTA}/Exportar?equipo=${DATA_EXPORTAR.Equipo}&fecha=${DATA_EXPORTAR.Fecha}&fuenteId=${DATA_EXPORTAR.FuenteId}&isOrphan=${DATA_EXPORTAR.IsOrphan}&isActive=${DATA_EXPORTAR.IsActive}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function ExportarInfo2() {
    let _data = $table2.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let fechaConsulta = $.trim($("#txtFilFecha2").val()) === "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#txtFilFecha2").val())).format("YYYY-MM-DD");

    DATA_EXPORTAR.Equipo = $.trim($("#txtFilEquipo2").val());
    DATA_EXPORTAR.Fecha = fechaConsulta;
    DATA_EXPORTAR.FuenteId = $("#ddlFilFuente2").val();
    DATA_EXPORTAR.IsOrphan = true;
    DATA_EXPORTAR.IsActive = true;
    //DATA_EXPORTAR.sortName = p.sortName;
    //DATA_EXPORTAR.sortOrder = p.sortOrder;

    let url = `${URL_API_VISTA}/Exportar?equipo=${DATA_EXPORTAR.Equipo}&fecha=${DATA_EXPORTAR.Fecha}&fuenteId=${DATA_EXPORTAR.FuenteId}&isOrphan=${DATA_EXPORTAR.IsOrphan}&isActive=${DATA_EXPORTAR.IsActive}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function ExportarInfo3() {
    let _data = $table3.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let fechaConsulta = $.trim($("#txtFilFecha3").val()) === "" ? moment(new Date()).format("YYYY-MM-DD") : moment(dateFromString($("#txtFilFecha3").val())).format("YYYY-MM-DD");

    DATA_EXPORTAR3.Equipo = $.trim($("#txtFilEquipo3").val());
    DATA_EXPORTAR3.Fecha = fechaConsulta;
    DATA_EXPORTAR3.FuenteId = $("#ddlFilFuente3").val();
    DATA_EXPORTAR3.IsOrphan = null;
    DATA_EXPORTAR3.IsActive = false;
    //DATA_EXPORTAR.sortName = p.sortName;
    //DATA_EXPORTAR.sortOrder = p.sortOrder;

    let url = `${URL_API_VISTA}/Exportar?equipo=${DATA_EXPORTAR3.Equipo}&fecha=${DATA_EXPORTAR3.Fecha}&fuenteId=${DATA_EXPORTAR3.FuenteId}&isOrphan=${DATA_EXPORTAR3.IsOrphan}&isActive=${DATA_EXPORTAR3.IsActive}&sortName=${DATA_EXPORTAR3.sortName}&sortOrder=${DATA_EXPORTAR3.sortOrder}`;
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


