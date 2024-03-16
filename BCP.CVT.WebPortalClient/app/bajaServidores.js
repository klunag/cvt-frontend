var URL_API_VISTA = URL_API + "/Equipo";
var $table = $("#tblServidores");
const TITULO_MENSAJE = "Baja de Servidores";
const MENSAJE_COMPLETAR = "Se ejecutará la carga previa para la inactivación de los servidores del listado seleccionados. ¿Estás seguro de continuar?  ";
const MENSAJE_PROCESAR = "El campo Ticket del excel que está cargando debe contener valores. Si este campo está en blanco no se continuará con el proceso de baja para ese servidor. Este módulo solo procesa información de servidores";
var dataListExcel = [];
var OPCIONES_PAGINACION_THIS = "[10000]";
let cantServCargados = 0;
let cantFilasExe = 0;
let cantFilasSelecionadas = 0;
var lstTickets = [];
let cantLoadExcel = 0;

var DATA_EXPORTAR = {};
$(function () {
    InitInputFiles();
    validarFormFile();
    validarForm();
    $("#btnCompletarProceso").click(irCompletar);
    $("#btnProcesar").click(irProcesarExcel);

    $table.find('th[data-field="Ticket"]').attr('name', 'Ticket');

    // Agregar una función para manejar cambios en los checkboxes
    $('#tblServidores').on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function (e, rows) {
        // Acciones que se ejecutarán cuando cambie el estado de los checkboxes
        var selectedRows = $('#tblServidores').bootstrapTable('getSelections');
        // Puedes realizar acciones con las filas seleccionadas, por ejemplo:
        cantFilasSelecionadas = selectedRows.length;
        $("#cantidadAProcesar").text(cantFilasSelecionadas);
        console.log("Filas seleccionadas:", selectedRows);
    });
});

function ProcesarInfo() {
    listarRegistros();
}


function LimpiarInfo() {
    $("#txtArchivo").val("");
    $('#flArchivo').prop('disabled', false);
    $("#flArchivo").val("");
    $('#btnProcesar').hide();
    $("#cardTable").hide();
    cantServCargados = 0;
    cantFilasExe = 0;
    cantLoadExcel = 0;
    cantFilasSelecionadas = 0;
    lstTickets = [];
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        data: [],
        pagination: true,
        sidePagination: "client",
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: "Nombre",
        sortOrder: "asc",
    });
}

function listarRegistros() {

    var lstServidores = dataListExcel.map(function (item) { return item.NombreServidor_WO; }).join('|');
    var NombreArchivo = $("#txtArchivo").val();

    if ($("#formCargaFile").valid()) {
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            url: URL_API_VISTA + "/BajaServidores",
            method: 'POST',
            ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

            pagination: true,
            sidePagination: "server",
            queryParamsType: "else",
            pageSize: dataListExcel.length,
            pageList: OPCIONES_PAGINACION_THIS,
            sortName: "Nombre",
            sortOrder: "asc",
            queryParams: function (p) {
                DATA_EXPORTAR = {};
                DATA_EXPORTAR.lstServidores = lstServidores;
                DATA_EXPORTAR.NombreArchivo = NombreArchivo;
                DATA_EXPORTAR.pageNumber = p.pageNumber;
                DATA_EXPORTAR.pageSize = dataListExcel.length;
                DATA_EXPORTAR.sortName = p.sortName;
                DATA_EXPORTAR.sortOrder = p.sortOrder;
                return JSON.stringify(DATA_EXPORTAR);
            },
            responseHandler: function (res) {
                waitingDialog.hide();
                $("#btnCompletarProceso").show();
                $("#cardTable").show();
                $("#btnLimpiar").show();
                var data = res;
                cantServCargados = data.Total;
                $("#cantidadAProcesar").text(cantServCargados);
                MensajeGeneralAlert(TITULO_MENSAJE, "Se cargó el archivo correctamente con " + cantFilasExe + " filas. Se encontró informacion de " + cantServCargados + " servidores");
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
            }, async: false
        });


        $table.bootstrapTable('hideColumn', 'Id');

        $("#cantidadRegistroExcel").text(cantFilasExe);
    }
}

function irCompletar() {
    let existenIdSelecionados = obtenerIDsSeleccionados();
    if (existenIdSelecionados == "") {
        MensajeGeneralAlert(TITULO_MENSAJE, "Debe selecionar al menos 1 un servidor de la lista");
    } else {
        if ($("#formBajaServidores").valid()) {
            bootbox.confirm({
                title: TITULO_MENSAJE,
                message: MENSAJE_COMPLETAR,
                buttons: SET_BUTTONS_BOOTBOX,
                callback: function (result) {
                    result = result || null;
                    if (result !== null && result) {
                        sendDataFormAPI($("#btnCompletarProceso"), true);
                    }
                }
            });
        }
    }
}

function irProcesarExcel() {
    if ($("#formCargaFile").valid()) {
        bootbox.confirm({
            title: TITULO_MENSAJE,
            message: MENSAJE_PROCESAR,
            buttons: SET_BUTTONS_BOOTBOX,
            callback: function (result) {
                result = result || null;
                if (result !== null && result) {
                    listarRegistros();
                }
            }
        });
    }
}

