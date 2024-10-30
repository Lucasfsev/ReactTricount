import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [newGroupName, setNewGroupName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCreateGroup = async () => {
        setError('');
        if (!newGroupName) {
            setError('Veuillez entrer un nom de groupe');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/ld+json',
                },
                body: JSON.stringify({ name: newGroupName }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur : ${errorText}`);
            }

            const createdEvent = await response.json();
            console.log('Événement créé :', createdEvent);

            if (createdEvent && createdEvent.id) {
                navigate(`/config/${createdEvent.id}`);
            } else {
                console.error('L\'ID de l\'événement n\'est pas défini.');
                setError('Erreur : ID de l\'événement non défini.');
            }
        } catch (error) {
            console.error('Erreur:', error);
            setError('Une erreur est survenue lors de la création du groupe : ' + error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-semibold text-center text-gray-700 mb-4">
                    Créer un nouveau groupe
                </h1>
                <div className="mb-4">
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Entrez le nom du groupe"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-purple-300"
                    />
                </div>
                <button
                    onClick={handleCreateGroup}
                    className="w-full py-3 text-white bg-purple-600 rounded-md hover:bg-purple-700 transition duration-200"
                >
                    Créer le groupe
                </button>
                {error && <div className="mt-4 text-red-500 text-center">{error}</div>}
            </div>
        </div>
    );
};

export default Home;
