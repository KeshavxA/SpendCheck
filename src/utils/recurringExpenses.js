import { v4 as uuidv4 } from 'uuid';
import { addMonths, addWeeks, addDays, isAfter, isBefore, startOfDay, format } from 'date-fns';

export const RECURRING_FREQUENCIES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly'
};

export const getNextOccurrence = (lastDate, frequency) => {
    const date = new Date(lastDate);

    switch (frequency) {
        case RECURRING_FREQUENCIES.DAILY:
            return addDays(date, 1);
        case RECURRING_FREQUENCIES.WEEKLY:
            return addWeeks(date, 1);
        case RECURRING_FREQUENCIES.MONTHLY:
            return addMonths(date, 1);
        case RECURRING_FREQUENCIES.YEARLY:
            return addMonths(date, 12);
        default:
            return date;
    }
};


export const shouldProcessRecurring = (transaction) => {
    if (!transaction.isRecurring || !transaction.recurringFrequency) {
        return false;
    }

    const lastProcessed = transaction.lastProcessedDate
        ? new Date(transaction.lastProcessedDate)
        : new Date(transaction.date);

    const nextOccurrence = getNextOccurrence(lastProcessed, transaction.recurringFrequency);
    const today = startOfDay(new Date());

    return isBefore(nextOccurrence, today) || startOfDay(nextOccurrence).getTime() === today.getTime();
};


export const processRecurringTransactions = (transactions) => {
    const newTransactions = [];
    const today = startOfDay(new Date());

    transactions.forEach(transaction => {
        if (!shouldProcessRecurring(transaction)) {
            return;
        }

        const lastProcessed = transaction.lastProcessedDate
            ? new Date(transaction.lastProcessedDate)
            : new Date(transaction.date);

        let nextOccurrence = getNextOccurrence(lastProcessed, transaction.recurringFrequency);

        while (isBefore(nextOccurrence, today) || startOfDay(nextOccurrence).getTime() === today.getTime()) {
            const newTransaction = {
                ...transaction,
                id: uuidv4(),
                date: format(nextOccurrence, 'yyyy-MM-dd'),
                isRecurringInstance: true,
                parentRecurringId: transaction.id
            };

            newTransactions.push(newTransaction);
            nextOccurrence = getNextOccurrence(nextOccurrence, transaction.recurringFrequency);
        }
    });

    return newTransactions;
};


export const updateRecurringTransactions = (transactions, processedIds) => {
    const today = format(new Date(), 'yyyy-MM-dd');

    return transactions.map(transaction => {
        if (processedIds.includes(transaction.id)) {
            return {
                ...transaction,
                lastProcessedDate: today
            };
        }
        return transaction;
    });
};


export const getFrequencyLabel = (frequency) => {
    switch (frequency) {
        case RECURRING_FREQUENCIES.DAILY:
            return 'Daily';
        case RECURRING_FREQUENCIES.WEEKLY:
            return 'Weekly';
        case RECURRING_FREQUENCIES.MONTHLY:
            return 'Monthly';
        case RECURRING_FREQUENCIES.YEARLY:
            return 'Yearly';
        default:
            return '';
    }
};


export const getRecurringTransactions = (transactions) => {
    return transactions.filter(t => t.isRecurring && !t.isRecurringInstance);
};


export const getRecurringInstances = (transactions, parentId) => {
    return transactions.filter(t => t.isRecurringInstance && t.parentRecurringId === parentId);
};
