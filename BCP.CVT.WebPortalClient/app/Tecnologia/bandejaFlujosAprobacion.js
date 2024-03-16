var $table = $("#tblRegistros");
var $tableFunciones = $("#tblFunciones");
var $tableHistorial = $("#tblHistorial");
var $tableDetalle = $("#tblDetalleSolicitud");
var URL_API_VISTA = URL_API + "/RolesProducto";
var URL_API_VISTA_DESCARGA = URL_API + "/Solicitud";
var URL_API_VISTA2 = URL_API + "/Tecnologia";
var DATA_EXPORTAR = {};
const TITULO_MENSAJE = "Confirmación";

const MENSAJE = "¿Estás seguro que deseas agregar este rol al producto seleccionado?";
const MENSAJE2 = "¿Estás seguro que deseas eliminar este rol del producto seleccionado?";
const MENSAJE3 = "¿Estás seguro que deseas modificar este rol del producto seleccionado?";
const MENSAJE4 = "¿Está seguro que desea observar la solicitud seleccionada?";     // Observar Owner
const MENSAJE5 = "¿Está seguro que desea aprobar la solicitud seleccionada?";  // Aprobar Owner
var data = {};
var Aministrador = 1;
var OPCIONES = "";
var OPCIONES2 = "";
var Owner_Tribu = 18;
var CodigoTribu = "";

$(function () {
    getCurrentUser();
    //FILTROS MULTISELECT
    var itemsEstado = [{ Id: '1', Descripcion: 'Pendiente', Value: '1' }, { Id: '2', Descripcion: 'Aprobado', Value: '2' }, { Id: '3', Descripcion: 'Rechazado', Value: '3' }];
    SetItemsMultiple(itemsEstado, $("#ddlEstado"), TEXTO_TODOS, TEXTO_TODOS, true);

    // Cargar Combo
    var values = "1";
    $.each(values.split(","), function (i, e) {
        $("#ddlEstado option[value='" + e + "']").prop("selected", true);
    });
    $("#ddlEstado").multiselect("refresh");


    InitAutocompletarProductoSearch($("#txtProducto"), $("#hdProd"), ".searchProductoContainer");
    InitAutocompletarTecnologia($("#txtBusTec"), $("#hdnBusTec"), $(".searchContainer"));
    validarFormApp();
    cargarCombos();
    ListarRegistros();
    initFecha();


    $("#ddlDominio").change(function () {
        Dominio_Id = $("#ddlDominio").val();
        CambioDominio(Dominio_Id)
    });

    $("#btnRechazoSolicitud").click(RegistrarRechazo);

});

function initFecha() {
    _BuildDatepicker($("#dpFecConsulta"));
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

    let idsEstado = $.isArray($("#ddlEstado").val()) ? $("#ddlEstado").val() : [$("#ddlEstado").val()];

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA2 + "/FlujoAprobacion/BandejaSolicitud",
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaRegistro',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};

            DATA_EXPORTAR.DominioId = $("#ddlDominio").val();
            DATA_EXPORTAR.SubDominioId = $("#ddlSubDominio").val();
            DATA_EXPORTAR.EstadoSolicitudFlujo = idsEstado;
            DATA_EXPORTAR.FechaRegistroSolicitud = castDate($("#dpFecConsulta").val());

            DATA_EXPORTAR.nombre = $.trim($("#txtBusTec").val());
            DATA_EXPORTAR.ProductoId = $("#hdProd").val() == "" ? null : $("#hdProd").val();
            DATA_EXPORTAR.CodigoApt = $("#txtCodigo").val();

            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;

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


    $("#formRecSolicitud").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtRechazoSolicitud: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtRechazoSolicitud: {
                requiredSinEspacios: String.Format("Debe ingresar {0}.", "el sustento deL rechazo."),
            }
        }
    });

}

function opcionesFormatter(value, row, index) {
    var btnVentana = `<a href="javascript:irVerVentana(${row.SolicitudTecnologiaId},${row.IdTipoSolicitud},${row.TecnologiaId},'${row.Tecnologia}',${row.ProductoId},'${row.Producto}','${row.TipoSolicitudStr}','${row.CodigoProducto}','${row.TipoFlujo}')" title="Ver solicitud"><i class="iconoVerde icon icon-exchange"></i></a>`;
    if (row.EstadoSolicitudStr == "Pendiente") {
        if (userCurrent.Perfil.includes("E195_Administrador") || userCurrent.Perfil.includes("E195_GestorCVTCatalogoTecnologias") || userCurrent.Perfil.includes("E195_GestorTecnologia")) {
            var btnVerDatos = `<a href="javascript:VerDatosModificados(${row.SolicitudTecnologiaId},${row.TecnologiaId},${row.ProductoId},${row.IdTipoSolicitud})" title="Ver datos modificados"><i class="iconoVerde glyphicon glyphicon-check"></i></a>`;
            return btnVentana.concat("&nbsp;&nbsp;", btnVerDatos);
        } else if (userCurrent.Matricula.includes(row.OwnerDestino)) {
            var btnVerDatos = `<a href="javascript:VerDatosModificados(${row.SolicitudTecnologiaId},${row.TecnologiaId},${row.ProductoId},${row.IdTipoSolicitud})" title="Ver datos modificados"><i class="iconoVerde glyphicon glyphicon-check"></i></a>`;
            return btnVentana.concat("&nbsp;&nbsp;", btnVerDatos);
        }
    }
    return btnVentana;
}


