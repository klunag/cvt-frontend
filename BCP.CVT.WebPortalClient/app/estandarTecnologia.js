var $table = $("#tblTecnologiaEstandar");
var URL_API_VISTA = URL_API + "/Tecnologia";
var URL_API_VISTA_DASH = URL_API + "/Dashboard/Tecnologia";
var DATA_TIPO_TECNOLOGIA = [];

const TIPO_NO_ESTANDAR = "4";
const INIT_FILTER_TIPO_TECNOLOGIA = [1, 2];
const TEXTO_IR_SITIO = "[Ir al sitio]";
const TEXTO_REGISTROS_NO_ENCONTRADOS = "No se han encontrado registros con los criterios de filtros indicados";
const ICONO_ENLACE = "<span class='icon icon-external-link'></span>";
const URL_GT_FORMAT = "/GestionTecnologia/NewTecnologia?Id={0}&id_tec={1}&id_estadotec={2}";
const URL_CODIGO_FORMAT = "/GestionTecnologia/NewTecnologia?codigo={0}";
const URL_DESCRIPCION_FORMAT = "/GestionTecnologia/NewTecnologia?Id={0}";
const PERFILES = {
    ADMINISTRADOR: "E195_Administrador",
    GESTOR_TECNOLOGIA: "E195_GestorTecnologia"
};

let ARR_PERFILES_USUARIO = [];
let FLAG_MOSTRAR_LINK_TECNOLOGIA = false;

let EsteadoTecDep = 2;
 
$(function () {

    getCurrentUser();

     FormatoCheckBox($("#divFlagCatalog"), "cbFlagCatalog");
    $("#cbFlagCatalog").change(FlagCatalog_Change);

    InitMultiselect();
    InitAutocompletarTecnologia($("#txtFilTecnologia"), $("#hdFilTecnologiaId"), ".filTecContainer", false);

    CargarCombos();

    //$("#ddlTipoTecFiltro").val(INIT_FILTER_TIPO_TECNOLOGIA);
    //$("#ddlTipoTecFiltro").multiselect("refresh");

    $("#btnBuscarInit").click(buscarRegistros);
    $("#btnBuscar").click(buscarRegistros);
    $("#btnExportar").click(exportarRegistros_2);

    $("#cbFilDom").on('change', function () {
        getSubdominiosByDomCbMultiple($("#cbFilSub"));
    });

    ListarTecnologiaEstandar();
});

$(document).ajaxComplete(function (e) {
    if (userCurrent != null) {
        ARR_PERFILES_USUARIO = userCurrent !== null ? userCurrent.Perfil.split(";") : [];
        FLAG_MOSTRAR_LINK_TECNOLOGIA = ARR_PERFILES_USUARIO.includes(PERFILES.ADMINISTRADOR) || ARR_PERFILES_USUARIO.includes(PERFILES.GESTOR_TECNOLOGIA);
    }
});

