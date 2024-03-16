var $table = $("#tblRegistro");
var URL_API_VISTA = URL_API + "/Dashboard";
var URL_API_TECNOLOGIA = URL_API + "/Tecnologia";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Aplicaciones y tecnologías";
const URL_API_VISTA_DASH = URL_API + "/Dashboard/Tecnologia";
const arrMultiSelect = [
    { SelectId: "#cbDominio", DataField: "Dominio" },
    { SelectId: "#cbSubdominio", DataField: "Subdominio" }
];
$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));

    //$("#divFechaFiltro").datetimepicker({
    //    locale: "es",
    //    useCurrent: false,
    //    format: "DD/MM/YYYY"
    //});

    _BuildDatepicker($("#FechaFiltro"));

    MethodValidarFecha(RANGO_DIAS_HABILES);
    ValidarCampos();

    cargarCombos();
    if (FLAG_ADMIN == 1) {
        $("#cbDominio ,#cbSubdominio").addClass("ignore");
        listarRegistros();
    } else {
        $("#cbDominio ,#cbSubdominio").removeClass("ignore");
        $table.bootstrapTable({ data: [] });
    }



    InitAutocompletarBuilder($("#txtAplicacion"), $("#hdAplicacionId"), ".containerFiltroAplicacion", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtTecnologia"), null, ".containerFiltroTecnologia", "/Tecnologia/GetTecnologiaByClave?filtro={0}");

    setDefaultHd($("#txtAplicacion"), $("#hdAplicacionId"));
    $("#cbDominio").on('change', function () {
        //getSubdominiosByDomCb(this.value);
        getSubdominiosByDomCbMultiple($("#cbSubdominio"), $("#cbDominio"));
    });
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
            cbDominio: { required: true },
            cbSubdominio: { required: true },
            FechaFiltro: {
                required: true,
                isDate: true,
                FechaPrevia: true,
                FechaMaxima: true
            }
        },
        messages: {
            cbDominio: { required: String.Format("Debes seleccionar el {0}.", "dominio") },
            cbSubdominio: { required: String.Format("Debes seleccionar el {0}.", "subdominio") },
            FechaFiltro: {
                required: "Debe seleccionar una fecha",
                isDate: "Debe ingresar una fecha valida",
                FechaPrevia: "Debe ingresar una fecha valida",
                FechaMaxima: "Debe ingresar una fecha menor a la actual"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "cbDominio" || element.attr('name') === "cbSubdominio" || element.attr('name') === "FechaFiltro") {
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

function semaforoFormatter(value, row, index) {
    var html = "";
    if (row.EquipoSinTecnologiasYServidores == true) {
        html = "-";
    }
    else {
        if (row.IndicadorObsolescencia === 1) { //VERDE
            html = '<button type="button" class="btn btn-success btn-circle"></button>';
        } else if (row.IndicadorObsolescencia === -1) { //ROJO
            html = '<button type="button" class="btn btn-danger btn-circle"></button>';
        }
        else {
            html = '<button type="button" class="btn btn-warning btn-circle"></button>';
        }
    }
    return html;
}

function semaforoIndice1Formatter(value, row, index) {
    var html = "";
    if (row.EquipoSinTecnologiasYServidores == true) {
        html = "-";
    }
    else {
        if (row.IndicadorObsolescencia_Proyeccion1 === 1) { //VERDE
            html = '<button type="button" class="btn btn-success btn-circle"></button>';
        } else if (row.IndicadorObsolescencia_Proyeccion1 === -1) { //ROJO
            html = '<button type="button" class="btn btn-danger btn-circle"></button>';
        }
        else {
            html = '<button type="button" class="btn btn-warning btn-circle"></button>';
        }
    }
    return html;
}

function semaforoIndice2Formatter(value, row, index) {
    var html = "";
    if (row.EquipoSinTecnologiasYServidores == true) {
        html = "-";
    }
    else {
        if (row.IndicadorObsolescencia_Proyeccion2 === 1) { //VERDE
            html = '<button type="button" class="btn btn-success btn-circle"></button>';
        } else if (row.IndicadorObsolescencia_Proyeccion2 === -1) { //ROJO
            html = '<button type="button" class="btn btn-danger btn-circle"></button>';
        }
        else {
            html = '<button type="button" class="btn btn-warning btn-circle"></button>';
        }
    }
    return html;
}

function listarRegistros() {
    $("#formFiltros").validate().resetForm();

    if ($("#formFiltros").valid()) {

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA + "/Reportes/AplicacionTecnologia",
            method: 'POST',
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
            pagination: true,
            sidePagination: 'server',
            queryParamsType: 'else',
            pageSize: REGISTRO_PAGINACION,
            pageList: OPCIONES_PAGINACION,
            sortName: 'CodigoApt',
            sortOrder: 'asc',
            fixedColumns: true,
            fixedNumber: 4,
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.Aplicacion = $("#hdAplicacionId").val() !== "0" ? $("#hdAplicacionId").val() : $("#txtAplicacion").val();  //$("#txtAplicacion").val();
                DATA_EXPORTAR.Tecnologia = $("#txtTecnologia").val();
                DATA_EXPORTAR.DominioIds = CaseIsNullSendFilter($("#cbDominio").val());//$("#cbDominio").val() == "" ? -1 : $("#cbDominio").val();
                DATA_EXPORTAR.SubdominioIds = CaseIsNullSendFilter($("#cbSubdominio").val()); //== "" ? -1 : $("#cbSubdominio").val();
                DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
                DATA_EXPORTAR.pageNumber = p.pageNumber;
                DATA_EXPORTAR.pageSize = p.pageSize;
                DATA_EXPORTAR.sortName = p.sortName;
                DATA_EXPORTAR.sortOrder = p.sortOrder;

                return JSON.stringify(DATA_EXPORTAR);
            },
            onLoadSuccess: function () {
                //app_handle_listing_horisontal_scroll($('#table-listing'));
                app_handle_listing_horisontal_scroll($('#table-listing'));
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
            onResetView: function () {
                app_handle_listing_horisontal_scroll($('#table-listing'));
            }
        });
    }
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR.DominioIds = CaseIsNullSendExport(DATA_EXPORTAR.DominioIds);
    DATA_EXPORTAR.SubdominioIds = CaseIsNullSendExport(DATA_EXPORTAR.SubdominioIds);
    let url = `${URL_API_VISTA}/Reportes/AplicacionTecnologia/Exportar?Aplicacion=${DATA_EXPORTAR.Aplicacion}&Tecnologia=${DATA_EXPORTAR.Tecnologia}&DominioId=${DATA_EXPORTAR.DominioIds}&SubdominioId=${DATA_EXPORTAR.SubdominioIds}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&fecha=${DATA_EXPORTAR.Fecha}`;
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


function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/AplicacionTecnologia/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    if (FLAG_ADMIN == 1) {
                        //SetItemsCombo(dataObject.Dominio, $("#cbDominio"), TEXTO_TODOS);
                        SetItemsMultiple(dataObject.Dominio, $("#cbDominio"), TEXTO_TODOS, TEXTO_TODOS, true);
                        //$("#cbSubdominio").append($('<option></option')
                        //    .attr('value', '')
                        //    .text(TEXTO_TODOS));
                    } else {
                        //SetItemsCombo(dataObject.Dominio, $("#cbDominio"), TEXTO_SELECCIONE);
                        SetItemsMultiple(dataObject.Dominio, $("#cbDominio"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
                        //$("#cbSubdominio").append($('<option></option')
                        //    .attr('value', '')
                        //    .text(TEXTO_SELECCIONE));
                    }

                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function getSubdominiosByDomCb(_domId) {
    var domId = _domId;
    $("#cbSubdominio").empty();

    $("#cbSubdominio").append($('<option></option')
        .attr('value', '')
        .text(FLAG_ADMIN == 1 ? TEXTO_TODOS : TEXTO_SELECCIONE));

    $.ajax({
        url: URL_API_TECNOLOGIA + "/Subdominios/" + domId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            data = result;
            $("#cbSubdominio").find("option:gt(0)").remove();

            $.each(data, function (i, item) {
                $("#cbSubdominio").append($('<option>', {
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

function app_handle_listing_horisontal_scroll(listing_obj) {
    let table_obj = $('.table', listing_obj);
    let count_fixed_collumns = table_obj.attr('data-count-fixed-columns');

    if (count_fixed_collumns > 0) {
        let wrapper_obj = $('.table-scrollable', listing_obj);

        let wrapper_left_margin = 0;

        let table_collumns_width = new Array();
        let table_collumns_margin = new Array();

        $('th', table_obj).each(function (index) {
            if (index < count_fixed_collumns) {
                wrapper_left_margin += $(this).outerWidth();
                table_collumns_width[index] = $(this).outerWidth();
            }
        });

        $.each(table_collumns_width, function (key, value) {
            if (key === 0) {
                table_collumns_margin[key] = wrapper_left_margin;
            }
            else {
                let next_margin = 0;
                $.each(table_collumns_width, function (key_next, value_next) {
                    if (key_next < key) {
                        next_margin += value_next;
                    }
                });
                table_collumns_margin[key] = wrapper_left_margin - next_margin;
            }
        });

        if (wrapper_left_margin > 0) {
            wrapper_obj.css('cssText', 'margin-left:' + wrapper_left_margin + 'px !important; width: auto');
        }

        var maxH = 0;
        //$("article .igualar").each(function (i) {
        //    var actH = $(this).height();
        //    if (actH > maxH) maxH = actH;
        //});
        //$("article .igualar").height(maxH);

        $('tr', table_obj).each(function () {
            let current_row_height = $(this).outerHeight();
            //maxH = 0;
            //console.log("maxH", maxH);
            $('th,td', $(this)).each(function (index) {
                let current_row_height = $(this).outerHeight();
                if (current_row_height > maxH) maxH = current_row_height;
                //console.log("current_row_height", $(this)[0].innerText, current_row_height);
            });
            //console.log("current_row_height > maxH", maxH);
            $('th,td', $(this)).each(function (index) {
                //let current_row_height = $(this).height();
                //if (current_row_height > maxH) maxH = current_row_height;


                if (index < count_fixed_collumns) {
                    $(this).css('position', 'absolute')
                        .css('margin-left', '-' + table_collumns_margin[index] + 'px')
                        .css('width', table_collumns_width[index] + 1);

                    $(this).addClass('table-fixed-cell');
                }
                $(this).css('height', maxH);
            });
        });
    }
}

function linkFormatterAplicacion(value, row, index) {
    return `<a href="/Vista/DetalleAplicacion?id=${row.CodigoApt}" title="Ver detalle de la aplicación" target="_blank">${value}</a>`;
}

function linkFormatterEquipo(value, row, index) {
    if (row.EquipoId > 0)
        return `<a href="/Vista/DetalleEquipo?id=${row.EquipoId}" title="Ver detalle del equipo" target="_blank">${value}</a>`;
    else
        return '-';
}

function linkFormatterTecnologia(value, row, index) {
    if (row.TecnologiaId > 0)
        return `<a href="TecnologiaEquipo/${row.TecnologiaId}" title="Ver detalle de la tecnología" target="_blank">${value}</a>`;
    else
        return '-';
}


function SetItemsCombo(data, combo, TEXTO_INICIAL) {
    combo.html("");
    if (TEXTO_INICIAL != "")
        combo.append($("<option />").val("").text(TEXTO_INICIAL));
    $.each(data, function () {
        let Id = this.Id;
        let flagArray = Id == undefined;
        combo.append($("<option />").val(flagArray ? this : this.Id).text(flagArray ? this : this.Descripcion));
    });
}
function getSubdominiosByDomCbMultiple($cbSub, $cbDominio) {
    //var domId = _domIds;
    let idsDominio = CaseIsNullSendFilter($cbDominio.val());

    if (idsDominio)
        $.ajax({
            url: URL_API_VISTA_DASH + "/ListarCombos/Dominio",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(idsDominio),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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