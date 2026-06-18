import { render, screen } from '@testing-library/react';
import App from './App';

test('renders TruthShield brand', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/Truth/i);
  const shieldElements = screen.getAllByText(/Shield/i);
  expect(brandElements[0]).toBeInTheDocument();
  expect(shieldElements[0]).toBeInTheDocument();
});
