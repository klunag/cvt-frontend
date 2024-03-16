var $table = $("#tblRegistro");
var $tableModal = $('#tblModal');
var confirmarAPT = '';
var DATA_EXPORTAR = {};
var LIST_MODAL_NIVEL1 = [];
var LIST_SUBDOMINIO = [];
const URL_API_VISTA = URL_API + "/Relacion/infoapli";
const URL_API_COMBO = URL_API + "/Producto";
const comboMultiSelect = [
    { SelectId: "#cbSoportado", DataField: "Soportado" },
    { SelectId: "#cbBusDominioTecnologia", DataField: "Soportado" },
    { SelectId: "#cbBusSubDominioTecnologia", DataField: "Soportado" },
    { SelectId: "#cbBusJefe", DataField: "Soportado" },
    { SelectId: "#cbBusLider", DataField: "Soportado" }
];


$(function () {
    getCurrentUser();

    InitSelectMultiple(comboMultiSelect.map(x => x.SelectId));
    $tableModal.bootstrapTable();
    $("#txtBuscar").keyup(BuscarModal);
    CargarComboJefe();
    cargarComboLider();
    InitAutocompletarBuilder($("#txtAplicacion"), $("#hAplicacion"), ".appContainer", "/Aplicacion/GetAplicacionByFiltro?filtro={0}");
    setDefaultHd($("#txtAplicacion"), $("#hAplicacion"));
    ListarCombos(() => {
        $("#cbBusDominioTecnologia").change(CargarSubDominioBusqueda);
    });
    CargarCombosGuardicore();
    Listar();
});

$(document).ajaxComplete(function (e) {
    if (userCurrent != null) {
        if (userCurrent.PerfilId != 1) {
            $("#fAdmin").hide();
        }
    }
});

$('#ModalInfo').on('hidden.bs.modal', function (e) {
    $("#txtBuscar").val("");
});


function CargarCombosGuardicore() {
    let url = URL_API_VISTA + '/ComboSoportado';
    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            if (data !== null) {
                SetItemsMultiple(data.soportado.filter(x => x !== "" && x !== null), $("#cbSoportado"), TEXTO_TODOS, TEXTO_TODOS, true);
            }
        }, complete: function (xhr, status) {
            waitingDialog.hide();
        }
    });
}

function CargarComboJefe() {
    let url = URL_API_VISTA + '/ComboJefe';
    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            if (data !== null) {
                SetItemsMultiple(data.soportado.filter(x => x !== "" && x !== null), $("#cbBusJefe"), TEXTO_TODOS, TEXTO_TODOS, true);
            }
        }, complete: function (xhr, status) {
            waitingDialog.hide();
        }
    });
}

function cargarComboLider() {
    let url = URL_API_VISTA + '/ComboLider';
    $.ajax({
        url: url,
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            if (data !== null) {
                SetItemsMultiple(data.soportado.filter(x => x !== "" && x !== null), $("#cbBusLider"), TEXTO_TODOS, TEXTO_TODOS, true);
            }
        }, complete: function (xhr, status) {
            waitingDialog.hide();
        }
    });
}

