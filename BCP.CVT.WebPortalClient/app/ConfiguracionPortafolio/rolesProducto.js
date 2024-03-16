var $table = $("#tblRegistros");
var $tableFunciones = $("#tblFunciones");
var URL_API_VISTA = URL_API + "/Aplicacion/ConfiguracionPortafolio";
var URL_API_VISTA_DESCARGA = URL_API + "/Solicitud";
var DATA_EXPORTAR = {};
const TITULO_MENSAJE = "Confirmación";
const MENSAJE = "¿Está seguro que desea agregar este rol al producto seleccionado?";
const MENSAJE2 = "¿Está seguro que desea eliminar este rol del producto seleccionado?";
const MENSAJE3 = "¿Está seguro que desea modificar este rol del producto seleccionado?";
const MENSAJE4 = "¿Está seguro que desea enviar la solicitud ingresada?";
const MENSAJE5 = "¿Está seguro que desea eliminar esta función del rol seleccionado?";
const MENSAJE6 = "Se registrará una solicitud para la aprobación de creación de roles/funciones y otra para la aprobación de eliminación de roles/funciones ¿Está seguro de proceder?";
const MENSAJE7 = "Todo rol debe tener una función asignada, deberá agregar nuevas funciones. ¿Está seguro de continuar?";
const MENSAJE8 = "¿Está seguro que desea agregar esta función al rol seleccionado?";
var data = {};
var Aministrador = 1;
var OPCIONES = "";
var OPCIONES2 = "";
var Owner_Tribu = 18;
var CodigoTribu = "";

var $tblAmbientes = $("#tbl-ambientes");
var $tblAmbientesEditar = $("#tbl-ambientesEditar");
var LIST_AMBIENTES_EDITAR = [];

var $tblAmbientesListar = $("#tbl-ambientesListar");

$(function () {

    InitAutocompletarProductoSearch($("#txtProducto"), $("#hdProd"), ".searchProductoContainer");
    validarFormApp();
    cargarCombos();
    ListarRegistros();
    InitMultiSelect();

    $("#btnAgregar").click(AgregarRol);
    $("#btnAgregarFuncion").click(AgregarFuncion);
    $("#btnCerrarFunciones").click(CerrarFunciones);

    $("#btnEditar").click(EditarRol);

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        if (row.NroAlertasDetalle !== 0) {
            ListarAlertasDetalle(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
        } else {
            $detail.empty().append("No existen registros.");
        }
    });

    $("#ddlDominio").change(function () {
        Dominio_Id = $("#ddlDominio").val();
        CambioDominio(Dominio_Id)
    });


    $("#ddlTribus").change(function () {
        Tribus_Id = $("#ddlTribus").val();
        CambioTribus(Tribus_Id)
    });

    // Modal para agregar función por rol
    $('#ddlTribuAgregar').select2({
        dropdownParent: $('#modalAgregarFuncion')
    });
    //$('.js-example-basic-single').select2();

    $("#ddlTribuAgregar").change(function () {
        var Tribu = $("#ddlTribuAgregar").val();
        CambioTribuAgregar(Tribu);
        var chapter = $("#ddlChapterAgregar").val();
        CambioChapterAgregar(Tribu, chapter);

    });

    $("#ddlChapterAgregar").change(function () {
        var Tribu = $("#ddlTribuAgregar").val();
        var chapter = $("#ddlChapterAgregar").val();
        CambioChapterAgregar(Tribu, chapter);

    });

    // Modal para enviar solicitudes
    $('#ddlSeguridadAgregar').select2({
        dropdownParent: $('#modalEnviarSolicitud')
    });
    $('.js-example-basic-single').select2();

    $("#btnEnviar").click(EnviarSolicitud);
    $("#btnEnviar2").click(EnviarSolicitud2);
    $("#btnEnviar3").click(EnviarSolicitudEliminar);
    $("#btnEnviar4").click(EnviarSolicitudEliminar2);

    //$("#chkNoAplica").change(function () {
    //    if ($(this).prop('checked')) {
    //        console.log("Checked Box Selected");
    //        $("#txtGrupoRed").val('');
    //        $("#txtGrupoRed").prop('disabled', true);
    //    } else {
    //        console.log("Checked Box deselect");
    //        $("#txtGrupoRed").prop('disabled', false);
    //    }
    //});
    //$("#chkNoAplica_Editar").change(function () {
    //    if ($(this).prop('checked')) {
    //        console.log("Checked Box Selected");
    //        $("#txtGrupoRed3").val('');
    //        $("#txtGrupoRed3").prop('disabled', true);
    //    } else {
    //        console.log("Checked Box deselect");
    //        $("#txtGrupoRed3").prop('disabled', false);
    //    }
    //});

    $("#ddlAmbienteAgregar").change(function () {
        $tblAmbientes.bootstrapTable('destroy').bootstrapTable();
        let valuesAmbiente = $('#ddlAmbienteAgregar option:selected').toArray().map(item => item.value);
        for (var i = 0; i < valuesAmbiente.length; i++) {
            $tblAmbientes.bootstrapTable("append", {
                Id: valuesAmbiente[i],
                AmbienteId: valuesAmbiente[i],
                Ambiente: {
                    Id: valuesAmbiente[i],
                    Nombre: $("#ddlAmbienteAgregar option[value='" + valuesAmbiente[i] + "']").text()
                }
            });
        }
    });
    $("#ddlAmbienteEditar").change(function () {
        $tblAmbientesEditar.bootstrapTable('destroy').bootstrapTable();
        let valuesAmbienteEditar = $('#ddlAmbienteEditar option:selected').toArray().map(item => item.value);

        for (var i = 0; i < valuesAmbienteEditar.length; i++) {
            $tblAmbientesEditar.bootstrapTable("append", {
                Id: valuesAmbienteEditar[i],
                AmbienteIdEditar: valuesAmbienteEditar[i],
                AmbienteEditar: {
                    Id: valuesAmbienteEditar[i],
                    Nombre: $("#ddlAmbienteEditar option[value='" + valuesAmbienteEditar[i] + "']").text()
                }
            });
        }
        if (LIST_AMBIENTES_EDITAR.length > 0) {
            for (var i = 0; i < LIST_AMBIENTES_EDITAR.length; i++) {
                $("#txtGrupoRedEditar_" + LIST_AMBIENTES_EDITAR[i].Ambiente + "").val(LIST_AMBIENTES_EDITAR[i].GrupoRed);

                if (LIST_AMBIENTES_EDITAR[i].GrupoRed == '') {
                    $("#chkNoAplicaEditar_" + LIST_AMBIENTES_EDITAR[i].Ambiente).prop('checked', true);
                    $("#txtGrupoRedEditar_" + LIST_AMBIENTES_EDITAR[i].Ambiente).prop('disabled', true);
                }
            }
        }
    });
});

