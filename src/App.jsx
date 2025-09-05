import { useState } from 'react';
import EmailMessageSender from "./components/EmailMessageSender";
import EmailChecker from "./components/EmailChecker";

function App() {
    const [activeTab, setActiveTab] = useState('check');

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full max-w-5xl mx-auto pt-4 px-3">
                <div className="flex items-center justify-center mb-4">
                    <div className="inline-flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'check' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => setActiveTab('check')}
                        >
                            Email Checker
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'send' ? 'bg-indigo-600 text-white shadow' : 'text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => setActiveTab('send')}
                        >
                            Email Message Sender
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'check' ? (
                <EmailChecker />
            ) : (
                <EmailMessageSender />
            )}
        </div>
    );
}

export default App;

