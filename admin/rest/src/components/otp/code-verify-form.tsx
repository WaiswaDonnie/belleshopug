import MobileOtpInput from 'react-otp-input';
import Button from '@/components/ui/button';
import Label from '@/components/ui/forms/label';
import { useModalAction } from '@/components/ui/modal/modal.context';
import  Form  from '@/components/ui/forms/form';
import { Controller } from 'react-hook-form';
import * as yup from 'yup';
import { useTranslation } from 'next-i18next';
import { useAtom } from 'jotai';
import { initialOtpState, optAtom } from './atom';

type OptCodeFormProps = {
  code: string;
};

interface OtpLoginFormForAllUserProps {
  onSubmit: (formData: any) => void;
  isLoading: boolean;
}

const otpLoginFormSchemaForExistingUser = yup.object().shape({
  code: yup.string().required('error-code-required'),
});

export default function OtpCodeForm({
  onSubmit,
  isLoading,
}: OtpLoginFormForAllUserProps) {
  const { t } = useTranslation('common');
  const { closeModal } = useModalAction();
  const [otpState, setOtpState] = useAtom(optAtom);

  return (
    <div className="space-y-5 rounded border border-gray-200 p-5">
      <Form<OptCodeFormProps>
        onSubmit={onSubmit}
        validationSchema={otpLoginFormSchemaForExistingUser}
      >
        {({ control, formState: { errors } }) => (
          <>
            <div className="mb-5">
              <Label>{t('OTP CODE')}</Label>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <MobileOtpInput
                    value={value}
                    onChange={onChange}
                    numInputs={6}
                    separator={
                      <span className="hidden sm:inline-block">-</span>
                    }
                    containerStyle="flex items-center justify-between -mx-2"
                    inputStyle="flex items-center justify-center !w-full mx-2 sm:!w-9 !px-0 appearance-none transition duration-300 ease-in-out text-heading text-sm focus:outline-none focus:ring-0 border border-border-base rounded focus:border-accent h-12"
                    disabledStyle="!bg-gray-100"
                  />
                )}
                name="code"
                defaultValue=""
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <Button
                variant="outline"
                onClick={()=>{
                  closeModal()
                  setOtpState({
                    ...initialOtpState,
                });
                }}
                className="hover:border-red-500 hover:bg-red-500"
              >
                {t('Cancel')}
              </Button>
              <Button loading={isLoading} disabled={isLoading}>
                {t('Verify Code')}
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}
