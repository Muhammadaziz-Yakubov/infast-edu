import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from './schemas/note.schema';
import { LeadsService } from '../leads/leads.service';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name)
    private readonly noteModel: Model<NoteDocument>,
    private readonly leadsService: LeadsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(leadId: string, content: string, authorId: string, ip?: string): Promise<NoteDocument> {
    const lead = await this.leadsService.findOne(leadId);
    if (!lead) throw new NotFoundException('Lead topilmadi');

    const note = new this.noteModel({
      leadId: new Types.ObjectId(leadId),
      author: new Types.ObjectId(authorId),
      date: new Date(),
      content,
    });
    const saved = await note.save();

    await this.leadsService.update(leadId, { lastActivityAt: new Date() }, authorId, ip);

    // Audit Log
    await this.activitiesService.log(
      authorId,
      leadId,
      'NOTE_ADDED',
      'Note',
      undefined,
      `Yangi eslatma yozildi: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
      ip
    );

    return saved;
  }

  async findByLead(leadId: string): Promise<NoteDocument[]> {
    return this.noteModel
      .find({ leadId: new Types.ObjectId(leadId) })
      .populate('author', 'fullName avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async remove(id: string, userId: string, ip?: string): Promise<NoteDocument> {
    const note = await this.noteModel.findById(id).exec();
    if (!note) throw new NotFoundException('Eslatma topilmadi');

    const deleted = await this.noteModel.findByIdAndDelete(id).exec();

    await this.activitiesService.log(
      userId,
      note.leadId.toString(),
      'NOTE_DELETED',
      'Note',
      undefined,
      'Eslatma o\'chirildi',
      ip
    );

    return deleted!;
  }
}
