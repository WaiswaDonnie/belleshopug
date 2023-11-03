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
import type { NextPageWithLayout, Product } from '@/types';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '@/GlobalContext/GlobalContext';
import { useRouter } from 'next/router';
import { getLayout as getSiteLayout } from '@/components/layouts/layout';
import CartCounterButton from '@/components/cart/cart-counter-button';
import { ArrowPrevIcon } from '@/components/icons/arrow-prev';


interface Props {
  products:   Product[] | undefined;
  category: string | undefined;
}

export function Grid({
  products,
  category
}: Props) {
  const router = useRouter()
  const column = "auto"
  return (
    <div className={cn('w-full bg-white')}>
      <div className='flex items-center'>
        <Button
          type="button"
          variant="custom"
          onClick={()=>{
            router.back()
          }}
          // className="order-1 text-sm tracking-[0.2px] "
        >
          <ArrowPrevIcon className="w-5" />
          {('Back')}
        </Button>
        <h3 className=" text-lg text-black my-4 font-bold">{category} Products</h3>
      </div>
      <div className="border-b border-[gray] my-4 "></div>
      <div className={cn(
        {
          'grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3':
            column === 'auto',
          'grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 gap-y-10 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] xl:gap-8 xl:gap-y-11 2xl:grid-cols-5 3xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]':
            column === 'five',
        },
      )}>

        {!products?.length
          ? rangeMap(100, (i) => (
            <ProductLoader key={i} uniqueKey={`product-${i}`} />
          ))
          : <>

            {products?.map((combo, index) => {

              return (


                <ProductCard product={combo} key={index} />

              )
            })}
          </>
        }
      </div>




    </div>
  );
}

const ProductsGrid: NextPageWithLayout = () => {
  const { getProductsByname } = useContext(GlobalContext)
  const { query } = useRouter()
  const { productName } = query
  const [products, setProducts] = useState([])

  useEffect(() => {
    if (productName)
      getProductsByname(productName, setProducts)
  }, [productName])


  return (
    <>
      <Grid
        products={products}
        category={productName}
      />
      <CartCounterButton />
    </>
  );
}


const getLayout = (page: React.ReactElement) =>
  getSiteLayout(
    <div className="w-full bg-light">
      <div className="mx-auto min-h-screen max-w-1920 py-10 px-5 xl:py-14 xl:px-16">
        {page}
      </div>
    </div>
  );

ProductsGrid.getLayout = getLayout;
export default ProductsGrid;