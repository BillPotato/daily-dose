"use client";

// components/Dashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import MedicationTracker from '@/components/MedicationTracker';
import { useTheme } from '@/contexts/ThemeContext';
import InteractiveStatBox from '@/components/InteractiveMoodbox';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CHART_WINDOW_SIZE = 7;
const MOCK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MOCK_SERIES = {
  mood: [1, 5, 2, 5, 2, 4, 1],
  pain: [2, 9, 1, 8, 3, 7, 2],
  exercise: [20, 85, 15, 90, 30, 80, 25],
  sleep: [2, 5, 1, 5, 2, 4, 1],
};

export default function Dashboard({ tasks = [], onUpdateTask, onDeleteTask }) {
  const [surveys, setSurveys] = useState([]);
  const [chartType, setChartType] = useState('mood');
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const { isDark } = useTheme();

  const user =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('surveys') || '[]');
    setSurveys(s);
  }, []);

  const stats = useMemo(() => {
    const totalSurveys = surveys.length;
    const avgMood = surveys.length > 0
      ? (surveys.reduce((sum, s) => sum + Number(s.answers.mood || 0), 0) / surveys.length).toFixed(1)
      : 0;
    const avgPain = surveys.length > 0
      ? (surveys.reduce((sum, s) => sum + Number(s.answers.pain || 0), 0) / surveys.length).toFixed(1)
      : 0;
    const avgExercise = surveys.length > 0
      ? (surveys.reduce((sum, s) => sum + Number(s.answers.exercise || 0), 0) / surveys.length).toFixed(0)
      : 0;
    const avgSleep = surveys.length > 0
      ? (surveys.reduce((sum, s) => sum + Number(s.answers.sleep || 0), 0) / surveys.length).toFixed(1)
      : 0;

    return { totalSurveys, avgMood, avgPain, avgExercise, avgSleep };
  }, [surveys]);

  const chartData = useMemo(() => {
    const sortedSurveys = [...surveys].sort((a, b) => new Date(a.date) - new Date(b.date));
    let labels = [...MOCK_LABELS];
    let data = [...(MOCK_SERIES[chartType] || MOCK_SERIES.mood)];

    sortedSurveys.forEach((survey) => {
      const label = new Date(survey.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const value = (() => {
        switch (chartType) {
          case 'mood': return Number(survey.answers.mood || 0);
          case 'pain': return Number(survey.answers.pain || 0);
          case 'exercise': return Number(survey.answers.exercise || 0);
          case 'sleep': return Number(survey.answers.sleep || 0);
          default: return 0;
        }
      })();

      labels = [...labels.slice(1), label];
      data = [...data.slice(1), value];
    });

    labels = labels.slice(-CHART_WINDOW_SIZE);
    data = data.slice(-CHART_WINDOW_SIZE);

    const chartConfig = {
      mood: {
        label: 'Mood Level',
        color: '#065f46',
        bgColor: 'rgba(6, 95, 70, 0.05)',
        max: 5
      },
      pain: {
        label: 'Pain Level',
        color: '#065f46',
        bgColor: 'rgba(6, 95, 70, 0.05)',
        max: 10
      },
      exercise: {
        label: 'Exercise (minutes)',
        color: '#065f46',
        bgColor: 'rgba(6, 95, 70, 0.05)',
        max: Math.max(...data, 60)
      },
      sleep: {
        label: 'Sleep Quality',
        color: '#065f46',
        bgColor: 'rgba(6, 95, 70, 0.05)',
        max: 5
      }
    };

    const config = chartConfig[chartType];

    return {
      labels,
      datasets: [
        {
          label: config.label,
          data,
          borderColor: config.color,
          backgroundColor: config.bgColor,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: config.color,
          pointBorderColor: isDark ? '#252A27' : '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        }
      ]
    };
  }, [surveys, chartType, isDark]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 700,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Your ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Trend`,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: isDark ? '#F1F3F2' : '#1f2937'
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(37, 42, 39, 0.96)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#F1F3F2' : '#1f2937',
        bodyColor: isDark ? '#D9DDDC' : '#4b5563',
        borderColor: isDark ? '#4B5A54' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: chartData.datasets[0]?.data.length > 0 ? Math.max(...chartData.datasets[0].data) * 1.1 : 10,
        border: {
          display: false,
        },
        grid: {
          color: 'rgba(0,0,0,0.03)'
        },
        ticks: {
          color: isDark ? '#D9DDDC' : '#57534e'
        }
      },
      x: {
        border: {
          display: false,
        },
        grid: {
          color: 'rgba(0,0,0,0.03)'
        },
        ticks: {
          color: isDark ? '#D9DDDC' : '#57534e'
        }
      }
    }
  };

  const ChartTypeButton = ({ type, label, icon, isActive }) => (
    <button
      onClick={() => setChartType(type)}
      className={`flex items-center space-x-3 rounded-full px-6 py-4 transition-all duration-300 ${isActive
        ? 'bg-emerald-800 text-white shadow-md'
        : `${isDark
          ? 'bg-stone-800 text-stone-200 hover:bg-stone-700'
          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
        }`
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  const TabButton = ({ tab, label, icon, isActive }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-3 rounded-full px-7 py-4 font-semibold transition-all ${isActive
        ? 'bg-emerald-800 text-white shadow-md'
        : `${isDark
          ? 'bg-stone-800 text-stone-200 hover:bg-stone-700'
          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
        }`
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-16 pt-8">
      {/* Welcome Section - Simplified without header elements */}
      <div className="space-y-4 text-center">
        <h1 className="text-5xl font-semibold text-emerald-950 dark:text-[#F1F3F2] md:text-6xl">
          Welcome back, {user.name || 'there'}!
        </h1>
        <p className="text-lg text-stone-600 dark:text-stone-300">Here's your health overview for today</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-4">
        <TabButton
          tab="overview"
          label="Overview"
          icon="📊"
          isActive={activeTab === 'overview'}
        />
        <TabButton
          tab="medications"
          label="Medications"
          icon="💊"
          isActive={activeTab === 'medications'}
        />
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' ? (
        <>
          {/* Stats Grid - ALL CARDS ARE NOW INTERACTIVE */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <InteractiveStatBox
              title="Total Surveys"
              value={stats.totalSurveys}
              subtitle="This month"
              icon="📊"
              type="surveys"
            />

            <InteractiveStatBox
              title="Average Mood"
              value={stats.avgMood}
              subtitle="Out of 5"
              icon="😊"
              type="mood"
              additionalData={{ exercise: stats.avgExercise }}
            />

            <InteractiveStatBox
              title="Average Pain"
              value={stats.avgPain}
              subtitle="Out of 10"
              icon="🎯"
              type="pain"
            />

            <InteractiveStatBox
              title="Avg Exercise"
              value={`${stats.avgExercise}`}
              subtitle="Minutes daily"
              icon="💪"
              type="exercise"
              additionalData={{ surveys: stats.totalSurveys }}
            />
          </div>

          {/* Chart Section */}
          <div className={`${isDark ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-stone-200'} rounded-[2rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]`}>
            <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-stone-100' : 'text-emerald-950'
                } mb-4 lg:mb-0`}>Health Trends</h2>

              {/* Chart Type Selector */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <ChartTypeButton
                  type="mood"
                  label="Mood"
                  icon="😊"
                  isActive={chartType === 'mood'}
                />
                <ChartTypeButton
                  type="pain"
                  label="Pain"
                  icon="🎯"
                  isActive={chartType === 'pain'}
                />
                <ChartTypeButton
                  type="exercise"
                  label="Exercise"
                  icon="💪"
                  isActive={chartType === 'exercise'}
                />
                <ChartTypeButton
                  type="sleep"
                  label="Sleep"
                  icon="😴"
                  isActive={chartType === 'sleep'}
                />
              </div>
            </div>

            <div className="h-[24rem]">
              <Line data={chartData} options={chartOptions} />
              {surveys.length === 0 && (
                <p className="mt-3 text-center text-sm text-stone-500 dark:text-stone-300">
                  Showing sample trend data. Complete a survey to replace it with your own.
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions & Tasks */}
          <div className="grid grid-cols-1 gap-16 xl:grid-cols-3">
            {/* Tasks Section */}
            <div className="xl:col-span-2 space-y-12">
              {/* Tasks Card */}
              <div className={`${isDark ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-stone-200'} rounded-[2rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold ${isDark ? 'text-stone-100' : 'text-emerald-950'
                    }`}>Medication Tasks</h3>
                  <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                    {tasks.filter(task => task.isActive).length} active tasks
                  </span>
                </div>

                {tasks.filter(task => task.isActive).length > 0 ? (
                  <div className="space-y-6">
                    {tasks.filter(task => task.isActive).slice(0, 5).map((task) => (
                      <div key={task.id} className={`flex items-center justify-between rounded-[1.5rem] p-6 transition-all duration-300 hover:shadow-md ${isDark
                        ? 'bg-stone-800 border border-stone-700'
                        : 'bg-stone-50 border border-stone-200 hover:-translate-y-1'
                        }`}>
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${task.completed && task.completed.some(comp => new Date(comp.timestamp).toDateString() === new Date().toDateString())
                            ? 'bg-emerald-700'
                            : 'bg-stone-400'
                            }`}></div>
                          <div>
                            <span className={`font-medium ${isDark ? 'text-stone-100' : 'text-stone-800'
                              }`}>{task.title}</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs ${isDark ? 'text-stone-300' : 'text-stone-500'
                                }`}>
                                {task.times?.join(', ') || 'No times set'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 text-xs rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                            {task.frequency}
                          </span>
                          {task.completed && task.completed.some(comp => new Date(comp.timestamp).toDateString() === new Date().toDateString()) && (
                            <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {tasks.filter(task => task.isActive).length > 5 && (
                      <p className={`text-center text-sm mt-4 ${isDark ? 'text-stone-300' : 'text-stone-500'
                        }`}>
                        +{tasks.filter(task => task.isActive).length - 5} more tasks
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">💊</div>
                    <p className={`mb-4 ${isDark ? 'text-stone-300' : 'text-stone-500'
                      }`}>No medication tasks yet</p>
                    <button
                      onClick={() => router.push('/medication-parser')}
                      className="rounded-full bg-emerald-800 px-8 py-4 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-900 hover:shadow-lg"
                    >
                      Add Medications
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Surveys */}
              <div className={`${isDark ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-stone-200'} rounded-[2rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]`}>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-stone-100' : 'text-emerald-950'
                  } mb-6`}>Recent Surveys</h3>
                {surveys.slice(0, 5).map((survey) => (
                  <div key={survey.id} className={`flex items-center justify-between py-4 border-b ${isDark ? 'border-stone-700' : 'border-stone-200'
                    } last:border-0`}>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-stone-100' : 'text-stone-800'
                        }`}>
                        {new Date(survey.date).toLocaleDateString()}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-stone-300' : 'text-stone-600'
                        }`}>
                        Mood: {survey.answers.mood}/5 • Pain: {survey.answers.pain}/10
                      </p>
                    </div>
                    <div className="text-2xl">
                      {Number(survey.answers.mood) >= 4 ? '😊' :
                        Number(survey.answers.mood) >= 3 ? '😐' : '😔'}
                    </div>
                  </div>
                ))}
                {surveys.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📝</div>
                    <p className={`mb-4 ${isDark ? 'text-stone-300' : 'text-stone-500'
                      }`}>No surveys completed yet</p>
                    <button
                      onClick={() => router.push('/survey')}
                      className="rounded-full bg-emerald-800 px-8 py-4 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-900 hover:shadow-lg"
                    >
                      Take First Survey
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-10">
              <div className={`${isDark ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-stone-200'} rounded-[2rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]`}>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-stone-100' : 'text-emerald-950'
                  } mb-6`}>Quick Actions</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => router.push('/survey')}
                    className={`w-full flex items-center space-x-4 rounded-[1.5rem] p-6 text-left transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] ${isDark
                      ? 'bg-stone-800 border border-stone-700'
                      : 'bg-stone-50 border border-stone-200 hover:-translate-y-1'
                      }`}
                  >
                    <div className="text-2xl">📝</div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-stone-100' : 'text-stone-800'
                        }`}>Daily Survey</p>
                      <p className={`text-sm ${isDark ? 'text-stone-300' : 'text-stone-600'
                        }`}>Complete your check-in</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/feeling-analyzer')}
                    className={`w-full flex items-center space-x-4 rounded-[1.5rem] p-6 text-left transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] ${isDark
                      ? 'bg-stone-800 border border-stone-700'
                      : 'bg-stone-50 border border-stone-200 hover:-translate-y-1'
                      }`}
                  >
                    <div className="text-2xl">😊</div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-stone-100' : 'text-stone-800'
                        }`}>Feeling Analyzer</p>
                      <p className={`text-sm ${isDark ? 'text-stone-300' : 'text-stone-600'
                        }`}>Get insights</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/medication-parser')}
                    className={`w-full flex items-center space-x-4 rounded-[1.5rem] p-6 text-left transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] ${isDark
                      ? 'bg-stone-800 border border-stone-700'
                      : 'bg-stone-50 border border-stone-200 hover:-translate-y-1'
                      }`}
                  >
                    <div className="text-2xl">💊</div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-stone-100' : 'text-stone-800'
                        }`}>Add Medications</p>
                      <p className={`text-sm ${isDark ? 'text-stone-300' : 'text-stone-600'
                        }`}>Manage your prescriptions</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Health Tips */}
              <div className={`rounded-[2rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] ${isDark
                ? 'bg-stone-900 border border-stone-800'
                : 'bg-white border border-stone-200'
                }`}>
                <h3 className={`font-semibold mb-4 flex items-center text-lg ${isDark ? 'text-stone-100' : 'text-emerald-950'
                  }`}>
                  <span className="text-2xl mr-3">💡</span>
                  Health Tips
                </h3>
                <ul className={`space-y-3 text-sm ${isDark ? 'text-stone-300' : 'text-stone-700'
                  }`}>
                  <li className="flex items-start space-x-3">
                    <span className={`mt-1 text-lg ${isDark ? 'text-emerald-300' : 'text-emerald-700'
                      }`}>•</span>
                    <span className="leading-relaxed">Stay hydrated throughout the day</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className={`mt-1 text-lg ${isDark ? 'text-emerald-300' : 'text-emerald-700'
                      }`}>•</span>
                    <span className="leading-relaxed">Take regular breaks if sitting for long</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className={`mt-1 text-lg ${isDark ? 'text-emerald-300' : 'text-emerald-700'
                      }`}>•</span>
                    <span className="leading-relaxed">Practice deep breathing exercises</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className={`mt-1 text-lg ${isDark ? 'text-emerald-300' : 'text-emerald-700'
                      }`}>•</span>
                    <span className="leading-relaxed">Maintain consistent sleep schedule</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Medications Tab Content */
        <MedicationTracker
          tasks={tasks}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      )}
    </div>
  );
}
