import { Table } from '@/components/ui/table';
import usePrice from '@/lib/use-price';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/lib/locals';
import { Image } from '@/components/ui/image';
import { productPlaceholder } from '@/lib/placeholders';
import { useModalAction } from '@/components/ui/modal/modal.context';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import { getReview } from '@/lib/get-review';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '@/GlobalContext/GlobalContext';

//FIXME: need to fix this usePrice hooks issue within the table render we may check with nested property
const OrderItemList = (_: any, record: any) => {
  const { getProductDetails, productDetails } = useContext(GlobalContext)
  const [name, setName] = useState("")
  const [thumnail, setThumbnail] = useState("")
  useEffect(() => {
    getProductDetails(record.product_id)
  }, [record.product_id])
  useEffect(() => {
    if (productDetails) {
      setName(productDetails?.name)
      setThumbnail(productDetails?.image?.thumbnail)
      record['image'] = {
        thumbnail: productDetails?.image?.thumbnail
      }
    }
  }, [productDetails])

  console.log("record", record)
  const { price } = usePrice({
    amount: record?.unit_price,
  });
  //  let name = productDetails.name !==null?productDetails.name:"";
  if (record?.variation_option_id) {
    const variationTitle = record?.variation_options?.find(
      (vo: any) => vo?.id === record?.variation_option_id
    )['title'];
    setName(`${name} - ${variationTitle}`);
  }
  console.log("record", record)
  return (
    <div className="flex items-center">
      <div className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded">
        <Image
          src={record.image ?? productPlaceholder}
          alt={record.name}
          className="h-full w-full object-cover"
          layout="fill"
        />
      </div>

      <div className="flex flex-col overflow-hidden ltr:ml-4 rtl:mr-4">
        <div className="mb-1 flex space-x-1 rtl:space-x-reverse">
          <Link
            href={Routes.product(record?.slug)}
            className="inline-block overflow-hidden truncate text-sm text-body transition-colors hover:text-accent hover:underline"
            locale={record?.language}
          >
            {record.name}
          </Link>
          <span className="inline-block overflow-hidden truncate text-sm text-body">
            x
          </span>
          <span className="inline-block overflow-hidden truncate text-sm font-semibold text-heading">
            {record.quantity}
          </span>
        </div>
        <span className="mb-1 inline-block overflow-hidden truncate text-sm font-semibold text-accent">
          {record.price}
        </span>
      </div>
    </div>
  );
};
export const OrderItems = ({
  products,
  orderId,
}: {
  products: any;
  orderId: any;
}) => {
  const { t } = useTranslation('common');
  const { alignLeft, alignRight } = useIsRTL();
  const { openModal } = useModalAction();

  const orderTableColumns = [
    {
      title: <span className="ltr:pl-20 rtl:pr-20">{t('text-item')}</span>,
      dataIndex: '',
      key: 'products',
      align: alignLeft,
      width: 250,
      ellipsis: true,
      render: OrderItemList,
    },
    {
      title: t('text-quantity'),
      dataIndex: '',
      key: 'products',
      align: 'center',
      width: 100,
      render: function renderQuantity(pivot: any) {
        return <p className="text-base">{pivot?.quantity}</p>;
      },
    },
    {
      title: t('text-price'),
      dataIndex: '',
      key: 'price',
      align: alignRight,
      width: 100,
      render: function RenderPrice(pivot: any) {
        const { price } = usePrice({
          amount: pivot?.price,
        });
        return <p>{price}</p>;
      },
    },
    {
      title: '',
      dataIndex: '',
      align: alignRight,
      width: 140,
      render: function RenderReview(_: any, record: any) {
        function openReviewModal() {
          openModal('REVIEW_RATING', {
            product_id: record.id,
            shop_id: record.shop_id,
            order_id: orderId,
            name: record.name,
            image: record.image,
            my_review: getReview(record),
            ...(record.pivot?.variation_option_id && {
              variation_option_id: record?.pivot?.variation_option_id,
            }),
          });
        }

        return (
          <button
            onClick={openReviewModal}
            className="cursor-pointer text-sm font-semibold text-body transition-colors hover:text-accent"
          >
            {getReview(record)
              ? t('text-update-review')
              : t('text-write-review')}
          </button>
        );
      },
    },
  ];

  return (
    <Table
      //@ts-ignore
      columns={orderTableColumns}
      data={products}
      rowKey={(record: any) =>
        record?.variation_option_id
          ? record.variation_option_id
          : record.created_at
      }
      className="orderDetailsTable w-full"
      rowClassName="!cursor-auto"
      scroll={{ x: 350, y: 500 }}
    />
  );
};
