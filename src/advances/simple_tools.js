module.exports = {
    name: "simple_tools",
    title: "Simple Tools",
    description: "Reduce the cost of Decimating Tribes when increasing a City AV by 1. \
    Reduce one less Tribe when Acquiring the following \
    Advances: Masonry, Engineering, Architecture, Cartage, \
    Irrigation, Mining, Roadbuilding, Metal Working.",
    points: 4,
    cost: { 'tribes': 4 },
    resources: [ 'stone', 'wood' ],
    requires: [ ],
    required_by: [ ],
    events: { },
    phases: { },
    acquired: function() {
        console.log('Simple tools reduce cost by 1')
        if (this.params.city_advance_discount === undefined)
            this.params.city_advance_discount = 1;
        else
            this.params.city_advance_discount++;
            
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