import React, { useContext, useState } from 'react'
import Modal from '@/components/ui/modal/modal';
import Card from '../cards/card';
import Details from '@/components/products/details/details'
import { useTranslation } from 'react-i18next';
import MobileOtpInput from 'react-otp-input';
import Button from '@/components/ui/button';
import Input from '@/components/ui/forms/input';
import Label from '@/components/ui/forms/label';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { Form } from '@/components/ui/forms/form';
import { Controller } from 'react-hook-form';
import * as yup from 'yup';
import { GlobalContext } from '@/GlobalContext/GlobalContext';

type OtpRegisterFormValues = {
  email: string;
  name: string;
  // code: string;
};

interface OtpRegisterFormProps {
  onSubmit: (formData: any) => void;
  loading: boolean;
  onClose: any,
  open: boolean,

}




const otpLoginFormSchemaForNewUser = yup.object().shape({
  email: yup
    .string()
    .email('error-email-format')
    .required('error-email-required'),
  name: yup.string().required('error-name-required')
  // code: yup.string().required('error-code-required'),
});

function CustomProfileUpdate({
  // onSubmit,
  // loading,
  onClose,
  open,

}: OtpRegisterFormProps) {
  const { t } = useTranslation('common');
  const { closeModal } = useModalAction();
  const [loading,setLoading] = useState(false)
  const {updateUserEmailAndName} = useContext(GlobalContext)
  const onSubmit =(value:any)=>{
    console.log(value)
    updateUserEmailAndName(value,setLoading,onClose)

  }

  return (
    <Modal open={open} onClose={onClose}>
      <Card className="flex w-full flex-col">
        {/* <Details product={product} onClose={onClose} /> */}
        <Form<OtpRegisterFormValues>
          onSubmit={onSubmit}
          validationSchema={otpLoginFormSchemaForNewUser}
        >
          {({ register, control, formState: { errors } }) => (
            <>
              <Input
                label={t('text-email')}
                {...register('email')}
                type="email"
                variant="outline"
                className="mb-5"
                error={t(errors.email?.message!)}
              />
              <Input
                label={t('text-name')}
                {...register('name')}
                variant="outline"
                className="mb-5"
                error={t(errors.name?.message!)}
              />



              <div className="grid grid-cols-2 gap-5">
                <Button
                  variant="outline"
                  className="hover:border-red-500 hover:bg-red-500"
                  onClick={closeModal}
                >
                  {t('text-cancel')}
                </Button>

                <Button loading={loading} disabled={loading}>
                  {t('Save')}
                </Button>
              </div>
            </>
          )}
        </Form>
      </Card>
    </Modal>
  )
}

export default CustomProfileUpdate