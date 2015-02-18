var eventDeck = require('./eventdeck').EventDeck;
var _ = require("underscore");
var eventRunner = require('./event');
var reducer = require('../core/reducer');
var signals = require('signals');

var events = {
    'famine': require('../events/famine'),
    'anarchy': require('../events/anarchy'),
    'civil_war': require('../events/civil_war'),
    'corruption': require('../events/corruption'),
    'visitation': require('../events/visitation'),
    'flood': require('../events/flood'),
    'epidemic': require('../events/epidemic'),
    'tribal_war': require('../events/tribal_war'),
    'sandstorm': require('../events/sandstorm'),
    'earthquake': require('../events/earthquake'),
    'volcano': require('../events/volcano'),
    'uprising': require('../events/uprising'),
    'bandits': require('../events/bandits'),
    'attack': require('../events/attack'),
    'trade': require('../events/trade'),
}

var actions = {
    'farm': require('../actions/farm'),
    'city': require('../actions/city'),
    'acquire': require('../actions/acquire'),
}

var advances = {
    'irrigation': require('../advances/irrigation'),
    'literacy': require('../advances/literacy'),
    'agriculture': require('../advances/agriculture'),
    'cartage': require('../advances/cartage'),
    'masonry': require('../advances/masonry'),
    'engineering': require('../advances/engineering'),
    'architecture': require('../advances/architecture'),
    'medicine': require('../advances/medicine'),
    'horticulture': require('../advances/horticulture'),
    'sense_of_community': require('../advances/sense_of_community'),
    'music': require('../advances/music'),
    'literacy': require('../advances/literacy'),
    'slave_labor': require('../advances/slave_labor'),
    'coinage': require('../advances/coinage'),
    'banking': require('../advances/banking'),
    'government': require('../advances/government'),
    'basic_tools': require('../advances/basic_tools'),
    'simple_tools': require('../advances/simple_tools'),
    'roadbuilding': require('../advances/roadbuilding'),
    'equestrian': require('../advances/equestrian'),
    'civil_service': require('../advances/civil_service'),
    'diplomacy': require('../advances/diplomacy'),
    'navigation': require('../advances/navigation'),
}


var irrigation = {}

var Set = function() {}
Set.prototype.add = function(o) { this[o] = true; }
Set.prototype.remove = function(o) { delete this[o]; }
Set.prototype.values= function(o) { return Object.keys(this); }

function NoMoreCardsError(message) {
}

NoMoreCardsError.prototype = Error.prototype;

function EventDeck() {
    this.usedCards = [];
    this.noMoreCards = function() { throw "Not implemented"; }
}

EventDeck.prototype = {
    shuffle: function() {
        this.usedCards = [];
    },
    get cardsLeft() {
        return 13 - this.usedCards.length;
    },
    specific: function(n) {
      var card = eventDeck[n];  
      card.id = parseInt(n);
      return card;
    },
    draw: function(nn) {
        if (this.cardsLeft == 0)
            throw new NoMoreCardsError("No more cards");
        var that = this;
        var left = Object.keys(eventDeck).filter(function (x) { return that.usedCards.indexOf(parseInt(x)) < 0 });
        var n = nn || left[Math.floor((Math.random() * left.length))]
        var card = eventDeck[n];
        card.id = parseInt(n);
        this.usedCards.push(parseInt(n));
        if (this.cardsLeft == 0)
            this.noMoreCards();
        return card;
    },
};

function Map() {
    this.areas = {}
}

Map.prototype = {
    moveTribes: function(situation) {
        for (var key in situation)
        {
            this.areas[key].tribes = situation[key];
        }
    },
    addTribe: function(area, amount) {
        amount = typeof amount !== 'undefined' ? amount : 1;
        this.areas[area].tribes += amount;
    },
    removeTribe: function(area, amount) {
        amount = typeof amount !== 'undefined' ? amount : 1;
        this.areas[area].tribes -= amount;
    },
    get tribeCount() {
      return _.reduce(_.values(this.areas), function(memo, area){ return area.tribes ?  memo + area.tribes: memo }, 0)
    },
}

