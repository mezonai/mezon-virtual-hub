import { Client, Room } from "colyseus";
import { BaseGameRoom, RoomState } from "./base-game.room";
import { UserEntity } from "@modules/user/entity/user.entity";
import { AuthenticatedClient, PetState, PlayerBattleInfo as PlayerBattleState, SkillData as SkillState } from "@types";
import { MessageTypes } from "../MessageTypes";
import { on } from "events";
import { PetType } from "@enum";
import { UserService } from "@modules/user/user.service";
import { Inject } from "@nestjs/common";
import { PetPlayersService } from "@modules/pet-players/pet-players.service";
export type PlayerAction =
    | {
        type: "attack";
        skillIndex: number; // index trong mảng skills
    }
    | {
        type: "switch";
        newPetIndex: number; // index của pet mới muốn đưa ra
    };
export class BattleRoom extends BaseGameRoom {
    private playerActions: Map<string, PlayerAction> = new Map();
    // @Inject() private readonly petPlayersService: PetPlayersService;
    override async onCreate() {
        this.setState(new RoomState());
        this.onMessage(MessageTypes.PLAYER_ACION, async (client, data: PlayerAction) => {
            this.onPlayerAction(client, data);
        });
        this.onMessage(MessageTypes.SWITCH_PET_AFTER_DEAD, (client, data) => {
            const { petSwitchId } = data
            this.handleSwitchPetAfterPetDead(client, petSwitchId);
        });
    }

    override async onJoin(client: AuthenticatedClient, options: any, auth: any) {
        const { userData } = client;
        console.log(`BattleRoom created for ${client.sessionId}`);
        const newPlayer = new PlayerBattleState();
        newPlayer.id = client.sessionId;
        newPlayer.user_id = userData?.id ?? "";
        newPlayer.name = userData?.username ?? "";

        if (!userData?.id) return;
        
        const petsFromUser = await this.petPlayersService.getPetsForBattle(userData?.id)

        petsFromUser.forEach((a, index) => {
            const pet = new PetState();
            pet.id = a.id;
            pet.name = `${a.name} (${a.pet?.rarity})`;
            pet.species = a.pet?.species ?? "";
            pet.type = a.pet?.type ?? "";
            pet.attack = a.attack;
            pet.defense = a.defense;
            pet.currentHp = a.hp;
            pet.totalHp = a.hp;
            pet.level = a.level;
            pet.currentExp = a.exp;
            pet.totalExp = a.exp;
            pet.speed = a.speed;

            // Gán skill mặc định (hoặc từ data của a nếu có)
            for (let j = 0; j < 3; j++) {
                const skill = new SkillState();
                skill.id = j == 0 ? "ATTACK01" : j == 1 ? "NOR01" : "NOR02";
                skill.attack = 20 + j * 10;
                skill.accuracy = 90;
                skill.powerPoint = 15;
                pet.skills.push(skill);
            }
            newPlayer.pets[index] = pet;
            newPlayer.activePetIndex = 0;
        });
        this.state.battlePlayers.set(client.sessionId, newPlayer);
        // Nếu đủ 2 người chơi → hủy timeout và gửi thông tin
        if (this.state.battlePlayers.size === 2) {
            const playersBattleData = JSON.stringify(
                Array.from(this.state.battlePlayers.values()).map(p => this.serializeBattlePlayer(p))
            );

            this.broadcast(MessageTypes.BATTE_READY, {
                playersBattleData: playersBattleData
            });
        }

    }

