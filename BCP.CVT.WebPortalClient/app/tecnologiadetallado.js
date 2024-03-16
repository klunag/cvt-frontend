var CODIGO_INTERNO = 0;
var urlApiSubdom = URL_API + "/Subdominio";
var urlApiFam = URL_API + "/Familia";
var URL_API_VISTA = URL_API + "/Tecnologia";
var URL_API_DASHBOARD = URL_API + "/Dashboard";
const URL_API_VISTA_DASH = URL_API + "/Dashboard/Tecnologia";

var $table = $("#tblRegistro");
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Detalle de las tecnologías";
const arrMultiSelect = [
    { SelectId: "#ddlDominio", DataField: "Dominio" },
    { SelectId: "#ddlSubdominio", DataField: "Subdominio" },
    { SelectId: "#ddlEstadoAprobacion", DataField: "EstadoTecnologia" },
    { SelectId: "#ddlTipoTecnologia", DataField: "TipoTec" },
    { SelectId: "#ddlEstadoObsolescencia", DataField: "EstadoObs" }
];

$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));

    $("#ddlSubdominio").append($('<option></option')
        .attr('value', '')
        .text(FLAG_ADMIN === 1 ? TEXTO_TODOS : TEXTO_SELECCIONE));

    cargarCombos();

    setItemsCb($("#ddlDominio"), "/Dominio/ConSubdominio");

    $("#ddlDominio").on('change', function () { getSubdominiosByDomCbMultiple($("#ddlSubdominio"), $("#ddlDominio")); });

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        listarRegistrosDetalle(row.TecnologiaId, $('#tblRegistrosDetalle_' + row.TecnologiaId), $detail);
    });

    $table.bootstrapTable({ data: [] });
    if (FLAG_ADMIN == 1) {
        listarRegistros();
        $("#btnExportar").show();
    } else {
        ValidarCampos();
        $("#btnExportar").hide();
    }


    InitAutocompletarBuilder($("#txtClave"), null, ".containerFiltroTecnologia", "/Tecnologia/GetTecnologiaByClave?filtro={0}");
    InitAutocompletarFamilia($("#ddlFamilia"), null, $(".famfilContainer"));
});

function ValidarCampos() {

    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlDominio: { required: true },
            ddlSubdominio: { required: true }
        },
        messages: {
            ddlDominio: { required: String.Format("Debes seleccionar el {0}.", "dominio") },
            ddlSubdominio: { required: String.Format("Debes seleccionar el {0}.", "subdominio") },
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbFilDominio" || element.attr('name') === "cbFilSubdominio") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
    });
}


