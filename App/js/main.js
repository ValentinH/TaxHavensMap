$(function() {
  init();
});

var data, values, files = ['./data/ftse100.json', './data/cac40.json'];
var sourceCoords = [["51.51121","-0.11982"], ["48.8566","2.35097"]];
var map, group, currentVal, min, max;
var currentMap;
function init()
{
  currentMap = 0;
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
    currentMap = parseInt($(this).val());
    loadJson();
  });
}

function loadJson()
{
 $('#map').html("");
 $('#loader').show();
 $.getJSON(files[currentMap], function(d){
  data = d;
  index = 0;
  min = 100, max = 0;
  $("#right-panel>div").html("");
  for (var key in data) {
    $("#right-panel>div").append('<a href="#" id="val-'+key+'" onclick="showMap(\''+key+'\')" class="list-group-item">'+data[key].name+"</a>");
    $.each( data[key].values, function(i, val){
      if(val<min) min = parseInt(val);
      if(val > max) max = parseInt(val);
    });
  }
  showMap(0);
});
}

function showMap(val)
{
  currentVal = val;
  $('#title').html(data[currentVal].name);

  $('a').removeClass("active");
  $('#val-'+currentVal).addClass("active");
  $("#map").html("");
  map = new jvm.WorldMap({
    container: $('#map'),
    zoomMax: 5,
    markers: data[currentVal].coords,
    series: {
      markers: [
      {
        attribute: 'fill',
        scale: ['#d3494e', '#d10b13'],
        values: data[currentVal].values,
        min: min,
        max: max
      },
      {
        attribute: 'r',
        scale: [5, 30],
        values: data[currentVal].values,
        min: min,
        max: max
      }]
    },
    onMarkerLabelShow: function(event, label, index){
      var nb = 0;
      if(data[currentVal].values[index]) nb = data[currentVal].values[index];
      label.html(
        '<b>'+data[val].countries[index]+'</b><br/>'+
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
  if(map == null)
    return;
  var s = Snap("#map svg");
  s = s.selectAll("g")[1];
  if(group != null) group.remove();

  group = s.group();

  var source = sourceCoords[currentMap];
  var pt = map.latLngToPoint(source[0],source[1]);
  circle = group.circle(pt.x,pt.y,5*scale);
  circle.attr({
   fill : "#33F"
  });

  var coords = data[currentVal].coords;
  $.each(coords, function(i, coord)
  {
    var pt2 = map.latLngToPoint(coord[0], coord[1]);
    var value = data[currentVal].values[i];
    var minStroke = 2, maxStroke = 30;
    var strokeWidth = minStroke + (value - min) * (maxStroke-minStroke)/(max-min); 
    console.log(min+" "+max);
    line = group.line(pt.x,pt.y,pt2.x,pt2.y);
    line.attr({
      strokeLinecap: "round",
      stroke: "#F33",
      strokeWidth: strokeWidth,
      class: "line"
    });
  }); 
}