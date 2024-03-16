var $tableTecnologia = $("#tblRegistroTecnologia");
var AVISO_PROCESO_2DO_PLANO = "Hay un proceso en segundo plano ejecutándose, cierre la ventana y vuelva a intertarlo";
var URL_API_VISTA = URL_API + "/Relacion";
var DATA_TECNOLOGIA = [];
var DATA_APLICACION = [];
var DATA_EQUIPO = [];
var DATA_EQUIPO_TECNOLOGIA = [];
var DATA_TECNOLOGIA_DESMARCADO = [];
var DATA_RELEVANCIA = [];
var DATA_TIPO_ACTUAL = 0;
var RELACION_DETALLE_EDIT = [];
var DATA_ESTADO = [];
var ESTADO_RELACION = { PENDIENTE: 1, APROBADO: 2, DESAPROBADO: 3, PENDIENTEELIMINACION: 0, ELIMINADO: 5 };
var ESTADOS_APOYO = [ESTADO_RELACION.PENDIENTE, ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO, ESTADO_RELACION.PENDIENTEELIMINACION, ESTADO_RELACION.ELIMINADO];
var ESTADOS_APOYO_PENDIENTE = [ESTADO_RELACION.PENDIENTE, ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO];
var ESTADOS_APOYO_PENDIENTE_MODAL = [ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO];
var ESTADOS_APOYO_PENDIENTEELIMINACION = [ESTADO_RELACION.PENDIENTEELIMINACION, ESTADO_RELACION.ELIMINADO, ESTADO_RELACION.APROBADO];
var ESTADOS_APOYO_PENDIENTEELIMINACION_MODAL = [ESTADO_RELACION.ELIMINADO, ESTADO_RELACION.APROBADO, ESTADO_RELACION.DESAPROBADO];
var DATA_EXPORTAR = {};
var RELEVANCIA_ALTA = 1;
var FLAG_ACTIVO_TECNOLOGIA = 0;

var $tblAppSide = $("#tblAppSide");
var $tblAppFilter = $("#tblAppFilter");
const TIPO = { TIPO_EQUIPO: "1", TIPO_TECNOLOGIA: "2", TIPO_APLICACION: "3", TIPO_SERVICIONUBE: "4" };
const ESTADO_TECNOLOGIA = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
const URL_AUTOCOMPLETE_EQUIPO = { DEFAULT: "GetEquipoByFiltro", SERVICIONUBE: "GetEquipoServicioNubeByFiltro", FILTROS: "GetEquipoFiltros" };
const TITULO_MENSAJE = "Relación de Tecnología";
const MENSAJE_RELACION_TRUE = "Este {0} le pertenece a la aplicación";
const MENSAJE_RELACION_FALSE = "Este {0} no le pertenece a la aplicación, solo se usa para temas específicos";
const URL_REDIRECT_SUCCESS = "/Relacion/Bandeja";
const SUBDOMINIO_IDS = {
    LP: "14|13",
    FW: "14",
    NAVEGADOR_WEB: "7"
};
const SIDE_FILTER_IDS = {
    TODOS: 1,
    SERVICIO_NUBE: 2,
    SERVIDOR: 3,
    LP: 4,
    FW: 5,
    NAVEGADOR_WEB: 6,
    TECNOLOGIAS: 7,
    SERVICIO_BROKER: 8
};

$(function () {
    InitValidateMain();
    InitActions();
    InitTables();
    InitAutocompletes();

    setDefaultHd($("#txtAppFilter"), $("#hdAppFilterId"));
    InitHdTecnologia($("#txtTecnologia"), $("#hdTecnologiaId"));
});

const InitHdTecnologia = ($textBox, $hdId) => {
    $textBox.keyup(function () {
        if ($.trim($(this).val()) === "") {
            $hdId.val("0");
            $("#txtDominio, #txtSubdominio, #txtTipoTecnologia, #txtFechaFinSoporte").val("");
        }
    });
};

const InitAutocompletes = () => {
    InitAutocompletarAplicacion($("#txtAppFilter"), $("#hdAppFilterId"), ".AppFilterContainer", 0);
    InitAutocompletarTecnologia($("#txtTecnologia"), $("#hdTecnologiaId"), ".tecnologiaContainer");
};

const InitActions = () => {
    $("#btnAdd").click(AddItem);
    $("#btnShowFilter").click(ShowFilter);
    $("#btnSave").click(SaveAll);

    $("#btnSearch").click(SearchByFilter);
    $("#btnAddAll").click(AddAll);
};

