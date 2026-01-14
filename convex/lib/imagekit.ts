'use node';

import { v } from 'convex/values';
import ImageKit from 'imagekit';
import { action } from '../_generated/server';

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export const uploadImageToImageKit = action({
  args: {
    fileUrl: v.string(),
    fileName: v.string(),
    folderPath: v.string(),
  },
  handler: async (ctx, args) => {
    //upload the image to imagekit
    const result = await imageKit.upload({
      file: args.fileUrl,
      fileName: args.fileName,
      folder: args.folderPath,
    });
    return result;
  },
});
