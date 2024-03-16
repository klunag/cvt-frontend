var $table = $("#tblTecNoReg");
var $tblMdTec = $("#tblMdTec");
var URL_API_VISTA = URL_API + "/TecnologiaNoRegistrada";
var urlApiSubdom = URL_API + "/Subdominio";
var data = [];
var DATA_EXPORTAR = {};
var TITULO_MENSAJE = "Equivalencias sin tecnologías";
var APLICACION_ADD = "";
var ESTADO_TECNOLOGIA = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var FLAG_ACTIVO_TECNOLOGIA = 0;
var MENSAJE_CARGA_MASIVA = "";
var TITULO_CARGA_MASIVA = "Resumen de importación de tecnologías no registradas";


//Qualys
//var $tableQualys = $("#tblEquipoNoRegQualys");
//var $tableTecQualys = $("#tblTecNoRegQualys");

var equipoId = null;
var dataQualys = [];
var DATA_EXPORTAR_EQUIPO_Qualys = {};
var DATA_EXPORTAR_Qualys = {};
var TITULO_MENSAJE_Qualys = "Tecnologias no registradas en qualys";
var APLICACION_ADD_Qualys = "";
var ESTADO_TECNOLOGIA_Qualys = { REGISTRADO: 1, PROCESOREVISION: 2, APROBADO: 3, OBSERVADO: 4 };
var FLAG_ACTIVO_TECNOLOGIA_Qualys = 0;
var MENSAJE_CARGA_MASIVA_Qualys = "";
var TITULO_CARGA_MASIVA_Qualys = "Resumen de importación de tecnologías no registradas";

$(function () {
    //Tecnologia No Registrada
    InitBT();

    //$("#AsocContainer").addClass("tec"); //Bloquear boton
    //$("#btnAsociar").attr("disabled", true);

    //$table.on('check-all.bs.table', function (e, row) {
    //    //$("#AsocContainer").removeClass("tec"); //Desbloquear boton
    //    $("#btnAsociar").attr("disabled", false);
    //    $("#SearchContainer").addClass("tec");
    //    $(".id-test").addClass("tec");
    //}).on('uncheck-all.bs.table', function (e, row) {
    //    //$("#AsocContainer").addClass("tec");
    //    $("#btnAsociar").attr("disabled", true);
    //    $("#SearchContainer").removeClass("tec");
    //    $(".id-test").removeClass("tec");
    //}).on('check.bs.table', function (e, row, args) {
    //    //$("#AsocContainer").removeClass("tec");
    //    $("#btnAsociar").attr("disabled", false);
    //    $("#SearchContainer").addClass("tec");
    //    $(".id-test").addClass("tec");
    //}).on('uncheck.bs.table', function (e, row) {
    //    var data = $table.bootstrapTable("getData");
    //    var itemCbAct = data.find(x => x.state) || null;
    //    if (itemCbAct !== null) {
    //        //$("#AsocContainer").removeClass("tec");
    //        $("#btnAsociar").attr("disabled", false);
    //        $(".id-test").addClass("tec");
    //    } else {
    //        //$("#AsocContainer").addClass("tec");
    //        $("#btnAsociar").attr("disabled", true);
    //        $("#SearchContainer").removeClass("tec");
    //        $(".id-test").removeClass("tec");
    //    }
    //});

    /*initUpload($("#txtArchivo"));*/

    cargarCombos();
    //validarFormAddTec();
    //validarFormImportar();
    listarTecNoReg();

    //setItemsCb($("#cbDomTec"), "/Dominio/ConSubdominio");

    //$("#cbDomTec").on('change', function () {
    //    getSubdominiosByDomCb(this.value, $("#txtSubTec"));
    //});

    //InitAutocompletarFamilia($("#txtFamTec"), $("#hFamTecId"), $(".famContainer"));

    //$("#txtFabricanteTec, #txtNomTec, #txtVerTec").keyup(function () {
    //    $("#txtClaveTecnologia").val(String.Format("{0} {1} {2}", $.trim($("#txtFabricanteTec").val()), $.trim($("#txtNomTec").val()), $.trim($("#txtVerTec").val())));
    //});

    //setDefaultHd($("#txtFamTec"), $("#hFamTecId"));

    //Tecnologia No Registrada Qualys
    //InitAutocompletarBuilder($("#txtBusEqpNoRegQualys"), $("#hdnBusEqpNoRegQualys"), ".equipoSearchContainer", "/Equipo/GetEquipoByFiltro?filtro={0}");
    //InitAutocompletarTecnologiaQualys($("#txtBusTecNoRegQualys"), $("#hdnBusTecNoRegQualys"), $(".tecnologiaSearchContainer"));

    //InitBTQualys();
    //listarEquipoTecNoRegQualys();



    //$(".tab-panel-tecnologia").addClass("hidden");

    //var v = document.getElementById("datTran");
    //v.classList.add("hidden");

});

function InitBT() {
    $table.bootstrapTable("destroy");
    $table.bootstrapTable({ data: [] });
    //$tblMdTec.bootstrapTable("destroy");
    //$tblMdTec.bootstrapTable({ data: [] });
}

function LimpiarFiltros() {
    $("#txtBusTecNoReg").val("");
    $("#cbFilTipEq, #cbFilEq").val("-1");
}

function buscarTecNoReg() {
    listarTecNoReg();
}

