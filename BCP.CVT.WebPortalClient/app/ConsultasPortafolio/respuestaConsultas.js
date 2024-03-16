var $table = $("#tbl-consultas");
var DATA_EXPORTAR = {};
var DATA_EXPORTAR_HISTO = {};
var ULTIMO_REGISTRO_PAGINACION = REGISTRO_PAGINACION;
var ULTIMO_PAGE_NUMBER = 1;
var ULTIMO_SORT_NAME = "FechaConsulta";
var ULTIMO_SORT_ORDER = "asc";

const URL_API_VISTA = URL_API + "/applicationportfolio/Consultas";
const TITULO_MENSAJE = "Configuración de Consultas";
const FILTRO_ACCION = { INSERT: "1", UPDATE: "2", DELETE: "3", CREATE: "4" };
const ID_MENSAJE = -2;

$(function () {
    //comentado
    //cargarCombos();

    //$('#ddlTipoConsulta').val('-1');
    InitFecha();

    //validarFormRolesGestion();
    listarConsultas();

    //$("#btnNuevo").click(AddConsulta);
    $("#btnExportar").click(ExportarInfo);

});

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR = {};
    DATA_EXPORTAR.Matricula = $('#txtUsuario').val();
    DATA_EXPORTAR.Desde = $('#dpFecDesde').val();
    DATA_EXPORTAR.Hasta = $('#dpFecHasta').val();
    DATA_EXPORTAR.tipoId = $("#cbFilTipoConsulta").val();
    DATA_EXPORTAR.Respondido = $("#cbRespondida").val();

    DATA_EXPORTAR.sortName = 'FechaConsulta';
    DATA_EXPORTAR.sortOrder = 'asc';


    //DATA_EXPORTAR.TablaProcedencia = String.Format("{0}", TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION);
    //DATA_EXPORTAR.Procedencia = TABLA_PROCEDENCIA_ID.APP_INFOCAMPOAPLICACION;

    let url = `${URL_API_VISTA}/Exportar?tipoid=${DATA_EXPORTAR.tipoId}&respondido=${DATA_EXPORTAR.Respondido}&matricula=${DATA_EXPORTAR.Matricula}&desde=${DATA_EXPORTAR.Desde}&hasta=${DATA_EXPORTAR.Hasta}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function buscarConsultas() {
    listarConsultas();
}
function InitFecha() {
    $("#dpFecDesde-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
    $("#dpFecHasta-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
}

function listarConsultas() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListadoConsultas2",
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
            DATA_EXPORTAR.Matricula = $('#txtUsuario').val();
            DATA_EXPORTAR.Desde = $('#dpFecDesde').val();
            DATA_EXPORTAR.Hasta = $('#dpFecHasta').val();

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
    let style_color = 'iconoVerde ';
    let btnResponder = null;
    if (row.RespuestaPortafolio == null) {
        btnResponder = `<a href="javascript:irResponder(${row.ConsultaId}, '${row.applicationId}')" title="Responder consulta"><i class="${style_color} glyphicon glyphicon-pencil"></i></a>`;
    }
    return btnResponder;
}

function irResponder(id, applicationId) {
    $('#hdConsultaId').val(id);
    var consulta = getConsulta(id);
    if (applicationId != null) {
        if(applicationId != "null")
            document.getElementById('txtCodigoApp').innerHTML = applicationId;
        else
            document.getElementById('txtCodigoApp').innerHTML = "No Aplica";
    }        
    else
        document.getElementById('txtCodigoApp').innerHTML = "No Aplica";
    $("#txtConsulta").val(consulta.Consulta);
    //document.getElementById('divPregunta').innerHTML = consulta.Consulta;
    $("#MdAddOrEditCon").modal(opcionesModal);
}

function Responder() {

    let respuesta = {

        ConsultaId: $("#hdConsultaId").val(),
        RespuestaPortafolio: $("#txtRespuesta").val()

    };


    $.ajax({
        url: URL_API_VISTA + "/Responder",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(respuesta),
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

function guardarAddOrEditRG() {
    if ($("#formAddOrEditRG").valid()) {
        $("#btnRegRG").button("loading");

        let consulta = {
            TipoConsulta: $("#ddlTipoConsulta").val(),
            Consulta: $.trim($("#txtComentario").val()),
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

function getConsulta(id) {
    var resultado;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/" + id,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    resultado = dataObject;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });

    return resultado;
}


