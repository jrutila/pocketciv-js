var _ = require("underscore");

module.exports = {
    run: function(ctx, name) {
        if (!name)
        {
            return;
        }
        console.log("Running advance "+name);
        var eng = this;
        var pre = undefined;
        var post = undefined;
        _.each(eng.acquired, function(key) {
            var adv = eng.advances[key];
            if (adv.actions && name in adv.actions) {
                var action = adv.actions[name];
                if (action.context)
                {
                    _.extend(ctx, eng.advances[key].actions[name].context(this));
                }
                if (action.pre)
                {
                    pre = action.pre;
                }
                if (action.post) {
                    post = action.post;
                }
            }
        }, this)
        var prevDone = ctx.done;
        ctx.done = function() {
            if (post) {
                ctx.done = function() {
                    ctx.done = prevDone;
                    post.call(eng, ctx);
                }
            } else
                ctx.done = prevDone;
            eng.actions[name].run.call(eng, ctx);
        }
        
        if (pre)
        {
            pre.call(eng, ctx);
        } else ctx.done();
    }
};