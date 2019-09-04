import {isHTMLElement, xhrRequest, getFileExtension} from "./utils";
import {Player} from "./player";
import {Actor} from "./actor";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

var PLAYER_SPEED = 0.5;
var ANIMATION_MIXER;
var FRONT = 1,
	SIDE = 2;

export class Game {
	constructor(gameView) {
		if(gameView instanceof GameView) {
			this.view = gameView;
			this.actors = [];
			this.players = [];
			this.keyboard = new THREEx.KeyboardState();

			this.gameStarted = false;
		} else {
			throw "Unrecognized object. Game Should be initialized with a GameView object.";
		}

	}

	start() {
		// TODO
		this.init();
		this.render();
	}

	addPlayer(player, parameters) {
		if(player instanceof Player) {
			this.players.push(player);
		} else {
			console.warn("Invalid player!");
		}
	}

	addActor(actor, parameters) {
		if(actor instanceof Actor) {
			this.scene.add(actor.mesh);
			this.actors.push(actor);
			if(parameters) {
				actor.position(parameters.position);
			}
		} else {
			console.warn("Invalid actor!");
		}
	}

	addObject(object, parameters) {
		this.scene.add(object.mesh);
	}

	lookAt(object) {
		if(object) {
			this.camera.lookAt(object.mesh.position);
		} else {
			this.camera.lookAt(this.scene.position);
		}
	}



	render() {
		let clockDelta = this.clock.getDelta();

		requestAnimationFrame(() => {
      this.render();
    });

		this.actors.forEach((object) => {
      object.update(clockDelta);
    });

		this.players.forEach((object) => {
      object.update(clockDelta);
		});

		if(!this.gameStarted) {
			if(this.playerOne && this.playerTwo) {
				var actorOne = this.playerOne.actor;
				var actorTwo = this.playerTwo.actor;
				actorOne.rotation({y: Math.PI/2});
				actorTwo.rotation({y: -Math.PI/2});
				let idle1 = actorOne.animations[ "idle" ];
				idle1.play();
				let idle2 = actorTwo.animations[ "idle" ];
				idle2.play();
				this.gameStarted = true;
			}
		}

		this.gameShortcuts();

		this.renderer.render( this.scene, this.camera );
	}

	gameShortcuts() {
		if(this.keyboard.pressed("N")) {
			console.log("N !");
			// this.lookAt();
		}
	}
}

export class GameView {
	constructor(domElem) {
		if(isHTMLElement(domElem)) {
			this.domElement = domElem;
		} else {
			let body = document.getElementsByTagName("body")[0];
			this.domElement = document.createElement("div");
			body.append(this.domElement);
		}

		this.scene;
		this.renderer;
		this.camera;
		this.game = new Game();
	}

	init() {
		this.initScene();
		// this.initSkybox();
		this.initTerrain();

		this.clock = new THREE.Clock();

		var fieldOfView = 80,
			aspectRatio = window.innerWidth / window.innerHeight,
			nearPlane = 1,
			farPlane = 1500;
		this.camera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, nearPlane, farPlane );

		this.camera.position.set(0,40,60);
		// this.camera.lookAt(this.scene.position);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.autoClear = false;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.shadowMap.enabled = true;

		this.domElement.appendChild( this.renderer.domElement ); // Append the 3D scene in the page

		var controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		controls.enablePan = false;
	}

	initScene() {
		this.scene = new THREE.Scene();

		var light = new THREE.PointLight( 0xFFFFFF, 1, 0, 2 );
		var ambientlight = new THREE.AmbientLight( 0x202020 );
		this.scene.add(light);
		light.position.set(0,100,0);
		this.scene.add(ambientlight);
		// logger("Scene initialized");
	}

	initSkybox() {
		var skyboxPath = "";
		var skyboxFormat = ".png";

		var skyboxTextures = [
			skyboxPath + 'right' + skyboxFormat,
			skyboxPath + 'left' + skyboxFormat,
			skyboxPath + 'top' + skyboxFormat,
			skyboxPath + 'bottom' + skyboxFormat,
			skyboxPath + 'front' + skyboxFormat,
			skyboxPath + 'back' + skyboxFormat
		];

		var skybox = new THREE.CubeTextureLoader().load(skyboxTextures);
		skybox.format = THREE.RGBFormat;

		this.scene.background = skybox;
		// logger("Skybox initialized");
	}

	initTerrain() {
		var geometry = new THREE.PlaneBufferGeometry( 500, 500 );
		var material = new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } );
		var ground = new THREE.Mesh( geometry, material );
		ground.position.set( 0, 0, 0 );
		ground.rotation.x = - Math.PI / 2;
		ground.receiveShadow = true;
		this.scene.add( ground );
		var grid = new THREE.GridHelper( 500, 100, 0x000000, 0x000000 );
		grid.position.y = 0;
		grid.material.opacity = 0.2;
		grid.material.transparent = true;
		this.scene.add( grid );
		// logger("Terrain initialized");
	}
}

export async function loadObject(resourceUrl) {
	const resourceType = getFileExtension(resourceUrl);

	const loader = getCorrespondingLoader(resourceType);

	const promise = new Promise((resolve, reject) => {
		loader.load(resourceUrl, (parsedObject) => {
			resolve(parsedObject);
			// parsedObject.scene
			// parsedObject.animations
			// parsedObject.scenes
			// parsedObject.cameras
			// parsedObject.asset
		}, (progression) => {
			// progression.loaded
			// progression.total
		}, (error) => {
			reject(error);
		});
	});

	return await promise;
}

export function loadPlayer(resourceUrl) {
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

const LOADERS = {

};

function getCorrespondingLoader(fileExtension) { // TODO
	switch (fileExtension) {
		case "gltf": return LOADERS["gltf"] || (LOADERS["gltf"] = new GLTFLoader());
		default:
			throw "Unrecognized extension.";
	}
}
