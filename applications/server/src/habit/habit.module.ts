import { Module } from '@nestjs/common';

import { HabitLogModule } from '../habit-log/habit-log.module';
import { HabitLogService } from '../habit-log/habit-log.service';
import { HabitController } from './habit.controller';
import { HabitRepository } from './habit.repository';
import { HabitService } from './habit.service';
import { TodayController } from './today.controller';
import { TodayService } from './today.service';

@Module({
  imports: [HabitLogModule],
  controllers: [HabitController, TodayController],
  providers: [HabitRepository, HabitService, HabitLogService, TodayService],
  exports: [HabitRepository, HabitLogModule],
})
export class HabitModule {}
