var $table = $("#tblEquipo");
var $tableEBS = $("#tblEBS");
var $tblEquiposDesactivados = $("#tblEquiposDes");
var URL_API_VISTA = URL_API + "/Equipo";
var URL_API_FILE = URL_API + "/File";
var DATA_EXPORTAR = {};
var DATA_EXPORTAR_EQ_DESACTIVOS = {};
var TITULO_MENSAJE = "Gestión de appliance";
var MENSAJE_CARGA_MASIVA = "";
var TITULO_CARGA_MASIVA = "Resumen de importación de equipos";
var FLAG_ACTIVO_EQUIPO = 0;
var DOMINIO_RED_ACTUAL = null;
var PARAMETRO_ACTIVAR_EQUIPO = false;
var SELECCIONAR_APLICACION = false;
var MENSAJE_EXISTE_EQUIPO = "Ingrese un nuevo nombre para el Appliance";
const TIPO_EQUIPO = { SERVIDOR: 1, SERVIDOR_AGENCIA: 2, PC: 3, SERVICIO_NUBE: 4, STORAGE: 5, APPLIANCE: 6 };
const EQUIPOS_ARR_FILTRO = [TIPO_EQUIPO.APPLIANCE];
const EQUIPOS_ARR_BUSQUEDA = [TIPO_EQUIPO.APPLIANCE];
const TIPO_ACTIVO_EQUIPO = { FISICO: 7, VIRTUAL: 8, PAAS: 9, IAAS: 10, SAAS: 11 };
const FECHA_CALCULO = { EXTENDIDA: "2", SOPORTE: "3", INTERNA: "4" };


$(function () {    

    cargarCombos();
    initFecha();
    //FormatoCheckBox($("#divFlagExCal"), 'cbFlagExCal');
    FormatoCheckBox($("#divFlagFinSoporteFabrica"), 'cbFechaSoporteFabrica');
   // $("#cbFlagExCal").change(FlagExclusion_Change);
    $("#cbFechaSoporteFabrica").change(FlagSoporteFabrica_Change);
    //$("#ddlDominio").on('change', function () { obtenerSubdominiosByDominioId(this.value, $("#ddlSubdominio")); });
    $("#ddlTipoActivo").change(ddlTipoActivo_Change);
    //$("#ddlFechaCalculo").change(ddlFechaCalculo_Change);
    $("#btnExportarInfo").click(ExportarInfo);
    $("#btnMdSearchEBS").click(btnMdSearchEBS_Click);
    $("#btnBuscarESB").click(btnBuscarESB_Click);

    validarFormOS();
    validarAddOrEditForm();
    validarAddOrEditFormSO();
    validarFormImportar();

    listarEquipos();
    InitAutocompletarBuilder($("#txtFiltroNombreEq"), null, ".nombreEquipoContainer", "/Equipo/GetEquipoByFiltroAndTipo?filtro={0}&tipo=0");
    InitAutocompletarBuilderLocalApp($("#txtAplicacion"), $("#hdAplicacionId"), ".containerAplicacion", "/applicationportfolio/application/filter?filtro={0}&codigoAPT=");
    setDefaultHd($("#txtAplicacion"), $("#hdAplicacionId"));
    //InitAutocompletarBuilder($("#txtFiltroNombreEq"), null, ".nombreEquipoContainer", "/Equipo/GetEquipoByFiltroAndTipo?filtro={0}&tipo=" + TIPO_EQUIPO.APPLIANCE);

    InitUpload($('#txtArchivo'), 'inputArchivo');

    $("#cbTipoEquipo").val("6");
    $("#cbTipoEquipo").attr("disabled", "disabled");

    $("#cbDominioRed").val("3");
    $("#cbDominioRed").attr("disabled", "disabled");

    $("#cbAmbiente").val("1");
    $("#cbAmbiente").attr("disabled", "disabled");

    
});

function ddlFechaCalculo_Change() {
    var combo = $(this).val();
    //if (combo !== "-1") {
    //    LimpiarValidateErrores($("#formAddOrEdit"));
    //    switch (combo) {
    //        case FECHA_CALCULO.EXTENDIDA:
    //            $(".fechaClass").addClass("ignore");
    //            $(".fechaExt").removeClass("ignore");
    //            break;
    //        case FECHA_CALCULO.SOPORTE:
    //            $(".fechaClass").addClass("ignore");
    //            $(".fechaSop").removeClass("ignore");
    //            break;
    //        case FECHA_CALCULO.INTERNA:
    //            $(".fechaClass").addClass("ignore");
    //            $(".fechaInt").removeClass("ignore");
    //            break;
    //    }
    //}
}

function ddlTipoActivo_Change() {
    $("#txtSerial").removeAttr("disabled");
    $("#txtModelo").removeAttr("disabled");
    $("#ddlSede").removeAttr("disabled");
    $("#txtSala").removeAttr("disabled");
    $("#txtRack").removeAttr("disabled");
    $("#txtUbicacion").removeAttr("disabled");

    let ddlValor = parseInt($(this).val());
    if (ddlValor === TIPO_ACTIVO_EQUIPO.IAAS || ddlValor === TIPO_ACTIVO_EQUIPO.PAAS || ddlValor === TIPO_ACTIVO_EQUIPO.SAAS)
    {
        $("#txtSerial").attr("disabled", "disabled");
        $("#txtModelo").attr("disabled", "disabled");

        $("#ddlSede").attr("disabled", "disabled");
        $("#txtSala").attr("disabled", "disabled");
        $("#txtRack").attr("disabled", "disabled");
        $("#txtUbicacion").attr("disabled", "disabled");

        $(".divUrl").show();
    }
    else {
        $("#txtUrlNube").val("");
        $(".divUrl").hide();
    }

    if (ddlValor === TIPO_ACTIVO_EQUIPO.VIRTUAL)
    {
        $("#txtSerial").attr("disabled", "disabled");        

        $("#ddlSede").attr("disabled", "disabled");
        $("#txtSala").attr("disabled", "disabled");
        $("#txtRack").attr("disabled", "disabled");
        $("#txtUbicacion").attr("disabled", "disabled");
    }

}

