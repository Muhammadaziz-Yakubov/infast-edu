import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attachment, AttachmentDocument } from './schemas/attachment.schema';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { LeadsService } from '../leads/leads.service';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name)
    private readonly attachmentModel: Model<AttachmentDocument>,
    private readonly leadsService: LeadsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(dto: CreateAttachmentDto, userId: string, ip?: string): Promise<AttachmentDocument> {
    const lead = await this.leadsService.findOne(dto.leadId);
    if (!lead) throw new NotFoundException('Lead topilmadi');

    const attachment = new this.attachmentModel({
      ...dto,
      leadId: new Types.ObjectId(dto.leadId),
      uploadedBy: new Types.ObjectId(userId),
      uploadedAt: new Date(),
    });
    const saved = await attachment.save();

    await this.leadsService.update(dto.leadId, { lastActivityAt: new Date() }, userId, ip);

    // Audit Log
    await this.activitiesService.log(
      userId,
      dto.leadId,
      'ATTACHMENT_ADDED',
      'Attachment',
      undefined,
      `Fayl yuklandi: "${dto.name}" (Turi: ${dto.type})`,
      ip
    );

    return saved;
  }

  async findByLead(leadId: string): Promise<AttachmentDocument[]> {
    return this.attachmentModel
      .find({ leadId: new Types.ObjectId(leadId) })
      .populate('uploadedBy', 'fullName avatar')
      .sort({ uploadedAt: -1 })
      .exec();
  }

  async remove(id: string, userId: string, ip?: string): Promise<AttachmentDocument> {
    const attachment = await this.attachmentModel.findById(id).exec();
    if (!attachment) throw new NotFoundException('Fayl topilmadi');

    const deleted = await this.attachmentModel.findByIdAndDelete(id).exec();

    await this.activitiesService.log(
      userId,
      attachment.leadId.toString(),
      'ATTACHMENT_DELETED',
      'Attachment',
      undefined,
      `Fayl o'chirildi: "${attachment.name}"`,
      ip
    );

    return deleted!;
  }
}
