import { useEffect, useState, useCallback, useMemo } from 'react';
import { farmersApi } from '../../lib/api';
import {
  Eye,
  CheckCircle,
  XCircle,
  Search,
  UserCheck,
  ShieldCheck,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  ChevronRight,
  MoreVertical,
  Filter,
  Users,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../components/ui/toast';
import { Card } from '../../components/ui/card';

interface FarmerWithUser {
  id: string;
  user_id: string;
  business_name: string | null;
  location: string | null;
  phone_number: string | null;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  experience_years: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    role: string;
  };
}

export function FarmersManagement() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [farmers, setFarmers] = useState<FarmerWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFarmers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await farmersApi.getAll();
      if (error) throw new Error(error);

      const farmersData: FarmerWithUser[] = (data || []).map((p: any) => ({
        id: p.id,
        user_id: p.user?.id,
        business_name: p.business_name,
        location: p.location,
        phone_number: p.user?.phone || p.phone_number,
        verification_status: p.verification_status || 'PENDING',
        experience_years: p.experience_years || 0,
        created_at: p.created_at,
        updated_at: p.updated_at,
        user: {
          id: p.user?.id,
          email: p.user?.email,
          full_name: p.user?.full_name || p.user?.email,
          phone: p.user?.phone,
          role: p.user?.role,
        },
      }));

      setFarmers(farmersData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  const verifyFarmer = async (farmerId: string) => {
    toast({ title: 'Operator credentials verified.' });
    fetchFarmers();
  };

  const unverifyFarmer = async (farmerId: string) => {
    toast({ title: 'Access permissions restricted.' });
    fetchFarmers();
  };

  const filteredFarmers = useMemo(() => farmers.filter((farmer) =>
    farmer.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (farmer.business_name && farmer.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [farmers, searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Operator Matrix Synchronizing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Human Resource Ledger</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            Operator <span className="text-gray-400">Registry</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg leading-relaxed">Management and verification of global unit controllers.</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active Pool</span>
              <span className="text-xl font-black text-gray-900">{farmers.length} Units</span>
            </div>
            <div className="w-px h-8 bg-gray-100"></div>
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Pending Sync</span>
              <span className="text-xl font-black text-emerald-600">{farmers.filter(f => f.verification_status === 'PENDING').length} Units</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Search & Actions */}
      <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/40">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search operator ID, email, or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-500/10 text-lg font-bold transition-all outline-none"
            />
          </div>
          <button className="px-10 py-6 bg-gray-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center gap-3">
            <Filter className="w-4 h-4" />
            Advanced Parameters
          </button>
        </div>
      </Card>

      {/* Ledger Table */}
      <Card className="bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Operator Identity</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Enterprise Entity</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Strategic Location</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Status</th>
                <th className="px-10 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Sequence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredFarmers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Users className="w-12 h-12 text-gray-100" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No operator matching criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFarmers.map((farmer) => (
                  <tr key={farmer.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                          {farmer.user.full_name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{farmer.user.full_name}</p>
                          <p className="text-[10px] font-bold text-gray-400">{farmer.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-sm font-black text-gray-700 uppercase tracking-tighter">{farmer.business_name || 'UNLISTED'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-sm font-bold text-gray-600 uppercase tracking-tight">{farmer.location || 'UNDISCLOSED'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-sm font-black text-gray-800">{farmer.experience_years} Cycles</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[8px] font-black uppercase tracking-widest ${farmer.verification_status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : farmer.verification_status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${farmer.verification_status === 'VERIFIED' ? 'bg-emerald-500' :
                            farmer.verification_status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'
                          } ${farmer.verification_status === 'PENDING' && 'animate-pulse'}`}></div>
                        {farmer.verification_status}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/farmers/${farmer.id}`}
                          className="p-3 bg-white text-gray-400 hover:text-indigo-600 rounded-xl shadow-sm border border-gray-50 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {farmer.verification_status !== 'VERIFIED' ? (
                          <button
                            onClick={() => verifyFarmer(farmer.id)}
                            className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl shadow-sm border border-emerald-100 transition-all font-black text-[10px]"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => unverifyFarmer(farmer.id)}
                            className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm border border-rose-100 transition-all font-black text-[10px]"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default FarmersManagement;
