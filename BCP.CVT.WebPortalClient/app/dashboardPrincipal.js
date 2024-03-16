
var URL_API_VISTA = URL_API + "/Dashboard/Principal";
$(function () {
    GenerarGraficoRenovacionTecnologica();
});

function ObtenerDataGraficoRenovacionTecnologica() {
    waitingDialog.show();
    var chartData = [];
    var params = {
        Mes: $("#ddlMes").val(),
        Anio: $("#ddlAnio").val()
    };
    
    $.ajax({
        type: 'POST',
        url: URL_API_VISTA + "/RenovacionTecnologicaTI",
        data: params,
        dataType: "json",
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token')); },

        success: function (dataObject, textStatus) {
            if (textStatus == "success") {
                chartData = dataObject;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            ControlarErrorAjax(xhr, ajaxOptions, thrownError);
        },
        complete: function () {
            waitingDialog.hide();
        },
        async: false
    });

    return chartData;
}

function GenerarGraficoRenovacionTecnologica() {
    var datos = ObtenerDataGraficoRenovacionTecnologica();

    // Themes begin
    //am4core.useTheme(am4themes_animated);
    // Themes end

    // create chart
    var chart = am4core.create("chartdivRTI_0", am4charts.GaugeChart);
    chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

    chart.innerRadius = -25;

    var axis = chart.xAxes.push(new am4charts.ValueAxis());
    axis.min = 0;
    axis.max = 100;
    axis.strictMinMax = true;
    axis.renderer.grid.template.stroke = new am4core.InterfaceColorSet().getFor("background");
    axis.renderer.grid.template.strokeOpacity = 0.3;

    var colorSet = new am4core.ColorSet();

    var range0 = axis.axisRanges.create();
    range0.value = 0;
    range0.endValue = 25;
    range0.axisFill.fillOpacity = 1;
    range0.axisFill.fill = colorSet.getIndex(0);
    range0.axisFill.zIndex = - 1;

    var range1 = axis.axisRanges.create();
    range1.value = 25;
    range1.endValue = 30;
    range1.axisFill.fillOpacity = 1;
    range1.axisFill.fill = colorSet.getIndex(2);
    range1.axisFill.zIndex = -1;

    var range2 = axis.axisRanges.create();
    range2.value = 30;
    range2.endValue = 100;
    range2.axisFill.fillOpacity = 1;
    range2.axisFill.fill = colorSet.getIndex(4);
    range2.axisFill.zIndex = -1;

    var hand = chart.hands.push(new am4charts.ClockHand());

    // using chart.setTimeout method as the timeout will be disposed together with a chart
    chart.setTimeout(function () { SetValue(datos[0]) }, 1000);

    function SetValue(data) {
        hand.showValue(data.Porcentaje, 1000, am4core.ease.cubicOut);

    }

     
}