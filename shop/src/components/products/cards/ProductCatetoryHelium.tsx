import { Image } from '@/components/ui/image';
import cn from 'classnames';
import usePrice from '@/lib/use-price';
import { AddToCart } from '@/components/products/add-to-cart/add-to-cart';
import { useTranslation } from 'next-i18next';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { productPlaceholder } from '@/lib/placeholders';
import CartIcon from '@/components/icons/cart';
import CustomProductDetailsModal from '@/components/ui/modal/customProductDetailsModal';
import {useState,useContext} from 'react';
import { useRouter } from 'next/router';

// import CustomcategoryDetailsModal from '@/components/ui/modal/customcategoryDetailsModal';
type HeliumProps = {
  category: any;
  className?: string;
};

const ProductCategoryHelium: React.FC<HeliumProps> = ({ category, className }) => {
   const router =  useRouter()
  const { t } = useTranslation('common');
  const { name, image,title, album,description,discount, unit, quantity, min_price, max_price, product_type, discountedPrice } =
  category ?? {};
  const { price, basePrice,  } = usePrice({
    amount: Number(category?.totalPrice),
    baseAmount: category?.savedPrice,
  });
  const { price: minPrice } = usePrice({
    amount: min_price,
  });
  const { price: maxPrice } = usePrice({
    amount: max_price,
  });

  const { openModal } = useModalAction();
  const [open,setOpen] = useState(false)

  function handleProductQuickView() {
    return setOpen(true);
    // return openModal('PRODUCT_DETAILS', product.slug);
  }

 

  return (
    <article
    onClick={()=>{
        router.push(`products/${name}`)
    }}
      className={cn(
        'product-card w-[300px] cart-type-helium h-full overflow-hidden rounded border border-border-200 bg-light transition-shadow duration-200 hover:shadow-sm',
        className
      )}
    >
      <div
        onClick={handleProductQuickView}
        className="relative flex h-48 w-auto items-center justify-center sm:h-64"
        role="button"
      >
        <span className="sr-only">{t('text-product-image')}</span>
        <Image
          src={category?.imageUrl ?? productPlaceholder}
          alt={title}
          layout="fill"
          objectFit="contain"
          className="product-image "
        />
       
      </div>
      {/* End of product image */}

      <header className="relative p-3 md:p-5 md:py-6">
        <h3
          onClick={handleProductQuickView}
          role="button"
          className="mb-2 truncate text-sm font-semibold text-heading"
        >
          {name}
        </h3>
        <p className="text-xs text-muted">{quantity}</p>
        {/* End of product info */}

        
      </header>
      {/* <CustomcategoryDetailsModal  onClose={()=>{setOpen(false)}} open={open} category={category}/> */}
    </article>
  );
};

export default ProductCategoryHelium;
