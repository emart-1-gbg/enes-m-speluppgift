/** @type {HTMLCanvasElement} **/

// Get information
const canvas = document.getElementById("mainCanvas")
const ctx = canvas.getContext("2d")

const menu = document.getElementById("menus")
const label = document.getElementById("label")

// Get overlay
const overlay = document.getElementById("overlay")
const player1Info = document.getElementById("playerInfo1")
const player2Info = document.getElementById("playerInfo2")
const player1Healthbar = document.getElementById("healthBar1")
const player2Healthbar = document.getElementById("healthBar2")


// Setting canvas and overlay size
const widthMultiplier = 0.98
const heightMultiplier = 0.86

canvas.width = window.innerWidth * widthMultiplier
canvas.height = window.innerHeight * heightMultiplier

overlay.style.width = canvas.width + "px" 
overlayDefaultWidth = overlay.style.width

// Set number of players information from HTML selector
let playerCount = null

const selector = document.getElementById("num-players")
playerCount = selector.value
console.log(playerCount, " player(s)")

// Updates player count and visualise to the user in the menu

selector.addEventListener("change", (e) => {
    playerCount = selector.value
    changeLabel()
    console.log(playerCount, " player(s)")
})

function changeLabel() {
    playerCount = selector.value
    label.textContent = `Number of Players: ${playerCount}` 
}

let numberOfEnemies = 2 // ----------------- NUMBER OF ENEMIES ----------------------

// Resets the canvas and overlay size when the browser is resized
window.addEventListener("resize", (e) => {
    canvas.width = window.innerWidth * widthMultiplier
    canvas.height = window.innerHeight * heightMultiplier

    overlay.style.width = canvas.width + "px"
    overlay.style.height *= heightMultiplier + "px"
})

// Loads menu as the page loads and when ESC is pressed
window.onload = function() {
    loadMenu()
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        location.reload()
    }
})

// RUNS ON LAUNCH
function loadMenu() {
    menu.style.display = "block"
    overlay.style.display = "flex"
    canvas.style.visibility = "hidden"
    overlay.style.visibility = "hidden"
    changeLabel()
    //loadGame() //auto run ------
}

// Button function
function loadGame() { 
    menu.style.display = "none"
    overlay.style.visibility = "visible"
    canvas.style.visibility = "visible"

    prepareLoad(levels[currentLevel])
    animate()
}

// For having different level designs with different spawn locations
let currentLevel = 0

const levels = [
    { // LEVEL 0
        spawn: {x: 100, y: 100}
    }
]
let activeLevel = levels[currentLevel]

// Set player location and number of players
function prepareLoad(level) {
    
    console.log(playerCount);

    playerCount = selector.value

    // Change inputs if needed here
    if (playerCount == 1) {
        new Player("KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft")
        console.log("1 player loaded")

        return

    } else if (playerCount == 2) {
        new Player("KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft")
        new Player("ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "ShiftRight")
        console.log("2 players loaded")
        player2Info.style.visibility = "visible"
        return

    } else {
        new Player("KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft")
        console.log("default load");
    }

    Player.instance.forEach(player => {
        let first = activeLevel.spawn
        player.X = first.x
        player.y = first.y

        first.x * 2
        first.y * 2
    });

}

class Controls{
    constructor(up, left, down, right, fire){
        this.up = false
        this.left = false
        this.down = false
        this.right = false
        this.fire = false

        this.#input(up, left, down, right, fire)
    }

    #input(up, left, down, right, fire){

        document.addEventListener('keydown', (event) => {
            switch (event.code) {

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
                
                case fire:
                    this.fire = true
                    break;
            }
            //console.table(this)
        })

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
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
                
                case fire:
                    this.fire = false
                    break;
            }
            //console.table(this)
        })
    }
}

class Projectile { 

    constructor(player, x, y, dx, dy){
        this.x = x
        this.y = y
        this.dx = dx
        this.dy = dy

        this.speed = 10

        this.w = 8
        this.h = this.w

        this.lastShootTime = 0
        this.fireDelay = 200
    }

    update(){
        this.x += this.dx * this.speed
        this.y += this.dy * this.speed
    }

    draw(){
        this.update()

        ctx.beginPath()
        ctx.rect(this.x, this.y, this.w, this.h)
        ctx.fill()
        ctx.closePath()
    }
}

class Player {

    static ID = 1
    static instance = []

    constructor(up, left, down, right, fire){

        this.id = Player.ID++
        Player.instance.push(this)

        this.w = 48
        this.h = 48

        this.x = 0
        this.y = 0

        this.weaponX = this.x + this.w
        this.weaponY = this.y + this.h / 2

        this.middlePos = {x: this.x + this.w / 2, y: this.y + this.h / 2}

        this.controls = new Controls(up, left, down, right, fire)

        this.xSpeed = 0
        this.xAccel = 2

        this.ySpeed = 0
        this.yAccel = 2

        this.maxSpeed = 9
        this.friction = 0.5

        this.health = 30

        this.bullets = []
        this.target = null

    }

    #setTarget(){

        // pushes the center position of players into the playerPositions array
        let enemyPositions = []
        enemies.forEach(enemy => {
            let x = enemy.x + enemy.w / 2
            let y = enemy.y + enemy.h / 2
            enemyPositions.push({x, y})
        })

        // pushes the distances to each player into the distances array
        let distances = []
        enemyPositions.forEach(pos => {
            let d = Math.hypot(pos.x - this.middlePos.x, pos.y - this.middlePos.y)
            distances.push(d)
        })
        
