var $table = $("#tblRegistros");
var $table2 = $("#tblRegistrosDetalle2");
var $tablePersonas = $("#tblPersonas");
var URL_API_VISTA = URL_API + "/Aplicacion/ConfiguracionPortafolio";
var URL_API_VISTA_DESCARGA = URL_API + "/Solicitud";
var DATA_EXPORTAR = {};
const TITULO_MENSAJE = "Confirmación";
const MENSAJE = "¿Estás seguro que deseas agregar esta función al rol seleccionado?";
const MENSAJE2 = "¿Estás seguro que deseas eliminar esta función del rol seleccionado?";
const MENSAJE3 = "¿Estás seguro que deseas modificar esta función del rol seleccionado?";
var Aministrador = 1;

var $idTabla = "";

var data = {};
//var OPCIONES = "";
//var OPCIONES2 = "";

$(function () {
    getCurrentUser();

    $('#ddlTribuAgregar').select2({
        dropdownParent: $('#modalAgregarRol')
    });
    $('.js-example-basic-single').select2();

    //if (USUARIO.UsuarioBCP_Dto.Perfil.includes("MDR_Owner_Tribu")) {
    //    CaptaTribuPorMatricula();
    //}

    validarFormApp();

    cargarCombos();
    cargarCombosFiltro();
    cargarCombosTribu();

    ListarRegistros();

    $("#btnAgregar").click(AgregarRol);
    $("#btnEditar").click(EditarRol);

    //if (USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_Administrador") || USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_MDR_OwnerProducto")) {
        ///OPCIONES = '<th data-formatter="opcionesFormatter" data-field="Opciones" data-halign="center" data-valign="middle" data-align="center" data-width="5%">Agregar</th>';
        //OPCIONES2 = '<th data-formatter="opciones2Formatter" data-field="Opciones" data-halign="center" data-valign="middle" data-align="center" data-width="5%">Opciones</th>';
    //}

    //if (USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_MDR_OwnerProducto"))
    //{
    //    $('.divFiltro').hide();
    //}

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        if (row.NroAlertasDetalle !== 0) {
            ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
            $idTabla = $('#tblRegistrosDetalle_' + row.Id);
            $idTabla.on('expand-row.bs.table', function (e, index, row, $detail) {
                if (row.NroAlertasDetalle !== 0) {
                    ListarAlertasDetalle2(row.Id, $('#tblRegistrosDetalle2_' + row.Id), $detail);
                } else {
                    $detail.empty().append("No existen registros.");
                }
            });
        } else {
            $detail.empty().append("No existen registros.");
        }
    });
    //InitAutocompletarEstandarBuilder($("#txtChapter"), $("#hdChapter"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");
    //InitAutocompletarEstandarBuilder2($("#txtFuncion"), $("#hdFuncion"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");


    //InitAutocompletarEstandarBuilderTribu($("#txtTribu"), $("#hdTribu"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");

    //InitAutocompletarEstandarBuilder3($("#txtChapter2"), $("#hdChapter2"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");
    //InitAutocompletarEstandarBuilder4($("#txtFuncion2"), $("#hdFuncion2"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");
    //InitAutocompletarEstandarBuilderTribu2($("#txtTribu2"), $("#hdTribu2"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");

    InitAutocompletarEstandarBuilderProducto($("#txtProducto"), $("#hdProd"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");



    //InitAutocompletarEstandarBuilderChapter($("#txtChapterF"), $("#hdChapterF"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");

    InitAutocompletarEstandarBuilderFuncion($("#txtFuncionF"), $("#hdFuncionF"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");

    //InitAutocompletarEstandarBuilderTribuFiltro($("#txtTribuF"), $("#hdTribuF"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");

    InitAutocompletarEstandarBuilderGrupoRed($("#txtGrupoRedF"), $("#hdGrupoRedF"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");

    InitAutocompletarEstandarBuilderRol($("#txtRolFiltro"), $("#ddlRolF"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetChapterByFiltro?filtro={0}");

    $("#ddlDominio").change(function () {
        Dominio_Id = $("#ddlDominio").val();
        CambioDominio(Dominio_Id)
    });

    $("#ddlTribus").change(function () {
        Tribus_Id = $("#ddlTribus").val();
        CambioTribus(Tribus_Id)
    });

    $("#ddlTribuAgregar").change(function () {
        var Tribu = $("#ddlTribuAgregar").val();
        CambioTribuAgregar(Tribu)
        var chapter = $("#ddlChapterAgregar").val();
        CambioChapterAgregar(chapter)

    });

    $("#ddlChapterAgregar").change(function () {
        var chapter = $("#ddlChapterAgregar").val();
        CambioChapterAgregar(chapter)

    });

    //$("#ddlFuncionAgregar").change(function () {
    //    $("#txtFuncion").val($("#ddlFuncionAgregar").val());


    //});

    $("#ddlTribuAgregar2").change(function () {
        var Tribu = $("#ddlTribuAgregar2").val();
        CambioTribuAgregar2(Tribu)
        var chapter = $("#ddlChapterAgregar2").val();
        CambioChapterAgregar2(chapter)
    });

    $("#ddlChapterAgregar2").change(function () {
        var chapter = $("#ddlChapterAgregar2").val();
        CambioChapterAgregar2(chapter)

    });

});

function CambioChapterAgregar2(TribusId) {
    let data = {};
    data.TribuId = TribusId;



    $.ajax({
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/RolesProductosChapterAgregar`,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Funcion, $("#ddlFuncionAgregar2"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.SubDominio, $("#ddlSubDominio"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

}


function CambioTribuAgregar2(TribusId) {
    let data = {};
    data.TribuId = TribusId;



    $.ajax({
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/RolesProductosTribusAgregar`,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Chapter, $("#ddlChapterAgregar2"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.SubDominio, $("#ddlSubDominio"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

}

function CambioChapterAgregar(TribusId) {
    let data = {};
    data.TribuId = TribusId;



    $.ajax({
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/RolesProductosChapterAgregar`,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Funcion, $("#ddlFuncionAgregar"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.SubDominio, $("#ddlSubDominio"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

}


function CambioTribuAgregar(TribusId) {
    let data = {};
    data.TribuId = TribusId;



    $.ajax({
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/RolesProductosTribusAgregar`,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Chapter, $("#ddlChapterAgregar"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.SubDominio, $("#ddlSubDominio"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

}


function CambioTribus(TribusId) {
    let data = {};
    data.TribuId = TribusId;

    $.ajax({
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/RolesProductosTribus`,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Squads, $("#ddlSquads"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.SubDominio, $("#ddlSubDominio"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

}


function CaptaTribuPorMatricula() {
    let data = {};

    $.ajax({
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/CaptaTribuMatricula`,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    CodigoTribu = dataObject;
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

}


function InitAutocompletarEstandarBuilderRol($searchBox, $IdBox, $container, urlController) {


    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Rol = request.term;



                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetRolByFiltro`,
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
                $IdBox.val(ui.item.Nombre);
                $("#ddlRolF").val(ui.item.RolId);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Nombre));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}


function cargarCombos() {

    var data = {};

    $.ajax({
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/RolesProductosCombo",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Dominio, $("#ddlDominio"), TEXTO_SELECCIONE);
                    SetItems([], $("#ddlSubDominio"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Tribus, $("#ddlTribus"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Squads, $("#ddlSquads"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}


function CambioDominio(DominioId) {

    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/RolesProductosComboDominio/${DominioId}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.SubDominio, $("#ddlSubDominio"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.SubDominio, $("#ddlSubDominio"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

}

function cargarCombosFiltro() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/FuncionesProductosComboConsolidado",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Roles, $("#ddlRolF"), TEXTO_SELECCIONE);

                    //SetItems(dataObject.SubDominio, $("#ddlSubDominio"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function cargarCombosTribu() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/FuncionesProductosComboTribu",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Tribu, $("#ddlTribuAgregar"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Tribu, $("#ddlTribuAgregar2"), TEXTO_SELECCIONE);

                    //SetItems(dataObject.SubDominio, $("#ddlSubDominio"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}


function InitAutocompletarEstandarBuilderGrupoRed($searchBox, $IdBox, $container, urlController) {


    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.GrupoRed = request.term;



                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetGrupoRedByFiltro`,
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
            $searchBox.val(ui.item.GrupoRed);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.GrupoRed);
                $("#hdGrupoRed").val(ui.item.GrupoRed);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.GrupoRed));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}

function InitAutocompletarEstandarBuilderTribuFiltro($searchBox, $IdBox, $container, urlController) {
    //let data = CrearObjAplicacion2();




    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Tribu = request.term;



                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetTribuByFiltro`,
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
            $searchBox.val(ui.item.Tribu);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Tribu);
                $("#ddlTribuAgregar").val(ui.item.Tribu);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Tribu + "</font></a>").appendTo(ul);
    };
}

function InitAutocompletarEstandarBuilderFuncion($searchBox, $IdBox, $container, urlController) {
    //let data = CrearObjAplicacion2();



    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Funcion = request.term;

                data.Chapter = "";

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetFuncionByFiltro`,
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
            $searchBox.val(ui.item.Funcion);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Funcion);
                $("#ddlFuncionAgregar").val(ui.item.Funcion);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Funcion));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}

function InitAutocompletarEstandarBuilderChapter($searchBox, $IdBox, $container, urlController) {
    //let data = CrearObjAplicacion2();




    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Chapter = request.term;

                data.Tribu = "";

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetChapterByFiltro`,
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
            $searchBox.val(ui.item.Chapter);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Chapter);
                $("#ddlChapterAgregar").val(ui.item.Chapter);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Chapter + "</font></a>").appendTo(ul);
    };
}


function validarFormApp() {
    $.validator.addMethod("existeFuncion", function (value, element) {
        let estado = true;

        let producto = $("#txtProductoDetalle").val();
        let rol = $("#txtRol").val();
        var chaptert = $("#ddlChapterAgregar").val();
        let funcion = $("#ddlFuncionAgregar").val();



        estado = !ExisteFuncion(chaptert, funcion, producto, rol);
        return estado;
    });

    $.validator.addMethod("existeFuncion2", function (value, element) {
        let estado = true;

        let producto = $("#txtProductoDetalle2").val();
        let rol = $("#txtRol2").val();
        let chapter = $("#ddlChapterAgregar2").val();
        let funcion = $("#ddlFuncionAgregar2").val();



        estado = !ExisteFuncion2(chapter, funcion, producto, rol);
        return estado;
    });



    $("#formEli").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlFuncionAgregar: {

                existeFuncion: true,
            }
        },
        messages: {
            ddlFuncionAgregar: {
                existeFuncion: "la función ingresada ya existe",

            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "ddlFuncionAgregar") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });



    $("#formEli2").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlFuncionAgregar2: {
                existeFuncion2: true
            }
        },
        messages: {
            ddlFuncionAgregar2: {

                existeFuncion2: "El función ingresada ya existe",

            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "ddlFuncionAgregar2") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}


function ExisteFuncion(chapter, funcion, producto, rol) {
    let estado = false;
    let data = {};

    data.Producto = $("#txtProductoDetalle").val();
    data.Rol = $("#txtRol").val();
    data.Chapter = $("#ddlChapterAgregar").val();
    data.Funcion = $("#ddlFuncionAgregar").val();


    $.ajax({

        url: URL_API_VISTA + `/existsFuncionEnRol`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
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

function ExisteFuncion2(chapter, funcion, producto, rol) {
    let estado = false;
    let data = {};

    data.Producto = $("#txtProductoDetalle2").val();
    data.Rol = $("#txtRol2").val();
    data.Chapter = $("#ddlChapterAgregar2").val();
    data.Funcion = $("#ddlFuncionAgregar2").val();


    $.ajax({

        url: URL_API_VISTA + `/existsFuncionEnRol`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
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



function InitAutocompletarEstandarBuilderProducto($searchBox, $IdBox, $container, urlController) {
    //let data = CrearObjAplicacion2();


    data.Producto = $("#txtProducto").val();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Producto = request.term;
                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetProductoByFiltro`,
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
                $IdBox.val(ui.item.Nombre);
                $("#hdProd").val(ui.item.Nombre);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Nombre));
        a.style.display = 'block';
        a.append(font);
        return $("<li>").append(a).appendTo(ul);
    };
}

function ExportarInfo() {

    //if ($("#ddlReporte").val() == 1) {

    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return;
    }

    DATA_EXPORTAR = {};

    //DATA_EXPORTAR.Chapter = $("#txtChapterF").val();
    DATA_EXPORTAR.Funcion = $("#txtFuncionF").val();
    DATA_EXPORTAR.Tribu = $("#ddlTribus").val();
    DATA_EXPORTAR.GrupoRed = $("#txtGrupoRedF").val();
    DATA_EXPORTAR.Producto = $("#txtProducto").val();
    DATA_EXPORTAR.Rol = $("#ddlRolF").val();
    DATA_EXPORTAR.Dominio = $("#ddlDominio").val();
    DATA_EXPORTAR.SubDominio = $("#ddlSubDominio").val();

    DATA_EXPORTAR.sortName = 'Tribu';
    DATA_EXPORTAR.sortOrder = 'asc';

    //if (USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_MDR_OwnerProducto")) { // Imprime solo algunos

    //    DATA_EXPORTAR.Chapter = "";
    //    DATA_EXPORTAR.Funcion = "";
    //    DATA_EXPORTAR.sortName = 'Tribu';
    //    let url = `${URL_API_VISTA}/ExportarFunciones3?funcion=${encodeURIComponent(DATA_EXPORTAR.Funcion)}&matricula=${USUARIO.UsuarioBCP_Dto.Matricula}&dominioId=${DATA_EXPORTAR.Dominio}&subdominioId=${DATA_EXPORTAR.SubDominio}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
    //    window.location.href = url;
    //}
    //else  // Imprime todos
    //{
        let url = `${URL_API_VISTA}/ExportarFunciones3Admin?funcion=${encodeURIComponent(DATA_EXPORTAR.Funcion)}&tribu=${DATA_EXPORTAR.Tribu}&grupoRed=${DATA_EXPORTAR.GrupoRed}&producto=${DATA_EXPORTAR.Producto}&rol=${DATA_EXPORTAR.Rol}&dominioId=${DATA_EXPORTAR.Dominio}&subdominioId=${DATA_EXPORTAR.SubDominio}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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
    //}
}

function ExportarInfoPersona() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return;
    }

    DATA_EXPORTAR = {};

    var Funcion = $("#txtFuncionF").val();
    var Tribu = $("#ddlTribus").val();
    var GrupoRed = $("#txtGrupoRedF").val();
    var Producto = $("#txtProducto").val();
    var Rol = $("#ddlRolF").val();
    var Dominio = $("#ddlDominio").val();
    var SubDominio = $("#ddlSubDominio").val();

    DATA_EXPORTAR.sortName = 'Tribu';
    DATA_EXPORTAR.sortOrder = 'asc';

    //if (USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_MDR_OwnerProducto")) {

    //    let url = `${URL_API_VISTA}/ExportarFuncionesPersonas?Producto=${Producto}&matricula=${matricula}&dominioId=${Dominio}&subdominioId=${SubDominio}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
    //    window.location.href = url;
    //}
    //else
    //{
    let url = `${URL_API_VISTA}/ExportarFuncionesPersonas2AdminFP?funcion=${encodeURIComponent(Funcion)}&tribu=${Tribu}&grupoRed=${GrupoRed}&producto=${Producto}&rol=${Rol}&dominioId=${Dominio}&subdominioId=${SubDominio}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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
    //}
}


function InitAutocompletarEstandarBuilder($searchBox, $IdBox, $container, urlController) {
    //let data = CrearObjAplicacion2();


    data.Chapter = $("#ddlChapterAgregar").val();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Chapter = request.term;

                data.Tribu = $("#ddlTribuAgregar").val();

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetChapterByFiltro`,
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
            $searchBox.val(ui.item.Chapter);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Chapter);
                $("#ddlChapterAgregar").val(ui.item.Chapter);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Chapter + "</font></a>").appendTo(ul);
    };
}

function CrearObjAplicacion2() {
    var data = {};
    data.Chapter = $("#ddlChapterAgregar").val();


    return data;
}
function InitAutocompletarEstandarBuilder2($searchBox, $IdBox, $container, urlController) {
    let data = CrearObjAplicacion3();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Funcion = request.term;
                data.Chapter = $("#ddlChapterAgregar").val();
                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetFuncionByFiltro`,
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
            $searchBox.val(ui.item.Funcion);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Funcion);
                $("#ddlFuncionAgregar").val(ui.item.Funcion);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Funcion + "</font></a>").appendTo(ul);
    };
}

function CrearObjAplicacion3() {
    var data2 = {};
    data2.Funcion = $("#ddlFuncionAgregar").val();
    data2.Chapter = $("#ddlChapterAgregar").val();


    return data2;
}

function InitAutocompletarEstandarBuilder3($searchBox, $IdBox, $container, urlController) {
    let data = CrearObjAplicacion4();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Chapter = request.term;
                data.Tribu = $("#ddlTribuAgregar2").val();
                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetChapterByFiltro`,
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
            $searchBox.val(ui.item.Chapter);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Chapter);
                $("#ddlChapterAgregar2").val(ui.item.Chapter);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Chapter + "</font></a>").appendTo(ul);
    };
}

