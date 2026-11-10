import { Module } from '@nestjs/common';

import { HabitModule } from '../habit/habit.module';
import { InsightController } from './insight.controller';
import { InsightService } from './insight.service';

@Module({
  imports: [HabitModule],
  controllers: [InsightController],
  providers: [InsightService],
})
export class InsightModule {}