function listarTecNoReg() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Tecnologia',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusTecNoReg").val());
         /*   DATA_EXPORTAR.so = $.trim($("#cbFilEq").val());*/
            DATA_EXPORTAR.id = $("#cbFilTipEq").val();
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
        }
    });
}

//function formatOpc(value, row, index) {
//    let btnAsociar = "";
//    let btnAgregar = "";

//    btnAsociar = `<a class='id-test' href='javascript: void (0)' title='Asociar' onclick='irAsociarTecNoReg(${row.Id}, "${row.ClasificacionSugerida}","${row.Aplicacion}")'>` +
//        `<span class="icon icon-compress"></span>` +
//        `</a>`;

//    btnAgregar = `<a class='id-test' href='javascript: void (0)' title='Agregar tecnología' onclick='irAgregarTecnologia("${row.Aplicacion}", "${row.ClasificacionSugerida}")'>` +
//        `<span class="icon icon-plus-circle"></span>` +
//        `</a>`;

//    return btnAsociar.concat("&nbsp;&nbsp;", btnAgregar);
//}

//function LimpiarModalTecnologia() {
//    LimpiarValidateErrores($("#formAddTec"));
//    $("#txtFabricanteTec, #txtNomTec, #txtVerTec, #txtClaveTecnologia, #txtFamTec").val('');
//    $("#cbTipTec, #cbDomTec, #txtSubTec").val("-1");
//}

//function irAgregarTecnologia(Aplicacion, ClasificacionSugerida) {
//    ClasificacionSugerida = ClasificacionSugerida || "";
//    APLICACION_ADD = Aplicacion;
//    $("#titleFormAddTec").html(String.Format("Agregar tecnología: {0}", Aplicacion));
//    LimpiarModalTecnologia();

//    if (ClasificacionSugerida !== "") {
//        ObtenerDominioSubdominioSugerido(ClasificacionSugerida);
//    }

//    $("#MdAddTec").modal(opcionesModal);
//}

