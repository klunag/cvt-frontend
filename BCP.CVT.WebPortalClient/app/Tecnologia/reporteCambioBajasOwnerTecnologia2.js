var $table = $("#tbl-tec");
var URL_API_VISTA = URL_API + "/Tecnologia";
var DATA_EXPORTAR = {};
var LIST_SUBDOMINIO = [];
var LIST_SQUAD = [];
var URL_API_VISTA_DASH = URL_API + "/Dashboard/Tecnologia";

$(function () {

    InitMultiSelect();

    setItemsCb($("#cbDomTec"), "/Dominio/ConSubdominio");
    SetItemsCustomField([], $("#cbSquadIdSearch"), TEXTO_SELECCIONE, "Id", "Descripcion");

    $("#cbDomTec").on('change', function () {
        getSubdominiosByDomCb(this.value, $("#txtSubTec"));
    });
    $("#cbFilDom").on('change', function () {
        getSubdominiosByDomCbMultiple($("#cbFilSub"));
    });

    listarTecSTD();

    CargarCombos2();

    //$("#cbProductoIdTecnologia").change(CbProductoIdTecnologia_Change);
    //$("#cbDominioIdProducto").change(CargarSubDominio);
    //$("#cbSubDominioIdProducto").change(CbSubDominioIdProducto_Change);

    //setDefaultHd($("#txtTecReceptora"), $("#hdTecReceptora"));

    //InitAutocompletarTribuCoeProducto($("#txtTribuCoeDisplayNameProducto"), $("#hdTribuCoeIdProducto"), '.tribuCoeContainer')
    InitAutocompletarProductoSearch($("#txtProductoBusTec"), $("#hdnProductoBusTec"), ".searchProductoContainer");
    //InitAutocompletarGrupoTicketRemedy($("#txtEquipoAprovisionamientoTecnologia"), $("#hdMatriculaEquipoAprovisionamiento"), ".equipoAprovisionamientoContainer");
    //InitAutocompletarGrupoTicketRemedy($("#txtGrupoTicketRemedyTecnologia"), $("#hdGrupoTicketRemedyIdTecnologia"), ".grupoTicketRemedyTecnologiaContainer");
    //InitAutocompletarAplicacionTecnologia($("#txtAplicacionTecnologia"), $("#hdAplicacionIdTecnologia"), ".aplicacionContainer");
    /*InitAutocompletarTecnologia($("#txtBusTec"), $("#hdnBusTec"), $(".searchContainer"));*/
    //InitAutocompletarBuilderLocal2($("#txtMatriculaExperto"), $("#hdMatriculaResponsablePrincipal"), ".respContainerPrincipal", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
    InitAutocompletarTribuCoeProductoFiltro($("#txtFilTribuCoeStr"), $("#hdFilTribuCoeId"), '.ownerTribuContainer', TribuCoeProductoOnSelectSearch, `${URL_API}/it-management/plataform-operations/v2/siga/unidadorganizativa/relaciontecnologia/listarcomboxfiltro`, TribuCoeProductoClear)

});



function TribuCoeProductoOnSelectSearch(ui) {
    cbTribuCoeIdProductoSearch_Change();
}

function TribuCoeProductoClear() {
    SetItemsCustomField([], $("#cbSquadIdSearch"), TEXTO_SELECCIONE, "Id", "Descripcion");
}

function InitAutocompletarTribuCoeProductoFiltro($searchBox, $IdBox, $container, fn = null, url = null, fnClear = null) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = (url || '') != '' ? `${url}?filtro=${request.term}` : String.Format("/GestionProducto/BuscarTribuCoePorFiltro?filtro={0}", request.term);

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
            $searchBox.val(ui.item.Descripcion);


            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                $searchBox.val(ui.item.Descripcion);
                if (typeof fn == "function") fn(ui);
            }
            return false;
        }
    })
        .keyup(function (e) {
            if ($searchBox.val() == "") {
                $IdBox.val("");
                if (typeof fnClear == "function") fnClear();
            }
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
            return $("<li>").append("<a style='display: block'><font>" + item.value + "</font></a>").appendTo(ul);
        };
}

