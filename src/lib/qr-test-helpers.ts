import jsQR from "jsqr";
import sharp from "sharp";

export async function decodeQrImage(bytes: Uint8Array, size?: number): Promise<string | undefined> {
  let image = sharp(bytes);
  if (size) image = image.resize(size, size, { fit: "inside" });
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data;
}
