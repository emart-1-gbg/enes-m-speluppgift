/** @type {HTMLCanvasElement} **/

const canvas = document.getElementById("mainCanvas")
const ctx = canvas.getContext("2d")
const CANVAS_WIDTH = canvas.width = 1920 
const CANVAS_HEIGHT = canvas.height = 1080

const menu = document.getElementById("menus")

let numberOfEnemies = 10

let playerCount = 1

window.onload = function() {
    loadMenu()
}

function loadMenu() {
    menu.style.display = "block"
    // auto run ------
    loadGame()
}

function loadGame() {
    menu.style.display = "none"

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

function tempDraw(x, y, w, h) {
    ctx.beginPath()
    ctx.strokeStyle = 'orange'
    ctx.lineWidth = 5
    ctx.rect(x, y, w, h)
    ctx.stroke()
    ctx.closePath()
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

const playerWidth = 40
const playerHeight = 55

class Player {

    static ID = 1
    static instance = []

    constructor(up, left, down, right){

        this.id = Player.ID++
        Player.instance.push(this)


        this.w = playerWidth
        this.h = playerHeight

        this.x = null
        this.y = null

        this.controls = new Controls(up, left, down, right)

        this.xSpeed = 0
        this.xAccel = 2

        this.ySpeed = 0
        this.yAccel = 2

        this.maxSpeed = 9
        this.friction = 0.5

        this.isGrounded = false
    }

    update(){
        
        //input movement

        // if (this.x < 0 ||
        //     this.y < 0 ||
        //     this.x + this.w > CANVAS_WIDTH ||
        //     this.y + this.h > CANVAS_HEIGHT) {
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

        if (this.x + this.w >= CANVAS_WIDTH) {
            this.x = CANVAS_WIDTH - this.w
            this.xSpeed = 0
        }

        if (this.y <= 0) {
            this.y = 0
            this.ySpeed = 0
        }

        if (this.y + this.h > CANVAS_HEIGHT) {
            this.y = CANVAS_HEIGHT - this.h
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
        this.x = Math.floor(Math.random() * CANVAS_WIDTH + 1)
        this.y = Math.floor(Math.random() * CANVAS_HEIGHT + 1)

        this.w = 40
        this.h = 45

        // so speed is never 0
        this.xSpeed = 0
        while (this.xSpeed === 0) {
            this.xSpeed = Math.floor(Math.random() * (6 - 4 + 1)) + 4
        }

        this.ySpeed = 0
        while (this.ySpeed === 0) {
            this.ySpeed = Math.floor(Math.random() * (6 - 4 + 1)) + 4
        }

        this.targetPlayer = this.#setTarget()
    }

    #setTarget(){
        let player1Pos = {x: player1.x + player1.w / 2, y: player1.y + player1.h / 2}
        let player2Pos = {x: player2.x + player2.w / 2, y: player2.y + player2.h / 2}
        let thisPos = {x: this.x + this.w / 2, y: this.y + this.h / 2}

        let d1 = (player1Pos.x - thisPos.x) ** 2 + (player1Pos.y - thisPos.y) ** 2
        let d2 = (player2Pos.x - thisPos.x) ** 2 + (player2Pos.y - thisPos.y) ** 2

        return d1 < d2 ? player1 : player2
    }

    update(){

        this.targetPlayer = this.#setTarget()
        // Move towards target player
        let distanceToTarget = Math.sqrt((this.x - this.targetPlayer.x) ** 2 + (this.y - this.targetPlayer.y) ** 2)

        const dx = (this.targetPlayer.x - this.x) / distanceToTarget * this.xSpeed
        const dy = (this.targetPlayer.y - this.y) / distanceToTarget * this.ySpeed;
        this.x += dx;
        this.y += dy;

        // boundary checks
        if (this.x <= 0) {
            console.table(this.x, this.y)

            this.x = 0
        }

        if (this.x + this.w >= CANVAS_WIDTH) {
            console.table(this.x, this.y)

            this.x = CANVAS_WIDTH - this.w
        }

        if (this.y <= 0) {
            console.table(this.x, this.y)

            this.y = 0
        }

        if (this.y + this.h >= CANVAS_HEIGHT) {
            console.table(this.x, this.y)
            this.y = CANVAS_HEIGHT - this.h
        }
    }

    draw(){
        this.update()

        ctx.beginPath()
        ctx.fillStyle = 'red'
        ctx.rect(this.x, this.y, this.w, this.h)
        ctx.fill()
        ctx.closePath()
    }
}

let player1 = new Player("w", "a", "s", "d")
let player2 = new Player("ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight")

let enemies = []

for (let i = 0; i < numberOfEnemies; i++) {
    enemies.push(new Enemy())
    
}

function animate() {

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    player1.draw('blue')
    player2.draw('green')

    enemies.forEach(enemy => {
        enemy.draw()
    });

    // when added player image draw with forEach

    levelLoader(activeLevel)    

    requestAnimationFrame(animate)
}
