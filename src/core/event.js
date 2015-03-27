var _ = require("underscore");
var reducer = require("./reducer")

var patt = /{%(;? .*?) %}/g;

var Context = function(rootCtx) {
    this.ctx = rootCtx;
    this.active_region = undefined;
    this.changes = {};
    this.break = false;
    this.go = undefined;
    this.done = undefined;
    this.initial = _.clone(rootCtx.targets);
    rootCtx.ctx && _.extend(this, rootCtx.ctx);
    };
    
Context.prototype = {
    // Backwards compatibility
    _fromOldValue: function(val) {
        if (_.isString(val)) {
            var a = parseInt(val);
            if (isNaN(a)) {
                a = parseInt(val.replace("+", ""));
                if (isNaN(a))
                    throw "CantDo"
            }
            return a;
        }
        else
            return val;
    },
    change: function(chg, area)
    {
        if (_.isObject(chg) && !isNaN(parseInt(_.first(_.keys(chg)))) && area == undefined) {
            // This is a full blown change with area ids and all
            this.ctx.change(chg);
        }
        else if (_.isObject(chg) && _.has(chg, 'gold') && area == undefined) {
            // Probably gold change
            this.ctx.change(chg);
        }
        else if (_.isString(chg)) {
            if (_.isString(area) && area.indexOf('+') == -1 && area.indexOf('-') == -1)
                this.ctx.target(chg, this._fromOldValue(area));
            else 
                this.ctx.change(chg, this._fromOldValue(area));
        }
        else {
            area = area || this.active_region;
            if (typeof area === "object")
                area = area.id
            _.each(chg, function(v,k) {
                var cc = {};
                cc[k] = this._fromOldValue(v);
                if (_.isString(v) && v.indexOf('+') == -1 && v.indexOf('-') == -1) {
                    this.ctx.target(area, cc);
                } else {
                    if (_.isString(v) || v == undefined) {
                        var ii = {};
                        ii[k] = this.ctx.initial[area][k];
                        this.ctx.target(area, ii);
                    }
                    if (cc[k] != undefined)
                        this.ctx.change(area, cc);
                }
            },this);
        }
    },
    target: function(chg, area) {
        if (_.isObject(chg) && !isNaN(parseInt(_.first(_.keys(chg)))) && area == undefined) {
            // This is a full blown change with area ids and all
            this.ctx.target(chg);
        }
        else if (_.isString(chg)) {
            this.ctx.target(chg, this._fromOldValue(area));
        }
        else {
            area = area || this.active_region;
            if (typeof area === "object")
                area = area.id
            this.ctx.target(area, chg);
        }
    },
    break_if: function(expr)
    {
        if (expr)
            this.break = true;
    },
    goto: function(phase)
    {
        this.go = phase;
    },
    area_card: function()
    {
        var ctx = this;
        this.engine.drawer(this.engine.deck, function(c) {
            ctx.active_region = ctx.engine.map.areas[c.circle.toString()];
            if (!ctx.active_region) {
                ctx.break = true;
            }
            ctx.done()
        });
    },
    draw_card: function(canstop) {
        var ctx = this;
        this.engine.drawer(this.engine.deck, function(c) {
            ctx.card = c;
            ctx.done();
        },canstop == true);
    },
    reduce: function(t, amount, areas) {
        var ctx = this;
        var opts = reducer.Templates.basic(ctx, [t]);
        opts.amount = amount;
        opts.initial = areas;
        
        this.engine.reducer(new reducer.Reducer(opts), function(rdc) {
            ctx.ctx.change(rdc.changes);
            ctx.done && ctx.done();
        });
    },
    active_regions: function(expr) {
        var act = {};
        for (var a in this.engine.map.areas)
        {
            if (expr(this.engine.map.areas[a]))
                act[a] = this.engine.map.areas[a];
        }
        this.active_region = act;
    },
    neighbours: function(area) {
        return _.pick(this.engine.map.areas, area.neighbours);
    },
    hasSea: function(area) {
        return _.any(area.neighbours, reducer.isSea);
    },
    card_value: function(expr) {
        var h = this.card.hexagon;
        var c = this.card.circle;
        var s = this.card.square;
        return eval(expr);
    },
    has: function(adv) {
        return _.contains(this.engine.acquired, adv);
    },
    sub: function(ev) {
        ev = { name: ev };
        var event = this.engine.events[ev.name];
        runEvent(event, ev, this);
    },
    done: function() {
        this.ctx.done();
    }
};

function contextEval(cmd, context, done, wait) {
        context.done = done;
        (new Function( "with(this) {"+cmd+"}")).call(context);
        if (!wait && !context.wait)
            done && done();
        delete context.wait;
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
        while (this.length && this.steps[0][0] != "f")
            this.shift();
    }
}

var stepper = function(steps, ctx, done)
{
    if (steps.length === 0)
    {
        ctx.engine.eventStepper(function() {
            done && done(ctx);
        }, "end", ctx);
        return;
    }
    var cmd = steps.shift();
    if (ctx.go && ctx.go != steps.step)
    {
        stepper(steps, ctx, done);
        return;
    }
    ctx.go = undefined;
    ctx.engine.signals.eventPhasing.dispatch(steps.step, ctx)
    //console.log(steps.step+":"+cmd)
    contextEval(cmd, ctx, function() {
        if (ctx.break)
        {
            steps.break();
        }
        ctx.engine.eventStepper(function() {
            stepper(steps, ctx, done);
        }, steps.step, ctx);
    },cmd.indexOf(';') === 0);
}

function extendSteps(event, advances, limit, context)
{
    if (!event || !event.steps) return [{}, []];
    var actual_steps = _.clone(event.steps);
    _.each(_.pick(advances, limit), function(adv) {
        if (_.has(adv.events, event.name))
        {
            actual_steps = _.extend(actual_steps, adv.events[event.name].steps);
            context && _.extend(context, adv.events[event.name])
        }
    }, this)
    if (actual_steps['include'] != undefined) {
        var extra = context.engine.events[actual_steps['include']];
        var esteps = extendSteps(extra, advances, limit, context);
        actual_steps = _.extend(actual_steps, esteps[0]);
        context && _.extend(context, extra)
        delete actual_steps['include'];
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
    
    return [actual_steps, keys];
}

function runEventExt(engine, event, ev, extCtx) {
    if (!engine) throw "Engine should not be null"
    if (!extCtx) throw "Context should not be null";
    var context = new Context(extCtx);
    context.engine = engine;
    context.done = extCtx.done;
    runEvent(event, ev, context);
}

function runEvent(event, ev, ctx)
{
    _.extend(ctx, event);
    if (ev.skip)
        ctx.skip = ev.skip;
    ctx.event = ev;
    
    var ext = extendSteps(event, ctx.engine.advances, ctx.engine.acquired, ctx);
    var actual_steps = ext[0];
    var keys = ext[1];
    var steps_cmd = new StepsStack();
    
    //console.log(actual_steps)
    
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
    var final = function(c) {
        c.ctx && c.ctx.done && c.ctx.done();
    }
    stepper(steps_cmd, ctx, final);
}

module.exports = {
    runEvent: runEventExt,
    extendSteps: extendSteps,
    EventContext: Context,
}
