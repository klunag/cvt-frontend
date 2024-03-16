var $table = $("#tblRegistro");
var $tableApExp = $("#tblApExp");
var $tblResults = $("#tblResults");
var $tableFlujosAprobacion = $("#tblFlujosAprobacion");

const URL_API_VISTA = URL_API + "/applicationportfolio";

const URL_API_GESTION = URL_API + "/Aplicacion/GestionAplicacion";
var ITEMS_REMOVEID = [];
var ITEMS_ADDID = [];
var DATA_MATRICULA = [];
var FLAG_TENEMOS_MATRICULA = false;
var DATA_EXPORTAR = {};
var USUARIO_DATOS = {};
const ESTADO_APLICACION = { ELIMINADA: "Eliminada", ENDESARROLLO: "En Desarrollo", NOVIGENTE: "No Vigente", VIGENTE: "Vigente" };
var DATA_TEST = [];

var COLUMNAS_TABLE = [];

//var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
//var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "CodigoAPT";
var ULTIMO_SORT_ORDER = "asc";

const TITULO_MENSAJE = "Portafolio de aplicaciones";
const MENSAJE = "¿Estás seguro que deseas continuar con desactivación de esta aplicación?, esta operación no es reversible y eliminará la aplicación de manera permanente.";

const arrMultiSelect = [
    { SelectId: "#cbFiltroGerencia", DataField: "GestionadoPor" },
    { SelectId: "#cbFiltroDivision", DataField: "EstadoAplicacion" },
    { SelectId: "#cbFiltroUnidad", DataField: "TipoActivo" },
    { SelectId: "#cbFiltroArea", DataField: "Gerencia" },
    { SelectId: "#cbFiltroEstado", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlClasificacionTecnica", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlSubclasificacionTecnica", DataField: "ClasificacionTecnica" },
    { SelectId: "#ddlTipoActivo", DataField: "ClasificacionTecnica" }
];

$(function () {
    InitTables();
    getColumnasBT();
    InitSelectMultiple(arrMultiSelect.map(x => x.SelectId));

    setDefaultHd($("#txtAplicacion"), $("#hdAplicacionId"));
    $("#btnExportar").click(ExportarInfo);

    CargarCombos();
    $("#txtAplicacion").val(nombre_app);
    ULTIMO_PAGE_NUMBER = PAGINA_ACTUAL;
    ULTIMO_REGISTRO_PAGINACION = PAGINA_TAMANIO;
    if (COLUMNAS_TABLE !== null && COLUMNAS_TABLE.length > 0) {
        ListarRegistros();
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, "No existen columnas seleccionadas.");
    }
    
    InitUpload($('#txtArchivo'), 'inputfile');

    $("#btnBuscar").click(RefrescarListado);
    $("#btnUpdate").click(IrActualizarApps);
    $("#btnDescarApps").click(DescargarAppsActualizar);
    $("#btnActualizar").click(ActualizarAplicaciones);
    $("#btnExportarValidacionCargaMasiva").attr('href', `${URL_API_VISTA}/GestionAplicacion/Exportar/ValidacionCargaMasiva`);

    $("#txtAplicacion").keypress(function (event) {
        if (event.keyCode === 13) {
            $("#btnBuscar").click();
            event.preventDefault();
        }
    });
});

function InitTables() {
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({ data: [] });

    $tableApExp.bootstrapTable("destroy");
    $tableApExp.bootstrapTable({ data: [] });

    $tblResults.bootstrapTable("destroy");
    $tblResults.bootstrapTable({ data: [] });
}

