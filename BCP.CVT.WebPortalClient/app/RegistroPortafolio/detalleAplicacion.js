const URL_API_VISTA = URL_API + "/applicationportfolio";
const TITULO_MENSAJE = "Portafolio de Aplicaciones";
var MENSAJE = "¿Estás seguro de actualizar los datos de la aplicación?";
const MENSAJE_CONFIRMACION = "Se registró la aplicación de manera parcial. Recuerda que es necesario que completes todos los datos de tu aplicación  para que tenga la  aprobación de todos los responsables y complete su registro en portafolio. Cuentas con un plazo máximo de 2 días apartir de la fecha de registro.  ¿Deseas completar los datos?";
const MENSAJE_CONFIRMACION2 = "Se actualizó la aplicación de manera satisfactoria.";
const MENSAJE_GOBIERNO_USERIT = "Este mensaje tiene que ser proporcionado por Gobierno UserIT ya que se cambia el Gestionado Por a UserIT";

const ID_USERIT = 1;
var cambiarInterface = true;
var cargaInicial = true;
const tituloMensaje = "Portafolio de Aplicaciones";

/*const TIPO_DESARROLLO_INTERNO = 178;*/
const TIPO_WEB = 154;
const DESARROLLO_EXPERIMENTAL = 152;
var estadoInicial = 0;

var $table = $("#tblRegistro");
var ROLES_LIST = [];
var NUEVOS_ROLES_LIST = [];
var NUEVOS_Expertos = [];
var control = 0;
var pciInicial = "";
var CamposFaltantes = "";

var listaInfraestructura = ["185", "190"];
var activarJenkins = "";
var InfraestructuraInicial = 0;
var NombrePersona = "";
var EmailPersona = "";

