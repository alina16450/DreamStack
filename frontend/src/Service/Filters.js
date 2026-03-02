import { useMemo, useState } from 'react';


//handles all of the filter and sort logic. Start by initializing hooks for each filter, and for sort.
export const useBucketItemFilters = (initialItems) => {
  const [items, setItems] = useState(initialItems);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [visitedFilter, setVisitedFilter] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    ascending: true
  });

  //if items, categoryFilter, visitedFilter, or sortConfig are triggered then our useMemo is triggered to handle the sort/filter logic based on the category/hook that is given.
  //we use useMemo so that it only runs when it is triggered, and so that it memoizes the results for more effiency. 
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];
    
    // Apply filters
    if (categoryFilter) {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    if (visitedFilter !== null) {
      result = result.filter(item => item.visited === visitedFilter);
    }
  
    // Apply sorting
    return result.sort((a, b) => {
      const valueA = String(a[sortConfig.key]).toLowerCase();
      const valueB = String(b[sortConfig.key]).toLowerCase();
      
      if (valueA === valueB) return 0;
      if (sortConfig.ascending) {
        return valueA < valueB ? -1 : 1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }, [items, categoryFilter, visitedFilter, sortConfig]);

  //the key (class attribute) being passed gets used as the sorting criteria, and if it is clicked a second time the direction changes.
  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      ascending: prev.key === key ? !prev.ascending : true
    }));
  };

  //returns our hooks so they can be set, and once one is changed it triggers filteredAndSortedItems
  return {
    items: filteredAndSortedItems,
    categoryFilter,
    setCategoryFilter,
    visitedFilter,
    setVisitedFilter,
    sortConfig,
    requestSort,
    setItems
  };
};
