class Controls {
    constructor(){
        this.left = false
        this.right = false
        this.jump = false

        this.#input()
    }

    #input(){
        document.onkeydown=(event)=>{
            switch (event.key) {
                case "a":
                    this.left = true
                    break;
                
                case "d":
                    this.right = true
                    break;

                case "w":
                    this.jump = true
                    break;
            }
            //console.table(this)
        }

        document.onkeyup=(event)=>{
            switch (event.key) {
                case "a":
                    this.left = false
                    break;
                
                case "d":
                    this.right = false
                    break;
            }
            //console.table(this)
        }
    }
}