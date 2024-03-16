var $table = $("#tbl-roles");
var $tblBT = $("#tblBT");
var DATA_EXPORTAR = {};
var DATA_EXPORTAR_HISTO = {};
var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "Name";
var ULTIMO_SORT_ORDER = "asc";

const URL_API_VISTA = URL_API + "/Aplicacion/RolGestion";
const TITULO_MENSAJE = "Configuración de Roles de Gestión";
const FILTRO_ACCION = { INSERT: "1", UPDATE: "2", DELETE: "3", CREATE: "4" };
const ID_MENSAJE = -2;

$(function () {    
    //comentado
    cargarCombos();

    validarFormRolesGestion();    
    listarRolesGestion();
   
    $("#btnNuevo").click(AddRolesGestion);
    InitAutocompletarBuilderLocal($("#txtReponsable"), $("#hdReponsable1"), ".rolesGestion", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
});

function buscarRolesGestion() {
    listarRolesGestion();
}

function listarRolesGestion() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListadoRolGestion",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: ULTIMO_PAGE_NUMBER,
        pageSize: ULTIMO_REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: ULTIMO_SORT_NAME,
        sortOrder: ULTIMO_SORT_ORDER,
        queryParams: function (p) {
            ULTIMO_PAGE_NUMBER = p.pageNumber;
            ULTIMO_REGISTRO_PAGINACION = p.pageSize;
            ULTIMO_SORT_NAME = p.sortName;
            ULTIMO_SORT_ORDER = p.sortOrder;

            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusAct").val());
            DATA_EXPORTAR.pageNumber = ULTIMO_PAGE_NUMBER;
            DATA_EXPORTAR.pageSize = ULTIMO_REGISTRO_PAGINACION;
            DATA_EXPORTAR.sortName = ULTIMO_SORT_NAME;
            DATA_EXPORTAR.sortOrder = ULTIMO_SORT_ORDER;

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

function validarFormRolesGestion() {    
    $("#formAddOrEditRG").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {            
            txtReponsable: {                
                requiredSinEspacios: true
            },
            cbRoles: {
                requiredSelect: true
            }
        },
        messages: {            
            txtReponsable: {                
                requiredSinEspacios: "Debes ingresar el nombre del usuario al que se configurará el rol"
            },
            cbRoles: {
                requiredSelect: String.Format("Debes ingresar {0}.", "el rol de gestion")
            }
        }
    });
}

function limpiarMdAddOrEditAct() {
    LimpiarValidateErrores($("#formAddOrEditRG"));
    $(":input", "#formAddOrEditRG").val("");
    $("#txtReponsable").val('');
    $("#txtCorreo").val('');
    $("#cbRoles").val(-1);
    $("#txtNombreResponsable").val('');
    $("#txtMatriculaResponsable").val('');    
}

function MdAddOrEditAct(EstadoMd) {
    limpiarMdAddOrEditAct();
    if (EstadoMd)
        $("#MdAddOrEditAct").modal(opcionesModal);
    else
        $("#MdAddOrEditAct").modal('hide');
}

function linkFormatter(value, row, index) {
    let retorno = value;
    if (row.IsActive) {
        retorno = `<a href="javascript:editarRolesGestion(${row.Id})" title="Editar">${value}</a>`;
    }
    return retorno;
}