    public onPlayerAction(client: Client, action: PlayerAction) {
        this.playerActions.set(client.sessionId, action);
        if (this.playerActions.size < 2) {
            client.send(MessageTypes.WAITING_OTHER_USER, { message: "" });
            return;
        }
        this.resolveTurn(); // khi đủ 2 người, xử lý lượt
    }
    private async resolveTurn() {
        const [p1Entry, p2Entry] = Array.from(this.state.battlePlayers.entries());
        const [p1Id, p1] = p1Entry;
        const [p2Id, p2] = p2Entry;

        const a1 = this.playerActions.get(p1Id);
        const a2 = this.playerActions.get(p2Id);

        if (!a1 || !a2) {
            console.warn("One or both players have not submitted their action.");
            return;
        }

        console.log("p1.activePetIndex", p1.activePetIndex);
        console.log("p2.activePetIndex", p2.activePetIndex);
        const pet1 = p1.pets[p1.activePetIndex];
        const pet2 = p2.pets[p2.activePetIndex];

        const turnOrder = [
            { clientId: p1Id, player: p1, action: a1, pet: pet1 },
            { clientId: p2Id, player: p2, action: a2, pet: pet2 }
        ].sort((a, b) => {
            if (b.pet.speed !== a.pet.speed) {
                return b.pet.speed - a.pet.speed; // Speed cao hơn đi trước
            } else {
                return Math.random() < 0.5 ? -1 : 1; // Speed bằng nhau → random
            }
        });

        const first = turnOrder[0];
        const second = turnOrder[1];

        if (first.action.type === "attack") {
            const result1 = await this.executeAttack(first, second);
            const result2 = await this.executeAttack(second, first);
            const resultMessage = {
                player1Id: first.clientId,
                skillAttacPlayer1Id: result1.skill?.id ?? null,
                damagePlayer1: result1.damage,
                playerTargetP1: this.serializeBattlePlayer(second.player),
                player2Id: second.clientId,
                skillAttacPlayer2Id: result2.skill?.id ?? null,
                damagePlayer2: result2.damage,
                playerTargetP2: this.serializeBattlePlayer(first.player),
            };
            this.broadcast(MessageTypes.RESULT_SKILL, resultMessage);
        }
        else if (first.action.type === "switch") {
            this.handleSwitch(first);
            this.handleSwitch(second);
        }


        this.playerActions.clear();
    }

    private async executeAttack(
        attacker: { clientId: string, action: PlayerAction, pet: PetState },
        defender: { clientId: string, pet: PetState }
    ): Promise<{ skill: SkillState | null, damage: number }> {
        if (
            attacker.action.type !== "attack" ||
            attacker.pet.isDead ||
            defender.pet.isDead
        ) {
            return { skill: null, damage: 0 };
        }
        const skill = attacker.pet.skills[attacker.action.skillIndex];
        if (skill.powerPoint > 0) {
            skill.powerPoint -= 1;
        }

        const damage = this.calculateDamage(attacker.pet, defender.pet, skill);
        defender.pet.currentHp -= damage;
        if (defender.pet.currentHp <= 0) {
            console.log("User defend:", defender.clientId)
            defender.pet.currentHp = 0;
            defender.pet.isDead = true;
        }

        return { skill, damage };
    }

    private handleSwitch(player: {
        clientId: string,
        player: PlayerBattleState,
        action: PlayerAction
    }) {
        if (player.action.type !== "switch") return;

        const newPet = player.player.pets[player.action.newPetIndex];
        if (!newPet || newPet.isDead) return;

        player.player.activePetIndex = player.action.newPetIndex;
        this.broadcast("switch_result", {
            clientId: player.clientId,
            newPetIndex: player.action.newPetIndex,
        });
    }

    private handleSwitchPetAfterPetDead(client: Client, petId: string) {
        const player = this.state.battlePlayers.get(client.sessionId);
        if (!player) return;
        if (petId == "-1") {
            const hasAvailablePet = player.pets.some((pet, index) =>
                !pet.isDead && index >= player.activePetIndex
            );
            if (!hasAvailablePet || player.activePetIndex >= player.pets.length) {
                // ❌ Người chơi này thua → xác định người chơi còn lại thắng
                const opponent = [...this.state.battlePlayers.values()]
                    .find(p => p.id !== player.id);
                this.broadcast(MessageTypes.BATTLE_FINISHED, {
                    winnerId: opponent?.id ?? null,
                    loserId: player.id,
                });
                return;
            }
        }
        const petIndex = player.pets.findIndex(p => p.id === petId);
        if (petIndex === -1) {
            console.warn(`[handleSwitchPetAfterFaint] Pet không tồn tại: ${petId}`);
            return;
        }
        player.activePetIndex++;
        // Gửi thông báo cho toàn bộ client về việc đổi pet
        this.broadcast(MessageTypes.SWITCH_PET_AFTER_DEAD_DONE, {
            playerSwitch: this.serializeBattlePlayer(player),
            petChosenId: petId,
        });
    }

