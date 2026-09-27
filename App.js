import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, StatusBar } from 'react-native';

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expenses;

  const addTransaction = () => {
    if (!title ||!amount) return;
    const newTx = {
      id: Date.now().toString(),
      title: title,
      amount: Number(amount),
      type: type
    };
    setTransactions([newTx,...transactions]);
    setTitle('');
    setAmount('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <Text style={styles.header}>Money Management</Text>
      <Text style={styles.sub}>Blank for Everyone - S25 Ultra Ready</Text>

      <View style={styles.balanceBox}>
        <Text style={styles.balanceText}>Balance: £{balance.toFixed(2)}</Text>
        <Text>Income: £{income.toFixed(2)} | Expense: £{expenses.toFixed(2)}</Text>
      </View>

      <TextInput style={styles.input} placeholder="Title e.g. Wages" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Amount e.g. 100" keyboardType="numeric" value={amount} onChangeText={setAmount} />

      <View style={styles.row}>
        <TouchableOpacity style={[styles.typeBtn, type === 'income' && styles.incomeActive]} onPress={() => setType('income')}>
          <Text style={styles.typeText}>Income</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.typeBtn, type === 'expense' && styles.expenseActive]} onPress={() => setType('expense')}>
          <Text style={styles.typeText}>Expense</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={addTransaction}>
        <Text style={styles.addText}>+ Add Transaction</Text>
      </TouchableOpacity>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={{color: item.type === 'income'? 'green' : 'red'}}>£{item.amount} - {item.type}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20, color:'gray'}}>No transactions yet - starts blank £0.00</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 26, fontWeight: 'bold', marginTop: 10 },
  sub: { color: 'gray', marginBottom: 16 },
  balanceBox: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  balanceText: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 10, marginBottom: 10, elevation: 1 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  typeBtn: { flex: 1, padding: 12, backgroundColor: '#ccc', borderRadius: 10, alignItems: 'center' },
  incomeActive: { backgroundColor: '#22c55e' },
  expenseActive: { backgroundColor: '#ef4444' },
  typeText: { color: 'white', fontWeight: 'bold' },
  addBtn: { backgroundColor: 'black', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  addText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: 'white', padding: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontWeight: 'bold' }
});
