import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';


export const exportToCSV = (transactions) => {
    if (!transactions.length) return;

    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (INR)'];
    const rows = transactions.map(t => [
        format(new Date(t.date), 'dd-MM-yyyy'),
        t.type.toUpperCase(),
        t.category,
        t.description || '-',
        t.amount.toFixed(2)
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `SpendCheck_Report_${format(new Date(), 'MMM_yyyy')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


export const exportToPDF = (transactions, budgets, healthScore) => {
    if (!transactions.length) return;

    const doc = new jsPDF();
    const now = new Date();
    const dateStr = format(now, 'MMMM yyyy');


    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); 
    doc.text('SpendCheck Financial Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(now, 'dd-MM-yyyy HH:mm')}`, 14, 28);
    doc.text(`Period: ${dateStr}`, 14, 33);

    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Summary', 14, 45);

    doc.autoTable({
        startY: 50,
        head: [['Metric', 'Value (INR)']],
        body: [
            ['Total Income', `+ ${income.toLocaleString()}`],
            ['Total Expenses', `- ${expenses.toLocaleString()}`],
            ['Net Balance', `${balance >= 0 ? '+' : ''}${balance.toLocaleString()}`],
            ['Financial Health Score', `${healthScore}/100`]
        ],
        theme: 'striped',
        headStyles: { fillStyle: 'fill', fillColor: [59, 130, 246] }
    });

    doc.setFontSize(14);
    doc.text('Recent Transactions', 14, doc.lastAutoTable.finalY + 15);

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
        body: transactions.slice(0, 50).map(t => [
            format(new Date(t.date), 'dd-MM-yyyy'),
            t.type.toUpperCase(),
            t.category,
            t.description || '-',
            t.amount.toFixed(2)
        ]),
        headStyles: { fillColor: [71, 85, 105] } 
    });

    if (budgets && budgets.length > 0) {
        doc.addPage();
        doc.text('Budget Analysis', 14, 20);

        const budgetBody = budgets.map(b => {
            const spent = transactions
                .filter(t => t.type === 'expense' && t.category === b.category)
                .reduce((sum, t) => sum + t.amount, 0);
            const percent = ((spent / b.limit) * 100).toFixed(0) + '%';
            return [b.category, b.limit.toFixed(2), spent.toFixed(2), percent];
        });

        doc.autoTable({
            startY: 25,
            head: [['Category', 'Limit (INR)', 'Spent (INR)', 'Adherence']],
            body: budgetBody,
            headStyles: { fillColor: [139, 92, 246] } 
        });
    }
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`SpendCheck Report - Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`SpendCheck_Report_${format(now, 'MMM_yyyy')}.pdf`);
};
