var _ = require("underscore");

module.exports = {
    run: function(ctx) {
        console.log("Drawing event card")
        // Take era before car draw if there is era change
        var era = this.era;
        var may_skip = ctx.skip != undefined;
        this.drawer(this.deck, function(eventcard) {
            var eng = this;
            if (era in eventcard.events)
            {
                var ev = _.clone(eventcard.events[era]);
                if (may_skip)
                    ev.skip = ctx.skip;
                console.log("Drew event: "+ev.name);
                eng.doEvent(ev, function(changes) {
                    console.log("Event ended: "+ev.name);
                    ctx.changes = changes;
                    ctx.done && ctx.done();
                });
            } else {
                console.log("No event!");
                ctx.done && ctx.done();
            }
        });
    }
};