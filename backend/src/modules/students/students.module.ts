import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { StudentProfile, StudentProfileSchema } from './schemas/student-profile.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { Contract, ContractSchema } from './schemas/contract.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentProfile.name, schema: StudentProfileSchema },
      { name: User.name, schema: UserSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Contract.name, schema: ContractSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService, MongooseModule],
})
export class StudentsModule {}
