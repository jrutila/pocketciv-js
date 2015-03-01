var reducer = require("../core/reducer");

module.exports = {
    name: "mining",
    title: "Mining",
    description: "You may draw for Gold during your Advance phase at the cost \
                    of 3 Tribes in a Region with a Mountain/Volcano",
    points: 5,
    cost: { 'tribes': 1 },
    resources: [ 'stone' ],
    requires: [ ],
    required_by: [ 'surveying', 'metal_working' ],
    events: { },
    actions: {
        'mining': {
            'title': 'Mining',
            'run': function(ctx) {
                var engine = this;
                var gold = 0;
                var done = function() {
                    if (gold > 0) {
                        ctx.change('gold', gold);
                    }
                    ctx.done && ctx.done();
                };
                var initial = {};
                _.each(this.map.areas, function(area, ak) {
                    if (area.tribes >= 3 && (area.mountain || area.volcano))
                        initial[ak] = area;
                });
                var opts = {
                    map: this.map.areas,
                    initial: initial,
                    amount: 1,
                    edits: [],
                    shows: ['tribes', 'mountain', 'volcano'],
                    name: "mining",
                    reduce: function(key) {
                        this.amount--;
                        return { 'tribes': this.initial[key].tribes - 3 };
                    }
                }
                var rdc = new reducer.Reducer(opts);
                engine.reducer(rdc, function(ok) {
                    if (_.size(ok.changes) != 1) { done(); return; }
                    
                    ctx.change(ok.changes);
                    var drawing = function(canstop) {
                        engine.draw(function(card) {
                            if (card === false)
                                done();
                            else if (card.gold == 0) {
                                gold = 0;
                                console.log("Mining ended for zero gold");
                                done();
                            } else {
                                gold += card.gold;
                                console.log("gathered gold: "+gold);
                                drawing(true);
                            }
                        }, canstop);
                    };
                    drawing(false);
                });
            }
        }
    },
}