const SearchByFilter = () => {
    ListByFilter();
};

const AddAll = () => {
    let data = $tblAppFilter.bootstrapTable("getData") || [];
    if (data.length === 0) {
        toastr.error("No existe registros para agregar.", TITULO_MENSAJE);
        return;
    }

    data = ListAllByFilter();

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    let dataRegistered = $tblAppSide.bootstrapTable("getData") || [];
    let dataFiltered = [];
    if (dataRegistered.length > 0) {
        let codigoAPTsRegistered = dataRegistered.map(x => x.Id);
        dataFiltered = data.filter(x => !codigoAPTsRegistered.includes(x.CodigoAPT));
    } else {
        dataFiltered = data;
    }

    let dataFinal = dataFiltered.map(x => {
        let item = {
            Id: x.CodigoAPT,
            Aplicacion: x.NombreCompleto,
            Tipo: x.TipoActivo,
            Estado: x.Estado
        };
        return item;
    });

    $tblAppSide.bootstrapTable('append', dataFinal);

    waitingDialog.hide();
    toastr.success("Se agregaron los registros correctamente.", TITULO_MENSAJE);

    OpenCloseModal($("#FilterModal"), false);
};

const InitTables = () => {
    $tblAppSide.bootstrapTable("destroy");
    $tblAppSide.bootstrapTable({ data: [] });
    $tblAppFilter.bootstrapTable("destroy");
    $tblAppFilter.bootstrapTable({ data: [] });
};

const AddItem = () => {
    let hdIdFilter = $.trim($("#hdAppFilterId").val());
    let appFilter = $.trim($("#txtAppFilter").val());

    if (hdIdFilter === "" || hdIdFilter === "0" || appFilter === "") {
        toastr.error("Debes ingresar una aplicación válida.", TITULO_MENSAJE);
        return;
    }

    let item = $tblAppSide.bootstrapTable("getRowByUniqueId", hdIdFilter);
    if (item !== null) {
        toastr.error("Aplicación ya registrada.", TITULO_MENSAJE);
        return;
    }

    $tblAppSide.bootstrapTable('append', {
        Id: hdIdFilter,
        Aplicacion: appFilter,
        Tipo: $("#hdTipoAplicacion").val(),
        Estado: $("#hdEstadoAplicacion").val()
    });

    $("#hdAppFilterId").val("0");
    $("#txtAppFilter").val("");
    $("#hdTipoAplicacion").val("");
    $("#hdEstadoAplicacion").val("");
    LimpiarValidateErrores($("#formAddOrEdit"));
};

function accionesFormatter(value, row, index){
    return `<a href="javascript:RemoveAppItem('${row.Id}')" title="Eliminar aplicación"><i class="glyphicon glyphicon-trash"></i></a>`;
}

function nombreFormatter(value, row, index) {
    let html = `<label class="control-label">${row.Aplicacion}</label>
               <p>${row.Tipo}<br />${row.Estado}</p>`;

    return html;
}

const RemoveAppItem = (Id) => {
    $tblAppSide.bootstrapTable('remove', {
        field: 'Id', values: [Id]
    });
};

const ShowFilter = () => {
    ClearFilterModal();
    $("#FilterModal").modal();
};

const ClearFilterModal = () => {
    $("#txtTipoActivoFilter, #txtGestionadoPorFilter").val("");
    $("#txtEstadoAppFilter, #txtJefeEquipoFilter").val("");
    $("#txtLiderUsuarioFilter, #txtLiderUsuarioFilter").val("");
    $tblAppFilter.bootstrapTable("destroy");
    $tblAppFilter.bootstrapTable({ data: [] });
};

