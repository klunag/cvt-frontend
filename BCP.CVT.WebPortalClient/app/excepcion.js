var $table = $("#tblRegistro");
var $tableEquipo = $("#tblRegistroEquipo");
var URL_API_VISTA = URL_API + "/Excepcion";
var CODIGO_INTERNO = 0;
var DATA_EXPORTAR = {};
$(function () {
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({ data: [] });
    $tableEquipo.bootstrapTable("destroy");
    $tableEquipo.bootstrapTable({ data: [] });
    InitFecha();
    CargarCombos();
    InitAutocompletarAplicacion($("#txtFiltroAplicacion"), $("#hdFiltroAplicacionId"), ".aplicacionFiltroContainer");
    InitAutocompletarTecnologia($("#txtFiltroTecnologia"), $("#hdFiltroTecnologiaId"), ".tecnologiaFiltroContainer");
    InitAutocompletarEquipo($("#txtFiltroEquipo"), $("#hdFiltroEquipoId"), ".equipoFiltroContainer");
    ValidarCampos();
    InitAutocompletarAplicacion($("#txtAplicacion"), $("#hdAplicacionId"), ".aplicacionContainer");
    InitAutocompletarTecnologia($("#txtTecnologia"), $("#hdTecnologiaId"), ".tecnologiaContainer");
    InitExcepcion();
    initUpload($("#txtArchivo"));
    ListarRegistros();

    //$("#txtFiltroAplicacion").keyup(function () {
    //    if ($.trim($(this).val()) === "") {
    //        $("#hdFiltroAplicacionId").val("0");
    //    }      
    //});
    
    setDefaultHd($("#txtFiltroAplicacion"), $("#hdFiltroAplicacionId"));
    setDefaultHd($("#txtFiltroTecnologia"), $("#hdFiltroTecnologiaId"));
    setDefaultHd($("#txtFiltroEquipo"), $("#hdFiltroEquipoId"));
});

