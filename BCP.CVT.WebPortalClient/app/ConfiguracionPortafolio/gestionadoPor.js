var $table = $("#tblRegistro");
var $tblRegInactivos = $("#tblRegInactivos");
var $tblTeamSquadLinked = $("#tblTeamSquadLinked");
var $tblTribeLeaderLinked = $("#tblTribeLeaderLinked");

var DATA_EXPORTAR = {};
var DATA_EXPORTAR_TS = {};
var DATA_EXPORTAR_TL = {};
var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "Id";
var ULTIMO_SORT_ORDER = "asc";

const TITULO_MENSAJE = "Gestionado Por";
const URL_API_VISTA = URL_API + "/Aplicacion/ConfiguracionPortafolio";
const URLS_CRUD = {
    UrlListado: "ListarGestionadoPor",
    UrlGetById: "GetGestionadoPorById",
    UrlAddOrEdit: "AddOrEditGestionadoPor",
    UrlCambiarEstado: "CambiarEstadoGestionadoPor",
    UrlExportar: "ExportarGestionadoPor",
    UrlExisteCodigoSIGA: "ExisteCodigoSIGAByFilter",
    UrlTeamSquadLinked: "GetTeamSquadByGestionadoPorId",
    UrlUpdateResponsibleTeamSquad: "UpdateResponsibleTeamSquad",
    UrlTribeLeaderLinked: "GetTribeLeaderByGestionadoPorId",
    UrlUpdateResponsibleTribeLeader: "UpdateResponsibleTribeLeader"
};

var DATA_TBL01 = {
    TBL: $table,
    ULTIMO_REGISTRO_PAGINACION: REGISTRO_PAGINACION,
    ULTIMO_PAGE_NUMBER: 1,
    ULTIMO_SORT_NAME: "Id",
    ULTIMO_SORT_ORDER: "asc"
};

var DATA_TBL02 = {
    TBL: $tblRegInactivos,
    ULTIMO_REGISTRO_PAGINACION: REGISTRO_PAGINACION,
    ULTIMO_PAGE_NUMBER: 1,
    ULTIMO_SORT_NAME: "Id",
    ULTIMO_SORT_ORDER: "asc"
};

$(function () {
    InitCBs();
    ListarRegistros();
    validarFormRegistro();
    InitAcciones();
});

function InitCBs() {
    FormatoCheckBox($("#divFlagEquipoAgil"), "ckbEquipoAgil");
    FormatoCheckBox($("#divFlagAppsUserIT"), "ckbAppUserIT");
    FormatoCheckBox($("#divFlagSubsidiarias"), "ckbSubsidiarias");
    FormatoCheckBox($("#divFlagJefeEquipos"), "ckbJefeEquipos");
}

function InitAcciones() {
    $("#btnBuscar").click(RefrescarListado);
    $("#btnNuevo").click(AddRegistro);
    $("#btnPreview").click(Preview);
    $("#btnRegistrar").click(GuardarRegistro);
    $("#btnRegInactivos").click(ShowRegInactivos);
    $("#btnExportarInactivos").click(ExportarInactivos);

    $("#btnIconCloseTS, #btnCloseTS").click(CloseTeamSquadModal);
    $("#btnIconCloseTL, #btnCloseTL").click(CloseTribeLeaderModal);
}

function CloseTeamSquadModal() {
    OpenCloseModal($("#mdTeamSquadLinked"), false);
    $tblTeamSquadLinked.bootstrapTable("destroy");
}

function CloseTribeLeaderModal() {
    OpenCloseModal($("#mdTribeLeaderLinked"), false);
    $tblTribeLeaderLinked.bootstrapTable("destroy");
}

function Preview() {    
    InitSelectBuilderCustom($("#ddlPreview"), "/Aplicacion/ConfiguracionPortafolio/GetGestionadoPorByFiltro", "");
    OpenCloseModal($("#mdPreview"), true);
}

function RefrescarListado() {
    ListarRegistros();
}

function ShowRegInactivos() {
    ListarRegistros(false);
}

function AddRegistro() {
    $("#title-md").html("Nuevo registro");
    LimpiarModal();
    OpenCloseModal($("#mdRegistro"), true);
}