function CargarCombos() {
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/application/admin/lists",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItemsMultiple(dataObject.Gerencia.filter(x => x !== "" && x !== null), $("#cbFiltroGerencia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Division.filter(x => x !== "" && x !== null), $("#cbFiltroDivision"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Unidad.filter(x => x !== "" && x !== null), $("#cbFiltroUnidad"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.Area.filter(x => x !== "" && x !== null), $("#cbFiltroArea"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.ClasificacionTecnica.filter(x => x !== "" && x !== null), $("#ddlClasificacionTecnica"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.SubClasificacionTecnica.filter(x => x !== "" && x !== null), $("#ddlSubclasificacionTecnica"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.TipoActivo.filter(x => x !== "" && x !== null), $("#ddlTipoActivo"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(dataObject.EstadoAplicacion.filter(x => x !== "" && x !== null), $("#cbFiltroEstado"), TEXTO_TODOS, TEXTO_TODOS, true);
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
    
    nombre_app = $("#txtAplicacion").val();
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_GESTION + "/ListarAplicacionesDesestimadas",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: "POST",
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: ULTIMO_SORT_NAME,
        sortOrder: ULTIMO_SORT_ORDER,
        columns: COLUMNAS_TABLE,
        queryParams: function (p) {
            ULTIMO_PAGE_NUMBER = p.pageNumber;
            ULTIMO_REGISTRO_PAGINACION = p.pageSize;
            ULTIMO_SORT_NAME = p.sortName;
            ULTIMO_SORT_ORDER = p.sortOrder;

            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtFiltro").val());
            DATA_EXPORTAR.pageNumber = ULTIMO_PAGE_NUMBER;
            DATA_EXPORTAR.pageSize = ULTIMO_REGISTRO_PAGINACION;
            DATA_EXPORTAR.sortName = ULTIMO_SORT_NAME;
            DATA_EXPORTAR.sortOrder = ULTIMO_SORT_ORDER;

            DATA_EXPORTAR.Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val()); //$("#cbFiltroGerencia").val() === "-1" ? null : $("#cbFiltroGerencia").val();
            DATA_EXPORTAR.Division = CaseIsNullSendExport($("#cbFiltroDivision").val()); //$("#cbFiltroDivision").val() === "-1" ? null : $("#cbFiltroDivision").val();
            DATA_EXPORTAR.Unidad = CaseIsNullSendExport($("#cbFiltroUnidad").val()); //$("#cbFiltroUnidad").val() === "-1" ? null : $("#cbFiltroUnidad").val();
            DATA_EXPORTAR.Area = CaseIsNullSendExport($("#cbFiltroArea").val()); //$("#cbFiltroArea").val() === "-1" ? null : $("#cbFiltroArea").val();
            DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFiltroEstado").val()); //$("#cbFiltroEstado").val() === "-1" ? null : $("#cbFiltroEstado").val();
            DATA_EXPORTAR.ClasificacionTecnica = CaseIsNullSendExport($("#ddlClasificacionTecnica").val()); //$("#cbFiltroEstado").val() === "-1" ? null : $("#cbFiltroEstado").val();
            DATA_EXPORTAR.SubclasificacionTecnica = CaseIsNullSendExport($("#ddlSubclasificacionTecnica").val()); //$("#cbFiltroEstado").val() === "-1" ? null : $("#cbFiltroEstado").val();
            DATA_EXPORTAR.TipoActivo = CaseIsNullSendExport($("#ddlTipoActivo").val());
            DATA_EXPORTAR.Aplicacion = $("#hdAplicacionId").val() !== "0" ? $("#hdAplicacionId").val() : $("#txtAplicacion").val();  //: $("#hdAplicacionId").val(); //$("#txtAplicacion").val() || ""

            DATA_EXPORTAR.TablaProcedencia = String.Format("{0}", TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION);
            DATA_EXPORTAR.Procedencia = TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION;

            //DATA_EXPORTAR.JefeEquipo = $("#txtLiderTribu").val();
            //DATA_EXPORTAR.Owner = $("#txtProduct").val();
            //DATA_EXPORTAR.Aplicacion = $("#hAplicacion").val() !== "0" ? $("#hAplicacion").val() : $("#txtAplicacion").val();

            //DATA_EXPORTAR.username = USUARIO.UserName;
            //DATA_EXPORTAR.PerfilId = USUARIO.UsuarioBCP_Dto.PerfilId;

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

function linkFormatterName(value, row, index) {
    return `<a href="#" title="Ver detalle">${value}</a>`;
}

function RefrescarListado() {
    //let filtro = $("#txtFiltro").val();
    //$("#hdFiltro").val(filtro);
    //$table.bootstrapTable("refresh");
    ListarRegistros();
}

function ValidarCampos() {

    $.validator.addMethod("existeMatricula", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            estado = ExisteMatricula();
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("requiredMinExperto", function (value, element) {
        let minRegistro = $tableApExp.bootstrapTable('getData');
        let estado = minRegistro.length > 0 ? true : false;
        return estado;
    });
    //$.validator.addMethod("existeMatricula2", function (value, element) {
    //    if (!FLAG_TENEMOS_MATRICULA) return true;
    //    let data = DATA_MATRICULA.find(x => x.Id === value) || null;
    //    if (data !== null) {
    //        return true;
    //    }
    //    return false;
    //});

    $("#formRegistro").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtMatricula: {
                requiredSinEspacios: true,
                existeMatricula: true
            },
            ddlTipo: {
                requiredSelect: true
            },
            msjValid: {
                requiredMinExperto: true
            }
        },
        messages: {
            txtMatricula: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la matrícula"),
                existeMatricula: "No fue posible ubicar la matrícula"
            },
            ddlTipo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo")
            },
            msjValid: {
                requiredMinExperto: String.Format("Debes agregar {0}.", "un responsable como mínimo")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtMatricula") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function opcionesFormatter(value, row) {
    let verFicha = "";
    let verFlujos = "";

    verFicha = `<a href="FichaAplicacionDesestimada?id=${row.AppId}&&nom_App=${nombre_app}&paginaActual=${ULTIMO_PAGE_NUMBER}&paginaTamanio=${ULTIMO_REGISTRO_PAGINACION}" title="Ver ficha y editar"><i class="glyphicon glyphicon-share table-icon"></i></a>`;
    verFlujos = `<a href="#" onclick="javascript:verFlujosAplicacion(${row.AppId})" title="Ver flujos de aprobación"><i class="glyphicon glyphicon-time table-icon"></i></a>`;

    return verFicha.concat("&nbsp;&nbsp;", verFlujos);
}

function estadoFormatter(value, row, index) {
    var html = "";
    if (row.isCompleted === true) { //VERDE
        html = '<a class="btn btn-success btn-circle" title="Atendida"></a>';
    } else if (row.isCompleted === false) { //ROJO
        html = '<a class="btn btn-danger btn-circle" title="Pendiente de atención"></a>';
    }
    return html;
}

/*function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre == null ? '' : DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&criticidadId=${DATA_EXPORTAR.CriticidadId}&gerencia=${DATA_EXPORTAR.Gerencia == null ? '' : DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division == null ? '' : DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad == null ? '' : DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area == null ? '' : DATA_EXPORTAR.Area}`;
    let url = `${URL_API_VISTA}/ExportarConfiguracion?nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&gerencia=${DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area}&estado=${DATA_EXPORTAR.Estado}&aplicacion=${DATA_EXPORTAR.Aplicacion}&jefeequipo=${DATA_EXPORTAR.JefeEquipo}&owner=${DATA_EXPORTAR.Owner}`;
    window.location.href = url;
}*/

function validarFormImportar() {
    $.validator.addMethod("requiredArchivo", function (value, element) {
        return $.trim(value) !== "";
    });

    $.validator.addMethod("requiredExcel", function (value, element) {
        //let estado = true;
        let validExts = new Array(".xlsx", ".xls");
        let fileExt = value;
        //console.log(fileExt);
        fileExt = fileExt.substring(fileExt.lastIndexOf('.'));

        return validExts.indexOf(fileExt) < 0 ? false : true;
    });

    $("#formImportar").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            //cbTipoEquipoFil: {
            //    requiredSelect: true
            //},
            flArchivo: {
                requiredArchivo: true,
                requiredExcel: true
            }
        },
        messages: {
            //cbTipoEquipoFil: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo de equipo")
            //},
            flArchivo: {
                requiredArchivo: String.Format("Debes cargar {0}.", "un archivo"),
                requiredExcel: String.Format("Debes cargar {0}.", "un archivo válido")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtArchivo" || element.attr('name') === "flArchivo") {
                element.parent().parent().parent().parent().append(error);
            }
            else {
                element.parent().append(error);
            }
        }
    });
}