function FlagExclusion_Change() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    var flag = $(this).prop("checked");
    if (flag) {
        $(".divExclusion").show();
    }
    else {
        $(".divExclusion").hide();
    }
}

function FlagSoporteFabrica_Change() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    let cbValor = $(this).prop("checked");
    if (cbValor) {
        $(".divFechaFabrica").removeClass("bloq-element");
        $(".divFechaFabrica").removeClass("ignore");
    }
    else {
        $(".divFechaFabrica").addClass("ignore");
        $(".divFechaFabrica").addClass("bloq-element");
    }
}

function limpiarAddOrEditModal() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    //$("#cbFlagExCal").prop('checked', false);
    //$("#cbFlagExCal").bootstrapToggle('off');
    $("#cbFechaSoporteFabrica").prop('checked', false);
    $("#cbFechaSoporteFabrica").bootstrapToggle('off');
    //Nuevos campos
    $("#txtSB, #dpFecLanTec, #dpFecSopTec, #dpFechaSoporteFabrica, #dpFecExtTec, #dpFecIntTec, #txtComentarios ,#txtVentanaMantenimiento").val("");
    $("#ddlSubdominio, #ddlDimension").val("-1");
    $("#ddlBackup, #ddlBackupFrecuencia, #ddlCona, #ddlSede, #ddlIntegracionGestor, #ddlCriticidad, #txtCyberSOC").val("-1");
    $("#txtSerial, #txtModelo, #txtVendor, #txtTecnologiaEquipo, #txtVersion, #txtHostname, #ddlArquitectoSeguridad, #ddlSoportePrimerNivel, #ddlProveedor").val("");
    $("#txtIP, #txtModelo, #txtVendor, #txtTecnologiaEquipo, #txtVersion, #txtHostname, #txtUrlNube").val("");
    $("#dpFechaAdquisicion, #dpFechaImplementacion, #dpFechaRenovacion, #dpVencimientoLicencia, #txtCantidadLicencia, #txtFormaLicenciamiento").val("");
    $("#txtCodigoInventario, #txtSala, #txtRack, #txtUbicacion").val("");
    $("#txtBackupDescripcion, #txtConectorSiem, #txtUmbralCpu, #txtUmbralMemoria, #txtUmbralDisco").val("");
    $("#txtAplicacion").val("");
    $("#hdAplicacionId").val("0");

    $("#txtSerial").removeAttr("disabled");
    $("#txtModelo").removeAttr("disabled");
    $("#ddlSede").removeAttr("disabled");
    $("#txtSala").removeAttr("disabled");
    $("#txtRack").removeAttr("disabled");
    $("#txtUbicacion").removeAttr("disabled");

    $("#txtEquipoDetalle").val("");
    $("#ddlEstadoIntegracionSIEM").val("-1");
    $("#ddlConaAvanzado").val("-1");
    $("#ddlEstadoAppliance").val("-1");

    $('#tabModulo a:first').tab('show');

    $("#txtArchivo").val("");
    $("#flArchivo").val("");
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
        url: URL_API_VISTA + "/GestionEquipos/Appliance/Listado",
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
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusEq").val());
            DATA_EXPORTAR.NombreEquipo = $.trim($("#txtFiltroNombreEq").val());
            //DATA_EXPORTAR.tipoEquipoId = $("#cbFilTipoEq").val();
            //DATA_EXPORTAR.desId = "-1";//$("#cbFilDes").val();
            //DATA_EXPORTAR.exCalculoId = "-1";//$("#cbFilExCal").val();
            //DATA_EXPORTAR.subsidiariaId = "-1";//$("#cbFilSubsidiaria").val();
            DATA_EXPORTAR.flagActivo = $("#ddlEstado").val();//FLAG_ACTIVO_EQUIPO;
            DATA_EXPORTAR.tipoEquipoIds = EQUIPOS_ARR_BUSQUEDA;
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
        }
    });
}

