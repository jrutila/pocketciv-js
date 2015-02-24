module.exports = {
    name: "philosophy",
    title: "Philosophy",
    points: 12,
    cost: { 'tribes': 6 },
    resources: [ 'food' ],
    requires: [ 'meditation' ],
    required_by: [ 'law' ],
    events: {
        'visitation': {
            'steps': {
                '2.2': "+ If you have {{ adv:philosophy }}, you may draw a \
                second Event card in an attempt to draw a HANDSHAKE symbol.\
                {%; draw_another() %}"
            },
            draw_another: function() {
                var ctx = this;
                this.engine.draw(function(c) {
                    if (c == false || c.friendly == false)
                        ctx.done && ctx.done();
                    else
                        ctx.trade();
                }, true);
            }
        }
    },
    phases: { },
    actions: { }
}