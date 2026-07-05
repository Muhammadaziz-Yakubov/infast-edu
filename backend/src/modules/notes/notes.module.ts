import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note, NoteSchema } from './schemas/note.schema';
import { LeadsModule } from '../leads/leads.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Note.name, schema: NoteSchema },
    ]),
    LeadsModule,
    ActivitiesModule,
  ],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService, MongooseModule],
})
export class NotesModule {}
