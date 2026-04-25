import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense, type ExpenseDocument } from './schemas/expense.schema';

@Injectable()
export class ExpensesService {
  constructor(@InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>) {}

  async create(userId: string, dto: CreateExpenseDto): Promise<Record<string, unknown>> {
    const expense = await this.expenseModel.create({
      user_id: new Types.ObjectId(userId),
      budget_id: new Types.ObjectId(dto.budgetId),
      name: dto.name,
      amount: dto.amount,
      description: dto.description ?? '',
      color: dto.color ?? '#8b5cf6',
    });
    return this.toResponse(expense);
  }

  async findAll(userId: string): Promise<Record<string, unknown>[]> {
    const expenses = await this.expenseModel.find({ user_id: new Types.ObjectId(userId) }).sort({ created_at: -1 });
    return expenses.map((expense) => this.toResponse(expense));
  }

  async findOne(userId: string, expenseId: string): Promise<Record<string, unknown>> {
    const expense = await this.expenseModel.findOne({ _id: expenseId, user_id: new Types.ObjectId(userId) });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return this.toResponse(expense);
  }

  async update(userId: string, expenseId: string, dto: UpdateExpenseDto): Promise<Record<string, unknown>> {
    const expense = await this.expenseModel.findOne({ _id: expenseId, user_id: new Types.ObjectId(userId) });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (dto.budgetId !== undefined) {
      expense.budget_id = new Types.ObjectId(dto.budgetId);
    }
    if (dto.name !== undefined) {
      expense.name = dto.name;
    }
    if (dto.amount !== undefined) {
      expense.amount = dto.amount;
    }
    if (dto.description !== undefined) {
      expense.description = dto.description;
    }
    if (dto.color !== undefined) {
      expense.color = dto.color;
    }

    await expense.save();
    return this.toResponse(expense);
  }

  async remove(userId: string, expenseId: string): Promise<{ success: boolean }> {
    const result = await this.expenseModel.deleteOne({ _id: expenseId, user_id: new Types.ObjectId(userId) });
    if (!result.deletedCount) {
      throw new NotFoundException('Expense not found');
    }
    return { success: true };
  }

  private toResponse(expense: ExpenseDocument): Record<string, unknown> {
    return {
      id: String(expense._id),
      userId: String(expense.user_id),
      budgetId: String(expense.budget_id),
      name: expense.name,
      amount: expense.amount,
      description: expense.description,
      color: expense.color,
      createdAt: expense.created_at,
      updatedAt: expense.updated_at,
    };
  }
}
