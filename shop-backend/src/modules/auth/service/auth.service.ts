import bcrypt from "bcryptjs";
import { signToken } from "../../../helpers/jwtHelper/jwthelper.js";
import { AuthRepository } from "../repository/auth.repository.js";
import { LoginDto } from "../dto/login.dto.js";
import { RegisterDto } from "../dto/register.dto.js";
import { User } from "../entity/user.js";


export class AuthService {
    private authRepo: AuthRepository;

    constructor(authRepo: AuthRepository) {
        this.authRepo = authRepo;
    }
    async registerUser(dto: RegisterDto): Promise<{ user: User; token: string } | null> {
       
        const existingUser = await this.authRepo.findByEmail(dto.email!);
        if (existingUser) {
            throw new Error("Email already in use");
        }
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const userData = {
            ...dto,
            password: hashedPassword,
        };
        const user = await this.authRepo.createUser(userData);

        const token = signToken(user.id, user.role, user?.businessId ?? undefined)
       
        return { user, token}
        
    }
    async loginUser(dto: LoginDto): Promise<{user: User; token: string}  | null> {
        const user = await this.authRepo.findByEmail(dto.email!); 
        if (!user) {
            throw new Error("User not found");
        }
        const isPasswordValid = await bcrypt.compare(dto.password!, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }
        const token = signToken(user.id, user.role, user?.businessId ?? undefined);
        
        return { user, token};
    }

    async autoLogin(){
        
    }
}