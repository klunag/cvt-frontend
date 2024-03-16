var $table = $("#tblTecnologiaEstandar");
var URL_API_VISTA = URL_API + "/Tecnologia";
var URL_API_VISTA_DASH = URL_API + "/Dashboard/Tecnologia";

$(function () {
    SetItemsMultiple([], $("#cbFilDom"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#cbFilSub"), TEXTO_TODOS, TEXTO_TODOS, true);

    CargarCombos();

    $("#btnBuscar").click(buscarRegistros);
    $("#btnExportar").click(exportarRegistros);
    $("#cbFilDom").on('change', function () {
        getSubdominiosByDomCbMultiple($("#cbFilSub"));
    });

    ListarTecnologiaEstandar();
});

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
            let tecVigente = this.Tecnologia.filter(x => x.EstadoId == 1);
            let tecDeprecado = this.Tecnologia.filter(x => x.EstadoId == 2);
            let tecObsoleto = this.Tecnologia.filter(x => x.EstadoId == 3);

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
    //cbFilDom
    let subdomIds = $.isArray($("#cbFilSub").val()) ? $("#cbFilSub").val().join("|") : "";
    let domIds = $.isArray($("#cbFilDom").val()) ? $("#cbFilDom").val().join("|") : "";

    $.ajax({
        url: URL_API_VISTA + `/TecnologiaEstandar?subdominioIds=${subdomIds}&dominiosIds=${domIds}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result) {
                result = result.filter(x => x.TecnologiaVigenteStr !== "" || x.TecnologiaDeprecadoStr !== "" || x.TecnologiaObsoletoStr !== "");

                $table.bootstrapTable("destroy");
                $table.bootstrapTable({ data: result });
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
            waitingDialog.hide();
            if (!ControlarCompleteAjax(data))
                bootbox.alert("sucedió un error con el servicio", function () { });
        }
    });
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
                    
                    //FILTROS MULTISELECT
                    SetItemsMultiple(dataObject.Dominio, $("#cbFilDom"), TEXTO_TODOS, TEXTO_TODOS, true);
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
                    waitingDialog.hide();
                    let data = dataObject;
                    limpiarModal();
                    OpenCloseModal($("#mdAddOrEditRegistro"), true);

                    $("#hdRegistroId").val(data.Id);
                    $("#txtUrlConfluence").val(data.UrlConfluence);
                    $("#txtEquipoAdm").val(data.EqAdmContacto);
                    $("#txtGrupoRemedy").val(data.GrupoSoporteRemedy);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
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
