import { IconCheck, IconClipboard, IconDownload, IconCaretRight } from '@tabler/icons-react';
import { FC, memo, useEffect, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { useTranslation } from 'next-i18next';

import {
  generateRandomString,
  programmingLanguages,
} from '@/utils/app/codeblock';

interface Props {
  language: string;
  value: string;
}

const IframeContent: FC = () => {
  useEffect(() => {
    window.addEventListener("message", ({ data: { code, language } }) => {
      if (language === 'html') {
        document.body.innerHTML = code;
      } else if (language === 'javascript') {
        eval(code);
      }
    });
  }, []);
  return null;
};

export const CodeBlock: FC<Props> = memo(({ language, value }) => {
  const { t } = useTranslation('markdown');
  const [isCopied, setIsCopied] = useState<Boolean>(false);
  const [isRunning, setIsRunning] = useState<Boolean>(false);
  const iframeRef = useRef<any>(null);

  const toggleRunCode = () => {
    setIsRunning(!isRunning);
  };

  useEffect(() => {
    if (isRunning && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ code: value, language }, "*");
    }
  }, [isRunning, value, language]);

  const copyToClipboard = () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      return;
    }

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };
  const downloadAsFile = () => {
    const fileExtension = programmingLanguages[language] || '.file';
    const suggestedFileName = `file-${generateRandomString(
      3,
      true,
    )}${fileExtension}`;
    const fileName = window.prompt(
      t('Enter file name') || '',
      suggestedFileName,
    );

    if (!fileName) {
      // user pressed cancel on prompt
      return;
    }

    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="codeblock relative font-sans text-[16px]">
      <div className="flex items-center justify-between py-1.5 px-4">
        <span className="text-xs lowercase text-white">{language}</span>

        <div className="flex items-center">
          <button
            className="flex gap-1.5 items-center rounded bg-none p-1 text-xs text-white"
            onClick={copyToClipboard}
          >
            {isCopied ? <IconCheck size={18} /> : <IconClipboard size={18} />}
            {isCopied ? t('Copied!') : t('Copy code')}
          </button>
          {(language === 'html' || language === 'javascript') && (
            <button
              className="flex gap-1.5 items-center rounded bg-none p-1 text-xs text-white"
              onClick={toggleRunCode}
            >
              <IconCaretRight size={18} />
              {isRunning ? t('Stop') : t('Run code')}
            </button>
          )}
          <button
            className="flex items-center rounded bg-none p-1 text-xs text-white"
            onClick={downloadAsFile}
          >
            <IconDownload size={18} />
          </button>
        </div>
      </div>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0 }}
      >
        {value}
      </SyntaxHighlighter>
      {isRunning && (
        <iframe 
          ref={iframeRef}
          title="live code preview" 
          className="w-full h-64 mt-4 border-2 border-gray-300"
        >
          <IframeContent />
        </iframe>
      )}
    </div>
  );
});
CodeBlock.displayName = 'CodeBlock';
