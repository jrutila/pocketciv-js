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
        
        var opts = {
            initial: this.engine.map.areas,
            map: this.engine.map.areas,
            amount: 2,
            shows: [],
            edits: [],
            area: this.active_region,
            reduce: function(key) {
                this.amount--;
                return { 'fault': true }
            },
            current: function(chg, key, val) {
                if (!key)
                {
                    var ngh = _.pick(this.initial, this.opts.area.neighbours);
                    this.current = _.filter(ngh, function(n) { return !n.fault; });
                }
            }
        }
        
        var rdc = new reducer.Reducer(opts);
        ctx.engine.reducer(rdc, function(ok) {
            ctx.change(ok.changes);
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
        var initial = {};
        _.each(this.engine.map.areas, function(area, id) {
            if (area.tribes && _.contains(this.active_region.neighbours, parseInt(id)))
                initial[id] = { 'tribes': area.tribes }
        },this);
        if (this.active_region.tribes - 4 > 0)
            initial[this.active_region.id] =
             { 'tribes': this.active_region.tribes - 4 };
        
        var opts = {
            initial: initial,
            map: this.engine.map.areas,
            amount: populationLoss,
            area: this.active_region,
            reduce: function(key, chg) {
                this.amount -= this.initial[key].tribes - chg.tribes;
                return { 'tribes': chg.tribes };
            },
            current: function(chg, key, val) {
                if (!key)
                {
                }
            }
        }
        
        var rdc = new reducer.Reducer(opts);
        ctx.engine.reducer(rdc, function(ok) {
            ctx.change(ok.changes);
            ctx.done && ctx.done();
        });
        
    }
}