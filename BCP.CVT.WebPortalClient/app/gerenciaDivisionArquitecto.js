var $table = $("#tblRegistro");
var $tableDetalle = $("#tblRegistrosDetalle");
var URL_API_VISTA = URL_API + "/Dashboard";
const texto_mostrar = "Mostrar filtros adicionales";
const texto_ocultar = "Ocultar filtros adicionales";
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Detalle por gerencia y divisiones";
const arrMultiSelect = [
    //{ SelectId: "#cbFilGestionadoPor", DataField: "GestionadoPor" },
    { SelectId: "#cbFilEstado", DataField: "EstadoAplicacion" }, //multiple
    { SelectId: "#cbTipoActivo", DataField: "TipoActivo" }, //multiple
    //{ SelectId: "#txtGerencia", DataField: "Gerencia" },
    //{ SelectId: "#ddlClasificacionTecnica", DataField: "ClasificacionTecnica" },
    //nuevos
    //{ SelectId: "#txtJefeEquipo", DataField: "ClasificacionTecnica" },
    //{ SelectId: "#txtOwner", DataField: "ClasificacionTecnica" },
    //{ SelectId: "#txtDivision", DataField: "ClasificacionTecnica" },
    //{ SelectId: "#txtExperto", DataField: "ClasificacionTecnica" },
    //{ SelectId: "#txtGestor", DataField: "ClasificacionTecnica" },
    //{ SelectId: "#txtTTL", DataField: "ClasificacionTecnica" },
    //{ SelectId: "#txtArea", DataField: "ClasificacionTecnica" },
    //{ SelectId: "#txtUnidad", DataField: "ClasificacionTecnica" },
    //{ SelectId: "#txtBroker", DataField: "ClasificacionTecnica" }
];
$(function () {
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));

    $("#divFechaFiltro").datetimepicker({
        locale: "es",
        useCurrent: false,
        format: "DD/MM/YYYY"
    });

    //validarForm();
    CargarCombos();
    ValidarCampos();
    //listarRegistros();

    //if (FLAG_ADMIN === 1) {
    //    listarRegistros();
    //} else {
    //    validarForm();
    //    $table.bootstrapTable({ data: [] });
    //}

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        if (row.TotalServidores + row.TotalTecnologias !== 0) {
            listarRegistrosDetalle(row.CodigoApt, $('#tblRegistrosDetalle_' + row.Id), $detail);
        } else {
            $detail.empty().append("No existen registros.");
        }
    });

    //InitAutocompletarBuilder($("#txtJefeEquipo"), null, ".containerJefeEquipo", "/Aplicacion/GetJefeEquipoByFiltro?filtro={0}");
    //InitAutocompletarBuilder($("#txtOwner"), null, ".containerOwner", "/Aplicacion/GetOwnerByFiltro?filtro={0}");
    //InitAutocompletarBuilder($("#txtExperto"), null, ".containerExperto", "/Aplicacion/GetExpertoByFiltro?filtro={0}");
    //InitAutocompletarBuilder($("#txtGerencia"), null, ".containerGerencia", "/Aplicacion/GetGerenciaByFiltro?filtro={0}");
    //InitAutocompletarBuilder($("#txtDivision"), null, ".containerDivision", "/Aplicacion/GetDivisionByFiltro?filtro={0}");
    //InitAutocompletarBuilder($("#txtGestor"), null, ".containerGestor", "/Aplicacion/GetGestorByFiltro?filtro={0}");
    //InitAutocompletarBuilder($("#txtArea"), null, ".containerArea", "/Aplicacion/GetAreaByFiltro?filtro={0}");
    //InitAutocompletarBuilder($("#txtUnidad"), null, ".containerUnidad", "/Aplicacion/GetUnidadByFiltro?filtro={0}");
    //InitAutocompletarBuilder($("#txtTTL"), null, ".containerTTL", "/Aplicacion/GetTTLByFiltro?filtro={0}");
    //InitAutocompletarBuilder($("#txtBroker"), null, ".containerBroker", "/Aplicacion/GetBrokerByFiltro?filtro={0}");

    InitAutocompletarBuilder($("#txtAplicacion"), $("#hdAplicacionId"), ".containerAplicacion", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    $("#btnMostrarFiltroAdicionales").html(texto_mostrar);
    $tableDetalle.bootstrapTable();
    $tableDetalle.bootstrapTable({ data: [] });

    setDefaultHd($("#txtAplicacion"), $("#hdAplicacionId"));
});


