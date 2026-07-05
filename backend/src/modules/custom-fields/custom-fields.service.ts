import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomFieldDefinition, CustomFieldDefinitionDocument } from './schemas/custom-field-definition.schema';
import { CreateCustomFieldDefinitionDto } from './dto/create-custom-field-definition.dto';

@Injectable()
export class CustomFieldsService {
  constructor(
    @InjectModel(CustomFieldDefinition.name)
    private readonly fieldModel: Model<CustomFieldDefinitionDocument>,
  ) {}

  async create(dto: CreateCustomFieldDefinitionDto): Promise<CustomFieldDefinitionDocument> {
    const existing = await this.fieldModel.findOne({ key: dto.key }).exec();
    if (existing) {
      throw new ConflictException(`Custom field with key "${dto.key}" already exists`);
    }
    const created = new this.fieldModel(dto);
    return created.save();
  }

  async findAll(): Promise<CustomFieldDefinitionDocument[]> {
    return this.fieldModel.find().exec();
  }

  async findOne(id: string): Promise<CustomFieldDefinitionDocument> {
    const field = await this.fieldModel.findById(id).exec();
    if (!field) {
      throw new NotFoundException(`Custom field with ID "${id}" not found`);
    }
    return field;
  }

  async remove(id: string): Promise<CustomFieldDefinitionDocument> {
    const deleted = await this.fieldModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Custom field with ID "${id}" not found`);
    }
    return deleted;
  }
}
