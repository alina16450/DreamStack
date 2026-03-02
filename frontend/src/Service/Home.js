import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useBucket } from '../Repository/BucketContext';
import { useBucketItemFilters } from './Filters';
import './Repo.css';
import api from '../api';

//the home page which displays a table, allows for filtering, sorting, and modifying the visited attribute.
export default function Home() {
  const [error, setError] = useState('');
  const bucketRepo = useBucket();
  //our hook components needed for filtering and sorting.
  const {
    items: filteredItems,
    categoryFilter,
    setCategoryFilter,
    visitedFilter,
    setVisitedFilter,
    sortConfig,
    requestSort,
    setItems
  } = useBucketItemFilters([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError("Please log in first.");
      navigate('/account');
      return;
    }
    setError('');
  }, [token]);
  
  useEffect(() => {
  const fetchItems = async () => {
    try {
      const params = {};

      if (categoryFilter) {
        params.category = categoryFilter;
      }

      if (visitedFilter !== null) {
        params.visited = visitedFilter; 
      }

      if (sortConfig?.key) {
        params.sort_key = sortConfig.key.toLowerCase();
        params.reverse = !sortConfig.ascending;
      }
      const response = await api.get('/', { params });
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  fetchItems();
}, [categoryFilter, visitedFilter, sortConfig, setItems]);

  
  const handleVisitedChange = async (itemId) => {
    try {
      const updatedItem = await bucketRepo.updateVisited(itemId);
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? updatedItem : item
        )
      );
    } catch (err) {
      console.error("Failed to update visited status", err);
    }
  };

  //handles the count of our bucketItem which is used to display the statistis of the table. How many total instances, how many visited, which is the most popular category.
  const getStatistics = () => {
    if (filteredItems.length === 0) return {};
    
    const visitedCount = filteredItems.filter(item => item.visited).length;
    const notVisitedCount = filteredItems.length - visitedCount;
    
    const categoryCounts = {};
    filteredItems.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });
    const mostCommonCategory = Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b, 'None');

    return {
      totalItems: filteredItems.length,
      visitedCount,
      notVisitedCount,
      mostCommonCategory,
    };
  };

  const stats = getStatistics();

  //has as input each item that gets entered into the table, and checks if it has the mostCommonCategory. If it does, it attaches a custom tag to it. 
  //this custom tag is used in Repo.css to highlight that table instance. 
  const getHighlightClass = (item) => {
    if (item.category === stats.mostCommonCategory) {
      return 'highlight-common';
    }
    return '';
  };

  let navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="home">
      <div className="page-container">
        <header className="header">
          <h1>DreamStack</h1>
          <nav className='nav'>
            <button 
              className={`b1 ${location.pathname === '/' ? 'active-nav' : ''}`}
              onClick={() => navigate('/')}
            >
              <i className="bi bi-house-door"></i>
            </button>
            <button 
              className={`b2 ${location.pathname === '/add' ? 'active-nav' : ''}`}
              onClick={() => navigate('/add')}
            >
              <i className="bi bi-plus-lg"></i>
            </button>
            <button 
              className={`b3 ${location.pathname === '/edit' ? 'active-nav' : ''}`}
              onClick={() => navigate('/edit')}
            >
              <i className="bi bi-pencil-square"></i>
            </button>
              <button 
                  className={`b4 ${location.pathname === '/account' ? 'active-nav' : ''}`}
                  onClick={() => navigate('/account')}
              >
                <i className="bi bi-person"></i>
              </button>
          </nav>
        </header>
        <h5 className="tagline">Save it. Plan it. Live it.</h5>

        <div className="stats-summary">
          <div className="stat-card">
            <h3>Total Items</h3>
            <p>{stats.totalItems}</p>
          </div>
          <div className="stat-card">
            <h3>Visited</h3>
            <p>{stats.visitedCount}</p>
          </div>
          <div className="stat-card">
            <h3>Not Visited</h3>
            <p>{stats.notVisitedCount}</p>
          </div>
          <div className="stat-card">
            <h3>Top Category</h3>
            <p>{stats.mostCommonCategory}</p>
          </div>
        </div>

        <div className="filter-dropdowns">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="Historical">Historical</option>
            <option value="Natural">Natural</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Cultural">Cultural</option>
            <option value="Educational">Educational</option>
            <option value="Adventure">Adventure</option>
          </select>
          <select 
            value={visitedFilter ?? ''} 
            onChange={(e) => setVisitedFilter(e.target.value === '' ? null : e.target.value === 'true')}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="true">Visited</option>
            <option value="false">Not Visited</option>
          </select>
        </div>
        <div className="body">
          {error && <div className="error">{error}</div>}
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('name')}>
                  Place {sortConfig.key === 'name' && (sortConfig.ascending ? '▵' : '▿')}
                </th>
                <th onClick={() => requestSort('country')}>
                  Country {sortConfig.key === 'country' && (sortConfig.ascending ? '▵' : '▿')}
                </th>
                <th onClick={() => requestSort('city')}>
                  City {sortConfig.key === 'city' && (sortConfig.ascending ? '▵' : '▿')}
                </th>
                <th onClick={() => requestSort('category')}>
                  Category {sortConfig.key === 'category' && (sortConfig.ascending ? '▵' : '▿')}
                </th>
                <th>Description</th>
                <th onClick={() => requestSort('visited')}>
                  Visited {sortConfig.key === 'visited' && (sortConfig.ascending ? '▵' : '▿')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.country}</td>
                  <td>{item.city}</td>
                  <td className={getHighlightClass(item)}>
                    {item.category}
                    {item.category === stats.mostCommonCategory && (
                      <span className="common-tag">Most Common</span>
                    )}
                  </td>
                  <td className="truncate-cell" title={item.description}>
                    {item.description}
                  </td>
                  <td>
                    <input
                      //calls on our handleVisitedChange when the checkbox for visited is clicked, for that respective row.
                      type="checkbox"
                      className="check-mark"
                      checked={item.visited}
                      onChange={() => handleVisitedChange(item.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