function initUpload(txtNombreArchivo) {
    var inputs = document.querySelectorAll(".inputfile");
    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener("change", function (e) {
            var fileName = "";
            if (this.files && this.files.length > 1)
                fileName = (this.getAttribute("data-multiple-caption") || "").replace("{count}", this.files.length);
            else
                fileName = e.target.value.split("\\").pop();

            if (fileName)
                txtNombreArchivo.val(fileName);
            else
                label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
    $(".div-controls-file").show();
}
function InitExcepcion() {
    if ($("#hdTipoExcepcionId").val() === EXCECPCION_RIESGO) {
        InitExcepcionporRiesgo()
    } else if ($("#hdTipoExcepcionId").val() === EXCECPCION_TIPO) {
        InitExcepcionporTipo()
    }
}
function InitExcepcionporRiesgo() {
    $table.bootstrapTable("showColumn", "TipoRiesgoStr");
    $(".form-excepcion-riesgo").show();
    $(".form-excepcion-tipo").hide();
    $(".form-excepcion-riesgo").removeClass("ignore");
    $(".form-excepcion-tipo").addClass("ignore");
}
function InitExcepcionporTipo() {
    $table.bootstrapTable("hideColumn", "TipoRiesgoStr");
    $(".form-excepcion-riesgo").hide();
    $(".form-excepcion-tipo").show();
    $(".form-excepcion-riesgo").addClass("ignore");
    $(".form-excepcion-tipo").removeClass("ignore");
}
function InitFecha() {
    $("#divFechaFinExcepcion").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
}
function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.TipoRiesgo, $("#cbTipoRiesgo"), TEXTO_SELECCIONE);
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
function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({
        locale: "es-SP",
        url: URL_API_VISTA + "/Listado",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "FechaCreacion",
        sortOrder: "desc",
        uniqueId: "Id",
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            //DATA_EXPORTAR.nombre = $.trim($("#txtFiltro").val());
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.TipoExcepcionId = $("#hdTipoExcepcionId").val() === "0" ? "" : $("#hdTipoExcepcionId").val();
            DATA_EXPORTAR.CodigoAPT = $("#hdFiltroAplicacionId").val() === "0" ? "" : $("#hdFiltroAplicacionId").val();
            DATA_EXPORTAR.TecnologiaId = $("#hdFiltroTecnologiaId").val() === "0" ? "" : $("#hdFiltroTecnologiaId").val();
            DATA_EXPORTAR.EquipoId = $("#hdFiltroEquipoId").val() === "0" ? "" : $("#hdFiltroEquipoId").val();
            console.log(DATA_EXPORTAR);
            //debugger;
            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadSuccess: function (status, res) {

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
function ValidarCampos() {

    $.validator.addMethod("existeTecnologia", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $("#hdTecnologiaId").val() !== "0") {
            estado = ExisteTecnologia();
        }
        return estado;
    });

    $.validator.addMethod("existeAplicacion", function (value, element) {
        let estado = false;
        if ($.trim(value) !== "" && $("#hdAplicacionId").val() !== "0") {
            estado = ExisteAplicacion();
        }
        return estado;
    });

    $.validator.addMethod("validFechaFinExcepcion", function (value, element) {
        let estado = true;
        if ($("#cbTipoRiesgo").val() !== 2)
            estado = $.trim(value) !== "";

        return estado;
    });

    $("#formAddOrEdit").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtAplicacion: {
                requiredSinEspacios: true,
                existeAplicacion: true
            },
            txtTecnologia: {
                requiredSinEspacios: true,
                existeTecnologia: true
            },
            cbTipoRiesgo: {
                requiredSelect: true
            },
            FechaFinExcepcion: {
                validFechaFinExcepcion: true
            },
            txtUrlInformacion: {
                requiredSinEspacios: true,
                url: true
            },
            txtComentario: {
                requiredSinEspacios: true
            },
            txtArchivo: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtAplicacion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la aplicación"),
                existeAplicacion: String.Format("{0} seleccionada no existe.", "La aplicación")
            },
            txtTecnologia: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la tecnología"),
                existeTecnologia: String.Format("{0} seleccionada no existe.", "La tecnología")
            },
            cbTipoRiesgo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo de riesgo"),
            },
            FechaFinExcepcion: {
                validFechaFinExcepcion: String.Format("Debes ingresar {0}.", "la fecha fin de excepción"),
            },
            txtUrlInformacion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la url de información"),
                url: String.Format("Debes ingresar {0}.", "url valida"),
            },
            txtComentario: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el comentario"),
            },
            txtArchivo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el archivo"),
            },
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "FechaFinExcepcion") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}
function OpenModal() {
    $("#titleForm").html("Nuevo " + TITULO_MENSAJE);
    $("#hdId").val("");
    MdAddOrEditRegistro(true);
}
function MdAddOrEditRegistro(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    if (EstadoMd)
        $("#MdAddOrEditModal").modal(opcionesModal);
    else
        $("#MdAddOrEditModal").modal("hide");
}
function LimpiarMdAddOrEditRegistro() {
    $(":input", "#formAddOrEdit").not(":button, :submit, :reset, :hidden, #txtArchivo").val("");
    $("select", "#formAddOrEdit").val(-1);
    //$(":input:hidden", "#formAddOrEdit").val("0");
    $("#txtAplicacion").val("");
    $("#hdAplicacionId").val("0");
    $("#txtTecnologia").val("");
    $("#hdTecnologiaId").val("0");
    $("#cbTipoRiesgo").val(-1);
    $("#FechaFinExcepcion").val("");
    $("#txtUrlInformacion").val("");
    $("#txtComentario").val("");
    EliminarArchivo();
    $("#hdArchivoId").val("0");
    $tableEquipo.bootstrapTable("destroy");
    $tableEquipo.bootstrapTable();
    LimpiarValidateErrores($("#formAddOrEdit"));
    //var validator = $("#formAddOrEdit").validate();
    //validator.resetForm();
}
function RegistrarAddOrEdit() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    if ($("#formAddOrEdit").valid()) {
        $("#btnRegistrar").button("loading");
        data = ObtenerExcepcion();

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                if (result > 0) {
                    let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
                    if ((archivoId === 0 && $("#txtArchivo").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                        let flagEliminar = !$(".div-controls-file").is(":visible");
                        UploadFile($("#flArchivo"), CODIGO_INTERNO, result, archivoId, flagEliminar);
                    }
                    toastr.success("Registrado correctamente.", TITULO_MENSAJE);
                    ListarRegistros();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            complete: function (data) {
                $("#btnRegistrar").button("reset");
                if (ControlarCompleteAjax(data))
                    MdAddOrEditRegistro(false);
                else
                    bootbox.alert("sucedió un error con el servicio", function () { });
            }
        });
    }
}
function IrEditarRegistro(Id) {
    //MdAddOrEditRegistro(true);
    LimpiarMdAddOrEditRegistro();
    $("#titleForm").html("Editar Excepción");
    let data = $table.bootstrapTable('getRowByUniqueId', Id);
    
    $("#hdId").val(data.Id);
    $("#hdAplicacionId").val(data.CodigoAPT);
    $("#txtAplicacion").val(data.AplicacionStr);
    $("#hdTecnologiaId").val(data.TecnologiaId);
    $("#txtTecnologia").val(data.TecnologiaStr);
    $("#hdTipoExcepcionId").val(data.TipoExcepcionId);
    $("#cbTipoRiesgo").val(data.TipoRiesgoId);
    $("#FechaFinExcepcion").val(data.FechaFinExcepcionFormato);
    $("#txtUrlInformacion").val(data.UrlInformacion);
    $("#txtComentario").val(data.Comentario);

    ListarEquipoTecnologia(data.TecnologiaId, $("#MdAddOrEditModal"));


    let data_Archivo = GetFileByEntidadIdByProcedenciaId(Id, CODIGO_INTERNO);
    if (data_Archivo !== null) {
        $("#txtArchivo").val(data_Archivo.Nombre);
        $("#hdArchivoId").val(data_Archivo.Id);
        $(".div-controls-file").show();
    }
    //$.ajax({
    //    url: URL_API_VISTA + "/" + Id,
    //    type: "GET",
    //    dataType: "json",
    //    success: function (result) {
    //        waitingDialog.hide();
    //        MdAddOrEditRegistro(true);
    //        $("#hdId").val(result.Id);
    //        $("#hdAplicacionId").val(result.CodigoAPT);
    //        $("#txtAplicacion").val(result.AplicacionStr);
    //        $("#hdTecnologiaId").val(result.TecnologiaId);
    //        $("#txtTecnologia").val(result.TecnologiaStr);
    //        $("#hdTipoExcepcionId").val(result.TipoExcepcionId);
    //        $("#cbTipoRiesgo").val(result.TipoRiesgoId);
    //        $("#FechaFinExcepcion").val(result.FechaFinExcepcionFormato);
    //        $("#txtUrlInformacion").val(result.UrlInformacion);
    //        $("#txtComentario").val(result.Comentario);
    //        if (result.ArchivoId != null) {
    //            $("#txtArchivo").val(result.ArchivoStr);
    //            $("#hdArchivoId").val(result.ArchivoId);
    //            $(".div-controls-file").show();
    //        }
    //    },
    //    error: function (xhr, ajaxOptions, thrownError) {
    //        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
    //        waitingDialog.hide();
    //    },
    //    async: true
    //});
}
function DescargarArchivo() {
    DownloadFile($("#hdArchivoId").val(), $("#txtArchivo"), "Excepción");
}
function IrEliminarRegistro(Id) {

    $.ajax({
        url: URL_API_VISTA + "/Eliminar?id=" + Id,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            if (result) {
                toastr.success("Eliminado correctamente.", TITULO_MENSAJE);
                ListarRegistros();
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (data) {
            if (!ControlarCompleteAjax(data))
                bootbox.alert("sucedió un error con el servicio", function () { });
        }
    });
}
function ObtenerExcepcion() {
    var data = {
        Id: $("#hdId").val(),
        CodigoAPT: $("#hdAplicacionId").val(),
        TecnologiaId: $("#hdTecnologiaId").val(),
        TipoExcepcionId: $("#hdTipoExcepcionId").val(),
        TipoRiesgoId: $("#cbTipoRiesgo").val() == -1 ? null : $("#cbTipoRiesgo").val(),
        FechaFinExcepcion: castDate($("#FechaFinExcepcion").val()),
        UrlInformacion: $("#txtUrlInformacion").val(),
        Comentario: $("#txtComentario").val(),
        Activo: true,
    };
    return data;
}
function opcionesFormatter(value, row) {
    let eliminar = "";
    let editar = "";
    eliminar = `<a href="javascript:IrEliminarRegistro(${value});" title="Eliminar registro"><i style="" class="glyphicon glyphicon-trash table-icon permiso-eliminar"></i></a>`
    editar = `<a href="javascript:IrEditarRegistro(${value});" title="Editar registro"><i style="" class="glyphicon glyphicon-edit table-icon permiso-editar"></i></a>`
    return editar.concat("&nbsp;&nbsp;", eliminar);
}
function InitAutocompletarAplicacion($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Aplicacion" + "/GetAplicacionByFiltro?filtro=" + request.term,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (data) {
                        DATA_APLICACION = data;
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else {
                return response(true);
            }
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
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
function InitAutocompletarTecnologia($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Tecnologia" + "/GetTecnologiaByClave?filtro=" + request.term,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (data) {
                        DATA_TECNOLOGIA = data;
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else {
                return response(true);
            }
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
            ListarEquipoTecnologia(ui.item.Id, null);
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
function InitAutocompletarEquipo($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Relacion" + "/GetEquipoByFiltro?filtro=" + request.term,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (data) {
                        DATA_EQUIPO = data;
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else {
                return response(true);
            }
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $IdBox.val(ui.item.Id);
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
function RefrescarListado() {
    ListarRegistros();
}
function ExisteAplicacion() {
    let estado = false;
    let Id = $("#hdAplicacionId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Aplicacion" + `/ExisteAplicacion?Id=${Id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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
function ExisteTecnologia() {
    let estado = false;
    let Id = $("#hdTecnologiaId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Tecnologia" + `/ExisteTecnologia?Id=${Id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }
    let url = `${URL_API_VISTA}/Exportar?filtro=${null}&username=${DATA_EXPORTAR.username}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&codigoAPT=${DATA_EXPORTAR.CodigoAPT}&tecnologiaId=${DATA_EXPORTAR.TecnologiaId}&equipoId=${DATA_EXPORTAR.EquipoId}&tipoExcepcionId=${DATA_EXPORTAR.TipoExcepcionId}&nombreExportar=${NOMBRE_EXPORTAR}`;
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
function EliminarArchivo() {
    $("#txtArchivo").val(TEXTO_SIN_ARCHIVO);
    $("#flArchivo").val("");
    $(".div-controls-file").hide();
}
function VistaPreviaArchivo() {

}
function ListarEquipoTecnologiaAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API + `/Equipo/GetEquipoByTecnologiaId?tecnologiaId=${tmp_params.tecnologiaId}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}&sortName=${tmp_params.sortName}&sortOrder=${tmp_params.sortOrder}`;
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    $.get(url).then(function (res) {
        params.success(res);
    }).fail(function () {
        params.success({ Rows: [], Total: 0 });
    });
}

function ListarEquipoTecnologia(tecId, $modal) {
    if ($modal !== null) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }

    $tableEquipo.bootstrapTable("destroy");
    $tableEquipo.bootstrapTable({
        locale: "es-SP",
        ajax: "ListarEquipoTecnologiaAjax",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "Nombre",
        sortOrder: "asc",
        uniqueId: "Id",
        queryParams: function (p) {
            return JSON.stringify({
                tecnologiaId: tecId,
                pageNumber: p.pageNumber,
                pageSize: p.pageSize,
                sortName: p.sortName,
                sortOrder: p.sortOrder
            });
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
            bootbox.alert("Se produjo un error al listar los registros");
        },
        onSort: function (name, order) {

        },
        onPageChange: function (number, size) {
        },
        onLoadSuccess: function (data) {
            if ($modal !== null) {
                $modal.modal(opcionesModal);
            }
        }

    });
}