function CrearObjAplicacion4() {
    var data3 = {};
    data3.Chapter = $("#ddlChapterAgregar2").val();


    return data3;
}

function InitAutocompletarEstandarBuilder4($searchBox, $IdBox, $container, urlController) {
    let data = CrearObjAplicacion5();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                data.Funcion = request.term;
                data.Chapter = $("#ddlChapterAgregar2").val();
                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetFuncionByFiltro`,
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
            $searchBox.val(ui.item.Funcion);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Funcion);
                $("#ddlFuncionAgregar2").val(ui.item.Funcion);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Funcion + "</font></a>").appendTo(ul);
    };
}

function CrearObjAplicacion5() {
    var data4 = {};
    data4.Funcion = $("#ddlFuncionAgregar2").val();
    data4.Chapter = $("#ddlChapterAgregar2").val();


    return data4;
}



function InitAutocompletarEstandarBuilderTribu($searchBox, $IdBox, $container, urlController) {
    let data = CrearObjAplicacionTribu();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Tribu = request.term;

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetTribuByFiltro`,
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
            $searchBox.val(ui.item.Tribu);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Tribu);
                $("#ddlTribuAgregar").val(ui.item.Tribu);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Tribu + "</font></a>").appendTo(ul);
    };
}

function CrearObjAplicacionTribu() {
    var data10 = {};
    data10.Tribu = $("#ddlTribuAgregar").val();

    return data10;
}

