var $tblGerencia = $("#tblGerencia");
var $tblDivision = $("#tblDivision");
var $tblArea = $("#tblArea");
var $tblUnidad = $("#tblUnidad");

var $table = $("#tblunidadP");

var DATA_EXPORTAR = {};
var LIST = [];

var flag;

var Unidad;

const URL_API_VISTA = URL_API + "/Aplicacion/ConfiguracionPortafolio";
const TITULO_MENSAJE = "Gerencia/División/Área/Unidad";
const URL_API_APP = URL_API + "/applicationportfolio";
const ENTIDAD_MANTENIMIENTO = { AreaBian: 1, DominioBian: 2, TAI: 3, Gerencia: 4, Division: 5, Area: 6, Unidad: 7 };
const TREE_NIVEL = { Uno: 1, Dos: 2, Tres: 3, Cuatro: 4 };
const TABLE_NIVELES = [
    {
        Table: $tblGerencia,
        UrlListado: "ListarGerencia",
        UrlGetById: "GetGerenciaById",
        UrlAddOrEdit: "AddOrEditGerencia",
        UrlCambiarEstado: "CambiarEstadoGerencia",
        Mantenimiento: ENTIDAD_MANTENIMIENTO.Gerencia,
        TitleModal: "Gerencia",
        Nivel: TREE_NIVEL.Uno
    },
    {
        Table: $tblDivision,
        UrlListado: "ListarDivision",
        UrlGetById: "GetDivisionById",
        UrlAddOrEdit: "AddOrEditDivision",
        UrlCambiarEstado: "CambiarEstadoDivision",
        Mantenimiento: ENTIDAD_MANTENIMIENTO.Division,
        TitleModal: "División",
        Nivel: TREE_NIVEL.Dos
    },
    {
        Table: $tblArea,
        UrlListado: "ListarArea",
        UrlGetById: "GetAreaById",
        UrlAddOrEdit: "AddOrEditArea",
        UrlCambiarEstado: "CambiarEstadoArea",
        Mantenimiento: ENTIDAD_MANTENIMIENTO.Area,
        TitleModal: "Área",
        Nivel: TREE_NIVEL.Tres
    },
    {
        Table: $tblUnidad,
        UrlListado: "ListarUnidad",
        UrlGetById: "GetUnidadById",
        UrlAddOrEdit: "AddOrEditUnidad",
        UrlCambiarEstado: "CambiarEstadoUnidad",
        Mantenimiento: ENTIDAD_MANTENIMIENTO.Unidad,
        TitleModal: "Unidad",
        Nivel: TREE_NIVEL.Cuatro
    }
];