function validarForm() {
    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbFilGestionadoPor: { requiredSelect: true },
            //txtGerencia: { requiredSelect: true },
            //ddlClasificacionTecnica: { requiredSelect: true },
            //txtJefeEquipo: { requiredSelect: true },
            //txtOwner: { requiredSelect: true },
            //txtDivision: { requiredSelect: true },
            //txtExperto: { requiredSelect: true },
            //txtGestor: { requiredSelect: true },
            //txtTTL: { requiredSelect: true },
            //txtArea: { requiredSelect: true },
            //txtUnidad: { requiredSelect: true },
            //txtBroker: { requiredSelect: true }
        },
        messages: {
            cbFilGestionadoPor: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            //txtGerencia: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            //ddlClasificacionTecnica: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            //txtJefeEquipo: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            //txtOwner: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            //txtDivision: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            //txtExperto: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            //txtGestor: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            //txtTTL: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            //txtArea: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            //txtUnidad: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            //txtBroker: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") }
        }
    });
}

function ValidarCampos() {
    $("#formFiltros").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbFilGestionadoPor: { requiredSelect: true },
            txtGerencia: { requiredSelect: true },
            ddlClasificacionTecnica: { requiredSelect: true },
            txtJefeEquipo: { requiredSelect: true },
            txtOwner: { requiredSelect: true },
            txtDivision: { requiredSelect: true },
            txtExperto: { requiredSelect: true },
            txtGestor: { requiredSelect: true },
            txtTTL: { requiredSelect: true },
            txtArea: { requiredSelect: true },
            txtUnidad: { requiredSelect: true },
            txtBroker: { requiredSelect: true }
        },
        messages: {
            cbFilGestionadoPor: { requiredSelect: String.Format("Debes seleccionar el {0}.", "dominio") },
            txtGerencia: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            ddlClasificacionTecnica: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            txtJefeEquipo: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            txtOwner: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            txtDivision: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            txtExperto: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            txtGestor: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            txtTTL: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            txtArea: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            txtUnidad: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") },
            txtBroker: { requiredSelect: String.Format("Debes seleccionar {0}.", "un item") }
        }
        //errorPlacement: (error, element) => {
        //    if (element.attr('name') === "cbFilDominio" || element.attr('name') === "cbFilSubdominio" || element.attr('name') === "FechaFiltro") {
        //        element.parent().parent().append(error);
        //    } else {
        //        element.parent().append(error);
        //    }
        //}
    });
}



function validarSeleccionUnFiltro() {
    var rpta = true;

    if (FLAG_ADMIN !== 1) {
        var tipo = 2;
        let $btn = $("#btnMostrarFiltroAdicionales");
        if ($btn.html() === texto_mostrar) {
            tipo = 1;
        }

        var filtro1 = $("#txtJefeEquipo").val();
        var filtro2 = $("#txtOwner").val();
        var filtro3 = $("#txtAplicacion").val();
        //AVANZADOS
        var filtro5 = $("#txtGerencia").val(); //Combo
        var filtro6 = $("#txtDivision").val();
        var filtro7 = $("#txtExperto").val();
        var filtro8 = $("#txtGestor").val();
        var filtro9 = $("#txtArea").val();
        var filtro10 = $("#txtUnidad").val();
        var filtro11 = $("#cbFilEstado").val();
        var filtro12 = $("#cbTipoActivo").val();


        if (tipo === 1) { // FILTROS BASICOS
            if (filtro1 === "" && filtro2 === "" && filtro3 === "") {
                rpta = false;
                bootbox.alert("Debe usar por lo menos un filtro más");
            }
        } else if (tipo === 2) { //FILTROS AVANZADOS
            if (filtro1 === "" && filtro2 === "" && filtro3 === "" && filtro5 === "-1" && filtro6 === "" && filtro7 === "" &&
                filtro8 === "" && filtro9 === "" && filtro10 === "" && filtro11 === "-1" && filtro12 === "-1") {
                rpta = false;
                bootbox.alert("Debe usar por lo menos un filtro más");
            }
        }

    }

    return rpta;
}

