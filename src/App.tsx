import React, { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Play, 
  Pause, 
  Save, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  CheckCircle2,
  Menu,
  X as CloseIcon,
  ArrowRight,
  Brain,
  ShieldCheck,
  Check,
  X,
  Activity,
  Megaphone,
  Square
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, isSameDay, addSeconds } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { AuthProvider, useAuth } from "@/src/components/AuthContext";
import { api } from "@/src/lib/api";
import { User, Client, Project, TimeEntry, ApiError, AdminStats } from "@/src/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const QUOTES = [
  { text: "Complexity is your enemy. Any fool can make something complicated. It is hard to keep things simple.", author: "Sir Richard Branson" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Time is what we want most, but what we use worst.", author: "William Penn" },
  { text: "The key is in not spending time, but in investing it.", author: "Stephen R. Covey" }
];
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from "recharts";

// --- Main App Component ---
export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <BloomContainer />
    </AuthProvider>
  );
}

function BloomContainer() {
  const { user, loading } = useAuth();
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    if (user) setShowApp(true);
  }, [user]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-harvest-bg">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-8 h-8 border-2 border-harvest-orange border-t-transparent rounded-full"
      />
    </div>
  );

  if (showApp || user) {
    return user ? <Dashboard /> : <Login onBack={() => setShowApp(false)} />;
  }

  return <LandingPage onGetStarted={() => setShowApp(true)} />;
}

