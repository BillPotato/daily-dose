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
    <div className="space-y-10">
      {/* Header - FIXED: Ensure proper text colors */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-semibold ${isDark ? 'text-stone-100' : 'text-emerald-950'}`}>
            Medication Tracker
          </h2>
          <p className={`${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
            Manage your daily medications and reminders
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={requestNotificationPermission}
            className="rounded-full bg-emerald-700 px-8 py-4 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-800 hover:shadow-lg"
          >
            Enable Notifications
          </button>
          <button
            onClick={() => router.push('/medication-parser')}
            className="rounded-full bg-emerald-700 px-8 py-4 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-800 hover:shadow-lg"
          >
            Add Medications
          </button>
        </div>
      </div>

      {/* Current Time */}
      <div className={`${isDark ? 'bg-stone-900 border border-stone-800 text-stone-100' : 'bg-white border border-stone-200 text-emerald-950'} p-8 rounded-[2rem] text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]`}>
        <div className="text-sm opacity-80">Current Time</div>
        <div className="text-3xl font-bold mt-2">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-sm opacity-80 mt-1">
          {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Pending Medications - FIXED: Explicit text colors */}
      <div className={`rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border p-8 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
        }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${isDark ? 'text-stone-100' : 'text-emerald-950'}`}>
            Pending Medications
          </h3>
          <span className="text-sm px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
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
            <p className={`text-lg ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              All medications completed for today!
            </p>
          </div>
        )}
      </div>

      {/* Completed Medications - FIXED: Explicit text colors */}
      <div className={`rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border p-8 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
        }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${isDark ? 'text-stone-100' : 'text-emerald-950'}`}>
            Completed Today
          </h3>
          <span className="text-sm px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
            {completedTasksToday.length} completed
          </span>
        </div>

        {completedTasksToday.length > 0 ? (
          <div className="space-y-3">
            {completedTasksToday.map(task => (
              <div key={task.id} className={`flex items-center justify-between p-4 rounded-2xl border ${isDark ? 'bg-stone-800 border-stone-700' : 'bg-emerald-50 border-emerald-200'
                }`}>
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>✅</div>
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                      {task.title}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                      Completed at {task.completed && task.completed.length > 0
                        ? new Date(task.completed[task.completed.length - 1].timestamp).toLocaleTimeString()
                        : 'Unknown time'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => markAsIncomplete(task.id)}
                  className="rounded-full bg-stone-600 px-6 py-3 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-stone-700 hover:shadow-lg"
                >
                  Mark Incomplete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-center py-4 ${isDark ? 'text-stone-300' : 'text-stone-500'}`}>
            No medications completed yet today
          </p>
        )}
      </div>

      {/* Medication Management - FIXED: Explicit text colors */}
      <div className={`rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border p-8 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
        }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${isDark ? 'text-stone-100' : 'text-emerald-950'}`}>
            Manage Medications
          </h3>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="rounded-full bg-stone-600 px-6 py-3 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-stone-700 hover:shadow-lg"
          >
            {showCompleted ? 'Hide Completed' : 'Show All'}
          </button>
        </div>

        <div className="space-y-3">
          {(showCompleted ? tasks : activeTasks).map(task => (
            <div key={task.id} className={`flex items-center justify-between p-4 rounded-2xl border ${isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'
              }`}>
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {task.type === 'supplement' ? '🌿' : '💊'}
                </div>
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-sm ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                      {task.times?.join(', ') || 'No times set'}
                    </span>
                    {!task.isActive && (
                      <span className="px-2 py-1 text-xs rounded-full bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200">
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
                      ? 'bg-stone-600 hover:bg-stone-700 text-white'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                >
                  {task.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-4 py-2 bg-stone-700 hover:bg-stone-800 text-white rounded-lg transition-colors"
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
            <p className={`mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              No medications added yet
            </p>
            <button
              onClick={() => router.push('/medication-parser')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              Add Medications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
