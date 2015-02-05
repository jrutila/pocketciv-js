var reducer = require('../core/reducer')
var _ = require('underscore')

module.exports = {
    name: 'earthquake',
    title: 'Earthquake',
    punchline: "Let's get ready to RUMBLE!",
    description: "",
    steps: {
            '1': "Draw the next card.{%; area_card() %} Circle denotes the Active Region {{ active_region }}.",
            '2': " If the Active Region has no Fault Line: \
            Reduce City AV by 1 in the Active Region. \
            Reduce Tribes by 1 in the Active Region. \
            Create a Fault Line in the Active Region, if a Fault \
            Line does not exist already. \
            {% if (!active_region.fault) { change({ 'city': '-1', 'tribes': '-1', 'fault': true }); } %} \
            {% break_if(!active_region.fault) %}",
            '3.1': "If the Active Region has a Fault Line: \
Reduce City AV by 3 in the Active Region. \
Reduce Tribes by 4 in the Active Region. \
Decimate all Wonders in the Active Region \
Create a Fault Line in up to two Neighboring Regions \
of your choice that do not have Fault Lines.\
                {% change({ 'city': '-3', 'tribes': '-4' }) %} \
                {%; createFaults() %}",
            '3.2': "Draw the next Event card. {%; draw_card() %} Using the symbols \
shown on the ORIGINAL Event card to the far right of \
the Earthquake event, add up the values in the symbols \
on the newly drawn card. The total value that this \
creates determines Population Loss. Decimate Tribes equal to the amount\
of Population Loss in any combination of the Active\
Region and Neighboring Regions. You may choose to \
divide up the Population loss any way you see fit, as \
long as you Decimate Tribes up to the described value.\
                {% populationLoss = card_value(event.expr) %} \
                {%; reducePopulation() %} \
                    "
    },
    createFaults: function() {
        var ctx = this;
        // If there is no fault in this region, return
        if (!ctx.active_region.fault) {
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
                if (!area.fault)
                    areas[key] = area;
            });
            return areas;
        }
        rdc.reduce = function(area) {
            this.amount--;
            return { 'fault': true }
        }
        ctx.engine.reducer(rdc, function(chg) {
            _.extend(ctx.changes, chg);
            ctx.done && ctx.done();
        });
    },
    reducePopulation: function() {
        var ctx = this;
        // If there is no fault in this region, return
        if (!ctx.active_region.fault) {
            ctx.done && ctx.done();
            return;
        }
        
        var rdc = new reducer.Reducer(ctx.engine);
        rdc.startAmount = populationLoss;
        rdc.mode = reducer.Modes.Overall;
        rdc.areas = function() {
            var areas = {};
            var changes = this.changes;
            var meneigh = _.union(ctx.active_region.id, ctx.active_region.neighbours)
            _.each(_.pick(this.engine.map.areas, meneigh), function(area, key) {
                var rdc = (changes && changes[area.id] && parseInt(changes[area.id].tribes))
                            || 0;
                            console.log(rdc)
                if (area.id == ctx.active_region.id)
                    rdc -= 4;
                if (area.tribes && area.tribes > -1*rdc)
                    areas[key] = area;
            });
            return areas;
        }
        rdc.reduce = function(chg, area) {
            this.amount += chg.tribes;
            var tRdc = chg.tribes;
            return { 'tribes': (tRdc).toString() }
        }
        ctx.engine.reducer(rdc, function(chg) {
            _.each(chg, function(val, key) {
                if (_.has(ctx.changes, key))
                    ctx.changes[key].tribes =
                        (
                        (parseInt(ctx.changes[key].tribes) || 0) + 
                        parseInt(val.tribes)).toString()
                else ctx.changes[key] = val;
            })
            ctx.done && ctx.done();
        });
        
    }
}