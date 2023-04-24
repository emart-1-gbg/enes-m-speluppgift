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

    // walls

    if(level.hasOwnProperty("topBorder")) {
        tempDraw(level.topBorder.x, level.topBorder.y, level.topBorder.len, borderWidth)
    }

    if (level.hasOwnProperty("leftBorder")) {
        tempDraw(level.leftBorder.x, level.leftBorder.y, borderWidth, level.leftBorder.len)
    }

    if (level.hasOwnProperty("bottomBorder")) {
        tempDraw(level.bottomBorder.x, level.bottomBorder.y, level.bottomBorder.len, borderWidth)
    }

    if (level.hasOwnProperty("rightBorder")) {
        tempDraw(level.rightBorder.x, level.rightBorder.y, borderWidth, level.rightBorder.len)
    }

    // doorway

    if (level.hasOwnProperty("doorwayTop")) {
        tempDraw(level.doorwayTop.left.x, level.doorwayTop.left.y, borderWidth, level.doorwayTop.left.len)
        tempDraw(level.doorwayTop.right.x, level.doorwayTop.right.y, borderWidth, level.doorwayTop.right.len)
    }

    if (level.hasOwnProperty("doorwayLeft")) {
        tempDraw(level.doorwayLeft.top.x, level.doorwayLeft.top.y, level.doorwayLeft.top.len, borderWidth)
        tempDraw(level.doorwayLeft.bottom.x, level.doorwayLeft.bottom.y, level.doorwayLeft.bottom.len, borderWidth)
    }
    
    if (level.hasOwnProperty("doorwayBottom")) {
        tempDraw(level.doorwayBottom.left.x, level.doorwayBottom.left.y, borderWidth, level.doorwayBottom.left.len)
        tempDraw(level.doorwayBottom.right.x, level.doorwayBottom.right.y, borderWidth, level.doorwayBottom.right.len)
    }

    if (level.hasOwnProperty("doorwayRight")) {
        tempDraw(level.doorwayRight.top.x, level.doorwayRight.top.y, borderWidth, level.doorwayRight.top.len)
        tempDraw(level.doorwayRight.bottom.x, level.doorwayRight.bottom.y, borderWidth, level.doorwayRight.bottom.len)

        tempDraw(level.doorwayRight.topHall.x, level.doorwayRight.topHall.y, level.doorwayRight.topHall.len, borderWidth)
        tempDraw(level.doorwayRight.bottomHall.x, level.doorwayRight.bottomHall.y, level.doorwayRight.bottomHall.len, borderWidth)
    }

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

        // Math.floor(Math.random() * (max - min + 1) ) + min

        this.x = undefined
        this.y = undefined

        this.controls = new Controls(up, left, down, right)

        this.xSpeed = 0
        this.xAccel = 3

        this.ySpeed = 0
        this.yAccel = 2

        this.maxSpeed = 9
        this.friction = 1

        this.isGrounded = false
    }

    update(){
        
        //input movement

        let innerMapBorder = {
            top: activeLevel.topBorder?.y + borderWidth || 0,
            left: activeLevel.leftBorder?.x + borderWidth || 0,
            bottom: activeLevel.bottomBorder?.y || 0,
            right: activeLevel.rightBorder?.x || 0,

            doorwayRightTop: activeLevel.doorwayRight?.top.x || 0,
            doorwayRightBottom: activeLevel.doorwayRight?.bottom.x || 0,

            hall: undefined

            // 

        }

        if (this.x < 0 ||
            this.y < 0 ||
            this.x + this.w > CANVAS_WIDTH ||
            this.y + this.h > CANVAS_HEIGHT) {
            // console.log("player " + this.id + " is outside")
        } else {
            // console.log("player " + this.id + " is inside")
        }

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

class Enemy {
    constructor(){
        this.x
        this.y

        this.w = 40
        this.h = 50


    }
}

let player1 = new Player("w", "a", "s", "d")
let player2 = new Player("ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight")

function animate() {

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    player1.draw('blue')
    player2.draw('green')

    // when added player image draw with forEach

    levelLoader(activeLevel)

    requestAnimationFrame(animate)
}
