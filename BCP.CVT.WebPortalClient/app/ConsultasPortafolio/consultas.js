var $table = $("#tbl-consultas");
var DATA_EXPORTAR = {};
var DATA_EXPORTAR_HISTO = {};
var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "FechaConsulta";
var ULTIMO_SORT_ORDER = "asc";

const URL_API_VISTA = URL_API + "/applicationportfolio/Consultas";
const TITULO_MENSAJE = "Configuración de Consultas";
const TITULO_MENSAJE_ELI = "Eliminación de Consultas";
const MENSAJE = "Estas seguro de eliminar esta consulta?";
const FILTRO_ACCION = { INSERT: "1", UPDATE: "2", DELETE: "3", CREATE: "4" };
const ID_MENSAJE = -2;

$(function () {
    //comentado
    cargarCombos();
    $('#ddlTipoConsulta').val('-1');

    //validarFormRolesGestion();
    listarConsultas();

    $("#btnNuevo").click(AddConsulta);
    InitAutocompletarBuilder($("#txtCodigoApp"), $("#hCodigo"), ".containerAplicacion", "/applicationportfolio/application/filter?filtro={0}&codigoAPT=");
    setDefaultHd($("#txtCodigoApp"), $("#hCodigo"));
   
});

function buscarConsultas() {
    listarConsultas();
}

function listarConsultas() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListadoConsultas",
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
            DATA_EXPORTAR.tipoId = $("#cbFilTipoConsulta").val();
            DATA_EXPORTAR.Respondido = $("#cbRespondida").val();
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
    if (EstadoMd) {
        $('#ddlTipoConsulta').val('-1');
        $("#MdAddOrEditCon").modal(opcionesModal);
    }
    else
        $("#MdAddOrEditCon").modal('hide');
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
                                debugger;
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


function AddConsulta() {
    $("#titleFormPat").html("Configurar Nueva Consulta");
    //$("#hdReponsable1").val('');
    //$("#txtCodAct").attr('readonly', false);
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

function linkFormatter2(value, row, index) {
    let botonModificar = "";
    let botonEliminar = "";
    if (row.Respondido == 2) {
        botonModificar= `<a href="javascript:irModificar('${row.ConsultaId}','${row.Consulta}','${row.applicationId}','${row.TipoConsulta}')" title="Modidificar Consulta"><i class="iconoVerde glyphicon glyphicon glyphicon-pencil"></i></a>`;
        botonEliminar = `<a href="javascript:irEliminar2(${row.ConsultaId})" title="Eliminar consulta"><i class="iconoRojo glyphicon glyphicon glyphicon-trash"></i></a>`;
        return botonModificar.concat("&nbsp;&nbsp;", botonEliminar);
    }
    else return "-";
}

function irModificar(id,consulta,applicationId,tipo) {
    $('#hdConsultaId').val(id);
    $('#ddlTipoConsulta2').val(tipo);
    $('#txtCodigoApp2').val(applicationId);
    $('#txtComentario2').val(consulta);

    OpenCloseModal($("#MdAddOrEditCon2"), true);
}

function irEliminar2(id) {
    let data = {};
    data.ConsultaId = id;


    bootbox.confirm({
        title: TITULO_MENSAJE_ELI,
        message: MENSAJE ,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });



                $.ajax({
                    url: URL_API_VISTA + "/EliminarConsulta",
                    type: "POST",
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject == true) {
                                toastr.success("Se eliminó la consulta correctamente", TITULO_MENSAJE_ELI);
                              
                            }
                        }
                    },
                    complete: function () {
                        buscarConsultas();
                        waitingDialog.hide();
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    },
                 //
                });
            }
        }
    });


}

function guardarAddOrEditRG() {
    if ($("#formAddOrEditRG").valid()) {
        $("#btnRegRG").button("loading");


        let consulta = {

            TipoConsulta: $("#ddlTipoConsulta").val(),
            Consulta: $.trim($("#txtComentario").val()),
            applicationId: $("#hCodigo").val() 
            };

            $.ajax({
                url: URL_API_VISTA + "/AddOrEdit",
                type: "POST",
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(consulta),
                dataType: "json",
                success: function (result) {
                   
                        toastr.success("Registrado correctamente", TITULO_MENSAJE);
                  
                },
                complete: function () {
                    $("#btnRegRG").button("reset");
                    //$("#txtBusAct").val('');
                    listarConsultas();
                    MdAddOrEditAct(false);
                },
                error: function (result) {
                    //ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                }
            });



    }
}

function guardarAddOrEditRG2() {
    if ($("#formAddOrEditRG2").valid()) {
        $("#btnRegRG2").button("loading");


        let consulta = {

            ConsultaId: $("#hdConsultaId").val(),
            Consulta: $.trim($("#txtComentario2").val()),
        };


        $.ajax({
            url: URL_API_VISTA + "/EditConsulta",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(consulta),
            dataType: "json",
            success: function (result) {

                toastr.success("Consulta actualizada correctamente", TITULO_MENSAJE);

            },
            complete: function () {
                $("#btnRegRG2").button("reset");
                //$("#txtBusAct").val('');
                listarConsultas();

                OpenCloseModal($("#MdAddOrEditCon2"), false);
            },
            error: function (result) {
                //ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });



    }
}

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.tiposConsulta, $("#ddlTipoConsulta"), TEXTO_SELECCIONE);
                    SetItems(dataObject.tiposConsulta, $("#ddlTipoConsulta2"), TEXTO_SELECCIONE);
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
    return `<a href="javascript:irDetalleCambios('${row.Campo}')" title="Ver detalle de cambios"><i class="iconoVerde glyphicon glyphicon glyphicon-ok"></i></a>`;
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