function obtenerIDsSeleccionados() {
    var selecciones = $table.bootstrapTable('getSelections');
    var idsSeleccionados = selecciones.map(function (fila) {
        return fila.Id;
    });
    return idsSeleccionados.join('|');
}

function sendDataFormAPI($btn, aprobado) {
    if ($btn !== null) {
        $btn.button("loading");
        waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    }

    let data = {
        lstServidores: obtenerIDsSeleccionados(),
        NombreArchivo: $("#txtArchivo").val()
    };
    $.ajax({
        url: URL_API_VISTA + "/InsertarBajaServidores",
        type: "POST",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    if (dataObject == "ok") {
                        toastr.success("Se registraron la baja de los servidores seleccionados", TITULO_MENSAJE);
                        waitingDialog.hide();
                        setTimeout(function () {
                            location.reload();
                        }, 3000);
                    }
                    else {
                        MensajeGeneralAlert(TITULO_MENSAJE, "Se ha encontrado un inconveniente en la baja de los servidores seleccionados, vuelve a intentarlo.");
                    }
                }
            }
        },
        complete: function (data) {
            if ($btn !== null) {
                $btn.button("reset");
                waitingDialog.hide();
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        }
    });
}

function InitInputFiles() {
    InitUpload($('#txtArchivo'), 'inputArchivo');
}

function InitUpload($inputText, classInput) {
    var inputs = document.querySelectorAll(`.${classInput}`);

    Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
            labelVal = label.innerHTML;
        input.addEventListener('change', function (e) {
            var fileName = '';
            var validExtensions = ['xlsx'];
            if (this.files && this.files.length == 1) {
                var fileExtension = this.files[0].name.split('.').pop().toLowerCase();
                if (validExtensions.indexOf(fileExtension) !== -1) {
                    fileName = this.files[0].name;
                    $('#flArchivo').prop('disabled', true);
                    $("#btnProcesar").show();
                    // Leer el contenido del archivo XLSX
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var data = e.target.result;
                        var workbook = XLSX.read(data, { type: 'binary' });
                        var sheetName = workbook.SheetNames[0]; // Suponiendo que quieres leer la primera hoja

                        var sheet = workbook.Sheets[sheetName];
                        var jsonDataExcel = XLSX.utils.sheet_to_json(sheet);
                        cantLoadExcel = cantLoadExcel + 1;
                        dataListExcel.length = 0;
                        cantFilasExe = 0;
                        for (var i = 0; i < jsonDataExcel.length; i++) {
                            cantFilasExe = cantFilasExe + 1;
                            var nombreServidor = jsonDataExcel[i]["NombreServidor"] == undefined ? "" : jsonDataExcel[i]["NombreServidor"];
                            var ticket = jsonDataExcel[i]["Ticket"];
                            var combinedValue = nombreServidor + "¬" + ticket;
                            if (ticket == undefined) {
                            } else {
                                if (!lstTickets.includes(ticket)) {
                                    dataListExcel.push({ "NombreServidor_WO": combinedValue });
                                }
                                lstTickets.push(ticket);
                            }
                        }
                        let cantRegistroaDB = dataListExcel.length;
                        if (cantRegistroaDB == 0) {
                            if (cantLoadExcel == 1) {
                                MensajeGeneralAlert(TITULO_MENSAJE, "El Excel no cuenta con nombres de servidores");
                                this.value = '';
                                $('#flArchivo').prop('disabled', false);
                                $("#btnProcesar").hide();
                            }
                        }

                    };
                    reader.readAsBinaryString(this.files[0]);
                } else {
                    MensajeGeneralAlert(TITULO_MENSAJE, "Por favor, seleccione un archivo Excel (con extensión .xlsx)");
                    this.value = '';
                }
            }
            fileName = e.target.value.split('\\').pop();

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

function validarFormFile() {
    $.validator.addMethod("validExtension", function (value, element) {
        var fileExtension = value.split('.').pop().toLowerCase();
        return this.optional(element) || validExtensions.indexOf(fileExtension) !== -1;
    }, 'Por favor, seleccione un archivo con extensión .xlsx');

    $("#formCargaFile").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            txtArchivo: {
                validExtension: true
            }
        },
        messages: {
            txtArchivo: {
                validExtension: "Por favor, seleccione un archivo con extensión .xlsx"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "txtArchivo") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}

function validarForm() {
    $.validator.addMethod("requiredCheck", function (value, element) {
        return $("input[name='btSelectItem']:checked").length > 0;
    }, "Por favor, selecciona al menos un elemento");

    $("#formBajaServidores").validate({
        validClass: "my-valid-class",
        errorClass: "my-error-class",
        ignore: ".ignore",
        highlight: function (element) {
            $(element).removeClass("my-error-class");
        },
        rules: {
            btSelectItem: {
                requiredCheck: true
            }
        },
        messages: {
            btSelectItem: {
                requiredCheck: "Debe seleccionar un elemento del listado"
            }
        },
        errorPlacement: (error, element) => {
            if (element.attr('name') === "btSelectItem") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        }
    });
}
