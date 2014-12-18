module.exports = {
    name: "simple_tools",
    title: "Simple Tools",
    description: "Reduce the cost of Decimating Tribes when increasing a City AV by 1. \
    Reduce one less Tribe when Acquiring the following \
    Advances: Masonry, Engineering, Architecture, Cartage, \
    Irrigation, Mining, Roadbuilding, Metal Working.",
    points: 4,
    cost: { },
    resources: [ 'stone', 'wood' ],
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
        },
    },
    acquired: function() {
        console.log("Acquired Simple tools, update advance costs");
        var advs = ["masonry", "engineering", "architecture", "cartage",
            "irrigation", "mining", "roadbuilding", "metal_working"];
        for (var a in advs)
        {
            var adv = this.advances[advs[a]];
            if (!adv) continue;
            adv.cost.tribes--;
            console.log(adv.title + " cost is now "+ adv.cost.tribes);
        }
    },
    actions: { },
}