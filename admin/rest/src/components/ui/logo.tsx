import Image from 'next/image';
import Link from '@/components/ui/link';
import cn from 'classnames';
import { siteSettings } from '@/settings/site.settings';
import { useSettings } from '@/contexts/settings.context';

const Logo: React.FC<React.AnchorHTMLAttributes<{}>> = ({
  className,
  ...props
}) => {
  const { logo, siteTitle } = useSettings();
  return (
    <Link
      href={siteSettings.logo.href}
      className={cn('inline-flex', className)}
      {...props}
    >
      <span
        className="relative overflow-hidden"
        style={{
          width: siteSettings.logo.width,
          height: siteSettings.logo.height,
        }}
      >
        <Image
         src={require('../../assets/bellelogo.png')}
          alt={'Belle Shop Logo'}
          layout="fill"
          objectFit="contain"
          loading="eager"
        />
      </span>
    </Link>
  );
};

export default Logo;
