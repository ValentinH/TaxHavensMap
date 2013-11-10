$(function() {

   initmap();
});


function initmap()
{
 $('#map').vectorMap({
    onRegionLabelShow: function(e, el, code){
        el.html(el.html() + " - " +code);
  }
});
}
