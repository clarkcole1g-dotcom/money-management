import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

export default function App() {
  const [tx, setTx] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const bal = tx.reduce((s,t)=> s + (t.type==='income'? Number(t.amount):-Number(t.amount)),0);

  return (
    <View style={styles.c}>
      <Text style={styles.h}>Money Management</Text>
      <Text>Balance: £{bal.toFixed(2)} - BLANK FOR ALL PHONES</Text>
      <TextInput style={styles.i} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.i} placeholder="Amount" keyboardType="numeric" value={amount} onChangeText={setAmount} />
      <TouchableOpacity style={styles.b} onPress={()=>{ if(title&&amount){ setTx([{id:Date.now().toString(),title,amount,type:'income'},...tx]); setTitle(''); setAmount(''); }}}><Text style={{color:'white'}}>Add Income</Text></TouchableOpacity>
      <FlatList data={tx} keyExtractor={x=>x.id} renderItem={({item})=><View style={styles.card}><Text>{item.title} £{item.amount}</Text></View>} />
    </View>
  );
}
const styles = StyleSheet.create({
  c:{flex:1,padding:20,paddingTop:60,backgroundColor:'#f2f2f2'},
  h:{fontSize:22,fontWeight:'bold',marginBottom:10},
  i:{backgroundColor:'white',padding:12,borderRadius:8,marginBottom:10},
  b:{backgroundColor:'black',padding:12,borderRadius:8,alignItems:'center',marginBottom:20},
  card:{backgroundColor:'white',padding:10,borderRadius:8,marginBottom:6}
});
