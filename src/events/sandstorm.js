var reducer = require('../core/reducer')
var _ = require('underscore')

module.exports = {
    name: 'sandstorm',
    title: 'Sandstorm',
    punchline: 'Darude..',
    description: "",
    steps: {
            '1': "Draw the next card.{%; area_card() %} Circle denotes the Active Region {{ active_region }}.\
                {% reduceFarms = true %}",
            '2': "If the Active Region contains a Desert: \
                 {% if (!active_region.desert) goto('3') %} \
                 Select two Neighboring Regions. Decimate Farms and \
                 Forests in these Regions. \
                 Create Deserts in the selected Regions. \
                 {%; reduceNeighbours() %} \
                 {% break_if(true) %}",
            '3': "If the Active Region does not contain a Desert: \
                 Decimate Farms and Forests in the Active Region. \
                 Create a Desert in the Active Region. \
                 {% if (reduceFarms) change({ 'farm': false }) %} \
                 {% change({ 'forest': false, 'desert': true }) %}"
    },
    reduceNeighbours: function() {
        var ctx = this;
        var engine = this.engine;
        var initial = _.pick(engine.map.areas, function(area, ak) {
            return _.contains(this.active_region.neighbours, parseInt(ak));
        },this);
        var opts = {
            map: engine.map.areas,
            initial: initial,
            edits: [],
            shows: ['forest', 'farm', 'desert'],
            reduceFarms: reduceFarms,
            amount: 2,
            reduce: function(key) {
                this.amount--;
                var ret = { 'forest': false, 'desert': true };
                if (this.opts.reduceFarms)
                    ret.farm = false;
                return ret;
            }
        }
        
        var rdc = new reducer.Reducer(opts);
        ctx.engine.reducer(rdc, function(chg) {
            ctx.changes = chg;
            ctx.done && ctx.done();
        });
    }
}