export const ADMIN_EMAIL = 'hariombhadana795@gmail.com';

export function isAdmin(email: string | undefined | null): boolean {
  return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
