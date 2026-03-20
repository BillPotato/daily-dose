"use client";

// components/InteractiveStatBox.jsx
import { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const InteractiveStatBox = ({
  title,
  value,
  subtitle,
  icon,
  type, // 'surveys', 'mood', 'pain', 'exercise'
  additionalData = {}
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDark } = useTheme();

  const { cardTone, pillTone, message, hoverIcon, tips } = useMemo(() => {
    const configs = {
      surveys: {
        cardTone: isDark
          ? 'bg-[#252A27] border-white/15 shadow-[0_20px_60px_-15px_rgba(4,43,21,0.08)]'
          : 'bg-[#F0F2ED] border-stone-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]',
        pillTone: 'bg-white text-emerald-900',
        hoverIcon: '📊',
        message: `Great consistency! You've completed ${value} surveys this month. Your dedication to tracking helps identify important health patterns.`,
        tips: [
          'Keep tracking daily for better insights',
          'Review your trends weekly',
          'Consistency leads to better health outcomes'
        ]
      },
      mood: {
        cardTone: isDark
          ? 'bg-[#252A27] border-white/15 shadow-[0_20px_60px_-15px_rgba(4,43,21,0.08)]'
          : 'bg-[#E6ECE3] border-stone-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]',
        pillTone: 'bg-white text-emerald-900',
        hoverIcon: parseFloat(value) < 2.5 ? '😔' : parseFloat(value) < 3.5 ? '😊' : '😄',
        message: parseFloat(value) < 2.5
          ? `Your mood could use a boost. ${additionalData.exercise || 0}m of exercise is a good start. Try adding 5 minutes of mindfulness or connecting with friends.`
          : parseFloat(value) < 3.5
            ? `You're maintaining a balanced mood! ${additionalData.exercise || 0}m of daily exercise combined with your current routine is working well.`
            : `Excellent mood levels! Your positive outlook combined with ${additionalData.exercise || 0}m of daily activity shows great wellbeing habits.`,
        tips: parseFloat(value) < 2.5
          ? ['Try a 10-minute walk outside', 'Listen to uplifting music', 'Reach out to a friend']
          : parseFloat(value) < 3.5
            ? ['Practice daily gratitude', 'Maintain social connections', 'Keep active routine']
            : ['Share your positivity', 'Help others feel good', 'Set new wellness goals']
      },
      pain: {
        cardTone: isDark
          ? 'bg-[#252A27] border-white/15 shadow-[0_20px_60px_-15px_rgba(4,43,21,0.08)]'
          : 'bg-[#E8EFEA] border-stone-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]',
        pillTone: 'bg-white text-emerald-900',
        hoverIcon: parseFloat(value) < 3 ? '💚' : parseFloat(value) < 6 ? '💛' : '❤️',
        message: parseFloat(value) < 3
          ? `Excellent pain management! Your current approach is working well. Continue your healthy habits and regular monitoring.`
          : parseFloat(value) < 6
            ? `Moderate discomfort detected. Consider gentle stretching, proper hydration, and discussing patterns with your healthcare provider.`
            : `Higher pain levels noted. Please prioritize rest, consult your healthcare provider, and practice gentle pain management techniques.`,
        tips: parseFloat(value) < 3
          ? ['Maintain current routine', 'Stay well hydrated', 'Regular gentle movement']
          : parseFloat(value) < 6
            ? ['Apply warm compresses', 'Practice deep breathing', 'Gentle yoga stretches']
            : ['Rest when needed', 'Consult healthcare professional', 'Use pain management techniques']
      },
      exercise: {
        cardTone: isDark
          ? 'bg-[#252A27] border-white/15 shadow-[0_20px_60px_-15px_rgba(4,43,21,0.08)]'
          : 'bg-[#F4F1EA] border-stone-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]',
        pillTone: 'bg-white text-emerald-900',
        hoverIcon: parseFloat(value) < 30 ? '💤' : parseFloat(value) < 60 ? '💪' : '🏆',
        message: parseFloat(value) < 30
          ? `Let's build some momentum! Starting with just 10-minute walks can significantly boost your energy, mood, and overall health. Every minute counts!`
          : parseFloat(value) < 60
            ? `Great progress! ${value}m daily is building strong healthy habits. You're on the right track to optimal fitness and wellbeing.`
            : `Outstanding commitment! ${value}m of daily exercise shows excellent dedication to your health. You're setting a fantastic example for long-term wellness.`,
        tips: parseFloat(value) < 30
          ? ['Start with 10min daily walks', 'Try desk stretches every hour', 'Set achievable weekly goals']
          : parseFloat(value) < 60
            ? ['Mix cardio with strength training', 'Try new activities like swimming', 'Track your progress weekly']
            : ['Maintain activity variety', 'Listen to your body for rest', 'Set new fitness challenges']
      }
    };

    return configs[type] || {
      cardTone: isDark
        ? 'bg-[#252A27] border-white/15 shadow-[0_20px_60px_-15px_rgba(4,43,21,0.08)]'
        : 'bg-stone-100 border-stone-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]',
      pillTone: 'bg-white text-stone-700',
      hoverIcon: '📈',
      message: 'Your consistent tracking is building valuable health insights over time!',
      tips: ['Stay consistent with logging', 'Review patterns monthly', 'Celebrate your progress']
    };
  }, [type, value, additionalData, isDark]);

  const ProgressBar = ({ percentage, color }) => (
    <div className={`mt-2 h-2 w-full rounded-full ${isDark ? 'bg-stone-700' : 'bg-stone-200'}`}>
      <div
        className={`h-2 rounded-full transition-all duration-1000 ease-out ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );

  return (
    <div
      className="relative cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Card - Always visible as the base */}
      <div className={`${cardTone} rounded-[1.5rem] border p-6 h-full transition-all duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'
        }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-emerald-900'}`}>{title}</p>
            <p className={`mt-2 text-3xl font-bold ${isDark ? 'text-white' : 'text-emerald-900'}`}>{value}</p>
            <p className={`mt-1 text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{subtitle}</p>
          </div>
          <div className="text-3xl opacity-90">{icon}</div>
        </div>

        {/* Progress Bar for relevant metrics */}
        {type === 'mood' && (
          <ProgressBar
            percentage={(parseFloat(value) / 5) * 100}
            color="bg-emerald-800"
          />
        )}
        {type === 'pain' && (
          <ProgressBar
            percentage={(parseFloat(value) / 10) * 100}
            color="bg-emerald-800"
          />
        )}
        {type === 'exercise' && (
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <span className={isDark ? 'text-stone-400' : 'text-stone-600'}>⏱️</span>
              <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Daily average</span>
            </div>
            {additionalData.surveys && (
              <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{additionalData.surveys} surveys</span>
            )}
          </div>
        )}
        {type === 'surveys' && (
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <span className={isDark ? 'text-stone-400' : 'text-stone-600'}>📅</span>
              <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>This month</span>
            </div>
          </div>
        )}
      </div>

      {/* Hover Overlay - Absolute positioned to overlap content below */}
      <div className={`
        absolute top-0 left-0 right-0 
        rounded-[1.5rem] bg-emerald-900 text-emerald-50 p-6 border border-emerald-800
        transition-all duration-500 ease-out shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]
        min-h-[200px] flex flex-col justify-between
        z-50
        ${isHovered
          ? 'opacity-100 scale-110'  // Expands and overlaps
          : 'opacity-0 scale-95 pointer-events-none'
        }
      `}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{hoverIcon}</span>
              <div>
                <p className="text-lg font-bold">{title}</p>
                <p className="text-sm opacity-80">{value} {subtitle}</p>
              </div>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${pillTone}`}>
              Health Insight
            </span>
          </div>

          <p className="text-sm leading-relaxed font-medium mb-4">
            {message}
          </p>

          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold opacity-90 mb-1">Quick Tips:</p>
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2 text-xs opacity-90">
                <span className="text-emerald-200 mt-0.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs opacity-80 flex items-center justify-center pt-3 border-t border-emerald-800">
          <span className="mr-2">✨</span>
          Personalized insights based on your data
        </div>
      </div>
    </div>
  );
};

export default InteractiveStatBox;
