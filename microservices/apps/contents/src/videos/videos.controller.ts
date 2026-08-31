import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Controller()
export class VideosController {
  constructor(private readonly videosService: VideosService) { }

  @MessagePattern('contents.video.create')
  create(@Payload() createVideoDto: CreateVideoDto) {
    return this.videosService.create(createVideoDto);
  }

  @MessagePattern('contents.videos.findAllId')
  async findAllId() {
    return await this.videosService.findAllId();
  }

  @MessagePattern('contents.videos.findAll')
  findAll(
    @Payload() offset: number
  ) {
    return this.videosService.findAll(offset);
  }

  @MessagePattern('contents.video.findOneVideo')
  findOne(@Payload() id: number) {
    return this.videosService.findOne(id);
  }

  @MessagePattern('contents.video.updateVideo')
  update(@Payload() updateVideoDto: UpdateVideoDto) {
    return this.videosService.update(updateVideoDto.id, updateVideoDto);
  }

  @MessagePattern('contents.video.removeVideo')
  remove(@Payload() id: number) {
    return this.videosService.remove(id);
  }
}
