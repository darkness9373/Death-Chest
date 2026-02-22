import * as server from "@minecraft/server";
import { handleItemDrop } from "./VaultManager";

server.world.afterEvents.entityDie.subscribe(data => {
    const player = data.deadEntity
    if (!(player instanceof server.Player)) return;
    handleItemDrop(player);
})