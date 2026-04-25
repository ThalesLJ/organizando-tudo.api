import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CodeDocument = HydratedDocument<Code>;

@Schema({ collection: 'Codes', timestamps: true, versionKey: false })
export class Code {
  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true })
  codeHash!: string;

  @Prop({ required: true, index: true })
  expiresAt!: Date;
}

export const CodeSchema = SchemaFactory.createForClass(Code);
