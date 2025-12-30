import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { farmersApi, farmsApi } from '../../lib/api';
import {
  ArrowLeft,
  Warehouse,
  User,
  Mail,
  MapPin,
  Briefcase,
  ShieldCheck,
  Calendar,
  Building2,
  ChevronRight,
  Zap,
  Activity,
  Layers,
  Globe,
  MoreVertical,
  Target
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface FarmerProfile {
  id: string;
  user: User;
  business_name: string;
  location: string;
  experience_years: number;
  verification_status: string;
  created_at: string;
}

export function FarmerDetail() {
  const { id } = useParams<{ id: string }>();
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFarmerDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data: farmerData, error: farmerError } = await farmersApi.getById(id);
      if (farmerError) throw new Error(farmerError);
      setFarmer(farmerData);

      const { data: farmsData, error: farmsError } = await farmsApi.getAll({ farmer: id });
      if (farmsError) throw new Error(farmsError);
      const farmsList = Array.isArray(farmsData) ? farmsData : (farmsData as any)?.results || [];
      setFarms(farmsList);
    } catch (err: any) {
      setError(err.message || 'Failed to load operator dossier');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFarmerDetails();
  }, [fetchFarmerDetails]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Operator Dossier Decrypting...</p>
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl"><ShieldCheck className="w-10 h-10" /></div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 uppercase">Access Denied</h2>
          <p className="text-gray-500 font-bold">{error || 'Target operator ID not found in system matrix.'}</p>
        </div>
        <Link to="/admin/farmers" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
          <ArrowLeft className="w-4 h-4" />
          Return to Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      {/* Back Navigation */}
      <Link
        to="/admin/farmers"
        className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Registry Matrix
      </Link>

      {/* Header / Hero */}
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl">
                <User className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Operator Profile Matrix</span>
            </div>
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
              {farmer.user.first_name} <span className="text-gray-400">{farmer.user.last_name}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${farmer.verification_status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                {farmer.verification_status} Status
              </div>
              <div className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                Joined {new Date(farmer.created_at).getFullYear()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border-none rounded-[40px] p-8 shadow-xl shadow-gray-200/20 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Mail className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Comm Link</p>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{farmer.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Building2 className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Business Identity</p>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{farmer.business_name || 'Individual Operator'}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white border-none rounded-[40px] p-8 shadow-xl shadow-gray-200/20 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><MapPin className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Base Coordinates</p>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{farmer.location || 'Global Range'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><Target className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Operational Depth</p>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{farmer.experience_years} Years Active</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card className="lg:w-96 bg-gray-900 rounded-[40px] p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md"><Globe className="w-8 h-8" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Sync Status</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Total Managed Infrastructure</p>
              <p className="text-6xl font-black tracking-tighter">{farms.length} <span className="text-2xl text-indigo-400">UNITS</span></p>
            </div>
            <div className="space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security Clearance</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Level 4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">System Priority</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Standard</span>
              </div>
            </div>
          </div>
          <Button className="w-full py-6 mt-10 bg-indigo-600 hover:bg-white hover:text-indigo-600 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20">
            Update Clearance
          </Button>
        </Card>
      </div>

      {/* Farm Grid */}
      <div className="space-y-8 pt-10 border-t border-gray-100">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Facility <span className="text-gray-400">Nodes</span></h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Active operational sectors mapped to this operator.</p>
          </div>
        </div>

        {farms.length === 0 ? (
          <Card className="bg-white border border-gray-100 rounded-[40px] p-20 text-center shadow-lg shadow-gray-200/10">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200"><Warehouse className="w-10 h-10" /></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Node grid is empty</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {farms.map((farm) => (
              <Card key={farm.id} className="group bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/10 hover:-translate-y-2 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-40 group-hover:scale-125 transition-transform"><MoreVertical className="w-5 h-5 text-gray-300" /></div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all"><Warehouse className="w-8 h-8" /></div>
                    <div className={`px-3 py-1 rounded-xl border text-[8px] font-black uppercase tracking-widest ${farm.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                      {farm.status}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{farm.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">
                      <MapPin className="w-3.5 h-3.5" />
                      {farm.location}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[10px] font-black text-gray-700">{farm.batches_count || 0} BATCHES</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] font-black text-gray-700">{farm.devices_count || 0} NODES</span>
                    </div>
                  </div>

                  <Link to={`/admin/farms/${farm.id}`} className="mt-8 w-full py-4 bg-gray-50 group-hover:bg-gray-900 group-hover:text-white rounded-2xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                    Access Control Unit
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FarmerDetail;
