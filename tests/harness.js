// Smoke test: runs index.html's script against mock NHL API responses (no network needed).
// Usage: node tests/harness.js
const path = require("path");
const html = require("fs").readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const appJs = html.match(/<script>([\s\S]*)<\/script>/)[1];
const els={};const mk=()=>({innerHTML:"",value:"",addEventListener(){},setAttribute(){}});
global.document={querySelector:(s)=>els[s]??=mk(),querySelectorAll:()=>[],addEventListener(){}};
global.location={search:""};global.history={replaceState(){}};
global.setTimeout=()=>0;global.clearTimeout=()=>{};
const now=Date.now(),iso=(d)=>new Date(now+d*864e5).toISOString();
const team=(id,abbrev,score)=>({id,abbrev,score,commonName:{default:abbrev==="NJD"?"Devils":"Penguins"}});
const sched={games:[
 {id:1,gameType:2,season:20262027,startTimeUTC:iso(-5),gameState:"OFF",awayTeam:team(1,"NJD",5),homeTeam:team(12,"CAR",2),gameOutcome:{lastPeriodType:"REG"}},
 {id:2,gameType:2,season:20262027,startTimeUTC:iso(-3),gameState:"OFF",awayTeam:team(5,"PIT",1),homeTeam:team(1,"NJD",2),gameOutcome:{lastPeriodType:"SO"}},
 {id:3,gameType:2,season:20262027,startTimeUTC:iso(0),gameState:"LIVE",awayTeam:team(5,"PIT",1),homeTeam:team(1,"NJD",2)},
 {id:4,gameType:2,season:20262027,startTimeUTC:iso(4),gameState:"FUT",awayTeam:team(1,"NJD"),homeTeam:team(5,"PIT")}]};
const roster=[[1,100,"Jack","Hughes",86,"C"],[1,101,"Nico","Hischier",13,"C"],[1,102,"Jacob","Markstrom",25,"G"],[5,500,"Sid","Crosby",87,"C"],[5,501,"Evgeni","Malkin",71,"C"],[5,502,"Tristan","Jarry",35,"G"]].map(([t,id,f,l,n,pos])=>({teamId:t,playerId:id,firstName:{default:f},lastName:{default:l},sweaterNumber:n,positionCode:pos}));
const pd=(n)=>({number:n,periodType:"REG"});
const plays=[
 {sortOrder:1,typeDescKey:"faceoff",periodDescriptor:pd(1),timeInPeriod:"00:00",details:{winningPlayerId:100,losingPlayerId:500,eventOwnerTeamId:1,zoneCode:"N"}},
 {sortOrder:2,typeDescKey:"stoppage",periodDescriptor:pd(1),timeInPeriod:"00:41",details:{reason:"icing"}},
 {sortOrder:3,typeDescKey:"shot-on-goal",periodDescriptor:pd(1),timeInPeriod:"01:12",details:{shootingPlayerId:501,goalieInNetId:102,eventOwnerTeamId:5,shotType:"wrist"}},
 {sortOrder:4,typeDescKey:"hit",periodDescriptor:pd(1),timeInPeriod:"02:00",details:{hittingPlayerId:101,hitteePlayerId:500,eventOwnerTeamId:1}},
 {sortOrder:5,typeDescKey:"goal",periodDescriptor:pd(1),timeInPeriod:"05:30",details:{scoringPlayerId:100,assist1PlayerId:101,goalieInNetId:502,eventOwnerTeamId:1}},
 {sortOrder:6,typeDescKey:"penalty",periodDescriptor:pd(1),timeInPeriod:"09:00",details:{committedByPlayerId:500,drawnByPlayerId:100,descKey:"hooking",duration:2,eventOwnerTeamId:5}},
 {sortOrder:7,typeDescKey:"blocked-shot",periodDescriptor:pd(2),timeInPeriod:"03:00",details:{shootingPlayerId:100,blockingPlayerId:501,eventOwnerTeamId:5}},
 {sortOrder:8,typeDescKey:"penalty",periodDescriptor:pd(2),timeInPeriod:"04:00",details:{servedByPlayerId:101,descKey:"too-many-men-on-the-ice",duration:2,eventOwnerTeamId:1}}];
