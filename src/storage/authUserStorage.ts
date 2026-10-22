import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthUser } from "../contexts/AuthContext";

const USER_KEY = "@gico:user";
const TOKEN_KEY = "@gico:token";

export async function saveUser(user: AuthUser) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<AuthUser | null> {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? (JSON.parse(data) as AuthUser) : null;
}

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function removeUserAndToken() {
  await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
}