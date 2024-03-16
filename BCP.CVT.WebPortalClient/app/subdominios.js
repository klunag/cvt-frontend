var $table = $("#tbl-subdom");
var $tableTec = $("#tbl-TecBySub");
var $tblSubdomEq = $("#tblSubdomEq");
var URL_API_VISTA = URL_API + "/Subdominio";
var urlApiDom = URL_API + "/Dominio";

var DATA_EXPORTAR = {};
var DATA_EXPORTAR_TEC = {};
var DATA_EXPORTAR_SUBEQ = {};
var REGISTROS_ASOCIADOS = [];
var DATA_DOMINIOS = [];
var ItemsRemoveTecEqId = [];
var DATOS_RESPONSABLE = {};
const TITULO_MENSAJE = "Subdominio de Tecnología";

$(function () {
    GetDominios($("#cbFiltroDom"));
    GetDominios($("#cbDom"));

    //getSubdominios();

    $("#cbDom").on('change', function () {
        getMatriculaDueno(this.value);
    });

    $tblSubdomEq.bootstrapTable();

    validarForms();
    validarFormEquivalencias();
    listarSubdominios();

    //$("#chkActivo").prop("checked");

    InitCheckBox();

    $("#chkActivo").change(function () {
        //$(".form-control").addClass("ignore");
        //$(".clActivo").removeClass("ignore");
        LimpiarValidateErrores($("#formAddOrEditSubdom"));
        //$("#formAddOrEditSubdom").validate().resetForm();
        //console.log($(this).prop('checked'));
        //alert("The text has been changed.");
    });

    //InitAutocompletarSubdominiosEquivalentes($("#txtNomSubdomEq"), $("#hIdSubdom"), $(".eqContainer"));
});

function InitCheckBox() {
    FormatoCheckBox($("#divCbCalObsSubDom"), "cbCalObsSubdom");
    FormatoCheckBox($("#divActivo"), "chkActivo");
    FormatoCheckBox($("#divIsVisible"), "cbIsVisible");
}

function BuscarSubdom() {
    listarSubdominios();
    //$table.bootstrapTable('refresh');
}

function getMatriculaDueno(id) {
    $.ajax({
        url: urlApiDom + "/ObtenerMatricula/" + id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            var data = result;
            $("#txtOwnSubdom").val(data);
        },
        complete: function () {

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function GetDominios(CbDom) {
    var $dominios = CbDom;

    $dominios.append($('<option></option')
        .attr('value', '')
        .text('Cargando...'));

    $.ajax({
        url: urlApiDom,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        dataType: "json",
        success: function (result) {
            var data = result;
            DATA_DOMINIOS = data;
            $dominios.find("option:gt(0)").remove();

            $.each(data, function (i, item) {
                $dominios.append($('<option>', {
                    value: item.Id,
                    text: item.Nombre
                }));
            });
        },
        complete: function () {

        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

//Open Modal: true
//Close Modal: false
function MdAddOrEditSubdom(EstadoMd) {
    limpiarMdAddOrEditSubdom();
    $("#formAddOrEditSubdom").validate().resetForm();
    if (EstadoMd)
        $("#MdAddOrEditSubdom").modal(opcionesModal);
    else
        $("#MdAddOrEditSubdom").modal('hide');
}

function limpiarMdAddOrEditSubdom() {
    $("#cbDom").val(-1);
    $("#txtNomSubdom").val('');
    $("#txtDesSubdom").val('');
    $("#txtOwnSubdom").val('');
    $("#txtPesSubdom").val('');
    $("#lblUsuario").html('');
    $("#cbCalObsSubdom").prop("checked", true);
    $("#cbCalObsSubdom").bootstrapToggle("on");
    $("#chkActivo").prop("checked", true);
    $("#chkActivo").bootstrapToggle("on");

    $("#cbIsVisible").prop("checked", true);
    $("#cbIsVisible").bootstrapToggle("on");
}


function validarForms() {

    $.validator.addMethod("hasTecAsociadas", function (value, element) {
        let estado = false;
        let numTecAsoc = parseInt($("#hdNumTecAsoc").val());
        let cbActivo = $("#chkActivo").prop("checked");
        if ((cbActivo === true && numTecAsoc > 0) || numTecAsoc === 0)
            estado = true;

        return estado;
    });

    $.validator.addMethod("existeMatricula", function (value, element) {
        let estado = true;
        if ($.trim(value) !== "") {
            estado = ExisteMatricula(value);
            console.log(estado);
            return estado;
        }
        return estado;
    });

    $("#formAddOrEditSubdom").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbDom: {
                requiredSinEspacios: true
            },
            txtNomSubdom: {
                requiredSinEspacios: true
            },
            txtDesSubdom: {
                requiredSinEspacios: true
            },
            txtPesSubdom: {
                requiredSinEspacios: true,
                number: true
            },
            msjActivo: {
                hasTecAsociadas: true
            },
            txtOwnSubdom: {
                requiredSinEspacios: true
            }
        },
        messages: {
            cbDom: {
                requiredSinEspacios: String.Format("Debes seleccionar {0}.", "el dominio")
            },
            txtNomSubdom: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtDesSubdom: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
            txtPesSubdom: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el peso"),
                number: "Debes ingresar número"
            },
            msjActivo: {
                hasTecAsociadas: "Estado no posible"
            },
            txtOwnSubdom: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el dueño del dominio")
            }
        },
        //errorPlacement: (error, element) => {
        //    if (element.attr('name') === "txtOwnSubdom") {
        //        element.parent().parent().parent().append(error);
        //    } else {
        //        element.parent().append(error);
        //    }
        //}
    });
}

function validarFormEquivalencias() {

    //$.validator.addMethod("requiredMinEquivalencia", function (value, element) {
    //    let minSubdomEq = $tblSubdomEq.bootstrapTable('getData');
    //    let estado = minSubdomEq.length > 0 ? true : false;

    //    return estado;
    //});

    $("#formSubdomEq").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomSubdomEq: {
                required: true
            }
        },
        messages: {
            txtNomSubdomEq: {
                required: String.Format("Debes registrar {0}.", "una equivalencia")
            }
        }
    });
}

