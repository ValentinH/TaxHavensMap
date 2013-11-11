$(function() {

 init();


});

var data;
function init()
{
  $.getJSON('./data/UK/ftse100.json', function(d){
    data = d;
    index = 0;
    for (var key in data) {
      $("#right-panel>div").append('<a href="#" id="val-'+key+'" onclick="showMap(\''+key+'\')" class="list-group-item">'+data[key].name+"</a>");
    }
    showMap(0);
  });

  $("#right-panel").hover(function() {
    $( this ).stop().animate({
      right: 0
    }, 500);
  },
  function() {
    $( this ).stop().animate({
      right: -170
    }, 500, function() {    
    });
  });
}

function showMap(val)
{
 $('#title').html(data[val].name);

 $('a').removeClass("active");
 $('#val-'+val).addClass("active");

 $('#map').html("").vectorMap({
  zoomMax: 2,
  markers: data[val].coords,
  series: {
    markers: [
    {
      attribute: 'fill',
      scale: ['#d3494e', '#d10b13'],
      values: data[val].values
    },
    {
      attribute: 'r',
      scale: [10, 30],
      values: data[val].values,
    }]
  },
  onMarkerLabelShow: function(event, label, index){
    var nb = 0;
    if(data[val].values[index]) nb = data[val].values[index];
    label.html(
      '<b>'+data[val].countries[index]+'</b><br/>'+
      'Filiales: <b>'+nb+'</b>'
      );
  },
  onRegionLabelShow: function(event, label, code)
  {
    //hide labels fro regions          
    label.hide();
    event.preventDefault();
  }  ,
  onRegionOver: function(event, code)
  {
    event.preventDefault();
  }
});
}