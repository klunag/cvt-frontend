var URL_API_EQUIPO = URL_API + "/Equipo";
var URL_API_TECNOLOGIA = URL_API + "/Tecnologia";
var URL_API_VISTA = URL_API + "/Configuracion";
var URL_API_PRODUCTO = URL_API + "/Producto";
var $table = $("#tblEquipo");
const TITULO_MENSAJE = "Modelo de Hardware";

$(function () {
    cargarCombos();
    cargarCombosTecnologia();
    validarAddOrEditFormTec()
    InitAutocompletarGrupoTicketRemedy($("#txtRemedyModelo"), $("#hdRemedyModelo"), ".grupoTicketRemedyContainer", null);
    FormatoCheckBox($("#divFlagFechaFinSoporte"), "chkFlagFechaFinSoporte");
    $("#chkFlagFechaFinSoporte").change(FlagFechaFinSoporte_Change);
    $("#chkFlagFechaFinSoporte").trigger("change");
    InitFecha();
    listarTec();

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        if (row.NroAlertasDetalle !== 0) {
            ListarAlertasDetalle(row.idmodelo, $('#tblRegistrosDetalle_' + row.idmodelo), $detail);
        } else {
            $detail.empty().append("No existen registros.");
        }
        //ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
    });
});

function detailFormatter(index, row) {
    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="30">#</th>\
                                    <th data-formatter="codigoFormatter" data-field="CodigoEquipo" data-halign="center" data-valign="middle" data-align="left">Código de equipo</th>\
                                    <th data-field="Nombre" data-halign="center" data-valign="middle" data-align="left" data-width="200">Equipo</th>\
                                    <th data-field="NumeroSerie" data-halign="center" data-valign="middle" data-align="left">Número de serie</th>\
                                    <th data-field="Domain" data-halign="center" data-valign="middle" data-align="left">Dominio</th>\
                                    <th data-field="Ubicacion" data-halign="center" data-valign="middle" data-align="left">Ubicación</th>\
                                    <th data-field="Ambiente" data-halign="center" data-valign="middle" data-align="center" data-width="100">Ambiente</th>\
                                    <th data-field="Subsidiaria" data-halign="center" data-valign="middle" data-align="center" data-width="100">Subisidiaria</th>\
                                    <th data-field="ActivoDetalle" data-halign="center" data-valign="middle" data-align="left" data-width="100">Estado</th>\
                                    <th data-field="TemporalToString" data-halign="center" data-valign="middle" data-align="left" data-width="200">Descubrimiento</th>\
                                    <th data-field="Owner" data-halign="center" data-valign="middle" data-align="left" data-width="200">Owner</th>\
                                    <th data-field="OwnerContacto" data-halign="center" data-valign="middle" data-align="left" data-width="200">Contacto</th>\
                                </tr>\
                            </thead>\
                        </table>', row.idmodelo);
    return html;
}

function codigoFormatter(value, row, index) {
    let btn1 = '';

    if (row.CodigoEquipo == '')
        btn1 = `<a href="javascript:configurarCodigo(${row.Id},'')" title="Asignar código">Sin código asignado</a>`;
    else
        btn1 = `<a href="javascript:configurarCodigo(${row.Id},'${row.CodigoEquipo}');" title="Editar código">${row.CodigoEquipo}</a>`;

    return btn1;
}

