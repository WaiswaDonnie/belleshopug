import Button from '@/components/ui/button';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import CustomOtpFormModal from '@/components/ui/modal/customOtpFormModal'
import { useState } from 'react';

export default function JoinButton() {
  const [open,setOpen] = useState(false)
  const { t } = useTranslation('common');
  const { openModal } = useModalAction();
  function handleJoin() {
    // setOpen(!open)
    return openModal('OTP_LOGIN');
  }
  return (
    <>
      <Button className="font-semibold" size="small" onClick={handleJoin}>
        {t('Join')}
      </Button>
      {/* {open && <CustomOtpFormModal open={open} setOpen={setOpen}/>} */}
    
    </>
  );
}
