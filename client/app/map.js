var HT = require("../components/HexagonTools/js/HexagonTools");
HT.Grid = require("../components/HexagonTools/js/Grid");
var Map = Map || {}
var Region = Region || {}
var Sea = Sea || {}
var Land = Land || {}
var Game = Game || {}

function findHexWithWidthAndHeight(width, height)
{
	var y = height/2.0;

	//solve quadratic
	var a = -3.0;
	var b = (-2.0 * width);
	var c = (Math.pow(width, 2)) + (Math.pow(height, 2));

	var z = (-b - Math.sqrt(Math.pow(b,2)-(4.0*a*c)))/(2.0*a);

	var x = (width - z)/2.0;

	console.log("Values for Hex: Width:" + width + " Height:" + height + " Side Length, z:" + z + " x:" + x + " y:" + y);

	HT.Hexagon.Static.WIDTH = width;
	HT.Hexagon.Static.HEIGHT = height;
	HT.Hexagon.Static.SIDE = z;
}

Map = function(map) {
    findHexWithWidthAndHeight(80, 80)
	HT.Hexagon.Static.DRAWSTATS = true;

    this.width = map.width*80 
    this.height = map.height*80
    this.grid = new HT.Grid(this.width, this.height)
    this.hex = {}
    this.regions = { 1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 7:[], 8:[]}
    this.symbols = {}

    for (var h = 0; h < this.grid.Hexes.length; h++)
    {
        var hex = this.grid.Hexes[h]        
        var reg = 0
        if (hex.PathCoOrdY in map.grid)
            if (hex.PathCoOrdX in map.grid[hex.PathCoOrdY])
                var reg = map.grid[hex.PathCoOrdY][hex.PathCoOrdX]
        this.hex[hex.Id] = reg
        if (reg > 0)
        {
            this.regions[reg].push(hex)
        }
        //if ("id" in reg)
            //this.regionHexes[reg.id-1].push(hex)
    }
}

function drawLand(ctx, region) {
    var land = Qt.createQmlObject('import QtQuick 2.0; Image { source: "image://res/modern/land'+region+'.png"; visible: false; }', parent)
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(land, 0, 0)
}

var regionCount = 8
var landRegion = regionCount
var seaRegion = regionCount+1

function getCPKey(p1, p2)
{
    var p1x = Math.floor(p1[0])
    var p1y = Math.floor(p1[1])
    var p2x = Math.floor(p2[0])
    var p2y = Math.floor(p2[1])

    if (p1y > p2y)
        return [p1x, p1y, p2x, p2y]
    else if (p1y == p2y && p1x < p2x)
        return [p1x, p1y, p2x, p2y]
    return [p2x, p2y, p1x, p1y]
}

