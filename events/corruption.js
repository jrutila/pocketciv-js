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
            {% change({'gold': '0'}, null) %}",
    },
    reduceCities: function() {
        var ctx = this;
        var rdc = new reducer.Reducer(ctx.engine);
        rdc.startAmount = corruption;
        rdc.mode = reducer.Modes.Overall;
        rdc.areas = function() {
            var areas = {};
            _.each(this.engine.map.areas, function(area, key) {
                var ccity = _.has(this.changes, area.id) ? parseInt(this.changes[area.id].city) : 0;
                if (area.city + ccity > 0)
                    areas[key] = area;
            }, this);
            if (_.isEmpty(areas)) this.amount = 0;
            return areas;
        }
        rdc.reduce = function(chg, area) {
            this.amount += parseInt(chg.city);
            return { 'city': chg.city }
        }
        ctx.engine.reducer(rdc, function(chg) {
            ctx.changes = chg;
            ctx.done && ctx.done();
        });
    }
}