function InitAutocompletarProductoSearch($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");

                $.ajax({
                    url: URL_API + "/Producto" + `/ListadoByDescripcion?descripcion=${encodeURIComponent(request.term)}`,
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
    })
        .keyup(function (e) {
            if ($searchBox.val() == "") {
                $IdBox.val("");
            }
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
            var a = document.createElement("a");
            var font = document.createElement("font");
            font.append(document.createTextNode(item.Fabricante + " " + item.Nombre));
            a.style.display = 'block';
            a.append(font);
            return $("<li>").append(a).appendTo(ul);
        };
}

function cbTribuCoeIdProductoSearch_Change(fn = null) {
    let codigoUnidad = $("#hdFilTribuCoeId").val() == "" || $("#hdFilTribuCoeId").val() == "0" ? null : $("#hdFilTribuCoeId").val();
    let urlControllerWithParams = `${URL_API}/it-management/plataform-operations/v2/siga/squad/relaciontecnologia/listarcomboxfiltro?codigoUnidad=${codigoUnidad}`;
    $.ajax({
        url: urlControllerWithParams,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (data) {
            SetItemsCustomField(data, $("#cbSquadIdSearch"), TEXTO_SELECCIONE, "Id", "Descripcion");
            if (typeof fn == "function") fn();
        },
        async: true,
        global: false
    });
}

function InitMultiSelect() {
    SetItemsMultiple([], $("#cbFilDom"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#cbFilSub"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#cbFiltroResolucionCambio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
}

function buscarTec() {
    listarTecSTD();
}
function listarTecSTD() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/ListarCambioBajasOwnerTecnologia",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        sortName: 'TribuCoeStrActual',
        sortOrder: 'asc',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.domIds = $.isArray($("#cbFilDom").val()) ? $("#cbFilDom").val() : [$("#cbFilDom").val()];
            DATA_EXPORTAR.subdomIds = $.isArray($("#cbFilSub").val()) ? $("#cbFilSub").val() : [$("#cbFilSub").val()];
            DATA_EXPORTAR.codigo = $("#txtFilCodigo").val();
            DATA_EXPORTAR.prodId = $("#hdnProductoBusTec").val() == "" ? null : $("#hdnProductoBusTec").val();
            DATA_EXPORTAR.tribuCoeStr = $("#txtFilTribuCoeStr").val();
            DATA_EXPORTAR.squadStr = $("#cbSquadIdSearch").val() == -1 ? "" : $("#cbSquadIdSearch option:selected").text();
            DATA_EXPORTAR.resolucionCambio = $.isArray($("#cbFiltroResolucionCambio").val()) ? $("#cbFiltroResolucionCambio").val() : [$("#cbFiltroResolucionCambio").val()];
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
        }
    });
}

