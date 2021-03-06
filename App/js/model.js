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
    this.language = window.navigator.userLanguage || window.navigator.language;
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
    this.currentScale = 1;
    this.labelSelector = null;
}

MapView.prototype.drawMap = function () {
    this.labelSelector = $(".my-label");
    //reset the map
    $("#map").html("");
    $(".jvectormap-label").remove();
    var self = this;
    this.map = new jvm.WorldMap({
        container: $('#map'),
        zoomMax: 5,
        onRegionLabelShow: function (event, label, code) {
            //hide labels from regions
            label.hide();
            event.preventDefault();
        },
        onRegionOver: function (event, code) {
            event.preventDefault();
        },
        onViewportChange: function (e, scale) {
            self.currentScale = scale;
            self.drawLinks();
            self.drawNodes();
            self.out(e);
        }
    });
};

MapView.prototype.drawNodes = function () {
    if (this.map == null)
        return;
    var self = this;
    var min = this.model.minValue;
    var max = this.model.maxValue;
    var scale = self.currentScale;
    if (this.model.currentCompany == 0) {
        min = this.model.minTotalValue;
        max = this.model.maxTotalValue;
    }

    var s = Snap("#map svg");
    if (this.nodesLayer != null) this.nodesLayer.remove();
    this.nodesLayer = s.group();

    $.each(this.model.data[this.model.currentCompany].countries, function (i, country) {
        var value = country.value;
        var name = country.name;
        var coord = country.coords;

        var cScale = new jvm.ColorScale(self.colorScale, "polynomial", min, max);
        var radius = self.minNodeSize + (value - min) * (self.maxNodeSize - self.minNodeSize) / (max - min);

        //draw the destination point
        var pt = self.map.latLngToPoint(coord[0], coord[1]);
        var circle = self.nodesLayer.circle(pt.x, pt.y, radius * Math.sqrt(scale));
        circle.attr({
            fill: cScale.getValue(value),
            stroke: '#505050',
            "stroke-width": 1
        });
        circle.hover(
            function () {
                this.attr({
                    stroke: 'black',
                    "stroke-width": 2
                });
            },
            function () {
                this.attr({
                    fill: cScale.getValue(value),
                    stroke: '#505050',
                    "stroke-width": 1
                });
            }
        );
        circle.data("index", i);
        circle.mousemove(function (e) {
            self.labelSelector.show();
            self.displayLabel(self.labelSelector, this.data("index"));
            self.positionLabel(e);
        });
        circle.touchstart(function (e) {
            self.labelSelector.show();
            self.displayLabel(self.labelSelector, this.data("index"));
            self.positionLabel({x: e.touches[0].clientX, y: e.touches[0].clientY});
        });
        circle.mouseout(self.out);
    });
    //draw the source point
    var source = this.model.sourceCoords;
    var sourcePt = this.map.latLngToPoint(source.x, source.y);
    var circle = this.nodesLayer.circle(sourcePt.x, sourcePt.y, 6 * scale);
    circle.attr({
        fill: this.sourceColor
    });
    circle.mousemove(function (e) {
        self.labelSelector.show();
        self.labelSelector.html('<b>Source</b>');
        self.positionLabel(e);
    });
    circle.touchstart(function (e) {
        self.labelSelector.show();
        self.labelSelector.html('<b>Source</b>');
        self.positionLabel({x: e.touches[0].clientX, y: e.touches[0].clientY});
    });
    circle.mouseout(self.out);
};
MapView.prototype.out = function (e) {
    $(".my-label").hide();
};


MapView.prototype.drawLinks = function () {
    if (this.map == null)
        return;
    var self = this;
    var scale = self.currentScale;
    var s = Snap("#map svg");
    if (this.linksLayer != null) this.linksLayer.remove();
    this.linksLayer = s.group();

    var source = this.model.sourceCoords;
    var pt = this.map.latLngToPoint(source.x, source.y);

    if (this.showLinks) {
        var min = this.model.minValue;
        var max = this.model.maxValue;
        if (this.model.currentCompany == 0) {
            min = this.model.minTotalValue;
            max = this.model.maxTotalValue;
        }

        //draw all the links
        var cScale = new jvm.ColorScale(this.colorScale, "polynomial", min, max);
        $.each(this.model.data[this.model.currentCompany].countries, function (i, country) {
            var value = country.value;
            var coords = country.coords;

            var pt2 = self.map.latLngToPoint(coords[0], coords[1]);
            var controlPointX = (pt.x + pt2.x) / 2 + (pt2.y - pt.y) / 4,
                controlPointY = (pt.y + pt2.y) / 2 + (pt.x - pt2.x) / 4;

            var strokeWidth = self.minLinkSize + (value - min) * (self.maxLinkSize - self.minLinkSize) / (max - min);
            strokeWidth *= Math.sqrt(scale);
            var line = self.linksLayer.path("M" + pt.x + "," + pt.y + " Q" + controlPointX + "," + controlPointY + " " +
                pt2.x + "," + pt2.y);
            line.attr({
                strokeLinecap: "round",
                stroke: cScale.getValue(value),
                strokeWidth: strokeWidth,
                fill: 'none',
                class: "line",
                index: i
            });
            line.data("index", i);
            line.mousemove(function (e) {
                self.labelSelector.show();
                self.displayLabel(self.labelSelector, this.data("index"));
                self.positionLabel(e);
            });
            line.touchstart(function (e) {
                self.labelSelector.show();
                self.displayLabel(self.labelSelector, this.data("index"));
                self.positionLabel({x: e.touches[0].clientX, y: e.touches[0].clientY});
            });
            line.mouseout(self.out);
        });
    }
};

MapView.prototype.displayLabel = function (label, index) {
    var nb = 0;
    var name = this.model.data[this.model.currentCompany].countries[index].name;
    var sub = 'Subsidiaries';    
    if(this.model.language.toLowerCase() == "fr") sub = 'Filiales';
    if (this.model.data[this.model.currentCompany].countries[index].value) nb = this.model.data[this.model.currentCompany].countries[index].value;
        label.html('<b>' + name + '</b><br/>' + sub +': <b>' + nb + '</b>');
};

MapView.prototype.positionLabel = function (pos) {
    var left = pos.x - 15 - parseInt(this.labelSelector.width()),
        top = pos.y - 15 - parseInt(this.labelSelector.height());
    if (left < 5) {
        left = pos.x + 15;
    }
    if (top < 5) {
        top = pos.y + 15;
    }
    this.labelSelector.css({
        left: left,
        top: top
    });
}