import * as server from "@minecraft/server";

/**
 * 
 * @param {server.Player} player 
 */
export function handlePlayerDeath(player) {
    const inv = player.getComponent(server.EntityComponentTypes.Inventory)
    if (!inv) return;
    const container = inv.container;
    const items = [];
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (item) {
            items.push(item.clone());
            container.setItem(i, undefined);
        }
     }

     player.sendMessage(`§cDeath detected. ${items.length} items stored in vault.`);
}