const pbp={gameState:"LIVE",awayTeam:team(5,"PIT",0),homeTeam:team(1,"NJD",1),rosterSpots:roster,plays,periodDescriptor:pd(2),clock:{timeRemaining:"16:00",inIntermission:false}};
const st=(a,div)=>({teamAbbrev:{default:a},teamCommonName:{default:a},divisionSequence:div,conferenceSequence:div+3,gamesPlayed:10,wins:6,losses:3,otLosses:1,points:13,pointPctg:0.65,regulationWins:5,regulationPlusOtWins:6,goalFor:30,goalAgainst:25,goalDifferential:5,homeWins:3,homeLosses:1,homeOtLosses:1,roadWins:3,roadLosses:2,roadOtLosses:0,shootoutWins:1,shootoutLosses:0,l10Wins:6,l10Losses:3,l10OtLosses:1,streakCode:"W",streakCount:2});
const club={skaters:[{firstName:{default:"Jack"},lastName:{default:"Hughes"},gamesPlayed:10,goals:6,assists:8,points:14,shots:40,plusMinus:4,penaltyMinutes:2,powerPlayGoals:2,shorthandedGoals:0,avgTimeOnIcePerGame:1230.5},{firstName:{default:"Nico"},lastName:{default:"Hischier"},gamesPlayed:10,goals:5,assists:4,points:9,shots:30,plusMinus:6,penaltyMinutes:6,powerPlayGoals:1,shorthandedGoals:1,avgTimeOnIcePerGame:1150}],goalies:[{firstName:{default:"Jacob"},lastName:{default:"Markstrom"},gamesPlayed:8,wins:5,losses:2,overtimeLosses:1,shutouts:1,goalsAgainstAverage:2.4567,savePercentage:0.9123}]};
const box={homeTeam:{abbrev:"CAR",sog:28},awayTeam:{abbrev:"NJD",sog:34},playerByGameStats:{awayTeam:{forwards:[{name:{default:"J. Hughes"},goals:3,assists:0,points:3,plusMinus:2,hits:1,blockedShots:0,pim:0,powerPlayGoals:1,faceoffWinningPctg:0.55,shifts:24,takeaways:1,giveaways:0,sog:6,toi:"21:05",position:"C",sweaterNumber:86},{name:{default:"N. Hischier"},goals:0,assists:2,points:2,plusMinus:-1,sog:2,toi:"19:40",position:"C",sweaterNumber:13}],defense:[],goalies:[{name:{default:"J. Markstrom"},saveShotsAgainst:"26/28",saves:26,shotsAgainst:28,goalsAgainst:2,savePctg:0.928571,toi:"60:00",decision:"W"}]},homeTeam:{forwards:[],defense:[],goalies:[]}}};
global.fetch=async(url)=>{const p=decodeURIComponent(url.split("path=")[1]);let d;
 if(p.startsWith("v1/club-schedule-season"))d=sched;else if(p.includes("play-by-play"))d=pbp;else if(p==="v1/standings/now")d={standings:[st("NJD",2),st("PIT",5),st("NYR",1)]};
 else if(p.startsWith("v1/club-stats/NJD/20262027"))d=club;else if(p.startsWith("v1/club-stats/PIT/20262027"))d={skaters:[]};else if(p.startsWith("v1/club-stats/PIT"))d=club;
 else if(p.includes("boxscore"))d=box;
 else if(p.startsWith("v1/player/")){const id=Number(p.split("/")[2]),r=roster.find(x=>x.playerId===id);d={firstName:r.firstName,lastName:r.lastName,birthDate:"2001-05-14",birthCity:{default:"Orlando"},birthStateProvince:{default:"Florida"},birthCountry:"USA",heightInInches:71,weightInPounds:175,shootsCatches:"L",...(id===100?{draftDetails:{year:2019,teamAbbrev:"NJD",round:1,pickInRound:1,overallPick:1}}:{})};}
 else if(p==="records/franchise")d={data:[{id:23,teamAbbrev:"NJD",lastSeasonId:null},{id:17,teamAbbrev:"PIT",lastSeasonId:null}]};
 else if(p.startsWith("records/")){const[,kind,fid,stat]=p.split("/");d={data:[{lastName:fid==="23"?(kind==="goalies"?"Brodeur":"Elias"):(kind==="goalies"?"Fleury":"Crosby"),[stat]:fid==="23"?408:1761,...(kind==="season"?{seasonId:19881989}:{})}]};}else return{ok:false,status:404};return{ok:true,json:async()=>d};};
const strip=h=>h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
eval(appJs+`
(async()=>{await new Promise(r=>setImmediate(r));for(let i=0;i<20;i++)await new Promise(r=>setImmediate(r));
console.log("PICK:",S.game.id,"| SELECT:",strip(els['#gamepick'].innerHTML));
console.log("SCORE:",strip(els['#scoreboard'].innerHTML));
console.log("LIVE:",strip(els['#view'].innerHTML));
S.view='matchup';render();console.log("MATCHUP:",strip(els['#view'].innerHTML));
S.period='all';S.view='live';render();console.log("ALLTAB OK:",els['#view'].innerHTML.includes('Game totals'));
S.view='box';render();console.log("BOX THIS:",strip(els['#view'].innerHTML));
S.boxPeriod=2;render();console.log("BOX P2:",strip(els['#view'].innerHTML).slice(0,400));
S.boxGame='last';S.sorts.lastSk={k:"toi",dir:"asc"};render();console.log("BOX LAST:",strip(els['#view'].innerHTML));
S.view='misc';render();for(let i=0;i<20;i++)await new Promise(r=>setImmediate(r));console.log("MISC:",strip(els['#view'].innerHTML));
S.teamFilter='them';render();console.log("MISC THEM:",strip(els['#view'].innerHTML).slice(0,300));
})();`);
