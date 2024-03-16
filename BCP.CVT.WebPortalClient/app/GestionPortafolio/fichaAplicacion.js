const URL_API_VISTA = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Portafolio de Aplicaciones";
const MENSAJE = "¿Estás seguro de actualizar los datos de la aplicación?";
const MENSAJE_CONFIRMACION = "Se actualizó la aplicación de manera satisfactoria.";
const MENSAJE_GOBIERNO_USERIT = "Este mensaje tiene que ser proporcionado por Gobierno UserIT ya que se cambia el Gestionado Por a UserIT";

const TIPO_DESARROLLO_INTERNO = 178;
const TIPO_WEB = 154;
const ID_USERIT = 1;
const TIPO_ACTIVO_USER_IT = 3;
var arquitectoActivo = true;

var $table = $("#tblRegistro");
var $tableRelaciones = $("#tblRelaciones");

var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "Name";
var ULTIMO_SORT_ORDER = "asc";

var ROLES_LIST = [];
var NUEVOS_ROLES_LIST = [];
var NUEVOS_Expertos = [];
var NUEVOS_Autorizadores = [];
var control = 0;
var estadoInicial = 0;
var cambiarInterface = true;
var pciInicial = "";
var listaInfraestructura = ["185", "190"];
var activarJenkins = "";
var InfraestructuraInicial = 0;
var NombrePersona = "";
var EmailPersona = "";
var tituloMensaje = "";

var lstHorarioFuncionamiento;
var isFlagPiezaCross = false;

