import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth, db, isFirebaseEnabled } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

interface GoogleWorkspaceContextType {
  user: FirebaseUser | null;
  accessToken: string | null;
  loading: boolean;
  formId: string | null;
  formUrl: string | null;
  isReconnecting: boolean;
  signInWithWorkspace: () => Promise<string>;
  signOutWorkspace: () => Promise<void>;
  createWorkspaceIntegration: () => Promise<void>;
  submitContactInquiry: (name: string, email: string, phone: string, message: string) => Promise<void>;
  sendEmailViaGmail: (to: string, subject: string, messageBody: string) => Promise<any>;
}

const GoogleWorkspaceContext = createContext<GoogleWorkspaceContextType | undefined>(undefined);

export const GoogleWorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // File states (Persisted locally for easy UX, token is in-memory only)
  const [formId, setFormId] = useState<string | null>(null);
  const [formUrl, setFormUrl] = useState<string | null>(null);

  // Load configured resource IDs from localStorage on load
  useEffect(() => {
    const savedFormId = localStorage.getItem("dreamscape_form_id");
    const savedFormUrl = localStorage.getItem("dreamscape_form_url");

    if (savedFormId) setFormId(savedFormId);
    if (savedFormUrl) setFormUrl(savedFormUrl);
  }, []);

  // Sync auth state listener
  useEffect(() => {
    if (!isFirebaseEnabled || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Clear cached accessToken upon logout
        setAccessToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in requesting Google Workspace scopes
  const signInWithWorkspace = async (): Promise<string> => {
    if (!isFirebaseEnabled || !auth) {
      throw new Error("Firebase Auth is not enabled.");
    }

    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/forms.body");
    provider.addScope("https://www.googleapis.com/auth/drive.file");
    provider.addScope("https://www.googleapis.com/auth/gmail");

    try {
      setIsReconnecting(true);
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (!token) {
        throw new Error("No access token acquired during popup authentication.");
      }
      setAccessToken(token);
      setUser(result.user);
      return token;
    } catch (error: any) {
      const isPopupClosed = error?.code === "auth/popup-closed-by-user" || error?.message?.includes("popup-closed-by-user");
      if (isPopupClosed) {
        console.warn("Workspace connection canceled: Login popup was closed by user.");
      } else {
        console.error("Workspace auth error:", error);
      }
      throw error;
    } finally {
      setIsReconnecting(false);
    }
  };

  const signOutWorkspace = async () => {
    if (auth) {
      await auth.signOut();
    }
    setAccessToken(null);
    setUser(null);
  };

  // Create Form, Google Form and populate questions
  const createWorkspaceIntegration = async () => {
    let activeToken = accessToken;
    if (!activeToken) {
      activeToken = await signInWithWorkspace();
    }

    try {
      // Create the Google Form
      const formResponse = await fetch("https://forms.googleapis.com/v1/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          info: {
            title: "Dreamscape Tours - Contact Inquiries Client Portal"
          }
        })
      });

      if (!formResponse.ok) {
        throw new Error(`Failed to create Google Form: ${formResponse.statusText}`);
      }

      const formData = await formResponse.json();
      const newFormId = formData.formId;
      const newFormUrl = formData.responderUri;

      // Add Questions (Name, Email, Message) using batchUpdate
      const questionsResponse = await fetch(
        `https://forms.googleapis.com/v1/forms/${newFormId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken}`
          },
          body: JSON.stringify({
            requests: [
              {
                createItem: {
                  item: {
                    title: "Full Name",
                    questionItem: {
                      question: {
                        required: true,
                        textQuestion: { paragraph: false }
                      }
                    }
                  },
                  location: { index: 0 }
                }
              },
              {
                createItem: {
                  item: {
                    title: "Email Address",
                    questionItem: {
                      question: {
                        required: true,
                        textQuestion: { paragraph: false }
                      }
                    }
                  },
                  location: { index: 1 }
                }
              },
              {
                createItem: {
                  item: {
                    title: "Detailed Message",
                    questionItem: {
                      question: {
                        required: true,
                        textQuestion: { paragraph: true }
                      }
                    }
                  },
                  location: { index: 2 }
                }
              }
            ]
          })
        }
      );

      if (!questionsResponse.ok) {
        console.error("Failed to add question fields to Form:", questionsResponse.statusText);
      }

      setFormId(newFormId);
      setFormUrl(newFormUrl);
      localStorage.setItem("dreamscape_form_id", newFormId);
      localStorage.setItem("dreamscape_form_url", newFormUrl);

    } catch (err: any) {
      const isPopupClosed = err?.code === "auth/popup-closed-by-user" || err?.message?.includes("popup-closed-by-user");
      if (isPopupClosed) {
        console.warn("Workspace setup cancelled by user (login popup closed).");
      } else {
        console.error("Workspace setup failed", err);
        alert(err instanceof Error ? err.message : "Failed to provision workspace resources.");
      }
      throw err;
    }
  };

  // Send a custom email via the Gmail REST API (converting standard message to raw MIME base64url)
  const sendEmailViaGmail = async (to: string, subject: string, messageBody: string): Promise<any> => {
    let activeToken = accessToken;
    if (!activeToken) {
      activeToken = await signInWithWorkspace();
    }

    try {
      const utf8B64 = (str: string) => {
        return btoa(unescape(encodeURIComponent(str)));
      };

      const emailContent = [
        `To: ${to}`,
        `Subject: =?utf-8?B?${utf8B64(subject)}?=`,
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=\"utf-8\"",
        "Content-Transfer-Encoding: base64",
        "",
        utf8B64(messageBody)
      ].join("\n");

      const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          raw: encodedEmail
        })
      });

      if (!response.ok) {
        throw new Error(`Gmail API failure: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.error("Failed to send email via Gmail:", err);
      throw err;
    }
  };

  // Manually process contact submissions & triggers an email alert
  const submitContactInquiry = async (name: string, email: string, phone: string, message: string) => {
    const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Africa/Cairo" }); // CAT/Zambia timezone approximation
    const inqId = `inq-${Date.now()}`;
    const inquiryData = {
      id: inqId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone || "",
      message: message,
      createdAt: new Date().toISOString(),
      replied: false,
      replyText: null
    };

    // 1. Store to Firestore if enabled
    if (isFirebaseEnabled && db) {
      try {
        await setDoc(doc(db, "inquiries", inqId), inquiryData);
      } catch (fErr) {
        console.error("Failed to write contact inquiry to Firestore: ", fErr);
      }
    }

    // 2. Always store to local storage backup for immediate React consumption
    try {
      const stored = localStorage.getItem("dreamscape_inquiries");
      const inquiriesList = stored ? JSON.parse(stored) : [];
      inquiriesList.unshift(inquiryData);
      localStorage.setItem("dreamscape_inquiries", JSON.stringify(inquiriesList));
    } catch (lsErr) {
      console.error("Local storage sync error: ", lsErr);
    }

    console.log("Contact inquiry log created.", { timestamp, name, email, phone, message });

    // Trigger Gmail notification to dreamscapetourszambia@gmail.com if accessToken is active!
    if (accessToken) {
      try {
        const mailHtml = `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 24px; background-color: #fcfbf7; border-radius: 20px; border: 1px solid #e1dcce; max-width: 600px; margin: auto;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #1a2e26; font-family: serif; font-size: 20px; font-weight: bold; margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase;">Dreamscape Tours Zambia</h2>
              <span style="font-size: 10px; text-transform: uppercase; background-color: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-family: monospace;">Workspace Leads Sync</span>
            </div>
            
            <p style="font-size: 13.5px; margin-bottom: 20px; color: #3f3f46; line-height: 1.5;">New client inquiry received at the Adventure Inquiry Desk:</p>
            
            <div style="background-color: #ffffff; border-radius: 12px; border: 1px solid #f0ede6; padding: 16px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px dashed #f0ede6;">
                  <td style="padding: 10px 0; font-weight: bold; font-size: 11px; color: #a1a1aa; text-transform: uppercase; font-family: monospace; width: 130px;">Client Name</td>
                  <td style="padding: 10px 0; font-size: 13px; color: #18181b; font-weight: 600;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px dashed #f0ede6;">
                  <td style="padding: 10px 0; font-weight: bold; font-size: 11px; color: #a1a1aa; text-transform: uppercase; font-family: monospace;">Email Address</td>
                  <td style="padding: 10px 0; font-size: 13px; color: #18181b;"><a href="mailto:${email}" style="color: #0d9488; text-decoration: none;">${email}</a></td>
                </tr>
                <tr style="border-bottom: 1px dashed #f0ede6;">
                  <td style="padding: 10px 0; font-weight: bold; font-size: 11px; color: #a1a1aa; text-transform: uppercase; font-family: monospace;">Phone Contact</td>
                  <td style="padding: 10px 0; font-size: 13px; color: #18181b; font-family: monospace;">${phone || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; font-size: 11px; color: #a1a1aa; text-transform: uppercase; font-family: monospace;">Received On</td>
                  <td style="padding: 10px 0; font-size: 13px; color: #18181b; font-family: monospace;">${timestamp}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #ffffff; border-radius: 12px; border: 1px solid #f0ede6; padding: 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 11px; color: #a1a1aa; text-transform: uppercase; font-family: monospace;">Detailed Message</p>
              <p style="margin: 0; font-size: 13px; color: #3f3f46; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>

            <div style="text-align: center; border-top: 1px solid #f0ede6; padding-top: 16px; font-size: 10px; color: #a1a1aa; font-family: monospace;">
              Dreamscape Tours GMail Engine • Secure Administrative Feed
            </div>
          </div>
        `;
        await sendEmailViaGmail("dreamscapetourszambia@gmail.com", `Dreamscape Inquiry Lead [${name}]`, mailHtml);
      } catch (gmailErr) {
        console.error("Automated lead notification email failed", gmailErr);
      }
    }
  };

  return (
    <GoogleWorkspaceContext.Provider value={{
      user,
      accessToken,
      loading,
      formId,
      formUrl,
      isReconnecting,
      signInWithWorkspace,
      signOutWorkspace,
      createWorkspaceIntegration,
      submitContactInquiry,
      sendEmailViaGmail
    }}>
      {children}
    </GoogleWorkspaceContext.Provider>
  );
};

export const useGoogleWorkspace = () => {
  const context = useContext(GoogleWorkspaceContext);
  if (context === undefined) {
    throw new Error("useGoogleWorkspace must be used within a GoogleWorkspaceProvider");
  }
  return context;
};
