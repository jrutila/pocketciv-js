var reducer = require("../core/reducer");

module.exports = {
    name: "surveying",
    title: "Surveying",
    description: "You may look through the discard pile of Event cards \
                before deciding if you want to Mine.",
    points: 5,
    cost: { 'tribes': 2, 'gold': 4 },
    resources: [ 'stone', 'wood' ],
    requires: [ 'mining' ],
    required_by: [ ],
    events: { },
    actions: {
        'survey': {
            'title': 'Survey before Mining',
            'run': function(ctx) {
                // TODO: Inform how much gold there is left
            }
        }
    },
}