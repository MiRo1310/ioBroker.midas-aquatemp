import { createHash } from "crypto";
import { initStore } from "./store";

export function encryptPassword(password: string): void {
	const store = initStore();
	store.encryptedPassword = createHash("md5").update(password).digest("hex");
}