//function ObtenerDominioSubdominioSugerido(ClasificacionSugerida) {
//    $.ajax({
//        type: "GET",
//        contentType: "application/json; charset=utf-8",
//        url: URL_API_VISTA + `/ObtenerDominioSubdominioSugerido?nombre=${ClasificacionSugerida}`,
//        dataType: "json",
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    if (dataObject.DominioId > 0) {
//                        $("#cbDomTec").val(dataObject.DominioId);
//                        $("#cbDomTec").trigger("change");
//                        $("#txtSubTec").val(dataObject.SubdominioId);
//                    }
//                }
//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//}

//function InsertNuevaFamilia() {
//    let familia = {};
//    familia.Id = 0;//($("#hIdFamilia").val() === "") ? 0 : parseInt($("#hIdFamilia").val());
//    familia.Nombre = $("#txtFamTec").val();
//    familia.Descripcion = $("#txtFamTec").val();
//    familia.Existencia = 1; //$("#cbExisTec").val();
//    familia.Facilidad = 3; //$("#cbFacAcTec").val();
//    familia.Riesgo = 0;//$("#cbRiesgTec").val();
//    familia.Vulnerabilidad = 0; //$("#txtVulTec").val();

//    familia.UsuarioCreacion = USUARIO.UserName;
//    familia.UsuarioModificacion = USUARIO.UserName;
//    familia.Activo = true;//$('#cbActFamilia').prop("checked"); // $("#cbActFamilia").is(':checked');

//    $.ajax({
//        url: URL_API + "/Familia",
//        type: "POST",
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
//        contentType: "application/json; charset=utf-8",
//        data: JSON.stringify(familia),
//        dataType: "json",
//        success: function (result) {
//            console.log(result);
//            if (result > 0) {
//                //ID = result;
//                console.log(String.Format("Familia registrada con ID : {0}", result));
//                $("#hFamTecId").val(result);
//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//}

//function InsertarNuevaTecnologia() {
//    $("#btnRegTec").button("loading");

//    var tec = {};
//    tec.Id = 0;//($("#hIdTec").val() === "") ? 0 : parseInt($("#hIdTec").val());
//    tec.Activo = true;
//    tec.EstadoTecnologia = ESTADO_TECNOLOGIA.APROBADO;
//    tec.ClaveTecnologia = $("#txtClaveTecnologia").val();
//    //Tab 1
//    tec.Nombre = $("#txtNomTec").val();
//    tec.Descripcion = ""; /*$("#txtDesTec").val();*/
//    tec.Versiones = $("#txtVerTec").val();
//    tec.Fabricante = $("#txtFabricanteTec").val();
//    tec.FamiliaId = $("#hFamTecId").val(); //FAMILIA GENERAL ID = 1
//    tec.TipoTecnologiaId = $("#cbTipTec").val(); /*$("#cbTipTec").val();*/
//    tec.FlagFechaFinSoporte = true; /*$("#cbFlagFecSop").prop("checked");*/
//    tec.Fuente = 1; /* tec.FlagFechaFinSoporte ? $("#cbFuenteTec").val() : null; */
//    tec.FechaLanzamiento = null; /*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecLanTec").val()) : null) : null;*/
//    tec.FechaExtendida = null;/*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecExtTec").val()) : null) : null;*/
//    tec.FechaFinSoporte = null;/*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecSopTec").val()) : null) : null;*/
//    tec.FechaAcordada = null;/*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? castDate($("#dpFecIntTec").val()) : null) : null;*/
//    tec.FechaCalculoTec = 3;/*tec.FlagFechaFinSoporte ? (parseInt($("#cbFuenteTec").val()) === 3 ? $("#cbFecCalTec").val() : null) : null;*/
//    tec.ComentariosFechaFin = ""; /*$("#txtComTec").val(); */
//    tec.Existencia = 1; /*$("#cbExisTec").val();*/
//    tec.Facilidad = 3; /*$("#cbFacAcTec").val();*/
//    tec.Riesgo = 0;/*$("#txtVulTec").val();*/
//    tec.Vulnerabilidad = 0;/*$("#txtVulTec").val();*/
//    tec.CasoUso = "";/*$("#txtCusTec").val();*/
//    tec.Requisitos = ""; /*$("#txtReqHSTec").val();*/
//    tec.Compatibilidad = ""; /*$("#txtCompaTec").val();*/
//    tec.Aplica = ""; /*$("#txtApliTec").val();*/
//    tec.FlagAplicacion = false; /*$("#cbFlagApp").prop("checked"); */
//    tec.CodigoAPT = null; /*tec.FlagAplicacion ? $("#hdIdApp").val() : null;*/

//    //Tab 2
//    tec.SubdominioId = $("#txtSubTec").val(); /*$("#hIdSubTec").val();*/
//    tec.EliminacionTecObsoleta = null;/*$("#hIdTecObs").val() === "" ? null : parseInt($("#hIdTecObs").val());*/
//    tec.RoadmapOpcional = null; /*$.trim($("#txtElimTec").val()) === "" || $("#hIdTecObs").val() != "" ? null : $("#txtElimTec").val();*/
//    tec.Referencias = ""; /*$("#txtRefTec").val();*/
//    tec.PlanTransConocimiento = ""; /*$("#txtPlanTransTec").val();*/
//    tec.EsqMonitoreo = "";/*$("#txtEsqMonTec").val();*/
//    tec.LineaBaseSeg = ""; /*$("#txtLinSegTec").val();*/
//    tec.EsqPatchManagement = ""; /*$("#txtPatManTec").val();*/

//    //Tab 3
//    tec.Dueno = ""; /*$("#txtDueTec").val();*/
//    tec.EqAdmContacto = "";/*$("#txtEqAdmTec").val();*/
//    tec.GrupoSoporteRemedy = "";/*$("#txtGrupRemTec").val();*/
//    tec.ConfArqSeg = ""; /*$("#txtConfArqSegTec").val();*/
//    tec.ConfArqTec = ""; /*$("#txtConfArqTec").val();*/
//    tec.EncargRenContractual = ""; /*$("#txtRenConTec").val();*/
//    tec.EsqLicenciamiento = ""; /*$("#txtEsqLinTec").val();*/
//    tec.SoporteEmpresarial = ""; /*$("#txtSopEmpTec").val();*/
//    tec.ListAutorizadores = [];/*$tblAutTec.bootstrapTable('getData');*/
//    tec.ItemsRemoveAutId = [];

//    tec.UsuarioCreacion = USUARIO.UserName;
//    tec.UsuarioModificacion = USUARIO.UserName;

//    tec.FlagCambioEstado = true;

//    $.ajax({
//        url: URL_API + "/Tecnologia",
//        type: "POST",
//        contentType: "application/json; charset=utf-8",
//        data: JSON.stringify(tec),
//        dataType: "json",
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

//        success: function (result) {
//            let Id = result;
//            if (Id > 0) {
//                $("#btnRegTec").button("reset");
//                $("#MdAddTec").modal('hide');

//                bootbox.confirm({
//                    title: TITULO_MENSAJE,
//                    message: String.Format("La tecnología con ID: {0} se registró correctamente. ¿Estás seguro que deseas asociar la equivalencia a esta tecnología ?", Id),
//                    buttons: {
//                        confirm: {
//                            label: 'Aceptar',
//                            className: 'btn-primary'
//                        },
//                        cancel: {
//                            label: 'Cancelar',
//                            className: 'btn-secondary'
//                        }
//                    },
//                    callback: function (result) {
//                        //result = result || false;
//                        if (result) {
//                            data = [];
//                            let obj = { Aplicacion: APLICACION_ADD, EquipoId: "" };
//                            data.push(obj);

//                            guardarTecNoReg(Id, null);
//                        }
//                    }
//                });
//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//}

//function ExisteFamilia2() {
//    let estado = false;
//    let Id = $("#hFamTecId").val() !== "0" ? $("#hFamTecId").val() : null;
//    let nombre = $("#txtFamTec").val() || "";
//    $.ajax({
//        type: "GET",
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

//        contentType: "application/json; charset=utf-8",
//        url: URL_API + "/Familia" + `/ExisteFamilia?Id=${Id}&nombre=${nombre}`,
//        dataType: "json",
//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    estado = dataObject;
//                }
//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//    return estado;
//}

//function guardarAddTec() {
//    if ($("#formAddTec").valid()) {
//        if ($("#hFamTecId").val() === "0") {
//            bootbox.confirm({
//                title: TITULO_MENSAJE,
//                message: "La familia ingresada es nueva. ¿Desea registrarla en el grupo de familias y asignarla a esta tecnología?",
//                buttons: {
//                    confirm: {
//                        label: 'Aceptar',
//                        className: 'btn-primary'
//                    },
//                    cancel: {
//                        label: 'Cancelar',
//                        className: 'btn-secondary'
//                    }
//                },
//                callback: function (result) {
//                    if (result !== null && result) {
//                        InsertNuevaFamilia();
//                        InsertarNuevaTecnologia();
//                    }
//                }
//            });
//        } else {
//            InsertarNuevaTecnologia();
//        }
//    }
//}

//function ExisteClaveTecnologia() {
//    let estado = true;
//    let clave = encodeURIComponent($("#txtClaveTecnologia").val());
//    let flagActivo = FLAG_ACTIVO_TECNOLOGIA;
//    $.ajax({
//        type: "GET",
//        contentType: "application/json; charset=utf-8",
//        url: URL_API + "/Tecnologia" + `/ExisteClaveTecnologia?clave=${clave}&id=${null}&flagActivo=${flagActivo}`,
//        dataType: "json",
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    estado = dataObject;
//                }
//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//    return estado;
//}

//function ExisteFamilia() {
//    let estado = false;
//    let Id = $("#hFamTecId").val();
//    let nombre = null;
//    $.ajax({
//        type: "GET",
//        contentType: "application/json; charset=utf-8",
//        url: URL_API + "/Familia" + `/ExisteFamilia?Id=${Id}&nombre=${nombre}`,
//        dataType: "json",
//        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

//        success: function (dataObject, textStatus) {
//            if (textStatus === "success") {
//                if (dataObject !== null) {
//                    estado = dataObject;
//                }
//            }
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
//        },
//        async: false
//    });
//    return estado;
//}

//function validarFormAddTec() {

//    $.validator.addMethod("existeClaveTecnologia", function (value, element) {
//        let estado = true;
//        if ($.trim(value) !== "") {
//            let estado = false;
//            estado = !ExisteClaveTecnologia();
//            return estado;
//        }
//        return estado;
//    });

//    $.validator.addMethod("existeFamilia", function (value, element) {
//        let estado = true;
//        if ($("#hFamTecId").val() === "0") {
//            if ($.trim(value) !== "" && $.trim(value).length >= 3) {
//                estado = !ExisteFamilia2();
//                return estado;
//            }
//        }

//        return estado;
//    });

//    $("#formAddTec").validate({
//        validClass: "my-valid-class",
//        errorClass: "my-error-class",
//        ignore: ".ignore",
//        highlight: function (element) {
//            $(element).removeClass("my-error-class");
//        },
//        rules: {
//            txtFabricanteTec: {
//                requiredSinEspacios: true
//            },
//            txtNomTec: {
//                requiredSinEspacios: true
//            },
//            txtVerTec: {
//                requiredSinEspacios: true
//            },
//            txtFamTec: {
//                requiredSinEspacios: true,
//                existeFamilia: true
//            },
//            cbTipTec: {
//                requiredSelect: true
//            },
//            cbDomTec: {
//                requiredSelect: true
//            },
//            txtSubTec: {
//                requiredSelect: true
//            },
//            txtClaveTecnologia: {
//                existeClaveTecnologia: true
//            }
//        },
//        messages: {
//            txtFabricanteTec: {
//                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el fabricante")
//            },
//            txtNomTec: {
//                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
//            },
//            txtVerTec: {
//                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la versión")
//            },
//            txtFamTec: {
//                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la familia"),
//                existeFamilia: String.Format("{0} ingresada ya existe", "La familia")
//            },
//            cbTipTec: {
//                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo")
//            },
//            cbDomTec: {
//                requiredSelect: String.Format("Debes seleccionar {0}.", "el dominio")
//            },
//            txtSubTec: {
//                requiredSelect: String.Format("Debes seleccionar {0}.", "el subdominio")
//            },
//            txtClaveTecnologia: {
//                existeClaveTecnologia: "Clave de la tecnología ya existe."
//            }
//        }
//    });
//}

function irAsociarTecNoReg(Id, ClasificacionSugerida, Aplicacion) {
    ClasificacionSugerida = ClasificacionSugerida || "";
    Aplicacion = Aplicacion || "";
    APLICACION_ADD = Aplicacion;
    $tblMdTec.bootstrapTable("destroy");
    $tblMdTec.bootstrapTable({ data: [] });
    $("#txtNomTecReg").val("");
    $("#lblTecnologia").html(Aplicacion !== "" ? Aplicacion : "");

    data = [];
    var result = [];
    if (Id !== undefined) {
        var item = $table.bootstrapTable('getRowByUniqueId', Id);
        data.push(item);
        data.forEach(e => {
            let obj = { Aplicacion: e.Aplicacion, EquipoId: e.EquipoId };
            result.push(obj);
        });
        //data = data.map(x => x.Id);
        data = result;
    } else {
        data = $table.bootstrapTable("getData").filter(x => x.state);
        //data = data.map(x => x.Id);
        data.forEach(e => {
            let obj = { Aplicacion: e.Aplicacion, EquipoId: e.EquipoId };
            result.push(obj);
        });
        data = result;
    }

    if (ClasificacionSugerida !== "") {
        obtenerSubdominiosSugeridos(ClasificacionSugerida);
    } else {
        $("#mdTec").modal(opcionesModal);
    }
}

function formatOpcTecSug(value, row, index) {
    var iconRemove = `<a class='btn btn-primary' href='javascript: void(0)' onclick='irGuardarTecNoReg(${row.Id},"${row.ClaveTecnologia}")'>Guardar</a>`;
    return iconRemove;
}

function irGuardarTecNoReg(Id, clave) {
    bootbox.confirm({
        title: TITULO_MENSAJE,
        message: String.Format("¿Estás seguro que deseas asociar la equivalencia a la tecnología {0} ?", clave),
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
            //result = result || false;
            if (result) {
                data = [];
                let obj = { Aplicacion: APLICACION_ADD, EquipoId: "" };
                data.push(obj);

                guardarTecNoReg(Id, $("#mdTec"));
            }
        }
    });
}

