import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, updateDoc } from '@firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebaseConfig';

interface FontSizeContextProps {
  fontSizeClass: string;
  setFontSizeClass: (className: string) => void;
}

const FontSizeContext = createContext<FontSizeContextProps | undefined>(undefined);

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};

const FONT_SIZE_KEY = 'fontSizeClass';

export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
  const user = useAuth();
  const [fontSizeClass, setFontSizeClass] = useState('');

  useEffect(() => {
    const fetchFontSize = async () => {
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData[FONT_SIZE_KEY]) {
          setFontSizeClass(userData[FONT_SIZE_KEY]);
          document.documentElement.classList.add(userData[FONT_SIZE_KEY]);
        }
      }
    };

    fetchFontSize();
  }, [user]);

  const updateFontSizeClass = async (className: string) => {
    if (!user) return;

    // Remove the current class
    if (fontSizeClass) {
      document.documentElement.classList.remove(fontSizeClass);
    }
    // Add the new class
    setFontSizeClass(className);
    if (className !== '') {
      document.documentElement.classList.add(className);
    }

    await updateDoc(doc(db, 'users', user.uid), {
      [FONT_SIZE_KEY]: className,
    });
  };

  return (
    <FontSizeContext.Provider value={{ fontSizeClass, setFontSizeClass: updateFontSizeClass }}>
        {children}
    </FontSizeContext.Provider>
  );
};
