import { Client } from "colyseus";
import { BaseGameRoom, RoomState } from "./base-game.room";
import { AuthenticatedClient, PetState, PlayerBattleInfo as PlayerBattleState, SkillState } from "@types";
import { MessageTypes } from "../MessageTypes";
import { EviromentType as EnvironmentType, PetType, SkillCode, SkillType } from "@enum";
import { isAttackAction, PlayerAction } from "../battle/PlayerAction";
import { SkillHandlerFactory } from "../battle/SkillHandlerFactory";
enum BattleState {
    READY,     // Chờ cả 2 người chọn hành động
    BATTLE,  // Bắt đầu xử lý skill (đang diễn ra turn)
    FINISHED   // Trận đấu đã kết thúc
}
export class BattleRoom extends BaseGameRoom {
    private playerActions: Map<string, PlayerAction> = new Map();
    private battleState: BattleState = BattleState.READY;
    private currentEnviroment = EnvironmentType.GRASS;
    private rationIncreaseDame: number = 1.5;
    // @Inject() private readonly petPlayersService: PetPlayersService;
    override async onCreate(options: any) {
        if (options?.roomName != null) {
            this.currentEnviroment = this.getEnvironment(options.roomName)
        }
        this.setState(new RoomState());
        this.onMessage(MessageTypes.PLAYER_ACION, async (client, data: PlayerAction) => {
            this.onPlayerAction(client, data);
        });
        this.onMessage(MessageTypes.SWITCH_PET_AFTER_DEAD, (client, data) => {
            const { petSwitchId } = data
            this.handleSwitchPetAfterPetDead(client, petSwitchId);
        });
        this.onMessage(MessageTypes.SURRENDER_BATTLE, (client, data) => {
            this.battleState = BattleState.FINISHED;
            const player = this.state.battlePlayers.get(client.sessionId);
            if (player == null) return
            this.battleIsFinished(player);
        });
        this.onMessage(MessageTypes.SET_PET_SLEEP, (client, data) => {
            const { petSleepingId } = data
            const player = this.state.battlePlayers.get(client.sessionId);
            if (player == null) return;
            const pet = player.pets.find(p => p.id === petSleepingId);
            if (pet == null) return;
            pet.isSleeping = true;
        });
    }

    override onLeave(client: AuthenticatedClient): void {
        const player = this.state.battlePlayers.get(client.sessionId);

        // Nếu không có player hoặc trận đấu đã kết thúc thì không xử lý gì
        if (!player || this.battleState === BattleState.FINISHED) return;
        const opponent = this.clients.find(c => c.sessionId !== player.id);
        // Nếu đang trong trận, kết thúc trận đấu với player này
        if (this.battleState === BattleState.BATTLE) {
            opponent?.send(MessageTypes.BATTLE_FINISHED, {
                winnerId: opponent?.id ?? null,
                loserId: client.id,
            });
            return;
        }
        // Gửi thông báo ngắt kết nối cho đối thủ
        opponent?.send(MessageTypes.DISCONNECTED, { message: "" });
    }


    override async onJoin(client: AuthenticatedClient, options: any, auth: any) {
        const { userData } = client;
        console.log(`BattleRoom created for ${client.sessionId}`);

        if (!userData?.id) return;

        const petsFromUser = await this.petPlayersService.getPetsForBattle(userData.id);
        if (!petsFromUser) return;

        const newPlayer = this.createPlayerState(client, userData, petsFromUser);
        this.state.battlePlayers.set(client.sessionId, newPlayer);

        if (this.state.battlePlayers.size === 2) {
            this.startBattle();
        }
    }

    private createPlayerState(client: AuthenticatedClient, userData: any, petsFromUser: any[]): PlayerBattleState {
        const newPlayer = new PlayerBattleState();
        newPlayer.id = client.sessionId;
        newPlayer.user_id = userData.id;
        newPlayer.name = userData.username ?? "";

        petsFromUser.forEach((petData, index) => {
            newPlayer.pets[index] = this.createPetState(petData);
        });

        newPlayer.activePetIndex = 0;
        return newPlayer;
    }

