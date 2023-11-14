import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import Button from '@/components/ui/button';
import ProductLoader from '@/components/ui/loaders/product-loader';
import NotFound from '@/components/ui/not-found';
import rangeMap from '@/lib/range-map';
import ProductCard from '@/components/products/cards/card';
import ErrorMessage from '@/components/ui/error-message';
import { useProducts } from '@/framework/product';
import { PRODUCTS_PER_PAGE } from '@/framework/client/variables';
import type { Product } from '@/types';
import InfluencerCard from './cards/influencerCard';
import ProductCategoryCard from './cards/ProductCategoryCard';
 
interface Props {
  limit?: number;
  sortedBy?: string;
  orderBy?: string;
  column?: 'five' | 'auto';
  shopId?: string;
  gridClassName?: string;
  products: Product[] | undefined ;
  isLoading?: boolean;
  error?: any;
  loadMore?: any;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  className?: string;
  combos?: [];
  influencerCombos?:  Product[] | undefined;
  productCategories?:[];
  todayDeals?:[]
}

export function Grid({
  className,
  gridClassName,
  products,
  isLoading,
  error,
  loadMore,
  isLoadingMore,
  hasMore,
  combos,
  influencerCombos,
  limit = PRODUCTS_PER_PAGE,
  productCategories,
  column = 'auto',
  todayDeals
}: Props) {
  const { t } = useTranslation('common');

  if (error) return <ErrorMessage message={error.message} />;

  if (!isLoading && !products?.length) {
    return (
      <div className="min-h-full w-full px-4 pt-6 pb-8 lg:p-8">
        <NotFound text="text-not-found" className="mx-auto w-7/12" />
      </div>
    );
  }

  return (
    <div className={cn('w-full bg-white', className)}>
      <h3 className=" text-lg text-black my-4 font-bold">Product Categories</h3>
      <div className="border-b border-[gray] my-4 "></div>
      <div className='overflow-x-auto'>
        <div
          className={cn(
            {
              'flex w-full  gap-2':
                column === 'auto',
              // 'grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 gap-y-10 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] xl:gap-8 xl:gap-y-11 2xl:grid-cols-5 3xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]':
              // column === 'five',
            },
            gridClassName
          )}
        >
          {!influencerCombos?.length
            ? rangeMap(limit, (i) => (
              <ProductLoader key={i} uniqueKey={`product-${i}`} />
            ))
            : <>
              {productCategories?.map((combo, index) => {
                
                  return (
                    <div className='w-[300px]'>
                      <ProductCategoryCard category={combo} key={index} />
                    </div>
                  )
             
              })}
            </>
          }
        </div>
      </div>
      <h3 className=" text-lg text-black my-4 font-bold">Influencer's Picks</h3>
      <div className="border-b border-[gray] my-4 "></div>
      <div className='overflow-x-auto'>
        <div
          className={cn(
            {
              'flex w-full  gap-2':
                column === 'auto',
              // 'grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 gap-y-10 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] xl:gap-8 xl:gap-y-11 2xl:grid-cols-5 3xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]':
              // column === 'five',
            },
            gridClassName
          )}
        >
          {!influencerCombos?.length
            ? rangeMap(limit, (i) => (
              <ProductLoader key={i} uniqueKey={`product-${i}`} />
            ))
            : <>
              {influencerCombos?.map((combo, index) => {
                if (index <= 5) {
                  return (
                    <div className='w-[300px]'>
                      <InfluencerCard influencer={combo} key={index} />
                    </div>
                  )
                }
              })}
            </>
          }
        </div>
      </div>
      <h3 className=" text-lg text-black my-4 font-bold">Combos</h3>
      <div className="border-b border-black my-4 "></div>
      <div className='overflow-x-auto'>
        <div
          className={cn(
            {
              'flex w-full  gap-2':
                column === 'auto',
              // 'grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 gap-y-10 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] xl:gap-8 xl:gap-y-11 2xl:grid-cols-5 3xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]':
              // column === 'five',
            },
            gridClassName
          )}
        >
          {!combos?.length
            ? rangeMap(limit, (i) => (
              <ProductLoader key={i} uniqueKey={`product-${i}`} />
            ))
            : <>

              {combos?.map((combo, index) => {
                if (index <= 5) {
                  return (

                    <div className='w-[300px]'>
                      <ProductCard product={combo} key={index} />
                    </div>
                  )
                }
              })}
            </>
          }
        </div>
      </div>
      {/* <h3 className=" text-lg text-accent my-4 font-bold">Products</h3>
      <div className="border-b-2 border-accent my-4 "></div>
      <div className='overflow-x-auto'>
        <div
          className={cn(
            {
              'flex w-full  gap-2':
                column === 'auto',
              // 'grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 gap-y-10 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] xl:gap-8 xl:gap-y-11 2xl:grid-cols-5 3xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]':
              // column === 'five',
            },
            gridClassName
          )}
        >
          {isLoading && !products?.length
            ? rangeMap(limit, (i) => (
              <ProductLoader key={i} uniqueKey={`product-${i}`} />
            ))
            : <>
              {products?.map((product, index) => {
                if (index <= 5) {
                  return (
                    <div className='w-[300px]'>
                      <ProductCard product={product} key={product.slug} />

                    </div>
                  )
                }
              })}
            </>
          }
        </div>
      </div> */}
      <h3 className=" text-l text-black my-4 font-bold">Today's Deals</h3>
      <div className="border-b border-black my-4 "></div>
      <div className='overflow-x-auto'>
        <div
          className={cn(
            {
              'flex w-full  gap-2':
                column === 'auto',
              // 'grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 gap-y-10 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] xl:gap-8 xl:gap-y-11 2xl:grid-cols-5 3xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]':
              // column === 'five',
            },
            gridClassName
          )}
        >
          {isLoading && !products?.length
            ? rangeMap(limit, (i) => (
              <ProductLoader key={i} uniqueKey={`product-${i}`} />
            ))
            : <>
              {todayDeals?.map((product, index) => {
                if (index <= 5) {
                  return (
                    <div className='w-[300px]'>
                      <ProductCard product={product} key={index} />

                    </div>
                  )
                }
              })}
            </>
          }
        </div>
      </div>

    </div>
  );
}
interface ProductsGridProps {
  className?: string;
  gridClassName?: string;
  variables?: any;
  column?: 'five' | 'auto';
}
export default function ProductsGrid({
  className,
  gridClassName,
  variables,
  column = 'auto',
}: ProductsGridProps) {
  const { products, loadMore, isLoadingMore, isLoading, hasMore, error } =
    useProducts(variables);

  const productsItem: any = products;
  return (
    <Grid
      products={productsItem}
      loadMore={loadMore}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      error={error}
      className={className}
      gridClassName={gridClassName}
      column={column}
    />
  );
}
