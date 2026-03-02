import { useState, useEffect } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useBucket } from '../Repository/BucketContext';
import './Repo.css'
import "bootstrap-icons/font/bootstrap-icons.css";

//contains all of the logic for editing/deleting an item.
export default function Edit () {
    //call bucketRepo to use the function from Repository. useState hooks to handle the selected item, existing data, and the input labels.
    const bucketRepo = useBucket();
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
      name: '',
      country: '',
      city: '',
      category: '',
      description: ''
    });
    const [error, setError] = useState();

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
            const response = await bucketRepo.getItems();
            setItems(response);
          } catch (error) {
            console.error("Failed to fetch items:", error);
          }
        }
        fetchItems();
      }, [bucketRepo]);

    //when an item is selected, its data is automatically used to fill the input labels, for convenience and better user experience.
    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setFormData({
          name: item.name,
          country: item.country,
          city: item.city,
          category: item.category,
          description: item.description
        });
    };

    const handleUpdate = async () => {
        if (!selectedItem) return;

        //again checking that only letters are inputted for all except description.
        const textOnlyPattern = /^[A-Za-z\s]+$/;

        //ensure no fields are left empty.
        if (!formData.name || !formData.country || !formData.city || !formData.category || !formData.description) {
        setError('All fields are required');
        return;
        }
        if (!textOnlyPattern.test(formData.name)) {
        setError('Location name must contain only letters and spaces');
        return;
        }
    
        if (!textOnlyPattern.test(formData.country)) {
        setError('Country must contain only letters and spaces');
        return;
        }
    
        if (!textOnlyPattern.test(formData.city)) {
        setError('City must contain only letters and spaces');
        return;
        }
    
          const updateData = {
          name: formData.name,
          country: formData.country,
          city: formData.city,
          category: formData.category,
          description: formData.description
        };

        try {
          console.log('Sending update:', {
            itemId: selectedItem.id,
            updateData
          });

          const updatedItem = await bucketRepo.editItem(selectedItem.id, updateData);
          
          console.log('Update response:', updatedItem);
          
          // Verify the updated item reflects the changes
          console.assert(
            updatedItem.category === formData.category, 
            'Category was not updated correctly'
          );

          const updatedItems = await bucketRepo.getItems();
          setItems(updatedItems);
        }
        catch (error) {
          console.error('Error updating item:', error);
          setError('Failed to update item');
        }
        setError('');
      };

    const handleDelete = async (id, e) => {
      if (e) e.stopPropagation();
      try {
        await bucketRepo.deleteItem(id);

        const updatedItems = await bucketRepo.getItems();
        setItems(updatedItems);

        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(null);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    };

    let navigate = useNavigate();
    const location = useLocation();

    return(
        <div className = "edit">
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

      <div className="edit-container">
        <h2 className="edit-title">Edit mode</h2>
        <h3 className="edit-subtitle">Click on the entry to modify:</h3>
          <div className="body">
        <table>
          <thead>
            <tr>
              <th>Place</th>
              <th>Country</th>
              <th>City</th>
              <th>Category</th>
              <th>Description</th>
              <th>Visited</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const editing = selectedItem?.id === item.id;
              return (
                <tr
                  key={item.id}
                  className={editing ? 'selected-row' : ''}
                  onClick={() => handleSelectItem(item)}
                >
                  <td>
                    {editing
                      ? <input
                          value={formData.name}
                          onClick={e => e.stopPropagation()}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="inline-input"
                        />
                      : item.name
                    }
                  </td>

                  <td>
                    {editing
                      ? <input
                          value={formData.country}
                          onClick={e => e.stopPropagation()}
                          onChange={e => setFormData({ ...formData, country: e.target.value })}
                          className="inline-input"
                        />
                      : item.country
                    }
                  </td>

                  <td>
                    {editing
                      ? <input
                          value={formData.city}
                          onClick={e => e.stopPropagation()}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                          className="inline-input"
                        />
                      : item.city
                    }
                  </td>

                  <td>
                    {editing
                      ? <select
                          value={formData.category}
                          onClick={e => e.stopPropagation()}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="inline-input"
                        >
                          <option value="">Select…</option>
                          <option value="Historical">Historical</option>
                          <option value="Natural">Natural</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Cultural">Cultural</option>
                          <option value="Educational">Educational</option>
                          <option value="Adventure">Adventure</option>
                        </select>
                      : item.category
                    }
                  </td>

                  <td>
                    {editing
                      ? <input
                          value={formData.description}
                          onClick={e => e.stopPropagation()}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          className="inline-input"
                        />
                      : item.description
                    }
                  </td>

                  <td>
                    {editing
                      ? <button
                          className="btn btn-sm btn-primary"
                          onClick={e => { e.stopPropagation(); handleUpdate(); }}
                        >
                          Save
                        </button>
                      : (item.visited ? 'Yes' : 'No')
                    }
                  </td>

                  <td className="last">
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                    >
                      <i className="bi bi-trash3-fill"></i>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
          {error && <div className="error">{error}</div>}
        </div>
        </div>
        </div>
        </div>
    )
}
