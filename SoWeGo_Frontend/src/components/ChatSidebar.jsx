import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, Menu, MoreHorizontal, MessageSquare, Sparkles, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext' // 🔥 NEW: Imported to get current user for Voynts

const saveChatStorage = (chats) => localStorage.setItem('cyber_chats', JSON.stringify(chats))

const ChatSidebar = ({ isOpen, setIsOpen, chats, onNewIntent, onDeleteIntent }) => {
  const { currentUser } = useAuth(); // 🔥 NEW: Get the current user
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [voynts, setVoynts] = useState(0); // 🔥 NEW: Voynts state

  const navigate = useNavigate()
  const { chatId: activeChatId } = useParams()
  const dropdownRef = useRef(null)

  // 🔥 NEW: Load Voynts on mount and when user changes
  useEffect(() => {
    if (currentUser) {
      const savedVoynts = localStorage.getItem(`sowego_voynts_${currentUser.uid}`);
      if (savedVoynts) setVoynts(parseInt(savedVoynts));
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRenameSave = (chatId) => {
    const updatedChats = chats.map((chat) =>
      chat.id === chatId ? { ...chat, title: renameValue } : chat
    )
    saveChatStorage(updatedChats);
    setRenamingId(null);
    window.location.reload(); 
  };

  const handleDelete = (e, chatIdToDelete) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this intent history?')) {
      onDeleteIntent(chatIdToDelete, e);
      setOpenDropdownId(null);
    }
  }

  return (
    <div className={`flex h-full flex-col bg-[#050505] border-r border-white/5 p-4 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      
      <div className="flex items-center justify-between mb-8 pt-6 px-1">
        {isOpen && <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] opacity-80">Neural History</h2>}
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-[#14FFEC] transition-colors p-1">
          <Menu size={20} />
        </button>
      </div>

      <button
        onClick={onNewIntent}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-sm text-white transition-all hover:bg-[#14FFEC]/5 hover:border-[#14FFEC]/30 group"
      >
        <Plus size={18} className="text-[#14FFEC] group-hover:rotate-90 transition-transform" />
        {isOpen && <span className="font-bold tracking-tight">New Intent</span>}
      </button>

      <div className="mt-3 mb-2">
        <Link 
          to="/contribute"
          title="Submit a Gem"
          className="flex items-center justify-center w-full py-3 rounded-xl border border-[#14FFEC]/40 bg-gradient-to-r from-[#14FFEC]/10 to-transparent text-[#14FFEC] hover:bg-[#14FFEC]/20 hover:border-[#14FFEC] transition-all duration-300 shadow-[0_0_15px_rgba(20,255,236,0.1)] group"
        >
          <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {isOpen && <span className="font-bold text-sm ml-2">Submit a Gem</span>}
        </Link>
      </div>

      <div className="mt-6 flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {chats?.map((chat) => (
          <div 
            key={chat.id} 
            className={`group relative flex items-center rounded-lg transition-all ${
              chat.id === activeChatId ? 'bg-[#14FFEC]/10 text-[#14FFEC]' : 'hover:bg-white/5 text-slate-400'
            }`}
          >
            <Link to={`/assistant/${chat.id}`} className="flex-1 px-3 py-3 text-xs truncate">
              {isOpen && renamingId === chat.id ? (
                <input
                  value={renameValue}
                  className="bg-transparent border-b border-[#14FFEC] outline-none w-full text-[#14FFEC]"
                  onChange={(e) => setRenameValue(e.target.value)}
                  autoFocus
                  onBlur={() => handleRenameSave(chat.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameSave(chat.id)}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <MessageSquare size={14} className={chat.id === activeChatId ? 'text-[#14FFEC]' : 'text-slate-500'} />
                  {isOpen && <span className="truncate">{chat.title}</span>}
                </div>
              )}
            </Link>

            {isOpen && (
              <div className="relative pr-2" ref={openDropdownId === chat.id ? dropdownRef : null}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenDropdownId(openDropdownId === chat.id ? null : chat.id);
                  }}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
                >
                  <MoreHorizontal size={14} />
                </button>

                {openDropdownId === chat.id && (
                  <div className="absolute right-0 top-full mt-1 z-[100] w-32 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                    <button
                      onClick={() => { setRenamingId(chat.id); setRenameValue(chat.title); setOpenDropdownId(null); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-[10px] uppercase font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Edit2 size={12} /> Rename
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, chat.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-[10px] uppercase font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🔥 NEW: BOTTOM FOOTER SECTION (Voynts + Home) */}
      <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
        
        {/* Voynts Display */}
        <div 
          title="Your Voynts Balance"
          className="flex items-center justify-between px-3 py-3 bg-[#14FFEC]/5 rounded-xl border border-[#14FFEC]/20 overflow-hidden"
        >
          <div className="flex items-center gap-2 text-[#14FFEC]">
            <Sparkles size={16} className="animate-pulse" />
            {isOpen && <span className="font-bold text-xs uppercase tracking-wider">Voynts</span>}
          </div>
          {isOpen && <span className="font-black text-[#14FFEC]">{voynts}</span>}
        </div>

        {/* Exit to Home Button */}
        <Link 
          to="/" 
          title="Return Home"
          className="flex items-center gap-2 px-3 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
        >
          <Home size={16} className="group-hover:-translate-y-0.5 transition-transform" />
          {isOpen && <span className="text-xs font-bold uppercase tracking-wider">Exit to Earth</span>}
        </Link>
      </div>

    </div>
  )
}

export default ChatSidebar