        // finds smallest value in an array
        //let smallestDistance = null
        let smallestDistance = distances.indexOf(Math.min(...distances))

        // both arrays have properties of players in the same order. the index of smallest distance has the same index as target in the arrays
        return enemyPositions[smallestDistance]
}

    #updatePos(){
        // this.weaponX = this.x + this.w
        // this.weaponY = this.y + this.h / 2

        this.target = this.#setTarget()
    }

    update(){

        this.#updatePos()
        
        //input movement

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

        /*
        let distanceToTarget = Math.sqrt((this.middlePos.x - this.targetPos.x) ** 2 + (this.middlePos.y - this.targetPos.y) ** 2);

        let dx = (this.targetPos.x - this.middlePos.x) / distanceToTarget * this.xSpeed
        let dy = (this.targetPos.y - this.middlePos.y) / distanceToTarget * this.ySpeed
        */

        //Find nearest target
        this.weaponX = this.x + this.w * (2/3)
        this.weaponY = this.y + this.h / 2

        let distanceToTarget
        let dx
        let dy

        Player.instance.forEach(player => {
            enemies.forEach(enemy => {
                distanceToTarget = Math.hypot(player.x - enemy.x, player.y - enemy.y)
                dx = (enemy.middlePos.x - this.weaponX) / distanceToTarget 
                dy = (enemy.middlePos.y - this.weaponY) / distanceToTarget 
            })
        })

        // Shoot update
        if (this.controls.fire) {
            this.bullets.push(new Projectile(this, this.weaponX, this.weaponY, dx, dy))
            console.log("FIRE");
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

        this.bullets.forEach(bullet => {
            bullet.draw()
        })
    }
}

// Math.random() * (max - min) + min

class Enemy {
    constructor(){
        this.x = Math.floor(Math.random() * canvas.width)
        this.y = Math.floor(Math.random() * canvas.height)

        // ADD LOGIC FOR SETTING SPAWN AT A DISTANCE FROM PLAYER--------------------------

        this.w = 32
        this.h = 32

        this.middlePos = {x: this.x + (this.w / 2), y: this.y + (this.h / 2)}

        this.image = new Image()
        this.image.src = './models/enemy.png'

        function randomSpeed(){
            return Math.random() * (7 - 5) + 5
        }
        // so speed is never 0
        this.xSpeed = 0
        while (this.xSpeed === 0) {
            this.xSpeed = randomSpeed()
        }

        this.ySpeed = 0
        while (this.ySpeed === 0) {
            this.ySpeed = randomSpeed()
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

        // pushes the center position of players into the playerPositions array
        let playerPositions = []
        Player.instance.forEach(player => {
            let x = player.x + player.w / 2
            let y = player.y + player.h / 2
            playerPositions.push({x, y, id: player.id})
        })

        // pushes the distances to each player into the distances array
        let distances = []
        playerPositions.forEach(pos => {
            let d = Math.hypot(pos.x - this.middlePos.x, pos.y - this.middlePos.y)
            distances.push(d)
        })
        
        // finds smallest value in an array
        let smallestDistance = null
        smallestDistance = distances.indexOf(Math.min(...distances))

        // both arrays have properties of players in the same order. the index of smallest distance has the same index as target in the arrays
        return playerPositions[smallestDistance]
}

    #updatePos(){
        this.middlePos = {x: this.x + (this.w / 2), y: this.y + (this.h / 2)}

        this.targetPos = this.#setTarget()
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

        // Move towards target player
        let distanceToTarget = Math.hypot(this.middlePos.x - this.targetPos.x, this.middlePos.y - this.targetPos.y)

        let dx = (this.targetPos.x - this.middlePos.x) / distanceToTarget 
        let dy = (this.targetPos.y - this.middlePos.y) / distanceToTarget

        // Only update if the new position does not pass the target, to stop jittering
        let newPosX = this.x + dx * this.xSpeed
        let newPosY = this.y + dy * this.ySpeed

        if (dx > 0) {
            if (newPosX <= this.targetPos.x) {
                this.x = Math.max(newPosX, 0)
            }
        }

        if (dx < 0) {
            if (newPosX >= this.targetPos.x) {
                this.x = newPosX
            }
        }

        if (dy > 0) {
            if (newPosY <= this.targetPos.y) {
                this.y = newPosY
            }
        }

        if (dy < 0) {
            if (newPosY >= this.targetPos.y) {
                this.y = Math.max(newPosY, 0)
            }
        }
}

    draw(){
        //this.update()

        // HITBOX
        // ctx.beginPath()
        // ctx.strokeStyle = 'red'
        // ctx.rect(this.x, this.y, this.w, this.h)
        // ctx.stroke()
        // ctx.closePath()

        ctx.drawImage(this.image, this.x, this.y, this.w, this.h)
    }
}

let enemies = []

for (let i = 0; i < numberOfEnemies; i++) {
    enemies.push(new Enemy())
    
}

// to make the game run at the same speed no matter refresh rate of display
const frames_per_second = 60

var interval = Math.floor(1000 / frames_per_second)
var startTime = performance.now()
var previousTime = startTime

var currentTime = 0
var deltaTime = 0

function animate(timestamp) {
    currentTime = timestamp;
    deltaTime = currentTime - previousTime;
  
    if (deltaTime > interval) {
        previousTime = currentTime - (deltaTime % interval);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)


    Player.instance.forEach(player => {
        player.draw("red")
    });

    enemies.forEach(enemy => {
        enemy.draw()
    });

    requestAnimationFrame(animate)
}
