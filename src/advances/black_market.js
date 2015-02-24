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
    phases: {
        'gold_decimate.post': function(ctx) {
            console.log("Decimate one gold because of black market")
            if (this.gold && (!ctx.changes || !ctx.changes['gold']))
                ctx.changes = { 'gold': '-1' };
            ctx.done && ctx.done();
        }
    },
    actions: {
        'black_market': {
            'title': 'Black Market',
            'run': function(ctx) {
                var engine = this;
                var gold = 0;
                var done = function() {
                    if (gold > 0) {
                        ctx.changes = { 'gold': '+'+gold };
                    } else if (gold < 0)
                    {
                        ctx.changes = { 'gold': gold.toString() };
                    }
                    ctx.done && ctx.done();
                };
                var drawing = function() {
                    engine.draw(function(card) {
                        gold += card.gold;
                        if (card.friendly) {
                            gold--;
                            console.log("gathered gold: "+gold);
                            if (engine.gold + gold < 0)
                            {
                                console.log("ANARCHY!")
                                engine.doEvent({ name: 'anarchy' }, function(chg) {
                                    ctx.changes = chg;
                                    gold = 0;
                                    ctx.changes.gold = "0";
                                    done();
                                });
                            } else
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