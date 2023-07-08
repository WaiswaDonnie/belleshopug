// import { Attachment } from '@/types';
interface Attachment {
  id: number;
  original: string;
  thumbnail: string;
  __typename?: string;
  slug?: string;
}
export function displayImage(
  selectedVariationImage: string | undefined,
  gallery: string[] | undefined | null,
  image: string | undefined
) {
  if (selectedVariationImage) {
    return [selectedVariationImage];
  }
  if (gallery?.length) {
    return gallery;
  }
  if (image) {
    return [image];
  }
  return [];
}
