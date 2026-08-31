import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @MessagePattern('contents.comments.create')
  create(@Payload() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @MessagePattern('contents.comments.simulate')
  async simulate(@Payload() { newComments }: { newComments: CreateCommentDto[] }) {
    console.log("insert hit, [data]", newComments);
    return await this.commentsService.simulate(newComments);
  }

  @MessagePattern('contents.comments.findAllId')
  async findAllId() {
    return await this.commentsService.findAllId();
  }

  @MessagePattern('contents.comments.postComment')
  postComment(@Payload() dto: CreateCommentDto) {
    return this.commentsService.postComment(dto);
  }

  @MessagePattern('findAllComments')
  findAll() {
    return this.commentsService.findAll();
  }

  @MessagePattern('findOneComment')
  findOne(@Payload() id: number) {
    return this.commentsService.findOne(id);
  }

  @MessagePattern('updateComment')
  update(@Payload() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(updateCommentDto.id, updateCommentDto);
  }

  @MessagePattern('removeComment')
  remove(@Payload() id: number) {
    return this.commentsService.remove(id);
  }
}
