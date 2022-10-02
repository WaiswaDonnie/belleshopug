// import { useEffect, useCallback } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { useTranslation } from 'next-i18next';
// import { UploadIcon } from '@/components/icons/upload-icon';
// import Spinner from '@/components/ui/loaders/spinner/spinner';
// import { useUploads } from '@/framework/settings';

// export default function Uploader({
//   onChange,
//   value,
//   name,
//   onBlur,
//   multiple = false,
// }: any) {
//   const { t } = useTranslation('common');
//   const {
//     mutate: upload,
//     isLoading,
//     files,
//   } = useUploads({
//     onChange,
//     defaultFiles: value,
//   });

//   const onDrop = useCallback(
//     (acceptedFiles) => {
//       upload(acceptedFiles);
//     },
//     [upload]
//   );
//   const { getRootProps, getInputProps } = useDropzone({
//     accept: 'image/*',
//     multiple,
//     onDrop,
//   });
//   //FIXME: package update need to check
//   // types: [
//   //   {
//   //     description: 'Images',
//   //     accept: {
//   //       'image/*': ['.png', '.gif', '.jpeg', '.jpg']
//   //     }
//   //   },
//   // ],
//   // excludeAcceptAllOption: true,
//   // multiple: false
//   const thumbs = files.map((file: any, idx) => (
//     <div
//       className="relative mt-2 inline-flex flex-col overflow-hidden rounded border border-border-100 ltr:mr-2 rtl:ml-2"
//       key={idx}
//     >
//       <div className="flex h-16 w-16 min-w-0 items-center justify-center overflow-hidden">
//         {/* eslint-disable */}
//         <img src={file.preview} alt={file?.name} />
//       </div>
//     </div>
//   ));
//   //FIXME: maybe no need to use this
//   useEffect(
//     () => () => {
//       // Make sure to revoke the data uris to avoid memory leaks
//       files.forEach((file: any) => URL.revokeObjectURL(file.preview));
//     },
//     [files]
//   );

//   return (
//     <section className="upload">
//       <div
//         {...getRootProps({
//           className:
//             'border-dashed border-2 border-border-base h-36 rounded flex flex-col justify-center items-center cursor-pointer focus:border-accent-400 focus:outline-none',
//         })}
//       >
//         <input
//           {...getInputProps({
//             name,
//             onBlur,
//           })}
//         />
//         <UploadIcon className="text-muted-light" />
//         <p className="mt-4 text-center text-sm text-body">
//           <span className="font-semibold text-accent">
//             {t('text-upload-highlight')}
//           </span>{' '}
//           {t('text-upload-message')} <br />
//           <span className="text-xs text-body">{t('text-img-format')}</span>
//         </p>
//       </div>

//       <aside className="mt-2 flex flex-wrap">
//         {!!thumbs.length && thumbs}
//         {isLoading && (
//           <div className="mt-2 flex h-16 items-center ltr:ml-2 rtl:mr-2">
//             <Spinner
//               text={t('text-loading')}
//               simple={true}
//               className="h-6 w-6"
//             />
//           </div>
//         )}
//       </aside>
//     </section>
//   );
// }
import { UploadIcon } from '@/components/icons/upload-icon';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Attachment } from '@/types';
import { CloseIcon } from '@/components/icons/close-icon';
// import Loader from '@/components/ui/loader/loader';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import { useTranslation } from 'next-i18next';
// import { useUploadMutation } from '@/data/upload';
import Image from 'next/image';
// import { zipPlaceholder } from '@/utils/placeholders';
 import Dropzone from 'react-dropzone'
