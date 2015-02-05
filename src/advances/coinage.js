module.exports = {
    name: "coinage",
    title: "Coinage",
    description: "Do not Decimate Gold during upkeep. Effectively,\
you can now store Gold for the entire game.",
    points: 3,
    cost: { 'tribes': 2, 'gold': 3 },
    resources: [ 'stone' ],
    requires: [ ],
    required_by: [ 'banking' ],
    events: { },
    phases: {
        'gold_decimate.pre': function(ctx) {
            ctx.do_not_decimate = true;
            ctx.done && ctx.done();
        }
    },
    actions: { },
}