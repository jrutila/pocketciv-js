module.exports = {
    name: 'visitation',
    title: 'Visitation',
    punchline: 'We come in peace, NOT!',
    description: "",
    steps: {
            '1': "If you are a Trading Partner with the visiting \
                Empire, go immediately to TRADE." ,
    },
    run: function(engine, event, done) {
        console.log("Visitor: "+event.visitor)
        var trade = this.trade;
        if (event.visitor in engine.trading)
            trade(engine, event, done);
        else    
        {
            engine.drawer(engine.deck, function(card) {
                if (card.friendly)
                    trade(engine, event, done)
            });
        }
    },
    trade: function(engine, event, done) {
        engine.drawer(engine.deck, function(card) {
            var change = { 'gold': '+'+card.circle };
            engine.areaChange(change, done);
        });
    }
}