import { useRouter } from 'next/router';
import React from 'react';
import pkg from '../../../package.json';

const LanguageSelector = (): JSX.Element => {
  const router = useRouter();

  const onSwitchLanguage = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(router.asPath, router.asPath, { locale: ev.target.value });
  };

  return (
    <div className="container">
      <div className="select">
        <select onChange={onSwitchLanguage} value={router.locale} data-e2e-id="language-selector">
          {pkg.config.languages &&
            pkg.config.languages.map((lang: string) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default LanguageSelector;
