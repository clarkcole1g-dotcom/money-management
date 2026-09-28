import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LIME = '#C6FF00';
const BLACK = '#0a0a0a';
const GREY = '#f5f5f0';

export default function App() {
  const [tab, setTab] = useState('calendar'); // calendar | manage
  const [incomes, setIncomes] = useState([]); // {id,name,amount,date,recurring}
  const [bills, setBills] = useState([]); // {id,name,amount,freq: 'weekly'|'monthly', day, keep}
  const [spends, setSpends] = useState([]); // {id,name,amount,date}
  const [incName, setIncName] = useState('');
  const [incAmt, setIncAmt] = useState('');
  const [incDate, setIncDate] = useState(new Date().getDate().toString());
  const [billName, setBillName] = useState('');
  const [billAmt, setBillAmt] = useState('');
  const [billFreq, setBillFreq] = useState('monthly');
  const [billDay, setBillDay] = useState('1');
  const [billKeep, setBillKeep] = useState(true);
  const [quickName, setQuickName] = useState('');
  const [quickAmt, setQuickAmt] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const today = new Date();
  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  useEffect(() => {
    (async () => {
      try {
        const s = await AsyncStorage.getItem('mm_full');
        if(s){ const d=JSON.parse(s); setIncomes(d.incomes||[]); setBills(d.bills||[]); setSpends(d.spends||[]); }
      } catch{}
    })();
  }, []);
  useEffect(() => { AsyncStorage.setItem('mm_full', JSON.stringify({incomes,bills,spends})); }, [incomes,bills,spends]);

  const totalIncome = incomes.reduce((a,b)=>a+b.amount,0);
  const totalBillsMonthly = bills.reduce((a,b)=>a + (b.freq==='monthly'? b.amount : b.amount*4.33), 0);
  const totalBillsWeekly = bills.reduce((a,b)=>a + (b.freq==='weekly'? b.amount : b.amount/4.33), 0);
  const weeklyPot = totalIncome ? (totalIncome - totalBillsMonthly)/4.33 : 0;
  const totalSpendsWeek = spends.filter(s=>{ const d=new Date(s.date); return d.getMonth()===month && Math.ceil(d.getDate()/7)===Math.ceil(today.getDate()/7); }).reduce((a,b)=>a+b.amount,0);
  const canSpend = weeklyPot - totalSpendsWeek;

  const addIncome = () => {
    const amt=parseFloat(incAmt); if(!incName||!amt) return;
    setIncomes([...incomes, {id:Date.now().toString(), name:incName, amount:amt, day:parseInt(incDate)||today.getDate(), recurring:true}]);
    setIncName(''); setIncAmt('');
  };
  const addBill = () => {
    const amt=parseFloat(billAmt); if(!billName||!amt) return;
    setBills([...bills, {id:Date.now().toString(), name:billName, amount:amt, freq:billFreq, day:parseInt(billDay)||1, keep:billKeep}]);
    setBillName(''); setBillAmt('');
  };
  const addQuick = () => {
    const amt=parseFloat(quickAmt); if(!quickName||!amt) return;
    setSpends([...spends, {id:Date.now().toString(), name:quickName, amount:amt, date:new Date().toISOString()}]);
    setQuickName(''); setQuickAmt('');
  };

  const renderCalendar = () => {
    const days=[];
    for(let i=0;i<firstDay;i++) days.push(<View key={'e'+i} style={styles.calEmpty} />);
    for(let d=1;d<=daysInMonth;d++){
      const hasIncome = incomes.some(i=>i.day===d);
      const hasBill = bills.some(b=>b.day===d);
      const isToday = d===today.getDate() && month===today.getMonth();
      days.push(
        <Pressable key={d} style={[styles.calDay, isToday&&styles.calToday, (hasIncome||hasBill)&&styles.calHas]}>
          <Text style={[styles.calDayText, isToday&&styles.calTodayText]}>{d}</Text>
          <View style={styles.calDots}>
            {hasIncome && <View style={styles.dotIncome} />}
            {hasBill && <View style={styles.dotBill} />}
          </View>
        </Pressable>
      );
    }
    return days;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Money Management</Text>
        <Text style={styles.headerAmt}>£{totalIncome>0?canSpend.toFixed(2):'0.00'} / week</Text>
        <Text style={styles.headerSub}>{incomes.length>0?`£${totalIncome.toFixed(0)} income • £${totalBillsMonthly.toFixed(0)} bills/mo`: 'ADD INCOME TO START'}</Text>
      </View>

      <View style={styles.tabs}>
        <Pressable onPress={()=>setTab('calendar')} style={[styles.tab, tab==='calendar'&&styles.tabActive]}><Text style={[styles.tabText, tab==='calendar'&&styles.tabTextActive]}>📅 Calendar</Text></Pressable>
        <Pressable onPress={()=>setTab('manage')} style={[styles.tab, tab==='manage'&&styles.tabActive]}><Text style={[styles.tabText, tab==='manage'&&styles.tabTextActive]}>💷 Bills & Income</Text></Pressable>
      </View>

      {tab==='calendar' ? (
        <ScrollView style={styles.body}>
          <View style={styles.bigCard}>
            <Text style={styles.bigLabel}>YOU CAN SPEND THIS WEEK</Text>
            <Text style={styles.bigAmount}>£{canSpend>0?canSpend.toFixed(2):'0.00'}</Text>
            <Text style={styles.bigSub}>Weekly pot £{weeklyPot.toFixed(2)} • Spent £{totalSpendsWeek.toFixed(2)} • Bills £{totalBillsWeekly.toFixed(2)}/wk</Text>
          </View>

          <Text style={styles.sectionTitle}>{selectedDate.toLocaleString('default',{month:'long'})} {year}</Text>
          <View style={styles.calGrid}>{renderCalendar()}</View>
          <View style={styles.legend}><View style={styles.legendRow}><View style={styles.dotIncome}/><Text style={styles.legendText}>Income</Text></View><View style={styles.legendRow}><View style={styles.dotBill}/><Text style={styles.legendText}>Bill</Text></View></View>

          <View style={styles.dateList}>
            {incomes.filter(i=>i.day===today.getDate()).map(i=><View key={i.id} style={styles.eventRow}><View style={styles.eventDotIncome}/><Text style={styles.eventName}>{i.name}</Text><Text style={styles.eventAmt}>+£{i.amount.toFixed(2)}</Text></View>)}
            {bills.filter(b=>b.day===today.getDate()).map(b=><View key={b.id} style={styles.eventRow}><View style={styles.eventDotBill}/><Text style={styles.eventName}>{b.name} ({b.freq})</Text><Text style={styles.eventAmt}>-£{b.amount.toFixed(2)}</Text></View>)}
          </View>

          <Text style={styles.sectionTitle}>Quick Add — Shop (takes off weekly)</Text>
          <View style={styles.quickRow}>
            <TextInput style={[styles.input, {flex:1}]} placeholder="e.g. Tesco, Fuel" value={quickName} onChangeText={setQuickName} placeholderTextColor="#999" />
            <TextInput style={[styles.input, {width:100, marginLeft:8}]} placeholder="£" value={quickAmt} onChangeText={setQuickAmt} keyboardType="numeric" placeholderTextColor="#999" />
          </View>
          <Pressable style={styles.addBtn} onPress={addQuick}><Text style={styles.addBtnText}>Add — Deduct from this week</Text></Pressable>

          <View style={styles.list}>
            {spends.slice(-10).reverse().map(s=><View key={s.id} style={styles.row}><Text style={styles.rowName}>{s.name}</Text><Text style={styles.rowAmt}>-£{s.amount.toFixed(2)}</Text></View>)}
          </View>
          <View style={{height:120}}/>
        </ScrollView>
      ) : (
        <ScrollView style={styles.body}>
          {incomes.length===0 && bills.length===0 && (
            <View style={styles.welcome}><Text style={styles.welcomeTitle}>👋 Welcome! No data yet.</Text><Text style={styles.welcomeSub}>Add your incomes first, then bills</Text></View>
          )}

          <Text style={styles.sectionTitle}>Add Income (as many as you like)</Text>
          <TextInput style={styles.input} placeholder="Income name" value={incName} onChangeText={setIncName} placeholderTextColor="#999" />
          <View style={styles.quickRow}>
            <TextInput style={[styles.input,{flex:1}]} placeholder="Amount" value={incAmt} onChangeText={setIncAmt} keyboardType="numeric" placeholderTextColor="#999" />
            <TextInput style={[styles.input,{width:80,marginLeft:8}]} placeholder="Day" value={incDate} onChangeText={setIncDate} keyboardType="numeric" placeholderTextColor="#999" />
          </View>
          <Pressable style={styles.addBtnGreen} onPress={addIncome}><Text style={styles.addBtnGreenText}>+ Add Income</Text></Pressable>

          <View style={styles.list}>
            {incomes.map(i=><View key={i.id} style={styles.rowGreen}><Text style={styles.rowName}>{i.name} — Day {i.day}</Text><Text style={styles.rowAmtGreen}>+£{i.amount.toFixed(2)}</Text></View>)}
          </View>

          <Text style={styles.sectionTitle}>Add Bill — Pick Monthly or Weekly</Text>
          <TextInput style={styles.input} placeholder="Bill name" value={billName} onChangeText={setBillName} placeholderTextColor="#999" />
          <View style={styles.quickRow}>
            <TextInput style={[styles.input,{flex:1}]} placeholder="Amount" value={billAmt} onChangeText={setBillAmt} keyboardType="numeric" placeholderTextColor="#999" />
            <TextInput style={[styles.input,{width:70,marginLeft:8}]} placeholder="Day" value={billDay} onChangeText={setBillDay} keyboardType="numeric" placeholderTextColor="#999" />
          </View>
          <View style={styles.freqRow}>
            <Pressable onPress={()=>setBillFreq('monthly')} style={[styles.freqBtn, billFreq==='monthly'&&styles.freqActive]}><Text style={[styles.freqText, billFreq==='monthly'&&styles.freqTextActive]}>Monthly</Text></Pressable>
            <Pressable onPress={()=>setBillFreq('weekly')} style={[styles.freqBtn, billFreq==='weekly'&&styles.freqActive]}><Text style={[styles.freqText, billFreq==='weekly'&&styles.freqTextActive]}>Weekly</Text></Pressable>
          </View>
          <Pressable style={[styles.keepRow, billKeep&&styles.keepActive]} onPress={()=>setBillKeep(!billKeep)}><Text style={styles.keepText}>{billKeep?'✓ Keep going till unticked':'○ One time only'}</Text></Pressable>
          <Pressable style={styles.addBtn} onPress={addBill}><Text style={styles.addBtnText}>+ Add Bill ({billFreq})</Text></Pressable>

          <View style={styles.list}>
            {bills.map(b=><View key={b.id} style={styles.row}><View><Text style={styles.rowName}>{b.name} {b.keep?'↻':''}</Text><Text style={styles.rowSub}>{b.freq} • Day {b.day}</Text></View><Text style={styles.rowAmt}>-£{b.amount.toFixed(2)}</Text></View>)}
          </View>

          <Pressable style={styles.resetBtn} onPress={()=>{setIncomes([]);setBills([]);setSpends([]); AsyncStorage.clear();}}><Text style={styles.resetText}>Reset All Data</Text></Pressable>
          <View style={{height:120}}/>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor:'#fafaf8'},
  header:{backgroundColor:LIME, padding:20, paddingTop:50, borderBottomLeftRadius:24, borderBottomRightRadius:24},
  headerTitle:{fontSize:28, fontWeight:'900', color:BLACK},
  headerAmt:{fontSize:20, fontWeight:'800', color:BLACK, marginTop:4},
  headerSub:{fontSize:12, fontWeight:'600', color:BLACK, opacity:0.6, marginTop:4},
  tabs:{flexDirection:'row', padding:12, gap:10},
  tab:{flex:1, backgroundColor:'white', padding:14, borderRadius:14, alignItems:'center', borderWidth:1, borderColor:'#e5e5e5'},
  tabActive:{backgroundColor:BLACK, borderColor:BLACK},
  tabText:{fontWeight:'800', color:BLACK},
  tabTextActive:{color:LIME},
  body:{padding:16},
  bigCard:{backgroundColor:BLACK, borderRadius:24, padding:20, marginBottom:16},
  bigLabel:{color:'white', opacity:0.6, fontSize:11, fontWeight:'700'},
  bigAmount:{color:'white', fontSize:34, fontWeight:'900', marginTop:6},
  bigSub:{color:'white', opacity:0.5, fontSize:11, marginTop:6},
  sectionTitle:{fontSize:15, fontWeight:'800', marginTop:16, marginBottom:8, color:BLACK},
  input:{backgroundColor:'white', borderRadius:12, padding:14, borderWidth:1, borderColor:'#ddd', color:BLACK, marginTop:8},
  quickRow:{flexDirection:'row', alignItems:'center'},
  addBtn:{backgroundColor:BLACK, borderRadius:12, padding:14, marginTop:10, alignItems:'center'},
  addBtnText:{color:LIME, fontWeight:'900'},
  addBtnGreen:{backgroundColor:LIME, borderRadius:12, padding:14, marginTop:10, alignItems:'center', borderWidth:1, borderColor:BLACK},
  addBtnGreenText:{color:BLACK, fontWeight:'900'},
  list:{marginTop:10},
  row:{backgroundColor:'white', padding:14, borderRadius:12, marginTop:8, flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth:1, borderColor:'#eee'},
  rowGreen:{backgroundColor:'#f7ffcc', padding:14, borderRadius:12, marginTop:8, flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth:1, borderColor:LIME},
  rowName:{fontWeight:'700', color:BLACK},
  rowSub:{fontSize:11, color:'#666', marginTop:2},
  rowAmt:{fontWeight:'800', color:BLACK},
  rowAmtGreen:{fontWeight:'800', color:BLACK},
  freqRow:{flexDirection:'row', gap:8, marginTop:8},
  freqBtn:{flex:1, padding:12, borderRadius:12, backgroundColor:'white', borderWidth:1, borderColor:'#ddd', alignItems:'center'},
  freqActive:{backgroundColor:BLACK, borderColor:BLACK},
  freqText:{fontWeight:'800', color:BLACK},
  freqTextActive:{color:LIME},
  keepRow:{backgroundColor:'white', padding:12, borderRadius:12, marginTop:8, borderWidth:1, borderColor:'#ddd'},
  keepActive:{borderColor:LIME, backgroundColor:'#f7ffcc'},
  keepText:{fontWeight:'700', color:BLACK},
  calGrid:{flexDirection:'row', flexWrap:'wrap', backgroundColor:'white', borderRadius:16, padding:8, borderWidth:1, borderColor:'#eee'},
  calDay:{width:'14.28%', aspectRatio:1, alignItems:'center', justifyContent:'center', borderRadius:10, marginVertical:2},
  calEmpty:{width:'14.28%', aspectRatio:1},
  calHas:{backgroundColor:'#f0f0f0'},
  calToday:{backgroundColor:BLACK},
  calDayText:{fontWeight:'600', color:BLACK, fontSize:13},
  calTodayText:{color:LIME},
  calDots:{flexDirection:'row', gap:3, marginTop:2},
  dotIncome:{width:5, height:5, borderRadius:3, backgroundColor:LIME, borderWidth:0.5, borderColor:BLACK},
  dotBill:{width:5, height:5, borderRadius:3, backgroundColor:BLACK},
  legend:{flexDirection:'row', gap:16, marginTop:10, paddingHorizontal:4},
  legendRow:{flexDirection:'row', alignItems:'center', gap:6},
  legendText:{fontSize:11, color:'#666', fontWeight:'600'},
  dateList:{marginTop:12},
  eventRow:{flexDirection:'row', alignItems:'center', backgroundColor:'white', padding:12, borderRadius:10, marginTop:6, borderWidth:1, borderColor:'#eee'},
  eventDotIncome:{width:8, height:8, borderRadius:4, backgroundColor:LIME, marginRight:8, borderWidth:1, borderColor:BLACK},
  eventDotBill:{width:8, height:8, borderRadius:4, backgroundColor:BLACK, marginRight:8},
  eventName:{flex:1, fontWeight:'700', color:BLACK, fontSize:13},
  eventAmt:{fontWeight:'800', color:BLACK, fontSize:13},
  welcome:{backgroundColor:'white', padding:20, borderRadius:16, alignItems:'center', marginBottom:16, borderWidth:1, borderColor:'#eee'},
  welcomeTitle:{fontWeight:'800', color:BLACK},
  welcomeSub:{fontSize:12, color:'#666', marginTop:4},
  resetBtn:{marginTop:24, alignItems:'center', padding:12},
  resetText:{color:'#999', fontWeight:'700'}
});