Map.prototype.paint = function(ctx) {
    console.log('Painting the grid')
    var hexCnvs = {}
    var focusCnvs = {}
    var hexCtxs = {}
    var focusCtxs = {}
    var activeCtxs = {}
    for (var i = -1; i <= regionCount; i++)
    {
        var cnv = this.getCanvas(i);
        hexCnvs[i] = cnv[0];
        hexCtxs[i] = cnv[0].getContext('2d');
        if (cnv[1]) {
            focusCnvs[i] = cnv[1];
            focusCtxs[i] = cnv[1].getContext('2d');
        }
        if (cnv[2]) {
            //activeCnvs[i] = cnv[2];
            activeCtxs[i] = cnv[2].getContext('2d');
        }
        hexCtxs[i].clearRect(0,0,1000, 1000);
        focusCtxs[i] && focusCtxs[i].clearRect(0,0,1000, 1000);
        activeCtxs[i] && activeCtxs[i].clearRect(0,0,1000, 1000);
    }

    for (var h = 0; h < this.grid.Hexes.length; h++)
    {
        var hex = this.grid.Hexes[h]
        var ctxid = this.hex[hex.Id]
        if (ctxid <= regionCount)
            hex.draw(hexCtxs[ctxid], ctxid)
    }

    var regions = this.regions;
    for (var i = -1; i <= regionCount; i++)
    {
        hexCtxs[i].globalCompositeOperation = 'source-in';
        var img = this.getImage(i);
        var ctx = hexCtxs[i];
        var region = regions[i]
        img && ctx.drawImage(img, 0, 0);
        var commonPoints = {};
        for (var h in region) {
            var hex = region[h];
            for (var n = 0; n < 6; n++) {
                var start = [hex.Points[n].X, hex.Points[n].Y]
                var end = [hex.Points[(n + 1) % 6].X, hex.Points[(n + 1) % 6].Y]

                var key = getCPKey(start, end)

                if (!(key in commonPoints)) commonPoints[key] = 0
                commonPoints[key]++;
            }
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 1
        ctx.strokeStyle = "black"
        for (var c = 0; c < 3; c++) {
            for (var h in region) {
                var hex = region[h];

                for (var n = 0; n < 6; n++) {
                    var start = [hex.Points[n].X, hex.Points[n].Y]
                    var end = [hex.Points[(n + 1) % 6].X, hex.Points[(n + 1) % 6].Y]

                    if (commonPoints[getCPKey(start, end)] > 1) continue;
                    ctx.beginPath()
                    ctx.moveTo(start[0], start[1])
                    ctx.lineTo(end[0], end[1])
                    ctx.closePath()
                    ctx.stroke()
                }
            }
            if (focusCtxs[i] && ctx != focusCtxs[i]) {
                ctx = focusCtxs[i];
                ctx.strokeStyle = "red";
                ctx.lineWidth = 3;
            }
            else if (activeCtxs[i] && ctx != activeCtxs[i]) {
                ctx = activeCtxs[i];
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 5;
            }
        }
    }
    
    for (var reg in this.regions)
    {
        if (this.regions[reg].length > 0)
        {
            this.symbols[reg] = {};
            var mp = this.regions[reg][0].MidPoint;
            this.symbols[reg]['area'] = new HT.Point(mp.X-25, mp.Y-25)
            this.symbols[reg]['fault'] = new HT.Point(mp.X, mp.Y)
            mp = this.regions[reg][1].MidPoint;
            this.symbols[reg]['tribes'] = new HT.Point(mp.X-25, mp.Y-25)
            this.symbols[reg]['desert'] = new HT.Point(mp.X, mp.Y)
            mp = this.regions[reg][2].MidPoint;
            this.symbols[reg]['city'] = new HT.Point(mp.X-25, mp.Y-25)
            this.symbols[reg]['farm'] = new HT.Point(mp.X, mp.Y)
            mp = this.regions[reg][3].MidPoint;
            this.symbols[reg]['forest'] = new HT.Point(mp.X-25, mp.Y-25)
            this.symbols[reg]['mountain'] = new HT.Point(mp.X, mp.Y)
            this.symbols[reg]['volcano'] = new HT.Point(mp.X, mp.Y)


        }
    }
    /*
    for (var r = 1; r <= regionCount; r++)
    {
        for (var h = 0; h < this.grid.Hexes.length; h++)
        {
            var hex = this.grid.Hexes[h]
            var rid = this.hex[hex.Id]
            if (rid === r)
            {
                var neigh = this.grid.GetNeighbors(hex.Id)
                for (var n = 0; n < neigh.length; n++)
                {
                    if (this.hex[neigh[n].Id].id !== rid)
                    {
                        ctx.beginPath()
                        ctx.moveTo(hex.Points[n].X, hex.Points[n].Y)
                        ctx.lineTo(hex.Points[(n+1)%6].X, hex.Points[(n+1)%6].Y)
                        ctx.closePath()
                        ctx.lineWidth = 1
                        ctx.strokeStyle = "black"
                        ctx.stroke()
                    }
                }
            }
        }
    }
    */
}

Map.prototype.getRegionAt = function(x, y) {
    var p = {}
    p.X = x
    p.Y = y
    var hex = this.grid.GetHexAt(p)
    return hex != undefined ? this.hex[hex.Id] : undefined;
}

module.exports = Map;