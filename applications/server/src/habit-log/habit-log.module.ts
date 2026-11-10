import { Module } from '@nestjs/common';

import { HabitLogRepository } from './habit-log.repository';

@Module({
  providers: [HabitLogRepository],
  exports: [HabitLogRepository],
})
export class HabitLogModule {}
