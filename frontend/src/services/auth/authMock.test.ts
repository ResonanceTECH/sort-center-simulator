import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loginMock, getCurrentUserMock } from '@/services/auth/authMock';
import { removeToken } from '@/services/auth/tokenStorage';

describe('authMock', () => {
  beforeEach(() => {
    removeToken();
    localStorage.removeItem('mock_users');
    vi.spyOn(Math, 'random').mockReturnValue(1);
  });

  it('login returns demo user with mock token', async () => {
    const response = await loginMock({
      email: 'demo@sortcenter.ru',
      password: 'demo123',
      rememberMe: false,
    });

    expect(response.user.email).toBe('demo@sortcenter.ru');
    expect(response.token).toMatch(/^mock_token_/);
  });

  it('login rejects invalid credentials', async () => {
    await expect(
      loginMock({
        email: 'demo@sortcenter.ru',
        password: 'wrong',
        rememberMe: false,
      }),
    ).rejects.toThrow('Неверный email или пароль');
  });

  it('getCurrentUserMock restores user by token', async () => {
    const { token } = await loginMock({
      email: 'demo@sortcenter.ru',
      password: 'demo123',
      rememberMe: false,
    });

    await expect(getCurrentUserMock(token)).resolves.toMatchObject({
      id: 'demo-1',
      name: 'Анна Смирнова',
      email: 'demo@sortcenter.ru',
      team: 'Supply Chain',
      role: 'LOGISTICS_MANAGER',
      roles: ['LOGISTICS_MANAGER'],
      organization: 'ООО Ритейл',
      availableWorkspaces: ['INTERNAL'],
    });
  });
});
