function MapData(args) {
	args = args || {};
	this.file = args.file || '';
	this.sourceCoords = args.sourceCoords || [];
	this.data = [];
	this.minValue = 100;
	this.maxValue = 0;
	this.currentCompany = 0;
}

function MapView(args) {
	args = args || {};	
	this.map = null;
	this.minSize = args.minSize || 5;
	this.maxSize = args.maxSize || 30;
	this.colorScale = args.colorScale || ['#d3494e', '#d10b13'];
	this.sourceColor = args.sourceColor || "#33F";
	this.svgLayer = null;
}