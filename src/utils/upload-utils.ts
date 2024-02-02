import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadUtils {
  static customFileName(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = file.mimetype.split('/')[1];
    let originalName = file.originalname.split('.')[0];
    originalName = originalName.replace(/\s/g, '');
    cb(null, originalName + '-' + uniqueSuffix + '.' + fileExtension);
  }

  static destinationPath(req, file, cb) {
    cb(null, './upload/');
  }
}