$(function () {
    validarFormImportar();
    $("#msjUsuarioRepetido").hide();
    $("#ddlEntidades").multiselect('enable');

    $("#btnEliminar").click(SolicitudEliminacion);

    SetItemsMultiple([], $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple([], $("#ddlPCI"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    //InitAutocompletarEstandarBuilder2($("#txtOwner"), $("#hdOwnerId"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro?filtro={0}&filtroPadre=");
    InitAutocompletarBuilderLocalAD($("#txtOwner"), $("#hdOwnerId"), ".divUnidadContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
    $("#txtOwner").hide();

    InitAutocompletarUsuariosLocal3($("#txtExperto"), $("#hExpertoId"), ".divExpertoContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");

    InitAutocompletarUsuariosLocal4($("#txtConformidad"), $("#hConformidadId"), ".divConformidadContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
    $("#divTxtConformidadGST").hide();
    FormatoCheckBox($("#divFlagConformidadGST"), "ckbConformidadGST");
    $("#ckbConformidadGST").change(FlagConformidadGST_Change);
    $("#ddlTipoEliminacion").change(TipoEliminacion_Change);


    FormatoCheckBox($("#divFlagOwner"), "ckbOwner");
    $("#ckbOwner").change(FlagOwner_Change);

    FormatoCheckBox($("#divFlagProveedorDesarrollo"), "ckbProveedorDesarrollo");
    $("#ckbProveedorDesarrollo").change(FlagProveedorDesarrollo_Change);

    $("#txtRegistroUmbral").hide();
    FormatoCheckBox($("#divFlagComponenteCross"), "ckbFlagPiezaCross");

    $('#ddlPCI').on('change', function () {


        if ($('#ddlPCI').val() == null) {

        }

        else if ($('#ddlPCI').val().includes("4")) {
            $('#ddlPCI').val("4");
            $('#ddlPCI').multiselect('refresh');
        }

        else {
            const index = $('#ddlPCI').val().indexOf("4");
            if (index > -1) {
                $('#ddlPCI').val().splice(index, 1);
            }

            $('#ddlPCI').multiselect('refresh');
        }


        $('#ddlPCI').multiselect('refresh');
    });

    $("#txtCodigoInterfaz").hide();
    InitAutocompletarEstandarBuilder($("#txtUnidad"), $("#hdUnidadId"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro?filtro={0}&filtroPadre=");
    //InitAutocompletarUsuariosLocal($("#txtExperto"), $("#hExpertoId"), ".divExpertoContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
    InitAutocompletarUsuariosLocal2($("#txtAutorizador"), $("#hAutorizadorId"), ".divUsuarioAutorizadorContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
    InitInputFiles();

    $("#btnRegistrarApp").click(irConfirmarActualizacion);
    $("#btnConfirmarAct").click(guardarAddOrEditApp);
    $("#btnCancelar").click(cancelarAddOrEditApp);

    $("#btnRegistrarApp2").click(irConfirmarActualizacion);
    $("#btnCancelar2").click(cancelarAddOrEditApp);

    $("#ddlGestionadoPor").change(changeGestionado);
    $("#btnDescargar").click(descargarArchivo);

    $("#ddlAreaBIAN").change(changeArea);
    /*$("#ddlJefaturaTransferir").change(changeJefatura);*/

    cargarCombos();
    cargarCombosArquitectoNegocio();
    cargarCombosClasificacion();
    cargarCombosCapaFuncional();
    cargarToolbox();
    initFecha();
    initUpload($("#txtArchivo"));
    ValidarActivacionJenkins();
    var Unidad_Id
    $("#txtUnidad").change(function () {
        Unidad_Id = $("#hdUnidadId").val();
        CambioUnidad(APLICACION_ID, Unidad_Id)
    });

    FormatoCheckBox($("#divFlagInterface"), "ckbInterface");
    $("#ckbInterface").change(FlagInterface_Change);

    FormatoCheckBox($("#divFlagPCI"), "ckbPCI");
    $("#ckbPCI").change(FlagPCI_Change);
    $("#ddlInfraestructura").change(Infraestructure_Change);

    if (APLICACION_ID !== 0) {
        editarAplicacion(APLICACION_ID);


    } else {
        window.document.location.href = `CatalogoAplicacion?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;
    }

    $("#ddlHorarioFuncionamiento").change(horarioFuncionamiento_Change);

    $("#ddlArquitectoNegocio").change(function () {
        Arquitecto_Id = $("#ddlArquitectoNegocio").val();
        if (Arquitecto_Id != -1) {
            CambioArquitecto(Arquitecto_Id)
        }

        else {
            $("#txtJefaturaATI").val();
            $("#hdJefaturaATIID").val();
        }
    });

    $("#ddlArquitectoSolucion").change(function () {
        Arquitecto_Id = $("#ddlArquitectoSolucion").val();
        if (Arquitecto_Id != -1) {
            if (Arquitecto_Id != 0) {
                CambioArquitecto(Arquitecto_Id)
            }
        }
    });

    $("#ddlClasificacion").change(changeClasificacion);

    $("#ddlCriticidadBIAN").change(calcularCriticidad);
    $("#ddlClasificacionActivo").change(calcularCriticidad);
    /*    $("#ddlTipoDesarrollo").change(TipoDesarrollo_Change);*/

    validarFormApp();

    InitAutocompletarBuilder($("#txtCodigoAppPadre"), $("#hCodigoPadre"), ".containerPadreAplicacion", "/applicationportfolio/application/filter?filtro={0}&codigoAPT=" + $("#txtCodigoAPT").val());
    setDefaultHd($("#txtCodigoAppPadre"), $("#hCodigoPadre"));

    InitAutocompletarBuilder($("#txtGrupoTicketRemedy"), $("#hGrupoTicketRemedy"), ".containerGrupoRemedy", "/applicationportfolio/application/ListGroupRemedy?filtro={0}");
    setDefaultHd($("#txtGrupoTicketRemedy"), $("#hGrupoTicketRemedy"));

    InitAutocompletarBuilder($("#txtAplicacionReemplazada"), $("#hCodigoReemplazada"), ".containerReemplazoAplicacion", "/applicationportfolio/application/filter/replace?filtro={0}&codigoAPT=" + $("#txtCodigoAPT").val());
    setDefaultHd($("#txtAplicacionReemplazada"), $("#hCodigoReemplazada"));


    $("#txtAplicacionReemplazada").focusout(function () {
        let valor = $("#hCodigoReemplazada").val();
        if (valor == '0') {
            $("#txtAplicacionReemplazada").val('');
            toastr.error("El código de aplicación reemplazada no es válido, por favor seleccione una aplicación que se haya registrado en el portafolio.", TITULO_MENSAJE);
        }
    });

    $("#txtCodigoAppPadre").focusout(function () {
        let valor = $("#hCodigoPadre").val();
        if (valor == '0') {
            $("#txtCodigoAppPadre").val('');
            toastr.error("El código de aplicación padre no es válido, por favor seleccione una aplicación que se haya registrado en el portafolio.", TITULO_MENSAJE);
        }
    });


    $("#txtAutorizador").focusout(function () {
        let valor = $("#txtAutorizador").val().length;
        if (valor != control)
            $("#txtAutorizador").val('');
    });
    ListarRoles();

    $("#txtUnidad").focusout(function () {
        let valor = $("#txtUnidad").val();
        if (valor == '') {
            $("#txtResponsableUnidad").html('');
            $("#hdUnidadId").val('');
            $("#txtGerencia").val('');
            $("#txtArea").val('');
            $("#txtDivision").val('');
        }
    });
    $("#ddlGestionadoPor").change(function () {
        //if (VarificaSubsidiaria($("#ddlGestionadoPor").val())) {
        if ($("#ddlGestionadoPor").val() == 41) {
            var newOption = $('<option value="' + -2 + '">' + "NO APLICA" + '</option>');
            var newOption2 = $('<option value="' + -2 + '">' + "NO APLICA" + '</option>');
            var newOption3 = $('<option value="' + -2 + '">' + "NO APLICA" + '</option>');
            var newOption4 = $('<option value="' + -2 + '">' + "NO APLICA" + '</option>');
            var newOption5 = $('<option value="' + -2 + '">' + "NO APLICA" + '</option>');


            $('#ddlAreaBIAN').append(newOption);
            $('#ddlAreaBIAN').val(-2);
            $("#ddlAreaBIAN").attr("disabled", "disabled");


            $('#ddlDominioBIAN').append(newOption2);
            $('#ddlDominioBIAN').val(-2);
            $("#ddlDominioBIAN").attr("disabled", "disabled");


            $('#ddlTobe').append(newOption3);
            $('#ddlTobe').val(-2);
            $("#ddlTobe").attr("disabled", "disabled");

            $("#txtJefaturaATI").val("NO APLICA");
            $("#txtJefaturaATI").attr('disabled');
            $("#hdJefaturaATIID").val("");


            $('#ddlClasificacion').append(newOption4);
            $('#ddlClasificacion').val(-2);
            $("#ddlClasificacion").attr("disabled", "disabled");


            $('#ddlSubClasificacion').append(newOption5);
            $('#ddlSubClasificacion').val(-2);
            $("#ddlSubClasificacion").attr("disabled", "disabled");
        }
        else {

            $("#ddlAreaBIAN").removeAttr("disabled", "disabled");
            $("#ddlAreaBIAN option[value=-2]").remove();


            $("#ddlDominioBIAN").removeAttr("disabled", "disabled");
            $("#ddlDominioBIAN option[value=-2]").remove();


            $("#ddlTobe").removeAttr("disabled", "disabled");
            $("#ddlTobe option[value=-2]").remove();


            $("#txtJefaturaATI").removeAttr('disabled');



            $("#ddlClasificacion").removeAttr("disabled", "disabled");
            $("#ddlClasificacion option[value=-2]").remove();


            $("#ddlSubClasificacion").removeAttr("disabled", "disabled");
            $("#ddlSubClasificacion option[value=-2]").remove();
        }
    });
    //Roles();

    InfraestructuraInicial = $("#ddlInfraestructura").val();

    $("#btnIrRelaciones").click(IrRelaciones);
});

function IrRelaciones() {

    window.document.location.href = `/Vista/Relaciones`;
}

function ValidarActivacionJenkins() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/ValidateActivationJenkins",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    activarJenkins = dataObject;

                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}




function Infraestructure_Change() {

    if (listaInfraestructura.indexOf($("#ddlInfraestructura").val()) != -1 && activarJenkins.toUpperCase() == "TRUE") {
        OpenCloseModal($("#modalInfraestructura"), true);
    }

    if (InfraestructuraInicial != -1) {
        if (listaInfraestructura.indexOf($("#ddlInfraestructura").val()) == -1 && activarJenkins.toUpperCase() == "TRUE") {
            OpenCloseModal($("#modalInfraestructura2"), true);
        }
    }
}


function FlagPCI_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $("#ddlPCI").next().show();
        $("#ddlPCI option[value='4']").remove();
        $('#ddlPCI').val(pciInicial);
    }
    else {
        $("#ddlPCI").next().hide();
        var newOption = $('<option value="' + 4 + '">' + 'NO APLICA' + '</option>');
        $('#ddlPCI').append(newOption);
        $('#ddlPCI').val(4);
    }
}



function SolicitudEliminacion() {
    if ($("#formEliminar").valid()) {
        $("#btnEliminar").button("loading");

        if ($("#ddlTipoEliminacion").val() == 2) {
            var ConformidadGST = $("#flConformidad2").get(0).files;
            var TicketEliminacion = $("#flTicket").get(0).files;
            var Ratificacion = $("#flRatificacion").get(0).files;


            var pag = {
                Id: ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val()),
                Status: ESTADO_NOVIGENTE,
                Comments: $.trim($("#txtDescripcionEliminar").val()),

                PreviousState: $("#hdPreviousState").val(),
                flagRequiereConformidad: $("#ckbConformidadGST").prop("checked"),
                ticketEliminacion: $("#txtTicket").val(),
                expertoNombre: $("#txtExperto").val(),
                expertoMatricula: $("#hExpertoMatricula").val(),
                expertoCorreo: $("#hExpertoCorreo").val(),
                tipoEliminacion: $("#ddlTipoEliminacion").val()
            };
        }
        else if ($("#ddlTipoEliminacion").val() == 1) {
            var ConformidadGST = $("#flArchivo2").get(0).files;



            var pag = {
                Id: ($("#hdAplicacionId").val() === "") ? 0 : parseInt($("#hdAplicacionId").val()),
                Status: ESTADO_NOVIGENTE,
                Comments: $.trim($("#txtDescripcionEliminar").val()),

                PreviousState: $("#hdPreviousState").val(),
                expertoNombre: $("#txtConformidad").val(),
                expertoMatricula: $("#hConformidadMatricula").val(),
                expertoCorreo: $("#hConformidadCorreo").val(),
                tipoEliminacion: $("#ddlTipoEliminacion").val()
            };
        }


        var idsol = 0;

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/application/removeAdmin`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(pag),
                        //data: pag,
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        //contentType: false,
                        //processData: false,
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    idsol = dataObject;
                                    if (idsol > 0) {
                                        if ($("#ddlTipoEliminacion").val() == 1) {
                                            UploadFile2($("#flArchivo2"), idsol);
                                        }
                                        else if ($("#ddlTipoEliminacion").val() == 2) {
                                            UploadFile($("#flConformidad2"), $("#flTicket"), $("#flRatificacion"), idsol);
                                        }
                                        toastr.success("Se eliminó la aplicación correctamente.", TITULO_MENSAJE);
                                        window.document.location.href = `CatalogoAplicacion?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;

                                    }
                                    else
                                        toastr.error("No es posible eliminar la aplicación ya que existen solicitudes en proceso.", TITULO_MENSAJE);
                                }
                            }
                        },
                        complete: function (data) {

                            $("#btnEliminar").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalEliminar"), false);
                            LimpiarModal();

                            //window.document.location.href = `CatalogoAplicacion?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;

                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
                else {
                    $("#btnEliminar").button("reset");
                }
            }
        });
    }
}

function FlagConformidadGST_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $("#divTxtConformidadGST").show();
    }
    else {
        $("#divTxtConformidadGST").hide();
    }
}


function TipoEliminacion_Change() {
    let TipoEliminacion = $("#ddlTipoEliminacion").val();

    if (TipoEliminacion == 1) {
        $(".divProcesoEliminacion").hide();
        $(".divEliminacionAdministrativa").show();

        $(":input", "#formEliminar").val("");
        $("#descripcion").val(Descripcion);
        $("#ddlTipoEliminacion").val(1);



    }
    else if (TipoEliminacion == 2) {
        $(".divProcesoEliminacion").show();

        $(".divEliminacionAdministrativa").hide();
        LimpiarValidateErrores($("#formEliminar"));
        $(":input", "#formEliminar").val("");
        $("#descripcion").val(Descripcion);
        $("#ddlTipoEliminacion").val(2);
    }

}

function InitAutocompletarUsuariosLocal4($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
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
            if ($IdBox != null) {
                $IdBox.val(ui.item.id);
                $("#hConformidadCorreo").val(ui.item.mail);
                $("#hConformidadMatricula").val(ui.item.matricula);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function InitAutocompletarUsuariosLocal3($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
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
            if ($IdBox != null) {
                $IdBox.val(ui.item.id);
                $("#hExpertoCorreo").val(ui.item.mail);
                $("#hExpertoMatricula").val(ui.item.matricula);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}


function VerRelaciones() {
    OpenCloseModal($("#modalRelaciones"), true);

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableRelaciones.bootstrapTable('destroy');
    $tableRelaciones.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListarRelacionesAplicacion",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.AppId = $("#hdAplicacionId").val();
            //DATA_EXPORTAR.SubDominioId = $("#ddlSubDominio").val();
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


function InitAutocompletarBuilderLocalAD($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
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
            if ($IdBox != null) {
                $IdBox.val(ui.item.id);
                $("#hdOwnerId").val(ui.item.Matricula);
                CambioOwner(APLICACION_ID, ui.item.Id)
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function InitAutocompletarEstandarBuilder2($searchBox, $IdBox, $container, urlController) {
    let data = CrearObjAplicacion();

    $searchBox.autocomplete({
        minLength: 2,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Username = request.term;
                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/application/Gerencia/getOwner`,
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    type: "POST",
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
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
            $searchBox.val(ui.item.Nombre);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Matricula);
                $("#hdOwnerId").val(ui.item.Matricula);
                CambioOwner(APLICACION_ID, ui.item.Id)
                //LIST = [];
                //BuscarEnUnidad(ui.item.Matricula);

                //if (flag == 1) {
                //    var dat = { Id: ui.item.id, Responsable: ui.item.Nombre, ResponsableCorreo: ui.item.Correo, ResponsableMatricula: ui.item.Matricula }

                //    LIST.push(dat);
                //    document.getElementById('label').innerHTML = '';
                //}
                //$table.bootstrapTable('destroy');
                //$('table').bootstrapTable({
                //    data: LIST
                //});
                //$('#txtOwner').val("");
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Nombre + "</font></a>").appendTo(ul);
    };
}

function FlagOwner_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $("#txtOwner").show();
    }
    else {
        $("#txtCodigoInterfaz").hide();
    }
}

function FlagProveedorDesarrollo_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $("#txtProveedorDesarrollo").val('');
        $("#txtProveedorDesarrollo").removeAttr("disabled");
    }
    else {
        $("#txtProveedorDesarrollo").val('NO APLICA');
        $("#txtProveedorDesarrollo").attr("disabled", "disabled");
    }
}

function CambioOwner(Id) {
    let data = CrearObj();

    $.ajax({
        url: URL_API_VISTA + `/application/CambioOwner`,
        data: JSON.stringify(data),
        type: "POST",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    let data = dataObject;

                    if (data.unidadName == null)
                        toastr.warning("El Owner/Líder Usuario seleccionado no tiene una unidad asociada.", "Portafolio de aplicaciones BCP");

                    if (data.unidadName != null) {
                        $("#txtArea").val(data.areaName);
                        $("#txtDivision").val(data.divisionName);
                        $("#txtGerencia").val(data.gerenciaName);
                        $("#txtUnidad").val(data.unidadName);
                        $("#hdUnidadId").val(data.unit);

                        $(".unidadResponsable").show();
                        $("#txtResponsableUnidad").html(data.ResponsableUnidad + " (" + data.ResponsableUnidadMatricula + ") - " + data.ResponsableUnidadEmail);
                    }
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function CrearObj() {
    var data = {};
    data.Id = $("#hdAplicacionId").val();

    data.Username = $("#txtOwner").val();


    return data;
}


function InitInputFiles() {
    InitUpload($('#txtFile'), 'inputConformidad');
    InitUpload($('#txtNomArchivoConformidad'), 'inputConformidad2');
    InitUpload($('#txtNomTicket'), 'inputTicket');
    InitUpload($('#txtNomRatificacion'), 'inputRatificacion');
    InitUpload($('#txtArchivo'), 'inputArchivo');
    InitUpload($('#txtArchivo2'), 'inputArchivo2');

}
function validarFormImportar() {

    $.validator.addMethod("requiredArchivo", function (value, element) {
        return $.trim(value) !== "";
    });

    $.validator.addMethod("requiredConformidad", function (value, element) {
        //var flag = $("#ckbConformidadGST").val();

        if ($("#ckbConformidadGST").prop("checked") && $("#ddlTipoEliminacion").val() == 2) {
            let valor = $.trim(value);
            return valor !== "";
        }
        else {
            return true;
        }
    });

    $.validator.addMethod("requiredArchivo2", function (value, element) {
        //var flag = $("#ckbConformidadGST").val();

        if ($("#ddlTipoEliminacion").val() == 1) {
            let valor = $.trim(value);
            return valor !== "";
        }
        else {
            return true;
        }
    });

    $.validator.methods.requiredSinEspacios2 = function (value, element) {
        value = value || null;
        if ($("#ddlTipoEliminacion").val() == 1)
            return $.trim(value) != "" && value != null;
        else return true

    };

    $.validator.methods.existePersona = function (value, element) {
        if ($("#ddlTipoEliminacion").val() == 1) {
            if ($("#hConformidadId").val() != 0) { return true; }
            else return false;
        }
        else
            return true;
    };

    $.validator.methods.existeExperto = function (value, element) {
        if ($("#ddlTipoEliminacion").val() == 2) {
            if ($("#txtExperto").val() != '') {
                if ($("#hExpertoId").val() != 0) {
                    return true;
                }
                else
                    return false;
            }
            else
                return true;
        }
        else
            return true;
    };

    $("#formEliminar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtDescripcionEliminar: {
                requiredSinEspacios: true
            },
            flConformidad2: {
                requiredConformidad: true
            },
            ddlTipoEliminacion: {
                requiredSelect: true
            },
            flArchivo2: {
                requiredArchivo2: true
            },
            txtConformidad: {
                requiredSinEspacios2: true,
                existePersona: true
            },
            txtExperto: {
                existeExperto: true
            }
        },
        messages: {
            txtDescripcionEliminar: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el motivo de la eliminación.")
            },
            flConformidad2: {
                requiredConformidad: String.Format("Debes seleccionar {0}.", "un archivo")
            },
            ddlTipoEliminacion: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            flArchivo2: {
                requiredArchivo2: String.Format("Debes seleccionar {0}.", "un archivo")
            },
            txtConformidad: {
                requiredSinEspacios2: String.Format("Debes ingresar {0}", "el nombre de la persona que brindó la conformidad."),
                existePersona: String.Format("La persona ingresada {0}", "no existe.")
            },
            txtExperto: {
                existeExperto: String.Format("La persona ingresada {0}", "no existe.")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtNomArchivoConformidad" || element.attr('name') === "flConformidad2") {
                element.parent().parent().parent().parent().append(error);
            }
            else if (element.attr('name') === "txtNomTicket" || element.attr('name') === "flTicket") {
                element.parent().parent().parent().parent().append(error);
            }
            else if (element.attr('name') === "txtNomRatificacion" || element.attr('name') === "flRatificacion") {
                element.parent().parent().parent().parent().append(error);
            }
            else if (element.attr('name') === "txtArchivo" || element.attr('name') === "flArchivo2") {
                element.parent().parent().parent().parent().append(error);
            }
            else {
                element.parent().append(error);
            }
        }
    });
}

function UploadFile($fileInput, $fileInput1, $fileInput2, idsol) {

    let formData = new FormData();
    let ConformidadGST = $fileInput.get(0).files;
    let TicketEliminacion = $fileInput1.get(0).files;
    let Ratificacion = $fileInput2.get(0).files;
    formData.append("File1", ConformidadGST[0]);
    formData.append("File2", TicketEliminacion[0]);
    formData.append("File3", Ratificacion[0]);
    formData.append("SolicitudAplicacionId", idsol);


    $.ajax({
        url: URL_API + "/File/upload2",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            OpenCloseModal($("#modalEliminar"), false);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function UploadFile2($fileInput, idsol) {

    let formData = new FormData();
    let ConformidadGST = $fileInput.get(0).files;

    formData.append("File1", ConformidadGST[0]);

    formData.append("SolicitudAplicacionId", idsol);


    $.ajax({
        url: URL_API + "/File/upload5",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            OpenCloseModal($("#modalEliminar"), false);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
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

            if (fileName)
                $inputText.val(fileName);
            else
                label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
}


function irConfirmarActualizacion() {
    if ($("#ddlEstadoAplicacion").val() == 4) {


        $("#hdPreviousState").val(estadoInicial);

        var nombreApp = $("#txtNombre").val();
        var applicationId = $("#txtCodigoAPT").val();
        //$('#title-md').html('Solicita la eliminación de la aplicación:' + name);
        document.getElementById("titulo").innerText = 'Eliminación la aplicación: ' + nombreApp;
        document.getElementById("subtitulo").innerText = 'Codigo de aplicación: ' + applicationId + ' - Nombre de la aplicación: ' + nombreApp;
        LimpiarModal();

        Descripcion = $("#txtDescripcion").val();
        var statusColor = obtenerEliminadaStatus(applicationId);

        document.getElementById("divStatusApp").innerText = statusColor;

        InitUpload($('#txtNomArchivoConformidad'), 'inputConformidad');
        InitUpload($('#txtNomTicket'), 'inputTicket');
        $(":input", "#formEliminar").val("");
        OpenCloseModal($("#modalEliminar"), true);
    }
    else {
        InitUpload($('#txtFile'), 'inputConformidad');
        $(":input", "#formConfirmar").val("");
        OpenCloseModal($("#modalConfirmar"), true);
    }
}

function obtenerEliminadaStatus(applicationId) {
    var colorEstado = "";
    $("#btnEliminar").removeProp("disabled");
    $("#btnEliminar").removeClass("disabled");

    let params = {
        codApplication: applicationId
    };
    $.ajax({
        url: URL_API_VISTA + `/application/eliminadas/status`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: params,
        success: function (dataObject) {

            if (dataObject !== null) {

                $("#btnEliminar").prop("disabled", dataObject);
                if (dataObject) {
                    $("#btnEliminar").addClass("disabled");
                }

                //colorEstado = dataObject ? "danger" : "success";
                colorEstado = dataObject ? "Tiene relaciones activas (aprobadas, pendientes de aprobación, suspendidas) en CVT, antes de proseguir con la eliminación es importante que todas estas relaciones se encuentren en estado eliminadas. Ingresa a la opción Relaciones y formatos => Bandeja de aprobación y realiza esta tarea." : "No tiene información relacionada en CVT";
            }

        },
        async: false,
        global: false

    });
    return colorEstado;
}

function LimpiarModal() {
    LimpiarValidateErrores($("#formEliminar"));
    $(":input", "#formEliminar").val("");
    $("#ddlTipoEliminacion").val(-1);
    $(".divProcesoEliminacion").hide();
    $(".divEliminacionAdministrativa").hide();
}


function Roles() {

    $.each(ROLES_LIST, function (index, value) {
        if (ROLES_LIST[index].applicationManagerId == 5 || ROLES_LIST[index].applicationManagerId == 6) {
            NUEVOS_ROLES_LIST.push(ROLES_LIST[index]);
        }
    });

}

function InitAutocompletarUsuariosLocal2($searchBox, $IdBox, $container, urlController) {

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
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
            if ($IdBox != null) {
                $IdBox.val(ui.item.id);
                GetPersonaSIGA(ui.item.matricula);
                //$("#hAutorizadorCorreo").val(ui.item.mail);

                var ddRol = $("#ddlRol").val();
                var rolDetail = "";
                if (ddlRol.value == 5) {
                    rolDetail = "Usuario autorizador/Gestor";
                }
                else if (ddlRol.value == 6) {
                    rolDetail = "Experto/Líder técnico";
                }

                if (EmailPersona != null) {
                    $("#hAutorizadorCorreo").val(EmailPersona);
                    var data = { username: ui.item.matricula, managerName: NombrePersona, applicationManagerId: $("#ddlRol").val(), email: EmailPersona, applicationManagerIdDetail: rolDetail }
                } else {
                    $("#hAutorizadorCorreo").val(ui.item.mail);
                    var data = { username: ui.item.matricula, managerName: ui.item.displayName, applicationManagerId: $("#ddlRol").val(), email: ui.item.mail, applicationManagerIdDetail: rolDetail }
                }
                $("#hAutorizadorMatricula").val(ui.item.matricula);

                $("#txtAutorizador").val("");
                control = ui.item.displayName.length;
                //var data = { username: ui.item.matricula, managerName: ui.item.displayName, applicationManagerId: $("#ddlRol").val() , email: ui.item.mail, applicationManagerIdDetail: $("#ddlRol :selected").text() }

                var flag = 0;
                $.each(ROLES_LIST, function (index, value) {
                    if (ROLES_LIST[index].username == data.username && ROLES_LIST[index].applicationManagerId == data.applicationManagerId) {
                        flag = 1;
                        $("#msjUsuarioRepetido").show();
                    }
                });

                if (flag == 0) {
                    ROLES_LIST.push(data);
                    if ($("#ddlRol").val() == 6) {
                        NUEVOS_Expertos.push(data);
                    }
                    if ($("#ddlRol").val() == 5) {
                        NUEVOS_Autorizadores.push(data);
                    }
                    NUEVOS_ROLES_LIST.push(data);
                    $("#msjUsuarioRepetido").hide();
                }
                $table.bootstrapTable('destroy');
                $('table').bootstrapTable({
                    data: ROLES_LIST
                });
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function CrearObjPersona(matricula) {
    var data = {};
    data.Matricula = matricula;


    return data;
}
function GetPersonaSIGA(matricula) {
    let data = CrearObjPersona(matricula);

    $.ajax({
        url: URL_API_VISTA + `/application/Gerencia/getPersonaSIGA`,
        data: JSON.stringify(data),
        type: "POST",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    SetItems(dataObject, $("#ddlUnidadesOwner"), TEXTO_SELECCIONE);
                    NombrePersona = dataObject.Nombre;
                    EmailPersona = dataObject.Correo;

                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}


function changeClasificacion() {
    cargarCombosSubclasificacion($("#ddlClasificacion").val());
}
function changeArea() {
    cargarCombosArea($("#ddlAreaBIAN").val());
}
//function changeJefatura() {
//    cargarCombosArquitectos($("#ddlJefaturaTransferir").val());
//}


function cargarCombosSubclasificacion(clasificacion) {
    $("#ddlSubClasificacion").empty();
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/technicalClassificationAdmin/${clasificacion}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.SubClasificacion, $("#ddlSubClasificacion"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function cargarCombosArea(area) {
    $("#ddlDominioBIAN").empty();
    $("#ddlTobe").empty();

    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/listsAdmin/architecteval/${area}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.DominioBIAN, $("#ddlDominioBIAN"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TOBE, $("#ddlTobe"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

//function cargarCombosArquitectos(jefatura) {
//    $("#ddlArquitectoNegocio").empty();

//    $.ajax({
//        type: "GET",
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
//        url: URL_API_VISTA + `/application/listsAdmin/jefaturaati/${jefatura}`,
//        dataType: "json",
//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    SetItems(dataObject.Arquitecto, $("#ddlArquitectoNegocio"), TEXTO_SELECCIONE);
//                }

//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//}
function initUpload(txtNombreArchivo) {
    var inputs = document.querySelectorAll('.inputfile');
    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener('change', function (e) {
            var fileName = '';
            if (this.files && this.files.length > 1)
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            else
                fileName = e.target.value.split('\\').pop();

            if (fileName)
                txtNombreArchivo.val(fileName);
            else
                label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
}

//function TipoDesarrollo_Change() {
//    let tipoDesarrollo = $("#ddlTipoDesarrollo").val();
//    if (tipoDesarrollo == TIPO_DESARROLLO_INTERNO) {
//        $("#txtProveedorDesarrollo").val('NO APLICA');
//        $("#txtProveedorDesarrollo").attr("disabled", "disabled");
//    }
//    else {
//        $("#txtProveedorDesarrollo").val('');
//        $("#txtProveedorDesarrollo").removeAttr("disabled");
//    }
//}

function initFecha() {
    $("#divFechaSolicitud").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
}

function calcularCriticidad() {
    var criticidad = parseInt($("#ddlCriticidadBIAN").val());
    var clasificacion = parseInt($("#ddlClasificacionActivo").val());
    var final = devolverCriticidad(criticidad, clasificacion);

    $("#ddlNuevaCriticidad").val(final);
}

function FlagInterface_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $("#txtCodigoInterfaz").show();
        if (cambiarInterface) {
            CodigoInterfaz = generarCodigoInterfaz();
            CodigoInterfaz = ExisteCodigoInterfaz(CodigoInterfaz);
            //while (ExisteCodigoInterfaz(CodigoInterfaz)) {
            //    CodigoInterfaz = generarCodigoInterfaz()
            //}
            $("#txtCodigoInterfaz").val(CodigoInterfaz);
        }
    }
    else {
        $("#txtCodigoInterfaz").hide();
    }
}

function cancelarAddOrEditApp() {
    window.document.location.href = `CatalogoAplicacion?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;
}

function CambioUnidad(Id, UnidadId) {

    $.ajax({
        url: URL_API_VISTA + `/application/CambioUnidad/${Id},${UnidadId}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    let data = dataObject;

                    $("#txtArea").val(data.areaName);
                    $("#txtDivision").val(data.divisionName);
                    $("#txtGerencia").val(data.gerenciaName);
                    $("#txtResponsableUnidad").html(data.ResponsableUnidad + " (" + data.ResponsableUnidadMatricula + ") - " + data.ResponsableUnidadEmail);
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function CambioArquitecto(Id) {

    $.ajax({
        url: URL_API_VISTA + `/application/CambioArquitecto/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    let data = dataObject;
                    arquitectoActivo = data.isActiveArchitec;
                    $("#txtJefaturaATI").val(data.jefaturaATIName);
                    $("#hdJefaturaATIID").val(data.mainOffice);

                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}


function editarAplicacion(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/application/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;

                    //Primera Tab
                    if (data.NombreArchivoSeguridad == null) {
                        document.getElementById('btnDescargar').style.display = 'none';
                    }
                    $("#txtArchivo").val(data.NombreArchivoSeguridad);
                    $("#txtArea").val(data.areaName);
                    $("#txtDivision").val(data.divisionName);
                    $("#txtGerencia").val(data.gerenciaName);

                    $("#hdAplicacionId").val(APLICACION_ID);
                    $("#txtCodigoAPT").val(data.applicationId);
                    $("#ddlGestionadoPor").val(data.managed || "-1");
                    changeGestionado();
                    $("#txtNombre").val(data.applicationName);
                    $("#txtDescripcion").val(data.description);
                    if (data.parentAPTCode != '') {
                        $("#txtCodigoAppPadre").val(data.parentAPT);
                        $("#hCodigoPadre").val(data.parentAPTCode);
                    }
                    $("#txtUnidad").val(data.unit);
                    $("#txtEquipoSquad").val(data.teamName);
                    $("#txtUnidad").val(data.unitDetail);
                    //cargarEquipos($("#ddlGestionadoPor").val());
                    $("#ddlEquipo").val(data.teamId || "-1");
                    $("#hdUnidadId").val(data.unit || "-1");

                    if (data.replacementApplication != '' && data.replacementApplication != null) {
                        $("#txtAplicacionReemplazada").val(data.replacementAPT);
                        $("#hCodigoReemplazada").val(data.replacementApplication);
                    }
                    if (data.TipoPCI.length > 0) {
                        if (data.TipoPCI.length == 1) {
                            if (data.TipoPCI[0] == 4) {
                                var newOption = $('<option value="' + 4 + '">' + 'NO APLICA' + '</option>');
                                $('#ddlPCI').append(newOption);
                                $("#ddlPCI").val(4);
                                $("#ddlPCI").next().hide();

                                $("#ckbPCI").prop('checked', false);
                                $("#ckbPCI").bootstrapToggle(false ? 'on' : 'off');
                            }
                            else {
                                $("#ckbPCI").prop('checked', true);
                                $("#ckbPCI").bootstrapToggle(true ? 'on' : 'off');

                                $("#ddlPCI").val(data.TipoPCI !== null ? data.TipoPCI : "-1");
                                $("#ddlPCI").multiselect("refresh");
                            }
                        }
                        else {
                            $("#ckbPCI").prop('checked', true);
                            $("#ckbPCI").bootstrapToggle(true ? 'on' : 'off');

                            $("#ddlPCI").val(data.TipoPCI !== null ? data.TipoPCI : "-1");
                            $("#ddlPCI").multiselect("refresh");
                        }
                    }
                    else {
                        $("#ckbPCI").prop('checked', true);
                        $("#ckbPCI").bootstrapToggle(true ? 'on' : 'off');
                    }


                    $("#ddlTipoImplementacion").val(data.implementationType || "-1");
                    $("#ddlModeloEntrega").val(data.deploymentType || "-1");
                    $("#ddlEstadoAplicacion").val(data.status || "-1");
                    estadoInicial = data.status;
                    $("#ddlArquitectoNegocio").val(data.architecId || "-1");
                    $("#ddlArquitectoSolucion").val(data.architectSolutionId || "-1");

                    $("#ddlEntidades").val(data.userEntity !== null ? data.userEntity.split(",") : "-1"); //app.AplicacionDetalle
                    $("#ddlEntidades").multiselect("refresh");

                    $("#ddlTipoDesarrollo").val(data.developmentType || "-1");
                    /*TipoDesarrollo_Change();*/
                    $("#ckbProveedorDesarrollo").prop('checked', data.developmentProvider);
                    $("#ckbProveedorDesarrollo").bootstrapToggle(data.developmentProvider ? 'on' : 'off');
                    if (data.developmentProvider) {
                        /*$("#ckbProveedorDesarrollo").attr("disabled", "disabled");*/
                        $("#ckbProveedorDesarrollo").bootstrapToggle(data.developmentProvider == 'NO APLICA' ? 'off' : 'on');
                        $("#txtProveedorDesarrollo").val(data.developmentProvider);
                    }
                    else {
                        $("#txtProveedorDesarrollo").val('NO APLICA');
                    }

                    $("#ddlInfraestructura").val(data.infrastructure || "-1");
                    $("#ddlAutorizacion").val(data.authorizationMethod || "-1");
                    $("#ddlAutenticacion").val(data.authenticationMethod || "-1");

                    //$("#hExpertoMatricula").val(data.expertId);
                    //$("#txtExperto").val(data.expertName);
                    //$("#hExpertoCorreo").val(data.expertEmail);

                    $("#ckbInterface").prop('checked', data.hasInterfaceId);
                    $("#ckbInterface").bootstrapToggle(data.hasInterfaceId ? 'on' : 'off');
                    if (data.hasInterfaceId) {
                        $("#txtCodigoInterfaz").val(data.interfaceId);
                        $("#txtCodigoInterfaz").show();
                        $("#ckbInterface").attr("disabled", "disabled");
                        cambiarInterface = false;
                    }
                    else
                        cambiarInterface = true;

                    //$("#ddlGrupoTicketRemedy").val(data.groupTicketRemedy || "-1");

                    if (data.groupTicketRemedy != '') {
                        $("#txtGrupoTicketRemedy").val(data.grupoTicketRemedyName);
                        $("#hGrupoTicketRemedy").val(data.groupTicketRemedy);
                    }

                    $("#txtURL").val(data.webDomain);
                    $("#txtComplianceLevel").val(data.complianceLevel);
                    $("#txtSummaryStandard").val(data.summaryStandard);

                    //Segunda Tab


                    $("#ddlAreaBIAN").val(data.BIANarea || "-1");
                    if (data.BIANarea != -1) {
                        cargarCombosArea(data.BIANarea);
                        $("#ddlDominioBIAN").val(data.BIANdomain);
                        $("#ddlTobe").val(data.tobe);
                    }
                    else {
                        $("#ddlDominioBIAN").val(data.BIANdomain || "-1");
                        $("#ddlTobe").val(data.tobe || "-1");
                    }

                    $("#ddlTipoActivo").val(data.assetType || "-1");
                    //$("#txtTipoActivo").val(data.tipoActivoName);
                    //$("#txtAreaBIAN").val(data.areaBIANName);
                    //$("#txtDominioBIAN").val(data.dominioBIANName);
                    $("#txtJefaturaATI").val(data.jefaturaATIName);
                    //$("#txtTOBE").val(data.TOBEName);
                    //$("#txtCategoriaTecnologica").val(data.categoriaTecnologicaName);


                    //$("#txtClasificacionTecnica").val(data.clasificacionTecnicaName);
                    //$("#txtSubClasificacionTecnica").val(data.subClasificacionTecnicaName);
                    $("#ddlCategoria").val(data.technologyCategory || "-1");
                    $("#ddlClasificacion").val(data.technicalClassification || "-1");

                    $("#dllCapaFuncional").val(data.functionalLayer || "-1");

                    if (data.technicalClassification != null)
                        cargarCombosSubclasificacion(data.technicalClassification);

                    if (data.operatingHours === null) {
                        $("#ddlHorarioFuncionamiento").val("-1");
                    } else {
                        if (data.operatingHours != '' || data.operatingHours != null) {
                            let idOtroHorario = -1;
                            for (const element of lstHorarioFuncionamiento) {
                                if (element.Descripcion == "otro horario")
                                    idOtroHorario = element.Id;
                                if (data.operatingHours == element.Descripcion) {
                                    $("#ddlHorarioFuncionamiento").val(element.Id);
                                    $("#txtHorarioFuncionamiento").val("");
                                    $("#divHorarioFuncionamiento").css("display", "none");
                                    break;
                                }
                                else {
                                    $("#ddlHorarioFuncionamiento").val(idOtroHorario);
                                    $("#divHorarioFuncionamiento").css("display", "block");
                                    $("#txtHorarioFuncionamiento").val(data.operatingHours);
                                }
                            }
                        } else $("#ddlHorarioFuncionamiento").val("-1");
                    }

                    $("#ckbFlagPiezaCross").prop('checked', data.FlagComponenteCross);
                    $("#ckbFlagPiezaCross").bootstrapToggle(data.FlagComponenteCross ? 'on' : 'off');
                    if (data.FlagComponenteCross) {
                        $("#txtRegistroUmbral").val(data.registroUmbral);
                        $("#txtRegistroUmbral").show();
                        $("#ckbFlagPiezaCross").attr("disabled", "disabled");
                    } else
                        $("#ckbFlagPiezaCross").attr("disabled", "disabled");

                    $("#ddlSubClasificacion").val(data.technicalSubclassification || "-1");
                    if (data.authorizedName != '' && data.authorizedName != null)
                        control = data.authorizedName.length;

                    $("#txtUsuarioAutorizador").val(data.usuarioAutorizadorName);
                    $("#txtTIERProduccion").val(data.TIERProduccionName);
                    $("#txtTIERPreProduccion").val(data.TIERPreProduccionName);
                    $("#txtBroker").val(data.brokerName);
                    $("#txtTribeLead").val(data.tribeLeadName);
                    $("#txtTechnicalTribeLead").val(data.technicalTribeLeadName);
                    $("#txtJefeEquipo").val(data.jefeEquipoName);
                    $("#txtLiderUsuario").val(data.liderUsuarioName);
                    //$("#txtGrupoTicketRemedy").val(data.grupoTicketRemedyName);
                    $("#txtURLCertificadosDigitales").val(data.urlCertificadosDigitalesName);

                    $("#ddlCriticidadBIAN").val(data.applicationCriticalityBIA || "-1");
                    $("#ddlClasificacionActivo").val(data.classification || "-1");
                    $("#ddlNuevaCriticidad").val(data.finalCriticality || "-1");

                    $("#txtProductoServicioRepresentativo").val(data.ProductoServicioRepresentativoName);
                    $("#txtMenorRTO").val(data.MenorRTOName);
                    $("#txtMayorGradoInterrupcion").val(data.MayorGradoInterrupcionName);
                    $("#dpFechaSolicitud").val(data.fechaPaseProduccionName);
                    $("#txtFechaAprobacionRegistroCompleto").val(data.fechaAprobaciónRegistroCompleto);

                    if (data.technologyCategory != null) {
                        if (data.technologyCategory != TIPO_WEB) {
                            $("#txtURL").val("NO APLICA");
                            $("#txtURL").attr("disabled", "disabled");
                        }
                    }

                    if ($("#hdUnidadId").val() != -1) CambioUnidad(APLICACION_ID, $("#hdUnidadId").val());

                    //if (data.assetType != null) {
                    //    if (data.managed != null) {
                    //        var gestionado = obtenerGestionadoPor(data.managed);
                    //        if (gestionado.FlagUserIT == true) {
                    //            cargarCombosUserIT();
                    //            $("#ddlTipoActivo").val(data.assetType);
                    //            $("#ddlTipoActivo").attr("disabled", "disabled");
                    //        }
                    //        else {
                    //            $("#ddlTipoActivo").val(data.assetType || "-1");
                    //        }
                    //    }
                    //}
                    var gestionado = obtenerGestionadoPor(data.managed);
                    if (data.assetType == TIPO_ACTIVO_USER_IT || gestionado.FlagUserIT == true) {
                        //if ( gestionado.FlagUserIT == true) {
                        $(".datosUserIT").show();
                        $("#txtComplianceLevel").val(data.complianceLevel);
                        $("#txtSummaryStandard").val(data.summaryStandard);
                        if (data.NombreArchivoSeguridad == null) {
                            document.getElementById('btnDescargar').style.display = 'none';
                        }
                        else if (data.NombreArchivoSeguridad != null) {
                            document.getElementById('btnDescargar').style.display = '';
                        }
                    }
                    else {
                        $(".datosUserIT").hide();
                    }
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}


function cargarCombosArquitectoNegocio() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/listsAdmin/architecteval",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoActivo, $("#ddlTipoActivo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.AreaBIAN, $("#ddlAreaBIAN"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Arquitecto, $("#ddlArquitectoNegocio"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}
function guardarAddOrEditApp() {
    //CHC: la primera linea le estaba agregando la clase ignore a todos los inputs con clase form-control. la clase ignore se usa para
    //     decirle al validate que no tome en cuenta esos inputs
    //$(".form-control").addClass("ignore");
    //$(".input-registro").removeClass("ignore");

    if (arquitectoActivo) {
        OpenCloseModal($("#modalConfirmar"), false);

        if ($("#formAddOrEditApp").valid()) {
            bootbox.confirm({
                title: TITULO_MENSAJE,
                message: MENSAJE,
                buttons: SET_BUTTONS_BOOTBOX,
                inputType: 'textarea',
                callback: function (result) {
                    result = result || null;
                    if (result !== null && result) {
                        let codigoApt = $.trim($("#txtCodigoApt").val());
                        if (!ExisteCodigoAPT(codigoApt)) {
                            sendDataFormAPI($("#formAddOrEditApp"),
                                $("#btnRegistrarApp"),
                                "Registrado correctamente");
                        }
                        else {
                            MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación no existe o se ha encontrado un inconveniente en la actualización, vuelve a intentarlo.");
                            let nextCodigoAPT = ObtenerUltimoCodigoAptByParametro();
                            $("#txtCodigoApt").val(nextCodigoAPT);
                        }
                    }
                }
            });
        }
    }
    else {
        MensajeGeneralAlert(TITULO_MENSAJE, "El Arquitecto que ha selecionado se encuentra  Inactivo o Eliminado");
    }


}

function LimpiarValidateErrores(form) {
    form.validate().resetForm();
}

function validarFormApp() {
    $.validator.addMethod("existeCodigoAPT", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteCodigoAPT(valor);
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("existeNombreAplicacion", function (value, element) {
        let estado = true;
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 3) {
            estado = !ExisteNombreAplicacion(valor);
            return estado;
        }
        return estado;
    });
    $.validator.addMethod('maxStrict', function (value, el, param) {
        return value <= 100;
    });
    $.validator.addMethod("blankSpace", function (value) {
        return value.indexOf(" ") < 0;
    });
    $.validator.addMethod("noEsNumero", function (value, element) {
        let estado = false;
        let valor = $.trim(value);
        if (isNaN(valor)) {
            return false;
        }
        return true;
    });
    $.validator.addMethod("valorPermitidoRTO", function (value) {
        if (value == "-") { // Permitir el carácter "-"
            return true;
        }
        let valor = $.trim(value);
        if (isNaN(valor)) {
            return false;
        } else {
            var numValue1 = Number(value);
            if (Number.isInteger(numValue1)) {
                var numValue2 = Number(value);
                return numValue2 >= 1 && numValue2 <= 100;

            } else {
                return false;
            }
        }
    });
    $.validator.addMethod("valorPermitidoGradoInterrupcion", function (value) {
        if (value == "-") { // Permitir el carácter "-"
            return true;
        }
        let valor = $.trim(value);
        if (isNaN(valor)) {
            return false;
        } else {
            var numValue1 = Number(value);
            if (Number.isInteger(numValue1)) {
                var numValue2 = Number(value);
                return numValue2 >= 0 && numValue2 <= 100;

            } else {
                return false;
            }
        }
    });

    $("#formAddOrEditApp").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtCodigoAPT: {
                requiredSinEspacios: true,
                existeCodigoAPT: true,
                minlength: 4,
                maxlength: 4
            },
            txtNombre: {
                requiredSinEspacios: true,
                existeNombreAplicacion: true
            },
            txtDescripcion: {
                requiredSinEspacios: true
            },
            txtCodigoAppPadre: {
                minlength: 4
            },
            ddlGestionadoPor: {
                requiredSelect: true
            },
            ddlTipoImplementacion: {
                requiredSelect: true
            },
            ddlModeloEntrega: {
                requiredSelect: true
            },
            ddlEstadoAplicacion: {
                requiredSelect: true
            },
            //ddlArquitectoNegocio: {
            //    requiredSelect: true
            //},
            txtMenorRTO: {
                maxlength: 3,
                /*number: true,*/
                /*maxStrict: true,*/
                /*digits: true,*/
                blankSpace: true,
                valorPermitidoRTO: true
            },
            txtMayorGradoInterrupcion: {
                maxlength: 3,
                /*number: true,*/
                /*maxStrict: true,*/
                /*digits: true,*/
                blankSpace: true,
                valorPermitidoGradoInterrupcion: true
            },
            txtComplianceLevel: {
                noEsNumero: true,
                maxStrict: true,
                blankSpace: true
            }
        },
        messages: {
            txtCodigoAPT: {
                requiredSinEspacios: "Debes de ingresar un código de 4 caracteres",
                existeCodigoAPT: "El código de aplicación ingresado ya existe",
                minlength: "El código tiene que tener 4 caracteres",
                maxlength: "El código tiene que tener 4 caracteres"
            },
            txtNombre: {
                requiredSinEspacios: "Debes de ingresar un nombre para esta aplicación",
                existeNombreAplicacion: "El nombre de la aplicación ya existe"
            },
            txtDescripcion: {
                requiredSinEspacios: "Debes de ingresar una descripción detallada de esta aplicación"
            },
            txtCodigoAppPadre: {
                minlength: "El código de aplicación debe de tener 4 caracteres"
            },
            ddlGestionadoPor: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlTipoImplementacion: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlModeloEntrega: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlEstadoAplicacion: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            //ddlArquitectoNegocio: {
            //    requiredSelect: "Debes de seleccionar un elemento de la lista"
            //},
            txtMenorRTO: {
                maxlength: "El valor no puede tener más de 3 dígitos",
                //number: "Solo se permiten números",
                //maxStrict: "El valor no puede ser mayor a 100",
                //digits: "Solo se permiten números enteros",
                blankSpace: "El valor no puede ser un espacio en blanco",
                valorPermitidoRTO: "Ingrese un valor entre 1 - 100 y sea Entero"
            },
            txtMayorGradoInterrupcion: {
                maxlength: "El valor no puede tener más de 3 dígitos",
                //number: "Solo se permiten números",
                //maxStrict: "El valor no puede ser mayor a 100",
                //digits: "Solo se permiten números enteros",
                blankSpace: "El valor no puede ser un espacio en blanco",
                valorPermitidoGradoInterrupcion: "Ingrese un valor entre 0 - 100 y sea Entero"
            },
            txtComplianceLevel: {
                noEsNumero: "Debes ingresar un número",
                maxStrict: "El valor no puede ser mayor a 100",
                blankSpace: "El valor no puede ser un espacio en blanco"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtCodigoAPT" || element.attr('name') === "txtNombre" || element.attr('name') === "txtDescripcion") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function CrearObjAplicacion() {
    var data = {};
    data.AppId = $("#hdAplicacionId").val();
    data.managed = getDDL($("#ddlGestionadoPor")); // $("#ddlGerenciaCentral").val(); ////cvt.Aplicacion
    data.applicationName = $.trim($("#txtNombre").val()).toUpperCase(); // $("#ddlDivision").val(); //cvt.Aplicacion
    data.implementationType = getDDL($("#ddlTipoImplementacion")); // $("#ddlArea").val(); //cvt.Aplicacion
    data.description = $.trim($("#txtDescripcion").val()); //cvt.Aplicacion
    data.deploymentType = getDDL($("#ddlModeloEntrega")); //cvt.Aplicacion
    data.parentAPTCode = $("#hCodigoPadre").val() == "0" ? '' : $.trim($("#hCodigoPadre").val()).toUpperCase(); //$.trim($("#txtNombreApp").val()); //cvt.Aplicacion    
    data.teamId = getDDL($("#ddlEquipo"));
    data.teamName = $("#ddlEquipo option:selected").text();
    data.userEntity = $("#ddlEntidades").val() !== null ? $("#ddlEntidades").val().join(",") : "";
    data.developmentType = getDDL($("#ddlTipoDesarrollo"));
    data.developmentProvider = $.trim($("#txtProveedorDesarrollo").val()).toUpperCase();
    data.infrastructure = getDDL($("#ddlInfraestructura"));
    data.hasInterfaceId = $("#ckbInterface").prop("checked");
    data.interfaceId = $("#txtCodigoInterfaz").val();
    data.replacementApplication = $("#hCodigoReemplazada").val() == "0" ? '' : $.trim($("#hCodigoReemplazada").val()).toUpperCase();
    data.architectId = getDDL($("#ddlArquitectoNegocio")) == null ? -1 : getDDL($("#ddlArquitectoNegocio")); //$("#ddlAreaBIAN").val();  //cvt.Aplicacion
    data.authorizationMethod = getDDL($("#ddlAutorizacion"));
    data.authenticationMethod = getDDL($("#ddlAutenticacion"));
    //data.expertId = $("#hExpertoMatricula").val();
    //data.expertName = $("#txtExperto").val();
    //data.expertEmail = $("#hExpertoCorreo").val();
    data.unit = $("#hdUnidadId").val();
    data.groupTicketRemedy = $("#hGrupoTicketRemedy").val();
    data.webDomain = $("#txtURL").val();
    data.applicationCriticalityBIA = getDDL($("#ddlCriticidadBIAN"));
    data.classification = getDDL($("#ddlClasificacionActivo"));
    data.finalCriticality = getDDL($("#ddlNuevaCriticidad"));

    data.starProduct = $("#txtProductoServicioRepresentativo").val();
    data.shorterApplicationResponseTime = $("#txtMenorRTO").val();
    data.highestDegreeInterruption = $("#txtMayorGradoInterrupcion").val();
    data.dateFirstRelease = castDate($("#dpFechaSolicitud").val());

    data.summaryStandard = $("#txtSummaryStandard").val();
    data.complianceLevel = $("#txtComplianceLevel").val();

    data.assetType = getDDL($("#ddlTipoActivo"));
    data.BIANdomain = getDDL($("#ddlDominioBIAN"));
    data.BIANarea = getDDL($("#ddlAreaBIAN"));
    data.tobe = getDDL($("#ddlTobe"));
    data.mainOffice = $("#hdJefaturaATIID").val();
    data.technologyCategory = getDDL($("#ddlCategoria"));
    //data.technicalClassification = getDDL($("#ddlClasificacion"));
    //data.technicalSubclassification = getDDL($("#ddlSubClasificacion"));
    data.functionalLayer = getDDL($("#dllCapaFuncional"));
    if ($("#ddlHorarioFuncionamiento option:selected").text() == 'otro horario') {
        data.operatingHours = $("#txtHorarioFuncionamiento").val();
    } else {
        if ($("#ddlHorarioFuncionamiento option:selected").text() == '-- Seleccione --') {
            data.operatingHours = null
        } else
            data.operatingHours = $("#ddlHorarioFuncionamiento option:selected").text();
    }

    data.tierProduction = $("#txtTIERProduccion").val();
    data.tierPreProduction = $("#txtTIERPreProduccion").val();

    data.status = getDDL($("#ddlEstadoAplicacion"));

    data.NuevosRolesList = NUEVOS_ROLES_LIST;

    data.NuevosExpertosList = NUEVOS_Expertos;
    data.NuevosAutorizadoresList = NUEVOS_Autorizadores;

    data.motivoActualizacion = $("#txtDescripcionAct").val();;

    data.TipoPCI = $("#ddlPCI").val() !== null ? $("#ddlPCI").val() : [];

    data.architectSolutionId = getDDL($("#ddlArquitectoSolucion")) == null ? -1 : getDDL($("#ddlArquitectoSolucion"));

    let fileArchivo = $("#flConformidad").get(0).files;

    return data;
}

function sendDataFormAPI($form, $btn, title) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjAplicacion();

    let formData = new FormData();

    let fileArchivo = $("#flConformidad").get(0).files;
    formData.append("File", fileArchivo[0]);

    formData.append("data", JSON.stringify(data));



    $.ajax({
        url: URL_API_VISTA + "/application/stepadmin",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        //data: JSON.stringify(data),
        data: formData,
        //contentType: "application/json; charset=utf-8",
        contentType: false,
        processData: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        //dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    if ($("#flArchivo").val() != null) { CargarArchivos(data.AppId) }

                    let dataResult = dataObject;
                    estadoTransaccion = dataResult.EstadoTransaccion;
                    if (dataResult.EstadoTransaccion) {
                        window.document.location.href = `CatalogoAplicacion?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;

                        //bootbox.confirm({
                        //    message: MENSAJE_CONFIRMACION,
                        //    buttons: {
                        //        confirm: {
                        //            label: 'Cerrar',
                        //            className: 'btn-success'
                        //        },
                        //        cancel: {
                        //            label: 'Volver a la bandeja',
                        //            className: 'btn-danger'
                        //        }
                        //    },
                        //    callback: function (result) {
                        //        if (!result) {
                        //            window.document.location.href = `CatalogoAplicacion?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;
                        //        }
                        //    }

                        //});

                    } else {
                        MensajeGeneralAlert(TITULO_MENSAJE, "El código de la aplicación no existe o se ha encontrado un inconveniente en la actualización, vuelve a intentarlo.");
                    }
                }
            }
        },
        complete: function (data) {
            if ($btn !== null) {
                $btn.button("reset");
                waitingDialog.hide();
            }
        },

        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function ExisteCodigoAPT(codigoAPT) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/exists?id=${codigoAPT}`,
        dataType: "json",
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

function ExisteNombreAplicacion(nombre) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/existsByName?id=${nombre}`,
        dataType: "json",
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

function getDDL($ddl) {
    return $ddl.val() !== "-1" ? $ddl.val() : null;
}

function InitAutocompletarEstandarBuilder($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 2,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API + urlControllerWithParams,
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    type: "GET",
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                $("#hdUnidadId").val(ui.item.Id);
                CambioUnidad(APLICACION_ID, ui.item.Id)
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Descripcion + "</font></a>").appendTo(ul);
    };
}

function InitAutocompletarUsuariosLocal($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
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
            if ($IdBox != null) {
                $IdBox.val(ui.item.id);
                $("#hExpertoCorreo").val(ui.item.mail);
                $("#hExpertoMatricula").val(ui.item.matricula);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function cargarCombos() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/steptwo/listsAdmin",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoImplementacion, $("#ddlTipoImplementacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Arquitecto, $("#ddlArquitectoNegocio"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ArquitectoSolucion, $("#ddlArquitectoSolucion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ModeloEntrega, $("#ddlModeloEntrega"), TEXTO_SELECCIONE);

                    SetItems(dataObject.GestionadPor, $("#ddlGestionadoPor"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoDesarrollo, $("#ddlTipoDesarrollo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Infraestructura, $("#ddlInfraestructura"), TEXTO_SELECCIONE);
                    SetItems(dataObject.MetodoAutenticacion, $("#ddlAutenticacion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.MetodoAutorizacion, $("#ddlAutorizacion"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.EntidadesUsuarias, $("#ddlEntidades"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.EntidadesUsuarias, $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_TODOS, true);

                    //SetItems(dataObject.GrupoTicketRemedy, $("#ddlGrupoTicketRemedy"), TEXTO_SELECCIONE);

                    SetItems(dataObject.BIA, $("#ddlCriticidadBIAN"), TEXTO_SELECCIONE);
                    SetItems(dataObject.CriticidadFinal, $("#ddlNuevaCriticidad"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ClasificacionActivos, $("#ddlClasificacionActivo"), TEXTO_SELECCIONE);

                    SetItems(dataObject.ClasificacionActivos, $("#dllCapaFuncional"), TEXTO_SELECCIONE);
                    SetItems(dataObject.HorarioFuncionamiento, $("#ddlHorarioFuncionamiento"), TEXTO_SELECCIONE);
                    lstHorarioFuncionamiento = dataObject.HorarioFuncionamiento;

                    SetItemsMultiple(dataObject.TipoPCI, $("#ddlPCI"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function cargarEquipos(gestionado) {
    $("#ddlEquipo").empty();

    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/managedteamsAdmin/${gestionado}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Equipos, $("#ddlEquipo"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function changeGestionado() {
    let gestionado = obtenerGestionadoPor($("#ddlGestionadoPor").val());

    if (gestionado != null) {
        if (gestionado.FlagUserIT) {
            $(".divInterfaz").hide();
            $("#ddlEquipo").empty();
            $('#ddlEquipo').append('<option value="-1" selected="selected">NO APLICA</option>');

            $("#ddlEquipo").attr("disabled", "disabled");
            $(".datosUserIT").show();

            //bootbox.alert(MENSAJE_GOBIERNO_USERIT);
        }
        else if (gestionado.FlagSubsidiarias) {
            $("#ddlEquipo").empty();
            $('#ddlEquipo').append('<option value="-1" selected="selected">NO APLICA</option>');
            $(".datosUserIT").hide();
            $("#ddlEquipo").attr("disabled", "disabled");
        }
        else {
            $(".divInterfaz").show();
            $("#ddlEquipo").empty();
            $('#ddlEquipo').append('<option value="-1" selected="selected">Seleccione</option>');
            $("#ddlEquipo").removeAttr("disabled");
            $(".datosUserIT").hide();
            $("#txtArchivo").val(TEXTO_SIN_ARCHIVO)
            $("#flArchivo").val("");
            $("#txtComplianceLevel").val("");
            $("#txtSummaryStandard").val("");

            cargarEquipos(gestionado.Id);
        }
    }
}

function generarCodigoInterfaz() {
    var length = 2;
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function ExisteCodigoInterfaz(codigo) {
    let estado = "";
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/ExisteCodigoInterfaz?codigo=${codigo}`,
        dataType: "json",
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

function ListarRoles() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/application/roles",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: 50,
        pageList: OPCIONES_PAGINACION,
        sortName: 'managerName',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Id = APLICACION_ID;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = 50;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            ROLES_LIST = [];
            data.Rows.forEach(element => ROLES_LIST.push(element));

            $.each(ROLES_LIST, function (index, value) {
                if (ROLES_LIST[index].applicationManagerId == 5 || ROLES_LIST[index].applicationManagerId == 6) {
                    NUEVOS_ROLES_LIST.push(ROLES_LIST[index]);
                }
            });

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

function devolverCriticidad(bia, clasificacion) {
    if (clasificacion === ClasificacionActivos.Publico && bia === BIA.MuyAlta)
        return CriticidadFinal.MuyAlta;
    if (clasificacion === ClasificacionActivos.Publico && bia === BIA.Alta)
        return CriticidadFinal.Alta;
    if (clasificacion === ClasificacionActivos.Publico && bia === BIA.Media)
        return CriticidadFinal.Media;
    if (clasificacion === ClasificacionActivos.Publico && bia === BIA.Baja)
        return CriticidadFinal.Baja;
    if (clasificacion === ClasificacionActivos.Publico && bia === -1)
        return CriticidadFinal.Baja;

    if (clasificacion === ClasificacionActivos.Restringido && bia === BIA.MuyAlta)
        return CriticidadFinal.MuyAlta;
    if (clasificacion === ClasificacionActivos.Restringido && bia === BIA.Alta)
        return CriticidadFinal.MuyAlta;
    if (clasificacion === ClasificacionActivos.Restringido && bia === BIA.Media)
        return CriticidadFinal.Alta;
    if (clasificacion === ClasificacionActivos.Restringido && bia === BIA.Baja)
        return CriticidadFinal.Alta;
    if (clasificacion === ClasificacionActivos.Restringido && bia === -1)
        return CriticidadFinal.Alta;

    if (clasificacion === ClasificacionActivos.UsoInterno && bia === BIA.MuyAlta)
        return CriticidadFinal.MuyAlta;
    if (clasificacion === ClasificacionActivos.UsoInterno && bia === BIA.Alta)
        return CriticidadFinal.Alta;
    if (clasificacion === ClasificacionActivos.UsoInterno && bia === BIA.Media)
        return CriticidadFinal.Media;
    if (clasificacion === ClasificacionActivos.UsoInterno && bia === BIA.Baja)
        return CriticidadFinal.Baja;
    if (clasificacion === ClasificacionActivos.UsoInterno && bia === -1)
        return CriticidadFinal.Baja;

    if (clasificacion === -1 && bia === BIA.MuyAlta)
        return CriticidadFinal.MuyAlta;
    if (clasificacion === -1 && bia === BIA.Alta)
        return CriticidadFinal.Alta;
    if (clasificacion === -1 && bia === BIA.Media)
        return CriticidadFinal.Media;
    if (clasificacion === -1 && bia === BIA.Baja)
        return CriticidadFinal.Baja;
    if (clasificacion === -1 && bia === -1)
        return CriticidadFinal.Baja;
}

function cargarToolbox() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/stepone/toolbox",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //dataObject.foreach(AsignarToolbox)
                    var IDs = [];
                    $("#divApp").find("span").each(function () { IDs.push(this.id); });
                    $("#divApp2").find("span").each(function () { IDs.push(this.id); });

                    $.each(dataObject, function (i) {
                        if (IDs.includes(dataObject[i].Codigo)) {
                            if (dataObject[i].Codigo != '' && dataObject[i].Codigo != null) {
                                var strfun = 'function changeTooltip() { document.getElementById(\"' + dataObject[i].Codigo + '\").innerHTML = dataObject[i].Tooltip;}';
                                eval(strfun)
                                changeTooltip();
                            }
                        }
                    });
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}


function CargarArchivos(id) {

    let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());

    UploadFile3($("#flArchivo"), archivoId, false, id);

}

function descargarArchivo() {
    var AppId = $('#hdAplicacionId').val();
    DownloadFile3(AppId);
}

function obtenerGestionadoPor(id) {
    let gestionado = null;
    if (id != null && id != -1) {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            url: URL_API_VISTA + `/application/managedBy/${id}`,
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        gestionado = dataObject;
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            async: false
        });
    }

    return gestionado;
}

function cargarCombosClasificacion() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/listsAdmin/architectit",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Categoria, $("#ddlCategoria"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Clasificacion, $("#ddlClasificacion"), TEXTO_SELECCIONE);

                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}
function cargarCombosCapaFuncional() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/lists/architectSolution",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.CapaFuncional, $("#dllCapaFuncional"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}


function opcionesFormatter(value, row) {

    if (row.applicationManagerId == 5 || row.applicationManagerId == 6) {
        verOwner = `<a onclick="javascript:eliminarOwner('${row.username}','${row.applicationManagerId}')" title="Eliminar usuario de la lista"><i class="glyphicon glyphicon-remove table-icon"></i></a>`;
        return verOwner;
    }
    else return "-";

}

function eliminarOwner(username, id) {

    $.each(ROLES_LIST, function (index, value) {
        if (ROLES_LIST[index] != null) {
            if (ROLES_LIST[index].username == username && ROLES_LIST[index].applicationManagerId == id) {
                ROLES_LIST.splice(index, 1);
            }
        }
    });

    $.each(NUEVOS_ROLES_LIST, function (index, value) {
        if (NUEVOS_ROLES_LIST[index] != null) {
            if (NUEVOS_ROLES_LIST[index].username == username && NUEVOS_ROLES_LIST[index].applicationManagerId == id) {
                NUEVOS_ROLES_LIST.splice(index, 1);
            }
        }
    });
    $table.bootstrapTable('destroy');

    $('table').bootstrapTable({
        data: ROLES_LIST
    });

    toastr.success("Para confirmar la acción es importante guardar los cambios", "Portafolio de Aplicaciones BCP");
}

function horarioFuncionamiento_Change() {
    if ($("#ddlHorarioFuncionamiento option:selected").text() == 'otro horario') {
        $("#divHorarioFuncionamiento").css("display", "block");
    } else {
        $("#divHorarioFuncionamiento").css("display", "none");
        $("#txtHorarioFuncionamiento").val('');
    }
}