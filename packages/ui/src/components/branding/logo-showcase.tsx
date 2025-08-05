import * as React from 'react'
import { 
  Logo, 
  LogoIcon, 
  LogoHeader, 
  LogoFooter, 
  LogoFavicon, 
  LogoBrand 
} from './logo'

/**
 * LogoShowcase - Demonstrates all available Livrili logo variants and configurations
 * This component is useful for design system documentation and testing
 */
export const LogoShowcase: React.FC = () => {
  return (
    <div className="p-8 space-y-12 bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-livrili-prussian mb-2">
          Livrili Logo Showcase
        </h1>
        <p className="text-gray-600">
          All logo variants and configurations available in the design system
        </p>
      </div>

      {/* Logo Sizes */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-livrili-prussian">Logo Sizes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center p-6 bg-white rounded-lg border">
          <div className="text-center space-y-2">
            <Logo size="xs" />
            <p className="text-xs text-gray-500">Extra Small</p>
          </div>
          <div className="text-center space-y-2">
            <Logo size="sm" />
            <p className="text-xs text-gray-500">Small</p>
          </div>
          <div className="text-center space-y-2">
            <Logo size="md" />
            <p className="text-xs text-gray-500">Medium</p>
          </div>
          <div className="text-center space-y-2">
            <Logo size="lg" />
            <p className="text-xs text-gray-500">Large</p>
          </div>
          <div className="text-center space-y-2">
            <Logo size="xl" />
            <p className="text-xs text-gray-500">Extra Large</p>
          </div>
          <div className="text-center space-y-2">
            <Logo size="2xl" />
            <p className="text-xs text-gray-500">2X Large</p>
          </div>
          <div className="text-center space-y-2">
            <Logo size="3xl" />
            <p className="text-xs text-gray-500">3X Large</p>
          </div>
        </div>
      </section>

      {/* Logo Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-livrili-prussian">Logo Variants</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
          <div className="text-center space-y-2 p-4 bg-white rounded-lg border">
            <Logo variant="default" size="lg" />
            <p className="text-xs text-gray-500">Default</p>
          </div>
          <div className="text-center space-y-2 p-4 bg-livrili-prussian rounded-lg">
            <Logo variant="inverse" size="lg" />
            <p className="text-xs text-white/70">Inverse</p>
          </div>
          <div className="text-center space-y-2 p-4 bg-white rounded-lg border">
            <Logo variant="muted" size="lg" />
            <p className="text-xs text-gray-500">Muted</p>
          </div>
          <div className="text-center space-y-2 p-4 bg-white rounded-lg border">
            <Logo variant="secondary" size="lg" />
            <p className="text-xs text-gray-500">Secondary</p>
          </div>
        </div>
      </section>

      {/* Logo Layouts */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-livrili-prussian">Logo Layouts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
          <div className="text-center space-y-4 p-6 bg-white rounded-lg border w-full">
            <Logo layout="horizontal" size="lg" />
            <p className="text-sm text-gray-500">Horizontal Layout</p>
          </div>
          <div className="text-center space-y-4 p-6 bg-white rounded-lg border w-full">
            <Logo layout="vertical" size="lg" />
            <p className="text-sm text-gray-500">Vertical Layout</p>
          </div>
        </div>
      </section>

      {/* Icon Only & Text Only */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-livrili-prussian">Icon & Text Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center justify-items-center">
          <div className="text-center space-y-4 p-6 bg-white rounded-lg border w-full">
            <LogoIcon size="xl" />
            <p className="text-sm text-gray-500">Icon Only</p>
          </div>
          <div className="text-center space-y-4 p-6 bg-white rounded-lg border w-full">
            <Logo textOnly size="lg" />
            <p className="text-sm text-gray-500">Text Only</p>
          </div>
          <div className="text-center space-y-4 p-6 bg-white rounded-lg border w-full">
            <Logo size="lg" />
            <p className="text-sm text-gray-500">Full Logo</p>
          </div>
        </div>
      </section>

      {/* Preset Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-livrili-prussian">Preset Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-6 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Header Logo</h3>
            <LogoHeader />
            <code className="text-xs bg-gray-100 p-2 rounded block">
              &lt;LogoHeader /&gt;
            </code>
          </div>
          <div className="space-y-4 p-6 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Footer Logo</h3>
            <LogoFooter />
            <code className="text-xs bg-gray-100 p-2 rounded block">
              &lt;LogoFooter /&gt;
            </code>
          </div>
          <div className="space-y-4 p-6 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Favicon</h3>
            <LogoFavicon />
            <code className="text-xs bg-gray-100 p-2 rounded block">
              &lt;LogoFavicon /&gt;
            </code>
          </div>
          <div className="space-y-4 p-6 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Brand Logo</h3>
            <div className="flex justify-center">
              <LogoBrand />
            </div>
            <code className="text-xs bg-gray-100 p-2 rounded block">
              &lt;LogoBrand /&gt;
            </code>
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-livrili-prussian">Usage Examples</h2>
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">As Link</h3>
            <Logo asLink href="/" size="lg" className="hover:opacity-75" />
            <code className="text-xs bg-gray-100 p-2 rounded block mt-2">
              &lt;Logo asLink href="/" size="lg" /&gt;
            </code>
          </div>
        </div>
      </section>

      {/* Responsive Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-livrili-prussian">Responsive Usage</h2>
        <div className="p-6 bg-white rounded-lg border">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Resize your browser to see how the logo adapts to different screen sizes
            </p>
            <div className="flex justify-center">
              <Logo 
                size="sm" 
                className="md:hidden" // Small on mobile
              />
              <Logo 
                size="lg" 
                className="hidden md:block lg:hidden" // Large on tablet
              />
              <Logo 
                size="xl" 
                className="hidden lg:block" // Extra large on desktop
              />
            </div>
            <code className="text-xs bg-gray-100 p-2 rounded block">
              {`<Logo size="sm" className="md:hidden" />
<Logo size="lg" className="hidden md:block lg:hidden" />
<Logo size="xl" className="hidden lg:block" />`}
            </code>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LogoShowcase