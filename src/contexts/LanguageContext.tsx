// src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '@/api/apiTypes';
import { State } from '@/api/States';
import { District } from '@/api/Districts';

interface LanguageContextType {
  // Current selections
  selectedLanguage: Language | null;
  selectedState: State | null;
  selectedDistrict: District | null;
  
  // Available options
  availableLanguages: Language[];
  availableStates: State[];
  availableDistricts: District[];
  
  // Loading states
  loadingLanguages: boolean;
  loadingStates: boolean;
  loadingDistricts: boolean;
  
  // Actions
  setSelectedLanguage: (language: Language) => void;
  setSelectedState: (state: State) => void;
  setSelectedDistrict: (district: District) => void;
  setAvailableLanguages: (languages: Language[]) => void;
  setAvailableStates: (states: State[]) => void;
  setAvailableDistricts: (districts: District[]) => void;
  setLoadingLanguages: (loading: boolean) => void;
  setLoadingStates: (loading: boolean) => void;
  setLoadingDistricts: (loading: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  
  // State management
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [availableStates, setAvailableStates] = useState<State[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Enhanced language setter that also changes i18n language
  const handleSetSelectedLanguage = (language: Language) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language.code);
    // Reset dependent selections
    setSelectedState(null);
    setSelectedDistrict(null);
    setAvailableStates([]);
    setAvailableDistricts([]);
    
    // Store in localStorage for persistence
    localStorage.setItem('selectedlanguage_id', language.id);
  };

  const handleSetSelectedState = (state: State) => {
    setSelectedState(state);
    // Reset district selection
    setSelectedDistrict(null);
    setAvailableDistricts([]);
    
    // Store in localStorage for persistence
    localStorage.setItem('selectedstate_id', state.id);
  };

  const handleSetSelectedDistrict = (district: District) => {
    setSelectedDistrict(district);
    
    // Store in localStorage for persistence
    localStorage.setItem('selecteddistrict_id', district.id);
  };

  // Restore selections from localStorage on component mount
  useEffect(() => {
    const savedlanguage_id = localStorage.getItem('selectedlanguage_id');
    const savedstate_id = localStorage.getItem('selectedstate_id');
    const saveddistrict_id = localStorage.getItem('selecteddistrict_id');

    if (savedlanguage_id && availableLanguages.length > 0) {
      const savedLanguage = availableLanguages.find(lang => lang.id === savedlanguage_id);
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    }

    if (savedstate_id && availableStates.length > 0) {
      const savedState = availableStates.find(state => state.id === savedstate_id);
      if (savedState) {
        setSelectedState(savedState);
      }
    }

    if (saveddistrict_id && availableDistricts.length > 0) {
      const savedDistrict = availableDistricts.find(district => district.id === saveddistrict_id);
      if (savedDistrict) {
        setSelectedDistrict(savedDistrict);
      }
    }
  }, [availableLanguages, availableStates, availableDistricts]);

  const contextValue: LanguageContextType = {
    selectedLanguage,
    selectedState,
    selectedDistrict,
    availableLanguages,
    availableStates,
    availableDistricts,
    loadingLanguages,
    loadingStates,
    loadingDistricts,
    setSelectedLanguage: handleSetSelectedLanguage,
    setSelectedState: handleSetSelectedState,
    setSelectedDistrict: handleSetSelectedDistrict,
    setAvailableLanguages,
    setAvailableStates,
    setAvailableDistricts,
    setLoadingLanguages,
    setLoadingStates,
    setLoadingDistricts,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageProvider;