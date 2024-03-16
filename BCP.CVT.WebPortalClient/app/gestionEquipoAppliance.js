var $table = $("#tblEquipo");
var $tableEBS = $("#tblEBS");
var $tblEquiposDesactivados = $("#tblEquiposDes");
var URL_API_VISTA = URL_API + "/Equipo";
var DATA_EXPORTAR = {};
var DATA_EXPORTAR_EQ_DESACTIVOS = {};
var TITULO_MENSAJE = "Gestión de appliance";
var MENSAJE_CARGA_MASIVA = "";
var TITULO_CARGA_MASIVA = "Resumen de importación de equipos";
var FLAG_ACTIVO_EQUIPO = 0;
var DOMINIO_RED_ACTUAL = null;
var PARAMETRO_ACTIVAR_EQUIPO = false;
const TIPO_EQUIPO = { SERVIDOR: 1, SERVIDOR_AGENCIA: 2, PC: 3, SERVICIO_NUBE: 4, STORAGE: 5, APPLIANCE: 6 };
const EQUIPOS_ARR_FILTRO = [TIPO_EQUIPO.APPLIANCE];
const EQUIPOS_ARR_BUSQUEDA = [TIPO_EQUIPO.APPLIANCE];
const TIPO_ACTIVO_EQUIPO = { FISICO: 7, VIRTUAL: 8, PAAS: 9, IAAS: 10, SAAS: 11 };
const FECHA_CALCULO = { EXTENDIDA: "2", SOPORTE: "3", INTERNA: "4" };

