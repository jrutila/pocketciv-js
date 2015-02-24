module.exports = {
    run: function(ctx) {
        console.log("Populating areas");
        var changes = {};
        for (var key in this.map.areas)
        {
            if (this.map.areas[key].tribes > 0)
                changes[key] = { 'tribes': '+1' };
        }
        ctx.changes = changes;
        ctx.done && ctx.done();
    }
};