import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'goynar-baksho-annual-2026-super-secure-jwt-secret-key-32b';
const secretKey = new TextEncoder().encode(JWT_SECRET);
export const COOKIE_NAME = 'gb_admin_session';

// Password Hashing
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 10);
}

export async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

// JWT Token Creation
export async function createSessionToken(user) {
  // Never put password hash or sensitive internals in JWT
  return new SignJWT({
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

// JWT Verification
export async function verifySessionToken(token) {
  try {
    if (!token) return null;
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (err) {
    return null;
  }
}

// Get current session from Next.js cookies
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

// Role Authorization Helper for Route Handlers
export async function authorizeRequest(allowedRoles = ['ADMIN']) {
  const session = await getServerSession();
  if (!session) {
    return {
      authorized: false,
      status: 401,
      error: 'Authentication required. Please log in.',
      session: null,
    };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      authorized: false,
      status: 403,
      error: `Access forbidden: Role '${session.role}' is not authorized for this action.`,
      session,
    };
  }

  return {
    authorized: true,
    status: 200,
    session,
  };
}
