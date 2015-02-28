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
                if (typeof(hasLaw) != "undefined" && hasLaw)
                {
                    // Law cancels this affect
                    ctx.done && ctx.done();
                    return;
                }
                
                var opts = reducer.Templates.basic(ctx, ['city']);
                _.each(ctx.engine.map.areas, function(a,ik) {
                    if (ctx.ctx.targets[ik] && opts.initial[ik])
                        opts.initial[ik].city = ctx.ctx.targets[ik].city;
                });
                opts.amount = 2;
                ctx.engine.reducer(new reducer.Reducer(opts), function(ok) {
                    ctx.change(ok.changes);
                    ctx.done && ctx.done();
                });
            }
        },
        'uprising': {
            'steps': {
                '2.3': "- If you have {{ adv:machining }}, Reduce City AV by 3 \
                        instead of 2. Law cancels out this effect \
                        of Machining.{% if(!has('law')) change({'city': '-3' }) %}"
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