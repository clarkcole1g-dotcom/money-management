import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';

export default function App() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [transactions, setTransactions] = useState([]);

  const addTransaction = () => {
    if (!amount) return;
    const newTx = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      note: note || 'Expense',
      date: new Date().toLocaleDateString()
    };
    setTransactions([newTx, ...transactions]);
    setAmount('');
    setNote('');
  };

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Money Management</Text>
        <Text style={styles.total}>Total: £{total.toFixed(2)}</Text>
      </View>

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Amount e.g. 25.50"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Note e.g. Groceries"
          value={note}
          onChangeText={setNote}
        />
        <TouchableOpacity style={styles.button} onPress={addTransaction}>
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemNote}>{item.note}</Text>
            <Text style={styles.itemAmount}>£{item.amount.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf8' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#C6FF00' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111' },
  total: { fontSize: 20, fontWeight: '600', marginTop: 8, color: '#333' },
  inputBox: { padding: 20, backgroundColor: '#fff', margin: 15, borderRadius: 15, elevation: 3 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 10, fontSize: 16 },
  button: { backgroundColor: '#111', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#C6FF00', fontWeight: 'bold', fontSize: 16 },
  list: { flex: 1, paddingHorizontal: 15 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 },
  itemNote: { fontSize: 16, fontWeight: '500' },
  itemAmount: { fontSize: 16, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' }
});
