var $table = $("#tblRegistro");
var $tableApExp = $("#tblApExp");
var $tableApp_Componentes = $("#tblApp_Componentes");
var $tableAppExpertos = $("#tblAplicacionExpertos");
var URL_API_VISTA = URL_API + "/Aplicacion";
var URL_API_USUARIO = URL_API + "/Usuario";
var ITEMS_REMOVEID = [];
var ITEMS_REMOVEID_COMPONENTES = [];
var ITEMS_ACTIVARID_COMPONENTES = [];
var ITEMS_ADDID = [];
var ITEMS_ADDID_COMPONENTES = [];
var DATA_MATRICULA = [];
var FLAG_TENEMOS_MATRICULA = false;
var DATA_EXPORTAR = {};
var USUARIO_DATOS = {};
var TITULO_MENSAJE = "Aplicación";
var IDS_APPEXPERTOS_DISABLED = [];
var CURRENT_CODAPTs_FILTERED = [];
var DATA_ETIQUETAS = [];
var CODIGOAPT = '';

$(function () {
    getCurrentUser();
    InitTables();
    ValidateModalResponsables();
    ValidateModalResponsablesNew();

    InitAutocompletarBuilder($("#txtLiderTribu"), null, ".tribuContainer", "/Aplicacion/GetJefeEquipoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtProduct"), null, ".usuarioContainer", "/Aplicacion/GetOwnerByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtAplicacion"), $("#hAplicacion"), ".appContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");

    InitAutocompletarBuilderLocal($("#txtMatriculaResponsable"), $("#hdMatriculaResponsable"), ".respContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}", selectLocalCallBack);
    InitAutocompletarBuilderLocal($("#txtMatriculaResponsableNew"), $("#hdMatriculaResponsableNew"), ".respContainerNew", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}", selectLocalCallBackNew);
    InitAutocompletarBuilderLocal2($("#txtMatricula"), $("#hdMatriculaResponsablePrincipal"), ".respContainerPrincipal", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");

    ValidarCampos();
    CargarCombos();
    ListarRegistros();

    $("#btnMassiveUpdate").click(showModalExpertos);
    $("#btnSaveResponsables").click(saveAplicacionResponsables);
    $("#btnSaveResponsablesNew").click(saveAplicacionResponsablesNew);

    $("#btnMassiveUpdateNew").click(showModalExpertosNew);

    setDefaultHd($("#txtAplicacion"), $("#hAplicacion"));
    InitHidden($("#txtMatriculaResponsable"), $("#hdMatriculaResponsable"), "");

    GetEtiquetas($("#ddlEtiqueta"));
    GetUnidadFondeo($("#ddlUnidadFondeo"));
});

function InitTables() {
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({ data: [] });

    $tableApExp.bootstrapTable("destroy");
    $tableApExp.bootstrapTable({ data: [] });
}

