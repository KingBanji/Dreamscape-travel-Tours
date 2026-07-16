import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from "firebase/auth";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  setDoc,
  doc, 
  query, 
  where,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import { 
  db, 
  auth, 
  isFirebaseEnabled, 
  signInWithGoogle, 
  saveUserProfile, 
  handleFirestoreError,
  OperationType
} from "./firebase";
import { Booking, Review, Membership, TourPackage } from "../types";
import { MOCK_REVIEWS, TOUR_PACKAGES } from "../data/travelData";

interface FirebaseContextType {
  user: any;
  loading: boolean;
  isDbEnabled: boolean;
  bookings: Booking[];
  reviews: Review[];
  memberships: Membership[];
  tours: TourPackage[];
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  setCredentialsUser: (user: any) => void;
  addBooking: (booking: Omit<Booking, "id" | "dateBooked" | "status" | "userId">) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: "pending" | "confirmed" | "cancelled") => Promise<void>;
  addReview: (review: Omit<Review, "id" | "date" | "avatarColor" | "verified" | "userId">) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  applyMembership: (membership: Omit<Membership, "id" | "status" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  cancelMembership: (membershipId: string) => Promise<void>;
  updateLocalUserFields: (fields: any) => void;
  publishTour: (pkg: TourPackage) => Promise<void>;
  deleteTour: (tourId: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// Helper function to recursively remove undefined fields so Firestore doesn't reject writes
function pruneUndefined(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(pruneUndefined);
  }
  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = pruneUndefined(val);
      }
    }
    return cleaned;
  }
  return obj;
}

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("dreamscape_credentials_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [tours, setTours] = useState<TourPackage[]>(() => {
    try {
      const saved = localStorage.getItem("dreamscape_managed_tours");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((p: any) => {
          const matchingBase = TOUR_PACKAGES.find((bp) => bp.id === p.id);
          return matchingBase ? { ...p, videoUrl: matchingBase.videoUrl || p.videoUrl } : p;
        });
      }
    } catch {
      // fallback
    }
    return TOUR_PACKAGES;
  });

  // Local storage keys for fallbacks
  const BOOKINGS_LOCAL_KEY = "dreamscape_bookings_v2";
  const REVIEWS_LOCAL_KEY = "dreamscape_reviews_v2";
  const MEMBERSHIPS_LOCAL_KEY = "dreamscape_memberships_v2";
  const TOURS_LOCAL_KEY = "dreamscape_managed_tours";

  // 1. Initial Local fallbacks loading
  useEffect(() => {
    try {
      const savedBookings = localStorage.getItem(BOOKINGS_LOCAL_KEY);
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      }
    } catch (e) {
      console.error("Local storage bookings read error", e);
    }

    try {
      const savedReviews = localStorage.getItem(REVIEWS_LOCAL_KEY);
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      } else {
        setReviews(MOCK_REVIEWS);
      }
    } catch (e) {
      setReviews(MOCK_REVIEWS);
    }

    try {
      const savedMemberships = localStorage.getItem(MEMBERSHIPS_LOCAL_KEY);
      if (savedMemberships) {
        setMemberships(JSON.parse(savedMemberships));
      }
    } catch (e) {
      console.error("Local storage memberships read error", e);
    }

    try {
      const savedTours = localStorage.getItem(TOURS_LOCAL_KEY);
      if (savedTours) {
        const parsed = JSON.parse(savedTours);
        const merged = parsed.map((p: any) => {
          const matchingBase = TOUR_PACKAGES.find((bp) => bp.id === p.id);
          return matchingBase ? { ...p, videoUrl: matchingBase.videoUrl || p.videoUrl } : p;
        });
        setTours(merged);
      } else {
        setTours(TOUR_PACKAGES);
      }
    } catch (e) {
      setTours(TOUR_PACKAGES);
    }
  }, []);

  const fetchCredentialsBookings = async (authTokenStr: string) => {
    try {
      const res = await fetch("/api/bookings/my", {
        headers: { "Authorization": `Bearer ${authTokenStr}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.bookings) {
          const mapped: Booking[] = data.bookings.map((b: any) => ({
            id: String(b.id),
            userId: String(b.user_id),
            customerName: b.user_name || "Explorer",
            customerEmail: b.email || "",
            customerPhone: b.phone || "",
            isCustomTour: false,
            preferredStartDate: b.departure_date || b.created_at?.split("T")[0] || "",
            guestsCount: b.seats || 1,
            totalPrice: Number(b.total_price || 0),
            specialRequests: b.notes || "",
            paymentSimulated: true,
            status: b.status || "confirmed",
            dateBooked: b.created_at?.split("T")[0] || "",
            tourName: b.tour_title || "Explorer Tour",
            paymentMethod: "whatsapp"
          }));
          setBookings(mapped);
          localStorage.setItem(BOOKINGS_LOCAL_KEY, JSON.stringify(mapped));
        }
      }
    } catch (e) {
      console.warn("Failed fetching credentials database bookings:", e);
    }
  };

  // 2. Auth state observer & Firestore Real-time Sync
  useEffect(() => {
    if (!isFirebaseEnabled || !auth || !db) {
      setLoading(false);
      return;
    }

    let activeUnsubscribeBookings: (() => void) | null = null;
    let activeUnsubscribeReviews: (() => void) | null = null;
    let activeUnsubscribeMemberships: (() => void) | null = null;

    const cleanupSubscribers = () => {
      if (activeUnsubscribeBookings) {
        activeUnsubscribeBookings();
        activeUnsubscribeBookings = null;
      }
      if (activeUnsubscribeReviews) {
        activeUnsubscribeReviews();
        activeUnsubscribeReviews = null;
      }
      if (activeUnsubscribeMemberships) {
        activeUnsubscribeMemberships();
        activeUnsubscribeMemberships = null;
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      cleanupSubscribers();

      // Check credentials user
      const savedCredentials = localStorage.getItem("dreamscape_credentials_user");
      let resolvedUser = currentUser;
      
      if (savedCredentials && !currentUser) {
        try {
          resolvedUser = JSON.parse(savedCredentials);
        } catch (e) {
          console.error("Failed to parse saved credentials user", e);
        }
      }

      setUser((prev: any) => {
        const prevUid = prev?.uid;
        const nextUid = resolvedUser?.uid;
        if (prevUid !== nextUid) {
          return resolvedUser;
        }
        return prev;
      });
      setLoading(false);

      if (resolvedUser) {
        // Save profile synchronously if it's a real Firebase user
        if (currentUser && !(resolvedUser as any).isCredentialsUser) {
          await saveUserProfile(currentUser).catch(err => {
            console.warn("Failed to save user profile:", err);
          });
        }

        const isAdminEmail = resolvedUser.email === "luyandobanjilb@gmail.com" || (resolvedUser as any).isAdmin || (resolvedUser as any).role === "admin" || localStorage.getItem("dreamscape_is_admin") === "true";

        // If the user registered via Custom Email/Password (Express JWT)
        if ((resolvedUser as any).isCredentialsUser) {
          const uToken = (resolvedUser as any).token;
          if (uToken) {
            fetchCredentialsBookings(uToken);
          }

          // Realtime sync reviews from Firestore (global public reviews remain accessible to all)
          const reviewsPath = "reviews";
          const reviewsQuery = collection(db, reviewsPath);

          activeUnsubscribeReviews = onSnapshot(
            reviewsQuery,
            (snapshot) => {
              const list: Review[] = [];
              snapshot.forEach((docSnap) => {
                list.push(docSnap.data() as Review);
              });
              const merged = [...list, ...MOCK_REVIEWS.filter(r => !list.some(l => l.id === r.id))];
              setReviews(merged);
              localStorage.setItem(REVIEWS_LOCAL_KEY, JSON.stringify(merged));
            },
            (error) => {
              handleFirestoreError(error, OperationType.GET, reviewsPath);
            }
          );
        } else {
          // Standard Firebase User (Google Auth, etc.) runs standard real-time queries
          const bookingsPath = "bookings";
          const bookingsQuery = isAdminEmail
            ? query(collection(db, bookingsPath))
            : query(
                collection(db, bookingsPath),
                where("userId", "==", resolvedUser.uid)
              );

          activeUnsubscribeBookings = onSnapshot(
            bookingsQuery,
            (snapshot) => {
              const list: Booking[] = [];
              snapshot.forEach((docSnap) => {
                list.push(docSnap.data() as Booking);
              });
              setBookings(list);
              localStorage.setItem(BOOKINGS_LOCAL_KEY, JSON.stringify(list));
            },
            (error) => {
              handleFirestoreError(error, OperationType.GET, bookingsPath);
            }
          );

          // Realtime sync reviews from Firestore (global public reviews)
          const reviewsPath = "reviews";
          const reviewsQuery = collection(db, reviewsPath);

          activeUnsubscribeReviews = onSnapshot(
            reviewsQuery,
            (snapshot) => {
              const list: Review[] = [];
              snapshot.forEach((docSnap) => {
                list.push(docSnap.data() as Review);
              });
              const merged = [...list, ...MOCK_REVIEWS.filter(r => !list.some(l => l.id === r.id))];
              setReviews(merged);
              localStorage.setItem(REVIEWS_LOCAL_KEY, JSON.stringify(merged));
            },
            (error) => {
              handleFirestoreError(error, OperationType.GET, reviewsPath);
            }
          );

          // Realtime sync memberships from Firestore
          const membershipsPath = "memberships";
          const membershipsQuery = isAdminEmail
            ? query(collection(db, membershipsPath))
            : query(
                collection(db, membershipsPath),
                where("userId", "==", resolvedUser.uid)
              );

          activeUnsubscribeMemberships = onSnapshot(
            membershipsQuery,
            (snapshot) => {
              const list: Membership[] = [];
              snapshot.forEach((docSnap) => {
                list.push(docSnap.data() as Membership);
              });
              setMemberships(list);
              localStorage.setItem(MEMBERSHIPS_LOCAL_KEY, JSON.stringify(list));
            },
            (error) => {
              handleFirestoreError(error, OperationType.GET, membershipsPath);
            }
          );
        }
      } else {
        // Fallback back to local storage files when logged out
        try {
          const lBookings = localStorage.getItem(BOOKINGS_LOCAL_KEY);
          if (lBookings) setBookings(JSON.parse(lBookings));
          else setBookings([]);
        } catch {
          setBookings([]);
        }

        try {
          const lMemberships = localStorage.getItem(MEMBERSHIPS_LOCAL_KEY);
          if (lMemberships) setMemberships(JSON.parse(lMemberships));
          else setMemberships([]);
        } catch {
          setMemberships([]);
        }

        // Keep reviews synchronized in real-time from Firestore for guests/logged-out visitors too
        if (isFirebaseEnabled && db) {
          const reviewsPath = "reviews";
          const reviewsQuery = collection(db, reviewsPath);

          activeUnsubscribeReviews = onSnapshot(
            reviewsQuery,
            (snapshot) => {
              const list: Review[] = [];
              snapshot.forEach((docSnap) => {
                list.push(docSnap.data() as Review);
              });
              const merged = [...list, ...MOCK_REVIEWS.filter(r => !list.some(l => l.id === r.id))];
              setReviews(merged);
              localStorage.setItem(REVIEWS_LOCAL_KEY, JSON.stringify(merged));
            },
            (error) => {
              handleFirestoreError(error, OperationType.GET, reviewsPath);
            }
          );
        }
      }
    });

    return () => {
      unsubscribeAuth();
      cleanupSubscribers();
    };
  }, []);

  // SignIn action
  const signIn = async () => {
    if (!isFirebaseEnabled) return;
    await signInWithGoogle();
  };

  // SignOut action
  const signOutClick = async () => {
    localStorage.removeItem("dreamscape_credentials_user");
    if (isFirebaseEnabled && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error("Firebase signout fail", err);
      }
    }
    setUser(null);
  };

  const setCredentialsUser = (userData: any) => {
    if (userData) {
      const compatUser = {
        uid: String(userData.id),
        displayName: userData.name,
        email: userData.email,
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
        isCredentialsUser: true,
        token: userData.token,
        role: userData.role,
        phone: userData.phone || null,
        mfa_enabled: userData.mfa_enabled || false
      };
      setUser(compatUser);
      localStorage.setItem("dreamscape_credentials_user", JSON.stringify(compatUser));
    } else {
      setUser(null);
      localStorage.removeItem("dreamscape_credentials_user");
    }
  };

  const updateLocalUserFields = (fields: any) => {
    setUser((prev: any) => {
      if (!prev) return null;
      const next = { ...prev, ...fields };
      localStorage.setItem("dreamscape_credentials_user", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const syncCredentialsUser = async () => {
      const saved = localStorage.getItem("dreamscape_credentials_user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.isCredentialsUser && parsed.token) {
            const res = await fetch("/api/auth/me", {
              headers: {
                "Authorization": `Bearer ${parsed.token}`
              }
            });
            const data = await res.json();
            if (res.ok && data.success && data.user) {
              const updatedUser = {
                ...parsed,
                phone: data.user.phone,
                mfa_enabled: data.user.mfa_enabled
              };
              setUser(updatedUser);
              localStorage.setItem("dreamscape_credentials_user", JSON.stringify(updatedUser));
            }
          }
        } catch (err) {
          console.error("Failed to sync credentials user on mount", err);
        }
      }
    };
    
    syncCredentialsUser();
  }, []);

  // Add booking dispatch
  const addBooking = async (bookingInput: Omit<Booking, "id" | "dateBooked" | "status" | "userId">) => {
    const newId = `book-${Date.now()}`;
    const dateBooked = new Date().toISOString().split("T")[0];
    const status = "confirmed";

    const newBooking: Booking = {
      ...bookingInput,
      id: newId,
      status,
      dateBooked,
      userId: user?.uid || "guest"
    };

    if (isFirebaseEnabled && db && user) {
      if ((user as any).isCredentialsUser) {
        let tour_id = "1"; // Default to "1" (Shantumbu Falls)
        if (bookingInput.tourName) {
          const nameLower = bookingInput.tourName.toLowerCase();
          if (nameLower.includes("kafue")) tour_id = "2";
          else if (nameLower.includes("mosi") || nameLower.includes("victoria")) tour_id = "3";
          else if (nameLower.includes("luangwa")) tour_id = "4";
          else if (nameLower.includes("rivers") || nameLower.includes("expedition")) tour_id = "5";
        }
        try {
          const res = await fetch("/api/bookings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${(user as any).token}`
            },
            body: JSON.stringify({
              tour_id,
              seats: bookingInput.guestsCount || 1,
              notes: bookingInput.specialRequests || `Booked: ${bookingInput.tourName || "Safari Package"}`
            })
          });
          const data = await res.json();
          if (data.success) {
            await fetchCredentialsBookings((user as any).token);
          } else {
            console.warn("Failed posting booking directly:", data.message);
          }
        } catch (apiErr) {
          console.error("API error posting booking:", apiErr);
        }
      } else {
        const docPath = `bookings/${newId}`;
        try {
          await setDoc(doc(db, "bookings", newId), pruneUndefined({
            ...newBooking,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, docPath);
        }
      }
    } else {
      // Offline Local Storage Fallback
      const nextBookings = [newBooking, ...bookings];
      setBookings(nextBookings);
      localStorage.setItem(BOOKINGS_LOCAL_KEY, JSON.stringify(nextBookings));
    }

    // Dispatch custom event to trigger Google Chat/Workspace notification hooks
    window.dispatchEvent(new CustomEvent("dreamscape_new_booking", { detail: newBooking }));
  };

  // Cancel / Delete booking
  const cancelBooking = async (bookingId: string) => {
    if (isFirebaseEnabled && db && user) {
      if ((user as any).isCredentialsUser) {
        try {
          const res = await fetch(`/api/bookings/${bookingId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${(user as any).token}` }
          });
          const data = await res.json();
          if (data.success) {
            await fetchCredentialsBookings((user as any).token);
          }
        } catch (apiErr) {
          console.error("API delete booking error:", apiErr);
        }
      } else {
        const docPath = `bookings/${bookingId}`;
        try {
          await deleteDoc(doc(db, "bookings", bookingId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        }
      }
    } else {
      // Offline fallback
      const remaining = bookings.filter((b) => b.id !== bookingId);
      setBookings(remaining);
      localStorage.setItem(BOOKINGS_LOCAL_KEY, JSON.stringify(remaining));
    }
  };

  // Update Booking Status (for admin)
  const updateBookingStatus = async (bookingId: string, status: "pending" | "confirmed" | "cancelled") => {
    if (isFirebaseEnabled && db && user) {
      if ((user as any).isCredentialsUser) {
        try {
          const res = await fetch(`/api/bookings/${bookingId}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${(user as any).token}`
            },
            body: JSON.stringify({ status })
          });
          const data = await res.json();
          if (data.success) {
            await fetchCredentialsBookings((user as any).token);
          }
        } catch (apiErr) {
          console.error("API patch status error:", apiErr);
        }
      } else {
        const docPath = `bookings/${bookingId}`;
        try {
          await setDoc(doc(db, "bookings", bookingId), {
            status,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, docPath);
        }
      }
    } else {
      // Offline fallback
      const updated = bookings.map((b) => b.id === bookingId ? { ...b, status } : b);
      setBookings(updated);
      localStorage.setItem(BOOKINGS_LOCAL_KEY, JSON.stringify(updated));
    }
  };

  // Add Review
  const addReview = async (reviewInput: Omit<Review, "id" | "date" | "avatarColor" | "verified" | "userId">) => {
    const newId = `rev-${Date.now()}`;
    const date = new Date().toISOString().split("T")[0];
    const avatarGradients = [
      "bg-teal-600",
      "bg-emerald-600",
      "bg-blue-600",
      "bg-indigo-600",
      "bg-sky-600"
    ];
    const avatarColor = avatarGradients[Math.floor(Math.random() * avatarGradients.length)];

    const newReview: Review = {
      ...reviewInput,
      id: newId,
      date,
      avatarColor,
      verified: true,
      userId: user?.uid || "guest"
    };

    if (isFirebaseEnabled && db) {
      const docPath = `reviews/${newId}`;
      try {
        await setDoc(doc(db, "reviews", newId), pruneUndefined({
          ...newReview,
          createdAt: new Date().toISOString()
        }));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, docPath);
      }
    } else {
      // Local fallback
      const nextReviews = [newReview, ...reviews];
      setReviews(nextReviews);
      localStorage.setItem(REVIEWS_LOCAL_KEY, JSON.stringify(nextReviews));
    }
  };

  // Delete / Remove Review
  const deleteReview = async (reviewId: string) => {
    if (isFirebaseEnabled && db && user) {
      const docPath = `reviews/${reviewId}`;
      try {
        await deleteDoc(doc(db, "reviews", reviewId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      // Offline fallback
      const remaining = reviews.filter((r) => r.id !== reviewId);
      setReviews(remaining);
      localStorage.setItem(REVIEWS_LOCAL_KEY, JSON.stringify(remaining));
    }
  };

  // Submit Membership application
  const applyMembership = async (membershipInput: Omit<Membership, "id" | "status" | "userId" | "createdAt" | "updatedAt">) => {
    const newId = `member-${Date.now()}`;
    const status = "pending";

    const newMembership: Membership = {
      ...membershipInput,
      id: newId,
      status,
      userId: user?.uid || "guest",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseEnabled && db && user) {
      const docPath = `memberships/${newId}`;
      try {
        await setDoc(doc(db, "memberships", newId), pruneUndefined(newMembership));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, docPath);
      }
    } else {
      // Offline fallback
      const nextMemberships = [newMembership, ...memberships];
      setMemberships(nextMemberships);
      localStorage.setItem(MEMBERSHIPS_LOCAL_KEY, JSON.stringify(nextMemberships));
    }
  };

  // Cancel / Rescind membership application
  const cancelMembership = async (membershipId: string) => {
    if (isFirebaseEnabled && db && user) {
      const docPath = `memberships/${membershipId}`;
      try {
        await deleteDoc(doc(db, "memberships", membershipId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      // Offline fallback
      const remaining = memberships.filter((m) => m.id !== membershipId);
      setMemberships(remaining);
      localStorage.setItem(MEMBERSHIPS_LOCAL_KEY, JSON.stringify(remaining));
    }
  };

  // Real-time public tours collection sync from Firestore
  useEffect(() => {
    if (!isFirebaseEnabled || !db) return;

    const toursPath = "tours";
    const toursQuery = collection(db, toursPath);

    const unsubscribeTours = onSnapshot(
      toursQuery,
      (snapshot) => {
        const list: TourPackage[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as TourPackage);
        });
        
        // Merge Firestore custom tours with our static baseline TOUR_PACKAGES
        const merged = [...TOUR_PACKAGES];
        list.forEach((fTour) => {
          const index = merged.findIndex((t) => t.id === fTour.id);
          if (index > -1) {
            merged[index] = { ...merged[index], ...fTour };
          } else {
            merged.unshift(fTour);
          }
        });

        setTours(merged);
        localStorage.setItem(TOURS_LOCAL_KEY, JSON.stringify(merged));
      },
      (error) => {
        console.warn("Firestore public tours subscription error:", error);
      }
    );

    return () => {
      unsubscribeTours();
    };
  }, [db, isFirebaseEnabled]);

  // Publish custom tour package
  const publishTour = async (tourInput: TourPackage) => {
    // Give admin rights when a package is published
    localStorage.setItem("dreamscape_is_admin", "true");
    updateLocalUserFields({ isAdmin: true, role: "admin" });

    if (isFirebaseEnabled && db) {
      const docPath = `tours/${tourInput.id}`;
      try {
        await setDoc(doc(db, "tours", tourInput.id), pruneUndefined(tourInput));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, docPath);
      }
    } else {
      // Offline fallback
      const index = tours.findIndex((t) => t.id === tourInput.id);
      let updated: TourPackage[];
      if (index > -1) {
        updated = [...tours];
        updated[index] = tourInput;
      } else {
        updated = [tourInput, ...tours];
      }
      setTours(updated);
      localStorage.setItem(TOURS_LOCAL_KEY, JSON.stringify(updated));
    }
  };

  // Delete custom tour package
  const deleteTour = async (tourId: string) => {
    if (isFirebaseEnabled && db) {
      const docPath = `tours/${tourId}`;
      try {
        await deleteDoc(doc(db, "tours", tourId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      // Offline fallback
      const remaining = tours.filter((t) => t.id !== tourId);
      setTours(remaining);
      localStorage.setItem(TOURS_LOCAL_KEY, JSON.stringify(remaining));
    }
  };

  return (
    <FirebaseContext.Provider value={{
      user,
      loading,
      isDbEnabled: isFirebaseEnabled,
      bookings,
      reviews,
      memberships,
      tours,
      signIn,
      signOut: signOutClick,
      setCredentialsUser,
      updateLocalUserFields,
      addBooking,
      cancelBooking,
      updateBookingStatus,
      addReview,
      deleteReview,
      applyMembership,
      cancelMembership,
      publishTour,
      deleteTour
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useAuthAndData = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useAuthAndData must be used within a FirebaseProvider");
  }
  return context;
};
