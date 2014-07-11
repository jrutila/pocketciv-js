var _ = require("underscore");

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
        this.changes[area] = chg;
    },
    break_if: function(expr)
    {
        if (expr)
            this.break = true;
    },
    area_card: function()
    {
        var ctx = this;
        this.engine.drawer(this.engine.deck, function(c) {
            ctx.active_region = c.circle;
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
    reduce: function(t, amount, areas, done) {
        var redAreas = _.map(areas, function(a) { return a.id; });
        eng.reducer(t, amount, redAreas,
            function(reductions) {
                for (var r in reductions)
                {
                    if (reductions[r])
                    {
                        var tr = (changes[r].tribes && parseInt(changes[r].tribes)) || 0;
                        tr -= reductions[r];
                        changes[r].tribes = tr.toString();
                    }
                }
                done && done();
            }
        );
    },
neighbours: function(area) {
    return _.pick(eng.map.areas, area.neighbours);
},


card_value: function(expr) {
    var h = card.hexagon;
    var c = card.circle;
    var s = card.square;
    return eval(expr);
},

select_areas: function(expr) {
    for (var a in eng.map.areas)
    {
        if (expr(eng.map.areas[a]))
            areas.push(eng.map.areas[a]);
    }
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
    var steps_cmd = [];
    var actual_steps = _.clone(event.steps);
    var keys = _.sortBy(_.keys(actual_steps), function(s) {
        if (s.indexOf('-') >= 0) return 99999
        var nums = s.split('.');
        var s = 0;
        for (var n in nums)
        {
            s += parseInt(nums[n])*(1000-100*n)
        }
        return s
    });
    console.log(keys)
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
    console.log(steps_cmd)
    var final = function(ctx) {
        done && done(ctx.changes);
    }
    var context = new Context();
    _.extend(context, event);
    context.engine = engine;
    stepper(steps_cmd, context, final);
}

module.exports = {
    runEvent: runEvent,
}