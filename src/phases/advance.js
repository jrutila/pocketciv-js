module.exports = {
    run: function(ctx, name) {
        if (!name)
        {
            return;
        }
        console.log("Running advance "+name);
        var eng = this;
        _.each(eng.acquired, function(key) {
            if (name in eng.advances[key].actions &&
            eng.advances[key].actions[name].context)
            {
                _.extend(ctx, eng.advances[key].actions[name].context(this));
            }
        }, this)
        this.actions[name].run.call(this, ctx);
    }
};