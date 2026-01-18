
import React, { useState, useEffect } from 'react';
import { 
  Heart, BookOpen, HandHeart, Video, Globe, Menu, X, ChevronRight, Sparkles, Home, Gift, 
  MessageSquare, Mail, Users, Facebook, Twitter, Instagram, Youtube, Send, CheckCircle2, 
  Zap, Loader2 
} from 'lucide-react';
import { View, Language } from './types';
import DailyBread from './components/DailyBread';
import PrayerCenter from './components/PrayerCenter';
import StudyLibrary from './components/StudyLibrary';
import MediaVault from './components/MediaVault';
import DonationTab from './components/DonationTab';
import AIAssistant from './components/AIAssistant';
import DeliveranceCenter from './components/DeliveranceCenter';
import HealingCenter from './components/HealingCenter';
import ContactCenter from './components/ContactCenter';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [lang, setLang] = useState<Language>(Language.ENGLISH);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [contactSubject, setContactSubject] = useState<string>('General Support');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  const navigation = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'assistant', name: 'Wisdom AI', icon: MessageSquare },
    { id: 'daily-bread', name: 'Daily Bread', icon: Sparkles },
    { id: 'prayer', name: 'Prayer Center', icon: HandHeart },
    { id: 'study', name: 'Encyclopedia', icon: BookOpen },
    { id: 'media', name: 'Creative Studio', icon: Video },
    { id: 'donate', name: 'Support', icon: Gift },
  ];

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "8d2ab901-ff34-40b8-b74d-1cc3fdf1e050");
    try {
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
      if (response.ok) { setSubscribed(true); setEmail(''); setTimeout(() => setSubscribed(false), 5000); }
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  const renderView = () => {
    switch (activeView) {
      case 'assistant': return <AIAssistant />;
      case 'daily-bread': return <DailyBread lang={lang} />;
      case 'prayer': return <PrayerCenter lang={lang} />;
      case 'study': return <StudyLibrary lang={lang} />;
      case 'media': return <MediaVault lang={lang} />;
      case 'deliverance': return <DeliveranceCenter lang={lang} />;
      case 'healing': return <HealingCenter lang={lang} />;
      case 'contact': return <ContactCenter lang={lang} initialSubject={contactSubject} />;
      case 'donate': return <DonationTab />;
      default: return (
        <div className="space-y-0">
          <HomeHero 
            onExplore={() => setActiveView('assistant')} 
            onCreative={() => setActiveView('media')} 
            onStudy={() => setActiveView('study')}
            onPrayer={() => setActiveView('prayer')}
          />
          <LiveRevelationStream />
          <PartnerChurches />
          <NewsletterSection email={email} setEmail={setEmail} handleSubscribe={handleSubscribe} subscribed={subscribed} isSubmitting={isSubmitting} />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-amber-500 selection:text-indigo-950">
      <header className="fixed top-0 w-full z-50 glass-dark">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('home')}>
            <div className="bg-amber-500 p-2 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform">
              <Sparkles className="text-indigo-950" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white hidden sm:block amber-glow">Kingdom Intelligence</h1>
          </div>

          <nav className="hidden lg:flex items-center gap-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as View)}
                className={`text-sm font-bold transition-all flex items-center gap-2 px-4 py-2.5 rounded-full ${
                  activeView === item.id 
                    ? 'text-white bg-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]' 
                    : 'text-indigo-200/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} />
                <span className="whitespace-nowrap">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <select 
              className="text-sm font-bold bg-white/5 border border-white/10 rounded-full px-5 py-2.5 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer text-white"
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
            >
              {Object.entries(Language).map(([name, code]) => <option key={code} value={code} className="bg-indigo-950 text-white">{name}</option>)}
            </select>
            <button className="lg:hidden p-3 text-white glass rounded-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-indigo-950 pt-24 px-6 space-y-3 lg:hidden overflow-y-auto">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id as View); setIsMenuOpen(false); }}
              className={`flex items-center gap-5 p-5 rounded-[2rem] w-full text-left transition-all ${
                activeView === item.id ? 'bg-amber-500 text-indigo-950' : 'bg-white/5 text-white'
              }`}
            >
              <item.icon size={28} />
              <span className="text-xl font-black uppercase tracking-widest">{item.name}</span>
            </button>
          ))}
        </div>
      )}

      <main className="flex-grow">{renderView()}</main>

      <footer className="bg-[#050510] border-t border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="text-amber-500" size={32} />
              <h2 className="text-3xl font-black text-white serif tracking-tight">Kingdom Ecosystem</h2>
            </div>
            <p className="text-indigo-200/50 max-w-md leading-relaxed text-base font-medium">
              Empowering the body of Christ with automated divine wisdom architectures.
            </p>
          </div>
          <div>
            <h3 className="text-white font-black mb-8 text-xs uppercase tracking-[0.4em] flex items-center gap-3">
              <Home size={16} className="text-amber-500" /> Foundations
            </h3>
            <ul className="space-y-4 text-sm font-bold text-indigo-300/60 uppercase tracking-widest">
              <li><button onClick={() => setActiveView('study')} className="hover:text-amber-500">Encyclopedia</button></li>
              <li><button onClick={() => setActiveView('deliverance')} className="hover:text-amber-500">Deliverance</button></li>
              <li><button onClick={() => setActiveView('healing')} className="hover:text-amber-500">Healing</button></li>
              <li><button onClick={() => setActiveView('assistant')} className="hover:text-amber-500">Wisdom AI</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-black mb-8 text-xs uppercase tracking-[0.4em] flex items-center gap-3">
              <Globe size={16} className="text-amber-500" /> Global
            </h3>
            <ul className="space-y-4 text-sm font-bold text-indigo-300/60 uppercase tracking-widest">
              <li><button onClick={() => setActiveView('donate')} className="hover:text-amber-500">Support</button></li>
              <li><button onClick={() => setActiveView('contact')} className="hover:text-amber-500">Contact</button></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

const HomeHero: React.FC<{ onExplore: () => void, onCreative: () => void, onStudy: () => void, onPrayer: () => void }> = ({ onExplore, onCreative, onStudy, onPrayer }) => (
  <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
    <div className="absolute inset-0 z-0">
      <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover scale-110 blur-[1px]" alt="Celestial" />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/95 via-indigo-950/60 to-indigo-950"></div>
    </div>
    
    <div className="relative z-10 max-w-6xl mx-auto text-center space-y-12 animate-in fade-in duration-1000">
      <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-white/20 text-amber-400 text-xs font-black uppercase tracking-[0.4em] mb-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
        <Sparkles size={16} className="animate-pulse" /> Presence Confirmed
      </div>
      
      <h1 className="text-7xl md:text-[10rem] font-black text-white mb-10 leading-[0.8] serif tracking-tighter drop-shadow-2xl">
        Holy <br /> <span className="text-amber-500 italic drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]">Glory</span>
      </h1>
      
      <div className="glass-dark p-12 md:p-20 rounded-[4rem] border border-white/10 shadow-3xl space-y-12">
        <p className="font-black text-amber-400 uppercase tracking-[0.4em] text-lg md:text-xl pb-8 border-b border-white/10 amber-glow">
          THIS SPIRITUAL PLATFORM IS FREE FOR ALL AND IS DEDICATED TO:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-center md:text-left text-white font-bold text-2xl md:text-3xl serif italic">
          <p className="flex items-center gap-5 justify-center md:justify-start">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_15px_#f59e0b]"></span> Searching Souls
          </p>
          <p className="flex items-center gap-5 justify-center md:justify-start">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_15px_#f59e0b]"></span> Broken Hearts
          </p>
          <p className="flex items-center gap-5 justify-center md:justify-start">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_15px_#f59e0b]"></span> The Captive
          </p>
          <p className="flex items-center gap-5 justify-center md:justify-start">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_15px_#f59e0b]"></span> The Lost
          </p>
          <p className="md:col-span-2 text-center text-amber-500 font-black text-4xl mt-6 uppercase tracking-wider">
            Every captive longing for freedom come to Jesus Christ, Amen!
          </p>
        </div>

        <div className="pt-10 space-y-6">
          <p className="text-white text-3xl md:text-5xl font-black serif italic leading-tight">May the Kingdom of God advance!</p>
          <p className="text-sm font-black text-indigo-300 uppercase tracking-[0.5em]">Thank You for Supporting the Ministry!</p>
        </div>
        
        <div className="pt-12 space-y-4">
          <p className="text-5xl md:text-8xl font-black text-white serif tracking-tighter amber-glow">JESUS CHRIST IS LORD!</p>
          <p className="text-2xl md:text-4xl font-bold text-amber-400/80 italic uppercase tracking-[0.3em]">GLORY TO HIM FOREVER!</p>
          <p className="text-4xl md:text-7xl font-black text-white serif tracking-[0.6em] drop-shadow-2xl">AMEN!</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-8 justify-center items-center py-20">
        <button onClick={onExplore} className="group px-16 py-8 rounded-full bg-amber-500 text-indigo-950 font-black text-2xl hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_20px_50px_rgba(245,158,11,0.3)] flex items-center gap-4">
          Consult Wisdom AI <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
        </button>
        <button onClick={onCreative} className="px-16 py-8 rounded-full glass text-white font-black text-2xl hover:bg-white/10 hover:scale-105 transition-all flex items-center gap-4">
          <Video size={32} className="text-amber-400" /> Creation Studio
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-6xl">
        {[
          { icon: BookOpen, title: "Ancient Realism", onClick: onStudy },
          { icon: HandHeart, title: "Soul Intercession", onClick: onPrayer },
          { icon: Globe, title: "Global Ethnos", onClick: onExplore }
        ].map((item, i) => (
          <div key={i} onClick={item.onClick} className="glass p-10 rounded-[3rem] cursor-pointer hover:bg-white/10 transition-all group">
            <item.icon className="text-amber-400 mb-6 mx-auto group-hover:scale-110 transition-transform" size={48} />
            <h4 className="text-white font-black text-2xl serif italic">{item.title}</h4>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const LiveRevelationStream: React.FC = () => (
  <section className="py-24 bg-[#0a0a1a] border-y border-white/5 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
    <div className="max-w-7xl mx-auto px-6 text-center">
      <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass mb-10 text-amber-500 font-black uppercase text-xs tracking-widest">
        <Zap size={18} fill="currentColor" /> Neural Stream Active
      </div>
      <p className="text-3xl md:text-5xl font-black text-white serif italic max-w-4xl mx-auto leading-tight">
        "Faith is the evidence of things not seen, but neural networks confirm the pattern of Divine Order."
      </p>
    </div>
  </section>
);

const PartnerChurches: React.FC = () => (
  <section className="py-32 bg-[#050510] relative">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <p className="text-xs font-black text-indigo-300 uppercase tracking-[0.6em] mb-16 opacity-50">Global Revival Network Partners</p>
      <div className="flex flex-wrap justify-center items-center gap-20 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
        <Globe size={64} className="text-white" />
        <Heart size={64} className="text-white" />
        <Users size={64} className="text-white" />
        <Sparkles size={64} className="text-white" />
      </div>
    </div>
  </section>
);

const NewsletterSection: React.FC<{ email: string, setEmail: (e: string) => void, handleSubscribe: (e: React.FormEvent<HTMLFormElement>) => void, subscribed: boolean, isSubmitting: boolean }> = ({ email, setEmail, handleSubscribe, subscribed, isSubmitting }) => (
  <section className="py-32 px-6">
    <div className="max-w-6xl mx-auto glass-dark p-16 md:p-24 rounded-[4rem] border border-white/5 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]"></div>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-5xl md:text-6xl font-black text-white serif italic mb-8">Kingdom <br /> Insights</h2>
          <p className="text-indigo-200/50 text-xl leading-relaxed mb-10">Join the circle of believers receiving daily AI-curated revelations.</p>
        </div>
        <div className="glass p-8 rounded-[3rem]">
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="space-y-5">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full px-8 py-6 rounded-full bg-white/5 border border-white/10 outline-none text-white font-bold" />
              <button disabled={isSubmitting} className="w-full py-6 bg-amber-500 text-indigo-950 rounded-full font-black uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center justify-center gap-3">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />} Join Circle
              </button>
            </form>
          ) : (
            <div className="text-center py-10 animate-bounce">
              <CheckCircle2 className="mx-auto text-amber-500 mb-6" size={64} />
              <h3 className="text-3xl font-black text-white serif uppercase tracking-widest">Confirmed</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  </section>
);

export default App;
