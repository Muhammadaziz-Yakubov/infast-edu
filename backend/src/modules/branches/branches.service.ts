import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Branch, BranchDocument } from './schemas/branch.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Role } from '../../common/enums/roles.enum';
import { UserStatus } from '../../common/enums/status.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BranchesService {
  constructor(
    @InjectModel(Branch.name) private readonly branchModel: Model<BranchDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateBranchDto): Promise<BranchDocument> {
    // 1. Check if email is already registered
    const existingEmail = await this.userModel.findOne({ email: dto.adminEmail }).exec();
    if (existingEmail) {
      throw new ConflictException('Branch Admin email is already registered');
    }

    // 2. Determine unique phone to use (since user.phone has unique constraint)
    const existingPhone = await this.userModel.findOne({ phone: dto.phone }).exec();
    const phoneToUse = existingPhone ? `admin-${dto.adminEmail}` : dto.phone;

    // 3. Create the Branch Admin user
    const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);
    const adminUser = new this.userModel({
      fullName: dto.adminFullName,
      email: dto.adminEmail,
      phone: phoneToUse,
      password: hashedPassword,
      role: Role.BRANCH_ADMIN,
      status: UserStatus.ACTIVE,
    });
    const savedAdmin = await adminUser.save();

    // 4. Create the Branch
    const branch = new this.branchModel({
      name: dto.name,
      region: dto.region,
      district: dto.district,
      address: dto.address,
      phone: dto.phone,
      status: dto.status || 'ACTIVE',
      adminId: savedAdmin._id,
    });
    const savedBranch = await branch.save();

    // 5. Update the admin user with branchId
    savedAdmin.branchId = savedBranch._id as Types.ObjectId;
    await savedAdmin.save();

    return savedBranch;
  }

  async findAll(
    query: { page?: number; limit?: number; search?: string; status?: string },
    user: any,
  ): Promise<any> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Restrict BRANCH_ADMIN to only see their own branch
    if (user.role === Role.BRANCH_ADMIN) {
      filter.adminId = new Types.ObjectId(user.userId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { region: searchRegex },
        { district: searchRegex },
        { phone: searchRegex },
      ];
    }

    const total = await this.branchModel.countDocuments(filter).exec();
    const branches = await this.branchModel
      .find(filter)
      .populate('adminId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      branches,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: any): Promise<BranchDocument> {
    const branch = await this.branchModel.findById(id).populate('adminId').exec();
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Restrict BRANCH_ADMIN to their own branch
    if (user.role === Role.BRANCH_ADMIN && branch.adminId._id.toString() !== user.userId) {
      throw new ForbiddenException('You do not have access to this branch');
    }

    return branch;
  }

  async update(id: string, dto: UpdateBranchDto, user: any): Promise<BranchDocument> {
    const branch = await this.branchModel.findById(id).exec();
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Restrict edit to SUPER_ADMIN
    if (user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admins can edit branches');
    }

    // Update branch details
    if (dto.name !== undefined) branch.name = dto.name;
    if (dto.region !== undefined) branch.region = dto.region;
    if (dto.district !== undefined) branch.district = dto.district;
    if (dto.address !== undefined) branch.address = dto.address;
    if (dto.phone !== undefined) branch.phone = dto.phone;
    if (dto.status !== undefined) branch.status = dto.status;

    // Update nested admin if provided
    if (dto.adminFullName || dto.adminEmail || dto.adminPassword) {
      const admin = await this.userModel.findById(branch.adminId).exec();
      if (admin) {
        if (dto.adminFullName) admin.fullName = dto.adminFullName;
        if (dto.adminEmail) {
          // Check uniqueness
          const existingEmail = await this.userModel.findOne({ email: dto.adminEmail, _id: { $ne: admin._id } }).exec();
          if (existingEmail) {
            throw new ConflictException('Email already registered for another user');
          }
          admin.email = dto.adminEmail;
        }
        if (dto.adminPassword) {
          admin.password = await bcrypt.hash(dto.adminPassword, 10);
        }
        await admin.save();
      }
    }

    return (await branch.save()).populate('adminId');
  }

  async remove(id: string, user: any): Promise<any> {
    const branch = await this.branchModel.findById(id).exec();
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Restrict delete to SUPER_ADMIN
    if (user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admins can delete branches');
    }

    // 1. Delete associated Branch Admin user
    await this.userModel.findByIdAndDelete(branch.adminId).exec();

    // 2. Unlink any users (students, reception, teachers etc.) connected to this branch
    await this.userModel.updateMany({ branchId: branch._id }, { $unset: { branchId: 1 } }).exec();

    // 3. Delete the Branch itself
    await this.branchModel.findByIdAndDelete(id).exec();

    return { success: true, message: 'Branch and its admin successfully deleted' };
  }
}
