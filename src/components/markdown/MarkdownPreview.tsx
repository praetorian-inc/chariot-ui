import { useMemo, useState } from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { PropsOf } from '@headlessui/react/dist/types';
import ReactMarkdownPreview from '@uiw/react-markdown-preview';
import DOMPurify from 'dompurify';

import { Loader } from '@/components/Loader';
import { useGetFile } from '@/hooks/useFiles';

export const AppMediaStoragePrefix = '#file/';

export function MarkdownPreview(props: PropsOf<typeof ReactMarkdownPreview>) {
  const { source = '', ...restProps } = props;

  const sanitizedValue = useMemo(() => DOMPurify.sanitize(source), [source]);

  return (
    <ReactMarkdownPreview
      {...restProps}
      source={sanitizedValue}
      components={{
        img: s => {
          const imgSrc = s.src || '';

          if (imgSrc.startsWith(AppMediaStoragePrefix)) {
            const src = imgSrc.replace(AppMediaStoragePrefix, '');
            return <MarkdownMedia src={src} alt={s.alt} />;
          } else {
            return <img src={imgSrc} alt={s.alt} />;
          }
        },
      }}
    />
  );
}

interface MarkdownMediaProps {
  src: string;
  alt?: string;
}

function MarkdownMedia(props: MarkdownMediaProps) {
  const { data: media, isFetching: isMediaFetching } = useGetFile(
    {
      name: props.src,
    },
    { responseType: 'arraybuffer', getBlobType: 'image/jpeg' }
  );

  const [imageLoadError, setImageLoadError] = useState(false);

  return (
    <Loader isLoading={isMediaFetching} className="mb-2 h-5">
      {media && !imageLoadError ? (
        <img
          src={media}
          onError={() => setImageLoadError(true)}
          alt={props.alt || 'image'}
        />
      ) : (
        <div className="relative flex items-center justify-center rounded-[2px] text-sm font-medium text-default-light ring-inset focus:z-10 focus:outline-0 disabled:cursor-not-allowed disabled:bg-default-light disabled:text-default-light">
          <QuestionMarkCircleIcon className="size-5 text-lg" />
        </div>
      )}
    </Loader>
  );
}
