var eventDeck = require('./eventdeck').EventDeck;
var _ = require("underscore");
var eventRunner = require('./event');
var reducer = require('../core/reducer');
var signals = require('signals');
var PhaseContext = require('./context').Context;
var Ctx = require('./context');

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
    'superstition': require('../events/superstition'),
}

var phases = {
    'city_advance': require('../phases/city_advance'),
    'populate': require('../phases/populate'),
    'tothree': require('../phases/tothree'),
    'advance': require('../phases/advance'),
    'support': require('../phases/support'),
    'city_support': require('../phases/city_support'),
    'gold_decimate': require('../phases/gold_decimate'),
    'gold_management': require('../phases/gold_management'),
    'upkeep': require('../phases/upkeep'),
    'event': require('../phases/event'),
    'move': require('../phases/move'),
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
    'fishing': require('../advances/fishing'),
    'astronomy': require('../advances/astronomy'),
    'metal_working': require('../advances/metal_working'),
    'military': require('../advances/military'),
    'centralized_government': require('../advances/centralized_government'),
    'democracy': require('../advances/democracy'),
    'arts': require('../advances/arts'),
    'theater': require('../advances/theater'),
    'patronage': require('../advances/patronage'),
    'story_telling': require('../advances/story_telling'),
    'mythology': require('../advances/mythology'),
    'meditation': require('../advances/meditation'),
    'philosophy': require('../advances/philosophy'),
    'org_religion': require('../advances/org_religion'),
    'ministry': require('../advances/ministry'),
    'law': require('../advances/law'),
    'written_record': require('../advances/written_record'),
    'surveying': require('../advances/surveying'),
    'machining': require('../advances/machining'),
    'common_tongue': require('../advances/common_tongue'),
    'shipping': require('../advances/shipping'),
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
    get cityCount() {
      return _.reduce(_.values(this.areas), function(memo, area){ return area.city ?  memo + area.city: memo }, 0)
    },
}

function Engine(impl, map, deck) {
    this.mover = impl && impl.mover || function() { throw "Not implemented mover"; }
    this.reducer = impl && impl.reducer || function() { throw "Not implemented reducer"; }
    this.drawer = impl && impl.drawer || function() { throw "Not implemented drawer"; }
    this.areaChanger = impl && impl.areaChanger || function() { throw "Not implemented areaChanger"; }
    this.eventStepper = impl && impl.eventStepper || function(done) { done & done(); }
    this.advanceAcquirer = impl && impl.advanceAcquirer || function() { throw "Not implemented advaneAcquirer"; }
    this.queryUser = impl && impl.queryUser || function() { throw "Not implemented queryUser"; }
    this.map = map || new Map();
    this.deck = deck || new EventDeck();
    var eng = this;
    this.deck.noMoreCards = function() { eng.runPhase('end_of_era'); };
    this.phases = [ ];
    this.phase = "populate";
    this.events = events;
    this.advances = {};
    this.phaseImpl = phases;
    this.orig_adv_costs = {};
    for (var a in advances) {
        this.advances[a] = _.clone(advances[a]);
        this.advances[a].cost = _.clone(advances[a].cost);
    }
    this.acquired = [];
    this.trading = [];
    this.actions = actions;
    this.gold = 0;
    this.round = {} // Will be emptied after upkeep!
    this.round_era = {}; // Will be emptied on end of an era!
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
        "tothree",
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
    'glory': 0,
    'era': 1,
    'round': {},
    'round_era': {},
    'goal': 'Try to advance to the end of the 8th era',
    'name': undefined,
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
        _.each(state, function(st, stk) {
            if (!_.has(this, stk))
                this[stk] = st;
        },this);
        this.actions = _.clone(actions);
        this.params = {};
        for (var key in this.map.areas)
        {
            this.map.areas[key].id = parseInt(key);
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
    end_of_era: function(ctx) {
        console.log("End of era");
        if (this.map.cityCount >= this.era)
        {
            // Can Gain glory!
            var trbCount = this.map.tribeCount;
            // Get tribeCount biggest advances
            var sorted = _.last(_.sortBy(_.values(_.pick(this.advances, this.acquired)), 'points'), trbCount);
            // And calc the glory addition
            var glory = _.reduce(sorted, function(memo, s) {
                return memo + s.points;
            }, 0);
            console.log("Gaining glory "+glory);
            this.glory += glory;
        } else {
            console.log("No glory because not enough cities!")
        }
        this.round_era = {};
        this.deck.shuffle();
        this.era++;
        ctx.done && ctx.done();
    },
    gameOver: function(resolution) {
        this.resolution = resolution;
        this.phase = "gameover";
    },
    nextPhase: function() {
        this.signals.phaser.dispatch("end", this.phase)
        this.phase = this.phases[this.phases.indexOf(this.phase)+1] || this.phases[0];
        this.signals.phaser.dispatch("start", this.phase)
        console.log("Phase is now "+this.phase);
    },
    draw: function(done, canstop) {
        this.drawer(this.deck, function(c) {
            done(c);
        }, canstop);
    },
    checkLosing: function() {
        return this.map.tribeCount == 0 && this.map.cityCount == 0;
    },
    runPhase: function(name, arg) {
        var ctx = new PhaseContext(this);
        var eng = this;
        var posts = [];
        var pres = [];
        var thePhase = undefined;
        
        if (eng.checkLosing())
        {
            eng.gameOver(false, "notribesandcities");
            return;
        }
        
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
        if (this[name+".post"]) posts.push(this[name+".post"]);
        if (this[name+".pre"]) pres.push(this[name+".pre"]);
        
        var final = function() {
                        ctx.confirm && ctx.confirm();
                        
                        if (eng.checkLosing())
                        {
                            eng.gameOver(false, "notribesandcities");
                            return;
                        }
                        
                        if (name != "advance" && name != "end_of_era" && eng.phase != "gameover")
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
                if (ctx.changes)
                {
                    var str = Ctx.getString(ctx.changes);
                    eng.areaChange(str, final);
                } else {
                    final();
                }
            }
        }
        
        if (thePhase == undefined)
        {
            thePhase = this.phaseImpl[name] && this.phaseImpl[name].run;
            if (thePhase == undefined)
                thePhase = eng[name];
            if (thePhase == undefined)
                console.log("NO phase found: "+name);
        }
        
        ctx.done = function() {
            ctx.done = runpost;
            if (thePhase != undefined)
                thePhase.call(eng, ctx, arg);
            else
                ctx.done();
        }

        runpre();
    },
    acquire: function(name, ctx) {
        this.acquired.push(name);
        var adv = this.advances[name];
        if (adv.acquired)
        {
            //                                      | is this during load?
            adv.acquired.call(this, ctx);
        }
        if (adv.actions)
        {
            _.each(adv.actions, function(act, key) {
                this.actions[key] = this.actions[key] ? _.extend(this.actions[key], act) : act;
                console.log("Added action "+key)
            }, this);
        }
        console.log("Acquired "+name);
        ctx && ctx.done && ctx.done();
    },
    doEvent: function(ev, ctx) {
        var eng = this;
        var event = eng.events[ev.name];
        eventRunner.runEvent(eng, event, ev, ctx);
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
    NoMoreCardsError: NoMoreCardsError,
    EventDeck: theDeck,
    Map: theMap,
    MapBuild: Map,
    DeckBuild: EventDeck,
    TribeMover: phases.move.TribeMover,
    Engine: new Engine(theMap, theDeck),
    EngineBuild: Engine,
    Advances: advances,
}
