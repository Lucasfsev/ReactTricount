import {
    useEvent,
    useEventDispatch,
    fetchEvent,
    addExpenseToEvent,
    updatePaidStatus,
    addPersonToEvent
} from "../context/EventProvider.jsx";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Config() {
    const apiUrl = import.meta.env.REACT_APP_API_URL;
    const dispatch = useEventDispatch();
    const event = useEvent();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isDelayOver, setIsDelayOver] = useState(false);
    const [categories, setCategories] = useState([]);
    const [newParticipant, setNewParticipant] = useState({ firstName: '', lastName: '', category: '' });
    const [participants, setParticipants] = useState([]);
    const [newExpense, setNewExpense] = useState({ title: '', amount: '', date: '', category: '', person: '' });
    const [modalParticipantVisible, setModalParticipantVisible] = useState(false);
    const [modalExpenseVisible, setModalExpenseVisible] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadEvent = async () => {
            await fetchEvent(dispatch, id);
            setParticipants(event?.persons || []);
            setIsLoading(false);
        };

        const getCategories = async () => {
            const response = await fetch(`${apiUrl}/categories`);
            const data = await response.json();
            setCategories(data.member);
        };

        loadEvent();
        getCategories();

        const timeoutId = setTimeout(() => {
            setIsDelayOver(true);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [id, dispatch, apiUrl, event?.persons]);

    const handleAddParticipant = async (e) => {
        e.preventDefault();
        if (!newParticipant.firstName || !newParticipant.lastName) {
            setError('Veuillez renseigner tous les champs.');
            return;
        }

        const addedPerson = await addPersonToEvent({
            ...newParticipant,
            event: `${apiUrl}/events/${id}`
        });
        setParticipants([...participants, addedPerson]);
        setNewParticipant({ firstName: '', lastName: '', category: '' });
        setError('');
        setModalParticipantVisible(false);
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!newExpense.title || !newExpense.amount || !newExpense.date || !newExpense.category || !newExpense.person) {
            setError('Veuillez remplir tous les champs.');
            return;
        }

        const expenseData = {
            title: newExpense.title,
            amount: parseFloat(newExpense.amount),
            date: newExpense.date,
            category: newExpense.category,
            person: newExpense.person,
            event: `${apiUrl}/events/${id}`
        };

        await addExpenseToEvent(dispatch, expenseData);
        setNewExpense({ title: '', amount: '', date: '', category: '', person: '' });
        setModalExpenseVisible(false);
    };

    const filterExpenses = () => {
        return event.expenses.filter(expense => {
            const matchesPerson = personFilter ? expense.person['@id'] === personFilter : true;
            const matchesCategory = categoryFilter ? expense.category['@id'] === categoryFilter : true;
            const matchesAmount = (amountRange.min ? expense.amount >= amountRange.min : true) &&
                (amountRange.max ? expense.amount <= amountRange.max : true);
            return matchesPerson && matchesCategory && matchesAmount;
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="flex flex-col gap-8 bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
                {isLoading || !isDelayOver ? (
                    <p className="text-center text-lg text-gray-600">Chargement...</p>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold text-purple-800 mb-4 text-center">Gestion du groupe</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Participants Section */}
                            <div className="bg-gray-50 shadow-md rounded-lg p-6">
                                <h3 className="text-2xl font-semibold text-purple-700 mb-4">Participants</h3>
                                <button
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium p-3 rounded-lg transition"
                                    onClick={() => setModalParticipantVisible(true)}
                                >
                                    + Ajouter un participant
                                </button>

                                {modalParticipantVisible && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-70 p-4">
                                        <div className="relative bg-white p-6 shadow-lg rounded-lg w-full max-w-lg">
                                            <button
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                                onClick={() => setModalParticipantVisible(false)}
                                            >
                                                X
                                            </button>
                                            <h3 className="text-xl font-semibold mb-4 text-center">Ajouter un Participant</h3>
                                            <form onSubmit={handleAddParticipant} className="flex flex-col gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Prénom"
                                                    value={newParticipant.firstName}
                                                    onChange={(e) => setNewParticipant({ ...newParticipant, firstName: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Nom"
                                                    value={newParticipant.lastName}
                                                    onChange={(e) => setNewParticipant({ ...newParticipant, lastName: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                                                />
                                                <select
                                                    value={newParticipant.category}
                                                    onChange={(e) => setNewParticipant({ ...newParticipant, category: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                                                >
                                                    <option value=''>Sélectionner une catégorie</option>
                                                    {categories.map(category => (
                                                        <option key={category.id} value={category['@id']}>{category.name}</option>
                                                    ))}
                                                </select>
                                                {error && <p className="text-red-500">{error}</p>}
                                                <button
                                                    type="submit"
                                                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium p-3 rounded-lg transition"
                                                >
                                                    Ajouter
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                <ul className="mt-4 space-y-2">
                                    {participants.map(person => (
                                        <li key={person.id} className="p-2 bg-gray-100 rounded-lg text-gray-700">
                                            {person.firstName} {person.lastName}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Expenses Section */}
                            <div className="bg-gray-50 shadow-md rounded-lg p-6">
                                <h3 className="text-2xl font-semibold text-purple-700 mb-4">Dépenses</h3>
                                <button
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium p-3 rounded-lg transition"
                                    onClick={() => setModalExpenseVisible(true)}
                                >
                                    + Ajouter une dépense
                                </button>

                                {modalExpenseVisible && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-70 p-4">
                                        <div className="relative bg-white p-6 shadow-lg rounded-lg w-full max-w-lg">
                                            <button
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                                onClick={() => setModalExpenseVisible(false)}
                                            >
                                                X
                                            </button>
                                            <h3 className="text-xl font-semibold mb-4 text-center">Ajouter une Dépense</h3>
                                            <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Titre"
                                                    value={newExpense.title}
                                                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Montant"
                                                    value={newExpense.amount}
                                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                                                />
                                                <input
                                                    type="date"
                                                    value={newExpense.date}
                                                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                                                />
                                                <select
                                                    value={newExpense.category}
                                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                                                >
                                                    <option value=''>Sélectionner une catégorie</option>
                                                    {categories.map(category => (
                                                        <option key={category.id} value={category['@id']}>{category.name}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={newExpense.person}
                                                    onChange={(e) => setNewExpense({ ...newExpense, person: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                                                >
                                                    <option value=''>Sélectionner un participant</option>
                                                    {participants.map(person => (
                                                        <option key={person.id} value={person['@id']}>{person.firstName} {person.lastName}</option>
                                                    ))}
                                                </select>
                                                {error && <p className="text-red-500">{error}</p>}
                                                <button
                                                    type="submit"
                                                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium p-3 rounded-lg transition"
                                                >
                                                    Ajouter
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                <ul className="mt-4 space-y-2">
                                    {filterExpenses().map(expense => (
                                        <li key={expense.id} className="p-2 bg-gray-100 rounded-lg text-gray-700">
                                            {expense.title}: {expense.amount} € - {expense.date}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
