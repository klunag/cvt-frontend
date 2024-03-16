var $table = $("#tbl-arquetipos");
var $tblTecByArq = $("#tbl-TecByArq");
var URL_API_VISTA = URL_API + "/Arquetipo";
var ItemsRemoveAutId = [];
var DATA_EXPORTAR = {};
var CODIGO_INTERNO = 0;


$(function () {
    $tblTecByArq.bootstrapTable();
    //getTecnologias();
    initUpload($('#txtNomDiagArq'));
    validarFormArquetipo();
    validarFormTecnologiaAsociadas();
    listarArquetipos();
    FormatoCheckBox($("#divActivo"), "chkActivo");
    FormatoCheckBox($("#divFlagAutomatizado"), "chkFlagAutomatizado");
    
    InitAutocompletarTecnologia($("#txtNomTecByArq"), $("#hdTecnologiaId"), ".nomTecContainer");
    cargarCodigoInterno();
});

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

function InitAutocompletarTecnologia($searchBox, $IdBox, $container) {
    $searchBox.autocomplete({
        minLength: 3,
        appendTo: $container,
        source: function (request, response) {
            if ($.trim(request.term) !== "") {
                $IdBox.val("0");
                $.ajax({
                    url: URL_API + "/Tecnologia" + "/GetTecnologiaArquetipoByClave?filtro=" + request.term,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

                    //contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //DATA_TECNOLOGIA = data;
                        response($.map(data, function (item) {
                            return item;
                        }));
                    },
                    async: true,
                    global: false
                });
            } else {
                return response(true);
            }           
        },
        focus: function (event, ui) {
            $searchBox.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            LimpiarValidateErrores($("#formTecByArq"));
            $IdBox.val(ui.item.Id);

            var estItem = $tblTecByArq.bootstrapTable('getRowByUniqueId', ui.item.Id);

            if (estItem === null) {
                //$txtNomTecByArq.val(ui.item.Tecnologia);
                $searchBox.val('');

                $tblTecByArq.bootstrapTable('append', {
                    TecId: ui.item.Id,
                    Tecnologia: ui.item.Descripcion,
                    Dominio: ui.item.Dominio,
                    Subdominio: ui.item.Subdominio,
                    Familia: ui.item.Familia,
                    ActivoDetalle: ui.item.ActivoDetalle
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

function formatOpcTecByArq(value, row, index) {
    var iconRemove = `<a class='btn btn-danger' href='javascript: void(0)' onclick='removerItemTec("${row.TecId}")'>` +
        `<span class='icon icon-trash-o'></span>` +
        `</a>`;
    return iconRemove;
}

function removerItemTec(TecId) {
    TecId = parseInt(TecId);
    //console.log(TecId);
    ItemsRemoveAutId.push(TecId);   
    $tblTecByArq.bootstrapTable('remove', {
        field: 'TecId', values: [TecId]
    });
}

function guardarTecByArq() {
    //var itemsTec = $tblTecByArq.bootstrapTable('getData');
    if ($("#formTecByArq").valid()) {
        var itemsTec = $tblTecByArq.bootstrapTable('getData');
        var data = {};
        var _itemsTecId = itemsTec.map(x => x.TecId);
        var _arqId = $("#hIdArq").val();

        data.arqId = _arqId;
        data.itemsTecId = _itemsTecId;
        data.itemsRemoveTecId = ItemsRemoveAutId;

        $("#btnRegTecByArq").button("loading");

        $.ajax({
            url: URL_API_VISTA + "/AsociarTecnologias",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (result) {
                var response = result;
                if (response) {
                    toastr.success("Se relacionó correctamente", "Arquetipo de Tecnología");
                    $("#txtBusArq").val('');
                    listarArquetipos();
                    //$table.bootstrapTable('refresh');
                }
                else
                    toastr.error('Ocurrio un problema', 'Arquetipo de Tecnología');
            },
            complete: function () {
                $("#btnRegTecByArq").button("reset");
                $("#MdTecByArq").modal('hide');
            },
            error: function (xhr, ajaxOptions, thrownError) {
                ControlarErrorAjax(xhr, ajaxOptions, thrownError);
            }
        });
    }   
}

function BuscarArquetipo() {
    listarArquetipos();
}

function limpiarMdAddOrEditArquetipo() {
    LimpiarValidateErrores($("#formAddOrEditArq"));
    $("#txtNomArq").val('');
    $("#txtDesArq").val('');
    $("#flDiagArq").val('');
    $("#hdArchivoId").val('');
    $("#chkActivo").prop("checked", true);
    $("#chkActivo").bootstrapToggle("on");
    $("#chkFlagAutomatizado").prop("checked", false);
    $("#chkFlagAutomatizado").bootstrapToggle("off");
    $("#txtNomDiagArq").val(TEXTO_SIN_ARCHIVO);
    $("#hdRutaArchivo").val();
    $("#cbEntorno").val(-1);
    $("#cbTipo").val(-1);
    $("#txtCodArq").val('');

    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
}

//Open modal: true
//Close modal: false
function MdAddOrEditArquetipo(EstadoMd) {
    limpiarMdAddOrEditArquetipo();
    if (EstadoMd)
        $("#MdAddOrEditArq").modal(opcionesModal);
    else
        $("#MdAddOrEditArq").modal('hide');
}

function validarFormArquetipo() {

    $.validator.addMethod("existeCodigo", function (value, element) {
        //debugger;
        let estado = true;
        if ($.trim(value) !== "") {
            let estado = false;
            estado = !ExisteCodigo();
            //debugger;
            return estado;
        }
        return estado;
    });

    $("#formAddOrEditArq").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtNomArq: {
                requiredSinEspacios: true
            },
            txtDesArq: {
                requiredSinEspacios: true
            },
            cbEntorno: {
                requiredSelect: true
            },
            cbTipo: {
                requiredSelect: true
            },
            txtCodArq: {
                requiredSinEspacios: true,
                existeCodigo: true
            }
        },
        messages: {
            txtNomArq: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el nombre")
            },
            txtDesArq: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "la descripción")
            },
            cbEntorno: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el entorno")
            },
            cbTipo: {
                requiredSelect: String.Format("Debes seleccionar {0}.", "el tipo de arquetipo")
            },
            txtCodArq: {
                requiredSinEspacios: String.Format("Debes ingresar {0}.", "el código"),
                existeCodigo: "Código ya existe"
            }
        }
    });
}


