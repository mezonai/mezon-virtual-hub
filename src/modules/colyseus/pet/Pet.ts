import { Schema, type } from '@colyseus/schema';
import { PetPlayersWithSpeciesDto } from '@modules/pet-players/dto/pet-players.dto';

export class Vec2 extends Schema {
  @type('number') x: number = 0;
  @type('number') y: number = 0;
}

export class Pet extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('string') species: string = '';
  @type('string') roomCode: string = '';
  @type(Vec2) position = new Vec2();
  @type(Vec2) angle = new Vec2();
  @type('boolean') moving: boolean = false;

  areaSizeX: number = 3000;
  areaSizeY: number = 550;

  targetPosition: Vec2 = new Vec2();
  speed: number = 50;
  maxSpeed: number = 100;
  minSpeed: number = 40;
  roomName;

  constructor() {
    super();
  }

  SetDataPet(dto: PetPlayersWithSpeciesDto, nameRoom: string) {
    this.id = dto.id;
    this.name = dto.name ?? '';
    this.species = dto.pet?.species ?? '';
    this.roomCode = dto.room_code ?? '';
    this.convertAreaSize(nameRoom);
    this.position = this.getRandomPosition();
    this.moveRandomly();
  }

  // Chọn vị trí đích ngẫu nhiên mới và bắt đầu di chuyển
  moveRandomly() {
    this.targetPosition = this.getRandomPosition();
    this.randomizeSpeed();
    this.moving = true;
  }

  // Cập nhật vị trí pet tiến dần tới targetPosition
  updateMovement(deltaTime: number = 0.1) {
    if (!this.moving) return;

    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const speedPerTick = this.speed * deltaTime;

    if (dist <= speedPerTick) {
      // Đến đích
      this.position.x = this.targetPosition.x;
      this.position.y = this.targetPosition.y;
      this.moving = false;

      // Gọi move tiếp theo
      this.moveRandomly();
    } else {
      // Di chuyển mượt về phía đích
      const vx = (dx / dist) * speedPerTick;
      const vy = (dy / dist) * speedPerTick;

      this.position.x += vx;
      this.position.y += vy;

      // Cập nhật hướng (góc xoay)
      this.angle.x = dx / dist;
      this.angle.y = dy / dist;
    }
  }

  // Lấy vị trí ngẫu nhiên trong vùng
  getRandomPosition(): Vec2 {
    const pos = new Vec2();
    pos.x = (Math.random() * 2 - 1) * this.areaSizeX;
    pos.y = (Math.random() * 2 - 1) * this.areaSizeY;
    return pos;
  }

  randomizeSpeed() {
    this.speed =
      Math.random() * (this.maxSpeed - this.minSpeed) + this.minSpeed;
  }
  convertAreaSize(roomName: string) {
    switch (roomName) {
      case 'hn1':
      case 'hn2':
      case 'hn3':
      case 'vinh':
      case 'qn':
      case 'dn':
      case 'sg':
        this.areaSizeX = 730;
        this.areaSizeY = 220;
        break;
      case 'sg-office':
        this.areaSizeX = 550;
        this.areaSizeY = 100;
        break;
      case 'hn1-office':
        this.areaSizeX = 1450;
        this.areaSizeY = 80;
        break;
      case 'hn2-office':
        this.areaSizeX = 300;
        this.areaSizeY = 100;
        break;
      case 'hn3-office':
        this.areaSizeX = 870;
        this.areaSizeY = 130;
        break;
      case 'vinh-office':
        this.areaSizeX = 225;
        this.areaSizeY = 110;
        break;
      case 'dn-office':
        this.areaSizeX = 1780;
        this.areaSizeY = 36;
        break;
      default:
        this.areaSizeX = 100;
        this.areaSizeY = 100;
        break;
    }
  }
}
