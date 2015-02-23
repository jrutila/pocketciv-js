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
                // TODO: Refactor!!
                var rdc = new reducer.Reducer(this.engine);
                rdc.mode = reducer.Modes.Overall;
                rdc.areas = function() {
                    var areas = {};
                    _.each(this.engine.map.areas, function(area, key) {
                        if (area.tribes)
                            areas[key] = area;
                    });
                    return areas;
                };
                rdc.reduce = function(chg, area) {
                    this.amount = 0;
                    return { 'tribes': chg.tribes }
                }
                var ctx = this;
                ctx.engine.reducer(rdc, function(chg) {
                    console.log("Making offer!")
                    diplomatic_offer = 0;
                    _.each(chg, function(chg, area) {
                        diplomatic_offer += -1*parseInt(chg.tribes);
                    });
                    console.log("of "+diplomatic_offer)
                    if (diplomatic_offer > 0)
                        ctx.engine.areaChanger(chg, ctx.done);
                });
            }
        },
    },
    actions: { },
}