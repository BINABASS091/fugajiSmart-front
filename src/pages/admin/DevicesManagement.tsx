import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  Activity,
  WifiOff,
  Wifi,
  Cpu,
  ChevronRight,
  Filter,
  Layers,
  Zap,
  Clock,
  ShieldCheck,
  X,
  MoreVertical,
  Activity as Heartbeat,
  Terminal,
  Server
} from 'lucide-react';
import { useConfirm } from '../../hooks/useConfirm';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { devicesApi } from '../../lib/api';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/+$/, '');

interface Device {
  id: string;
  device_name: string;
  serial_number: string;
  device_type: string;
  status: string;
  farm_id: string;
  batch_id?: string | null;
  last_online?: string;
  firmware_version?: string | null;
  installation_date: string;
  notes?: string | null;
  farm?: { name?: string; farmer?: { user?: { full_name?: string } } };
  batch?: { batch_number?: string };
}

interface BatchRef {
  id: string;
  batch_number: string;
}

interface FarmRef {
  id: string;
  name: string;
}

interface DeviceFormData {
  device_name: string;
  serial_number: string;
  device_type: string;
  status: string;
  farm_id: string;
  batch_id: string;
  firmware_version: string;
  installation_date: string;
  notes: string;
}

export function DevicesManagement() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [devices, setDevices] = useState<Device[]>([]);
  const [farms, setFarms] = useState<FarmRef[]>([]);
  const [batches, setBatches] = useState<BatchRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<DeviceFormData>({
    device_name: '',
    serial_number: '',
    device_type: 'TEMPERATURE_SENSOR',
    status: 'ACTIVE',
    farm_id: '',
    batch_id: '',
    firmware_version: '',
    installation_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const safeJson = async (res: Response) => {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return null; }
  };

  const fetchDevices = useCallback(async () => {
    try {
      const res = await devicesApi.getAll();
      if (res.error) throw new Error(res.error);
      const data = res.data as any;
      const items = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setDevices(items);
    } catch (e: any) {
      setError(e.message || 'Failed to load devices');
    }
  }, []);

  const fetchFarms = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/farms/`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Farms fetch failed (${res.status})`);
      const data = (await safeJson(res)) as any;
      const items = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setFarms(items.map((f: any) => ({ id: f.id, name: f.name })));
    } catch (e: any) {
      console.error(e);
    }
  }, []);

  const fetchBatches = async (farmId: string) => {
    if (!farmId) { setBatches([]); return; }
    try {
      const res = await fetch(`${API_URL}/batches/?farm=${encodeURIComponent(farmId)}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Batches fetch failed (${res.status})`);
      const data = (await safeJson(res)) as any;
      const items = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setBatches(items.map((b: any) => ({ id: b.id, batch_number: b.batch_number || b.name })));
    } catch (e) {
      console.error(e);
      setBatches([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchDevices(), fetchFarms()]);
      setLoading(false);
    })();
  }, [fetchDevices, fetchFarms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      device_name: formData.device_name.trim(),
      serial_number: formData.serial_number.trim(),
      device_type: formData.device_type,
      status: formData.status,
      farm_id: formData.farm_id,
      batch_id: formData.batch_id || null,
      firmware_version: formData.firmware_version || null,
      installation_date: formData.installation_date,
      notes: formData.notes || null,
    };
    try {
      let res;
      if (editingDevice) {
        res = await devicesApi.update(editingDevice.id, payload);
      } else {
        res = await devicesApi.create(payload);
      }
      if (res.error) throw new Error(res.error);
      setShowModal(false);
      setEditingDevice(null);
      resetForm();
      await fetchDevices();
    } catch (e: any) {
      setError(e.message || 'Failed to sync device');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Terminate Node Link',
      message: 'This will physically disconnect the IoT node from the grid and purge its telemetry history. Proceed?',
      variant: 'danger',
      confirmText: 'Terminate Link',
      cancelText: 'Abort'
    });
    if (!confirmed) return;
    try {
      const res = await devicesApi.delete(id);
      if (res.error) throw new Error(res.error);
      await fetchDevices();
    } catch (e: any) {
      setError(e.message || 'Termination failed');
    }
  };

  const openEditModal = (device: Device) => {
    setEditingDevice(device);
    setFormData({
      device_name: device.device_name,
      serial_number: device.serial_number,
      device_type: device.device_type,
      status: device.status,
      farm_id: device.farm_id,
      batch_id: device.batch_id || '',
      firmware_version: device.firmware_version || '',
      installation_date: device.installation_date,
      notes: device.notes || '',
    });
    fetchBatches(device.farm_id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ device_name: '', serial_number: '', device_type: 'TEMPERATURE_SENSOR', status: 'ACTIVE', farm_id: '', batch_id: '', firmware_version: '', installation_date: new Date().toISOString().split('T')[0], notes: '' });
    setBatches([]);
  };

  const handleFarmChange = (farmId: string) => {
    setFormData({ ...formData, farm_id: farmId, batch_id: '' });
    fetchBatches(farmId);
  };

  const filteredDevices = useMemo(() => devices.filter(d => {
    const q = searchTerm.toLowerCase();
    return (d.device_name?.toLowerCase().includes(q) || d.serial_number?.toLowerCase().includes(q) || d.farm?.name?.toLowerCase().includes(q));
  }), [devices, searchTerm]);

  const stats = useMemo(() => ({
    total: devices.length,
    online: devices.filter(d => ['ACTIVE', 'ONLINE'].includes(d.status)).length,
    critical: devices.filter(d => ['FAULTY', 'ERROR'].includes(d.status)).length,
    maintenance: devices.filter(d => d.status === 'MAINTENANCE').length
  }), [devices]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">IoT Surveillance Matrix Initializing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      <ConfirmDialog />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Electronic Surveillance Hub</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            IoT <span className="text-gray-400">Control</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg leading-relaxed">Centralized oversight of all distributed hardware modules.</p>
        </div>
        <button
          onClick={() => { setEditingDevice(null); resetForm(); setShowModal(true); }}
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3"
        >
          <Plus className="w-4 h-4" />
          Deploy Node
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Server className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-mono">Total Nodes</span>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.total} Modules</p>
        </Card>
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Wifi className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest font-mono">Encrypted Link</span>
          </div>
          <p className="text-4xl font-black text-emerald-600 tracking-tighter">{stats.online} Live</p>
        </Card>
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><WifiOff className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest font-mono">Link Severed</span>
          </div>
          <p className="text-4xl font-black text-rose-600 tracking-tighter">{stats.critical} Critical</p>
        </Card>
        <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/20 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Heartbeat className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest font-mono">Protocol Refactor</span>
          </div>
          <p className="text-4xl font-black text-amber-600 tracking-tighter">{stats.maintenance} Cycles</p>
        </Card>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-fadeIn">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/40">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search module name, serial specification, or facility..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-500/10 text-lg font-bold transition-all outline-none"
            />
          </div>
          <Button className="px-10 py-6 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-3xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
            <Filter className="w-4 h-4" />
            Logic Filters
          </Button>
        </div>
      </Card>

      {/* Hardware Registry Table */}
      <Card className="bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Hardware Module</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Schema Type</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Facility Mapping</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Link</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Pulse Status</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Revision</th>
                <th className="px-10 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Sequence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Terminal className="w-12 h-12 text-gray-100" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No hardware nodes detected in range</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDevices.map((d) => (
                  <tr key={d.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center font-black shadow-sm transition-transform group-hover:scale-110 ${['FAULTY', 'ERROR'].includes(d.status) ? 'text-rose-500' : 'text-indigo-600'}`}>
                          <Cpu className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{d.device_name}</p>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono">SPEC: {d.serial_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[8px] font-black uppercase tracking-widest">{d.device_type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-700 uppercase tracking-tight leading-none mb-1">{d.farm?.name || 'Unmapped'}</span>
                        <span className="text-[10px] font-bold text-indigo-600">{d.farm?.farmer?.user?.full_name || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {d.batch?.batch_number ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
                          <Layers className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black">{d.batch.batch_number}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Global Scan</span>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest ${['ACTIVE', 'ONLINE'].includes(d.status) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          d.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${['ACTIVE', 'ONLINE'].includes(d.status) ? 'bg-emerald-500' : d.status === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-rose-500'} animate-pulse`}></div>
                        {d.status}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">{d.firmware_version || 'v1.0.0-PRO'}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(d)} className="p-3 bg-white hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm border border-gray-50 transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(d.id)} className="p-3 bg-white hover:bg-rose-600 hover:text-white rounded-xl shadow-sm border border-gray-50 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Deployment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <Card className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl animate-scaleIn border-none overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-10 pb-6 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Cpu className="w-6 h-6" /></div>
                <h2 className="text-3xl font-black text-gray-900 uppercase">{editingDevice ? 'Recalibrate Node' : 'Deploy Hardware'}</h2>
              </div>
              <button onClick={() => { setShowModal(false); setEditingDevice(null); resetForm(); }} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 pt-8 overflow-y-auto space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Module Identity</Label>
                    <Input value={formData.device_name} onChange={(e) => setFormData({ ...formData, device_name: e.target.value })} required className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold" placeholder="e.g., Thermal Node B2" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Serial Specification</Label>
                    <Input value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} required className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-[10px] font-black uppercase tracking-widest" placeholder="SN-XXXX-XXXX" />
                  </div>
                </div>
                <div className="space-y-8">
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logical Status</Label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-[10px] font-black uppercase tracking-widest outline-none mt-2 transition-all">
                      <option value="ACTIVE">Authorized (Active)</option>
                      <option value="MAINTENANCE">Maintenance Mode</option>
                      <option value="FAULTY">Fault Injection (Faulty)</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hardware Schema</Label>
                    <select required value={formData.device_type} onChange={(e) => setFormData({ ...formData, device_type: e.target.value })} className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-[10px] font-black uppercase tracking-widest outline-none mt-2 transition-all">
                      <option value="TEMPERATURE_SENSOR">Temperature Node</option>
                      <option value="HUMIDITY_SENSOR">Hydration Node</option>
                      <option value="AIR_QUALITY">Atmospheric Node</option>
                      <option value="FEEDER">Automated Feeder</option>
                      <option value="CAMERA">Vision System</option>
                      <option value="CONTROLLER">Mainframe Controller</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Facility Grid Mapping</Label>
                  <select required value={formData.farm_id} onChange={(e) => handleFarmChange(e.target.value)} className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-[10px] font-black uppercase tracking-widest outline-none mt-2 transition-all">
                    <option value="">Select Target Facility...</option>
                    {farms.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Linkage (Optional)</Label>
                  <select value={formData.batch_id} onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })} disabled={!formData.farm_id} className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-[10px] font-black uppercase tracking-widest outline-none mt-2 transition-all disabled:opacity-50">
                    <option value="">Global Surveillance</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.batch_number}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Firmware Revision</Label>
                  <Input value={formData.firmware_version} onChange={(e) => setFormData({ ...formData, firmware_version: e.target.value })} className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-[10px] font-black uppercase tracking-widest" placeholder="v2.1.0-STABLE" />
                </div>
                <div>
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initialization Date</Label>
                  <Input type="date" required value={formData.installation_date} onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })} className="py-7 mt-2 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold" />
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">System Logs / Notes</Label>
                <textarea className="w-full px-8 py-6 bg-gray-50 border-none rounded-3xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold mt-2 outline-none transition-all min-h-[120px]" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Operational parameters or deployment quirks..." />
              </div>

              <Button type="submit" className="w-full py-8 bg-gray-900 border-none hover:bg-black text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-1">
                {editingDevice ? 'Commit Re-Calibration' : 'Initialize Hardware Link'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default DevicesManagement;