//function removerItemTec(TecId) {
//    $tblMdTec.bootstrapTable('remove', {
//        field: 'TecId', values: [TecId]
//    });
//}

function guardarTecNoReg(id, $modal) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

    var obj = {};
    //obj.items = data;
    obj.itemsTec = data;
    obj.id = id;
    //obj.id = $("#hIdTec").val();
    //$("#btnMdTecReg").button("loading");

    $.ajax({
        url: URL_API_VISTA + "/AsociarTecnologias2",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(obj),
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    waitingDialog.hide();
                    toastr.success("Se asoció correctamente", TITULO_MENSAJE);
                    $("#SearchContainer").removeClass("tec");
                    //LimpiarFiltros();
                    listarTecNoReg();
                }
            }
        },
        complete: function () {
            if ($modal !== null) {
                $modal.modal('hide');
            }
            bootbox.hideAll();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function buscarTecSugeridas() {
    listarTecnologiasSugeridas();
}

function obtenerSubdominiosSugeridos(nombre) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + `/ListarSubdominiosSugeridos?nombre=${nombre}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItemsMultiple(dataObject, $("#cbSubSugerido"), TEXTO_TODOS, TEXTO_TODOS, true);

                    $("#cbSubSugerido").val(dataObject);
                    $("#cbSubSugerido").multiselect("refresh");
                    //console.log($("#cbSubSugerido").val());
                    listarTecnologiasSugeridas();
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            waitingDialog.hide();
        },
        async: false
    });
}

function listarTecnologiasSugeridas() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblMdTec.bootstrapTable('destroy');
    $tblMdTec.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/ListarTecnologiasSugeridas",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'DominioId',
        sortOrder: 'desc',
        queryParams: function (p) {
            return JSON.stringify({
                nombre: $("#txtNomTecReg").val() || "",
                subIds: $("#cbSubSugerido").val() === null ? [] : $("#cbSubSugerido").val(),
                pageNumber: p.pageNumber,
                pageSize: p.pageSize,
                sortName: p.sortName,
                sortOrder: p.sortOrder
            });
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
            $("#mdTec").modal(opcionesModal);
        }
    });
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
                    SetItems(dataObject.TipoEquipo, $("#cbFilTipEq"), TEXTO_TODOS);
                    SetItems(dataObject.TipoTec, $("#cbTipTec"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Equivalencias, $("#cbFilEq"), TEXTO_TODOS);

                    SetItemsMultiple(dataObject.Subdominio, $("#cbSubSugerido"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsCustom(dataObject.Dominio, $("#cbDomTec"));
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function ExportarRegistros() {
    //let _data = $table.bootstrapTable("getData") || [];
    //if (_data.length === 0) {
    //    MensajeNoExportar(TITULO_MENSAJE);
    //    return false;
    //}
    ////let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.so}&equivalencia=${DATA_EXPORTAR.nombre}&tipoEquipoId=${DATA_EXPORTAR.id}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
    ///*let url = String.Format("{0}/Exportar?nombre={1}&equivalencia={2}&tipoEquipoId={3}&sortName={4}&sortOrder={5}",*/
    //let url = String.Format("{0}/Exportar?tecnologia={1}&tipoEquipoId={2}&sortName={3}&sortOrder={4}",
    //    URL_API_VISTA,
    //    /*DATA_EXPORTAR.so,*/
    //    encodeURIComponent(DATA_EXPORTAR.nombre),
    //    DATA_EXPORTAR.id,
    //    DATA_EXPORTAR.sortName,
    //    DATA_EXPORTAR.sortOrder
    //);
    ////url = encodeURIComponent(url);
    //$.ajax({
    //    url: url,
    //    contentType: "application/vnd.ms-excel",
    //    beforeSend: function (xhr) {
    //        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    //        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
    //    },
    //    success: function (data, status, xhr) {
    //        let bytes = Base64ToBytes(data.excel);
    //        var blob = new Blob([bytes], { type: "application/octetstream" });
    //        let url = URL.createObjectURL(blob);
    //        let link = document.createElement("a");
    //        link.href = url;
    //        link.download = data.name;
    //        document.body.appendChild(link);
    //        link.click();
    //        document.body.removeChild(link);
    //    }, complete: function (xhr, status) {
    //        waitingDialog.hide();
    //    }
    //});

    //NUEVO
    let urlReporteAll = "";
    let contador = 1;

    /*    while (contador > 0) {*/
    urlReporteAll = `${URL_API_VISTA}/ReporteDetalladoExportar`;

    $.ajax({
        url: urlReporteAll,
        contentType: "application/vnd.ms-excel",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            //if (data != null) {
            let bytes = Base64ToBytes(data.data);
            var blob = new Blob([bytes], { type: "application/octetstream" });
            let url = URL.createObjectURL(blob);
            let link = document.createElement("a");
            link.href = url;
            link.download = data.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            //}
            //else {
            //    contador = 0;
            //}

        }, error: function (er) {
            bootbox.alert({
                size: "small",
                title: "Mensaje",
                message: er.responseJSON.Message,
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-primary'
                    }
                }
            });
        }, complete: function (xhr, status) {
            waitingDialog.hide();
            //contador++;
        }
    });

}

//function setItemsCb(cbx, ctrlx) {
//    var $cb = cbx;

//    $cb.append($('<option></option')
//        .attr('value', '')
//        .text('Cargando...'));

//    $.ajax({
//        url: URL_API + ctrlx,
//        type: "GET",
//        dataType: "json",
//        success: function (result) {
//            var data = result;
//            $cb.find("option:gt(0)").remove();

//            $.each(data, function (i, item) {
//                $cb.append($('<option>', {
//                    value: item.Id,
//                    text: item.Nombre
//                }));
//            });
//        },
//        complete: function () {

//        },
//        error: function (result) {
//            alert(result.responseText);
//        },
//        async: false
//    });
//}

function SetItemsCustom(data, cbx) {
    var $cb = cbx;
    $cb.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $cb.find("option:gt(0)").remove();

    $.each(data, function (i, item) {
        $cb.append($('<option>', {
            value: item.Id,
            text: item.Nombre
        }));
    });
}

function getSubdominiosByDomCb(_domId, $cbSub) {
    var domId = _domId;

    $cbSub.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $.ajax({
        url: URL_API + "/Tecnologia" + "/Subdominios/" + domId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            data = result;
            $cbSub.find("option:gt(0)").remove();

            $.each(data, function (i, item) {
                $cbSub.append($('<option>', {
                    value: item.Id,
                    text: item.Nombre
                }));
            });
        },
        complete: function () {
        },
        error: function (result) {
            alert(result.responseText);
        },
        async: false
    });
}

function InitAutocompletarFamilia($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {

                if ($IdBox !== null) $IdBox.val("0");

                $.ajax({
                    url: URL_API + "/Familia" + "/GetAllFamiliaByFiltro?filtro=" + request.term,
                    //data: JSON.stringify({
                    //    filtro: request.term
                    //}),
                    //dataType: "json",
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_APLICACION = data;
                        response($.map(data, function (item) {
                            console.log(item);
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
            $searchBox.val(ui.item.Descripcion);
            if ($IdBox !== null) {
                $IdBox.val(ui.item.Id);
                //obtenerFamiliaById(ui.item.Id);
            }

            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function IrImportarEquipos() {
    $("#btnReg").show();
    $("#btnActualizar").hide();
    $("#btnDescargarPlantilla").show();
    $(".onlyUpdate").addClass("ignore");
    $(".onlyUpdate").hide();
    $(".onlyImport").removeClass("ignore");
    LimpiarValidateErrores($("#formImportar"));
    $("#titleFormImp").html(String.Format("{0} tecnologías no registradas", "Importar"));
    $("#flArchivo").val("");
    $("#txtArchivo").val(TEXTO_SIN_ARCHIVO);
    OpenCloseModal($("#mdImportar"), true);
}

function descargarPlantillaEquipos() {
    let url = `${URL_API_VISTA}/ObtenerPlantillaTecnologiaNoRegistrada`;
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

function CargarEquipos() {
    if ($("#formImportar").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $("#btnReg").button("loading");

        let formData = new FormData();
        let file = $("#flArchivo").get(0).files;
        formData.append("File", file[0]);

        $.ajax({
            url: URL_API_VISTA + "/CargarTecnologiasNoRegistradas",
            type: "POST",
            data: formData,
            contentType: false,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

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


//Metodos Qualys

//function InitBTQualys() {
//    $tableQualys.bootstrapTable("destroy");
//    $tableQualys.bootstrapTable({ data: [] });
//}

//function listarEquipoTecNoRegQualys() {
//    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
//    $tableQualys.bootstrapTable('destroy');
//    $tableQualys.bootstrapTable({
//        locale: 'es-SP',
//        url: URL_API_VISTA + "/ListadoEquipoTecnologiasNoRegistradasQualys",
//        method: 'POST',
//        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
//        pagination: true,
//        sidePagination: 'server',
//        queryParamsType: 'else',
//        pageSize: REGISTRO_PAGINACION,
//        pageList: OPCIONES_PAGINACION,
//        sortName: 'EquipoId',
//        sortOrder: 'asc',
//        queryParams: function (p) {
//            DATA_EXPORTAR_EQUIPO_Qualys = {};
//            DATA_EXPORTAR_EQUIPO_Qualys.equipoStr = $.trim($("#txtBusEqpNoRegQualys").val());
//            DATA_EXPORTAR_EQUIPO_Qualys.tecnologiaStr = $.trim($("#txtBusTecNoRegQualys").val());
//            DATA_EXPORTAR_EQUIPO_Qualys.flagAprobadoEquipo = $.trim($("#cbFilFlagAprobadoEquipoQualys").val()) == '' ? null : $.trim($("#cbFilFlagAprobadoEquipoQualys").val());
//            DATA_EXPORTAR_EQUIPO_Qualys.flagAprobado = $.trim($("#cbFilFlagAprobadoQualys").val()) == '' ? null : $.trim($("#cbFilFlagAprobadoQualys").val());
//            DATA_EXPORTAR_EQUIPO_Qualys.pageNumber = p.pageNumber;
//            DATA_EXPORTAR_EQUIPO_Qualys.pageSize = p.pageSize;
//            DATA_EXPORTAR_EQUIPO_Qualys.sortName = p.sortName;
//            DATA_EXPORTAR_EQUIPO_Qualys.sortOrder = p.sortOrder;

//            return JSON.stringify(DATA_EXPORTAR_EQUIPO_Qualys);
//        },
//        responseHandler: function (res) {
//            waitingDialog.hide();
//            var data = res;
//            return { rows: data.Rows, total: data.Total };
//        },
//        onLoadError: function (status, res) {
//            waitingDialog.hide();
//            bootbox.alert("Se produjo un error al listar los registros");
//        },
//        onSort: function (name, order) {
//            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
//        },
//        onPageChange: function (number, size) {
//            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
//        }
//    });
//}

//function buscarTecNoRegQualys(id) {
//    equipoId = id;
//    listarTecNoRegQualys(() => {
//        $("#MdTecnologiasByEquipo").modal(opcionesModal);
//        $("#MdTecnologiasByEquipo").on('hide.bs.modal', function () {
//            listarEquipoTecNoRegQualys();
//        });
//    });
//}

//function listarTecNoRegQualys(fn = null) {
//    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
//    $tableTecQualys.bootstrapTable('destroy');
//    $tableTecQualys.bootstrapTable({
//        locale: 'es-SP',
//        url: URL_API_VISTA + "/ListadoTecnologiasNoRegistradasQualys",
//        method: 'POST',
//        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
//        pagination: true,
//        sidePagination: 'server',
//        queryParamsType: 'else',
//        pageSize: REGISTRO_PAGINACION,
//        pageList: OPCIONES_PAGINACION,
//        sortName: 'TecnologiaId',
//        sortOrder: 'asc',
//        queryParams: function (p) {
//            DATA_EXPORTAR_Qualys = {};
//            //DATA_EXPORTAR_Qualys.equipoStr = DATA_EXPORTAR_EQUIPO_Qualys.equipoStr;
//            DATA_EXPORTAR_Qualys.equipoId = equipoId;
//            DATA_EXPORTAR_Qualys.tecnologiaStr = DATA_EXPORTAR_EQUIPO_Qualys.tecnologiaStr;
//            DATA_EXPORTAR_Qualys.flagAprobadoEquipo = DATA_EXPORTAR_EQUIPO_Qualys.flagAprobadoEquipo;
//            DATA_EXPORTAR_Qualys.flagAprobado = DATA_EXPORTAR_EQUIPO_Qualys.flagAprobado;
//            DATA_EXPORTAR_Qualys.pageNumber = p.pageNumber;
//            DATA_EXPORTAR_Qualys.pageSize = p.pageSize;
//            DATA_EXPORTAR_Qualys.sortName = p.sortName;
//            DATA_EXPORTAR_Qualys.sortOrder = p.sortOrder;

//            return JSON.stringify(DATA_EXPORTAR_Qualys);
//        },
//        responseHandler: function (res) {
//            waitingDialog.hide();
//            var data = res;
//            return { rows: data.Rows, total: data.Total };
//        },
//        onLoadSuccess: function () {
//            if (typeof fn == "function") fn();
//        },
//        onLoadError: function (status, res) {
//            waitingDialog.hide();
//            bootbox.alert("Se produjo un error al listar los registros");
//        },
//        onSort: function (name, order) {
//            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
//        },
//        onPageChange: function (number, size) {
//            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
//        }
//    });
//}

//function ExportarEquipoRegistrosQualys() {
//    let _data = $tableQualys.bootstrapTable("getData") || [];
//    if (_data.length === 0) {
//        MensajeNoExportar(TITULO_MENSAJE_Qualys);
//        return false;
//    }
//    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.so}&equivalencia=${DATA_EXPORTAR.nombre}&tipoEquipoId=${DATA_EXPORTAR.id}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
//    let url = String.Format("{0}/ExportarEquipoTecnologiasNoRegistradasQualys?equipoStr={1}&tecnologiaStr={2}&flagAprobadoEquipo={3}&flagAprobado={4}&sortName={5}&sortOrder={6}",
//        URL_API_VISTA,
//        encodeURIComponent(DATA_EXPORTAR_EQUIPO_Qualys.equipoStr),
//        encodeURIComponent(DATA_EXPORTAR_EQUIPO_Qualys.tecnologiaStr),
//        DATA_EXPORTAR_EQUIPO_Qualys.flagAprobadoEquipo || '',
//        DATA_EXPORTAR_EQUIPO_Qualys.flagAprobado || '',
//        DATA_EXPORTAR_EQUIPO_Qualys.sortName,
//        DATA_EXPORTAR_EQUIPO_Qualys.sortOrder
//    );
//    //url = encodeURIComponent(url);
//    window.location.href = url;
//}

//function ExportarRegistrosQualys() {
//    let _data = $tableQualys.bootstrapTable("getData") || [];
//    if (_data.length === 0) {
//        MensajeNoExportar(TITULO_MENSAJE_Qualys);
//        return false;
//    }
//    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.so}&equivalencia=${DATA_EXPORTAR.nombre}&tipoEquipoId=${DATA_EXPORTAR.id}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
//    let url = String.Format("{0}/ExportarTecnologiasNoRegistradasQualys?equipoId={1}&tecnologiaStr={2}&flagAprobadoEquipo={3}&flagAprobado={4}&sortName={5}&sortOrder={6}",
//        URL_API_VISTA,
//        encodeURIComponent(DATA_EXPORTAR_Qualys.equipoId),
//        encodeURIComponent(DATA_EXPORTAR_Qualys.tecnologiaStr),
//        DATA_EXPORTAR_Qualys.flagAprobadoEquipo || '',
//        DATA_EXPORTAR_Qualys.flagAprobado || '',
//        DATA_EXPORTAR_Qualys.sortName,
//        DATA_EXPORTAR_Qualys.sortOrder
//    );
//    //url = encodeURIComponent(url);
//    window.location.href = url;
//}

//function ExportarRegistrosDetalladoQualys() {
//    let _data = $tableQualys.bootstrapTable("getData") || [];
//    if (_data.length === 0) {
//        MensajeNoExportar(TITULO_MENSAJE_Qualys);
//        return false;
//    }
//    //let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.so}&equivalencia=${DATA_EXPORTAR.nombre}&tipoEquipoId=${DATA_EXPORTAR.id}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
//    let url = String.Format("{0}/ExportarTecnologiasNoRegistradasDetalladoQualys?equipoStr={1}&tecnologiaStr={2}&flagAprobadoEquipo={3}&flagAprobado={4}&sortName={5}&sortOrder={6}",
//        URL_API_VISTA,
//        encodeURIComponent(DATA_EXPORTAR_EQUIPO_Qualys.equipoStr),
//        encodeURIComponent(DATA_EXPORTAR_EQUIPO_Qualys.tecnologiaStr),
//        DATA_EXPORTAR_EQUIPO_Qualys.flagAprobadoEquipo || '',
//        DATA_EXPORTAR_EQUIPO_Qualys.flagAprobado || '',
//        DATA_EXPORTAR_EQUIPO_Qualys.sortName,
//        DATA_EXPORTAR_EQUIPO_Qualys.sortOrder
//    );
//    //url = encodeURIComponent(url);
//    window.location.href = url;
//}

//function opcionesFormatterQualys(data, row) {
//    let opciones = '';

//    //if (row.Origen != origenQualys) return opciones;
//    if (row.FlagAprobado != null) return opciones;

//    opciones = `<div class="opciones-formatter">
//                    <a href="#" class="btn btn-xs btn-success" title="Aprobar" onclick="actualizarFlagAprobadoQualys(${row.EquipoId}, '${row.QualyIds}', ${row.TecnologiaId}, '${USUARIO.CorreoElectronico}', true)">✔</a>
//                    &nbsp;
//                    <a href="#" class="btn btn-xs btn-danger" title="Rechazar" onclick="actualizarFlagAprobadoQualys(${row.EquipoId}, '${row.QualyIds}', ${row.TecnologiaId}, '${USUARIO.CorreoElectronico}', false)">✖</a>
//                </div>`;

//    return opciones;
//}

//function actualizarFlagAprobadoQualys(equipoId, qualyIds, tecnologiaId, usuario, flagAprobado) {
//    event.preventDefault();

//    bootbox.confirm({
//        title: TITULO_MENSAJE,
//        message: `¿Estás seguro de ${(flagAprobado == true ? "aprobar" : "rechazar")} el registro?`,
//        buttons: {
//            confirm: {
//                label: 'Aceptar',
//                className: 'btn-primary'
//            },
//            cancel: {
//                label: 'Cancelar',
//                className: 'btn-secondary'
//            }
//        },
//        callback: (result) => {
//            if (result == false) return;
//            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });

//            let url = `${URL_API_VISTA}/GetUpdateTecnologiaNoRegistradaQualysFlagAprobado?equipoId=${equipoId}&qualyIds=${qualyIds}&tecnologiaId=${tecnologiaId}&usuario=${usuario}&flagAprobado=${flagAprobado}`;
//            let headers = { Authorization: 'Bearer ' + localStorage.getItem('token') };
//            let init = { headers };

//            fetch(url, init)
//                .then(r => r.json())
//                .then(data => {
//                    waitingDialog.hide();
//                    if (data == true) {
//                        bootbox.alert(`Se ${(flagAprobado == true ? "aprobó" : "rechazó")} correctamente.`, listarTecNoRegQualys);

//                        return;
//                    }

//                    bootbox.alert(`Ocurrió un error`);
//                });
//        }
//    });
//}

//function InitAutocompletarTecnologiaQualys($searchBox, $IdBox, $Container) {
//    $searchBox.autocomplete({
//        appendTo: $Container,
//        minLength: 3,
//        source: function (request, response) {
//            if ($.trim(request.term) !== "") {
//                $IdBox.val("");
//                $.ajax({
//                    url: URL_API + "/Tecnologia/GetTecnologiaByClaveById",
//                    data: JSON.stringify({
//                        filtro: request.term
//                    }),
//                    dataType: "json",
//                    type: "POST",
//                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

//                    contentType: "application/json; charset=utf-8",
//                    success: function (data) {
//                        //DATA_APLICACION = data;
//                        response($.map(data, function (item) {
//                            return item;
//                        }));
//                    },
//                    async: true,
//                    global: false
//                });
//            } else
//                return response(true);
//        },
//        focus: function (event, ui) {
//            $searchBox.val(ui.item.label);
//            return false;
//        },
//        select: function (event, ui) {
//            $IdBox.val(ui.item.Id);
//            $searchBox.val(ui.item.Descripcion);
//            return false;
//        }
//    }).autocomplete("instance")._renderItem = function (ul, item) {
//        return $("<li>")
//            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
//            .appendTo(ul);
//    };
//}

//function opcionesEquipoFormatterQualys(data, row) {
//    return `<a href="javascript:buscarTecNoRegQualys(${row.EquipoId})">${data}</a>`;
//}