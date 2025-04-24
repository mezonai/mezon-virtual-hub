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
  private mathProblemData = {
    id: "",
    answer: ""
  };

  private aiService = new GoogleGenAI({
    apiKey: configEnv().GOOGLE_GEN_AI_API_KEY,
  });

  override async onCreate() {
    super.onCreate();
    this.state.items.set('car1', new Item(320, -120, 'gokart', ''));
    this.state.items.set('car2', new Item(200, -120, 'gokart', ''));
    this.state.items.set('car3', new Item(-50, -120, 'gokart', ''));
    this.state.items.set('car4', new Item(-166, -120, 'gokart', ''));
    this.state.items.set('car5', new Item(1520, -120, 'gokart', ''));
    this.state.items.set('car6', new Item(1645, -120, 'gokart', ''));

    this.onMessage('answerMath', (client, message) => {
      const { id, answer } = message;
      let response = {
        correct: false,
        userGold: client.userData?.gold
      }

      if (this.mathProblemData.id == id && this.mathProblemData.answer == answer.toString()) {
        if (client.userData) {
          client.userData.gold += 1;
          response.correct = true;
          response.userGold = client.userData.gold;
          this.userRepository.update(client.userData.id, { gold: client.userData.gold });
        }
        client.send("onAnswerMath", response);

      }
      else {
        client.send("onAnswerMath", response);
      }
    });

    this.scheduleQuizBroadcast();
  }

  async onJoin(client: Client<UserEntity>, options: any, auth: any) {
    super.onJoin(client, options, auth);
    const { userData } = client;
    this.logger.log(
      `Player ${userData?.username} joined GameRoom ${this.roomName}, id: ${this.roomId}`,
    );

    // Create player object and set position based on found room or user data
    const player = new Player();
    player.id = client.sessionId;
    player.user_id = userData?.id ?? "";
    player.x = userData?.position_x ?? 0;
    player.y = userData?.position_y ?? 0;
    player.is_show_name = BaseGameRoom.eventData == null;
    player.display_name = userData?.display_name || userData?.username || '';
    player.skin_set = userData?.skin_set?.join('/') || '';

    this.state.players.set(client.sessionId, player);
    this.logger.log(
      `Player ${userData?.username} has position ${player.x} ${player.y}`,
    );

  }


  onLeave(client: Client<UserEntity>) {
    const { userData } = client;
    // User's position is not be saved temporarily
    // if (userData) {
    //   const positionUpdate = {
    //     position_x: Math.floor(
    //       this.state.players.get(client.sessionId)?.x || 0,
    //     ),
    //     position_y: Math.floor(
    //       this.state.players.get(client.sessionId)?.y || 0,
    //     ),
    //   };

    //   this.userRepository.update(userData.id, positionUpdate);
    // }

    super.onLeave(client);
  }

  generateMathProblem(): void {
    const numOptions: number = Math.floor(Math.random() * 2) + 2; // Randomly decide between 2, 3, or 4 numbers
    const numbers: number[] = [];
    let correctAnswer: number;
    const operators: string[] = ['+', '-', '*', '/'];
    const operator: string = operators[Math.floor(Math.random() * operators.length)]; // Randomly choose operator

    // Generate the numbers for the math problem
    for (let i = 0; i < numOptions; i++) {
      numbers.push(Math.floor(Math.random() * 100) + 1); // Random numbers between 1 and 10
    }

    // For multiplication and division, only 2 numbers are used
    if (operator === '*' || operator === '/') {
      // Only 2 numbers for multiplication and division
      numbers.length = 2;
    }

    // Create the math expression and calculate correct answer
    switch (operator) {
      case '+':
        correctAnswer = numbers.reduce((acc: number, num: number) => acc + num, 0);
        break;
      case '-':
        correctAnswer = numbers.reduce((acc: number, num: number) => acc - num);
        break;
      case '*':
        correctAnswer = numbers.reduce((acc: number, num: number) => acc * num, 1);
        break;
      case '/':
        // Ensure division gives an integer result
        const dividend = numbers[0];
        let divisor = numbers[1];

        // Ensure divisor is a divisor of dividend
        while (dividend % divisor !== 0) {
          divisor = Math.floor(Math.random() * 10) + 1;  // Random number between 1 and 10
        }

        correctAnswer = dividend / divisor;
        numbers[1] = divisor; // Update the divisor in the numbers array
        break;
      default:
        correctAnswer = numbers[0];
        break;
    }

    let options: Set<number> = new Set();
    options.add(correctAnswer);

    while (options.size < 4) {
      options.add(Math.floor(Math.random() * 100 * (operator.includes('-') ? (Math.random() < 0.5 ? 1 : -1) : 1)) + 1); // Random wrong answers
    }

    options = new Set([...options].sort(() => Math.random() - 0.5));
    const question: string = `${numbers.join(` ${operator === '/' ? '÷' : operator === '*' ? 'x' : operator} `)} = ?`;

    let data = {
      id: this.generateRandomString(),
      question: question,
      options: [...options].join(', '),
    }
    this.mathProblemData.id = data.id;
    this.mathProblemData.answer = correctAnswer.toString();
    this.logger.log(JSON.stringify(data))
    this.broadcast('mathProblem', data);
  }

  generateRandomString(length: number = 8): string {
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result: string = '';
    const charactersLength: number = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
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
      this.generateMathProblem();
      // this.broadcastQuizQuestion();
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
