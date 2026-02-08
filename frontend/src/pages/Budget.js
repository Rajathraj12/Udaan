import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function Budget() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [assumptions, setAssumptions] = useState([]);

  // Budget Setup Form
  const [budgetForm, setBudgetForm] = useState({
    totalBudget: '',
    fundingType: 'bootstrapped',
    phases: [
      { name: 'Validation', amount: '' },
      { name: 'MVP Build', amount: '' },
      { name: 'Marketing', amount: '' },
      { name: 'Buffer', amount: '' },
    ],
  });

  // Expense Form
  const [expenseForm, setExpenseForm] = useState({
    name: '',
    category: 'development',
    amount: '',
    phase: 'Validation',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await currentUser.getIdToken();
      const [budgetRes, expensesRes, milestonesRes, assumptionsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/budget`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: null })),
        axios.get(`${process.env.REACT_APP_API_URL}/api/budget/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${process.env.REACT_APP_API_URL}/api/milestones`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${process.env.REACT_APP_API_URL}/api/assumptions`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
      ]);

      setBudgetData(budgetRes.data);
      setExpenses(expensesRes.data);
      setMilestones(milestonesRes.data);
      setAssumptions(assumptionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetSetup = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/budget`,
        budgetForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Budget setup completed!');
      setShowBudgetSetup(false);
      fetchData();
    } catch (error) {
      console.error('Error setting up budget:', error);
      toast.error('Failed to setup budget');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/budget/expenses`,
        expenseForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Expense added!');
      setShowExpenseForm(false);
      setExpenseForm({ name: '', category: 'development', amount: '', phase: 'Validation' });
      fetchData();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  };

  // Calculate metrics
  const calculateMetrics = () => {
    if (!budgetData) return null;

    const totalBudget = parseFloat(budgetData.totalBudget) || 0;
    const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const budgetUsedPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Milestone completion
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const totalMilestones = milestones.length;
    const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    // Validation progress
    const validatedAssumptions = assumptions.filter(a => a.status === 'validated').length;
    const totalAssumptions = assumptions.length;
    const validationProgress = totalAssumptions > 0 ? (validatedAssumptions / totalAssumptions) * 100 : 0;

    // Budget confidence
    const remaining = totalBudget - totalSpent;
    const burnRate = budgetUsedPercent;
    const executionRate = (milestoneProgress + validationProgress) / 2;

    let confidence = 'High';
    let confidenceColor = 'text-green-400';

    if (burnRate > 70 && executionRate < 40) {
      confidence = 'Low';
      confidenceColor = 'text-red-400';
    } else if (burnRate > 50 && executionRate < 50) {
      confidence = 'Medium';
      confidenceColor = 'text-yellow-400';
    }

    return {
      totalBudget,
      totalSpent,
      remaining,
      budgetUsedPercent,
      milestoneProgress,
      validationProgress,
      confidence,
      confidenceColor,
      executionRate,
    };
  };

  // Generate warnings
  const getWarnings = () => {
    const metrics = calculateMetrics();
    if (!metrics) return [];

    const warnings = [];

    if (metrics.budgetUsedPercent > 65 && metrics.validationProgress < 30) {
      warnings.push({
        type: 'critical',
        message: 'Spending too fast before validation',
        action: 'Pause development spend and validate assumptions',
      });
    }

    if (metrics.budgetUsedPercent > 50 && metrics.executionRate < 30) {
      warnings.push({
        type: 'warning',
        message: 'High burn with low execution progress',
        action: 'Review spending priorities and focus on key milestones',
      });
    }

    if (metrics.remaining < metrics.totalBudget * 0.2 && metrics.milestoneProgress < 70) {
      warnings.push({
        type: 'alert',
        message: 'Budget running low with incomplete milestones',
        action: 'Consider securing additional funding or reducing scope',
      });
    }

    return warnings;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  const metrics = calculateMetrics();
  const warnings = getWarnings();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Budget Management</h1>
            <p className="mt-2 text-sm text-gray-400">
              Ensuring money and effort are spent at the right time and for the right purpose
            </p>
          </div>
          {budgetData && (
            <button
              onClick={() => setShowExpenseForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/30"
            >
              + Add Expense
            </button>
          )}
        </div>

        {/* No Budget Setup */}
        {!budgetData && !showBudgetSetup && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-6">💰</div>
            <h2 className="text-2xl font-bold text-white mb-3">Set Up Your Budget</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Define your total budget and allocate it across different startup phases to maintain spending discipline
            </p>
            <button
              onClick={() => setShowBudgetSetup(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/30"
            >
              Set Up Budget
            </button>
          </div>
        )}

        {/* Budget Setup Form */}
        {showBudgetSetup && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Budget Setup</h2>
              <button
                onClick={() => setShowBudgetSetup(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBudgetSetup} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Total Budget (₹) *
                  </label>
                  <input
                    type="number"
                    value={budgetForm.totalBudget}
                    onChange={(e) => setBudgetForm({ ...budgetForm, totalBudget: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="100000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Funding Type
                  </label>
                  <select
                    value={budgetForm.fundingType}
                    onChange={(e) => setBudgetForm({ ...budgetForm, fundingType: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer hover:bg-gray-700 transition"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                  >
                    <option value="bootstrapped" className="bg-gray-800 text-white">Bootstrapped</option>
                    <option value="grant" className="bg-gray-800 text-white">Grant</option>
                    <option value="savings" className="bg-gray-800 text-white">Personal Savings</option>
                    <option value="angel" className="bg-gray-800 text-white">Angel Investment</option>
                    <option value="seed" className="bg-gray-800 text-white">Seed Funding</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Phase-wise Allocation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budgetForm.phases.map((phase, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        {phase.name}
                      </label>
                      <input
                        type="number"
                        value={phase.amount}
                        onChange={(e) => {
                          const newPhases = [...budgetForm.phases];
                          newPhases[index].amount = e.target.value;
                          setBudgetForm({ ...budgetForm, phases: newPhases });
                        }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="25000"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/30"
              >
                Save Budget Setup
              </button>
            </form>
          </div>
        )}

        {/* Main Dashboard */}
        {budgetData && metrics && (
          <>
            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="space-y-3">
                {warnings.map((warning, index) => (
                  <div
                    key={index}
                    className={`bg-white/5 backdrop-blur-xl border rounded-xl p-4 flex items-start gap-4 ${
                      warning.type === 'critical'
                        ? 'border-red-500/30 bg-red-500/10'
                        : warning.type === 'warning'
                        ? 'border-yellow-500/30 bg-yellow-500/10'
                        : 'border-blue-500/30 bg-blue-500/10'
                    }`}
                  >
                    <div className="text-2xl">
                      {warning.type === 'critical' ? '🚨' : warning.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{warning.message}</h3>
                      <p className="text-sm text-gray-300">{warning.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Budget Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Budget */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400">Total Budget</h3>
                  <div className="text-2xl">💰</div>
                </div>
                <p className="text-3xl font-bold text-white">₹{metrics.totalBudget.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-2 capitalize">{budgetData.fundingType}</p>
              </div>

              {/* Spent */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400">Total Spent</h3>
                  <div className="text-2xl">📊</div>
                </div>
                <p className="text-3xl font-bold text-white">₹{metrics.totalSpent.toLocaleString()}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Budget Used</span>
                    <span className="text-white font-semibold">{metrics.budgetUsedPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metrics.budgetUsedPercent > 80
                          ? 'bg-red-500'
                          : metrics.budgetUsedPercent > 50
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(metrics.budgetUsedPercent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Remaining */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400">Remaining</h3>
                  <div className="text-2xl">💵</div>
                </div>
                <p className="text-3xl font-bold text-white">₹{metrics.remaining.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {((metrics.remaining / metrics.totalBudget) * 100).toFixed(0)}% of budget
                </p>
              </div>
            </div>

            {/* Burn vs Progress */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Burn vs Progress Indicator</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Budget Used</span>
                    <span className="text-sm font-bold text-white">{metrics.budgetUsedPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-red-500"
                      style={{ width: `${Math.min(metrics.budgetUsedPercent, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Milestones Completed</span>
                    <span className="text-sm font-bold text-white">{metrics.milestoneProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-blue-500"
                      style={{ width: `${Math.min(metrics.milestoneProgress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Validation Progress</span>
                    <span className="text-sm font-bold text-white">{metrics.validationProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-green-500"
                      style={{ width: `${Math.min(metrics.validationProgress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Warning Badge */}
              {metrics.budgetUsedPercent > metrics.executionRate + 20 && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 font-semibold">
                    ⚠️ Budget burn ({metrics.budgetUsedPercent.toFixed(0)}%) is significantly higher than execution
                    progress ({metrics.executionRate.toFixed(0)}%)
                  </p>
                </div>
              )}
            </div>

            {/* Budget Confidence Meter */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Budget Confidence Meter</h2>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400">Confidence Level</span>
                    <span className={`text-2xl font-bold ${metrics.confidenceColor}`}>{metrics.confidence}</span>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className={`flex-1 h-4 rounded-full ${
                        metrics.confidence === 'Low' ? 'bg-red-500' : 'bg-gray-700'
                      }`}
                    ></div>
                    <div
                      className={`flex-1 h-4 rounded-full ${
                        metrics.confidence === 'Medium' ? 'bg-yellow-500' : 'bg-gray-700'
                      }`}
                    ></div>
                    <div
                      className={`flex-1 h-4 rounded-full ${
                        metrics.confidence === 'High' ? 'bg-green-500' : 'bg-gray-700'
                      }`}
                    ></div>
                  </div>
                </div>
                <div className="text-6xl">
                  {metrics.confidence === 'High' ? '😊' : metrics.confidence === 'Medium' ? '😐' : '😟'}
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                Based on budget remaining ({metrics.remaining.toLocaleString()}), validation status (
                {metrics.validationProgress.toFixed(0)}%), and execution progress ({metrics.executionRate.toFixed(0)}%)
              </p>
            </div>

            {/* Phase-wise Spending */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Phase-wise Budget Allocation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {budgetData.phases?.map((phase, index) => {
                  const phaseSpent = expenses
                    .filter((e) => e.phase === phase.name)
                    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                  const phasePercent = phase.amount > 0 ? (phaseSpent / phase.amount) * 100 : 0;

                  return (
                    <div key={index} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-white mb-2">{phase.name}</h3>
                      <p className="text-2xl font-bold text-blue-400 mb-1">₹{phase.amount?.toLocaleString() || 0}</p>
                      <div className="text-xs text-gray-400 mb-2">
                        Spent: ₹{phaseSpent.toLocaleString()} ({phasePercent.toFixed(0)}%)
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            phasePercent > 90 ? 'bg-red-500' : phasePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(phasePercent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Expenses</h2>
                <span className="text-sm text-gray-400">{expenses.length} total</span>
              </div>

              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📝</div>
                  <p className="text-gray-400">No expenses recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.slice(0, 10).map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{expense.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md">
                            {expense.category}
                          </span>
                          <span className="text-xs px-2 py-1 bg-purple-600 text-white rounded-md">
                            {expense.phase}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(expense.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">₹{parseFloat(expense.amount).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Add Expense Form Modal */}
        {showExpenseForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add Expense</h2>
                <button
                  onClick={() => setShowExpenseForm(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Expense Name *</label>
                  <input
                    type="text"
                    value={expenseForm.name}
                    onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., AWS Hosting"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer hover:bg-gray-700 transition"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                    >
                      <option value="development" className="bg-gray-800 text-white">Development</option>
                      <option value="marketing" className="bg-gray-800 text-white">Marketing</option>
                      <option value="tools" className="bg-gray-800 text-white">Tools & Software</option>
                      <option value="hosting" className="bg-gray-800 text-white">Hosting & Infrastructure</option>
                      <option value="misc" className="bg-gray-800 text-white">Miscellaneous</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Phase</label>
                    <select
                      value={expenseForm.phase}
                      onChange={(e) => setExpenseForm({ ...expenseForm, phase: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer hover:bg-gray-700 transition"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                    >
                      {budgetData?.phases?.map((phase) => (
                        <option key={phase.name} value={phase.name} className="bg-gray-800 text-white">
                          {phase.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Amount (₹) *</label>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="5000"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/30"
                >
                  Add Expense
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
