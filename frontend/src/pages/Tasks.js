import React, { useState } from 'react';
import Layout from '../components/Layout';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const initialTasks = {
  todo: [
    { id: '1', title: 'Conduct user interviews', priority: 'high', assignee: 'John Doe' },
    { id: '2', title: 'Design landing page', priority: 'medium', assignee: 'Jane Smith' },
  ],
  inProgress: [
    { id: '3', title: 'Develop MVP features', priority: 'high', assignee: 'John Doe' },
    { id: '4', title: 'Setup CI/CD pipeline', priority: 'low', assignee: 'Mike Johnson' },
  ],
  review: [
    { id: '5', title: 'Review marketing copy', priority: 'medium', assignee: 'Jane Smith' },
  ],
  done: [
    { id: '6', title: 'Complete market research', priority: 'high', assignee: 'John Doe' },
    { id: '7', title: 'Finalize product roadmap', priority: 'medium', assignee: 'Jane Smith' },
  ],
};

const columns = [
  { id: 'todo', title: 'To-Do', color: 'bg-gray-100' },
  { id: 'inProgress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
];

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export default function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceColumn = Array.from(tasks[source.droppableId]);
    const destColumn = Array.from(tasks[destination.droppableId]);
    const [removed] = sourceColumn.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceColumn.splice(destination.index, 0, removed);
      setTasks({
        ...tasks,
        [source.droppableId]: sourceColumn,
      });
    } else {
      destColumn.splice(destination.index, 0, removed);
      setTasks({
        ...tasks,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Tasks</h1>
            <p className="mt-1 text-sm text-gray-400">Manage and track your execution journey</p>
          </div>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Task
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((column) => (
              <div key={column.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className={`${column.color} rounded-lg p-2 mb-4`}>
                  <h3 className="font-semibold text-gray-800">
                    {column.title}{' '}
                    <span className="text-sm text-gray-600">({tasks[column.id].length})</span>
                  </h3>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-2 min-h-[400px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      } rounded-lg p-2`}
                    >
                      {tasks[column.id].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition cursor-move ${
                                snapshot.isDragging ? 'rotate-2 shadow-xl' : ''
                              }`}
                            >
                              <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    priorityColors[task.priority]
                                  }`}
                                >
                                  {task.priority}
                                </span>
                                <span className="text-xs text-gray-500">{task.assignee}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </Layout>
  );
}
