import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeadForm, LeadFormDocument } from './schemas/lead-form.schema';
import { Lead, LeadDocument, LeadStatus, LeadPriority } from '../leads/schemas/lead.schema';
import { CreateLeadFormDto } from './dto/create-lead-form.dto';
import { SubmitLeadFormDto } from './dto/submit-lead-form.dto';

@Injectable()
export class LeadFormsService {
  constructor(
    @InjectModel(LeadForm.name) private readonly leadFormModel: Model<LeadFormDocument>,
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
  ) {}

  async create(dto: CreateLeadFormDto): Promise<LeadFormDocument> {
    const form = new this.leadFormModel({
      title: dto.title,
      source: new Types.ObjectId(dto.source),
      description: dto.description,
      interestedCourse: dto.interestedCourse ? new Types.ObjectId(dto.interestedCourse) : undefined,
    });
    return form.save();
  }

  async findAll(): Promise<LeadFormDocument[]> {
    return this.leadFormModel
      .find()
      .populate('source', 'name')
      .populate('interestedCourse', 'title')
      .sort({ createdAt: -1 })
      .exec();
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.leadFormModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Forma topilmadi');
    }
    return { message: 'Forma muvaffaqiyatli o\'chirildi' };
  }

  async findOnePublic(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Noto'g'ri forma havolasi");
    }
    const form = await this.leadFormModel
      .findById(id)
      .populate('source', 'name')
      .populate('interestedCourse', 'title')
      .exec();

    if (!form || !form.isActive) {
      throw new NotFoundException("Ushbu forma topilmadi yoki faol emas");
    }

    return form;
  }

  async submitPublic(id: string, dto: SubmitLeadFormDto): Promise<{ success: boolean; message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Noto'g'ri forma havolasi");
    }

    const form = await this.leadFormModel.findById(id).exec();
    if (!form || !form.isActive) {
      throw new BadRequestException("Ushbu forma mavjud emas yoki qabul to'xtatilgan");
    }

    // Standardize phone number format
    let cleanPhone = dto.phone.trim();
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }

    // Check if phone number already exists in leads
    const existingLead = await this.leadModel.findOne({
      phone: cleanPhone,
      isDeleted: { $ne: true },
    }).exec();

    if (existingLead) {
      // Update existing lead's details or note
      existingLead.lastActivityAt = new Date();
      if (dto.age && !existingLead.age) existingLead.age = dto.age;
      await existingLead.save();

      // Still increment form submission count
      form.submissionCount = (form.submissionCount || 0) + 1;
      await form.save();

      return {
        success: true,
        message: "Arizangiz ilgari ham qabul qilingan edi. Tez orada menejerimiz qayta bog'lanadi!",
      };
    }

    // Create NEW_LEAD
    const newLead = new this.leadModel({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      phone: cleanPhone,
      age: Number(dto.age),
      source: form.source,
      interestedCourse: dto.interestedCourse ? new Types.ObjectId(dto.interestedCourse) : form.interestedCourse,
      status: LeadStatus.NEW_LEAD,
      priority: LeadPriority.MEDIUM,
      tags: ['Forma orqali', form.title],
    });

    await newLead.save();

    // Increment form submission counter
    form.submissionCount = (form.submissionCount || 0) + 1;
    await form.save();

    return {
      success: true,
      message: "Arizangiz muvaffaqiyatli qabul qilindi! Tez orada siz bilan bog'lanamiz.",
    };
  }
}
