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
    const isLocked = vault.getDynamicProperty('locked');
    if (!isLocked) {
        player.sendMessage('This chest is not locked!');
        return;
    }
    const item = player.getComponent('minecraft:inventory').container.getItem(player.selectedSlotIndex);
    if (!item || item.typeId !== 'minecraft:tripwire_hook') {
        player.sendMessage('You must be holding the key!');
        return;
    }
    const keyLocation = item.getDynamicProperty('location');
    if (!keyLocation) {
        player.sendMessage('This key is not bound to this chest!');
        return;
    }
    if (keyLocation.x !== block.location.x || keyLocation.y !== block.location.y || keyLocation.z !== block.location.z) {
        player.sendMessage('This key is not bound to this chest!');
        return;
    }
    vault.setDynamicProperty('locked', false);
    player.getComponent('minecraft:inventory').container.setItem(player.selectedSlotIndex, undefined);
    player.sendMessage('The chest is unlocked!');
})