function InitAutocompletarEstandarBuilderTribu2($searchBox, $IdBox, $container, urlController) {
    let data = CrearObjAplicacionTribu2();

    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                //let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Tribu = request.term;

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_VISTA + `/GetTribuByFiltro`,
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
            $searchBox.val(ui.item.Tribu);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Tribu);
                $("#ddlTribuAgregar2").val(ui.item.Tribu);


            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.Tribu + "</font></a>").appendTo(ul);
    };
}

function CrearObjAplicacionTribu2() {
    var data11 = {};
    data11.Tribu = $("#ddlTribuAgregar2").val();

    return data11;
}


//function cargarCombos() {
//    $.ajax({
//        type: "GET",
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
//        url: URL_API_VISTA + "/RolesProductosCombo",
//        dataType: "json",
//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    SetItems(dataObject.Dominio, $("#ddlDominio"), TEXTO_SELECCIONE);
//                    SetItems(dataObject.SubDominio, $("#ddlSubDominio"), TEXTO_SELECCIONE);
//                }

//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//}



function EditarRol() {
    let data = {};
    data.FuncionProductoId = $("#hdFuncionId").val();
    data.Chapter = $("#ddlChapterAgregar2").val();
    data.Funcion = $("#ddlFuncionAgregar2").val();
    data.Tribu = $("#ddlTribuAgregar2").val();

    if ($("#formEli2").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE3,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/EditarFuncion`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(data),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se editó la función correctamente", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {

                            $("#btnEditar").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalEditarRol"), false);


                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
            }
        });
    }
}

function AgregarRol() {
    let data = {};
    data.RolProductoId = $("#hdRolProductoId").val();
    data.Chapter = $("#ddlChapterAgregar").val();
    data.Funcion = $("#ddlFuncionAgregar").val();
    data.Tribu = $("#ddlTribuAgregar").val();
    if ($("#formEli").valid()) {

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/AgregarFuncion`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(data),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se agregó la función al rol correctamente", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {

                            $("#btnAgregar").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalAgregarRol"), false);


                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
            }
        });
    }
}

