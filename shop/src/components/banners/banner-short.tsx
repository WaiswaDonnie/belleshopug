import { Swiper, SwiperSlide, Navigation } from '@/components/ui/slider';
import { Image } from '@/components/ui/image';
import { productPlaceholder } from '@/lib/placeholders';
import { useIsRTL } from '@/lib/locals';
import { ArrowNext, ArrowPrev } from '@/components/icons';
import { useTranslation } from 'next-i18next';
import type { Banner } from '@/types';
import SwiperCore, { Autoplay } from 'swiper';

import cn from 'classnames';

interface BannerProps {
  banners: Banner[] | undefined;
  layout?: string;
}

const BannerShort: React.FC<BannerProps> = ({ banners,layout }) => {
  SwiperCore.use([Autoplay])

  const { t } = useTranslation('common');
  const { isRTL } = useIsRTL();
  console.log("ba",banners)
  // id: string;
  // title: string;
  // description: string;
  // image: Attachment;
  const customBanners = [
   {
    id:1,
    title:'Always ready to serve you at your convenience',
    image:{
      original:"https://firebasestorage.googleapis.com/v0/b/belle-beauty-ug.appspot.com/o/Sliders%2F0.jpg?alt=media&token=4615a0bb-f899-4389-9ca0-eaaef86a740b",
      thumbanail:"https://firebasestorage.googleapis.com/v0/b/belle-beauty-ug.appspot.com/o/Sliders%2F0.jpg?alt=media&token=4615a0bb-f899-4389-9ca0-eaaef86a740b"
    },
    description:''
   },
   {
    id:2,
    title:'All beauty professionals at your fingertips.',
    image:{
      original:"https://firebasestorage.googleapis.com/v0/b/belle-beauty-ug.appspot.com/o/Sliders%2F1.jpg?alt=media&token=a7ccec84-aee6-4754-b2f6-4b172cb9d44e",
      thumbanail:"https://firebasestorage.googleapis.com/v0/b/belle-beauty-ug.appspot.com/o/Sliders%2F1.jpg?alt=media&token=a7ccec84-aee6-4754-b2f6-4b172cb9d44e"
    },
    description:''
   },
   {
    id:3,
    title:'A beauty service that comes to you.',
    image:{
      original:"https://firebasestorage.googleapis.com/v0/b/belle-beauty-ug.appspot.com/o/Sliders%2F2.jpg?alt=media&token=919657d6-9fdd-49fa-b896-3bef92b59938",
      thumbanail:"https://firebasestorage.googleapis.com/v0/b/belle-beauty-ug.appspot.com/o/Sliders%2F2.jpg?alt=media&token=919657d6-9fdd-49fa-b896-3bef92b59938"
    },
    description:''
   },
   {
    id:4,
    title:'Service with a smile',
    image:{
      original:"https://firebasestorage.googleapis.com/v0/b/belle-beauty-ug.appspot.com/o/Sliders%2F3.jpg?alt=media&token=05f3d714-ee0a-496d-8d4c-ca31f1ebbaad",
      thumbanail:"https://firebasestorage.googleapis.com/v0/b/belle-beauty-ug.appspot.com/o/Sliders%2F3.jpg?alt=media&token=05f3d714-ee0a-496d-8d4c-ca31f1ebbaad"
    },
    description:''
   },
   
  

  ]

   

  return (
    <div className="relative">
      <div className="-z-1 overflow-hidden">
        <div className="relative">
          <Swiper
            id="banner"
            loop={true}
            autoplay={{ delay: 3000 }}
            modules={[Navigation]}
            resizeObserver={true}
            allowTouchMove={false}
            slidesPerView={1}
            navigation={{
              nextEl: '.next',
              prevEl: '.prev',
            }}
          >
            {customBanners?.map((banner, idx) => (
              <SwiperSlide key={idx}>
                 <div
                  className={cn('relative h-[800px] w-full', {
                    'max-h-140': layout === 'standard',
                    'max-h-[320px] md:max-h-[680px]': layout === 'minimal',
                  })}
                >
                  <Image
                    className="h-full min-h-140 w-full"
                    src={banner.image?.original ?? productPlaceholder}
                    alt={banner.title ?? ''}
                    layout="fill"
           
                    objectFit="cover"
                  />
                  <div
                    className={cn(
                      'absolute inset-0 mt-8 flex w-full flex-col items-center justify-center p-5 text-center md:px-20 lg:space-y-10',
                      {
                        'space-y-5 md:!space-y-8': layout === 'minimal',
                      }
                    )}
                  >
                    <h1
                      className={cn(
                        'text-5xl font-bold text-white tracking-tight text-heading lg:text-4xl xl:text-5xl',
                        // {
                        //   '!text-accent': layout === 'minimal',
                        // }
                      )}
                    >
                      {banner?.title}
                    </h1>
                    <p className="text-lg mt-2 text-heading lg:text-base xl:text-lg">
                      {banner?.description}
                    </p>
                    {/* <div className="w-full max-w-3xl" ref={intersectionRef}>
                      <Search label="search" />
                    </div> */}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div
            className="prev absolute top-2/4 z-10 -mt-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border-200 border-opacity-70 bg-light text-heading shadow-200 transition-all duration-200 ltr:left-4 rtl:right-4 md:-mt-5 ltr:md:left-5 rtl:md:right-5"
            role="button"
          >
            <span className="sr-only">{t('text-previous')}</span>

            {isRTL ? (
              <ArrowNext width={18} height={18} />
            ) : (
              <ArrowPrev width={18} height={18} />
            )}
          </div>
          <div
            className="next absolute top-2/4 z-10 -mt-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border-200 border-opacity-70 bg-light text-heading shadow-200 transition-all duration-200 ltr:right-4 rtl:left-4 md:-mt-5 ltr:md:right-5 rtl:md:left-5"
            role="button"
          >
            <span className="sr-only">{t('text-next')}</span>
            {isRTL ? (
              <ArrowPrev width={18} height={18} />
            ) : (
              <ArrowNext width={18} height={18} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerShort;
