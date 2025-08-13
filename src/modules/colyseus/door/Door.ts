import { Schema, type } from "@colyseus/schema";

export class Door extends Schema {
    @type("boolean") isOpen: boolean = false;
    @type("string") id: string = "";
}