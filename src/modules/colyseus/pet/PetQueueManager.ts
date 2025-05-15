import { Client, Room } from "colyseus";  // Import Room nếu chưa có

type CatchPetAPI = (playerId: string, petId: string) => Promise<boolean>;

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
    private static queues: Map<string, PetQueueState> = new Map();
    private static catchPetAPI: CatchPetAPI;

    // Khởi tạo với hàm API thực tế
    static initialize(apiFn: CatchPetAPI) {
        this.catchPetAPI = apiFn;
    }

    // Gọi khi người chơi nhấn nút bắt Pet
    static handleCatchRequest(client: Client, petId: string, room: Room) {
        const playerId = client.sessionId;

        if (!this.catchPetAPI) {
            console.warn("CatchPetAPI chưa được khởi tạo.");
            return;
        }

        // Nếu Pet chưa có hàng đợi thì tạo mới
        if (!this.queues.has(petId)) {
            this.queues.set(petId, {
                caught: false,
                isProcessing: false,
                queue: [],
            });
        }

        const state = this.queues.get(petId)!;
        // Nếu Pet đã bị bắt rồi
        if (state.caught) {
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
            this.processQueue(petId, room);
        }
    }

    // Xử lý từng người chơi trong hàng đợi
    private static async processQueue(petId: string, room: Room) {
        const state = this.queues.get(petId);
        if (!state) return;

        // Đánh dấu đang xử lý
        state.isProcessing = true;

        while (state.queue.length > 0 && !state.caught) {
            const { client, playerId } = state.queue.shift()!;

            try {
                const success = await this.catchPetAPI(playerId, petId);
                if (success) {
                    state.caught = true;
                    state.caughtBy = playerId;
                    const remainingClientIds = state.queue.map(item => item.client.sessionId);
                    room.broadcast("onCatchPetSuccess", {
                        playerCatchId: client.sessionId,
                        catchSucces: true,
                        petId: petId,
                        remainingUsers: remainingClientIds
                    });
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

    // Reset toàn bộ (tùy chọn)
    static reset() {
        this.queues.clear();
    }
}