const SaveAll = () => {
    if ($("#formAddOrEdit").valid()) {
        $("#btnSave").button("loading");

        let data = $tblAppSide.bootstrapTable("getData") || [];
        let arrCodigoAPTs = data.map(x => x.Id).join("|");
        let hdTecnologiaId = $("#hdTecnologiaId").val();

        let objData = {
            CodigoAPTArr: arrCodigoAPTs,
            TecnologiaId: hdTecnologiaId,
        };

        $.ajax({
            url: URL_API_VISTA + "/Actualizacion/Registrar",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            data: JSON.stringify(objData),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null && dataObject) {
                        toastr.success("Actualizado correctamente.", TITULO_MENSAJE);
                    } else {
                        bootbox.alert("Sucedió un error con el servicio", function () { });
                    }
                }
            },
            complete: function (data) {
                $("#btnSave").button("reset");
                if (ControlarCompleteAjax(data))
                    window.location.href = URL_REDIRECT_SUCCESS;
                else
                    bootbox.alert("Sucedió un error con el servicio", function () { });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
};

function InitValidateMain() {
    $.validator.addMethod("existeTecnologia", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $.trim($("#hdTecnologiaId").val()) !== "0") {
            estado = ExisteTecnologia();
            return estado;
        }

        return estado;
    });

    $.validator.addMethod("requiredMinRow", function (value, element) {
        let data = $tblAppSide.bootstrapTable("getData") || [];
        return data.length > 0;
    });

    $("#formAddOrEdit").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtTecnologia: {
                requiredSinEspacios: true,
                existeTecnologia: true
            },
            hdTableRule: {
                requiredMinRow: true
            }
        },
        messages: {
            txtTecnologia: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la tecnología"),
                existeTecnologia: String.Format("{0} seleccionada no existe.", "La tecnología")
            },
            hdTableRule: {
                requiredMinRow: "Debes agregar como mínimo una aplicación"
            }
        }
    });
}

function InitAutocompletarAplicacion($searchBox, $IdBox, $container, valor) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Aplicacion" + "/GetAplicacionRelacionarByFiltro?filtro=" + request.term,
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
            setDataAplicacion(ui.item);
            if (valor === 1) {
                obtenerEquiposByAppVinculo(ui.item.Id);
                //LimpiarValidateErrores($("#formAppVin"));
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Descripcion));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}

function setDataAplicacion(item) {
    $("#hdTipoAplicacion").val(item.TipoActivo);
    $("#hdEstadoAplicacion").val(item.EstadoAplicacion);
}

function InitAutocompletarTecnologia($searchBox, $IdBox, $container, subdominioIds = "") {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + `/Tecnologia/GetTecnologiaByClave?filtro=${request.term}&subdominioIds=${subdominioIds}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        DATA_TECNOLOGIA = data;
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
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.label);
            setReadOnlyDataTecnologia(ui.item);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Descripcion));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}

function setReadOnlyDataTecnologia(item) {
    $("#txtDominio").val(item.Dominio);
    $("#txtSubdominio").val(item.Subdominio);
    $("#txtTipoTecnologia").val(item.TipoTecnologia);
    $("#txtFechaFinSoporte").val(item.FechaFinSoporteStr);
}

const ListAllByFilter = () => {
    let rows = [];
    let objData = {
        All: true,
        TipoActivo: $.trim($("#txtTipoActivoFilter").val()),
        GestionadoPor: $.trim($("#txtGestionadoPorFilter").val()),
        EstadoAplicacion: $.trim($("#txtEstadoAppFilter").val()),
        JefeEquipo: $.trim($("#txtJefeEquipoFilter").val()),
        LiderUsuario: $.trim($("#txtLiderUsuarioFilter").val()),
        TTL: $.trim($("#txtTTLFilter").val()),
        pageNumber: 1,
        pageSize: REGISTRO_PAGINACION,
        sortName: "Id",
        sortOrder: "asc"
    };

    //waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: "POST",
        url: URL_API_VISTA + "/Actualizacion/ListarByFiltros",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(objData),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let response = dataObject;
                    rows = response.Rows;
                } else {
                    bootbox.alert("Sucedió un error con el servicio", function () { });
                }
            }
        },
        complete: function (data) {
            //waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

    return rows;
};

function ListByFilter() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblAppFilter.bootstrapTable('destroy');
    $tblAppFilter.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Actualizacion/ListarByFiltros",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.TipoActivo = $.trim($("#txtTipoActivoFilter").val());
            DATA_EXPORTAR.GestionadoPor = $.trim($("#txtGestionadoPorFilter").val());
            DATA_EXPORTAR.EstadoAplicacion = $.trim($("#txtEstadoAppFilter").val());
            DATA_EXPORTAR.JefeEquipo = $.trim($("#txtJefeEquipoFilter").val());
            DATA_EXPORTAR.LiderUsuario = $.trim($("#txtLiderUsuarioFilter").val());
            DATA_EXPORTAR.TTL = $.trim($("#txtTTLFilter").val());
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

function ExisteTecnologia() {
    let estado = false;
    //let nombre = $("#txtTecnologia").val();
    let Id = $("#hdTecnologiaId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Tecnologia" + `/ExisteTecnologia?Id=${Id}`,
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