module.exports = {
    "title": "Scenario 8",
    "map": {
        "areas": {
            "1": {
                "id": 1,
                "desert": true,
                "neighbours": [ 3, 4, 6, 'western', 'frontier'],
            },
            "2": {
                "id": 2,
                "tribes": 1,
                "mountain": true,
                "forest": true,
                "neighbours": [ 5, 7, 8, 'eastern', 'frontier'],
            },
            "3": {
                "id": 3,
                "desert": true,
                "neighbours": [ 1, 4, 5, 6 ],
            },
            "4": {
                "id": 4,
                "desert": true,
                "mountain": true,
                "neighbours": [ 1, 3, 5, 8, 'frontier']
            },
            "5": {
                "id": 5,
                "desert": true,
                "mountain": true,
                "neighbours": [ 2, 3, 4, 6, 'frontier'],
            },
            "6": {
                "id": 6,
                "forest": true,
                "mountain": true,
                "neighbours": [ 1, 3, 5, 'western', 'frontier'],
            },
            "7": {
                "id": 7,
                "tribes": 1,
                "city": 1,
                "forest": true,
                "farm": true,
                "neighbours": [ 2, 8, 'eastern', 'frontier' ]
            },
            "8": {
                "id": 8,
                "tribes": 1,
                "forest": true,
                "neighbours": [ 2, 4, 7, 'frontier'],
            },
        },
        "width": 9,
        "height": 9,
        "grid":[
        [-1,-1,-1, 0, 0, 0,-1,-1,-1,-1,-1 ],
        [-1,-1,-1, 0, 0, 0,-1,-1,-1,-1,-1 ],
        [-1,-1,-1, 0, 0, 0,-1,-1,-1,-1,-1 ],
        [-1,-1, 6, 0, 0, 0, 0, 0,-1,-1,-1 ],
        [-1,-1, 6, 6, 0, 0, 0, 0,-1,-1,-1 ],
        [-1, 1, 6, 3, 5, 5, 0,-1,-1,-1,-1 ],
        [-1, 1, 3, 3, 3, 5, 2, 2, 2, 7,-1 ],
        [-1,-1, 1, 1, 4, 4, 5, 2, 7, 7,-1 ],
        [-1,-1,-1, 0, 0, 4, 4, 0, 8, 7,-1 ],
        [-1,-1,-1, 0, 0, 0, 8, 8, 8, 0,-1 ],
        [-1,-1,-1, 0, 0, 0, 0, 0, 0, 0,-1 ],
        [-1,-1,-1, 0, 0, 0, 0, 0, 0, 0,-1 ],
        [-1,-1,-1,-1,-1,-1,-1, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1,-1,-1, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1,-1,-1, 0, 0, 0, 0 ],
        ] 
    }
}