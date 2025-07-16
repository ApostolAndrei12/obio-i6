"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { initializeApp } from "firebase/app"
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore"
import { motion } from "framer-motion" // Import motion from framer-motion

// Add the import for AnimatedBackground
import { AnimatedBackground } from "../components/animated-background"
import { Brain } from "../components/brain"
import { Apple, Smartphone } from "lucide-react" // Import Lucide icons
import { ChatPreviewSection } from "@/components/chat-preview-section"
import { DifferentiatorSection } from "@/components/differentiator-section"
import { PricingSection } from "@/components/pricing-section"
import { Footer } from "@/components/footer"
import { FloatingNavigation } from "@/components/floating-navigation"
import { AIChatbot } from "@/components/ai-chatbot"

// Helper function to format AI responses with basic Markdown-like parsing
const formatAiResponse = (text: string) => {
  const parts = text.split("\n").filter((line) => line.trim() !== "") // Split by newline, filter empty lines
  const formattedElements: React.JSX.Element[] = []
  let inNumberedList = false
  let inBulletList = false
  let currentListItems: React.JSX.Element[] = []

  const processAndRenderList = () => {
    if (inNumberedList) {
      formattedElements.push(
        <ol key={`ol-${formattedElements.length}`} className="list-decimal list-inside ml-4 space-y-1">
          {currentListItems}
        </ol>,
      )
    } else if (inBulletList) {
      formattedElements.push(
        <ul key={`ul-${formattedElements.length}`} className="list-disc list-inside ml-4 space-y-1">
          {currentListItems}
        </ul>,
      )
    }
    currentListItems = []
    inNumberedList = false
    inBulletList = false
  }

  parts.forEach((line, index) => {
    // Handle separator
    if (line.trim() === "---") {
      processAndRenderList() // Close any open list before adding separator
      formattedElements.push(<hr key={`hr-${index}`} className="my-4 border-gray-600" />)
      return
    }

    // Check for numbered list (e.g., "1. **Title:** Content")
    const numberedListMatch = line.match(/^(\d+\.\s*\*\*([^*]+)\*\*:\s*)(.*)/)
    if (numberedListMatch) {
      if (inBulletList) {
        // If previously in a bullet list, close it
        processAndRenderList()
      }
      if (!inNumberedList) {
        inNumberedList = true
        currentListItems = []
      }
      const [, , title, content] = numberedListMatch
      const formattedContent = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      currentListItems.push(
        <li key={`li-${index}`}>
          <strong>{title.trim()}</strong>: <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
        </li>,
      )
      return
    }

    // Check for bullet list (e.g., "* Content")
    const bulletListMatch = line.match(/^\*\s*(.*)/)
    if (bulletListMatch) {
      if (inNumberedList) {
        // If previously in a numbered list, close it
        processAndRenderList()
      }
      if (!inBulletList) {
        inBulletList = true
        currentListItems = []
      }
      const content = bulletListMatch[1]
      const formattedContent = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      currentListItems.push(<li key={`li-${index}`} dangerouslySetInnerHTML={{ __html: formattedContent }} />)
      return
    }

    // If a line is not a list item, and we were in a list, close it
    if (inNumberedList || inBulletList) {
      processAndRenderList()
    }

    // Handle bold text within general paragraphs
    const boldedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    formattedElements.push(<p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: boldedLine }} />)
  })

  // After loop, if still in a list, push it
  processAndRenderList()
  return formattedElements
}

