import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  Calendar,
  Activity,
  Milestone,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Bird,
  Layers,
  Zap,
  ShieldCheck,
  Filter,
  MoreVertical,
  X,
  Thermometer,
  Waves
} from 'lucide-react';
import { breedConfigurationsApi, breedStagesApi, breedMilestonesApi } from '../../lib/api';
import { useConfirm } from '../../hooks/useConfirm';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

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
  is_active: boolean;
  created_at: string;
}

interface BreedStage {
  id: string;
  breed_id: string;
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
  order_index: number;
}

interface BreedMilestone {
  id: string;
  breed_id: string;
  stage_id?: string;
  milestone_day: number;
  milestone_title: string;
  milestone_description: string;
  action_required: string;
  is_critical: boolean;
}

export function BreedConfigurations() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [view, setView] = useState<'list' | 'stages' | 'milestones'>('list');
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingBreed, setEditingBreed] = useState<Breed | null>(null);
  const [editingStage, setEditingStage] = useState<BreedStage | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<BreedMilestone | null>(null);
  const [stages, setStages] = useState<BreedStage[]>([]);
  const [milestones, setMilestones] = useState<BreedMilestone[]>([]);

  const [breedForm, setBreedForm] = useState({
    breed_name: '',
    breed_type: 'MEAT',
    description: '',
    average_maturity_days: '0',
    production_lifespan_days: '0',
    average_weight_kg: '0',
    eggs_per_year: '0',
    feed_consumption_daily_grams: '0',
    space_requirement_sqm: '0',
    temperature_min_celsius: '0',
    temperature_max_celsius: '0',
    humidity_min_percent: '0',
    humidity_max_percent: '0',
    is_active: true,
  });

  const [stageForm, setStageForm] = useState({
    stage_name: '',
    start_day: '0',
    end_day: '0',
    description: '',
    feeding_guide: '',
    health_tips: '',
    housing_requirements: '',
    expected_weight_kg: '0',
    mortality_threshold_percent: '0',
    feed_type: '',
    vaccination_schedule: '',
    common_diseases: '',
    management_practices: '',
    order_index: '0',
  });

  const [milestoneForm, setMilestoneForm] = useState({
    stage_id: '',
    milestone_day: '0',
    milestone_title: '',
    milestone_description: '',
    action_required: '',
    is_critical: false,
  });

  const fetchBreeds = useCallback(async () => {
    setLoading(true);
    const { data, error } = await breedConfigurationsApi.getAll();
    if (error) setError(error);
    else setBreeds(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  const fetchStages = useCallback(async (breedId: string) => {
    const { data, error } = await breedStagesApi.getByBreed(breedId);
    if (error) setError(error);
    else setStages(Array.isArray(data) ? data : []);
  }, []);

  const fetchMilestones = useCallback(async (breedId: string) => {
    const { data, error } = await breedMilestonesApi.getByBreed(breedId);
    if (error) setError(error);
    else setMilestones(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchBreeds();
  }, [fetchBreeds]);

  useEffect(() => {
    if (selectedBreed) {
      if (view === 'stages') fetchStages(selectedBreed.id);
      else if (view === 'milestones') fetchMilestones(selectedBreed.id);
    }
  }, [selectedBreed, view, fetchStages, fetchMilestones]);

  const handleBreedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const breedData = {
      ...breedForm,
      average_maturity_days: parseInt(breedForm.average_maturity_days),
      production_lifespan_days: parseInt(breedForm.production_lifespan_days),
      average_weight_kg: parseFloat(breedForm.average_weight_kg),
      eggs_per_year: parseInt(breedForm.eggs_per_year),
      feed_consumption_daily_grams: parseFloat(breedForm.feed_consumption_daily_grams),
      space_requirement_sqm: parseFloat(breedForm.space_requirement_sqm),
      temperature_min_celsius: parseFloat(breedForm.temperature_min_celsius),
      temperature_max_celsius: parseFloat(breedForm.temperature_max_celsius),
      humidity_min_percent: parseFloat(breedForm.humidity_min_percent),
      humidity_max_percent: parseFloat(breedForm.humidity_max_percent),
    };
    const { error } = editingBreed
      ? await breedConfigurationsApi.update(editingBreed.id, breedData)
      : await breedConfigurationsApi.create(breedData);
    if (error) setError(error);
    else {
      setSuccess(editingBreed ? 'Protocol updated successfully' : 'New sequence established');
      setShowBreedModal(false);
      setEditingBreed(null);
      fetchBreeds();
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleStageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBreed) return;
    setError('');
    const stageData = {
      ...stageForm,
      breed_id: selectedBreed.id,
      start_day: parseInt(stageForm.start_day),
      end_day: parseInt(stageForm.end_day),
      expected_weight_kg: parseFloat(stageForm.expected_weight_kg),
      mortality_threshold_percent: parseFloat(stageForm.mortality_threshold_percent),
      order_index: parseInt(stageForm.order_index),
    };
    const { error } = editingStage
      ? await breedStagesApi.update(editingStage.id, stageData)
      : await breedStagesApi.create(stageData);
    if (error) setError(error);
    else {
      setSuccess('Growth stage synchronized');
      setShowStageModal(false);
      setEditingStage(null);
      fetchStages(selectedBreed.id);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBreed) return;
    setError('');
    const milestoneData = {
      ...milestoneForm,
      breed_id: selectedBreed.id,
      stage_id: milestoneForm.stage_id || undefined,
      milestone_day: parseInt(milestoneForm.milestone_day),
    };
    const { error } = editingMilestone
      ? await breedMilestonesApi.update(editingMilestone.id, milestoneData)
      : await breedMilestonesApi.create(milestoneData);
    if (error) setError(error);
    else {
      setSuccess('Critical milestone registered');
      setShowMilestoneModal(false);
      setEditingMilestone(null);
      fetchMilestones(selectedBreed.id);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDeleteBreed = async (id: string) => {
    const confirmed = await confirm({
      title: 'Decommission Protocol',
      message: 'This will purge all genetic sequence data including stages and milestones. Proceed?',
      variant: 'danger',
      confirmText: 'Confirm Purge',
      cancelText: 'Abort'
    });
    if (!confirmed) return;
    const { error } = await breedConfigurationsApi.delete(id);
    if (error) setError(error);
    else {
      setSuccess('Protocol decommissioned');
      fetchBreeds();
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const filteredBreeds = useMemo(() => breeds.filter((breed) => {
    const matchesSearch = breed.breed_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || breed.breed_type === typeFilter;
    return matchesSearch && matchesType;
  }), [breeds, searchTerm, typeFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Logic Gates Initializing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      <ConfirmDialog />

      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Bird className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Logic Engine Configurator</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            {view === 'list' ? 'Genetic' : selectedBreed?.breed_name} <span className="text-gray-400">{view === 'list' ? 'Blueprints' : view.toUpperCase()}</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg leading-relaxed">
            {view === 'list' ? 'Configure core farming protocols and breed schemas.' : `Managing ${view} sequences for ${selectedBreed?.breed_name}.`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {view !== 'list' && (
            <button
              onClick={() => { setView('list'); setSelectedBreed(null); }}
              className="flex items-center gap-2 px-6 py-4 bg-gray-100 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" />
              Registry Center
            </button>
          )}
          <button
            onClick={() => {
              if (view === 'list') { setEditingBreed(null); setShowBreedModal(true); }
              else if (view === 'stages') { setEditingStage(null); setShowStageModal(true); }
              else if (view === 'milestones') { setEditingMilestone(null); setShowMilestoneModal(true); }
            }}
            className="px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Establish New
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-fadeIn">
          {success}
        </div>
      )}

      {view === 'list' ? (
        <div className="space-y-8">
          <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/40">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search schemas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-500/10 text-lg font-bold transition-all outline-none"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-8 py-6 bg-gray-50 border-none rounded-3xl text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-w-[200px]"
              >
                <option value="ALL">All Types</option>
                <option value="MEAT">Meat Production</option>
                <option value="EGG">Egg Production</option>
                <option value="DUAL_PURPOSE">Dual Purpose</option>
              </select>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBreeds.map((breed) => (
              <Card key={breed.id} className="bg-white border border-gray-100 rounded-[40px] p-10 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                <div className="flex flex-col h-full relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl shadow-lg">
                      <Bird className="w-8 h-8" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingBreed(breed); setBreedForm({ ...breed, average_maturity_days: breed.average_maturity_days.toString(), production_lifespan_days: breed.production_lifespan_days.toString(), average_weight_kg: breed.average_weight_kg.toString(), eggs_per_year: breed.eggs_per_year.toString(), feed_consumption_daily_grams: breed.feed_consumption_daily_grams.toString(), space_requirement_sqm: breed.space_requirement_sqm.toString(), temperature_min_celsius: breed.temperature_min_celsius.toString(), temperature_max_celsius: breed.temperature_max_celsius.toString(), humidity_min_percent: breed.humidity_min_percent.toString(), humidity_max_percent: breed.humidity_max_percent.toString() }); setShowBreedModal(true); }}
                        className="p-3 bg-white text-gray-400 hover:text-indigo-600 rounded-xl shadow-sm border border-gray-50 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBreed(breed.id)}
                        className="p-3 bg-white text-gray-400 hover:text-rose-600 rounded-xl shadow-sm border border-gray-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-tight group-hover:text-indigo-600 transition-colors">
                        {breed.breed_name}
                      </h3>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-lg">
                        {breed.breed_type}
                      </span>
                    </div>
                    <p className="text-gray-500 font-bold text-sm line-clamp-3 leading-relaxed">
                      {breed.description || 'Global schema protocol not defined for this genotype.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-10 pt-8 border-t border-gray-50">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Growth Window</p>
                      <p className="text-sm font-black text-gray-900">{breed.average_maturity_days} Units</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Target Loading</p>
                      <p className="text-sm font-black text-gray-900">{breed.average_weight_kg}k kg</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setSelectedBreed(breed); setView('stages'); }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                    >
                      <Layers className="w-4 h-4" />
                      Stages
                    </button>
                    <button
                      onClick={() => { setSelectedBreed(breed); setView('milestones'); }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-gray-100 shadow-sm text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                    >
                      <Milestone className="w-4 h-4" />
                      Events
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 gap-6">
            {view === 'stages' ? (
              stages.length === 0 ? (
                <Card className="p-20 text-center border-2 border-dashed border-gray-100 rounded-[40px] space-y-6">
                  <Layers className="w-16 h-16 mx-auto text-gray-100" />
                  <h3 className="text-2xl font-black text-gray-400 uppercase">Growth Stream Offline</h3>
                  <button onClick={() => setShowStageModal(true)} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl">Initialize Sequence</button>
                </Card>
              ) : (
                stages.map((stage, idx) => (
                  <Card key={stage.id} className="bg-white border border-gray-100 rounded-[40px] p-10 hover:shadow-2xl transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 py-4 px-10 bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-bl-[2rem]">
                      Sequence Phase {idx + 1}
                    </div>
                    <div className="flex flex-col lg:flex-row gap-12">
                      <div className="lg:w-1/3 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                            {idx + 1}
                          </div>
                          <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none">{stage.stage_name}</h3>
                        </div>
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100">
                          <Calendar className="w-4 h-4 text-indigo-600" />
                          Cycle Days {stage.start_day} - {stage.end_day}
                        </div>
                        <p className="text-gray-500 font-bold leading-relaxed">{stage.description}</p>
                        <div className="flex items-center gap-3 pt-4">
                          <button onClick={() => { setEditingStage(stage); setStageForm({ ...stage, start_day: stage.start_day.toString(), end_day: stage.end_day.toString(), expected_weight_kg: stage.expected_weight_kg.toString(), mortality_threshold_percent: stage.mortality_threshold_percent.toString(), order_index: stage.order_index.toString() }); setShowStageModal(true); }} className="px-6 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Edit Component</button>
                          <button onClick={() => handleDeleteStage(stage.id)} className="px-6 py-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Sever</button>
                        </div>
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="p-8 bg-blue-50/50 rounded-[2.5rem] space-y-4 border border-blue-50">
                          <Zap className="w-6 h-6 text-blue-500" />
                          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Nutrition Protocols</h4>
                          <p className="text-sm font-black text-gray-800 leading-snug">{stage.feed_type} Pattern</p>
                          <p className="text-[10px] text-gray-500 font-bold leading-relaxed">{stage.feeding_guide}</p>
                        </div>
                        <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] space-y-4 border border-emerald-50">
                          <ShieldCheck className="w-6 h-6 text-emerald-500" />
                          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Biological Integrity</h4>
                          <p className="text-sm font-black text-gray-800 leading-snug">{stage.expected_weight_kg}kg Capacity Target</p>
                          <p className="text-[10px] text-gray-500 font-bold leading-relaxed">{stage.health_tips}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )
            ) : (
              milestones.length === 0 ? (
                <Card className="p-20 text-center border-2 border-dashed border-gray-100 rounded-[40px] space-y-6">
                  <Milestone className="w-16 h-16 mx-auto text-gray-100" />
                  <h3 className="text-2xl font-black text-gray-400 uppercase">Event Feed Blank</h3>
                  <button onClick={() => setShowMilestoneModal(true)} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl">Define Pivot Point</button>
                </Card>
              ) : (
                milestones.map((milestone) => (
                  <Card key={milestone.id} className={`p-10 rounded-[40px] border-none shadow-xl flex items-start gap-10 transition-all hover:-translate-y-1 relative overflow-hidden ${milestone.is_critical ? 'bg-rose-50 shadow-rose-200/20' : 'bg-gray-50 shadow-gray-200/10'
                    }`}>
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center relative flex-shrink-0 shadow-lg ${milestone.is_critical ? 'bg-rose-600 text-white' : 'bg-gray-900 text-white'
                      }`}>
                      {milestone.is_critical ? <AlertCircle className="w-8 h-8" /> : <Calendar className="w-8 h-8" />}
                      <div className="absolute -bottom-2 -left-2 px-3 py-1 bg-white text-gray-900 rounded-lg text-[8px] font-black tracking-widest shadow-sm">
                        DAY {milestone.milestone_day}
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{milestone.milestone_title}</h3>
                          {milestone.is_critical && <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest animate-pulse">Critical Intervention Required</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditingMilestone(milestone); setMilestoneForm({ ...milestone, milestone_day: milestone.milestone_day.toString(), stage_id: milestone.stage_id || '' }); setShowMilestoneModal(true); }} className="p-3 bg-white hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm border border-gray-100 transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteMilestone(milestone.id)} className="p-3 bg-white hover:bg-rose-600 hover:text-white rounded-xl shadow-sm border border-gray-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-gray-500 font-bold leading-relaxed">{milestone.milestone_description}</p>
                      {milestone.action_required && (
                        <div className="p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-white mt-4">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">Required Operator Action</p>
                          <p className="text-sm font-black text-gray-800 leading-snug">{milestone.action_required}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* Modals - Simplified Theming */}
      {showBreedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <Card className="w-full max-w-4xl bg-white rounded-[40px] overflow-hidden shadow-2xl animate-scaleIn border-none flex flex-col max-h-[90vh]">
            <div className="p-10 pb-6 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Bird className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                  {editingBreed ? 'Protocol Config' : 'New Blueprint'}
                </h2>
              </div>
              <button onClick={() => setShowBreedModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBreedSubmit} className="p-10 pt-8 overflow-y-auto space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Blueprint Name</Label>
                    <Input
                      value={breedForm.breed_name}
                      onChange={(e) => setBreedForm({ ...breedForm, breed_name: e.target.value })}
                      required
                      className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Universal Description</Label>
                    <textarea
                      value={breedForm.description}
                      onChange={(e) => setBreedForm({ ...breedForm, description: e.target.value })}
                      className="w-full p-6 mt-2 rounded-3xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none transition-all"
                      rows={4}
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Genotype Class</Label>
                    <select
                      value={breedForm.breed_type}
                      onChange={(e) => setBreedForm({ ...breedForm, breed_type: e.target.value })}
                      className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold transition-all outline-none mt-2 uppercase tracking-widest text-[10px]"
                    >
                      <option value="MEAT">Meat Focus</option>
                      <option value="EGG">Egg Focus</option>
                      <option value="DUAL_PURPOSE">Dual Hybrid</option>
                    </select>
                  </div>
                  <div className="p-6 bg-indigo-50 rounded-3xl space-y-2">
                    <Label className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Visibility Status</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={breedForm.is_active}
                        onChange={(e) => setBreedForm({ ...breedForm, is_active: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-none bg-white text-indigo-600 focus:ring-indigo-500/20"
                      />
                      <span className="text-[10px] font-black text-gray-700 uppercase">Publish Blueprint</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Technical Specifications</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400">Maturity (Days)</Label>
                    <Input type="number" value={breedForm.average_maturity_days} onChange={(e) => setBreedForm({ ...breedForm, average_maturity_days: e.target.value })} className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-500/10 font-bold" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400">Lifespan (Days)</Label>
                    <Input type="number" value={breedForm.production_lifespan_days} onChange={(e) => setBreedForm({ ...breedForm, production_lifespan_days: e.target.value })} className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-500/10 font-bold" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400">Target Weight (KG)</Label>
                    <Input type="number" step="0.1" value={breedForm.average_weight_kg} onChange={(e) => setBreedForm({ ...breedForm, average_weight_kg: e.target.value })} className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-500/10 font-bold" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400">Daily Feed (Grams)</Label>
                    <Input type="number" value={breedForm.feed_consumption_daily_grams} onChange={(e) => setBreedForm({ ...breedForm, feed_consumption_daily_grams: e.target.value })} className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-500/10 font-bold" />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Atmospheric Constraints</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600"><Thermometer className="w-3.5 h-3.5" /><span className="text-[8px] font-black">TEMP MIN °C</span></div>
                    <Input type="number" value={breedForm.temperature_min_celsius} onChange={(e) => setBreedForm({ ...breedForm, temperature_min_celsius: e.target.value })} className="py-7 rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-500/10 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-600"><Thermometer className="w-3.5 h-3.5" /><span className="text-[8px] font-black">TEMP MAX °C</span></div>
                    <Input type="number" value={breedForm.temperature_max_celsius} onChange={(e) => setBreedForm({ ...breedForm, temperature_max_celsius: e.target.value })} className="py-7 rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-500/10 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600"><Waves className="w-3.5 h-3.5" /><span className="text-[8px] font-black">HUMID MIN %</span></div>
                    <Input type="number" value={breedForm.humidity_min_percent} onChange={(e) => setBreedForm({ ...breedForm, humidity_min_percent: e.target.value })} className="py-7 rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-500/10 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-cyan-600"><Waves className="w-3.5 h-3.5" /><span className="text-[8px] font-black">HUMID MAX %</span></div>
                    <Input type="number" value={breedForm.humidity_max_percent} onChange={(e) => setBreedForm({ ...breedForm, humidity_max_percent: e.target.value })} className="py-7 rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-500/10 font-bold" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-gray-100 py-6">
                <Button type="submit" className="w-full py-8 bg-gray-900 border-none hover:bg-black text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-1">
                  {editingBreed ? 'Commit Logic Updates' : 'Sync New Blueprint'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Simplified generic modals for stages/milestones follow the same pattern... */}
      {showStageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <Card className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl animate-scaleIn border-none flex flex-col max-h-[90vh]">
            <div className="p-10 pb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Layers className="w-6 h-6" /></div>
                <h2 className="text-3xl font-black text-gray-900 uppercase">Growth Component Config</h2>
              </div>
              <button onClick={() => setShowStageModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleStageSubmit} className="p-10 pt-4 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label className="text-[10px] font-black uppercase text-gray-400">Stage Sequence Identifier</Label>
                    <Input value={stageForm.stage_name} onChange={(e) => setStageForm({ ...stageForm, stage_name: e.target.value })} placeholder="e.g., Early Development" className="py-7 mt-2 rounded-2xl bg-gray-50 border-none font-bold outline-none" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] font-black uppercase text-gray-400">Start Offset (Day)</Label>
                      <Input type="number" value={stageForm.start_day} onChange={(e) => setStageForm({ ...stageForm, start_day: e.target.value })} className="py-7 mt-2 rounded-2xl bg-gray-50 border-none font-bold" required />
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase text-gray-400">End Threshold (Day)</Label>
                      <Input type="number" value={stageForm.end_day} onChange={(e) => setStageForm({ ...stageForm, end_day: e.target.value })} className="py-7 mt-2 rounded-2xl bg-gray-50 border-none font-bold" required />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase text-gray-400">Functional Description</Label>
                    <textarea value={stageForm.description} onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })} rows={4} className="w-full p-6 mt-2 rounded-3xl bg-gray-50 border-none font-bold outline-none outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className="text-[10px] font-black uppercase text-gray-400">Nutrition Matrix</Label>
                    <Input value={stageForm.feed_type} onChange={(e) => setStageForm({ ...stageForm, feed_type: e.target.value })} placeholder="Feed Blueprint ID" className="py-7 mt-2 rounded-2xl bg-gray-50 border-none font-bold" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase text-gray-400">Feeding Protocol Specs</Label>
                    <textarea value={stageForm.feeding_guide} onChange={(e) => setStageForm({ ...stageForm, feeding_guide: e.target.value })} rows={3} className="w-full p-6 mt-2 rounded-3xl bg-gray-50 border-none font-bold outline-none" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase text-gray-400">Biological Health Tips</Label>
                    <textarea value={stageForm.health_tips} onChange={(e) => setStageForm({ ...stageForm, health_tips: e.target.value })} rows={3} className="w-full p-6 mt-2 rounded-3xl bg-gray-50 border-none font-bold outline-none" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <Button type="submit" className="w-full py-8 bg-gray-900 hover:bg-black text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-1">Commit Stage Data</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showMilestoneModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <Card className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl animate-scaleIn border-none p-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Milestone className="w-6 h-6" /></div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Logic Pivot Entry</h2>
              </div>
              <button onClick={() => setShowMilestoneModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleMilestoneSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-gray-400">Execution Day</Label>
                  <Input type="number" value={milestoneForm.milestone_day} onChange={(e) => setMilestoneForm({ ...milestoneForm, milestone_day: e.target.value })} className="py-7 rounded-2xl bg-gray-50 border-none font-bold" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-gray-400">Integrity Check</Label>
                  <div className="flex items-center gap-4 h-[60px] px-6 bg-red-50/50 rounded-2xl border border-red-100">
                    <input type="checkbox" checked={milestoneForm.is_critical} onChange={(e) => setMilestoneForm({ ...milestoneForm, is_critical: e.target.checked })} className="w-5 h-5 rounded-lg text-rose-600 focus:ring-rose-500/20" />
                    <span className="text-[10px] font-black text-rose-600 uppercase">Critical Intervention</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-400">Milestone Designation</Label>
                <Input value={milestoneForm.milestone_title} onChange={(e) => setMilestoneForm({ ...milestoneForm, milestone_title: e.target.value })} placeholder="e.g., Mandatory vaccination" className="py-7 rounded-2xl bg-gray-50 border-none font-bold" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-400">Pivot Context</Label>
                <textarea value={milestoneForm.milestone_description} onChange={(e) => setMilestoneForm({ ...milestoneForm, milestone_description: e.target.value })} rows={3} className="w-full p-6 mt-2 rounded-3xl bg-gray-50 border-none font-bold outline-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-400">Required Operation Specs</Label>
                <textarea value={milestoneForm.action_required} onChange={(e) => setMilestoneForm({ ...milestoneForm, action_required: e.target.value })} rows={3} className="w-full p-6 mt-2 rounded-3xl bg-indigo-50/50 border border-indigo-50 text-indigo-900 font-bold outline-none" placeholder="Provide precise operator mandates..." />
              </div>
              <Button type="submit" className="w-full py-8 bg-gray-900 hover:bg-black text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-1 pt-4 mt-6">Establish Logic Pivot</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default BreedConfigurations;