function LimpiarModal() {
    LimpiarValidateErrores($("#formAddOrEditRegistro"));
    $(":input", "#formAddOrEditRegistro").val("");
    $("#ckbEquipoAgil").prop("checked", false);
    $("#ckbEquipoAgil").bootstrapToggle("off");
    $("#ckbAppUserIT").prop("checked", false);
    $("#ckbAppUserIT").bootstrapToggle("off");
    $("#ckbSubsidiarias").prop("checked", false);
    $("#ckbSubsidiarias").bootstrapToggle("off");
    $("#ckbJefeEquipos").prop("checked", false);
    $("#ckbJefeEquipos").bootstrapToggle("off");
}

function ListarRegistros(isActive = true) {
    let DATA_TEMP = isActive ? DATA_TBL01 : DATA_TBL02;

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    DATA_TEMP.TBL.bootstrapTable('destroy');
    DATA_TEMP.TBL.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/${URLS_CRUD.UrlListado}`,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: DATA_TEMP.ULTIMO_PAGE_NUMBER,
        pageSize: DATA_TEMP.ULTIMO_REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: DATA_TEMP.ULTIMO_SORT_NAME,
        sortOrder: DATA_TEMP.ULTIMO_SORT_ORDER,
        queryParams: function (p) {
            DATA_TEMP.ULTIMO_PAGE_NUMBER = p.pageNumber;
            DATA_TEMP.ULTIMO_REGISTRO_PAGINACION = p.pageSize;
            DATA_TEMP.ULTIMO_SORT_NAME = p.sortName;
            DATA_TEMP.ULTIMO_SORT_ORDER = p.sortOrder;

            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtFiltro").val());
            DATA_EXPORTAR.Activos = isActive;

            DATA_EXPORTAR.pageNumber = DATA_TEMP.ULTIMO_PAGE_NUMBER;
            DATA_EXPORTAR.pageSize = DATA_TEMP.ULTIMO_REGISTRO_PAGINACION;
            DATA_EXPORTAR.sortName = DATA_TEMP.ULTIMO_SORT_NAME;
            DATA_EXPORTAR.sortOrder = DATA_TEMP.ULTIMO_SORT_ORDER;

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
        },
        onLoadSuccess: function (data) {
            if (!isActive) {
                OpenCloseModal($("#mdRegInactivos"), true);
            }
        }
    });
}

function GuardarRegistro() {
    if ($("#formAddOrEditRegistro").valid()) {
        $("#btnRegistrar").button("loading");

        let data = {
            Id: ($("#hdRegistroId").val() === "") ? 0 : parseInt($("#hdRegistroId").val()),
            Nombre: $.trim($("#txtNombre").val()),
            Descripcion: $.trim($("#txtDescripcion").val()),
            CodigoSIGA: $.trim($("#txtCodigoSIGA").val()),
            FlagEquipoAgil: $("#ckbEquipoAgil").prop("checked"),
            FlagUserIT: $("#ckbAppUserIT").prop("checked"),
            FlagSubsidiarias: $("#ckbSubsidiarias").prop("checked"),
            FlagJefeEquipo: $("#ckbJefeEquipos").prop("checked"),
        };

        $.ajax({
            url: URL_API_VISTA + `/${URLS_CRUD.UrlAddOrEdit}`,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (result) {                
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                RefrescarListado();
            },
            complete: function () {
                $("#btnRegistrar").button("reset");
                OpenCloseModal($("#mdRegistro"), false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function EditarRegistro(_id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#title-md").html("Editar Gestionado por");
    $.ajax({
        url: URL_API_VISTA + `/${URLS_CRUD.UrlGetById}?id=${_id}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "GET",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;
                    LimpiarModal();
                    OpenCloseModal($("#mdRegistro"), true);

                    $("#hdRegistroId").val(data.Id);
                    $("#txtNombre").val(data.Nombre);
                    $("#txtCodigoSIGA").val(data.CodigoSIGA);
                    $("#txtDescripcion").val(data.Descripcion);
                    $("#ckbEquipoAgil").prop('checked', data.FlagEquipoAgil);
                    $("#ckbEquipoAgil").bootstrapToggle(data.FlagEquipoAgil ? 'on' : 'off');
                    $("#ckbAppUserIT").prop('checked', data.FlagUserIT);
                    $("#ckbAppUserIT").bootstrapToggle(data.FlagUserIT ? 'on' : 'off');
                    $("#ckbSubsidiarias").prop('checked', data.FlagSubsidiarias);
                    $("#ckbSubsidiarias").bootstrapToggle(data.FlagSubsidiarias ? 'on' : 'off');
                    $("#ckbJefeEquipos").prop('checked', data.FlagJefeEquipo);
                    $("#ckbJefeEquipos").bootstrapToggle(data.FlagJefeEquipo ? 'on' : 'off');
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function validarFormRegistro() {
    $.validator.addMethod("existeCodigoSIGA", function (value, element) {
        let estado = true;
        let codigo = $("#txtCodigoSIGA").val().trim();
        if (codigo.length > 0) estado = ExisteCodigoSIGA(codigo);

        return estado;
    });

    $.validator.addMethod("existeNombreEntidad", function (value, element) {
        let estado = true;
        let id = $("#hdRegistroId").val() === "" ? 0 : parseInt($("#hdRegistroId").val());
        let txtValor = $.trim(value);
        if (txtValor !== "" && txtValor.length > 2)
            estado = !ExisteNombreEntidadByConfiguracion(id, txtValor, ENTIDAD_MANTENIMIENTO);

        return estado;
    });

    $("#formAddOrEditRegistro").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNombre: {
                requiredSinEspacios: true,
                existeNombreEntidad: true
            },
            txtCodigoSIGA: {
                existeCodigoSIGA: true
            }
        },
        messages: {
            txtNombre: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre"),
                existeNombreEntidad: "El nombre ya existe"
            },
            txtCodigoSIGA: {
                existeCodigoSIGA: "El código ingresado no existe"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtDistribuida" || element.attr('name') === "txtMainframe"
                || element.attr('name') === "txtPaqueteSaas" || element.attr('name') === "txtUserItMacro"
                || element.attr('name') === "txtUserItWeb" || element.attr('name') === "txtUserItCliente") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function linkFormatter(value, row, index) {
    let option = value;
    if (row.Activo) {
        option = `<a href="javascript:EditarRegistro(${row.Id})" title="Editar registro">${value}</a>`;
    }
    return option;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";

    let btnOpc1 = "";
    let btnOpc2 = "";

    let btnEstado = `<a href="javascript:CambiarEstadoRegistro(${row.Id}, ${row.Activo})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    let btnEliminar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar registro"><i class="${style_color} glyphicon glyphicon-trash"></i></a>`;

    if (row.FlagEquipoAgil || row.FlagJefeEquipo) {
        btnOpc1 = `<a href="javascript:listTeamSquadLinkedByGestionadoPor(${row.Id})" title="Mostrar equipos asociados"><i class="${style_color} glyphicon glyphicon-th-large"></i></a>`;
    }

    if (row.FlagEquipoAgil) {
        btnOpc2 = `<a href="javascript:listTribeLeaderLinkedByGestionadoPor(${row.Id})" title="Mostrar Tribe Leader asociados"><i class="${style_color} glyphicon glyphicon glyphicon-th"></i></a>`;
    }


    return btnEstado.concat("&nbsp;&nbsp;", btnEliminar).concat("&nbsp;&nbsp;", btnOpc1).concat("&nbsp;&nbsp;", btnOpc2);
}

function opcionesTS(value, row, index) {
    let btnSave = `<a class="btn btn-primary" href="javascript:saveTeamSquadResp(${row.Id}, ${row.GestionadoPorId})" title="Guardar cambios">
                        Guardar
                    </a>`;

    return btnSave;
}

function BtnFormatter(value, row, index) {
    let btnSave = `<a class="btn btn-primary" href="javascript:saveTribeLeaderResp(${row.Id}, ${row.GestionadoPorId})" title="Guardar cambios">
                        Guardar
                    </a>`;

    return btnSave;
}

function InputRespFormatter(value, row, index) {
    let html = `
                    <div class="respContainerNew${row.Id}">
                        <input id="txtMatriculaResponsableNew${row.Id}" class="form-control" type="text" name="txtMatriculaResponsableNew${row.Id}" value="${row.Responsable}">
                        <input id="hdMatriculaResponsableNew${row.Id}" name="hdMatriculaResponsableNew${row.Id}" type="hidden" value="${row.ResponsableMatricula}">
                        <input id="hdCorreoResponsableNew${row.Id}" name="hdCorreoResponsableNew${row.Id}" type="hidden" value="${row.ResponsableCorreo}">
                    </div>
                `;
    return html;
}

function InputMatriculaFormatter(value, row, index) {
    let html = `<input id="txtTS_Matricula${row.Id}" class="form-control" type="text" name="txtTS_Matricula${row.Id}" value="${row.ResponsableMatricula}" disabled>`;
    return html;
}

function InputCorreoFormatter(value, row, index) {
    let html = `<input id="txtTS_Correo${row.Id}" class="form-control" type="text" name="txtTS_Correo${row.Id}" value="${row.ResponsableCorreo}" disabled>`;
    return html;
}

function saveTribeLeaderResp(TLId, GestionadoPorId) {
    let resp = $(`#txtMatriculaResponsableNew${TLId}`).val().trim();
    let matricula = $(`#hdMatriculaResponsableNew${TLId}`).val().trim();
    let correo = $(`#hdCorreoResponsableNew${TLId}`).val().trim();

    if (resp.length === 0 || matricula.length === 0 || correo.length === 0) {
        toastr.error("Debes ingresar un responsable existente.", TITULO_MENSAJE);
        return;
    }

    let data = {
        Id: TLId,
        GestionadoPorId,
        Responsable: resp,
        ResponsableMatricula: matricula,
        ResponsableCorreo: correo,
    };

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/${URLS_CRUD.UrlUpdateResponsibleTribeLeader}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();

                    let data = dataObject;
                    if (data.state) {
                        toastr.success(data.message, TITULO_MENSAJE);
                    } else {
                        bootbox.alert(data.message);
                    }
                }
            }
        },
        //complete: function () {
        //    waitingDialog.hide();
        //},
        error: function (xhr, ajaxOptions, thrownError) {
            waitingDialog.hide();
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function saveTeamSquadResp(TeamId, GestionadoPorId) {
    let resp = $(`#txtMatriculaResponsableNew${TeamId}`).val().trim();
    let matricula = $(`#hdMatriculaResponsableNew${TeamId}`).val().trim();
    let correo = $(`#hdCorreoResponsableNew${TeamId}`).val().trim();

    if (resp.length === 0 || matricula.length === 0 || correo.length === 0) {
        toastr.error("Debes ingresar un responsable existente.", TITULO_MENSAJE);
        return;
    }

    let data = {
        Id: TeamId,
        Responsable: resp,
        ResponsableMatricula: matricula,
        ResponsableCorreo: correo,
    };

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + `/${URLS_CRUD.UrlUpdateResponsibleTeamSquad}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    if (dataObject) {
                        toastr.success("Guardado correctamente.", TITULO_MENSAJE);
                        listTeamSquadLinkedByGestionadoPor(GestionadoPorId);
                    } else {
                        bootbox.alert("Se produjo un error al listar los registros");
                    }
                }
            }
        },
        complete: function () {
            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            waitingDialog.hide();
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function irEliminar(id) {
    let MENSAJE_VIEW = "¿Estás seguro(a) que deseas eliminar el registro seleccionado?";
    let dataRetorno = ExisteRelacionPortafolio(id, ENTIDAD_MANTENIMIENTO);
    let MENSAJE = `${dataRetorno.MensajeAPI}, ${MENSAJE_VIEW}.`;

    if (dataRetorno.FlagSeEjecuta) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/EliminarRegistroByConfiguracion?id=${id}&idConfiguracion=${ENTIDAD_MANTENIMIENTO}`,
                        type: "GET",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {                                    
                                    toastr.success("Se eliminó el registro correctamente", TITULO_MENSAJE);
                                    ListarRegistros();
                                }
                            }
                        },
                        complete: function () {
                            waitingDialog.hide();
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
            }
        });
    } else {
        MENSAJE = `${dataRetorno.MensajeAPI}. No es posible eliminar`;
        MensajeGeneralAlert(TITULO_MENSAJE, MENSAJE);
    }
}