import { useContext } from 'react';
import { GlobalContext } from '@/GlobalContext/GlobalContext';
const getPreviewImage = (value: any) => {
  let images: any[] = [];
  if (value) {
    images = Array.isArray(value) ? value : [{ ...value }];
  }
  return images;
};
export default function Uploader({
  onChange,
  value,
  multiple,
  acceptFile,
  helperText,
}: any) {
  const { t } = useTranslation();
  const { uploadFiles } = useContext(GlobalContext);
  const [files, setFiles] = useState<Attachment[]>(getPreviewImage(value));
  const [uploadedFiles,setUploadedFiles] = useState<Attachment[]>(getPreviewImage(value))
  const [loading, setLoading] = useState(false)
  // const { mutate: upload, } = useUploadMutation();
  const [error, setError] = useState<string | null>(null);
 

  const handleDelete = (image: string) => {
    const images = uploadedFiles.filter((file) => file.thumbnail !== image);
    // const images = files.filter((file) => file.thumbnail !== image);

    // setFiles(images);
    setUploadedFiles(images);
    if (onChange) {
      onChange(images);
    }
  };
  const thumbs = files?.map((file: any, idx) => {
    const imgTypes = [
      'tif',
      'tiff',
      'bmp',
      'jpg',
      'jpeg',
      'gif',
      'png',
      'eps',
      'raw',
    ];
    // let filename, fileType, isImage;
    if (file.id) {
      // if (!file?.thumbnail) {
      const splitArray = file?.original?.split('/');
      let fileSplitName = splitArray[splitArray?.length - 1]?.split('.'); // it will create an array of words of filename

      // filename = splitArray[splitArray?.length - 1];

      // fileType = filename?.split(".")[1];

      // fileType = filename?.split(".").pop();

      const fileType = fileSplitName.pop(); // it will pop the last item from the fileSplitName arr which is the file ext
      const filename = fileSplitName.join('.'); // it will join the array with dot, which restore the original filename
      const isImage = file?.thumbnail; // check if the original filename has the img ext
      // const isImage = file?.thumbnail && imgTypes.includes(fileType); // check if the original filename has the img ext

      return (
        <div
          className={`relative mt-2 inline-flex flex-col overflow-hidden rounded me-2 ${isImage ? 'border border-border-200' : ''
            }`}
          key={idx}
        >
          {/* {file?.thumbnail && isImage ? ( */}
          {isImage ? (
            // <div className="flex h-16 w-16 min-w-0 items-center justify-center overflow-hidden">
            //   <Image
            //     src={file.thumbnail}
            //     width={56}
            //     height={56}
            //     alt="uploaded image"
            //   />
            // </div>
            <figure className="relative h-16 w-28">
              <Image
                src={file.thumbnail}
                alt={filename}
                layout="fill"
                objectFit="contain"
              />
            </figure>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 min-w-0 items-center justify-center overflow-hidden">
                {/* <Image
                  src={zipPlaceholder}
                  width={56}
                  height={56}
                  alt="upload placeholder"
                /> */}
              </div>
              <p className="flex cursor-default items-baseline p-1 text-xs text-body">
                <span
                  className="inline-block max-w-[64px] overflow-hidden overflow-ellipsis whitespace-nowrap"
                  title={`${filename}.${fileType}`}
                >
                  {filename}
                </span>
                .{fileType}
              </p>
            </div>
          )}
          {multiple ? (
            <button
              className="absolute top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-light shadow-xl outline-none end-1"
              onClick={() => handleDelete(file.thumbnail)}
            >
              <CloseIcon width={10} height={10} />
            </button>
          ) : null}
        </div>
      );
    }
  });

  useEffect(
    () => () => {
      // Reset error after upload new file
      setError(null);

      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file: any) => URL.revokeObjectURL(file.thumbnail));
    },
    [files]
  );

  useEffect(()=>{
    if (onChange) {
      let mergedData;
      if (multiple) {
        
        mergedData = uploadedFiles.concat(uploadedFiles);
      } else {
        mergedData = uploadedFiles[0];
      }
      console.log("merged data got is",mergedData)
      onChange(mergedData);
    }
  },[onChange,multiple,uploadedFiles])


  return (
    <section className="upload">
      <Dropzone onDrop={async (acceptedFiles) => {
        if (acceptedFiles.length) {
          uploadFiles(acceptedFiles,setLoading,setUploadedFiles,multiple)

          // upload(
          //   acceptedFiles, // it will be an array of uploaded attachments
          //   {
          //     onSuccess: (data: any) => {
          //       let mergedData;
          //       if (multiple) {
          //         mergedData = files.concat(data);
          //         setFiles(files.concat(data));
          //         console.log(files.concat(data))
          //       } else {
          //         mergedData = data[0];
          //         setFiles(data);
          //         console.log("raw", data)
          //         console.log("ds", files.concat(data))
          //       }
          //       if (onChange) {
          //         console.log("merged data",mergedData)
          //         onChange(mergedData);
          //       }
          //     },
          //   }
          // );
        }
      }

      }>
        {({ getRootProps, getInputProps }) => (
          <section>
            {/* <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag  drop some files here, or click to select files</p>
            </div> */}
            <div
              {...getRootProps({
                className:
                  'border-dashed border-2 border-border-base h-36 rounded flex flex-col justify-center items-center cursor-pointer focus:border-accent-400 focus:outline-none',
              })}
            >
              <input {...getInputProps()} />
              <UploadIcon className="text-muted-light" />
              <p className="mt-4 text-center text-sm text-body">
                {helperText ? (
                  <span className="font-semibold text-gray-500">{helperText}</span>
                ) : (
                  <>
                    <span className="font-semibold text-accent">
                      {t('text-upload-highlight')}
                    </span>{' '}
                    {t('text-upload-message')} <br />
                    <span className="text-xs text-body">{t('text-img-format')}</span>
                  </>
                )}
              </p>
              {error && (
                <p className="mt-4 text-center text-sm text-body text-red-600">
                  {error}
                </p>
              )}
            </div>
          </section>
        )}
      </Dropzone>



      {(!!thumbs.length || loading) && (
        <aside className="mt-2 flex flex-wrap">
          {!!thumbs.length && thumbs}
          {loading && (
            <div className="mt-2 flex h-16 items-center ms-2">
              <Spinner simple={true} className="h-6 w-6" />
            </div>
          )}
        </aside>
      )}
      {uploadedFiles.map((file,index)=>(
        <div  key={index} className={`relative mt-2 inline-flex flex-col overflow-hidden rounded me-2 border border-border-200 `}>
         <figure key={index} className="relative h-16 w-28">
         <Image
           src={file.thumbnail}
           alt={'image'}
           layout="fill"
           objectFit="contain"
         />
          
            <button
              className="absolute top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-light shadow-xl outline-none end-1"
              onClick={() => handleDelete(file.thumbnail)}
            >
              <CloseIcon width={10} height={10} />
            </button>
          
       </figure>
        </div>
      ))}
    </section>
  );
}
