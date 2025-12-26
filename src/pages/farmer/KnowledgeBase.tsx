import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  BookOpen,
  Search,
  Lightbulb,
  Bird,
  Calendar,
  AlertTriangle,
  Activity,
  ChevronRight,
  ArrowLeft,
  Star,
  Zap,
  ShieldCheck,
  Thermometer,
  Layers,
  GraduationCap,
  CloudLightning,
  Clock
} from 'lucide-react';
import {
  recommendationsApi,
  breedConfigurationsApi,
  breedStagesApi,
  breedMilestonesApi
} from '../../lib/api';
import { Card } from '../../components/ui/card';
import {
  poultryKnowledge,
  knowledgeCategories,
  ComparisonTable
} from '../../data/poultryKnowledge';

interface Recommendation {
  id: string;
  title: string;
  category: string;
  content: string;
  breed: string | null;
  age_range_days: string | null;
  created_at: string;
}

interface Breed {
  id: string;
  breed_name: string;
  breed_type: string;
  description: string;
  average_maturity_days: number;
  production_lifespan_days: number;
  average_weight_kg: number;
  eggs_per_year: number;
  feed_consumption_daily_grams: number;
  space_requirement_sqm: number;
  temperature_min_celsius: number;
  temperature_max_celsius: number;
  humidity_min_percent: number;
  humidity_max_percent: number;
}

interface BreedStage {
  id: string;
  stage_name: string;
  start_day: number;
  end_day: number;
  description: string;
  feeding_guide: string;
  health_tips: string;
  housing_requirements: string;
  expected_weight_kg: number;
  mortality_threshold_percent: number;
  feed_type: string;
  vaccination_schedule: string;
  common_diseases: string;
  management_practices: string;
}

interface BreedMilestone {
  id: string;
  milestone_day: number;
  milestone_title: string;
  milestone_description: string;
  action_required: string;
  is_critical: boolean;
}

