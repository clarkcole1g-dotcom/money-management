import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Pressable, ScrollView, StyleSheet, Platform, StatusBar, Dimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const BLACK='#0a0a0a'; const LIME='#d6ff00'; const GRAY='#f5f5f5'; const PALE='#FFFACD';
export default function App(){
  const [tab,setTab]=useState('cal');
  const [incomes,setIncomes]=useState([]); const [bills,setBills]=useState([]); const [spends,setSpends]=useState([]);
  const [incName,setIncName]=useState(''); const [incAmt,setIncAmt]=useState(''); const [incDay,setIncDay]=useState(''); const [incFreq,setIncFreq]=useState('Monthly');
  const [billName,setBillName]=useState(''); const [billAmt,setBillAmt]=useState(''); const [billDay,setBillDay]=useState(''); const [billFreq,setBillFreq]=useState('Monthly');
  const [editingIncomeId,setEditingIncomeId]=useState(null); const [editingBillId,setEditingBillId]=useState(null);
  const [quickName,setQuickName]=useState(''); const [quickAmt,setQuickAmt]=useState('');
  const today=new Date(); const [curMonth,setCurMonth]=useState(new Date(today.getFullYear(),today.getMonth(),1));
  const year=curMonth.getFullYear(); const month=curMonth.getMonth();
  const daysInMonth=new Date(year,month+1,0).getDate(); const firstDay=new Date(year,month,1).getDay();
  const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
  useEffect(()=>{AsyncStorage.getItem('v_final').then(d=>{if(d){const p=JSON.parse(d); setIncomes(p.incomes||[]); setBills(p.bills||[]); let sp=p.spends||[]; const now=Date.now(); sp=sp.filter(s=> now - new Date(s.date).getTime() < 7*24*60*60*1000); setSpends(sp);}});},[]);
  useEffect(()=>{AsyncStorage.setItem('v_final',JSON.stringify({incomes,bills,spends}));},[incomes,bills,spends]);
  const monthlyIncomeTotal=incomes.reduce((s,i)=>s+(i.freq==='Weekly'?i.amount*4.33:i.amount),0);
  const monthlyBillsTotal=bills.reduce((s,b)=>s+(b.freq==='Weekly'?b.amount*4.33:b.amount),0);
  const monthlyLeft=monthlyIncomeTotal-monthlyBillsTotal;
  const totalSpent=spends.reduce((s,x)=>s+x.amount,0);
  const leftToSpend=monthlyLeft-totalSpent;
  const payday=incomes.length>0?Math.min(...incomes.map(i=>i.day)):9;
  const getDayInfo=(d)=>{let hasInc=incomes.some(i=>i.day===d); let hasBill=bills.some(b=>b.day===d); return {hasInc,hasBill};};
  const addIncome=()=>{const amt=parseFloat(incAmt); if(!incName||!amt) return; const day=parseInt(incDay)||1; if(editingIncomeId){setIncomes(prev=>prev.map(i=>i.id===editingIncomeId?{...i,name:incName,amount:amt,day,freq:incFreq}:i)); setEditingIncomeId(null);} else {setIncomes(prev=>[...prev,{id:Date.now().toString(),name:incName,amount:amt,day,freq:incFreq}]);} setIncName(''); setIncAmt(''); setIncDay('');};
  const addBill=()=>{const amt=parseFloat(billAmt); if(!billName||!amt) return; const day=parseInt(billDay)||1; if(editingBillId){setBills(prev=>prev.map(b=>b.id===editingBillId?{...b,name:billName,amount:amt,day,freq:billFreq}:b)); setEditingBillId(null);} else {setBills(prev=>[...prev,{id:Date.now().toString(),name:billName,amount:amt,day,freq:billFreq}]);} setBillName(''); setBillAmt(''); setBillDay('');};
  const editIncome=(item)=>{setIncName(item.name); setIncAmt(item.amount.toString()); setIncDay(item.day.toString()); setIncFreq(item.freq); setEditingIncomeId(item.id);};
  const editBill=(item)=>{setBillName(item.name); setBillAmt(item.amount.toString()); setBillDay(item.day.toString()); setBillFreq(item.freq); setEditingBillId(item.id);};
  const W=Dimensions.get('window').width;
  return(
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={{paddingBottom:120, paddingTop: Platform.OS==='android'?(StatusBar.currentHeight||0):8}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {tab==='cal' && (
          <View style={styles.blackCardLarge}>
            <Text style={styles.leftToSpendLabel}>LEFT TO SPEND</Text>
            <Text style={styles.leftToSpendBig}>£{leftToSpend>0?leftToSpend.toFixed(0):'0'}</Text>
            <View style={styles.progressBar}><View style={[styles.progressFill,{width:`${Math.min(100, Math.max(0, (totalSpent/(monthlyBillsTotal+monthlyLeft||1))*100))}%`}]} /></View>
            <View style={styles.blackStatsRow}><View style={styles.blackStat}><Text style={styles.blackStatLabel}>SPENT</Text><Text style={styles.blackStatValue}>£{totalSpent.toFixed(0)}</Text></View><View style={styles.blackStatLine}/><View style={styles.blackStat}><Text style={styles.blackStatLabel}>INCOME</Text><Text style={styles.blackStatValue}>£{monthlyIncomeTotal.toFixed(0)}</Text></View><View style={styles.blackStatLine}/><View style={styles.blackStat}><Text style={styles.blackStatLabel}>BILLS</Text><Text style={[styles.blackStatValue,{color:'#ff8a8a'}]}>-£{monthlyBillsTotal.toFixed(0)}</Text></View></View>
          </View>
        )}
        {tab==='cal' && (
          <View style={styles.calCardBig}>
            <View style={styles.calHeaderBig}><Pressable onPress={()=>setCurMonth(new Date(year,month-1,1))} style={styles.arrowCircle}><Text style={styles.arrowText}>‹</Text></Pressable><View style={{alignItems:'center'}}><Text style={styles.monthBig}>{monthNames[month]} {year}</Text><Text style={styles.paydaySub}>WEEKS START PAYDAY {payday}TH</Text></View><Pressable onPress={()=>setCurMonth(new Date(year,month+1,1))} style={styles.arrowCircle}><Text style={styles.arrowText}>›</Text></Pressable></View>
            <View style={styles.weekRowBig}>{['S','M','T','W','T','F','S'].map(d=><Text key={d} style={styles.weekDayBig}>{d}</Text>)}</View>
            <View style={styles.daysGridBig}>{Array.from({length:firstDay}).map((_,i)=><View key={'e'+i} style={styles.dayCellBig}/>)}
              {Array.from({length:daysInMonth}).map((_,i)=>{const d=i+1; const {hasInc,hasBill}=getDayInfo(d); const isPayday=d===payday; const isToday=d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear(); let bg= 'transparent'; if(hasInc) bg=LIME; else if(hasBill) bg=PALE; return(
                <View key={d} style={styles.dayCellBig}><View style={[styles.dayCircle, hasInc&&{backgroundColor:LIME}, hasBill&&!hasInc&&{backgroundColor:PALE}, isPayday&&{borderWidth:2, borderColor:BLACK}, isToday&&!hasInc&&{borderWidth:1, borderColor:'#ddd'}]}><Text style={[styles.dayNumBig, isPayday&&{fontWeight:'900'}]}>{d}</Text></View></View>
              )})}
            </View>
            <View style={styles.legendRow}><View style={styles.legendItem}><View style={[styles.legendDot,{backgroundColor:LIME}]}/><Text style={styles.legendText}>Income</Text></View><View style={styles.legendItem}><View style={[styles.legendDot,{backgroundColor:PALE}]}/><Text style={styles.legendText}>Bill</Text></View></View>
          </View>
        )}
        {tab==='cal' && (
          <View style={styles.quickCardLime}>
            <Text style={styles.quickTitle}>QUICK ADD - AUTO REMOVES AFTER 7 DAYS</Text>
            <View style={styles.quickRowLime}><TextInput style={styles.quickInputLime} placeholder="What did you buy?" value={quickName} onChangeText={setQuickName}/><TextInput style={styles.quickAmtLime} placeholder="£0" keyboardType="numeric" value={quickAmt} onChangeText={setQuickAmt}/><Pressable style={styles.quickPlus} onPress={()=>{const a=parseFloat(quickAmt); if(!a) return; setSpends(prev=>[...prev,{id:Date.now().toString(),name:quickName||'Spend',amount:a,date:new Date().toISOString()}]); setQuickName(''); setQuickAmt('');}}><Text style={styles.plusText}>+</Text></Pressable></View>
            {spends.length>0&&<View style={{marginTop:10}}>{spends.slice(-3).map(s=><Text key={s.id} style={styles.spendItem}>-£{s.amount} {s.name} • auto remove in 7 days</Text>)}</View>}
          </View>
        )}
        {tab==='bills' && (
          <>
            <View style={styles.section}><Text style={styles.sectionTitle}>INCOMES</Text><Text style={styles.sectionSub}>Tap name to edit • M/W to switch</Text>
              <View style={styles.inputCard}>
                <View style={styles.inputRow}><TextInput style={[styles.input,{flex:2}]} placeholder="Income name" value={incName} onChangeText={setIncName}/><TextInput style={styles.inputSmall} placeholder="£" keyboardType="numeric" value={incAmt} onChangeText={setIncAmt}/><TextInput style={styles.inputSmall} placeholder="Day" keyboardType="numeric" value={incDay} onChangeText={setIncDay}/></View>
                <View style={styles.freqRow}><Pressable onPress={()=>setIncFreq('Weekly')} style={[styles.freqChip, incFreq==='Weekly'&&styles.freqActive]}><Text style={[styles.freqText, incFreq==='Weekly'&&styles.freqTextActive]}>Weekly</Text></Pressable><Pressable onPress={()=>setIncFreq('Monthly')} style={[styles.freqChip, incFreq==='Monthly'&&styles.freqActive]}><Text style={[styles.freqText, incFreq==='Monthly'&&styles.freqTextActive]}>Monthly</Text></Pressable><Pressable style={[styles.addBlack, editingIncomeId&&{backgroundColor:LIME}]} onPress={addIncome}><Text style={[styles.addBlackText, editingIncomeId&&{color:BLACK}]}>{editingIncomeId?'Update':'Add'}</Text></Pressable></View>
                {incomes.map(i=><View key={i.id} style={styles.listRow}><Pressable onPress={()=>editIncome(i)} style={{flex:1}}><Text style={styles.listName}>{i.name} • Day {i.day}</Text><Text style={styles.listAmt}>+£{i.amount}</Text></Pressable><View style={styles.cleanBtnRow}><Pressable onPress={()=>setIncomes(prev=>prev.map(x=>x.id===i.id?{...x,freq:'Monthly'}:x))} style={[styles.mwChip, i.freq==='Monthly'&&styles.mwActive]}><Text style={[styles.mwText, i.freq==='Monthly'&&styles.mwTextActive]}>M</Text></Pressable><Pressable onPress={()=>setIncomes(prev=>prev.map(x=>x.id===i.id?{...x,freq:'Weekly'}:x))} style={[styles.mwChip, i.freq==='Weekly'&&styles.mwActive]}><Text style={[styles.mwText, i.freq==='Weekly'&&styles.mwTextActive]}>W</Text></Pressable><Pressable onPress={()=>setIncomes(prev=>prev.filter(x=>x.id!==i.id))} style={styles.delClean}><Text style={styles.delCleanText}>Delete</Text></Pressable></View></View>)}
              </View>
            </View>
            <View style={styles.section}><Text style={styles.sectionTitle}>BILLS</Text><Text style={styles.sectionSub}>Tap name to edit • Auto-deducted</Text>
              <View style={styles.inputCard}>
                <View style={styles.inputRow}><TextInput style={[styles.input,{flex:2}]} placeholder="Bill name" value={billName} onChangeText={setBillName}/><TextInput style={styles.inputSmall} placeholder="£" keyboardType="numeric" value={billAmt} onChangeText={setBillAmt}/><TextInput style={styles.inputSmall} placeholder="Day" keyboardType="numeric" value={billDay} onChangeText={setBillDay}/></View>
                <View style={styles.freqRow}><Pressable onPress={()=>setBillFreq('Weekly')} style={[styles.freqChip, billFreq==='Weekly'&&styles.freqActive]}><Text style={[styles.freqText, billFreq==='Weekly'&&styles.freqTextActive]}>Weekly</Text></Pressable><Pressable onPress={()=>setBillFreq('Monthly')} style={[styles.freqChip, billFreq==='Monthly'&&styles.freqActive]}><Text style={[styles.freqText, billFreq==='Monthly'&&styles.freqTextActive]}>Monthly</Text></Pressable><Pressable style={[styles.addBlack, editingBillId&&{backgroundColor:LIME}]} onPress={addBill}><Text style={[styles.addBlackText, editingBillId&&{color:BLACK}]}>{editingBillId?'Update':'Add'}</Text></Pressable></View>
                {bills.map(b=><View key={b.id} style={styles.listRow}><Pressable onPress={()=>editBill(b)} style={{flex:1}}><Text style={styles.listName}>{b.name} • Day {b.day}</Text><Text style={styles.listAmtNeg}>-£{b.amount}</Text></Pressable><View style={styles.cleanBtnRow}><Pressable onPress={()=>setBills(prev=>prev.map(x=>x.id===b.id?{...x,freq:'Monthly'}:x))} style={[styles.mwChip, b.freq==='Monthly'&&styles.mwActive]}><Text style={[styles.mwText, b.freq==='Monthly'&&styles.mwTextActive]}>M</Text></Pressable><Pressable onPress={()=>setBills(prev=>prev.map(x=>x.id===b.id?{...x,freq:'Weekly'}:x))} style={[styles.mwChip, b.freq==='Weekly'&&styles.mwActive]}><Text style={[styles.mwText, b.freq==='Weekly'&&styles.mwTextActive]}>W</Text></Pressable><Pressable onPress={()=>setBills(prev=>prev.filter(x=>x.id!==b.id))} style={styles.delClean}><Text style={styles.delCleanText}>Delete</Text></Pressable></View></View>)}
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <View style={styles.bottomTabsFixed}><Pressable onPress={()=>setTab('cal')} style={[styles.tabBtn, tab==='cal'&&styles.tabActive]}><Text style={[styles.tabText, tab==='cal'&&styles.tabTextActive]}>Calendar</Text></Pressable><Pressable onPress={()=>setTab('bills')} style={[styles.tabBtn, tab==='bills'&&styles.tabActive]}><Text style={[styles.tabText, tab==='bills'&&styles.tabTextActive]}>Bills & Income</Text></Pressable></View>
    </View>
  );
}
const styles=StyleSheet.create({
  root:{flex:1, backgroundColor:'#fafafa'},
  scroll:{flex:1},
  blackCardLarge:{backgroundColor:BLACK, margin:16, borderRadius:28, padding:20, paddingTop:24},
  leftToSpendLabel:{color:'#888', fontSize:12, fontWeight:'700', letterSpacing:2},
  leftToSpendBig:{color:'white', fontSize:42, fontWeight:'900', marginTop:6, letterSpacing:-1},
  progressBar:{height:4, backgroundColor:'#222', borderRadius:2, marginTop:16, overflow:'hidden'},
  progressFill:{height:4, backgroundColor:LIME},
  blackStatsRow:{flexDirection:'row', marginTop:18, justifyContent:'space-between'},
  blackStat:{flex:1, alignItems:'flex-start'}, blackStatLabel:{color:'#666', fontSize:10, fontWeight:'700', letterSpacing:1}, blackStatValue:{color:'white', fontSize:18, fontWeight:'800', marginTop:4},
  blackStatLine:{width:1, backgroundColor:'#222', marginHorizontal:12},
  calCardBig:{backgroundColor:'white', margin:16, borderRadius:32, padding:16, paddingBottom:20, elevation:2, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:10},
  calHeaderBig:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16},
  arrowCircle:{width:40, height:40, borderRadius:20, backgroundColor:GRAY, alignItems:'center', justifyContent:'center'}, arrowText:{fontSize:20, fontWeight:'600'},
  monthBig:{fontSize:20, fontWeight:'900'}, paydaySub:{fontSize:11, color:'#bbb', fontWeight:'700', letterSpacing:1, marginTop:2},
  weekRowBig:{flexDirection:'row', justifyContent:'space-around', marginBottom:12}, weekDayBig:{color:'#ccc', fontSize:13, fontWeight:'700', width:40, textAlign:'center'},
  daysGridBig:{flexDirection:'row', flexWrap:'wrap'}, dayCellBig:{width:(Dimensions.get('window').width-64)/7, height:52, alignItems:'center', justifyContent:'center'},
  dayCircle:{width:44, height:36, borderRadius:18, alignItems:'center', justifyContent:'center'}, dayNumBig:{fontSize:18, fontWeight:'600'},
  legendRow:{flexDirection:'row', justifyContent:'center', gap:20, marginTop:16}, legendItem:{flexDirection:'row', alignItems:'center', gap:6}, legendDot:{width:10, height:10, borderRadius:5}, legendText:{fontSize:12, color:'#999', fontWeight:'600'},
  quickCardLime:{margin:16, marginTop:0, borderWidth:1.5, borderColor:LIME, borderRadius:24, padding:14, backgroundColor:'white'},
  quickTitle:{fontSize:11, fontWeight:'700', color:'#bbb', letterSpacing:1, marginBottom:10},
  quickRowLime:{flexDirection:'row', gap:10, alignItems:'center'}, quickInputLime:{flex:1, backgroundColor:GRAY, borderRadius:14, padding:14, fontSize:14}, quickAmtLime:{width:80, backgroundColor:GRAY, borderRadius:14, padding:14, fontSize:14}, quickPlus:{width:52, height:52, borderRadius:26, backgroundColor:LIME, alignItems:'center', justifyContent:'center'}, plusText:{fontSize:24, fontWeight:'900', color:BLACK},
  spendItem:{fontSize:12, color:'#999', marginTop:4},
  section:{margin:14}, sectionTitle:{fontSize:18, fontWeight:'900', marginBottom:4}, sectionSub:{color:'#888', fontSize:12, marginBottom:10},
  inputCard:{backgroundColor:'white', borderRadius:20, padding:14}, inputRow:{flexDirection:'row', gap:8, marginBottom:10}, input:{backgroundColor:GRAY, borderRadius:12, padding:12, fontSize:14}, inputSmall:{backgroundColor:GRAY, borderRadius:12, padding:12, width:64, fontSize:14},
  freqRow:{flexDirection:'row', gap:8, alignItems:'center'}, freqChip:{backgroundColor:GRAY, borderRadius:20, paddingHorizontal:14, paddingVertical:8}, freqActive:{backgroundColor:BLACK}, freqText:{fontSize:12, fontWeight:'700', color:'#888'}, freqTextActive:{color:'white'},
  addBlack:{backgroundColor:BLACK, borderRadius:20, paddingHorizontal:22, paddingVertical:10, marginLeft:'auto'}, addBlackText:{color:'white', fontWeight:'900'},
  listRow:{flexDirection:'row', alignItems:'center', paddingVertical:10, borderTopWidth:1, borderTopColor:'#f0f0f0', marginTop:8}, listName:{fontSize:13, fontWeight:'600'}, listAmt:{fontWeight:'800', fontSize:13, marginTop:2}, listAmtNeg:{color:'#ff5a5a', fontWeight:'800', fontSize:13, marginTop:2},
  cleanBtnRow:{flexDirection:'row', alignItems:'center', gap:6, marginLeft:8},
  mwChip:{width:30, height:30, borderRadius:15, backgroundColor:GRAY, alignItems:'center', justifyContent:'center'}, mwActive:{backgroundColor:BLACK}, mwText:{fontSize:12, fontWeight:'800', color:'#999'}, mwTextActive:{color:'white'},
  delClean:{backgroundColor:'#ffecec', paddingHorizontal:12, paddingVertical:7, borderRadius:12}, delCleanText:{color:'#ff5a5a', fontWeight:'700', fontSize:11},
  bottomTabsFixed:{position:'absolute', bottom:14, left:14, right:14, backgroundColor:'white', borderRadius:28, padding:6, flexDirection:'row', elevation:10, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:10},
  tabBtn:{flex:1, paddingVertical:14, borderRadius:22, alignItems:'center'}, tabActive:{backgroundColor:BLACK}, tabText:{fontWeight:'700', color:'#aaa'}, tabTextActive:{color:'white'}
});