function ListarRegistros() {
    if ($("#txtRolFiltro").val() == '') { $("#ddlRolF").val(-1); }
    //if (USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_MDR_OwnerProducto")) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            locale: 'es-SP',
            url: URL_API_VISTA + "/Productos",
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
                DATA_EXPORTAR.Producto = $("#txtProducto").val();
                DATA_EXPORTAR.DominioId = $("#ddlDominio").val();
                DATA_EXPORTAR.SubDominioId = $("#ddlSubDominio").val();
                DATA_EXPORTAR.TribuId = $("#ddlTribus").val();
                DATA_EXPORTAR.SquadId = $("#ddlSquads").val();
                DATA_EXPORTAR.Rol = $("#txtRolFiltro").val();
                DATA_EXPORTAR.GrupoRed = $("#txtGrupoRedF").val();
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
    //}
    //else {
    //    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    //    $table.bootstrapTable('destroy');
    //    $table.bootstrapTable({
    //        locale: 'es-SP',
    //        url: URL_API_VISTA + "/ProductosAdmin",
    //        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
    //        method: 'POST',
    //        pagination: true,
    //        sidePagination: 'server',
    //        queryParamsType: 'else',
    //        pageSize: REGISTRO_PAGINACION,
    //        pageList: OPCIONES_PAGINACION,
    //        sortName: 'Nombre',
    //        sortOrder: 'asc',
    //        queryParams: function (p) {
    //            DATA_EXPORTAR = {};
    //            DATA_EXPORTAR.Producto = $("#txtProducto").val();
    //            DATA_EXPORTAR.DominioId = $("#ddlDominio").val();
    //            DATA_EXPORTAR.SubDominioId = $("#ddlSubDominio").val();
    //            DATA_EXPORTAR.TribuId = $("#ddlTribus").val();
    //            DATA_EXPORTAR.SquadId = $("#ddlSquads").val();
    //            DATA_EXPORTAR.Funcion = $("#txtFuncionF").val();
    //            DATA_EXPORTAR.RolProductoId = $("#ddlRolF").val();

    //            DATA_EXPORTAR.GrupoRed = $("#txtGrupoRedF").val();
    //            DATA_EXPORTAR.pageNumber = p.pageNumber;
    //            DATA_EXPORTAR.pageSize = p.pageSize;
    //            DATA_EXPORTAR.sortName = p.sortName;
    //            DATA_EXPORTAR.sortOrder = p.sortOrder;
    //            DATA_EXPORTAR.Perfil = USUARIO.UsuarioBCP_Dto.Perfil;

    //            return JSON.stringify(DATA_EXPORTAR);
    //        },
    //        responseHandler: function (res) {
    //            waitingDialog.hide();
    //            var data = res;
    //            return { rows: data.Rows, total: data.Total };
    //        },
    //        onLoadError: function (status, res) {
    //            waitingDialog.hide();
    //            bootbox.alert("Se produjo un error al listar los registros");
    //        },
    //        onSort: function (name, order) {
    //            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    //        },
    //        onPageChange: function (number, size) {
    //            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    //        }
    //    });
    //}
}

