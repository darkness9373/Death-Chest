import { Player, world } from '@minecraft/server'

world.beforeEvents.itemUse.subscribe(data => {
    const player = data.source;
    if (!(player instanceof Player)) return;
    const item = data.itemStack;
    if (item.typeId !== 'dc:death_key') return;
    const teleportUsed = item.getDynamicProperty('teleportUsed');
    if (teleportUsed) {
        player.sendMessage('§cThis key has already been used to teleport.');
        return;
    }
    const locationStr = item.getDynamicProperty('location');
    if (!locationStr) {
        player.sendMessage('§cThis key does not have a teleport location.');
        return;
    }
    const location = JSON.parse(locationStr);
    player.tryTeleport({x: location.x, y: location.y, z: location.z },
        {
            dimension: world.getDimension(location.dimension),
            keepVelocity: false
        }
    );
    const items = data.itemStack.clone();
    items.setDynamicProperty('teleportUsed', true);
    player.onScreenDisplay.setActionBar('§aTeleported to death location!');
    player.getComponent('equippable').setEquipment('Mainhand', items);
})