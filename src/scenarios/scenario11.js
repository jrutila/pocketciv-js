var reducer = require("../core/reducer");
var _ = require("underscore");

module.exports = {
    "name": "scenario11",
    "title": "11. The Great Lake of 1000 Depths",
    "rules": "If Region 8 or 5 becomes the Active Region for a Tsunami, then that Region \
    is removed from the game (along with any Tribes, Cities, and Wonders on it), and the \
    Great Lake then becomes a bay to the Sea.<br/> You can not perform Sea Expeditions on the \
    Great Lake. However, if the Lake becomes a Bay, then you can perform Sea Expeditions are normal.<br/> \
    You may use Fishing and Navigation to move Tribes across the Great Lake as if it was a Sea. \
    Regions 1,2,3,4,6, and 7 are not considered to be Neighboring the Sea unless Region \
    5 or 8 is Decimated by a Tsunami.",
    "goal": "Attain 300 Glory",
    "description": "",
    "isSeaNeighbour": function(area, domain) {
        var isSea = _.any(area.neighbours, function(r) { return r === 'sea'; });
        var isLake = _.any(area.neighbours, function(r) { return r === 'lake'; });
        if (isSea)
            return true;
        if (isLake && domain == "fishing")
            return true;
        return false;
    },
    "event.post": function(ctx) {
        if (ctx.event && ctx.event.name == 'flood' && ctx.engine.params.nolake != true)
        {
            var c = ctx.eventCtx;
            if (c.active_region && (c.active_region.id == 5 || c.active_region.id == 8))
            {
                var id = c.active_region.id;
                delete ctx.engine.map.areas[id];
                var grid = ctx.engine.map.grid;
                for (var i = 0; i < grid.length; i++)
                    for (var j = 0; j < grid.length; j++)
                        if (grid[i][j] == id)
                            grid[i][j] = -1;
                delete ctx.initial[id];
                delete ctx.targets[id];
                _.each(ctx.engine.map.areas, function(area) {
                    area.neighbours = _.without(area.neighbours, id);
                    if (_.contains(area.neighbours, "lake"))
                        area.neighbours = _.union(
                            _.without(area.neighbours, "lake"), ["sea"]);
                }, this);
                ctx.engine.params.nolake = true;
            }
        }
        ctx.done && ctx.done();
    },
    "map": {
        "areas": {
            "1": {
                "id": 1,
                "forest": true,
                "desert": true,
                "mountain": true,
                "neighbours": [ 2, 3, 7, 'lake', 'frontier'],
            },
            "2": {
                "id": 2,
                "forest": true,
                "neighbours": [ 1, 6, 7, 'lake'],
            },
            "3": {
                "id": 3,
                "mountain": true,
                "neighbours": [ 1, 4, 'lake', 'frontier'] ,
            },
            "4": {
                "id": 4,
                "mountain": true,
                "neighbours": [ 3, 8, 'lake', 'frontier']
            },
            "5": {
                "id": 5,
                "forest": true,
                "farm": true,
                "neighbours": [ 6, 8, 'sea', 'lake', 'frontier'],
            },
            "6": {
                "id": 6,
                "farm": true,
                "neighbours": [ 2, 5, 7, 'lake', 'frontier'],
            },
            "7": {
                "id": 7,
                "tribes": 3,
                "forest": true,
                "neighbours": [ 1, 2, 6, 'frontier' ]
            },
            "8": {
                "id": 8,
                "forest": true,
                "farm": true,
                "neighbours": [ 4, 5, 'sea', 'lake', 'frontier'],
            },
        },
        "width": 10,
        "height": 10,
        "grid":[
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,0,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,8,4,4,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,8,8,-1,4,4,0,0,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,8,-1,-1,-1,3,3,0,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,5,-1,-1,-1,-1,3,0,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,5,-1,-1,-1,-1,3,0,-1,-1,-1,-1,-1,-1,-1],
        [-1,5,5,6,-1,-1,1,1,0,-1,-1,-1,-1,-1,-1,-1],
        [-1,0,6,6,2,2,2,1,0,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,0,0,6,7,2,1,0,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,0,7,7,7,0,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,0,0,0,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
        ]
    }
}