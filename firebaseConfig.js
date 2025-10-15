// firebaseConfig.js
import { initializeApp } from '@react-native-firebase/app';
import { getMessaging } from '@react-native-firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyC9MYNdJx5YyQ1ejXYkKEu48GKQnjhAZOw',
  authDomain: 'istreams-smart-13482.firebasestorage.app',
  projectId: 'istreams-smart-13482',
  storageBucket: 'istreams-smart-13482.appspot.com',
  messagingSenderId: '427433697986',
  appId: '1:427433697986:android:8e780e276d5f769d71115b',
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export { firebaseApp, messaging };