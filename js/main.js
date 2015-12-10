$(function () {
    init();
});

var lang = window.navigator.userLanguage || window.navigator.language;
i18n.init({ lng: lang }, function(t) {
     $("body").i18n();
 });

var file_cac = './data/cac40.json';
if(lang.toLowerCase() == "fr") file_cac = './data/cac40_fr.json';
var file_ftse = './data/ftse100.json';
if(lang.toLowerCase() == "fr") file_ftse = './data/ftse100_fr.json';
var file_usa = './data/USA.json';
if(lang.toLowerCase() == "fr") file_usa = './data/USA_fr.json';

var cac40 = new MapData({
    file: file_cac,
    sourceCoords: {x: "48.8566", y: "2.35097"}
});
var ftse100 = new MapData({
    file: file_ftse,
    sourceCoords: {x: "51.51121", y: "-0.11982"}
});
var USA = new MapData({
    file: file_usa,
    sourceCoords: {x: "40.714353", y: "-74.005973"}
});

var mapView = new MapView({
    model: ftse100
});

function init() {
    loadJson();

    //Set hover effect on side menu
    $("#right-panel").hover(function () {
        $(this).stop().animate({
            right: 0
        }, 500);
    },
    function () {
        $(this).stop().animate({
            right: -100
        }, 500);
    });

    //set callback for the map switcher
    $("#map-chooser").find("input[name='options']").change(function () {
        if (parseInt($(this).val()) == 0)
            mapView.model = ftse100;
        else if (parseInt($(this).val()) == 1)
            mapView.model = cac40;
        else if (parseInt($(this).val()) == 2)
            mapView.model = USA;
        loadJson();
    });

    //set callback for the links switcher
    $("#links-switcher").find("input[name='options']").change(function () {
        if ($(this).val() == "true")
            mapView.showLinks = true;
        else
            mapView.showLinks = false;
        mapView.drawLinks();
        mapView.drawNodes();
    });
}

function loadJson() {
    $('#map').html("");
    $('#loader').show();
    if (mapView.model.data == null) {
        $.getJSON(mapView.model.file, function (d) {
            mapView.model.data = d;
            mapView.model.minValue = 100;
            mapView.model.maxValue = 0;
            for (var key in mapView.model.data) {
                mapView.model.menuEl += '<a href="#" id="val-' + key + '" onclick="setCompany(\'' + key + '\')" class="list-group-item">' + mapView.model.data[key].name + "</a>";
                $.each(mapView.model.data[key].countries, function (i, country) {
                    var val = country.value;
                    if (key != 0) {
                        if (val < mapView.model.minValue) mapView.model.minValue = parseInt(val);
                        if (val > mapView.model.maxValue) mapView.model.maxValue = parseInt(val);
                    }
                    else {
                        if (val < mapView.model.minTotalValue) mapView.model.minTotalValue = parseInt(val);
                        if (val > mapView.model.maxTotalValue) mapView.model.maxTotalValue = parseInt(val);
                    }
                });
            }
            $("#right-panel").find(">div").html(mapView.model.menuEl);
            setCompany(0);
        });
}
else {
    $("#right-panel").find(">div").html(mapView.model.menuEl);
    setCompany(0);
}
}

function setCompany(val) {
    var loaderSelector = $('#loader');
    loaderSelector.show();
    mapView.model.currentCompany = val;
    mapView.drawMap();

    //update the title
    $('#title').html(mapView.model.data[mapView.model.currentCompany].name);

    //update the menu view
    $('a').removeClass("active");
    $('#val-' + mapView.model.currentCompany).addClass("active");

    //scale 1
    mapView.drawLinks();
    mapView.drawNodes();
    loaderSelector.hide();
}
