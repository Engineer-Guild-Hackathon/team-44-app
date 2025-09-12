'use client'

import React, { useEffect } from 'react';
import { useDiscoveryStore } from '../../../store/discoveryStore';
import { BasicInterestMap } from '../../../components/discovery/BasicInterestMap';

export default function MapPage() {
  const { interestMapData, isLoading, error, loadInterestMap } = useDiscoveryStore();

  useEffect(() => {
    loadInterestMap();
  }, [loadInterestMap]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">興味マップを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-800">{error}</p>
          <button
            onClick={() => loadInterestMap()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            興味領域マップ
          </h1>
          <p className="text-gray-600">
            あなたの学習分野を可視化し、新しい興味の発見をサポートします
          </p>
        </div>

        {interestMapData ? (
          <BasicInterestMap
            mapData={interestMapData}
            hasData={interestMapData.hasData}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">興味マップを読み込み中...</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}
