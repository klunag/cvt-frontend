var $table = $("#tblEquipo");
var $tblEquiposDesactivados = $("#tblEquiposDes");
var URL_API_VISTA = URL_API + "/Equipo";
var URL_API_VISTA_APPLIANCE = URL_API + "/ApplianceSolicitud";
var DATA_EXPORTAR = {};
var DATA_EXPORTAR_EQ_DESACTIVOS = {};
var TITULO_MENSAJE = "Gestión de equipos";
var MENSAJE_CARGA_MASIVA = "";
var TITULO_CARGA_MASIVA = "Resumen de importación de equipos";
var FLAG_ACTIVO_EQUIPO = 0;
var DOMINIO_RED_ACTUAL = null;
var PARAMETRO_ACTIVAR_EQUIPO = false;
var TIPO_EQUIPO = { SERVIDOR: 1, SERVIDOR_AGENCIA: 2, PC: 3, SERVICIO_NUBE: 4, STORAGE: 5, APPLIANCE: 6 };
const EQUIPOS_ARR_FILTRO = [TIPO_EQUIPO.SERVIDOR, TIPO_EQUIPO.SERVIDOR_AGENCIA, TIPO_EQUIPO.PC, TIPO_EQUIPO.STORAGE, TIPO_EQUIPO.APPLIANCE, TIPO_EQUIPO.SERVICIO_NUBE];
const SUBDOMINIO_STORAGE_ID = 42;

$(function () {
    cargarCombos();
    initFecha();
    FormatoCheckBox($("#divFlagExCal"), 'cbFlagExCal');
    FormatoCheckBox($("#divFlagServicio"), 'cbFlagServicio');
    $("#cbFlagExCal").change(FlagExclusion_Change);
    $("#ddlDominio").on('change', function () { obtenerSubdominiosByDominioId(this.value, $("#ddlSubdominio")); });

    $("#cbTipoEquipo").change(DdlTipoEquipo_Change);
    //$("#cbFilDes").change(DdlFiltroDescubrimiento_Change);

    validarFormOS();
    //validarAddOrEditForm();
    validarAddOrEditForm();
    validarAddOrEditFormSO();
    validarFormImportar();

    $("#cbFilTipoEq").val(1);
    listarEquipos();
    InitAutocompletarBuilder($("#txtBusEq"), null, ".containerFiltro", "/Equipo/GetEquipoByFiltro?filtro={0}");
    InitAutocompletarBuilder($("#txtTecnologiaAsig"), $("#hdTecnologiaAsig"), ".tecAsigContainer", "/Tecnologia/GetTecnologiaByClave?filtro={0}");

    initUpload($("#txtArchivo"));

    $("#btnRegAsigSO").click(guardarAsignarSO);
    //$("#btnRegAsigTec").click(guardarAsignarSO);
});

function FlagExclusion_Change() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    var flag = $(this).prop("checked");
    if (flag) {
        $(".divExclusion").show();
        //$(".divExclusion").removeClass("ignore");
    }
    else {
        $(".divExclusion").hide();
        //$(".divExclusion").addClass("ignore");
    }
}

function DdlTipoEquipo_Change() {
    var ddlValor = parseInt($(this).val());
    if (ddlValor !== -1) {
        let idEquipo = ($("#hdEquipoId").val() === "") ? 0 : parseInt($("#hdEquipoId").val());
        if (idEquipo === 0) {
            if (ddlValor === TIPO_EQUIPO.STORAGE) {
                $(".divTipoStorage").addClass("ignore");
                $(".divTipoStorage").hide();
            } else {
                $(".divTipoStorage").show();
                $(".divTipoStorage").removeClass("ignore");
            }
        }
    }
}

function limpiarAddOrEditModal() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    //$("#cbAmbiente").val(-1);
    $("#cbFlagExCal").prop('checked', false);
    $("#cbFlagExCal").bootstrapToggle('off');
    $("#cbFlagServicio").prop('checked', false);
    $("#cbFlagServicio").bootstrapToggle('off');
    //Nuevos campos
    $("#txtSB, #dpFecLanTec, #dpFecSopTec, #dpFecExtTec, #dpFecIntTec, #txtComentarios").val("");
    $("#cbAmbiente, #ddlDominio, #ddlSubdominio, #ddlFechaCalculo").val("-1");
    $('#tabModulo a:first').tab('show');
}

function irAddOrEditModal(EstadoMd) {
    limpiarAddOrEditModal();
    if (EstadoMd)
        $("#MdAddOrEdit").modal(opcionesModal);
    else
        $("#MdAddOrEdit").modal('hide');
}

function buscarEquipo() {
    listarEquipos();
}

