import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate, useParams, Navigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from './context/AuthContext' 
import Navbar from './components/Navbar'
import HomePage from './components/HomePage'
import AssistantPage from './components/AssistantPage'
import ChatSidebar from './components/ChatSidebar'
import LoginPage from './components/LoginPage' 
import ContributeGem from './components/ContributeGem'

// 🛡️ PUBLIC LAYOUT
const PublicLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
)

// 🛡️ CHAT APP LAYOUT
const ChatAppLayout = () => {
  const { currentUser } = useAuth();
  // 🔥 UPDATED: Sidebar now defaults to closed (false) for that clean OS vibe
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const { chatId } = useParams();

  // 1. GATEKEEPER
  if (!currentUser) return <Navigate to="/" />;

  // 2. Load Neural History from LocalStorage
  useEffect(() => {
    if (!currentUser) return;
    
    const userChatKey = `cyber_chats_${currentUser.uid}`;
    const savedChats = localStorage.getItem(userChatKey);
    
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    } else {
      setChats([]);
    }
    
    setIsLoaded(true);
  }, [currentUser]); 

  // 3. Sync history updates to LocalStorage
  useEffect(() => {
    if (isLoaded && currentUser) {
      const userChatKey = `cyber_chats_${currentUser.uid}`;
      localStorage.setItem(userChatKey, JSON.stringify(chats));
    }
  }, [chats, isLoaded, currentUser]);

  // 4. Centralized New Intent Handler
  const handleNewIntent = () => {
    const newId = uuidv4();
    const newChat = {
      id: newId,
      title: `Intent ${chats.length + 1}`,
      timestamp: new Date().toISOString(),
      messages: [], 
    };

    setChats(prev => [newChat, ...prev]);
    navigate(`/assistant/${newId}`);
  };

  // 🔥 NEW: 5. Centralized Delete Handler
  const handleDeleteIntent = (intentId, e) => {
    if (e) e.stopPropagation(); // Stops the click from triggering navigation!
    
    setChats(prev => prev.filter(c => c.id !== intentId));
    
    // If we are deleting the active chat, kick us out to the blank assistant page
    if (chatId === intentId) {
      navigate('/assistant');
    }
  };

  return (
    <div className="flex h-screen pt-[68px] overflow-hidden bg-black"> 
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        chats={chats}
        onNewIntent={handleNewIntent}
        onDeleteIntent={handleDeleteIntent} // 🔥 Passed down here!
      />
      
      <div className="flex-1 h-full overflow-hidden">
        <Outlet context={{ chats, setChats }} />
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route element={<PublicLayout />}>
            <Route 
              path="/" 
              element={
                <main>
                  <HomePage />
                </main>
              } 
            />
            <Route path="/login" element={<LoginPage />} />
          </Route>
          
          <Route element={<ChatAppLayout />}>
            <Route path="/assistant/:chatId" element={<AssistantPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
          </Route>

          <Route path="/contribute" element={<ContributeGem />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App