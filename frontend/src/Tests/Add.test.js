import { render, screen, fireEvent } from '@testing-library/react';
import Add from '../Service/Add'

describe('Add Component', () => {
    test('renders form', () => {
      render(
        <MemoryRouter>
          <Add />
        </MemoryRouter>
      );
      expect(screen.getByLabelText('Location name:')).toBeInTheDocument();
    });
  });

describe('Add Component', () => {
    test('submits form with correct data', () => {
      const mockAdd = jest.fn();
      render(<Add onAddItem={mockAdd} />);

      fireEvent.change(screen.getByLabelText('Location name:'), {
        target: { value: 'Grand Canyon' }
      });
      fireEvent.change(screen.getByLabelText('Country:'), {
        target: { value: 'USA' }
      });
      fireEvent.change(screen.getByLabelText('City:'), {
        target: { value: 'Flagstaff' }
      });
      const select = screen.getByLabelText('Category:');
      fireEvent.change(select, { target: { value: 'Natural' } 
      });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'A canyon formed over thousands of years' }
      });

      fireEvent.click(screen.getByText('Add +'));
    
    expect(mockAdd).toHaveBeenCalledWith({
      name: 'Grand Canyon',
      country: 'USA',
      city: 'Flagstaff',
      category: 'Natural',
      description: 'A canyon formed over thousands of years'
      });
    });
})

describe('Add Component', () => {
  test('shows validation errors for empty fields', () => {
    render(<Add />);
    fireEvent.click(screen.getByText('Add +'));
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  test('clears form after successful submission', () => {
    const mockAdd = jest.fn();
    render(<Add onAddItem={mockAdd} />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText('Location name:'), { 
      target: { value: 'Test' } 
    });
    // ... other fields
    
    fireEvent.click(screen.getByText('Add +'));
    expect(screen.getByLabelText('Location name:').value).toBe('');
  });

  test('navigates back on cancel', () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate,
    }));

    render(<Add />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});