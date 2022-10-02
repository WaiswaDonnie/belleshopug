import { PlusIcon } from '@/components/icons/plus-icon';
import Card from '@/components/ui/cards/card';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import PhoneInput from '@/components/ui/forms/phone-input';
import {useContext, useState} from 'react'
import CustomPhoneModal from '@/components/ui/modal/customPhoneModal'
import { GlobalContext } from '@/GlobalContext/GlobalContext';
interface Props {
  userId: string;
  profileId: string;
  contact: string;
}


const ProfileContact = ({ userId, profileId, contact }: Props) => {
  const { openModal } = useModalAction();
  const { t } = useTranslation('common');
  const [open,setOpen] =useState(false)
  const [isLoading,setIsLoading] = useState(false)
  const {updateUserContact} =  useContext(GlobalContext)


  function onAdd() {
    // openModal('ADD_OR_UPDATE_PROFILE_CONTACT', {
    //   customerId: userId,
    //   profileId,
    //   contact,
    // });
    setOpen(true)
  }
  const onSubmit = (value: { phone_number: any; })=>{
     updateUserContact(value.phone_number,setIsLoading,setOpen)
  }
  return (
    <Card className="flex w-full flex-col">
      <div className="mb-5 flex items-center justify-between md:mb-8">
        <p className="text-lg capitalize text-heading lg:text-xl">
          {t('text-contact-number')}
        </p>

        {onAdd && (
          <button
            className="flex items-center text-sm font-semibold text-accent transition-colors duration-200 hover:text-accent-hover focus:text-accent-hover focus:outline-none"
            onClick={onAdd}
          >
            <PlusIcon className="h-4 w-4 stroke-2 ltr:mr-0.5 rtl:ml-0.5" />
            {Boolean(contact) ? t('text-update') : t('text-add')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1">
        <PhoneInput
          country="us"
          value={contact}
          disabled={true}
          inputClass="!p-0 ltr:!pr-4 rtl:!pl-4 ltr:!pl-14 rtl:!pr-14 !flex !items-center !w-full !appearance-none !transition !duration-300 !ease-in-out !text-heading !text-sm focus:!outline-none focus:!ring-0 !border !border-border-base !rounded focus:!border-accent !h-12"
          dropdownClass="focus:!ring-0 !border !border-border-base !shadow-350"
        />
      </div>
     
 
      <CustomPhoneModal open={open} onClose={()=>{
        setOpen(false)
      }} onSubmit={onSubmit} phoneNumber={contact} isLoading={isLoading}    />
    </Card>
  );
};

export default ProfileContact;
