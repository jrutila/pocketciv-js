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
            {% if (!active_region.fault) { change({ 'city': -1, 'tribes': -1, 'fault': true }); } %} \
            {% break_if(!active_region.fault) %}",
            '3.1': "If the Active Region has a Fault Line: \
Reduce City AV by 3 in the Active Region. \
Reduce Tribes by 4 in the Active Region. \
Decimate all Wonders in the Active Region \
Create a Fault Line in up to two Neighboring Regions \
of your choice that do not have Fault Lines.\
                {% change({ 'city': -3, 'tribes': -4 }) %} \
                {% target({ 'wonders': [] }) %} \
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
        
        var initial = _.pick(this.engine.map.areas, function(a, ak) {
            return _.contains(this.active_region.neighbours, parseInt(ak)) && !a.fault;
        },this);
        
        var opts = {
            initial: initial,
            map: this.engine.map.areas,
            amount: 2,
            shows: ['fault'],
            edits: [],
            area: this.active_region,
            reduce: function(key) {
                this.amount--;
                return { 'fault': true }
            },
        }
        
        var rdc = new reducer.Reducer(opts);
        ctx.engine.reducer(rdc, function(ok) {
            ctx.change(ok.changes);
            ctx.done && ctx.done();
        });
    },
    reducePopulation: function() {
        var ctx = this;
        
        ctx.changes = ctx.ctx.changes;
        var opts = reducer.Templates.basic(ctx, 'tribes', { neighbours: true, active_region: true });
        opts.amount = populationLoss;
        
        var rdc = new reducer.Reducer(opts);
        ctx.engine.reducer(rdc, function(ok) {
            ctx.change(ok.changes);
            ctx.done && ctx.done();
        });
        
    }
}