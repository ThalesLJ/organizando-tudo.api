import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../../common/interfaces/authenticated-request.interface';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateExpenseDto): Promise<Record<string, unknown>> {
    return this.expensesService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<Record<string, unknown>[]> {
    return this.expensesService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') expenseId: string): Promise<Record<string, unknown>> {
    return this.expensesService.findOne(user.sub, expenseId);
  }

  @Put(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') expenseId: string,
    @Body() dto: UpdateExpenseDto,
  ): Promise<Record<string, unknown>> {
    return this.expensesService.update(user.sub, expenseId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') expenseId: string): Promise<{ success: boolean }> {
    return this.expensesService.remove(user.sub, expenseId);
  }
}
