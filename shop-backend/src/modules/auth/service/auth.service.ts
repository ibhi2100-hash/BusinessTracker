import bcrypt from "bcryptjs";
import { AuthRepository } from "../repository/auth.repository.js";
import { LoginDto } from "../dto/login.dto.js";
import { RegisterDto } from "../dto/register.dto.js";
import { User } from "../entity/user.js";
import { SessionService } from "./session.service.js";
import { TokenService } from "./token.service.js"

type AuthResult = {
  user: User;
  accessToken: string;
  accessExpiresIn: number;

  refreshToken: string;
  refreshExpiresIn: number;

  activeBranch: any;
  branches: any[];
  business: any;
};

export class AuthService {
    constructor(
    private authRepo: AuthRepository,
    private tokenService: TokenService,
    private sessionService: SessionService
  ) {}
async registerUser(dto: RegisterDto) {

  if (!dto.email) {
    throw new Error("Email is required");
  }

  if (!dto.password) {
    throw new Error("Password is required");
  }

  const existing =
    await this.authRepo.findByEmail(dto.email);

  if (existing) {
    throw new Error("Email already in use");
  }

  const hashedPassword =
    await bcrypt.hash(dto.password, 12);

  const user =
    await this.authRepo.createUser({
      ...dto,
      password: hashedPassword,
    });

  const access =
    this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

  const refresh =
    await this.sessionService.createSession(user);

  return {
    user,
    accessToken: access.token,
    accessExpiresIn: access.expiresIn,
    refreshToken: refresh.token,
    refreshExpiresIn: refresh.expiresIn,
  };
}

  async loginUser(
  dto: LoginDto,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<AuthResult> {

  if (!dto.email) {
    throw new Error("Invalid credentials");
  }

  const user =
    await this.authRepo.findByEmail(dto.email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.password) {
    throw new Error("Invalid credentials");
  }

  if (!dto.password) {
    throw new Error("Invalid credentials");
  }

  const valid =
    await bcrypt.compare(
      dto.password,
      user.password
    );

  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const business =
    await this.authRepo.findBusiness(user.id);

  const access =
    this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      ...(user.businessId && { businessId: user.businessId }),
      ...(user.branchId && { branchId: user.branchId }),
    });

  const refresh =
    await this.sessionService.createSession(
      user,
      metadata?.ipAddress,
      metadata?.userAgent
    );

  let branches: any[] = [];
  let activeBranch: any = null;

  if (user.businessId) {
    branches =
      await this.authRepo.getBusinessBranches(
        user.businessId
      );

    activeBranch =
      branches.find(
        (x) => x.id === user.branchId
      ) ??
      branches.find(
        (x) => x.isDefault
      ) ??
      branches[0] ??
      null;
  }

  return {
    user,

    accessToken:
      access.token,

    accessExpiresIn:
      access.expiresIn,

    refreshToken:
      refresh.token,

    refreshExpiresIn:
      refresh.expiresIn,

    activeBranch,
    branches,
    business,
  };
}
  async getCurrentUser(userId: string) {
  const user = await this.authRepo.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const business = await this.authRepo.findBusiness(user.id);

  // onboarding case
  if (!user.businessId || !user.onboardingCompleted) {
    return {
      user,
      activeBranch: null,
      branches: [],
      business,
    };
  }

  const branches = await this.authRepo.getBusinessBranches(user.businessId);

  const activeBranch =
    branches.find((b) => b.id === user.branchId) || branches[0];

  return {
    user,
    activeBranch,
    branches,
    business,
  };
}

async refreshSession(
  refreshToken: string
) {

  const session =
    await this.sessionService.refresh(
      refreshToken
    );

  const context =
    await this.getCurrentUser(
      session.user.id
    );

  return {
    ...session,

    user:
      context.user,

    business:
      context.business,

    activeBranch:
      context.activeBranch,

    branches:
      context.branches,
  };
}
async logout(
  refreshToken: string
) {
  await this.sessionService.revoke(
    refreshToken
  );
}
}
