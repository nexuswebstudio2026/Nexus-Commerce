import { User, UserRole } from './types';

export const TARGET_SUPERADMIN_EMAIL = 'nexuswebstudio2026@gmail.com';

/**
 * Searches for a user with the target email in the users array and assigns them the 'superadmin' role.
 * If the user does not exist in the list yet, it adds them as a superadmin.
 */
export function enforceSuperadminRole(users: User[], targetEmail = TARGET_SUPERADMIN_EMAIL): User[] {
  let found = false;
  const updatedUsers = users.map((u) => {
    if (u.email.toLowerCase() === targetEmail.toLowerCase()) {
      found = true;
      return {
        ...u,
        role: 'superadmin' as const,
      };
    }
    return u;
  });

  if (!found) {
    const newSuperadmin: User = {
      id: `usr-super-${Date.now()}`,
      name: 'Nexus Admin (Superadmin)',
      email: targetEmail,
      role: 'superadmin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      businessIds: ['biz-imperio-lux', 'biz-aura', 'biz-luminary', 'biz-verve'],
      activeBusinessId: 'biz-imperio-lux',
    };
    return [newSuperadmin, ...updatedUsers];
  }

  return updatedUsers;
}

/**
 * Ensures a single user object has the 'superadmin' role if its email matches the target email.
 */
export function ensureUserIsSuperadmin(user: User, targetEmail = TARGET_SUPERADMIN_EMAIL): User {
  if (user.email.toLowerCase() === targetEmail.toLowerCase()) {
    return {
      ...user,
      role: 'superadmin',
    };
  }
  return user;
}
