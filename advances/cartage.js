module.exports = {
    name: "cartage",
    title: "Cartage",
    points: 2,
    cost: { 'tribes': 2 },
    resources: [ 'stone' ],
    requires: [ ],
    required_by: [ 'roadbuilding' ],
    events: { },
    actions: { },
    phases: {
        'city_support.post': function(ctx) {
            // TODO: Implement me!
            ctx.changes['gold'] = '+5';
        }
    }
}