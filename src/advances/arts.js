module.exports = {
    name: "arts",
    title: "Arts",
    points: 10,
    cost: { 'tribes': 6 },
    resources: [ 'wood' ],
    requires: [ ['literacy', 'music'] ],
    required_by: [ 'patronage' ],
    events: {
        'civil_war': {
            'steps': {
                '4.1': "+ If you have {{ adv:arts }}, subtract \
                        2 from Collateral Damage.{% collateralDamage -= 2 %}"
            }
        }
    },
    phases: { },
    actions: { }
}