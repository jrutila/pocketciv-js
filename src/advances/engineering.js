var saveCities = function() {
                console.log("Saving cities")
                _.forEach(this.changes, function(change, area) {
                    var acity = this.engine.map.areas[area].city;
                    if (
                        acity > 0 && (
                        acity + parseInt(change.city) <= 0
                        ||
                        change.city == "0"
                        ))
                        change.city = "1";
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
                '3.3': "+ If you have {{ adv:engineering }}, 1 Wonder = 10 Damage.{% dmgWn = 10 %}"
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