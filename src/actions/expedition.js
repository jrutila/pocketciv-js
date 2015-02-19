var _ = require("underscore")
var reducer = require("../core/reducer");

module.exports = {
    title: "Expedition",
    run: function() {
        console.log("Running expedition")
        var engine = this;
        var rdc = new reducer.Reducer(this);
        rdc.mode = reducer.Modes.Overall;
        rdc.startAmount = 0;
        rdc.expSea = engine.params.sea_expedition || false;
        rdc.split = engine.params.expedition_split || 1;
        rdc.sea_multi = engine.params.expedition_sea_force || 1;
        rdc.frontier_multi = engine.params.expedition_frontier_force || 1;
        rdc.initValues = { from: undefined };
        
        rdc.areas = function() {
            var areas = {};
            _.each(engine.map.areas, function(area, aid) {
                if (area.neighbours.indexOf('frontier') > -1)
                    areas[aid] = area;
                else if (this.expSea && _.some(area.neighbours, reducer.isSea))
                    areas[aid] = area;
            }, this);
            return areas;
        }
        
        rdc.reduce = function(r, area) {
            if (r.tribes > 0)
                return false;
            else if (r.tribes < 0)
            {
                // No two areas to go to expedition
                if (this.from)
                    return false;
                this.from = area;
                this.amount += r.tribes;
                return { 'tribes': r.tribes.toString() };
            }
            return {};
        }
        
        engine.reducer(rdc, function(chg) {
            var expforce = 0;
            for (var a in chg)
                expforce += -1*chg[a].tribes;
            console.log("Expedition force: "+expforce);
            if (expforce > 0)
                engine.draw(function(c) {
                    var sgold = 0;
                    var fgold = 0;
                    // Frontier expedition
                    if (engine.map.areas[a].neighbours.indexOf('frontier') > -1)
                    {
                        fgold = expforce * rdc.frontier_multi - c.hexagon / rdc.split;
                    }
                    // Sea expedition
                    if (rdc.expSea && _.some(engine.map.areas[a].neighbours, reducer.isSea))
                    {
                        sgold = expforce * rdc.sea_multi - c.square / rdc.split;
                        console.log("Sea gold: "+sgold);
                        console.log("Frontier gold: "+fgold);
                    }
                    var gold = Math.max(fgold, sgold);
                    console.log("Expedition gold: "+gold);
                    if (gold > 0)
                        chg.gold = "+"+gold;
                    engine.areaChange(chg);
                })
        });
    }
}