$(function () {
    $("#btnRegistrar").click(GuardarAll);

    validarFormRegistro();
    listarInit();
    InitAutocompletarBuilderLocal($("#txtNombreResponsable"), $("#hdReponsableAuto"), ".registroField", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");
    InitAutocompletarEstandarBuilder($("#txtUnidad"), $("#hdUnidadId"), ".divUnidadContainer", "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro?filtro={0}&filtroPadre=");
    InitAutocompletarEstandarBuilder2($("#txtOwner"), $("#hdOwnerId"), ".divUnidadContainer", "/ConfiguracionPortafolioAplicaciones/ObtenerUsuariosPorNombreAutocomplete?filter_name={0}");

});

function CrearObjAplicacion() {
    var data = {};
    data.Username = $("#txtUnidad").val();


    return data;
}
function CrearObjAplicacion2() {
    var data = {};
    data.Username = $("#txtOwner").val();


    return data;
}

function InitAutocompletarEstandarBuilder2($searchBox, $IdBox, $container, urlController) {
    let data = CrearObjAplicacion();

    $searchBox.autocomplete({
        minLength: 2,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);
                //data.Username = request.term;
                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    //url: URL_API_APP + `/application/Gerencia/getOwner`,
                    url: urlControllerWithParams,
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    type: "GET",
                    //data: JSON.stringify(data),
                    //contentType: "application/json; charset=utf-8",
                    //dataType: "json",
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
                $IdBox.val(ui.item.matricula);
                $("#hdOwnerId").val(ui.item.matricula);
                LIST = [];
                BuscarEnUnidad(ui.item.matricula);

                if (flag == 1) {
                    var dat = { Id: ui.item.id, Responsable: ui.item.displayName, ResponsableCorreo: ui.item.mail, ResponsableMatricula: ui.item.matricula, Situacion: 'RESPONSABLE', Unidad: Unidad }

                    LIST.push(dat);
                    document.getElementById('label').innerHTML = '';
                }
                else if (flag == 2) {
                    var dat = { Id: ui.item.id, Responsable: ui.item.displayName, ResponsableCorreo: ui.item.mail, ResponsableMatricula: ui.item.matricula, Situacion: 'RESPONSABLE', Unidad: Unidad }

                    LIST.push(dat);
                    document.getElementById('label').innerHTML = '';
                }
                else {
                    var dat = { Id: ui.item.id, Responsable: ui.item.displayName, ResponsableCorreo: ui.item.mail, ResponsableMatricula: ui.item.matricula, Situacion: 'ASOCIADO', Unidad: Unidad }

                    LIST.push(dat);

                }
                $table.bootstrapTable('destroy');
                $('table').bootstrapTable({
                    data: LIST
                });
                $('#txtOwner').val("");
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}
function CrearObjAplicacion3(matri) {
    var data = {};
    data.Username = matri;


    return data;
}

function BuscarEnUnidad(Matricula) {

    let data = CrearObjAplicacion3(Matricula);

    $.ajax({
        url: URL_API_APP + `/application/Gerencia/BuscarEnUnidad`,
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {

                    let data2 = dataObject;

                    flag = data2.Resultado;
                    Unidad = data2.Nombre;

                    if (flag == 2) {

                        //document.getElementById('label').innerHTML = 'El usuario no es responsable de ninguna unidad asociada al Portafolio de Aplicaciones. </br> El usuario es reponsable de la unidad XYZ.';
                        document.getElementById('label').innerHTML = 'El usuario no es responsable en SIGA.';
                    }
                    else if (flag == 3) {
                        //document.getElementById('label').innerHTML = 'El usuario no es responsable de ninguna unidad asociada al Portafolio de Aplicaciones. </br> El usuario no es responsable de ninguna unidad en SIGA ni XYZ.';
                        document.getElementById('label').innerHTML = 'La persona esta asociada a la unidad ' + data2.Nombre + ' pero NO ES RESPONSABLE.';
                    }


                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}


function InitAutocompletarEstandarBuilder($searchBox, $IdBox, $container, urlController) {
    let data = CrearObjAplicacion();

    $searchBox.autocomplete({
        minLength: 2,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, encodeURIComponent(request.term));
                data.Username = request.term;
                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API_APP + `/application/Gerencia/getUsuarioUnidad`,
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    type: "POST",
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
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
                $("#hdUnidadId").val(ui.item.id);
                //CambioUnidad(APLICACION_ID, ui.item.Id)
                var dat = getResponsableUnidad($("#hdUnidadId").val());
                //var dat = { Id: ui.item.id, Responsable: ui.item.displayName, ResponsableCorreo: ui.item.mail, ResponsableMatricula: ui.item.matricula }
                LIST = [];
                LIST.push(dat);
                $table.bootstrapTable('destroy');
                $('table').bootstrapTable({
                    data: LIST
                });
                $('#txtUnidad').val("");
                document.getElementById('label').innerHTML = '';
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}

function Buscar() {
    limpiarMd();
    $("#MdBus").modal(opcionesModal);
}

function limpiarMd() {
    $("#txtUnidad").val('');
    $("#hdUnidadId").val('');
    LIST = [];
    $table.bootstrapTable('destroy');
    $('table').bootstrapTable({
        data: LIST
    });
    document.getElementById('label').innerHTML = '';
}

function listarInit() {
    let item = TABLE_NIVELES.find(x => x.Nivel === TREE_NIVEL.Uno) || null;
    if (item !== null) listarRegistros(item);
}

function showHideActions(mantenimientoId) {
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === mantenimientoId) || null;
    if (item !== null) {
        let textButton = $(`#button${item.Nivel}`).text();
        let action = textButton === "Mostrar acciones" ? "showColumn" : "hideColumn";
        item.Table.bootstrapTable(action, 'Id');
        $(`#button${item.Nivel}`).text(textButton === "Mostrar acciones" ? "Ocultar acciones" : "Mostrar acciones");
    }
}

function listarRegistros(item, id = null) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    item.Table.bootstrapTable('destroy');
    item.Table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/" + item.UrlListado,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.id = id === null ? 0 : id;
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
        },
        onLoadSuccess: function (data) {
            item.Table.bootstrapTable('hideColumn', 'Id');
            $(`#button${item.Nivel}`).text("Mostrar acciones");
            let $parent = item.Table.closest("div.bootstrap-table").parent();
            $parent.show();
            $parent.nextAll().hide();
        }
    });
}

const AddGerencia = () => AddRegistro(ENTIDAD_MANTENIMIENTO.Gerencia);
const AddDivision = () => AddRegistro(ENTIDAD_MANTENIMIENTO.Division);
const AddArea = () => AddRegistro(ENTIDAD_MANTENIMIENTO.Area);
const AddUnidad = () => AddRegistro(ENTIDAD_MANTENIMIENTO.Unidad);

function AddRegistro(mantenimientoId) {
    $("#hdMantenimientoId").val(mantenimientoId);
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === mantenimientoId) || null;
    if (item !== null) {
        $("#title-form").html(String.Format("Nueva {0}", item.TitleModal));
        HabilitarInputs(true);
        let dataItem = item.Table.bootstrapTable('getData') || [];
        if (dataItem.length > 0) {
            let entidadRelacionId = dataItem[0].EntidadRelacionId;
            $("#hdEntidadRelacionId").val(entidadRelacionId);
        } else {
            let nivelPadre = item.Nivel - 1;
            if (nivelPadre > 0) {
                let itemPadre = TABLE_NIVELES.find(x => x.Nivel === nivelPadre) || null;
                if (itemPadre !== null) {
                    let dataItemPadre = itemPadre.Table.bootstrapTable('getData').filter(x => x.IsSelected === true) || [];
                    if (dataItemPadre.length > 0) {
                        let entidadRelacionId = dataItemPadre[0].Id;
                        $("#hdEntidadRelacionId").val(entidadRelacionId);
                    }
                }
            }
        }
    }
    limpiarModal();
    OpenCloseModal($("#mdAddOrEditRegistro"), true);
}