function validarFormTecnologiaAsociadas() {

    $.validator.addMethod("existeTecnologia", function (value, element) {
        // debugger
        let estado = true;
        if ($.trim(value) !== "" && $.trim(value).length >= 3) {
            estado = ExisteTecnologia();
            return estado;
        }
        return estado;
    });

    $.validator.addMethod("requiredMinTecnologia", function (value, element) {
        // debugger
        let minRegistro = $tblTecByArq.bootstrapTable('getData');
        //debugger;
        let estado = minRegistro.length > 0 ? true : false;

        return estado;
    });


    $("#formTecByArq").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            //txtNomTecByArq: {
            //    existeTecnologia: true
            //},
            msjValidTbl: {
                requiredMinTecnologia: true
            }
        },
        messages: {
            //txtNomTecByArq: {
            //    existeTecnologia: String.Format("{0} seleccionada no existe.", "la tecnología")
            //},
            msjValidTbl: {
                requiredMinTecnologia: String.Format("Debes agregar {0}.", "una tecnología como mínimo")
            }
        }
    });
}

function ExisteTecnologia() {
    let estado = false;
    //let nombre = $("#txtTecnologia").val();
    let Id = $("#hdTecnologiaId").val();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Tecnologia" + `/ExisteTecnologia?Id=${Id}`,
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

function listarArquetipos() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Codigo',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusArq").val());
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

function CambiarEstado(ArquetipoId) {
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
                    url: `${URL_API_VISTA}/CambiarEstado?Id=${ArquetipoId}`,
                    dataType: "json",
                    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                    success: function (dataObject, textStatus) {
                        if (textStatus === "success") {
                            if (dataObject !== null) {
                                toastr.success("Se cambió el estado correctamente", "Arquetipo de Tecnología");
                                $("#txtBusArq").val('');
                                listarArquetipos();
                            }                          
                        }
                        else {
                            toastr.success("Hubo un inconveniente al procesar los datos, por favor vuelva a intentar", "Arquetipo de Tecnología");
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        ControlarErrorAjax(xhr, ajaxOptions, thrownError);
                    },
                    complete: function (data) {
                        //$("#txtBusArq").val('');
                        //$table.bootstrapTable('refresh');
                    }
                });
            }
        }
    });
}

function linkFormatterName(value, row, index) {
    return `<a href="javascript:EditArquetipo(${row.Id})" title="Editar">${value}</a>`;
}

function linkFormatterTec(value, row, index) {
    return `<a href="javascript:IrTecnologias(${row.Id})" title="Ver tecnologias">${value}</a>`;
}

function opciones(value, row, index) {
    let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let type_icon = row.Activo ? "check" : "unchecked";
    let estado = `<a href="javascript:CambiarEstado(${row.Id})" title="Cambiar estado"><i style="" id="cbOpcArq${row.Id}" class="${style_color} glyphicon glyphicon-${type_icon}"></i></a>`;
    return estado;
}

