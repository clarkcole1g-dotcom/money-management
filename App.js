import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const LIME = '#C6FF00'; const BLACK = '#0a0a0a';
export default function App() {
  const [income, setIncome] = useState(0); const [incomeName, setIncomeName] = useState(''); const [incomeAmount, setIncomeAmount] = useState('');
  const [bills, setBills] = useState([]); const [billName, setBillName] = useState(''); const [billAmount, setBillAmount] = useState(''); const [billKeep, setBillKeep] = useState(true);
  const [week, setWeek] = useState(1); const [spends, setSpends] = useState([]); const [spendName, setSpendName] = useState(''); const [spendAmount, setSpendAmount] = useState('');
  useEffect(() => { (async () => { try { const saved = await AsyncStorage.getItem('mm_data'); if (saved) { const d = JSON.parse(saved); setIncome(d.income || 0); setBills(d.bills || []); setSpends(d.spends || []); } } catch {} })(); }, []);
  useEffect(() => { AsyncStorage.setItem('mm_data', JSON.stringify({ income, bills, spends })); }, [income, bills, spends]);
  const totalBills = bills.reduce((s, b) => s + b.amount, 0); const totalSpendsThisWeek = spends.filter(s => s.week === week).reduce((s, b) => s + b.amount, 0);
  const weeklyPot = income ? (income - totalBills) / 4 : 0; const canSpend = weeklyPot - totalSpendsThisWeek;
  const addIncome = () => { const amt = parseFloat(incomeAmount); if (!incomeName || !amt) return; setIncome(income + amt); setIncomeName(''); setIncomeAmount(''); };
  const addBill = () => { const amt = parseFloat(billAmount); if (!billName || !amt) return; setBills([...bills, { id: Date.now().toString(), name: billName, amount: amt, keep: billKeep }]); setBillName(''); setBillAmount(''); };
  const addSpend = () => { const amt = parseFloat(spendAmount); if (!spendName || !amt) return; setSpends([...spends, { id: Date.now().toString(), name: spendName, amount: amt, week }]); setSpendName(''); setSpendAmount(''); };
  if (income === 0 && bills.length === 0) {
    return (<View style={styles.container}><View style={styles.header}><Text style={styles.headerTitle}>Money Management</Text><Text style={styles.headerTotal}>£0.00</Text></View>
      <View style={styles.blankWrap}><Text style={styles.blankBig}>ADD INCOME TO START</Text><Text style={styles.blankSub}>👋 Welcome! No data yet.</Text>
        <TextInput style={styles.input} placeholder="Income name" value={incomeName} onChangeText={setIncomeName} placeholderTextColor="#999" />
        <TextInput style={styles.input} placeholder="Amount e.g. 1453" value={incomeAmount} onChangeText={setIncomeAmount} keyboardType="numeric" placeholderTextColor="#999" />
        <Pressable style={styles.addBtn} onPress={addIncome}><Text style={styles.addBtnText}>Add Income</Text></Pressable></View></View>);
  }
  return (<View style={styles.container}><View style={styles.header}><Text style={styles.headerTitle}>Money Management</Text><Text style={styles.headerTotal}>£{income.toFixed(2)}</Text><Text style={styles.headerSub}>WEEK {week} • £{canSpend.toFixed(2)} to spend</Text></View>
    <View style={styles.weekRow}>{[1,2,3,4].map(w => (<Pressable key={w} onPress={() => setWeek(w)} style={[styles.weekBtn, week===w && styles.weekBtnActive]}><Text style={[styles.weekText, week===w && styles.weekTextActive]}>W{w}</Text></Pressable>))}</View>
    <ScrollView style={styles.body}><View style={styles.bigCard}><Text style={styles.bigCardLabel}>YOU CAN SPEND THIS WEEK</Text><Text style={styles.bigCardAmount}>£{canSpend.toFixed(2)}</Text><Text style={styles.bigCardSub}>Weekly pot £{weeklyPot.toFixed(2)} - spends £{totalSpendsThisWeek.toFixed(2)}</Text></View>
      <Text style={styles.sectionTitle}>Add Spend — Week {week}</Text><TextInput style={styles.input} placeholder="Shop / Vegr / etc" value={spendName} onChangeText={setSpendName} placeholderTextColor="#999" /><TextInput style={styles.input} placeholder="Amount" value={spendAmount} onChangeText={setSpendAmount} keyboardType="numeric" placeholderTextColor="#999" /><Pressable style={styles.addBtn} onPress={addSpend}><Text style={styles.addBtnText}>Add Spend</Text></Pressable>
      <View style={styles.list}>{spends.filter(s => s.week===week).map(s => (<View key={s.id} style={styles.row}><Text style={styles.rowName}>{s.name}</Text><Text style={styles.rowAmt}>£{s.amount.toFixed(2)}</Text></View>))}</View>
      <Text style={styles.sectionTitle}>Bills — tick keeps going till unticked</Text><TextInput style={styles.input} placeholder="Bill name" value={billName} onChangeText={setBillName} placeholderTextColor="#999" /><TextInput style={styles.input} placeholder="Amount" value={billAmount} onChangeText={setBillAmount} keyboardType="numeric" placeholderTextColor="#999" />
      <Pressable style={[styles.keepRow, billKeep && styles.keepRowActive]} onPress={() => setBillKeep(!billKeep)}><Text style={styles.keepText}>{billKeep ? '✓ Keep going till unticked' : '○ One time only'}</Text></Pressable><Pressable style={styles.addBtn} onPress={addBill}><Text style={styles.addBtnText}>Add Bill</Text></Pressable>
      <View style={styles.list}>{bills.map(b => (<View key={b.id} style={styles.row}><Text style={styles.rowName}>{b.name} {b.keep ? '↻' : ''}</Text><Text style={styles.rowAmt}>£{b.amount.toFixed(2)}</Text></View>))}</View>
      <Pressable style={styles.resetBtn} onPress={() => { setIncome(0); setBills([]); setSpends([]); AsyncStorage.clear(); }}><Text style={styles.resetText}>Reset All</Text></Pressable><View style={{height: 100}} /></ScrollView></View>);
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf8' }, header: { backgroundColor: LIME, padding: 20, paddingTop: 50, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: BLACK }, headerTotal: { fontSize: 22, fontWeight: '700', color: BLACK, marginTop: 4 }, headerSub: { fontSize: 14, fontWeight: '600', color: BLACK, opacity: 0.7, marginTop: 6 },
  blankWrap: { padding: 20, marginTop: 40, alignItems: 'center' }, blankBig: { fontSize: 20, fontWeight: '900', color: BLACK }, blankSub: { fontSize: 14, color: '#666', marginTop: 8 },
  weekRow: { flexDirection: 'row', gap: 10, padding: 16 }, weekBtn: { flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e5e5e5' },
  weekBtnActive: { backgroundColor: BLACK, borderColor: BLACK }, weekText: { fontWeight: '800', color: BLACK }, weekTextActive: { color: LIME },
  body: { padding: 16 }, bigCard: { backgroundColor: BLACK, borderRadius: 24, padding: 20, marginBottom: 20 }, bigCardLabel: { color: 'white', opacity: 0.6, fontSize: 12, fontWeight: '700' },
  bigCardAmount: { color: 'white', fontSize: 36, fontWeight: '900', marginTop: 6 }, bigCardSub: { color: 'white', opacity: 0.6, fontSize: 12, marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginTop: 16, marginBottom: 8, color: BLACK }, input: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#ddd', color: BLACK },
  addBtn: { backgroundColor: BLACK, borderRadius: 14, padding: 16, marginTop: 10, alignItems: 'center' }, addBtnText: { color: LIME, fontWeight: '900', fontSize: 16 },
  list: { marginTop: 10 }, row: { backgroundColor: 'white', padding: 14, borderRadius: 12, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: '#eee' },
  rowName: { fontWeight: '700', color: BLACK }, rowAmt: { fontWeight: '700', color: BLACK }, keepRow: { backgroundColor: 'white', padding: 12, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: '#ddd' },
  keepRowActive: { borderColor: LIME, backgroundColor: '#f7ffcc' }, keepText: { fontWeight: '700', color: BLACK }, resetBtn: { marginTop: 30, alignItems: 'center', padding: 12 }, resetText: { color: '#999', fontWeight: '700' }
});
