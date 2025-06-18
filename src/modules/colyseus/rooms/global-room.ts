import type { BaseGameRoom } from "./base-game.room";

export class RoomManager {
    private static rooms: Set<BaseGameRoom> = new Set();
    private static readonly INTERVAL_MS = 2 * 60 * 1000; //
    // static constructor simulation (chạy 1 lần khi load)
    private static initialized = (() => {
        setInterval(() => {
            RoomManager.broadcastChangePetRoom();
        }, RoomManager.INTERVAL_MS);
        return true;
    })();

    static addRoom(room: BaseGameRoom) {
        this.rooms.add(room);
    }

    static removeRoom(room: BaseGameRoom) {
        this.rooms.delete(room);
    }

    private static async broadcastChangePetRoom() {
        for (const room of this.rooms) {
            await room.changePetRoom();
        }
        for (const room of this.rooms) {
            room.spawnPetInRoom();
        }
    }
}