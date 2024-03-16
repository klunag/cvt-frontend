var $table = $("#tbl-tecAprob");

var URL_API_VISTA = URL_API + "/Qualy";
var URL_API_VISTA2 = URL_API + "/Aplicacion/ConfiguracionPortafolio";
var urlApiSubdom = URL_API + "/Subdominio";
var urlApiTipo = URL_API + "/Tipo";
var urlApiFam = URL_API + "/Familia";
var URL_API_VISTA_DASH = URL_API + "/Dashboard/Tecnologia";
const NO_APLICA = "NO APLICA";
//var URL_API_USUARIO = URL_API + "/Usuario";

var ItemNumeros = [0, 1, 2, 3, 4, 5];
var locale = { OK: 'OK', CONFIRM: 'Observar', CANCEL: 'Cancelar' };
var placeholderObs = "Comentarios asociados a la observación";
var LIST_SUBDOMINIO = [];
var DATA_SUBDOMINIO = [];
var DATA_TECNOLOGIA = [];
var DATA_APLICACION = [];
var DATA_PRODUCTO = [];
var DATA_EQUIVALENCIA = [];

var LIST_RESPONSABLE = [];
var LIST_ARQUETIPO = [];
var LIST_APLICACION = [];
var LIST_SQUAD = [];
var LIST_EQUIVALENCIA = [];

var DATA_EXPORTAR_TEC_EQ = {};
var ESTADO = { Vigente: 1, Deprecado: 2, Obsoleto: 3 };
var ESTADO_TECNOLOGIA = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var CODIGO_INTERNO = 0;
const TITULO_MENSAJE = "Gestión de las Tecnologías";
const TITULO_MENSAJE_APROBACION = "Aprobar tecnología";
const TITULO_MENSAJE_OBSERVACION = "Observar tecnología";
const TITULO_MENSAJE_EQUIVALENCIA = "Equivalencia de tecnología";
var DATOS_RESPONSABLE = {};

var TIPO_METODO = { APROBAR: 1, GUARDARCAMBIOS: 2, OBSERVAR: 3 };
var ACCESO_DIRECTO = { BASICO: "1", CICLOVIDA: "2", RIESGO: "3", RESPONSABILIDADES: "5", EQUIVALENCIAS: "6", FAMILIA: "7" };
//var ACCESO_DIRECTO = { BASICO: "1", CICLOVIDA: "2", RIESGO: "3", CLASIFICACION: "4", RESPONSABILIDADES: "5", EQUIVALENCIAS: "6", FAMILIA: "7" };
var COMBO_SELECTED = "";
var FECHA_CALCULO = { EXTENDIDA: "2", SOPORTE: "3", INTERNA: "4" };

var DATA_INPUT_OPCIONAL = {};
var FLAG_ACTIVO_TECNOLOGIA = 0;
var MIGRAR_DATA = { EQUIVALENCIA: 1, INFORMACION: 2 };
const IDS_RESPONSABLES_TECNOLOGIA = { OWNER: 1, ARQ_SEGURIDAD: 2, ARQ_TECNOLOGIA: 3 };
var TEMP_MIGRAR = 0;

var MENSAJE_CARGA_MASIVA = "";
const TITULO_CARGA_MASIVA = "Resumen de importación de tecnologías";
const EDIT_TEC_FROM = {
    ACCESO_DIRECTO: 1,
    NOMBRE: 2
};
let userCount = 0;

$(function () {
    getCurrentUser();
    //INICIALIZACION DE COMBOS
    //InitMultiSelect();   

    //setItemsCb($("#cbFilDom"), "/Dominio/ConSubdominio");
    $("#txtFilAplica").multiselect();

    cargarCombos();

    $("#cbFilDom").on('change', function () {
        getSubdominiosByDomCbMultiple($("#cbFilSub"));
    });

    $("#cbFilGestionadoPor").on('change', function () {
        getEquiposByGestionado($("#cbFilEquipos"));
    });

    $("#txtBusApp").on('change', function () {
        if ($("#txtBusApp").val() == "") {
            $("#hdnBusApp").val("");
        }
    });   

    $("#txtBusTec").on('change', function () {
        if ($("#txtBusTec").val() == "") {
            $("#hdnBusTec").val("");
        }
    });  

    //listarTecSTD();
        
    InitAutocompletarProductoSearch($("#txtBusTec"), $("#hdnBusTec"), $(".searchContainer"));
    InitAutocompletarBuilder($("#txtBusApp"), $("#hdnBusApp"), ".appContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");    

});

