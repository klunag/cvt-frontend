var $table = $("#tbl-config");
var URL_API_VISTA = URL_API + "/Configuracion";
var DATA_EXPORTAR = {};
var LISTADO_DATA = [];

$(function () {
    //FormatoCheckBox($("#divActivo"), 'cbActTipo');
    //$("#cbActTipo").change(function () {
    //    $("#formAddOrEditTipo").validate().resetForm();
    //});
    //validarFormTipo();
    FormatoCheckBox($("#divActConfig"), 'cbActConfig');
    //$("#cbActTipo").change(function () {
    //    $("#formAddOrEditTipo").validate().resetForm();
    //});
    listarConfiguracion();

    $table.on('expand-row.bs.table', function (e, index, row, $detail) {
        //if (row.NroAlertasDetalle != 0) {
        ListarParametrosXTipo(row.Id, $('#tblRegistrosDetalle_' + row.Id), $detail);
        //} else {
        //    $detail.empty().append("No existen registros.");
        //}

    });
});

function validarFormTipo() {

    $.validator.addMethod("hasTecAsociadas", function (value, element) {
        let estado = false;
        let numTecAsoc = parseInt($("#hdNumTecAsoc").val());
        let cbActivo = $("#cbActTipo").prop("checked");
        if ((cbActivo === true && numTecAsoc > 0) || numTecAsoc === 0)
            estado = true;

        return estado;
    });

    $("#formAddOrEditTipo").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomTipo: {
                requiredSinEspacios: true
            },
            txtDesTipo: {
                requiredSinEspacios: true
            },
            msjActivo: {
                hasTecAsociadas: true
            }
        },
        messages: {
            txtNomTipo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtDesTipo: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
            msjActivo: {
                hasTecAsociadas: "Estado no posible"
            }
        }
    });
}

function limpiarMdAddOrEditConfig() {
    $("#txtParConfig").val('');
    $("#txtDesConfig").val('');
    $("#txtValConfig").val('');
    $("#cbActConfig").prop('checked', true);
    $("#cbActConfig").bootstrapToggle('on');
}

function MdAddOrEditConfig(EstadoMd) {
    limpiarMdAddOrEditConfig();
    LimpiarValidateErrores($("#formAddOrEditConfig"));
    if (EstadoMd)
        $("#MdAddOrEditConfig").modal(opcionesModal);
    else
        $("#MdAddOrEditConfig").modal('hide');
}

function buscarConfiguracion() {
    listarConfiguracion();
}

function listarConfiguracion() {
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
        pageSize: 99999,
        pageList: OPCIONES_PAGINACION,
        sortName: 'FechaModificacion',
        sortOrder: 'desc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusConfig").val());
            DATA_EXPORTAR.pageNumber = p.pageNumber;
            DATA_EXPORTAR.pageSize = p.pageSize;
            DATA_EXPORTAR.sortName = p.sortName;
            DATA_EXPORTAR.sortOrder = p.sortOrder;

            return JSON.stringify(DATA_EXPORTAR);
        },
        responseHandler: function (res) {
            waitingDialog.hide();
            var data = res;

            LISTADO_DATA = data.Rows;
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

function linkFormatter(value, row, index) {
    return `<a href="javascript:EditarParametro(${row.Id})" title="Editar">${value}</a>`;
}

function opciones(value, row, index) {
    var estado = "";
    var checked = "";

    if (row.Activo)
        checked = "checked='checked'";

    estado = `<label class='custom-control custom-control-primary custom-checkbox'>
                            <input id='cbOpcConfig${row.Id}' class='custom-control-input' type='checkbox' ${checked} onclick='cambiarEstado(${row.Id})'> 
                            <span class='custom-control-indicator'></span>
                  </label>`;

    return estado;
}

function EditarParametro(id) {
    $("#titleFormConfig").html("Configurar parámetro");
    $.ajax({
        url: URL_API_VISTA + "/" + id,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            MdAddOrEditConfig(true);

            $("#hdConfigId").val(id);
            $("#txtParConfig").val(result.Codigo);
            $("#txtDesConfig").val(result.Descripcion);
            $("#txtValConfig").val(result.Valor);
            $("#cbActConfig").prop('checked', result.Activo);
            $('#cbActConfig').bootstrapToggle(result.Activo ? 'on' : 'off');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function ActualizarParametro() {
    if ($("#formAddOrEditConfig").valid()) {
        $("#btnRegConfig").button("loading");

        var config = {};
        config.Id = ($("#hdConfigId").val() === "") ? 0 : parseInt($("#hdConfigId").val());
        config.Descripcion = $("#txtDesConfig").val();
        config.Valor = $("#txtValConfig").val();

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            data: config,
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", "Configuración de Parámetros");
            },
            complete: function () {
                $("#btnRegConfig").button("reset");
                //$("#txtBusConfig").val('');
                $table.bootstrapTable('refresh');
                MdAddOrEditConfig(false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function detailFormatter(index, row) {

    var html = String.Format('<table id="tblRegistrosDetalle_{0}"  data-mobile-responsive="true" data-check-on-init="true"  data-pagination="true"  data-page-size="10" data-page-list="[10, 20, 50, 100, 200]"\  >\
                            <thead>\
                                <tr>\
                                    <th data-formatter="rowNumFormatter" data-halign="center" data-valign="middle" data-align="center" data-width="30">#</th>\
                                    <th data-formatter="linkFormatter" data-field="Codigo" data-sortable="true" data-halign="center" data-valign="middle" data-align="left" data-sort-name="Codigo" data-width="300">Nombre</th>\
                                    <th data-field="Descripcion" data-sortable="true" data-halign="center" data-valign="middle" data-align="left" data-sort-name="Descripcion"  data-width="320">Descripción</th>\
                                    <th data-field="Valor" data-sortable="true" data-halign="center" data-valign="middle" data-align="left" data-sort-name="Valor"   >Valor</th>\
                                    <th data-field="FechaHoraModificacionFormato" data-sortable="true" data-halign="center" data-valign="middle" data-align="center"  data-sort-name="FechaModificacion" data-width="175">Fecha Modificación</th>\
                                </tr>\
                            </thead>\
                        </table>', row.Id);

    return html;
}

function ListarParametrosXTipo(id, $table, $detail) {

    var returnedData = $.grep(LISTADO_DATA, function (element, index) {
        return element.Id === id;
    });

    if (returnedData.length !== 0) {
        $table.bootstrapTable({ "data": returnedData[0].Parametros });
    } else {
        $detail.empty().append("No existen registros.");
    }

}