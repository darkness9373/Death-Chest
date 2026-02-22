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
    })
    const collectedItems = [];
    for (const itemEntity of items) {
        const itemCom = itemEntity.getComponent('minecraft:item');
        if (!itemCom) continue;
        const itemStack = itemCom.itemStack;
        if (!itemStack) continue;
        collectedItems.push(itemStack.clone());
        itemEntity.remove();
    }

    player.sendMessage(`Collected ${collectedItems.length} items from the ground.`);
}