// Main application component for Obio.ai landing page
export default function App() {
  const [messages, setMessages] = useState<any[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [user, setUser] = useState<any>(null) // Firebase user object
  const [userId, setUserId] = useState<string | null>(null) // User ID for Firestore
  const [authReady, setAuthReady] = useState(false) // Flag for Firebase auth readiness
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLogin, setIsLogin] = useState(true) // Corrected: useState for mutability
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [isLoadingAuth, setIsLoadingAuth] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false) // State for mobile menu
  const [showUpgradeModal, setShowUpgradeModal] = useState(false) // New state for upgrade modal

  // New states for LLM features
  const [showEmotionalInput, setShowEmotionalInput] = useState(false)
  const [emotionalInput, setEmotionalInput] = useState("")
  const [isProcessingEmotionalInsight, setIsProcessingEmotionalInsight] = useState(false)
  const [showGoalInput, setShowGoalInput] = useState(false)
  const [goalInput, setGoalInput] = useState("")
  const [isProcessingGoal, setIsProcessingGoal] = useState(false)
  const [goalBreakdown, setGoalBreakdown] = useState<any[] | null>(null) // To store structured goal breakdown
  const [showCreativeInput, setShowCreativeInput] = useState(false)
  const [creativeInput, setCreativeInput] = useState("")
  const [isProcessingCreative, setIsProcessingCreative] = useState(false)
  const [showDecisionInput, setShowDecisionInput] = useState(false)
  const [decisionInput, setDecisionInput] = useState("")
  const [isProcessingDecision, setIsProcessingDecision] = useState(false)
  const [showSummarizeInput, setShowSummarizeInput] = useState(false)
  const [summarizeInput, setSummarizeInput] = useState("")
  const [isProcessingSummarize, setIsProcessingSummarize = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null) // Ref for auto-scrolling chat
  const authModalRef = useRef<HTMLDivElement>(null) // Ref for auth modal to close on outside click
  const upgradeModalRef = useRef<HTMLDivElement>(null) // Ref for upgrade modal to close on outside click
  const advancedFeaturesRef = useRef<HTMLDivElement>(null) // Ref for advanced features section

  // Firebase Initialization and Authentication
  const [db, setDb] = useState<any>(null)
  const [auth, setAuth] = useState<any>(null)

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
  }

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
  }

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
  }

  // Initial welcome message effect
  useEffect(() => {
    // Only add the welcome message if the chat is empty and auth is ready
    if (authReady && messages.length === 0) {
      setMessages([
        {
          type: "ai",
          text: "Hello! I am Obio, your personal AI assistant. What's on your mind today?",
          timestamp: new Date(), // Use current date for initial message
          userId: "Obio.ai",
        },
      ])
    }
  }, [authReady, messages.length]) // Depend on authReady and messages.length to ensure it runs once after auth is ready and chat is empty

  // Effect for Firebase initialization and auth state listening
  useEffect(() => {
    let unsubscribeFirestore = () => {}
    let unsubscribeAuth = () => {}

    try {
      // Use environment variables for Firebase config
      const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG
      let firebaseConfig

      if (firebaseConfigString) {
        try {
          firebaseConfig = JSON.parse(firebaseConfigString)
        } catch (parseError) {
          console.error("Error parsing NEXT_PUBLIC_FIREBASE_CONFIG:", parseError)
          // Provide a fallback empty config to prevent crash, but warn user
          firebaseConfig = {}
          setAuthError("Invalid Firebase configuration. Please check NEXT_PUBLIC_FIREBASE_CONFIG.")
        }
      } else {
        console.warn("NEXT_PUBLIC_FIREBASE_CONFIG environment variable is not set. Firebase features will be limited.")
        // Provide a fallback empty config to prevent crash
        firebaseConfig = {}
        // Removed: setAuthError("Firebase not configured. Chat history and authentication will not work.");
      }

      // Only initialize Firebase if projectId is present (basic check for valid config)
      if (firebaseConfig.projectId) {
        const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseConfig.appId || "default-obio-app-id"
        const initialAuthToken = process.env.NEXT_PUBLIC_FIREBASE_AUTH_TOKEN || null

        const app = initializeApp(firebaseConfig)
        const firestore = getFirestore(app)
        const firebaseAuth = getAuth(app)

        setDb(firestore)
        setAuth(firebaseAuth)

        // Attempt initial sign-in (custom token or anonymous)
        const attemptInitialSignIn = async () => {
          if (initialAuthToken && !firebaseAuth.currentUser) {
            try {
              await signInWithCustomToken(firebaseAuth, initialAuthToken)
              console.log("Signed in with custom token.")
            } catch (error) {
              console.warn("Custom token sign-in failed, attempting anonymous fallback:", error)
              try {
                await signInAnonymously(firebaseAuth)
                console.log("Signed in anonymously after custom token failure.")
              } catch (anonError) {
                console.error("Anonymous sign-in failed:", anonError)
              }
            }
          } else if (!firebaseAuth.currentUser) {
            // If no custom token and no current user, sign in anonymously
            try {
              await signInAnonymously(firebaseAuth)
              console.log("Signed in anonymously.")
            } catch (anonError) {
              console.error("Anonymous sign-in failed:", anonError)
            }
          }
          setAuthReady(true) // Indicate that initial auth state has been processed
        }

        // Set up the auth state listener
        unsubscribeAuth = onAuthStateChanged(firebaseAuth, (currentUser) => {
          if (currentUser) {
            setUser(currentUser)
            setUserId(currentUser.uid)

            // Clean up previous Firestore listener if it exists
            unsubscribeFirestore()

            if (firestore) {
              const q = query(
                collection(firestore, `artifacts/${appId}/users/${currentUser.uid}/chatHistory`),
                orderBy("timestamp"),
              )
              // Set up new Firestore listener and store its unsubscribe function
              unsubscribeFirestore = onSnapshot(
                q,
                (snapshot) => {
                  const loadedMessages = snapshot.docs.map((doc) => doc.data())
                  setMessages(loadedMessages)
                },
                (error) => {
                  console.error("Firestore snapshot listener error:", error)
                },
              )
            }
          } else {
            // User is explicitly logged out or initial sign-in failed/no user.
            // Clear user state and messages.
            unsubscribeFirestore()
            setMessages([])
            setUser(null)
            setUserId(null)
            // Do NOT attempt anonymous sign-in here if authReady is already true,
            // as it means user explicitly logged out and we don't want to re-login them automatically.
            // The initial attemptInitialSignIn() handles the first anonymous login.
          }
        })

        // Call the initial sign-in attempt function once on mount
        attemptInitialSignIn()

        return () => {
          unsubscribeAuth() // Cleanup for onAuthStateChanged
          unsubscribeFirestore() // Ensure Firestore listener is also cleaned up on component unmount
        }
      } else {
        setAuthReady(true) // Still set authReady to true even if Firebase isn't fully initialized, to allow UI to render
      }
    } catch (error) {
      console.error("Firebase initialization error:", error)
      setAuthError("Failed to initialize Firebase. Check console for details.")
      setAuthReady(true) // Ensure UI can render even on full initialization failure
    }
  }, [])

  // Scroll to top on initial load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // Function to close all LLM input tabs
  const closeAllLLMInputs = () => {
    setShowEmotionalInput(false)
    setShowGoalInput(false)
    setShowCreativeInput(false)
    setShowDecisionInput(false)
    setShowSummarizeInput(false) // New: Close summarize input
  }

  // Handle sending a message
  const handleSendMessage = async () => {
    // Allow both authenticated and anonymous users to chat
    if (inputValue.trim() === "") return

    const userMessage = {
      type: "user",
      text: inputValue.trim(),
      timestamp: new Date(),
      userId: user?.uid || "anonymous",
    }

    setMessages((prev) => [...prev, userMessage])
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    setInputValue("")
    setIsTyping(true)

    try {
      // Save to Firestore only if user is authenticated and db is available
      if (auth && auth.currentUser && !auth.currentUser.isAnonymous && db) {
        await addDoc(
          collection(
            db,
            `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${auth.currentUser.uid}/chatHistory`,
          ),
          userMessage,
        )
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
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response')
      }

      const aiMessage = {
        type: "ai",
        text: data.response,
        timestamp: new Date(),
        userId: "Obio.ai",
      }

      setMessages((prev) => [...prev, aiMessage])
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

      // Save AI response to Firestore only if user is authenticated
      if (auth && auth.currentUser && !auth.currentUser.isAnonymous && db) {
        await addDoc(
          collection(
            db,
            `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${auth.currentUser.uid}/chatHistory`,
          ),
          aiMessage,
        )
      }

    } catch (error: any) {
      console.error("Error sending message or getting AI response:", error)
      const errorMessage = error.message || "Oops! Something went wrong. Please try again."
      setMessages((prev) => [...prev, { 
        type: "ai", 
        text: errorMessage,
        timestamp: new Date(),
        userId: "Obio.ai"
      }])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle Emotional Insight generation
  const handleGenerateEmotionalInsight = async () => {
    if (!auth || !auth.currentUser || !db || emotionalInput.trim() === "") return
    setIsProcessingEmotionalInsight(true)
    const currentAuthenticatedUserId = auth.currentUser.uid
    const userReflectionMessage = {
      type: "user",
      text: `My emotional reflection: ${emotionalInput.trim()}`,
      timestamp: serverTimestamp(),
      userId: currentAuthenticatedUserId,
    }
    setMessages((prev) => [...prev, userReflectionMessage])
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) // Scroll after user message
    await addDoc(
      collection(
        db,
        `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`,
      ),
      userReflectionMessage,
    )

    try {
      const prompt = `Analyze the following user's emotional reflection for key feelings, underlying causes, and provide an empathetic summary with a single, actionable reflective question. Keep it concise and supportive. User's reflection: "${emotionalInput.trim()}"`
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      }
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      let aiResponseText = "I couldn't generate an emotional insight at this time."
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        aiResponseText = result.candidates[0].content.parts[0].text
      } else if (result.error) {
        aiResponseText = `Error from AI: ${result.error.message}`
        console.error("Gemini API error for emotional insight:", result.error)
      }
      const aiMessage = {
        type: "ai",
        text: `✨ Emotional Insight: ${aiResponseText}`,
        timestamp: serverTimestamp(),
        userId: "Obio.ai",
      }
      setMessages((prev) => [...prev, aiMessage])
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) // Scroll after AI message
      await addDoc(
        collection(
          db,
          `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`,
        ),
        aiMessage,
      )
    } catch (error) {
      console.error("Error generating emotional insight:", error)
      setMessages((prev) => [...prev, { type: "ai", text: "Oops! Failed to generate emotional insight." }])
    } finally {
      setIsProcessingEmotionalInsight(false)
      setShowEmotionalInput(false) // Hide input after processing
      setEmotionalInput("") // Clear input
    }
  }

  // Handle Goal Breakdown generation
  const handleGenerateGoalBreakdown = async () => {
    if (!auth || !auth.currentUser || !db || goalInput.trim() === "") return
    setIsProcessingGoal(true)
    const currentAuthenticatedUserId = auth.currentUser.uid
    const userGoalMessage = {
      type: "user",
      text: `My goal: ${goalInput.trim()}`,
      timestamp: serverTimestamp(),
      userId: currentAuthenticatedUserId,
    }
    setMessages((prev) => [...prev, userGoalMessage])
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) // Scroll after user message
    await addDoc(
      collection(
        db,
        `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`,
      ),
      userGoalMessage,
    )

    try {
      const prompt = `Break down the following goal into 3-5 actionable, sequential steps, including a brief description and a suggested timeframe (e.g., "1 week", "2 months") for each step. Provide the output as a JSON array of objects, where each object has 'step' (string), 'description' (string), and 'timeframe' (string) properties. Ensure the JSON is valid and only contains the array. Goal: "${goalInput.trim()}"`
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json", // Request JSON output
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
      }
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      let aiResponseText = "I couldn't break down your goal at this time."
      let parsedBreakdown = null
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        try {
          parsedBreakdown = JSON.parse(result.candidates[0].content.parts[0].text)
          setGoalBreakdown(parsedBreakdown) // Store for rendering
          aiResponseText = "Here's a breakdown for your goal:"
        } catch (jsonError: any) {
          console.error("Failed to parse JSON for goal breakdown:", jsonError)
          aiResponseText = `I received a response, but couldn't understand it. Error: ${jsonError.message}`
        }
      } else if (result.error) {
        aiResponseText = `Error from AI: ${result.error.message}`
        console.error("Gemini API error for goal breakdown:", result.error)
      }
      const aiMessage = {
        type: "ai",
        text: `✨ Goal Breakdown: ${aiResponseText}`,
        timestamp: serverTimestamp(),
        userId: "Obio.ai",
        // Optionally store the structured data directly in Firestore if needed for later retrieval
        structuredData: parsedBreakdown ? JSON.stringify(parsedBreakdown) : null,
      }
      setMessages((prev) => [...prev, aiMessage])
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) // Scroll after AI message
      await addDoc(
        collection(
          db,
          `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`,
        ),
        aiMessage,
      )
    } catch (error) {
      console.error("Error generating goal breakdown:", error)
      setMessages((prev) => [...prev, { type: "ai", text: "Oops! Failed to break down your goal." }])
    } finally {
      setIsProcessingGoal(false)
      setShowGoalInput(false) // Hide input after processing
      setGoalInput("") // Clear input
    }
  }

  // Handle Creative Writing generation
  const handleGenerateCreativeWriting = async () => {
    if (!auth || !auth.currentUser || !db || creativeInput.trim() === "") return
    setIsProcessingCreative(true)
    const currentAuthenticatedUserId = auth.currentUser.uid
    const userCreativeMessage = {
      type: "user",
      text: `Creative writing prompt: ${creativeInput.trim()}`,
      timestamp: serverTimestamp(),
      userId: currentAuthenticatedUserId,
    }
    setMessages((prev) => [...prev, userCreativeMessage])
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) // Scroll after user message
    await addDoc(
      collection(
        db,
        `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`,
      ),
      userCreativeMessage,
    )

    try {
      const prompt = `Write a short, engaging creative piece (story, poem, or descriptive text) based on the following prompt: "${creativeInput.trim()}". Keep it under 200 words.`
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8, // Higher temperature for creativity
          topP: 0.95,
          topK: 40,
        },
      }
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      let aiResponseText = "I couldn't generate creative writing at this time."
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        aiResponseText = result.candidates[0].content.parts[0].text
      } else if (result.error) {
        aiResponseText = `Error from AI: ${result.error.message}`
        console.error("Gemini API error for creative writing:", result.error)
      }
      const aiMessage = {
        type: "ai",
        text: `✨ Creative Spark: ${aiResponseText}`,
        timestamp: serverTimestamp(),
        userId: "Obio.ai",
      }
      setMessages((prev) => [...prev, aiMessage])
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) // Scroll after AI message
      await addDoc(
        collection(
          db,
          `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`,
        ),
        aiMessage,
      )
    } catch (error) {
      console.error("Error generating creative writing:", error)
      setMessages((prev) => [...prev, { type: "ai", text: "Oops! Failed to generate creative writing." }])
    } finally {
      setIsProcessingCreative(false)
      setShowCreativeInput(false)
      setCreativeInput("")
    }
  }

  // Handle Decision Support generation
  const handleGenerateDecisionSupport = async () => {
    if (!auth || !auth.currentUser || !db || decisionInput.trim() === "") return
    setIsProcessingDecision(true)
    const currentAuthenticatedUserId = auth.currentUser.uid
    const userDecisionMessage = {
      type: "user",
      text: `My dilemma: ${decisionInput.trim()}`,
      timestamp: serverTimestamp(),
      userId: currentAuthenticatedUserId,
    }
    setMessages((prev) => [...prev, userDecisionMessage])
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) // Scroll after user message
    await addDoc(
      collection(
        db,
        `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`,
      ),
      userDecisionMessage,
    )

    try {
      const prompt = `Analyze the following dilemma or decision point: "${decisionInput.trim()}". Provide a balanced perspective, outlining key pros and cons or different angles to consider. Structure your response clearly.`
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.5, // Lower temperature for more factual/balanced output
          topP: 0.9,
          topK: 40,
        },
      }
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      let aiResponseText = "I couldn't provide decision support at this time."
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        aiResponseText = result.candidates[0].content.parts[0].text
      } else if (result.error) {
        aiResponseText = `Error from AI: ${result.error.message}`
        console.error("Gemini API error for decision support:", result.error)
      }
      const aiMessage = {
        type: "ai",
        text: `✨ Decision Navigator: ${aiResponseText}`,
        timestamp: serverTimestamp(),
        userId: "Obio.ai",
      }
      setMessages((prev) => [...prev, aiMessage])
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) // Scroll after AI message
      await addDoc(
        collection(
          db,
          `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`,
        ),
        aiMessage,
      )
    } catch (error) {
      console.error("Error generating decision support:", error)
      setMessages((prev) => [...prev, { type: "ai", text: "Oops! Failed to provide decision support." }])
    } finally {
      setIsProcessingDecision(false)
      setShowDecisionInput(false)
      setDecisionInput("")
    }
  }

  // Handle Summarize Text generation
  const handleGenerateSummary = async () => {
    if (!auth || !auth.currentUser || !db || summarizeInput.trim() === "") return
    setIsProcessingSummarize(true)
    const currentAuthenticatedUserId = auth.currentUser.uid
    const userSummarizeMessage = {
      type: "user",
      text: `Summarize this text: ${summarizeInput.trim()}`,
      timestamp: serverTimestamp(),
      userId: currentAuthenticatedUserId,
    }
    setMessages((prev) => [...prev, userSummarizeMessage])
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) // Scroll after user message
    await addDoc(
      collection(
        db,
        `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`,
      ),
      userSummarizeMessage,
    )

    try {
      const prompt = `Summarize the following text concisely and clearly: "${summarizeInput.trim()}"`
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more factual/concise output
          topP: 0.9,
          topK: 40,
        },
      }
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      let aiResponseText = "I couldn't summarize the text at this time."
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
```text
        aiResponseText = result.candidates[0].content.parts[0].text
      } else if (result.error) {
        aiResponseText = `Error from AI: ${result.error.message}`
        console.error("Gemini API error for summarization:", result.error)
      }
      const aiMessage = {
        type: "ai",
        text: `✨ Summary: ${aiResponseText}`,
        timestamp: serverTimestamp(),
        userId: "Obio.ai",
      }
      setMessages((prev) => [...prev, aiMessage])
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) // Scroll after AI message
      await addDoc(
        collection(
          db,
          `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${currentAuthenticatedUserId}/chatHistory`,
        ),
        aiMessage,
      )
    } catch (error) {
      console.error("Error generating summary:", error)
      setMessages((prev) => [...prev, { type: "ai", text: "Oops! Failed to summarize the text." }])
    } finally {
      setIsProcessingSummarize(false)
      setShowSummarizeInput(false)
      setSummarizeInput("")
    }
  }

  // Handle button click actions
  const handleButtonClick = (action: string) => {
    console.log(`Action: ${action}`)
    closeAllLLMInputs() // Close any open LLM input tabs first

    // Scroll to advanced features section if "Upgrade Plan" is clicked
    if (action === "Upgrade Plan") {
      setShowUpgradeModal(true) // Open upgrade modal
    } else if (action === "Reflect on Emotions") {
      setShowEmotionalInput(true)
    } else if (action === "Break Down a Goal") {
      setShowGoalInput(true)
      setGoalBreakdown(null) // Clear previous breakdown
    } else if (action === "Creative Spark") {
      setShowCreativeInput(true)
    } else if (action === "Decision Navigator") {
      setShowDecisionInput(true)
    } else if (action === "Summarize Text") {
      // New: Summarize Text
      setShowSummarizeInput(true)
    } else if (action === "Start Assessment") {
      // Placeholder for starting the psychological assessment
      alert("Starting your personalized psychological assessment! (Feature coming soon)")
      // In a real app, you'd navigate to an assessment page or open a modal
    }
    // For other menu items, you might scroll to sections or open new modals
    if (action === "Home") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else if (action === "Features") {
      // Scroll to chat section or a dedicated features section
      document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })
    }
    setShowMobileMenu(false) // Close mobile menu after click
  }

  // Handle authentication (Login/Signup)
  const handleAuth = async () => {
    setAuthError("")
    setIsLoadingAuth(true)
    try {
      if (!auth) {
        setAuthError("Firebase is not initialized. Please check your configuration.")
        return
      }
      if (isLogin) {
        await signInWithEmailAndPassword(auth, authEmail, authPassword)
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword)
      }
      setShowAuthModal(false) // Close modal on success
      setAuthEmail("")
      setAuthPassword("")
    } catch (error: any) {
      console.error("Authentication error:", error)
      setAuthError(error.message)
    } finally {
      setIsLoadingAuth(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth)
        setMessages([]) // Clear messages on logout
        setUserId(null)
        setUser(null)
      } catch (error) {
        console.error("Logout error:", error)
      }
    }
  }

  // Close auth modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (authModalRef.current && !authModalRef.current.contains(event.target as Node)) {
        setShowAuthModal(false)
      }
    }
    if (showAuthModal) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showAuthModal])

  // Close upgrade modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (upgradeModalRef.current && !upgradeModalRef.current.contains(event.target as Node)) {
        setShowUpgradeModal(false)
      }
    }
    if (showUpgradeModal) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUpgradeModal])

  return (
    <div className="min-h-screen text-white font-inter relative overflow-hidden">
      <AnimatedBackground />
      {/* Sparkle container for grandiose effects */}
      <div className="sparkle-container">
        {Array.from({ length: 20 }).map(
          (
            _,
            i, // Reduced number of sparkles
          ) => (
            <div
              key={i}
              className="sparkle-effect"
              style={
                {
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  "--sparkle-x": `${(Math.random() - 0.5) * 100}px`, // Reduced sparkle movement
                  "--sparkle-y": `${(Math.random() - 0.5) * 100}px`, // Reduced sparkle movement
                } as React.CSSProperties
              }
            ></div>
          ),
        )}
      </div>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-70 backdrop-filter backdrop-blur-lg p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-2xl font-urbanist font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 focus:outline-none"
          >
            Obio.ai
          </button>
          <div className="hidden md:flex items-center space-x-4">
            {" "}
            {/* Desktop menu */}
            <button
              onClick={() => handleButtonClick("Upgrade Plan")}
              className="px-4 py-2 border border-purple-500 text-purple-300 rounded-full hover:bg-purple-900 transition-all duration-300"
            >
              Upgrade
            </button>
            {authReady && (user === null || user.isAnonymous) ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:shadow-purple-500/50 transition-all duration-300"
              >
                Sign In
              </button>
            ) : authReady && user && !user.isAnonymous ? (
              <>
                <span className="text-gray-400 text-sm">Welcome, {user.email || "User"}!</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300"
                >
                  Sign Out
                </button>
              </>
            ) : null}
          </div>
          {/* Hamburger menu for mobile */}
          <div className="md:hidden">
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="text-white focus:outline-none">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-90 z-40 transform ${showMobileMenu ? "mobile-menu open" : "mobile-menu"}`}
        >
          <div className="flex justify-end p-4">
            <button onClick={() => setShowMobileMenu(false)} className="text-white focus:outline-none">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="flex flex-col items-center space-y-6 py-10">
            <button
              onClick={() => handleButtonClick("Home")}
              className="text-white text-2xl font-urbanist hover:text-purple-400 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => handleButtonClick("Features")}
              className="text-white text-2xl font-urbanist hover:text-purple-400 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => handleButtonClick("Upgrade Plan")}
              className="px-6 py-3 border border-purple-500 text-purple-300 rounded-full hover:bg-purple-900 transition-all duration-300"
            >
              Upgrade
            </button>
            {authReady && (user === null || user.isAnonymous) ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:shadow-purple-500/50 transition-all duration-300"
              >
                Sign In
              </button>
            ) : authReady && user && !user.isAnonymous ? (
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300"
              >
                Sign Out
              </button>
            ) : null}
          </div>
        </div>
      </nav>
      {/* Hero Section - The AI That Grows With You (Modified for direct chat) */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 pt-20 flex flex-col items-center"
        >
          <motion.h2
            variants={fadeInVariants}
            className="font-urbanist text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          >
            Obio.ai
          </motion.h2>
          <motion.h1
            variants={typingVariants}
            className="font-urbanist text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 drop-shadow-lg py-2"
            style={{ display: "inline-block" }} // Important for clipPath to work
          >
            Your Mind. Amplified by AI.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-10 max-w-3xl text-center"
          >
            Discover yourself. Make better life decisions.
          </motion.p>
        </motion.div>

        {/* Main Chat Section - The Heart of Obio.ai (Moved Here) */}
        <div className="max-w-3xl mx-auto glassmorphic-card p-4 rounded-3xl shadow-2xl border-purple-700 border-opacity-30 relative overflow-hidden mt-10 w-full">
          {/* Subtle glow around the chatbox */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-br from-purple-500 to-blue-500 opacity-5 animate-pulse-slow pointer-events-none"></div>{" "}
          {/* Reduced opacity */}
          <div className="h-[180px] overflow-y-auto pr-2 mb-4 custom-scrollbar">
            {" "}
            {/* Further reduced height here */}
            {messages.map((msg, index) => (
              <div key={index} className={`flex mb-2 ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                {" "}
                {/* Reduced margin-bottom */}
                <div
                  className={`max-w-[75%] p-2.5 text-sm rounded-xl shadow-md animate-fade-in-up ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-blue-700 to-purple-700 text-white rounded-br-md" // Adjusted radius
                      : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-md" // Adjusted radius
                  }`}
                >
                  {msg.type === "ai" ? formatAiResponse(msg.text) : msg.text}
                  {/* Render structured goal breakdown if available */}
                  {msg.type === "ai" && msg.structuredData && (
                    <div className="mt-4 p-3 bg-gray-700 rounded-lg text-sm">
                      <h4 className="font-bold mb-2 text-purple-300">Goal Breakdown:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        {JSON.parse(msg.structuredData).map((item: any, i: number) => (
                          <li key={i} className="text-gray-300">
                            <strong>{item.step}</strong> ({item.timeframe}): {item.description}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-3">
                {" "}
                {/* Reduced margin-bottom */}
                <div className="glassmorphic-card p-3 rounded-xl shadow-md rounded-bl-md animate-fade-in-up">
                  {" "}
                  {/* Adjusted radius */}
                  <span className="animate-typing-pulse text-gray-400">.</span>
                  <span className="animate-typing-pulse text-gray-400">.</span>
                  <span className="animate-typing-pulse text-gray-400">.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Scroll target */}
          </div>
          {/* New LLM Feature Buttons */}
          {authReady && user && !user.isAnonymous && (
            <div className="flex overflow-x-auto whitespace-nowrap gap-2 pb-2 mb-2 custom-scrollbar">
              {" "}
              {/* Changed to flex for horizontal scroll */} {/* Adjusted gap and mb */}
              <button
                onClick={() => handleButtonClick("Reflect on Emotions")}
                className="flex-shrink-0 px-2 py-1 bg-gradient-to-r from-purple-700 to-pink-700 text-white text-xs font-bold rounded-full shadow-lg hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105" // Adjusted padding and font size
                disabled={
                  isTyping ||
                  isProcessingEmotionalInsight ||
                  isProcessingGoal ||
                  isProcessingCreative ||
                  isProcessingDecision ||
                  isProcessingSummarize
                }
              >
                ✨ Reflect on Emotions
              </button>
              <button
                onClick={() => handleButtonClick("Break Down a Goal")}
                className="flex-shrink-0 px-2 py-1 bg-gradient-to-r from-blue-700 to-cyan-700 text-white text-xs font-bold rounded-full shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105" // Adjusted padding and font size
                disabled={
                  isTyping ||
                  isProcessingEmotionalInsight ||
                  isProcessingGoal ||
                  isProcessingCreative ||
                  isProcessingDecision ||
                  isProcessingSummarize
                }
              >
                🎯 Break Down a Goal
              </button>
              <button
                onClick={() => handleButtonClick("Creative Spark")}
                className="flex-shrink-0 px-2 py-1 bg-gradient-to-r from-green-700 to-yellow-700 text-white text-xs font-bold rounded-full shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105" // Adjusted padding and font size
                disabled={
                  isTyping ||
                  isProcessingEmotionalInsight ||
                  isProcessingGoal ||
                  isProcessingCreative ||
                  isProcessingDecision ||
                  isProcessingSummarize
                }
              >
                💡 Creative Spark
              </button>
              <button
                onClick={() => handleButtonClick("Decision Navigator")}
                className="flex-shrink-0 px-2 py-1 bg-gradient-to-r from-red-700 to-orange-700 text-white text-xs font-bold rounded-full shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105" // Adjusted padding and font size
                disabled={
                  isTyping ||
                  isProcessingEmotionalInsight ||
                  isProcessingGoal ||
                  isProcessingCreative ||
                  isProcessingDecision ||
                  isProcessingSummarize
                }
              >
                ⚖️ Decision Navigator
              </button>
              <button
                onClick={() => handleButtonClick("Summarize Text")}
                className="flex-shrink-0 px-2 py-1 bg-gradient-to-r from-gray-700 to-gray-500 text-white text-xs font-bold rounded-full shadow-lg hover:shadow-gray-500/50 transition-all duration-300 transform hover:scale-105" // Adjusted padding and font size
                disabled={
                  isTyping ||
                  isProcessingEmotionalInsight ||
                  isProcessingGoal ||
                  isProcessingCreative ||
                  isProcessingDecision ||
                  isProcessingSummarize
                }
              >
                📝 Summarize Text
              </button>
            </div>
          )}
          {/* Emotional Insight Input */}
          {showEmotionalInput && authReady && user && !user.isAnonymous && (
            <div className="glassmorphic-card p-4 rounded-xl mb-4 animate-fade-in-up relative">
              <button
                onClick={() => setShowEmotionalInput(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              <textarea
                placeholder="Describe your current feelings or recent emotional experiences..."
                className="w-full bg-transparent outline-none text-white px-3 py-2 placeholder-gray-500 min-h-[80px] rounded-lg border border-gray-700 focus:border-purple-500"
                value={emotionalInput}
                onChange={(e) => setEmotionalInput(e.target.value)}
                disabled={isProcessingEmotionalInsight}
              ></textarea>
              <button
                onClick={handleGenerateEmotionalInsight}
                className="mt-3 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                disabled={isProcessingEmotionalInsight}
              >
                {isProcessingEmotionalInsight ? "Processing..." : "Get Emotional Insight"}
              </button>
            </div>
          )}
          {/* Goal Breakdown Input */}
          {showGoalInput && authReady && user && !user.isAnonymous && (
            <div className="glassmorphic-card p-4 rounded-xl mb-4 animate-fade-in-up relative">
              <button
                onClick={() => setShowGoalInput(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              <input
                type="text"
                placeholder="What is your goal? (e.g., Learn to code, Write a book)"
                className="w-full bg-transparent outline-none text-white px-3 py-2 placeholder-gray-500 rounded-lg border border-gray-700 focus:border-blue-500"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                disabled={isProcessingGoal}
              />
              <button
                onClick={handleGenerateGoalBreakdown}
                className="mt-3 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-full shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                disabled={isProcessingGoal}
              >
                {isProcessingGoal ? "Processing..." : "Generate Goal Breakdown"}
              </button>
            </div>
          )}
          {/* Creative Spark Input */}
          {showCreativeInput && authReady && user && !user.isAnonymous && (
            <div className="glassmorphic-card p-4 rounded-xl mb-4 animate-fade-in-up relative">
              <button
                onClick={() => setShowCreativeInput(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              <textarea
                placeholder="Give me a topic or keywords for creative writing..."
                className="w-full bg-transparent outline-none text-white px-3 py-2 placeholder-gray-500 min-h-[80px] rounded-lg border border-gray-700 focus:border-green-500"
                value={creativeInput}
                onChange={(e) => setCreativeInput(e.target.value)}
                disabled={isProcessingCreative}
              ></textarea>
              <button
                onClick={handleGenerateCreativeWriting}
                className="mt-3 px-6 py-2 bg-gradient-to-r from-green-600 to-yellow-600 text-white font-bold rounded-full shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                disabled={isProcessingCreative}
              >
                {isProcessingCreative ? "Generating..." : "Spark Creativity"}
              </button>
            </div>
          )}
          {/* Decision Navigator Input */}
          {showDecisionInput && authReady && user && !user.isAnonymous && (
            <div className="glassmorphic-card p-4 rounded-xl mb-4 animate-fade-in-up relative">
              <button
                onClick={() => setShowDecisionInput(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              <textarea
                placeholder="Describe your dilemma or decision you need to make..."
                className="w-full bg-transparent outline-none text-white px-3 py-2 placeholder-gray-500 min-h-[80px] rounded-lg border border-gray-700 focus:border-red-500"
                value={decisionInput}
                onChange={(e) => setDecisionInput(e.target.value)}
                disabled={isProcessingDecision}
              ></textarea>
              <button
                onClick={handleGenerateDecisionSupport}
                className="mt-3 px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-red-500/50 transition-all duration-300"
                disabled={isProcessingDecision}
              >
                {isProcessingDecision ? "Analyzing..." : "Navigate Decision"}
              </button>
            </div>
          )}
          {/* Summarize Text Input */}
          {showSummarizeInput && authReady && user && !user.isAnonymous && (
            <div className="glassmorphic-card p-4 rounded-xl mb-4 animate-fade-in-up relative">
              <button
                onClick={() => setShowSummarizeInput(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              <textarea
                placeholder="Paste text here to summarize..."
                className="w-full bg-transparent outline-none text-white px-3 py-2 placeholder-gray-500 min-h-[80px] rounded-lg border border-gray-700 focus:border-gray-500"
                value={summarizeInput}
                onChange={(e) => setSummarizeInput(e.target.value)}
                disabled={isProcessingSummarize}
              ></textarea>
              <button
                onClick={handleGenerateSummary}
                className="mt-3 px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-400 text-white font-bold rounded-full shadow-lg hover:shadow-gray-500/50 transition-all duration-300"
                disabled={isProcessingSummarize}
              >
                {isProcessingSummarize ? "Summarizing..." : "Summarize Text"}
              </button>
            </div>
          )}
          <div className="flex items-center glassmorphic-card p-1.5 rounded-full border-purple-500 border-opacity-30">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-grow bg-transparent outline-none text-white px-3 py-2 placeholder-gray-500"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isTyping) handleSendMessage()
              }}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center ml-2 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              disabled={isTyping}
            >
              {/* Send icon */}
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>

        {authReady && user && user.isAnonymous && (
          <p className="text-gray-400 mt-6 animate-fade-in-up animation-delay-500">
            Chat freely as a guest, or{" "}
            <button onClick={() => setShowAuthModal(true)} className="text-purple-400 hover:underline">
              sign in
            </button>{" "}
            to save your conversations and unlock advanced features.
          </p>
        )}
      </section>
      <section className="py-20 px-4 text-center relative z-10">
        <h2 className="font-urbanist text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 animate-fade-in-up">
          Your Personalized Journey Starts Here
        </h2>
        <div className="max-w-2xl mx-auto glassmorphic-card p-8 rounded-3xl shadow-xl border-purple-700 border-opacity-50 flex flex-col items-center text-center animate-fade-in-up animation-delay-500">
          <div className="text-6xl mb-6">✨</div>
          <h3 className="font-urbanist text-3xl font-bold mb-4 text-white">Your Personalized Journey Starts Here</h3>
          <ul className="space-y-4 text-left text-gray-300 mb-8">
            <li className="flex items-start gap-3 animate-fade-in-up animation-delay-600">
              <div className="text-purple-400 flex-shrink-0 mt-1">✨</div>
              <div>
                <span className="font-medium text-white">More than a Test:</span> It's your gateway to the most
                intelligent and personal AI experience you'll ever have.
              </div>
            </li>
            <li className="flex items-start gap-3 animate-fade-in-up animation-delay-700">
              <div className="text-blue-400 flex-shrink-0 mt-1">🧠</div>
              <div>
                <span className="font-medium text-white">Unrivaled Understanding:</span> Obio.ai doesn't just listen; it
                builds a unique, evolving model of you – your personality, values, and inner logic.
              </div>
            </li>
            <li className="flex items-start gap-3 animate-fade-in-up animation-delay-800">
              <div className="text-green-400 flex-shrink-0 mt-1">🤝</div>
              <div>
                <span className="font-medium text-white">Your Lifelong AI Ally:</span> Receive guidance that truly
                resonates, remembering your journey and adapting as you grow.
              </div>
            </li>
            <li className="flex items-start gap-3 animate-fade-in-up animation-delay-900">
              <div className="text-pink-400 flex-shrink-0 mt-1<div>🚀</div>
              <div>
                <span className="font-medium text-white">Unlock Your True Potential:</span> This foundational assessment
                provides unparalleled clarity and self-discovery, transforming your future.
              </div>
            </li>
          </ul>
          <button
            onClick={() => handleButtonClick("Start Assessment")}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Start Your Psychological Assessment
          </button>
        </div>
      </section>
      {/* Advanced AI Features Section (Upgrade Section) */}
      <section ref={advancedFeaturesRef} className="py-20 px-4 text-center relative z-10">
        <h2 className="font-urbanist text-4xl md:text-5xl font-bold mb-16 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-green-400 animate-fade-in-up">
          Advanced Obio.ai Features
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature Card: Emotional Reflection */}
          <div className="glassmorphic-card p-6 rounded-3xl shadow-xl border-purple-700 border-opacity-50 flex flex-col items-center text-center animate-fade-in-up animation-delay-500 group hover:border-purple-400 hover:translate-y-[-5px] hover:shadow-purple-500/20 transition-all duration-300">
            <div className="text-5xl mb-4 text-purple-400 group-hover:scale-110 transition-transform">🧠</div>
            <h3 className="font-urbanist text-2xl font-bold mb-2 text-white">Emotional Reflection</h3>
            <p className="text-gray-300">
              Your <strong>personal AI psychologist</strong>, offering empathetic insights and guided questions to
              understand and manage your emotions for profound self-awareness.
            </p>
          </div>
          {/* Feature Card: Goal Development */}
          <div className="glassmorphic-card p-6 rounded-3xl shadow-xl border-blue-700 border-opacity-50 flex flex-col items-center text-center animate-fade-in-up animation-delay-700 group hover:border-blue-400 hover:translate-y-[-5px] hover:shadow-blue-500/20 transition-all duration-300">
            <div className="text-5xl mb-4 text-blue-400 group-hover:scale-110 transition-transform">🎯</div>
            <h3 className="font-urbanist text-2xl font-bold mb-2 text-white">Goal Development</h3>
            <p className="text-gray-300">
              Transform your aspirations into <strong>tangible reality</strong>, breaking down complex goals into clear,
              actionable steps with precise timeframes.
            </p>
          </div>
          {/* Feature Card: Creative Spark */}
          <div className="glassmorphic-card p-6 rounded-3xl shadow-xl border-pink-700 border-opacity-50 flex flex-col items-center text-center animate-fade-in-up animation-delay-900 group hover:border-pink-400 hover:translate-y-[-5px] hover:shadow-pink-500/20 transition-all duration-300">
            <div className="text-5xl mb-4 text-pink-400 group-hover:scale-110 transition-transform">💡</div>
            <h3 className="font-urbanist text-2xl font-bold mb-2 text-white">Creative Spark</h3>
            <p className="text-gray-300">
              Unleash your <strong>inner genius</strong> with the agent's creative suggestions, inspiring new ideas,
              writing, and innovative problem-solving.
            </p>
          </div>
          {/* Feature Card: Decision Navigator */}
          <div className="glassmorphic-card p-6 rounded-3xl shadow-xl border-green-700 border-opacity-50 flex flex-col items-center text-center animate-fade-in-up animation-delay-1100 group hover:border-green-400 hover:translate-y-[-5px] hover:shadow-green-500/20 transition-all duration-300">
            <div className="text-5xl mb-4 text-green-400 group-hover:scale-110 transition-transform">⚖️</div>
            <h3 className="font-urbanist text-2xl font-bold mb-2 text-white">Decision Navigator</h3>
            <p className="text-gray-300">
              Leveraging its deep understanding of you, Obio.ai provides{" "}
              <strong>perfect, personalized decisions</strong> by analyzing dilemmas and offering optimal paths forward.
            </p>
          </div>
          {/* Feature Card: Text Summarization */}
          <div className="glassmorphic-card p-6 rounded-3xl shadow-xl border-cyan-700 border-opacity-50 flex flex-col items-center text-center animate-fade-in-up animation-delay-1300 group hover:border-cyan-400 hover:translate-y-[-5px] hover:shadow-cyan-500/20 transition-all duration-300">
            <div className="text-5xl mb-4 text-cyan-400 group-hover:scale-110 transition-transform">📝</div>
            <h3 className="font-urbanist text-2xl font-bold mb-2 text-white">Text Summarization</h3>
            <p className="text-gray-300">
              Instantly distill complex information into <strong>crystal-clear insights</strong>, saving you time and
              enhancing your comprehension of any text.
            </p>
          </div>
          {/* Feature Card: Voice Input/Output (Placeholder for future) */}
          <div className="glassmorphic-card p-6 rounded-3xl shadow-xl border-orange-700 border-opacity-50 flex flex-col items-center text-center animate-fade-in-up animation-delay-1500 group hover:border-orange-400 hover:translate-y-[-5px] hover:shadow-orange-500/20 transition-all duration-300">
            <div className="text-5xl mb-4 text-orange-400 group-hover:scale-110 transition-transform">🗣️</div>
            <h3 className="font-urbanist text-2xl font-bold mb-2 text-white">Voice Interaction</h3>
            <p className="text-gray-300">
              Speak naturally and receive spoken responses for a truly hands-free, intuitive experience.
            </p>
          </div>
        </div>
      </section>
      {/* Compact Get the App Section */}
      <section className="py-10 px-4 text-center relative z-10">
        <div className="max-w-2xl mx-auto glassmorphic-card p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center space-y-6">
          <h3 className="font-urbanist text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            Get the Obio.ai App
          </h3>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full justify-center">
            <a
              href="#" // Replace with actual iOS App Store link
              onClick={() => handleButtonClick("Download iOS")}
              className="download-button ios w-full sm:w-auto"
            >
              <Apple className="w-6 h-6 mr-3" />
              <span>App Store</span>
            </a>
            <a
              href="#" // Replace with actual Android Google Play link
              onClick={() => handleButtonClick("Download Android")}
              className="download-button android w-full sm:w-auto"
            >
              <Smartphone className="w-6 h-6 mr-3" />
              <span>Google Play</span>
            </a>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="backdrop-blur-xl border-t border-white/10 py-16 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Obio.ai
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>© 2025 Obio.ai. Built with care for your future.</p>
          </div>
        </div>
      </footer>
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div
            ref={authModalRef}
            className="glassmorphic-card p-8 rounded-3xl shadow-2xl border-purple-700 border-opacity-50 w-full max-w-md mx-4 relative"
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <h2 className="font-urbanist text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              {isLogin ? "Sign In" : "Sign Up"}
            </h2>
            {authError && <p className="text-red-500 text-center mb-4">{authError}</p>}
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
              <button
                onClick={handleAuth}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
                disabled={isLoadingAuth}
              >
                {isLoadingAuth ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </div>
            <p className="mt-6 text-center text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-purple-400 hover:underline">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
            {userId && !user?.isAnonymous && (
              <p className="mt-4 text-center text-gray-500 text-sm">
                Your User ID: <span className="font-mono text-xs">{userId}</span>
              </p>
            )}
          </div>
        </div>
      )}
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div
            ref={upgradeModalRef}
            className="glassmorphic-card p-6 rounded-3xl shadow-2xl border-purple-700 border-opacity-50 w-full max-w-md mx-4 relative text-center"
          >
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <h2 className="font-urbanist text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Unlock Obio.ai Premium
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Transform your life for just <span className="line-through text-gray-500 mr-2">$20/month</span>{" "}
              <span className="font-bold text-purple-300 text-2xl">$10/month</span>.
            </p>
            <ul className="space-y-3 text-left text-gray-300 mb-8">
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-400 flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <span className="font-medium text-white">Your AI Psychologist:</span>
                  <p className="text-gray-300 text-sm">
                    Empathetic emotional support, 24/7, like a human therapist, always by your side.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-400 flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <span className="font-medium text-white">Unmatched Memory & Ultimate Friend:</span>
                  <p className="text-gray-300 text-sm">
                    Remembers every detail for truly personalized guidance, transforming it into your ultimate friend
                    and planner for any situation.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-400 flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <span className="font-medium text-white">Full Access & Most Advanced AI:</span>
                  <p className="text-gray-300 text-sm">
                    Unlock all advanced functionalities. Obio.ai is designed for deep personal growth and creative
                    solutions, surpassing any existing AI.
                  </p>
                </div>
              </li>
            </ul>
            <button className="w-full py-3 mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105">
              Upgrade Now
            </button>
          </div>
        </div>
      )}
      <AIChatbot />
    </div>
  )
}