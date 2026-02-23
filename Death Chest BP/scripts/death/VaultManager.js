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
    const key = new server.ItemStack('dc:death_key', 1);
    key.setDynamicProperty('location', JSON.stringify({
        x,
        y: y + 1,
        z,
        dimension: dim.id
    }));
    key.nameTag = '§6Death Key';
    key.setLore([
        `§o${x}, ${y}, ${z}`,
        `§o${dim.id}`
    ])
    const vault = dim.spawnEntity('dc:chest_inventory', { x: x + 0.5, y: y + 1, z: z + 0.5 });
    vault.nameTag = `${player.name}'s Death Chest`;
    vault.addTag('death_vault');
    vault.setDynamicProperty('owner', player.id);
    vault.setDynamicProperty('deathTime', Date.now());
    vault.setDynamicProperty('expire', Date.now() + (20 * 60 * 1000));
    vault.setDynamicProperty('locked', true);
    const invCom = vault.getComponent('minecraft:inventory');
    if (!invCom) return;
    const container = invCom.container;
    let slot = 0;
    for (const item of collectedItems) {
        container.setItem(slot, item);
        slot++;
    }
    player.getComponent('minecraft:inventory').container.addItem(key);
}