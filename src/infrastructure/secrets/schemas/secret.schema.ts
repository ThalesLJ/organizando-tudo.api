import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SecretDocument = HydratedDocument<Secret>;

@Schema({ collection: 'Secrets', timestamps: true, versionKey: false })
export class Secret {
  @Prop({ required: true, unique: true, trim: true })
  key!: string;

  @Prop({ required: true })
  value!: string;
}

export const SecretSchema = SchemaFactory.createForClass(Secret);
