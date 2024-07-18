import React, { useState } from 'react';
import DBpediaVisualization from './DBpediaVisualization';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityData, setEntityData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      // First, fetch the main entity
      const entityResponse = await fetch(
        `http://localhost:8000/api/entity/${searchTerm}`
      );
      if (!entityResponse.ok) {
        throw new Error(`HTTP error! status: ${entityResponse.status}`);
      }
      const entityResult = await entityResponse.json();

      // Then, fetch related entities
      const relatedResponse = await fetch(
        'http://localhost:8000/api/fetch-related-entities',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entityResult),
        }
      );
      if (!relatedResponse.ok) {
        throw new Error(`HTTP error! status: ${relatedResponse.status}`);
      }
      const relatedResult = await relatedResponse.json();

      setEntityData(relatedResult);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Error fetching data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-4'>DBpedia Visual Explorer</h1>
      <div className='mb-4'>
        <input
          type='text'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='border p-2 mr-2'
          placeholder='Enter entity name'
        />
        <button
          onClick={handleSearch}
          className='bg-blue-500 text-white p-2 rounded'
          disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && <p className='text-red-500'>{error}</p>}
      {entityData && <DBpediaVisualization data={entityData} />}
    </div>
  );
};

export default App;
