export interface AuthUser {
  uid: string;
  name: string;
  email: string;
}

export interface AuthProvider {
  createSession(idToken: string, expiresInMs: number): Promise<string>;
  verifySession(sessionCookie: string): Promise<AuthUser | null>;
}
