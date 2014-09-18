module.exports = {
    name: "engineering",
    title: "Engineering",
    points: 5,
    cost: { 'tribes': 3 },
    resources: [ 'stone', 'wood' ],
    requires: [ 'masonry' ],
    required_by: [ 'architecture', 'machining' ],
    events: {
        'volcano': {
        },
        'earthquake': {
            'steps': {
                'f4.1': "+ If you have {{ adv:engineering }}, Cities cannot be \
                        Reduced below 1 AV. Decimated Cities are instead reduced to 1 AV. \
                        {% saveCities() %}"
            },
            saveCities: function() {
                console.log("Saving cities")
                _.forEach(this.changes, function(change, area) {
                    var acity = this.engine.map.areas[area].city;
                    if (acity > 0 && acity + parseInt(change.city) <= 0)
                        change.city = "1";
                }, this)
            }
        },
        'tsunami': {
        }
    },
    phases: {
        'city_advance.pre': function(ctx) {
            console.log('Engineering max city 3')
            this.max_city = !this.max_city || this.max_city < 3 ? 3 : this.max_city;
            ctx.done && ctx.done();
        }
    },
    actions: {
    }
}