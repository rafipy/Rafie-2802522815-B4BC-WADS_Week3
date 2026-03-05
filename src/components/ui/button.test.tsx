import { render, screen } from '@testing-library/react'
import { Button } from './button'

// Test suite for the Button component
describe('Button', () => {
  // Test 1: Button renders with default variant
  it('renders with default variant', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-variant', 'default')
  })

  // Test 2: Button renders with destructive variant
  it('renders with destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>)
    
    const button = screen.getByRole('button', { name: /delete/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-variant', 'destructive')
  })

  // Test 3: Button is disabled when disabled prop is passed
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
  })

  // Test 4: Button renders with different sizes
  it('renders with small size', () => {
    render(<Button size="sm">Small Button</Button>)
    
    const button = screen.getByRole('button', { name: /small button/i })
    expect(button).toHaveAttribute('data-size', 'sm')
  })

  // Test 5: Button renders children correctly
  it('renders children inside the button', () => {
    render(
      <Button>
        <span data-testid="child">Child Element</span>
      </Button>
    )
    
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
