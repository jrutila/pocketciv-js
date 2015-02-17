module.exports = {
    name: "banking",
    title: "Banking",
    description: "During Upkeep, if you have over 3 Gold in your \
                stock, add 1 Gold",
    points: 5,
    cost: { 'tribes': 4, 'gold': 6 },
    resources: [ 'stone' ],
    requires: [ 'coinage' ],
    required_by: [ ],
    events: { },
    phases: {
        'gold_management.pre': function(ctx) {
            if (this.gold > 3) {
                ctx.changes = { 'gold': '+1' };
            }
            ctx.done && ctx.done();
        }
    },
    actions: { },
};