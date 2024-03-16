var URL_API_VISTA = URL_API + "/Portafolio";
$(function () {        
    ListarRegistros();
    ListarRegistrosEstados();    
});

function ListarRegistros() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ReporteBIAN",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject.Rows;
                    $.each(data, function () {
                        $('#tblRegistro tbody').append('<tr>' +
                            '<td class="fondoAzul">' + this.Categoria + '</td>' +
                            '<td class="centerBold">' + this.BankingProducts + '</td>' +
                            '<td class="centerBold">' + this.BiceFinal + '</td>' +
                            '<td class="centerBold">' + this.BusinessDirectionFinal + '</td>' +
                            '<td class="centerBold">' + this.BusinessIntegration + '</td>' +
                            '<td class="centerBold">' + this.BusinessSupport + '</td>' +
                            '</tr>');
                    });
                }
            }
        },
        complete: function () {
            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}

function ListarRegistrosEstados() {
    waitingDialog.show("Procesando...", { dialogSize: "sm", progressType: "warning" });
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: URL_API_VISTA + "/ReporteEstado",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (dataObject, textStatus) {
            if (textStatus === "success") {
                if (dataObject !== null) {
                    let data = dataObject.Rows;     
                    $.each(data, function () {
                        $('#tblRegistroApps tbody').append('<tr>' +
                            '<td class="fondoAzul">' + this.Categoria + '</td>' +
                            '<td class="centerBold fondoGris">' + this.TotalVigentes + '</td>' +
                            '<td class="centerBold">' + this.AppsOnPremise + '</td>' +
                            '<td class="centerBold">' + this.AppsOnCloud + '</td>' +
                            '<td class="centerBold">' + this.AppsObsolescenciaOnPremise + '</td>' +
                            '<td class="centerBold">' + this.AppsObsolescenciaOnCloud + '</td>' +
                            '<td class="centerBold">' + this.AppsDesarrolladasOnPremise + '</td>' +
                            '<td class="centerBold">' + this.AppsDesarrolladasOnCloud + '</td>' +
                            '<td class="centerBold">' + this.AppsPaquetesOnPremise + '</td>' +
                            '<td class="centerBold">' + this.AppsPaquetesOnCloud + '</td>' +
                            '<td class="centerBold fondoBlanco">' + this.TotalEnDesarrollo + '</td>' +
                            '</tr>');
                    });
                }
            }
        },
        complete: function () {
            waitingDialog.hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        async: false
    });
}