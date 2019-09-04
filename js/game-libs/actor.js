import {Object} from "./object";

export class Actor extends Object{
    constructor(mesh) {
        super(mesh);
        this.animations = {};
        this.target;
        this.initialPosition;
        this.mixer;
        this.animating = false; // Animation autre que 'idle'
        this.movingVector = undefined;
    }

    stepForward(magnitude) {
        if(!this.animating) {
            this.animating = true;
            this.movingVector = this.createMovingVector(magnitude, FRONT);
            this._animate("walk_forward", {duration: 0.5});
        }
    }

    stepBackward(magnitude) {
        if(!this.animating) {
            this.animating = true;
            this.movingVector = this.createMovingVector(-magnitude, FRONT);
            this._animate("walk_backward", {duration: 0.5});
        }
    }

    uTurn() {
        if(!this.animating) {
            this.animating = true;
            this._animate("u_turn", {duration: 0.5});
        }
    }

    simpleHit() {
        if(!this.animating) {
            this.animating = true;
            this._animate("boxing").then(() => {
                this.animation[ "boxing" ].stop();
            })
        }
    }

    _animate(animationName, options) {
        return new Promise((resolve, reject) => {
            this.stopAnimations(true); // Doit toujours être fait AVANT de mettre this.animating à true
            this.animating = true;
            this.startAnimation(animationName, options).then(() => {
                this.animating = false;
                this.movingVector = undefined;
                this.idle();
                resolve();
            }, () => { reject(); });
        });
    }

    createMovingVector(magnitude, direction) {
        // TODO Calculer le vecteur en fonction de la direction du regard
        switch(direction) {
            case FRONT:
                return {x: magnitude};
                break;
            case SIDE:
                break;
        }
    }

    idle(options) {
        // FIXME > Attention, avec le callback de startAnimation ça peut peut-être poser des problèmes
        if(!this.animating || (options && options.force)) {
            if(options && options.stopAll) {
                this.stopAnimations(true);
            }

            let idle = this.animations[ "idle" ];
            idle.play();
        }
    }

    addAnimation(animation) {
        if(!animation || animation === "" || !animation.name || animation.name === "") {
            return false;
        }

        this.animations[ animation.name ] = animation;
    }

    update(clockDelta) {
        this.mesh.mixer.update( clockDelta );
        // this.updateTargetWatch();

        if(this.movingVector) {
            this.move(this.movingVector);
        }
    }

    updateTargetWatch() {
        if(this.target) {
            if(this.target instanceof THREE.Scene) {
                this.mesh.lookAt(this.target.position);
            } else {
                this.mesh.lookAt(this.target.mesh.position);
            }
        }
    }

    lookAt(object) {
        if(object) {
            this.target = object;
        } else {
            this.target = undefined;
        }
    }

    startAnimation(animation, options) {
        return new Promise((resolve, reject) => {
            if(typeof animation === "string") {
                let action = this.animations[ animation ];

                if(action.noMove) {
                    this.movingVector = undefined;
                }

                // action.setLoop((typeof options.loop === 'number') ? options.loop : action.loop, (typeof options.repetitions === 'number') ? options.repetitions : action.repetitions);
                // action.setDuration( (typeof options.duration === 'number') ? options.duration : action.duration );
                action.play();
                console.log("Animation '" + animation + "' started");

                var listener = (e) => {
                    console.log("Animation '" + animation + "' finished");
                    e.action.reset();
                    this.mesh.mixer.removeEventListener('finished', listener, false);
                    resolve();
                };
                this.mesh.mixer.addEventListener('finished', listener, false);
            } else {
                reject();
            }
        });
    }

    stopAnimations(force) {
        // this.mixer.stopAllAction();
        // console.warn(this.animations);
        for (var property in this.animations) {
            if (this.animations.hasOwnProperty(property)) {
                let action = this.animations[ property ];
                action.reset();
            }
        }
        this.animating = false;
    }

    move(parameters) {
        parameters.x = (typeof parameters.x === 'number') ? parameters.x : 0;
        parameters.y = (typeof parameters.y === 'number') ? parameters.y : 0;
        parameters.z = (typeof parameters.z === 'number') ? parameters.z : 0;

        let param = {
            x: this.mesh.position.x + parameters.x,
            y: this.mesh.position.y + parameters.y,
            z: this.mesh.position.z + parameters.z
        };
        this.mesh.position.set(param.x, param.y, param.z);
    }
    scale(parameters) {
        let param = {
            x: (typeof parameters.x === 'number') ? parameters.x : this.mesh.scale.x,
            y: (typeof parameters.y === 'number') ? parameters.y : this.mesh.scale.y,
            z: (typeof parameters.z === 'number') ? parameters.z : this.mesh.scale.z
        };

        this.mesh.scale.set(param.x, param.y, param.z);
    }
    position(parameters) {
        let param = {
            x: (typeof parameters.x === 'number') ? parameters.x : this.mesh.position.x,
            y: (typeof parameters.y === 'number') ? parameters.y : this.mesh.position.y,
            z: (typeof parameters.z === 'number') ? parameters.z : this.mesh.position.z
        };

        this.mesh.position.set(param.x, param.y, param.z);
    }
    rotation(parameters) {
        let param = {
            x: (typeof parameters.x === 'number') ? parameters.x : this.mesh.rotation.x,
            y: (typeof parameters.y === 'number') ? parameters.y : this.mesh.rotation.y,
            z: (typeof parameters.z === 'number') ? parameters.z : this.mesh.rotation.z
        };

        this.mesh.rotation.set(param.x, param.y, param.z);
    }

    static getMixer() { return ANIMATION_MIXER; }

    static createActorFromFBX(lFbxPath) {
        var promise = new Promise((resolve, reject) => {
            var actor = new Actor();
            var loader = new THREE.FBXLoader();

            loader.load( lFbxPath, ( object ) => {
                object.mixer = new THREE.AnimationMixer( object );

                object.traverse( function ( child ) {
                    if ( child.isMesh ) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                } );

                actor.mesh = object;
                actor.mixer = object.mixer;

                resolve(actor);
            }, (param) => {/*console.warn(param);*/}, (param) => {console.error(param);});
        });

        return promise;
    }
}