function EditArquetipo(ArquetipoId) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        url: URL_API_VISTA + "/" + ArquetipoId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            waitingDialog.hide();
            $("#titleFormArq").html("Editar Arquetipo");
            MdAddOrEditArquetipo(true);

            $("#hIdArq").val(result.Id);
            $("#txtNomArq").val(result.Nombre);
            $("#txtDesArq").val(result.Descripcion);
            $("#cbEntorno").val(result.EntornoId);
            $("#cbTipo").val(result.TipoArquetipoId);
            $("#txtCodArq").val(result.Codigo);
            $("#chkFlagAutomatizado").prop('checked', result.Automatizado);
            $('#chkFlagAutomatizado').bootstrapToggle(result.Automatizado ? 'on' : 'off');
            $("#chkActivo").prop('checked', result.Activo);
            $('#chkActivo').bootstrapToggle(result.Activo ? 'on' : 'off');
            if (result.ArchivoId !== null) {
                $("#txtNomDiagArq").val(result.ArchivoStr);
                $("#hdArchivoId").val(result.ArchivoId);
                $("#btnDescargarFile").show();
                $("#btnEliminarFile").show();
                //$(".div-controls-file").show();
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function DescargarArchivo() {
    DownloadFile($("#hdArchivoId").val(), $("#txtNomDiagArq"), "Arquetipo de Tecnologías");
}

function AddArquetipo() {
    $("#titleFormArq").html("Nuevo Arquetipo");
    $("#hIdArq").val('');
    MdAddOrEditArquetipo(true);
}

function GuardarAddOrEditArquetipo() {
    if ($("#formAddOrEditArq").valid()) {
        $("#btnRegArq").button("loading");

        var arquetipo = {};
        arquetipo.Id = ($("#hIdArq").val() === "") ? 0 : parseInt($("#hIdArq").val());
        arquetipo.Nombre = $("#txtNomArq").val().trim();
        arquetipo.Descripcion = $("#txtDesArq").val();
        arquetipo.EntornoId = $("#cbEntorno").val();
        arquetipo.TipoArquetipoId = $("#cbTipo").val();
        arquetipo.Codigo = $("#txtCodArq").val();
        arquetipo.Automatizado = $("#chkFlagAutomatizado").prop("checked");
        arquetipo.Activo = $("#chkActivo").prop("checked");    

        $.ajax({
            url: URL_API_VISTA,
            type: "POST",
            data: arquetipo,
            dataType: "json",
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

            success: function (result) {
                var data = result;
                if (data > 0) {
                    let archivoId = $("#hdArchivoId").val() === "" ? 0 : parseInt($("#hdArchivoId").val());
                    if ((archivoId === 0 && $("#txtNomDiagArq").val() !== TEXTO_SIN_ARCHIVO) || archivoId > 0) {
                        UploadFile($("#flDiagArq"), CODIGO_INTERNO, data, archivoId);
                    }
                    toastr.success("Registrado correctamente", "Arquetipo de Tecnología");
                    //ListarRegistros();
                }              
            },
            complete: function () {
                $("#btnRegArq").button("reset");
                listarArquetipos();
                MdAddOrEditArquetipo(false);
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    }
}

function IrTecnologias(ArqId) {
    LimpiarValidateErrores($("#formTecByArq"));
    ItemsRemoveAutId = [];
    $("#hIdArq").val(ArqId);
    $("#txtNomTecByArq").val('');
    $tblTecByArq.bootstrapTable('removeAll');

    ListarTecByArq(ArqId);
}

function ListarTecByArq(ArqId) {
    $.ajax({
        url: URL_API_VISTA + "/ObtenerTecnologias/" + ArqId,
        type: "GET",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {
            if (result.length > 0) {
                var data = result;
                var itemTecReg = [];
                $.each(data, function (index, val) {
                    var item = {};
                    item.TecId = val.Id;
                    item.Tecnologia = val.Tecnologia;
                    item.Dominio = val.Dominio;
                    item.Subdominio = val.Subdominio;
                    item.Familia = val.Familia;
                    item.ActivoDetalle = val.ActivoDetalle;
                    itemTecReg.push(item);
                });
                $tblTecByArq.bootstrapTable('destroy');
                $tblTecByArq.bootstrapTable({
                    data: itemTecReg,
                    pagination: true,
                    pageNumber: 1,
                    pageSize: 10
                });
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }, complete: function () {
            //getTecnologias();
            $("#MdTecByArq").modal(opcionesModal);
        }
    });
}

function ExportarInfo() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        //bootbox.alert("No hay datos para exportar.");
        bootbox.alert({
            size: "small",
            title: "Arquetipos de Tecnologías",
            message: "No hay datos para exportar.",
            buttons: {
                ok: {
                    label: 'Aceptar',
                    className: 'btn-primary'
                }
            }
        });
        return false;
    }
    //let filtro = $("#hFilArq").val();
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

function cargarCodigoInterno() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ObtenerCodigoInterno",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                if (dataObject != null) {
                    SetItems(dataObject.Entorno, $("#cbEntorno"), TEXTO_SELECCIONE);
                    SetItems(dataObject.TipoArquetipo, $("#cbTipo"), TEXTO_SELECCIONE);
                    CODIGO_INTERNO = dataObject.CodigoInterno;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function EliminarArchivo() {
    $("#txtNomDiagArq").val(TEXTO_SIN_ARCHIVO);
    $("#flDiagArq").val("");
    $("#btnDescargarFile").hide();
    $("#btnEliminarFile").hide();
    //$(".div-controls-file").hide();
}

function ExisteCodigo() {
    let estado = false;
    let codigo = $("#txtCodArq").val();
    let Id = $("#hIdArq").val() === "" ? 0 : parseInt($("#hIdArq").val());
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Arquetipo" + `/ExisteCodigoByFiltro?codigo=${codigo}&id=${Id}`,
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