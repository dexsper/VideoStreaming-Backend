import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IPagination } from '../common/pagination';

import { CreateCommentDto } from './comment.dto';
import { CommentEntity } from './comment.entity';
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

  async getVideoComments(
    videoId: number,
    page: number,
  ): Promise<IPagination<CommentEntity>> {
    const limit = 10;
    const offset = 10 * page;

    const results = await this._commentsRepository.find({
      relations: ['user'],
      relationLoadStrategy: 'join',
      where: {
        videoId,
        isApproved: true,
      },
      take: limit + 1,
      skip: offset,
    });

    const hasNextPage = results.length > limit;
    if (hasNextPage) {
      results.pop();
    }

    return {
      results,
      hasNextPage,
    };
  }

  async getUnproven(page: number): Promise<IPagination<CommentEntity>> {
    const limit = 10;
    const offset = 10 * page;

    const results = await this._commentsRepository.find({
      relations: ['user'],
      relationLoadStrategy: 'join',
      where: {
        isApproved: false,
      },
      take: limit + 1,
      skip: offset,
    });

    const hasNextPage = results.length > limit;
    if (hasNextPage) {
      results.pop();
    }

    return {
      results,
      hasNextPage,
    };
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
