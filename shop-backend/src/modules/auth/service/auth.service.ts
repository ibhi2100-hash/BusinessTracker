import bcrypt from "bcryptjs";
import { signAccessTokenWithExpiry, signRefreshTokenWithExpiry} from "../../../helpers/jwtHelper/jwthelper.js";
import { AuthRepository } from "../repository/auth.repository.js";
import { LoginDto } from "../dto/login.dto.js";
import { RegisterDto } from "../dto/register.dto.js";
import { User } from "../entity/user.js";


export class AuthService {
  constructor(private authRepo: AuthRepository) {}
async registerUser(
    dto: RegisterDto
  ){
    const existingUser = await this.authRepo.findByEmail(dto.email!);

    if (existingUser) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const userData = {
      ...dto,
      password: hashedPassword,
    };

    const user = await this.authRepo.createUser(userData);
    
    const { token, expiresIn } = signAccessTokenWithExpiry(
      user.id,
      user.email,
      user.role,
    );
    const { token: refreshToken, expiresIn: refreshExpiresIn } = signRefreshTokenWithExpiry(
      user.id,
      user.email,
      user.role,
    );

    return { 
        user,
        token,
        expiresIn,
        refreshToken,
        refreshExpiresIn
     };
  }

  async loginUser(
    dto: LoginDto
  ): Promise<{
    user: User;
    token: string;
    expiresIn: number;
    refreshToken: string;
    refreshExpiresIn: number;
    activeBranch: any;
    branches: any[];
    business: any;
  }> {
    const user = await this.authRepo.findByEmail(dto.email!);

    if (!user) {
      throw new Error("User not found");
    }
    if(!user.businessId) {
      throw new Error("Onboarding not completed. Please complete onboarding to proceed.");
    }
    
    const business = await this.authRepo.findBusiness(user.id)

    const isPasswordValid = await bcrypt.compare(
      dto.password!,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const session = await this.authRepo.createSession(user.id);

    const accessToken = signAccessTokenWithExpiry(
      user.id,
      user.email,
      user.role,
      user.businessId ?? undefined,
      user.branchId ?? undefined
    );

    const refreshToken = signRefreshTokenWithExpiry(
      user.id,
      user.email,
      user.role,
      user.businessId ?? undefined,
      user.branchId ?? undefined
    );



    // Normal LOGIN FLOW
    const branches = await this.authRepo.getBusinessBranches(user.businessId);
    const activeBranch = branches.find((b) => b.isDefault === true) || branches[0];

      return {
        user,
        token: accessToken.token,
        expiresIn: accessToken.expiresIn,
        refreshToken: refreshToken.token,
        refreshExpiresIn: refreshToken.expiresIn,
        activeBranch,
        branches,
        business,
      }
  
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
}
