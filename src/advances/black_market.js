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
    acquired: function(ctx) {
        if (ctx)
        {
            console.log("Gain 5 gold from Black Market")
            ctx.change('gold', 5);
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
                    if (gold != 0) {
                        ctx.change('gold', gold);
                    }
                    ctx.done && ctx.done();
                };
                var drawing = function(canstop) {
                    engine.draw(function(card) {
                        if (card == false)
                        {
                            done();
                            return;
                        }
                        gold += card.gold;
                        if (card.friendly) {
                            gold--;
                            console.log("gathered gold: "+gold);
                            if (ctx.initial.gold + gold < 0)
                            {
                                console.log("ANARCHY!")
                                ctx.target('gold', 0);
                                engine.doEvent({ name: 'anarchy' }, ctx);
                                return;
                            } else
                                drawing();
                        } else {
                            console.log("finally gathered gold: "+gold);
                            done();
                        }
                    },canstop);
                };
                drawing(true);
            }
        }
    },
}