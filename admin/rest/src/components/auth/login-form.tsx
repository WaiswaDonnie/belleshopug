import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import { useTranslation } from 'next-i18next';
import * as yup from 'yup';
import Link from '@/components/ui/link';
import Form from '@/components/ui/forms/form';
import { Routes } from '@/config/routes';
import { useLogin } from '@/data/user';
import type { LoginInput } from '@/types';
import { useState } from 'react';
import Alert from '@/components/ui/alert';
import Router from 'next/router';
import {
  allowedRoles,
  hasAccess,
  setAuthCredentials,
} from '@/utils/auth-utils';
import { GlobalContext } from '@/GlobalContext/GlobalContext';
import { useContext } from 'react';
import PhoneNumberForm from '../otp/phone-number-form';
import OtpCodeForm from '../otp/code-verify-form';
import OtpRegisterForm from '../otp/otp-register-form';

const loginFormSchema = yup.object().shape({
  email: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
  password: yup.string().required('form:error-password-required'),
});

const LoginForm = () => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // const { mutate: login, isLoading, error } = useLogin();
  const [isLoading, setIsLoading] = useState(false)
  const { loginUser, signupWithPhoneNumber,
    verifyCode } = useContext(GlobalContext)

  function onSubmit({ email, password }: LoginInput) {
    loginUser(
      email,
      password,
      setIsLoading, hasAccess, allowedRoles, Routes, setAuthCredentials, setErrorMessage
    )
    // login(
    //   {
    //     email,
    //     password,
    //   },
    //   {
    //     onSuccess: (data) => {
    //       if (data?.token) {
    //         if (hasAccess(allowedRoles, data?.permissions)) {
    //           setAuthCredentials(data?.token, data?.permissions);
    //           Router.push(Routes.dashboard);
    //           return;
    //         }
    //         setErrorMessage('form:error-enough-permission');
    //       } else {
    //         setErrorMessage('form:error-credential-wrong');
    //       }
    //     },
    //     onError: () => {},
    //   }
    // );
  }
  const [otpState, setOtpState] = useState("PhoneNumber")
  const [otpLoginLoading, setOtpLoginLoading] = useState(false)
  function onSendCodeSubmission({ phone_number }: { phone_number: string }) {
    // sendOtpCode({
    //   phone_number: `+${phone_number}`,
    // });
    // setOtpState({
    //   ...otpState,
    //   otpId: data?.id!,
    //   isContactExist: data?.is_contact_exist!,
    //   phoneNumber: data?.phone_number!,
    //   step: data?.is_contact_exist! ? 'OtpForm' : 'RegisterForm',
    //   ...(verifyOnly && { step: 'OtpForm' }),
    // });
    // setOtpState({...otpState,step:"OtpForm"})
    // setOtpState,setLoading,otpState
    // setOtpState("OtpForm")
    signupWithPhoneNumber({ phone_number: `+${phone_number}` }, setOtpState, setIsLoading, otpState)
  }

  function onOtpLoginSubmission(values: any) {
    // otpLogin({
    //   ...values,
    // });
    console.log("otp", values)
    verifyCode(values.code, setOtpState, setOtpLoginLoading, hasAccess, allowedRoles, Routes, setAuthCredentials, setErrorMessage)
  }
  return (
    <>
      {/* <Form<LoginInput> validationSchema={loginFormSchema} onSubmit={onSubmit}>
        {({ register, formState: { errors } }) => (
          <>
            <Input
              label={t('form:input-label-email')}
              {...register('email')}
              type="email"
              variant="outline"
              className="mb-4"
              error={t(errors?.email?.message!)}
            />
            <PasswordInput
              label={t('form:input-label-password')}
              forgotPassHelpText={t('form:input-forgot-password-label')}
              {...register('password')}
              error={t(errors?.password?.message!)}
              variant="outline"
              className="mb-4"
              forgotPageLink={Routes.forgotPassword}
            />
            <Button className="w-full" loading={isLoading} disabled={isLoading}>
              {t('form:button-label-login')}
            </Button>

            <div className="relative mt-8 mb-6 flex flex-col items-center justify-center text-sm text-heading sm:mt-11 sm:mb-8">
              <hr className="w-full" />
              <span className="absolute -top-2.5 bg-light px-2 -ms-4 start-2/4">
                {t('common:text-or')}
              </span>
            </div>

            <div className="text-center text-sm text-body sm:text-base">
              {t('form:text-no-account')}{' '}
              <Link
                href={Routes.register}
                className="font-semibold text-accent underline transition-colors duration-200 ms-1 hover:text-accent-hover hover:no-underline focus:text-accent-700 focus:no-underline focus:outline-none"
              >
                {t('form:link-register-shop-owner')}
              </Link>
            </div>
          </>
        )}
      </Form>
      {errorMessage ? (
        <Alert
          message={t(errorMessage)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null} */}
      {otpState === 'PhoneNumber' && (
        <>

          <div className="flex items-center">
            <PhoneNumberForm
              onSubmit={onSendCodeSubmission}
              isLoading={isLoading}
              view="login"
            />
          </div>
        </>
      )}
      {otpState === 'OtpForm' && (
        <OtpCodeForm
          isLoading={otpLoginLoading}
          onSubmit={onOtpLoginSubmission}
        />
      )}
      <div className="flex justify-center align-center mt-5">
        <div style={{
          marginTop: 20
        }} id="recaptcha-container"></div>
      </div>
      {/* </div> */}
    </>
  );
};

export default LoginForm;

{
  /* {errorMsg ? (
          <Alert
            message={t(errorMsg)}
            variant="error"
            closeable={true}
            className="mt-5"
            onClose={() => setErrorMsg('')}
          />
        ) : null} */
}
