import 'phaser';
import Player from '../models/Player';

type ArcadeSprite = Phaser.Physics.Arcade.Sprite;

export default class WorldScene extends Phaser.Scene {
  TILE_SIZE: number = 32;

  navMeshPlugin: any;
  navMesh: any;
  marker: Phaser.GameObjects.Graphics;
  map: any;
  mapLayers = {};
  player: any;
  cursors: any;

  constructor() {
    super('WorldScene');
  }

  create() {
    this.map = this.make.tilemap({ key: 'map' });
  
    const tiles = this.map.addTilesetImage('tileset', 'tiles');
        
    this.mapLayers['grass'] = this.map.createStaticLayer('Grass', tiles, 0, 0);
    this.mapLayers['objects'] = this.map.createStaticLayer('Objects', tiles, 0, 0);
    this.mapLayers['objects'].setCollisionByExclusion([-1]);
    this.mapLayers['decorations'] = this.map.createStaticLayer('Decorations', tiles, 0, 0);
    this.mapLayers['ui'] = this.map.createBlankDynamicLayer('UI', tiles);

    const obstaclesLayer =  this.map.getObjectLayer("Obstacles");
    this.navMesh = this.navMeshPlugin.buildMeshFromTiled(
      "mesh",
      obstaclesLayer,
    );

    // this.navMesh.enableDebug();
    // this.navMesh.debugDrawMesh({
    //   drawCentroid: true,
    //   drawBounds: false,
    //   drawNeighbors: true,
    //   drawPortals: true
    // });

    // Player
    const playerPos = this.getTilePosition(11, 8);
    this.player = new Player(this, playerPos.x, playerPos.y, this.navMesh);

    this.physics.world.bounds.width = this.map.widthInPixels;
    this.physics.world.bounds.height = this.map.heightInPixels;

    // Trigger on click on map
    this.input.on("pointerdown", pointer => {
      const end = new Phaser.Math.Vector2(pointer.x, pointer.y);
      // Find corresponding tile from click
      const tile = this.map.getTileAtWorldXY(end.x, end.y, false, this.cameras.main, this.mapLayers['grass']);
      // Get center of the tile
      const tilePosition = new Phaser.Math.Vector2(tile.pixelX + this.TILE_SIZE/2, tile.pixelY + this.TILE_SIZE/2);
      // Move Player to this position
      // Player will automatically find its path to the point an dupdate its position accordingly
      this.player.goTo(tilePosition);
    });

    // Player animation (used mainly in the Player class when moving)
    // Need refactoring
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { frames: [4, 3, 4, 5]}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { frames: [7, 6, 7, 8]}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('player', { frames: [10, 9, 10, 11]}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('player', { frames: [1, 0, 1, 2 ]}),
      frameRate: 10,
      repeat: -1
    });

    // Enemies
    const enemy001 = this.physics.add.sprite(120, 150, 'enemy-1', 1);
    
    // Camera follow player
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.roundPixels = true;

    // Tile marker
    // Create a simple graphic that can be used to show which tile the mouse is over
    const markerWidth = 4;
    this.marker = this.add.graphics();
    this.marker.lineStyle(markerWidth, 0xffffff, .3);
    this.marker.strokeRect(-markerWidth/2, -markerWidth/2, this.map.tileWidth + markerWidth, this.map.tileHeight + markerWidth);
  }

  update() {
    this.updateMapMarker();
  }

  private updateMapMarker() {
    // Convert the mouse position to world position within the camera
    const worldPoint: any = this.input.activePointer.positionToCamera(this.cameras.main);

    // Move map marker over pointed tile
    const pointerTileXY = this.mapLayers['ui'].worldToTileXY(worldPoint.x, worldPoint.y);
    const snappedWorldPoint = this.mapLayers['ui'].tileToWorldXY(pointerTileXY.x, pointerTileXY.y);
    this.marker.setPosition(snappedWorldPoint.x, snappedWorldPoint.y);
  }

  onMeetEnemy = (player: ArcadeSprite, enemy: ArcadeSprite) => {
    enemy.x = Phaser.Math.RND.between(0, 300);
    enemy.z = Phaser.Math.RND.between(0, 300);

    // shake the world
    this.cameras.main.fade(1000);
  }

  getTilePosition(xIndex: number, yIndex: number) {
    return {
      x: xIndex * this.TILE_SIZE + this.TILE_SIZE/2,
      y: yIndex * this.TILE_SIZE + this.TILE_SIZE/2,
    };
  }
}