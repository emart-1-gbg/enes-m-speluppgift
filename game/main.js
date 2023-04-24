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

class Controls {
    constructor(){
        this.up = false
        this.left = false
        this.down = false
        this.right = false

        this.#input()
    }

    #input(){
        document.onkeydown=(event)=>{
            switch (event.key) {

                case "w":
                    this.up = true
                    break;
                
                case "a":
                    this.left = true
                    break;

                case "s":
                    this.down = true
                    break;
                
                case "d":
                    this.right = true
                    break;
            }
            //console.table(this)
        }

        document.onkeyup=(event)=>{
            switch (event.key) {
                case "w":
                    this.up = false
                    break;
                
                case "a":
                    this.left = false
                    break;

                case "s":
                    this.down = false
                    break;
                
                case "d":
                    this.right = false
                    break;
            }
            //console.table(this)
        }
    }
}


class Player {

    static ID = 0
    static instance = []

    constructor() {
        this.x = 100
        this.y = 100
        this.w = 65
        this.h = 90

        this.controls = new Controls()
        this.speed = 0
        this.accel = 2
        this.maxSpeed = 12
        this.friction = 0.5

        this.fallAccel = 1
        this.fallSpeed = 0

        this.jumpForce = 18
        this.gravity = 0.8

        this.isGrounded = false

        this.id = Player.ID++
        Player.instance.push(this)
    }

    update(){ // add "l" & "r" to pram for multiple player

        if (this.controls.left) {
            this.speed -= this.accel
        }

        if (this.controls.right) {
            this.speed += this.accel
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed
        }

        if (this.speed < -this.maxSpeed) {
            this.speed = -this.maxSpeed
        }

        if (this.speed > 0) {
            this.speed -= this.friction
        }

        if (this.speed < 0) {
            this.speed += this.friction
        }

        // canvas border
        if (this.x > 0) {
            if (this.x + this.w < CANVAS_WIDTH) {
                this.x += this.speed
            } 
            else {this.x -= 2}
        } 
        else {this.x += 2}
        
        if (this.controls.jump && this.isGrounded) {

            for (let i = 0; i < 10; i++) {
                this.y -= this.jumpForce*3
            }
            this.controls.jump = false
        } 

        // gravity
        if (!this.isGrounded) {
            this.fallSpeed += this.fallAccel
            this.y += this.fallSpeed
        }

        // ground detection
        map.forEach(floor => {
            let min = floor.x
            let max = floor.x + floor.w
            let y = floor.y

            if (this.x < max &&
                this.x + this.w > min && 
                this.y + this.h > y) 
            {
                this.isGrounded = true
            } 
            else if (this.x > max &&
                    this.x + this.w > min &&
                    this.y + this.h > y)
            {
            this.fallSpeed = 0
            this.isGrounded = false    
            }
        });
    }

    draw(){
        this.update()
        ctx.fillRect(this.x, this.y, this.w, this.h)
    }
}

// 6:06:00 https://www.freepik.com/free-vector/animation-sprite-sheet-bomb-explosion-sequence_29084609.htm#query=2d%20sprites&position=2&from_view=search&track=ais


class Enemy {
    constructor(){

        this.x
        this.y
        this.w = 50
        this.h = 100

        this.speed = Math.floor(Math.random() * (3 - 2 + 1) + 2)

        let yRandomiser = Math.floor(Math.random() * (map.length + 1))
        this.floor = map[yRandomiser]

        // Math.floor(Math.random() * (max - min + 1) ) + min

        if (yRandomiser != 4) {
            this.x = Math.floor(Math.random() * ((this.floor.x + this.floor.w - this.w) - this.floor.x + 1)) + this.floor.x
            this.y = this.floor.y - this.h
        } 
        else {
            this.x = Math.floor(Math.random() * CANVAS_WIDTH)
            this.y = platformY - this.h
        }

        console.table(this.x, this.y, yRandomiser)

    }

    update (){
        //this.x += this.speed
        let distance
        Player.instance.forEach(player => {
            distance = this.x - player.x
        });

    }

    draw(){
        this.update()
        ctx.fillRect(this.x, this.y, this.w, this.h)
    }
}

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
