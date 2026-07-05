import { Injectable, ConflictException, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeadSource, LeadSourceDocument } from './schemas/lead-source.schema';
import { CreateLeadSourceDto } from './dto/create-lead-source.dto';

@Injectable()
export class LeadSourcesService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(LeadSource.name)
    private readonly sourceModel: Model<LeadSourceDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedDefaultSources();
  }

  async seedDefaultSources() {
    const defaults = [
      'Instagram', 'Telegram', 'Facebook', 'TikTok', 'Google', 
      'Website', 'Referral', 'Banner', 'Offline', 'Walking', 
      'Event', 'Other'
    ];
    for (const name of defaults) {
      const exists = await this.sourceModel.findOne({ name }).exec();
      if (!exists) {
        await new this.sourceModel({ name }).save();
      }
    }
  }

  async create(dto: CreateLeadSourceDto): Promise<LeadSourceDocument> {
    const existing = await this.sourceModel.findOne({ name: dto.name }).exec();
    if (existing) {
      throw new ConflictException(`Lead source "${dto.name}" already exists`);
    }
    return new this.sourceModel(dto).save();
  }

  async findAll(): Promise<LeadSourceDocument[]> {
    return this.sourceModel.find().exec();
  }

  async findOne(id: string): Promise<LeadSourceDocument> {
    const source = await this.sourceModel.findById(id).exec();
    if (!source) {
      throw new NotFoundException(`Lead source with ID "${id}" not found`);
    }
    return source;
  }

  async remove(id: string): Promise<LeadSourceDocument> {
    const deleted = await this.sourceModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Lead source with ID "${id}" not found`);
    }
    return deleted;
  }
}