function RefrescarListado() {
    listarRegistros();
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
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function getSubdominiosByDomCb(_domId) {
    var domId = _domId;
    $("#ddlSubdominio").empty();
    $("#ddlSubdominio").append($('<option></option')
        .attr('value', '')
        .text(FLAG_ADMIN == 1 ? TEXTO_TODOS : TEXTO_SELECCIONE));

    $.ajax({
        url: URL_API_VISTA + "/Subdominios/" + domId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            data = result;

            $.each(data, function (i, item) {
                $("#ddlSubdominio").append($('<option>', {
                    value: item.Id,
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

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    if (FLAG_ADMIN === 1) {
                        //FILTROS MULTISELECT
                        SetDataToSelectMultiple(arrMultiSelect, dataObject, TEXTO_TODOS);

                        //SetItemsCombo(dataObject.Dominio, $("#ddlDominio"), TEXTO_TODOS);
                        //SetItemsCombo(dataObject.TipoTec, $("#ddlTipoTecnologia"), TEXTO_TODOS);
                    } else {
                        //FILTROS MULTISELECT
                        SetDataToSelectMultiple(arrMultiSelect, dataObject, TEXTO_SELECCIONE);
                        //SetItemsCombo(dataObject.Dominio, $("#ddlDominio"), TEXTO_SELECCIONE);
                        //SetItemsCombo(dataObject.TipoTec, $("#ddlTipoTecnologia"), TEXTO_SELECCIONE);
                    }

                    CODIGO_INTERNO = dataObject.CodigoInterno;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function SetItemsCombo(data, combo, TEXTO_INICIAL) {
    combo.html("");
    if (TEXTO_INICIAL != "")
        combo.append($("<option />").val("").text(TEXTO_INICIAL));
    $.each(data, function () {
        combo.append($("<option />").val(this.Id || this).text(this.Descripcion || this));
    });
}

function listarRegistros() {
    $("#formFiltros").validate().resetForm();
    if ($("#formFiltros").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_DASHBOARD + "/Reportes/Tecnologias",
            method: 'POST',
            pagination: true,
            sidePagination: 'server',
            queryParamsType: 'else',

            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            sortName: 'ClaveTecnologia',
            sortOrder: 'asc',
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.DominioIds = CaseIsNullSendExport($("#ddlDominio").val());
                DATA_EXPORTAR.SubdominioIds = CaseIsNullSendExport($("#ddlSubdominio").val());
                DATA_EXPORTAR.EstadoAprobacionIds = CaseIsNullSendExport($("#ddlEstadoAprobacion").val());
                DATA_EXPORTAR.Familia = $("#ddlFamilia").val();
                DATA_EXPORTAR.Tipos = CaseIsNullSendExport($("#ddlTipoTecnologia").val());
                DATA_EXPORTAR.EstadoObsolescencias = CaseIsNullSendExport($("#ddlEstadoObsolescencia").val());
                DATA_EXPORTAR.Clave = $("#txtClave").val();
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

}

function detailFormatter(index, row) {
    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="estadoActualFormatter" data-field="EstadoActual" data-halign="center" data-valign="middle" data-align="center" data-width="100">Indicador actual</th >\
                                    <th data-formatter="indicadorUnoFormatter" data-field="EstadoIndicador1" data-halign="center" data-valign="middle" data-align="center" data-width="100">Indicador {1} meses</th>\
                                    <th data-formatter="indicadorDosFormatter" data-field="EstadoIndicador2" data-halign="center" data-valign="middle" data-align="center" data-width="100">Indicador {2} meses</th>\
                                    <th data-field="RoadmapConfigurado" data-halign="center" data-valign="middle" data-align="left" data-width="200">Roadmap configurado</th>\
                                    <th data-field="RoadmapSugerido" data-halign="center" data-valign="middle" data-align="left" data-width="200">Roadmap sugerido</th>\
                                </tr>\
                            </thead>\
                        </table>', row.TecnologiaId, row.MesesIndicador1, row.MesesIndicador2);

    return html;
}

function indicadorDosFormatter(value, row, index) {
    var html = "";
    if (row.EstadoIndicador2 === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.EstadoIndicador2 === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function indicadorUnoFormatter(value, row, index) {
    var html = "";
    if (row.EstadoIndicador1 === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.EstadoIndicador1 === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function estadoActualFormatter(value, row, index) {
    var html = "";
    if (row.EstadoActual === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.EstadoActual === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function listarRegistrosDetalle(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_DASHBOARD + "/Reportes/Tecnologias/Evolucion",
        method: 'POST',
        pagination: true,

        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Tecnologia = id;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.sortName = p.sortName;

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

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.DominioIds = CaseIsNullSendExport($("#ddlDominio").val());
    DATA_EXPORTAR.SubdominioIds = CaseIsNullSendExport($("#ddlSubdominio").val());
    DATA_EXPORTAR.EstadoAprobacionIds = CaseIsNullSendExport($("#ddlEstadoAprobacion").val());
    DATA_EXPORTAR.Familia = $("#ddlFamilia").val();
    DATA_EXPORTAR.Tipos = CaseIsNullSendExport($("#ddlTipoTecnologia").val());
    DATA_EXPORTAR.EstadoObsolescencias = CaseIsNullSendExport($("#ddlEstadoObsolescencia").val());
    DATA_EXPORTAR.Clave = $("#txtClave").val();
    DATA_EXPORTAR.sortName = 'ClaveTecnologia';
    DATA_EXPORTAR.sortOrder = 'ASC';

    let url = `${URL_API_DASHBOARD}/Reportes/Tecnologias/Exportar?Dominio=${DATA_EXPORTAR.DominioIds}&Subdominio=${DATA_EXPORTAR.SubdominioIds}&EstadoAprobacion=${DATA_EXPORTAR.EstadoAprobacionIds}&Familia=${DATA_EXPORTAR.Familia}&Tipo=${DATA_EXPORTAR.Tipos}&EstadoObsolescencia=${DATA_EXPORTAR.EstadoObsolescencias}&Clave=${DATA_EXPORTAR.Clave}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function linkFormatterTecnologia(value, row, index) {
    if (row.TecnologiaId > 0)
        return `<a href="TecnologiaEquipo/${row.TecnologiaId}" title="Ver detalle de la tecnología" target="_blank">${value}</a>`;
    else
        return '-';
}

function InitAutocompletarFamilia($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                if ($IdBox !== null) $IdBox.val("0");

                $.ajax({
                    url: URL_API + "/Familia" + "/GetAllFamiliaByFiltro?filtro=" + request.term,
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
                            console.log(item);
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
            $searchBox.val(ui.item.Descripcion);
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                obtenerFamiliaById(ui.item.Id);
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
function getSubdominiosByDomCbMultiple($cbSub, $cbDominio) {
    let idsDominio = CaseIsNullSendFilter($cbDominio.val());

    if (idsDominio)
        $.ajax({
            url: URL_API_VISTA_DASH + "/ListarCombos/Dominio",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(idsDominio),
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (dataObject) {
                    let TEXTO_SELECT = FLAG_ADMIN == 1 ? TEXTO_TODOS : TEXTO_SELECCIONE;
                    SetItemsMultiple(dataObject.Subdominio, $cbSub, TEXTO_SELECT, TEXTO_SELECT, true);
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
function SetDataToSelectMultiple(arrMultiSelect, dataObject, TEXTO_BY_CASE) {
    arrMultiSelect.forEach((item) => {
        if (dataObject[item.DataField])
            SetItemsMultiple(dataObject[item.DataField], $(item.SelectId), TEXTO_BY_CASE, TEXTO_BY_CASE, true);
    });
}