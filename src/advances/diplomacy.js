var reducer = require('../core/reducer');

module.exports = {
    name: "diplomacy",
    title: "Diplomacy",
    points: 10,
    cost: { 'tribes': 4, 'gold': 1 },
    resources: [ 'wood' ],
    requires: [ 'government' ],
    required_by: [ ],
    events: {
        'visitation': {
            'steps': {
                '1.1': "+ If you have {{ adv:diplomacy }}, you can \
                        attempt to make this Empire a Trading Partner.",
                '1.2': "+ Decimate any amount of Tribes and Gold to \
                        create a Diplomatic Offer. Add 1 point to \
                        your offer for each 1 Gold or 1 Tribe you decimate. \
                        {%; make_offer() %} {% if (diplomatic_offer == 0) goto('2') %}",
                '1.3': "+ Draw the next event card {%; draw_card() %}. If \
                        your diplomatic offer ({{ diplomatic_offer }}) is \
                        greater or equal to the value of the red circle \
                        ({{ card_value('c') }}), then you have created a \
                        Trading Partner with the visiting empire. \
                        {% if (diplomatic_offer >= card_value('c')) start_trading(event.visitor) %}",
                '1.4': "+ If you have created a Trading Partner, go \
                        immediately to TRADE. {% if (trading(event.visitor)) trade() %}"
            },
            'start_trading': function(visitor) {
                console.log("Start trading with "+visitor)
                this.engine.trading.push(visitor);
            },
            'make_offer': function() {
                var initial = _.pick(engine.map.areas, function(a) {
                    return a.tribes > 0;
                })
                initial.gold = engine.gold;
                var opts = {
                    map: engine.map.areas,
                    initial: initial,
                    shows: ['tribes', 'gold'],
                    edits: ['tribes', 'gold'],
                    amount: 0,
                    reduce: function(key, chg) {
                        if (key == 'gold')
                            this.amount += this.initial.gold - chg;
                        else
                            this.amount += this.initial[key].tribes - chg.tribes;
                        return chg;
                    },
                    check: function() {
                        return this.amount >= 0;
                    }
                }
                var ctx = this;
                ctx.engine.reducer(new reducer.Reducer(opts), function(ok) {
                    ctx.skip = undefined;
                    diplomatic_offer = ok.amount;
                    console.log("Making offer of "+diplomatic_offer)
                    ctx.change(ok.changes);
                    ctx.done && ctx.done();
                });
            }
        },
    },
    actions: { },
}