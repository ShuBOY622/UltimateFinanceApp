import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const BASE_URL = 'http://192.168.1.2:8080'; // User's actual IP address

interface SummaryData {
  netWorth?: number;
  cashBalance?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  savingsRate?: number;
}

interface PortfolioData {
  currentValue?: number;
  totalGainLoss?: number;
  totalHoldings?: number;
}

interface DashboardContextType {
  summary: SummaryData;
  portfolio: PortfolioData;
  loading: boolean;
  refreshDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [summary, setSummary] = useState<SummaryData>({});
  const [portfolio, setPortfolio] = useState<PortfolioData>({});
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data from:', BASE_URL);

      const [summaryRes, portfolioRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/api/transactions/summary`),
        axios.get(`${BASE_URL}/api/investments/portfolio/summary`),
      ]);

      console.log('Summary response:', summaryRes);
      console.log('Portfolio response:', portfolioRes);

      if (summaryRes.status === 'fulfilled') {
        console.log('Setting summary data:', summaryRes.value.data);
        setSummary(summaryRes.value.data || {});
      } else {
        console.error('Summary API failed:', summaryRes.reason);
        setSummary({});
      }

      if (portfolioRes.status === 'fulfilled') {
        console.log('Setting portfolio data:', portfolioRes.value.data);
        setPortfolio(portfolioRes.value.data || {});
      } else {
        console.error('Portfolio API failed:', portfolioRes.reason);
        setPortfolio({});
      }
    } catch (error) {
      console.error('Dashboard context error:', error);
      // Set empty data on error so the UI can show empty state
      setSummary({});
      setPortfolio({});
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const value: DashboardContextType = {
    summary,
    portfolio,
    loading,
    refreshDashboard,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};