export function KnowledgeBase() {
  const { t, language } = useLanguage();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'recommendations' | 'breeds' | 'knowledge'>('recommendations');
  const [selectedKnowledge, setSelectedKnowledge] = useState<any | null>(null);
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);
  const [breedStages, setBreedStages] = useState<BreedStage[]>([]);
  const [breedMilestones, setBreedMilestones] = useState<BreedMilestone[]>([]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const { data, error } = await recommendationsApi.getAll();
      if (error) throw new Error(error);
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBreeds = useCallback(async () => {
    try {
      const { data, error } = await breedConfigurationsApi.getAll();
      if (error) throw new Error(error);
      setBreeds(data || []);
    } catch (error) {
      console.error('Error fetching breeds:', error);
    }
  }, []);

  const fetchBreedDetails = useCallback(async (breedId: string) => {
    try {
      const [stagesRes, milestonesRes] = await Promise.all([
        breedStagesApi.getByBreed(breedId),
        breedMilestonesApi.getByBreed(breedId)
      ]);
      if (stagesRes.data) setBreedStages(stagesRes.data);
      if (milestonesRes.data) setBreedMilestones(milestonesRes.data);
    } catch (error) {
      console.error('Error fetching breed details:', error);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
    fetchBreeds();
  }, [fetchRecommendations, fetchBreeds]);

  useEffect(() => {
    if (selectedBreed) {
      fetchBreedDetails(selectedBreed.id);
    }
  }, [selectedBreed, fetchBreedDetails]);

  // Get localized categories and knowledge with proper fallbacks
  const currentCategories = (knowledgeCategories as any)?.[language] || (knowledgeCategories as any)?.en || [];
  const currentKnowledge = (poultryKnowledge as any)?.[language] || (poultryKnowledge as any)?.en || {};

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesSearch =
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || rec.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredKnowledgeCategories = Array.isArray(currentCategories)
    ? currentCategories.filter((cat: any) =>
      cat?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'FEEDING': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: '🥣' };
      case 'HEALTH': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: '💉' };
      case 'ENVIRONMENT': return { bg: 'bg-amber-50', text: 'text-amber-600', icon: '🌡️' };
      case 'BIOSECURITY': return { bg: 'bg-rose-50', text: 'text-rose-600', icon: '🛡️' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', icon: '📋' };
    }
  };

  const getBreedTypeStyles = (type: string) => {
    switch (type) {
      case 'MEAT': return 'bg-rose-50 text-rose-600';
      case 'EGG': return 'bg-amber-50 text-amber-600';
      case 'DUAL_PURPOSE': return 'bg-blue-50 text-blue-600';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const getBreedTypeLabel = (type: string) => {
    switch (type) {
      case 'MEAT': return t('breeds.meat');
      case 'EGG': return t('breeds.egg');
      case 'DUAL_PURPOSE': return t('breeds.dualPurpose');
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Knowledge Matrix Initializing...</p>
      </div>
    );
  }

  if (selectedBreed) {
    return (
      <div className="space-y-10 pb-20 max-w-5xl mx-auto">
        <button
          onClick={() => setSelectedBreed(null)}
          className="flex items-center gap-2 group text-gray-400 hover:text-indigo-600 transition-colors font-black text-[10px] uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('knowledge.buttons.back')}
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${getBreedTypeStyles(selectedBreed.breed_type)}`}>
                {getBreedTypeLabel(selectedBreed.breed_type)} {t('knowledge.labels.blueprint')}
              </span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              {selectedBreed.breed_name} <span className="text-indigo-600">{t('knowledge.labels.blueprint')}</span>
            </h1>
            <p className="text-gray-500 font-bold text-lg max-w-2xl">{selectedBreed.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl">
              <Bird className="w-10 h-10" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('knowledge.labels.horizon')}</p>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-3xl font-black text-gray-900">{selectedBreed.average_maturity_days} <span className="text-sm font-bold opacity-40 uppercase">{t('common.days')}</span></h3>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('knowledge.labels.payload')}</p>
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h3 className="text-3xl font-black text-gray-900">{selectedBreed.average_weight_kg} <span className="text-sm font-bold opacity-40 uppercase">KG</span></h3>
            </div>
          </Card>
          <Card className="p-8 bg-gray-900 rounded-[40px] shadow-2xl shadow-gray-200 text-white flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('knowledge.labels.efficacy')}</p>
              <h3 className="text-3xl font-black">{selectedBreed.feed_consumption_daily_grams}g <span className="text-sm font-bold opacity-40 uppercase">{t('batches.daily')}</span></h3>
            </div>
            <Zap className="w-10 h-10 text-amber-500" />
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/40">
            <div className="flex items-center gap-3 mb-8">
              <Layers className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-black uppercase tracking-tight">{t('knowledge.labels.techSpecs')}</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('breeds.productionLife')}</span>
                <span className="text-sm font-black text-gray-900">{selectedBreed.production_lifespan_days} {t('common.days')}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Spatial Ratio</span>
                <span className="text-sm font-black text-gray-900">{selectedBreed.space_requirement_sqm} m² / Bird</span>
              </div>
              {selectedBreed.eggs_per_year > 0 && (
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Annual Egg Yield</span>
                  <span className="text-sm font-black text-emerald-600">{selectedBreed.eggs_per_year} Units</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-indigo-600 rounded-[40px] p-8 shadow-2xl shadow-indigo-200 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-white/10 rounded-full"></div>
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <Thermometer className="w-6 h-6 text-white" />
              <h3 className="text-xl font-black uppercase tracking-tight">{t('knowledge.labels.climate')}</h3>
            </div>
            <div className="space-y-8 relative z-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Optimal Thermal Range</p>
                <div className="flex items-center gap-4">
                  <h4 className="text-4xl font-black">{selectedBreed.temperature_min_celsius}°C</h4>
                  <div className="h-0.5 w-8 bg-white/30"></div>
                  <h4 className="text-4xl font-black">{selectedBreed.temperature_max_celsius}°C</h4>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Atmospheric Humidity</p>
                <div className="flex items-center gap-4">
                  <h4 className="text-4xl font-black">{selectedBreed.humidity_min_percent}%</h4>
                  <div className="h-0.5 w-8 bg-white/30"></div>
                  <h4 className="text-4xl font-black">{selectedBreed.humidity_max_percent}%</h4>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{t('knowledge.labels.growth')}</h2>
          {breedStages.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">{t('knowledge.empty.stagesPending')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {breedStages.map((stage, index) => (
                <Card key={stage.id} className="bg-white border border-gray-100 rounded-[40px] p-10 hover:shadow-2xl transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 py-4 px-8 bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-bl-[2rem]">
                    Phase {index + 1}
                  </div>
                  <div className="flex flex-col lg:flex-row gap-10">
                    <div className="lg:w-1/3">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black">
                          {index + 1}
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{stage.stage_name}</h3>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        <Calendar className="w-4 h-4" />
                        Day {stage.start_day} - {stage.end_day}
                      </div>
                      <p className="text-gray-500 font-bold mt-6 leading-relaxed">{stage.description}</p>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="p-6 bg-blue-50/50 rounded-3xl space-y-3">
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-3 h-3" />
                          Nutrition Plan
                        </h4>
                        <p className="text-sm font-bold text-gray-700">{stage.feed_type || 'Standard Formula'}</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed font-bold">{stage.feeding_guide}</p>
                      </div>
                      <div className="p-6 bg-emerald-50/50 rounded-3xl space-y-3">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck className="w-3 h-3" />
                          Biological Integrity
                        </h4>
                        <p className="text-sm font-bold text-gray-700">{stage.expected_weight_kg}kg target</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed font-bold">{stage.health_tips}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{t('knowledge.labels.interventions')}</h2>
          {breedMilestones.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">{t('knowledge.empty.milestonesPending')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {breedMilestones.map((milestone) => (
                <Card
                  key={milestone.id}
                  className={`p-10 rounded-[40px] border-none shadow-xl flex items-start gap-8 transition-all hover:-translate-y-1 ${milestone.is_critical ? 'bg-rose-50 border-rose-100 shadow-rose-200/20' : 'bg-gray-50 border-gray-100'
                    }`}
                >
                  <div className={`p-5 rounded-3xl relative ${milestone.is_critical ? 'bg-rose-600 text-white' : 'bg-white text-blue-600 shadow-sm'}`}>
                    {milestone.is_critical ? <AlertTriangle className="w-8 h-8" /> : <Calendar className="w-8 h-8" />}
                    <div className="absolute -bottom-2 -left-2 px-3 py-1 bg-gray-900 text-white rounded-lg text-[8px] font-black tracking-widest">
                      DAY {milestone.milestone_day}
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{milestone.milestone_title}</h3>
                        {milestone.is_critical && (
                          <span className="px-2 py-0.5 bg-rose-200 text-rose-800 text-[8px] font-black rounded-full uppercase tracking-widest animate-pulse">Critical</span>
                        )}
                      </div>
                      <p className="text-gray-500 font-bold">{milestone.milestone_description}</p>
                    </div>
                    {milestone.action_required && (
                      <div className="p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/40">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">Required Action Vector</p>
                        <p className="text-sm font-black text-gray-800 leading-snug">{milestone.action_required}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Dynamic Header */}
      <div className="text-center space-y-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
          <GraduationCap className="w-3.5 h-3.5" />
          Intelligence Repository Alpha
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">
          {t('knowledge.title')}
        </h1>
        <p className="text-gray-500 font-bold text-lg">
          {t('knowledge.subtitle')}
        </p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex items-center p-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${activeTab === 'recommendations' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
              }`}
          >
            <Lightbulb className="w-4 h-4" />
            {t('knowledge.tabs.insights')}
          </button>
          <button
            onClick={() => setActiveTab('breeds')}
            className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${activeTab === 'breeds' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
              }`}
          >
            <Bird className="w-4 h-4" />
            {t('knowledge.tabs.blueprints')}
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${activeTab === 'knowledge' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            {t('knowledge.tabs.library')}
          </button>
        </div>
      </div>

      {activeTab === 'recommendations' && (
        <div className="space-y-10 animate-[fadeIn_0.5s_ease-out] outline-none">
          <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/40">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder={t('knowledge.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-500/10 text-lg font-bold transition-all outline-none"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-8 py-6 bg-gray-50 border-none rounded-3xl text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-w-[200px]"
              >
                <option value="ALL">All Intelligence Vectors</option>
                <option value="FEEDING">Feeding Protocols</option>
                <option value="HEALTH">Biological Health</option>
                <option value="ENVIRONMENT">Atmospheric Focus</option>
                <option value="BIOSECURITY">Security Perimeter</option>
              </select>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            {filteredRecommendations.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                  <CloudLightning className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase">{t('knowledge.empty.noMatches')}</h3>
                <p className="text-gray-400 font-bold max-w-sm mt-3 px-6">{t('knowledge.empty.noMatchesDesc')}</p>
              </div>
            ) : (
              filteredRecommendations.map((recommendation) => {
                const theme = getCategoryTheme(recommendation.category);
                return (
                  <Card
                    key={recommendation.id}
                    className="bg-white border border-gray-100 rounded-[40px] p-10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="flex items-start gap-8">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-lg ring-4 ring-offset-4 ring-gray-50 ${theme.bg}`}>
                        {theme.icon}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg ${theme.bg} ${theme.text}`}>
                            {recommendation.category} VECTOR
                          </span>
                          {recommendation.breed && (
                            <span className="px-3 py-1 text-[8px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 rounded-lg">
                              GENETIC: {recommendation.breed}
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-tight group-hover:text-indigo-600 transition-colors">
                          {recommendation.title}
                        </h3>
                        <p className="text-gray-500 font-bold leading-relaxed whitespace-pre-wrap">{recommendation.content}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Star className="w-6 h-6 text-amber-400 fill-current" />
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'breeds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-[fadeIn_0.5s_ease-out]">
          {breeds.length === 0 ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                <Bird className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase">{t('knowledge.empty.registryEmpty')}</h3>
              <p className="text-gray-400 font-bold max-w-sm mt-3 px-6">{t('knowledge.empty.registryEmptyDesc')}</p>
            </div>
          ) : (
            breeds.map((breed) => (
              <Card
                key={breed.id}
                className="bg-white border border-gray-100 rounded-[40px] p-10 hover:shadow-2xl hover:scale-[1.02] cursor-pointer transition-all duration-300 group relative overflow-hidden"
                onClick={() => setSelectedBreed(breed)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Bird className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">{breed.breed_name}</h3>
                    <span className={`inline-block mt-3 px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg ${getBreedTypeStyles(breed.breed_type)}`}>
                      {breed.breed_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-gray-500 font-bold text-sm mb-8 line-clamp-3 leading-relaxed relative z-10">{breed.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-8 border-t border-gray-50 pt-8 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Horizon</p>
                    <p className="text-sm font-black text-gray-900">{breed.average_maturity_days}d</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Payload</p>
                    <p className="text-sm font-black text-gray-900">{breed.average_weight_kg}kg</p>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-3 py-5 bg-gray-900 hover:bg-black text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-gray-200">
                  {t('knowledge.buttons.viewIntel')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="space-y-10 animate-[fadeIn_0.5s_ease-out]">
          {selectedKnowledge ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedKnowledge(null)}
                className="flex items-center gap-3 text-gray-600 hover:text-gray-900 font-bold transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('knowledge.buttons.backToLibrary')}
              </button>

              {(() => {
                const knowledge = selectedKnowledge; // selectedKnowledge is now the object itself
                if (!knowledge) return null;

                return (
                  <Card className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-xl">
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-4xl font-black text-gray-900 uppercase mb-4">{knowledge.title}</h2>
                        {knowledge.subtitle && (
                          <p className="text-lg text-gray-500 font-bold">{knowledge.subtitle}</p>
                        )}
                        <p className="text-gray-600 font-bold mt-4 leading-relaxed">{knowledge.content}</p>
                      </div>

                      {selectedKnowledge.sections?.map((section: any) => (
                        <div key={section.id} className="border-t border-gray-100 pt-8">
                          <h3 className="text-2xl font-black text-gray-900 uppercase mb-4">{section.title}</h3>
                          {section.content && (
                            <p className="text-gray-600 font-bold mb-4 leading-relaxed">{section.content}</p>
                          )}
                          {section.items && (
                            <ul className="space-y-2 ml-6">
                              {section.items.map((item: any, idx: number) => (
                                <li key={idx} className="text-gray-600 font-bold leading-relaxed list-disc">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}

                      {selectedKnowledge.comparisons && (
                        <div className="border-t border-gray-100 pt-8 overflow-x-auto">
                          <h3 className="text-2xl font-black text-gray-900 uppercase mb-6 flex items-center gap-3">
                            <Activity className="w-6 h-6 text-indigo-600" />
                            Comparison Analysis
                          </h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                {selectedKnowledge.comparisons.headers.map((header: any, idx: number) => (
                                  <th
                                    key={idx}
                                    className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-600 border-b border-gray-200"
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {selectedKnowledge.comparisons.rows.map((row: any, rowIdx: number) => (
                                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  {row.map((cell: any, cellIdx: number) => (
                                    <td
                                      key={cellIdx}
                                      className="px-6 py-4 text-sm font-bold text-gray-700 border-b border-gray-100"
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {selectedKnowledge.tips && selectedKnowledge.tips.length > 0 && (
                        <div className="border-t border-gray-100 pt-8">
                          <h3 className="text-2xl font-black text-gray-900 uppercase mb-6 flex items-center gap-3">
                            <Lightbulb className="w-6 h-6 text-amber-500" />
                            Important Tips
                          </h3>
                          <ul className="space-y-2 ml-6">
                            {selectedKnowledge.tips.map((tip: any, idx: number) => (
                              <li key={idx} className="text-gray-600 font-bold leading-relaxed list-disc">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedKnowledge.warnings && selectedKnowledge.warnings.length > 0 && (
                        <div className="border-t border-gray-100 pt-8">
                          <h3 className="text-2xl font-black text-red-600 uppercase mb-6 flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6" />
                            Warnings
                          </h3>
                          <ul className="space-y-2 ml-6">
                            {selectedKnowledge.warnings.map((warning: any, idx: number) => (
                              <li key={idx} className="text-red-600 font-bold leading-relaxed list-disc">
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })()}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredKnowledgeCategories.map((category: any) => {
                const knowledgeItem = currentKnowledge[category.id];
                if (!knowledgeItem) return null;

                return (
                  <Card
                    key={category.id}
                    className="bg-white border border-gray-100 rounded-[40px] p-10 hover:shadow-2xl hover:scale-[1.02] cursor-pointer transition-all duration-300 group relative overflow-hidden"
                    onClick={() => setSelectedKnowledge(knowledgeItem)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                    <div className="relative z-10">
                      <div className="text-5xl mb-6">{category.icon}</div>
                      <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4 leading-tight group-hover:text-indigo-600 transition-colors">
                        {category.name}
                      </h3>
                      {knowledgeItem.subtitle && (
                        <p className="text-gray-500 font-bold text-sm mb-6 leading-relaxed line-clamp-2">
                          {knowledgeItem.subtitle}
                        </p>
                      )}
                      <p className="text-gray-400 font-bold text-xs leading-relaxed line-clamp-3">
                        {knowledgeItem.content}
                      </p>

                      <button className="w-full mt-8 flex items-center justify-center gap-3 py-5 bg-gray-900 hover:bg-black text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-gray-200">
                        {t('knowledge.buttons.readMore')}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default KnowledgeBase;
