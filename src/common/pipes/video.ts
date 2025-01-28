import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';

const MAX_GIGABYTES = 1;

export const videoPipe = () => {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: 'mp4',
    })
    .addMaxSizeValidator({
      maxSize: MAX_GIGABYTES * 1024 * 1024 * 1024,
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });
};
