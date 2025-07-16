"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion"; // Import motion from framer-motion

// Add the import for AnimatedBackground
import { AnimatedBackground } from "../components/animated-background";
import { Brain } from "../components/brain";
import { Apple, Smartphone } from "lucide-react"; // Import Lucide icons
import { ChatPreviewSection } from "@/components/chat-preview-section";
import { DifferentiatorSection } from "@/components/differentiator-section";
import { PricingSection } from "@/components/pricing-section";
import { Footer } from "@/components/footer";
import { FloatingNavigation } from "@/components/floating-navigation";
import { AIChatbot } from "@/components/ai-chatbot";

// Helper function to format AI responses with basic Markdown-like parsing
const formatAiResponse = (text: string) => {
  const parts = text.split("\n").filter((line) => line.trim() !== ""); // Split by newline, filter empty lines
  const formattedElements: React.JSX.Element[] = [];
  let inNumberedList = false;
  let inBulletList = false;
  let currentListItems: React.JSX.Element[] = [];

  const processAndRenderList = () => {
    if (inNumberedList) {
      formattedElements.push(
        <ol key={`ol-${formattedElements.length}`} className="list-decimal list-inside ml-4 space-y-1">
          {currentListItems}
        </ol>
      );
    } else if (inBulletList) {
      formattedElements.push(
        <ul key={`ul-${formattedElements.length}`} className="list-disc list-inside ml-4 space-y-1">
          {currentListItems}
        </ul>
      );
    }
    currentListItems = [];
    inNumberedList = false;
    inBulletList = false;
  };

  parts.forEach((line, index) => {
    // Handle separator
    if (line.trim() === "---") {
      processAndRenderList(); // Close any open list before adding separator
      formattedElements.push(<hr key={`hr-${index}`} className="my-4 border-gray-600" />);
      return;
    }

    // Check for numbered list (e.g., "1. **Title:** Content")
    const numberedListMatch = line.match(/^(\d+\.\s*\*\*([^*]+)\*\*:\s*)(.*)/);
    if (numberedListMatch) {
      if (inBulletList) {
        // If previously in a bullet list, close it
        processAndRenderList();
      }
      if (!inNumberedList) {
        inNumberedList = true;
        currentListItems = [];
      }
      const [, , title, content] = numberedListMatch;
      const formattedContent = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      currentListItems.push(
        <li key={`li-${index}`}>
          <strong>{title.trim()}</strong>: <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
        </li>
      );
      return;
    }

    // Check for bullet list (e.g., "* Content")
    const bulletListMatch = line.match(/^\*\s*(.*)/);
    if (bulletListMatch) {
      if (inNumberedList) {
        // If previously in a numbered list, close it
        processAndRenderList();
      }
      if (!inBulletList) {
        inBulletList = true;
        currentListItems = [];
      }
      const content = bulletListMatch[1];
      const formattedContent = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      currentListItems.push(<li key={`li-${index}`} dangerouslySetInnerHTML={{ __html: formattedContent }} />);
      return;
    }

    // If a line is not a list item, and we were in a list, close it
    if (inNumberedList || inBulletList) {
      processAndRenderList();
    }

    // Handle bold text within general paragraphs
    const boldedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formattedElements.push(<p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: boldedLine }} />);
  });

  // After loop, if still in a list, push it
  processAndRenderList();
  return formattedElements;
};