function ListarCombos(fn = null) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_COMBO + "/TecnologiaOwner/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    LIST_SUBDOMINIO = dataObject.SubDominio;
                    //SetItems(dataObject.EstadoObsolescencia, $("#cbBusEstadoObsolescenciaProducto"), TEXTO_TODOS);
                    SetItemsMultiple(dataObject.Dominio, $("#cbBusDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
                    SetItemsMultiple(LIST_SUBDOMINIO.map(x => x), $("#cbBusSubDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);

                    if (typeof fn == "function") fn();
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function CargarSubDominioBusqueda() {
    let dominioId = $("#cbBusDominioTecnologia").val() || [];
    let listSubDominio = LIST_SUBDOMINIO.filter(x => dominioId.some(y => y == x.TipoId) || dominioId.length == 0);
    SetItemsMultiple(listSubDominio, $("#cbBusSubDominioTecnologia"), TEXTO_TODOS, TEXTO_TODOS, true);
    //SetItems(listSubDominio, $("#cbBusSubDominioTecnologia"), TEXTO_TODOS);
}

function clickInfo() {
    var estado = $("#detalleInfo").css('display');

    if (estado == 'none') {
        $("#detalleInfo").show();
    } else {
        $("#detalleInfo").hide();
    }
}

function Listar() {
    let dominioIds = ($("#cbBusDominioTecnologia").val() || []).join(',');
    let subDominioIds = ($("#cbBusSubDominioTecnologia").val() || []).join(',');
    let jefe = ($("#cbBusJefe").val() || []).join(',');
    let lider = ($("#cbBusLider").val() || []).join(',');
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        ajax: "ListaAjax",
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            return JSON.stringify({
                soportado: CaseIsNullSendFilter($("#cbSoportado").val()),
                codigoAPT: $("#hAplicacion").val(),
                dominio: dominioIds,
                subdominio: subDominioIds,
                jefe: jefe,
                lider: lider,
                pageNumber: p.pageNumber,
                pageSize: p.pageSize
            });
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            if (res != null) {
                var data = res;
                if (data.Total > 0) {
                    return { rows: data.Rows, total: data.Total };
                } else {
                    $table.bootstrapTable('destroy');
                    bootbox.alert("No cuenta con un rol para validar aplicaciones o esta no cuenta con aplicaciones relaciones.");
                }
            }
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

function ListaAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API_VISTA + `/Listado?soportado=${tmp_params.soportado}&codigoAPT=${tmp_params.codigoAPT}&dominio=${tmp_params.dominio}&subdominio=${tmp_params.subdominio}&comboJE=${tmp_params.jefe}&comboLU=${tmp_params.lider}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}`;
    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            params.success(data)
        }, complete: function (xhr, status) {
            waitingDialog.hide();
        }
    });
}

function opcionesFormatter(value, row, index) {
    let btn1 = `<a href="javascript:dataDetalle('${row.CodigoAPT}')" title="Confirmar Validación"><i class="glyphicon glyphicon-ok"></i></a>`;
    let btn2 = `<a href="javascript:ModalHistorial('${row.CodigoAPT}');" title="Historial de movimiento de la aplicación"><i class="glyphicon glyphicon-file"></i></a>`;
    return btn1.concat("&nbsp;&nbsp;", btn2);
}

function dateFormat2(value, row, index) {
    if (value != null && value != '') {
        return moment(value).format('DD/MM/YYYY HH:mm:ss');
    }
    return "-";
}

function ModalPropiedad(EstadoMd) {
    if (EstadoMd)
        $("#ModalInfo").modal(opcionesModal);
    else
        $("#ModalInfo").modal("hide");
}

function ModalBoton(EstadoMd) {
    if (EstadoMd) {
        $("#btnRegistrar").show();
        $("#txtBuscar").show();
    } else {
        $("#txtBuscar").hide();
        $("#btnRegistrar").hide();
    }
}

function BuscarModal() {
    let valor = $("#txtBuscar").val();

    let resultados = LIST_MODAL_NIVEL1.filter(function (x) {
        return (x.subdominio || '').toLowerCase().includes(valor.toLowerCase()) || (x.detalle || []).some(y => (y.tipoComponente || '').toLowerCase().includes(valor.toLowerCase()) ||
            (y.nombreComponente || '').toLowerCase().includes(valor.toLowerCase()) ||
            (y.ambiente || '').toLowerCase().includes(valor.toLowerCase()) ||
            (y.tecnologia || '').toLowerCase().includes(valor.toLowerCase()))
    });

    $tableModal.bootstrapTable("load", resultados.map(x => x));
}

function dataDetalle(value) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#titleForm").html("Detalle de información técnica");
    $("#appSelect").html("Aplicacion seleccionada: " + value);
    $("#detalleInfo").html("Revisa toda la información a nivel de servidores, servicio nube, tecnologías, si todo está conforme presiona <strong>confirmar validación</strong>, en caso de haya algo que corregir ingresa a la bandeja de entrada en el menú Relaciones y formatos > Bandeja de aprobación, para actualizar las relaciones que sean necesarias.");
    ModalPropiedad(true);
    ModalBoton(true);
    $.ajax({
        url: URL_API_VISTA + `/Detalle/Listado?codigoAPT=${value}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (result) {
            LIST_MODAL_NIVEL1 = (result.Rows || []).map(x => x);
            console.log(LIST_MODAL_NIVEL1);
            ModalDetalle(result, value)
        }, complete: function (xhr, status) {
            waitingDialog.hide();
        }
    });
}

function ModalDetalle(datos, value) {

    confirmarAPT = value;

    var columns = [];

    columns.push({
        field: 'subdominio',
        title: 'Subdominios'
    });

    columns.push({
        field: 'cantidad',
        title: 'Cantidad de Tecnologías Relacionadas'
    });

    $tableModal.bootstrapTable('destroy');
    $tableModal.bootstrapTable({
        data:datos.Rows,
        columns: columns,
        detailView: true,
        showHeader: true,
        onExpandRow: function (index, row, $detail) {
            Nivel1($detail.html('<table></table>').find('table'), row.detalle);
        }
    });
}

function Nivel1($el,idSub) {
    var columns = [];

    columns.push({
        field: 'tipoComponente',
        title: 'Tipo de componente'
    });

    columns.push({
        field: 'nombreComponente',
        title: 'Nombre de componente'
    });

    columns.push({
        field: 'ambiente',
        title: 'Ambiente'
    });

    columns.push({
        field: 'tecnologia',
        title: 'Tecnología'
    });

    $el.bootstrapTable({
        data: idSub,
        columns: columns,
        detailView: false,
        showHeader: true
    });

    //$el.bootstrapTable({
    //    columns: columns,
    //    locale: "es-SP",
    //    ajax: "ListadoDetalleTecnicoNivel1",
    //    detailView: false,
    //    showHeader: true,
    //    pagination: true,
    //    sidePagination: 'server',
    //    queryParamsType: 'else',
    //    pageSize: REGISTRO_PAGINACION,
    //    pageList: OPCIONES_PAGINACION,
    //    queryParams: function (p) {
    //        return JSON.stringify({
    //            username: correo,
    //            codigoAPT: APT,
    //            subdominio: idSub,
    //            pageNumber: p.pageNumber,
    //            pageSize: p.pageSize
    //        });
    //    },
    //    responseHandler: function (res) {
    //        waitingDialog.hide();
    //        var data = res;
    //        return { rows: data.Rows, total: data.Total };
    //    },
    //    onLoadError: function (status, res) {
    //        waitingDialog.hide();
    //        bootbox.alert("Se produjo un error al listar los registros");
    //    },
    //    onSort: function (name, order) {
    //        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    //    },
    //    onPageChange: function (number, size) {
    //        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    //    }
    //});
}

//function ListadoDetalleTecnicoNivel1(params) {
//    let tmp_params = JSON.parse(params.data);
//    let url = URL_API_VISTA + `/Detalle/DetalleApp?username=${tmp_params.username}&codigoAPT=${tmp_params.codigoAPT}&subdominio=${tmp_params.subdominio}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}`;
//    $.get(url).then(function (res) {
//        params.success(res)
//    });
//}


function ModalHistorial(CodigoAPT) {

    var columns = [];

    columns.push({
        field: 'CodigoAPT',
        title: 'Codigo de aplicacion'
    });

    columns.push({
        field: 'NombreAPT',
        title: 'Aplicacion'
    });

    columns.push({
        field: 'FechaValida',
        title: 'fecha de validación',
        formatter: FechaFormatter
    });

    columns.push({
        field: 'UsuarioModificacion',
        title: 'Usuario que valido'
    });

    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $("#titleForm").html("Historial de movimiento de la aplicación");
    $("#appSelect").html("Aplicacion seleccionada: " + CodigoAPT);
    $("#detalleInfo").html("");
    ModalPropiedad(true);
    ModalBoton(false);
    $tableModal.bootstrapTable('destroy');
    $tableModal.bootstrapTable({
        ajax: "HistoricaListaAjax",
        columns: columns,
        pagination: true,
        detailView: false,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            return JSON.stringify({
                codigoAPT: CodigoAPT,
                pageNumber: p.pageNumber,
                pageSize: p.pageSize
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
        }
    });
}

function HistoricaListaAjax(params) {
    let tmp_params = JSON.parse(params.data);
    let url = URL_API_VISTA + `/Historico/Listado?codigoAPT=${tmp_params.codigoAPT}&pageNumber=${tmp_params.pageNumber}&pageSize=${tmp_params.pageSize}`;
    $.ajax({
        url: url,
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (data, status, xhr) {
            params.success(data)
        }, complete: function (xhr, status) {
            waitingDialog.hide();
        }
    });
}

function confirmar() {
    bootbox.confirm("¿Revistaste que todas las relaciones de tu aplicación están correctamente registradas?", (result) => {
        if (result && confirmarAPT != '') {
            let url = URL_API_VISTA + `/Detalle/ValidarApp?codigoAPT=${confirmarAPT}`;
            $.ajax({
                url: url,
                contentType: "application/json; charset=utf-8",
                beforeSend: function (xhr) {
                    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
                    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
                },
                success: function (data, status, xhr) {
                    Listar();
                }, complete: function (xhr, status) {
                    waitingDialog.hide();
                    ModalPropiedad(false);
                }
            });
        }
    });
}

function exportar() {
    var soportado = CaseIsNullSendFilter($("#cbSoportado").val());
    var codigoAPT = $("#hAplicacion").val();
    let dominioIds = ($("#cbBusDominioTecnologia").val() || []).join(',');
    let subDominioIds = ($("#cbBusSubDominioTecnologia").val() || []).join(',');
    let jefe = ($("#cbBusJefe").val() || []).join(',');
    let lider = ($("#cbBusLider").val() || []).join(',');

    let url = `${URL_API_VISTA}/Reporte/ExportarAplicacionValidacion?soportado=${soportado}&codigoAPT=${codigoAPT}&dominio=${dominioIds}&subdominio=${subDominioIds}&comboJE=${jefe}&comboLU=${lider}`;
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

function FechaFormatter(value, row, index) {
    var fecha = moment(value).format('DD/MM/YYYY HH:mm:ss');
    return `${fecha}`;
}