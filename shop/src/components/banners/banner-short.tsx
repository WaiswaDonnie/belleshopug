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
    title:'',
    image:{
      original:"https://unsplash.com/photos/mVdzV_HTyH4/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8MTh8fG1ha2V1cHxlbnwwfHx8fDE2Njc4MDE5NjA&force=true&w=2400",
      thumbanail:"https://unsplash.com/photos/mVdzV_HTyH4/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8MTh8fG1ha2V1cHxlbnwwfHx8fDE2Njc4MDE5NjA&force=true&w=2400"
    },
    description:''
   },
   {
    id:2,
    title:'',
    image:{
      original:"https://images.unsplash.com/photo-1494919138911-02d403edd88d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
      thumbanail:"https://images.unsplash.com/photo-1494919138911-02d403edd88d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
    },
    description:''
   },
   {
    id:4,
    title:'',
    image:{
      original:"https://images.unsplash.com/photo-1598104358204-87cefc7c5986?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80",
      thumbanail:"https://images.unsplash.com/photo-1598104358204-87cefc7c5986?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80"
    },
    description:''
   },
   {
    id:5,
    title:'',
    image:{
      original:"https://images.unsplash.com/photo-1655720348723-c16f0519249d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8YWZyaWNhbiUyMG5haWxzfGVufDB8MHwwfHw%3D&auto=format&fit=crop&w=900&q=60",
      thumbanail:"https://images.unsplash.com/photo-1655720348723-c16f0519249d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8YWZyaWNhbiUyMG5haWxzfGVufDB8MHwwfHw%3D&auto=format&fit=crop&w=900&q=60"
    },
    description:''
   },
   {
    id:6,
    title:'',
    image:{
      original:"https://images.unsplash.com/photo-1533146692536-e70f31e14b36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
      thumbanail:"https://images.unsplash.com/photo-1533146692536-e70f31e14b36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
    },
    description:''
   },
  //  {
  //   id:3,
  //   title:'Nails',
  //   image:{
  //     original:"https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/906/makeup.png",
  //     thumbanail:"https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/906/makeup.png"
  //   },
  //   description:'asdas'
  //  },

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
                  className={cn('relative h-screen w-full', {
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
                        'text-5xl font-bold tracking-tight text-heading lg:text-4xl xl:text-5xl',
                        {
                          '!text-accent': layout === 'minimal',
                        }
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