// --- Landing Page Component ---
function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-harvest-bg font-sans text-harvest-text overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-harvest-border h-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-8 flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <div className="flex items-center group cursor-pointer">
              <div className="w-9 h-9 bg-harvest-orange rounded flex items-center justify-center font-bold text-white mr-3 shadow-lg shadow-harvest-orange/20">B</div>
              <span className="text-2xl font-bold tracking-tight">Bloom</span>
            </div>
            <div className="hidden md:flex space-x-10 text-[15px] font-medium text-harvest-muted">
              <a href="#features" className="hover:text-harvest-orange transition-colors">Features</a>
              <a href="#why" className="hover:text-harvest-orange transition-colors">Why Bloom</a>
              <a href="#pricing" className="hover:text-harvest-orange transition-colors">Pricing</a>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={onGetStarted}
              className="text-[15px] font-semibold text-harvest-text hover:text-harvest-orange transition-colors"
            >
              Sign In
            </button>
            <Button 
              onClick={onGetStarted}
              className="bg-harvest-orange hover:bg-harvest-orange-hover text-white px-6 py-5 rounded-md font-bold shadow-lg shadow-harvest-orange/10 transition-all transform hover:scale-105 active:scale-95"
            >
              Try Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center px-4 py-1.5 bg-harvest-orange/10 text-harvest-orange rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-harvest-orange/10">
                  <Sparkles className="w-3 h-3 mr-2" />
                  AI-Powered Multi-Tenant SaaS
                </div>
                <h1 className="text-6xl lg:text-7xl font-extralight text-harvest-text leading-[1.1] mb-8 tracking-tighter">
                  Time tracking that <span className="font-semibold italic text-harvest-orange">blooms</span> with your business.
                </h1>
                <p className="text-xl text-harvest-muted mb-12 max-w-2xl font-light leading-relaxed">
                  The most minimalist way to track time, manage projects, and unlock AI-powered insights for your entire organization.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                  <Button 
                    onClick={onGetStarted}
                    className="bg-harvest-dark text-white hover:bg-black px-10 py-7 text-lg rounded-md font-bold shadow-2xl transition-all w-full sm:w-auto"
                  >
                    Start Your Free Trial
                  </Button>
                  <p className="text-sm text-harvest-muted font-medium">
                    No credit card required. <br />
                    14-day free trial on us.
                  </p>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="flex-1 relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative bg-white rounded-2xl shadow-[0_50px_100px_-20px_rgba(45,46,51,0.15)] border border-harvest-border p-3">
                <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 aspect-[4/3] flex items-center justify-center relative">
                   {/* Mock UI Representation */}
                   <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-orange-50/20" />
                   <div className="relative w-[80%] space-y-4">
                      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                      <div className="h-16 w-full bg-white rounded-lg border border-slate-100 shadow-sm flex items-center px-4">
                         <div className="w-2 h-2 rounded-full bg-harvest-orange mr-3" />
                         <div className="h-2 w-48 bg-slate-100 rounded" />
                         <div className="ml-auto text-2xl font-light">0:45:00</div>
                      </div>
                      <div className="h-16 w-full bg-white rounded-lg border border-slate-100 shadow-sm flex items-center px-4 opacity-70">
                         <div className="w-2 h-2 rounded-full bg-slate-300 mr-3" />
                         <div className="h-2 w-32 bg-slate-100 rounded" />
                         <div className="ml-auto text-xl font-light">1:20:00</div>
                      </div>
                      <div className="bg-indigo-50 border border-dashed border-indigo-200 rounded-lg p-3">
                        <div className="h-1.5 w-24 bg-indigo-200 rounded mb-2" />
                        <div className="h-1.5 w-full bg-indigo-100 rounded" />
                      </div>
                   </div>
                </div>
              </div>
              {/* Floating element */}
              <div className="absolute -bottom-10 -left-10 bg-white rounded-xl shadow-xl border border-harvest-border p-6 hidden md:block">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs font-bold uppercase tracking-widest text-harvest-muted">Weekly Goal</span>
                </div>
                <div className="text-3xl font-light">37.5h <span className="text-sm text-green-600 font-bold">/ 40h</span></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Bento */}
      <section id="features" className="py-32 bg-white px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-light text-harvest-text mb-4 tracking-tight">Everything you need, nothing you don't.</h2>
            <p className="text-lg text-harvest-muted font-light max-w-xl mx-auto leading-relaxed">
              We've stripped away the noise of traditional enterprise software to focus on pure productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto lg:h-[700px]">
             {/* Large Feature Card */}
             <div className="md:col-span-8 bg-harvest-bg border border-harvest-border rounded-3xl p-10 flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10">
                  <h3 className="text-3xl font-medium mb-4">Precision Time Tracking</h3>
                  <p className="text-harvest-muted text-lg max-w-md font-light">One click to start. Zero friction. Minimal distraction. The way tracking should be.</p>
                </div>
                <div className="absolute bottom-[-50px] right-[-50px] w-2/3 h-2/3 bg-white border border-harvest-border rounded-2xl shadow-2xl rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500 p-8">
                   <div className="space-y-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-12 w-full bg-slate-50 border border-slate-100 rounded flex items-center px-4">
                           <div className="w-2 h-2 bg-harvest-orange rounded-full mr-4" />
                           <div className="h-1.5 w-1/3 bg-slate-200 rounded" />
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Small Vertical Card */}
             <div className="md:col-span-4 bg-indigo-900 text-white border border-indigo-800 rounded-3xl p-10 flex flex-col">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 border border-white/10">
                  <Sparkles className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="text-3xl font-medium mb-4">AI Activity Insights</h3>
                <p className="text-indigo-200/80 text-lg font-light flex-1 leading-relaxed">
                  Bloom analyzes your day and surfaces hidden patterns in your productivity automatically.
                </p>
                <div className="mt-8 border-t border-white/10 pt-8">
                  <Button className="w-full bg-white text-indigo-900 hover:bg-slate-100 py-6 font-bold" onClick={onGetStarted}>See How it Works</Button>
                </div>
             </div>

             {/* Bottom Cards */}
             <div className="md:col-span-4 bg-white border border-harvest-border rounded-3xl p-10 shadow-sm border-t-8 border-t-harvest-orange">
                <Users className="w-10 h-10 text-harvest-orange mb-6" />
                <h4 className="text-2xl font-medium mb-3">Multi-Tenant Scalability</h4>
                <p className="text-harvest-muted font-light">Perfect for agencies managing dozens of clients and hundreds of billable hours.</p>
             </div>

             <div className="md:col-span-8 bg-slate-50 border border-harvest-border rounded-3xl p-10 flex items-center gap-10">
                <div className="flex-1">
                  <h4 className="text-2xl font-medium mb-3">Instant Reporting</h4>
                  <p className="text-harvest-muted font-light">Turn shared time logs into professional reports and invoices in a single click.</p>
                </div>
                <div className="hidden lg:flex flex-1 items-end justify-center h-full">
                   <div className="flex items-end gap-2 h-32">
                      <div className="w-4 bg-harvest-orange/20 h-[40%] rounded-t" />
                      <div className="w-4 bg-harvest-orange/40 h-[60%] rounded-t" />
                      <div className="w-4 bg-harvest-orange/60 h-[80%] rounded-t" />
                      <div className="w-4 bg-harvest-orange h-[100%] rounded-t" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Why Bloom Section */}
      <section id="why" className="py-32 bg-harvest-bg px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="flex-1">
              <h2 className="text-4xl lg:text-5xl font-light text-harvest-text mb-8 tracking-tight">Why Bloom?</h2>
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-white border border-harvest-border flex items-center justify-center shrink-0 shadow-sm">
                    <Zap className="w-6 h-6 text-harvest-orange" />
                  </div>
                  <div>
                    <h4 className="text-xl font-medium mb-2">Zero Friction Tracking</h4>
                    <p className="text-harvest-muted font-light leading-relaxed">Unlike complex ERP systems, Bloom is built for the individual. If it's hard to use, people won't use it. We made it invisible.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-white border border-harvest-border flex items-center justify-center shrink-0 shadow-sm">
                    <Brain className="w-6 h-6 text-harvest-orange" />
                  </div>
                  <div>
                    <h4 className="text-xl font-medium mb-2">Passive AI Intelligence</h4>
                    <p className="text-harvest-muted font-light leading-relaxed">Your data shouldn't just sit there. Bloom uses AI to look for patterns you missed, helping you price projects more accurately.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-white border border-harvest-border flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-6 h-6 text-harvest-orange" />
                  </div>
                  <div>
                    <h4 className="text-xl font-medium mb-2">Multi-Tenant by Default</h4>
                    <p className="text-harvest-muted font-light leading-relaxed">Built for agencies. Securely manage different clients and teams with granular permissions and isolated datasets.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full text-center lg:text-left">
              <div className="relative inline-block w-full">
                <div className="bg-harvest-dark h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl relative">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#f15a24,transparent)]" />
                  <div className="p-12 h-full flex flex-col justify-center">
                    <div className="text-white text-7xl font-extralight mb-6">98%</div>
                    <p className="text-white/60 text-2xl font-light max-w-sm">Reduction in "forgotten hours" for teams switching to Bloom's proactive reminders.</p>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 bg-white p-8 rounded-2xl shadow-xl border border-harvest-border hidden lg:block max-w-xs">
                  <div className="text-harvest-orange font-bold text-[10px] uppercase tracking-widest mb-3">Customer Result</div>
                  <div className="text-xl font-light leading-snug">"The best ROI of any tool we've integrated this year."</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-light text-harvest-text mb-4 tracking-tight">Simple, transparent pricing.</h2>
            <p className="text-lg text-harvest-muted font-light">Choose the plan that fits your growth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-white border border-harvest-border rounded-3xl p-10 flex flex-col hover:shadow-xl transition-shadow duration-500">
               <h4 className="text-xl font-medium mb-2">Starter</h4>
               <p className="text-harvest-muted text-sm font-light mb-8">For solo freelancers.</p>
               <div className="text-4xl font-light mb-8">$0<span className="text-lg text-harvest-muted">/mo</span></div>
               <ul className="space-y-4 text-sm font-light text-harvest-text mb-12 flex-1">
                 <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-3" /> Unlimited time tracking</li>
                 <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-3" /> Up to 2 clients</li>
                 <li className="flex items-center text-harvest-muted opacity-50"><X className="w-4 h-4 mr-3" /> AI Activity Insights</li>
                 <li className="flex items-center text-harvest-muted opacity-50"><X className="w-4 h-4 mr-3" /> Team collaboration</li>
               </ul>
               <Button variant="outline" className="w-full border-harvest-border hover:bg-slate-50 py-6 font-bold" onClick={onGetStarted}>Get Started</Button>
            </div>

            {/* Pro */}
            <div className="bg-harvest-dark text-white border border-harvest-dark rounded-3xl p-10 flex flex-col relative transform hover:scale-[1.02] transition-transform duration-500 shadow-2xl">
               <div className="absolute -top-4 right-10 bg-harvest-orange text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Recommended</div>
               <h4 className="text-xl font-medium mb-2">Pro</h4>
               <p className="text-white/60 text-sm font-light mb-8">For growing agencies.</p>
               <div className="text-4xl font-light mb-8">$15<span className="text-lg text-white/40">/mo</span></div>
               <ul className="space-y-4 text-sm font-light mb-12 flex-1">
                 <li className="flex items-center"><Check className="w-4 h-4 text-harvest-orange mr-3" /> Everything in Starter</li>
                 <li className="flex items-center"><Check className="w-4 h-4 text-harvest-orange mr-3" /> Unlimited clients</li>
                 <li className="flex items-center"><Check className="w-4 h-4 text-harvest-orange mr-3" /> AI Activity Insights</li>
                 <li className="flex items-center"><Check className="w-4 h-4 text-harvest-orange mr-3" /> Standard reporting</li>
               </ul>
               <Button className="w-full bg-harvest-orange hover:bg-harvest-orange-hover text-white py-6 border-none font-bold shadow-lg shadow-harvest-orange/20" onClick={onGetStarted}>Start 14-day Trial</Button>
            </div>

            {/* Enterprise */}
            <div className="bg-white border border-harvest-border rounded-3xl p-10 flex flex-col hover:shadow-xl transition-shadow duration-500">
               <h4 className="text-xl font-medium mb-2">Enterprise</h4>
               <p className="text-harvest-muted text-sm font-light mb-8">For large organizations.</p>
               <div className="text-4xl font-light mb-8">Custom</div>
               <ul className="space-y-4 text-sm font-light text-harvest-text mb-12 flex-1 pt-8">
                 <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-3" /> Everything in Pro</li>
                 <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-3" /> Multi-tenant administration</li>
                 <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-3" /> Custom AI training</li>
                 <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-3" /> 24/7 Priority support</li>
               </ul>
               <Button variant="outline" className="w-full border-harvest-border hover:bg-slate-50 py-6 font-bold" onClick={onGetStarted}>Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-harvest-bg border-y border-harvest-border">
         <div className="max-w-7xl mx-auto px-8 text-center">
            <span className="text-[10px] font-bold text-harvest-muted uppercase tracking-[0.2em] mb-12 block">Trusted by 5,000+ growing teams</span>
            <div className="flex flex-wrap justify-center items-center gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
               <span className="text-3xl font-bold font-serif italic tracking-tighter">Invision</span>
               <span className="text-3xl font-bold tracking-tight">BASECAMP</span>
               <span className="text-2xl font-bold uppercase tracking-[0.3em]">Buffer</span>
               <span className="text-3xl font-bold font-mono">/Stripe</span>
               <span className="text-2xl font-bold italic">Intercom</span>
            </div>
         </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-40 bg-white px-8">
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-extralight text-harvest-text mb-8 tracking-tighter">Ready to see your business in full bloom?</h2>
            <p className="text-xl text-harvest-muted mb-12 font-light">Join the agencies and freelancers who trust Bloom to keep them moving forward.</p>
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
               <Button 
                onClick={onGetStarted}
                className="bg-harvest-orange hover:bg-harvest-orange-hover text-white px-12 py-8 text-xl rounded-full font-bold shadow-2xl transition-all"
               >
                 Start Your Free Trial
               </Button>
               <Button variant="ghost" className="text-harvest-text hover:text-harvest-orange text-lg underline decoration-harvest-orange/30 decoration-2 underline-offset-8 font-medium">Talk to Sales</Button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-harvest-dark text-white/40 py-24 px-8 border-t border-white/5">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
               <div className="col-span-2">
                  <div className="flex items-center text-white mb-6">
                    <div className="w-8 h-8 bg-harvest-orange rounded flex items-center justify-center font-bold text-white mr-2">B</div>
                    <span className="text-xl font-bold tracking-tight">Bloom</span>
                  </div>
                  <p className="max-w-xs font-light text-sm leading-relaxed">The high-precision time tracking platform for professional service teams.</p>
               </div>
               <div>
                  <h5 className="text-white text-sm font-bold mb-6">Product</h5>
                  <ul className="space-y-4 text-sm font-light">
                    <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">AI Insights</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  </ul>
               </div>
               <div>
                  <h5 className="text-white text-sm font-bold mb-6">Support</h5>
                  <ul className="space-y-4 text-sm font-light">
                    <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Desktop App</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  </ul>
               </div>
               <div className="col-span-2">
                  <h5 className="text-white text-sm font-bold mb-6">Join our newsletter</h5>
                  <div className="flex gap-2">
                     <Input className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-harvest-orange" placeholder="you@company.com" />
                     <Button className="bg-harvest-orange hover:bg-harvest-orange-hover text-white font-bold">Join</Button>
                  </div>
               </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6 text-xs uppercase tracking-widest font-bold">
               <span>&copy; 2026 Bloom Time SaaS. All rights reserved.</span>
               <div className="flex space-x-8">
                  <a href="#" className="hover:text-white cursor-pointer">Twitter</a>
                  <a href="#" className="hover:text-white cursor-pointer">LinkedIn</a>
                  <a href="#" className="hover:text-white cursor-pointer">Instagram</a>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}

