import React, { Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import Logo from './Logo';
import {
  HomeIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  RocketLaunchIcon,
  FlagIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

// Founder navigation (full access)
const founderNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Health Meter', href: '/health', icon: ChartBarIcon, founderOnly: true },
  { name: 'Investor Readiness', href: '/investor-readiness', icon: RocketLaunchIcon, founderOnly: true },
  { name: 'Tasks', href: '/tasks', icon: CheckCircleIcon },
  { name: 'Milestones', href: '/milestones', icon: FlagIcon },
  { name: 'Decision Log', href: '/decisions', icon: ChatBubbleLeftRightIcon, founderOnly: true },
  { name: 'Assumption Board', href: '/assumptions', icon: CheckCircleIcon, founderOnly: true },
  { name: 'Feedback', href: '/feedback', icon: ChatBubbleLeftRightIcon, founderOnly: true },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, founderOnly: true },
  { name: 'Startup Profile', href: '/startup-profile', icon: RocketLaunchIcon, founderOnly: true },
];

// Team member navigation (limited access)
const teamMemberNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'My Tasks', href: '/tasks', icon: CheckCircleIcon },
  { name: 'Milestones', href: '/milestones', icon: FlagIcon },
];

export default function Layout({ children }) {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Use appropriate navigation based on role
  const navigation = userProfile?.role === 'team_member' ? teamMemberNavigation : founderNavigation;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow overflow-y-auto border-r glass-card border-white/10" style={{borderRadius: 0, backgroundImage: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)'}}>
          {/* Logo */}
          <div className="flex items-center justify-center flex-shrink-0 px-4 py-6" style={{background: 'rgba(0, 0, 0, 0.3)'}}>
            <Logo className="w-auto h-10" />
          </div>

          {/* Navigation */}
          <div className="flex flex-col flex-1 mt-5">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition`}
                    style={isActive ? {
                      background: 'rgba(37, 99, 235, 0.2)',
                      borderLeft: '3px solid var(--neon-blue)',
                      paddingLeft: '9px'
                    } : {}}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6`}
                      style={{color: isActive ? 'var(--neon-blue)' : '#9CA3AF'}}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile Section */}
          <div className="flex flex-shrink-0 p-4 border-t border-gray-700">
            <Menu as="div" className="relative w-full">
              <Menu.Button className="flex items-center w-full p-2 text-left transition rounded-md hover:bg-gray-700">
                <UserCircleIcon className="w-8 h-8 text-gray-400" />
                <div className="flex-1 ml-3">
                  <p className="text-sm font-medium text-white truncate">
                    {userProfile?.displayName || currentUser?.email}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {userProfile?.role?.replace('_', ' ') || 'User'}
                  </p>
                </div>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-0 right-0 py-1 mb-2 border shadow-lg bottom-full glass-card border-white/20">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={`${
                          active ? 'bg-white/10' : ''
                        } flex items-center px-4 py-2 text-sm text-gray-200`}
                      >
                        <Cog6ToothIcon className="w-5 h-5 mr-2" />
                        Settings
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-white/10' : ''
                        } flex items-center w-full text-left px-4 py-2 text-sm text-gray-200`}
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
