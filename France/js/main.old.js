$(function() {

 initmap();
});


function initmap()
{
  $.getJSON('./data/cac40.json', function(data){
    var val = getURLParameter();
    if(val != "")
    {
      $('#map').vectorMap({
        series: {
          regions: [{
            scale: ['#DEEBF7', '#08519C'],
            attribute: 'fill',
            values: data[val]
          }]
        },
        onRegionLabelShow: function(event, label, code){
          var nb = 0;
          if(data[val][code]) nb = data[val][code];
          label.html(
            ''+label.html()+'<br/>'+
            'Number of subsidiaries: <b>'+nb+'</b>'
            );
        }
      });
    }
    else
    {
      $('#map').vectorMap();
    }

  });
}

function getURLParameter()
{
  var sPageURL = ""+window.location;
  if (sPageURL.indexOf("#")==-1) return "";
  else return sPageURL.substr(sPageURL.indexOf("#")+1); 
}
