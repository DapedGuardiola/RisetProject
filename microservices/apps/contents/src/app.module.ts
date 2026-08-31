import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { VideosModule } from './videos/videos.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),DbModule, VideosModule, CommentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
