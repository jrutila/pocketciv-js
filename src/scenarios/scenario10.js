var reducer = require("../core/reducer");
var _ = require("underscore");

module.exports = {
    "name": "scenario10",
    "title": "The Enemy Outpost",
    "rules": "To remove 1 Enemy Outpost counter: \
<ul> \
<li>You must Decimate 10 Tribes from Region 6.</li> \
<li>If you have Military OR Metal Working, Decimate 6 Tribes from Region 6.</li> \
<li>If you have Military AND Metal Working, Decimate 3 Tribes from Region 6.</li> \
</ul>",
    "goal": "Destroy the Enemy Outpost before the end of the 8th Era",
    "description": "You win when you have destroyed the Enemy Outpost by removing all Outpost counters from Region 6. \
At the end of an Era, if an Outpost counter is still in Region 6, add one more Outpost counter.",
    'end_of_era.post': function(ctx) {
        var engine = this;
        // End of era 8
        if (engine.era == 9)
        {
            if (engine.map.areas[6].counter)
            {
                engine.gameOver(false, "You did not destroy the Enemy Outpost.");
            } else {
                engine.gameOver(true);
            }
        } else {
            console.log(engine.map.areas[6].counter)
            if (engine.map.areas[6].counter)
            {
                //engine.map.areas[6].counter = engine.map.areas[6].counter + 1;
                //ctx.initial[6].counter = engine.map.areas[6].counter;
                ctx.change(6, {counter: 1 });
            }
        }
        ctx.done && ctx.done();
    },
    'advance.post': function(ctx) {
        var engine = this;
        if (engine.map.areas[6].counter == 0)
        {
            engine.gameOver(true);
        }
        ctx.done && ctx.done();
    },
    "actions": {
        "destroy": {
            title: "Enemy Outpost",
            run: function(ctx) {
                var engine = this;

                var initial = _.pick(ctx.initial, "6");
                var cost = 10;
                var has_military = _.contains(engine.acquired, "military");
                var has_metal = _.contains(engine.acquired, "metal_working");
                if (has_metal || has_military) cost = 6;
                if (has_metal && has_military) cost = 3;

                var opts = {
                    map: engine.map.areas,
                    initial: initial,
                    shows: ['counter', 'tribes'],
                    edits: ['tribes'],
                    amount: 0,
                    cost: cost,
                    reduce: function(key, chg) {
                        var rTrb = this.initial[key].tribes - chg.tribes;
                        if (rTrb < 0) return false; // No adding tribes!
                        if (chg.tribes < 0) return false; // No negative tribes
                        var rCnt = Math.floor(rTrb / this.opts.cost);
                        this.rok = (rTrb % this.opts.cost) == 0  && // Even amount of tribes
                            rCnt <= this.initial[key].counter;
                        return { tribes: chg.tribes, counter: this.initial[key].counter - rCnt };
                    },
                    check: function() {
                        return this.rok == undefined || this.rok;
                    }
                }

                engine.reducer(new reducer.Reducer(opts), function(ok) {
                    ctx.target(ok.target);
                    ctx.done && ctx.done();
                });
            }
        }
    },
    "map": {
        "areas": {
            "1": {
                "id": 1,
                "farm": true,
                "fault": true,
                "neighbours": [ 3, 4, 6, 'western', 'frontier'],
            },
            "2": {
                "id": 2,
                "forest": true,
                "mountain": true,
                "tribes": 1,
                "neighbours": [ 3, 5, 7, 8, 'frontier'],
            },
            "3": {
                "id": 3,
                "desert": true,
                "neighbours": [ 1, 2, 8, 'frontier'] ,
            },
            "4": {
                "id": 4,
                "forest": true,
                "neighbours": [ 1, 8, 'western', 'frontier']
            },
            "5": {
                "id": 5,
                "forest": true,
                "tribes": 1,
                "neighbours": [ 2, 7, 'eastern'],
            },
            "6": {
                "id": 6,
                "forest": true,
                "counter": 1,
                "neighbours": [ 1, 'western', 'frontier'],
            },
            "7": {
                "id": 7,
                "tribes": 1,
                "forest": true,
                "neighbours": [ 2, 5, 8, 'eastern' ]
            },
            "8": {
                "id": 8,
                "mountain": true,
                "neighbours": [ 2, 3, 4, 7, 'eastern', 'frontier'],
            },
        },
        "width": 11,
        "height": 10,
        "grid":[
        [-1,-1, 0, 0, 0, 0,-1,-1,-1,-1,-1 ],
        [-1,-1, 0, 0, 0, 0,-1,-1,-1,-1,-1 ],
        [-1,-1, 0, 0, 0, 0,-1,-1,-1,-1,-1 ],
        [-1,-1, 0, 0, 0, 0,-1,-1,-1,-1,-1 ],
        [-1, 4, 4, 4, 8, 8, 8,-1,-1,-1,-1 ],
        [-1, 1, 4, 0, 0, 8, 2, 7,-1,-1,-1 ],
        [-1, 6, 1, 0, 3, 3, 2, 2, 7,-1,-1 ],
        [-1, 6, 6, 1, 3, 3, 0, 2, 7,-1,-1 ],
        [ 0, 0, 6, 1, 0, 0, 0, 5, 7,-1,-1 ],
        [ 0, 0, 0, 0, 0, 0, 0, 5, 5,-1,-1 ],
        [ 0, 0, 0, 0, 0, 0, 0, 5, 0,-1,-1 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1,-1, 0, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1,-1, 0, 0, 0, 0, 0 ],
        ] 
    }
}