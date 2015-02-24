var reducer = require('../core/reducer');
var _ = require('underscore');

module.exports = {
    name: "org_religion",
    title: "Organized Religion",
    points: 8,
    cost: { 'tribes': 6, 'gold': 6 },
    resources: [ 'stone', 'wood' ],
    requires: [ 'mythology' ],
    required_by: [ 'ministry' ],
    events: {
        'uprising': {
            'steps': {
                // TODO:
            }
        },
        'anarchy': {
            'steps': {
                '1.2': "+  If you have {{ adv:org_religion }} , only a \
maximum of 4 Regions are Affected. You select \
the Regions. You may select Regions without \
Cities. Regions with no Cities do not feel the \
effects of Anarchy. {%; selectRegions() %}"
            },
            selectRegions: function() {
                var ctx = this;
                if (_.size(ctx.engine.map.areas) <= 4)
                {
                    // No reason to select for areas
                    ctx.done && ctx.done();
                    return;
                }
                var opts = {
                    map: ctx.engine.map.areas,
                    initial: ctx.engine.map.areas,
                    amount: 4,
                    shows: ['tribes', 'city'],
                    edits: [],
                    reduce: function(key) {
                        this.amount--;
                    }
                }
                ctx.engine.reducer(new reducer.Reducer(opts), function(changes, chg) {
                    console.log("Selected 4 areas: " + chg)
                    ctx.active_region =  _.pick(ctx.engine.map.areas, chg);
                    ctx.done && ctx.done();
                });
            }
        }
    },
    phases: { },
    actions: { }
}