//TAB TABLAS
var $table = $("#tbl-tecAprob");
var $tblUmbrales = $("#tblUmbrales");
var $tblPeak = $("#tblPeak");
var $tbPeakHistorial = $("#tblHistorialPeak");
var $tbUmbralHistorial = $("#tblHistorialUmbral");
var $tblRegistroRelacionDriver = $("#tblRegistroRelacionDriver");
var $tblRegistroRelacionDriver2 = $("#tblRegistroRelacionDriverVer");
//TAB APIS
var URL_API_VISTA = URL_API + "/GestionUmbrales";
//TAB VARIABLES
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Gestion de Umbrales";
var PARAMETRO_ACTIVAR_EQUIPO = false;
var FLAG_ACTIVO_TECNOLOGIA = 0;
var FLAG_TIPOUMBRUL_UNICO = 0;
var PARAMETRO_UMBRALID = 0;
var PARAMETRO_MATRICULA = 0;
var PARAMETRO_PERFIL = "";
var PARAMETRO_PERFILID = 0;
var PARAMETRO_MODIFICO_ARCHIVO = 0;
var LIST_DRIVERUNIDADMEDIDA = [];
var LIST_UMBRALESCABECERA = [];
var LIST_UMBRALESDETALLE = [];
var PARAMETRO_FORMATOS_ACEPTADOS = "";
var PARAMETRO_ESTADO_OWNER_CROSS = "";

var PARAMETRO_VALIDAR_PERFIL_ADMIN = "E195_Administrador";
var PARAMETRO_VALIDAR_PERFIL_QA = "E195_QA_TESTER";


var LIST_UMBRALESCABECERA_H = [];
var LIST_UMBRALESDETALLE_H = [];

var TIPOVALOR_METRICA = 0;
var evPeak = false;
var evUmbral = false;
var iManager = 0;
var isFlagPiezaCross = false;

$(function () {
    $tblUmbrales.bootstrapTable("destroy");
    $tblUmbrales.bootstrapTable({ data: [] });

    $tblPeak.bootstrapTable("destroy");
    $tblPeak.bootstrapTable({ data: [] });

    /*InitAutocompletarTecnologiaSearch($("#txtBusTec"), $("#hdnBusTec"), $(".searchContainer"));*/
    InitAutocompletarAppsApisSearch($("#txtBusTec"), $("#hdnBusTec"), $("#hdnBusTip"), $(".searchContainer"));
    //InitAutocompletarProductoSearch($("#txtProductoBusTec"), $("#hdnProductoBusTec"), ".searchProductoContainer");
    InitUpload($('#txtArchivo'), 'inputArchivo');
    $("#btnActulizarComCross").click(guardarActualizarCompCross);
    $("#btnActulizarComCross2").click(guardarActualizarCompCross);
    CargarCombos(() => {
        $("#ddlDriver").change(CargarUnidadMedidaBusqueda);
    });
    CargarFormatosArchivo();
    CargarEstadooOwner();
    validarAddOrEditUmbral();
    validarAddPeaktUmbral();
    let User = USUARIO.UsuarioBCP_Dto;
    PARAMETRO_PERFIL = User.Perfil;
    PARAMETRO_PERFILID = User.PerfilId;
    PARAMETRO_MATRICULA = User.Matricula;

    $("#lblPerfil").html(PARAMETRO_PERFIL);
    $("#lblPerfilId").html(PARAMETRO_PERFILID);
    $("#lblMatricula").html(PARAMETRO_MATRICULA);


    $('#heading-filtro').on('click', function (e) {
        var $this = $(this);

        if (!$this.hasClass('collapsed')) {
            $this.find('span').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            //    $this.parents('.panel').find('.panel-body').slideUp();
            //$this.addClass('collapsed');
            //    $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        } else {
            //    $this.parents('.panel').find('.panel-body').slideDown();
            //    $this.removeClass('panel-collapsed');

            $this.find('span').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');

            //    var tblName = $this.parents('.panel').find('.panel-body').find("table.dataTable").prop("id");
            //    var _data = [];
        }


    });

    $('.validarnumericos').keypress(function (e) {
        if (isNaN(this.value + String.fromCharCode(e.charCode)))
            return false;
    }).on("cut copy paste", function (e) {
        e.preventDefault();
    });


});


function CargarFormatosArchivo() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GetParametroArchivoAceptado`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    PARAMETRO_FORMATOS_ACEPTADOS = dataObject.ArchivosAceptados;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });


    $('#flArchivo').attr("accept", PARAMETRO_FORMATOS_ACEPTADOS);
}


function CargarEstadooOwner() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GetParametroOwnerActivaODesactiva`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    PARAMETRO_ESTADO_OWNER_CROSS = dataObject.EstadoOwnerModificaCross;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

}

function CargarUnidadMedidaBusqueda() {
    let DriverId = $("#ddlDriver").val() || [];
    let listUnidadMedida = LIST_DRIVERUNIDADMEDIDA.filter(x => DriverId == x.TipoId || DriverId.length == 0);
    SetItems(listUnidadMedida, $("#ddlUMedida"), TEXTO_SELECCIONE);
}

function validarAddOrEditUmbral() {
    $.validator.addMethod("requiredArchivo", function (value, element) {
        return $.trim(value) !== "";
    });
    $("#formAddOrEditUmbral").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtValorUmbral: {
                requiredSinEspacios: true
            },
            ddlTipos: {
                requiredSelect: true
            },
            ddlTipoValor: {
                requiredSelect: true
            }
            //, flArchivo: {
            //    requiredArchivo: true
            //}
        },
        messages: {

            txtValorUmbral: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el valor")
            },
            ddlTipos: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo")
            },
            ddlTipoValor: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el nombre")
            },
            //flArchivo: {
            //    requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo")
            //}
        },
        errorPlacement: (error, element) => {
            //if (element.attr('name') === "txtArchivo" || element.attr('name') === "flArchivo") {
            //    element.parent().parent().append(error);
            //} else {
            element.parent().append(error);
            //}
        }
    });
}