function FlagCatalog_Change() {
    let isActive = $(this).prop("checked");
    let DATA = isActive ? DATA_TIPO_TECNOLOGIA : DATA_TIPO_TECNOLOGIA.filter(x => x.Id !== TIPO_NO_ESTANDAR);
    SetItemsMultiple(DATA, $("#ddlTipoTecFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);

    $("#ddlTipoTecFiltro").val(DATA.map(x => x.Id));
    $("#ddlTipoTecFiltro").multiselect("refresh");

    $("#txtFilTecnologia").autocomplete("destroy");
    InitAutocompletarTecnologia($("#txtFilTecnologia"), $("#hdFilTecnologiaId"), ".filTecContainer", isActive);
}

function InitMultiselect() {
    SetItemsMultiple([], $("#cbFilDom"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#cbFilSub"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#ddlTipoTecFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
    SetItemsMultiple([], $("#ddlEstadoFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
}

function PrepararTabla(result) {
    $.each(result, function () { // DOMINIO
        let $trText = "<tr>";
        $trText = $trText.concat(`<td>${this.DominioNombre}</td>`);
        $trText = $trText.concat(`<td><table>`);
        $.each(this.Subdominio, function () { // SUBDOMINIO
            // TECNOLOGIA
            $trText = $trText.concat(`<tr>`);
            $trText = $trText.concat(`<td>${this.SubdominioNombre}</td>`);
            $trText = $trText.concat(`<td><table>`);
            $trText = $trText.concat(`<tr>`);
            let tecVigente = this.Tecnologia.filter(x => x.EstadoId === 1);
            let tecDeprecado = this.Tecnologia.filter(x => x.EstadoId === 2);
            let tecObsoleto = this.Tecnologia.filter(x => x.EstadoId === 3);

            let $tdTecVigente = `<td>${tecVigente.map(x => x.TecnologiaNombre).join("</br>")}</td>`;
            let $tdTecDeprecado = `<td>${tecDeprecado.map(x => x.TecnologiaNombre).join("</br>")}</td>`;
            let $tdTecObsoleto = `<td>${tecObsoleto.map(x => x.TecnologiaNombre).join("</br>")}</td>`;
            $trText = $trText.concat($tdTecVigente, $tdTecDeprecado, $tdTecObsoleto);
            $trText = $trText.concat(`</tr>`);
            $trText = $trText.concat(`</table></td>`);
            $trText = $trText.concat(`</tr>`);
        });
        $trText = $trText.concat(`</table></td>`);
        $trText = $trText.concat(`</tr>`);
        console.log($trText);
        $("#tblTecnologiaEstandar:last").append($trText);
    });
}

function ListarTecnologiaEstandar() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    let filtro = {}
    filtro.subdominioIds = $.isArray($("#cbFilSub").val()) ? $("#cbFilSub").val().join("|") : "";
    filtro.dominioIds = $.isArray($("#cbFilDom").val()) ? $("#cbFilDom").val().join("|") : "";
    filtro.nombre = $.trim($("#txtFilTecnologia").val());
    filtro.tipoTecnologiaIds = $.isArray($("#ddlTipoTecFiltro").val()) ? $("#ddlTipoTecFiltro").val().join("|") : "";
    filtro.estadoTecnologiaIds = $.isArray($("#ddlEstadoFiltro").val()) ? $("#ddlEstadoFiltro").val().join("|") : "";
    filtro.aplicaIds = $.isArray($("#ddlPlataformaAplicaFiltro").val()) ? $("#ddlPlataformaAplicaFiltro").val().join("|") : "";
    filtro.compatibilidadSOIds = $.isArray($("#ddlCompatibilidadSOFiltro").val()) ? $("#ddlCompatibilidadSOFiltro").val().join("|") : "";
    filtro.compatibilidadCloudIds = $.isArray($("#ddlCompatibilidadCloudFiltro").val()) ? $("#ddlCompatibilidadCloudFiltro").val().join("|") : "";
    filtro.getAll = $("#cbFlagCatalog").prop("checked");

    $.ajax({
        url: URL_API_VISTA + `/TecnologiaEstandar/Listado`,
        type: "POST",
        data: JSON.stringify(filtro),
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result) {
                result = result.filter(x => x.TecnologiaVigenteStr !== "" || x.TecnologiaRestringidoStr !== "" || x.TecnologiaDeprecadoStr !== "" || x.TecnologiaObsoletoStr !== "");

                $table.bootstrapTable("destroy");
                $table.bootstrapTable({
                    formatNoMatches: function () {
                        return TEXTO_REGISTROS_NO_ENCONTRADOS;
                    },
                    data: result
                });
                let unique = $.unique(result.map(x => x.DominioNomb));
                $.each(unique, function () {
                    let indexInicio = result.findIndex(x => x.DominioNomb === this);
                    let Dominio = result.filter(x => x.DominioNomb === this);
                    $table.bootstrapTable('mergeCells', {
                        index: indexInicio,
                        field: 'DominioNomb',
                        rowspan: Dominio.length
                    });
                });
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            //UpdateFiltersAndShow();
            setHeightTable($table);
            waitingDialog.hide();
            if (!ControlarCompleteAjax(data))
                bootbox.alert("sucedió un error con el servicio", function () { });
        }
    });
}

const setHeightTable = ($table) => {
    let current_h = $table.height();
    let final_h = current_h >= 550 ? 550 : current_h;
    $(".fixed-table-container").css("height", final_h + 30);
};

function UpdateFiltersAndShow() {
    $(".data-extra").show(); //added
    let data = $table.bootstrapTable("getData") || [];
    if (data.length > 0) {
        let idsDominio = data.map(x => x.DominioId).filter(onlyUnique);
        let idsSubdominio = data.map(x => x.SubdominioId).filter(onlyUnique);
        $("#cbFilDom").val(idsDominio);
        $("#cbFilDom").multiselect("refresh");
        $("#cbFilDom").trigger("change");

        $("#cbFilSub").val(idsSubdominio);
        $("#cbFilSub").multiselect("refresh");
    }
}

function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/TecnologiaEstandar/ListarCombos",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItems(dataObject.TipoTecnologia, $("#ddlTipoTecFiltro"), TEXTO_TODOS);
                    //SetItems(dataObject.EstadoObs, $("#ddlEstadoFiltro"), TEXTO_TODOS);

                    var InitDataFilterDominio = dataObject.Dominio;
                    var InitDataFilterTipo = dataObject.TipoTecnologia.filter(x => x.Id !== TIPO_NO_ESTANDAR);
                    var InitDataFilterEstado = dataObject.EstadoObs.filter(x => x.Id !== -1);
                    var InitDataFilterAplica = dataObject.PlataformaAplica;
                    var InitDataFilterCompatibilidadSO = dataObject.CompatibilidadSO;
                    var InitDataFilterCompatibilidadCloud = dataObject.CompatibilidadCloud;
                    DATA_TIPO_TECNOLOGIA = dataObject.TipoTecnologia;

                    //FILTROS MULTISELECT
                    SetItemsMultiple(InitDataFilterDominio, $("#cbFilDom"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(InitDataFilterTipo, $("#ddlTipoTecFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(InitDataFilterEstado, $("#ddlEstadoFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(InitDataFilterAplica, $("#ddlPlataformaAplicaFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(InitDataFilterCompatibilidadSO, $("#ddlCompatibilidadSOFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(InitDataFilterCompatibilidadCloud, $("#ddlCompatibilidadCloudFiltro"), TEXTO_TODOS, TEXTO_TODOS, true);

                    //FAQ
                    $("#btnFAQ").prop("href", dataObject.UrlFAQ);

                    //Tipo Tecnologia
                    $("#ddlTipoTecFiltro").val(dataObject.FiltroTipoTecnologia.split("|"));
                    $("#ddlTipoTecFiltro").multiselect("refresh");

                    $("#ddlEstadoFiltro").val(InitDataFilterEstado.map(x => x.Id));
                    $("#ddlEstadoFiltro").multiselect("refresh");

                    $("#cbFilDom").val(InitDataFilterDominio.map(x => x.Id));
                    $("#cbFilDom").multiselect("refresh");
                    //$("#cbFilDom").trigger("change");
                    getSubdominiosByDomCbMultiple($("#cbFilSub"));
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
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

                        $cbSub.val(data.map(x => x.Id));
                        $cbSub.multiselect("refresh");
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function () {

            },
            async: false
        });
    }
}

function buscarRegistros() {
    ListarTecnologiaEstandar();
}

function limpiarModal() {
    $(":input", "#formAddOrEditRegistro").val("");
}

function verDetalleEstandar(_id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/TecnologiaEstandar/GetById?id=${_id}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    $("a[href='#DatosGenerales']").tab('show');
                    let data = dataObject;
                    limpiarModal();

                    //let a_text_Codigo = $.trim(data.CodigoTecnologia) !== "" ? `[${data.CodigoTecnologia}]` : "-";
                    //let a_href_Codigo = $.trim(data.CodigoTecnologia) !== "" ? String.Format(URL_GT_FORMAT, data.ClaveTecnologia, data.Id, data.EstadoTecnologiaId) : "#";

                    let a_text_Codigo = $.trim(data.CodigoProducto) !== "" ? `${data.CodigoProducto}` : "-";
                    let a_href_Codigo = $.trim(data.CodigoProducto) !== "" ? String.Format(URL_CODIGO_FORMAT, data.CodigoProducto) : "#";

                    $("#txtCodigoTecnologia").text(a_text_Codigo);
                    $("#txtCodigoTecnologia").prop("href", FLAG_MOSTRAR_LINK_TECNOLOGIA ? a_href_Codigo : "#");
                    $("#txtCodigoTecnologia").prop("title", a_text_Codigo !== "-" ? "Ir a tecnología" : "");


                    let a_text_Clave = $.trim(data.ClaveTecnologia) !== "" ? data.ClaveTecnologia : "-";
                    let a_href_Clave = $.trim(data.ClaveTecnologia) !== "" ? String.Format(URL_DESCRIPCION_FORMAT, data.ClaveTecnologia) : "#";

                    $("#txtNombreTecnologia").text(a_text_Clave);
                    $("#txtNombreTecnologia").prop("href", FLAG_MOSTRAR_LINK_TECNOLOGIA ? a_href_Clave : "#");
                    $("#txtNombreTecnologia").prop("title", a_text_Clave !== "-" ? "Ir a tecnología" : "");
                    //$("#txtNombreTecnologia").html(data.ClaveTecnologia);

                    $("#hdRegistroId").val(data.Id);

                    $("#txtEquipoAdm").html(data.EqAdmContacto);
                    $("#txtGrupoRemedy").html(data.GrupoSoporteRemedy);

                    let a_href = "", a_text = "";

                    if (data.LineamientoTecnologiaId == 1) {
                        a_href = data.LineamientoTecnologiaStr === null || $.trim(data.LineamientoTecnologiaStr) === "" ? "#" : data.LineamientoTecnologiaStr;
                        a_text = data.LineamientoTecnologiaStr === null || $.trim(data.LineamientoTecnologiaStr) === "" ? "-" : TEXTO_IR_SITIO;

                        let $urlConfluence = $("#txtLineamientoTecnologia");
                        $urlConfluence.prop("href", a_href);
                        $urlConfluence.text(a_text);
                        $urlConfluence.attr("target", "_blank");
                        $urlConfluence.removeAttr("style");
                        if ($urlConfluence.text() === TEXTO_IR_SITIO) $urlConfluence.append(ICONO_ENLACE);
                    } else $("#txtLineamientoTecnologia").html(data.LineamientoTecnologiaStr).attr("href", "javascript:void(0)").removeAttr("target").attr("style", "cursor: default;");

                    if (data.LineamientoBaseSeguridadId == 1) {
                        a_href = data.LineamientoBaseSeguridadStr === null || $.trim(data.LineamientoBaseSeguridadStr) === "" ? "#" : data.LineamientoBaseSeguridadStr;
                        a_text = data.LineamientoBaseSeguridadStr === null || $.trim(data.LineamientoBaseSeguridadStr) === "" ? "-" : TEXTO_IR_SITIO;

                        let $publicacionLBS = $("#txtLineamientoBaseSeguridad");
                        a_href = a_href.includes("http://") ? a_href : a_href.includes("https://") ? a_href : `//${a_href}`;
                        $publicacionLBS.prop("href", a_href);
                        $publicacionLBS.text(a_text);
                        $publicacionLBS.attr("target", "_blank");
                        $publicacionLBS.removeAttr("style");
                        if ($publicacionLBS.text() === TEXTO_IR_SITIO) $publicacionLBS.append(ICONO_ENLACE);
                    } else $("#txtLineamientoBaseSeguridad").html(data.LineamientoBaseSeguridadStr).attr("href", "javascript:void(0)").removeAttr("target").attr("style", "cursor: default;");

                    $("#txtFuenteId").html((data.FuenteIdStr || '') == '' ? '-' : data.FuenteIdStr);
                    $("#txtFFS").html(data.FechaCalculoValorTecStr);
                    $("#txtEquipoAprovisionamiento").html(data.EquipoAprovisionamiento);
                    $("#txtTribuCoe").html(data.TribuCoeDisplayName);
                    $("#txtSquad").html(data.SquadDisplayName);
                    $("#txtResponsabilidadUnidad").html(data.OwnerStr);
                    $("#txtEsquemaLicenciamiento").html(data.EsquemaLicenciamientoStr);

                    $("#txtFechaCalculoId").html(data.FechaCalculoTecEstandarStr);
                    //$("#txtFechaCalculoId").html(data.FechaCalculoTecStr);
                    $("#txtAplica").html((data.Aplica || '') == '' ? '-' : data.Aplica);
                    $("#txtCompatibilidadSOIds").html(data.CompatibilidadSOIdsStr);
                    $("#txtCompatibilidadCloudIds").html(data.CompatibilidadCloudIdsStr);

                    if (data.EstadoId == EsteadoTecDep) {
                        $("#tecReempDep").css("display", "block");
                        $("#txtTecnologiaReemplazo").html(data.TecnologiaReemplazo)
                    } else {
                        $("#tecReempDep").css("display", "none");
                    }
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            waitingDialog.hide();
            OpenCloseModal($("#mdAddOrEditRegistro"), true);
        }
    });
}

function exportarRegistros() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);

        return false;
    }

    let _subdomIds = $.isArray($("#cbFilSub").val()) ? $("#cbFilSub").val().join("|") : "";
    let domIds = $.isArray($("#cbFilDom").val()) ? $("#cbFilDom").val().join("|") : "";
    let url = `${URL_API_VISTA}/TecnologiaEstandar/Exportar?subdominioIds=${_subdomIds}&dominiosIds=${domIds}`;
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

