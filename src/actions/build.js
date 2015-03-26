var _ = require("underscore")

function getResources(area) {
    var ret = [];
    if (area.mountain || area.volcano)
        ret.push('stone');
    if (area.farm)
        ret.push('food');
    if (area.forest)
        ret.push('wood');
    return ret;
}

function WonderBuilderer(engine) {
    this.acquired = _.clone(engine.acquired);
    this.wonders = _.clone(engine.wonders);
    this.existing = _.clone(engine.built) || {}; // [area] = { wonders: ['a', 'b'] }
    this.nowbuilt = [];
    this.areas = {};
    this.replaceable_resources = engine.params.replaceable_resources || [];
    _.each(engine.map.areas, function(a, ak) {
        //if (a.city > 0)
            this.areas[ak] = _.clone(a);
    },this);
    this.gold = engine.gold;
}

WonderBuilderer.prototype = {
    get possibleWonders() {
        var bb = {};
        _.each(this.wonders, function(w, name) {
            // Check requirements
            if (_.has(w, 'requirements')) {
                if (!w.requirements.call(this))
                    return;
            }
            // Check gold
            if (this.gold < w.cost.gold)
                return;
            
            bb[name] = {
                'areas': []
            };
            
            _.each(_.pick(this.areas, function(a) { return a.tribes >= w.cost.tribes }), function(a, ak) {
                if (_.contains(a.wonders, name)) // No same wonder to the same are twice (I Guess?)
                    return;
                if (_.any(this.nowbuilt, function(b) { return b[0] == name && b[1] == ak })) return;
                if (w.can_acquire == undefined || w.can_acquire(a))
                    bb[name].areas.push(ak);
            },this);
        },this);

        return bb;
    },
    build: function(name, area) {
        this.existing[name] = area;
        this.nowbuilt.push([name, area]);
        this.areas[area].tribes -= this.wonders[name].cost.tribes || 0;
        this.gold -= this.wonders[name].cost.gold || 0;
    },
}

module.exports = {
    title: "Build Wonders",
    run: function(ctx) {
        var engine = this;
        engine.wonderBuilder(engine, function(builds) {
            console.log("Building wonders ")
            console.log(builds)
            var changes = { };
            _.each(builds, function(xx) {
                var b = engine.wonders[xx[0]];
                var area = xx[1];
                if (_.has(b.cost, 'tribes'))
                    ctx.change(area, { tribes: -1*b.cost.tribes});
                if (_.has(b.cost, 'gold'))
                    ctx.change('gold', -1*b.cost.gold);
                ctx.change(area, { wonders: { '+': [b.name] }})
            },this)
            ctx.done && ctx.done();
        });
    },
    WonderBuilderer: WonderBuilderer
}