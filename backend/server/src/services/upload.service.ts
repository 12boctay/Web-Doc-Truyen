import { getFirebaseBucket } from '../config/firebase';
import crypto from 'crypto';

interface UploadResult {
  url: string;
  filename: string;
}

export async function uploadImages(
  files: Express.Multer.File[],
  folder: string = 'uploads',
): Promise<UploadResult[]> {
  const bucket = getFirebaseBucket();
  if (!bucket) {
    throw { status: 500, message: 'Firebase Storage not configured' };
  }

  const results: UploadResult[] = [];

  for (const file of files) {
    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
    const blob = bucket.file(filename);

    await new Promise<void>((resolve, reject) => {
      const stream = blob.createWriteStream({
        metadata: { contentType: file.mimetype },
        resumable: false,
      });
      stream.on('error', reject);
      stream.on('finish', resolve);
      stream.end(file.buffer);
    });

    await blob.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    results.push({ url, filename });
  }

  return results;
}