function CargarCombos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/Aplicacion/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.GestionadoPor, $("#cbFilGestionadoPor"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.EstadoAplicacion, $("#cbFilEstado"), TEXTO_TODOS, TEXTO_TODOS, true); //multiple
                    SetItemsMultiple(dataObject.TipoActivo, $("#cbTipoActivo"), TEXTO_TODOS, TEXTO_TODOS, true); //multiple
                    SetItems(dataObject.Gerencia, $("#txtGerencia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ClasificacionTecnica, $("#ddlClasificacionTecnica"), TEXTO_SELECCIONE);

                    //nuevos
                    SetItems(dataObject.JefeEquipo, $("#txtJefeEquipo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.LiderUsuario, $("#txtOwner"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Division, $("#txtDivision"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Experto, $("#txtExperto"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Gestor, $("#txtGestor"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TTL, $("#txtTTL"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Area, $("#txtArea"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Unidad, $("#txtUnidad"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Broker, $("#txtBroker"), TEXTO_SELECCIONE);

                    //} else {
                    //    SetItems(dataObject.GestionadoPor, $("#cbFilGestionadoPor"), TEXTO_TODOS);
                    //    SetItems(dataObject.EstadoAplicacion, $("#cbFilEstado"), TEXTO_TODOS);
                    //    SetItems(dataObject.TipoActivo, $("#cbTipoActivo"), TEXTO_TODOS);
                    //}
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            waitingDialog.hide();
        },
        async: true
    });
}

function RefrescarListado() {
    listarRegistros();
}

