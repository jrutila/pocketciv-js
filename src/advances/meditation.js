module.exports = {
    name: "meditation",
    title: "Meditation",
    points: 4,
    cost: { 'tribes': 3 },
    resources: [ 'food', 'wood' ],
    requires: [ 'mythology' ],
    required_by: [ 'philosophy' ],
    events: {
        'civil_war': {
            'steps': {
                '4.3': "+ If you have {{ adv:meditation }}, divide \
                        Collateral Damage in half, round down.\
                        {% collateralDamage = Math.floor(collateralDamage/2) %}"
            }
        },
        'superstition': {
            'steps': {
                '1.2': "+ If yoy have {{ adv:meditation }}, you may, but are\
                        not required to, stop discarding Event cards if\
                        the Event deck has one card left."
            },
            canstop: function() {
                return this.engine.deck.cardsLeft == 1;
            }
        }
    },
    phases: { },
    actions: { }
}