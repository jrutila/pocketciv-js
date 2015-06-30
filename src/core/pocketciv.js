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
    'build': require('../actions/build'),
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

var wonders = {
    'amphitheater': require('../wonders/amphitheater'),
    'atlantis': require('../wonders/atlantis'),
    'citadel': require('../wonders/citadel'),
    'coliseum': require('../wonders/coliseum'),
    'gardens': require('../wonders/gardens'),
    'giant_statue': require('../wonders/giant_statue'),
    'justice': require('../wonders/justice'),
    'monolith': require('../wonders/monolith'),
    'palace': require('../wonders/palace'),
    'wall': require('../wonders/wall'),
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
    get cityAV() {
      return _.reduce(_.values(this.areas), function(memo, area){ return area.city ?  memo + area.city: memo }, 0)
    },
    get cityCount() {
      return _.reduce(_.values(this.areas), function(memo, area){ return area.city ?  memo + 1: memo }, 0)
    },
}

function Engine(impl, map, deck) {
    this.mover = impl && impl.mover || function() { throw "Not implemented mover"; }
    this.reducer = impl && impl.reducer || function() { throw "Not implemented reducer"; }
    this.drawer = impl && impl.drawer || function() { throw "Not implemented drawer"; }
    this.areaChanger = impl && impl.areaChanger || function() { throw "Not implemented areaChanger"; }
    this.eventStepper = impl && impl.eventStepper || function(done) { done & done(); }
    this.advanceAcquirer = impl && impl.advanceAcquirer || function() { throw "Not implemented advaneAcquirer"; }
    this.wonderBuilder = impl && impl.wonderBuilder || function() { throw "Not implemented wonderBuilder"; }
    this.queryUser = impl && impl.queryUser || function() { throw "Not implemented queryUser"; }
    this.map = map || new Map();
    this.deck = deck || new EventDeck();
    var eng = this;
    this.deck.noMoreCards = function() { };
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
    this.wonders = _.clone(wonders);
    this.acquired = [];
    this.built = {};
    this.trading = [];
    this.actions = _.clone(actions);
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
    'built': {},
    'trading': [],
    'gold': 0,
    'glory': 0,
    'era': 1,
    'round': {},
    'params': {},
    'round_era': {},
    'goal': 'Try to advance to the end of the 8th era',
    'rules': '',
    'name': undefined,
    'isSeaNeighbour': function(area) { return _.some(area.neighbours, reducer.isSea); },
}

