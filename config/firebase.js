import admin from 'firebase-admin';
import serviceAccount from './banturide-firebase.json' assert { type: 'json' };

const initFirebaseAdmin = () => {
    if (!admin.apps.length) { // checks if an app is already initialized
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    return admin.firestore();
};

export default initFirebaseAdmin;