function CambiarEstadoRegistro(id, estadoActual) {
    let msjOpcion = estadoActual ? "desactivar" : "activar";
    let MENSAJE_VIEW = `¿Estás seguro(a) que deseas ${msjOpcion} el registro seleccionado?`;
    let dataRetorno = ExisteRelacionPortafolio(id, ENTIDAD_MANTENIMIENTO);
    let MENSAJE = `${dataRetorno.MensajeAPI}, ${MENSAJE_VIEW}.`;

    if (dataRetorno.FlagSeEjecuta) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                if (result !== null && result) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    $.ajax({
                        url: URL_API_VISTA + `/${URLS_CRUD.UrlCambiarEstado}?id=${id}&estadoActual=${estadoActual}`,
                        type: "GET",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {                                    
                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    RefrescarListado();
                                }
                            }
                        },
                        complete: function () {
                            waitingDialog.hide();
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
            }
        });
    } else {
        MENSAJE = `${dataRetorno.MensajeAPI}. No es posible cambiar el estado`;
        MensajeGeneralAlert(TITULO_MENSAJE, MENSAJE);
    }
}

function InitSelectBuilderCustom($ddl, urlGet, filtro) {
    if (filtro !== null) {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: URL_API + `${urlGet}?filtro=${filtro}`,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            dataType: "json",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        let data = dataObject;
                        if (data && data.length > 0)
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

function ExportarInactivos() {
    let _data = DATA_TBL02.TBL.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    let url = `${URL_API_VISTA}/${URLS_CRUD.UrlExportar}?sortName=${DATA_TBL02.ULTIMO_SORT_NAME}&sortOrder=${DATA_TBL02.ULTIMO_SORT_ORDER}`;
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

function ExisteCodigoSIGA(codigo) {
    let estado = false;

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/${URLS_CRUD.UrlExisteCodigoSIGA}?filter=${codigo}`,
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

function listTeamSquadLinkedByGestionadoPor(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblTeamSquadLinked.bootstrapTable('destroy');
    $tblTeamSquadLinked.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/${URLS_CRUD.UrlTeamSquadLinked}`,
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR_TS = {};
            DATA_EXPORTAR_TS.GestionadoPorId = Id;
            DATA_EXPORTAR_TS.pageNumber = p.pageNumber;
            DATA_EXPORTAR_TS.pageSize = p.pageSize;
            DATA_EXPORTAR_TS.sortName = p.sortName;
            DATA_EXPORTAR_TS.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_TS);
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
        onLoadSuccess: function (data) {
            OpenCloseModal($("#mdTeamSquadLinked"), true);
            InitAutocompletesBT(data.rows);
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
    });
}

function InitAutocompletesBT(rows) {
    if (rows.length > 0) {
        let dataMapped = rows.map(function (x) {
            let item = {
                Id: x.Id,
                searchBox: $(`#txtMatriculaResponsableNew${x.Id}`),
                idBox: $(`#hdMatriculaResponsableNew${x.Id}`),
                containerBox: `.respContainerNew${x.Id}`,
                url: "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}",
                hdMatricula: $(`#hdMatriculaResponsableNew${x.Id}`),
                hdCorreo: $(`#hdCorreoResponsableNew${x.Id}`)
            };

            return item;
        });

        for (let item of dataMapped) {
            //item.searchBox.autocomplete("destroy");
            InitAutocompletarBuilderLocal(item.Id, item.searchBox, item.idBox, item.containerBox, item.url, item.hdMatricula, item.hdCorreo);
        }
    }
}

function InitAutocompletarBuilderLocal(Id, $searchBox, $IdBox, $container, urlController, $hdMatricula, $hdCorreo) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("");
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
            if ($IdBox !== null) {
                //$IdBox.val(ui.item.mail);
                $hdCorreo.val(ui.item.mail);
                $hdMatricula.val(ui.item.matricula);

                $(`#txtTS_Matricula${Id}`).val(ui.item.matricula);
                $(`#txtTS_Correo${Id}`).val(ui.item.mail);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function listTribeLeaderLinkedByGestionadoPor(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblTribeLeaderLinked.bootstrapTable('destroy');
    $tblTribeLeaderLinked.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + `/${URLS_CRUD.UrlTribeLeaderLinked}`,
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR_TL = {};
            DATA_EXPORTAR_TL.GestionadoPorId = Id;
            DATA_EXPORTAR_TL.pageNumber = p.pageNumber;
            DATA_EXPORTAR_TL.pageSize = p.pageSize;
            DATA_EXPORTAR_TL.sortName = p.sortName;
            DATA_EXPORTAR_TL.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_TL);
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
        onLoadSuccess: function (data) {
            OpenCloseModal($("#mdTribeLeaderLinked"), true);
            InitAutocompletesBT(data.rows);
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onPageChange: function (number, size) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        }
    });
}