function limpiarModal() {
    LimpiarValidateErrores($("#formAddOrEditRegistro"));
    $(":input", "#formAddOrEditRegistro").val("");
}

function validarFormRegistro() {
    $.validator.addMethod("existeNombreEntidad", function (value, element) {
        let estado = true;
        let id = $("#hdRegistroId").val() === "" ? 0 : parseInt($("#hdRegistroId").val());
        let hdMantenimientoId = parseInt($("#hdMantenimientoId").val());
        let hdEntidadRelacionId = parseInt($("#hdEntidadRelacionId").val());
        let txtValor = $.trim(value);
        if (txtValor !== "" && txtValor.length > 2)
            estado = !ExisteNombreEntidadByConfiguracion(id, txtValor, hdMantenimientoId, hdEntidadRelacionId);

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
            txtDescripcion: {
                requiredSinEspacios: true
            },
            txtReponsable: {
                required: true
            },
            txtMatricula: {
                required: true
            },
            txtCorreo: {
                email: true
            }
        },
        messages: {
            txtNombre: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre"),
                existeNombreEntidad: "El nombre ya existe"
            },
            txtDescripcion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
            txtReponsable: {
                required: String.Format("Debes ingresar {0}.", "un Responsable")
            },
            txtMatricula: {
                required: String.Format("Debes ingresar {0}.", "una Matricula")
            },
            txtCorreo: {
                email: String.Format("Debes ingresar {0}.", "un Correo")
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

function GuardarAll() {
    let entidad_mant = parseInt($("#hdMantenimientoId").val());
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === entidad_mant) || null;
    if (item !== null) {
        GuardarRegistro(item);
    }
}

function GuardarRegistro(item) {
    if ($("#formAddOrEditRegistro").valid()) {
        $("#btnRegistrar").button("loading");
        let entidadRelacionId = $("#hdEntidadRelacionId").val() !== "" ? parseInt($("#hdEntidadRelacionId").val()) : 0;

        let entidad = {
            Id: ($("#hdRegistroId").val() === "") ? 0 : parseInt($("#hdRegistroId").val()),
            EntidadRelacionId: entidadRelacionId,
            //Nombre: $.trim($("#txtNombre").val()).toUpperCase(),
            Nombre: SetCustomName($("#txtNombre").val()),
            Descripcion: $.trim($("#txtDescripcion").val()),
            Responsable: $.trim($("#txtReponsable").val()),
            ResponsableMatricula: $("#txtMatricula").val(),
            ResponsableCorreo: $("#txtCorreo").val(),
            CodigoSIGA: $("#txtCodigoSIGA").val(),
        };

        $.ajax({
            url: URL_API_VISTA + "/" + item.UrlAddOrEdit,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(entidad),
            dataType: "json",
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                listarRegistros(item, entidadRelacionId);
            },
            complete: function () {
                $("#btnRegistrar").button("reset");
                OpenCloseModal($("#mdAddOrEditRegistro"), false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function nombreFormatter(value, row, index) {
    let opc1 = opc2 = "";
    if (row.Activo) {
        opc1 = `<a href="javascript:editarRegistroAll(${row.Id}, ${row.MantenimientoId})" title="Editar">${value}</a>`;
        opc2 = `<a href="javascript:listarChildren(${row.Id}, ${row.Nivel})" title="Ver entidades"><i class="glyphicon glyphicon-chevron-right"></i></a>`;
    } else {
        opc1 = value;
    }

    return opc1.concat("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", opc2);
}

function cellStyle(value, row, index) {
    if (row.IsSelected) {
        return {
            classes: "fondoAzul"
        };
    }

    return {
        classes: ""
    };
}

function listarChildren(id, nivel) {
    let nivelChild = nivel + 1;

    //Setup Parent
    let parent = TABLE_NIVELES.find(x => x.Nivel === nivel) || null;
    if (parent !== null) {
        let dataParent = parent.Table.bootstrapTable('getData');
        let itemSelected = dataParent.find(x => x.IsSelected === true) || null;
        if (itemSelected !== null) {
            parent.Table.bootstrapTable('updateByUniqueId', {
                id: itemSelected.Id,
                row: {
                    IsSelected: false
                }
            });
        }

        parent.Table.bootstrapTable('updateByUniqueId', {
            id: id,
            row: {
                IsSelected: true
            }
        });
    }

    //Setup Child
    let child = TABLE_NIVELES.find(x => x.Nivel === nivelChild) || null;
    if (child !== null) {
        $("#hdEntidadRelacionId").val(id);
        listarRegistros(child, id);
    }
}

function editarRegistroAll(id, mantenimientoId) {
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === mantenimientoId) || null;
    if (item !== null) {
        $("#hdMantenimientoId").val(mantenimientoId);
        editarRegistro(id, item);
    }
}

function editarRegistro(id, item) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#title-form").html(String.Format("Editar {0}", item.TitleModal));
    $.ajax({
        url: URL_API_VISTA + `/${item.UrlGetById}?id=${id}`,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        type: "GET",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    let data = dataObject;
                    limpiarModal();
                    OpenCloseModal($("#mdAddOrEditRegistro"), true);

                    $("#hdRegistroId").val(data.Id);
                    $("#txtNombre").val(data.Nombre);
                    $("#txtDescripcion").val(data.Descripcion);
                    $("#txtReponsable").val(data.Responsable);
                    $("#txtNombreResponsable").val(data.Responsable);
                    $("#hdEntidadRelacionId").val(data.EntidadRelacionId);
                    $("#txtMatricula").val(data.ResponsableMatricula);
                    $("#txtCorreo").val(data.ResponsableCorreo);
                    $("#txtCodigoSIGA").val(data.CodigoSIGA);

                    HabilitarInputs(data.FlagEditar);


                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function cogFormatter(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo";
    let type_icon = row.Activo ? "check" : "unchecked";
    if (row.FlagEditar) {
        let btnEstado = `<a href="javascript:CambiarEstadoAll(${row.Id}, ${row.Activo}, ${row.MantenimientoId}, ${row.EntidadRelacionId})" title="Cambiar estado"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
        let btnEliminar = `<a href="javascript:EliminarRegistroAll(${row.Id}, ${row.MantenimientoId}, ${row.EntidadRelacionId})" title="Eliminar registro"><i class="${style_color} glyphicon glyphicon-trash"></i></a>`;
        return btnEstado.concat("&nbsp;&nbsp;", btnEliminar);
    }
    else
        return '-';
}

function EliminarRegistroAll(id, mantenimientoId, entidadRelacionId) {
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === mantenimientoId) || null;
    if (item !== null) {
        EliminarRegistro(id, item, entidadRelacionId);
    }
}

function EliminarRegistro(id, item, _entidadRelacionId) {
    let entidadRelacionId = _entidadRelacionId || null;

    let MENSAJE_VIEW = "¿Estás seguro(a) que deseas eliminar el registro seleccionado?";
    let dataRetorno = ExisteRelacionPortafolio(id, item.Mantenimiento, entidadRelacionId);
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
                        url: URL_API + `/Aplicacion/ConfiguracionPortafolio/EliminarRegistroByConfiguracion?id=${id}&idConfiguracion=${item.Mantenimiento}`,
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        type: "GET",
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Se eliminó el registro correctamente", TITULO_MENSAJE);
                                    listarRegistros(item, entidadRelacionId);
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

function CambiarEstadoAll(id, estadoActual, mantenimientoId, entidadRelacionId) {
    let item = TABLE_NIVELES.find(x => x.Mantenimiento === mantenimientoId) || null;
    if (item !== null) {
        CambiarEstadoRegistro(id, estadoActual, item, entidadRelacionId);
    }
}

function CambiarEstadoRegistro(id, estadoActual, item, _entidadRelacionId) {
    let entidadRelacionId = _entidadRelacionId || null;
    let msjOpcion = estadoActual ? "desactivar" : "activar";

    let MENSAJE_VIEW = `¿Estás seguro(a) que deseas ${msjOpcion} el registro seleccionado?`;
    let dataRetorno = ExisteRelacionPortafolio(id, item.Mantenimiento, entidadRelacionId);
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
                        url: URL_API_VISTA + `/${item.UrlCambiarEstado}?id=${id}&estadoActual=${estadoActual}`,
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        type: "GET",
                        dataType: "json",
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    listarRegistros(item, entidadRelacionId);
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

function ExportarInfo() {
    //let _data = $table.bootstrapTable("getData") || [];
    //if (_data.length === 0) {
    //    MensajeNoExportar(TITULO_MENSAJE);
    //    return false;
    //}

    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre == null ? '' : DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&criticidadId=${DATA_EXPORTAR.CriticidadId}&gerencia=${DATA_EXPORTAR.Gerencia == null ? '' : DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division == null ? '' : DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad == null ? '' : DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area == null ? '' : DATA_EXPORTAR.Area}`;
    //let url = `${URL_API_VISTA}/ExportarConfiguracion?nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&gerencia=${DATA_EXPORTAR.Gerencia}&division=${DATA_EXPORTAR.Division}&unidad=${DATA_EXPORTAR.Unidad}&area=${DATA_EXPORTAR.Area}&estado=${DATA_EXPORTAR.Estado}&aplicacion=${DATA_EXPORTAR.Aplicacion}&jefeequipo=${DATA_EXPORTAR.JefeEquipo}&owner=${DATA_EXPORTAR.Owner}`;
    let url = URL_API_VISTA + "/ExportarGerencia";
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
            if ($IdBox != null) {
                $IdBox.val(ui.item.id);
                $("#txtCorreo").val(ui.item.mail);
                $("#txtReponsable").val(ui.item.displayName);
                $("#txtMatricula").val(ui.item.matricula);
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>").append("<a style='display: block'><font>" + item.displayName + "</font></a>").appendTo(ul);
    };
}
function HabilitarInputs($FlagEdit) {
    $('#txtNombre').prop('disabled', !$FlagEdit);
    $('#txtNombreResponsable').prop('disabled', !$FlagEdit);
    $('#txtReponsable').prop('disabled', !$FlagEdit);
    $('#txtMatricula').prop('disabled', !$FlagEdit);
    $('#txtCorreo').prop('disabled', !$FlagEdit);
    $('#txtCodigoSIGA').prop('disabled', !$FlagEdit);
}

function getResponsableUnidad(id) {
    var resultado;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Aplicacion/ConfiguracionPortafolio/GetUnidadByFiltro/" + id,
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