function RefrescarListado() {
    ListarRegistros();
}


function detailFormatter(index, row) {
    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-unique-id="Id" data-mobile-responsive="true" data-check-on-init="true" data-detail-view="true" data-pagination="true" data-detail-formatter="detailFormatter2"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="5%">#</th>\
                                    <th data-field="Producto" data-halign="center" data-valign="middle" data-align="left" data-width="30%" data-visible="false">Producto</th>\
                                    <th data-field="Rol" data-halign="center" data-valign="middle" data-align="left" data-width="25%">Rol</th>\
                                    <th data-field="GrupoRed" data-halign="center" data-valign="middle" data-align="left" data-width="25%">Grupo de Red</th>\
                                    <th data-field="Descripcion" data-halign="center" data-valign="middle" data-align="left" data-width="25%">Descripción</th>\
                                    <th data-field="FuncionesRelacionadas" data-halign="center" data-valign="middle" data-align="left" data-width="10%">Funciones Relacionadas</th>\
                                 </tr>\
                            </thead>\
                        </table>', row.Id);
    return html;
}

function detailFormatter2(index, row) {
    //var html = String.Format('<table id="tblRegistrosDetalle2_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
    //                        <thead>\
    //                            <tr>\
    //                                <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="10%">#</th>\
    //        <th data-field="Producto" data-halign="center" data-valign="middle" data-align="left" data-width="30%" data-visible="false">Producto</th>\
    //                                <th data-field="Chapter" data-halign="center" data-valign="middle" data-align="left" data-width="30%">Tribu/Chapter/Unit</th>\
    //                                 <th data-formatter="funcionesFormatter" data-field="Funcion" data-halign="center" data-valign="middle" data-align="left" data-width="30%">Funcion</th>'
    //    + OPCIONES2 +
    //    ' </tr>\
    //                        </thead>\
    //                    </table>', row.Id);

    var html = String.Format('<table id="tblRegistrosDetalle2_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="10%">#</th>\
                                    <th data-field="Producto" data-halign="center" data-valign="middle" data-align="left" data-width="30%" data-visible="false">Producto</th>\
                                    <th data-field="Chapter" data-halign="center" data-valign="middle" data-align="left" data-width="30%">Tribu/Chapter/Unit</th>\
                                    <th data-formatter="funcionesFormatter" data-field="Funcion" data-halign="center" data-valign="middle" data-align="left" data-width="30%">Funcion</th>\
                                 </tr>\
                            </thead>\
                        </table>', row.Id);

    return html;
}


