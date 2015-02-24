module.exports = {
    name: "law",
    title: "Law",
    description: "You may discard the Culture of Thievery and Black \
    Food Market advances when you acquire Law.",
    points: 10,
    cost: { 'tribes': 5, 'gold': 6 },
    resources: [ 'wood', 'stone' ],
    requires: [ 'government', 'philosophy' ],
    required_by: [ ],
    events: {
        'anarchy': {
            'steps': {
                '1.3': "+ If you have {{ adv:law }}, do not Reduce City AV. \
Reduce Tribes by the City AV in each Region. {% hasLaw = true %}"
            }
        },
        'corruption': {
            'steps': {
                '3.1': "+ If you have {{ adv:law }}, do not decimate gold. \
                        {% change({'gold': null}, null) %}"
            }
        },
        'bandits': {
            'steps': {
                '3.1': "+ If you have {{ adv:law }}, reduce the value of the \
                        Attacking Force by one BLUE HEX \
                        {% attack_force -= card_value('h') %}"
            }
        },
        'uprising': {
            'steps': {
                '2.2': "+ If you have {{ adv:law }}, Reduce City AV by 1 \
                        instead of 2. Machining cancels out this effect \
                        of Law.{% if(!has('machining')) change({'city': '-1' }) %}"
            }
        },
        'civil_war': {
            'steps': {
                '3.2': "+ If you have {{ adv:law }} the number in GREEN SQUARE \
                        indicates the collateral damage.\
                        {% collateralDamage = card_value('h') %}"
            }
        },
    },
    acquired: function() {
        // TODO: Ask for discarding Thievery and Black Market
    },
    phases: { },
    actions: { },
}