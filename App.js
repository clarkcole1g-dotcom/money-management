import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, StatusBar, Platform, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LIME = '#C6FF00';
const BLACK = '#0a0a0a';

export default function App(){
  const [tab, setTab] = useState('cal');
  const [incomes, setIncomes] = useState([]);
  const [bills, setBills] = useState([]);
  const [spends, setSpends] = useState([]);
  const [month, setMonth] = useState(new Date());
  const [incName, setIncName] = useState('');
  const [incAmt, setIncAmt] = useState('');
  const [incDay, setIncDay] = useState('');
  const [incFreq, setIncFreq] = useState('Monthly');
  const [billName, setBillName] = useState('');
  const [billAmt, setBillAmt] = useState('');
  const [billDay, setBillDay] = useState('');
  const [billFreq, setBillFreq] = useState('Monthly');
  const [quickName, setQuickName] = useState('');
  const [quickAmt, setQuickAmt] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(()=>{
    (async()=>{
      try{
        const s = await AsyncStorage.getItem('mm_data_v3');
        if(s){ const d=JSON.parse(s); setIncomes(d.incomes||[]); setBills(d.bills||[]); setSpends(d.spends||[]); }
      }catch{}
    })();
  },[]);
  useEffect(()=>{ AsyncStorage.setItem('mm_data_v3', JSON.stringify({incomes,bills,spends})); },[incomes,bills,spends]);

  useEffect(()=>{
    const showSub = Keyboard.addListener('keyboardDidShow', ()=>setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', ()=>setKeyboardVisible(false));
    return ()=>{ showSub.remove(); hideSub.remove(); };
  },[]);

  useEffect(()=>{
    const now = Date.now();
    const filtered = spends.filter(s=> now - new Date(s.date).getTime() < 7*24*60*60*1000 );
    if(filtered.length!==spends.length) setSpends(filtered);
  },[]);

  const totalIncome = incomes.reduce((a,b)=>a+b.amount,0);
  const totalBills = bills.reduce((a,b)=>a+b.amount,0);
  const totalSpent = spends.reduce((a,b)=>a+b.amount,0);
  const weekly = totalIncome>0 ? (totalIncome - totalBills)/4.333 : 0;
  const weeklyLeft = weekly - totalSpent;

  const addIncome = ()=>{ const amt=parseFloat(incAmt); if(!incName||!amt) return; const day=parseInt(incDay)||1; setIncomes([...incomes,{id:Date.now().toString(), name:incName, amount:amt, day, freq:incFreq}]); setIncName(''); setIncAmt(''); setIncDay(''); };
  const addBill = ()=>{ const amt=parseFloat(billAmt); if(!billName||!amt) return; const day=parseInt(billDay)||1; setBills([...bills,{id:Date.now().toString(), name:billName, amount:amt, day, freq:billFreq}]); setBillName(''); setBillAmt(''); setBillDay(''); };
  const addQuick = ()=>{ const amt=parseFloat(quickAmt); if(!quickName||!amt) return; setSpends([...spends,{id:Date.now().toString(), name:quickName, amount:amt, date:new Date().toISOString()}]); setQuickName(''); setQuickAmt(''); };

  const daysInMonth = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const today = new Date();

  const renderCal = ()=>{
    const cells=[];
    for(let i=0;i<firstDay;i++) cells.push(<View key={'e'+i} style={styles.calCellEmpty}/>);
    for(let d=1; d<=daysInMonth; d++){
      const isToday = d===today.getDate() && month.getMonth()===today.getMonth() && month.getFullYear()===today.getFullYear();
      const hasInc = incomes.some(x=>x.day===d);
      const hasBill = bills.some(x=>x.day===d);
      cells.push(
        <View key={d} style={[styles.calCell, isToday&&styles.calToday]}>
          <Text style={[styles.calText, isToday&&styles.calTodayText]}>{d}</Text>
          {(hasInc||hasBill)&&<View style={styles.calDots}>
            {hasInc&&<View style={[styles.dot,{backgroundColor:LIME}]}/>}
            {hasBill&&<View style={[styles.dot,{backgroundColor:'#fff8b0'}]}/>}
          </View>}
        </View>
      );
    }
    return cells;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f6f5" />
      {/* TOP SAFE SPACE - so you see 2:43 time */}
      <View style={styles.topSafe} />
      
      {/* BLACK CARD - FIXED TOP, NEVER MOVES */}
      {tab==='cal' && (
        <View style={styles.blackCard}>
          <View style={styles.blackTopRow}>
            <Text style={styles.blackTopLabel}>ADD INCOME TO START</Text>
            <View style={styles.weekPill}><Text style={styles.weekPillText}>£{weeklyLeft>0?weeklyLeft.toFixed(0):'0'} / WEEK</Text></View>
          </View>
          <Text style={styles.bigMoney}>£{weekly>0?weeklyLeft.toFixed(2):'0.00'}</Text>
          <Text style={styles.noData}>{incomes.length===0?'NO DATA - ADD INCOME & BILLS':'£'+totalIncome.toFixed(0)+' IN - £'+totalBills.toFixed(0)+' BILLS'}</Text>
          <View style={styles.divider}/>
          <View style={styles.threeCol}>
            <View style={styles.col}><Text style={styles.colLabel}>SPENT</Text><Text style={styles.colVal}>£{totalSpent.toFixed(0)}</Text></View>
            <View style={styles.colMid}><Text style={styles.colLabel}>INCOME</Text><Text style={styles.colVal}>£{totalIncome.toFixed(0)}</Text></View>
            <View style={styles.col}><Text style={styles.colLabel}>BILLS</Text><Text style={[styles.colVal,{color:'#ff8a8a'}]}>-£{totalBills.toFixed(0)}</Text></View>
          </View>
        </View>
      )}

      {/* SCROLLABLE MIDDLE - ONLY THIS MOVES */}
      <ScrollView style={styles.scroll} contentContainerStyle={{paddingBottom: keyboardVisible ? 0 : 100}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {tab==='cal' ? (
          <>
            {incomes.length===0 && (
              <View style={styles.limeWelcome}>
                <Text style={styles.welcomeTitle}>👋 Welcome! No data yet.</Text>
                <Text style={styles.welcomeSub}>Go to £ Bills & Income tab and add your payday. It saves to your phone memory.</Text>
              </View>
            )}
            <View style={styles.calCard}>
              <View style={styles.calHeader}>
                <Pressable onPress={()=>setMonth(new Date(month.getFullYear(), month.getMonth()-1,1))} style={styles.calNav}><Text style={styles.calNavText}>‹</Text></Pressable>
                <View style={{alignItems:'center'}}>
                  <Text style={styles.calMonth}>{month.toLocaleString('default',{month:'long'})} {month.getFullYear()}</Text>
                  <Text style={styles.calSub}>{incomes.length===0?'ADD INCOME TO SET PAYDAY':'PAYDAY '+incomes.map(i=>i.day).join(', ')}</Text>
                </View>
                <Pressable onPress={()=>setMonth(new Date(month.getFullYear(), month.getMonth()+1,1))} style={styles.calNav}><Text style={styles.calNavText}>›</Text></Pressable>
              </View>
              <View style={styles.weekRow}><Text style={styles.weekDay}>S</Text><Text style={styles.weekDay}>M</Text><Text style={styles.weekDay}>T</Text><Text style={styles.weekDay}>W</Text><Text style={styles.weekDay}>T</Text><Text style={styles.weekDay}>F</Text><Text style={styles.weekDay}>S</Text></View>
              <View style={styles.calGrid}>{renderCal()}</View>
              <View style={styles.legendRow}><View style={styles.legendDotRow}><View style={[styles.legendDot,{backgroundColor:LIME}]}/><Text style={styles.legendText}>Income</Text></View><View style={styles.legendDotRow}><View style={[styles.legendDot,{backgroundColor:'#fff8b0'}]}/><Text style={styles.legendText}>Bill</Text></View></View>
            </View>
            <View style={styles.quickCard}>
              <Text style={styles.quickLabel}>QUICK ADD - AUTO REMOVES AFTER 7 DAYS</Text>
              <View style={styles.quickRow}>
                <TextInput style={[styles.quickInput,{flex:1}]} placeholder="What did you buy?" value={quickName} onChangeText={setQuickName} placeholderTextColor="#aaa"/>
                <TextInput style={styles.quickAmt} placeholder="£0" value={quickAmt} onChangeText={setQuickAmt} keyboardType="numeric" placeholderTextColor="#aaa"/>
                <Pressable style={styles.quickPlus} onPress={addQuick}><Text style={styles.quickPlusText}>+</Text></Pressable>
              </View>
              {spends.map(s=><View key={s.id} style={styles.quickItem}><Text style={styles.quickItemName}>{s.name}</Text><Text style={styles.quickItemAmt}>-£{s.amount}</Text></View>)}
            </View>
          </>
        ) : (
          <>
            <View style={{padding:20, paddingBottom:10}}>
              <Text style={styles.bigSection}>INCOMES - BLANK START</Text>
              <Text style={styles.smallDesc}>Add your paydays. Saves to phone memory automatically.</Text>
            </View>
            <View style={styles.formCard}>
              <View style={styles.formRow}>
                <TextInput style={[styles.formInput,{flex:1.2}]} placeholder="Income name" value={incName} onChangeText={setIncName} placeholderTextColor="#999"/>
                <TextInput style={styles.formSmall} placeholder="£" value={incAmt} onChangeText={setIncAmt} keyboardType="numeric" placeholderTextColor="#999"/>
                <TextInput style={styles.formSmall} placeholder="Day" value={incDay} onChangeText={setIncDay} keyboardType="numeric" placeholderTextColor="#999"/>
              </View>
              <View style={styles.formRow}>
                <Pressable onPress={()=>setIncFreq('Weekly')} style={[styles.chip, incFreq==='Weekly'&&styles.chipActive]}><Text style={[styles.chipText, incFreq==='Weekly'&&styles.chipActiveText]}>Weekly</Text></Pressable>
                <Pressable onPress={()=>setIncFreq('Monthly')} style={[styles.chip, incFreq==='Monthly'&&styles.chipActive]}><Text style={[styles.chipText, incFreq==='Monthly'&&styles.chipActiveText]}>Monthly</Text></Pressable>
                <Pressable style={styles.addBlack} onPress={addIncome}><Text style={styles.addBlackText}>Add</Text></Pressable>
              </View>
              {incomes.map(i=><View key={i.id} style={styles.listRow}><Text style={styles.listName}>{i.name} • Day {i.day} • {i.freq}</Text><Text style={styles.listAmt}>+£{i.amount}</Text></View>)}
            </View>
            <View style={{padding:20, paddingBottom:10, marginTop:10}}>
              <Text style={styles.bigSection}>BILLS - BLANK START</Text>
              <Text style={styles.smallDesc}>Auto-deducted. Weekly budget drops automatically.</Text>
            </View>
            <View style={styles.formCard}>
              <View style={styles.formRow}>
                <TextInput style={[styles.formInput,{flex:1.2}]} placeholder="Bill name" value={billName} onChangeText={setBillName} placeholderTextColor="#999"/>
                <TextInput style={styles.formSmall} placeholder="£" value={billAmt} onChangeText={setBillAmt} keyboardType="numeric" placeholderTextColor="#999"/>
                <TextInput style={styles.formSmall} placeholder="Day" value={billDay} onChangeText={setBillDay} keyboardType="numeric" placeholderTextColor="#999"/>
              </View>
              <View style={styles.formRow}>
                <Pressable onPress={()=>setBillFreq('Weekly')} style={[styles.chip, billFreq==='Weekly'&&styles.chipActive]}><Text style={[styles.chipText, billFreq==='Weekly'&&styles.chipActiveText]}>Weekly</Text></Pressable>
                <Pressable onPress={()=>setBillFreq('Monthly')} style={[styles.chip, billFreq==='Monthly'&&styles.chipActive]}><Text style={[styles.chipText, billFreq==='Monthly'&&styles.chipActiveText]}>Monthly</Text></Pressable>
                <Pressable style={styles.addBlack} onPress={addBill}><Text style={styles.addBlackText}>Add</Text></Pressable>
              </View>
              {bills.map(b=><View key={b.id} style={styles.listRow}><Text style={styles.listName}>{b.name} • Day {b.day} • {b.freq}</Text><Text style={styles.listAmtNeg}>-£{b.amount}</Text></View>)}
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>SUMMARY - PHONE MEMORY</Text>
              <Text style={styles.summaryMain}>£{totalIncome} income - £{totalBills} bills = £{totalIncome-totalBills}</Text>
              <Text style={styles.summaryBig}>£{weekly>0?weekly.toFixed(0):'0'}/week to spend</Text>
              <Text style={styles.summarySub}>Saved to phone automatically - no data when fresh install</Text>
            </View>
            <Pressable style={styles.clearBtn} onPress={()=>{setIncomes([]);setBills([]);setSpends([]); AsyncStorage.clear();}}>
              <Text style={styles.clearText}>Clear Phone Memory</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {/* BOTTOM TABS - FIXED, BUT HIDDEN WHEN KEYBOARD UP SO IT DOESN'T FLOAT ABOVE KEYBOARD */}
      {!keyboardVisible && <View style={styles.bottomTabsFixed}>
        <Pressable onPress={()=>setTab('cal')} style={[styles.bottomTab, tab==='cal'&&styles.bottomTabActive]}><Text style={[styles.bottomTabText, tab==='cal'&&styles.bottomTabActiveText]}>Calendar</Text></Pressable>
        <Pressable onPress={()=>setTab('bills')} style={[styles.bottomTab, tab==='bills'&&styles.bottomTabActive]}><Text style={[styles.bottomTabText, tab==='bills'&&styles.bottomTabActiveText]}>Bills & Income</Text></Pressable>
      </View>}
      {/* NO bottomSafe - removed gray bar */}
    </View>
  );
}

const styles = StyleSheet.create({
  root:{flex:1, backgroundColor:'#f6f6f5'},
  topSafe:{height: Platform.OS==='android' ? (StatusBar.currentHeight||0) : 0, backgroundColor:'#f6f6f5'},
  bottomSafe:{height: 0, backgroundColor:'#f6f6f5'},
  blackCard:{backgroundColor:BLACK, margin:16, marginTop:4, marginBottom:8, borderRadius:32, padding:22},
  blackTopRow:{flexDirection:'row', justifyContent:'space-between', alignItems:'center'},
  blackTopLabel:{color:'#777', fontSize:11, fontWeight:'800', letterSpacing:1},
  weekPill:{backgroundColor:'#222', borderRadius:20, paddingHorizontal:14, paddingVertical:6},
  weekPillText:{color:'white', fontWeight:'800', fontSize:12},
  bigMoney:{color:'white', fontSize:52, fontWeight:'900', marginTop:18, letterSpacing:-1},
  noData:{color:'#666', fontSize:11, fontWeight:'700', letterSpacing:1.2, marginTop:8},
  divider:{height:1, backgroundColor:'#222', marginTop:20},
  threeCol:{flexDirection:'row', marginTop:18},
  col:{flex:1},
  colMid:{flex:1, borderLeftWidth:1, borderRightWidth:1, borderColor:'#222', paddingLeft:16},
  colLabel:{color:'#555', fontSize:10, fontWeight:'800', letterSpacing:1},
  colVal:{color:'white', fontWeight:'800', marginTop:4, fontSize:16},
  scroll:{flex:1},
  limeWelcome:{backgroundColor:LIME, marginHorizontal:16, borderRadius:24, padding:20, alignItems:'center', marginTop:8},
  welcomeTitle:{fontWeight:'900', fontSize:16, color:BLACK},
  welcomeSub:{textAlign:'center', marginTop:8, color:BLACK, fontSize:13, lineHeight:18},
  calCard:{backgroundColor:'white', margin:16, borderRadius:28, padding:16},
  calHeader:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:8, paddingVertical:8},
  calNav:{width:40, height:40, borderRadius:20, backgroundColor:'#f5f5f5', alignItems:'center', justifyContent:'center'},
  calNavText:{fontSize:18, fontWeight:'700'},
  calMonth:{fontWeight:'900', fontSize:18, color:BLACK},
  calSub:{color:'#999', fontSize:10, fontWeight:'700', marginTop:2},
  weekRow:{flexDirection:'row', marginTop:16, paddingHorizontal:4},
  weekDay:{flex:1, textAlign:'center', color:'#ccc', fontWeight:'700', fontSize:12},
  calGrid:{flexDirection:'row', flexWrap:'wrap', marginTop:8},
  calCell:{width:'14.28%', aspectRatio:1, alignItems:'center', justifyContent:'center', borderRadius:16},
  calCellEmpty:{width:'14.28%', aspectRatio:1},
  calToday:{backgroundColor:'white', borderWidth:2, borderColor:BLACK, borderRadius:28},
  calText:{fontWeight:'600', color:BLACK},
  calTodayText:{fontWeight:'900'},
  calDots:{flexDirection:'row', gap:3, marginTop:2},
  dot:{width:5, height:5, borderRadius:3},
  legendRow:{flexDirection:'row', justifyContent:'center', gap:18, marginTop:18, marginBottom:6},
  legendDotRow:{flexDirection:'row', alignItems:'center', gap:6},
  legendDot:{width:10, height:10, borderRadius:5},
  legendText:{color:'#aaa', fontSize:12, fontWeight:'600'},
  quickCard:{backgroundColor:'white', margin:16, borderRadius:24, padding:16, borderWidth:1.5, borderColor:LIME},
  quickLabel:{color:'#aaa', fontSize:10, fontWeight:'800', letterSpacing:1},
  quickRow:{flexDirection:'row', marginTop:12, gap:8, alignItems:'center'},
  quickInput:{backgroundColor:'#f6f6f5', borderRadius:14, padding:14, flex:1, color:BLACK},
  quickAmt:{backgroundColor:'#f6f6f5', borderRadius:14, padding:14, width:80, color:BLACK, fontWeight:'700'},
  quickPlus:{width:50, height:50, borderRadius:25, backgroundColor:LIME, alignItems:'center', justifyContent:'center'},
  quickPlusText:{fontSize:22, fontWeight:'900', color:BLACK},
  quickItem:{flexDirection:'row', justifyContent:'space-between', marginTop:10, backgroundColor:'#fafafa', padding:12, borderRadius:10},
  quickItemName:{fontWeight:'700', color:BLACK},
  quickItemAmt:{fontWeight:'800', color:BLACK},
  bigSection:{fontSize:20, fontWeight:'900', color:BLACK},
  smallDesc:{color:'#999', fontSize:12, marginTop:4},
  formCard:{backgroundColor:'white', marginHorizontal:16, borderRadius:24, padding:16},
  formRow:{flexDirection:'row', gap:8, marginTop:10, alignItems:'center'},
  formInput:{backgroundColor:'#f7f7f5', borderRadius:14, padding:14, color:BLACK},
  formSmall:{backgroundColor:'#f7f7f5', borderRadius:14, padding:14, width:64, textAlign:'center', color:BLACK},
  chip:{paddingHorizontal:16, paddingVertical:10, borderRadius:20, backgroundColor:'#f0f0ef'},
  chipActive:{backgroundColor:BLACK},
  chipText:{fontWeight:'700', color:'#999', fontSize:12},
  chipActiveText:{color:'white'},
  addBlack:{flex:1, backgroundColor:BLACK, borderRadius:14, padding:14, alignItems:'center'},
  addBlackText:{color:'white', fontWeight:'900'},
  listRow:{flexDirection:'row', justifyContent:'space-between', marginTop:12, paddingTop:12, borderTopWidth:1, borderColor:'#f0f0f0'},
  listName:{fontWeight:'600', color:BLACK, fontSize:12},
  listAmt:{fontWeight:'800', color:BLACK},
  listAmtNeg:{fontWeight:'800', color:'#ff5a5a'},
  summaryCard:{backgroundColor:BLACK, margin:16, borderRadius:28, padding:22, marginTop:20},
  summaryLabel:{color:'#666', fontSize:11, fontWeight:'800', letterSpacing:1},
  summaryMain:{color:'white', marginTop:10, fontSize:14, fontWeight:'600'},
  summaryBig:{color:LIME, fontSize:28, fontWeight:'900', marginTop:12},
  summarySub:{color:'#555', fontSize:11, marginTop:10},
  clearBtn:{marginHorizontal:16, backgroundColor:'#ffecec', borderRadius:20, padding:16, alignItems:'center', borderWidth:1, borderColor:'#ffd2d2'},
  clearText:{color:'#ff5a5a', fontWeight:'800'},
  bottomTabsFixed:{position:'absolute', bottom:16, left:14, right:14, backgroundColor:'white', borderRadius:32, padding:8, flexDirection:'row', shadowColor:'#000', shadowOpacity:0.12, shadowRadius:20, elevation:20, marginBottom:0},
  bottomTab:{flex:1, padding:16, borderRadius:24, alignItems:'center'},
  bottomTabActive:{backgroundColor:BLACK},
  bottomTabText:{fontWeight:'800', color:'#aaa'},
  bottomTabActiveText:{color:'white'}
});
