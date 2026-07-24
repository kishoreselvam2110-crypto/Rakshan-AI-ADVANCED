import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Plus, Trash2, Heart, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { api } from '../utils/api';
import { toast } from 'sonner';

export default function OfflineKitManager({ userId, currentSettings = {}, onSettingsUpdated }) {
  const [bloodType, setBloodType] = useState('Unknown');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [insurancePolicy, setInsurancePolicy] = useState('');
  const [customContacts, setCustomContacts] = useState([]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setBloodType(currentSettings.bloodType || 'Unknown');
      setAllergies(currentSettings.allergies || '');
      setConditions(currentSettings.conditions || '');
      setInsurancePolicy(currentSettings.insurancePolicy || '');
      setCustomContacts(currentSettings.customContacts || []);
    }
  }, [currentSettings]);

  const handleAddContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      toast.error('Contact name and number are required.');
      return;
    }
    setCustomContacts([...customContacts, { name: contactName.trim(), number: contactPhone.trim() }]);
    setContactName('');
    setContactPhone('');
  };

  const handleRemoveContact = (index) => {
    setCustomContacts(customContacts.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        userId,
        bloodType,
        allergies,
        conditions,
        insurancePolicy,
        customContacts
      };
      const { data } = await axios.post(api('/api/offline-kit/settings'), payload);
      if (data.success) {
        toast.success('Offline Kit preferences saved successfully.');
        if (onSettingsUpdated) {
          onSettingsUpdated(payload);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings to server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 border border-white/5 space-y-6"
    >
      <div>
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Heart className="text-rose-400" size={20} /> Personal Safety Profile
        </h3>
        <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mt-0.5">
          These details are encrypted and stored in your offline safety kit
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block">Blood Type</label>
            <select
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {['Unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((t) => (
                <option key={t} value={t} className="bg-neutral-900 text-white">{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block">Insurance Policy No.</label>
            <input
              type="text"
              value={insurancePolicy}
              onChange={(e) => setInsurancePolicy(e.target.value)}
              placeholder="e.g. SHIELD-100234-A"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block">Medical Allergies</label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Peanuts (or 'None declared')"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block">Chronic Conditions</label>
            <textarea
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="e.g. Asthma, Hypertension (or 'None declared')"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Custom Emergency Contacts Section */}
        <div className="border-t border-white/5 pt-4 space-y-4">
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <Phone size={14} className="text-indigo-400" /> Additional Emergency Contacts
            </h4>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mt-0.5">
              Add family members, tour group guides, or embassy details
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact Name"
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/20 flex-grow focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Phone Number"
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/20 sm:w-[180px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddContact}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="space-y-2 mt-2">
            {customContacts.map((c, i) => (
              <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{c.name}</span>
                  <span className="text-[10px] font-bold text-white/40">({c.number})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveContact(i)}
                  className="text-white/40 hover:text-rose-500 transition-colors p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-white text-black hover:bg-white/95 rounded-2xl text-sm font-black shadow-lg"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