function _mergeNgh(ngh, n, currentArea) {
    ngh = _.union(ngh, n);
    ngh = _.uniq(ngh) //, function (e, p) { return ngh.indexOf(e) == p; })
    //ngh.indexOf(this.currentArea) > -1 && ngh.splice(ngh.indexOf(this.currentArea),1);
    return _.without(ngh, currentArea)
}

function TribeMover(map, moveLimit) {
    this.start = {};
    this.map = map;
    this.neighbours = {};
    this.neighbours2 = {};
    moveLimit = moveLimit ? moveLimit : 1;
    this.moveLimit = moveLimit;
    
    /*
    moveSea = moveSea ? true : false;
    this.moveSea = moveSea;
    var seas = _.object(_.map(this.map, function(area, n) {
        var seas = _.filter(area.neighbours, function (e) { return typeof e == "string" && e != 'frontier'; });
        var seangh = [];
        for (var a in this.map)
        {
            if (a != n && _.intersection(this.map[a].neighbours, seas).length > 0)
                seangh.push(parseInt(a));
        }
        return [parseInt(n), seangh];
    }));
    */
    //console.log(seas);
    for (var key in this.map)
    {
        this.currentArea = key = parseInt(key);
        var ngh = [key];
        var area = this.map[key];
        console.log(key+":")
        
        // Instant neighbours
        var n = _.filter(area.neighbours, function(n) { return typeof n != "string"; });
        ngh = _mergeNgh(ngh, n, key);
        for (var m = 1; m < moveLimit; m++)
        {
            _.each(ngh, function(ar) {
                area = this.map[ar];
                n = _.filter(area.neighbours, function(n) { return typeof n != "string"; });
                ngh = _mergeNgh(ngh, n, key);
            }, this);
        }
        this.neighbours[key] = ngh.slice(0);

        // 2nd level neighbours
        for (var m = 0; m < moveLimit; m++)
        {
            _.each(ngh, function(ar) {
                area = this.map[ar];
                n = _.filter(area.neighbours, function(n) { return typeof n != "string"; });
                ngh = _mergeNgh(ngh, n, key);
            }, this);
        }
        this.neighbours2[key] = ngh.slice(0);
        
        //console.log(this.neighbours[key]);
        //console.log(this.neighbours2[key]);
        // SEA MOVEMENT //
        // If can move across the sea
        // This is here as a placeholder if the
        // sea movement would be interpreted differently
        /*
        if (this.moveSea) {
            console.log("SEA MOVEMENT")
            ngh = this.neighbours[key];
            _.each(ngh, function(ar) {
                // Get areas, that neighbour the same sea
                var n = seas[ar];
                ngh = _mergeNgh(ngh, n, key);
            });
            ngh = _mergeNgh(ngh, seas[key], key);
            this.neighbours[key] = ngh.slice(0);
            
            ngh = this.neighbours2[key];
            _.each(ngh, function(ar) {
                // Get areas, that neighbour the same sea
                var n = seas[ar];
                ngh = _mergeNgh(ngh, n, key);
            });
            ngh = _mergeNgh(ngh, seas[key], key);
            this.neighbours2[key] = ngh.slice(0);
        }
        */
        console.log(this.neighbours[key]);
        console.log(this.neighbours2[key]);
    }
}

function sum(arr) {
    var total = 0;

    for (var i in arr)
    {
        if (arr[i] == undefined) arr[i] = 0;
        total += arr[i];
    }

    return total;
}

TribeMover.prototype = {
    init: function(start) {
        this.start = start;
        this.max = this._nghValue(start);
        this.ngh2 = this._2ngValue(start);
    },
    ok: function(situation) {
        if (this.moveLimit == -1) return true;
        var ngh = this._nghValue(situation);
        /*
        console.log('--COMP--')
        console.log('this.start')
        console.log(this.start)
        console.log('this.neighbours')
        console.log(this.neighbours)
        console.log('this.neighbours2')
        console.log(this.neighbours2)
        console.log('this.max')
        console.log(this.max)
        console.log('this.ngh2')
        console.log(this.ngh2)
        console.log('curr - situation')
        console.log(situation)
        console.log('curr - ngh')
        console.log(ngh)
        console.log(sum(this.start) + " != " + sum(situation))
        console.log('--XOMP--')
        */
        if (sum(this.start) != sum(situation))
            return false;
        for (var key in situation)
        {
            var curr = situation[key];
            if (curr == undefined) curr = 0;
            if (curr > this.max[key]) return false;
            if (ngh[key] < this.start[key]) return false;
            if (ngh[key] > this.ngh2[key]) return false;
        }
        return true;
    },
    _nghValue: function(situation) {
        var nghVal = {};
        for (var key in situation)
        {
            var ngh = this.neighbours[key];
            nghVal[key] = situation[key];
            for (var n in ngh)
            {
                nghVal[key] += situation[ngh[n]];
            }
        }
        return nghVal;
    },
    _2ngValue: function(situation) {
        var nghVal = {};
        for (var key in situation)
        {
            var ngh = this.neighbours2[key];
            nghVal[key] = situation[key];
            for (var n in ngh)
            {
                nghVal[key] += situation[ngh[n]];
            }
        }
        return nghVal;
    }
}

