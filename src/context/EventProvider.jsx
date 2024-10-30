import { createContext, useContext, useReducer } from 'react';

const EventContext = createContext();
const EventDispatchContext = createContext();

const initialState = {
    event: null,
    persons: [],
    expenses: [],
    error: null,
};

const eventReducer = (state, action) => {
    switch (action.type) {
        case 'SET_EVENT':
            return { ...state, event: action.payload };
        case 'ADD_PERSON':
            return { ...state, persons: [...state.persons, action.payload] };
        case 'ADD_EXPENSE':
            return { ...state, expenses: [...state.expenses, action.payload] };
        case 'UPDATE_PAID_STATUS':
            return {
                ...state,
                expenses: state.expenses.map(expense =>
                    expense.id === action.payload.id ? { ...expense, paid: action.payload.paid } : expense
                ),
            };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
};

export const EventProvider = ({ children }) => {
    const [state, dispatch] = useReducer(eventReducer, initialState);

    return (
        <EventContext.Provider value={state}>
            <EventDispatchContext.Provider value={dispatch}>
                {children}
            </EventDispatchContext.Provider>
        </EventContext.Provider>
    );
};

export const useEvent = () => {
    const context = useContext(EventContext);
    if (context === undefined) {
        throw new Error('');
    }
    return context;
};

export const useEventDispatch = () => {
    const context = useContext(EventDispatchContext);
    if (context === undefined) {
        throw new Error('');
    }
    return context;
};

// Fonction pour récupérer un événement depuis l'API
export const fetchEvent = async (dispatch, id) => {
    const apiUrl = import.meta.env.REACT_APP_API_URL;
    try {
        const response = await fetch(`${apiUrl}/events/${id}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération de l\'événement');
        }
        const data = await response.json();
        dispatch({ type: 'SET_EVENT', payload: data });
    } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
    }
};

// Fonction pour ajouter une personne à un événement
export const addPersonToEvent = async (dispatch, personData) => {
    const apiUrl = import.meta.env.REACT_APP_API_URL;
    try {
        const response = await fetch(`${apiUrl}/add-person`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(personData),
        });
        if (!response.ok) {
            throw new Error('Erreur lors de l\'ajout de la personne');
        }
        const data = await response.json();
        dispatch({ type: 'ADD_PERSON', payload: data });
    } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
    }
};

// Fonction pour ajouter une dépense à un événement
export const addExpenseToEvent = async (dispatch, expenseData) => {
    const apiUrl = import.meta.env.REACT_APP_API_URL;
    try {
        const response = await fetch(`${apiUrl}/add-expense`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expenseData),
        });
        if (!response.ok) {
            throw new Error('Erreur lors de l\'ajout de la dépense');
        }
        const data = await response.json();
        dispatch({ type: 'ADD_EXPENSE', payload: data });
    } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
    }
};

// Fonction pour créer un événement
export const createEvent = async (dispatch, eventName) => {
    const apiUrl = import.meta.env.REACT_APP_API_URL;
    try {
        const response = await fetch(`${apiUrl}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: eventName }), // Assurez-vous d'envoyer les données correctes
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || 'Erreur lors de la création de l\'événement');
        }

        const data = await response.json();
        dispatch({ type: 'SET_EVENT', payload: data });
    } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
    }
};

// Fonction pour mettre à jour le statut de paiement d'une dépense
export const updatePaidStatus = async (dispatch, expense, paid) => {
    const apiUrl = import.meta.env.REACT_APP_API_URL;
    try {
        const response = await fetch(`${apiUrl}/update-expense/${expense.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paid }),
        });
        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du statut de paiement');
        }
        dispatch({ type: 'UPDATE_PAID_STATUS', payload: { id: expense.id, paid } });
    } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
    }
};
