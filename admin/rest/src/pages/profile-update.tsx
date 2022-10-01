import Layout from '@/components/layouts/app';
import ProfileUpdateFrom from '@/components/auth/profile-update-form';
import ChangePasswordForm from '@/components/auth/change-password-from';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useMeQuery } from '@/data/user';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useContext, useEffect } from 'react';
import { GlobalContext } from '@/GlobalContext/GlobalContext';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { userInfo, getUserInfo,user } = useContext(GlobalContext)
  const { data, isLoading: loading, error } = useMeQuery();
  useEffect(() => {
    if(user){
      getUserInfo()
    }
  },[user])
  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;


 
   return (
    <>
      <div className="flex border-b border-dashed border-border-base py-5 sm:py-8">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-profile-settings')}
        </h1>
      </div>


      <ProfileUpdateFrom me={userInfo} />
      {/* <ChangePasswordForm /> */}
    </>
  );
}
ProfilePage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
