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
      "name": "Makeup",
      "settings": {
        "isHome": true,
        "layoutType": "classic",
        "productCard": "neon"
      },
      "slug": "makeup",
      "language": "en",
      "icon": "FacialCare",
      "promotional_sliders": [
        {
          "id": "902",
          "original": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/902/offer-5.png",
          "thumbnail": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/902/conversions/offer-5-thumbnail.jpg"
        },
        
        
      ],
      "created_at": "2022-03-08T07:18:25.000Z",
      "updated_at": "2022-09-26T15:23:32.000Z",
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
            // "original": "https://images.unsplash.com/photo-1526045478516-99145907023c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
            "original": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/906/makeup.png",
            "thumbnail": "https://images.unsplash.com/photo-1526045478516-99145907023c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            // "thumbnail": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/906/conversions/makeup-thumbnail.jpg"
          },
          "created_at": "2022-07-17T13:21:55.000000Z",
          "updated_at": "2022-07-17T13:21:55.000000Z"
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
