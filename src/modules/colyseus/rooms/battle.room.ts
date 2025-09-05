import { Client } from "colyseus";
import { BaseGameRoom, RoomState } from "./base-game.room";
import { AuthenticatedClient, PetState, PlayerBattleInfo as PlayerBattleState, SkillState } from "@types";
import { MessageTypes } from "../MessageTypes";
import { EviromentType as EnvironmentType, PetType, QuestType, SkillCode, SkillType } from "@enum";
import { isAttackAction, PlayerAction } from "../battle/PlayerAction";
import { SkillHandlerFactory } from "../battle/SkillHandlerFactory";
import { BattlePetPlayersDto } from "@modules/pet-players/dto/pet-players.dto";
import { QuestEventEmitter } from "@modules/player-quest/events/quest.events";

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
    private turnTimer: NodeJS.Timeout | null = null;
    private timeLeft: number = 0;
    timeRemaning: number = 10;
    amountChallenge: number = 0;
    // @Inject() private readonly petPlayersService: PetPlayersService;
    override async onCreate(options: any) {
        if (options?.roomName != null) {
            this.currentEnviroment = this.getEnvironment(options.roomName)
        }

        if (options?.amount != null) {
            this.amountChallenge = options.amount;
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
            this.battleIsFinished(client);
        });
        this.onMessage(MessageTypes.CONFIRM_END_TURN, (client, data) => {
            this.checkEndTurn(client);
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
        // Nếu không có player hoặc trận đấu đã kết thúc thì không xử lý gì
        if (this.battleState === BattleState.FINISHED) return;

        // Nếu đang trong trận, kết thúc trận đấu với player này
        if (this.battleState === BattleState.BATTLE) {
            this.battleIsFinished(client);
            return;
        }
        const player = this.state.battlePlayers.get(client.sessionId);
        if (player == null) return;
        const opponent = this.clients.find(c => c.sessionId !== player.id);
        // Gửi thông báo ngắt kết nối cho đối thủ
        opponent?.send(MessageTypes.DISCONNECTED, { message: "" });

    }


    override async onJoin(client: AuthenticatedClient, options: any, auth: any) {
        const { userData } = client;
        if (!userData?.id) return;

        const petsFromUser = await this.petPlayersService.getPetsForBattle(userData.id);
        if (!petsFromUser) return;

        const newPlayer = this.createPlayerState(client, userData, petsFromUser);
        this.state.battlePlayers.set(client.sessionId, newPlayer);

        if (this.state.battlePlayers.size === 2) {
            this.startBattle();
        }
    }

    private createPlayerState(client: AuthenticatedClient, userData: any, petsFromUser: BattlePetPlayersDto[]): PlayerBattleState {
        const newPlayer = new PlayerBattleState();
        newPlayer.id = client.sessionId;
        newPlayer.user_id = userData.id;
        newPlayer.name = userData.username ?? "";
        newPlayer.isEndTurn = false;
        petsFromUser.forEach((petData, index) => {
            newPlayer.pets[index] = this.createPetState(petData);
        });

        newPlayer.activePetIndex = 0;
        return newPlayer;
    }

    private createPetState(a: BattlePetPlayersDto): PetState {
        const pet = new PetState();
        const boost = String(a.pet.type) === String(this.currentEnviroment) ? this.rationIncreaseDame : 1;
        pet.id = a.id;
        pet.name = a.name ?? "";
        pet.species = a.pet?.species ?? "";
        pet.type = a.pet?.type ?? "";
        pet.attack = a.attack * boost;
        pet.defense = a.defense;
        pet.currentHp = a.hp;
        pet.totalHp = a.hp;
        pet.level = a.level;
        pet.currentExp = a.exp;
        pet.totalExp = a.max_exp;
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
        this.setEndTurn(client, false);
        this.playerActions.set(client.sessionId, action);
        if (this.playerActions.size < 2) {
            client.send(MessageTypes.WAITING_OTHER_USER, { message: "" });
            return;
        }
        this.stopRemaningTimeUsingSkill();
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
            this.sendMessageError();
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


    setEndTurn(client: Client, isEnded: boolean) {
        const player = this.state.battlePlayers.get(client.sessionId);
        if (player) {
            player.isEndTurn = isEnded;
        }
    }

    checkEndTurn(client: Client) {
        this.setEndTurn(client, true);
        // Kiểm tra nếu tất cả player trong phòng đã confirm end turn
        const allConfirmed = Array.from(this.state.battlePlayers.values())
            .every(p => p.isEndTurn);

        if (allConfirmed) {
            this.remainingTimeUsingSkill();
        }
    }

    remainingTimeUsingSkill() {
        this.stopRemaningTimeUsingSkill();
        this.timeLeft = this.timeRemaning;
        this.turnTimer = setInterval(() => {
            this.state.battlePlayers.forEach((player, sessionId) => {
                if (player.isEndTurn) {
                    const client = this.clients.find(c => c.sessionId === sessionId);
                    if (client) {
                        client.send(MessageTypes.TIME_REMAINING_USING_SKILL, this.timeLeft);
                    }
                }
            });

            if (this.timeLeft <= 0) {
                this.stopRemaningTimeUsingSkill();
                this.handleTurnTimeout();
            }
            this.timeLeft--;
        }, 1000);
    }

    private handleTurnTimeout() {
        for (const player of this.state.battlePlayers.values()) {
            if (player.isEndTurn) {
                player.isEndTurn = false;
                const client = this.clients.find(c => c.sessionId === player.id);
                if (client) {
                    client.send(MessageTypes.AUTO_ATTACK, {});
                }
            }
        }
    }

    private stopRemaningTimeUsingSkill() {
        if (this.turnTimer) {
            clearInterval(this.turnTimer);
            this.turnTimer = null;
        }
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
    private async battleIsFinished(loserClient: Client) {
        if (!loserClient) {
            this.sendMessageError();
            return;
        }

        const loser = this.state.battlePlayers.get(loserClient.sessionId);
        if (!loser) {
            this.sendMessageError();
            return;
        }

        // tìm winner (khác với loser)
        const winner = [...this.state.battlePlayers.values()]
            .find(p => p.id !== loser.id);

        if (!winner) {
            this.sendMessageError();
            return;
        }

        // lấy danh sách petIds
        const winnerIds = winner.pets?.map(p => p.id) ?? [];
        const loserIds = loser.pets?.map(p => p.id) ?? [];

        if (winnerIds.length === 0 || loserIds.length === 0) {
            this.sendMessageError();
            return;
        }

        try {
            // tính kết quả trận đấu
            const result = await this.petPlayersService.finalizeBattleResult(winnerIds, loserIds)
            if (!result) {
                this.sendMessageError();
                return;
            }

            // tìm client của winner
            const winnerClient = this.clients.find(c => c.sessionId !== loserClient.sessionId);
            if (!winnerClient) {
                this.sendMessageError();
                return;
            }

            // tính tiền cược (bet)
            await this.calculateBet(loserClient, winnerClient);

            // gửi kết quả cho loser
            loserClient.send(MessageTypes.BATTLE_FINISHED, {
                id: loser.id,
                expReceived: result.expPerLoser ?? 0,
                dimondChallenge: this.amountChallenge ?? 0,
                currentPets: result.losers,
                isWinner: false,
            });

            // gửi kết quả cho winner
            winnerClient.send(MessageTypes.BATTLE_FINISHED, {
                id: winner.id,
                expReceived: result.expPerWinner ?? 0,
                dimondChallenge: this.amountChallenge ?? 0,
                currentPets: result.winners,
                isWinner: true,
            });
            QuestEventEmitter.emitProgress(loserClient?.userData?.id, QuestType.PET_BATTLE, 1);
            QuestEventEmitter.emitProgress(winnerClient?.userData?.id, QuestType.PET_BATTLE, 1);

        } catch (err) {
            this.sendMessageError();
        }
    }

    calculateBet(loserClient: Client, winnerClient: Client) {
        if (loserClient.userData == null || winnerClient.userData == null) {
            return;
        }
        loserClient.userData.diamond -= this.amountChallenge;
        winnerClient.userData.diamond += this.amountChallenge;

        this.userRepository.update(loserClient.userData.id, {
            diamond: loserClient.userData.diamond,
        });
        this.userRepository.update(winnerClient.userData.id, {
            diamond: winnerClient.userData.diamond,
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
                this.battleIsFinished(client);
                return;
            }
        }
        const petIndex = player.pets.findIndex(p => p.id === petId);
        if (petIndex === -1) {
            this.sendMessageError();
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
            (((2 * attacker.level) / 5 + 2) * skill.damage * (attack / (defense + 1))) / 10 + 2
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

    sendMessageError() {
        this.broadcast(MessageTypes.NOTIFY_BATTLE, { message: "Có Lỗi xảy ra, Trò chơi kết thúc" });
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

