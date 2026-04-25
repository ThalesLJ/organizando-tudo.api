import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget, type BudgetDocument } from './schemas/budget.schema';

@Injectable()
export class BudgetsService {
  constructor(@InjectModel(Budget.name) private readonly budgetModel: Model<BudgetDocument>) {}

  async create(userId: string, dto: CreateBudgetDto): Promise<Record<string, unknown>> {
    const budget = await this.budgetModel.create({
      user_id: new Types.ObjectId(userId),
      name: dto.name,
      amout: dto.amount,
      icon: dto.icon,
      color: dto.color,
    });
    return this.toResponse(budget);
  }

  async findAll(userId: string): Promise<Record<string, unknown>[]> {
    const budgets = await this.budgetModel.find({ user_id: new Types.ObjectId(userId) }).sort({ created_at: -1 });
    return budgets.map((budget) => this.toResponse(budget));
  }

  async findOne(userId: string, budgetId: string): Promise<Record<string, unknown>> {
    const budget = await this.budgetModel.findOne({ _id: budgetId, user_id: new Types.ObjectId(userId) });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return this.toResponse(budget);
  }

  async update(userId: string, budgetId: string, dto: UpdateBudgetDto): Promise<Record<string, unknown>> {
    const budget = await this.budgetModel.findOne({ _id: budgetId, user_id: new Types.ObjectId(userId) });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    if (dto.name !== undefined) {
      budget.name = dto.name;
    }
    if (dto.amount !== undefined) {
      budget.amout = dto.amount;
    }
    if (dto.icon !== undefined) {
      budget.icon = dto.icon;
    }
    if (dto.color !== undefined) {
      budget.color = dto.color;
    }

    await budget.save();
    return this.toResponse(budget);
  }

  async remove(userId: string, budgetId: string): Promise<{ success: boolean }> {
    const result = await this.budgetModel.deleteOne({ _id: budgetId, user_id: new Types.ObjectId(userId) });
    if (!result.deletedCount) {
      throw new NotFoundException('Budget not found');
    }
    return { success: true };
  }

  private toResponse(budget: BudgetDocument): Record<string, unknown> {
    return {
      id: String(budget._id),
      userId: String(budget.user_id),
      name: budget.name,
      amount: budget.amout,
      icon: budget.icon,
      color: budget.color,
      createdAt: budget.created_at,
      updatedAt: budget.updated_at,
    };
  }
}
