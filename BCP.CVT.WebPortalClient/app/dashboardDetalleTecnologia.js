var URL_API_VISTA = URL_API + "/Dashboard/Tecnologia";
var URL_API_VISTA2 = URL_API + "/Dashboard";
var DATA_SUBDOMINIO = [];
var DATA_TIPOEQUIPO = [];
var $table = $("#tblRegistroObsolescencia");
var $tableAplicacion = $("#tblRegistroAplicacion");
var $tableEquipo = $("#tblRegistroEquipo");
var $tableEquipoDetalle = $("#tblEquipoDetalle");
var TIPO_SELECCION_LINK = { TODOS: 0, OBSOLETO: 1, POR_VENCER: 2, VIGENTE: 3, INDEFINIDA: 4 };
var TIPO_EQUIPO_LINK = { TODOS: 0, SERVIDOR: 1, SERVIDOR_AGENCIA: 2, PC: 3 };
var TITULO_MENSAJE = "Estado, uso e instalaciones";
var $tblDetalleEquipoByTecnologia = $("#tblDetalleEquipoByTecnologia");
var $tblAplicacionDetalle = $("#tblAplicacionDetalle");

$(function () {
    SetItemsMultiple([], $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    if (FLAG_ADMIN === 1) {
        SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
    } else {
        SetItemsMultiple([], $("#cbFilSubdominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    }


    $table.bootstrapTable();
    $tableAplicacion.bootstrapTable();
    $tableEquipo.bootstrapTable();

    CargarCombos();
    initFecha();
    MethodValidarFecha(RANGO_DIAS_HABILES);
    validarCampos();

    $("#cbFilDominio").change(CargarCombosDominio);
    $("#cbFilSubdominio").change(LimpiarFormFiltros);
});

function LimpiarFormFiltros() {
    LimpiarValidateErrores($("#formFiltros"));
}

function CargarCombosDominio() {
    let idsDominio = $.isArray($(this).val()) ? $(this).val() : [$(this).val()];
    if (idsDominio !== null) {
        $.ajax({
            url: URL_API_VISTA + "/ListarCombos/Dominio",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(idsDominio),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {

                        if (FLAG_ADMIN == 1) {
                            SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_TODOS, TEXTO_TODOS, true);
                        } else {
                            $("#cbFilSubdominio").prop("multiple", "");
                            SetItemsMultiple(dataObject.Subdominio, $("#cbFilSubdominio"), TEXTO_SELECCIONE, "", true, false);
                            $("#cbFilSubdominio").val('').multiselect("refresh");
                        }


                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function () {

            },
            async: true
        });
    }

    LimpiarValidateErrores($("#formFiltros"));
}

function initFecha() {
    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});
    _BuildDatepicker($("#FechaFiltro"));
}

function validarCampos() {
    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbFilDominio: {
                requiredSelect: true
            },
            cbFilSubdominio: {
                requiredSelect: true
            },
            FechaFiltro: {
                required: true,
                isDate: true,
                FechaPrevia: true,
                FechaMaxima: true
            }
        },
        messages: {
            cbFilDominio: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "dominio")
            },
            cbFilSubdominio: {
                requiredSelect: String.Format("Debes seleccionar el {0}.", "subdominio")
            },
            FechaFiltro: {
                required: "Debe seleccionar una fecha",
                isDate: "Debe ingresar una fecha valida",
                FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbFilSubdominio" || element.attr('name') === "cbFilDominio" || element.attr('name') === "FechaFiltro") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function ActualizarReporte() {
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        $("#divGraficos").show();
        listarRegistros();
        listarRegistrosAplicacion();
        listarRegistrosEquipo();
    }
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Detalle",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'TotalTecnologias',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SubdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : $("#cbFilSubdominio").val() != "" ? [$("#cbFilSubdominio").val()] : "";
            DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
            DATA_EXPORTAR.OwnerFiltro = $("#txtFilOwner").val();
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
        }
    });
}

function listarRegistrosAplicacion() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableAplicacion.bootstrapTable('destroy');
    $tableAplicacion.bootstrapTable({
        url: URL_API_VISTA + "/Aplicacion",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'TotalAplicacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SubdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : $("#cbFilSubdominio").val() != "" ? [$("#cbFilSubdominio").val()] : "";
            DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
            DATA_EXPORTAR.OwnerFiltro = $("#txtFilOwner").val();
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
        }
    });
}