function deepClone(object) {
  var clone = _.clone(object);

  _.each(clone, function(value, key) {
    if (_.isObject(value)) {
      clone[key] = deepClone(value);
    }
  });

  return clone;
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
            en[p] = typeof defaults[d] == "function" ? defaults[d] : deepClone(defaults[d]);
            if (st && st[p])
                en[p] = typeof st[p] == "function" ? st[p] : deepClone(st[p]);
        }
        _.each(state, function(st, stk) {
            if (!_.has(this, stk))
                this[stk] = st;
        },this);
        this.actions = _.extend(_.clone(actions), state.actions);
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
            if (st && st[p] && JSON.stringify(st[p]))
                en[p] = JSON.parse(JSON.stringify(st[p]));
        }, this);
        return ret;
    },
    end_of_era: function(ctx) {
        console.log("End of era");
        if (this.map.cityCount >= this.era || this.era >= 8)
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
        this.signals.phaser.dispatch("gameover", this.resolution)
    },
    nextPhase: function() {
        this.signals.phaser.dispatch("end", this.phase)
        this.phase = this.phases[this.phases.indexOf(this.phase)+1] || this.phases[0];
        this.signals.phaser.dispatch("start", this.phase)
    },
    draw: function(done, canstop) {
        var deck = this.deck;
        var that = this;
        this.drawer(deck, function(c) {
            if (deck.cardsLeft == 0)
            {
                console.log("Deck exhausted")
                // Deck exhausted
                var funcs = that._getRunFuncs("end_of_era");
                var ctx = that.currentContext || new PhaseContext(that);
                var eng = that;
                var final = function() {
                    _.each(ctx.changes, function(val, key) {
                        // Set inits on current context so that it works
                        var newval = _.pick(ctx.targets[key], _.keys(val));
                        ctx.init(key, newval);
                    });
                    done(c);
                };
                that.processPhase(ctx, function(ctxx) {
                    // Handle the area change
                    if (ctxx.changes) eng.areaChange(ctxx, final);
                    else final(ctxx);
                }, funcs);
            } else {
                done(c);
            }
        }, canstop);
    },
    checkLosing: function() {
        return this.map.tribeCount == 0 && this.map.cityCount == 0;
    },
    endPhase: function() {
        var ctx = this.currentContext;
        this.currentContext = undefined;
        // We are dealing with advance phase
        if (this['advance.post']) {
            ctx.done = function() {
                if (ctx.engine.phase != "gameover")
                    ctx.engine.nextPhase();
            }
            this['advance.post'](ctx);
        } else
            ctx.engine.nextPhase();
    },
    processPhase: function(ctx, final, funcs) {
        var eng = this;
        // funcs is a list of pres, the phase and posts
        var runFuncs = function() {
            var func = funcs.shift();
            if (!func)
                return function() {
                    final.call(eng, ctx); 
                };
            var olddone = ctx.done;
            ctx.done = function() {
                ctx.done = olddone;
                runFuncs()();
            };
            return function() {
                func.call(eng, ctx);
            };
        }
        runFuncs()();
    },
    _getRunFuncs: function(name, arg) {
        var posts = [];
        var pres = [];
        var thePhase = undefined;
        var eng = this;
        
        if (this[name+".post"]) posts.push(this[name+".post"]);
        if (this[name+".pre"]) pres.push(this[name+".pre"]);
        if (name != "advance" || !arg) // advance actions do not support post pre yet
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
        
        if (thePhase == undefined)
        {
            thePhase = this.phaseImpl[name] && this.phaseImpl[name].run;
            if (thePhase == undefined)
                thePhase = this[name];
            if (thePhase == undefined)
                console.log("NO phase found: "+name);
        }
        
        var funcs = [];
        _.each(pres, function(pre) { funcs.push(function(ctx) { pre.call(eng, ctx); }); },this);
        funcs.push(function(ctx) { thePhase.call(eng, ctx, arg); });
        _.each(posts, function(post) { funcs.push(function(ctx) { post.call(eng, ctx); }); },this);
        return funcs;
    },
    runPhase: function(name, arg) {
        var ctx = new PhaseContext(this);
        // Why is this?
        if (name != 'advance' || arg == undefined)
            this.currentContext = ctx;
        var eng = this;
        
        if (eng.checkLosing())
        {
            eng.gameOver(false, "notribesandcities");
            return;
        }
        
        
        var final = function() {
                if (name != 'advance' || arg == undefined) {
                        ctx.confirm && ctx.confirm();
                        
                        if (eng.checkLosing())
                        {
                            eng.gameOver(false, "notribesandcities");
                            return;
                        }
                        
                        if (name != "end_of_era" && eng.phase != "gameover")
                            eng.nextPhase();
                }
        };
        
        var funcs = this._getRunFuncs(name, arg);
        this.processPhase(ctx, function(ctx) {
            // Handle the area change
            if (ctx.changes) eng.areaChange(ctx, final);
            else final(ctx);
        }, funcs);
    },
    acquire: function(name, ctx) {
        if (_.contains(this.acquired, name))
        {
            console.log("Already acquired "+name);
            return;
        }
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
        //ctx && ctx.done && ctx.done();
    },
    build: function(name, area) {
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
        console.log("Built "+name+" to area "+area);
    },
    doEvent: function(ev, ctx) {
        var eng = this;
        var event = eng.events[ev.name];
        eventRunner.runEvent(eng, event, ev, ctx);
    },
    areaChange: function(ctx, done) {
        this.areaChanger(ctx, function() {
            _.each(ctx.targets, function(trg, key) {
                if (!isNaN(parseInt(key))) {
                    // Area target
                    this.map.areas[key] = _.extend(this.map.areas[key], trg);
                } else {
                    // Other target
                    this[key] = trg;
                }
            },this);
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
