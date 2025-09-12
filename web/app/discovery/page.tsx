'use client'

import React, { useEffect } from 'react';
import { useDiscoveryStore } from '../../store/discoveryStore';
import { KnowledgeDisplay } from '../../components/discovery/KnowledgeDisplay';
import { SimpleQuiz } from '../../components/discovery/SimpleQuiz';
import { BasicInterestMap } from '../../components/discovery/BasicInterestMap';

export default function DiscoveryPage() {
  const {
    todayKnowledge,
    currentQuiz,
    interestMapData,
    isLoading,
    error,
    loadTodayKnowledge,
    loadInterestMap
  } = useDiscoveryStore();

  useEffect(() => {
    loadTodayKnowledge();
    loadInterestMap();
  }, [loadTodayKnowledge, loadInterestMap]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
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
            onClick={() => {
              loadTodayKnowledge();
              loadInterestMap();
            }}
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
            学習発見・興味拡張
          </h1>
          <p className="text-gray-600">
            新しい知識との出会いを通じて、学習意欲を高めましょう
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 今日の豆知識 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📚 今日の豆知識
            </h2>
            {todayKnowledge ? (
              <KnowledgeDisplay knowledge={todayKnowledge} />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">豆知識を読み込み中...</p>
              </div>
            )}
          </div>

          {/* 週次クイズ */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🧠 週次クイズ
            </h2>
            {currentQuiz ? (
              <SimpleQuiz
                quiz={currentQuiz}
                onAnswer={(result) => {
                  // クイズ完了時の処理
                  console.log('Quiz completed:', result);
                }}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">クイズを読み込み中...</p>
                <button
                  onClick={() => {
                    // クイズ読み込み処理
                  }}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  クイズに挑戦
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 興味マップ */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🗺️ 興味マップ
          </h2>
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
        </div>
      </div>
    </div>
  );
}