// --- Dashboard Component ---
function Dashboard() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'timesheet' | 'projects' | 'reports' | 'admin'>('timesheet');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'calendar'>('day');

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-[#2D2E33] font-sans">
      {/* Level 1: Sophisticated Dark Nav */}
      <nav className="bg-[#111827] text-white px-6 flex items-center justify-between z-50 h-[56px] shrink-0 border-b border-white/5">
        <div className="flex items-center h-full space-x-12">
           <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Bloom Time</span>
           </div>
           
           <div className="flex h-full items-center">
              <GlobalNavTab active={activeTab === 'timesheet'} onClick={() => setActiveTab('timesheet')} label="Time" />
              <GlobalNavTab active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} label="Projects" />
              <GlobalNavTab active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="Reports" />
              {user?.role === 'SUPER_ADMIN' && (
                <GlobalNavTab active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} label="Nexus" />
              )}
           </div>
        </div>
        
        <div className="flex items-center space-x-4">
           <button className="flex items-center space-x-2 text-white/50 hover:text-white/90 px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-medium transition-all hover:bg-white/5">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Updates</span>
           </button>
           
           <div className="flex items-center space-x-3 border-l border-white/10 pl-4 h-8">
              <div className="relative group">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold shadow-lg shadow-orange-500/20">
                  {user?.displayName?.[0] || user?.email[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111827]"></div>
              </div>
              <div className="flex flex-col -space-y-0.5">
                <span className="text-[12px] font-bold text-white/90 leading-tight">{user?.displayName || user?.email.split('@')[0]}</span>
                <span className="text-[10px] font-medium text-white/40">{user?.role?.replace('_', ' ') || 'Team Member'}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-red-400 ml-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
           </div>
        </div>
      </nav>

      {/* Level 2: Refined Sub-Navigation (if needed) */}
      {activeTab === 'timesheet' && (
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center justify-between h-[72px] shrink-0">
           <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                 <button className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 transition-all shadow-sm group">
                   <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                 </button>
                 <button className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 transition-all shadow-sm group">
                   <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                 </button>
              </div>
              
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-orange-500 uppercase tracking-widest leading-none mb-1">
                  {viewMode === 'day' ? 'Current Day' : 'Weekly View'}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {viewMode === 'day' ? format(new Date(), 'EEEE, d MMMM') : 'Monday 20 – Sunday 26 April'}
                </h2>
              </div>
           </div>

           <div className="flex items-center space-x-4">
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-orange-200 hover:text-orange-500 transition-all shadow-sm">
                <CalendarIcon className="w-4 h-4" />
              </button>
              
              <div className="bg-slate-200/50 p-1 rounded-xl flex space-x-1 border border-slate-200">
                <ModeToggle active={viewMode === 'day'} onClick={() => setViewMode('day')} label="Day" />
                <ModeToggle active={viewMode === 'week'} onClick={() => setViewMode('week')} label="Week" />
                <ModeToggle active={viewMode === 'calendar'} onClick={() => setViewMode('calendar')} label="Matrix" />
              </div>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-white p-6 lg:p-10">
        <div className="max-w-[1100px] mx-auto min-h-full flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'timesheet' && (
              <motion.div 
                key="timesheet-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                {viewMode === 'day' && <Timesheet />}
                {viewMode === 'week' && <WeeklyGrid />}
                {viewMode === 'calendar' && (
                  <div className="py-32 flex flex-col items-center justify-center text-slate-300 space-y-4">
                     <CalendarIcon className="w-20 h-20 opacity-20" />
                     <p className="font-medium text-lg">Calendar visualization coming soon.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'projects' && (
               <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                 <ProjectDashboard />
               </motion.div>
            )}
            
            {activeTab === 'reports' && (
              <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <Reports />
              </motion.div>
            )}
            {activeTab === 'admin' && (
              <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <SuperAdminDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Super Admin Dashboard ---
function SuperAdminDashboard() {
  const { setUser } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState<'overview' | 'tenants' | 'system'>('overview');

  const fetchAdminData = useCallback(async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        api.admin.stats(),
        api.admin.users()
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err: any) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        toast.error(`Nexus Session: ${err.message || 'Unauthorized Access'}`);
        setUser(null);
      } else {
        toast.error("Nexus Cloud: Operations link interrupted");
      }
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleUpdateTenant = async (id: string, plan: string, status: string) => {
    try {
      await api.admin.updateTenant(id, { plan, status });
      toast.success("Tenant updated successfully");
      fetchAdminData();
    } catch (err) {
      toast.error("Failed to update tenant");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
      <div className="w-12 h-12 border-4 border-harvest-orange/20 border-t-harvest-orange rounded-full animate-spin" />
      <p className="text-harvest-muted font-mono text-[10px] uppercase tracking-widest">Connect to Nexus Console...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-harvest-border pb-10">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-slate-900 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-medium text-slate-900 tracking-tight">Nexus Control</h1>
          </div>
          <p className="text-slate-500 font-light max-w-md">Global Multi-tenant Management & Platform Operations Console.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {(['overview', 'tenants', 'system'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setAdminTab(tab)}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                adminTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {adminTab === 'overview' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <AdminMetricCard label="Active Tenants" value={stats?.activeTenants || 0} icon={Users} trend="+12% vs last week" />
            <AdminMetricCard label="Today's Onboarding" value={stats?.dailyNewUsers || 0} icon={Zap} color="text-harvest-orange" />
            <AdminMetricCard label="Global Output" value={`${stats?.totalHours || 0}h`} icon={Clock} />
            <AdminMetricCard label="System Health" value={stats?.systemStatus || "Healthy"} icon={Activity} color="text-green-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card className="border-harvest-border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Infrastructure Pulse</CardTitle>
                <CardDescription>Live telemetry from global server instances.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <HealthIndicator label="Database Nexus" status="operational" latency="24ms" />
                <HealthIndicator label="AI Inference Engine" status="operational" latency="1.2s" />
                <HealthIndicator label="Static Asset CDN" status="operational" latency="8ms" />
                <HealthIndicator label="Authentication Edge" status="operational" latency="12ms" />
              </CardContent>
            </Card>

            <Card className="border-harvest-border shadow-md bg-slate-900 text-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Platform Growth</CardTitle>
                <CardDescription className="text-slate-400">Aggregated tenant registration trends.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700/50">
                   <TrendingUp className="w-8 h-8 text-slate-600 animate-pulse" />
                   <span className="ml-3 text-slate-500 font-mono text-xs uppercase tracking-widest">Generating Real-time Visuals...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {adminTab === 'tenants' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-harvest-border shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-harvest-border">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Input placeholder="Search tenants by email or ID..." className="pl-10 h-10 bg-white" />
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <div className="flex items-center space-x-3">
                   <Button variant="outline" size="sm" className="font-bold text-[10px] uppercase tracking-widest">Filter</Button>
                   <Button variant="outline" size="sm" className="font-bold text-[10px] uppercase tracking-widest">Export</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-harvest-border">
                    <tr className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                      <th className="px-10 py-5 text-left">Organization / Tenant</th>
                      <th className="px-8 py-5 text-left">Subscription</th>
                      <th className="px-8 py-5 text-left">Usage Registry</th>
                      <th className="px-8 py-5 text-left">Onboarding</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-harvest-border">
                    {users.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xs ring-4 ring-slate-50">
                              {tenant.displayName?.[0] || tenant.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{tenant.displayName || 'Unnamed Org'}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{tenant.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col space-y-1.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                                tenant.role === 'SUPER_ADMIN' ? 'bg-slate-900 text-white' : 
                                tenant.plan === 'PRO' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {tenant.role === 'SUPER_ADMIN' ? 'ROOT_SYSTEM' : (tenant.plan || 'FREE')}
                              </span>
                              <span className={`text-[10px] font-medium flex items-center ${tenant.status === 'SUSPENDED' ? 'text-red-500' : 'text-green-500'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${tenant.status === 'SUSPENDED' ? 'bg-red-500' : 'bg-green-500'}`} />
                                {tenant.status || 'ACTIVE'}
                              </span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex space-x-6 text-[11px] font-medium">
                            <div className="flex flex-col">
                              <span className="text-slate-400 uppercase text-[9px] tracking-wider mb-1">Projects</span>
                              <span className="text-slate-900">{(tenant as any)._count?.projects || 0}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-slate-400 uppercase text-[9px] tracking-wider mb-1">Items</span>
                              <span className="text-slate-900">{(tenant as any)._count?.timeEntries || 0}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-[11px] text-slate-500">
                           {format(new Date(tenant.createdAt || new Date()), "MMM d, yyyy")}
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleUpdateTenant(tenant.id, tenant.plan === 'PRO' ? 'FREE' : 'PRO', tenant.status || 'ACTIVE')}
                                className="text-[10px] font-bold uppercase tracking-widest text-indigo-600"
                              >
                                Toggle Plan
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleUpdateTenant(tenant.id, tenant.plan || 'FREE', tenant.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED')}
                                className={`text-[10px] font-bold uppercase tracking-widest ${tenant.status === 'SUSPENDED' ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {tenant.status === 'SUSPENDED' ? 'Reinstate' : 'Suspend'}
                              </Button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {adminTab === 'system' && (
         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="border-harvest-border shadow-md">
                   <CardHeader>
                      <CardTitle className="text-lg">Nexus Security Logs</CardTitle>
                      <CardDescription>Recent administrative activities on the platform.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <LogItem user="Nexus-Bot" action="Scheduled DB Cleanup" time="2 hours ago" />
                      <LogItem user="jaimecao2023@gmail.com" action="Updated Tenant Plan: Org-882" time="4 hours ago" />
                      <LogItem user="Nexus-Bot" action="Blocked IP Alert: 192.168.1.1" time="1 day ago" />
                   </CardContent>
               </Card>

               <Card className="border-harvest-border shadow-md bg-amber-50">
                   <CardHeader>
                      <CardTitle className="text-lg text-amber-900">Maintenance Console</CardTitle>
                      <CardDescription className="text-amber-700">Global settings and intervention tools.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-200">
                         <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-amber-900">Maintenance Mode</p>
                            <p className="text-[10px] text-amber-700">Prevent all non-admin logins.</p>
                         </div>
                         <div className="w-10 h-5 bg-slate-200 rounded-full" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-200">
                         <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-amber-900">Registrations</p>
                            <p className="text-[10px] text-amber-700">Toggle public signup availability.</p>
                         </div>
                         <div className="w-10 h-5 bg-harvest-orange rounded-full relative">
                            <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1" />
                         </div>
                      </div>
                   </CardContent>
               </Card>
            </div>
         </div>
      )}
    </div>
  );
}

function AdminMetricCard({ label, value, icon: Icon, trend, color = "text-slate-900" }: { label: string, value: any, icon: any, trend?: string, color?: string }) {
  return (
    <Card className="border-harvest-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
           <div className={`p-2 rounded-lg bg-slate-50 ${color}`}>
              <Icon className="w-4 h-4" />
           </div>
           {trend && <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{trend}</span>}
        </div>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

function HealthIndicator({ label, status, latency }: { label: string, status: string, latency: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-center space-x-3">
         <div className="w-2 h-2 rounded-full bg-green-500" />
         <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <div className="flex items-center space-x-4">
         <span className="text-[10px] font-mono text-slate-400">{latency}</span>
         <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">{status}</span>
      </div>
    </div>
  );
}

function LogItem({ user, action, time }: { user: string, action: string, time: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-100">
       <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-900">{action}</p>
          <p className="text-[10px] text-slate-500">{user}</p>
       </div>
       <span className="text-[10px] font-medium text-slate-400">{time}</span>
    </div>
  );
}

function NavTab({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) {
  return (
    <button
      onClick={onClick}
      className={`h-full px-10 flex items-center space-x-3 transition-all relative group ${
        active ? 'text-white' : 'text-white/40 hover:text-white/70'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-[#F15A24]' : 'text-white/20'} transition-colors`} />
      <span className="text-sm font-semibold tracking-tight">{label}</span>
      {active && (
        <motion.div 
          layoutId="activeTabUnderline"
          className="absolute bottom-0 left-0 right-0 h-1 bg-[#F15A24] shadow-[0_-4px_12px_rgba(241,90,36,0.3)]"
        />
      )}
    </button>
  );
}

function LoadingSkeleton() {
  return (
     <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-[#F15A24] rounded-full animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Inventory Sync...</span>
     </div>
  );
}

function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjectData = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([api.projects.list(), api.clients.list()]);
      setProjects(p);
      setClients(c);
    } catch (err) {
      toast.error("Resource link interrupted");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-4xl font-light text-slate-900 tracking-tight">Portfolio</h1>
           <p className="text-slate-400 font-light text-lg">Performance indicators and budget utilization.</p>
        </div>
        <Button className="bg-[#F15A24] hover:bg-[#D9481B] text-white px-8 py-6 rounded-2xl shadow-lg shadow-orange-500/10 font-bold transition-all hover:scale-105 active:scale-95">
           + New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} clients={clients} />
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-32 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 space-y-4">
             <div className="p-4 bg-slate-50 rounded-2xl">
                <Plus className="w-8 h-8" />
             </div>
             <p className="text-sm font-medium">No projects in your current orbit.</p>
             <Button variant="outline" className="border-slate-200 rounded-xl">Launch First Project</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, clients }: { project: Project, clients: Client[] }) {
  const client = clients.find(c => c.id === project.clientId);
  const budget = project.budget || 100;
  const used = Math.random() * 80; 
  const percentage = Math.min(100, (used / budget) * 100);

  return (
    <Card className="border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[2.5rem] overflow-hidden group bg-white border border-slate-100/50">
      <div className="h-2.5 w-full" style={{ backgroundColor: project.color }} />
      <CardHeader className="p-10 pb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
             <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#F15A24] mb-2">{client?.name || 'ROOT'}</p>
             <CardTitle className="text-2xl font-bold tracking-tight text-slate-800 group-hover:text-[#F15A24] transition-colors">{project.name}</CardTitle>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-orange-50 transition-colors">
             <FolderKanban className="w-5 h-5 text-slate-400 group-hover:text-[#F15A24]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-10 pt-0 space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <span>Utilization Pulse</span>
            <span className={percentage > 85 ? 'text-red-500' : 'text-slate-800'}>{Math.round(percentage)}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100/80 rounded-full overflow-hidden">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${percentage > 85 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-[#F15A24] shadow-[0_0_12px_rgba(241,90,36,0.3)]'}`}
             />
          </div>
          <div className="flex justify-between items-center pt-2">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Burned</span>
                <span className="text-sm font-semibold text-slate-800">{Math.round(used)}<span className="text-xs font-normal text-slate-400 ml-1">hrs</span></span>
             </div>
             <div className="h-6 w-px bg-slate-100" />
             <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Ceiling</span>
                <span className="text-sm font-semibold text-slate-400">{budget}<span className="text-xs font-normal ml-1">hrs</span></span>
             </div>
          </div>
        </div>
        
        <div className="pt-6 flex items-center justify-between border-t border-slate-50 gap-4">
            <div className="flex -space-x-3">
               {[1, 2].map(i => (
                 <div key={i} className="w-9 h-9 rounded-full bg-slate-900 border-[3px] border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                   {i === 1 ? 'JD' : 'MK'}
                 </div>
               ))}
               <div className="w-9 h-9 rounded-full bg-slate-100 border-[3px] border-white flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm">+4</div>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 hover:text-slate-900 flex items-center transition-colors">
               Metrics <ChevronRight className="w-3 h-3 ml-2" />
            </button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Login Component ---
function Login({ onBack }: { onBack?: () => void }) {
  const { setUser } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        if (!name) throw new Error("Name is required");
        const user = await api.auth.register({ email, password, name });
        setUser(user);
        toast.success("Welcome to Bloom Time!");
      } else {
        const user = await api.auth.login({ email, password });
        setUser(user);
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-harvest-bg font-sans">
      <div className="max-w-md w-full px-10 py-12 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-harvest-border relative">
        {onBack && (
          <button onClick={onBack} className="absolute top-6 left-6 p-2 text-harvest-muted hover:text-harvest-orange transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-harvest-orange rounded-xl flex items-center justify-center font-bold text-white text-3xl mx-auto mb-6 shadow-lg shadow-harvest-orange/20">B</div>
          <h2 className="text-2xl font-semibold tracking-tight text-harvest-text mb-2">
            {isRegistering ? "Create your account" : "Sign in to Bloom Time"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {isRegistering && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-harvest-muted uppercase tracking-widest pl-1">Full Name</label>
              <Input placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} required className="h-12 border-harvest-border" />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-harvest-muted uppercase tracking-widest pl-1">Email Address</label>
            <Input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 border-harvest-border" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-harvest-muted uppercase tracking-widest pl-1">Password</label>
            <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="h-12 border-harvest-border" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 bg-harvest-dark hover:bg-black text-white font-bold transition-all shadow-lg">
            {loading ? "Please wait..." : (isRegistering ? "Create Account" : "Sign In")}
          </Button>
        </form>

        <div className="mt-10 text-center text-sm font-light text-harvest-muted">
          {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-harvest-orange font-bold hover:underline">
            {isRegistering ? "Sign In" : "Get started for free"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Timesheet Component ---
function Timesheet() {
  const { user, setUser } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newProjectId, setNewProjectId] = useState("");

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      const [entryData, projectData] = await Promise.all([
        api.timeEntries.list(),
        api.projects.list()
      ]);
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      setEntries(entryData.filter(e => e.date === dateStr));
      setProjects(projectData);
    } catch (err: any) {
      console.error("Refresh failed", err);
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Session expired. Please sign in again.");
        setUser(null);
      }
    }
  }, [user, selectedDate, setUser]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addEntry = async (startRunning = false) => {
    if (!newProjectId) {
      toast.error("Please select a project");
      return;
    }
    try {
      await api.timeEntries.create({
        projectId: newProjectId,
        notes: newDesc || "(No description)",
        duration: 0,
        date: format(selectedDate, "yyyy-MM-dd"),
        isRunning: startRunning
      });
      setNewDesc("");
      toast.success("Entry added");
      refreshData();
    } catch (e) {
      toast.error("Failed to add entry");
    }
  };

  const toggleTimer = async (entry: TimeEntry) => {
    try {
      if (entry.isRunning) {
        const start = new Date(entry.startTime);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
        await api.timeEntries.update(entry.id, {
          isRunning: false,
          duration: (entry.duration || 0) + elapsed
        });
      } else {
        await api.timeEntries.update(entry.id, {
          isRunning: true,
          startTime: new Date()
        });
      }
      refreshData();
    } catch (e) {
      toast.error("Failed to toggle timer");
    }
  };

  const handleSummarize = async () => {
    if (entries.length === 0) return;
    setIsSummarizing(true);
    try {
      const { insights } = await api.ai.insights(entries);
      setAiSummary(insights);
    } catch (err) {
      toast.error("AI Insights failed");
    } finally {
      setIsSummarizing(false);
    }
  };

  const dayTotalSeconds = entries.reduce((acc, curr) => acc + curr.duration, 0);
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Date & Week Control - Modern Pill Style */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center space-x-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {weekDays.map(day => {
            const isActive = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            return (
              <button 
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "flex flex-col items-center justify-center w-12 h-14 rounded-xl transition-all relative",
                  isActive ? "bg-[#111827] text-white shadow-lg scale-105" : "hover:bg-slate-50 text-slate-500"
                )}
              >
                <span className="text-[9px] font-bold uppercase tracking-tighter opacity-60">{format(day, 'EEE')}</span>
                <span className="text-[15px] font-bold tabular-nums">{format(day, 'd')}</span>
                {isToday && !isActive && (
                  <div className="absolute bottom-1 w-1 h-1 bg-orange-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Today</span>
          <span className="text-3xl font-light tracking-tighter text-slate-900 border-l border-slate-200 pl-4">
            {formatTime(dayTotalSeconds)}
          </span>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
         {/* Action Bar */}
         <div className="flex items-center justify-between">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
                <Plus className="w-5 h-5" strokeWidth={3} />
                <span className="text-sm">Track New Entry</span>
            </button>
            
            <button 
              onClick={handleSummarize}
              disabled={isSummarizing || entries.length === 0}
              className="group flex items-center space-x-2 px-4 py-2 text-slate-400 hover:text-orange-500 transition-colors disabled:opacity-30"
            >
              <Activity className={cn("w-4 h-4", isSummarizing && "animate-pulse")} />
              <span className="text-[12px] font-bold uppercase tracking-widest">AI Insights</span>
            </button>
         </div>

         {/* Entry Feed */}
         <div className="min-h-[400px]">
            {entries.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-20 py-32 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center border border-slate-100 mb-8 animate-bounce transition-all duration-3000">
                    <Clock className="w-10 h-10 text-orange-500" strokeWidth={1} />
                  </div>
                  <blockquote className="max-w-md text-center">
                    <p className="text-xl font-light text-slate-500 italic mb-4">
                      “{QUOTES[Math.floor(selectedDate.getTime() / 1000) % QUOTES.length].text}”
                    </p>
                    <cite className="text-[10px] font-bold uppercase tracking-widest text-slate-400 not-italic">
                      — {QUOTES[Math.floor(selectedDate.getTime() / 1000) % QUOTES.length].author}
                    </cite>
                  </blockquote>
               </div>
            ) : (
               <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
                     <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{entries.length} Sessions Logged</span>
                     <span className="text-[11px] font-bold text-slate-400">Total: <span className="text-slate-900 font-bold ml-2">{formatTime(dayTotalSeconds)}</span></span>
                  </div>
                  {entries.map(entry => (
                     <EntryRow 
                        key={entry.id} 
                        entry={entry} 
                        project={projects.find(p => p.id === entry.projectId)}
                        onToggle={() => toggleTimer(entry)}
                        onDelete={async () => { if(confirm('Delete?')) { await api.timeEntries.delete(entry.id); refreshData(); }}}
                     />
                  ))}
               </div>
            )}
         </div>
      </div>

      {/* Modern Compact Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="p-0 border-none rounded-3xl overflow-hidden shadow-2xl max-w-[540px]">
          <div className="bg-[#F15A24] text-white px-8 py-5 flex items-center justify-between">
             <h3 className="text-lg font-bold">New Entry</h3>
             <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{format(selectedDate, 'd MMM yyyy')}</span>
          </div>
          <div className="p-10 bg-white space-y-8">
             <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Client / Project</label>
                    <Select onValueChange={setNewProjectId} value={newProjectId}>
                        <SelectTrigger className="w-full h-14 bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F15A24] text-base font-medium">
                            <SelectValue placeholder="Which project are you working on?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            {projects.map(p => (
                                <SelectItem key={p.id} value={p.id} className="py-3 focus:bg-orange-50 focus:text-[#F15A24] cursor-pointer rounded-lg">{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Notes</label>
                    <textarea 
                        className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-5 text-base focus:ring-1 focus:ring-[#F15A24] focus:outline-none resize-none transition-all placeholder:text-slate-300"
                        placeholder="What's happening?"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-between pt-4 gap-8">
                    <div className="flex-1 flex gap-4">
                        <button 
                            onClick={() => addEntry(true)}
                            className="flex-1 h-16 bg-[#3B863E] hover:bg-[#2F6B32] text-white rounded-2xl font-bold flex items-center justify-center space-x-3 shadow-xl transition-all active:scale-95"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            <span>Start Timer</span>
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="px-8 h-16 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                        >
                           Cancel
                        </button>
                    </div>
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EntryRow({ entry, project, onToggle, onDelete }: { entry: TimeEntry, project?: Project, onToggle: () => void, onDelete: () => void }) {
  const [time, setTime] = useState(entry.duration);

  useEffect(() => {
    let interval: any;
    if (entry.isRunning) {
      interval = setInterval(() => {
        const start = new Date(entry.startTime);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
        setTime(entry.duration + elapsed);
      }, 1000);
    } else {
      setTime(entry.duration);
    }
    return () => clearInterval(interval);
  }, [entry]);

  const formatHMM = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`bg-white border rounded-[1.25rem] p-5 shadow-sm transition-all group ${entry.isRunning ? 'border-[#F15A24] ring-1 ring-orange-100 bg-orange-50/10' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center space-x-3 mb-1.5">
             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project?.color || "#e2e8f0" }} />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{project?.name || "Internal Activity"}</span>
          </div>
          <div className="text-[17px] font-medium text-slate-800 leading-tight">{entry.notes || "(No description)"}</div>
        </div>
        
        <div className="flex items-center space-x-12">
            <div className={`text-4xl tabular-nums font-mono tracking-tighter ${entry.isRunning ? 'text-[#F15A24] font-bold' : 'text-slate-800'}`}>
                {formatHMM(time)}
            </div>
            
            <div className="flex items-center space-x-3">
                <button 
                  onClick={onToggle}
                  className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center transition-all ${
                    entry.isRunning 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
                        : 'bg-slate-100 text-slate-700 hover:bg-[#3B863E] hover:text-white hover:shadow-lg hover:shadow-green-100'
                  }`}
                >
                    {entry.isRunning ? <Square className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                </button>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button onClick={onDelete} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

// --- Projects Component ---
function Projects() {
  const { user, setUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const [ps, cs] = await Promise.all([api.projects.list(), api.clients.list()]);
      setProjects(ps);
      setClients(cs);
      if (cs.length > 0 && !selectedClientId) setSelectedClientId(cs[0].id);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
      }
    }
  }, [user, selectedClientId, setUser]);

  useEffect(() => { refresh(); }, [refresh]);

  const addClient = async () => {
    const name = prompt("Client Name:");
    if (!name) return;
    await api.clients.create(name);
    refresh();
  };

  const createProject = async () => {
    if (!newName || !selectedClientId) return;
    await api.projects.create({
      name: newName,
      clientId: selectedClientId,
      color: `hsla(${Math.random() * 360}, 70%, 50%, 1)`
    });
    setNewName("");
    toast.success("Project created");
    refresh();
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between border-b border-harvest-border pb-8">
        <div>
          <h2 className="text-3xl font-light text-harvest-text">Projects & Clients</h2>
          <p className="text-harvest-muted text-sm mt-1">Manage your workforce targets and client billing.</p>
        </div>
        <Button onClick={addClient} variant="outline" className="gap-2 px-6 py-5 border-harvest-border">
          <Users className="w-4 h-4" />
          New Client
        </Button>
      </div>

      <div className="bg-white border border-harvest-border rounded-xl p-8 shadow-sm">
        <div className="text-[10px] font-bold text-harvest-orange uppercase tracking-widest mb-6">Quick Create Project</div>
        <div className="flex gap-6">
          <Input placeholder="e.g. Website Redesign" value={newName} onChange={e => setNewName(e.target.value)} className="h-12 flex-1" />
          <div className="w-72">
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="h-12"><SelectValue placeholder="Select Client" /></SelectTrigger>
              <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={createProject} className="h-12 px-8 bg-harvest-orange hover:bg-harvest-orange-hover">Create</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map(p => (
          <div key={p.id} className="bg-white border border-harvest-border rounded-xl overflow-hidden group shadow-sm">
            <div className="h-1.5 w-full" style={{ backgroundColor: p.color }} />
            <div className="p-6">
              <div className="text-[10px] font-bold text-harvest-muted uppercase tracking-wider mb-1">{clients.find(c => c.id === p.clientId)?.name || "Internal"}</div>
              <h3 className="text-xl font-semibold mb-4 group-hover:text-harvest-orange transition-colors">{p.name}</h3>
              <div className="flex items-center justify-between border-t border-slate-50 pt-4"><span className="text-xs text-slate-500">Active</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Reports Component ---
function Reports() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    api.timeEntries.list().then(entries => {
      const grouped: { [key: string]: number } = {};
      entries.forEach(e => {
        grouped[e.date] = (grouped[e.date] || 0) + (e.duration / 3600);
      });
      setData(Object.keys(grouped).sort().map(date => ({ date, hours: parseFloat(grouped[date].toFixed(2)) })));
    }).catch(err => {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
      }
    });
  }, [user, setUser]);

  const totalHours = data.reduce((a, b) => a + b.hours, 0);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between border-b border-harvest-border pb-8">
        <div>
          <h2 className="text-3xl font-light text-harvest-text">Reports</h2>
          <p className="text-harvest-muted text-sm mt-1">Visualize your output trends.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-harvest-border rounded-xl p-8 shadow-sm">
          <div className="text-[10px] font-bold text-harvest-muted uppercase tracking-widest mb-4">Total Logged</div>
          <div className="text-4xl font-extralight">{totalHours.toFixed(1)}h</div>
        </div>
      </div>

      <div className="bg-white border border-harvest-border rounded-xl p-10 shadow-sm h-[500px]">
        <h3 className="text-lg font-semibold mb-12">Activity Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
            <Bar dataKey="hours" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Weekly Grid Matrix Component ---
function WeeklyGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    const load = async () => {
      const [ps, es] = await Promise.all([api.projects.list(), api.timeEntries.list()]);
      setProjects(ps);
      setEntries(es);
    };
    load();
  }, []);

  const getDayTotal = (day: Date) => {
    const ds = format(day, 'yyyy-MM-dd');
    const dayEntries = entries.filter(e => e.date === ds);
    const secs = dayEntries.reduce((acc, curr) => acc + curr.duration, 0);
    return formatHours(secs);
  };

  function formatHours(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h === 0 && m === 0) return "0:00";
    return `${h}:${m.toString().padStart(2, "0")}`;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[300px]">Project / Task</th>
            {weekDays.map(day => (
              <th key={day.toISOString()} className="px-4 py-4 text-center border-l border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{format(day, 'EEE')}</div>
                <div className="text-sm font-bold text-slate-600">{format(day, 'd')}</div>
              </th>
            ))}
            <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[100px] border-l border-slate-100">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {projects.length === 0 ? (
            <tr><td colSpan={9} className="py-20 text-center text-slate-400 font-light italic">No active projects found.</td></tr>
          ) : (
            projects.map(p => {
                const projectWeekEntries = entries.filter(e => e.projectId === p.id && isSameDay(startOfWeek(new Date(e.date), {weekStartsOn: 1}), weekStart));
                const projectTotal = projectWeekEntries.reduce((acc, curr) => acc + curr.duration, 0);
                
                return (
                    <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Activity</span>
                        </div>
                        <div className="text-sm font-bold text-slate-800">{p.name}</div>
                      </td>
                      {weekDays.map(day => {
                        const ds = format(day, 'yyyy-MM-dd');
                        const daySecs = entries.filter(e => e.projectId === p.id && e.date === ds).reduce((acc, curr) => acc + curr.duration, 0);
                        return (
                            <td key={day.toISOString()} className="px-2 py-3 border-l border-slate-100">
                               <input 
                                type="text" 
                                className="w-full h-10 text-center text-[13px] font-medium border-transparent hover:border-slate-200 focus:border-[#F15A24] focus:ring-1 focus:ring-[#F15A24]/10 rounded transition-all bg-transparent focus:bg-white"
                                placeholder="0:00"
                                value={formatHours(daySecs)}
                                readOnly
                               />
                            </td>
                        );
                      })}
                      <td className="px-6 py-4 text-right font-bold text-slate-800 tabular-nums border-l border-slate-100 opacity-60">
                        {formatHours(projectTotal)}
                      </td>
                    </tr>
                );
            })
          )}
        </tbody>
        <tfoot className="bg-slate-50/50">
          <tr>
            <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans">Totals</td>
            {weekDays.map(day => (
              <td key={day.toISOString()} className="px-4 py-4 text-center font-bold text-slate-900 border-l border-slate-100">
                {getDayTotal(day)}
              </td>
            ))}
            <td className="px-6 py-4 text-right font-bold text-slate-900 border-l border-slate-100 italic">Week Total</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// --- Global Timer Persistent Bar ---
function GlobalTimerBar() {
  return (
    <div className="h-1 bg-slate-100 w-full relative overflow-hidden shrink-0">
        <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-[#F15A24] to-transparent opacity-40"
        />
    </div>
  );
}

function GlobalNavTab({ active, onClick, label }: { active: boolean, onClick?: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-full px-6 text-[13px] font-bold transition-all relative flex items-center group",
        active ? "text-white" : "text-white/40 hover:text-white/80"
      )}
    >
      {label}
      {active && (
        <motion.div 
          layoutId="navTabLine"
          className="absolute bottom-0 left-2 right-2 h-[2px] bg-orange-500 rounded-t-full shadow-[0_-2px_10px_rgba(249,115,22,0.6)]"
        />
      )}
    </button>
  );
}

function ModeToggle({ active, onClick, label, hasBadge }: { active: boolean, onClick: () => void, label: string, hasBadge?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-5 py-1.5 rounded-lg text-[12px] font-bold transition-all relative",
        active 
          ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" 
          : "text-slate-500 hover:text-slate-700"
      )}
    >
      {label}
      {hasBadge && (
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
        </span>
      )}
    </button>
  );
}
