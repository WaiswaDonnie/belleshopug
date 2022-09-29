import type { Type, TypeQueryOptions } from '@/types';
import { useQuery } from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { useRouter } from 'next/router';

export function useTypes(options?: Partial<TypeQueryOptions>) {
  const { locale } = useRouter();

  let formattedOptions = {
    ...options,
    language: locale
  }

  const { data, isLoading, error } = useQuery<Type[], Error>(
    [API_ENDPOINTS.TYPES, formattedOptions],
    ({ queryKey }) => client.types.all(Object.assign({}, queryKey[1]))
  );
  return {
    types: data,
    isLoading,
    error,
  };
}

export function useType(slug: string) {
  const { locale } = useRouter();

  const { data, isLoading, error } = useQuery<Type, Error>(
    [API_ENDPOINTS.TYPES, { slug, language: locale }],
    () => client.types.get({ slug, language: locale! }),
    {
      enabled: Boolean(slug),
    }
  );
  const newBanners =
    {
      "id": 3,
      "name": "Grocery",
      "settings": {
        "isHome": true,
        "layoutType": "classic",
        "productCard": "neon"
      },
      "slug": "grocery",
      "language": "en",
      "icon": "FruitsVegetable",
      "promotional_sliders": [
        {
          "id": "902",
          "original": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/902/offer-5.png",
          "thumbnail": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/902/conversions/offer-5-thumbnail.jpg"
        },
        {
          "id": "903",
          "original": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/903/offer-4.png",
          "thumbnail": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/903/conversions/offer-4-thumbnail.jpg"
        },
        {
          "id": "904",
          "original": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/904/offer-3.png",
          "thumbnail": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/904/conversions/offer-3-thumbnail.jpg"
        },
        {
          "id": "905",
          "original": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/905/offer-2.png",
          "thumbnail": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/905/conversions/offer-2-thumbnail.jpg"
        },
        {
          "id": "906",
          "original": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/906/offer-1.png",
          "thumbnail": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/906/conversions/offer-1-thumbnail.jpg"
        }
      ],
      "created_at": "2021-03-08T07:18:25.000Z",
      "updated_at": "2021-09-26T15:23:32.000Z",
      "translated_languages": [
        "en"
      ],
      "banners": [
        {
          "id": 12,
          "type_id": 1,
          "title": "Belle Beauty Shop",
          "description": "Belle Beauty Shop offers mobile five star beauty products to individuals in Kampala and surrounding areas.",
          "image": {
            "id": 907,
            "original": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/906/makeup.png",
            "thumbnail": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/906/conversions/makeup-thumbnail.jpg"
          },
          "created_at": "2021-07-17T13:21:55.000000Z",
          "updated_at": "2021-07-17T13:21:55.000000Z"
        }
      ]
    }
  
  console.log("data got",data)
  return {
    type: newBanners,
    isLoading,
    error,
  };
}
