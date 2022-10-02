import React, { useContext, useEffect } from 'react'
import Modal from '@/components/ui/modal/modal';
import Card from '../cards/card';
import Details from '@/components/products/details/details'
import ShopSidebar from '@/components/shops/sidebar';
import ProductsGrid from '@/components/products/grid';
import { Image } from '@/components/ui/image';
import { useWindowSize } from '@/lib/use-window-size';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { productPlaceholder } from '@/lib/placeholders';
import { useRouter } from 'next/router';

import classNames from 'classnames';

import { getStaticPaths, getStaticProps } from '@/framework/shop.ssr';
import { GlobalContext } from '@/GlobalContext/GlobalContext';
import CartCounterButton from '@/components/cart/cart-counter-button';
function CustomShopDetailsModal({ onClose, open, shopInfo,variables }) {
    const router = useRouter();
    const { width } = useWindowSize();
    const { t } = useTranslation('banner');
  
    const isGerman = router.locale === 'de';
    const isBook = router.asPath.includes('/book');
    const { getShopInfo, setShopInfo } = useContext(GlobalContext)
    // useEffect(() => {
    //     if (shop) {
    //         getShopInfo(shop)
    //     }
    // }, [id])
    return (
        <Modal open={open} onClose={()=>{
            onClose()
            setShopInfo({})
        }}>
            <Card className="flex w-screen flex-col">
                {/* <Details product={product} onClose={onClose} /> */}
                <div className="flex flex-col bg-gray-100 lg:flex-row lg:items-start lg:p-8">
                    <ShopSidebar shop={shopInfo} className="sticky top-24 lg:top-28" />

                    <div className="flex w-full flex-col p-4 lg:p-0 ltr:lg:pl-8 rtl:lg:pr-8">
                        <div className="relative h-full w-full overflow-hidden rounded">
                            <Image
                                alt={t('heading')}
                                src={shopInfo?.cover_image?.original! ?? productPlaceholder}
                                layout="responsive"
                                width={2340}
                                height={870}
                                className="h-full w-full"
                            />
                        </div>
                         {shopInfo && ( 
                        <ProductsGrid
                            className="py-8"
                            gridClassName={classNames(
                                'grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3',
                                {
                                    'gap-6 md:gap-8': isBook,
                                },
                                {
                                    'md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-[repeat(auto-fill,minmax(270px,1fr))]':
                                        isGerman,
                                }
                            )}
                            variables={variables}
                        />
                     )}
                    </div>
                    {width > 1023 && <CartCounterButton />}
                </div>
            </Card>
        </Modal>
    )
}

export default CustomShopDetailsModal