import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useRouter, useSegments } from 'expo-router';

interface UseBackHandlerOptions {
  onBack?: () => boolean | void;
  preventDefault?: boolean;
}

export const useBackHandler = (options: UseBackHandlerOptions = {}) => {
  const router = useRouter();
  const segments = useSegments();
  const { onBack, preventDefault = false } = options;

  useEffect(() => {
    const backAction = () => {
      // If custom handler is provided, use it
      if (onBack) {
        const result = onBack();
        if (result === true) {
          return true; // Prevent default behavior
        }
        if (result === false) {
          return false; // Allow default behavior
        }
      }

      // If preventDefault is true, don't handle back press
      if (preventDefault) {
        return false;
      }

      const currentRoute = segments.join('/');
      
      // If we're on the root screen, exit the app
      if (currentRoute === 'index' || currentRoute === '') {
        BackHandler.exitApp();
        return true;
      }
      
      // Otherwise, go back
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [segments, router, onBack, preventDefault]);
};

export default useBackHandler;
