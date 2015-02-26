var _ = require('underscore');
module.exports = {
    run: function(ctx) {
        var engine = this;
        _.each(ctx.initial, function(area,ak) {
            var support_val = 0;
            if (area.mountain || area.volcano) support_val++;
            if (area.forest) support_val++;
            if (area.farm) support_val++;
            if (area.city) support_val += area.city;
            
            if (area.tribes > support_val)
                ctx.target(ak, {tribes: support_val});
        });
        ctx.done && ctx.done();
    }
};