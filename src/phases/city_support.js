module.exports = {
    run: function(ctx) {
        var engine = this;
        var areas = engine.map.areas;
        var changes = {};
        ctx.supported = ctx.supported || [];
        for (var a in areas)
        {
            if (!_.contains(ctx.supported, a) && areas[a].city > 0 && !areas[a].farm)
            {
                changes[a] = { 'city': '-1' };
            }
        }
        ctx.changes = changes;
        ctx.done && ctx.done();
    }
};