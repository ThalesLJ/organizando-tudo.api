import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema({
  collection: 'Expenses',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
})
export class Expense {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  user_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  budget_id!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: false, trim: true, default: '' })
  description!: string;

  @Prop({ required: false, trim: true, default: '#8b5cf6' })
  color!: string;

  created_at!: Date;
  updated_at!: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
