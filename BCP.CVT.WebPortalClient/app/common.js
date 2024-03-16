var regexDecimal = /^\d{1}(\.\d{1,2})?$/;
var regexHoras = /^([1-9]|[12]\d|2[0-4])$/;
const TEXTO_SELECCIONE = "-- Seleccione --";
const TEXTO_VISTA_PREVIA = "-- Vista previa --";
const TEXTO_TODOS = "-- Todos --";
const TEXTO_TODAS = "-- Todas --";
const MENSAJE_ERROR_AJAX = "Sucedió un error con el servicio.";
const USUARIOCREACION = "Dev";
const NAME_CACHE_USUARIO = "usuario";
const TEXTO_SIN_ARCHIVO = "Ningun archivo seleccionado";
var USUARIO = null;
var LOGIN_URL = "/";
var RANGO_DIAS_HABILES = 180;
var userCurrent = null;

const arrOptionsExport = [
    { type: "pdf", label: "PDF" },
    { type: "png", label: "PNG" }
];

const opcionesModal = {
    backdrop: 'static',
    keyboard: false,
    show: true
};

const SET_BUTTONS_BOOTBOX = {
    confirm: {
        label: 'Aceptar',
        className: 'btn-primary'
    },
    cancel: {
        label: 'Cancelar',
        className: 'btn-secondary'
    }
};

const SET_BUTTONS_BOOTBOX_OK = {
    ok: {
        label: 'Aceptar',
        className: 'btn-primary'
    }
};

