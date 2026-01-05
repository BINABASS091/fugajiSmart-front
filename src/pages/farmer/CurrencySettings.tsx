import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useToast } from '../../components/ui/toast';
import { Settings, DollarSign, Globe, Save, CheckCircle } from 'lucide-react';

const CurrencySettings: React.FC = () => {
  const { user } = useAuth();
  const { currency, setCurrency, formatCurrency, isLoading } = useCurrency();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  const handleCurrencyChange = async (newCurrency: 'USD' | 'TZS') => {
    setSelectedCurrency(newCurrency);
  };

  const handleSaveCurrency = async () => {
    if (selectedCurrency === currency) {
      toast({
        title: "No changes needed",
        description: "Currency preference is already set to your selection.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await setCurrency(selectedCurrency);
      toast({
        title: "Currency Updated",
        description: `Your currency preference has been updated to ${selectedCurrency}.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update currency preference. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const currencyOptions = [
    {
      code: 'USD' as const,
      name: 'US Dollar',
      symbol: '$',
      description: 'International standard currency',
      example: formatCurrency(100),
    },
    {
      code: 'TZS' as const,
      name: 'Tanzanian Shilling',
      symbol: 'TSh',
      description: 'Local currency for Tanzania',
      example: formatCurrency(100, 'TZS'),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-50 rounded-2xl">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900">Currency Settings</h1>
          <p className="text-gray-500 mt-1">Manage your preferred currency for the application</p>
        </div>
      </div>

      {/* Current Selection */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Currency</h3>
              <p className="text-gray-500">
                {currency === 'USD' ? 'US Dollar ($)' : 'Tanzanian Shilling (TSh)'}
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(1234.56)}
          </div>
        </div>
      </Card>

      {/* Currency Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Your Currency</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currencyOptions.map((option) => (
            <div
              key={option.code}
              onClick={() => handleCurrencyChange(option.code)}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                selectedCurrency === option.code
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {selectedCurrency === option.code && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                  selectedCurrency === option.code ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {option.symbol}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{option.name}</h3>
                  <p className="text-sm text-gray-500">{option.code}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{option.description}</p>
              <div className="text-lg font-mono text-gray-900">
                Example: {option.example}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveCurrency}
          disabled={isUpdating || selectedCurrency === currency}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Updating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </div>
          )}
        </Button>
      </div>

      {/* Information */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">About Currency Settings</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your currency preference will be used throughout the application</li>
              <li>• All prices, costs, and financial values will display in your chosen currency</li>
              <li>• The preference is saved to your profile and syncs across devices</li>
              <li>• Exchange rates are updated regularly for accurate conversions</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CurrencySettings;
