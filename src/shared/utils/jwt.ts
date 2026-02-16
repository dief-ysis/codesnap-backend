import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../../config/index.js";

/** Shape of the data encoded inside a JWT token. */
export interface JwtPayload {
  userId: string;
}

/**
 * Signs a JWT with the configured secret and expiration.
 *
 * @param payload - Data to encode (must include `userId`)
 * @returns The signed JWT string
 */
export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: config.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.JWT_SECRET, options);
}

/**
 * Verifies and decodes a JWT.
 *
 * @param token - The JWT string to verify
 * @returns The decoded payload
 * @throws {JsonWebTokenError} If the token is invalid or expired
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
}
