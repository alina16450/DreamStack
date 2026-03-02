import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Edit from '../Service/Edit';
import { useBucket } from '../Repository/BucketContext';

jest.mock('../Repository/BucketContext', () => ({
  useBucket: jest.fn()
}));

const mockItems = [
  { 
    id: 1, 
    name: 'Grand Canyon', 
    country: 'USA', 
    city: 'Arizona', 
    category: 'Natural', 
    description: 'Beautiful canyon', 
    visited: false 
  },
  { 
    id: 2, 
    name: 'Louvre', 
    country: 'France', 
    city: 'Paris', 
    category: 'Historical', 
    description: 'Art museum', 
    visited: true 
  }
];

describe('Edit Component', () => {
  beforeEach(() => {
    useBucket.mockReturnValue({
      getItems: jest.fn().mockReturnValue(mockItems),
      updateItem: jest.fn(),
      deleteItem: jest.fn()
    });
  });

  test('renders item table', () => {
    render(
      <MemoryRouter>
        <Edit />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Grand Canyon')).toBeInTheDocument();
    expect(screen.getByText('Louvre')).toBeInTheDocument();
  });

  test('selects item for editing', () => {
    render(
      <MemoryRouter>
        <Edit />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByText('Grand Canyon'));
    
    expect(screen.getByText('Editing: Grand Canyon')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Grand Canyon')).toBeInTheDocument();
    expect(screen.getByDisplayValue('USA')).toBeInTheDocument();
  });

  test('updates item with valid data', async () => {
    const mockUpdate = jest.fn();
    useBucket.mockReturnValue({
      getItems: jest.fn().mockReturnValue(mockItems),
      updateItem: mockUpdate,
      deleteItem: jest.fn()
    });

    render(
      <MemoryRouter>
        <Edit />
      </MemoryRouter>
    );
    
    // Select item
    fireEvent.click(screen.getByText('Grand Canyon'));
    
    // Modify fields
    fireEvent.change(screen.getByDisplayValue('Grand Canyon'), {
      target: { value: 'Updated Canyon' }
    });
    fireEvent.change(screen.getByDisplayValue('USA'), {
      target: { value: 'United States' }
    });
    
    // Submit update
    fireEvent.click(screen.getByText('Update'));
    
    expect(mockUpdate).toHaveBeenCalledWith(
      1,
      'Updated Canyon',
      'United States',
      'Arizona',
      'Natural',
      'Beautiful canyon'
    );
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  test('shows validation errors for invalid data', () => {
    render(
      <MemoryRouter>
        <Edit />
      </MemoryRouter>
    );
    
    // Select item
    fireEvent.click(screen.getByText('Grand Canyon'));
    
    // Enter invalid data
    fireEvent.change(screen.getByDisplayValue('Grand Canyon'), {
      target: { value: 'Canyon123' } // Numbers not allowed
    });
    
    fireEvent.click(screen.getByText('Update'));
    
    expect(screen.getByText('Location name must contain only letters and spaces')).toBeInTheDocument();
  });

  test('deletes item', () => {
    const mockDelete = jest.fn();
    useBucket.mockReturnValue({
      getItems: jest.fn().mockReturnValue(mockItems),
      updateItem: jest.fn(),
      deleteItem: mockDelete
    });

    render(
      <MemoryRouter>
        <Edit />
      </MemoryRouter>
    );
    
    // Click delete button on first item
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    
    expect(mockDelete).toHaveBeenCalledWith(1);
  });

  test('clears selection when deleted item is currently selected', () => {
    const { container } = render(
      <MemoryRouter>
        <Edit />
      </MemoryRouter>
    );
    
    // Select and then delete the same item
    fireEvent.click(screen.getByText('Grand Canyon'));
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    
    expect(container.querySelector('.edit-form')).not.toBeInTheDocument();
  });

  test('shows error when updating with empty fields', () => {
    render(
      <MemoryRouter>
        <Edit />
      </MemoryRouter>
    );
    
    // Select item
    fireEvent.click(screen.getByText('Grand Canyon'));
    
    // Clear required field
    fireEvent.change(screen.getByDisplayValue('Grand Canyon'), {
      target: { value: '' }
    });
    
    fireEvent.click(screen.getByText('Update'));
    
    expect(screen.getByText('All fields are required')).toBeInTheDocument();
  });
});