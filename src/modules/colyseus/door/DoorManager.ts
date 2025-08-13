import { RoomState } from "../rooms/base-game.room";
import { Door } from "./Door";
export class DoorManager {
    private state: RoomState;

    constructor(state: RoomState) {
        this.state = state;
    }

    spawnDoors(count: number) {
        let created = 0;
        while (created < count) {
            const id = this.generateRandomId();
            if (!this.state.doors.has(id)) {
                const door = new Door();
                door.id = id;
                door.isOpen = false;
                this.state.doors.set(id, door);
                created++;
            }
        }
    }

    openDoor(id: string): Door | null {
        const door = this.state.doors.get(id);
        if (door) {
            door.isOpen = true;
            return door;
        }
        return null;
    }

    closeDoor(id: string): Door | null {
        const door = this.state.doors.get(id);
        if (door) {
            door.isOpen = false;
            return door;
        }
        return null;
    }

    toggleDoor(id: string) {
        const door = this.state.doors.get(id);
        if (door) {
            door.isOpen = !door.isOpen;
        }
    }

    getAllDoors() {
        return this.state.doors;
    }

    private generateRandomId(): string {
        const rand = Math.random().toString(36).substring(2, 8);
        return `door_${rand}`;
    }
}