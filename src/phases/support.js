module.exports = {
    run: function(ctx) {
        var engine = this;
        var changes = {};
        var areas = engine.map.areas;
        for (var a in areas)
        {
            var area = areas[a];
            var support_val = 0;
            if (area.mountain || area.volcano) support_val++;
            if (area.forest) support_val++;
            if (area.farm) support_val++;
            if (area.city) support_val += area.city;
            
            if (area.tribes > support_val)
                changes[area.id] = {'tribes': (support_val-area.tribes).toString()};
        }
        ctx.changes = changes;
        ctx.done && ctx.done();
    }
};