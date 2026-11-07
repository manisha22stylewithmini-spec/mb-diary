import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { timingSafeEqual } from 'node:crypto';

/*
 * POST /api/blob — gives the editor a short-lived permission to upload ONE file straight to
 * storage (photos, videos, music). The file never passes through this function, so big
 * videos are fine. Only someone holding the edit passcode can get that permission.
 */

function authorised(given: string | null) {
  const expected = process.env.EDIT_KEY ?? '';
  if (!expected || !given || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export async function POST(request: Request) {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        if (!authorised(clientPayload)) {
          await new Promise((r) => setTimeout(r, 500));
          throw new Error('Wrong passcode');
        }
        return {
          allowedContentTypes: ['image/*', 'video/*', 'audio/*'],
          maximumSizeInBytes: 50 * 1024 ** 3, // 50 GB
          addRandomSuffix: false, // file names are content hashes, so re-uploading the same file is a no-op
          allowOverwrite: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(result);
  } catch (e) {
    const message = (e as Error).message;
    return Response.json({ error: message }, { status: message === 'Wrong passcode' ? 401 : 400 });
  }
}
