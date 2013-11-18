function MapData(args) {
	args = args || {};
	this.file = args.file || '';
	this.sourceCoords = args.sourceCoords || {};
	this.data = null;
	this.minValue = 100;
	this.maxValue = 0;
	this.currentCompany = 0;
	this.menuEl = '';
}

function MapView(args) {
	args = args || {};	
	this.model = args.model || null;
	this.map = null;
	this.minSize = args.minSize || 5;
	this.maxSize = args.maxSize || 30;
	this.colorScale = args.colorScale || ['#ffdd00', '#d10b13'];
	this.sourceColor = args.sourceColor || "#33F";
	this.svgLayer = null;
	this.showLinks = false;

	this.drawMap = function(){		
		//reset the map
		$("#map").html("");
		$(".jvectormap-label").remove();
		$this = this;
		this.map = new jvm.WorldMap({
			container: $('#map'),
			zoomMax: 5,
			markers: this.model.data[this.model.currentCompany].coords,
			markerStyle : {
				hover: {
    				stroke: '#505050',
					"stroke-width": 1
				}
			},
			series: {
				markers: [
				{
					attribute: 'fill',
					scale: this.colorScale,
					normalizeFunction : "polynomial",
					values: this.model.data[this.model.currentCompany].values,
					min: this.model.minValue,
					max: this.model.maxValue
				},
				{
					attribute: 'r',
					scale: [this.minSize, this.maxSize],
					values: this.model.data[this.model.currentCompany].values,
					min: this.model.minValue,
					max: this.model.maxValue
				}]
			},
			onMarkerLabelShow: function(event, label, index) {
				displayLabel(label, index);	
			},
			onRegionLabelShow: function(event, label, code) {
				//hide labels from regions          
				label.hide();
				event.preventDefault();
			},
			onRegionOver: function(event, code) {
				event.preventDefault();
			},
			onViewportChange : function(e, scale) {    
				$this.drawLinks(scale);
			}  
		});
};

this.drawLinks = function(scale)
{
	if(this.map == null)
		return;

	var s = Snap("#map svg");
	if(this.svgLayer != null) this.svgLayer.remove();
	this.svgLayer = s.group();

	var source = this.model.sourceCoords;
	var pt = this.map.latLngToPoint(source.x,source.y);

	if(this.showLinks)
	{
		$this = this;
			//draw all the links
			var cScale = new jvm.ColorScale(this.colorScale, "polynomial", this.model.minValue, this.model.maxValue);
			$.each(this.model.data[this.model.currentCompany].coords, function(i, coord)
			{
				var pt2 = $this.map.latLngToPoint(coord[0], coord[1]);
				var value = $this.model.data[$this.model.currentCompany].values[i];
				var strokeWidth = $this.minSize + (value - $this.model.minValue) * ($this.maxSize-$this.minSize)/($this.model.maxValue-$this.model.minValue); 
				line = $this.svgLayer.line(pt.x,pt.y,pt2.x,pt2.y);
				line.attr({
					strokeLinecap: "round",
					stroke: cScale.getValue(value),
					strokeWidth: strokeWidth,
					class: "line",
					index : i
				});
				line.data("index", i);
				line.mousemove(	function(e){
					$(".my-label").show();		
					displayLabel($(".my-label"), this.data("index"));	
					positionLabel(e);
				});
				line.mouseout(	function(){		
					$(".my-label").hide();
				});
			});
		}

		//draw the source point
		var circle = this.svgLayer.circle(pt.x,pt.y,10*scale);
		circle.attr({
			fill : this.sourceColor
		});
		circle.mousemove( function(e){
			$(".my-label").show();		
			$(".my-label").html('<b>Source</b>');
			positionLabel(e);
		});
		circle.mouseout( function(){		
			$(".my-label").hide();
		});
	},

	displayLabel = function(label, index)
	{
		var nb = 0;
		if($this.model.data[$this.model.currentCompany].values[index]) nb = $this.model.data[$this.model.currentCompany].values[index];
		label.html(
			'<b>'+$this.model.data[$this.model.currentCompany].countries[index]+'</b><br/>'+
			'Subsidiaries: <b>'+nb+'</b>'
			);
	},

	positionLabel = function(e)
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
}