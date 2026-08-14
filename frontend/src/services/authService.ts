import { DEMO_USER } from '@/mocks/authData';
import { delay } from '@/utils/error';
import type {
  AuthResponse,
  LoginData,
  RegisterData,
  StoredUser,
  User,
} from '@/types/auth';

const TOKEN_KEY = 'auth_token';
const USERS_KEY = 'mock_users';

const DEFAULT_DELAY_MS = 800;
const ERROR_CHANCE = 0.05;

function maybeThrowRandomError(): void {
  if (Math.random() < ERROR_CHANCE) {
    throw new Error('Сервис временно недоступен. Попробуйте позже.');
  }
}

function getStoredUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    const initial = [DEMO_USER];
    localStorage.setItem(USERS_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    const initial = [DEMO_USER];
    localStorage.setItem(USERS_KEY, JSON.stringify(initial));
    return initial;
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    team: user.team,
  };
}

function createToken(userId: string): string {
  return `mock_token_${userId}_${Date.now()}`;
}

function parseTokenUserId(token: string): string | null {
  const match = /^mock_token_(.+)_\d+$/.exec(token);
  return match?.[1] ?? null;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(data: LoginData): Promise<AuthResponse> {
  await delay(DEFAULT_DELAY_MS);
  maybeThrowRandomError();

  const users = getStoredUsers();
  const user = users.find(
    (item) => item.email.toLowerCase() === data.email.toLowerCase(),
  );

  if (!user) {
    throw new Error('Пользователь с таким email не найден');
  }

  if (user.password !== data.password) {
    throw new Error('Неверный email или пароль');
  }

  const token = createToken(user.id);
  setToken(token);

  return { user: toPublicUser(user), token };
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  await delay(DEFAULT_DELAY_MS + 200);
  maybeThrowRandomError();

  const users = getStoredUsers();
  const exists = users.some(
    (item) => item.email.toLowerCase() === data.email.toLowerCase(),
  );

  if (exists) {
    throw new Error('Пользователь с таким email уже зарегистрирован');
  }

  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    password: data.password,
    team: data.team?.trim() || undefined,
  };

  saveUsers([...users, newUser]);

  const token = createToken(newUser.id);
  setToken(token);

  return { user: toPublicUser(newUser), token };
}

export async function forgotPassword(email: string): Promise<void> {
  await delay(DEFAULT_DELAY_MS);
  maybeThrowRandomError();

  const users = getStoredUsers();
  const user = users.find(
    (item) => item.email.toLowerCase() === email.toLowerCase(),
  );

  if (!user) {
    throw new Error('Пользователь с таким email не найден');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  await delay(300);

  const token = getToken();
  if (!token) {
    return null;
  }

  const userId = parseTokenUserId(token);
  if (!userId) {
    removeToken();
    return null;
  }

  const users = getStoredUsers();
  const user = users.find((item) => item.id === userId);

  if (!user) {
    removeToken();
    return null;
  }

  return toPublicUser(user);
}

export function logout(): void {
  removeToken();
}
