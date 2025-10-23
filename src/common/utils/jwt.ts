import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "@/common/utils/envConfig";

export interface TokenPayload {
  sub: string; // Subject (usually user ID)
  email?: string;
  role?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_EXPIRY = "60m"; // adjust to your desired lifetime
const REFRESH_TOKEN_EXPIRY = "7d";

export class JwtHelper {
  /**
   * Generate an access token and refresh token for a given payload.
   * @param payload - User payload to embed in the token
   */
  static generateTokens(payload: TokenPayload): TokenPair {
    const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Verify and decode an access token.
   */
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Verify and decode a refresh token.
   */
  static verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
    } catch {
      return null;
    }
  }

  /**
   * Generate a new access token from a valid refresh token.
   */
  static regenerateAccessToken(refreshToken: string) {
    const decoded = this.verifyRefreshToken(refreshToken);
    if (!decoded) return null;

    // const { iat, exp, ...payload } = decoded; // strip old metadata
    // console.log({ iat, exp });
    // return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    //   expiresIn: ACCESS_TOKEN_EXPIRY,
    // });
  }

  wouldDoSomething() {
    //
  }
}
