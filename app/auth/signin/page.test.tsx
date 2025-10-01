import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import SignInPage from './page'

describe('SignInPage', () => {
  it('renders the Sign In heading', async () => {
    const ui = await SignInPage()
    render(<>{ui}</>)
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })
})