function listarRegistrosEquipo() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableEquipo.bootstrapTable('destroy');
    $tableEquipo.bootstrapTable({
        url: URL_API_VISTA + "/Equipo",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'TotalInstalaciones',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SubdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : $("#cbFilSubdominio").val() != "" ? [$("#cbFilSubdominio").val()] : "";
            DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
            DATA_EXPORTAR.OwnerFiltro = $("#txtFilOwner").val();
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
        }
    });
}

function CargarCombos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    if (FLAG_ADMIN == 1) {
                        SetItemsMultiple(dataObject.Dominio, $("#cbFilDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
                    } else {
                        $("#cbFilDominio").prop("multiple", "");
                        SetItemsRadio(dataObject.Dominio, $("#cbFilDominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
                        $("#cbFilDominio").val('').multiselect("refresh");
                    }

                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            waitingDialog.hide();
        }
        //async: false
    });
}

function TotalTecnologiasLinkFormatter(value, row, index) {
    return `<a href="#" onclick="IrVerDetalleEquipos('${row.Nombre}', ${TIPO_SELECCION_LINK.TODOS})" title="Ver detalle de equipos" >${value}</a>`;
}

function ObsoletoLinkFormatter(value, row, index) {
    return `<a href="#" style="color:red;" onclick="IrVerDetalleEquipos('${row.Nombre}', ${TIPO_SELECCION_LINK.OBSOLETO})" title="Ver detalle de equipos" >${value}</a>`;
}

function PorVencerLinkFormatter(value, row, index) {
    return `<a href="#" style="color:#FFBE03;" onclick="IrVerDetalleEquipos('${row.Nombre}', ${TIPO_SELECCION_LINK.POR_VENCER})" title="Ver detalle de equipos" >${value}</a>`;
}

function VigenteLinkFormatter(value, row, index) {
    return `<a href="#" style="color:#22A71C;" onclick="IrVerDetalleEquipos('${row.Nombre}', ${TIPO_SELECCION_LINK.VIGENTE})" title="Ver detalle de equipos" >${value}</a>`;
}

function IndefinidaLinkFormatter(value, row, index) {
    return `<a href="#" style="color:#22A71C;" onclick="IrVerDetalleEquipos('${row.Nombre}', ${TIPO_SELECCION_LINK.INDEFINIDA})" title="Ver detalle de equipos" >${value}</a>`;
}

function rojoFormatter(value, row, index) {
    return `<span style=\"color:red;\">${value}</span>`;
}

function amarilloFormatter(value, row, index) {
    return `<span style=\"color:#FFBE03;\">${value}</span>`;
}

function verdeFormatter(value, row, index) {
    return `<span style=\"color:#22A71C;\">${value}</span>`;
}