function estadoFormatter(value, row, index) {
    var html = "";
    if (row.EquipoSinTecnologiasYServidores == true) {
        html = "-";
    }
    else {
        if (row.ReporteIndicadorActual === -1) { //ROJO
            html = '<button type="button" class="btn btn-danger btn-circle"></button>';
        } else if (row.ReporteIndicadorActual === 1) {
            html = '<button type="button" class="btn btn-success btn-circle"></button>';
        } else {
            html = '<button type="button" class="btn btn-warning btn-circle"></button>';
        }
    }
    
    return html;
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
    else
    {
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
    if ($("#formFiltros").valid() /*&& validarSeleccionUnFiltro()*/) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA + "/Reportes/GerenciaDivision",
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
                DATA_EXPORTAR.JefeEquipo = CaseIsNullSendExport($("#txtJefeEquipo").val());//$("#txtJefeEquipo").val();
                DATA_EXPORTAR.Owner = CaseIsNullSendExport($("#txtOwner").val());//$("#txtOwner").val();
                DATA_EXPORTAR.Experto = CaseIsNullSendExport($("#txtExperto").val());//$("#txtExperto").val();
                DATA_EXPORTAR.Gerencia = CaseIsNullSendExport($("#txtGerencia").val()); //$("#txtGerencia").val();
                DATA_EXPORTAR.Division = CaseIsNullSendExport($("#txtDivision").val()); //$("#txtDivision").val();
                DATA_EXPORTAR.Gestionado = CaseIsNullSendExport($("#cbFilGestionadoPor").val());
                DATA_EXPORTAR.Aplicacion = $("#hdAplicacionId").val() !== "0" ? $("#hdAplicacionId").val() : $("#txtAplicacion").val();  //: $("#hdAplicacionId").val(); //$("#txtAplicacion").val() || ""
                DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFilEstado").val()); //$("#cbFilEstado").val(); //TODO
                DATA_EXPORTAR.Area = CaseIsNullSendExport($("#txtArea").val());//$("#txtArea").val();
                DATA_EXPORTAR.Unidad = CaseIsNullSendExport($("#txtUnidad").val());//$("#txtUnidad").val();
                DATA_EXPORTAR.TipoActivo = CaseIsNullSendExport($("#cbTipoActivo").val()); //$("#cbTipoActivo").val(); //TODO
                DATA_EXPORTAR.ClasificacionTecnica = CaseIsNullSendExport($("#ddlClasificacionTecnica").val()); //$("#cbTipoActivo").val(); //TODO
                DATA_EXPORTAR.Gestor = CaseIsNullSendExport($("#txtGestor").val());//$("#txtGestor").val();
                DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
                DATA_EXPORTAR.TTL = CaseIsNullSendExport($("#txtTTL").val());//$("#txtTTL").val();
                DATA_EXPORTAR.Broker = CaseIsNullSendExport($("#txtBroker").val());//$("#txtBroker").val();
                DATA_EXPORTAR.pageNumber = p.pageNumber;
                DATA_EXPORTAR.pageSize = p.pageSize;
                DATA_EXPORTAR.sortName = p.sortName;
                DATA_EXPORTAR.sortOrder = p.sortOrder;

                return JSON.stringify(DATA_EXPORTAR);
            },
            onLoadSuccess: function () {
                app_handle_listing_horisontal_scroll($('#table-listing'));
            },
            responseHandler: function (res) {
                waitingDialog.hide();

                var data = res;
                if (data.Total > 0) {
                    $(".divListado").show();
                } else {
                    MensajeGeneralAlert(TITULO_MENSAJE, "No se encontraron registros");
                    $(".divListado").hide();
                }

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


function listarRegistrosDetalle(id, $table, $detail) {
    debugger;
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Reportes/GerenciaDivisionDetallado",
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
            DATA_EXPORTAR.JefeEquipo = $("#txtJefeEquipo").val();
            DATA_EXPORTAR.Owner = $("#txtOwner").val();
            DATA_EXPORTAR.Experto = $("#txtExperto").val();
            DATA_EXPORTAR.Gerencia = CaseIsNullSendExport($("#txtGerencia").val()); //$("#txtGerencia").val(); //ToDo
            DATA_EXPORTAR.Division = $("#txtDivision").val();
            DATA_EXPORTAR.Gestionado = CaseIsNullSendExport($("#cbFilGestionadoPor").val()); //$("#cbFilGestionadoPor").val(); //ToDo
            DATA_EXPORTAR.Aplicacion = id;
            DATA_EXPORTAR.Area = $("#txtArea").val();
            DATA_EXPORTAR.Unidad = $("#txtUnidad").val();
            DATA_EXPORTAR.TipoActivo = CaseIsNullSendExport($("#cbTipoActivo").val()); //$("#cbTipoActivo").val(); //ToDo
            DATA_EXPORTAR.Gestor = $("#txtGestor").val();
            DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
            DATA_EXPORTAR.TTL = $("#txtTTL").val();
            DATA_EXPORTAR.Broker = $("#txtBroker").val();
            DATA_EXPORTAR.ClasificacionTecnica = CaseIsNullSendExport($("#ddlClasificacionTecnica").val()); //$("#ddlClasificacionTecnica").val(); //ToDo
            DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFilEstado").val()); //$("#cbFilEstado").val(); //ToDo
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
        onLoadSuccess: function (status, res) {
            OpenModal();
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
    if ($("#formFiltros").valid() /*&& validarSeleccionUnFiltro()*/) {

        DATA_EXPORTAR = {};
        DATA_EXPORTAR.JefeEquipo = CaseIsNullSendExport($("#txtJefeEquipo").val());//$("#txtJefeEquipo").val();
        DATA_EXPORTAR.Owner = CaseIsNullSendExport($("#txtOwner").val());//$("#txtOwner").val();
        DATA_EXPORTAR.Experto = CaseIsNullSendExport($("#txtExperto").val());//$("#txtExperto").val();
        DATA_EXPORTAR.Gerencia = CaseIsNullSendExport($("#txtGerencia").val()); //$("#txtGerencia").val();
        DATA_EXPORTAR.Division = CaseIsNullSendExport($("#txtDivision").val());//$("#txtDivision").val();
        DATA_EXPORTAR.Gestionado = CaseIsNullSendExport($("#cbFilGestionadoPor").val());
        DATA_EXPORTAR.Aplicacion = $("#hdAplicacionId").val() === "0" ? $("#txtAplicacion").val() : $("#hdAplicacionId").val(); //$("#txtAplicacion").val() || ""; // 
        DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFilEstado").val()); //$("#cbFilEstado").val();
        DATA_EXPORTAR.Area = CaseIsNullSendExport($("#txtArea").val());//$("#txtArea").val();
        DATA_EXPORTAR.Unidad = CaseIsNullSendExport($("#txtUnidad").val());//$("#txtUnidad").val();
        DATA_EXPORTAR.TipoActivo = CaseIsNullSendExport($("#cbTipoActivo").val()); //$("#cbTipoActivo").val();
        DATA_EXPORTAR.ClasificacionTecnica = CaseIsNullSendExport($("#ddlClasificacionTecnica").val()); //$("#cbTipoActivo").val(); //TODO
        DATA_EXPORTAR.Gestor = CaseIsNullSendExport($("#txtGestor").val());//$("#txtGestor").val();
        DATA_EXPORTAR.Fecha = $("#FechaFiltro").val();
        DATA_EXPORTAR.TTL = CaseIsNullSendExport($("#txtTTL").val());//$("#txtTTL").val();
        DATA_EXPORTAR.Broker = CaseIsNullSendExport($("#txtBroker").val());//$("#txtBroker").val();
        DATA_EXPORTAR.sortName = 'Priorizacion';
        DATA_EXPORTAR.sortOrder = 'desc';

        let url = `${URL_API_VISTA}/Reportes/GerenciaDivision/Exportar?gerencia=${DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division}&gestionado=${DATA_EXPORTAR.Gestionado}&aplicacion=${DATA_EXPORTAR.Aplicacion}&jefe=${DATA_EXPORTAR.JefeEquipo}&owner=${DATA_EXPORTAR.Owner}&experto=${DATA_EXPORTAR.Experto}&estado=${DATA_EXPORTAR.Estado}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&area=${DATA_EXPORTAR.Area}&unidad=${DATA_EXPORTAR.Unidad}&tipoActivo=${DATA_EXPORTAR.TipoActivo}&gestor=${DATA_EXPORTAR.Gestor}&fecha=${DATA_EXPORTAR.Fecha}&ttl=${DATA_EXPORTAR.TTL}&broker=${DATA_EXPORTAR.Broker}&clasificacion=${DATA_EXPORTAR.ClasificacionTecnica}`;
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

function detailFormatter(index, row) {

    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="semaforoFormatter" data-field="IndicadorObsolescencia" data-halign="center" data-valign="middle" data-align="center" data-width="100">Estado</th >\
                                    <th data-field="TipoToString" data-halign="center" data-valign="middle" data-align="left" data-width="50" data-sortable="true" data-sort-name="TipoId">Tipo</th>\
                                    <th data-field="Nombre" data-halign="center" data-valign="middle" data-align="left" data-width="50" data-sortable="true" data-sort-name="Nombre">Equipo</th>\
                                    <th data-field="EstadoToString" data-halign="center" data-valign="middle" data-align="left" data-width="200" data-sortable="true" data-sort-name="EstadoId">Estado</th>\
                                    <th data-field="DetalleAmbiente" data-halign="center" data-valign="middle" data-align="left" data-width="200" data-sortable="true" data-sort-name="Ambiente">Ambiente</th>\
                                    <th data-field="Dominio" data-halign="center" data-valign="middle" data-align="left" data-width="100" data-sortable="true" data-sort-name="Dominio">Dominio</th>\
                                    <th data-field="Subdominio" data-halign="center" data-valign="middle" data-align="left" data-width="200" data-sortable="true" data-sort-name="Subdominio">Subdominio</th>\
                                    <th data-field="ClaveTecnologia" data-halign="center" data-valign="middle" data-align="center" data-width="200" data-sortable="true" data-sort-name="ClaveTecnologia">Tecnología</th>\
                                    <th data-field="FechaFinToString" data-halign="center" data-valign="middle" data-align="center" data-width="200" data-sortable="true" data-sort-name="FechaCalculoBase">Fecha de fin <br/>de soporte</th>\
                                    <th data-field="IndiceObsolescencia" data-halign="center" data-valign="middle" data-align="center" data-width="80" data-sortable="true" data-sort-name="IndiceObsolescencia">Índice de obsolescencia</th>\
                                </tr>\
                            </thead>\
                        </table>', row.Id);

    return html;
}
function MostrarFiltroAdicionales() {
    let $btn = $("#btnMostrarFiltroAdicionales");
    if ($btn.html() === texto_mostrar) {
        $(".filtroAvanzado").show();

        //LimpiarFiltrosAdicionales();

        $btn.html(texto_ocultar);
    } else if ($btn.html() === texto_ocultar) {
        $(".filtroAvanzado").hide();
        $(".filtroAvanzado").find(".form-control.ui-autocomplete-input").val("");
        //LimpiarFiltrosAdicionales();


        $btn.html(texto_mostrar);
    }
}

function LimpiarFiltrosAdicionales() {
    $("#txtGerencia").val("-1");
    $("#txtDivision").val("-1");
    $("#txtExperto").val("-1");
    $("#txtAplicacion").val("");
    $("#txtArea").val("-1");
    $("#txtUnidad").val("-1");
    $("#cbFilEstado").val("-1");
    $("#ddlClasificacionTecnica").val("-1");
}

function linkFormatter(value, row) {
    return `<a href="javascript:ViewDetails('${value}')" title="Mostrar detalle">${value}</a>`;
}
function ViewDetails(codigoAPT) {
    listarRegistrosDetalle(codigoAPT, $tableDetalle, null);

}
function LimpiarMdAddOrEditRegistro() {
    $tableDetalle.bootstrapTable();
    $tableDetalle.bootstrapTable({ data: [] });
}
function OpenModal() {
    MdAddOrEditRegistro(true);
}
function MdAddOrEditRegistro(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    if (EstadoMd)
        $("#MdAddOrEditModal").modal(opcionesModal);
    else
        $("#MdAddOrEditModal").modal("hide");
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