var $table = $("#tbl-dominios");
var URL_API_VISTA = URL_API + "/Dominio";
var $tableSub = $("#tbl-SubByDom");
var DATA_EXPORTAR = {};
var DATOS_RESPONSABLE = {};
var TITULO_MENSAJE = "Dominios de Tecnología";

$(function () {
    validarForms();
    validarFormModalMatricula();
    listarDominios();
    FormatoCheckBox($("#divCbCalObsDom"), "cbCalObsDom");
    FormatoCheckBox($("#divActivo"), "chkActivo");
    $("#chkActivo").change(function () {
        $("#formAddOrEditDominio").validate().resetForm();
    });

    //InitAutocompletarMatricula($("#txtOwnDom"), null, $(".matriculaContainer"));

});
function BuscarDominio() {
    listarDominios();
}

//Open Modal: true
//Close Modal: false
function MdAddOrEditDominio(EstadoMd) {
    limpiarMdAddOrEditDominio();    
    //$("#formAddOrEditDominio").validate().resetForm();
    if (EstadoMd)
        $("#MdAddOrEditDominio").modal(opcionesModal);
    else
        $("#MdAddOrEditDominio").modal('hide');
}

function limpiarMdAddOrEditDominio() {
    LimpiarValidateErrores($("#formAddOrEditDominio"));
    $("#txtNomDom").val('');
    $("#txtDesDom").val('');
    $("#txtEquiDom").val('');
    $("#txtOwnDom").val('');
    $("#lblUsuario").html('');
    $("#cbCalObsDom").prop("checked", true);
    $("#cbCalObsDom").bootstrapToggle("on");
    $("#chkActivo").prop("checked", true);
    $("#chkActivo").bootstrapToggle("on");
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
        if ($.trim(value) !== "" && $.trim(value).length > 2) {
            estado = ExisteMatricula(value);
            return estado;
        }
        return estado;
    });

    $("#formAddOrEditDominio").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomDom: {
                requiredSinEspacios: true
            },
            txtDesDom: {
                requiredSinEspacios: true
            },
            txtEquiDom: {
                requiredSinEspacios: true
            },
            txtOwnDom: {
                requiredSinEspacios: true                
            },
            msjActivo: {
                hasTecAsociadas: true
            }
        },
        messages: {
            txtNomDom: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtDesDom: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
            txtEquiDom: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre del equipo")
            },
            txtOwnDom: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el dueño del dominio")                
            },
            msjActivo: {
                hasTecAsociadas: "Estado no posible"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtOwnDom") {
                element.parent().parent().parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function listarDominios() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
        method: 'POST',

        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        pagination: true,
        locale: 'es-SP',
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Nombre',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusDominio").val());
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

function AddDominio() {
    $("#titleFormDominio").html("Nuevo Dominio");
    $("#hIdDom").val('');
    $("#hdNumTecAsoc").val("0");
    MdAddOrEditDominio(true);
}

function EditDominio(DominioId, NumSubdominios) {
    $.ajax({
        url: URL_API_VISTA + "/" + DominioId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            $("#titleFormDominio").html("Editar Dominio");
            MdAddOrEditDominio(true);

            $("#hIdDom").val(result.Id);
            $("#hdNumTecAsoc").val(NumSubdominios);
            $("#txtNomDom").val(result.Nombre);
            $("#txtDesDom").val(result.Descripcion);
            $("#txtEquiDom").val(result.NombreEquipo);
            $("#txtOwnDom").val(result.MatriculaDueno);
            $("#hidMatricula").val(result.MatriculaDueno);
            $("#cbCalObsDom").prop('checked', result.CalculoObs);
            $('#cbCalObsDom').bootstrapToggle(result.CalculoObs ? 'on' : 'off');
            $("#chkActivo").prop('checked', result.Activo);
            $('#chkActivo').bootstrapToggle(result.Activo ? 'on' : 'off');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function GuardarAddOrEditDominio() {
    $(".form-control").removeClass("ignore");

    if ($("#formAddOrEditDominio").valid()) {
        $("#btnRegDominio").button("loading");

        var dominio = {};
        dominio.Id = ($("#hIdDom").val() === "") ? 0 : parseInt($("#hIdDom").val());
        dominio.Nombre = $("#txtNomDom").val().trim();
        dominio.Descripcion = $("#txtDesDom").val();
        dominio.NombreEquipo = $("#txtEquiDom").val();
        dominio.MatriculaDueno = $("#txtOwnDom").val();
        dominio.CalculoObs = $("#cbCalObsDom").prop("checked"); //is(':checked');
        dominio.Activo = $("#chkActivo").prop("checked"); //$("#chkActivo").is(':checked');

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            data: dominio,
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (result) {
                console.log(result);
                toastr.success("Registrado correctamente", TITULO_MENSAJE);
                $("#txtBusDominio").val('');
                $table.bootstrapTable('refresh');
            },
            complete: function (data) {
                //if (data.responseJSON) { }
                $("#btnRegDominio").button("reset");
                MdAddOrEditDominio(false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }
}

function linkFormatterName(value, row, index) {
    return `<a href="javascript:EditDominio(${row.Id}, ${row.NumSubdominios})" title="Editar">${value}</a>`;
}

function linkFormatterSub(value, row, index) {
    return `<a href="javascript:MostrarSubdominios(${row.Id},${value})" title="Ver subdominios">${value}</a>`;
}

function optCambiarDom(value, row, index) {
    return `<a href="javascript:GetDominios(${row.Id})" title="Cambiar dominio">Cambiar dominio</a>`;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:CambiarEstado(${row.Id}, ${row.NumSubdominios})" title="Cambiar estado"><i style="" id="cbOpcDom${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;

    //var estado = "";
    //var checked = "";

    //if (row.Activo)
    //    checked = "checked='checked'";

    //estado = `<label class='custom-control custom-control-primary custom-checkbox'>
    //                        <input id='cbOpcDom${row.Id}' class='custom-control-input' type='checkbox' ${checked} onclick='CambiarEstado(${row.Id}, ${row.NumSubdominios})'>
    //                        <span class='custom-control-indicator'></span>
    //              </label>`;

    return estado;
}

function CambiarEstado(DominioId, NumSubdominios) {
    if (NumSubdominios > 0) {
        bootbox.alert({
            size: "small",
            title: "Dominios de Tecnologías",
            message: "No se puede cambiar el estado debido que existen otras entidades que tienen relación.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    } else {
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
                        url: `${URL_API_VISTA}/CambiarEstado?Id=${DominioId}`,
                        dataType: "json",
                        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                        success: function (dataObject, textStatus) {
                            if (textStatus === "success") {
                                if (dataObject !== null) {
                                    toastr.success("Se cambió el estado correctamente", TITULO_MENSAJE);
                                    listarDominios();
                                }                               
                            }
                            else {
                                toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", TITULO_MENSAJE);
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                        },
                        complete: function (data) {
                            $("#txtBusDominio").val('');
                            //$table.bootstrapTable('refresh');                          
                        }
                    });
                } else {
                    //$(`#cbOpcDom${DominioId}`).prop('checked', !estado);
                }
            }
        });
    }
}

function MostrarSubdominios(DominioId, numSub) {
    if (numSub === 0) {
        bootbox.alert({
            size: "small",
            title: TITULO_MENSAJE,
            message: "No presenta subdominios asociados",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
    } else {
        ListarSubdomByDom(DominioId);
        $("#hIdSubByDom").val(DominioId);
        $("#MdSubByDom").modal(opcionesModal);
    }
}

function GetDominios(SubdominioId) {
    $.ajax({
        url: URL_API_VISTA,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            var data = result;
            var lstdom = [];
            fitem = { text: '-- Elegir un dominio --', value: '' };
            lstdom.push(fitem);

            $.each(data, function (key, val) {
                var item = { text: val.Nombre, value: val.Id };
                lstdom.push(item);
            });

            var locale = {
                OK: 'Correcto',
                CONFIRM: 'Registrar',
                CANCEL: 'Cancelar'
            };

            bootbox.addLocale('custom', locale);
            bootbox.prompt({
                size: 'small',
                title: 'Cambio de dominio',
                locale: 'custom',
                message: '<p>Dominio:</p>',
                inputType: 'select',
                inputOptions: lstdom,
                className: "my-modal",
                callback: function (result) {
                    if (result !== null && result !== '') {
                        var DomId = result;
                        var SubdomId = SubdominioId;
                        CambiarDominio(SubdomId, DomId);
                    }

                    if (result === '')
                        bootbox.alert("No se realizo ningun cambio");
                }
            });

            $(".bootbox-input-select").val($("#hIdSubByDom").val());
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
    });
}

function CambiarDominio(SubdomId, DomId) {
    var data = {};
    data.SubdominioId = SubdomId;
    data.DominioId = DomId;

    $.ajax({
        url: URL_API_VISTA + "/CambiarDominio",
        type: "POST",
        data: data,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (result) {
            console.log(result);
            bootbox.alert("Se cambio el dominio con exito!");
            RefreshTableSub();
            $table.bootstrapTable('refresh');
        },
        complete: function () {
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
    });
}

function ListarSubdomByDom(Id) {
    $tableSub.bootstrapTable('destroy');
    $tableSub.bootstrapTable({
        url: URL_API_VISTA + "/Subdominio",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            var pageNumber = p.pageNumber;
            var pageSize = p.pageSize;
            return JSON.stringify({
                nombre: Id,
                pageNumber: pageNumber,
                pageSize: pageSize
            });
        },
        responseHandler: function (res) {
            console.log(res);
            var data = res;
            return { rows: data.Rows, total: data.Total };
        }
    });
}

function RefreshTableSub() {
    $tableSub.bootstrapTable('refresh');
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        MensajeNoExportar(TITULO_MENSAJE);
        return false;
    }
    //let filtro = $("#hFilDom").val();
    let url = `${URL_API_VISTA}/Exportar?nombre=${DATA_EXPORTAR.nombre}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;
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
    //$(".form-control").addClass("ignore");
    //$(".inputMatricula").removeClass("ignore");
    //$(".form-control").removeClass("ignore");
    //$(".form-control").addClass("ignore");
    //$(".posibleMatricula").removeClass("ignore");
    //$(".inputMatricula").removeClass("ignore");

    $(".posibleMatricula").removeClass("ignore");

    if ($("#formValidarMatricula").valid()) {

        $("#btnValidarMatricula").button("loading");

        let comboMatricula = $("#cbMatricula").val();
        $("#txtOwnDom").val(comboMatricula);

        let datos = {};
        datos = ObtenerDatosUsuarioByMatricula(comboMatricula);
        
        $("#lblUsuario").html(datos.Nombres);
        $("#hidMatricula").val(datos.Matricula);

        RegistrarMatricula(datos);

        $("#btnValidarMatricula").button("reset");
        $("#mdValidarMatricula").modal('hide');
    }
}

function ValidarMatricula2() {
    $(".form-control").addClass("ignore");
    $(".inputMatricula").removeClass("ignore");

    if ($("#formAddOrEditDominio").valid()) {
        $("#lblUsuario").html(DATOS_RESPONSABLE.Nombres);
        $("#hidMatricula").val(DATOS_RESPONSABLE.Matricula);
        RegistrarMatricula(DATOS_RESPONSABLE);
        //ObtenerDatosByMatricula($("#txtOwnSubdom"), $("#lblUsuario"));
    }
}


function InitAutocompletarMatricula($searchBox, $IdBox, $Container) {
    $searchBox.autocomplete({
        appendTo: $Container,
        minLength: 3,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                //$IdBox.val("0");
                $.ajax({
                    url: URL_LOGIN_SERVER + `/ObtenerDatosUsuariosAutocomplete?criterio=${request.term}`,
                    //data: JSON.stringify({
                    //    filtro: request.term
                    //}),
                    //dataType: "json",
                    type: "GET",
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
            //$IdBox.val(ui.item.Id);
            $searchBox.val(ui.item.Descripcion);
            //obtenerFamiliaById(ui.item.Id);
            return false;
        }
    }).autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append("<a style='display: block'><font>" + item.Descripcion + "</font></a>")
            .appendTo(ul);
    };
}


function irModalMatricula() {
    $(".form-control").addClass("ignore");
    $(".inputMatricula").removeClass("ignore");

    if ($("#formAddOrEditDominio").valid()) {
        let filtro = $("#txtOwnDom").val();
        
        $.ajax({
            url: URL_LOGIN_SERVER + `/ObtenerDatosUsuariosAutocomplete?criterio=${filtro}`,
            type: "GET",
            success: function (data) {
                LimpiarValidateErrores($("#formValidarMatricula"));
                SetItems(data, $("#cbMatricula"), TEXTO_SELECCIONE);
                $("#mdValidarMatricula").modal(opcionesModal);
                //console.log(data);
                //response($.map(data, function (item) {
                //    console.log(item);
                //    return item;
                //}));
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
            //async: true,
            //global: false
        });
    }
}

function validarFormModalMatricula() {
    $("#formValidarMatricula").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            cbMatricula: {
                requiredSelect: true
            }
        },
        messages: {
            cbMatricula: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "la matrícula")
            }
        }
    });
}


function ObtenerDatosUsuarioByMatricula(Matricula) {
    //let estado = false;
    let data = {};
    let matricula = Matricula;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_LOGIN_SERVER + `/ObtenerDatosUsuario?correoElectronico=${matricula}`,
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    data = dataObject;
                    //DATOS_RESPONSABLE = dataObject;
                    //let EstadoUser = dataObject.Estado;
                    //estado = EstadoUser !== 1 ? false : true;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
    return data;
}