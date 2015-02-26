module.exports = {
    run: function(ctx) {
        var engine = this;
        var areas = engine.map.areas;
        var changes = {};
        ctx.supported = ctx.supported || [];
        _.each(areas, function(area, ak) {
            if (!_.contains(ctx.supported, ak) && area.city > 0 && !area.farm)
                ctx.change(ak, {city: -1});
        });
        ctx.done && ctx.done();
    }
};