function handleChange(e) {
    var checkbox = e.target;
    const myArray = checkbox.id.split("_");
    let nro = myArray[1];
    if (checkbox.checked) {
        //Checkbox has been checked
        $("#txtGrupoRed_" + nro).val('');
        $("#txtGrupoRed_" + nro).prop('disabled', true);
        $("#lblGrupoRed_" + nro).css("display", "none");
    } else {
        //Checkbox has been unchecked
        $("#txtGrupoRed_" + nro).prop('disabled', false);
    }
}
function handleChangeEditar(e) {
    var checkbox = e.target;
    const myArray = checkbox.id.split("_");
    let nro = myArray[1];
    if (checkbox.checked) {
        //Checkbox has been checked
        $("#txtGrupoRedEditar_" + nro).val('');
        $("#txtGrupoRedEditar_" + nro).prop('disabled', true);
        $("#lblGrupoRedEditar_" + nro).css("display", "none");
    } else {
        //Checkbox has been unchecked
        $("#txtGrupoRedEditar_" + nro).prop('disabled', false);
    }
}
function ChangeGrupoRed(e) {
    var texto = e.target;
    const myArray = texto.id.split("_");
    let nro = myArray[1];
    $("#lblGrupoRed_" + nro).css("display", "none");
}
function ChangeGrupoRedEditar(e) {
    var texto = e.target;
    const myArray = texto.id.split("_");
    let nro = myArray[1];
    $("#lblGrupoRedEditar_" + nro).css("display", "none");
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


function validarFormApp() {
    $.validator.addMethod("existeRol", function (value, element) {
        let estado = true;
        let id = $("#hdProductoId").val();
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteRol(valor, id);
            return estado;
        }
        return estado;
    });
    $.validator.addMethod("existeRol2", function (value, element) {
        let estado = true;
        let id = $("#hdProductoId").val();
        let rolid = $("#hdRolProductoId").val();
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteRol2(valor, id, rolid);
            return estado;
        }
        return estado;
    });
    $.validator.addMethod("existeGrupoRed", function (value, element) {
        let estado = true;
        let id = $("#hdProductoId").val();
        let rolid = $("#hdRolProductoId").val();
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteGrupoRed(valor, id, rolid);
            return estado;
        }
        return estado;
    });
    $.validator.addMethod("existeGrupoRed2", function (value, element) {
        let estado = true;
        let id = $("#hdProductoId").val();
        let rolid = $("#hdRolProductoId").val();
        let valor = $.trim(value);
        if (valor !== "" && valor.length > 2) {
            estado = !ExisteGrupoRed2(valor, id, rolid);
            return estado;
        }
        return estado;
    });
    $.validator.addMethod("existeFuncion", function (value, element) {
        let estado = true;

        let producto = $("#txtProductoDetalle").val();
        let rol = $("#txtRol4").val();
        var chaptert = $("#ddlChapterAgregar").val();
        let funcion = $("#ddlFuncionAgregar").val();

        estado = !ExisteFuncion(chaptert, funcion, producto, rol);
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
            txtRol: {
                requiredSinEspacios: true,
                existeRol: true,
                maxlength: '300'
            },
            txtDescripcion: {
                requiredSinEspacios: true,
                maxlength: '500'
            },
            ddlTipoCuentaAgregar: {
                requiredSelect: true
            }
            //txtGrupoRed: {
            //    existeGrupoRed: true,
            //    requiredSinEspacios: true,
            //}
        },
        messages: {
            txtRol: {
                requiredSinEspacios: "Debe ingresar un rol",
                existeRol: "El rol ingresado ya existe",
                maxlength: "Por favor, no introduzca más de 300 caracteres."
            },
            txtDescripcion: {
                requiredSinEspacios: "Debe ingresar una descripción para el rol",
                maxlength: "Por favor, no introduzca más de 500 caracteres."
            },
            ddlTipoCuentaAgregar: {
                requiredSelect: String.Format("Debe seleccionar {0}.", "un tipo de cuenta")
            }
            //txtGrupoRed: {
            //    existeGrupoRed: "El grupo de red ingresado ya existe",
            //    requiredSinEspacios: "Debe ingresar un grupo de red",
            //}
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtRol") {// || element.attr('name') === "txtGrupoRed") {
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
            txtRol3: {
                requiredSinEspacios: true,
                existeRol2: true,
                maxlength: '300'
            },
            txtDescripcion2: {
                requiredSinEspacios: true,
                maxlength: '500'
            },
            ddlTipoCuentaEditar: {
                requiredSelect: true
            }
            //txtGrupoRed3: {
            //    existeGrupoRed2: true,
            //}
        },
        messages: {
            txtRol3: {
                requiredSinEspacios: "Debe ingresar un rol",
                existeRol2: "El rol ingresado ya existe",
                maxlength: "Por favor, no introduzca más de 300 caracteres."
            },
            txtDescripcion2: {
                requiredSinEspacios: "Debe ingresar una descripción para el rol",
                maxlength: "Por favor, no introduzca más de 500 caracteres."
            },
            ddlTipoCuentaEditar: {
                requiredSelect: String.Format("Debe seleccionar {0}.", "un tipo de cuenta")
            }
            //txtGrupoRed3: {
            //    existeGrupoRed2: "El grupo de red ingresado ya existe"
            //}
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtRol3") {// || element.attr('name') === "txtGrupoRed3") {
                // element.parent().parent().append(error);
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });

    $("#formEli3").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            ddlTribuAgregar: {
                requiredSelect: true
            },
            ddlChapterAgregar: {
                requiredSelect: true
            },
            ddlFuncionAgregar: {
                existeFuncion: true,
                requiredSelect: true
            }
        },
        messages: {
            ddlTribuAgregar: {
                requiredSelect: String.Format("Debe seleccionar {0}.", "una tribu")
            },
            ddlChapterAgregar: {
                requiredSelect: String.Format("Debe seleccionar {0}.", "un chapter")
            },
            ddlFuncionAgregar: {
                existeFuncion: "la función ingresada ya existe",
                requiredSelect: String.Format("Debe seleccionar {0}.", "una función")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "ddlFuncionAgregar") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });

    $("#formEnvSolicitud").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtOwner: {
                requiredSinEspacios: true
            },
            ddlSeguridadAgregar: {
                requiredSelect: true
            }
        },
        messages: {
            txtOwner: {
                requiredSinEspacios: String.Format("El producto seleccionado debe tener {0}.", "un owner"),
            },
            ddlSeguridadAgregar: {
                requiredSelect: String.Format("Debe seleccionar {0}.", "al analista de seguridad")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "ddlSeguridadAgregar") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });

    $("#formEnvSolicitud2").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtOwner2: {
                requiredSinEspacios: true
            },
            txtSeguridad2: {
                requiredSinEspacios: true
            },
            ddlSolicitud: {
                requiredSelect: true
            }
        },
        messages: {
            txtOwner2: {
                requiredSinEspacios: String.Format("El producto seleccionado debe tener {0}.", "un owner"),
            },
            txtSeguridad2: {
                requiredSinEspacios: String.Format("El producto seleccionado debe tener {0}.", "un analista de seguridad"),
            },
            ddlSolicitud: {
                requiredSelect: String.Format("Debe seleccionar {0}.", "el número de solicitud")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "ddlSolicitud") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });

    $("#formEnvSolicitud3").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtOwner3: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtOwner3: {
                requiredSinEspacios: String.Format("El producto seleccionado debe tener {0}.", "un owner"),
            }
        }
    });

    $("#formEnvSolicitud4").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtOwner4: {
                requiredSinEspacios: true
            },
            ddlSolicitud2: {
                requiredSelect: true
            }
        },
        messages: {
            txtOwner4: {
                requiredSinEspacios: String.Format("El producto seleccionado debe tener {0}.", "un owner"),
            },
            ddlSolicitud2: {
                requiredSelect: String.Format("Debe seleccionar {0}.", "el número de solicitud")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "ddlSolicitud2") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}


