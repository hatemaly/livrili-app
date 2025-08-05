'use client'

import { useAdminLanguage, useAdminRTL } from '../../lib/admin-language-context'

export default function TestLanguagePage() {
  const { language, direction, setLanguage, t } = useAdminLanguage()
  const { isRTL, textAlign, marginStart } = useAdminRTL()

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Language System Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Language Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Language</h2>
          <div className="space-y-2">
            <p><strong>Language:</strong> {language}</p>
            <p><strong>Direction:</strong> {direction}</p>
            <p><strong>Is RTL:</strong> {isRTL ? 'Yes' : 'No'}</p>
            <p><strong>HTML dir attribute:</strong> {document?.documentElement?.getAttribute('dir')}</p>
            <p><strong>HTML lang attribute:</strong> {document?.documentElement?.getAttribute('lang')}</p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Language Switcher</h2>
          <div className="space-y-2">
            <button
              onClick={() => setLanguage('en')}
              className={`block w-full text-left px-3 py-2 rounded ${
                language === 'en' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`block w-full text-left px-3 py-2 rounded ${
                language === 'fr' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
              }`}
            >
              Français
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`block w-full text-left px-3 py-2 rounded ${
                language === 'ar' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
              }`}
            >
              العربية
            </button>
          </div>
        </div>

        {/* Translation Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Translation Test</h2>
          <div className="space-y-2">
            <p><strong>{t('nav.dashboard')}:</strong> {t('nav.dashboard')}</p>
            <p><strong>{t('nav.users')}:</strong> {t('nav.users')}</p>
            <p><strong>{t('common.loading')}:</strong> {t('common.loading')}</p>
            <p><strong>{t('common.save')}:</strong> {t('common.save')}</p>
            <p><strong>{t('common.cancel')}:</strong> {t('common.cancel')}</p>
          </div>
        </div>

        {/* RTL Layout Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">RTL Layout Test</h2>
          <div className="space-y-4">
            <div className={`p-4 bg-gray-100 rounded ${textAlign}`}>
              <p>This text should align according to the current language direction.</p>
              <p>Current alignment: {textAlign}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 bg-blue-500 rounded ${marginStart}4`}></div>
              <span>This box should have margin on the start side ({isRTL ? 'right' : 'left'})</span>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <p>This border should be on the correct side based on direction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{t('app.title', 'Sample Content')}</h2>
        <div className="prose">
          <p>
            This is sample content to test how text flows in different languages. 
            The layout should automatically adjust based on the selected language.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
            quis nostrud exercitation ullamco laboris.
          </p>
        </div>
      </div>
    </div>
  )
}