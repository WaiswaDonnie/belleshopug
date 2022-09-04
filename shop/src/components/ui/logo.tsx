import { Image } from '@/components/ui/image';
import cn from 'classnames';
import Link from '@/components/ui/link';
import { logoPlaceholder } from '@/lib/placeholders';
import { useSettings } from '@/framework/settings';

const Logo: React.FC<React.AnchorHTMLAttributes<{}>> = ({
  className,
  ...props
}) => {
  const {
    settings: { logo, siteTitle },
  } : any = useSettings();
  return (
    <Link href="/makeup" className={cn('inline-flex', className)} {...props}>
      <span className="relative h-12  w-32 overflow-hidden md:w-40">
        <Image
        
        width={170}
        height={60}
         src={require('../../assets/bellelogo.png')}
          alt={'Belle Shop Logo'}
          // layout="fixed"
          objectFit="contain"
          loading="eager"
        />
      </span>
    </Link>
  );
};

export default Logo;
