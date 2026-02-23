import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/register', {
                email,
                firstName,
                lastName,
                password
            });
            navigate('/login');
        } catch (err: any) {
            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError('Registration failed');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Registrieren</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Vorname</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Nachname</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">E-Mail</label>
                        <input
                            type="email"
                            className="w-full p-2 border rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Passwort</label>
                        <input
                            type="password"
                            className="w-full p-2 border rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
                        Registrieren
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Schon ein Konto? <Link to="/login" className="text-blue-500">Anmelden</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
