module.exports = {
    run: function(ctx) {
        var engine = this;
        if (engine.gold && !ctx.do_not_decimate)
            ctx.changes = { 'gold': '0' };
        ctx.done && ctx.done();
    }
};