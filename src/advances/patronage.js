module.exports = {
    name: "patronge",
    title: "Patronage",
    points: 8,
    cost: { 'tribes': 6, 'gold': 5 },
    resources: [ 'food', 'stone' ],
    requires: [ 'arts', 'theater' ],
    required_by: [ ],
    events: { },
    phases: {
        'gold_management.post': function(ctx) {
            var cities = _.size(_.pick(this.map.areas, function(area) { return area.city > 0; }));
            if (cities > 4)
            {
                var gold = ctx.changes.gold ? parseInt(ctx.changes.gold.replace('+','')) : 0;
                gold += cities-4;
                ctx.changes = {'gold': '+'+gold};
            }
            ctx.done && ctx.done();
        }
    },
    actions: { }
}