function ExisteRol(valor, prod) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/existsRolNuevo?id=${valor}&prod=${prod}`,
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

function ExisteRol2(valor, prod, rolid) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/existsRol?id=${valor}&prod=${prod}&rolid=${rolid}`,
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

function ExisteGrupoRed(valor, prod) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/existsGrupoRedNuevo?id=${valor}&prod=${prod}`,
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


function ExisteGrupoRed2(valor, prod, rolid) {
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/existsGrupoRed?id=${valor}&prod=${prod}&rolid=${rolid}`,
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

function ExisteFuncion(chapter, funcion, producto, rol) {
    let estado = false;
    let data = {};

    let idsFunciones = $.isArray($("#ddlFuncionAgregar").val()) ? $("#ddlFuncionAgregar").val() : [$("#ddlFuncionAgregar").val()];

    data.Producto = $("#txtProductoDetalle").val();
    data.Rol = $("#txtRol4").val();
    data.Chapter = $("#ddlChapterAgregar").val();
    //data.Funcion = $("#ddlFuncionAgregar").val();
    data.FuncionMultiple = idsFunciones;


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

function InitAutocompletarProductoSearch($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");

                $.ajax({
                    //url: URL_API + "/Producto" + `/ListadoByDescripcion?descripcion=${request.term}`,
                    url: URL_API_VISTA + `/ListadoByDescripcion?descripcion=${request.term}`,
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
    }).autocomplete("instance")._renderItem = function (ul, item) {
        var a = document.createElement("a");
        var font = document.createElement("font");
        font.append(document.createTextNode(item.Fabricante + " " + item.Nombre));
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

function cargarCombosTipoCuentaAmbienteAgregar() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/ComboTipoCuentaAmbiente",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoCuenta, $("#ddlTipoCuentaAgregar"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.Ambiente, $("#ddlAmbienteAgregar"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}
function cargarCombosTipoCuentaAmbienteEditar() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/ComboTipoCuentaAmbiente",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoCuenta, $("#ddlTipoCuentaEditar"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.Ambiente, $("#ddlAmbienteEditar"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}



function EditarRol() {
    let data = {};
    data.RolProductoId = $("#hdRolProductoId").val();
    data.Rol = $("#txtRol3").val();
    data.Descripcion = $("#txtDescripcion2").val();
    data.TipoCuenta = $("#ddlTipoCuentaEditar").val();
    //data.GrupoRed = $("#txtGrupoRed3").val();

    let flag = VerificarExisteRol($("#hdRolProductoId").val());

    if (flag) {

        if ($("#formEli2").valid()) {
            let flagAmbienteValido = true;

            let valuesAmbiente = $('#ddlAmbienteEditar option:selected').toArray().map(item => item.value);
            let arrAmbiente = [];
            for (var i = 0; i < valuesAmbiente.length; i++) {
                let chkNoAplica = $("#chkNoAplicaEditar_" + valuesAmbiente[i]).is(':checked');
                if ($("#txtGrupoRedEditar_" + valuesAmbiente[i] + "").val() == '' && chkNoAplica == false) {
                    flagAmbienteValido = false;
                    $("#lblGrupoRedEditar_" + valuesAmbiente[i] + "").css("display", "block");
                } else {
                    $("#lblGrupoRedEditar_" + valuesAmbiente[i] + "").css("display", "none");
                }
                var dataAmbiente = {
                    'idAmbiente': valuesAmbiente[i],
                    'grupoRed': $("#txtGrupoRedEditar_" + valuesAmbiente[i] + "").val()
                }
                arrAmbiente.push(dataAmbiente);
            }
            data.Ambiente = arrAmbiente;

            if (flagAmbienteValido == true) {

                bootbox.confirm({
                    title: TITULO_MENSAJE,
                    message: MENSAJE3,
                    buttons: SET_BUTTONS_BOOTBOX,
                    callback: function (result) {
                        if (result !== null && result) {
                            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                            $.ajax({
                                url: URL_API_VISTA + `/EditarRolProducto`,
                                type: "POST",
                                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                                data: JSON.stringify(data),
                                dataType: "json",
                                contentType: "application/json; charset=utf-8",
                                success: function (dataObject, textStatus) {
                                    if (textStatus === "success") {
                                        if (dataObject !== null) {

                                            toastr.success("Se editó el rol del producto correctamente", TITULO_MENSAJE);
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
    }
    else { toastr.warning("No se puede editar el rol porque pertenece a una función.", "Advertencia"); }
}

function AgregarRol() {
    let data = {};
    data.ProductoId = $("#hdProductoId").val();
    data.Rol = $("#txtRol").val();
    //data.GrupoRed = $("#txtGrupoRed").val();
    data.Descripcion = $("#txtDescripcion").val();
    data.TipoCuenta = $("#ddlTipoCuentaAgregar").val();

    if ($("#formEli").valid()) {
        let flagAmbienteValido = true;
        let valuesAmbiente = $('#ddlAmbienteAgregar option:selected').toArray().map(item => item.value);
        let arrAmbiente = [];
        for (var i = 0; i < valuesAmbiente.length; i++) {
            let chkNoAplica = $("#chkNoAplica_" + valuesAmbiente[i]).is(':checked');
            if ($("#txtGrupoRed_" + valuesAmbiente[i] + "").val() == '' && chkNoAplica == false) {
                flagAmbienteValido = false;
                $("#lblGrupoRed_" + valuesAmbiente[i] + "").text("Debe ingresar un Grupo de Red.");
                $("#lblGrupoRed_" + valuesAmbiente[i] + "").css("display", "block");
            } else {
                $("#lblGrupoRed_" + valuesAmbiente[i] + "").css("display", "none");
            }
            var dataAmbiente = {
                'idAmbiente': valuesAmbiente[i],
                'grupoRed': $("#txtGrupoRed_" + valuesAmbiente[i] + "").val()
            }
            arrAmbiente.push(dataAmbiente);
        }
        data.Ambiente = arrAmbiente;

        if (flagAmbienteValido == true) {
            bootbox.confirm({
                title: TITULO_MENSAJE,
                message: MENSAJE,
                buttons: SET_BUTTONS_BOOTBOX,
                callback: function (result) {
                    if (result !== null && result) {
                        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                        $.ajax({
                            url: URL_API_VISTA + `/AgregarRolProducto`,
                            type: "POST",
                            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                            data: JSON.stringify(data),
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            success: function (dataObject, textStatus) {
                                if (textStatus === "success") {
                                    if (dataObject !== null) {

                                        toastr.success("Se agregó el rol al producto correctamente. </br>Para crear una solicitud, deberá agregar al menos una función dentro del rol registrado.", TITULO_MENSAJE);
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
}

function AgregarFuncion() {

    let idsFunciones = $.isArray($("#ddlFuncionAgregar").val()) ? $("#ddlFuncionAgregar").val() : [$("#ddlFuncionAgregar").val()];

    let data = {};
    data.RolProductoId = $("#hdRolProductoId").val();
    data.Tribu = $("#ddlTribuAgregar").find('option:selected').text()
    data.Chapter = $("#ddlChapterAgregar").find('option:selected').text()
    //data.Funcion = $("#ddlFuncionAgregar").val();
    data.FuncionMultiple = idsFunciones;
    if ($("#formEli3").valid()) {

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE8,
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

                                    toastr.success("Se agregó la función al rol correctamente. </br> Para completar el registro, deberá ir a la opción de creación de solicitud.", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {

                            $("#btnAgregarFuncion").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalAgregarFuncion"), false);


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

function CerrarFunciones() {
    var idProducto = $("#hdProductoId2").val();
    ListarAlertasDetalle(idProducto, $('#tblRegistrosDetalle_' + idProducto), null);
}

function ObtenerTipoMensaje(IdProducto, IdSolicitud) {

    let data = {};
    data.IdProducto = IdProducto;
    data.IdSolicitud = IdSolicitud;
    let a = 0;

    $.ajax({
        url: URL_API_VISTA + `/VerificarTipoMensaje`,
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject;
                    a = data;
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
    return a;
}

function ObtenerCantidadFuncionesActivas(idRolProducto) {

    let a = false;
    $.ajax({
        url: URL_API_VISTA + `/VerificarFuncionesActivasPorRol/${idRolProducto}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject;
                    a = data;
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
    return a;
}

function EnviarSolicitud() {


    let data = {};
    data.IdProducto = $("#hdProductoId").val();
    data.Comentario = $("#txtObservacion").val();
    data.Owner = $("#txtOwner").val();
    let IdOwnerR = $("#hdOwner").val();
    data.IdOwner = IdOwnerR.substr(IdOwnerR.length - 6);
    data.Seguridad = $("#ddlSeguridadAgregar option:selected").text();
    data.IdSeguridad = $("#ddlSeguridadAgregar").val();
    data.IdSolicitud = 0;
    data.IdTipoSolicitud = 0;

    let tipoMensaje = $("#hTipoSolicitudId").val();
    var mensajeTexto = "";
    if (tipoMensaje == 1) {
        mensajeTexto = MENSAJE6;
    } else {
        mensajeTexto = MENSAJE4;
    }

    if ($("#formEnvSolicitud").valid()) {

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: mensajeTexto,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/EnviarSolicitud`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(data),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se creó la solicitud.", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {
                            $("#btnEnviar").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalEnviarSolicitud"), false);
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

function EnviarSolicitud2() {


    let data = {};
    data.IdProducto = $("#hdProductoId").val();
    data.Comentario = $("#txtObservacion2").val();
    data.Owner = $("#txtOwner2").val();
    let IdOwnerR = $("#hdOwner2").val();
    data.IdOwner = IdOwnerR.substr(IdOwnerR.length - 6);
    data.Seguridad = $("#txtSeguridad2").val();
    data.IdSeguridad = $("#hdSeguridad2").val();
    data.IdSolicitud = $("#ddlSolicitud").val();
    data.IdTipoSolicitud = $("#hTipoSolicitudId2").val();

    if ($("#formEnvSolicitud2").valid()) {

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE4,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/EnviarSolicitud`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(data),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se actualizó la solicitud.", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {
                            $("#btnEnviar2").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalEnviarSolicitudAct"), false);
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

function EnviarSolicitudEliminar() {


    let data = {};
    data.IdProducto = $("#hdProductoId").val();
    data.Comentario = $("#txtObservacion3").val();
    data.Owner = $("#txtOwner3").val();
    let IdOwnerR = $("#hdOwner3").val();
    data.IdOwner = IdOwnerR.substr(IdOwnerR.length - 6);
    data.IdSeguridad = "1-1";
    data.IdSolicitud = 0;
    data.IdTipoSolicitud = 0;

    if ($("#formEnvSolicitud3").valid()) {

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE4,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/EnviarSolicitud`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(data),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se creó la solicitud.", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {
                            $("#btnEnviar3").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalEnviarSolicitudEliminar"), false);
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

function EnviarSolicitudEliminar2() {

    let data = {};
    data.IdProducto = $("#hdProductoId").val();
    data.Comentario = $("#txtObservacion4").val();
    data.Owner = $("#txtOwner4").val();
    let IdOwnerR = $("#hdOwner4").val();
    data.IdOwner = IdOwnerR.substr(IdOwnerR.length - 6);
    data.IdSeguridad = "1-1";
    data.IdSolicitud = $("#ddlSolicitud2").val();
    data.IdTipoSolicitud = $("#hTipoSolicitudId2").val();

    if ($("#formEnvSolicitud4").valid()) {

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE4,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/EnviarSolicitud`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(data),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se actualizó la solicitud.", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function (data) {
                            $("#btnEnviar4").button("reset");
                            waitingDialog.hide();
                            OpenCloseModal($("#modalEnviarSolicitudAct2"), false);
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
            DATA_EXPORTAR.CodigoTribu = CodigoTribu;
            DATA_EXPORTAR.CodigoApt = $("#txtCodigo").val();

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

function RefrescarListado() {
    ListarRegistros();
}

function ExportarInfo() {
    DATA_EXPORTAR = {};
    DATA_EXPORTAR.CodigoApt = $.trim($("#txtCodigoApt").val());

    let url = `${URL_API_VISTA}/Bitacora/Exportar?codigoApt=${DATA_EXPORTAR.CodigoApt}`;
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

function detailFormatter(index, row) {
    //OPCIONES = ' <th data-formatter="opciones2Formatter" data-field="Opciones2" data-halign="center" data-valign="middle" data-align="center" data-width="30%">Opciones</th>\'';
    //OPCIONES +

    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="10%">#</th>\
                                    <th data-field="Id" data-halign="center" data-valign="middle" data-align="left" data-width="10%" data-visible="false">Id</th>\
                                    <th data-formatter="funcionesFormatter" data-field="Rol" data-halign="center" data-valign="middle" data-align="left" data-width="20%">Rol</th>\
                                    <th data-field="Descripcion" data-halign="center" data-valign="middle" data-align="left" data-width="25%">Descripción</th>\
                                    <th data-field="TipoCuentaStr" data-halign="center" data-valign="middle" data-align="left" data-width="20%">Tipo de Cuenta</th>\
                                    <th data-formatter="ambientesFormatter" data-field="Ambiente" data-halign="center" data-valign="middle" data-align="left" data-width="20%">Ambiente : Grupo de Red</th>\
                                    <th data-field="EstadoRol" data-halign="center" data-valign="middle" data-align="left" data-width="10%">Estado</th>\
                                    <th data-field="FuncionesRelacionadas" data-halign="center" data-valign="middle" data-align="left" data-width="5%">Funciones Relacionadas</th>\
                                    <th data-formatter="opciones2Formatter" data-field="Opciones2" data-halign="center" data-valign="middle" data-align="center" data-width="30%">Opciones</th>\
                                </tr>\
                              </thead>\
                              </table>', row.Id);
    return html;
}

function opcionesFormatter(value, row, index) {

    let btnConfirmar = `<a href="javascript:irAgregar(${row.Id},'${row.Nombre}')" title="Agregar un nuevo rol para este producto"><i class="iconoVerde glyphicon glyphicon-user"></i></a>`;
    let btnEnviarSolicitud = `<a href="javascript:irEnviarSolicitud(${row.Id})" title="Registrar solicitud"><i class="iconoVerde glyphicon glyphicon-book"></i></a>`;

    return btnConfirmar.concat("&nbsp;&nbsp;", btnEnviarSolicitud);

}

function opciones3Formatter(value, row, index) {

    if (row.EstadoFuncion == 1 || row.EstadoFuncion == 4 || row.IdSolicitud == 0) {
        let btnEliminarFuncion = `<a href="javascript:irEliminarFuncion(${row.Id},${row.RolesProductoId})" title="Eliminar esta funcion del rol"><i class="iconoRojo glyphicon glyphicon-trash"></i></a>`;
        return btnEliminarFuncion;
    }
    else return "";

}

function opciones2Formatter(value, row, index) {

    //if (USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_Administrador") || USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_MDR_OwnerProducto") || USUARIO.UsuarioBCP_Dto.Perfil.includes("E195_MDR_EspecialistaTec"))
    //{
    let btnConfirmar = `<a href="javascript:irEditar(${row.Id},${row.ProductoId})" title="Editar este rol del producto"><i class="iconoVerde glyphicon glyphicon-pencil"></i></a>`;
    let btnObservar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar este rol del producto"><i class="iconoRojo glyphicon glyphicon-trash"></i></a>`;
    let btnAgregar = `<a href="javascript:irAgregar2(${row.Id},'${row.Rol}','${row.GrupoRed}','${row.Producto}')" title="Agregar una nueva función para este rol"><i class="iconoVerde glyphicon glyphicon-plus"></i></a>`;

    return btnConfirmar.concat("&nbsp;&nbsp;", btnObservar.concat("&nbsp;&nbsp;", btnAgregar));
    //}
    //else return "";
}

function irAgregar(id, nombre) {
    $("#hdProductoId").val(id);
    $("#txtProducto2").val(nombre);

    LimpiarModal();

    $("#ddlTipoCuentaAgregar").val('');
    $("#ddlAmbienteAgregar").val('');
    cargarCombosTipoCuentaAmbienteAgregar();
    $tblAmbientes.bootstrapTable('destroy').bootstrapTable();

    //$("#txtGrupoRed").prop('disabled', false);
    //$("#chkNoAplica").prop('checked', false);

    OpenCloseModal($("#modalAgregarRol"), true);
}


function cargarCombosSeguridad() {

    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + "/SeguridadCombo",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Seguridad, $("#ddlSeguridadAgregar"), TEXTO_SELECCIONE);
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function cargarComboSolicitud(ProductoId, TipoSolicitudId) {

    let data = {};
    data.IdProducto = ProductoId;
    data.IdTipoSolicitud = TipoSolicitudId;

    $.ajax({
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/SolicitudPorProducto`,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    if (TipoSolicitudId == 1) {
                        SetItems(dataObject.Solicitud, $("#ddlSolicitud"), TEXTO_SELECCIONE);
                    }
                    else {
                        SetItems(dataObject.Solicitud, $("#ddlSolicitud2"), TEXTO_SELECCIONE);
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

function irAgregar2(id, Rol, GrupoRed, Producto) {

    $("#hdRolProductoId").val(id);
    $("#txtProductoDetalle").val(Producto);
    $("#txtRol4").val(Rol);
    $("#txtGrupoRed2").val(GrupoRed);
    // Recuperar Ambientes y Grupos de Red
    ObtenerDetalleRolAmbiente(id);

    cargarCombosTribu();
    $("#ddlChapterAgregar").val("");
    $("#ddlFuncionAgregar").val("");
    SetItems([], $("#ddlChapterAgregar"), TEXTO_SELECCIONE);
    //SetItems([], $("#ddlFuncionAgregar"), TEXTO_SELECCIONE);
    InitMultiSelect();

    LimpiarModalFuncion();
    OpenCloseModal($("#modalAgregarFuncion"), true);

}

function irEnviarSolicitud(id) {

    $("#hdProductoId").val(id);
    let flag = VerificarFuncionesRol(id);
    let solicitud1 = VerificarEstadoSolicitud(id);
    let estadoSol = solicitud1.EstadoSolicitud;
    let tipoSol = solicitud1.IdTipoSolicitud;
    let solicitudId = solicitud1.SolicitudId;

    let tipo = ObtenerTipoMensaje(id, solicitudId);
    $("#hTipoSolicitudId").val(tipo);
    $("#hTipoSolicitudId2").val(tipoSol);

    //[Description("Pendiente")]
    //Pendiente = 0,
    //    [Description("Aprobado Seguridad")]
    //AprobadoSeguridad = 1,
    //    [Description("Observado Seguridad")]
    //ObservadoSeguridad = 2,
    //    [Description("Aprobado Owner")]
    //AprobadoOwner = 3,
    //    [Description("Observado Owner")]
    //ObservadoOwner = 4,
    //    [Description("Atendido")]
    //Atendido = 5

    if (flag) {

        $("#hdProductoId").val(id);

        if (estadoSol == 0) { // Pendiente
            toastr.warning("No se puede crear una nueva solicitud porque existe una que está pendiente.", "Advertencia");
        } else if (estadoSol == 1 || estadoSol == 3) { // Aprobado
            toastr.warning("No se puede crear una nueva solicitud porque existe una que se encuentra en revisión.", "Advertencia");
        } else if (estadoSol == 2 || estadoSol == 4) { // Observado

            if (tipo == 1 || tipo == 2) // solo registro.
            {
                LimpiarModalSolicitudObservada();
                ObtenerDatosProducto2(id);
                cargarComboSolicitud(id, 1);
                OpenCloseModal($("#modalEnviarSolicitudAct"), true);
            }
            else if (tipo == 3) // solo elim.
            {
                LimpiarModalSolicitudObservada2();
                ObtenerDatosProducto4(id);
                cargarComboSolicitud(id, 2);
                OpenCloseModal($("#modalEnviarSolicitudAct2"), true);
            }

        }
        else { // No existe o hay uno que esta atendido

            if (tipo == 1 || tipo == 2) // solo registro.
            {
                LimpiarModalSolicitud();
                ObtenerDatosProducto(id);
                cargarCombosSeguridad();
                OpenCloseModal($("#modalEnviarSolicitud"), true);
            }
            else if (tipo == 3) // solo elim.
            {
                LimpiarModalSolicitudEliminar();
                ObtenerDatosProducto3(id);
                //cargarCombosSeguridad();
                OpenCloseModal($("#modalEnviarSolicitudEliminar"), true);
            }

        }
    }

    else { toastr.warning("No se puede gestionar el envío de la solicitud porque hay roles sin funciones o no hay nuevas funciones por evaluar. Por favor, revisar.", "Advertencia"); }

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

function CambioChapterAgregar(TribusId, ChapterId) {
    let data = {};
    data.TribuId = TribusId;
    data.Chapter = ChapterId;
    let RolProductoId = $("#hdRolProductoId").val();
    data.RolProductoId = RolProductoId;

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
                    //SetItems(dataObject.Funcion, $("#ddlFuncionAgregar"), TEXTO_SELECCIONE);
                    SetItemsMultiple(dataObject.Funcion, $("#ddlFuncionAgregar"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
                    $("#ddlFuncionAgregar").multiselect("refresh");
                }

            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

}



function LimpiarModal() {
    $("#txtRol").val("");
    //$("#txtGrupoRed").val("");
    $("#txtDescripcion").val("");
    $("#formEli").data('validator').resetForm();
    $("#formEli2").data('validator').resetForm();
    //LimpiarValidateErrores($("#formEli2"))
}

function LimpiarModalSolicitud() {
    $("#txtObservacion").val("");
    $("#formEnvSolicitud").data('validator').resetForm();
    LimpiarValidateErrores($("#formEnvSolicitud"))
}

function LimpiarModalSolicitudObservada() {
    $("#txtObservacion2").val("");
    $("#formEnvSolicitud2").data('validator').resetForm();
    LimpiarValidateErrores($("#formEnvSolicitud2"))
}

function LimpiarModalSolicitudEliminar() {
    $("#txtObservacion").val("");
    $("#formEnvSolicitud3").data('validator').resetForm();
    LimpiarValidateErrores($("#formEnvSolicitud3"))
}

function LimpiarModalSolicitudObservada2() {
    $("#txtObservacion4").val("");
    $("#formEnvSolicitud4").data('validator').resetForm();
    LimpiarValidateErrores($("#formEnvSolicitud4"))
}

function LimpiarModalFuncion() {
    $("#formEli3").data('validator').resetForm();
    LimpiarValidateErrores($("#formEli3"))
}

function irEliminar(id) {
    EliminarRol(id);

}

function LimpiarValidateErrores(form) {
    form.validate().resetForm();
}


function irEditar(id, ProductoId) {

    let flag = VerificarExisteRol(id);
    if (flag) {

        $("#hdProductoId").val(ProductoId);
        $("#hdRolProductoId").val(id);
        LimpiarModal();
        $("#ddlTipoCuentaEditar").val('');
        $("#ddlAmbienteEditar").val('');
        cargarCombosTipoCuentaAmbienteEditar();
        $tblAmbientesEditar.bootstrapTable('destroy').bootstrapTable();
        ObtenerDetalleRol(id);
        OpenCloseModal($("#modalEditarRol"), true);
    }

    else { toastr.warning("No se puede editar el rol porque pertenece a una función.", "Advertencia"); }

}

function EliminarRol(id) {
    let data = {};
    data.RolProductoId = id;

    let flag = VerificarExisteRol(id);

    if (flag) {

        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE2,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/EliminarRolProducto`,
                        type: "POST",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        data: JSON.stringify(data),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {

                                    toastr.success("Se eliminó el rol del producto correctamente", TITULO_MENSAJE);
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
    else { toastr.warning("No se puede eliminar el rol porque pertenece a una función.", "Advertencia"); }
}


function ObtenerDatosProducto(ProductoId) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Producto/" + ProductoId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();

            $("#txtOwner").val(result.OwnerDisplayName);
            $("#hdOwner").val(result.OwnerMatricula);

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function ObtenerDatosProducto2(ProductoId) {

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/ProductoObservado/" + ProductoId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();

            $("#txtOwner2").val(result.OwnerNombre);
            $("#hdOwner2").val(result.Owner);
            $("#txtSeguridad2").val(result.SeguridadNombre);
            $("#hdSeguridad2").val(result.Seguridad);

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function ObtenerDatosProducto3(ProductoId) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Producto/" + ProductoId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();

            $("#txtOwner3").val(result.OwnerDisplayName);
            $("#hdOwner3").val(result.OwnerMatricula);

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function ObtenerDatosProducto4(ProductoId) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/Producto/" + ProductoId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();

            $("#txtOwner4").val(result.OwnerDisplayName);
            $("#hdOwner4").val(result.OwnerMatricula);

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function VerificarFuncionesRol(IdProducto) {

    let a = false;
    //waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/VerificarFuncionesRol/${IdProducto}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //waitingDialog.hide();
                    let data = dataObject;
                    a = data;
                }
            }
        },
        error: function (result) {
            //waitingDialog.hide();
            alert(result.responseText);
        },
        async: false
    });
    return a;
}

function VerificarEstadoSolicitud(IdProducto) {

    var filtro = {};
    filtro.IdProducto = IdProducto;

    var data = {};

    $.ajax({
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        url: URL_API_VISTA + `/VerificarSolicitudProducto`,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(filtro),
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    data.EstadoSolicitud = dataObject.EstadoSolicitud;
                    data.IdTipoSolicitud = dataObject.IdTipoSolicitud;
                    data.SolicitudId = dataObject.SolicitudId;
                }
                else {
                    data.EstadoSolicitud = 99;
                    data.IdTipoSolicitud = 0;
                    data.SolicitudId = 0;
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
    return data;
}

function VerificarExisteRol(Id) {
    let a = false;
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/ExisteRolFuncion/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;
                    a = data;
                }
            }
        },
        complete: function () {

        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
    return a;
}


function ObtenerDetalleRol(Id) {
    LIST_AMBIENTES_EDITAR = [];
    $.ajax({

        url: URL_API_VISTA + `/ObtenerRolProducto/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //waitingDialog.hide();
                    let data = dataObject;
                    $("#txtRol3").val(data.Rol);
                    //$("#txtGrupoRed3").val(data.GrupoRed);
                    $("#txtDescripcion2").val(data.Descripcion);

                    if (data.TipoCuenta == null) {
                        $("#ddlTipoCuentaEditar").val(-1);
                    } else {
                        $("#ddlTipoCuentaEditar").val(data.TipoCuenta);
                    }

                    $("#txtProducto3").val(data.ProductoNombre);

                    //if (data.GrupoRed == '') {
                    //    $("#txtGrupoRed3").prop('disabled', true);
                    //    $("#chkNoAplica_Editar").prop('checked', true);
                    //}

                    if (data.Ambiente.length > 0) {
                        LIST_AMBIENTES_EDITAR = data.Ambiente;
                        for (var i = 0; i < data.Ambiente.length; i++) {
                            $("#ddlAmbienteEditar option[value='" + data.Ambiente[i].Ambiente + "']").prop("selected", true);
                        }
                    }
                    $("#ddlAmbienteEditar").multiselect("refresh");
                    $("#ddlAmbienteEditar").change();
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

function ObtenerDetalleRolAmbiente(Id) {
    $.ajax({
        url: URL_API_VISTA + `/ObtenerRolProducto/${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //waitingDialog.hide();
                    let data = dataObject;
                    if (data.Ambiente.length > 0) {
                        $tblAmbientesListar.bootstrapTable('destroy').bootstrapTable();
                        for (var i = 0; i < data.Ambiente.length; i++) {
                            if (data.Ambiente[i].GrupoRed == '') {
                                $tblAmbientesListar.bootstrapTable("append", {
                                    AmbienteIdListar: data.Ambiente[i].RolesProductoAmbienteId,
                                    AmbienteListar: {
                                        AmbienteStr: data.Ambiente[i].AmbienteStr,
                                        GrupoRed: 'NO APLICA'
                                    }
                                });
                            } else {
                                $tblAmbientesListar.bootstrapTable("append", {
                                    AmbienteIdListar: data.Ambiente[i].RolesProductoAmbienteId,
                                    AmbienteListar: {
                                        AmbienteStr: data.Ambiente[i].AmbienteStr,
                                        GrupoRed: data.Ambiente[i].GrupoRed
                                    }
                                });
                            }

                        }
                    }
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
        sortOrder: 'asc',
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

function funcionesFormatter(value, row, index) {

    let option = value;
    option = `<a href="javascript:VerFunciones('${row.Id}','${row.ProductoId}')" title="Ver funciones relacionadas">${value}</a>`;
    return option;

}
function ambientesFormatter(value, row, index) {
    let option = value;
    option = `<ul style="padding-left: 15px;">`;
    if (row.Ambiente.length > 0) {
        for (var i = 0; i < row.Ambiente.length; i++) {
            if (row.Ambiente[i].GrupoRed == '') {
                option = option + `<li>` + row.Ambiente[i].AmbienteStr + ` : NO APLICA</li>`;
            } else {
                option = option + `<li>` + row.Ambiente[i].AmbienteStr + ` : ` + row.Ambiente[i].GrupoRed + `</li>`;
            }
        }
    }
    option = option + `</ul>`;
    return option;
}

function VerFunciones(id, idProducto) {

    $("#hdProductoId2").val(idProducto);
    OpenCloseModal($("#modalFunciones"), true);

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableFunciones.bootstrapTable('destroy');
    $tableFunciones.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado/DetalleFuncionesProductosRoles",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Tribu,Chapter,Funcion',
        sortOrder: 'asc',
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

function exportarConsolidadoRolesProducto() {
    var producto = $("#txtProducto").val();
    var dominioId = $("#ddlDominio").val();
    var subDominioId = $("#ddlSubDominio").val();
    var codigoTribu = CodigoTribu;
    var tribu = $("#ddlTribus").val();
    var squad = $("#ddlSquads").val();
    var codigo = $("#txtCodigo").val();
    let url = `${URL_API_VISTA}/Exportar/ExportarProductoRoles?producto=${producto}&dominioId=${dominioId}&subDominioId=${subDominioId}&tribu=${tribu}&squad=${squad}&codigoTribu=${codigoTribu}&codigo=${codigo}`;
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

function exportarDetalladoRolesProducto() {
    var producto = $("#txtProducto").val();
    var dominioId = $("#ddlDominio").val();
    var subDominioId = $("#ddlSubDominio").val();
    var codigoTribu = CodigoTribu;
    var tribu = $("#ddlTribus").val();
    var squad = $("#ddlSquads").val();
    var codigo = $("#txtCodigo").val();
    let url = `${URL_API_VISTA}/Exportar/ExportarProductoRolesDetallado?producto=${producto}&dominioId=${dominioId}&subDominioId=${subDominioId}&tribu=${tribu}&squad=${squad}&codigoTribu=${codigoTribu}&codigo=${codigo}`;
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

function irEliminarFuncion(id, idRolProducto) {

    var idProducto = $("#hdProductoId2").val();

    let data = {};
    data.RolProductoId = id;

    let tipo = ObtenerCantidadFuncionesActivas(idRolProducto);
    var mensajeTexto = "";
    if (tipo == true) {
        mensajeTexto = MENSAJE7;
    } else {
        mensajeTexto = MENSAJE5;
    }

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: mensajeTexto,
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
                                VerFunciones(idRolProducto, idProducto);
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
        }
    });
}

function InitMultiSelect() {
    SetItemsMultiple([], $("#ddlFuncionAgregar"), TEXTO_SELECCIONE, TEXTO_TODOS, true);
}

function formatOpcAmbiente(value, row, index) {
    var iconRemove = `<a class='btn btn-danger' href='javascript: void(0)' onclick='removerArquetipo("${row.AmbienteId}")'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    var grupoRed = `<div>
                        <div class="col-md-8">
                            <input id="txtGrupoRed_`+ row.AmbienteId + `" name="txtGrupoRed_` + row.AmbienteId + `" class="form-control" type="text" placeholder="" oninput="ChangeGrupoRed(event)" maxlength="300">
                            <label id="lblGrupoRed_`+ row.AmbienteId + `" for="txtGrupoRed_` + row.AmbienteId + `" class="my-error-class" style="display:none;"> Debe ingresar un Grupo de Red.</label>
                        </div>
                        <div class="col-md-4" style="padding-top: 2%;">
                            <input type="checkbox" id="chkNoAplica_`+ row.AmbienteId + `" name="chkNoAplica_` + row.AmbienteId + `" onchange="handleChange(event)">
                            <label for="chkNoAplica_`+ row.AmbienteId + `"> No aplica</label><br>
                        </div>
                    </div>`
    return grupoRed;
}
function formatOpcAmbienteEditar(value, row, index) {
    var grupoRed = `<div>
                        <div class="col-md-8">
                            <input id="txtGrupoRedEditar_`+ row.AmbienteIdEditar + `" name="txtGrupoRedEditar_` + row.AmbienteIdEditar + `" class="form-control" type="text" placeholder="" oninput="ChangeGrupoRedEditar(event)" maxlength="300">
                            <label id="lblGrupoRedEditar_`+ row.AmbienteIdEditar + `" for="txtGrupoRedEditar_` + row.AmbienteIdEditar + `" class="my-error-class" style="display:none;"> Debe ingresar un Grupo de Red.</label>
                        </div>
                        <div class="col-md-4" style="padding-top: 2%;">
                            <input type="checkbox" id="chkNoAplicaEditar_`+ row.AmbienteIdEditar + `" name="chkNoAplicaEditar_` + row.AmbienteIdEditar + `" onchange="handleChangeEditar(event)">
                            <label for="chkNoAplicaEditar_`+ row.AmbienteIdEditar + `"> No aplica</label><br>
                        </div>
                    </div>`;
    //if (LIST_AMBIENTES_EDITAR.length > 0) {
    //    for (var i = 0; i < LIST_AMBIENTES_EDITAR.length; i++) {
    //        $("#txtGrupoRedEditar_'" + LIST_AMBIENTES_EDITAR[i].Ambiente + "'").val(LIST_AMBIENTES_EDITAR[i].GrupoRed);

    //    }
    //}
    return grupoRed;
}