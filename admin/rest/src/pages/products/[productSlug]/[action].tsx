import Layout from '@/components/layouts/admin';
import CreateOrUpdateProductForm from '@/components/product/product-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useProductQuery } from '@/data/product';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Config } from '@/config';
import { useContext } from 'react';
import { GlobalContext } from '@/GlobalContext/GlobalContext';
import { useEffect } from 'react';
import { useState } from 'react';

export default function UpdateProductPage() {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const { getProductInfo, productInfo, user } = useContext(GlobalContext)
  const [loading, setLoading] = useState(false)
  // const {
  //   product,
  //   isLoading: loading,
  //   error,
  // } = useProductQuery({
  //   slug: query.productSlug as string,
  //   language:
  //     query.action!.toString() === 'edit' ? locale! : Config.defaultLanguage,
  // });

  useEffect(() => {
    if (user) {
    
        console.log("Product sluf",query.productSlug)
        getProductInfo(query.productSlug as string, setLoading)
  
    }

  }, [user])
  if (loading) return <Loader text={t('common:text-loading')} />;
  // if (error) return <ErrorMessage message={error?.message as string} />;
   return (
    <>
      <div className="flex border-b border-dashed border-border-base py-5 sm:py-8">
        <h1 className="text-lg font-semibold text-heading">Edit Product</h1>
      </div>
      <CreateOrUpdateProductForm initialValues={productInfo} />
    </>
  );
}
UpdateProductPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form'])),
  },
});
