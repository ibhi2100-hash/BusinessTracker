import { Role } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export class AuthRepository {

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
    businessId?: string;
    branchId?: string;
  }) {
    return prisma.user.create({
         data: {
            ...data,
            role: Role.ADMIN
        }
    }
       
    );

  }

  /**
   * Create staff for a business.
   * Admin must supply branchId (optional, defaults to main branch)
   */
  async createStaff(data: {
    name: string;
    email: string;
    password: string;
    adminId: string;
    branchId?: string;
  }) {
    // 1️⃣ Fetch admin
    const admin = await prisma.user.findUnique({
      where: { id: data.adminId },
      include: { business: true, branch: true },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      throw new Error("Only admins can create staff");
    }

    // 2️⃣ Assign branchId
    const branchId = data.branchId || admin.branchId;

    // 3️⃣ Create staff
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: Role.STAFF,
        businessId: admin.businessId, // assign same business
        branchId: branchId,           // assign branch
      },
    });
  }
}