// Main application component for Obio.ai landing page
export default function App() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [user, setUser] = useState<any>(null); // Firebase user object
  const [userId, setUserId] = useState<string | null>(null); // User ID for Firestore
  const [authReady, setAuthReady] = useState(false); // Flag for Firebase auth readiness
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Corrected: useState for mutability
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false); // State for mobile menu
  const [showUpgradeModal, setShowUpgradeModal] = useState(false); // New state for upgrade modal

  // New states for LLM features
  const [showEmotionalInput, setShowEmotionalInput] = useState(false);
  const [emotionalInput, setEmotionalInput] = useState("");
  const [isProcessingEmotionalInsight, setIsProcessingEmotionalInsight] = useState(false);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [isProcessingGoal, setIsProcessingGoal] = useState(false);
  const [goalBreakdown, setGoalBreakdown] = useState<any[] | null>(null); // To store structured goal breakdown
  const [showCreativeInput, setShowCreativeInput] = useState(false);
  const [creativeInput, setCreativeInput] = useState("");
  const [isProcessingCreative, setIsProcessingCreative] = useState(false);
  const [showDecisionInput, setShowDecisionInput] = useState(false);
  const [decisionInput, setDecisionInput] = useState("");
  const [isProcessingDecision, setIsProcessingDecision] = useState(false);
  const [showSummarizeInput, setShowSummarizeInput] = useState(false);
  const [summarizeInput, setSummarizeInput] = useState("");
  const [isProcessingSummarize, setIsProcessingSummarize] = useState(false); // Fixed this line

  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling chat
  const authModalRef = useRef<HTMLDivElement>(null); // Ref for auth modal to close on outside click
  const upgradeModalRef = useRef<HTMLDivElement>(null); // Ref for upgrade modal to close on outside click
  const advancedFeaturesRef = useRef<HTMLDivElement>(null); // Ref for advanced features section

  // Firebase Initialization and Authentication
  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);

  // Framer Motion Variants for Hero Section
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Delay between child animations
        delayChildren: 0.2, // Delay before children start animating
      },
    },
  };

  const fadeInVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut",
      },
    },
  };

  const typingVariants = {
    hidden: { clipPath: "inset(0 100% 0 0)" }, // Start with 0 width
    visible: {
      clipPath: "inset(0 0% 0 0)", // End with full width
      transition: {
        duration: 2.5, // Adjust typing speed
        ease: "linear", // Linear for typing effect
        delay: 0.5, // Start typing after a short delay relative to its parent's stagger
      },
    },
  };

  // Initial welcome message effect
  useEffect(() => {
    if (authReady && messages.length === 0) {
      setMessages([
        {
          type: "ai",
          text: "Hello! I am Obio, your personal AI assistant. What's on your mind today?",
          timestamp: new Date(),
          userId: "Obio.ai",
        },
      ]);
    }
  }, [authReady, messages.length]);

  // Effect for Firebase initialization and auth state listening
  useEffect(() => {
    let unsubscribeFirestore = () => {};
    let unsubscribeAuth = () => {};

    try {
      const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
      let firebaseConfig;

      if (firebaseConfigString) {
        try {
          firebaseConfig = JSON.parse(firebaseConfigString);
        } catch (parseError) {
          console.error("Error parsing NEXT_PUBLIC_FIREBASE_CONFIG:", parseError);
          firebaseConfig = {};
          setAuthError("Invalid Firebase configuration. Please check NEXT_PUBLIC_FIREBASE_CONFIG.");
        }
      } else {
        console.warn("NEXT_PUBLIC_FIREBASE_CONFIG environment variable is not set. Firebase features will be limited.");
        firebaseConfig = {};
      }

      if (firebaseConfig.projectId) {
        const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseConfig.appId || "default-obio-app-id";
        const initialAuthToken = process.env.NEXT_PUBLIC_FIREBASE_AUTH_TOKEN || null;

        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestore);
        setAuth(firebaseAuth);

        const attemptInitialSignIn = async () => {
          if (initialAuthToken && !firebaseAuth.currentUser) {
            try {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
              console.log("Signed in with custom token.");
            } catch (error) {
              console.warn("Custom token sign-in failed, attempting anonymous fallback:", error);
              try {
                await signInAnonymously(firebaseAuth);
                console.log("Signed in anonymously after custom token failure.");
              } catch (anonError) {
                console.error("Anonymous sign-in failed:", anonError);
              }
            }
          } else if (!firebaseAuth.currentUser) {
            try {
              await signInAnonymously(firebaseAuth);
              console.log("Signed in anonymously.");
            } catch (anonError) {
              console.error("Anonymous sign-in failed:", anonError);
            }
          }
          setAuthReady(true); // Indicate that initial auth state has been processed
        };

        unsubscribeAuth = onAuthStateChanged(firebaseAuth, (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            setUserId(currentUser.uid);

            unsubscribeFirestore();

            if (firestore) {
              const q = query(
                collection(firestore, `artifacts/${appId}/users/${currentUser.uid}/chatHistory`),
                orderBy("timestamp")
              );

              unsubscribeFirestore = onSnapshot(
                q,
                (snapshot) => {
                  const loadedMessages = snapshot.docs.map((doc) => doc.data());
                  setMessages(loadedMessages);
                },
                (error) => {
                  console.error("Firestore snapshot listener error:", error);
                }
              );
            }
          } else {
            unsubscribeFirestore();
            setMessages([]);
            setUser(null);
            setUserId(null);
          }
        });

        attemptInitialSignIn();

        return () => {
          unsubscribeAuth();
          unsubscribeFirestore();
        };
      } else {
        setAuthReady(true); // Ensure UI can render even if Firebase isn't fully initialized
      }
    } catch (error) {
      console.error("Firebase initialization error:", error);
      setAuthError("Failed to initialize Firebase. Check console for details.");
      setAuthReady(true); // Ensure UI can render even on full initialization failure
    }
  }, []);

  // Scroll to top on initial load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Function to close all LLM input tabs
  const closeAllLLMInputs = () => {
    setShowEmotionalInput(false);
    setShowGoalInput(false);
    setShowCreativeInput(false);
    setShowDecisionInput(false);
    setShowSummarizeInput(false);
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage = {
      type: "user",
      text: inputValue.trim(),
      timestamp: new Date(),
      userId: user?.uid || "anonymous",
    };

    setMessages((prev) => [...prev, userMessage]);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setInputValue("");
    setIsTyping(true);

    try {
      if (auth && auth.currentUser && !auth.currentUser.isAnonymous && db) {
        await addDoc(
          collection(
            db,
            `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${auth.currentUser.uid}/chatHistory`
          ),
          userMessage
        );
      }

      // Call our new chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const aiMessage = {
        type: "ai",
        text: data.response,
        timestamp: new Date(),
        userId: "Obio.ai",
      };

      setMessages((prev) => [...prev, aiMessage]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

      if (auth && auth.currentUser && !auth.currentUser.isAnonymous && db) {
        await addDoc(
          collection(
            db,
            `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${auth.currentUser.uid}/chatHistory`
          ),
          aiMessage
        );
      }
    } catch (error: any) {
      console.error("Error sending message or getting AI response:", error);
      const errorMessage = error.message || "Oops! Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { 
        type: "ai", 
        text: errorMessage,
        timestamp: new Date(),
        userId: "Obio.ai"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Emotional Insight generation
  const handleGenerateEmotionalInsight = async () => {
    if (!auth || !auth.currentUser || !db || emotionalInput.trim() === "") return;
    setIsProcessingEmotionalInsight(true);
    const currentAuthenticatedUserId = auth.currentUser.uid;
    const userReflectionMessage = {
      type: "user",
      text: `My emotional reflection: ${emotionalInput.trim()}`,
      timestamp: serverTimestamp(),
      userId: currentAuthenticatedUserId,
    };
    setMessages((prev) => [...prev, userReflectionMessage]);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    await addDoc(
      collection(
        db,
        `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`
      ),
      userReflectionMessage
    );

    try {
      const prompt = `Analyze the following user's emotional reflection for key feelings, underlying causes, and provide an empathetic summary with a single, actionable reflective question. Keep it concise and supportive. User's reflection: "${emotionalInput.trim()}"`;
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      };
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      let aiResponseText = "I couldn't generate an emotional insight at this time.";
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        aiResponseText = result.candidates[0].content.parts[0].text;
      } else if (result.error) {
        aiResponseText = `Error from AI: ${result.error.message}`;
        console.error("Gemini API error for emotional insight:", result.error);
      }
      const aiMessage = {
        type: "ai",
        text: `✨ Emotional Insight: ${aiResponseText}`,
        timestamp: serverTimestamp(),
        userId: "Obio.ai",
      };
      setMessages((prev) => [...prev, aiMessage]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      await addDoc(
        collection(
          db,
          `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`
        ),
        aiMessage
      );
    } catch (error) {
      console.error("Error generating emotional insight:", error);
      setMessages((prev) => [...prev, { type: "ai", text: "Oops! Failed to generate emotional insight." }]);
    } finally {
      setIsProcessingEmotionalInsight(false);
      setShowEmotionalInput(false); // Hide input after processing
      setEmotionalInput(""); // Clear input
    }
  };

  // Handle Goal Breakdown generation
  const handleGenerateGoalBreakdown = async () => {
    if (!auth || !auth.currentUser || !db || goalInput.trim() === "") return;
    setIsProcessingGoal(true);
    const currentAuthenticatedUserId = auth.currentUser.uid;
    const userGoalMessage = {
      type: "user",
      text: `My goal: ${goalInput.trim()}`,
      timestamp: serverTimestamp(),
      userId: currentAuthenticatedUserId,
    };
    setMessages((prev) => [...prev, userGoalMessage]);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    await addDoc(
      collection(
        db,
        `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`
      ),
      userGoalMessage
    );

    try {
      const prompt = `Break down the following goal into 3-5 actionable, sequential steps, including a brief description and a suggested timeframe (e.g., "1 week", "2 months") for each step. Provide the output as a JSON array of objects, where each object has 'step' (string), 'description' (string), and 'timeframe' (string) properties. Ensure the JSON is valid and only contains the array. Goal: "${goalInput.trim()}"`;
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                step: { type: "STRING" },
                description: { type: "STRING" },
                timeframe: { type: "STRING" },
              },
              required: ["step", "description", "timeframe"],
            },
          },
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      };
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      let aiResponseText = "I couldn't break down your goal at this time.";
      let parsedBreakdown = null;
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        try {
          parsedBreakdown = JSON.parse(result.candidates[0].content.parts[0].text);
          setGoalBreakdown(parsedBreakdown); // Store for rendering
          aiResponseText = "Here's a breakdown for your goal:";
        } catch (jsonError: any) {
          console.error("Failed to parse JSON for goal breakdown:", jsonError);
          aiResponseText = `I received a response, but couldn't understand it. Error: ${jsonError.message}`;
        }
      } else if (result.error) {
        aiResponseText = `Error from AI: ${result.error.message}`;
        console.error("Gemini API error for goal breakdown:", result.error);
      }
      const aiMessage = {
        type: "ai",
        text: `✨ Goal Breakdown: ${aiResponseText}`,
        timestamp: serverTimestamp(),
        userId: "Obio.ai",
        structuredData: parsedBreakdown ? JSON.stringify(parsedBreakdown) : null,
      };
      setMessages((prev) => [...prev, aiMessage]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      await addDoc(
        collection(
          db,
          `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`
        ),
        aiMessage
      );
    } catch (error) {
      console.error("Error generating goal breakdown:", error);
      setMessages((prev) => [...prev, { type: "ai", text: "Oops! Failed to break down your goal." }]);
    } finally {
      setIsProcessingGoal(false);
      setShowGoalInput(false); // Hide input after processing
      setGoalInput(""); // Clear input
    }
  };

  // Handle Creative Writing generation
  const handleGenerateCreativeWriting = async () => {
    if (!auth || !auth.currentUser || !db || creativeInput.trim() === "") return;
    setIsProcessingCreative(true);
    const currentAuthenticatedUserId = auth.currentUser.uid;
    const userCreativeMessage = {
      type: "user",
      text: `Creative writing prompt: ${creativeInput.trim()}`,
      timestamp: serverTimestamp(),
      userId: currentAuthenticatedUserId,
    };
    setMessages((prev) => [...prev, userCreativeMessage]);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    await addDoc(
      collection(
        db,
        `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`
      ),
      userCreativeMessage
    );

    try {
      // Implement the creative writing logic here similar to other functions
    } catch (error) {
      console.error("Error generating creative writing:", error);
      setMessages((prev) => [...prev, { type: "ai", text: "Oops! Failed to generate creative writing." }]);
    } finally {
      setIsProcessingCreative(false);
      setShowCreativeInput(false); // Hide input after processing
      setCreativeInput(""); // Clear input
    }
  }

  // Render the chat interface and other UI components
  return (
    <div className="chat-interface">
      {/* Your chat UI code */}
      <div className="messages">
        {messages.map((message) => (
          <div key={message.timestamp} className={`message ${message.type}`}>
            <span>{message.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}
