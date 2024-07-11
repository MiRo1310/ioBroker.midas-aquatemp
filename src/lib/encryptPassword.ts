import { useStore } from "./store";
const store = useStore();
import { createHash } from "crypto";

export function encryptPassword(password: string): void {
	store.encryptedPassword = createHash("md5").update(password).digest("hex");
}
