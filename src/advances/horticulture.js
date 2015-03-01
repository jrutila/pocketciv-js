var reducer = require("../core/reducer");
var _ = require("underscore");

module.exports = {
    name: "horticulture",
    title: "Horticulture",
    description: "Decimate 4 Tribes in a Region to Create a Forest.",
    points: 8,
    cost: { 'tribes': 2 },
    resources: [ 'wood' ],
    requires: [ ],
    required_by: [ 'irrigation', 'equestrian' ],
    events: { },
    actions: {
        'forest': {
            'title': "Create a Forest",
            'run': function(ctx) {
                var engine = this;
                
                var initial = _.pick(ctx.initial, function(area) {
                    return (area.tribes >= 4 && !area.forest);
                },this);
                
                var opts = {
                    map: engine.map.areas,
                    initial: initial,
                    shows: ['tribes'],
                    edits: [],
                    amount: 0,
                    reduce: function(key) {
                        return { forest: true, tribes: this.initial[key].tribes-4 };
                    },
                    check: function() {
                        return true;
                    }
                }
                
                engine.reducer(new reducer.Reducer(opts), function(ok) {
                    ctx.change(ok.changes);
                    ctx.done && ctx.done();
                });
            }
        },
    }
}