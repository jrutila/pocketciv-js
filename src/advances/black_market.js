module.exports = {
    name: "black_market",
    title: "Black Market",
    description: "TBD",
    points: 1,
    cost: { },
    resources: [ ],
    requires: [ 'culture_of_thievery' ],
    required_by: [ ],
    events: { },
    acquired: function(onload) {
        if (!onload)
        {
            console.log("Gain 5 gold from Black Market")
            this.areaChange({'gold': '+5'}, function() { })
        }
    },
    phases: { },
    actions: {
        'black_market': {
            'title': 'Black Market',
            'run': function(ctx) {
                var engine = this;
                var gold = 0;
                var done = function() {
                    if (gold) {
                        ctx.changes = { 'gold': '+'+gold };
                        ctx.done && ctx.done();
                    }
                };
                var drawing = function() {
                    engine.draw(function(card) {
                        gold += card.gold;
                        if (card.friendly) {
                            gold--;
                            console.log("gathered gold: "+gold);
                            if (engine.gold + gold < 0)
                                console.log("ANARCHY!")
                            drawing();
                        } else {
                            console.log("gathered gold: "+gold);
                            done();
                        }
                    });
                };
                drawing();
            }
        }
    },
}