$(document).ajaxComplete(function (e) {
    if (userCurrent != null && userCount == 0) {
        userCount++;
        if (userCurrent.Perfil.includes("E195_Administrador") || userCurrent.Perfil.includes("E195_Seguridad") || userCurrent.Perfil.includes("E195_Auditoria")) {
            $("#btnRepTec").show();
            $("#botonesPerfil").show();
        }
        else {
            $("#botonesPerfil").hide();
            $("#btnRepTec").show();
        }
    }
});

function InitAutocompletarAplicacionTecnologia($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Aplicacion" + "/GetAplicacionRelacionarByFiltro?filtro=" + request.term,
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

            LimpiarValidateErrores($("#formAddOrEditTec"));
            $IdBox.val(ui.item.IdAplicacion);
            $(".field-tecnologia").addClass("ignore");
            $searchBox.removeClass("ignore");
            let data = $tblAplicaciones.bootstrapTable("getData");
            if ($("#formAddOrEditTec").valid()) {
                let index = data.length + 1;
                debugger;
                $tblAplicaciones.bootstrapTable("append", {
                    AplicacionId: ui.item.IdAplicacion,
                    Aplicacion: {
                        Id: ui.item.IdAplicacion,
                        CategoriaTecnologica: ui.item.CategoriaTecnologica,
                        Nombre: ui.item.Nombre,
                        TipoActivoInformacion: ui.item.TipoActivo,
                        Owner_LiderUsuario_ProductOwner: ui.item.UsuarioLider,
                    }
                });

                $IdBox.val("");
                $searchBox.val("");
            }
            data = $tblAplicaciones.bootstrapTable("getData");
            MostrarCampoObligatorio("#txtTribuCoeDisplayNameProducto", ".form-group", data.length == 0);
            $(".field-tecnologia").removeClass("ignore");
            $searchBox.addClass("ignore");

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitMultiSelect() {
    SetItemsMultiple([], $("#cbFilDom"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#cbFilSub"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    //SetItemsMultiple([], $("#cbFilGestionadoPor"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
}

function getSubdominiosByDom(_domId) {
    var domId = _domId;
    var data = "";
    var subTags = [];
    $.ajax({
        url: URL_API_VISTA + "/Subdominios/" + domId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            data = result;
            $.each(data, function (key, val) {
                var item = {};
                item.Id = val.Id;
                item.Nombre = val.Nombre;
                item.value = val.Nombre;
                subTags.push(item);
            });
            DATA_SUBDOMINIO = subTags;
        },
        complete: function () {
            autocompletarSubdominios(subTags, $('#txtSubTec'), $("#hIdSubTec"), $(".subtecContainer"));
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function autocompletarSubdominios(itemsX, inputX, inputHX, containerX) {
    //var $searchBox = inputX;
    var $inputX = inputX;
    var $inputHX = inputHX;
    var $containerX = containerX;
    $inputX.autocomplete({
        appendTo: $containerX,
        minLength: 0,
        source: itemsX,
        focus: function (event, ui) {
            //$inputX.val(ui.item.label);
            $inputX.val(ui.item.Nombre);
            return false;
        },
        select: function (event, ui) {
            //$inputHX.val(ui.item.value);
            //$inputX.val(ui.item.label);
            $inputHX.val(ui.item.Id);
            $inputX.val(ui.item.Nombre);
            getMatriculaDueno(ui.item.Id);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Nombre + "</font></a>")
            .appendTo(ul);
    };
}

function buscar() {
    if ($("#cbFilGestionadoPor").val() == "-1" && $("#hdnBusApp").val() == "") {
        $table.bootstrapTable('destroy');
        toastr.error("Seleccione al menos una <strong>Aplicación</strong> o una unidad dentro del <strong>filtro Gestionado Por</strong>.", "CVT");
    } else {
        listarTecSTD();
    }

}

function getSubdominiosByDomCb(_domId, $cbSub) {
    var domId = _domId;

    $cbSub.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $.ajax({
        url: URL_API_VISTA + "/Subdominios/" + domId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            data = result;
            $cbSub.find("option:gt(0)").remove();

            $.each(data, function (i, item) {
                $cbSub.append($('<option>', {
                    value: item.Id,
                    text: item.Nombre
                }));
            });
        },
        complete: function () {
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function getSubdominiosByDomCbMultiple($cbSub) {
    //var domId = _domIds;
    let idsDominio = $.isArray($("#cbFilDom").val()) ? $("#cbFilDom").val() : [$("#cbFilDom").val()];

    if (idsDominio !== null) {
        $.ajax({
            url: URL_API_VISTA_DASH + "/ListarCombos/Dominio",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(idsDominio),
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        data = dataObject.Subdominio;
                        SetItemsMultiple(data, $cbSub, TEXTO_TODOS, TEXTO_TODOS, true);

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
}

function getEquiposByGestionado($cbSub) {
    //var domId = _domIds;
    let idsGestionado = $.isArray($("#cbFilGestionadoPor").val()) ? $("#cbFilGestionadoPor").val() : [$("#cbFilGestionadoPor").val()];

    if (idsGestionado !== null) {
        $.ajax({
            url: URL_API_VISTA_DASH + "/ListarCombos/Equipos",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(idsGestionado),
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        data = dataObject.Equipos;
                        SetItemsMultiple(data, $cbSub, TEXTO_TODOS, TEXTO_TODOS, true);

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
}

function setItemsCb(cbx, ctrlx) {
    var $cb = cbx;

    $cb.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $.ajax({
        url: URL_API + ctrlx,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            var data = result;
            //$cb.find("option:gt(0)").remove();

            //$.each(data, function (i, item) {
            //    $cb.append($('<option>', {
            //        value: item.Id,
            //        text: item.Nombre
            //    }));
            //});

            SetItems(data, $cb, TEXTO_SELECCIONE);

        },
        complete: function () {

        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function cargarCombos() {

    var data = {};


    $.ajax({
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA2 + "/VulnerabilidadesCombo",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.GestionadoPor, $("#cbFilGestionadoPor"), TEXTO_SELECCIONE);
                    //SetItemsMultiple(dataObject.GestionadoPor, $("#cbFilGestionadoPor"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
                    SetItemsMultiple(dataObject.Dominio, $("#cbFilDom"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
                    SetItemsMultiple([], $("#cbFilSub"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
                    SetItemsMultiple([], $("#cbFilEquipos"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
                 
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function listarTecSTD() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/VulnerabilidadesAplicacion",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        sortName: 'CodigoApt',
        sortOrder: 'asc',
        pageSize: REGISTRO_PAGINACION_ALT,
        pageList: OPCIONES_PAGINACION_ALT,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Tecnologia =  $("#hdnBusTec").val() == "" ? 0 : $("#hdnBusTec").val();
            DATA_EXPORTAR.codigoApt = $("#hdnBusApp").val() == "" ? "" : $("#hdnBusApp").val();
            DATA_EXPORTAR.estado = CaseIsNullSendExport($("#txtFilAplica").val());
            DATA_EXPORTAR.QID = $.trim($("#txtBusQID").val()) == "" ? 0 : $.trim($("#txtBusQID").val());
            DATA_EXPORTAR.dominios = CaseIsNullSendExport($("#cbFilDom").val());
            DATA_EXPORTAR.subdominios = CaseIsNullSendExport($("#cbFilSub").val());
            DATA_EXPORTAR.gestionado = $("#cbFilGestionadoPor").val();
            DATA_EXPORTAR.squads = CaseIsNullSendExport($("#cbFilEquipos").val());
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

function exportar() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    if ($("#cbFilGestionadoPor").val() == "-1" && $("#hdnBusApp").val() == "") {
        toastr.error("Seleccione al menos una <strong>Aplicación</strong> o una unidad dentro del <strong>filtro Gestionado Por</strong>.", "CVT");
        return false;
    }

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Tecnologia = $("#hdnBusTec").val() == "" ? 0 : $("#hdnBusTec").val();
    DATA_EXPORTAR.codigoApt = $("#hdnBusApp").val() == "" ? "" : $("#hdnBusApp").val();
    DATA_EXPORTAR.estado = CaseIsNullSendExport($("#txtFilAplica").val()); 
    DATA_EXPORTAR.QID = $.trim($("#txtBusQID").val()) == "" ? 0 : $.trim($("#txtBusQID").val());
    DATA_EXPORTAR.dominios = CaseIsNullSendExport($("#cbFilDom").val());
    DATA_EXPORTAR.subdominios = CaseIsNullSendExport($("#cbFilSub").val());
    DATA_EXPORTAR.gestionado = CaseIsNullSendExport($("#cbFilGestionadoPor").val());
    DATA_EXPORTAR.squads = CaseIsNullSendExport($("#cbFilEquipos").val());
    DATA_EXPORTAR.pageNumber = 1;
    DATA_EXPORTAR.pageSize = 1;
    DATA_EXPORTAR.sortName = "CodigoAPT";
    DATA_EXPORTAR.sortOrder = "asc";

    let url = `${URL_API_VISTA}/ExportarConsolidadoNew?Tecnologia=${DATA_EXPORTAR.Tecnologia}&QID=${DATA_EXPORTAR.QID}&subdominios=${DATA_EXPORTAR.subdominios}&dominios=${DATA_EXPORTAR.dominios}&gestionado=${DATA_EXPORTAR.gestionado}&squads=${DATA_EXPORTAR.squads}&estado=${DATA_EXPORTAR.estado}&codigoApt=${DATA_EXPORTAR.codigoApt}`;
    //let url = `${URL_API_VISTA}/ExportarConsolidadoNew?nombre=${DATA_EXPORTAR.nombre}&dominioIds=${DATA_EXPORTAR.domIds}&subdominioIds=${DATA_EXPORTAR.subdomIds}&productoId=${DATA_EXPORTAR.productoId}&aplica=${DATA_EXPORTAR.aplica}&codigo=${DATA_EXPORTAR.codigo}&dueno=${DATA_EXPORTAR.dueno}&equipo=${DATA_EXPORTAR.equipo}&tipoTecIds=${DATA_EXPORTAR.tipoTecIds}&estObsIds=${DATA_EXPORTAR.estObsIds}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function InitAutocompletarAplicacion($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Aplicacion" + "/GetAplicacionByFiltro?filtro=" + request.term,
                    //data: JSON.stringify({
                    //    filtro: request.term
                    //}),
                    //dataType: "json",
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        DATA_APLICACION = data;
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarTecnologia($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API_VISTA + "/GetTecnologiaByClaveById",
                    data: JSON.stringify({
                        filtro: request.term,
                        id: ($("#hdTecnologiaId").val() === "" || $("#hdTecnologiaId").val() === "0") ? null : parseInt($("#hdTecnologiaId").val())
                    }),
                    dataType: "json",
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_APLICACION = data;
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarTecnologiaForBusqueda($searchBox, $IdBox, $Container, $IdTecPadre, _flagActivo) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                let id = ($IdTecPadre !== null) ? $IdTecPadre.val() : null;
                let flagActivo = _flagActivo;
                //$IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetTecnologiaForBusqueda?filtro=${request.term}&id=${id}&flagActivo=${flagActivo}`,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    success: function (data) {
                        response($.map(data, function (item) {
                            //console.log(item);
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            //$IdBox.val(ui.item.Id);
            if ($IdBox !== null) $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            //obtenerFamiliaById(ui.item.Id);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function InitAutocompletarBuilderLocal($searchBox, $IdBox, $container, urlController) {
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
                //$IdBox.val(ui.item.id);
                $IdBox.val(ui.item.matricula);
                //$("#txtCorreo").val(ui.item.mail);
                //$("#txtNombreResponsable").val(ui.item.displayName);
                //$("#txtMatriculaResponsable").val(ui.item.matricula);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function exportAllVulnerabilidades() {
    let urlReporteAll = "";

    if (userCurrent.Perfil.includes("E195_Administrador") || userCurrent.Perfil.includes("E195_Auditoria")) {
        urlReporteAll = `${URL_API_VISTA}/ReporteConsolidadoExportar?tipo=1`;
    }
    else if (userCurrent.Perfil.includes("E195_Seguridad")) {
        urlReporteAll = `${URL_API_VISTA}/ReporteConsolidadoExportar?tipo=2`;
    }

    $.ajax({
        url: urlReporteAll,
        contentType: "application/vnd.ms-excel",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            let bytes = Base64ToBytes(data.data);
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

function exportVulnerabilidadesActivas() {
    let urlReporteActive = "";
    if (userCurrent.Perfil.includes("E195_Administrador") || userCurrent.Perfil.includes("E195_Auditoria")) {
        urlReporteActive = `${URL_API_VISTA}/ReporteConsolidadoActiveExportar?tipo=1`;
    }
    else if (userCurrent.Perfil.includes("E195_Seguridad")) {
        urlReporteActive = `${URL_API_VISTA}/ReporteConsolidadoActiveExportar?tipo=2`;
    }

    $.ajax({
        url: urlReporteActive,
        contentType: "application/vnd.ms-excel",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            let bytes = Base64ToBytes(data.data);
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

function InitAutocompletarProductoSearch($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");

                $.ajax({
                    url: URL_API + "/Producto" + `/ListadoByDescripcion?descripcion=${request.term}`,
                    //data: JSON.stringify({
                    //    descripcion: ,
                    //    id: ($("#hdTecnologiaId").val() === "" || $("#hdTecnologiaId").val() === "0") ? null : parseInt($("#hdTecnologiaId").val())
                    //}),
                    dataType: "json",
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else
                return response(false);
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.Fabricante + " " + ui.item.Nombre);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Fabricante + " " + ui.item.Nombre);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Fabricante + " " + item.Nombre));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}