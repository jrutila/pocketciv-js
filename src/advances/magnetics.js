var reducer = require("../core/reducer");
var _ = require('underscore')

module.exports = {
    name: "magnetics",
    title: "Magnetics",
    description: "Do not Reduce your Tribes by 1 when moving your \
                    tribes across a Sea. Divide Expedition Losses by 2",
    points: 12,
    cost: { 'tribes': 6 },
    resources: [ 'stone' ],
    requires: [ 'metal_working' ],
    required_by: [ ],
    events: { },
    phases: {
        'expedition.pre': function() { }
    },
    acquired: function() {
        console.log("Sea cost now 0")
        this.params.sea_cost = 0;
    },
    actions: { },
}