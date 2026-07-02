import React, { createContext, useReducer, useContext } from 'react';

// Initial state for the dashboard
const initialState = {
  users: [],
  loading: false,
  error: null,
};

// Reducer function to handle state changes
function dashboardReducer(state, action) {
  switch (action.type) {
    case 'FETCH_USERS_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_USERS_SUCCESS':
      return { ...state, loading: false, users: action.payload };
    case 'FETCH_USERS_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

// Create the context
const DashboardContext = createContext();

// Custom hook to use the dashboard context
export function useDashboard() {
  return useContext(DashboardContext);
}

// Provider component
export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  );
}