function ExportarData() {
    LimpiarValidateErrores($("#formFiltros"));
    if ($("#formFiltros").valid()) {
        var subdominioFiltrar = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val().join() : $("#cbFilSubdominio").val() != "" ? [$("#cbFilSubdominio").val()] : "";
        var fecha = $("#FechaFiltro").val();
        var owner = $("#txtFilOwner").val();

        let url = `${URL_API_VISTA}/Detalle/Exportar?fecha=${fecha}&subdominios=${subdominioFiltrar}&owner=${owner}`;
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

function IrVerDetalleEquipos(tecnologia, indexObs) {

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableEquipoDetalle.bootstrapTable('destroy');
    $tableEquipoDetalle.bootstrapTable({
        url: URL_API_VISTA + "/Detalle/Equipos",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.TecnologiaFiltrar = tecnologia;
            DATA_EXPORTAR.FechaConsulta = dateFromString($("#FechaFiltro").val());
            DATA_EXPORTAR.SubdominiosId = $.isArray($("#cbFilSubdominio").val()) ? $("#cbFilSubdominio").val() : $("#cbFilSubdominio").val() != "" ? [$("#cbFilSubdominio").val()] : "";
            DATA_EXPORTAR.Owner = $("#txtFilOwner").val();
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            DATA_EXPORTAR.IndexObs = indexObs;

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
        onLoadSuccess: function (data) {
            $("#mdDetalleEquipo").modal('show');
        },
    });

}

function TotalInstalacionesLinkFormatter(value, row, index) {
    return `<a href="javascript:VerListadoDetalleEquipos(${value}, ${TIPO_EQUIPO_LINK.TODOS}, '${row.FechaFiltro}', '${row.SubdominioToString}', '${row.Owner}', '${row.Fabricante}', '${row.Nombre}')" title="Ver detalle equipos">${value}</a>`;
}

function TotalServidoresLinkFormatter(value, row, index) {
    return `<a href="javascript:VerListadoDetalleEquipos(${value}, ${TIPO_EQUIPO_LINK.SERVIDOR}, '${row.FechaFiltro}', '${row.SubdominioToString}', '${row.Owner}', '${row.Fabricante}', '${row.Nombre}')" title="Ver detalle equipos">${value}</a>`;
}

function TotalServidoresAgenciaLinkFormatter(value, row, index) {
    return `<a href="javascript:VerListadoDetalleEquipos(${value}, ${TIPO_EQUIPO_LINK.SERVIDOR_AGENCIA}, '${row.FechaFiltro}', '${row.SubdominioToString}', '${row.Owner}', '${row.Fabricante}', '${row.Nombre}')" title="Ver detalle equipos">${value}</a>`;
}

function TotalPCsLinkFormatter(value, row, index) {
    return `<a href="javascript:VerListadoDetalleEquipos(${value}, ${TIPO_EQUIPO_LINK.PC}, '${row.FechaFiltro}', '${row.SubdominioToString}', '${row.Owner}', '${row.Fabricante}', '${row.Nombre}')" title="Ver detalle equipos">${value}</a>`;
}

function VerListadoDetalleEquipos(value, TipoEquipoId, FechaFiltro, SubdominioToString, Owner, Fabricante, Nombre) {
    if (value > 0) {
        listarDetalleEquipos(TipoEquipoId, FechaFiltro, SubdominioToString, Owner, Fabricante, Nombre);
    } else {
        bootbox.alert({
            size: "sm",
            title: TITULO_MENSAJE,
            message: "No existen registros.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    }
}

//function castDate3(cadena) {
//    var ts = new Date(cadena);
//    return ts.toLocaleDateString();
//}

function listarDetalleEquipos(TipoEquipoId, FechaFiltro, SubdominioToString, Owner, Fabricante, Nombre) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblDetalleEquipoByTecnologia.bootstrapTable('destroy');
    $tblDetalleEquipoByTecnologia.bootstrapTable({
        url: URL_API_VISTA + "/Equipo/ByTecnologia",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SubdominioToString = SubdominioToString;
            DATA_EXPORTAR.FechaFiltro = FechaFiltro;
            DATA_EXPORTAR.OwnerFiltro = Owner;
            DATA_EXPORTAR.TipoEquipoId = TipoEquipoId;
            DATA_EXPORTAR.FabricanteTec = Fabricante;
            DATA_EXPORTAR.NombreTec = Nombre;
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
        onLoadSuccess: function (data) {
            $("#mdDetalleEquipoByTecnologia").modal('show');
        }
    });
}


function TotalAplicacionLinkFormatter(value, row, index) {
    return `<a href="javascript:VerListadoDetalleAplicacion(${value}, '${row.FechaFiltro}', '${row.SubdominioToString}', '${row.Owner}', '${row.Fabricante}', '${row.Nombre}')" title="Ver detalle aplicaciones">${value}</a>`;
}

function VerListadoDetalleAplicacion(value, FechaFiltro, SubdominioToString, Owner, Fabricante, Nombre) {
    if (value > 0) {
        listarDetalleAplicacion(FechaFiltro, SubdominioToString, Owner, Fabricante, Nombre);
    } else {
        bootbox.alert({
            size: "sm",
            title: TITULO_MENSAJE,
            message: "No existen registros.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    }
}

function listarDetalleAplicacion(FechaFiltro, SubdominioToString, Owner, Fabricante, Nombre) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblAplicacionDetalle.bootstrapTable('destroy');
    $tblAplicacionDetalle.bootstrapTable({
        url: URL_API_VISTA + "/Aplicacion/ByTecnologia",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SubdominioToString = SubdominioToString;
            DATA_EXPORTAR.FechaFiltro = FechaFiltro;
            DATA_EXPORTAR.OwnerFiltro = Owner;
            //DATA_EXPORTAR.TipoEquipoId = TipoEquipoId;
            DATA_EXPORTAR.FabricanteTec = Fabricante;
            DATA_EXPORTAR.NombreTec = Nombre;
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
        onLoadSuccess: function (data) {
            $("#mdDetalleAplicacion").modal('show');
        }
    });
}
