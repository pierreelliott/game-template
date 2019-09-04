/**
 * @author Pierre-Elliott Thiboud / http://pierreelliott.github.io/
 *
 */
import * as GameLib from './game-libs/game.js';

"use strict";
var actors = [];
var players = [];
var game;

export default class Variables {
  constructor() {
    this.actors = actors;
    this.players = players;
    this.game = game;
  }
}

var player1Keys = {
  // up: "Z",
  // down: "S",
  left: "Q",
  right: "D",
  start: "E",
  stop: "A"
};

var player2Keys = {
  // up: "up",
  // down: "down",
  left: "left",
  right: "right",
  start: "1",
  stop: "0"
};

window.addEventListener("load", function() {
  var container = document.getElementById("gameScene");
  game = new GameLib.Game(container);
  game.start();
  GameLib.Player.loadPlayer("/src/dummy.json").then(player => {
    console.log("Player 1 created");
    players.push(player);
    player.keys = player1Keys;
    actors.push(player.actor);
    player.actor.scale({x: 0.2, y: 0.2, z: 0.2});
    player.actor.initialPosition = {x: -20, y: 0, z: 0};
    game.addPlayerOne(player);
    game.addActor(player.actor, {position: player.actor.initialPosition});
});
  GameLib.Player.loadPlayer("/src/dummy.json").then(player => {
    console.log("Player 2 created");
    players.push(player);
    player.keys = player2Keys;
    actors.push(player.actor);
    player.actor.scale({x: 0.2, y: 0.2, z: 0.2});
    player.actor.initialPosition = {x: 20, y: 0, z: 0};
    game.addPlayerTwo(player);
    game.addActor(player.actor, {position: player.actor.initialPosition});
});
});
