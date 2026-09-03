import { DEMO_USERS } from '@/mocks/authData';
import { getRolePermissions } from '@/constants/scmPermissions';
import { getAppShell } from '@/types/scm/roles';
import { delay } from '@/utils/error';
import type {
  AuthResponse,
  LoginData,
  RegisterData,
  StoredUser,
  User,
  WorkspaceType,
} from '@/types/auth';

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
    localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
    return DEMO_USERS;
  }

  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    return parsed.map((user) => ({
      ...user,
      role: user.role ?? 'SUPPLY_CHAIN_MANAGER',
    }));
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
    return DEMO_USERS;
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function workspaceFromRole(role: StoredUser['role']): WorkspaceType {
  const shell = getAppShell(role);
  if (shell === 'admin') return 'ADMIN';
  if (shell === 'supplier') return 'SUPPLIER';
  if (shell === 'carrier') return 'CARRIER';
  return 'INTERNAL';
}

function toPublicUser(user: StoredUser): User {
  const orgType =
    user.role === 'SUPPLIER' ? 'SUPPLIER' : user.role === 'CARRIER' ? 'CARRIER' : 'CUSTOMER';
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    team: user.team,
    role: user.role,
    roles: [user.role],
    permissions: [...getRolePermissions(user.role)],
    availableWorkspaces: [workspaceFromRole(user.role)],
    organization: user.organization,
    organizationId: `org-${user.id}`,
    organizationInfo: user.organization
      ? { id: `org-${user.id}`, name: user.organization, type: orgType }
      : undefined,
    organizationType: orgType,
  };
}

function createToken(userId: string): string {
  return `mock_token_${userId}_${Date.now()}`;
}

function parseTokenUserId(token: string): string | null {
  const match = /^mock_token_(.+)_\d+$/.exec(token);
  return match?.[1] ?? null;
}

export async function loginMock(data: LoginData): Promise<AuthResponse> {
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

  return { user: toPublicUser(user), token: createToken(user.id) };
}

export async function registerMock(data: RegisterData): Promise<AuthResponse> {
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
    role: 'SUPPLY_PLANNER',
    organization: 'Logus Nova',
  };

  saveUsers([...users, newUser]);

  return { user: toPublicUser(newUser), token: createToken(newUser.id) };
}

export async function forgotPasswordMock(email: string): Promise<void> {
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

export async function getCurrentUserMock(token: string | null): Promise<User | null> {
  await delay(300);

  if (!token) {
    return null;
  }

  const userId = parseTokenUserId(token);
  if (!userId) {
    return null;
  }

  const users = getStoredUsers();
  const user = users.find((item) => item.id === userId);

  if (!user) {
    return null;
  }

  return toPublicUser(user);
}
