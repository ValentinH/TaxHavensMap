$(function() {

 init();


});

var data, values, files = ['./data/ftse100.json', './data/cac40.json'];
function init()
{
  loadJson(0);

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
    var id = parseInt($(this).val());
    loadJson(id);
  });
}

function loadJson(id)
{
 $('#map').html("");
 $('#loader').show();
 $.getJSON(files[id], function(d){
  data = d;
  index = 0;
  values = [];
  $("#right-panel>div").html("");
  for (var key in data) {
    $("#right-panel>div").append('<a href="#" id="val-'+key+'" onclick="showMap(\''+key+'\')" class="list-group-item">'+data[key].name+"</a>");
    values = Array.prototype.concat.apply(values, jvm.values(data[key].values));
  }
  showMap(0);
});
}

function showMap(val)
{
 $('#title').html(data[val].name);

 $('a').removeClass("active");
 $('#val-'+val).addClass("active");

 $('#map').html("").vectorMap({
  zoomMax: 5,
  markers: data[val].coords,
  series: {
    markers: [
    {
      attribute: 'fill',
      scale: ['#d3494e', '#d10b13'],
      values: data[val].values,
      min: jvm.min(values),
      max: jvm.max(values)
    },
    {
      attribute: 'r',
      scale: [5, 30],
      values: data[val].values,
      min: jvm.min(values),
      max: jvm.max(values)
    }]
  },
  onMarkerLabelShow: function(event, label, index){
    var nb = 0;
    if(data[val].values[index]) nb = data[val].values[index];
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
    var s = Snap("#map svg");
    //var g = s.selectAll("g")[1];
    var mapObject = $('#map').vectorMap('get', 'mapObject');
    var pt = mapObject.latLngToPoint("48.8566","2.35097");
    if(group != null)
     group.remove();

    group = s.group();

    circle = group.circle(pt.x,pt.y,10*scale);
    circle.attr({
        dataIndex:"5",
        stroke: "#3F3",
        strokeWidth: 3,
        class: "jvectormap-marker jvectormap-element"
    });
    for(var i = 0; i < 100; i++)
    {

    var pt2 = mapObject.latLngToPoint("55.7558", "37.6176");
    line = group.line(pt.x+i*10,pt.y+i*10,pt2.x+i*10,pt2.y+i*10);
    line.attr({
        strokeLinecap: "round",
        stroke: "#F33",
        strokeWidth: 10,
        class: "line"
    });
  }
  }  
});

 $('#loader').hide();
 $('.line').click(function(){alert("ok")});
}

var group, line;