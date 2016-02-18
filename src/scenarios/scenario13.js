module.exports = {
    "name": "scenario13",
    "title":  "13. Watchers of the Sea",
    "rules": "If you have Roadbuilding or Equestrian, you can move \
    Tribes between Regions 8 and 7 as if they share a common border",
    "goal": "Build a Coliseum of Death and an Amphitheater before the end of the  8th Era.",
    "description": "You start the game automatically with Coinage.",
    "acquired": ["navigation"],
    "map": {
        "areas": {
             "1": {
                "id":  1,
                "tribes": 1,
                "forest": true,
                "neighbours": [ 3, 7, 8, 'sea' ],
            },
             "2": {
                "id":  2,
                "mountain": true,
                "neighbours": [ 'sea' ],
            },
             "3": {
                "id":  3,
                "forest": true,
                "neighbours": [ 1, 8, 'sea' ] ,
            },
             "4": {
                "id":  4,
                "forest": true,
                "mountain": true,
                "neighbours": [ 5, 'sea', 'frontier' ]
            },
             "5": {
                "id":  5,
                "desert": true,
                "mountain": true,
                "neighbours": [ 4, 'sea' ],
            },
             "6": {
                "id":  6,
                "mountain": true,
                "neighbours": [ 'sea', 'frontier' ],
            },
             "7": {
                "id":  7,
                "tribes": 1,
                "forest": true,
                "mountain": true,
                "neighbours": [ 1, 8, 'sea' ]
            },
             "8": {
                "id":  8,
                "tribes": 1,
                "forest": true,
                "neighbours": [ 1, 3, 7, 'sea' ],
            },
        },
        "width":  10,
        "height":  10,
        "grid":
        [
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,2,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [0,-1,-1,2,2,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [0,6,-1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [0,6,6,-1,-1,4,4,4,-1,-1,-1,-1,-1,-1,-1,-1],
            [0,0,6,-1,-1,-1,4,5,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,8,-1,5,5,0,-1,-1,-1,-1,-1,-1,-1],
            [-1,7,7,8,8,3,-1,5,0,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,7,7,8,0,3,-1,0,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,1,1,3,3,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
        ]
    }
}