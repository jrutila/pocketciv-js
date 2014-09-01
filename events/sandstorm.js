var reducer = require('../core/reducer')
var _ = require('underscore')

module.exports = {
    name: 'sandstorm',
    title: 'Sandstorm',
    punchline: 'Darude..',
    description: "",
    steps: {
            '1': "Draw the next card.{%; area_card() %} Circle denotes the Active Region {{ active_region }}.",
            '2': " If the Active Region contains a Desert: \
                 Select two Neighboring Regions. Decimate Farms and \
                 Forests in these Regions. \
                 Create Deserts in the selected Regions. \
                 {%; reduceNeighbours() %} \
                 {% break_if(active_region.desert) %}",
            '3': "If the Active Region does not contain a Desert: \
                 Decimate Farms and Forests in the Active Region. \
                 Create a Desert in the Active Region. \
                 {% change({ 'forest': false, 'farm': false, 'desert': true }) %}"
    },
    reduceNeighbours: function() {
        var ctx = this;
        // If there is no desert in this region, return
        if (!ctx.active_region.desert) {
            ctx.done && ctx.done();
            return;
        }
        
        var rdc = new reducer.Reducer(ctx.engine);
        rdc.startAmount = 2;
        rdc.areas = function() {
            var areas = {};
            if (this.visited.length == 2)
                return areas;
            var unvisitedngh = _.difference(ctx.active_region.neighbours, this.visited)
            _.each(_.pick(this.engine.map.areas, unvisitedngh), function(area, key) {
                areas[key] = area;
            });
            return areas;
        }
        rdc.reduce = function(area) {
            this.amount--;
            return { 'farm': false, 'forest': false, 'desert': true }
        }
        ctx.engine.reducer(rdc, function(chg) {
            ctx.changes = chg;
            ctx.done && ctx.done();
        });
    }
}