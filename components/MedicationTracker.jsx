"use client";

// components/MedicationTracker.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import TaskCard from '@/components/TaskCard';

export default function MedicationTracker({ tasks = [], onUpdateTask, onDeleteTask }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCompleted, setShowCompleted] = useState(false);
  const router = useRouter();
  const { isDark } = useTheme();

  // Safe function wrappers
  const safeUpdateTask = (updatedTask) => {
    if (typeof onUpdateTask === 'function') {
      onUpdateTask(updatedTask);
    } else {
      console.warn('onUpdateTask is not available');
      const updatedTasks = tasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      );
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const safeDeleteTask = (taskId) => {
    if (typeof onDeleteTask === 'function') {
      onDeleteTask(taskId);
    } else {
      console.warn('onDeleteTask is not available');
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      checkReminders();
    }, 60000);

    return () => clearInterval(timer);
  }, [tasks]);

  const checkReminders = () => {
    const now = new Date();
    const currentTimeString = now.toTimeString().slice(0, 5);

    tasks.forEach(task => {
      if (task.isActive && !isCompletedToday(task)) {
        task.times?.forEach(time => {
          if (time === currentTimeString) {
            showNotification(task);
          }
        });
      }
    });
  };

  const showNotification = (task) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`💊 Medication Reminder: ${task.title}`, {
        body: `Time to take your ${task.title}`,
        icon: '/favicon.ico',
        tag: task.id
      });
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const isCompletedToday = (task) => {
    const today = new Date().toDateString();
    return task.completed?.some(completion =>
      new Date(completion.timestamp).toDateString() === today
    ) || false;
  };

  const isTimeForMedication = (task) => {
    const now = new Date();
    const currentTimeString = now.toTimeString().slice(0, 5);
    return task.times?.some(time => time === currentTimeString) || false;
  };

  const markAsCompleted = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = {
        ...task,
        completed: [
          ...(task.completed || []),
          {
            timestamp: new Date().toISOString(),
            date: new Date().toDateString()
          }
        ]
      };
      safeUpdateTask(updatedTask);
    }
  };

  const markAsIncomplete = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const today = new Date().toDateString();
      const updatedCompleted = (task.completed || []).filter(completion =>
        new Date(completion.timestamp).toDateString() !== today
      );
      safeUpdateTask({ ...task, completed: updatedCompleted });
    }
  };

  const remindLater = (taskId) => {
    console.log(`Will remind about task ${taskId} later`);
  };

  const deleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this medication task?')) {
      safeDeleteTask(taskId);
    }
  };

  const getNextReminderTime = (task) => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    if (!task.times || task.times.length === 0) return 'No times set';

    for (const time of task.times) {
      if (time > currentTime) {
        return time;
      }
    }
    return task.times[0];
  };

  const activeTasks = tasks.filter(task => task.isActive);
  const completedTasksToday = activeTasks.filter(task => isCompletedToday(task));
  const pendingTasks = activeTasks.filter(task => !isCompletedToday(task));

  return (
    <div className="space-y-6">
      {/* Header - FIXED: Ensure proper text colors */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Medication Tracker
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your daily medications and reminders
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={requestNotificationPermission}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Enable Notifications
          </button>
          <button
            onClick={() => router.push('/medication-parser')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Add Medications
          </button>
        </div>
      </div>

      {/* Current Time */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl text-center">
        <div className="text-sm opacity-80">Current Time</div>
        <div className="text-3xl font-bold mt-2">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-sm opacity-80 mt-1">
          {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Pending Medications - FIXED: Explicit text colors */}
      <div className={`rounded-2xl shadow-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Pending Medications
          </h3>
          <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-800'
            }`}>
            {pendingTasks.length} pending
          </span>
        </div>

        {pendingTasks.length > 0 ? (
          <div className="space-y-4">
            {pendingTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={safeUpdateTask}
                onDelete={safeDeleteTask}
                onRemindLater={remindLater}
                isTimeForMedication={isTimeForMedication(task)}
                nextReminderTime={getNextReminderTime(task)}
                showActionButtons={true}
                compact={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              All medications completed for today!
            </p>
          </div>
        )}
      </div>

      {/* Completed Medications - FIXED: Explicit text colors */}
      <div className={`rounded-2xl shadow-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Completed Today
          </h3>
          <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
            }`}>
            {completedTasksToday.length} completed
          </span>
        </div>

        {completedTasksToday.length > 0 ? (
          <div className="space-y-3">
            {completedTasksToday.map(task => (
              <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
                }`}>
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl ${isDark ? 'text-green-400' : 'text-green-600'}`}>✅</div>
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {task.title}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Completed at {task.completed && task.completed.length > 0
                        ? new Date(task.completed[task.completed.length - 1].timestamp).toLocaleTimeString()
                        : 'Unknown time'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => markAsIncomplete(task.id)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Mark Incomplete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No medications completed yet today
          </p>
        )}
      </div>

      {/* Medication Management - FIXED: Explicit text colors */}
      <div className={`rounded-2xl shadow-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Manage Medications
          </h3>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {showCompleted ? 'Hide Completed' : 'Show All'}
          </button>
        </div>

        <div className="space-y-3">
          {(showCompleted ? tasks : activeTasks).map(task => (
            <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {task.type === 'supplement' ? '🌿' : '💊'}
                </div>
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.times?.join(', ') || 'No times set'}
                    </span>
                    {!task.isActive && (
                      <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'
                        }`}>
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => safeUpdateTask({ ...task, isActive: !task.isActive })}
                  className={`px-4 py-2 rounded-lg transition-colors ${task.isActive
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                  {task.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💊</div>
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No medications added yet
            </p>
            <button
              onClick={() => router.push('/medication-parser')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
            >
              Add Medications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
