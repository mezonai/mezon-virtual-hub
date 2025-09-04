import { Client } from "colyseus";

export class PlayerSessionManager {
  private static userClients: Map<string, Client> = new Map();

  static register(userId: string, client: Client) {
    this.userClients.set(userId, client);
  }

  static unregister(userId: string) {
    this.userClients.delete(userId);
  }

  static getClient(userId: string): Client | undefined {
    return this.userClients.get(userId);
  }
}