function AddSubdom() {
    $("#titleFormSubdom").html("Nuevo Subdominio");
    $("#hIdSubdom").val('');
    $("#hdNumTecAsoc").val("0");
    MdAddOrEditSubdom(true);
}

function EditSubdom(SubdomId, NumTecAsociadas) {
    $.ajax({
        url: URL_API_VISTA + "/" + SubdomId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            //console.log(result.DomIdAsociado);
            $("#titleFormSubdom").html("Editar Subdominio");
            MdAddOrEditSubdom(true);
            $("#hIdSubdom").val(result.Id);
            $("#hdNumTecAsoc").val(NumTecAsociadas);
            //debugger;
            $("#cbDom").val(result.DomIdAsociado);
            $("#txtNomSubdom").val(result.Nombre);
            $("#txtDesSubdom").val(result.Descripcion);
            $("#txtPesSubdom").val(result.Peso);
            $("#txtOwnSubdom").val(result.MatriculaDueno);
            $("#hidMatricula").val(result.MatriculaDueno);
            $("#cbCalObsSubdom").prop('checked', result.CalculoObs);
            $("#cbCalObsSubdom").bootstrapToggle(result.CalculoObs ? 'on' : 'off');
            $("#chkActivo").prop('checked', result.Activo);
            $("#chkActivo").bootstrapToggle(result.Activo ? 'on' : 'off');

            let isVisible = result.IsVisible || false;
            $("#cbIsVisible").prop('checked', isVisible);
            $("#cbIsVisible").bootstrapToggle(isVisible ? 'on' : 'off');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function GuardarAddOrEditSubdom() {
    //$(".form-control").removeClass("ignore");
    $(".form-control").removeClass("ignore");

    if ($("#formAddOrEditSubdom").valid()) {
        $("#btnRegSubdom").button("loading");

        var sdom = {};
        sdom.Id = ($("#hIdSubdom").val() === "") ? 0 : parseInt($("#hIdSubdom").val());
        sdom.DomIdAsociado = $("#cbDom").val();
        sdom.Nombre = $("#txtNomSubdom").val().trim();
        sdom.Descripcion = $("#txtDesSubdom").val();
        sdom.Peso = $("#txtPesSubdom").val();
        sdom.MatriculaDueno = $("#txtOwnSubdom").val();
        sdom.CalculoObs = $("#cbCalObsSubdom").prop("checked"); //is(':checked');
        sdom.Activo = $("#chkActivo").prop("checked");
        sdom.IsVisible = $("#cbIsVisible").prop("checked");

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            data: sdom,
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            dataType: "json",
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                $("#txtBusSubdom").val('');
                $("#cbFiltroDom").val(-1);
                $table.bootstrapTable('refresh');
            },
            complete: function () {
                $("#btnRegSubdom").button("reset");
                MdAddOrEditSubdom(false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function listarSubdominios() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        pagination: true,

        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusSubdom").val());
            DATA_EXPORTAR.id = $("#cbFiltroDom").val();
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

function linkFormatterName(value, row, index) {
    return `<a href="javascript:EditSubdom(${row.Id}, ${row.NumTecAsociadas})" title="Editar">${value}</a>`;
}

//function linkFormatterDom(value, row, index) {
//    return `<a href="javascript:IrDominio()" title="Dominio">${value}</a>`;
//}

function linkFormatterTec(value, row, index) {
    return `<a href="javascript:IrTecnologias(${row.Id},${value})" title="Ver tecnologias">${value}</a>`;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:CambiarEstado(${row.Id}, '${row.NumTecAsociadas}')" title="Cambiar estado"><i style="" id="cbOpcSubdom${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    let equivalencia = `  <a class='btn' href='javascript: void (0)' onclick='irSubdominiosEquivalentes(${row.Id}, "${row.Nombre}", "${row.DomNomAsociado}", ${row.Activo})' title='Equivalencias de Subdominios'>` +
        `<span class="icon icon-list-ul ${style_color}"></span>` +
        `</a >`;

    return estado.concat("&nbsp;&nbsp;", equivalencia);
}

function CambiarEstado(SubdomId, NumTec) {
    //REGISTROS_ASOCIADOS = [];
    //var estado = ValidarRegAsociados(SubdomId);
    //if (estado) {                
    //    var inicioTbl = "<table class='table'><thead><tr><th>Entidades</th><th>Cantidad de registros</th></tr></thead><tbody>";       
    //    var finTbl = "</tbody></table>";
    //    var bodyTbl = "";
    //    $.each(REGISTROS_ASOCIADOS, function (i, item) {                              
    //        var cols = "";
    //        cols += '<tr><td>'+ item.Nombre + '</td>';
    //        cols += '<td>'+ item.CantidadRegistros +'</td></tr>';           
    //        bodyTbl += cols;        
    //    });
    //    var mensaje = inicioTbl.concat(bodyTbl).concat(finTbl);
    //    bootbox.alert({
    //        size: "large",
    //        title: "Registros asociados al Subdominio Seleccionado",
    //        buttons: {
    //            ok: {
    //                label: 'Aceptar',
    //                className: 'btn-primary'
    //            }
    //        },
    //        message: mensaje         
    //    });
    //} 

    if (NumTec > 0) {
        bootbox.alert({
            size: "small",
            title: TITULO_MENSAJE,
            message: "No se puede cambiar el estado debido que existen otras entidades que tienen relación.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    }
    else {
        bootbox.confirm({
            message: "¿Estás seguro que deseas cambiar el estado del registro seleccionado?",
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
                if (result) {
                    $.ajax({
                        type: 'GET',
                        contentType: "application/json; charset=utf-8",
                        url: `${URL_API_VISTA}/CambiarEstado?Id=${SubdomId}`,
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    LimpiarFiltros();
                                    listarSubdominios();
                                }
                            }
                            else {
                                toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        }
                    });
                }
            }
        });
    }
}

function LimpiarFiltros() {
    $("#cbFiltroDom").val(-1);
    $("#txtBusSubdom").val("");
}

function ValidarRegAsociados(SubdomId) {
    var estado;
    $.ajax({
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ValidarRegistrosAsociados/" + SubdomId,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            let data = result;
            REGISTROS_ASOCIADOS = data;
            let flag = data.find(x => x.CantidadRegistros > 0) || null;
            estado = flag === null ? false : true;
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function (xhr, textStatus) {
            //if (textStatus === 'success') {
            //    $("#cbFiltroDom").val(-1);
            //    $("#txtBusSubdom").val('');
            //    $table.bootstrapTable('refresh');
            //}         
        },
        async: false
    });

    return estado;
}

function IrTecnologias(SubdomId, numTec) {
    if (numTec === 0) {
        bootbox.alert("No presenta tecnologias asociados");
    } else {
        $("#hIdS").val(SubdomId);
        $("#txtNomTecBySub").val('');
        ListarTecBySub(SubdomId);
    }
}

//function IrDominio() {
//    alert("En construccion...");
//}

function ListarTecBySub() {
    $tableTec.bootstrapTable('destroy');
    $tableTec.bootstrapTable({
        url: URL_API_VISTA + "/Tecnologias",
        method: "POST",
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: "server",
        queryParamsType: "else",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "FechaCreacion",
        sortOrder: "desc",
        queryParams: function (p) {
            DATA_EXPORTAR_TEC = {};
            DATA_EXPORTAR_TEC.nombre = $("#txtNomTecBySub").val();
            DATA_EXPORTAR_TEC.id = $("#hIdS").val();
            DATA_EXPORTAR_TEC.pageNumber = p.pageNumber;
            DATA_EXPORTAR_TEC.pageSize = p.pageSize;
            DATA_EXPORTAR_TEC.sortName = p.sortName;
            DATA_EXPORTAR_TEC.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_TEC);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onSort: function (name, order) {
            waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        },
        onLoadSuccess: function (data) {
            $("#MdTecBySub").modal(opcionesModal);
        }
    });
}

function BuscarTecBySub() {
    $tableTec.bootstrapTable('refresh');
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }
    let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre}&dominioId=${DATA_EXPORTAR.id}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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
function exportarTecAsociadas() {
    let _data = $tableTec.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar("Relación de tecnologías asociadas al subdominio");
        return false;
    }
    let url = `${URL_API_VISTA}/ExportarTecAsociadas?nombre=${DATA_EXPORTAR_TEC.nombre}&subdominioId=${DATA_EXPORTAR_TEC.id}&sortName=${DATA_EXPORTAR_TEC.sortName}&sortOrder=${DATA_EXPORTAR_TEC.sortOrder}`;
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

function irSubdominiosEquivalentes(SubdomId, NombreStr, DominioStr, FlagActivo) {
    // if (EstadoStr === 'Aprobado') {
    if (FlagActivo) {
        $("#hIdSubdom").val(SubdomId);
        $("#hdDominioStr").val(DominioStr);
        $("#txtNomSubdomEq").val('');
        $("#spNomSubdom").text(NombreStr);
        $tblSubdomEq.bootstrapTable('removeAll');
        LimpiarValidateErrores($("#formSubdomEq"));
        ItemsRemoveTecEqId = [];
        listarSubdominiosEquivalentes();
    }
}

function listarSubdominiosEquivalentes() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $tblSubdomEq.bootstrapTable('destroy');
    $tblSubdomEq.bootstrapTable({
        url: URL_API_VISTA + "/ListarSubdominiosEquivalentes",
        method: 'POST',
        pagination: true,
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'DominioId',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR_SUBEQ = {};
            //DATA_EXPORTAR.nombre = $.trim($("#txtBusSubdom").val());
            DATA_EXPORTAR_SUBEQ.id = $("#hIdSubdom").val();
            DATA_EXPORTAR_SUBEQ.pageNumber = p.pageNumber;
            DATA_EXPORTAR_SUBEQ.pageSize = p.pageSize;
            DATA_EXPORTAR_SUBEQ.sortName = p.sortName;
            DATA_EXPORTAR_SUBEQ.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR_SUBEQ);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;
            return { rows: data.Rows, total: data.Total };
        },
        onLoadSuccess: function (data) {
            $("#mdSubdomEq").modal(opcionesModal);
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

function InitAutocompletarSubdominiosEquivalentes($searchBox, $IdBox, $containerBox) {
    $searchBox.autocomplete({
        minLength: 0,
        appendTo: $containerBox,
        source: function (request, response) {
            $.ajax({
                url: URL_API_VISTA + "/ObtenerSubdominiosEquivalentesByFiltro",
                data: JSON.stringify({
                    filtro: request.term,
                    id: $("#hIdSubdom").val() === "" ? 0 : parseInt($("#hIdSubdom").val())
                }),
                dataType: "json",
                type: "POST",
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    //DATA_APLICACION = data;
                    response($.map(data, function (item) {
                        //console.log(item);
                        return item;
                    }));
                    //response(data);
                },
                async: true,
                global: false
            });
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $searchBox.val('');
            //$IdBox.val(ui.item.Id);
            LimpiarValidateErrores($("#formSubdomEq"));
            var estItem = $tblSubdomEq.bootstrapTable('getRowByUniqueId', ui.item.Id);
            if (estItem === null) {
                //debugger;
                var dataTmp = $tblSubdomEq.bootstrapTable('getData');
                var idx = 0;
                var ultId = dataTmp.length === 0 ? (1 * -1000) : dataTmp[dataTmp.length - 1].EquivalenciaSubdomId;
                ultId = ultId === null ? 0 : ultId;
                idx = ultId > 0 ? dataTmp.length * -1000 : ultId - 1000;

                $tblSubdomEq.bootstrapTable('append', {
                    Id: idx,
                    SubdominioId: $("#hIdSubdom").val(),
                    SubdominioNombre: $("#spNomSubdom").text(),
                    DominioNombre: $("#hdDominioStr").val(),
                    EquivalenciaSubdomId: ui.item.Id,
                    EquivalenciaSubdomNombre: ui.item.Descripcion,
                    Activo: ui.item.Activo,
                    FechaCreacion: null,
                    UsuarioCreacion: null,
                    FechaModificacion: null,
                    FechaModificacionStr: "",
                    UsuarioModificacion: null,
                    ActivoDetalle: ui.item.Activo ? "Activo" : "Inactivo"
                });
            }
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}

function formatOpcSubdomEq(value, row, index) {
    var btnTrash = `  <a class='btn btn-danger' href='javascript: void(0)' onclick='removeItemSubdomEq(${row.Id})'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return btnTrash;
}

function removeItemSubdomEq(id) {
    bootbox.confirm("¿Estás seguro que deseas eliminar la equivalencia seleccionada?", function (result) {
        if (result) {
            let data = {
                Id: id,
            };

            $.ajax({
                url: URL_API_VISTA + "/CambiarFlagEquivalencia",
                type: "POST",
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(data),
                dataType: "json",
                success: function (result) {
                    if (result) {
                        toastr.success("La operación se realizó correctamente", TITULO_MENSAJE);
                        listarSubdominiosEquivalentes();
                    }
                    else {
                        toastr.error("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                },
                complete: function (data) {
                    //RefrescarListado();
                }
            });

        }
    });
}

function guardarSubdominiosEquivalentes() {
    LimpiarValidateErrores($("#formSubdomEq"));
    //$("#formTecByArq").validate().resetForm();
    if ($("#formSubdomEq").valid()) {
        var _subdomId = $("#hIdSubdom").val();
        var equivalencia = $("#txtNomSubdomEq").val();

        let data = {
            Id: _subdomId,
            Equivalencia: equivalencia,
        };
        $("#btnRegSubdomEq").button("loading");

        $.ajax({
            url: URL_API_VISTA + "/AsociarSubdominioEquivalencia",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (result) {
                var response = result;
                if (response) {
                    toastr.success("Se relacionó correctamente", TITULO_MENSAJE);
                    $("#txtNomSubdomEq").val('');
                    listarSubdominiosEquivalentes();
                }
                else
                    toastr.error('Ocurrio un problema', TITULO_MENSAJE);
            },
            complete: function () {
                $("#btnRegSubdomEq").button("reset");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function ExisteMatricula(Matricula) {
    let estado = false;
    let matricula = Matricula;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_LOGIN_SERVER + `/ObtenerDatosUsuario?correoElectronico=${matricula}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    DATOS_RESPONSABLE = dataObject;
                    let EstadoUser = dataObject.Estado;
                    estado = EstadoUser !== 1 ? false : true;
                    //estado = dataObject;
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

function ValidarMatricula() {
    $(".form-control").addClass("ignore");
    $(".inputMatricula").removeClass("ignore");

    if ($("#formAddOrEditSubdom").valid()) {
        $("#lblUsuario").html(DATOS_RESPONSABLE.Nombres);
        $("#hidMatricula").val(DATOS_RESPONSABLE.Matricula);
        RegistrarMatricula(DATOS_RESPONSABLE);
        //ObtenerDatosByMatricula($("#txtOwnSubdom"), $("#lblUsuario"));
    }
}