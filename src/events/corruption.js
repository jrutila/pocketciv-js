var reducer = require('../core/reducer')
var _ = require('underscore')

module.exports = {
    name: 'corruption',
    title: 'Corruption',
    punchline: 'Here\'s your money',
    description: "",
    steps: {
            '1': "Draw the next event card {%; draw_card() %}. Using the symbols shown \
            on the ORIGINAL Event card ({{ event.expr }}) \
            , add up the values in the symbols on \
            the newly drawn card. The total value that this creates \
            determines your amount of {% corruption = card_value(event.expr) %}\
            ({{ corruption }}).",
            '2': "Reduce City AVs throughout your Empire equal to \
            the amount of Corruption ({{ corruption }}). You may choose which \
            Cities to reduce. Any City Reduced to 0 AV is \
            Decimated. {%; reduceCities() %}",
            '3': "Decimate all Gold you currently have.\
            {% target('gold', 0) %}",
    },
    reduceCities: function() {
        var ctx = this;
        var opts = reducer.Templates.basic(ctx, ['city']);
        opts.amount = corruption;
        var rdc = new reducer.Reducer(opts);
        ctx.engine.reducer(rdc, function(ok) {
            console.log(ok.changes)
            ctx.change(ok.changes);
            ctx.done && ctx.done();
        });
    }
}