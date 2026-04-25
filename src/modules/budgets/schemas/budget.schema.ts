import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BudgetDocument = HydratedDocument<Budget>;

@Schema({
  collection: 'Budgets',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
})
export class Budget {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  user_id!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true })
  amout!: number;

  @Prop({ required: true, trim: true, default: 'family' })
  icon!: string;

  @Prop({ required: true, trim: true, default: '#8b5cf6' })
  color!: string;

  created_at!: Date;
  updated_at!: Date;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
