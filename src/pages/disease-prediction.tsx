import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useToast } from "../components/ui/toast";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  History,
  Zap,
  Image,
  AlertCircle,
  ExternalLink,
  Play,
  Crown,
  ShieldCheck,
  Activity,
  ChevronRight,
  Cpu,
  Cloud
} from "lucide-react";
import { Button } from "../components/ui/button";
import PredictionHistory from "../components/PredictionHistory";
import { DiseasePredictionForm } from "../components/DiseasePredictionForm";
import { DiseasePredictionDemo } from "../components/DiseasePredictionDemo";
import SubscriptionGuard from "../components/SubscriptionGuard";

export default function DiseasePredictionPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { checkLimit, planLimits, getUpgradeMessage } = useSubscription();
  const [activeTab, setActiveTab] = useState("predict");
  const [useLocalAPI, setUseLocalAPI] = useState(true);
  const [monthlyPredictions, setMonthlyPredictions] = useState(0);
  const STREAMLIT_APP_URL = 'https://poultrydisease.streamlit.app/';

  const fetchMonthlyPredictions = useCallback(async () => {
    if (!user) return;
    try {
      const stored = localStorage.getItem('disease_predictions');
      const predictions = stored ? JSON.parse(stored) : [];
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthly = predictions.filter((p: any) => {
        const predDate = new Date(p.created_at);
        return predDate >= firstDayOfMonth;
      });
      setMonthlyPredictions(monthly.length);
    } catch (error) {
      console.error('Error fetching monthly predictions:', error);
      setMonthlyPredictions(0);
    }
  }, [user]);

  useEffect(() => {
    document.title = t('diseasePrediction.title') + " | FugajiSmart Poultry Hub";
    fetchMonthlyPredictions();
  }, [t, fetchMonthlyPredictions]);

  const canMakePrediction = () => {
    return checkLimit('maxPredictions', monthlyPredictions);
  };

  const { toast } = useToast();

  const handleOpenPredictionTool = () => {
    if (!canMakePrediction()) {
      toast({
        title: getUpgradeMessage('disease predictions'),
        variant: 'destructive'
      });
      return;
    }
    window.open(STREAMLIT_APP_URL, '_blank', 'noopener,noreferrer');
  };

  const handlePredictionComplete = (result: any) => {
    console.log('Prediction completed:', result);
    fetchMonthlyPredictions();
  };

  return (
    <SubscriptionGuard feature="Disease Prediction" planRequired="BASIC">
      <div className="space-y-12 pb-20 max-w-5xl mx-auto">
        {/* Dynamic Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] animate-bounce">
            <Zap className="w-3.5 h-3.5 fill-current" />
            AI Health Diagnostics Active
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            {t('diseasePrediction.title')}
          </h1>
          <p className="text-gray-500 font-bold text-lg max-w-2xl mx-auto">
            {t('diseasePrediction.subtitle')}
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center mb-10">
            <TabsList className="bg-white/70 backdrop-blur-xl border border-gray-100 p-2 rounded-[2rem] shadow-xl shadow-gray-200/40 h-auto gap-2">
              <TabsTrigger value="predict" className="flex items-center gap-3 px-8 py-4 rounded-[1.5rem] data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                <Cpu className="h-4 w-4" />
                {t('diseasePrediction.predict')}
              </TabsTrigger>
              <TabsTrigger value="demo" className="flex items-center gap-3 px-8 py-4 rounded-[1.5rem] data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                <Play className="h-4 w-4" />
                {t('diseasePrediction.demo')}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-3 px-8 py-4 rounded-[1.5rem] data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                <History className="h-4 w-4" />
                {t('diseasePrediction.history')}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="predict" className="space-y-10 animate-[fadeIn_0.5s_ease-out] outline-none">
            {/* Usage Intelligence Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-800 border-none rounded-[40px] shadow-2xl shadow-blue-200 p-10 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 -mr-16 -mt-16 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
              <CardContent className="p-0 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-white/20 backdrop-blur-md rounded-3xl ring-8 ring-white/5">
                      <Crown className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">{t('diseasePrediction.monthlyPredictions')}</h3>
                      <p className="text-blue-100 font-medium text-lg mt-1">
                        Deployment cycle: <span className="font-black text-white">{monthlyPredictions}</span> of <span className="font-black text-white">{planLimits.maxPredictions === -1 ? 'Unlimited' : planLimits.maxPredictions}</span>
                      </p>
                    </div>
                  </div>
                  {!canMakePrediction() && (
                    <Button
                      onClick={() => window.location.href = '/farmer/subscription'}
                      className="bg-white text-blue-600 hover:bg-blue-50 py-7 px-10 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl group/btn"
                    >
                      Maximize Capacity
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  )}
                  {canMakePrediction() && (
                    <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/20 backdrop-blur-md rounded-3xl border border-emerald-400/30">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Status: Ready</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Strategy Selection */}
            <div className="flex justify-center">
              <div className="inline-flex items-center p-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                <button
                  onClick={() => setUseLocalAPI(true)}
                  className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${useLocalAPI
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-50'
                    }`}
                >
                  <Cpu className="w-4 h-4" />
                  Neural Engine
                </button>
                <button
                  onClick={() => setUseLocalAPI(false)}
                  className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${!useLocalAPI
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-50'
                    }`}
                >
                  <Cloud className="w-4 h-4" />
                  Cloud AI Tool
                </button>
              </div>
            </div>

            {useLocalAPI ? (
              <DiseasePredictionForm onPredictionComplete={handlePredictionComplete} />
            ) : (
              <Card className="bg-white border border-gray-100 rounded-[40px] shadow-2xl shadow-gray-200/40 p-12 overflow-hidden relative">
                <div className="flex flex-col items-center justify-center text-center space-y-10 group">
                  <div className="relative">
                    <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ring-8 ring-indigo-50/50">
                      <Cloud className="w-12 h-12" />
                    </div>
                    <Zap className="absolute -bottom-2 -right-2 w-8 h-8 text-amber-500 fill-current bg-white rounded-full p-1.5 shadow-md" />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">High-Fidelity Cloud Tool</h2>
                    <p className="text-gray-500 font-bold max-w-2xl mx-auto leading-relaxed">
                      Access our specialized Streamlit-based diagnostic engine for advanced imagery analysis and deep-tissue health verification.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl">
                    {[
                      { step: '01', label: 'Launch Module', desc: 'Secure cloud instance deployment' },
                      { step: '02', label: 'Image Biometry', desc: 'High-res sample transmission' },
                      { step: '03', label: 'Neural Insights', desc: 'Deep-learning based results' }
                    ].map((item, i) => (
                      <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-indigo-50 transition-colors">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{item.step}</span>
                        <h4 className="text-sm font-black text-gray-900 mt-2 uppercase">{item.label}</h4>
                        <p className="text-[10px] font-bold text-gray-400 mt-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="w-full max-w-md pt-4">
                    <Button
                      onClick={handleOpenPredictionTool}
                      size="lg"
                      className="w-full flex items-center justify-center gap-4 py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 group/launch"
                    >
                      <ExternalLink className="h-5 w-5 group-hover/launch:rotate-45 transition-transform" />
                      Open Cloud Diagnostic module
                    </Button>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4 text-left max-w-2xl">
                    <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Environmental Note</p>
                      <p className="text-sm font-bold text-amber-600 leading-snug">The cloud module initializes in a secure perimeter. Ensure pop-ups are authorized for this domain.</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="demo" className="animate-[fadeIn_0.5s_ease-out] outline-none">
            <DiseasePredictionDemo />
          </TabsContent>

          <TabsContent value="history" className="animate-[fadeIn_0.5s_ease-out] outline-none">
            <Card className="bg-white border border-gray-100 rounded-[40px] shadow-2xl shadow-gray-200/40 p-8">
              <CardContent className="p-0">
                {user ? (
                  <PredictionHistory />
                ) : (
                  <div className="text-center py-20 space-y-6">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-rose-50 text-rose-500 mb-6">
                      <AlertCircle className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase">Authentication Required</h3>
                    <p className="text-gray-400 font-bold max-w-md mx-auto">Historical records are encrypted and tied to verified accounts. Please authenticate to view your diagnostic history.</p>
                    <Button
                      className="mt-6 py-6 px-10 bg-gray-900 hover:bg-black text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest"
                      onClick={() => window.location.href = '/login?redirect=/disease-prediction?tab=history'}
                    >
                      Authenticate Access
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SubscriptionGuard>
  );
}