function validarAddPeaktUmbral() {

    $("#formAddPeakUmbral").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtValorPeak: {
                requiredSinEspacios: true
            },
            ddlTipoUndMedida: {
                requiredSelect: true
            },
            txtDescripcionPeak: {
                requiredArchivo: true
            }
        },
        messages: {

            txtValorPeak: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el valor")
            },
            ddlTipoUndMedida: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo")
            },
            txtDescripcionPeak: {
                requiredArchivo: String.Format("Debes seleccionar {0}.", "una descripción")
            }
        },
        errorPlacement: (error, element) => {
            //if (element.attr('name') === "txtArchivo" || element.attr('name') === "flArchivo") {
            //    element.parent().parent().append(error);
            //} else {
            element.parent().append(error);
            //}
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
                    url: URL_API_VISTA + `/ListaAutoCompletarProducto?descripcion=${encodeURIComponent(request.term)}`,
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
            return $("<li>")
                .append("<a style='display: block'><font>" + item.Fabricante + " " + item.Nombre + "</font></a>")
                .appendTo(ul);
        };
}

function InitAutocompletarTecnologiaSearch($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API_VISTA + `/ListaAutoCompletarTecnologia?descripcion=${encodeURIComponent(request.term)}`,
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            return false;
        }
    })
        .keyup(function (e) {
            if ($searchBox.val() == "") {
                $IdBox.val("");
            }
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
            return $("<li>")
                .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
                .appendTo(ul);
        };
}


function InitAutocompletarAppsApisSearch($searchBox, $IdBox, $Tipo, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API_VISTA + `/ListaAutoCompletarAppApis?descripcion=${encodeURIComponent(request.term)}`,
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
            //$searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $searchBox.val(ui.item.Descripcion);
            $IdBox.val(ui.item.Id);
            $Tipo.val(ui.item.value);
            $searchBox.val(ui.item.Descripcion);
            return false;
        }
    })
        .keyup(function (e) {
            if ($searchBox.val() == "") {
                $IdBox.val("");
                $Tipo.val("");
            }
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
            var a = document.createElement("a");
            var font = document.createElement("font");
            font.append(document.createTextNode(item.Descripcion));
            a.style.display = 'block';
            a.append(font);
            return $("<li>").append(a).appendTo(ul);
        };
}



function buscarTec() {
    $("#UmbralesDetalle").css('display', 'none');
    listarTecSTD();
    if ($("#hdnBusTip").val() == '1') {
        $("#tbl-tecAprob").bootstrapTable("showColumn", "Id");
    } else {
        $("#tbl-tecAprob").bootstrapTable("showColumn", "aplicacionOwner");
        $("#nomDesc").text("Api");
    }
}

function listarTecSTD() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/ListadoAppApisCross",
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
            DATA_EXPORTAR.codigoAPT = $("#hdnBusTec").val();
            DATA_EXPORTAR.nombre = $.trim($("#txtBusTec").val());
            DATA_EXPORTAR.tipoCodigo = $("#hdnBusTip").val();
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
            bootbox.alert("Se produjo un error al listar los registros.");
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onLoadSuccess: function (data) {

            var TotalRegistros = data.total;
            isFlagPiezaCross = TotalRegistros == 1 ? data.rows[0].FlagComponenteCross : false;
            if (TotalRegistros == 1 && data.rows[0].FlagComponenteCross == 1) {
                var elID = data.rows[0].Id;
                var elNombre = data.rows[0].nombre;
                var elOwner = data.rows[0].PuedeGestionar;
                iManager = elOwner;
                var elQA = data.rows[0].gestorQa;
                var delayInMilliseconds = 500; //1 second
                setTimeout(function () {
                    seleccionarRow(elID, elNombre, elOwner, elQA);
                }, delayInMilliseconds);
            }
        }
    });
}

function CheckComponenteCross(value, row, index) {
    let style_color = row.FlagComponenteCross ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.FlagComponenteCross ? "check" : "unchecked";
    let estado = `<i id="cbOpcTip${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i>`;
    return estado;
}

function opciones(value, row, index) {
    let Selecionar = `<a href="javascript:seleccionarRow('${row.Id}','${row.nombre}',${row.PuedeGestionar},${row.gestorQa})" title="Seleccionar"><i class="iconoNegro glyphicon glyphicon-arrow-left"></i></a>`;
    let Selecionar2 = ``;
    let Selecionar3 = ``;
    let SelecionarConca = ``;
    let espacio = "&nbsp;&nbsp;";
    if (row.FlagComponenteCross != 1) {
        espacio = "";
        Selecionar = ``;
        Selecionar2 = `<a href="javascript:activarCrossRow('${row.Id}')"  title="Es pieza cross crítica" ><i class="iconoVerde glyphicon glyphicon-check"></i></a>`;
        SelecionarConca = Selecionar2;
    } else {
        Selecionar3 = `<a href="javascript:inactivarCrossRow('${row.Id}')" title="No es pieza cross crítica" ><i class="iconoRojo glyphicon glyphicon-remove"></i></a>`;
        SelecionarConca = Selecionar3;
    }
    if (row.PuedeGestionar === 0) {
        SelecionarConca = ``;
    }
    //if (row.OwnerTecnologia == 0 && PARAMETRO_PERFIL != PARAMETRO_VALIDAR_PERFIL_QA) {
    //    if (PARAMETRO_PERFIL != PARAMETRO_VALIDAR_PERFIL_ADMIN) {
    //        SelecionarConca = ``;
    //    }
    //} else {
    //    if (PARAMETRO_ESTADO_OWNER_CROSS == 'false') {
    //        SelecionarConca = ``;
    //    }
    //}
    //if (PARAMETRO_PERFIL == PARAMETRO_VALIDAR_PERFIL_QA) {
    //    SelecionarConca = ``;
    //}
    return Selecionar.concat(espacio, SelecionarConca);
}

