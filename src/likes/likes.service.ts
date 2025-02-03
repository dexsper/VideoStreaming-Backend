import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LikeEntity } from './like.entity';
import { VideosService } from '../videos/videos.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(LikeEntity)
    private readonly _likesRepository: Repository<LikeEntity>,
    private readonly _videosService: VideosService,
  ) {}

  async createOrUpdateLike(
    videoId: number,
    isNegative: boolean,
    userId: number,
  ): Promise<LikeEntity> {
    const existingLike = await this._likesRepository.findOne({
      where: { videoId, userId },
    });

    if (existingLike) {
      existingLike.isNegative = isNegative;
      return await this._likesRepository.save(existingLike);
    }

    const video = await this._videosService.getById(videoId);
    const newLike = this._likesRepository.create({
      video,
      isNegative,
      userId,
    });

    return await this._likesRepository.save(newLike);
  }

  async getVideoLike(videoId: number, userId: number) {
    const existingLike = await this._likesRepository.findOne({
      where: { videoId, userId },
    });

    if (!existingLike)
      throw new NotFoundException(
        `Like on video with ID: ${videoId} not found`,
      );

    return existingLike;
  }
}
