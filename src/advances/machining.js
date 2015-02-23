var reducer = require("../core/reducer");
var _ = require('underscore')

module.exports = {
    name: "machining",
    title: "Machining",
    description: " You may substitute Wood for Stone requirements, and vice versa. \
                Reduce the cost of Decimating Tribes when increasing a City AV by 1.",
    points: 12,
    cost: { 'tribes': 8, 'gold': 10 },
    resources: [ 'food', 'stone' ],
    requires: [ 'engineering', 'metal_working' ],
    required_by: [ ],
    events: {
        'anarchy': {
            'steps': {
                '4': "- If you have {{ adv:machining }}, Reduce an additional \
                        2 City AV of your choice (these may be from the \
                same, or different Cities). Law cancels this affect. \
                       {%; reduceCities() %}",
            },
            reduceCities: function() {
                var ctx = this;
                var opts = reducer.Templates.basic(ctx, ['city']);
                opts.amount = 2;
                ctx.engine.reducer(new reducer.Reducer(opts), function(chg) {
                    ctx.merge(chg);
                    ctx.done && ctx.done();
                });
            }
        },
        'uprising': {
            'steps': {
                // TODO:
            }
        },
    },
    phases: { },
    acquired: function() {
            console.log('Machining reduce cost by 1')
            if (this.params.city_advance_discount === undefined)
                this.params.city_advance_discount = 1;
            else
                this.params.city_advance_discount++;
    },
    actions: {
        'acquire': {
            // TODO: Substitute wood for stone
        }
    },
}