$(function () {
    cargarCombos();
    initFecha();
    FormatoCheckBox($("#divFlagExCal"), 'cbFlagExCal');
    FormatoCheckBox($("#divFlagFinSoporteFabrica"), 'cbFechaSoporteFabrica');
    $("#cbFlagExCal").change(FlagExclusion_Change);
    $("#cbFechaSoporteFabrica").change(FlagSoporteFabrica_Change);
    $("#ddlTipoActivo").change(ddlTipoActivo_Change);
    $("#btnExportarInfo").click(ExportarInfo);
    $("#btnMdSearchEBS").click(btnMdSearchEBS_Click);
    $("#btnBuscarESB").click(btnBuscarESB_Click);
    validarFormOS();
    validarAddOrEditForm();
    validarAddOrEditFormSO();
    validarFormImportar();
    listarEquipos();
    InitAutocompletarBuilder($("#txtFiltroNombreEq"), null, ".nombreEquipoContainer", "/Equipo/GetEquipoByFiltroAndTipo?filtro={0}&tipo=0");
    initUpload($("#txtArchivo"));
    $("#cbTipoEquipo").val("6");
    $("#cbTipoEquipo").attr("disabled", "disabled");
    $("#cbDominioRed").val("3");
    $("#cbDominioRed").attr("disabled", "disabled");
    $("#cbAmbiente").val("1");
    $("#cbAmbiente").attr("disabled", "disabled");
});
//INI Funciones de gestionEquipoAppliance
function listarEquipos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/GestionEquipos/ConfiguracionAppliance/Listado",
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
            DATA_EXPORTAR.flagActivo = 1 //$("#ddlEstado").val();//FLAG_ACTIVO_EQUIPO;
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
function buscarEquipo() {
    listarEquipos();
}
function linkFormatter(value, row, index) {
    let btnEditarEquipo = "";

    if (row.EquipoSoftwareBase.Activo && row.EquipoSoftwareBase.FlagAprobado == true) {
        btnEditarEquipo = `<a href="javascript:editarEquipo(${row.EquipoSoftwareBase.Id}, ${row.Id}, ${row.EquipoSoftwareBase.SubdominioId}, ${row.TipoEquipoId})" title="Editar">${value}</a>`;
    } else {
        btnEditarEquipo = value;
    }
    return btnEditarEquipo;
}
function opciones(value, row, index) {
  
    let style_color = "iconoVerde "; //Dependen de otro valor
    let type_icon = "check"; //Dependen de otro valor

    let btnAsignarSO = "";//`<a href="javascript:irAsignarSO(${row.Id})" title="asignar SO">[Asignar SO]</a>`;
    //let btnAsignarAppliance = `<a href="javascript:AddConfiguracion(${row.Id}, 31, ${row.TipoEquipoId})" title="Conifgurar">Conifgurar</a>`;
    let btnDesactivar = `<a href="javascript:UndoConfiguracion(${row.Id})" title="Desactivar configuración"><i class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    if (row.EquipoSoftwareBase.Activo && row.EquipoSoftwareBase.FlagAprobado == true) {
        return btnAsignarSO.concat("&nbsp;&nbsp;", btnDesactivar);
    } else {
        return ""; //Para los dos tipos de descubrimiento
    }
}
function UndoConfiguracion(EquipoId) {
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: "¿Estás seguro que deseas desactivar el appliance seleccionado?.",
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
                    url: `${URL_API_VISTA}/GestionEquipos/CambiarEstadoEquipoSoftwareBase?Id=${EquipoId}&Activo=${true}`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
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
    });
}
function AddConfiguracion(EquipoId, SubdominioId, TipoEquipoId) {
    $("#titleForm").html("Configurar Appliance");
    $("#hdEquipoId").val(EquipoId);
    $("#hdEquipoSoftwareBaseId").val("0");
    $("#hdTipoEquipoId").val(TipoEquipoId);
    $("#hdSubdominioId").val(SubdominioId);

    $(".onlyAdd").show();
    $(".onlyAdd").removeClass("ignore");
    setViewModalEquipo(PARAMETRO_ACTIVAR_EQUIPO, TIPO_EQUIPO.APPLIANCE);

    $("#txtNomEquipo").val("");
    $("#cbCaracteristica").val("-1");
    $(".divUrl").hide();

    irAddOrEditModal(true);
    $("#txtNomEquipo").removeAttr("disabled");
}
function GuardarEquipoSoftwareBase() {
    let data = {
        Id: $("#hdEquipoSoftwareBaseId").val(),
        EquipoId: ($("#hdEquipoId").val() === "") ? 0 : parseInt($("#hdEquipoId").val()),
        SubdominioId: parseInt($("#hdSubdominioId").val()), //$("#ddlSubdominio").val(),
        SoftwareBase: null,
        FechaLanzamiento: null,//$.trim($("#dpFecLanTec").val()) !== "" ? dateFromString($("#dpFecLanTec").val()) : null,
        FechaFinSoporte: null,
        FechaFinExtendida: null,//$.trim($("#dpFecExtTec").val()) !== "" ? dateFromString($("#dpFecExtTec").val()) : null,
        FechaFinInterna: null,//$.trim($("#dpFecIntTec").val()) !== "" ? dateFromString($("#dpFecIntTec").val()) : null,
        ComentariosFechaFin: null,
        FechaCalculoId: null,
        //Tab Generales
        TipoActivo: null,
        Serial: null,
        Modelo: null,
        Vendor: null,
        Tecnologia: $.trim($("#txtTecnologiaEquipo").val()),
        Version: null,
        Hostname: null,
        IP: null,
        Dimension: null,
        ArquitectoSeguridad: null,
        SoportePrimerNivel: null,
        Proveedor: null,
        Criticidad: null,
        UrlNube: null,
        //Tab Vigencia
        FechaAdquisicion: null,
        FechaImplementacion: null,
        FechaUltimaRenovacion: null,
        VencimientoLicencia: $.trim($("#dpVencimientoLicencia").val()) !== "" ? dateFromString($("#dpVencimientoLicencia").val()) : null,
        //CantidadLicencia: $.trim($("#txtCantidadLicencia").val()),
        CantidadLicencia: 0,
        FormaLicenciamiento: null,
        //Tab Inventario
        //CodigoInventario: $.trim($("#txtCodigoInventario").val()),
        CodigoInventario: "",
        CyberSOC: null,
        Sede: null,
        Sala: null,
        RACK: null,
        Ubicacion: null,
        //Tab Configuracion
        Backup: null,
        BackupFrecuencia: null,
        BackupDescripcion: null,
        IntegracionGestorInteligencia: null,
        ConectorSIEM: null,
        CONA: null,
        UmbralCPU: null,
        UmbralMemoria: null,
        UmbralDisco: null,
        Ventana: null,
        //nuevos campos
        EquipoDetalle: null,
        EstadoIntegracionSIEM: null,
        CONAAvanzado: null,
        EstadoAppliance: 95,
        FlagSeguridad: false,

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
function guardarAddOrEditEquipo() {
    if ($("#formAddOrEdit").valid()) {
        GuardarEquipoSoftwareBase();
    }
}
function GuardarEquipoBase(equipoBase) {
    $("#btnRegEq").button("loading");

    $.ajax({
        url: URL_API_VISTA,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(equipoBase),
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let EquipoId = dataObject;
                    let TipoEquipoId = parseInt($("#hdTipoEquipoId").val());
                    toastr.success("Registrado correctamente", TITULO_MENSAJE);
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
function limpiarAddOrEditModal() {
    LimpiarValidateErrores($("#formAddOrEdit"));
    $("#cbFlagExCal").prop('checked', false);
    $("#cbFlagExCal").bootstrapToggle('off');
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
}
function irAddOrEditModal(EstadoMd) {
    limpiarAddOrEditModal();
    if (EstadoMd)
        $("#MdAddOrEdit").modal(opcionesModal);
    else
        $("#MdAddOrEdit").modal('hide');
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
                    //debugger;
                    SetItems(dataObject.Ambiente, $("#cbAmbiente"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.TipoEquipo.filter(x => EQUIPOS_ARR_FILTRO.includes(parseInt(x.Id))), $("#cbFilTipoEq"), TEXTO_TODOS);
                    SetItems(dataObject.TipoEquipo.filter(x => EQUIPOS_ARR_FILTRO.includes(parseInt(x.Id))), $("#cbTipoEquipoFil"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoEquipo.filter(x => EQUIPOS_ARR_FILTRO.includes(parseInt(x.Id))), $("#cbTipoEquipo"), TEXTO_SELECCIONE);
                    SetItems(dataObject.SO, $("#cbSO"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.SO, $("#cbSOAdd"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoExclusion, $("#cbTipoExclusion"), TEXTO_SELECCIONE);
                    SetItems(dataObject.DominioRed, $("#cbDominioRed"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.CaracteristicaEquipo, $("#cbCaracteristica"), TEXTO_SELECCIONE);
                   // SetItems(dataObject.EstadoEquipo, $("#ddlEstado"), TEXTO_TODOS);
                    //SetItems(dataObject.Dominio, $("#ddlDominio"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.FechaCalculo, $("#ddlFechaCalculo"), TEXTO_SELECCIONE);
                    $("#ddlFechaCalculo").val(3);

                    $("#ddlFechaCalculo").attr("disabled", "disabled");
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
function editarEquipo(EquipoSoftwareBaseId, EquipoId, SubdominioId, TipoEquipoId) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#titleForm").html("Configurar Appliance");
    $(".onlyAdd").addClass("ignore");
    $(".onlyAdd").hide();
    setViewModalEquipo(PARAMETRO_ACTIVAR_EQUIPO, TipoEquipoId);
    $.ajax({
        url: URL_API_VISTA + "/" + EquipoId,
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
                    $("#cbFlagExCal").prop('checked', dataObject.FlagExcluirCalculo);
                    $("#cbFlagExCal").bootstrapToggle(dataObject.FlagExcluirCalculo ? 'on' : 'off');
                    $("#cbTipoExclusion").val($("#cbFlagExCal").prop('checked') ? dataObject.TipoExclusionId : "-1");
                    $("#txtMotivoExclusion").val($("#cbFlagExCal").prop('checked') ? dataObject.MotivoExclusion : "");
                    $("#cbDominioRed").val(dataObject.DominioServidorId !== null ? dataObject.DominioServidorId : "-1");
                    DOMINIO_RED_ACTUAL = dataObject.DominioServidorId;
                    $("#hdFlagDominioRed").val(dataObject.FlagCambioDominioRed);
                    let dataESB = dataObject.EquipoSoftwareBase || null;
                    $("#hdEquipoSoftwareBaseId").val(dataESB !== null ? dataESB.Id : "0");
                    if (dataESB !== null) {
                        //Tab Generales
                        $("#txtTecnologiaEquipo").val(dataESB.Tecnologia || "");
                        $("#dpVencimientoLicencia").val(dataESB.VencimientoLicenciaStr);
                    }
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}
function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }
    DATA_EXPORTAR.nombre = $.trim($("#txtBusEq").val());
    DATA_EXPORTAR.NombreEquipo = $.trim($("#txtFiltroNombreEq").val());
    DATA_EXPORTAR.tipoEquipoIds = EQUIPOS_ARR_BUSQUEDA.join(";");

    let url = `${URL_API_VISTA}/GestionEquipos/ConfiguracionAppliance/Exportar?filtro=${DATA_EXPORTAR.nombre}&filtroEquipo=${DATA_EXPORTAR.NombreEquipo}&flagActivo=${DATA_EXPORTAR.flagActivo}`;
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
function validarAddOrEditForm() {
    $.validator.addMethod("existeEquipo", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "" && $.trim(value).length > 3) {
            let estado = false;
            estado = !ExisteEquipo();
            return estado;
        }
        return estado;
    });
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
    $.validator.addMethod("requiredOnlyNew", function (value, element) {
        let equipoId = $("#hdEquipoId").val() === "" ? 0 : parseInt($("#hdEquipoId").val());
        if (equipoId === 0) {
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
            txtTecnologiaEquipo: {
                requiredSinEspacios: true
            },
            dpVencimientoLicencia: {
                requiredOnlyEdit: true
            }
        },
        messages: {
            txtTecnologiaEquipo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la tecnología")
            },
            dpVencimientoLicencia: {
                requiredOnlyEdit: String.Format("Debes ingresar {0}.", "el vencimiento")
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "dpVencimientoLicencia") {
                element.parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
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
function setViewModalEquipo(parametro, tipoEquipoId = 0) {
    if (parametro) {
        $(".parametro-view").show();
        $(".parametro-view").removeClass("ignore");
    } else {
        $(".parametro-view").show();
        $(".parametro-view").removeClass("ignore");
    }
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
//FIN Funciones de gestionEquipoAppliance
function ddlFechaCalculo_Change() {
    var combo = $(this).val();
}
function ddlTipoActivo_Change() {
    $("#txtSerial").removeAttr("disabled");
    $("#txtModelo").removeAttr("disabled");
    $("#ddlSede").removeAttr("disabled");
    $("#txtSala").removeAttr("disabled");
    $("#txtRack").removeAttr("disabled");
    $("#txtUbicacion").removeAttr("disabled");

    let ddlValor = parseInt($(this).val());
    if (ddlValor === TIPO_ACTIVO_EQUIPO.IAAS || ddlValor === TIPO_ACTIVO_EQUIPO.PAAS || ddlValor === TIPO_ACTIVO_EQUIPO.SAAS) {
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

    if (ddlValor === TIPO_ACTIVO_EQUIPO.VIRTUAL) {
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
        let validExts = new Array(".xlsx", ".xls");
        let fileExt = value;
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
function ExisteEquipo() {
    let estado = true;
    let clave = encodeURIComponent($("#txtNomEquipo").val());
    let id = $("#hdEquipoId").val() === "" ? 0 : $("#hdEquipoId").val();

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/GestionEquipos/Appliance/ExisteEquipo?clave=${clave}&id=${id}`,
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
    if (!ExisteEquipoAsociado(id)) {
        obtenerESB(id);
    } else {
        MensajeGeneralAlert(TITULO_MENSAJE, "Este equipo ya tiene un registro asociado, no es posible asociar");
    }
}
function ExisteEquipoAsociado(_id) {
    let estado = true;
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
    }
}