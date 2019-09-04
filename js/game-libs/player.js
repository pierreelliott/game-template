import {Actor} from "./actor";


export class Player {
    constructor(actor) {
        if(actor && actor instanceof Actor) {
            this.actor = actor;
        } else {
            this.actor = new Actor();
        }
        this.keyboard = new THREEx.KeyboardState();
        this.moving = false;
        this.keys = {};
        this.movingVector = {};
        this.speed = PLAYER_SPEED;
    }

    update(colckDelta) {
        const moving = this.moving;
        if(this.keys) {
            if(this.keys.up && this.keys.down) {
                // FIXME
                if(this.keys.up && this.keyboard.pressed(""+this.keys.up)) { // Z
                    // this.movingVector = {z: -PLAYER_SPEED};
                    // this.actor.startAnimation()
                    // this.actor.move({z: -PLAYER_SPEED});
                }
                if(this.keys.down && this.keyboard.pressed(""+this.keys.down)) { // S
                    // this.movingVector = {z: PLAYER_SPEED};
                    // this.actor.move({z: PLAYER_SPEED})
                }
            }

            if(this.keys.left && this.keyboard.pressed(""+this.keys.left)) { // Q
                // this.moving = true;
                // this.movingVector = {x: -PLAYER_SPEED};
                // this.actor.position({y: -7});
                // this.actor.startAnimation("walk_backward", {duration: 0.5}).then(() => {
                // 	this.moving = false;
                // 	this.actor.position({y: 0});
                // 	this.movingVector = {};
                // });
                this.actor.stepBackward(this.speed);
                // this.actor.move({x: -PLAYER_SPEED});
            }
            if(this.keys.right && this.keyboard.pressed(""+this.keys.right)) { // D
                // this.moving = true;
                // this.movingVector = {x: PLAYER_SPEED};
                // this.actor.position({y: -7});
                // this.actor.startAnimation("walk_forward", {duration: 0.5}).then(() => {
                // 	this.moving = false;
                // 	this.actor.position({y: 0});
                // 	this.movingVector = {};
                // });
                this.actor.stepForward(this.speed);
                // this.actor.move({x: PLAYER_SPEED});
            }

            if(this.keyboard.pressed(""+this.keys.stop)) {
                console.log("Stopping");
                let action = this.actor.animations[ "boxing" ];
                action.stop();
            }
            if(this.keyboard.pressed(""+this.keys.start)) {
                console.log("Starting");
                this.actor.simpleHit();
                // let action = this.actor.animations[ "boxing" ];
                // console.log(action);
                // action.play();
            }
        }

        if(this.keyboard.pressed("space")) {
            // this.actor.move({y: this.speed})
        }
        if(this.keyboard.pressed("shift")) {
            // this.actor.move({y: -this.speed})
        }
        if(this.keyboard.pressed("²")) {
            this.actor.stopAnimations();
            this.actor.position(this.actor.initialPosition);
            this.actor.idle();
        }
    }

    static getSpeed() { return PLAYER_SPEED; }
    static setSpeed(speed) { PLAYER_SPEED = speed; }

    static loadPlayer(filePath) {
        var player = new Player();

        var promise = new Promise((resolve, reject) => {
            if(!filePath.endsWith(".json")) {
                filePath = filePath + ".json";
            }

            /*fetch(filePath).then(response => {
                console.log("Réponse reçue");
                console.log(response);
                return response.blob();
            })*/
            xhrRequest( { url: filePath } ).then(playerFile => {
                playerFile = JSON.parse(playerFile);
                Actor.createActorFromFBX(playerFile.model).then(pActor => {
                    player.actor = pActor;

                    if(playerFile.animations && playerFile.animations.length > 0) {
                        var nbAnimations = playerFile.animations.length;
                        var loader;
                        var fbxLoader = new THREE.FBXLoader();
                        var daeLoader = new THREE.ColladaLoader();

                        playerFile.animations.forEach(animationParam => {
                            // console.warn("Loading animation : ", animationParam);
                            if(animationParam.path.endsWith(".fbx")) {
                                loader = fbxLoader;
                            } else if(animationParam.path.endsWith(".dae")) {
                                loader = daeLoader;
                            }
                            loader.load( animationParam.path, ( object ) => {
                                if(animationParam.path.endsWith(".dae")) {
                                    console.log(object);
                                }
                                object.animations[0].name = animationParam.name + " - " + object.animations[0].name;
                                let animationClip = player.actor.mixer.clipAction(object.animations[0]);
                                let animationObject = new Animation(player.actor, animationParam.name, animationClip, animationParam.options) ;
                                player.actor.addAnimation(animationObject);
                                nbAnimations--;
                                if(nbAnimations <= 0) {
                                    resolve(player);
                                }
                            });
                        });
                    }
                })
            });
        });

        return promise;
    }
}
