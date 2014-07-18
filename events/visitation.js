module.exports = {
    name: 'visitation',
    title: 'Visitation',
    punchline: 'We come in peace, NOT!',
    description: "",
    steps: {
            '1': "If you are a Trading Partner with the visiting \
                Empire, go immediately to TRADE." ,
            '-': "{%; run() %}",
    },
    run: function() {
        console.log("Visitor: "+this.event.visitor)
        var trade = this.trade;
        var ctx = this;
        if (event.visitor in this.engine.trading)
            this.trade();
        else    
        {
            engine.drawer(ctx.engine.deck, function(card) {
                if (card.friendly)
                    ctx.trade()
            });
        }
    },
    trade: function() {
        var ctx = this;
        this.engine.drawer(this.engine.deck, function(card) {
            ctx.changes = { 'gold': '+'+card.circle };
            ctx.done && ctx.done();
        });
    }
}