function listarEquipos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListadoGestionEquipo",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusEq").val());
            DATA_EXPORTAR.tipoEquipoId = $("#cbFilTipoEq").val();
            DATA_EXPORTAR.desId = $("#cbFilDes").val();
            DATA_EXPORTAR.exCalculoId = $("#cbFilExCal").val();
            DATA_EXPORTAR.flagActivo = $("#ddlEstado").val();//FLAG_ACTIVO_EQUIPO;
            DATA_EXPORTAR.subsidiariaId = "-1";//$("#cbFilSubsidiaria").val();
            DATA_EXPORTAR.tipoEquipoIds = [];
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
        onExpandRow: function (index, row, $detail) {
            let data = ListarRegistrosDetalle(row.Id);
            if (data.length > 0) {
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("destroy");
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable({ data: data });
                $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("hideLoading");
            } else $detail.empty().append("No existe registros");
        },
        //rowStyle: function (row, index) {
        //    var classes = [
        //        'bg-blue',
        //        'bg-green',
        //        'bg-orange',
        //        'bg-yellow',
        //        'soContainer'
        //    ];

        //    if (row.Activo === false) {
        //        return {
        //            classes: 'bg-blue'//classes[3]
        //        };
        //    }

        //    return {
        //        css: {
        //            color: 'black'
        //        }
        //    };
        //}
    });
}

function editarEquipo(Id, TipoEquipoId) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#titleForm").html("Editar equipo");

    $("#ddlDominio").prop("disabled", true);
    $("#ddlSubdominio").prop("disabled", true);

    $(".onlyAdd").addClass("ignore");
    $(".onlyAdd").hide();

    setViewModalEquipo(PARAMETRO_ACTIVAR_EQUIPO, TipoEquipoId);
    
    $.ajax({
        url: URL_API_VISTA + "/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    irAddOrEditModal(true);
                    $("#hdEquipoId").val(dataObject.Id);   
                    $("#cbTipoEquipo").val(TipoEquipoId);
                    $("#hdTipoEquipoId").val(TipoEquipoId);
                    $("#cbAmbiente").val(dataObject.AmbienteId);
                    $("#cbFlagExCal").prop('checked', dataObject.FlagExcluirCalculo);
                    $("#cbFlagServicio").prop('checked', dataObject.FlagServidorServicio);
                    $("#cbFlagExCal").bootstrapToggle(dataObject.FlagExcluirCalculo ? 'on' : 'off');
                    $("#cbFlagServicio").bootstrapToggle(dataObject.FlagServidorServicio ? 'on' : 'off');

                    $("#cbTipoExclusion").val($("#cbFlagExCal").prop('checked') ? dataObject.TipoExclusionId : "-1");
                    $("#txtMotivoExclusion").val($("#cbFlagExCal").prop('checked') ? dataObject.MotivoExclusion : "");

                    $("#cbDominioRed").val(dataObject.DominioServidorId !== null ? dataObject.DominioServidorId : "-1");
                    DOMINIO_RED_ACTUAL = dataObject.DominioServidorId;
                    $("#hdFlagDominioRed").val(dataObject.FlagCambioDominioRed);

                    let _flagTemp = dataObject.FlagTemporal || false;
                    let _ubicacion = dataObject.Ubicacion || null;
                    if (_flagTemp && _ubicacion === null) {
                        $(".div-tipo-equipo").removeClass("ignore");
                        $(".div-tipo-equipo").show();
                    } else {
                        $(".div-tipo-equipo").addClass("ignore");
                        $(".div-tipo-equipo").hide();
                    }

                    let dataESB = dataObject.EquipoSoftwareBase || null;
                    $("#hdEquipoSoftwareBaseId").val(dataESB !== null ? dataESB.Id : "0");
                    if (dataESB !== null) {
                        //if (TipoEquipoId === TIPO_EQUIPO.STORAGE || TipoEquipoId === TIPO_EQUIPO.APPLIANCE) {
                            $("#txtSB").val(dataESB.SoftwareBase || "");
                            $("#dpFecLanTec").val(dataESB.FechaLanzamientoStr);
                            $("#dpFecSopTec").val(dataESB.FechaFinSoporteStr);
                            $("#dpFecExtTec").val(dataESB.FechaFinExtendidaStr);
                            $("#dpFecIntTec").val(dataESB.FechaFinInternaStr);
                            $("#txtComentarios").val(dataESB.ComentariosFechaFin || "");
                            $("#ddlDominio").val(dataESB.DominioId);
                            $("#ddlDominio").trigger("change");
                            $("#ddlSubdominio").val(dataESB.SubdominioId);
                            $("#ddlFechaCalculo").val(dataESB.FechaCalculoId || "-1");
                        //}
                    }
                   
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function linkFormatter(value, row, index) {
    let btnEditarEquipo = "";

    if (row.TipoEquipoId !== TIPO_EQUIPO.APPLIANCE) {
        if (row.Activo)
            btnEditarEquipo = `<a href="javascript:editarEquipo(${row.Id}, ${row.TipoEquipoId})" title="Editar">${value}</a>`;
        else
            btnEditarEquipo = value;
    } else
        btnEditarEquipo = value;
   
    return btnEditarEquipo;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo "; //Dependen de otro valor
    let type_icon = row.Activo ? "check" : "unchecked"; //Dependen de otro valor

    if (row.TipoEquipoId !== TIPO_EQUIPO.APPLIANCE) {
        let labelname = row.TipoEquipoId === TIPO_EQUIPO.SERVICIO_NUBE ? "Asignar tecnología" : "Asignar SO";
        let btnAsignarSO = row.TipoEquipoId === TIPO_EQUIPO.STORAGE ? "" : `<a href="javascript:irAsignarSO(${row.Id}, ${row.TipoEquipoId})" title='${labelname}'>[${labelname}]</a>`;
        let btnDesactivar = `<a href="javascript:irCambiarEstado(${row.Id})" title="Desactivar equipo"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
        let btnActivar = `<a href="javascript:activarEquipo(${row.Id}, ${row.Activo})" title="Activar equipo"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
        //let exportar = `<a href="javascript:ExportarInfoDetalle(${row.Id},${index})" title="exportar">[ <span class="icon icon-external-link"></span>Exportar]</a>`

        if (row.Activo) {
            if (row.FlagTemporal) {
                return btnAsignarSO.concat("&nbsp;&nbsp;", btnDesactivar);
            }
        } else {
            //if (!row.FlagTemporal) {
            //    return btnActivar;
            //}
            return btnActivar; //Para los dos tipos de descubrimiento
        }
    }
    //else if (row.TipoEquipoId === TIPO_EQUIPO.APPLIANCE) {
    //    if (row.EquipoSolicitudId !== null) {
    //        if (row.EquipoSolicitudId > 0) {
    //            return `<a href="javascript:revertirSolicitud(${row.Id})" title="Revertir configuración de tipo de equipo"><i class="${style_color} glyphicon glyphicon-trash"></i></a>`;
    //        }
    //    }

    //    if (row.Activo === false) {
    //        let btnActivar = `<a href="javascript:activarEquipo(${row.Id}, ${row.Activo})" title="Activar equipo"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    //        return btnActivar; //Para los dos tipos de descubrimiento
    //    }
    //}
    else
        return "";
}

function activarEquipo(EquipoId, Activo) {
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás seguro que deseas activar el equipo seleccionado?. Solo sera posible activarlo como equipos de carga manual",
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
            if (result !== null && result) {
                let motivo = "";

                $.ajax({
                    type: 'GET',
                    contentType: "application/json; charset=utf-8",
                    url: `${URL_API_VISTA}/GestionEquipos/CambiarEstado?Id=${EquipoId}&Activo=${Activo}&Motivo=${motivo}`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se activó el equipo correctamente", TITULO_MENSAJE);
                                listarEquipos();
                            }
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    }
                });
            }
        }
    });
}

