module.exports = {
    name: "irrigation",
    title: "Irrigation",
    points: 10,
    cost: { 'tribes': 2, 'gold': 2 },
    resources: [ 'wood' ],
    requires: [ [ 'agriculture', 'horticulture' ] ],
    required_by: [  ],
    events: {
        'famine': {
            'steps': {
                '2.2': "+ If you have {{ adv:irrigation }}, do not Decimate Farms.\
                Reduce City AV by 1 instead 2.{% change({ tribes: '0', city: '-1' }) %}",
            }
        },
        'flood': { },
        'sandstorm': { },
    },
    actions: { }
}