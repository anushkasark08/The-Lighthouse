/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';
import ReservationForm from '../ReservationForm';
import Menu from '../Menu';
import api from '../../utils/api';

// Mock axios instance
jest.mock('../../utils/api', () => {
  const mockInstance = {
    create: jest.fn(() => mockInstance),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
    post: jest.fn(() => Promise.resolve({ data: {} })),
    get: jest.fn(() => Promise.resolve({ data: [] }))
  };
  return mockInstance;
});

describe('Frontend Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Navbar Component', () => {
    test('renders brand name and navigation links', () => {
      const toggleTheme = jest.fn();
      render(<Navbar theme="dark" toggleTheme={toggleTheme} />);

      expect(screen.getByText('The Lighthouse')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });

    test('calls toggleTheme when clicked', () => {
      const toggleTheme = jest.fn();
      render(<Navbar theme="dark" toggleTheme={toggleTheme} />);

      const themeButton = screen.getByRole('button');
      fireEvent.click(themeButton);
      expect(toggleTheme).toHaveBeenCalledTimes(1);
    });

    test('Navbar Snapshot matches design', () => {
      const { asFragment } = render(<Navbar theme="dark" toggleTheme={jest.fn()} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('ReservationForm Component', () => {
    test('submits successfully and shows success message', async () => {
      api.post.mockResolvedValueOnce({ data: { message: 'Reservation confirmed!' } });

      const { container } = render(<ReservationForm />);

      fireEvent.change(screen.getByPlaceholderText('Your Name'), { target: { value: 'Vansh' } });
      fireEvent.change(screen.getByPlaceholderText('Your Email'), { target: { value: 'vansh@example.com' } });
      
      const dateInput = container.querySelector('input[name="date"]');
      const timeInput = container.querySelector('input[name="time"]');
      
      fireEvent.change(dateInput, { target: { value: '2026-07-20' } });
      fireEvent.change(timeInput, { target: { value: '19:00' } });

      fireEvent.click(screen.getByRole('button', { name: /Submit Reservation/i }));

      await waitFor(() => {
        expect(screen.getByText('Reservation confirmed!')).toBeInTheDocument();
      });
    });

    test('ReservationForm Snapshot matches design', () => {
      const { asFragment } = render(<ReservationForm />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Menu Component', () => {
    test('fetches and renders menu items', async () => {
      const mockItems = [
        { id: 1, name: 'Butter Chicken', category: 'dinner', price: '$15.99' },
        { id: 2, name: 'Masala Dosa', category: 'breakfast', price: '$8.99' }
      ];
      api.get.mockResolvedValueOnce({ data: mockItems });

      render(<Menu />);

      await waitFor(() => {
        expect(screen.getByText('Butter Chicken')).toBeInTheDocument();
        expect(screen.getByText('Masala Dosa')).toBeInTheDocument();
      });
    });

    test('Menu Snapshot matches design', async () => {
      const mockItems = [
        { id: 1, name: 'Butter Chicken', category: 'dinner', price: '$15.99' }
      ];
      api.get.mockResolvedValueOnce({ data: mockItems });
      const { asFragment } = render(<Menu />);
      await screen.findByText('Butter Chicken');
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