function ControlarErrorAjax(xhr, ajaxOptions, thrownError) {
    if (xhr.status !== 200) {
        bootbox.alert(MENSAJE_ERROR_AJAX);
        console.log("ControlarErrorAjax :", thrownError);
    }
}
function ControlarCompleteAjax(data) {
    return data.responseJSON == true || data.status === 200;
}
function LimpiarValidateErrores(form) {
    form.validate().resetForm();
}
function FormatoCheckBox(div, nombreChk) {
    div.text("");
    div.append(`<input type="checkbox" checked data-toggle="toggle" id="${nombreChk}"/>`);
    $(`#${nombreChk}`).bootstrapToggle('off');
}
function MethodValidarSinEspacios() {
    $.validator.methods.requiredSinEspacios = function (value, element) {
        value = value || null;
        return $.trim(value) != "" && value != null;
    };

    $.validator.methods.requiredSelect = function (value, element) {
        value = value || null;
        return value != "-1" && value != null;
    };
}
function SetItems(data, combo, TEXTO_INICIAL) {
    combo.html("");
    if (TEXTO_INICIAL !== "")
        combo.append($("<option />").val("-1").text(TEXTO_INICIAL));
    $.each(data, function () {
        let Id = this.Id;
        let flagArray = Id === undefined;
        combo.append($("<option />").val(flagArray ? this : this.Id).text(flagArray ? this : this.Descripcion));
    });
}
function SetItems2(data, combo, TEXTO_INICIAL) {
    combo.html("");
    if (TEXTO_INICIAL != "")
        combo.append($("<option />").val("-2").text(TEXTO_INICIAL));
    $.each(data, function () {
        let Id = this.Id;
        let flagArray = Id == undefined;
        combo.append($("<option />").val(flagArray ? this : this.Id).text(flagArray ? this : this.Descripcion));
    });
}
function SetItems3(data, combo, TEXTO_INICIAL) {
    combo.html("");
    if (TEXTO_INICIAL !== "")
        combo.append($("<option />").val("").text(TEXTO_INICIAL));
    $.each(data, function () {
        //let Id = this.Id;
        //let flagArray = Id === undefined;
        combo.append($("<option />").val(this.Descripcion).text(this.Descripcion));
    });
}
function SetItemsCustomField(data, combo, TEXTO_INICIAL, fieldId, fieldDescripcion) {
    combo.html("");
    if (TEXTO_INICIAL !== "")
        combo.append($("<option />").val("-1").text(TEXTO_INICIAL));
    $.each(data, function () {
        let Id = this[fieldId];
        let Descripcion = this[fieldDescripcion];
        let flagArray = Id === undefined;
        combo.append($("<option />").val(flagArray ? this : Id).text(flagArray ? this : Descripcion));
    });
}
function getAutocompletar($searchBox, DATA, $IdBox, SelectFuntion) {
    $searchBox.autocomplete({
        minLength: 0,
        source: DATA,
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            SelectFuntion = SelectFuntion || null;
            if (SelectFuntion != null) {
                SelectFuntion();
                $tableTecnologia.bootstrapTable('uncheckAll');
                $("#tblRegistroTecnologia tr.selected").removeClass("selected");
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}
function MensajeErrorCliente() {
    bootbox.alert(MENSAJE_ERROR_AJAX, function () { });
}
function LoginUsuario(general = true, url = null) {
    $.ajax({
        url: URL_LOGIN_SERVER + "/LoginBCP",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        //data: JSON.stringify(user),
        dataType: "json",
        success: function (result, textObj) {
            if (textObj === "success" && result !== null) {

                if (general) {
                    //CargaMenuPrincipal(perfilId);
                } else {
                    localStorage.setItem('token', result.Token);
                    localStorage.setItem(NAME_CACHE_USUARIO, JSON.stringify(result));
                    let current_url = url == null ? window.location.href : url;
                    location.href = current_url;
                }

                GuardarVisitaSite(result);
                let arrProy = CargaProyecciones();
                result.Proyeccion1 = arrProy.Proyeccion1;
                result.Proyeccion2 = arrProy.Proyeccion2;
                result.FechaActualizacion = arrProy.FechaActualizacion;


                let arrFlag = CargarFlagAprobacion(result.UserName);
                result.UsuarioBCP_Dto.FlagAprobador = arrFlag.FlagAprobador;
                result.UsuarioBCP_Dto.Bandeja = arrFlag.Bandeja;

                SendSession(result);
                CargaMenuPrincipal(result.Token, url);

                $("#usuario").text(result.UserName);
            }
        },
        complete: function () {
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

//function CerrarSesion() {
//    $.ajax({
//        url: URL_LOGIN_SERVER + "/SignOut",
//        type: "GET",
//        contentType: "application/json; charset=utf-8",
//        dataType: "json",
//        success: function (result, textObj) {
//            if (textObj === "success" && result !== null) {
//                let perfilId = GuardarVisitaSite(result);
//                let arrProy = CargaProyecciones();
//                result.Proyeccion1 = arrProy.Proyeccion1;
//                result.Proyeccion2 = arrProy.Proyeccion2;
//                result.FechaActualizacion = arrProy.FechaActualizacion;

//                let arrFlag = CargarFlagAprobacion(result.UserName);
//                result.UsuarioBCP_Dto.FlagAprobador = arrFlag.FlagAprobador;
//                result.UsuarioBCP_Dto.PerfilId = perfilId;
//                //FLAG_ADMIN = arrFlag.FlagAprobador;
//                //if (FLAG_ADMIN)
//                //    $(".menuAprobador").show();
//                //else
//                //    $(".menuAprobador").hide();

//                SendSession(result);
//                //CargaMenuPrincipal(result.UsuarioBCP_Dto.Perfil);
//                CargaMenuPrincipal(perfilId);

//                $("#usuario").text(result.UserName);
//            }
//        },
//        complete: function () {
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//}

function GuardarVisitaSite(ObjUsuario) {
    //debugger;
    //console.log("Guardar Site");
    //console.log(ObjUsuario);

    let data = {};
    let retorno = -1;
    data.UrlSite = window.location.href || "";

    $.ajax({
        url: URL_API + "/Login/RegistrarVisitaSite",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(data),
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: (result) => {
            retorno = result;
        },
        error: (xhr, ajaxOptions, thrownError) => {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return retorno;
}

function activeMenu() {
    var path = window.location.href;
    $('#sidenav li a').each(function () {
        if (this.href === path) {
            $(this).addClass('active');
        }
    });
    $('.sidenav a.active').parents().closest('.sidenav').addClass('mm-show');
    $('.sidenav a.active').parents().closest('.sidenav-item').addClass('mm-active');
}

function cleanConsole() {
    if (!window.console) window.console = {};
    var methods = ["log", "debug", "warn", "info", "dir", "dirxml", "trace", "profile"];
    for (var i = 0; i < methods.length; i++) {
        console[methods[i]] = function () { };
    }
}

function getCache(key) {
    let cachedHits = localStorage.getItem(key);
    if (cachedHits) {
        let inCache = [];
        inCache = JSON.parse(cachedHits);
        return inCache;
    }
    return null;
}
function removeCache(key) {
    localStorage.removeItem(key);
}
function SendSession(user) {
    $.ajax({
        url: URL_LOGIN_SERVER + "/IniciarSesionUsuario",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ usuario: user }),
        dataType: "json",
        success: function (result, textObj) {
            if (textObj === "success") {
                console.log('Session ok');
            }
        },
        complete: function () {
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
        , async: false
    });
}
function CargarPermisos(objPermiso) {

    //crear = crear || false;
    //editar = editar || false;
    //eliminar = eliminar || false;
    //exportar = exportar || false;
    //aprobar = aprobar || false;

    //PERMISO_MODULO = {
    //    Crear: crear,
    //    Editar: editar,
    //    Eliminar: eliminar,
    //    Exportar: exportar,
    //    Aprobar: aprobar
    //};
    console.log(objPermiso);
    if (objPermiso.Crear == false) {
        $(".permiso-crear").remove();
    }

    if (objPermiso.Editar == false)
        $(".permiso-editar").remove()

    if (objPermiso.Eliminar == false)
        $(".permiso-eliminar").remove()

    if (objPermiso.Exportar == false) {
        $(".permiso-exportar").remove();
    }

    if (objPermiso.Aprobar == false) {
        $(".permiso-aprobar").remove();
    }

}
function RefrescarSesion() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_LOGIN_SERVER + "/RefrescarSesion",
        dataType: "json",
        success: function (dataObject, textStatus) {
            var result = dataObject;
        },
        global: false,
        error: function (xhr, ajaxOptions, thrownError) {
        },
        complete: function (data) {
        },
        async: true
    });
}
function unique(array) {
    return $.grep(array, function (el, index) {
        return index == $.inArray(el, array);
    });
}

function SetItemsRadio(data, combo, TEXTO_INICIAL, TEXTO_GRUPO) {
    debugger;
    //combo.append($("<option />").val("").text(TEXTO_INICIAL));
    $.each(data, function () {
        combo.append($("<option />").val(this.Id || this).text(this.Descripcion || this));
    });

    combo.val("-1");
    combo.multiselect('destroy');
    var opciones = {
        nonSelectedText: TEXTO_INICIAL,
        nSelectedText: "seleccionados",
        allSelectedText: TEXTO_INICIAL,
        selectAllText: TEXTO_GRUPO,
        maxHeight: 400,
        enableFiltering: true,
        filterPlaceholder: "buscar",
        enableCaseInsensitiveFiltering: true,
        buttonWidth: 240
    };
    combo.multiselect(opciones);
    combo.multiselect('refresh');

}

function SetItemsMultiple(data, combo, TEXTO_INICIAL, TEXTO_GRUPO, ISARRAY, ALL) {
    ISARRAY = ISARRAY || false;
    ALL = (ALL === undefined || ALL === null) ? true : ALL;
    //console.log(ALL);
    if (data !== null) {
        combo.html('');
        var group = $.map(data, function (element) {
            return (element === null || element.TipoId === undefined) ? element : parseInt(element.TipoId);
        });

        let uniqueGroup = unique(group);
        if (uniqueGroup.length === 1 || ISARRAY) {

            $.each(data, function () {
                if (this.Id === undefined) this.Id = this;
                if (this.Descripcion === undefined) this.Descripcion = this;
                combo.append($("<option />").val(this.Id).text(this.Descripcion));
            });
        } else {
            $.each(uniqueGroup, function (i, groupId) {
                var objGroup = $.grep(data, function (element, index) {
                    return element.TipoId === groupId;
                })[0];

                objGroup.TipoDescripcion = objGroup.TipoDescripcion || TEXTO_INICIAL;

                var $optgroup = $("<optgroup>", { label: objGroup.TipoDescripcion });
                $optgroup.appendTo(combo);

                var dataSecciones = $.grep(data, function (element, index) {
                    return element.TipoId === groupId;
                });

                $.each(dataSecciones, function (j, option) {
                    var $option = $("<option>", { text: option.Descripcion, value: option.Id });
                    $option.attr("data-opt", option.TipoId);
                    $option.appendTo($optgroup);
                });

            });
        }

        combo.multiselect('destroy');
        var opciones = {
            nonSelectedText: TEXTO_INICIAL,
            nSelectedText: "seleccionados",
            allSelectedText: TEXTO_GRUPO,
            //allSelectedText: TEXTO_INICIAL,
            includeSelectAllOption: ALL,
            selectAllText: TEXTO_GRUPO,
            maxHeight: 400,
            enableFiltering: true,
            filterPlaceholder: "buscar",
            enableCaseInsensitiveFiltering: true,
            enableClickableOptGroups: true,
            buttonWidth: '100%',

        };
        combo.multiselect(opciones);
        combo.multiselect('refresh');
    }
}

function SetItemsMultiple2(data, combo, TEXTO_INICIAL, TEXTO_GRUPO, ISARRAY, ALL) {
    ISARRAY = ISARRAY || false;
    ALL = (ALL === undefined || ALL === null) ? true : ALL;
    //console.log(ALL);
    if (data !== null) {
        combo.html('');
        var group = $.map(data, function (element) {
            return (element === null || element.TipoId === undefined) ? element : parseInt(element.TipoId);
        });

        let uniqueGroup = unique(group);
        if (uniqueGroup.length === 1 || ISARRAY) {

            $.each(data, function () {
                if (this.Id === undefined) this.Id = this;
                if (this.Descripcion === undefined) this.Descripcion = this;
                combo.append($("<option />").val(this.Id).text(this.Descripcion));
            });
        } else {
            $.each(uniqueGroup, function (i, groupId) {
                var objGroup = $.grep(data, function (element, index) {
                    return element.TipoId === groupId;
                })[0];

                objGroup.TipoDescripcion = objGroup.TipoDescripcion || TEXTO_INICIAL;

                var $optgroup = $("<optgroup>", { label: objGroup.TipoDescripcion });
                $optgroup.appendTo(combo);

                var dataSecciones = $.grep(data, function (element, index) {
                    return element.TipoId === groupId;
                });

                $.each(dataSecciones, function (j, option) {
                    var $option = $("<option>", { text: option.Descripcion, value: option.Id });
                    $option.attr("data-opt", option.TipoId);
                    $option.appendTo($optgroup);
                });

            });
        }

        combo.multiselect('destroy');
        var opciones = {
            nonSelectedText: TEXTO_INICIAL,
            nSelectedText: "seleccionados",
            allSelectedText: TEXTO_GRUPO,
            //allSelectedText: TEXTO_INICIAL,
            includeSelectAllOption: ALL,
          
            maxHeight: 400,
            enableFiltering: true,
            filterPlaceholder: "buscar",
            enableCaseInsensitiveFiltering: true,
            enableClickableOptGroups: true,
            buttonWidth: 240,

        };
        combo.multiselect(opciones);
        combo.multiselect('refresh');
    }
}

function SetItemsMultipleEvent(data, combo, TEXTO_INICIAL, TEXTO_GRUPO, ISARRAY, funcion) {
    ISARRAY = ISARRAY || false;
    if (data != null) {
        combo.html('');
        var group = $.map(data, function (element) {
            return parseInt(element.TipoId) || element;
        });

        let uniqueGroup = unique(group);
        if (uniqueGroup.length == 1 || ISARRAY) {

            $.each(data, function () {
                combo.append($("<option />").val(this.Id || this).text(this.Descripcion || this));
            });
        } else {
            $.each(uniqueGroup, function (i, groupId) {
                var objGroup = $.grep(data, function (element, index) {
                    return element.TipoId == groupId;
                })[0];

                objGroup.TipoDescripcion = objGroup.TipoDescripcion || TEXTO_INICIAL;

                var $optgroup = $("<optgroup>", { label: objGroup.TipoDescripcion });
                $optgroup.appendTo(combo);

                var dataSecciones = $.grep(data, function (element, index) {
                    return element.TipoId == groupId;
                });

                $.each(dataSecciones, function (j, option) {
                    var $option = $("<option>", { text: option.Descripcion, value: option.Id });
                    $option.attr("data-opt", option.TipoId);
                    $option.appendTo($optgroup);
                });

            });
        }

        combo.multiselect('destroy');


        var opciones = {
            nonSelectedText: TEXTO_INICIAL,
            nSelectedText: "seleccionados",
            allSelectedText: TEXTO_INICIAL,
            includeSelectAllOption: true,
            selectAllText: TEXTO_GRUPO,
            maxHeight: 400,
            enableFiltering: true,
            filterPlaceholder: "buscar",
            enableCaseInsensitiveFiltering: true,
            enableClickableOptGroups: true,
            buttonWidth: 240,
            onDropdownHide: funcion
        };
        combo.multiselect(opciones);
        combo.multiselect('refresh');
    }
}

function MensajeNoExportar(titulo) {
    bootbox.alert({
        size: "small",
        title: titulo,
        message: "No hay datos para exportar.",
        buttons: {
            ok: {
                label: 'Aceptar',
                className: 'btn-primary'
            }
        }
    });
}

function MensajeRegistroInactivo(titulo) {
    bootbox.alert({
        size: "sm",
        title: titulo,
        message: "El registro se encuentra inactivo.",
        buttons: {
            ok: {
                label: 'Aceptar',
                className: 'btn-primary'
            }
        }
    });
}

function MensajeGeneralAlert(titulo, mensaje) {
    bootbox.alert({
        size: "sm",
        title: titulo,
        message: mensaje,
        buttons: {
            ok: {
                label: 'Aceptar',
                className: 'btn-primary'
            }
        }
    });
}

function castDate(date) {
    if ($.trim(date) === "") return date;
    var fechaTemp = date;
    var vectorDate = fechaTemp.split("/");
    var anio = vectorDate[2];
    var mes = vectorDate[1];
    var dia = vectorDate[0];
    return anio + "/" + mes + "/" + dia;
}

function yearByDate(date) {
    debugger;
    if ($.trim(date) === "") return date;
    let fechaTemp = date;
    let vectorDate = fechaTemp.split("/");
    return vectorDate[2];
}

function castDate2(date) {
    if ($.trim(date) === "") return date;
    var fechaTemp = date;
    var vectorDate = fechaTemp.split("-");
    var dia = vectorDate[2];
    var mes = vectorDate[1];
    var anio = vectorDate[0];
    return anio + "/" + mes + "/" + dia;
}

function UploadFile($fileInput, CodIntTablaProcedencia, EntidadId, ArchivoId, flagEliminar, tituloMensaje, nombreFl, descripcionFl, $table) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    flagEliminar = flagEliminar || false;
    tituloMensaje = tituloMensaje || "";
    nombreFl = nombreFl || "";
    descripcionFl = descripcionFl || "";
    $table = $table || null;

    let estado = false;
    if (!flagEliminar && $fileInput.val() === "") return estado;

    let formData = new FormData();
    let file = $fileInput.get(0).files;
    formData.append("File", file[0]);
    formData.append("TablaProcedencia", CodIntTablaProcedencia);
    formData.append("EntidadId", EntidadId);
    formData.append("ArchivoId", ArchivoId);
    formData.append("NombreRef", nombreFl);
    formData.append("DescripcionRef", descripcionFl);

    $.ajax({
        url: URL_API + "/File/upload",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //debugger;
                    //estado = result;
                    estado = dataObject;
                    waitingDialog.hide();
                    toastr.success("Cargado correctamente", tituloMensaje);
                    if ($table !== null) {
                        $table.bootstrapTable("refresh");
                    }
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });

    return estado;
}


function UploadFile2($fileInput, EntidadId, ArchivoId, flagEliminar, tituloMensaje, descripcionFl, $table, appId) {
    debugger;
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });


    flagEliminar = flagEliminar || false;
    tituloMensaje = tituloMensaje || "";
    descripcionFl = descripcionFl || "";
    $table = $table || null;
    debugger;

    let estado = false;
    if (!flagEliminar && $fileInput.val() === "") return estado;

    let formData = new FormData();
    let file = $fileInput.get(0).files;
    formData.append("File", file[0]);
    formData.append("EntidadId", EntidadId);
    formData.append("ArchivoId", ArchivoId);
    formData.append("DescripcionRef", descripcionFl);
    formData.append("AppId", appId);

    $.ajax({
        url: URL_API + "/File/upload3",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            estado = result;
            waitingDialog.hide();
            toastr.success("Cargado correctamente", tituloMensaje);
            if ($table !== null) {
                $table.bootstrapTable("refresh");
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });
    return estado;
}

function UploadFile3($fileInput, ArchivoId, flagEliminar, appId) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });


    flagEliminar = flagEliminar || false;

    let estado = false;
    if (!flagEliminar && $fileInput.val() === "") return estado;

    let formData = new FormData();
    let file = $fileInput.get(0).files;
    formData.append("File", file[0]);
    formData.append("AppId", appId);
    
    $.ajax({
        url: URL_API + "/File/upload4",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            estado = result;
            waitingDialog.hide();
            toastr.success("Cargado correctamente", tituloMensaje);

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return estado;
}

function UploadTempFile($fileInput, ArchivoId, flagEliminar, solId,appId) {
    debugger;
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });


    flagEliminar = flagEliminar || false;
    debugger;

    let estado = false;
    if (!flagEliminar && $fileInput.val() === "") return estado;

    let formData = new FormData();
    let file = $fileInput.get(0).files;
    formData.append("File", file[0]);
    formData.append("SolId", solId);
    formData.append("AppId", appId);

    $.ajax({
        url: URL_API + "/File/uploadTempFile",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            estado = result;
            waitingDialog.hide();
            toastr.success("Cargado correctamente", tituloMensaje);

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        //async: false
    });
    return estado;
}
function DownloadFile(id, $inputFile, titulo) {
    let archivo = $inputFile.val();

    if (archivo === TEXTO_SIN_ARCHIVO) {
        bootbox.alert({
            size: "small",
            title: titulo,
            message: "No archivo para descargar.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
        return false;
    }
    let url = `${URL_API}/File/download?id=${id}`;

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

function DownloadFile2(id) {

    let url = `${URL_API}/File/download2?id=${id}`;

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

function DownloadFile3(id) {

    let url = `${URL_API}/File/download3?id=${id}`;

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

function DownloadFileById(id) {

    let url = `${URL_API}/File/downloadById?id=${id}`;

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

function DownloadGST1(id) {

    let url = `${URL_API}/File/downloadGST?id=${id}`;

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
function DownloadTicket(id) {

    let url = `${URL_API}/File/downloadTicket?id=${id}`;

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

function DownloadRatificacion(id) {

    let url = `${URL_API}/File/downloadRatificacion?id=${id}`;

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



function DescargarArchivoBackup(id) {

    let url = `${URL_API_VISTA}/Obtener?idBackup=${id}`;
    $.ajax({
        url: url,
        type: "GET",
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


function GetFileByEntidadIdByProcedenciaId(entidadId, procedenciaId) {
    let data = null;
    $.ajax({
        url: URL_API + `/File/GetByEntidadIdByProcedenciaId?entidadId=${entidadId}&procedenciaId=${procedenciaId}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            data = result || null;
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            waitingDialog.hide();
        },
        async: false
    });
    return data;
}
function RandomId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function ObtenerFechaActual() {
    let d = new Date();
    let month = d.getMonth() + 1;
    let day = d.getDate();

    let output = d.getFullYear() + '/' +
        (month < 10 ? '0' : '') + month + '/' +
        (day < 10 ? '0' : '') + day;
    return output;
}
function InitAutocompletarBuilder($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API + urlControllerWithParams,
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox != null) $IdBox.val(ui.item.Id);
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
function setDefaultHd($textBox, $hdId) {
    $textBox.keyup(function () {
        if ($.trim($(this).val()) === "") {
            $hdId.val("0");
        }
    });
}

function InitHidden($textBox, $hdId, value) {
    $textBox.keyup(function () {
        if ($.trim($(this).val()) === "") {
            $hdId.val(value);
        }
    });
}

function InitAutocompletarBuilder2($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("");
                $.ajax({
                    url: URL_API + urlControllerWithParams,
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox != null) $IdBox.val(ui.item.Descripcion);
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

function CargaMenuPrincipal(token, url) {
        $.ajax({
            url: URL_LOGIN_SERVER + "/CargaMenuPrincipal",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify({}),
            success: (result) => {
                localStorage.setItem('token', token);
                localStorage.setItem(NAME_CACHE_USUARIO, JSON.stringify(result));

                location.href = url == null ? LOGIN_URL : url;
            },
            error: (xhr, ajaxOptions, thrownError) => {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            async: false
        });
    //return arrMenu;
}
function CargaProyecciones() {
    let arrProy = [];
    $.ajax({
        url: URL_API + "/Login/ObtenerProyeccion",
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: (result) => {
            arrProy = result;
        },
        error: (xhr, ajaxOptions, thrownError) => {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return arrProy;
}

function CargarFlagAprobacion(matricula) {
    let arrFlag = [];
    var usuario = {};

    $.ajax({
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Login/ValidarFlagAprobacion",
        type: "POST",
        data: JSON.stringify(usuario),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: (result) => {
            arrFlag = result;
        },
        error: (xhr, ajaxOptions, thrownError) => {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return arrFlag;
}

//function ObtenerDatosByMatricula($matriculaBox, $nombreUsuario) {
//    let matricula = $matriculaBox.val();
//    $.ajax({
//        type: "GET",
//        contentType: "application/json; charset=utf-8",
//        url: URL_API + `/Usuario/ObtenerDatosUsuario?Matricula=${matricula}`,
//        dataType: "json",
//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    //console.log(dataObject);
//                    $nombreUsuario.html(dataObject.Matricula);
//                }
//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//}


function RegistrarMatricula(Datos) {
    let data = Datos;
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Login/RegistrarBaseUsuario`,
        dataType: "json",
        data: JSON.stringify(data),
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    console.log(dataObject);
                    toastr.success("Validación correcta", TITULO_MENSAJE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function ValidarConexionInternet() {
    var online = navigator.onLine;
    let path = window.location.pathname;
    if (!online && path !== LOGIN_URL) {
        removeCache(NAME_CACHE_USUARIO);
        window.location.href = LOGIN_URL;
    } else {
        //LoginUsuario();
    }
}

function OpenCloseModal($md, flag) {
    if (flag)
        $md.modal(opcionesModal);
    else
        $md.modal("hide");
}
function CaseIsNullSendFilter(value) {
    if (value)
        if ($.isArray(value))
            return value;
        else return [value];
    return [];
}
function CaseIsNullSendExport(value) {
    if (value)
        if ($.isArray(value))
            return value.join("|");
        else return value;
    return "";
}
function InitSelectMultiple(listIds) {
    if (listIds)
        listIds.forEach((item) => {
            $(item).attr("multiple", true);
            SetItemsMultiple([], $(item), TEXTO_TODOS, TEXTO_TODOS, true);
        });
}
function SetDataToSelectMultiple(arrMultiSelect, dataObject) {
    arrMultiSelect.forEach((item) => {
        if (dataObject[item.DataField])
            SetItemsMultiple(dataObject[item.DataField], $(item.SelectId), TEXTO_TODOS, TEXTO_TODOS, true);
    });
}

//function activeMenu() {
//    var path = window.location.href;
//    $('#sidenav li a').each(function () {
//        if (this.href === path) {
//            $(this).addClass('active');
//        }
//    });
//    $('.sidenav a.active').parents().closest('.sidenav').addClass('mm-show');
//    $('.sidenav a.active').parents().closest('.sidenav-item').addClass('mm-active');
//}

function generalFormatter(value, row) {
    let formatter = value;
    return formatter;
}

function ExisteRelacionPortafolio(id, idConfiguracion, idEntidadRelacion = null) {
    let dataRetorno = {};
    let _id = id;
    let _idConfiguracion = idConfiguracion;
    let _idEntidadRelacion = idEntidadRelacion;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/ExisteRelacionByConfiguracion?id=${_id}&idConfiguracion=${_idConfiguracion}&idEntidadRelacion=${_idEntidadRelacion}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    dataRetorno = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return dataRetorno;
}

function GetCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = `${dd}/${mm}/${yyyy}`;
    return today;
}

function InitListBoxBuilder(filtro, $ddl, urlGet) {
    if (filtro !== null && filtro !== "-1") {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: URL_API + `${urlGet}?filtro=${filtro}`,
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        let data = dataObject;
                        if (data)
                            SetItems(data, $ddl, TEXTO_SELECCIONE);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            async: false
        });
    }
}

function ExisteNombreEntidadByConfiguracion(_id, _filtro, _idConfiguracion, _hdEntidadRelacion = null) {
    _filtro = SetCustomName(_filtro, true);
    let estado = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/ExisteNombreEntidadByConfiguracion?id=${_id}&filtro=${_filtro}&idConfiguracion=${_idConfiguracion}&entidadRelacionId=${_hdEntidadRelacion}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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

function setBlankLbl($textBox, $lbl) {
    $textBox.keyup(function () {
        if ($.trim($(this).val()) === "") {
            $lbl.html("");
        }
    });
}

function EnableDisableButtonByInput($textBox, $btn) {
    $textBox.keyup(function () {
        let flagActivo = $.trim($(this).val()) !== "" ? true : false;
        $btn.prop('disabled', !flagActivo);
    });
}

function nameAppFormatter(value) {
    let retorno = value;
    if (value !== null && $.trim(value).length > 0) {
        retorno = ReduceDimString(value, 30);
    }

    return retorno;
}

function ReduceDimString(cadena, dim) {
    let retornoStr = $.trim(cadena);
    let arrCadenaModificada = [];
    let cadenaOriginal = $.trim(cadena);
    if (cadenaOriginal.length > dim) {
        let state = true;
        while (state) {
            let subcadena20 = $.trim(cadenaOriginal.substring(0, dim));
            let subcadenaModificada = `${subcadena20}<br/>`;
            arrCadenaModificada.push(subcadenaModificada);

            let subcadenaResiduo = cadenaOriginal.replace(subcadena20, "");
            if (subcadenaResiduo.length > dim) {
                state = true;
                cadenaOriginal = subcadenaResiduo;
            } else {
                state = false;
                arrCadenaModificada.push(subcadenaResiduo);
            }
        }

        let cadenaFinal = arrCadenaModificada.join("|");
        cadenaFinal = cadenaFinal.replace(/[|]/g, '');
        retornoStr = cadenaFinal;
    }

    return retornoStr;
}

function SetCustomName(text, validate = false) {
    let newStr = $.trim(text);
    newStr = newStr.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); //Sin acentos
    if (validate) newStr = newStr.replace(/ /g, ""); //Sin espacios internos
    newStr = newStr.toUpperCase();
    return newStr;
}

function ObtenerGrupoAD(nombre) {
    var datos;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_LOGIN_SERVER + `/ObtenerGroupAD?groupName=${nombre}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    datos = dataObject;
                    console.log(dataObject);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return datos;
}

function ObtenerGrupoADMiembros(nombre) {
    var datos;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_LOGIN_SERVER + `/ObtenerGroupADMembers?groupName=${nombre}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    datos = dataObject;
                    console.log(dataObject);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return datos;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

/*DATEPICKER => Fechas habilitas de 30 previos, anteriores a ellos solamente domingo*/
function _BuildDatepicker($datepicker) {
    let fechaInicio = new Date();
    let fechaFin = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - RANGO_DIAS_HABILES);

    $datepicker.datepicker({
        maxDate: fechaFin,
        locale: "es",
        useCurrent: false,
        firstDay: 1,
        dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
        dayNamesShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
        monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        closeText: 'Cerrar',
        currentText: 'Hoy',
        weekHeader: 'Sm',
        dateFormat: 'dd/mm/yy',
        beforeShowDay: function (date) {
            if (date < fechaInicio && date.getDay() != 5) {
                return [false, "somecssclass"]
            }
            else {
                return [true, "someothercssclass"]
            }
        }
    });
}

/*DATEPICKER => Fechas habilitadas de hoy en adelante*/
function _BuildDatepickerProyeccion($datepicker) {
    let fechaInicio = new Date();
    //let fechaFin = new Date();
    //fechaInicio.setDate(fechaInicio.getDate() - RANGO_DIAS_HABILES);

    $datepicker.datepicker({
        minDate: fechaInicio,
        locale: "es",
        useCurrent: false,
        firstDay: 1,
        dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
        dayNamesShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
        monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        closeText: 'Cerrar',
        currentText: 'Hoy',
        weekHeader: 'Sm',
        dateFormat: 'dd/mm/yy',
        beforeShowDay: function (date) {
            if (date < fechaInicio) {
                return [false, "somecssclass"]
            }
            else {
                return [true, "someothercssclass"]
            }
        }
    });
}

function AñadirBotonesScrollHorizontal(child) {
    let parent = child.parent();
    parent.css({ "overflow-x": "hidden" });
    parent.find(".btn-scroll-horizontal-container-buttons").remove();
    let isMousePressed = false;
    let idIntervalFunction = null;

    let btnAtras = $("<div class='btn-scroll-horizontal-container-buttons hidden'><div class='btn btn-scroll-horizontal-atras'><i class='glyphicon glyphicon-arrow-left'></i></div></div>");
    parent.append(btnAtras);
    btnAtras.find(".btn").mousedown((e) => {
        if (isMousePressed) return;
        isMousePressed = (e.which == 1);
        if (isMousePressed) idIntervalFunction = setInterval(() => sideScrollHorizontal(parent[0], 'left', 5, isMousePressed), 1);
    });
    btnAtras.find(".btn").mouseup((e) => {
        if (isMousePressed) {
            clearTimeout(idIntervalFunction);
            isMousePressed = !isMousePressed;
            idIntervalFunction = null;
        }
    });

    let btnAdelante = $("<div class='btn-scroll-horizontal-container-buttons'><div class='btn btn-scroll-horizontal-siguiente'><i class='glyphicon glyphicon-arrow-right'></i></div></div>");
    parent.append(btnAdelante);
    btnAdelante.find(".btn").mousedown((e) => {
        if (isMousePressed) return;
        isMousePressed = (e.which == 1);
        if (isMousePressed) idIntervalFunction = setInterval(() => sideScrollHorizontal(parent[0], 'right', 5, isMousePressed), 1);
    });
    btnAdelante.find(".btn").mouseup((e) => {
        if (isMousePressed) {
            clearTimeout(idIntervalFunction);
            isMousePressed = !isMousePressed;
            idIntervalFunction = null;
        }
    });
}

function sideScrollHorizontal(parent, direction, step, isMousePressed) {
    let button = null;
    if (direction == 'left') {
        button = $(parent).find(".btn-scroll-horizontal-atras");
        parent.scrollLeft -= step;
    } else {
        button = $(parent).find(".btn-scroll-horizontal-siguiente");
        parent.scrollLeft += step;
    }

    let { scrollLeft, scrollLeftMax, scrollWidth, offsetWidth } = parent;
    scrollLeft = Math.floor(scrollLeft);
    scrollLeftMax = scrollLeftMax || scrollWidth - offsetWidth;
    scrollLeftMax = Math.floor(scrollLeftMax);

    if (isMousePressed && (scrollLeft == 0 || scrollLeft == scrollLeftMax)) button.mouseup();

    if (scrollLeft == 0) $(".btn-scroll-horizontal-container-buttons:first").addClass("hidden");
    else $(".btn-scroll-horizontal-container-buttons:first").removeClass("hidden");
    if (scrollLeft == scrollLeftMax) $(".btn-scroll-horizontal-container-buttons:last").addClass("hidden");
    else $(".btn-scroll-horizontal-container-buttons:last").removeClass("hidden");
}

function getValidarValoresSelect(id,elementoBuscando) {
    const e = document.getElementById(id);
    var valElementoBuscar = (elementoBuscando != null) ? elementoBuscando : 0;
    var arrayValues = [];
    var objetoValues = Array.apply(null, Array(e.options.length)).
        map((cur, i, arr) => {
        return arr[i] = {
            selectValue: e.options[i].value
            };
        });
    objetoValues.forEach(function (valor, index) {
        arrayValues.push(valor.selectValue);
    });
    return arrayValues.includes(valElementoBuscar.toString());
}

function getCurrentUser() {

    $.ajax({
        url: URL_API + "/LoginFront/Get",
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            userCurrent = result;
        },
        error: function (xhr, ajaxOptions, thrownError) {
            const url = window.location.href;
            LoginUsuario(false, url);
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            waitingDialog.hide();
        }
    });
}