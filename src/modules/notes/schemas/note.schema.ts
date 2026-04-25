import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NoteDocument = HydratedDocument<Note>;

@Schema({ collection: 'Notes', timestamps: true, versionKey: false })
export class Note {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true, default: false })
  isPublic!: boolean;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
