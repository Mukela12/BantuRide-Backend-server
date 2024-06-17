import admin from 'firebase-admin';

const initFirebaseAdmin = () => {
    if (!admin.apps.length) { // checks if an app is already initialized
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: "banturide-f6146",
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
    }
    return admin.firestore();
};

export default initFirebaseAdmin;