function Engine(map, deck) {
    this.mover = function() { throw "Not implemented"; }
    this.reducer = function() { throw "Not implemented"; }
    this.drawer = function() { throw "Not implemented"; }
    this.areaChanger = function() { throw "Not implemented"; }
    this.eventStepper = function(done) { done & done(); }
    this.map = map || theMap;
    this.deck = deck || theDeck;
    var eng = this;
    this.deck.noMoreCards = function() { eng.endOfEra(); };
    this.phases = [
        "populate",
        "move",
        "event",
        "advance",
        "support",
        "gold_decimate",
        "city_advance",
        "gold_management",
        "city_support",
        "upkeep"
        ];
    this.phase = "populate";
    this.events = events;
    this.advances = advances;
    this.orig_adv_costs ={};
    for (var a in advances)
        this.orig_adv_costs[a] = _.clone(advances[a].cost);
    this.acquired = [];
    this.trading = [];
    this.actions = actions;
    this.gold = 0;
    this.round = {} // Will be emptied after upkeep!
    this.params = {} // Will be emptied on init!
    this.era = 1;
    /** SIGNALS **/
    this.signals = {
        'eventPhasing': new signals.Signal(),
        'phaser': new signals.Signal()
    }
}

var defaults= {
    'phase': "",
    'deck.usedCards': [],
    'map.areas': undefined,
    'map.width': undefined,
    'map.height': undefined,
    'map.grid': undefined,
    'acquired': [],
    'trading': [],
    'gold': 0,
    'era': 1,
    'round': {},
}

