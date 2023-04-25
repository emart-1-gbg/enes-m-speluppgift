/** @type {HTMLCanvasElement} **/

const canvas = document.getElementById("mainCanvas")
const ctx = canvas.getContext("2d")

const widthMultiplier = 0.98
const heightMultiplier = 0.86
canvas.width = window.innerWidth * widthMultiplier
canvas.height = window.innerHeight * heightMultiplier

window.addEventListener("resize", (e) => {
    canvas.width = window.innerWidth * widthMultiplier
    canvas.height = window.innerHeight * heightMultiplier
})

const menu = document.getElementById("menus")
const overlay = document.getElementById("overlay")
overlay.style.width = canvas.width * widthMultiplier + "px" 

let numberOfEnemies = 100

let playerCount = 1

window.onload = function() {
    loadMenu()
}

function loadMenu() {
    menu.style.display = "block"
    overlay.style.display = "flex"
    // auto run ------
    //loadGame()
}

function loadGame() {
    menu.style.display = "none"
    overlay.style.visibility = "visible"

    prepareLoad(levels[currentLevel])
    animate()
    
}

// TOP, LEFT, BOTTOM, RIGHT

let currentLevel = 0

const levels = [
    { // LEVEL 0
        spawn1: {x: 200, y: 450}, 
        spawn2: {x: 200, y: 550},
    
        topBorder: {x: 100, y: 100, len: 1500}, 
        leftBorder: {x: 100, y: 100, len: canvas.height - 200}, 
        bottomBorder: {x: 100, y: canvas.height - 130, len: 1500}, 

        doorwayRight: {top: {x: 1570, y: 100, len: 300}, 
                        bottom: {x: 1570, y: canvas.height - 400, len: 300},
                        
                        topHall: {x: 1570, y: 400, len: 500},
                        bottomHall: {x: 1570, y: 650, len: 500}
        }, 

        finishLine: {x: 1600, y: 400, pos: "right"}
    },

]

let activeLevel = levels[currentLevel]

const borderWidth = 30

function prepareLoad(level) {
    player1.x = level['spawn1']['x']
    player1.y = level['spawn1']['y']

    player2.x = level['spawn2']['x']
    player2.y = level['spawn2']['y']

    levelLoader(level)
}

function levelLoader(level) {

    

}



class Controls{
    constructor(up, left, down, right){
        this.up = false
        this.left = false
        this.down = false
        this.right = false

        this.#input(up, left, down, right)
    }

    #input(up, left, down, right){

        document.addEventListener('keydown', (event) => {
            switch (event.key) {

                case up:
                    this.up = true
                    break;
                
                case left:
                    this.left = true
                    break;

                case down:
                    this.down = true
                    break;
                
                case right:
                    this.right = true
                    break;
            }
            //console.table(this)
        })

        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case up:
                    this.up = false
                    break;
                
                case left:
                    this.left = false
                    break;

                case down:
                    this.down = false
                    break;
                
                case right:
                    this.right = false
                    break;
            }
            //console.table(this)
        })
    }
}

class Player {

    static ID = 1
    static instance = []

    constructor(up, left, down, right){

        this.id = Player.ID++
        Player.instance.push(this)


        this.w = 30
        this.h = 40

        this.x = null
        this.y = null

        this.controls = new Controls(up, left, down, right)

        this.xSpeed = 0
        this.xAccel = 2

        this.ySpeed = 0
        this.yAccel = 2

        this.maxSpeed = 9
        this.friction = 0.5

        this.health = 30
    }

    update(){
        
        //input movement

        // if (this.x < 0 ||
        //     this.y < 0 ||
        //     this.x + this.w > canvas.width ||
        //     this.y + this.h > canvas.height) {
        //     // console.log("player " + this.id + " is outside")
        // } else {
        //     // console.log("player " + this.id + " is inside")
        // }

        if (this.controls.up) {
            this.ySpeed -= this.yAccel
        }

        if (this.controls.down) {
            this.ySpeed += this.yAccel
        }
        
        if (this.controls.left) {
            this.xSpeed -= this.xAccel
        }

        if (this.controls.right) {
            this.xSpeed += this.xAccel
        }
    
        //slow down automatically when key up
        if (this.ySpeed > 0 && !this.controls.down) {
            this.ySpeed -= this.friction
        }
        if (this.ySpeed < 0 && !this.controls.up) {
            this.ySpeed += this.friction
        }

        if (this.xSpeed > 0 && !this.controls.right) {
            this.xSpeed -= this.friction
        }
        if (this.xSpeed < 0 && !this.controls.left) {
            this.xSpeed += this.friction
        }

        //speed limiter
        if (this.ySpeed > this.maxSpeed) {
            this.ySpeed = this.maxSpeed
        }

        if (this.xSpeed > this.maxSpeed) {
            this.xSpeed = this.maxSpeed
        }
        // for the negative directoin
        if (this.ySpeed < -this.maxSpeed) {
            this.ySpeed = -this.maxSpeed
        }

        if (this.xSpeed < -this.maxSpeed) {
            this.xSpeed = -this.maxSpeed
        }

        // update location
        this.y += this.ySpeed
        this.x += this.xSpeed

        // boundary checks
        if (this.x <= 0) {
            this.x = 0
            this.xSpeed = 0
        }

        if (this.x + this.w >= canvas.width) {
            this.x = canvas.width - this.w
            this.xSpeed = 0
        }

        if (this.y <= 0) {
            this.y = 0
            this.ySpeed = 0
        }

        if (this.y + this.h > canvas.height) {
            this.y = canvas.height - this.h
            this.ySpeed = 0
        }

    }

