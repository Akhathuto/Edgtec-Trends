import React, { useState, useEffect } from 'react';
import { AgentSettings } from '../types.ts';
import Modal from './Modal.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

interface AgentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AgentSettings;
  onSave: (settings: AgentSettings) => void;
}

const AgentSettingsModal: React.FC<AgentSettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [model, setModel] = useState(currentSettings.model);
  const [temperature, setTemperature] = useState(currentSettings.temperature);

  useEffect(() => {
    if (isOpen) {
        setModel(currentSettings.model);
        setTemperature(currentSettings.temperature);
    }
  }, [currentSettings, isOpen]);

  const handleSave = () => {
    if (model === 'gemini-2.5-pro-latest' && user?.plan !== 'pro') {
      showToast('The Pro model is only available on the Pro plan.');
      // Revert the selection in the UI if user tries to save an invalid option
      setModel('gemini-2.5-flash'); 
      return;
    }
    onSave({ model, temperature });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Agent Settings" footer={
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors">Cancel</button>
          <button onClick={handleSave} className="bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">Save Settings</button>
        </div>
    }>
      <div className="space-y-6 text-slate-300">
        <div>
          <label htmlFor="agent-model" className="block text-sm font-medium text-slate-300 mb-2">
            AI Model
          </label>
          <select
            id="agent-model"
            value={model}
            onChange={(e) => setModel(e.target.value as AgentSettings['model'])}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast & Balanced)</option>
            <option value="gemini-2.5-pro-latest" disabled={user?.plan !== 'pro'}>
              Gemini 2.5 Pro (Highest Quality) {user?.plan !== 'pro' && '(Pro Plan only)'}
            </option>
          </select>
          <p className="text-xs text-slate-500 mt-1">"Pro" model provides more nuanced and higher-quality responses.</p>
        </div>
        <div>
          <label htmlFor="agent-temperature" className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
            <span>Creativity (Temperature)</span>
            <span className="font-bold text-violet-300">{temperature.toFixed(1)}</span>
          </label>
          <input
            id="agent-temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>More Precise</span>
            <span>More Creative</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AgentSettingsModal;