function funcionesFormatter(value, row, index) {


    let option = value;
    option = `<a href="javascript:VerPersonas('${row.Funcion}','${row.Chapter}')" title="Ver personas relacionadas">${value}</a>`;
    return option;

}

function VerPersonas(funcion, chapter) {
    OpenCloseModal($("#modalPersonas"), true);

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tablePersonas.bootstrapTable('destroy');
    $tablePersonas.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/PersonasFunciones",
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
            DATA_EXPORTAR.Chapter = chapter;
            DATA_EXPORTAR.Funcion = funcion;
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

function opcionesFormatter(value, row, index) {

    if (userCurrent.Perfil.includes("E195_Administrador") || userCurrent.Perfil.includes("E195_MDR_OwnerProducto")) {
        let btnConfirmar = `<a href="javascript:irAgregar2(${row.Id},'${row.Rol}','${row.GrupoRed}','${row.Producto}')" title="Agregar una nueva función para este rol"><i class="iconoVerde glyphicon glyphicon-plus"></i></a>`;

        return btnConfirmar;
    }
    else return "";


}

function opciones2Formatter(value, row, index) {

    if (userCurrent.Perfil.includes("E195_Administrador") || userCurrent.Perfil.includes("E195_MDR_OwnerProducto")) {
        let btnConfirmar = `<a href="javascript:irEditar(${row.Id},'${row.Producto}')" title="Editar esta funcion del rol"><i class="iconoVerde glyphicon glyphicon-pencil"></i></a>`;
        let btnObservar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar esta funcion del rol"><i class="iconoRojo glyphicon glyphicon-trash"></i></a>`;

        return btnConfirmar.concat("&nbsp;&nbsp;", btnObservar);
        //return btnConfirmar;
    }
    else return "";


}

function irAgregar2(id, Rol, GrupoRed, Producto) {
    $("#hdRolProductoId").val(id);
    $("#txtRol").val(Rol);
    $("#txtGrupoRed").val(GrupoRed);
    $("#txtProductoDetalle").val(Producto);
    cargarCombosTribu();
    $("#ddlChapterAgregar").val("");
    $("#ddlFuncionAgregar").val("");
    SetItems([], $("#ddlChapterAgregar"), TEXTO_SELECCIONE);
    SetItems([], $("#ddlFuncionAgregar"), TEXTO_SELECCIONE);
    //$("#ddlTribuAgregar").val("");

    //$("#ddlChapterAgregar").val("");
    //$("#ddlFuncionAgregar").val("");
    //$("#ddlTribuAgregar").val("");

    //$("#ddlChapterAgregar").val("").trigger('change');
    //$("#ddlFuncionAgregar").val("").trigger('change');
    //$("#ddlTribuAgregar").val("-1").trigger('change');
    //LimpiarModal();
    OpenCloseModal($("#modalAgregarRol"), true);
}

function irAgregar(id, nombre) {
    $("#hdProductoId").val(id);
    $("#txtProducto2").val(nombre);
    $("#txtFuncion").val("");
    LimpiarModal();
    OpenCloseModal($("#modalAgregarRol"), true);
}

function LimpiarModal() {
    $("#txtRol").val("");
    $("#txtGrupoRed").val("");
}

function irEliminar(id) {
    EliminarRol(id);

}

function irEditar(id, Producto) {
    $("#hdFuncionId").val(id);
    $("#txtProductoDetalle2").val(Producto);
    ObtenerDetalleRol(id);
    OpenCloseModal($("#modalEditarRol"), true);

}


function EliminarRol(id) {
    let data = {};
    data.RolProductoId = id;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE2,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/EliminarFuncion`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {

                                toastr.success("Se eliminó la función del rol correctamente", TITULO_MENSAJE);
                                RefrescarListado();
                            }
                        }
                    },
                    complete: function (data) {

                        //$("#btnAgregar").button("reset");
                        waitingDialog.hide();
                        //OpenCloseModal($("#modalAgregarRol"), false);


                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    }
                });
            }
        }
    });
}

function ObtenerDetalleRol(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        //url: URL_API_VISTA + `/application/GetFullDetail/${Id}`,
        url: URL_API_VISTA + `/ObtenerFuncion/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;


                    $("#txtRol2").val(data.Rol);
                    $("#txtGrupoRed2").val(data.GrupoRed);
                    //$("#ddlTribuAgregar2").val(data.Tribu);
                    $("#ddlTribuAgregar2").val(data.Tribu).trigger('change');
                    var Tribu = $("#ddlTribuAgregar2").val();
                    CambioTribuAgregar2(Tribu);
                    $("#ddlChapterAgregar2").val(data.Chapter).trigger('change');
                    var chapter = $("#ddlChapterAgregar2").val();
                    CambioChapterAgregar2(chapter);
                    $("#ddlFuncionAgregar2").val(data.Funcion).trigger('change');
                    //$("#ddlChapterAgregar2").val(data.Chapter);
                    //$("#ddlFuncionAgregar2").val(data.Funcion);

                    //$("#hdChapter2").val(data.Chapter);
                    //$("#hdFuncion2").val(data.Funcion);
                    //$("#hdTribu2").val(data.Tribu);




                }
            }
        },
        complete: function () {

        },
        error: function (result) {
            alert(result.responseText);
        },
        async: true
    });

}

//function opcionesBitacora(value, row, index) {
//    let botonDescargar = "";

//    if (row.NombreArchivo != '' && row.NombreArchivo != null) {
//        botonDescargar = `<a href="javascript:DownloadFileBitacora(${row.Id})" title="Descargar archivo"><i class="iconoVerde glyphicon glyphicon-download"></i></a>`;
//        return botonDescargar;
//    }
//    else
//        return "-";
//}

function DownloadFileBitacora(id) {
    let retorno;
    let url = `${URL_API_VISTA_DESCARGA}/DownloadArchivoBitacora?id=${id}`;

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/octetstream",
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

function formatoFecha(value, row, index) {
    if (value == null)
        return "-";
    else
        return moment(value).format('DD/MM/YYYY HH:mm:ss');
}

function ListarAlertasDetalle(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado/DetalleProductosRoles",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Rol',
        sortOrder: 'desc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.ProductoId = id;
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

function ListarAlertasDetalle2(id, $table, $detail) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado/DetalleFuncionesProductosRoles",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Chapter',
        sortOrder: 'desc',
        queryParams: function (p) {
            PARAMS_API = {};
            PARAMS_API.ProductoId = id;
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