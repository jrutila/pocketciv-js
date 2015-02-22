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
    'expedition': require('../actions/expedition'),
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
    'magnetics': require('../advances/magnetics'),
    'black_market': require('../advances/black_market'),
    'cavalry': require('../advances/cavalry'),
    'sails_and_rigging': require('../advances/sails_and_rigging'),
    'culture_of_thievery': require('../advances/culture_of_thievery'),
    'mining': require('../advances/mining'),
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

var areaNeighbour = function(n) { return typeof n != "string"; };

function _seaUnion(area, sea) {
    return _.filter(_.union(area, sea || []), areaNeighbour);
}

function TribeMover(map, moveLimit, seaCost) {
    this.start = {};
    this.map = _.clone(map);
    this.neighbours = {};
    this.neighbours2 = {};
    this.neighboursSea = {};
    this.neighboursSea2 = {};
    moveLimit = moveLimit ? moveLimit : 1;
    this.moveLimit = moveLimit;
    seaCost = seaCost === undefined ? -1 : seaCost;
    this.seaCost = seaCost;
    
    var seas = {};
    if (seaCost > -1)
    seas = _.object(_.map(this.map, function(area, n) {
        var ss = _.filter(area.neighbours, function (e) { return typeof e == "string" && e != 'frontier'; });
        var seangh = [];
        for (var a in this.map)
        {
            if (a != n && _.intersection(this.map[a].neighbours, ss).length > 0)
                seangh.push(parseInt(a));
        }
        return [parseInt(n), seangh];
    }, this));
    
    for (var key in this.map)
    {
        this.currentArea = key = parseInt(key);
        var ngh = [key];
        var area = this.map[key];
        var sea = seas[key];
        
        // Instant neighbours
        var n = _seaUnion(area.neighbours, seas[key]);
        ngh = _mergeNgh(ngh, n, key);
        for (var m = 1; m < moveLimit; m++)
        {
            _.each(ngh, function(ar) {
                area = this.map[ar];
                n = _seaUnion(area.neighbours, seas[ar]);
                ngh = _mergeNgh(ngh, n, key);
            }, this);
        }
        this.neighbours[key] = ngh.slice(0);
        this.neighboursSea[key] = _.clone(this.neighbours[key]);

        // 2nd level neighbours
        for (var m = 0; m < moveLimit; m++)
        {
            _.each(ngh, function(ar) {
                area = this.map[ar];
                n = _seaUnion(area.neighbours, seas[ar]);
                ngh = _mergeNgh(ngh, n, key);
            }, this);
        }
        this.neighbours2[key] = ngh.slice(0);
        this.neighboursSea2[key] = _.clone(this.neighbours2[key]);
    }
    
    this.seangh = {};
    if (seaCost > -1)
    for (var key in this.map)
    {
        var area = this.map[key];
        // SEA MOVEMENT
        this.seangh[key] = []
        _.each(this.neighbours2[key], function(n) {
            if (_.contains(area.neighbours, n))
                return;
            if (_.intersection(
                _.filter(area.neighbours, areaNeighbour),
                _.filter(this.map[n].neighbours, areaNeighbour)
                ).length > 0)
                return;
            this.seangh[key].push(n);
        }, this);
        //this.neighbours[key] = ngh.slice(0);
        this.neighboursSea[key] = _.clone(this.neighbours[key]);
        this.neighbours[key] = _.difference(this.neighboursSea[key], this.seangh[key]);
        this.neighboursSea2[key] = _.clone(this.neighbours2[key]);
        this.neighbours2[key] = _.difference(this.neighboursSea2[key], this.seangh[key]);
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
        this.max = this._nghValue(start, this.neighbours);
        this.maxSea = this._nghValue(start, this.neighboursSea);
        this.ngh2 = this._nghValue(start, this.neighbours2);
        this.ngh2Sea = this._nghValue(start, this.neighboursSea2);
    },
    ok: function(situation) {
        if (this.moveLimit == -1) return { ok: true };
        var ngh = this._nghValue(situation, this.neighbours);
        var nghSea = this._nghValue(situation, this.neighboursSea);
        /*
        console.log('--COMP--')
        console.log('this.seangh')
        console.log(this.seangh)
        console.log('this.neighbours')
        console.log(this.neighbours)
        console.log('this.neighboursSea')
        console.log(this.neighboursSea)
        console.log('this.neighbours2')
        console.log(this.neighbours2)
        console.log('this.neighboursSea2')
        console.log(this.neighboursSea2)
        console.log('this.max')
        console.log(this.max)
        console.log('this.maxSea')
        console.log(this.maxSea)
        console.log('this.ngh2')
        console.log(this.ngh2)
        console.log('this.ngh2Sea')
        console.log(this.ngh2Sea)
        console.log('this.start')
        console.log(this.start)
        console.log('curr - situation')
        console.log(situation)
        console.log('curr - ngh')
        console.log(ngh)
        console.log('curr - nghSea')
        console.log(nghSea)
        console.log(sum(this.start) + " != " + sum(situation))
        console.log('--XOMP--')
        */
        var byland = [];
        var bysea = [];
        if (sum(this.start) != sum(situation))
            return { ok: false };
        for (var key in situation)
        {
            if ((situation[key] || 0) > this.max[key]) {
                byland.push([key, 1]);
            }
            if ((situation[key] || 0) > this.maxSea[key]) {
                bysea.push([key, 1]);
            }
            if (ngh[key] < this.start[key]) {
                byland.push([key, -1]);
            }
            if (nghSea[key] < this.start[key]) {
                bysea.push([key, -1]);
            }
            if (ngh[key] > this.ngh2[key]) {
                byland.push([key, 0]);
            }
            if (nghSea[key] > this.ngh2Sea[key]) {
                bysea.push([key, 0]);
            }
        }
        // If sea movement is forbidden, don't allow bysea
        if (this.seaCost == -1) bysea.push(-1);
        
        var valid = { ok: byland.length == 0 || bysea.length == 0 };
        
        if (valid.ok && bysea.length == 0 && byland.length != 0)
        {
            valid.reduce = [];
            var bl = {};
            _.each(byland, function(b) {
                var id = b[0];
                bl[id] = bl[id] ? bl[id] : { id: parseInt(id), relevance: b[1], count: 0};
                bl[id].count++;
                bl[id].relevance = Math.max(bl[id].relevance, b[1]);
            });
            var find = _.sortBy(_.values(bl), function(b) { return b.count+b.relevance*5; });
            var maxrelevance = -2;
            var ind = {};
            var ii = -1;
            console.log(find)
            while (f = find.pop())
            {
                if (situation[f.id] > 0)
                {
                    if (f.relevance < maxrelevance)
                        continue;
                    var i = _.find(ind, function(val, key) {
                        return _.contains(this.map[key].neighbours, f.id);
                    }, this);
                    if (i === undefined || i < 0) {
                        i = ++ii;
                        valid.reduce[i] = [];
                    }
                    ind[f.id] = i;
                    valid.reduce[i].push(f.id); 
                    maxrelevance = Math.max(f.relevance, maxrelevance);
                }
            }
        }
        return valid;
    },
    _nghValue: function(situation, neighbours) {
        var nghVal = {};
        for (var key in situation)
        {
            var ngh = neighbours[key];
            nghVal[key] = situation[key];
            _.each(ngh, function(n) {
                nghVal[key] += situation[n];
            }, this);
        }
        return nghVal;
    },
    changes: function(situation) {
        var nets = {};
        _.each(situation, function(s, k) {
            nets[k] = s - this.start[k];
        }, this);
        console.log(nets);
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
    this.phases = [ ];
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
    'phases': [
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
        ],
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
        this.actions = _.clone(actions);
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
    draw: function(done, canstop) {
        this.drawer(this.deck, function(c) {
            done(c);
        }, canstop);
    },
    runPhase: function(name, arg) {
        var ctx = {};
        var eng = this;
        var posts = [];
        var pres = [];
        var thePhase = undefined;
        
        _.each(_.pick(this.advances, this.acquired), function(acq) {
            if (acq.phases && _.has(acq.phases, name+'.post'))
            {
                posts.push(acq.phases[name+".post"])
            }
            if (acq.phases && _.has(acq.phases, name+'.pre'))
            {
                pres.push(acq.phases[name+".pre"])
            }
            if (acq.phases && _.has(acq.phases, name))
                thePhase = acq.phases[name].run;
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
        
        if (eng[name] != undefined && thePhase == undefined)
            thePhase = eng[name];
        
        ctx.done = function() {
            ctx.done = runpost;
            if (thePhase != undefined)
                thePhase.call(eng, ctx, arg);
            else
                ctx.done();
        }

        runpre();
    },
    acquire: function(name, done) {
        this.acquired.push(name);
        var adv = this.advances[name];
        if (adv.acquired)
        {
            //                                      | is this during load?
            adv.acquired.call(this, done == undefined);
        }
        if (adv.actions)
        {
            _.each(adv.actions, function(act, key) {
                this.actions[key] = this.actions[key] ? _.extend(this.actions[key], act) : act;
                console.log("Added action "+key)
            }, this);
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
    Engine: new Engine(theMap, theDeck),
    Advances: advances,
}