function validarFormOS() {
    $("#formOS").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtObs: {
                requiredSinEspacios: true
            }
        },
        messages: {
            txtObs: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el motivo")
            }
        }
    });
}

function irCambiarEstado(EquipoId) {
    LimpiarValidateErrores($("#formOS"));
    $("#hdEquipoId").val(EquipoId);
    $("#txtObs").val("");
    $("#title_modal").html(TITULO_MENSAJE);
    OpenCloseModal($("#mdOS"), true);
}

function cambiarEstadoEquipo() {
    if ($("#formOS").valid()) {

        $("#btnOS").button("loading");

        let EquipoId = parseInt($("#hdEquipoId").val());
        let Motivo = $.trim($("#txtObs").val());
        let Activo = true;

        $.ajax({
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            url: `${URL_API_VISTA}/GestionEquipos/CambiarEstado?Id=${EquipoId}&Activo=${Activo}&Motivo=${Motivo}`,
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        $("#btnOS").button("reset");
                        OpenCloseModal($("#mdOS"), false);
                        toastr.success("Se desactivó el equipo correctamente", TITULO_MENSAJE);
                        listarEquipos();
                    }
                }
                else {
                    toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                var error = JSON.parse(xhr.responseText);
            }
        });
    }
}

function irAsignarSO(Id, TipoEquipoId) {
    LimpiarValidateErrores($("#formAsigSO"));
    $("#hdEquipoId").val(Id);
    OpenCloseModal($("#MdAsigSO"), true);
    
    if (TipoEquipoId === TIPO_EQUIPO.SERVICIO_NUBE) { //Tecnologia
        $(".title-asignar").html("Asignar tecnología");
        $("#txtTecnologiaAsig").val("");
        $("#cbSO").val("-1");
        $("#hdTecnologiaAsig").val("0");

        $(".all").hide();
        $(".all-tecnologia").show();
        $(".all-tecnologia").removeClass("ignore");
        $(".all-so").addClass("ignore");

        $.ajax({
            url: `${URL_API_VISTA}/ObtenerSOById?Id=${Id}`,
            type: "GET",
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    $("#hdTecnologiaAsig").val(dataObject === null ? "0" : dataObject.TecnologiaId);
                    $("#txtTecnologiaAsig").val(dataObject === null ? "" : dataObject.TecnologiaStr);
                    $("#hdEquipoTecnologiaId").val(dataObject === null ? -1 : dataObject.Id);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            async: false
        });

    } else { //SO
        $(".title-asignar").html("Asignar sistema operativo");
        $(".all").hide();
        $(".all-so").show();
        $(".all-so").removeClass("ignore");
        $(".all-tecnologia").addClass("ignore");

        $.ajax({
            url: `${URL_API_VISTA}/ObtenerSOById?Id=${Id}`,
            type: "GET",
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    console.log(dataObject);
                    $("#cbSO").val(dataObject === null ? -1 : dataObject.TecnologiaId);
                    $("#hdEquipoTecnologiaId").val(dataObject === null ? -1 : dataObject.Id);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            },
            async: false
        });
    }
}

