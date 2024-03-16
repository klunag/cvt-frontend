$(function () {
    AlertasNotificaciones();
    //OpcionAyuda();
});

function AlertasNotificaciones() {
    //ALERTAS FUNCIONALES
    if (localStorage.getItem('token') == null) {
        return false;
    }

    $.ajax({
        url: URL_API + "/Alerta" + "/" + "Funcionales",
        type: "POST",
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
        success: function (result) {

            $(".dropdown #divAlertasHome").append(String.Format('<a href="#" class="kt-notification__item">\
                                        <div class= "kt-notification__item-icon" >\
                                            <i class= "icon icon-envelope-o icon-lg kt-font-success"></i>\
                                        </div>\
                                        <div class="kt-notification__item-details">\
                                            <div class="kt-notification__item-title">\
                                                {0}\
                                            <span class= "badge badge-{2}" >&nbsp;{1}&nbsp;</span >\
                                        </div>\
                                       </div>\
                                     </a>', result.AlertaFuncional1.Nombre, result.AlertaFuncional1.NroAlertasDetalle, result.AlertaFuncional1.NroAlertasDetalle == 0 ? "success" : "primary"))
                .append(String.Format('<a href="#" class="kt-notification__item">\
                                        <div class= "kt-notification__item-icon" >\
                                            <i class= "icon icon-envelope-o icon-lg kt-font-success"></i>\
                                        </div>\
                                        <div class="kt-notification__item-details">\
                                            <div class="kt-notification__item-title">\
                                                {0}\
                                            <span class= "badge badge-{2}" >&nbsp;{1}&nbsp;</span >\
                                        </div>\
                                       </div>\
                                     </a>', result.AlertaFuncional2.Nombre, result.AlertaFuncional2.NroAlertasDetalle, result.AlertaFuncional2.NroAlertasDetalle == 0 ? "success" : "primary"))
                .append(String.Format('<a href="#" class="kt-notification__item">\
                                        <div class= "kt-notification__item-icon" >\
                                            <i class= "icon icon-envelope-o icon-lg kt-font-success"></i>\
                                        </div>\
                                        <div class="kt-notification__item-details">\
                                            <div class="kt-notification__item-title">\
                                                {0}\
                                            <span class= "badge badge-{2}" >&nbsp;{1}&nbsp;</span >\
                                        </div>\
                                       </div>\
                                     </a>', result.AlertaFuncional3.Nombre, result.AlertaFuncional3.NroAlertasDetalle, result.AlertaFuncional3.NroAlertasDetalle == 0 ? "success" : "primary"))
                .append(String.Format('<a href="#" class="kt-notification__item">\
                                        <div class= "kt-notification__item-icon" >\
                                            <i class= "icon icon-envelope-o icon-lg kt-font-success"></i>\
                                        </div>\
                                        <div class="kt-notification__item-details">\
                                            <div class="kt-notification__item-title">\
                                                {0}\
                                            <span class= "badge badge-{2}" >&nbsp;{1}&nbsp;</span >\
                                        </div>\
                                       </div>\
                                     </a>', result.AlertaFuncional4.Nombre, result.AlertaFuncional4.NroAlertasDetalle, result.AlertaFuncional4.NroAlertasDetalle == 0 ? "success" : "primary"))
                .append(String.Format('<a href="#" class="kt-notification__item">\
                                        <div class= "kt-notification__item-icon" >\
                                            <i class= "icon icon-envelope-o icon-lg kt-font-success"></i>\
                                        </div>\
                                        <div class="kt-notification__item-details">\
                                            <div class="kt-notification__item-title">\
                                                {0}\
                                            <span class= "badge badge-{2}" >&nbsp;{1}&nbsp;</span >\
                                        </div>\
                                       </div>\
                                     </a>', result.AlertaFuncional5.Nombre, result.AlertaFuncional5.NroAlertasDetalle, result.AlertaFuncional5.NroAlertasDetalle == 0 ? "success" : "primary"))
                .append(String.Format('<a href="#" class="kt-notification__item">\
                                        <div class= "kt-notification__item-icon" >\
                                            <i class= "icon icon-envelope-o icon-lg kt-font-success"></i>\
                                        </div>\
                                        <div class="kt-notification__item-details">\
                                            <div class="kt-notification__item-title">\
                                                {0}\
                                            <span class= "badge badge-{2}" >&nbsp;{1}&nbsp;</span >\
                                        </div>\
                                       </div>\
                                     </a>', result.AlertaFuncional6.Nombre, result.AlertaFuncional6.NroAlertasDetalle, result.AlertaFuncional6.NroAlertasDetalle == 0 ? "success" : "primary"));


        },
        complete: function (data) {
            //ALERTAS TECNICAS
            var params = {};
            params.fechaConsulta = moment(new Date()).format("YYYY-MM-DD");
            params.pageNumber = 1;
            params.pageSize = 9999;
            params.sortName = "Descripcion";
            params.sortOrder = "asc";

            $.ajax({
                url: URL_API + "/Alerta" + "/" + "Tecnicas",
                type: "POST",
                dataType: "json",
                data: params,
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },
                success: function (result) {

                    $.each(result.Rows, function (key, obj) {
                        $(".dropdown #divAlertasHome").append(String.Format('<a href="#" class="kt-notification__item">\
                                        <div class= "kt-notification__item-icon" >\
                                            <i class= "icon icon-envelope-o icon-lg kt-font-success"></i>\
                                        </div>\
                                        <div class="kt-notification__item-details">\
                                            <div class="kt-notification__item-title">\
                                                {0}\
                                            <span class= "badge badge-{2}" >&nbsp;{1}&nbsp;</span >\
                                        </div>\
                                       </div>\
                                     </a>', obj.Descripcion, obj.NroAlertasDetalle, obj.NroAlertasDetalle == 0 ? "success" : "primary"))
                    });

                },
                complete: function (data) {

                },
                error: function (xhr, ajaxOptions, thrownError) {

                }
            });
        },
        error: function (xhr, ajaxOptions, thrownError) {

        },
        async: true
    });

    //$("#divAlertas").append("<hr>");

}

function OpcionAyuda() {
    $(".dropdown #divOpcionAyuda").append(String.Format('<a href="{3}" class="kt-notification__item">\
                                        <div class= "kt-notification__item-icon" >\
                                            <i class= "icon icon-envelope-o icon-lg kt-font-success"></i>\
                                        </div>\
                                        <div class="kt-notification__item-details">\
                                            <div class="kt-notification__item-title">\
                                                {0}\
                                            <span class= "badge badge-{2}" >&nbsp;{1}&nbsp;</span >\
                                        </div>\
                                       </div>\
                                     </a>', "Visualización de archivos en la plataforma", "0", "success", URL_PREGUNTA));
        
}
//badge badge-primary badge-above right

document.addEventListener('DOMContentLoaded', function () {
    setInterval(validTokenBearer(), 60000);
});

$(document).ajaxSend(function () {
    validTokenBearer();
});

function validTokenBearer() {
    if (localStorage.getItem("token") != null) {
        let token = localStorage.getItem("token");
        let { exp } = jwt_decode(token);
        let fechaActual = parseInt((new Date().getTime() / 1000).toFixed(0));
        if (exp < fechaActual) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            LoginUsuario(false);
        }
    }
}