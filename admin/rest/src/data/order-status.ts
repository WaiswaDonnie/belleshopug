import Router from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import {
  GetParams,
  ManufacturerQueryOptions,
  OrderStatus,
  OrderStatusPaginator,
  OrderStatusQueryOptions,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { orderStatusClient } from '@/data/client/order-status';
import { Config } from '@/config';
import { useEffect } from 'react';
import { useState } from 'react';

export const useCreateOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(orderStatusClient.create, {
    onSuccess: () => {
      Router.push(Routes.orderStatus.list, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ORDER_STATUS);
    },
  });
};

export const useDeleteOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(orderStatusClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ORDER_STATUS);
    },
  });
};

export const useUpdateOrderStatusMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(orderStatusClient.update, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ORDER_STATUS);
    },
  });
};

export const useOrderStatusQuery = ({ slug, language }: GetParams) => {
  const { data, error, isLoading } = useQuery<OrderStatus, Error>(
    [API_ENDPOINTS.ORDER_STATUS, { slug, language }],
    () => orderStatusClient.get({ slug, language })
  );

  return {
    orderStatus: data,
    error,
    loading: isLoading,
  };
};

export const useOrderStatusesQuery = (
  options: Partial<OrderStatusQueryOptions>
) => {
  const { data, error, isLoading } = useQuery<OrderStatusPaginator, Error>(
    [API_ENDPOINTS.ORDER_STATUS, options],
    ({ queryKey, pageParam }) =>
      orderStatusClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
    }
  );
  console.log("Order statuses", data?.data)

  const [statuses, setStatuses] = useState([
    {
      color: "#23b848",
      created_at: "2021-03-08T21:33:52.000Z",
      id:1,language:"en",
      name:"Order Received",
      serial:1,
      slug:"order-received",
      translated_languages:['en'],
      updated_at:"2021-03-08T21:34:04.000Z"
    },
    {
      color: "#d87b64",
      created_at: "2021-03-08T21:33:52.000Z",
      id:2,
      language:"en",
      name:"Order Processing",
      serial:2,
      slug:"order-processing",
      translated_languages:['en'],
      updated_at:"2021-03-08T21:34:04.000Z"
    },
    // {
    //   color: "#d87b64",
    //   created_at: "2021-03-08T21:33:52.000Z",
    //   id:3,
    //   language:"en",
    //   name:"Ready To Dispatch",
    //   serial:3,
    //   slug:"ready-to-dispatch",
    //   translated_languages:['en'],
    //   updated_at:"2021-03-08T21:34:04.000Z"
    // },
    {
      color: "#23b848",
      created_at: "2021-03-08T21:33:52.000Z",
      id:4,
      language:"en",
      name:"Order Dispatched",
      serial:4,
      slug:"order-dispatched",
      translated_languages:['en'],
      updated_at:"2021-03-08T21:34:04.000Z"
    },
    {
      color: "#23b848",
      created_at: "2021-03-08T21:33:52.000Z",
      id:7,
      language:"en",
      name:"Delivered",
      serial:7,
      slug:"delivered",
      translated_languages:['en'],
      updated_at:"2021-03-08T21:34:04.000Z"
    },
  ])



  return {
    orderStatuses: statuses ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};
