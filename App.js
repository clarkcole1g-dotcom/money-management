
import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TextInput, Pressable, ScrollView, StyleSheet, Platform, StatusBar, Keyboard, Dimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const BLACK='#0a0a0a'; const LIME='#d6ff00'; const GRAY='#f5f5f5';
export default function App(){
  const [tab,setTab]=useState('cal');
  const [incomes,setIncomes]=useState([]); const [bills,setBills]=useState([]); const [spends,setSpends]=useState([]);
  const [incName,setIncName]=useState(''); const [incAmt,setIncAmt]=useState(''); const [incDay,setIncDay]=useState(''); const [incFreq,setIncFreq]=useState('Monthly');
  const [billName,setBillName]=useState(''); const [billAmt,setBillAmt]=useState(''); const [billDay,setBillDay]=useState(''); const [billFreq,setBillFreq]=useState('Monthly');
  const [editingIncomeId,setEditingIncomeId]=useState(null); const [editingBillId,setEditingBillId]=useState(null);
  const [keyboardVisible,setKeyboardVisible]=useState(false);
  const [quickName,setQuickName]=useState(''); const [quickAmt,setQuickAmt]=useState('');
  const today=new Date(); const [curMonth,setCurMonth]=useState(new Date(today.getFullYear(),today.getMonth(),1));
  const year=curMonth.getFullYear(); const month=curMonth.getMonth();
  const daysInMonth=new Date(year,month+1,0).getDate(); const firstDay=new Date(year,month,1).getDay();
  const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
  useEffect(()=>{const s=Keyboard.addListener('keyboardDidShow',()=>setKeyboardVisible(true)); const h=Keyboard.addListener('keyboardDidHide',()=>setKeyboardVisible(false)); return()=>{s.remove(); h.remove();};},[]);
  useEffect(()=>{AsyncStorage.getItem('v10_data').then(d=>{if(d){const p=JSON.parse(d); setIncomes(p.incomes||[]); setBills(p.bills||[]); setSpends(p.spends||[]);}});},[]);
  useEffect(()=>{AsyncStorage.setItem('v10_data',JSON.stringify({incomes,bills,spends}));},[incomes,bills,spends]);
  const monthlyIncomeTotal=incomes.reduce((s,i)=>s+(i.freq==='Weekly'?i.amount*4.33:i.amount),0);
  const monthlyBillsTotal=bills.reduce((s,b)=>s+(b.freq==='Weekly'?b.amount*4.33:b.amount),0);
  const monthlyLeft=monthlyIncomeTotal-monthlyBillsTotal;
  const weekly=monthlyLeft/4.33; const weeklyLeft=weekly-spends.reduce((s,x)=>s+x.amount,0);
  const getDayEvents=(d)=>{const ev=[]; incomes.forEach(i=>{if(i.day===d) ev.push({type:'income',...i});}); bills.forEach(b=>{if(b.day===d) ev.push({type:'bill',...b});}); return ev;};
  const addIncome=()=>{const amt=parseFloat(incAmt); if(!incName||!amt) return; const day=parseInt(incDay)||1; if(editingIncomeId){setIncomes(prev=>prev.map(i=>i.id===editingIncomeId?{...i,name:incName,amount:amt,day,freq:incFreq}:i)); setEditingIncomeId(null);} else {setIncomes(prev=>[...prev,{id:Date.now().toString(),name:incName,amount:amt,day,freq:incFreq}]);} setIncName(''); setIncAmt(''); setIncDay('');};
  const addBill=()=>{const amt=parseFloat(billAmt); if(!billName||!amt) return; const day=parseInt(billDay)||1; if(editingBillId){setBills(prev=>prev.map(b=>b.id===editingBillId?{...b,name:billName,amount:amt,day,freq:billFreq}:b)); setEditingBillId(null);} else {setBills(prev=>[...prev,{id:Date.now().toString(),name:billName,amount:amt,day,freq:billFreq}]);} setBillName(''); setBillAmt(''); setBillDay('');};
  const editIncome=(item)=>{setIncName(item.name); setIncAmt(item.amount.toString()); setIncDay(item.day.toString()); setIncFreq(item.freq); setEditingIncomeId(item.id); setTab('cal'); setTimeout(()=>setTab('bills'),100);};
  const editBill=(item)=>{setBillName(item.name); setBillAmt(item.amount.toString()); setBillDay(item.day.toString()); setBillFreq(item.freq); setEditingBillId(item.id);};
  return(
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={{paddingBottom: keyboardVisible?0:20, paddingTop: Platform.OS==='android'?(StatusBar.currentHeight||0):0}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {tab==='cal' && (
          <View style={styles.blackCard}>
            <View style={styles.blackTopRow}><Text style={styles.blackTopLabel}>{incomes.length===0?'ADD INCOME TO START':'BALANCE'}</Text><View style={styles.weekPill}><Text style={styles.weekPillText}>£{weeklyLeft>0?weeklyLeft.toFixed(0):'0'} / WEEK</Text></View></View>
            <Text style={styles.bigMoney}>£{weekly>0?weeklyLeft.toFixed(2):'0.00'}</Text>
            <Text style={styles.noData}>{incomes.length===0?'NO DATA - ADD INCOME & BILLS':`${monthlyIncomeTotal.toFixed(0)} income - ${monthlyBillsTotal.toFixed(0)} bills = ${monthlyLeft.toFixed(0)} left`}</Text>
          </View>
        )}
        {tab==='cal' && (
          <View style={styles.calCard}>
            <View style={styles.calHeader}><Pressable onPress={()=>setCurMonth(new Date(year,month-1,1))}><Text style={styles.calArrow}>‹</Text></Pressable><Text style={styles.calMonth}>{monthNames[month]} {year}</Text><Pressable onPress={()=>setCurMonth(new Date(year,month+1,1))}><Text style={styles.calArrow}>›</Text></Pressable></View>
            <View style={styles.weekRow}>{['S','M','T','W','T','F','S'].map(d=><Text key={d} style={styles.weekDay}>{d}</Text>)}</View>
            <View style={styles.daysGrid}>{Array.from({length:firstDay}).map((_,i)=><View key={'e'+i} style={styles.dayCell}/>)}
              {Array.from({length:daysInMonth}).map((_,i)=>{const d=i+1; const ev=getDayEvents(d); const isToday=d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear(); return(
                <View key={d} style={[styles.dayCell, isToday&&styles.todayCell]}><Text style={[styles.dayNum, isToday&&styles.todayNum]}>{d}</Text>{ev.slice(0,2).map((e,j)=><View key={j} style={[styles.dot, e.type==='income'?styles.dotIncome:styles.dotBill]}/>)}</View>
              )})}
            </View>
            <View style={styles.quickRow}><TextInput style={styles.quickInput} placeholder="What did you spend?" value={quickName} onChangeText={setQuickName}/><TextInput style={styles.quickAmt} placeholder="£" keyboardType="numeric" value={quickAmt} onChangeText={setQuickAmt}/><Pressable style={styles.quickAdd} onPress={()=>{const a=parseFloat(quickAmt); if(!a) return; setSpends([...spends,{id:Date.now().toString(),name:quickName||'Spend',amount:a,date:today.toISOString()}]); setQuickName(''); setQuickAmt('');}}><Text style={styles.quickAddText}>Add</Text></Pressable></View>
          </View>
        )}
        {tab==='bills' && (
          <>
            <View style={styles.section}><Text style={styles.sectionTitle}>INCOMES {incomes.length===0?'- BLANK START':''}</Text><Text style={styles.sectionSub}>Tap EDIT to change £/Day/Name • Tap M/W to switch Weekly/Monthly</Text>
              <View style={styles.inputCard}>
                <View style={styles.inputRow}><TextInput style={[styles.input, {flex:2}]} placeholder="Income name" value={incName} onChangeText={setIncName}/><TextInput style={styles.inputSmall} placeholder="£" keyboardType="numeric" value={incAmt} onChangeText={setIncAmt}/><TextInput style={styles.inputSmall} placeholder="Day" keyboardType="numeric" value={incDay} onChangeText={setIncDay}/></View>
                <View style={styles.freqRow}><Pressable onPress={()=>setIncFreq('Weekly')} style={[styles.freqChip, incFreq==='Weekly'&&styles.freqActive]}><Text style={[styles.freqText, incFreq==='Weekly'&&styles.freqTextActive]}>Weekly</Text></Pressable><Pressable onPress={()=>setIncFreq('Monthly')} style={[styles.freqChip, incFreq==='Monthly'&&styles.freqActive]}><Text style={[styles.freqText, incFreq==='Monthly'&&styles.freqTextActive]}>Monthly</Text></Pressable><Pressable style={[styles.addBlack, editingIncomeId&&{backgroundColor:LIME}]} onPress={addIncome}><Text style={[styles.addBlackText, editingIncomeId&&{color:BLACK}]}>{editingIncomeId?'Update':'Add'}</Text></Pressable></View>
                {incomes.map(i=><View key={i.id} style={styles.listRow}><View style={{flex:1}}><Text style={styles.listName}>{i.name} • Day {i.day} • {i.freq}</Text><Text style={styles.listAmt}>+£{i.amount}</Text></View><Pressable onPress={()=>editIncome(i)} style={styles.editBtn}><Text style={styles.editBtnText}>EDIT</Text></Pressable><Pressable onPress={()=>setIncomes(prev=>prev.map(x=>x.id===i.id?{...x,freq:x.freq==='Weekly'?'Monthly':'Weekly'}:x))} style={styles.toggleBtn}><Text style={styles.toggleText}>{i.freq==='Weekly'?'W':'M'}</Text></Pressable><Pressable onPress={()=>setIncomes(prev=>prev.filter(x=>x.id!==i.id))} style={styles.delBtn}><Text style={styles.delText}>X</Text></Pressable></View>)}
              </View>
            </View>
            <View style={styles.section}><Text style={styles.sectionTitle}>BILLS - BLANK START</Text><Text style={styles.sectionSub}>Auto-deducted. Weekly budget drops automatically.</Text>
              <View style={styles.inputCard}>
                <View style={styles.inputRow}><TextInput style={[styles.input, {flex:2}]} placeholder="Bill name" value={billName} onChangeText={setBillName}/><TextInput style={styles.inputSmall} placeholder="£" keyboardType="numeric" value={billAmt} onChangeText={setBillAmt}/><TextInput style={styles.inputSmall} placeholder="Day" keyboardType="numeric" value={billDay} onChangeText={setBillDay}/></View>
                <View style={styles.freqRow}><Pressable onPress={()=>setBillFreq('Weekly')} style={[styles.freqChip, billFreq==='Weekly'&&styles.freqActive]}><Text style={[styles.freqText, billFreq==='Weekly'&&styles.freqTextActive]}>Weekly</Text></Pressable><Pressable onPress={()=>setBillFreq('Monthly')} style={[styles.freqChip, billFreq==='Monthly'&&styles.freqActive]}><Text style={[styles.freqText, billFreq==='Monthly'&&styles.freqTextActive]}>Monthly</Text></Pressable><Pressable style={[styles.addBlack, editingBillId&&{backgroundColor:LIME}]} onPress={addBill}><Text style={[styles.addBlackText, editingBillId&&{color:BLACK}]}>{editingBillId?'Update':'Add'}</Text></Pressable></View>
                {bills.map(b=><View key={b.id} style={styles.listRow}><View style={{flex:1}}><Text style={styles.listName}>{b.name} • Day {b.day} • {b.freq}</Text><Text style={styles.listAmtNeg}>-£{b.amount}</Text></View><Pressable onPress={()=>editBill(b)} style={styles.editBtn}><Text style={styles.editBtnText}>EDIT</Text></Pressable><Pressable onPress={()=>setBills(prev=>prev.map(x=>x.id===b.id?{...x,freq:x.freq==='Weekly'?'Monthly':'Weekly'}:x))} style={styles.toggleBtn}><Text style={styles.toggleText}>{b.freq==='Weekly'?'W':'M'}</Text></Pressable><Pressable onPress={()=>setBills(prev=>prev.filter(x=>x.id!==b.id))} style={styles.delBtn}><Text style={styles.delText}>X</Text></Pressable></View>)}
              </View>
            </View>
            <View style={styles.summaryCard}><Text style={styles.summaryLabel}>SUMMARY - PHONE MEMORY</Text><Text style={styles.summaryLine}>£{monthlyIncomeTotal.toFixed(0)} income - £{monthlyBillsTotal.toFixed(0)} bills = £{monthlyLeft.toFixed(0)}</Text><Text style={styles.summaryBig}>£{weekly>0?weekly.toFixed(0):'0'}/week to spend</Text><Text style={styles.summarySub}>Saved to phone automatically - no data when fresh install</Text></View>
            <Pressable onPress={()=>{setIncomes([]); setBills([]); setSpends([]); AsyncStorage.clear();}} style={styles.clearBtn}><Text style={styles.clearText}>Clear Phone Memory</Text></Pressable>
          </>
        )}
        {!keyboardVisible && (
          <View style={styles.bottomTabsScroll}><Pressable onPress={()=>setTab('cal')} style={[styles.tabBtn, tab==='cal'&&styles.tabActive]}><Text style={[styles.tabText, tab==='cal'&&styles.tabTextActive]}>Calendar</Text></Pressable><Pressable onPress={()=>setTab('bills')} style={[styles.tabBtn, tab==='bills'&&styles.tabActive]}><Text style={[styles.tabText, tab==='bills'&&styles.tabTextActive]}>Bills & Income</Text></Pressable></View>
        )}
      </ScrollView>
    </View>
  );
}
const styles=StyleSheet.create({
  root:{flex:1, backgroundColor:GRAY},
  scroll:{flex:1},
  blackCard:{backgroundColor:BLACK, margin:14, marginTop:8, marginBottom:12, borderRadius:20, padding:14},
  blackTopRow:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4},
  blackTopLabel:{color:'#aaa', fontSize:10, fontWeight:'700', letterSpacing:1},
  weekPill:{backgroundColor:'white', borderRadius:14, paddingHorizontal:10, paddingVertical:4},
  weekPillText:{color:BLACK, fontSize:10, fontWeight:'900'},
  bigMoney:{color:'white', fontSize:30, fontWeight:'900', letterSpacing:-1, marginBottom:2},
  noData:{color:'#888', fontSize:10, marginTop:2},
  calCard:{backgroundColor:'white', margin:14, borderRadius:20, padding:14},
  calHeader:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12},
  calArrow:{fontSize:28, fontWeight:'700'}, calMonth:{fontSize:16, fontWeight:'800'},
  weekRow:{flexDirection:'row', justifyContent:'space-around', marginBottom:8}, weekDay:{color:'#aaa', fontSize:12, fontWeight:'700', width:32, textAlign:'center'},
  daysGrid:{flexDirection:'row', flexWrap:'wrap'}, dayCell:{width:(Dimensions.get('window').width-56)/7, height:38, alignItems:'center', justifyContent:'center'}, dayNum:{fontSize:13}, todayCell:{backgroundColor:BLACK, borderRadius:16}, todayNum:{color:'white', fontWeight:'900'},
  dot:{width:6, height:6, borderRadius:3, marginTop:2}, dotIncome:{backgroundColor:LIME}, dotBill:{backgroundColor:'#ff5a5a'},
  quickRow:{flexDirection:'row', marginTop:12, gap:8}, quickInput:{flex:1, backgroundColor:GRAY, borderRadius:12, padding:10, fontSize:13}, quickAmt:{width:60, backgroundColor:GRAY, borderRadius:12, padding:10, fontSize:13}, quickAdd:{backgroundColor:BLACK, borderRadius:12, paddingHorizontal:16, justifyContent:'center'}, quickAddText:{color:'white', fontWeight:'900'},
  section:{margin:14}, sectionTitle:{fontSize:18, fontWeight:'900', marginBottom:4}, sectionSub:{color:'#888', fontSize:12, marginBottom:10},
  inputCard:{backgroundColor:'white', borderRadius:20, padding:14}, inputRow:{flexDirection:'row', gap:8, marginBottom:10}, input:{backgroundColor:GRAY, borderRadius:12, padding:12, fontSize:14}, inputSmall:{backgroundColor:GRAY, borderRadius:12, padding:12, width:64, fontSize:14},
  freqRow:{flexDirection:'row', gap:8, alignItems:'center'}, freqChip:{backgroundColor:GRAY, borderRadius:20, paddingHorizontal:14, paddingVertical:8}, freqActive:{backgroundColor:BLACK}, freqText:{fontSize:12, fontWeight:'700', color:'#888'}, freqTextActive:{color:'white'},
  addBlack:{backgroundColor:BLACK, borderRadius:20, paddingHorizontal:22, paddingVertical:10, marginLeft:'auto'}, addBlackText:{color:'white', fontWeight:'900'},
  listRow:{flexDirection:'row', alignItems:'center', paddingVertical:10, borderTopWidth:1, borderTopColor:'#f0f0f0', marginTop:8}, listName:{fontSize:13, fontWeight:'600'}, listAmt:{color:'#0a0a0a', fontWeight:'800', fontSize:13, marginTop:2}, listAmtNeg:{color:'#ff5a5a', fontWeight:'800', fontSize:13, marginTop:2},
  editBtn:{backgroundColor:'#e8ffe8', paddingHorizontal:10, paddingVertical:6, borderRadius:10, marginLeft:6}, editBtnText:{fontSize:11, fontWeight:'900', color:BLACK},
  toggleBtn:{width:32, height:32, borderRadius:16, backgroundColor:BLACK, alignItems:'center', justifyContent:'center', marginLeft:6}, toggleText:{color:'white', fontWeight:'900', fontSize:12},
  delBtn:{width:32, height:32, borderRadius:16, backgroundColor:'#ffecec', alignItems:'center', justifyContent:'center', marginLeft:6}, delText:{color:'#ff5a5a', fontWeight:'900', fontSize:12},
  summaryCard:{backgroundColor:BLACK, margin:14, borderRadius:20, padding:16}, summaryLabel:{color:'#666', fontSize:10, fontWeight:'700', letterSpacing:1, marginBottom:8}, summaryLine:{color:'white', fontSize:13, fontWeight:'600', marginBottom:6}, summaryBig:{color:LIME, fontSize:26, fontWeight:'900', marginBottom:6}, summarySub:{color:'#666', fontSize:10},
  clearBtn:{backgroundColor:'#fff0f0', margin:14, borderRadius:16, padding:14, alignItems:'center', borderWidth:1, borderColor:'#ffd0d0'}, clearText:{color:'#ff5a5a', fontWeight:'800'},
  bottomTabsScroll:{margin:14, marginTop:20, backgroundColor:'white', borderRadius:28, padding:6, flexDirection:'row', elevation:8},
  tabBtn:{flex:1, paddingVertical:12, borderRadius:20, alignItems:'center'}, tabActive:{backgroundColor:BLACK}, tabText:{fontWeight:'700', color:'#aaa'}, tabTextActive:{color:'white'}
});
