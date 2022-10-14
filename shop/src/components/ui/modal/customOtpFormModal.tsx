import { useTranslation } from 'next-i18next';
import { useAtom } from 'jotai';
import Alert from '@/components/ui/alert';
import PhoneNumberForm from '@/components/otp/phone-number-form';
import { optAtom } from '@/components/otp/atom';
import OtpCodeForm from '@/components/otp/code-verify-form';
import { useSendOtpCode, useVerifyOtpCode } from '@/framework/user';
import Modal from './modal';
import Card from '../cards/card';

interface OtpFormProps {
  phoneNumber: string | undefined;
  onVerifySuccess: (values: { phone_number: string }) => void;
  open: boolean,
  setOpen: any
}
export default function CustomOtpFormModal({
  phoneNumber,
  onVerifySuccess,
  open, setOpen
}: OtpFormProps) {
  const { t } = useTranslation('common');
  const [otpState] = useAtom(optAtom);

  const { mutate: verifyOtpCode, isLoading: otpVerifyLoading } =
    useVerifyOtpCode({ onVerifySuccess });
  const {
    mutate: sendOtpCode,
    isLoading,
    serverError,
    setServerError,
  } = useSendOtpCode({
    verifyOnly: true
  });

  function onSendCodeSubmission({ phone_number }: { phone_number: string }) {
    sendOtpCode({
      phone_number: `+${phone_number}`,
    });
  }

  function onVerifyCodeSubmission({ code }: { code: string }) {
    verifyOtpCode({
      code,
      phone_number: otpState.phoneNumber,
      otp_id: otpState.otpId!,
    });
  }

  return (
    <Modal open={open} onClose={() => {
      setOpen(false)
    }}>
      <Card className="flex w-fit-content flex-col">
        <p className="mt-4 text-sm leading-relaxed text-center mb-7 text-body sm:mt-5 sm:mb-10 md:text-base">
          Login with your mobile number. We'll send you a code to the <br/> given mobile number to login into your account
        </p>
        {otpState.step === 'PhoneNumber' && (
          <>
            <Alert
              variant="error"
              message={serverError && t(serverError)}
              className="mb-4"
              closeable={true}
              onClose={() => setServerError(null)}
            />
            <PhoneNumberForm
              onSubmit={onSendCodeSubmission}
              isLoading={isLoading}
              phoneNumber={phoneNumber}
            />
          </>
        )}

        {otpState.step === 'OtpForm' && (
          <OtpCodeForm
            onSubmit={onVerifyCodeSubmission}
            isLoading={otpVerifyLoading}
          />
        )}
      </Card>

    </Modal>
  );
}