function opciones(value, row, index) {
    let style_color = row.IsActive ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.IsActive ? "check" : "unchecked";
    let btnEstado = `<a href="javascript:cambiarEstado(${row.Id}, ${row.IsActive})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    let btnEliminar = `<a href="javascript:irEliminar(${row.Id})" title="Eliminar registro"><i class="${style_color} glyphicon glyphicon-trash"></i></a>`;

    return btnEstado.concat("&nbsp;&nbsp;", btnEliminar);
}

function irEliminar(id) {
    let MENSAJE_VIEW = "¿Estás seguro(a) que deseas eliminar el registro seleccionado?";
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE_VIEW,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API + `/Aplicacion/ConfiguracionPortafolio/EliminarRegistroByConfiguracion?id=${id}&idConfiguracion=${ENTIDAD_MANTENIMIENTO}`,
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    type: "GET",
                    dataType: "json",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                
                                toastr.success("Se eliminó el registro correctamente", TITULO_MENSAJE);
                                listarRolesGestion();
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
}


function AddRolesGestion() {
    $("#titleFormPat").html("Configurar Roles de Gestión");
    $("#hdReponsable1").val('');
    $("#txtCodAct").attr('readonly', false);    
    MdAddOrEditAct(true);
}

function editarRolesGestion(Id) {
    $("#txtCodAct").attr('readonly', true);
    $("#titleFormAct").html("Editar registro");
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "GET",
        dataType: "json",
        success: function (result) {
            MdAddOrEditAct(true);
            $("#hdRegistroID").val(result.Id);
            $("#txtReponsable").val(result.Name);
            $("#txtCorreo").val(result.Email);
            $("#txtNombreResponsable").val(result.Name);
            $("#txtMatriculaResponsable").val(result.Username);
            $("#cbRoles").val(result.RoleId);           
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function cambiarEstado(Id, estadoActual) {
    let msjOpcion = estadoActual ? "desactivar" : "activar";
    let MENSAJE_VIEW = `¿Estás seguro(a) que deseas ${msjOpcion} el registro seleccionado?`;    

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE_VIEW,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    type: 'GET',
                    contentType: "application/json; charset=utf-8",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    url: `${URL_API_VISTA}/CambiarEstadoRolGestion?Id=${Id}`,
                    dataType: "json",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                listarRolesGestion();
                            }
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                    },
                    complete: function () {
                        waitingDialog.hide();
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    }
                });
            }
        }
    });
}

function guardarAddOrEditRG() {
    if ($("#formAddOrEditRG").valid()) {
        $("#btnRegRG").button("loading");

        let username = $.trim($("#txtMatriculaResponsable").val());
        if (username != '') {
            let rolesgestion = {
                Id: ($("#hdRegistroID").val() === "") ? -1 : parseInt($("#hdRegistroID").val()),
                UserName: $.trim($("#txtMatriculaResponsable").val()),
                Name: SetCustomName($("#txtNombreResponsable").val()),
                Email: $.trim($("#txtCorreo").val()),
                RoleId: $("#cbRoles").val(),
            };


            $.ajax({
                url: URL_API_VISTA + "/AddOrEdit",
                type: "POST",
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(rolesgestion),
                dataType: "json",
                success: function (result) {
                    if (result != ID_MENSAJE)
                        toastr.success("Registrado correctamente", TITULO_MENSAJE);
                    else
                        toastr.info("El usuario ya tenía el rol asignado, se actualizó la asignación.", TITULO_MENSAJE);
                },
                complete: function () {
                    $("#btnRegRG").button("reset");
                    $("#txtBusAct").val('');
                    listarRolesGestion();
                    MdAddOrEditAct(false);
                },
                error: function (result) {
                    //ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                }
            });
        }
        else {
            toastr.warning("El usuario seleccionado no es válido, vuelva a intentarlo", TITULO_MENSAJE);
            $("#btnRegRG").button("reset");
        }

        
    }
}

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombosRoles",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.roles, $("#cbRoles"), TEXTO_SELECCIONE);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function linkFormatterAudi(value, row, index) {
    return `<a href="javascript:irDetalleCambios('${row.Campo}')" title="Ver detalle de cambios">${value}</a>`;
}

function irDetalleCambios(data) {
    if (data) {
        MensajeGeneralAlert(TITULO_MENSAJE, data);
    }
}
function InitAutocompletarBuilderLocal($searchBox, $IdBox, $container, urlController) {
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
            if ($IdBox !== null) {
                $IdBox.val(ui.item.id);
                $("#txtCorreo").val(ui.item.mail);
                $("#txtNombreResponsable").val(ui.item.displayName);
                $("#txtMatriculaResponsable").val(ui.item.matricula);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function dateFormat(value, row, index) {
    if (value != null)
        return moment(value).format('DD/MM/YYYY HH:mm:ss');
    else return "-";
}