import { UserEntity } from '@modules/user/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { Player } from '@types';
import { Client } from 'colyseus';
import { BaseGameRoom, Item } from './base-game.room';
import { configEnv } from '@config/env.config';
import { cleanAndStringifyJson, isValidJsonQuiz } from '@libs/utils';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GameRoom extends BaseGameRoom {
  private aiService = new GoogleGenAI({
    apiKey: configEnv().GOOGLE_GEN_AI_API_KEY,
  });

  override onCreate(): void {
      super.onCreate();
      this.state.items.set('car1', new Item(320, -120, 'gokart', ''));
      this.state.items.set('car2', new Item(200, -120, 'gokart', ''));
      this.state.items.set('car3', new Item(-50, -120, 'gokart', ''));
      this.state.items.set('car4', new Item(-166, -120, 'gokart', ''));
      this.state.items.set('car5', new Item(1520, -120, 'gokart', ''));
      this.state.items.set('car6', new Item(1645, -120, 'gokart', ''));
  }

  onJoin(client: Client<UserEntity>, options: any, auth: any) {
    const { userData } = client;
    this.logger.log(
      `Player ${userData?.username} joined GameRoom ${this.roomName}, id: ${this.roomId}`,
    );

    // Create player object and set position based on found room or user data
    const player = new Player();
    player.id = client.sessionId;
    player.x = userData?.position_x ?? 0;
    player.y = userData?.position_y ?? 0;

    player.display_name = userData?.display_name || userData?.username || '';
    player.skin_set = userData?.skin_set?.join('/') || '';

    this.state.players.set(client.sessionId, player);
    this.logger.log(
      `Player ${userData?.username} has position ${player.x} ${player.y}`,
    );

    this.scheduleQuizBroadcast();
  }

  onLeave(client: Client<UserEntity>) {
    const { userData } = client;
    if (userData) {
      const positionUpdate = {
        position_x: Math.floor(
          this.state.players.get(client.sessionId)?.x || 0,
        ),
        position_y: Math.floor(
          this.state.players.get(client.sessionId)?.y || 0,
        ),
      };

      this.userRepository.update(userData.id, positionUpdate);
    }

    if (this.state.players.has(client.sessionId)) {
      this.resetMapItem(client, this.state.players.get(client.sessionId));
      this.state.players.delete(client.sessionId);
    }
    this.logger.log(`Player ${userData?.username} left room ${this.roomName}`);
  }

  async getJSONQuizQuestion() {
    try {
      const { QUIZ_PROMPT_RESPONSE_FORMAT, QUIZ_PROMPT_CONTENT } = configEnv();
      const response = await this.aiService.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: QUIZ_PROMPT_CONTENT + QUIZ_PROMPT_RESPONSE_FORMAT,
      });
      return cleanAndStringifyJson(response.text ?? '');
    } catch (error) {
      this.logger.error('Error fetching trivia question:', error);
      throw error;
    }
  }

  private scheduleQuizBroadcast() {
    setInterval(async () => {
      this.broadcastQuizQuestion();
    }, configEnv().QUIZ_QUESTION_FETCH_INTERVAL_SECONDS * 1000);
  }

  private async broadcastQuizQuestion(attempts = 1) {
    if (attempts > 3) return;
    try {
      const quiz = await this.getJSONQuizQuestion();
      
      if (isValidJsonQuiz(quiz)) {
        const jsonQuiz = JSON.stringify(quiz)
        this.broadcast('quizQuestion', jsonQuiz);
        this.logger.log(`Broadcasted quiz: ${jsonQuiz}`);
        return;
      }

      this.broadcastQuizQuestion(attempts + 1);
    } catch (error) {
      this.logger.error(
        `Failed to fetch quiz question on attempt ${attempts}`,
        error,
      );
      this.broadcastQuizQuestion(attempts + 1);
    }
  }
}
