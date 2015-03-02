module.exports = {
    name: "culture_of_thievery",
    title: "Culture of Thievery",
    description: "During Upkeep, if random Region has a Tribe, \
Decimated, draw next Event for Additional Gold.\
You may draw for additional Gold during Visitations at\
the risk turning the Visitation into an Attack.\
You may discard the Culture of Thievery advance\
when you acquire Civil Service or Law.",
    points: 1,
    cost: { },
    resources: [ ],
    requires: [ ],
    required_by: [ 'black_market' ],
    events: {
        'trade': {
            'steps': {
                '3': "+ If you have {{ adv:culture_of_thievery }}, you MAY \
                try and steal more Gold from the Visiting Empire, \
                by the following means:",
                '3.1': "+  Draw the top card from the Event Deck. If \
the Event card has 1, 2, or 3 Gold Nuggets, \
keep track of how many Nuggets you have. \
Your collected Nuggets become your “Stash.”\
                {%; draw_card(true) %}\
                {% break_if(card == false) %}",
                '3.1.1': "+ If this first Thievery attempt shows no \
Nuggets, then you must stop and Trade as \
Normal. Otherwise, proceed as directed below.\
                {% break_if(card.gold == 0) %}",
                '3.2': "At any point you can stop Thieving and keep \
                the collected Stash.",
                '3.2': "+ As long as you can continue to draw Event \
cards with Nuggets, you can continue adding \
them to your Stash. However, if you draw an \
Event card that has no Nuggets, \
you lose half \
of your Nuggets collected in your Stash (round \
down), and this Visitation becomes ugly!{%; startDigging() %}",
                '3.2.1': "-  Draw the next Event Card. The RED SQUARE \
indicates the Active Region {{ active_region }}.{%; area_card() %}",
                '3.2.2': "-  Draw the next Event card.{%; draw_card() %} \
                Add up the values in the GREEN SQUARE and BLUE HEX symbols on \
                the newly drawn card. This becomes the strength of the \
                Attacking Force. {% attack_force = card_value('s+h') %}.",
                '3.2.3': "See ATTACK.{%; sub('attack') %}"
            },
            startDigging: function() {
                var ctx = this;
                var engine = this.engine;
                var gold = ctx.card.gold;
                var drawing = function() {
                    engine.draw(function(c) {
                        if (c == false) {
                            // Stop digging
                            ctx.merge({ 'gold': '+'+gold });
                            ctx.break = true;
                            ctx.done && ctx.done();
                        } else if (c.gold == 0) {
                            // Draw empty
                            gold = Math.floor(gold/2);
                            ctx.merge({ 'gold': '+'+gold });
                            ctx.done && ctx.done();
                        } else {
                            // Draw gold
                            gold += c.gold;
                            drawing();
                        }
                    },true);
                }
                drawing();
            }
        }
    },
    phases: {
        'violent_profits': {
            'run': function(ctx) {
                var engine = this;
                engine.draw(function(c) {
                    var area = engine.map.areas[c.circle];
                    if (area && area.tribes > 0)
                    {
                        engine.draw(function(gc) {
                            if (gc.gold > 0)
                                ctx.change('gold', gc.gold);
                            ctx.change(c.circle, { 'tribes': -1 });
                            ctx.done && ctx.done();
                        });
                    } else
                        ctx.done && ctx.done();
                });
            }
        }
    },
    acquired: function() {
        if (this.phases.indexOf('violent_profits') == -1) {
            this.phases.splice(this.phases.indexOf('gold_decimate')+1, 0, 'violent_profits')
            console.log("Added violent_profits to phases "+this.phases)
        }
    },
    actions: { },
}