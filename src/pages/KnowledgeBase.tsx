import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface Recommendation {
  id: number;
  title: string;
  category: string;
  content: string;
}

interface Breed {
  id: number;
  name: string;
  description: string;
  characteristics: string;
}

export function KnowledgeBase() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
    fetchBreeds();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/recommendations/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRecommendations(response.data);
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations');
    }
  };

  const fetchBreeds = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/breeds/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBreeds(response.data);
    } catch (err: any) {
      console.error('Error fetching breeds:', err);
      setError('Failed to load breeds');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Knowledge Base</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recommendations</h2>
        <div className="grid gap-4">
          {recommendations.length === 0 ? (
            <p>No recommendations available.</p>
          ) : (
            recommendations.map((rec) => (
              <div key={rec.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-lg">{rec.title}</h3>
                <p className="text-sm text-gray-600">{rec.category}</p>
                <p className="mt-2">{rec.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Chicken Breeds</h2>
        <div className="grid gap-4">
          {breeds.length === 0 ? (
            <p>No breeds available.</p>
          ) : (
            breeds.map((breed) => (
              <div key={breed.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-lg">{breed.name}</h3>
                <p className="mt-2">{breed.description}</p>
                <p className="text-sm text-gray-600 mt-2">{breed.characteristics}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}