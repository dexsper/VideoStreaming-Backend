import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCommentDto } from './comment.dto';
import { CommentEntity } from './comment.entity';
import { Pagination } from '../common/paginate';
import { VideosService } from '../videos/videos.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly _commentsRepository: Repository<CommentEntity>,
    private readonly _videosService: VideosService,
  ) {}

  async create(createDto: CreateCommentDto, userId: number) {
    const video = await this._videosService.getById(createDto.videoId);

    const newComment = this._commentsRepository.create({
      ...createDto,
      video,
      userId,
      isApproved: false,
    });

    return await this._commentsRepository.save(newComment);
  }

  async getVideoComments(videoId: number, page: number) {
    const [results, total] = await this._commentsRepository.findAndCount({
      relations: ['user'],
      relationLoadStrategy: 'join',
      where: {
        videoId,
        isApproved: true,
      },
      take: 10,
      skip: 10 * page,
    });

    return new Pagination<CommentEntity>({
      results,
      total,
    });
  }

  async getUnproven(page: number) {
    const [results, total] = await this._commentsRepository.findAndCount({
      relations: ['user'],
      relationLoadStrategy: 'join',
      where: {
        isApproved: false,
      },
      take: 10,
      skip: 10 * page,
    });

    return new Pagination<CommentEntity>({
      results,
      total,
    });
  }

  async getById(id: number) {
    const comment = await this._commentsRepository.findOne({
      relations: ['user'],
      relationLoadStrategy: 'join',
      where: {
        id,
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async approve(id: number) {
    const comment = await this.getById(id);
    comment.isApproved = true;

    return await this._commentsRepository.save(comment);
  }
}
