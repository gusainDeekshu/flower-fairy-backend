import { Module, Global } from '@nestjs/common';
import { AppCacheService } from './cache.service';

@Global()
@Module({
  providers: [AppCacheService],
  exports: [AppCacheService], // Exporting makes it available to other modules
})
export class CommonCacheModule {}