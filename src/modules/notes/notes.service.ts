import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NoteEncryptionService } from '../../infrastructure/crypto/note-encryption.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note, type NoteDocument } from './schemas/note.schema';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
    private readonly noteEncryptionService: NoteEncryptionService,
  ) {}

  async create(userId: string, dto: CreateNoteDto): Promise<Record<string, unknown>> {
    const note = await this.noteModel.create({
      userId: new Types.ObjectId(userId),
      title: this.noteEncryptionService.encrypt(dto.title),
      content: this.noteEncryptionService.encrypt(dto.content),
      isPublic: dto.isPublic ?? false,
    });
    return this.toResponse(note);
  }

  async findAll(userId: string): Promise<Record<string, unknown>[]> {
    const notes = await this.noteModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
    return notes.map((note) => this.toResponse(note));
  }

  async findOne(userId: string, noteId: string): Promise<Record<string, unknown>> {
    const note = await this.noteModel.findOne({ _id: noteId, userId: new Types.ObjectId(userId) });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return this.toResponse(note);
  }

  async findOnePublic(noteId: string): Promise<Record<string, unknown>> {
    const note = await this.noteModel.findOne({ _id: noteId, isPublic: true });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return this.toResponse(note);
  }

  async update(userId: string, noteId: string, dto: UpdateNoteDto): Promise<Record<string, unknown>> {
    const note = await this.noteModel.findOne({ _id: noteId, userId: new Types.ObjectId(userId) });
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (dto.title !== undefined) {
      note.title = this.noteEncryptionService.encrypt(dto.title);
    }

    if (dto.content !== undefined) {
      note.content = this.noteEncryptionService.encrypt(dto.content);
    }

    if (dto.isPublic !== undefined) {
      note.isPublic = dto.isPublic;
    }

    await note.save();
    return this.toResponse(note);
  }

  async remove(userId: string, noteId: string): Promise<{ success: boolean }> {
    const result = await this.noteModel.deleteOne({ _id: noteId, userId: new Types.ObjectId(userId) });
    if (!result.deletedCount) {
      throw new NotFoundException('Note not found');
    }
    return { success: true };
  }

  private toResponse(note: NoteDocument): Record<string, unknown> {
    const noteId = String(note._id);
    return {
      id: noteId,
      title: this.noteEncryptionService.decrypt(note.title, { noteId, field: 'title' }),
      content: this.noteEncryptionService.decrypt(note.content, { noteId, field: 'content' }),
      isPublic: note.isPublic,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }
}
