var $table = $("#tblVTecnologia");
var URL_API_VISTA = URL_API + "/VistaTecnologia";
var DATA_EXPORTAR = {};

$(function () {
    CargarCombos();

    $("#cbFilDom").on('change', function () {
       // if (this.value !== "-1") {
            listarSubdominiosByDominio(this.value);
        //}      
    });
    
    listarRegistros();

});

function buscarRegistros() {
    listarRegistros();
}

function listarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },

        sortName: 'FechaCreacion',
        sortOrder: 'desc',
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.nombre = $.trim($("#txtBusTec").val());
            DATA_EXPORTAR.domId = $("#cbFilDom").val();
            DATA_EXPORTAR.subdomId = $("#cbFilSub").val();
            DATA_EXPORTAR.aplica = $("#txtFilAplica").val();
            DATA_EXPORTAR.codigo = $("#txtFilCodigo").val();
            DATA_EXPORTAR.dueno = $("#txtFilDueno").val();
            DATA_EXPORTAR.equipo = $("#txtFilEquipo").val();
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

function exportarRegistros() {
    let _data = $table.bootstrapTable("getData") || [];
    if (_data.length === 0) {
        bootbox.alert({
            size: "small",
            title: "Tecnologías",
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

    let url = `${URL_API}/Tecnologia/Exportar?nombre=${DATA_EXPORTAR.nombre}&dominioId=${DATA_EXPORTAR.domId}&subdominioId=${DATA_EXPORTAR.subdomId}&aplica=${DATA_EXPORTAR.aplica}&codigo=${DATA_EXPORTAR.codigo}&dueno=${DATA_EXPORTAR.dueno}&equipo=${DATA_EXPORTAR.equipo}&sortName=${DATA_EXPORTAR.sortName}&sortOrder=${DATA_EXPORTAR.sortOrder}`;

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

function formatOpciones(value, row, index) {
   // let style_color = row.Activo ? 'iconoVerde ' : "iconoRojo ";
    let estado = `<a href="javascript:void(0)" title=""><i class="glyphicon glyphicon-check table-icon"></i></a>`;
    return estado;
}

function CargarCombos() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ListarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //SetItems(dataObject.Fuente, $("#cbFuenteTec"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.FechaCalculo, $("#cbFecCalTec"), TEXTO_SELECCIONE);
                    SetItems(dataObject.Dominio, $("#cbFilDom"), TEXTO_TODOS);
                    //SetItems(dataObject.Familia, $("#cbFamTec"), TEXTO_SELECCIONE);
                    //SetItems(dataObject.TipoTec, $("#cbTipTec"), TEXTO_SELECCIONE);
                    //CODIGO_INTERNO = dataObject.CodigoInterno;
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}


function listarSubdominiosByDominio(Id) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API + "/Subdominio" + `/ListarSubdominiosByDominioId?Id=${Id}`,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    //console.log(dataObject);
                    SetItems(dataObject, $("#cbFilSub"), TEXTO_TODOS);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
 //       async: false
    });
}