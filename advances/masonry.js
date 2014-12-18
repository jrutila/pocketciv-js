module.exports = {
    name: "masonry",
    title: "Masonry",
    description: "During Upkeep, you can increase one City AV by 1. \
The maximum AV of a City is 2, unless otherwise noted.",
    points: 3,
    cost: { 'tribes': 2 },
    resources: [ 'stone' ],
    requires: [ ],
    required_by: [ 'engineering' ],
    events: { },
    acquired: function() {
        console.log('Masonry max city 2')
        this.params.max_city = !this.params.max_city || this.params.max_city < 2 ? 2 : this.params.max_city;
        if (this.params.city_advance_limit === undefined)
            this.params.city_advance_limit = 1;
        else
            this.params.city_advance_limit++;
        console.log('Masonry city advance limit is now '+this.params.city_advance_limit)
    },
    phases: { },
    actions: { }
}