function InitUpload($inputText, classInput) {
    var inputs = document.querySelectorAll(`.${classInput}`);
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
                $inputText.val(fileName);
            else
                label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
}

function IrActualizarApps() {
    //$("#btnActualizar").show();
    //$(".onlyUpdate").show();
    //$(".onlyUpdate").removeClass("ignore");
    LimpiarValidateErrores($("#formImportar"));
    $("#titleFormImp").html(String.Format("{0} aplicaciones", "Actualización masiva de"));
    $("#flArchivo").val("");
    $("#txtArchivo").val(TEXTO_SIN_ARCHIVO);
    //$("#cbTipoEquipoFil").val("-1");
    $("#mdImportar").modal(opcionesModal);
}

function DescargarAppsActualizar() {
    let url = `${URL_API_VISTA}/GestionAplicacion/Exportar/Actualizar?sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function ActualizarAplicaciones() {
    if ($("#formImportar").valid()) {

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $("#btnActualizar").button("loading");

        let formData = new FormData();
        let file = $("#flArchivo").get(0).files;
        formData.append("File", file[0]);

        $.ajax({
            url: URL_API_VISTA + "/GestionAplicacion/ActualizarAplicaciones",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        let dataRetorno = dataObject;
                        waitingDialog.hide();

                        $("#mdImportar").modal("hide");
                        showDetalleCarga(dataRetorno);
                    }
                }
            },
            complete: function (data) {
                $("#btnActualizar").button("reset");
                waitingDialog.hide();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function SetDescripcionCarga(errores) {
    let descripcion = "Se realizó la actualización masiva de aplicaciones correctamente";
    if (errores.length > 0) {
        descripcion = "La actualización masiva de aplicaciones ha finalizado, se encontraron inconvenientes al procesar algunos registros.";
    }
    $("#pDetalleCarga").html(descripcion);
}

function showDetalleCarga(_data) {
    if (_data) {
        let total = _data.TotalRegistros;
        let totalUpdate = _data.TotalActualizados;
        $("#txtTotal").val(total || "0");
        $("#txtTotalUpdate").val(totalUpdate || "0");

        let errores = _data.Errores || [];
        SetDescripcionCarga(errores);

        if (errores !== null && errores.length > 0) {
            $(".error-div").show();
            $tblResults.bootstrapTable("destroy");
            $tblResults.bootstrapTable({
                data: errores,
                pagination: true,
                pageNumber: 1,
                pageSize: 10
            });
        } else {
            $(".error-div").hide();
        }

        $('#mdImportar').on('hidden.bs.modal', function () {
            OpenCloseModal($("#mdResults"), true);
        });
    }
}

function descripcionFormatter(value, row) {
    //let formatter = "<p class='opcionesStyle'>" + value + "</p>";
    let newStr = ReduceDimString(value, 105);
    let formatter = `<p class='opcionesStyle'>${newStr}</p>`;
    return formatter;
}

function generalFormatter(value, row) {
    let formatter = value;
    return formatter;
}

function getColumnasBT() {
    let tablaProcedencia = String.Format("{0}", TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION);
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_GESTION + `/GetColumnasPublicacionAplicacionToJSAppsDesestimadas?tablaProcedencia=${tablaProcedencia}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    COLUMNAS_TABLE = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    //return columnas;

}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Gerencia = CaseIsNullSendExport($("#cbFiltroGerencia").val());
    DATA_EXPORTAR.Division = CaseIsNullSendExport($("#cbFiltroDivision").val());
    DATA_EXPORTAR.Unidad = CaseIsNullSendExport($("#cbFiltroUnidad").val());
    DATA_EXPORTAR.Area = CaseIsNullSendExport($("#cbFiltroArea").val());
    DATA_EXPORTAR.Estado = CaseIsNullSendExport($("#cbFiltroEstado").val());
    DATA_EXPORTAR.ClasificacionTecnica = CaseIsNullSendExport($("#ddlClasificacionTecnica").val());
    DATA_EXPORTAR.SubclasificacionTecnica = CaseIsNullSendExport($("#ddlSubclasificacionTecnica").val());
    DATA_EXPORTAR.TipoActivo = CaseIsNullSendExport($("#ddlTipoActivo").val());
    DATA_EXPORTAR.Aplicacion = $("#hdAplicacionId").val() !== "0" ? $("#hdAplicacionId").val() : $("#txtAplicacion").val();
    DATA_EXPORTAR.sortName = 'CodigoAPT';
    DATA_EXPORTAR.sortOrder = 'asc';

    //DATA_EXPORTAR.TablaProcedencia = String.Format("{0}", TABLA_PROCEDENCIA_ID.DATA_APLICACION);
    //DATA_EXPORTAR.Procedencia = TABLA_PROCEDENCIA_ID.DATA_APLICACION;

    DATA_EXPORTAR.TablaProcedencia = String.Format("{0}", TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION);
    DATA_EXPORTAR.Procedencia = TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION;

    let url = `${URL_API_VISTA}/ExportarAplicacionesDesestimadas?gerencia=${DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area}&estado=${DATA_EXPORTAR.Estado}&clasificacionTecnica=${DATA_EXPORTAR.ClasificacionTecnica}&subclasificacionTecnica=${DATA_EXPORTAR.SubclasificacionTecnica}&aplicacion=${DATA_EXPORTAR.Aplicacion}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&TablaProcedencia=${DATA_EXPORTAR.TablaProcedencia}&Procedencia=${DATA_EXPORTAR.Procedencia}&TipoActivo=${DATA_EXPORTAR.TipoActivo}`;
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

function eliminarAplicacion(id) {
    let pag = {
        Id: id,
    };

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA + `/application/deleteApplication`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(pag),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                RefrescarListado();
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

function verFlujosAplicacion(id) {
    $("#hdAplicacionDetalleId").val(id);
    ListarFlujosAprobacion(id);
    OpenCloseModal($("#modalVerFlujosAprobacion"), true);
}

function ListarFlujosAprobacion(id) {
    $tableFlujosAprobacion.bootstrapTable('destroy');
    $tableFlujosAprobacion.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/application/flows`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: 1,
        pageSize: 10,
        pageList: OPCIONES_PAGINACION,
        sortName: "typeRegister",
        sortOrder: "asc",
        queryParams: function (p) {            
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.id = $.trim($("#hdAplicacionDetalleId").val());

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

function dateFormat2(value, row, index) {
    return moment(value).format('DD/MM/YYYY HH:mm:ss');
}