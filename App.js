import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LIME = '#C6FF00';
const BLACK = '#0a0a0a';

export default function App() {
  const [income, setIncome] = useState(0);
  const [incomeName, setIncomeName] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [bills, setBills] = useState([]);
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billKeep, setBillKeep] = useState(true);
  const [week, setWeek] = useState(1);
  const [spends, setSpends] = useState([]);
  const [spendName, setSpendName] = useState('');
  const [spendAmount, setSpendAmount] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('mm_data');
        if (saved) {
          const d = JSON.parse(saved);
          setIncome(d.income || 0);
          setBills(d.bills || []);
          setSpends(d.spends || []);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('mm_data', JSON.stringify({ income, bills, spends }));
  }, [income, bills, spends]);

  const totalBills = bills.reduce((s, b) => s + b.amount, 0);
  const totalSpendsThisWeek = spends.filter(s => s.week === week).reduce((s, b) => s + b.amount, 0);
  const weeklyPot = income ? (income - totalBills) / 4 : 0;
  const canSpend = weeklyPot - totalSpendsThisWeek;

  const addIncome = () => {
    const amt = parseFloat(incomeAmount);
    if (!incomeName || !amt) return;
    setIncome(income + amt);
    setIncomeName('');
    setIncomeAmount('');
  };

  const addBill = () => {
    const amt = parseFloat(billAmount);
    if (!billName || !amt) return;
    setBills([...bills, { id: Date.now().toString(), name: billName, amount: amt, keep: billKeep }]);
    setBillName('');
    setBillAmount('');
  };

  const addSpend = () => {
    const amt = parseFloat(spendAmount);
    if (!spendName
