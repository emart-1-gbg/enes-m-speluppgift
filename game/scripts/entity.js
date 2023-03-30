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

        this.isGrounded = true

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

        if (this.y + this.h < CANVAS_HEIGHT-45) {
            this.fallSpeed += this.fallAccel
            this.y += this.fallSpeed
        }

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

        // if (distance < 0 && 
        //     this.x > this.floor.x + this.floor.w) {
        //     this.x += this.speed
        // }
        // if (distance > 0 &&
        //     this.x < this.floor.x) {
        //     this.x -= this.speed
        // }

    }

    draw(){
        this.update()
        ctx.fillRect(this.x, this.y, this.w, this.h)
    }
}