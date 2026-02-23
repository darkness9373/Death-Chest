import { world, system, Player, Entity, BlockPermutation } from '@minecraft/server';
import './death/DeathManager.js';
import './death/KeyManager.js';
import { ActionFormData } from '@minecraft/server-ui';
import Extra from './Extra.js'

world.beforeEvents.playerInteractWithBlock.subscribe(data => {
    const { player, block } = data;
    if (block.typeId !== 'minecraft:chest') return;
    const dim = block.dimension;

    const vaults = dim.getEntities({
        location: { x: block.location.x + 0.5, y: block.location.y + 1, z: block.location.z + 0.5 },
        maxDistance: 0.6,
        type: 'dc:chest_inventory'
    })
    if (vaults.length === 0) return;
    data.cancel = true;

    const vault = vaults[0];
    const ownerId = vault.getDynamicProperty('owner');
    if (ownerId !== player.id) {
        system.run(() => {
            player.onScreenDisplay.setActionBar('§cThis is not your death chest!');
        });
        return;
    }
    const isLocked = vault.getDynamicProperty('locked');
    if (!isLocked) {
        system.run(() => openVault(player, vault));
        return;
    }
    const item = player.getComponent('minecraft:inventory').container.getItem(player.selectedSlotIndex);
    if (!item || item.typeId !== 'dc:death_key') {
        system.run(() => {
            player.onScreenDisplay.setActionBar('§cYou must be holding the key!');
        });
        return;
    }
    const keyLocation = JSON.parse(item.getDynamicProperty('location')) ?? null;
    if (!keyLocation) {
        system.run(() => {
            player.onScreenDisplay.setActionBar('§cThis key is not bound to this chest!');
        });
        return;
    }
    if (keyLocation.x !== block.location.x || keyLocation.y !== block.location.y || keyLocation.z !== block.location.z) {
        system.run(() => {
            player.onScreenDisplay.setActionBar('§cThis key is not bound to this chest!');
        });
        return;
    }
    vault.setDynamicProperty('locked', false);
    system.run(() => {
        player.getComponent('minecraft:equippable').setEquipment('Mainhand', undefined)
        player.onScreenDisplay.setActionBar('§aChest unlocked!');
    })
})

/**
 * 
 * @param {Player} player 
 * @param {Entity} vault 
 * @param {string} update 
 */
async function openVault(player, vault, update = '') {
    const invCom = vault.getComponent('minecraft:inventory');
    if (!invCom) return;
    const container = invCom.container;
    const form = new ActionFormData();
    form.title('Death Chest');
    form.body(update);
    const slots = [];
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (!item) continue;
        form.button(`${item.amount}x ${Extra.formatName(item.typeId)}`);
        slots.push(i);
    }
    if (slots.length <= 0) return player.runCommand(`setblock ${Math.floor(vault.location.x)} ${Math.floor(vault.location.y - 1)} ${Math.floor(vault.location.z)} air destroy`);
    form.button('§aTransfer All');

    const response = await form.show(player);
    if (response.canceled) return;
    if (response.selection === slots.length) {
        transferAll(player, vault);
        return;
    }
    const slotIndex = slots[response.selection];
    const item = container.getItem(slotIndex);
    if (!item) return;
    container.setItem(slotIndex, undefined);
    player.getComponent('minecraft:inventory').container.addItem(item);
    player.sendMessage(`You took ${item.amount}x ${Extra.formatName(item.typeId)}`);
    openVault(player, vault, `§aYou took ${item.amount}x ${Extra.formatName(item.typeId)}`);
}

/**
 * 
 * @param {Player} player 
 * @param {Entity} vault 
 */
function transferAll(player, vault) {
    const invCom = vault.getComponent('minecraft:inventory');
    if (!invCom) return;
    const container = invCom.container;
    const playerInvCom = player.getComponent('minecraft:inventory').container;
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (!item) continue;
        const leftOver = playerInvCom.addItem(item);
        if (leftOver) {
            vault.dimension.spawnItem(leftOver, player.location);
        }
        container.setItem(i, undefined);
    }
    vault.dimension.runCommand(`setblock ${Math.floor(vault.location.x)} ${Math.floor(vault.location.y - 1)} ${Math.floor(vault.location.z)} air destroy`);
}