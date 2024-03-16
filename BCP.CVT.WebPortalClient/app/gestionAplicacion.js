var $tblRegistro = $("#tblRegistro");
var URL_API_VISTA = URL_API + "/Aplicacion/GestionAplicacion";
var URL_API_USUARIO = URL_API + "/Usuario";
var ITEMS_REMOVEID = [];
var ITEMS_ADDID = [];
var DATA_MATRICULA = [];
var FLAG_TENEMOS_MATRICULA = false;
var DATA_EXPORTAR = {};
var USUARIO_DATOS = {};
var TITULO_MENSAJE = "Gestion de Aplicaciones";
var ESTADO_SOLICITUD_APP = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };

$(function () {

    $tblRegistro.bootstrapTable("destroy");
    $tblRegistro.bootstrapTable({ data: [] });

    InitAutocompletarBuilder($("#txtLiderTribu"), null, ".tribuContainer", "/Aplicacion/GetJefeEquipoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtProduct"), null, ".usuarioContainer", "/Aplicacion/GetOwnerByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtAplicacion"), $("#hAplicacion"), ".appContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");

   // ValidarCampos();
    CargarCombos();
    ListarRegistros();

    setDefaultHd($("#txtAplicacion"), $("#hAplicacion"));
});

function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Aplicacion/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItems(dataObject.Criticidad, $("#cbFiltroCriticidad"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Gerencia, $("#cbFiltroGerencia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Division, $("#cbFiltroDivision"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Unidad, $("#cbFiltroUnidad"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Area, $("#cbFiltroArea"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Estado, $("#cbFiltroEstado"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoExperto, $("#ddlTipo"), TEXTO_SELECCIONE);
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
    $tblRegistro.bootstrapTable('destroy');
    $tblRegistro.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
        method: "POST",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: "server",
        queryParamsType: "else",
        sortName: "CodigoAPT",
        sortOrder: "asc",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;
            DATA_EXPORTAR.EstadoSolicitud = [];

            DATA_EXPORTAR.Gerencia = $("#cbFiltroGerencia").val() === "-1" ? null : $("#cbFiltroGerencia").val();
            DATA_EXPORTAR.Division = $("#cbFiltroDivision").val() === "-1" ? null : $("#cbFiltroDivision").val();
            DATA_EXPORTAR.Unidad = $("#cbFiltroUnidad").val() === "-1" ? null : $("#cbFiltroUnidad").val();
            DATA_EXPORTAR.Area = $("#cbFiltroArea").val() === "-1" ? null : $("#cbFiltroArea").val();
            DATA_EXPORTAR.Estado = $("#cbFiltroEstado").val() === "-1" ? null : $("#cbFiltroEstado").val();
            DATA_EXPORTAR.JefeEquipo = $.trim($("#txtLiderTribu").val());
            DATA_EXPORTAR.Owner = $.trim($("#txtProduct").val());
            DATA_EXPORTAR.Aplicacion = $("#hAplicacion").val() !== "0" ? $("#hAplicacion").val() : $.trim($("#txtAplicacion").val());

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

function MdAddOrEditRegistro(EstadoMd) {
    LimpiarMdAddOrEditRegistro();
    if (EstadoMd)
        $("#MdAddOrEditModal").modal(opcionesModal);
    else
        $("#MdAddOrEditModal").modal("hide");
}
function LimpiarMdAddOrEditRegistro() {
    $("#formRegistro").validate().resetForm();
    $(":input", "#formRegistro")
        .not(":button, :submit, :reset, :hidden")
        .val("")
        .removeAttr("checked")
        .removeAttr("selected");
    ITEMS_REMOVEID = [];
    ITEMS_ADDID = [];
    $("#hdId").val("");
    $tableApExp.bootstrapTable("destroy");
    $tableApExp.bootstrapTable({ data: [] });
    toastr.clear();
}
function GuardarRegistro() {
    $(".inputMatricula").addClass("ignore");
    $(".guardarExperto").removeClass("ignore");

    if ($("#formRegistro").valid()) {

        $("#btnGuardarRegistro").button("loading");

        ITEMS_ADDID = $tableApExp.bootstrapTable("getData");

        let data = {
            CodigoAPT: $("#hdId").val(),
            ListIdsRegistrar: ITEMS_ADDID,
            ListIdsEliminar: ITEMS_REMOVEID,
        };

        $.ajax({
            url: URL_API_VISTA + "/ActualizarExperto",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                $("#btnGuardarRegistro").button("reset");
                if (result) {
                    toastr.success("El registro se actualizó correctamente.", TITULO_MENSAJE);
                    MdAddOrEditRegistro(false);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
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
    let style_color = row.FlagRelacionar ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.FlagRelacionar ? "check" : "unchecked";
    let editarResponsables = `<a href="javascript:IrObtenerResponsablesApExp('${value}');" title="Editar responsables"><i style="" class="glyphicon glyphicon-user table-icon"></i></a>`;
    let editarFlagRelacionar = `<a href="javascript:cambiarFlagRelacionar('${value}')" title="Editar condición"><i style="" id="chkRelacionar${value}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    editarResponsables = "";
    editarFlagRelacionar = "";
    return editarFlagRelacionar.concat("&nbsp;&nbsp;", editarResponsables);
}
function cambiarFlagRelacionar(Id) {
    let FlagRelacionar = !($(`#chkRelacionar${Id}`).hasClass("iconoVerde"));
    bootbox.confirm({
        message: String.Format("¿Estás seguro que deseas {0} la condición de relacionar?", `${FlagRelacionar ? "activar" : "desactivar"}`),
        buttons: {
            confirm: {
                label: 'Aceptar',
                className: 'btn-primary'
            },
            cancel: {
                label: 'Cancelar',
                className: 'btn-secondary'
            }
        },
        callback: function (result) {
            let data = {
                Id: Id,
                Flag: FlagRelacionar
            };

            if (result) {
                $.ajax({
                    url: URL_API_VISTA + "/CambiarFlagRelacionar",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(data),
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (result) {
                        if (result) {
                            toastr.success("La aplicación se actualizó correctamente", TITULO_MENSAJE);
                            ListarRegistros();
                        }
                        else {
                            toastr.error("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    },
                    complete: function (data) {
                        //RefrescarListado();
                    }
                });
            }
        }
    });
}
function IrObtenerResponsablesApExp(Id) {
    $("#titleForm").html("Configurar responsables");
    $("#txtMatricula").val("");
    $("#ddlTipo").val("-1");
    $.ajax({
        url: URL_API_VISTA + `/ObtenerAplicacionExperto?Id=${Id}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            MdAddOrEditRegistro(true);
            $("#hdId").val(Id);
            $tableApExp.bootstrapTable("destroy");
            $tableApExp.bootstrapTable({ data: result });
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}
function opcionesFormatterApExp(value, row) {
    let eliminar = `<a class='btn btn-danger' href="javascript:removeItem('${row.Matricula}');" title="Eliminar registro"><span class='icon icon-trash-o'></span></a>`;
    return eliminar;
}
function IrEliminarApExp(Id) {
    bootbox.confirm("¿Estás seguro que deseas eliminar el registro seleccionado?", function (result) {
        if (result) {
            ITEMS_REMOVEID.push(Id);
            $tableApExp.bootstrapTable("remove", { field: 'Id', values: [Id] });
        }
    });
}
function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre == null ? '' : DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&criticidadId=${DATA_EXPORTAR.CriticidadId}&gerencia=${DATA_EXPORTAR.Gerencia == null ? '' : DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division == null ? '' : DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad == null ? '' : DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area == null ? '' : DATA_EXPORTAR.Area}`;
    let url = `${URL_API_VISTA}/ExportarConfiguracion?nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&gerencia=${DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area}&estado=${DATA_EXPORTAR.Estado}&aplicacion=${DATA_EXPORTAR.Aplicacion}&jefeequipo=${DATA_EXPORTAR.JefeEquipo}&owner=${DATA_EXPORTAR.Owner}`;
    window.location.href = url;
}
function ExportarResponsables() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre == null ? '' : DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&criticidadId=${DATA_EXPORTAR.CriticidadId}&gerencia=${DATA_EXPORTAR.Gerencia == null ? '' : DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division == null ? '' : DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad == null ? '' : DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area == null ? '' : DATA_EXPORTAR.Area}`;
    let url = `${URL_API_VISTA}/ExportarResponsables?nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&gerencia=${DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area}&estado=${DATA_EXPORTAR.Estado}&aplicacion=${DATA_EXPORTAR.Aplicacion}&jefeequipo=${DATA_EXPORTAR.JefeEquipo}&owner=${DATA_EXPORTAR.Owner}`;
    window.location.href = url;
}

function removeItem(id) {
    bootbox.confirm({
        title: "Eliminar Responsable",
        message: "¿Estás seguro que deseas eliminar al responsable de la aplicación?",
        buttons: {
            confirm: {
                label: 'Aceptar',
                className: 'btn-primary'
            },
            cancel: {
                label: 'Cancelar',
                className: 'btn-secondary'
            }
        },
        callback: function (result) {
            if (result) {
                //let data = {
                //    Id: id,
                //    Usuario: USUARIO.UserName
                //};

                let existe = ITEMS_REMOVEID.find(x => x === id) || null;
                if (existe === null) {
                    ITEMS_REMOVEID.push(id);
                }
                $tableApExp.bootstrapTable("remove", {
                    field: "Matricula", values: [id]
                });

                //$.ajax({
                //    url: URL_API_VISTA + "/CambiarFlagExperto",
                //    type: "POST",
                //    contentType: "application/json; charset=utf-8",
                //    data: JSON.stringify(data),
                //    dataType: "json",
                //    success: function (result) {
                //        if (result) {
                //            toastr.success("La operación se realizó correctamente", "Aplicación");
                //            MdAddOrEditRegistro(false);
                //        }
                //        else {
                //            toastr.error("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "Aplicación");
                //        }
                //    },
                //    error: function (xhr, ajaxOptions, thrownError) {
                //        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                //    },
                //    complete: function (data) {
                //        //RefrescarListado();
                //    }
                //});

            }
        }
    });
}
function addItem() {

    //console.log(matricula);
    //TODO
    //LimpiarValidateErrores($("#formRegistro"));
    $(".inputMatricula").removeClass("ignore");
    $(".guardarExperto").addClass("ignore");

    if ($("#formRegistro").valid()) {
        //console.log("Form valido");
        //let matricula = $("#txtMatricula").val();
        AgregarExperto();

    }

}

function AgregarExperto() {
    let matricula = $("#txtMatricula").val();
    var estItem = $tableApExp.bootstrapTable('getRowByUniqueId', matricula);
    //debugger;
    if (estItem === null) {
        var dataTmp = $tableApExp.bootstrapTable('getData');
        var idx = 0;
        var ultId = dataTmp.length === 0 ? (1 * -1000) : dataTmp[dataTmp.length - 1].Id;
        ultId = ultId === null ? 0 : ultId;
        idx = ultId > 0 ? dataTmp.length * -1000 : ultId - 1000;

        $tableApExp.bootstrapTable('append', {
            Id: idx,
            CodApp: $("#hdId").val(),
            Activo: true,
            ActivoDetalle: "Activo",
            Matricula: USUARIO_DATOS.Matricula,
            Nombres: USUARIO_DATOS.Nombres,
            TipoExpertoId: parseInt($("#ddlTipo").val()),
            TipoExpertoToString: $("#ddlTipo option:selected").text(),
            FlagEliminado: false
        });
    } else {
        bootbox.alert("La matrícula no se debe repetir en el cuadro de responsables");
    }
}

function ExisteMatricula() {
    let estado = false;
    let matricula = $("#txtMatricula").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_LOGIN_SERVER + `/ObtenerDatosUsuario?correoElectronico=${matricula}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    USUARIO_DATOS = dataObject;
                    let EstadoUser = dataObject.Estado;
                    estado = EstadoUser !== 1 ? false : true;
                    //estado = dataObject;
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

function NombreFormatter(value, row, index) {
    let url = "";
    if (row.AplicacionDetalle.EstadoSolicitudId === ESTADO_SOLICITUD_APP.REGISTRADO)
        url = `<a href="NuevaAplicacion?Id=${row.Id}" title="Editar" target="_blank">${value}</a>`;
    else
        url = `<a href="NuevaAplicacion?Id=${row.Id}" title="Ver detalle" target="_blank">${value}</a>`;

    return url;
}