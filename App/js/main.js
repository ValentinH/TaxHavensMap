$(function() {
  init();
});

var mapView = new MapView();
var cac40 = new MapData({
  file : './data/cac40.json',
  sourceCoords : ["48.8566","2.35097"],
});
var ftse100 = new MapData({
  file : './data/ftse100.json',
  sourceCoords : ["51.51121","-0.11982"],
});
var mapData = ftse100;

function init()
{
  loadJson();

  $("#right-panel").hover(function() {
    $( this ).stop().animate({
      right: 0
    }, 500);
  },
  function() {
    $( this ).stop().animate({
      right: -150
    }, 500, function() {    
    });
  });

  $("#map-chooser input[name='options']").change(function(){
    mapData = parseInt($(this).val()) ? ftse100 : cac40;
    loadJson();
  });
}

function loadJson()
{
 $('#map').html("");
 $('#loader').show();
 $.getJSON(mapData.file, function(d){
  mapData.data = d;
  mapData.minValue = 100;
  mapData.maxValue = 0;
  $("#right-panel>div").html("");
  for (var key in mapData.data) {
    $("#right-panel>div").append('<a href="#" id="val-'+key+'" onclick="showMap(\''+key+'\')" class="list-group-item">'+mapData.data[key].name+"</a>");
    $.each( mapData.data[key].values, function(i, val){
      if(val<mapData.minValue) mapData.minValue = parseInt(val);
      if(val > mapData.maxValue) mapData.maxValue = parseInt(val);
    });
  }
  showMap(0);
});
}

function showMap(val)
{
  mapData.currentCompany = val;

  //update the title
  $('#title').html(mapData.data[mapData.currentCompany].name);

  //update the menu view
  $('a').removeClass("active");
  $('#val-'+mapData.currentCompany).addClass("active");

  //reset the map
  $("#map").html("");
  mapView.map = new jvm.WorldMap({
    container: $('#map'),
    zoomMax: 5,
    markers: mapData.data[mapData.currentCompany].coords,
    series: {
      markers: [
      {
        attribute: 'fill',
        scale: mapView.colorScale,
        values: mapData.data[mapData.currentCompany].values,
        min: mapData.minValue,
        max: mapData.maxValue
      },
      {
        attribute: 'r',
        scale: [mapView.minSize, mapView.maxSize],
        values: mapData.data[mapData.currentCompany].values,
        min: mapData.minValue,
        max: mapData.maxValue
      }]
    },
    onMarkerLabelShow: function(event, label, index){
      var nb = 0;
      if(mapData.data[mapData.currentCompany].values[index]) nb = mapData.data[mapData.currentCompany].values[index];
      label.html(
        '<b>'+mapData.data[mapData.currentCompany].countries[index]+'</b><br/>'+
        'Subsidiaries: <b>'+nb+'</b>'
        );
    },
    onRegionLabelShow: function(event, label, code)
    {
    //hide labels fro regions          
    label.hide();
    event.preventDefault();
  },
  onRegionOver: function(event, code)
  {
    event.preventDefault();
  },
  onViewportChange : function(e, scale)
  {    
    drawLinks(scale);
  }  
});

drawLinks(1);
$('#loader').hide();
}

function drawLinks(scale)
{
  if(mapView.map == null)
    return;
  var s = Snap("#map svg");
  s = s.selectAll("g")[1];
  if(mapView.svgLayer != null) mapView.svgLayer.remove();

  mapView.svgLayer = s.group();

  //draw the source point
  var source = mapData.sourceCoords;
  var pt = mapView.map.latLngToPoint(source[0],source[1]);
  circle = mapView.svgLayer.circle(pt.x,pt.y,5*scale);
  circle.attr({
   fill : mapView.sourceColor
  });

  //draw all the links
  var cScale = new jvm.ColorScale(mapView.colorScale, "linear", mapData.minValue, mapData.maxValue);
  $.each(mapData.data[mapData.currentCompany].coords, function(i, coord)
  {
    var pt2 = mapView.map.latLngToPoint(coord[0], coord[1]);
    var value = mapData.data[mapData.currentCompany].values[i];
    var strokeWidth = mapView.minStroke + (value - mapData.minValue) * (mapView.maxStroke-mapView.minStroke)/(mapData.maxValue-mapData.minValue); 
    line = mapView.svgLayer.line(pt.x,pt.y,pt2.x,pt2.y);
    line.attr({
      strokeLinecap: "round",
      stroke: cScale.getValue(value),
      strokeWidth: strokeWidth,
      class: "line"
    });
  }); 
}