function exportarRegistros_2() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);

        return false;
    }
    let filtro = {}
    filtro.subdominioIds = $.isArray($("#cbFilSub").val()) ? $("#cbFilSub").val().join("|") : "";
    filtro.dominioIds = $.isArray($("#cbFilDom").val()) ? $("#cbFilDom").val().join("|") : "";
    filtro.nombre = $.trim($("#txtFilTecnologia").val());
    filtro.tipoTecnologiaIds = $.isArray($("#ddlTipoTecFiltro").val()) ? $("#ddlTipoTecFiltro").val().join("|") : "";
    filtro.estadoTecnologiaIds = $.isArray($("#ddlEstadoFiltro").val()) ? $("#ddlEstadoFiltro").val().join("|") : "";
    filtro.getAll = $("#cbFlagCatalog").prop("checked");
    filtro.aplicaIds = $.isArray($("#ddlPlataformaAplicaFiltro").val()) ? $("#ddlPlataformaAplicaFiltro").val().join("|") : "";
    filtro.compatibilidadSOIds = $.isArray($("#ddlCompatibilidadSOFiltro").val()) ? $("#ddlCompatibilidadSOFiltro").val().join("|") : "";
    filtro.compatibilidadCloudIds = $.isArray($("#ddlCompatibilidadCloudFiltro").val()) ? $("#ddlCompatibilidadCloudFiltro").val().join("|") : "";

    let url = `${URL_API_VISTA}/TecnologiaEstandar/Exportar_2`;
    $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(filtro),
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

function InitAutocompletarTecnologia($searchBox, $IdBox, $container, getAll) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + `/Tecnologia/GetTecnologiaEstandarByClave`,
                    type: "POST",
                    data: JSON.stringify({filtro: request.term, getAll}),
                    contentType: "application/json",
                    dataType: "json",
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
            //$searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            if (event.keyCode === $.ui.keyCode.TAB) {
                return false;
            }

            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.label);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

//function headerStyle(column) {
//    return {
//        DominioNomb: {
//            classes: 'fondoAzul'
//        },
//        SubdominioNomb: {
//            classes: 'fondoAzul'
//        },
//        TipoTecNomb: {
//            classes: 'fondoAzul'
//        }
//    }[column.field];
//}