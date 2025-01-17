"use strict"
/// <reference path="../defs/phaser.d.ts" />

import { config } from './config.js';
import { BootScene } from './Scenes/Boot.js';
import { LevelLoaderScene } from './Scenes/LevelLoaderScene.js';
import { LevelSelectScene } from './Scenes/LevelSelectScene.js';



class Game extends Phaser.Game {
  get debugOn() {
    return this._debugOn;
  }
  set debugOn(value) {
    this._debugOn = value;
    this.config.physics.arcade.debug = this._debugOn;
  }

  constructor() {
    super(config);

    this.levels = [
      'T1', 'T2', 'L1', 'L2', 'Lee1', 'Example'
    ];
    this.registry.set('levels', this.levels);
    
    this.levelIndex = 0;
    this.urlParams;
    this.rects = [];
    this.objs = [];
    this._debugOn = false;

    this.urlParams = new URLSearchParams(window.location.search);
    //Create global variables for access across all scene instances
    this.Bob = null; //Bob Character
    this.Flit = null; //Flit Character
    //scene.DebugG = null; //Debug graphics object create in active scene as assigned here
    this._ChangingPlayer = false; //Whether we are currenty changing between players
    this.scene.add('Boot', BootScene);
    this.scene.add('LevelSelectScene', LevelSelectScene);
    this.scene.add('LevelLoader', LevelLoaderScene);
    this.scene.start('Boot');
  }
  /**
   * Draws Touching, Blocked, CheckCollsion and origin on a sprite/sprite[]
   * @param {Phaser.GameObjects.Sprite} a Sprite or Sprite Array to draw debug on
   */
  drawCollision(scene) {
    if (!scene.DebugG) {
      scene.DebugG = scene.add.graphics();
      scene.DebugG.depth = 1000;
      scene.DebugG.blendMode = 4;
    }
    scene.DebugG.clear();
    if (this.debugOn) {
      let items = [];
      if (Array.isArray(this.objs)) {
        items = this.objs.flat();
      } else {
        items = [this.objs];
      }
      //width of collision check line
      let collisionW = 3;
      //shorten collision check line by this amount * 2, just to keep the display a bit cleaner
      let collisionTrim = 10;

      //color of collision check lines
      let collisionC = 0xFFFFFF;
      // colour of onFloor
      let onFloorC = 0xFF0000;
      //colour of touching triangle
      let touchingC = 0xFF00FF;
      //colour of blocked triangle
      let blockedC = 0xFFFF00;
      scene.DebugG.alpha = .75;

      for (let i = 0; i < items.length; i++) {
        var b = items[i].body;
        let midW = b.left + (b.width / 2); // center of body
        let midH = b.top + (b.height / 2); // center of body
      
        if (b) {
          //Show lines for collision checks
          if (b.checkCollision.none === false) {
            if (b.checkCollision.left) {
              scene.DebugG.lineStyle(collisionW, collisionC, 1);
              scene.DebugG.lineBetween(b.left - collisionW, b.top + collisionTrim, b.left - collisionW, b.bottom - collisionTrim);
            }
            if (b.checkCollision.right) {
              scene.DebugG.lineStyle(collisionW, collisionC, 1);
              scene.DebugG.lineBetween(b.right + collisionW, b.top + collisionTrim, b.right + collisionW, b.bottom - collisionTrim);
            }
            if (b.checkCollision.up) {
              scene.DebugG.lineStyle(collisionW, collisionC, 1);
              scene.DebugG.lineBetween(b.left + collisionTrim, b.top - collisionW, (b.left + b.width) - collisionTrim, b.top - collisionW);
            }
            if (b.checkCollision.down || b.onFloor()) {
              scene.DebugG.lineStyle(collisionW, b.onFloor() ? onFloorC : collisionC, 1);
              scene.DebugG.lineBetween(b.left + collisionTrim, b.bottom + collisionW, (b.left + b.width) - collisionTrim, b.bottom + collisionW);
            }
          }
          //Show a large arrow for touching
          if (b.touching.none === false) {
            scene.DebugG.lineStyle(3, touchingC);
            if (b.touching.down) {
              scene.DebugG.strokeTriangle(midW - 15, b.bottom - 15, midW + 15, b.bottom - 15, midW, b.bottom)
            }
            if (b.touching.up) {
              scene.DebugG.strokeTriangle(midW - 15, b.top + 15, midW + 15, b.top + 15, midW, b.top)
            }
            if (b.touching.left) {
              scene.DebugG.strokeTriangle(b.left, midH - 15, b.left + 15, midH, b.left, midH + 15);
            }
            if (b.touching.right) {
              scene.DebugG.strokeTriangle(b.right, midH - 15, b.right - 15, midH, b.right, midH + 15);
            }
          }

          //Show a small arrow for blocked
          if (b.blocked.none === false) {
            scene.DebugG.lineStyle(3, blockedC);
            if (b.blocked.up) {
              scene.DebugG.strokeTriangle(midW - 10, b.top + 10, midW + 10, b.top + 10, midW, b.top)
            }
            if (b.blocked.down) {
              scene.DebugG.strokeTriangle(midW - 10, b.bottom - 10, midW + 10, b.bottom - 10, midW, b.bottom)
            }
            if (b.blocked.left) {
              scene.DebugG.strokeTriangle(b.left, midH - 10, b.left + 10, midH, b.left, midH + 10);
            }
            if (b.blocked.right) {
              scene.DebugG.strokeTriangle(b.right, midH - 10, b.right - 10, midH, b.right, midH + 10);
            }
          }
          //Show the origin point
          scene.DebugG.fillStyle(0xFF0000);
          scene.DebugG.fillCircle(b.left + (b.width * b.originX), b.top + (b.height * b.originY), 4);
        }
      
        if (this.rects.length !== 0) {
          for (let i = 0; i < this.rects.length; i++) {
            scene.DebugG.lineStyle(2, this.rects[i].color || 0x00FF00, 1);
            scene.DebugG.strokeRect(this.rects[i].x, this.rects[i].y, this.rects[i].width, this.rects[i].height);
          }
        }
      }
    }
    //empty array
    this.rects.length = 0;
    this.objs.length = 0;
  }
 

  cartoonText(txt) {
    txt.setShadow(3, 3, '#000000', 6, true, false)
      .setStroke('#1493F5', 6);
  }
  shadowText(txt) {
    txt.setShadow(3, 3, '#000000', 6, true, false)
      .setStroke('#000000', 2);
  } 
  cartoonBox(scene,x,y,w,h) {
    let g = scene.add.graphics({ x: x, y: y });
    g.displayOriginX = 0;

    g.fillStyle(0x0, .5);
    g.fillRoundedRect(4, 4, w + 4, h + 24, 10);
    g.fillStyle(0xFFFFFF, 1);
    g.fillRoundedRect(0, 0, w, h + 20, 10);
    g.lineStyle(6, 0xAACCFF, 1.0);
    g.strokeRoundedRect(0, 0, w, h + 20, 10);
    g.lineStyle(1, 0x0, 1);
    g.strokeRoundedRect(-2, -2, w + 4, h + 24, 10);

    return g;
  }
}

window.game = new Game();
