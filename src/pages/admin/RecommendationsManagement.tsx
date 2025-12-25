import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus,
  Search,
  BookOpen,
  Trash2,
  Lightbulb,
  Zap,
  ShieldCheck,
  CloudLightning,
  ChevronRight,
  Filter,
  MoreVertical,
  X,
  Bird,
  Clock,
  Layout
} from 'lucide-react';
import { useConfirm } from '../../hooks/useConfirm';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

interface Recommendation {
  id: string;
  title: string;
  category: string;
  content: string;
  breed: string | null;
  age_range_days: string | null;
  created_at: string;
}

export function RecommendationsManagement() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'FEEDING',
    content: '',
    breed: '',
    age_range_days: '',
  });
  const { user } = useAuth();

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem('recommendations') || '[]';
      const recommendations = JSON.parse(stored);
      setRecommendations(recommendations.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stored = localStorage.getItem('recommendations') || '[]';
      const recommendations = JSON.parse(stored);
      const newRecommendation = {
        id: `rec-${Date.now()}`,
        title: formData.title,
        category: formData.category,
        content: formData.content,
        breed: formData.breed || null,
        age_range_days: formData.age_range_days || null,
        created_by: user?.id,
        created_at: new Date().toISOString(),
      };
      recommendations.push(newRecommendation);
      localStorage.setItem('recommendations', JSON.stringify(recommendations));

      setFormData({ title: '', category: 'FEEDING', content: '', breed: '', age_range_days: '' });
      setShowModal(false);
      fetchRecommendations();
    } catch (error) {
      console.error('Error creating recommendation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Purge Knowledge Vector',
      message: 'This data will be permanently removed from the public knowledge base. Continue?',
      variant: 'danger',
      confirmText: 'Purge Vector',
      cancelText: 'Abort'
    });
    if (!confirmed) return;

    try {
      const stored = localStorage.getItem('recommendations') || '[]';
      const recommendations = JSON.parse(stored);
      const filtered = recommendations.filter((r: any) => r.id !== id);
      localStorage.setItem('recommendations', JSON.stringify(filtered));
      fetchRecommendations();
    } catch (error) {
      console.error('Error deleting recommendation:', error);
    }
  };

  const filteredRecommendations = useMemo(() => recommendations.filter((rec) => {
    const matchesSearch =
      rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || rec.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }), [recommendations, searchTerm, categoryFilter]);

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'FEEDING': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: Zap };
      case 'HEALTH': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: ShieldCheck };
      case 'ENVIRONMENT': return { bg: 'bg-amber-50', text: 'text-amber-600', icon: CloudLightning };
      case 'BIOSECURITY': return { bg: 'bg-rose-50', text: 'text-rose-600', icon: Layout };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', icon: Lightbulb };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Knowledge Ingestion Hub Initializing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-[1400px] mx-auto">
      <ConfirmDialog />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Lightbulb className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Knowledge Ingestion Hub</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            Guidance <span className="text-gray-400">Vectors</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg leading-relaxed">Broadcast best practices and operational logic to global units.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ingest Knowledge
        </button>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/40">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search knowledge vectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-500/10 text-lg font-bold transition-all outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-8 py-6 bg-gray-50 border-none rounded-3xl text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-w-[220px]"
          >
            <option value="ALL">All Vectors</option>
            <option value="FEEDING">Feeding Data</option>
            <option value="HEALTH">Health Protocols</option>
            <option value="ENVIRONMENT">Climate Guidance</option>
            <option value="BIOSECURITY">Security Layers</option>
          </select>
        </div>
      </Card>

      {/* Vectors List */}
      <div className="grid grid-cols-1 gap-8">
        {filteredRecommendations.length === 0 ? (
          <Card className="p-20 text-center border-2 border-dashed border-gray-100 rounded-[40px] space-y-4">
            <BookOpen className="w-16 h-16 mx-auto text-gray-100" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No active vectors matching criteria</p>
          </Card>
        ) : (
          filteredRecommendations.map((rec) => {
            const styles = getCategoryStyles(rec.category);
            const Icon = styles.icon;

            return (
              <Card
                key={rec.id}
                className="bg-white border border-gray-100 rounded-[40px] p-10 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 py-4 px-10 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-bl-[2rem] flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Ingested {new Date(rec.created_at).toLocaleDateString()}
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                  <div className={`w-20 h-20 rounded-3xl ${styles.bg} ${styles.text} flex items-center justify-center shrink-0 shadow-lg`}>
                    <Icon className="w-10 h-10" />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">{rec.title}</h3>
                      <span className={`px-4 py-1 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border ${styles.bg} ${styles.text} border-current opacity-70`}>{rec.category}</span>
                    </div>

                    <p className="text-gray-500 font-bold text-sm leading-relaxed max-w-4xl">{rec.content}</p>

                    <div className="flex flex-wrap gap-4 pt-4">
                      {rec.breed && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                          <Bird className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[8px] font-black text-gray-600 uppercase">Target: {rec.breed}</span>
                        </div>
                      )}
                      {rec.age_range_days && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[8px] font-black text-gray-600 uppercase">Window: {rec.age_range_days} Days</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="p-5 bg-rose-50 text-rose-400 hover:bg-rose-600 hover:text-white rounded-2xl transition-all self-start lg:self-center"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Ingestion Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <Card className="w-full max-w-3xl bg-white rounded-[40px] shadow-2xl animate-scaleIn border-none overflow-hidden">
            <div className="p-10 pb-6 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus className="w-6 h-6" /></div>
                <h2 className="text-3xl font-black text-gray-900 uppercase">Knowledge Ingestion</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 pt-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vector Designation</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="py-7 rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold"
                    placeholder="e.g., Optimal Brooding Intensity"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logic Segment</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-[10px] font-black uppercase tracking-widest transition-all outline-none"
                  >
                    <option value="FEEDING">Feeding Data</option>
                    <option value="HEALTH">Health Protocols</option>
                    <option value="ENVIRONMENT">Climate Guidance</option>
                    <option value="BIOSECURITY">Security Layers</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Genotype (Optional)</Label>
                  <Input
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="py-7 rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold"
                    placeholder="e.g., Kuku Kienyeji"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Guidance Core Content</Label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full p-6 bg-gray-50 border-none rounded-3xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold transition-all outline-none"
                    placeholder="Define the operational parameters for this vector..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Window (Days)</Label>
                  <Input
                    value={formData.age_range_days}
                    onChange={(e) => setFormData({ ...formData, age_range_days: e.target.value })}
                    className="py-7 rounded-2xl border-none bg-gray-50 focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold"
                    placeholder="e.g., 1-14"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full py-8 bg-gray-900 hover:bg-black text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-1">
                Synchronize Knowledge Vector
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default RecommendationsManagement;
