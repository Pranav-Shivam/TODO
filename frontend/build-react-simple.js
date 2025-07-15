const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Building React app with simple approach...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'green') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function success(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function info(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

try {
  const frontendPath = path.join(__dirname);
  
  // Check if dist directory exists, if not create it
  const distPath = path.join(frontendPath, 'dist');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  // Create a simple HTML file
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Todo Calendar</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/axios@1.6.2/dist/axios.min.js"></script>
    <script src="https://unpkg.com/date-fns@2.30.0/index.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script src="./app.js"></script>
  </body>
</html>`;

  fs.writeFileSync(path.join(distPath, 'index.html'), htmlContent);
  success('Created simple HTML file');

  // Create a simple React app
  const appContent = `
// Simple Todo Calendar App
const { useState, useEffect } = React;

function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await axios.get('http://localhost:7005/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    
    try {
      const response = await axios.post('http://localhost:7005/api/tasks', {
        description: newTask,
        status: 'Not Started',
        due_date: selectedDate.toISOString()
      });
      setTasks([...tasks, response.data]);
      setNewTask('');
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await axios.patch(\`http://localhost:7005/api/tasks/\${taskId}/status\`, null, {
        params: { status }
      });
      setTasks(tasks.map(task => 
        task.id === taskId ? response.data : task
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.patch(\`http://localhost:7005/api/tasks/\${taskId}/soft-delete\`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (loading) {
    return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
      React.createElement('div', { className: 'text-lg text-gray-600' }, 'Loading...')
    );
  }

  return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
    // Header
    React.createElement('div', { className: 'bg-white shadow-sm border-b' },
      React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
        React.createElement('div', { className: 'flex justify-between items-center py-6' },
          React.createElement('h1', { className: 'text-3xl font-bold text-gray-900' }, 'Todo Calendar'),
          React.createElement('div', { className: 'flex items-center space-x-4' },
            React.createElement('input', {
              type: 'text',
              placeholder: 'New task...',
              value: newTask,
              onChange: (e) => setNewTask(e.target.value),
              onKeyPress: (e) => e.key === 'Enter' && addTask(),
              className: 'px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            React.createElement('button', {
              onClick: addTask,
              className: 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }, 'Add Task')
          )
        )
      )
    ),

    // Main content
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' },
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-8' },
        // Task list
        React.createElement('div', { className: 'lg:col-span-2' },
          React.createElement('h2', { className: 'text-2xl font-semibold text-gray-900 mb-6' }, 'Tasks'),
          React.createElement('div', { className: 'space-y-4' },
            tasks.length === 0 ? 
              React.createElement('p', { className: 'text-gray-500 text-center py-8' }, 'No tasks yet. Add your first task above!') :
              tasks.map(task => 
                React.createElement('div', { 
                  key: task.id,
                  className: 'bg-white rounded-lg shadow p-6 border-l-4 border-blue-500'
                },
                  React.createElement('div', { className: 'flex justify-between items-start' },
                    React.createElement('div', { className: 'flex-1' },
                      React.createElement('h3', { className: 'text-lg font-medium text-gray-900' }, task.description),
                      React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, 
                        \`Serial: \${task.serial_number} | Created: \${new Date(task.created_date).toLocaleDateString()}\`
                      )
                    ),
                    React.createElement('div', { className: 'flex items-center space-x-2' },
                      React.createElement('select', {
                        value: task.status,
                        onChange: (e) => updateTaskStatus(task.id, e.target.value),
                        className: 'px-3 py-1 border border-gray-300 rounded text-sm'
                      },
                        React.createElement('option', { value: 'Not Started' }, 'Not Started'),
                        React.createElement('option', { value: 'In Progress' }, 'In Progress'),
                        React.createElement('option', { value: 'Completed' }, 'Completed')
                      ),
                      React.createElement('button', {
                        onClick: () => deleteTask(task.id),
                        className: 'text-red-600 hover:text-red-800 text-sm'
                      }, 'Delete')
                    )
                  )
                )
              )
          )
        ),

        // Calendar sidebar
        React.createElement('div', { className: 'lg:col-span-1' },
          React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, 'Calendar'),
            React.createElement('div', { className: 'text-center' },
              React.createElement('p', { className: 'text-2xl font-bold text-blue-600' }, 
                selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })
              ),
              React.createElement('p', { className: 'text-sm text-gray-500 mt-2' }, 
                \`\${tasks.filter(task => 
                  new Date(task.due_date).toDateString() === selectedDate.toDateString()
                ).length} tasks for this date\`
              )
            )
          )
        )
      )
    )
  );
}

// Render the app
ReactDOM.render(
  React.createElement(TodoApp),
  document.getElementById('root')
);
`;

  fs.writeFileSync(path.join(distPath, 'app.js'), appContent);
  success('Created simple React app');

  log('✅ Simple React build completed!', 'green');
  log('📁 Files created in dist/ directory', 'blue');

} catch (err) {
  error(`Build failed: ${err.message}`);
  console.error(err);
  process.exit(1);
} 