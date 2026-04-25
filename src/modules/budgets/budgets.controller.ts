import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../../common/interfaces/authenticated-request.interface';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateBudgetDto): Promise<Record<string, unknown>> {
    return this.budgetsService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<Record<string, unknown>[]> {
    return this.budgetsService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') budgetId: string): Promise<Record<string, unknown>> {
    return this.budgetsService.findOne(user.sub, budgetId);
  }

  @Put(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') budgetId: string,
    @Body() dto: UpdateBudgetDto,
  ): Promise<Record<string, unknown>> {
    return this.budgetsService.update(user.sub, budgetId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') budgetId: string): Promise<{ success: boolean }> {
    return this.budgetsService.remove(user.sub, budgetId);
  }
}