Engine.prototype = {
    init: function(state) {
        console.log("init engine")
        for (var d in defaults)
        {
            var en = this;
            var st = state;
            var pp = d.split(".");
            var p = pp.shift();
            while (pp.length) {
                _.extend(en[p], st[p]);
                st = st[p];
                en = en[p];
                p = pp.shift();
            }
            en[p] = st && st[p] || _.clone(defaults[d]);
        }
        this.params = {};
        for (var key in this.map.areas)
        {
            this.map.areas[key].id = parseInt(key);
        }
        for (var key in advances)
        {
            this.advances[key].cost = _.clone(this.orig_adv_costs[key]);
        }
        this.acquired = [];
        for (var a in state.acquired)
            this.acquire(state.acquired[a]);
            
        if (this.phase)
            this.runPhase(this.phase);
    },
    get state() {
        var ret = {};
        _.each(_.keys(defaults), function(d) {
            var pp = d.split(".");
            var p = pp.shift();
            var en = ret;
            var st = this;
            while (pp.length)
            {
                ret[p] = ret[p] || {};
                en = ret[p];
                st = st[p];
                p = pp.shift()
            }
            if (st && st[p])
                en[p] = JSON.parse(JSON.stringify(st[p]));
        }, this);
        return ret;
    },
    endOfEra: function() {
        console.log("End of era");
        this.deck.shuffle();
        this.era++;
    },
    nextPhase: function() {
        this.signals.phaser.dispatch("end", this.phase)
        this.phase = this.phases[this.phases.indexOf(this.phase)+1] || this.phases[0];
        this.signals.phaser.dispatch("start", this.phase)
        console.log("Phase is now "+this.phase);
    },
    populate: function(ctx) {
        console.log("Populating areas");
        var changes = {};
        for (var key in this.map.areas)
        {
            if (this.map.areas[key].tribes > 0)
                changes[key] = { 'tribes': '+1' };
        }
        ctx.changes = changes;
        ctx.done && ctx.done();
    },
    move: function(ctx) {
        console.log("Moving tribes with mover");
        this.mover(this.map.areas, function(end) {
            for (var key in this.map.areas)
            {
                this.map.areas[key].tribes = end[key];
            }
            ctx.done && ctx.done();
        });
    },
    advance: function(ctx, name) {
        if (!name)
        {
            this.actions = actions;
            var extra = {};
            _.each(_.pick(this.advances, this.acquired), function(adv) {
                _.each(adv.actions, function(act, key) {
                    if (act.run)
                        extra[key] = act;
                })
            });
            _.extend(this.actions, extra);
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
    },
    runPhase: function(name, arg) {
        var ctx = {};
        var eng = this;
        var posts = [];
        var pres = [];
        
        _.each(_.pick(this.advances, this.acquired), function(acq) {
            if (acq.phases && _.has(acq.phases, name+'.post'))
            {
                posts.push(acq.phases[name+".post"])
            }
            if (acq.phases && _.has(acq.phases, name+'.pre'))
            {
                pres.push(acq.phases[name+".pre"])
            }
        }, this)
        
        var final = function() {
                        ctx.confirm && ctx.confirm();
                        if (name != "advance")
                            eng.nextPhase();
                    };
        
        var runpre = function() {
            var olddone = ctx.done;
            ctx.done = function() {
                var pre = pres.pop();
                if (pre) pre.call(eng, ctx);
                else olddone && olddone()
            }
            ctx.done()
        }
        
        var runpost = function() {
            // TODO: Only supports one post for now
            var post = posts.pop();
            if (post) post.call(eng, ctx);
            else {
                if (_.has(ctx, 'changes'))
                {
                    eng.areaChange(ctx.changes, final);
                } else {
                    final();
                }
            }
        }
        
        ctx.done = function() {
            ctx.done = runpost;
            eng[name](ctx, arg);
        }

        runpre();
    },
    acquire: function(name, done) {
        this.acquired.push(name);
        if (this.advances[name].acquired)
        {
            this.advances[name].acquired.call(this);
        }
        console.log("Acquired "+name);
        done && done();
    },
    event: function(ctx) {
        console.log("Drawing event card")
        // Take era before car draw if there is era change
        var era = this.era;
        this.drawer(this.deck, function(eventcard) {
            var eng = this;
            if (era in eventcard.events)
            {
                var ev = eventcard.events[era];
                console.log("Drew event: "+ev.name);
                eng.doEvent(ev, function(changes) {
                    console.log("Event ended: "+ev.name);
                    ctx.changes = changes;
                    ctx.done && ctx.done();
                });
            } else {
                console.log("No event!");
                ctx.done && ctx.done();
            }
        });
    },
    doEvent: function(ev, done) {
        var eng = this;
        var event = eng.events[ev.name];
        eng.signals.eventPhasing.dispatch("0", ev);
        eventRunner.runEvent(eng, event, ev, function(changes) {
            eng.signals.eventPhasing.dispatch("-1", ev);
            done && done(changes);
        });
    },
    support: function(ctx) {
        var engine = this;
        var changes = {};
        var areas = engine.map.areas;
        for (var a in areas)
        {
            var area = areas[a];
            var support_val = 0;
            if (area.mountain || area.volcano) support_val++;
            if (area.forest) support_val++;
            if (area.farm) support_val++;
            if (area.city) support_val += area.city;
            
            if (area.tribes > support_val)
                changes[area.id] = {'tribes': (support_val-area.tribes).toString()};
        }
        ctx.changes = changes;
        ctx.done && ctx.done();
    },
    gold_decimate: function(ctx) {
        var engine = this;
        if (engine.gold && !ctx.do_not_decimate)
            ctx.changes = { 'gold': '0' };
        ctx.done && ctx.done();
    },
    gold_management: function(ctx) {
        ctx.done && ctx.done();
    },
    city_support: function(ctx) {
        var engine = this;
        var areas = engine.map.areas;
        var changes = {};
        for (var a in areas)
        {
            if (areas[a].city && !areas[a].farm)
            {
                changes[a] = { 'city': '-1' };
            }
        }
        ctx.changes = changes;
        ctx.done && ctx.done();
    },
    city_advance: require('../phases/city_advance').run,
    upkeep: function(ctx) {
        this.round = {};
        ctx.done && ctx.done();
    },
    areaChange: function(changes, done) {
        this.areaChanger(changes, function() {
            var applyChange = function(elem, change)
            {
                for (var k in change)
                {
                    if (change[k] === true || change[k] === false)
                        elem[k] = change[k];
                    else
                    {
                        var v = change[k];
                        if (!elem[k])
                            elem[k] = 0;
                        
                        if (v.indexOf('-') == 0 || v.indexOf('+') == 0)
                            elem[k] += parseInt(v);
                        else
                            elem[k] = parseInt(v);
                            
                        if (elem[k] < 0)
                            elem[k] = 0;
                    }
                }
            };
            
            for (var a in changes)
            {
                var change = changes[a];
                var area = this.map.areas[a];
                if (area)
                {
                    applyChange(area, change);
                }
                else
                {
                    change = {};
                    change[a] = changes[a];
                    applyChange(this, change)
                }
            }
            done && done.call(this);
        });
    }
}

function filterAreasWithoutCities(areas) {
    var result = {};
    
    for (var key in areas)
    {
        if (areas[key].hasOwnProperty('city') && areas[key].city)
            result[key] = areas[key];
    }
    return result;
}

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

function AdvanceAcquirer(engine) {
    this.advances = _.omit(_.clone(engine.advances), engine.acquired);
    this.acquired = _.clone(engine.round.acquired) || [];
    this.acquired_names = _.clone(engine.acquired)
    this.amnt_of_acquird = _.union(_.map(engine.round.acquired, function(a) { return a.name; }), engine.acquired).length;
    this.areas = _.clone(engine.map.areas);
    this.areas = filterAreasWithoutCities(this.areas);
}

AdvanceAcquirer.prototype = {
    possibleAdvances: function() {
        var adv = {};
        for (var key in _.omit(this.advances, this.acquired_names)) {
            // Check requirements
            if (_.has(this.advances[key], 'requires') && this.advances[key].requires) {
                var kk = _.keys(this.advances);
                var aq = this.acquired_names;
                var re = _.clone(this.advances[key].requires);

                // First, check optional requirements (either one must be required)
                // Remove them from re if they are satisfied
                var re = _.filter(re, function(r) {
                    if (!_.isArray(r)) return true;
                    return _.intersection(r, aq).length < 1;
                });
                // Check that all requirements are acquired
                if (!_.isEqual(_.intersection(aq, re), re)) {
                    continue;
                }
            }

            adv[key] = {
                'areas': []
            };

        if (_.reduce(this.areas, function(m, a) {return a.city ? m + a.city : m }, 0) > this.amnt_of_acquird)
        {
            for (var a in _.omit(this.areas, _.keys(this.acquired))) {
                // Check tribes
                var has_tribes = true;
                var has_resources = true;
                if ('tribes' in this.advances[key].cost) {
                    if (!(this.areas[a].tribes >= this.advances[key].cost.tribes))
                        has_tribes = false;
                }

                // Check resources
                if ('resources' in this.advances[key]) {
                    var area_resources = getResources(this.areas[a]);
                    if (!_.intersection(
                            area_resources, this.advances[key].resources).length ==
                        this.advances[key].resources.length) {
                        has_resources = false;
                    }
                }

                if (has_tribes && has_resources)
                    adv[key].areas.push(a);
            }
        }
        }
        return adv;
    },
    acquire: function(name, area) {
        this.acquired[area] = this.advances[name];
        this.acquired_names.push(name);
    },
    deacquire: function(name) {
        for (var a in this.acquired)
        {
            if (this.acquired[a] == this.advances[name])
            {
                delete this.acquired[a];
                break;
            }
        }
        this.acquired_names.pop(name);
    }
}

var theMap = new Map();
var theDeck = new EventDeck();

module.exports = {
    example: function(a) {
        return a + "--";
    }
    ,
    NoMoreCardsError: NoMoreCardsError,
    EventDeck: theDeck,
    Map: theMap,
    TribeMover: TribeMover,
    AdvanceAcquirer: AdvanceAcquirer,
    Engine: new Engine(theMap, theDeck),
    Advances: advances,
}