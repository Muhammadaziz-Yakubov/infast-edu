import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lead, LeadDocument, LeadStatus, LostLeadReason } from './schemas/lead.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ActivitiesService } from '../activities/activities.service';
import { RoundRobinStrategy } from './strategies/round-robin.strategy';
import { LeastBusyStrategy } from './strategies/least-busy.strategy';
import { Role } from '../../common/enums/roles.enum';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async checkDuplicates(phone: string, secondPhone?: string, parentPhone?: string, excludeLeadId?: string): Promise<void> {
    const phonesToCheck = [phone, secondPhone, parentPhone].filter(Boolean) as string[];
    if (phonesToCheck.length === 0) return;

    // 1. Check existing leads
    const leadQuery: any = {
      $or: [
        { phone: { $in: phonesToCheck } },
        { secondPhone: { $in: phonesToCheck } },
        { parentPhone: { $in: phonesToCheck } }
      ],
      isDeleted: { $ne: true }
    };
    if (excludeLeadId) {
      leadQuery._id = { $ne: new Types.ObjectId(excludeLeadId) };
    }
    const duplicateLead = await this.leadModel.findOne(leadQuery).populate('assignedManager', 'fullName').exec();
    if (duplicateLead) {
      const managerName = (duplicateLead.assignedManager as any)?.fullName || 'Noma\'lum';
      throw new ConflictException({
        message: `Telefon raqami mavjud lead bilan mos keldi (Lead: ${duplicateLead.firstName} ${duplicateLead.lastName}, Manager: ${managerName})`,
        duplicateType: 'LEAD',
        duplicateId: duplicateLead._id,
      });
    }

    // 2. Check existing students
    const studentQuery = {
      $or: [
        { phone: { $in: phonesToCheck } },
        { studentPhone: { $in: phonesToCheck } },
        { parentPhone: { $in: phonesToCheck } }
      ],
      role: Role.STUDENT
    };
    const duplicateStudent = await this.userModel.findOne(studentQuery).exec();
    if (duplicateStudent) {
      throw new ConflictException({
        message: `Telefon raqami mavjud faol Talaba bilan mos keldi (Talaba: ${duplicateStudent.fullName})`,
        duplicateType: 'STUDENT',
        duplicateId: duplicateStudent._id,
      });
    }
  }

  async create(dto: CreateLeadDto, createdByUserId: string, ip?: string, strategyName?: 'ROUND_ROBIN' | 'LEAST_BUSY'): Promise<LeadDocument> {
    // 1. Duplicate detection
    await this.checkDuplicates(dto.phone, dto.secondPhone, dto.parentPhone);

    const lead = new this.leadModel({
      ...dto,
      interestedCourse: dto.interestedCourse ? new Types.ObjectId(dto.interestedCourse) : undefined,
      source: dto.source ? new Types.ObjectId(dto.source) : undefined,
      campaign: dto.campaign ? new Types.ObjectId(dto.campaign) : undefined,
      assignedManager: dto.assignedManager ? new Types.ObjectId(dto.assignedManager) : undefined,
      score: 10, // Default initial score
      lastContactAt: new Date(),
      lastActivityAt: new Date(),
    });

    // 2. Auto-assignment strategy
    if (!lead.assignedManager && strategyName) {
      const managers = await this.userModel.find({ role: { $in: [Role.MANAGER, Role.SUPER_ADMIN, Role.RECEPTION] } }).exec();
      if (managers.length > 0) {
        let assignedId: Types.ObjectId | null = null;
        if (strategyName === 'ROUND_ROBIN') {
          const rr = new RoundRobinStrategy(this.leadModel);
          assignedId = await rr.assign(lead, managers);
        } else if (strategyName === 'LEAST_BUSY') {
          const lb = new LeastBusyStrategy(this.leadModel);
          assignedId = await lb.assign(lead, managers);
        }
        if (assignedId) {
          lead.assignedManager = assignedId;
        }
      }
    }

    const saved = await lead.save();

    // Log Activity
    await this.activitiesService.log(
      createdByUserId,
      saved._id.toString(),
      'LEAD_CREATED',
      'Lead',
      undefined,
      `${saved.firstName} ${saved.lastName} yaratildi`,
      ip
    );

    return saved;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    status?: string;
    priority?: string;
    courseId?: string;
    campaignId?: string;
    sourceId?: string;
    isArchived?: boolean;
    hasMeeting?: boolean;
    hasDemo?: boolean;
    hasFollowUp?: boolean;
  }): Promise<{ leads: LeadDocument[]; total: number; page: number; pages: number }> {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Number(query.limit || 10));
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: { $ne: true } };

    // Standard Filters
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.courseId) filter.interestedCourse = new Types.ObjectId(query.courseId);
    if (query.campaignId) filter.campaign = new Types.ObjectId(query.campaignId);
    if (query.sourceId) filter.source = new Types.ObjectId(query.sourceId);
    if (query.isArchived !== undefined) filter.isArchived = String(query.isArchived) === 'true';

    // Search query using indexes or regex
    if (query.search) {
      filter.$or = [
        { firstName: { $regex: query.search, $options: 'i' } },
        { lastName: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
        { parentName: { $regex: query.search, $options: 'i' } },
        { parentPhone: { $regex: query.search, $options: 'i' } },
        { tags: { $in: [query.search] } }
      ];
    }

    // Advanced relational presence checks
    if (query.hasMeeting !== undefined) {
      filter.meetingCount = String(query.hasMeeting) === 'true' ? { $gt: 0 } : 0;
    }
    if (query.hasDemo !== undefined) {
      filter.demoCount = String(query.hasDemo) === 'true' ? { $gt: 0 } : 0;
    }
    if (query.hasFollowUp !== undefined) {
      filter.nextFollowUpAt = String(query.hasFollowUp) === 'true' ? { $ne: null } : null;
    }

    // Sorting
    const sortField = query.sort || 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;
    const sortObj: any = {};
    sortObj[sortField] = sortOrder;

    const leads = await this.leadModel
      .find(filter)
      .populate('interestedCourse', 'name')
      .populate('source', 'name')
      .populate('campaign', 'name')
      .populate('assignedManager', 'fullName avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.leadModel.countDocuments(filter).exec();

    return {
      leads,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<LeadDocument> {
    const lead = await this.leadModel
      .findOne({ _id: new Types.ObjectId(id), isDeleted: { $ne: true } })
      .populate('interestedCourse')
      .populate('source')
      .populate('campaign')
      .populate('assignedManager', 'fullName phone email avatar')
      .exec();

    if (!lead) {
      throw new NotFoundException(`Lead with ID "${id}" not found`);
    }
    return lead;
  }

  async update(id: string, dto: any, updatedByUserId: string, ip?: string): Promise<LeadDocument> {
    const lead = await this.findOne(id);

    // Duplicate check on phone updates
    if (dto.phone && dto.phone !== lead.phone) {
      await this.checkDuplicates(dto.phone, dto.secondPhone || lead.secondPhone, dto.parentPhone || lead.parentPhone, id);
    }

    const originalLead = lead.toObject();

    // Check pipeline status validation
    if (dto.status && dto.status !== lead.status) {
      this.validateStatusTransition(lead.status, dto.status);
      lead.lastActivityAt = new Date();
      if (dto.status === LeadStatus.CONTACTED) {
        lead.contactedAt = new Date();
      }
    }

    // Apply updates
    Object.keys(dto).forEach((key) => {
      if (dto[key] !== undefined) {
        if (key === 'interestedCourse' || key === 'source' || key === 'campaign' || key === 'assignedManager') {
          (lead as any)[key] = dto[key] ? new Types.ObjectId(dto[key]) : undefined;
        } else {
          (lead as any)[key] = dto[key];
        }
      }
    });

    lead.lastActivityAt = new Date();
    const saved = await lead.save();

    // Automatically audit log changed fields
    const changes: string[] = [];
    Object.keys(dto).forEach((key) => {
      const oldVal = originalLead[key];
      const newVal = (saved as any)[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push(`${key}: ${oldVal || 'bo\'sh'} ➔ ${newVal || 'bo\'sh'}`);
      }
    });

    if (changes.length > 0) {
      await this.activitiesService.log(
        updatedByUserId,
        id,
        'LEAD_UPDATED',
        'Lead',
        undefined,
        changes.join(', '),
        ip
      );
    }

    return saved;
  }

  validateStatusTransition(current: LeadStatus, target: LeadStatus) {
    const pipeline = [
      LeadStatus.NEW_LEAD,
      LeadStatus.CONTACTED,
      LeadStatus.MEETING_SCHEDULED,
      LeadStatus.DEMO_LESSON,
      LeadStatus.REGISTERED,
      LeadStatus.CONVERTED,
      LeadStatus.CLOSED
    ];

    const curIndex = pipeline.indexOf(current);
    const tarIndex = pipeline.indexOf(target);

    // CLOSED can be transitioned from any state
    if (target === LeadStatus.CLOSED) return;

    // Normal pipeline progression allows jumping forward or backward by 1 step.
    // Jumps of > 2 steps forward (e.g. from New Lead direct to Converted) are restricted unless registering
    if (tarIndex > curIndex + 2 && target !== LeadStatus.REGISTERED && target !== LeadStatus.CONVERTED) {
      throw new BadRequestException(`Noto'g'ri status o'tishi: ${current} dan ${target} ga sakrash taqiqlangan.`);
    }
  }

  async archive(id: string, userId: string, ip?: string): Promise<LeadDocument> {
    const lead = await this.findOne(id);
    lead.isArchived = true;
    lead.archivedAt = new Date();
    lead.archivedBy = new Types.ObjectId(userId);
    lead.lastActivityAt = new Date();
    const saved = await lead.save();

    await this.activitiesService.log(userId, id, 'LEAD_ARCHIVED', 'Lead', undefined, 'Lead arxivlandi', ip);
    return saved;
  }

  async restore(id: string, userId: string, ip?: string): Promise<LeadDocument> {
    const lead = await this.leadModel.findById(id).exec();
    if (!lead) throw new NotFoundException('Lead topilmadi');
    lead.isArchived = false;
    lead.archivedAt = undefined;
    lead.archivedBy = undefined;
    lead.lastActivityAt = new Date();
    const saved = await lead.save();

    await this.activitiesService.log(userId, id, 'LEAD_RESTORED', 'Lead', undefined, 'Lead arxivdan qaytarildi', ip);
    return saved;
  }

  async remove(id: string, userId: string, ip?: string): Promise<LeadDocument> {
    const lead = await this.findOne(id);
    lead.isDeleted = true;
    lead.deletedAt = new Date();
    lead.deletedBy = new Types.ObjectId(userId);
    lead.lastActivityAt = new Date();
    const saved = await lead.save();

    await this.activitiesService.log(userId, id, 'LEAD_DELETED', 'Lead', undefined, 'Lead o\'chirildi (soft delete)', ip);
    return saved;
  }

  async merge(primaryId: string, secondaryId: string, userId: string, ip?: string): Promise<LeadDocument> {
    const primary = await this.findOne(primaryId);
    const secondary = await this.findOne(secondaryId);

    // Merge core fields if blank
    if (!primary.secondPhone && secondary.phone !== primary.phone) {
      primary.secondPhone = secondary.phone;
    }
    if (!primary.birthDate) primary.birthDate = secondary.birthDate;
    if (!primary.parentName) primary.parentName = secondary.parentName;
    if (!primary.parentPhone) primary.parentPhone = secondary.parentPhone;
    if (!primary.school) primary.school = secondary.school;
    if (!primary.grade) primary.grade = secondary.grade;
    if (!primary.address) primary.address = secondary.address;
    if (!primary.region) primary.region = secondary.region;
    if (!primary.district) primary.district = secondary.district;
    if (!primary.preferredTime) primary.preferredTime = secondary.preferredTime;
    if (!primary.interestedCourse) primary.interestedCourse = secondary.interestedCourse;
    if (!primary.source) primary.source = secondary.source;
    if (!primary.campaign) primary.campaign = secondary.campaign;

    // Combine Tags
    const combinedTags = Array.from(new Set([...primary.tags, ...secondary.tags]));
    primary.tags = combinedTags;

    // Combine Custom Fields
    const customFieldKeys = primary.customFields.map(cf => cf.key);
    secondary.customFields.forEach(cf => {
      if (!customFieldKeys.includes(cf.key)) {
        primary.customFields.push(cf);
      }
    });

    // Sum Counters
    primary.callCount += secondary.callCount;
    primary.meetingCount += secondary.meetingCount;
    primary.demoCount += secondary.demoCount;
    primary.score = Math.max(primary.score, secondary.score) + 5; // bonus score for merged records

    primary.lastActivityAt = new Date();
    const savedPrimary = await primary.save();

    // 2. Transfer all related logs to primary lead
    const db = this.leadModel.db;
    const relatedCollections = ['CallLog', 'Meeting', 'DemoLesson', 'Note', 'Task', 'FollowUp', 'Reminder', 'Attachment', 'Activity'];
    
    const pId = new Types.ObjectId(primaryId);
    const sId = new Types.ObjectId(secondaryId);

    for (const modelName of relatedCollections) {
      try {
        const model = db.model(modelName);
        await model.updateMany({ leadId: sId }, { leadId: pId }).exec();
      } catch (err) {
        // Model might not be loaded yet, skip or log
      }
    }

    // 3. Delete secondary lead
    secondary.isDeleted = true;
    secondary.status = LeadStatus.CLOSED;
    secondary.lostReason = LostLeadReason.OTHER;
    secondary.tags.push('MERGED_DUPLICATE');
    secondary.deletedAt = new Date();
    secondary.deletedBy = new Types.ObjectId(userId);
    await secondary.save();

    await this.activitiesService.log(
      userId,
      primaryId,
      'LEAD_MERGED',
      'Lead',
      undefined,
      `Lead "${secondary.firstName} ${secondary.lastName}" (ID: ${secondaryId}) ushbu lead bilan birlashtirildi.`,
      ip
    );

    return savedPrimary;
  }

  async updateLeadScore(leadId: string | Types.ObjectId, scoreDelta: number): Promise<void> {
    await this.leadModel.findByIdAndUpdate(leadId, {
      $inc: { score: scoreDelta },
      $set: { lastActivityAt: new Date() }
    }).exec();
  }
}
