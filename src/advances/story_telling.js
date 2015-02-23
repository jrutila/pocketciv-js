module.exports = {
    name: "story_telling",
    title: "Story Telling",
    description: "Reduce one less Tribe when Acquiring the following \
    Advances: Mythology, Music, Literacy, Philosophy,\
    Arts, Theater, Org. Religion, Law",
    points: 2,
    cost: { 'tribes': 4 },
    resources: [ 'food' ],
    requires: [ ],
    required_by: [ ],
    events: { },
    phases: { },
    acquired: function() {
        console.log("Acquired Story telling, update advance costs");
        var advs = ["mythology", "music", "literacy", "philosophy",
            "arts", "theater", "org_religion", "law"];
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