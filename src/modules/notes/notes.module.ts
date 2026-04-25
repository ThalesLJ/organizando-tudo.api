import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteEncryptionService } from '../../infrastructure/crypto/note-encryption.service';
import { SessionsModule } from '../sessions/sessions.module';
import { Note, NoteSchema } from './schemas/note.schema';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]), SessionsModule],
  controllers: [NotesController],
  providers: [NotesService, NoteEncryptionService],
})
export class NotesModule {}
