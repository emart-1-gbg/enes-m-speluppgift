/** @type {HTMLCanvasElement} **/

// get data
// canvas
const canvas = document.getElementById("mainCanvas")
// main menu
const menu = document.getElementById("menus")
const button =  document.getElementById("start-button")
// player selector
const selector = document.getElementById("num-players")
const label = document.getElementById("nOfPlayers")
// game overlay
const overlay = document.getElementById("overlay")
// defauly value for player selector
selector.value = 1
label.textContent = selector.value
//sounds 
const backgroundMusic = new Audio("./audio/background.mp3")
const weaponSound = new Audio("./audio/shoot.mp3")
backgroundMusic.volume = 0.1
weaponSound.volume = 0.1

const widthMultiplier = 0.98
const heightMultiplier = 0.855

canvas.width = window.innerWidth * widthMultiplier
canvas.height = window.innerHeight * heightMultiplier
overlay.style.width = canvas.width + "px" 

// hide menu and show canvas when start button is pressed
button.addEventListener("click", function(){
    console.log(`start game with ${selector.value} players`)
    hideMenus()
    loadGame()
})

function loadGame() {
    canvas.style.display = "block"
    overlay.style.display = "flex"
    if (selector.value === 2) { // doesnt work
        document.getElementById("playerInfo2").style.visibility = "visible"
    }
    main()
}

function hideMenus() {
    menu.style.display = "none"
}

// updates the label when selector value is changed
selector.addEventListener("change", (e) => {
    label.textContent = selector.value
})

