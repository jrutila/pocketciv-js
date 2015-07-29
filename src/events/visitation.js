var reducer = require('../core/reducer');
var attack = require('./attack');
var _ = require('underscore');

module.exports = {
    name: 'visitation',
    title: 'Visitation: %(visitor)s',
    punchline: 'We come in peace, NOT!',
    description: "",
    steps: {
            '1': "If you are a Trading Partner with the visiting \
                Empire, go immediately to TRADE.\
                {% if (trading(event.visitor)) trade() %}" ,
            '2': "If you are not Trading Partner with this Empire, \
                draw the next Event card and see if it has Handshake.\
                {%; draw_card() %}",
            '2.1': "If there is Handshake, empire is Trading with you. \
                Go to TRADE. {% if (card.friendly) trade() %}",
            '3': "If there is no Handshake, then the Empire is attacking you!",
            '3.1': "Draw the next Event card {%; area_card() %}. Read square indicates the active region {{ active_region }}.",
            '3.2': "If the active region does not neighbor the Sea or Frontier, then there is no attack.{% break_if(no_attack()) %}",
            '3.3': "Draw the next Event card {%; draw_card() %}. Based on the symbols on the original \
                    event card ({{ event.expr }}) {% attack_force = card_value(event.expr) %}calculate the Attacking Force {{ attack_force }}.",
            '3.4': 'Goto ATTACK{%; sub("attack") %}',
    },
    trading: function(visitor) {
        return this.engine.trading.indexOf(visitor) > -1;
    },
    trade: function() {
        console.log("Trading")
        var ctx = this;
        var oldDone = ctx.done;
        ctx.done = function() {
            ctx.break = true;
            oldDone && oldDone();
        };
        ctx.sub("trade");
        ctx.wait = true;
    },
    no_attack: function() {
        return !(this.active_region && ( _.any(this.active_region.neighbours, function(r) { return r === "frontier"; }) || this.engine.isSeaNeighbour(this.active_region)))
    },
    
}
