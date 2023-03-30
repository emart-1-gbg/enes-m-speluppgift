/** @type {HTMLCanvasElement} */

const canvas = document.getElementById("mainCanvas")
const ctx = canvas.getContext("2d")
const CANVAS_WIDTH = canvas.width = 1920 
const CANVAS_HEIGHT = canvas.height = 1080

let numberOfEnemies = 10

//let isGrounded 
let platformY = CANVAS_HEIGHT-40

// 1:38:10

//const player1 = newImage()
//player1.src = ""

const map = [
    {x: CANVAS_WIDTH * (1/4), y: 150, w: CANVAS_WIDTH * (1/2)},
    {x: 100, y: 350, w: 350},
    {x: CANVAS_WIDTH-450, y: 350, w: 350},
    {x: CANVAS_WIDTH/2-250, y: 600, w: 500}
]

const player1 = new Player()
const enemies = []

for (let i = 0; i < numberOfEnemies; i++) {
    enemies.push(new Enemy()) 
}

function animate(){
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    map.forEach(floor => {
        ctx.fillRect(floor.x, floor.y, floor.w, 25)
    });
    ctx.fillRect(0, platformY, CANVAS_WIDTH, 50) // ground

    
    player1.draw()

    enemies.forEach(enemy => {
        enemy.draw()
    });

    requestAnimationFrame(animate)
}

animate()