function ListarAlertasDetalle(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ObtenerEquiposModelo",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.id = id;
            PARAMS_API.fabricante = $.trim($("#txtBusEq").val());
            PARAMS_API.nombre = $.trim($("#txtCodigoEquipoBuscar").val());
            PARAMS_API.nroSerie = $.trim($("#txtNroSerie").val());
            PARAMS_API.hostName = $.trim($("#txtHostname").val());
            PARAMS_API.tipoId = $("#cbFilTipoEq").val();
            PARAMS_API.pageNumber = p.pageNumber;
            PARAMS_API.pageSize = p.pageSize;
            PARAMS_API.sortName = p.sortName;
            PARAMS_API.sortOrder = p.sortOrder;

            return JSON.stringify(PARAMS_API);
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

function buscarEquipo() {
    listarTec();
}

function InitAutocompletarGrupoTicketRemedy($searchBox, $IdBox, $container, fn = null) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            //if (typeof fn == "function") fn();
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/applicationportfolio" + "/application/ListGroupRemedy?filtro=" + request.term,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_TECNOLOGIA = data;
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {

            //LimpiarValidateErrores($("#formTecnologia"));
            $IdBox.val(ui.item.Id);
            $IdBox.attr("data-text", ui.item.Descripcion);


            if (typeof fn == "function") fn();

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitFecha() {
    $(`#divFechaFabricanteModelo,
        #divFechaFinExtendidaModelo,
        #divFechaFinSoporteModelo,
        #divFechaFinInternaModelo`).datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
}

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_EQUIPO + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoEquipo, $("#cbFilTipoEq"), TEXTO_TODOS);
                    SetItems(dataObject.TipoEquipo, $("#cbFilTipoEqModal"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function cargarCombosTecnologia() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_TECNOLOGIA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.FechaCalculo, $("#cbFechaCalculosTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoFechaInterna, $("#cbTipoFechaInternaModelo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.SustentoMotivo, $("#cbSustentoMotivoFechaFinSoporteModelo"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function agregarModelo() {
    MostrarModalCompleto();
    $("#titleFormTec").html("Nuevo Modelo de Hardware");
    $("#hdTecnologiaId").val(''); //TODO
    limpiarMdAddOrEditTec();
    mdAddOrEditTec(true);
    //SetearClaveTecnologia();
}

function configurarCodigo(id, codigo) {
    limpiarMdAddOrEditCodigo();
    mdAddOrEditCodigo(true);
    $("#hdEquipoId").val(id);
    $("#txtCodigoEquipo").val(codigo);
    //SetearClaveTecnologia();
}

function agregarCodigo() {
    $("#btnGuardarCodigo").button("loading");
    let id = $("#hdEquipoId").val();
    let codigo = $("#txtCodigoEquipo").val();
    $.ajax({
        url: URL_API_VISTA + `/ActualizarCodigo?id=${id}&codigo=${codigo}`,
        type: "GET",
        dataType: "json",
        success: function (result) {
            bootbox.alert({
                size: "sm",
                title: "Registro",
                message: "La información se registró con éxito",
                callback: function () { /* your callback code */ }
            });
        },
        complete: function () {
            mdAddOrEditCodigo(false);
            listarTec();
            //LimpiarFiltros();
            //listarTecSTD();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function MostrarModalCompleto() {
    $(".adCicloVida").show();
}

function mdAddOrEditTec(EstadoMd) {
    //LimpiarValidateErrores($("#formAddOrEditTec"));
    if (EstadoMd)
        $("#mdAddOrEditTec").modal(opcionesModal);
    else
        $("#mdAddOrEditTec").modal('hide');
}

function mdAddOrEditCodigo(EstadoMd) {
    if (EstadoMd)
        $("#mdAddOrEditCodigo").modal(opcionesModal);
    else
        $("#mdAddOrEditCodigo").modal('hide');
}

function limpiarMdAddOrEditCodigo() {
    $("#btnGuardarCodigo").button("reset");
    $("#hdEquipoId").val(0);
    $("#txtCodigoEquipo").val("");
}

function limpiarMdAddOrEditTec() {
    $("#btnGuardarTec").button("reset");
    $("#hdModeloId").val("");
    $("#txtNombreModelo").val("");
    $("#txtFabricanteModelo").val("");
    $("#cbFilTipoEqModal").val("-1").trigger("change");
    $("#txtFechaFabricanteModelo").val("");
    $("#chkFlagFechaFinSoporte").prop("checked", false).trigger("change");;
    $("#txtFechaFinExtendidaModelo").val("");
    $("#txtFechaFinSoporteModelo").val("");
    $("#txtFechaFinInternaModelo").val("");
    $("#cbTipoFechaInternaModelo").val("-1").trigger("change");
    $("#txtComentariosFechaFinSoporteModelo").val("");
    $("#cbSustentoMotivoFechaFinSoporteModelo").val("-1");
    $("#txtSustentoUrlFechaFinSoporteModelo").val("");
    $("#txtUrlSharepointModelo").val("");
    $("#txtUrlLineamientoModelo").val("");
    $("#txtRemedyModelo").val("");
    $("#hdRemedyModelo").val("");
    $("#txtRemedyModelo").val("");
    $("#txtCategoria").val("");
    $("#txtTipo").val("");
    $("#txtItem").val("");
}

function defaultAccesoDirecto() {
    $("#mdAddOrEditTec").modal('hide');
    $(COMBO_SELECTED).val("-1");
}

function FlagFechaFinSoporte_Change() {
    let flagFechaFinSoporte = $("#chkFlagFechaFinSoporte").prop("checked");
    $("#FinSoporte_Si").addClass("hidden");
    $("#FinSoporte_No").addClass("hidden");
    //MostrarCampoObligatorio("#cbSustentoMotivoFechaFinSoporteTecnologia", ".form-group", !flagFechaFinSoporte);
    //MostrarCampoObligatorio("#txtSustentoUrlFechaFinSoporteTecnologia", ".form-group", !flagFechaFinSoporte);
    if (!flagFechaFinSoporte) {
        $("#cbFechaCalculosTecnologia").val(-1);
        $("#txtFechaFinExtendidaModelo").val("");
        $("#txtFechaFinSoporteModelo").val("");
        $("#txtFechaFinInternaModelo").val("");
        $("#cbTipoFechaInternaModelo").val(-1);
        $("#txtComentariosFechaFinSoporteModelo").val("");
        $("#FinSoporte_No").removeClass("hidden");
    } else {
        $("#FinSoporte_Si").removeClass("hidden");
    }
    $("#cbFechaCalculosTecnologia").prop("disabled", !flagFechaFinSoporte);
    $("#txtFechaFinExtendidaModelo").prop("readonly", !flagFechaFinSoporte);
    $("#txtFechaFinSoporteModelo").prop("readonly", !flagFechaFinSoporte);
    $("#txtFechaFinInternaModelo").prop("readonly", !flagFechaFinSoporte);
    $("#cbTipoFechaInternaModelo").prop("disabled", !flagFechaFinSoporte)
    $("#txtComentariosFechaFinSoporteModelo").prop("readonly", !flagFechaFinSoporte);
}

function MostrarCampoObligatorio(id, closest, show) {
    let elclosest = $(id).closest(closest);
    if (elclosest.length > 0) elclosest.find(".text-danger").html(show ? "(*)" : "");
};

function agregarEditarModelo() {
    let frmValido = $("#formAddOrEditTec").valid();
    if (frmValido) {
        InsertarModelo();
    } else {
        toastr.error('Faltan completar campos', TITULO_MENSAJE);
    }
}

function listarTec() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/LeerModelo",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.fabricante = $.trim($("#txtBusEq").val());
            DATA_EXPORTAR.nombre = $.trim($("#txtCodigoEquipoBuscar").val());
            DATA_EXPORTAR.nroSerie = $.trim($("#txtNroSerie").val());
            DATA_EXPORTAR.hostName = $.trim($("#txtHostname").val());
            DATA_EXPORTAR.tipoId = $("#cbFilTipoEq").val();
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

function InsertarModelo() {
    $("#btnGuardarTec").button("loading");

    let tec = ObtenerDataFormulario();

    $.ajax({
        url: URL_API_VISTA + "/NuevoModelo",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(tec),
        dataType: "json",
        success: function (result) {
            var data = result;
            if (data > 0) {
                bootbox.alert({
                    size: "sm",
                    title: "Registro",
                    message: "La información se registró con éxito",
                    callback: function () { /* your callback code */ }
                });
            }
        },
        complete: function () {
            mdAddOrEditTec(false);
            listarTec();
            //LimpiarFiltros();
            //listarTecSTD();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}



function ObtenerDataFormulario() {
    let tec = {};
    tec.idmodelo = ($("#hdModeloId").val() === "") ? 0 : parseInt($("#hdModeloId").val());
    tec.nombre = $("#txtNombreModelo").val();
    tec.fabricante = $("#txtFabricanteModelo").val();
    tec.UrlSharepoint = $("#txtUrlSharepointModelo").val();
    tec.UrlLineamiento = $("#txtUrlLineamientoModelo").val();
    tec.Remedy = $("#hdRemedyModelo").val();
    tec.RemedyNombre = $("#txtRemedyModelo").val();
    tec.FlagFechaFinSoporte = $("#chkFlagFechaFinSoporte").prop("checked");
    tec.FechaFabricacion = castDate($("#txtFechaFabricanteModelo").val());
    tec.tipoEquipoId = $("#cbFilTipoEqModal").val();
    //tec.Fuente = !tec.FlagFechaFinSoporte ? null : $("#cbFuenteTecnologia").val() == "-1" ? null : $("#cbFuenteTecnologia").val();
    tec.tipofechacalculo = !tec.FlagFechaFinSoporte || $("#cbFechaCalculosTecnologia").val() == "-1" ? null : $("#cbFechaCalculosTecnologia").val();
    tec.FechaFinSoporteExtendida = !tec.FlagFechaFinSoporte || $("#txtFechaFinExtendidaModelo").val() == "" ? null : castDate($("#txtFechaFinExtendidaModelo").val());
    tec.FechaFinSoporte = !tec.FlagFechaFinSoporte || $("#txtFechaFinSoporteModelo").val() == "" ? null : castDate($("#txtFechaFinSoporteModelo").val());
    tec.FechaInterna = !tec.FlagFechaFinSoporte || $("#txtFechaFinInternaModelo").val() == "" ? null : castDate($("#txtFechaFinInternaModelo").val());
    tec.TipoFechaInterna = !tec.FlagFechaFinSoporte || $("#cbTipoFechaInternaModelo").val() == "-1" ? null : $("#cbTipoFechaInternaModelo").val();
    tec.ComentarioFechaFinSoporte = !tec.FlagFechaFinSoporte || $("#txtComentariosFechaFinSoporteModelo").val() == "" ? null : $("#txtComentariosFechaFinSoporteModelo").val();
    tec.MotivoFechaIndefinida = tec.FlagFechaFinSoporte || $("#cbSustentoMotivoFechaFinSoporteModelo").val() == "-1" ? null : $("#cbSustentoMotivoFechaFinSoporteModelo").val();
    tec.urlFechaIndefinida = tec.FlagFechaFinSoporte || $("#txtSustentoUrlFechaFinSoporteModelo").val() == "" ? "" : $("#txtSustentoUrlFechaFinSoporteModelo").val();

    tec.Categoria = $("#txtCategoria").val();
    tec.Tipo = $("#txtTipo").val();
    tec.Item = $("#txtItem").val();

    return tec;
}

function opcionesFormatter(value, row, index) {
    let btn1 = '';
    let btn2 = '';

    btn1 = `<a href="javascript:dataDetalle('${row.idmodelo}')" title="Editar registro"><i class="glyphicon glyphicon-edit"></i></a>`;

    if (row.FlagTemporal == true)
        btn2 = `<a href="javascript:eleminarData('${row.idmodelo}');" title="Eliminar registro"><i class="glyphicon glyphicon-trash"></i></a>`;

    return btn1.concat("&nbsp;&nbsp;", btn2);
}

function dataDetalle(value) {
    limpiarMdAddOrEditTec();
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/BuscarModelo?id=${value}`,
        type: "GET",
        dataType: "json",
        success: function (result) {
            $("#hdModeloId").val(result.idmodelo);

            $("#txtNombreModelo").val(result.nombre);
            $("#txtFabricanteModelo").val(result.fabricante);
            $("#cbFilTipoEqModal").val(result.tipoEquipoId);
            $("#txtCategoria").val(result.Categoria);
            $("#txtTipo").val(result.Tipo);
            $("#txtItem").val(result.Item);

            if (result.FlagTemporal == false) {
                $("#txtNombreModelo").attr("disabled", "disabled");
                $("#txtFabricanteModelo").attr("disabled", "disabled");
                $("#cbFilTipoEqModal").attr("disabled", "disabled");
                $("#txtCategoria").attr("disabled", "disabled");
                $("#txtTipo").attr("disabled", "disabled");
                $("#txtItem").attr("disabled", "disabled");
            }
            else {
                $("#txtNombreModelo").removeAttr("disabled");
                $("#txtFabricanteModelo").removeAttr("disabled");
                $("#cbFilTipoEqModal").removeAttr("disabled");
                $("#txtCategoria").removeAttr("disabled");
                $("#txtTipo").removeAttr("disabled");
                $("#txtItem").removeAttr("disabled");

            }


            if (result.FechaFinSoporteExtendida != null)
                $("#txtFechaFabricanteModelo").val(new Date(result.FechaFabricacion).toLocaleString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' }));

            $("#chkFlagFechaFinSoporte").prop("checked", result.FlagFechaFinSoporte == null ? false : result.FlagFechaFinSoporte).trigger("change");
            if (result.FechaFinSoporteExtendida != null)
                $("#txtFechaFinExtendidaModelo").val(new Date(result.FechaFinSoporteExtendida).toLocaleString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' }));
            if (result.FechaFinSoporte != null)
                $("#txtFechaFinSoporteModelo").val(new Date(result.FechaFinSoporte).toLocaleString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' }));
            if (result.FechaInterna != null)
                $("#txtFechaFinInternaModelo").val(new Date(result.FechaInterna).toLocaleString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' }));

            $("#cbTipoFechaInternaModelo").val(result.TipoFechaInterna == "" ? -1 : result.TipoFechaInterna);
            $("#txtComentariosFechaFinSoporteModelo").val(result.ComentarioFechaFinSoporte);
            $("#cbSustentoMotivoFechaFinSoporteModelo").val(result.MotivoFechaIndefinida == "" ? -1 : result.MotivoFechaIndefinida);
            $("#txtSustentoUrlFechaFinSoporteModelo").val(result.urlFechaIndefinida);
            $("#txtUrlSharepointModelo").val(result.UrlSharepoint);
            $("#txtUrlLineamientoModelo").val(result.UrlLineamiento);
            $("#hdRemedyModelo").val(result.Remedy);
            $("#txtRemedyModelo").val(result.RemedyNombre);

            $("#cbFechaCalculosTecnologia").val(result.tipofechacalculo);
        },
        complete: function () {
            waitingDialog.hide();
            mdAddOrEditTec(true);
        }
    });
}

function eleminarData(value) {
    $.ajax({
        url: URL_API_VISTA + `/EliminarModelo?id=${value}`,
        type: "GET",
        dataType: "json",
        success: function (result) {
            listarTec();
        }
    });
}

function validarAddOrEditFormTec() {
    $.validator.addMethod("fecha_tecnologia", function (value, element) {
        if ($("#chkFlagFechaFinSoporte").prop("checked")) {
            if (
                (element.name == 'txtFechaFinExtendidaModelo' && $("#cbFechaCalculosTecnologia").val() == "2") ||
                (element.name == 'txtFechaFinSoporteModelo' && $("#cbFechaCalculosTecnologia").val() == "3") ||
                (element.name == 'txtFechaFinInternaModelo' && $("#cbFechaCalculosTecnologia").val() == "4")
            ) return $.trim(value) !== "";
            else if (element.name == 'cbTipoFechaInternaModelo' && $("#cbFechaCalculosTecnologia").val() == "4")
                return $.trim(value) !== "-1";
            return true;
        }
        return true;
    });

    $.validator.addMethod("fecha_tecnologia_no", function (value, element) {
        let checked = $("#chkFlagFechaFinSoporte").prop("checked")
        if (!checked) return value != "" && value != "-1";
        return true;
    });

    $.validator.addMethod("requiredInput", function (value, element) {
        let nombre = $("#txtNombreModelo").val();
        let fabricante = $("#txtFabricanteModelo").val();
        let urlshare = $("#txtUrlSharepointModelo").val();
        let urlLinea = $("#txtUrlLineamientoModelo").val();
        let remedytxt = $("#txtRemedyModelo").val();
        let remedyid = $("#hdRemedyModelo").val();
        let equipo = $("#cbFilTipoEqModal").val();
        let camposSelect = nombre != "" && fabricante != "" && urlshare != "" && urlLinea != "" && remedytxt != "" && remedyid != "" && equipo != -1

        return camposSelect;
    });

    $("#formAddOrEditTec").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombreModelo: {
                required: true
            },
            txtFabricanteModelo: {
                required: true
            },
            txtUrlSharepointModelo: {
                required: true
            },
            txtUrlLineamientoModelo: {
                required: true
            },
            txtRemedyModelo: {
                required: true
            },
            cbFilTipoEqModal: {
                required: true
            },
            txtFechaFinExtendidaModelo: {
                fecha_tecnologia: true,
            },
            txtFechaFinSoporteModelo: {
                fecha_tecnologia: true,
            },
            txtFechaFinInternaModelo: {
                fecha_tecnologia: true,
            },
            cbTipoFechaInternaModelo: {
                fecha_tecnologia: true,
            },
            cbSustentoMotivoFechaFinSoporteModelo: {
                fecha_tecnologia_no: true
            },
            txtSustentoUrlFechaFinSoporteModelo: {
                fecha_tecnologia_no: true
            }
        },
        messages: {
            txtNombreModelo: {
                required: String.Format("Debes ingresar {0}.", "un nombre del modelo"),
            },
            txtFabricanteModelo: {
                required: String.Format("Debes ingresar {0}.", "un nombre del fabricante"),
            },
            txtUrlSharepointModelo: {
                required: String.Format("Debes ingresar {0}.", "un url del Sharepoint"),
            },
            txtUrlLineamientoModelo: {
                required: String.Format("Debes ingresar {0}.", "un url de Lineamiento"),
            },
            txtRemedyModelo: {
                required: String.Format("Debes ingresar {0}.", "un grupo de Remedy"),
            },
            cbFilTipoEqModal: {
                required: String.Format("Debes ingresar {0}.", "un Tipo de equipo"),
            },
            txtFechaFinExtendidaModelo: {
                fecha_tecnologia: String.Format("Debes seleccionar {0}.", "una fecha fin extendida de la tecnología"),
            },
            txtFechaFinSoporteModelo: {
                fecha_tecnologia: String.Format("Debes seleccionar {0}.", "una fecha fin soporte de la tecnología"),
            },
            txtFechaFinInternaModelo: {
                fecha_tecnologia: String.Format("Debes seleccionar {0}.", "una fecha fin interna de la tecnología"),
            },
            cbTipoFechaInternaModelo: {
                fecha_tecnologia: String.Format("Debes seleccionar {0}.", "un tipo de fecha interna de la tecnología"),
            },
            cbSustentoMotivoFechaFinSoporteModelo: {
                fecha_tecnologia_no: String.Format("Debes ingresar {0}", "un motivo"),
            },
            txtSustentoUrlFechaFinSoporteModelo: {
                fecha_tecnologia_no: String.Format("Debes ingresar {0}", "un url"),
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtFechaFabricanteModelo" || element.attr('name') === "txtFechaFinExtendidaModelo"
                || element.attr('name') === "txtFechaFinSoporteModelo" || element.attr('name') === "txtFechaFinInternaModelo") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function ExportarInfo() {
    let criterio = $.trim($("#txtBusEq").val());
    let tipo = $("#cbFilTipoEq").val();
    let nroSerie = $.trim($("#txtNroSerie").val());
    let hostName = $.trim($("#txtHostname").val());

    let url = `${URL_API_VISTA}/ExportarModelo?criterio=${criterio}&tipo=${tipo}&nroSerie=${nroSerie}&hostName=${hostName}`;
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

function estadoFormatter(value, row, index) {
    if (row.indicador === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    } else if (row.indicador === 1) {
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function estadoFormatter12(value, row, index) {
    if (row.indicadorproyectado === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    } else if (row.indicadorproyectado === 1) {
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function estadoFormatter24(value, row, index) {
    if (row.indicadorproyectado2 === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    } else if (row.indicadorproyectado2 === 1) {
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}
