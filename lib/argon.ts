import * as argon2 from "argon2";

// Konfigurasi default untuk Argon2
const DEFAULT_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
  hashLength: 32,
  saltLength: 16,
  version: 0x13,
};

const HIGH_SECURITY_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 131072,
  timeCost: 4,
  parallelism: 4,
  hashLength: 32,
  saltLength: 16,
  version: 0x13,
};

const TESTING_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 4096,
  timeCost: 2,
  parallelism: 1,
  hashLength: 32,
  saltLength: 16,
  version: 0x13,
};

const getOptions = () => {
  if (process.env.NODE_ENV === "test") {
    return TESTING_OPTIONS;
  }
  if (process.env.NODE_ENV === "production") {
    return HIGH_SECURITY_OPTIONS;
  }
  return DEFAULT_OPTIONS;
};

export const ArgonService = {
  async hash(password: string, options?: argon2.Options): Promise<string> {
    if (!password || password.length === 0) {
      throw new Error("Password cannot be empty");
    }

    try {
      const hashOptions = options || getOptions();
      return await argon2.hash(password, hashOptions);
    } catch (error) {
      console.error("Error hashing password:", error);
      throw new Error("Failed to hash password");
    }
  },

  async verify(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }

    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  },

  async needsRehash(hash: string): Promise<boolean> {
    if (!hash) {
      return true;
    }

    try {
      const options = getOptions();
      return await argon2.needsRehash(hash, options);
    } catch (error) {
      console.error("Error checking rehash:", error);
      return true;
    }
  },

  async hashHighSecurity(password: string): Promise<string> {
    return await this.hash(password, HIGH_SECURITY_OPTIONS);
  },

  async hashForTesting(password: string): Promise<string> {
    return await this.hash(password, TESTING_OPTIONS);
  },

  generateRandomPassword(length: number = 12): string {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  },

  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    message: string;
    details: {
      minLength: boolean;
      hasUppercase: boolean;
      hasLowercase: boolean;
      hasNumber: boolean;
      hasSpecialChar: boolean;
    };
  } {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    const details = {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    };

    let score = 0;
    if (minLength) score++;
    if (hasUppercase) score++;
    if (hasLowercase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;

    const isValid = score >= 4;

    let message = "";
    if (!minLength) message = "Password minimal 8 karakter";
    else if (!hasUppercase) message = "Password harus mengandung huruf besar";
    else if (!hasLowercase) message = "Password harus mengandung huruf kecil";
    else if (!hasNumber) message = "Password harus mengandung angka";
    else if (!hasSpecialChar)
      message = "Password harus mengandung karakter spesial";
    else message = "Password kuat";

    return {
      isValid,
      score,
      message,
      details,
    };
  },

  async hashWithCustomSalt(password: string, salt: Buffer): Promise<string> {
    if (!password || !salt) {
      throw new Error("Password and salt are required");
    }

    try {
      const options = {
        ...DEFAULT_OPTIONS,
        salt,
      };
      return await argon2.hash(password, options);
    } catch (error) {
      console.error("Error hashing with custom salt:", error);
      throw new Error("Failed to hash password with custom salt");
    }
  },

  async extractSalt(hash: string): Promise<string | null> {
    try {
      const parts = hash.split("$");
      if (parts.length >= 5) {
        return parts[4];
      }
      return null;
    } catch (error) {
      console.error("Error extracting salt:", error);
      return null;
    }
  },

  async getHashInfo(hash: string): Promise<{
    type: string;
    version: number;
    memoryCost: number;
    timeCost: number;
    parallelism: number;
    salt: string;
    hashValue: string;
  } | null> {
    try {
      const parts = hash.split("$");
      if (parts.length < 6) return null;

      const type = parts[1];
      const versionPart = parts[2];
      const version = parseInt(versionPart.split("=")[1]);

      const params = parts[3];
      const m = parseInt(params.match(/m=(\d+)/)?.[1] || "0");
      const t = parseInt(params.match(/t=(\d+)/)?.[1] || "0");
      const p = parseInt(params.match(/p=(\d+)/)?.[1] || "0");

      const salt = parts[4];
      const hashValue = parts[5];

      return {
        type,
        version,
        memoryCost: m,
        timeCost: t,
        parallelism: p,
        salt,
        hashValue,
      };
    } catch (error) {
      console.error("Error getting hash info:", error);
      return null;
    }
  },
};

export default ArgonService;