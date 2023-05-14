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

const widthMultiplier = 0.98
const heightMultiplier = 0.85

canvas.width = window.innerWidth * widthMultiplier
canvas.height = window.innerHeight * heightMultiplier
overlay.style.width = canvas.width + "px" 

button.addEventListener("click", function(){
    console.log(`start game with ${selector.value} players`)
    hideMenus()
    loadGame()
})

function loadGame() {
    canvas.style.display = "block"
    overlay.style.display = "flex"
    main()
}

function hideMenus() {
    menu.style.display = "none"
}

selector.addEventListener("change", (e) => {
    label.textContent = selector.value
})

function main() {

    // Get information
    const ctx = canvas.getContext("2d")

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

    class Projectile{
        constructor(game, x, y, dx, dy){
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

            // 1 to 4
            this.state = 2

            this.spriteW = 128
            this.spriteH = 148

            this.spriteX = this.spriteW * this.state - this.spriteW
            this.spriteY = 0

            const scale = 0.6

            this.w = this.spriteW * scale
            this.h =this.spriteH * scale
            this.x = 200
            this.y = 200
            this.spriteTime = performance.now()
            this.spriteTimer = 1600

            this.middleX = this.x + this.w /2
            this.middleY = this.y + this.h /2

            this.weaponX = this.x + this.w
            this.weaponY = this.y + this.h / 3

            this.xSpeed = 0
            this.xAccel = 0.5
            this.ySpeed = 0
            this.yAccel = 0.5

            this.maxSpeed = 6
            this.friction = 0.5

            this.bullets = []
            this.fireDelay = 500
            this.lastShotTime = 0
            
            this.image = new Image()
            this.image.src = img

        }

        #updateState(){
            if (!this.controls.fire) {
                this.state = 1
            } else {
                this.state = 2
            }

            const inputs = Object.values(this.controls).some(value => value === true)

            if (inputs) {
                this.spriteTime = performance.now()
            }

            let currentTime = performance.now()
            if (currentTime - this.spriteTime > this.spriteTimer) {
                this.state = 3
            }

            this.spriteX = this.spriteW * this.state - this.spriteW
        }

        #shoot() {
            this.weaponX = this.x + this.w
            this.weaponY = this.y + this.h / 3
        
            let nearestEnemy = null
            let smallestDistance = Infinity
        
            game.enemies.forEach(enemy => {
                let distance = findDistance(this.weaponX, this.weaponY, enemy.middleX, enemy.middleY)
                if (distance < smallestDistance) {
                    smallestDistance = distance
                    nearestEnemy = enemy
                }
            })
        
            if (nearestEnemy) {
                let dx = (nearestEnemy.middleX - this.weaponX) / smallestDistance
                let dy = (nearestEnemy.middleY - this.weaponY) / smallestDistance
        
                this.bullets.push(new Projectile(game, this.weaponX, this.weaponY, dx, dy))
            }
        }

        update(){
        
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

            // shooting
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

            // hitbox
            // context.rect(this.x, this.y, this.w, this.h)
            // context.stroke()

            this.bullets.forEach(bullet => {
                bullet.draw(context)
            })
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
            this.xSpeed = Math.random() * (6 - 3) + 3
            this.ySpeed = Math.random() * (6 - 3) + 3

            this.dx
            this.dy

            this.image = new Image()
            this.image.src = './models/enemy.png'

            this.spawnDistanceToPlayer = 300

            this.middleX = this.x + this.w /2
            this.middleY = this.y + this.h /2

            this.distancesToPlayers = []

            this.healthbarX = this.x 
            this.healthbarY = this.y - 10
            this.healthbarW = this.w
            this.healthbarH = 5
            this.healhbarOutlineW = this.healthbarW

            this.hitPoints = 5
            this.alive = true

            this.healthIterval = this.healthbarW / this.hitPoints
        }

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

            console.log(this.healthbarW);

        }

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

            this.hitPoints === 0 ? this.alive = false : null

        }

        draw(context){
            context.drawImage(this.image, this.x, this.y, this.w, this.h)

            context.beginPath()
            context.fillStyle = "red"
            context.globalAlpha = 0.7
            context.rect(this.healthbarX, this.healthbarY, this.healthbarW, this.healthbarH)
            context.fill()

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
            this.numberOfEnemies = 10

            this.players = []
            this.enemies = []

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
            this.players.forEach(player => {
                player.update()
            })

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
            this.players.forEach(player => {
                player.draw(context)
            })

            this.enemies.forEach(enemy => {
                enemy.draw(context)
            })
        }
    }

    const game = new Game(canvas.width, canvas.height)

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
        game.update()
        game.draw(ctx)

        requestAnimationFrame(animate)
    }
    animate()
}