import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { StudentsService } from '../students/students.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
    private readonly studentsService: StudentsService,
  ) {}

  async create(dto: any): Promise<EventDocument> {
    const newEvent = new this.eventModel({
      title: dto.title,
      description: dto.description,
      date: new Date(dto.date),
      location: dto.location,
      image: dto.image,
      participants: [],
      attendance: [],
    });
    return newEvent.save();
  }

  async findAll(userId?: string): Promise<any[]> {
    const events = await this.eventModel
      .find()
      .populate('participants', 'fullName avatar email')
      .sort({ date: 1 })
      .exec();

    return events.map((event) => {
      const eObj = event.toObject() as any;
      if (userId) {
        const uId = new Types.ObjectId(userId);
        eObj.isRegistered = event.participants.some(
          (p: any) => (p._id || p).toString() === userId,
        );

        // Find attendance status
        const attRecord = event.attendance.find(
          (a) => a.userId.toString() === userId,
        );
        if (attRecord) {
          eObj.attendanceStatus = attRecord.attended ? 'ATTENDED' : 'MISSED';
        } else {
          eObj.attendanceStatus = 'PENDING';
        }
      }
      return eObj;
    });
  }

  async findOne(id: string): Promise<EventDocument> {
    const event = await this.eventModel
      .findById(id)
      .populate('participants', 'fullName avatar email')
      .exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async register(id: string, userId: string): Promise<any> {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException('Event not found');

    const userObjId = new Types.ObjectId(userId);

    // Check if already registered
    const isAlreadyRegistered = event.participants.some(
      (p) => p.toString() === userId,
    );
    if (isAlreadyRegistered) {
      throw new ConflictException('Already registered for this event');
    }

    event.participants.push(userObjId);
    
    // Add pending attendance slot
    if (!event.attendance.some((a) => a.userId.toString() === userId)) {
      event.attendance.push({
        userId: userObjId,
        attended: false,
        processed: false,
      });
    }

    await event.save();
    return { success: true, message: 'Successfully registered' };
  }

  async unregister(id: string, userId: string): Promise<any> {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException('Event not found');

    event.participants = event.participants.filter(
      (p) => p.toString() !== userId,
    );
    event.attendance = event.attendance.filter(
      (a) => a.userId.toString() !== userId,
    );

    await event.save();
    return { success: true, message: 'Successfully unregistered' };
  }

  async submitAttendance(
    id: string,
    attendanceData: { userId: string; attended: boolean }[],
  ): Promise<any> {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException('Event not found');

    for (const record of attendanceData) {
      const studentUserId = record.userId;
      const newAttended = record.attended;

      // Find existing attendance entry or initialize
      let attEntry = event.attendance.find(
        (a) => a.userId.toString() === studentUserId,
      );

      if (!attEntry) {
        // If not registered but admin is marking attendance, register them first
        const userObjId = new Types.ObjectId(studentUserId);
        if (!event.participants.some((p) => p.toString() === studentUserId)) {
          event.participants.push(userObjId);
        }
        attEntry = {
          userId: userObjId,
          attended: newAttended,
          processed: false,
        };
        event.attendance.push(attEntry);
      }

      // Check if we need to adjust coins
      // 1. If not processed yet, apply full coins (+500 or -500)
      // 2. If already processed, but status changed, apply difference (+1000 or -1000)
      let coinAdjustment = 0;
      if (!attEntry.processed) {
        coinAdjustment = newAttended ? 500 : -500;
        attEntry.processed = true;
      } else if (attEntry.attended !== newAttended) {
        // Status changed: e.g. went from false to true -> +1000 coins (offsetting the old -500 and giving +500)
        // or went from true to false -> -1000 coins
        coinAdjustment = newAttended ? 1000 : -1000;
      }

      attEntry.attended = newAttended;

      if (coinAdjustment !== 0) {
        await this.studentsService.addXpAndCoins(studentUserId, 0, coinAdjustment);
      }
    }

    // Save updated document
    event.markModified('attendance');
    await event.save();
    return { success: true, message: 'Attendance submitted successfully' };
  }

  async delete(id: string): Promise<any> {
    const deleted = await this.eventModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Event not found');
    return { success: true };
  }
}
