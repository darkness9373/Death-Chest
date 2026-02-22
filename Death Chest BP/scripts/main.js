import { world } from '@minecraft/server';
import './death/DeathManager.js';

world.beforeEvents.playerInteractWithBlock.subscribe(data => {
    const { player, block } = data;
    if (block.typeId !== 'minecraft:chest') return;
    const dim = block.dimension;

    const vaults = dim.getEntities({
        location: { x: block.location.x + 0.5, y: block.location.y, z: block.location.z + 0.5 },
        maxDistance: 0.6,
        type: 'dc:chest_inventory'
    })
    if (vaults.length === 0) return;
    data.cancel = true;
    const vault = vaults[0];
    const ownerId = vault.getDynamicProperty('owner');
    if (ownerId !== player.id) {
        player.sendMessage('This chest does not belong to you!');
        return;
    }
    player.sendMessage('You have found a death vault!');
})