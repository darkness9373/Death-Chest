import * as server from "@minecraft/server";
import { handlePlayerDeath } from "./VaultManager";

export function initDeathListener() {
    server.world.afterEvents.entityDie.subscribe(data => {
        const entity = data.deadEntity;
        if (!(entity instanceof server.Player)) return
        handlePlayerDeath(entity)
    })
}