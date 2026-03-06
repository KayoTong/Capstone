import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; // Import necessary Firestore functions to manage user documents
import { db } from "../../firebaseConfig"; // Function to ensure a user document exists in Firestore for the given UID, creating it with default values if it doesn't exist

// (andy) this is currently only used for storing geofence settings, but we may want to expand it in the future to include other user-specific data as well, so it's worth having a dedicated function to manage this
export async function ensureUserDocument(uid: string) { // we take the UID as a parameter to ensure we are creating the document for the correct user, and to avoid relying on auth state which may not be available in all contexts where we want to call this function
  const userRef = doc(db, "users", uid); // Create a reference to the user document in the "users" collection, using the UID as the document ID
  const snapshot = await getDoc(userRef); // Attempt to retrieve the document; if it doesn't exist, we will create it with default values

  if (!snapshot.exists()) { // If the document doesn't exist, create it with default geofence settings and a timestamp for when it was created
    await setDoc(userRef, { // Set default values for the user document, including geofence settings and a creation timestamp
      exitRadius: 50,
      geofencingEnabled: false,
      homeLocation: {
        latitude: 0,
        longitude: 0,
      },
      createdAt: new Date(),
    });

    console.log("User document created");
  } else {
    console.log("User document already exists");
  }
}

/**
 * Updates the user's geofence settings and activates monitoring.
 * This is the "Save & Activate" logic for the map setup.
 */
export async function updateGeofenceSettings(
  uid: string, 
  latitude: number, 
  longitude: number, 
  radius: number
) {
  const userRef = doc(db, "users", uid); // Reference the specific user document
  
  await updateDoc(userRef, {
    homeLocation: { 
      latitude: latitude, 
      longitude: longitude 
    },
    exitRadius: radius,
    geofencingEnabled: true, // This turns the system "ON"
    updatedAt: new Date(),
  });

  console.log("Geofence settings updated and activated!");
}