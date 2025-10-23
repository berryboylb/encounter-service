import bcrypt from "bcryptjs";


export class BcryptHelper {
  private static readonly saltRounds = 10;

  /**
   * Hash a plain text password.
   * @param password - Plain text password to hash
   * @returns A hashed password string
   */
  static async hash(password: string): Promise<string> {
    if (!password) throw new Error("Password is required for hashing");
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare a plain text password with a hashed password.
   * @param password - Plain text password
   * @param hashedPassword - Hashed password stored in DB
   * @returns True if passwords match, false otherwise
   */
  static async compare(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    if (!password || !hashedPassword) return false;
    return bcrypt.compare(password, hashedPassword);
  }

  wouldDoSomething(){
    //
  }
}
