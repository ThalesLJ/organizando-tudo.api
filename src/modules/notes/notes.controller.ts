import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../../common/interfaces/authenticated-request.interface';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateNoteDto): Promise<Record<string, unknown>> {
    return this.notesService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<Record<string, unknown>[]> {
    return this.notesService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') noteId: string): Promise<Record<string, unknown>> {
    return this.notesService.findOne(user.sub, noteId);
  }

  @Put(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') noteId: string,
    @Body() dto: UpdateNoteDto,
  ): Promise<Record<string, unknown>> {
    return this.notesService.update(user.sub, noteId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') noteId: string): Promise<{ success: boolean }> {
    return this.notesService.remove(user.sub, noteId);
  }
}
