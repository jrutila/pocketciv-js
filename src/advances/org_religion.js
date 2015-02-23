var reducer = require('../core/reducer')

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
                '1.2': "+  If you have Organized Religion , only a\
maximum of 4 Regions are Affected. You select\
the Regions. You may select Regions without\
Cities. Regions with no Cities do not feel the\
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
                ctx.engine.reducer(new reducer.Reducer(opts), function(chg, ok) {
                    console.log("Selected 4 areas: " + ok.chg)
                    ctx.active_region =  _.pick(ctx.engine.map.areas, ok.chg);
                    ctx.done && ctx.done();
                });
            }
        }
    },
    phases: { },
    actions: { }
}