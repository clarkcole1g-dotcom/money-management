import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App(){
const [tab,setTab]=useState('home');
const [incomes,setIncomes]=useState([]);
const [bills,setBills]=useState([]);
const [spends,setSpends]=useState([]);
const [incName,setIncName]=useState('');
const [incAmt,setIncAmt]=useState('');
const [incFreq,setIncFreq]=useState('monthly');
const [incDue,setIncDue]=useState('');
const [bName,setBName]=useState('');
const [bAmt,setBAmt]=useState('');
const [bFreq,setBFreq]=useState('monthly');
const [bDue,setBDue]=useState('');
const [sDesc,setSDesc]=useState('');
const [sAmt,setSAmt]=useState('');
const [selectedDay,setSelectedDay]=useState(new Date().getDate());
const [currDate,setCurrDate]=useState(new Date());
const [loaded,setLoaded]=useState(false);

useEffect(()=>{
  (async()=>{
    try{
      const saved = await AsyncStorage.getItem('money_management_final_no_dole');
      if(saved){
        const d = JSON.parse(saved);
        if(d.incomes) setIncomes(d.incomes);
        if(d.bills) setBills(d.bills);
        if(d.spends) {
          const filtered = d.spends.filter(s=>{
            if(!s.createdAt) return true;
            return (new Date()-new Date(s.createdAt))/(1000*60*60*24)<7;
          });
          setSpends(filtered);
        }
        if(d.selectedDay) setSelectedDay(d.selectedDay);
      }
      setLoaded(true);
    }catch(e){ setLoaded(true); }
  })();
},[]);
useEffect(()=>{
  if(!loaded) return;
  AsyncStorage.setItem('money_management_final_no_dole', JSON.stringify({incomes,bills,spends,selectedDay}));
},[incomes,bills,spends,selectedDay,loaded]);

const mainPayday = incomes.length>0 ? (incomes.reduce((max,i)=> i.amount>max.amount? i:max, incomes[0]).dueDay||new Date().getDate()) : new Date().getDate();
const daysInMonth=new Date(currDate.getFullYear(),currDate.getMonth()+1,0).getDate();
const getWeekForDay = (day, payday) => { if(day>=payday) return Math.floor((day - payday)/7)+1; else return Math.floor((day + daysInMonth - payday)/7)+1; };
const currentWeek = getWeekForDay(selectedDay, mainPayday);
const totalIncomeMonthly = incomes.reduce((s,i)=>{ if(i.keep===false) return s; return s + (i.freq==='weekly'? i.amount*4 : i.amount);},0);
const totalBillsMonthly = bills.reduce((s,b)=>{ if(b.keep===false) return s; return s + (b.freq==='weekly'? b.amount*4 : b.amount);},0);
const afterBills = totalIncomeMonthly - totalBillsMonthly;
const weekly = afterBills>0? afterBills/4 : 0;
const weekSpends=spends.filter(x=> x.month===currDate.getMonth() && x.year===currDate.getFullYear() && getWeekForDay(x.day||selectedDay, mainPayday)===currentWeek);
const spent=weekSpends.reduce((s,b)=>s+b.amount,0);
const left= weekly? weekly-spent : 0;
const firstDay=new Date(currDate.getFullYear(),currDate.getMonth(),1).getDay();
const days=[...Array(firstDay).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];
const prevMonth=()=>{const d=new Date(currDate); d.setMonth(d.getMonth()-1); setCurrDate(d);};
const nextMonth=()=>{const d=new Date(currDate); d.setMonth(d.getMonth()+1); setCurrDate(d);};
if(!loaded) return <View style={{flex:1,justifyContent:'center',alignItems:'center',paddingTop:60,backgroundColor:'#fafaf8'}}><Text style={{letterSpacing:1,fontWeight:'600'}}>LOADING...</Text></View>;

return(
<View style={st.c}>
<View style={st.statusSpacer} />
{tab==='home'?(
<ScrollView style={{flex:1}} showsVerticalScrollIndicator={false} contentContainerStyle={{padding:16,paddingTop:10,paddingBottom:180}}>

<View style={[st.hero, left<0&&{backgroundColor:'#111'}]}>
<View style={st.heroTop}>
<Text style={st.heroEyebrow}>{incomes.length===0? 'ADD INCOME TO START' : `PAYDAY ${mainPayday} • WEEK ${currentWeek} • ${currDate.toLocaleString('default',{month:'long'}).toUpperCase()}`}</Text>
<View style={st.heroPill}><Text style={st.heroPillT}>£{weekly?weekly.toFixed(0):0} / WEEK</Text></View>
</View>
<Text style={st.heroAmount}>£{left.toFixed(2)}</Text>
<Text style={st.heroLabel}>{incomes.length===0? 'NO DATA - ADD INCOME & BILLS' : 'LEFT TO SPEND'}</Text>
<View style={st.heroBar}><View style={[st.heroFill,{width: weekly && weekly>0? Math.min(100,(spent/weekly)*100)+'%':'0%', backgroundColor: left<0?'#ff4d4d':'#c6ff00'}]} /></View>
<View style={st.heroStats}>
<View style={st.stat}><Text style={st.statLabel}>SPENT</Text><Text style={st.statVal}>£{spent.toFixed(0)}</Text></View>
<View style={st.statDiv} />
<View style={st.stat}><Text style={st.statLabel}>INCOME</Text><Text style={st.statVal}>£{totalIncomeMonthly}</Text></View>
<View style={st.statDiv} />
<View style={st.stat}><Text style={st.statLabel}>BILLS</Text><Text style={[st.statVal,{color:'#ff8a8a'}]}>-£{totalBillsMonthly}</Text></View>
</View>
</View>

{incomes.length===0&&(
<View style={[st.card,{backgroundColor:'#c6ff00'}]}>
<Text style={{fontWeight:'800',textAlign:'center'}}>👋 Welcome! No data yet.</Text>
<Text style={{textAlign:'center',marginTop:6,fontSize:12}}>Go to £ Bills & Income tab and add your payday. It saves to your phone memory.</Text>
</View>
)}

<View style={st.card}>
<View style={st.monthRow}>
<Pressable onPress={prevMonth} style={st.monthBtn}><Text style={st.monthBtnT}>‹</Text></Pressable>
<View style={{alignItems:'center'}}><Text style={st.monthTitle}>{currDate.toLocaleString('default',{month:'long'})} {currDate.getFullYear()}</Text><Text style={st.monthSub}>{incomes.length>0? `WEEKS START PAYDAY ${mainPayday}TH` : 'ADD INCOME TO SET PAYDAY'}</Text></View>
<Pressable onPress={nextMonth} style={st.monthBtn}><Text style={st.monthBtnT}>›</Text></Pressable>
</View>
<View style={st.weekLabels}>{['S','M','T','W','T','F','S'].map((d,i)=><Text key={i} style={st.weekLabel}>{d}</Text>)}</View>
<View style={st.calGrid}>
{days.map((d,i)=>{
if(d===null) return <View key={'e'+i} style={st.dayEmpty}/>;
const isSelected = d===selectedDay;
const isMainPayday = incomes.length>0 && d===mainPayday;
const hasBill = bills.some(b=>b.keep!==false && b.dueDay===d);
const hasIncome = incomes.some(ii=>ii.keep!==false && ii.dueDay===d);
let styleDay = st.day;
let styleText = st.dayText;
if(hasIncome || isMainPayday){ styleDay = [st.day, st.dayPayday]; styleText = [st.dayText, st.dayTextPayday]; }
else if(hasBill){ styleDay = [st.day, st.dayBill]; }
if(isSelected){ styleDay = [styleDay, st.daySelected]; styleText = [styleText, st.dayTextSelected]; }
return (<Pressable key={i} onPress={()=>setSelectedDay(d)} style={styleDay}><Text style={styleText}>{d}</Text></Pressable>);
})}
</View>
<View style={st.legend}><View style={st.legendItem}><View style={[st.legendDot,{backgroundColor:'#c6ff00'}]} /><Text style={st.legendT}>Income</Text></View><View style={st.legendItem}><View style={[st.legendDot,{backgroundColor:'#fff9c4'}]} /><Text style={st.legendT}>Bill</Text></View></View>
</View>

<View style={st.addCard}>
<Text style={st.addTitle}>QUICK ADD - AUTO REMOVES AFTER 7 DAYS</Text>
<View style={st.addRow}>
<TextInput value={sDesc} onChangeText={setSDesc} placeholder="What did you buy?" style={st.addInput} placeholderTextColor="#aaa"/>
<TextInput value={sAmt} onChangeText={setSAmt} placeholder="£0" keyboardType="numeric" style={st.addInputSmall}/>
<Pressable onPress={()=>{let d=sDesc; let a=parseFloat(sAmt); if(!a&&sDesc){const m=sDesc.match(/([\d.]+)$/); if(m){a=parseFloat(m[1]); d=sDesc.replace(m[0],'').trim()||'Shop';}} if(!a) return; if(weekly>0 && a>left){ return; } setSpends([{id:Date.now().toString(),desc:d,amount:a,day:selectedDay,week:currentWeek,month:currDate.getMonth(),year:currDate.getFullYear(),createdAt:new Date().toISOString()},...spends]); setSDesc(''); setSAmt('');}} style={st.addBtn}><Text style={st.addBtnT}>+</Text></Pressable>
</View>
</View>

{weekSpends.length>0&&(
<View style={st.listSection}>
<Text style={st.sectionTitle}>THIS WEEK • {weekSpends.length} SPENDS</Text>
{weekSpends.map(s=><View key={s.id} style={st.spendRow}><View style={st.spendIcon}><Text style={st.spendIconT}>{s.desc[0]?.toUpperCase()||'S'}</Text></View><View style={{flex:1}}><Text style={st.spendName}>{s.desc}</Text><Text style={st.spendMeta}>{s.day}th • Week {s.week}</Text></View><Text style={st.spendAmt}>-£{s.amount.toFixed(2)}</Text><Pressable onPress={()=>setSpends(spends.filter(x=>x.id!==s.id))} style={st.spendDel}><Text style={st.spendDelT}>✕</Text></Pressable></View>)}
</View>
)}

{bills.filter(b=>b.keep!==false).length>0&&(
<View style={st.listSection}>
<Text style={st.sectionTitle}>BILLS • £{totalBillsMonthly}/MO AUTO-DEDUCTED</Text>
{bills.filter(b=>b.keep!==false).sort((a,b)=>(a.dueDay||99)-(b.dueDay||99)).map(b=>(
<View key={b.id} style={st.billRow}><View style={st.billBadge}><Text style={st.billBadgeT}>{b.dueDay}</Text></View><View style={{flex:1}}><Text style={st.billName}>{b.name}</Text><Text style={st.billMeta}>Due {b.dueDay}th • Week {getWeekForDay(b.dueDay, mainPayday)} • {b.freq}</Text></View><Text style={st.billAmt}>-£{b.amount}</Text></View>
))}
</View>
)}

{incomes.filter(ii=>ii.keep!==false).length>0&&(
<View style={st.listSection}>
<Text style={st.sectionTitle}>INCOMES • £{totalIncomeMonthly}/MO</Text>
{incomes.filter(ii=>ii.keep!==false).sort((a,b)=>(a.dueDay||99)-(b.dueDay||99)).map(ii=>(
<View key={ii.id} style={st.billRow}><View style={[st.billBadge,{backgroundColor:'#c6ff00'}]}><Text style={[st.billBadgeT,{color:'black'}]}>{ii.dueDay}</Text></View><View style={{flex:1}}><Text style={st.billName}>{ii.name} {ii.dueDay===mainPayday? '• MAIN' : ''}</Text><Text style={st.billMeta}>Due {ii.dueDay}th • {ii.freq}</Text></View><Text style={[st.billAmt,{color:'#2e7d32'}]}>+£{ii.amount}</Text></View>
))}
</View>
)}

</ScrollView>
):(
<ScrollView style={{flex:1}} showsVerticalScrollIndicator={false} contentContainerStyle={{padding:16,paddingTop:10,paddingBottom:180}}>

<Text style={st.editTitle}>INCOMES - BLANK START</Text>
<Text style={st.editSub}>Add your paydays. Saves to phone memory automatically.</Text>
<View style={st.editCard}>
<View style={{flexDirection:'row',gap:8}}>
<TextInput value={incName} onChangeText={setIncName} placeholder="Income name" style={[st.editInput,{flex:1}]} placeholderTextColor="#aaa"/>
<TextInput value={incAmt} onChangeText={setIncAmt} placeholder="£" keyboardType="numeric" style={[st.editInput,{width:80}]}/>
<TextInput value={incDue} onChangeText={setIncDue} placeholder="Day" keyboardType="numeric" style={[st.editInput,{width:60}]}/>
</View>
<View style={{flexDirection:'row',gap:8,marginTop:10}}>
<Pressable onPress={()=>setIncFreq('weekly')} style={[st.chip, incFreq==='weekly'&&st.chipOn]}><Text style={[st.chipT, incFreq==='weekly'&&st.chipTOn]}>Weekly</Text></Pressable>
<Pressable onPress={()=>setIncFreq('monthly')} style={[st.chip, incFreq==='monthly'&&st.chipOn]}><Text style={[st.chipT, incFreq==='monthly'&&st.chipTOn]}>Monthly</Text></Pressable>
<Pressable onPress={()=>{if(!incAmt) return; let day=parseInt(incDue)||new Date().getDate(); setIncomes([...incomes,{id:Date.now().toString(),name:incName||'Income',amount:parseFloat(incAmt),freq:incFreq,dueDay:day,keep:true}]); setIncName(''); setIncAmt(''); setIncDue('');}} style={st.primaryBtn}><Text style={st.primaryBtnT}>Add</Text></Pressable>
</View>
</View>
{incomes.map(i=>(<View key={i.id} style={st.editRow}><View style={[st.billBadge,{backgroundColor:'#c6ff00'}]}><Text style={[st.billBadgeT,{color:'black'}]}>{i.dueDay}</Text></View><View style={{flex:1,marginLeft:10}}><Text style={st.editRowName}>{i.name} {i.dueDay===mainPayday? '• MAIN PAYDAY':''}</Text><Text style={st.editRowMeta}>£{i.amount} {i.freq} • £{i.freq==='weekly'? i.amount*4 : i.amount}/mo</Text></View><Pressable onPress={()=>setIncomes(incomes.filter(x=>x.id!==i.id))} style={st.editDel}><Text style={st.editDelT}>✕</Text></Pressable></View>))}

<Text style={[st.editTitle,{marginTop:24}]}>BILLS - BLANK START</Text>
<Text style={st.editSub}>Auto-deducted. Weekly budget drops automatically.</Text>
<View style={st.editCard}>
<View style={{flexDirection:'row',gap:8}}>
<TextInput value={bName} onChangeText={setBName} placeholder="Bill name" style={[st.editInput,{flex:1}]} placeholderTextColor="#aaa"/>
<TextInput value={bAmt} onChangeText={setBAmt} placeholder="£" keyboardType="numeric" style={[st.editInput,{width:80}]}/>
<TextInput value={bDue} onChangeText={setBDue} placeholder="Day" keyboardType="numeric" style={[st.editInput,{width:60}]}/>
</View>
<View style={{flexDirection:'row',gap:8,marginTop:10}}>
<Pressable onPress={()=>setBFreq('weekly')} style={[st.chip, bFreq==='weekly'&&st.chipOn]}><Text style={[st.chipT, bFreq==='weekly'&&st.chipTOn]}>Weekly</Text></Pressable>
<Pressable onPress={()=>setBFreq('monthly')} style={[st.chip, bFreq==='monthly'&&st.chipOn]}><Text style={[st.chipT, bFreq==='monthly'&&st.chipTOn]}>Monthly</Text></Pressable>
<Pressable onPress={()=>{if(!bName||!bAmt) return; let day=parseInt(bDue)||new Date().getDate(); setBills([...bills,{id:Date.now().toString(),name:bName,amount:parseFloat(bAmt),freq:bFreq,dueDay:day,keep:true}]); setBName(''); setBAmt(''); setBDue('');}} style={st.primaryBtn}><Text style={st.primaryBtnT}>Add</Text></Pressable>
</View>
</View>
{bills.map(b=>(<View key={b.id} style={st.editRow}><View style={st.billBadge}><Text style={st.billBadgeT}>{b.dueDay}</Text></View><View style={{flex:1,marginLeft:10}}><Text style={st.editRowName}>{b.name}</Text><Text style={[st.editRowMeta,{color:'#ff4d4d'}]}>£{b.amount} {b.freq} • -£{b.freq==='weekly'? b.amount*4 : b.amount}/mo</Text></View><View style={{flexDirection:'row',gap:6}}><Pressable onPress={()=>setBills(bills.map(x=> x.id===b.id ? {...x,freq: x.freq==='weekly'?'monthly':'weekly'}:x))} style={st.chipSmall}><Text style={st.chipSmallT}>{b.freq==='weekly'?'W→M':'M→W'}</Text></Pressable><Pressable onPress={()=>setBills(bills.filter(x=>x.id!==b.id))} style={st.editDel}><Text style={st.editDelT}>✕</Text></Pressable></View></View>))}

<View style={[st.card,{marginTop:20,backgroundColor:'#111'}]}>
<Text style={{color:'#888',fontSize:10,letterSpacing:1,fontWeight:'700'}}>SUMMARY - PHONE MEMORY</Text>
<Text style={{color:'white',fontSize:14,marginTop:6}}>£{totalIncomeMonthly} income - £{totalBillsMonthly} bills = £{afterBills}</Text>
<Text style={{color:'#c6ff00',fontSize:22,fontWeight:'800',marginTop:6}}>£{weekly?weekly.toFixed(2):0}/week to spend</Text>
<Text style={{color:'#888',fontSize:10,marginTop:8}}>Saved to phone automatically - no data when fresh install</Text>
</View>

<Pressable onPress={async()=>{ await AsyncStorage.clear(); setIncomes([]); setBills([]); setSpends([]);}} style={[st.editRow,{marginTop:20,backgroundColor:'#ffefef',justifyContent:'center',borderWidth:1,borderColor:'#ffcccc'}]}><Text style={{color:'#ff4d4d',fontWeight:'700'}}>Clear Phone Memory</Text></Pressable>
</ScrollView>
)}

<View style={st.tabBar}>
<Pressable onPress={()=>setTab('home')} style={[st.tabBtn,tab==='home'&&st.tabBtnOn]}><Text style={[st.tabTxt,tab==='home'&&st.tabTxtOn]}>Calendar</Text></Pressable>
<Pressable onPress={()=>setTab('bills')} style={[st.tabBtn,tab==='bills'&&st.tabBtnOn]}><Text style={[st.tabTxt,tab==='bills'&&st.tabTxtOn]}>Bills & Income</Text></Pressable>
</View>
<View style={st.samsung}/>
</View>
);
}
const st=StyleSheet.create({
c:{flex:1,backgroundColor:'#fafaf8'},
statusSpacer:{height: Platform.OS==='android'? 40 : 50, backgroundColor:'#fafaf8'},
hero:{backgroundColor:'#111',borderRadius:28,padding:20},
heroTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
heroEyebrow:{color:'rgba(255,255,255,0.4)',fontSize:10,fontWeight:'700',letterSpacing:1},
heroPill:{backgroundColor:'rgba(255,255,255,0.1)',paddingHorizontal:10,paddingVertical:4,borderRadius:20},
heroPillT:{color:'white',fontSize:10,fontWeight:'700',letterSpacing:0.5},
heroAmount:{color:'white',fontSize:44,fontWeight:'800',marginTop:12,letterSpacing:-1},
heroLabel:{color:'rgba(255,255,255,0.4)',fontSize:11,fontWeight:'700',letterSpacing:2,marginTop:2},
heroBar:{height:4,backgroundColor:'rgba(255,255,255,0.1)',borderRadius:10,marginTop:16,overflow:'hidden'},
heroFill:{height:4,borderRadius:10},
heroStats:{flexDirection:'row',marginTop:16},
stat:{flex:1},
statLabel:{color:'rgba(255,255,255,0.3)',fontSize:9,fontWeight:'700',letterSpacing:1},
statVal:{color:'white',fontSize:14,fontWeight:'700',marginTop:2},
statDiv:{width:1,backgroundColor:'rgba(255,255,255,0.1)',marginHorizontal:12},
card:{backgroundColor:'white',borderRadius:24,padding:16,marginTop:16,shadowColor:'#000',shadowOpacity:0.04,shadowRadius:20,shadowOffset:{width:0,height:8},elevation:2},
monthRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
monthBtn:{width:32,height:32,borderRadius:16,backgroundColor:'#f5f5f3',justifyContent:'center',alignItems:'center'},
monthBtnT:{fontSize:16,fontWeight:'600'},
monthTitle:{fontSize:18,fontWeight:'700',letterSpacing:-0.3},
monthSub:{fontSize:9,fontWeight:'700',letterSpacing:1,color:'#aaa',marginTop:2},
weekLabels:{flexDirection:'row',marginTop:16,marginBottom:8},
weekLabel:{width:'14.28%',textAlign:'center',fontSize:10,fontWeight:'600',color:'#bbb',letterSpacing:1},
calGrid:{flexDirection:'row',flexWrap:'wrap'},
day:{width:'14.28%',aspectRatio:1,justifyContent:'center',alignItems:'center',borderRadius:14,marginBottom:2},
dayEmpty:{width:'14.28%',aspectRatio:1},
dayText:{fontSize:15,fontWeight:'500',color:'#111'},
dayPayday:{backgroundColor:'#c6ff00'},
dayTextPayday:{fontWeight:'800',color:'black'},
dayBill:{backgroundColor:'#fff9c4'},
daySelected:{borderWidth:1.5,borderColor:'#111'},
dayTextSelected:{fontWeight:'700'},
legend:{flexDirection:'row',gap:12,marginTop:14,justifyContent:'center'},
legendItem:{flexDirection:'row',alignItems:'center',gap:6},
legendDot:{width:8,height:8,borderRadius:4},
legendT:{fontSize:10,fontWeight:'600',color:'#999'},
addCard:{backgroundColor:'white',borderRadius:20,padding:14,marginTop:16,borderWidth:1,borderColor:'#c6ff00'},
addTitle:{fontSize:10,fontWeight:'700',letterSpacing:1,color:'#aaa',marginBottom:10},
addRow:{flexDirection:'row',gap:8},
addInput:{flex:1,backgroundColor:'#f9f9f7',borderRadius:12,height:44,paddingHorizontal:14,fontSize:14},
addInputSmall:{width:80,backgroundColor:'#f9f9f7',borderRadius:12,height:44,paddingHorizontal:12,fontSize:14,fontWeight:'600'},
addBtn:{width:44,height:44,borderRadius:22,backgroundColor:'#c6ff00',justifyContent:'center',alignItems:'center'},
addBtnT:{fontSize:20,fontWeight:'600'},
listSection:{marginTop:20},
sectionTitle:{fontSize:10,fontWeight:'700',letterSpacing:1,color:'#aaa',marginBottom:10},
spendRow:{flexDirection:'row',alignItems:'center',backgroundColor:'white',borderRadius:16,padding:12,marginBottom:8},
spendIcon:{width:32,height:32,borderRadius:16,backgroundColor:'#f5f5f3',justifyContent:'center',alignItems:'center'},
spendIconT:{fontSize:12,fontWeight:'700'},
spendName:{fontSize:14,fontWeight:'600'},
spendMeta:{fontSize:11,color:'#999',marginTop:2},
spendAmt:{fontSize:14,fontWeight:'700',marginLeft:8},
spendDel:{width:24,height:24,borderRadius:12,backgroundColor:'#fff0f0',justifyContent:'center',alignItems:'center',marginLeft:8},
spendDelT:{fontSize:10,color:'#ff8a8a'},
billRow:{flexDirection:'row',alignItems:'center',backgroundColor:'white',borderRadius:16,padding:12,marginBottom:8},
billBadge:{width:32,height:32,borderRadius:10,backgroundColor:'#111',justifyContent:'center',alignItems:'center'},
billBadgeT:{color:'white',fontWeight:'700',fontSize:12},
billName:{fontSize:14,fontWeight:'600',marginLeft:10},
billMeta:{fontSize:11,color:'#999',marginLeft:10,marginTop:2},
billAmt:{fontSize:14,fontWeight:'700',color:'#ff4d4d'},
editTitle:{fontSize:18,fontWeight:'800',letterSpacing:-0.3},
editSub:{fontSize:12,color:'#999',marginTop:4,marginBottom:12},
editCard:{backgroundColor:'white',borderRadius:20,padding:14,shadowColor:'#000',shadowOpacity:0.03,shadowRadius:10},
editInput:{backgroundColor:'#f9f9f7',borderRadius:12,height:44,paddingHorizontal:12,fontSize:14},
chip:{paddingHorizontal:14,height:36,borderRadius:18,backgroundColor:'#f5f5f3',justifyContent:'center',alignItems:'center'},
chipOn:{backgroundColor:'#111'},
chipT:{fontSize:12,fontWeight:'600',color:'#888'},
chipTOn:{color:'white'},
primaryBtn:{flex:1,height:44,borderRadius:12,backgroundColor:'#111',justifyContent:'center',alignItems:'center'},
primaryBtnT:{color:'white',fontWeight:'700'},
editRow:{flexDirection:'row',alignItems:'center',backgroundColor:'white',borderRadius:16,padding:12,marginTop:8},
editRowName:{fontSize:14,fontWeight:'600'},
editRowMeta:{fontSize:11,color:'#999',marginTop:2},
editDel:{width:32,height:32,borderRadius:16,backgroundColor:'#fff0f0',justifyContent:'center',alignItems:'center'},
editDelT:{color:'#ff8a8a',fontSize:12},
chipSmall:{paddingHorizontal:10,height:28,borderRadius:14,backgroundColor:'#f5f5f3',justifyContent:'center'},
chipSmallT:{fontSize:10,fontWeight:'600'},
tabBar:{flexDirection:'row',backgroundColor:'white',padding:8,borderRadius:20,marginHorizontal:12,marginBottom:8,borderWidth:1,borderColor:'#f0f0f0',gap:6},
tabBtn:{flex:1,paddingVertical:14,borderRadius:14,alignItems:'center',backgroundColor:'#f9f9f7'},
tabBtnOn:{backgroundColor:'#111'},
tabTxt:{fontWeight:'600',fontSize:13,color:'#999'},
tabTxtOn:{color:'white'},
samsung:{height:48,backgroundColor:'#fafaf8'}
});