function irAprobarSolicitud(idSolicitud, idTipoSolicitud, idTecnologia) {
    let data = {};
    data.SolicitudId = idSolicitud;
    data.TipoSolicitudId = idTipoSolicitud;
    data.TecnologiaId = idTecnologia;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: MENSAJE5,
        buttons: SET_BUTTONS_BOOTBOX,
        callback: function (result) {
            if (result !== null && result) {
                waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                $.ajax({
                    url: URL_API_VISTA2 + `/FlujoAprobacion/AprobarActualizarDatos`,
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se aprobó la solicitud correctamente", TITULO_MENSAJE);
                                
                                ListarRegistros();
                                //OpenCloseModal($("#modalSolicitud"), false);
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

function irRechazarSolicitud(idSolicitud, idTipoSolicitud, idTecnologia) {
    $("#hdSolicitudId").val(idSolicitud);
    $("#hdTecnologiaId").val(idTecnologia);
    $("#txtRechazoSolicitud").val("");
    LimpiarModalRechazar();
    OpenCloseModal($("#modalRechazarSolicitud"), true);
}

function irVerVentana(idSolicitud, idTipoSolicitud, idTecnologia, nombreTecnologia, idProducto, nombreProducto, nombreTipoSol, codigoProducto, tipoFlujo) {
    $("#txtNroSolicitud").val(idSolicitud)
    $("#txtCodigoProducto").val(codigoProducto);
    $("#lblNombreTecnologia").text(idTecnologia == 0 ? 'Producto' : 'Tecnología');
    $("#txtNombreTecnologia").val(idTecnologia == 0 ? nombreProducto : nombreTecnologia);
    $("#txtTipoSolicitud").val(nombreTipoSol);
    $("#hdTecnologiaId").val(idTecnologia);
    $("#hdTecnologiaId").val(idProducto);

    ListarDetalleSolicitud(idSolicitud, idTecnologia, idProducto);
    OpenCloseModal($("#modalSolicitud"), true);
}

function VerDatosModificados(idSolicitud, idTecnologia, idProducto, idTipoSolicitud) {
    window.document.location.href = `DatosModificados?idSolicitud=${idSolicitud}&idTecnologia=${idTecnologia}&idProducto=${idProducto}&idTipoSolicitud=${idTipoSolicitud}`;
}
 

function ListarDetalleSolicitud(idSolicitud, idTecnologia, idProducto) {

    $tableDetalle.bootstrapTable('destroy');
    $tableDetalle.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA2 + "/FlujoAprobacion/DetalleSolicitudes",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageNumber: 1,
        pageSize: 10,
        pageList: 10,
        sortName: 'Rol,GrupoRed,Tribu,Chapter,Funcion',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.SolicitudAplicacionId = idSolicitud;
            DATA_EXPORTAR.TecnologiaId = idTecnologia;
            DATA_EXPORTAR.ProductoId = idProducto;
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadError: function (status, res) {
            bootbox.alert("Se produjo un error al listar los registros");
        }
    });
}

function LimpiarModalRechazar() {
    $("#txtRechazoSolicitud").val("");
    $("#formRecSolicitud").data('validator').resetForm();
    LimpiarValidateErrores($("#formRecSolicitud"))
}


function RegistrarRechazo() {
    let data = {};
    data.IdSolicitud = $("#hdSolicitudId").val();
    data.Comentario = $("#txtRechazoSolicitud").val();
    data.IdTecnologia = $("#hdTecnologiaId").val();

    if ($("#formRecSolicitud").valid()) {

        $.ajax({
            url: URL_API_VISTA2 + `/FlujoAprobacion/ObservarSolicitud`,
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        toastr.success("Se rechazó la solicitud correctamente", TITULO_MENSAJE);
                        ListarRegistros();
                        OpenCloseModal($("#modalRechazarSolicitud"), false);
                    }
                }
            },
            complete: function (data) {
                $("#txtRechazoSeguridad").val("");
                OpenCloseModal($("#modalObservarSeguridad"), false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function InitAutocompletarTecnologia($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");
                $.ajax({
                    url: URL_API_VISTA2 + "/GetTecnologiaByClaveById",
                    data: JSON.stringify({
                        filtro: request.term,
                        id: ($("#hdTecnologiaId").val() === "" || $("#hdTecnologiaId").val() === "0") ? null : parseInt($("#hdTecnologiaId").val())
                    }),
                    dataType: "json",
                    type: "POST",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_APLICACION = data;
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
            $IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
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

function InitAutocompletarProductoSearch($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("");

                $.ajax({
                    url: URL_API + "/Producto" + `/ListadoByDescripcion?descripcion=${encodeURIComponent(request.term)}`,
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
    })
        .keyup(function (e) {
            if ($searchBox.val() == "") {
                $IdBox.val("");
            }
        })
        .autocomplete("instance")._renderItem = function (ul, item) {
            var a = document.createElement("a");
            var font = document.createElement("font");
            font.append(document.createTextNode(item.Fabricante + " " + item.Nombre));
            a.style.display = 'block';
            a.append(font);
            return $("<li>").append(a).appendTo(ul);
        };
}