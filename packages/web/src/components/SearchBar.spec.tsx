import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from './SearchBar'

const placeholder = 'Search city... (/ or Ctrl+K)'

describe('SearchBar', () => {
  it('renders input and buttons', () => {
    render(
      <SearchBar
        onSearch={vi.fn()}
        onLocationSearch={vi.fn()}
        loading={false}
      />
    )
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('calls onSearch with trimmed input on submit', () => {
    const onSearch = vi.fn()
    render(
      <SearchBar
        onSearch={onSearch}
        onLocationSearch={vi.fn()}
        loading={false}
      />
    )

    const input = screen.getByPlaceholderText(placeholder)
    fireEvent.change(input, { target: { value: '  London  ' } })
    fireEvent.submit(input.closest('form')!)

    expect(onSearch).toHaveBeenCalledWith('London')
  })

  it('disables inputs when loading', () => {
    render(
      <SearchBar
        onSearch={vi.fn()}
        onLocationSearch={vi.fn()}
        loading={true}
      />
    )
    expect(screen.getByPlaceholderText(placeholder)).toBeDisabled()
    expect(screen.getByText('...')).toBeDisabled()
  })

  it('does not call onSearch with empty input', () => {
    const onSearch = vi.fn()
    render(
      <SearchBar
        onSearch={onSearch}
        onLocationSearch={vi.fn()}
        loading={false}
      />
    )
    fireEvent.submit(
      screen.getByPlaceholderText(placeholder).closest('form')!
    )
    expect(onSearch).not.toHaveBeenCalled()
  })
})