    draw(color){
        this.update()

        ctx.beginPath()
        ctx.fillStyle = color
        ctx.rect(this.x, this.y, this.w, this.h)
        ctx.fill()
        ctx.closePath()
    }
}

// Math.floor(Math.random() * (max - min + 1) ) + min

class Enemy {
    constructor(){
        this.x = Math.floor(Math.random() * (canvas.width - 300 + 1)) + 300
        this.y = Math.floor(Math.random() * (canvas.height - 300 + 1)) + 300

        this.w = 32
        this.h = 32

        this.middlePos = {x: this.x + (this.w / 2), y: this.y + (this.h / 2)}

        this.image = new Image()
        this.image.src = './models/enemy.png'

        // so speed is never 0
        this.xSpeed = 0
        while (this.xSpeed === 0) {
            this.xSpeed = Math.random() * (6 - 4 + 1) + 4
        }

        this.ySpeed = 0
        while (this.ySpeed === 0) {
            this.ySpeed = Math.floor(Math.random() * (6 - 4 + 1)) + 4
        }

        // fire rate in milisecond
        this.fireRate = 1000

        // damage per hit
        this.dph = 2

        // damage per seconds
        this.dps = (this.fireRate / 1000) * this.dph

        this.targetPos = null
        this.targetPlayer = this.#setTarget()
    }

    #setTarget(){
        let player1Pos = {x: player1.x + player1.w / 2, y: player1.y + player1.h / 2}
        let player2Pos = {x: player2.x + player2.w / 2, y: player2.y + player2.h / 2}

        let d1 = (player1Pos.x - this.middlePos.x) ** 2 + (player1Pos.y - this.middlePos.y) ** 2
        let d2 = (player2Pos.x - this.middlePos.x) ** 2 + (player2Pos.y - this.middlePos.y) ** 2

        if (d1 < d2) {
            this.targetPos = player1Pos
            return player1
        } else if (d1 > d2){
            this.targetPos = player2Pos
            return player2
        } else {
            if (Math.floor(Math.random()) === 0) {
                this.targetPos = player1Pos
                return player1
            } else {
                this.targetPos = player2Pos
                return player2
            }
        }
    }

    #updatePos(){
        this.middlePos = {x: this.x + (this.w / 2), 
                        y: this.y + (this.h / 2)}

        this.targetPlayer = this.#setTarget()
    }

    #hitDetection(){
        if (this.targetPlayer.x < this.x + this.w &&
            this.targetPlayer.x + this.targetPlayer.w > this.x && 
            this.targetPlayer.y < this.y + this.h && 
            this.targetPlayer.y + this.targetPlayer.h > this.y) 
        {
            return true
        }
        return false
    }

    update(){
        this.#updatePos()
        this.#hitDetection() ? console.log("yes") : null

        // Move towards target player
        let distanceToTarget = Math.sqrt((this.middlePos.x - this.targetPos.x) ** 2 + (this.middlePos.y - this.targetPos.y) ** 2);

        const dx = (this.targetPos.x - this.middlePos.x) / distanceToTarget * this.xSpeed;
        const dy = (this.targetPos.y - this.middlePos.y) / distanceToTarget * this.ySpeed;

        // Check if new position is inside the boundary
        if (this.x + dx >= 0 && this.x + dx + this.w <= canvas.width &&
            this.y + dy >= 0 && this.y + dy + this.h <= canvas.height) {
            this.x += dx;
            this.y += dy;
        }
        else {
            // If new position is outside the boundary, move the enemy to the nearest valid position
            if (this.x + dx < 0) {
                this.x = 0
            }

            else if (this.x + dx + this.w > canvas.width) {
                this.x = canvas.width - this.w;
            }

            if (this.y + dy < 0) { 
                this.y = 0;
            }
            else if (this.y + dy + this.h > canvas.height) {
                this.y = canvas.height - this.h;
            }
        }
}

    draw(){
        this.update()

        // HITBOX

        ctx.beginPath()
        ctx.strokeStyle = 'red'
        ctx.rect(this.x, this.y, this.w, this.h)
        ctx.stroke()
        ctx.closePath()

        ctx.drawImage(this.image, this.x, this.y, this.w, this.h)
    }
}

let player1 = new Player("w", "a", "s", "d")
let player2 = new Player("ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight")

let enemies = []

for (let i = 0; i < numberOfEnemies; i++) {
    enemies.push(new Enemy())
    
}

// to make the game run at the same speed no matter refresh rate of display
const frames_per_second = 60

let interval = Math.floor(1000 / frames_per_second)
let startTime = performance.now()
let previousTime = startTime

let currentTime = 0
let deltaTime = 0

function animate(timestamp) {
    currentTime = timestamp;
    deltaTime = currentTime - previousTime;
  
    if (deltaTime > interval) {
        previousTime = currentTime - (deltaTime % interval);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    player1.draw('blue')
    player2.draw('green')

    enemies.forEach(enemy => {
        enemy.draw()
    });

    // when added player image draw with forEach

    levelLoader(activeLevel)    

    requestAnimationFrame(animate)
}
