var $table = $("#tblGroupName");
var DATA_EXPORTAR = {};
var FIRST_NODE_ID = "";
var CONTAINER_SELECTED = "";
var PREFIX_SELECTED = null;
var PREFIX_HISTORY = [];

const URL_API_VISTA = URL_API + "/BlobStorage";
const TITULO_MENSAJE = "Blobs";

$(function () {
    InitBT();
    InitDatePicker();
    InitPreData();
    $("#btnSearch").click(RefreshList);
    $("#btnGoBack, #btnGoUp").click(GoBack);
    $('#jstree_demo_div').on("changed.jstree", function (e, data) {
        PREFIX_HISTORY = [];
        CONTAINER_SELECTED = data.node.text;
        PREFIX_SELECTED = null;
        ListRecords(CONTAINER_SELECTED);
    });

    ListRecords();
});

function RefreshList() {
    //$('#jstree_demo_div').jstree(true).select_node(FIRST_NODE_ID);
    ListRecords();
}

function InitBT() {
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({data: []});
}

function InitDatePicker() {
    $("#dpDate-btn").datetimepicker({
        locale: 'es',
        useCurrent: true,
        format: 'DD/MM/YYYY'
    });
}

function InitTreeView(containers = []) {
    $('#jstree_demo_div').jstree({
        'core': {
            'data': [
                {
                    'text': 'CVT',
                    'state': {
                        'opened': true,
                        //'selected': true,
                        'disabled': true
                    },
                    'children': [
                        {
                            'text': 'contenedores',
                            'state': {
                                'opened': true,
                                //'selected': true,
                                'disabled': true
                            },
                            'children': containers
                        }
                    ]
                }
            ]
        }
    });
}

function ListRecords(containerFilter = "", prefix = null) {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $table.bootstrapTable('destroy');
    $table.bootstrapTable({
        locale: 'es-SP',
        url: URL_API_VISTA + "/Listado",
        method: 'POST',
        pagination: true,
        sidePagination: 'server',
        queryParamsType: 'else',
        ajaxOptions: { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } },
        pageSize: REGISTRO_PAGINACION,
        pageList: OPCIONES_PAGINACION,
        sortName: 'Name',
        sortOrder: 'asc',
        queryParams: function (p) {
            DATA_EXPORTAR = {};
            DATA_EXPORTAR.DateFilter = dateFromString($("#dpDateFilter").val());
            DATA_EXPORTAR.Container = containerFilter === "" ? CONTAINER_SELECTED : containerFilter;
            DATA_EXPORTAR.Prefix = prefix === null ? PREFIX_SELECTED : prefix;
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
        onLoadSuccess: function (data) {
            SetCaptionDirectory();
            EnableDisableToolbar();
        }
    });
}

function EnableDisableToolbar() {
    if (PREFIX_HISTORY.length > 0) {
        $("#toolbar").removeClass("bloq-element");
    } else {
        $("#toolbar").addClass("bloq-element");
    }
}

function editSelectedFn(element, index, array) {
    if (index === 0) {
        element.selected = true;
    }
}

function InitPreData() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/CargarCombos",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let dataContainers = dataObject;
                    FIRST_NODE_ID = dataContainers[0].id;
                    CONTAINER_SELECTED = dataContainers[0].text;
                    //dataContainers.forEach(editSelectedFn);
                    InitTreeView(dataContainers);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function nameFormatter(value, row, index) {
    let html = "";
    if (row.IsDirectory) {
        let arrDir = row.Prefix.split("/").reverse();
        let dirName = arrDir[1];

        html = `<div class="row">
                    <div class="col-md-12">
                         <a href="javascript: void(0)" onclick="OpenDirectory('${row.Prefix}','${row.ContainerName}')" title="Abrir carpeta">
                            <span class="icon icon-folder"></span>
                            ${dirName}
                        </a>
                    </div>
                </div>`;
    } else {
        let arrName = row.Name.split("/").reverse(); 
        let fileName = arrName[0];

        html = `<div class="row">
                    <div class="col-md-9">
                        <p>${fileName}</p>
                    </div>
                    <div class="col-md-3">
                        <a href="javascript: void(0)" onclick="DownloadBlobFile('${row.Name}','${row.ContainerName}','${row.Prefix}')" title="Descargar archivo">
                            <span class="icon icon-download"></span>
                        </a>
                    </div>
                </div>`;
    }

    return html;
}

function OpenDirectory(Prefix, Container) {
    if (!PREFIX_HISTORY.includes(Prefix)) PREFIX_HISTORY.push(Prefix);
    PREFIX_SELECTED = Prefix;
    ListRecords(Container, Prefix);
}

function DownloadBlobFile(filename, container, prefix) {
    let url = `${URL_API_VISTA}/Descargar?filename=${filename}&containerName=${container}&prefix=${prefix}`;
    $.ajax({
        url: url,
        contentType: "application/vnd.ms-excel",
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

function SetCaptionDirectory() {
    let dir = "";
    if (PREFIX_SELECTED === null) {
        dir = `${CONTAINER_SELECTED}`;
    } else {
        let customPrefix = PREFIX_SELECTED.replace(/[/]/g, ' > ');
        dir = `${CONTAINER_SELECTED} > ${customPrefix}`;
    }

    $("#cptBlobs").text(dir);
}

function GoBack() {
    let goToPrefix = PREFIX_HISTORY[PREFIX_HISTORY.length - 2] || null;
    let currentPrefix = PREFIX_HISTORY[PREFIX_HISTORY.length - 1] || null;
    
    PREFIX_SELECTED = goToPrefix;
    PREFIX_HISTORY = PREFIX_HISTORY.filter(x => x !== currentPrefix);
    ListRecords(CONTAINER_SELECTED, PREFIX_SELECTED);
}