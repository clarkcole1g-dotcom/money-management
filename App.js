import { SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [tx, setTx] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const balance = tx.reduce((s, t) => s + Number(t.amount || 0), 0);

  return (
    <SafeAreaView style={styles.c}>
      <Text style={styles.h}>Money Management - FINAL</Text>
      <Text style={styles.bal}>Balance: £{balance.toFixed(2)}</Text>
      <TextInput style={styles.i} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.i} placeholder="Amount" keyboardType="number-pad" value={amount} onChangeText={setAmount} />
      <TouchableOpacity style={styles.btn} onPress={() => {
        if (!title ||!amount) return;
        setTx([{ id: Date.now().toString(), title, amount },...tx]);
        setTitle(''); setAmount('');
      }}><Text style={styles.btnT}>ADD</Text></TouchableOpacity>
      <FlatList data={tx} keyExtractor={i => i.id} renderItem={({item}) => <View style={styles.card}><Text>{item.title} - £{item.amount}</Text></View>} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
  h: { fontSize: 22, fontWeight: 'bold' }, bal: { fontSize: 18, marginVertical: 10 },
  i: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 10 },
  btn: { backgroundColor: 'black', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  btnT: { color: 'white', fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 6 }
});
