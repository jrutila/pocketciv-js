var reducer = require('../core/reducer')
var _ = require('underscore')

module.exports = {
    name: 'superstition',
    title: 'Superstition',
    punchline: 'Like the sand in a time glass...',
    description: "",
    steps: {
            '1': "Draw the next event card {%; draw_card() %}. Using the symbols shown \
            on the ORIGINAL Event card ({{ event.expr }}) \
            , add up the values in the symbols on \
            the  newly drawn card. {% discard_amount = card_value(event.expr) %} \
            This value ({{ discard_amount }}) indicates how many Event cards you \
            must draw and discard. If you run out of cards, do the End of Era and continue.\
            ",
            '-': "{%; discard_cards() %}"
    },
    discard_cards: function() {
        var ctx = this;
        var engine = ctx.engine;
        var left = discard_amount;
        console.log("Superstition: Discarding "+left+" cards")
        var drawing = function() {
            var canstop = ctx.canstop && ctx.canstop() || false;
            engine.draw(function(card) {
                if (card != false)
                    left--;
                else
                    left = 0;
                if (left > 0)
                    drawing();
                else
                    ctx.done && ctx.done();
            }, canstop);
        };
        drawing();
    }
}