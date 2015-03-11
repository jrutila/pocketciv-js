var _ = require('underscore')

var saveCities = function() {
                _.each(this.ctx.changes, function(change, area) {
                    if (change.city < 0 && this.ctx.targets[area].city == 0)
                        this.ctx.target(area, {city:1})
                }, this)
            };
module.exports = {
    name: "engineering",
    title: "Engineering",
    description: "The maximum AV of a City is 3, unless otherwise noted.",
    points: 5,
    cost: { 'tribes': 3 },
    resources: [ 'stone', 'wood' ],
    requires: [ 'masonry' ],
    required_by: [ 'architecture', 'machining' ],
    events: {
        'volcano': {
            'steps': {
                '2.3.1': "+ If you have {{ adv:engineering }}, Cities cannot be \
                        Reduced below 1 AV. Decimated Cities are instead reduced to 1 AV. \
                        {% saveCities() %}"
            },
            saveCities: saveCities
        },
        'earthquake': {
            'steps': {
                'f4.1': "+ If you have {{ adv:engineering }}, Cities cannot be \
                        Reduced below 1 AV. Decimated Cities are instead reduced to 1 AV. \
                        {% saveCities() %}"
            },
            saveCities: saveCities
        },
        'flood': {
            'steps': {
                '3.2.1': "+ If you have {{ adv:engineering }}, 1 Wonder = 10 Damage.{% dmgWn = 10 %}"
            }
        }
    },
    acquired: function() {
        console.log('Engineering max city 3')
        this.params.max_city = !this.params.max_city || this.params.max_city < 3 ? 3 : this.params.max_city;
    },
    phases: { },
    actions: { }
}