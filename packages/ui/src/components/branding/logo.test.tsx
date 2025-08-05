import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  Logo, 
  LogoIcon, 
  LogoHeader, 
  LogoFooter, 
  LogoFavicon, 
  LogoBrand 
} from './logo'

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Package: ({ size, className, ...props }: any) => (
    <svg data-testid="package-icon" width={size} height={size} className={className} {...props} />
  ),
  Check: ({ size, className, ...props }: any) => (
    <svg data-testid="check-icon" width={size} height={size} className={className} {...props} />
  ),
}))

describe('Logo Components', () => {
  describe('LogoIcon', () => {
    it('renders package and check icons', () => {
      render(<LogoIcon />)
      expect(screen.getByTestId('package-icon')).toBeInTheDocument()
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })

    it('applies correct size to icons', () => {
      render(<LogoIcon size="lg" />)
      const packageIcon = screen.getByTestId('package-icon')
      expect(packageIcon).toHaveAttribute('width', '28')
      expect(packageIcon).toHaveAttribute('height', '28')
    })

    it('applies correct variant classes', () => {
      render(<LogoIcon variant="inverse" />)
      const packageIcon = screen.getByTestId('package-icon')
      expect(packageIcon).toHaveClass('text-white')
    })
  })

  describe('Logo', () => {
    it('renders with default props', () => {
      render(<Logo />)
      expect(screen.getByTestId('package-icon')).toBeInTheDocument()
      expect(screen.getByText('Livrili')).toBeInTheDocument()
    })

    it('renders icon only when iconOnly is true', () => {
      render(<Logo iconOnly />)
      expect(screen.getByTestId('package-icon')).toBeInTheDocument()
      expect(screen.queryByText('Livrili')).not.toBeInTheDocument()
    })

    it('renders text only when textOnly is true', () => {
      render(<Logo textOnly />)
      expect(screen.queryByTestId('package-icon')).not.toBeInTheDocument()
      expect(screen.getByText('Livrili')).toBeInTheDocument()
    })

    it('renders as link when asLink is true', () => {
      render(<Logo asLink href="/test" />)
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toContainElement(screen.getByText('Livrili'))
    })

    it('applies vertical layout classes', () => {
      render(<Logo layout="vertical" />)
      const container = screen.getByText('Livrili').closest('div')
      expect(container).toHaveClass('flex-col')
    })

    it('applies size variant classes', () => {
      render(<Logo size="xl" />)
      const text = screen.getByText('Livrili')
      expect(text).toHaveClass('text-2xl')
    })

    it('applies color variant classes', () => {
      render(<Logo variant="secondary" />)
      const container = screen.getByText('Livrili').closest('div')
      expect(container).toHaveClass('text-livrili-fire')
    })
  })

  describe('Preset Components', () => {
    it('LogoHeader renders with correct props', () => {
      render(<LogoHeader />)
      const container = screen.getByText('Livrili').closest('div')
      expect(container).toHaveClass('text-livrili-prussian')
      expect(screen.getByText('Livrili')).toHaveClass('text-xl')
    })

    it('LogoFooter renders with muted variant', () => {
      render(<LogoFooter />)
      const container = screen.getByText('Livrili').closest('div')
      expect(container).toHaveClass('text-gray-600')
    })

    it('LogoFavicon renders icon only', () => {
      render(<LogoFavicon />)
      expect(screen.getByTestId('package-icon')).toBeInTheDocument()
      expect(screen.queryByText('Livrili')).not.toBeInTheDocument()
    })

    it('LogoBrand renders with vertical layout and large size', () => {
      render(<LogoBrand />)
      const container = screen.getByText('Livrili').closest('div')
      expect(container).toHaveClass('flex-col', 'text-3xl')
    })
  })

  describe('Accessibility', () => {
    it('applies focus styles when used as link', () => {
      render(<Logo asLink href="/test" />)
      const link = screen.getByRole('link')
      expect(link).toHaveClass('focus:ring-2', 'focus:ring-livrili-prussian')
    })

    it('logo text is not selectable by default', () => {
      render(<Logo />)
      const text = screen.getByText('Livrili')
      expect(text).toHaveClass('select-none')
    })
  })

  describe('Responsive Design', () => {
    it('applies custom className correctly', () => {
      render(<Logo className="md:hidden" />)
      const container = screen.getByText('Livrili').closest('div')
      expect(container).toHaveClass('md:hidden')
    })

    it('supports responsive sizing with different breakpoints', () => {
      const { rerender } = render(<Logo size="sm" className="md:hidden" />)
      let container = screen.getByText('Livrili').closest('div')
      expect(container).toHaveClass('md:hidden')

      rerender(<Logo size="lg" className="hidden md:block" />)
      container = screen.getByText('Livrili').closest('div')
      expect(container).toHaveClass('hidden', 'md:block')
    })
  })
})

// Integration test for all components
describe('Logo Integration', () => {
  it('all logo components can be rendered together', () => {
    render(
      <div>
        <Logo data-testid="main-logo" />
        <LogoIcon data-testid="icon-only" />
        <LogoHeader data-testid="header-logo" />
        <LogoFooter data-testid="footer-logo" />
        <LogoFavicon data-testid="favicon-logo" />
        <LogoBrand data-testid="brand-logo" />
      </div>
    )

    expect(screen.getByTestId('main-logo')).toBeInTheDocument()
    expect(screen.getByTestId('icon-only')).toBeInTheDocument()
    expect(screen.getByTestId('header-logo')).toBeInTheDocument()
    expect(screen.getByTestId('footer-logo')).toBeInTheDocument()
    expect(screen.getByTestId('favicon-logo')).toBeInTheDocument()
    expect(screen.getByTestId('brand-logo')).toBeInTheDocument()
  })
})