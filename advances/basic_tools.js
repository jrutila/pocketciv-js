module.exports = {
    name: "basic_tools",
    title: "Basic Tools",
    description: "Reduce the cost of Decimating Tribes when increasing a City AV by 1.",
    points: 1,
    cost: { },
    resources: [ ],
    requires: [ ],
    required_by: [ ],
    events: { },
    phases: {
        'city_advance.pre': function(ctx) {
            console.log('Basic tools reduce cost by 1')
            if (this.round.city_advance_discount === undefined)
                this.round.city_advance_discount = 1;
            else
                this.round.city_advance_discount++;
            ctx.done && ctx.done();
        }
    },
    actions: { },
}