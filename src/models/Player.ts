import 'phaser';
import Entity, { EntityType} from './Entity';
import WorldScene from '../scenes/WorldScene';
import Inventory, { HasInventory } from '../systems/InventorySystem';

export default class Player extends Entity implements HasInventory {
    unitType = EntityType.PLAYER;
    name = 'Player';
    inventory: Inventory = new Inventory();
    animationKey = 'player';

    constructor(scene: WorldScene, x: number, y: number, navMesh: any) {
        super(scene, x, y, navMesh, 'player', 1);
    }
}