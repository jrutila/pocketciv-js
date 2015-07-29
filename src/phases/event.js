var _ = require("underscore");

module.exports = {
    log: function(ctx) {
        if (!ctx.event)
            return "No event happened";
        else
        {
            if (ctx.event.log)
            {
                
            }
            else
            {
                var commonText = "{{ event.title }} happened";
                if (ctx.eventCtx.active_region)
                    commonText += " in region {{ regions eventCtx.active_region.id }}";
                return commonText;
            }
        }
    },
    run: function(ctx) {
        console.log("Drawing event card")
        // Take era before card draw if there is era change
        var era = this.era;
        var may_skip = ctx.skip != undefined;
        var eng = this;
        this.draw(function(eventcard) {
            if (era in eventcard.events)
            {
                var ev = _.clone(eventcard.events[era]);
                if (may_skip)
                    ev.skip = ctx.skip;
                console.log("Drew event: "+ev.name);
                eng.doEvent(ev, ctx);
            } else {
                console.log("No event!");
                ctx.done && ctx.done();
            }
        });
    }
};