function getSubdominiosByDomCbMultiple($cbSub) {
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
            $cb.find("option:gt(0)").remove();

            $.each(data, function (i, item) {
                $cb.append($('<option>', {
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

function CargarCombos2() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItemsCustomField(dataObject.MotivoDesactiva, $("#cbMotivoEliminacion"), TEXTO_SELECCIONE, "Id", "Descripcion");
                    SetItems(dataObject.Fuente, $("#cbFuenteTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.FechaCalculo, $("#cbFechaCalculosTecnologia"), TEXTO_SELECCIONE);

                    //FILTROS MULTISELECT
                    SetItemsMultiple(dataObject.Dominio, $("#cbFilDom"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.EstadoTecnologia, $("#cbFilEst"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TipoTec, $("#cbFilTipoTec"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.EstadoObs, $("#cbFilEstObs"), TEXTO_TODOS, TEXTO_TODOS, true);

                    SetItems(dataObject.TipoCicloVida, $("#cbTipoCicloVidaIdProducto"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Dominio, $("#cbDominioIdProducto"), TEXTO_SELECCIONE);
                    SetItems(LIST_SUBDOMINIO, $("#cbSubDominioIdProducto"), TEXTO_SELECCIONE);
                    LIST_SUBDOMINIO = dataObject.SubDominio;

                    SetItems(dataObject.ImplementacionAutomatizada, $("#cbAutomatizacionImplementadaIdTecnologia"), TEXTO_SELECCIONE);
                    SetItemsCustomField(dataObject.Motivo, $("#cbMotivoIdTecnologia"), TEXTO_SELECCIONE, "Id", "Nombre");
                    SetItems(dataObject.TipoTec, $("#cbTipoTecnologiaIdTecnologia"), TEXTO_SELECCIONE);

                    SetItems(dataObject.EstadoObs, $("#cbEstadoTecnologiaIdTecnologia"), TEXTO_SELECCIONE);

                    SetItems(dataObject.AplicaTecnologia, $("#cbPlataformaAplicaIdTecnologia"), TEXTO_SELECCIONE);
                    //SetItemsMultiple(dataObject.CompatibilidadSO, $("#cbCompatibilidadSOIdTecnologia"), NO_APLICA, TEXTO_TODOS, true);
                    //SetItemsMultiple(dataObject.CompatibilidadCloud, $("#cbCompatibilidadCloudIdTecnologia"), NO_APLICA, TEXTO_TODOS, true);
                    SetItems(dataObject.SustentoMotivo, $("#cbSustentoMotivoFechaFinSoporteTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EsquemaLicenciamientoSuscripcion || [], $("#cbEsquemaLicenciamientoSuscripcionIdTecnologia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoExperto, $("#ddlTipoExperto"), TEXTO_SELECCIONE);

                    SetItemsCustomField(LIST_SQUAD, $("#cbSquadIdProducto"), TEXTO_SELECCIONE, "Id", "Descripcion");

                    let lstRbtRevisionSeguridad = dataObject.RevisionSeguridad.map((x, i) => `<label class="radio-inline"><input type="radio" id="rbtRevisionSeguridadIdTecnologia_${x.Id}" name="rbtRevisionSeguridadIdTecnologia" value="${x.Id}" ${i == 0 ? "checked" : ""} /> ${x.Descripcion}</label>`).join('');
                    $("#lstRbtRevisionSeguridad").html(lstRbtRevisionSeguridad);
                    $("input[name='rbtRevisionSeguridadIdTecnologia']:checked").trigger("change");

                    let lstRbtUrlConfluence = dataObject.UrlConfluence.map((x, i) => `<label class="radio-inline"><input type="radio" id="rbtUrlConfluenceIdTecnologia_${x.Id}" name="rbtUrlConfluenceIdTecnologia" value="${x.Id}" ${i == 0 ? "checked" : ""} /> ${x.Descripcion}</label>`).join('');
                    $("#lstRbtUrlConfluence").html(lstRbtUrlConfluence);
                    $("input[name='rbtUrlConfluenceIdTecnologia']").change(RbtUrlConfluenceIdTecnologia_Change);
                    $("input[name='rbtUrlConfluenceIdTecnologia']:checked").trigger("change");

                    ARR_APLICATECNOLOGIA = dataObject.AplicaTecnologia;
                    SetItems(dataObject.AplicaTecnologia, $("#txtFilAplica"), TEXTO_TODOS);
                    SetItems(dataObject.AplicaTecnologia, $("#txtApliTec"), TEXTO_SELECCIONE);

                    CODIGO_INTERNO = dataObject.CodigoInterno;
                    SetItems(dataObject.FechaFinSoporte, $("#cbFilEsFecSop"), TEXTO_TODOS);
                    SetItemsMultiple(dataObject.EstadoResolucionCambioBajaOwner, $("#cbFiltroResolucionCambio"), TEXTO_TODOS, TEXTO_TODOS, true);


                    LIST_ESTADO_ESTANDAR = dataObject.TipoTec;
                    //DATA_INPUT_OPCIONAL = dataObject.EstadoObs;

                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function RbtUrlConfluenceIdTecnologia_Change() {
    let value = $("input[name='rbtUrlConfluenceIdTecnologia']:checked").val();
    let enabledText = value == 1;
    if (!enabledText) $("#txtUrlConfluenceTecnologia").val("");
    $("#txtUrlConfluenceTecnologia").prop("readonly", !enabledText);
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
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Descripcion));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}


function exportarCambioBajasOwnersTec() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }
    DATA_EXPORTAR.domIds = $.isArray($("#cbFilDom").val()) ? $("#cbFilDom").val() : [$("#cbFilDom").val()];
    DATA_EXPORTAR.subdomIds = $.isArray($("#cbFilSub").val()) ? $("#cbFilSub").val() : [$("#cbFilSub").val()];
    DATA_EXPORTAR.codigo = $("#txtFilCodigo").val();
    DATA_EXPORTAR.prodId = $("#hdnProductoBusTec").val() == "" ? null : $("#hdnProductoBusTec").val();
    DATA_EXPORTAR.tribuCoeStr = $("#txtFilTribuCoeStr").val();
    DATA_EXPORTAR.squadStr = $("#cbSquadIdSearch").val() == -1 ? "" : $("#cbSquadIdSearch option:selected").text();
    DATA_EXPORTAR.resolucionCambio = $.isArray($("#cbFiltroResolucionCambio").val()) ? $("#cbFiltroResolucionCambio").val() : [$("#cbFiltroResolucionCambio").val()];
    DATA_EXPORTAR.sortName = 'TribuCoeStrActual';
    DATA_EXPORTAR.sortOrder = 'asc';

    let url = `${URL_API_VISTA}/ExportarCambioBajasOwnerTec`;
    $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(DATA_EXPORTAR),
        contentType: "application/json",
        dataType: "json",
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