import { Player, system, world } from '@minecraft/server'
import { jsx } from 'react/jsx-runtime';

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
    system.run(() => {
        player.tryTeleport({ x: location.x, y: location.y, z: location.z },
            {
                dimension: world.getDimension(location.dimension),
                keepVelocity: false
            }
        );
        const items = data.itemStack.clone();
        items.setDynamicProperty('teleportUsed', true);
        items.setDynamicProperty('location', JSON.stringify(location));
        player.onScreenDisplay.setActionBar('§aTeleported to death location!');
        player.getComponent('equippable').setEquipment('Mainhand', items);
    })
})