    private calculateDamage(attacker: PetState, defender: PetState, skill: SkillState): number {
        const hitRoll = Math.random() * 100; // Số ngẫu nhiên 0 ~ 1
        if (hitRoll > skill.accuracy) {
            return 0; // Đánh hụt
        }
        const attack = attacker.attack;
        const defense = defender.defense;
        const baseDamage = Math.floor(
            (((2 * attacker.level) / 5 + 2) * skill.attack * (attack / (defense + 1))) / 50 + 2
        );

        const effectiveness = this.getTypeEffectiveness(attacker.type, defender.type);
        // const finalDamage = Math.floor(baseDamage * effectiveness);
        const finalDamage = 100;

        return Math.max(finalDamage, 1); // Luôn gây ít nhất 1 damage
    }

    getTypeEffectiveness(attackType: PetType | "", defenseType: PetType | ""): number {
        return typeEffectiveness[attackType]?.[defenseType] ?? 1;
    }


    private serializeBattlePlayer(player: PlayerBattleState) {
        return {
            id: player.id,
            userId: player.user_id,
            name: player.name,
            activePetIndex: player.activePetIndex,
            battlePets: player.pets.map(pet => this.serializePet(pet))
        };
    }

    private serializePet(pet: PetState) {
        return {
            id: pet.id,
            name: pet.name,
            species: pet.species,
            type: pet.type,
            level: pet.level,
            totalHp: pet.totalHp,
            currentHp: pet.currentHp,
            attack: pet.attack,
            defense: pet.defense,
            speed: pet.speed,
            currentExp: pet.currentExp,
            totalExp: pet.totalExp,
            isDead: pet.isDead,
            skills: pet.skills.map(skill => this.serializeSkill(skill))
        };
    }

    private serializeSkill(skill: SkillState) {
        return {
            id: skill.id,
            attack: skill.attack,
            accuracy: skill.accuracy,
            powerPoint: skill.powerPoint
        };
    }
}
const typeEffectiveness: Record<PetType, Record<PetType, number>> = {
    [PetType.NORMAL]: {
        [PetType.NORMAL]: 1,
        [PetType.FIRE]: 1,
        [PetType.ICE]: 1,
        [PetType.WATER]: 1,
        [PetType.ELECTRIC]: 1,
        [PetType.GRASS]: 1,
        [PetType.DRAGON]: 1,
    },
    [PetType.FIRE]: {
        [PetType.NORMAL]: 1,
        [PetType.FIRE]: 0.5,
        [PetType.ICE]: 2,
        [PetType.WATER]: 0.5,
        [PetType.ELECTRIC]: 1,
        [PetType.GRASS]: 2,
        [PetType.DRAGON]: 0.5,
    },
    [PetType.ICE]: {
        [PetType.NORMAL]: 1,
        [PetType.FIRE]: 0.5,
        [PetType.ICE]: 0.5,
        [PetType.WATER]: 1,
        [PetType.ELECTRIC]: 1,
        [PetType.GRASS]: 2,
        [PetType.DRAGON]: 2,
    },
    [PetType.WATER]: {
        [PetType.NORMAL]: 1,
        [PetType.FIRE]: 2,
        [PetType.ICE]: 1,
        [PetType.WATER]: 0.5,
        [PetType.ELECTRIC]: 1,
        [PetType.GRASS]: 0.5,
        [PetType.DRAGON]: 0.5,
    },
    [PetType.ELECTRIC]: {
        [PetType.NORMAL]: 1,
        [PetType.FIRE]: 1,
        [PetType.ICE]: 1,
        [PetType.WATER]: 2,
        [PetType.ELECTRIC]: 0.5,
        [PetType.GRASS]: 0.5,
        [PetType.DRAGON]: 0.5,
    },
    [PetType.GRASS]: {
        [PetType.NORMAL]: 1,
        [PetType.FIRE]: 0.5,
        [PetType.ICE]: 1,
        [PetType.WATER]: 2,
        [PetType.ELECTRIC]: 1,
        [PetType.GRASS]: 0.5,
        [PetType.DRAGON]: 0.5,
    },
    [PetType.DRAGON]: {
        [PetType.NORMAL]: 1,
        [PetType.FIRE]: 1,
        [PetType.ICE]: 1,
        [PetType.WATER]: 1,
        [PetType.ELECTRIC]: 1,
        [PetType.GRASS]: 1,
        [PetType.DRAGON]: 2,
    }
};
