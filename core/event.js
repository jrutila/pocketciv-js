var _ = require("underscore");
var reducer = require("./reducer")

var patt = /{%(;? .*?) %}/g;

var Context = function() {
    this.active_region = undefined;
    this.changes = {};
    this.break = false;
    this.done = undefined;
    };
    
Context.prototype = {
    change: function(chg, area)
    {
        area = area ? area : this.active_region;
        if (typeof area === "object")
            area = area.id
        this.changes[area] = chg;
    },
    break_if: function(expr)
    {
        if (expr)
            this.break = true;
    },
    area_card: function()
    {
        console.log("AREA CARD")
        var ctx = this;
        this.engine.drawer(this.engine.deck, function(c) {
            ctx.active_region = ctx.engine.map.areas[c.circle.toString()];
            ctx.done()
        });
    },
    draw_card: function() {
        var ctx = this;
        this.engine.drawer(this.engine.deck, function(c) {
            ctx.card = c;
            ctx.done();
        });
    },
    reduce: function(t, amount, areas) {
        var ctx = this;
        var rdc = new reducer.Reducer(this.engine);
        rdc.mode = reducer.Modes.Overall;
        var total = _.reduce(_.values(areas), function(memo, area){ return area[t] ?  memo + area[t]: memo }, 0)
        rdc.startAmount = amount;
        rdc.reduce = function(r) {
            this.amount += r[t];
            if (this.startAmount - this.amount == total)
                this.amount = 0;
        };
        rdc.areas = function() {
            return _.omit(areas, _.map(this.visited, function(v) { return v.toString() }));
        };
        
        this.engine.reducer(rdc, function(chg) {
            _.each(chg, function(v, k) {
                ctx.changes[k] = _.extend(ctx.changes[k], v)
            })
            ctx.done && ctx.done();
        });
    },
    active_regions: function(expr) {
        var act = []
        for (var a in this.engine.map.areas)
        {
            if (expr(this.engine.map.areas[a]))
                act.push(this.engine.map.areas[a]);
        }
        this.active_region = act;
    },
    neighbours: function(area) {
        return _.pick(this.engine.map.areas, area.neighbours);
    },
    card_value: function(expr) {
        var h = this.card.hexagon;
        var c = this.card.circle;
        var s = this.card.square;
        return eval(expr);
    },

};

function contextEval(cmd, context, done, wait) {
        context.done = done;
        (new Function( "with(this) {"+cmd+"}")).call(context);
        if (!wait)
            done && done();
}

var stepper = function(steps, ctx, done)
{
    if (steps.length === 0)
    {
        return done && done(ctx);
    }
    var cmd = steps.shift();
    contextEval(cmd, ctx, function() {
        if (ctx.break)
            steps = [];
        stepper(steps, ctx, done);
    },cmd.indexOf(';') === 0);
}

runEvent = function(engine, event, ev, done)
{
    console.log("Running event")
    if (!engine) throw "Engine should not be null"
    
    var context = new Context();
    _.extend(context, event);
    context.engine = engine;
    context.event = ev;
    
    var actual_steps = _.clone(event.steps);
    var steps_cmd = [];
    
    for (var key in engine.acquired)
    {
        if (_.has(engine.acquired[key].events, event.name))
        {
            console.log('Extending with '+key)
            _.extend(actual_steps, engine.acquired[key].events[event.name].steps);
            //_.extend(context, engine.acquired[key].events[ev.name])
        }
    }
    var keys = _.sortBy(_.keys(actual_steps), function(s) {
        if (s.indexOf('-') >= 0) return 99999
        var nums = s.split('.');
        var rs = 0;
        for (var n in nums)
        {
            rs += parseInt(nums[n])*(10000/Math.pow(100,n));
        }
        return rs
    });
    _.each(keys, function(key)
    {
        var step = actual_steps[key];
        var m = step.match(patt);
        var cmd = "";
        for (var s in m)
        {
            cmd += m[s].replace(patt, "$1") + "\n";
        }
        steps_cmd.push(cmd);
    });
    var final = function(ctx) {
        done && done(ctx.changes);
    }
    stepper(steps_cmd, context, final);
}

module.exports = {
    runEvent: runEvent,
}
