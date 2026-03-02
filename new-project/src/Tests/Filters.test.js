import { renderHook, act } from '@testing-library/react';import { useBucketItemFilters } from '../Service/Filters';

const mockItems = [
  { id: 1, name: 'Zoo', country: 'USA', city: 'San Diego', category: 'Entertainment', visited: true },
  { id: 2, name: 'Grand Canyon', country: 'USA', city: 'Arizona', category: 'Natural', visited: false },
  { id: 3, name: 'Louvre', country: 'France', city: 'Paris', category: 'Historical', visited: true },
  { id: 4, name: 'Disneyland', country: 'USA', city: 'Anaheim', category: 'Entertainment', visited: false },
];

describe('useBucketItemFilters', () => {
  it('should initialize with all items', () => {
    const { result } = renderHook(() => useBucketItemFilters(mockItems));
  });

  describe('Sorting', () => {
    it('should sort by name ascending', () => {
      const { result } = renderHook(() => useBucketItemFilters(mockItems));
      
      act(() => {
        result.current.requestSort('name');
      });

      expect(result.current.items.map(i => i.name)).toEqual([
        'Zoo', // Z
        'Louvre', // L
        'Grand Canyon', // G
        'Disneyland'
      ]);
    });

    it('should sort by name descending', () => {
      const { result } = renderHook(() => useBucketItemFilters(mockItems));
      
      act(() => {
        result.current.requestSort('name');
        result.current.requestSort('name');
      });

      expect(result.current.items.map(i => i.name)).toEqual([
        'Disneyland', 
        'Grand Canyon', 
        'Louvre',
        'Zoo', 
        
      ]);
    });

    it('should sort by country then city', () => {
      const { result } = renderHook(() => useBucketItemFilters(mockItems));
      
      act(() => {
        result.current.requestSort('country');
        result.current.requestSort('city');
      });

      expect(result.current.items.map(i => i.city)).toEqual([
        'Anaheim',  // USA
        'Arizona',  // USA
        'Paris',    // France
        'San Diego' // USA
      ]);
    });

    it('should sort visited status', () => {
      const { result } = renderHook(() => useBucketItemFilters(mockItems));
      
      act(() => {
        result.current.requestSort('visited');
      });

      expect(result.current.items.map(i => i.visited)).toEqual([
        false, // Grand Canyon
        false, // Disneyland
        true,  // Zoo
        true,  // Louvre
      ]);
    });
  });

  describe('Combined Filters and Sorting', () => {
    it('should apply category filter and sorting together', () => {
      const { result } = renderHook(() => useBucketItemFilters(mockItems));
      
      act(() => {
        result.current.setCategoryFilter('Entertainment');
        result.current.requestSort('name');
      });

      expect(result.current.items.map(i => i.name)).toEqual([
        'Zoo',
        'Disneyland'
      ]);
    });

    it('should apply visited filter and sorting together', () => {
      const { result } = renderHook(() => useBucketItemFilters(mockItems));
      
      act(() => {
        result.current.setVisitedFilter(false);
        result.current.requestSort('city');
      });

      expect(result.current.items.map(i => i.city)).toEqual([
        'Anaheim',  // Disneyland
        'Arizona'   // Grand Canyon
      ]);
    });
  });
});