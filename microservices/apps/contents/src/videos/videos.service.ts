import { Injectable, Inject } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import type { DrizzleDB } from 'src/db/drizzle';
import { DRIZZLE } from 'src/db/db.module';
import { videos } from 'src/db/schema';
import { eq } from 'drizzle-orm';
@Injectable()
export class VideosService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB) { }

  create(createVideoDto: CreateVideoDto) {
    return 'This action adds a new video';
  }

  async findAll(offset: number = 0) {
    try {
      return await this.db.transaction(async (tx) => {
        return tx.query.videos.findMany({
          limit: 2,
          offset: offset,
        });
      });
    } catch (e) {
      console.error(e);
    }
  }

  async findAllId() {
    const res = await this.db.select({ video_id: videos.video_id }).from(videos);
    return res.map(v => v.video_id);
  }

  findOne(id: number) {
    return `This action returns a #${id} video`;
  }

  update(id: number, updateVideoDto: UpdateVideoDto) {
    return `This action updates a #${id} video`;
  }

  remove(id: number) {
    return `This action removes a #${id} video`;
  }
}
