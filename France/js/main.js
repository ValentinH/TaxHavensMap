$(function() {

 initmap();


});

var data, companies, index;
function initmap()
{
  $.getJSON('./data/cac40.json', function(d){
    data = d;
    index = 0;
    companies = [];
    for (var key in data) {
      companies.push(key);
    }
    showMap(companies[0]);
   
    $( "body" ).keyup(function(e) {
      if(e.keyCode == 32)
      {
        index++;
        if(index == companies.length) index=0;
        showMap(companies[index]);
      }
    });

  });
}

function showMap(val)
{
 $('#map').html("");
 $('#map').vectorMap({
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
      '<b>'+data[val].names[index]+'</b><br/>'+
      'Filiales: <b>'+nb+'</b>'
      );
  },
  onRegionLabelShow: function(event, label, code)
  {
          //hide labels fro regions          
          label.hide();
          event.preventDefault();
        }
        ,
        onRegionOver: function(event, code)
        {
          event.preventDefault();
        }
      });
}