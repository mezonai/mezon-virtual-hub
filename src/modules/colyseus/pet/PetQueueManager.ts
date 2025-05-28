import { Client, Room } from "colyseus";  // Import Room nếu chưa có

type CatchPetAPI = (playerId: string, petId: string, foodId: string) => Promise<boolean>;

interface PetQueueItem {
    client: Client;
    playerId: string;
}

interface PetQueueState {
    caught: boolean;
    isProcessing: boolean;
    queue: PetQueueItem[];
    caughtBy?: string;
}

export class PetQueueManager {
    private queues: Map<string, PetQueueState> = new Map();
    private catchPetAPI: CatchPetAPI;
     private room: Room;

    // Khởi tạo với hàm API thực tế
    constructor(room: Room, apiFn: CatchPetAPI) {
        this.room = room;
        this.catchPetAPI = apiFn;
    }

    // Gọi khi người chơi nhấn nút bắt Pet
    handleCatchRequest(client: Client, message: any, removePetCallback: (petId: string) => void) {
        const playerId = client.sessionId;

        if (!this.catchPetAPI) {
            console.warn("CatchPetAPI chưa được khởi tạo.");
            return;
        }

        // Nếu Pet chưa có hàng đợi thì tạo mới
        if (!this.queues.has(message.petId)) {
            this.queues.set(message.petId, {
                caught: false,
                isProcessing: false,
                queue: [],
            });
        }

        const state = this.queues.get(message.petId)!;
        // Nếu Pet đã bị bắt rồi
        if (state.caught) {
            this.notifyPetAlreadyCaught(client, message.petId);
            return;
        }
        // Nếu người chơi đã trong hàng đợi thì bỏ qua
        if (state.queue.some(q => q.playerId === playerId)) {
            return;
        }

        // Thêm vào hàng đợi
        state.queue.push({ client, playerId });

        // Bắt đầu xử lý nếu chưa xử lý ai
        if (!state.isProcessing) {
            this.processQueue(message.petId, message.foodId, removePetCallback);
        }
    }

    // Xử lý từng người chơi trong hàng đợi
    private async processQueue(petId: string, foodId: string ,removePetCallback: (petId: string) => void) {
        const state = this.queues.get(petId);
        if (!state) return;

        // Đánh dấu đang xử lý
        state.isProcessing = true;

        while (state.queue.length > 0 && !state.caught) {
            const { client, playerId } = state.queue.shift()!;

            try {
                const success = await this.catchPetAPI(playerId, petId, foodId);
                if (success) {
                    state.caught = true;
                    state.caughtBy = playerId;
                    const remainingClientIds = state.queue.map(item => item.client.sessionId);
                    this.room.broadcast("onCatchPetSuccess", {
                        playerCatchId: client.sessionId,
                        catchSucces: true,
                        petId: petId,
                    });
                    for (const remaining of state.queue) {
                        this.notifyPetAlreadyCaught(remaining.client, petId);
                    }
                    removePetCallback(petId);
                    // Dọn hàng đợi
                    state.queue = [];
                    break;
                } else {
                    client.send("onCatchPetFail", {
                        playerCatchId: client.sessionId,
                        catchSucces: false,
                        petId: petId
                    });
                }
            } catch (error) {
                console.error("Lỗi khi gọi catchPetAPI:", error);
            }
        }

        // Kết thúc xử lý
        state.isProcessing = false;
    }

    notifyPetAlreadyCaught(client: Client, petId: string) {
        client.send("onPetAlreadyCaught", {
            playerCatchId: client.sessionId,
            catchSucces: false,
            petId: petId
        });
    }
}