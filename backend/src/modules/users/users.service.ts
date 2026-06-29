import { Injectable, ConflictException, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../common/enums/roles.enum';
import { UserStatus } from '../../common/enums/status.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const adminEmail = 'muhammadazizyaqubov2@gmail.com';
    const adminPhone = '+998900580007';
    const adminPassword = '27272727';

    try {
      const existingAdmin = await this.userModel.findOne({ email: adminEmail }).exec();
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      if (existingAdmin) {
        // Update password and details
        existingAdmin.password = hashedPassword;
        existingAdmin.role = Role.SUPER_ADMIN;
        existingAdmin.status = UserStatus.ACTIVE;
        await existingAdmin.save();
        console.log(`[Seed] Super Admin user password updated for ${adminEmail}`);
      } else {
        // Check if phone matches someone else, if so we don't want duplicate phone conflict
        const phoneUser = await this.userModel.findOne({ phone: adminPhone }).exec();
        const phoneToUse = phoneUser ? `+998902727273` : adminPhone;

        const newAdmin = new this.userModel({
          fullName: 'Super Admin',
          phone: phoneToUse,
          email: adminEmail,
          password: hashedPassword,
          role: Role.SUPER_ADMIN,
          status: UserStatus.ACTIVE,
        });
        await newAdmin.save();
        console.log(`[Seed] Super Admin user successfully created with email ${adminEmail} and phone ${phoneToUse}`);
      }
    } catch (error) {
      console.error('[Seed] Error seeding admin user:', error);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { email, phone, password } = createUserDto;

    // Check if email or phone already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return newUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password +refreshToken').exec();
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone }).select('+password +refreshToken').exec();
  }

  async findByIdWithSecrets(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+password +refreshToken').exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const updateData = { ...updateUserDto };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    let hashedToken = null;
    if (refreshToken) {
      hashedToken = await bcrypt.hash(refreshToken, 10);
    }
    await this.userModel.findByIdAndUpdate(id, { refreshToken: hashedToken }).exec();
  }

  async remove(id: string): Promise<UserDocument> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return deletedUser;
  }
}
