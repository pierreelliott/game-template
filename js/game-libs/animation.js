export class Animation {
    constructor(parent, name, action, options) {
        if(!parent || !name || name === "" || !action) {
            throw "Erreur initialisation Animation\nParams : " + name + action + options;
        }
        this.name = name;
        this.action = action;
        this.options = options;
        this.noMove;
        if(options) {
            if(options.duration) {
                this.action.setDuration(options.duration);
            }
            if(options.loop || options.repetitions) {
                let loop = (typeof options.loop === 'number') ? options.loop : THREE.LoopRepeat;
                let repetitions = (typeof options.repetitions === 'number') ? options.repetitions : Infinity;
                this.action.setLoop(loop, repetitions);
            }
            if(options.clampWhenFinished) {
                this.action.clampWhenFinished = options.clampWhenFinished;
            }
            if(options.noMove) {
                this.noMove = options.noMove;
            }
        }
        this.parent = parent;
        this._optionMoved = false;
    }

    play() {
        if(this.parent && this.options) {
            if(this.options.move) {
                console.log("Moved parent");
                this.parent.move(this.options.move.start);
                this._optionMoved = true;
            }
        }
        this.action.play();
    }

    stop() {
        if(this._optionMoved) {
            console.log("Moved parent back to initial");
            this.parent.move(this.options.move.finish);
            this._optionMoved = false;
        }
        this.action.stop();
    }

    reset() {
        this.action.reset();
    }

    // TODO Ajouter les autres fonctions de AnimationAction
}
