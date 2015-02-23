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
        var opts = {
            map: this.engine.map.areas,
            initial: _.extend(_.clone(this.engine.map.areas), {'gold': this.engine.gold }),
            amount: corruption,
            name: 'corruption',
            shows: ['city'],
            edits: ['city'],
            reduce: function(key, chg) {
                this.amount -= this.initial[key].city - chg.city;
                return { 'city': chg.city };
            },
            current: function(chg, key, val) {
                if (!key)
                {
                    this.current = {};
                    _.each(this.initial, function(i, ik) {
                        if (i.city > 0)
                            this.current[ik] = i;
                    },this);
                }
            },
            check: function() {
                if (this._defaultCheck())
                    return true;
                var noCities = true;
                _.each(this.initial, function(i, ik) {
                    var trg = i.city;
                    if (this.targets[ik])
                        trg = this.targets[ik].city;
                    if (trg > 0)
                    {
                        noCities = false;
                    }
                },this);
                return noCities;
            }
        };
        var rdc = new reducer.Reducer(opts);
        ctx.engine.reducer(rdc, function(chg) {
            ctx.changes = chg;
            ctx.done && ctx.done();
        });
    }
}