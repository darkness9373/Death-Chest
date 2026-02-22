import * as server from "@minecraft/server";

/**
 * 
 * @param {server.Player} player 
 */
export function handleItemDrop(player) {
    const dim = player.dimension;
    const location = player.location;
    const items = dim.getEntities({
        type: 'minecraft:item',
        location: location,
        maxDistance: 5
    });
    const collectedItems = [];
    for (const itemEntity of items) {
        const itemCom = itemEntity.getComponent('minecraft:item');
        if (!itemCom) continue;
        const itemStack = itemCom.itemStack;
        if (!itemStack) continue;
        collectedItems.push(itemStack.clone());
        itemEntity.remove();
    }
    const x = Math.floor(location.x);
    const y = Math.floor(location.y);
    const z = Math.floor(location.z);
    const chest = dim.getBlock({ x, y, z });
    if (chest) {
        chest.setPermutation(server.BlockPermutation.resolve('minecraft:chest'));
    }
    const vault = dim.spawnEntity('dc:chest_inventory', { x: x + 0.5, y: y, z: z + 0.5 });
    vault.addTag('death_vault');
    const invCom = vault.getComponent('minecraft:inventory');
    if (!invCom) return;
    const container = invCom.container;
    let slot = 0;
    for (const item of collectedItems) {
        container.setItem(slot, item);
        slot++;
    }
    vault.setDynamicProperty('owner', player.id);
    vault.setDynamicProperty('deathTime', Date.now());
    vault.setDynamicProperty('expire', Date.now() + (20 * 60 * 1000));
    vault.setDynamicProperty('x', x);
    vault.setDynamicProperty('y', y);
    vault.setDynamicProperty('z', z);
    vault.setDynamicProperty('locked', true);
    vault.nameTag = 'test';
    const key = new server.ItemStack('minecraft:tripwire_hook', 1);
    key.setDynamicProperty('location', { x, y, z });
    player.getComponent('minecraft:inventory').container.addItem(key);
}