function editarEquipo(Id, TipoEquipoId) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#titleForm").html("Editar equipo");
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
                    $("#hdTipoEquipoId").val(TipoEquipoId);
                    $("#cbAmbiente").val(dataObject.AmbienteId);
                    //$("#cbFlagExCal").prop('checked', dataObject.FlagExcluirCalculo);
                    //$("#cbFlagExCal").bootstrapToggle(dataObject.FlagExcluirCalculo ? 'on' : 'off');
                    //$("#cbTipoExclusion").val($("#cbFlagExCal").prop('checked') ? dataObject.TipoExclusionId : "-1");
                    //$("#txtMotivoExclusion").val($("#cbFlagExCal").prop('checked') ? dataObject.MotivoExclusion : "");
                    $("#cbDominioRed").val(dataObject.DominioServidorId !== null ? dataObject.DominioServidorId : "-1");
                    DOMINIO_RED_ACTUAL = dataObject.DominioServidorId;
                    $("#hdFlagDominioRed").val(dataObject.FlagCambioDominioRed);

                    let dataESB = dataObject.EquipoSoftwareBase || null;
                    //CargarDatosEquipoSoftwareBase(dataESB);
                    $("#hdEquipoSoftwareBaseId").val(dataESB !== null ? dataESB.Id : "0");
                    if (dataESB !== null) {
                        $("#txtSB").val(dataESB.SoftwareBase || "");
                        //$("#dpFecLanTec").val(dataESB.FechaLanzamientoStr);
                        //$("#dpFecSopTec").val(dataESB.FechaFinSoporteStr);
                        //$("#dpFecExtTec").val(dataESB.FechaFinExtendidaStr);
                        //$("#dpFecIntTec").val(dataESB.FechaFinInternaStr);
                        $("#txtComentarios").val(dataESB.ComentariosFechaFin || "");
                        //$("#ddlDominio").val(dataESB.DominioId);
                        //$("#ddlDominio").trigger("change");
                        //$("#ddlSubdominio").val(dataESB.SubdominioId);
                        $("#ddlFechaCalculo").val(dataESB.FechaCalculoId || "-1");
                        //$("#ddlFechaCalculo").trigger("change");

                        //Tab Generales
                        $("#ddlTipoActivo").val(dataESB.TipoActivo || "-1");
                        $("#txtSerial").val(dataESB.Serial || "");
                        $("#txtModelo").val(dataESB.Modelo || "");
                        $("#txtVendor").val(dataESB.Vendor || "");
                        $("#txtTecnologiaEquipo").val(dataESB.Tecnologia || "");
                        $("#txtVersion").val(dataESB.Version || "");
                        $("#txtHostname").val(dataESB.Hostname || "");
                        $("#txtIP").val(dataESB.IP || "");
                        $("#ddlDimension").val(dataESB.Dimension || "-1");
                        $("#ddlArquitectoSeguridad").val(dataESB.ArquitectoSeguridad || "");
                        $("#ddlSoportePrimerNivel").val(dataESB.SoportePrimerNivel || "");
                        $("#ddlProveedor").val(dataESB.Proveedor || "");
                        $("#ddlCriticidad").val(dataESB.Criticidad || "-1");
                        $("#txtUrlNube").val(dataESB.UrlNube || "");
                        $("#ddlTipoActivo").trigger("change");
                        //Tab Vigencia
                        $("#dpFechaAdquisicion").val(dataESB.FechaAdquisicionStr);
                        $("#dpFechaImplementacion").val(dataESB.FechaImplementacionStr);
                        $("#dpFechaRenovacion").val(dataESB.FechaUltimaRenovacionStr);
                        $("#dpVencimientoLicencia").val(dataESB.VencimientoLicenciaStr);
                        //$("#txtCantidadLicencia").val(dataESB.CantidadLicencia);
                        $("#txtFormaLicenciamiento").val(dataESB.FormaLicenciamiento);

                        $("#dpFechaSoporteFabrica").val(dataESB.FechaFinSoporteStr);
                        let flagFechaFabrica = $.trim(dataESB.FechaFinSoporteStr) !== "";
                        $("#cbFechaSoporteFabrica").prop('checked', flagFechaFabrica);
                        $("#cbFechaSoporteFabrica").bootstrapToggle(flagFechaFabrica ? 'on' : 'off');

                        //Tab Inventario
                        $("#ddlSede").val(dataESB.Sede || "-1");
                        //$("#txtCodigoInventario").val(dataESB.CodigoInventario || "");
                        $("#txtCyberSOC").val(dataESB.CyberSOC || "-1");
                        $("#txtSala").val(dataESB.Sala || "");
                        $("#txtRack").val(dataESB.RACK || "");
                        $("#txtUbicacion").val(dataESB.Ubicacion || "");
                        //Tab Configuracion
                        $("#ddlBackup").val(dataESB.Backup || "-1");
                        $("#ddlBackupFrecuencia").val(dataESB.BackupFrecuencia || "-1");
                        $("#txtBackupDescripcion").val(dataESB.BackupDescripcion || "");
                        $("#ddlIntegracionGestor").val(dataESB.IntegracionGestorInteligencia || "-1");
                        $("#txtConectorSiem").val(dataESB.ConectorSIEM || "");
                        $("#ddlCona").val(dataESB.CONA || "-1");
                        $("#txtUmbralCpu").val(dataESB.UmbralCPU || "");
                        $("#txtUmbralMemoria").val(dataESB.UmbralMemoria || "");
                        $("#txtUmbralDisco").val(dataESB.UmbralDisco || "");
                        $("#txtVentanaMantenimiento").val(dataESB.Ventana || "");

                        //nuevos campos
                        $("#txtEquipoDetalle").val(dataESB.EquipoDetalle || "");
                        $("#ddlEstadoIntegracionSIEM").val(dataESB.EstadoIntegracionSIEM || "-1");
                        $("#ddlConaAvanzado").val(dataESB.CONAAvanzado || "-1");
                        $("#ddlEstadoAppliance").val(dataESB.EstadoAppliance || "-1");

                        $("#txtAplicacion").val(dataESB.CodigoAPT);
                        $("#txtAplicacion").attr("disabled", "disabled");

                        $("#txtArchivo").val(dataESB.NombreArchivo);
                        
                        if (dataESB.TieneArchivo)
                            $("#btnDescargar").show();
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
    //let btnAsignarSO = `<a href="javascript:asignarSO(${row.Id})" title="asignar SO">[Asignar SO]</a>`;
    if (row.EquipoSoftwareBase.Activo && row.EquipoSoftwareBase.FlagAprobado == true) {
        btnEditarEquipo = `<a href="javascript:editarEquipo(${row.Id}, ${row.TipoEquipoId})" title="Editar">${value}</a>`;
    } else {
        btnEditarEquipo = value;
    }

    return btnEditarEquipo;
}

function opciones(value, row, index) {
    let style_color = row.EquipoSoftwareBase.Activo ? 'iconoVerde ' : "iconoRojo "; //Dependen de otro valor
    let type_icon = row.EquipoSoftwareBase.Activo ? "check" : "unchecked"; //Dependen de otro valor

    let btnAsignarSO = "";//`<a href="javascript:irAsignarSO(${row.Id})" title="asignar SO">[Asignar SO]</a>`;
    let btnDesactivar = `<a href="javascript:activarDesactivarTSI(${row.Id}, ${row.EquipoSoftwareBase.Activo})" title="Desactivar equipo"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    let btnActivar = `<a href="javascript:activarDesactivarTSI(${row.Id}, ${row.EquipoSoftwareBase.Activo})" title="Activar equipo"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    //let exportar = `<a href="javascript:ExportarInfoDetalle(${row.Id},${index})" title="exportar">[ <span class="icon icon-external-link"></span>Exportar]</a>`
    
    if (row.EquipoSoftwareBase.Activo && row.EquipoSoftwareBase.FlagAprobado == true) {
        //if (row.FlagTemporal) {
            return btnAsignarSO.concat("&nbsp;&nbsp;", btnDesactivar);
        //}
    } else {
        //if (!row.FlagTemporal) {
        //    return btnActivar;
        //}
        return ""; //Para los dos tipos de descubrimiento
    }

    //return "";
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

function activarDesactivarTSI(EquipoId, Activo) {
    let men = "desactivar"
    let men2 = "desactivó"
    if (Activo == false) {
        men = "activar"
        men2 = "activó"
    }

    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás seguro que deseas " + men +" el activo TSI seleccionado?.",
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
                    url: `${URL_API_VISTA}/GestionEquipos/CambiarEstadoEquipoSoftwareBase?Id=${EquipoId}&Activo=${Activo}`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                let mensajeSuccess = "Se " + men2 + " el equipo correctamente"
                                toastr.success(mensajeSuccess, TITULO_MENSAJE);
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
                    url: `${URL_API_VISTA}/GestionEquipos/CambiarEstado?Id=${EquipoId}&Activo=${Activo}&Motivo=${Motivo}`,
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

function irAsignarSO(Id) {
    LimpiarValidateErrores($("#formAsigSO"));
    //$("#cbSO").val(-1);
    $("#hdEquipoId").val(Id);
    $("#MdAsigSO").modal(opcionesModal);

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
        }
    });
}

