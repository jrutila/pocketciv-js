var reducer = require("../core/reducer");
var deck = require("../core/eventdeck").EventDeck;

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
        'mining': {
            'pre': function(ctx) {
                console.log(this.deck)
                var stillNuggets = 0;
                var totalNuggets = _.reduce(deck, function(memo, c, key) {
                    key = parseInt(key);
                    if (!_.contains(this.deck.usedCards, key))
                        stillNuggets += c.gold;
                    return memo+c.gold;
                }, 0,this);
                var msg = "Survey result: deck has "+stillNuggets+" out of "+totalNuggets+" left.\n Do you want to continue?";
                var q = this.queryUser('yesno', msg);
                if (q)
                    ctx.done && ctx.done();
            }
        }
    },
}