    private createPetState(a: any): PetState {
        const pet = new PetState();
        const boost = String(a.pet.type) === String(this.currentEnviroment) ? this.rationIncreaseDame : 1;
        pet.id = a.id;
        pet.name = a.name;
        pet.species = a.pet?.species ?? "";
        pet.type = a.pet?.type ?? "";
        pet.attack = a.attack * boost;
        pet.defense = a.defense;
        pet.currentHp = a.hp;
        pet.totalHp = a.hp;
        pet.level = a.level;
        pet.currentExp = a.exp;
        pet.totalExp = a.exp;
        pet.speed = a.speed * boost;
        pet.sleepTurns = 0;

        // Skill mặc định
        pet.skills.push(this.createSkillState({
            id: SkillCode.ATTACK,
            damage: 30,
            skillType: SkillType.ATTACK,
            type: a.pet?.type ?? "",
            accuracy: 100,
            powerPoints: 9999
        }));

        // Skill trang bị
        a.equipped_skills.forEach(skillData => {
            const skillBoost = String(skillData.element_type) === String(this.currentEnviroment) ? this.rationIncreaseDame : 1;
            pet.skills.push(this.createSkillState({
                id: skillData.skill_code,
                damage: skillData.damage * skillBoost,
                skillType: skillData.skill_type,
                type: skillData.element_type,
                accuracy: skillData.accuracy,
                powerPoints: skillData.power_points
            }));
        });

        return pet;
    }

    private createSkillState(data: {
        id: string,
        damage: number,
        skillType: SkillType,
        type: string,
        accuracy: number,
        powerPoints: number
    }): SkillState {
        const skill = new SkillState();
        skill.id = data.id;
        skill.damage = data.damage;
        skill.skillType = data.skillType;
        skill.type = data.type;
        skill.accuracy = data.accuracy;
        skill.currentPowerPoint = data.powerPoints;
        skill.totalPowerPoint = data.powerPoints;
        return skill;
    }

    private startBattle(): void {
        this.battleState = BattleState.READY;
        const playersBattleData = JSON.stringify(
            Array.from(this.state.battlePlayers.values()).map(p => this.serializeBattlePlayer(p))
        );

        this.broadcast(MessageTypes.BATTE_READY, {
            playersBattleData,
            enviromentType: this.currentEnviroment
        });
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
        this.battleState = BattleState.BATTLE;
        const [p1Entry, p2Entry] = Array.from(this.state.battlePlayers.entries());
        const [p1Id, p1] = p1Entry;
        const [p2Id, p2] = p2Entry;

        const a1 = this.playerActions.get(p1Id);
        const a2 = this.playerActions.get(p2Id);

        if (!a1 || !a2) {
            console.warn("One or both players have not submitted their action.");
            return;
        }

        const pet1 = p1.pets[p1.activePetIndex];
        const pet2 = p2.pets[p2.activePetIndex];

        const turnOrder = [
            { clientId: p1Id, player: p1, action: a1, pet: pet1 },
            { clientId: p2Id, player: p2, action: a2, pet: pet2 }
        ].sort((a, b) => {
            const skillA = a.action.type === "attack" ? a.pet.skills[a.action.skillIndex] : undefined;
            const skillB = b.action.type === "attack" ? b.pet.skills[b.action.skillIndex] : undefined;

            // Ưu tiên DEFENSE
            const isA_Defense = skillA?.skillType === SkillType.DEFENSE ? 1 : 0;
            const isB_Defense = skillB?.skillType === SkillType.DEFENSE ? 1 : 0;

            if (isB_Defense !== isA_Defense) {
                return isB_Defense - isA_Defense; // DEFENSE đi trước
            }

            // Sau đó xét speed
            if (b.pet.speed !== a.pet.speed) {
                return b.pet.speed - a.pet.speed;
            }

            // Nếu bằng nhau hết thì random
            return Math.random() < 0.5 ? -1 : 1;
        });

        const first = turnOrder[0];
        const second = turnOrder[1];

        if (first.action.type === "attack") {
            const result1 = await this.executeAttack(first, second);
            const resultMessage1 = {
                playerAttackTurn1: this.serializeBattlePlayer(first.player),
                skillAttackTurn1: result1.skill,
                effectValueTurn1: result1.effectValue,
                damageTurn1: result1.damage,
                playerDefenseTurn1: this.serializeBattlePlayer(second.player),
            };
            const result2 = await this.executeAttack(second, first);
            const resultMessage2 = {
                playerAttackTurn2: this.serializeBattlePlayer(second.player),
                skillAttackTurn2: result2.skill,
                effectValueTurn2: result2.effectValue,
                damageTurn2: result2.damage,
                playerDefenseTurn2: this.serializeBattlePlayer(first.player),
            };
            const combinedResultMessage = {
                turn1: resultMessage1,
                turn2: resultMessage2,
            };
            this.broadcast(MessageTypes.RESULT_SKILL, combinedResultMessage);


        }
        else if (first.action.type === "switch") {
            this.handleSwitch(first);
            this.handleSwitch(second);
        }


        this.playerActions.clear();
    }

