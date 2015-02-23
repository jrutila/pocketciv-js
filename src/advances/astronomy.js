module.exports = {
    name: "astronomy",
    title: "Astronomy",
    description: "Once per Era, you may ingore an Event card and it's \
result, and draw a new Event card in it's place.",
    points: 3,
    cost: { 'tribes': 4 },
    resources: [ 'stone' ],
    requires: [ ],
    required_by: [ 'sails_and_rigging' ],
    events: {
        'superstition': {
            'steps': {
                '1.1': "- If you have {{ adv:astronomy }} add 2 to the discard\
                        value. {% discard_amount += 2 %}"
            }
        }
    },
    phases: {
        'event.pre': function(ctx) {
            var engine = this;
            var era = engine.era;
            if (!engine.round_era.skipped_event)
            {
                ctx.skip = function() {
                    console.log("Skipping event! Draw a new one.")
                    // If we did end of era
                    if (engine.era == era)
                        engine.round_era.skipped_event = true;
                    ctx.skip = undefined;
                    engine.event(ctx);
                };
            }
            ctx.done && ctx.done();
        }
    },
    actions: { },
}