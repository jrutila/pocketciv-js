var reducer = require('../core/reducer')
var _ = require('underscore')

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
        if (this.event.visitor in this.engine.trading)
            this.trade();
        else    
        {
            this.engine.drawer(ctx.engine.deck, function(card) {
                if (card.friendly)
                    ctx.trade()
                else
                    ctx.attack()
            });
        }
    },
    trade: function() {
        var ctx = this;
        this.engine.drawer(this.engine.deck, function(card) {
            ctx.changes = { 'gold': '+'+card.circle };
            ctx.done && ctx.done();
        });
    },
    attack: function() {
        var ctx = this;
        // Draw the active area
        var oldDone = this.done;
        this.done = function() {
            ctx.done = oldDone;
            console.log(this.active_region)
            if (!this.active_region || !_.find(this.active_region.neighbours, function(a) { return typeof a === 'string'; }))
            {
              ctx.done && ctx.done({});
              return
            }
            var rdc = new reducer.Reducer(ctx.engine);
            rdc.areas = reducer.Attack.areas;
            rdc.reduce = reducer.Attack.reduce;
            rdc.startRegion = this.active_region;
            ctx.engine.drawer(ctx.engine.deck, function(card) {
              ctx.card = card;
              rdc.startAmount = ctx.card_value(ctx.event.expr);
              ctx.engine.reducer(rdc, function(chg) {
                  ctx.changes = chg;
                  ctx.done && ctx.done();
              });
            });
        }
        this.area_card()
    },
}
