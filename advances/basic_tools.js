module.exports = {
    name: "basic_tools",
    title: "Basic Tools",
    description: "Reduce the cost of Decimating Tribes when increasing a City AV by 1.",
    points: 1,
    cost: { },
    resources: [ ],
    requires: [ ],
    required_by: [ ],
    events: { },
    phases: { },
    acquired: function() {
            console.log('Basic tools reduce cost by 1')
            if (this.params.city_advance_discount === undefined)
                this.params.city_advance_discount = 1;
            else
                this.params.city_advance_discount++;
    },
    actions: { },
}