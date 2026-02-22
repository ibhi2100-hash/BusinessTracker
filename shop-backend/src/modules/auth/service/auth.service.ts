import bcrypt from "bcryptjs";
import { signTokenWithExpiry } from "../../../helpers/jwtHelper/jwthelper.js";
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
      ...dto
  ,
      password: hashedPassword,
    };

    const user = await this.authRepo.createUser(userData);
    
    const { token, expiresIn } = signTokenWithExpiry(
      user.id,
      user.role,
    );

    return { 
        user,
        token,
        expiresIn,
     };
  }

  async loginUser(
    dto: LoginDto
  ): Promise<{
    user: User;
    token: string;
    expiresIn: number;
    activeBranch: any;
    branches: any[];
  }> {
    const user = await this.authRepo.findByEmail(dto.email!);

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password!,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    if(!user.businessId){
        throw new Error("Business context is missing")
    }
    // load branches for business
    const branches = await this.authRepo.getBusinessBranches(
      user.businessId
    );

    if (!branches.length) {
      throw new Error("No branches found for business");
    }

    // choose active branch (default or first)
    const [activeBranch] = branches;

    if(!activeBranch){
        throw new Error('no Active Branch')
    }

    const { token, expiresIn}= signTokenWithExpiry(
        user.id,
        user.role,
        user.businessId,
        activeBranch.id
    );

    return {
      user,
      token,
      expiresIn,
      activeBranch,
      branches,
    };
  }
}
