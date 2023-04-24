let currentLevel = 0

const levels = [
    { // LEVEL 0
        spawn1: {x: 200, y: 450}, 
        spawn2: {x: 200, y: 550},
    
        topBorder: {x: 100, y: 100, len: 1500}, 
        leftBorder: {x: 100, y: 100, len: CANVAS_HEIGHT - 200}, 
        bottomBorder: {x: 100, y: CANVAS_HEIGHT - 130, len: 1500}, 

        doorwayRight: {top: {x: 1570, y: 100, len: 300}, 
                        bottom: {x: 1570, y: CANVAS_HEIGHT - 400, len: 300},
                        
                        topHall: {x: 1570, y: 400, len: 500},
                        bottomHall: {x: 1570, y: 650, len: 500}
        }, 

        finishLine: {x: 1600, y: 400, pos: "right"}
    },
]

let activeLevel = levels[currentLevel]

let innerMapBorder = {
    top: activeLevel.hasOwnProperty('topBorder') ? activeLevel.rightBorder.x + borderWidth : 0,
    left: activeLevel.hasOwnProperty('leftBorder') ? activeLevel.leftBorder.x + borderWidth : 0,
    bottom: activeLevel.hasOwnProperty('bottomBorder') ? activeLevel.bottomBorder.x : 0,
    right: activeLevel.hasOwnProperty('rightBorder') ? activeLevel.rightBorder.x : 0
}