function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItems(dataObject.Criticidad, $("#cbFiltroCriticidad"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Gerencia, $("#cbFiltroGerencia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Division, $("#cbFiltroDivision"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Unidad, $("#cbFiltroUnidad"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Area, $("#cbFiltroArea"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Estado, $("#cbFiltroEstado"), TEXTO_SELECCIONE);
                    SetItems(dataObject.UnidadFondeo, $("#cbUnidadFondeo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoExperto, $("#ddlTipo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoExperto, $("#ddlTipoResponsable"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoExperto, $("#ddlTipoResponsableNew"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function GetEtiquetas(ddlEtiqueta) {
    var $etiquetas = ddlEtiqueta;

    $etiquetas.append($('<option></option')
        .attr('value', '-1')
        .text('--Seleccione--'));

    $.ajax({
        url: URL_API_VISTA + "/ObtenerEtiquetas",
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (result) {
            var data = result;
            DATA_ETIQUETAS = data;
            $etiquetas.find("option:gt(0)").remove();

            $.each(data, function (i, item) {
                $etiquetas.append($('<option>', {
                    value: item.TipoEtiquetaId,
                    text: item.NombreEtiqueta
                }));
            });
        },
        complete: function () {

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}
function GuardarEtiqueta() {
    if ($("#formEtiqueta").valid()) {

        var setiqueta = {};
        setiqueta.EtiquetaId = parseInt($("#ddlEtiqueta").val());
        setiqueta.CodigoAPT = CODIGOAPT;

        $.ajax({
            url: URL_API_VISTA + "/GuardarEtiqueta",
            type: "POST",
            data: setiqueta,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            dataType: "json",
            success: function (result) {
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                $("#ddlEtiqueta").val(-1);
                ListarRegistros();
            },
            complete: function () {
                $("#EditEtiquetaModal").modal("hide");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function GetUnidadFondeo(ddlUnidadFondeo) {
    var $etiquetas = ddlUnidadFondeo;

    $etiquetas.append($('<option></option')
        .attr('value', '-1')
        .text('--Seleccione--'));

    $.ajax({
        url: URL_API_VISTA + "/ObtenerUnidadFondeo",
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (result) {
            var data = result;
            DATA_ETIQUETAS = data;
            $etiquetas.find("option:gt(0)").remove();

            $.each(data, function (i, item) {
                $etiquetas.append($('<option>', {
                    value: item.UnidadFondeoId,
                    text: item.Nombre
                }));
            });
        },
        complete: function () {

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}
function GuardarUnidadFondeo() {
    if ($("#formUnidadFondeo").valid()) {
        debugger;

        var setiqueta = {};
        setiqueta.UnidadFondeoId = parseInt($("#ddlUnidadFondeo").val());
        setiqueta.CodigoAPT = CODIGOAPT;

        $.ajax({
            url: URL_API_VISTA + "/GuardarUnidadFondeo",
            type: "POST",
            data: setiqueta,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            dataType: "json",
            success: function (result) {
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                $("#ddlUnidadFondeo").val(-1);
                ListarRegistros();
            },
            complete: function () {
                $("#EditUnidadFondeoModal").modal("hide");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function GetAllRecords() {
    let data = {
        //nombre: $.trim($("#txtFiltro").val()),
        pageNumber: DATA_EXPORTAR.pageNumber,
        pageSize: DATA_EXPORTAR.pageSize,
        sortName: DATA_EXPORTAR.sortName,
        sortOrder: DATA_EXPORTAR.sortOrder,
        Gerencia: $("#cbFiltroGerencia").val() === "-1" ? null : $("#cbFiltroGerencia").val(),
        Division: $("#cbFiltroDivision").val() === "-1" ? null : $("#cbFiltroDivision").val(),
        Unidad: $("#cbFiltroUnidad").val() === "-1" ? null : $("#cbFiltroUnidad").val(),
        Area: $("#cbFiltroArea").val() === "-1" ? null : $("#cbFiltroArea").val(),
        Estado: $("#cbFiltroEstado").val() === "-1" ? null : $("#cbFiltroEstado").val(),
        JefeEquipo: $.trim($("#txtLiderTribu").val()),
        Aplicacion: $("#hAplicacion").val() !== "0" ? $("#hAplicacion").val() : $.trim($("#txtAplicacion").val()),
        Todos: true
    };

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Listado",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let retorno = dataObject;
                    console.log("Data >", retorno);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            waitingDialog.hide();
            OpenCloseModal($("#mdResponsablesNew"), true);
        }
    });

}

function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        sortName: "CodigoAPT",
        sortOrder: "asc",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            //DATA_EXPORTAR.nombre = $.trim($("#txtFiltro").val());
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            //DATA_EXPORTAR.CriticidadId = $("#cbFiltroCriticidad").val() == "-1" ? null : $("#cbFiltroCriticidad").val();
            DATA_EXPORTAR.Gerencia = $("#cbFiltroGerencia").val() === "-1" ? null : $("#cbFiltroGerencia").val();
            DATA_EXPORTAR.Division = $("#cbFiltroDivision").val() === "-1" ? null : $("#cbFiltroDivision").val();
            DATA_EXPORTAR.Unidad = $("#cbFiltroUnidad").val() === "-1" ? null : $("#cbFiltroUnidad").val();
            DATA_EXPORTAR.Area = $("#cbFiltroArea").val() === "-1" ? null : $("#cbFiltroArea").val();
            DATA_EXPORTAR.Estado = $("#cbFiltroEstado").val() === "-1" ? null : $("#cbFiltroEstado").val();
            DATA_EXPORTAR.UnidadFondeoId = $("#cbUnidadFondeo").val() === "-1" ? 0 : $("#cbUnidadFondeo").val();
            DATA_EXPORTAR.JefeEquipo = $.trim($("#txtLiderTribu").val());
            DATA_EXPORTAR.Owner = $.trim($("#txtProduct").val());
            DATA_EXPORTAR.Aplicacion = $("#hAplicacion").val() !== "0" ? $("#hAplicacion").val() : $.trim($("#txtAplicacion").val());

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            CURRENT_CODAPTs_FILTERED = data.ArrCodigoAPT || "";
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
    //let filtro = $("#txtFiltro").val();
    //$("#hdFiltro").val(filtro);
    //$table.bootstrapTable("refresh");
    ListarRegistros();
}
function MdAddOrEditRegistro(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    if (EstadoMd)
        $("#MdAddOrEditModal").modal(opcionesModal);
    else
        $("#MdAddOrEditModal").modal("hide");
}
function LimpiarMdAddOrEditRegistro() {
    $("#formRegistro").validate().resetForm();
    $(":input", "#formRegistro")
        .not(":button, :submit, :reset, :hidden")
        .val("")
        .removeAttr("checked")
        .removeAttr("selected");
    ITEMS_REMOVEID = [];
    ITEMS_ADDID = [];
    $("#hdId").val("");
    $tableApExp.bootstrapTable("destroy");
    $tableApExp.bootstrapTable({ data: [] });
    toastr.clear();

    $("#hdCorreoResponsablePrincipal").val("");
    $("#hdMatriculaResponsablePrincipal").val("");
    $("#txtMatricula").val("");
}
function GuardarRegistro() {
    $(".inputMatricula").addClass("ignore");
    $(".guardarExperto").removeClass("ignore");

    if ($("#formRegistro").valid()) {

        $("#btnGuardarRegistro").button("loading");

        ITEMS_ADDID = $tableApExp.bootstrapTable("getData");

        let data = {
            CodigoAPT: $("#hdId").val(),
            ListIdsRegistrar: ITEMS_ADDID,
            ListIdsEliminar: ITEMS_REMOVEID,
        };

        $.ajax({
            url: URL_API_VISTA + "/ActualizarExperto",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                $("#btnGuardarRegistro").button("reset");
                if (result) {
                    toastr.success("El registro se actualizó correctamente.", TITULO_MENSAJE);
                    MdAddOrEditRegistro(false);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}
function ValidarCampos() {

    $.validator.addMethod("existeMatricula", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            estado = ExisteMatricula();
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("requiredMinExperto", function (value, element) {
        let minRegistro = $tableApExp.bootstrapTable('getData');
        let estado = minRegistro.length > 0 ? true : false;
        return estado;
    });
    //$.validator.addMethod("existeMatricula2", function (value, element) {
    //    if (!FLAG_TENEMOS_MATRICULA) return true;
    //    let data = DATA_MATRICULA.find(x => x.Id === value) || null;
    //    if (data !== null) {
    //        return true;
    //    }
    //    return false;
    //});

    $("#formRegistro").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtMatricula: {
                requiredSinEspacios: true
            },
            ddlTipo: {
                requiredSelect: true
            },
            msjValid: {
                requiredMinExperto: true
            }
        },
        messages: {
            txtMatricula: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el correo electrónico")
            },
            ddlTipo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo")
            },
            msjValid: {
                requiredMinExperto: String.Format("Debes agregar {0}.", "un responsable como mínimo")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtMatricula") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });

    $("#formEtiqueta").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlEtiqueta: {
                requiredSelect: true
            }
        },
        messages: {
            ddlEtiqueta: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "una agrupación")
            }
        }
    });

    $("#formUnidadFondeo").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlUnidadFondeo: {
                requiredSelect: true
            }
        },
        messages: {
            ddlUnidadFondeo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "una unidad de fondeo")
            }
        }
    });
}
function opcionesFormatter(value, row) {
    let style_color = row.FlagRelacionar ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.FlagRelacionar ? "check" : "unchecked";
    let editarResponsables = `<a href="javascript:IrObtenerResponsablesApExp('${value}');" title="Editar responsables"><i style="" class="glyphicon glyphicon-user table-icon"></i></a>`;
    let editarFlagRelacionar = `<a href="javascript:cambiarFlagRelacionar('${value}')" title="Editar condición"><i style="" id="chkRelacionar${value}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    let agrupamientoApps = '';
    if (userCurrent.PerfilId == 1)
        agrupamientoApps = `<a href="javascript:editarAgrupamiento('${value}');" title="Editar agupamiento"><i style="" class="glyphicon glyphicon-list table-icon"></i></a>`;

    let unidadFondeoOps = '';
    if (userCurrent.PerfilId == 1)
        unidadFondeoOps = `<a href="javascript:editarUnidadFondeo('${value}');" title="Editar unidad de fondeo"><i style="" class="glyphicon glyphicon-align-justify table-icon"></i></a>`;

    //let editarComponentes = `<a href="javascript:IrObtenerComponentesApp('${value}');" title="Editar relaciones Diagr. Infraestructura"><i style="" class="glyphicon glyphicon-link table-icon"></i></a>`;
    let saltoLinea = '';
    if (userCurrent.PerfilId == 1)
        saltoLinea = '<br>'
    return editarFlagRelacionar.concat("&nbsp;&nbsp;", editarResponsables, saltoLinea, agrupamientoApps, "&nbsp;&nbsp;", unidadFondeoOps, saltoLinea);
}
function cambiarFlagRelacionar(Id) {
    let FlagRelacionar = !($(`#chkRelacionar${Id}`).hasClass("iconoVerde"));
    bootbox.confirm({
        message: String.Format("¿Estás seguro que deseas {0} la condición de relacionar?", `${FlagRelacionar ? "activar" : "desactivar"}`),
        buttons: {
            confirm: {
                label: 'Aceptar',
                className: 'btn-primary'
            },
            cancel: {
                label: 'Cancelar',
                className: 'btn-secondary'
            }
        },
        callback: function (result) {
            let data = {
                Id: Id,
                Flag: FlagRelacionar
            };

            if (result) {
                $.ajax({
                    url: URL_API_VISTA + "/CambiarFlagRelacionar",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(data),
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (result) {
                        if (result) {
                            toastr.success("La aplicación se actualizó correctamente", TITULO_MENSAJE);
                            ListarRegistros();
                        }
                        else {
                            toastr.error("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    },
                    complete: function (data) {
                        //RefrescarListado();
                    }
                });
            }
        }
    });
}

function editarAgrupamiento(codigoAPT) {
    CODIGOAPT = codigoAPT;
    $.ajax({
        url: URL_API_VISTA + `/ObtenerAplicacionEtiqueta?codigoAPT=${codigoAPT}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            $("#EditEtiquetaModal").modal("show");
            $("#ddlEtiqueta").val(result.TipoEtiquetaId);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function editarUnidadFondeo(codigoAPT) {
    CODIGOAPT = codigoAPT;
    $.ajax({
        url: URL_API_VISTA + `/ObtenerAplicacionUnidadFondeo?codigoAPT=${codigoAPT}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            $("#EditUnidadFondeoModal").modal("show");
            $("#ddlUnidadFondeo").val(result.UnidadFondeoId);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function editarAgrupamiento(codigoAPT) {
    CODIGOAPT = codigoAPT;
    $.ajax({
        url: URL_API_VISTA + `/ObtenerAplicacionEtiqueta?codigoAPT=${codigoAPT}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            $("#EditEtiquetaModal").modal("show");
            $("#ddlEtiqueta").val(result.TipoEtiquetaId);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function IrObtenerResponsablesApExp(Id) {
    $("#titleForm").html("Configurar responsables");
    $("#txtMatricula").val("");
    $("#ddlTipo").val("-1");
    $.ajax({
        url: URL_API_VISTA + `/ObtenerAplicacionExperto?Id=${Id}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditRegistro(true);
            $("#hdId").val(Id);
            $tableApExp.bootstrapTable("destroy");
            $tableApExp.bootstrapTable({ data: result });
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}


function opcionesFormatterApExp(value, row) {
    let eliminar = `<a class='btn btn-danger' href="javascript:removeItem('${row.AplicacionExpertoId}','${row.TipoExpertoId}');" title="Eliminar registro"><span class='icon icon-trash-o'></span></a>`;
    return eliminar;
}
function IrEliminarApExp(Id) {
    bootbox.confirm("¿Estás seguro que deseas eliminar el registro seleccionado?", function (result) {
        if (result) {
            ITEMS_REMOVEID.push(Id);
            $tableApExp.bootstrapTable("remove", { field: 'Id', values: [Id] });
        }
    });
}
function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre == null ? '' : DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&criticidadId=${DATA_EXPORTAR.CriticidadId}&gerencia=${DATA_EXPORTAR.Gerencia == null ? '' : DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division == null ? '' : DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad == null ? '' : DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area == null ? '' : DATA_EXPORTAR.Area}`;
    let url = `${URL_API_VISTA}/ExportarConfiguracion?nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&gerencia=${DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area}&estado=${DATA_EXPORTAR.Estado}&aplicacion=${DATA_EXPORTAR.Aplicacion}&jefeequipo=${DATA_EXPORTAR.JefeEquipo}&owner=${DATA_EXPORTAR.Owner}&unidadFondeoId=${DATA_EXPORTAR.UnidadFondeoId}`;
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
function ExportarResponsables() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre == null ? '' : DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&criticidadId=${DATA_EXPORTAR.CriticidadId}&gerencia=${DATA_EXPORTAR.Gerencia == null ? '' : DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division == null ? '' : DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad == null ? '' : DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area == null ? '' : DATA_EXPORTAR.Area}`;
    let url = `${URL_API_VISTA}/ExportarResponsables?nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&gerencia=${DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area}&estado=${DATA_EXPORTAR.Estado}&aplicacion=${DATA_EXPORTAR.Aplicacion}&jefeequipo=${DATA_EXPORTAR.JefeEquipo}&owner=${DATA_EXPORTAR.Owner}`;
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

function ExportarResponsablesPortafolio() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre == null ? '' : DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&criticidadId=${DATA_EXPORTAR.CriticidadId}&gerencia=${DATA_EXPORTAR.Gerencia == null ? '' : DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division == null ? '' : DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad == null ? '' : DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area == null ? '' : DATA_EXPORTAR.Area}`;
    let url = `${URL_API_VISTA}/ExportarResponsablePort`;
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
function removeItem(AEid, TEId) {
    bootbox.confirm({
        title: "Eliminar Responsable",
        message: "¿Estás seguro que deseas eliminar al responsable de la aplicación?",
        buttons: {
            confirm: {
                label: 'Aceptar',
                className: 'btn-primary'
            },
            cancel: {
                label: 'Cancelar',
                className: 'btn-secondary'
            }
        },
        callback: function (result) {
            if (result) {
                let data = {
                    AppExpId: AEid,
                    TipExpId: TEId
                };

                let existe = ITEMS_REMOVEID.find(x => x.AppExpId === AEid && x.TipExpId === TEId) || null;
                if (existe === null) {
                    ITEMS_REMOVEID.push(data);
                }

                $tableApExp.bootstrapTable('removeByUniqueId', AEid);

                //$tableApExp.bootstrapTable("remove", {
                //    field: "index", values: [indexs]
                //});

                //$.ajax({
                //    url: URL_API_VISTA + "/CambiarFlagExperto",
                //    type: "POST",
                //    contentType: "application/json; charset=utf-8",
                //    data: JSON.stringify(data),
                //    dataType: "json",
                //    success: function (result) {
                //        if (result) {
                //            toastr.success("La operación se realizó correctamente", "Aplicación");
                //            MdAddOrEditRegistro(false);
                //        }
                //        else {
                //            toastr.error("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "Aplicación");
                //        }
                //    },
                //    error: function (xhr, ajaxOptions, thrownError) {
                //        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                //    },
                //    complete: function (data) {
                //        //RefrescarListado();
                //    }
                //});

            }
        }
    });
}
function addItem() {

    //console.log(matricula);
    //TODO
    //LimpiarValidateErrores($("#formRegistro"));
    $(".inputMatricula").removeClass("ignore");
    $(".guardarExperto").addClass("ignore");

    if ($("#formRegistro").valid()) {
        //console.log("Form valido");
        //let matricula = $("#txtMatricula").val();
        AgregarExperto();

    }

}

function AgregarExperto() {
    let matricula = $("#txtMatricula").val();
    var estItem = $tableApExp.bootstrapTable('getRowByUniqueId', matricula);
    //debugger;
    if (estItem === null) {
        var dataTmp = $tableApExp.bootstrapTable('getData');
        var idx = 0;
        var ultId = dataTmp.length === 0 ? (1 * -1000) : dataTmp[dataTmp.length - 1].Id;
        ultId = ultId === null ? 0 : ultId;
        idx = ultId > 0 ? dataTmp.length * -1000 : ultId - 1000;

        $tableApExp.bootstrapTable('append', {
            Id: idx,
            CodApp: $("#hdId").val(),
            Activo: true,
            ActivoDetalle: "Activo",
            Matricula: $("#hdMatriculaResponsablePrincipal").val(),
            Nombres: $("#txtMatricula").val(),
            TipoExpertoId: parseInt($("#ddlTipo").val()),
            TipoExpertoToString: $("#ddlTipo option:selected").text(),
            FlagEliminado: false
        });
    } else {
        bootbox.alert("La matrícula no se debe repetir en el cuadro de responsables");
    }
}

function ExisteMatricula() {
    let estado = false;
    let matricula = $("#txtMatricula").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_LOGIN_SERVER + `/ObtenerDatosUsuario?correoElectronico=${matricula}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    USUARIO_DATOS = dataObject;
                    let EstadoUser = dataObject.Estado;
                    estado = EstadoUser !== 1 ? false : true;
                    //estado = dataObject;
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

function InitAutocompletarBuilderLocal2($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("");
                $.ajax({
                    url: urlControllerWithParams,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (data) {
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else
                return response(true);
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.displayName);

            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.mail);
                $("#hdCorreoResponsablePrincipal").val(ui.item.mail);
                $("#hdMatriculaResponsablePrincipal").val(ui.item.matricula);
                addItem();
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function selectLocalCallBack($idBox, data) {
    $idBox.val(data.mail);
    $("#hdCorreoResponsable").val(data.mail);
    $("#hdMatriculaResponsable").val(data.matricula);
    ListApplicationsByFilters(data.matricula, false);
}

function selectLocalCallBackNew($idBox, data) {
    $idBox.val(data.mail);
    $("#hdCorreoResponsableNew").val(data.mail);
    $("#hdMatriculaResponsableNew").val(data.matricula);
    //ListApplicationsByFilters(data.matricula, false);
}

function InitAutocompletarBuilderLocal($searchBox, $IdBox, $container, urlController, callback) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("");
                $.ajax({
                    url: urlControllerWithParams,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (data) {
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else
                return response(true);
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.displayName);

            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                //$IdBox.val(ui.item.mail);
                //$("#hdCorreoResponsable").val(ui.item.mail);
                //$("#hdMatriculaResponsable").val(ui.item.matricula);
                //ListApplicationsByFilters(ui.item.matricula, false);
                callback($IdBox, ui.item);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function ListApplicationsByFilters(_matriculaExperto, showModal = true) {
    let data = {
        pageNumber: 1,
        sortName: "CodigoAPT",
        sortOrder: "asc",
        TipoExpertoId: parseInt($("#ddlTipoResponsable").val(), 10),
        MatriculaExperto: _matriculaExperto
    };

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Consultor/Aplicaciones",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject;
                    $tableAppExpertos.bootstrapTable("destroy");
                    $tableAppExpertos.bootstrapTable({ data: data.Rows });
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            waitingDialog.hide();
            if (showModal) {
                OpenCloseModal($("#mdResponsables"), showModal);
            }
        }
    });
}

function showModalExpertos() {
    clearModalExpertos();
    ListApplicationsByFilters("", true);
}

function showModalExpertosNew() {
    clearModalExpertosNew();
    OpenCloseModal($("#mdResponsablesNew"), true);
    //GetAllRecords();
}

function clearModalExpertos() {
    LimpiarValidateErrores($("#formResponsables"));
    $("#ddlTipoResponsable").val("-1");
    $("#txtMatriculaResponsable").val("");
    $("#hdMatriculaResponsable").val("");
    $("#hdCorreoResponsable").val("");
    $tableAppExpertos.bootstrapTable("destroy");
    $tableAppExpertos.bootstrapTable({ data: [] });
}

function clearModalExpertosNew() {
    LimpiarValidateErrores($("#formResponsablesNew"));
    $("#ddlTipoResponsableNew").val("-1");
    $("#txtMatriculaResponsableNew").val("");
    $("#hdMatriculaResponsableNew").val("");
    $("#hdCorreoResponsableNew").val("");
}

function saveAplicacionResponsables() {
    LimpiarValidateErrores($("#formResponsables"));
    $(".input-resp").removeClass("ignore");
    $(".input-tbl").removeClass("ignore");

    if ($("#formResponsables").valid()) {
        let data = $tableAppExpertos.bootstrapTable('getData');
        let arrCodigoAPT = data.filter(x => x.ItemSelected).map(x => x.CodigoAPT).join("|");
        let tipoExperto = parseInt($("#ddlTipoResponsable").val(), 10);

        //let correoExperto = $.trim($("#txtMatriculaResponsable").val());
        //let dataUser = getDataUserByEmail(correoExperto);
        //if (dataUser.Estado !== 1) {
        //    toastr.error("No fue posible encontrar el correo electrónico ingresado.", TITULO_MENSAJE);
        //    return;
        //}

        //let matriculaResp = 'S71872';
        let matriculaResp = $("#hdMatriculaResponsable").val();
        let nombreResp = $("#hdCorreoResponsable").val();

        if (matriculaResp !== '' && nombreResp !== '') {
            SaveDataResponsables(arrCodigoAPT, matriculaResp, tipoExperto, nombreResp, closeModalResponsables);
        }
        else
            toastr.error("El usuario seleccionado no es válido, por favor vuelve a intentarlo.", TITULO_MENSAJE);
    }
}

function saveAplicacionResponsablesNew() {
    LimpiarValidateErrores($("#formResponsablesNew"));
    //$(".input-resp").removeClass("ignore");
    //$(".input-tbl").removeClass("ignore");

    if ($("#formResponsablesNew").valid()) {
        //let data = $tableAppExpertos.bootstrapTable('getData');
        //let arrCodigoAPT = data.filter(x => x.ItemSelected).map(x => x.CodigoAPT).join("|");

        let arrCodigoAPT = CURRENT_CODAPTs_FILTERED;
        let tipoExperto = parseInt($("#ddlTipoResponsableNew").val(), 10);

        //let correoExperto = $.trim($("#txtMatriculaResponsable").val());
        //let dataUser = getDataUserByEmail(correoExperto);
        //if (dataUser.Estado !== 1) {
        //    toastr.error("No fue posible encontrar el correo electrónico ingresado.", TITULO_MENSAJE);
        //    return;
        //}

        //let matriculaResp = 'S71872';
        let matriculaResp = $("#hdMatriculaResponsableNew").val();
        let nombreResp = $("#hdCorreoResponsableNew").val();

        if (matriculaResp !== '' && nombreResp !== '') {
            SaveDataResponsables(arrCodigoAPT, matriculaResp, tipoExperto, nombreResp, closeModalResponsablesNew);
        }
        else
            toastr.error("El usuario seleccionado no es válido, por favor vuelve a intentarlo.", TITULO_MENSAJE);
    }
}

function SaveDataResponsables(_arrCodigoAPT, _matriculaResp, _tipoExpertoId, _nombreResp, callback) {
    let data = {
        ArrCodigoAPT: _arrCodigoAPT,
        MatriculaExperto: _matriculaResp,
        TipoExpertoId: _tipoExpertoId,
        Nombres: _nombreResp,
        ArrIdsAplicacionExpertos: IDS_APPEXPERTOS_DISABLED.join("|")
    };

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Consultor/ActualizarExperto",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let retorno = dataObject;
                    if (retorno) {
                        toastr.success("Se actualizó correctamente.", TITULO_MENSAJE);
                        //closeModalResponsables();
                        callback();
                    } else {
                        MensajeGeneralAlert(TITULO_MENSAJE, "Hubo un problema en el servicio, intentar nuevamente");
                    }
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            waitingDialog.hide();
        }
    });
}

function closeModalResponsables() {
    $("#mdResponsables").modal("hide");
    $("#hdCorreoResponsablePrincipal").val("");
    $("#hdMatriculaResponsablePrincipal").val("");
    $("#txtMatricula").val("");
    ListarRegistros();
}

function closeModalResponsablesNew() {
    //$("#mdResponsables").modal("hide");
    OpenCloseModal($("#mdResponsablesNew"), false);
    //$("#hdCorreoResponsablePrincipal").val("");
    //$("#hdMatriculaResponsablePrincipal").val("");
    //$("#txtMatricula").val("");
    ListarRegistros();
}

function cbFormatter(value, row) {
    let checked = row.ItemSelected ? "checked" : "";
    let btnCheckBox = `<input type="checkbox" id="cb${row.Id}" name="cb${row.Id}" onclick='setSelectedItem(${row.Id})' ${checked}>`;
    return btnCheckBox;
}

function setSelectedItem(Id) {
    let newValue = $(`#cb${Id}`).prop("checked");
    let rowId = Id;
    $tableAppExpertos.bootstrapTable('updateByUniqueId', {
        id: rowId,
        row: {
            ItemSelected: newValue
        }
    });

    if (newValue) {
        let index = IDS_APPEXPERTOS_DISABLED.indexOf(rowId);
        if (index > -1) {
            IDS_APPEXPERTOS_DISABLED.splice(index, 1);
        }
    } else {
        if (!IDS_APPEXPERTOS_DISABLED.includes(rowId))
            IDS_APPEXPERTOS_DISABLED.push(rowId);
    }
}

function ValidateModalResponsables() {

    //$.validator.addMethod("existeMatricula", function (value, element) {
    //    let estado = true;
    //    if ($.trim(value) !== "") {
    //        estado = ExisteMatricula();
    //        return estado;
    //    }
    //    return estado;
    //});

    //$.validator.addMethod("requiredMinExperto", function (value, element) {
    //    let minRegistro = $tableApExp.bootstrapTable('getData');
    //    let estado = minRegistro.length > 0 ? true : false;
    //    return estado;
    //});

    $.validator.addMethod("requiredMinSelected", function (value, element) {
        let retorno = false;
        let data = $tableAppExpertos.bootstrapTable('getData') || [];
        if (data.length > 0) {
            let selectedItems = data.filter(x => x.ItemSelected) || [];
            retorno = selectedItems.length > 0;
        }

        return retorno;
    });

    $("#formResponsables").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtMatriculaResponsable: {
                requiredSinEspacios: true,
                //email: true
            },
            ddlTipoResponsable: {
                requiredSelect: true
            }
        },
        messages: {
            txtMatriculaResponsable: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre del responsable"),
                //email: String.Format("Debes ingresar {0}.", "un correo electrónico válido")
            },
            ddlTipoResponsable: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo")
            }
        },
        errorPlacement: (error, element) => {
            //if (element.attr('name') === "txtMatriculaResponsable") {
            //    element.parent().parent().append(error);
            //} else {
            //    element.parent().append(error);
            //}
            element.parent().append(error);
        }
    });
}

function ValidateModalResponsablesNew() {

    //$.validator.addMethod("requiredMinSelected", function (value, element) {
    //    let retorno = false;
    //    let data = $tableAppExpertos.bootstrapTable('getData') || [];
    //    if (data.length > 0) {
    //        let selectedItems = data.filter(x => x.ItemSelected) || [];
    //        retorno = selectedItems.length > 0;
    //    }

    //    return retorno;
    //});

    $("#formResponsablesNew").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtMatriculaResponsableNew: {
                requiredSinEspacios: true,
                //email: true
            },
            ddlTipoResponsableNew: {
                requiredSelect: true
            }
        },
        messages: {
            txtMatriculaResponsableNew: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre del responsable"),
                //email: String.Format("Debes ingresar {0}.", "un correo electrónico válido")
            },
            ddlTipoResponsableNew: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo")
            }
        },
        errorPlacement: (error, element) => {
            //if (element.attr('name') === "txtMatriculaResponsable") {
            //    element.parent().parent().append(error);
            //} else {
            //    element.parent().append(error);
            //}
            element.parent().append(error);
        }
    });
}
function IrObtenerComponentesApp(Id) {
    InitAutocompletarBuilder($("#txtEquipo"), $("#hEquipoId"), ".containerFiltro", "/Equipo/GetEquipoByFiltro_ComponenteDiagramaInfra?filtro={0}&codigoApt=" + Id);
    InitAutocompletarBuilder($("#txtEquipo_Relacionado"), $("#hEquipoId_Relacionado"), ".containerFiltro_EquipoRelacionado", "/Equipo/GetEquipoByFiltro_ComponenteDiagramaInfra?filtro={0}&codigoApt=" + Id);
    $("#titleForm_Componentes").html("Configurar componentes");
    let request = {
        CodigoAPT: Id,
        AmbienteId: 1
    };
    $.ajax({
        url: URL_API_VISTA + `/ObtenerComponentesApp`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(request),
        dataType: "json",
        success: function (result) {
            MdAddOrEditRegistro_Componentes(true);
            $("#hdId_Componente").val(Id);
            $tableApp_Componentes.bootstrapTable("destroy");
            $tableApp_Componentes.bootstrapTable({ data: result });
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}
function MdAddOrEditRegistro_Componentes(EstadoMd) {
    LimpiarMdAddOrEditRegistro_Componentes();
    if (EstadoMd)
        $("#MdAddOrEditModal_Componentes").modal(opcionesModal);
    else
        $("#MdAddOrEditModal_Componentes").modal("hide");
}
function LimpiarMdAddOrEditRegistro_Componentes() {
    $("#formRegistro_Componentes").validate().resetForm();
    $(":input", "#formRegistro_Componentes")
        .not(":button, :submit, :reset, :hidden")
        .val("")
        .removeAttr("checked")
        .removeAttr("selected");
    ITEMS_REMOVEID_COMPONENTES = [];
    ITEMS_ACTIVARID_COMPONENTES = [];
    ITEMS_ADDID_COMPONENTES = [];
    $("#hdId_Componente").val("");
    $tableApp_Componentes.bootstrapTable("destroy");
    $tableApp_Componentes.bootstrapTable({ data: [] });
    toastr.clear();

    $("#txtEquipo").val("");
    $("#hEquipoId").val("0");
    $("#txtEquipo_Relacionado").val("");
    $("#hEquipoId_Relacionado").val("0");
}
function opcionesFormatterApp_Componentes(value, row) {
    let opciones = '';
    if (row.Estado == 'Activo') {
        opciones = `<a class='btn btn-danger' href="javascript:removeItem_Componentes('${row.RelacionReglasPorAppId}','${row.EquipoId_Relacion}');" title="Desactivar registro"><span class='icon icon-close'></span></a>`;
    } else if (row.Estado == 'Inactivo') {
        opciones = `<a class='btn btn-success' href="javascript:activarItem_Componentes('${row.RelacionReglasPorAppId}');" title="Activar registro"><span class='icon icon-check'></span></a>`;
    }
    
    return opciones;
}
function removeItem_Componentes(AEid, TEId) {
    bootbox.confirm({
        title: "Desactivar registro",
        message: "¿Estás seguro que deseas desactivar el registro?",
        buttons: {
            confirm: {
                label: 'Aceptar',
                className: 'btn-primary'
            },
            cancel: {
                label: 'Cancelar',
                className: 'btn-secondary'
            }
        },
        callback: function (result) {
            if (result) {
                let data = {
                    RelacionReglasPorAppId: AEid//,
                    //EquipoId_Relacion: TEId
                };

                let existe = ITEMS_REMOVEID_COMPONENTES.find(x => x.RelacionReglasPorAppId === AEid && x.EquipoId_Relacion === TEId) || null;
                if (existe === null) {
                    ITEMS_REMOVEID_COMPONENTES.push(data);
                }
                GuardarRegistro_Componentes();
                //$tableApp_Componentes.bootstrapTable('removeByUniqueId', AEid);
                //$tableApp_Componentes.bootstrapTable('updateByUniqueId', {
                //    id: AEid,
                //    row: { Estado: "Inactivo (por guardar)" }
                //});
            }
        }
    });
}
function activarItem_Componentes(RRPAid) {
    bootbox.confirm({
        title: "Activar registro",
        message: "¿Estás seguro que deseas activar el registro?",
        buttons: {
            confirm: {
                label: 'Aceptar',
                className: 'btn-primary'
            },
            cancel: {
                label: 'Cancelar',
                className: 'btn-secondary'
            }
        },
        callback: function (result) {
            if (result) {
                let data = {
                    RelacionReglasPorAppId: RRPAid//,
                    //EquipoId_Relacion: TEId
                };

                let existe = ITEMS_ACTIVARID_COMPONENTES.find(x => x.RelacionReglasPorAppId === RRPAid) || null;
                if (existe === null) {
                    ITEMS_ACTIVARID_COMPONENTES.push(data);
                }
                GuardarRegistro_Componentes();
                //$tableApp_Componentes.bootstrapTable('updateByUniqueId', {
                //    id: RRPAid,
                //    row: { Estado: "Activo (por guardar)" }
                //});

            }
        }
    });
}
function addItem_Componente() {

    //$(".inputMatricula").removeClass("ignore");
    //$(".guardarExperto").addClass("ignore");

    if ($("#formRegistro_Componentes").valid()) {
        AgregarComponenteConexion();
    }
}

function AgregarComponenteConexion() {
    //$tableApp_Componentes.bootstrapTable('append', {
    //    Nombre: $("#txtEquipo").val(),
    //    Nombre_EquipoRelacion: $("#txtEquipo_Relacionado").val()
    //    //FlagActivo: 'FlagActivo',
    //    //UsuarioCreacion: 'UsuarioCreacion',
    //    //FechaCreacionStr: 'FechaCreacionStr'
    //});
    //$("#txtEquipo").val("");
    //$("#hEquipoId").val("");
    //$("#txtEquipo_Relacionado").val("");
    //$("#hEquipoId_Relacionado").val("");


    if ($("#hEquipoId").val() != "0" && $("#hEquipoId_Relacionado").val() != "0") {
        if ($("#hEquipoId").val() != $("#hEquipoId_Relacionado").val()) {
            //debugger
            var lstConectados = $tableApp_Componentes.bootstrapTable("getData");
            //console.log(lstConectados);
            var flagEsDuplicado = false;
            for (var i = 0; i < lstConectados.length; i++) {
                if ((lstConectados[i].EquipoId == $("#hEquipoId").val() && lstConectados[i].EquipoId_Relacion == $("#hEquipoId_Relacionado").val())
                    || (lstConectados[i].EquipoId_Relacion == $("#hEquipoId").val() && lstConectados[i].EquipoId == $("#hEquipoId_Relacionado").val())
                ) {
                    flagEsDuplicado = true
                }
            }
            if (flagEsDuplicado==false) {
                $tableApp_Componentes.bootstrapTable('append', {
                    Nombre: $("#txtEquipo").val(),
                    Nombre_EquipoRelacion: $("#txtEquipo_Relacionado").val(),
                    //FlagActivo: 'FlagActivo',
                    //UsuarioCreacion: 'UsuarioCreacion',
                    //FechaCreacionStr: 'FechaCreacionStr'
                    EquipoId: $("#hEquipoId").val(),
                    EquipoId_Relacion: $("#hEquipoId_Relacionado").val(),
                    CodigoApt: $("#hdId_Componente").val()
                    //Estado: "Activo (por guardar)"
                });
                $("#txtEquipo").val("");
                $("#hEquipoId").val("0");
                $("#txtEquipo_Relacionado").val("");
                $("#hEquipoId_Relacionado").val("0");
                GuardarRegistro_Componentes();
            } else {
                bootbox.alert("La conexión ya existe");
            }

        } else {
            bootbox.alert("No es posible conectar un componente consigo mismo");
        }
        
    } else {
        bootbox.alert("Inserte un componente y su correspondiente conexión");
    }
    
}
function GuardarRegistro_Componentes() {
    //$(".inputMatricula").addClass("ignore");
    //$(".guardarExperto").removeClass("ignore");

    if ($("#formRegistro_Componentes").valid()) {

        $("#btnGuardarRegistro_Componentes").button("loading");

        ITEMS_ADDID_COMPONENTES = $tableApp_Componentes.bootstrapTable("getData");

        let data = {
            CodigoAPT: $("#hdId_Componente").val(),
            ListIdsRegistrar: ITEMS_ADDID_COMPONENTES,
            ListIdsEliminar: ITEMS_REMOVEID_COMPONENTES,
            ListIdsActivar: ITEMS_ACTIVARID_COMPONENTES,
        };

        $.ajax({
            url: URL_API_VISTA + "/ActualizarComponentesApp",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                $("#btnGuardarRegistro_Componentes").button("reset");
                if (result) {
                    toastr.success("El registro se actualizó correctamente.", TITULO_MENSAJE);
                    //MdAddOrEditRegistro_Componentes(false);
                    let request = {
                        CodigoAPT: $("#hdId_Componente").val(),
                        AmbienteId: 1
                    };
                    $.ajax({
                        url: URL_API_VISTA + `/ObtenerComponentesApp`,
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(request),
                        dataType: "json",
                        success: function (result) {
                            $tableApp_Componentes.bootstrapTable("destroy");
                            $tableApp_Componentes.bootstrapTable({ data: result });
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        },
                        async: false
                    });
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}