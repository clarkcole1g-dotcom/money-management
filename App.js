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
  useEffect(()=>{AsyncStorage.getItem('v_final_exact').then(d=>{if(d){const p=JSON.parse(d); setIncomes(p.incomes||[]); setBills(p.bills||[]); let sp=p.spends||[]; const now=Date.now(); sp=sp.filter(s=> now - new Date(s.date).getTime() < 7*24*60*60*1000); setSpends(sp);}});},[]);
  useEffect(()=>{AsyncStorage.setItem('v_final_exact',JSON.stringify({incomes,bills,spends}));},[incomes,bills,spends]);
  const monthlyIncomeTotal=incomes.reduce((s,i)=>s+(i.freq==='Weekly'?i.amount*4.33:i.amount),0);
  const monthlyBillsTotal=bills.reduce((s,b)=>s+(b.freq==='Weekly'?b.amount*4.33:b.amount),0);
  const monthlyLeft=monthlyIncomeTotal-monthlyBillsTotal;
  const totalSpent=spends.reduce((s,x)=>s+x.amount,0);
  const weeklyFull=monthlyLeft>0?monthlyLeft/4.33:0;
  const weeklyLeft=weeklyFull-totalSpent;
  const payday=incomes.length>0?Math.min(...incomes.map(i=>i.day)):9;
  const curWeek=Math.floor((today.getDate()-payday)/7)+1; const weekLabel=curWeek>=1&&curWeek<=4?curWeek:1;
  const getDayInfo=(d)=>{return {hasInc:incomes.some(i=>i.day===d), hasBill:bills.some(b=>b.day===d)};};
  const addIncome=()=>{const amt=parseFloat(incAmt); if(!incName||!amt) return; const day=parseInt(incDay)||1; if(editingIncomeId){setIncomes(prev=>prev.map(i=>i.id===editingIncomeId?{...i,name:incName,amount:amt,day,freq:incFreq}:i)); setEditingIncomeId(null);} else {setIncomes(prev=>[...prev,{id:Date.now().toString(),name:incName,amount:amt,day,freq:incFreq}]);} setIncName(''); setIncAmt(''); setIncDay('');};
  const addBill=()=>{const amt=parseFloat(billAmt); if(!billName||!amt) return; const day=parseInt(billDay)||1; if(editingBillId){setBills(prev=>prev.map(b=>b.id===editingBillId?{...b,name:billName,amount:amt,day,freq:billFreq}:b)); setEditingBillId(null);} else {setBills(prev=>[...prev,{id:Date.now().toString(),name:billName,amount:amt,day,freq:billFreq}]);} setBillName(''); setBillAmt(''); setBillDay('');};
  const editIncome=(item)=>{setIncName(item.name); setIncAmt(item.amount.toString()); setIncDay(item.day.toString()); setIncFreq(item.freq); setEditingIncomeId(item.id); setTab('bills');};
  const editBill=(item)=>{setBillName(item.name); setBillAmt(item.amount.toString()); setBillDay(item.day.toString()); setBillFreq(item.freq); setEditingBillId(item.id); setTab('bills');};
  const clearAllData=()=>{setIncomes([]); setBills([]); setSpends([]); AsyncStorage.removeItem('v_final_exact');};
  return(
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={{paddingBottom:110, paddingTop: Platform.OS==='android'?(StatusBar.currentHeight||0):8}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {tab==='cal' && (
          <View style={styles.blackCard}>
            <View style={styles.blackTop}><Text style={styles.paydayTop}>PAYDAY {payday} • WEEK {weekLabel} • {monthNames[month].toUpperCase()}</Text><View style={styles.weekPill}><Text style={styles.weekPillText}>£{weeklyFull.toFixed(0)} / WEEK</Text></View></View>
            {/* MONEY IN MIDDLE OF BLACK BOX - SMALLER BOX */}
            <View style={styles.moneyMiddle}>
              <Text style={styles.bigLeft}>£{weeklyLeft.toFixed(2)}</Text>
              <Text style={styles.leftLabel}>LEFT TO SPEND</Text>
            </View>
            <View style={styles.progress}><View style={[styles.progressFill,{width:`${monthlyLeft>0?Math.min(100, (totalSpent/weeklyFull)*100):0}%`}]} /></View>
            <View style={styles.statsRow}><View style={styles.stat}><Text style={styles.statLabel}>SPENT</Text><Text style={styles.statVal}>£{totalSpent.toFixed(0)}</Text></View><View style={styles.line}/><View style={styles.stat}><Text style={styles.statLabel}>INCOME</Text><Text style={styles.statVal}>£{monthlyIncomeTotal.toFixed(0)}</Text></View><View style={styles.line}/><View style={styles.stat}><Text style={styles.statLabel}>BILLS</Text><Text style={[styles.statVal,{color:'#ff8a8a'}]}>-£{monthlyBillsTotal.toFixed(0)}</Text></View></View>
          </View>
        )}
        {tab==='cal' && (
          <View style={styles.calCard}>
            <View style={styles.calHeader}><Pressable onPress={()=>setCurMonth(new Date(year,month-1,1))} style={styles.arrowCircle}><Text style={styles.arrow}>‹</Text></Pressable><View style={{alignItems:'center'}}><Text style={styles.monthText}>{monthNames[month]} {year}</Text><Text style={styles.paydaySub}>WEEKS START PAYDAY {payday}TH</Text></View><Pressable onPress={()=>setCurMonth(new Date(year,month+1,1))} style={styles.arrowCircle}><Text style={styles.arrow}>›</Text></Pressable></View>
            <View style={styles.weekRow}>{['S','M','T','W','T','F','S'].map(d=><Text key={d} style={styles.weekDay}>{d}</Text>)}</View>
            <View style={styles.daysGrid}>{Array.from({length:firstDay}).map((_,i)=><View key={'e'+i} style={styles.dayCell}/>)}
              {Array.from({length:daysInMonth}).map((_,i)=>{const d=i+1; const {hasInc,hasBill}=getDayInfo(d); const isPayday=d===payday; return(
                <View key={d} style={styles.dayCell}><View style={[styles.dayCircle, hasInc&&{backgroundColor:LIME}, hasBill&&!hasInc&&{backgroundColor:PALE}, isPayday&&{borderWidth:2, borderColor:BLACK}]}><Text style={styles.dayNum}>{d}</Text></View></View>
              )})}
            </View>
            <View style={styles.legend}><View style={styles.legendItem}><View style={[styles.dot,{backgroundColor:LIME}]}/><Text style={styles.legendText}>Income</Text></View><View style={styles.legendItem}><View style={[styles.dot,{backgroundColor:PALE}]}/><Text style={styles.legendText}>Bill</Text></View></View>
          </View>
        )}
        {tab==='cal' && (
          <View style={styles.quickCard}>
            <Text style={styles.quickTitle}>QUICK ADD - AUTO REMOVES AFTER 7 DAYS</Text>
            <View style={styles.quickRow}><TextInput style={styles.quickInput} placeholder="What did you buy?" value={quickName} onChangeText={setQuickName} placeholderTextColor="#888"/><TextInput style={styles.quickAmt} placeholder="£0" keyboardType="numeric" value={quickAmt} onChangeText={setQuickAmt} placeholderTextColor="#888"/><Pressable style={styles.quickPlus} onPress={()=>{const a=parseFloat(quickAmt); if(!a) return; setSpends(prev=>[...prev,{id:Date.now().toString(),name:quickName||'Spend',amount:a,date:new Date().toISOString()}]); setQuickName(''); setQuickAmt('');}}><Text style={styles.plus}>+</Text></Pressable></View>
            {spends.map(s=>(
              <View key={s.id} style={styles.quickBox}>
                <View style={styles.quickBoxIcon}><Text style={styles.quickBoxIconText}>£</Text></View>
                <View style={{flex:1}}><Text style={styles.quickBoxName}>{s.name}</Text><Text style={styles.quickBoxSub}>Quick spend • auto deletes in 7 days</Text></View>
                <Text style={styles.quickBoxAmt}>-£{s.amount}</Text>
                <Pressable onPress={()=>setSpends(prev=>prev.filter(x=>x.id!==s.id))} style={styles.quickDel}><Text style={styles.quickDelText}>X</Text></Pressable>
              </View>
            ))}
          </View>
        )}
        {/* REMOVED BILLS & INCOMES FROM CALENDAR PAGE - ONLY IN BILLS TAB NOW */}

        {tab==='bills' && (
          <>
            <View style={styles.section}><Text style={styles.sectionTitle}>INCOMES</Text><Text style={styles.sectionSub}>Tap bill below to edit • Clean M/W/Delete</Text>
              <View style={styles.inputCard}>
                <View style={styles.inputRow}><TextInput style={[styles.input,{flex:2}]} placeholder="Income name" value={incName} onChangeText={setIncName}/><TextInput style={styles.inputSmall} placeholder="£" keyboardType="numeric" value={incAmt} onChangeText={setIncAmt}/><TextInput style={styles.inputSmall} placeholder="Day" keyboardType="numeric" value={incDay} onChangeText={setIncDay}/></View>
                <View style={styles.freqRow}><Pressable onPress={()=>setIncFreq('Weekly')} style={[styles.freqChip, incFreq==='Weekly'&&styles.freqActive]}><Text style={[styles.freqText, incFreq==='Weekly'&&styles.freqTextActive]}>Weekly</Text></Pressable><Pressable onPress={()=>setIncFreq('Monthly')} style={[styles.freqChip, incFreq==='Monthly'&&styles.freqActive]}><Text style={[styles.freqText, incFreq==='Monthly'&&styles.freqTextActive]}>Monthly</Text></Pressable><Pressable style={[styles.addBlack, editingIncomeId&&{backgroundColor:LIME}]} onPress={addIncome}><Text style={[styles.addBlackText, editingIncomeId&&{color:BLACK}]}>{editingIncomeId?'Update':'Add'}</Text></Pressable></View>
                {incomes.map(i=><View key={i.id} style={styles.listRow}><Pressable onPress={()=>editIncome(i)} style={{flex:1}}><Text style={styles.listName}>{i.name} • Day {i.day}</Text><Text style={styles.listAmt}>+£{i.amount}</Text></Pressable><View style={styles.cleanRow}><Pressable onPress={()=>setIncomes(prev=>prev.map(x=>x.id===i.id?{...x,freq:'Monthly'}:x))} style={[styles.mwChip, i.freq==='Monthly'&&styles.mwActive]}><Text style={[styles.mwText, i.freq==='Monthly'&&styles.mwTextActive]}>M</Text></Pressable><Pressable onPress={()=>setIncomes(prev=>prev.map(x=>x.id===i.id?{...x,freq:'Weekly'}:x))} style={[styles.mwChip, i.freq==='Weekly'&&styles.mwActive]}><Text style={[styles.mwText, i.freq==='Weekly'&&styles.mwTextActive]}>W</Text></Pressable><Pressable onPress={()=>setIncomes(prev=>prev.filter(x=>x.id!==i.id))} style={styles.delClean}><Text style={styles.delCleanText}>Delete</Text></Pressable></View></View>)}
              </View>
            </View>
            <View style={styles.section}><Text style={styles.sectionTitle}>BILLS</Text>
              <View style={styles.inputCard}>
                <View style={styles.inputRow}><TextInput style={[styles.input,{flex:2}]} placeholder="Bill name" value={billName} onChangeText={setBillName}/><TextInput style={styles.inputSmall} placeholder="£" keyboardType="numeric" value={billAmt} onChangeText={setBillAmt}/><TextInput style={styles.inputSmall} placeholder="Day" keyboardType="numeric" value={billDay} onChangeText={setBillDay}/></View>
                <View style={styles.freqRow}><Pressable onPress={()=>setBillFreq('Weekly')} style={[styles.freqChip, billFreq==='Weekly'&&styles.freqActive]}><Text style={[styles.freqText, billFreq==='Weekly'&&styles.freqTextActive]}>Weekly</Text></Pressable><Pressable onPress={()=>setBillFreq('Monthly')} style={[styles.freqChip, billFreq==='Monthly'&&styles.freqActive]}><Text style={[styles.freqText, billFreq==='Monthly'&&styles.freqTextActive]}>Monthly</Text></Pressable><Pressable style={[styles.addBlack, editingBillId&&{backgroundColor:LIME}]} onPress={addBill}><Text style={[styles.addBlackText, editingBillId&&{color:BLACK}]}>{editingBillId?'Update':'Add'}</Text></Pressable></View>
                {bills.map(b=><View key={b.id} style={styles.listRow}><Pressable onPress={()=>editBill(b)} style={{flex:1}}><Text style={styles.listName}>{b.name} • Day {b.day}</Text><Text style={styles.listAmtNeg}>-£{b.amount}</Text></Pressable><View style={styles.cleanRow}><Pressable onPress={()=>setBills(prev=>prev.map(x=>x.id===b.id?{...x,freq:'Monthly'}:x))} style={[styles.mwChip, b.freq==='Monthly'&&styles.mwActive]}><Text style={[styles.mwText, b.freq==='Monthly'&&styles.mwTextActive]}>M</Text></Pressable><Pressable onPress={()=>setBills(prev=>prev.map(x=>x.id===b.id?{...x,freq:'Weekly'}:x))} style={[styles.mwChip, b.freq==='Weekly'&&styles.mwActive]}><Text style={[styles.mwText, b.freq==='Weekly'&&styles.mwTextActive]}>W</Text></Pressable><Pressable onPress={()=>setBills(prev=>prev.filter(x=>x.id!==b.id))} style={styles.delClean}><Text style={styles.delCleanText}>Delete</Text></Pressable></View></View>)}
              </View>
            </View>
            <View style={{margin:14, marginTop:20}}>
              <Pressable onPress={clearAllData} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Clear All Data</Text>
              </Pressable>
              <Text style={styles.clearSub}>This will delete all bills, incomes & quick spends</Text>
            </View>
          </>
        )}
      </ScrollView>
      {/* TABS FIXED AT BOTTOM - WONT MOVE WHEN SCROLL */}
      <View style={styles.bottomTabsFixed}><Pressable onPress={()=>setTab('cal')} style={[styles.tabBtn, tab==='cal'&&styles.tabActive]}><Text style={[styles.tabText, tab==='cal'&&styles.tabTextActive]}>Calendar</Text></Pressable><Pressable onPress={()=>setTab('bills')} style={[styles.tabBtn, tab==='bills'&&styles.tabActive]}><Text style={[styles.tabText, tab==='bills'&&styles.tabTextActive]}>Bills & Income</Text></Pressable></View>
    </View>
  );
}
const styles=StyleSheet.create({
  root:{flex:1, backgroundColor:'#fafafa'},
  scroll:{flex:1},
  blackCard:{backgroundColor:BLACK, margin:16, borderRadius:28, padding:14},
  blackTop:{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}, 
  paydayTop:{color:'#888', fontSize:10, fontWeight:'700', letterSpacing:1}, 
  weekPill:{backgroundColor:'#222', borderRadius:14, paddingHorizontal:12, paddingVertical:5}, weekPillText:{color:'white', fontSize:11, fontWeight:'800'},
  moneyMiddle:{alignItems:'center', justifyContent:'center', paddingVertical:10},
  bigLeft:{color:'white', fontSize:38, fontWeight:'900', letterSpacing:-1, textAlign:'center'}, 
  leftLabel:{color:'#666', fontSize:11, fontWeight:'700', letterSpacing:2, marginTop:2, textAlign:'center'},
  progress:{height:4, backgroundColor:'#222', borderRadius:2, marginTop:10}, progressFill:{height:4, backgroundColor:LIME},
  statsRow:{flexDirection:'row', marginTop:12}, stat:{flex:1}, statLabel:{color:'#666', fontSize:10, fontWeight:'700', letterSpacing:1}, statVal:{color:'white', fontSize:15, fontWeight:'800', marginTop:2}, line:{width:1, backgroundColor:'#222', marginHorizontal:10},
  calCard:{backgroundColor:'white', margin:16, borderRadius:28, padding:14, elevation:2},
  calHeader:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12}, arrowCircle:{width:38, height:38, borderRadius:19, backgroundColor:GRAY, alignItems:'center', justifyContent:'center'}, arrow:{fontSize:18, fontWeight:'600'}, monthText:{fontSize:18, fontWeight:'900'}, paydaySub:{fontSize:10, color:'#bbb', fontWeight:'700', letterSpacing:1, marginTop:2},
  weekRow:{flexDirection:'row', justifyContent:'space-around', marginBottom:8}, weekDay:{color:'#ccc', fontSize:12, fontWeight:'700', width:40, textAlign:'center'},
  daysGrid:{flexDirection:'row', flexWrap:'wrap'}, dayCell:{width:(Dimensions.get('window').width-60)/7, height:48, alignItems:'center', justifyContent:'center'}, dayCircle:{width:42, height:34, borderRadius:17, alignItems:'center', justifyContent:'center'}, dayNum:{fontSize:16, fontWeight:'600'},
  legend:{flexDirection:'row', justifyContent:'center', gap:20, marginTop:12}, legendItem:{flexDirection:'row', alignItems:'center', gap:6}, dot:{width:10, height:10, borderRadius:5}, legendText:{fontSize:12, color:'#999'},
  quickCard:{margin:16, marginTop:0, borderWidth:1.5, borderColor:LIME, borderRadius:20, padding:12, backgroundColor:'white'}, quickTitle:{fontSize:10, fontWeight:'700', color:'#bbb', letterSpacing:1, marginBottom:8}, quickRow:{flexDirection:'row', gap:8}, quickInput:{flex:1, backgroundColor:GRAY, borderRadius:12, padding:12, fontSize:14}, quickAmt:{width:70, backgroundColor:GRAY, borderRadius:12, padding:12, fontSize:14}, quickPlus:{width:48, height:48, borderRadius:24, backgroundColor:LIME, alignItems:'center', justifyContent:'center'}, plus:{fontSize:22, fontWeight:'900'},
  quickBox:{flexDirection:'row', alignItems:'center', backgroundColor:'#f9f9f9', borderRadius:14, padding:10, marginTop:8, borderWidth:1, borderColor:'#eee'},
  quickBoxIcon:{width:32, height:32, borderRadius:8, backgroundColor:BLACK, alignItems:'center', justifyContent:'center', marginRight:10},
  quickBoxIconText:{color:'white', fontWeight:'800', fontSize:12},
  quickBoxName:{fontSize:14, fontWeight:'700'}, quickBoxSub:{fontSize:11, color:'#999', marginTop:1},
  quickBoxAmt:{color:'#ff5a5a', fontWeight:'800', fontSize:14, marginLeft:8},
  quickDel:{backgroundColor:'#ffecec', paddingHorizontal:10, paddingVertical:5, borderRadius:10, marginLeft:8}, quickDelText:{color:'#ff5a5a', fontWeight:'700', fontSize:10},
  section:{margin:14}, sectionTitle:{fontSize:18, fontWeight:'900', marginBottom:4}, sectionSub:{color:'#888', fontSize:11, marginBottom:8},
  inputCard:{backgroundColor:'white', borderRadius:20, padding:14}, inputRow:{flexDirection:'row', gap:8, marginBottom:10}, input:{backgroundColor:GRAY, borderRadius:12, padding:12, fontSize:13}, inputSmall:{backgroundColor:GRAY, borderRadius:12, padding:12, width:60, fontSize:13},
  freqRow:{flexDirection:'row', gap:8, alignItems:'center'}, freqChip:{backgroundColor:GRAY, borderRadius:18, paddingHorizontal:12, paddingVertical:7}, freqActive:{backgroundColor:BLACK}, freqText:{fontSize:11, fontWeight:'700', color:'#888'}, freqTextActive:{color:'white'},
  addBlack:{backgroundColor:BLACK, borderRadius:18, paddingHorizontal:18, paddingVertical:8, marginLeft:'auto'}, addBlackText:{color:'white', fontWeight:'800', fontSize:12},
  listRow:{flexDirection:'row', alignItems:'center', paddingVertical:8, borderTopWidth:1, borderTopColor:'#f0f0f0', marginTop:6}, listName:{fontSize:12, fontWeight:'600'}, listAmt:{fontWeight:'800', fontSize:12}, listAmtNeg:{color:'#ff5a5a', fontWeight:'800', fontSize:12},
  cleanRow:{flexDirection:'row', gap:5, marginLeft:6}, mwChip:{width:26, height:26, borderRadius:13, backgroundColor:GRAY, alignItems:'center', justifyContent:'center'}, mwActive:{backgroundColor:BLACK}, mwText:{fontSize:11, fontWeight:'800', color:'#999'}, mwTextActive:{color:'white'}, delClean:{backgroundColor:'#ffecec', paddingHorizontal:10, paddingVertical:5, borderRadius:10}, delCleanText:{color:'#ff5a5a', fontWeight:'700', fontSize:10},
  clearBtn:{backgroundColor:'#ff3b3b', borderRadius:16, padding:16, alignItems:'center'}, clearBtnText:{color:'white', fontWeight:'900', fontSize:14, letterSpacing:1},
  clearSub:{textAlign:'center', color:'#999', fontSize:11, marginTop:8},
  bottomTabsFixed:{position:'absolute', bottom:0, left:0, right:0, backgroundColor:'white', padding:8, paddingBottom: Platform.OS==='ios'?28:12, flexDirection:'row', borderTopWidth:1, borderTopColor:'#eee'},
  tabBtn:{flex:1, paddingVertical:12, borderRadius:20, alignItems:'center'}, tabActive:{backgroundColor:BLACK}, tabText:{fontWeight:'700', color:'#aaa', fontSize:13}, tabTextActive:{color:'white'}
});