function guardarAsignarSO() {
    if ($("#formAsigSO").valid()) {
        $("#btnRegAsigSO").button("loading");

        var et = {};
        et.Id = parseInt($("#hdEquipoTecnologiaId").val());
        et.EquipoId = parseInt($("#hdEquipoId").val());
        et.TecnologiaId = parseInt($("#cbSO").val() === "-1" ? $("#hdTecnologiaAsig").val() : $("#cbSO").val());

        $.ajax({
            url: URL_API_VISTA + "/AsignarSO",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(et),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        toastr.success("Registrado correctamente", TITULO_MENSAJE);
                        listarEquipos();
                    }
                }
            },
            complete: function () {
                $("#btnRegAsigSO").button("reset");
                OpenCloseModal($("#MdAsigSO"), false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}

function cargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    SetItems(dataObject.Ambiente, $("#cbAmbiente"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoEquipo, $("#cbFilTipoEq"), TEXTO_TODOS);
                    SetItems(dataObject.TipoEquipo, $("#cbTipoEquipoFil"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoEquipo, $("#cbTipoEquipo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Descubrimiento, $("#cbFilDes"), TEXTO_TODOS);
                    SetItems(dataObject.SO, $("#cbSO"), TEXTO_SELECCIONE);
                    SetItems(dataObject.SO, $("#cbSOAdd"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EstadoCalculo, $("#cbFilExCal"), TEXTO_TODOS);
                    SetItems(dataObject.TipoExclusion, $("#cbTipoExclusion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.DominioRed, $("#cbDominioRed"), TEXTO_SELECCIONE);
                    SetItems(dataObject.CaracteristicaEquipo, $("#cbCaracteristica"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EstadoEquipo, $("#ddlEstado"), TEXTO_TODOS);
                    SetItems(dataObject.Dominio, $("#ddlDominio"), TEXTO_SELECCIONE);
                    SetItems(dataObject.FechaCalculo, $("#ddlFechaCalculo"), TEXTO_SELECCIONE);

                    PARAMETRO_ACTIVAR_EQUIPO = dataObject.ParametroEquipo;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function guardarAddOrEditEquipo() {
    if ($("#formAddOrEdit").valid()) {
        
        let dominioRedNuevo = parseInt($("#cbDominioRed").val());
        var equipo = {};
        equipo.FlagCambioDominioRed = $("#hdFlagDominioRed").val();
        equipo.Id = ($("#hdEquipoId").val() === "") ? 0 : parseInt($("#hdEquipoId").val());

        if (equipo.Id !== 0) {
            if (DOMINIO_RED_ACTUAL !== dominioRedNuevo) {
                bootbox.confirm({
                    title: TITULO_MENSAJE,
                    message: "Ud. ha modificado el dominio de red, ¿Este cambio es permanente o no?",
                    buttons: {
                        cancel: {
                            label: 'No'
                        },
                        confirm: {
                            label: 'Si'
                        }
                    },
                    callback: function (result) {
                        //console.log(result);
                        //debugger;
                        if (result) {
                            equipo.FlagCambioDominioRed = true;
                            GuardarEquipo(equipo);
                        } else {
                            GuardarEquipo(equipo);
                        }
                    }
                });

            } else {
                GuardarEquipo(equipo);
            }

        } else {
            GuardarEquipo(equipo);
        }
        
    }
}

function GuardarEquipo(equipo) {
    $("#btnRegEq").button("loading");
    //var equipo = {};
    //equipo.Id = ($("#hdEquipoId").val() === "") ? 0 : parseInt($("#hdEquipoId").val());
    equipo.Nombre = $("#txtNomEquipo").val();
    equipo.TipoEquipoId = $("#cbTipoEquipo").val();
    equipo.AmbienteId = $("#cbAmbiente").val();
    equipo.DominioServidorId = $("#cbDominioRed").val();
    equipo.CaracteristicaEquipo = $("#cbCaracteristica").val();
    equipo.FlagExcluirCalculo = $("#cbFlagExCal").prop("checked");
    equipo.FlagServidorServicio = $("#cbFlagServicio").prop("checked");
    equipo.TipoExclusionId = $("#cbFlagExCal").prop("checked") ? $("#cbTipoExclusion").val() : "-1";
    equipo.MotivoExclusion = $("#cbFlagExCal").prop("checked") ? $("#txtMotivoExclusion").val() : "";
    equipo.TecnologiaId = ($("#cbSOAdd").val() !== null || $("#cbSOAdd").val() !== "-1") ? $("#cbSOAdd").val() : 0;
    $.ajax({
        url: URL_API_VISTA,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(equipo),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //debugger;
                    let EquipoId = dataObject;
                    let TipoEquipoId = parseInt($("#hdTipoEquipoId").val());
                    toastr.success("Registrado correctamente", TITULO_MENSAJE);
                    
                    if (PARAMETRO_ACTIVAR_EQUIPO || (TipoEquipoId === TIPO_EQUIPO.STORAGE || TipoEquipoId === TIPO_EQUIPO.APPLIANCE))
                        GuardarEquipoSoftwareBase(EquipoId);
                    
                    listarEquipos();
                }
            }
        },
        complete: function () {
            $("#btnRegEq").button("reset");
            irAddOrEditModal(false);
        },
        error: function (result) {
            alert(result.responseText);
        }
    });
}

function validarAddOrEditForm() {

    $.validator.addMethod("requiredTipo", function (value, element) {
        if ($("#cbFlagExCal").prop("checked")) {
            value = value || null;
            return value !== "-1" && value !== null;
        }
        return true;
    });

    $.validator.addMethod("requiredMotivo", function (value, element) {
        if ($("#cbFlagExCal").prop("checked")) {
            return $.trim(value) !== "";
        }
        return true;
    });

    $("#formAddOrEdit").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomEquipo: {
                requiredSinEspacios: true
            },
            cbTipoEquipo: {
                requiredSelect: true
            },
            cbDominioRed: {
                requiredSelect: true
            },
            cbCaracteristica: {
                requiredSelect: true
            },
            cbSOAdd: {
                requiredSelect: true
            },
            cbAmbiente: {
                requiredSelect: true
            },
            cbTipoExclusion: {
                requiredTipo: true
            },
            txtMotivoExclusion: {
                requiredMotivo: true
            },
            ddlDominio: {
                requiredSelect: true
            },
            ddlSubdominio: {
                requiredSelect: true
            },
            dpFecLanTec: {
                requiredSinEspacios: true
            },
            dpFecExtTec: {
                requiredSinEspacios: true
            },
            dpFecSopTec: {
                requiredSinEspacios: true
            },
            dpFecIntTec: {
                requiredSinEspacios: true
            },
            ddlFechaCalculo: {
                requiredSelect: true
            }
        },
        messages: {
            txtNomEquipo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            cbTipoEquipo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo de equipo")
            },
            cbDominioRed: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el dominio")
            },
            cbCaracteristica: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "la característica")
            },
            cbSOAdd: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el sistema operativo")
            },
            cbAmbiente: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el ambiente")
            },
            cbTipoExclusion: {
                requiredTipo: String.Format("Debes seleccionar {0}.", "el tipo de exclusión")
            },
            txtMotivoExclusion: {
                requiredMotivo: String.Format("Debes ingresar {0}.", "el motivo de exclusión")
            },
            ddlDominio: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el dominio")
            },
            ddlSubdominio: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el subdominio")
            },
            dpFecLanTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha de lanzamiento")
            },
            dpFecExtTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha fin extendida")
            },
            dpFecSopTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha fin soporte")
            },
            dpFecIntTec: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha fin interna")
            },
            ddlFechaCalculo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "la fecha de cálculo")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "dpFecLanTec" || element.attr('name') === "dpFecExtTec"
                || element.attr('name') === "dpFecSopTec" || element.attr('name') === "dpFecIntTec") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function validarAddOrEditFormSO() {
    $("#formAsigSO").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbSO: {
                requiredSelect: true
            },
            txtTecnologiaAsig: {
                requiredSinEspacios: true
            }
        },
        messages: {
            cbSO: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un sistema operativo")
            },
            txtTecnologiaAsig: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la tecnología")
            }
        }
    });
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }

    DATA_EXPORTAR.tipoEquipoIds = "";

    let url = `${URL_API_VISTA}/GestionEquipos/Exportar?filtro=${DATA_EXPORTAR.nombre}&tipoEquipoId=${DATA_EXPORTAR.tipoEquipoId}&desId=${DATA_EXPORTAR.desId}&exCalculoId=${DATA_EXPORTAR.exCalculoId}&flagActivo=${DATA_EXPORTAR.flagActivo}&subsidiariaId=${DATA_EXPORTAR.subsidiariaId}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&tipoEquipoIds=${DATA_EXPORTAR.tipoEquipoIds}`;
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
function ListarRegistrosDetalle(Id) {
    let data = [];
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Equipo/ListarEquipoTecnologiaByEquipoId/" + Id,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                data = dataObject;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return data;
}
function detailFormatter(index, row) {
    let html = `<table id="tblRegistrosDetalle_${row.Id}"  data-mobile-responsive="true">
                            <thead>
                                <tr>
                                    <th data-field="DominioNomb" data-halign="center" data-valign="middle" data-align="center">Dominio</th>
                                    <th data-field="SubdominioNomb" data-halign="center" data-valign="middle" data-align="center">Subdominio</th>
                                    <th data-field="ClaveTecnologia" data-halign="center" data-valign="middle" data-align="center">Tecnología</th>
                                </tr>
                            </thead>
                        </table>`;
    return html;
}
function ExportarInfoDetallado() {    
    let url = `${URL_API_VISTA}/GestionEquipos/ExportarAdicionales`;
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

function initUpload(txtNombreArchivo) {
    var inputs = document.querySelectorAll('.inputfile');
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
                txtNombreArchivo.val(fileName);
            else
                label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
    });
}

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
            cbTipoEquipoFil: {
                requiredSelect: true
            },
            flArchivo: {
                requiredArchivo: true,
                requiredExcel: true
            }
        },
        messages: {
            cbTipoEquipoFil: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo de equipo")
            },
            flArchivo: {
                requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo"),
                requiredExcel: String.Format("Debes seleccionar {0}.", "un archivo válido")
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

function descargarEquiposActualizar() {
    $(".onlyImport").addClass("ignore");    
    if ($("#formImportar").valid()) {
        let filtro = $("#cbTipoEquipoFil").val();
        let url = `${URL_API_VISTA}/GestionEquipos/Exportar/Actualizar?tipoEquipoId=${filtro}`;
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
}

function descargarPlantillaEquipos() {
    let url = `${URL_API_VISTA}/GestionEquipos/ObtenerPlantillaEquipos`;
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

function IrImportarEquipos() {
    $("#btnReg").show();
    $("#btnActualizar").hide();
    $("#btnDescargarPlantilla").show();
    $(".onlyUpdate").addClass("ignore");
    $(".onlyUpdate").hide();
    $(".onlyImport").removeClass("ignore");
    LimpiarValidateErrores($("#formImportar"));
    $("#titleFormImp").html(String.Format("{0} equipos", "Importar"));
    $("#flArchivo").val("");
    $("#txtArchivo").val(TEXTO_SIN_ARCHIVO);
    $("#mdImportar").modal(opcionesModal);
}

function IrActualizarEquipos() {
    $("#btnReg").hide();
    $("#btnActualizar").show();
    $(".onlyUpdate").show();
    $(".onlyUpdate").removeClass("ignore");
    $("#btnDescargarPlantilla").hide();
    LimpiarValidateErrores($("#formImportar"));
    $("#titleFormImp").html(String.Format("{0} equipos", "Actualización masiva de"));
    $("#flArchivo").val("");
    $("#txtArchivo").val(TEXTO_SIN_ARCHIVO);
    $("#cbTipoEquipoFil").val("-1");
    $("#mdImportar").modal(opcionesModal);
}

function ActualizarEquipos() {
    $(".onlyUpdate").addClass("ignore");
    $(".onlyImport").removeClass("ignore");
    if ($("#formImportar").valid()) {

        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $("#btnActualizar").button("loading");

        let formData = new FormData();
        let file = $("#flArchivo").get(0).files;
        formData.append("File", file[0]);

        $.ajax({
            url: URL_API_VISTA + "/GestionEquipos/ActualizarEquipos",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            data: formData,
            contentType: false,
            processData: false,
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        $("#btnActualizar").button("reset");
                        $("#mdImportar").modal("hide");
                        waitingDialog.hide();
                        listarEquipos();
                        //console.log(dataObject);
                        bootbox.alert({
                            size: "sm",
                            title: TITULO_MENSAJE,
                            message: "Se realizó la actualización masiva de equipos correctamente",
                            buttons: {
                                ok: {
                                    label: 'Aceptar',
                                    className: 'btn-primary'
                                }
                            }
                        });
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function CargarEquipos() {
    if ($("#formImportar").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $("#btnReg").button("loading");

        let formData = new FormData();
        let file = $("#flArchivo").get(0).files;
        formData.append("File", file[0]);

        $.ajax({
            url: URL_API_VISTA + "/GestionEquipos/CargarEquipos",
            type: "POST",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            data: formData,
            contentType: false,
            processData: false,
            success: function (dataObject, textStatus) {
                if (textStatus === "success") {
                    if (dataObject !== null) {
                        $("#btnReg").button("reset");
                        $("#mdImportar").modal("hide");
                        waitingDialog.hide();
                        //CUSTOM MESSAGE

                        var TotalRegistros = dataObject.TotalRegistros;
                        var Errores = dataObject.Errores;
                        if (TotalRegistros > 0) {
                            var NoRegistrados = Errores.length;
                            if (NoRegistrados > 0) {
                                MENSAJE_CARGA_MASIVA = String.Format("Se registraron {0} de {1} registros", TotalRegistros - NoRegistrados, TotalRegistros);
                                MENSAJE_CARGA_MASIVA = MENSAJE_CARGA_MASIVA.concat("<br>", "Errores: ");
                                MENSAJE_CARGA_MASIVA = MENSAJE_CARGA_MASIVA.concat("<br>", Errores.join("<br>"));
                            } else {
                                MENSAJE_CARGA_MASIVA = String.Format("Se registraron {0} de {1} registros", TotalRegistros, TotalRegistros);
                            }
                            //MENSAJE_CARGA_MASIVA = MENSAJE_CARGA_MASIVA.concat("<br>", "¿Desea sincronizar los equipos?");

                            //bootbox.confirm({
                            //    title: TITULO_CARGA_MASIVA,
                            //    message: MENSAJE_CARGA_MASIVA,
                            //    buttons: {
                            //        cancel: {
                            //            label: 'Cancelar'
                            //        },
                            //        confirm: {
                            //            label: 'Aceptar'
                            //        }
                            //    },
                            //    callback: function (result) {
                            //        result = result || null;
                            //        if (result) {
                            //            EjecutarSPEquipos();
                            //            toastr.success("El proceso se encuentra en segundo plano", TITULO_MENSAJE);
                            //            $("#btnImportar").attr("disabled", true);
                            //            $('#btnImportar').prop('title', 'EXISTE UN PROCESO DE SINCRONIZACIÓN PENDIENTE');
                            //        }

                            //    }
                            //});
                            bootbox.alert({
                                size: "sm",
                                title: TITULO_CARGA_MASIVA,
                                message: MENSAJE_CARGA_MASIVA,
                                buttons: {
                                    ok: {
                                        label: 'Aceptar',
                                        className: 'btn-primary'
                                    }
                                }
                            });

                        } else {
                            MENSAJE_CARGA_MASIVA = "Error en la importación de equipos: ";
                            MENSAJE_CARGA_MASIVA = MENSAJE_CARGA_MASIVA.concat("<br>", Errores.join("<br>"));

                            bootbox.alert({
                                size: "sm",
                                title: TITULO_CARGA_MASIVA,
                                message: MENSAJE_CARGA_MASIVA,
                                buttons: {
                                    ok: {
                                        label: 'Aceptar',
                                        className: 'btn-primary'
                                    }
                                }
                            });
                        }
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

async function EjecutarSPEquipos() {
    var url = URL_API_VISTA + "/GestionEquipos/EjecutarSP";
    await fetch(url).then(r => r.json()).then(t => {
        console.log("fetch", t);
        if (t === "") {
            toastr.success("Se sincronizó correctamente", TITULO_MENSAJE);
            $("#btnImportar").attr("disabled", false);
            $('#btnImportar').prop('title', '');
        }
    }).catch(err => { MensajeErrorCliente(); });
    
}

function IrEquiposDesactivados() {
    listarEquiposDesactivados();
}

function listarEquiposDesactivados() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    //$tblEquiposDesactivados.bootstrapTable('destroy');
    $tblEquiposDesactivados.bootstrapTable('destroy').bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListadoGestionEquipo",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Id',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR_EQ_DESACTIVOS = {};
            DATA_EXPORTAR_EQ_DESACTIVOS.nombre = "";//$.trim($("#txtBusEq").val());
            DATA_EXPORTAR_EQ_DESACTIVOS.tipoEquipoId = "-1";//$("#cbFilTipoEq").val();
            DATA_EXPORTAR_EQ_DESACTIVOS.desId = "-1";//$("#cbFilDes").val();
            DATA_EXPORTAR_EQ_DESACTIVOS.exCalculoId = "-1"; //$("#cbFilExCal").val();
            DATA_EXPORTAR_EQ_DESACTIVOS.flagActivo = null;
            DATA_EXPORTAR_EQ_DESACTIVOS.pageNumber = p.pageNumber;
            DATA_EXPORTAR_EQ_DESACTIVOS.pageSize = p.pageSize;
            DATA_EXPORTAR_EQ_DESACTIVOS.sortName = p.sortName;
            DATA_EXPORTAR_EQ_DESACTIVOS.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_EQ_DESACTIVOS);
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
            $("#mdEquiposDes").modal(opcionesModal);
        }
        //onExpandRow: function (index, row, $detail) {
        //    let data = ListarRegistrosDetalle(row.Id);
        //    if (data.length > 0) {
        //        $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("destroy");
        //        $('#tblRegistrosDetalle_' + row.Id).bootstrapTable({ data: data });
        //        $('#tblRegistrosDetalle_' + row.Id).bootstrapTable("hideLoading");
        //    } else $detail.empty().append("No existe registros");
        //}
    });
}

function ExportarEquiposDesactivados() {
    let _data = $tblEquiposDesactivados.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }
    let url = `${URL_API_VISTA}/GestionEquipos/Exportar?filtro=${DATA_EXPORTAR_EQ_DESACTIVOS.nombre}&tipoEquipoId=${DATA_EXPORTAR_EQ_DESACTIVOS.tipoEquipoId}&desId=${DATA_EXPORTAR_EQ_DESACTIVOS.desId}&exCalculoId=${DATA_EXPORTAR_EQ_DESACTIVOS.exCalculoId}&flagActivo=${DATA_EXPORTAR_EQ_DESACTIVOS.flagActivo}&sortName=${DATA_EXPORTAR_EQ_DESACTIVOS.sortName}&sortOrder=${DATA_EXPORTAR_EQ_DESACTIVOS.sortOrder}`;
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

function AddEquipo() {
    $("#titleForm").html("Nuevo equipo");
    $("#hdEquipoId").val("");
    $("#hdEquipoSoftwareBaseId").val("0");
    $("#hdTipoEquipoId").val("0");

    $(".onlyAdd").show();
    $(".onlyAdd").removeClass("ignore");
    $(".div-tipo-equipo").removeClass("ignore");
    $(".div-tipo-equipo").show();

    setViewModalEquipo(PARAMETRO_ACTIVAR_EQUIPO);

    $("#txtNomEquipo").val('');
    $("#cbDominioRed").val('-1');
    $("#cbCaracteristica").val('-1');
    $("#cbTipoEquipo").val('-1');

    irAddOrEditModal(true);
}

function rowStyle(row, index) {
    var classes = [
        'bg-blue',
        'bg-rojo',
        'bg-orange',
        'bg-yellow',
        'bg-red'
    ];
    
    if (row.Activo === false) {
        return {
            classes: classes[1],
            css: {
                color: 'black'
            }
        };
    }

    return {
        css: {
            color: 'black'
        }
    };
}

function GuardarEquipoSoftwareBase(Id) {
    let _tipoEquipoId = parseInt($("#cbTipoEquipo").val());
    let data = {
        Id: $("#hdEquipoSoftwareBaseId").val(),
        EquipoId: Id,
        SubdominioId: _tipoEquipoId === TIPO_EQUIPO.STORAGE ? SUBDOMINIO_STORAGE_ID : $("#ddlSubdominio").val(),
        SoftwareBase: $("#txtSB").val() || null,
        FechaLanzamiento: $.trim($("#dpFecLanTec").val()) !== "" ? dateFromString($("#dpFecLanTec").val()) : null,
        FechaFinSoporte: $.trim($("#dpFecSopTec").val()) !== "" ? dateFromString($("#dpFecSopTec").val()) : null,
        FechaFinExtendida: $.trim($("#dpFecExtTec").val()) !== "" ? dateFromString($("#dpFecExtTec").val()) : null,
        FechaFinInterna: $.trim($("#dpFecIntTec").val()) !== "" ? dateFromString($("#dpFecIntTec").val()) : null,
        ComentariosFechaFin: $("#txtComentarios").val() || null,
        FechaCalculoId: $("#ddlFechaCalculo").val() || null,
    };

    $.ajax({
        url: URL_API_VISTA + "/AddOrEditEquipoSoftwareBase",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    console.log('ID > ' + dataObject);
                }
            }
        },
        error: function (result) {
            alert(result.responseText);
        }
    });
}

function setViewModalEquipo(parametro, tipoEquipoId = 0) {
    if (parametro) {
        $(".parametro-view").show();
        $(".parametro-view").removeClass("ignore");
        //if (tipoEquipoId !== 0) {
        //    switch (tipoEquipoId) {
        //        case TIPO_EQUIPO.PC:
        //        case TIPO_EQUIPO.SERVIDOR:
        //        case TIPO_EQUIPO.SERVIDOR_AGENCIA:
        //        case TIPO_EQUIPO.SERVICIO_NUBE:
        //            $(".parametro-view").addClass("ignore");
        //            $(".parametro-view").hide();
        //            break;
        //        case TIPO_EQUIPO.STORAGE:
        //        case TIPO_EQUIPO.APPLIANCE:
        //            $(".parametro-view").show();
        //            $(".parametro-view").removeClass("ignore");
        //            break;
        //    }
        //} else {
        //    $(".parametro-view").show();
        //    $(".parametro-view").removeClass("ignore");
        //}
    } else {
        if (tipoEquipoId === TIPO_EQUIPO.STORAGE || tipoEquipoId === TIPO_EQUIPO.APPLIANCE) {
            $(".parametro-view").show();
            $(".parametro-view").removeClass("ignore");
        } else {
            $(".parametro-view").addClass("ignore");
            $(".parametro-view").hide();
        }
    }
}

function obtenerSubdominiosByDominioId(DominioId, $ddl) {
    var Id = DominioId;

    $.ajax({
        url: URL_API + `/Subdominio/ListarSubdominiosByDominioId?Id=${Id}`,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject;
                    SetItems(data, $ddl, TEXTO_SELECCIONE);
                }
            }
        },
        complete: function () {
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function initFecha() {
    $("#dpFecLanTec-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: 'DD/MM/YYYY'
    });
    $("#dpFecExtTec-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#dpFecSopTec-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#dpFecIntTec-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
}

function revertirSolicitud(id) {
    var data = {};
    data.EquipoId = id;

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás seguro que deseas revertir el cambio de tipo de equipo del Appliance seleccionado?. Se puede generar una solicitud nuevamente.",
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
            if (result !== null && result) {                
                $.ajax({
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    url: `${URL_API_VISTA_APPLIANCE}/Revertir`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    data: JSON.stringify(data),
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            toastr.success("Se revertió el equipo correctamente", TITULO_MENSAJE);
                            listarEquipos();
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        var error = JSON.parse(xhr.responseText);
                    }
                });
            }
        }
    });
}