$(function () {
    $("#ddlEntidades").multiselect('enable');
    $("#msjUsuarioRepetido").hide();
    $(".divRowOwner").hide();
    $("#ddlPCI").multiselect('enable');
    SetItemsMultiple([], $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true);
    SetItemsMultiple2([], $("#ddlPCI"), TEXTO_SELECCIONE, TEXTO_SELECCIONE, true, false);


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

    //InitAutocompletarEstandarBuilder2($("#txtOwner"), $("#hdOwnerId"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro?filtro={0}&filtroPadre=");
    InitAutocompletarBuilderLocalAD($("#txtOwner"), $("#hdOwnerId"), ".divUnidadContainer", "/userSIGA/{0}");

    InitAutocompletarUsuariosLocal2($("#txtAutorizador"), $("#hAutorizadorId"), ".divUsuarioAutorizadorContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");


    $("#txtAutorizador").focusout(function () {
        let valor = $("#txtAutorizador").val().length;
        if (valor != control)
            $("#txtAutorizador").val('');
    });
    ListarRoles();



    $("#btnRegistrarApp").click(guardarAddOrEditApp);
    $("#btnCancelar").click(cancelarAddOrEditApp);
    $("#ddlGestionadoPor").change(GestionadoPor_Change);
    $("#btnDescargar").click(descargarArchivo);
    if ($("#txtUnidad").val() != "") {
        $(".unidadResponsable").show();
    }
    else $(".unidadResponsable").hide();
    cargarCombos();
    cargarToolbox();
    validarFormApp();
    initUpload($("#txtArchivo"));
    ValidarActivacionJenkins();

    FormatoCheckBox($("#divFlagInterface"), "ckbInterface");
    $("#ckbInterface").change(FlagInterface_Change);

    FormatoCheckBox($("#divFlagPCI"), "ckbPCI");
    $("#ckbPCI").change(FlagPCI_Change);

    $("#ddlInfraestructura").change(Infraestructure_Change);

    $("#txtOwner").hide();
    FormatoCheckBox($("#divFlagOwner"), "ckbOwner");
    $("#ckbOwner").change(FlagOwner_Change);

    FormatoCheckBox($("#divFlagProveedorDesarrollo"), "ckbProveedorDesarrollo");
    $("#ckbProveedorDesarrollo").change(FlagProveedorDesarrollo_Change);

    if (APLICACION_ID !== 0) {
        editarAplicacion(APLICACION_ID);
        cargaInicial = false;
    } else {
        window.document.location.href = `/RegistroPortafolioAplicaciones/Bandeja?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;
    }
    var Unidad_Id

    $("#txtUnidad").change(function () {
        Unidad_Id = $("#hdUnidadId").val();
        CambioUnidad(APLICACION_ID, $("#hdUnidadId").val())
    });

    $("#ddlUnidadesOwner").change(function () {
        Unidad_Id = $("#ddlUnidadesOwner").val();
        CambioUnidad(APLICACION_ID, Unidad_Id)
    });


    $("#ddlGestionadoPor").change(function () {
        if ($("#ddlGestionadoPor").val() == 30) {
            cargarCombosExterno();
            var newOption = $('<option value="' + -1 + '">' + "NO APLICA" + '</option>');
            $('#ddlEquipo').empty()
            $('#ddlEquipo').append(newOption);
            $("#ddlEquipo").attr("disabled", "disabled");
        }
        else {
            //cargarCombosSinGP();
            $("#ddlEquipo").removeAttr('disabled');
        }
    });

    $("#ddlGestionadoPor").change(function () {
        if ($("#ddlGestionadoPor").val() == 1 || $("#ddlGestionadoPor").val() == 30 || $("#ddlGestionadoPor").val() == 36 || $("#ddlGestionadoPor").val() == 37 || $("#ddlGestionadoPor").val() == 38 || $("#ddlGestionadoPor").val() == 39
            || $("#ddlGestionadoPor").val() == 40 || $("#ddlGestionadoPor").val() == 41) {
            $("#txtGrupoTicketRemedy").val("NO APLICA");
            $("#hGrupoTicketRemedy").val() == -1;
            $("#txtGrupoTicketRemedy").attr("disabled", "disabled");
        }
        else {
            //$("#txtGrupoTicketRemedy").val("");
            $("#txtGrupoTicketRemedy").removeAttr('disabled');
        }
    });





    if ($("#hdUnidadId").val() != -1) CambioUnidad(APLICACION_ID, $("#hdUnidadId").val());


    //$("#ddlGestionadoPor").change(GestionadoPor_Change);
    /*$("#ddlTipoDesarrollo").change(TipoDesarrollo_Change);*/

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
            toastr.error("El código de aplicación reemplazado no es válido, por favor seleccione una aplicación que se haya registrado en el portafolio.", TITULO_MENSAJE);
        }
    });

    $("#txtCodigoAppPadre").focusout(function () {
        let valor = $("#hCodigoPadre").val();
        if (valor == '0') {
            $("#txtCodigoAppPadre").val('');
            toastr.error("El código de aplicación padre no es válido, por favor seleccione una aplicación que se haya registrado en el portafolio.", TITULO_MENSAJE);
        }
    });


    estadoInicial = getDDL($("#ddlEstadoAplicacion"));

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

    InfraestructuraInicial = $("#ddlInfraestructura").val();

    $("#ddlTipoImplementacion").change(TipoImplementacion_Change);

});

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
        $("#spanNoAplica").hide();
    }
    else {
        $("#ddlPCI").next().hide();
        var newOption = $('<option value="' + 4 + '">' + 'NO APLICA' + '</option>');
        $('#ddlPCI').append(newOption);
        $('#ddlPCI').val(4);
        $("#spanNoAplica").show();
    }
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
                //$("#hAutorizadorCorreo").val(ui.item.mail);
                GetPersonaSIGA(ui.item.matricula);

                if (EmailPersona != null) {
                    $("#hAutorizadorCorreo").val(EmailPersona);
                    var data = { username: ui.item.matricula, managerName: NombrePersona, applicationManagerId: 6, email: EmailPersona, applicationManagerIdDetail: "Experto" }
                } else {
                    $("#hAutorizadorCorreo").val(ui.item.mail);
                    var data = { username: ui.item.matricula, managerName: ui.item.displayName, applicationManagerId: 6, email: ui.item.mail, applicationManagerIdDetail: "Experto" }
                }
                $("#hAutorizadorMatricula").val(ui.item.matricula);

                $("#txtAutorizador").val("");
                control = ui.item.displayName.length;

                var flag = 0;
                $.each(ROLES_LIST, function (index, value) {
                    if (ROLES_LIST[index].username == data.username && ROLES_LIST[index].applicationManagerId == data.applicationManagerId) {
                        flag = 1;
                        $("#msjUsuarioRepetido").show();
                    }
                });

                if (flag == 0) {
                    ROLES_LIST.push(data);

                    NUEVOS_Expertos.push(data);


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


function ListarRoles() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/application/roles/experts",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: 1,
        pageSize: 10,
        pageList: OPCIONES_PAGINACION,
        sortName: 'managerName',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.Id = APLICACION_ID;
            DATA_EXPORTAR.pageNumber = 1;
            DATA_EXPORTAR.pageSize = 10;
            DATA_EXPORTAR.sortName = '';
            DATA_EXPORTAR.sortOrder = '';

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            data.Rows.forEach(element => ROLES_LIST.push(element));

            $.each(ROLES_LIST, function (index, value) {
                if (ROLES_LIST[index].applicationManagerId == 6) {
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


function opcionesFormatter(value, row) {

    if (row.applicationManagerId == 5 || row.applicationManagerId == 6) {
        verOwner = `<a onclick="javascript:eliminarOwner('${row.username}','${row.applicationManagerId}')" title="Eliminar usuario de la lista"><i class="glyphicon glyphicon-remove table-icon"></i></a>`;
        return verOwner;
    }
    else return "-";

}

function cargarCombosExterno() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/application/lists/combosExterna",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoDesarrollo, $("#ddlTipoDesarrollo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ModeloEntrega, $("#ddlModeloEntrega"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Infraestructura, $("#ddlInfraestructura"), TEXTO_SELECCIONE);

                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

//Busqueda de owner por SIGA
//function InitAutocompletarEstandarBuilder2($searchBox, $IdBox, $container, urlController) {
//    let data = CrearObjAplicacion();

//    $searchBox.autocomplete({
//        minLength: 2,
//        appendTo: $container,
//        source: function (request, response) {
//            if ($.trim(request.term) !== "") {

//                let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
//                data.Username = request.term;
//                if ($IdBox !== null) $IdBox.val("0");
//                $.ajax({
//                    url: URL_API_VISTA + `/application/Gerencia/getOwner`,
//                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
//                    type: "POST",
//                    data: JSON.stringify(data),
//                    contentType: "application/json; charset=utf-8",
//                    dataType: "json",
//                    success: function (data) {
//                        response($.map(data, function (item) {
//                            return item;
//                        }));
//                    },
//                    async: true,
//                    global: false
//                });
//            } else
//                return response(true);
//        },
//        focus: function (event, ui) {
//            $searchBox.val(ui.item.Nombre);
//            return false;
//        },
//        select: function (event, ui) {
//            if ($IdBox !== null) {
//                $IdBox.val(ui.item.Matricula);
//                $("#hdOwnerId").val(ui.item.Matricula);
//                CambioOwner2(APLICACION_ID, ui.item.Id)
//                //LIST = [];
//                //BuscarEnUnidad(ui.item.Matricula);

//                //if (flag == 1) {
//                //    var dat = { Id: ui.item.id, Responsable: ui.item.Nombre, ResponsableCorreo: ui.item.Correo, ResponsableMatricula: ui.item.Matricula }

//                //    LIST.push(dat);
//                //    document.getElementById('label').innerHTML = '';
//                //}
//                //$table.bootstrapTable('destroy');
//                //$('table').bootstrapTable({
//                //    data: LIST
//                //});
//                //$('#txtOwner').val("");
//            }
//            return false;
//        }
//    }).autocomplete("instance")._renderItem = function (ul, item) {
//        return $("<li>").append("<a style='display: block'><font>" + item.Nombre + "</font></a>").appendTo(ul);
//    };
//}

//Busqueda de owner por AD
function InitAutocompletarBuilderLocalAD($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA +  urlControllerWithParams,
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
                CambioOwner2(APLICACION_ID)
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}



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

function TipoImplementacion_Change() {
    let tipoImplementacion = $("#ddlTipoImplementacion").val();
    if (tipoImplementacion == DESARROLLO_EXPERIMENTAL) {
        $("#txtGrupoTicketRemedy").val("NO APLICA");
        $("#txtGrupoTicketRemedy").attr("disabled", "disabled");
        $("#hGrupoTicketRemedy").val("-1");
    }
    //else {
    //    $("#txtGrupoTicketRemedy").val('');
    //    $("#txtGrupoTicketRemedy").removeAttr("disabled");
    //    $("#hGrupoTicketRemedy").val('');
    //}
}

function GestionadoPor_Change() {
    let gestionado = null;
    if ($("#ddlGestionadoPor").val() != -1)
        gestionado = obtenerGestionadoPor($("#ddlGestionadoPor").val());


    if (gestionado != null) {

        if (gestionado.FlagUserIT) {
            $(".divInterfaz").hide();
            $("#ddlEquipo").empty();
            $('#ddlEquipo').append('<option value="-1" selected="selected">NO APLICA</option>');

            $("#ddlEquipo").attr("disabled", "disabled");
            $(".datosUserIT").show();

            $("#txtComplianceLevel").val('');
            $("#txtSummaryStandard").val('');

            //bootbox.alert(MENSAJE_GOBIERNO_USERIT);

            if (!cargaInicial)
                toastr.warning("Ingresa el nivel de cumplimiento y el resumen de lineamientos de seguridad para que tu aplicación complete su situación de registro", "Portafolio de aplicaciones BCP");
        }
        else if (gestionado.FlagSubsidiarias) {
            $("#ddlEquipo").empty();
            $('#ddlEquipo').append('<option value="-1" selected="selected">NO APLICA</option>');
            $(".datosUserIT").hide();
            $("#ddlEquipo").attr("disabled", "disabled");

            $("#txtComplianceLevel").val('');
            $("#txtSummaryStandard").val('');
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

            if (!cargaInicial)
                toastr.warning("Selecciona un Equipo/Squad (si hubiera) para que tu aplicación complete su situación de registro", "Portafolio de aplicaciones BCP");
        }
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

        //cargarEquipos(gestionado.Id);

        if (!cargaInicial)
            toastr.warning("Selecciona un Equipo/Squad (si hubiera) para que tu aplicación complete su situación de registro", "Portafolio de aplicaciones BCP");
    }
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

function FlagOwner_Change() {
    var flag = $(this).prop("checked");
    if (flag) {
        $("#txtOwner").show();
        $(".divRowOwner").show();

    }
    else {
        $("#txtOwner").hide();
        $(".divRowOwner").hide();
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

function cancelarAddOrEditApp() {
    window.document.location.href = `/RegistroPortafolioAplicaciones/Bandeja?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;
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
                    $("#hdUnidadId").val(UnidadId);
                    $("#txtUnidad").val(data.unidadName);
                    $(".unidadResponsable").show();
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

function CambioOwner2(Id) {
    let data = CrearObj();

    $.ajax({
        url: URL_API_VISTA + `/application/UnidadesOwner`,
        data: JSON.stringify(data),
        type: "POST",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    SetItems(dataObject, $("#ddlUnidadesOwner"), TEXTO_SELECCIONE);

                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
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
    data.Username = $("#hdOwnerId").val();

    return data;
}


function editarAplicacion(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    /*cargarComboInfraestructura(Id);*/
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
                    else if (data.NombreArchivoSeguridad != null) {
                        document.getElementById('btnDescargar').style.display = '';
                    }
                    $("#txtArea").val(data.areaName);
                    $("#txtDivision").val(data.divisionName);
                    $("#txtGerencia").val(data.gerenciaName);

                    $("#hdAplicacionId").val(APLICACION_ID);
                    $("#txtCodigoAPT").val(data.applicationId);
                    $("#ddlGestionadoPor").val(data.managed || "-1");

                    if (data.managed == 1 || data.managed == 30 || data.managed == 36 || data.managed == 37 || data.managed == 38 || data.managed == 39
                        || data.managed == 40 || data.managed == 41) {
                        $("#txtGrupoTicketRemedy").val("NO APLICA");
                        $("#txtGrupoTicketRemedy").attr("disabled", "disabled");
                    }
                    else {
                        if (data.groupTicketRemedy != '') {
                            $("#txtGrupoTicketRemedy").val(data.grupoTicketRemedyName);
                            $("#hGrupoTicketRemedy").val(data.groupTicketRemedy);
                        }
                        $("#txtGrupoTicketRemedy").removeAttr('disabled');
                    }

                    GestionadoPor_Change();

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

                    $("#ddlTipoImplementacion").val(data.implementationType || "-1");
                    TipoImplementacion_Change();
                    $("#ddlModeloEntrega").val(data.deploymentType || "-1");
                    $("#ddlEstadoAplicacion").val(data.status || "-1");
                    $("#ddlArquitectoNegocio").val(data.architecId || "-1");
                    $("#ddlArquitectoSolucion").val(data.architectSolutionId || "-1");

                    $("#ddlEntidades").val(data.userEntity !== null ? data.userEntity.split(",") : "-1"); //app.AplicacionDetalle
                    $("#ddlEntidades").multiselect("refresh");

                    if (data.TipoPCI.length > 0) {
                        if (data.TipoPCI.length = 1) {
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

                    //if (data.TipoPCI == "4") {
                    //    var newOption = $('<option value="' + 4 + '">' + 'NO APLICA' + '</option>');
                    //    $('#ddlPCI').append(newOption);
                    //    $("#ddlPCI").val(4);
                    //    $("#ddlPCI").next().hide();
                    //}
                    //else if (data.TipoPCI != "4") {
                    //    $("#ddlPCI").val(data.TipoPCI !== null ? data.TipoPCI : "-1");
                    //    $("#ddlPCI").multiselect("refresh");
                    //}

                    //$("#ddlPCI").multiselect("refresh");

                    pciInicial = data.TipoPCI;
                    //if (data.TipoPCI != "4") {
                    //    $("#ckbPCI").prop('checked', true);
                    //    $("#ckbPCI").bootstrapToggle(true ? 'on' : 'off');
                    //}
                    //else {
                    //    $("#ckbPCI").prop('checked', false);
                    //    $("#ckbPCI").bootstrapToggle(false ? 'on' : 'off');
                    //}

                    $("#ddlTipoDesarrollo").val(data.developmentType || "-1");
                    /*TipoDesarrollo_Change();*/
                    /*$("#txtProveedorDesarrollo").val(data.developmentProvider);*/
                    $("#ckbProveedorDesarrollo").prop('checked', data.developmentProvider);
                    $("#ckbProveedorDesarrollo").bootstrapToggle(data.developmentProvider ? 'on' : 'off');
                    if (data.developmentProvider) {
                        $("#ckbProveedorDesarrollo").bootstrapToggle(data.developmentProvider == 'NO APLICA' ? 'off' : 'on');
                        $("#txtProveedorDesarrollo").val(data.developmentProvider);
                        /*$("#ckbProveedorDesarrollo").attr("disabled", "disabled");*/
                    }
                    else {
                        $("#txtProveedorDesarrollo").val('NO APLICA');
                    }
                        
                    $("#ddlInfraestructura").val(data.infrastructure || "-1");
                    $("#ddlAutorizacion").val(data.authorizationMethod || "-1");
                    $("#ddlAutenticacion").val(data.authenticationMethod || "-1");

                    $("#hExpertoMatricula").val(data.expertId);
                    $("#txtExperto").val(data.expertName);
                    $("#hExpertoCorreo").val(data.expertEmail);

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

                    //$("#hGrupoTicketRemedy").val(data.groupTicketRemedy || "-1");
                    //if (data.groupTicketRemedy != '') {
                    //    $("#txtGrupoTicketRemedy").val(data.grupoTicketRemedyName);
                    //    $("#hGrupoTicketRemedy").val(data.groupTicketRemedy);
                    //}
                    $("#txtURL").val(data.webDomain);

                    $("#txtComplianceLevel").val(data.complianceLevel);
                    $("#txtSummaryStandard").val(data.summaryStandard);

                    if (data.hasDateReleased) {
                        $("#ddlEstadoAplicacion").attr("disabled", "disabled");
                        $("#ddlTipoImplementacion").attr("disabled", "disabled");
                    }

                    if (data.isApproved == true)
                        $("form :input").attr("disabled", "disabled");

                    if (data.technologyCategory != null) {
                        if (data.technologyCategory != TIPO_WEB) {
                            $("#txtURL").attr("disabled", "disabled");
                            $("#txtURL").val('NO APLICA');
                        }
                        else
                            $("#txtURL").removeAttr("disabled");
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

function guardarAddOrEditApp() {
    //CHC: la primera linea le estaba agregando la clase ignore a todos los inputs con clase form-control. la clase ignore se usa para
    //     decirle al validate que no tome en cuenta esos inputs
    //$(".form-control").addClass("ignore");
    //$(".input-registro").removeClass("ignore");

    var gestionado = $('#ddlGestionadoPor').val();
    var gestionadoObjeto = obtenerGestionadoPor($("#ddlGestionadoPor").val());
    var campoPCI = false;

    var result = false;
    if (gestionado != -1) {
        let objGestionado = obtenerGestionadoPor(gestionado);
        if (objGestionado.FlagUserIT == true) {
            if ($("#txtComplianceLevel").val() == '') {
                toastr.error("Ingresa el nivel de cumplimiento de seguridad para que tu aplicación complete su situación de registro", "Portafolio de aplicaciones BCP");
                $("#txtComplianceLevel").focus();
            }
            else {
                if ($("#txtSummaryStandard").val() == '') {
                    toastr.error("Ingresa el resumen de lineamientos de seguridad para que tu aplicación complete su situación de registro", "Portafolio de aplicaciones BCP");
                    $("#txtSummaryStandard").focus();
                }
                else
                    result = true;
            }
        }
        else if (objGestionado.FlagSubsidiarias == true) {
            result = true;
        }
        else if (objGestionado.FlagJefeEquipo == false && objGestionado.FlagEquipoAgil == false) {
            result = true;
        }
        else {
            if ($('#ddlEquipo').val() == -1) {
                $('#ddlEquipo').focus();
                toastr.error("Es requerido que selecciones un Equipo/Squad", "Portafolio de aplicaciones BCP");
                result = false;
            }
            else
                result = true;
        }
    }
    else {
        toastr.error("Es requerido que selecciones un valor para el campo Gestionado Por", "Portafolio de aplicaciones BCP");
        $('#ddlGestionadoPor').focus();
        result = false;        
    }

    CamposFaltantes = "";
    MENSAJE = "¿Estás seguro de actualizar los datos de la aplicación?";

    if ($("#ddlGestionadoPor").val() == -1) {
        CamposFaltantes = CamposFaltantes + " * Gestionado Por<br/>";
    }
    if ($("#txtNombre").val() == "") {
        CamposFaltantes = CamposFaltantes + " * Nombre de la aplicación<br/>";
    }
    if ($("#ddlTipoImplementacion").val() == -1) {
        CamposFaltantes = CamposFaltantes + " * Tipo de implementación<br/>";
    }
    if ($("#txtDescripcion").val() == "") {
        CamposFaltantes = CamposFaltantes + " * Descripción<br/>";
    }
    if ($("#ddlModeloEntrega").val() == -1) {
        CamposFaltantes = CamposFaltantes + " * Modelo de entrega<br/>";
    }
    if ($("#ddlEstadoAplicacion").val() == -1) {
        CamposFaltantes = CamposFaltantes + " * Estado de la aplicación<br/>";
    }
    if ($("#ddlArquitectoNegocio").val() == -1) {
        CamposFaltantes = CamposFaltantes + " * Arquitecto evaluador de la aplicación<br/>";
    }
    if ($("#ddlArquitectoSolucion").val() == -1) {
        CamposFaltantes = CamposFaltantes + " * Arquitecto Solución de la aplicación<br/>";
    }
    if ($("#txtUnidad").val() == "") {
        CamposFaltantes = CamposFaltantes + " * Unidad dueña de la aplicación<br/>";
    }
    if ($("#ddlEquipo").val() == -1 && $("#ddlGestionadoPor").val() != 1 && (gestionadoObjeto.FlagUserIT == false && gestionadoObjeto.FlagSubsidiarias == false)) {
        CamposFaltantes = CamposFaltantes + " * Equipo/Squad<br/>";
    }
    if ($("#ddlEntidades").val() == -1 || $("#ddlEntidades").val() == null) {
        CamposFaltantes = CamposFaltantes + " * Entidades usuarias<br/>";
    }
    if (ROLES_LIST.length == 0) {
        CamposFaltantes = CamposFaltantes + " * Experto de la aplicación<br/>";
    }
    if ($("#ddlTipoDesarrollo").val() == -1) {
        CamposFaltantes = CamposFaltantes + " * Tipo de desarrollo<br/>";
    }
    if ($("#ddlInfraestructura").val() == -1) {
        CamposFaltantes = CamposFaltantes + " * Infraestructura de la aplicación<br/>";
    }
    if ($("#ddlAutenticacion").val() == -1) {
        CamposFaltantes = CamposFaltantes + " * Método de autenticación<br/>";
    }
    if ($("#ddlAutorizacion").val() == -1) {
        CamposFaltantes = CamposFaltantes + " * Método de Autorización<br/>";
    }
    if ($("#txtGrupoTicketRemedy").val() == "") {
        CamposFaltantes = CamposFaltantes + " * Grupo Ticket Remedy<br/>";
    }

    if ($("#ckbPCI").prop("checked")) {        
        if ($("#ddlPCI").val() == null) {
            campoPCI = true;
            CamposFaltantes = CamposFaltantes + " * Tratamiento PCI DSS<br/>";
        }            
        else {
            if ($("#ddlPCI").val().length == 0) {
                campoPCI = true;
                CamposFaltantes = CamposFaltantes + " * Tratamiento PCI DSS<br/>";
            }
        }
    }

    if ($("#ckbProveedorDesarrollo").prop("checked")) {
        if ($("#txtProveedorDesarrollo").val() == null) {
            CamposFaltantes = CamposFaltantes + " * Proveedor de desarrollo<br/>";
        }
        else {
            if ($("#txtProveedorDesarrollo").val().length == "") {
                CamposFaltantes = CamposFaltantes + " * Proveedor de desarrollo<br/>";
            }
        }
    }

    //Fio
    if ($("#ddlInfraestructura").val() == 190 || $("#ddlInfraestructura").val() == 185) {
        if (!$("#ckbInterface").prop("checked")) {
            toastr.error("Es requerido el código de interfaz para la Creación del Usuario de Aplicación, en aplicaciones de infraestructura IaaS / PaaS", "Portafolio de aplicaciones BCP");
            $('#divFlagInterface').focus();
            result = false;
        }
    }
    //

    if ($("#txtNombre").val() == "" || $("#ddlGestionadoPor").val() == -1 || $("#ddlTipoImplementacion").val() == -1 || $("#ddlAutorizacion").val() == -1 || $("#txtDescripcion").val() == "" || $("#ddlModeloEntrega").val() == -1 || $("#ddlEstadoAplicacion").val() == -1 || $("#ddlArquitectoNegocio").val() == -1
        || $("#txtUnidad").val() == "" ||
        ($("#ddlEquipo").val() == -1 && (gestionadoObjeto.FlagUserIT == false && gestionadoObjeto.FlagSubsidiarias == false))
        || $("#ddlEntidades").val() == -1 || $("#ddlEntidades").val() == null || ROLES_LIST.length == 0 || $("#ddlTipoDesarrollo").val() == -1 || $("#txtProveedorDesarrollo").val() == "" || $("#ddlInfraestructura").val() == -1 ||
        $("#ddlAutenticacion").val() == -1 || $("#txtGrupoTicketRemedy").val() == "" || campoPCI == true) {
        MENSAJE = MENSAJE + "<br/>Los siguientes campos no están completos, solo cuando todos los campos marcados con  <span class='etiquetaRoja'>(*)</span> se encuentren correctamente registrados la aplicación podrá alcanzar la situación de registro completa:<br/>" + CamposFaltantes;
    }

    if (result == true) {
        if ($("#formAddOrEditApp").valid()) {
            bootbox.confirm({
                title: TITULO_MENSAJE,
                message: MENSAJE,
                buttons: SET_BUTTONS_BOOTBOX,
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

    $.validator.addMethod("noEsNumero", function (value, element) {
        let estado = false;
        let valor = $.trim(value);
        if (isNaN(valor)) {

            return false;
        }
        return true;
    });

    $.validator.addMethod('maxStrict', function (value, el, param) {
        return value <= 100;
    });

    $.validator.addMethod("blankSpace", function (value) {
        return value.indexOf(" ") < 0;
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
                requiredSinEspacios: true
            },
            txtDescripcion: {
                requiredSinEspacios: true
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
            ddlArquitectoNegocio: {
                requiredSelect: true
            },
            ddlArquitectoSolucion: {
                requiredSelect: true
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
            ddlArquitectoNegocio: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            ddlArquitectoSolucion: {
                requiredSelect: "Debes de seleccionar un elemento de la lista"
            },
            txtComplianceLevel: {
                noEsNumero: "Debes ingresar un número",
                maxStrict: "El valor no puede ser mayor a 100",
                blankSpace: "El valor no puede ser un espacio en blanco"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtCodigoAPT" || element.attr('name') === "txtNombre" || element.attr('name') === "txtDescripcion"                
                || element.attr('name') === "ddlGestionadoPor"
                || element.attr('name') === "ddlTipoImplementacion"
                || element.attr('name') === "ddlModeloEntrega"
                || element.attr('name') === "ddlEstadoAplicacion"
                || element.attr('name') === "ddlArquitectoNegocio"
                || element.attr('name') === "ddlArquitectoSolucion"
                || element.attr('name') === "txtComplianceLevel") {
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
    data.userEntity = $("#ddlEntidades").val() !== null ? $("#ddlEntidades").val().join(",") : "";
    data.developmentType = getDDL($("#ddlTipoDesarrollo"));
    data.developmentProvider = $.trim($("#txtProveedorDesarrollo").val()).toUpperCase();
    data.infrastructure = getDDL($("#ddlInfraestructura"));
    data.hasInterfaceId = $("#ckbInterface").prop("checked");
    data.interfaceId = $("#txtCodigoInterfaz").val();
    data.replacementApplication = $("#hCodigoReemplazada").val() == "0" ? '' : $.trim($("#hCodigoReemplazada").val()).toUpperCase();
    data.architectId = getDDL($("#ddlArquitectoNegocio")); //$("#ddlAreaBIAN").val();  //cvt.Aplicacion
    data.architectSolutionId = getDDL($("#ddlArquitectoSolucion"));
    data.authorizationMethod = getDDL($("#ddlAutorizacion"));
    data.authenticationMethod = getDDL($("#ddlAutenticacion"));
    data.expertId = $("#hExpertoMatricula").val();
    data.expertName = $("#txtExperto").val();
    data.expertEmail = $("#hExpertoCorreo").val();
    data.unit = $("#hdUnidadId").val() == -1 ? null : $("#hdUnidadId").val();
    data.groupTicketRemedy = $("#hGrupoTicketRemedy").val() == -1 ? null : $("#hGrupoTicketRemedy").val();
    data.webDomain = $("#txtURL").val();
    data.summaryStandard = $("#txtSummaryStandard").val();
    data.complianceLevel = $("#txtComplianceLevel").val();
    data.status = getDDL($("#ddlEstadoAplicacion"));

    data.TipoPCI = $("#ddlPCI").val() !== null ? $("#ddlPCI").val() : [];

    data.NuevosRolesList = NUEVOS_ROLES_LIST;

    data.NuevosExpertosList = NUEVOS_Expertos;

    //if (estadoInicial == 3 && data.status != 3) {
    //    data.aplicacionRevertida = true;
    //}

    return data;
}

function sendDataFormAPI($form, $btn, title) {
    var estadoTransaccion = true;
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }
    let data = CrearObjAplicacion();

    $.ajax({
        url: URL_API_VISTA + "/application/steptwo",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    if ($("#flArchivo").val() != null) { CargarArchivos(data.AppId) }


                    let dataResult = dataObject;
                    estadoTransaccion = dataResult.EstadoTransaccion;
                    if (dataResult.EstadoTransaccion && !VerifyInputs()) {
                        bootbox.confirm({
                            message: MENSAJE_CONFIRMACION,
                            buttons: {
                                confirm: {
                                    label: 'Si, completar',
                                    className: 'btn-success'
                                },
                                cancel: {
                                    label: 'Grabar y completar luego',
                                    className: 'btn-danger'
                                }
                            },
                            callback: function (result) {
                                if (!result)
                                    window.document.location.href = `/RegistroPortafolioAplicaciones/Bandeja?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;
                                else {
                                    cargaInicial = true;
                                    editarAplicacion(APLICACION_ID);
                                    cargaInicial = false;
                                }
                            }
                        });

                    }
                    else if (dataResult.EstadoTransaccion && VerifyInputs()) {
                        bootbox.confirm({
                            message: MENSAJE_CONFIRMACION2,
                            buttons: {
                                confirm: {
                                    label: '',
                                    className: 'invisible'
                                },
                                cancel: {
                                    label: 'Ir a la bandeja',
                                    className: 'btn-success'
                                }
                            },
                            callback: function (result) {
                                if (!result)
                                    window.document.location.href = `/RegistroPortafolioAplicaciones/Bandeja?nom_App=${nombre_app}&paginaActual=${PAGINA_ACTUAL}&paginaTamanio=${PAGINA_TAMANIO}`;
                            }
                        });

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
        url: URL_API_VISTA + "/application/steptwo/lists",
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
                    SetItemsMultiple(dataObject.EntidadesUsuarias, $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TipoPCI, $("#ddlPCI"), TEXTO_SELECCIONE, TEXTO_TODOS, true);

                    //SetItems(dataObject.GrupoTicketRemedy, $("#ddlGrupoTicketRemedy"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

//function cargarComboInfraestructura(AppId) {
//    $.ajax({
//        type: "GET",
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
//        url: URL_API_VISTA + "/application/steptwo/infraestructure/" + AppId,
//        dataType: "json",
//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    SetItems(dataObject.Infraestructura, $("#ddlInfraestructura"), TEXTO_SELECCIONE);
//                }
//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//}

//function cargarCombosSinGP() {
//    $.ajax({
//        type: "GET",
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
//        url: URL_API_VISTA + "/application/steptwo/lists",
//        dataType: "json",
//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    SetItems(dataObject.TipoImplementacion, $("#ddlTipoImplementacion"), TEXTO_SELECCIONE);
//                    SetItems(dataObject.Arquitecto, $("#ddlArquitectoNegocio"), TEXTO_SELECCIONE);
//                    SetItems(dataObject.ModeloEntrega, $("#ddlModeloEntrega"), TEXTO_SELECCIONE);

//                    //SetItems(dataObject.GestionadPor, $("#ddlGestionadoPor"), TEXTO_SELECCIONE);
//                    SetItems(dataObject.TipoDesarrollo, $("#ddlTipoDesarrollo"), TEXTO_SELECCIONE);
//                    SetItems(dataObject.Infraestructura, $("#ddlInfraestructura"), TEXTO_SELECCIONE);
//                    SetItems(dataObject.MetodoAutenticacion, $("#ddlAutenticacion"), TEXTO_SELECCIONE);
//                    SetItems(dataObject.MetodoAutorizacion, $("#ddlAutorizacion"), TEXTO_SELECCIONE);
//                    SetItemsMultiple(dataObject.EntidadesUsuarias, $("#ddlEntidades"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
//                    SetItemsMultiple(dataObject.TipoPCI, $("#ddlPCI"), TEXTO_SELECCIONE, TEXTO_TODOS, true);

//                    //SetItems(dataObject.GrupoTicketRemedy, $("#ddlGrupoTicketRemedy"), TEXTO_SELECCIONE);
//                }

//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//}

function cargarEquipos(gestionado) {
    $("#ddlEquipo").empty();

    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/application/managedteams/${gestionado}`,
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

//function changeGestionado() {
//    cargarEquipos($("#ddlGestionadoPor").val());
//}

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

function VerifyInputs() {
    var gestionado = $('#ddlGestionadoPor').val();
    if (gestionado != -1) {
        let objGestionado = obtenerGestionadoPor(gestionado);
        if (objGestionado.FlagUserIT == true || objGestionado.FlagSubsidiarias == true) {
            if (objGestionado.FlagUserIT == true) {
                if ($('#ddlGestionadoPor').val() != -1 && $('#ddlTipoImplementacion').val() != -1 && $('#ddlEstadoAplicacion').val() != -1 && $('#ddlModeloEntrega').val() != -1 &&
                    $('#ddlInfraestructura').val() != -1 && $('#ddlAutorizacion').val() != -1 && $('#ddlAutenticacion').val() != -1 && $('#ddlTipoDesarrollo').val() != -1 &&
                    $('#ddlArquitectoNegocio').val() != -1 && $('#txtNombre').val() != "" && $('#txtDescripcion').val() != "" &&
                    $('#txtExperto').val() != "" && $('#txtUnidad').val() != "" && $('#txtProveedorDesarrollo').val() != "" && $("#txtComplianceLevel").val() != "" && $("#txtSummaryStandard").val() != "" &&
                    $('#ddlEntidades').val() != null && $('#ddlPCI').val() != null) { return true; }
                else return false;
            }
            else {
                if ($('#ddlGestionadoPor').val() != -1 && $('#ddlTipoImplementacion').val() != -1 && $('#ddlEstadoAplicacion').val() != -1 && $('#ddlModeloEntrega').val() != -1 &&
                    $('#ddlInfraestructura').val() != -1 && $('#ddlAutorizacion').val() != -1 && $('#ddlAutenticacion').val() != -1 && $('#ddlTipoDesarrollo').val() != -1 &&
                    $('#ddlArquitectoNegocio').val() != -1 && $('#txtNombre').val() != "" && $('#txtDescripcion').val() != "" &&
                    $('#txtExperto').val() != "" && $('#txtUnidad').val() != "" && $('#txtProveedorDesarrollo').val() != "" &&
                    $('#ddlEntidades').val() != null && $('#ddlPCI').val() != null) { return true; }
                else return false;
            }
        }
        else if (objGestionado.FlagJefeEquipo == false && objGestionado.FlagEquipoAgil == false) {
            if ($('#ddlGestionadoPor').val() != -1 && $('#ddlTipoImplementacion').val() != -1 && $('#ddlEstadoAplicacion').val() != -1 && $('#ddlModeloEntrega').val() != -1 &&
                $('#ddlInfraestructura').val() != -1 && $('#ddlAutorizacion').val() != -1 && $('#ddlAutenticacion').val() != -1 && $('#ddlTipoDesarrollo').val() != -1 &&
                $('#ddlArquitectoNegocio').val() != -1 && $('#txtNombre').val() != "" && $('#txtDescripcion').val() != "" &&
                $('#txtExperto').val() != "" && $('#txtUnidad').val() != "" && $('#txtProveedorDesarrollo').val() != "" &&
                $('#ddlEntidades').val() != null && $('#ddlPCI').val() != null) { return true; }
            else return false;
        }
        else {
            if ($('#ddlGestionadoPor').val() != -1 && $('#ddlTipoImplementacion').val() != -1 && $('#ddlEstadoAplicacion').val() != -1 && $('#ddlModeloEntrega').val() != -1 &&
                $('#ddlInfraestructura').val() != -1 && $('#ddlAutorizacion').val() != -1 && $('#ddlAutenticacion').val() != -1 && $('#ddlTipoDesarrollo').val() != -1 &&
                $('#ddlEquipo').val() != -1 && $('#ddlArquitectoNegocio').val() != -1 && $('#txtNombre').val() != "" && $('#txtDescripcion').val() != "" &&
                $('#txtExperto').val() != "" && $('#txtUnidad').val() != "" && $('#txtProveedorDesarrollo').val() != "" &&
                $('#ddlEntidades').val() != null && $('#ddlPCI').val() != null) { return true; }
            else return false;
        }
    }
    else
        return false;
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
    //if ($("#formDesactivar").valid()) {

    let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
    //debugger;
    UploadFile3($("#flArchivo"), archivoId, false, id);
    //listarRegistros();
    //toastr.success("Registrado correctamente", TITULO_MENSAJE);

    //}
}

function descargarArchivo() {
    var AppId = $('#hdAplicacionId').val();
    DownloadFile3(AppId);
}

function obtenerGestionadoPor(id) {
    let gestionado = null;
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
    return gestionado;
}