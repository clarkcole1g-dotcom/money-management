import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [tx, setTx] = useState([]);

  const add = () => {
    if(!amount) return;
    setTx([{ id: Date.now().toString(), amount: parseFloat(amount), note: note || 'Expense' }, ...tx]);
    setAmount(''); setNote('');
  };

  const total = tx.reduce((s, t) => s + t.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Money Manager</Text>
        <Text style={styles.total}>£{total.toFixed(2)}</Text>
      </View>
      <View style={styles.box}>
        <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Note" value={note} onChangeText={setNote} />
        <TouchableOpacity style={styles.btn} onPress={add}><Text style={styles.btnT}>Add</Text></TouchableOpacity>
      </View>
      <FlatList data={tx} keyExtractor={i=>i.id} renderItem={({item})=>(
        <View style={styles.row}><Text>{item.note}</Text><Text>£{item.amount.toFixed(2)}</Text></View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { backgroundColor: '#C6FF00', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold' },
  total: { fontSize: 18, marginTop: 5 },
  box: { padding: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 8 },
  btn: { backgroundColor: '#000', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnT: { color: '#C6FF00', fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderColor: '#eee' }
});
