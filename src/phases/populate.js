var _ = require('underscore');
module.exports = {
    run: function(ctx) {
        console.log("Populating areas");
        _.each(this.map.areas, function(area, ak) {
            if (area.tribes > 0)
                ctx.change(ak, {tribes: 1});
        });
        ctx.done && ctx.done();
    }
};