    async executeAttack(
        attacker: { pet: PetState; action: PlayerAction },
        defender: { pet: PetState; action: PlayerAction }
    ): Promise<{ skill: SkillState | null; damage: number, effectValue: number }> {
        if (attacker.pet.isDead || defender.pet.isDead) {
            return { skill: null, damage: 0, effectValue: 0 };
        }

        if (attacker.pet.sleepTurns > 0) {
            attacker.pet.sleepTurns--;
            return { skill: null, damage: 0, effectValue: 0 };
        }

        if (!isAttackAction(attacker.action)) {
            return { skill: null, damage: 0, effectValue: 0 };
        }

        const skill = attacker.pet.skills[attacker.action.skillIndex];
        if (!skill || skill.currentPowerPoint <= 0) {
            return { skill, damage: 0, effectValue: 0 };
        }

        // Trừ PowerPoint
        skill.currentPowerPoint--;
        attacker.pet.isSleeping = false;
        const skillType = skill.skillType as SkillType;
        const handler = SkillHandlerFactory.create(skillType, this.calculateDamage.bind(this));

        const { damage, effectValue } = handler.handle(
            attacker.pet,
            defender.pet,
            attacker.action,
            defender.action,
            skill
        );

        return { skill, damage, effectValue };
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

    private battleIsFinished(loser: PlayerBattleState) {
        const opponent = [...this.state.battlePlayers.values()]
            .find(p => p.id !== loser.id);

        this.broadcast(MessageTypes.BATTLE_FINISHED, {
            winnerId: opponent?.id ?? null,
            loserId: loser.id,
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
                this.battleState = BattleState.FINISHED;
                // ❌ Người chơi này thua → xác định người chơi còn lại thắng
                this.battleIsFinished(player);
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
            (((2 * attacker.level) / 5 + 2) * skill.damage * (attack / (defense + 1))) / 50 + 2
        );

        const effectiveness = this.getTypeEffectiveness(attacker.type, defender.type);
        const finalDamage = Math.floor(baseDamage * effectiveness);

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
            isSleeping: pet.isSleeping,
            skills: pet.skills.map(skill => this.serializeSkill(skill))
        };
    }

    private serializeSkill(skill: SkillState) {
        return {
            id: skill.id,
            attack: skill.damage,
            accuracy: skill.accuracy,
            type: skill.type,
            currentPowerPoint: skill.currentPowerPoint,
            totalPowerPoint: skill.totalPowerPoint,
            skillType: skill.skillType,
        };
    }

    getEnvironment(roomName: string): EnvironmentType {
        switch (roomName) {
            case 'hn1':
            case 'hn1-office':
            case 'vinh':
            case 'vinh-office':
            case 'sg':
            case 'sg-office':
                return EnvironmentType.GRASS;
            case 'hn2':
            case 'hn2-office':
            case 'qn':
            case 'qn-office':
                return EnvironmentType.ICE;
            case 'hn3':
            case 'hn3-office':
            case 'dn':
            case 'dn-office':
                return EnvironmentType.WATER;
            default:
                return EnvironmentType.GRASS;
                break;
        }
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
export { PlayerAction };