function activarCrossRow(id) {
    var table = document.getElementById("tbl-tecAprob");
    for (var i = 0; i < table.rows.length; i++) {
        table.rows[i].style.backgroundColor = "";
    }
    for (var i = 0; i < table.rows.length; i++) {
        if (table.rows[i].dataset.uniqueid == id) {
            $("#hdnIdTecnologiaSeleccionada").val(id);
            $("#hdnIdTecnologiaComCrossActivo").val(true);

            table.rows[i].style.backgroundColor = "#FFFF8A";
            setViewModalEquipo(PARAMETRO_ACTIVAR_EQUIPO);
            irActCompCrossModalUmbral(true);
        }
    }
}

function guardarActualizarCompCross() {
    var codigoAppApi = $("#hdnIdTecnologiaSeleccionada").val();
    var estado = $("#hdnIdTecnologiaComCrossActivo").val();
    var Tipo = $("#hdnBusTip").val();

    var params = {};
    params.codigoAppApi = codigoAppApi;
    params.tipoCross = Tipo;
    params.Activo = estado;

    let mensaje = "Ha activado correctamente una pieza cross crítica.";
    if (estado === "false") {
        mensaje = "Ha desactivado correctamente una pieza cross crítica.";
    }

    $.ajax({
        url: URL_API_VISTA + "/ProcesarComponenteCross",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(params),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    toastr.success(mensaje, TITULO_MENSAJE);
                    $('.modal').modal('hide');
                    $('.modal-backdrop').remove();
                    buscarTec();
                }
            }
        },
        complete: function (data) {
            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function inactivarCrossRow(id) {
    var table = document.getElementById("tbl-tecAprob");
    for (var i = 0; i < table.rows.length; i++) {
        table.rows[i].style.backgroundColor = "";
    }
    for (var i = 0; i < table.rows.length; i++) {
        if (table.rows[i].dataset.uniqueid == id) {
            $("#hdnIdTecnologiaSeleccionada").val(id);
            $("#hdnIdTecnologiaComCrossActivo").val(false);
            table.rows[i].style.backgroundColor = "#FFFF8A";
            CargarUmbrales(id);
            var delayInMilliseconds = 500; //1 second
            setTimeout(function () {
                if (LIST_UMBRALESCABECERA.length == 0) {
                    guardarActualizarCompCross();
                } else {
                    setViewModalEquipo(PARAMETRO_ACTIVAR_EQUIPO);
                    irActCompCrossModalUmbral2(true);
                }
            }, delayInMilliseconds);
        }
    }
}

function seleccionarRow(id, nombre, owner, qa) {
    var table = document.getElementById("tbl-tecAprob");
    for (var i = 0; i < table.rows.length; i++) {
        table.rows[i].style.backgroundColor = "";
    }
    for (var i = 0; i < table.rows.length; i++) {
        if (table.rows[i].dataset.uniqueid == id) {
            $("#hdnIdTecnologiaSeleccionada").val(id);
            $("#hdnOwernerTecnologiaSeleccionado").val(owner);
            table.rows[i].style.backgroundColor = "#FFFF8A";
            $("#UmbralesDetalle").css('display', 'block');
            $("#hdDesProducto").val(nombre);
            $("#hdnQACrossSeleccionado").val(qa);

            // $("#subtitleformVerEvidenciaUmbral").html("Component Cross: <b>" + nombre + "</b>");
            //$("#subtitleformAddOrEditUmbral").html("Component Cross: <b> " + nombre + "</b >");


            //if (owner == 0 && PARAMETRO_PERFIL != PARAMETRO_VALIDAR_PERFIL_QA) {
            //    if (PARAMETRO_PERFIL.indexOf(PARAMETRO_VALIDAR_PERFIL_ADMIN) == -1) {
            //        $("#bntagregarUmbral").hide();
            //    } else {
            //        $("#bntagregarUmbral").show();
            //    }
            //} else {
            //    $("#bntagregarUmbral").show();
            //}

            if (owner == 0) {
                if (qa == 0) {
                    $("#bntagregarUmbral").hide();
                    $("#bntagregarPeak").hide();
                } else {
                    $("#bntagregarPeak").hide();
                }
            } else {
                $("#bntagregarUmbral").show();
                $("#bntagregarPeak").show()
            }

            //if (qa == 1) {
            //    $("#bntagregarUmbral").show();
            //} else {
            //    $("#bntagregarUmbral").hide();
            //}

            PARAMETRO_MODIFICO_ARCHIVO = 1;


            var codApp = "";
            var codApi = 0;

            if ($("#hdnBusTip").val() == 1) {
                codApp = id;
            } else {
                codApi = id;
            }
            CargarUmbrales(codApp, codApi);
            CargarPeak(codApp, codApi, true);

        }
    }
}

function opcionesUmbrales(value, row, index) {
    let btn1 = `<a href="javascript:editUmbral('${row.UmbralId}','${row.UsuarioCreacion}' )" title="Editar"><i class="glyphicon glyphicon-edit"></i></a>`;
    if (row.FlagActivo != 1) {
        btn1 = "";
    }
    //if ($("#hdnOwernerTecnologiaSeleccionado").val() == 0 && PARAMETRO_PERFIL != PARAMETRO_VALIDAR_PERFIL_QA) {
    //    if (PARAMETRO_PERFIL != PARAMETRO_VALIDAR_PERFIL_ADMIN) {
    //        btn1 = "";
    //    }
    //}

    if ($("#hdnQACrossSeleccionado").val() == 1) {
        if (row.isOwnerRecord == 0) {
            btn1 = "";
        }
    }
    if ($("#hdnOwernerTecnologiaSeleccionado").val() == 0
        && $("#hdnQACrossSeleccionado").val() == 0) {
        if (iManager == 0) {
            btn1 = "";
        }
    }

    let btn2 = `<a href="javascript:verEvidencia('${row.UmbralId}');" title="Evidencia"><i class="glyphicon glyphicon-eye-open"></i></a>`;
    return btn1.concat("&nbsp;&nbsp;", btn2);
}

function opcionesDrivers(value, row, index) {
    let btn1 = `<a href="javascript:guardarEliminarRelacionDriver('${row.DriverId}','${row.UnidadMedidaId}');" title="Eliminar"><i class="glyphicon glyphicon-trash"></i></a>`;
    return btn1;
}

function verEvidencia(Id) {
    ;
    $("#titleFormVerEvidenciaUmbral").html("Umbral de pieza cross crítica - " + $("#hdDesProducto").val());
    $(".onlyAdd").show();
    $(".onlyAdd").removeClass("ignore");
    setViewModalEquipo(PARAMETRO_ACTIVAR_EQUIPO);
    let LstUmbralesDetalle = LIST_UMBRALESCABECERA.filter(x => Id == x.UmbralId || Id.length == 0);
    $("#txtArchivoVer").val(LstUmbralesDetalle[0].RefEvidencia);
    //if (LstUmbralesDetalle[0].RefEvidencia.length > 0) {
    $("#hdUmbralId").val(Id);
    $("#ddlTiposVer").val(LstUmbralesDetalle[0].TipoUmbralId);
    $("#ddlTipoValorVer").val(LstUmbralesDetalle[0].TipoValorId);
    $("#txtValorUmbralVer").val(LstUmbralesDetalle[0].ValorUmbral);
    $("#ddlTiposVer").attr("disabled", "disabled");
    $("#ddlTipoValorVer").attr("disabled", "disabled");
    $("#txtValorUmbralVer").attr("disabled", "disabled");
    $("#flArchivoVer").attr("disabled", "disabled");
    $("#txtArchivoVer").attr("disabled", "disabled");

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblRegistroRelacionDriver2.bootstrapTable('destroy');
    $tblRegistroRelacionDriver2.bootstrapTable({
        url: URL_API_VISTA + "/ListadoDetalle",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "TipoDescripcion",
        sortOrder: "asc",
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.id = Id;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            var total = data.Total;

            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
            waitingDialog.hide();
            bootbox.alert("Se produjo un error al listar los registros.");
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onLoadSuccess: function (data) {
            irVerEvidenciaModalUmbral(true);
            $("#btnDescargarVer").show();
        }
    });

    //}
}

function rowNumFormatterServer(value, row, index) {
    var pageNumber = $table.bootstrapTable('getOptions').pageNumber;
    var pageSize = $table.bootstrapTable('getOptions').pageSize;
    var rowNum = (pageSize * (pageNumber - 1)) + (index + 1);
    return rowNum;
}

function CargarCombos(fn = null) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    LIST_DRIVERUNIDADMEDIDA = dataObject.DriverUM;
                    SetItems(dataObject.Tipos, $("#ddlTipos"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoValor, $("#ddlTipoValor"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Tipos, $("#ddlTiposVer"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoValor, $("#ddlTipoValorVer"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Driver, $("#ddlDriver"), TEXTO_SELECCIONE);
                    if (typeof fn == "function") fn();
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function CargarCombosTipos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Tipos, $("#ddlTipos"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}



function rowStyle(row, index) {
    var classes = [
        'bg-blue',
        'bg-green',
        'bg-orange',
        'bg-yellow',
        'bg-red'
    ];

    if (row.FlagActivo != false) {
        return {
            classes: classes[1],
            css: {
                color: 'black'
            }
        };
    }

    return {
        css: {
            color: 'black'
        }
    };
}

function CargarUmbrales(Idapt, IdEqui) {
    ListarUmbreles(Idapt, IdEqui);
}

function ListarUmbreles(Idapt, IdEqui) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblUmbrales.bootstrapTable('destroy');
    $tblUmbrales.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "FechaCreacionoOrden",
        sortOrder: "desc",
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            //DATA_EXPORTAR.id = Id;
            DATA_EXPORTAR.codigoAPT = Idapt;
            DATA_EXPORTAR.equipoId = IdEqui;
            DATA_EXPORTAR.umbralId = 0;
            DATA_EXPORTAR.Activos = true;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            var total = data.Total;
            if (total == 0) {
                FLAG_TIPOUMBRUL_UNICO = 0;
            }
            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
            waitingDialog.hide();
            bootbox.alert("Se produjo un error al listar los registros.");
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onLoadSuccess: function (data) {
            LIST_UMBRALESCABECERA = data.rows;
            TIPOVALOR_METRICA = 0;
            for (var i = 0; i < data.rows.length; i++) {
                var eltipo = data.rows[i].TipoUmbralId;
                var tipoValor = data.rows[i].TipoValorId;
                FLAG_TIPOUMBRUL_UNICO = 1;
                TIPOVALOR_METRICA = tipoValor;
                //if (eltipo == 1) {
                /* FLAG_TIPOUMBRUL_UNICO = eltipo;*/
                //}
            }
        }
    });
}

function editUmbral(Id, Usuario) {
    if (Usuario != PARAMETRO_MATRICULA) {
        bootbox.alert("Solo está permitida la edición, al usuario que realizó el registro del umbral.");
        return;
    }
    $("#flArchivo, #txtArchivo").val("");
    $("#titleFormUmbral").html("Editar Umbral - " + $("#hdDesProducto").val());
    $(".onlyAdd").show();
    $(".onlyAdd").removeClass("ignore");
    var validator = $("#formAddOrEditUmbral").validate();
    validator.resetForm();
    PARAMETRO_MODIFICO_ARCHIVO = 0;
    $('#flArchivo').rules('remove');
    setViewModalEquipo(PARAMETRO_ACTIVAR_EQUIPO);
    CargarCombosTipos();
    let LstUmbralesDetalle = LIST_UMBRALESCABECERA.filter(x => Id == x.UmbralId || Id.length == 0);
    if (LstUmbralesDetalle.length == 0) {
        bootbox.alert("Se produjo un error al listar del detalle.");
        return;
    }
    PARAMETRO_UMBRALID = Id;
    $("#hdUmbralId").val(Id);
    $("#ddlTipos").val(LstUmbralesDetalle[0].TipoUmbralId);
    $("#ddlTipoValor").val(LstUmbralesDetalle[0].TipoValorId);
    $("#txtValorUmbral").val(LstUmbralesDetalle[0].ValorUmbral);
    $("#txtArchivo").val(LstUmbralesDetalle[0].RefEvidencia);

    if (LstUmbralesDetalle[0].RefEvidencia.length > 0) {
        $("#btnDescargar").show();
    }

    $('#ddlTipos').prop('disabled', 'disabled');
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblRegistroRelacionDriver.bootstrapTable('destroy');
    $tblRegistroRelacionDriver.bootstrapTable({
        url: URL_API_VISTA + "/ListadoDetalle",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "TipoDescripcion",
        sortOrder: "asc",
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.id = Id;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            var total = data.Total;

            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
            waitingDialog.hide();
            bootbox.alert("Se produjo un error al listar los registros.");
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onLoadSuccess: function (data) {
            LIST_UMBRALESDETALLE = data.rows;
            irAddOrEditModalUmbral(true);
        }
    });
}

function addUmbral() {
    $("#titleFormUmbral").html("Registro de Umbral - " + $("#hdDesProducto").val());
    $(".onlyAdd").show();
    $(".onlyAdd").removeClass("ignore");
    $("#formAddOrEditUmbral")[0].reset();
    $("#hdUmbralId").val("");
    $("#flArchivo, #txtArchivo").val("");
    var validator = $("#formAddOrEditUmbral").validate();
    validator.resetForm();
    PARAMETRO_MODIFICO_ARCHIVO = 1;
    //$('#flArchivo').rules('remove');
    $('#flArchivo').rules('add', {
        required: true,
        messages: {
            required: String.Format("Debes seleccionar {0}.", "un archivo")
        }
    });
    $('#flArchivo').rules('remove');

    LIST_UMBRALESDETALLE = [];
    PARAMETRO_UMBRALID = 0;
    CargarCombosTipos();
    $("#btnDescargar").hide();
    $tblRegistroRelacionDriver.bootstrapTable('destroy');
    $tblRegistroRelacionDriver.bootstrapTable({ data: [] });
    setViewModalEquipo(PARAMETRO_ACTIVAR_EQUIPO);
    $('#ddlTipos').prop('disabled', false);
    var validarIrModal = 0;



    if (FLAG_TIPOUMBRUL_UNICO == 1) {
        validarIrModal += 1;
        $("#ddlTipos option[value=" + FLAG_TIPOUMBRUL_UNICO + "]").remove();
    }

    if ($("#hdnOwernerTecnologiaSeleccionado").val() > 0) {

        if ($("#hdnQACrossSeleccionado").val() == 0) {
            validarIrModal += 1;
            $("#ddlTipos option[value=2]").remove();
        } else {

            if (FLAG_TIPOUMBRUL_UNICO == 0) {
                validarIrModal += 1;
                $("#ddlTipos option[value=2]").remove();
            }
        }

    } else if ($("#hdnOwernerTecnologiaSeleccionado").val() == 0 && $("#hdnQACrossSeleccionado").val() == 1) {
        validarIrModal += 1;
        $("#ddlTipos option[value=1]").remove();
    }

    if (TIPOVALOR_METRICA > 0) {
        $("#ddlTipoValor").val(TIPOVALOR_METRICA);
        $("#ddlTipoValor").prop('disabled', true);
    } else {
        $("#ddlTipoValor").prop('disabled', false);
    }


    if (validarIrModal == 2 && $("#hdnQACrossSeleccionado").val() == 0) {
        bootbox.alert("La pieza cross crítica ya tiene registrado un umbral estimado. En adelante, solo se pueden registrar umbrales producto de pruebas.");
        return;
    }

    if ($("#hdnOwernerTecnologiaSeleccionado").val() == 0 && $("#hdnQACrossSeleccionado").val() == 0) {
        /*    if (LIST_UMBRALESCABECERA.length == 0 && PARAMETRO_PERFIL == PARAMETRO_VALIDAR_PERFIL_QA) {*/
        if (LIST_UMBRALESCABECERA.length == 0 && $("#hdnQACrossSeleccionado").val() == 1) {
            bootbox.alert("la pieza cross crítica no tiene registrado un umbral tipo estimado. Por favor, contactar al PO de la App y/o API que registre primero.");
            return;
        }
    }

    irAddOrEditModalUmbral(true);
}

function irAddOrEditModalUmbral(EstadoMd) {
    if (EstadoMd)
        $("#MdAddOrEditUmbral").modal(opcionesModal);
    else
        $("#MdAddOrEditUmbral").modal('hide');
}

function irVerEvidenciaModalUmbral(EstadoMd) {
    if (EstadoMd)
        $("#MdVerEvidenciaUmbral").modal(opcionesModal);
    else
        $("#MdVerEvidenciaUmbral").modal('hide');
}

function irActCompCrossModalUmbral(EstadoMd) {
    if (EstadoMd)
        $("#modalActulizarComCross").modal(opcionesModal);
    else
        $("#modalActulizarComCross").modal('hide');
}

function irActCompCrossModalUmbral2(EstadoMd) {
    if (EstadoMd)
        $("#modalActulizarComCross2").modal(opcionesModal);
    else
        $("#modalActulizarComCross2").modal('hide');
}

function setViewModalEquipo(parametro) {
    if (parametro) {
        $(".parametro-view").show();
        $(".parametro-view").removeClass("ignore");
    } else {
        $(".parametro-view").show();
        $(".parametro-view").removeClass("ignore");
    }
}

function guardarEliminarRelacionDriver(driverId, unidadmedidaId) {
    LIST_UMBRALESDETALLE = LIST_UMBRALESDETALLE.filter((item) => (item.DriverId != driverId || item.UnidadMedidaId != unidadmedidaId));
    $tblRegistroRelacionDriver.bootstrapTable('destroy');
    $tblRegistroRelacionDriver.bootstrapTable({
        data: LIST_UMBRALESDETALLE
    });
}


function guardarAddRelacionDriver() {
    var valDriverId = $("#ddlDriver").val();
    var valDriverText = $("#ddlDriver option:selected").text();
    var valUnidadMedidaId = $("#ddlUMedida").val();
    var valUnidadMedidaText = $("#ddlUMedida option:selected").text();
    var valValorText = $("#txtValorMedida").val();
    if (valDriverId == "-1") {
        toastr.warning("Por favor, seleccione un driver.", TITULO_MENSAJE);
        return;
    }
    if (valUnidadMedidaId == "-1") {
        toastr.warning("Por favor, seleccione una unidad de medida.", TITULO_MENSAJE);
        return;
    }
    if (valValorText.length > 10) {
        toastr.warning("La campo valor debe tener como maximo 10 caracteres.", TITULO_MENSAJE);
        return;
    } else if (valValorText.length == 0) {
        toastr.warning("El campo valor es obligatorio.", TITULO_MENSAJE);
        return;
    }
    var mydata =
    {
        "DriverId": valDriverId,
        "DriverNombre": valDriverText,
        "UnidadMedidaId": valUnidadMedidaId,
        "UnidadMedidaNombre": valUnidadMedidaText,
        "Valor": valValorText,
    };
    for (var i = 0; i < LIST_UMBRALESDETALLE.length; i++) {
        var elDriverId = LIST_UMBRALESDETALLE[i].DriverId;
        var elUnidadMedidaId = LIST_UMBRALESDETALLE[i].UnidadMedidaId;
        if (elDriverId == valDriverId && elUnidadMedidaId == valUnidadMedidaId) {
            toastr.warning("Por favor, eliminar antes de modificar otro valor. No se aceptan duplicados.", TITULO_MENSAJE);
            return;
        }
    }
    LIST_UMBRALESDETALLE.push(mydata);

    $tblRegistroRelacionDriver.bootstrapTable('destroy');
    $tblRegistroRelacionDriver.bootstrapTable({
        data: LIST_UMBRALESDETALLE
    });
    $("#ddlDriver").val($("#ddlDriver option:first").val());
    $("#ddlUMedida").find("option").remove().end();
    $("#txtValorMedida").val("");

}

function ExportarInfo() {

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.tecnlogiaId = CaseIsNullSendExport($("#hdnIdTecnologiaSeleccionada").val());
    DATA_EXPORTAR.matricula = CaseIsNullSendExport(PARAMETRO_MATRICULA);

    if (LIST_UMBRALESCABECERA.length == 0) {
        toastr.warning("Debe al menos ingresar un Umbral.", TITULO_MENSAJE);
        return;
    }

    let url = `${URL_API_VISTA}/Reportes/Umbrales/Exportar?tecnlogiaId=${DATA_EXPORTAR.tecnlogiaId}&matricula=${DATA_EXPORTAR.matricula}`;
    window.location.href = url;
}

function ExportarInfo2() {
    if (isFlagPiezaCross) {
        if (LIST_UMBRALESCABECERA.length > 0) {
            var codAppApi = "";
            var equipoId = 0;
            if ($("#hdnBusTip").val() == 1) {
                codAppApi = $("#hdnBusTec").val();
            } else {
                equipoId = $("#hdnBusTec").val();
            }
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.CodigoAPT = codAppApi;
            DATA_EXPORTAR.EquipoId = equipoId;
            
            $.ajax({
                url: URL_API_VISTA + "/Reportes/Umbrales/Exportar",
                type: "POST",
                data: JSON.stringify(DATA_EXPORTAR),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
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
        } else {
            toastr.warning("La pieza cross crítica no contiene umbrales registrados.", TITULO_MENSAJE);
        }
    } else {
        toastr.warning("no hay registro marcado como pieza cross crítica.", TITULO_MENSAJE);
    }
}



function InitUpload($inputText, classInput, btnDownload = null, btnRemove = null) {
    var inputs = document.querySelectorAll(`.${classInput}`);
    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;
        input.addEventListener('change', function (e) {
            var fileName = '';
            if (this.files && this.files.length > 1) {
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            } else {
                if (this.files && this.files.length == 1) {
                    if (btnDownload != null) btnDownload.show();
                    if (btnRemove != null) btnRemove.show();
                } else {
                    if (btnDownload != null) btnDownload.hide();
                    if (btnRemove != null) btnRemove.hide();
                }
                fileName = e.target.value.split('\\').pop();
            }

            if (fileName) {
                PARAMETRO_MODIFICO_ARCHIVO = 1;
                $inputText.val(fileName);
            } else {
                label.innerHTML = labelVal;
            }

        });
        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
}


function guardarAddRelacion() {
    if (!evUmbral) {
        evUmbral = true;
        if ($("#formAddOrEditUmbral").valid()) {
            //if (LIST_UMBRALESDETALLE.length == 0 && $("#ddlTipos").val() != 1) {
            //    toastr.warning("Por favor, debe agregar al menos un driver.", TITULO_MENSAJE);
            //    return;
            //}     
            if (PARAMETRO_MODIFICO_ARCHIVO == 1) {
                let ConformidadGST = $("#flArchivo").get(0).files;

                let ElNombre = ConformidadGST.length > 0 ? ConformidadGST[0].name : "";
                let UltimoPunto = ElNombre.lastIndexOf('.');
                let LaExtensionReal = ElNombre.substring(UltimoPunto + 1);

                if (ElNombre != "") {
                    var machesArchivos = 0;
                    var ArregloFormartos = PARAMETRO_FORMATOS_ACEPTADOS.split(", ");
                    for (var i = 0; i < ArregloFormartos.length; i++) {
                        var elformato = ArregloFormartos[i].replace(".", "");
                        if (LaExtensionReal == elformato) {
                            machesArchivos += 1;
                        }
                    }
                    if (machesArchivos == 0) {
                        toastr.error("No está permitido agregar como evidencia el archivo con la extensión seleccionada.", TITULO_MENSAJE);
                        return;
                    }
                }
            }

            var params = {};
            var codAppApi = '';
            var equipoId = null;
            let mensaje = "Ha registro correctamente un Umbral";
            if (parseInt(PARAMETRO_UMBRALID) > 0) {
                mensaje = "Ha editado correctamente un umbral";
            }

            if ($("#hdnBusTip").val() == 1) {
                codAppApi = $("#hdnBusTec").val();
            } else {
                equipoId = $("#hdnBusTec").val();
            }
            params.UmbralId = parseInt(PARAMETRO_UMBRALID);
            params.TipoUmbralId = parseInt($("#ddlTipos").val());
            params.TipoValorId = parseInt($("#ddlTipoValor").val());
            params.ValorUmbral = $("#txtValorUmbral").val();
            //params.UmbralTecnologiaId = parseInt($("#hdnIdTecnologiaSeleccionada").val()); 
            params.UmbralEquipoId = equipoId;
            params.UmbralAppId = codAppApi;

            params.RefEvidencia = $('#txtArchivo').val();
            params.UsuarioModificacion = PARAMETRO_MATRICULA;

            var resultadoString = "";
            for (var i = 0; i < LIST_UMBRALESDETALLE.length; i++) {
                var valor1 = LIST_UMBRALESDETALLE[i].DriverId;
                var valor2 = LIST_UMBRALESDETALLE[i].UnidadMedidaId;
                var valor3 = LIST_UMBRALESDETALLE[i].Valor;
                var unidados = valor1 + "," + valor2 + "," + valor3;
                resultadoString = resultadoString + unidados + "|"
            }
            resultadoString = resultadoString.slice(0, -1);
            params.UmbralDetalle = resultadoString;


            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            $.ajax({
                url: URL_API_VISTA + "/AddOrEditUmbral",
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(params),
                dataType: "json",
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                success: function (dataObject, textStatus) {
                    waitingDialog.hide();
                    if (textStatus === "success") {
                        if (dataObject !== null) {
                            let umbralID = dataObject;
                            if (PARAMETRO_MODIFICO_ARCHIVO == 1) {
                                if ($("#flArchivo").get(0).files.length > 0) {
                                    UploadEvidenviaUmbral($("#flArchivo"), umbralID);
                                }
                            }
                            toastr.success(mensaje, TITULO_MENSAJE);
                            ListarUmbreles(codAppApi, equipoId);
                        }
                    }
                    evUmbral = false;
                },
                complete: function () {
                    evUmbral = false;
                    waitingDialog.hide();
                    irAddOrEditModalUmbral(false);
                },
                error: function (result) {
                    waitingDialog.hide();
                    evUmbral = false;
                    bootbox.alert(result.responseText);
                }
            });
        } else {
            evUmbral = false;
        }
    }
}

function UploadEvidenviaUmbral($fileInput, idumbral) {
    let formData = new FormData();
    let ConformidadGST = $fileInput.get(0).files;
    formData.append("Evidencia", ConformidadGST[0]);
    formData.append("UmbralId", idumbral);

    $.ajax({
        url: URL_API_VISTA + "/AddOrEditUmbralArchivo",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            //OpenCloseModal($("#modalEliminar"), false);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}


function DescargarArchivo() {
    var Idapt = "";
    var IdEqui = 0;
    if ($("#hdnBusTip").val() == 1) {
        Idapt = $("#hdnBusTec").val();
    } else {
        IdEqui = parseInt($("#hdnBusTec").val());
    }
    DownloadFileSolicitud(parseInt(IdEqui), Idapt, $("#hdUmbralId").val());



}

function DownloadFileSolicitud(id, id1, id2) {
    let url = `${URL_API_VISTA}/downloadEvidenciaUmbral?equipoId=${id}&codigoApt=${id1}&idumb=${id2}`;
    window.location.href = url;
}


function addPeak() {

    if (LIST_UMBRALESCABECERA.length == 0) {
        bootbox.alert("La pieza cross crítica no tiene registrado un umbral estimado o de pruebas . Por favor, contactar al PO de la App y/o API que registre primero.");
        return;
    }


    $("#formAddPeakUmbral")[0].reset();
    CargarCombosTiposPeak();

    if (TIPOVALOR_METRICA > 0) {
        $("#ddlTipoUndMedida").val(TIPOVALOR_METRICA);
        $("#ddlTipoUndMedida").prop('disabled', true);
    } else {
        $("#ddlTipoUndMedida").prop('disabled', false);
    }

    irAddOrEditModalPeak(true);
}

function irAddOrEditModalPeak(EstadoMd) {
    if (EstadoMd)
        $("#MdAddOrEditPeak").modal(opcionesModal);
    else
        $("#MdAddOrEditPeak").modal('hide');
}


function CargarCombosTiposPeak() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoValor, $("#ddlTipoUndMedida"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function guardarAddPeak() {
    if (!evPeak) {
        evPeak = true;
        if ($("#formAddPeakUmbral").valid()) {

            var codAppApi = "";
            var equipoId = 0;
            var params = {};

            if ($("#hdnBusTip").val() == 1) {
                codAppApi = $("#hdnBusTec").val();
            } else {
                equipoId = $("#hdnBusTec").val();
            }

            params.CodigoAPT = codAppApi;
            params.EquipoId = parseInt(equipoId);
            params.TipoValorId = parseInt($("#ddlTipoUndMedida").val());
            params.ValorPeak = $("#txtValorPeak").val();
            params.DetallePeak = $("#txtDescripcionPeak").val();
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            $.ajax({
                url: URL_API_VISTA + "/AddOrEditPeak",
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(params),
                dataType: "json",
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                success: function (dataObject, textStatus) {
                    waitingDialog.hide();
                    if (textStatus === "success") {
                        if (dataObject !== null) {
                            toastr.success("ha registrado correctamente un peak", TITULO_MENSAJE);
                            $('.modal').modal('hide');
                            $('.modal-backdrop').remove();
                            ListarPeak(codAppApi, parseInt(equipoId), true);
                        }
                    }
                    evPeak = false;
                },
                complete: function () {
                    waitingDialog.hide();
                    irAddOrEditModalUmbral(false);
                    evPeak = false;
                },
                error: function (result) {
                    waitingDialog.hide();
                    evPeak = false;
                    //bootbox.alert(result.responseText);
                }
            });
        } else {
            evPeak = false;
        }

    }
}


function CargarPeak(Idapt, IdEqui, Activos) {
    ListarPeak(Idapt, IdEqui, Activos);
}

function ListarPeak(Idapt, IdEqui, Activos) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblPeak.bootstrapTable('destroy');
    $tblPeak.bootstrapTable({
        url: URL_API_VISTA + "/ListadoPeak",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "fecha",
        sortOrder: "desc",
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.codigoAPT = Idapt;
            DATA_EXPORTAR.equipoId = IdEqui;
            DATA_EXPORTAR.Activos = Activos;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            var total = data.Total;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
            waitingDialog.hide();
            bootbox.alert("Se produjo un error al listar los registros.");
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onLoadSuccess: function (data) {
            waitingDialog.hide();
        }
    });
}

function verHistorialPeak() {
    var EstadoMd = true;
    if (EstadoMd)
        $("#modalHistorialPeak").modal(opcionesModal);
    else
        $("#modalHistorialPeak").modal('hide');

}

function irHistorialPeak() {
    var Idapt = "";
    var IdEqui = 0;
    if ($("#hdnBusTip").val() == 1) {
        Idapt = $("#hdnBusTec").val();
    } else {
        IdEqui = parseInt($("#hdnBusTec").val());
    }

    OpenCloseModal($("#modalHistorialPeak"), true);
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tbPeakHistorial.bootstrapTable('destroy');
    $tbPeakHistorial.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListadoPeak",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "fecha",
        sortOrder: "desc",
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.codigoAPT = Idapt;
            PARAMS_API.equipoId = IdEqui;
            PARAMS_API.Activos = false;
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


function irHistorialUmbral() {


    var Idapt = "";
    var IdEqui = 0;
    if ($("#hdnBusTip").val() == 1) {
        Idapt = $("#hdnBusTec").val();
    } else {
        IdEqui = parseInt($("#hdnBusTec").val());
    }

    OpenCloseModal($("#modalHistorialUmbral"), true);
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tbUmbralHistorial.bootstrapTable('destroy');
    $tbUmbralHistorial.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "FechaCreacionoOrden",
        sortOrder: "desc",
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.codigoAPT = Idapt;
            PARAMS_API.equipoId = IdEqui;
            PARAMS_API.umbralId = 0;
            PARAMS_API.Activos = false;
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
        },
        onLoadSuccess: function (data) {
            LIST_UMBRALESCABECERA_H = data.rows;
            //for (var i = 0; i < data.rows.length; i++) {
            //    var eltipo = data.rows[i].TipoUmbralId;
            //    FLAG_TIPOUMBRUL_UNICO = 1;
            //    //if (eltipo == 1) {
            //    /* FLAG_TIPOUMBRUL_UNICO = eltipo;*/
            //    //}
            //}
        }
    });
}

