module.exports = {
    run: function(ctx) {
        var engine = this;
        if (ctx.initial.gold && !ctx.do_not_decimate)
            ctx.target('gold', 0);
        ctx.done && ctx.done();
    }
};