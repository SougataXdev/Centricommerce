// SDK initialization

import ImageKit from "imagekit";

export const imagekit = new ImageKit({
    publicKey : String(process.env.IMAGEKIT_PUBLIC_KEY),
    privateKey : String(process.env.IMAGEKIT_PRIVATE_KEY),
    urlEndpoint : "https://ik.imagekit.io/sougata"
});