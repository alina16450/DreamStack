import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Service/Home';
import { useBucket } from '../Repository/BucketContext';
import { useBucketItemFilters } from '../Service/Filters';

jest.mock('../Repository/BucketContext');
jest.mock('../Service/Filters');

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

describe('Home Component', () => {
  const mockSetItems = jest.fn();
  const mockSetCategoryFilter = jest.fn();
  const mockSetVisitedFilter = jest.fn();
  const mockRequestSort = jest.fn();

  beforeEach(() => {
    useBucket.mockReturnValue({
      getItems: jest.fn().mockReturnValue(mockItems),
      updateVisited: jest.fn().mockImplementation(id => ({
        ...mockItems.find(item => item.id === id),
        visited: true
      }))
    });

    useBucketItemFilters.mockReturnValue({
      items: mockItems,
      categoryFilter: '',
      setCategoryFilter: mockSetCategoryFilter,
      visitedFilter: null,
      setVisitedFilter: mockSetVisitedFilter,
      sortConfig: { key: 'name', ascending: true },
      requestSort: mockRequestSort,
      setItems: mockSetItems
    });
  });

  test('renders all items by default', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Grand Canyon')).toBeInTheDocument();
    expect(screen.getByText('Louvre')).toBeInTheDocument();
  });

  test('renders navigation buttons', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Home')).toBeInTheDocument();
    expect(screen.getByLabelText('Add')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit')).toBeInTheDocument();
  });

  test('filters items by category', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Natural' }
    });

    expect(mockSetCategoryFilter).toHaveBeenCalledWith('Natural');
  });

  test('filters items by visited status', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'true' }
    });

    expect(mockSetVisitedFilter).toHaveBeenCalledWith(true);
  });

  test('sorts items when clicking column headers', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Country'));
    expect(mockRequestSort).toHaveBeenCalledWith('country');

    fireEvent.click(screen.getByText('City'));
    expect(mockRequestSort).toHaveBeenCalledWith('city');
  });

  test('toggles visited status', () => {
    const mockUpdateVisited = jest.fn();
    useBucket.mockReturnValue({
      getItems: jest.fn().mockReturnValue(mockItems),
      updateVisited: mockUpdateVisited
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    expect(mockUpdateVisited).toHaveBeenCalledWith(1);
    expect(mockSetItems).toHaveBeenCalled();
  });

  test('displays sort indicators', () => {
    useBucketItemFilters.mockReturnValue({
      items: mockItems,
      categoryFilter: '',
      setCategoryFilter: mockSetCategoryFilter,
      visitedFilter: null,
      setVisitedFilter: mockSetVisitedFilter,
      sortConfig: { key: 'name', ascending: false },
      requestSort: mockRequestSort,
      setItems: mockSetItems
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Place ▿')).toBeInTheDocument();
  });

  test('navigates to different routes', () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText('Add'));
    expect(mockNavigate).toHaveBeenCalledWith('/add');
  });
});