// main game, runs when button is pressed and menus are hidden
function main() {

    backgroundMusic.play()

    // Get information
    const ctx = canvas.getContext("2d")

    // resize game when browser is resized
    window.addEventListener("resize", function () {
        canvas.width = window.innerWidth * widthMultiplier
        canvas.height = window.innerHeight * heightMultiplier    

        overlay.style.width = canvas.width + "px" 
    })

    function findDistance(x1, y1, x2, y2) {
        let distanceX = x1 - x2
        let distanceY = y1 - y2
        let distance = Math.hypot(distanceX, distanceY)
        return distance
    }

    // inputs, arguments passed in when defining players in game class
    class InputHandler{
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

    // bullets
    class Projectile{
        constructor(game, x, y, dx, dy){ // dx & dy vectors calculated and passed in from player class
            this.game = game
            this.x = x
            this.y = y

            // direction
            this.dx = dx
            this.dy = dy

            this.r = 3 

            this.speed = 10

            this.active = true
        }

        update(){
            this.x += this.dx * this.speed
            this.y += this.dy * this.speed

            if (this.x > game.width ||
                this.x + this.w < 0 ||
                this.y + this.h < 0 ||
                this.y > game.height) {
                this.active = false
            }
        }

        draw(context){
            context.fillStyle = "greenyellow"
            context.beginPath()
            context.arc(this.x, this.y, this.r, 0, Math.PI * 2)
            context.fill()
        }
    }

    class Player{
        constructor(game, up, left, down, right, fire, img){
            this.game = game
            this.controls = new InputHandler(up, left, down, right, fire)

            // 1 to 4 1: idle, 2: shoot, 3: sit, 4: powerup (didnt have time)
            this.state = 1

            // cutout size and coordinates from player sprite
            this.spriteW = 128
            this.spriteH = 148

            this.spriteX = this.spriteW * this.state - this.spriteW
            this.spriteY = 0

            const scale = 0.6

            this.w = this.spriteW * scale
            this.h =this.spriteH * scale
            this.x = 200
            this.y = 200
            // timer for sitting 
            this.spriteTime = performance.now()
            this.spriteTimer = 1600

            // where enemies target
            this.middleX = this.x + this.w /2
            this.middleY = this.y + this.h /2

            // where bullets spawn
            this.weaponX = this.x + this.w
            this.weaponY = this.y + this.h / 3

            // healthbar
            this.healthbarX = this.x 
            this.healthbarY = this.y - 10
            this.healthbarW = this.w * (2/3) // also health
            this.healthbarH = 5
            this.healhbarOutlineW = this.healthbarW

            this.hitPoints = 1000
            this.healthIterval = this.healthbarW / this.hitPoints

            this.xSpeed = 0
            this.xAccel = 0.5
            this.ySpeed = 0
            this.yAccel = 0.5

            this.maxSpeed = 6
            this.friction = 0.5 // slow down gradually 

            this.bullets = []
            this.fireDelay = 500 // delay for fire rate
            this.lastShotTime = 0
            
            this.image = new Image()
            this.image.src = img

        }

        // sets the correct coordinates for player image
        #updateState(){
            if (!this.controls.fire) {
                this.state = 1
            } else {
                this.state = 2
            }

            // checks for any input and resets timer for sitting state
            const inputs = Object.values(this.controls).some(value => value === true)
            if (inputs) {
                this.spriteTime = performance.now()
            }

            // if enough time has passed sets the state to sit
            let currentTime = performance.now()
            if (currentTime - this.spriteTime > this.spriteTimer) {
                this.state = 3
            }

            // update coordinates
            this.spriteX = this.spriteW * this.state - this.spriteW
        }

        #shoot() {
            // update coordinates
            this.weaponX = this.x + this.w
            this.weaponY = this.y + this.h / 3
        
            // finds closest target
            let nearestEnemy = null
            let smallestDistance = Infinity
        
            game.enemies.forEach(enemy => {
                let distance = findDistance(this.weaponX, this.weaponY, enemy.middleX, enemy.middleY) // pythagoras sats
                if (distance < smallestDistance) {
                    smallestDistance = distance
                    nearestEnemy = enemy
                }
            })
        
            // calculates vectors for target (dx, dy)
            if (nearestEnemy) {
                let dx = (nearestEnemy.middleX - this.weaponX) / smallestDistance
                let dy = (nearestEnemy.middleY - this.weaponY) / smallestDistance
        
                this.bullets.push(new Projectile(game, this.weaponX, this.weaponY, dx, dy))
            }

        }

        #recieveDamage(){
            this.hitPoints--
            this.healthbarW = this.healthIterval * this.hitPoints
        }

        #checkForDamage(){
            // check for collision and reduce health
            game.enemies.forEach(enemy => {
                if (enemy.x < this.x + this.w &&
                    enemy.x + enemy.w > this.x &&
                    enemy.y < this.y + this.h &&
                    enemy.y + enemy.h > this.y) {
                        this.#recieveDamage()
                        return
                }
            });
        }

        update(){
            this.#checkForDamage()
            this.#updateState()

            // update speed
            if (this.controls.down) {
                this.ySpeed += this.yAccel
            }

            if (this.controls.right) {
                this.xSpeed += this.xAccel
            }

            if (this.controls.up) {
                this.ySpeed -= this.yAccel
            } 

            if (this.controls.left) {
                this.xSpeed -= this.xAccel
            }

            // slow down
            if (this.ySpeed < 0 && !this.controls.up) {
                this.ySpeed += this.friction
            }

            if (this.ySpeed > 0 && !this.controls.down) {
                this.ySpeed -= this.friction
            }

            if (this.xSpeed < 0 && !this.controls.left) {
                this.xSpeed += this.friction
            }

            if (this.xSpeed > 0 && !this.controls.right) {
                this.xSpeed -= this.friction
            }

            // limit speed
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

            // update position if not outside border
            
            let newX = this.x + this.xSpeed
            let newY = this.y + this.ySpeed

            if (newX < 0) {
                this.xSpeed = 0
                this.x = 0
            } else {
                this.x += this.xSpeed
            }

            if (newX + this.w > game.width) {
                this.xSpeed = 0
                this.x = game.width - this.w
            } else {
                this.x += this.xSpeed
            }

            if (newY < 0) {
                this.ySpeed = 0
                this.y = 0
            } else {
                this.y += this.ySpeed
            }

            if (newY + this.h > game.height) {
                this.ySpeed = 0
                this.y = game.height - this.h
            } else {
                this.y += this.ySpeed
            }

            // shoot if delay has passed
            let currentShotTime
            let deltaTime
            if (this.controls.fire) {
                currentShotTime = performance.now()
                deltaTime = currentShotTime - this.lastShotTime
            }

            if (deltaTime > this.fireDelay) {
                this.lastShotTime = currentShotTime
                this.#shoot()
            }
        
            this.middleX = this.x + this.w /4
            this.middleY = this.y + this.h /2

            this.healthbarX = this.x 
            this.healthbarY = this.y - 10

            // updates bullet if its not active. active == false when out of border or collides 
            for (let i = 0; i < this.bullets.length; i++) {
                let bullet = this.bullets[i]
                if (!bullet.active) {
                    this.bullets.splice(i, 1)
                    break
                }
                bullet.update()
            }
        }

        draw(context){
            context.beginPath()
            context.drawImage(this.image, this.spriteX, this.spriteY, this.spriteW, this.spriteH, this.x, this.y, this.w, this.h)

            // hitbox (hitbox is too big)
            // context.rect(this.x, this.y, this.w, this.h)
            // context.stroke()

            this.bullets.forEach(bullet => {
                bullet.draw(context)
                weaponSound.play()
            })

            // healthbar outline
            context.beginPath()
            context.fillStyle = "green"
            context.globalAlpha = 0.7
            context.rect(this.healthbarX, this.healthbarY, this.healthbarW, this.healthbarH)
            context.fill()

            //healthbar
            context.globalAlpha = 1
            context.rect(this.healthbarX, this.healthbarY, this.healhbarOutlineW, this.healthbarH)
            context.stroke()
        }
    }

    class Enemy{
        constructor(game){

            this.game = game

            this.w = 32
            this.h = this.w

            this.x = Math.random() * game.width - this.w
            this.y = Math.random() * game.height - this.h

            // Math.random() * (max - min) + min
            this.xSpeed = Math.random() * (9.5 - 6) + 6
            this.ySpeed = Math.random() * (9.5 - 6) + 6

            this.dx
            this.dy

            this.image = new Image()
            this.image.src = './models/enemy.png'

            // minimum distance to player when spawning
            this.spawnDistanceToPlayer = 500

            // center coordinates 
            this.middleX = this.x + this.w /2
            this.middleY = this.y + this.h /2

            this.distancesToPlayers = []

            this.healthbarX = this.x 
            this.healthbarY = this.y - 10
            this.healthbarW = this.w
            this.healthbarH = 5
            this.healhbarOutlineW = this.healthbarW

            this.hitPoints = 3
            this.alive = true

            this.healthIterval = this.healthbarW / this.hitPoints
        }

        // finds nearest player and sets dx dy vectors
        #setTarget(){
            let nearestPlayer = null;
            let smallestDistance = Infinity;

            game.players.forEach(player => {
                let distance = findDistance(this.middleX, this.middleY, player.middleX, player.middleY);
                if (distance < smallestDistance) {
                smallestDistance = distance;
                nearestPlayer = player;
                }
            });

            if (nearestPlayer) {
                this.dx = (nearestPlayer.middleX - this.middleX) / smallestDistance;
                this.dy = (nearestPlayer.middleY - this.middleY) / smallestDistance;
            }
        }

        #recieveDamage(){
            this.hitPoints--
            this.healthbarW = this.healthIterval * this.hitPoints
        }

        // checks if bullet hit
        #checkForHits(){
            game.players.forEach(player => {
                player.bullets.forEach(bullet => {

                    if (bullet.x - bullet.r < this.x + this.w &&
                        bullet.x + bullet.r > this.x &&
                        bullet.y - bullet.r < this.y + this.h &&
                        bullet.y + bullet.r > this.y) {
                        bullet.active = false
                        this.#recieveDamage()
                    }
                })
            })
        }

        update(){
            this.middleX = this.x + this.w /2
            this.middleY = this.y + this.h /2
            this.#checkForHits()
            this.#setTarget()
        
            this.x += this.dx * this.xSpeed
            this.y += this.dy * this.ySpeed

            this.healthbarX = this.x 
            this.healthbarY = this.y - 10

            // checks if health is 0, if yes sets this.alive to false
            this.hitPoints === 0 ? this.alive = false : null

        }

        draw(context){
            context.drawImage(this.image, this.x, this.y, this.w, this.h)

            // healthbar outline
            context.beginPath()
            context.fillStyle = "red"
            context.globalAlpha = 0.7
            context.rect(this.healthbarX, this.healthbarY, this.healthbarW, this.healthbarH)
            context.fill()
            
            // healthbar
            context.globalAlpha = 1
            context.rect(this.healthbarX, this.healthbarY, this.healhbarOutlineW, this.healthbarH)
            context.stroke()
        }
    }

    class Game{
        constructor(width, height){
            this.width = width
            this.height = height

            this.playerCount = selector.value
            this.numberOfEnemies = 50

            this.players = []
            this.enemies = []

            this.over = false
            this.win = false

            this.init()
        }

        init(){
            // define players
            this.players.push(new Player(this, "KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft",
            "./models/player-models/orange.png"))

            if (this.playerCount == 2) {
                this.players.push(new Player(this, "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "ShiftRight",
                "./models/player-models/blue.png"))
            }

            // define enemies
            // checks if random coordinates too close to player. if not pushes enemy to enemies array
            let attempts = 0
            while (this.enemies.length < this.numberOfEnemies && attempts < 500) {
                let tester = new Enemy(this)
                let invalid = false
                this.players.forEach(player => {

                    let distance = findDistance(tester.x, tester.y, player.x, player.y)

                    if (distance < tester.spawnDistanceToPlayer ||
                        tester.x < 0 || tester.y < 0) {
                        invalid = true
                    }
                })
                if (!invalid) {
                    this.enemies.push(tester)
                }
                attempts++
            }
        }

        update(){
            // checks if player has health, if yes updates player, if not game is over
            this.players.forEach(player => {
                if (player.healthbarW > 0) {
                    player.update()
                } else {
                    game.over = true
                }
            })

            // checks if there is enemy alive, if not win
            if (this.enemies.length === 0) {
                this.win = true
            }

            // checks if enemy is alive, if not removes from array
            for (let i = 0; i < this.enemies.length; i++) {
                const enemy = this.enemies[i];
                if (!enemy.alive) {
                    this.enemies.splice(i, 1)
                    break
                }
                enemy.update()
            }
        }

        draw(context){
            context.font = "200px serif"
            if (!this.over) {
                this.players.forEach(player => {
                    player.draw(context)
                })
    
                this.enemies.forEach(enemy => {
                    enemy.draw(context)
                })
            } else {
                context.fillText("Game Over", (this.width / 4), this.height / 2)
                backgroundMusic.pause()
            }

            if(this.win){
                context.fillText("You Won!", (this.width / 4), this.height / 2)
                backgroundMusic.pause()
            }   
        }
    }

    const game = new Game(canvas.width, canvas.height)

    // to make the game run at the same speed no matter refresh rate of display
    const frames_per_second = 60

    var interval = 1000 / frames_per_second
    var startTime = performance.now()
    var previousTime = startTime

    // main animation loop
    function animate(timestamp) {
        var currentTime = timestamp;
        var deltaTime = currentTime - previousTime;
  
        if (deltaTime > interval) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            game.update()
            game.draw(ctx)
        }
    
        previousTime = currentTime - (deltaTime % interval);

        requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)

    window.addEventListener("keydown", (e)=>{
        if (e.key === "Escape") {
            location.reload()
        }
    })
}