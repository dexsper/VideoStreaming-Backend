import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';

const MAX_MEGABYTES = 2;

export const imagePipe = () => {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: '.(jpg|jpeg|png|gif|bmp|webp|tiff)',
    })
    .addMaxSizeValidator({
      maxSize: MAX_MEGABYTES * 1024 * 1024,
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });
};
