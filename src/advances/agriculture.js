var _ = require('underscore')
module.exports = {
    name: "agriculture",
    title: "Agriculture",
    description: "Farms can be created in any Region, and you do NOT \
decimate Forests to create Farms once per turn. You still must \
Decimate 2 Tribes to create a Farm.",
    points: 5,
    cost: { 'tribes': 4 },
    resources: [ 'stone' ],
    requires: [ ],
    required_by: [ 'irrigation', 'equestrian' ],
    events: {},
    actions: {
        'farm': {
            'pre': function(ctx) {
                var engine = this;
                if (this.round.agriculture_farm_used)
                {
                    ctx.params.forest_free = false;
                } else {
                    ctx.params.forest_free = true;
                }
                ctx.done && ctx.done();
            },
            'post': function(ctx) {
                _.each(ctx.changes, function(c, key) {
                    if (c.forest === undefined && c.farm === true)
                    {
                        ctx.engine.round.agriculture_farm_used = true;
                    }
                });
                ctx.done && ctx.done();
            }
        },
    }
}