function guardarAsignarSO() {
    if ($("#formAsigSO").valid()) {
        $("#btnRegAsigSO").button("loading");

        var et = {};
        et.Id = parseInt($("#hdEquipoTecnologiaId").val());
        et.EquipoId = parseInt($("#hdEquipoId").val());
        et.TecnologiaId = parseInt($("#cbSO").val());

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
                $("#MdAsigSO").modal('hide');
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
                    //SetItems(dataObject.TipoEquipo.filter(x => EQUIPOS_ARR_FILTRO.includes(parseInt(x.Id))), $("#cbFilTipoEq"), TEXTO_TODOS);
                    SetItems(dataObject.TipoEquipo.filter(x => EQUIPOS_ARR_FILTRO.includes(parseInt(x.Id))), $("#cbTipoEquipoFil"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoEquipo.filter(x => EQUIPOS_ARR_FILTRO.includes(parseInt(x.Id))), $("#cbTipoEquipo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.SO, $("#cbSO"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.SO, $("#cbSOAdd"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoExclusion, $("#cbTipoExclusion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.DominioRed, $("#cbDominioRed"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.CaracteristicaEquipo, $("#cbCaracteristica"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EstadoEquipo, $("#ddlEstado"), TEXTO_TODOS);
                    //SetItems(dataObject.Dominio, $("#ddlDominio"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.FechaCalculo, $("#ddlFechaCalculo"), TEXTO_SELECCIONE);
                    $("#ddlFechaCalculo").val(3);                    

                    $("#ddlFechaCalculo").attr("disabled","disabled");
                    PARAMETRO_ACTIVAR_EQUIPO = dataObject.ParametroEquipo;

                    //Combos nuevos
                    //SetItems(dataObject.Item, $("#ddlArquitectoSeguridad"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.Item, $("#ddlSoportePrimerNivel"), TEXTO_SELECCIONE);
                    SetItems(dataObject.CyberSoc, $("#txtCyberSOC"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoActivo, $("#ddlTipoActivo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Dimension, $("#ddlDimension"), TEXTO_SELECCIONE);

                    SetItems(dataObject.Backup, $("#ddlBackup"), TEXTO_SELECCIONE);
                    SetItems(dataObject.BackupFrecuencia, $("#ddlBackupFrecuencia"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Cona, $("#ddlCona"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Sede, $("#ddlSede"), TEXTO_SELECCIONE);
                    SetItems(dataObject.IntegracionGestor, $("#ddlIntegracionGestor"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Criticidad, $("#ddlCriticidad"), TEXTO_SELECCIONE);

                    SetItems(dataObject.EstadoIntegracionSIEM, $("#ddlEstadoIntegracionSIEM"), TEXTO_SELECCIONE);
                    SetItems(dataObject.ConaAvanzado, $("#ddlConaAvanzado"), TEXTO_SELECCIONE);
                    SetItems(dataObject.EstadoAppliance, $("#ddlEstadoAppliance"), TEXTO_SELECCIONE);

                    
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
    let idEquipo = $("#hdEquipoSoftwareBaseId").val();
    if ($("#txtAplicacion").val() === "" && idEquipo === 0)
        SELECCIONAR_APLICACION = false;

    if ($("#hdAplicacionId").val() === "0" && idEquipo === 0)
        SELECCIONAR_APLICACION = false;

    if (SELECCIONAR_APLICACION == false && idEquipo === 0) {
        toastr.error("Tienes que seleccionar una aplicación", TITULO_MENSAJE);
        $("#txtAplicacion").focus();
        return false;
    }

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
    equipo.TipoEquipoId = 6; //Tipo appliance
    equipo.AmbienteId = $("#cbAmbiente").val();
    equipo.DominioServidorId = $("#cbDominioRed").val();
    equipo.CaracteristicaEquipo = 1;
    equipo.FlagExcluirCalculo = false;
    //equipo.FlagExcluirCalculo = $("#cbFlagExCal").prop("checked");
    //equipo.TipoExclusionId = $("#cbFlagExCal").prop("checked") ? $("#cbTipoExclusion").val() : "-1";
    //equipo.MotivoExclusion = $("#cbFlagExCal").prop("checked") ? $("#txtMotivoExclusion").val() : "";
    equipo.TecnologiaId = 0;
    equipo.NombreEquipo = $("#txtNomEquipo").val();

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
                    let EquipoId = dataObject;
                    let TipoEquipoId = parseInt($("#hdTipoEquipoId").val());
                    //let TipoEquipoId = parseInt($("#cbTipoEquipo").val());
                    toastr.success("Registrado correctamente", TITULO_MENSAJE);
                    //if (PARAMETRO_ACTIVAR_EQUIPO || (TipoEquipoId === TIPO_EQUIPO.STORAGE || TipoEquipoId === TIPO_EQUIPO.APPLIANCE))
                    GuardarEquipoSoftwareBase(EquipoId);

                    listarEquipos();
                }
            }
        },
        complete: function () {
            $("#btnRegEq").button("reset");            
        },
        error: function (result) {
            alert(result.responseText);
        }
    });
}

function validarAddOrEditForm() {
    $.validator.addMethod("existeEquipo", function (value, element, param) {
        
        if ($.trim(value) !== "" && $.trim(value).length > 3) {
            let estado = 0;
            estado = ExisteEquipo();
            $("#hIdEstado").val(estado);
            return estado === 0;
        }
        return estado;
    });

    $.validator.addMethod("requiredArchivo", function (value, element) {
        let idEquipo = $("#hdEquipoSoftwareBaseId").val();        
        if (idEquipo > 0)
            return true;
        else
            return $.trim(value) !== "";
    });

    $.validator.addMethod("requiredOnlyNew", function (value, element) {
        let equipoId = $("#hdEquipoId").val() === "" ? 0 : parseInt($("#hdEquipoId").val());
        if (equipoId === 0) {
            return $.trim(value) !== "";
        }
        return true;
    });

    $.validator.addMethod("requiredApplication", function (value, element) {
        if (SELECCIONAR_APLICACION === false)
            return false;

        let equipoId = $("#hdAplicacionId").val() === "0" ? "" : $("#hdAplicacionId").val();
        if (equipoId === "") {
            return $.trim(value) !== "";
        }
        return true;
    });

    $.validator.addMethod("requiredOnlyEdit", function (value, element) {
        let equipoId = $("#hdEquipoId").val() === "" ? 0 : parseInt($("#hdEquipoId").val());
        if (equipoId !== 0) {
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
            flArchivo: {
                requiredArchivo: true
            },
            txtAplicacion: {
                requiredSinEspacios: true,
                requiredApplication: true
            },
            txtNomEquipo: {
                requiredSinEspacios: true,
                existeEquipo: true
            },
            cbTipoEquipo: {
                requiredSelect: true
            },
            cbDominioRed: {
                requiredSelect: true
            },
            //cbCaracteristica: {
            //    requiredSelect: true
            //},
            //cbSOAdd: {
            //    requiredSelect: true
            //},
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
            //dpFecLanTec: {
            //    requiredSinEspacios: true
            //},
            //dpFecExtTec: {
            //    requiredSinEspacios: true
            //},
            //dpFecSopTec: {
            //    requiredSinEspacios: true
            //},
            //dpFecIntTec: {
            //    requiredSinEspacios: true
            //},
            //ddlFechaCalculo: {
            //    requiredSelect: true
            //},
            ddlTipoActivo: {
                requiredSelect: true
            },
            txtSerial: {
                requiredSinEspacios: true
            },
            txtModelo: {
                requiredSinEspacios: true
            },
            txtVendor: {
                requiredSinEspacios: true
            },
            //txtTecnologiaEquipo: {
            //    requiredSinEspacios: true
            //},
            txtVersion: {
                requiredSinEspacios: true
            },
            txtHostname: {
                requiredSinEspacios: true
            },
            txtIP: {
                requiredSinEspacios: true
            },
            ddlArquitectoSeguridad: {
                requiredSinEspacios: true
            },
            ddlSoportePrimerNivel: {
                requiredSinEspacios: true
            },
            ddlProveedor: {
                requiredSinEspacios: true
            },
            //dpFechaAdquisicion: {
            //    requiredOnlyNew: true
            //},
            //dpFechaRenovacion: {
            //    requiredOnlyNew: true
            //},
            dpVencimientoLicencia: {
                requiredOnlyEdit: true,
                requiredSinEspacios: true
            },
            //txtCantidadLicencia: {
            //    requiredOnlyEdit: true
            //},
            txtCyberSOC: {
                requiredSelect: true
            },
            ddlSede: {
                requiredSelect: true
            },
            txtSala: {
                requiredSinEspacios: true
            },
            txtRack: {
                requiredSinEspacios: true
            },
            txtUbicacion: {
                requiredSinEspacios: true
            },
            ddlCona: {
                requiredSelect: true
            },
            ddlIntegracionGestor: {
                requiredSelect: true
            },
            txtConectorSiem: {
                requiredSinEspacios: true
            }
        },
        messages: {
            flArchivo: {
                requiredArchivo: String.Format("Debes seleccionar {0}.", "un archivo")
            },
            txtAplicacion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el código de aplicación"),
                requiredApplication: String.Format("Debes ingresar {0}.", "el código de aplicación"),
            },
            txtNomEquipo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre"),
                existeEquipo: MENSAJE_EXISTE_EQUIPO
            },
            cbTipoEquipo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo de equipo")
            },
            cbDominioRed: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el dominio")
            },
            //cbCaracteristica: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "la característica")
            //},
            //cbSOAdd: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "el sistema operativo")
            //},
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
            //dpFecLanTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha de lanzamiento")
            //},
            //dpFecExtTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha fin extendida")
            //},
            //dpFecSopTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha fin soporte")
            //},
            //dpFecIntTec: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la fecha fin interna")
            //},
            //ddlFechaCalculo: {
            //    requiredSelect: String.Format("Debes seleccionar {0}.", "la fecha de cálculo")
            //},
            ddlTipoActivo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo activo")
            },
            txtSerial: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el serial")
            },
            txtModelo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el modelo")
            },
            txtVendor: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el vendor")
            },
            //txtTecnologiaEquipo: {
            //    requiredSinEspacios: String.Format("Debes ingresar {0}.", "la tecnología")
            //},
            txtVersion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la versión")
            },
            txtHostname: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el hostname")
            },
            txtIP: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la IP")
            },
            ddlArquitectoSeguridad: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el arquitecto")
            },
            ddlSoportePrimerNivel: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el soporte")
            },
            ddlProveedor: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el proveedor")
            },
            //dpFechaAdquisicion: {
            //    requiredOnlyNew: String.Format("Debes ingresar {0}.", "la fecha adquisición")
            //},
            //dpFechaRenovacion: {
            //    requiredOnlyNew: String.Format("Debes ingresar {0}.", "la fecha última renovación")
            //},
            dpVencimientoLicencia: {
                requiredOnlyEdit: String.Format("Debes ingresar {0}.", "el vencimiento"),
                requiredSinEspacios: "Debes ingresar el vencimiento"
            },
            //txtCantidadLicencia: {
            //    requiredOnlyEdit: String.Format("Debes ingresar {0}.", "la cantidad")
            //},
            txtCyberSOC: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el CyberSOC")
            },
            ddlSede: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "la sede")
            },
            txtSala: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la sala")
            },
            txtRack: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el rack")
            },
            txtUbicacion: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la ubicación")
            },
            ddlCona: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "la cona")
            },
            ddlIntegracionGestor: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "la integración")
            },
            txtConectorSiem: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el conector siem")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "dpFecLanTec" || element.attr('name') === "dpFecExtTec"
                || element.attr('name') === "dpFecSopTec" || element.attr('name') === "dpFecIntTec"
                || element.attr('name') === "dpFechaAdquisicion" || element.attr('name') === "dpFechaRenovacion"
                || element.attr('name') === "dpVencimientoLicencia") {
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
            }
        },
        messages: {
            cbSO: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un sistema operativo")
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

    DATA_EXPORTAR.tipoEquipoIds = EQUIPOS_ARR_BUSQUEDA.join(";");

    let url = `${URL_API_VISTA}/GestionEquipos/Appliance/Exportar?filtro=${DATA_EXPORTAR.nombre}&filtroEquipo=${DATA_EXPORTAR.NombreEquipo}&tipoEquipoId=${DATA_EXPORTAR.tipoEquipoId}&flagActivo=${DATA_EXPORTAR.flagActivo}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}&tipoEquipoIds=${DATA_EXPORTAR.tipoEquipoIds}`;
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
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar("Gestión de equipos");
        return false;
    }
    let url = `${URL_API_VISTA}/GestionEquipos/ExportarDetalle?filtro=${DATA_EXPORTAR.nombre}&tipoEquipoId=${DATA_EXPORTAR.tipoEquipoId}&desId=${DATA_EXPORTAR.desId}&exCalculoId=${DATA_EXPORTAR.exCalculoId}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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

function validarFormImportar() {    
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
                requiredExcel: true
            }
        },
        messages: {
            cbTipoEquipoFil: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "un tipo de equipo")
            },
            flArchivo: {                
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
            data: formData,
            contentType: false,
            processData: false,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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
            data: formData,
            contentType: false,
            processData: false,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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
    let url = `${URL_API_VISTA}/GestionEquipos/Appliance/Exportar?filtro=${DATA_EXPORTAR_EQ_DESACTIVOS.nombre}&flagActivo=${DATA_EXPORTAR_EQ_DESACTIVOS.flagActivo}`;
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
    $("#hdTipoEquipoId").val("6");

    $(".onlyAdd").show();
    $(".onlyAdd").removeClass("ignore");
    setViewModalEquipo(PARAMETRO_ACTIVAR_EQUIPO, TIPO_EQUIPO.APPLIANCE);

    $("#txtNomEquipo").val("");
    $("#cbCaracteristica").val("-1");
    $(".divUrl").hide();

    irAddOrEditModal(true);
    $("#txtNomEquipo").removeAttr("disabled");
    $("#txtAplicacion").removeAttr("disabled");
}

function rowStyle(row, index) {
    var classes = [
        'bg-blue',
        'bg-rojo',
        'bg-orange',
        'bg-yellow',
        'bg-red'
    ];
    if (row.EquipoSoftwareBase.Activo === false) {
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
    debugger;
    let idEquipo = $("#hdEquipoSoftwareBaseId").val(); 
    let hostname = $.trim($("#txtNomEquipo").val());

    let data = {
        Id: $("#hdEquipoSoftwareBaseId").val(),
        EquipoId: Id,
        SubdominioId: 31, //$("#ddlSubdominio").val(),
        SoftwareBase: $.trim($("#txtSB").val()),
        FechaLanzamiento: null,//$.trim($("#dpFecLanTec").val()) !== "" ? dateFromString($("#dpFecLanTec").val()) : null,
        //FechaFinSoporte: $.trim($("#dpFecSopTec").val()) !== "" ? dateFromString($("#dpFecSopTec").val()) : null,
        //FechaFinSoporte: $.trim($("#dpFechaSoporteFabrica").val()) !== "" ? dateFromString($("#dpFechaSoporteFabrica").val()) : null,
        FechaFinSoporte: $("#cbFechaSoporteFabrica").prop("checked") ? dateFromString($("#dpFechaSoporteFabrica").val()) : null,
        FechaFinExtendida: null,//$.trim($("#dpFecExtTec").val()) !== "" ? dateFromString($("#dpFecExtTec").val()) : null,
        FechaFinInterna: null,//$.trim($("#dpFecIntTec").val()) !== "" ? dateFromString($("#dpFecIntTec").val()) : null,
        ComentariosFechaFin: $.trim($("#txtComentarios").val()),
        FechaCalculoId: $("#ddlFechaCalculo").val() !== "-1" ? $("#ddlFechaCalculo").val() : null,
        //Tab Generales
        TipoActivo: $("#ddlTipoActivo").val() !== "-1" ? $("#ddlTipoActivo").val() : null,
        Serial: $.trim($("#txtSerial").val()),
        Modelo: $.trim($("#txtModelo").val()),
        Vendor: $.trim($("#txtVendor").val()),
        Tecnologia: $.trim($("#txtTecnologiaEquipo").val()),
        Version: $.trim($("#txtVersion").val()),
        Hostname: hostname,
        IP: $.trim($("#txtIP").val()),
        Dimension: $("#ddlDimension").val() !== "-1" ? $("#ddlDimension").val() : null,
        ArquitectoSeguridad: $("#ddlArquitectoSeguridad").val(),
        SoportePrimerNivel: $("#ddlSoportePrimerNivel").val(),
        Proveedor: $("#ddlProveedor").val(),
        Criticidad: $("#ddlCriticidad").val() !== "-1" ? $("#ddlCriticidad").val() : null,
        UrlNube: $.trim($("#txtUrlNube").val()),
        //Tab Vigencia
        FechaAdquisicion: $.trim($("#dpFechaAdquisicion").val()) !== "" ? dateFromString($("#dpFechaAdquisicion").val()) : null,
        FechaImplementacion: $.trim($("#dpFechaImplementacion").val()) !== "" ? dateFromString($("#dpFechaImplementacion").val()) : null,
        FechaUltimaRenovacion: $.trim($("#dpFechaRenovacion").val()) !== "" ? dateFromString($("#dpFechaRenovacion").val()) : null,
        VencimientoLicencia: $.trim($("#dpVencimientoLicencia").val()) !== "" ? dateFromString($("#dpVencimientoLicencia").val()) : null,
        //CantidadLicencia: $.trim($("#txtCantidadLicencia").val()),
        CantidadLicencia: 0,
        FormaLicenciamiento: $.trim($("#txtFormaLicenciamiento").val()),
        //Tab Inventario
        //CodigoInventario: $.trim($("#txtCodigoInventario").val()),
        CodigoInventario: "",
        CyberSOC: $("#txtCyberSOC").val() !== "-1" ? $("#txtCyberSOC").val() : null,
        Sede: $("#ddlSede").val() !== "-1" ? $("#ddlSede").val() : null,
        Sala: $.trim($("#txtSala").val()),
        RACK: $.trim($("#txtRack").val()),
        Ubicacion: $.trim($("#txtUbicacion").val()),
        //Tab Configuracion
        Backup: $("#ddlBackup").val() !== "-1" ? $("#ddlBackup").val() : null,
        BackupFrecuencia: $("#ddlBackupFrecuencia").val() !== "-1" ? $("#ddlBackupFrecuencia").val() : null,
        BackupDescripcion: $.trim($("#txtBackupDescripcion").val()),
        IntegracionGestorInteligencia: $("#ddlIntegracionGestor").val() !== "-1" ? $("#ddlIntegracionGestor").val() : null,
        ConectorSIEM: $.trim($("#txtConectorSiem").val()),
        CONA: $("#ddlCona").val() !== "-1" ? $("#ddlCona").val() : null,
        UmbralCPU: $.trim($("#txtUmbralCpu").val()),
        UmbralMemoria: $.trim($("#txtUmbralMemoria").val()),
        UmbralDisco: $.trim($("#txtUmbralDisco").val()),
        Ventana: $.trim($("#txtVentanaMantenimiento").val()),
        //nuevos campos
        EquipoDetalle: $.trim($("#txtEquipoDetalle").val()),
        EstadoIntegracionSIEM: $("#ddlEstadoIntegracionSIEM").val() !== "-1" ? $("#ddlEstadoIntegracionSIEM").val() : null,
        CONAAvanzado: $("#ddlConaAvanzado").val() !== "-1" ? $("#ddlConaAvanzado").val() : null,
        EstadoAppliance: $("#ddlEstadoAppliance").val() !== "-1" ? $("#ddlEstadoAppliance").val() : null,
        FlagSeguridad: true,
        //asociados a los appliances
        CodigoAPT: $("#hdAplicacionId").val() !== "0" ? $("#hdAplicacionId").val() : $("#txtAplicacion").val(),
        //nombre de equipo en equipo solicitud 
        NombreEquipo: $("#txtNomEquipo").val()
    };

    debugger;
    console.log(JSON.stringify(data));

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
                    UploadConstancia($("#flArchivo"), Id);
                    if (idEquipo === 0)
                        toastr.info("Se agregó el Activo TSI/Appliance y se creó una solicitud de aprobación; mientras la solicitud no se apruebe el Activo TSI/Appliance no podrá gestionarse.", "Site de tecnología y obsolescencia");
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
        //if (tipoEquipoId === TIPO_EQUIPO.STORAGE || tipoEquipoId === TIPO_EQUIPO.APPLIANCE) {
            $(".parametro-view").show();
            $(".parametro-view").removeClass("ignore");
        //} else {
        //    $(".parametro-view").addClass("ignore");
        //    $(".parametro-view").hide();
        //}
    }
}

function obtenerSubdominiosByDominioId(DominioId, $ddl) {
    var Id = DominioId;

    $.ajax({
        url: URL_API + `/Subdominio/ListarSubdominiosByDominioId?Id=${Id}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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

    $("#dpFechaAdquisicion-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#dpFechaImplementacion-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#dpFechaFechaRenovacion-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
    $("#dpVencimientoLicencia-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });

    $("#dpFechaSoporteFabrica-btn").datetimepicker({
        locale: 'es',
        useCurrent: false,
        format: "DD/MM/YYYY"
    });
}

function ExisteEquipo() {
    let estado = true;
    let clave = encodeURIComponent($("#txtNomEquipo").val());    

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GestionEquipos/Appliance/ExisteEquipo?clave=${clave}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    estado = dataObject;
                    if (estado === 1)
                        toastr.warning("El appliance se encuentra registrado en el catálogo pero se encuentra inactivo", "Gestión de Appliances");                        
                    else if (estado === 2)
                        toastr.warning("El appliance se encuentra registrado", "Gestión de Appliances");
                    else if (estado === 3)
                        toastr.warning("El servidor ya existe, registra una solicitud de cambio de equipo para continuar con el proceso", "Gestión de Appliances");
                    else if (estado === 4)
                        toastr.warning("El servidor ya existe pero se encuentra inactivo, no puedes crear el appliance", "Gestión de Appliances");                        
                    else if (estado === 5)
                        toastr.warning("El equipo ya existe en el catálogo", "Gestión de Appliances");                        
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

//Indicadores
function indicadorDosFormatter(value, row, index) {
    var html = "";
    if (row.EstadoIndicador2 === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.EstadoIndicador2 === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function indicadorUnoFormatter(value, row, index) {
    var html = "";
    if (row.EstadoIndicador1 === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.EstadoIndicador1 === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function estadoActualFormatter(value, row, index) {
    var html = "";
    if (row.EstadoActual === 1) { //VERDE
        html = '<button type="button" class="btn btn-success btn-circle"></button>';
    } else if (row.EstadoActual === -1) { //ROJO
        html = '<button type="button" class="btn btn-danger btn-circle"></button>';
    }
    else {
        html = '<button type="button" class="btn btn-warning btn-circle"></button>';
    }
    return html;
}

function limpiarMdSearchEBS() {
    $("#txtSearchESBNombre").val('');
    $tableEBS.bootstrapTable('destroy');
    $tableEBS.bootstrapTable();
}

function btnMdSearchEBS_Click(e) {
    e.preventDefault();
    limpiarMdSearchEBS();
    $("#MdSearchESB").modal('show');
}

function btnBuscarESB_Click(e) {
    e.preventDefault();
    buscarEBS();
}

function buscarEBS() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tableEBS.bootstrapTable('destroy');
    $tableEBS.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/BuscarEBS",
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
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtSearchESBNombre").val());
            //DATA_EXPORTAR.tipoEquipoId = $("#cbFilTipoEq").val();
            //DATA_EXPORTAR.desId = "-1";//$("#cbFilDes").val();
            //DATA_EXPORTAR.exCalculoId = "-1";//$("#cbFilExCal").val();
            //DATA_EXPORTAR.subsidiariaId = "-1";//$("#cbFilSubsidiaria").val();
            //DATA_EXPORTAR.flagActivo = $("#ddlEstado").val();//FLAG_ACTIVO_EQUIPO;
            //DATA_EXPORTAR.tipoEquipoIds = EQUIPOS_ARR_BUSQUEDA;
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
        }
    });
}

function opcionesEBS(value, row, index) {
    let btnActivar = `<a href="#" onclick="obtenerEBSClick(event, ${row.Id})" title="Seleccionar equipo"><i class="glyphicon glyphicon-check"></i></a>`;

    return btnActivar;
}

function obtenerEBSClick(e, id) {
    e.preventDefault();
    let resultado = ExisteEquipoAsociado(id);
    const arrResultado = resultado.split('|');
    let registradoSoftBase = arrResultado[0];
    let estadoSeguridad = arrResultado[1];
    if (registradoSoftBase === "1") {
        if (estadoSeguridad === "true") {
            MensajeGeneralAlert(TITULO_MENSAJE, "Este equipo ya tiene un registro asociado, no es posible asociar");
        } else {
            limpiarAddOrEditModal();
            obtenerESB(id);
            obtenerEBSConfigurado(id);
        }
    } else {
        limpiarAddOrEditModal();
        obtenerESB(id);
    }
}

function ExisteEquipoAsociado(_id) {
    let resultado = "";
    let id = _id;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GestionEquipos/Appliance/ExisteEquipoAsociado?id=${id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
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

function obtenerESB(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    //$("#titleForm").html("Editar equipo");
    //$(".onlyAdd").addClass("ignore");
    //$(".onlyAdd").hide();

    //setViewModalEquipo(PARAMETRO_ACTIVAR_EQUIPO, TipoEquipoId);

    $.ajax({
        url: URL_API_VISTA + "/ObtenerEBS/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    //irAddOrEditModal(true);
                    //$("#hdEquipoId").val(dataObject.Id);
                    //$("#hdTipoEquipoId").val(TipoEquipoId);
                    //$("#cbAmbiente").val(dataObject.AmbienteId);
                    //$("#cbFlagExCal").prop('checked', dataObject.FlagExcluirCalculo);
                    //$("#cbFlagExCal").bootstrapToggle(dataObject.FlagExcluirCalculo ? 'on' : 'off');
                    //$("#cbTipoExclusion").val($("#cbFlagExCal").prop('checked') ? dataObject.TipoExclusionId : "-1");
                    //$("#txtMotivoExclusion").val($("#cbFlagExCal").prop('checked') ? dataObject.MotivoExclusion : "");
                    //$("#cbDominioRed").val(dataObject.DominioServidorId !== null ? dataObject.DominioServidorId : "-1");
                    //DOMINIO_RED_ACTUAL = dataObject.DominioServidorId;
                    //$("#hdFlagDominioRed").val(dataObject.FlagCambioDominioRed);

                    //let dataESB = dataObject.EquipoSoftwareBase || null;
                    let dataESB = dataObject || null;
                    CargarDatosEquipoSoftwareBase(dataESB);
                }
                $("#MdSearchESB").modal('hide');
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function CargarDatosEquipoSoftwareBase(dataESB) {
    $("#hdEquipoId").val(dataESB !== null ? dataESB.Id : "0");
    if (dataESB !== null) {
        $("#txtNomEquipo").val(dataESB.Nombre || "");
        $("#txtNomEquipo").attr("disabled", "disabled");
        $("#txtAplicacion").attr("disabled", "disabled");
    }
}

function obtenerEBSConfigurado(Id) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/ObtenerESBConfigurado/" + Id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    $("#dpVencimientoLicencia").val(dataObject.VencimientoLicenciaStr);
                    
                }
                $("#MdSearchESB").modal('hide');
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function InitUpload($inputText, classInput, btnDownload = null, btnRemove = null) {
    var inputs = document.querySelectorAll(`.${classInput}`);
    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener('change', function (e) {
            var fileName = '';
            if (this.files && this.files.length > 1) {
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            } else {
                if (this.files && this.files.length == 1) {
                    if (btnDownload != null) btnDownload.show();
                    if (btnRemove != null) btnRemove.show();
                } else {
                    if (btnDownload != null) btnDownload.hide();
                    if (btnRemove != null) btnRemove.hide();
                }
                fileName = e.target.value.split('\\').pop();
            }

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

function UploadConstancia($fileInput, idsol) {

    let formData = new FormData();
    let ConformidadGST = $fileInput.get(0).files;

    formData.append("Constancia", ConformidadGST[0]);

    formData.append("EquipoId", idsol);


    $.ajax({
        url: URL_API + "/File/uploadNuevoActivoTSI2",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            //OpenCloseModal($("#modalEliminar"), false);
            irAddOrEditModal(false);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function DescargarArchivo() {
    DownloadFileSolicitud($("#hdEquipoId").val());
}

function DownloadFileSolicitud(id) {
    let url = `${URL_API_FILE}/downloadNuevoActivoTSI?id=${id}`;
    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/octetstream",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            let bytes = Base64ToBytes(data.data);
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

function InitAutocompletarBuilderLocalApp($searchBox, $IdBox, $container, urlController) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                let urlControllerWithParams = String.Format(urlController, request.term);

                if ($IdBox !== null) $IdBox.val("0");
                $.ajax({
                    url: URL_API + urlControllerWithParams,
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
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            if ($IdBox != null) $IdBox.val(ui.item.Id);
            SELECCIONAR_APLICACION = true;
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