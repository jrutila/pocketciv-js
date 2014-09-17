var _ = require("underscore");
var reducer = require("./reducer")

var patt = /{%(;? .*?) %}/g;

var Context = function() {
    this.active_region = undefined;
    this.changes = {};
    this.break = false;
    this.go = undefined;
    this.done = undefined;
    };
    
Context.prototype = {
    change: function(chg, area)
    {
        if (typeof chg === "string")
        {
            ar = chg;
            chg = area;
            area = ar;
        }
        area = area ? area : this.active_region;
        if (typeof area === "object")
            area = area.id
        this.changes[area] || (this.changes[area] = {})
        _.extend(this.changes[area], chg);
        _.each(this.changes[area], function(v, k) {
            if (v === undefined)
                delete this.changes[area][k];
        })
    },
    break_if: function(expr)
    {
        if (expr)
            this.break = true;
    },
    goto: function(phase)
    {
        console.log("goingto "+phase)
        this.go = phase;
    },
    area_card: function()
    {
        console.log("AREA CARD")
        var ctx = this;
        this.engine.drawer(this.engine.deck, function(c) {
            ctx.active_region = ctx.engine.map.areas[c.circle.toString()];
            if (!ctx.active_region) {
                console.log("No such area!")
                ctx.break = true;
            }
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
        
        this.engine.reducer(rdc, ctx.done);
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

function StepsStack() {
    this._step = undefined;
    this.arr = [];
    this.steps = [];
}

StepsStack.prototype = {
    set step(value) {
        this._step = value;
    },
    get step() {
        return this._step;
    },
    get length() {
        return this.arr.length;
    },
    push: function(value) {
        this.arr.push(value);
        this.steps.push(this._step);
    },
    shift: function() {
        this._step = this.steps.shift();
        return this.arr.shift();
    },
    break: function() {
        while (this.steps[0] != "final" && this.length)
            this.shift();
    }
}

var stepper = function(steps, ctx, done)
{
    if (steps.length === 0)
    {
        return done && done(ctx);
    }
    var cmd = steps.shift();
    if (ctx.go && ctx.go != steps.step)
    {
        stepper(steps, ctx, done);
        return;
    }
    ctx.engine.eventPhasing.dispatch(steps.step, ctx)
    contextEval(cmd, ctx, function() {
        if (ctx.break)
        {
            steps.break();
        }
        stepper(steps, ctx, done);
    },cmd.indexOf(';') === 0);
}

extendSteps = function(event, advances, limit, context)
{
    var actual_steps = _.clone(event.steps);
    _.each(_.pick(advances, limit), function(adv) {
        if (_.has(adv.events, event.name))
        {
            console.log('Extending with steps with '+adv.name)
            actual_steps = _.extend(actual_steps, adv.events[event.name].steps);
            context && _.extend(context, adv.events[event.name])
        }
    }, this)
    
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
    
    return [actual_steps, keys];
}

runEvent = function(engine, event, ev, done)
{
    console.log("Running event")
    if (!engine) throw "Engine should not be null"
    
    var context = new Context();
    _.extend(context, event);
    context.engine = engine;
    context.event = ev;
    
    var ext = extendSteps(event, engine.advances, engine.acquired, context);
    var actual_steps = ext[0];
    var keys = ext[1];
    var steps_cmd = new StepsStack();
    
    console.log(actual_steps)
    
    _.each(keys, function(key)
    {
        var step = actual_steps[key];
        var m = step.match(patt);
        var cmd = "";
        steps_cmd.step = key;
        for (var s in m)
        {
            var line = m[s].replace(patt, "$1");
            if (line[0] == ";")
            {
                steps_cmd.push(cmd);
                steps_cmd.push(line);
                cmd = "";
            } else
                cmd += line + "\n";
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
    extendSteps: extendSteps,
}
