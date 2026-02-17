# SpendCheck 💰

A modern, AI-powered expense tracking application built with React, featuring intelligent spending insights, beautiful data visualizations, and automated recurring expense management.

## ✨ Features

### 🤖 AI-Powered Insights
- **Intelligent Analysis**: Get personalized spending insights powered by Google's Gemini AI
- **Month-over-Month Comparisons**: Automatically compare your spending patterns across months
- **Actionable Recommendations**: Receive specific suggestions to improve your financial habits
- **Fallback Intelligence**: Rule-based insights when AI is unavailable

### 📊 Enhanced Data Visualization
- **Spending Trends**: Beautiful area charts showing income and expenses over the last 6 months
- **Category Comparison**: Side-by-side bar charts comparing this month vs last month spending by category
- **Pie Charts**: Visual breakdown of spending by category
- **Income vs Expenses**: Clear comparison of monthly income and expenses
- **Responsive Charts**: All charts are fully responsive and mobile-friendly

### 🔄 Recurring Expenses
- **Automatic Processing**: Set up recurring transactions that automatically repeat
- **Multiple Frequencies**: Support for daily, weekly, monthly, and yearly recurring expenses
- **Visual Indicators**: Clear badges showing recurring transactions and auto-generated instances
- **Smart Scheduling**: Automatically processes missed recurring transactions on app load
- **Perfect for**: Netflix subscriptions, gym memberships, rent, salary, and more!

### 💼 Core Features
- **Transaction Management**: Add, edit, and delete income and expense transactions
- **Category Organization**: Pre-defined categories for both income and expenses
- **Real-time Statistics**: Live updates of total income, expenses, and balance
- **Local Storage**: All data persists in your browser
- **Beautiful UI**: Modern, gradient-rich design with smooth animations

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spendcheck
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional - for AI insights)
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   
   Get your free API key from: [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎯 How to Use

### Adding Transactions
1. Select transaction type (Expense or Income)
2. Enter amount, category, and optional description
3. Choose the date
4. **Optional**: Enable "Make this a recurring transaction" for automatic repeats
5. Click "Add Transaction"

### Setting Up Recurring Expenses
1. When adding a transaction, check "Make this a recurring transaction"
2. Select the frequency (Daily, Weekly, Monthly, or Yearly)
3. The transaction will automatically repeat based on your selected frequency
4. Recurring transactions are marked with a blue badge
5. Auto-generated instances are marked with a purple "Auto" badge

### Viewing AI Insights
- AI insights appear automatically after adding transactions
- Click "Refresh" to generate new insights
- Insights include:
  - Spending comparisons vs last month
  - Category-specific recommendations
  - Savings rate analysis
  - Personalized tips to improve finances

### Understanding the Charts
- **Spending Trends**: Shows your income and expenses over the last 6 months
- **Category Comparison**: Compares your top 5 spending categories this month vs last month
- **Spending by Category**: Pie chart showing percentage breakdown of expenses
- **Income vs Expenses**: Bar chart comparing total income and expenses for the current month

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **AI**: Google Generative AI (Gemini)
- **Date Handling**: date-fns
- **Storage**: Browser LocalStorage

## 📁 Project Structure

```
spendcheck/
├── src/
│   ├── components/
│   │   ├── AIInsights.jsx       # AI-powered insights component
│   │   ├── Charts.jsx            # Enhanced data visualizations
│   │   ├── Dashboard.jsx         # Main dashboard layout
│   │   ├── StatsCards.jsx        # Summary statistics cards
│   │   ├── TransactionForm.jsx   # Form with recurring support
│   │   └── TransactionList.jsx   # Transaction list with badges
│   ├── context/
│   │   └── FinanceContext.jsx    # Global state management
│   ├── services/
│   │   └── aiService.js          # Gemini AI integration
│   ├── utils/
│   │   ├── calculations.js       # Financial calculations
│   │   ├── recurringExpenses.js  # Recurring transaction logic
│   │   └── storage.js            # LocalStorage utilities
│   ├── constants/
│   │   └── categories.js         # Transaction categories
│   └── reducers/
│       └── financeReducer.js     # State reducer
├── .env.example                   # Environment template
└── package.json
```

## 🎨 Features in Detail

### AI Insights
The AI insights feature uses Google's Gemini AI to analyze your spending patterns and provide personalized recommendations. It:
- Compares current month spending with previous month
- Identifies categories with significant changes
- Calculates savings rate
- Provides actionable tips to improve finances
- Falls back to rule-based insights if AI is unavailable

### Recurring Transactions
Recurring transactions are perfect for:
- **Monthly**: Rent, subscriptions (Netflix, Spotify), gym membership
- **Weekly**: Grocery budget, weekly savings
- **Daily**: Daily coffee budget, commute costs
- **Yearly**: Insurance premiums, annual subscriptions

The system automatically:
- Processes recurring transactions on app load
- Catches up on missed transactions
- Marks auto-generated transactions with visual badges
- Updates the parent transaction's last processed date

### Data Visualization
All charts are:
- Fully responsive and mobile-friendly
- Interactive with hover tooltips
- Color-coded for easy understanding
- Automatically updated when transactions change
- Optimized to prevent rendering warnings

## 🔒 Privacy & Security

- **All data stays local**: Your financial data is stored only in your browser's LocalStorage
- **No server required**: The app runs entirely in your browser
- **Optional AI**: AI insights are optional and only work if you provide an API key
- **Your API key**: If you use AI insights, your API key is stored only in your browser

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with React and Vite
- Charts powered by Recharts
- AI insights powered by Google Gemini
- Icons by Lucide React
- Styling with Tailwind CSS

## 📧 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Made with ❤️ for better financial management**
