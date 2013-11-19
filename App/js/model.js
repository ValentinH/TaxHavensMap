function MapData(args) {
    args = args || {};
    this.file = args.file || '';
    this.sourceCoords = args.sourceCoords || {};
    this.data = null;
    this.minValue = 100;
    this.maxValue = 0;
    this.minTotalValue = 100;
    this.maxTotalValue = 0;
    this.currentCompany = 0;
    this.menuEl = '';
}

function MapView(args) {
    args = args || {};	
    this.model = args.model || null;
    this.map = null;
    this.minNodeSize = args.minNodeSize || 5;
    this.maxNodeSize = args.maxNodeSize || 15;
    this.minLinkSize = args.minLinkSize || 1;
    this.maxLinkSize = args.maxLinkSize || 3;
    this.colorScale = args.colorScale || ['#ffdd00', '#d10b13'];
    this.sourceColor = args.sourceColor || "#33F";
    this.linksLayer = null;
    this.nodesLayer = null;
    this.showLinks = false;
}

MapView.prototype.drawMap = function(){		
    var min = this.model.minValue;
    var max = this.model.maxValue;
    if(this.model.currentCompany == 0)
    {
        min = this.model.minTotalValue;
        max = this.model.maxTotalValue;
    }

    //reset the map
    $("#map").html("");
    $(".jvectormap-label").remove();
    self = this;
    this.map = new jvm.WorldMap({
        container: $('#map'),
        zoomMax: 5,
    onRegionLabelShow: function(event, label, code) {
        //hide labels from regions          
        label.hide();
        event.preventDefault();
    },
    onRegionOver: function(event, code) {
        event.preventDefault();
    },
    onViewportChange : function(e, scale) { 
        self.drawLinks(scale);   
        self.drawNodes(scale);
    }  
    });
};

MapView.prototype.drawNodes = function(scale)
{
    if(this.map == null)
        return;
    var self = this;
    var min = this.model.minValue;
    var max = this.model.maxValue;
    if(this.model.currentCompany == 0)
    {
        min = this.model.minTotalValue;
        max = this.model.maxTotalValue;
    }

    var s = Snap("#map svg");
    if(this.nodesLayer != null) this.nodesLayer.remove();
    this.nodesLayer = s.group();


    $.each(this.model.data[this.model.currentCompany].coords, function(i, coord)
    {
        var value = self.model.data[self.model.currentCompany].values[i];
        var name = self.model.data[self.model.currentCompany].countries[i]

        var cScale = new jvm.ColorScale(self.colorScale, "polynomial", min, max);
        var radius = self.minNodeSize + (value - min) * (self.maxNodeSize-self.minNodeSize)/(max-min); 
           
        //draw the destination point
        var pt = self.map.latLngToPoint(coord[0], coord[1]);
        var circle = self.nodesLayer.circle(pt.x, pt.y, radius*Math.sqrt(scale));
        circle.attr({
            fill : cScale.getValue(value),            
            stroke: '#505050',
            "stroke-width": 1,
        });
        circle.mousemove( function(e){
            $(".my-label").show();      
            $(".my-label").html('<b>'+self.model.data[self.model.currentCompany].countries[i]+
                                '</b><br/>Subsidiaries: <b>'+value+'</b>');
            self.positionLabel(e);
        });
        circle.mouseout( function(){        
            $(".my-label").hide();
        });
    });
    //draw the source point
    var source = this.model.sourceCoords;
    var sourcePt = this.map.latLngToPoint(source.x,source.y);
    var circle = this.nodesLayer.circle(sourcePt.x,sourcePt.y,10*scale);
    circle.attr({
        fill : this.sourceColor
    });
    circle.mousemove( function(e){
        $(".my-label").show();      
        $(".my-label").html('<b>Source</b>');
        self.positionLabel(e);
    });
    circle.mouseout( function(){        
        $(".my-label").hide();
    });
};

MapView.prototype.drawLinks = function(scale) {
    if(this.map == null)
        return;
    var self = this;

    var s = Snap("#map svg");
    if(this.linksLayer != null) this.linksLayer.remove();
    this.linksLayer = s.group();

    var source = this.model.sourceCoords;
    var pt = this.map.latLngToPoint(source.x,source.y);

    if(this.showLinks)
    {
        var min = this.model.minValue;
        var max = this.model.maxValue;
        if(this.model.currentCompany == 0)
        {
            min = this.model.minTotalValue;
            max = this.model.maxTotalValue;
        }

        //draw all the links
        var cScale = new jvm.ColorScale(this.colorScale, "polynomial", min, max);
        $.each(this.model.data[this.model.currentCompany].coords, function(i, coord)
        {			
            var pt2 = self.map.latLngToPoint(coord[0], coord[1]);
            var controlPointX = (pt.x + pt2.x) / 2 + (pt2.y - pt.y) / 4,
            controlPointY = (pt.y + pt2.y) / 2 + (pt.x - pt2.x) / 4;

            var value = self.model.data[self.model.currentCompany].values[i];
            var strokeWidth = self.minLinkSize + (value - min) * (self.maxLinkSize-self.minLinkSize)/(max-min); 
            strokeWidth *= Math.sqrt(scale);
            line = self.linksLayer.path("M"+pt.x+","+pt.y+" Q"+controlPointX+","+controlPointY+" "+
                pt2.x+","+pt2.y);
            line.attr({
                strokeLinecap: "round",
                stroke: cScale.getValue(value),
                strokeWidth: strokeWidth,
                fill : 'none',
                class: "line",
                index : i
            });
            line.data("index", i);
            line.mousemove(	function(e){
                $(".my-label").show();		
                self.displayLabel($(".my-label"), this.data("index"));	
                self.positionLabel(e);
            });
            line.mouseout(	function(){		
                $(".my-label").hide();
            });
            });
    }
};

MapView.prototype.displayLabel = function(label, index)
{
    var nb = 0;
    if(self.model.data[self.model.currentCompany].values[index]) nb = self.model.data[self.model.currentCompany].values[index];
    label.html(
        '<b>'+self.model.data[self.model.currentCompany].countries[index]+'</b><br/>'+
        'Subsidiaries: <b>'+nb+'</b>'
        );
},

MapView.prototype.positionLabel = function(e)
{
    var left = e.x-15-parseInt($(".my-label").width()),
    top = e.y-15-parseInt($(".my-label").height());
    if (left < 5) {
        left = e.x+15;
    }
    if (top < 5) {
        top = e.y + 15;
    }
    $(".my-label").css({
        left: left,
        top: top
    });
}