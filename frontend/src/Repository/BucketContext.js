import React, { createContext, useContext } from 'react';
import api from '../api';

//using createContext in order to initialize one Repo for each of my 3 pages, to avoid having to pass any changes between them. These children get passed in App.js where the separate pages
//are initialized.
const BucketContext = createContext();

//initialize the repository class, and pass it to children.
export const BucketProvider = ({ children }) => {
  const getItems = async () => {
    const response = await api.get('/');
    return response.data;
  };

  const updateVisited = async (itemId) => {
    const response = await api.put(`/items/${itemId}/visited`);
    return response.data;
  };

  const addItem = async (itemData) => {
    const response = await api.post('/add', itemData);
    return response.data;
  };

  const deleteItem = async (itemId) => {
    await api.delete(`/delete/${itemId}`);
  };

const editItem = async (itemId, itemData) => {
    const response = await api.put(`/edit/${itemId}`, itemData);
    return response.data;
};

  return (
    <BucketContext.Provider value={{ getItems, updateVisited, addItem, deleteItem, editItem }}>
      {children}
    </BucketContext.Provider>
  );
};

export const useBucket = () => useContext(BucketContext);