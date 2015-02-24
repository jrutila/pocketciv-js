module.exports = {
    name: "shipping",
    title: "Shipping",
    points: 8,
    cost: { 'tribes': 4, 'gold': 2 },
    resources: [ 'wood' ],
    requires: [ ['navigation', 'fishing'] ],
    required_by: [],
    events: {
        'trade': {
            'steps': {
                '2': "+ If you have {{ adv:shipping }}, and the card that you \
                    have just drawn to indicate your Gold income \
                    also has a HANDSHAKE, draw another Event \
                    card. Increase the amount of Gold in your \
                    common stock by the value in the GREEN \
                    SQUARE on this newly drawn card.{%; drawMore() %}"
            },
            drawMore: function() {
                var ctx = this;
                if (ctx.card.friendly)
                {
                    ctx.engine.draw(function(c) {
                        ctx.merge({ 'gold': '+'+c.square });
                        ctx.done && ctx.done();
                    });
                } else 
                    ctx.done && ctx.done();
            }
        }
    },
    phases: { },
    actions: { }
}