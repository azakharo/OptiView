import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from './data-source';
import { ImageModule } from './modules/images/image.module';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), ImageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
