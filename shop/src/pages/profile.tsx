import ProfileAddressGrid from '@/components/profile/profile-address';
import Card from '@/components/ui/cards/card';
import { useTranslation } from 'next-i18next';
import ProfileForm from '@/components/profile/profile-form';
import ProfileContact from '@/components/profile/profile-contact';
import Seo from '@/components/seo/seo';
import { useUser } from '@/framework/user';
import DashboardLayout from '@/layouts/_dashboard';
import { useContext } from 'react';
import { GlobalContext } from '@/GlobalContext/GlobalContext';
export { getStaticProps } from '@/framework/general.ssr';

const ProfilePage = () => {
  const { t } = useTranslation('common');
  const { me } : any = useUser();
  const {userInfo} = useContext(GlobalContext)
  if (!userInfo) return null;
  console.log("a",me)
  return (
    <>
      <Seo noindex={true} nofollow={true} />
      <div className="w-full overflow-hidden px-1 pb-1">
        <div className="mb-8">
          <ProfileForm user={userInfo} />
          <ProfileContact
            userId={userInfo.id}
            profileId={userInfo.profile?.id!}
            contact={userInfo.profile?.contact!}
          />
        </div>

        <Card className="w-full">
          <ProfileAddressGrid
            userId={userInfo.id}
            //@ts-ignore
            addresses={userInfo.address}
            label={t('text-addresses')}
          />
        </Card>
      </div>
    </>
  );
};

ProfilePage.authenticationRequired = true;

ProfilePage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
export default ProfilePage;
