import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [payday, setPayday] = useState(9);
  const [weekView, setWeekView] = useState(1);
  const [bills, setBills] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [quickSpends, setQuickSpends] = useState([]);
  const [tab, setTab] = useState('calendar');
  const [quickText, setQuickText] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillDay, setNewBillDay] = useState('1');
  const [newBillFreq, setNewBillFreq] = useState('monthly');

  useEffect(() => {
    (async () => {
      const b = await AsyncStorage.getItem('bills');
      const i = await AsyncStorage.getItem('incomes');
      const q = await AsyncStorage.getItem('quick');
      if (b) setBills(JSON.parse(b));
      if (i) setIncomes(JSON.parse(i));
      if (q) setQuickSpends(JSON.parse(q));
    })();
  }, []);

  useEffect(() => { AsyncStorage.setItem('bills', JSON.stringify(bills)); }, [bills]);
  useEffect(() => { AsyncStorage.setItem('incomes', JSON.stringify(incomes)); }, [incomes]);
  useEffect(() => { AsyncStorage.setItem('quick', JSON.stringify(quickSpends)); }, [quickSpends]);

  const totalBills = bills.reduce((s, b) => s + parseFloat(b.amount || 0), 0);
  const totalIncome = incomes.reduce((s, b) => s + parseFloat(b.amount || 0), 0);
  const totalQuick = quickSpends.reduce((s, b) => s + parseFloat(b.amount || 0), 0);
  const left = totalIncome - totalBills - totalQuick;

  const addQuick = () => {
    if (!quickText || !quickAmount) return;
    setQuickSpends([...quickSpends, { id: Date.now(), name: quickText, amount: quickAmount, date: Date.now() }]);
    setQuickText(''); setQuickAmount('');
  };

  const addBill = () => {
    if (!newBillName || !newBillAmount) return;
    setBills([...bills, { id: Date.now(), name: newBillName, amount: newBillAmount, day: newBillDay, freq: newBillFreq }]);
    setNewBillName(''); setNewBillAmount(''); setNewBillDay('1');
  };

  const addIncome = () => {
    if (!newBillName || !newBillAmount) return;
    setIncomes([...incomes, { id: Date.now(), name: newBillName, amount: newBillAmount, day: newBillDay, freq: newBillFreq }]);
    setNewBillName(''); setNewBillAmount(''); setNewBillDay('1');
  };

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {tab === 'calendar' ? (
          <>
            <View style={styles.header}>
              <Text style={styles.payday}>PAYDAY {payday} • WEEK {weekView}</Text>
              <Text style={styles.leftText}>£{left.toFixed(2)} LEFT TO SPEND</Text>
              <Text style={styles.perWeek}>£{totalIncome > 0 ? (totalIncome/4).toFixed(0) : 0} / WEEK</Text>
              <View style={styles.weekRow}>
                {[1,2,3,4].map(w => (
                  <TouchableOpacity key={w} onPress={() => setWeekView(w)} style={[styles.weekPill, weekView === w && styles.weekPillActive]}>
                    <Text style={[styles.weekText, weekView === w && styles.weekTextActive]}>{w}w</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.statsCard}>
              <View style={styles.stat}><Text style={[styles.statAmt, { color: '#ff8c00' }]}>£{totalQuick}</Text><Text style={styles.statLbl}>SPENT</Text></View>
              <View style={styles.divider} />
              <View style={styles.stat}><Text style={[styles.statAmt, { color: '#c8ff00' }]}>£{totalIncome}</Text><Text style={styles.statLbl}>INCOME</Text></View>
              <View style={styles.divider} />
              <View style={styles.stat}><Text style={[styles.statAmt, { color: '#ff4d4d' }]}>£{totalBills}</Text><Text style={styles.statLbl}>BILLS</Text></View>
            </View>

            <View style={styles.calendarCard}>
              <View style={styles.calGrid}>
                {days.map(d => {
                  const hasBill = bills.some(b => parseInt(b.day) === d);
                  const hasInc = incomes.some(b => parseInt(b.day) === d);
                  return (
                    <View key={d} style={[styles.day, hasInc && styles.dayIncome, hasBill && !hasInc && styles.dayBill, d === 9 && styles.dayPayday]}>
                      <Text style={[styles.dayText, (hasInc || hasBill) && { fontWeight: 'bold' }]}>{d}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.legend}>
                <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#c8ff00' }]} /><Text style={styles.legendText}>Income</Text></View>
                <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#fff9c4' }]} /><Text style={styles.legendText}>Bill</Text></View>
              </View>
            </View>

            <View style={styles.quickCard}>
              <Text style={styles.quickTitle}>QUICK ADD - AUTO REMOVES AFTER 7 DAYS</Text>
              <View style={styles.quickRow}>
                <TextInput value={quickText} onChangeText={setQuickText} placeholder="What did you buy?" placeholderTextColor="#888" style={styles.quickInputBig} />
                <TextInput value={quickAmount} onChangeText={setQuickAmount} placeholder="£0" keyboardType="numeric" style={styles.quickAmount} />
                <TouchableOpacity onPress={addQuick} style={styles.addBtn}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
              </View>
              {quickSpends.map(q => (
                <Text key={q.id} style={styles.quickItem}>-£{q.amount} {q.name}</Text>
              ))}
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>BILLS - £{totalBills}/MO AUTO-DEDUCTED</Text>
              {bills.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>No bills yet — add in Bills & Income tab</Text></View>
              ) : (
                bills.map(b => (
                  <View key={b.id} style={styles.billRow}>
                    <View style={styles.billDayBadge}><Text style={styles.billDayText}>{b.day}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.billName}>{b.name}</Text>
                      <Text style={styles.billSub}>{b.freq} • Day {b.day}</Text>
                    </View>
                    <Text style={styles.billAmt}>-£{b.amount}</Text>
                  </View>
                ))
              )}
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>INCOMES - £{totalIncome}/MO</Text>
              {incomes.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>No incomes yet — add in Bills & Income tab</Text></View>
              ) : (
                incomes.map(b => (
                  <View key={b.id} style={styles.billRow}>
                    <View style={[styles.billDayBadge, { backgroundColor: '#c8ff00' }]}><Text style={[styles.billDayText, { color: '#000' }]}>{b.day}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.billName}>{b.name}</Text>
                      <Text style={styles.billSub}>{b.freq} • Day {b.day}</Text>
                    </View>
                    <Text style={[styles.billAmt, { color: '#c8ff00' }]}>+£{b.amount}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.pageTitle}>Bills & Income</Text>
            <View style={styles.formCard}>
              <Text style={styles.formLabel}>Name</Text>
              <TextInput value={newBillName} onChangeText={setNewBillName} placeholder="e.g. Rent, Wages" style={styles.formInput} placeholderTextColor="#888" />
              <Text style={styles.formLabel}>Amount £</Text>
              <TextInput value={newBillAmount} onChangeText={setNewBillAmount} placeholder="0" keyboardType="numeric" style={styles.formInput} placeholderTextColor="#888" />
              <Text style={styles.formLabel}>Day of Month (1-30)</Text>
              <TextInput value={newBillDay} onChangeText={setNewBillDay} keyboardType="numeric" style={styles.formInput} placeholderTextColor="#888" />
              <Text style={styles.formLabel}>Frequency</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['weekly','monthly'].map(f => (
                  <TouchableOpacity key={f} onPress={() => setNewBillFreq(f)} style={[styles.freqBtn, newBillFreq === f && styles.freqBtnActive]}><Text style={[styles.freqText, newBillFreq === f && { color: '#000' }]}>{f}</Text></TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity onPress={addBill} style={[styles.actionBtn, { backgroundColor: '#ff4d4d' }]}><Text style={styles.actionText}>+ Add Bill</Text></TouchableOpacity>
                <TouchableOpacity onPress={addIncome} style={[styles.actionBtn, { backgroundColor: '#c8ff00' }]}><Text style={[styles.actionText, { color: '#000' }]}>+ Add Income</Text></TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>YOUR BILLS ({bills.length})</Text>
            {bills.map(b => (
              <View key={b.id} style={styles.billRow}>
                <View style={styles.billDayBadge}><Text style={styles.billDayText}>{b.day}</Text></View>
                <View style={{ flex: 1 }}><Text style={styles.billName}>{b.name}</Text><Text style={styles.billSub}>Day {b.day} • {b.freq} • £{b.amount}</Text></View>
                <TouchableOpacity onPress={() => setBills(bills.filter(x => x.id !== b.id))}><Text style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Delete</Text></TouchableOpacity>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>YOUR INCOMES ({incomes.length})</Text>
            {incomes.map(b => (
              <View key={b.id} style={styles.billRow}>
                <View style={[styles.billDayBadge, { backgroundColor: '#c8ff00' }]}><Text style={[styles.billDayText, { color: '#000' }]}>{b.day}</Text></View>
                <View style={{ flex: 1 }}><Text style={styles.billName}>{b.name}</Text><Text style={styles.billSub}>Day {b.day} • {b.freq} • £{b.amount}</Text></View>
                <TouchableOpacity onPress={() => setIncomes(incomes.filter(x => x.id !== b.id))}><Text style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Delete</Text></TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => setTab('calendar')} style={[styles.tab, tab === 'calendar' && styles.tabActive]}><Text style={[styles.tabText, tab === 'calendar' && styles.tabTextActive]}>Calendar</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('bills')} style={[styles.tab, tab === 'bills' && styles.tabActive]}><Text style={[styles.tabText, tab === 'bills' && styles.tabTextActive]}>Bills & Income</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#121212', borderRadius: 16, padding: 20, alignItems: 'center' },
  payday: { color: '#888', fontSize: 12, letterSpacing: 1 },
  leftText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 8 },
  perWeek: { color: '#888', marginTop: 4 },
  weekRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  weekPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#2a2a2a' },
  weekPillActive: { backgroundColor: '#c8ff00' },
  weekText: { color: '#fff' },
  weekTextActive: { color: '#000', fontWeight: 'bold' },
  statsCard: { flexDirection: 'row', backgroundColor: '#121212', borderRadius: 16, padding: 16, marginTop: 12, justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statAmt: { fontWeight: 'bold', fontSize: 16 },
  statLbl: { color: '#888', fontSize: 10, marginTop: 2 },
  divider: { width: 1, backgroundColor: '#2a2a2a' },
  calendarCard: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginTop: 12 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20, marginVertical: 4 },
  dayIncome: { backgroundColor: '#c8ff00' },
  dayBill: { backgroundColor: '#fff9c4' },
  dayPayday: { borderWidth: 2, borderColor: '#000' },
  dayText: { fontSize: 16, fontWeight: '500' },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: '#888' },
  quickCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 2, borderColor: '#c8ff00' },
  quickTitle: { fontSize: 10, color: '#888', letterSpacing: 1, marginBottom: 12 },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickInputBig: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, fontSize: 18, color: '#000' },
  quickAmount: { width: 80, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, fontSize: 18, textAlign: 'center' },
  addBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#c8ff00', alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 28, fontWeight: 'bold' },
  quickItem: { marginTop: 8, color: '#888', fontSize: 14 },
  sectionTitle: { fontSize: 12, color: '#888', letterSpacing: 1, marginBottom: 8, fontWeight: 'bold' },
  billRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, gap: 12 },
  billDayBadge: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  billDayText: { color: '#fff', fontWeight: 'bold' },
  billName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  billSub: { fontSize: 12, color: '#888', marginTop: 2 },
  billAmt: { fontSize: 16, fontWeight: 'bold', color: '#ff4d4d' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center' },
  emptyText: { color: '#888' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#000' },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  formLabel: { fontSize: 12, color: '#888', marginTop: 12, marginBottom: 4 },
  formInput: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14, fontSize: 16, color: '#000' },
  freqBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#f5f5f5', alignItems: 'center' },
  freqBtnActive: { backgroundColor: '#c8ff00' },
  freqText: { color: '#000' },
  actionBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold' },
  bottomBar: { position: 'absolute', bottom: 20, left: 16, right: 16, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 30, padding: 6, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  tab: { flex: 1, padding: 14, borderRadius: 24, alignItems: 'center' },
  tabActive: { backgroundColor: '#000' },
  tabText: { color: '#888', fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },
});
